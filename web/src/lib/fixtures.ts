// Demo data from the design prototype. Used when Shopify isn't configured
// (local preview) and by the setup script to seed a fresh store.
import type { CoffeeReviewsData, GreenLot, Notes, StockCoffee } from "./domain/types";
import { AX } from "./domain/coffee";

// Demo-only sample reviews, derived from each coffee's cupping scores (ported
// from the prototype). Never seeded into a real store — real reviews come from
// the `reviews` JSON field on the product / green lot.
const CR_GRADERS = [{ n: "Maya R.", t: "Q Grader" }, { n: "Luis O.", t: "Head roaster" }, { n: "Priya S.", t: "Q Grader" }];
const CR_PEOPLE = ["Jordan K.", "Sam T.", "Alex M.", "Riley P.", "Casey W.", "Morgan L.", "Devon H.", "Avery C.", "Jamie F.", "Taylor B."];
const CR_BREW = ["Pour-over", "Espresso", "French press", "AeroPress", "Drip", "Cold brew"];
const CR_LINES: Record<string, string[]> = {
  cocoa: ["Rich and chocolatey without getting heavy.", "Tastes like a good dark chocolate bar."],
  brownSugar: ["Sweet enough that I stopped adding sugar.", "Caramel sweetness all the way through."],
  malt: ["Round, bready, very easy to drink every morning.", "Comforting and malty. My daily cup now."],
  hazelnut: ["Nutty and smooth. Great with milk.", "Toasted hazelnut, super mellow."],
  almond: ["Soft and nutty, nothing sharp about it.", "Clean, almond-y finish I keep chasing."],
  ferment: ["Wild in the best way, like boozy fruit.", "Funky and fun. Not for everyone, perfect for me."],
  berry: ["Big berry notes, almost jammy.", "Blueberry jumped out right away."],
  stoneFruit: ["Peachy and juicy as it cools.", "Stone fruit sweetness, really bright."],
  citrus: ["Bright and zesty, wakes you up.", "Lemony acidity that stays clean."],
  floral: ["Delicate, tea-like and floral.", "Jasmine on the nose, light body."],
};
const crHash = (s: string) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
function sampleReviews(id: string, notes: Notes): CoffeeReviewsData {
  const h = crHash(id), top = AX.map((a) => ({ k: a.k, l: a.l, v: notes[a.k] || 0 })).sort((a, b) => b.v - a.v);
  const g = CR_GRADERS[h % CR_GRADERS.length];
  const grader = { who: g.n, role: g.t, score: (84 + (top[0]?.v || 5) * .35 + (h % 7) / 10).toFixed(2),
    note: `${top[0]?.l || "Balanced"} up front, then ${(top[1]?.l || "sweetness").toLowerCase()} and ${(top[2]?.l || "a clean finish").toLowerCase()}. ${h % 2 ? "Holds its sweetness as it cools." : "Clean finish, medium body."}` };
  const reviews = [0, 1, 2].map((i) => {
    const lines = CR_LINES[top[i % 3]?.k || "malt"] || CR_LINES.malt;
    return { who: CR_PEOPLE[(h + i * 3) % CR_PEOPLE.length], brew: CR_BREW[(h + i) % CR_BREW.length], stars: i === 2 && h % 3 === 0 ? 4 : 5, text: lines[(h + i) % lines.length] };
  });
  return { grader, reviews, count: 12 + (h % 40), avg: +(reviews.reduce((a, r) => a + r.stars, 0) / reviews.length - (h % 3) * .1).toFixed(1) };
}

const g = (x: Omit<GreenLot, "wholesale" | "retail" | "minG" | "listed" | "tag" | "image" | "kind"> & Partial<GreenLot>): GreenLot => ({
  wholesale: null, retail: null, minG: null, listed: true, tag: null, kind: "anchor",
  image: `/images/green/${x.id}.webp`, reviews: sampleReviews(x.id, x.notes), ...x,
});

export const DEMO_GREEN: GreenLot[] = [
  g({ id: "cerrado", name: "Cerrado Norte", origin: "Brazil · Minas Gerais", lot: "LOT-2571", process: "Natural", roast: 4, price: 6.20, avail: 1860, notes: { cocoa: 7, hazelnut: 8, brownSugar: 5, malt: 5, almond: 4 } }),
  g({ id: "sierra", name: "Sierra Alta", origin: "Mexico · Chiapas", lot: "LOT-2588", process: "Washed", roast: 4, price: 6.85, avail: 1420, notes: { cocoa: 8, brownSugar: 6, almond: 5, malt: 4, hazelnut: 3 } }),
  g({ id: "huila", name: "Huila Reserve", origin: "Colombia · Huila", lot: "LOT-2604", process: "Washed", roast: 3, price: 7.60, avail: 980, notes: { brownSugar: 6, stoneFruit: 6, citrus: 5, cocoa: 4, malt: 3 } }),
  g({ id: "guji", name: "Guji Highland", origin: "Ethiopia · Guji", lot: "LOT-2612", process: "Washed", roast: 2, price: 9.40, avail: 640, notes: { floral: 8, citrus: 7, berry: 6, stoneFruit: 4 } }),
  g({ id: "straw", name: "Tolima Strawberry", origin: "Colombia · Tolima", lot: "LOT-2619", process: "Co-ferment", roast: 2, price: 14.20, kind: "limited", tag: "Limited", avail: 340, notes: { berry: 9, ferment: 7, stoneFruit: 5, floral: 4, brownSugar: 3 } }),
  g({ id: "peach", name: "Tarrazú Peach", origin: "Costa Rica · Tarrazú", lot: "LOT-2590", process: "Co-ferment", roast: 2, price: 13.50, kind: "soon", tag: "Back in Oct", avail: 0, notes: { stoneFruit: 9, ferment: 6, floral: 5, brownSugar: 4 } }),
];

const s = (x: Omit<StockCoffee, "retail" | "variants" | "image">): StockCoffee => ({
  retail: null, variants: {}, image: `/images/coffee/${x.id}.webp`, reviews: sampleReviews(x.id, x.notes), ...x,
});

export const DEMO_STOCK: StockCoffee[] = [
  s({ id: "s-counter", name: "Counter Standard", sub: "House blend · Brazil + Mexico", roast: 4, price: 7.15, lead: "Ships in 2 days", avail: "860 lb roasted weekly", tag: null,
    notes: { cocoa: 7, hazelnut: 6, brownSugar: 6, malt: 5, almond: 4 }, blurb: "The workhorse. Chocolate and toasted nut, forgiving on any espresso recipe." }),
  s({ id: "s-sixounce", name: "Six Ounce House", sub: "House blend · Mexico + Colombia + Ethiopia", roast: 3, price: 8.40, lead: "Ships in 2 days", avail: "540 lb roasted weekly", tag: null,
    notes: { cocoa: 5, brownSugar: 6, stoneFruit: 5, citrus: 4, floral: 3, malt: 3 }, blurb: "Sweeter and more aromatic. Built for filter, holds up in milk." }),
  s({ id: "s-cerrado", name: "Cerrado Norte", sub: "Single origin · Brazil · Minas Gerais", roast: 4, price: 7.60, lead: "Ships in 2 days", avail: "1,860 lb green", tag: null,
    notes: { cocoa: 7, hazelnut: 8, brownSugar: 5, malt: 5, almond: 4 }, blurb: "Natural process. Heavy body, hazelnut, low acidity." }),
  s({ id: "s-huila", name: "Huila Reserve", sub: "Single origin · Colombia · Huila", roast: 3, price: 9.10, lead: "Ships in 3 days", avail: "980 lb green", tag: null,
    notes: { brownSugar: 6, stoneFruit: 6, citrus: 5, cocoa: 4, malt: 3 }, blurb: "Washed. Caramel and stone fruit, clean finish." }),
  s({ id: "s-guji", name: "Guji Highland", sub: "Single origin · Ethiopia · Guji", roast: 2, price: 11.20, lead: "Ships in 3 days", avail: "640 lb green", tag: null,
    notes: { floral: 8, citrus: 7, berry: 6, stoneFruit: 4 }, blurb: "Washed. Jasmine, bergamot, tea-like. Your pour-over slot." }),
  s({ id: "s-decaf", name: "Cascara Decaf", sub: "Single origin · Colombia · sugarcane EA", roast: 3, price: 9.80, lead: "Ships in 4 days", avail: "420 lb green", tag: null,
    notes: { cocoa: 6, brownSugar: 6, stoneFruit: 4, malt: 3, almond: 3 }, blurb: "Sugarcane decaf. Sweet, round, nobody guesses." }),
  s({ id: "s-straw", name: "Tolima Strawberry", sub: "Co-ferment · Colombia · Tolima", roast: 2, price: 16.90, lead: "Ships in 3 days", avail: "340 lb left", tag: "Limited",
    notes: { berry: 9, ferment: 7, stoneFruit: 5, floral: 4, brownSugar: 3 }, blurb: "Strawberry co-ferment. Loud, seasonal, sells itself on a shelf." }),
  s({ id: "s-coldbrew", name: "Cold Brew Base", sub: "House blend · coarse-ground option", roast: 5, price: 6.40, lead: "Ships in 2 days", avail: "1,200 lb roasted weekly", tag: null,
    notes: { cocoa: 8, malt: 7, brownSugar: 5, hazelnut: 3 }, blurb: "Dark, syrupy, built to be diluted. Available whole bean or coarse." }),
];
