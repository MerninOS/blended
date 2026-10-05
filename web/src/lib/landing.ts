import "server-only";
// Data for the landing page: the green lineup, a suggested house blend, the
// sample blends dealt in the "Opening the Coffee Lab" intro, and which media
// slots have files in public/landing (see scripts/landing-media.mjs). Copy,
// photos and videos edited in Sanity (/studio) win over both.
import type { GreenLot, SelItem } from "@/lib/domain/types";
import { AX, indexLots, radarGeom, rampColor, roastName, roastOf, weighted, type LotIndex } from "@/lib/domain/coffee";
import { env } from "@/lib/env";
import manifest from "@/lib/landing-media.json";
import { DEFAULT_COPY, mergeCopy, type LandingCopy } from "@/lib/landing-copy";
import type { CmsImage } from "@/lib/sanity";

type Slot = { image?: string; video?: string };

// Landing media hosted on Shopify's CDN. A file of the same slot name in
// public/landing/ takes precedence (see its README).
const CDN = "https://cdn.shopify.com/s/files/1/0880/3935/8739/files/";
const HOSTED = {
  heroVideo: "https://cdn.shopify.com/videos/c/o/v/c0e2100b3f5143edb9bf587bdabf73c6.mp4",
  heroPoster: `${CDN}hero_fallback.png?v=1790460336`,
  lab: `${CDN}Blended_bag.png?v=1790529049`,
  brazil: `${CDN}Untitled_design_21.png?v=1790444034`,
  colombia: `${CDN}exploring-colombia-coffee-region.jpg?v=1790443112`,
  ethiopia: `${CDN}coffee_cherry.jpg?v=1790443191`,
  steps: [`${CDN}Coffee_cherries_Ripe.jpg?v=1790443112`, `${CDN}coffee_processing.webp?v=1790443241`, `${CDN}aillio_roasting.jpg?v=1790443256`, `${CDN}pour_over.jpg?v=1790443178`],
  band: `${CDN}coffee_farm_1.png?v=1790443204`,
  merch: `${CDN}blended_tee.jpg?v=1790443146`,
  gear: `${CDN}gear_lamarz.webp?v=1790443164`,
};
const media = manifest as Record<string, Slot>;

export interface LineupRow { id: string; code: string; name: string; origin: string; process: string; roast: number; color: string; label: string }
export interface IntroBlend { name: string; parts: { name: string; origin: string; pct: number }[]; radar: string; dots: [number, number][]; notes: string; roast: number; roastLabel: string }
export interface HouseBlend { title: string; notes: string[]; copy: string; href: string }
/** A photo: its URL, the focal point to keep in frame, and alt text. */
export interface Pic { src: string; pos?: string; alt?: string }
export interface LandingMedia {
  heroVideo: string | null; heroPoster: Pic;
  labVideo: string | null; labImage: Pic;
  origins: (Pic | null)[];
  steps: (Pic | null)[]; band: Pic; merch: Pic | null; gear: Pic | null;
}
export interface LandingData {
  copy: LandingCopy;
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

/** A Sanity image as a CDN URL with its crop applied, and its hotspot as an object-position. */
function cmsPic(img: CmsImage | null | undefined): Pic | null {
  if (!img?.url) return null;
  const q = new URLSearchParams({ auto: "format", fit: "max" });
  const c = img.crop, W = img.w, H = img.h;
  let fx = img.hotspot?.x, fy = img.hotspot?.y;
  if (c && W && H && (c.left || c.right || c.top || c.bottom)) {
    const cw = 1 - c.left - c.right, ch = 1 - c.top - c.bottom;
    q.set("rect", [c.left * W, c.top * H, cw * W, ch * H].map(Math.round).join(","));
    if (fx != null && fy != null) { fx = (fx - c.left) / cw; fy = (fy - c.top) / ch; }
  }
  const pct = (v: number) => `${Math.round(Math.min(1, Math.max(0, v)) * 1000) / 10}%`;
  return { src: `${img.url}?${q}`, pos: fx != null && fy != null ? `${pct(fx)} ${pct(fy)}` : undefined, alt: img.alt || undefined };
}
type CmsMedia = { image?: CmsImage; poster?: CmsImage; video?: { url?: string }; videoUrl?: string };
const cmsVideo = (m: CmsMedia | undefined) => m?.video?.url || m?.videoUrl || null;

export function landingData(green: GreenLot[], coffeeCount: number, cms?: Record<string, unknown> | null): LandingData {
  const copy = mergeCopy(DEFAULT_COPY, cms);
  const m = (cms ?? {}) as Record<string, CmsMedia & { origins?: CmsMedia[]; steps?: CmsMedia[] }>;
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

  const file = (slot: string): Pic | null => (media[slot]?.image ? { src: media[slot].image! } : null);
  const pic = (cmsImg: CmsImage | undefined, slot: string, hosted: string): Pic => cmsPic(cmsImg) ?? file(slot) ?? { src: hosted };
  const ORIGIN_SLOTS = [["origin-brazil", HOSTED.brazil], ["origin-colombia", HOSTED.colombia], ["origin-ethiopia", HOSTED.ethiopia]];
  return {
    copy, lineup, house, intro, coffeeCount,
    merchUrl: env.landingMerchUrl ?? null, gearUrl: env.landingGearUrl ?? null,
    media: {
      heroVideo: cmsVideo(m.hero) ?? media.hero?.video ?? HOSTED.heroVideo,
      heroPoster: pic(m.hero?.poster, "hero", HOSTED.heroPoster),
      labVideo: cmsVideo(m.lab) ?? media.lab?.video ?? null, labImage: pic(m.lab?.image, "lab", HOSTED.lab),
      // Origins and steps follow the copy's list: extra ones added in Sanity need their own photo.
      origins: copy.farms.origins.map((_, i) => {
        const own = cmsPic(m.farms?.origins?.[i]?.image), d = ORIGIN_SLOTS[i];
        return own ?? (d ? file(d[0]) ?? { src: d[1] } : null);
      }),
      steps: copy.process.steps.map((_, i) => {
        const own = cmsPic(m.process?.steps?.[i]?.image), d = HOSTED.steps[i];
        return own ?? (d ? file(`step-0${i + 1}`) ?? { src: d } : null);
      }),
      band: pic(m.house?.image, "band", HOSTED.band),
      merch: pic(m.merch?.image, "merch", HOSTED.merch), gear: pic(m.gear?.image, "gear", HOSTED.gear),
    },
  };
}
