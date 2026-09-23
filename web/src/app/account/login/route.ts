import { NextResponse, type NextRequest } from "next/server";
import { beginLogin } from "@/lib/customer-account";

export async function GET(req: NextRequest) {
  const back = req.nextUrl.searchParams.get("returnTo");
  const returnTo = back && back.startsWith("/") && !back.startsWith("//") ? back : "/wholesale";
  try {
    return NextResponse.redirect(await beginLogin(returnTo));
  } catch {
    return NextResponse.redirect(new URL("/wholesale?signin=unavailable", req.url));
  }
}
