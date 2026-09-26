// Consent banner, Shopify/Klaviyo tracking and Vercel analytics, shared by the
// storefront and landing layouts.
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getShopInfo, getTrackingConfig } from "@/lib/shop";
import { Tracking } from "./Tracking";

export async function SiteServices() {
  const [shop, tracking] = await Promise.all([getShopInfo(), getTrackingConfig()]);
  const privacy = shop.policies.find((p) => /privacy/.test(p.handle));
  return (
    <>
      <Tracking config={tracking} privacyHref={privacy ? `/policies/${privacy.handle}` : null} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
