// What each of our coffees is built from, in green lots on sale: seeds the
// ratio editor under "Start from our recipe" in the Coffee Lab.
import type { GreenLot, SelItem, StockCoffee } from "./types";

const norm = (t: string) => t.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/** Lots the Lab can blend from: listed, in stock, not "coming soon". */
export const blendableLots = (green: GreenLot[]) => green.filter((l) => l.listed && l.avail > 0 && l.kind !== "soon");

/**
 * Reads "60% Cerrado Norte, 40% Sierra Alta" or "cerrado:60, sierra:40" (lot handles
 * or names). Null unless every part is one of `lots` and the shares add up to 100.
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
    const key = byKey.has(what) ? what : names.find((n) => what.startsWith(n + " "));
    const lot = key ? byKey.get(key) : undefined;
    if (!lot || !pct) return null;
    const had = sel.find((s) => s.id === lot.id);
    if (had) had.pct += pct; else sel.push({ id: lot.id, pct });
  }
  return sel.length && sel.length <= 4 && sel.reduce((a, s) => a + s.pct, 0) === 100 ? sel : null;
}

/**
 * A coffee's recipe: the blended.recipe metafield, else the "70% Lot, 30% Lot" line the
 * sample blends open their description with, else — for a single origin — the green lot
 * of the same name at 100%. Empty when it can't be made from lots on sale.
 */
export function recipeOf(c: StockCoffee, lots: GreenLot[]): SelItem[] {
  const r = parseRecipe(c.recipe, lots) ?? parseRecipe(c.blurb.match(/^\s*\d{1,3}\s*%[^.]*/)?.[0], lots);
  if (r) return r;
  if (c.kind === "blend") return [];
  const name = norm(c.name).replace(/ coffee$/, "");
  const lot = lots.find((l) => norm(l.name) === name);
  return lot ? [{ id: lot.id, pct: 100 }] : [];
}

export const sameSel = (a: SelItem[], b: SelItem[]) => a.length === b.length && a.every((x) => b.some((y) => y.id === x.id && Math.round(y.pct) === Math.round(x.pct)));
