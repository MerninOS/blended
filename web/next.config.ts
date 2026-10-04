import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }],
  },
  // The 3D bag model (~3 MB): cache it for a day and serve a stale copy while
  // revalidating for a week, so return visits open the lab without the download.
  async headers() {
    return [{ source: "/models/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] }];
  },
};

export default withBotId(nextConfig);
