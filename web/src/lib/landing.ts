import "server-only";
// Data for the landing page: the green lineup, a suggested house blend, the
// sample blends dealt in the "Opening the Coffee Lab" intro, and which media
// slots have files in public/landing (see scripts/landing-media.mjs).
import type { GreenLot, SelItem } from "@/lib/domain/types";
import { AX, indexLots, radarGeom, rampColor, roastName, roastOf, weighted, type LotIndex } from "@/lib/domain/coffee";
import { env } from "@/lib/env";
import manifest from "@/lib/landing-media.json";

type Slot = { image?: string; video?: string };
const media = manifest as Record<string, Slot>;

export interface LineupRow { id: string; code: string; name: string; origin: string; process: string; roast: number; color: string; label: string }
export interface IntroBlend { name: string; parts: { name: string; origin: string; pct: number }[]; radar: string; dots: [number, number][]; notes: string; roast: number; roastLabel: string }
export interface HouseBlend { title: string; notes: string[]; copy: string; href: string }
export interface LandingMedia {
  heroVideo: string | null; heroPoster: string;
  labVideo: string | null; labImage: string;
  origins: Record<"brazil" | "colombia" | "ethiopia", string>;
  steps: string[]; band: string; merch: string | null; gear: string | null;
}
export interface LandingData {
  lineup: LineupRow[]; house: HouseBlend | null; intro: IntroBlend[]; media: LandingMedia;
  merchUrl: string | null; gearUrl: string | null; coffeeCount: number;
}

const ROAST_LABEL = ["Light", "Light", "Medium-light", "Medium", "Medium-dark", "Dark"];
const country = (origin: string) => origin.split(/\s*[·,]\s*/)[0] || origin;
const topNotes = (sel: SelItem[], idx: LotIndex, n = 3) => {
  const v = weighted(sel, idx);
  return AX.map((a) => ({ l: a.l, v: v[a.k] || 0 })).sort((a, b) => b.v - a.v).filter((a) => a.v > 0).slice(0, n).map((a) => a.l);
};
const body = (l: GreenLot) => (l.notes.cocoa ?? 0) + (l.notes.brownSugar ?? 0) + (l.notes.malt ?? 0) + (l.notes.hazelnut ?? 0) + l.roast;
const lift = (l: GreenLot) => (l.notes.floral ?? 0) + (l.notes.citrus ?? 0) + (l.notes.berry ?? 0) + (l.notes.stoneFruit ?? 0);

function introCard(name: string, sel: SelItem[], idx: LotIndex): IntroBlend {
  const g = radarGeom(weighted(sel, idx));
  const r = Math.max(1, Math.min(5, Math.round(roastOf(sel, idx))));
  return {
    name,
    parts: sel.map((s) => { const l = idx.get(s.id)!; return { name: l.name, origin: l.origin, pct: s.pct }; }),
    radar: g.p1, dots: g.axes.map((a) => [Math.round(a.dx * 10) / 10, Math.round(a.dy * 10) / 10]),
    notes: topNotes(sel, idx).join(" / "), roast: r, roastLabel: ROAST_LABEL[r],
  };
}

export function landingData(green: GreenLot[], coffeeCount: number): LandingData {
  const lots = green.filter((l) => l.listed && l.avail > 0 && l.kind !== "soon");
  const idx = indexLots(lots);

  const lineup = green.filter((l) => l.listed).map((l, i) => ({
    id: l.id, code: l.lot || `BL-G${String(i + 1).padStart(2, "0")}`, name: l.name, origin: l.origin, process: l.process,
    roast: l.roast, color: rampColor(l.roast), label: ROAST_LABEL[Math.round(l.roast)] ?? roastName(l.roast),
  }));

  // House blend: the heaviest-bodied lot for the base, the brightest other lot for lift.
  let house: HouseBlend | null = null;
  const byBody = [...lots].sort((a, b) => body(b) - body(a));
  const base = byBody[0], top = base && [...lots].filter((l) => l.id !== base.id).sort((a, b) => lift(b) - lift(a))[0];
  if (base && top) {
    const sel = [{ id: base.id, pct: 70 }, { id: top.id, pct: 30 }];
    house = {
      title: `${base.name.split(" ")[0]} + ${top.name.split(" ")[0]}`,
      notes: topNotes(sel, idx),
      copy: `Our starting point in the lab: 70% ${country(base.origin)} for body, 30% ${country(top.origin)} for lift. Open it, then make it yours.`,
      href: `/lab?blend=${encodeURIComponent(`${base.id}:70,${top.id}:30`)}#build`,
    };
  }

  // Sample blends for the intro deck (the last one lands on top).
  const intro: IntroBlend[] = [];
  const darkFirst = [...lots].sort((a, b) => b.roast - a.roast);
  const L = (i: number) => darkFirst[Math.min(i, darkFirst.length - 1)];
  if (darkFirst.length >= 2) {
    const combos: [string, [GreenLot, number][]][] = [
      ["Morning shift", [[L(0), 60], [L(1), 40]]],
      ["Red fruit", [[L(darkFirst.length - 1), 45], [L(Math.floor(darkFirst.length / 2)), 35], [L(0), 20]]],
      ["Sunday pour", [[L(darkFirst.length - 1), 70], [L(1), 30]]],
      ["Espresso 4-way", [[L(0), 40], [L(1), 25], [L(2), 20], [L(3), 15]]],
      ["Your blend", [[base ?? L(0), 50], [top ?? L(1), 50]]],
    ];
    for (const [name, parts] of combos) {
      const seen = new Set<string>(), sel: SelItem[] = [];
      for (const [l, pct] of parts) { if (seen.has(l.id)) { const s = sel.find((x) => x.id === l.id)!; s.pct += pct; } else { seen.add(l.id); sel.push({ id: l.id, pct }); } }
      intro.push(introCard(name, sel, idx));
    }
  }

  const img = (slot: string) => media[slot]?.image ?? null;
  return {
    lineup, house, intro, coffeeCount,
    merchUrl: env.landingMerchUrl ?? null, gearUrl: env.landingGearUrl ?? null,
    media: {
      heroVideo: media.hero?.video ?? null,
      heroPoster: img("hero") ?? "/images/coffee/s-counter.webp",
      labVideo: media.lab?.video ?? null, labImage: img("lab") ?? "/images/coffee/s-counter.webp",
      origins: {
        brazil: img("origin-brazil") ?? "/images/coffee/s-cerrado.webp",
        colombia: img("origin-colombia") ?? "/images/coffee/s-huila.webp",
        ethiopia: img("origin-ethiopia") ?? "/images/coffee/s-guji.webp",
      },
      steps: [
        img("step-01") ?? "/images/coffee/s-straw.webp", img("step-02") ?? "/images/coffee/s-decaf.webp",
        img("step-03") ?? "/images/coffee/s-counter.webp", img("step-04") ?? "/images/coffee/s-coldbrew.webp",
      ],
      band: img("band") ?? "/images/coffee/s-sixounce.webp",
      merch: img("merch"), gear: img("gear"),
    },
  };
}
