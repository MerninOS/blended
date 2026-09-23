import Link from "next/link";
import { CO } from "@/components/ui/primitives";

/** Shown in place of an admin view when Shopify rejects the request. */
export function AdminError({ what, error }: { what: string; error: unknown }) {
  const msg = error instanceof Error ? error.message : String(error);
  const hint = /app_not_installed/i.test(String((error as { details?: unknown })?.details ?? "")) || /token exchange failed/i.test(msg)
    ? "Shopify refused the Admin API credentials. Make sure the app with this Client ID is installed on the store in SHOPIFY_STORE_DOMAIN (Dev Dashboard → your app → Install), or set SHOPIFY_ADMIN_ACCESS_TOKEN."
    : /access denied|not approved|ACCESS_DENIED/i.test(msg)
      ? "The Admin API app is missing a scope or protected customer data access. Check the scopes listed in the README."
      : "Check the setup checklist in Settings.";
  return (
    <div style={{ padding: "20px 24px 40px", maxWidth: 760 }}>
      <div role="alert" style={{ border: "1px solid var(--brand)", background: "var(--brand-soft)", borderRadius: "var(--r-md)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={CO.over({ fontSize: 10.5, color: "var(--brand)" })}>Couldn&apos;t load {what} from Shopify</span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.55, color: "var(--ink)" }}>{hint}</span>
        <code style={CO.data({ fontSize: 12, color: "var(--ink-muted)", wordBreak: "break-word" })}>{msg}</code>
        <Link href="/admin/settings" style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Open Settings →</Link>
      </div>
    </div>
  );
}
