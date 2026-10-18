"use client";
// One place the storefront reports commerce events. Each event goes to:
//  - Shopify analytics (sessions, funnel, attribution) — with analytics consent
//  - Klaviyo (browse / cart abandonment flows) — with marketing consent
//  - Vercel Web Analytics custom events — anonymous, always
import { AnalyticsEventName, ShopifySalesChannel, getClientBrowserParameters, sendShopifyAnalytics } from "@shopify/hydrogen-react";
import type { ShopifyAnalyticsProduct } from "@shopify/hydrogen-react";
import { track as vercelTrack } from "@vercel/analytics";
import type { TrackingConfig } from "@/lib/shop";
import { encodeCart, type CartLine } from "@/components/store/cart-store";
import type { Consent } from "./consent";

let cfg: TrackingConfig | null = null;
let consent: Consent = { analytics: false, marketing: false };
// Events fired while hydrating (before the consent cookie has been read) wait here.
let known = false;
const pending: (() => void)[] = [];
const whenKnown = (f: () => void) => { if (known) f(); else if (pending.length < 50) pending.push(f); };

/** `k` is undefined until the consent cookie has been read on the client. */
export function configureTracking(c: TrackingConfig, k: Consent | null | undefined) {
  cfg = c;
  consent = k ?? { analytics: false, marketing: false };
  if (k !== undefined && !known) { known = true; pending.splice(0).forEach((f) => f()); }
}

declare global { interface Window { _learnq?: unknown[] } }
const klaviyo = (...args: unknown[]) => { if (consent.marketing && cfg?.klaviyoKey) (window._learnq ??= []).push(args); };

function shopify(eventName: string, extra: Record<string, unknown> = {}) {
  if (!cfg?.shopId || !consent.analytics) return;
  const payload = {
    hasUserConsent: true,
    analyticsAllowed: consent.analytics,
    marketingAllowed: consent.marketing,
    saleOfDataAllowed: consent.marketing,
    shopId: cfg.shopId,
    currency: cfg.currency,
    storefrontId: cfg.storefrontId ?? undefined,
    shopifySalesChannel: ShopifySalesChannel.headless,
    acceptedLanguage: "EN",
    ...getClientBrowserParameters(),
    ...extra,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- payload shape differs per event
  sendShopifyAnalytics({ eventName, payload: payload as any }).catch(() => { /* analytics must never break the page */ });
}

/** A stable pseudo cart id: the cart lives in the browser, but Shopify's add-to-cart event wants one. */
function cartGid() {
  try {
    let id = localStorage.getItem("blended-cart-id");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("blended-cart-id", id); }
    return `gid://shopify/Cart/${id}`;
  } catch { return "gid://shopify/Cart/anonymous"; }
}

export type PageType = "index" | "collection" | "product" | "policy" | "page";
export function trackPageView(pageType: PageType, resourceId?: string) {
  whenKnown(() => {
    shopify(AnalyticsEventName.PAGE_VIEW_2, { pageType, resourceId, canonicalUrl: location.origin + location.pathname });
  });
}

export interface TrackedItem {
  name: string;
  price: number;           // per bag
  quantity?: number;
  productGid?: string;     // stocked coffees only; blends are custom lines
  variantGid?: string;
  variantName?: string;
  sku?: string;
  image?: string | null;
  url?: string;
  kind: "stock" | "blend" | "item";
  category?: string;       // defaults to "Coffee"
}
const toShopify = (i: TrackedItem): ShopifyAnalyticsProduct | null => i.productGid ? {
  productGid: i.productGid, variantGid: i.variantGid, name: i.name, variantName: i.variantName,
  brand: "One Two Coffee", category: i.category ?? "Coffee", price: i.price.toFixed(2), sku: i.sku, quantity: i.quantity ?? 1,
} : null;

export function trackProductView(i: TrackedItem) {
  whenKnown(() => {
    const p = toShopify(i);
    if (p) shopify(AnalyticsEventName.PRODUCT_VIEW, { pageType: "product", resourceId: i.productGid, products: [p], totalValue: i.price });
    klaviyo("track", "Viewed Product", {
      ProductName: i.name, ProductID: i.productGid ?? i.name, SKU: i.sku, Categories: [i.category ?? "Coffee"], ImageURL: i.image ?? undefined,
      URL: i.url ?? location.href, Brand: "One Two Coffee", Price: i.price,
    });
    klaviyo("trackViewedItem", { Title: i.name, ItemId: i.productGid ?? i.name, Categories: [i.category ?? "Coffee"], ImageUrl: i.image ?? undefined, Url: i.url ?? location.href, Metadata: { Brand: "One Two Coffee", Price: i.price } });
  });
}

/** Cart lines as Klaviyo's Items, so flow emails can show what was left behind. Blends have
 *  no Shopify product: their recipe rides along as Blend. */
function klaviyoItems(lines: CartLine[]) {
  return lines.map((l) => ({
    ProductID: l.variantId ?? l.skuId ?? l.name, ProductName: l.name, Quantity: l.qty, ItemPrice: l.unit, RowTotal: l.unit * l.qty,
    ProductURL: location.origin + (l.kind === "item" && l.handle ? `/products/${l.handle}` : l.kind === "stock" && l.skuId ? `/coffees/${l.skuId}` : "/lab"),
    ImageURL: l.image ?? undefined, Variant: [l.sizeLabel, l.grind].filter(Boolean).join(" · "), Kind: l.kind,
    Blend: l.parts?.map((p) => `${p.pct}% ${p.name}`).join(" · "),
  }));
}
/** A link that refills this cart on any device; very large carts fall back to opening the saved cart. */
function cartUrl(lines: CartLine[]) {
  const url = `${location.origin}/lab?restore=${encodeCart(lines)}`;
  return url.length <= 1800 ? url : `${location.origin}/lab?cart=open`;
}
const cartValue = (lines: CartLine[]) => Math.round(lines.reduce((a, x) => a + x.unit * x.qty, 0) * 100) / 100;

/** `cart` is the whole cart after the add. */
export function trackAddToCart(i: TrackedItem, cart: CartLine[]) {
  whenKnown(() => {
    const p = toShopify(i);
    shopify(AnalyticsEventName.ADD_TO_CART, { cartId: cartGid(), products: p ? [p] : [], totalValue: i.price * (i.quantity ?? 1) });
    klaviyo("track", "Added to Cart", {
      $value: cartValue(cart), AddedItemProductName: i.name, AddedItemProductID: i.productGid ?? i.name, AddedItemSKU: i.sku,
      AddedItemPrice: i.price, AddedItemQuantity: i.quantity ?? 1, AddedItemImageURL: i.image ?? undefined, ItemNames: cart.map((x) => x.name),
      Items: klaviyoItems(cart), CheckoutURL: cartUrl(cart),
    });
    vercelTrack("add_to_cart", { kind: i.kind, value: Math.round(i.price * (i.quantity ?? 1)) });
  });
}

/** Retail: `cart` is sent so the email can list it, and `checkoutUrl` is Shopify's own checkout link
 *  (the draft order's invoice), which works on any device. */
export function trackCheckoutStarted(o: { channel: "retail"; checkoutUrl: string; cart: CartLine[] } | { channel: "wholesale"; checkoutUrl: string; value: number; names: string[] }) {
  whenKnown(() => {
    const value = o.channel === "retail" ? cartValue(o.cart) : o.value;
    klaviyo("track", "Started Checkout", o.channel === "retail"
      ? { $value: value, ItemNames: o.cart.map((x) => x.name), Items: klaviyoItems(o.cart), CheckoutURL: o.checkoutUrl, CartURL: cartUrl(o.cart), Channel: "retail" }
      : { $value: value, ItemNames: o.names, CheckoutURL: o.checkoutUrl, Channel: "wholesale" });
    vercelTrack("begin_checkout", { channel: o.channel, value: Math.round(value) });
  });
}

/** Tie the browser to a Klaviyo profile once they give us their email. */
export function identify(email: string) {
  whenKnown(() => {
    klaviyo("identify", { $email: email });
  });
}
