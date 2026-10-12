import "server-only";
// Data for the farms page (/farms): the farms from Sanity (or farms-seed.json
// until any are published), grouped by country, each with the green lots it
// grows looked up in the live catalog for tasting notes, roast and links.
import type { GreenLot, StockCoffee } from "@/lib/domain/types";
import { isExclusive, topNotes } from "@/lib/domain/coffee";
import { DEFAULT_FARMS_COPY, SEED_FARMS, type FarmDoc, type FarmProcess, type FarmsCopy } from "@/lib/farms-copy";
import { mergeCopy } from "@/lib/landing-copy";
import { cmsPic, type Pic } from "@/lib/landing";
import type { CmsImage } from "@/lib/sanity";

/** A coffee from a farm, as the page shows it. */
export interface FarmLot {
  id: string; name: string; process: string; roast: number; notes: string[];
  /** Our coffees page for it, when a single origin is roasted from just this lot. */
  shopHref: string | null; shopName: string | null;
  /** In the Coffee Lab: a one-lot blend to start from, or the Exclusive tab for members-only lots. */
  labHref: string; exclusive: boolean;
}
export interface Farm {
  id: string; anchor: string; name: string; producer: string | null; country: string; region: string | null;
  altitude: string | null; varietal: string | null; processes: string[]; harvest: string | null; story: string | null;
  lots: FarmLot[]; photos: (Pic | null)[];
}
export interface FarmCountryGroup { name: string; anchor: string; lede: string | null; regions: string[]; farms: Farm[] }
export interface FarmsPageData {
  copy: Pick<FarmsCopy, "seo" | "hero" | "closing"> & {
    processes: { eyebrow: string; headline: string; body: string; items: (FarmProcess & { image: Pic | null; anchor: string; farms: { name: string; anchor: string }[] })[] };
  };
  heroImage: Pic;
  countries: FarmCountryGroup[];
  farmCount: number;
}

// The landing page's farm band photo, until the farms page has its own.
const HERO_FALLBACK = "https://cdn.shopify.com/s/files/1/0880/3935/8739/files/coffee_farm_1.png?v=1790443204";

export const anchorOf = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const list = (v: unknown) => (Array.isArray(v) ? v.map(str).filter((x): x is string => !!x) : []);
const count = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;

/** Sanity's farms, or the seed list while none are published (or Sanity is unreachable). */
function farmDocs(cms: Record<string, unknown>[] | undefined): (FarmDoc & { photos?: CmsImage[] })[] {
  const docs = (cms ?? []).filter((d) => str(d.name) && str(d.country));
  if (!docs.length) return SEED_FARMS;
  return docs.map((d) => ({ ...(d as unknown as FarmDoc), photos: Array.isArray(d.photos) ? (d.photos as CmsImage[]) : [] }));
}

function lotOf(l: GreenLot, stock: StockCoffee[]): FarmLot {
  const single = stock.find((c) => c.greenSel?.length === 1 && c.greenSel[0].id === l.id);
  const exclusive = isExclusive(l);
  return {
    id: l.id, name: l.name, process: l.process, roast: l.roast, exclusive,
    notes: topNotes(l.notes, 3).filter((n) => n.v > 0).map((n) => n.l),
    shopHref: single ? `/coffees/${single.id}` : null, shopName: single?.name ?? null,
    labHref: exclusive ? "/lab#exclusive" : `/lab?blend=${encodeURIComponent(`${l.id}:100`)}#build`,
  };
}

export function farmsData(green: GreenLot[], stock: StockCoffee[], cms: { page: Record<string, unknown> | null; farms: Record<string, unknown>[] } | null): FarmsPageData {
  const page = (cms?.page ?? {}) as Record<string, unknown> & { hero?: { image?: CmsImage }; processes?: { items?: { image?: CmsImage; steps?: unknown }[] } };
  const base = mergeCopy({ seo: DEFAULT_FARMS_COPY.seo, hero: DEFAULT_FARMS_COPY.hero, closing: DEFAULT_FARMS_COPY.closing }, page);
  const { items: _defaults, ...processHead } = DEFAULT_FARMS_COPY.processes; // eslint-disable-line @typescript-eslint/no-unused-vars
  const ph = mergeCopy(processHead, page.processes);
  const D = DEFAULT_FARMS_COPY;

  // Lots that are listed and in stock, by handle.
  const lots = new Map(green.filter((l) => l.listed && l.avail > 0 && l.kind !== "soon").map((l) => [l.id, l]));

  const farms: Farm[] = farmDocs(cms?.farms).map((d) => {
    const own = (d.photos ?? []).map((p) => cmsPic(p));
    const farmLots = (d.lots ?? []).map((id) => lots.get(id)).filter((l): l is GreenLot => !!l).map((l) => lotOf(l, stock));
    const firstImage = (d.lots ?? []).map((id) => lots.get(id)?.image).find(Boolean);
    const photos: (Pic | null)[] = [0, 1, 2].map((i) => own[i] ?? (i === 0 && firstImage ? { src: firstImage, alt: d.name } : null));
    const processes = (str(d.process) ?? [...new Set(farmLots.map((l) => l.process))].join(", ")).split(/\s*,\s*/).filter(Boolean);
    const name = d.name.trim(), producer = str(d.producer);
    return {
      id: d._id, anchor: anchorOf(str(d.slug) ?? name), name, producer: producer && producer !== name ? producer : null,
      country: d.country.trim(), region: str(d.region), altitude: str(d.altitude), varietal: str(d.varietal), processes,
      harvest: str(d.harvest), story: str(d.story), lots: farmLots, photos,
    };
  });

  // Countries in the order their first farm appears; intros from the page document, else the defaults.
  const ledes = new Map<string, string>();
  for (const c of D.countries) ledes.set(c.name.toLowerCase(), c.lede);
  const cmsCountries = Array.isArray(page.countries) ? (page.countries as Record<string, unknown>[]) : [];
  for (const c of cmsCountries) { const n = str(c.name); if (n) ledes.set(n.toLowerCase(), str(c.lede) ?? ""); }
  const groups = new Map<string, FarmCountryGroup>();
  for (const f of farms) {
    const k = f.country.toLowerCase();
    let g = groups.get(k);
    if (!g) groups.set(k, g = { name: f.country, anchor: anchorOf(f.country), lede: ledes.get(k) || null, regions: [], farms: [] });
    g.farms.push(f);
    // "Acevedo, Huila" → "Huila": the index lists the wider region.
    const r = f.region?.split(/\s*,\s*/).pop();
    if (r && !g.regions.includes(r)) g.regions.push(r);
  }
  const countries = [...groups.values()];

  // Process cards: from the page document when it has any, each listing the farms that use it.
  const cmsItems = Array.isArray(page.processes?.items) ? page.processes.items : [];
  const items = (cmsItems.length
    ? cmsItems.map((p) => ({ name: str((p as Record<string, unknown>).name) ?? "", text: str((p as Record<string, unknown>).text) ?? "", steps: list(p.steps), image: cmsPic(p.image) }))
    : D.processes.items.map((p) => ({ ...p, image: null as Pic | null }))
  ).filter((p) => p.name).map((p) => ({
    ...p, anchor: `process-${anchorOf(p.name)}`,
    farms: farms.filter((f) => f.processes.some((x) => x.toLowerCase() === p.name.toLowerCase())).map((f) => ({ name: f.name, anchor: f.anchor })),
  }));

  const hero = {
    ...base.hero,
    body: base.hero.body.replace("{producers}", count(farms.length, "producer")).replace("{countries}", count(countries.length, "country").replace(/countrys$/, "countries")),
  };
  return {
    copy: { ...base, hero, processes: { ...ph, items } },
    heroImage: cmsPic(page.hero?.image) ?? { src: HERO_FALLBACK },
    countries, farmCount: farms.length,
  };
}
