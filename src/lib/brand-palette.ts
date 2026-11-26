import { contrast, hexToOklch, isHexColor, normalizeHex, oklchToHex, type Oklch } from "./cms-accent";
import type { ColorPalette } from "./types";

/**
 * Palette proposals from one brand colour. Every proposal is contrast-checked (WCAG AA) and, where needed,
 * corrected automatically; the notes explain the correction in plain German.
 */
export type PaletteStyle = "clear" | "soft" | "vivid" | "dark";
export type PaletteProposal = { id: PaletteStyle; name: string; description: string; palette: ColorPalette; notes: string[] };
export type PaletteCheck = { text: number; surfaceText: number; button: number; buttonText: string; ok: boolean };

const DARK_TEXT = "#142b27";
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const tone = (seed: Oklch, l: number, c: number, hueShift = 0): string => oklchToHex({ l, c, h: (seed.h + hueShift + 360) % 360 });

/** The text colour a button with this background uses (same rule as the public site). */
export function buttonTextFor(background: string): string {
  return contrast(DARK_TEXT, background) >= contrast("#ffffff", background) ? DARK_TEXT : "#ffffff";
}

export function checkPalette(palette: ColorPalette): PaletteCheck {
  const buttonText = buttonTextFor(palette.accent);
  const text = contrast(palette.text, palette.background);
  const surfaceText = contrast(palette.text, palette.surface);
  const button = contrast(buttonText, palette.accent);
  return { text, surfaceText, button, buttonText, ok: text >= 4.5 && surfaceText >= 4.5 && button >= 4.5 };
}

function moveUntil(hex: string, direction: -1 | 1, test: (value: string) => boolean): string {
  let color = hexToOklch(hex);
  for (let step = 0; step < 90 && !test(oklchToHex(color)); step++) color = { ...color, l: clamp(color.l + direction * 0.01, 0, 1) };
  return oklchToHex(color);
}

/** Corrects text and button colours so the palette stays readable. */
export function fixPalette(input: ColorPalette): { palette: ColorPalette; notes: string[] } {
  const palette = { ...input }; const notes: string[] = [];
  const darkBackground = hexToOklch(palette.background).l < 0.55;
  if (contrast(palette.text, palette.background) < 4.5 || contrast(palette.text, palette.surface) < 4.5) {
    palette.text = moveUntil(palette.text, darkBackground ? 1 : -1, value => contrast(value, palette.background) >= 4.6 && contrast(value, palette.surface) >= 4.6);
    notes.push(darkBackground ? "Textfarbe heller gesetzt, damit sie gut lesbar bleibt." : "Textfarbe dunkler gesetzt, damit sie gut lesbar bleibt.");
  }
  if (contrast(buttonTextFor(palette.accent), palette.accent) < 4.5) {
    const lighter = moveUntil(palette.accent, 1, value => contrast(buttonTextFor(value), value) >= 4.6);
    const darker = moveUntil(palette.accent, -1, value => contrast(buttonTextFor(value), value) >= 4.6);
    const original = hexToOklch(palette.accent).l;
    palette.accent = Math.abs(hexToOklch(lighter).l - original) <= Math.abs(hexToOklch(darker).l - original) ? lighter : darker;
    notes.push("Akzentfarbe leicht angepasst, damit die Schrift auf Schaltflächen gut lesbar ist.");
  }
  return { palette, notes };
}

export function paletteProposals(brand: string): PaletteProposal[] {
  const base = isHexColor(brand) ? normalizeHex(brand) : "#2563c9";
  const seed = hexToOklch(base);
  const grey = seed.c < 0.025;
  const chroma = grey ? 0 : seed.c;
  const ink = tone(seed, 0.24, grey ? 0 : Math.min(chroma, 0.07));
  const deep = tone(seed, clamp(seed.l, 0.3, 0.42), grey ? 0 : clamp(chroma, 0.06, 0.16));
  const raw: Omit<PaletteProposal, "notes">[] = [
    { id: "clear", name: "Klar", description: "Heller Grund, Ihre Farbe für Schaltflächen und Akzente.", palette: {
      primary: ink, text: ink, accent: base, background: tone(seed, 0.985, grey ? 0 : 0.006), surface: tone(seed, 0.955, grey ? 0 : Math.min(chroma, 0.02)), border: tone(seed, 0.86, grey ? 0 : Math.min(chroma, 0.03)),
    } },
    { id: "soft", name: "Weich", description: "Sanft getönte Flächen in Ihrer Farbe, ruhig und warm.", palette: {
      primary: deep, text: ink, accent: base, background: tone(seed, 0.962, grey ? 0 : Math.min(chroma, 0.025)), surface: tone(seed, 0.925, grey ? 0 : Math.min(chroma, 0.04)), border: tone(seed, 0.82, grey ? 0 : Math.min(chroma, 0.05)),
    } },
    { id: "vivid", name: "Kräftig", description: "Ihre Farbe für Überschriften, ein leuchtender Gegenakzent.", palette: {
      primary: deep, text: deep, accent: tone(seed, 0.88, grey ? 0.16 : clamp(chroma, 0.12, 0.17), grey ? 120 : 150), background: "#ffffff", surface: tone(seed, 0.965, grey ? 0 : Math.min(chroma, 0.018)), border: tone(seed, 0.86, grey ? 0 : Math.min(chroma, 0.04)),
    } },
    { id: "dark", name: "Dunkel", description: "Dunkler Auftritt, Ihre Farbe hell als Akzent.", palette: {
      primary: tone(seed, 0.96, grey ? 0 : 0.01), text: tone(seed, 0.95, grey ? 0 : 0.012), accent: tone(seed, 0.78, grey ? 0 : clamp(chroma, 0.08, 0.15)), background: tone(seed, 0.17, grey ? 0 : Math.min(chroma, 0.03)), surface: tone(seed, 0.23, grey ? 0 : Math.min(chroma, 0.035)), border: tone(seed, 0.36, grey ? 0 : Math.min(chroma, 0.04)),
    } },
  ];
  return raw.map(proposal => { const fixed = fixPalette(proposal.palette); return { ...proposal, palette: fixed.palette, notes: fixed.notes }; });
}

/** Dominant, colourful tones of an image (RGBA pixels), most useful first. Greys and near-white/black are skipped. */
export function dominantColors(pixels: Uint8ClampedArray | number[], limit = 5): string[] {
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  for (let index = 0; index + 3 < pixels.length; index += 4) {
    if (pixels[index + 3] < 200) continue;
    const r = pixels[index], g = pixels[index + 1], b = pixels[index + 2];
    const key = [r, g, b].map(value => value >> 4).join(",");
    const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, count: 0 };
    bucket.r += r; bucket.g += g; bucket.b += b; bucket.count++;
    buckets.set(key, bucket);
  }
  const candidates = [...buckets.values()].map(bucket => {
    const hex = "#" + [bucket.r, bucket.g, bucket.b].map(value => Math.round(value / bucket.count).toString(16).padStart(2, "0")).join("");
    const { l, c } = hexToOklch(hex);
    return { hex, l, c, score: bucket.count * (0.2 + c * 6) };
  }).filter(entry => entry.c >= 0.04 && entry.l > 0.18 && entry.l < 0.95).sort((a, b) => b.score - a.score);
  const result: { hex: string; h: number }[] = [];
  for (const entry of candidates) {
    const h = hexToOklch(entry.hex).h;
    if (result.some(chosen => Math.min(Math.abs(chosen.h - h), 360 - Math.abs(chosen.h - h)) < 18)) continue;
    result.push({ hex: entry.hex, h });
    if (result.length >= limit) break;
  }
  return result.map(entry => entry.hex);
}
