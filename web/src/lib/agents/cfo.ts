import "server-only";
// CFO daily snapshot: yesterday's numbers in plain code, no model. Orders come
// from Shopify (all channels), green cost from what each order took out of green
// inventory (blended.green_usage, or worked out the same way when it was never
// deducted), cash from Mercury's read-only API.
import { G_PER_LB, round2 } from "@/lib/domain/coffee";
import { env } from "@/lib/env";
import { fetchStockCoffees, getInventoryLots } from "@/lib/catalog";
import { linesOf, usageOf, type GreenRecord } from "@/lib/green-ledger";
import { admin, gql } from "@/lib/shopify/client";
import { getSettings } from "@/lib/settings";
import { db, type RunResult } from "@/lib/agents/runs";

const TZ = "America/Chicago";

const ORDERS = gql`
  query CfoOrders($query: String!, $after: String) {
    orders(first: 100, after: $after, sortKey: CREATED_AT, query: $query) {
      nodes {
        id name tags cancelledAt displayFulfillmentStatus
        totalPriceSet { shopMoney { amount } }
        subtotalPriceSet { shopMoney { amount } }
        customer { numberOfOrders }
        usage: metafield(namespace: "blended", key: "green_usage") { value }
        lineItems(first: 100) { nodes { quantity sku variant { id } customAttributes { key value } } }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;
type Money = { shopMoney: { amount: string } };
type OrderNode = {
  id: string; name: string; tags: string[]; cancelledAt: string | null; displayFulfillmentStatus: string;
  totalPriceSet: Money; subtotalPriceSet: Money | null;
  customer: { numberOfOrders: string } | null;
  usage: { value: string } | null;
  lineItems: { nodes: { quantity: number; sku: string | null; variant: { id: string } | null; customAttributes: { key: string; value: string | null }[] }[] };
};

/** "2026-10-27" for the Chicago calendar day `daysAgo` before now. */
export function chicagoDate(daysAgo = 1, now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(now.getTime() - daysAgo * 864e5));
}
/** Chicago's UTC offset on a given day, "-05:00" or "-06:00". */
const offsetOn = (date: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "longOffset" })
    .formatToParts(new Date(`${date}T12:00:00Z`)).find((p) => p.type === "timeZoneName")?.value.replace("GMT", "") || "-06:00";
const nextDay = (date: string) => new Date(Date.parse(`${date}T12:00:00Z`) + 864e5).toISOString().slice(0, 10);

async function ordersOn(date: string) {
  const end = nextDay(date);
  const query = `created_at:>='${date}T00:00:00${offsetOn(date)}' created_at:<'${end}T00:00:00${offsetOn(end)}'`;
  const out: OrderNode[] = [];
  let after: string | null = null, pages = 0;
  do {
    type R = { orders: { nodes: OrderNode[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } };
    const r: R = await admin<R>(ORDERS, { variables: { query, after } });
    out.push(...r.orders.nodes);
    after = r.orders.pageInfo.hasNextPage ? r.orders.pageInfo.endCursor : null;
  } while (after && ++pages < 20);
  return out.filter((o) => !o.cancelledAt);
}

/** Available balance across open Mercury accounts; null when no token is set. */
export async function mercuryCash(): Promise<number | null> {
  if (!env.mercuryToken) return null;
  const res = await fetch("https://api.mercury.com/api/v1/accounts", { headers: { Authorization: `Bearer ${env.mercuryToken}`, Accept: "application/json" }, cache: "no-store" });
  if (!res.ok) throw new Error(`Mercury ${res.status}`);
  const j = await res.json() as { accounts: { availableBalance: number; status: string }[] };
  return round2(j.accounts.filter((a) => a.status !== "archived").reduce((s, a) => s + Number(a.availableBalance || 0), 0));
}

export async function snapshot(date = chicagoDate(1)) {
  const [orders, stock, lots, settings] = await Promise.all([ordersOn(date), fetchStockCoffees(), getInventoryLots(), getSettings()]);
  const ctx = { stock, lots, loss: settings.roastLoss };
  const costPerG = new Map(lots.map((l) => [l.id, l.price / G_PER_LB]));
  const failed: string[] = [];
  let cash: number | null = null;
  try { cash = await mercuryCash(); } catch (e) { failed.push(`mercury: ${e instanceof Error ? e.message : e}`); }

  let revenue = 0, goods = 0, greenCost = 0, repeat = 0;
  const unpriced = new Set<string>(), unlinked = new Set<string>();
  const byChannel: Record<string, { orders: number; revenue: number }> = {};
  for (const o of orders) {
    const total = Number(o.totalPriceSet.shopMoney.amount);
    revenue += total;
    goods += Number(o.subtotalPriceSet?.shopMoney.amount ?? total);
    // numberOfOrders is the customer's count today, so a customer who ordered again since counts as repeat
    if (Number(o.customer?.numberOfOrders ?? 0) > 1) repeat++;
    const ch = o.tags.includes("channel:wholesale") ? "wholesale" : o.tags.includes("channel:retail") ? "retail" : "other";
    byChannel[ch] ??= { orders: 0, revenue: 0 };
    byChannel[ch].orders++; byChannel[ch].revenue = round2(byChannel[ch].revenue + total);

    let rec: GreenRecord | null = null;
    try { rec = o.usage?.value ? JSON.parse(o.usage.value) : null; } catch { rec = null; }
    const worked = rec?.lots?.length ? null : usageOf(linesOf(o), o.tags, ctx);
    (rec?.unlinked ?? worked?.unlinked ?? []).forEach((n) => unlinked.add(n));
    for (const u of rec?.lots?.length ? rec.lots : worked?.lots ?? []) {
      const c = costPerG.get(u.id);
      if (c == null) unpriced.add(u.name); else greenCost += u.g * c;
    }
  }
  const row = {
    date,
    revenue: round2(revenue),
    goods: round2(goods),
    orders: orders.length,
    aov: orders.length ? round2(revenue / orders.length) : null,
    repeat_rate: orders.length ? Number((repeat / orders.length).toFixed(4)) : null,
    green_cost: round2(greenCost),
    green_margin: goods > 0 ? Number(((goods - greenCost) / goods).toFixed(4)) : null,
    cash_usd: cash,
    detail: { byChannel, unpricedLots: [...unpriced], unlinkedLines: [...unlinked], failed },
  };
  const { error } = await db().from("kpi_snapshots").upsert(row);
  if (error) throw new Error(`Could not save snapshot: ${error.message}`);
  return row;
}

export async function runCfoSnapshot(): Promise<RunResult> {
  const s = await snapshot();
  const margin = s.green_margin == null ? "n/a" : `${Math.round(s.green_margin * 100)}%`;
  return { status: "ok", summary: `${s.date}: ${s.orders} orders, $${s.revenue.toFixed(2)} revenue, green margin ${margin}${s.cash_usd == null ? "" : `, cash $${s.cash_usd.toFixed(0)}`}` };
}
