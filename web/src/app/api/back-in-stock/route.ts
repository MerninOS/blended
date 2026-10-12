import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { guard } from "@/lib/guard";

// "Email me when it's back" → Klaviyo back-in-stock subscription for one Shopify variant.
// Klaviyo watches the variant's inventory through its Shopify integration and fires
// "Subscribed to Back in Stock", which starts the back-in-stock flow.
export async function POST(req: NextRequest) {
  const blocked = await guard(req, "back-in-stock", { max: 5 });
  if (blocked) return blocked;
  if (!env.klaviyoPublicKey) return NextResponse.json({ error: "Restock alerts aren't available yet." }, { status: 503 });

  let email = "", variant = "";
  try {
    const body = await req.json();
    email = String(body.email ?? "").trim().toLowerCase();
    variant = String(body.variantId ?? "").match(/^gid:\/\/shopify\/ProductVariant\/(\d+)$/)?.[1] ?? "";
  } catch { /* fall through */ }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254)
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  if (!variant) return NextResponse.json({ error: "This product can't be watched." }, { status: 422 });

  const res = await fetch(`https://a.klaviyo.com/client/back-in-stock-subscriptions/?company_id=${encodeURIComponent(env.klaviyoPublicKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/vnd.api+json", Accept: "application/vnd.api+json", revision: "2025-01-15" },
    body: JSON.stringify({
      data: {
        type: "back-in-stock-subscription",
        attributes: { channels: ["EMAIL"], profile: { data: { type: "profile", attributes: { email } } } },
        relationships: { variant: { data: { type: "catalog-variant", id: `$shopify:::$default:::${variant}` } } },
      },
    }),
    cache: "no-store",
  }).catch(() => null);
  if (!res || !res.ok) {
    console.error("[back-in-stock] Klaviyo", res?.status, await res?.text().catch(() => ""));
    return NextResponse.json({ error: "Couldn't set the alert right now. Try again later." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
