import { defineArrayMember, defineField, defineType } from "sanity";

const KEEP_EMPTY = "Leave empty to hide it on the page.";
const PROCESSES = ["Washed", "Natural", "Honey", "Co-ferment"];

/** A farm or producer on the farms page (/farms). One per farm, grouped on the page by country. */
export const farm = defineType({
  name: "farm",
  title: "Farm",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Farm or producer", type: "string", description: "The big name on the page: the farm, washing station or producer.", validation: (r) => r.required() }),
    defineField({
      name: "slug", title: "Link name", type: "slug", options: { source: "name", maxLength: 60 },
      description: "Used in links straight to this farm, like /farms#marlon-bolanos.", validation: (r) => r.required(),
    }),
    defineField({ name: "producer", title: "Producer", type: "string", description: `Who runs it, if that's not the name above (e.g. "Hernán Ortiz" for Finca Las Brisas). ${KEEP_EMPTY}` }),
    defineField({
      name: "country", title: "Country", type: "string", validation: (r) => r.required(),
      description: "Farms are grouped by country. A new country gets its own section; add its intro on the Farms page document.",
    }),
    defineField({ name: "region", title: "Region", type: "string", description: `e.g. "Acevedo, Huila". ${KEEP_EMPTY}` }),
    defineField({ name: "altitude", title: "Altitude", type: "string", description: `e.g. "1,750–1,900 m". ${KEEP_EMPTY}` }),
    defineField({ name: "varietal", title: "Varietal", type: "string", description: `e.g. "Caturra, Castillo". ${KEEP_EMPTY}` }),
    defineField({
      name: "process", title: "Process", type: "string",
      description: `How their lots are processed: ${PROCESSES.join(", ")}. Separate more than one with commas; each links to its card in the processes section. ${KEEP_EMPTY}`,
    }),
    defineField({ name: "harvest", title: "Harvest", type: "string", description: `e.g. "May 2026". ${KEEP_EMPTY}` }),
    defineField({ name: "story", title: "Story", type: "text", rows: 4, description: "Who they are and how we work with them. Two or three sentences." }),
    defineField({
      name: "lots", title: "Green lots", type: "array", of: [defineArrayMember({ type: "string" })],
      description: "The handles of the green coffees we buy from this farm, as on Admin → Green catalog (e.g. ethiopia-guji-green). The page shows their tasting notes and links to them in the Coffee Lab and Our coffees. Lots that are hidden or out of stock are skipped.",
    }),
    defineField({
      name: "photos", title: "Photos", type: "array", validation: (r) => r.max(3),
      description: "Up to three: a tall portrait of the producer or farm first (4:5), then a farm photo and a processing photo (square). Without photos, the first lot's photo from the green catalog is used.",
      of: [defineArrayMember({
        type: "image", options: { hotspot: true },
        fields: [defineField({ name: "alt", title: "Alt text", type: "string", description: "Describe the photo for screen readers." })],
      })],
    }),
    defineField({ name: "order", title: "Order", type: "number", description: "Lower numbers come first within their country, and set the order countries appear in." }),
  ],
  orderings: [{ title: "Page order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", country: "country", region: "region", media: "photos.0" }, prepare: ({ title, country, region, media }) => ({ title, subtitle: [country, region].filter(Boolean).join(" · "), media }) },
});
