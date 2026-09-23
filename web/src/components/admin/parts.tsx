"use client";
// Worksheet building blocks (coffeeos/parts.jsx): hero metric + stat strip,
// ruled tabs, segmented control, search, kbd chip, icon button.
import type { ReactNode } from "react";
import { CO } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

export function Kbd({ children }: { children: ReactNode }) {
  return <span style={{ ...CO.data({ fontSize: 10.5 }), display: "inline-flex", alignItems: "center", padding: "1px 6px", borderRadius: "var(--r-sm)", background: "var(--surface)", border: "1px solid var(--hairline-strong)", color: "var(--ink-muted)", boxShadow: "0 1px 0 var(--hairline-strong)", whiteSpace: "nowrap" }}>{children}</span>;
}

export function HeroMetric({ label, value, delta, deltaDir = "up", caption }: { label: string; value: ReactNode; delta?: string; deltaDir?: "up" | "down"; caption?: string }) {
  return (
    <div style={{ paddingBottom: 16, borderBottom: "1px solid var(--hairline)" }}>
      <div style={CO.over({ fontSize: 11, color: "var(--ink-muted)" })}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginTop: 6 }}>
        <div style={CO.display({ fontSize: "clamp(46px,5.4vw,72px)", lineHeight: .86, color: "var(--ink)" })}>{value}</div>
        {delta != null && <div style={{ display: "inline-flex", alignItems: "center", gap: 3, marginBottom: 9, ...CO.data({ fontSize: 14, fontWeight: 600 }), color: deltaDir === "down" ? "var(--danger)" : "var(--success)" }}>{deltaDir === "down" ? "↓" : "↑"} {delta}</div>}
      </div>
      {caption && <div style={{ marginTop: 9, fontSize: 13, color: "var(--ink-subtle)" }}>{caption}</div>}
    </div>
  );
}

export function StatStrip({ items }: { items: { label: string; value: ReactNode; live?: boolean }[] }) {
  return (
    <div className="co-statstrip" style={{ display: "grid", gridTemplateColumns: `repeat(${items.length},minmax(0,1fr))`, border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: "var(--surface-sunken)", overflow: "hidden" }}>
      {items.map((it, i) => (
        <div key={i} style={{ padding: "14px 16px", borderLeft: i ? "1px solid var(--hairline)" : "none" }}>
          <div style={CO.over({ fontSize: 10, color: "var(--ink-muted)" })}>{it.label}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
            <span style={CO.data({ fontSize: 24, color: it.live ? "var(--brand)" : "var(--ink)" })}>{it.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, active, onChange }: { tabs: { id: T; label: string; count?: number }[]; active: T; onChange: (id: T) => void }) {
  return (
    <div role="tablist" style={{ display: "flex", gap: 24, borderBottom: "1px solid var(--hairline)" }}>
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button type="button" role="tab" aria-selected={on} key={t.id} onClick={() => onChange(t.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 0 11px", display: "inline-flex", alignItems: "center", gap: 7, borderBottom: on ? "2px solid var(--brand)" : "2px solid transparent", marginBottom: -1, color: on ? "var(--ink)" : "var(--ink-muted)", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: on ? 600 : 500 }}>
            {t.label}
            {t.count != null && <span style={CO.data({ fontSize: 11, color: on ? "var(--brand)" : "var(--ink-subtle)" })}>{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (id: T) => void }) {
  return (
    <div role="radiogroup" style={{ display: "inline-flex", background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", padding: 2, gap: 2, flexShrink: 0 }}>
      {options.map((o) => {
        const on = o.id === value;
        return <button type="button" role="radio" aria-checked={on} key={o.id} onClick={() => onChange(o.id)} style={{ padding: "5px 13px", borderRadius: "var(--r-sm)", border: "none", cursor: "pointer", background: on ? "var(--ink)" : "transparent", color: on ? "var(--on-ink)" : "var(--ink-muted)", fontFamily: "var(--font-sans)", fontSize: 12.5, fontWeight: on ? 600 : 500, whiteSpace: "nowrap" }}>{o.label}</button>;
      })}
    </div>
  );
}

export function SearchInput({ placeholder = "Search", sunken = false, value, onChange }: { placeholder?: string; sunken?: boolean; value?: string; onChange?: (v: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 12px", height: 34, background: sunken ? "var(--surface-sunken)" : "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", flex: 1, minWidth: 0 }}>
      <span style={{ color: "var(--ink-subtle)", display: "inline-flex", flexShrink: 0 }}><Icon name="search" size={15} stroke={2} /></span>
      <input aria-label={placeholder} placeholder={placeholder} value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined} style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)" }} />
      <Kbd>⌘K</Kbd>
    </div>
  );
}

/** Download rows as CSV (client side). */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => { const s = String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
