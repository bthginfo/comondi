import { strict as assert } from "node:assert";
import { test } from "node:test";
import { initialTextRole, nextCanvasPercent, updateCanvasAppearance } from "../src/components/admin/canvas-format-model";
import { createSection } from "../src/lib/section-library";
import { cmsAppearanceCss } from "../src/lib/cms-appearance";
import { cmsAppearanceSchema } from "../src/lib/cms-appearance-schema";

test("format edits target the selected entry by id, including equal text and reordered entries", () => {
  const section = createSection("cards");
  const first = { id: "one", title: "Same", text: "Same", email: "fixture@example.invalid" };
  const second = { ...first, id: "two", appearance: { bodyScale: 1.25 } };
  section.content.items = [second, first];
  const changed = updateCanvasAppearance(section, "two", "headingColor", "#345678");
  assert.equal(changed.design, section.design);
  assert.equal(changed.content.items![1], first);
  assert.deepEqual(changed.content.items![0].appearance, { bodyScale: 1.25, headingColor: "#345678" });
  assert.equal(changed.content.items![0].email, first.email);
  assert.deepEqual(section.content.items[0].appearance, { bodyScale: 1.25 });
  assert.equal(updateCanvasAppearance(changed, "two", "headingColor", "#345678"), changed);
  assert.equal(updateCanvasAppearance(changed, "missing", "headingColor", "#123"), changed);
  assert.match(cmsAppearanceCss("canvas", [changed]), /data-item-id="two".+color:#345678/);
});

test("resetting a single property inherits the parent and preserves other draft properties", () => {
  let section = createSection("cards");
  section.content.items = [{ id: "entry", title: "Demo", text: "", appearance: { headingTypeface: "fraunces" } }];
  section = updateCanvasAppearance(section, undefined, "headingTypeface", "manrope");
  section = updateCanvasAppearance(section, undefined, "bodyScale", 1.25);
  const changed = updateCanvasAppearance(section, "entry", "headingTypeface", undefined);
  assert.equal(changed.design.headingTypeface, "manrope");
  assert.equal(changed.content.items![0].appearance, undefined);
  const restored = updateCanvasAppearance(changed, undefined, "headingTypeface", undefined);
  assert(!Object.hasOwn(restored.design, "headingTypeface"));
  assert.equal(restored.design.bodyScale, 1.25);
  assert.equal(restored.design.spacing, section.design.spacing);
  assert.equal(restored.content, changed.content);
  const look = { background: "#112233aa", headingColor: "#f00" };
  assert(cmsAppearanceSchema.safeParse(look).success);
});

test("text roles and size choices reflect the renderer limits and inherited scale", () => {
  assert.equal(initialTextRole("title"), "heading");
  assert.equal(initialTextRole("text"), "body");
  assert.equal(initialTextRole("primaryLabel"), "body");
  assert.equal(nextCanvasPercent(95, 1, 75, 140, 125), 105);
  assert.equal(nextCanvasPercent(105, -1, 75, 140, 125), 95);
  assert.equal(nextCanvasPercent(95, 1, 75, 140, 100), 100);
  assert.equal(nextCanvasPercent(76, -1, 75, 140, 100), 75);
  assert.equal(nextCanvasPercent(159, 1, 60, 160, 100), 160);
});

test("section heading scale stays scoped to headings and resets to the saved section base", () => {
  const section = createSection("statement");
  section.design.fontScale = 1.3;
  section.design.bodyScale = .9;
  const before = cmsAppearanceCss("canvas", [section]);
  const changed = updateCanvasAppearance(section, undefined, "headingScale", 1.05);
  assert.equal(changed.design.fontScale, 1.3);
  assert.equal(changed.design.bodyScale, .9);
  assert.equal(changed.design.headingScale, 1.05);
  const css = cmsAppearanceCss("canvas", [changed]);
  assert(css.includes('[data-cms-role=heading]){zoom:1.05!important}'));
  assert(css.includes('[data-cms-role=body]){zoom:0.9!important}'));
  assert(!css.includes('[data-cms-role=body]){zoom:1.05!important}'));
  const reset = updateCanvasAppearance(changed, undefined, "headingScale", undefined);
  assert.deepEqual(reset.design, section.design);
  assert.equal(cmsAppearanceCss("canvas", [reset]), before);
});
