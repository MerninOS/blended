import { StorefrontChrome } from "@/components/store/StorefrontChrome";
import { StoreFooter } from "@/components/store/StoreFooter";
import { DemoBanner } from "@/components/store/DemoBanner";
import { SiteServices } from "@/components/tracking/SiteServices";
import { env, isDemo } from "@/lib/env";
import { getShopInfo } from "@/lib/shop";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const shop = await getShopInfo();
  return (
    <>
      <StorefrontChrome />
      {isDemo() && <DemoBanner />}
      {children}
      <StoreFooter policies={shop.policies} newsletter={!!(env.klaviyoPublicKey && env.klaviyoListId)} />
      <SiteServices />
    </>
  );
}
