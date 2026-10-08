"use client";
// Coffee Lab "Exclusive" tab gate (CoffeePicker.jsx SmsGate): number + consent →
// texted 6-digit code → unlocked. Membership is a sealed cookie the server reads
// (/api/sms); this only drives the two steps and shows who's signed in.
import { useState } from "react";
import { disp, mono } from "@/components/ui/primitives";

export const lockIcon = (s = 14) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
const btn: React.CSSProperties = { minHeight: 48, padding: "0 24px", borderRadius: 100, border: "none", background: "#fff", color: "var(--ink)", cursor: "pointer", flexShrink: 0,
  fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em" };
const field: React.CSSProperties = { flex: "1 1 200px", minWidth: 0, minHeight: 48, padding: "0 16px", borderRadius: "var(--r-md)", border: "1.5px solid rgba(255,255,255,.35)",
  background: "rgba(255,255,255,.08)", color: "#fff", fontFamily: "var(--font-sans)", fontSize: 16, outline: "none" };
const link = (light: boolean): React.CSSProperties => ({ background: "none", border: "none", padding: "2px 0 3px", borderBottom: `1.5px solid ${light ? "rgba(255,255,255,.7)" : "var(--ink)"}`,
  cursor: "pointer", ...mono, fontSize: 12, color: light ? "#fff" : "var(--ink)" });
const fmtPhone = (v: string) => {
  const d = v.replace(/\D/g, "").replace(/^1(?=\d{10})/, "").slice(0, 10);
  return d.length < 4 ? d : d.length < 7 ? `(${d.slice(0, 3)}) ${d.slice(3)}` : `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

async function post(url: string, body: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  try {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return { ok: r.ok, data: await r.json().catch(() => ({})) };
  } catch { return { ok: false, data: { error: "Something went sideways. Check your connection and try again." } }; }
}

/** `member`: the masked number when unlocked, null when not. */
export function SmsGate({ member, onJoin, onLeave }: { member: string | null; onJoin: (phone: string) => void; onLeave: () => void }) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [ok, setOk] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const digits = phone.replace(/\D/g, "").length;
  const canSend = digits === 10 && ok && !busy;

  const send = async () => {
    setBusy(true); setError(null); setNote(null);
    const r = await post("/api/sms/start", { phone, consent: ok });
    setBusy(false);
    if (!r.ok) { setError(String(r.data.error || "Couldn't text you right now. Try again in a minute.")); return; }
    if (step === "code") setNote("New code sent.");
    setStep("code"); setCode("");
  };
  const verify = async () => {
    setBusy(true); setError(null); setNote(null);
    const r = await post("/api/sms/verify", { code });
    setBusy(false);
    if (r.ok) { onJoin(String(r.data.phone || "")); return; }
    setError(String(r.data.error || "That code didn't work."));
    if (r.data.restart) setCode("");
  };

  if (member) return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "12px 16px", borderRadius: "var(--r-md)", background: "var(--surface-sunken)" }}>
      <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--ink)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </span>
      <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--ink)" }}>You&rsquo;re on the list as {member}. Exclusive coffees are unlocked for your blends.</span>
      <button type="button" onClick={onLeave} style={link(false)}>Not you?</button>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "clamp(20px,3vw,28px)", borderRadius: "var(--r-lg)", background: "var(--ink)", color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, ...mono, fontSize: 11.5, letterSpacing: ".08em", textTransform: "uppercase", opacity: .8 }}>{lockIcon(13)} SMS members only</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h3 style={{ margin: 0, ...disp, fontSize: "clamp(26px,3.4vw,36px)", lineHeight: 1.05, color: "#fff", textWrap: "balance" }}>{step === "phone" ? "Get on the list to unlock Exclusive Releases" : "Check your texts"}</h3>
        <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 14.5, lineHeight: 1.5, color: "rgba(255,255,255,.82)", maxWidth: "56ch", textWrap: "pretty" }}>
          {step === "phone" ? "We text new micro-lot drops a few times a month. Join to add these coffees to any blend." : `Enter the 6-digit code we sent to ${phone}.`}
        </p>
      </div>
      {step === "phone" ? <>
        <form onSubmit={(e) => { e.preventDefault(); if (canSend) send(); }} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input type="tel" inputMode="tel" autoComplete="tel" placeholder="(555) 123-4567" aria-label="Mobile number" value={phone} onChange={(e) => setPhone(fmtPhone(e.target.value))} style={field} />
          <button type="submit" disabled={!canSend} style={{ ...btn, opacity: canSend ? 1 : .45, cursor: canSend ? "pointer" : "not-allowed" }}>{busy ? "Sending…" : "Join the list"}</button>
        </form>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, lineHeight: 1.45, color: "rgba(255,255,255,.75)", maxWidth: "72ch" }}>
          <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} style={{ width: 18, height: 18, marginTop: 1, flexShrink: 0, accentColor: "#fff" }} />
          <span>I agree to receive recurring automated marketing texts from Blended at this number. Consent isn&rsquo;t a condition of purchase. Msg &amp; data rates may apply. Reply STOP to cancel, HELP for help.</span>
        </label>
      </> : <>
        <form onSubmit={(e) => { e.preventDefault(); if (code.length === 6 && !busy) verify(); }} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input inputMode="numeric" autoComplete="one-time-code" placeholder="••••••" aria-label="Verification code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            style={{ ...field, flex: "0 1 200px", ...mono, fontSize: 20, letterSpacing: ".3em", textAlign: "center" }} />
          <button type="submit" disabled={code.length !== 6 || busy} style={{ ...btn, opacity: code.length === 6 && !busy ? 1 : .45, cursor: code.length === 6 && !busy ? "pointer" : "not-allowed" }}>{busy ? "Checking…" : "Unlock"}</button>
        </form>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <button type="button" onClick={() => { setStep("phone"); setCode(""); setError(null); setNote(null); }} style={link(true)}>Change number</button>
          <button type="button" disabled={busy} onClick={send} style={link(true)}>Resend code</button>
        </div>
      </>}
      {(error || note) && <span role={error ? "alert" : "status"} style={{ fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.4, color: error ? "var(--brand-soft, #fbd5cc)" : "rgba(255,255,255,.82)" }}>{error || note}</span>}
    </div>
  );
}
