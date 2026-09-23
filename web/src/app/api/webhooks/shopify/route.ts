import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { env } from "@/lib/env";
import { verifyShopifyHmac } from "@/lib/crypto";
import { CACHE_TAGS, admin, gql } from "@/lib/shopify/client";
import { BLEND_PROP, type BlendRecipe } from "@/lib/checkout";
import { greenUsageG, shopSize } from "@/lib/domain/coffee";
import { moveGreenForOrder } from "@/lib/green-admin";
import { getSettings } from "@/lib/settings";

const TAGS_ADD = gql`
  mutation WebhookTagsAdd($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) { userErrors { field message } }
  }
`;
const ORDER_TAGS = gql`
  query WebhookOrderTags($id: ID!) { order(id: $id) { id tags } }
`;

type OrderHook = {
  admin_graphql_api_id: string;
  tags: string;
  line_items: { quantity: number; title: string; properties: { name: string; value: string }[] }[];
};

const tagsOf = (o: OrderHook) => o.tags.split(",").map((t) => t.trim()).filter(Boolean);

/** Green grams per lot used by the order's custom blends (wholesale lines are priced per lb). */
function blendUsage(o: OrderHook) {
  const wholesale = tagsOf(o).includes("channel:wholesale");
  const usage = new Map<string, number>();
  for (const li of o.line_items) {
    const raw = li.properties?.find((p) => p.name === BLEND_PROP)?.value;
    if (!raw) continue;
    let r: BlendRecipe; try { r = JSON.parse(raw); } catch { continue; }
    greenUsageG(r.sel, wholesale ? li.quantity : shopSize(r.sizeId).lb * li.quantity, usage);
  }
  return usage;
}
/** Tags as they are now (the payload can be stale on a retried delivery). */
const liveTags = async (id: string) => (await admin<{ order: { tags: string[] } | null }>(ORDER_TAGS, { variables: { id } })).order?.tags ?? [];

// Order placed → take the green its blends need out of Shopify inventory.
async function onOrderCreated(o: OrderHook) {
  if (!tagsOf(o).includes("blended")) return;
  const usage = blendUsage(o);
  if (!usage.size || !(await getSettings()).drawDownGreen) return;
  if ((await liveTags(o.admin_graphql_api_id)).includes("green:deducted")) return;
  await moveGreenForOrder(o.admin_graphql_api_id, usage, -1);
  await admin(TAGS_ADD, { variables: { id: o.admin_graphql_api_id, tags: ["green:deducted"] } });
  revalidateTag(CACHE_TAGS.catalog, "max");
}

// Order cancelled → put that green back.
async function onOrderCancelled(o: OrderHook) {
  const tags = await liveTags(o.admin_graphql_api_id);
  if (!tags.includes("green:deducted") || tags.includes("green:restocked")) return;
  await moveGreenForOrder(o.admin_graphql_api_id, blendUsage(o), 1);
  await admin(TAGS_ADD, { variables: { id: o.admin_graphql_api_id, tags: ["green:restocked"] } });
  revalidateTag(CACHE_TAGS.catalog, "max");
}

// Paid → custom blends wait for a QC cupping.
async function onOrderPaid(o: OrderHook) {
  const tags = tagsOf(o);
  if (!tags.includes("blended") || tags.includes("qc-hold") || !blendUsage(o).size) return;
  if ((await getSettings()).qcHoldNewBlends) await admin(TAGS_ADD, { variables: { id: o.admin_graphql_api_id, tags: ["qc-hold"] } });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  if (!env.webhookSecret || !(await verifyShopifyHmac(body, req.headers.get("x-shopify-hmac-sha256"), env.webhookSecret)))
    return new NextResponse("Unauthorized", { status: 401 });

  const topic = req.headers.get("x-shopify-topic") || "";
  try {
    switch (topic) {
      case "orders/create": await onOrderCreated(JSON.parse(body)); break;
      case "orders/cancelled": await onOrderCancelled(JSON.parse(body)); break;
      case "orders/paid": await onOrderPaid(JSON.parse(body)); break;
      case "products/update": case "products/create": case "products/delete": case "inventory_levels/update":
      case "metaobjects/create": case "metaobjects/update": case "metaobjects/delete":
        revalidateTag(CACHE_TAGS.catalog, "max"); break;
      default: break; // orders/fulfilled, draft_orders/update: the board reads live
    }
  } catch (e) {
    console.error(`[webhook ${topic}]`, e);
    return new NextResponse("Retry", { status: 500 }); // Shopify retries non-2xx
  }
  return new NextResponse(null, { status: 200 });
}
