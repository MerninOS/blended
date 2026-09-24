// Storefront footer: shop links, Shopify policies, email signup, cookie choices.
import Link from "next/link";
import type { ShopPolicy } from "@/lib/shop";
import { disp, over } from "@/components/ui/primitives";
import { CookiePrefsLink, NewsletterForm } from "./FooterClient";

const policyHref = (p: ShopPolicy) => `/policies/${p.handle}`;

export function StoreFooter({ policies, newsletter }: { policies: ShopPolicy[]; newsletter: boolean }) {
  const link = { fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink-muted)", textDecoration: "none" } as const;
  return (
    <footer style={{ borderTop: "1px solid var(--hairline)", background: "var(--surface-sunken)", marginTop: 24 }}>
      <div className="sf-footer" style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "36px 24px 28px", display: "grid", gridTemplateColumns: "minmax(0,1.4fr) repeat(2, minmax(0,1fr))", gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <span style={{ ...disp, fontSize: 18, color: "var(--ink)" }}>Blended</span>
          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.55, color: "var(--ink-muted)", maxWidth: "44ch" }}>
            {newsletter ? "New green lots, roast days and the odd limited release. A few emails a month." : "Whole bean, roasted to order Tuesday and Thursday."}
          </p>
          {newsletter && <NewsletterForm />}
        </div>
        <nav aria-label="Shop" style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <span style={{ ...over, fontSize: 10, color: "var(--ink-subtle)", marginBottom: 2 }}>Shop</span>
          <Link href="/" style={link}>Our coffees</Link>
          <Link href="/?mode=blend" style={link}>Build a blend</Link>
          <Link href="/wholesale" style={link}>Wholesale & private label</Link>
        </nav>
        <nav aria-label="Policies" style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <span style={{ ...over, fontSize: 10, color: "var(--ink-subtle)", marginBottom: 2 }}>Help</span>
          {policies.map((p) => <Link key={p.handle} href={policyHref(p)} style={link}>{p.title}</Link>)}
          <CookiePrefsLink style={link} />
        </nav>
      </div>
      <div style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "0 24px 24px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-subtle)" }}>
        © {new Date().getFullYear()} Blended · Checkout secured by Shopify
      </div>
    </footer>
  );
}
