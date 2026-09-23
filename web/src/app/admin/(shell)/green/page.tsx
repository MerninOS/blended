import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { listGreenLotsAdmin } from "@/lib/green-admin";
import { isDemo } from "@/lib/env";
import { TopBar } from "@/components/admin/Chrome";
import { GreenCatalogView } from "@/components/admin/GreenCatalog";
import { AdminError } from "@/components/admin/AdminError";

export const metadata: Metadata = { title: "Green catalog" };
export const dynamic = "force-dynamic";

export default async function GreenPage() {
  await requireAdmin();
  const res = await listGreenLotsAdmin().then((rows) => ({ rows }), (error: unknown) => ({ error }));
  return (
    <>
      <TopBar title="Green catalog" subtitle="The coffees customers can put in a blend on the shop page." breadcrumbs="Inventory / Green catalog" />
      {"rows" in res ? <GreenCatalogView rows={res.rows} demo={isDemo()} /> : <AdminError what="the green catalog" error={res.error} />}
    </>
  );
}
