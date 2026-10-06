"use client";
// The Sanity Studio served at /studio (src/app/studio). Editors sign in with
// their Sanity account; it edits the "Landing page" and "Site settings" documents.
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId, LANDING_ID, SITE_ID } from "@/sanity/env";
import { landingPage } from "@/sanity/schema/landingPage";
import { siteSettings } from "@/sanity/schema/siteSettings";

const SINGLETONS = new Set<string>([landingPage.name, siteSettings.name]);

export default defineConfig({
  name: "blended",
  title: "Blended",
  basePath: "/studio",
  projectId,
  dataset,
  apiVersion,
  schema: { types: [landingPage, siteSettings] },
  plugins: [
    structureTool({
      structure: (S) => S.list().title("Content").items([
        S.listItem().title("Landing page").id(LANDING_ID)
          .child(S.document().schemaType(landingPage.name).documentId(LANDING_ID).title("Landing page")),
        S.listItem().title("Site settings").id(SITE_ID)
          .child(S.document().schemaType(siteSettings.name).documentId(SITE_ID).title("Site settings")),
      ]),
    }),
  ],
  document: {
    // One of each: no "new", duplicate or delete.
    newDocumentOptions: (prev) => prev.filter((t) => !SINGLETONS.has(t.templateId)),
    actions: (prev, ctx) => SINGLETONS.has(ctx.schemaType)
      ? prev.filter(({ action }) => !action || !["unpublish", "delete", "duplicate"].includes(action))
      : prev,
  },
});
