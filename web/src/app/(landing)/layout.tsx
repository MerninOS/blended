import { SiteServices } from "@/components/tracking/SiteServices";
import "./landing.css";

export default function LandingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {children}
      <SiteServices />
    </>
  );
}
