import { StorefrontChrome } from "@/components/store/StorefrontChrome";
import { StoreFooter } from "@/components/store/StoreFooter";
import { DemoBanner } from "@/components/store/DemoBanner";
import { SiteServices } from "@/components/tracking/SiteServices";
import { env, isDemo } from "@/lib/env";
import { getShopInfo } from "@/lib/shop";
import { getSettings } from "@/lib/settings";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const [shop, settings] = await Promise.all([getShopInfo(), getSettings()]);
  return (
    <>
      <StorefrontChrome exclusives={settings.smsExclusives} />
      {isDemo() && <DemoBanner />}
      {children}
      <StoreFooter policies={shop.policies} newsletter={!!(env.klaviyoPublicKey && env.klaviyoListId)} />
      <SiteServices />
    </>
  );
}
