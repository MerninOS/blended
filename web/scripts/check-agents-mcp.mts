// The coffee server's rules (src/lib/agents-mcp/rules.ts): `npm run check:agents-mcp`. Pure, plain node.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { G_PER_LB, TOOLS, greenCover, greenLots, greenUse, inputsOf, isTool, keyOk, reorderAmount, type UseRow } from "../src/lib/agents-mcp/rules.ts";

// the same grams per pound as the storefront's domain code
assert.match(readFileSync(new URL("../src/lib/domain/coffee.ts", import.meta.url), "utf8"), new RegExp(`G_PER_LB = ${G_PER_LB};`));

// every tool only reads and takes whole numbers only, so OPERATOR lets the owner turn it on
assert.deepEqual(TOOLS.map((t) => t.name), ["green_lots", "green_use", "green_cover", "reorder_amount"]);
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

// the route only reads: it imports no write
const route = readFileSync(new URL("../src/app/api/agents-mcp/route.ts", import.meta.url), "utf8");
assert.doesNotMatch(route, /mutation|moveGreen|deductOrder|restockOrder|saveGreenLot|deleteGreenLot|setOrderStage|admin\(/);
assert.match(route, /if \(!key\(\)\) return new NextResponse\(null, \{ status: 404 \}\)/);

console.log("check:agents-mcp ok");
