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
    description: "One Two Coffee started as Mernin' Coffee in 2024. What happened, what I learned, and why the name is a ratio.",
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
      "I started Mernin' Coffee in March 2024 with no experience in the coffee industry. I didn't know how to source green coffee or what a good roast profile looked like. I decided to bet on myself and figure it out, and I filmed most of it along the way.",
      "Some of it worked. About 30,000 people ended up following the account, and the coffees that sold best were the strange ones, like the co-ferments and the funkier lots I was nervous to put out. Two people reached out to tell me they'd started their own coffee businesses after watching my videos about starting one as a complete beginner. Out of everything that came from Mernin', that's what I'm proudest of.",
    ],
    after: [
      "Over time, though, I lost sight of what I was building. There were stretches where I went months without a coffee sale, and times I didn't have any green coffee on hand because I was focused on the next video. I honestly couldn't have told you whether I was running a coffee company, an Instagram page, or trying to be an influencer. I was chasing the next viral post instead of building a business that would last.",
      "It also bothered me that the videos were made to hold people's attention on their phones. Coffee had always been the opposite of that for me, a reason to slow down for a few minutes or sit across from someone. In May 2026 I shut the Mernin' site down.",
      "I still love coffee, and I still love the people I met because of it. One Two is my second attempt, built around what I learned the first time.",
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
    tableBody: "The name also stands for one cup of coffee between two people. Most of the best things that came out of Mernin' happened in person, at pop-ups and over coffee with people I'd first met online.",
  },
  different: {
    eyebrow: "What I'm doing differently",
    headline: "Coffee *first.*",
    body: [
      "I'm keeping the focus on coffee. Mernin' tried to be a lot of things at once, and One Two is a coffee company.",
      "When I post, it'll be about the coffees we're selling, where they came from, or where our next pop-up in Austin is. Those were always the posts that felt most like me, and they're the ones that got people to show up in person.",
      "I'll keep sharing what I learn, including the mistakes, because that's what helped those two people get started. If you're thinking about starting something in an industry you know nothing about, I was in the same spot in 2024.",
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
