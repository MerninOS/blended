import "server-only";
// Turns a cart into a Shopify draft order. Prices are recomputed here from the
// live catalog; the client only sends ids, ratios and quantities.
import type { Catalog, GreenLot, SelItem } from "@/lib/domain/types";
import type { RetailLine } from "@/lib/domain/requests";
import {
  G_PER_LB, MAX_BAGS, grindOf, stockBagPrice, MAX_COMPONENTS, bagPrice, indexLots, isExclusive, minPctFor, minsFit, minsTotalG,
  retailSel, roastName, roastOf, round2, shippingFor, shopSize, type LotIndex,
} from "@/lib/domain/coffee";
import { env } from "@/lib/env";
import { admin, assertNoUserErrors, gql } from "@/lib/shopify/client";
import type { MerchProduct } from "@/lib/merch-types";
import { DEFAULT_ROAST_LOSS, greenUsageG, lotGrams } from "@/lib/domain/green";

export class CheckoutError extends Error {}

export const BLEND_PROP = "_blend";         // hidden (underscore) line property with the recipe JSON
export const BLEND_VERSION = 1;
export const ITEM_PROP = "_item";           // hidden line property marking merch / gear ("merch" | "gear")
export interface BlendRecipe { v: number; name: string; roast: number; sizeId: string; sel: { id: string; name: string; lot: string; pct: number; roast: number }[] }

/** Validate a blend against the catalog and batch size; returns the clean selection. */
/** `member`: the buyer has unlocked SMS-exclusive lots (verified number, and exclusives switched on). */
export function checkBlend(sel: SelItem[], batchG: number, idx: LotIndex, { member = false } = {}): SelItem[] {
  if (!Array.isArray(sel) || sel.length < 1) throw new CheckoutError("Add at least one coffee to your blend.");
  if (sel.length > MAX_COMPONENTS) throw new CheckoutError(`A blend can hold up to ${MAX_COMPONENTS} coffees.`);
  const ids = new Set<string>();
  const clean = sel.map((s) => {
    const lot = idx.get(String(s.id));
    if (!lot) throw new CheckoutError("One of the coffees in this blend is no longer available.");
    if (lot.avail <= 0) throw new CheckoutError(`${lot.name} is out of stock.`);
    if (isExclusive(lot) && !member) throw new CheckoutError(`${lot.name} is for SMS members. Join the list in the Coffee Lab to unlock it.`);
    if (ids.has(lot.id)) throw new CheckoutError("A coffee appears twice in the blend.");
    ids.add(lot.id);
    const pct = Math.round(Number(s.pct));
    if (!(pct >= 0 && pct <= 100)) throw new CheckoutError("Blend ratios are invalid.");
    return { id: lot.id, pct };
  });
  if (clean.reduce((a, s) => a + s.pct, 0) !== 100) throw new CheckoutError("Blend ratios must add up to 100%.");
  if (!minsFit(clean, batchG, idx))
    throw new CheckoutError(`This batch is ${Math.round(batchG).toLocaleString("en-US")} g — these coffees need ${minsTotalG(clean, idx).toLocaleString("en-US")} g between them.`);
  for (const s of clean) {
    if (clean.length > 1 && s.pct < minPctFor(idx.get(s.id), batchG)) throw new CheckoutError(`${idx.get(s.id)!.name} is below its minimum share for this batch.`);
  }
  return clean;
}

/**
 * Refuse an order that needs more green than Shopify has available. `usageG` covers
 * every coffee in the order (custom blends and ours share the same green), roast loss included.
 */
export function assertGreenStock(usageG: Map<string, number>, idx: LotIndex) {
  for (const [id, g] of usageG) {
    const lot = idx.get(id);
    if (!lot) throw new CheckoutError("A coffee in your order is no longer available.");
    if (g > lotGrams(lot) + 1)
      throw new CheckoutError(`We don't have enough ${lot.name} green left for this order (${(lotGrams(lot) / G_PER_LB).toLocaleString("en-US", { maximumFractionDigits: 1 })} lb on hand) — try fewer bags, a smaller size, or swap it out.`);
  }
}

export const recipeOf = (name: string, roast: number, sizeId: string, sel: SelItem[], idx: LotIndex): BlendRecipe => ({
  v: BLEND_VERSION, name, roast, sizeId,
  sel: sel.map((s) => { const l = idx.get(s.id) as GreenLot; return { id: l.id, name: l.name, lot: l.lot, pct: s.pct, roast: l.roast }; }),
});
export const cleanName = (n: unknown, fallback: string) => String(n ?? "").replace(/\s+/g, " ").trim().slice(0, 32) || fallback;
export const clampRoast = (r: unknown, sel: SelItem[], idx: LotIndex) => {
  const n = Number(r);
  return r != null && r !== "" && n >= 1 && n <= 5 ? Math.round(n) : Math.max(1, Math.min(5, Math.round(roastOf(sel, idx))));
};
const money = (amount: number) => ({ amount: round2(amount).toFixed(2), currencyCode: env.currency });

type DraftLine = Record<string, unknown>;
export interface PricedCart { lines: DraftLine[]; goods: number; shipping: number }

/** `lots`: every non-archived green lot (our coffees can use lots the Lab doesn't offer); defaults to the listed ones.
 *  `member`: the buyer may put SMS-exclusive lots in a blend. */
export function priceRetailCart(lines: RetailLine[], cat: Catalog, opts: { demo?: boolean; merch?: MerchProduct[]; lots?: GreenLot[]; member?: boolean } = {}): PricedCart {
  if (!Array.isArray(lines) || !lines.length) throw new CheckoutError("Your cart is empty.");
  if (lines.length > 30) throw new CheckoutError("Too many lines in the cart.");
  const idx = indexLots(cat.green), stockIdx = indexLots(opts.lots ?? cat.green);
  const loss = cat.roastLoss ?? DEFAULT_ROAST_LOSS;
  const usage = new Map<string, number>();
  let goods = 0;
  const out: DraftLine[] = lines.map((l) => {
    const qty = Math.round(Number(l.qty));
    if (!(qty >= 1 && qty <= MAX_BAGS)) throw new CheckoutError(`Quantity must be between 1 and ${MAX_BAGS}.`);
    if (l.kind === "item") {
      const p = opts.merch?.find((m) => m.variants.some((v) => v.id === l.variantId));
      const v = p?.variants.find((x) => x.id === l.variantId);
      if (!p || !v) throw new CheckoutError("An item in your cart is no longer available.");
      if (!v.available) throw new CheckoutError(`${p.name} is sold out${Object.keys(v.options).length ? ` in ${Object.values(v.options).join(" / ")}` : ""}.`);
      goods += v.price * qty;
      return { variantId: v.id, quantity: qty, customAttributes: [{ key: ITEM_PROP, value: p.cat }] };
    }
    const size = shopSize(l.sizeId);
    if (l.kind === "stock") {
      const sku = cat.stock.find((s) => s.id === l.skuId);
      const v = sku?.variants[size.id] ?? (opts.demo && sku ? { id: "", price: stockBagPrice(sku, size), available: true } : undefined);
      if (!sku || !v) throw new CheckoutError("A coffee in your cart is no longer sold in that size.");
      if (!v.available || sku.greenBags?.[size.id] === 0) throw new CheckoutError(`${sku.name} (${size.label}) is sold out.`);
      // roasted to order from the same green as custom blends
      if (sku.greenSel) greenUsageG(sku.greenSel, size.lb * qty, sku.roast, loss, usage);
      goods += v.price * qty;
      return { variantId: v.id, quantity: qty, customAttributes: [{ key: "Grind", value: grindOf(l.grind) }] };
    }
    const batchG = size.lb * qty * G_PER_LB;
    const sel = checkBlend(l.sel, batchG, idx, { member: opts.member });
    const name = cleanName(l.name, "House blend");
    const roast = clampRoast(l.roast, sel, idx);
    greenUsageG(sel, size.lb * qty, roast, loss, usage);
    const unit = bagPrice(retailSel(sel, idx), size);
    goods += unit * qty;
    const recipe = recipeOf(name, roast, size.id, sel, idx);
    return {
      title: `${name} — Custom Blend`,
      quantity: qty,
      originalUnitPriceWithCurrency: money(unit),
      requiresShipping: true,
      taxable: true,
      sku: `BLEND-${size.id.toUpperCase()}`,
      weight: { value: size.lb, unit: "POUNDS" },
      customAttributes: [
        { key: "Size", value: size.label },
        { key: "Roast", value: roastName(roast) },
        { key: "Coffees", value: recipe.sel.map((s) => `${s.pct}% ${s.name}`).join(" · ") },
        { key: "Grind", value: "Whole bean" },
        { key: BLEND_PROP, value: JSON.stringify(recipe) },
      ],
    };
  });
  assertGreenStock(usage, stockIdx);
  return { lines: out, goods, shipping: shippingFor(goods) };
}

const DRAFT_CREATE = gql`
  mutation RetailDraftCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder { id name invoiceUrl }
      userErrors { field message }
    }
  }
`;
const DRAFT_UPDATE = gql`
  mutation RetailDraftUpdate($id: ID!, $input: DraftOrderInput!) {
    draftOrderUpdate(id: $id, input: $input) {
      draftOrder { id name invoiceUrl status }
      userErrors { field message }
    }
  }
`;
type DraftRes = { id: string; name: string; invoiceUrl: string; status?: string };

const DRAFT_READY = gql`
  query DraftReady($id: ID!) { draftOrder(id: $id) { id ready } }
`;
/**
 * Shopify calculates a new or edited draft order in the background, and its
 * invoice (hosted checkout) says "not available yet" until that finishes.
 * Wait for `ready` before sending anyone there. Gives up quietly after ~15 s.
 */
export async function waitForDraftReady(id: string, timeoutMs = 15_000) {
  const until = Date.now() + timeoutMs;
  for (let delay = 250; Date.now() < until; delay = Math.min(delay * 1.5, 1500)) {
    const r = await admin<{ draftOrder: { ready: boolean } | null }>(DRAFT_READY, { variables: { id } });
    if (!r.draftOrder || r.draftOrder.ready) return;
    await new Promise((res) => setTimeout(res, delay));
  }
}

/**
 * Create (or refresh) the shopper's draft order and return Shopify's hosted
 * checkout URL. Re-using the previous open draft keeps abandoned drafts from
 * piling up in Shopify admin.
 */
export async function createRetailDraft(p: PricedCart, previousDraftId?: string | null): Promise<DraftRes> {
  const input = {
    lineItems: p.lines,
    shippingLine: { title: p.shipping ? "Flat rate · 2–3 days" : "Free shipping", priceWithCurrency: money(p.shipping) },
    tags: ["blended", "channel:retail"],
    allowDiscountCodesInCheckout: true,
    visibleToCustomer: true,
    note: "Blended storefront · whole bean, roasted to order",
  };
  if (previousDraftId) {
    try {
      const r = await admin<{ draftOrderUpdate: { draftOrder: DraftRes | null; userErrors: { message: string }[] } }>(DRAFT_UPDATE, { variables: { id: previousDraftId, input } });
      const d = r.draftOrderUpdate.draftOrder;
      if (d && !r.draftOrderUpdate.userErrors.length && d.status === "OPEN") { await waitForDraftReady(d.id); return d; }
    } catch { /* completed or deleted — fall through to a new draft */ }
  }
  const r = await admin<{ draftOrderCreate: { draftOrder: DraftRes | null; userErrors: { field?: string[]; message: string }[] } }>(DRAFT_CREATE, { variables: { input } });
  assertNoUserErrors(r.draftOrderCreate, "Could not start checkout");
  const d = r.draftOrderCreate.draftOrder!;
  await waitForDraftReady(d.id);
  return d;
}
