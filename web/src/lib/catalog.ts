import "server-only";
import type { Catalog, GreenLot, StockCoffee } from "@/lib/domain/types";
import { env, isDemo } from "@/lib/env";
import { CACHE_TAGS, admin, gql, storefront } from "@/lib/shopify/client";
import { lotFromFields, stockFromProduct, type MetaField, type SfProduct } from "@/lib/shopify/mapping";
import { GREEN_NODE, GREEN_QUERY, lotFromProduct, type GreenNode } from "@/lib/shopify/green-product";
import { DEMO_STOCK } from "@/lib/fixtures";
import { demoStore } from "@/lib/demo-store";
import { getSettings } from "@/lib/settings";
import { DEFAULT_ROAST_LOSS, applyGreen, type RoastLoss } from "@/lib/domain/green";

// Green lots are unpublished products, so they're read with the Admin API
// (server only) and cached with the rest of the catalog.
const GREEN_LOTS = gql`
  # admin
  query GreenLots($query: String!) {
    products(first: 250, query: $query, sortKey: TITLE) { nodes { ...GreenNode } }
  }
  ${GREEN_NODE}
`;

// Before store setup moves them into products, green lots are `green_lot` metaobjects.
const LEGACY_GREEN = gql`
  query LegacyGreenLots {
    metaobjects(type: "green_lot", first: 100) {
      nodes {
        id
        handle
        fields { key value reference { ... on MediaImage { image { url(transform: { maxWidth: 480 }) } } } }
      }
    }
  }
`;

const STOCK = gql`
  query StockCoffees($handle: String!) {
    collection(handle: $handle) {
      products(first: 50, sortKey: COLLECTION_DEFAULT) {
        nodes {
          id
          handle
          title
          description
          featuredImage { url(transform: { maxWidth: 800 }) }
          images(first: 6) { nodes { url(transform: { maxWidth: 1400 }) altText } }
          variants(first: 10) {
            nodes { id availableForSale price { amount } selectedOptions { name value } }
          }
          roast: metafield(namespace: "blended", key: "roast_level") { value }
          notes: metafield(namespace: "blended", key: "tasting_notes") { value }
          reviews: metafield(namespace: "blended", key: "reviews") { value }
          wholesale: metafield(namespace: "blended", key: "wholesale_price") { value }
          subtitle: metafield(namespace: "blended", key: "subtitle") { value }
          lead: metafield(namespace: "blended", key: "lead_time") { value }
          availability: metafield(namespace: "blended", key: "availability") { value }
          badge: metafield(namespace: "blended", key: "badge") { value }
          kind: metafield(namespace: "blended", key: "kind") { value }
          process: metafield(namespace: "blended", key: "process") { value }
          tasting: metafield(namespace: "blended", key: "tasting_words") { value }
          farm: metafield(namespace: "blended", key: "farm") { value }
          producer: metafield(namespace: "blended", key: "producer") { value }
          altitude: metafield(namespace: "blended", key: "altitude") { value }
          varietal: metafield(namespace: "blended", key: "varietal") { value }
          harvest: metafield(namespace: "blended", key: "harvest") { value }
          story: metafield(namespace: "blended", key: "story") { value }
          recipe: metafield(namespace: "blended", key: "recipe") { value }
        }
      }
    }
  }
`;

/** Every green lot that isn't archived, listed or not, with live Shopify stock: what coffees are roasted from. */
export async function getInventoryLots(): Promise<GreenLot[]> {
  if (isDemo()) return demoStore.green();
  const r = await admin<{ products: { nodes: GreenNode[] } }>(GREEN_LOTS, {
    variables: { query: GREEN_QUERY }, tags: [CACHE_TAGS.catalog], revalidate: 300,
  }).catch((e: unknown) => { console.error("[catalog] green products:", e instanceof Error ? e.message : e); return null; });
  if (r?.products.nodes.length) return r.products.nodes.map(lotFromProduct);
  // Not set up yet (or the app lacks a scope): keep serving the old metaobject lots.
  const legacy = await storefront<{ metaobjects: { nodes: { id: string; handle: string; fields: MetaField[] }[] } }>(LEGACY_GREEN, { tags: [CACHE_TAGS.catalog], revalidate: 300 })
    .catch(() => null);
  return (legacy?.metaobjects.nodes ?? []).map(lotFromFields);
}

/** Listed green lots: the ones customers can put in a blend. */
export async function getGreenLots(): Promise<GreenLot[]> {
  return (await getInventoryLots()).filter((l) => l.listed);
}

/** Our coffees as Shopify has them, before green is applied. */
export async function fetchStockCoffees(): Promise<StockCoffee[]> {
  if (isDemo()) {
    const rec = demoStore.recipes(), rev = demoStore.reviews();
    return DEMO_STOCK.map((c) => ({ ...c, ...(rec[c.id] ? { recipe: rec[c.id] } : {}), ...(c.id in rev ? { reviews: rev[c.id] } : {}) }));
  }
  const r = await storefront<{ collection: { products: { nodes: SfProduct[] } } | null }>(STOCK, {
    variables: { handle: env.stockCollection }, tags: [CACHE_TAGS.catalog], revalidate: 300,
  });
  return (r.collection?.products.nodes ?? []).map(stockFromProduct);
}

const roastLoss = () => getSettings().then((s) => s.roastLoss, () => [...DEFAULT_ROAST_LOSS] as RoastLoss);

/** Our coffees, sold out wherever the green they're roasted from can't make another bag. */
export async function getStockCoffees(): Promise<StockCoffee[]> {
  const [stock, lots, loss] = await Promise.all([fetchStockCoffees(), getInventoryLots().catch(() => null), roastLoss()]);
  return lots ? applyGreen(stock, lots, loss) : stock;
}

/** One half failing (e.g. a missing API scope) shouldn't take the whole storefront down. */
const orEmpty = <T,>(what: string, p: Promise<T[]>) => p.catch((e: unknown) => {
  console.error(`[catalog] ${what} unavailable:`, e instanceof Error ? e.message : e);
  return [] as T[];
});

export async function getCatalog(): Promise<Catalog> {
  const [lots, stock, loss] = await Promise.all([orEmpty("green lots", getInventoryLots()), orEmpty("our coffees", fetchStockCoffees()), roastLoss()]);
  return { green: lots.filter((l) => l.listed), stock: applyGreen(stock, lots, loss), roastLoss: loss };
}
