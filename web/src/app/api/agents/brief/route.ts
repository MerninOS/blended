import { NextResponse } from "next/server";
import { runBrief } from "@/lib/agents/brief";
import { cronAuthorized, withRun } from "@/lib/agents/runs";

export const maxDuration = 300;

// Weekdays 6:45 AM CT (vercel.json), after the CFO snapshot. Posts the brief to Notion.
export async function GET(req: Request) {
  if (!cronAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const trigger = new URL(req.url).searchParams.get("trigger") === "manual" ? "manual" : "cron";
  try {
    return NextResponse.json(await withRun("chief_of_staff", trigger, runBrief));
  } catch (e) {
    console.error("[agents/brief]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Run failed" }, { status: 500 });
  }
}
