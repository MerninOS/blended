"use client";
// Private label review + checkout (ConfirmModal "pl" in PortalOther.jsx).
// Net 30 places the order on account; card hands off to Shopify's hosted
// checkout — card numbers never touch this app.
import { useEffect, useState } from "react";
import type { SelItem } from "@/lib/domain/types";
import type { CheckoutResponse, ShipTo, WholesaleOrderRequest } from "@/lib/domain/requests";
import { money, rampColor, roastName, type PlQuote } from "@/lib/domain/coffee";
import { Btn, Field, disp, inp, mono, over } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { useCatalog } from "./catalog-context";

export interface PlPayload {
  mode: "stock" | "blend"; skuId?: string; sel: SelItem[]; roast: number | null; blendName: string;
  productName: string; isBlend: boolean; effRoast: number; pricePerLb: number; lbs: number; needBy: string;
  q: PlQuote; art: { fileId: string | null; filename: string } | null; labelSize: string; ownBags: number; ownEta: string;
  bagId: string; packId: "stock" | "label" | "own";
}

const Row = ({ k, v }: { k: string; v: string }) => <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "9px 0", borderBottom: "1px solid var(--hairline)" }}><span style={{ fontSize: 13, color: "var(--ink-muted)", fontFamily: "var(--font-sans)" }}>{k}</span><span style={{ ...mono, fontSize: 13, color: "var(--ink)", textAlign: "right" }}>{v}</span></div>;
const SumRow = ({ k, v }: { k: string; v: number }) => <div style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 13, color: "var(--ink-muted)", fontFamily: "var(--font-sans)", marginBottom: 6 }}><span>{k}</span><span style={mono}>{money(v)}</span></div>;
const CheckoutHead = ({ label }: { label: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
    <span style={{ ...over, fontSize: 10, color: "var(--ink-muted)", whiteSpace: "nowrap" }}>{label}</span>
    <span style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
  </div>
);

export function WholesaleCheckout({ payload, account, onClose, onPlaced }: {
  payload: PlPayload | null; account: { company: string; address: ShipTo | null };
  onClose: () => void; onPlaced: (orderName?: string) => void;
}) {
  const { idx } = useCatalog();
  const blank: ShipTo = { company: account.company, contact: "", phone: "", line1: "", line2: "", city: "", state: "", zip: "" };
  const [ship, setShip] = useState<ShipTo>(account.address ? { ...account.address, company: account.address.company || account.company } : blank);
  const [payMethod, setPayMethod] = useState<"terms" | "card">("terms");
  const [po, setPo] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const setS = (k: keyof ShipTo) => (e: React.ChangeEvent<HTMLInputElement>) => setShip((s) => ({ ...s, [k]: e.target.value }));

  useEffect(() => {
    if (!payload) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape" && !busy) onClose(); };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [payload, busy, onClose]);
  if (!payload) return null;
  const p = payload, q = p.q;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    const body: WholesaleOrderRequest = {
      mode: p.mode, skuId: p.skuId, sel: p.sel, roast: p.roast, blendName: p.blendName, lbs: p.lbs, bagId: p.bagId, packId: p.packId,
      labelSize: p.labelSize, artwork: p.art, ownBags: p.ownBags, ownEta: p.ownEta, needBy: p.needBy, ship, payMethod, po,
    };
    try {
      const res = await fetch("/api/wholesale/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await res.json() as CheckoutResponse;
      if (j.url) { window.location.assign(j.url); return; }
      if (res.ok) { setBusy(false); onPlaced(j.demo ? "demo — not sent to Shopify" : j.orderName); return; }
      setErr(j.error || "We couldn't place the order.");
    } catch { setErr("Couldn't reach the server. Check your connection and try again."); }
    setBusy(false);
  };

  return (
    <>
      <div onClick={busy ? undefined : onClose} style={{ position: "fixed", inset: 0, background: "rgba(36,24,18,.45)", zIndex: 900, animation: "co-fade .15s ease-out" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 901, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, pointerEvents: "none" }}>
        <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="pl-confirm-title" style={{ pointerEvents: "auto", width: "min(640px,100%)", maxHeight: "90vh", overflowY: "auto", background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-modal)" }}>
          <div className="co-modal-head" style={{ padding: "18px 22px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ width: 40, height: 40, borderRadius: "var(--r-md)", background: "var(--surface-sunken)", display: "flex", alignItems: "center", justifyContent: "center", color: rampColor(p.effRoast), flexShrink: 0 }}><Icon name={p.isBlend ? "flame" : "pkg"} size={19} stroke={2} /></div>
            <div style={{ minWidth: 0 }}>
              <div style={{ ...over, fontSize: 9.5, color: "var(--ink-subtle)" }}>Confirm private label order</div>
              <div id="pl-confirm-title" style={{ ...disp, fontSize: 22, color: "var(--ink)", lineHeight: 1.1, marginTop: 3 }}>{p.productName}</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 5, fontFamily: "var(--font-sans)" }}><span style={mono}>{p.lbs} lb · {roastName(p.effRoast)} · need by {p.needBy}</span></div>
            </div>
          </div>
          <div className="co-modal-body" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 13 }}>
            <Row k="Coffee" v={p.isBlend ? p.sel.map((s) => `${idx.get(s.id)?.name ?? s.id} ${s.pct}%`).join(" · ") : p.productName} />
            <Row k="Packaging" v={`${q.bags} × ${q.bag.label} · ${q.pack.title}`} />
            {p.art && q.pack.id === "label" && <Row k="Artwork" v={`${p.art.filename} · ${p.labelSize}`} />}
            {q.pack.id === "own" && <Row k="Your bags" v={`${p.ownBags} arriving ${p.ownEta}`} />}

            <CheckoutHead label="Shipping address" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
              <div style={{ gridColumn: "1 / -1" }}><Field label="Company"><input required autoComplete="organization" value={ship.company} onChange={setS("company")} style={inp} /></Field></div>
              <Field label="Contact name"><input required autoComplete="name" value={ship.contact} onChange={setS("contact")} style={inp} /></Field>
              <Field label="Phone"><input autoComplete="tel" value={ship.phone} onChange={setS("phone")} style={{ ...inp, ...mono }} /></Field>
              <div style={{ gridColumn: "1 / -1" }}><Field label="Street address"><input required autoComplete="address-line1" value={ship.line1} onChange={setS("line1")} style={inp} /></Field></div>
              <div style={{ gridColumn: "1 / -1" }}><Field label="Suite, unit (optional)"><input autoComplete="address-line2" value={ship.line2} onChange={setS("line2")} style={inp} /></Field></div>
              <Field label="City"><input required autoComplete="address-level2" value={ship.city} onChange={setS("city")} style={inp} /></Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="State"><input required autoComplete="address-level1" maxLength={2} pattern="[A-Za-z]{2}" value={ship.state} onChange={setS("state")} style={{ ...inp, ...mono, textTransform: "uppercase" }} /></Field>
                <Field label="ZIP"><input required autoComplete="postal-code" inputMode="numeric" pattern="\d{5}(-\d{4})?" value={ship.zip} onChange={setS("zip")} style={{ ...inp, ...mono }} /></Field>
              </div>
            </div>

            <CheckoutHead label="Payment" />
            <div role="radiogroup" aria-label="Payment" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[{ id: "terms" as const, title: "Invoice on account", sub: "Net 30 · billed after the run ships" },
                { id: "card" as const, title: "Credit card", sub: "Pay now on Shopify's secure checkout" }].map((m) => {
                const on = payMethod === m.id;
                return (
                  <label key={m.id} style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "12px 14px", cursor: "pointer", borderRadius: "var(--r-md)", border: on ? "1.5px solid var(--brand)" : "1px solid var(--hairline)", background: on ? "var(--brand-soft)" : "var(--surface)" }}>
                    <input type="radio" name="pl-pay" checked={on} onChange={() => setPayMethod(m.id)} style={{ marginTop: 2, accentColor: "var(--brand)" }} />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{m.title}</span>
                      <span style={{ display: "block", ...mono, fontSize: 11.5, color: "var(--ink-muted)", marginTop: 3 }}>{m.sub}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            <Field label="Purchase order / reference"><input value={po} onChange={(e) => setPo(e.target.value)} maxLength={60} placeholder="Optional — prints on the invoice" style={inp} /></Field>

            <div style={{ padding: 14, background: "var(--surface-sunken)", border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", marginTop: 4 }}>
              <SumRow k={`${p.lbs} lb × ${money(p.pricePerLb)}/lb`} v={q.coffee} />
              {q.material > 0 && <SumRow k={`${q.bags} bags · material`} v={q.material} />}
              {q.perBag > 0 && <SumRow k={q.pack.id === "label" ? "Label application" : "Bag handling"} v={q.perBag} />}
              {q.setup > 0 && <SumRow k="Plate setup" v={q.setup} />}
              <SumRow k="Fill, seal, date-stamp" v={q.fill} />
              <div style={{ borderTop: "1px solid var(--hairline)", margin: "10px 0" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ ...over, fontSize: 11, color: "var(--ink-muted)" }}>Estimated total</span><span style={{ ...disp, fontSize: 28, color: "var(--ink)" }}>${q.total.toFixed(0)}</span></div>
              <div style={{ fontSize: 11, color: "var(--ink-subtle)", marginTop: 8, fontFamily: "var(--font-sans)" }}>{payMethod === "terms" ? "Billed on your account terms after the run ships." : "Shipping and tax are added on Shopify checkout."} {q.pack.id === "label" ? "A printed proof comes back before we run the labels." : "Green price is locked for 60 days."}</div>
            </div>
            {err && <p role="alert" style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.45, color: "var(--danger)" }}>{err}</p>}
          </div>
          <div className="co-modal-foot" style={{ padding: "14px 22px", borderTop: "1px solid var(--hairline)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={onClose} disabled={busy}>Cancel</Btn>
            <Btn variant="primary" type="submit" disabled={busy}>{busy ? "Placing…" : payMethod === "card" ? "Continue to payment" : "Place order"}</Btn>
          </div>
        </form>
      </div>
    </>
  );
}
