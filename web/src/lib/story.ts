import "server-only";
// Data for the Our Story page (/our-story): the words from the "Our story page"
// document in Sanity over the defaults in story-copy.ts, and its photos.
import { DEFAULT_STORY_COPY, type StoryCopy } from "@/lib/story-copy";
import { mergeCopy } from "@/lib/landing-copy";
import { cmsPic, type Pic } from "@/lib/landing";
import type { CmsImage } from "@/lib/sanity";

export interface StoryPageData {
  copy: StoryCopy;
  /** Each photo slot; null leaves the design's empty frame. */
  media: {
    hero: Pic | null; start: Pic | null; pairLeft: Pic | null; pairRight: Pic | null;
    band: Pic | null; table: Pic | null; now: Pic | null; closing: Pic | null;
  };
}

type Img = { image?: CmsImage; pairLeft?: CmsImage; pairRight?: CmsImage; tableImage?: CmsImage };

export function storyData(cms: Record<string, unknown> | null): StoryPageData {
  const m = (cms ?? {}) as Record<string, Img | undefined>;
  return {
    copy: mergeCopy(DEFAULT_STORY_COPY, cms),
    media: {
      hero: cmsPic(m.hero?.image), start: cmsPic(m.story?.image),
      pairLeft: cmsPic(m.story?.pairLeft), pairRight: cmsPic(m.story?.pairRight),
      band: cmsPic(m.band?.image), table: cmsPic(m.meaning?.tableImage),
      now: cmsPic(m.different?.image), closing: cmsPic(m.closing?.image),
    },
  };
}
