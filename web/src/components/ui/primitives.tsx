// CoffeeOS × Blended primitives: action = ink, red = live register, hairline
// borders, tight radii, mono figures. Ported from coffeeos/PortalPrimitives.jsx,
// coffeeos/BlendBuilder.jsx (RuleHead, Stepper) and PrivateLabelView.jsx (LineItem).
import type { CSSProperties, ReactNode } from "react";
import { money } from "@/lib/domain/coffee";

// ---- shared type styles ----
export const over: CSSProperties = { fontFamily: "var(--font-mono)", fontVariationSettings: "var(--overline-settings)", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" };
export const mono: CSSProperties = { fontFamily: "var(--font-mono)", fontVariationSettings: "var(--data-settings)", fontVariantNumeric: "tabular-nums" };
export const disp: CSSProperties = { fontFamily: "var(--font-display)", fontVariationSettings: "var(--display-settings)", fontWeight: 700, letterSpacing: "var(--display-tracking)", textTransform: "uppercase" };

// admin worksheet helpers (coffeeos/parts.jsx `CO`)
export const CO = {
  display: (x: CSSProperties = {}): CSSProperties => ({ fontFamily: "var(--font-display)", fontVariationSettings: "var(--display-settings)", fontWeight: 700, letterSpacing: "var(--display-tracking)", ...x }),
  data: (x: CSSProperties = {}): CSSProperties => ({ fontFamily: "var(--font-mono)", fontVariationSettings: "var(--data-settings)", fontWeight: 450, fontVariantNumeric: "tabular-nums", ...x }),
  over: (x: CSSProperties = {}): CSSProperties => ({ fontFamily: "var(--font-mono)", fontVariationSettings: "var(--overline-settings)", fontWeight: 600, letterSpacing: "var(--overline-tracking)", textTransform: "uppercase", ...x }),
};

// ---- Button ----
type BtnVariant = "primary" | "dark" | "secondary" | "outline" | "ghost" | "danger";
const BTN: Record<BtnVariant, { bg: string; fg: string; bd: string }> = {
  primary: { bg: "var(--ink)", fg: "var(--on-ink)", bd: "var(--ink)" },
  dark: { bg: "var(--ink)", fg: "var(--on-ink)", bd: "var(--ink)" },
  secondary: { bg: "var(--surface-sunken)", fg: "var(--ink)", bd: "var(--hairline)" },
  outline: { bg: "var(--surface)", fg: "var(--ink)", bd: "var(--hairline-strong)" },
  ghost: { bg: "transparent", fg: "var(--ink-muted)", bd: "transparent" },
  danger: { bg: "var(--danger)", fg: "#fff", bd: "var(--danger)" },
};
export function btnStyle(variant: BtnVariant = "primary", size: "sm" | "md" | "lg" = "md", disabled = false): CSSProperties {
  const V = BTN[variant];
  const h = { sm: 32, md: 38, lg: 44 }[size];
  const px = { sm: 12, md: 16, lg: 20 }[size];
  const fs = { sm: 12.5, md: 13.5, lg: 14.5 }[size];
  return {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, height: h, padding: `0 ${px}px`,
    borderRadius: "var(--r-md)", border: `1px solid ${V.bd}`, background: V.bg, color: V.fg,
    fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: fs, letterSpacing: 0, textTransform: "none", textDecoration: "none",
    cursor: disabled ? "not-allowed" : "pointer", boxShadow: "none", opacity: disabled ? .5 : 1, whiteSpace: "nowrap",
    transition: "background var(--dur) var(--ease), transform var(--dur) var(--ease)",
  };
}
/** An anchor that looks like a Btn (for navigation). */
export function LinkBtn({ href, variant = "primary", size = "md", children, icon }: { href: string; variant?: BtnVariant; size?: "sm" | "md" | "lg"; children: ReactNode; icon?: ReactNode }) {
  return <a href={href} className="co-btn" style={{ ...btnStyle(variant, size), color: BTN[variant].fg }}>{children}{icon}</a>;
}

export function Btn({ variant = "primary", size = "md", children, onClick, icon, iconLeft, disabled, style, type = "button", className }: {
  variant?: BtnVariant; size?: "sm" | "md" | "lg"; children?: ReactNode; onClick?: () => void; icon?: ReactNode; iconLeft?: ReactNode;
  disabled?: boolean; style?: CSSProperties; type?: "button" | "submit"; className?: string;
}) {
  return (
    <button type={type} onClick={disabled ? undefined : onClick} className={"co-btn" + (className ? " " + className : "")} disabled={disabled}
      style={{ ...btnStyle(variant, size, disabled), ...style }}>{iconLeft}{children}{icon}</button>
  );
}

// ---- Pill: tonal, meaningful. Red reserved for live. ----
export type PillVariant = "tomato" | "sun" | "matcha" | "sky" | "cream" | "fog" | "espresso";
const PILL: Record<PillVariant, { bg: string; fg: string; d: string }> = {
  tomato: { bg: "var(--brand-soft)", fg: "var(--brand)", d: "var(--brand)" },
  sun: { bg: "var(--warning-soft)", fg: "var(--warning)", d: "var(--warning)" },
  matcha: { bg: "var(--success-soft)", fg: "var(--success)", d: "var(--success)" },
  sky: { bg: "var(--info-soft)", fg: "var(--info)", d: "var(--info)" },
  cream: { bg: "var(--surface-sunken)", fg: "var(--ink-muted)", d: "var(--ink-subtle)" },
  fog: { bg: "var(--surface-sunken)", fg: "var(--ink-muted)", d: "var(--ink-subtle)" },
  espresso: { bg: "var(--ink)", fg: "var(--on-ink)", d: "var(--on-ink)" },
};
export function Pill({ variant = "tomato", dot, pulse, children, style }: { variant?: PillVariant; dot?: boolean; pulse?: boolean; children: ReactNode; style?: CSSProperties }) {
  const M = PILL[variant];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: "var(--r-pill)",
      background: M.bg, color: M.fg, fontFamily: "var(--font-mono)", fontVariationSettings: "var(--overline-settings)",
      fontWeight: 600, fontSize: 10, letterSpacing: ".05em", textTransform: "uppercase", whiteSpace: "nowrap", ...style }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: M.d, animation: pulse ? "co-pulse 1.5s ease-in-out infinite" : "none", flexShrink: 0 }} />}
      {children}
    </span>
  );
}

export function Dot({ color = "matcha", pulse = false, size = 8 }: { color?: string; pulse?: boolean; size?: number }) {
  const map: Record<string, string> = { tomato: "var(--brand)", matcha: "var(--success)", sun: "var(--warning)", sky: "var(--info)", fog: "var(--ink-subtle)", espresso: "var(--ink)" };
  return <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: map[color] || "var(--success)", animation: pulse ? "co-pulse 1.5s ease-in-out infinite" : "none", flexShrink: 0 }} />;
}

// ---- Field + input styling ----
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ ...over, fontSize: 10.5, color: "var(--ink-muted)" }}>{label}</span>
      {children}
    </label>
  );
}
export const inp: CSSProperties = { padding: "9px 12px", border: "1px solid var(--hairline-strong)", borderRadius: "var(--r-md)", background: "var(--surface)", fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--ink)", outline: "none", width: "100%" };

// ---- numbered worksheet step ----
export function Step({ n, title, children, id }: { n: number; title: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="pv-step" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="pv-stepnum" style={{ width: 24, height: 24, borderRadius: "var(--r-md)", background: "var(--ink)", color: "var(--on-ink)", display: "inline-flex", alignItems: "center", justifyContent: "center", ...mono, fontSize: 12, fontWeight: 500 }}>{n}</span>
        <h2 style={{ ...disp, fontSize: 19, margin: 0, color: "var(--ink)", lineHeight: 1 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function RuleHead({ label, right }: { label: string; right?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, paddingBottom: 10, borderBottom: "1px solid var(--hairline-strong)" }}>
      <span style={{ ...over, fontSize: 10.5, color: "var(--ink-muted)" }}>{label}</span>{right}
    </div>
  );
}

export function Stepper({ glyph, side, onClick, label }: { glyph: "+" | "−"; side: "l" | "r"; onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label || (glyph === "+" ? "Increase" : "Decrease")} style={{
      width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
      border: "1px solid var(--hairline-strong)", background: "var(--surface)", color: "var(--ink-muted)", cursor: "pointer", ...mono, fontSize: 13, lineHeight: 1,
      borderRadius: side === "l" ? "var(--r-sm) 0 0 var(--r-sm)" : "0 var(--r-sm) var(--r-sm) 0",
    }}>{glyph}</button>
  );
}

export function LineItem({ k, sub, v, negative }: { k: string; sub: string; v: number; negative?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--hairline)" }}>
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--ink)" }}>{k}</span>
        <span style={{ ...mono, fontSize: 11.5, color: "var(--ink-subtle)" }}>{sub}</span>
      </span>
      <span style={{ ...mono, fontSize: 13.5, color: negative ? "var(--success)" : "var(--ink)", whiteSpace: "nowrap" }}>{negative ? "−" : ""}{money(v)}</span>
    </div>
  );
}

/** Product photo with a quiet sunken placeholder when Shopify has no image. */
export function Photo({ src, alt, radius = 5, cls, style, placeholder }: { src: string | null; alt: string; radius?: number; cls?: string; style?: CSSProperties; placeholder?: string }) {
  return (
    <div className={cls ? cls + "-wrap" : undefined} style={{ width: "100%", flexShrink: 0, position: "relative", ...style }}>
      {src
        // eslint-disable-next-line @next/next/no-img-element -- Shopify CDN images are already optimized/resized via URL params
        ? <img src={src} alt={alt} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: radius, display: "block" }} />
        : <div aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: radius, background: "var(--surface-sunken)", display: "flex", alignItems: "center", justifyContent: "center", ...over, fontSize: 9, color: "var(--ink-subtle)", textAlign: "center", padding: 6 }}>{placeholder}</div>}
    </div>
  );
}

export function Toast({ children, tone = "success" }: { children: ReactNode; tone?: "success" | "danger" }) {
  return (
    <div role="status" style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", padding: "12px 18px", background: "var(--ink)", color: "var(--on-ink)", borderRadius: "var(--r-md)", boxShadow: "var(--shadow-pop)", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13.5, zIndex: 1000, display: "flex", alignItems: "center", gap: 8, maxWidth: "calc(100vw - 32px)" }}>
      <span style={{ color: tone === "success" ? "var(--success)" : "var(--brand)", display: "inline-flex" }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">{tone === "success" ? <polyline points="20 6 9 17 4 12" /> : <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>}</svg>
      </span>
      {children}
    </div>
  );
}
