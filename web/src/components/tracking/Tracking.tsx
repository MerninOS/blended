"use client";
// Mounted once in the storefront layout: consent banner, Shopify analytics
// cookies + page views, the Shopify Customer Privacy API (so checkout honours
// the same choice), and Klaviyo's onsite script.
import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useShopifyCookies } from "@shopify/hydrogen-react";
import type { TrackingConfig } from "@/lib/shop";
import { Btn } from "@/components/ui/primitives";
import { configureTracking, trackPageView, type PageType } from "./analytics";
import { consentStore, useConsent, usePrefsOpen, type Consent } from "./consent";

const PRIVACY_API = "https://cdn.shopify.com/shopifycloud/consent-tracking-api/v0.1/consent-tracking-api.js";

type PrivacyApi = { setTrackingConsent: (c: Record<string, unknown>, cb: (r?: { error?: string }) => void) => void };
declare global { interface Window { Shopify?: { customerPrivacy?: PrivacyApi } } }

const pageTypeOf = (path: string): PageType =>
  path === "/" ? "index" : path.startsWith("/coffees/") ? "product" : path.startsWith("/policies/") ? "policy" : "page";

export function Tracking({ config, privacyHref }: { config: TrackingConfig; privacyHref: string | null }) {
  const consent = useConsent();
  const prefsOpen = usePrefsOpen();
  const path = usePathname();
  const analytics = !!consent?.analytics;
  const cookiesReady = useShopifyCookies({ hasUserConsent: analytics, checkoutDomain: config.checkoutDomain ?? undefined });

  configureTracking(config, consent);

  // Page views (client-side navigations included).
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    if (!cookiesReady || !analytics || lastPath.current === path) return;
    lastPath.current = path;
    trackPageView(pageTypeOf(path));
  }, [path, cookiesReady, analytics]);

  // Share the choice with Shopify so checkout (a different domain) respects it.
  const synced = useRef<string | null>(null);
  useEffect(() => {
    if (!consent || !config.storefrontToken) return;
    const key = `${+consent.analytics}${+consent.marketing}`;
    if (synced.current === key) return;
    const send = () => {
      const api = window.Shopify?.customerPrivacy;
      if (!api) return false;
      synced.current = key;
      try {
        api.setTrackingConsent({
          analytics: consent.analytics, marketing: consent.marketing, preferences: consent.analytics, sale_of_data: consent.marketing,
          headlessStorefront: true, checkoutRootDomain: config.checkoutDomain ?? undefined,
          storefrontRootDomain: location.hostname, storefrontAccessToken: config.storefrontToken,
        }, () => {});
      } catch { /* never block the page on consent sync */ }
      return true;
    };
    if (send()) return;
    const t = setInterval(() => { if (send()) clearInterval(t); }, 500);
    return () => clearInterval(t);
  }, [consent, config.storefrontToken, config.checkoutDomain]);

  const showBanner = consent === null || prefsOpen;
  return (
    <>
      {config.storefrontToken && consent && <Script src={PRIVACY_API} strategy="afterInteractive" />}
      {config.klaviyoKey && consent?.marketing && (
        <Script src={`https://static.klaviyo.com/onsite/js/${encodeURIComponent(config.klaviyoKey)}/klaviyo.js?company_id=${encodeURIComponent(config.klaviyoKey)}`} strategy="afterInteractive" />
      )}
      {showBanner && <ConsentBanner current={consent ?? null} privacyHref={privacyHref} />}
    </>
  );
}

function ConsentBanner({ current, privacyHref }: { current: Consent | null; privacyHref: string | null }) {
  const choose = (c: Consent) => consentStore.set(c);
  return (
    <div role="dialog" aria-live="polite" aria-label="Cookie preferences" className="consent-banner"
      style={{ position: "fixed", left: 16, bottom: 16, zIndex: 950, width: "min(420px, calc(100vw - 32px))", background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-pop)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.55, color: "var(--ink)" }}>
        We use cookies to see how the shop is used and to send you relevant offers. Your cart works either way.
        {privacyHref && <> <Link href={privacyHref} style={{ color: "var(--ink)", textDecoration: "underline" }}>Privacy policy</Link></>}
      </p>
      {current && <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-muted)" }}>Now: analytics {current.analytics ? "on" : "off"} · marketing {current.marketing ? "on" : "off"}</p>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Btn size="sm" variant="primary" onClick={() => choose({ analytics: true, marketing: true })}>Accept all</Btn>
        <Btn size="sm" variant="outline" onClick={() => choose({ analytics: true, marketing: false })}>Analytics only</Btn>
        <Btn size="sm" variant="ghost" onClick={() => choose({ analytics: false, marketing: false })}>Decline</Btn>
      </div>
    </div>
  );
}
