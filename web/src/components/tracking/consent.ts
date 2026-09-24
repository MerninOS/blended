"use client";
// Visitor consent for analytics and marketing, kept in a first-party cookie so
// the choice survives across visits. Shopify analytics waits for `analytics`;
// Klaviyo (and future ad pixels) wait for `marketing`. Vercel Web Analytics is
// cookieless and runs regardless.
import { useSyncExternalStore } from "react";

export interface Consent { analytics: boolean; marketing: boolean }
const COOKIE = "blended_consent";

let current: Consent | null | undefined; // undefined = not read yet
let prefsOpen = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

function read(): Consent | null {
  const m = document.cookie.match(/(?:^|;\s*)blended_consent=([^;]+)/);
  if (!m) return null;
  const v = decodeURIComponent(m[1]);
  return { analytics: /a1/.test(v), marketing: /m1/.test(v) };
}

export const consentStore = {
  get: (): Consent | null => {
    if (current === undefined && typeof document !== "undefined") current = read();
    return current ?? null;
  },
  set(c: Consent) {
    current = c; prefsOpen = false;
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE}=${encodeURIComponent(`a${+c.analytics}.m${+c.marketing}`)}; Max-Age=${60 * 60 * 24 * 365}; Path=/; SameSite=Lax${secure}`;
    emit();
  },
  /** Re-open the banner (footer "Cookie preferences"). */
  openPrefs() { prefsOpen = true; emit(); },
  prefsOpen: () => prefsOpen,
  subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
};

/** null until the visitor has chosen; `undefined` during server render. */
export function useConsent() {
  return useSyncExternalStore(consentStore.subscribe, consentStore.get, () => undefined);
}
export function usePrefsOpen() {
  return useSyncExternalStore(consentStore.subscribe, consentStore.prefsOpen, () => false);
}
