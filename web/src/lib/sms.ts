import "server-only";
// SMS members: visitors who verify their number with a texted code unlock the
// Coffee Lab's Exclusive lots. The code goes out through Klaviyo: the number is
// subscribed to the SMS list (with the consent the visitor ticked), then an event
// carrying the code triggers a Klaviyo SMS flow that texts it. The pending code
// and the member flag live in sealed, httpOnly cookies, so there's no database.
import { cookies } from "next/headers";
import { env, sessionSecret } from "@/lib/env";
import { seal, sha256b64u, unseal } from "@/lib/crypto";
import { getSettings } from "@/lib/settings";

export const MEMBER_COOKIE = "blended_sms";
export const PENDING_COOKIE = "blended_sms_code";
export const CODE_TTL_S = 10 * 60;
export const MAX_TRIES = 5;
export const cookieOpts = { httpOnly: true, secure: env.isProd, sameSite: "lax" as const, path: "/" };

export interface Pending { phone: string; hash: string; exp: number; tries: number }
export interface Member { phone: string; at: number }

export class SmsError extends Error {}

/** US mobile number → E.164 (+1XXXXXXXXXX), or null. */
export function toE164(raw: unknown): string | null {
  const d = String(raw ?? "").replace(/\D/g, "");
  const n = d.length === 11 && d[0] === "1" ? d.slice(1) : d;
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(n) ? `+1${n}` : null;
}
export const maskPhone = (e164: string) => `•••-${e164.slice(-4)}`;
export const newCode = () => String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
export const codeHash = (phone: string, code: string) => sha256b64u(`${phone}:${code}:${sessionSecret()}`);

export const sealPending = (p: Pending) => seal(p, sessionSecret());
export const readPending = (token: string | undefined) => unseal<Pending>(token, sessionSecret());
export const sealMember = (m: Member) => seal(m, sessionSecret());

export async function readMember(): Promise<Member | null> {
  return unseal<Member>((await cookies()).get(MEMBER_COOKIE)?.value, sessionSecret());
}
/** Exclusives are switched on and this visitor has verified their number. */
export async function isMember(): Promise<boolean> {
  if (!(await getSettings()).smsExclusives) return false;
  return !!(await readMember());
}

const REVISION = "2025-01-15";
const JSON_API = { "Content-Type": "application/vnd.api+json", Accept: "application/vnd.api+json", revision: REVISION };

async function klaviyo(url: string, init: RequestInit, what: string) {
  const res = await fetch(url, { ...init, cache: "no-store" }).catch(() => null);
  if (!res || !res.ok) {
    console.error(`[sms] Klaviyo ${what}`, res?.status, await res?.text().catch(() => ""));
    throw new SmsError("Couldn't text you right now. Try again in a minute.");
  }
}

/**
 * Subscribe the number to the SMS list, then send the event the Klaviyo flow texts the code from.
 * Without a private key (local dev) the code is only logged; production refuses.
 */
export async function sendCode(phone: string, code: string): Promise<"sent" | "logged"> {
  if (!env.klaviyoPrivateKey) {
    if (env.isProd) throw new SmsError("Texts aren't set up yet. Check back soon.");
    console.info(`[sms] KLAVIYO_PRIVATE_KEY not set — code for ${phone}: ${code}`);
    return "logged";
  }
  await klaviyo(`https://a.klaviyo.com/client/subscriptions/?company_id=${encodeURIComponent(env.klaviyoPublicKey)}`, {
    method: "POST", headers: JSON_API,
    body: JSON.stringify({
      data: {
        type: "subscription",
        attributes: {
          custom_source: "Blended Coffee Lab exclusives",
          profile: { data: { type: "profile", attributes: { phone_number: phone, subscriptions: { sms: { marketing: { consent: "SUBSCRIBED" } } } } } },
        },
        relationships: { list: { data: { type: "list", id: env.klaviyoSmsListId } } },
      },
    }),
  }, "subscribe");
  await klaviyo("https://a.klaviyo.com/api/events", {
    method: "POST", headers: { ...JSON_API, Authorization: `Klaviyo-API-Key ${env.klaviyoPrivateKey}` },
    body: JSON.stringify({
      data: {
        type: "event",
        attributes: {
          properties: { code, source: "Coffee Lab" },
          metric: { data: { type: "metric", attributes: { name: env.klaviyoCodeMetric } } },
          profile: { data: { type: "profile", attributes: { phone_number: phone } } },
          unique_id: `${phone}:${Date.now()}`,
        },
      },
    }),
  }, "code event");
  return "sent";
}
