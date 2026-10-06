import "server-only";
// Reads the landing page content and site settings from Sanity's CDN. Any
// failure (no document yet, network, a private dataset) falls back to the
// defaults in code, so Sanity being down never takes a page with it.
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, LANDING_ID, SITE_ID } from "@/sanity/env";
import { DEFAULT_SITE, type SiteSettings } from "@/lib/site-settings";
import { mergeCopy } from "@/lib/landing-copy";

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

const SITE_QUERY = `*[_id == $id][0]{ ..., shareImage${IMG} }`;

/** Site settings over the defaults, plus the share image when one is set. Never throws. */
export async function getSiteSettings(): Promise<SiteSettings & { shareImage: CmsImage | null }> {
  let doc: Record<string, unknown> | null = null;
  try {
    doc = await client.fetch(SITE_QUERY, { id: SITE_ID }, { next: { revalidate: 60, tags: [SANITY_TAG] } });
  } catch (e) {
    console.error("[sanity] site settings:", e instanceof Error ? e.message : e);
  }
  const img = doc?.shareImage as CmsImage | undefined;
  return { ...mergeCopy(DEFAULT_SITE, doc), shareImage: img?.url ? img : null };
}

/** A Sanity image cut to w×h around its hotspot (after any crop), as a CDN URL. */
export function cmsImageUrl(img: CmsImage, w: number, h: number, fm: "png" | "jpg" = "jpg") {
  const q = new URLSearchParams({ w: String(w), h: String(h), fit: "crop", fm });
  const c = img.crop, W = img.w, H = img.h;
  let fx = img.hotspot?.x, fy = img.hotspot?.y;
  if (c && W && H && (c.left || c.right || c.top || c.bottom)) {
    const cw = 1 - c.left - c.right, ch = 1 - c.top - c.bottom;
    q.set("rect", [c.left * W, c.top * H, cw * W, ch * H].map(Math.round).join(","));
    if (fx != null && fy != null) { fx = (fx - c.left) / cw; fy = (fy - c.top) / ch; }
  }
  if (fx != null && fy != null) { q.set("crop", "focalpoint"); q.set("fp-x", String(Math.min(1, Math.max(0, fx)))); q.set("fp-y", String(Math.min(1, Math.max(0, fy)))); }
  return `${img.url}?${q}`;
}
