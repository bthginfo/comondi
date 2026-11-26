/**
 * One-off content migration for the redesigned co:mondi subpages. Start it by hand:
 *
 *   npm run content:comondi-subpages -- --dry-run      report only, nothing is written
 *   npm run content:comondi-subpages                   save a new draft (revision + 1)
 *   npm run content:comondi-subpages -- --publish      save and publish
 *
 * Without WS_USE_REMOTE_DATABASE=1 the script works on the local .data store, even when a
 * DATABASE_URL is present. With WS_USE_REMOTE_DATABASE=1 and DATABASE_URL it reads and writes
 * the database through the app's own functions (src/lib/db.ts), exactly like a CMS save.
 */
import { runSubpagesMigration } from './comondi-subpages-migration';

const args = new Set(process.argv.slice(2));
if (args.has('--help') || args.has('-h')) {
  console.log('Aufruf: npm run content:comondi-subpages -- [--dry-run] [--publish]\nOhne WS_USE_REMOTE_DATABASE=1 arbeitet das Skript mit den lokalen Daten in .data.');
  process.exit(0);
}
const unknown = [...args].filter(arg => !['--dry-run', '--publish'].includes(arg));
if (unknown.length) {
  console.error(`Unbekannte Option: ${unknown.join(', ')}`);
  process.exit(2);
}
if (args.has('--dry-run') && args.has('--publish')) {
  console.error('--dry-run und --publish schließen sich aus.');
  process.exit(2);
}

const remote = process.env.WS_USE_REMOTE_DATABASE === '1' && Boolean(process.env.DATABASE_URL);
if (!remote) delete process.env.DATABASE_URL;
if (process.env.WS_USE_REMOTE_DATABASE === '1' && !remote) {
  console.error('WS_USE_REMOTE_DATABASE=1 ist gesetzt, aber DATABASE_URL fehlt.');
  process.exit(2);
}
const source = remote ? `Datenbank ${new URL(process.env.DATABASE_URL!).hostname}` : 'lokale Daten (.data/cms.json)';

async function main() {
  // The data source is chosen when db.ts is loaded, so it is imported after the checks above.
  const db = await import('../../src/lib/db');
  await runSubpagesMigration({ getState: db.getState, saveDraft: db.saveDraft, publish: db.publish }, {
    dryRun: args.has('--dry-run'),
    publish: args.has('--publish'),
    source,
    log: line => console.log(line),
  });
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
