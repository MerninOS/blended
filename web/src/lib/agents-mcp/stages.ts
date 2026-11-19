import "server-only";
// The roasting board's open orders for the coffee server (app/api/agents-mcp): tags and
// fulfillment status only. No customer, address or money fields are asked for.
import { isDemo } from "@/lib/env";
import { demoStore } from "@/lib/demo-store";
import { admin, gql } from "@/lib/shopify/client";
import type { StageOrder } from "./rules";

const STAGES = gql`
  query AgentStageOrders($query: String!, $after: String) {
    orders(first: 100, after: $after, sortKey: CREATED_AT, reverse: true, query: $query) {
      nodes { tags cancelledAt displayFulfillmentStatus }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

/** Storefront orders (both channels) from the last 90 days, up to 1,000. */
export async function stageOrders(): Promise<StageOrder[]> {
  if (isDemo()) return demoStore.orders().map((o) => ({ tags: [...(o.status === "shipped" ? [] : o.status === "paid" ? [] : [`stage:${o.status}`]), ...(o.qcHold ? ["qc-hold"] : [])], cancelledAt: null, displayFulfillmentStatus: o.status === "shipped" ? "FULFILLED" : "UNFULFILLED" }));
  const since = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
  type R = { orders: { nodes: StageOrder[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } };
  const out: StageOrder[] = [];
  let after: string | null = null, pages = 0;
  do {
    const r: R = await admin<R>(STAGES, { variables: { query: `tag:blended created_at:>=${since}`, after } });
    out.push(...r.orders.nodes);
    after = r.orders.pageInfo.hasNextPage ? r.orders.pageInfo.endCursor : null;
  } while (after && ++pages < 10);
  return out;
}
