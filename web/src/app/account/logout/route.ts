import { NextResponse, type NextRequest } from "next/server";
import { logoutUrl } from "@/lib/customer-account";

export async function POST(req: NextRequest) {
  const to = await logoutUrl();
  return NextResponse.redirect(new URL(to, req.url), { status: 303 });
}
