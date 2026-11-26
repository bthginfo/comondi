import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import content from "./fixtures/starter-content.json";
import { CMS_DARK_CANVAS, CMS_FALLBACK_ACCENT, CMS_LIGHT_CANVAS, brandCandidates, cmsAccentVariables, contrast, deriveCmsAccent, hexToOklch } from "../src/lib/cms-accent";
import { buttonTextFor, checkPalette, dominantColors, fixPalette, paletteProposals } from "../src/lib/brand-palette";
import { FONT_PAIRINGS, currentPairing, designChanges, siteStyleAttributes, siteStyleSchema } from "../src/lib/site-style";
import { websiteSchema } from "../src/lib/validation";
import type { WebsiteContent } from "../src/lib/types";

const brands = { darkBlue: "#1d3a8a", orange: "#ff7a00", green: "#2e9d4f", pink: "#ff4fa3", nearWhite: "#f8f8f6", nearBlack: "#0b0b0c", neon: "#39ff14", grey: "#808080", starter: "#142b27" };

test("the CMS accent follows the brand hue and always meets the contrast floors", () => {
  for (const [name, brand] of Object.entries(brands)) {
    const accent = deriveCmsAccent([brand]);
    for (const [scheme, tokens, canvas] of [["light", accent.light, CMS_LIGHT_CANVAS], ["dark", accent.dark, CMS_DARK_CANVAS]] as const) {
      assert.ok(contrast(tokens.onAccent, tokens.accent) >= 4.5, `${name} ${scheme}: text on accent`);
      assert.ok(contrast(tokens.ring, canvas) >= 3, `${name} ${scheme}: focus ring`);
      assert.ok(contrast(tokens.accentText, scheme === "light" ? "#ffffff" : "#232428") >= 4.5, `${name} ${scheme}: accent text`);
      assert.ok(contrast(tokens.accentText, tokens.tint) >= 4.5, `${name} ${scheme}: accent text on the tint`);
    }
  }
  for (const brand of [brands.darkBlue, brands.orange, brands.green, brands.pink]) {
    const accent = deriveCmsAccent([brand]);
    assert.equal(accent.source, "brand");
    const difference = Math.abs(hexToOklch(accent.light.accent).h - hexToOklch(brand).h);
    assert.ok(Math.min(difference, 360 - difference) < 12, `hue kept for ${brand}`);
  }
});

test("unusable brand colours fall back to the calm default accent", () => {
  for (const brand of [brands.nearWhite, brands.nearBlack, brands.grey, "not a colour"]) {
    const accent = deriveCmsAccent([brand]);
    assert.equal(accent.source, "fallback");
    assert.equal(accent.from, CMS_FALLBACK_ACCENT);
  }
  // Grey primary, colourful accent: the accent colour wins.
  assert.equal(deriveCmsAccent(["#777777", brands.orange]).from, brands.orange);
  const variables = cmsAccentVariables(deriveCmsAccent([brands.green]));
  assert.match(variables["--cms-l-accent"], /^#[\da-f]{6}$/);
  assert.match(variables["--cms-d-accent"], /^#[\da-f]{6}$/);
});

test("the chosen brand colour leads the accent candidates", () => {
  const theme = { brandColor: brands.pink, primary: "#142b27", accent: "#d6f478", palettes: { 1: { primary: "#000000", accent: "#ffffff" } } };
  assert.deepEqual(brandCandidates(theme, 1), [brands.pink, "#000000", "#142b27", "#ffffff", "#d6f478"]);
});

test("palette proposals are readable for every brand and keep the brand colour where possible", () => {
  for (const brand of Object.values(brands)) {
    const proposals = paletteProposals(brand);
    assert.deepEqual(proposals.map(proposal => proposal.id), ["clear", "soft", "vivid", "dark"]);
    for (const proposal of proposals) {
      const check = checkPalette(proposal.palette);
      assert.ok(check.ok, `${brand} ${proposal.id}: ${JSON.stringify(check)}`);
      for (const value of Object.values(proposal.palette)) assert.match(value, /^#[\da-f]{6}$/);
    }
  }
  assert.equal(paletteProposals(brands.darkBlue).find(proposal => proposal.id === "clear")?.palette.accent, brands.darkBlue);
});

test("an unreadable palette is corrected with a plain-language note", () => {
  const { palette, notes } = fixPalette({ primary: "#cccccc", text: "#cccccc", accent: "#9a9a9a", background: "#ffffff", surface: "#f4f4f4", border: "#dddddd" });
  assert.ok(checkPalette(palette).ok);
  assert.ok(notes.some(note => note.includes("Textfarbe")));
  assert.equal(buttonTextFor("#ffffff"), "#142b27");
  assert.equal(buttonTextFor("#1d3a8a"), "#ffffff");
});

test("colours from an image skip greys and near-white pixels", () => {
  const pixels: number[] = [];
  const push = (r: number, g: number, b: number, count: number) => { for (let index = 0; index < count; index++) pixels.push(r, g, b, 255); };
  push(250, 250, 250, 400); push(30, 30, 30, 200); push(29, 58, 138, 120); push(255, 122, 0, 60);
  const colors = dominantColors(pixels);
  assert.equal(colors.length, 2);
  assert.ok(Math.abs(hexToOklch(colors[0]).h - hexToOklch(brands.darkBlue).h) < 10);
});

test("style choices are optional, validated and rendered as data attributes", () => {
  assert.deepEqual(siteStyleAttributes({}), { data: {}, vars: {} });
  const result = siteStyleAttributes({ headingFont: "fraunces", bodyFont: "inter", typeScale: "generous", buttonShape: "pill", density: "airy", imageStyle: "framed" });
  assert.equal(result.data["data-ws-heading-font"], "fraunces");
  assert.equal(result.data["data-ws-buttons"], "pill");
  assert.match(result.vars["--font-body"], /CMS Inter/);
  assert.equal(siteStyleAttributes({ typeScale: "balanced", buttonShape: "rounded", density: "balanced", imageStyle: "natural" }).data["data-ws-type-scale"], undefined);
  assert.ok(siteStyleSchema.safeParse({ logo: { url: "/api/media/local/logo.png", alt: "Logo" } }).success);
  assert.ok(!siteStyleSchema.safeParse({ logo: { url: "javascript:alert(1)", alt: "" } }).success);
  assert.ok(!siteStyleSchema.safeParse({ headingFont: "comic-sans" }).success);
  assert.equal(currentPairing({}), "design");
  assert.equal(currentPairing({ headingFont: "outfit", bodyFont: "inter" }), "friendly");
  for (const pairing of FONT_PAIRINGS.slice(1)) assert.ok(pairing.heading && pairing.body);
});

test("design changes are named in plain words for the publication review", () => {
  const before = structuredClone(content) as WebsiteContent;
  const after = structuredClone(before);
  after.config.theme = { ...after.config.theme, headingFont: "playfair-display", brandColor: "#1d3a8a", palettes: { ...after.config.theme.palettes, 1: paletteProposals("#1d3a8a")[0].palette }, logo: { url: "/logo.png", alt: "Logo" } };
  assert.deepEqual(designChanges(before.config, after.config).map(change => change.label), ["Farben", "Schrift", "Logo"]);
  assert.deepEqual(designChanges(before.config, before.config), []);
  // Existing content without the new fields and content with them both pass validation.
  assert.ok(websiteSchema.safeParse(before).success);
  const parsed = websiteSchema.parse(after);
  assert.equal(parsed.config.theme.headingFont, "playfair-display");
  assert.equal(parsed.config.theme.logo?.url, "/logo.png");
});

test("the admin stylesheet keeps the accessibility switches of the glass material", () => {
  const css = readFileSync(new URL("../src/styles/cms-glass.css", import.meta.url), "utf8");
  for (const query of ["prefers-reduced-transparency: reduce", "prefers-contrast: more", "prefers-reduced-motion: reduce", "prefers-color-scheme: dark", "forced-colors: active"]) assert.ok(css.includes(query), query);
  assert.ok(!/font-size:\s*(?:[0-9]|1[01])px/.test(css), "no admin text below 12 px");
});
