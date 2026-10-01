import type { MetadataRoute } from "next";
import { getStockCoffees } from "@/lib/catalog";
import { getShopInfo } from "@/lib/shop";
import { getMerch } from "@/lib/merch";
import { COLLECTION_PATH } from "@/lib/merch-types";
import { abs, absImg } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stock, shop, merch] = await Promise.all([getStockCoffees().catch(() => []), getShopInfo(), getMerch().catch(() => [])]);
  return [
    { url: abs("/"), changeFrequency: "daily", priority: 1 },
    { url: abs("/coffees"), changeFrequency: "daily", priority: 0.9 },
    { url: abs("/lab"), changeFrequency: "daily", priority: 0.9 },
    { url: abs("/wholesale"), changeFrequency: "weekly", priority: 0.6 },
    ...stock.map((c) => ({ url: abs(`/coffees/${c.id}`), changeFrequency: "weekly" as const, priority: 0.8, ...(c.image ? { images: [absImg(c.image)!] } : {}) })),
    ...Object.values(COLLECTION_PATH).map((p) => ({ url: abs(p), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...merch.map((p) => ({ url: abs(`/products/${p.handle}`), changeFrequency: "weekly" as const, priority: 0.6, ...(p.images.length ? { images: [p.images[0].url] } : {}) })),
    ...shop.policies.map((p) => ({ url: abs(`/policies/${p.handle}`), changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
