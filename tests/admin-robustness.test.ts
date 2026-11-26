import test from 'node:test';
import assert from 'node:assert/strict';
import seed from '../src/data/content.json';
import { createSessionGate, fetchWithSession, LOGIN_URL } from '../src/lib/admin-request';
import { DRAFT_RECOVERY_MAX_AGE, parseRecovery, recoveryDecision, recoveryRecord } from '../src/lib/draft-recovery';
import { canUseAdminAction } from '../src/lib/team/permissions';
import { useLocalMediaStore } from '../src/lib/database-policy';
import { preflightContentIssues } from '../src/lib/launch-content.mjs';
import { uploadProblem } from '../src/lib/media-upload-rules';
import type { WebsiteContent } from '../src/lib/types';

const ok = () => new Response('{}', { status: 200 });
const expired = () => new Response('{"error":"Ihre Sitzung ist abgelaufen."}', { status: 401 });

test('an expired session asks for a new sign-in and repeats the interrupted request once', async () => {
  const gate = createSessionGate();
  let prompts = 0;
  gate.register(async () => { prompts++; return true; });
  const calls: string[] = [];
  const responses = [expired(), ok()];
  const result = await fetchWithSession('/api/admin/content', { method: 'PUT', body: '{"revision":3}' }, gate, async (url, init) => {
    calls.push(`${init.method} ${url} ${init.body}`);
    return responses.shift()!;
  });
  assert.equal(result.response.status, 200);
  assert.equal(result.reauthenticated, true);
  assert.equal(prompts, 1);
  assert.deepEqual(calls, ['PUT /api/admin/content {"revision":3}', 'PUT /api/admin/content {"revision":3}'], 'the same body is sent again');
});

test('a cancelled sign-in keeps the 401 so the editor keeps its unsaved draft', async () => {
  const gate = createSessionGate();
  gate.register(async () => false);
  let sent = 0;
  const result = await fetchWithSession('/api/admin/content', { method: 'PUT' }, gate, async () => { sent++; return expired(); });
  assert.equal(result.response.status, 401);
  assert.equal(result.reauthenticated, false);
  assert.equal(sent, 1);
});

test('concurrent requests share one sign-in dialog; the login request itself is never retried', async () => {
  const gate = createSessionGate();
  let prompts = 0; let release!: (value: boolean) => void;
  gate.register(() => { prompts++; return new Promise<boolean>(resolve => { release = resolve; }); });
  const first = gate.reauthenticate(); const second = gate.reauthenticate();
  release(true);
  assert.deepEqual(await Promise.all([first, second]), [true, true]);
  assert.equal(prompts, 1);
  let loginCalls = 0;
  const login = await fetchWithSession(LOGIN_URL, { method: 'POST' }, gate, async () => { loginCalls++; return expired(); });
  assert.equal(login.response.status, 401);
  assert.equal(loginCalls, 1);
  assert.equal(prompts, 1);
  const unavailable = createSessionGate();
  assert.equal(unavailable.available, false);
  assert.equal(await unavailable.reauthenticate(), false);
});

test('unsaved changes are offered for restoring only while the saved draft is unchanged', () => {
  const content = structuredClone(seed) as WebsiteContent;
  const changed = structuredClone(content); changed.pages[0].title = 'Geänderte Startseite';
  const now = new Date('2026-11-26T10:00:00Z');
  const record = parseRecovery(JSON.stringify(recoveryRecord(changed, 7, now)));
  assert(record);
  assert.equal(recoveryDecision(record, 7, content, now.getTime()), 'restore');
  assert.equal(recoveryDecision(record, 8, content, now.getTime()), 'outdated', 'a newer save elsewhere must not be overwritten');
  assert.equal(recoveryDecision(record, 7, changed, now.getTime()), 'none', 'already saved');
  assert.equal(recoveryDecision(record, 7, content, now.getTime() + DRAFT_RECOVERY_MAX_AGE + 1), 'none', 'expired copies are ignored');
  assert.equal(recoveryDecision(null, 7, content), 'none');
  for (const raw of [null, '', 'kein json', '{"format":"other"}', JSON.stringify({ format: 'ws-draft-recovery-v1', revision: 1, savedAt: 'x', content: {} }),
    JSON.stringify({ format: 'ws-draft-recovery-v1', revision: 1.5, savedAt: now.toISOString(), content: changed })]) {
    assert.equal(parseRecovery(raw), null, String(raw).slice(0, 40));
  }
});

test('every workspace role may read the draft revision; only owners publish', () => {
  for (const role of ['owner', 'editor', 'shop'] as const) assert.equal(canUseAdminAction(role, 'revision', 'GET'), true, role);
  assert.equal(canUseAdminAction('editor', 'revision', 'PUT'), false);
  assert.equal(canUseAdminAction('editor', 'publish', 'POST'), false);
});

test('only a local installation without Blob store and remote database keeps uploads in .data/media', () => {
  assert.equal(useLocalMediaStore({}, false), true);
  assert.equal(useLocalMediaStore({ BLOB_READ_WRITE_TOKEN: 'token' }, false), false);
  assert.equal(useLocalMediaStore({ VERCEL: '1' }, false), false, 'hosted sites never fall back to local files');
  assert.equal(useLocalMediaStore({}, true), false);
});

test('the launch check reports images from the local test store', () => {
  const content = structuredClone(seed) as WebsiteContent;
  const before = preflightContentIssues(content);
  assert(!before.some(issue => issue.includes('lokalen Testspeicher')));
  content.pages[0].sections[0].content.image = { src: '/api/media/local/00000000-0000-4000-8000-000000000000.webp', alt: 'Test', position: '50% 50%' };
  assert(preflightContentIssues(content).some(issue => issue.includes('lokalen Testspeicher')));
});

test('upload limits are explained before any transfer', () => {
  assert.equal(uploadProblem({ type: 'image/webp', size: 1000 }), undefined);
  assert.match(uploadProblem({ type: 'image/gif', size: 1000 })!, /JPG-, PNG- oder WebP/);
  assert.match(uploadProblem({ type: 'image/png', size: 4 * 1024 * 1024 + 1 })!, /4 MB/);
  assert.match(uploadProblem({ type: 'image/png', size: 0 })!, /4 MB/);
});
