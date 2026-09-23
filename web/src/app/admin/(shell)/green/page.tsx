import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { listGreenLotsAdmin } from "@/lib/green-admin";
import { isDemo } from "@/lib/env";
import { TopBar } from "@/components/admin/Chrome";
import { GreenCatalogView } from "@/components/admin/GreenCatalog";

export const metadata: Metadata = { title: "Green catalog" };
export const dynamic = "force-dynamic";

export default async function GreenPage() {
  await requireAdmin();
  const rows = await listGreenLotsAdmin();
  return (
    <>
      <TopBar title="Green catalog" subtitle="The coffees customers can put in a blend on the shop page." breadcrumbs="Inventory / Green catalog" />
      <GreenCatalogView rows={rows} demo={isDemo()} />
    </>
  );
}
