import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShopInfo } from "@/lib/shop";
import { disp } from "@/components/ui/primitives";

// Legal policies, written in Shopify admin (Settings → Policies).
export const revalidate = 3600;

const find = async (handle: string) => (await getShopInfo()).policies.find((p) => p.handle === handle);

export async function generateStaticParams() {
  return (await getShopInfo()).policies.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: PageProps<"/policies/[handle]">): Promise<Metadata> {
  const p = await find((await params).handle);
  return p ? { title: p.title, alternates: { canonical: `/policies/${p.handle}` } } : { title: "Policy not found" };
}

export default async function PolicyPage({ params }: PageProps<"/policies/[handle]">) {
  const p = await find((await params).handle);
  if (!p) notFound();
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 72px" }}>
      <h1 style={{ ...disp, fontSize: "clamp(26px, 4vw, 38px)", margin: "0 0 24px", color: "var(--ink)" }}>{p.title}</h1>
      {/* Policy HTML comes from the shop's own admin. */}
      <div className="policy-body" dangerouslySetInnerHTML={{ __html: p.body }} />
    </main>
  );
}
