import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { getBoardOrders } from "@/lib/orders";
import { listGreenLotsAdmin } from "@/lib/green-admin";
import { getStockCoffees } from "@/lib/catalog";
import { TopBar } from "@/components/admin/Chrome";
import { LabelGeneratorView } from "@/components/admin/LabelGenerator";
import { AdminError } from "@/components/admin/AdminError";
import "./labels.css";

export const metadata: Metadata = { title: "Label generator" };
export const dynamic = "force-dynamic";

export default async function LabelsPage() {
  await requireAdmin();
  const res = await Promise.all([getBoardOrders(), listGreenLotsAdmin(), getStockCoffees().catch(() => [])])
    .then(([orders, lots, stock]) => ({ orders, lots, stock }), (error: unknown) => ({ error }));
  return (
    <>
      <TopBar title="Label generator" subtitle="Coffee bag and concentrate labels, from shop orders or made by hand." breadcrumbs="Operations / Labels" />
      {"orders" in res ? <LabelGeneratorView orders={res.orders} lots={res.lots} stock={res.stock} /> : <AdminError what="orders and the green catalog" error={res.error} />}
    </>
  );
}
