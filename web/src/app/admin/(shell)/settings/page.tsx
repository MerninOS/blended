import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { DEFAULT_SETTINGS, getConnection, getSettings } from "@/lib/settings";
import { TopBar } from "@/components/admin/Chrome";
import { SettingsView } from "@/components/admin/SettingsView";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  const [conn, settings] = await Promise.all([getConnection(), getSettings().catch(() => DEFAULT_SETTINGS)]);
  return (
    <>
      <TopBar title="Settings" subtitle="How Blended talks to the Shopify store." breadcrumbs="Settings / Shopify" />
      <SettingsView conn={conn} initial={settings} />
    </>
  );
}
