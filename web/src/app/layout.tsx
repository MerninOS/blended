import type { Metadata, Viewport } from "next";
import { env } from "@/lib/env";
import { fontVars } from "./fonts";
import "./globals.css";

const description = "Build your own coffee blend from single-origin green lots, or pick one of ours. Whole bean, roasted to order.";
export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: { default: "Blended · Coffee Lab", template: "%s · Blended" },
  description,
  applicationName: "Blended",
  icons: { icon: "/brand/icon.svg", apple: "/brand/blended-mark.png" },
  openGraph: { type: "website", siteName: "Blended", title: "Blended · Coffee Lab", description, locale: "en_US" },
  twitter: { card: "summary_large_image", title: "Blended · Coffee Lab", description },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-product="coroasted-coffee-os" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
