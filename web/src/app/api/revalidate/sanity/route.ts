// Sanity webhook: when the landing page is published, drop the cached content
// so the next visit shows it. Without the webhook, changes still appear within
// a minute (the fetch's revalidate time). Signed with SANITY_REVALIDATE_SECRET.
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { SANITY_TAG } from "@/lib/sanity";

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return Response.json({ ok: false, message: "SANITY_REVALIDATE_SECRET is not set" }, { status: 500 });
  const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, secret, true);
  if (!isValidSignature) return Response.json({ ok: false, message: "Invalid signature" }, { status: 401 });
  revalidateTag(SANITY_TAG, { expire: 0 });
  return Response.json({ ok: true, type: body?._type ?? null });
}
