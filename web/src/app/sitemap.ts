import type { MetadataRoute } from "next";
import { getStockCoffees } from "@/lib/catalog";
import { getShopInfo } from "@/lib/shop";
import { abs, absImg } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stock, shop] = await Promise.all([getStockCoffees().catch(() => []), getShopInfo()]);
  return [
    { url: abs("/"), changeFrequency: "daily", priority: 1 },
    { url: abs("/lab"), changeFrequency: "daily", priority: 0.9 },
    { url: abs("/wholesale"), changeFrequency: "weekly", priority: 0.6 },
    ...stock.map((c) => ({ url: abs(`/coffees/${c.id}`), changeFrequency: "weekly" as const, priority: 0.8, ...(c.image ? { images: [absImg(c.image)!] } : {}) })),
    ...shop.policies.map((p) => ({ url: abs(`/policies/${p.handle}`), changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
