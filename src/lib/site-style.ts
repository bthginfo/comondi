import { z } from "zod";
import { CMS_TYPEFACES, cmsTypeface, type CmsTypeface } from "./cms-typefaces";
import type { SiteConfig, SiteStyleSettings } from "./types";

/**
 * Site-wide style presets of the CMS design area. Every option is optional and absent by default,
 * so existing websites keep their look until somebody chooses something in “Design”.
 */
const typeface = z.enum(Object.keys(CMS_TYPEFACES) as [CmsTypeface, ...CmsTypeface[]]);
const hex = z.string().regex(/^#(?:[\da-fA-F]{3}|[\da-fA-F]{6})$/);
export const siteStyleSchema = z.object({
  headingFont: typeface.optional(),
  bodyFont: typeface.optional(),
  typeScale: z.enum(["compact", "balanced", "generous"]).optional(),
  buttonShape: z.enum(["rounded", "pill", "square"]).optional(),
  density: z.enum(["compact", "balanced", "airy"]).optional(),
  imageStyle: z.enum(["natural", "rounded", "framed"]).optional(),
  logo: z.object({
    url: z.string().max(2048).regex(/^(?:\/(?!\/)|https:\/\/)/, "Bitte ein Bild aus der Mediathek wählen."),
    alt: z.string().max(300),
    showName: z.boolean().optional(),
  }).optional(),
  brandColor: hex.optional(),
  paletteStyle: z.enum(["clear", "soft", "vivid", "dark"]).optional(),
});

export type FontPairing = { id: string; name: string; description: string; heading?: CmsTypeface; body?: CmsTypeface };
/** Curated, legible pairs of locally hosted families (no external font requests). */
export const FONT_PAIRINGS: readonly FontPairing[] = [
  { id: "design", name: "Wie im Design vorgesehen", description: "Die Schriften des gewählten Designs." },
  { id: "modern", name: "Klar & modern", description: "Sachlich, gut lesbar, für fast jede Branche.", heading: "manrope", body: "dm-sans" },
  { id: "friendly", name: "Freundlich", description: "Runde Formen, offen und zugänglich.", heading: "outfit", body: "inter" },
  { id: "elegant", name: "Elegant", description: "Klassische Serifen für Überschriften, ruhiger Text.", heading: "playfair-display", body: "manrope" },
  { id: "warm", name: "Warm & persönlich", description: "Weiche Serifen mit Charakter.", heading: "fraunces", body: "dm-sans" },
  { id: "refined", name: "Fein & edel", description: "Zarte Antiqua, viel Weißraum.", heading: "cormorant-garamond", body: "manrope" },
  { id: "strong", name: "Kräftig", description: "Schmale, starke Überschriften für Handwerk und Sport.", heading: "oswald", body: "inter" },
  { id: "technical", name: "Technisch", description: "Präzise Formen für Technik und Agenturen.", heading: "space-grotesk", body: "inter" },
  { id: "factual", name: "Nüchtern", description: "Kompakte Groteskschrift, sehr sachlich.", heading: "archivo", body: "inter" },
];

export function currentPairing(theme: SiteStyleSettings): string {
  return FONT_PAIRINGS.find(pairing => pairing.heading === theme.headingFont && pairing.body === theme.bodyFont)?.id ?? (theme.headingFont || theme.bodyFont ? "custom" : "design");
}

export const TYPE_SCALES = [
  { id: "compact", name: "Kompakt" }, { id: "balanced", name: "Ausgewogen" }, { id: "generous", name: "Großzügig" },
] as const;
export const RADIUS_PRESETS = [
  { id: "square", name: "Eckig", radius: 0 }, { id: "soft", name: "Sanft", radius: 10 }, { id: "round", name: "Rund", radius: 22 },
] as const;
export const BUTTON_SHAPES = [
  { id: "rounded", name: "Wie die Ecken" }, { id: "pill", name: "Kapsel" }, { id: "square", name: "Kantig" },
] as const;
export const DENSITIES = [
  { id: "compact", name: "Kompakt" }, { id: "balanced", name: "Ausgewogen" }, { id: "airy", name: "Luftig" },
] as const;
export const IMAGE_STYLES = [
  { id: "natural", name: "Natürlich" }, { id: "rounded", name: "Abgerundet" }, { id: "framed", name: "Mit Rahmen" },
] as const;

export function radiusPreset(radius: number): string {
  return RADIUS_PRESETS.reduce((best, preset) => Math.abs(preset.radius - radius) < Math.abs(best.radius - radius) ? preset : best).id;
}

/** Data attributes and custom properties the public renderer and the editor canvas share. */
export function siteStyleAttributes(theme: SiteStyleSettings): { data: Record<string, string>; vars: Record<string, string> } {
  const data: Record<string, string> = {}; const vars: Record<string, string> = {};
  const heading = cmsTypeface(theme.headingFont), body = cmsTypeface(theme.bodyFont);
  // The public renderer sets --font-body and --ws-display inline; a chosen pairing replaces both there.
  if (heading) { data["data-ws-heading-font"] = theme.headingFont!; vars["--ws-heading-font"] = heading; vars["--ws-display"] = heading; vars["--font-display"] = heading; }
  if (body) { data["data-ws-body-font"] = theme.bodyFont!; vars["--ws-body-font"] = body; vars["--font-body"] = body; }
  if (theme.typeScale && theme.typeScale !== "balanced") data["data-ws-type-scale"] = theme.typeScale;
  if (theme.buttonShape && theme.buttonShape !== "rounded") data["data-ws-buttons"] = theme.buttonShape;
  if (theme.density && theme.density !== "balanced") data["data-ws-density"] = theme.density;
  if (theme.imageStyle && theme.imageStyle !== "natural") data["data-ws-images"] = theme.imageStyle;
  return { data, vars };
}

type DesignChange = { key: string; label: string };
const sameJson = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Human summary of what changed in the look of the site, for the publication review. */
export function designChanges(before: SiteConfig, after: SiteConfig): DesignChange[] {
  const a = before.theme, b = after.theme;
  const changes: DesignChange[] = [];
  if (!sameJson(a.palettes, b.palettes) || a.primary !== b.primary || a.accent !== b.accent || a.background !== b.background) changes.push({ key: "colors", label: "Farben" });
  if (a.headingFont !== b.headingFont || a.bodyFont !== b.bodyFont || a.font !== b.font) changes.push({ key: "fonts", label: "Schrift" });
  if ((a.typeScale ?? "balanced") !== (b.typeScale ?? "balanced")) changes.push({ key: "scale", label: "Schriftgröße" });
  if (a.radius !== b.radius || (a.buttonShape ?? "rounded") !== (b.buttonShape ?? "rounded")) changes.push({ key: "shape", label: "Ecken und Schaltflächen" });
  if ((a.density ?? "balanced") !== (b.density ?? "balanced")) changes.push({ key: "density", label: "Abstände" });
  if ((a.imageStyle ?? "natural") !== (b.imageStyle ?? "natural")) changes.push({ key: "images", label: "Bilder" });
  if (!sameJson(a.logo, b.logo)) changes.push({ key: "logo", label: "Logo" });
  if ((before.designVariant ?? 1) !== (after.designVariant ?? 1) || (a.aesthetic ?? "standard") !== (b.aesthetic ?? "standard") || !sameJson(a.glass, b.glass)) changes.push({ key: "design", label: "Design" });
  return changes;
}
