"use client";
// The storefront header (design: shop/site-header.js): a frosted BLENDED pill on the left and a
// frosted action pill on the right (Build a blend, cart, menu). The menu is a hamburger at every
// width and opens a panel of shop cards, the SMS-exclusives promo and a few links.
// `overlay` lays it over the page's first section (the landing video, the Lab's bag stage, the farms hero).
// Phones and tablets: it slides away while scrolling down and returns on the way up; on the Lab it
// stays away the whole time the cup is pinned at the top. <html data-head-hidden> lets things
// pinned under it (the Lab's cup, the shop toolbar) follow it up.
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { cartStore, useCart } from "./cart-store";

export type HeaderSection = "lab" | "coffees" | "merch" | "gear" | "wholesale" | "farmers" | null;

const CDN = "https://cdn.shopify.com/s/files/1/0880/3935/8739/files/";
const CARDS: { k: HeaderSection; href: string; t: string; d: string; img: string }[] = [
  { k: "lab", href: "/lab", t: "Coffee lab", d: "Build your own blend", img: `${CDN}Blended_bag.png?v=1790529049` },
  { k: "coffees", href: "/coffees", t: "Our coffees", d: "Single origins and house blends", img: `${CDN}pour_over.jpg?v=1790443178` },
  { k: "merch", href: "/collections/merch", t: "Merch", d: "Caps, tees and mugs", img: `${CDN}blended_tee.jpg?v=1790443146` },
  { k: "gear", href: "/collections/gear", t: "Brew gear", d: "The gear on our own bar", img: `${CDN}gear_lamarz.webp?v=1790443164` },
];
const ROWS: { k: HeaderSection; href: string; t: string }[] = [
  { k: "wholesale", href: "/wholesale", t: "Wholesale & private label" },
  { k: "farmers", href: "/farms", t: "Our farmers" },
];

const Bag = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>;
const Lock = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;
const Chev = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>;

export function SiteHeader({ active, overlay, exclusives, onLab }: {
  active: HeaderSection;
  overlay?: boolean;
  /** SMS exclusives switched on: the menu shows the "Exclusive releases" promo. */
  exclusives?: boolean;
  /** Landing page: a click toward the Lab plays the "Opening the Coffee Lab" intro instead of a plain link. */
  onLab?: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { items } = useCart();
  const n = items.reduce((a, x) => a + x.qty, 0);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const burger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); burger.current?.focus(); } };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [open]);

  useEffect(() => {
    let last = scrollY;
    const f = () => {
      if (innerWidth > 1024) { setHidden(false); last = scrollY; return; }
      const lab = document.querySelector<HTMLElement>(".cp-layout"), cup = lab?.querySelector<HTMLElement>(".cp-layout-cup");
      if (lab && cup) {
        const r = lab.getBoundingClientRect(), headH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--topbar-h")) || 60;
        setHidden(r.top <= headH && r.bottom > cup.offsetHeight); last = scrollY; return;
      }
      const y = scrollY, d = y - last;
      if (Math.abs(d) < 6) return;
      setHidden(d > 0 && y > 80); last = y;
    };
    f();
    addEventListener("scroll", f, { passive: true }); addEventListener("resize", f);
    return () => { removeEventListener("scroll", f); removeEventListener("resize", f); delete document.documentElement.dataset.headHidden; };
  }, [active]);
  const off = hidden && !open;
  useEffect(() => { document.documentElement.dataset.headHidden = String(off); }, [off]);

  const close = () => setOpen(false);
  const labLink = (e: MouseEvent<HTMLAnchorElement>) => { close(); onLab?.(e); };
  const cur = (k: HeaderSection) => (k === active ? "page" as const : undefined);

  return (
    <header className="bh-head" data-overlay={overlay || undefined} data-hidden={off} data-open={open}>
      <div className="bh-in">
        <Link href="/" className="bh-pill bh-logo" aria-label="Blended home">BLENDED</Link>
        <div className="bh-pill bh-act">
          {active === "lab"
            ? <a className="bh-cta" href="#build">Start a blend</a>
            : <a className="bh-cta" href="/lab" onClick={onLab ? labLink : undefined}>Build a blend</a>}
          <button type="button" className="bh-ic" onClick={() => { close(); cartStore.setOpen(true); }} aria-label={`Open cart, ${n} item${n === 1 ? "" : "s"}`}>
            <Bag /><span className="bh-n" data-n={n}>{n}</span>
          </button>
          <button ref={burger} type="button" className="bh-ic" aria-expanded={open} aria-controls="bh-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
            <span className="bh-lines"><i></i><i></i></span>
          </button>
        </div>
      </div>
      <div className="bh-scrim" onClick={close} />
      <nav className="bh-menu" id="bh-menu" aria-label="Site" inert={!open}>
        <div className="bh-over">Shop all</div>
        <div className="bh-grid">
          {CARDS.map((c) => (
            <Link key={c.href} className="bh-card" href={c.href} aria-current={cur(c.k)} onClick={c.k === "lab" && onLab ? labLink : close}>
              <div className="bh-thumb"><Image src={c.img} alt="" fill sizes="200px" style={{ objectFit: "cover" }} /></div>
              <b>{c.t}</b><span>{c.d}</span>
            </Link>
          ))}
        </div>
        {exclusives && (
          <div className="bh-promo">
            <div className="bh-over"><Lock /> SMS members</div>
            <h3>Exclusive releases</h3>
            <p>Micro-lots we text to the list first. Join to add them to your blends.</p>
            <a href="/lab#exclusive" onClick={close}>Get on the list</a>
          </div>
        )}
        <div className="bh-rows">
          {ROWS.map((r) => <a key={r.href} href={r.href} aria-current={cur(r.k)} onClick={close}>{r.t}<Chev /></a>)}
        </div>
      </nav>
    </header>
  );
}
