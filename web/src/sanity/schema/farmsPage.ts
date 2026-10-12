import { defineArrayMember, defineField, defineType } from "sanity";
import { DEFAULT_FARMS_COPY as D } from "@/lib/farms-copy";

const HEADLINE = "A new line is a line break. Put *asterisks* around words to set them in orange.";
const text = (name: string, title: string, rows?: number, description?: string) =>
  defineField({ name, title, type: rows ? "text" : "string", rows, description });
const photo = (name: string, title: string, description: string) =>
  defineField({
    name, title, type: "image", options: { hotspot: true }, description: `${description} Drag the hotspot to choose what stays in frame.`,
    fields: [defineField({ name: "alt", title: "Alt text", type: "string", description: "Describe the photo for screen readers." })],
  });
const section = (name: string, title: string, fields: ReturnType<typeof defineField>[], description?: string) =>
  defineField({ name, title, type: "object", description, options: { collapsible: false }, fields });

/** The words and photos around the farms on /farms. The farms themselves are "Farm" documents. */
export const farmsPage = defineType({
  name: "farmsPage",
  title: "Farms page",
  type: "document",
  initialValue: {
    ...D,
    countries: D.countries.map((c, i) => ({ _key: `country${i}`, _type: "country", ...c })),
    processes: { ...D.processes, items: D.processes.items.map((p, i) => ({ _key: `process${i}`, _type: "process", ...p })) },
  },
  fields: [
    section("hero", "Hero", [
      text("eyebrow", "Eyebrow"),
      text("headline", "Headline", 2, HEADLINE),
      text("body", "Intro", 3, "{producers} and {countries} are replaced with the counts, e.g. \"6 producers\" and \"4 countries\"."),
      photo("image", "Photo", "Wide, at least 2400 px, from one of the farms."),
    ]),
    defineField({
      name: "countries", title: "Countries", type: "array",
      description: "An intro for each country's section. The name must match the Country on its farms. A country with farms but no intro here still shows, without the intro.",
      of: [defineArrayMember({
        name: "country", type: "object",
        fields: [text("name", "Country"), text("lede", "Intro", 3)],
        preview: { select: { title: "name", subtitle: "lede" } },
      })],
    }),
    section("processes", "Processes", [
      text("eyebrow", "Eyebrow"),
      text("headline", "Headline", 2, HEADLINE),
      text("body", "Text", 3),
      defineField({
        name: "items", title: "Processes", type: "array", validation: (r) => r.max(6),
        description: "Each card lists the farms whose Process names it.",
        of: [defineArrayMember({
          name: "process", type: "object",
          fields: [
            text("name", "Name"), text("text", "Text", 3),
            defineField({ name: "steps", title: "Steps", type: "array", of: [defineArrayMember({ type: "string" })], description: "Numbered in order." }),
            photo("image", "Photo", "4:3."),
          ],
          preview: { select: { title: "name", subtitle: "text", media: "image" } },
        })],
      }),
    ], "The dark section after the farms."),
    section("closing", "Closing", [text("headline", "Headline", 2, HEADLINE), text("body", "Text", 2)]),
    section("seo", "SEO", [text("title", "Page title"), text("description", "Search description", 3)]),
  ],
  preview: { prepare: () => ({ title: "Farms page" }) },
});
