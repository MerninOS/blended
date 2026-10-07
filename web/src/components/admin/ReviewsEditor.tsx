"use client";
// A coffee's tasting note (blended.reviews → grader) and customer reviews, as edited in the
// admin: green lots in the green catalog, Our coffees on the Inventory page.
import type { CoffeeReviewsData } from "@/lib/domain/types";
import { Btn, CO } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { F, Head, input, monoInput } from "./form";

type Rev = CoffeeReviewsData;
const BREWS = ["Pour-over", "Espresso", "French press", "Drip", "AeroPress", "Cold brew", "Moka pot"];
const EMPTY_REV: Rev = { avg: 0, count: 0, grader: null, reviews: [] };

/** The tasting note shown in the Coffee Lab's details drawer and on coffee pages, and customer reviews. */
export function ReviewsEditor({ value, onChange }: { value: Rev | null | undefined; onChange: (v: Rev) => void }) {
  const v = value ?? EMPTY_REV, g = v.grader ?? { who: "", note: "" };
  const setGrader = (k: "who" | "role" | "score" | "note", x: string) => onChange({ ...v, grader: { ...g, [k]: x } });
  const setRows = (rows: Rev["reviews"]) => onChange({ ...v, reviews: rows });
  const setRow = (i: number, k: keyof Rev["reviews"][number], x: string | number) => setRows(v.reviews.map((r, j) => (j === i ? { ...r, [k]: x } : r)));
  const listed = v.reviews.filter((r) => r.text.trim());
  const avg = listed.length ? listed.reduce((a, r) => a + r.stars, 0) / listed.length : 0;
  return (
    <section>
      <Head label="Tasting note and reviews" right={listed.length ? `${avg.toFixed(1)} ★ · ${listed.length} review${listed.length === 1 ? "" : "s"}` : "No customer reviews yet"} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
        <F label="Tasting note" hint="Shown with the coffee's reviews (and in the Coffee Lab's details drawer for green lots). Leave empty for none.">
          <textarea value={g.note} onChange={(e) => setGrader("note", e.target.value)} rows={4} maxLength={600} placeholder="Cocoa and toasted hazelnut up front, then…" style={{ ...input, resize: "vertical", lineHeight: 1.5 }} />
        </F>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 150px" }}><F label="Signed"><input value={g.who} onChange={(e) => setGrader("who", e.target.value)} placeholder="Zak D." maxLength={40} style={input} /></F></div>
          <div style={{ flex: "1 1 150px" }}><F label="Role (optional)"><input value={g.role ?? ""} onChange={(e) => setGrader("role", e.target.value)} placeholder="Head roaster" maxLength={40} style={input} /></F></div>
          <div style={{ flex: "0 1 110px" }}><F label="Score (optional)"><input value={g.score ?? ""} onChange={(e) => setGrader("score", e.target.value)} placeholder="86.5" maxLength={12} style={monoInput} /></F></div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
        <span style={CO.over({ fontSize: 9.5, color: "var(--ink-muted)" })}>Customer reviews</span>
        {v.reviews.length === 0 && <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-subtle)" }}>None yet. Stars and a review count only show on the site once there&rsquo;s at least one.</p>}
        {v.reviews.map((r, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, border: "1px solid var(--hairline)", borderRadius: "var(--r-md)" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: "1 1 130px" }}><F label="Name"><input value={r.who} onChange={(e) => setRow(i, "who", e.target.value)} placeholder="Jordan P." maxLength={40} style={input} /></F></div>
              <div style={{ flex: "1 1 130px" }}><F label="Brew"><input value={r.brew} onChange={(e) => setRow(i, "brew", e.target.value)} list="gc-brews" placeholder="Pour-over" maxLength={30} style={input} /></F></div>
              <div style={{ flex: "0 0 96px" }}><F label="Stars"><select value={r.stars} onChange={(e) => setRow(i, "stars", +e.target.value)} style={input}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}</select></F></div>
              <button type="button" onClick={() => setRows(v.reviews.filter((_, j) => j !== i))} aria-label={`Remove review ${i + 1}`} style={{ height: 38, padding: "0 10px", border: "1px solid var(--hairline-strong)", borderRadius: "var(--r-sm)", background: "var(--surface)", color: "var(--ink-muted)", cursor: "pointer" }}><Icon name="x" size={14} stroke={2} /></button>
            </div>
            <textarea aria-label="Review" value={r.text} onChange={(e) => setRow(i, "text", e.target.value)} rows={2} maxLength={500} placeholder="What they said, in their words." style={{ ...input, resize: "vertical", lineHeight: 1.5 }} />
          </div>
        ))}
        <datalist id="gc-brews">{BREWS.map((b) => <option key={b} value={b} />)}</datalist>
        <div><Btn size="sm" variant="secondary" iconLeft={<Icon name="plus" size={14} stroke={2.2} />} onClick={() => setRows([...v.reviews, { who: "", brew: "", stars: 5, text: "" }])}>Add a review</Btn></div>
        <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 11.5, lineHeight: 1.5, color: "var(--ink-subtle)" }}>Only add reviews customers actually wrote. The average and count are worked out from this list.</p>
      </div>
    </section>
  );
}

