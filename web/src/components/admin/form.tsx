// Small form pieces shared by the admin editors (green catalog, reviews).
import { CO } from "@/components/ui/primitives";

export const input = { width: "100%", padding: "9px 11px", border: "1px solid var(--hairline-strong)", borderRadius: "var(--r-sm)", background: "var(--surface)", color: "var(--ink)", fontFamily: "var(--font-sans)", fontSize: 13.5 } as const;
export const monoInput = { ...input, fontFamily: "var(--font-mono)", fontVariationSettings: "var(--data-settings)" } as const;

export const Head = ({ label, right }: { label: string; right?: string }) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, paddingBottom: 9, borderBottom: "1px solid var(--hairline-strong)" }}>
    <span style={CO.over({ fontSize: 10, color: "var(--ink-muted)" })}>{label}</span>
    {right && <span style={CO.data({ fontSize: 11.5, color: "var(--ink-subtle)" })}>{right}</span>}
  </div>
);
export const F = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
    <span style={CO.over({ fontSize: 9.5, color: "var(--ink-muted)" })}>{label}</span>
    {children}
    {hint && <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--ink-subtle)" }}>{hint}</span>}
  </label>
);
