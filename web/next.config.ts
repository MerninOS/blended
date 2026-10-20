import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }, { protocol: "https", hostname: "cdn.sanity.io" }],
    // AVIF where the browser takes it (smaller than WebP for these photos), WebP otherwise.
    formats: ["image/avif", "image/webp"],
    // Shopify (?v=…) and Sanity (content-hashed) URLs change whenever the image does, so an
    // optimized copy can be kept for a month instead of being re-made every few hours.
    minimumCacheTTL: 2678400,
  },
  // The 3D bag model (~240 KB): cache it for a day and serve a stale copy while
  // revalidating for a week, so return visits open the lab without the download.
  async headers() {
    return [{ source: "/models/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] }];
  },
};

export default withBotId(nextConfig);
