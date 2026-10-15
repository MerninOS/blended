import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { guard } from "@/lib/guard";
import { toE164 } from "@/lib/sms";

// Coming soon step 2: the visitor's number → Klaviyo SMS list, with SMS marketing
// consent (the form shows the rates/STOP disclosure next to the button). The email
// from step 1 rides along so Klaviyo keeps one profile for both.
export async function POST(req: NextRequest) {
  const blocked = await guard(req, "coming-soon-sms", { max: 5 });
  if (blocked) return blocked;
  if (!env.klaviyoPublicKey || !env.klaviyoSmsListId) return NextResponse.json({ error: "Texts aren't set up yet." }, { status: 503 });

  let phone: string | null = null, email = "";
  try {
    const body = await req.json();
    phone = toE164(body.phone);
    email = String(body.email ?? "").trim().toLowerCase();
  } catch { /* fall through */ }
  if (!phone) return NextResponse.json({ error: "Enter a 10-digit US number." }, { status: 422 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) email = "";

  const res = await fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${encodeURIComponent(env.klaviyoPublicKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/vnd.api+json", Accept: "application/vnd.api+json", revision: "2025-01-15" },
    body: JSON.stringify({
      data: {
        type: "subscription",
        attributes: {
          custom_source: "Blended coming soon",
          profile: { data: { type: "profile", attributes: { phone_number: phone, ...(email && { email }), subscriptions: { sms: { marketing: { consent: "SUBSCRIBED" } } } } } },
        },
        relationships: { list: { data: { type: "list", id: env.klaviyoSmsListId } } },
      },
    }),
    cache: "no-store",
  }).catch(() => null);
  if (!res || !res.ok) {
    console.error("[coming-soon] Klaviyo SMS", res?.status, await res?.text().catch(() => ""));
    return NextResponse.json({ error: "Couldn't add your number right now. Try again later." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
