import { NextResponse, type NextRequest } from "next/server";
import { guard } from "@/lib/guard";
import { GATE_COOKIE, GATE_TTL_S, gateOn, passFor } from "@/lib/site-gate";

// Coming soon "Enter with password": the right password leaves a signed cookie
// that lets proxy.ts serve the real pages.
export async function POST(req: NextRequest) {
  const blocked = await guard(req, "site-unlock", { max: 8 });
  if (blocked) return blocked;
  if (!gateOn()) return NextResponse.json({ ok: true });

  let password = "";
  try { password = String((await req.json()).password ?? ""); } catch { /* fall through */ }
  const pass = password ? await passFor(password) : null;
  if (!pass) return NextResponse.json({ error: "That password isn't right." }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(GATE_COOKIE, pass, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: GATE_TTL_S });
  return res;
}
