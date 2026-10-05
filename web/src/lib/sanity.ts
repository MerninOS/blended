import "server-only";
// Reads the landing page content from Sanity's CDN. Any failure (no document
// yet, network, a private dataset) returns null and the page keeps its default
// copy and media, so Sanity being down never takes the landing page with it.
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, LANDING_ID } from "@/sanity/env";

export const SANITY_TAG = "sanity";

const client = createClient({ projectId, dataset, apiVersion, useCdn: true, perspective: "published", timeout: 5000 });

export interface CmsImage { url: string; alt?: string; hotspot?: { x: number; y: number }; crop?: { top: number; bottom: number; left: number; right: number }; w?: number; h?: number }

const IMG = `{ "url": asset->url, alt, hotspot{x, y}, crop{top, bottom, left, right}, "w": asset->metadata.dimensions.width, "h": asset->metadata.dimensions.height }`;
const VID = `{ "url": asset->url }`;
const QUERY = `*[_id == $id][0]{
  ...,
  hero{ ..., poster${IMG}, video${VID} },
  lab{ ..., image${IMG}, video${VID} },
  farms{ ..., origins[]{ ..., image${IMG} } },
  process{ ..., steps[]{ ..., image${IMG} } },
  house{ ..., image${IMG} },
  merch{ ..., image${IMG} },
  gear{ ..., image${IMG} }
}`;

export async function getLandingCms(): Promise<Record<string, unknown> | null> {
  try {
    return await client.fetch(QUERY, { id: LANDING_ID }, { next: { revalidate: 60, tags: [SANITY_TAG] } });
  } catch (e) {
    console.error("[sanity] landing content:", e instanceof Error ? e.message : e);
    return null;
  }
}
