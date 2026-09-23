import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { getBoardOrders } from "@/lib/orders";
import { env, isDemo } from "@/lib/env";
import { TopBar } from "@/components/admin/Chrome";
import { OrdersView } from "@/components/admin/OrdersView";
import { AdminError } from "@/components/admin/AdminError";
import { LinkBtn } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await requireAdmin();
  const res = await getBoardOrders().then((orders) => ({ orders }), (error: unknown) => ({ error }));
  const newDraft = !isDemo() && env.storeDomain ? `https://admin.shopify.com/store/${env.storeDomain.replace(/\.myshopify\.com$/, "")}/draft_orders/new` : null;
  return (
    <>
      <TopBar title="Orders" subtitle="Coffee sold through the shop, and what it takes to ship it." breadcrumbs="Operations / Orders"
        actions={newDraft ? <LinkBtn href={newDraft} size="sm" variant="primary" icon={<Icon name="plus" size={14} />}>Manual order</LinkBtn> : undefined} />
      {"orders" in res ? <OrdersView orders={res.orders} /> : <AdminError what="orders" error={res.error} />}
    </>
  );
}
