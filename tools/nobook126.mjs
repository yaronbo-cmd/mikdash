// build 126 (rule 65: "הכול יושב על העולם. לא ההפך בשום מקרה"): a source scan for world places typed in a stage's own code. A world
// place is two or three numeric literals in a row (an [x, z] / [x, y, z] / (x, z) argument list) with one of them 30 or more from the
// origin, or an { x: …, z: … } with such a literal — the stages' sites all lie 30 and more from the Mount's centre on some axis, while
// the sizes, offsets and tolerances the stages may keep are small. Comments and strings are skipped. test/h126-nobook.test.mjs runs it
// over h109, h111, h112, h113 and h120 against a short, explained allow list.
import { readFileSync, readdirSync } from 'node:fs';
const strip = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:\\])\/\/.*$/gm, (m, a) => a + ' '.repeat(m.length - a.length))
  .replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g, (m) => m.replace(/[^\n]/g, ' '));
const NUM = '-?\\d+(?:\\.\\d+)?';
const RUN = new RegExp(`(?<![\\w.])(${NUM})\\s*,\\s*(${NUM})(?:\\s*,\\s*(${NUM}))?(?![\\w.])`, 'g');
const XZ = new RegExp(`\\b(?:x|z|x0|x1|z0|z1|cx|cz)\\s*:\\s*(${NUM})(?![\\w.])`, 'g');
export function scanSource(src, file = '') {
  const s = strip(src), out = [], lineOf = (i) => s.slice(0, i).split('\n').length;
  for (const m of s.matchAll(RUN)) {
    const v = [m[1], m[2], m[3]].filter((x) => x != null).map(Number);
    if (v.some((x) => Math.abs(x) >= 30)) out.push({ file, line: lineOf(m.index), text: m[0].replace(/\s+/g, ' ') });
  }
  for (const m of s.matchAll(XZ)) if (Math.abs(+m[1]) >= 30) out.push({ file, line: lineOf(m.index), text: m[0].replace(/\s+/g, ' ') });
  return out;
}
export function scanDirs(root, dirs) {
  const out = [];
  for (const d of dirs) for (const f of readdirSync(new URL(d + '/', root)).filter((f) => f.endsWith('.js')).sort()) out.push(...scanSource(readFileSync(new URL(`${d}/${f}`, root), 'utf8'), `${d}/${f}`));
  return out;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const hits = scanDirs(new URL('../src/game/', import.meta.url), process.argv.slice(2).length ? process.argv.slice(2) : ['h109', 'h111', 'h112', 'h113', 'h120']);
  for (const h of hits) console.log(`${h.file}:${h.line}  ${h.text}`);
  console.error(hits.length + ' hits');
}
