import { NextResponse, type NextRequest } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { CheckoutError } from "@/lib/checkout";
import { getCustomer } from "@/lib/customer-account";
import type { CheckoutResponse, WholesaleOrderRequest } from "@/lib/domain/requests";
import { isDemo } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import { guard } from "@/lib/guard";
import { isWholesaleCustomer, placeWholesaleOrder, priceWholesale } from "@/lib/wholesale";

export async function POST(req: NextRequest): Promise<NextResponse<CheckoutResponse>> {
  const blocked = await guard(req, "wholesale-order", { max: 8 });
  if (blocked) return blocked;
  const customer = await getCustomer();
  if (!customer) return NextResponse.json({ error: "Sign in with your wholesale account to order." }, { status: 401 });

  let body: WholesaleOrderRequest;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  const s = body.ship;
  if (!s || !s.company?.trim() || !s.line1?.trim() || !s.city?.trim() || !/^[A-Za-z]{2}$/.test(s.state?.trim() || "") || !/^\d{5}(-\d{4})?$/.test(s.zip?.trim() || ""))
    return NextResponse.json({ error: "Complete the shipping address (company, street, city, 2-letter state, ZIP)." }, { status: 422 });

  try {
    const priced = priceWholesale(body, await getCatalog());
    if (isDemo()) return NextResponse.json({ demo: true, orderName: "PL-DEMO" });
    if (!(await getSettings()).wholesaleCheckout) return NextResponse.json({ error: "Wholesale ordering is paused. Contact us to place a run." }, { status: 503 });
    if (!(await isWholesaleCustomer(customer.customerId)))
      return NextResponse.json({ error: "This account isn't set up for wholesale yet. Contact us to be approved." }, { status: 403 });
    const r = await placeWholesaleOrder(body, priced, { id: customer.customerId, email: customer.email });
    return NextResponse.json(r);
  } catch (e) {
    if (e instanceof CheckoutError) return NextResponse.json({ error: e.message }, { status: 422 });
    console.error("[wholesale]", e);
    return NextResponse.json({ error: "We couldn't place the order right now. Please try again." }, { status: 502 });
  }
}
