// One-time store setup for Blended. Idempotent — safe to re-run.
//
//   node --env-file=.env.local scripts/setup-shopify.ts            # definitions + collection
//   node --env-file=.env.local scripts/setup-shopify.ts --seed     # …plus the design's sample coffees
//   node --env-file=.env.local scripts/setup-shopify.ts --webhooks # …plus webhooks to APP_URL
//
// Needs Admin API scopes: write_metaobject_definitions, write_metaobjects,
// write_products, write_publications, write_files, read_orders, write_orders,
// write_draft_orders, write_fulfillments (+ read_customers for wholesale).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DEMO_GREEN, DEMO_STOCK } from "../src/lib/fixtures.ts";
import { SHOP_SIZES, bagPrice, stockRetail } from "../src/lib/domain/coffee.ts";

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

// ---------- 1. green_lot metaobject definition ----------
const DEF_BY_TYPE = gql`
  query DefByType { metaobjectDefinitionByType(type: "green_lot") { id } }
`;
const DEF_CREATE = gql`
  mutation DefCreate($definition: MetaobjectDefinitionCreateInput!) {
    metaobjectDefinitionCreate(definition: $definition) { metaobjectDefinition { id } userErrors { field message } }
  }
`;
async function ensureGreenLotDefinition() {
  if ((await adminQ(DEF_BY_TYPE)).metaobjectDefinitionByType) return console.log("✓ green_lot definition exists");
  const f = (key: string, name: string, type: string, extra = {}) => ({ key, name, type, ...extra });
  const r = await adminQ(DEF_CREATE, { definition: {
    type: "green_lot", name: "Green lot", displayNameKey: "name",
    description: "Green coffee customers can put in a custom blend (Blended storefront).",
    access: { storefront: "PUBLIC_READ" },
    capabilities: { publishable: { enabled: true } },
    fieldDefinitions: [
      f("name", "Name", "single_line_text_field", { required: true }),
      f("origin", "Origin", "single_line_text_field"),
      f("lot_code", "Lot code", "single_line_text_field"),
      f("process", "Process", "single_line_text_field"),
      f("roast_level", "Preferred roast (1–5)", "number_integer", { validations: [{ name: "min", value: "1" }, { name: "max", value: "5" }] }),
      f("green_price", "Green cost $/lb", "number_decimal"),
      f("wholesale_price", "Wholesale $/lb roasted", "number_decimal"),
      f("retail_price", "Retail $/lb roasted", "number_decimal"),
      f("on_hand_lb", "On hand (green lb)", "number_integer"),
      f("min_grams", "Min in a blend (g)", "number_integer"),
      f("kind", "Kind", "single_line_text_field", { validations: [{ name: "choices", value: JSON.stringify(["anchor", "limited", "soon"]) }] }),
      f("badge", "Badge", "single_line_text_field"),
      f("tasting_notes", "Tasting notes (0–10 scores)", "json"),
      f("reviews", "Grader + customer reviews", "json"),
      f("image", "Photo", "file_reference", { validations: [{ name: "file_type_options", value: JSON.stringify(["Image"]) }] }),
    ],
  } });
  check(r.metaobjectDefinitionCreate, "green_lot definition");
  console.log("✓ created green_lot definition");
}

// ---------- 2. product metafield definitions ----------
const MF_CREATE = gql`
  mutation MfCreate($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) { createdDefinition { id } userErrors { field message code } }
  }
`;
async function ensureProductMetafields() {
  const defs = [
    ["roast_level", "Roast level (1–5)", "number_integer"],
    ["tasting_notes", "Tasting notes (0–10 scores)", "json"],
    ["wholesale_price", "Wholesale $/lb (private label)", "number_decimal"],
    ["subtitle", "Subtitle", "single_line_text_field"],
    ["lead_time", "Lead time", "single_line_text_field"],
    ["availability", "Availability note", "single_line_text_field"],
    ["badge", "Badge", "single_line_text_field"],
    ["reviews", "Grader + customer reviews", "json"],
  ];
  for (const [key, name, type] of defs) {
    const r = await adminQ(MF_CREATE, { definition: { namespace: "blended", key, name, type, ownerType: "PRODUCT", pin: true, access: { storefront: "PUBLIC_READ" } } });
    const errs = r.metafieldDefinitionCreate.userErrors;
    if (errs.length && !errs.every((e: { code: string }) => e.code === "TAKEN")) check(r.metafieldDefinitionCreate, `metafield ${key}`);
  }
  console.log("✓ product metafield definitions");
}

// ---------- 3. publications + "Our coffees" collection ----------
const PUBLICATIONS = gql`
  query Pubs { publications(first: 25) { nodes { id name } } }
`;
const PUBLISH = gql`
  mutation Publish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) { userErrors { field message } }
  }
`;
const COLLECTION_BY_HANDLE = gql`
  query CollectionByHandle($identifier: CollectionIdentifierInput!) { collectionByIdentifier(identifier: $identifier) { id } }
`;
const COLLECTION_CREATE = gql`
  mutation CollectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) { collection { id } userErrors { field message } }
  }
`;
let pubs: { id: string; name: string }[] = [];
async function publishEverywhere(id: string) {
  if (!pubs.length) pubs = (await adminQ(PUBLICATIONS)).publications.nodes;
  const r = await adminQ(PUBLISH, { id, input: pubs.map((p) => ({ publicationId: p.id })) });
  check(r.publishablePublish, "publish");
}
async function ensureCollection() {
  const handle = process.env.SHOPIFY_STOCK_COLLECTION || "our-coffees";
  const found = (await adminQ(COLLECTION_BY_HANDLE, { identifier: { handle } })).collectionByIdentifier;
  if (found) return console.log(`✓ collection ${handle} exists`);
  const r = await adminQ(COLLECTION_CREATE, { input: {
    title: "Our coffees", handle, sortOrder: "MANUAL",
    ruleSet: { appliedDisjunctively: false, rules: [{ column: "TAG", relation: "EQUALS", condition: "blended-stock" }] },
  } });
  check(r.collectionCreate, "collection");
  await publishEverywhere(r.collectionCreate.collection.id);
  console.log(`✓ created collection ${handle} (products tagged blended-stock)`);
}

// ---------- 4. seed: images, green lots, stocked coffees ----------
const STAGE = gql`
  mutation Stage($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } }
  }
`;
const FILE_CREATE = gql`
  mutation FileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) { files { id } userErrors { field message } }
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

const LOT_BY_HANDLE = gql`
  query LotByHandle($handle: MetaobjectHandleInput!) { metaobjectByHandle(handle: $handle) { id } }
`;
const LOT_UPSERT = gql`
  mutation LotUpsert($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
    metaobjectUpsert(handle: $handle, metaobject: $metaobject) { metaobject { id } userErrors { field message } }
  }
`;
async function seedGreen() {
  for (const l of DEMO_GREEN) {
    const exists = (await adminQ(LOT_BY_HANDLE, { handle: { type: "green_lot", handle: l.id } })).metaobjectByHandle;
    if (exists) { console.log(`  · green ${l.id} exists`); continue; }
    let imageId: string | null = null;
    if (l.image) {
      const src = await uploadImage(l.image);
      const f = await adminQ(FILE_CREATE, { files: [{ originalSource: src, contentType: "IMAGE", alt: l.name }] });
      check(f.fileCreate, "file"); imageId = f.fileCreate.files[0].id;
    }
    const fields = [
      ["name", l.name], ["origin", l.origin], ["lot_code", l.lot], ["process", l.process], ["roast_level", String(l.roast)],
      ["green_price", l.price.toFixed(2)], ["on_hand_lb", String(l.avail)], ["kind", l.kind], ["badge", l.tag ?? ""],
      ["tasting_notes", JSON.stringify(l.notes)], ...(imageId ? [["image", imageId]] : []),
    ].filter(([, v]) => v !== "").map(([key, value]) => ({ key, value }));
    const r = await adminQ(LOT_UPSERT, { handle: { type: "green_lot", handle: l.id }, metaobject: { fields, capabilities: { publishable: { status: l.listed ? "ACTIVE" : "DRAFT" } } } });
    check(r.metaobjectUpsert, `lot ${l.id}`);
    console.log(`  ✓ green ${l.id}`);
  }
}

const PRODUCT_BY_HANDLE = gql`
  query ProductByHandle($identifier: ProductIdentifierInput!) { productByIdentifier(identifier: $identifier) { id } }
`;
const PRODUCT_CREATE = gql`
  mutation ProductCreate($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
    productCreate(product: $product, media: $media) { product { id } userErrors { field message } }
  }
`;
const VARIANTS_CREATE = gql`
  mutation VariantsCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: REMOVE_STANDALONE_VARIANT) {
      productVariants { id }
      userErrors { field message }
    }
  }
`;
async function seedStock() {
  for (const s of DEMO_STOCK) {
    if ((await adminQ(PRODUCT_BY_HANDLE, { identifier: { handle: s.id } })).productByIdentifier) { console.log(`  · product ${s.id} exists`); continue; }
    const media = s.image ? [{ originalSource: await uploadImage(s.image), mediaContentType: "IMAGE", alt: s.name }] : [];
    const mf = (key: string, type: string, value: string) => ({ namespace: "blended", key, type, value });
    const r = await adminQ(PRODUCT_CREATE, { media, product: {
      title: s.name, handle: s.id, status: "ACTIVE", vendor: "Blended", productType: "Coffee", tags: ["blended-stock"],
      descriptionHtml: `<p>${s.blurb}</p>`,
      productOptions: [{ name: "Size", values: SHOP_SIZES.map((z) => ({ name: z.label })) }],
      metafields: [
        mf("roast_level", "number_integer", String(s.roast)), mf("tasting_notes", "json", JSON.stringify(s.notes)),
        mf("wholesale_price", "number_decimal", s.price.toFixed(2)), mf("subtitle", "single_line_text_field", s.sub),
        mf("lead_time", "single_line_text_field", s.lead), mf("availability", "single_line_text_field", s.avail),
        ...(s.tag ? [mf("badge", "single_line_text_field", s.tag)] : []),
      ],
    } });
    check(r.productCreate, `product ${s.id}`);
    const id = r.productCreate.product.id;
    const v = await adminQ(VARIANTS_CREATE, { productId: id, variants: SHOP_SIZES.map((z) => ({
      optionValues: [{ optionName: "Size", name: z.label }],
      price: bagPrice(stockRetail(s), z).toFixed(2),
      inventoryItem: { tracked: false, requiresShipping: true, sku: `${s.id.toUpperCase()}-${z.id.toUpperCase()}`, measurement: { weight: { value: z.lb, unit: "POUNDS" } } },
    })) });
    check(v.productVariantsBulkCreate, `variants ${s.id}`);
    await publishEverywhere(id);
    console.log(`  ✓ product ${s.id}`);
  }
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
  const topics: [string, string?][] = [["ORDERS_CREATE"], ["ORDERS_PAID"], ["ORDERS_FULFILLED"], ["DRAFT_ORDERS_UPDATE"], ["PRODUCTS_UPDATE"],
    ["METAOBJECTS_CREATE", "type:green_lot"], ["METAOBJECTS_UPDATE", "type:green_lot"], ["METAOBJECTS_DELETE", "type:green_lot"]];
  for (const [topic, filter] of topics) {
    if (have.has(topic)) continue;
    const r = await adminQ(HOOK_CREATE, { topic, sub: { uri, format: "JSON", ...(filter ? { filter } : {}) } });
    check(r.webhookSubscriptionCreate, `webhook ${topic}`);
  }
  console.log(`✓ webhooks → ${uri}`);
}

await ensureGreenLotDefinition();
await ensureProductMetafields();
await ensureCollection();
if (args.has("--seed")) { console.log("Seeding sample catalog…"); await seedGreen(); await seedStock(); }
if (args.has("--webhooks")) await ensureWebhooks();
console.log("Done.");
