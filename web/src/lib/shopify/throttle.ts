// Shopify Admin API rate limits. Plain TypeScript with no imports, so
// scripts/check-shopify-throttle.mts can test it with plain node.
//
// Shopify meters the Admin GraphQL API with a leaky bucket of query-cost points.
// When a request costs more than the bucket holds, Shopify answers 200 with a
// THROTTLED error (or, for some limits, HTTP 429) and does not run the request.
// Nothing was read or written, so trying the same request again is safe, mutations
// included. The response says how many points are left and how fast they come
// back, which tells us how long to wait instead of guessing.

export type ThrottleStatus = { maximumAvailable?: number; currentlyAvailable?: number; restoreRate?: number };
export type QueryCost = { requestedQueryCost?: number; throttleStatus?: ThrottleStatus };
type GqlError = { message?: unknown; extensions?: { code?: unknown } };

/** Tries after the first one. Three is enough for a burst of webhooks to drain. */
export const MAX_RETRIES = 3;
export const MIN_WAIT_MS = 500;
/** Never sit in a function longer than this per try: past it, fail and let the caller retry. */
export const MAX_WAIT_MS = 10_000;
/** When Shopify gives no cost or Retry-After to go on. */
export const DEFAULT_WAIT_MS = 2_000;

const clamp = (ms: number) => Math.min(MAX_WAIT_MS, Math.max(MIN_WAIT_MS, Math.ceil(ms)));
const finite = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

/** True when a GraphQL `errors` array says the request was throttled. */
export function isThrottled(errors: unknown): boolean {
  if (!Array.isArray(errors)) return false;
  return errors.some((e: GqlError) =>
    e?.extensions?.code === "THROTTLED" || (typeof e?.message === "string" && /^throttled$/i.test(e.message.trim())));
}

/**
 * How long until the bucket holds enough points for the query that was refused:
 * (requested − available) ÷ restore rate, kept between MIN_WAIT_MS and MAX_WAIT_MS.
 */
export function waitFromCost(cost: QueryCost | null | undefined): number {
  const want = cost?.requestedQueryCost, have = cost?.throttleStatus?.currentlyAvailable, rate = cost?.throttleStatus?.restoreRate;
  if (!finite(want) || !finite(have) || !finite(rate) || rate <= 0) return DEFAULT_WAIT_MS;
  return clamp((Math.max(0, want - have) / rate) * 1000);
}

/** HTTP 429: Shopify's Retry-After header is in seconds. */
export function waitFromRetryAfter(header: string | null | undefined): number {
  const s = header == null || header.trim() === "" ? NaN : Number(header);
  return finite(s) && s >= 0 ? clamp(s * 1000) : DEFAULT_WAIT_MS;
}

const realSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Run `attempt`, and when it fails with a throttle (`waitOf` returns a wait in ms)
 * wait and run it again, up to `retries` more times. Any other error, or the last
 * throttle, is thrown unchanged. A little jitter keeps webhooks that were throttled
 * together from all coming back in the same instant.
 */
export async function withThrottleRetry<T>(
  attempt: () => Promise<T>,
  waitOf: (e: unknown) => number | null | undefined,
  o: { retries?: number; sleep?: (ms: number) => Promise<void>; random?: () => number } = {},
): Promise<T> {
  const retries = o.retries ?? MAX_RETRIES, sleep = o.sleep ?? realSleep, random = o.random ?? Math.random;
  for (let i = 0; ; i++) {
    try {
      return await attempt();
    } catch (e) {
      const wait = waitOf(e);
      if (wait == null || i >= retries) throw e;
      await sleep(wait + Math.floor(random() * 250));
    }
  }
}
