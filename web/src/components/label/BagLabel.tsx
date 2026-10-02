"use client";
// The bag label as SVG (BagLabel.jsx): admin label generator previews and
// prints, and the Coffee Lab's checkout preview. drawLabel() in
// lib/bag-label.ts paints the same label onto the 3D bag.
import { useSyncExternalStore } from "react";
import { radarGeom, roastName } from "@/lib/domain/coffee";
import { LABEL_COLORS, LABEL_H, LABEL_INK, LABEL_OFF, LABEL_PAPER, LABEL_RED, LABEL_SOFT, LABEL_W, fit, resetMeasure, textWidth, type LabelData } from "@/lib/bag-label";

const W = LABEL_W, H = LABEL_H, COLORS = LABEL_COLORS, INK = LABEL_INK, SOFT = LABEL_SOFT, RED = LABEL_RED, PAPER = LABEL_PAPER, OFF = LABEL_OFF;

/**
 * True once in the browser with web fonts loaded. Labels are only drawn then:
 * text is sized by measuring the real font, which the server can't do (and
 * hydration would keep the server's guessed sizes).
 */
const fontsSub = (cb: () => void) => { let live = true; document.fonts?.ready.then(() => { if (live) { resetMeasure(); cb(); } }); return () => { live = false; }; };
const useFontsReady = () => useSyncExternalStore(fontsSub, () => !document.fonts || document.fonts.status === "loaded", () => false);


/** One fitted line of label text; squeezes with textLength if still too wide at the floor size. */
function LgText({ t, x, y, size, wt = 400, ls = 0, maxW, min, fill = INK, anchor = "start", upper }: {
  t: string; x: number; y: number; size: number; wt?: number; ls?: number; maxW?: number; min?: number; fill?: string; anchor?: "start" | "end"; upper?: boolean;
}) {
  const s = upper ? t.toUpperCase() : t;
  const fs = maxW ? fit(s, size, wt, ls, maxW, min || size * .5) : size;
  const squeeze = maxW != null && textWidth(s, fs, wt, ls) > maxW;
  return (
    <text x={x} y={y} fill={fill} textAnchor={anchor} fontWeight={wt} fontSize={fs.toFixed(2)} letterSpacing={ls ? (ls * fs).toFixed(2) : undefined}
      style={{ fontFamily: "var(--font-mono)", fontVariationSettings: '"wdth" 100' }} {...(squeeze ? { textLength: maxW, lengthAdjust: "spacingAndGlyphs" } : {})}>{s}</text>
  );
}

export function LabelArt({ d }: { d: LabelData }) {
  if (!useFontsReady()) return <div aria-hidden="true" style={{ aspectRatio: `${W} / ${H}`, background: PAPER }} />;
  return <LabelSvg d={d} />;
}

function LabelSvg({ d }: { d: LabelData }) {
  const parts = d.parts.slice(0, 4), n = Math.max(1, parts.length);
  const top = 104, rowH = Math.min(86, 176 / n), swH = rowH - 9;
  const g = radarGeom(d.vals);
  const roastTxt = `${roastName(d.roast)} ROAST`;
  const rs = fit(roastTxt, 19, 500, .2, 250, 11), rw = textWidth(roastTxt, rs, 500, .2);
  const barR = 913 - rw - 12, seg = 14.5, gap = 2;
  const c0 = parts[0]?.color || COLORS[0], c1 = (parts[1] || parts[0])?.color || COLORS[1];
  const onW = textWidth("roasted on:", 21, 400);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "auto" }} role="img" aria-label={`Label: ${d.name}`}>
      <rect width={W} height={H} fill={PAPER} />
      <circle cx="489" cy="157" r="110" fill={c0} opacity=".08" />
      <circle cx="487" cy="289" r="113" fill={c1} opacity=".07" />
      <path d="M491 168H600V302H531A40 40 0 0 1 491 262Z" fill="#6B5A50" opacity=".035" />
      <LgText t={d.name || "Untitled"} x={52} y={76} size={72} wt={450} maxW={530} min={34} fill={RED} upper />
      <LgText t="roasted on:" x={612} y={42} size={21} fill={SOFT} />
      {d.roastedOn && <LgText t={d.roastedOn} x={612 + onW + 12} y={42} size={21} wt={500} maxW={913 - 624 - onW} min={12} />}
      {parts.map((p, i) => {
        const y = top + i * rowH;
        return (
          <g key={i}>
            <rect x="52" y={y + 4} width="82" height={swH} rx="3" fill={p.color} />
            <LgText t={p.name} x={153} y={y + rowH * .44} size={Math.min(31, rowH * .38)} wt={450} maxW={440} min={12} upper />
            {p.origin && <LgText t={p.origin} x={153} y={y + rowH * .86} size={Math.min(20, rowH * .25)} maxW={440} min={9} fill={SOFT} upper />}
          </g>
        );
      })}
      <g transform={`translate(784 200) scale(${115 / 150}) translate(-240 -240)`}>
        {[150, 109, 68].map((r) => <circle key={r} cx="240" cy="240" r={r} fill="none" stroke="rgba(26,26,24,.17)" strokeWidth="1.6" />)}
        {g.axes.map((a, i) => <line key={i} x1="240" y1="240" x2={a.sx.toFixed(1)} y2={a.sy.toFixed(1)} stroke="rgba(26,26,24,.17)" strokeWidth="1.6" />)}
        <path d={g.p1} fill="rgba(196,60,124,.32)" stroke="#C43C7C" strokeWidth="3.4" strokeLinejoin="round" />
        {g.axes.map((a, i) => a.v > .05 && <circle key={i} cx={a.dx.toFixed(1)} cy={a.dy.toFixed(1)} r="4.6" fill="#C43C7C" />)}
      </g>
      <LgText t={d.site || ""} x={52} y={365} size={20.5} ls={.04} maxW={470} min={11} fill={SOFT} />
      <LgText t={d.words.join(" / ")} x={52} y={405} size={18.5} wt={500} ls={.2} maxW={470} min={10} upper />
      {[1, 2, 3, 4, 5].map((k) => <rect key={k} x={barR - (6 - k) * seg - (5 - k) * gap} y={367 - rs * .36 - 4.3} width={seg} height="8.6" rx="1.6" fill={k <= d.roast ? RED : OFF} />)}
      <LgText t={roastTxt} x={913} y={367} size={rs} wt={500} ls={.2} anchor="end" />
      <LgText t={`${d.size} · ${d.grind}`} x={913} y={405} size={19} wt={500} ls={.2} maxW={330} min={10} anchor="end" upper />
    </svg>
  );
}
