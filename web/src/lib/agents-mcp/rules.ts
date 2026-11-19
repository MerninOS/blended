// The coffee server's rules (app/api/agents-mcp): the tools One Two's agents may call on
// OPERATOR, their inputs, the key check and the green math. Pure, with no imports but types, so
// scripts/check-agents-mcp.ts can test it with plain node. Every number an agent sees is worked
// out here, in code, from the storefront's own green lots and green ledger.
import type { GreenLot } from "../domain/types";

/** The same grams per pound as lib/domain/coffee.ts (the check compares them). */
export const G_PER_LB = 453.592;
const lb = (g: number) => Math.round((g / G_PER_LB) * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

export const PROTOCOL = "2025-06-18";

type Int = { type: "integer"; minimum: number; maximum: number; default: number; description: string };
const int = (minimum: number, maximum: number, d: number, description: string): Int => ({ type: "integer", minimum, maximum, default: d, description });
const DAYS = int(7, 90, 30, "How many days of orders to average use over.");

/** The four tools, as tools/list shows them. Every one only reads, and takes whole numbers only. */
export const TOOLS = [
  { name: "green_lots", title: "Green lots on hand", description: "Every green lot that isn't archived: origin, lot code, process, pounds on hand, green price per lb, and whether customers can pick it.", inputSchema: { type: "object", properties: {} } },
  { name: "green_use", title: "Green use per week", description: "Pounds of each green lot used per week, from orders that had green deducted over a window.", inputSchema: { type: "object", properties: { days: DAYS } } },
  { name: "green_cover", title: "Days of green cover", description: "For each listed lot: pounds on hand, weekly use and how many days it lasts at that rate. numbers.lowest_days_of_cover is the lowest lot.", inputSchema: { type: "object", properties: { days: DAYS } } },
  { name: "reorder_amount", title: "Reorder amount for a cover target", description: "For each listed lot under the target: pounds to buy to get back to that many days of cover, and the green cost at today's price.", inputSchema: { type: "object", properties: { target_days: int(7, 180, 60, "Days of cover to get back to."), days: DAYS } } },
].map((t) => ({ ...t, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } }));
export type ToolName = "green_lots" | "green_use" | "green_cover" | "reorder_amount";
export const isTool = (n: unknown): n is ToolName => TOOLS.some((t) => t.name === n);

/** A tool's inputs: whole numbers in range, the default when left out; anything else is refused. */
export function inputsOf(tool: ToolName, raw: unknown): { args: Record<string, number> } | { problem: string } {
  const a = (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}) as Record<string, unknown>;
  const props = (TOOLS.find((t) => t.name === tool)!.inputSchema.properties ?? {}) as Record<string, Int>;
  const extra = Object.keys(a).filter((k) => !(k in props));
  if (extra.length) return { problem: `${tool} takes no ${extra.join(", ")}` };
  const args: Record<string, number> = {};
  for (const [k, p] of Object.entries(props)) {
    const v = a[k] ?? p.default;
    if (typeof v !== "number" || !Number.isInteger(v) || v < p.minimum || v > p.maximum) return { problem: `${k} is a whole number from ${p.minimum} to ${p.maximum}` };
    args[k] = v;
  }
  return { args };
}

/** The bearer key, compared in constant time. No key set: nothing is served. */
export function keyOk(header: string | null, key: string | undefined): boolean {
  if (!key || key.length < 32) return false;
  const got = /^Bearer (\S+)$/.exec(header ?? "")?.[1] ?? "";
  const a = new TextEncoder().encode(got), b = new TextEncoder().encode(key);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

/** One order in the green ledger, as far as the math needs it (lib/green-ledger.ts LedgerRow). */
export interface UseRow { state: "deducted" | "restocked" | "missing" | "unlinked"; lots: { id: string; g: number }[] }

/** Grams of each lot used by orders that had green deducted, and how many coffee orders never had it. */
export function gramsUsed(rows: readonly UseRow[]): { used: Map<string, number>; neverDeducted: number } {
  const used = new Map<string, number>();
  for (const r of rows) if (r.state === "deducted") for (const l of r.lots) used.set(l.id, (used.get(l.id) ?? 0) + l.g);
  return { used, neverDeducted: rows.filter((r) => r.state === "missing").length };
}

type Lot = Pick<GreenLot, "id" | "name" | "origin" | "lot" | "process" | "price" | "listed" | "avail" | "availG">;
const gramsOf = (l: Lot) => l.availG ?? l.avail * G_PER_LB;

export function greenLots(lots: readonly Lot[]) {
  return {
    data: lots.map((l) => ({ id: l.id, lot: l.name, origin: l.origin, lotCode: l.lot, process: l.process, onHandLb: lb(gramsOf(l)), greenUsdPerLb: l.price, listed: l.listed })),
    numbers: { lots: lots.length, listed_lots: lots.filter((l) => l.listed).length, green_on_hand_lb: round2(lots.reduce((s, l) => s + lb(gramsOf(l)), 0)) },
  };
}

export function greenUse(lots: readonly Lot[], rows: readonly UseRow[], days: number) {
  const { used, neverDeducted } = gramsUsed(rows);
  const out = lots.filter((l) => used.has(l.id)).map((l) => ({ id: l.id, lot: l.name, usedLb: lb(used.get(l.id)!), perWeekLb: lb((used.get(l.id)! / days) * 7) }));
  return { data: { windowDays: days, lots: out, ordersNeverDeducted: neverDeducted }, numbers: { green_used_lb: round2(out.reduce((s, r) => s + r.usedLb, 0)), orders_never_deducted: neverDeducted } };
}

/** Days of cover for each listed lot: grams on hand over grams used per day in the window. Null when the lot wasn't used. */
export function coverRows(lots: readonly Lot[], rows: readonly UseRow[], days: number) {
  const { used } = gramsUsed(rows);
  return lots.filter((l) => l.listed).map((l) => {
    const perDayG = (used.get(l.id) ?? 0) / days, onHandG = gramsOf(l);
    return { id: l.id, lot: l.name, onHandLb: lb(onHandG), usedPerWeekLb: lb(perDayG * 7), daysOfCover: perDayG > 0 ? Math.round(onHandG / perDayG) : null, perDayG, onHandG, priceUsdPerLb: l.price };
  });
}

export function greenCover(lots: readonly Lot[], rows: readonly UseRow[], days: number) {
  const c = coverRows(lots, rows, days);
  const known = c.filter((r) => r.daysOfCover != null).map((r) => r.daysOfCover!);
  const numbers: Record<string, number> = { listed_lots: c.length, lots_under_21_days: known.filter((n) => n < 21).length };
  if (known.length) numbers.lowest_days_of_cover = Math.min(...known);
  return {
    data: { windowDays: days, lots: c.map(({ id, lot, onHandLb, usedPerWeekLb, daysOfCover }) => ({ id, lot, onHandLb, usedPerWeekLb, daysOfCover })), note: known.length ? "daysOfCover is null when the lot wasn't used in the window" : "no listed lot was used in the window, so there is no lowest days of cover" },
    numbers,
  };
}

export function reorderAmount(lots: readonly Lot[], rows: readonly UseRow[], target: number, days: number) {
  const out = coverRows(lots, rows, days).filter((r) => r.daysOfCover != null && r.daysOfCover < target).map((r) => {
    const needLb = lb(Math.max(0, r.perDayG * target - r.onHandG));
    return { id: r.id, lot: r.lot, daysOfCover: r.daysOfCover, reorderLb: needLb, greenCostUsd: round2(needLb * r.priceUsdPerLb) };
  });
  return { data: { targetDays: target, windowDays: days, lots: out }, numbers: { lots_to_reorder: out.length, reorder_lb: round2(out.reduce((s, r) => s + r.reorderLb, 0)), reorder_cost_usd: round2(out.reduce((s, r) => s + r.greenCostUsd, 0)) } };
}
