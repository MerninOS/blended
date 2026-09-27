import "server-only";
// Merch and brew gear: ordinary Shopify products in two collections (handles
// set by SHOPIFY_MERCH_COLLECTION / SHOPIFY_GEAR_COLLECTION). Colour and size
// come from the product's options; "Details" and "Care" from the optional
// blended.details (one per line) and blended.care metafields; the card flag
// from blended.badge.
import { env, isDemo } from "@/lib/env";
import { CACHE_TAGS, gql, storefront } from "@/lib/shopify/client";
import { DEMO_MERCH } from "@/lib/merch-fixtures";
import { prepareRichText } from "@/lib/rich-text";
import { isColorOption, type MerchCat, type MerchProduct } from "@/lib/merch-types";

export type { MerchCat, MerchProduct } from "@/lib/merch-types";

const PRODUCTS = gql`
  query MerchCollection($handle: String!) {
    collection(handle: $handle) {
      products(first: 100, sortKey: COLLECTION_DEFAULT) {
        nodes {
          id
          handle
          title
          description
          descriptionHtml
          productType
          images(first: 8) { nodes { url(transform: { maxWidth: 1400 }) altText } }
          options { name optionValues { name swatch { color } } }
          variants(first: 100) {
            nodes { id availableForSale price { amount } selectedOptions { name value } image { url(transform: { maxWidth: 1400 }) } }
          }
          details: metafield(namespace: "blended", key: "details") { value }
          care: metafield(namespace: "blended", key: "care") { value }
          badge: metafield(namespace: "blended", key: "badge") { value }
        }
      }
    }
  }
`;

type Node = {
  id: string; handle: string; title: string; description: string; descriptionHtml: string; productType: string;
  images: { nodes: { url: string; altText: string | null }[] };
  options: { name: string; optionValues: { name: string; swatch: { color: string | null } | null }[] }[];
  variants: { nodes: { id: string; availableForSale: boolean; price: { amount: string }; selectedOptions: { name: string; value: string }[]; image: { url: string } | null }[] };
  details: { value: string } | null; care: { value: string } | null; badge: { value: string } | null;
};

/** Common colour names, for options that have no swatch set in Shopify. */
const NAMED: Record<string, string> = {
  black: "#1A1A18", ink: "#1A1A18", "matte black": "#1A1A18", white: "#F4F3EF", paper: "#EFEDE6", cream: "#EFE7D6", natural: "#E6DCC8",
  silver: "#C9C7C2", grey: "#8E8C87", gray: "#8E8C87", brown: "#6B4A33", espresso: "#3A2118", red: "#D93D18", vermilion: "#D93D18",
  orange: "#EE8A1E", amber: "#F5A623", yellow: "#F2C94C", green: "#5E7D4E", olive: "#6B6B3A", blue: "#2F5D8A", navy: "#1F2F4A", pink: "#E7A1B0",
};
const listOf = (v: string | undefined) => {
  if (!v) return [];
  try { const j = JSON.parse(v); if (Array.isArray(j)) return j.map(String); } catch { /* multi-line text */ }
  return v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
};

function fromNode(n: Node, cat: MerchCat): MerchProduct {
  const variants = n.variants.nodes.map((v) => ({
    id: v.id, price: Number(v.price.amount), available: v.availableForSale, image: v.image?.url ?? null,
    options: Object.fromEntries(v.selectedOptions.map((o) => [o.name, o.value])),
  }));
  // Shopify gives single-variant products a "Title: Default Title" option; drop it.
  const options = n.options.filter((o) => !(o.optionValues.length === 1 && o.optionValues[0].name === "Default Title")).map((o) => ({
    name: o.name,
    values: o.optionValues.map((v) => ({ name: v.name, swatch: isColorOption(o.name) ? v.swatch?.color ?? NAMED[v.name.toLowerCase()] ?? null : null })),
  }));
  return {
    gid: n.id, handle: n.handle, name: n.title, cat, type: n.productType || (cat === "gear" ? "Brew gear" : "Merch"),
    blurb: n.description.split(/\n\s*\n/)[0]?.trim() ?? "", descriptionHtml: prepareRichText(n.descriptionHtml),
    price: variants.length ? Math.min(...variants.map((v) => v.price)) : 0,
    flag: n.badge?.value?.trim() || null,
    images: n.images.nodes.map((i) => ({ url: i.url, alt: i.altText || n.title })),
    options, variants, details: listOf(n.details?.value), care: n.care?.value?.trim() || null,
  };
}

async function collection(handle: string, cat: MerchCat): Promise<MerchProduct[]> {
  const r = await storefront<{ collection: { products: { nodes: Node[] } } | null }>(PRODUCTS, {
    variables: { handle }, tags: [CACHE_TAGS.catalog], revalidate: 300,
  }).catch((e: unknown) => { console.error(`[merch] ${handle}:`, e instanceof Error ? e.message : e); return null; });
  return (r?.collection?.products.nodes ?? []).map((n) => fromNode(n, cat));
}

/** Everything in the merch and gear collections, merch first. */
export async function getMerch(): Promise<MerchProduct[]> {
  if (isDemo()) return DEMO_MERCH;
  const [merch, gear] = await Promise.all([collection(env.merchCollection, "merch"), collection(env.gearCollection, "gear")]);
  const seen = new Set<string>();
  return [...merch, ...gear].filter((p) => !seen.has(p.handle) && seen.add(p.handle));
}
