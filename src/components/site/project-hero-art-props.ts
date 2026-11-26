import type { Section, SiteLanguage } from "@/lib/types";

export interface ProjectHeroArtProps {
  section: Section;
  pageSections: readonly Section[];
  language: SiteLanguage;
  editable: boolean;
}
