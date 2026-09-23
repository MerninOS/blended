import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { getBoardOrders } from "@/lib/orders";
import { env, isDemo } from "@/lib/env";
import { Sidebar } from "@/components/admin/Chrome";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Blended admin" }, robots: { index: false } };

export default async function AdminShell({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  const orders = await getBoardOrders().catch(() => []);
  return (
    <div className="admin-shell" style={{ display: "flex", minHeight: "100vh", background: "var(--canvas)" }}>
      <Sidebar counts={{ orders: orders.filter((o) => o.status === "paid").length }} shopName={isDemo() ? "Blended (sample data)" : env.storeDomain ?? "Shopify"} demo={isDemo()} />
      <main style={{ flex: 1, minWidth: 0, background: "var(--surface)" }}>{children}</main>
    </div>
  );
}
