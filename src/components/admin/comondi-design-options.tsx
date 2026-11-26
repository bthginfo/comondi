"use client";

import { Check } from "lucide-react";
import type { ColorPalette, ComondiDesign, SiteConfig } from "@/lib/types";
import { comondiDesignNames, comondiMotion } from "@/lib/comondi-motion";
import { useAdminLanguage } from "./admin-language";

/**
 * co:mondi renders its own two designs (Kosmos, Atlas) instead of the starter layouts. The design area
 * offers them in “Stil” and restores the co:mondi colours instead of a starter palette.
 */
export const isComondiSite = (config: SiteConfig) => Boolean(config.comondiMotion);

/** The published co:mondi colours (navy space, pink accent), used by “Originalfarben des Designs”. */
export const comondiOriginalPalette: ColorPalette = { primary: "#0b1020", accent: "#ed62b9", background: "#060a15", text: "#f2f3f8", surface: "#121a2c", border: "#263048" };

export function comondiOriginalColors(config: SiteConfig): SiteConfig {
  const { brandColor: _brand, paletteStyle: _style, ...theme } = config.theme;
  return { ...config, theme: { ...theme, primary: "#060a15", accent: comondiOriginalPalette.accent, background: "#060a15", palettes: { ...theme.palettes, 1: comondiOriginalPalette } } };
}

const tileColors: Record<ComondiDesign, string[]> = {
  kosmos: ["#060a15", "#131b30", "#ed62b9", "#f4f5fa"],
  atlas: ["#f2f4f9", "#ffffff", "#e4559f", "#1a1640"],
};

export function ComondiDesignTiles({ config, onChange }: { config: SiteConfig; onChange: (config: SiteConfig) => void }) {
  const { t } = useAdminLanguage();
  const settings = comondiMotion(config.comondiMotion);
  const current = settings.design ?? "kosmos";
  return <section className="cms-design-group" aria-labelledby="cms-variant-heading">
    <h3 id="cms-variant-heading">{t("Design")}</h3>
    <p className="cms-hint">{t("Kosmos zeigt die dunkle Weltraumszene, Atlas den hellen Kartenentwurf. Texte und Bilder bleiben erhalten.")}</p>
    <div className="cms-design-tiles cms-design-tiles--variants" role="radiogroup" aria-labelledby="cms-variant-heading">
      {(Object.keys(comondiDesignNames) as ComondiDesign[]).map(value => <button key={value} type="button" role="radio" aria-checked={current === value} className="cms-design-tile" onClick={() => onChange({ ...config, comondiMotion: { ...settings, design: value } })}>
        <span className="cms-design-tile-art" aria-hidden="true">{tileColors[value].map(color => <i key={color} style={{ background: color }} />)}</span>
        <span className="cms-design-tile-label">{comondiDesignNames[value]}{current === value && <Check size={15} aria-hidden="true" />}</span>
      </button>)}
    </div>
  </section>;
}
