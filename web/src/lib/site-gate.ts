// Coming soon gate: while SITE_PASSWORD is set, every page is answered with
// /coming-soon until the visitor enters that password, which leaves a signed
// cookie. Shared by proxy.ts (which can't import server-only modules) and the
// unlock route, so it reads process.env directly.
import { sign, verify } from "@/lib/crypto";

export const GATE_COOKIE = "blended_preview";
export const GATE_TTL_S = 60 * 60 * 24 * 30; // 30 days

const sitePassword = () => process.env.SITE_PASSWORD?.trim() || "";
const secret = () => process.env.SESSION_SECRET?.trim() || (process.env.NODE_ENV !== "production" ? "dev-only-insecure-session-secret-change-me" : "");

/** The site is behind the coming soon page. */
export const gateOn = () => !!sitePassword();

// Vercel BotID's challenge script and endpoints (rewritten to Vercel by withBotId in next.config.ts).
const BOTID = "/149e9513-01fa-4fb0-aad4-566afd725d1b/";

/** Paths that stay reachable while the gate is on: the page itself, APIs (webhooks, signups), the store policies (the consent banner and SMS terms link to them), Sanity Studio and the admin (it has its own login). */
export function gateExempt(path: string) {
  return path === "/coming-soon" || path.startsWith("/api/") || path.startsWith("/policies/") || path.startsWith("/admin") || path.startsWith("/studio") || path.startsWith(BOTID)
    || path === "/robots.txt" || path === "/sitemap.xml" || path.startsWith("/opengraph-image") || path === "/favicon.ico";
}

export async function hasPass(token: string | undefined): Promise<boolean> {
  const s = secret();
  if (!s) return false;
  const v = await verify(token, s);
  return !!v && v.startsWith("preview:") && Number(v.slice(8)) > Date.now();
}

/** Constant-time check of the entered password; returns the cookie value to set, or null. */
export async function passFor(password: string): Promise<string | null> {
  const expected = sitePassword(), s = secret();
  if (!expected || !s) return null;
  const a = new TextEncoder().encode(password), b = new TextEncoder().encode(expected);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  if (diff !== 0) return null;
  return sign(`preview:${Date.now() + GATE_TTL_S * 1000}`, s);
}
