import "server-only";
import type { Catalog, GreenLot, StockCoffee } from "@/lib/domain/types";
import { env, isDemo } from "@/lib/env";
import { CACHE_TAGS, admin, gql, storefront } from "@/lib/shopify/client";
import { stockFromProduct, type SfProduct } from "@/lib/shopify/mapping";
import { GREEN_NODE, GREEN_QUERY, lotFromProduct, type GreenNode } from "@/lib/shopify/green-product";
import { greenLocation } from "@/lib/green-admin";
import { DEMO_STOCK } from "@/lib/fixtures";
import { demoStore } from "@/lib/demo-store";

// Green lots are unpublished products, so they're read with the Admin API
// (server only) and cached with the rest of the catalog.
const GREEN_LOTS = gql`
  # admin
  query GreenLots($query: String!, $loc: ID!) {
    products(first: 250, query: $query, sortKey: TITLE) { nodes { ...GreenNode } }
  }
  ${GREEN_NODE}
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
        }
      }
    }
  }
`;

/** Listed green lots with live Shopify stock. */
export async function getGreenLots(): Promise<GreenLot[]> {
  if (isDemo()) return demoStore.green().filter((l) => l.listed);
  const r = await admin<{ products: { nodes: GreenNode[] } }>(GREEN_LOTS, {
    variables: { query: `${GREEN_QUERY} AND status:active`, loc: await greenLocation() }, tags: [CACHE_TAGS.catalog], revalidate: 300,
  });
  return r.products.nodes.map(lotFromProduct);
}

export async function getStockCoffees(): Promise<StockCoffee[]> {
  if (isDemo()) return DEMO_STOCK;
  const r = await storefront<{ collection: { products: { nodes: SfProduct[] } } | null }>(STOCK, {
    variables: { handle: env.stockCollection }, tags: [CACHE_TAGS.catalog], revalidate: 300,
  });
  return (r.collection?.products.nodes ?? []).map(stockFromProduct);
}

export async function getCatalog(): Promise<Catalog> {
  const [green, stock] = await Promise.all([getGreenLots(), getStockCoffees()]);
  return { green, stock };
}
