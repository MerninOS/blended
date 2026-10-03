"use client";
// Our coffees, sold by the bag (Coffee Collection.html / Coffee Product.html):
// shared helpers, the roast meter, the product card and add-to-cart.
import Link from "next/link";
import type { StockCoffee } from "@/lib/domain/types";
import { SHOP_SIZES, stockBagPrice, topNotes, type ShopSize } from "@/lib/domain/coffee";
import { priceLabel } from "@/lib/merch-types";
import { cartStore } from "@/components/store/cart-store";
import { trackAddToCart } from "@/components/tracking/analytics";
import { MerchImage } from "@/components/store/merch/MerchCard";

export const ROAST_LABEL = ["Green", "Light", "Light", "Medium", "Medium-dark", "Dark"];
export const roastLabel = (r: number) => ROAST_LABEL[Math.max(1, Math.min(5, Math.round(r)))];
export const kindLabel = (c: StockCoffee) => (c.kind === "blend" ? "House blends" : "Single origin");

/** Sizes this coffee is sold in (all four in demo mode, where there are no variants). */
export const sizesOf = (c: StockCoffee): ShopSize[] => {
  const ids = Object.keys(c.variants);
  return ids.length ? SHOP_SIZES.filter((s) => c.variants[s.id]) : SHOP_SIZES;
};
/** Sellable in this size: Shopify says so and the green can roast another bag. */
export const inStock = (c: StockCoffee, s: ShopSize) => {
  const v = c.variants[s.id];
  if (v) return v.available;
  return !Object.keys(c.variants).length && c.greenBags?.[s.id] !== 0;
};
/** The bag a card shows and quick-adds: 1 lb when it's sold and in stock, else the first in stock. */
export const defaultSize = (c: StockCoffee) => {
  const sizes = sizesOf(c);
  return sizes.find((s) => s.id === "1lb" && inStock(c, s)) ?? sizes.find((s) => inStock(c, s)) ?? sizes[0];
};
export const priceOf = (c: StockCoffee, s: ShopSize) => stockBagPrice(c, s);
/** Tasting words: the product's own, else the top three cupping scores. */
export const tastingOf = (c: StockCoffee) => (c.tasting?.length ? c.tasting : topNotes(c.notes, 3).filter((n) => n.v > 0).map((n) => n.l));
export const imagesOf = (c: StockCoffee) => (c.images?.length ? c.images : c.image ? [{ url: c.image, alt: c.name }] : []);

export function addCoffee(c: StockCoffee, size: ShopSize, grind: string, qty: number, open: boolean) {
  const unit = priceOf(c, size);
  cartStore.add({ kind: "stock", key: `${c.id}-${size.id}-${grind}`, skuId: c.id, sizeId: size.id, sizeLabel: size.label, name: c.name, qty, unit, roast: c.roast, grind }, false, open);
  const items = cartStore.get().items;
  trackAddToCart({ kind: "stock", name: c.name, price: unit, quantity: qty, variantName: `${size.label} · ${grind}`, productGid: c.gid,
    variantGid: c.variants[size.id]?.id || undefined, image: c.image, url: `${location.origin}/coffees/${c.id}` },
  items.reduce((a, x) => a + x.unit * x.qty, 0), items.map((x) => x.name));
}

/** Five bars filled to the roast level, then its name. */
export function RoastMeter({ roast, wide }: { roast: number; wide?: boolean }) {
  const r = Math.max(1, Math.min(5, Math.round(roast)));
  return (
    <span className={(wide ? "cp-roast" : "co-roast") + " sh-over"} aria-label={`${roastLabel(r)} roast`}>
      {wide && <span>Roast</span>}
      <span className={wide ? "bar" : "co-bars"} aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => <i key={n} style={n <= r ? { background: `var(--roast-${r})` } : undefined} />)}
      </span>
      <b>{roastLabel(r)}</b>
    </span>
  );
}

export function CoffeeCard({ c, onAdded }: { c: StockCoffee; onAdded?: (c: StockCoffee) => void }) {
  const href = `/coffees/${c.id}`, size = defaultSize(c), price = priceOf(c, size), out = !sizesOf(c).some((s) => inStock(c, s));
  const words = tastingOf(c);
  return (
    <li className="sh-card">
      <div className="sh-media">
        {c.tag && <span className={"sh-flag sh-over" + (/limited/i.test(c.tag) ? " hot" : "")}>{c.tag}</span>}
        {out && <span className="sh-flag sh-over">Sold out</span>}
        <Link href={href} tabIndex={-1} aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
          <MerchImage src={imagesOf(c)[0]?.url} alt="" sizes="(max-width: 900px) 50vw, (max-width: 1100px) 33vw, 25vw" label={c.name} />
        </Link>
        {!out && (
          <div className="sh-quick">
            <button type="button" className="sh-btn" aria-label={`Add ${size.label} of ${c.name}, whole bean, to cart, ${priceLabel(price)}`}
              onClick={() => { addCoffee(c, size, "Whole bean", 1, false); onAdded?.(c); }}>
              <span className="sh-lg">Add {size.label} · {priceLabel(price)}</span><span className="sh-sm">Add {size.label}</span>
            </button>
          </div>
        )}
      </div>
      <Link href={href} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="sh-card-row sh-card-head"><h3 title={c.name}>{c.name}</h3><span className="sh-price">{priceLabel(price)}</span></div>
        <p className="sh-sub">{[c.origin, c.process].filter(Boolean).join(" · ") || c.sub}</p>
        {words.length > 0 && <p className="co-notes">{words.join(", ")}</p>}
        <RoastMeter roast={c.roast} />
      </Link>
    </li>
  );
}
