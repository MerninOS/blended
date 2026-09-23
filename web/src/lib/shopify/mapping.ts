import type { CoffeeReviewsData, GreenLot, Notes, ShopSizeId, StockCoffee } from "@/lib/domain/types";

// ---------- legacy green_lot metaobject -> GreenLot (migration only) ----------

export type MetaField = { key: string; value: string | null; reference?: { image?: { url: string } | null } | null };

const num = (v: string | null | undefined, d: number | null = null) => {
  if (v == null || v === "") return d;
  const n = Number(v); return isNaN(n) ? d : n;
};
const json = <T,>(v: string | null | undefined, d: T): T => { try { return v ? JSON.parse(v) as T : d; } catch { return d; } };

export function lotFromFields(node: { id: string; handle: string; fields: MetaField[]; capabilities?: { publishable?: { status: string } | null } | null }): GreenLot {
  const f = Object.fromEntries(node.fields.map((x) => [x.key, x]));
  const val = (k: string) => f[k]?.value ?? null;
  const kind = val("kind");
  return {
    id: node.handle,
    gid: node.id,
    name: val("name") || node.handle,
    origin: val("origin") || "",
    lot: val("lot_code") || "",
    process: val("process") || "Washed",
    roast: num(val("roast_level"), 3)!,
    price: num(val("green_price"), 0)!,
    wholesale: num(val("wholesale_price")),
    retail: num(val("retail_price")),
    avail: num(val("on_hand_lb"), 0)!,
    minG: num(val("min_grams")),
    kind: kind === "limited" || kind === "soon" ? kind : "anchor",
    tag: val("badge") || null,
    listed: node.capabilities?.publishable ? node.capabilities.publishable.status === "ACTIVE" : true,
    notes: json<Notes>(val("tasting_notes"), {}),
    image: f.image?.reference?.image?.url ?? null,
    reviews: json<CoffeeReviewsData | null>(val("reviews"), null),
  };
}

// ---------- product -> StockCoffee ----------
export const sizeFromOption = (v: string): ShopSizeId | null => {
  const t = v.toLowerCase().replace(/\s+/g, "");
  if (/^8oz/.test(t) || t === "0.5lb" || t === "½lb") return "8oz";
  if (/^1lb/.test(t) || t === "16oz") return "1lb";
  if (/^2lb/.test(t)) return "2lb";
  if (/^5lb/.test(t)) return "5lb";
  return null;
};

type MF = { value: string } | null;
export type SfProduct = {
  id: string; handle: string; title: string; description: string;
  featuredImage: { url: string } | null;
  variants: { nodes: { id: string; availableForSale: boolean; price: { amount: string }; selectedOptions: { name: string; value: string }[] }[] };
  roast: MF; notes: MF; reviews: MF; wholesale: MF; subtitle: MF; lead: MF; availability: MF; badge: MF;
};

export function stockFromProduct(p: SfProduct): StockCoffee {
  const variants: StockCoffee["variants"] = {};
  for (const v of p.variants.nodes) {
    const opt = v.selectedOptions.find((o) => /size|weight/i.test(o.name)) ?? v.selectedOptions[0];
    const id = opt && sizeFromOption(opt.value);
    if (id) variants[id] = { id: v.id, price: Number(v.price.amount), available: v.availableForSale };
  }
  return {
    id: p.handle, gid: p.id, name: p.title,
    sub: p.subtitle?.value || "",
    roast: num(p.roast?.value, 3)!,
    price: num(p.wholesale?.value, 0)!,
    retail: variants["1lb"] ? variants["1lb"].price : null,
    variants,
    lead: p.lead?.value || "Ships in 2 days",
    avail: p.availability?.value || "",
    tag: p.badge?.value || null,
    notes: json<Notes>(p.notes?.value, {}),
    blurb: p.description,
    image: p.featuredImage?.url ?? null,
    reviews: json<CoffeeReviewsData | null>(p.reviews?.value, null),
  };
}
