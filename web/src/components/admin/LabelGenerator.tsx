"use client";
// Label generator (coffeeos/LabelGenerator.jsx). Coffee bag labels come from
// shop order lines or are made by hand, drawn as SVG at 3.25 × 1.5 in
// (975 × 450 @ 300 dpi); concentrate labels are the 8 × 3.5 in bottle wrap
// (concentrate-label.ts). Either prints one per page or on US Letter sheets
// (12-up / 3-up) via "Save as PDF" in the browser's print dialog; a spot
// picker handles partly used sheets. Print styles live in labels.css.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { GreenLot, Notes, StockCoffee } from "@/lib/domain/types";
import type { AdminOrder, OrderItem } from "@/lib/domain/orders";
import { SHOP_SIZES, indexLots, rampColor, roastName, shopSize, weighted, type LotIndex } from "@/lib/domain/coffee";
import { Btn, CO } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { Segmented, Tabs } from "./parts";
import { StatusChip } from "./OrdersView";
import { LabelArt } from "@/components/label/BagLabel";
import { LABEL_COLORS, LABEL_OFF, LABEL_RED, LABEL_SITE, clampRoast, country, today, topWords, type LabelData } from "@/lib/bag-label";
import { CC_BASES, CC_FLAVORS, CC_H, CC_MAX_SUPPS, CC_SUPPS, CC_W, ccLabel, concentrateLabelPng } from "./concentrate-label";

const COLORS = LABEL_COLORS, RED = LABEL_RED, OFF = LABEL_OFF, SITE = LABEL_SITE;
const GRINDS = ["Whole bean", "Filter / drip", "Espresso", "French press", "Moka pot"];

// ---------- label data ----------
function fromItem(it: OrderItem, idx: LotIndex, stock: StockCoffee[]): LabelData {
  const roast = clampRoast(it.roast);
  let parts: LabelData["parts"], vals: Notes;
  if (it.kind === "blend" && it.sel?.length) {
    parts = it.sel.map((s, i) => { const l = idx.get(s.id); return { name: l?.name ?? s.name, origin: country(l?.origin), color: COLORS[i % COLORS.length] }; });
    vals = weighted(it.sel.map((s) => ({ id: s.id, pct: s.pct })), idx, roast);
  } else {
    const sku = stock.find((s) => s.name.toLowerCase() === it.name.toLowerCase());
    const lot = sku && [...idx.values()].find((l) => l.name === sku.name);
    parts = [{ name: sku?.name ?? it.name, origin: lot ? country(lot.origin) : sku?.sub.split(/\s*·\s*/).slice(1).join(" · ") ?? "", color: COLORS[0] }];
    vals = sku?.notes ?? {};
  }
  return { site: SITE, name: it.name, parts, vals, words: topWords(vals), roast, size: it.sizeLabel, grind: it.grind || "Whole bean" };
}

interface Manual { name: string; sel: string[]; roast: number; sizeId: string; grind: string; notes: string; roastedOn: string; site: string; copies: string }
function fromManual(m: Manual, idx: LotIndex): LabelData {
  const sel = m.sel.filter((id) => idx.has(id));
  const vals = sel.length ? weighted(sel.map((id) => ({ id, pct: 100 / sel.length })), idx, m.roast) : {};
  const words = m.notes.trim() ? m.notes.split("/").map((s) => s.trim()).filter(Boolean) : topWords(vals);
  return {
    site: m.site, name: m.name, roastedOn: m.roastedOn, vals, words, roast: m.roast, size: shopSize(m.sizeId).label, grind: m.grind,
    parts: sel.map((id, i) => { const l = idx.get(id)!; return { name: l.name, origin: country(l.origin), color: COLORS[i % COLORS.length] }; }),
  };
}

// ---------- sheets: US Letter, no gutters ----------
// coffee: 2 × 6 at 3.25 × 1.5 in, 1 in margins · concentrate: 1 × 3 at 8 × 3.5 in, 0.25 in margins
interface SheetSpec { cols: number; n: number; w: number; h: number; x: number; y: number; size: string }
const SHEETS = {
  coffee: { cols: 2, n: 12, w: 3.25, h: 1.5, x: 1, y: 1, size: "3.25 × 1.5 in" },
  conc: { cols: 1, n: 3, w: 8, h: 3.5, x: .25, y: .25, size: "8 × 3.5 in" },
} satisfies Record<string, SheetSpec>;
type Format = "single" | "sheet";
/** A print run: one node per label; null leaves that spot on the sheet blank. */
interface Job { spec: SheetSpec; slots: (ReactNode | null)[] }

const chunk = <T,>(a: T[], n: number) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));
const slotStyle = (sp: SheetSpec, i: number) => ({
  position: "absolute", left: `${(sp.x + (i % sp.cols) * sp.w) / 8.5 * 100}%`, top: `${(sp.y + Math.floor(i / sp.cols) * sp.h) / 11 * 100}%`,
  width: `${sp.w / 8.5 * 100}%`, height: `${sp.h / 11 * 100}%`,
}) as const;
const coffeeNode = (d: LabelData) => <LabelArt d={d} />;
// eslint-disable-next-line @next/next/no-img-element -- a canvas-rendered data URL, printed at its own size
const imgNode = (src: string) => <img src={src} alt="" style={{ display: "block", width: "100%", height: "100%" }} />;

/** Mini letter sheet: filled spots show the label, empty ones are dashed. onToggle makes spots clickable. */
function SheetMap({ spec, slots, onToggle, empty }: { spec: SheetSpec; slots: (ReactNode | null)[]; onToggle?: (i: number) => void; empty?: string }) {
  return (
    <div style={{ position: "relative", aspectRatio: "8.5 / 11", background: "#fff", border: "1px solid var(--hairline-strong)", borderRadius: 3, boxShadow: "var(--shadow-sm)" }}>
      {Array.from({ length: spec.n }, (_, i) => {
        const node = slots[i];
        const st = { ...slotStyle(spec, i), padding: 0, margin: 0, overflow: "hidden", border: node ? "1px solid rgba(26,26,24,.12)" : "1px dashed var(--hairline-strong)", background: node ? "transparent" : "var(--surface-sunken)", display: "flex", alignItems: "center", justifyContent: "center" } as const;
        const inner = node ?? <span style={CO.data({ fontSize: 10, color: "var(--ink-subtle)" })}>{empty ?? i + 1}</span>;
        return onToggle
          ? <button key={i} type="button" onClick={() => onToggle(i)} aria-pressed={!!node} aria-label={`Spot ${i + 1}`} style={{ ...st, cursor: "pointer" }}>{inner}</button>
          : <div key={i} style={st}>{inner}</div>;
      })}
    </div>
  );
}

function FormatPick({ value, onChange, spec }: { value: Format; onChange: (f: Format) => void; spec: SheetSpec }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={CO.over({ fontSize: 9.5, color: "var(--ink-muted)" })}>Print on</span>
      <Segmented options={[{ id: "single", label: "One per page" }, { id: "sheet", label: `Letter sheet · ${spec.n}` }]} value={value} onChange={onChange} />
    </div>
  );
}

/** Clickable spot picker for hand-made labels (manual and concentrate) — for partly used sheets. */
function SpotPicker({ spec, spots, setSpots, node }: { spec: SheetSpec; spots: Set<number>; setSpots: (f: (s: Set<number>) => Set<number>) => void; node: ReactNode | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={CO.over({ fontSize: 9.5, color: "var(--ink-muted)" })}>Spots to print</span>
        <span style={{ display: "flex", gap: 6 }}>
          <Btn size="sm" variant="outline" onClick={() => setSpots(() => new Set(Array.from({ length: spec.n }, (_, i) => i)))}>All</Btn>
          <Btn size="sm" variant="outline" onClick={() => setSpots(() => new Set())}>Clear</Btn>
        </span>
      </div>
      <SheetMap spec={spec} slots={spotRun(spec, spots, node)} onToggle={(i) => setSpots((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })} />
      <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--ink-subtle)" }}>Click a spot to add or remove it. Use this for partly used sheets.</span>
    </div>
  );
}
const spotRun = (spec: SheetSpec, spots: Set<number>, node: ReactNode | null) => Array.from({ length: spec.n }, (_, i) => (spots.has(i) ? node : null));

// ---------- print ----------
function LgPrint({ job, format, onDone }: { job: Job; format: Format; onDone: () => void }) {
  const done = useRef(onDone);
  useEffect(() => { done.current = onDone; });
  useEffect(() => {
    const after = () => done.current();
    addEventListener("afterprint", after);
    const t = setTimeout(() => (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => print()), 250);
    return () => { clearTimeout(t); removeEventListener("afterprint", after); };
  }, []);
  const { spec, slots } = job;
  const page = format === "sheet" ? "letter" : `${spec.w}in ${spec.h}in`;
  return createPortal(
    <div className="lg-print">
      <style>{`@media print { @page { size: ${page}; margin: 0 } }`}</style>
      {format === "sheet"
        ? chunk(slots, spec.n).map((sheet, k) => (
          <div key={k} className="lg-sheet">{sheet.map((node, i) => node && <div key={i} className="lg-slot" style={slotStyle(spec, i)}>{node}</div>)}</div>
        ))
        : slots.filter(Boolean).map((node, i) => <div key={i} className="lg-page" style={{ width: `${spec.w}in`, height: `${spec.h}in` }}>{node}</div>)}
    </div>,
    document.body,
  );
}

// ---------- ui atoms ----------
const inp = { width: "100%", height: 36, padding: "0 11px", border: "1px solid var(--hairline-strong)", borderRadius: "var(--r-sm)", background: "var(--surface)", color: "var(--ink)", fontFamily: "var(--font-sans)", fontSize: 13.5 } as const;
function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <span style={CO.over({ fontSize: 9.5, color: "var(--ink-muted)" })}>{label}</span>
      {children}
      {hint && <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--ink-subtle)" }}>{hint}</span>}
    </label>
  );
}
function Head({ label, right }: { label: string; right?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, paddingBottom: 9, borderBottom: "1px solid var(--hairline-strong)" }}>
      <span style={CO.over({ fontSize: 10, color: "var(--ink-muted)", whiteSpace: "nowrap", flexShrink: 0 })}>{label}</span>
      {right && <span style={CO.data({ fontSize: 11.5, color: "var(--ink-subtle)", whiteSpace: "nowrap" })}>{right}</span>}
    </div>
  );
}
function Preview({ d, caption, children, size = SHEETS.coffee.size, art }: { d?: LabelData | null; caption?: string; children: ReactNode; size?: string; art?: ReactNode }) {
  return (
    <div className="lg-preview" style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: "calc(var(--topbar-h) + 16px)" }}>
      <Head label="Preview" right={size} />
      <div style={{ boxShadow: "var(--shadow-pop)", borderRadius: 3, overflow: "hidden", border: "1px solid var(--hairline)" }}>
        {(art ?? d) ? (art ?? <LabelArt d={d!} />) : <div style={{ aspectRatio: "975 / 450", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-sunken)", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-subtle)", padding: 16, textAlign: "center" }}>Pick an order line to preview its label.</div>}
      </div>
      {caption && <div style={CO.data({ fontSize: 11.5, color: "var(--ink-subtle)" })}>{caption}</div>}
      {children}
    </div>
  );
}
const labelsWord = (n: number) => `${n} ${n === 1 ? "label" : "labels"}`;
const copiesWord = (n: number) => `${n} ${n === 1 ? "copy" : "copies"}`;
const saveBtn = (n: number, onClick: () => void, ready = true) => (
  <Btn variant="primary" disabled={!n || !ready} style={{ width: "100%", justifyContent: "center" }} icon={<Icon name="download" size={14} />} onClick={onClick}>{`Save ${labelsWord(n)} as PDF`}</Btn>
);
type PrintProps = { onPrint: (job: Job) => void; format: Format; setFormat: (f: Format) => void };

// ---------- from orders ----------
type Row = { key: string; o: AdminOrder; it: OrderItem; d: LabelData };
function FromOrders({ orders, idx, stock, roastedOn, setRoastedOn, onPrint, format, setFormat }: PrintProps & {
  orders: AdminOrder[]; idx: LotIndex; stock: StockCoffee[]; roastedOn: string; setRoastedOn: (v: string) => void;
}) {
  // Coffee lines from shop orders; merch and wholesale (bulk, private label) don't get bag labels here.
  const rows = useMemo<Row[]>(() => orders.filter((o) => o.channel !== "Wholesale").flatMap((o) =>
    o.items.map((it, i) => ({ key: `${o.id}:${i}`, o, it })).filter((r) => r.it.kind !== "item").map((r) => ({ ...r, d: fromItem(r.it, idx, stock) }))), [orders, idx, stock]);
  const [scope, setScope] = useState<"open" | "all">("open");
  const shown = rows.filter((r) => scope === "all" || r.o.status !== "shipped");
  const [sel, setSel] = useState(() => new Set(rows.filter((r) => r.o.status !== "shipped").map((r) => r.key)));
  const [active, setActive] = useState(shown[0]?.key);
  const picked = shown.filter((r) => sel.has(r.key));
  const count = picked.reduce((a, r) => a + r.it.qty, 0);
  const cur = shown.find((r) => r.key === active) ?? shown[0]; // a row hidden by the filter falls back to the first shown
  // sheets fill in order, left to right, one label per bag
  const run = picked.flatMap((r) => Array<LabelData>(r.it.qty).fill({ ...r.d, roastedOn }));
  const sp = SHEETS.coffee, sheets = Math.ceil(count / sp.n), last = count % sp.n || sp.n;
  const toggle = (k: string) => setSel((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const allOn = shown.length > 0 && shown.every((r) => sel.has(r.key));
  const cell = { padding: "10px 14px", verticalAlign: "middle", borderBottom: "1px solid var(--hairline)" } as const;
  return (
    <div className="lg-grid">
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <Segmented options={[{ id: "open", label: "Not shipped" }, { id: "all", label: "All orders" }]} value={scope} onChange={setScope} />
          <span style={CO.data({ fontSize: 12, color: "var(--ink-muted)", whiteSpace: "nowrap" })}>{picked.length} lines · {labelsWord(count)}</span>
        </div>
        <div style={{ border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead><tr style={{ background: "var(--surface-sunken)" }}>
                <th style={{ ...cell, width: 36 }}>
                  <input type="checkbox" aria-label="Select all" checked={allOn} onChange={() => setSel((s) => { const n = new Set(s); shown.forEach((r) => (allOn ? n.delete(r.key) : n.add(r.key))); return n; })} style={{ accentColor: "var(--ink)" }} />
                </th>
                {([["Order", "left"], ["Coffee", "left"], ["Size · grind", "left"], ["Labels", "right"], ["Status", "left"]] as const).map(([h, al]) =>
                  <th key={h} style={{ ...cell, textAlign: al, whiteSpace: "nowrap", ...CO.over({ fontSize: 10, color: "var(--ink-muted)" }) }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {shown.length === 0 && <tr><td colSpan={6} style={{ ...cell, padding: "28px 14px", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-subtle)" }}>{scope === "open" ? "Every order has shipped. Switch to All orders to reprint a label." : "No coffee orders yet."}</td></tr>}
                {shown.map((r) => {
                  const on = r.key === cur?.key;
                  return (
                    <tr key={r.key} onClick={() => setActive(r.key)} style={{ cursor: "pointer", background: on ? "var(--brand-soft)" : "transparent" }}>
                      <td style={{ ...cell, boxShadow: on ? "inset 3px 0 0 var(--brand)" : "none" }}>
                        <input type="checkbox" aria-label={`Include ${r.o.name} ${r.it.name}`} checked={sel.has(r.key)} onClick={(e) => e.stopPropagation()} onChange={() => toggle(r.key)} style={{ accentColor: "var(--ink)" }} />
                      </td>
                      <td style={cell}>
                        <div style={CO.data({ fontSize: 13, color: "var(--ink)", whiteSpace: "nowrap" })}>{r.o.name}</div>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--ink-subtle)", whiteSpace: "nowrap" }}>{r.o.customer.name}</div>
                      </td>
                      <td style={cell}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <span style={{ width: 10, height: 10, borderRadius: "var(--r-sm)", flexShrink: 0, background: rampColor(r.it.roast) }} />
                          <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)", whiteSpace: "nowrap" }}>{r.it.name}</span>
                        </div>
                      </td>
                      <td style={cell}><span style={CO.data({ fontSize: 12, color: "var(--ink-muted)", whiteSpace: "nowrap" })}>{r.it.sizeLabel} · {r.it.grind}</span></td>
                      <td style={{ ...cell, textAlign: "right" }}><span style={CO.data({ fontSize: 13, color: "var(--ink)" })}>{r.it.qty}</span></td>
                      <td style={cell}><StatusChip status={r.o.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Preview d={cur ? { ...cur.d, roastedOn } : null} caption={cur && `${cur.o.name} · ${cur.it.qty} ${cur.it.qty === 1 ? "copy" : "copies"}`}>
        <Field label="Roasted on" hint="Printed on every label in this run. Clear it to write the date by hand.">
          <input value={roastedOn} onChange={(e) => setRoastedOn(e.target.value)} style={{ ...inp, ...CO.data({ fontSize: 13 }) }} />
        </Field>
        <FormatPick value={format} onChange={setFormat} spec={sp} />
        {format === "sheet" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SheetMap spec={sp} slots={run.slice(0, sp.n).map(coffeeNode)} empty="—" />
            <span style={CO.data({ fontSize: 11.5, color: "var(--ink-subtle)" })}>
              {count ? `Filled in order, left to right · ${sheets} ${sheets === 1 ? "sheet" : "sheets"} · ${last} of ${sp.n} used on the last` : "No lines selected"}
            </span>
          </div>
        )}
        {saveBtn(count, () => onPrint({ spec: sp, slots: run.map(coffeeNode) }))}
      </Preview>
    </div>
  );
}

// ---------- manual ----------
function ManualLabel({ lots, idx, onPrint, format, setFormat }: PrintProps & { lots: GreenLot[]; idx: LotIndex }) {
  const [spots, setSpots] = useState(() => new Set([0]));
  const sp = SHEETS.coffee;
  const [m, setM] = useState<Manual>(() => ({ name: "House blend", sel: lots.slice(0, 2).map((l) => l.id), roast: 3, sizeId: "1lb", grind: "Whole bean", notes: "", roastedOn: today(), site: SITE, copies: "1" }));
  const up = <K extends keyof Manual>(k: K, v: Manual[K]) => setM((x) => ({ ...x, [k]: v }));
  const d = fromManual(m, idx);
  const free = lots.filter((l) => !m.sel.includes(l.id));
  const copies = Math.max(1, Math.min(500, parseInt(m.copies, 10) || 1));
  return (
    <div className="lg-grid">
      <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Head label="Coffee" />
          <Field label="Name on label"><input value={m.name} onChange={(e) => up("name", e.target.value)} style={inp} /></Field>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={CO.over({ fontSize: 9.5, color: "var(--ink-muted)" })}>Components</span>
            {m.sel.map((id, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 22, height: 22, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                <select aria-label={`Coffee ${i + 1}`} value={id} onChange={(e) => up("sel", m.sel.map((x, j) => (j === i ? e.target.value : x)))} style={{ ...inp, flex: 1, minWidth: 0 }}>
                  {lots.filter((l) => l.id === id || !m.sel.includes(l.id)).map((l) => <option key={l.id} value={l.id}>{l.name} · {country(l.origin)}</option>)}
                </select>
                <button type="button" onClick={() => up("sel", m.sel.filter((_, j) => j !== i))} disabled={m.sel.length < 2} aria-label="Remove coffee"
                  style={{ ...inp, width: 36, padding: 0, flexShrink: 0, cursor: m.sel.length < 2 ? "default" : "pointer", color: "var(--ink-muted)", opacity: m.sel.length < 2 ? .4 : 1 }}>−</button>
              </div>
            ))}
            {lots.length === 0 && <span style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--ink-subtle)" }}>No green coffees in the catalog yet.</span>}
            {m.sel.length < 4 && free.length > 0 && <div><Btn size="sm" variant="outline" onClick={() => up("sel", [...m.sel, free[0].id])} icon={<Icon name="plus" size={14} />}>Add a coffee</Btn></div>}
          </div>
          <Field label="Tasting notes" hint={m.notes ? "Separate notes with a slash." : `From the cupping scores: ${d.words.join(" / ") || "—"}`}>
            <input value={m.notes} placeholder={d.words.join(" / ")} onChange={(e) => up("notes", e.target.value)} style={inp} />
          </Field>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Head label="Roast and bag" />
          <div role="radiogroup" aria-label="Roast" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(92px,1fr))", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => {
              const on = m.roast === n;
              return (
                <button type="button" role="radio" aria-checked={on} key={n} onClick={() => up("roast", n)} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 7, padding: "9px 9px 10px", cursor: "pointer", border: `1px solid ${on ? "var(--brand)" : "var(--hairline-strong)"}`, background: on ? "var(--brand-soft)" : "var(--surface)", borderRadius: "var(--r-sm)", minWidth: 0 }}>
                  <span style={{ display: "flex", gap: 2, width: "100%" }}>{[1, 2, 3, 4, 5].map((k) => <span key={k} style={{ flex: 1, height: 5, borderRadius: 1, background: k <= n ? RED : OFF }} />)}</span>
                  <span style={CO.over({ fontSize: 9, color: on ? "var(--brand-hover)" : "var(--ink)", textAlign: "left", overflowWrap: "anywhere" })}>{roastName(n)}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))", gap: 14 }}>
            <Field label="Bag size">
              <div role="radiogroup" aria-label="Bag size" style={{ display: "grid", gridTemplateColumns: `repeat(${SHOP_SIZES.length},minmax(0,1fr))`, gap: 2, padding: 2, border: "1px solid var(--hairline)", borderRadius: "var(--r-md)" }}>
                {SHOP_SIZES.map((z) => {
                  const on = z.id === m.sizeId;
                  return <button type="button" role="radio" aria-checked={on} key={z.id} onClick={() => up("sizeId", z.id)} style={{ height: 30, padding: 0, border: "none", borderRadius: "var(--r-sm)", cursor: "pointer", background: on ? "var(--ink)" : "transparent", color: on ? "var(--on-ink)" : "var(--ink-muted)", fontFamily: "var(--font-sans)", fontSize: 12.5, fontWeight: on ? 600 : 500, whiteSpace: "nowrap" }}>{z.label}</button>;
                })}
              </div>
            </Field>
            <Field label="Grind"><select value={m.grind} onChange={(e) => up("grind", e.target.value)} style={inp}>{GRINDS.map((g) => <option key={g}>{g}</option>)}</select></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,180px),1fr))", gap: 14 }}>
            <Field label="Roasted on" hint="Leave blank to write it by hand."><input value={m.roastedOn} onChange={(e) => up("roastedOn", e.target.value)} style={{ ...inp, ...CO.data({ fontSize: 13 }) }} /></Field>
            <Field label="Website"><input value={m.site} onChange={(e) => up("site", e.target.value)} style={inp} /></Field>
          </div>
        </div>
      </div>
      <Preview d={d} caption={format === "sheet" ? `${spots.size} of ${sp.n} spots on one letter sheet` : `${copiesWord(copies)} · one label per PDF page`}>
        <FormatPick value={format} onChange={setFormat} spec={sp} />
        {format === "sheet"
          ? <SpotPicker spec={sp} spots={spots} setSpots={setSpots} node={coffeeNode(d)} />
          : <Field label="Copies"><input type="number" min={1} max={500} value={m.copies} onChange={(e) => up("copies", e.target.value)} style={{ ...inp, ...CO.data({ fontSize: 13 }), maxWidth: 120 }} /></Field>}
        {format === "sheet"
          ? saveBtn(spots.size, () => onPrint({ spec: sp, slots: spotRun(sp, spots, coffeeNode(d)) }))
          : saveBtn(copies, () => onPrint({ spec: sp, slots: Array.from({ length: copies }, () => coffeeNode(d)) }))}
      </Preview>
    </div>
  );
}

// ---------- concentrate (8 × 3.5 in, the bottle wrap laid flat) ----------
/** The label as a print-resolution PNG, redrawn when the recipe changes. */
function useConcentrateLabel(baseId: string, flavorId: string, supps: string[]) {
  const key = `${baseId}|${flavorId}|${supps.join(",")}`;
  const [img, setImg] = useState<{ key: string; src: string } | null>(null);
  useEffect(() => {
    let live = true;
    concentrateLabelPng(ccLabel(baseId, flavorId, supps)).then((src) => { if (live) setImg({ key, src }); });
    return () => { live = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps -- key covers the recipe
  return img?.key === key ? img.src : null;
}

function Concentrate({ onPrint, format, setFormat }: PrintProps) {
  const [baseId, setBase] = useState(CC_BASES[0].id), [flavorId, setFlavor] = useState(CC_FLAVORS[0].id), [supps, setSupps] = useState<string[]>([]);
  const [copies, setCopies] = useState("1"), [spots, setSpots] = useState(() => new Set([0]));
  const sp = SHEETS.conc;
  const src = useConcentrateLabel(baseId, flavorId, supps);
  const nCopies = Math.max(1, Math.min(500, parseInt(copies, 10) || 1));
  const n = format === "sheet" ? spots.size : nCopies;
  const tile = (on: boolean) => ({ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, padding: "10px 12px", cursor: "pointer", textAlign: "left", border: `1px solid ${on ? "var(--brand)" : "var(--hairline-strong)"}`, background: on ? "var(--brand-soft)" : "var(--surface)", borderRadius: "var(--r-sm)", minWidth: 0 }) as const;
  const tileT = { display: "block", minWidth: 0, fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.25, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap" } as const;
  const node = src ? imgNode(src) : null;
  return (
    <div className="lg-grid">
      <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Head label="Base" />
          <div role="radiogroup" aria-label="Base" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 6 }}>
            {CC_BASES.map((b) => (
              <button type="button" role="radio" aria-checked={b.id === baseId} key={b.id} onClick={() => setBase(b.id)} style={tile(b.id === baseId)}>
                <span style={tileT}>{b.name}</span>
                <span style={{ display: "block", lineHeight: 1.3, ...CO.data({ fontSize: 11.5, color: "var(--ink-muted)", whiteSpace: "nowrap" }) }}>{b.caf} mg caffeine</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Head label="Flavor" />
          <div role="radiogroup" aria-label="Flavor" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 6 }}>
            {CC_FLAVORS.map((f) => (
              <button type="button" role="radio" aria-checked={f.id === flavorId} key={f.id} onClick={() => setFlavor(f.id)} style={tile(f.id === flavorId)}>
                <span style={tileT}>{f.name}</span>
                <span style={{ display: "block", lineHeight: 1.3, ...CO.over({ fontSize: 9, color: "var(--ink-subtle)" }) }}>{f.notes.join(" / ")}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Head label="Add-ins" right={`${supps.length} of ${CC_MAX_SUPPS}`} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 6 }}>
            {CC_SUPPS.map((x) => {
              const on = supps.includes(x.id), full = !on && supps.length >= CC_MAX_SUPPS;
              return (
                <button type="button" aria-pressed={on} key={x.id} disabled={full} onClick={() => setSupps((a) => (on ? a.filter((y) => y !== x.id) : [...a, x.id]))}
                  style={{ ...tile(on), flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 10, opacity: full ? .45 : 1, cursor: full ? "default" : "pointer" }}>
                  <span style={tileT}>{x.name}</span>
                  <span style={{ display: "block", lineHeight: 1.3, flexShrink: 0, ...CO.data({ fontSize: 11.5, color: on ? "var(--brand-hover)" : "var(--ink-muted)", whiteSpace: "nowrap" }) }}>{x.dose}</span>
                </button>
              );
            })}
          </div>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--ink-subtle)" }}>Up to three per bottle. Each is listed per 1.5 fl oz serving.</span>
        </div>
      </div>
      <Preview size={sp.size} caption={format === "sheet" ? `${spots.size} of ${sp.n} spots on one letter sheet` : `${copiesWord(n)} · one label per PDF page`}
        art={<div style={{ aspectRatio: `${CC_W} / ${CC_H}`, background: "var(--surface-sunken)" }}>{node}</div>}>
        <FormatPick value={format} onChange={setFormat} spec={sp} />
        {format === "sheet"
          ? <SpotPicker spec={sp} spots={spots} setSpots={setSpots} node={node} />
          : <Field label="Copies"><input type="number" min={1} max={500} value={copies} onChange={(e) => setCopies(e.target.value)} style={{ ...inp, ...CO.data({ fontSize: 13 }), maxWidth: 120 }} /></Field>}
        {saveBtn(n, () => src && onPrint({ spec: sp, slots: format === "sheet" ? spotRun(sp, spots, imgNode(src)) : Array.from({ length: n }, () => imgNode(src)) }), !!src)}
      </Preview>
    </div>
  );
}

export function LabelGeneratorView({ orders, lots, stock }: { orders: AdminOrder[]; lots: GreenLot[]; stock: StockCoffee[] }) {
  const [kind, setKind] = useState<"coffee" | "conc">("coffee");
  const [mode, setMode] = useState<"orders" | "manual">("orders");
  const [format, setFormat] = useState<Format>("single");
  const [roastedOn, setRoastedOn] = useState(today);
  const [job, setJob] = useState<Job | null>(null);
  const idx = useMemo(() => indexLots(lots), [lots]);
  const print = { onPrint: setJob, format, setFormat };
  return (
    <div className="lg-wrap" style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={CO.over({ fontSize: 9.5, color: "var(--ink-muted)" })}>Label</span>
        <Segmented options={[{ id: "coffee", label: `Coffee bag · ${SHEETS.coffee.size}` }, { id: "conc", label: `Concentrate · ${SHEETS.conc.size}` }]} value={kind} onChange={setKind} />
      </div>
      {kind === "coffee" && <Tabs tabs={[{ id: "orders", label: "From orders" }, { id: "manual", label: "Manual label" }]} active={mode} onChange={setMode} />}
      {kind === "conc" ? <Concentrate {...print} />
        : mode === "orders" ? <FromOrders orders={orders} idx={idx} stock={stock} roastedOn={roastedOn} setRoastedOn={setRoastedOn} {...print} />
        : <ManualLabel lots={lots} idx={idx} {...print} />}
      {job && <LgPrint job={job} format={format} onDone={() => setJob(null)} />}
    </div>
  );
}
