"use client";
// Coffee Lab (ShopView.jsx): build a blend — choose coffees, set the ratios and
// roast, pick a bag size — then add it to the cart. Single coffees by the bag
// live on /coffees. Checkout happens from the cart drawer.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SelItem, ShopSizeId } from "@/lib/domain/types";
import {
  G_PER_LB, MAX_BAGS, SHIP_FREE, SHOP_SIZES, bagPrice, minsFit, minsTotalG, money, rampColor, retailSel,
  roastName, roastOf, shippingFor, weighted, type ShopSize,
} from "@/lib/domain/coffee";
import { Btn, LineItem, RuleHead, Step, Stepper, disp, mono, over } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { useCatalog } from "./catalog-context";
import { BlendRatios, TastingWheel } from "./BlendBuilder";
import { BoxHero } from "./BoxHero";
import { BlendCard, BoxViewer, bcCardData } from "./BlendCard";
import { CartDrawer } from "./CartDrawer";
import { cartStore } from "./cart-store";
import { trackAddToCart } from "@/components/tracking/analytics";

export function ShopView() {
  const { idx } = useCatalog();
  const router = useRouter();
  const [sel, setSel] = useState<SelItem[]>([]);
  const [roast, setRoast] = useState<number | null>(null);
  const [blendName, setBlendName] = useState("");
  const [sizeId, setSizeId] = useState<ShopSizeId>("1lb");
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const emptyBlend = sel.length === 0;
  const size = SHOP_SIZES.find((s) => s.id === sizeId)!;
  const effRoast = roast != null ? roast : (sel.length ? roastOf(sel, idx) : 3);
  const perLb = sel.length ? retailSel(sel, idx) : 0;
  const priceFor = (s: ShopSize) => bagPrice(perLb, s);
  const vals = weighted(sel, idx, roast);
  const name = blendName.trim() || "Your blend";

  const unit = priceFor(size);
  const goods = unit * qty;
  const shipping = shippingFor(goods);
  const total = goods + shipping;
  const toFree = Math.max(0, SHIP_FREE - goods);

  const batchG = size.lb * qty * G_PER_LB;
  const minsOk = !sel.length || minsFit(sel, batchG, idx);
  const blocked = emptyBlend || qty < 1 || !minsOk;
  const blocker = emptyBlend ? "Add at least one coffee to your blend."
    : !minsOk ? `${qty} × ${size.label} is ${Math.round(batchG).toLocaleString()} g — these coffees need ${minsTotalG(sel, idx).toLocaleString()} g between them. Order a bigger size, more bags, or drop one.`
    : null;

  const startRef = useRef<HTMLDivElement>(null);
  const scrollToStart = () => requestAnimationFrame(() => {
    const el = startRef.current; if (!el) return;
    const top = el.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--topbar-h")) || 52) - 16;
    scrollTo({ top, behavior: "smooth" });
  });
  const addToCart = () => {
    if (blocked) return;
    cartStore.add({ kind: "blend", key: null, sizeId, sizeLabel: size.label, name, qty, unit, roast: effRoast, roastOverride: roast, sel,
      parts: sel.map((x) => ({ id: x.id, pct: x.pct, name: idx.get(x.id)?.name ?? x.id })) }, true);
    const items = cartStore.get().items;
    trackAddToCart({ kind: "blend", name, price: unit, quantity: qty, variantName: size.label, image: null },
      items.reduce((a, x) => a + x.unit * x.qty, 0), items.map((x) => x.name));
    setJustAdded(true); setTimeout(() => setJustAdded(false), 1600);
    setTimeout(() => { setSel([]); setRoast(null); setBlendName(""); setQty(1); }, 320);
  };
  // Deep links: #build (or ?mode=blend) scrolls to the first step, ?blend=lotA:70,lotB:30 starts from a
  // recipe (the landing page's house blend, a coffee page), ?cart=open opens the cart. Old #coffees links
  // (the roster used to live here) go to /coffees.
  useEffect(() => {
    const q = new URLSearchParams(location.search), h = location.hash.slice(1);
    if (h === "coffees" || q.get("mode") === "shop") { router.replace("/coffees"); return; }
    const preset = (q.get("blend") || "").split(",").map((x) => x.split(":")).filter(([id, p]) => idx.has(id) && Number(p) > 0).map(([id, p]) => ({ id, pct: Math.round(Number(p)) }));
    const usePreset = preset.length > 0 && preset.length <= 4 && preset.reduce((a, s) => a + s.pct, 0) === 100;
    if (usePreset || h === "build" || q.get("mode") === "blend") setTimeout(() => { if (usePreset) setSel(preset); scrollToStart(); }, 350);
    if (q.get("cart") === "open") cartStore.setOpen(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- one-time read of the URL on mount

  return (<>
    <BoxHero cta={{ label: "Build your blend", onClick: scrollToStart }} />
    <div className="pv-page" style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "24px 24px 96px", display: "flex", flexDirection: "column", gap: 40 }}>
      <div ref={startRef} id="build" style={{ display: "flex", flexDirection: "column", gap: 40, scrollMarginTop: "calc(var(--topbar-h) + 16px)" }}>
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
      </div>

      <Step n={4} title="Choose your bag size">
        <div role="radiogroup" aria-label="Bag size" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 }}>
          {SHOP_SIZES.map((s) => {
            const on = s.id === sizeId, p = priceFor(s);
            return (
              <button type="button" role="radio" aria-checked={on} key={s.id} onClick={() => setSizeId(s.id)} style={{ padding: "13px 14px", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5,
                border: on ? "1.5px solid var(--brand)" : "1px solid var(--hairline-strong)", borderRadius: "var(--r-md)", background: on ? "var(--brand-soft)" : "var(--surface)", transition: "all var(--dur) var(--ease)" }}>
                <span style={{ ...disp, fontSize: 15, color: "var(--ink)", lineHeight: 1 }}>{s.label}</span>
                <span style={{ ...mono, fontSize: 14, color: on ? "var(--brand-hover)" : "var(--ink)" }}>{emptyBlend ? "—" : money(p)}</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--ink-subtle)" }}>{s.note}{emptyBlend ? "" : ` · ${money(p / s.lb)}/lb`}</span>
              </button>
            );
          })}
        </div>
      </Step>

      <Step n={5} title="Checkout">
        {!emptyBlend && (
          <div className="bc-preview" style={{ display: "grid", gridTemplateColumns: "minmax(220px,1fr) minmax(0,2fr)", gap: 24, alignItems: "stretch", marginBottom: 8 }}>
            <div style={{ background: "var(--bag-stage)", borderRadius: "var(--r-lg)", minHeight: 280, overflow: "hidden", position: "relative" }}><div style={{ position: "absolute", inset: 0 }}><BoxViewer card={bcCardData({ sel, vals, name, sizeLabel: size.label, roast: effRoast, idx })} /></div></div>
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
        <div className="cb-icon" style={{ width: 44, height: 44, background: "var(--surface-sunken)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", color: rampColor(effRoast), flexShrink: 0 }}><Icon name="flame" size={20} stroke={2} /></div>
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
    <CartDrawer onNewBlend={scrollToStart} />
  </>);
}
