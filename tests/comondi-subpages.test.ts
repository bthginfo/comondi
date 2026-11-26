import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { promisify } from 'node:util';
import seed from '../src/data/content.json';
import before from './fixtures/comondi-subpages-before.json';
import type { CmsState, PageContent, Section, WebsiteContent } from '../src/lib/types';
import { SECTION_TYPES } from '../src/lib/types';
import { sectionSchema, websiteSchema } from '../src/lib/validation';
import { createSection, sectionLibrary } from '../src/lib/section-library';
import { sectionCapabilities } from '../src/components/admin/section-capabilities';
import { comondiPageSectionTypes, comondiSectionGuides, entryWorld, factLines, magazineTopics, planetWorld, questionsHref, worldForText } from '../src/lib/comondi-sections';
import { SUBPAGE_SLUGS, buildSubpages, currentPeople } from '../scripts/content/comondi-subpages-content';
import { applySubpages, otherDraftChanges, runSubpagesMigration, type MigrationStore } from '../scripts/content/comondi-subpages-migration';

const run = promisify(execFile);
const newContent = seed as WebsiteContent;
/** The live content before the redesign: the current seed with the old subpages put back. */
function oldContent(): WebsiteContent {
  const content = structuredClone(newContent);
  for (const page of (before as { pages: PageContent[] }).pages) content.pages[content.pages.findIndex(entry => entry.slug === page.slug)] = structuredClone(page);
  return content;
}
function memoryStore(content: WebsiteContent) {
  const calls: string[] = [];
  let state: CmsState = { draft: structuredClone(content), published: structuredClone(content), revision: 7, updatedAt: '2026-11-26T10:00:00.000Z', publishedAt: '2026-11-26T10:00:00.000Z', revisions: [] };
  const store: MigrationStore = {
    async getState() { calls.push('get'); return structuredClone(state); },
    async saveDraft(next, revision) {
      calls.push('save');
      if (revision !== state.revision) throw new Error('409');
      websiteSchema.parse(next);
      state = { ...state, draft: structuredClone(next), revision: state.revision + 1 };
      return structuredClone(state);
    },
    async publish(revision) {
      calls.push('publish');
      if (revision !== state.revision) throw new Error('409');
      state = { ...state, published: structuredClone(state.draft), revision: state.revision + 1 };
      return structuredClone(state);
    },
  };
  return { store, calls, state: () => state, edit: (change: (state: CmsState) => void) => change(state) };
}
const pageBySlug = (content: WebsiteContent, slug: string) => content.pages.find(page => page.slug === slug)!;
const newTypes = comondiPageSectionTypes.filter(type => type !== 'comondi-contact');

test('every new co:mondi section type is registered in types, library, schema and capabilities', () => {
  assert.equal(newTypes.length, 17);
  for (const type of newTypes) {
    assert.ok(SECTION_TYPES.includes(type), `${type} in SECTION_TYPES`);
    const entry = sectionLibrary.find(candidate => candidate.type === type);
    assert.ok(entry && entry.category === 'co:mondi', `${type} in the section library`);
    const created = createSection(type);
    assert.equal(sectionSchema.safeParse(created).success, true, `${type} default content is valid`);
    assert.equal(created.design.theme, 'dark');
    const guide = comondiSectionGuides[type]!;
    const capabilities = sectionCapabilities(type);
    assert.equal(capabilities.items, guide.maxItems > 0, `${type} offers entries in the CMS`);
    assert.equal(capabilities.quote, typeof guide.section.quote === 'string');
    assert.equal(capabilities.icons, false, `${type} shows no icon picker it does not render`);
    assert.ok(guide.hint.length > 40, `${type} explains its fields`);
  }
  assert.equal(createSection('comondi-planet-hero').design.comondiPlanet, 'jupiter');
});

test('the section schema keeps the planet choice and enforces the limits of each section', () => {
  const hero = createSection('comondi-planet-hero');
  for (const planet of ['jupiter', 'neptune', 'saturn', 'moon'] as const) {
    const parsed = sectionSchema.parse({ ...hero, design: { ...hero.design, comondiPlanet: planet } });
    assert.equal(parsed.design.comondiPlanet, planet, 'the planet survives a save');
  }
  assert.equal(sectionSchema.safeParse({ ...hero, design: { ...hero.design, comondiPlanet: 'pluto' } }).success, false);
  assert.equal(sectionSchema.safeParse({ ...hero, content: { ...hero.content, items: [{ id: 'x', title: 'x', text: '' }] } }).success, false, 'the opening has no entries');
  const map = createSection('comondi-map');
  assert.equal(sectionSchema.safeParse({ ...map, design: { ...map.design, comondiPlanet: 'moon' } }).success, false, 'planets only on service sections');
  const items = Array.from({ length: 9 }, (_, index) => ({ id: `w${index}`, title: `Welt ${index}`, text: '' }));
  assert.equal(sectionSchema.safeParse({ ...map, content: { ...map.content, items } }).success, false);
  assert.equal(sectionSchema.safeParse({ ...map, content: { ...map.content, items: items.slice(0, 8) } }).success, true);
  const route = createSection('comondi-route');
  assert.equal(sectionSchema.safeParse({ ...route, content: { ...route.content, items: [{ id: 'a', title: 'A', text: '', href: 'javascript:alert(1)' }] } }).success, false, 'links stay safe');
});

test('the seed carries the new subpages with their own composition and checked metadata', () => {
  websiteSchema.parse(newContent);
  const built = buildSubpages(newContent);
  const signatures = new Set<string>();
  for (const slug of SUBPAGE_SLUGS) {
    const page = pageBySlug(newContent, slug);
    assert.deepEqual(page.sections, built[slug].sections, `${slug} matches the builder`);
    assert.ok(page.seo.title.length >= 15 && page.seo.title.length <= 65, `${slug} title length ${page.seo.title.length}`);
    assert.ok(page.seo.description.length >= 70 && page.seo.description.length <= 160, `${slug} description length ${page.seo.description.length}`);
    assert.ok(page.sections[0].content.heading.trim(), `${slug} opens with a heading`);
    assert.ok(!page.sections.some(section => ['comondi-inner', 'comondi-worlds', 'comondi-process', 'comondi-culture', 'comondi-proof', 'comondi-team', 'comondi-cta', 'comondi-legal'].includes(section.type)), `${slug} repeats no start page block`);
    const ids = page.sections.map(section => section.id);
    assert.equal(new Set(ids).size, ids.length);
    signatures.add(page.sections.map(section => `${section.type}${section.design.comondiPlanet ? `:${section.design.comondiPlanet}` : ''}`).join('>'));
    const text = JSON.stringify(page.sections);
    assert.doesNotMatch(text, /lorem|undefined|TODO|\{year\}|example\.invalid|Platzhalter/i, `${slug} has no placeholders`);
  }
  // The three articles share the reading layout; every other page has its own composition or planet.
  assert.equal(signatures.size, 10, `only ${signatures.size} distinct compositions`);
  const planets = ['leistungen/projektmanagement', 'leistungen/agile-transformation', 'leistungen/hybride-zusammenarbeit', 'leistungen/ki-im-arbeitsalltag']
    .map(slug => pageBySlug(newContent, slug).sections[0].design.comondiPlanet);
  assert.deepEqual(planets, ['jupiter', 'neptune', 'saturn', 'moon']);
  for (const slug of ['', 'impressum', 'datenschutz']) assert.deepEqual(pageBySlug(newContent, slug), pageBySlug(oldContent(), slug), `${slug || 'start page'} is unchanged`);
});

test('people, e-mail addresses and portraits come from the current content', () => {
  const content = oldContent();
  const team = pageBySlug(content, 'ueber-uns').sections.find(section => section.type === 'comondi-team')!;
  team.content.items![0].phone = '+49 89 000000';
  team.content.items![1].image = { src: '/comondi/people/sebastian-kunerl.webp', alt: 'Sebastian Kunerl lacht', position: '50% 50%', width: 342, height: 348 };
  const people = currentPeople(content);
  assert.equal(people[0].phone, '+49 89 000000');
  assert.equal(people[1].image?.alt, 'Sebastian Kunerl lacht');
  assert.equal(people[0].label, 'Geschäftsführung', 'labels written in capitals get a calm form');
  const next = applySubpages(content).content;
  const contact = pageBySlug(next, 'kontakt').sections[0];
  assert.equal(contact.content.items![0].phone, '+49 89 000000');
  assert.deepEqual(contact.content.form, pageBySlug(content, 'kontakt').sections.find(section => section.type === 'comondi-contact')!.content.form, 'form texts are kept');
});

test('the migration changes only the target pages and is idempotent', () => {
  const old = oldContent();
  const { content, changes } = applySubpages(old);
  assert.equal(changes.length, SUBPAGE_SLUGS.length);
  assert.deepEqual(content.config, old.config);
  assert.deepEqual(content.posts, old.posts);
  assert.deepEqual(content.templates, old.templates);
  assert.deepEqual(content.pages.map(page => page.slug), old.pages.map(page => page.slug), 'no page is added, removed or moved');
  for (const page of old.pages) {
    const after = pageBySlug(content, page.slug);
    if ((SUBPAGE_SLUGS as readonly string[]).includes(page.slug)) {
      assert.equal(after.id, page.id); assert.equal(after.title, page.title); assert.equal(after.locale, page.locale);
      assert.equal(after.seo.image, page.seo.image);
    } else assert.deepEqual(after, page, `${page.slug || 'start page'} stays as it is`);
  }
  assert.deepEqual(content.pages, newContent.pages, 'the result equals the new seed');
  const again = applySubpages(content);
  assert.equal(again.changes.length, 0);
  assert.deepEqual(again.content, content);
  const missing = structuredClone(old);
  missing.pages = missing.pages.filter(page => page.slug !== 'kontakt');
  assert.throws(() => applySubpages(missing), /kontakt fehlt/);
});

test('a dry run reports the difference and writes nothing; saving and publishing follow the CMS rules', async () => {
  const memory = memoryStore(oldContent());
  const lines: string[] = [];
  const dry = await runSubpagesMigration(memory.store, { dryRun: true, source: 'Test', log: line => lines.push(line) });
  assert.deepEqual(memory.calls, ['get']);
  assert.equal(dry.changes.length, 12);
  assert.match(dry.report, /Trockenlauf/);
  assert.match(dry.report, /12 von 12 Zielseiten/);
  assert.match(dry.report, /\/leistungen\n {2}Titel:/);
  assert.match(dry.report, /comondi-inner#leistungsstart.*\n.*comondi-map#landkarte/);
  assert.match(dry.report, /Weitere unveröffentlichte Änderungen im Entwurf: keine/);

  const saved = await runSubpagesMigration(memory.store, { source: 'Test' });
  assert.deepEqual(memory.calls, ['get', 'get', 'save']);
  assert.equal(saved.savedRevision, 8);
  assert.equal(saved.published, false);
  assert.deepEqual(memory.state().draft.pages, newContent.pages);
  assert.deepEqual(memory.state().published.pages, oldContent().pages, 'nothing is public before publishing');

  const repeat = await runSubpagesMigration(memory.store, { dryRun: true });
  assert.equal(repeat.changes.length, 0);
  assert.match(repeat.report, /Keine Änderungen/);

  const published = await runSubpagesMigration(memory.store, { publish: true });
  assert.equal(published.published, true);
  assert.equal(memory.calls.filter(call => call === 'save').length, 1, 'an unchanged draft is not saved again');
  assert.deepEqual(memory.state().published, memory.state().draft);
  const twice = await runSubpagesMigration(memory.store, { publish: true });
  assert.equal(twice.published, false, 'publishing twice is a no-op');
  assert.equal(memory.calls.filter(call => call === 'publish').length, 1);
});

test('publishing refuses to take other unpublished draft changes along', async () => {
  const memory = memoryStore(oldContent());
  memory.edit(state => { pageBySlug(state.draft, '').sections[0].content.heading = 'Noch nicht freigegeben'; state.draft.config.tagline = 'Neu'; });
  assert.deepEqual(otherDraftChanges(memory.state()), ['Einstellungen', 'Seite /']);
  await assert.rejects(runSubpagesMigration(memory.store, { publish: true }), /weitere unveröffentlichte Änderungen \(Einstellungen, Seite \/\)/);
  assert.ok(!memory.calls.includes('save') && !memory.calls.includes('publish'));
  const draft = await runSubpagesMigration(memory.store, {});
  assert.equal(draft.savedRevision, 8, 'saving as a draft remains possible');
  assert.equal(pageBySlug(memory.state().draft, '').sections[0].content.heading, 'Noch nicht freigegeben', 'the other draft change is kept');
});

test('the command line script works on a local .data store: dry run, draft, idempotent publish', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'comondi-subpages-'));
  try {
    await mkdir(path.join(directory, '.data'));
    const old = oldContent();
    const file = path.join(directory, '.data', 'cms.json');
    await writeFile(file, JSON.stringify({ state: { draft: old, published: old, revision: 3, updatedAt: '2026-11-26T10:00:00.000Z', publishedAt: '2026-11-26T10:00:00.000Z', revisions: [] }, records: {} }));
    const script = path.resolve('scripts/content/comondi-subpages.ts');
    const loader = pathToFileURL(createRequire(path.resolve('package.json')).resolve('tsx')).href;
    const cli = (...args: string[]) => run(process.execPath, ['--conditions=react-server', '--import', loader, script, ...args], {
      cwd: directory, env: { ...process.env, NODE_ENV: 'test', DATABASE_URL: 'postgresql://user:secret@example.invalid/db', WS_USE_REMOTE_DATABASE: '0', TSX_TSCONFIG_PATH: path.resolve('tsconfig.json') },
    });
    const state = async () => (JSON.parse(await readFile(file, 'utf8')) as { state: CmsState }).state;

    const dry = await cli('--dry-run');
    assert.match(dry.stdout, /Quelle: lokale Daten/, 'a DATABASE_URL alone never selects the database');
    assert.match(dry.stdout, /12 von 12 Zielseiten/);
    assert.equal((await state()).revision, 3);
    assert.deepEqual((await state()).draft.pages, old.pages);

    const draft = await cli();
    assert.match(draft.stdout, /Entwurf gespeichert: Revision 4/);
    assert.deepEqual((await state()).draft.pages, newContent.pages);
    assert.deepEqual((await state()).published.pages, old.pages);

    const publish = await cli('--publish');
    assert.match(publish.stdout, /Entwurf unverändert/);
    assert.match(publish.stdout, /Veröffentlicht: Revision 5/);
    const after = await state();
    assert.deepEqual(after.published, after.draft);
    assert.equal(after.revisions.length, 1);

    const again = await cli('--publish');
    assert.match(again.stdout, /Keine Änderungen/);
    assert.match(again.stdout, /Bereits veröffentlicht/);
    assert.equal((await state()).revision, 5);
    await assert.rejects(cli('--dry-run', '--publish'), /schließen sich aus/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('helpers: worlds from words, facts, question links and topics', () => {
  assert.equal(worldForText('Projekt- & Programmmanagement'), 0);
  assert.equal(worldForText('Change Management'), 1);
  assert.equal(worldForText('Hybride Zusammenarbeit und Organisationsentwicklung'), 2);
  assert.equal(worldForText('KI im Arbeitsalltag'), 3);
  assert.equal(worldForText('Menschen & Entwicklung'), 3);
  assert.equal(worldForText(''), undefined);
  assert.equal(entryWorld({ id: 'hybrid', title: 'x' }, 0), 2);
  assert.equal(planetWorld('saturn'), 2);
  assert.equal(planetWorld(undefined), 0);
  assert.deepEqual(factLines('Auf einen Blick\nOrt: simply outdoor\nModule: Scrum, Team\nohne Bezeichnung'), {
    title: 'Auf einen Blick',
    facts: [{ term: 'Ort', detail: 'simply outdoor' }, { term: 'Module', detail: 'Scrum, Team' }, { term: '', detail: 'ohne Bezeichnung' }],
  });
  assert.equal(questionsHref('/kontakt?service=KI', []), '/kontakt?service=KI');
  const href = questionsHref('/kontakt?service=KI', ['Frage eins?', 'Frage zwei?']);
  const params = new URL(href, 'https://comondi.de').searchParams;
  assert.equal(params.get('service'), 'KI');
  assert.equal(params.get('message'), 'Diese Fragen beschäftigen uns:\n– Frage eins?\n– Frage zwei?');
  assert.ok(new URL(questionsHref('/kontakt', ['x']), 'https://comondi.de').searchParams.has('message'));
  assert.deepEqual(magazineTopics([{ meta: 'A' }, { meta: ' B ' }, { meta: 'A' }, {}]), ['A', 'B']);
});

test('every section of the new subpages renders from fields the CMS can edit', () => {
  for (const slug of SUBPAGE_SLUGS) for (const section of pageBySlug(newContent, slug).sections as Section[]) {
    const guide = comondiSectionGuides[section.type];
    if (!guide) { assert.equal(section.type, 'comondi-faq'); continue; }
    for (const [field, label] of Object.entries(guide.section)) {
      const key = field === 'primary' ? 'primaryLabel' : field === 'secondary' ? 'secondaryLabel' : field;
      if (label === null) assert.ok(!section.content[key as keyof Section['content']], `${slug} ${section.id} fills ${key}, which its CMS fields hide`);
    }
    for (const item of section.content.items ?? []) for (const [field, label] of Object.entries(guide.item ?? {})) {
      if (label === null) assert.ok(!item[field as keyof typeof item] || (Array.isArray(item[field as keyof typeof item]) && !(item[field as keyof typeof item] as unknown[]).length), `${slug} ${section.id} ${item.id} fills ${field}, which its CMS fields hide`);
    }
  }
});
