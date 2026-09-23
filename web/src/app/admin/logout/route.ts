import { NextResponse, type NextRequest } from "next/server";
import { endAdminSession } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  await endAdminSession();
  return NextResponse.redirect(new URL("/admin/login", req.url), { status: 303 });
}
