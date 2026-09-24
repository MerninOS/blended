import "server-only";
// Private label (wholesale) orders → Shopify draft orders for a signed-in
// wholesale customer, paid by card on Shopify's hosted checkout for the draft.
import type { Catalog } from "@/lib/domain/types";
import type { WholesaleOrderRequest } from "@/lib/domain/requests";
import {
  G_PER_LB, PL_BAGS, greenUsageG, PL_FILL, PL_LABEL_SIZES, PL_MIN, PL_PACK, indexLots, plQuote, roastName, round2, wholesaleSel,
} from "@/lib/domain/coffee";
import { BLEND_PROP, CheckoutError, assertGreenStock, waitForDraftReady, checkBlend, clampRoast, cleanName, recipeOf } from "@/lib/checkout";
import { env } from "@/lib/env";
import { admin, assertNoUserErrors, gql } from "@/lib/shopify/client";

export function priceWholesale(r: WholesaleOrderRequest, cat: Catalog) {
  const idx = indexLots(cat.green);
  const lbs = Math.round(Number(r.lbs));
  if (!(lbs >= PL_MIN && lbs <= 5000)) throw new CheckoutError(`Minimum private label run is ${PL_MIN} lb.`);
  if (!PL_BAGS.some((b) => b.id === r.bagId)) throw new CheckoutError("Pick a bag size.");
  if (!PL_PACK.some((p) => p.id === r.packId)) throw new CheckoutError("Pick how it should be bagged.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.needBy || "")) throw new CheckoutError("Add a need-by date.");

  let productName: string, pricePerLb: number, roast: number, recipe = null as ReturnType<typeof recipeOf> | null;
  if (r.mode === "blend") {
    const sel = checkBlend(r.sel ?? [], lbs * G_PER_LB, idx);
    assertGreenStock(greenUsageG(sel, lbs), idx);
    productName = cleanName(r.blendName, "");
    if (!productName) throw new CheckoutError("Name the blend before ordering.");
    roast = clampRoast(r.roast, sel, idx);
    pricePerLb = wholesaleSel(sel, idx);
    recipe = recipeOf(productName, roast, r.bagId, sel, idx);
  } else {
    const sku = cat.stock.find((s) => s.id === r.skuId);
    if (!sku || !sku.price) throw new CheckoutError("That coffee isn't available for private label.");
    productName = sku.name; pricePerLb = sku.price; roast = sku.roast;
  }
  const ownBags = Math.max(0, Math.round(Number(r.ownBags) || 0));
  const q = plQuote({ pricePerLb, lbs, bagId: r.bagId, packId: r.packId, ownBagCount: ownBags });
  if (r.packId === "label" && !r.artwork?.filename) throw new CheckoutError("Attach label artwork before ordering.");
  if (r.packId === "own" && q.shortBags > 0) throw new CheckoutError(`You're ${q.shortBags} bags short — this run needs ${q.bags}.`);
  const labelSize = PL_LABEL_SIZES.includes(r.labelSize ?? "") ? r.labelSize! : PL_LABEL_SIZES[0];
  return { lbs, productName, pricePerLb, roast, recipe, q, ownBags, labelSize };
}

const money = (n: number) => ({ amount: round2(n).toFixed(2), currencyCode: env.currency });

const CREATE = gql`
  mutation WholesaleDraftCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder { id name invoiceUrl }
      userErrors { field message }
    }
  }
`;
const CUSTOMER_TAGS = gql`
  query WholesaleCustomer($id: ID!) {
    customer(id: $id) { id tags email }
  }
`;

/** Authoritative wholesale check against the Admin API (tags can change after sign-in). */
export async function isWholesaleCustomer(customerId: string) {
  const r = await admin<{ customer: { tags: string[] } | null }>(CUSTOMER_TAGS, { variables: { id: customerId } });
  return !!r.customer?.tags.some((t) => t.toLowerCase() === env.wholesaleTag.toLowerCase());
}

export async function placeWholesaleOrder(r: WholesaleOrderRequest, p: ReturnType<typeof priceWholesale>, customer: { id: string; email: string }) {
  const { q, lbs } = p;
  const packing = `${q.bags} × ${q.bag.label} · ${q.pack.title}`;
  const attrs = [
    { key: "Roast", value: roastName(p.roast) },
    { key: "Packaging", value: packing },
    { key: "Need by", value: r.needBy },
    ...(p.recipe ? [{ key: "Coffees", value: p.recipe.sel.map((s) => `${s.pct}% ${s.name}`).join(" · ") }, { key: BLEND_PROP, value: JSON.stringify(p.recipe) }] : []),
    ...(r.packId === "label" ? [{ key: "Label", value: `${r.artwork!.filename} · ${p.labelSize}` }, ...(r.artwork?.fileId ? [{ key: "_artwork_file", value: r.artwork.fileId }] : [])] : []),
    ...(r.packId === "own" ? [{ key: "Your bags", value: `${p.ownBags} arriving ${r.ownEta || "TBD"}` }] : []),
  ];
  const line = (title: string, qty: number, unit: number, extra: Record<string, unknown> = {}) =>
    ({ title, quantity: qty, originalUnitPriceWithCurrency: money(unit), requiresShipping: false, taxable: true, ...extra });
  const lineItems = [
    line(`${p.productName} · ${roastName(p.roast)} (roasted, per lb)`, lbs, p.pricePerLb,
      { requiresShipping: true, sku: p.recipe ? "PL-BLEND" : `PL-${r.skuId}`, weight: { value: 1, unit: "POUNDS" }, customAttributes: attrs }),
    ...(q.material > 0 ? [line(`${q.bag.label} stock bags`, q.bags, q.bag.material[q.pack.id])] : []),
    ...(q.pack.id === "own" ? [line("Bag handling · your bags", q.bags, q.pack.per)] : []),
    ...(q.pack.id === "label" ? [line(`Label application · ${p.labelSize}`, q.bags, q.pack.per)] : []),
    ...(q.setup > 0 ? [line("Plate setup (one time, per artwork)", 1, q.setup)] : []),
    line("Fill, seal, date-stamp", q.bags, PL_FILL),
  ];
  const s = r.ship;
  const [firstName, ...rest] = (s.contact || "").trim().split(/\s+/);
  const input: Record<string, unknown> = {
    purchasingEntity: { customerId: customer.id },
    email: customer.email || undefined,
    lineItems,
    shippingAddress: { company: s.company, firstName, lastName: rest.join(" ") || undefined, phone: s.phone || undefined,
      address1: s.line1, address2: s.line2 || undefined, city: s.city, provinceCode: s.state.toUpperCase(), zip: s.zip, countryCode: "US" },
    useCustomerDefaultAddress: false,
    poNumber: r.po?.slice(0, 60) || undefined,
    note: `Private label run · need by ${r.needBy}`,
    tags: ["blended", "channel:wholesale", "private-label"],
    visibleToCustomer: true,
  };
  const c = await admin<{ draftOrderCreate: { draftOrder: { id: string; name: string; invoiceUrl: string } | null; userErrors: { message: string }[] } }>(CREATE, { variables: { input } });
  assertNoUserErrors(c.draftOrderCreate, "Could not create the order");
  const draft = c.draftOrderCreate.draftOrder!;
  await waitForDraftReady(draft.id);
  return { url: draft.invoiceUrl, orderName: draft.name };
}
