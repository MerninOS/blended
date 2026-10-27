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
import { adminQ, check, requireStore } from "./shopify-admin.ts";

const gql = String.raw;
const args = new Set(process.argv.slice(2));
requireStore();

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
