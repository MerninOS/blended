export type FlavorKey =
  | "cocoa" | "brownSugar" | "malt" | "hazelnut" | "almond"
  | "ferment" | "berry" | "stoneFruit" | "citrus" | "floral";

export type Notes = Partial<Record<FlavorKey, number>>;

/** A green coffee lot customers can put in a blend (Shopify product tagged `blended-green`, stock in grams). */
export interface GreenLot {
  id: string;            // stable handle, e.g. "cerrado"
  gid?: string;          // Shopify product GID when backed by Shopify
  name: string;
  origin: string;        // "Brazil · Minas Gerais"
  lot: string;           // "LOT-2571"
  process: string;
  roast: number;         // preferred roast, 1–5
  price: number;         // green cost $/lb
  wholesale: number | null; // $/lb roasted; null = standard markup
  retail: number | null;    // $/lb roasted; null = standard markup
  avail: number;         // green lb available (Shopify inventory, shown in lb)
  onHandG?: number | null; // grams at the green location as loaded (compare-and-set on edit); null = not stocked there yet
  minG: number | null;   // smallest weight allowed in a blend (g); null = default
  kind: "anchor" | "limited" | "soon";
  tag: string | null;    // badge
  listed: boolean;
  notes: Notes;          // 0–10 cupping scores, drive the tasting wheel
  image: string | null;
  reviews?: CoffeeReviewsData | null;
}

/** Grader read + customer reviews for a coffee (JSON field `reviews`). */
export interface CoffeeReviewsData {
  avg: number;
  count: number;
  grader?: { who: string; role: string; score: string; note: string } | null;
  reviews: { who: string; brew: string; stars: number; text: string }[];
}

export type ShopSizeId = "8oz" | "1lb" | "2lb" | "5lb";

/** A finished coffee we roast and sell as-is (Shopify product). */
export interface StockCoffee {
  id: string;            // product handle, e.g. "s-counter"
  gid?: string;
  name: string;
  sub: string;           // "House blend · Brazil + Mexico"
  roast: number;
  price: number;         // wholesale $/lb (private label)
  retail: number | null; // retail $/lb override; null = standard markup
  /** Retail bag variants from Shopify (price is the live shelf price). */
  variants: Partial<Record<ShopSizeId, { id: string; price: number; available: boolean }>>;
  lead: string;
  avail: string;
  tag: string | null;
  notes: Notes;
  blurb: string;
  image: string | null;
  reviews?: CoffeeReviewsData | null;
}

/** A component of a custom blend. */
export interface SelItem { id: string; pct: number }

export interface Catalog {
  green: GreenLot[];
  stock: StockCoffee[];
}
