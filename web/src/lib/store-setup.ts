// One-time Shopify provisioning for Blended, shared by the admin "Set up store"
// button and scripts/setup-shopify.ts. Idempotent — safe to run again.
// (No "server-only" import so the Node script can use it; it only ever runs server-side.)
import type { GreenLot, StockCoffee } from "./domain/types.ts";
import { AX, SHOP_SIZES, bagPrice, indexLots, retailOf, roastOf, stockRetail, weighted, wholesaleOf } from "./domain/coffee.ts";
import { lotFromFields, type MetaField } from "./shopify/mapping.ts";
import { GREEN_FIELDS, PRODUCT_SET, greenProductInput, lbToG, resolveLocation, type AdminQ, type GreenFile } from "./shopify/green-product.ts";

export type { AdminQ };
/** Turn an app image path ("/images/…") into something Shopify can ingest (public URL or staged upload). */
export type ImageSource = (publicPath: string) => Promise<string | null>;

const gql = String.raw;

/** Webhook topics the app subscribes to (Settings → Register webhooks, setup script). */
export const WEBHOOKS: { topic: string; use: string; filter?: string }[] = [
  { topic: "ORDERS_CREATE", use: "Deducts the green every coffee in the order uses from Shopify inventory" },
  { topic: "ORDERS_CANCELLED", use: "Puts that green back when an unshipped order is cancelled" },
  { topic: "ORDERS_PAID", use: "Puts custom blends on QC hold" },
  { topic: "ORDERS_FULFILLED", use: "Moves the order to shipped" },
  { topic: "DRAFT_ORDERS_UPDATE", use: "Tracks draft checkouts as they're paid" },
  { topic: "PRODUCTS_UPDATE", use: "Refreshes Our coffees and the green catalog" },
  { topic: "INVENTORY_LEVELS_UPDATE", use: "Refreshes green stock and re-syncs Our coffees’ counts" },
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
    // coffee product page (all optional)
    ["kind", "Kind (single or blend)", "single_line_text_field"],
    ["process", "Process", "single_line_text_field"],
    ["tasting_words", "Tasting words", "list.single_line_text_field"],
    ["farm", "Farm / washing station", "single_line_text_field"],
    ["producer", "Producer", "single_line_text_field"],
    ["altitude", "Altitude", "single_line_text_field"],
    ["varietal", "Varietal", "single_line_text_field"],
    ["harvest", "Harvest", "single_line_text_field"],
    ["story", "Producer story", "multi_line_text_field"],
    ["recipe", "Blend recipe", "single_line_text_field"],
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
async function seedStock(q: AdminQ, stock: StockCoffee[], image: ImageSource, log: (s: string) => void, status: "ACTIVE" | "DRAFT" = "ACTIVE") {
  let n = 0;
  for (const s of stock) {
    if ((await q(PRODUCT_BY_HANDLE, { identifier: { handle: s.id } })).productByIdentifier) continue;
    const src = s.image ? await image(s.image) : null;
    const media = src ? [{ originalSource: src, mediaContentType: "IMAGE", alt: s.name }] : [];
    const mf = (key: string, type: string, value: string) => ({ namespace: "blended", key, type, value });
    const r = await q(PRODUCT_CREATE, { media, product: {
      title: s.name, handle: s.id, status, vendor: "Blended", productType: "Coffee", tags: ["blended-stock"],
      descriptionHtml: `<p>${s.blurb}</p>`,
      productOptions: [{ name: "Size", values: SHOP_SIZES.map((z) => ({ name: z.label })) }],
      metafields: [
        mf("roast_level", "number_integer", String(s.roast)), mf("tasting_notes", "json", JSON.stringify(s.notes)),
        mf("wholesale_price", "number_decimal", s.price.toFixed(2)), mf("subtitle", "single_line_text_field", s.sub),
        ...(s.lead ? [mf("lead_time", "single_line_text_field", s.lead)] : []), ...(s.avail ? [mf("availability", "single_line_text_field", s.avail)] : []),
        ...(s.tag ? [mf("badge", "single_line_text_field", s.tag)] : []),
        ...([["process", s.process], ["farm", s.farm], ["producer", s.producer], ["altitude", s.altitude], ["varietal", s.varietal], ["harvest", s.harvest], ["recipe", s.recipe]] as const)
          .flatMap(([k, v]) => (v ? [mf(k, "single_line_text_field", v)] : [])),
        ...(s.tasting?.length ? [mf("tasting_words", "list.single_line_text_field", JSON.stringify(s.tasting))] : []),
        ...(s.story ? [mf("story", "multi_line_text_field", s.story)] : []),
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
  log(n ? `Added ${n} ${status === "DRAFT" ? "draft " : ""}coffees to "Our coffees"` : "Those coffees are already in the store");
}

// ---------- sample coffees built from the store's own green lots ----------
const slug = (t: string) => t.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const country = (origin: string) => origin.split(/\s*[·,]\s*/)[0] || origin;
const words = (notes: GreenLot["notes"]) => AX.map((a) => ({ l: a.l, v: notes[a.k] || 0 })).filter((a) => a.v > 0).sort((a, b) => b.v - a.v).slice(0, 3).map((a) => a.l.toLowerCase());
const list = (w: string[]) => (w.length > 1 ? `${w.slice(0, -1).join(", ")} and ${w[w.length - 1]}` : w[0] ?? "");
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const nickel = (n: number) => Math.round(n * 20) / 20;
const body = (l: GreenLot) => (l.notes.cocoa ?? 0) + (l.notes.brownSugar ?? 0) + (l.notes.malt ?? 0) + (l.notes.hazelnut ?? 0) + l.roast;
const lift = (l: GreenLot) => (l.notes.floral ?? 0) + (l.notes.citrus ?? 0) + (l.notes.berry ?? 0) + (l.notes.stoneFruit ?? 0);

/**
 * Finished coffees to sell by the bag, made only from facts the green lots
 * already hold (origin, process, roast, cupping scores, prices): one single
 * origin per lot, plus two house blends — the heaviest-bodied lot with the
 * brightest (as on the landing page), each way round. Farm, producer,
 * altitude, varietal, harvest and story are left for the roaster to fill in.
 */
export function sampleCoffeesFromGreen(green: GreenLot[]): StockCoffee[] {
  const lots = green.filter((l) => l.listed && l.kind !== "soon");
  const idx = indexLots(lots);
  const base = { variants: {}, image: null, lead: "", avail: "", reviews: null } as const;
  const singles: StockCoffee[] = lots.map((l) => ({
    ...base, id: `${slug(l.name)}-coffee`, name: l.name, sub: `Single origin · ${l.origin}`, kind: "single", origin: l.origin, process: l.process || undefined,
    roast: Math.max(1, Math.min(5, Math.round(l.roast))), price: wholesaleOf(l), retail: retailOf(l), tag: l.tag, notes: l.notes,
    blurb: `${l.process ? `${cap(l.process)} process. ` : ""}${cap(list(words(l.notes)))}${words(l.notes).length ? "." : ""}`.trim(),
  }));
  const byBody = [...lots].sort((a, b) => body(b) - body(a));
  const heavy = byBody[0], bright = heavy && [...lots].filter((l) => l.id !== heavy.id).sort((a, b) => lift(b) - lift(a))[0];
  const blends: StockCoffee[] = [];
  const blend = (name: string, a: GreenLot, pa: number, b: GreenLot, roles: [string, string]): StockCoffee => {
    const sel = [{ id: a.id, pct: pa }, { id: b.id, pct: 100 - pa }];
    const notes = Object.fromEntries(Object.entries(weighted(sel, idx)).filter(([, v]) => v > 0).map(([k, v]) => [k, Math.round(v * 10) / 10]));
    return {
      ...base, id: slug(name), name, sub: `House blend · ${country(a.origin)} + ${country(b.origin)}`, kind: "blend",
      origin: `${country(a.origin)} · ${country(b.origin)}`, process: a.process === b.process ? a.process : `${a.process} / ${b.process}`,
      farm: `${a.name} + ${b.name}`, recipe: `${pa}% ${a.name}, ${100 - pa}% ${b.name}`, roast: Math.max(1, Math.min(5, Math.round(roastOf(sel, idx)))), tag: null, notes,
      price: nickel(wholesaleOf(a) * pa / 100 + wholesaleOf(b) * (100 - pa) / 100), retail: nickel(retailOf(a) * pa / 100 + retailOf(b) * (100 - pa) / 100),
      blurb: `${pa}% ${a.name} ${roles[0]}, ${100 - pa}% ${b.name} ${roles[1]}. ${cap(list(words(notes)))}.`,
    };
  };
  if (heavy && bright) {
    blends.push(blend("House Blend", heavy, 70, bright, ["for body and sweetness", "for lift"]));
    blends.push(blend("Bright Blend", bright, 60, heavy, ["for brightness", "to round it out"]));
  }
  return [...singles, ...blends];
}

/** Adds the sample coffees as drafts (skips any whose handle already exists). */
export async function seedSampleCoffees(q: AdminQ, green: GreenLot[], log: (s: string) => void) {
  const coffees = sampleCoffeesFromGreen(green);
  if (!coffees.length) return log("No listed green lots to build coffees from");
  await seedStock(q, coffees, async () => null, log, "DRAFT");
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
