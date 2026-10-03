import "server-only";
// The green ledger: what each order took out of green inventory. Every coffee
// sold, from any channel, is roasted to order, so an order's coffee lines turn
// into green grams (lib/domain/green.ts) and are deducted once. What was
// deducted is written onto the order (metafield blended.green_usage) so a
// cancellation puts back exactly that, and the admin can audit and catch up
// orders that were never deducted.
import { revalidateTag } from "next/cache";
import { after } from "next/server";
import { BLEND_PROP } from "@/lib/checkout";
import { orderGreenUsage, type GreenLine, type RoastLoss } from "@/lib/domain/green";
import type { GreenLot, StockCoffee } from "@/lib/domain/types";
import { fetchStockCoffees, getInventoryLots } from "@/lib/catalog";
import { CACHE_TAGS, admin, assertNoUserErrors, gql } from "@/lib/shopify/client";
import { moveGreenForOrder } from "@/lib/green-admin";
import { getSettings } from "@/lib/settings";
import { syncQuietly } from "@/lib/green-sync";

export const TAG_DEDUCTED = "green:deducted", TAG_RESTOCKED = "green:restocked";

/** What an order took, as stored on it. */
export interface GreenRecord { v: 1; at: string; lots: { id: string; name: string; g: number }[]; unlinked: string[] }

const ORDER = gql`
  query GreenOrder($id: ID!) {
    order(id: $id) {
      id name tags cancelledAt displayFulfillmentStatus
      usage: metafield(namespace: "blended", key: "green_usage") { value }
      lineItems(first: 100) { nodes { quantity sku variant { id } customAttributes { key value } } }
    }
  }
`;
type OrderNode = {
  id: string; name: string; tags: string[]; cancelledAt: string | null; displayFulfillmentStatus: string;
  usage: { value: string } | null;
  lineItems: { nodes: { quantity: number; sku: string | null; variant: { id: string } | null; customAttributes: { key: string; value: string | null }[] }[] };
};
const SAVE = gql`
  mutation GreenRecord($metafields: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $metafields) { userErrors { field message } } }
`;
const TAGS_ADD = gql`
  mutation GreenTags($id: ID!, $tags: [String!]!) { tagsAdd(id: $id, tags: $tags) { userErrors { field message } } }
`;

export const linesOf = (o: OrderNode): GreenLine[] => o.lineItems.nodes.map((li) => ({
  quantity: li.quantity, sku: li.sku, variantGid: li.variant?.id ?? null,
  props: li.customAttributes.map((a) => ({ name: a.key, value: a.value ?? "" })),
}));
const isWholesale = (tags: string[]) => tags.includes("channel:wholesale");

interface Ctx { stock: StockCoffee[]; lots: GreenLot[]; loss: RoastLoss }
const context = async (): Promise<Ctx> => {
  const [stock, lots, s] = await Promise.all([fetchStockCoffees(), getInventoryLots(), getSettings()]);
  return { stock, lots, loss: s.roastLoss };
};

/** Green an order needs, per lot, with names for the record. */
export function usageOf(lines: GreenLine[], tags: string[], ctx: Ctx) {
  const { usage, unlinked } = orderGreenUsage(lines, { wholesale: isWholesale(tags), blendProp: BLEND_PROP }, ctx.stock, ctx.lots, ctx.loss);
  const names = new Map(ctx.lots.map((l) => [l.id, l.name]));
  return { usage, unlinked, lots: [...usage].map(([id, g]) => ({ id, name: names.get(id) ?? id, g: Math.round(g) })) };
}

const loadOrder = async (gid: string) => (await admin<{ order: OrderNode | null }>(ORDER, { variables: { id: gid } })).order;
// Shopify's coffee counts follow after the response (a webhook must answer within seconds).
const refresh = (why: string) => { revalidateTag(CACHE_TAGS.catalog, "max"); after(() => syncQuietly(why)); };

/**
 * Take an order's green out of inventory, once. Reads the order fresh from Shopify
 * (tags, lines), so a retried webhook or a second click can't deduct twice.
 */
export async function deductOrder(gid: string, opts: { force?: boolean } = {}) {
  if (!opts.force && !(await getSettings()).drawDownGreen) return { done: false, reason: "Green draw-down is off in Settings." };
  const o = await loadOrder(gid);
  if (!o) return { done: false, reason: "Order not found." };
  if (o.tags.includes(TAG_DEDUCTED)) return { done: false, reason: "Already deducted." };
  if (o.cancelledAt) return { done: false, reason: "Order is cancelled." };
  const u = usageOf(linesOf(o), o.tags, await context());
  if (!u.usage.size) return { done: false, reason: u.unlinked.length ? `Not linked to green: ${u.unlinked.join(", ")}` : "No coffee in this order." };
  await moveGreenForOrder(o.id, u.usage, -1);
  const rec: GreenRecord = { v: 1, at: new Date().toISOString(), lots: u.lots, unlinked: u.unlinked };
  assertNoUserErrors((await admin<{ metafieldsSet: { userErrors: { message: string }[] } }>(SAVE, {
    variables: { metafields: [{ ownerId: o.id, namespace: "blended", key: "green_usage", type: "json", value: JSON.stringify(rec) }] },
  })).metafieldsSet, "Record green");
  assertNoUserErrors((await admin<{ tagsAdd: { userErrors: { message: string }[] } }>(TAGS_ADD, { variables: { id: o.id, tags: [TAG_DEDUCTED] } })).tagsAdd, "Tag order");
  refresh("deduct");
  return { done: true, record: rec };
}

/** Put back what a cancelled order took — exactly what was recorded — unless it was already roasted and shipped. */
export async function restockOrder(gid: string) {
  const o = await loadOrder(gid);
  if (!o || !o.tags.includes(TAG_DEDUCTED) || o.tags.includes(TAG_RESTOCKED)) return false;
  if (/^(FULFILLED|PARTIALLY_FULFILLED)$/.test(o.displayFulfillmentStatus)) return false; // roasted and sent: that green is gone
  let rec: GreenRecord | null = null;
  try { rec = o.usage?.value ? JSON.parse(o.usage.value) : null; } catch { rec = null; }
  const usage = rec?.lots?.length ? new Map(rec.lots.map((l) => [l.id, l.g])) : usageOf(linesOf(o), o.tags, await context()).usage; // orders from before the record
  if (usage.size) await moveGreenForOrder(o.id, usage, 1);
  await admin(TAGS_ADD, { variables: { id: o.id, tags: [TAG_RESTOCKED] } });
  refresh("restock");
  return true;
}

// ---------- audit ----------
const RECENT = gql`
  query GreenRecentOrders($query: String!) {
    orders(first: 100, sortKey: CREATED_AT, reverse: true, query: $query) {
      nodes {
        id name createdAt tags cancelledAt displayFulfillmentStatus
        usage: metafield(namespace: "blended", key: "green_usage") { value }
        lineItems(first: 100) { nodes { quantity sku variant { id } customAttributes { key value } } }
      }
    }
  }
`;
export interface LedgerRow {
  id: string; name: string; createdAt: string; channel: "Retail" | "Wholesale" | "Other";
  state: "deducted" | "restocked" | "missing" | "unlinked";
  lots: { id: string; name: string; g: number }[];
  unlinked: string[];
}

/** Recent orders with coffee: what each took, and any that never had green deducted. */
export async function greenLedger(days = 30): Promise<LedgerRow[]> {
  const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  const [r, ctx] = await Promise.all([
    admin<{ orders: { nodes: (OrderNode & { createdAt: string })[] } }>(RECENT, { variables: { query: `created_at:>=${since}` } }),
    context(),
  ]);
  const rows: LedgerRow[] = [];
  for (const o of r.orders.nodes) {
    const channel = isWholesale(o.tags) ? "Wholesale" : o.tags.includes("channel:retail") ? "Retail" : "Other";
    let rec: GreenRecord | null = null;
    try { rec = o.usage?.value ? JSON.parse(o.usage.value) : null; } catch { rec = null; }
    if (o.tags.includes(TAG_DEDUCTED)) {
      const lots = rec?.lots ?? usageOf(linesOf(o), o.tags, ctx).lots;
      rows.push({ id: o.id, name: o.name, createdAt: o.createdAt, channel, state: o.tags.includes(TAG_RESTOCKED) ? "restocked" : "deducted", lots, unlinked: rec?.unlinked ?? [] });
      continue;
    }
    if (o.cancelledAt) continue;
    const u = usageOf(linesOf(o), o.tags, ctx);
    if (u.usage.size) rows.push({ id: o.id, name: o.name, createdAt: o.createdAt, channel, state: "missing", lots: u.lots, unlinked: u.unlinked });
    else if (u.unlinked.length) rows.push({ id: o.id, name: o.name, createdAt: o.createdAt, channel, state: "unlinked", lots: [], unlinked: u.unlinked });
  }
  return rows;
}
