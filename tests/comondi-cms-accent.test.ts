import test from "node:test";
import assert from "node:assert/strict";
import content from "../src/data/content.json";
import { brandCandidates, deriveCmsAccent, hexToOklch } from "../src/lib/cms-accent";
import type { SiteConfig } from "../src/lib/types";

// co:mondi uses its dark navy as page background ("primary" and "background" are nearly the same);
// the colour the brand is recognised by is the pink accent of the buttons and highlights.
test("the CMS accent of co:mondi follows the pink brand accent, not the background navy", () => {
  const config = content.config as unknown as SiteConfig;
  const candidates = brandCandidates(config.theme, config.designVariant ?? 1);
  assert.equal(candidates[0], config.theme.palettes?.[1]?.accent ?? config.theme.accent);
  const accent = deriveCmsAccent(candidates);
  assert.equal(accent.source, "brand");
  const hue = hexToOklch(accent.light.accent).h, pink = hexToOklch("#ed62b9").h;
  assert.ok(Math.abs(hue - pink) < 12, `hue ${hue} close to ${pink}`);
});

test("a chosen brand colour and a distinct primary colour still lead", () => {
  assert.deepEqual(brandCandidates({ brandColor: "#1d3a8a", primary: "#060a15", accent: "#ed62b9", background: "#060a15" }), ["#1d3a8a", "#ed62b9"]);
  assert.deepEqual(brandCandidates({ primary: "#1d3a8a", accent: "#ed62b9", background: "#ffffff" }), ["#1d3a8a", "#ed62b9"]);
});
