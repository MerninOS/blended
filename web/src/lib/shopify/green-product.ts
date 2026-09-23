// Green lots as Shopify products. Each lot is a product tagged `blended-green`
// with one inventory-tracked variant whose quantity is green coffee in GRAMS at
// the roastery location, so Shopify's inventory (receiving, counts, history,
// reports) is the source of truth. The product is never published to a sales
// channel; the storefront reads it through the Admin API and sells blends as
// custom line items, then the order webhook deducts the grams each blend used.
//
// Shared by the app and scripts/setup-shopify.ts (no "server-only" import).
import type { CoffeeReviewsData, GreenLot, Notes } from "../domain/types.ts";
import { G_PER_LB } from "../domain/coffee.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdminQ = (query: string, variables?: Record<string, unknown>) => Promise<any>;

export const GREEN_TAG = "blended-green";
export const GREEN_PRODUCT_TYPE = "Green coffee";
export const GREEN_QUERY = `tag:${GREEN_TAG} AND -status:archived`;

const gql = String.raw;
const NS = "blended";

// ---------- where green is stocked ----------
const LOCATIONS = gql`
  query GreenLocations { locations(first: 50) { nodes { id name isPrimary isActive } } }
`;
/** The location green is counted at: SHOPIFY_LOCATION_ID, else the primary location. */
export async function resolveLocation(q: AdminQ, override?: string | null): Promise<string> {
  if (override) return override.startsWith("gid://") ? override : `gid://shopify/Location/${override}`;
  const nodes: { id: string; isPrimary: boolean; isActive: boolean }[] = (await q(LOCATIONS)).locations.nodes;
  const loc = nodes.find((n) => n.isPrimary && n.isActive) ?? nodes.find((n) => n.isActive);
  if (!loc) throw new Error("No active inventory location in Shopify.");
  return loc.id;
}

// ---------- product fields ----------
/** blended.* fields a green product uses: [key, name, type]. */
export const GREEN_FIELDS: [string, string, string][] = [
  ["origin", "Origin", "single_line_text_field"],
  ["lot_code", "Lot code", "single_line_text_field"],
  ["process", "Process", "single_line_text_field"],
  ["roast_level", "Roast level (1–5)", "number_integer"],
  ["green_price", "Green cost $/lb", "number_decimal"],
  ["wholesale_price", "Wholesale $/lb", "number_decimal"],
  ["retail_price", "Retail $/lb roasted", "number_decimal"],
  ["min_grams", "Min in a blend (g)", "number_integer"],
  ["kind", "Kind (anchor / limited / soon)", "single_line_text_field"],
  ["badge", "Badge", "single_line_text_field"],
  ["tasting_notes", "Tasting notes (0–10 scores)", "json"],
  ["reviews", "Grader + customer reviews", "json"],
];
const TYPE = Object.fromEntries(GREEN_FIELDS.map(([k, , t]) => [k, t]));

/** Metafields to set, and keys to clear (Shopify rejects blank values). */
export function greenMetafields(l: GreenLot) {
  const dec = (n: number | null | undefined) => (n == null ? "" : n.toFixed(2));
  const int = (n: number | null | undefined) => (n == null ? "" : String(Math.round(n)));
  const values: Record<string, string> = {
    origin: l.origin, lot_code: l.lot, process: l.process, roast_level: int(l.roast),
    green_price: dec(l.price), wholesale_price: dec(l.wholesale), retail_price: dec(l.retail), min_grams: int(l.minG),
    kind: l.kind, badge: l.tag ?? "", tasting_notes: JSON.stringify(l.notes || {}),
    ...(l.reviews !== undefined ? { reviews: l.reviews ? JSON.stringify(l.reviews) : "" } : {}),
  };
  const set = Object.entries(values).filter(([, v]) => v !== "").map(([key, value]) => ({ namespace: NS, key, type: TYPE[key], value }));
  const clear = Object.entries(values).filter(([, v]) => v === "").map(([key]) => key);
  return { set, clear };
}

export const lbToG = (lb: number) => Math.max(0, Math.round(lb * G_PER_LB));
export const gToLb = (g: number) => Math.round((g / G_PER_LB) * 10) / 10;

export type GreenFile = { id: string } | { originalSource: string };

/** productSet input that creates a green lot with its stock. */
export function greenProductInput(l: GreenLot, handle: string, locationId: string, grams: number, file?: GreenFile | null) {
  return {
    title: l.name, handle, status: l.listed ? "ACTIVE" : "DRAFT",
    productType: GREEN_PRODUCT_TYPE, vendor: "Blended", tags: [GREEN_TAG],
    descriptionHtml: "<p>Green coffee for custom blends. Stock is counted in grams.</p>",
    metafields: greenMetafields(l).set,
    ...(file ? { files: ["id" in file ? { id: file.id } : { originalSource: file.originalSource, contentType: "IMAGE", alt: l.name }] } : {}),
    productOptions: [{ name: "Title", values: [{ name: "Default Title" }] }],
    variants: [{
      optionValues: [{ optionName: "Title", name: "Default Title" }],
      price: l.price.toFixed(2),
      sku: l.lot || handle.toUpperCase(),
      inventoryPolicy: "DENY",
      inventoryItem: { tracked: true, requiresShipping: false },
      inventoryQuantities: [{ locationId, name: "available", quantity: Math.max(0, Math.round(grams)) }],
    }],
  };
}

export const PRODUCT_SET = gql`
  mutation GreenProductSet($input: ProductSetInput!) {
    productSet(input: $input, synchronous: true) {
      product { id handle }
      userErrors { field message }
    }
  }
`;

// ---------- product -> GreenLot ----------
type MF = { value: string } | null;
export type GreenNode = {
  id: string; handle: string; title: string; status: string;
  media: { nodes: { id: string; image?: { url: string } | null }[] };
  variants: { nodes: { id: string; inventoryItem: { id: string; inventoryLevel: { quantities: { name: string; quantity: number }[] } | null } }[] };
} & Record<(typeof GREEN_FIELDS)[number][0], MF>;

/** Selection shared by every green product query (the operation must declare $loc: ID!). */
export const GREEN_NODE = gql`
  fragment GreenNode on Product {
    id handle title status
    media(first: 1) { nodes { id ... on MediaImage { image { url(transform: { maxWidth: 480 }) } } } }
    variants(first: 1) { nodes { id inventoryItem { id inventoryLevel(locationId: $loc) { quantities(names: ["available"]) { name quantity } } } } }
    origin: metafield(namespace: "blended", key: "origin") { value }
    lot_code: metafield(namespace: "blended", key: "lot_code") { value }
    process: metafield(namespace: "blended", key: "process") { value }
    roast_level: metafield(namespace: "blended", key: "roast_level") { value }
    green_price: metafield(namespace: "blended", key: "green_price") { value }
    wholesale_price: metafield(namespace: "blended", key: "wholesale_price") { value }
    retail_price: metafield(namespace: "blended", key: "retail_price") { value }
    min_grams: metafield(namespace: "blended", key: "min_grams") { value }
    kind: metafield(namespace: "blended", key: "kind") { value }
    badge: metafield(namespace: "blended", key: "badge") { value }
    tasting_notes: metafield(namespace: "blended", key: "tasting_notes") { value }
    reviews: metafield(namespace: "blended", key: "reviews") { value }
  }
`;

const num = (v: string | null | undefined, d: number | null = null) => {
  if (v == null || v === "") return d;
  const n = Number(v); return isNaN(n) ? d : n;
};
const json = <T,>(v: string | null | undefined, d: T): T => { try { return v ? JSON.parse(v) as T : d; } catch { return d; } };

export function lotFromProduct(p: GreenNode): GreenLot {
  const v = p.variants.nodes[0];
  const level = v?.inventoryItem.inventoryLevel;
  const grams = level ? Math.max(0, level.quantities.find((x) => x.name === "available")?.quantity ?? 0) : 0;
  const kind = p.kind?.value;
  return {
    id: p.handle,
    gid: p.id,
    name: p.title,
    origin: p.origin?.value || "",
    lot: p.lot_code?.value || "",
    process: p.process?.value || "Washed",
    roast: num(p.roast_level?.value, 3)!,
    price: num(p.green_price?.value, 0)!,
    wholesale: num(p.wholesale_price?.value),
    retail: num(p.retail_price?.value),
    avail: gToLb(grams),
    onHandG: level ? grams : null,
    minG: num(p.min_grams?.value),
    kind: kind === "limited" || kind === "soon" ? kind : "anchor",
    tag: p.badge?.value || null,
    listed: p.status === "ACTIVE",
    notes: json<Notes>(p.tasting_notes?.value, {}),
    image: p.media.nodes[0]?.image?.url ?? null,
    reviews: json<CoffeeReviewsData | null>(p.reviews?.value, null),
  };
}

// ---------- inventory moves for orders ----------
const ITEM_BY_HANDLE = gql`
  query GreenItem($identifier: ProductIdentifierInput!) {
    productByIdentifier(identifier: $identifier) { id tags variants(first: 1) { nodes { inventoryItem { id } } } }
  }
`;
const ADJUST = gql`
  mutation GreenAdjust($input: InventoryAdjustQuantitiesInput!, $key: String!) {
    inventoryAdjustQuantities(input: $input) @idempotent(key: $key) {
      userErrors { field message code }
    }
  }
`;

/**
 * Move green stock for an order: negative grams deduct, positive put back.
 * `key` makes Shopify apply it once even if the webhook is delivered twice.
 */
export async function adjustGreen(q: AdminQ, opts: { locationId: string; usageG: Map<string, number>; sign: 1 | -1; reason: "other" | "restock"; orderGid: string; key: string }) {
  const changes: { inventoryItemId: string; locationId: string; delta: number; changeFromQuantity: null }[] = [];
  for (const [handle, g] of opts.usageG) {
    const p = (await q(ITEM_BY_HANDLE, { identifier: { handle } })).productByIdentifier;
    const item = p?.tags.includes(GREEN_TAG) ? p.variants.nodes[0]?.inventoryItem.id : null;
    const delta = Math.round(g) * opts.sign;
    if (item && delta) changes.push({ inventoryItemId: item, locationId: opts.locationId, delta, changeFromQuantity: null });
  }
  if (!changes.length) return 0;
  const r = await q(ADJUST, { key: opts.key, input: { name: "available", reason: opts.reason, referenceDocumentUri: opts.orderGid, changes } });
  const errs = r.inventoryAdjustQuantities.userErrors as { message: string }[];
  if (errs.length) throw new Error(`Green inventory: ${errs.map((e) => e.message).join("; ")}`);
  return changes.length;
}
