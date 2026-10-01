// House blends the Coffee Lab can open as a starting point: each stock blend's
// recipe resolved against the green lots on sale, with a generated pair when
// the store has none to offer.
import type { GreenLot, SelItem, StockCoffee } from "./types";
import { indexLots, roastOf, topNotes, weighted } from "./coffee";

export interface StartingBlend { id: string; name: string; sel: SelItem[]; roast: number; tasting: string[]; blurb: string }

const norm = (t: string) => t.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const country = (origin: string) => origin.split(/\s*[·,]\s*/)[0] || origin;

/**
 * Reads "70% Cerrado Norte, 30% Sierra Alta" or "cerrado:70, sierra:30" (lot handles
 * or names). Null unless every part is a lot on sale and the shares add up to 100.
 */
export function parseRecipe(text: string | undefined, lots: GreenLot[]): SelItem[] | null {
  if (!text) return null;
  const byKey = new Map<string, GreenLot>();
  for (const l of lots) { byKey.set(norm(l.id), l); byKey.set(norm(l.name), l); }
  // Longest names first, so "Huila Reserve Decaf" wins over "Huila Reserve".
  const names = [...byKey.keys()].sort((a, b) => b.length - a.length);
  const sel: SelItem[] = [];
  for (const m of text.matchAll(/(\d{1,3})\s*%\s*([^,+;\n]+)|([^,+;:\n]+?)\s*:\s*(\d{1,3})/g)) {
    const pct = Number(m[1] ?? m[4]), what = norm(m[2] ?? m[3] ?? "");
    const key = byKey.has(what) ? what : names.find((n) => what.startsWith(n + " ") || what === n);
    const lot = key ? byKey.get(key) : undefined;
    if (!lot || !pct) return null;
    const had = sel.find((s) => s.id === lot.id);
    if (had) had.pct += pct; else sel.push({ id: lot.id, pct });
  }
  return sel.length && sel.length <= 4 && sel.reduce((a, s) => a + s.pct, 0) === 100 ? sel : null;
}

const body = (l: GreenLot) => (l.notes.cocoa ?? 0) + (l.notes.brownSugar ?? 0) + (l.notes.malt ?? 0) + (l.notes.hazelnut ?? 0) + l.roast;
const lift = (l: GreenLot) => (l.notes.floral ?? 0) + (l.notes.citrus ?? 0) + (l.notes.berry ?? 0) + (l.notes.stoneFruit ?? 0);

export function startingBlends(stock: StockCoffee[], green: GreenLot[]): StartingBlend[] {
  const lots = green.filter((l) => l.listed && l.avail > 0 && l.kind !== "soon");
  const idx = indexLots(lots);
  const make = (id: string, name: string, sel: SelItem[], blurb: string, tasting?: string[]): StartingBlend => ({
    id, name, sel, blurb, roast: roastOf(sel, idx),
    tasting: tasting?.length ? tasting.slice(0, 3) : topNotes(weighted(sel, idx), 3).filter((n) => n.v > 0).map((n) => n.l),
  });
  const ours = stock.filter((c) => c.kind === "blend").flatMap((c) => {
    // the recipe metafield, else the "70% Lot, 30% Lot" line the sample blends are written with
    const sel = parseRecipe(c.recipe, lots) ?? parseRecipe(c.blurb.match(/\d{1,3}\s*%[^.]*/)?.[0], lots);
    return sel ? [make(c.id, c.name, sel, c.blurb, c.tasting)] : [];
  });
  if (ours.length) return ours;

  // No house blends to open: the landing page's pairing (heaviest body + brightest), each way round.
  const heavy = [...lots].sort((a, b) => body(b) - body(a))[0];
  const bright = heavy && lots.filter((l) => l.id !== heavy.id).sort((a, b) => lift(b) - lift(a))[0];
  if (!heavy || !bright) return [];
  return [
    make("house", "House Blend", [{ id: heavy.id, pct: 70 }, { id: bright.id, pct: 30 }], `70% ${country(heavy.origin)} for body, 30% ${country(bright.origin)} for lift.`),
    make("bright", "Bright Blend", [{ id: bright.id, pct: 60 }, { id: heavy.id, pct: 40 }], `60% ${country(bright.origin)} for brightness, 40% ${country(heavy.origin)} to round it out.`),
  ];
}
