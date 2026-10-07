"use client";
// Email signup popup. Shows once per visitor after they've spent a moment on the
// site (time or scroll, whichever comes first), never on top of the cookie
// banner, and not again for a while after it's closed. Never again once they
// sign up (here or in the footer).
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Btn, disp, over } from "@/components/ui/primitives";
import { NewsletterForm, popupSnoozed, snoozePopup } from "@/components/store/FooterClient";
import { useConsent, usePrefsOpen } from "./consent";

const DELAY_MS = 12_000;
const SCROLL_SHARE = 0.4;
const SKIP = /^\/(wholesale|account|policies|admin|studio)(\/|$)/;

export function SignupPopup() {
  const path = usePathname();
  const consent = useConsent();
  const prefsOpen = usePrefsOpen();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const bannerUp = consent === null || prefsOpen;
  const eligible = !bannerUp && !SKIP.test(path);

  useEffect(() => {
    if (!eligible || open || popupSnoozed()) return;
    const show = () => { if (!popupSnoozed()) setOpen(true); };
    const t = setTimeout(show, DELAY_MS);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (max > 0 && scrollY / max >= SCROLL_SHARE) show();
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(t); removeEventListener("scroll", onScroll); };
  }, [eligible, open]);

  const close = () => { if (!done) snoozePopup(); setOpen(false); };

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  });

  if (!open || SKIP.test(path)) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={close} style={{ position: "absolute", inset: 0, background: "rgba(36, 24, 18, .45)", animation: "co-fade 200ms var(--ease)" }} />
      <div role="dialog" aria-modal="true" aria-labelledby="nl-pop-title"
        style={{ position: "relative", width: "min(440px, 100%)", background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-modal)", padding: "28px 26px 24px", display: "flex", flexDirection: "column", gap: 14, animation: "sf-drop 220ms var(--ease)" }}>
        <button type="button" onClick={close} aria-label="Close"
          style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "none", border: 0, borderRadius: "var(--r-md)", cursor: "pointer", color: "var(--ink-muted)", fontSize: 20, lineHeight: 1 }}>×</button>
        <span style={{ ...over, fontSize: 10.5, color: "var(--brand)" }}>Roast day notes</span>
        <h2 id="nl-pop-title" style={{ ...disp, fontSize: 24, lineHeight: 1.05, margin: 0, color: "var(--ink)" }}>First dibs on new lots</h2>
        <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.55, color: "var(--ink-muted)" }}>
          New green lots, roast days and the odd limited release. A few emails a month.
        </p>
        <NewsletterForm source="popup" id="nl-pop-email" autoFocus onDone={() => setDone(true)} />
        {done
          ? <Btn variant="outline" size="md" onClick={close} style={{ alignSelf: "flex-start" }}>Back to the shop</Btn>
          : <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-subtle)" }}>Unsubscribe anytime.</p>}
      </div>
    </div>
  );
}
