// Normalized order shape the admin works with, whether it came from Shopify
// or the demo fixtures. Blend components are snapshotted onto the order line
// (Shopify line-item properties) so the roast sheet never depends on the
// current catalog.
import { G_PER_LB, ROAST_LOSS } from "./coffee";

export type Stage = "paid" | "roasting" | "packing" | "shipped";
export const STAGES: { id: Stage; label: string; hint: string }[] = [
  { id: "paid", label: "Paid", hint: "Waiting to be roasted" },
  { id: "roasting", label: "Roasting", hint: "On a machine" },
  { id: "packing", label: "Packing", hint: "Grinding and bagging" },
  { id: "shipped", label: "Shipped", hint: "Out the door" },
];
export const stageIdx = (id: Stage) => Math.max(0, STAGES.findIndex((s) => s.id === id));

export interface BlendComponent { id: string; name: string; lot: string; pct: number; roast: number }
export interface OrderItem {
  kind: "blend" | "stock";
  name: string;
  sizeLabel: string;
  sizeLb: number;
  qty: number;
  unit: number;       // price per bag as charged
  roast: number;
  grind: string;
  sel?: BlendComponent[];
}
export interface AdminOrder {
  id: string;          // Shopify GID (or demo id)
  name: string;        // "#1041"
  placed: string;      // "Aug 02"
  channel: "Web" | "Subscription" | "Wholesale";
  status: Stage;
  gift: boolean;
  qcHold?: boolean;
  note: string;
  customer: { name: string; email: string; city: string; address: string[] };
  ship: { method: string; tracking: string | null };
  items: OrderItem[];
  money: { goods: number; discount: number; shipping: number; total: number };
  adminUrl?: string;
}

export const itemLbs = (it: OrderItem) => it.sizeLb * it.qty;
export const orderLbs = (o: AdminOrder) => o.items.reduce((a, it) => a + itemLbs(it), 0);
export const orderBags = (o: AdminOrder) => o.items.reduce((a, it) => a + it.qty, 0);
export const grams = (lb: number) => Math.round(lb * G_PER_LB).toLocaleString("en-US") + " g";
export const GREEN_LOSS = ROAST_LOSS;

// what actually has to go on a machine: roasted lb by coffee, green lb by lot
export function roastPlan(orders: AdminOrder[]) {
  const roasted = new Map<string, { key: string; kind: OrderItem["kind"]; name: string; roast: number; lbs: number; orders: Set<string>; sel?: BlendComponent[] }>();
  const green = new Map<string, { id: string; name: string; lot: string; roast: number; lbs: number }>();
  orders.forEach((o) => o.items.forEach((it) => {
    const lbs = itemLbs(it);
    const key = `${it.kind}:${it.name}:${it.roast}`;
    const r = roasted.get(key) ?? { key, kind: it.kind, name: it.name, roast: it.roast, lbs: 0, orders: new Set<string>(), sel: it.sel };
    r.lbs += lbs; r.orders.add(o.id); roasted.set(key, r);
    // everything is roasted to order; only blends resolve to named green lots
    if (it.kind === "blend") it.sel?.forEach((s) => {
      const g = green.get(s.id) ?? { id: s.id, name: s.name, lot: s.lot, roast: s.roast, lbs: 0 };
      g.lbs += lbs * s.pct / 100; green.set(s.id, g);
    });
  }));
  return {
    roasted: [...roasted.values()].sort((a, b) => b.lbs - a.lbs).map((r) => ({ ...r, orders: r.orders.size })),
    green: [...green.values()].sort((a, b) => b.lbs - a.lbs),
  };
}

// grind + bag breakdown for the packing bench
export function packPlan(o: AdminOrder) {
  const by = new Map<string, { grind: string; sizeLabel: string; qty: number; names: string[] }>();
  o.items.forEach((it) => {
    const k = `${it.grind}|${it.sizeLabel}`;
    const e = by.get(k) ?? { grind: it.grind, sizeLabel: it.sizeLabel, qty: 0, names: [] };
    e.qty += it.qty; e.names.push(it.name); by.set(k, e);
  });
  return [...by.values()];
}
