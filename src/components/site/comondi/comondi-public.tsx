"use client";

import dynamic from "next/dynamic";
import { useId, type CSSProperties } from "react";
import { cmsAppearanceCss } from "@/lib/cms-appearance";
import { ConsentManager } from "../consent";
import { ContentLink, SiteInteractionContext } from "../editable";
import { PageHeadingProvider, SectionHeadingProvider } from "../heading-level";
import type { SiteViewProps } from "../site-view";
import type { Section } from "@/lib/types";
import { ComondiSection, ComondiSite } from "./comondi";

const GenericSection = dynamic(() => import("../site-view").then(module => module.SectionRenderer));
const publicInteraction = { isolated: false, clientAnchors: true };

/** The public brand loads without the template's other design variants and editor surfaces. */
export function ComondiPublicSite(props: Pick<SiteViewProps, "page" | "site" | "cartHref" | "translations" | "consent">) {
  const appearanceId = useId();
  const appearance = cmsAppearanceCss(appearanceId, props.page.sections);
  const firstHeadingId = props.page.sections.find(section => section.visible && section.content.heading.trim())?.id || null;
  const style = { "--ws-ink": "#eef0f8", "--ws-paper": props.site.theme.background, "--ws-accent": props.site.theme.accent, "--font-body": "'Manrope Variable',sans-serif", "--ws-radius": "24px" } as CSSProperties;
  const fallback = (section: Section) => <SectionHeadingProvider key={section.id} sectionId={section.id}>{section.type === "richtext" ? <ComondiSection section={{ ...section, type: "comondi-legal" }} site={props.site} /> : <GenericSection section={section} site={props.site} />}</SectionHeadingProvider>;
  return <SiteInteractionContext.Provider value={publicInteraction}><PageHeadingProvider firstSectionId={firstHeadingId}><div className="ws-site comondi-site-root" lang="de" style={style} data-cms-style-scope={appearanceId}>
    {appearance && <style>{appearance}</style>}
    <ContentLink className="ws-skip-link" href="#hauptinhalt">Zum Inhalt springen</ContentLink>
    <ComondiSite {...props} fallback={fallback} />
    <ConsentManager site={props.site} language="de" published={props.consent} />
  </div></PageHeadingProvider></SiteInteractionContext.Provider>;
}
