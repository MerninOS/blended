"use client";
// Checkout preview for custom blends: the turnable bag with the customer's own
// blend card on the front, beside the same card full size — components,
// ratios, cup radar, roast, size (BlendCard.jsx).
import { useEffect, useRef } from "react";
import type { Notes, SelItem } from "@/lib/domain/types";
import { AX, radarGeom, rampColor, roastName, type LotIndex } from "@/lib/domain/coffee";
import { useCatalog } from "./catalog-context";
import { mountBox, type BagCard, type BoxHandle } from "./box3d";

export const BC_COLORS = ["#EE8A1E", "#C43C7C", "#D93D18", "#8E2F52"];
const bcLogo = { fontFamily: "var(--font-logo)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1, color: "#1A1A18" } as const;
const bcTrack = { fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: ".14em", color: "#1A1A18" } as const;

/** What the bag's printed card shows for a blend. */
export function bcCardData({ sel, vals, name, sizeLabel, roast, idx }: { sel: SelItem[]; vals: Notes; name: string; sizeLabel: string; roast: number | null; idx: LotIndex }): BagCard {
  const parts = sel.map((x, i) => { const g = idx.get(x.id); return { name: g?.name || x.id, origin: g?.origin || "", pct: x.pct, color: BC_COLORS[i % BC_COLORS.length] }; });
  const g = radarGeom(vals);
  const words = AX.map((a) => ({ l: a.l, v: vals[a.k] || 0 })).sort((a, b) => b.v - a.v).slice(0, 3).map((a) => a.l);
  return {
    name: name || "House blend", parts, words, size: sizeLabel,
    radar: g.axes.map((a) => [(a.dx - 240) / 150, (a.dy - 240) / 150] as [number, number]),
    roast, roastName: roast != null ? roastName(roast) : null, roastColor: roast != null ? rampColor(roast) : "#C9404A",
  };
}

/** The bag, reprinted (debounced) whenever the blend changes. */
export function BoxViewer({ card }: { card?: BagCard }) {
  const host = useRef<HTMLDivElement>(null), handle = useRef<BoxHandle | null>(null), first = useRef(card);
  useEffect(() => {
    const el = host.current; if (!el) return;
    let cancelled = false;
    void mountBox(el, { cam: [0, .9, 5.6], look: [0, .82, 0], baseRot: -.5, card: first.current })
      .then((h) => { if (cancelled) h.dispose(); else handle.current = h; });
    return () => { cancelled = true; handle.current?.dispose(); handle.current = null; };
  }, []);
  const key = JSON.stringify(card ?? null);
  useEffect(() => {
    if (!card) return;
    const t = setTimeout(() => handle.current?.setCard(card), 200);
    return () => clearTimeout(t);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps -- keyed on the card's content
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
          <div style={{ ...bcLogo, fontSize: "clamp(36px,4.6vw,60px)", lineHeight: .9, textTransform: "uppercase" }}>Blended</div>
          <div style={{ ...bcTrack, fontSize: "clamp(13px,1.5vw,18px)", marginTop: 10, color: "#D93D18", overflowWrap: "anywhere" }}>{name || "Custom blend"}</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- small static brand mark */}
        <img src="/brand/blended-mark.png" alt="" style={{ width: "clamp(64px,7.4vw,100px)", height: "auto", mixBlendMode: "multiply", flexShrink: 0 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,3fr) minmax(160px,2fr)", gap: "clamp(16px,2.4vw,28px)", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px,2vw,24px)", minWidth: 0 }}>
          <div style={{ width: "clamp(48px,6vw,72px)", alignSelf: "stretch", minHeight: 110, display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
            {parts.map((p) => <span key={p.id} style={{ flex: `${Math.max(4, p.pct)} 1 0`, background: p.color, borderRadius: 2 }} />)}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            {parts.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                  <span style={{ ...bcTrack, fontSize: "clamp(14px,1.7vw,20px)", lineHeight: 1.25, textWrap: "balance" }}>{p.name}</span>
                  <span style={{ ...bcTrack, fontSize: "clamp(10.5px,1.1vw,13px)", letterSpacing: ".1em", color: "rgba(26,26,24,.62)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.origin}</span>
                </span>
                <span style={{ ...bcTrack, letterSpacing: ".06em", fontSize: "clamp(14px,1.7vw,20px)", lineHeight: 1.25, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "relative", width: "100%", maxWidth: 260, margin: "0 auto", aspectRatio: "1 / 1" }}>
          <svg viewBox="84 84 312 312" aria-hidden="true" style={{ position: "absolute", inset: "2%", width: "96%", height: "96%", overflow: "visible" }}>
            {[150, 109, 68].map((v) => <circle key={v} cx="240" cy="240" r={v} fill="none" stroke="rgba(26,26,24,.18)" strokeWidth="1.5" />)}
            {g.axes.map((a, i) => <line key={i} x1="240" y1="240" x2={a.sx.toFixed(1)} y2={a.sy.toFixed(1)} stroke="rgba(26,26,24,.18)" strokeWidth="1.5" />)}
            <path d={g.p1} fill="rgba(196,60,124,.32)" stroke="#C43C7C" strokeWidth="4" strokeLinejoin="round" />
            {g.axes.map((a, i) => <circle key={i} cx={a.dx.toFixed(1)} cy={a.dy.toFixed(1)} r="4.5" fill="#C43C7C" />)}
          </svg>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <span style={{ ...bcTrack, fontSize: "clamp(11px,1.3vw,15px)" }}>{words.join("  /  ")}</span>
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, marginLeft: "auto" }}>
          {roast != null && (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "flex", gap: 2 }}>{[1, 2, 3, 4, 5].map((n) => <span key={n} style={{ width: 14, height: 8, borderRadius: 1, background: n <= Math.round(roast) ? rampColor(roast) : "rgba(26,26,24,.14)" }} />)}</span>
              <span style={{ ...bcTrack, fontSize: "clamp(11px,1.3vw,15px)" }}>{roastName(roast)} roast</span>
            </span>
          )}
          <span style={{ ...bcTrack, fontSize: "clamp(11px,1.3vw,15px)", textAlign: "right", lineHeight: 1.6 }}>{sizeLabel} · Whole bean</span>
        </span>
      </div>
    </div>
  );
}
