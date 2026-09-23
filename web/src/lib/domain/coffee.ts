// Cup math, pricing and blend constraints. Pure functions shared by the
// storefront (live preview) and the server (authoritative checkout prices).
import type { FlavorKey, GreenLot, Notes, SelItem, ShopSizeId, StockCoffee } from "./types";

// ---- flavor axes (cupping scores, 0–10) ----
export const AX: { k: FlavorKey; l: string }[] = [
  { k: "cocoa", l: "Cocoa" }, { k: "brownSugar", l: "Brown sugar" }, { k: "malt", l: "Malt" },
  { k: "hazelnut", l: "Hazelnut" }, { k: "almond", l: "Almond" }, { k: "ferment", l: "Ferment" },
  { k: "berry", l: "Berry" }, { k: "stoneFruit", l: "Stone fruit" }, { k: "citrus", l: "Citrus" }, { k: "floral", l: "Floral" },
];

// ---- roast ramp, retuned to the packaging inks ----
export const RAMP = ["#EE8A1E", "#D93D18", "#C43C7C", "#8E2F52", "#3A2118"];
export const rampColor = (r: number) => {
  const x = Math.max(1, Math.min(5, r)) - 1, i = Math.min(3, Math.floor(x)), f = x - i;
  const a = RAMP[i], b = RAMP[i + 1];
  const mix = (p: number) => Math.round(parseInt(a.substr(p, 2), 16) * (1 - f) + parseInt(b.substr(p, 2), 16) * f);
  return `rgb(${mix(1)},${mix(3)},${mix(5)})`;
};
export const ramp5 = (n: number) => `var(--roast-${n})`;
export const roastName = (r: number) =>
  ["LIGHT", "LIGHT", "MED-LIGHT", "MEDIUM", "MED-DARK", "DARK"][Math.max(0, Math.min(5, Math.round(r)))];
export const AGTRON = [75, 75, 67, 58, 50, 42];
export const DROP_F = [396, 396, 407, 417, 427, 436];
export const ROAST_DESC = ["", "Tea, acidity forward", "Sweet, fruit intact", "Balanced, caramel", "Cocoa, low acid", "Smoke, syrupy"];

export const money = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const money0 = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

// ---- lookups ----
export type LotIndex = Map<string, GreenLot>;
export const indexLots = (lots: GreenLot[]): LotIndex => new Map(lots.map((l) => [l.id, l]));

// ---- blend minimums (grams, per lot) ----
export const G_PER_LB = 453.592;
export const MING_DEFAULT = 100;
export const MAX_COMPONENTS = 4;
export const minG = (lot: GreenLot | undefined) => {
  const v = lot && lot.minG != null ? +lot.minG : MING_DEFAULT;
  return Math.max(0, isNaN(v) ? MING_DEFAULT : v);
};
/** minimum share of THIS batch, in whole percent */
export const minPctFor = (lot: GreenLot | undefined, batchG: number) => {
  const g = minG(lot);
  if (!g || !batchG) return 0;
  return Math.min(100, Math.ceil((g / batchG) * 100));
};
export const gramsOf = (pct: number, batchG: number) => Math.round((batchG || 0) * pct / 100);
/** can every lot in the selection clear its own floor out of this batch? (in grams) */
export const minsFit = (sel: SelItem[], batchG: number, idx: LotIndex) =>
  sel.reduce((a, s) => a + minG(idx.get(s.id)), 0) <= (batchG || 0);
export const minsTotalG = (sel: SelItem[], idx: LotIndex) => sel.reduce((a, s) => a + minG(idx.get(s.id)), 0);

/** pull a selection back inside every lot's minimum, holding one row fixed */
export const enforceMins = (arr: SelItem[], lockedId: string | null, batchG: number, idx: LotIndex): SelItem[] => {
  const minOf = (id: string) => minPctFor(idx.get(id), batchG);
  const next = arr.map((x) => ({ ...x }));
  for (let pass = 0; pass < 6; pass++) {
    const short = next.filter((x) => x.id !== lockedId && x.pct < minOf(x.id));
    if (!short.length) break;
    short.forEach((s) => {
      const need = minOf(s.id) - s.pct;
      s.pct = minOf(s.id);
      let left = need;
      next.filter((o) => o.id !== s.id && o.id !== lockedId)
        .sort((a, b) => (b.pct - minOf(b.id)) - (a.pct - minOf(a.id)))
        .forEach((o) => {
          if (left <= 0) return;
          const slack = Math.max(0, o.pct - minOf(o.id)), take = Math.min(slack, left);
          o.pct -= take; left -= take;
        });
      if (left > 0) { const l = next.find((o) => o.id === lockedId); if (l) l.pct = Math.max(0, l.pct - left); }
    });
  }
  // always hand back a selection that sums to exactly 100 — when the floors
  // can't all be met the ratios stay proportional and the view raises the error
  let tot = next.reduce((a, b) => a + b.pct, 0);
  if (tot !== 100 && next.length) {
    if (minsFit(next, batchG, idx)) {
      const t = next.slice().sort((a, b) => (b.pct - minOf(b.id)) - (a.pct - minOf(a.id)))[0];
      t.pct = Math.max(minOf(t.id), t.pct + 100 - tot);
    } else {
      const base = tot || next.length;
      next.forEach((x) => { x.pct = Math.max(0, Math.round(x.pct * 100 / base)); });
    }
    tot = next.reduce((a, b) => a + b.pct, 0);
    if (tot !== 100) { const t = next.slice().sort((a, b) => b.pct - a.pct)[0]; t.pct = Math.max(0, t.pct + 100 - tot); }
  }
  return next;
};

// ---- pricing ----
export const RETAIL_X = 2.6, WHOLESALE_X = 1.85, ROAST_LOSS = 0.84;
export const roastedCost = (greenPrice: number) => greenPrice / ROAST_LOSS;
const nickel = (n: number) => Math.round(n * 20) / 20;
/** shelf price per roasted lb; the green catalog can override it per lot */
export const retailOf = (lot: GreenLot | undefined) =>
  lot ? (lot.retail != null ? lot.retail : nickel(roastedCost(lot.price) * RETAIL_X)) : 0;
/** wholesale price per roasted lb (what private label accounts pay) */
export const wholesaleOf = (lot: GreenLot | undefined) =>
  lot ? (lot.wholesale != null ? lot.wholesale : nickel(roastedCost(lot.price) * WHOLESALE_X)) : 0;
export const retailSel = (sel: SelItem[], idx: LotIndex) => sel.reduce((a, s) => a + retailOf(idx.get(s.id)) * s.pct / 100, 0);
export const wholesaleSel = (sel: SelItem[], idx: LotIndex) => sel.reduce((a, s) => a + wholesaleOf(idx.get(s.id)) * s.pct / 100, 0);
export const stockRetail = (sku: StockCoffee) => sku.retail != null ? sku.retail : sku.price * RETAIL_X;
export const roastOf = (sel: SelItem[], idx: LotIndex) => sel.reduce((a, s) => a + (idx.get(s.id)?.roast ?? 0) * s.pct / 100, 0);

// ---- retail bag sizes ----
export interface ShopSize { id: ShopSizeId; label: string; lb: number; mult: number; note: string }
export const SHOP_SIZES: ShopSize[] = [
  { id: "8oz", label: "8 oz", lb: 0.5, mult: 1.20, note: "about 14 cups" },
  { id: "1lb", label: "1 lb", lb: 1, mult: 1.00, note: "about 28 cups" },
  { id: "2lb", label: "2 lb", lb: 2, mult: 0.92, note: "about 56 cups" },
  { id: "5lb", label: "5 lb", lb: 5, mult: 0.84, note: "café size" },
];
export const shopSize = (id: string) => SHOP_SIZES.find((s) => s.id === id) || SHOP_SIZES[1];
export const SHIP_FLAT = 6.5;
export const SHIP_FREE = 50;
export const MAX_BAGS = 24;
const quarter = (n: number) => Math.round(n * 4) / 4;
/** perLb is the shelf price per roasted pound */
export const bagPrice = (perLb: number, size: ShopSize) => quarter(perLb * size.lb * size.mult);
/** stocked coffees use the live Shopify variant price when there is one */
export const stockBagPrice = (sku: StockCoffee, size: ShopSize) =>
  sku.variants[size.id]?.price ?? bagPrice(stockRetail(sku), size);
export const shippingFor = (goods: number) => (goods >= SHIP_FREE || goods === 0 ? 0 : SHIP_FLAT);

// ---- cup: weighted cupping scores ----
const DARK: Record<FlavorKey, number> = { cocoa: 1, malt: 1, brownSugar: .6, hazelnut: .8, almond: .6, ferment: -.6, berry: -1, stoneFruit: -.8, citrus: -1, floral: -1 };
export const weighted = (sel: SelItem[], idx: LotIndex, roastTarget?: number | null): Record<FlavorKey, number> => {
  const o = {} as Record<FlavorKey, number>;
  AX.forEach((a) => (o[a.k] = 0));
  sel.forEach((s) => {
    const c = idx.get(s.id); if (!c) return;
    for (const k in c.notes) { const key = k as FlavorKey; o[key] = (o[key] || 0) + (c.notes[key] || 0) * s.pct / 100; }
  });
  if (roastTarget != null && sel.length) {
    const delta = roastTarget - roastOf(sel, idx);
    AX.forEach((a) => { o[a.k] = Math.max(0, Math.min(10, o[a.k] * (1 + delta * (DARK[a.k] || 0) * 0.17))); });
  }
  return o;
};
export const topNotes = (vals: Notes, n: number) =>
  AX.map((a) => ({ k: a.k, l: a.l, v: vals[a.k] || 0 })).sort((x, y) => y.v - x.v).slice(0, n);

// radar geometry — closed catmull-rom path + axis endpoints (480×480 viewBox)
export const radarGeom = (vals: Notes) => {
  const cx = 240, cy = 240, r0 = 24, rMax = 150;
  const pts: [number, number][] = [];
  const axes = AX.map((a, i) => {
    const ang = (i * 36 - 90) * Math.PI / 180;
    const v = Math.max(0, Math.min(10, vals[a.k] || 0));
    const r = r0 + (v / 10) * (rMax - r0);
    const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
    pts.push([x, y]);
    const lr = .4, sn = Math.sin(i * 36 * Math.PI / 180), cs = Math.cos(i * 36 * Math.PI / 180);
    const right = sn > .2, left = sn < -.2;
    return {
      label: a.l, v, valStr: v < .05 ? "—" : v.toFixed(1),
      op: Math.round(Math.max(.24, Math.min(1, .24 + v / 6)) * 100) / 100,
      sx: cx + Math.cos(ang) * rMax, sy: cy + Math.sin(ang) * rMax,
      dx: x, dy: y, dot: v < .05 ? "transparent" : "var(--ink)",
      // rounded so server and browser trig render identical markup
      lx: Math.round((50 + lr * 100 * sn) * 100) / 100, ly: Math.round((50 - lr * 100 * cs) * 100) / 100,
      tf: right ? "translate(8px,-50%)" : left ? "translate(-100%,-50%) translateX(-8px)" : (cs > 0 ? "translate(-50%,-100%) translateY(-8px)" : "translate(-50%,8px)"),
      al: right ? "flex-start" : left ? "flex-end" : "center",
    };
  });
  const path = (scale: number) => {
    const p = pts.map(([x, y]) => [cx + (x - cx) * scale, cy + (y - cy) * scale]), n = p.length;
    let d = `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d + " Z";
  };
  return { axes, p1: path(1), p2: path(.68), p3: path(.4) };
};

// ---- private label (wholesale) ----
export type PackId = "stock" | "label" | "own";
export interface PlBag { id: string; label: string; lb: number; material: Record<PackId, number> }
export const PL_BAGS: PlBag[] = [
  { id: "12oz", label: "12 oz", lb: 0.75, material: { stock: 0.68, label: 0.68, own: 0 } },
  { id: "2lb", label: "2 lb", lb: 2, material: { stock: 1.10, label: 1.10, own: 0 } },
  { id: "5lb", label: "5 lb", lb: 5, material: { stock: 1.65, label: 1.65, own: 0 } },
];
export interface PlPack { id: PackId; icon: string; title: string; desc: string; rate: string; per: number; setup: number; image: string }
export const PL_PACK: PlPack[] = [
  { id: "stock", icon: "bag", title: "Our stock bags", image: "/images/pack/stock.webp",
    desc: "Kraft stand-up pouch, one-way valve, resealable zip. Blank — we apply a printed roast-date sticker.",
    rate: "material + $0.55/bag fill", per: 0, setup: 0 },
  { id: "label", icon: "pkg", title: "Your label, our bags", image: "/images/pack/label.webp",
    desc: "Send artwork. We print and apply it to the same stock bag. Proof comes back before the run.",
    rate: "+ $0.42/bag label · $85 plate setup", per: 0.42, setup: 85 },
  { id: "own", icon: "cart", title: "You supply the bags", image: "/images/pack/own.webp",
    desc: "Ship your own bags here. No material charge — we bill handling on the packaging line.",
    rate: "$0.35/bag handling, no material", per: 0.35, setup: 0 },
];
export const PL_FILL = 0.55;
export const PL_MIN = 5;
export const PL_LABEL_SIZES = ['3.5" × 5" front', '4" × 6" front', '2" × 3" front + back', "Full wrap"];

export interface PlQuote {
  bag: PlBag; pack: PlPack; bags: number; coffee: number; material: number; perBag: number;
  fill: number; setup: number; total: number; unit: number; perLb: number; shortBags: number;
}
export const plQuote = ({ pricePerLb, lbs, bagId, packId, ownBagCount }:
  { pricePerLb: number; lbs: number; bagId: string; packId: string; ownBagCount?: number }): PlQuote => {
  const bag = PL_BAGS.find((b) => b.id === bagId) || PL_BAGS[0];
  const pack = PL_PACK.find((p) => p.id === packId) || PL_PACK[0];
  const bags = Math.ceil(lbs / bag.lb);
  const coffee = pricePerLb * lbs;
  const material = bag.material[pack.id] * bags;
  const perBag = pack.per * bags;
  const fill = PL_FILL * bags;
  const setup = pack.setup;
  const total = coffee + material + perBag + fill + setup;
  return { bag, pack, bags, coffee, material, perBag, fill, setup, total,
    unit: total / Math.max(1, bags), perLb: total / Math.max(1, lbs),
    shortBags: pack.id === "own" ? Math.max(0, bags - (ownBagCount || 0)) : 0 };
};

export const round2 = (n: number) => Math.round(n * 100) / 100;
