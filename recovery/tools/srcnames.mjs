// recovery R4 — the source's LOCAL names for a module's minified units (rename.mjs --src).
// Fresh side: each min unit's tokens are aligned with its twin in the names build (plib S.N: esbuild with names kept — the source's
// own local names, save a numeric suffix where one shadowed a top-level name), and every local BINDING (eslint-scope, per unit)
// takes the name its occurrences align with. 26c side: each unit is paired with the fresh unit of the same shape (patience diff of
// the module's unit shapes; leftover units in order), its tokens aligned with the fresh unit's, and each 26c binding takes the
// source name of the fresh binding its occurrences align with (majority; one 26c binding per fresh binding). A 26c binding with no
// counterpart (new code) gets none — the caller prints it as `_$` + its minified name.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { unitTokens, patience, ROOT } from './plib.mjs';
const require = createRequire('/home/claude/tools-npm/');
const escope = require('eslint-scope');

// pos of an identifier → binding id, for every binding declared inside the unit (not the unit's own top-level name)
export function unitBindings(u) {
  if (u._bind) return u._bind;
  const out = { at: new Map(), names: new Map() };
  const n = u.node;
  if (u.kind === 'wrap' || !n) return (u._bind = out);
  const stmt = /Declaration$|Statement$/.test(n.type) ? n
    : n.type === 'VariableDeclarator' ? { type: 'VariableDeclaration', kind: 'var', declarations: [n], start: n.start, end: n.end }
    : { type: 'ExpressionStatement', expression: n, start: n.start, end: n.end };
  // (eslint-scope reads node.range: acorn was run without ranges — set them on this unit's nodes)
  const ranged = (x) => { if (!x || typeof x !== 'object') return; if (Array.isArray(x)) { for (const y of x) ranged(y); return; } if (typeof x.type === 'string' && x.start != null && !x.range) x.range = [x.start, x.end]; for (const k in x) if (k !== 'range' && x[k] && typeof x[k] === 'object') ranged(x[k]); };
  ranged(stmt);
  let sm;
  try { sm = escope.analyze({ type: 'Program', sourceType: 'script', body: [stmt], start: n.start, end: n.end, range: [n.start, n.end] }, { ecmaVersion: 2022, sourceType: 'script' }); }
  catch (e) { return (u._bind = out); }
  let id = 0;
  for (const sc of sm.scopes) {
    if (sc.type === 'global') continue;
    for (const v of sc.variables) {
      if (!v.identifiers.length) continue;   // (arguments)
      const k = id++;
      out.names.set(k, v.name);
      for (const d of v.identifiers) out.at.set(d.start, k);
      for (const r of v.references) out.at.set(r.identifier.start, k);
    }
  }
  return (u._bind = out);
}
// aligned identifier positions of two units (patience diff of their canonical token shapes)
function alignIds(A, ua, B, ub) {
  const ta = unitTokens(A, ua), tb = unitTokens(B, ub), m = new Map();
  for (const [i, j] of patience(ta.map((t) => t.v), tb.map((t) => t.v))) if (ta[i].v === '\u0000id') m.set(ta[i].pos, tb[j].pos);
  return m;
}
const vote = (votes, k, v) => { let c = votes.get(k); if (!c) votes.set(k, (c = new Map())); c.set(v, (c.get(v) || 0) + 1); };
const best = (c) => { let b = null, n = -1; for (const [v, k] of c) if (k > n) { b = v; n = k; } return [b, n]; };

// fresh unit → Map binding id → source name
function freshNames(S, i, srcText) {
  const u = S.units[i], nu = S.N.units[i];
  if (u._src) return u._src;
  const B = unitBindings(u), al = alignIds(S, u, S.N, nu), votes = new Map();
  for (const [pos, k] of B.at) { const q = al.get(pos); if (q != null) vote(votes, k, S.N.js.slice(q, q + 64).match(/^[\w$]+/)[0]); }
  const out = new Map();
  for (const [k, c] of votes) {
    let [name] = best(c);
    const m = /^(.*?)(\d+)$/.exec(name);   // (esbuild's suffix on a local that shadowed a top-level name)
    if (m && srcText && !new RegExp(`(?<![\\w$])${name.replace(/\$/g, '\\$')}(?![\\w$])`).test(srcText) && new RegExp(`(?<![\\w$])${m[1].replace(/\$/g, '\\$')}(?![\\w$])`).test(srcText)) name = m[1];
    out.set(k, name);
  }
  return (u._src = out);
}

/** label → { fresh: Map(unit index → Map(pos → name)), ref: Map(unit index → Map(pos → name | null)) } */
export function sourceLocals(S, C, label, root = ROOT) {
  let srcText = '';
  try { srcText = fs.readFileSync(path.join(root, label), 'utf8'); } catch (e) { /* not a source file */ }
  const fi = S.mods.get(label) || [], ci = C.mods.get(label) || [];
  const fresh = new Map(), ref = new Map(), topVotes = new Map();
  for (const i of fi) {
    const B = unitBindings(S.units[i]), names = freshNames(S, i, srcText), m = new Map();
    for (const [pos, k] of B.at) m.set(pos, names.get(k) || null);
    fresh.set(i, m);
  }
  // pair the units: equal shapes first, then the rest of each gap in order
  const shp = (side, u) => unitTokens(side, u).map((t) => t.v).join('\u0001');
  const fs_ = fi.map((i) => shp(S, S.units[i])), rs = ci.map((i) => shp(C, C.units[i]));
  // (inside a gap: by content — the literals, property names and keys two units share — best first, not by order: a new function
  // inserted before an old one must not take its names)
  const lit = (side, u) => new Set(unitTokens(side, u).map((t) => t.v).filter((v) => /^["`.#]/.test(v) || (v.endsWith(':') && v.length > 2)));
  const pairs = [];
  let a = 0, b = 0;
  for (const [x, y] of [...patience(fs_, rs), [fi.length, ci.length]]) {
    if (x > a && y > b) {
      const cand = [];
      for (let p = a; p < x; p++) { const A = lit(S, S.units[fi[p]]); for (let q = b; q < y; q++) { const B = lit(C, C.units[ci[q]]); let n = 0; for (const v of A) if (B.has(v)) n++; const j = n / Math.max(1, A.size + B.size - n); if (j >= 0.25) cand.push([j, p, q]); } }
      cand.sort((u, v) => v[0] - u[0]);
      const ua = new Set(), ub = new Set();
      for (const [, p, q] of cand) { if (ua.has(p) || ub.has(q)) continue; ua.add(p); ub.add(q); pairs.push([p, q]); }
    }
    if (x < fi.length) pairs.push([x, y]);
    a = x + 1; b = y + 1;
  }
  for (const [x, y] of pairs) {
    const fu = S.units[fi[x]], cu = C.units[ci[y]];
    const FB = unitBindings(fu), CB = unitBindings(cu), fnames = freshNames(S, fi[x], srcText), al = alignIds(C, cu, S, fu), votes = new Map();
    for (const [pos, k] of CB.at) { const q = al.get(pos); if (q != null && FB.at.has(q)) vote(votes, k, FB.at.get(q)); }
    // top-level names too: a 26c name ↔ the fresh name at the same place (exact on the fresh side)
    for (const t of unitTokens(C, cu)) if (t.v === '\u0000id' && C.top.has(t.name) && !CB.at.has(t.pos)) { const q = al.get(t.pos); const ft = q != null && S.js.slice(q, q + 64).match(/^[\w$]+/); if (ft && S.top.has(ft[0])) vote(topVotes, t.name, ft[0]); }
    // one 26c binding per fresh binding: the strongest claim wins
    const claims = [...votes].map(([k, c]) => [k, ...best(c)]).sort((p, q) => q[2] - p[2]), taken = new Set(), name = new Map();
    for (const [k, fk] of claims) { if (taken.has(fk)) continue; taken.add(fk); name.set(k, fnames.get(fk) || null); }
    const m = new Map();
    for (const [pos, k] of CB.at) m.set(pos, name.get(k) || null);
    ref.set(ci[y], m);
  }
  for (const i of ci) if (!ref.has(i)) { const m = new Map(); for (const [pos] of unitBindings(C.units[i]).at) m.set(pos, null); ref.set(i, m); }
  const top = new Map();
  for (const [n, c] of topVotes) { const [f] = best(c); const d = S.top.get(f); if (d && d.src) top.set(n, d.src); }
  return { fresh, ref, top };
}
