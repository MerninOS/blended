// Shopify Admin token selection (src/lib/shopify/admin-token.ts and its use in client.ts):
// `npm run check:shopify-admin-token`. Pure, plain node.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CURRENT_KEY, EXPIRY_MARGIN_MS, MAX_REPLACEMENTS,
  createAdminTokenSource, replacementKey, usable, type AdminToken,
} from "../src/lib/shopify/admin-token.ts";

const HOUR = 3_600_000;
let clock = 1_000_000_000_000;
const now = () => clock;

/** A fake unstable_cache: entries are kept by key, a missing key runs `mint`. */
function fakeCache(seed: Record<string, AdminToken> = {}) {
  const entries = new Map(Object.entries(seed));
  const keys: string[] = [];
  let minted = 0, direct = 0;
  const mint = (): AdminToken => ({ token: `shpat_${++minted}`, exp: clock + HOUR });
  return {
    entries, keys,
    get minted() { return minted; }, get direct() { return direct; },
    exchange: async (key: string) => { keys.push(key); if (!entries.has(key)) entries.set(key, mint()); return entries.get(key)!; },
    exchangeDirect: async () => { direct++; return mint(); },
  };
}

// ---------- usable ----------
assert.ok(usable({ token: "a", exp: clock + EXPIRY_MARGIN_MS + 1 }, clock));
assert.ok(!usable({ token: "a", exp: clock + EXPIRY_MARGIN_MS }, clock), "within a minute of expiry is not usable");
assert.ok(!usable({ token: "a", exp: clock - 1 }, clock));
assert.ok(!usable({ token: "", exp: clock + HOUR }, clock));
assert.ok(!usable({ token: "a", exp: Number.NaN }, clock));
assert.ok(!usable(null, clock) && !usable(undefined, clock));

// ---------- replacement keys never carry the token ----------
{
  const secret = "test-token-" + "x".repeat(24) + "-0123456789";
  const k = await replacementKey(secret);
  assert.match(k, /^replaces:[0-9a-f]{32}$/);
  assert.ok(!k.includes(secret) && !k.includes("0123456789"), "a digest, not the token");
  assert.equal(k, await replacementKey(secret), "same token, same entry (instances share one replacement)");
  assert.notEqual(k, await replacementKey(secret + "x"));
  assert.notEqual(k, CURRENT_KEY);
}

// ---------- normal path: one shared entry, memoised in the instance ----------
{
  const c = fakeCache();
  const get = createAdminTokenSource({ ...c, now });
  assert.equal(await get(), "shpat_1");
  assert.equal(await get(), "shpat_1");
  assert.deepEqual(c.keys, [CURRENT_KEY], "second call served from memory");
  assert.equal(c.direct, 0);
}

// ---------- the logged bug: the shared entry hands back an expired token ----------
// Before: an inline no-store exchange, which aborted the ISR regeneration.
// Now: a replacement cache entry, and no direct exchange.
{
  const stale = { token: "shpat_old", exp: clock - 5 * 60_000 };
  const c = fakeCache({ [CURRENT_KEY]: stale });
  const get = createAdminTokenSource({ ...c, now });
  assert.equal(await get(), "shpat_1");
  assert.deepEqual(c.keys, [CURRENT_KEY, await replacementKey("shpat_old")]);
  assert.equal(c.direct, 0, "never an uncached exchange");
  // a second instance with the same stale shared entry reuses that replacement
  const get2 = createAdminTokenSource({ exchange: c.exchange, exchangeDirect: c.exchangeDirect, now });
  assert.equal(await get2(), "shpat_1");
  assert.equal(c.minted, 1, "instances share one new token");
}

// ---------- a token about to expire counts as stale ----------
{
  const c = fakeCache({ [CURRENT_KEY]: { token: "shpat_old", exp: clock + 30_000 } });
  assert.equal(await createAdminTokenSource({ ...c, now })(), "shpat_1");
  assert.equal(c.direct, 0);
}

// ---------- the memo expires with time ----------
{
  const c = fakeCache();
  const get = createAdminTokenSource({ ...c, now });
  const start = clock;
  assert.equal(await get(), "shpat_1");
  clock += HOUR; // shared entry still holds shpat_1, now expired
  assert.equal(await get(), "shpat_2");
  assert.equal(c.direct, 0);
  clock = start;
}

// ---------- a refused token gets a different one, through the cache ----------
{
  const c = fakeCache();
  const get = createAdminTokenSource({ ...c, now });
  const first = await get();
  const second = await get(first);
  assert.notEqual(second, first);
  assert.equal(c.keys.at(-1), await replacementKey(first));
  assert.equal(await get(), second, "the replacement is remembered");
  assert.equal(c.direct, 0);
}
{ // the replacement entry somehow holds the refused token: keep looking
  const c = fakeCache({ [await replacementKey("shpat_bad")]: { token: "shpat_bad", exp: clock + HOUR } });
  const t = await createAdminTokenSource({ ...c, now })("shpat_bad");
  assert.notEqual(t, "shpat_bad");
}

// ---------- a chain of stale entries ends in a direct exchange, bounded ----------
{
  const seed: Record<string, AdminToken> = { [CURRENT_KEY]: { token: "s0", exp: clock - 1 } };
  for (let i = 0; i < MAX_REPLACEMENTS + 5; i++) seed[await replacementKey(`s${i}`)] = { token: `s${i + 1}`, exp: clock - 1 };
  const c = fakeCache(seed);
  assert.equal(await createAdminTokenSource({ ...c, now })(), "shpat_1");
  assert.equal(c.direct, 1);
  assert.equal(c.keys.length, 1 + MAX_REPLACEMENTS, "never follows the chain forever");
}

// ---------- failures surface, and nothing bad is remembered ----------
{
  let calls = 0;
  const get = createAdminTokenSource({
    exchange: async () => { calls++; throw new Error("Admin token exchange failed (400: app_not_installed)"); },
    exchangeDirect: async () => { throw new Error("unreachable"); },
    now,
  });
  await assert.rejects(get(), /app_not_installed/);
  await assert.rejects(get(), /app_not_installed/);
  assert.equal(calls, 2, "a failure is not cached in memory");
}

// ---------- the client uses it the right way ----------
const client = readFileSync(new URL("../src/lib/shopify/client.ts", import.meta.url), "utf8");
const tokenPart = client.slice(client.indexOf("// ---------- Admin API"), client.indexOf("export async function admin<T>"));
// the only fetch to the token endpoint lives in exchangeToken, which is only called via the cache or as the bounded fallback
assert.equal(client.match(/admin\/oauth\/access_token/g)?.length, 1);
assert.match(tokenPart, /unstable_cache\(exchangeToken,/);
assert.match(tokenPart, /createAdminTokenSource\(\{ exchange: exchangeCached, exchangeDirect: exchangeToken \}\)/);
assert.equal(tokenPart.match(/(?<!function )exchangeToken\(\)/g), null, "no inline exchange outside the token source");
// the normal entry keeps its old cache key, so a deploy doesn't throw away the live token
assert.match(tokenPart, /key === CURRENT_KEY \? \["shopify-admin-token"\]/);
// a static legacy token still wins
assert.match(tokenPart, /if \(env\.adminToken\) return env\.adminToken;/);

console.log("shopify admin token: ok");
