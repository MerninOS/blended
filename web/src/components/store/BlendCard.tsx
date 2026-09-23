"use client";
// Checkout preview for custom blends: a small turnable carton (always "COFFEE
// LAB") beside the blend card — components, ratios, cup radar, roast, size.
import { useEffect, useRef } from "react";
import type { Notes, SelItem } from "@/lib/domain/types";
import { AX, radarGeom, rampColor, roastName } from "@/lib/domain/coffee";
import { useCatalog } from "./catalog-context";
import { mountBox } from "./box3d";

export const BC_COLORS = ["#EE8A1E", "#C43C7C", "#D93D18", "#8E2F52"];
const bcLogo = { fontFamily: "var(--font-logo)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1, color: "#1A1A18" } as const;
const bcTrack = { fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: ".14em", color: "#1A1A18" } as const;

export function BoxViewer() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current; if (!el) return;
    let cleanup: (() => void) | null = null, cancelled = false;
    mountBox(el, { cam: [0, .9, 5.6], look: [0, .82, 0], baseRot: -.5 }).then((c) => { if (cancelled) c(); else cleanup = c; });
    return () => { cancelled = true; cleanup?.(); };
  }, []);
  return <div ref={host} style={{ width: "100%", height: "100%" }} />;
}

export function BlendCard({ sel, vals, name, sizeLabel, roast }: { sel: SelItem[]; vals: Notes; name: string; sizeLabel: string; roast: number | null }) {
  const { idx } = useCatalog();
  const parts = sel.map((x, i) => {
    const g = idx.get(x.id);
    return { id: x.id, pct: x.pct, name: g?.name || x.id, origin: g?.origin || "", color: BC_COLORS[i % BC_COLORS.length] };
  });
  const g = radarGeom(vals);
  const words = AX.map((a) => ({ l: a.l, v: vals[a.k] || 0 })).sort((a, b) => b.v - a.v).slice(0, 3).map((a) => a.l);
  return (
    <div style={{ background: "#F0EDE5", border: "1px solid rgba(26,26,24,.08)", borderRadius: "var(--r-sm)", boxShadow: "0 1px 0 rgba(26,26,24,.04), 0 10px 24px -12px rgba(26,26,24,.28)", padding: "clamp(16px,2.2vw,24px)", display: "flex", flexDirection: "column", gap: "clamp(12px,1.6vw,18px)", minWidth: 0, height: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ ...bcLogo, fontSize: "clamp(24px,2.6vw,34px)", textTransform: "uppercase", overflowWrap: "anywhere", textWrap: "balance" }}>{name || "House blend"}</div>
          <div style={{ ...bcTrack, fontSize: 11, marginTop: 8, color: "#D93D18" }}>Custom Blend</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- small static brand mark */}
        <img src="/brand/blended-mark.png" alt="" style={{ width: "clamp(44px,4.6vw,60px)", height: "auto", mixBlendMode: "multiply", flexShrink: 0 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,3fr) minmax(160px,2fr)", gap: "clamp(16px,2.4vw,28px)", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px,2vw,24px)", minWidth: 0 }}>
          <div style={{ width: "clamp(40px,5vw,60px)", alignSelf: "stretch", minHeight: 90, display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
            {parts.map((p) => <span key={p.id} style={{ flex: `${Math.max(4, p.pct)} 1 0`, background: p.color, borderRadius: 2 }} />)}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {parts.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <span style={{ ...bcTrack, fontSize: "clamp(12px,1.3vw,15px)", lineHeight: 1.3, textWrap: "balance" }}>{p.name}</span>
                  <span style={{ ...bcTrack, fontSize: 9.5, letterSpacing: ".1em", color: "rgba(26,26,24,.62)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.origin}</span>
                </span>
                <span style={{ ...bcTrack, letterSpacing: ".06em", fontSize: "clamp(12px,1.3vw,15px)", lineHeight: 1.3, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "relative", width: "100%", maxWidth: 220, margin: "0 auto", aspectRatio: "1 / 1" }}>
          <svg viewBox="84 84 312 312" aria-hidden="true" style={{ position: "absolute", inset: "2%", width: "96%", height: "96%", overflow: "visible" }}>
            {[150, 109, 68].map((v) => <circle key={v} cx="240" cy="240" r={v} fill="none" stroke="rgba(26,26,24,.18)" strokeWidth="1.5" />)}
            {g.axes.map((a, i) => <line key={i} x1="240" y1="240" x2={a.sx.toFixed(1)} y2={a.sy.toFixed(1)} stroke="rgba(26,26,24,.18)" strokeWidth="1.5" />)}
            <path d={g.p1} fill="rgba(196,60,124,.32)" stroke="#C43C7C" strokeWidth="4" strokeLinejoin="round" />
            {g.axes.map((a, i) => <circle key={i} cx={a.dx.toFixed(1)} cy={a.dy.toFixed(1)} r="4.5" fill="#C43C7C" />)}
          </svg>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <span style={{ ...bcTrack, fontSize: "clamp(11px,1.2vw,14px)" }}>{words.join("  /  ")}</span>
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          {roast != null && (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "flex", gap: 2 }}>{[1, 2, 3, 4, 5].map((n) => <span key={n} style={{ width: 10, height: 6, borderRadius: 1, background: n <= Math.round(roast) ? rampColor(roast) : "rgba(26,26,24,.14)" }} />)}</span>
              <span style={{ ...bcTrack, fontSize: "clamp(11px,1.2vw,14px)" }}>{roastName(roast)} roast</span>
            </span>
          )}
          <span style={{ ...bcTrack, fontSize: "clamp(11px,1.2vw,14px)", textAlign: "right", lineHeight: 1.6 }}>{sizeLabel} · Whole bean</span>
        </span>
      </div>
    </div>
  );
}
