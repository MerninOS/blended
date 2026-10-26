import type { Metadata } from "next";
import { getStoryCms } from "@/lib/sanity";
import { storyData } from "@/lib/story";
import { SHARE_IMAGE, SITE_NAME, abs } from "@/lib/seo";
import { plainHeadline } from "@/lib/landing-copy";
import { JsonLd } from "@/components/seo/JsonLd";
import { StoryView } from "@/components/store/story/StoryView";
import "./story.css";

export const revalidate = 300;

const load = async () => storyData(await getStoryCms());

export async function generateMetadata(): Promise<Metadata> {
  const { copy, media } = await load();
  const title = copy.seo.title, description = copy.seo.description;
  const image = media.hero ? { url: media.hero.src, alt: media.hero.alt ?? plainHeadline(copy.hero.headline) } : SHARE_IMAGE;
  return {
    title, description, alternates: { canonical: "/our-story" },
    openGraph: { type: "website", title: `${title} · ${SITE_NAME}`, description, url: abs("/our-story"), images: [image] },
  };
}

export default async function StoryPage() {
  const data = await load();
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "AboutPage", name: data.copy.seo.title, url: abs("/our-story"), description: data.copy.seo.description },
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
            { "@type": "ListItem", position: 2, name: data.copy.seo.title, item: abs("/our-story") },
          ] },
        ],
      }} />
      <StoryView data={data} />
    </>
  );
}
