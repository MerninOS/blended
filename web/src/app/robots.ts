import type { MetadataRoute } from "next";
import { abs } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Keep preview deployments out of search results.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/account/", "/studio"] }],
    sitemap: abs("/sitemap.xml"),
  };
}
