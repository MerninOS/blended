// Shopify rate-limit handling (src/lib/shopify/throttle.ts and its use in client.ts):
// `npm run check:shopify-throttle`. Pure, plain node.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  DEFAULT_WAIT_MS, MAX_RETRIES, MAX_WAIT_MS, MIN_WAIT_MS,
  isThrottled, waitFromCost, waitFromRetryAfter, withThrottleRetry,
} from "../src/lib/shopify/throttle.ts";

// ---------- spotting a throttle ----------
// what Shopify's Admin API sends back when the bucket is empty
const THROTTLED_BODY = {
  errors: [{ message: "Throttled", extensions: { code: "THROTTLED", documentation: "https://shopify.dev/api/usage/rate-limits" } }],
  extensions: { cost: { requestedQueryCost: 752, actualQueryCost: null, throttleStatus: { maximumAvailable: 2000, currentlyAvailable: 152, restoreRate: 100 } } },
};
assert.ok(isThrottled(THROTTLED_BODY.errors));
assert.ok(isThrottled([{ message: "Throttled" }]), "the message alone, as the logs show it");
assert.ok(isThrottled([{ message: "x" }, { extensions: { code: "THROTTLED" } }]));
assert.ok(!isThrottled([{ message: "Access denied for products field." }]));
assert.ok(!isThrottled([{ message: "Field 'nope' doesn't exist on type 'Shop'", extensions: { code: "undefinedField" } }]));
assert.ok(!isThrottled([{ message: "Your request was throttled by an upstream" }]), "only Shopify's own word, not any mention");
assert.ok(!isThrottled(undefined) && !isThrottled(null) && !isThrottled("Throttled") && !isThrottled({ code: "THROTTLED" }));

// ---------- how long to wait ----------
// (752 − 152) points ÷ 100 points/s = 6 s
assert.equal(waitFromCost(THROTTLED_BODY.extensions.cost), 6000);
assert.equal(waitFromCost({ requestedQueryCost: 101, throttleStatus: { currentlyAvailable: 100, restoreRate: 100 } }), MIN_WAIT_MS, "never hammer: at least the minimum");
assert.equal(waitFromCost({ requestedQueryCost: 10, throttleStatus: { currentlyAvailable: 500, restoreRate: 100 } }), MIN_WAIT_MS, "points already back");
assert.equal(waitFromCost({ requestedQueryCost: 5000, throttleStatus: { currentlyAvailable: 0, restoreRate: 50 } }), MAX_WAIT_MS, "never sit past the cap");
assert.equal(waitFromCost({ requestedQueryCost: 300, throttleStatus: { currentlyAvailable: 0, restoreRate: 0 } }), DEFAULT_WAIT_MS, "no divide by zero");
assert.equal(waitFromCost({ requestedQueryCost: 300, throttleStatus: { currentlyAvailable: 0, restoreRate: -1 } }), DEFAULT_WAIT_MS);
assert.equal(waitFromCost({ requestedQueryCost: Number.NaN, throttleStatus: { currentlyAvailable: 0, restoreRate: 100 } }), DEFAULT_WAIT_MS);
assert.equal(waitFromCost(undefined), DEFAULT_WAIT_MS);
assert.equal(waitFromCost(null), DEFAULT_WAIT_MS);
assert.equal(waitFromCost({}), DEFAULT_WAIT_MS);

assert.equal(waitFromRetryAfter("2"), 2000);
assert.equal(waitFromRetryAfter("2.5"), 2500);
assert.equal(waitFromRetryAfter("0"), MIN_WAIT_MS);
assert.equal(waitFromRetryAfter("3600"), MAX_WAIT_MS);
assert.equal(waitFromRetryAfter(null), DEFAULT_WAIT_MS);
assert.equal(waitFromRetryAfter(""), DEFAULT_WAIT_MS);
assert.equal(waitFromRetryAfter("soon"), DEFAULT_WAIT_MS);
assert.equal(waitFromRetryAfter("-5"), DEFAULT_WAIT_MS);

// ---------- retrying ----------
class Throttle extends Error { wait: number; constructor(wait: number) { super("Throttled"); this.wait = wait; } }
const waitOf = (e: unknown) => (e instanceof Throttle ? e.wait : null);
const recorder = () => { const slept: number[] = []; return { slept, sleep: async (ms: number) => { slept.push(ms); } }; };
const noJitter = () => 0;

{ // succeeds after two throttles, waiting what Shopify asked each time
  const { slept, sleep } = recorder();
  let calls = 0;
  const out = await withThrottleRetry(async () => { calls++; if (calls < 3) throw new Throttle(1000 * calls); return "ok"; }, waitOf, { sleep, random: noJitter });
  assert.equal(out, "ok"); assert.equal(calls, 3); assert.deepEqual(slept, [1000, 2000]);
}
{ // the first try works: no waiting at all
  const { slept, sleep } = recorder();
  assert.equal(await withThrottleRetry(async () => 42, waitOf, { sleep }), 42);
  assert.deepEqual(slept, []);
}
{ // other errors are thrown at once, never retried (a bad query or a userError won't fix itself)
  const { slept, sleep } = recorder();
  let calls = 0;
  const boom = new Error("Shopify GraphQL error: Access denied");
  await assert.rejects(withThrottleRetry(async () => { calls++; throw boom; }, waitOf, { sleep }), (e) => e === boom);
  assert.equal(calls, 1); assert.deepEqual(slept, []);
}
{ // gives up after MAX_RETRIES more tries and throws the last throttle unchanged, so logs still say why
  const { slept, sleep } = recorder();
  let calls = 0;
  await assert.rejects(withThrottleRetry(async () => { calls++; throw new Throttle(700); }, waitOf, { sleep, random: noJitter }), (e) => e instanceof Throttle && e.message === "Throttled");
  assert.equal(calls, 1 + MAX_RETRIES); assert.deepEqual(slept, Array(MAX_RETRIES).fill(700));
}
{ // worst case stays bounded: a few tries at the capped wait (plus < 250 ms jitter each)
  const { slept, sleep } = recorder();
  await assert.rejects(withThrottleRetry(async () => { throw new Throttle(MAX_WAIT_MS); }, waitOf, { sleep, random: () => 0.999 }));
  assert.ok(slept.every((ms) => ms >= MAX_WAIT_MS && ms < MAX_WAIT_MS + 250));
  assert.ok(slept.reduce((a, b) => a + b, 0) < (MAX_WAIT_MS + 250) * MAX_RETRIES);
}
{ // retries: 0 means a single try
  const { slept, sleep } = recorder();
  let calls = 0;
  await assert.rejects(withThrottleRetry(async () => { calls++; throw new Throttle(500); }, waitOf, { sleep, retries: 0 }));
  assert.equal(calls, 1); assert.deepEqual(slept, []);
}
{ // the real sleep waits roughly as long as asked
  const t = Date.now();
  let calls = 0;
  await withThrottleRetry(async () => { if (calls++ === 0) throw new Throttle(MIN_WAIT_MS); return null; }, waitOf, { random: noJitter });
  assert.ok(Date.now() - t >= MIN_WAIT_MS - 20);
}

// ---------- the client uses it the right way ----------
const client = readFileSync(new URL("../src/lib/shopify/client.ts", import.meta.url), "utf8");
// a throttle is marked with the wait Shopify's cost data gives, and a 429 with its Retry-After
assert.match(client, /if \(isThrottled\(json\.errors\)\) throw throttled\([^)]*waitFromCost\(json\.extensions\?\.cost\)\)/);
assert.match(client, /res\.status === 429\) throw throttled\([\s\S]*?waitFromRetryAfter\(res\.headers\.get\("retry-after"\)\), 429\)/);
// only the Admin API retries: both its tries (normal and fresh-token) go through retryThrottled
const adminFn = client.slice(client.indexOf("export async function admin<T>"), client.indexOf("type UserError"));
assert.equal(adminFn.match(/retryThrottled\(/g)?.length, 2, "both admin() requests retry throttles");
assert.ok(!/retryThrottled/.test(client.slice(client.indexOf("export function storefront"), client.indexOf("// ---------- Admin API"))), "shopper-facing Storefront calls never wait");
// still exactly one fresh-token retry for a stale token
assert.equal(adminFn.match(/adminToken\(true\)/g)?.length, 1);

console.log("shopify throttle: ok");
