// Copies the first farms (src/lib/farms-seed.json) into Sanity as published "Farm" documents.
// Idempotent: a farm that already exists is left as it is, so edits made in the Studio are kept.
//
//   node --env-file=.env.local scripts/seed-sanity-farms.ts           # shows what it would create
//   node --env-file=.env.local scripts/seed-sanity-farms.ts --write   # creates them
//
// Needs SANITY_WRITE_TOKEN: an Editor token from sanity.io/manage → API → Tokens.
// The farms page shows the seed list until any Farm is published, so this only matters
// once you want to edit them in /studio.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sf429892";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;
const write = process.argv.includes("--write");

type SeedFarm = { _id: string; slug: string; lots: string[]; [k: string]: unknown };
const { farms } = JSON.parse(readFileSync(join(import.meta.dirname, "../src/lib/farms-seed.json"), "utf8")) as { farms: SeedFarm[] };

// Empty strings stay out of the documents, so those fields show as empty in the Studio.
const docs = farms.map(({ slug, lots, ...f }) => ({
  ...(Object.fromEntries(Object.entries(f).filter(([, v]) => v !== "")) as { _id: string; name: string; country: string }),
  _type: "farm",
  slug: { _type: "slug", current: slug },
  lots,
}));

for (const d of docs) console.log(`${d._id}  ${d.name} (${d.country})  lots: ${d.lots.join(", ") || "none"}`);
if (!write) { console.log(`\n${docs.length} farms for ${projectId}/${dataset}. Run again with --write to create them.`); process.exit(0); }
if (!token) { console.error("Set SANITY_WRITE_TOKEN in .env.local (an Editor token from sanity.io/manage → API → Tokens)."); process.exit(1); }

const res = await fetch(`https://${projectId}.api.sanity.io/v2025-02-19/data/mutate/${dataset}?returnIds=true`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations: docs.map((d) => ({ createIfNotExists: d })) }),
});
if (!res.ok) { console.error(`Sanity refused the write: ${res.status} ${await res.text()}`); process.exit(1); }
console.log(`\nDone: ${docs.length} farms are in ${projectId}/${dataset} (existing ones were left as they were).`);
