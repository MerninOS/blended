"use client";
// Landing page (Blended Landing v2): ticker, transparent-to-solid header over a
// video hero, the Coffee Lab pitch, the farms, cherry-to-cup, the house blend,
// merch & gear, the green lineup, and a closing CTA. "Build your blend" deals a
// deck of sample blend cards before opening the Coffee Lab.
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import type { LandingData } from "@/lib/landing";
import type { ShopPolicy } from "@/lib/shop";
import { CookiePrefsLink } from "@/components/store/FooterClient";
import { LabIntro } from "./LabIntro";

const LAB = "/lab", BUILD = "/lab#build", SHOP = "/lab#coffees";

const Arrow = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;

const ORIGINS = [
  { id: "brazil", name: "Brazil", where: "Minas Gerais · 1,100 m", desc: "Sweet, low-acid naturals that give a blend its body and chocolate base." },
  { id: "colombia", name: "Colombia", where: "Huila & Tolima · 1,700 m", desc: "Washed lots and co-ferments with red fruit and a bright, clean finish." },
  { id: "ethiopia", name: "Ethiopia", where: "Guji · 2,000 m", desc: "Floral, tea-like coffees grown in the highlands by smallholder farmers." },
] as const;
const PROCESS = [
  ["01", "Harvest", "Cherries are picked by hand at peak ripeness."],
  ["02", "Process", "Washed, natural or co-fermented at the farm, then dried on raised beds."],
  ["03", "Roast", "We roast your blend to order in small batches, then rest it before packing."],
  ["04", "Brew", "It ships in your own bag, with the recipe on the card."],
] as const;

function HeroVideo({ src, poster }: { src: string | null; poster: string }) {
  const v = useRef<HTMLVideoElement>(null);
  const [ok, setOk] = useState(!!src), [playing, setPlaying] = useState(true), [ready, setReady] = useState(false);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches && v.current) { v.current.pause(); setPlaying(false); }
  }, []);
  const toggle = () => { const el = v.current; if (!el) return; if (el.paused) { void el.play(); setPlaying(true); } else { el.pause(); setPlaying(false); } };
  // The still shows immediately and stays up until the video is actually playing (or if it fails).
  const still = <Image src={poster} alt="" fill priority sizes="100vw" className="lp-fill" style={{ objectFit: "cover" }} />;
  if (!src || !ok) return still;
  return (<>
    {still}
    <video ref={v} className="lp-fill" src={src} autoPlay muted loop playsInline preload="auto"
      onPlaying={() => setReady(true)} onError={() => setOk(false)}
      style={{ opacity: ready ? 1 : 0, transition: "opacity 500ms var(--ease)" }} />
    <button type="button" onClick={toggle} aria-label={playing ? "Pause video" : "Play video"} className="lp-over"
      style={{ position: "absolute", right: "clamp(18px,4vw,48px)", bottom: 18, zIndex: 3, background: "transparent", border: "1px solid rgba(255,255,255,.6)", color: "#fff", height: 32, padding: "0 12px", borderRadius: "var(--r-sm)", fontSize: 10, cursor: "pointer" }}>
      {playing ? "Pause" : "Play"}
    </button>
  </>);
}

/** The Coffee Lab panel: a video if one is dropped in, otherwise the bag photo. */
function LabMedia({ video, image }: { video: string | null; image: string }) {
  const [ok, setOk] = useState(true);
  if (video && ok) return <video className="lp-fill" src={video} poster={image} autoPlay muted loop playsInline preload="auto" onError={() => setOk(false)} />;
  return <Image src={image} alt="A Blended bag with its blend card" fill sizes="(max-width:900px) 100vw, 50vw" style={{ objectFit: "cover" }} />;
}

export function Landing({ data, policies }: { data: LandingData; policies: ShopPolicy[] }) {
  const router = useRouter();
  const [solid, setSolid] = useState(false);
  const [intro, setIntro] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    const f = () => setSolid(scrollY > innerHeight - 120);
    f(); addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);
  // Coming back from the lab with the back button: don't leave the intro up.
  useEffect(() => {
    const f = (e: PageTransitionEvent) => { if (e.persisted) { busy.current = false; setIntro(false); } };
    addEventListener("pageshow", f); return () => removeEventListener("pageshow", f);
  }, []);
  useEffect(() => { router.prefetch(LAB); }, [router]);

  const toLab = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); if (busy.current) return; busy.current = true;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || data.intro.length < 2) { router.push(LAB); return; }
    setIntro(true);
  };

  const extras = [
    { t: "Build your blend" },
    ...(data.merchUrl ? [{ t: "New merch" }] : []), ...(data.gearUrl ? [{ t: "Brew gear" }] : []),
    { t: "Free shipping over $50" },
  ];
  const tickItems: { t: string; dot?: string }[] = [...data.lineup.map((c) => ({ t: c.name, dot: c.color })), ...extras];
  const shopMore = [
    data.merchUrl && { id: "merch", t: "Merch", d: "Hats, tees and patches from the roastery.", cta: "Shop merch", href: data.merchUrl, img: data.media.merch },
    data.gearUrl && { id: "gear", t: "Brew gear", d: "The grinders, kettles and drippers we use on our own bar.", cta: "Shop gear", href: data.gearUrl, img: data.media.gear },
  ].filter(Boolean) as { id: string; t: string; d: string; cta: string; href: string; img: string | null }[];
  const disp = (fontSize: string): CSSProperties => ({ fontSize });

  return (
    <div className="lp-root">
      {tickItems.length > 0 && (
        <div className="lp-tick" aria-hidden="true">
          <div className="lp-tick-row lp-over" style={{ fontSize: 10.5 }}>
            {[0, 1].map((k) => (
              <span key={k}>{tickItems.map((n, i) => (
                <i key={i}>{n.dot ? <span className="lp-dot" style={{ background: n.dot, width: 7, height: 7 }} /> : <span style={{ color: "var(--brand)" }}>+</span>}{n.t}</i>
              ))}</span>
            ))}
          </div>
        </div>
      )}

      <header className={"lp-bar" + (solid ? " solid" : "")}>
        <div className="lp-wrap">
          <Link className="lp-logo" href="/" aria-label="Blended home">
            <Image src="/brand/blended-mark.png" alt="" width={24} height={24} />BLENDED
          </Link>
          <nav className="lp-nav lp-over" aria-label="Main">
            <Link className="lp-link" href={SHOP}>Coffees</Link>
            <a className="lp-link" href="#farmers">Farmers</a>
            {data.merchUrl && <a className="lp-link" href="#shop-more">Merch</a>}
            {data.gearUrl && <a className="lp-link" href="#shop-more">Gear</a>}
            <Link className="lp-link" href="/wholesale">Wholesale</Link>
            <a className="lp-btn sm" href={LAB} onClick={toLab}>Build a blend</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="lp-hero" aria-label="Build your blend">
          <HeroVideo src={data.media.heroVideo} poster={data.media.heroPoster} />
          <div className="lp-shade" />
          <div className="lp-hero-copy">
            <div className="lp-wrap" style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "flex-start" }}>
              <div className="lp-over" style={{ color: "rgba(255,255,255,.85)" }}><span style={{ color: "var(--brand)" }}>●</span> Sourced direct · Roasted to order</div>
              <h1 className="lp-disp" style={{ fontSize: "clamp(40px,min(8.5vw,14.5vw),150px)", color: "#fff", lineHeight: .92 }}>Build<br /><span style={{ whiteSpace: "nowrap" }}>your <span style={{ color: "var(--brand)" }}>blend.</span></span></h1>
              <p style={{ fontSize: "clamp(16px,1.4vw,19px)", lineHeight: 1.5, margin: 0, maxWidth: "40ch", color: "rgba(255,255,255,.88)", textWrap: "pretty" }}>Coffee from farmers we know by name. Pick up to four, set the ratios, and we roast it to order in your own bag.</p>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px 28px", marginTop: 8 }}>
                <a className="lp-btn lg light" href={LAB} onClick={toLab}>Build your blend <Arrow /></a>
                <Link className="lp-over" href={SHOP} style={{ color: "#fff", borderBottom: "1px solid currentColor", paddingBottom: 3 }}>Shop our coffees</Link>
              </div>
            </div>
          </div>
          <div className="lp-scroll lp-over" aria-hidden="true">Scroll<svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l6 6 6-6" /></svg></div>
        </section>

        <section className="lp-feat" aria-labelledby="lp-lab-h">
          <div className="lp-hero-art"><LabMedia video={data.media.labVideo} image={data.media.labImage} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <span className="lp-over" style={{ color: "var(--ink-muted)" }}>The Coffee Lab</span>
            <h2 id="lp-lab-h" className="lp-disp" style={disp("clamp(56px,8vw,128px)")}>Your<br />ratios.<br /><span style={{ color: "var(--brand)" }}>Your<br />coffee.</span></h2>
            <div className="lp-notes"><span>Up to 4 coffees</span><span>Any ratio</span><span>Your name on the bag</span></div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--ink-muted)", maxWidth: "46ch", textWrap: "pretty" }}>Start with a base, add something bright, move the sliders. The tasting wheel and roast level update as the blend changes. When it tastes right, name it and we roast it.</p>
            <div><a className="lp-btn lg" href={LAB} onClick={toLab}>Open the Coffee Lab <Arrow /></a></div>
          </div>
        </section>

        <section id="farmers" className="lp-dark lp-sec" aria-labelledby="lp-farms-h">
          <div className="lp-wrap">
            <div className="lp-head">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <span className="lp-over" style={{ color: "rgba(255,255,255,.66)" }}>Where it comes from</span>
                <h2 id="lp-farms-h" className="lp-disp" style={disp("clamp(44px,6vw,96px)")}>The farms</h2>
              </div>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "rgba(255,255,255,.75)", maxWidth: "38ch" }}>Every lot in the lineup names the farm and the people who grew it.</p>
            </div>
            <div className="lp-origins">
              {ORIGINS.map((o) => (
                <div className="lp-tile" key={o.id}>
                  <Image src={data.media.origins[o.id]} alt="" fill sizes="(max-width:980px) 78vw, 34vw" style={{ objectFit: "cover" }} />
                  <div className="lp-shade" />
                  <div className="lp-cap">
                    <span className="lp-over" style={{ color: "rgba(255,255,255,.75)", fontSize: 10.5 }}>{o.where}</span>
                    <h3 className="lp-disp" style={disp("clamp(36px,3.6vw,56px)")}>{o.name}</h3>
                    <p>{o.desc}</p>
                    <Link className="lp-over" href={BUILD} style={{ color: "#fff", fontSize: 10.5, display: "inline-flex", gap: 8, alignItems: "center", marginTop: 4 }}>Blend with {o.name} <Arrow /></Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-sec" aria-labelledby="lp-proc-h">
          <div className="lp-wrap">
            <div className="lp-head">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <span className="lp-over" style={{ color: "var(--ink-muted)" }}>The process</span>
                <h2 id="lp-proc-h" className="lp-disp" style={disp("clamp(44px,6vw,96px)")}>Cherry to cup</h2>
              </div>
            </div>
            <div className="lp-steps">
              {PROCESS.map(([n, t, d], i) => (
                <div className="lp-step" key={n}>
                  <div style={{ position: "relative", aspectRatio: "4/5", background: "var(--surface-sunken)", borderRadius: "var(--r-sm)", overflow: "hidden" }}>
                    <Image src={data.media.steps[i]} alt="" fill sizes="(max-width:560px) 100vw, (max-width:980px) 50vw, 25vw" style={{ objectFit: "cover" }} />
                  </div>
                  <span className="lp-num">{n}</span>
                  <h3 className="lp-disp" style={disp("clamp(30px,2.8vw,44px)")}>{t}</h3>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {data.house && (
          <section className="lp-band" aria-labelledby="lp-house-h">
            <Image src={data.media.band} alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
            <div className="lp-shade" />
            <div className="lp-band-copy">
              <div className="lp-wrap" style={{ width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 560, alignItems: "flex-start" }}>
                  <span className="lp-over" style={{ color: "rgba(255,255,255,.8)" }}>House blend · This month</span>
                  <h2 id="lp-house-h" className="lp-disp lp-band-title" style={disp("clamp(52px,7vw,112px)")}>{data.house.title.split(" + ")[0]}<br />+ {data.house.title.split(" + ")[1]}</h2>
                  {data.house.notes.length > 0 && <div className="lp-notes" style={{ color: "#fff" }}>{data.house.notes.map((n) => <span key={n}>{n}</span>)}</div>}
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,.86)", maxWidth: "44ch" }}>{data.house.copy}</p>
                  <Link className="lp-btn lg light" href={data.house.href}>Start from this blend <Arrow /></Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {shopMore.length > 0 && (
          <section id="shop-more" className="lp-sec" aria-label="Merch and gear">
            <div className={"lp-wrap" + (shopMore.length > 1 ? " lp-two" : "")}>
              {shopMore.map((x) => (
                <div className="lp-tile" key={x.id} style={{ aspectRatio: shopMore.length > 1 ? "1/1" : "16/7" }}>
                  {x.img && <Image src={x.img} alt="" fill sizes="(max-width:900px) 100vw, 50vw" style={{ objectFit: "cover" }} />}
                  <div className="lp-shade" />
                  <div className="lp-cap" style={{ alignItems: "center", textAlign: "center" }}>
                    <h3 className="lp-disp" style={disp("clamp(34px,3.6vw,56px)")}>{x.t}</h3>
                    <p>{x.d}</p>
                    <a className="lp-btn ghost" href={x.href} style={{ alignSelf: "center", marginTop: 6 }}>{x.cta}</a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.lineup.length > 0 && (
          <section aria-labelledby="lp-lineup-h" style={{ borderTop: "1px solid var(--hairline)" }}>
            <div className="lp-wrap" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap", padding: "clamp(48px,6vw,80px) clamp(18px,4vw,48px) 28px" }}>
              <h2 id="lp-lineup-h" className="lp-disp" style={disp("clamp(40px,5vw,72px)")}>The lineup</h2>
              <span className="lp-over" style={{ color: "var(--ink-muted)" }}>Mix any of these · 100 g minimum each</span>
            </div>
            <div style={{ borderTop: "1px solid var(--ink)" }}>
              {data.lineup.map((c) => (
                <Link className="lp-row" key={c.id} href={BUILD}>
                  <span className="lp-mono c-code">{c.code}</span>
                  <span className="nm">{c.name}</span>
                  <span className="lp-mono c-origin">{c.origin}</span>
                  <span className="lp-mono c-proc">{c.process}</span>
                  <span className="c-roast" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}><span className="lp-dot" style={{ background: c.color }} /><span className="lp-mono">{c.label}</span></span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="lp-close" aria-labelledby="lp-close-h">
          <div className="lp-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
            <h2 id="lp-close-h" className="lp-disp" style={disp("clamp(52px,9vw,150px)")}>Your coffee,<br /><span style={{ color: "var(--brand)" }}>your ratios.</span></h2>
            <a className="lp-btn lg" href={LAB} onClick={toLab}>Start building <Arrow /></a>
          </div>
        </section>
      </main>

      <footer className="lp-foot">
        <div className="lp-wrap lp-over" style={{ fontSize: 10.5 }}>
          <span style={{ color: "var(--ink)" }}>Blended</span><span>Whole bean · Roasted to order</span><span>Free shipping over $50</span>
          <span style={{ marginLeft: "auto", display: "flex", gap: "12px 24px", flexWrap: "wrap" }}>
            <Link href={SHOP}>Our coffees</Link>
            <Link href="/wholesale">Wholesale</Link>
            {policies.map((p) => <Link key={p.handle} href={`/policies/${p.handle}`}>{p.title}</Link>)}
            <CookiePrefsLink style={{ font: "inherit", letterSpacing: "inherit", textTransform: "inherit", color: "inherit" }} />
          </span>
        </div>
      </footer>
      {intro && <LabIntro blends={data.intro} onDone={() => router.push(LAB)} />}
    </div>
  );
}
