// The landing page's words. These are the defaults: Sanity (the "Landing page"
// document in /studio) overrides any of them, and a field left empty there
// falls back to what's written here. The Studio also starts a new document
// from these, so editors begin from the live copy.
//
// Headlines: a new line is a line break, and *words in asterisks* are set in
// the brand orange.

export interface Item { title: string; text: string }
export interface Origin { name: string; where: string; text: string }

export const DEFAULT_COPY = {
  seo: {
    title: "Blended · Build your blend",
    description: "Coffee from farmers we know by name. Pick up to four, set the ratios, and we roast it to order in your own bag.",
  },
  hero: {
    eyebrow: "Sourced direct · Roasted to order",
    headline: "Know the farm.\nChoose the *cup.*",
    body: "We buy from farmers we know by name and roast every order fresh. Start with a coffee from this week's shelf, or combine them into a blend that is yours alone.",
    primaryCta: "Explore our offerings",
    secondaryCta: "Build your blend",
  },
  lab: {
    eyebrow: "The Coffee Lab",
    headline: "Your\nratios.\n*Your\ncoffee.*",
    chips: ["Up to 4 coffees", "Any ratio", "Your name on the bag"],
    body: "Start with a base, add something bright, move the sliders. The tasting wheel and roast level update as the blend changes. When it tastes right, name it and we roast it.",
    cta: "Open the Coffee Lab",
  },
  farms: {
    eyebrow: "Where it comes from",
    headline: "The farms",
    body: "Every lot in the lineup names the farm and the people who grew it.",
    linkLabel: "Meet the producers",
    origins: [
      { name: "Brazil", where: "Minas Gerais · 1,100 m", text: "Sweet, low-acid naturals that give a blend its body and chocolate base." },
      { name: "Colombia", where: "Huila & Tolima · 1,700 m", text: "Washed lots and co-ferments with red fruit and a bright, clean finish." },
      { name: "Ethiopia", where: "Guji · 2,000 m", text: "Floral, tea-like coffees grown in the highlands by smallholder farmers." },
    ] as Origin[],
  },
  process: {
    eyebrow: "The process",
    headline: "Cherry to cup",
    steps: [
      { title: "Harvest", text: "Cherries are picked by hand at peak ripeness." },
      { title: "Process", text: "Washed, natural or co-fermented at the farm, then dried on raised beds." },
      { title: "Roast", text: "We roast your blend to order in small batches, then rest it before packing." },
      { title: "Brew", text: "It ships in your own bag, with the recipe on the card." },
    ] as Item[],
  },
  house: {
    eyebrow: "House blend · This month",
    cta: "Start from this blend",
  },
  merch: { title: "Merch", text: "Hats, tees and patches from the roastery.", cta: "Shop merch" },
  gear: { title: "Brew gear", text: "The grinders, kettles and drippers we use on our own bar.", cta: "Shop gear" },
  lineup: {
    headline: "The lineup",
    note: "Mix any of these · 100 g minimum each",
  },
  closing: {
    headline: "Your coffee,\n*your ratios.*",
    cta: "Start building",
  },
  smallPrint: {
    shipping: "Free shipping over $50",
    footer: "Whole bean · Roasted to order",
  },
};

export type LandingCopy = typeof DEFAULT_COPY;

/**
 * Lay what Sanity has over the defaults: an empty or missing text keeps the
 * default, a list Sanity filled replaces the default list outright (an item's
 * empty text stays empty rather than borrowing another item's words), and
 * anything Sanity adds that the defaults don't have (images, videos) is
 * carried through.
 */
export function mergeCopy<T>(def: T, cms: unknown): T {
  if (typeof def === "string") return (typeof cms === "string" && cms.trim() ? cms : def) as T;
  if (Array.isArray(def)) {
    if (!Array.isArray(cms) || !cms.length) return def;
    const shape = blank(def[0]);
    return cms.map((c) => mergeCopy(shape, c)).filter((c) => c !== "") as T;
  }
  if (def && typeof def === "object") {
    const src = cms && typeof cms === "object" && !Array.isArray(cms) ? (cms as Record<string, unknown>) : {};
    const out: Record<string, unknown> = { ...src };
    for (const [k, v] of Object.entries(def)) out[k] = mergeCopy(v, src[k]);
    return out as T;
  }
  return def;
}

const blank = (v: unknown): unknown =>
  typeof v === "string" ? "" : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)])) : v;

/** Headline text as lines of plain and highlighted (*…*) runs. */
export function headlineRuns(s: string): { t: string; hi: boolean }[][] {
  let hi = false;
  return s.split("\n").map((line) => {
    const runs: { t: string; hi: boolean }[] = [];
    line.split("*").forEach((t, i) => { if (i > 0) hi = !hi; if (t) runs.push({ t, hi }); });
    return runs;
  });
}

export const plainHeadline = (s: string) => s.replace(/\*/g, "").replace(/\s*\n\s*/g, " ").trim();
