"use client";
// Shown in place of "Add to cart" when the chosen variant is sold out: an email field that
// subscribes to a Klaviyo back-in-stock alert for that Shopify variant.
import { useState } from "react";
import { inp } from "@/components/ui/primitives";
import { identify } from "@/components/tracking/analytics";

export function BackInStock({ variantId, name }: { variantId: string | undefined; name: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  if (!variantId?.startsWith("gid://shopify/ProductVariant/")) return null;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("busy");
    try {
      const res = await fetch("/api/back-in-stock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, variantId }) });
      const j = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) { setState("error"); setMsg(j.error || "Couldn't set the alert. Try again."); return; }
      identify(email);
      setState("done"); setMsg(`We'll email you when ${name} is back.`);
    } catch { setState("error"); setMsg("Couldn't reach the server. Try again."); }
  };
  if (state === "done") return <p role="status" style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)" }}>{msg}</p>;
  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label htmlFor="bis-email" style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-muted)" }}>{"Leave your email and we'll write when it's back."}</label>
      <div className="pd-buy">
        <input id="bis-email" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...inp, flex: "1 1 auto", width: "auto", minWidth: 0 }} />
        <button className="sh-btn lg" type="submit" disabled={state === "busy"} style={{ flex: "0 0 auto" }}>{state === "busy" ? "Saving…" : "Notify me"}</button>
      </div>
      {state === "error" && <p role="alert" style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--danger)" }}>{msg}</p>}
    </form>
  );
}
