// recovery R6 — bindiff: for a module whose units have the same shapes on both sides but whose names differ, align each unit's tokens
// and resolve every identifier to its binding (eslint-scope); prints the bindings whose fresh ↔ 26c pairing is not one-to-one (a
// variable reused where the original had two, or two where it had one). Silent = the binding structure is identical (then see slotmap).
// usage: node recovery/tools/bindiff.mjs <module>
import { bothSides, unitTokens, findLabel } from './plib.mjs';
import { unitBindings } from './srcnames.mjs';
const { S, C } = await bothSides();
const lab = findLabel([...C.mods.keys()], process.argv[2]);
if (!lab) { console.error('no such module in 26c:', process.argv[2]); process.exit(2); }
const fi = S.mods.get(lab) || [], ci = C.mods.get(lab) || [];
const ctx = (side, t, i) => side.js.slice(Math.max(0, t[i].pos - 60), t[i].pos + 40).replace(/\s+/g, ' ');
let found = 0;
for (let k = 0; k < Math.min(fi.length, ci.length); k++) {
  const fu = S.units[fi[k]], cu = C.units[ci[k]], ft = unitTokens(S, fu), ct = unitTokens(C, cu);
  if (ft.length !== ct.length) { console.log(`unit ${k}: shapes differ (${ft.length} vs ${ct.length} tokens) — use parity.mjs --hunks first`); continue; }
  const FB = unitBindings(fu), CB = unitBindings(cu), f2c = new Map(), c2f = new Map();
  const add = (m, x, y, i) => { let s = m.get(x); if (!s) m.set(x, (s = new Map())); if (!s.has(y)) s.set(y, i); };
  for (let i = 0; i < ft.length; i++) {
    if (ft[i].v !== '\u0000id') continue;
    const a = FB.at.get(ft[i].pos), b = CB.at.get(ct[i].pos);
    if (a == null && b == null) continue;
    add(f2c, a, b, i); add(c2f, b, a, i);
  }
  for (const [a, s] of f2c) if (s.size > 1) { found++; console.log(`unit ${k}: fresh binding ${FB.names.get(a)} ↔ 26c ${[...s.keys()].map((b) => CB.names.get(b)).join(', ')}`); for (const [, i] of s) console.log('   fresh:', ctx(S, ft, i), '\n   26c  :', ctx(C, ct, i)); }
  for (const [b, s] of c2f) if (s.size > 1) { found++; console.log(`unit ${k}: 26c binding ${CB.names.get(b)} ↔ fresh ${[...s.keys()].map((a) => FB.names.get(a)).join(', ')}`); for (const [, i] of s) console.log('   fresh:', ctx(S, ft, i), '\n   26c  :', ctx(C, ct, i)); }
}
console.log(found ? `${found} binding(s) not one-to-one in ${lab}` : `${lab}: every binding pairs one-to-one`);
