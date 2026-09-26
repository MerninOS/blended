# Landing page media

Drop files here named after the slot they fill; the next deploy picks them up
(`npm run build` lists this folder first). Any image type works: .jpg, .png, .webp, .avif.
Videos: .mp4 or .webm. Empty slots fall back to catalog photos.

| Slot | What goes there |
| --- | --- |
| `hero.mp4` (+ `hero.jpg` poster) | Full-screen hero video (the design's `assets/hero.mp4`) |
| `lab.mp4` or `lab.jpg` | "The Coffee Lab" panel. Without one, the live 3D bag shows |
| `origin-brazil`, `origin-colombia`, `origin-ethiopia` | The farms: tall photos, 3:4 |
| `step-01` … `step-04` | Cherry to cup: harvest, drying beds, roaster, brewing (4:5) |
| `band` | Wide house-blend photo: roastery or a finished bag |
| `merch`, `gear` | Square tiles (only shown when LANDING_MERCH_URL / LANDING_GEAR_URL are set) |
