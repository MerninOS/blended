// Sanity Studio for the landing page content. Sign in with a Sanity account
// that's a member of the Blended Coffee project.
import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export const dynamic = "force-static";
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
