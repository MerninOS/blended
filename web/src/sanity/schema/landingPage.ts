import { defineArrayMember, defineField, defineType } from "sanity";
import { DEFAULT_COPY as D } from "@/lib/landing-copy";

const HEADLINE = "A new line is a line break. Put *asterisks* around words to set them in orange.";
const KEEP = "Leave empty to keep the current one.";

const text = (name: string, title: string, rows?: number, description?: string) =>
  defineField({ name, title, type: rows ? "text" : "string", rows, description });

const photo = (name: string, title: string, description?: string) =>
  defineField({
    name, title, type: "image", options: { hotspot: true },
    description: [description, KEEP, "Drag the hotspot to choose what stays in frame when it's cropped."].filter(Boolean).join(" "),
    fields: [defineField({ name: "alt", title: "Alt text", type: "string", description: "Describe the photo for screen readers. Leave empty if it's decorative." })],
  });

const video = (name: string, title: string, description?: string) => [
  defineField({ name, title, type: "file", options: { accept: "video/mp4,video/webm" }, description: [description, "MP4 or WebM, muted and looping. Keep it short and under ~10 MB.", KEEP].filter(Boolean).join(" ") }),
  defineField({ name: `${name}Url`, title: `${title} (link instead)`, type: "url", description: "Or paste a link to a video hosted elsewhere (e.g. Shopify Files). The upload wins if both are set." }),
];

// A site path (/lab, /coffees, /collections/merch, /wholesale), a #section on the landing page, or a full URL.
const LINK_OK = /^(\/(?!\/)|#|https?:\/\/|mailto:)/;
const button = (name: string, title: string, description: string) =>
  defineField({
    name, title, type: "object", description, options: { collapsible: false },
    fields: [
      text("label", "Button text"),
      defineField({
        name: "link", title: "Link", type: "string",
        description: "A page on the site, like /lab (the Coffee Lab), /coffees, /collections/merch or /wholesale; a section of this page, like #farmers; or a full https:// address. Links to /lab play the \"Opening the Coffee Lab\" intro.",
        validation: (r) => r.custom((v) => !v || LINK_OK.test(String(v).trim()) || "Start with / for a page on the site, # for a section of this page, or https:// for another site."),
      }),
    ],
  });

const section = (name: string, title: string, fields: ReturnType<typeof defineField>[], description?: string) =>
  defineField({ name, title, type: "object", description, options: { collapsible: false }, fields });

export const landingPage = defineType({
  name: "landingPage",
  title: "Landing page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "lab", title: "Coffee Lab" },
    { name: "farms", title: "Farms" },
    { name: "process", title: "Process" },
    { name: "house", title: "House blend" },
    { name: "shop", title: "Merch & gear" },
    { name: "lineup", title: "Lineup & close" },
    { name: "smallPrint", title: "Small print" },
    { name: "seo", title: "SEO" },
  ],
  initialValue: {
    ...D,
    farms: { ...D.farms, origins: D.farms.origins.map((o, i) => ({ _key: `origin${i}`, _type: "origin", ...o })) },
    process: { ...D.process, steps: D.process.steps.map((s, i) => ({ _key: `step${i}`, _type: "step", ...s })) },
  },
  fields: [
    section("hero", "Hero", [
      text("eyebrow", "Eyebrow"),
      text("headline", "Headline", 2, HEADLINE),
      text("body", "Intro", 3),
      button("primaryButton", "Primary button", "The solid button, on the left."),
      button("secondaryButton", "Secondary button", "The outlined button, on the right."),
      ...video("video", "Background video"),
      photo("poster", "Still image", "Shows while the video loads, and instead of it if it can't play. Wide, at least 2400 px."),
    ], "The full-screen video at the top."),
    section("lab", "Coffee Lab", [
      text("eyebrow", "Eyebrow"),
      text("headline", "Headline", 4, HEADLINE),
      defineField({ name: "chips", title: "Highlights", type: "array", of: [defineArrayMember({ type: "string" })], description: "The short points under the headline." }),
      text("body", "Text", 3),
      text("cta", "Button"),
      photo("image", "Photo", "Portrait, 4:5."),
      ...video("video", "Video", "Plays in place of the photo."),
    ]),
    section("farms", "Farms", [
      text("eyebrow", "Eyebrow"),
      text("headline", "Headline", 2, HEADLINE),
      text("body", "Text", 2),
      text("linkLabel", "Link on each farm"),
      defineField({
        name: "origins", title: "Origins", type: "array", validation: (r) => r.max(6),
        of: [defineArrayMember({
          name: "origin", type: "object",
          fields: [text("name", "Country"), text("where", "Region · altitude"), text("text", "Text", 2), photo("image", "Photo", "Tall, 3:4.")],
          preview: { select: { title: "name", subtitle: "where", media: "image" } },
        })],
      }),
    ]),
    section("process", "Process", [
      text("eyebrow", "Eyebrow"),
      text("headline", "Headline", 2, HEADLINE),
      defineField({
        name: "steps", title: "Steps", type: "array", description: "Numbered in order (01, 02, …).", validation: (r) => r.max(6),
        of: [defineArrayMember({
          name: "step", type: "object",
          fields: [text("title", "Title"), text("text", "Text", 2), photo("image", "Photo", "Portrait, 4:5.")],
          preview: { select: { title: "title", subtitle: "text", media: "image" } },
        })],
      }),
    ]),
    section("house", "House blend", [
      text("eyebrow", "Eyebrow"),
      text("cta", "Button"),
      photo("image", "Background photo", "Wide."),
    ], "The blend's name, notes and recipe come from the green coffee in stock."),
    section("merch", "Merch tile", [text("title", "Title"), text("text", "Text", 2), text("cta", "Button"), photo("image", "Photo", "Square.")]),
    section("gear", "Brew gear tile", [text("title", "Title"), text("text", "Text", 2), text("cta", "Button"), photo("image", "Photo", "Square.")]),
    section("lineup", "Lineup", [text("headline", "Headline", 2, HEADLINE), text("note", "Note")], "The coffees themselves come from the green catalog."),
    section("closing", "Closing", [text("headline", "Headline", 2, HEADLINE), text("cta", "Button")]),
    section("smallPrint", "Small print", [text("shipping", "Shipping line", undefined, "In the ticker and the footer."), text("footer", "Footer tagline")]),
    section("seo", "SEO", [text("title", "Page title"), text("description", "Search description", 3)]),
  ].map((f) => ({ ...f, group: f.name === "merch" || f.name === "gear" ? "shop" : f.name === "closing" ? "lineup" : f.name })),
  preview: { prepare: () => ({ title: "Landing page" }) },
});
