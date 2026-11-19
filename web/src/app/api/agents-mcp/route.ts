import { NextResponse, type NextRequest } from "next/server";
import { getInventoryLots } from "@/lib/catalog";
import { greenLedger } from "@/lib/green-ledger";
import { PROTOCOL, TOOLS, chicagoDaysAgo, greenCost, greenCover, greenLots, greenUse, inputsOf, isTool, keyOk, reorderAmount, stageCounts } from "@/lib/agents-mcp/rules";
import { stageOrders } from "@/lib/agents-mcp/stages";

// One Two's coffee server for its agents on OPERATOR (lib/agents-mcp/rules.ts). OPERATOR adds it
// on Connections as a custom server, signed in with a key (AGENTS_MCP_KEY). It speaks MCP over
// Streamable HTTP (JSON replies, no sessions). Six tools, all reads: green lots, green use, days of
// cover, reorder amounts, a day's green cost and open orders by stage, every number worked out in
// code here from the storefront's own green lots, green ledger and order tags. Nothing here writes to
// Shopify. With no key set, the route doesn't exist.

const key = () => process.env.AGENTS_MCP_KEY?.trim() || undefined;
const noStore = { "Cache-Control": "no-store" };
const rpc = (id: unknown, body: Record<string, unknown>) => NextResponse.json({ jsonrpc: "2.0", id: id ?? null, ...body }, { headers: noStore });
const toolText = (id: unknown, value: unknown, isError = false) =>
  rpc(id, { result: { ...(isError ? { isError: true } : { structuredContent: value }), content: [{ type: "text", text: isError ? String(value) : JSON.stringify(value) }] } });

async function run(tool: string, args: Record<string, number>) {
  if (tool === "orders_by_stage") return stageCounts(await stageOrders());
  const lots = await getInventoryLots();
  if (tool === "green_lots") return greenLots(lots);
  // a day's cost: read two days more than asked, so the whole Chicago day is inside the window
  if (tool === "green_cost") return greenCost(lots, await greenLedger(args.days_ago + 2), chicagoDaysAgo(new Date(), args.days_ago));
  const rows = await greenLedger(args.days);
  if (tool === "green_use") return greenUse(lots, rows, args.days);
  if (tool === "green_cover") return greenCover(lots, rows, args.days);
  return reorderAmount(lots, rows, args.target_days, args.days);
}

export async function POST(req: NextRequest) {
  if (!key()) return new NextResponse(null, { status: 404 });
  if (!keyOk(req.headers.get("authorization"), key())) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: { "WWW-Authenticate": "Bearer", ...noStore } });
  let msg: { jsonrpc?: unknown; id?: unknown; method?: unknown; params?: { name?: unknown; arguments?: unknown; protocolVersion?: unknown } };
  try { msg = await req.json(); } catch { return rpc(null, { error: { code: -32700, message: "not JSON" } }); }
  if (!msg || typeof msg !== "object" || Array.isArray(msg) || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") return rpc(null, { error: { code: -32600, message: "not a JSON-RPC 2.0 request" } });
  // notifications (no id) get no answer
  if (msg.id === undefined) return new NextResponse(null, { status: 202 });
  switch (msg.method) {
    case "initialize":
      return rpc(msg.id, { result: { protocolVersion: typeof msg.params?.protocolVersion === "string" ? msg.params.protocolVersion : PROTOCOL, capabilities: { tools: {} }, serverInfo: { name: "one-two-coffee", version: "1" } } });
    case "ping":
      return rpc(msg.id, { result: {} });
    case "tools/list":
      return rpc(msg.id, { result: { tools: TOOLS } });
    case "tools/call": {
      const name = msg.params?.name;
      if (!isTool(name)) return toolText(msg.id, `${typeof name === "string" ? name : "That"} isn't a tool this server serves.`, true);
      const a = inputsOf(name, msg.params?.arguments);
      if ("problem" in a) return toolText(msg.id, `Input refused: ${a.problem}`, true);
      try { return toolText(msg.id, await run(name, a.args)); }
      catch (e) {
        console.error("[agents-mcp]", name, e instanceof Error ? e.message : e);
        return toolText(msg.id, "Couldn't read the store just now.", true);
      }
    }
    default:
      return rpc(msg.id, { error: { code: -32601, message: `no method ${msg.method}` } });
  }
}

export async function GET() {
  return new NextResponse(null, { status: key() ? 405 : 404, headers: { Allow: "POST" } });
}
