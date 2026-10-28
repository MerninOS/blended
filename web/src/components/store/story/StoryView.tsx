// The Our Story page (design: One Two Our Story.html): a full-screen photo hero, where One Two came from
// beside a sticky photo, a full-width photo, the dark "1:2" section on what the name means, where we're
// headed now, and a closing photo with the Austin pop-up invite. Every word and photo is
// edited in Sanity (/studio → Our story page).
import Image from "next/image";
import Link from "next/link";
import type { Pic } from "@/lib/landing";
import type { Button } from "@/lib/landing-copy";
import { headlineRuns } from "@/lib/landing-copy";
import type { StoryPageData } from "@/lib/story";

function Headline({ text }: { text: string }) {
  return <>{headlineRuns(text).map((line, i) => (
    <span key={i}>{i > 0 && <br />}{line.map((r, j) => r.hi ? <span key={j} className="os-c">{r.t}</span> : r.t)}</span>
  ))}</>;
}

/** A filling photo kept on its focal point; with none set, the frame stays empty. */
function Photo({ pic, sizes, priority }: { pic: Pic | null; sizes: string; priority?: boolean }) {
  if (!pic) return null;
  return <Image src={pic.src} alt={pic.alt ?? ""} fill sizes={sizes} priority={priority} className="os-fill" style={{ objectFit: "cover", objectPosition: pic.pos }} />;
}

function Cta({ b }: { b: Button }) {
  const href = b.link.trim() || "/coffees";
  if (href.startsWith("/") && !href.startsWith("//")) return <Link className="os-btn milk" href={href}>{b.label}</Link>;
  return <a className="os-btn milk" href={href}>{b.label}</a>;
}

const Paras = ({ list }: { list: string[] }) => <>{list.map((p, i) => <p key={i} className="os-p">{p}</p>)}</>;

/** "1:2" with its colon in the accent color. */
function Ratio({ text }: { text: string }) {
  const i = text.indexOf(":");
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<span className="os-c">:</span>{text.slice(i + 1)}</>;
}

export function StoryView({ data }: { data: StoryPageData }) {
  const { copy: c, media: m } = data;
  return (
    <div className="os-root">
      <section className="os-dark os-hero" aria-labelledby="os-h">
        <Photo pic={m.hero} sizes="100vw" priority />
        <div className="os-shade" />
        <div className="os-hero-in"><div className="os-wrap">
          <span className="os-over" style={{ color: "var(--os-steel)" }}>{c.hero.eyebrow}</span>
          <h1 id="os-h" className="os-disp" style={{ fontSize: "clamp(48px,8vw,128px)", maxWidth: "12ch" }}><Headline text={c.hero.headline} /></h1>
          {c.hero.body && <p className="os-p" style={{ fontSize: "clamp(18px,1.6vw,22px)", color: "var(--os-milk)" }}>{c.hero.body}</p>}
          <div className="os-acts"><Cta b={c.hero.button} /></div>
        </div></div>
      </section>

      <section className="os-sec os-dashed" aria-labelledby="os-story-h">
        <div className="os-wrap os-row">
          <div className="os-stick">
            <span className="os-over os-lbl"><b>01</b>{c.story.eyebrow}</span>
            <h2 id="os-story-h" className="os-disp" style={{ fontSize: "clamp(40px,5vw,80px)" }}><Headline text={c.story.headline} /></h2>
            <div>
              <div className="os-ph" style={{ aspectRatio: "4/5" }}><Photo pic={m.start} sizes="(max-width:900px) 100vw, 40vw" /></div>
              {c.story.caption && <div className="os-cap">{c.story.caption}</div>}
            </div>
          </div>
          <div className="os-prose">
            <Paras list={c.story.before} />
            <div className="os-pair" style={{ margin: "1.2em 0" }}>
              <div className="os-ph" style={{ aspectRatio: "4/3" }}><Photo pic={m.pairLeft} sizes="(max-width:520px) 100vw, 34vw" /></div>
              <div className="os-ph" style={{ aspectRatio: "3/4" }}><Photo pic={m.pairRight} sizes="(max-width:520px) 100vw, 24vw" /></div>
            </div>
            <Paras list={c.story.after} />
          </div>
        </div>
      </section>

      <div className="os-bleed"><Photo pic={m.band} sizes="100vw" /></div>

      <section className="os-dark os-sec" aria-labelledby="os-name-h">
        <div className="os-wrap">
          <span className="os-over os-lbl" style={{ color: "var(--os-steel)" }}><b>02</b>{c.meaning.eyebrow}</span>
          <h2 id="os-name-h" className="os-ratio" style={{ marginTop: "clamp(40px,5vw,72px)" }}><Ratio text={c.meaning.ratio} /></h2>
          <div className="os-means">
            <div>
              <span className="os-over" style={{ color: "var(--os-steel)" }}>{c.meaning.ratioTitle}</span>
              <p className="os-p">{c.meaning.ratioBody}</p>
              <div style={{ marginTop: 8 }}>
                <div className="os-bar" role="img" aria-label={`${c.meaning.barIn} to ${c.meaning.barOut}`}><i /></div>
                <div className="os-bar-l"><span>{c.meaning.barIn}</span><span>{c.meaning.barOut}</span></div>
              </div>
            </div>
            <div>
              <span className="os-over" style={{ color: "var(--os-steel)" }}>{c.meaning.tableTitle}</span>
              <p className="os-p">{c.meaning.tableBody}</p>
              <div className="os-ph" style={{ aspectRatio: "16/10", marginTop: 8 }}><Photo pic={m.table} sizes="(max-width:900px) 100vw, 45vw" /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="os-sec os-dashed" aria-labelledby="os-diff-h">
        <div className="os-wrap os-row flip" style={{ alignItems: "center" }}>
          <div className="os-ph" style={{ aspectRatio: "1/1" }}><Photo pic={m.now} sizes="(max-width:900px) 100vw, 55vw" /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <span className="os-over os-lbl"><b>03</b>{c.different.eyebrow}</span>
            <h2 id="os-diff-h" className="os-disp" style={{ fontSize: "clamp(40px,5vw,80px)" }}><Headline text={c.different.headline} /></h2>
            <div className="os-prose"><Paras list={c.different.body} /></div>
          </div>
        </div>
      </section>

      <section className="os-dark os-close" aria-labelledby="os-close-h">
        <Photo pic={m.closing} sizes="100vw" />
        <div className="os-shade" />
        <div className="os-wrap">
          <span className="os-over" style={{ color: "var(--os-steel)" }}>{c.closing.eyebrow}</span>
          <h2 id="os-close-h" className="os-disp" style={{ fontSize: "clamp(32px,4.4vw,68px)", maxWidth: "20ch" }}><Headline text={c.closing.headline} /></h2>
          {c.closing.body && <p className="os-p" style={{ color: "var(--os-milk)", fontSize: 18 }}>{c.closing.body}</p>}
          <div className="os-acts"><Cta b={c.closing.button} /></div>
        </div>
      </section>
    </div>
  );
}
