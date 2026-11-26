"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { CmsState, PageContent, Section, SiteConfig, WebsiteContent } from "@/lib/types";
import { designChanges } from "@/lib/site-style";
import { paletteFor } from "@/lib/theme";
import { cmsTypeface } from "@/lib/cms-typefaces";
import { buttonTextFor } from "@/lib/brand-palette";
import { SectionPreview } from "./section-library-dialog";
import type { CSSProperties } from "react";
import { publicationChanges } from "@/lib/publication-changes";
import { publishIssueMessages } from "@/lib/publish-check";
import type { AdminMessageValues } from "@/lib/admin-i18n/locale";
import { ApiError, ArrowRight, Button, Modal, Notice, errorMessage } from "./admin-ui";
import type { PreviewDevice } from "./preview-frame";

/** How a failed publication continues: "retry" (network, server, sign-in), "conflict" (load the current draft first) or "blocked" (fix the reported content). */
export type PublicationFailure = { message: string; kind: "retry" | "conflict" | "blocked" };
const conflictMessage = "Der Entwurf wurde zwischenzeitlich geändert. Laden Sie den aktuellen Stand neu, bevor Sie weiter speichern.";
export function publicationFailure(error: unknown, t: (message: string) => string = value => value): PublicationFailure {
  if (error instanceof ApiError && error.status === 409) return { message: t(conflictMessage), kind: "conflict" };
  const retry = !(error instanceof ApiError) || error.status === 401 || error.status === 408 || error.status === 429 || error.status >= 500;
  return { message: errorMessage(error, t), kind: retry ? "retry" : "blocked" };
}

const statusLabel = { added: "Neu", removed: "Entfernt", changed: "Geändert" };
const devices: { id: PreviewDevice; label: string; icon: typeof Monitor }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor }, { id: "tablet", label: "Tablet", icon: Tablet }, { id: "mobile", label: "Smartphone", icon: Smartphone },
];

/** Miniature of the site's look (colours, fonts, shapes) for the before/after comparison. */
function DesignThumb({ config }: { config: SiteConfig }) {
  const palette = paletteFor(config, config.designVariant ?? 1);
  const theme = config.theme;
  const radius = theme.buttonShape === "pill" ? 999 : theme.buttonShape === "square" ? 2 : Math.max(3, theme.radius / 2);
  return <span className="cms-review-thumb" aria-hidden="true" style={{ background: palette.background, color: palette.text, borderColor: palette.border, "--thumb-heading": cmsTypeface(theme.headingFont) ?? "inherit", "--thumb-body": cmsTypeface(theme.bodyFont) ?? "inherit" } as CSSProperties}>
    <span className="cms-review-thumb-bar">{theme.logo?.url ? <img src={theme.logo.url} alt="" /> : <b>{config.name}</b>}<i style={{ background: palette.accent }} /></span>
    <strong>Aa</strong><span className="cms-review-thumb-text">{config.tagline || config.name}</span>
    <span className="cms-review-thumb-button" style={{ background: palette.accent, color: buttonTextFor(palette.accent), borderRadius: radius }}>Kontakt</span>
    <span className={"cms-review-thumb-image cms-review-thumb-image--" + (theme.imageStyle ?? "natural")} style={{ background: palette.surface }} />
  </span>;
}

/** Schematic page thumbnail: one tile per visible section, new or changed sections highlighted. */
function PageThumb({ sections, before }: { sections: Section[]; before?: Section[] }) {
  const previous = new Map((before ?? []).map(section => [section.id, JSON.stringify(section)]));
  return <span className="cms-review-page-thumb" aria-hidden="true">{sections.filter(section => section.visible).slice(0, 7).map(section => <span key={section.id} data-state={!previous.has(section.id) ? "new" : previous.get(section.id) !== JSON.stringify(section) ? "changed" : undefined}><SectionPreview type={section.type} mini /></span>)}</span>;
}

export function PublicationReview({ state, onClose, onConfirm, busy, error, onReload, t = value => value, pathFor, onPreview }: {
  state: CmsState;
  /** A failed publication is reported inside the dialog, which covers the workspace notifications. A plain text counts as retryable. */
  error?: string | PublicationFailure | null;
  /** Loads the current draft after a conflict, before publishing again. */
  onReload?: () => void;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
  t?: (message: string, values?: AdminMessageValues) => string;
  pathFor?: (page: PageContent, snapshot: WebsiteContent) => string;
  /** Opens the draft of a page in the editor preview at the chosen width. */
  onPreview?: (pageId: string | undefined, device: PreviewDevice) => void;
}) {
  const failure: PublicationFailure | null = typeof error === "string" ? { message: error, kind: "retry" } : error ?? null;
  const changes = publicationChanges(state.published, state.draft, pathFor);
  const issues = publishIssueMessages(state.draft);
  const draftPages = new Set(state.draft.pages.map(page => page.id));
  const firstPage = changes.find(change => draftPages.has(change.id))?.id;
  const design = designChanges(state.published.config, state.draft.config);
  return <Modal title={t("Veröffentlichung prüfen")} description={t("Vergleichen Sie den gespeicherten Entwurf mit dem aktuellen Stand Ihrer Website.")}
    wide busy={busy} onClose={onClose} footer={<>
      <Button disabled={busy} onClick={onClose}>{t("Zurück zum Entwurf")}</Button>
      <Button variant="primary" busy={busy} disabled={issues.length > 0 || failure?.kind === "conflict"} onClick={onConfirm}>{t(failure?.kind === "retry" ? "Erneut versuchen" : "Jetzt veröffentlichen")}</Button>
    </>}>
    {failure && <Notice tone="error"><div className="cms-review-error"><strong>{t("Die Veröffentlichung ist fehlgeschlagen.")}</strong><span>{failure.message}</span>
      {failure.kind === "retry" && <span>{t("Ihr Entwurf bleibt gespeichert. Sie können es gleich noch einmal versuchen.")}</span>}
      {failure.kind === "conflict" && onReload && <Button onClick={onReload}>{t("Aktuellen Stand laden")}</Button>}</div></Notice>}
    {issues.length > 0 && <Notice tone="error"><strong>{t("Vor dem Veröffentlichen bitte ergänzen:")}</strong><ul className="cms-review-issues">{issues.slice(0, 5).map((issue, index) => <li key={index}>{t(issue.message, issue.values)}</li>)}</ul></Notice>}
    {onPreview && <div className="cms-review-preview" role="group" aria-label={t("Entwurf in der Vorschau prüfen")}>
      <span>{t("Entwurf ansehen als")}</span>
      {devices.map(device => <Button key={device.id} variant="quiet" disabled={busy} onClick={() => onPreview(firstPage, device.id)}><device.icon size={16} aria-hidden="true" />{t(device.label)}</Button>)}
    </div>}
    {design.length > 0 && <section className="cms-review-design" aria-label={t("Design")}>
      <h3>{t("Design geändert: {p1}", { p1: design.map(change => t(change.label)).join(", ") })}</h3>
      <div className="cms-review-compare"><figure><DesignThumb config={state.published.config} /><figcaption>{t("Bisher online")}</figcaption></figure><figure><DesignThumb config={state.draft.config} /><figcaption>{t("Nach dem Veröffentlichen")}</figcaption></figure></div>
    </section>}
    {changes.length ? <div className="cms-publication-review">
      <p className="cms-review-count">{t(changes.length === 1 ? "1 Änderung wird veröffentlicht." : "{count} Änderungen werden veröffentlicht.", { count: changes.length })}</p>
      {changes.map(change => <details className="cms-details" key={change.id} open={changes.length <= 3 || undefined}>
        <summary>{draftPages.has(change.id) && <PageThumb sections={state.draft.pages.find(page => page.id === change.id)!.sections} before={state.published.pages.find(page => page.id === change.id)?.sections} />}<strong>{t(change.name)}</strong><span>{t(statusLabel[change.kind])}</span></summary>
        <ul>{change.fields.map((field, index) => <li key={index}>
          <span>{t(field.name)}</span>
          {field.before !== undefined && <del>{field.before}</del>}
          {field.after !== undefined && <ins>{field.after}</ins>}
        </li>)}</ul>
        {onPreview && draftPages.has(change.id) && <Button variant="quiet" className="cms-review-open" disabled={busy} onClick={() => onPreview(change.id, "desktop")}>{t("Diese Seite in der Vorschau ansehen")}<ArrowRight size={15} /></Button>}
      </details>)}
    </div> : <p>{t(state.publishedAt ? "Der Entwurf enthält keine sichtbaren Änderungen." : "Der gespeicherte Entwurf wird erstmals veröffentlicht.")}</p>}
  </Modal>;
}
