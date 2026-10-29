import { NextResponse } from "next/server";
import { runHunter } from "@/lib/agents/hunter";
import { cronAuthorized, withRun } from "@/lib/agents/runs";

export const maxDuration = 300;

// Tue and Thu 8 AM CST (vercel.json). Leads → Supabase, drafts → Gmail and a Notion page.
export async function GET(req: Request) {
  if (!cronAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const trigger = new URL(req.url).searchParams.get("trigger") === "manual" ? "manual" : "cron";
  try {
    return NextResponse.json(await withRun("wholesale_hunter", trigger, runHunter));
  } catch (e) {
    console.error("[agents/hunter]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Run failed" }, { status: 500 });
  }
}
