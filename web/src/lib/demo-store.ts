import "server-only";
// In-memory stand-in for Shopify while no store is connected. Mutations from
// the admin (catalog edits, order stages) live for the life of the server
// process — enough to click through the flows locally.
import type { GreenLot } from "@/lib/domain/types";
import type { AdminOrder, OrderItem, Stage } from "@/lib/domain/orders";
import { bagPrice, indexLots, retailSel, roastOf, shippingFor, shopSize, stockBagPrice } from "@/lib/domain/coffee";
import { DEMO_GREEN, DEMO_STOCK } from "@/lib/fixtures";

type RawItem =
  | { kind: "blend"; name: string; sel: { id: string; pct: number }[]; roast: number; sizeId: string; grind: string; qty: number }
  | { kind: "stock"; skuId: string; sizeId: string; grind: string; qty: number };
type Raw = Omit<AdminOrder, "items" | "money" | "name"> & { items: RawItem[] };

const RAW: Raw[] = [
  { id: "CR-2061", placed: "Aug 02", channel: "Web", status: "paid", gift: false,
    customer: { name: "Maya Ellsworth", email: "maya.ellsworth@gmail.com", city: "Providence, RI", address: ["Maya Ellsworth", "118 Wickenden St, Apt 2", "Providence, RI 02903"] },
    ship: { method: "Ground · 2–3 day", tracking: null },
    items: [{ kind: "blend", name: "Sunday Morning", sel: [{ id: "huila", pct: 60 }, { id: "guji", pct: 40 }], roast: 3, sizeId: "1lb", grind: "Whole bean", qty: 2 }],
    note: "First order — asked for a roast date on the bag." },
  { id: "CR-2060", placed: "Aug 02", channel: "Subscription", status: "paid", gift: false,
    customer: { name: "Dev Raman", email: "dev@ramanstudio.co", city: "Brooklyn, NY", address: ["Dev Raman", "94 Meserole Ave, 3R", "Brooklyn, NY 11222"] },
    ship: { method: "Ground · 2–3 day", tracking: null },
    items: [{ kind: "stock", skuId: "s-counter", sizeId: "2lb", grind: "Whole bean", qty: 1 }],
    note: "Delivery 7 of a four-week subscription." },
  { id: "CR-2059", placed: "Aug 01", channel: "Web", status: "roasting", gift: true,
    customer: { name: "Hollis Pike", email: "hollis.pike@fastmail.com", city: "Austin, TX", address: ["Hollis Pike", "3407 Cherrywood Rd", "Austin, TX 78722"] },
    ship: { method: "Express · next day", tracking: null },
    items: [
      { kind: "stock", skuId: "s-guji", sizeId: "8oz", grind: "Whole bean", qty: 2 },
      { kind: "stock", skuId: "s-straw", sizeId: "8oz", grind: "Whole bean", qty: 1 },
    ],
    note: "Gift. Message card: \"Happy birthday, drink it fast.\"" },
  { id: "CR-2058", placed: "Aug 01", channel: "Web", status: "roasting", gift: false,
    customer: { name: "Corner Room Café", email: "orders@cornerroom.cafe", city: "New Haven, CT", address: ["Corner Room Café", "72 Orange St", "New Haven, CT 06510"] },
    ship: { method: "Ground · 2–3 day", tracking: null },
    items: [
      { kind: "blend", name: "Corner House", sel: [{ id: "cerrado", pct: 70 }, { id: "sierra", pct: 30 }], roast: 4, sizeId: "5lb", grind: "Whole bean", qty: 4 },
      { kind: "stock", skuId: "s-decaf", sizeId: "2lb", grind: "Whole bean", qty: 2 },
    ],
    note: "Standing café order." },
  { id: "CR-2057", placed: "Jul 31", channel: "Subscription", status: "packing", gift: false,
    customer: { name: "Priya Venkatesh", email: "pv@hey.com", city: "Oakland, CA", address: ["Priya Venkatesh", "1229 Alcatraz Ave", "Oakland, CA 94608"] },
    ship: { method: "Ground · 2–3 day", tracking: null },
    items: [{ kind: "blend", name: "Morning Weekday", sel: [{ id: "sierra", pct: 50 }, { id: "huila", pct: 30 }, { id: "guji", pct: 20 }], roast: 3, sizeId: "1lb", grind: "Whole bean", qty: 1 }],
    note: "" },
  { id: "CR-2056", placed: "Jul 31", channel: "Web", status: "packing", gift: false,
    customer: { name: "Tobias Lund", email: "tlund@protonmail.com", city: "Minneapolis, MN", address: ["Tobias Lund", "2815 Aldrich Ave S", "Minneapolis, MN 55408"] },
    ship: { method: "Ground · 2–3 day", tracking: null },
    items: [{ kind: "stock", skuId: "s-coldbrew", sizeId: "5lb", grind: "Whole bean", qty: 1 }],
    note: "" },
  { id: "CR-2054", placed: "Jul 30", channel: "Web", status: "shipped", gift: false,
    customer: { name: "Anne-Marie Sowa", email: "amsowa@gmail.com", city: "Chicago, IL", address: ["Anne-Marie Sowa", "4411 N Hermitage Ave", "Chicago, IL 60640"] },
    ship: { method: "Ground · 2–3 day", tracking: "9400 1899 5698 8412 7733 21" },
    items: [{ kind: "stock", skuId: "s-huila", sizeId: "1lb", grind: "Whole bean", qty: 3 }],
    note: "" },
  { id: "CR-2053", placed: "Jul 29", channel: "Subscription", status: "shipped", gift: false,
    customer: { name: "Ruth Okafor", email: "ruth.okafor@outlook.com", city: "Seattle, WA", address: ["Ruth Okafor", "615 15th Ave E, Unit 4", "Seattle, WA 98112"] },
    ship: { method: "Ground · 2–3 day", tracking: "9400 1899 5698 8412 7701 88" },
    items: [{ kind: "stock", skuId: "s-sixounce", sizeId: "1lb", grind: "Whole bean", qty: 2 }],
    note: "" },
];

function build(r: Raw): AdminOrder {
  const idx = indexLots(DEMO_GREEN);
  const items: OrderItem[] = r.items.map((it) => {
    const size = shopSize(it.sizeId);
    if (it.kind === "blend") {
      return { kind: "blend", name: it.name, sizeLabel: size.label, sizeLb: size.lb, qty: it.qty, grind: it.grind,
        unit: bagPrice(retailSel(it.sel, idx), size), roast: it.roast ?? roastOf(it.sel, idx),
        sel: it.sel.map((s) => { const g = idx.get(s.id)!; return { id: s.id, name: g.name, lot: g.lot, pct: s.pct, roast: g.roast }; }) };
    }
    const sku = DEMO_STOCK.find((s) => s.id === it.skuId)!;
    return { kind: "stock", name: sku.name, sizeLabel: size.label, sizeLb: size.lb, qty: it.qty, grind: it.grind, unit: stockBagPrice(sku, size), roast: sku.roast };
  });
  const gross = items.reduce((a, it) => a + it.unit * it.qty, 0);
  const discount = r.channel === "Subscription" ? gross * 0.10 : 0;
  const goods = gross - discount;
  const shipping = shippingFor(goods);
  return { ...r, name: r.id, items, money: { goods: gross, discount, shipping, total: goods + shipping } };
}

type State = { green: GreenLot[]; orders: AdminOrder[] };
const g = globalThis as unknown as { __blendedDemo?: State };
const state = (): State => (g.__blendedDemo ??= {
  green: DEMO_GREEN.map((l) => ({ ...l, notes: { ...l.notes } })),
  orders: RAW.map(build),
});

export const demoStore = {
  green: () => state().green,
  saveLot(lot: GreenLot) {
    const s = state();
    s.green = s.green.some((l) => l.id === lot.id) ? s.green.map((l) => (l.id === lot.id ? lot : l)) : [...s.green, lot];
  },
  deleteLot(id: string) { const s = state(); s.green = s.green.filter((l) => l.id !== id); },
  resetGreen() { state().green = DEMO_GREEN.map((l) => ({ ...l, notes: { ...l.notes } })); },
  orders: () => state().orders,
  setStage(id: string, status: Stage, tracking?: string | null) {
    const s = state();
    s.orders = s.orders.map((o) => (o.id === id ? { ...o, status, ship: { ...o.ship, tracking: tracking ?? o.ship.tracking } } : o));
  },
};
