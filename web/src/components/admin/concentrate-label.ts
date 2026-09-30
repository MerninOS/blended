// Cold brew concentrate label (coffeeos/BottleHero.jsx ccDrawLabel): the
// bottle's wrap-around paper label laid flat, 8 × 3.5 in, drawn on a canvas at
// 300 dpi (2400 × 1050). Nutrition-style panel on the left, BLENDED, flavor
// mark and name in the middle, directions on the right.

export const CC_W = 2400, CC_H = 1050;
const PAPER = "#EFEBE3", INK = "#1A1A18", RED = "#D93D18", ORANGE = "#EE8A1E", MAGENTA = "#C43C7C";
const SITE = "BLENDEDCOFFEELAB.COM";

export type CcShape = "circles" | "sq-o" | "sq-m" | "stack";
export interface CcBase { id: string; name: string; prefix: string; caf: number }
export interface CcFlavor { id: string; name: string; notes: string[]; shape: CcShape; ing: string }
export interface CcSupp { id: string; name: string; full: string; dose: string }

export const CC_BASES: CcBase[] = [
  { id: "original", name: "Original", prefix: "", caf: 150 },
  { id: "halfcaf", name: "Half caf", prefix: "Half caf", caf: 75 },
  { id: "decaf", name: "Decaf", prefix: "Decaf", caf: 5 },
];
export const CC_FLAVORS: CcFlavor[] = [
  { id: "classic", name: "Classic", notes: ["Rich", "Smooth", "Balanced"], shape: "circles", ing: "" },
  { id: "vanilla", name: "Vanilla", notes: ["Creamy", "Sweet", "Smooth"], shape: "sq-o", ing: "vanilla extract" },
  { id: "mocha", name: "Mocha", notes: ["Chocolate", "Rich", "Bold"], shape: "sq-m", ing: "cocoa" },
  { id: "caramel", name: "Salted caramel", notes: ["Caramel", "Smooth", "Sweet"], shape: "stack", ing: "caramel, sea salt" },
];
export const CC_SUPPS: CcSupp[] = [
  { id: "creatine", name: "Creatine", full: "Creatine monohydrate", dose: "5 g" },
  { id: "theanine", name: "L-theanine", full: "L-theanine", dose: "200 mg" },
  { id: "lions", name: "Lion's mane", full: "Lion's mane extract", dose: "1 g" },
  { id: "collagen", name: "Collagen", full: "Collagen peptides", dose: "5 g" },
  { id: "electro", name: "Electrolytes", full: "Electrolytes (Na · K · Mg)", dose: "250 mg" },
  { id: "ashwa", name: "Ashwagandha", full: "Ashwagandha root", dose: "300 mg" },
];
export const CC_MAX_SUPPS = 3;

export interface CcLabel {
  name: string; notes: string[]; shape: CcShape; prefix: string; caffeine: number; ingredient: string;
  supps: { short: string; name: string; dose: string }[];
}

export function ccLabel(baseId: string, flavorId: string, suppIds: string[]): CcLabel {
  const base = CC_BASES.find((b) => b.id === baseId) ?? CC_BASES[0];
  const flavor = CC_FLAVORS.find((f) => f.id === flavorId) ?? CC_FLAVORS[0];
  const picked = CC_SUPPS.filter((s) => suppIds.includes(s.id));
  return {
    name: flavor.name, notes: flavor.notes, shape: flavor.shape, prefix: base.prefix, caffeine: base.caf,
    ingredient: [flavor.ing, ...picked.map((s) => s.full.toLowerCase())].filter(Boolean).join(", "),
    supps: picked.map((s) => ({ short: `${s.name} ${s.dose}`, name: s.name, dose: s.dose })),
  };
}

// next/font exposes the real family names through these CSS variables.
const family = (v: string, fallback: string) => {
  const f = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  return f ? `${f}, ${fallback}` : fallback;
};
const fonts = () => ({ mono: family("--nf-martian", "ui-monospace, monospace"), logo: family("--nf-energy", "Archivo, sans-serif") });

/** Resolves once the label faces are loaded, so canvas measurements use them. */
export function ccFontsReady() {
  const { mono, logo } = fonts();
  return Promise.all([`800 100px ${logo}`, `400 30px ${mono}`, `500 30px ${mono}`, `600 30px ${mono}`].map((s) => document.fonts.load(s))).then(() => undefined, () => undefined);
}

type G = CanvasRenderingContext2D;
const track = (g: G, px: number) => { if ("letterSpacing" in g) (g as G & { letterSpacing: string }).letterSpacing = `${px}px`; };
const text = (g: G, s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "center", tr = 0) => {
  g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle"; track(g, tr); g.fillText(s, x, y);
};
/** Largest size ≤ px (floor 10) at which s fits in max. */
const fit = (g: G, s: string, font: (px: number) => string, px: number, max: number, tr = 0) => {
  let f = px; track(g, tr); g.font = font(f);
  while (g.measureText(s).width > max && f > 10) { f -= 1; g.font = font(f); }
  return f;
};

function shape(g: G, kind: CcShape, cx: number, cy: number, s: number) {
  g.save();
  const circ = (x: number, y: number, r: number, c: string) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
  const sq = (x: number, y: number, k: number, c: string) => { g.fillStyle = c; g.fillRect(x - k / 2, y - k / 2, k, k); };
  if (kind === "circles") { circ(cx - s * .25, cy, s * .36, ORANGE); g.globalCompositeOperation = "multiply"; circ(cx + s * .25, cy, s * .36, MAGENTA); }
  else if (kind === "sq-o") sq(cx, cy, s * .72, ORANGE);
  else if (kind === "sq-m") sq(cx, cy, s * .72, MAGENTA);
  else { sq(cx - s * .14, cy + s * .1, s * .56, ORANGE); g.globalCompositeOperation = "multiply"; circ(cx + s * .16, cy - s * .1, s * .3, MAGENTA); }
  g.restore();
}

export function drawConcentrateLabel(g: G, w: number, h: number, c: CcLabel) {
  const { mono, logo } = fonts();
  const M = (wt: number, px: number) => `${wt} ${px}px ${mono}`;
  const L = (px: number) => `800 ${px}px ${logo}`;
  const cx = w / 2, half = 340, soft = "rgba(26,26,24,.62)";
  const rule = (x: number, y: number, len: number, a = .3) => { g.fillStyle = `rgba(26,26,24,${a})`; g.fillRect(x, y, len, 2); };
  g.fillStyle = PAPER; g.fillRect(0, 0, w, h);

  // centre: wordmark, product line, flavor mark, name, notes, add-ins
  g.font = L(200); track(g, -4);
  const fs = 200 * 660 / g.measureText("BLENDED").width;
  text(g, "BLENDED", cx, 160, L(fs), INK, "center", -4);
  const sub = `${c.prefix ? c.prefix + " " : ""}Coffee concentrate`.toUpperCase();
  text(g, sub, cx, 272, M(500, fit(g, sub, (p) => M(500, p), 40, 660, 7)), RED, "center", 7);
  shape(g, c.shape, cx, 472, 330);
  const nm = c.name.toUpperCase();
  text(g, nm, cx, 724, M(500, fit(g, nm, (p) => M(500, p), 62, 660, 5)), INK, "center", 5);
  text(g, c.notes.join(" / ").toUpperCase(), cx, 790, M(400, 30), soft, "center", 4);
  if (c.supps.length) {
    const s = "+ " + c.supps.map((x) => x.short).join(" · ").toUpperCase();
    text(g, s, cx, 862, M(600, fit(g, s, (p) => M(600, p), 47, 720, 3)), RED, "center", 3);
  }
  rule(cx - half, 930, half * 2, .35);
  text(g, "MAKES 8–12 DRINKS", cx - half, 986, M(500, 22), INK, "left", 2);
  text(g, "12 FL OZ (355 ML)", cx + half, 986, M(500, 22), INK, "right", 2);

  // left: per-serving panel and ingredients
  const lx = 130, lw = 420;
  text(g, "PER 1.5 FL OZ SERVING", lx, 160, M(600, 22), INK, "left", 4);
  rule(lx, 192, lw, .9);
  const rows: [string, string][] = [["CAFFEINE", `${c.caffeine} MG`], ...c.supps.map((x) => [x.name.toUpperCase(), x.dose.toUpperCase()] as [string, string])];
  rows.forEach(([k, v], i) => {
    const y = 240 + i * 60;
    text(g, k, lx, y, M(400, fit(g, k, (p) => M(400, p), 20, 300, 2)), INK, "left", 2);
    text(g, v, lx + lw, y, M(500, 20), INK, "right", 2);
    rule(lx, y + 30, lw, .18);
  });
  // ingredients wrap upward from the bottom line; shrink only if they'd need more than 4 lines
  const ing = `Cold brew coffee (water, coffee)${c.ingredient ? ", " + c.ingredient : ""}`.toUpperCase();
  const wrap = (px: number) => {
    g.font = M(400, px); track(g, 1);
    const out: string[] = []; let ln = "";
    ing.split(" ").forEach((wd) => { const t = ln ? ln + " " + wd : wd; if (g.measureText(t).width > lw && ln) { out.push(ln); ln = wd; } else ln = t; });
    if (ln) out.push(ln);
    return out;
  };
  let ip = 25, lines = wrap(ip);
  while (lines.length > 4 && ip > 16) lines = wrap(--ip);
  const lh = ip * 1.35, y0 = 986 - (lines.length - 1) * lh;
  text(g, "INGREDIENTS", lx, y0 - lh - 10, M(600, 24), INK, "left", 3);
  lines.forEach((l, i) => text(g, l, lx, y0 + i * lh, M(400, ip), soft, "left", 1));

  // right: directions
  const rx = w - 130 - lw;
  text(g, "TO MAKE A DRINK", rx, 160, M(600, 22), INK, "left", 4);
  rule(rx, 192, lw, .9);
  ["1 PART CONCENTRATE", "3 PARTS WATER OR MILK", "POUR OVER ICE"].forEach((s, i) => text(g, s, rx, 244 + i * 54, M(400, 21), INK, "left", 2));
  text(g, "SHAKE WELL. KEEP REFRIGERATED.", rx, 460, M(400, 18), soft, "left", 2);
  text(g, "BEST WITHIN 14 DAYS OF OPENING.", rx, 496, M(400, 18), soft, "left", 2);
  text(g, SITE, rx, 940, M(500, fit(g, SITE, (p) => M(500, p), 20, lw, 3)), INK, "left", 3);
}

/** PNG data URL of the label at print resolution. */
export async function concentrateLabelPng(c: CcLabel) {
  await ccFontsReady();
  const cv = document.createElement("canvas"); cv.width = CC_W; cv.height = CC_H;
  drawConcentrateLabel(cv.getContext("2d")!, CC_W, CC_H, c);
  return cv.toDataURL("image/png");
}
