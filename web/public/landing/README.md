# Landing page media

Every slot already has a photo/video hosted on Shopify's CDN (see `HOSTED` in
`src/lib/landing.ts`). To override one, drop a file here named after the slot; the next deploy picks them up
(`npm run build` lists this folder first). Any image type works: .jpg, .png, .webp, .avif.
Videos: .mp4 or .webm. Empty slots fall back to catalog photos.

| Slot | What goes there |
| --- | --- |
| `hero.mp4` (+ `hero.jpg` poster) | Full-screen hero video (the design's `assets/hero.mp4`) |
| `lab.webp` (or .jpg/.png, optional `lab.mp4`) | "The Coffee Lab" panel, 4:5. Ships with a render of the bag; replace with a photo |
| `origin-brazil`, `origin-colombia`, `origin-ethiopia` | The farms: tall photos, 3:4 |
| `step-01` … `step-04` | Cherry to cup: harvest, drying beds, roaster, brewing (4:5) |
| `band` | Wide house-blend photo: roastery or a finished bag |
| `merch`, `gear` | Square tiles linking to the merch / gear collections |
