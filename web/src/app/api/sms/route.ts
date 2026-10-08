import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { MEMBER_COOKIE, cookieOpts, maskPhone, readMember } from "@/lib/sms";

// Coffee Lab exclusives: is this visitor an SMS member? (The page is cached, so it asks here.)
export async function GET() {
  const [settings, member] = await Promise.all([getSettings(), readMember()]);
  const on = settings.smsExclusives && !!member;
  return NextResponse.json({ enabled: settings.smsExclusives, member: on, phone: on ? maskPhone(member!.phone) : null },
    { headers: { "Cache-Control": "private, no-store" } });
}

// "Not you?": forget the verified number on this device.
export async function DELETE() {
  const res = NextResponse.json({ member: false });
  res.cookies.set(MEMBER_COOKIE, "", { ...cookieOpts, maxAge: 0 });
  return res;
}
