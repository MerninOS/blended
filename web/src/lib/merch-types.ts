// Merch + brew gear shapes and helpers shared by the server loader (merch.ts)
// and the client views.
export type MerchCat = "merch" | "gear";
export interface MerchOption { name: string; values: { name: string; swatch: string | null }[] }
export interface MerchVariant { id: string; price: number; available: boolean; options: Record<string, string>; image: string | null }
export interface MerchProduct {
  gid: string | null; handle: string; name: string; cat: MerchCat; type: string; blurb: string; descriptionHtml: string;
  price: number; flag: string | null; images: { url: string; alt: string }[];
  options: MerchOption[]; variants: MerchVariant[]; details: string[]; care: string | null;
}

export const catLabel = (c: MerchCat) => (c === "gear" ? "Brew gear" : "Merch");
export const isColorOption = (name: string) => /^colou?r$/i.test(name);
/** "$32", "$9.50" — whole dollars drop the cents, as in the design. */
export const priceLabel = (n: number) => "$" + (Number.isInteger(n) ? n.toLocaleString("en-US") : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
/** A choice is needed before quick add when any option has more than one value. */
export const needsChoice = (p: MerchProduct) => p.options.some((o) => o.values.length > 1);
export const soldOut = (p: MerchProduct) => !p.variants.some((v) => v.available);
export const shipsIn = (c: MerchCat) => (c === "gear" ? "Ships in 1–3 business days" : "Ships in 1–2 business days");

export type CollectionFilter = "all" | MerchCat;
export const COLLECTION_PATH: Record<CollectionFilter, string> = { all: "/collections/merch-and-gear", merch: "/collections/merch", gear: "/collections/gear" };
export const COLLECTION_META: Record<CollectionFilter, { crumb: string; title: string; intro: string }> = {
  all: { crumb: "Merch & gear", title: "Coffee Merch & Brew Gear", intro: "Caps, tees and mugs from the roastery, plus the grinders, kettles and drippers we use on our own bar." },
  merch: { crumb: "Merch", title: "Coffee Merch: Caps, Tees & Mugs", intro: "Caps, tees, hoodies and mugs from the roastery. Printed and embroidered in small runs." },
  gear: { crumb: "Brew gear", title: "Home Coffee Brew Gear", intro: "The grinders, kettles, drippers and scales we use on our own bar, picked for brewing at home." },
};
