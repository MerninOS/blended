import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { guard } from "@/lib/guard";

// Email signup → Klaviyo list (the list's own opt-in setting decides whether a
// confirmation email goes out). Uses Klaviyo's client endpoint, which only needs
// the public site key.
export async function POST(req: NextRequest) {
  const blocked = await guard(req, "newsletter", { max: 5 });
  if (blocked) return blocked;
  if (!env.klaviyoPublicKey || !env.klaviyoListId) return NextResponse.json({ error: "Signups aren't open yet." }, { status: 503 });

  let email = "";
  try { email = String((await req.json()).email ?? "").trim().toLowerCase(); } catch { /* fall through */ }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254)
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });

  const res = await fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${encodeURIComponent(env.klaviyoPublicKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/vnd.api+json", Accept: "application/vnd.api+json", revision: "2025-01-15" },
    body: JSON.stringify({
      data: {
        type: "subscription",
        attributes: {
          custom_source: "Blended storefront footer",
          profile: { data: { type: "profile", attributes: { email, subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } } } } },
        },
        relationships: { list: { data: { type: "list", id: env.klaviyoListId } } },
      },
    }),
    cache: "no-store",
  }).catch(() => null);
  if (!res || !res.ok) {
    console.error("[newsletter] Klaviyo", res?.status, await res?.text().catch(() => ""));
    return NextResponse.json({ error: "Couldn't sign you up right now. Try again later." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
