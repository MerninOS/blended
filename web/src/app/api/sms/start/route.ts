import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/guard";
import { getSettings } from "@/lib/settings";
import { CODE_TTL_S, PENDING_COOKIE, SmsError, codeHash, cookieOpts, maskPhone, newCode, sealPending, sendCode, toE164 } from "@/lib/sms";

// Step 1 of unlocking exclusives: number + consent → subscribe to the SMS list and text a 6-digit code.
export async function POST(req: NextRequest) {
  const blocked = await guard(req, "sms-start", { max: 3 });
  if (blocked) return blocked;
  if (!(await getSettings()).smsExclusives) return NextResponse.json({ error: "Exclusive drops aren't open yet." }, { status: 503 });

  let body: { phone?: unknown; consent?: unknown } = {};
  try { body = await req.json(); } catch { /* fall through */ }
  const phone = toE164(body.phone);
  if (!phone) return NextResponse.json({ error: "Enter a 10-digit US mobile number." }, { status: 422 });
  if (body.consent !== true) return NextResponse.json({ error: "Tick the box to agree to texts." }, { status: 422 });

  const code = newCode();
  try { await sendCode(phone, code); } catch (e) {
    return NextResponse.json({ error: e instanceof SmsError ? e.message : "Couldn't text you right now. Try again in a minute." }, { status: 502 });
  }
  const res = NextResponse.json({ ok: true, phone: maskPhone(phone) });
  res.cookies.set(PENDING_COOKIE, await sealPending({ phone, hash: await codeHash(phone, code), exp: Date.now() + CODE_TTL_S * 1000, tries: 0 }),
    { ...cookieOpts, maxAge: CODE_TTL_S });
  return res;
}
