import { NextResponse, type NextRequest } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { CheckoutError, createRetailDraft, priceRetailCart } from "@/lib/checkout";
import type { CheckoutResponse, RetailCheckoutRequest } from "@/lib/domain/requests";
import { env, isDemo } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import { guard } from "@/lib/guard";

const DRAFT_COOKIE = "blended_draft";

export async function POST(req: NextRequest): Promise<NextResponse<CheckoutResponse>> {
  const blocked = await guard(req, "checkout", { max: 12 });
  if (blocked) return blocked;
  let body: RetailCheckoutRequest;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  try {
    const priced = priceRetailCart(body.lines, await getCatalog(), { demo: isDemo() });
    if (isDemo()) {
      return NextResponse.json({ demo: true, error: "Demo mode — connect a Shopify store to take real orders." }, { status: 503 });
    }
    if (!(await getSettings()).retailCheckout) return NextResponse.json({ error: "Retail checkout is paused. Check back soon." }, { status: 503 });
    const draft = await createRetailDraft(priced, req.cookies.get(DRAFT_COOKIE)?.value);
    const res = NextResponse.json<CheckoutResponse>({ url: draft.invoiceUrl });
    res.cookies.set(DRAFT_COOKIE, draft.id, { httpOnly: true, secure: env.isProd, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 3 });
    return res;
  } catch (e) {
    if (e instanceof CheckoutError) return NextResponse.json({ error: e.message }, { status: 422 });
    console.error("[checkout]", e);
    return NextResponse.json({ error: "Checkout is unavailable right now. Please try again." }, { status: 502 });
  }
}
