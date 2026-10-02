// Bag label (3.25 × 1.5 in, 975 × 450 @ 300 dpi), shared by the admin label
// generator, the Coffee Lab's checkout preview and the card on the 3D bag
// (BagLabel.jsx). The SVG version is components/label/BagLabel.tsx;
// drawLabel() below is its canvas twin, in the same coordinates.
import type { Notes, SelItem } from "@/lib/domain/types";
import { AX, radarGeom, roastName, type LotIndex } from "@/lib/domain/coffee";

export const LABEL_W = 975, LABEL_H = 450;
export const LABEL_COLORS = ["#EE8A1E", "#C43C7C", "#D93D18", "#8E2F52"];
export const LABEL_INK = "#1A1A18", LABEL_SOFT = "#77726B", LABEL_RED = "#DC3D1A", LABEL_PAPER = "#F2EEE7", LABEL_OFF = "#D6D1CB";
export const LABEL_SITE = "blendedcoffeelab.com";

export interface LabelData {
  name: string; site: string; roastedOn?: string;
  parts: { name: string; origin: string; color: string }[];
  vals: Notes; words: string[]; roast: number; size: string; grind: string;
}

export const topWords = (vals: Notes) => AX.map((a) => ({ l: a.l, v: vals[a.k] || 0 })).filter((a) => a.v > 0).sort((a, b) => b.v - a.v).slice(0, 3).map((a) => a.l);
export const country = (o = "") => o.split(/\s*·\s*/)[0];
export const clampRoast = (r: number) => Math.max(1, Math.min(5, Math.round(r)));
export const today = () => { const d = new Date(); return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${String(d.getFullYear()).slice(2)}`; };

/** Label for a blend being built in the Coffee Lab. */
export function blendLabel({ sel, vals, name, sizeLabel, roast, idx, grind = "Whole bean" }: {
  sel: SelItem[]; vals: Notes; name: string; sizeLabel: string; roast: number | null; idx: LotIndex; grind?: string;
}): LabelData {
  const parts = sel.map((x, i) => { const l = idx.get(x.id); return { name: l?.name || x.id, origin: country(l?.origin), color: LABEL_COLORS[i % LABEL_COLORS.length] }; });
  return { site: LABEL_SITE, name: name || "Custom blend", parts, vals, words: topWords(vals), roast: clampRoast(roast ?? 3), size: sizeLabel, grind };
}

// ---------- text fitting (canvas measures the same font the label draws) ----------
let ctx: CanvasRenderingContext2D | null = null, family = "monospace";
/** The label's mono face (Martian Mono, via next/font's variable). */
export const labelFont = () => {
  if (typeof document === "undefined") return "monospace";
  const f = getComputedStyle(document.documentElement).getPropertyValue("--nf-martian").trim();
  return f ? `${f}, ui-monospace, monospace` : "ui-monospace, monospace";
};
/** Forget cached measurements (call once web fonts have loaded). */
export const resetMeasure = () => { ctx = null; };
export const textWidth = (t: string, size: number, wt: number, ls = 0) => {
  if (typeof document === "undefined") return t.length * size * .62 + ls * size * Math.max(0, t.length - 1);
  if (!ctx) { ctx = document.createElement("canvas").getContext("2d"); family = labelFont(); }
  ctx!.font = `${wt} ${size}px ${family}`;
  return ctx!.measureText(t).width + ls * size * Math.max(0, t.length - 1);
};
export const fit = (t: string, size: number, wt: number, ls: number, maxW: number, min: number) =>
  Math.max(min, Math.min(size, size * maxW / Math.max(1, textWidth(t, size, wt, ls))));

/** Draws the label onto a canvas; k scales the output (2 → 1950 × 900). */
export function drawLabel(g: CanvasRenderingContext2D, d: LabelData, k = 1) {
  const font = labelFont(), spaced = typeof (g as { letterSpacing?: unknown }).letterSpacing === "string";
  const T = (t: string, x: number, y: number, { size, wt = 400, ls = 0, maxW, min, fill = LABEL_INK, anchor = "start", upper }:
    { size: number; wt?: number; ls?: number; maxW?: number; min?: number; fill?: string; anchor?: "start" | "end"; upper?: boolean }) => {
    const s = upper ? t.toUpperCase() : t; if (!s) return;
    const fs = maxW ? fit(s, size, wt, ls, maxW, min || size * .5) : size;
    const w = textWidth(s, fs, wt, ls), sx = maxW && w > maxW ? maxW / w : 1;
    g.save(); g.font = `${wt} ${fs}px ${font}`; g.fillStyle = fill; g.textAlign = "left"; g.textBaseline = "alphabetic";
    if (spaced) (g as unknown as { letterSpacing: string }).letterSpacing = `${ls * fs}px`;
    g.translate(anchor === "end" ? x - w * sx : x, y); g.scale(sx, 1);
    if (!spaced && ls) { let cx = 0; for (const ch of s) { g.fillText(ch, cx, 0); cx += g.measureText(ch).width + ls * fs; } } else g.fillText(s, 0, 0);
    g.restore();
  };
  const rr = (x: number, y: number, w: number, h: number, r: number, fill: string) => {
    g.fillStyle = fill; g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); g.fill();
  };
  const parts = d.parts.slice(0, 4), n = Math.max(1, parts.length);
  const top = 104, rowH = Math.min(86, 176 / n), swH = rowH - 9;
  const roastTxt = `${roastName(d.roast)} ROAST`;
  const rs = fit(roastTxt, 19, 500, .2, 250, 11), rw = textWidth(roastTxt, rs, 500, .2);
  const barR = 913 - rw - 12, seg = 14.5, gap = 2;
  const c0 = parts[0]?.color || LABEL_COLORS[0], c1 = (parts[1] || parts[0])?.color || LABEL_COLORS[1];
  g.save(); g.scale(k, k);
  g.fillStyle = LABEL_PAPER; g.fillRect(0, 0, LABEL_W, LABEL_H);
  g.globalAlpha = .08; g.fillStyle = c0; g.beginPath(); g.arc(489, 157, 110, 0, 7); g.fill();
  g.globalAlpha = .07; g.fillStyle = c1; g.beginPath(); g.arc(487, 289, 113, 0, 7); g.fill();
  g.globalAlpha = .035; g.fillStyle = "#6B5A50"; g.fill(new Path2D("M491 168H600V302H531A40 40 0 0 1 491 262Z")); g.globalAlpha = 1;
  T(d.name || "Untitled", 52, 76, { size: 72, wt: 450, maxW: 530, min: 34, fill: LABEL_RED, upper: true });
  T("roasted on:", 612, 42, { size: 21, fill: LABEL_SOFT });
  if (d.roastedOn) { const lw = textWidth("roasted on:", 21, 400); T(d.roastedOn, 612 + lw + 12, 42, { size: 21, wt: 500, maxW: 913 - 624 - lw, min: 12 }); }
  parts.forEach((p, i) => {
    const y = top + i * rowH;
    rr(52, y + 4, 82, swH, 3, p.color);
    T(p.name, 153, y + rowH * .44, { size: Math.min(31, rowH * .38), wt: 450, maxW: 440, min: 12, upper: true });
    if (p.origin) T(p.origin, 153, y + rowH * .86, { size: Math.min(20, rowH * .25), maxW: 440, min: 9, fill: LABEL_SOFT, upper: true });
  });
  const geo = radarGeom(d.vals);
  g.save(); g.translate(784, 200); g.scale(115 / 150, 115 / 150); g.translate(-240, -240);
  g.strokeStyle = "rgba(26,26,24,.17)"; g.lineWidth = 1.6;
  [150, 109, 68].forEach((r) => { g.beginPath(); g.arc(240, 240, r, 0, 7); g.stroke(); });
  geo.axes.forEach((a) => { g.beginPath(); g.moveTo(240, 240); g.lineTo(a.sx, a.sy); g.stroke(); });
  const path = new Path2D(geo.p1);
  g.fillStyle = "rgba(196,60,124,.32)"; g.fill(path); g.strokeStyle = "#C43C7C"; g.lineWidth = 3.4; g.lineJoin = "round"; g.stroke(path);
  g.fillStyle = "#C43C7C"; geo.axes.forEach((a) => { if (a.v > .05) { g.beginPath(); g.arc(a.dx, a.dy, 4.6, 0, 7); g.fill(); } });
  g.restore();
  T(d.site || "", 52, 365, { size: 20.5, ls: .04, maxW: 470, min: 11, fill: LABEL_SOFT });
  T(d.words.join(" / "), 52, 405, { size: 18.5, wt: 500, ls: .2, maxW: 470, min: 10, upper: true });
  for (let q = 1; q <= 5; q++) rr(barR - (6 - q) * seg - (5 - q) * gap, 367 - rs * .36 - 4.3, seg, 8.6, 1.6, q <= d.roast ? LABEL_RED : LABEL_OFF);
  T(roastTxt, 913, 367, { size: rs, wt: 500, ls: .2, anchor: "end" });
  T(`${d.size} · ${d.grind}`, 913, 405, { size: 19, wt: 500, ls: .2, maxW: 330, min: 10, anchor: "end", upper: true });
  g.restore();
}
