import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {workspaceHome} from '../src/lib/team/permissions';

// Opening the CMS lands on the overview. The guided intro must not start by itself: its steps open the editor,
// so an automatic start left people in the editor instead of the "Übersicht".
test('the owner workspace opens on the overview',()=>{
 assert.equal(workspaceHome('owner'),'dashboard');
});
test('the guided tour only starts on request and returns to where it was started',()=>{
 const source=readFileSync('src/components/admin/admin-app.tsx','utf8');
 assert.doesNotMatch(source,/if\s*\(\s*!complete\s*\)\s*setTourOpen\(true\)/);
 assert.equal((source.match(/setTourOpen\(true\)/g)??[]).length,1,'only startTour opens the tour');
 assert.match(source,/function closeTour\(\)\s*\{[^}]*navigate\(tourOrigin\.current\)/);
});
