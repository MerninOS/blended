"use client";
// One place the storefront reports commerce events. Each event goes to:
//  - Shopify analytics (sessions, funnel, attribution) — with analytics consent
//  - Klaviyo (browse / cart abandonment flows) — with marketing consent
//  - Vercel Web Analytics custom events — anonymous, always
import { AnalyticsEventName, ShopifySalesChannel, getClientBrowserParameters, sendShopifyAnalytics } from "@shopify/hydrogen-react";
import type { ShopifyAnalyticsProduct } from "@shopify/hydrogen-react";
import { track as vercelTrack } from "@vercel/analytics";
import type { TrackingConfig } from "@/lib/shop";
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

export type PageType = "index" | "product" | "policy" | "page";
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
  kind: "stock" | "blend";
}
const toShopify = (i: TrackedItem): ShopifyAnalyticsProduct | null => i.productGid ? {
  productGid: i.productGid, variantGid: i.variantGid, name: i.name, variantName: i.variantName,
  brand: "Blended", category: "Coffee", price: i.price.toFixed(2), sku: i.sku, quantity: i.quantity ?? 1,
} : null;

export function trackProductView(i: TrackedItem) {
  whenKnown(() => {
    const p = toShopify(i);
    if (p) shopify(AnalyticsEventName.PRODUCT_VIEW, { pageType: "product", resourceId: i.productGid, products: [p], totalValue: i.price });
    klaviyo("track", "Viewed Product", {
      ProductName: i.name, ProductID: i.productGid ?? i.name, SKU: i.sku, Categories: ["Coffee"], ImageURL: i.image ?? undefined,
      URL: i.url ?? location.href, Brand: "Blended", Price: i.price,
    });
    klaviyo("trackViewedItem", { Title: i.name, ItemId: i.productGid ?? i.name, Categories: ["Coffee"], ImageUrl: i.image ?? undefined, Url: i.url ?? location.href, Metadata: { Brand: "Blended", Price: i.price } });
  });
}

export function trackAddToCart(i: TrackedItem, cartValue: number, cartNames: string[]) {
  whenKnown(() => {
    const p = toShopify(i);
    shopify(AnalyticsEventName.ADD_TO_CART, { cartId: cartGid(), products: p ? [p] : [], totalValue: i.price * (i.quantity ?? 1) });
    klaviyo("track", "Added to Cart", {
      $value: cartValue, AddedItemProductName: i.name, AddedItemProductID: i.productGid ?? i.name, AddedItemSKU: i.sku,
      AddedItemPrice: i.price, AddedItemQuantity: i.quantity ?? 1, AddedItemImageURL: i.image ?? undefined, ItemNames: cartNames,
      CheckoutURL: location.origin + "/?cart=open",
    });
    vercelTrack("add_to_cart", { kind: i.kind, value: Math.round(i.price * (i.quantity ?? 1)) });
  });
}

export function trackCheckoutStarted(value: number, names: string[], channel: "retail" | "wholesale") {
  whenKnown(() => {
    klaviyo("track", "Started Checkout", { $value: value, ItemNames: names, CheckoutURL: location.origin + (channel === "retail" ? "/?cart=open" : "/wholesale") });
    vercelTrack("begin_checkout", { channel, value: Math.round(value) });
  });
}

/** Tie the browser to a Klaviyo profile once they give us their email. */
export function identify(email: string) {
  whenKnown(() => {
    klaviyo("identify", { $email: email });
  });
}
