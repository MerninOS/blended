import "server-only";
import { unstable_cache } from "next/cache";
import { env, hasAdmin, hasCustomerAccounts, hasStorefront, isDemo } from "@/lib/env";
import { CACHE_TAGS, admin, assertNoUserErrors, gql } from "@/lib/shopify/client";

// Operational switches, stored as JSON in the shop metafield blended.settings.
export interface StoreSettings {
  retailCheckout: boolean;     // Retail tab hands carts to Shopify
  wholesaleCheckout: boolean;  // Wholesale tab places draft orders
  qcHoldNewBlends: boolean;    // paid orders with custom blends get a qc-hold tag
  drawDownGreen: boolean;      // subtract green lb from lots when blend orders are paid
  notifyOnShip: boolean;       // Shopify emails tracking when an order is marked shipped
}
export const DEFAULT_SETTINGS: StoreSettings = { retailCheckout: true, wholesaleCheckout: true, qcHoldNewBlends: true, drawDownGreen: true, notifyOnShip: true };

const SHOP = gql`
  query ShopSettings {
    shop {
      id
      name
      myshopifyDomain
      currencyCode
      metafield(namespace: "blended", key: "settings") { value }
    }
  }
`;
const SET = gql`
  mutation SaveSettings($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) { userErrors { field message } }
  }
`;
type ShopRes = { shop: { id: string; name: string; myshopifyDomain: string; currencyCode: string; metafield: { value: string } | null } };

let demoSettings = { ...DEFAULT_SETTINGS };

export const getSettings = unstable_cache(async (): Promise<StoreSettings> => {
  if (isDemo()) return demoSettings;
  const r = await admin<ShopRes>(SHOP);
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(r.shop.metafield?.value || "{}") }; } catch { return DEFAULT_SETTINGS; }
}, ["blended-settings"], { tags: [CACHE_TAGS.settings], revalidate: 300 });

export async function saveSettings(s: StoreSettings) {
  if (isDemo()) { demoSettings = s; return; }
  const r = await admin<ShopRes>(SHOP);
  const w = await admin<{ metafieldsSet: { userErrors: { message: string }[] } }>(SET, {
    variables: { metafields: [{ ownerId: r.shop.id, namespace: "blended", key: "settings", type: "json", value: JSON.stringify(s) }] },
  });
  assertNoUserErrors(w.metafieldsSet, "Could not save settings");
}

// ---------- connection + webhooks ----------
export const WEBHOOKS: { topic: string; use: string; filter?: string }[] = [
  { topic: "ORDERS_CREATE", use: "Opens the order on the Orders board" },
  { topic: "ORDERS_PAID", use: "Draws down green on-hand and applies the QC hold" },
  { topic: "ORDERS_FULFILLED", use: "Moves the order to shipped" },
  { topic: "DRAFT_ORDERS_UPDATE", use: "Tracks wholesale invoices as they're paid" },
  { topic: "PRODUCTS_UPDATE", use: "Refreshes Our coffees on the storefront" },
  { topic: "METAOBJECTS_CREATE", use: "Refreshes the blend builder", filter: "type:green_lot" },
  { topic: "METAOBJECTS_UPDATE", use: "Refreshes the blend builder", filter: "type:green_lot" },
  { topic: "METAOBJECTS_DELETE", use: "Refreshes the blend builder", filter: "type:green_lot" },
];

const HOOKS = gql`
  query Hooks {
    webhookSubscriptions(first: 50) { nodes { id topic uri updatedAt } }
  }
`;
const HOOK_CREATE = gql`
  mutation HookCreate($topic: WebhookSubscriptionTopic!, $sub: WebhookSubscriptionInput!) {
    webhookSubscriptionCreate(topic: $topic, webhookSubscription: $sub) {
      webhookSubscription { id }
      userErrors { field message }
    }
  }
`;
const ACTIVITY = gql`
  query Activity {
    orders(first: 6, sortKey: CREATED_AT, reverse: true, query: "tag:blended") { nodes { name createdAt tags displayFinancialStatus totalPriceSet { shopMoney { amount } } } }
    draftOrders(first: 4, sortKey: UPDATED_AT, reverse: true, query: "tag:blended") { nodes { name updatedAt status } }
  }
`;

export const webhookUri = () => `${env.appUrl}/api/webhooks/shopify`;

export interface ConnectionInfo {
  demo: boolean;
  shop: { name: string; domain: string; currency: string } | null;
  apiVersion: string;
  checks: { label: string; ok: boolean; hint: string }[];
  hooks: { topic: string; use: string; active: boolean; last: string | null }[];
  activity: { t: string; ev: string; ref: string; msg: string }[];
  error?: string;
}

export async function getConnection(): Promise<ConnectionInfo> {
  const checks = [
    { label: "Storefront API", ok: hasStorefront(), hint: "SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_PRIVATE_TOKEN" },
    { label: "Admin API", ok: hasAdmin(), hint: "SHOPIFY_ADMIN_ACCESS_TOKEN, or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET" },
    { label: "Customer accounts", ok: hasCustomerAccounts(), hint: "SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID (wholesale sign-in)" },
    { label: "Webhook secret", ok: !!env.webhookSecret, hint: "SHOPIFY_WEBHOOK_SECRET or SHOPIFY_CLIENT_SECRET" },
    { label: "Session secret", ok: !!env.sessionSecret, hint: "SESSION_SECRET (32+ random characters)" },
  ];
  const base: ConnectionInfo = { demo: isDemo(), shop: null, apiVersion: env.apiVersion, checks, hooks: WEBHOOKS.map((h) => ({ topic: h.topic, use: h.use, active: false, last: null })), activity: [] };
  if (!hasAdmin()) return base;
  try {
    const [s, h, a] = await Promise.all([
      admin<ShopRes>(SHOP),
      admin<{ webhookSubscriptions: { nodes: { topic: string; uri: string; updatedAt: string }[] } }>(HOOKS),
      admin<{ orders: { nodes: { name: string; createdAt: string; tags: string[]; displayFinancialStatus: string | null; totalPriceSet: { shopMoney: { amount: string } } }[] };
        draftOrders: { nodes: { name: string; updatedAt: string; status: string }[] } }>(ACTIVITY),
    ]);
    const mine = h.webhookSubscriptions.nodes.filter((n) => n.uri === webhookUri());
    const time = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    return {
      ...base,
      shop: { name: s.shop.name, domain: s.shop.myshopifyDomain, currency: s.shop.currencyCode },
      hooks: WEBHOOKS.map((w) => { const m = mine.find((n) => n.topic === w.topic); return { topic: w.topic, use: w.use, active: !!m, last: m ? time(m.updatedAt) : null }; }),
      activity: [
        ...a.orders.nodes.map((o) => ({ at: o.createdAt, t: time(o.createdAt), ev: "orders/create", ref: o.name,
          msg: `${o.tags.includes("channel:wholesale") ? "Wholesale" : "Retail"} · $${Number(o.totalPriceSet.shopMoney.amount).toFixed(2)} · ${(o.displayFinancialStatus || "").toLowerCase().replace(/_/g, " ")}` })),
        ...a.draftOrders.nodes.map((d) => ({ at: d.updatedAt, t: time(d.updatedAt), ev: "draft_orders/update", ref: d.name, msg: `Draft ${d.status.toLowerCase()}` })),
      ].sort((x, y) => y.at.localeCompare(x.at)).slice(0, 8).map(({ t, ev, ref, msg }) => ({ t, ev, ref, msg })),
    };
  } catch (e) {
    return { ...base, error: e instanceof Error ? e.message : "Could not reach Shopify" };
  }
}

/** Subscribe every topic the app needs to this deployment's webhook URL (idempotent). */
export async function registerWebhooks() {
  const h = await admin<{ webhookSubscriptions: { nodes: { topic: string; uri: string }[] } }>(HOOKS);
  const have = new Set(h.webhookSubscriptions.nodes.filter((n) => n.uri === webhookUri()).map((n) => n.topic));
  for (const w of WEBHOOKS) {
    if (have.has(w.topic)) continue;
    const r = await admin<{ webhookSubscriptionCreate: { userErrors: { message: string }[] } }>(HOOK_CREATE, {
      variables: { topic: w.topic, sub: { uri: webhookUri(), format: "JSON", ...(w.filter ? { filter: w.filter } : {}) } },
    });
    assertNoUserErrors(r.webhookSubscriptionCreate, `Webhook ${w.topic}`);
  }
}
