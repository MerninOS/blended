import "server-only";
// Turns a cart into a Shopify draft order. Prices are recomputed here from the
// live catalog; the client only sends ids, ratios and quantities.
import type { Catalog, GreenLot, SelItem } from "@/lib/domain/types";
import type { RetailLine } from "@/lib/domain/requests";
import {
  G_PER_LB, MAX_BAGS, stockBagPrice, MAX_COMPONENTS, bagPrice, indexLots, minPctFor, minsFit, minsTotalG,
  retailSel, roastName, roastOf, round2, shippingFor, shopSize, type LotIndex,
} from "@/lib/domain/coffee";
import { env } from "@/lib/env";
import { admin, assertNoUserErrors, gql } from "@/lib/shopify/client";

export class CheckoutError extends Error {}

export const BLEND_PROP = "_blend";         // hidden (underscore) line property with the recipe JSON
export const BLEND_VERSION = 1;
export interface BlendRecipe { v: number; name: string; roast: number; sizeId: string; sel: { id: string; name: string; lot: string; pct: number; roast: number }[] }

/** Validate a blend against the catalog and batch size; returns the clean selection. */
export function checkBlend(sel: SelItem[], batchG: number, idx: LotIndex): SelItem[] {
  if (!Array.isArray(sel) || sel.length < 1) throw new CheckoutError("Add at least one coffee to your blend.");
  if (sel.length > MAX_COMPONENTS) throw new CheckoutError(`A blend can hold up to ${MAX_COMPONENTS} coffees.`);
  const ids = new Set<string>();
  const clean = sel.map((s) => {
    const lot = idx.get(String(s.id));
    if (!lot) throw new CheckoutError("One of the coffees in this blend is no longer available.");
    if (lot.avail <= 0) throw new CheckoutError(`${lot.name} is out of stock.`);
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

export function priceRetailCart(lines: RetailLine[], cat: Catalog, opts: { demo?: boolean } = {}): PricedCart {
  if (!Array.isArray(lines) || !lines.length) throw new CheckoutError("Your cart is empty.");
  if (lines.length > 30) throw new CheckoutError("Too many lines in the cart.");
  const idx = indexLots(cat.green);
  let goods = 0;
  const out: DraftLine[] = lines.map((l) => {
    const qty = Math.round(Number(l.qty));
    if (!(qty >= 1 && qty <= MAX_BAGS)) throw new CheckoutError(`Quantity must be between 1 and ${MAX_BAGS}.`);
    const size = shopSize(l.sizeId);
    if (l.kind === "stock") {
      const sku = cat.stock.find((s) => s.id === l.skuId);
      const v = sku?.variants[size.id] ?? (opts.demo && sku ? { id: "", price: stockBagPrice(sku, size), available: true } : undefined);
      if (!sku || !v) throw new CheckoutError("A coffee in your cart is no longer sold in that size.");
      if (!v.available) throw new CheckoutError(`${sku.name} (${size.label}) is sold out.`);
      goods += v.price * qty;
      return { variantId: v.id, quantity: qty, customAttributes: [{ key: "Grind", value: "Whole bean" }] };
    }
    const batchG = size.lb * qty * G_PER_LB;
    const sel = checkBlend(l.sel, batchG, idx);
    const name = cleanName(l.name, "House blend");
    const roast = clampRoast(l.roast, sel, idx);
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
      if (r.draftOrderUpdate.draftOrder && !r.draftOrderUpdate.userErrors.length && r.draftOrderUpdate.draftOrder.status === "OPEN") return r.draftOrderUpdate.draftOrder;
    } catch { /* completed or deleted — fall through to a new draft */ }
  }
  const r = await admin<{ draftOrderCreate: { draftOrder: DraftRes | null; userErrors: { field?: string[]; message: string }[] } }>(DRAFT_CREATE, { variables: { input } });
  assertNoUserErrors(r.draftOrderCreate, "Could not start checkout");
  return r.draftOrderCreate.draftOrder!;
}
