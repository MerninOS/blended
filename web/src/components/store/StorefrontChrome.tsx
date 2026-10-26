"use client";
// The store pages' header: the shared SiteHeader, laid over the Lab's bag stage and the farms and story heroes and in place
// everywhere else, with the section it's on marked in its menu.
import { usePathname } from "next/navigation";
import { SiteHeader, type HeaderSection } from "./SiteHeader";

const sectionOf = (path: string): HeaderSection =>
  path.startsWith("/lab") ? "lab" : path.startsWith("/farms") ? "farmers" : path.startsWith("/our-story") ? "story" : path.startsWith("/wholesale") ? "wholesale" : path.startsWith("/coffees") ? "coffees"
    : path.startsWith("/collections/merch-and-gear") || path.startsWith("/products/") ? null
    : path.startsWith("/collections/merch") ? "merch" : path.startsWith("/collections/gear") ? "gear" : null;

export function StorefrontChrome({ exclusives }: { exclusives?: boolean }) {
  const path = usePathname();
  const section = sectionOf(path);
  return <SiteHeader key={path} active={section} overlay={section === "lab" || section === "farmers" || section === "story"} exclusives={exclusives} />;
}
