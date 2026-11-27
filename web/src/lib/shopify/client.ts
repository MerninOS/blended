import "server-only";
import { unstable_cache } from "next/cache";
import { env } from "@/lib/env";
import { CURRENT_KEY, createAdminTokenSource, type AdminToken } from "./admin-token";
import { isThrottled, waitFromCost, waitFromRetryAfter, withThrottleRetry, type QueryCost } from "./throttle";

/** Identity tag so scripts/validate-graphql.mjs can find and check every document. */
export const gql = String.raw;

export class ShopifyError extends Error {
  /** Set when Shopify refused the request for rate limiting: how long to wait before trying again. */
  retryAfterMs?: number;
  constructor(message: string, public details?: unknown, public status?: number) { super(message); }
}

const throttled = (message: string, details: unknown, retryAfterMs: number, status?: number) =>
  Object.assign(new ShopifyError(message, details, status), { retryAfterMs });

type FetchOpts = { variables?: Record<string, unknown>; tags?: string[]; revalidate?: number | false; cache?: RequestCache; buyerIp?: string | null };

async function post<T>(url: string, headers: Record<string, string>, query: string, o: FetchOpts): Promise<T> {
  const init: RequestInit & { next?: { tags?: string[]; revalidate?: number | false } } = {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...headers },
    body: JSON.stringify({ query, variables: o.variables ?? {} }),
  };
  if (o.tags || o.revalidate !== undefined) init.next = { tags: o.tags, revalidate: o.revalidate };
  else init.cache = o.cache ?? "no-store";
  const res = await fetch(url, init);
  if (res.status === 429) throw throttled("Shopify 429 Too Many Requests", await res.text().catch(() => null), waitFromRetryAfter(res.headers.get("retry-after")), 429);
  if (!res.ok) throw new ShopifyError(`Shopify ${res.status} ${res.statusText}`, await res.text().catch(() => null), res.status);
  const json = await res.json() as { data?: T; errors?: unknown; extensions?: { cost?: QueryCost } };
  if (json.errors) {
    const msg = Array.isArray(json.errors) ? json.errors.map((e: { message?: string }) => e.message).filter(Boolean).join("; ") : "";
    if (isThrottled(json.errors)) throw throttled(`Shopify GraphQL error${msg ? `: ${msg}` : ""}`, json.errors, waitFromCost(json.extensions?.cost));
    throw new ShopifyError(`Shopify GraphQL error${msg ? `: ${msg}` : ""}`, json.errors);
  }
  return json.data as T;
}

// ---------- Storefront API (private token, server only) ----------
export function storefront<T>(query: string, o: FetchOpts = {}) {
  if (!env.storeDomain || !env.storefrontToken) throw new ShopifyError("Storefront API not configured");
  const headers: Record<string, string> = { "Shopify-Storefront-Private-Token": env.storefrontToken };
  if (o.buyerIp) headers["Shopify-Storefront-Buyer-IP"] = o.buyerIp;
  return post<T>(`https://${env.storeDomain}/api/${env.apiVersion}/graphql.json`, headers, query, o);
}

// ---------- Admin API ----------
// Either a static token (legacy custom app) or Dev Dashboard app credentials
// exchanged with the client-credentials grant (tokens are short lived).
async function exchangeToken(): Promise<AdminToken> {
  if (!env.storeDomain || !env.adminClientId || !env.adminClientSecret) throw new ShopifyError("Admin API not configured");
  const res = await fetch(`https://${env.storeDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: env.adminClientId, client_secret: env.adminClientSecret }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const reason = body.match(/Oauth error ([a-z_]+)/i)?.[1] ?? body.match(/"error"\s*:\s*"([^"]+)"/)?.[1];
    throw new ShopifyError(`Admin token exchange failed (${res.status}${reason ? `: ${reason}` : ""})`, body);
  }
  const j = await res.json() as { access_token: string; expires_in?: number };
  return { token: j.access_token, exp: Date.now() + (j.expires_in ?? 3600) * 1000 };
}
// Every exchange goes through unstable_cache so it never makes Next abandon a
// background ISR regeneration (see admin-token.ts). The normal entry keeps its old
// key; 50 min is well inside the token's lifetime.
const exchangeCached = (key: string) =>
  unstable_cache(exchangeToken, key === CURRENT_KEY ? ["shopify-admin-token"] : ["shopify-admin-token", key], { revalidate: 3000 })();
const adminTokens = createAdminTokenSource({ exchange: exchangeCached, exchangeDirect: exchangeToken });
async function adminToken(rejected?: string): Promise<string> {
  if (env.adminToken) return env.adminToken;
  return adminTokens(rejected);
}

// A throttled request never ran, so it is retried after the wait Shopify's cost data
// gives (see throttle.ts). Webhook bursts (every inventory change runs a green sync)
// used to fail here with "Throttled" and leave Shopify's coffee counts stale.
const retryThrottled = <T>(attempt: () => Promise<T>) =>
  withThrottleRetry(attempt, (e) => (e instanceof ShopifyError ? e.retryAfterMs : null));

export async function admin<T>(query: string, o: FetchOpts = {}): Promise<T> {
  const url = `https://${env.storeDomain}/admin/api/${env.apiVersion}/graphql.json`;
  let used: string | undefined;
  try {
    return await retryThrottled(async () => post<T>(url, { "X-Shopify-Access-Token": (used = await adminToken()) }, query, o));
  } catch (e) {
    // A cached token can go stale before it expires: it keeps the scopes it was issued
    // with (new scopes → "access denied") and dies if the app is reinstalled (401).
    // Either way, get a fresh token and try once more.
    const stale = e instanceof ShopifyError && (e.status === 401 || /access denied/i.test(e.message));
    if (env.adminToken || !stale || !used) throw e;
    const token = await adminToken(used);
    return retryThrottled(() => post<T>(url, { "X-Shopify-Access-Token": token }, query, { ...o, cache: "no-store", tags: undefined, revalidate: undefined }));
  }
}

type UserError = { field?: string[] | null; message: string };
/** Throw when a mutation payload reports userErrors. */
export function assertNoUserErrors(payload: { userErrors?: UserError[] } | null | undefined, what: string) {
  const errs = payload?.userErrors ?? [];
  if (errs.length) throw new ShopifyError(`${what}: ${errs.map((e) => e.message).join("; ")}`, errs);
}

export const CACHE_TAGS = { catalog: "catalog", orders: "orders", settings: "settings" } as const;
