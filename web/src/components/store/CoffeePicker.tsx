"use client";
// Coffee Lab "Choose your coffees" (CoffeePicker.jsx): coffees grouped by the
// role they play in a blend (tabs), as cards with a check to add or remove each,
// and a bottom-sheet details drawer. Selection is the blend itself; reasonFor
// says why a coffee can't be added.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BlendRole, GreenLot, SelItem } from "@/lib/domain/types";
import { AX, ROLES, retailOf, roleOf } from "@/lib/domain/coffee";
import { disp, mono, Photo } from "@/components/ui/primitives";
import { CoffeeReviews, Stars } from "./CoffeeReviews";

const top = (c: GreenLot, n = 3) => AX.map((a) => ({ k: a.k, l: a.l, v: c.notes[a.k] || 0 })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v).slice(0, n);
const ROAST_WORD = ["", "Light", "Light-medium", "Medium", "Medium-dark", "Dark"];
/** A few words for how the coffee drinks, from its strongest notes and roast. */
const feel = (c: GreenLot) => {
  const t = top(c, 4).map((x) => x.k), f: string[] = [];
  if (t.some((k) => ["citrus", "floral", "berry"].includes(k))) f.push("Bright");
  if (t.some((k) => ["cocoa", "malt", "hazelnut", "almond"].includes(k))) f.push("Comforting");
  if (t.includes("ferment")) f.push("Wild");
  if (t.some((k) => ["brownSugar", "stoneFruit"].includes(k))) f.push("Sweet");
  f.push(c.roast >= 4 ? "Full-bodied" : c.roast <= 2 ? "Delicate" : "Balanced");
  return f.slice(0, 3);
};
function Tab({ label, count, on, onClick, id, panel }: { label: string; count: number; on: boolean; onClick: () => void; id: string; panel: string }) {
  return (
    <button type="button" role="tab" id={id} aria-selected={on} aria-controls={panel} tabIndex={on ? 0 : -1} onClick={onClick}
      style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8, minHeight: 44, padding: "0 18px", borderRadius: "var(--r-md)", cursor: "pointer",
        border: "1.5px solid var(--ink)", background: on ? "var(--ink)" : "var(--surface)", color: on ? "#fff" : "var(--ink)", transition: "background var(--dur) var(--ease)",
        fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em" }}>
      {label}
      {count > 0 && <span aria-label={`${count} selected`} style={{ minWidth: 20, height: 20, padding: "0 6px", borderRadius: 100, display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: "var(--brand)", color: "#fff", ...mono, fontSize: 11, lineHeight: 1, letterSpacing: 0 }}>{count}</span>}
    </button>
  );
}

const chip = { ...mono, fontSize: 12, lineHeight: 1, padding: "7px 10px", background: "var(--surface-sunken)", color: "var(--ink)", borderRadius: "var(--r-sm)", whiteSpace: "nowrap" } as const;
const price = (c: GreenLot) => `$${retailOf(c).toFixed(2)}`;

function Tag({ c, style }: { c: GreenLot; style?: React.CSSProperties }) {
  if (!c.tag) return null;
  const soon = c.kind === "soon";
  return <span style={{ ...mono, fontSize: 11.5, lineHeight: 1, padding: "7px 10px", borderRadius: "var(--r-sm)", background: soon ? "var(--surface)" : "var(--ink)", color: soon ? "var(--ink)" : "#fff", ...style }}>{c.tag}</span>;
}

function Check({ on, disabled, onClick, label }: { on: boolean; disabled: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" aria-pressed={on} aria-label={label} disabled={disabled} onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{ width: 28, height: 28, flexShrink: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, cursor: disabled ? "not-allowed" : "pointer",
        border: on ? "none" : "1.5px solid var(--hairline-strong)", background: on ? "var(--ink)" : "var(--surface)", color: "#fff", opacity: disabled && !on ? .4 : 1, transition: "background var(--dur) var(--ease)" }}>
      {on && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
    </button>
  );
}

function Card({ c, on, block, onToggle, onDetails }: { c: GreenLot; on: boolean; block: string | null; onToggle: () => void; onDetails: () => void }) {
  const out = c.avail === 0, r = c.reviews, locked = !!block && !on;
  return (
    <div className="cp-card" onClick={() => { if (!locked) onToggle(); }}
      style={{ display: "grid", position: "relative", isolation: "isolate", gridTemplateColumns: "minmax(96px,30%) minmax(0,1fr)", height: 140, borderRadius: "var(--r-lg)", overflow: "hidden", background: "var(--surface)", cursor: locked ? "default" : "pointer" }}>
      <span aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", borderRadius: "inherit", boxShadow: on ? "inset 0 0 0 2px var(--ink)" : "inset 0 0 0 1px var(--hairline-strong)", transition: "box-shadow var(--dur) var(--ease)" }} />
      <div style={{ position: "relative", height: "100%", minHeight: 0, overflow: "hidden", background: "var(--surface-sunken)", opacity: out ? .6 : 1 }}>
        <Tag c={c} style={{ position: "absolute", top: 12, left: 12, zIndex: 2 }} />
        <Photo src={c.image} alt="" radius={0} placeholder="Photo" style={{ position: "absolute", inset: 0, height: "100%" }} />
      </div>
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 500, color: "var(--ink)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-subtle)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.origin}</span>
          </div>
          <Check on={on} disabled={locked} onClick={onToggle} label={on ? `Remove ${c.name}` : `Add ${c.name}`} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "nowrap", minWidth: 0 }}>
          <span style={{ ...mono, fontSize: 15, color: "var(--ink)", whiteSpace: "nowrap" }}>{price(c)}<span style={{ fontSize: 12, color: "var(--ink-subtle)" }}> / lb</span></span>
          {r && <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, overflow: "hidden" }}><Stars n={r.avg} size={12} /><span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-muted)", whiteSpace: "nowrap" }}>{r.count}</span></span>}
        </div>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          {locked
            ? <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-sans)", fontSize: 12, color: out ? "var(--ink-subtle)" : "var(--danger)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{block}</span>
            : <div style={{ flex: 1, minWidth: 0, display: "flex", gap: 6, overflow: "hidden" }}>{top(c, 2).map((n) => <span key={n.k} style={{ ...chip, fontSize: 11.5, padding: "6px 8px" }}>{n.l}</span>)}</div>}
          <button type="button" onClick={(e) => { e.stopPropagation(); onDetails(); }}
            style={{ flexShrink: 0, background: "none", border: "none", padding: "2px 0 3px", borderBottom: "1.5px solid var(--ink)", cursor: "pointer", ...mono, fontSize: 12, color: "var(--ink)" }}>Details</button>
        </div>
      </div>
    </div>
  );
}

function Drawer({ c, on, block, onToggle, onClose }: { c: GreenLot; on: boolean; block: string | null; onToggle: () => void; onClose: () => void }) {
  const [shown, setShown] = useState(false);
  const done = useRef(onClose);
  useEffect(() => { done.current = onClose; });
  const close = () => { setShown(false); setTimeout(() => done.current(), 220); };
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { setShown(false); setTimeout(() => done.current(), 220); } };
    addEventListener("keydown", k);
    const o = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { cancelAnimationFrame(raf); removeEventListener("keydown", k); document.body.style.overflow = o; };
  }, []);
  const r = c.reviews, dis = !!block && !on;
  const row = (label: string, items: string[]) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: "16px 0", borderBottom: "1px solid var(--hairline)" }}>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--ink)" }}>{label}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "flex-end" }}>{items.map((t) => <span key={t} style={chip}>{t}</span>)}</div>
    </div>
  );
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={c.name} style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      <div onClick={close} style={{ position: "absolute", inset: 0, background: "rgba(36,24,18,.4)", opacity: shown ? 1 : 0, transition: "opacity 220ms var(--ease)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "92vh", background: "var(--surface)", borderRadius: "var(--r-lg) var(--r-lg) 0 0", boxShadow: "var(--shadow-modal)",
        transform: shown ? "none" : "translateY(100%)", transition: "transform 260ms cubic-bezier(.2,.7,.2,1)", display: "flex", flexDirection: "column" }}>
        <button type="button" onClick={close} aria-label="Close" style={{ position: "absolute", top: 14, right: 14, zIndex: 3, width: 40, height: 40, borderRadius: "50%", border: "none", background: "var(--surface-sunken)", cursor: "pointer", fontSize: 18, color: "var(--ink)", lineHeight: 1 }}>×</button>
        <div style={{ overflowY: "auto", padding: "clamp(20px,4vw,48px)", paddingBottom: 120 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: "clamp(24px,4vw,64px)", maxWidth: 1200, margin: "0 auto", alignItems: "start" }}>
            <div style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: "var(--r-lg)", overflow: "hidden", background: "var(--surface-sunken)" }}>
              <Photo src={c.image} alt={c.name} radius={0} placeholder="Coffee photo" style={{ position: "absolute", inset: 0, height: "100%" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
              <Tag c={c} style={{ alignSelf: "flex-start", fontSize: 12 }} />
              <h2 style={{ margin: 0, ...disp, fontSize: "clamp(36px,5vw,64px)", lineHeight: 1, color: "var(--ink)", textWrap: "balance" }}>{c.name}</h2>
              <span style={{ ...mono, fontSize: 13, color: "var(--ink-muted)" }}>{c.origin} · {c.process}</span>
              {r && <span style={{ display: "flex", alignItems: "center", gap: 10 }}><Stars n={r.avg} size={15} /><span style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--ink-muted)" }}>{r.avg.toFixed(1)} · {r.count} reviews</span></span>}
              <span style={{ ...mono, fontSize: 20, color: "var(--ink)" }}>{price(c)}<span style={{ fontSize: 13, color: "var(--ink-subtle)" }}> / lb roasted</span></span>
              <div style={{ borderTop: "1px solid var(--hairline)" }}>
                {top(c).length > 0 && row("Tastes like:", top(c).map((n) => n.l))}
                {row("Feels:", feel(c))}
                {row("Roast:", [ROAST_WORD[Math.round(c.roast)] || "Medium"])}
              </div>
              {r?.grader?.note && <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 16, lineHeight: 1.55, color: "var(--ink)", textWrap: "pretty", maxWidth: "52ch" }}>{r.grader.note}</p>}
              <CoffeeReviews coffee={c} />
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px clamp(20px,4vw,48px) 20px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16, background: "linear-gradient(rgba(255,255,255,0), var(--surface) 35%)" }}>
          {dis && <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-muted)" }}>{block}</span>}
          <button type="button" disabled={dis} onClick={() => { onToggle(); close(); }}
            style={{ minHeight: 52, padding: "0 32px", borderRadius: 100, border: on ? "1.5px solid var(--ink)" : "none", background: on ? "var(--surface)" : "#000", color: on ? "var(--ink)" : "#fff", cursor: dis ? "not-allowed" : "pointer", opacity: dis ? .4 : 1,
              fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: 13, textTransform: "uppercase", letterSpacing: ".08em" }}>{on ? "Remove from blend" : "Add to blend"}</button>
        </div>
      </div>
    </div>, document.body);
}

export function CoffeePicker({ lots, sel, onAdd, onRemove, reasonFor }: {
  lots: GreenLot[]; sel: SelItem[]; onAdd: (id: string) => void; onRemove: (id: string) => void; reasonFor: (c: GreenLot) => string | null;
}) {
  const [detail, setDetail] = useState<string | null>(null);
  const roles = ROLES.filter((r) => lots.some((c) => roleOf(c) === r.k));
  const [tab, setTab] = useState<BlendRole | undefined>(roles[0]?.k);
  const dc = detail ? lots.find((c) => c.id === detail) : undefined;
  const isOn = (id: string) => sel.some((s) => s.id === id);
  const toggle = (id: string) => (isOn(id) ? onRemove(id) : onAdd(id));
  const r = roles.find((x) => x.k === tab) ?? roles[0];
  const list = r ? lots.filter((c) => roleOf(c) === r.k) : lots;
  const tabKeys = (e: React.KeyboardEvent) => {
    const i = roles.findIndex((x) => x.k === r?.k), d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d || i < 0) return;
    e.preventDefault();
    const next = roles[(i + d + roles.length) % roles.length];
    setTab(next.k); document.getElementById(`cp-tab-${next.k}`)?.focus();
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-muted)" }}>Pick up to four. You&rsquo;ll set the ratio next.</span>
        <span style={{ ...mono, fontSize: 12, color: "var(--ink-subtle)" }}>{sel.length} / 4 selected</span>
      </div>
      {roles.length > 1 && r && (
        <div style={{ borderBottom: "1px solid var(--hairline)" }}>
          <div className="cp-tabs" role="tablist" aria-label="Coffee roles" onKeyDown={tabKeys}>
            {roles.map((x) => <Tab key={x.k} id={`cp-tab-${x.k}`} panel="cp-tabpanel" label={x.l} on={x.k === r.k} onClick={() => setTab(x.k)}
              count={sel.filter((s) => { const c = lots.find((g) => g.id === s.id); return c && roleOf(c) === x.k; }).length} />)}
          </div>
        </div>
      )}
      <div id="cp-tabpanel" role={roles.length > 1 ? "tabpanel" : undefined} aria-labelledby={roles.length > 1 && r ? `cp-tab-${r.k}` : undefined} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {r && roles.length > 1 && <span style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.4, color: r.k === "funk" ? "var(--ink)" : "var(--ink-muted)", fontWeight: r.k === "funk" ? 500 : 400, maxWidth: "64ch", textWrap: "pretty" }}>{r.d}</span>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,340px),1fr))", gap: 12 }}>
          {list.map((c) => <Card key={c.id} c={c} on={isOn(c.id)} block={reasonFor(c)} onToggle={() => toggle(c.id)} onDetails={() => setDetail(c.id)} />)}
        </div>
      </div>
      {dc && <Drawer c={dc} on={isOn(dc.id)} block={reasonFor(dc)} onToggle={() => toggle(dc.id)} onClose={() => setDetail(null)} />}
    </div>
  );
}
