/**
 * Replaces the sections (and their page metadata) of the co:mondi subpages in a content snapshot.
 * Start page, legal pages, settings, posts and templates stay untouched. The store functions are
 * passed in, so the same run works against the local .data store, the database and tests.
 */
import { isDeepStrictEqual } from 'node:util';
import type { CmsState, PageContent, WebsiteContent } from '../../src/lib/types';
import { websiteSchema } from '../../src/lib/validation';
import { publicationIssueText, publishIssueMessages } from '../../src/lib/publish-check';
import { SUBPAGE_SLUGS, buildSubpages, type SubpageSlug } from './comondi-subpages-content';

export interface PageChange {
  slug: SubpageSlug;
  title: { before: string; after: string } | null;
  description: { before: string; after: string } | null;
  sections: { before: string[]; after: string[] } | null;
}
export interface MigrationStore {
  getState(): Promise<CmsState>;
  saveDraft(content: WebsiteContent, revision: number): Promise<CmsState>;
  publish(revision: number): Promise<CmsState>;
}
export interface MigrationOptions { dryRun?: boolean; publish?: boolean; source?: string; log?: (line: string) => void }
export interface MigrationResult { changes: PageChange[]; savedRevision?: number; published: boolean; report: string }

const sectionList = (page: PageContent) => page.sections.map(section => `${section.type}#${section.id}${section.visible ? '' : ' (ausgeblendet)'}`);
const route = (slug: string) => '/' + slug;

/** The snapshot with the new subpages. Throws when a target page is missing. */
export function applySubpages(content: WebsiteContent): { content: WebsiteContent; changes: PageChange[] } {
  const built = buildSubpages(content);
  const next = structuredClone(content);
  const changes: PageChange[] = [];
  for (const slug of SUBPAGE_SLUGS) {
    const index = next.pages.findIndex(page => page.slug === slug);
    if (index < 0) throw new Error(`Die Seite ${route(slug)} fehlt im Inhalt. Das Skript legt keine Seiten an.`);
    const before = next.pages[index];
    const after: PageContent = { ...before, seo: { ...before.seo, ...built[slug].seo }, sections: built[slug].sections };
    const change: PageChange = {
      slug,
      title: before.seo.title === after.seo.title ? null : { before: before.seo.title, after: after.seo.title },
      description: before.seo.description === after.seo.description ? null : { before: before.seo.description, after: after.seo.description },
      sections: isDeepStrictEqual(before.sections, after.sections) ? null : { before: sectionList(before), after: sectionList(after) },
    };
    if (change.title || change.description || change.sections || !isDeepStrictEqual(before.seo, after.seo)) changes.push(change);
    next.pages[index] = after;
  }
  return { content: next, changes };
}

/** Pending draft changes that are not part of this migration and would be published along with it. */
export function otherDraftChanges(state: Pick<CmsState, 'draft' | 'published'>): string[] {
  const targets = new Set<string>(SUBPAGE_SLUGS);
  const { draft, published } = state;
  const changes: string[] = [];
  if (!isDeepStrictEqual(draft.config, published.config)) changes.push('Einstellungen');
  if (!isDeepStrictEqual(draft.posts ?? [], published.posts ?? [])) changes.push('Blogbeiträge');
  if (!isDeepStrictEqual(draft.templates ?? {}, published.templates ?? {})) changes.push('Vorlagen');
  const slugs = new Set([...draft.pages, ...published.pages].map(page => page.slug));
  for (const slug of slugs) {
    if (targets.has(slug)) continue;
    const a = draft.pages.find(page => page.slug === slug), b = published.pages.find(page => page.slug === slug);
    if (!isDeepStrictEqual(a, b)) changes.push(`Seite ${route(slug)}`);
  }
  const order = (content: WebsiteContent) => content.pages.map(page => page.slug).join('|');
  if (order(draft) !== order(published) && !changes.some(entry => entry.startsWith('Seite'))) changes.push('Reihenfolge der Seiten');
  return changes;
}

export function migrationReport({ changes, state, source, other, issues, dryRun, publish }: {
  changes: PageChange[]; state: CmsState; source: string; other: string[]; issues: string[]; dryRun: boolean; publish: boolean;
}): string {
  const lines = [
    `co:mondi · Unterseiten ${dryRun ? '(Trockenlauf, es wird nichts gespeichert)' : publish ? '(Entwurf speichern und veröffentlichen)' : '(als Entwurf speichern)'}`,
    `Quelle: ${source}`,
    `Entwurf: Revision ${state.revision}${state.updatedAt ? `, zuletzt gespeichert ${state.updatedAt}` : ''}${state.publishedAt ? `, veröffentlicht ${state.publishedAt}` : ''}`,
    '',
    changes.length ? `${changes.length} von ${SUBPAGE_SLUGS.length} Zielseiten ändern sich:` : `Keine Änderungen: Alle ${SUBPAGE_SLUGS.length} Zielseiten entsprechen bereits dem neuen Stand.`,
  ];
  for (const change of changes) {
    lines.push('', route(change.slug));
    if (change.title) lines.push(`  Titel:        ${change.title.before}`, `             → ${change.title.after}`);
    if (change.description) lines.push(`  Beschreibung: ${change.description.before}`, `             → ${change.description.after}`);
    if (change.sections) lines.push(`  Abschnitte vorher:  ${change.sections.before.join(', ')}`, `  Abschnitte nachher: ${change.sections.after.join(', ')}`);
  }
  lines.push('', 'Unverändert: Startseite, Impressum, Datenschutz, alle weiteren Seiten, Einstellungen, Navigation, Beiträge und Vorlagen.');
  lines.push(`Weitere unveröffentlichte Änderungen im Entwurf: ${other.length ? other.join(', ') : 'keine'}`);
  lines.push(`Prüfung: Inhalt entspricht dem Schema${issues.length ? `; Hinweise vor dem Veröffentlichen: ${issues.join(' ')}` : '; keine Hinweise vor dem Veröffentlichen'}`);
  return lines.join('\n');
}

export async function runSubpagesMigration(store: MigrationStore, options: MigrationOptions = {}): Promise<MigrationResult> {
  const { dryRun = false, publish = false, source = 'unbekannt', log = () => {} } = options;
  const state = await store.getState();
  const { content, changes } = applySubpages(state.draft);
  websiteSchema.parse(content);
  const other = otherDraftChanges(state);
  const issues = publishIssueMessages(content).map(publicationIssueText);
  const report = migrationReport({ changes, state, source, other, issues, dryRun, publish });
  log(report);
  if (dryRun) return { changes, published: false, report };

  if (publish && other.length) throw new Error(`Nicht veröffentlicht: Der Entwurf enthält weitere unveröffentlichte Änderungen (${other.join(', ')}). Bitte zuerst im CMS prüfen oder ohne --publish speichern.`);
  if (publish && issues.length) throw new Error(`Nicht veröffentlicht: ${issues.join(' ')}`);

  let current = state;
  if (changes.length) {
    current = await store.saveDraft(content, state.revision);
    log(`Entwurf gespeichert: Revision ${current.revision}.`);
  } else log('Entwurf unverändert, nichts gespeichert.');

  if (!publish) {
    log('Nicht veröffentlicht. Prüft den Entwurf im CMS und veröffentlicht ihn dort, oder startet das Skript erneut mit --publish.');
    return { changes, savedRevision: changes.length ? current.revision : undefined, published: false, report };
  }
  if (isDeepStrictEqual(current.draft, current.published)) {
    log('Bereits veröffentlicht: Der Entwurf entspricht der öffentlichen Fassung.');
    return { changes, savedRevision: changes.length ? current.revision : undefined, published: false, report };
  }
  const after = await store.publish(current.revision);
  log(`Veröffentlicht: Revision ${after.revision}. Die öffentlichen Seiten zeigen den neuen Stand nach der nächsten Cache-Invalidierung (neues Deployment oder Veröffentlichung im CMS).`);
  return { changes, savedRevision: changes.length ? current.revision : undefined, published: true, report };
}
