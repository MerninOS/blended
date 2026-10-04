"use client";
// The BLENDED coffee bag, drawn in the browser with three.js (BoxHero.jsx):
// a matte white flat-bottom pouch with a vertical BLENDED label panel and the
// bag label (lib/bag-label.ts) slipped on at a slight tilt over the lower
// panel, so the checkout preview shows the customer's own label on the bag.
// Loaded lazily so three stays out of the main bundle.
import type * as THREE_NS from "three";
import { LABEL_H, LABEL_SITE, LABEL_W, drawLabel, resetMeasure, type LabelData } from "@/lib/bag-label";

type Three = typeof THREE_NS;
export const BOX_PAPER = "#F0EDE5", BOX_INK = "#1A1A18", BOX_RED = "#D93D18";
export const BOX_W = 1.2, BOX_H = 1.9, BOX_D = .56;

/** What the card on the front of the bag shows: the bag label. */
export type BagCard = LabelData;

export const BAG_CARD_DEFAULT: BagCard = {
  name: "Custom blend", site: LABEL_SITE, roast: 3, size: "1 lb", grind: "Whole bean",
  parts: [{ name: "Mexico Veracruz", origin: "Mexico", color: "#EE8A1E" }, { name: "Strawberry Jam Co-ferment", origin: "Colombia", color: "#C43C7C" }],
  vals: { brownSugar: 6, berry: 7, ferment: 5, stoneFruit: 4, floral: 3, cocoa: 3 }, words: ["Brown sugar", "Berry", "Ferment"],
};

const loadImg = (src: string) => new Promise<HTMLImageElement | null>((r) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
const cssFont = (v: string, fallback: string) => {
  const f = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  return f ? `${f}, ${fallback}` : fallback;
};
const text = (g: CanvasRenderingContext2D, s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "center", track = 0) => {
  g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle";
  if ("letterSpacing" in g) (g as unknown as { letterSpacing: string }).letterSpacing = track + "px";
  g.fillText(s, x, y);
};

let fontsReady: Promise<{ logo: string; mono: string; mark: HTMLImageElement | null }> | null = null;
function assets() {
  fontsReady ??= (async () => {
    const logo = cssFont("--nf-energy", '"Archivo", sans-serif');
    const mono = cssFont("--nf-martian", "monospace");
    try { await Promise.all([document.fonts.load(`800 100px ${logo}`), document.fonts.load(`500 30px ${mono}`), document.fonts.load(`600 13px ${mono}`)]); } catch { /* fall back */ }
    return { logo, mono, mark: await loadImg("/brand/blended-mark.png") };
  })();
  return fontsReady;
}

// ---- bag shape: pillowed front, gusseted bottom, tapering to the seal ----
const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const bagDepth = (t: number) => 1 - .94 * sm(.55, .92, t);
const bagBulge = (x: number, t: number) => { const u = x / (BOX_W / 2); return .04 * (1 - u * u) * Math.sin(Math.PI * Math.min(1, t / .92)) * (1 - sm(.75, .92, t)); };
const bagSurfZ = (x: number, t: number) => (BOX_D / 2) * bagDepth(t) * (1 - .32 * Math.pow(Math.min(1, Math.abs(x / (BOX_W / 2))), 10)) + bagBulge(x, t);
function bagDeform(geo: THREE_NS.BufferGeometry) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), t = y / BOX_H, u = x / (BOX_W / 2), zn = z / (BOX_D / 2);
    const nz = zn * (BOX_D / 2) * bagDepth(t) * (1 - .32 * Math.pow(Math.min(1, Math.abs(u)), 10)) + zn * bagBulge(x, t);
    p.setXYZ(i, x * (1 - .02 * t), y, nz);
  }
  geo.computeVertexNormals(); return geo;
}

/** Matte white film: crimped top seal and fold crease; the front adds the degassing valve and the BLENDED label panel. */
function drawFilm(g: CanvasRenderingContext2D, w: number, h: number, kind: "front" | "back" | "side", logo: string) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = kind === "side" ? "#DEDDDA" : "#E7E6E3"; g.fillRect(0, 0, w, h);
  // soft film mottling
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = 40 + Math.random() * 140, gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, Math.random() > .5 ? "rgba(255,255,255,.18)" : "rgba(120,118,112,.05)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const seal = h * .065; g.fillStyle = "rgba(246,245,243,.8)"; g.fillRect(0, 0, w, seal);
  g.fillStyle = "rgba(150,148,142,.12)"; for (let x = 0; x < w; x += 6) g.fillRect(x, 0, 2, seal);
  g.fillStyle = "rgba(140,138,132,.14)"; g.fillRect(0, seal, w, 3);
  g.fillStyle = "rgba(140,138,132,.08)"; g.fillRect(0, h * .17, w, 4); g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(0, h * .17 + 4, w, 6);
  g.fillStyle = "rgba(246,245,243,.7)"; g.fillRect(0, h - h * .02, w, h * .02);
  if (kind === "front") {
    const vx = w * .86, vy = h * .155; g.strokeStyle = "rgba(120,118,112,.35)"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(vx - 10, vy - 26); g.lineTo(vx - 10, vy + 6); g.arc(vx + 4, vy + 6, 14, Math.PI, Math.PI * 1.9, true); g.stroke();
    const lx = w * .24, ly = h * .23, lw = w * .51, lh = h * .66;
    g.fillStyle = "rgba(0,0,0,.05)"; g.fillRect(lx + 2, ly + 3, lw, lh);
    g.fillStyle = "#EFEEEB"; g.fillRect(lx, ly, lw, lh);
    g.strokeStyle = "rgba(26,26,24,.07)"; g.lineWidth = 2; g.strokeRect(lx, ly, lw, lh);
    // BLENDED, set vertically reading bottom → top
    g.save(); g.translate(w * .5, ly + lh * .52); g.rotate(-Math.PI / 2);
    if ("letterSpacing" in g) (g as unknown as { letterSpacing: string }).letterSpacing = "0px";
    g.font = `800 300px ${logo}`; const fs = 300 * (lh * .9) / g.measureText("BLENDED").width;
    text(g, "BLENDED", 0, 0, `800 ${fs}px ${logo}`, BOX_INK); g.restore();
  }
  const eg = g.createLinearGradient(0, 0, w, 0), ew = Math.min(.08, 30 / w);
  eg.addColorStop(0, "rgba(250,250,248,.7)"); eg.addColorStop(ew, "rgba(250,250,248,0)"); eg.addColorStop(1 - ew, "rgba(250,250,248,0)"); eg.addColorStop(1, "rgba(250,250,248,.7)");
  g.fillStyle = eg; g.fillRect(0, 0, w, h);
}
function filmCanvas(w: number, h: number, kind: "front" | "back" | "side", logo: string) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  drawFilm(c.getContext("2d")!, w, h, kind, logo); return c;
}

/** The label on the bag, drawn at 2× (1950 × 900). */
async function paintCard(d: BagCard) {
  await assets(); resetMeasure();
  const c = document.createElement("canvas"); c.width = LABEL_W * 2; c.height = LABEL_H * 2;
  drawLabel(c.getContext("2d")!, d, 2);
  return c;
}

// ---- the Meshy bag model (BoxHero.jsx bagLoadModel), with the drawn bag as the fallback ----
export const BAG_MODEL_URL = "/models/coffee-bag.fbx";
let bagModel: Promise<THREE_NS.Group | null> | null = null;
/** Load the bag model once per page; null when it's missing or fails (the drawn bag is used instead). */
function loadBagModel(): Promise<THREE_NS.Group | null> {
  bagModel ??= (async () => {
    try {
      const head = await fetch(BAG_MODEL_URL, { method: "HEAD" });
      if (!head.ok) return null;
      const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
      return await new FBXLoader().loadAsync(BAG_MODEL_URL);
    } catch (e) { console.warn("[bag] model unavailable, drawing the bag instead", e); return null; }
  })();
  return bagModel;
}
/** The vertical BLENDED sticker on the model's front panel. */
function stickerCanvas(aspect: number, logo: string) {
  const w = 512, h = Math.round(w * aspect), c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d")!;
  g.fillStyle = "#DED9D1"; g.fillRect(0, 0, w, h);
  g.save(); g.translate(w / 2, h * .52); g.rotate(-Math.PI / 2);
  const f = (px: number) => `800 ${px}px ${logo}`; g.font = f(300);
  g.font = f(300 * (h * .9) / g.measureText("BLENDED").width);
  g.fillStyle = BOX_INK; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("BLENDED", 0, 0); g.restore();
  return c;
}

export interface BoxScene {
  three: Three;
  camera: THREE_NS.PerspectiveCamera;
  rig: THREE_NS.Group;
  host: HTMLElement;
}
export interface BoxHandle { dispose: () => void; setCard: (card: BagCard) => void }

/**
 * Mount a turnable bag into `host`. Drag to turn (with inertia); when left
 * alone it sways ~17° either way on a slow cycle instead of spinning.
 * `layout` runs every frame to position/scale the rig.
 */
export async function mountBox(host: HTMLElement, opts: {
  cam: [number, number, number]; look: [number, number, number]; baseRot: number;
  card?: BagCard; layout?: (s: BoxScene) => void; onReady?: () => void;
}): Promise<BoxHandle> {
  const THREE = await import("three");
  let dead = false, raf = 0, visible = true;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .82;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab";
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  camera.position.set(...opts.cam); camera.lookAt(...opts.look);
  // physically-based light units: the design's legacy intensities × π
  scene.add(new THREE.HemisphereLight(0xfff8f0, 0x6e6054, .5 * Math.PI));
  const key = new THREE.DirectionalLight(0xfff6ec, 1.35 * Math.PI); key.position.set(3.5, 6, 3); key.castShadow = true;
  key.shadow.mapSize.set(512, 512); key.shadow.radius = 12; key.shadow.blurSamples = 16; key.shadow.bias = -.0004; key.shadow.normalBias = .02;
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: .5, far: 20 }); scene.add(key);
  const fill = new THREE.DirectionalLight(0xf3efe9, .35 * Math.PI); fill.position.set(-4, 2, 4); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, .5 * Math.PI); rim.position.set(-2.5, 4, -5); scene.add(rim);

  const disposables: { dispose: () => void }[] = [];
  const own = <T extends { dispose: () => void }>(x: T) => { disposables.push(x); return x; };
  const tex = (c: HTMLCanvasElement) => { const t = own(new THREE.CanvasTexture(c)); t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace; return t; };

  // soft contact shadow under the bag
  const sc = document.createElement("canvas"); sc.width = sc.height = 256;
  const sg = sc.getContext("2d")!, gr = sg.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, "rgba(26,26,24,.34)"); gr.addColorStop(.45, "rgba(26,26,24,.14)"); gr.addColorStop(1, "rgba(26,26,24,0)");
  sg.fillStyle = gr; sg.fillRect(0, 0, 256, 256);
  const ground = new THREE.Mesh(own(new THREE.PlaneGeometry(3.2, 3.2)), own(new THREE.MeshBasicMaterial({ map: tex(sc), transparent: true, depthWrite: false })));
  ground.rotation.x = -Math.PI / 2; ground.position.y = .002;
  const rig = new THREE.Group(); scene.add(rig); rig.add(ground);

  // the bag: the Meshy model when it's there (paper finish, sticker and card wrapped onto its
  // front), else the drawn pouch
  const [{ logo }, model] = await Promise.all([assets(), loadBagModel()]);
  if (dead) return { dispose: () => {}, setCard: () => {} };
  const cardMat = own(new THREE.MeshPhysicalMaterial({ color: BOX_PAPER, roughness: .75, clearcoat: 0 }));
  const catcher = new THREE.Mesh(own(new THREE.PlaneGeometry(10, 10)), own(new THREE.ShadowMaterial({ opacity: .28 })));
  catcher.rotation.x = -Math.PI / 2; catcher.position.y = .001; catcher.receiveShadow = true;
  rig.add(catcher);
  /** Card geometry: the label at a slight clockwise tilt, lying on the bag's front at `surfZ`. */
  const cardGeo = (cw: number, cxc: number, cyc: number, surfZ: (x: number, y: number) => number) => {
    const ch = cw * LABEL_H / LABEL_W, ang = -.11, ca = Math.cos(ang), sa = Math.sin(ang);
    const cg = own(new THREE.PlaneGeometry(cw, ch, 24, 8)), cp = cg.attributes.position;
    for (let i = 0; i < cp.count; i++) {
      const lx = cp.getX(i), ly = cp.getY(i), x = lx * ca - ly * sa + cxc, y = lx * sa + ly * ca + cyc;
      cp.setXYZ(i, x, y, surfZ(x, y));
    }
    cg.computeVertexNormals(); return cg;
  };
  let cg: THREE_NS.BufferGeometry;
  if (model) {
    const bag = model.clone(true);
    const paper = own(new THREE.MeshPhysicalMaterial({ color: 0xC9C1B5, roughness: .9, metalness: 0, sheen: .25, sheenRoughness: .8, sheenColor: new THREE.Color(0xffffff), side: THREE.DoubleSide }));
    bag.traverse((o) => { const m = o as THREE_NS.Mesh; if (m.isMesh) { m.material = paper; m.castShadow = m.receiveShadow = true; } });
    // normalise: front facing +z, BOX_H tall, centred, standing on y = 0 (measured unparented)
    bag.updateMatrixWorld(true);
    let bb = new THREE.Box3().setFromObject(bag), sz = bb.getSize(new THREE.Vector3());
    if (sz.z > sz.x * 1.05) { bag.rotation.y = Math.PI / 2; bag.updateMatrixWorld(true); bb = new THREE.Box3().setFromObject(bag); sz = bb.getSize(new THREE.Vector3()); }
    bag.scale.multiplyScalar(BOX_H / sz.y); bag.updateMatrixWorld(true);
    bb = new THREE.Box3().setFromObject(bag); const c = bb.getCenter(new THREE.Vector3());
    bag.position.x -= c.x; bag.position.z -= c.z; bag.position.y -= bb.min.y; bag.updateMatrixWorld(true);
    bb = new THREE.Box3().setFromObject(bag); sz = bb.getSize(new THREE.Vector3());
    const ray = new THREE.Raycaster(), dir = new THREE.Vector3(0, 0, -1), o = new THREE.Vector3();
    const front = (x: number, y: number) => { o.set(x, y, 10); ray.set(o, dir); return ray.intersectObject(bag, true)[0]?.point.z ?? bb.max.z; };
    // vertical BLENDED sticker beneath the card
    const sw = sz.x * .5, sh = BOX_H * .64, scy = BOX_H * .45;
    const sgeo = own(new THREE.PlaneGeometry(sw, sh, 16, 32)), sp = sgeo.attributes.position;
    for (let i = 0; i < sp.count; i++) { const x = sp.getX(i), y = sp.getY(i) + scy; sp.setXYZ(i, x, y, front(x, y) + .004); }
    sgeo.computeVertexNormals();
    const sticker = new THREE.Mesh(sgeo, own(new THREE.MeshPhysicalMaterial({ map: tex(stickerCanvas(sh / sw, logo)), roughness: .85, metalness: 0, polygonOffset: true, polygonOffsetFactor: -1 })));
    sticker.receiveShadow = true;
    cg = cardGeo(sz.x * .62, sz.x * .05, BOX_H * .38, (x, y) => front(x, y) + .014);
    rig.add(bag, sticker);
  } else {
    const shellGeo = own(bagDeform(new THREE.BoxGeometry(BOX_W, BOX_H, BOX_D, 24, 48, 12).translate(0, BOX_H / 2, 0)));
    const film = (c: HTMLCanvasElement) => own(new THREE.MeshPhysicalMaterial({ map: tex(c), color: 0xffffff, metalness: 0, clearcoat: 0, roughness: .95, sheen: .15, sheenRoughness: .9, sheenColor: new THREE.Color(0xffffff) }));
    const side = film(filmCanvas(480, 1620, "side", logo)), plain = film(filmCanvas(256, 256, "back", logo));
    const outer = new THREE.Mesh(shellGeo, [side, side, plain, plain, film(filmCanvas(1024, 1620, "front", logo)), film(filmCanvas(1024, 1620, "back", logo))]);
    outer.castShadow = true; outer.receiveShadow = true;
    cg = cardGeo(BOX_W * .72, BOX_W * .07, BOX_H * .38, (x, y) => bagSurfZ(x, y / BOX_H) + .008);
    rig.add(outer);
  }
  const cardFront = new THREE.Mesh(cg, cardMat); cardFront.receiveShadow = true;
  const cardBack = new THREE.Mesh(cg, own(new THREE.MeshStandardMaterial({ color: 0xE4E0D6, roughness: .8, side: THREE.BackSide })));
  rig.add(cardFront, cardBack);

  let cardTex: THREE_NS.CanvasTexture | null = null, cardSeq = 0;
  const setCard = (d: BagCard) => {
    const seq = ++cardSeq;
    return paintCard(d).then((c) => {
      if (dead || seq !== cardSeq) return;
      const t = new THREE.CanvasTexture(c); t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace;
      cardTex?.dispose(); cardTex = t;
      cardMat.map = t; cardMat.color.set(0xffffff); cardMat.needsUpdate = true;
    });
  };
  setCard(opts.card ?? BAG_CARD_DEFAULT).then(() => { if (!dead) opts.onReady?.(); });

  let rotY = opts.baseRot, vel = 0, dragging = false, lastX = 0, idleAt = 0;
  const el = renderer.domElement;
  const down = (e: PointerEvent) => { dragging = true; lastX = e.clientX; vel = 0; el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing"; };
  const move = (e: PointerEvent) => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; vel = dx * .01; rotY += vel; };
  const up = () => { dragging = false; idleAt = performance.now(); el.style.cursor = "grab"; };
  el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);

  const size = () => { const r = host.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(size); ro.observe(host); size();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx: BoxScene = { three: THREE, camera, rig, host };
  function tick(now: number) {
    raf = 0; if (dead || !visible) return;
    if (!dragging) {
      vel *= .94; rotY += vel;
      if (!reduce && Math.abs(vel) < .002 && now - idleAt > 1400) { const target = opts.baseRot + Math.sin(now * .00018) * .3; rotY += (target - rotY) * .006; }
    }
    rig.rotation.y = rotY;
    opts.layout?.(ctx);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick); });
  io.observe(host);
  raf = requestAnimationFrame(tick);

  return {
    setCard: (d) => { void setCard(d); },
    dispose: () => {
      dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
      cardTex?.dispose(); disposables.forEach((d) => d.dispose()); renderer.dispose();
      if (el.parentNode === host) host.removeChild(el);
    },
  };
}
