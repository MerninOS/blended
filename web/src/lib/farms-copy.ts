// The farms page's words (design: Our Farms.html). These are the defaults: the
// "Farms page" document in Sanity (/studio) overrides any of them, and a field
// left empty there falls back to what's written here. The farms themselves are
// "Farm" documents; until one is published, the page shows farms-seed.json.
//
// Headlines: a new line is a line break, and *words in asterisks* are set in
// the brand orange (as on the landing page).
import seed from "@/lib/farms-seed.json";

export interface FarmCountry { name: string; lede: string }
export interface FarmProcess { name: string; text: string; steps: string[] }

export const DEFAULT_FARMS_COPY = {
  seo: {
    title: "The farms",
    description: "Who grows the coffee we roast: the producers, where they farm, and how each lot is processed before it reaches us.",
  },
  hero: {
    eyebrow: "Where it comes from",
    headline: "The farms",
    // {producers} and {countries} are filled in from the farms on the page.
    body: "{producers} in {countries} grow every coffee we sell. Here is who they are, where they farm, and how each lot is processed before it reaches us.",
  },
  countries: [
    { name: "Brazil", lede: "Large estates on high, flat plateaus. Dry winters make it one of the few places naturals can be dried reliably at scale." },
    { name: "Colombia", lede: "Small family farms on steep Andean slopes, from Huila in the south to Quindío in the coffee axis. Many producers here are experimenting with honey and co-fermented lots." },
    { name: "Ethiopia", lede: "Coffee grows wild and semi-wild in the Guji highlands. Smallholders deliver cherry to a shared washing station, which processes it as one lot." },
    { name: "Mexico", lede: "Coffee from Veracruz, on the Gulf coast, mostly from smallholders farming a few hectares each." },
  ] as FarmCountry[],
  processes: {
    eyebrow: "At the farm",
    headline: "Four processes",
    body: "What happens between picking and drying sets most of the flavor in the cup. These are the methods our producers use.",
    items: [
      { name: "Washed", text: "The fruit is removed before drying, so the cup tastes of the seed and the place it grew. Clean, bright and clear.",
        steps: ["Pulp the skin off fresh cherry", "Ferment 12–36 hours to loosen the mucilage", "Wash in clean water channels", "Dry on raised beds or patios"] },
      { name: "Natural", text: "The whole cherry dries with the seed inside it. Sugars from the fruit carry into the cup as body, sweetness and dried-fruit notes.",
        steps: ["Sort out under- and over-ripe cherry", "Spread whole cherry thin on patios", "Turn several times a day for 2–3 weeks", "Hull off the dried fruit"] },
      { name: "Honey", text: "The skin comes off but some of the sticky mucilage stays on while the seed dries. It sits between washed and natural: sweet, round and still clear.",
        steps: ["Pulp the skin off fresh cherry", "Leave some or all of the mucilage on", "Dry slowly on raised beds, turning often", "Hull off the dried parchment"] },
      { name: "Co-ferment", text: "Cherry ferments in sealed tanks alongside other fruit. The process is newer and adds distinct fruit aromatics to the coffee.",
        steps: ["Load cherry into sealed tanks with fruit", "Ferment with controlled temperature and time", "Pulp or leave whole, depending on the lot", "Dry slowly to keep the aromatics"] },
    ] as FarmProcess[],
  },
  closing: {
    headline: "Blend their\n*coffees.*",
    body: "Every lot on this page is in the Coffee Lab. Pick two or more and set the ratio.",
  },
};

export type FarmsCopy = typeof DEFAULT_FARMS_COPY;

/** A farm as the page uses it, from Sanity or the seed list. */
export interface FarmDoc {
  _id: string;
  name: string;
  slug: string;
  producer?: string;
  country: string;
  region?: string;
  altitude?: string;
  varietal?: string;
  process?: string;
  harvest?: string;
  story?: string;
  /** Green lot handles (Admin → Green catalog), the coffees we buy from this farm. */
  lots?: string[];
  order?: number;
}

export const SEED_FARMS: FarmDoc[] = seed.farms;
