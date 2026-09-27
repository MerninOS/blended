"use client";
// Merch & gear product page (Merch Gear Product.html): gallery, colour
// swatches and size chips from the Shopify options, quantity + add to cart,
// free-shipping progress, details accordions, related products and a sticky
// add bar on mobile.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SHIP_FREE } from "@/lib/domain/coffee";
import { COLLECTION_PATH, catLabel, isColorOption, priceLabel, shipsIn, type MerchProduct } from "@/lib/merch-types";
import { CartDrawer } from "@/components/store/CartDrawer";
import { useCart } from "@/components/store/cart-store";
import { trackProductView } from "@/components/tracking/analytics";
import { MerchCard, MerchImage, addMerch } from "./MerchCard";

type Sel = Record<string, string | null>;

function initialSel(p: MerchProduct): Sel {
  return Object.fromEntries(p.options.map((o) => {
    if (o.values.length === 1) return [o.name, o.values[0].name];
    // Colour starts on the first one in stock; sizes wait for a choice.
    if (isColorOption(o.name)) return [o.name, (o.values.find((v) => p.variants.some((x) => x.available && x.options[o.name] === v.name)) ?? o.values[0]).name];
    return [o.name, null];
  }));
}

export function ProductView({ p, related }: { p: MerchProduct; related: MerchProduct[] }) {
  const [sel, setSel] = useState<Sel>(() => initialSel(p));
  const [qty, setQty] = useState(1);
  const [sticky, setSticky] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null), optsRef = useRef<HTMLDivElement>(null);
  const { items } = useCart();

  const missing = p.options.find((o) => sel[o.name] == null);
  const variant = missing ? null : p.variants.find((v) => p.options.every((o) => v.options[o.name] === sel[o.name])) ?? (p.options.length ? null : p.variants[0]);
  const unavailable = !missing && (!variant || !variant.available);
  // A value is out when no in-stock variant has it alongside the other current choices.
  const inStock = (name: string, value: string) => p.variants.some((v) => v.available && v.options[name] === value
    && p.options.every((o) => o.name === name || sel[o.name] == null || v.options[o.name] === sel[o.name]));
  const price = variant?.price ?? p.price;
  const cat = catLabel(p.cat);
  const addLabel = missing ? `Select a ${missing.name.toLowerCase()}` : unavailable ? "Sold out" : `Add to cart · ${priceLabel(price * qty)}`;

  const sub = items.reduce((a, x) => a + x.unit * x.qty, 0);
  const shipMsg = sub >= SHIP_FREE ? "Free shipping unlocked" : `${priceLabel(Math.round((SHIP_FREE - sub) * 100) / 100)} away from free shipping`;

  // Gallery: the chosen colour's photo leads when it has one.
  const lead = variant?.image ?? (p.options.some((o) => isColorOption(o.name))
    ? p.variants.find((v) => p.options.every((o) => !isColorOption(o.name) || v.options[o.name] === sel[o.name]) && v.image)?.image : null);
  const imgs = lead ? [{ url: lead, alt: p.name }, ...p.images.filter((i) => i.url !== lead)] : p.images;

  useEffect(() => {
    trackProductView({ kind: "item", category: cat, name: p.name, price: p.price, productGid: p.gid ?? undefined, image: p.images[0]?.url ?? null, url: `${location.origin}/products/${p.handle}` });
  }, [p.handle]); // eslint-disable-line react-hooks/exhaustive-deps -- once per product

  useEffect(() => {
    const el = buyRef.current; if (!el) return;
    const io = new IntersectionObserver(([en]) => setSticky(!en.isIntersecting && en.boundingClientRect.top < 0));
    io.observe(el); return () => io.disconnect();
  }, []);

  const add = () => {
    if (missing) { scrollTo({ top: (optsRef.current?.getBoundingClientRect().top ?? 0) + scrollY - 120, behavior: "smooth" }); return; }
    if (!variant || !variant.available) return;
    addMerch(p, variant, qty, true); setQty(1);
  };

  return (
    <main className="sh-root">
      <div className="sh-wrap">
        <nav aria-label="Breadcrumb" style={{ paddingTop: 22 }}>
          <ol className="sh-crumbs sh-over">
            <li><Link href="/">Home</Link></li>
            <li><Link href={COLLECTION_PATH.all}>Merch &amp; gear</Link></li>
            <li><Link href={COLLECTION_PATH[p.cat]}>{cat}</Link></li>
            <li aria-current="page">{p.name}</li>
          </ol>
        </nav>

        <article className="pd">
          <div className="pd-gal" aria-label="Product photos">
            {(imgs.length ? imgs : [null]).map((im, i) => (
              <div key={im?.url ?? i} className="sh-media">
                <MerchImage src={im?.url} alt={im?.alt ?? p.name} priority={i === 0} sizes={i === 0 ? "(max-width: 900px) 86vw, 56vw" : "(max-width: 900px) 86vw, 28vw"} label={p.name} />
              </div>
            ))}
          </div>

          <div className="pd-info">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="sh-over" style={{ color: "var(--ink-muted)" }}>{cat} · {p.type}</div>
              <h1 className="sh-disp" style={{ fontSize: "clamp(36px,4.4vw,64px)", textWrap: "balance" }}>{p.name}</h1>
              <div className="sh-mono" style={{ fontSize: 22 }}>{priceLabel(price)}</div>
              {p.blurb && <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "var(--ink-muted)", textWrap: "pretty" }}>{p.blurb}</p>}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); add(); }} style={{ display: "flex", flexDirection: "column", gap: 22, margin: 0 }}>
              <div ref={optsRef} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {p.options.filter((o) => o.values.length > 1).map((o) => {
                  const color = isColorOption(o.name);
                  return (
                    <fieldset key={o.name} style={{ border: 0, margin: 0, padding: 0 }}>
                      <legend className="sh-over pd-lab"><span>{o.name}</span><b>{sel[o.name] ?? `Select a ${o.name.toLowerCase()}`}</b></legend>
                      <div className="pd-row" role="radiogroup" aria-label={o.name}>
                        {o.values.map((v) => {
                          const out = !inStock(o.name, v.name), on = sel[o.name] === v.name;
                          return color
                            ? <button key={v.name} type="button" className="sh-sw" role="radio" aria-checked={on} aria-label={out ? `${v.name}, sold out` : v.name} title={v.name}
                                disabled={out} style={{ background: v.swatch ?? "var(--surface-sunken)" }} onClick={() => setSel((s) => ({ ...s, [o.name]: v.name }))} />
                            : <button key={v.name} type="button" className="sh-chip" role="radio" aria-checked={on} aria-label={out ? `${v.name}, sold out` : undefined}
                                disabled={out} onClick={() => setSel((s) => ({ ...s, [o.name]: v.name }))}>{v.name}</button>;
                        })}
                      </div>
                    </fieldset>
                  );
                })}
              </div>
              <div className="pd-buy" ref={buyRef}>
                <div className="sh-step">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <output aria-live="polite">{qty}</output>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
                </div>
                <button className="sh-btn lg" type="submit" disabled={!!missing || unavailable}>{addLabel}</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="sh-over" style={{ fontSize: 10, color: sub >= SHIP_FREE ? "var(--success)" : "var(--ink-muted)" }}>{shipMsg}</div>
                <div className="sh-ship"><i style={{ width: `${Math.min(100, (sub / SHIP_FREE) * 100)}%` }} /></div>
              </div>
            </form>

            <ul className="pd-perks">
              <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17" cy="17.5" r="1.5" /></svg>{shipsIn(p.cat)}</li>
              <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" /></svg>Free returns within 30 days</li>
            </ul>

            <div className="sh-acc">
              {p.details.length > 0
                ? <details open><summary className="sh-over">Details</summary><div className="body"><ul>{p.details.map((d) => <li key={d}>{d}</li>)}</ul></div></details>
                : p.descriptionHtml.replace(/<[^>]+>/g, "").trim().length > p.blurb.length + 1 &&
                  <details open><summary className="sh-over">Details</summary><div className="body" dangerouslySetInnerHTML={{ __html: p.descriptionHtml }} /></details>}
              {p.care && <details><summary className="sh-over">Care</summary><div className="body">{p.care}</div></details>}
              <details><summary className="sh-over">Shipping &amp; returns</summary><div className="body">Orders over $50 ship free in the US. Merch and gear ship separately from coffee, which is roasted to order. Unused items can be returned within 30 days.</div></details>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="pd-rel" aria-labelledby="pd-rel-h">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, marginBottom: 28, flexWrap: "wrap" }}>
              <h2 className="sh-disp" id="pd-rel-h" style={{ fontSize: "clamp(28px,3.4vw,48px)" }}>Pairs well with</h2>
              <Link className="sh-over" href={COLLECTION_PATH.all} style={{ borderBottom: "1px solid currentColor", paddingBottom: 3 }}>Shop all</Link>
            </div>
            <ul className="sh-grid">{related.map((x) => <MerchCard key={x.handle} p={x} />)}</ul>
          </section>
        )}
      </div>

      <div className={"pd-sticky" + (sticky ? " on" : "")} aria-hidden={!sticky}>
        <div style={{ minWidth: 0 }}>
          <div className="nm">{p.name}</div>
          <div className="sh-mono" style={{ fontSize: 13, color: "var(--ink-muted)" }}>{priceLabel(price)}</div>
        </div>
        <button type="button" className="sh-btn" tabIndex={sticky ? 0 : -1} disabled={unavailable} onClick={add}>{missing ? `Select a ${missing.name.toLowerCase()}` : unavailable ? "Sold out" : "Add to cart"}</button>
      </div>
      <CartDrawer />
    </main>
  );
}
