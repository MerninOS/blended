import { NextResponse, type NextRequest } from "next/server";
import { verify } from "@/lib/crypto";
import { GATE_COOKIE, gateExempt, gateOn, hasPass } from "@/lib/site-gate";

const sessionSecret = () => process.env.SESSION_SECRET || (process.env.NODE_ENV !== "production" ? "dev-only-insecure-session-secret-change-me" : "");

async function isAdmin(req: NextRequest) {
  const secret = sessionSecret();
  const v = secret ? await verify(req.cookies.get("blended_admin")?.value, secret) : null;
  return !!v && v.startsWith("admin:") && Number(v.slice(6)) > Date.now();
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Optimistic gate for /admin: bounce to the login page without a valid
  // session cookie. Pages and server actions re-check with requireAdmin().
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const open = !process.env.ADMIN_PASSWORD && process.env.NODE_ENV !== "production";
    if (open || (await isAdmin(req))) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Coming soon gate: without the password cookie (or an admin session), every
  // page is answered with /coming-soon at its own URL.
  if (!gateOn() || gateExempt(pathname)) return NextResponse.next();
  if ((await hasPass(req.cookies.get(GATE_COOKIE)?.value)) || (await isAdmin(req))) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/coming-soon";
  url.search = "";
  const res = NextResponse.rewrite(url);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

// Everything but build assets and files with an extension (images, fonts, models).
export const config = { matcher: ["/((?!_next/static|_next/image|.*\\.[a-z0-9]+$).*)"] };
