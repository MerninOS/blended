import "server-only";
// Chief of Staff morning brief. Everything with a number in it is worked out
// here in code; the model only reads those facts and writes the Watch list and
// one recommended focus. The brief lands as a Notion page.
import Anthropic from "@anthropic-ai/sdk";
import { G_PER_LB } from "@/lib/domain/coffee";
import { env } from "@/lib/env";
import { getInventoryLots } from "@/lib/catalog";
import { greenLedger } from "@/lib/green-ledger";
import { getBoardOrders } from "@/lib/orders";
import { chicagoDate } from "@/lib/agents/cfo";
import { db, type RunResult } from "@/lib/agents/runs";

const MODEL = "claude-sonnet-5-5";
const PRICE = { in: 2 / 1e6, out: 10 / 1e6 }; // $/token, keep in step with MODEL
const COVER_WARN_DAYS = 21;

const SOP = `You are the Chief of Staff agent for One Two Coffee, a small Austin roaster that sells
custom blends and its own coffees online, roasted to order, plus private label wholesale.
Each weekday morning you get facts the system has already calculated. Write the
"Watch" list and one recommended focus for Zak, the owner.

Rules:
- Use only the facts given. Never invent numbers, lots, customers or events.
- Watch items are things that need attention or could go wrong soon: green lots running
  low, orders waiting too long, an agent run that failed, a sharp change in a number.
  At most five, one short plain sentence each. An empty list is fine on a quiet day.
- The focus is the single most useful thing Zak could do today, with the reason in one
  sentence. Prefer revenue and anything that blocks customers' orders.
- Plain, direct words. No flattery, no exclamation marks.`;

const FORMAT = {
  type: "json_schema" as const,
  schema: {
    type: "object",
    properties: {
      watch: { type: "array", items: { type: "string" } },
      focus: { type: "object", properties: { action: { type: "string" }, reason: { type: "string" } }, required: ["action", "reason"], additionalProperties: false },
    },
    required: ["watch", "focus"],
    additionalProperties: false,
  },
};
interface Judgment { watch: string[]; focus: { action: string; reason: string } }

const usd = (n: number | null | undefined) => (n == null ? "n/a" : `$${Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`);
const pct = (n: number | null | undefined) => (n == null ? "n/a" : `${Math.round(Number(n) * 100)}%`);

async function facts() {
  const [{ data: kpis }, { data: runs }, orders, lots, ledger] = await Promise.all([
    db().from("kpi_snapshots").select("*").order("date", { ascending: false }).limit(8),
    db().from("agent_runs").select("agent_id, status, summary, error, started_at").gte("started_at", new Date(Date.now() - 864e5).toISOString()).order("started_at"),
    getBoardOrders(),
    getInventoryLots(),
    greenLedger(30),
  ]);
  const open = orders.filter((o) => o.status !== "shipped");
  const used30 = new Map<string, number>();
  for (const r of ledger) if (r.state === "deducted") for (const l of r.lots) used30.set(l.id, (used30.get(l.id) ?? 0) + l.g);
  const cover = lots.filter((l) => l.listed).map((l) => {
    const perDay = (used30.get(l.id) ?? 0) / 30, onHand = l.availG ?? l.avail * G_PER_LB;
    return { lot: l.name, onHandLb: Math.round(onHand / G_PER_LB * 10) / 10, daysOfCover: perDay > 0 ? Math.round(onHand / perDay) : null };
  });
  return {
    today: chicagoDate(0),
    yesterday: kpis?.[0] ?? null,
    lastWeek: (kpis ?? []).slice(1),
    openOrders: {
      paid: open.filter((o) => o.status === "paid").length,
      roasting: open.filter((o) => o.status === "roasting").length,
      packing: open.filter((o) => o.status === "packing").length,
      qcHold: open.filter((o) => o.qcHold).map((o) => o.name),
    },
    lowGreen: cover.filter((c) => c.daysOfCover != null && c.daysOfCover < COVER_WARN_DAYS),
    agentRuns: runs ?? [],
    neverDeducted: ledger.filter((r) => r.state === "missing").map((r) => r.name),
  };
}
type Facts = Awaited<ReturnType<typeof facts>>;

async function judge(f: Facts) {
  const client = new Anthropic();
  const res = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: FORMAT },
    system: SOP,
    messages: [{ role: "user", content: `Facts for ${f.today}:\n${JSON.stringify(f, null, 1)}` }],
  });
  if (res.stop_reason === "refusal") throw new Error("Brief model declined the request");
  const text = res.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error(`Brief model returned no text (stop: ${res.stop_reason})`);
  return { judgment: JSON.parse(text.text) as Judgment, usage: res.usage };
}

// ---------- Notion ----------
type Block = Record<string, unknown>;
const rt = (content: string) => [{ type: "text", text: { content: content.slice(0, 2000) } }];
const h2 = (t: string): Block => ({ object: "block", type: "heading_2", heading_2: { rich_text: rt(t) } });
const li = (t: string): Block => ({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: rt(t) } });
const p = (t: string): Block => ({ object: "block", type: "paragraph", paragraph: { rich_text: rt(t) } });

export function briefBlocks(f: Facts, j: Judgment): Block[] {
  const y = f.yesterday;
  const ran = f.agentRuns.map((r) => `${r.agent_id}: ${r.status}${r.summary ? `. ${r.summary}` : ""}${r.error ? `. ${r.error}` : ""}`);
  return [
    h2("Numbers"),
    ...(y
      ? [li(`${y.date}: ${usd(y.revenue)} revenue from ${y.orders} orders, AOV ${usd(y.aov)}`), li(`Repeat rate ${pct(y.repeat_rate)}, green margin ${pct(y.green_margin)}`), li(`Cash ${usd(y.cash_usd)}`)]
      : [p("No snapshot yet. The CFO runs at 5:30 AM CT.")]),
    h2("Waiting on you"),
    li(`Orders to roast: ${f.openOrders.paid} paid, ${f.openOrders.roasting} roasting, ${f.openOrders.packing} packing`),
    ...(f.openOrders.qcHold.length ? [li(`QC hold: ${f.openOrders.qcHold.join(", ")}`)] : []),
    ...(f.neverDeducted.length ? [li(`Green never deducted: ${f.neverDeducted.join(", ")}`)] : []),
    h2("What ran"),
    ...(ran.length ? ran.map(li) : [p("No agent runs in the last 24 hours.")]),
    h2("Watch"),
    ...(j.watch.length ? j.watch.map(li) : [p("Nothing flagged.")]),
    h2("Today's focus"),
    p(`${j.focus.action}. ${j.focus.reason}`),
  ];
}

async function notionPage(title: string, children: Block[]) {
  if (!env.notionToken || !env.notionBriefParent) throw new Error("NOTION_TOKEN and NOTION_BRIEF_PARENT_ID must be set");
  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.notionToken}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
    body: JSON.stringify({ parent: { page_id: env.notionBriefParent }, properties: { title: { title: rt(title) } }, children }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Notion ${res.status}: ${await res.text().catch(() => "")}`);
  return (await res.json() as { url: string }).url;
}

export async function runBrief(): Promise<RunResult> {
  const f = await facts();
  const { judgment, usage } = await judge(f);
  const day = new Date(`${f.today}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
  const url = await notionPage(`Morning brief · ${day}`, briefBlocks(f, judgment));
  const tokensIn = usage.input_tokens + (usage.cache_read_input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0);
  return {
    status: "ok",
    summary: `Brief posted: ${url}. Focus: ${judgment.focus.action}`,
    tokensIn, tokensOut: usage.output_tokens,
    costUsd: Number((tokensIn * PRICE.in + usage.output_tokens * PRICE.out).toFixed(4)),
  };
}
