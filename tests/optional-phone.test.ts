import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {join} from 'node:path';

// A site may be reachable by email only. Every phone link of the site itself must then disappear instead of
// rendering an empty `tel:` link, in all layout variants and in llms.txt.
const files=['src/components/site/site-view.tsx',...readdirSync('src/components/site/variants').filter(name=>name.endsWith('.tsx')).map(name=>join('src/components/site/variants',name))];
const phoneLink=/<ContentLink href=\{(?:`tel:\$\{site\.phone|phoneHref\(site\.phone\))/g;
test('site phone links render only when a phone number is set',()=>{
 for(const file of files){
  const source=readFileSync(file,'utf8');
  for(const match of source.matchAll(phoneLink)){
   const before=source.slice(Math.max(0,match.index-90),match.index);
   assert.match(before,/site\.phone &&[^{}]*$/,`${file}: unguarded phone link near …${before.slice(-50)}`);
  }
 }
});
test('llms.txt omits the phone line without a number',()=>{
 const source=readFileSync('src/app/llms.txt/route.ts','utf8');
 assert.match(source,/config\.phone\?\.trim\(\)\?/);
});
test('contact forms ask for a callback number only when the site has a phone number',()=>{
 const form=readFileSync('src/components/site/contact-form.tsx','utf8');
 assert.match(form,/\{askPhone && <label htmlFor=\{`\$\{id\}-phone`\}>/);
 assert.match(form,/<label htmlFor=\{`\$\{id\}-subject`\}>/,'the subject field stays');
 for(const file of files){
  const source=readFileSync(file,'utf8');
  for(const match of source.matchAll(/<ContactForm (?![^>]*kind=)[^>]*>/g))assert.match(match[0],/askPhone=\{Boolean\(site\.phone\?\.trim\(\)\)\}/,`${file}: ${match[0]}`);
 }
});
