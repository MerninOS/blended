"use client";
// One order, everything needed to roast, bag and ship it (ShopOrderDrawer.jsx).
// Roast sheet weights are grams — easier to measure at the roaster.
import { useEffect, useState } from "react";
import type { AdminOrder } from "@/lib/domain/orders";
import { GREEN_LOSS, STAGES, grams, itemLbs, orderBags, orderLbs, packPlan, stageIdx } from "@/lib/domain/orders";
import { AGTRON, DROP_F, money, rampColor, roastName } from "@/lib/domain/coffee";
import { Btn, CO, Pill, inp } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "./OrdersView";

const Row = ({ k, v, m = false }: { k: string; v: string; m?: boolean }) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, padding: "10px 0", borderBottom: "1px solid var(--hairline)" }}>
    <span style={CO.over({ fontSize: 9.5, color: "var(--ink-subtle)", flexShrink: 0 })}>{k}</span>
    <span style={m ? CO.data({ fontSize: 13, color: "var(--ink)", textAlign: "right" }) : { fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", textAlign: "right" }}>{v}</span>
  </div>
);
const Head = ({ label, right }: { label: string; right?: string }) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, paddingBottom: 9, borderBottom: "1px solid var(--hairline-strong)" }}>
    <span style={CO.over({ fontSize: 10, color: "var(--ink-muted)" })}>{label}</span>
    {right && <span style={CO.data({ fontSize: 11.5, color: "var(--ink-subtle)" })}>{right}</span>}
  </div>
);

function Pipeline({ status }: { status: AdminOrder["status"] }) {
  const at = stageIdx(status);
  return (
    <div style={{ display: "flex", gap: 4 }} aria-label={`Stage: ${STAGES[at].label}`}>
      {STAGES.map((s, i) => {
        const done = i < at, on = i === at;
        return (
          <div key={s.id} style={{ flex: 1, minWidth: 0 }}>
            <div style={{ height: 4, borderRadius: 2, background: on ? "var(--brand)" : done ? "var(--ink)" : "var(--surface-sunken)", animation: on && status === "roasting" ? "co-pulse 1.5s ease-in-out infinite" : "none" }} />
            <div style={{ marginTop: 7, ...CO.over({ fontSize: 8.5, color: on ? "var(--brand)" : done ? "var(--ink-muted)" : "var(--ink-subtle)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }) }}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function OrderDrawer({ order, busy, onClose, onAdvance }: {
  order: AdminOrder | null; busy: boolean; onClose: () => void; onAdvance: (o: AdminOrder, tracking?: { number: string; company: string } | null) => void;
}) {
  const [tracking, setTracking] = useState("");
  const [carrier, setCarrier] = useState("USPS");
  useEffect(() => {
    if (!order) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [order, onClose]);
  if (!order) return null;
  const o = order, lbs = orderLbs(o), bags = orderBags(o);
  const next = STAGES[stageIdx(o.status) + 1];
  const action = next ? ({ roasting: o.qcHold ? "Release hold · start roast" : "Start roast", packing: "Move to packing", shipped: "Mark shipped" } as Record<string, string>)[next.id] : null;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(36,24,18,.38)", zIndex: 400, animation: "co-fade .14s ease" }} />
      <aside role="dialog" aria-modal="true" aria-label={`Order ${o.name}`} style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(560px,94vw)", zIndex: 401, background: "var(--surface)", borderLeft: "1px solid var(--hairline)", boxShadow: "var(--shadow-modal)", display: "flex", flexDirection: "column", animation: "co-slide .18s cubic-bezier(.2,.6,.2,1)" }}>
        <div style={{ padding: "18px 22px 16px", borderBottom: "1px solid var(--hairline)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <Avatar name={o.customer.name} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={CO.over({ fontSize: 9.5, color: "var(--ink-subtle)" })}>{o.name} · placed {o.placed} · {o.channel}</div>
              <h2 style={CO.display({ fontSize: 22, lineHeight: 1.05, margin: "5px 0 0", color: "var(--ink)" })}>{o.customer.name}</h2>
              <div style={{ marginTop: 6, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-muted)" }}>{[o.customer.email, o.customer.city].filter(Boolean).join(" · ")}</div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, flexShrink: 0, border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: "var(--surface)", color: "var(--ink-muted)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="x" size={16} stroke={2} /></button>
          </div>
          <div style={{ marginTop: 18 }}><Pipeline status={o.status} /></div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
          {o.qcHold && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: "var(--r-md)", background: "var(--brand-soft)", border: "1px solid var(--brand)" }}>
              <span style={{ color: "var(--brand)", marginTop: 1, flexShrink: 0 }}><Icon name="alert" size={15} stroke={2.2} /></span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.5, color: "var(--ink)" }}>New custom blend — cup a sample before the run. Starting the roast releases the hold.</span>
            </div>
          )}
          {(o.note || o.gift) && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: "var(--r-md)", background: o.gift ? "var(--brand-soft)" : "var(--surface-sunken)", border: `1px solid ${o.gift ? "var(--brand)" : "var(--hairline)"}` }}>
              <span style={{ color: o.gift ? "var(--brand)" : "var(--ink-subtle)", marginTop: 1, flexShrink: 0 }}><Icon name={o.gift ? "alert" : "list"} size={15} stroke={2.2} /></span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.5, color: "var(--ink)" }}>{o.note || "Gift order — include the card, leave the invoice out of the box."}</span>
            </div>
          )}

          <section>
            <Head label="Roast sheet" right={`${o.items.length} ${o.items.length === 1 ? "item" : "items"} · ${lbs.toFixed(1)} lb roasted`} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
              {o.items.map((it, i) => {
                const l = itemLbs(it), r = Math.round(it.roast);
                return (
                  <div key={i} style={{ border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: "var(--surface)", overflow: "hidden" }}>
                    <div style={{ padding: "13px 15px", display: "flex", alignItems: "flex-start", gap: 12, borderBottom: "1px solid var(--hairline)" }}>
                      <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: "var(--r-sm)", background: "var(--surface-sunken)", display: "inline-flex", alignItems: "center", justifyContent: "center", ...CO.data({ fontSize: 11, color: "var(--ink-muted)" }) }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={CO.display({ fontSize: 15, color: "var(--ink)", lineHeight: 1.15 })}>{it.name}</div>
                        <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          {it.kind === "blend" ? <Pill variant="cream">Custom blend · {it.sel?.length ?? 0} coffees</Pill> : <Pill variant="matcha">Our coffee</Pill>}
                          <span style={CO.data({ fontSize: 12, color: "var(--ink-muted)" })}>{it.qty} × {it.sizeLabel} · {it.grind.toLowerCase()}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={CO.data({ fontSize: 17, color: "var(--ink)", lineHeight: 1 })}>{l % 1 ? l.toFixed(1) : l} lb</div>
                        <div style={CO.over({ fontSize: 9, color: "var(--ink-subtle)", marginTop: 4 })}>roasted</div>
                      </div>
                    </div>
                    <div style={{ padding: "12px 15px 14px", background: "var(--surface-sunken)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                        <span style={CO.over({ fontSize: 9.5, color: "var(--ink-muted)" })}>Roast to</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "3px 9px", borderRadius: "var(--r-pill)", background: "var(--surface)", border: "1px solid var(--hairline)" }}>
                          <span style={{ width: 9, height: 9, borderRadius: "var(--r-sm)", background: rampColor(it.roast), boxShadow: "inset 0 0 0 1px rgba(0,0,0,.14)" }} />
                          <span style={CO.over({ fontSize: 9.5, color: "var(--ink)" })}>{roastName(it.roast)}</span>
                        </span>
                        <span style={CO.data({ fontSize: 11.5, color: "var(--ink-subtle)" })}>Agtron {AGTRON[r]} · drop {DROP_F[r]}°F</span>
                      </div>
                      {it.kind === "blend" && it.sel ? (
                        <>
                          <div style={{ display: "flex", height: 7, borderRadius: 2, overflow: "hidden", margin: "13px 0 4px" }}>
                            {it.sel.map((s) => <span key={s.id} style={{ width: s.pct + "%", background: rampColor(s.roast) }} />)}
                          </div>
                          {it.sel.map((s) => {
                            const roasted = l * s.pct / 100, green = roasted / GREEN_LOSS;
                            return (
                              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 0", borderBottom: "1px solid var(--hairline)" }}>
                                <span style={{ width: 9, height: 9, borderRadius: "var(--r-sm)", flexShrink: 0, background: rampColor(s.roast) }} />
                                <span style={{ width: 40, flexShrink: 0, ...CO.data({ fontSize: 13, color: "var(--ink)" }) }}>{s.pct}%</span>
                                <span style={{ flex: 1, minWidth: 0 }}>
                                  <span style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)" }}>{s.name}</span>
                                  <span style={CO.data({ fontSize: 11, color: "var(--ink-subtle)" })}>{s.lot} · {grams(roasted)} out</span>
                                </span>
                                <span style={{ textAlign: "right", flexShrink: 0 }}>
                                  <span style={{ display: "block", ...CO.data({ fontSize: 13, color: "var(--ink)" }) }}>{grams(green)}</span>
                                  <span style={{ display: "block", ...CO.over({ fontSize: 8.5, color: "var(--ink-subtle)", marginTop: 2 }) }}>green in</span>
                                </span>
                              </div>
                            );
                          })}
                          <div style={{ display: "flex", alignItems: "center", gap: 11, paddingTop: 10 }}>
                            <span style={{ flex: 1, ...CO.over({ fontSize: 9.5, color: "var(--ink-muted)" }) }}>Total green for this blend</span>
                            <span style={CO.data({ fontSize: 13, color: "var(--ink)" })}>{grams(l / GREEN_LOSS)}</span>
                          </div>
                        </>
                      ) : (
                        <div style={{ marginTop: 11, display: "flex", alignItems: "center", gap: 11 }}>
                          <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.55, color: "var(--ink-muted)" }}>Single coffee, roasted to order.</span>
                          <span style={{ textAlign: "right", flexShrink: 0 }}>
                            <span style={{ display: "block", ...CO.data({ fontSize: 13, color: "var(--ink)" }) }}>{grams(l / GREEN_LOSS)}</span>
                            <span style={{ display: "block", ...CO.over({ fontSize: 8.5, color: "var(--ink-subtle)", marginTop: 2 }) }}>green in</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <Head label="Packing" right={`${bags} bags`} />
            {packPlan(o).map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--hairline)" }}>
                <span style={{ width: 30, height: 30, borderRadius: "var(--r-md)", background: "var(--surface-sunken)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--roast-3)", flexShrink: 0 }}><Icon name="bag" size={15} stroke={2} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)" }}>{p.qty} × {p.sizeLabel} · {p.grind}</span>
                  <span style={CO.data({ fontSize: 11, color: "var(--ink-subtle)" })}>{p.names.join(" · ")}</span>
                </span>
              </div>
            ))}
            <Row k="Bag" v="Kraft pouch, valve, resealable zip" />
            <Row k="Sticker" v="Coffee name, roast date, lot code" />
          </section>

          <section>
            <Head label="Ship to" />
            <div style={{ padding: "14px 0 12px", fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.6, color: "var(--ink)" }}>
              {o.customer.address.map((l, i) => <div key={i}>{l}</div>)}
            </div>
            <Row k="Method" v={o.ship.method} />
            <Row k="Ship weight" v={`${(lbs * 1.08 + 0.4).toFixed(1)} lb est.`} m />
            <Row k="Tracking" v={o.ship.tracking || "Not shipped yet"} m />
          </section>

          <section>
            <Head label="Paid" />
            {o.items.map((it, i) => <Row key={i} k={`${it.name} · ${it.qty} × ${it.sizeLabel}`} v={money(it.unit * it.qty)} m />)}
            {o.money.discount > 0 && <Row k="Discount" v={"−" + money(o.money.discount)} m />}
            <Row k="Shipping" v={o.money.shipping === 0 ? "Free" : money(o.money.shipping)} m />
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, paddingTop: 14 }}>
              <div>
                <div style={CO.over({ fontSize: 10, color: "var(--ink-muted)" })}>Order total</div>
                <div style={CO.data({ fontSize: 12, color: "var(--ink-subtle)", marginTop: 4 })}>{money(o.money.total / Math.max(1, lbs))}/lb out</div>
              </div>
              <div style={CO.display({ fontSize: 30, lineHeight: 1, color: "var(--ink)" })}>{money(o.money.total)}</div>
            </div>
          </section>
        </div>

        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
          {next?.id === "shipped" && (
            <div style={{ display: "flex", gap: 8, flexBasis: "100%" }}>
              <select aria-label="Carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} style={{ ...inp, width: 110, padding: "7px 10px", fontSize: 12.5 }}>
                {["USPS", "UPS", "FedEx", "DHL"].map((c) => <option key={c}>{c}</option>)}
              </select>
              <input aria-label="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Tracking number (optional)" style={{ ...inp, padding: "7px 10px", fontSize: 12.5, fontFamily: "var(--font-mono)" }} />
            </div>
          )}
          <Btn size="sm" variant="outline" onClick={() => window.print()}>Print run sheet</Btn>
          {o.adminUrl && <a href={o.adminUrl} target="_blank" rel="noreferrer" style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--ink-muted)" }}>Open in Shopify ↗</a>}
          <div style={{ flex: 1 }} />
          {action
            ? <Btn size="sm" variant="primary" disabled={busy} icon={<Icon name="arrow" size={14} />} onClick={() => onAdvance(o, next?.id === "shipped" && tracking.trim() ? { number: tracking.trim(), company: carrier } : null)}>{busy ? "Saving…" : action}</Btn>
            : <Pill variant="matcha">Fulfilled</Pill>}
        </div>
      </aside>
    </>
  );
}
