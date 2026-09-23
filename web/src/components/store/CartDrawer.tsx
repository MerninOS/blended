"use client";
// Retail cart drawer + header button (CartDrawer.jsx). Checkout hands the cart
// to the server, which re-prices it and returns Shopify's hosted checkout URL.
import { useEffect, useRef, useState } from "react";
import { money, rampColor, roastName, shippingFor, SHIP_FREE } from "@/lib/domain/coffee";
import type { CheckoutResponse, RetailLine } from "@/lib/domain/requests";
import { Icon } from "@/components/ui/Icon";
import { Btn, Stepper, disp, mono, over } from "@/components/ui/primitives";
import { cartStore, useCart } from "./cart-store";
import { BC_COLORS } from "./BlendCard";

export function CartButton() {
  const { items } = useCart();
  const n = items.reduce((a, x) => a + x.qty, 0);
  return (
    <button type="button" className="cart-btn" onClick={() => cartStore.setOpen(true)} aria-label={`Cart, ${n} item${n === 1 ? "" : "s"}`}
      style={{ display: "flex", alignItems: "center", gap: 8, height: 34, padding: "0 12px", border: "1px solid var(--hairline-strong)", borderRadius: "var(--r-md)", background: "var(--surface)", cursor: "pointer", color: "var(--ink)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", transition: "background var(--dur) var(--ease)" }}>
      <Icon name="pkg" size={15} stroke={2} />
      <span className="cart-label">Cart</span>
      <span style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", background: n ? "var(--brand)" : "var(--surface-sunken)", color: n ? "#fff" : "var(--ink-subtle)", fontSize: 10.5, letterSpacing: 0, fontVariantNumeric: "tabular-nums", transition: "background var(--dur) var(--ease)" }}>{n}</span>
    </button>
  );
}

export function CartDrawer({ onNewBlend }: { onNewBlend?: () => void }) {
  const { items, open, freshId } = useCart();
  const [shown, setShown] = useState(open);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // keep the drawer mounted through its slide-out
  if (open && !shown) setShown(true);
  useEffect(() => { if (!open && shown) { const t = setTimeout(() => setShown(false), 260); return () => clearTimeout(t); } }, [open, shown]);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") cartStore.setOpen(false); };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [open]);
  if (!shown) return null;

  const goods = items.reduce((a, x) => a + x.unit * x.qty, 0);
  const shipping = shippingFor(goods);
  const toFree = Math.max(0, SHIP_FREE - goods);
  const last = freshId ? items.find((x) => x.id === freshId) : null;
  const close = () => { setErr(null); cartStore.setOpen(false); };

  const checkout = async () => {
    setBusy(true); setErr(null);
    const lines: RetailLine[] = items.map((it) => it.kind === "stock"
      ? { kind: "stock", skuId: it.skuId!, sizeId: it.sizeId, qty: it.qty }
      : { kind: "blend", name: it.name, sel: it.sel ?? [], roast: it.roastOverride ?? null, sizeId: it.sizeId, qty: it.qty });
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lines }) });
      const j = await res.json() as CheckoutResponse;
      if (j.url) { window.location.assign(j.url); return; }
      setErr(j.error || "Checkout failed. Please try again.");
    } catch { setErr("Couldn't reach checkout. Check your connection and try again."); }
    setBusy(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900 }}>
      <div onClick={close} style={{ position: "absolute", inset: 0, background: "rgba(26,26,24,.38)", opacity: open ? 1 : 0, transition: "opacity 240ms var(--ease)" }} />
      <aside role="dialog" aria-modal="true" aria-label="Cart" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(420px,100vw)", height: "100dvh", background: "var(--surface)", boxShadow: "var(--shadow-modal)", display: "flex", flexDirection: "column",
        transform: open ? "none" : "translateX(100%)", transition: "transform 260ms cubic-bezier(.2,.7,.2,1)", animation: "cart-in 260ms cubic-bezier(.2,.7,.2,1)" }}>
        <div className="cart-drawer-head" style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 20px", borderBottom: "1px solid var(--hairline)" }}>
          <span style={{ ...disp, fontSize: 20, color: "var(--ink)", lineHeight: 1, flex: 1 }}>Your cart</span>
          <span style={{ ...mono, fontSize: 11.5, color: "var(--ink-subtle)" }}>{items.reduce((a, x) => a + x.qty, 0)} bags</span>
          <button ref={closeRef} type="button" onClick={close} aria-label="Close cart" style={{ width: 44, height: 44, marginRight: -10, border: "none", background: "none", cursor: "pointer", color: "var(--ink-muted)", fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        {last && (
          <div className="cart-drawer-note" style={{ margin: "14px 20px 0", padding: "11px 13px", borderRadius: "var(--r-md)", background: "var(--surface-sunken)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.45, color: "var(--ink)", flex: 1 }}>{last.name} is saved. The builder is cleared for your next blend.</span>
            <button type="button" className="bb-add" onClick={() => { close(); onNewBlend?.(); }} style={{ height: 30, padding: "0 10px", border: "1px solid var(--hairline-strong)", background: "var(--surface)", borderRadius: "var(--r-sm)", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap", color: "var(--ink)", transition: "background var(--dur) var(--ease), color var(--dur) var(--ease)" }}>Build another</button>
          </div>
        )}

        <div className="cart-drawer-body" style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain", padding: "4px 20px" }}>
          {items.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
              <span style={{ ...disp, fontSize: 16, color: "var(--ink)" }}>Cart is empty</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-muted)" }}>Pick one of our coffees or build a blend.</span>
            </div>
          ) : items.map((it) => (
            <div key={it.id} style={{ display: "flex", gap: 12, padding: "16px 0", borderBottom: "1px solid var(--hairline)", animation: "co-fade 240ms var(--ease)" }}>
              <div style={{ width: 44, height: 52, flexShrink: 0, borderRadius: "var(--r-sm)", background: "#F0EDE5", border: "1px solid var(--hairline)", display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
                {(it.parts?.length ? it.parts : [{ pct: 100 }]).map((p, i) => <span key={i} style={{ flex: `${Math.max(6, p.pct)} 1 0`, maxHeight: it.parts ? "none" : 10, background: it.parts ? BC_COLORS[i % BC_COLORS.length] : rampColor(it.roast) }} />)}
              </div>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ ...disp, fontSize: 14.5, color: "var(--ink)", lineHeight: 1.15, flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{it.name}</span>
                  <span style={{ ...mono, fontSize: 13, color: "var(--ink)" }}>{money(it.unit * it.qty)}</span>
                </div>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-muted)" }}>{it.kind === "blend" ? "Custom blend" : "Our coffee"} · {it.sizeLabel} · {roastName(it.roast)} roast</span>
                {it.parts && <span style={{ ...mono, fontSize: 11, color: "var(--ink-subtle)", lineHeight: 1.45 }}>{it.parts.map((p) => `${p.pct}% ${p.name}`).join(" · ")}</span>}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Stepper glyph="−" side="l" onClick={() => cartStore.qty(it.id, it.qty - 1)} />
                    <span style={{ minWidth: 34, textAlign: "center", ...mono, fontSize: 13, color: "var(--ink)" }}>{it.qty}</span>
                    <Stepper glyph="+" side="r" onClick={() => cartStore.qty(it.id, it.qty + 1)} />
                  </div>
                  <span style={{ flex: 1 }} />
                  <button type="button" onClick={() => cartStore.remove(it.id)} style={{ minHeight: 36, padding: "0 4px", border: "none", background: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-subtle)", textDecoration: "underline", textUnderlineOffset: 3 }}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-foot" style={{ borderTop: "1px solid var(--hairline)", padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-muted)" }}><span>Subtotal</span><span style={mono}>{money(goods)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-muted)" }}><span>Shipping</span><span style={mono}>{shipping ? money(shipping) : "Free"}</span></div>
            {toFree > 0 && <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-subtle)" }}>Add {money(toFree)} for free shipping.</span>}
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ ...over, fontSize: 10.5, color: "var(--ink-muted)" }}>Total</span>
              <span style={{ ...disp, fontSize: 26, color: "var(--ink)", lineHeight: 1 }}>{money(goods + shipping)}</span>
            </div>
            {err && <p role="alert" style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.45, color: "var(--danger)" }}>{err}</p>}
            <Btn variant="primary" size="lg" disabled={busy} icon={<Icon name="arrow" size={15} stroke={2} />} onClick={checkout}>{busy ? "Opening checkout…" : "Checkout"}</Btn>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--ink-subtle)", textAlign: "center" }}>Secure checkout by Shopify · taxes calculated at checkout</span>
          </div>
        )}
      </aside>
    </div>
  );
}
