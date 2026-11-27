// Choosing the Shopify Admin token. Plain TypeScript with no imports, so
// scripts/check-shopify-admin-token.mts can test it with plain node.
//
// The client-credentials token comes from a no-store POST. If that POST runs
// while Next is regenerating a cached page in the background (ISR), Next drops
// the regeneration ("Page changed from static to dynamic at runtime") and the
// page keeps its old HTML. Vercel logged this on /, /coffees, /coffees/[handle],
// /lab and /farms. A fetch inside unstable_cache does not count against the page,
// so every exchange goes through a cache entry (`exchange(key)` below), including
// the one that replaces a token that has expired or that Shopify refused.
//
// A cache entry can hand back a token that is too old to use: unstable_cache
// serves the stale value while it refreshes in the background, and that refresh
// can fail. When that happens we ask a second entry, keyed by a digest of the
// stale token. That entry is new, so its first read runs the exchange. Every
// server instance that holds the same stale token lands on the same entry, so
// they share one new token instead of each making its own.

export type AdminToken = { token: string; exp: number };

/** A token closer than this to expiring is not used. */
export const EXPIRY_MARGIN_MS = 60_000;
/** Cache key for the normal, shared token. */
export const CURRENT_KEY = "current";
/** Most replacement entries to follow before falling back to a direct exchange. */
export const MAX_REPLACEMENTS = 3;

export const usable = (t: AdminToken | null | undefined, now: number): t is AdminToken =>
  !!t && typeof t.token === "string" && t.token.length > 0 && Number.isFinite(t.exp) && t.exp > now + EXPIRY_MARGIN_MS;

/**
 * Cache key for the entry that replaces `token`. Built from a SHA-256 digest, so
 * the token itself never appears in a cache key, a log line or an error message.
 */
export async function replacementKey(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const hex = Array.from(new Uint8Array(digest).slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
  return `replaces:${hex}`;
}

type Deps = {
  /** Exchange through the cache entry named `key`: an existing entry returns its token, a missing one runs the exchange. */
  exchange: (key: string) => Promise<AdminToken>;
  /** Uncached exchange. Used only if a chain of replacement entries still hasn't produced a token we can use. */
  exchangeDirect: () => Promise<AdminToken>;
  now?: () => number;
};

/**
 * Returns `get(rejected?)`. `get()` returns a token that has more than a minute left.
 * `get(token)` returns a different token, for when Shopify has just refused `token`.
 */
export function createAdminTokenSource({ exchange, exchangeDirect, now = Date.now }: Deps) {
  let memo: AdminToken | null = null;
  return async function get(rejected?: string): Promise<string> {
    if (!rejected && usable(memo, now())) return memo.token;
    const ok = (t: AdminToken) => usable(t, now()) && t.token !== rejected;
    let t = await exchange(rejected ? await replacementKey(rejected) : CURRENT_KEY);
    for (let i = 0; i < MAX_REPLACEMENTS && !ok(t); i++) t = await exchange(await replacementKey(t.token));
    if (!ok(t)) t = await exchangeDirect();
    memo = t;
    return t.token;
  };
}
