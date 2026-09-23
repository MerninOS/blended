import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { env } from "@/lib/env";
import { verifyShopifyHmac } from "@/lib/crypto";
import { CACHE_TAGS, admin, gql } from "@/lib/shopify/client";
import { BLEND_PROP, type BlendRecipe } from "@/lib/checkout";
import { ROAST_LOSS, shopSize } from "@/lib/domain/coffee";
import { drawDownGreen } from "@/lib/green-admin";
import { getSettings } from "@/lib/settings";

const TAGS_ADD = gql`
  mutation WebhookTagsAdd($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) { userErrors { field message } }
  }
`;

type PaidOrder = {
  admin_graphql_api_id: string;
  tags: string;
  line_items: { quantity: number; title: string; properties: { name: string; value: string }[] }[];
};

async function onOrderPaid(o: PaidOrder) {
  const tags = o.tags.split(",").map((t) => t.trim());
  if (!tags.includes("blended") || tags.includes("green:deducted")) return;
  const wholesale = tags.includes("channel:wholesale");
  const usage = new Map<string, number>();
  let hasBlend = false;
  for (const li of o.line_items) {
    const raw = li.properties?.find((p) => p.name === BLEND_PROP)?.value;
    if (!raw) continue;
    let r: BlendRecipe; try { r = JSON.parse(raw); } catch { continue; }
    hasBlend = true;
    const roastedLb = wholesale ? li.quantity : shopSize(r.sizeId).lb * li.quantity;
    for (const s of r.sel) usage.set(s.id, (usage.get(s.id) ?? 0) + roastedLb * s.pct / 100 / ROAST_LOSS);
  }
  const settings = await getSettings();
  const add: string[] = [];
  if (hasBlend && settings.drawDownGreen) { await drawDownGreen(usage); add.push("green:deducted"); }
  if (hasBlend && settings.qcHoldNewBlends) add.push("qc-hold");
  if (add.length) await admin(TAGS_ADD, { variables: { id: o.admin_graphql_api_id, tags: add } });
  if (usage.size) revalidateTag(CACHE_TAGS.catalog, "max");
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  if (!env.webhookSecret || !(await verifyShopifyHmac(body, req.headers.get("x-shopify-hmac-sha256"), env.webhookSecret)))
    return new NextResponse("Unauthorized", { status: 401 });

  const topic = req.headers.get("x-shopify-topic") || "";
  try {
    switch (topic) {
      case "orders/paid": await onOrderPaid(JSON.parse(body)); break;
      case "products/update": case "products/create": case "products/delete":
      case "metaobjects/create": case "metaobjects/update": case "metaobjects/delete":
        revalidateTag(CACHE_TAGS.catalog, "max"); break;
      default: break; // orders/create, orders/fulfilled, draft_orders/update: the board reads live
    }
  } catch (e) {
    console.error(`[webhook ${topic}]`, e);
    return new NextResponse("Retry", { status: 500 }); // Shopify retries non-2xx
  }
  return new NextResponse(null, { status: 200 });
}
