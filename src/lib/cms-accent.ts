/**
 * Adaptive CMS accent: the workspace takes its accent from the website's brand colour.
 *
 * The brand colour is converted to OKLCH, its hue is kept and lightness/chroma are moved into a range
 * that guarantees readable text on the accent (≥ 4.5:1) and visible focus rings (≥ 3:1) in light and dark
 * mode. Greys, near-white and near-black brand colours have no usable hue; they fall back to a calm blue.
 * Pure functions without DOM access, shared by the admin shell, the design studio and the tests.
 */

export type Oklch = { l: number; c: number; h: number };
export type CmsAccentTokens = {
  /** Filled buttons, selected switches, progress. */
  accent: string;
  accentHover: string;
  accentPressed: string;
  /** Text and icons placed on the accent fill. */
  onAccent: string;
  /** Accent-coloured text, links and icons on the workspace surfaces. */
  accentText: string;
  /** Selected rows, active navigation, soft chips. */
  tint: string;
  tintStrong: string;
  /** Focus ring (≥ 3:1 against the workspace background). */
  ring: string;
  /** Translucent accent for shadows and background washes. */
  glow: string;
  wash: string;
  /** Neutral glass surfaces, very slightly tinted by the accent hue. */
  canvas: string;
  surface: string;
};
export type CmsAccentPalette = {
  source: "brand" | "fallback";
  /** The colour the accent was derived from (normalized hex) or the fallback. */
  from: string;
  hue: number;
  light: CmsAccentTokens;
  dark: CmsAccentTokens;
};

const HEX = /^#(?:[\da-f]{3}|[\da-f]{6})$/i;
export const CMS_FALLBACK_ACCENT = "#2563c9";
/** Light workspace and dark workspace backgrounds the contrast guarantees are measured against. */
export const CMS_LIGHT_CANVAS = "#f4f5f7";
export const CMS_DARK_CANVAS = "#16171a";
const LIGHT_SURFACE = "#ffffff";
const DARK_SURFACE = "#232428";

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value.trim());
}

export function normalizeHex(value: string): string {
  const raw = value.trim().replace("#", "").toLowerCase();
  const full = raw.length === 3 ? raw.split("").map(character => character + character).join("") : raw;
  return "#" + full;
}

function hexToRgb(hex: string): [number, number, number] {
  const value = normalizeHex(hex).slice(1);
  return [0, 2, 4].map(index => parseInt(value.slice(index, index + 2), 16) / 255) as [number, number, number];
}

const toLinear = (channel: number) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
const fromLinear = (channel: number) => channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;

export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const c = Math.sqrt(A * A + B * B);
  const h = c < 1e-4 ? 0 : (Math.atan2(B, A) * 180 / Math.PI + 360) % 360;
  return { l: L, c, h };
}

function oklchToLinear({ l: L, c, h }: Oklch): [number, number, number] {
  const A = c * Math.cos(h * Math.PI / 180), B = c * Math.sin(h * Math.PI / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb: number[]) => rgb.every(channel => channel >= -1e-4 && channel <= 1 + 1e-4);

/** OKLCH → hex; chroma is reduced until the colour fits into sRGB (keeps hue and lightness). */
export function oklchToHex(color: Oklch): string {
  let { c } = color;
  let rgb = oklchToLinear({ ...color, c });
  for (let step = 0; step < 40 && !inGamut(rgb); step++) { c *= 0.92; rgb = oklchToLinear({ ...color, c }); }
  return "#" + rgb.map(channel => Math.round(Math.min(1, Math.max(0, fromLinear(Math.min(1, Math.max(0, channel))))) * 255)
    .toString(16).padStart(2, "0")).join("");
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(first: string, second: string): number {
  const [a, b] = [relativeLuminance(first), relativeLuminance(second)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Moves lightness in small steps until `test` passes (or the limit is reached). */
function nudge(color: Oklch, direction: -1 | 1, test: (hex: string) => boolean, limit: number): Oklch {
  let next = { ...color };
  for (let step = 0; step < 80 && !test(oklchToHex(next)); step++) {
    const l = next.l + direction * 0.01;
    if (direction < 0 ? l < limit : l > limit) break;
    next = { ...next, l };
  }
  return next;
}

/** Whether a brand colour carries a usable hue (not grey, near-white or near-black). */
export function usableBrandColor(hex: string): boolean {
  if (!isHexColor(hex)) return false;
  const { l, c } = hexToOklch(hex);
  if (l > 0.965 || l < 0.12) return false;
  return c >= 0.03;
}

function alpha(hex: string, opacity: number) {
  const [r, g, b] = hexToRgb(hex).map(channel => Math.round(channel * 255));
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function tokensFor(seed: Oklch, scheme: "light" | "dark"): CmsAccentTokens {
  const { h } = seed;
  const chroma = clamp(seed.c, 0.085, 0.16);
  if (scheme === "light") {
    // White text on the fill needs 4.5:1; darker lightness is the only safe direction.
    let fill = { l: clamp(seed.l, 0.42, 0.56), c: chroma, h };
    fill = nudge(fill, -1, hex => contrast(hex, "#ffffff") >= 4.6 && contrast(hex, CMS_LIGHT_CANVAS) >= 3.2, 0.2);
    const accent = oklchToHex(fill);
    const text = oklchToHex(nudge(fill, -1, hex => contrast(hex, LIGHT_SURFACE) >= 4.8 && contrast(hex, CMS_LIGHT_CANVAS) >= 4.6, 0.2));
    return {
      accent,
      accentHover: oklchToHex({ ...fill, l: fill.l - 0.05 }),
      accentPressed: oklchToHex({ ...fill, l: fill.l - 0.09 }),
      onAccent: "#ffffff",
      accentText: text,
      tint: oklchToHex({ l: 0.955, c: Math.min(chroma * 0.28, 0.035), h }),
      tintStrong: oklchToHex({ l: 0.915, c: Math.min(chroma * 0.45, 0.06), h }),
      ring: accent,
      glow: alpha(accent, 0.22),
      wash: alpha(oklchToHex({ l: 0.8, c: Math.min(chroma, 0.12), h }), 0.32),
      canvas: oklchToHex({ l: 0.968, c: 0.0045, h }),
      surface: oklchToHex({ l: 0.992, c: 0.0018, h }),
    };
  }
  // Dark mode: a light accent with dark text on it; the accent text must stay readable on dark glass.
  let fill = { l: clamp(seed.l, 0.7, 0.8), c: Math.min(chroma, 0.14), h };
  const on = oklchToHex({ l: 0.2, c: Math.min(chroma * 0.4, 0.04), h });
  fill = nudge(fill, 1, hex => contrast(hex, on) >= 4.8 && contrast(hex, CMS_DARK_CANVAS) >= 3.2, 0.95);
  const accent = oklchToHex(fill);
  const text = oklchToHex(nudge(fill, 1, hex => contrast(hex, DARK_SURFACE) >= 4.8 && contrast(hex, CMS_DARK_CANVAS) >= 4.6, 0.97));
  return {
    accent,
    accentHover: oklchToHex({ ...fill, l: Math.min(0.92, fill.l + 0.05) }),
    accentPressed: oklchToHex({ ...fill, l: fill.l - 0.04 }),
    onAccent: on,
    accentText: text,
    tint: oklchToHex({ l: 0.3, c: Math.min(chroma * 0.35, 0.045), h }),
    tintStrong: oklchToHex({ l: 0.36, c: Math.min(chroma * 0.5, 0.07), h }),
    ring: accent,
    glow: alpha(accent, 0.26),
    wash: alpha(oklchToHex({ l: 0.45, c: Math.min(chroma, 0.12), h }), 0.34),
    canvas: oklchToHex({ l: 0.19, c: 0.006, h }),
    surface: oklchToHex({ l: 0.245, c: 0.007, h }),
  };
}

/**
 * Derives the CMS accent from the website's colours. The first usable colour wins (brand colour first,
 * then the accent colour); otherwise the calm fallback blue is used.
 */
export function deriveCmsAccent(candidates: readonly (string | undefined)[]): CmsAccentPalette {
  const brand = candidates.find((value): value is string => typeof value === "string" && usableBrandColor(value));
  const from = brand ? normalizeHex(brand) : CMS_FALLBACK_ACCENT;
  const seed = hexToOklch(from);
  return { source: brand ? "brand" : "fallback", from, hue: Math.round(seed.h), light: tokensFor(seed, "light"), dark: tokensFor(seed, "dark") };
}

const tokenNames: Record<keyof CmsAccentTokens, string> = {
  accent: "accent", accentHover: "accent-hover", accentPressed: "accent-pressed", onAccent: "on-accent", accentText: "accent-text",
  tint: "accent-tint", tintStrong: "accent-tint-strong", ring: "ring", glow: "accent-glow", wash: "accent-wash", canvas: "canvas", surface: "surface-tint",
};

/** CSS custom properties for the admin root: `--cms-l-*` (light) and `--cms-d-*` (dark). */
export function cmsAccentVariables(palette: CmsAccentPalette): Record<string, string> {
  const result: Record<string, string> = { "--cms-accent-hue": String(palette.hue) };
  for (const [key, name] of Object.entries(tokenNames) as [keyof CmsAccentTokens, string][]) {
    result["--cms-l-" + name] = palette.light[key];
    result["--cms-d-" + name] = palette.dark[key];
  }
  return result;
}

type BrandColors = { primary?: string; accent?: string; background?: string };

/** A "primary" colour that is practically the page background (dark sites) is a surface, not what the brand is recognised by. */
function surfaceColor(color: string | undefined, background: string | undefined): boolean {
  return isHexColor(color) && isHexColor(background) && contrast(color, background) < 1.3;
}

/** The colours of a site that represent its brand, most important first. */
export function brandCandidates(theme: { brandColor?: string; palettes?: Partial<Record<number, BrandColors>> } & BrandColors, variant = 1): string[] {
  const palette = theme.palettes?.[variant];
  const primary = [palette?.primary, theme.primary].filter(color => !surfaceColor(color, palette?.background ?? theme.background));
  return [theme.brandColor, ...primary, palette?.accent, theme.accent].filter((value): value is string => isHexColor(value));
}
