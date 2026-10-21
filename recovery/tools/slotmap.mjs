// recovery R6 — slotmap: esbuild names locals by SLOT (shared by sibling scopes, ranked by use), so an invisible symbol — a single-use
// const folded into the next statement, an unused function-expression name — shifts every nested slot after it. For each unit (or the
// one given) prints the fresh minified names whose bindings fall on more than one 26c name (marked <<<): the shifted slots.
// usage: node recovery/tools/slotmap.mjs <module> [unit index] [--all]   (--all: every name, not only the split ones)
import { bothSides, unitTokens, findLabel } from './plib.mjs';
import { unitBindings } from './srcnames.mjs';
const args = process.argv.slice(2), all = args.includes('--all'), pos = args.filter((a) => a !== '--all');
const { S, C } = await bothSides();
const lab = findLabel([...C.mods.keys()], pos[0]);
if (!lab) { console.error('no such module in 26c:', pos[0]); process.exit(2); }
const fi = S.mods.get(lab) || [], ci = C.mods.get(lab) || [];
const nm = (side, t) => side.js.slice(t.pos, t.pos + 40).match(/^[\w$]+/)[0];
const units = pos[1] != null ? [+pos[1]] : fi.map((_, k) => k);
for (const k of units) {
  if (k >= ci.length) continue;
  const fu = S.units[fi[k]], cu = C.units[ci[k]], ft = unitTokens(S, fu), ct = unitTokens(C, cu);
  if (ft.length !== ct.length) continue;
  const FB = unitBindings(fu), pair = new Map(), useF = new Map();
  for (let i = 0; i < ft.length; i++) {
    if (ft[i].v !== '\u0000id' || !FB.at.has(ft[i].pos)) continue;
    const a = nm(S, ft[i]), b = nm(C, ct[i]);
    useF.set(a, (useF.get(a) || 0) + 1);
    if (!pair.has(a)) pair.set(a, new Map()); pair.get(a).set(b, (pair.get(a).get(b) || 0) + 1);
  }
  const rows = [...pair].sort((x, y) => useF.get(y[0]) - useF.get(x[0])).filter(([, m]) => all || m.size > 1);
  if (!rows.length) continue;
  console.log(`## unit ${k}`);
  for (const [a, m] of rows) console.log(' ', a.padEnd(4), String(useF.get(a)).padStart(4), '→', [...m].map(([b, n]) => `${b}×${n}`).join(' '), m.size > 1 ? '  <<<' : '');
}
