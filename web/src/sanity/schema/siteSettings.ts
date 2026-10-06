import { defineField, defineType } from "sanity";
import { DEFAULT_SITE as D } from "@/lib/site-settings";

/** Titles, description and share image for the whole site (pages without their own). */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  initialValue: D,
  fields: [
    defineField({ name: "siteName", title: "Site name", type: "string", description: "Shown by social apps next to shared links." }),
    defineField({ name: "title", title: "Default page title", type: "string", description: "The browser tab and search result title for pages that don't have their own." }),
    defineField({ name: "titleSuffix", title: "Title ending", type: "string", description: "Added after each page's own title, e.g. \"Our coffees · Blended\". Leave empty to keep the current one." }),
    defineField({ name: "description", title: "Default description", type: "text", rows: 3, description: "The search result and share preview text for pages that don't have their own. Around 150 characters." }),
    defineField({
      name: "shareImage", title: "Share image", type: "image", options: { hotspot: true },
      description: "The preview picture when a link to the site is shared (iMessage, Instagram, Facebook, Slack…). It's cut to 1200 × 630, so use a wide photo at least that size and set the hotspot on what must stay in frame. Coffee and product pages use their own photo. Leave empty to keep the current design.",
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
