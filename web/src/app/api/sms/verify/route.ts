import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/guard";
import { getSettings } from "@/lib/settings";
import { MAX_TRIES, MEMBER_COOKIE, PENDING_COOKIE, codeHash, cookieOpts, maskPhone, readPending, sealMember, sealPending } from "@/lib/sms";

const YEAR = 60 * 60 * 24 * 365;

// Step 2: the texted code → member cookie (exclusives unlocked on this device).
export async function POST(req: NextRequest) {
  const blocked = await guard(req, "sms-verify", { max: 10 });
  if (blocked) return blocked;
  if (!(await getSettings()).smsExclusives) return NextResponse.json({ error: "Exclusive drops aren't open yet." }, { status: 503 });

  const pending = await readPending(req.cookies.get(PENDING_COOKIE)?.value);
  const restart = (error: string, status: number) => {
    const res = NextResponse.json({ error, restart: true }, { status });
    res.cookies.set(PENDING_COOKIE, "", { ...cookieOpts, maxAge: 0 });
    return res;
  };
  if (!pending || pending.exp < Date.now()) return restart("That code expired. Send a new one.", 410);

  let code = "";
  try { code = String((await req.json()).code ?? "").replace(/\D/g, ""); } catch { /* fall through */ }
  if (code.length !== 6 || (await codeHash(pending.phone, code)) !== pending.hash) {
    const tries = pending.tries + 1;
    if (tries >= MAX_TRIES) return restart("Too many tries. Send a new code.", 429);
    const res = NextResponse.json({ error: "That code doesn't match. Check your texts and try again." }, { status: 422 });
    res.cookies.set(PENDING_COOKIE, await sealPending({ ...pending, tries }), { ...cookieOpts, maxAge: Math.max(1, Math.round((pending.exp - Date.now()) / 1000)) });
    return res;
  }

  const res = NextResponse.json({ member: true, phone: maskPhone(pending.phone) });
  res.cookies.set(PENDING_COOKIE, "", { ...cookieOpts, maxAge: 0 });
  res.cookies.set(MEMBER_COOKIE, await sealMember({ phone: pending.phone, at: Date.now() }), { ...cookieOpts, maxAge: YEAR });
  return res;
}
