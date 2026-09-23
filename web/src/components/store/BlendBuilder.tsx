"use client";
// Blend builder: ratio worksheet + live tasting wheel (coffeeos/BlendBuilder.jsx).
// `sections` picks which blocks render so a page can spread the builder across
// its own numbered steps: "add" | "ratios" | "roast" | "name".
import { useEffect, type Dispatch, type PointerEvent as RPointerEvent, type SetStateAction } from "react";
import type { Notes, SelItem } from "@/lib/domain/types";
import {
  AGTRON, AX, DROP_F, G_PER_LB, MAX_COMPONENTS, ROAST_DESC, enforceMins, gramsOf, minG, minPctFor, minsFit,
  money, radarGeom, ramp5, rampColor, retailOf, roastName, roastOf, wholesaleOf,
} from "@/lib/domain/coffee";
import { Btn, Dot, Pill, RuleHead, Stepper, mono, over, disp, Photo } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { useCatalog } from "./catalog-context";
import { CoffeeReviews } from "./CoffeeReviews";

type Section = "add" | "ratios" | "roast" | "name";

export function BlendRatios({ sel, setSel, roast, setRoast, blendName, setBlendName, retail, batchG = 5 * G_PER_LB, batchLabel,
  sections = ["ratios", "roast", "add", "name"], gap = 28,
  nameHint = "This is what prints on the roast-date sticker and what your team reorders by." }: {
  sel: SelItem[]; setSel: Dispatch<SetStateAction<SelItem[]>>;
  roast?: number | null; setRoast?: (r: number | null) => void;
  blendName?: string; setBlendName?: (s: string) => void;
  retail?: boolean; batchG?: number; batchLabel?: string; sections?: Section[]; gap?: number; nameHint?: string;
}) {
  const { green, idx } = useCatalog();
  const minPct = (id: string) => minPctFor(idx.get(id), batchG);

  // batch size can change under a finished blend (bag size, quantity, run lb)
  useEffect(() => {
    if (!sel.length) return;
    if (!minsFit(sel, batchG, idx)) return;
    if (sel.every((s) => s.pct >= minPctFor(idx.get(s.id), batchG))) return;
    setSel(enforceMins(sel, null, batchG, idx));
  }, [batchG, sel, idx, setSel]);

  const suggested = sel.length ? roastOf(sel, idx) : 3;
  const eff = Math.max(1, Math.min(5, roast != null ? roast : suggested));

  const setPct = (id: string, v: number) => {
    setSel((prev) => {
      const next = prev.map((x) => ({ ...x }));
      const me = next.find((x) => x.id === id);
      if (!me) return prev;
      if (next.length === 1) { me.pct = 100; return next; }
      const others = next.filter((x) => x.id !== id);
      const room = 100 - others.reduce((a, o) => a + minPct(o.id), 0);
      v = Math.max(minPct(id), Math.min(room, Math.round(v)));
      const sum = others.reduce((a, b) => a + b.pct, 0), rest = 100 - v;
      others.forEach((o) => { o.pct = sum > 0 ? Math.round(rest * o.pct / sum) : Math.round(rest / others.length); });
      me.pct = v;
      return enforceMins(next, id, batchG, idx);
    });
  };
  const minRoom = 100 - sel.reduce((a, s) => a + minPct(s.id), 0);
  const fits = !sel.length || minsFit(sel, batchG, idx);
  const add = (id: string) => {
    if (sel.length >= MAX_COMPONENTS || sel.some((s) => s.id === id) || minPct(id) > minRoom) return;
    const n = sel.length + 1, even = Math.round(100 / n);
    const next = [...sel.map((x) => ({ ...x })), { id, pct: 0 }];
    next.forEach((x, i) => { x.pct = i === next.length - 1 ? 100 - even * (n - 1) : even; });
    setSel(enforceMins(next, id, batchG, idx));
  };
  const remove = (id: string) => {
    setSel((prev) => {
      const next = prev.filter((x) => x.id !== id).map((x) => ({ ...x }));
      const sum = next.reduce((a, b) => a + b.pct, 0);
      if (next.length) {
        next.forEach((x) => { x.pct = sum > 0 ? Math.round(x.pct * 100 / sum) : Math.round(100 / next.length); });
        const t = next.reduce((a, b) => a + b.pct, 0);
        if (t !== 100) next[0].pct = Math.max(0, next[0].pct + 100 - t);
        return enforceMins(next, null, batchG, idx);
      }
      return next;
    });
  };
  const track = (id: string) => (e: RPointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const apply = (cx: number) => { const r = el.getBoundingClientRect(); setPct(id, ((cx - r.left) / r.width) * 100); };
    apply(e.clientX);
    const move = (ev: PointerEvent) => apply(ev.clientX);
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  const priceOf = (c: Parameters<typeof retailOf>[0]) => (retail ? retailOf(c) : wholesaleOf(c));
  const rest = green.filter((c) => !sel.some((s) => s.id === c.id));
  const anchors = green.filter((c) => c.kind === "anchor" && c.avail > 0).slice(0, 2);

  const blocks: Record<Section, React.ReactNode> = {
    ratios: (
      <div key="ratios">
        <RuleHead label="Your coffees" right={<span style={{ ...mono, fontSize: 11.5, color: "var(--ink-subtle)" }}>{sel.length} of {MAX_COMPONENTS} · {batchLabel || (Math.round(batchG).toLocaleString() + " g")}</span>} />
        {sel.length === 0 && (
          <div style={{ padding: "18px 0 0" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.55, color: "var(--ink-muted)", maxWidth: "52ch" }}>Nothing in the blend yet. Add a coffee below, or start from the two anchors most accounts build on.</p>
            {anchors.length === 2 && (
              <div style={{ marginTop: 14 }}><Btn size="sm" variant="secondary" iconLeft={<Icon name="plus" size={14} stroke={2.2} />}
                onClick={() => setSel(enforceMins([{ id: anchors[0].id, pct: 60 }, { id: anchors[1].id, pct: 40 }], null, batchG, idx))}>Start from 60 / 40 anchors</Btn></div>
            )}
          </div>
        )}
        {sel.map((s) => {
          const c = idx.get(s.id);
          if (!c) return null;
          const col = rampColor(c.roast);
          return (
            <div key={s.id} style={{ padding: "14px 0 12px", borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: "var(--r-sm)", marginTop: 4, flexShrink: 0, background: col }} />
                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>
                    {c.name}{c.tag && <Pill variant="tomato">{c.tag}</Pill>}
                  </span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-subtle)" }}>{c.origin} · {money(priceOf(c))}/lb{minG(c) > 0 && <> · <span style={{ ...mono, color: s.pct <= minPct(c.id) ? "var(--brand)" : "var(--ink-subtle)" }}>min {minG(c)} g ({minPct(c.id)}%)</span></>}</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                  <Stepper glyph="−" side="l" label={`Less ${c.name}`} onClick={() => setPct(s.id, s.pct - 5)} />
                  <span style={{ minWidth: 72, textAlign: "center", display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                    <span style={{ ...mono, fontSize: 13.5, color: "var(--ink)" }}>{s.pct}%</span>
                    <span style={{ ...mono, fontSize: 10.5, color: "var(--ink-subtle)" }}>{gramsOf(s.pct, batchG).toLocaleString()} g</span>
                  </span>
                  <Stepper glyph="+" side="r" label={`More ${c.name}`} onClick={() => setPct(s.id, s.pct + 5)} />
                  <button type="button" onClick={() => remove(s.id)} aria-label={`Remove ${c.name}`} style={{ width: 26, height: 26, marginLeft: 6, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: "var(--ink-subtle)", cursor: "pointer", fontSize: 13, lineHeight: 1 }}>✕</button>
                </span>
              </div>
              <div role="slider" aria-label={`${c.name} share`} aria-valuemin={minPct(c.id)} aria-valuemax={100} aria-valuenow={s.pct} tabIndex={0}
                onKeyDown={(e) => { if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setPct(s.id, s.pct + 1); } if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); setPct(s.id, s.pct - 1); } }}
                onPointerDown={track(s.id)} style={{ position: "relative", height: 30, marginTop: 4, display: "flex", alignItems: "center", cursor: "ew-resize", touchAction: "none" }}>
                <span style={{ position: "absolute", left: 0, right: 0, height: 4, borderRadius: 2, background: "var(--surface-sunken)" }} />
                <span style={{ position: "absolute", left: 0, height: 4, borderRadius: 2, background: col, width: s.pct + "%" }} />
                {minPct(c.id) > 0 && <span title={`Minimum ${minG(c)} g`} style={{ position: "absolute", left: minPct(c.id) + "%", width: 1, height: 12, background: "var(--hairline-strong)" }} />}
                <span style={{ position: "absolute", width: 14, height: 24, marginLeft: -7, borderRadius: 4, background: "var(--surface)", border: "1px solid var(--hairline-strong)", boxShadow: "var(--shadow-sm)", left: s.pct + "%" }} />
              </div>
            </div>
          );
        })}
        {sel.length > 0 && !fits && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginTop: 12, padding: "11px 13px", borderRadius: "var(--r-md)", background: "var(--brand-soft)", border: "1px solid var(--brand)" }}>
            <span style={{ color: "var(--brand)", marginTop: 1 }}><Icon name="cog" size={15} stroke={2} /></span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.5, color: "var(--ink)" }}>This batch is {Math.round(batchG).toLocaleString()} g. {sel.length === 1 ? "That's under this coffee's minimum" : "These coffees need " + sel.reduce((a, s) => a + minG(idx.get(s.id)), 0).toLocaleString() + " g between them"} — order a bigger size, more bags, or {sel.length === 1 ? "pick another coffee" : "take one out"}.</span>
          </div>
        )}
        {sel.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", ...over, fontSize: 10.5, color: "var(--ink-muted)" }}>
            <span>Total</span><span style={{ ...mono, fontSize: 13.5, letterSpacing: 0, textTransform: "none", color: "var(--ink)" }}>100% · {Math.round(batchG).toLocaleString()} g</span>
          </div>
        )}
      </div>
    ),

    roast: sel.length > 0 && setRoast ? (
      <div key="roast">
        <RuleHead label="Roast level" right={roast != null
          ? <button type="button" onClick={() => setRoast(null)} style={{ padding: 0, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand)" }}>Back to suggested · {roastName(suggested)}</button>
          : <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-subtle)" }}>Suggested from your coffees</span>} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "14px 0 12px" }}>
          <span style={{ display: "flex", height: 12, width: 170, borderRadius: 2, overflow: "hidden", border: "1px solid var(--hairline)" }}>
            {[1, 2, 3, 4, 5].map((n) => <span key={n} style={{ flex: 1, background: ramp5(n), opacity: Math.round(eff) === n ? 1 : .28 }} />)}
          </span>
          <span style={{ ...mono, fontSize: 11.5, color: "var(--ink-subtle)" }}>Agtron {AGTRON[Math.round(eff)]} · drop {DROP_F[Math.round(eff)]}°F</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(104px,1fr))", gap: 6 }}>
          {[1, 2, 3, 4, 5].map((n) => {
            const on = Math.round(eff) === n;
            return (
              <button type="button" key={n} aria-pressed={on} onClick={() => setRoast(n)} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, padding: "9px 9px 10px", cursor: "pointer", textAlign: "left",
                border: `1px solid ${on ? "var(--brand)" : "var(--hairline-strong)"}`, background: on ? "var(--brand-soft)" : "var(--surface)", borderRadius: "var(--r-sm)" }}>
                <span style={{ width: "100%", height: 6, borderRadius: 2, background: ramp5(n) }} />
                <span style={{ ...over, fontSize: 9.5, color: on ? "var(--brand-hover)" : "var(--ink)" }}>{roastName(n)}</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, lineHeight: 1.3, color: "var(--ink-subtle)" }}>{ROAST_DESC[n]}</span>
              </button>
            );
          })}
        </div>
      </div>
    ) : null,

    add: (
      <div key="add">
        <RuleHead label="Add a coffee" right={<span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-subtle)" }}>{retail ? "Up to four coffees" : "Anchors stocked year-round"}</span>} />
        {rest.map((c) => {
          const out = c.avail === 0, full = sel.length >= MAX_COMPONENTS;
          const noRoom = minPct(c.id) > minRoom || !minsFit([...sel, { id: c.id, pct: 0 }], batchG, idx);
          const dis = out || full || noRoom;
          return (
            <div key={c.id} style={{ borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", opacity: out ? .5 : 1 }}>
                <div style={{ width: 40, height: 40, flexShrink: 0 }}><Photo src={c.image} alt="" style={{ height: 40 }} /></div>
                <span style={{ width: 10, height: 10, borderRadius: "var(--r-sm)", flexShrink: 0, background: rampColor(c.roast) }} />
                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--ink)" }}>
                    {c.name}{c.tag && <Pill variant={c.kind === "soon" ? "cream" : "tomato"}>{c.tag}</Pill>}
                  </span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-subtle)" }}>{c.origin} · {c.process} · <span style={mono}>{c.avail ? (retail ? "in stock" : Math.round(c.avail).toLocaleString() + " lb green") : "out of stock"}</span>{minG(c) > 0 && <> · <span style={{ ...mono, color: noRoom ? "var(--danger)" : "var(--ink-subtle)" }}>min {minG(c)} g{noRoom && !out && !full ? " — won't fit this batch" : ""}</span></>}</span>
                </span>
                <button type="button" className="bb-add" onClick={() => add(c.id)} disabled={dis} style={{ transition: "background var(--dur) var(--ease), border-color var(--dur) var(--ease), color var(--dur) var(--ease), transform 90ms var(--ease)", height: 32, padding: "0 12px", gap: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap", fontFamily: "var(--font-sans)", fontWeight: 600,
                  border: "1px solid var(--hairline-strong)", background: "var(--surface)", borderRadius: "var(--r-sm)", color: "var(--ink)", cursor: dis ? "not-allowed" : "pointer", opacity: dis ? .4 : 1, fontSize: 12.5, lineHeight: 1 }}><span aria-hidden="true" style={{ ...mono, fontSize: 14 }}>+</span>Add to blend</button>
              </div>
              <div style={{ paddingLeft: 52 }}><CoffeeReviews coffee={c} /></div>
            </div>
          );
        })}
      </div>
    ),

    name: setBlendName ? (
      <div key="name">
        <div style={{ border: "1.5px solid var(--ink)", borderRadius: "var(--r-md)", background: "var(--surface)", padding: "clamp(16px,2.4vw,24px)", display: "flex", flexDirection: "column", gap: 12, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <label htmlFor="pl-blend-name" style={{ ...over, fontSize: 10.5, color: "var(--brand)" }}>Name the blend</label>
            <span style={{ ...over, fontSize: 9.5, color: "var(--ink-subtle)" }}>Prints on the bag</span>
          </div>
          <input id="pl-blend-name" value={blendName} onChange={(e) => setBlendName(e.target.value)} placeholder="House blend" maxLength={32}
            style={{ ...disp, fontSize: "clamp(22px,2.6vw,30px)", lineHeight: 1.1, color: "var(--ink)", background: "transparent", border: "none", borderBottom: "2px solid var(--ink)", borderRadius: 0, padding: "4px 0 8px", outline: "none", width: "100%", minWidth: 0 }} />
          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-muted)", textWrap: "pretty" }}>{nameHint}</p>
        </div>
      </div>
    ) : null,
  };

  return <div style={{ display: "flex", flexDirection: "column", gap }}>{sections.map((s) => blocks[s])}</div>;
}

// ---- the cup: live radar of weighted cupping scores ----
export function TastingWheel({ vals, roast, empty, title = "The cup", note }: { vals: Notes; roast: number; empty?: boolean; title?: string; note?: string }) {
  const g = radarGeom(vals);
  const rgb = rampColor(roast);
  const soft = (a: number) => rgb.replace("rgb(", "rgba(").replace(")", `,${a})`);
  const top = AX.map((a) => ({ label: a.l, v: vals[a.k] || 0 })).sort((x, y) => y.v - x.v).slice(0, 5);
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-lg)", padding: "20px 22px 22px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
        <span style={{ ...over, fontSize: 10.5, color: "var(--ink-muted)" }}>{title}</span>
        {!empty && <span style={{ display: "inline-flex", alignItems: "center", gap: 6, ...over, fontSize: 10, color: "var(--brand)" }}><Dot color="tomato" pulse size={6} />Live</span>}
      </div>
      <div style={{ padding: "0 clamp(16px,13%,62px)" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 400, margin: "0 auto", aspectRatio: "1 / 1" }}>
          <svg viewBox="0 0 480 480" role="img" aria-label={`Tasting wheel: ${top.filter((t) => t.v >= .05).map((t) => `${t.label} ${t.v.toFixed(1)}`).join(", ") || "empty"}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
            {[150, 109, 68, 27].map((r) => <circle key={r} cx="240" cy="240" r={r} fill="none" stroke="var(--viz-grid)" strokeWidth="1" />)}
            {g.axes.map((a, i) => <line key={i} x1="240" y1="240" x2={a.sx.toFixed(1)} y2={a.sy.toFixed(1)} stroke="var(--viz-grid)" strokeWidth="1" />)}
            {!empty && <><path d={g.p3} fill={soft(.10)} /><path d={g.p2} fill={soft(.16)} /><path d={g.p1} fill={soft(.24)} stroke={rgb} strokeWidth="2.5" strokeLinejoin="round" /></>}
            {!empty && g.axes.map((a, i) => <circle key={i} cx={a.dx.toFixed(1)} cy={a.dy.toFixed(1)} r="3" fill={a.dot} />)}
          </svg>
          {!empty && g.axes.map((a, i) => (
            <div key={i} aria-hidden="true" style={{ position: "absolute", display: "flex", flexDirection: "column", gap: 1, whiteSpace: "nowrap", left: a.lx + "%", top: a.ly + "%", transform: a.tf, alignItems: a.al, opacity: a.op }}>
              <span style={{ ...over, fontSize: 9, color: "var(--ink-muted)" }}>{a.label}</span>
              <span style={{ ...mono, fontSize: 11.5, color: "var(--ink)" }}>{a.valStr}</span>
            </div>
          ))}
          {empty && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 10, padding: "0 14%" }}>
              <h3 style={{ margin: 0, ...disp, fontSize: 22, color: "var(--ink)", lineHeight: 1.1 }}>Empty cup</h3>
              <p style={{ margin: 0, maxWidth: "32ch", fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.55, color: "var(--ink-muted)" }}>Add a coffee and the wheel fills in. Move a ratio and it moves with you.</p>
            </div>
          )}
        </div>
      </div>
      {!empty && (
        <div style={{ marginTop: 14 }}>
          {top.map((n) => (
            <div key={n.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: "1px solid var(--hairline)" }}>
              <span style={{ flex: "0 0 86px", ...over, fontSize: 9.5, color: "var(--ink-muted)" }}>{n.label}</span>
              <span style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--surface-sunken)", position: "relative", overflow: "hidden" }}>
                <span style={{ position: "absolute", inset: "0 auto 0 0", borderRadius: 2, background: rgb, width: Math.round(Math.min(10, n.v) * 10) + "%" }} />
              </span>
              <span style={{ ...mono, fontSize: 11.5, color: "var(--ink)" }}>{n.v < .05 ? "—" : n.v.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}
      <p style={{ margin: "14px 0 0", fontFamily: "var(--font-sans)", fontSize: 11.5, lineHeight: 1.5, color: "var(--ink-subtle)" }}>{note || "Intensities are cupping scores from our lab, weighted by your ratios. Treat the wheel as a preview of the cup, not a promise."}</p>
    </div>
  );
}
