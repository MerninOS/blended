import type { Metadata, Viewport } from "next";
import { fontVars } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Blended · Coffee Lab", template: "%s · Blended" },
  description: "Create your coffee blend. Whole bean, roasted to order.",
  icons: { icon: "/brand/icon.svg" },
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
