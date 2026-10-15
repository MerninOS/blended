import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ComingSoon } from "@/components/coming-soon/ComingSoon";
import { Tracking } from "@/components/tracking/Tracking";
import { comingSoonMedia } from "@/lib/landing";
import { getShopInfo, getTrackingConfig } from "@/lib/shop";
import { gateOn } from "@/lib/site-gate";
import "./coming-soon.css";

// While SITE_PASSWORD is set, proxy.ts answers every page with this one (see lib/site-gate.ts).
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Blended · Soon" },
  description: "We've been working on something. Leave your email and you'll hear first.",
};

export default async function ComingSoonPage() {
  const [shop, tracking] = await Promise.all([getShopInfo(), getTrackingConfig()]);
  const privacy = shop.policies.find((p) => /privacy/.test(p.handle));
  const { image, video } = comingSoonMedia();
  return (
    <>
      <ComingSoon image={image} video={video} gated={gateOn()} />
      <Tracking config={tracking} privacyHref={privacy ? `/policies/${privacy.handle}` : null} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
