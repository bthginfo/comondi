import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import content from "../src/data/content.json";
import { websiteSchema } from "../src/lib/validation";
import { ApiError } from "../src/components/admin/admin-ui";
import { PublicationReview, publicationFailure } from "../src/components/admin/publication-review";
import type { CmsState } from "../src/lib/types";

function reviewState(): CmsState {
  const published = websiteSchema.parse(content);
  const draft = structuredClone(published);
  draft.pages[0].sections[0].content.heading = "Neue Überschrift";
  return { draft, published, updatedAt: "2026-11-26T10:00:00.000Z", publishedAt: "2026-11-25T10:00:00.000Z", revision: 4, revisions: [] };
}
const render = (props: Partial<Parameters<typeof PublicationReview>[0]>) => renderToStaticMarkup(createElement(PublicationReview, {
  state: reviewState(), busy: false, onClose: () => {}, onConfirm: () => {}, ...props,
}));
/** The dialog footer is rendered after the body: the last button is the primary action. */
const primaryButton = (html: string) => [...html.matchAll(/<button[^>]*class="cms-button cms-button--primary[^"]*"[^>]*>(.*?)<\/button>/g)].at(-1);

test("a failed publication is classified so the review dialog offers the right way out", () => {
  assert.deepEqual(publicationFailure(new TypeError("Failed to fetch")), { kind: "retry", message: "Die Verbindung konnte nicht hergestellt werden. Bitte prüfen Sie Ihr Netz und versuchen Sie es erneut." });
  assert.equal(publicationFailure(new ApiError("Der Speicher ist gerade nicht erreichbar.", 503)).kind, "retry");
  assert.equal(publicationFailure(new ApiError("Ihre Sitzung ist abgelaufen.", 401)).kind, "retry");
  const conflict = publicationFailure(new ApiError("Konflikt", 409));
  assert.equal(conflict.kind, "conflict");
  assert.match(conflict.message, /zwischenzeitlich geändert/);
  const blocked = publicationFailure(new ApiError("Ungültig", 400, [{ message: "Bitte ergänzen Sie {p1}.", values: { p1: "das Impressum" } }]), (message: string) => message.replace("{p1}", "das Impressum"));
  assert.deepEqual(blocked, { kind: "blocked", message: "Bitte ergänzen Sie das Impressum." });
});

test("the review dialog shows a publishing error inside the dialog with a reachable retry", () => {
  const calm = render({});
  assert.doesNotMatch(calm, /fehlgeschlagen/);
  assert.equal(primaryButton(calm)?.[1], "Jetzt veröffentlichen");

  const failed = render({ error: publicationFailure(new ApiError("Der Speicher ist gerade nicht erreichbar.", 503)) });
  const dialog = failed.slice(failed.indexOf("<dialog"), failed.indexOf("</dialog>"));
  assert.match(dialog, /role="alert"[^>]*>.*Die Veröffentlichung ist fehlgeschlagen\..*Der Speicher ist gerade nicht erreichbar\./s, "the error is part of the modal dialog, not a toast behind it");
  assert.match(dialog, /Ihr Entwurf bleibt gespeichert/);
  const retry = primaryButton(failed);
  assert.equal(retry?.[1], "Erneut versuchen");
  assert.doesNotMatch(retry![0], /disabled/);

  // Projects that pass a plain message keep the retry.
  assert.equal(primaryButton(render({ error: "Netzwerkfehler" }))?.[1], "Erneut versuchen");
});

test("a conflict blocks publishing in the dialog and offers to load the current draft", () => {
  const html = render({ error: publicationFailure(new ApiError("Konflikt", 409)), onReload: () => {} });
  assert.match(html, /role="alert".*zwischenzeitlich geändert.*Aktuellen Stand laden/s);
  const primary = primaryButton(html);
  assert.equal(primary?.[1], "Jetzt veröffentlichen");
  assert.match(primary![0], /disabled=""/);
});

test("hidden sections dim only their diagram so the name keeps a readable contrast", () => {
  const css = readFileSync(new URL("../src/styles/admin.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [...css.matchAll(/([^{}]*cms-section-row--hidden[^{}]*)\{([^}]*)\}/g)].map(match => ({ selector: match[1].trim(), body: match[2] }));
  assert(rules.length > 0);
  for (const rule of rules) {
    if (/opacity/.test(rule.body)) assert.match(rule.selector, /cms-section-diagram--mini$/, `only the diagram may be dimmed: ${rule.selector}`);
    assert.doesNotMatch(rule.body, /(?:^|;)\s*(?:color|filter)\s*:/, `no faded text colour on hidden rows: ${rule.selector}`);
  }
  const editor = readFileSync(new URL("../src/components/admin/page-editor.tsx", import.meta.url), "utf8");
  assert.match(editor, /!candidate\.visible && <small className="cms-section-hidden-note">.*adminText\("Ausgeblendet"\)/, "hidden sections say so in words");
});
