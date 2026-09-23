import "server-only";
import type { Catalog, GreenLot, StockCoffee } from "@/lib/domain/types";
import { env, isDemo } from "@/lib/env";
import { CACHE_TAGS, gql, storefront } from "@/lib/shopify/client";
import { GREEN_LOT_TYPE, lotFromFields, stockFromProduct, type MetaField, type SfProduct } from "@/lib/shopify/mapping";
import { DEMO_STOCK } from "@/lib/fixtures";
import { demoStore } from "@/lib/demo-store";

const GREEN_LOTS = gql`
  query GreenLots($type: String!, $after: String) {
    metaobjects(type: $type, first: 100, after: $after) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference { ... on MediaImage { image { url(transform: { maxWidth: 480 }) } } }
        }
      }
      pageInfo { hasNextPage endCursor }
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

type LotsRes = { metaobjects: { nodes: { id: string; handle: string; fields: MetaField[] }[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } };

/** Listed green lots (the Storefront API only returns ACTIVE metaobjects). */
export async function getGreenLots(): Promise<GreenLot[]> {
  if (isDemo()) return demoStore.green().filter((l) => l.listed);
  const out: GreenLot[] = [];
  let after: string | null = null;
  do {
    const r: LotsRes = await storefront<LotsRes>(GREEN_LOTS, { variables: { type: GREEN_LOT_TYPE, after }, tags: [CACHE_TAGS.catalog], revalidate: 300 });
    out.push(...r.metaobjects.nodes.map(lotFromFields));
    after = r.metaobjects.pageInfo.hasNextPage ? r.metaobjects.pageInfo.endCursor : null;
  } while (after);
  return out.filter((l) => l.listed);
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
