"use client";
// Collapsible "What our graders say" + customer reviews for a coffee. Renders
// nothing until the coffee has review data (the `reviews` JSON field).
import { useState } from "react";
import type { CoffeeReviewsData } from "@/lib/domain/types";
import { mono, over } from "@/components/ui/primitives";

function Stars({ n, size = 11 }: { n: number; size?: number }) {
  return (
    <span aria-label={`${n} of 5 stars`} style={{ display: "inline-flex", gap: 1, color: "var(--brand)", fontSize: size, lineHeight: 1, letterSpacing: 0 }}>
      {[1, 2, 3, 4, 5].map((i) => <span key={i} aria-hidden="true" style={{ opacity: i <= Math.round(n) ? 1 : .22 }}>★</span>)}
    </span>
  );
}

export function CoffeeReviews({ coffee, compact }: { coffee: { reviews?: CoffeeReviewsData | null }; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const d = coffee.reviews;
  if (!d || (!d.grader && !d.reviews?.length)) return null;
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    <div onClick={stop} onKeyDown={stop} style={{ borderTop: "1px solid var(--hairline)" }}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: compact ? "8px 0" : "9px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", color: "var(--ink)" }}>
        <Stars n={d.avg} />
        <span style={{ ...mono, fontSize: 11.5, color: "var(--ink)" }}>{d.avg.toFixed(1)}</span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--ink-subtle)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.count} reviews{d.grader ? " · grader notes" : ""}</span>
        <span style={{ display: "inline-flex", transform: open ? "rotate(180deg)" : "none", transition: "transform var(--dur) var(--ease)", color: "var(--ink-subtle)", fontSize: 10 }}>▾</span>
      </button>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 12 }}>
          {d.grader && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 12px", background: "var(--surface-sunken)", borderRadius: "var(--r-sm)" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                <span style={{ ...over, fontSize: 9.5, color: "var(--ink-muted)" }}>What our graders say</span>
                <span style={{ ...mono, fontSize: 12, color: "var(--ink)" }}>{d.grader.score}</span>
              </div>
              <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.5, color: "var(--ink)", textWrap: "pretty" }}>{d.grader.note}</p>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--ink-subtle)" }}>{d.grader.who} · {d.grader.role}</span>
            </div>
          )}
          {d.reviews.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ ...over, fontSize: 9.5, color: "var(--ink-muted)" }}>From customers</span>
              {d.reviews.map((r, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: i ? 10 : 0, borderTop: i ? "1px solid var(--hairline)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Stars n={r.stars} size={10} />
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, fontWeight: 600, color: "var(--ink)" }}>{r.who}</span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--ink-subtle)" }}>· {r.brew}</span>
                  </div>
                  <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-muted)", textWrap: "pretty" }}>{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
