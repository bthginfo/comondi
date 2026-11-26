"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { CmsState, PageContent, WebsiteContent } from "@/lib/types";
import { publicationChanges } from "@/lib/publication-changes";
import { publishIssueMessages } from "@/lib/publish-check";
import type { AdminMessageValues } from "@/lib/admin-i18n/locale";
import { ArrowRight, Button, Modal, Notice } from "./admin-ui";
import type { PreviewDevice } from "./preview-frame";

const statusLabel = { added: "Neu", removed: "Entfernt", changed: "Geändert" };
const devices: { id: PreviewDevice; label: string; icon: typeof Monitor }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor }, { id: "tablet", label: "Tablet", icon: Tablet }, { id: "mobile", label: "Smartphone", icon: Smartphone },
];

export function PublicationReview({ state, onClose, onConfirm, busy, error, t = value => value, pathFor, onPreview }: {
  state: CmsState;
  /** A failed publication is reported inside the dialog, which covers the workspace notifications. */
  error?: string;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
  t?: (message: string, values?: AdminMessageValues) => string;
  pathFor?: (page: PageContent, snapshot: WebsiteContent) => string;
  /** Opens the draft of a page in the editor preview at the chosen width. */
  onPreview?: (pageId: string | undefined, device: PreviewDevice) => void;
}) {
  const changes = publicationChanges(state.published, state.draft, pathFor);
  const issues = publishIssueMessages(state.draft);
  const draftPages = new Set(state.draft.pages.map(page => page.id));
  const firstPage = changes.find(change => draftPages.has(change.id))?.id;
  return <Modal title={t("Veröffentlichung prüfen")} description={t("Vergleichen Sie den gespeicherten Entwurf mit dem aktuellen Stand Ihrer Website.")}
    wide busy={busy} onClose={onClose} footer={<>
      <Button disabled={busy} onClick={onClose}>{t("Zurück zum Entwurf")}</Button>
      <Button variant="primary" busy={busy} disabled={issues.length > 0} onClick={onConfirm}>{t("Jetzt veröffentlichen")}</Button>
    </>}>
    {error && <Notice tone="error"><span style={{ whiteSpace: "pre-line" }}>{error}</span></Notice>}
    {issues.length > 0 && <Notice tone="error"><strong>{t("Vor dem Veröffentlichen bitte ergänzen:")}</strong><ul className="cms-review-issues">{issues.slice(0, 5).map((issue, index) => <li key={index}>{t(issue.message, issue.values)}</li>)}</ul></Notice>}
    {onPreview && <div className="cms-review-preview" role="group" aria-label={t("Entwurf in der Vorschau prüfen")}>
      <span>{t("Entwurf ansehen als")}</span>
      {devices.map(device => <Button key={device.id} variant="quiet" disabled={busy} onClick={() => onPreview(firstPage, device.id)}><device.icon size={16} aria-hidden="true" />{t(device.label)}</Button>)}
    </div>}
    {changes.length ? <div className="cms-publication-review">
      <p className="cms-review-count">{t(changes.length === 1 ? "1 Änderung wird veröffentlicht." : "{count} Änderungen werden veröffentlicht.", { count: changes.length })}</p>
      {changes.map(change => <details className="cms-details" key={change.id} open={changes.length <= 3 || undefined}>
        <summary><strong>{t(change.name)}</strong><span>{t(statusLabel[change.kind])}</span></summary>
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
