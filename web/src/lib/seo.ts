import "server-only";
import type { StockCoffee } from "@/lib/domain/types";
import { SHOP_SIZES, roastName, stockBagPrice } from "@/lib/domain/coffee";
import { env } from "@/lib/env";

export const SITE_NAME = "Blended";
export const abs = (path: string) => `${env.appUrl}${path.startsWith("/") ? path : `/${path}`}`;
/** Shopify CDN images are already absolute; local fallbacks aren't. */
export const absImg = (src: string | null | undefined) => (!src ? null : /^https?:\/\//.test(src) ? src : abs(src));
/** "MED-DARK" → "Med-dark" for titles and prose. */
export const roastLabel = (r: number) => { const n = roastName(r).toLowerCase(); return n.charAt(0).toUpperCase() + n.slice(1); };

const plain = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
export const describe = (c: StockCoffee) =>
  plain(c.blurb || `${c.name}: ${c.sub}. ${roastLabel(c.roast)} roast, whole bean, roasted to order.`).slice(0, 158);

/** schema.org Product for a stocked coffee, one Offer per bag size. */
export function productJsonLd(c: StockCoffee) {
  const url = abs(`/coffees/${c.id}`);
  const offers = SHOP_SIZES.flatMap((s) => {
    const v = c.variants[s.id];
    if (!v && Object.keys(c.variants).length) return [];
    return [{
      "@type": "Offer", name: s.label, price: (v?.price ?? stockBagPrice(c, s)).toFixed(2), priceCurrency: env.currency,
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
    ...(c.image ? { image: [absImg(c.image)] } : {}),
    brand: { "@type": "Brand", name: SITE_NAME },
    category: "Coffee",
    additionalProperty: [{ "@type": "PropertyValue", name: "Roast", value: roastLabel(c.roast) }],
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
