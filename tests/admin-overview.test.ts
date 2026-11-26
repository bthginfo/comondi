import test from 'node:test';
import assert from 'node:assert/strict';
import seed from '../src/data/content.json';
import { missingAltText, overviewTasks, publicationSummary } from '../src/lib/admin-overview';
import { mediaUsage } from '../src/lib/media-usage';
import { findWorkspaceResults } from '../src/lib/workspace-search';
import { settingAreaTerms } from '../src/lib/admin-settings-search';
import type { MediaAsset, WebsiteContent } from '../src/lib/types';

const site = () => structuredClone(seed) as WebsiteContent;
const asset = (alt: string, type = 'image/webp'): MediaAsset => ({ id: crypto.randomUUID(), url: '/media/' + crypto.randomUUID() + '.webp', name: 'bild', alt, type, size: 100, position: '50% 50%', createdAt: '2026-11-26T10:00:00Z' });

test('the overview names what is live, what waits for publication and what is unsaved', () => {
  const published = site();
  assert.deepEqual(publicationSummary({ draft: published, published, publishedAt: '2026-11-01T10:00:00Z', unsaved: false }), { state: 'live', changes: 0, names: [] });
  const draft = site(); draft.pages[0].sections[0].content.heading = 'Neu';
  const pending = publicationSummary({ draft, published, publishedAt: '2026-11-01T10:00:00Z', unsaved: false });
  assert.equal(pending.state, 'pending');
  assert.equal(pending.changes, 1);
  assert.deepEqual(pending.names, [draft.pages[0].title]);
  assert.equal(publicationSummary({ draft, published, publishedAt: null, unsaved: false }).state, 'first');
  assert.equal(publicationSummary({ draft, published, publishedAt: '2026-11-01T10:00:00Z', unsaved: true }).state, 'unsaved');
});

test('overview tasks lead to the place where each item is resolved, most important first', () => {
  const live = { state: 'pending' as const, changes: 2, names: ['Startseite', 'Kontakt'] };
  const tasks = overviewTasks({ publication: live, newInquiries: 3, media: [asset(''), asset('Team'), asset('', 'application/pdf')], launchIssues: 2, smtpReady: false });
  assert.deepEqual(tasks.map(task => [task.id, task.target]), [['publish', 'publish'], ['inquiries', 'inquiries'], ['alt', 'media'], ['launch', 'launch-check'], ['smtp', 'settings-email']]);
  assert.deepEqual(tasks[0].values, { count: 2 });
  assert.equal(tasks[0].detail, 'Startseite · Kontakt');
  assert.equal(missingAltText([asset(''), asset('  '), asset('Beschreibung'), asset('', 'application/pdf')]), 2);
  const calm = overviewTasks({ publication: { state: 'live', changes: 0, names: [] }, newInquiries: 0, media: [asset('Team')], launchIssues: 0, smtpReady: true });
  assert.deepEqual(calm, []);
  const editor = overviewTasks({ publication: live, newInquiries: 0, media: [], launchIssues: 4, smtpReady: false, owner: false });
  assert.deepEqual(editor, [], 'publishing, launch and mail setup are owner tasks');
  assert.equal(overviewTasks({ publication: { ...live, state: 'unsaved' }, newInquiries: 0, media: [], launchIssues: 0, smtpReady: true })[0].target, 'editor');
});

test('media usage lists pages and sections of the draft and published-only uses', () => {
  const draft = site(); const published = site();
  const url = '/api/media/local/11111111-1111-4111-8111-111111111111.webp';
  assert.deepEqual(mediaUsage(url, draft, published), []);
  draft.pages[0].sections[0].content.image = { src: url, alt: '', position: '50% 50%' };
  const section = draft.pages[0].sections[0];
  const label = `${draft.pages[0].title} · ${section.name || section.content.heading}`;
  published.pages[1].sections[0].content.image = { src: url, alt: '', position: '50% 50%' };
  published.pages[0].sections[0].content.image = { src: url, alt: '', position: '50% 50%' };
  const places = mediaUsage(url, draft, published);
  assert.equal(places[0], label);
  assert.equal(places.filter(place => place.startsWith(label)).length, 1, 'a place used in both versions is listed once');
  assert(places.some(place => place.startsWith(published.pages[1].title) && place.endsWith('(veröffentlicht)')));
  assert.deepEqual(mediaUsage('', draft, published), []);
});

test('the workspace search finds areas, pages and settings by name and by common terms', () => {
  const items = [
    { id: 'area:media', label: 'Medien', group: 'area' },
    { id: 'area:editor', label: 'Seiten bearbeiten', group: 'area' },
    { id: 'page:home', label: 'Startseite', group: 'page', terms: '/ seite bearbeiten' },
    { id: 'settings:email', label: 'E-Mail-Versand', group: 'settings', terms: settingAreaTerms('email') },
    { id: 'settings:security', label: 'Zugang', group: 'settings', terms: settingAreaTerms('security') },
  ];
  assert.deepEqual(findWorkspaceResults(items, '').map(item => item.id), ['area:media', 'area:editor']);
  assert.deepEqual(findWorkspaceResults(items, 'smtp').map(item => item.id), ['settings:email']);
  assert.deepEqual(findWorkspaceResults(items, 'Passwort').map(item => item.id), ['settings:security']);
  assert.deepEqual(findWorkspaceResults(items, 'start').map(item => item.id), ['page:home']);
  assert.equal(findWorkspaceResults(items, 'seite')[0].id, 'area:editor', 'label matches rank before term matches');
  assert.deepEqual(findWorkspaceResults(items, 'nichts-passendes'), []);
});
