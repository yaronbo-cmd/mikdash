// QA content-safety scan (no browser): the built bundle and the repo against PROJECT.md §2.
//   node build.mjs && node test/qa-content-scan.cjs            → prints PASS/FAIL per rule, exit 1 on a FAIL
// 1. No Divine Name in the bundle: the Tetragrammaton in any pointing (and \u-escaped), Elohim, Eloah, Adonai, Shaddai,
//    Tzevaot, Yah (the Hebrew spellings are built from \u escapes below).
// 2. No Divine Name written in full anywhere in the repo (src, content, docs, test, PROJECT.md): code comments and test
//    patterns included (§2.3 "in any text, code comment or asset"); a test may build its pattern from \u escapes.
// 3. Every tap-to-identify card (src/info.js INFO) carries "טיוטה" (its source line) or status 'draft' (§2.2).
// 4. The bundle stays < 6 MiB (§3; 3 MiB from wave 6, 2026-09-27 — it was 2 MB; 3.25 for wave 14's jobs, 2026-10-01; 5 MiB at the owner's question, 2026-10-07; 6 MiB, 2026-10-20: "בוא נעלה את התקרה כרגע"), and its gzip size is reported.
// 5. The wave-6 content files (content/build_process, city, plaza, water, finds, kings, vessels): ids, sources, drafts, word limits.
// The patterns below are written with \u escapes on purpose: this file must not contain a Name either.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const ROOT = path.resolve(__dirname, '..');
const M = '[\\u0591-\\u05C7]*';                 // Hebrew points and cantillation between the letters
const L = '\\u05D0-\\u05EA\\u0591-\\u05C7';     // a Hebrew letter or mark (word boundary)
const ch = (...c) => c.map((x) => String.fromCharCode(x)).join(M);
const NAMES = {
  tetragrammaton: new RegExp(ch(0x05D9, 0x05D4, 0x05D5, 0x05D4)),
  'tetragrammaton (\\u escapes)': /\\u05[dD]9\\u05[dD]4\\u05[dD]5\\u05[dD]4/,
  elohim: new RegExp(`(?<![${L}])[\\u05D5\\u05D4\\u05DC\\u05D1\\u05DB\\u05DE\\u05E9]?${M}` + ch(0x05D0, 0x05DC) + `${M}\\u05D5?${M}` + ch(0x05D4, 0x05D9) + `${M}[\\u05DD\\u05E0\\u05DB\\u05D4\\u05DA\\u05D5]`),
  eloah: new RegExp(`(?<![${L}])` + ch(0x05D0, 0x05DC, 0x05D5, 0x05D4) + `(?![${L}])`),
  adonai: new RegExp(`(?<![${L}])` + ch(0x05D0, 0x05D3) + `${M}\\u05D5?${M}\\u05E0\\u05B8?\\u05D9(?![${L}])`),
  shaddai: new RegExp(`(?<![${L}])` + ch(0x05E9, 0x05D3, 0x05D9) + `(?![${L}])`),
  tzevaot: new RegExp(ch(0x05E6, 0x05D1, 0x05D0, 0x05D5, 0x05EA)),
  yah: new RegExp(`(?<![${L}])` + ch(0x05D9, 0x05D4) + `${M}(?![${L}])`),
  latin: /\b(yhwh|yhvh|jehovah|yahweh)\b/i,
};
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '\n      ' + info : ''}`); };
const ctx = (s, i) => s.slice(Math.max(0, i - 40), i + 40).replace(/\s+/g, ' ');

// 1. the bundle
const bundleFile = path.join(ROOT, 'dist/temple3d.html');
if (!fs.existsSync(bundleFile)) { console.error('dist/temple3d.html missing: run node build.mjs'); process.exit(2); }
const bundle = fs.readFileSync(bundleFile, 'utf8');
for (const [k, re] of Object.entries(NAMES)) {
  if (k === 'latin') continue;   // (the bundle's own runtime guard lists the Latin spellings)
  const m = bundle.match(re);
  check(`bundle: no Divine Name (${k})`, !m, m ? `at ${m.index}: …${ctx(bundle, m.index)}…` : '');
}

// 2. the repo
const files = [];
const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) { if (!/^(out|node_modules|legacy|dist)$/.test(f.name)) walk(p); } else if (/\.(m?js|cjs|json|md|html|css)$/.test(f.name)) files.push(p); } };
for (const d of ['src', 'content', 'docs', 'test']) if (fs.existsSync(path.join(ROOT, d))) walk(path.join(ROOT, d));
files.push(path.join(ROOT, 'PROJECT.md'));
const hits = [];
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  for (const [k, re] of Object.entries(NAMES)) {
    if (k === 'tetragrammaton (\\u escapes)' || k === 'latin') continue;
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    for (const m of s.matchAll(g)) hits.push(`${path.relative(ROOT, f)}:${s.slice(0, m.index).split('\n').length} [${k}] …${ctx(s, m.index)}…`);
  }
}
check('repo: no Divine Name written in full (src, content, docs, test, PROJECT.md)', hits.length === 0, hits.join('\n      '));

// 3. the tap-to-identify cards
const info = fs.readFileSync(path.join(ROOT, 'src/info.js'), 'utf8');
const INFO = {};
{
  // the file is an ES module: evaluate its object literal in a sandbox (no imports in it)
  const body = info.replace(/^export /gm, '');
  const fn = new Function(`${body}; return INFO;`);
  Object.assign(INFO, fn());
}
const noDraft = Object.entries(INFO).filter(([, v]) => !/טיוטה/.test(v.s || '') && v.status !== 'draft').map(([k, v]) => `${k} (${String(v.s || '').slice(0, 40)})`);
check(`info.js: every tap-to-identify card is tagged "טיוטה" (${Object.keys(INFO).length} cards)`, noDraft.length === 0, `${noDraft.length} without the tag: ${noDraft.join(', ')}`);

// 5. the wave-6 content files (CONTENT): every item has an id, a source and status 'draft'; texts within their word limits
{
  const W6 = ['build_process', 'city', 'plaza', 'water', 'finds', 'kings', 'vessels'];
  const LIM = { title_he: 5, text_he: 40, card_he: 20, line_he: 20 };
  const bad = [], ids = new Set(); let n = 0;
  for (const f of W6) {
    const p = path.join(ROOT, 'content', f + '.json');
    if (!fs.existsSync(p)) continue;
    for (const o of JSON.parse(fs.readFileSync(p, 'utf8'))) {
      n++;
      if (!o.id || ids.has(o.id)) bad.push(`${f}: id ${o.id} missing or repeated`); ids.add(o.id);
      if (!o.source) bad.push(`${f}:${o.id} no source`);
      if (o.status !== 'draft' && o.status !== 'approved') bad.push(`${f}:${o.id} status ${o.status}`);
      for (const [k, lim] of Object.entries(LIM)) if (o[k] && o[k].split(/\s+/).filter((w) => w && !/^[—–-]$/.test(w)).length > lim) bad.push(`${f}:${o.id} ${k} > ${lim} words`);
    }
  }
  check(`wave-6 content files: drafts with a source, within word limits (${n} items)`, bad.length === 0, bad.join('\n      '));
}

// 4. size
const bytes = fs.statSync(bundleFile).size, gz = zlib.gzipSync(fs.readFileSync(bundleFile)).length;
check('bundle < 6 MiB', bytes < 6 * 1024 * 1024, `${(bytes / 1048576).toFixed(2)} MiB (${bytes} bytes), gzip ${(gz / 1048576).toFixed(2)} MiB`);

const f = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - f}/${results.length} passed`);
process.exit(f ? 1 : 0);
