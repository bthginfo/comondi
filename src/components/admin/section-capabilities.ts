import type { SectionType } from "@/lib/types";

const aliases: Partial<Record<SectionType, SectionType>> = {
  "comondi-hero":"hero", "comondi-proof":"logos", "comondi-intro":"cards", "comondi-worlds":"services", "comondi-process":"steps", "comondi-culture":"cards", "comondi-cta":"cta", "comondi-inner":"hero", "comondi-team":"team", "comondi-contact":"contact", "comondi-faq":"faq", "comondi-articles":"cards", "comondi-legal":"richtext",
  "assistant-showcase":"cards",
  "creator-engagement":"gallery","creator-journey":"cards",
  "creator-scroll-story":"cards","creator-demo":"cards","creator-remix":"cards","creator-lens":"cards","creator-orbit":"cards",
  "creator-hero":"hero","creator-social":"cards","creator-shop":"cards","creator-tools":"cards","creator-hero-stack":"cards","creator-media-kit":"cards","creator-links":"cards",
  "navy-hero": "hero", "navy-bento": "cards", "navy-service-tabs": "services", "navy-people": "team", "navy-process": "steps", "navy-contact": "contact",
  "editorial-hero": "hero", "cinematic-hero": "hero", "noir-hero": "hero",
  "portrait-mosaic": "team", "portrait-rail": "team", "people-index": "team",
  "service-explorer": "services", "focus-finder": "services", "case-deck": "services",
  "editorial-statement": "statement", "kinetic-statement": "statement", "noir-manifesto": "statement",
  "contact-poster": "cta", "contact-dock": "cta", "noir-contact": "cta",
  "editorial-gallery": "gallery", "image-curtain": "gallery", "stacked-panels": "steps",
};
export function sectionBaseType(type: SectionType): SectionType { return aliases[type] || type; }
export function sectionCapabilities(type: SectionType) {
  const base = sectionBaseType(type); const feed = ["blog-cards", "blog-editorial", "blog-list"].includes(type);
  const creatorEditorial = type === "creator-media-kit" || type === "creator-shop";
  const visualItems = ["scroll-story", "scene-sequence", "workflow-demo", "project-stage", "project-index", "editorial-index"].includes(type);
  return {
    base, feed,
    restaurantMenu: type === 'restaurant-menu',
    reservation: type === 'reservation',
    heroLayout: base === "hero" || type === "showcase-hero",
    newsletter: type === 'newsletter-signup',
    showcase: type === 'newsletter-showcase',
    items: type === "comondi-contact" || visualItems || !feed && ["hero", "services", "team", "split", "faq", "accordion", "steps", "stats", "cards", "affiliate-links", "list", "downloads", "logos", "timeline", "comparison", "columns", "opening-hours", "richtext", "motion-story", "scroll-3d"].includes(base),
    image: type === "reservation" || type === "creator-lens" || creatorEditorial || ["hero", "split", "statement", "contact", "richtext", "cta", "quote", "notice", "video", "map", "motion-story", "scroll-3d", "showcase-hero"].includes(base),
    gallery: type === "creator-hero" || creatorEditorial || base === "gallery" || base === "logos",
    quote: creatorEditorial || base === "quote",
    itemImages: visualItems || !["assistant-showcase","creator-lens"].includes(type) && ["hero", "services", "team", "split", "cards", "affiliate-links", "logos", "timeline", "columns", "richtext", "motion-story"].includes(base),
    icons: !["assistant-showcase","creator-lens","creator-scroll-story"].includes(type) && ["services", "split", "cards", "affiliate-links", "list", "columns"].includes(base),
    columns: type === "project-index" || feed || !["assistant-showcase","creator-tools","creator-lens","creator-orbit","creator-remix","creator-scroll-story","creator-engagement","creator-journey"].includes(type) && ["team", "cards", "affiliate-links", "columns", "stats", "comparison", "gallery", "logos"].includes(base),
    imageSide: ["reservation", "split", "map", "quote", "showcase-hero", "scroll-story", "project-stage", "project-index", "scroll-3d"].includes(base),
  };
}
