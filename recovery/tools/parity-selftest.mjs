// recovery R2 — parity.mjs checks itself: on a copy of the working tree, every module R1 found unchanged must PASS, and three
// deliberate mutations that R1's plain `_`-normalized metric cannot see must FAIL:
//   A  two locals swapped:          util.js  lerp = (a, b, t) => b + (a - b) * t            (same shapes; the bijection breaks)
//   B  a consistently wrong import: world.js every bare lerp( ↔ smooth( (both util.js's)    (a bijection holds; the origin check fails)
//   C  a parameter order swapped:   util.js  clamp = (a, x, b) => …                        (same shapes; the bijection breaks)
//   node recovery/tools/parity-selftest.mjs [--tmp DIR]      (≈ 30 s; exit 0 = all as expected)
import fs from 'fs';
import os from 'os';
import path from 'path';
import { ROOT, bothSides, compareModule } from './plib.mjs';

const ti = process.argv.indexOf('--tmp');
const base = fs.mkdtempSync(path.join(ti > 0 ? process.argv[ti + 1] : os.tmpdir(), 'parity-selftest-'));
const T = path.join(base, 'tree');
fs.mkdirSync(T);
for (const d of ['src', 'content', 'assets']) fs.cpSync(path.join(ROOT, d), path.join(T, d), { recursive: true });
for (const f of ['build.mjs', 'package.json']) fs.copyFileSync(path.join(ROOT, f), path.join(T, f));
fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(T, 'node_modules'));
const map = JSON.parse(fs.readFileSync(ROOT + '/recovery/work/modmap.json', 'utf8'));
const unchanged = map.rows.filter((r) => r.status === 'unchanged').map((r) => r.label);
const edit = (file, from, to) => { const p = path.join(T, file), s = fs.readFileSync(p, 'utf8'), t = typeof from === 'string' ? s.replace(from, to) : s.replace(from, to); if (t === s) throw new Error(`selftest: ${file} — the mutation did not apply`); fs.writeFileSync(p, t); };
const restore = (file) => fs.copyFileSync(path.join(ROOT, file), path.join(T, file));
let ok = true;
const check = (what, cond, detail) => { console.log(`${cond ? 'ok  ' : 'BAD '} ${what}${detail ? ' — ' + detail : ''}`); if (!cond) ok = false; };

// baseline: the unchanged modules
{
  const { S, C } = await bothSides(T);
  const bad = unchanged.map((l) => compareModule(S, C, l)).filter((r) => r.verdict !== 'PASS');
  check(`baseline: R1's ${unchanged.length} unchanged modules all PASS`, !bad.length, bad.slice(0, 5).map((r) => `${r.label} ${r.verdict}`).join(', '));
}
const runs = [
  ['A two locals swapped (util.js lerp)', 'src/util.js', 'export const lerp = (a, b, t) => a + (b - a) * t;', 'export const lerp = (a, b, t) => b + (a - b) * t;', 'src/util.js', 'names'],
  ['B a consistently wrong import (world.js lerp ↔ smooth)', 'src/world.js', null, null, 'src/world.js', 'names'],
  ['C a parameter order swapped (util.js clamp)', 'src/util.js', 'export const clamp = (x, a, b) =>', 'export const clamp = (a, x, b) =>', 'src/util.js', 'names'],
];
for (const [what, file, from, to, mod, why] of runs) {
  if (from) edit(file, from, to);
  else edit(file, /(?<![.\w])(lerp|smooth)\(/g, (m, n) => (n === 'lerp' ? 'smooth(' : 'lerp('));
  const { S, C } = await bothSides(T);
  const r = compareModule(S, C, mod);
  check(`${what}: ${mod} FAILs`, r.verdict === 'FAIL' && r.why === why, `${r.verdict}${r.why ? ' (' + r.why + ')' : ''}${r.diffs && r.diffs[0] && r.diffs[0].why ? ': ' + r.diffs[0].why : ''}`);
  restore(file);
}
fs.rmSync(base, { recursive: true, force: true });
console.log(ok ? 'selftest: all as expected' : 'selftest: FAILED');
process.exit(ok ? 0 : 1);
