import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import seed from '../src/data/content.json';
import { copyrightText, footerConfig } from '../src/lib/site-config';
import type { WebsiteContent } from '../src/lib/types';

const root = new URL('../', import.meta.url).pathname;
const read = (file: string) => readFileSync(path.join(root, file), 'utf8');
const walk = (dir: string): string[] => readdirSync(path.join(root, dir)).flatMap(name => {
  const file = path.join(dir, name);
  return statSync(path.join(root, file)).isDirectory() ? walk(file) : [file];
});

test('footer copyright tokens are replaced wherever a public layout renders them', () => {
  const site = structuredClone((seed as unknown as WebsiteContent).config);
  site.name = 'Beispiel Atelier';
  site.footer = { ...footerConfig(site), copyright: '© {year} {name}' };
  assert.equal(copyrightText(site), `© ${new Date().getFullYear()} Beispiel Atelier`);
  const raw = walk('src/components').filter(file => !file.includes(`${path.sep}admin${path.sep}`) && file.endsWith('.tsx'))
    .filter(file => /\{\s*(site\.)?footer\??\.copyright\s*\}/.test(read(file)));
  assert.deepEqual(raw, [], 'Public layouts must render footer copyright through copyrightText()');
});

test('public stylesheets keep a legibility floor of 11 px', () => {
  const editorOnly = /\.ws-(section-select|inline-upload|image-picker|review-option|review-panel)\b/;
  const offenders: string[] = [];
  for (const file of ['site.css', 'variant-navy.css', 'variant-noir.css', 'variant-immersive.css', 'variant-editorial.css', 'blog-feed.css']) {
    read(`src/styles/${file}`).split('\n').forEach((line, index) => {
      if (editorOnly.test(line)) return;
      for (const match of line.matchAll(/font-size:\s*([0-9.]+)(px|rem)/g)) {
        const px = match[2] === 'rem' ? Number(match[1]) * 16 : Number(match[1]);
        if (px < 11) offenders.push(`${file}:${index + 1} ${match[0]}`);
      }
    });
  }
  assert.deepEqual(offenders, []);
});

test('next/font faces are referenced by their real family names in every bundler', () => {
  // `declarations` rename each @font-face, but the generated CSS variables keep bundler-specific
  // names ("bodyFont" with Turbopack, a hashed name with webpack). Reading them as a font-family
  // makes text fall back to a system font, so stylesheets must name the families directly.
  const fonts = read('src/app/fonts.ts');
  const variables = [...fonts.matchAll(/variable:'(--[\w-]+)'/g)].map(match => match[1]);
  const families = [...new Set([...fonts.matchAll(/prop:'font-family',value:'([^']+)'/g)].map(match => match[1]))];
  assert(variables.length >= 3 && families.length >= 2);
  const sources = walk('src').filter(file => /\.(css|tsx?|mjs)$/.test(file) && !file.endsWith(path.join('app', 'fonts.ts')));
  const offenders = sources.flatMap(file => variables.filter(name => read(file).includes(`var(${name}`)).map(name => `${file}: ${name}`));
  assert.deepEqual(offenders, []);
  const css = sources.filter(file => file.endsWith('.css')).map(read).join('\n');
  for (const family of families) assert(css.includes(`'${family}'`) || css.includes(`"${family}"`), family);
});

test('the skill points agents to the visual review and the measurable quality bar', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts['review:visual'], 'node scripts/visual-review.mjs');
  assert.match(read('scripts/visual-review.mjs'), /axe-core/);
  const skill = read('skills/website-starter/SKILL.md');
  assert.match(skill, /references\/quality-bar\.md/);
  assert.match(skill, /npm run review:visual/);
  const bar = read('skills/website-starter/references/quality-bar.md');
  for (const heading of ['## Prüfablauf', '## Messbare Untergrenzen', '## Gestalterische Gegenprobe']) assert(bar.includes(heading), heading);
  assert(JSON.parse(read('template.manifest.json')).implemented.includes('visual-review'));
});
