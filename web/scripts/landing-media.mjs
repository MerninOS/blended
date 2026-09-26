// Lists the photos/videos dropped into public/landing/ so the landing page knows
// which slots are filled (server functions on Vercel can't read public/ at run
// time). Runs before every build; see public/landing/README.md for slot names.
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dir = join(root, "public", "landing");
const files = existsSync(dir) ? readdirSync(dir).filter((f) => /\.(mp4|webm|jpe?g|png|webp|avif)$/i.test(f)) : [];
const media = {};
for (const f of files.sort()) {
  const [, slot, ext] = f.match(/^(.+)\.([a-z0-9]+)$/i);
  const kind = /^(mp4|webm)$/i.test(ext) ? "video" : "image";
  (media[slot] ??= {})[kind] ??= `/landing/${f}`;
}
writeFileSync(join(root, "src", "lib", "landing-media.json"), JSON.stringify(media, null, 2) + "\n");
console.log(`landing media: ${Object.keys(media).length ? Object.keys(media).join(", ") : "none (using fallbacks)"}`);
