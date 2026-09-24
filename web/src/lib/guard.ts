import "server-only";
// Abuse protection for the POST endpoints that create things in Shopify or
// Klaviyo: Vercel BotID (invisible challenge, set up in instrumentation-client.ts)
// plus a small per-IP rate limit. The limit is per server instance, so it's a
// speed bump rather than a wall; BotID and Vercel's firewall do the heavy lifting.
import { NextResponse, type NextRequest } from "next/server";
import { checkBotId } from "botid/server";

const hits = new Map<string, number[]>();

function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return recent.length > max;
}

/** Returns a response to send back when the request should be refused, else null. */
export async function guard(req: NextRequest, name: string, { max = 20, windowMs = 60_000 } = {}): Promise<NextResponse<{ error: string }> | null> {
  const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(`${name}:${ip}`, max, windowMs))
    return NextResponse.json({ error: "Too many requests. Wait a minute and try again." }, { status: 429 });
  if (process.env.VERCEL) {
    try {
      const v = await checkBotId();
      if (v.isBot && !v.isVerifiedBot) return NextResponse.json({ error: "Request blocked." }, { status: 403 });
    } catch (e) {
      console.error("[guard] BotID check failed:", e instanceof Error ? e.message : e); // fail open
    }
  }
  return null;
}
