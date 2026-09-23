// One-time Shopify provisioning for Blended, shared by the admin "Set up store"
// button and scripts/setup-shopify.ts. Idempotent — safe to run again.
// (No "server-only" import so the Node script can use it; it only ever runs server-side.)
import type { GreenLot, StockCoffee } from "./domain/types.ts";
import { SHOP_SIZES, bagPrice, stockRetail } from "./domain/coffee.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdminQ = (query: string, variables?: Record<string, unknown>) => Promise<any>;
/** Turn an app image path ("/images/…") into something Shopify can ingest (public URL or staged upload). */
export type ImageSource = (publicPath: string) => Promise<string | null>;

const gql = String.raw;
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
async function ensureGreenLotDefinition(q: AdminQ, log: (s: string) => void) {
  if ((await q(DEF_BY_TYPE)).metaobjectDefinitionByType) return log("Green lot definition already exists");
  const f = (key: string, name: string, type: string, extra = {}) => ({ key, name, type, ...extra });
  const r = await q(DEF_CREATE, { definition: {
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
  check(r.metaobjectDefinitionCreate, "Green lot definition");
  log("Created the green lot definition");
}

// ---------- 2. product metafield definitions ----------
const MF_CREATE = gql`
  mutation MfCreate($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) { createdDefinition { id } userErrors { field message code } }
  }
`;
async function ensureProductMetafields(q: AdminQ, log: (s: string) => void) {
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
    const r = await q(MF_CREATE, { definition: { namespace: "blended", key, name, type, ownerType: "PRODUCT", pin: true, access: { storefront: "PUBLIC_READ" } } });
    const errs = r.metafieldDefinitionCreate.userErrors;
    if (errs.length && !errs.every((e: { code: string }) => e.code === "TAKEN")) check(r.metafieldDefinitionCreate, `Product field ${key}`);
  }
  log("Product fields (blended.*) are in place");
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
async function publishEverywhere(q: AdminQ, id: string) {
  const pubs: { id: string }[] = (await q(PUBLICATIONS)).publications.nodes;
  const r = await q(PUBLISH, { id, input: pubs.map((p) => ({ publicationId: p.id })) });
  check(r.publishablePublish, "Publish");
}
async function ensureCollection(q: AdminQ, handle: string, log: (s: string) => void) {
  if ((await q(COLLECTION_BY_HANDLE, { identifier: { handle } })).collectionByIdentifier) return log(`Collection "${handle}" already exists`);
  const r = await q(COLLECTION_CREATE, { input: {
    title: "Our coffees", handle, sortOrder: "MANUAL",
    ruleSet: { appliedDisjunctively: false, rules: [{ column: "TAG", relation: "EQUALS", condition: "blended-stock" }] },
  } });
  check(r.collectionCreate, "Collection");
  await publishEverywhere(q, r.collectionCreate.collection.id);
  log(`Created collection "${handle}" (products tagged blended-stock)`);
}

// ---------- 4. optional sample catalog ----------
const FILE_CREATE = gql`
  mutation FileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) { files { id } userErrors { field message } }
  }
`;
const LOT_BY_HANDLE = gql`
  query LotByHandle($handle: MetaobjectHandleInput!) { metaobjectByHandle(handle: $handle) { id } }
`;
const LOT_UPSERT = gql`
  mutation LotUpsert($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
    metaobjectUpsert(handle: $handle, metaobject: $metaobject) { metaobject { id } userErrors { field message } }
  }
`;
async function seedGreen(q: AdminQ, lots: GreenLot[], image: ImageSource, log: (s: string) => void) {
  let n = 0;
  for (const l of lots) {
    if ((await q(LOT_BY_HANDLE, { handle: { type: "green_lot", handle: l.id } })).metaobjectByHandle) continue;
    let imageId: string | null = null;
    const src = l.image ? await image(l.image) : null;
    if (src) {
      const f = await q(FILE_CREATE, { files: [{ originalSource: src, contentType: "IMAGE", alt: l.name }] });
      check(f.fileCreate, "Photo"); imageId = f.fileCreate.files[0].id;
    }
    const fields = [
      ["name", l.name], ["origin", l.origin], ["lot_code", l.lot], ["process", l.process], ["roast_level", String(l.roast)],
      ["green_price", l.price.toFixed(2)], ["on_hand_lb", String(l.avail)], ["kind", l.kind], ["badge", l.tag ?? ""],
      ["tasting_notes", JSON.stringify(l.notes)], ...(imageId ? [["image", imageId]] : []),
    ].filter(([, v]) => v !== "").map(([key, value]) => ({ key, value }));
    const r = await q(LOT_UPSERT, { handle: { type: "green_lot", handle: l.id }, metaobject: { fields, capabilities: { publishable: { status: l.listed ? "ACTIVE" : "DRAFT" } } } });
    check(r.metaobjectUpsert, `Green lot ${l.name}`);
    n++;
  }
  log(n ? `Added ${n} sample green lots` : "Sample green lots already present");
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
async function seedStock(q: AdminQ, stock: StockCoffee[], image: ImageSource, log: (s: string) => void) {
  let n = 0;
  for (const s of stock) {
    if ((await q(PRODUCT_BY_HANDLE, { identifier: { handle: s.id } })).productByIdentifier) continue;
    const src = s.image ? await image(s.image) : null;
    const media = src ? [{ originalSource: src, mediaContentType: "IMAGE", alt: s.name }] : [];
    const mf = (key: string, type: string, value: string) => ({ namespace: "blended", key, type, value });
    const r = await q(PRODUCT_CREATE, { media, product: {
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
    check(r.productCreate, `Product ${s.name}`);
    const id = r.productCreate.product.id;
    const v = await q(VARIANTS_CREATE, { productId: id, variants: SHOP_SIZES.map((z) => ({
      optionValues: [{ optionName: "Size", name: z.label }],
      price: bagPrice(stockRetail(s), z).toFixed(2),
      inventoryItem: { tracked: false, requiresShipping: true, sku: `${s.id.toUpperCase()}-${z.id.toUpperCase()}`, measurement: { weight: { value: z.lb, unit: "POUNDS" } } },
    })) });
    check(v.productVariantsBulkCreate, `Sizes for ${s.name}`);
    await publishEverywhere(q, id);
    n++;
  }
  log(n ? `Added ${n} sample coffees to "Our coffees"` : "Sample coffees already present");
}

export interface SetupOptions {
  q: AdminQ;
  collectionHandle: string;
  seed?: { green: GreenLot[]; stock: StockCoffee[]; image: ImageSource } | null;
  log?: (s: string) => void;
}

/** Create everything the storefront expects in Shopify. Returns a log of what happened. */
export async function setupStore({ q, collectionHandle, seed, log: out }: SetupOptions): Promise<string[]> {
  const lines: string[] = [];
  const log = (s: string) => { lines.push(s); out?.(s); };
  await ensureGreenLotDefinition(q, log);
  await ensureProductMetafields(q, log);
  await ensureCollection(q, collectionHandle, log);
  if (seed) {
    await seedGreen(q, seed.green, seed.image, log);
    await seedStock(q, seed.stock, seed.image, log);
  }
  return lines;
}
