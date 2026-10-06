// Sanity project for the landing page content (Blended Coffee organization).
// Public values: the Studio at /studio runs in the browser and needs them too.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "sf429892";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2025-02-19";
/** The one landing page document (a singleton with a fixed id). */
export const LANDING_ID = "landingPage";
/** The one site settings document (titles, description, share image). */
export const SITE_ID = "siteSettings";
