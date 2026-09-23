import { NextResponse, type NextRequest } from "next/server";
import { completeLogin } from "@/lib/customer-account";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (!code || !state) return NextResponse.redirect(new URL("/wholesale?signin=failed", req.url));
  try {
    const to = await completeLogin(code, state);
    return NextResponse.redirect(new URL(to, req.url));
  } catch {
    return NextResponse.redirect(new URL("/wholesale?signin=failed", req.url));
  }
}
