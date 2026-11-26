import { publicationChanges } from "./publication-changes";
import type { MediaAsset, WebsiteContent } from "./types";

/** Where an overview task leads. Matches the admin views of the workspace. */
export type OverviewTarget = "editor" | "media" | "inquiries" | "settings-email" | "launch-check" | "publish";

export interface OverviewTask {
  id: string;
  tone: "attention" | "info";
  title: string;
  values?: Record<string, string | number>;
  detail: string;
  action: string;
  target: OverviewTarget;
}

export interface PublicationSummary {
  state: "unsaved" | "pending" | "first" | "live";
  changes: number;
  /** Up to three changed pages or areas for the overview. */
  names: string[];
}

export function publicationSummary(input: { draft: WebsiteContent; published: WebsiteContent; publishedAt: string | null; unsaved: boolean }): PublicationSummary {
  const changes = publicationChanges(input.published, input.draft);
  const names = changes.slice(0, 3).map(change => change.name);
  if (input.unsaved) return { state: "unsaved", changes: changes.length, names };
  if (!input.publishedAt) return { state: "first", changes: changes.length, names };
  return { state: changes.length ? "pending" : "live", changes: changes.length, names };
}

/** Images in the library without a description for screen readers and search engines. */
export function missingAltText(media: readonly MediaAsset[]): number {
  return media.filter(asset => asset.type.startsWith("image/") && !asset.alt.trim()).length;
}

/**
 * The few things that need the owner's attention, most important first.
 * Everything here has a direct way to the place where it is resolved.
 */
export function overviewTasks(input: {
  publication: PublicationSummary;
  newInquiries: number;
  media: readonly MediaAsset[];
  launchIssues: number;
  smtpReady: boolean;
  owner?: boolean;
}): OverviewTask[] {
  const tasks: OverviewTask[] = [];
  const owner = input.owner !== false;
  if (input.publication.state === "unsaved") tasks.push({ id: "unsaved", tone: "attention", title: "Ungespeicherte Änderungen", detail: "Speichern Sie den Entwurf, damit Ihre Arbeit gesichert ist.", action: "Zum Editor", target: "editor" });
  else if (owner && (input.publication.state === "pending" || input.publication.state === "first")) tasks.push({
    id: "publish", tone: "attention",
    title: input.publication.state === "first" ? "Erste Veröffentlichung vorbereiten" : input.publication.changes === 1 ? "1 Änderung wartet auf Veröffentlichung" : "{count} Änderungen warten auf Veröffentlichung",
    values: { count: input.publication.changes },
    detail: input.publication.names.length ? input.publication.names.join(" · ") : "Prüfen Sie den gespeicherten Entwurf und geben Sie ihn frei.",
    action: "Prüfen und veröffentlichen", target: "publish",
  });
  if (input.newInquiries > 0) tasks.push({ id: "inquiries", tone: "attention", title: input.newInquiries === 1 ? "1 neue Anfrage" : "{count} neue Anfragen", values: { count: input.newInquiries }, detail: "Beantworten Sie neue Nachrichten zeitnah.", action: "Anfragen öffnen", target: "inquiries" });
  const alt = missingAltText(input.media);
  if (alt > 0) tasks.push({ id: "alt", tone: "info", title: alt === 1 ? "1 Bild ohne Bildbeschreibung" : "{count} Bilder ohne Bildbeschreibung", values: { count: alt }, detail: "Eine kurze Beschreibung hilft Menschen, die sich Seiten vorlesen lassen, und Suchmaschinen.", action: "Medien öffnen", target: "media" });
  if (owner && input.launchIssues > 0) tasks.push({ id: "launch", tone: "info", title: input.launchIssues === 1 ? "1 Hinweis im Startcheck" : "{count} Hinweise im Startcheck", values: { count: input.launchIssues }, detail: "Platzhalter, Kontaktangaben oder Domain vor dem Start prüfen.", action: "Startcheck öffnen", target: "launch-check" });
  if (owner && !input.smtpReady) tasks.push({ id: "smtp", tone: "info", title: "E-Mail-Benachrichtigung noch nicht eingerichtet", detail: "Anfragen werden sicher im Postfach gespeichert. Mit E-Mail-Versand erfahren Sie sofort davon.", action: "E-Mail-Versand einrichten", target: "settings-email" });
  return tasks;
}
