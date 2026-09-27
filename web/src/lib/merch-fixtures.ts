// Demo merch + gear from the design's placeholder catalog (shop/catalog.js),
// served while no Shopify store is connected.
import type { MerchCat, MerchProduct } from "./merch-types";

type Raw = {
  slug: string; name: string; cat: MerchCat; type: string; price: number; flag?: string; blurb: string;
  colors: { n: string; h: string }[] | null; sizes: string[] | null; soldOut?: string[]; details: string[]; care: string;
};

const RAW: Raw[] = [
  { slug: "logo-cap", name: "Blended logo cap", cat: "merch", type: "Headwear", price: 32, flag: "New",
    blurb: "Unstructured six-panel cap with the Blended mark embroidered on the front. Brass buckle strap.",
    colors: [{ n: "Paper", h: "#EFEDE6" }, { n: "Ink", h: "#1A1A18" }, { n: "Vermilion", h: "#D93D18" }], sizes: null,
    details: ["100% washed cotton twill", "Embroidered front mark", "Adjustable brass buckle", "One size fits most"], care: "Spot clean with cold water. Air dry." },
  { slug: "label-tee", name: "Label tee", cat: "merch", type: "Apparel", price: 36,
    blurb: "Heavyweight tee printed with the tasting card from the back of our bags.",
    colors: [{ n: "Paper", h: "#EFEDE6" }, { n: "Ink", h: "#1A1A18" }], sizes: ["S", "M", "L", "XL", "XXL"], soldOut: ["XXL"],
    details: ["6.5 oz ring-spun cotton", "Relaxed, boxy fit", "Water-based print", "Garment dyed"], care: "Machine wash cold, inside out. Tumble dry low." },
  { slug: "roastery-hoodie", name: "Roastery hoodie", cat: "merch", type: "Apparel", price: 78,
    blurb: "Brushed-back fleece hoodie with a tonal BLENDED print down the sleeve.",
    colors: [{ n: "Espresso", h: "#3A2118" }, { n: "Ink", h: "#1A1A18" }], sizes: ["S", "M", "L", "XL"],
    details: ["14 oz cotton-poly fleece", "Double-lined hood", "Ribbed cuffs and hem"], care: "Machine wash cold. Hang dry." },
  { slug: "diner-mug", name: "Diner mug", cat: "merch", type: "Drinkware", price: 24,
    blurb: "Thick-walled stoneware mug that holds heat through a slow morning. Holds 12 oz.",
    colors: [{ n: "Paper", h: "#EFEDE6" }, { n: "Amber", h: "#F5A623" }], sizes: null,
    details: ["Stoneware, 12 oz", "Dishwasher and microwave safe"], care: "Dishwasher safe." },
  { slug: "patch-set", name: "Patch set", cat: "merch", type: "Accessories", price: 14,
    blurb: "Three iron-on patches: the mark, the wordmark and a roast-ramp stripe.",
    colors: null, sizes: null, details: ["Set of 3", "Embroidered, iron-on backing"], care: "Iron on medium heat through a cloth." },
  { slug: "canvas-tote", name: "Market tote", cat: "merch", type: "Accessories", price: 28,
    blurb: "Heavy canvas tote sized to carry four bags of coffee home.",
    colors: [{ n: "Natural", h: "#E6DCC8" }], sizes: null, details: ["12 oz canvas", "Inside pocket", "Reinforced handles"], care: "Spot clean." },
  { slug: "hand-grinder", name: "Hand grinder", cat: "gear", type: "Grinders", price: 165, flag: "Bar pick",
    blurb: "Stainless conical burrs with stepped adjustment from espresso to cold brew.",
    colors: [{ n: "Black", h: "#1A1A18" }, { n: "Silver", h: "#C9C7C2" }], sizes: null,
    details: ["48 mm stainless conical burrs", "Holds 30 g of beans", "Aluminum body"], care: "Brush burrs dry. Do not wash with water." },
  { slug: "gooseneck-kettle", name: "Gooseneck kettle", cat: "gear", type: "Kettles", price: 139,
    blurb: "Variable-temperature electric kettle with a narrow spout for controlled pours.",
    colors: [{ n: "Matte black", h: "#1A1A18" }, { n: "Paper", h: "#EFEDE6" }], sizes: null,
    details: ["0.9 L capacity", "Holds temperature for 60 minutes", "1°F control"], care: "Descale monthly." },
  { slug: "ceramic-dripper", name: "Ceramic dripper", cat: "gear", type: "Brewers", price: 34,
    blurb: "Cone dripper for one to two cups. Spiral ribs keep the flow even.",
    colors: [{ n: "White", h: "#F4F3EF" }, { n: "Vermilion", h: "#D93D18" }], sizes: ["01", "02"],
    details: ["Porcelain", "Fits size 01 or 02 cone filters"], care: "Dishwasher safe." },
  { slug: "brew-scale", name: "Brew scale", cat: "gear", type: "Scales", price: 58,
    blurb: "Weighs to 0.1 g with a built-in timer. The scale we dial in with.",
    colors: null, sizes: null, details: ["0.1 g resolution, 2 kg max", "Auto-start timer", "USB-C charging"], care: "Wipe clean." },
  { slug: "cone-filters", name: "Cone filters", cat: "gear", type: "Filters", price: 9,
    blurb: "Unbleached paper filters, 100 per pack.",
    colors: null, sizes: ["01", "02"], details: ["100 filters", "Unbleached"], care: "Compostable." },
  { slug: "glass-server", name: "Glass server", cat: "gear", type: "Brewers", price: 30,
    blurb: "Borosilicate server with a gram scale printed on the side.",
    colors: null, sizes: null, details: ["600 ml", "Borosilicate glass", "Heat-safe handle"], care: "Dishwasher safe." },
];

export const DEMO_MERCH: MerchProduct[] = RAW.map((r) => {
  const colors = r.colors ?? [null], sizes = r.sizes ?? [null];
  const options = [
    ...(r.colors ? [{ name: "Color", values: r.colors.map((c) => ({ name: c.n, swatch: c.h })) }] : []),
    ...(r.sizes ? [{ name: "Size", values: r.sizes.map((s) => ({ name: s, swatch: null })) }] : []),
  ];
  const variants = colors.flatMap((c) => sizes.map((s) => ({
    id: `demo-${r.slug}${c ? `-${c.n}` : ""}${s ? `-${s}` : ""}`.toLowerCase().replace(/\s+/g, "-"),
    price: r.price, available: !(s && r.soldOut?.includes(s)), image: null,
    options: { ...(c ? { Color: c.n } : {}), ...(s ? { Size: s } : {}) },
  })));
  return {
    gid: null, handle: r.slug, name: r.name, cat: r.cat, type: r.type, blurb: r.blurb, descriptionHtml: `<p>${r.blurb}</p>`,
    price: r.price, flag: r.flag ?? null, images: [], options, variants, details: r.details, care: r.care,
  };
});
