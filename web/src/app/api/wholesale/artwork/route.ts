import { NextResponse, type NextRequest } from "next/server";
import { getCustomer } from "@/lib/customer-account";
import { isDemo } from "@/lib/env";
import { guard } from "@/lib/guard";
import { finalizeUpload, stageUpload } from "@/lib/shopify/files";

// Label artwork goes straight from the browser to Shopify's staged upload
// target (no large bodies through this server), then becomes a Shopify File.
const OK_TYPES = ["application/pdf", "image/svg+xml", "image/png", "application/postscript", "application/illustrator"];
const MAX = 50 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const blocked = await guard(req, "artwork", { max: 20 });
  if (blocked) return blocked;
  const customer = await getCustomer();
  if (!customer?.wholesale) return NextResponse.json({ error: "Wholesale sign-in required." }, { status: 401 });
  const b = await req.json().catch(() => null) as { step: "stage"; filename: string; mimeType: string; size: number } | { step: "finalize"; resourceUrl: string; filename: string } | null;
  if (!b) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  if (isDemo()) return NextResponse.json({ demo: true, fileId: null });
  try {
    if (b.step === "stage") {
      const mime = OK_TYPES.includes(b.mimeType) ? b.mimeType : /\.ai$/i.test(b.filename) ? "application/postscript" : null;
      if (!mime || !(b.size > 0 && b.size <= MAX)) return NextResponse.json({ error: "Use a PDF, AI, SVG or PNG under 50 MB." }, { status: 422 });
      return NextResponse.json(await stageUpload(b.filename, mime, b.size));
    }
    return NextResponse.json(await finalizeUpload(b.resourceUrl, b.filename, `Label artwork · ${customer.company}`));
  } catch (e) {
    console.error("[artwork]", e);
    return NextResponse.json({ error: "Upload failed. Try again." }, { status: 502 });
  }
}
