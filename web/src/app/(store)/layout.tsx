import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { StorefrontChrome } from "@/components/store/StorefrontChrome";
import { StoreFooter } from "@/components/store/StoreFooter";
import { DemoBanner } from "@/components/store/DemoBanner";
import { Tracking } from "@/components/tracking/Tracking";
import { env, isDemo } from "@/lib/env";
import { getShopInfo, getTrackingConfig } from "@/lib/shop";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const [shop, tracking] = await Promise.all([getShopInfo(), getTrackingConfig()]);
  const privacy = shop.policies.find((p) => /privacy/.test(p.handle));
  return (
    <>
      <StorefrontChrome />
      {isDemo() && <DemoBanner />}
      {children}
      <StoreFooter policies={shop.policies} newsletter={!!(env.klaviyoPublicKey && env.klaviyoListId)} />
      <Tracking config={tracking} privacyHref={privacy ? `/policies/${privacy.handle}` : null} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
