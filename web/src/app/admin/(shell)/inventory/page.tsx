import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { isDemo } from "@/lib/env";
import { fetchStockCoffees } from "@/lib/catalog";
import { listGreenLotsAdmin } from "@/lib/green-admin";
import { greenLedger } from "@/lib/green-ledger";
import { syncStockFromGreen } from "@/lib/green-sync";
import { getSettings } from "@/lib/settings";
import { SHOP_SIZES } from "@/lib/domain/coffee";
import { bagsFromGreen, greenUsageG, linkCoffee } from "@/lib/domain/green";
import { TopBar } from "@/components/admin/Chrome";
import { AdminError } from "@/components/admin/AdminError";
import { InventoryView, type CoffeeRow } from "@/components/admin/InventoryView";

export const metadata: Metadata = { title: "Inventory" };
export const dynamic = "force-dynamic";

async function load() {
  const [stock, lots, settings] = await Promise.all([fetchStockCoffees(), listGreenLotsAdmin(), getSettings()]);
  const loss = settings.roastLoss, byId = new Map(lots.map((l) => [l.id, l]));
  const [ledger, shop] = isDemo() ? [null, null] : await Promise.all([
    greenLedger(30).catch((e: unknown) => { console.error("[inventory] ledger:", e); return null; }),
    syncStockFromGreen({ apply: false }).catch((e: unknown) => { console.error("[inventory] sync preview:", e); return null; }),
  ]);
  const rows: CoffeeRow[] = stock.map((c) => {
    const link = linkCoffee(c, lots), ok = link && !link.missing.length;
    const shopRow = shop?.rows.find((r) => r.name === c.name);
    return {
      id: c.id, gid: c.gid, name: c.name, sub: c.sub, roast: c.roast, link, reviews: c.reviews ?? null,
      perLb: ok ? [...greenUsageG(link.sel, 1, c.roast, loss)].map(([id, g]) => ({ id, name: byId.get(id)?.name ?? id, g: Math.round(g) })) : [],
      sizes: SHOP_SIZES.map((s) => {
        const sh = shopRow?.sizes.find((x) => x.size === s.label);
        return { label: s.label, bags: !link ? null : ok ? bagsFromGreen(link.sel, s.lb, c.roast, byId, loss) : 0, shopify: sh?.tracked ? sh.shopify : null };
      }),
    };
  });
  return {
    rows, ledger,
    lots: lots.map((l) => ({ id: l.id, name: l.name, lb: l.avail, listed: l.listed })),
    settings: { syncStock: settings.syncStock, drawDownGreen: settings.drawDownGreen, roastLoss: loss },
  };
}

export default async function InventoryPage() {
  await requireAdmin();
  const res = await load().then((d) => ({ d }), (error: unknown) => ({ error }));
  return (
    <>
      <TopBar title="Inventory" subtitle="Green is the only stock: every coffee, custom or ours, is roasted to order from it." breadcrumbs="Inventory / Recipes and ledger" />
      {"d" in res ? <InventoryView {...res.d} demo={isDemo()} /> : <AdminError what="inventory" error={res.error} />}
    </>
  );
}
