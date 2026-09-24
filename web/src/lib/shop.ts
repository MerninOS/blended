import "server-only";
// Shop-level facts for the storefront: IDs analytics needs, the checkout domain
// consent is shared with, and the legal policies written in Shopify admin.
import { unstable_cache } from "next/cache";
import { env, hasStorefront } from "@/lib/env";
import { CACHE_TAGS, gql, storefront } from "@/lib/shopify/client";

export interface ShopPolicy { handle: string; title: string; body: string }
export interface ShopInfo { id: string | null; name: string; checkoutDomain: string | null; policies: ShopPolicy[] }

const SHOP = gql`
  # storefront
  query ShopInfo {
    shop {
      id
      name
      primaryDomain { host }
      privacyPolicy { handle title body }
      termsOfService { handle title body }
      refundPolicy { handle title body }
      shippingPolicy { handle title body }
      contactInformation { handle title body }
    }
  }
`;
type P = ShopPolicy | null;
type ShopRes = { shop: { id: string; name: string; primaryDomain: { host: string }; privacyPolicy: P; termsOfService: P; refundPolicy: P; shippingPolicy: P; contactInformation: P } };

const EMPTY: ShopInfo = { id: null, name: "Blended", checkoutDomain: null, policies: [] };

export const getShopInfo = unstable_cache(async (): Promise<ShopInfo> => {
  if (!hasStorefront()) return EMPTY;
  try {
    const { shop } = await storefront<ShopRes>(SHOP);
    const policies = [shop.privacyPolicy, shop.termsOfService, shop.refundPolicy, shop.shippingPolicy, shop.contactInformation]
      .filter((x): x is ShopPolicy => !!x && !!x.body.trim());
    return { id: shop.id, name: shop.name, checkoutDomain: shop.primaryDomain.host, policies };
  } catch (e) {
    console.error("[shop] info unavailable:", e instanceof Error ? e.message : e);
    return EMPTY;
  }
}, ["blended-shop-info"], { tags: [CACHE_TAGS.catalog], revalidate: 3600 });

/** What the browser needs to send analytics and sync consent. Only public values. */
export interface TrackingConfig {
  shopId: string | null;
  currency: string;
  storefrontId: string | null;
  storefrontToken: string | null;
  storeDomain: string | null;
  checkoutDomain: string | null;
  klaviyoKey: string | null;
}

export async function getTrackingConfig(): Promise<TrackingConfig> {
  const shop = await getShopInfo();
  return {
    shopId: shop.id,
    currency: env.currency,
    storefrontId: env.storefrontId ?? null,
    storefrontToken: env.storefrontPublicToken ?? null,
    storeDomain: env.storeDomain ?? null,
    checkoutDomain: shop.checkoutDomain,
    klaviyoKey: env.klaviyoPublicKey ?? null,
  };
}
