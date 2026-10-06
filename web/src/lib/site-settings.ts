// Site-wide metadata: the name, default title, description and share image used
// across the store. The "Site settings" document in Sanity (/studio) overrides
// any of these; an empty field keeps the default here.
export const DEFAULT_SITE = {
  siteName: "Blended",
  title: "Blended · Coffee Lab",
  titleSuffix: "· Blended",
  description: "Build your own coffee blend from single-origin green lots, or pick one of ours. Whole bean, roasted to order.",
};
export type SiteSettings = typeof DEFAULT_SITE;
