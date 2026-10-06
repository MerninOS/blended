"use client";
// Landing page (Blended Landing v2): ticker, transparent-to-solid header over a
// video hero, the Coffee Lab pitch, the farms, cherry-to-cup, the house blend,
// merch & gear, the green lineup, and a closing CTA. "Build your blend" deals a
// deck of sample blend cards before opening the Coffee Lab.
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import type { LandingData, Pic } from "@/lib/landing";
import { headlineRuns, plainHeadline, type Button } from "@/lib/landing-copy";
import type { ShopPolicy } from "@/lib/shop";
import { CookiePrefsLink } from "@/components/store/FooterClient";
import { CartDrawer } from "@/components/store/CartDrawer";
import { cartStore, useCart } from "@/components/store/cart-store";
import { Icon } from "@/components/ui/Icon";
import { LabIntro } from "./LabIntro";
import { loadBagModel } from "@/components/store/box3d";

function LandingCart() {
  const { items } = useCart();
  const n = items.reduce((a, x) => a + x.qty, 0);
  return (
    <button type="button" className="lp-cart lp-over" onClick={() => cartStore.setOpen(true)} aria-label={`Cart, ${n} item${n === 1 ? "" : "s"}`}>
      <Icon name="pkg" size={15} stroke={2} />
      <span className="lp-cart-label">Cart</span>
      <span className="lp-cart-n" data-n={n}>{n}</span>
    </button>
  );
}

const LAB = "/lab", BUILD = "/lab#build", SHOP = "/coffees";

const Arrow = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;

/** A headline from the copy: new lines break, *asterisked* words are orange. */
function Headline({ text }: { text: string }) {
  return <>{headlineRuns(text).map((line, i) => (
    <span key={i}>{i > 0 && <br />}{line.map((r, j) => r.hi ? <span key={j} style={{ color: "var(--brand)" }}>{r.t}</span> : r.t)}</span>
  ))}</>;
}

/** A filling photo, kept on its focal point when cropped. */
const Photo = ({ pic, sizes, priority, alt = "" }: { pic: Pic; sizes: string; priority?: boolean; alt?: string }) => (
  <Image src={pic.src} alt={pic.alt ?? alt} fill priority={priority} sizes={sizes} className="lp-fill" style={{ objectFit: "cover", objectPosition: pic.pos }} />
);

function HeroVideo({ src, poster }: { src: string | null; poster: Pic }) {
  const v = useRef<HTMLVideoElement>(null);
  const [ok, setOk] = useState(!!src), [playing, setPlaying] = useState(true), [ready, setReady] = useState(false);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches && v.current) { v.current.pause(); setPlaying(false); }
  }, []);
  const toggle = () => { const el = v.current; if (!el) return; if (el.paused) { void el.play(); setPlaying(true); } else { el.pause(); setPlaying(false); } };
  // The still shows immediately and stays up until the video is actually playing (or if it fails).
  const still = <Photo pic={poster} priority sizes="100vw" />;
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
function LabMedia({ video, image }: { video: string | null; image: Pic }) {
  const [ok, setOk] = useState(true);
  if (video && ok) return <video className="lp-fill" src={video} poster={image.src} autoPlay muted loop playsInline preload="auto" onError={() => setOk(false)} style={{ objectFit: "cover", objectPosition: image.pos }} />;
  return <Photo pic={image} alt="A Blended bag with its blend card" sizes="(max-width:900px) 100vw, 50vw" />;
}

export function Landing({ data, policies }: { data: LandingData; policies: ShopPolicy[] }) {
  const router = useRouter();
  const c = data.copy;
  const [solid, setSolid] = useState(false);
  const [intro, setIntro] = useState(false);
  const [menu, setMenu] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    if (!menu) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    // The menu only exists below the desktop breakpoint; widening the window closes it.
    const wide = matchMedia("(min-width: 1101px)"), w = () => { if (wide.matches) setMenu(false); };
    addEventListener("keydown", k); wide.addEventListener("change", w);
    return () => { removeEventListener("keydown", k); wide.removeEventListener("change", w); };
  }, [menu]);

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

  // Start the 3D bag downloading as soon as someone heads for the lab (hover, touch, focus or
  // click): it's kept in memory, so the lab opens with the model already loaded.
  const warm = () => { void loadBagModel(); };
  // Where the intro lands: the link's own path (/lab, /lab#build, /lab?blend=…).
  const labDest = useRef(LAB);
  const toLab = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); warm(); if (busy.current) return; busy.current = true;
    const u = new URL(e.currentTarget.href, location.href);
    labDest.current = u.origin === location.origin ? u.pathname + u.search + u.hash : LAB;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || data.intro.length < 2) { router.push(labDest.current); return; }
    setIntro(true);
  };
  /** A button from the copy: a link into the lab plays the intro, other site paths are client-side links. */
  const cta = (b: Button, className: string) => {
    const href = b.link.trim() || LAB;
    const inner = <>{b.label} <Arrow /></>;
    if (/^\/lab(?=$|[/?#])/.test(href)) return <a className={className} href={href} onClick={toLab} onPointerEnter={warm} onTouchStart={warm} onFocus={warm}>{inner}</a>;
    if (href.startsWith("/") && !href.startsWith("//")) return <Link className={className} href={href}>{inner}</Link>;
    return <a className={className} href={href}>{inner}</a>;
  };

  const extras = [
    { t: "Build your blend" },
    ...(data.merchUrl ? [{ t: "New merch" }] : []), ...(data.gearUrl ? [{ t: "Brew gear" }] : []),
    { t: c.smallPrint.shipping },
  ];
  const tickItems: { t: string; dot?: string }[] = [...data.lineup.map((c) => ({ t: c.name, dot: c.color })), ...extras];
  const shopMore = [
    data.merchUrl && { id: "merch", t: c.merch.title, d: c.merch.text, cta: c.merch.cta, href: data.merchUrl, img: data.media.merch },
    data.gearUrl && { id: "gear", t: c.gear.title, d: c.gear.text, cta: c.gear.cta, href: data.gearUrl, img: data.media.gear },
  ].filter(Boolean) as { id: string; t: string; d: string; cta: string; href: string; img: Pic | null }[];
  const menuItems: { t: string; d: string; href: string; lab?: boolean }[] = [
    { t: "Build a blend", d: "Mix up to four coffees, set the roast", href: LAB, lab: true },
    { t: "Our coffees", d: "Single origins and house blends", href: SHOP },
    ...(data.merchUrl ? [{ t: "Merch", d: "Caps, tees and mugs from the roastery", href: data.merchUrl }] : []),
    ...(data.gearUrl ? [{ t: "Brew gear", d: "The gear we use on our own bar", href: data.gearUrl }] : []),
    { t: "Farmers", d: "Where our green coffee comes from", href: "#farmers" },
    { t: "Wholesale", d: "Cafés and private label · 5 lb minimum", href: "/wholesale" },
  ];
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

      <header className={"lp-bar" + (solid || menu ? " solid" : "") + (solid ? " scrolled" : "")}>
        <div className="lp-wrap">
          <Link className="lp-logo" href="/" aria-label="Blended home">
            <Image src="/brand/blended-mark.png" alt="" width={24} height={24} />BLENDED
          </Link>
          <nav className="lp-nav lp-over" aria-label="Main">
            <Link className="lp-link" href={SHOP}>Coffees</Link>
            <a className="lp-link" href="#farmers">Farmers</a>
            {data.merchUrl && <a className="lp-link" href={data.merchUrl}>Merch</a>}
            {data.gearUrl && <a className="lp-link" href={data.gearUrl}>Gear</a>}
            <Link className="lp-link" href="/wholesale">Wholesale</Link>
          </nav>
          <div className="lp-actions">
            <a className="lp-btn sm lp-cta" href={LAB} onClick={toLab} onPointerEnter={warm} onTouchStart={warm} onFocus={warm}>Build a blend</a>
            <LandingCart />
            <button type="button" className="lp-burger" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="lp-menu" onClick={() => setMenu((m) => !m)}>
              <span className="sf-burger-lines" data-open={menu}><span></span><span></span><span></span></span>
            </button>
          </div>
        </div>
        {menu && <>
          <nav id="lp-menu" className="lp-menu" aria-label="Menu">
            {menuItems.map((m) => (
              <a key={m.t} className="lp-menu-item" href={m.href} onClick={(e) => { setMenu(false); if (m.lab) toLab(e); }} onTouchStart={m.lab ? warm : undefined} onPointerEnter={m.lab ? warm : undefined}>
                <span>{m.t}</span><span className="lp-menu-note">{m.d}</span>
              </a>
            ))}
          </nav>
        </>}
      </header>
      {menu && <div className="lp-menu-scrim" onClick={() => setMenu(false)} />}

      <main>
        <section className="lp-hero" aria-label={plainHeadline(c.hero.headline)}>
          <HeroVideo src={data.media.heroVideo} poster={data.media.heroPoster} />
          <div className="lp-shade" />
          <div className="lp-hero-copy">
            <div className="lp-wrap" style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "flex-start" }}>
              <div className="lp-over" style={{ color: "rgba(255,255,255,.85)" }}><span style={{ color: "var(--brand)" }}>●</span> {c.hero.eyebrow}</div>
              <h1 className="lp-disp" style={{ fontSize: "clamp(38px,7vw,112px)", color: "#fff", lineHeight: .95 }}><Headline text={c.hero.headline} /></h1>
              <p style={{ fontSize: "clamp(16px,1.4vw,19px)", lineHeight: 1.5, margin: 0, maxWidth: "44ch", color: "rgba(255,255,255,.88)", textWrap: "pretty" }}>{c.hero.body}</p>
              <div className="lp-hero-ctas" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 8 }}>
                {cta(c.hero.primaryButton, "lp-btn lg light")}
                {cta(c.hero.secondaryButton, "lp-btn lg ghost")}
              </div>
            </div>
          </div>
          <div className="lp-scroll lp-over" aria-hidden="true">Scroll<svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l6 6 6-6" /></svg></div>
        </section>

        <section className="lp-feat" aria-labelledby="lp-lab-h">
          <div className="lp-hero-art"><LabMedia video={data.media.labVideo} image={data.media.labImage} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <span className="lp-over" style={{ color: "var(--ink-muted)" }}>{c.lab.eyebrow}</span>
            <h2 id="lp-lab-h" className="lp-disp" style={disp("clamp(56px,8vw,128px)")}><Headline text={c.lab.headline} /></h2>
            {c.lab.chips.length > 0 && <div className="lp-notes">{c.lab.chips.map((t, i) => <span key={i}>{t}</span>)}</div>}
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--ink-muted)", maxWidth: "46ch", textWrap: "pretty" }}>{c.lab.body}</p>
            <div><a className="lp-btn lg" href={LAB} onClick={toLab} onPointerEnter={warm} onTouchStart={warm} onFocus={warm}>{c.lab.cta} <Arrow /></a></div>
          </div>
        </section>

        <section id="farmers" className="lp-dark lp-sec" aria-labelledby="lp-farms-h">
          <div className="lp-wrap">
            <div className="lp-head">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <span className="lp-over" style={{ color: "rgba(255,255,255,.66)" }}>{c.farms.eyebrow}</span>
                <h2 id="lp-farms-h" className="lp-disp" style={disp("clamp(44px,6vw,96px)")}><Headline text={c.farms.headline} /></h2>
              </div>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "rgba(255,255,255,.75)", maxWidth: "38ch" }}>{c.farms.body}</p>
            </div>
            <div className="lp-origins">
              {c.farms.origins.map((o, i) => (
                <div className="lp-tile" key={i}>
                  {data.media.origins[i] && <Photo pic={data.media.origins[i]} sizes="(max-width:980px) 78vw, 34vw" />}
                  <div className="lp-shade" />
                  <div className="lp-cap">
                    <span className="lp-over" style={{ color: "rgba(255,255,255,.75)", fontSize: 10.5 }}>{o.where}</span>
                    <h3 className="lp-disp" style={disp("clamp(36px,3.6vw,56px)")}>{o.name}</h3>
                    <p>{o.text}</p>
                    <Link className="lp-over" href={SHOP} style={{ color: "#fff", fontSize: 10.5, display: "inline-flex", gap: 8, alignItems: "center", marginTop: 4 }}>{c.farms.linkLabel} <Arrow /></Link>
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
                <span className="lp-over" style={{ color: "var(--ink-muted)" }}>{c.process.eyebrow}</span>
                <h2 id="lp-proc-h" className="lp-disp" style={disp("clamp(44px,6vw,96px)")}><Headline text={c.process.headline} /></h2>
              </div>
            </div>
            <div className="lp-steps">
              {c.process.steps.map((st, i) => (
                <div className="lp-step" key={i}>
                  <div style={{ position: "relative", aspectRatio: "4/5", background: "var(--surface-sunken)", borderRadius: "var(--r-sm)", overflow: "hidden" }}>
                    {data.media.steps[i] && <Photo pic={data.media.steps[i]} sizes="(max-width:560px) 100vw, (max-width:980px) 50vw, 25vw" />}
                  </div>
                  <span className="lp-num">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="lp-disp" style={disp("clamp(30px,2.8vw,44px)")}>{st.title}</h3>
                  <p>{st.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {data.house && (
          <section className="lp-band" aria-labelledby="lp-house-h">
            <Photo pic={data.media.band} sizes="100vw" />
            <div className="lp-shade" />
            <div className="lp-band-copy">
              <div className="lp-wrap" style={{ width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 560, alignItems: "flex-start" }}>
                  <span className="lp-over" style={{ color: "rgba(255,255,255,.8)" }}>{c.house.eyebrow}</span>
                  <h2 id="lp-house-h" className="lp-disp lp-band-title" style={disp("clamp(52px,7vw,112px)")}>{data.house.title.split(" + ")[0]}<br />+ {data.house.title.split(" + ")[1]}</h2>
                  {data.house.notes.length > 0 && <div className="lp-notes" style={{ color: "#fff" }}>{data.house.notes.map((n) => <span key={n}>{n}</span>)}</div>}
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,.86)", maxWidth: "44ch" }}>{data.house.copy}</p>
                  <Link className="lp-btn lg light" href={data.house.href}>{c.house.cta} <Arrow /></Link>
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
                  {x.img && <Photo pic={x.img} sizes="(max-width:900px) 100vw, 50vw" />}
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
              <h2 id="lp-lineup-h" className="lp-disp" style={disp("clamp(40px,5vw,72px)")}><Headline text={c.lineup.headline} /></h2>
              <span className="lp-over" style={{ color: "var(--ink-muted)" }}>{c.lineup.note}</span>
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
            <h2 id="lp-close-h" className="lp-disp" style={disp("clamp(52px,9vw,150px)")}><Headline text={c.closing.headline} /></h2>
            <a className="lp-btn lg" href={LAB} onClick={toLab} onPointerEnter={warm} onTouchStart={warm} onFocus={warm}>{c.closing.cta} <Arrow /></a>
          </div>
        </section>
      </main>

      <footer className="lp-foot">
        <div className="lp-wrap lp-over" style={{ fontSize: 10.5 }}>
          <span style={{ color: "var(--ink)" }}>Blended</span><span>{c.smallPrint.footer}</span><span>{c.smallPrint.shipping}</span>
          <span style={{ marginLeft: "auto", display: "flex", gap: "12px 24px", flexWrap: "wrap" }}>
            <Link href={SHOP}>Our coffees</Link>
            <Link href="/wholesale">Wholesale</Link>
            {policies.map((p) => <Link key={p.handle} href={`/policies/${p.handle}`}>{p.title}</Link>)}
            <CookiePrefsLink style={{ font: "inherit", letterSpacing: "inherit", textTransform: "inherit", color: "inherit" }} />
          </span>
        </div>
      </footer>
      <CartDrawer />
      {intro && <LabIntro blends={data.intro} ready={loadBagModel()} onDone={() => router.push(labDest.current)} />}
    </div>
  );
}
