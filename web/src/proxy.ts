import { NextResponse, type NextRequest } from "next/server";
import { verify } from "@/lib/crypto";

// Optimistic gate for /admin: bounce to the login page without a valid
// session cookie. Pages and server actions re-check with requireAdmin().
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const open = !process.env.ADMIN_PASSWORD && process.env.NODE_ENV !== "production";
  if (open) return NextResponse.next();
  const secret = process.env.SESSION_SECRET || (process.env.NODE_ENV !== "production" ? "dev-only-insecure-session-secret-change-me" : "");
  const v = secret ? await verify(req.cookies.get("blended_admin")?.value, secret) : null;
  if (v && v.startsWith("admin:") && Number(v.slice(6)) > Date.now()) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*"] };
