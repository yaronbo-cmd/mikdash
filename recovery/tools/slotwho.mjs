// recovery R6 — slotwho: for the split names slotmap printed, the binding behind each occurrence — its declaration in context and the
// 26c name it got — so the scope that holds the invisible symbol can be seen (its nested slots all land one name later in 26c).
// usage: node recovery/tools/slotwho.mjs <module> <unit index> <fresh name…>
import { bothSides, unitTokens, findLabel } from './plib.mjs';
import { unitBindings } from './srcnames.mjs';
const [q, ku, ...want] = process.argv.slice(2);
const { S, C } = await bothSides();
const lab = findLabel([...C.mods.keys()], q);
if (!lab) { console.error('no such module in 26c:', q); process.exit(2); }
const fu = S.units[S.mods.get(lab)[+ku]], cu = C.units[C.mods.get(lab)[+ku]];
const ft = unitTokens(S, fu), ct = unitTokens(C, cu), FB = unitBindings(fu);
const nm = (side, t) => side.js.slice(t.pos, t.pos + 40).match(/^[\w$]+/)[0];
const first = new Map(), tgt = new Map();
for (let i = 0; i < ft.length; i++) {
  if (ft[i].v !== '\u0000id' || !FB.at.has(ft[i].pos)) continue;
  const b = FB.at.get(ft[i].pos); if (!first.has(b)) first.set(b, i);
  tgt.set(b, nm(C, ct[i]));
}
const byName = new Map();
for (const [b, i] of first) { const a = nm(S, ft[i]); if (!byName.has(a)) byName.set(a, []); byName.get(a).push([b, i]); }
for (const a of want) for (const [b, i] of byName.get(a) || []) console.log(a, '→', tgt.get(b).padEnd(3), '|', S.js.slice(Math.max(0, ft[i].pos - 70), ft[i].pos + 50).replace(/\s+/g, ' '));
