// The coffee server's rules (src/lib/agents-mcp/rules.ts): `npm run check:agents-mcp`. Pure, plain node.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { G_PER_LB, TOOLS, chicagoDay, chicagoDaysAgo, greenCost, greenCover, greenLots, greenUse, inputsOf, isTool, keyOk, reorderAmount, stageCounts, type UseRow } from "../src/lib/agents-mcp/rules.ts";

// the same grams per pound as the storefront's domain code
assert.match(readFileSync(new URL("../src/lib/domain/coffee.ts", import.meta.url), "utf8"), new RegExp(`G_PER_LB = ${G_PER_LB};`));

// every tool only reads and takes whole numbers only, so OPERATOR lets the owner turn it on
assert.deepEqual(TOOLS.map((t) => t.name), ["green_lots", "green_use", "green_cover", "reorder_amount", "green_cost", "orders_by_stage"]);
for (const t of TOOLS) {
  assert.equal(t.annotations.readOnlyHint, true); assert.equal(t.annotations.destructiveHint, false);
  for (const p of Object.values(t.inputSchema.properties as Record<string, { type: string }>)) assert.equal(p.type, "integer", t.name);
}
assert.ok(isTool("green_cover") && !isTool("productDelete") && !isTool(undefined));

// inputs: defaults, ranges, whole numbers, nothing extra
assert.deepEqual(inputsOf("green_cover", {}), { args: { days: 30 } });
assert.deepEqual(inputsOf("reorder_amount", { target_days: 90 }), { args: { target_days: 90, days: 30 } });
assert.ok("problem" in inputsOf("green_cover", { days: 3 }));
assert.ok("problem" in inputsOf("green_cover", { days: 30.5 }));
assert.ok("problem" in inputsOf("green_cover", { days: "30" }));
assert.ok("problem" in inputsOf("green_lots", { query: "status:any" }), "a caller can't add a search");

// the key: bearer, constant time, at least 32 characters, none set means nothing is served
const K = "k".repeat(40);
assert.ok(keyOk(`Bearer ${K}`, K));
assert.ok(!keyOk(`Bearer ${K}x`, K) && !keyOk(K, K) && !keyOk(null, K) && !keyOk(`Bearer ${K}`, undefined) && !keyOk("Bearer short", "short"));

// the math
const lot = (id: string, lbOnHand: number, listed = true, price = 6) => ({ id, name: id.toUpperCase(), origin: "Brazil", lot: "L1", process: "Natural", price, listed, avail: lbOnHand, availG: lbOnHand * G_PER_LB });
const lots = [lot("a", 30), lot("b", 5), lot("c", 10), lot("hidden", 50, false)];
const rows: UseRow[] = [
  { state: "deducted", lots: [{ id: "a", g: 10 * G_PER_LB }, { id: "b", g: 5 * G_PER_LB }] },
  { state: "deducted", lots: [{ id: "a", g: 5 * G_PER_LB }] },
  { state: "restocked", lots: [{ id: "a", g: 100 * G_PER_LB }] },
  { state: "missing", lots: [{ id: "c", g: 99 * G_PER_LB }] },
];
assert.deepEqual(greenLots(lots).numbers, { lots: 4, listed_lots: 3, green_on_hand_lb: 95 });
const use = greenUse(lots, rows, 30);
assert.deepEqual(use.numbers, { green_used_lb: 20, orders_never_deducted: 1 }, "restocked and never-deducted orders don't count as use");
assert.deepEqual(use.data.lots.find((l) => l.id === "a"), { id: "a", lot: "A", usedLb: 15, perWeekLb: 3.5 });
const cov = greenCover(lots, rows, 30);
// a: 30 lb over 0.5 lb/day = 60 days; b: 5 lb over 1/6 lb/day = 30 days; c unused; hidden not listed
assert.deepEqual(cov.data.lots.map((l) => [l.id, l.daysOfCover]), [["a", 60], ["b", 30], ["c", null]]);
assert.deepEqual(cov.numbers, { listed_lots: 3, lots_under_21_days: 0, lowest_days_of_cover: 30 });
assert.equal(greenCover(lots, [], 30).numbers.lowest_days_of_cover, undefined, "no use, no lowest number");
const re = reorderAmount(lots, rows, 60, 30);
// b needs 60 days at 1/6 lb/day = 10 lb, has 5: buy 5 lb at $6; a sits at exactly 60 days
assert.deepEqual(re.data.lots, [{ id: "b", lot: "B", daysOfCover: 30, reorderLb: 5, greenCostUsd: 30 }]);
assert.deepEqual(re.numbers, { lots_to_reorder: 1, reorder_lb: 5, reorder_cost_usd: 30 });

// a day's green cost, by the Chicago day each order was placed
assert.equal(chicagoDay("2026-11-19T04:30:00Z"), "2026-11-18", "10:30 PM in Chicago is still the 18th");
assert.equal(chicagoDaysAgo(new Date("2026-11-19T04:30:00Z"), 1), "2026-11-17");
assert.equal(chicagoDaysAgo(new Date("2026-11-19T18:00:00Z"), 1), "2026-11-18");
assert.deepEqual(inputsOf("green_cost", {}), { args: { days_ago: 1 } });
assert.ok("problem" in inputsOf("green_cost", { days_ago: 0 }));
const dayRows: UseRow[] = [
  { state: "deducted", createdAt: "2026-11-18T15:00:00Z", lots: [{ id: "a", g: 2 * G_PER_LB }] },
  { state: "missing", createdAt: "2026-11-19T04:30:00Z", lots: [{ id: "b", g: 1 * G_PER_LB }, { id: "gone", g: 50 }] },
  { state: "restocked", createdAt: "2026-11-18T15:00:00Z", lots: [{ id: "a", g: 9 * G_PER_LB }] },
  { state: "deducted", cancelled: true, createdAt: "2026-11-18T16:00:00Z", lots: [{ id: "a", g: 9 * G_PER_LB }] },
  { state: "deducted", createdAt: "2026-11-17T15:00:00Z", lots: [{ id: "a", g: 9 * G_PER_LB }] },
];
const cost = greenCost(lots, dayRows, "2026-11-18");
assert.deepEqual(cost.numbers, { green_cost_usd: 18, orders: 2, unpriced_lots: 1 }, "2 lb of a and 1 lb of b at $6; restocked, cancelled and other days left out");
assert.deepEqual(cost.data.unpricedLots, ["gone"]);
assert.equal(greenCost(lots, dayRows, "2026-11-10").numbers.green_cost_usd, 0);

// open orders by board stage
const st = stageCounts([
  { tags: [], cancelledAt: null, displayFulfillmentStatus: "UNFULFILLED" },
  { tags: ["stage:roasting", "qc-hold"], cancelledAt: null, displayFulfillmentStatus: "UNFULFILLED" },
  { tags: ["stage:packing"], cancelledAt: null, displayFulfillmentStatus: "UNFULFILLED" },
  { tags: ["stage:packing", "qc-hold"], cancelledAt: null, displayFulfillmentStatus: "FULFILLED" },
  { tags: [], cancelledAt: "2026-11-18T00:00:00Z", displayFulfillmentStatus: "UNFULFILLED" },
]);
assert.deepEqual(st.numbers, { open_orders: 3, paid: 1, roasting: 1, packing: 1, qc_hold: 1 });
const stages = readFileSync(new URL("../src/lib/agents-mcp/stages.ts", import.meta.url), "utf8");
assert.match(stages, /nodes \{ tags cancelledAt displayFulfillmentStatus \}/);
assert.doesNotMatch(stages.slice(stages.indexOf("gql`"), stages.indexOf("`;")), /mutation|email|address|customer|Price/, "the stage read asks for tags and status only");

// the green ledger reads every page, not just the newest 100 orders
assert.match(readFileSync(new URL("../src/lib/green-ledger.ts", import.meta.url), "utf8"), /orders\(first: 100, after: \$after[\s\S]*pageInfo \{ hasNextPage endCursor \}[\s\S]*while \(after && \+\+pages < MAX_PAGES\)/);

// the route only reads: it imports no write
const route = readFileSync(new URL("../src/app/api/agents-mcp/route.ts", import.meta.url), "utf8");
assert.doesNotMatch(route, /mutation|moveGreen|deductOrder|restockOrder|saveGreenLot|deleteGreenLot|setOrderStage|admin\(/);
assert.match(route, /if \(!key\(\)\) return new NextResponse\(null, \{ status: 404 \}\)/);

console.log("check:agents-mcp ok");
