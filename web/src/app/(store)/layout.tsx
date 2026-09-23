import { StorefrontChrome } from "@/components/store/StorefrontChrome";
import { DemoBanner } from "@/components/store/DemoBanner";
import { isDemo } from "@/lib/env";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <StorefrontChrome />
      {isDemo() && <DemoBanner />}
      {children}
    </>
  );
}
