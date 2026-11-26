#!/usr/bin/env node
// Visuelle Abnahme einer laufenden Website: Bildschirmfolgen für Desktop und Smartphone,
// Kontaktbögen zum schnellen Sichten und messbare Prüfungen (Barrierefreiheit, Lesbarkeit,
// Schriften, Überlauf, Platzhalter, Hauptaktion, Ladeverhalten).
//
//   npm run review:visual -- http://localhost:3000
//   npm run review:visual -- http://localhost:3000 / /leistungen --design 2 --tablet
//
// Optionen: --pages <n> (automatisch gefundene Unterseiten, Standard 4), --design <1-5>,
// --tablet, --out <ordner>, --no-fail. Die Prüfung liest nur; sie speichert oder sendet nichts.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const option = (name, fallback) => { const index = args.indexOf(name); if (index === -1) return fallback; const value = args[index + 1]; args.splice(index, 2); return value; };
const flag = name => { const index = args.indexOf(name); if (index === -1) return false; args.splice(index, 1); return true; };
const pageLimit = Number(option('--pages', '4'));
const design = option('--design');
const outRoot = option('--out', '.checks/visual');
const withTablet = flag('--tablet');
const noFail = flag('--no-fail');
const base = new URL(args.shift() || 'http://localhost:3000');
const requestedPaths = args.length ? args : null;
if (!/^https?:$/.test(base.protocol)) throw new Error('Bitte eine http(s)-Adresse angeben.');

function load(name) {
  try { return require(name); } catch { /* try the globally installed copy */ }
  for (const dir of (process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean)) {
    try { return createRequire(path.join(dir, 'noop.js'))(name); } catch { /* next */ }
  }
  return null;
}
const playwright = load('playwright') || load('@playwright/test');
if (!playwright) {
  console.error('Playwright fehlt. Einmalig einrichten: npm i -D playwright && npx playwright install chromium (oder eine vorhandene Installation über NODE_PATH bereitstellen).');
  process.exit(2);
}
const sharp = load('sharp');
const axeSource = await fs.readFile(require.resolve('axe-core/axe.min.js'), 'utf8').catch(() => null);

const viewports = [
  { name: 'desktop', options: { viewport: { width: 1440, height: 900 } } },
  ...(withTablet ? [{ name: 'tablet', options: { viewport: { width: 834, height: 1112 }, isMobile: true, hasTouch: true } }] : []),
  { name: 'mobile', options: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } },
];
const hideOverlays = 'nextjs-portal,[data-nextjs-toast],.ws-review-switcher{display:none!important}';
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outDir = path.resolve(outRoot, stamp);
await fs.mkdir(outDir, { recursive: true });

const withDesign = pathname => { const url = new URL(pathname, base); if (design) url.searchParams.set('design', design); return url; };
const slug = pathname => (pathname.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-') || 'start').slice(0, 60);

async function dismissConsent(page) {
  for (const label of [/^nur notwendige$/i, /^essential only$/i, /^only necessary$/i, /^ablehnen$/i, /^decline$/i, /notwendige/i, /necessary|essential/i]) {
    const button = page.getByRole('button', { name: label }).first();
    if (await button.isVisible().catch(() => false)) { await button.click().catch(() => {}); await page.waitForTimeout(300); return true; }
  }
  return false;
}

async function discoverPaths(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(withDesign('/').href, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  const found = await page.evaluate(origin => [...document.querySelectorAll('header a[href], nav a[href], footer a[href]')]
    .map(a => new URL(a.getAttribute('href'), location.href))
    .filter(url => url.origin === origin && !/\.(pdf|jpg|png|webp|svg|zip)$/i.test(url.pathname) && !url.pathname.startsWith('/admin'))
    .map(url => url.pathname), base.origin).catch(() => []);
  await context.close();
  const legal = /impressum|datenschutz|privacy|imprint|agb|widerruf/i;
  return ['/', ...new Set(found.filter(p => p !== '/' && !legal.test(p)))].slice(0, 1 + Math.max(0, pageLimit));
}

// Runs inside the page. Returns measurable findings for one viewport.
function inspect({ viewportName }) {
  const visible = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[aria-hidden="true"],[hidden],.ws-review-switcher,nextjs-portal'); };
  const describe = el => { const id = el.id ? '#' + el.id : ''; const cls = [...el.classList].slice(0, 2).map(c => '.' + c).join(''); return (el.tagName.toLowerCase() + id + cls).slice(0, 80); };
  const textOf = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').replace(/\s+/g, ' ').trim();

  const result = { smallText: [], fontFallback: [], placeholders: [], hyphenatedHeadings: [], overflow: [], smallTargets: [], hiddenAfterScroll: [], images: [], meta: {}, firstViewportAction: null };
  const textElements = [...document.querySelectorAll('body *')].filter(el => !['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'PATH'].includes(el.tagName) && textOf(el).length > 1 && visible(el));
  const seenSmall = new Map();
  for (const el of textElements) {
    const cs = getComputedStyle(el); const size = parseFloat(cs.fontSize); const text = textOf(el);
    if (size < 11 && Number(cs.opacity) > 0.05) { const key = describe(el) + '|' + Math.round(size * 10) / 10; if (!seenSmall.has(key)) seenSmall.set(key, { element: describe(el), size: Math.round(size * 10) / 10, text: text.slice(0, 60) }); }
  }
  result.smallText = [...seenSmall.values()].slice(0, 25);

  const bodyText = document.body.innerText;
  for (const [pattern, label] of [[/\{(year|name|0|1)\}/g, 'Unersetzter Platzhalter'], [/lorem ipsum/gi, 'Blindtext'], [/\b(undefined|NaN|\[object Object\])\b/g, 'Technischer Rest'], [/\bTODO\b|\bFIXME\b/g, 'Arbeitsnotiz']]) {
    const match = bodyText.match(pattern); if (match) result.placeholders.push({ label, sample: [...new Set(match)].slice(0, 4).join(', ') });
  }

  for (const heading of document.querySelectorAll('h1,h2')) {
    if (!visible(heading)) continue;
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    let node; let broken = false;
    while (!broken && (node = walker.nextNode())) {
      let index = node.textContent.indexOf('­');
      while (index > 0 && index < node.textContent.length - 1) {
        const before = document.createRange(); before.setStart(node, index - 1); before.setEnd(node, index);
        const after = document.createRange(); after.setStart(node, index + 1); after.setEnd(node, index + 2);
        const tail = after.getClientRects(); const afterTop = tail.length ? tail[tail.length - 1].top : after.getBoundingClientRect().top;
        if (Math.abs(afterTop - before.getBoundingClientRect().top) > 4) { broken = true; break; }
        index = node.textContent.indexOf('­', index + 1);
      }
    }
    if (broken) result.hyphenatedHeadings.push(heading.textContent.replace(/­/g, '').trim().slice(0, 70));
  }

  const width = document.documentElement.clientWidth;
  if (document.documentElement.scrollWidth > width + 1) {
    result.overflow = [...document.querySelectorAll('body *')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > width + 1 && getComputedStyle(el).position !== 'fixed'; })
      .filter(el => !el.parentElement || el.parentElement.getBoundingClientRect().right <= width + 1).slice(0, 8).map(el => ({ element: describe(el), right: Math.round(el.getBoundingClientRect().right) }));
    result.meta.scrollWidth = document.documentElement.scrollWidth;
  }

  if (viewportName !== 'desktop') {
    result.smallTargets = [...document.querySelectorAll('a[href],button,input,select,textarea,[role="button"],summary')].filter(visible)
      .map(el => ({ el, r: el.getBoundingClientRect() })).filter(({ el, r }) => (r.width < 24 || r.height < 24) && !(el.tagName === 'A' && el.closest('p,li') && getComputedStyle(el).display === 'inline'))
      .slice(0, 12).map(({ el, r }) => ({ element: describe(el), size: Math.round(r.width) + '×' + Math.round(r.height), label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40) }));
  }

  result.hiddenAfterScroll = [...document.querySelectorAll('main h1, main h2, main h3, main p, main a, main img')]
    .filter(el => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && !el.closest('[aria-hidden="true"],[hidden],[inert]') && (el.tagName === 'IMG' || textOf(el).length > 12) && Number(cs.opacity) < 0.05 && [...ancestors(el)].every(a => Number(getComputedStyle(a).opacity) > 0.05 || a === el); })
    .slice(0, 8).map(el => ({ element: describe(el), text: (textOf(el) || el.getAttribute('alt') || '').slice(0, 50) }));
  function* ancestors(el) { let current = el.parentElement; while (current && current !== document.body) { yield current; current = current.parentElement; } }

  const dpr = window.devicePixelRatio || 1;
  for (const img of document.images) {
    if (!visible(img) || !img.complete || !img.naturalWidth) { if (!img.hasAttribute('alt')) result.images.push({ issue: 'Alt-Attribut fehlt', src: img.currentSrc.slice(-60) }); continue; }
    const r = img.getBoundingClientRect();
    if (!img.hasAttribute('alt')) result.images.push({ issue: 'Alt-Attribut fehlt', src: img.currentSrc.slice(-60) });
    const fit = getComputedStyle(img).objectFit; const needed = r.width * Math.min(dpr, 2);
    if (fit !== 'contain' && img.naturalWidth < needed * 0.7 && r.width > 160) result.images.push({ issue: `unscharf (${img.naturalWidth}px Quelle für ${Math.round(r.width)}px Anzeige)`, src: img.currentSrc.slice(-60) });
    if (img.naturalWidth > needed * 3 && img.naturalWidth > 1600) result.images.push({ issue: `übergroß (${img.naturalWidth}px Quelle für ${Math.round(r.width)}px Anzeige)`, src: img.currentSrc.slice(-60) });
  }
  result.images = result.images.slice(0, 10);

  const description = document.querySelector('meta[name="description"]')?.content || '';
  result.meta = { ...result.meta, title: document.title, titleLength: document.title.length, description: description.slice(0, 160), descriptionLength: description.length, h1: [...document.querySelectorAll('h1')].filter(visible).map(h => h.textContent.replace(/­/g, '').trim().slice(0, 80)), lang: document.documentElement.lang, canonical: document.querySelector('link[rel="canonical"]')?.href || null, ogImage: !!document.querySelector('meta[property="og:image"]'), robots: document.querySelector('meta[name="robots"]')?.content || null };
  return result;
}

// Asks Chromium which fonts actually drew each text node. Web-font stacks that end up
// in a system font (missing glyphs, failed or skipped loading) are reported, and so is a
// stack whose first family is neither a declared face nor a system font: a renamed or
// bundler-generated family (e.g. a next/font variable) that no @font-face provides.
const systemFamilies = new Set(['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif', 'ui-sans-serif',
  'ui-monospace', 'ui-rounded', 'emoji', 'math', 'fangsong', '-apple-system', 'blinkmacsystemfont', 'segoe ui', 'segoe ui variable',
  'roboto', 'helvetica', 'helvetica neue', 'arial', 'georgia', 'times', 'times new roman', 'courier', 'courier new', 'verdana', 'tahoma',
  'trebuchet ms', 'menlo', 'monaco', 'consolas', 'sf pro text', 'sf pro display', 'sf mono', 'liberation sans', 'liberation serif',
  'liberation mono', 'dejavu sans', 'dejavu serif', 'noto sans', 'noto serif', 'inherit', 'initial', 'unset', 'revert']);
async function fontFallbacks(page) {
  const declared = await page.evaluate(() => [...new Set([...document.fonts].map(face => face.family.replace(/["']/g, '').trim().toLowerCase()))]);
  let cdp;
  try { cdp = await page.context().newCDPSession(page); } catch { return []; }
  const found = new Map();
  try {
    await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
    const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: 'h1,h2,h3,h4,p,li,a,button,label,figcaption,blockquote,small,span,strong,em' });
    for (const nodeId of nodeIds.slice(0, 700)) {
      const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId }).catch(() => ({ fonts: [] }));
      const system = fonts.filter(font => !font.isCustomFont);
      if (system.reduce((sum, font) => sum + font.glyphCount, 0) < 3) continue;
      const { computedStyle } = await cdp.send('CSS.getComputedStyleForNode', { nodeId });
      const stack = computedStyle.find(property => property.name === 'font-family')?.value || '';
      const first = stack.split(',')[0].replace(/["']/g, '').trim();
      const missingFace = !declared.includes(first.toLowerCase());
      if (missingFace && systemFamilies.has(first.toLowerCase())) continue; // an intentional system stack
      const key = stack + '|' + system.map(font => font.familyName).join();
      if (found.has(key)) continue;
      const { outerHTML } = await cdp.send('DOM.getOuterHTML', { nodeId });
      const tag = outerHTML.match(/^<([a-z0-9-]+)([^>]*)>/i);
      const cls = tag?.[2].match(/class="([^"]*)"/)?.[1].split(/\s+/).filter(Boolean).slice(0, 2).map(c => '.' + c).join('') || '';
      found.set(key, { element: (tag?.[1] || 'element') + cls, missingFace: missingFace ? first : undefined, stack: stack.slice(0, 120), drawnWith: system.map(font => `${font.familyName} (${font.glyphCount} Zeichen)`).join(', '), text: outerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 50) });
    }
  } finally { await cdp.detach().catch(() => {}); }
  return [...found.values()].slice(0, 12);
}

// First screen: is there a visible primary action outside the site navigation?
function firstViewportAction() {
  const inNav = el => el.closest('header, nav, [role="navigation"], .ws-consent, .ws-consent-wrap, .ws-review-switcher, footer');
  const candidates = [...document.querySelectorAll('a[href], button')].filter(el => {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return r.top >= 0 && r.bottom <= innerHeight && r.width >= 80 && r.height >= 36 && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.5 && !inNav(el) && (el.textContent || '').trim().length > 2;
  });
  return candidates.slice(0, 3).map(el => (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40));
}

async function webVitals(page) {
  return page.evaluate(() => new Promise(resolve => {
    let lcp = 0; let cls = 0;
    try { new PerformanceObserver(list => { for (const entry of list.getEntries()) lcp = Math.max(lcp, entry.startTime); }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch { /* unsupported */ }
    try { new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) cls += entry.value; }).observe({ type: 'layout-shift', buffered: true }); } catch { /* unsupported */ }
    const navigation = performance.getEntriesByType('navigation')[0];
    setTimeout(() => resolve({ lcpMs: Math.round(lcp), cls: Math.round(cls * 1000) / 1000, transferKB: Math.round((performance.getEntriesByType('resource').reduce((sum, r) => sum + (r.transferSize || 0), 0) + (navigation?.transferSize || 0)) / 1024), requests: performance.getEntriesByType('resource').length }), 400);
  }));
}

async function contactSheet(files, target, viewportName) {
  if (!sharp || !files.length) return [];
  const mobile = viewportName !== 'desktop';
  const [cols, tileW, tileH] = mobile ? [4, 300, 650] : [2, 720, 450];
  const perSheet = mobile ? 4 : 6; const sheets = [];
  for (let start = 0; start < files.length; start += perSheet) {
    const chunk = files.slice(start, start + perSheet);
    const tiles = await Promise.all(chunk.map(async (file, index) => ({ input: await sharp(file).resize(tileW, tileH, { fit: 'cover', position: 'top' }).toBuffer(), left: (index % cols) * (tileW + 8), top: Math.floor(index / cols) * (tileH + 8) })));
    const name = `${target}-${String(sheets.length + 1).padStart(2, '0')}.png`;
    await sharp({ create: { width: Math.min(chunk.length, cols) * (tileW + 8) - 8, height: Math.ceil(chunk.length / cols) * (tileH + 8) - 8, channels: 3, background: '#d9d9d9' } }).composite(tiles).png().toFile(name);
    sheets.push(name);
  }
  return sheets;
}

const browser = await playwright.chromium.launch();
const paths = requestedPaths || await discoverPaths(browser);
const report = { base: base.href, design: design || null, createdAt: new Date().toISOString(), pages: [] };

for (const pathname of paths) {
  const entry = { path: pathname, viewports: {} };
  for (const viewport of viewports) {
    const context = await browser.newContext({ ...viewport.options, locale: 'de-DE' });
    const page = await context.newPage();
    const consoleErrors = []; const failedRequests = [];
    page.on('pageerror', error => consoleErrors.push(String(error).slice(0, 180)));
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 180)); });
    page.on('response', response => { if (response.status() >= 400 && !response.url().includes('/_next/webpack-hmr')) failedRequests.push(`${response.status()} ${response.url().slice(0, 140)}`); });
    const prefix = path.join(outDir, `${slug(pathname)}-${viewport.name}`);
    const response = await page.goto(withDesign(pathname).href, { waitUntil: 'networkidle', timeout: 90000 }).catch(error => { consoleErrors.push('Laden: ' + error.message.slice(0, 120)); return null; });
    await page.addStyleTag({ content: hideOverlays }).catch(() => {});
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${prefix}-0-mit-einwilligung.png` });
    const consentShown = await dismissConsent(page);
    await page.waitForTimeout(400);
    const action = await page.evaluate(firstViewportAction);
    const vitals = await webVitals(page);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = Math.round(viewport.options.viewport.height * 0.85);
    const frames = [];
    for (let y = 0, index = 0; y < height && index < 30; y += step, index++) {
      await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y);
      await page.waitForTimeout(650);
      const file = `${prefix}-${String(index + 1).padStart(2, '0')}.png`;
      await page.screenshot({ path: file }); frames.push(file);
    }
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(500);
    const findings = await page.evaluate(inspect, { viewportName: viewport.name });
    findings.fontFallback = await fontFallbacks(page);
    let axe = [];
    if (axeSource) {
      await page.addScriptTag({ content: axeSource });
      axe = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ['violations'] })).violations.map(v => ({ id: v.id, impact: v.impact, count: v.nodes.length, help: v.help, targets: v.nodes.slice(0, 3).map(n => n.target.join(' ').slice(0, 90)) })));
    }
    let reducedMotion = null;
    if (viewport.name === 'mobile') {
      const calm = await browser.newContext({ ...viewport.options, locale: 'de-DE', reducedMotion: 'reduce' });
      const calmPage = await calm.newPage();
      await calmPage.goto(withDesign(pathname).href, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
      await calmPage.addStyleTag({ content: hideOverlays }).catch(() => {});
      await dismissConsent(calmPage);
      await calmPage.waitForTimeout(300);
      await calmPage.screenshot({ path: `${prefix}-ruhig.png` });
      reducedMotion = { firstScreenAction: await calmPage.evaluate(firstViewportAction) };
      await calm.close();
    }
    const sheets = await contactSheet(frames, `${prefix}-bogen`, viewport.name);
    entry.viewports[viewport.name] = { status: response?.status() ?? null, consentShown, firstScreenAction: action, vitals, height, frames: frames.length, sheets: sheets.map(file => path.relative(process.cwd(), file)), findings, axe, consoleErrors: [...new Set(consoleErrors)].slice(0, 10), failedRequests: [...new Set(failedRequests)].slice(0, 10), reducedMotion };
    await context.close();
    process.stdout.write(`✓ ${pathname} · ${viewport.name}\n`);
  }
  report.pages.push(entry);
}
await browser.close();

// Classification: errors block a release, warnings need a conscious decision.
const issues = [];
for (const entry of report.pages) {
  for (const [name, v] of Object.entries(entry.viewports)) {
    const where = `${entry.path} · ${name}`;
    const add = (level, text) => issues.push({ level, where, text });
    if (v.status && v.status >= 400) add('error', `HTTP ${v.status}`);
    for (const a of v.axe) add(a.impact === 'critical' || a.impact === 'serious' ? 'error' : 'warning', `axe ${a.id} (${a.impact}, ${a.count}×): ${a.help} → ${a.targets.join(' | ')}`);
    if (v.findings.overflow.length) add('error', `Horizontaler Überlauf (${v.findings.meta.scrollWidth}px): ${v.findings.overflow.map(o => o.element).join(', ')}`);
    for (const f of v.findings.fontFallback) add('error', f.missingFace
      ? `Schrift nicht geladen bei ${f.element}: „${f.missingFace}“ ist keine deklarierte Schrift (umbenannte oder vom Bundler erzeugte Familie?), gezeichnet mit ${f.drawnWith} statt ${f.stack} „${f.text}“`
      : `Schrift-Fallback bei ${f.element}: gezeichnet mit ${f.drawnWith} statt ${f.stack} „${f.text}“`);
    for (const p of v.findings.placeholders) add(p.label === 'Unersetzter Platzhalter' || p.label === 'Technischer Rest' ? 'error' : 'warning', `${p.label}: ${p.sample}`);
    if (v.consoleErrors.length) add('error', `Konsolenfehler: ${v.consoleErrors.slice(0, 3).join(' · ')}`);
    if (v.failedRequests.length) add('warning', `Fehlgeschlagene Anfragen: ${v.failedRequests.slice(0, 3).join(' · ')}`);
    if (v.findings.meta.h1.length !== 1) add('warning', `${v.findings.meta.h1.length} sichtbare H1-Überschriften`);
    if (entry.path === '/' && !v.firstScreenAction.length) add('warning', 'Keine Hauptaktion im ersten Bildschirm (außerhalb der Navigation)');
    if (v.findings.smallText.length) add('warning', `Text unter 11 px:${v.findings.smallText.slice(0, 6).map(s => `${s.element} ${s.size}px „${s.text.slice(0, 24)}“`).join(' · ')}`);
    if (name === 'desktop' && v.findings.hyphenatedHeadings.length) add('warning', `Silbentrennung in großen Überschriften: ${v.findings.hyphenatedHeadings.join(' | ')}`);
    if (v.findings.hiddenAfterScroll.length) add('warning', `Nach vollständigem Scrollen noch unsichtbar: ${v.findings.hiddenAfterScroll.map(h => `${h.element} „${h.text}“`).join(' · ')}`);
    if (v.findings.smallTargets.length) add('warning', `Touch-Ziele unter 24 px: ${v.findings.smallTargets.slice(0, 5).map(t => `${t.element} ${t.size} „${t.label}“`).join(' · ')}`);
    for (const image of v.findings.images) add(image.issue.startsWith('Alt') ? 'error' : 'warning', `Bild ${image.issue}: …${image.src}`);
    if (name === 'mobile' && v.vitals.lcpMs > 2500) add('warning', `LCP lokal ${v.vitals.lcpMs} ms (Ziel ≤ 2500 ms; im Feld mit echten Besuchern prüfen)`);
    if (v.vitals.cls > 0.1) add('warning', `Layoutverschiebung CLS ${v.vitals.cls} (Ziel ≤ 0,1)`);
    if (name === 'desktop' && (v.findings.meta.titleLength < 15 || v.findings.meta.titleLength > 65)) add('warning', `Seitentitel mit ${v.findings.meta.titleLength} Zeichen: „${v.findings.meta.title}“`);
    if (name === 'desktop' && (v.findings.meta.descriptionLength < 70 || v.findings.meta.descriptionLength > 165)) add('warning', `Meta-Beschreibung mit ${v.findings.meta.descriptionLength} Zeichen`);
  }
}
report.issues = issues;
await fs.writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));

const errors = issues.filter(i => i.level === 'error'); const warnings = issues.filter(i => i.level === 'warning');
const lines = [`# Visuelle Abnahme · ${base.href}${design ? ` · Gestaltung ${design}` : ''}`, '', `${new Date().toLocaleString('de-DE')} · ${report.pages.length} Seite(n) · ${errors.length} Fehler · ${warnings.length} Hinweise`, '',
  '## Zuerst ansehen', '', 'Kontaktbögen öffnen und jede Bildschirmhöhe gegen den Qualitätsmaßstab (`skills/website-starter/references/quality-bar.md`) prüfen: Einstieg, erster Beleg, Rhythmus, Lesbarkeit, Übergänge, Footer. Zusätzlich je Seite `*-0-mit-einwilligung.png` (erster Bildschirm mit Einwilligung) und `*-mobile-ruhig.png` (reduzierte Bewegung).', ''];
for (const entry of report.pages) for (const [name, v] of Object.entries(entry.viewports)) lines.push(`- ${entry.path} · ${name}: ${v.sheets.map(s => '`' + s + '`').join(', ') || `${v.frames} Einzelbilder`} · LCP ${v.vitals.lcpMs} ms · CLS ${v.vitals.cls} · ${v.vitals.transferKB} KB / ${v.vitals.requests} Anfragen · Hauptaktion: ${v.firstScreenAction.join(', ') || '—'}`);
lines.push('', '## Fehler', '', ...(errors.length ? errors.map(i => `- **${i.where}** — ${i.text}`) : ['Keine.']), '', '## Hinweise', '', ...(warnings.length ? warnings.map(i => `- **${i.where}** — ${i.text}`) : ['Keine.']), '');
await fs.writeFile(path.join(outDir, 'report.md'), lines.join('\n'));
console.log(`\n${errors.length} Fehler, ${warnings.length} Hinweise → ${path.relative(process.cwd(), path.join(outDir, 'report.md'))}`);
if (errors.length && !noFail) process.exitCode = 1;
