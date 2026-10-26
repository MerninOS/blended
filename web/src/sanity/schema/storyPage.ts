import { defineArrayMember, defineField, defineType } from "sanity";
import { DEFAULT_STORY_COPY as D } from "@/lib/story-copy";

const HEADLINE = "A new line is a line break. Put *asterisks* around words to set them in the accent color.";
const text = (name: string, title: string, rows?: number, description?: string) =>
  defineField({ name, title, type: rows ? "text" : "string", rows, description });
const paragraphs = (name: string, title: string, description?: string) =>
  defineField({ name, title, type: "array", description, of: [defineArrayMember({ type: "text", rows: 5 })] });
const photo = (name: string, title: string, description: string) =>
  defineField({
    name, title, type: "image", options: { hotspot: true }, description: `${description} Drag the hotspot to choose what stays in frame.`,
    fields: [defineField({ name: "alt", title: "Alt text", type: "string", description: "Describe the photo for screen readers." })],
  });
const button = (name: string, title: string) =>
  defineField({
    name, title, type: "object", options: { collapsible: false },
    fields: [text("label", "Label"), text("link", "Link", undefined, "A site path like /coffees, a #section, or a full URL.")],
  });
const section = (name: string, title: string, fields: ReturnType<typeof defineField>[], description?: string) =>
  defineField({ name, title, type: "object", description, options: { collapsible: false }, fields });

/** Every word and photo on /our-story. */
export const storyPage = defineType({
  name: "storyPage",
  title: "Our story page",
  type: "document",
  initialValue: D,
  fields: [
    section("hero", "Hero", [
      text("eyebrow", "Eyebrow"),
      text("headline", "Headline", 2, HEADLINE),
      text("body", "Line under the headline"),
      button("button", "Button"),
      photo("image", "Photo", "Full screen behind the headline. Wide, at least 2400 px: people over coffee."),
    ]),
    section("story", "Our story", [
      text("eyebrow", "Eyebrow"),
      text("headline", "Headline", 2, HEADLINE),
      photo("image", "Photo", "4:5, beside the story: early Mernin' (first roasts, filming)."),
      text("caption", "Photo caption"),
      paragraphs("before", "Paragraphs before the two photos"),
      photo("pairLeft", "Left photo", "4:3, between the paragraphs: the co-ferments or funky lots."),
      photo("pairRight", "Right photo", "3:4, between the paragraphs: a behind-the-camera shot."),
      paragraphs("after", "Paragraphs after the two photos"),
    ]),
    section("band", "Full-width photo", [
      photo("image", "Photo", "Full width between the story and the name: two cups, one table."),
    ]),
    section("meaning", "The name", [
      text("eyebrow", "Eyebrow"),
      text("ratio", "Big ratio", undefined, "The colon is set in the accent color."),
      text("ratioTitle", "Left column title"),
      text("ratioBody", "Left column text", 5),
      text("barIn", "Bar label, left"),
      text("barOut", "Bar label, right"),
      text("tableTitle", "Right column title"),
      text("tableBody", "Right column text", 5),
      photo("tableImage", "Right column photo", "16:10: a pop-up."),
    ], "The dark section with the big 1:2."),
    section("different", "What I'm doing differently", [
      text("eyebrow", "Eyebrow"),
      text("headline", "Headline", 2, HEADLINE),
      paragraphs("body", "Paragraphs"),
      photo("image", "Photo", "Square: the One Two coffees."),
    ]),
    section("closing", "Closing", [
      text("eyebrow", "Eyebrow"),
      text("headline", "Headline", 2, HEADLINE),
      text("body", "Text", 2),
      button("button", "Button"),
      photo("image", "Photo", "Behind the closing words: an Austin pop-up crowd."),
    ]),
    section("seo", "SEO", [text("title", "Page title"), text("description", "Search description", 3)]),
  ],
  preview: { prepare: () => ({ title: "Our story page" }) },
});
