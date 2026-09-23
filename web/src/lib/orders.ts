import "server-only";
// Orders board data: Shopify orders tagged by the storefront, normalized into
// AdminOrder. Stage lives on the order as a tag (stage:roasting / stage:packing);
// "shipped" is a real Shopify fulfillment with tracking.
import type { AdminOrder, BlendComponent, OrderItem, Stage } from "@/lib/domain/orders";
import { shopSize } from "@/lib/domain/coffee";
import { env, isDemo } from "@/lib/env";
import { admin, assertNoUserErrors, gql } from "@/lib/shopify/client";
import { sizeFromOption } from "@/lib/shopify/mapping";
import { BLEND_PROP, type BlendRecipe } from "@/lib/checkout";
import { demoStore } from "@/lib/demo-store";
import { getSettings } from "@/lib/settings";

const ORDERS = gql`
  query BoardOrders($query: String!, $after: String) {
    orders(first: 50, after: $after, sortKey: CREATED_AT, reverse: true, query: $query) {
      nodes {
        id
        name
        createdAt
        tags
        note
        cancelledAt
        displayFulfillmentStatus
        email
        customer { displayName }
        shippingAddress { name company address1 address2 city provinceCode zip }
        shippingLine { title }
        customAttributes { key value }
        totalDiscountsSet { shopMoney { amount } }
        totalShippingPriceSet { shopMoney { amount } }
        totalPriceSet { shopMoney { amount } }
        fulfillments(first: 5) { trackingInfo { number } }
        lineItems(first: 50) {
          nodes {
            title
            quantity
            originalUnitPriceSet { shopMoney { amount } }
            customAttributes { key value }
            sellingPlan { name }
            variant { selectedOptions { name value } }
            product { roast: metafield(namespace: "blended", key: "roast_level") { value } }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

type Attr = { key: string; value: string | null };
type Money = { shopMoney: { amount: string } };
type RawOrder = {
  id: string; name: string; createdAt: string; tags: string[]; note: string | null; cancelledAt: string | null;
  displayFulfillmentStatus: string; email: string | null; customer: { displayName: string } | null;
  shippingAddress: { name: string | null; company: string | null; address1: string | null; address2: string | null; city: string | null; provinceCode: string | null; zip: string | null } | null;
  shippingLine: { title: string } | null; customAttributes: Attr[];
  totalDiscountsSet: Money; totalShippingPriceSet: Money; totalPriceSet: Money;
  fulfillments: { trackingInfo: { number: string | null }[] }[];
  lineItems: { nodes: { title: string; quantity: number; originalUnitPriceSet: Money; customAttributes: Attr[]; sellingPlan: { name: string } | null;
    variant: { selectedOptions: { name: string; value: string }[] } | null; product: { roast: { value: string } | null } | null }[] };
};

const attr = (a: Attr[], k: string) => a.find((x) => x.key.toLowerCase() === k.toLowerCase())?.value ?? null;
const roastFromLabel = (s: string | null) => {
  const i = ["LIGHT", "MED-LIGHT", "MEDIUM", "MED-DARK", "DARK"].indexOf((s || "").toUpperCase());
  return i < 0 ? null : i + 1;
};
const fmtDay = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", timeZone: "America/Los_Angeles" });

function toAdmin(o: RawOrder): AdminOrder {
  const wholesale = o.tags.includes("channel:wholesale");
  const items: OrderItem[] = [];
  for (const li of o.lineItems.nodes) {
    const recipeRaw = attr(li.customAttributes, BLEND_PROP);
    let recipe: BlendRecipe | null = null;
    try { recipe = recipeRaw ? JSON.parse(recipeRaw) : null; } catch { recipe = null; }
    const unit = Number(li.originalUnitPriceSet.shopMoney.amount);
    if (wholesale) {
      // only the coffee line goes on the roast sheet; packaging lines are billing detail
      if (!/\(roasted, per lb\)$/.test(li.title)) continue;
      const sel: BlendComponent[] | undefined = recipe?.sel;
      items.push({ kind: recipe ? "blend" : "stock", name: recipe?.name ?? li.title.replace(/ · .*$/, ""), sizeLabel: "lb", sizeLb: 1, qty: li.quantity, unit,
        roast: recipe?.roast ?? roastFromLabel(attr(li.customAttributes, "Roast")) ?? 3, grind: attr(li.customAttributes, "Packaging") ?? "Private label", sel });
      continue;
    }
    if (recipe) {
      const size = shopSize(recipe.sizeId);
      items.push({ kind: "blend", name: recipe.name, sizeLabel: size.label, sizeLb: size.lb, qty: li.quantity, unit, roast: recipe.roast, grind: attr(li.customAttributes, "Grind") ?? "Whole bean", sel: recipe.sel });
      continue;
    }
    const opt = li.variant?.selectedOptions.find((x) => /size|weight/i.test(x.name)) ?? li.variant?.selectedOptions[0];
    const size = shopSize((opt && sizeFromOption(opt.value)) || "1lb");
    items.push({ kind: "stock", name: li.title, sizeLabel: size.label, sizeLb: size.lb, qty: li.quantity, unit,
      roast: Number(li.product?.roast?.value) || 3, grind: attr(li.customAttributes, "Grind") ?? "Whole bean" });
  }
  const shipped = o.displayFulfillmentStatus === "FULFILLED";
  const status: Stage = shipped ? "shipped" : o.tags.includes("stage:packing") ? "packing" : o.tags.includes("stage:roasting") ? "roasting" : "paid";
  const a = o.shippingAddress;
  const goods = items.reduce((s, it) => s + it.unit * it.qty, 0);
  const numericId = o.id.split("/").pop();
  return {
    id: o.id, name: o.name, placed: fmtDay(o.createdAt),
    channel: wholesale ? "Wholesale" : o.lineItems.nodes.some((l) => l.sellingPlan) ? "Subscription" : "Web",
    status, qcHold: o.tags.includes("qc-hold") && !shipped, gift: !!attr(o.customAttributes, "gift") || /\bgift\b/i.test(o.note || ""),
    note: o.note || "",
    customer: {
      name: a?.company || o.customer?.displayName || a?.name || "Guest",
      email: o.email || "",
      city: a ? `${a.city ?? ""}${a.provinceCode ? ", " + a.provinceCode : ""}` : "",
      address: a ? [a.name, a.company, [a.address1, a.address2].filter(Boolean).join(", "), `${a.city ?? ""}, ${a.provinceCode ?? ""} ${a.zip ?? ""}`].filter((x): x is string => !!x && x.trim() !== ",") : [],
    },
    ship: { method: o.shippingLine?.title || "—", tracking: o.fulfillments.flatMap((f) => f.trackingInfo.map((t) => t.number)).find(Boolean) ?? null },
    items,
    money: {
      goods, discount: Number(o.totalDiscountsSet.shopMoney.amount),
      shipping: Number(o.totalShippingPriceSet.shopMoney.amount), total: Number(o.totalPriceSet.shopMoney.amount),
    },
    adminUrl: env.storeDomain ? `https://admin.shopify.com/store/${env.storeDomain.replace(/\.myshopify\.com$/, "")}/orders/${numericId}` : undefined,
  };
}

/** Recent storefront orders (both channels), newest first. */
export async function getBoardOrders(): Promise<AdminOrder[]> {
  if (isDemo()) return demoStore.orders();
  const out: AdminOrder[] = [];
  let after: string | null = null, pages = 0;
  do {
    type R = { orders: { nodes: RawOrder[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } };
    const since = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
    const r: R = await admin<R>(ORDERS, { variables: { query: `tag:blended created_at:>=${since}`, after } });
    out.push(...r.orders.nodes.filter((o) => !o.cancelledAt).map(toAdmin));
    after = r.orders.pageInfo.hasNextPage ? r.orders.pageInfo.endCursor : null;
  } while (after && ++pages < 4);
  return out;
}

// ---------- stage changes ----------
const TAGS_ADD = gql`
  mutation StageTagsAdd($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) { userErrors { field message } }
  }
`;
const TAGS_REMOVE = gql`
  mutation StageTagsRemove($id: ID!, $tags: [String!]!) {
    tagsRemove(id: $id, tags: $tags) { userErrors { field message } }
  }
`;
const FULFILLMENT_ORDERS = gql`
  query OpenFulfillmentOrders($id: ID!) {
    order(id: $id) { fulfillmentOrders(first: 10) { nodes { id status } } }
  }
`;
const FULFILL = gql`
  mutation Ship($fulfillment: FulfillmentInput!) {
    fulfillmentCreate(fulfillment: $fulfillment) {
      fulfillment { id status }
      userErrors { field message }
    }
  }
`;

export async function setOrderStage(orderId: string, stage: Stage, tracking?: { number: string; company: string } | null) {
  if (isDemo()) { demoStore.setStage(orderId, stage, tracking?.number); return; }
  const stageTags = ["stage:roasting", "stage:packing", ...(stage !== "paid" ? ["qc-hold"] : [])];
  const r1 = await admin<{ tagsRemove: { userErrors: { message: string }[] } }>(TAGS_REMOVE, { variables: { id: orderId, tags: stageTags } });
  assertNoUserErrors(r1.tagsRemove, "Could not update stage");
  if (stage === "roasting" || stage === "packing") {
    const r2 = await admin<{ tagsAdd: { userErrors: { message: string }[] } }>(TAGS_ADD, { variables: { id: orderId, tags: [`stage:${stage}`] } });
    assertNoUserErrors(r2.tagsAdd, "Could not update stage");
  }
  if (stage === "shipped") {
    const f = await admin<{ order: { fulfillmentOrders: { nodes: { id: string; status: string }[] } } | null }>(FULFILLMENT_ORDERS, { variables: { id: orderId } });
    const open = (f.order?.fulfillmentOrders.nodes ?? []).filter((n) => n.status === "OPEN" || n.status === "IN_PROGRESS");
    if (!open.length) return;
    const r3 = await admin<{ fulfillmentCreate: { userErrors: { message: string }[] } }>(FULFILL, { variables: { fulfillment: {
      lineItemsByFulfillmentOrder: open.map((n) => ({ fulfillmentOrderId: n.id })),
      notifyCustomer: (await getSettings()).notifyOnShip,
      ...(tracking?.number ? { trackingInfo: { number: tracking.number, company: tracking.company || undefined } } : {}),
    } } });
    assertNoUserErrors(r3.fulfillmentCreate, "Could not mark shipped");
  }
}

