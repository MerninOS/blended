"use client";
// Coming soon (design: Coming Soon.html): email → optional SMS signup into the Klaviyo lists, and an
// "Enter with password" panel that unlocks the rest of the site (see lib/site-gate.ts).
import { useRef, useState, type FormEvent } from "react";

type Step = "email" | "phone" | "done" | "password";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const Lock = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;

async function post(url: string, body: unknown): Promise<string | null> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  if (res?.ok) return null;
  const data = await res?.json().catch(() => null);
  return data?.error ?? "Something went wrong. Try again.";
}

const formatPhone = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  return d.length > 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d.length > 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}` : d;
};

export function ComingSoon({ image, video, gated }: { image: string; video: string | null; gated: boolean }) {
  const [step, setStep] = useState<Step>("email");
  const [back, setBack] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [sms, setSms] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);

  const go = (s: Step) => { setError(null); setStep(s); };
  const run = async (fn: () => Promise<void>) => { setBusy(true); try { await fn(); } finally { setBusy(false); } };

  const submitEmail = (e: FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!EMAIL.test(v)) return setError("Enter a valid email, like name@email.com.");
    run(async () => {
      const err = await post("/api/newsletter", { email: v, source: "coming-soon" });
      if (err) return setError(err);
      go("phone");
      setTimeout(() => phoneRef.current?.focus(), 50);
    });
  };

  const submitPhone = (e: FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length !== 10) return setError("Enter a 10-digit US number.");
    run(async () => {
      const err = await post("/api/coming-soon/sms", { phone, email: email.trim() });
      if (err) return setError(err);
      setSms(phone);
      go("done");
    });
  };

  const submitPassword = (e: FormEvent) => {
    e.preventDefault();
    if (!password) return setError("Enter the password.");
    run(async () => {
      const err = await post("/api/coming-soon/unlock", { password });
      if (err) return setError(err);
      // The proxy now serves the real page at this URL; /coming-soon itself goes home. A full load so
      // nothing from the client router's cache of the gated page is reused.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      if (location.pathname === "/coming-soon") window.location.href = "/"; else location.reload();
    });
  };

  const openPassword = () => {
    if (step === "password") return;
    setBack(step); setPassword(""); go("password");
    setTimeout(() => pwRef.current?.focus(), 50);
  };

  const err = (s: Step) => (step === s && error ? " err" : "");

  return (
    <div className="cs" data-screen-label="Coming soon">
      {video
        ? <video className="cs-fill" src={video} poster={image} autoPlay muted loop playsInline aria-hidden="true" />
        // eslint-disable-next-line @next/next/no-img-element -- full-bleed backdrop
        : <img className="cs-fill" src={image} alt="" />}
      <div className="cs-shade" />
      <header className="bh-head" data-overlay="">
        <div className="bh-in">
          <span className="bh-pill bh-logo">BLENDED</span>
          {gated && <button type="button" className="bh-pill cs-pw-open" onClick={openPassword} aria-controls="cs-pw" aria-expanded={step === "password"}><Lock /> <span className="cs-pw-long">Enter with</span> password</button>}
        </div>
      </header>
      <main className="cs-main">
        <span className="cs-over cs-live"><i></i>In progress</span>
        <div className="cs-row">
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <h1 className="cs-disp">Not<br /><span style={{ color: "var(--brand)" }}>yet.</span></h1>
            <p className="cs-lede">We&apos;ve been working on something. We&apos;re not saying what. Leave your email and you&apos;ll hear first.</p>
          </div>
          <div className="cs-form">
            <form className="cs-step" noValidate hidden={step !== "email"} onSubmit={submitEmail}>
              <label className="cs-over" htmlFor="cs-email" style={{ color: "rgba(255,255,255,.7)" }}>01 · Email</label>
              <div className={`cs-field${err("email")}`}>
                <input id="cs-email" type="email" autoComplete="email" placeholder="you@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                <button className="cs-btn" type="submit" disabled={busy}>{busy ? "Sending…" : "Notify me"}</button>
              </div>
              <p className={`cs-note${err("email")}`} role={step === "email" && error ? "alert" : undefined}>{step === "email" && error ? error : "One email when it's ready. Nothing before."}</p>
            </form>

            <form className="cs-step" noValidate hidden={step !== "phone"} onSubmit={submitPhone}>
              <label className="cs-over" htmlFor="cs-phone" style={{ color: "rgba(255,255,255,.7)" }}>02 · Want it sooner?</label>
              <div className={`cs-field${err("phone")}`}>
                <span className="cs-pre">+1</span>
                <input ref={phoneRef} id="cs-phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(555) 555-5555" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} />
                <button className="cs-btn" type="submit" disabled={busy}>{busy ? "Sending…" : "Text me"}</button>
              </div>
              <p className={`cs-note${err("phone")}`} role={step === "phone" && error ? "alert" : undefined}>{step === "phone" && error ? error : "SMS gets it a day early. Msg & data rates may apply. Reply STOP to opt out."}</p>
              <button className="cs-skip" type="button" onClick={() => { setSms(null); go("done"); }}>Email is fine</button>
            </form>

            <div className="cs-step" hidden={step !== "done"}>
              <span className="cs-over" style={{ color: "var(--brand)" }}>✓ You&apos;re on the list</span>
              <p className="cs-lede" style={{ fontSize: 17 }}>
                {sms ? `We'll text ${sms} first, then email ${email.trim()}. Keep an eye out.` : `We'll email ${email.trim()} when it's ready. Keep an eye out.`}
              </p>
            </div>

            {gated && (
              <form id="cs-pw" className="cs-step" noValidate hidden={step !== "password"} onSubmit={submitPassword}>
                <label className="cs-over" htmlFor="cs-password" style={{ color: "rgba(255,255,255,.7)" }}>Enter with password</label>
                <div className={`cs-field${err("password")}`}>
                  <input ref={pwRef} id="cs-password" type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button className="cs-btn" type="submit" disabled={busy}>{busy ? "Checking…" : "Enter"}</button>
                </div>
                <p className={`cs-note${err("password")}`} role={step === "password" && error ? "alert" : undefined}>{step === "password" && error ? error : "For the team and friends of the shop."}</p>
                <button className="cs-skip" type="button" onClick={() => go(back)}>Back to the list</button>
              </form>
            )}
          </div>
        </div>
        <dl className="cs-strip">
          <div><dt>Drop</dt><dd>001</dd></div>
          <div><dt>What</dt><dd><span className="cs-x">Classified</span></dd></div>
          <div><dt>Origin</dt><dd><span className="cs-x">Unknown</span></dd></div>
          <div><dt>When</dt><dd>Soon</dd></div>
        </dl>
      </main>
    </div>
  );
}
