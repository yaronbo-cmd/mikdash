// recovery R1 — cut a bundle into units (see r1lib.mjs), normalize and hash each, and segment it into MODULES.
// usage: node recovery/tools/units.mjs <bundle.js> <out.json> [--marked]
// The game's main.js does `await import('./avodah/index.js')` (and scenes/), so esbuild wraps almost every module in its
// lazy-ESM helper:  function f(){…} … var a,b,…,init_m = __esm(()=>{ init_dep(); …module body… });
// — the helper is `Tn` in build 15 and `jn` in 26c; it is found by its shape. A wrapper ends a module; the units since the
// previous wrapper (hoisted functions, bare var declarators) belong to it, and so do the wrapper's body statements, which
// are units of their own here (sub:true). CJS wrappers (__commonJS) likewise.
// Unwrapped modules (main.js and what it imports statically outside the lazy graph) are told apart only by markers.
// With --marked (a build-marked.mjs bundle), each module's label is its path, read from __R1M("path") inside it.
// out: { helpers:{esm,cjs}, units:[{i,start,end,kind,sub,seg,label,len,h,toks,st}], segs:[{seg,from,to,label,wrap,start,end,bytes}] }
import fs from 'fs';
import { parse, units, normTokens, stableTokens, sha } from './r1lib.mjs';
const [file, out, flag] = process.argv.slice(2);
const js = fs.readFileSync(file, 'utf8');
const t0 = Date.now();
const head = js.slice(0, 3000);
// minified: `var Tn=(e,t,n)=>()=>{if(n)throw n[0];…` · names kept: `var __esm=(fn2,res,err)=>function(){if(err)throw err[0];…`
const esm = /var ([\w$]+)=\([\w$]+,[\w$]+,([\w$]+)\)=>(?:\(\)=>|function\(\))\{if\(\2\)throw \2\[0\]/.exec(head)?.[1];
const cjs = /(?:var |,)([\w$]+)=\([\w$]+,([\w$]+)\)=>(?:\(\)=>|function\(\))\{try\{return \2\|\|/.exec(head)?.[1];
if (!esm) throw new Error('esm helper not found');
const marked = flag === '--marked';
const ast = parse(js);
const us = units(ast, js, [esm, cjs].filter(Boolean));
const MK = /^__R1([ME])\("([^"]+)"\);?$/;
const rows = [];
let top = null, wrapLabel = null, inWrap = false;
for (const u of us) {
  const mk = marked && MK.exec(u.text);
  if (mk && !u.sub) { if (mk[1] === 'M') { top = mk[2]; rows.push({ marker: 'M', label: top }); } else { top = null; rows.push({ marker: 'E', label: mk[2] }); } continue; }
  if (u.kind === 'wrap') {
    if (inWrap) rows.push({ marker: 'W' }); // two wrappers back to back (`var a=__esm(…),b=__esm(…)`): the first one ends here
    // the wrapper's own label: the __R1M inside its body (marked builds)
    const helper = u.node.init.callee.name;
    wrapLabel = marked ? ([...js.slice(u.start, u.end).matchAll(/__R1M\("([^"]+)"\)/g)].map((m) => m[1])[0] || null) : null;
    const a0 = u.node.init.arguments[0];
    if (!wrapLabel && a0.type === 'ObjectExpression' && a0.properties[0] && a0.properties[0].key.type === 'Literal') wrapLabel = a0.properties[0].key.value;
    rows.push({ start: u.start, end: u.start + u.text.length, kind: 'wrap', wrap: helper === esm ? 'esm' : 'cjs', label: wrapLabel, len: u.text.length, h: sha('wrap'), toks: 1, st: [], endOfWrap: u.end });
    inWrap = true;
    continue;
  }
  if (!u.sub && inWrap) { rows.push({ marker: 'W' }); inWrap = false; }
  if (mk && u.sub) continue; // the marker inside a wrapper body
  let text = u.text;
  if (marked) text = text.replace(/__R1[ME]\("[^"]+"\)[;,]?/g, '');
  const norm = normTokens(text);
  const nd = u.node, decl = nd.type === 'FunctionDeclaration' || nd.type === 'ClassDeclaration' ? nd.id && nd.id.name
    : nd.type === 'VariableDeclarator' ? (nd.id.type === 'Identifier' ? nd.id.name : null)
    : nd.type === 'AssignmentExpression' && nd.left.type === 'Identifier' ? nd.left.name : null;
  rows.push({ decl, start: u.start, end: u.end, kind: u.kind, sub: !!u.sub, label: u.sub ? wrapLabel : (marked && top) || null, len: u.end - u.start, h: sha(norm.join('\u0001'), 16), toks: norm.length, st: [...new Set(stableTokens(norm))].slice(0, 400) });
}
if (inWrap) rows.push({ marker: 'W' });
// segments: a wrapped module = [units since the previous segment … its wrapper … its body]; marker-delimited top-level modules
const segs = [];
let cur = [];
const close = (label, wrap) => { if (!cur.length) return; segs.push({ units: cur, label, wrap }); cur = []; };
let pendingWrap = null;
for (const r of rows) {
  if (r.marker === 'M') { close(null, 'none'); continue; }
  if (r.marker === 'E') { close(r.label, 'top'); continue; }
  if (r.marker === 'W') { close(pendingWrap.label, pendingWrap.wrap); pendingWrap = null; continue; }
  if (r.kind === 'wrap') pendingWrap = r;
  cur.push(r);
}
close(null, 'none');
const U = [];
segs.forEach((s, k) => {
  for (const r of s.units) { r.i = U.length; r.seg = k; if (!r.label) r.label = s.label; U.push(r); }
  Object.assign(s, { seg: k, from: s.units[0].i, to: s.units[s.units.length - 1].i, start: s.units[0].start, end: Math.max(...s.units.map((r) => r.endOfWrap || r.end)) });
  s.bytes = s.end - s.start; delete s.units;
});
fs.writeFileSync(out, JSON.stringify({ file, helpers: { esm, cjs }, units: U, segs }));
console.log(file, 'helpers', esm, cjs, 'units', U.length, 'segments', segs.length, 'labelled segs', segs.filter((s) => s.label).length, ((Date.now() - t0) / 1000).toFixed(1) + 's');
