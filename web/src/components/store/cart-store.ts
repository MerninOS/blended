"use client";
// Retail cart: a small persisted store (localStorage "blended-cart-v1").
// Lines carry only what the server needs to re-price at checkout, plus the
// display fields the drawer shows. Coffee lines are "stock" or "blend";
// merch and brew gear are "item" lines keyed by Shopify variant.
import { useSyncExternalStore } from "react";
import type { SelItem, ShopSizeId } from "@/lib/domain/types";
import { MAX_BAGS } from "@/lib/domain/coffee";

export interface CartLine {
  id: string;
  kind: "stock" | "blend" | "item";
  key: string | null;          // stock lines merge by sku+size, items by variant
  skuId?: string;
  sizeId?: ShopSizeId;
  sizeLabel: string;           // items: the variant ("Ink · M"), or the product type
  name: string;
  qty: number;
  unit: number;                // display price; the server re-prices
  roast?: number;
  grind?: string;              // stock lines; blends ship whole bean
  variantId?: string;
  handle?: string;
  image?: string | null;
  roastOverride?: number | null;
  sel?: SelItem[];
  parts?: { id: string; pct: number; name: string }[];
}

type State = { items: CartLine[]; open: boolean; freshId: string | null; hydrated: boolean };
const KEY = "blended-cart-v1";
let state: State = { items: [], open: false, freshId: null, hydrated: false };
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(state.items)); } catch { /* private mode */ } };
const set = (next: Partial<State>, save = true) => { state = { ...state, ...next }; if (save) persist(); emit(); };

function hydrate() {
  if (state.hydrated || typeof window === "undefined") return;
  let items: CartLine[] = [];
  try { items = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { items = []; }
  state = { ...state, items: Array.isArray(items) ? items : [], hydrated: true };
}

export const cartStore = {
  get: () => state,
  subscribe: (f: () => void) => { hydrate(); subs.add(f); queueMicrotask(emit); return () => { subs.delete(f); }; },
  add(it: Omit<CartLine, "id">, fresh = false, open = true) {
    const same = it.kind !== "blend" && state.items.find((x) => x.kind === it.kind && x.key === it.key);
    const items = same
      ? state.items.map((x) => (x === same ? { ...x, qty: Math.min(MAX_BAGS, x.qty + it.qty), unit: it.unit } : x))
      : [...state.items, { ...it, id: "ci-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }];
    set({ items, open: open || state.open, freshId: fresh && !same ? items[items.length - 1].id : null });
  },
  qty(id: string, q: number) { set({ items: state.items.map((x) => (x.id === id ? { ...x, qty: Math.max(1, Math.min(MAX_BAGS, q)) } : x)) }); },
  remove(id: string) { set({ items: state.items.filter((x) => x.id !== id) }); },
  clear() { set({ items: [], freshId: null }); },
  setOpen(v: boolean) { set({ open: v, freshId: v ? state.freshId : null }, false); },
  /** Adds lines from a restore link (an email's "return to your cart"), skipping any already in the cart. */
  restore(lines: Omit<CartLine, "id">[]) {
    const sig = (x: Omit<CartLine, "id">) => JSON.stringify([x.kind, x.key, x.name, x.sizeId, x.sel ?? null, x.roastOverride ?? null]);
    const have = new Set(state.items.map(sig));
    const fresh = lines.filter((x) => !have.has(sig(x)))
      .map((x, i) => ({ ...x, id: "ci-" + Date.now().toString(36) + i + Math.random().toString(36).slice(2, 6) }));
    set({ items: [...state.items, ...fresh], open: true, freshId: null });
  },
};

// Restore links carry the cart in the URL (base64url JSON) so a cart started on one
// device can be picked up from an email on another. Prices in it are display only:
// the server re-prices every line at checkout.
const LINE_FIELDS = ["kind", "key", "skuId", "sizeId", "sizeLabel", "name", "qty", "unit", "roast", "grind", "variantId", "handle", "image", "roastOverride", "sel", "parts"] as const;
export function encodeCart(items: CartLine[]): string {
  const lines = items.map((x) => Object.fromEntries(LINE_FIELDS.filter((k) => x[k] != null).map((k) => [k, x[k]])));
  const bytes = new TextEncoder().encode(JSON.stringify(lines));
  let bin = ""; bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function decodeCart(s: string): Omit<CartLine, "id">[] {
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    const lines: unknown = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
    if (!Array.isArray(lines)) return [];
    return lines.filter((x): x is Omit<CartLine, "id"> => !!x && typeof x === "object"
      && ["stock", "blend", "item"].includes(x.kind) && typeof x.name === "string" && typeof x.sizeLabel === "string"
      && Number.isInteger(x.qty) && x.qty >= 1 && typeof x.unit === "number")
      .slice(0, 20)
      .map((x) => ({ ...x, qty: Math.min(MAX_BAGS, x.qty), image: x.image && /^https:\/\/cdn\.(shopify\.com|sanity\.io)\//.test(x.image) ? x.image : null }));
  } catch { return []; }
}

const SERVER: State = { items: [], open: false, freshId: null, hydrated: false };
export function useCart() {
  return useSyncExternalStore(cartStore.subscribe, cartStore.get, () => SERVER);
}
