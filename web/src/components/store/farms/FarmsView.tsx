// The farms page (design: Our Farms.html): a photo hero with a jump-to-country index, a section per
// country with each farm's photos, story, spec sheet and the lots we buy from it, the processes our
// producers use, and a close into the Coffee Lab. Words, farms and photos come from Sanity (/studio).
import Image from "next/image";
import Link from "next/link";
import { anchorOf, type FarmsPageData, type FarmLot } from "@/lib/farms";
import type { Pic } from "@/lib/landing";
import { headlineRuns } from "@/lib/landing-copy";

const ROAST = ["Green", "Light", "Light", "Medium", "Medium-dark", "Dark"];
const roastWord = (r: number) => ROAST[Math.max(1, Math.min(5, Math.round(r)))];
const roastVar = (r: number) => `var(--roast-${Math.max(1, Math.min(5, Math.round(r)))})`;
const Arrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;

function Headline({ text }: { text: string }) {
  return <>{headlineRuns(text).map((line, i) => (
    <span key={i}>{i > 0 && <br />}{line.map((r, j) => r.hi ? <span key={j} style={{ color: "var(--brand)" }}>{r.t}</span> : r.t)}</span>
  ))}</>;
}

/** A filling photo kept on its focal point, or the empty slot the design shows until one is added. */
function Photo({ pic, sizes, label, priority }: { pic: Pic | null; sizes: string; label?: string; priority?: boolean }) {
  if (pic) return <Image src={pic.src} alt={pic.alt ?? ""} fill sizes={sizes} priority={priority} className="fm-fill" style={{ objectFit: "cover", objectPosition: pic.pos }} />;
  return (
    <div className="fm-empty" aria-hidden="true">
      <Image src="/brand/blended-mark.png" alt="" width={36} height={36} />
      {label && <span className="fm-over" style={{ fontSize: 9.5 }}>{label}</span>}
    </div>
  );
}

function LotRow({ lot }: { lot: FarmLot }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span className="fm-over" style={{ fontSize: 10, color: "var(--ink-subtle)", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="fm-dot" style={{ background: roastVar(lot.roast), width: 8, height: 8 }} />
        In the cup · {lot.name}{lot.exclusive && <span className="fm-tag">SMS exclusive</span>}
      </span>
      {lot.notes.length > 0 && <div className="fm-notes">{lot.notes.map((n) => <span key={n}>{n}</span>)}</div>}
    </div>
  );
}

export function FarmsView({ data }: { data: FarmsPageData }) {
  const { copy, countries } = data;
  let n = 0;
  return (
    <div className="fm-root">
      <section className="fm-hero" aria-labelledby="fm-h">
        <Photo pic={data.heroImage} sizes="100vw" priority />
        <div className="fm-shade" />
        <div className="fm-hero-copy"><div className="fm-wrap">
          <div className="fm-over" style={{ color: "rgba(255,255,255,.85)" }}><span style={{ color: "var(--brand)" }}>●</span> {copy.hero.eyebrow}</div>
          <h1 id="fm-h" className="fm-disp" style={{ fontSize: "clamp(52px,9vw,150px)", marginTop: 20 }}><Headline text={copy.hero.headline} /></h1>
          <p className="fm-lede">{copy.hero.body}</p>
          {countries.length > 1 && (
            <nav className="fm-index" aria-label="Jump to a country">
              {countries.map((c) => (
                <a key={c.anchor} href={`#${c.anchor}`}>
                  <span className="fm-over m" style={{ fontSize: 10 }}>{c.regions.join(" & ") || " "}</span>
                  <span className="n">{c.name}</span>
                  <span className="m">{c.farms.length} producer{c.farms.length === 1 ? "" : "s"}</span>
                </a>
              ))}
            </nav>
          )}
        </div></div>
      </section>

      <main className="fm-wrap" style={{ paddingTop: "clamp(48px,6vw,80px)" }}>
        {countries.map((c, ci) => (
          <section className="fm-country" id={c.anchor} key={c.anchor} aria-labelledby={`${c.anchor}-h`}>
            <div className="fm-chead">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <span className="fm-over" style={{ color: "var(--ink-muted)" }}>{String(ci + 1).padStart(2, "0")} · Origin</span>
                <h2 id={`${c.anchor}-h`} className="fm-disp" style={{ fontSize: "clamp(44px,6vw,96px)" }}>{c.name}</h2>
              </div>
              {c.lede && <p className="fm-clede">{c.lede}</p>}
            </div>
            {c.farms.map((f) => {
              const flip = n++ % 2 === 1;
              const lead = f.lots[0];
              const roasts = [...new Set(f.lots.map((l) => roastWord(l.roast)))];
              const spec = ([
                ["Producer", f.producer], ["Altitude", f.altitude], ["Varietal", f.varietal],
                ["Process", f.processes.length ? f.processes : null], ["Harvest", f.harvest], ["Our roast", roasts.length ? roasts.join(", ") : null],
              ] as const).filter(([, v]) => v && v.length);
              return (
                <article className={"fm-farm" + (flip ? " flip" : "")} id={f.anchor} key={f.id} aria-labelledby={`${f.anchor}-h`}>
                  <div className="fm-media">
                    <div className="fm-ph big"><Photo pic={f.photos[0]} sizes="(max-width:900px) 100vw, 36vw" label={f.producer ?? f.name} /></div>
                    <div className="fm-ph sq"><Photo pic={f.photos[1]} sizes="(max-width:900px) 34vw, 18vw" label="The farm" /></div>
                    <div className="fm-ph sq"><Photo pic={f.photos[2]} sizes="(max-width:900px) 34vw, 18vw" label="Processing" /></div>
                  </div>
                  <div className="fm-copy">
                    <span className="fm-over" style={{ color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 10 }}>
                      {lead && <span className="fm-dot" style={{ background: roastVar(lead.roast) }} />}
                      {[c.name, f.region, f.processes.join(" / ")].filter(Boolean).join(" · ")}
                    </span>
                    <h3 id={`${f.anchor}-h`} className="fm-disp" style={{ fontSize: "clamp(34px,3.8vw,60px)" }}>{f.name}</h3>
                    {f.story && <p>{f.story}</p>}
                    {spec.length > 0 && (
                      <dl className="fm-spec">
                        {spec.map(([k, v]) => (
                          <div key={k}><dt>{k}</dt><dd>{k === "Process" && Array.isArray(v)
                            ? v.map((p, i) => <span key={p}>{i > 0 && ", "}<a href={`#process-${anchorOf(p)}`}>{p}</a></span>)
                            : v}</dd></div>
                        ))}
                      </dl>
                    )}
                    {f.lots.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{f.lots.map((l) => <LotRow key={l.id} lot={l} />)}</div>}
                    <div className="fm-acts">
                      {lead?.shopHref && <Link className="fm-btn" href={lead.shopHref}>Shop {lead.shopName} <Arrow /></Link>}
                      <Link className={"fm-btn" + (lead?.shopHref ? " alt" : "")} href={lead?.labHref ?? "/lab#build"}>{lead ? "Blend with it" : "Open the Coffee Lab"}{!lead?.shopHref && <> <Arrow /></>}</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ))}
      </main>

      {copy.processes.items.length > 0 && (
        <section className="fm-dark fm-sec" id="process" aria-labelledby="fm-proc-h">
          <div className="fm-wrap">
            <div className="fm-head">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <span className="fm-over" style={{ color: "rgba(255,255,255,.66)" }}>{copy.processes.eyebrow}</span>
                <h2 id="fm-proc-h" className="fm-disp" style={{ fontSize: "clamp(44px,6vw,96px)" }}><Headline text={copy.processes.headline} /></h2>
              </div>
              {copy.processes.body && <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "rgba(255,255,255,.75)", maxWidth: "40ch" }}>{copy.processes.body}</p>}
            </div>
            <div className="fm-procs" style={{ ["--cols" as string]: Math.min(4, copy.processes.items.length) }}>
              {copy.processes.items.map((p) => (
                <div className="fm-proc" id={p.anchor} key={p.anchor}>
                  <div className="fm-ph"><Photo pic={p.image} sizes="(max-width:900px) 100vw, 25vw" label={`${p.name} process`} /></div>
                  <h3 className="fm-disp" style={{ fontSize: "clamp(30px,2.8vw,44px)" }}>{p.name}</h3>
                  {p.text && <p>{p.text}</p>}
                  {p.steps.length > 0 && <ol>{p.steps.map((s, i) => <li key={i}><b>{String(i + 1).padStart(2, "0")}</b>{s}</li>)}</ol>}
                  <span className="fm-over" style={{ fontSize: 10, color: "rgba(255,255,255,.6)" }}>
                    Used by: {p.farms.length ? p.farms.map((f, i) => <span key={f.anchor}>{i > 0 && ", "}<a href={`#${f.anchor}`} style={{ color: "#fff" }}>{f.name}</a></span>) : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="fm-close" aria-labelledby="fm-close-h">
        <div className="fm-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
          <h2 id="fm-close-h" className="fm-disp" style={{ fontSize: "clamp(48px,8vw,130px)" }}><Headline text={copy.closing.headline} /></h2>
          {copy.closing.body && <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--ink-muted)", maxWidth: "44ch" }}>{copy.closing.body}</p>}
          <div className="fm-acts" style={{ justifyContent: "center" }}>
            <Link className="fm-btn" href="/lab#build">Open the Coffee Lab</Link>
            <Link className="fm-btn alt" href="/coffees">Shop coffees</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
