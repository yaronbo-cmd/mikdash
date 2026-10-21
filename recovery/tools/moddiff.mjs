// recovery R1 — dump the normalized token streams of every changed module pair (15 → 26c) for moddiff.py, and the
// stable tokens of every new module.
// usage: node recovery/tools/moddiff.mjs   → recovery/work/modtokens.json
import fs from 'fs';
import { normTokens, sha } from './r1lib.mjs';
const W = '/home/claude/temple3d/recovery/work/';
const map = JSON.parse(fs.readFileSync(W + 'modmap.json', 'utf8'));
const js15 = fs.readFileSync(W + 'x15/app.stub.js', 'utf8'), js26 = fs.readFileSync(W + 'x26c/app.stub.js', 'utf8');
const U15 = JSON.parse(fs.readFileSync(W + 'u15.json', 'utf8')).units, U26 = JSON.parse(fs.readFileSync(W + 'u26c.json', 'utf8')).units;
// a module's units, each as its normalized tokens (wrapper heads dropped)
const unitsIn = (U, js, m) => U.filter((u) => u.start >= m.start && u.end <= m.end && u.kind !== 'wrap').map((u) => normTokens(js.slice(u.start, u.end)));
const out = [];
for (const r of map.rows) {
  if (r.status !== 'changed') continue;
  const a = map.mods15[r.k15], b = map.mods26[r.j26];
  out.push({ label: r.label, k15: r.k15, j26: r.j26, u15: unitsIn(U15, js15, a), u26: unitsIn(U26, js26, b) });
}
fs.writeFileSync(W + 'modtokens.json', JSON.stringify(out));
console.log('pairs', out.length);
