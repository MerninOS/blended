"use client";
// One of our coffees (Coffee Product.html): gallery, tasting words and roast,
// grind + bag size, quantity and add to cart, free-shipping progress, origin
// facts, a brew recipe for its roast, the producer story, a nudge into the
// Coffee Lab, related coffees and a sticky add bar on mobile.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { StockCoffee } from "@/lib/domain/types";
import { GRINDS, SHIP_FREE } from "@/lib/domain/coffee";
import { priceLabel } from "@/lib/merch-types";
import { CartDrawer } from "@/components/store/CartDrawer";
import { useCart } from "@/components/store/cart-store";
import { CoffeeReviews } from "@/components/store/CoffeeReviews";
import { MerchImage } from "@/components/store/merch/MerchCard";
import { trackProductView } from "@/components/tracking/analytics";
import { CoffeeCard, RoastMeter, addCoffee, defaultSize, imagesOf, inStock, kindLabel, priceOf, sizesOf, tastingOf } from "./shelf";

const BREW = {
  light: { m: "Pour over", r: [["Dose", "20 g"], ["Water", "320 g"], ["Temp", "96°C"], ["Time", "3:00"]], t: "Grind medium-fine. Bloom with 50 g for 40 seconds, then pour in slow circles to 320 g." },
  mid: { m: "Pour over or drip", r: [["Dose", "22 g"], ["Water", "350 g"], ["Temp", "94°C"], ["Time", "3:30"]], t: "Grind medium. Bloom for 30 seconds, then pour in two even stages. Works the same at 60 g per liter in a batch brewer." },
  dark: { m: "Espresso", r: [["Dose", "18 g"], ["Yield", "38 g"], ["Temp", "92°C"], ["Time", "0:28"]], t: "Pull a 1:2 ratio in 26 to 30 seconds. For French press, use 30 g to 500 g water and steep 4 minutes." },
} as const;

export function CoffeeProductView({ c, related, blendHref }: { c: StockCoffee; related: StockCoffee[]; blendHref: string }) {
  const sizes = sizesOf(c);
  const [sizeId, setSizeId] = useState(defaultSize(c).id);
  const [grind, setGrind] = useState<string>(GRINDS[0]);
  const [qty, setQty] = useState(1);
  const [sticky, setSticky] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);
  const { items } = useCart();
  const size = sizes.find((s) => s.id === sizeId) ?? sizes[0];
  const unit = priceOf(c, size), soldOut = !inStock(c, size);
  const words = tastingOf(c), imgs = imagesOf(c);
  const brew = BREW[c.roast <= 2 ? "light" : c.roast === 3 ? "mid" : "dark"];
  const blend = c.kind === "blend";
  const spec = ([[blend ? "Components" : "Farm", c.farm], ["Producer", c.producer], ["Region", c.origin], ["Altitude", c.altitude], ["Varietal", c.varietal], ["Process", c.process], ["Harvest", c.harvest]] as const)
    .filter(([, v]) => v) as [string, string][];
  const sub = items.reduce((a, x) => a + x.unit * x.qty, 0);
  const shipMsg = sub >= SHIP_FREE ? "Free shipping unlocked" : `${priceLabel(Math.round((SHIP_FREE - sub) * 100) / 100)} away from free shipping`;

  useEffect(() => {
    trackProductView({ kind: "stock", name: c.name, price: priceOf(c, defaultSize(c)), productGid: c.gid, image: c.image, url: `${location.origin}/coffees/${c.id}` });
  }, [c.id]); // eslint-disable-line react-hooks/exhaustive-deps -- once per coffee
  useEffect(() => {
    const el = buyRef.current; if (!el) return;
    const io = new IntersectionObserver(([en]) => setSticky(!en.isIntersecting && en.boundingClientRect.top < 0));
    io.observe(el); return () => io.disconnect();
  }, []);
  const add = () => { if (soldOut) return; addCoffee(c, size, grind, qty, true); setQty(1); };

  return (
    <main className="sh-root">
      <div className="sh-wrap">
        <nav aria-label="Breadcrumb" style={{ paddingTop: 22 }}>
          <ol className="sh-crumbs sh-over">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/coffees">Our coffees</Link></li>
            <li><Link href={`/coffees#${blend ? "blend" : "single"}`}>{kindLabel(c)}</Link></li>
            <li aria-current="page">{c.name}</li>
          </ol>
        </nav>

        <article className="pd">
          <div className="pd-gal" aria-label="Coffee photos">
            {(imgs.length ? imgs : [null]).map((im, i) => (
              <div key={im?.url ?? i} className="sh-media">
                <MerchImage src={im?.url} alt={im?.alt ?? c.name} priority={i === 0} sizes={i === 0 ? "(max-width: 900px) 86vw, 56vw" : "(max-width: 900px) 86vw, 28vw"} label={c.name} />
              </div>
            ))}
          </div>

          <div className="pd-info">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="sh-over" style={{ color: "var(--ink-muted)" }}>{[c.origin, c.process].filter(Boolean).join(" · ") || c.sub}</div>
              <h1 className="sh-disp" style={{ fontSize: "clamp(36px,4.4vw,64px)", textWrap: "balance" }}>{c.name}</h1>
              <div className="sh-mono" style={{ fontSize: 22 }}>{priceLabel(unit)}</div>
              {c.blurb && <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "var(--ink-muted)", textWrap: "pretty" }}>{c.blurb}</p>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "16px 0", borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)" }}>
              {words.length > 0 && <div className="cp-notes">{words.map((w) => <span key={w}>{w}</span>)}</div>}
              <RoastMeter roast={c.roast} wide />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); add(); }} style={{ display: "flex", flexDirection: "column", gap: 22, margin: 0 }}>
              <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                <legend className="sh-over pd-lab"><span>Grind</span><b>{grind}</b></legend>
                <div className="pd-row" role="radiogroup" aria-label="Grind">
                  {GRINDS.map((g) => <button key={g} type="button" className="sh-chip" role="radio" aria-checked={g === grind} onClick={() => setGrind(g)}>{g}</button>)}
                </div>
              </fieldset>
              <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                <legend className="sh-over pd-lab"><span>Bag size</span><b>{size.label}</b></legend>
                <div className="pd-row" role="radiogroup" aria-label="Bag size">
                  {sizes.map((s) => {
                    const out = !inStock(c, s);
                    return (
                      <button key={s.id} type="button" className="sh-chip cp-size" role="radio" aria-checked={s.id === size.id} disabled={out}
                        aria-label={out ? `${s.label}, sold out` : `${s.label}, ${priceLabel(priceOf(c, s))}`} onClick={() => setSizeId(s.id)}>
                        {s.label}<small>{out ? "Sold out" : priceLabel(priceOf(c, s))}</small>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div className="pd-buy" ref={buyRef}>
                <div className="sh-step">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <output aria-live="polite">{qty}</output>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(10, q + 1))}>+</button>
                </div>
                <button className="sh-btn lg" type="submit" disabled={soldOut}>{soldOut ? "Sold out" : `Add to cart · ${priceLabel(unit * qty)}`}</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="sh-over" style={{ fontSize: 10, color: sub >= SHIP_FREE ? "var(--success)" : "var(--ink-muted)" }}>{shipMsg}</div>
                <div className="sh-ship"><i style={{ width: `${Math.min(100, (sub / SHIP_FREE) * 100)}%` }} /></div>
              </div>
            </form>

            <ul className="pd-perks">
              <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 2c1 3 4 4.5 4 8.5a4 4 0 0 1-8 0C8 8 9.5 6.5 9.5 4.5 11 5.5 12 4 12 2z" /><path d="M5 21h14" /></svg>Roasted to order in small batches</li>
              <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17" cy="17.5" r="1.5" /></svg>{c.lead || "Ships in 2–3 business days"}</li>
            </ul>

            <div className="sh-acc">
              {spec.length > 0 && (
                <details open><summary className="sh-over">Origin</summary>
                  <div className="body"><dl className="cp-spec">{spec.map(([k, v]) => <div key={k} style={{ display: "contents" }}><dt className="sh-over">{k}</dt><dd>{v}</dd></div>)}</dl></div>
                </details>
              )}
              <details><summary className="sh-over">How we brew it</summary>
                <div className="body">
                  <div className="sh-over" style={{ fontSize: 10, marginBottom: 10, color: "var(--ink)" }}>{brew.m}</div>
                  <div className="cp-recipe">{brew.r.map(([k, v]) => <div key={k}><span className="sh-over">{k}</span><b>{v}</b></div>)}</div>
                  {brew.t}
                </div>
              </details>
              <details><summary className="sh-over">Shipping &amp; freshness</summary>
                <div className="body">Every bag is roasted after you order and ships within a few days. Orders over $50 ship free in the US. Coffee tastes best 5 to 30 days after the roast date printed on the bag.</div>
              </details>
            </div>
          </div>
        </article>

        {c.story && (
          <section className="cp-story" aria-labelledby="cp-farm-h">
            <div className="sh-media"><MerchImage src={imgs[1]?.url ?? imgs[0]?.url} alt={imgs[1]?.alt ?? c.name} sizes="(max-width: 900px) 100vw, 50vw" label={c.producer || c.farm} /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="sh-over" style={{ color: "var(--ink-muted)" }}>{blend ? "What's in it" : "Who grew it"}</div>
              <h2 className="sh-disp" id="cp-farm-h" style={{ fontSize: "clamp(28px,3.4vw,48px)" }}>{c.producer || c.farm || c.name}</h2>
              <p>{c.story}</p>
            </div>
          </section>
        )}

        {c.reviews && c.reviews.count > 0 && <section style={{ marginTop: "clamp(56px,7vw,100px)" }} aria-label="Reviews"><CoffeeReviews coffee={c} /></section>}

        <section className="cp-blend" aria-labelledby="cp-blend-h">
          <div>
            <h2 className="sh-disp" id="cp-blend-h" style={{ fontSize: "clamp(24px,2.6vw,36px)" }}>Make it part of a <span style={{ color: "var(--brand)" }}>blend.</span></h2>
            <p>{blend ? `Start from ${c.name} and change the ratios or add another coffee.` : `Use ${c.name} as a base and add up to three more coffees. Set the ratios and the roast, and we pack it with your name on it.`}</p>
          </div>
          <Link className="sh-btn lg" href={blendHref}>Build your blend</Link>
        </section>

        {related.length > 0 && (
          <section className="pd-rel" aria-labelledby="pd-rel-h">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, marginBottom: 28, flexWrap: "wrap" }}>
              <h2 className="sh-disp" id="pd-rel-h" style={{ fontSize: "clamp(28px,3.4vw,48px)" }}>Also on the shelf</h2>
              <Link className="sh-over" href="/coffees" style={{ borderBottom: "1px solid currentColor", paddingBottom: 3 }}>All coffees</Link>
            </div>
            <ul className="sh-grid">{related.map((x) => <CoffeeCard key={x.id} c={x} />)}</ul>
          </section>
        )}
      </div>

      <div className={"pd-sticky" + (sticky ? " on" : "")} aria-hidden={!sticky}>
        <div style={{ minWidth: 0 }}>
          <div className="nm">{c.name}</div>
          <div className="sh-mono" style={{ fontSize: 13, color: "var(--ink-muted)" }}>{size.label} · {priceLabel(unit)}</div>
        </div>
        <button type="button" className="sh-btn" tabIndex={sticky ? 0 : -1} disabled={soldOut} onClick={add}>{soldOut ? "Sold out" : "Add to cart"}</button>
      </div>
      <CartDrawer />
    </main>
  );
}
