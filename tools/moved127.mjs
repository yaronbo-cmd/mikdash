// build 127 (rule 65, ירון 13.11: "הכול יושב על העולם. לא ההפך בשום מקרה"): the list of every world-place hit that stages 01 and 05
// typed outside the book at build 126's final commit (fb94fd8), and the check that each one is still accounted for.
//   node tools/moved127.mjs > test/h127-before.json      record the hits of tools/nobook126.mjs over h109 and h120 (run at fb94fd8)
//   checkMoved(before)                                   → [{ file, line, text, how, why? }] for every recorded hit:
//     how 'stays'  — the same text is still in its own file (the file's count is on test/h126-nobook.test.mjs's allow list)
//     how 'book'   — the same literals, in the same order, stand inside an `── h127 ──` block of src/game/world/grid.js
//     how 'reuse'  — the place was already in the book: REUSE names the book's key for each of its numbers (null: a number that is
//                    no place, kept as it was in the code), and the book's number there is the very same
//     how 'LOST'   — none of these: the tuple vanished or a digit changed (test/h127-moved.test.mjs fails on it)
import { readFileSync } from 'node:fs';
import { scanDirs } from './nobook126.mjs';

const ROOT = new URL('../src/game/', import.meta.url);
const NUM = /(?<![\w.])-?\d+(?:\.\d+)?(?![\w.])/g;
const strip = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:\\])\/\/.*$/gm, (m, a) => a + ' '.repeat(m.length - a.length))
  .replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g, (m) => m.replace(/[^\n]/g, ' '));
/** the numeric literals of a hit's text, as written ('x: 277' → ['277'], '73, 220, 230' → ['73', '220', '230']) */
export const litsOf = (text) => text.replace(/^\s*\w+\s*:\s*/, '').match(NUM) || [];

/** the places already in the book (rule B 1): the stage's copy deleted, the book's read. [file, text, [book key per number | null]] */
export const REUSE = [
  // stage 01: the Mount's 500-amah square (mount.js SQUARE) — the book's stage 01 bounds, made from the grid's own EAST and NORTH
  ['h109/acts.js', 'x0: -223', ['s01.bounds.x0']], ['h109/acts.js', 'x1: 277', ['s01.bounds.x1']],
  ['h109/acts.js', 'z0: -183.5', ['s01.bounds.z0']], ['h109/acts.js', 'z1: 316.5', ['s01.bounds.z1']],
  // stage 01: the inscription's stand is the book's letters (x −281, z 383)
  ['h109/model.js', 'x: -281', ['letters.x']], ['h109/model.js', 'z: 383', ['letters.z']],
  ['h109/acts3.js', 'x: -281', ['letters.x']], ['h109/acts3.js', 'z: 383', ['letters.z']],
  // stage 05: the court's walls (Middot 2:5) the gallery hangs from: the book's court
  ['h120/load.js', '141, 0', ['s05.court.x1', null]],
  // stage 05: the crews' bays in view in the planks act are the book's beams SB0 (x 46 … 57) and SB2 (68 … 79)
  ['h120/acts5.js', '46, 57', ['s05.beams.0.3.0', 's05.beams.0.4.0']], ['h120/acts5.js', '68, 79', ['s05.beams.2.3.0', 's05.beams.2.4.0']],
  // stage 05: `clamp(z + 36, 0, 8)` in the chamber's floor is the line z −36 the strip falls south of: the book's floor.fallZ, its
  // sign turned (a key with a leading '-' names the book's number negated); 0 and 8 are the clamp's bounds in amot, no place
  ['h120/model.js', '36, 0, 8', ['-s05.floor.fallZ', null, null]],
];

export function recordBefore() { return scanDirs(ROOT, ['h109', 'h120']); }

/** the numeric literals of every `── h127 ──` … `── /h127 ──` block of grid.js, one token list per block */
export function bookBlocks(src = readFileSync(new URL('world/grid.js', ROOT), 'utf8')) {
  const s = strip(src), out = [];
  // (the markers are in comments, so they are found in the source and their offsets used on the stripped text)
  const re = /── h127 ──([\s\S]*?)── \/h127 ──/g;
  for (const m of src.matchAll(re)) out.push(s.slice(m.index, m.index + m[0].length).match(NUM) || []);
  return out;
}
const hasRun = (toks, lits) => { for (let i = 0; i + lits.length <= toks.length; i++) { let ok = true; for (let j = 0; j < lits.length; j++) if (toks[i + j] !== lits[j]) { ok = false; break; } if (ok) return true; } return false; };
const at = (o, path) => (path[0] === '-' ? -at(o, path.slice(1)) : path.split('.').reduce((v, k) => (v == null ? v : v[k]), o));

export function checkMoved(before, BOOK) {
  const now = scanDirs(ROOT, ['h109', 'h120']), left = new Map();
  for (const h of now) { const k = h.file + '|' + h.text; left.set(k, (left.get(k) || 0) + 1); }
  const blocks = bookBlocks(), out = [];
  for (const h of before) {
    const k = h.file + '|' + h.text, lits = litsOf(h.text);
    if (left.get(k) > 0) { left.set(k, left.get(k) - 1); out.push({ ...h, how: 'stays' }); continue; }
    if (blocks.some((b) => hasRun(b, lits))) { out.push({ ...h, how: 'book' }); continue; }
    const R = REUSE.find(([f, t]) => f === h.file && t === h.text);
    if (R && R[2].length === lits.length && R[2].every((p, i) => p == null || at(BOOK, p) === Number(lits[i]))) { out.push({ ...h, how: 'reuse', why: R[2].filter(Boolean).join(', ') }); continue; }
    out.push({ ...h, how: 'LOST' });
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv[2] === 'check') {
    const { BOOK } = await import('../src/game/world/grid.js');
    const before = JSON.parse(readFileSync(new URL('../test/h127-before.json', import.meta.url), 'utf8'));
    const r = checkMoved(before, BOOK), n = {};
    for (const h of r) { n[h.file + ' ' + h.how] = (n[h.file + ' ' + h.how] || 0) + 1; if (h.how === 'LOST') console.log('LOST', h.file + ':' + h.line, h.text); }
    for (const k of Object.keys(n).sort()) console.log(k, n[k]);
  } else process.stdout.write(JSON.stringify(recordBefore(), null, 1) + '\n');
}
