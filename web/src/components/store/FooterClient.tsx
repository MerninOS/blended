"use client";
import { useState, type CSSProperties } from "react";
import { Btn, inp } from "@/components/ui/primitives";
import { consentStore } from "@/components/tracking/consent";
import { identify } from "@/components/tracking/analytics";

export function CookiePrefsLink({ style }: { style: CSSProperties }) {
  return <button type="button" onClick={() => consentStore.openPrefs()} style={{ ...style, background: "none", border: 0, padding: 0, cursor: "pointer", textAlign: "left" }}>Cookie preferences</button>;
}

// Signup popup suppression: snoozed for two weeks after it's closed, for good once
// the visitor signs up anywhere. Storage can be blocked, so every access is guarded.
const POPUP_KEY = "blended.signup-popup";
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;
export function popupSnoozed() {
  try { return Number(localStorage.getItem(POPUP_KEY) || 0) > Date.now(); } catch { return true; }
}
export function snoozePopup(forever = false) {
  try { localStorage.setItem(POPUP_KEY, String(forever ? Number.MAX_SAFE_INTEGER : Date.now() + SNOOZE_MS)); } catch { /* ignore */ }
}

/** Email signup → /api/newsletter. `source` tags the Klaviyo profile (footer or popup). */
export function NewsletterForm({ source = "footer", id = "nl-email", autoFocus, onDone }: { source?: "footer" | "popup"; id?: string; autoFocus?: boolean; onDone?: () => void }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("busy");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source }) });
      const j = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) { setState("error"); setMsg(j.error || "Couldn't sign you up. Try again."); return; }
      identify(email);
      snoozePopup(true);
      setState("done"); setMsg("Check your inbox to confirm.");
      onDone?.();
    } catch { setState("error"); setMsg("Couldn't reach the server. Try again."); }
  };
  if (state === "done") return <p role="status" style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)" }}>{msg}</p>;
  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 8, maxWidth: 400, flexWrap: "wrap" }}>
      <label htmlFor={id} className="sr-only">Email</label>
      <input id={id} type="email" required autoComplete="email" autoFocus={autoFocus} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...inp, flex: "1 1 200px", width: "auto" }} />
      <Btn type="submit" size="md" variant="primary" disabled={state === "busy"}>{state === "busy" ? "Signing up…" : "Sign up"}</Btn>
      {state === "error" && <p role="alert" style={{ margin: 0, width: "100%", fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--danger)" }}>{msg}</p>}
    </form>
  );
}
