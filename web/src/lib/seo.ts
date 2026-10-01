import "server-only";
import type { StockCoffee } from "@/lib/domain/types";
import { SHOP_SIZES, stockBagPrice, topNotes } from "@/lib/domain/coffee";
import { env } from "@/lib/env";

export const SITE_NAME = "Blended";
export const abs = (path: string) => `${env.appUrl}${path.startsWith("/") ? path : `/${path}`}`;
/** Shopify CDN images are already absolute; local fallbacks aren't. */
export const absImg = (src: string | null | undefined) => (!src ? null : /^https?:\/\//.test(src) ? src : abs(src));

const plain = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const ROAST_WORD = ["", "Light", "Light", "Medium", "Medium-dark", "Dark"];
const roastWord = (r: number) => ROAST_WORD[Math.max(1, Math.min(5, Math.round(r)))];
/** "Colombia · Huila" → "Colombia"; a blend's "Brazil · Mexico" → "Brazil and Mexico". */
const countries = (c: StockCoffee) => {
  const parts = (c.origin || "").split(/\s*[·+]\s*/).filter(Boolean);
  return c.kind === "blend" ? parts.join(" and ") : parts[0] ?? "";
};
const tasteWords = (c: StockCoffee) => (c.tasting?.length ? c.tasting : topNotes(c.notes, 3).filter((n) => n.v > 0).map((n) => n.l));
/** Lowest shelf price across the bag sizes in stock. */
export const fromPrice = (c: StockCoffee) => {
  const sizes = SHOP_SIZES.filter((s) => (Object.keys(c.variants).length ? c.variants[s.id]?.available : true));
  return sizes.length ? Math.min(...sizes.map((s) => c.variants[s.id]?.price ?? stockBagPrice(c, s))) : null;
};

/** Search title: what it is and where it's from — "Huila Reserve Coffee · Colombia · Medium Roast". */
export function coffeeTitle(c: StockCoffee) {
  const name = /coffee|espresso/i.test(c.name) ? c.name : `${c.name} Coffee`;
  const where = c.kind === "blend" ? "House Blend" : countries(c);
  const full = [name, where, `${roastWord(c.roast)} Roast`].filter(Boolean).join(" · ");
  return full.length <= 52 ? full : [name, where].filter(Boolean).join(" · ");
}

/**
 * Meta description: the facts people search for (origin, process, tasting
 * notes, roast, price), then the product's own blurb if it fits ~158 characters.
 */
export function describe(c: StockCoffee) {
  const what = c.kind === "blend" ? `House blend${countries(c) ? ` of ${countries(c)}` : ""}` : `Single-origin coffee${countries(c) ? ` from ${countries(c)}` : ""}`;
  const words = tasteWords(c), from = fromPrice(c);
  // Facts first (they're what people search for and what Google shows); the blurb if it still fits.
  const parts = [
    `${what}${c.process ? `, ${c.process.toLowerCase()}` : ""}.`,
    words.length ? `Tastes of ${words.slice(0, 3).join(", ").toLowerCase()}.` : "",
    `${roastWord(c.roast)} roast, roasted to order${from != null ? `, from $${from.toFixed(2)}` : ""}.`,
    c.blurb ? plain(c.blurb).replace(/([^.!?])$/, "$1.") : "",
  ].filter(Boolean);
  let out = "";
  for (const p of parts) { const next = out ? `${out} ${p}` : p; if (next.length > 158) { if (!out) out = p.slice(0, 157) + "…"; break; } out = next; }
  return out;
}

/** schema.org Product for a stocked coffee, one Offer per bag size. */
export function productJsonLd(c: StockCoffee) {
  const url = abs(`/coffees/${c.id}`);
  const offers = SHOP_SIZES.flatMap((s) => {
    const v = c.variants[s.id];
    if (!v && Object.keys(c.variants).length) return [];
    return [{
      "@type": "Offer", name: `${s.label} bag`, sku: `${c.id}-${s.id}`, price: (v?.price ?? stockBagPrice(c, s)).toFixed(2), priceCurrency: env.currency,
      availability: v && !v.available ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url, itemCondition: "https://schema.org/NewCondition",
    }];
  });
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: c.name,
    description: describe(c),
    sku: c.id,
    url,
    ...((c.images?.length || c.image) ? { image: (c.images?.length ? c.images.map((i) => i.url) : [c.image]).map(absImg) } : {}),
    brand: { "@type": "Brand", name: SITE_NAME },
    category: "Coffee",
    ...(c.kind !== "blend" && countries(c) ? { countryOfOrigin: { "@type": "Country", name: countries(c) } } : {}),
    additionalProperty: ([["Roast", roastWord(c.roast)], ["Origin", c.origin], ["Process", c.process], ["Tasting notes", tasteWords(c).join(", ")],
      [c.kind === "blend" ? "Components" : "Farm", c.farm], ["Producer", c.producer], ["Altitude", c.altitude], ["Varietal", c.varietal], ["Harvest", c.harvest]] as const)
      .filter(([, v]) => v).map(([name, value]) => ({ "@type": "PropertyValue", name, value })),
    offers,
    ...(c.reviews && c.reviews.count > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: c.reviews.avg, reviewCount: c.reviews.count } } : {}),
  };
}

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": abs("/#org"), name: SITE_NAME, url: abs("/"), logo: abs("/brand/blended-mark.png") },
      { "@type": "WebSite", "@id": abs("/#site"), name: SITE_NAME, url: abs("/"), publisher: { "@id": abs("/#org") } },
    ],
  };
}
