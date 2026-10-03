import { NextResponse, after, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { env } from "@/lib/env";
import { verifyShopifyHmac } from "@/lib/crypto";
import { CACHE_TAGS, admin, gql } from "@/lib/shopify/client";
import { BLEND_PROP } from "@/lib/checkout";
import { deductOrder, restockOrder } from "@/lib/green-ledger";
import { syncQuietly } from "@/lib/green-sync";
import { getSettings } from "@/lib/settings";

const TAGS_ADD = gql`
  mutation WebhookTagsAdd($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) { userErrors { field message } }
  }
`;
type OrderHook = {
  admin_graphql_api_id: string;
  tags: string;
  line_items: { quantity: number; properties: { name: string; value: string }[] }[];
};

const tagsOf = (o: OrderHook) => o.tags.split(",").map((t) => t.trim()).filter(Boolean);
const hasBlend = (o: OrderHook) => o.line_items.some((li) => li.properties?.some((p) => p.name === BLEND_PROP));

// Order placed, on any channel → take the green its coffees need out of Shopify inventory
// (custom blends and our coffees alike; everything is roasted to order). deductOrder reads
// the order fresh and tags it, so a retried delivery can't deduct twice.
async function onOrderCreated(o: OrderHook) {
  await deductOrder(o.admin_graphql_api_id);
}

// Order cancelled → put back what it took (unless it was already shipped).
async function onOrderCancelled(o: OrderHook) {
  await restockOrder(o.admin_graphql_api_id);
}

// Paid → custom blends wait for a QC cupping.
async function onOrderPaid(o: OrderHook) {
  const tags = tagsOf(o);
  if (!tags.includes("blended") || tags.includes("qc-hold") || !hasBlend(o)) return;
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
        // green moved or a recipe changed: refresh the shop, and Shopify's coffee counts after replying
        revalidateTag(CACHE_TAGS.catalog, "max");
        after(() => syncQuietly(topic));
        break;
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
