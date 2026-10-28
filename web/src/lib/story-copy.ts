// The Our Story page's words (design: One Two Our Story.html). These are the
// defaults: the "Our story page" document in Sanity (/studio) overrides any of
// them, and a field left empty there falls back to what's written here.
//
// Headlines: a new line is a line break, and *words in asterisks* are set in
// the accent color (as on the landing and farms pages).
import type { Button } from "@/lib/landing-copy";

export const DEFAULT_STORY_COPY = {
  seo: {
    title: "Our story",
    description: "One Two Coffee grew out of Mernin' Coffee. Where we started, what the 1:2 means, and where we're headed.",
  },
  hero: {
    eyebrow: "Our story",
    headline: "One Two Coffee.",
    body: "Unusual coffees, blended your way.",
    button: { label: "Shop the coffees", link: "/coffees" } as Button,
  },
  story: {
    eyebrow: "Our story",
    headline: "Mernin’\n*2024–26*",
    caption: "Mernin' · March 2024",
    // The two photos sit between these paragraphs and the next ones.
    before: [
      "One Two started with Mernin' Coffee, which we launched in March 2024 without any experience in the coffee industry. We didn't know how to source green coffee or what a good roast profile looked like, so we figured it out as we went and filmed most of it along the way.",
      "Mernin' is where we fell in love with coffee, and it turned out a lot of people fell in love with us too. About 30,000 of them followed along, and the coffees they liked most were the strange ones, the co-ferments and funky lots we'd been nervous to put out. Two of them went on to start their own coffee businesses after watching our videos about starting one as complete beginners, and we're still proud of that.",
    ],
    after: [
      "Mernin' taught us most of what we know about coffee and a lot about the kind of company we want to run. In May 2026 we wrapped it up and started One Two to build on all of it, with our time going into the coffee itself: finding it, roasting it, and meeting the people who drink it.",
    ],
  },
  meaning: {
    eyebrow: "The name",
    ratio: "1:2",
    ratioTitle: "The ratio",
    ratioBody: "1:2 is the ratio for a standard espresso shot: one gram of coffee in, two grams of espresso out. Ratios are a big part of how One Two works. We focus on unusual coffees, and you can blend them yourself in whatever proportions you like until you find one you want to drink every day.",
    barIn: "1 g in",
    barOut: "2 g out",
    tableTitle: "The table",
    tableBody: "The name also stands for one cup of coffee between two people. We want One Two to be something you share, whether that's at one of our pop-ups in Austin or over a blend you worked out with a friend.",
  },
  different: {
    eyebrow: "Where we're headed",
    headline: "Coffee *first.*",
    body: [
      "One Two is a coffee company first. We look for unusual coffees, like co-ferments and experimental lots, and sell them so you can blend them however you like.",
      "When we post, it'll be about the coffees we're selling, the farms they come from, and where our next pop-up in Austin is. We'd like to meet as many of you in person as we can.",
      "We'll keep sharing what we learn along the way, including the mistakes. If you're thinking about starting something of your own, we hope it helps.",
    ],
  },
  closing: {
    eyebrow: "Austin, TX",
    headline: "If you're in Austin, come find us at a pop-up.",
    body: "If you're not, pick a couple of coffees and try blending them.",
    button: { label: "Shop the coffees", link: "/coffees" } as Button,
  },
};

export type StoryCopy = typeof DEFAULT_STORY_COPY;
