import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { getCustomer } from "@/lib/customer-account";
import { hasCustomerAccounts } from "@/lib/env";
import { CatalogProvider } from "@/components/store/catalog-context";
import { PrivateLabelView } from "@/components/store/PrivateLabelView";
import { WholesaleGate } from "@/components/store/WholesaleGate";

export const metadata: Metadata = { title: "Wholesale · Private label" };

export default async function WholesalePage(props: PageProps<"/wholesale">) {
  const { signin } = await props.searchParams;
  const customer = await getCustomer();
  if (!customer) return <WholesaleGate state="signed-out" available={hasCustomerAccounts()} error={signin === "failed" ? "Sign-in didn't complete. Try again." : signin === "unavailable" ? "Sign-in is unavailable right now." : null} />;
  if (!customer.wholesale) return <WholesaleGate state="pending" available email={customer.email} />;
  const catalog = await getCatalog();
  return (
    <CatalogProvider catalog={catalog}>
      <PrivateLabelView account={{ company: customer.company, email: customer.email, address: customer.address }} />
    </CatalogProvider>
  );
}
