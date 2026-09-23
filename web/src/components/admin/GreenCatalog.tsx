"use client";
// Green catalog (GreenAdmin.jsx): the coffees customers can blend — photo,
// cupping scores (drive the tasting wheel), price, on-hand, min grams, roast.
// Saves to Shopify products tagged blended-green (stock = Shopify inventory, grams).
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { GreenLot } from "@/lib/domain/types";
import {
  AGTRON, AX, DROP_F, G_PER_LB, MING_DEFAULT, ROAST_DESC, minG, minPctFor, money, money0, radarGeom, rampColor, retailOf,
  roastName, roastedCost, wholesaleOf,
} from "@/lib/domain/coffee";
import { Btn, CO, Photo, Pill, Toast } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { HeroMetric, SearchInput, StatStrip, downloadCsv } from "./parts";
import { deleteLotAction, finalizeLotImage, resetDemoCatalog, saveLotAction, stageLotImage } from "@/app/admin/actions";

const PROCESS = ["Washed", "Natural", "Honey", "Co-ferment", "Anaerobic", "Sugarcane EA"];
const top3 = (notes: GreenLot["notes"]) => AX.map((a) => ({ l: a.l, v: notes[a.k] || 0 })).filter((n) => n.v > 0).sort((a, b) => b.v - a.v).slice(0, 3);
const blank = (): GreenLot => ({ id: "", name: "", origin: "", lot: "", process: "Washed", roast: 3, price: 7, wholesale: null, retail: null, avail: 0, minG: MING_DEFAULT, kind: "anchor", tag: null, listed: true, notes: {}, image: null });

const input = { width: "100%", padding: "9px 11px", border: "1px solid var(--hairline-strong)", borderRadius: "var(--r-sm)", background: "var(--surface)", color: "var(--ink)", fontFamily: "var(--font-sans)", fontSize: 13.5 } as const;
const monoInput = { ...input, fontFamily: "var(--font-mono)", fontVariationSettings: "var(--data-settings)" } as const;

function Wheel({ notes, roast }: { notes: GreenLot["notes"]; roast: number }) {
  const g = radarGeom(notes), rgb = rampColor(roast);
  const soft = (a: number) => rgb.replace("rgb(", "rgba(").replace(")", `,${a})`);
  const empty = AX.every((a) => !((notes[a.k] ?? 0) > 0));
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
      <svg viewBox="0 0 480 480" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {[150, 109, 68, 27].map((r) => <circle key={r} cx="240" cy="240" r={r} fill="none" stroke="var(--viz-grid)" strokeWidth="1" />)}
        {g.axes.map((a, i) => <line key={i} x1="240" y1="240" x2={a.sx.toFixed(1)} y2={a.sy.toFixed(1)} stroke="var(--viz-grid)" strokeWidth="1" />)}
        {!empty && <><path d={g.p2} fill={soft(.16)} /><path d={g.p1} fill={soft(.26)} stroke={rgb} strokeWidth="2.5" strokeLinejoin="round" /></>}
      </svg>
      {empty && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 18%", fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-subtle)" }}>Score the cup below and the wheel fills in.</div>}
    </div>
  );
}
const Head = ({ label, right }: { label: string; right?: string }) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, paddingBottom: 9, borderBottom: "1px solid var(--hairline-strong)" }}>
    <span style={CO.over({ fontSize: 10, color: "var(--ink-muted)" })}>{label}</span>
    {right && <span style={CO.data({ fontSize: 11.5, color: "var(--ink-subtle)" })}>{right}</span>}
  </div>
);
const F = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
    <span style={CO.over({ fontSize: 9.5, color: "var(--ink-muted)" })}>{label}</span>
    {children}
    {hint && <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--ink-subtle)" }}>{hint}</span>}
  </label>
);

function Editor({ row, isNew, busy, error, onChange, onClose, onSave, onDelete, onImage, imageState }: {
  row: GreenLot; isNew: boolean; busy: boolean; error: string | null; imageState: "idle" | "uploading" | "error";
  onChange: (r: GreenLot) => void; onClose: () => void; onSave: () => void; onDelete: () => void; onImage: (f: File) => void;
}) {
  const set = <K extends keyof GreenLot>(k: K, v: GreenLot[K]) => onChange({ ...row, [k]: v });
  const setNote = (k: string, v: number) => onChange({ ...row, notes: { ...row.notes, [k]: v } });
  const problem = !row.name.trim() ? "Name the coffee before saving." : !row.origin.trim() ? "Add an origin before saving."
    : AX.every((a) => !((row.notes[a.k] ?? 0) > 0)) ? "Score at least one tasting note — the wheel is built from these." : null;
  const cost = roastedCost(row.price);
  const r = Math.round(row.roast);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(36,24,18,.38)", zIndex: 400, animation: "co-fade .14s ease" }} />
      <aside role="dialog" aria-modal="true" aria-label={isNew ? "New green lot" : `Edit ${row.name}`} style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(600px,96vw)", zIndex: 401, background: "var(--surface)", borderLeft: "1px solid var(--hairline)", boxShadow: "var(--shadow-modal)", display: "flex", flexDirection: "column", animation: "co-slide .18s cubic-bezier(.2,.6,.2,1)" }}>
        <div style={{ padding: "18px 22px 16px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "flex-start", gap: 14, flexShrink: 0 }}>
          <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "var(--r-md)", background: "var(--surface-sunken)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: rampColor(row.roast) }}><Icon name="flame" size={19} stroke={2} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={CO.over({ fontSize: 9.5, color: "var(--ink-subtle)" })}>{isNew ? "New green lot" : row.lot || "No lot code"}</div>
            <h2 style={CO.display({ fontSize: 21, lineHeight: 1.05, margin: "5px 0 0", color: "var(--ink)" })}>{row.name.trim() || "Untitled coffee"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, flexShrink: 0, border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: "var(--surface)", color: "var(--ink-muted)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="x" size={16} stroke={2} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px 24px", display: "flex", flexDirection: "column", gap: 26 }}>
          <section style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ width: 128, flexShrink: 0 }}>
              <div style={CO.over({ fontSize: 9.5, color: "var(--ink-muted)", marginBottom: 6 })}>Photo</div>
              <label style={{ display: "block", width: 128, height: 128, cursor: "pointer", position: "relative" }}>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) onImage(f); }} style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} />
                <Photo src={row.image} alt={row.name} placeholder={imageState === "uploading" ? "Uploading…" : "Drop photo"} style={{ height: 128 }} />
              </label>
              {imageState === "error" && <div style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--danger)", marginTop: 6 }}>Upload failed</div>}
            </div>
            <div style={{ flex: "1 1 260px", minWidth: 240, display: "flex", flexDirection: "column", gap: 12 }}>
              <F label="Coffee name"><input value={row.name} onChange={(e) => set("name", e.target.value)} placeholder="Cerrado Norte" style={input} /></F>
              <F label="Origin"><input value={row.origin} onChange={(e) => set("origin", e.target.value)} placeholder="Brazil · Minas Gerais" style={input} /></F>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 140px" }}><F label="Lot code"><input value={row.lot} onChange={(e) => set("lot", e.target.value)} placeholder="LOT-2571" style={monoInput} /></F></div>
                <div style={{ flex: "1 1 140px" }}><F label="Process"><select value={row.process} onChange={(e) => set("process", e.target.value)} style={input}>{PROCESS.map((p) => <option key={p}>{p}</option>)}</select></F></div>
              </div>
            </div>
          </section>

          <section>
            <Head label="Price and stock" />
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14 }}>
              <div style={{ flex: "1 1 150px" }}><F label="Green cost $ / lb" hint={`${money(cost)}/lb roasted after 16% loss`}><input type="number" min={0} step="0.05" value={row.price} onChange={(e) => set("price", Math.max(0, +e.target.value || 0))} style={monoInput} /></F></div>
              <div style={{ flex: "1 1 150px" }}><F label="On hand (green lb)" hint={row.avail === 0 ? "Zero shows it as out of stock" : "Shopify inventory, counted in grams"}><input type="number" min={0} step={0.1} value={row.avail} onChange={(e) => set("avail", Math.max(0, +e.target.value || 0))} style={monoInput} /></F></div>
              <div style={{ flex: "1 1 170px" }}><F label="Min in a blend (g)" hint={minG(row) ? `${minPctFor(row, G_PER_LB)}% of a 1 lb bag · ${minPctFor(row, 5 * G_PER_LB)}% of a 5 lb run` : "No floor — any share allowed."}>
                <input type="number" min={0} step={10} value={row.minG ?? MING_DEFAULT} onChange={(e) => set("minG", Math.max(0, Math.round(+e.target.value || 0)))} style={monoInput} /></F></div>
              <div style={{ flex: "1 1 150px" }}><F label="Badge">
                <select value={row.tag ?? ""} onChange={(e) => set("tag", e.target.value || null)} style={input}>
                  <option value="">None</option><option>Limited</option><option>New</option><option>Back soon</option>
                </select></F></div>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14 }}>
              <div style={{ flex: "1 1 200px" }}><F label="Wholesale $ / lb roasted" hint={`${(wholesaleOf(row) / Math.max(.01, cost)).toFixed(2)}× cost · what private label accounts pay`}>
                <input type="number" min={0} step="0.05" value={wholesaleOf(row)} onChange={(e) => set("wholesale", Math.max(0, +e.target.value || 0))} style={monoInput} /></F></div>
              <div style={{ flex: "1 1 200px" }}><F label="Retail $ / lb roasted" hint={`${(retailOf(row) / Math.max(.01, cost)).toFixed(2)}× cost · ${money(Math.round(retailOf(row) * 0.5 * 1.2 * 4) / 4)} an 8 oz bag on the shop`}>
                <input type="number" min={0} step="0.05" value={retailOf(row)} onChange={(e) => set("retail", Math.max(0, +e.target.value || 0))} style={monoInput} /></F></div>
              <div style={{ flex: "1 1 150px", display: "flex", alignItems: "flex-end" }}>
                <button type="button" onClick={() => onChange({ ...row, wholesale: null, retail: null })} style={{ padding: 0, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand)", paddingBottom: 10 }}>Reset to standard markup</button>
              </div>
            </div>
          </section>

          <section>
            <Head label="Preferred roast" right={`Agtron ${AGTRON[r]} · drop ${DROP_F[r]}°F`} />
            <div role="radiogroup" aria-label="Preferred roast" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(96px,1fr))", gap: 6, marginTop: 14 }}>
              {[1, 2, 3, 4, 5].map((n) => {
                const on = r === n;
                return (
                  <button type="button" role="radio" aria-checked={on} key={n} onClick={() => set("roast", n)} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, padding: "9px 9px 10px", cursor: "pointer", textAlign: "left",
                    border: `1px solid ${on ? "var(--brand)" : "var(--hairline-strong)"}`, background: on ? "var(--brand-soft)" : "var(--surface)", borderRadius: "var(--r-sm)" }}>
                    <span style={{ width: "100%", height: 6, borderRadius: 2, background: `var(--roast-${n})` }} />
                    <span style={CO.over({ fontSize: 9.5, color: on ? "var(--brand-hover)" : "var(--ink)" })}>{roastName(n)}</span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, lineHeight: 1.3, color: "var(--ink-subtle)" }}>{ROAST_DESC[n]}</span>
                  </button>
                );
              })}
            </div>
            <p style={{ margin: "10px 0 0", fontFamily: "var(--font-sans)", fontSize: 12, lineHeight: 1.5, color: "var(--ink-subtle)" }}>Customers can move the roast on their blend. This is where the builder starts, and what the wheel is scored at.</p>
          </section>

          <section>
            <Head label="Tasting notes" right="0–10 cupping scores" />
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 14 }}>
              <div style={{ flex: "1 1 260px", minWidth: 240, display: "flex", flexDirection: "column", gap: 9 }}>
                {AX.map((a) => {
                  const v = row.notes[a.k] || 0;
                  return (
                    <div key={a.k} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <span style={{ width: 82, flexShrink: 0, ...CO.over({ fontSize: 9, color: v ? "var(--ink)" : "var(--ink-subtle)" }) }}>{a.l}</span>
                      <input type="range" aria-label={a.l} min={0} max={10} step={0.5} value={v} onChange={(e) => setNote(a.k, +e.target.value)} style={{ flex: 1, minWidth: 0, accentColor: "var(--ink)", cursor: "pointer" }} />
                      <span style={{ width: 28, textAlign: "right", ...CO.data({ fontSize: 12, color: v ? "var(--ink)" : "var(--ink-subtle)" }) }}>{v ? v.toFixed(1) : "—"}</span>
                    </div>
                  );
                })}
                <button type="button" onClick={() => onChange({ ...row, notes: {} })} style={{ alignSelf: "flex-start", marginTop: 4, padding: 0, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--brand)" }}>Clear all scores</button>
              </div>
              <div style={{ flex: "0 1 210px", minWidth: 180 }}>
                <Wheel notes={row.notes} roast={row.roast} />
                <div style={{ marginTop: 8, textAlign: "center", ...CO.data({ fontSize: 11.5, color: "var(--ink-subtle)" }) }}>{top3(row.notes).map((n) => n.l).join(" · ") || "No notes yet"}</div>
              </div>
            </div>
          </section>

          <section>
            <Head label="Listing" />
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0 0" }}>
              <button type="button" role="switch" aria-checked={row.listed} onClick={() => set("listed", !row.listed)} aria-label="Listed on the storefront" style={{ width: 38, height: 22, flexShrink: 0, borderRadius: 11, border: "1px solid var(--hairline-strong)", background: row.listed ? "var(--ink)" : "var(--surface-sunken)", cursor: "pointer", padding: 2, display: "flex", justifyContent: row.listed ? "flex-end" : "flex-start", transition: "all var(--dur) var(--ease)" }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: row.listed ? "var(--on-ink)" : "var(--surface)", boxShadow: "var(--shadow-sm)" }} />
              </button>
              <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.55, color: "var(--ink-muted)" }}>
                {row.listed ? "Showing in the blend builder on the shop page." : "Hidden from customers. Existing orders that use it keep their recipe."}
              </span>
            </div>
          </section>
        </div>

        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--hairline)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
          {!isNew && <Btn size="sm" variant="ghost" disabled={busy} onClick={onDelete}>Delete</Btn>}
          {(problem || error) ? <span role="alert" style={{ flex: "1 1 220px", minWidth: 0, fontFamily: "var(--font-sans)", fontSize: 12, lineHeight: 1.45, color: "var(--danger)" }}>{error || problem}</span> : <div style={{ flex: 1 }} />}
          <Btn size="sm" variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn size="sm" variant="primary" disabled={!!problem || busy || imageState === "uploading"} icon={<Icon name="check" size={14} />} onClick={onSave}>{busy ? "Saving…" : isNew ? "Add coffee" : "Save changes"}</Btn>
        </div>
      </aside>
    </>
  );
}

export function GreenCatalogView({ rows, demo }: { rows: GreenLot[]; demo: boolean }) {
  const router = useRouter();
  const [draft, setDraft] = useState<GreenLot | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [imageFileId, setImageFileId] = useState<string | undefined>(undefined);
  const [imageState, setImageState] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [busy, start] = useTransition();

  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return n ? rows.filter((r) => [r.name, r.origin, r.lot].some((s) => s.toLowerCase().includes(n))) : rows;
  }, [rows, q]);
  const listed = rows.filter((r) => r.listed && r.avail > 0);
  const lbs = rows.reduce((a, r) => a + r.avail, 0);
  const value = rows.reduce((a, r) => a + r.avail * r.price, 0);
  const unscored = rows.filter((r) => AX.every((a) => !((r.notes[a.k] ?? 0) > 0)));

  const openEditor = (r: GreenLot | null) => { setDraft(r ? { ...r, notes: { ...r.notes } } : blank()); setIsNew(!r); setImageFileId(undefined); setImageState("idle"); setError(null); };
  const done = (msg: string) => { setDraft(null); setToast(msg); setTimeout(() => setToast(null), 2600); router.refresh(); };

  const uploadImage = async (file: File) => {
    if (!draft) return;
    const preview = URL.createObjectURL(file);
    setDraft((d) => (d ? { ...d, image: preview } : d));
    setImageState("uploading");
    try {
      const t = await stageLotImage(file.name, file.type, file.size);
      if ("demo" in t) { setImageState("idle"); return; } // demo: preview only
      const form = new FormData();
      t.parameters.forEach((p) => form.append(p.name, p.value));
      form.append("file", file);
      const up = await fetch(t.url, { method: "POST", body: form });
      if (!up.ok) throw new Error("upload");
      const f = await finalizeLotImage(t.resourceUrl, file.name, draft.name || "Green coffee");
      setImageFileId(f.fileId ?? undefined); setImageState("idle");
    } catch { setImageState("error"); }
  };
  const save = () => draft && start(async () => {
    const r = await saveLotAction(draft, imageFileId);
    if (r.ok) done(isNew ? `${draft.name} added` : `${draft.name} saved`); else setError(r.error);
  });
  const del = () => draft && confirm(`Delete ${draft.name}? It's archived in Shopify with its inventory history, and past orders keep their recipe.`) && start(async () => {
    const r = await deleteLotAction(draft);
    if (r.ok) done(`${draft.name} deleted`); else setError(r.error);
  });
  const exportCsv = () => downloadCsv("green-catalog.csv", [
    ["Name", "Origin", "Lot", "Process", "Roast", "Green $/lb", "Wholesale $/lb", "Retail $/lb", "On hand lb", "Min g", "Listed", ...AX.map((a) => a.l)],
    ...rows.map((r) => [r.name, r.origin, r.lot, r.process, roastName(r.roast), r.price, wholesaleOf(r), retailOf(r), r.avail, minG(r), r.listed ? "yes" : "no", ...AX.map((a) => r.notes[a.k] ?? 0)]),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "20px 24px 40px", maxWidth: "var(--content-max)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <HeroMetric label="Green lots customers can blend" value={listed.length}
          caption={`${rows.length} in the catalog · ${Math.round(lbs).toLocaleString()} lb on hand${unscored.length ? ` · ${unscored.length} missing tasting notes` : ""}`} />
        <StatStrip items={[
          { label: "Green value", value: money0(value) },
          { label: "Hidden", value: rows.filter((r) => !r.listed).length },
          { label: "Out of stock", value: rows.filter((r) => r.avail === 0).length },
          { label: "Avg retail $ / lb", value: money(rows.length ? rows.reduce((a, r) => a + retailOf(r), 0) / rows.length : 0) },
        ]} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, background: "var(--surface-sunken)", border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", flexWrap: "wrap" }}>
        <div style={{ maxWidth: 320, flex: 1, display: "flex", minWidth: 200 }}><SearchInput placeholder="Coffee, origin, or lot" value={q} onChange={setQ} /></div>
        <div style={{ flex: 1 }} />
        <Btn size="sm" variant="outline" icon={<Icon name="download" size={14} />} onClick={exportCsv}>Export</Btn>
        <Btn size="sm" variant="primary" icon={<Icon name="plus" size={14} />} onClick={() => openEditor(null)}>Add coffee</Btn>
      </div>

      <div style={{ border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--surface)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1120 }}>
            <thead>
              <tr style={{ background: "var(--surface-sunken)", borderBottom: "1px solid var(--hairline)" }}>
                {([["Coffee", "left"], ["Process", "left"], ["Roast", "left"], ["Tasting notes", "left"], ["Green $", "right"], ["Wholesale", "right"], ["Retail", "right"], ["On hand", "right"], ["Min in blend", "right"], ["Listed", "left"]] as const).map(([h, al], i) => (
                  <th key={i} scope="col" style={{ textAlign: al, padding: "9px 14px", whiteSpace: "nowrap", ...CO.over({ fontSize: 10, color: "var(--ink-muted)" }) }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const t = top3(r.notes);
                return (
                  <tr key={r.id} tabIndex={0} onClick={() => openEditor(r)} onKeyDown={(e) => { if (e.key === "Enter") openEditor(r); }} style={{ borderBottom: "1px solid var(--hairline)", cursor: "pointer" }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "var(--surface-hover)")} onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, flexShrink: 0 }}><Photo src={r.image} alt="" style={{ height: 44 }} /></div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap" }}>{r.name || "Untitled"}</span>
                            {r.tag && <Pill variant="tomato">{r.tag}</Pill>}
                          </div>
                          <div style={CO.data({ fontSize: 11, color: "var(--ink-subtle)", marginTop: 2 })}>{[r.lot, r.origin].filter(Boolean).join(" · ")}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px" }}><span style={CO.over({ fontSize: 9.5, color: "var(--ink-muted)", whiteSpace: "nowrap" })}>{r.process}</span></td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                        <span style={{ width: 11, height: 11, borderRadius: "var(--r-sm)", background: rampColor(r.roast), boxShadow: "inset 0 0 0 1px rgba(0,0,0,.14)" }} />
                        <span style={CO.over({ fontSize: 9.5, color: "var(--ink-muted)" })}>{roastName(r.roast)}</span>
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      {t.length ? <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{t.map((n) => <Pill key={n.l} variant="cream">{n.l} {n.v.toFixed(0)}</Pill>)}</span>
                        : <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--danger)" }}>Not scored</span>}
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "right" }}><span style={CO.data({ fontSize: 12.5, color: "var(--ink-muted)" })}>{money(r.price)}</span></td>
                    <td style={{ padding: "11px 14px", textAlign: "right" }}><span style={CO.data({ fontSize: 13, color: "var(--ink)" })}>{money(wholesaleOf(r))}</span></td>
                    <td style={{ padding: "11px 14px", textAlign: "right" }}><span style={CO.data({ fontSize: 13, color: "var(--ink)" })}>{money(retailOf(r))}</span></td>
                    <td style={{ padding: "11px 14px", textAlign: "right" }}><span style={CO.data({ fontSize: 13, color: r.avail === 0 ? "var(--danger)" : r.avail < 500 ? "var(--warning)" : "var(--ink)" })}>{r.avail.toLocaleString("en-US", { maximumFractionDigits: 1 })}</span></td>
                    <td style={{ padding: "11px 14px", textAlign: "right" }}><span style={CO.data({ fontSize: 13, color: minG(r) ? "var(--ink)" : "var(--ink-subtle)" })}>{minG(r) ? minG(r) + " g" : "—"}</span></td>
                    <td style={{ padding: "11px 14px" }}>{r.avail === 0 ? <Pill variant="cream">Out</Pill> : r.listed ? <Pill variant="matcha">Listed</Pill> : <Pill variant="cream">Hidden</Pill>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 14px", borderTop: "1px solid var(--hairline)" }}>
          <span style={{ fontSize: 12, color: "var(--ink-muted)", fontFamily: "var(--font-sans)" }}>{rows.length} coffees · changes go live on the shop page</span>
          {demo && <Btn size="sm" variant="outline" onClick={() => start(async () => { await resetDemoCatalog(); router.refresh(); })}>Reset to defaults</Btn>}
        </div>
      </div>

      {draft && <Editor row={draft} isNew={isNew} busy={busy} error={error} imageState={imageState} onChange={setDraft} onClose={() => setDraft(null)} onSave={save} onDelete={del} onImage={uploadImage} />}
      {toast && <Toast>{toast}</Toast>}
    </div>
  );
}
