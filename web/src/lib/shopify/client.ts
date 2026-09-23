import "server-only";
import { env } from "@/lib/env";

/** Identity tag so scripts/validate-graphql.mjs can find and check every document. */
export const gql = String.raw;

export class ShopifyError extends Error {
  constructor(message: string, public details?: unknown) { super(message); }
}

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
  if (!res.ok) throw new ShopifyError(`Shopify ${res.status} ${res.statusText}`, await res.text().catch(() => null));
  const json = await res.json() as { data?: T; errors?: unknown };
  if (json.errors) {
    const msg = Array.isArray(json.errors) ? json.errors.map((e: { message?: string }) => e.message).filter(Boolean).join("; ") : "";
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
let cached: { token: string; exp: number } | null = null;
async function adminToken(): Promise<string> {
  if (env.adminToken) return env.adminToken;
  if (!env.storeDomain || !env.adminClientId || !env.adminClientSecret) throw new ShopifyError("Admin API not configured");
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
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
  cached = { token: j.access_token, exp: Date.now() + (j.expires_in ?? 3600) * 1000 };
  return cached.token;
}

export async function admin<T>(query: string, o: FetchOpts = {}): Promise<T> {
  const url = `https://${env.storeDomain}/admin/api/${env.apiVersion}/graphql.json`;
  try {
    return await post<T>(url, { "X-Shopify-Access-Token": await adminToken() }, query, o);
  } catch (e) {
    // A token issued before new scopes were approved keeps the old scopes until it
    // expires (up to 24 h). On "access denied", get a fresh token and try once more.
    if (env.adminToken || !(e instanceof ShopifyError) || !/access denied/i.test(e.message)) throw e;
    cached = null;
    return post<T>(url, { "X-Shopify-Access-Token": await adminToken() }, query, { ...o, cache: "no-store", tags: undefined, revalidate: undefined });
  }
}

type UserError = { field?: string[] | null; message: string };
/** Throw when a mutation payload reports userErrors. */
export function assertNoUserErrors(payload: { userErrors?: UserError[] } | null | undefined, what: string) {
  const errs = payload?.userErrors ?? [];
  if (errs.length) throw new ShopifyError(`${what}: ${errs.map((e) => e.message).join("; ")}`, errs);
}

export const CACHE_TAGS = { catalog: "catalog", orders: "orders", settings: "settings" } as const;
