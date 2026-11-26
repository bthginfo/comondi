import type { MediaAsset, WebsiteContent, Section } from "./types";
import { comondiMotion, comondiPlanetItems } from "./comondi-motion";

export interface ComondiPortraits { eva: MediaAsset; sebastian: MediaAsset }

/** Applies this requested content change to the current snapshot, without reseeding it. */
export function upgradeComondiMotionContent(snapshot: WebsiteContent, portraits: ComondiPortraits): WebsiteContent {
  const content = structuredClone(snapshot);
  content.config.comondiMotion = comondiMotion(content.config.comondiMotion);
  if (!content.config.theme.palettes?.[1]) content.config.theme.palettes = { ...content.config.theme.palettes, 1: {
    primary: "#0b1020", accent: content.config.theme.accent, background: content.config.theme.background,
    text: "#f2f3f8", surface: "#121a2c", border: "#263048",
  } };
  const image = (asset: MediaAsset) => ({ src: asset.url, alt: asset.alt, position: asset.position, width: asset.width, height: asset.height });
  for (const page of content.pages) for (const section of page.sections) {
    for (const entry of section.content.items || []) {
      if (entry.email === "eva.lohmueller@comondi.de" || entry.id === "eva") entry.image = image(portraits.eva);
      if (entry.email === "sebastian.kunerl@comondi.de" || entry.id === "sebastian") entry.image = image(portraits.sebastian);
    }
    if (section.type.startsWith("comondi-") && !["comondi-hero", "comondi-inner", "comondi-legal", "comondi-proof"].includes(section.type) && section.design.animation === "none") section.design.animation = "reveal";
    if (section.type === "comondi-hero") {
      const links = ["/leistungen/projektmanagement", "/leistungen/ki-im-arbeitsalltag", "/leistungen/hybride-zusammenarbeit"];
      section.content.items?.forEach((entry, index) => { if (!entry.href && links[index]) entry.href = links[index]; });
      section.content.items = (section.content.items || []).filter(item => !item.id.startsWith("planet-control-"));
      for (const entry of comondiPlanetItems) {
        const existing = section.content.items.find(item => item.id === entry.id);
        if (existing) { existing.text ??= ""; if (existing.title === "Ziehen & entdecken") existing.title = entry.title; }
        else section.content.items.push({ ...entry });
      }
    }
  }
  const home = content.pages.find(page => page.slug === "");
  if (home && !home.sections.some(section => section.type === "comondi-team")) {
    const source = content.pages.find(page => page.slug === "ueber-uns")?.sections.find(section => section.type === "comondi-team");
    const people: Section = {
      id: "menschen", anchor: "menschen", type: "comondi-team", name: "Die Menschen hinter co:mondi", visible: true,
      design: { theme: "dark", headingFont: "sans", fontScale: 1, radius: 24, border: 0, spacing: "normal", width: "wide", imageSide: "right", columns: 2, animation: "reveal", align: "left" },
      content: { heading: "Verbindung beginnt\nmit Menschen.", subheading: "EVA & SEBASTIAN · CO:MONDI", text: "Zwei erste Ansprechpartner für eure Fragen, Ideen und Herausforderungen. Lasst uns gemeinsam herausfinden, was euer Team weiterbringt.", items: structuredClone(source?.content.items || []) },
    };
    const before = home.sections.findIndex(section => section.type === "comondi-culture" || section.type === "comondi-cta");
    home.sections.splice(before < 0 ? home.sections.length : before, 0, people);
  }
  return content;
}
