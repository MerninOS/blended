"use client";
// Retail ("Coffee Lab"): buy one of our coffees by the bag, or build a blend
// (ShopView.jsx). Checkout happens from the cart drawer.
import { useEffect, useRef, useState } from "react";
import type { SelItem, ShopSizeId, StockCoffee } from "@/lib/domain/types";
import {
  G_PER_LB, MAX_BAGS, SHIP_FREE, SHOP_SIZES, bagPrice, minsFit, minsTotalG, money, rampColor, retailSel,
  roastName, roastOf, shippingFor, stockBagPrice, weighted, type ShopSize,
} from "@/lib/domain/coffee";
import { Btn, LineItem, Photo, Pill, RuleHead, Step, Stepper, disp, mono, over } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { useCatalog } from "./catalog-context";
import { BlendRatios, TastingWheel } from "./BlendBuilder";
import { BoxHero, type HeroOption } from "./BoxHero";
import { BlendCard, BoxViewer } from "./BlendCard";
import { CartDrawer } from "./CartDrawer";
import { CoffeeReviews } from "./CoffeeReviews";
import { cartStore } from "./cart-store";
import { trackAddToCart, trackProductView } from "@/components/tracking/analytics";

/** `initialSkuId` preselects a coffee (its /coffees/[handle] page); choosing another updates the URL. */
export function ShopView({ initialSkuId, productPage = false, intro }: { initialSkuId?: string; productPage?: boolean; intro?: React.ReactNode } = {}) {
  const { stock, idx } = useCatalog();
  const [mode, setMode] = useState<"shop" | "blend">("shop");
  const [skuId, setSkuIdState] = useState(initialSkuId ?? stock[0]?.id ?? "");
  const setSkuId = (id: string) => {
    setSkuIdState(id);
    if (productPage && id !== skuId) history.replaceState(history.state, "", `/coffees/${id}`);
  };
  const [sel, setSel] = useState<SelItem[]>([]);
  const [roast, setRoast] = useState<number | null>(null);
  const [blendName, setBlendName] = useState("");
  const [sizeId, setSizeId] = useState<ShopSizeId>("1lb");
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const sku = stock.find((s) => s.id === skuId) ?? stock[0];
  const isBlend = mode === "blend";
  const emptyBlend = isBlend && sel.length === 0;
  const size = SHOP_SIZES.find((s) => s.id === sizeId)!;

  const effRoast = isBlend ? (roast != null ? roast : (sel.length ? roastOf(sel, idx) : 3)) : (sku?.roast ?? 3);
  const perLb = isBlend ? (sel.length ? retailSel(sel, idx) : 0) : 0;
  const priceFor = (s: ShopSize) => (isBlend ? bagPrice(perLb, s) : sku ? stockBagPrice(sku, s) : 0);
  const vals = isBlend ? weighted(sel, idx, roast) : (sku?.notes ?? {});
  const name = isBlend ? (blendName.trim() || "Your blend") : (sku?.name ?? "");

  const unit = priceFor(size);
  const goods = unit * qty;
  const shipping = shippingFor(goods);
  const total = goods + shipping;
  const toFree = Math.max(0, SHIP_FREE - goods);

  const batchG = size.lb * qty * G_PER_LB;
  const minsOk = !isBlend || !sel.length || minsFit(sel, batchG, idx);
  const soldOut = !isBlend && !!sku?.variants[size.id] && !sku.variants[size.id]!.available;
  const blocked = emptyBlend || qty < 1 || !minsOk || soldOut || !sku && !isBlend;
  const blocker = emptyBlend ? "Add at least one coffee to your blend."
    : !minsOk ? `${qty} × ${size.label} is ${Math.round(batchG).toLocaleString()} g — these coffees need ${minsTotalG(sel, idx).toLocaleString()} g between them. Order a bigger size, more bags, or drop one.`
    : soldOut ? `${sku?.name} is sold out in ${size.label}.`
    : null;

  // Links from emails and the footer: /?mode=blend opens the builder, /?cart=open the cart.
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get("mode") === "blend") setMode("blend"); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of the URL on mount
    if (q.get("cart") === "open") cartStore.setOpen(true);
  }, []);

  // A coffee counts as viewed when it's the one on screen in "Our coffees".
  const viewedKey = !isBlend && sku ? `${sku.id}-${size.id}` : null;
  useEffect(() => {
    if (!viewedKey || !sku) return;
    const v = sku.variants[size.id];
    trackProductView({ kind: "stock", name: sku.name, price: stockBagPrice(sku, size), productGid: sku.gid, variantGid: v?.id || undefined,
      variantName: size.label, image: sku.image, url: `${location.origin}/coffees/${sku.id}` });
  }, [viewedKey]); // eslint-disable-line react-hooks/exhaustive-deps -- fire once per coffee+size shown

  const pageRef = useRef<HTMLDivElement>(null), blendTopRef = useRef<HTMLDivElement>(null);
  const scrollToEl = (el: HTMLElement | null, pad: number) => requestAnimationFrame(() => {
    if (!el) return;
    const top = el.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--topbar-h")) || 52) - pad;
    scrollTo({ top, behavior: "smooth" });
  });
  const addToCart = () => {
    if (blocked) return;
    if (isBlend) {
      cartStore.add({ kind: "blend", key: null, sizeId, sizeLabel: size.label, name, qty, unit, roast: effRoast, roastOverride: roast, sel,
        parts: sel.map((x) => ({ id: x.id, pct: x.pct, name: idx.get(x.id)?.name ?? x.id })) }, true);
    } else if (sku) {
      cartStore.add({ kind: "stock", key: `${sku.id}-${sizeId}`, skuId: sku.id, sizeId, sizeLabel: size.label, name, qty, unit, roast: effRoast });
    }
    const items = cartStore.get().items;
    trackAddToCart({ kind: isBlend ? "blend" : "stock", name, price: unit, quantity: qty, variantName: size.label,
      productGid: isBlend ? undefined : sku?.gid, variantGid: isBlend ? undefined : sku?.variants[size.id]?.id || undefined, image: isBlend ? null : sku?.image },
      items.reduce((a, x) => a + x.unit * x.qty, 0), items.map((x) => x.name));
    setJustAdded(true); setTimeout(() => setJustAdded(false), 1600);
    if (isBlend) setTimeout(() => { setSel([]); setRoast(null); setBlendName(""); setQty(1); }, 320);
    else setQty(1);
  };
  const pick = (id: "shop" | "blend") => { setMode(id); scrollToEl(pageRef.current, 8); };
  const minBag = stock.length ? Math.min(...stock.map((s) => stockBagPrice(s, SHOP_SIZES[0]))) : 0;
  const options: HeroOption[] = [
    { id: "shop", icon: "pkg", title: "Our coffees", desc: "Single origins and house blends we roast every week. Pick one and pick a size.", meta: `${stock.length} on the roster · from ${money(minBag)} a bag` },
    { id: "blend", icon: "flame", title: "Build your own blend", desc: "Combine up to four green lots, move the ratios, set the roast, and watch the cup change as you go.", meta: "Priced from your ratios · no extra fee" },
  ];

  const sizeStep = (n: number) => (
    <Step n={n} title="Choose your bag size">
      <div role="radiogroup" aria-label="Bag size" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 }}>
        {SHOP_SIZES.map((s) => {
          const on = s.id === sizeId, p = priceFor(s);
          return (
            <button type="button" role="radio" aria-checked={on} key={s.id} onClick={() => setSizeId(s.id)} style={{ padding: "13px 14px", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5,
              border: on ? "1.5px solid var(--brand)" : "1px solid var(--hairline-strong)", borderRadius: "var(--r-md)", background: on ? "var(--brand-soft)" : "var(--surface)", transition: "all var(--dur) var(--ease)" }}>
              <span style={{ ...disp, fontSize: 15, color: "var(--ink)", lineHeight: 1 }}>{s.label}</span>
              <span style={{ ...mono, fontSize: 14, color: on ? "var(--brand-hover)" : "var(--ink)" }}>{money(p)}</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--ink-subtle)" }}>{s.note} · {money(p / s.lb)}/lb</span>
            </button>
          );
        })}
      </div>
    </Step>
  );

  return (<>
    {intro && mode === "shop" ? intro : <BoxHero mode={mode} onPick={pick} options={options} />}
    <div ref={pageRef} className="pv-page" style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "24px 24px 96px", display: "flex", flexDirection: "column", gap: 40 }}>
      {isBlend ? <>
        <div ref={blendTopRef} />
        <Step n={2} title="Choose your coffees">
          <BlendRatios sel={sel} setSel={setSel} batchG={batchG} batchLabel={`${qty} × ${size.label}`} retail sections={["add"]} />
        </Step>

        <Step n={3} title="Adjust your ratios">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(24px,3vw,40px)", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 420px", minWidth: 0 }}>
              <BlendRatios sel={sel} setSel={setSel} roast={roast} setRoast={setRoast} retail
                blendName={blendName} setBlendName={setBlendName}
                batchG={batchG} batchLabel={`${qty} × ${size.label}`} sections={["ratios", "roast", "name"]}
                nameHint="Your name for it. It prints on the bag alongside the roast date, and you can reorder it in one click." />
            </div>
            <div className="pl-cup-col" style={{ flex: "1 1 360px", minWidth: 320, position: "sticky", top: 96 }}>
              <TastingWheel vals={vals} roast={effRoast} empty={emptyBlend} title="The cup" />
            </div>
          </div>
        </Step>

        {sizeStep(4)}
      </> : <>
        <Step n={2} title="Pick a coffee">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(24px,3vw,40px)", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 420px", minWidth: 0 }}><ShopGrid stock={stock} skuId={sku?.id} setSkuId={setSkuId} size={size} /></div>
            <div className="pl-cup-col" style={{ flex: "1 1 360px", minWidth: 320, position: "sticky", top: 96 }}>
              <TastingWheel vals={vals} roast={effRoast} empty={!sku} title={sku?.name} note="Cupping scores from our lab on the lot in the bag right now." />
            </div>
          </div>
        </Step>
        {sizeStep(3)}
      </>}

      <Step n={isBlend ? 5 : 4} title="Checkout">
        {isBlend && !emptyBlend && (
          <div className="bc-preview" style={{ display: "grid", gridTemplateColumns: "minmax(220px,1fr) minmax(0,2fr)", gap: 24, alignItems: "stretch", marginBottom: 8 }}>
            <div style={{ background: "var(--surface-sunken)", borderRadius: "var(--r-lg)", minHeight: 280, overflow: "hidden", position: "relative" }}><div style={{ position: "absolute", inset: 0 }}><BoxViewer /></div></div>
            <div className="bc-card" style={{ minWidth: 0 }}><BlendCard sel={sel} vals={vals} name={name} sizeLabel={size.label} roast={effRoast} /></div>
          </div>
        )}
        <section>
          <RuleHead label="Your order" right={<span style={{ ...mono, fontSize: 11.5, color: "var(--ink-subtle)", whiteSpace: "nowrap" }}>{qty} × {size.label}</span>} />
          <LineItem k={`${name} · ${roastName(effRoast)}`} sub={`${qty} × ${size.label} · whole bean`} v={goods} />
          <LineItem k="Shipping" sub={shipping === 0 ? "Free over $50" : "Flat rate, 2–3 days"} v={shipping} />
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0 0" }}>
            <span style={{ flex: 1, ...over, fontSize: 10.5, color: "var(--ink-muted)" }}>Total</span>
            <span style={{ ...mono, fontSize: 12, color: "var(--ink-subtle)" }}>{money(unit)}/bag</span>
            <span style={{ ...disp, fontSize: 30, color: "var(--ink)", lineHeight: 1 }}>{money(total)}</span>
          </div>
          <p style={{ margin: "10px 0 0", fontFamily: "var(--font-sans)", fontSize: 12, lineHeight: 1.55, color: "var(--ink-subtle)", maxWidth: "70ch" }}>
            {toFree > 0 ? `Add ${money(toFree)} for free shipping. ` : ""}Whole bean only, roasted Tuesday and Thursday and shipped the same afternoon. Blends are cupped once before the first bag goes out, which can add a day.
          </p>
        </section>
      </Step>

      {/* sticky bar */}
      <div className="co-confirmbar" style={{ position: "sticky", bottom: 16, background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-pop)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div className="cb-icon" style={{ width: 44, height: 44, background: "var(--surface-sunken)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", color: rampColor(effRoast), flexShrink: 0 }}><Icon name={isBlend ? "flame" : "pkg"} size={20} stroke={2} /></div>
        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          <div className="cb-title" style={{ ...disp, fontSize: 18, color: "var(--ink)", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
          <div className="cb-meta" aria-live="polite" style={{ fontSize: 12.5, color: blocker ? "var(--danger)" : "var(--ink-muted)", fontFamily: "var(--font-sans)", marginTop: 4 }}>
            {blocker || <span style={mono}>{qty} × {size.label} · whole bean</span>}
          </div>
        </div>
        <div className="cb-qty" style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
          <Stepper glyph="−" side="l" label="Fewer bags" onClick={() => setQty((q) => Math.max(1, q - 1))} />
          <span aria-label={`${qty} bags`} style={{ minWidth: 46, textAlign: "center", ...mono, fontSize: 14, color: "var(--ink)" }}>{qty}</span>
          <Stepper glyph="+" side="r" label="More bags" onClick={() => setQty((q) => Math.min(MAX_BAGS, q + 1))} />
        </div>
        <div className="cb-price" style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="cb-figure" style={{ ...disp, fontSize: 28, color: "var(--ink)", lineHeight: 1 }}>{money(total)}</div>
        </div>
        <Btn variant="primary" size="lg" disabled={blocked} icon={<Icon name="arrow" size={15} stroke={2} />} onClick={addToCart}>{justAdded ? "Added" : "Add to cart"}</Btn>
      </div>
    </div>
    <CartDrawer onNewBlend={() => { setMode("blend"); scrollToEl(blendTopRef.current ?? pageRef.current, 16); }} />
  </>);
}

// ---- retail coffee grid: photo, name, cup notes, shelf price ----
function ShopGrid({ stock, skuId, setSkuId, size }: { stock: StockCoffee[]; skuId?: string; setSkuId: (id: string) => void; size: ShopSize }) {
  return (
    <div className="sg-grid" role="radiogroup" aria-label="Our coffees" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 12, alignItems: "start" }}>
      {stock.map((s) => {
        const on = s.id === skuId;
        return (
          <div key={s.id} className="sg-card" role="radio" aria-checked={on} tabIndex={0} onClick={() => setSkuId(s.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSkuId(s.id); } }}
            style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 9, padding: 11, textAlign: "left", transition: "all var(--dur) var(--ease)",
              border: on ? "1.5px solid var(--brand)" : "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: on ? "var(--brand-soft)" : "var(--surface)" }}>
            <Photo src={s.image} alt={s.name} cls="sg-photo" placeholder={s.name} style={{ aspectRatio: "1 / 1" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "var(--r-sm)", flexShrink: 0, background: rampColor(s.roast), boxShadow: "inset 0 0 0 1px rgba(0,0,0,.14)" }} />
              {/* A real link so crawlers find each coffee's page; a click still just selects it. */}
              <a href={`/coffees/${s.id}`} onClick={(e) => { if (!e.metaKey && !e.ctrlKey && !e.shiftKey) e.preventDefault(); }} tabIndex={-1}
                style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600, color: "var(--ink)", textDecoration: "none" }}>{s.name}</a>
              {s.tag && <Pill variant="tomato" dot pulse>{s.tag}</Pill>}
            </div>
            <div style={{ ...over, fontSize: 9, color: "var(--ink-subtle)" }}>{roastName(s.roast)} · {s.sub.split(" · ")[0]}</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, lineHeight: 1.5, color: "var(--ink-muted)", flex: 1 }}>{s.blurb}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 7, paddingTop: 2, borderTop: "1px solid var(--hairline)" }}>
              <span style={{ ...mono, fontSize: 14, color: "var(--ink)", paddingTop: 7 }}>{money(stockBagPrice(s, size))}</span>
              <span style={{ ...mono, fontSize: 11, color: "var(--ink-subtle)" }}>/ {size.label}</span>
            </div>
            <CoffeeReviews coffee={s} compact />
          </div>
        );
      })}
    </div>
  );
}
