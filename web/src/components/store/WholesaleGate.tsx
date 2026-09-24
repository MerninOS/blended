import { Btn, LinkBtn, disp, mono, over } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";

// Wholesale is for approved accounts: sign in with Shopify customer accounts;
// the customer needs the `wholesale` tag to order.
export function WholesaleGate({ state, available, email, error }: { state: "signed-out" | "pending"; available: boolean; email?: string; error?: string | null }) {
  return (
    <div className="pv-page" style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "24px 24px 96px", display: "flex", flexDirection: "column", gap: 40 }}>
      <div>
        <h1 style={{ ...disp, fontSize: "clamp(28px,3vw,50px)", lineHeight: 1, margin: 0, color: "var(--ink)" }}>Private label</h1>
        <p className="pv-lede" style={{ fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.6, color: "var(--ink-muted)", marginTop: 8, maxWidth: 620 }}>Coffee roasted here, sold under your name. Pick something we already stock or build a blend, tell us how it should be bagged, and we ship it.</p>
      </div>
      <section style={{ maxWidth: 560, border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", background: "var(--surface)", padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={{ ...over, fontSize: 10.5, color: "var(--brand)" }}>{state === "pending" ? "Account under review" : "Wholesale accounts"}</span>
        {state === "pending" ? (
          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.6, color: "var(--ink)" }}>
            You&apos;re signed in as <span style={mono}>{email}</span>, but this account isn&apos;t approved for wholesale yet. We&apos;ll email you once it is — usually within one business day.
          </p>
        ) : (
          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.6, color: "var(--ink)" }}>
            Sign in with your wholesale account to build private label runs and reorder your blends. 5 lb minimum per run.
          </p>
        )}
        {error && <p role="alert" style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--danger)" }}>{error}</p>}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {state === "signed-out" && available && (
            <LinkBtn href="/account/login?returnTo=/wholesale" variant="primary" size="lg" icon={<Icon name="arrow" size={15} stroke={2} />}>Sign in</LinkBtn>
          )}
          {state === "pending" && (
            <form action="/account/logout" method="post"><Btn variant="outline" type="submit">Sign out</Btn></form>
          )}
          <LinkBtn href="mailto:wholesale@blended.coffee" variant="outline" size={state === "signed-out" ? "lg" : "md"}>Apply for an account</LinkBtn>
        </div>
      </section>
    </div>
  );
}
