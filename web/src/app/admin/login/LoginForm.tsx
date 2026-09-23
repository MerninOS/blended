"use client";
import { useActionState } from "react";
import { Btn, CO, Field, inp } from "@/components/ui/primitives";
import { login } from "./actions";

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(login, { error: null });
  return (
    <form action={action} style={{ width: "min(380px,100%)", background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", padding: 24, display: "flex", flexDirection: "column", gap: 16, boxShadow: "var(--shadow-pop)" }}>
      <span className="co-wordmark" style={CO.display({ fontSize: 20, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 })}>
        {/* eslint-disable-next-line @next/next/no-img-element -- brand mark */}
        <img src="/brand/blended-mark.png" alt="" width={22} height={22} />BLENDED
      </span>
      <span style={CO.over({ fontSize: 10.5, color: "var(--ink-muted)" })}>Admin · Orders and green catalog</span>
      {configured ? <>
        <Field label="Password"><input name="password" type="password" required autoFocus autoComplete="current-password" style={inp} /></Field>
        {state.error && <p role="alert" style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--danger)" }}>{state.error}</p>}
        <Btn type="submit" variant="primary" size="lg" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Btn>
      </> : <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.55, color: "var(--ink)" }}>Set <code>ADMIN_PASSWORD</code> (and <code>SESSION_SECRET</code>) on this deployment to enable the admin.</p>}
    </form>
  );
}
