import "server-only";
// Shopify Customer Account API (headless): OAuth 2.0 + PKCE sign-in for
// wholesale accounts. The session lives in an encrypted, httpOnly cookie.
import { cookies } from "next/headers";
import { env, hasCustomerAccounts, isDemo, sessionSecret } from "@/lib/env";
import { randomString, seal, sha256b64u, unseal } from "@/lib/crypto";
import { gql } from "@/lib/shopify/client";

export const SESSION_COOKIE = "blended_customer";
const FLOW_COOKIE = "blended_oauth";
const SCOPES = "openid email customer-account-api:full";

export interface CustomerSession {
  customerId: string;
  email: string;
  name: string;
  company: string;
  wholesale: boolean;
  address: { company: string; contact: string; phone: string; line1: string; line2: string; city: string; state: string; zip: string } | null;
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number;
}

type Discovery = { authorization_endpoint: string; token_endpoint: string; end_session_endpoint?: string; graphql_api: string };
let discovery: Discovery | null = null;
async function discover(): Promise<Discovery> {
  if (discovery) return discovery;
  const base = `https://${env.storeDomain}`;
  const [oidc, api] = await Promise.all([
    fetch(`${base}/.well-known/openid-configuration`, { cache: "force-cache" }).then((r) => r.json()),
    fetch(`${base}/.well-known/customer-account-api`, { cache: "force-cache" }).then((r) => r.json()),
  ]);
  discovery = { authorization_endpoint: oidc.authorization_endpoint, token_endpoint: oidc.token_endpoint, end_session_endpoint: oidc.end_session_endpoint, graphql_api: api.graphql_api };
  return discovery;
}

const redirectUri = () => `${env.appUrl}/account/callback`;
const cookieOpts = { httpOnly: true, secure: env.isProd, sameSite: "lax" as const, path: "/" };

export async function beginLogin(returnTo: string): Promise<string> {
  if (!hasCustomerAccounts()) throw new Error("Customer accounts are not configured");
  const d = await discover();
  const state = randomString(16), nonce = randomString(16), verifier = randomString(48);
  (await cookies()).set(FLOW_COOKIE, await seal({ state, nonce, verifier, returnTo }, sessionSecret()), { ...cookieOpts, maxAge: 600 });
  const u = new URL(d.authorization_endpoint);
  u.search = new URLSearchParams({
    scope: SCOPES, client_id: env.customerClientId!, response_type: "code", redirect_uri: redirectUri(),
    state, nonce, code_challenge: await sha256b64u(verifier), code_challenge_method: "S256",
  }).toString();
  return u.toString();
}

async function tokenRequest(body: Record<string, string>) {
  const d = await discover();
  const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
  if (env.customerClientSecret) headers.Authorization = "Basic " + btoa(`${env.customerClientId}:${env.customerClientSecret}`);
  const res = await fetch(d.token_endpoint, { method: "POST", headers, body: new URLSearchParams({ client_id: env.customerClientId!, ...body }), cache: "no-store" });
  if (!res.ok) throw new Error(`Customer token request failed (${res.status})`);
  return await res.json() as { access_token: string; refresh_token: string; id_token?: string; expires_in: number };
}

const ME = gql`
  query WholesaleMe {
    customer {
      id
      displayName
      firstName
      lastName
      tags
      emailAddress { emailAddress }
      defaultAddress { company firstName lastName address1 address2 city zoneCode zip phoneNumber }
    }
  }
`;
type MeRes = { customer: { id: string; displayName: string; firstName: string | null; lastName: string | null; tags: string[]; emailAddress: { emailAddress: string } | null;
  defaultAddress: { company: string | null; firstName: string | null; lastName: string | null; address1: string | null; address2: string | null; city: string | null; zoneCode: string | null; zip: string | null; phoneNumber: string | null } | null } };

async function fetchMe(accessToken: string) {
  const d = await discover();
  const res = await fetch(d.graphql_api, { method: "POST", headers: { "Content-Type": "application/json", Authorization: accessToken }, body: JSON.stringify({ query: ME }), cache: "no-store" });
  const j = await res.json() as { data?: MeRes; errors?: unknown };
  if (!j.data) throw new Error("Customer Account API error");
  return j.data.customer;
}

export async function completeLogin(code: string, state: string): Promise<string> {
  const jar = await cookies();
  const flow = await unseal<{ state: string; verifier: string; returnTo: string }>(jar.get(FLOW_COOKIE)?.value, sessionSecret());
  jar.delete(FLOW_COOKIE);
  if (!flow || flow.state !== state) throw new Error("Sign-in expired. Try again.");
  const t = await tokenRequest({ grant_type: "authorization_code", redirect_uri: redirectUri(), code, code_verifier: flow.verifier });
  const c = await fetchMe(t.access_token);
  const a = c.defaultAddress;
  const session: CustomerSession = {
    customerId: c.id,
    email: c.emailAddress?.emailAddress ?? "",
    name: c.displayName,
    company: a?.company || c.displayName,
    wholesale: c.tags.map((x) => x.toLowerCase()).includes(env.wholesaleTag.toLowerCase()),
    address: a ? { company: a.company || "", contact: [a.firstName, a.lastName].filter(Boolean).join(" ") || c.displayName, phone: a.phoneNumber || "",
      line1: a.address1 || "", line2: a.address2 || "", city: a.city || "", state: a.zoneCode || "", zip: a.zip || "" } : null,
    accessToken: t.access_token, refreshToken: t.refresh_token, idToken: t.id_token ?? "",
    expiresAt: Date.now() + t.expires_in * 1000,
  };
  jar.set(SESSION_COOKIE, await seal(session, sessionSecret()), { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 });
  return flow.returnTo || "/wholesale";
}

/** Demo mode signs in as the design's sample account without leaving the app. */
const DEMO_SESSION: CustomerSession = {
  customerId: "gid://shopify/Customer/demo", email: "dana@harekrishna.coffee", name: "Dana Reyes", company: "Hare Krishna Coffee", wholesale: true,
  address: { company: "Hare Krishna Coffee", contact: "Dana Reyes", phone: "(503) 555-0142", line1: "1140 Foundry St", line2: "Unit 4", city: "Portland", state: "OR", zip: "97214" },
  accessToken: "", refreshToken: "", idToken: "", expiresAt: Number.MAX_SAFE_INTEGER,
};

export async function getCustomer(): Promise<CustomerSession | null> {
  if (isDemo() && !hasCustomerAccounts()) return DEMO_SESSION;
  const jar = await cookies();
  const s = await unseal<CustomerSession>(jar.get(SESSION_COOKIE)?.value, sessionSecret());
  if (!s) return null;
  if (s.expiresAt > Date.now() + 30_000) return s;
  // refresh an expired access token; cookie writes only succeed in actions/route handlers
  try {
    const t = await tokenRequest({ grant_type: "refresh_token", refresh_token: s.refreshToken });
    const next = { ...s, accessToken: t.access_token, refreshToken: t.refresh_token || s.refreshToken, expiresAt: Date.now() + t.expires_in * 1000 };
    try { jar.set(SESSION_COOKIE, await seal(next, sessionSecret()), { ...cookieOpts, maxAge: 60 * 60 * 24 * 30 }); } catch { /* read-only context */ }
    return next;
  } catch { return s; } // identity is still valid for display; order routes re-verify with the Admin API
}

export async function logoutUrl(): Promise<string> {
  const jar = await cookies();
  const s = await unseal<CustomerSession>(jar.get(SESSION_COOKIE)?.value, sessionSecret());
  jar.delete(SESSION_COOKIE);
  if (!s || !hasCustomerAccounts()) return "/wholesale";
  const d = await discover();
  if (!d.end_session_endpoint || !s.idToken) return "/wholesale";
  const u = new URL(d.end_session_endpoint);
  u.search = new URLSearchParams({ id_token_hint: s.idToken, post_logout_redirect_uri: `${env.appUrl}/wholesale` }).toString();
  return u.toString();
}
