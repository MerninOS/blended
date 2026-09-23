// One-time Shopify provisioning for Blended, shared by the admin "Set up store"
// button and scripts/setup-shopify.ts. Idempotent — safe to run again.
// (No "server-only" import so the Node script can use it; it only ever runs server-side.)
import type { GreenLot, StockCoffee } from "./domain/types.ts";
import { SHOP_SIZES, bagPrice, stockRetail } from "./domain/coffee.ts";
import { lotFromFields, type MetaField } from "./shopify/mapping.ts";
import { GREEN_FIELDS, PRODUCT_SET, greenProductInput, lbToG, resolveLocation, type AdminQ, type GreenFile } from "./shopify/green-product.ts";

export type { AdminQ };
/** Turn an app image path ("/images/…") into something Shopify can ingest (public URL or staged upload). */
export type ImageSource = (publicPath: string) => Promise<string | null>;

const gql = String.raw;

/** Webhook topics the app subscribes to (Settings → Register webhooks, setup script). */
export const WEBHOOKS: { topic: string; use: string; filter?: string }[] = [
  { topic: "ORDERS_CREATE", use: "Deducts the green each blend uses from Shopify inventory" },
  { topic: "ORDERS_CANCELLED", use: "Puts that green back when an order is cancelled" },
  { topic: "ORDERS_PAID", use: "Puts custom blends on QC hold" },
  { topic: "ORDERS_FULFILLED", use: "Moves the order to shipped" },
  { topic: "DRAFT_ORDERS_UPDATE", use: "Tracks wholesale invoices as they're paid" },
  { topic: "PRODUCTS_UPDATE", use: "Refreshes Our coffees and the green catalog" },
  { topic: "INVENTORY_LEVELS_UPDATE", use: "Refreshes green stock on the blend builder" },
];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const check = (payload: any, what: string) => {
  if (payload?.userErrors?.length) throw new Error(`${what}: ${payload.userErrors.map((e: { message: string }) => e.message).join("; ")}`);
};

// ---------- 1. product metafield definitions (Our coffees + green lots) ----------
const MF_CREATE = gql`
  mutation MfCreate($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) { createdDefinition { id } userErrors { field message code } }
  }
`;
async function ensureProductMetafields(q: AdminQ, log: (s: string) => void) {
  const defs = [
    ...GREEN_FIELDS,
    ["subtitle", "Subtitle", "single_line_text_field"],
    ["lead_time", "Lead time", "single_line_text_field"],
    ["availability", "Availability note", "single_line_text_field"],
  ];
  for (const [key, name, type] of defs) {
    const r = await q(MF_CREATE, { definition: { namespace: "blended", key, name, type, ownerType: "PRODUCT", pin: true, access: { storefront: "PUBLIC_READ" } } });
    const errs = r.metafieldDefinitionCreate.userErrors;
    if (errs.length && !errs.every((e: { code: string }) => e.code === "TAKEN")) check(r.metafieldDefinitionCreate, `Product field ${key}`);
  }
  log("Product fields (blended.*) are in place");
}

// ---------- 2. publications + "Our coffees" collection ----------
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

// ---------- 3. green lots → products with Shopify inventory ----------
const PRODUCT_BY_HANDLE_GREEN = gql`
  query GreenByHandle($identifier: ProductIdentifierInput!) { productByIdentifier(identifier: $identifier) { id } }
`;
async function createGreen(q: AdminQ, l: GreenLot, loc: string, file: GreenFile | null) {
  const r = await q(PRODUCT_SET, { input: greenProductInput(l, l.id, loc, lbToG(l.avail), file) });
  check(r.productSet, `Green lot ${l.name}`);
}

const LEGACY_DEF = gql`
  query LegacyGreenDef { metaobjectDefinitionByType(type: "green_lot") { id metaobjectsCount } }
`;
const LEGACY_LOTS = gql`
  query LegacyGreenLots($after: String) {
    metaobjects(type: "green_lot", first: 100, after: $after) {
      nodes {
        id
        handle
        capabilities { publishable { status } }
        fields { key value reference { ... on MediaImage { id image { url } } } }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;
type LegacyNode = { id: string; handle: string; capabilities: { publishable: { status: string } | null } | null; fields: (MetaField & { reference?: { id?: string; image?: { url: string } | null } | null })[] };

/** Copy green lots saved as `green_lot` metaobjects (older versions) into products, stock included. */
async function migrateLegacyGreen(q: AdminQ, loc: string, log: (s: string) => void) {
  const def = (await q(LEGACY_DEF)).metaobjectDefinitionByType;
  if (!def?.metaobjectsCount) return;
  let moved = 0, after: string | null = null;
  do {
    const r: { nodes: LegacyNode[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } = (await q(LEGACY_LOTS, { after })).metaobjects;
    for (const n of r.nodes) {
      if ((await q(PRODUCT_BY_HANDLE_GREEN, { identifier: { handle: n.handle } })).productByIdentifier) continue;
      const lot = lotFromFields(n);
      const imageId = n.fields.find((f) => f.key === "image")?.reference?.id;
      await createGreen(q, lot, loc, imageId ? { id: imageId } : null);
      moved++;
    }
    after = r.pageInfo.hasNextPage ? r.pageInfo.endCursor : null;
  } while (after);
  log(moved
    ? `Moved ${moved} green lot${moved === 1 ? "" : "s"} into Shopify products with inventory. The old "Green lot" metaobject entries are no longer used and can be deleted.`
    : "Green lots are already products");
}

async function seedGreen(q: AdminQ, lots: GreenLot[], loc: string, image: ImageSource, log: (s: string) => void) {
  let n = 0;
  for (const l of lots) {
    if ((await q(PRODUCT_BY_HANDLE_GREEN, { identifier: { handle: l.id } })).productByIdentifier) continue;
    const src = l.image ? await image(l.image) : null;
    await createGreen(q, l, loc, src ? { originalSource: src } : null);
    n++;
  }
  log(n ? `Added ${n} sample green lots` : "Sample green lots already present");
}

// ---------- 4. optional sample "Our coffees" ----------
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
  /** SHOPIFY_LOCATION_ID; blank = primary location */
  locationId?: string | null;
  seed?: { green: GreenLot[]; stock: StockCoffee[]; image: ImageSource } | null;
  log?: (s: string) => void;
}

/** Create everything the storefront expects in Shopify. Returns a log of what happened. */
export async function setupStore({ q, collectionHandle, locationId, seed, log: out }: SetupOptions): Promise<string[]> {
  const lines: string[] = [];
  const log = (s: string) => { lines.push(s); out?.(s); };
  await ensureProductMetafields(q, log);
  await ensureCollection(q, collectionHandle, log);
  const loc = await resolveLocation(q, locationId);
  await migrateLegacyGreen(q, loc, log);
  if (seed) {
    await seedGreen(q, seed.green, loc, seed.image, log);
    await seedStock(q, seed.stock, seed.image, log);
  }
  return lines;
}
