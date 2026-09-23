// One-time store setup for Blended. Idempotent — safe to re-run.
//
//   node --env-file=.env.local scripts/setup-shopify.ts            # definitions + collection
//   node --env-file=.env.local scripts/setup-shopify.ts --seed     # …plus the design's sample coffees
//   node --env-file=.env.local scripts/setup-shopify.ts --webhooks # …plus webhooks to APP_URL
//
// Needs Admin API scopes: write_products, write_inventory, read_locations,
// write_publications, write_files, read_metaobjects (to migrate old green lots), read_orders, write_orders,
// write_draft_orders, write_fulfillments (+ read_customers for wholesale).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DEMO_GREEN, DEMO_STOCK } from "../src/lib/fixtures.ts";
import { WEBHOOKS, setupStore } from "../src/lib/store-setup.ts";

const gql = String.raw;
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const version = process.env.SHOPIFY_API_VERSION || "2026-07";
const args = new Set(process.argv.slice(2));
if (!domain) { console.error("Set SHOPIFY_STORE_DOMAIN (and admin credentials) in .env.local"); process.exit(1); }

let token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
async function getToken() {
  if (token) return token;
  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: process.env.SHOPIFY_CLIENT_ID!, client_secret: process.env.SHOPIFY_CLIENT_SECRET! }),
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status} ${await res.text()}`);
  token = (await res.json()).access_token;
  return token!;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function adminQ(query: string, variables: Record<string, unknown> = {}): Promise<any> {
  const res = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
    method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": await getToken() },
    body: JSON.stringify({ query, variables }),
  });
  const j = await res.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const check = (payload: any, what: string) => {
  if (payload?.userErrors?.length) throw new Error(`${what}: ${payload.userErrors.map((e: { message: string }) => e.message).join("; ")}`);
};

// ---------- seed images: staged upload from public/ ----------
const STAGE = gql`
  mutation Stage($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } }
  }
`;
async function uploadImage(publicPath: string) {
  const buf = readFileSync(join(import.meta.dirname, "..", "public", publicPath));
  const filename = publicPath.split("/").pop()!;
  const s = await adminQ(STAGE, { input: [{ filename, mimeType: "image/webp", resource: "IMAGE", httpMethod: "POST", fileSize: String(buf.length) }] });
  check(s.stagedUploadsCreate, "stage");
  const t = s.stagedUploadsCreate.stagedTargets[0];
  const form = new FormData();
  t.parameters.forEach((p: { name: string; value: string }) => form.append(p.name, p.value));
  form.append("file", new Blob([buf], { type: "image/webp" }), filename);
  const up = await fetch(t.url, { method: "POST", body: form });
  if (!up.ok) throw new Error(`upload ${filename}: ${up.status}`);
  return t.resourceUrl as string;
}

// ---------- 5. webhooks ----------
const HOOKS = gql`
  query Hooks { webhookSubscriptions(first: 50) { nodes { topic uri } } }
`;
const HOOK_CREATE = gql`
  mutation HookCreate($topic: WebhookSubscriptionTopic!, $sub: WebhookSubscriptionInput!) {
    webhookSubscriptionCreate(topic: $topic, webhookSubscription: $sub) { webhookSubscription { id } userErrors { field message } }
  }
`;
async function ensureWebhooks() {
  const app = process.env.APP_URL?.replace(/\/$/, "");
  if (!app || app.includes("localhost")) return console.log("! skipped webhooks: set APP_URL to your public deployment URL");
  const uri = `${app}/api/webhooks/shopify`;
  const have = new Set((await adminQ(HOOKS)).webhookSubscriptions.nodes.filter((n: { uri: string }) => n.uri === uri).map((n: { topic: string }) => n.topic));
  for (const { topic, filter } of WEBHOOKS) {
    if (have.has(topic)) continue;
    const r = await adminQ(HOOK_CREATE, { topic, sub: { uri, format: "JSON", ...(filter ? { filter } : {}) } });
    check(r.webhookSubscriptionCreate, `webhook ${topic}`);
  }
  console.log(`✓ webhooks → ${uri}`);
}

await setupStore({
  q: adminQ,
  collectionHandle: process.env.SHOPIFY_STOCK_COLLECTION || "our-coffees",
  locationId: process.env.SHOPIFY_LOCATION_ID,
  seed: args.has("--seed") ? { green: DEMO_GREEN, stock: DEMO_STOCK, image: uploadImage } : null,
  log: (s) => console.log(`✓ ${s}`),
});
if (args.has("--webhooks")) await ensureWebhooks();
console.log("Done.");
