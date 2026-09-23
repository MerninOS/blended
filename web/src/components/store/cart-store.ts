"use client";
// Retail cart: a small persisted store (localStorage "blended-cart-v1").
// Lines carry only what the server needs to re-price at checkout, plus the
// display fields the drawer shows.
import { useSyncExternalStore } from "react";
import type { SelItem, ShopSizeId } from "@/lib/domain/types";
import { MAX_BAGS } from "@/lib/domain/coffee";

export interface CartLine {
  id: string;
  kind: "stock" | "blend";
  key: string | null;          // stock lines merge by sku+size
  skuId?: string;
  sizeId: ShopSizeId;
  sizeLabel: string;
  name: string;
  qty: number;
  unit: number;                // display price; the server re-prices
  roast: number;
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
  add(it: Omit<CartLine, "id">, fresh = false) {
    const same = it.kind === "stock" && state.items.find((x) => x.kind === "stock" && x.key === it.key);
    const items = same
      ? state.items.map((x) => (x === same ? { ...x, qty: Math.min(MAX_BAGS, x.qty + it.qty), unit: it.unit } : x))
      : [...state.items, { ...it, id: "ci-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }];
    set({ items, open: true, freshId: fresh && !same ? items[items.length - 1].id : null });
  },
  qty(id: string, q: number) { set({ items: state.items.map((x) => (x.id === id ? { ...x, qty: Math.max(1, Math.min(MAX_BAGS, q)) } : x)) }); },
  remove(id: string) { set({ items: state.items.filter((x) => x.id !== id) }); },
  clear() { set({ items: [], freshId: null }); },
  setOpen(v: boolean) { set({ open: v, freshId: v ? state.freshId : null }, false); },
};

const SERVER: State = { items: [], open: false, freshId: null, hydrated: false };
export function useCart() {
  return useSyncExternalStore(cartStore.subscribe, cartStore.get, () => SERVER);
}
