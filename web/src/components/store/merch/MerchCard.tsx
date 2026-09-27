"use client";
// Product card for merch + brew gear, the add-to-cart helper both pages share,
// and the "Added" toast.
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { catLabel, needsChoice, priceLabel, soldOut, isColorOption, type MerchProduct, type MerchVariant } from "@/lib/merch-types";
import { cartStore } from "@/components/store/cart-store";
import { trackAddToCart } from "@/components/tracking/analytics";

/** "Ink · M", or the product type when there's nothing to choose. */
export const variantLabel = (p: MerchProduct, v: MerchVariant) =>
  p.options.filter((o) => o.values.length > 1).map((o) => v.options[o.name]).filter(Boolean).join(" · ") || p.type;

export function addMerch(p: MerchProduct, v: MerchVariant, qty: number, open: boolean) {
  const label = variantLabel(p, v);
  cartStore.add({
    kind: "item", key: v.id, variantId: v.id, handle: p.handle, image: v.image ?? p.images[0]?.url ?? null,
    name: p.name, sizeLabel: label, qty, unit: v.price,
  }, false, open);
  const items = cartStore.get().items;
  trackAddToCart({ kind: "item", category: catLabel(p.cat), name: p.name, price: v.price, quantity: qty, variantName: label,
    productGid: p.gid ?? undefined, variantGid: v.id.startsWith("gid://") ? v.id : undefined, image: v.image ?? p.images[0]?.url ?? null,
    url: `${location.origin}/products/${p.handle}` }, items.reduce((a, x) => a + x.unit * x.qty, 0), items.map((x) => x.name));
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);
  const show = (m: string) => { setMsg(m); clearTimeout(t.current); t.current = setTimeout(() => setMsg(null), 1800); };
  const node = <div className={"sh-toast sh-over" + (msg ? " on" : "")} role="status" aria-live="polite">{msg}</div>;
  return [show, node] as const;
}

/** Product photo, or a quiet branded placeholder while the product has none. */
export function MerchImage({ src, alt, sizes, priority, label }: { src: string | null | undefined; alt: string; sizes: string; priority?: boolean; label?: string }) {
  if (src) return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />;
  return (
    <div className="sh-ph" aria-hidden="true">
      <Image src="/brand/blended-mark.png" alt="" width={40} height={40} />
      {label && <span className="sh-over" style={{ fontSize: 9.5 }}>{label}</span>}
    </div>
  );
}

export function MerchCard({ p, hot, onAdded }: { p: MerchProduct; hot?: boolean; onAdded?: (p: MerchProduct) => void }) {
  const href = `/products/${p.handle}`;
  const colors = p.options.find((o) => isColorOption(o.name) && o.values.length > 1);
  const sizes = p.options.find((o) => !isColorOption(o.name) && o.values.length > 1);
  const out = soldOut(p), choose = needsChoice(p);
  const single = !choose && p.variants.find((v) => v.available);
  return (
    <li className="sh-card">
      <div className="sh-media">
        {p.flag && <span className={"sh-flag sh-over" + (hot ? " hot" : "")}>{p.flag}</span>}
        {out && <span className="sh-flag sh-over">Sold out</span>}
        <Link href={href} tabIndex={-1} aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
          <MerchImage src={p.images[0]?.url} alt="" sizes="(max-width: 900px) 50vw, (max-width: 1100px) 33vw, 25vw" label={p.name} />
        </Link>
        {!out && (
          <div className="sh-quick">
            {single
              ? <button type="button" className="sh-btn" onClick={() => { addMerch(p, single, 1, false); onAdded?.(p); }}>Add to cart · {priceLabel(single.price)}</button>
              : <Link className="sh-btn" href={href}>Choose options</Link>}
          </div>
        )}
      </div>
      <Link href={href} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="sh-card-row"><h3>{p.name}</h3><span className="sh-price">{priceLabel(p.price)}</span></div>
        <div className="sh-card-row">
          <p className="sh-sub">{p.type}{sizes ? ` · ${sizes.values.length} ${sizes.name.toLowerCase()}s` : ""}</p>
          {colors && <span className="sh-dots" aria-label={`${colors.values.length} colors`}>{colors.values.map((c) => <i key={c.name} style={{ background: c.swatch ?? "var(--surface-sunken)" }} />)}</span>}
        </div>
      </Link>
    </li>
  );
}
