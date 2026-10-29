import { NextResponse } from "next/server";
import { runHunter } from "@/lib/agents/hunter";
import { cronAuthorized, withRun } from "@/lib/agents/runs";

export const maxDuration = 300;

// Manual only: vercel.json schedules it for Feb 29 14:00 UTC (Vercel needs a date that comes) and that
// firing is skipped here, so it never runs on its own but keeps a Run button in Vercel Cron Jobs. Leads → Supabase, drafts → Gmail and a Notion page.
export async function GET(req: Request) {
  if (!cronAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const trigger = new URL(req.url).searchParams.get("trigger") === "manual" ? "manual" : "cron";
  const now = new Date();
  if (now.getUTCMonth() === 1 && now.getUTCDate() === 29 && now.getUTCHours() === 14 && now.getUTCMinutes() < 10) {
    return NextResponse.json({ status: "skipped", summary: "Scheduled firing skipped: the Hunter runs only by hand." });
  }
  try {
    return NextResponse.json(await withRun("wholesale_hunter", trigger, runHunter));
  } catch (e) {
    console.error("[agents/hunter]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Run failed" }, { status: 500 });
  }
}
