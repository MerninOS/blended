import { NextResponse } from "next/server";
import { runCfoSnapshot } from "@/lib/agents/cfo";
import { cronAuthorized, withRun } from "@/lib/agents/runs";

export const maxDuration = 300;

// Daily 5:30 AM CT (vercel.json). Writes yesterday's kpi_snapshots row.
export async function GET(req: Request) {
  if (!cronAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const trigger = new URL(req.url).searchParams.get("trigger") === "manual" ? "manual" : "cron";
  try {
    return NextResponse.json(await withRun("cfo", trigger, runCfoSnapshot));
  } catch (e) {
    console.error("[agents/cfo]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Run failed" }, { status: 500 });
  }
}
