// recovery R2 — the shared library of parity.mjs and rename.mjs.
//
// The fresh side: the working tree is bundled twice with build.mjs's settings —
//   min    exactly what build.mjs ships (minify: true)
//   names  the same syntax minification with whitespace and names kept (minifyIdentifiers/minifyWhitespace off): esbuild
//          writes a `// path` comment before each module's code, and its units are the min build's units one for one
//          (same count, same kinds, same order; checked on every run), so unit i of min gets unit i's module and source name.
// The 26c side: recovery/work/x26c/app.stub.js (R1's extract.mjs). A lazy-ESM wrapper closes exactly one module, so the
//   wrapped part cuts itself into modules (labels from R1's modmap.json, by segment start); the unwrapped tail (main.js
//   and its static imports) is labelled by aligning its unit hashes with the fresh tail (patience diff) — the fresh tail's
//   labels follow esbuild's own comments, so a module's `init_x()` calls belong to it (R1's marked build had filed them
//   under the previous module).
// Comparison of one module: its units in order on both sides; tokens canonicalized with the AST — property names, keys,
//   strings, numbers, regexes, punctuation and unbound globals literal; every bound name (local or top-level) checked as
//   one consistent BIJECTION over the whole module (fresh name ↔ 26c name), so two swapped variables fail; and a
//   top-level name declared in another module must come from the same module (and, where both are known, the same
//   source name) on both sides.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { acorn, walk, units as cutUnits, normTokens } from './r1lib.mjs';

export const ROOT = '/home/claude/temple3d';
export const W = ROOT + '/recovery/work/';
export const REF26 = ROOT + '/recovery/build26c.min.html';
export const sha = (s, n = 16) => crypto.createHash('sha256').update(s).digest('hex').slice(0, n);

// ── build.mjs's settings (copied verbatim from build.mjs, like build-marked.mjs; BUILD_SHA guards the copy) ──
const STRIP = new Set(['note', 'do_not_show_he']);
const KEEP_VIEWS = new Set(['avodah_gaps.json']);
const contentStrip = {
  name: 'content-strip',
  setup(b) {
    b.onLoad({ filter: /[\\/]content[\\/][a-z_]+\.json$/, namespace: 'file' }, async (args) => {
      const base = args.path.split(/[\\/]/).pop();
      const facts = base === 'facts.json';
      const drop = (o) => (Array.isArray(o) ? o.map(drop) : o && typeof o === 'object'
        ? Object.fromEntries(Object.entries(o).filter(([k]) => !STRIP.has(k) && !(k === 'views' && !KEEP_VIEWS.has(base)) && !(facts && (k === 'quote' || k === 'quote_nikud'))).map(([k, v]) => [k, drop(v)]))
        : o);
      return { contents: JSON.stringify(drop(JSON.parse(await fs.promises.readFile(args.path, 'utf8')))), loader: 'json' };
    });
  },
};
const OPTIONAL_PART = /^\.\/(match3\/index|kings\/index|game\/minigames\/index)\.js$|^\.\.\/content\/facts\.json$/;
const optionalParts = {
  name: 'optional-parts',
  setup(b) {
    b.onResolve({ filter: OPTIONAL_PART }, (args) => {
      if (fs.existsSync(`${args.resolveDir}/${args.path}`)) return null;
      console.log(`build: optional part absent, stubbed: ${args.path}`);
      return { path: args.path, namespace: 'optional-part' };
    });
    b.onLoad({ filter: /.*/, namespace: 'optional-part' }, (args) => (/\.json$/.test(args.path) ? { contents: '[]', loader: 'json' } : { contents: 'export {};', loader: 'js' }));
  },
};
// the build.mjs these settings were copied from (warn when it changes: re-copy, or the parity build is not the real one)
const BUILD_SHA = '793c85e18377f550';
export function checkBuildMjs(root = ROOT) {
  const s = fs.readFileSync(path.join(root, 'build.mjs'), 'utf8');
  const h = sha(s);
  const opts = "entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', target: 'es2020',";
  if (!s.includes(opts) || !s.includes("legalComments: 'none', logLevel: 'warning', charset: 'utf8', loader: { '.glb': 'dataurl' }")) throw new Error('build.mjs: the esbuild options changed — update recovery/tools/plib.mjs');
  return h === BUILD_SHA ? null : `note: build.mjs sha ${h} ≠ ${BUILD_SHA} (the copy in plib.mjs may need a re-check)`;
}

export async function buildFresh(root = ROOT, { names = true } = {}) {
  const require = createRequire(root + '/');
  const { build } = require('esbuild');
  const common = {
    absWorkingDir: root, entryPoints: ['src/main.js'], bundle: true, format: 'iife', target: 'es2020',
    outfile: path.join(root, 'dist/app.js'), legalComments: 'none', logLevel: 'warning', charset: 'utf8', loader: { '.glb': 'dataurl' },
    plugins: [contentStrip, optionalParts], write: false,
  };
  const min = (await build({ ...common, minify: true })).outputFiles[0].text;
  const nm = names ? (await build({ ...common, minifySyntax: true, minifyIdentifiers: false, minifyWhitespace: false })).outputFiles[0].text : null;
  return { min, names: nm, esbuild: require('esbuild/package.json').version };
}

// build.mjs's dist/play.html around a bundle, then the owner's out/index.html dressing taken from the 26c page (its head
// script and its title), as R1's mkout15.py does — so a byte compare with build26c.min.html sees only the game
export function playPage(root, js, ref) {
  const b = fs.readFileSync(path.join(root, 'build.mjs'), 'utf8');
  const pre = /fs\.writeFileSync\('dist\/play\.html', "(.*?)" \+ html \+ '(.*?)'\);/.exec(b);
  if (!pre) throw new Error('build.mjs: the play.html line changed — update playPage()');
  const app = js.replace(/<\/script/gi, '<\\/script');
  const html = fs.readFileSync(path.join(root, 'src/page.html'), 'utf8').replace('/*__APP__*/', () => app);
  let s = pre[1] + html + pre[2];
  const force = /<head>(<script>globalThis\.__FORCE_SHIFT.*?<\/script>)/.exec(ref)[1];
  const title = /<title>.*?<\/title>/.exec(ref)[0];
  s = s.replace('<head>', () => '<head>' + force);
  s = s.replace(/<title>.*?<\/title>/, () => title);
  return s;
}

// the kohen GLB's data: URL → "__R1_ASSET_<sha12>__" (as extract.mjs writes app.stub.js), so positions and tokens match 26c's stub
export function stubAssets(js) {
  return js.replace(/"data:([^;,"]+)?(;base64)?,([A-Za-z0-9+/=]{20000,})"/g, (all, mime, b64, body) => {
    const bytes = b64 ? Buffer.from(body, 'base64') : Buffer.from(body);
    return JSON.stringify(`__R1_ASSET_${crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 12)}__`);
  });
}

export function helpersOf(js) {
  const head = js.slice(0, 3000);
  const esm = /var ([\w$]+)=\([\w$]+,[\w$]+,([\w$]+)\)=>(?:\(\)=>|function\(\))\{if\(\2\)throw \2\[0\]/.exec(head)?.[1];
  const cjs = /(?:var |,)([\w$]+)=\([\w$]+,([\w$]+)\)=>(?:\(\)=>|function\(\))\{try\{return \2\|\|/.exec(head)?.[1];
  if (!esm) throw new Error('esm helper not found');
  return [esm, cjs].filter(Boolean);
}

// ── one side's analysis: AST, units, bound names, top-level declarations ──
function boundNames(ast) {
  const B = new Set();
  const pat = (p) => {
    if (!p) return;
    switch (p.type) {
      case 'Identifier': B.add(p.name); break;
      case 'ObjectPattern': for (const q of p.properties) pat(q.type === 'RestElement' ? q.argument : q.value); break;
      case 'ArrayPattern': for (const q of p.elements) pat(q); break;
      case 'AssignmentPattern': pat(p.left); break;
      case 'RestElement': pat(p.argument); break;
    }
  };
  const fn = (n) => { if (n.id) pat(n.id); for (const p of n.params) pat(p); };
  walk.full(ast, (n) => {
    switch (n.type) {
      case 'VariableDeclarator': pat(n.id); break;
      case 'FunctionDeclaration': case 'FunctionExpression': case 'ArrowFunctionExpression': fn(n); break;
      case 'ClassDeclaration': case 'ClassExpression': if (n.id) pat(n.id); break;
      case 'CatchClause': pat(n.param); break;
      case 'LabeledStatement': B.add(n.label.name); break;
    }
  });
  return B;
}
function declOf(nd) {
  return nd.type === 'FunctionDeclaration' || nd.type === 'ClassDeclaration' ? nd.id && nd.id.name
    : nd.type === 'VariableDeclarator' ? (nd.id.type === 'Identifier' ? nd.id.name : null)
    : nd.type === 'AssignmentExpression' && nd.left.type === 'Identifier' ? nd.left.name : null;
}
export function analyze(js, helpers, { comments = false } = {}) {
  const cm = [];
  const ast = acorn.parse(js, { ecmaVersion: 'latest', onComment: comments ? (block, text, start) => { if (!block && /^ (src|content|node_modules|assets)\/\S+$/.test(text)) cm.push([start, text.trim()]); } : undefined });
  const us = cutUnits(ast, js, helpers);
  for (const u of us) u.decl = u.kind === 'wrap' ? declOf(u.node) : declOf(u.node);
  return { js, ast, units: us, helpers, comments: cm, _bound: null, get bound() { return this._bound || (this._bound = boundNames(this.ast)); } };
}
// labels from the names build's top-level `// path` comments; a wrapper body's units take their wrapper's label
function commentLabels(side) {
  const body = side.ast.body[0].expression.callee.body.body;
  const inside = (p) => { let lo = 0, hi = body.length - 1; while (lo <= hi) { const m = (lo + hi) >> 1; if (body[m].end <= p) lo = m + 1; else if (body[m].start > p) hi = m - 1; else return true; } return false; };
  const top = side.comments.filter(([p]) => !inside(p));
  let ci = -1, wrapLab = null;
  return side.units.map((u) => {
    if (u.sub) return wrapLab;
    while (ci + 1 < top.length && top[ci + 1][0] < u.start) ci++;
    const l = ci >= 0 ? top[ci][1] : '(runtime)';
    if (u.kind === 'wrap') wrapLab = l;
    return l;
  });
}
// wrapped segments by R1's rule: a wrapper closes a module; the units since the previous segment belong to it
export function segments(us) {
  const segs = []; let cur = [], inWrap = false;
  us.forEach((u, i) => {
    if (u.kind === 'wrap') { if (inWrap) { segs.push({ wrap: true, idx: cur }); cur = []; } inWrap = true; cur.push(i); return; }
    if (!u.sub && inWrap) { segs.push({ wrap: true, idx: cur }); cur = []; inWrap = false; }
    cur.push(i);
  });
  if (cur.length) segs.push({ wrap: inWrap, idx: cur });
  return segs;
}
export const hashOf = (u) => u._h || (u._h = sha(normTokens(u.text).join('\u0001')));

export async function freshSide(root = ROOT) {
  const t0 = Date.now();
  const b = await buildFresh(root);
  const min = stubAssets(b.min), nm = stubAssets(b.names);
  const t1 = Date.now();
  const S = analyze(min, helpersOf(b.min));
  const N = analyze(nm, ['__esm', '__commonJS'], { comments: true });
  if (S.units.length !== N.units.length || S.units.some((u, i) => u.kind !== N.units[i].kind || !!u.sub !== !!N.units[i].sub))
    throw new Error(`the names build's units do not line up with the min build's (${S.units.length} vs ${N.units.length})`);
  const lab = commentLabels(N);
  S.units.forEach((u, i) => { u.label = lab[i]; u.srcDecl = N.units[i].decl; });
  S.top = new Map();   // minified top-level name → { module, src }
  for (const u of S.units) if (u.decl && !S.top.has(u.decl)) S.top.set(u.decl, { module: u.label, src: u.srcDecl });
  S.rawMin = b.min; S.esbuild = b.esbuild; S.ms = { build: t1 - t0, analyze: Date.now() - t1 };
  return S;
}

// ── 26c ──
const ALIAS_FILE = ROOT + '/recovery/tools/names26c.json';   // optional: R1 label → the file name the recovery chose
export function refSide() {
  const t0 = Date.now();
  const stubFile = W + 'x26c/app.stub.js';
  if (!fs.existsSync(stubFile)) throw new Error('recovery/work/x26c/app.stub.js missing — run bash recovery/tools/r1-all.sh');
  const js = fs.readFileSync(stubFile, 'utf8');
  const raw = fs.readFileSync(W + 'x26c/app.min.js', 'utf8');
  const C = analyze(js, helpersOf(raw));
  const map = JSON.parse(fs.readFileSync(W + 'modmap.json', 'utf8'));
  const alias = fs.existsSync(ALIAS_FILE) ? JSON.parse(fs.readFileSync(ALIAS_FILE, 'utf8')) : {};
  const byStart = new Map(map.mods26.filter((m) => m.wrap === 'esm' || m.wrap === 'cjs').map((m) => [m.start, m]));
  const fix = (l) => (l == null ? null : alias[l] || l.replace(/ \?$/, ''));
  C.segs = segments(C.units);
  for (const s of C.segs) {
    if (!s.wrap) { s.tail = true; continue; }
    const m = byStart.get(C.units[s.idx[0]].start);
    if (!m) throw new Error('26c: a wrapped segment that modmap.json does not know at ' + C.units[s.idx[0]].start);
    s.label = fix(m.label) || `(26c#${m.j} new)`;
    s.status = m.status;
    for (const i of s.idx) C.units[i].label = s.label;
  }
  C.symmap = JSON.parse(fs.readFileSync(W + 'symmap26c.json', 'utf8'));
  C.ms = { analyze: Date.now() - t0 };
  return C;
}

// label 26c's runtime head and its tail from the fresh side (call after both sides exist)
export function labelRef(C, S) {
  // the runtime helpers: the fresh build's leading '(runtime)' units, matched one for one at the head of 26c
  const nRun = S.units.findIndex((u) => u.label !== '(runtime)');
  for (let i = 0; i < nRun; i++) if (hashOf(C.units[i]) === hashOf(S.units[i])) C.units[i].label = '(runtime)';
  // the tail
  const tailSet = new Set(C.segs.filter((s) => s.tail).flatMap((s) => s.idx));
  const tailF = S.units.filter((u) => !u.sub && u.label && isTail(S, u)), tailC = C.units.filter((u, i) => tailSet.has(i));
  const pairs = patience(tailF.map(hashOf), tailC.map(hashOf));
  const lab = new Array(tailC.length).fill(null);
  for (const [a, b] of pairs) lab[b] = tailF[a].label;
  // the unmatched 26c units between two matches: the label of both neighbours when they agree; else the one label of the
  // fresh units in the same gap (a unit changed at a module's end: its old version is there); else left unassigned
  C.ambiguous = [];
  let pa = -1, pb = -1;
  for (const [a, b] of [...pairs, [tailF.length, tailC.length]]) {
    if (b > pb + 1) {
      const lp = pb >= 0 ? lab[pb] : null, ln = b < tailC.length ? lab[b] : null;
      const inGap = [...new Set(tailF.slice(pa + 1, a).map((u) => u.label))];
      const l = lp && lp === ln ? lp : inGap.length === 1 && (inGap[0] === lp || inGap[0] === ln) ? inGap[0] : null;
      for (let q = pb + 1; q < b; q++) {
        if (l) lab[q] = l;
        else { tailC[q].label = null; tailC[q].between = [lp, ln]; C.ambiguous.push(tailC[q]); }
      }
    }
    pa = a; pb = b;
  }
  tailC.forEach((u, k) => { if (lab[k]) u.label = lab[k]; });
  C.top = new Map();
  for (const u of C.units) if (u.decl && !C.top.has(u.decl)) C.top.set(u.decl, { module: u.label, src: C.symmap[u.decl] ? C.symmap[u.decl].name : null });
}
function isTail(S, u) {
  if (!S._tailFrom) { const segs = segments(S.units); const t = segs[segs.length - 1]; S._tailFrom = t.wrap ? Infinity : S.units[t.idx[0]].start; }
  return u.start >= S._tailFrom;
}

// patience diff of two hash sequences → matched index pairs [i, j] (increasing)
export function patience(a, b) {
  const out = [];
  const rec = (a0, a1, b0, b1) => {
    while (a0 < a1 && b0 < b1 && a[a0] === b[b0]) out.push([a0++, b0++]);
    const tail = [];
    while (a1 > a0 && b1 > b0 && a[a1 - 1] === b[b1 - 1]) tail.push([--a1, --b1]);
    if (a0 < a1 && b0 < b1) {
      const ca = new Map(), cb = new Map();
      for (let i = a0; i < a1; i++) { const e = ca.get(a[i]); ca.set(a[i], e ? -1 : i + 1); }
      for (let j = b0; j < b1; j++) { const e = cb.get(b[j]); cb.set(b[j], e ? -1 : j + 1); }
      const cand = [];
      for (let i = a0; i < a1; i++) { const x = ca.get(a[i]), y = cb.get(a[i]); if (x > 0 && y > 0) cand.push([i, y - 1]); }
      // longest increasing subsequence on j
      const tails = [], prev = new Array(cand.length);
      for (let k = 0; k < cand.length; k++) {
        let lo = 0, hi = tails.length;
        while (lo < hi) { const m = (lo + hi) >> 1; if (cand[tails[m]][1] < cand[k][1]) lo = m + 1; else hi = m; }
        prev[k] = lo > 0 ? tails[lo - 1] : -1; tails[lo] = k;
      }
      const lis = []; for (let k = tails.length ? tails[tails.length - 1] : -1; k >= 0; k = prev[k]) lis.push(cand[k]);
      lis.reverse();
      if (lis.length) {
        let pa = a0, pb = b0;
        for (const [i, j] of lis) { rec(pa, i, pb, j); out.push([i, j]); pa = i + 1; pb = j + 1; }
        rec(pa, a1, pb, b1);
      } else if ((a1 - a0) * (b1 - b0) <= 4e6) {
        // no unique anchors: a plain LCS
        const n = a1 - a0, m = b1 - b0, L = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
        for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[a0 + i] === b[b0 + j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
        let i = 0, j = 0;
        while (i < n && j < m) { if (a[a0 + i] === b[b0 + j]) { out.push([a0 + i, b0 + j]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
      }
    }
    for (let k = tail.length - 1; k >= 0; k--) out.push(tail[k]);
  };
  rec(0, a.length, 0, b.length);
  return out;
}

// ── modules of a side ──
export function modulesOf(side) {
  const M = new Map();
  side.units.forEach((u, i) => { if (!u.label) return; if (!M.has(u.label)) M.set(u.label, []); M.get(u.label).push(i); });
  return M;
}
export function findLabel(labels, q) {
  if (labels.includes(q)) return q;
  const r = path.relative(ROOT, path.resolve(ROOT, q)).split(path.sep).join('/');
  if (labels.includes(r)) return r;
  const hits = labels.filter((l) => l.endsWith('/' + q) || l === q);
  if (hits.length === 1) return hits[0];
  if (hits.length > 1) throw new Error(`"${q}" is ambiguous: ${hits.join(', ')}`);
  return null;
}

// ── canonical tokens of one unit ──
// token: { v: string (the canonical form; '\u0000id' for a bound name), name?: string, pos, end }
export function unitTokens(side, u) {
  if (u._tok) return u._tok;
  const kinds = new Map();   // position → 'ref' | 'key' | 'short'
  if (u.kind === 'wrap') {
    const d = u.node, call = d.init || d.right;
    kinds.set(d.id ? d.id.start : d.left.start, 'ref'); kinds.set(call.callee.start, 'ref');
    const fn = call.arguments[0];   // a CJS wrapper's (exports, module) parameters
    if (fn && fn.params) for (const p of fn.params) walk.full(p, (n) => { if (n.type === 'Identifier') kinds.set(n.start, 'ref'); });
  } else {
    walk.full(u.node, (n) => {
      if (n.type === 'Identifier') { if (!kinds.has(n.start)) kinds.set(n.start, 'ref'); }
      else if ((n.type === 'Property' || n.type === 'MethodDefinition' || n.type === 'PropertyDefinition') && !n.computed && n.key && n.key.type === 'Identifier') kinds.set(n.key.start, n.shorthand ? 'short' : 'key');
      else if ((n.type === 'LabeledStatement' || n.type === 'BreakStatement' || n.type === 'ContinueStatement') && n.label) kinds.set(n.label.start, 'ref');
    });
    // a shorthand's value is visited as a ref at the same position: the key wins
    walk.full(u.node, (n) => { if (n.type === 'Property' && n.shorthand && !n.computed && n.key.type === 'Identifier') kinds.set(n.key.start, 'short'); });
  }
  const B = side.bound, out = [];
  let prev = null, colon = false;
  const text = u.text, off = u.start;
  for (const t of acorn.tokenizer(text, { ecmaVersion: 'latest' })) {
    const ty = t.type.label, pos = t.start + off, end = t.end + off;
    if (colon) { colon = false; if (ty === ':') { prev = ty; continue; } }   // `k: v` → `k:` v, the same as the shorthand `k` → `k:` k
    if (ty === 'name') {
      if (prev && (prev === '.' || prev === '?.')) out.push({ v: '.' + t.value, pos, end });
      else {
        const k = kinds.get(pos);
        if (k === 'short') { out.push({ v: t.value + ':', pos, end }); out.push(B.has(t.value) ? { v: '\u0000id', name: t.value, pos, end } : { v: '$' + t.value, pos, end }); }
        else if (k === 'key') { out.push({ v: t.value + ':', pos, end }); colon = true; }
        else if (k === 'ref') out.push(B.has(t.value) ? { v: '\u0000id', name: t.value, pos, end } : { v: '$' + t.value, pos, end });
        else out.push({ v: '~' + t.value, pos, end });   // a contextual keyword (get, set, of, async, static …)
      }
    } else if (ty === 'string') out.push({ v: JSON.stringify(t.value), pos, end });
    else if (ty === 'num') out.push({ v: '#' + String(t.value), pos, end });
    else if (ty === 'template') out.push({ v: '`' + t.value, pos, end });
    else if (ty === 'regexp') out.push({ v: '/' + t.value.pattern + '/' + t.value.flags, pos, end });
    else if (ty === 'privateId') out.push({ v: '#' + t.value, pos, end });
    else out.push({ v: t.type.keyword || ty, pos, end });
    prev = ty;
  }
  return (u._tok = out);
}
const shape = (toks) => toks.map((t) => t.v).join('\u0001');

// ── compare one module ──
export function compareModule(S, C, label, { windows = 3, ctx = 10 } = {}) {
  const fi = S.mods.get(label) || [], ci = C.mods.get(label) || [];
  const res = { label, fresh: fi.length, ref: ci.length };
  if (!fi.length && !ci.length) return { ...res, verdict: 'ABSENT' };
  if (!fi.length) return { ...res, verdict: 'MISSING-IN-FRESH' };
  if (!ci.length) return { ...res, verdict: 'MISSING-IN-26c' };
  const F = fi.map((i) => S.units[i]), R = ci.map((i) => C.units[i]);
  const fs_ = F.map((u) => shape(unitTokens(S, u))), rs = R.map((u) => shape(unitTokens(C, u)));
  const diffs = [];
  let ntok = 0;
  if (fs_.length !== rs.length || fs_.some((s, k) => s !== rs[k])) {
    // structure differs: align units (patience on the shapes) and report the first windows
    const pairs = patience(fs_, rs);
    let a = 0, b = 0;
    const gaps = [];
    for (const [i, j] of [...pairs, [F.length, R.length]]) {
      if (i > a || j > b) gaps.push({ fa: a, fb: i, ra: b, rb: j });
      a = i + 1; b = j + 1;
    }
    res.unitsOnlyFresh = gaps.reduce((s, g) => s + Math.max(0, g.fb - g.fa - Math.min(g.fb - g.fa, g.rb - g.ra)), 0);
    res.unitsOnlyRef = gaps.reduce((s, g) => s + Math.max(0, g.rb - g.ra - Math.min(g.fb - g.fa, g.rb - g.ra)), 0);
    res.unitsChanged = gaps.reduce((s, g) => s + Math.min(g.fb - g.fa, g.rb - g.ra), 0);
    for (const g of gaps) {
      if (diffs.length >= windows) break;
      const n = Math.max(g.fb - g.fa, g.rb - g.ra);
      for (let k = 0; k < n && diffs.length < windows; k++) {
        const fu = g.fa + k < g.fb ? F[g.fa + k] : null, ru = g.ra + k < g.rb ? R[g.ra + k] : null;
        diffs.push(tokenWindow(S, C, fu, ru, ctx, g.fa + k, g.ra + k));
      }
    }
    return { ...res, verdict: 'FAIL', why: 'structure', diffs };
  }
  // same structure: the bijection, and the origin of every top-level name declared elsewhere
  const f2r = new Map(), r2f = new Map();
  const ownF = new Set(F.map((u) => u.decl).filter(Boolean)), ownR = new Set(R.map((u) => u.decl).filter(Boolean));
  for (let k = 0; k < F.length; k++) {
    const ta = unitTokens(S, F[k]), tb = unitTokens(C, R[k]);
    ntok += ta.length;
    for (let q = 0; q < ta.length; q++) {
      if (ta[q].v !== '\u0000id') continue;
      const x = ta[q].name, y = tb[q].name;
      const fx = f2r.get(x), ry = r2f.get(y);
      let why = null;
      if (fx === undefined && ry === undefined) {
        f2r.set(x, y); r2f.set(y, x);
        const tx = S.top.get(x), ty = C.top.get(y);
        if (!!tx !== !!ty) why = `${x} is ${tx ? 'a top-level name' : 'a local'} here, ${y} is ${ty ? 'a top-level name' : 'a local'} in 26c`;
        else if (tx && !ownF.has(x) && !ownR.has(y)) {
          if (ty.module && tx.module !== ty.module) why = `${x} (${tx.src}) comes from ${tx.module} here, ${y} (${ty.src || '?'}) from ${ty.module} in 26c`;
          else if (ty.src && tx.src && tx.src.replace(/\d+$/, '') !== ty.src.replace(/\d+$/, '')) why = `${x} is ${tx.src} here, ${y} is ${ty.src} in 26c`;
        } else if (tx && ownF.has(x) !== ownR.has(y)) why = `${x} is ${ownF.has(x) ? 'this module\'s own' : 'imported'} here, ${y} is ${ownR.has(y) ? 'this module\'s own' : 'imported'} in 26c`;
      } else if (fx !== y || ry !== x) why = `name mismatch: here ${x} ↔ ${fx ?? '(new)'} but 26c has ${y} ↔ ${ry ?? '(new)'}`;
      if (why) {
        diffs.push({ ...tokenWindow(S, C, F[k], R[k], ctx, k, k, q), why });
        return { ...res, verdict: 'FAIL', why: 'names', tokens: ntok, diffs };
      }
    }
  }
  return { ...res, verdict: 'PASS', tokens: ntok };
}
// a window of tokens around the first difference of two units (q = a known index), with the original names
function tokenWindow(S, C, fu, ru, ctx, kf, kr, q = null) {
  const ta = fu ? unitTokens(S, fu) : [], tb = ru ? unitTokens(C, ru) : [];
  if (q == null) { q = 0; while (q < ta.length && q < tb.length && ta[q].v === tb[q].v) q++; }
  const show = (side, toks) => {
    if (!toks.length) return '(no unit)';
    const a = Math.max(0, q - ctx), b = Math.min(toks.length, q + ctx + 1);
    if (a >= toks.length) return '(ends)';
    const lo = toks[a].pos, hi = toks[Math.min(b, toks.length) - 1].end, mid = q < toks.length ? toks[q] : null;
    const s = side.js;
    return (a > 0 ? '…' : '') + (mid ? s.slice(lo, mid.pos) + '⟦' + s.slice(mid.pos, mid.end) + '⟧' + s.slice(mid.end, hi) : s.slice(lo, hi)) + (b < toks.length ? '…' : '');
  };
  return { unitFresh: kf, unitRef: kr, token: q, fresh: show(S, ta), ref: show(C, tb), refAt: ru ? ru.start : null, freshHead: fu ? fu.text.slice(0, 80) : null, refHead: ru ? ru.text.slice(0, 80) : null };
}

// the 26c line of a stub offset in recovery/work/p26c.pretty.js: the line of the module's banner + a search for the unit's
// first distinctive literal inside the module's range
let PRETTY = null, RANGES = null;
export function prettyLine(label, unitText) {
  try {
    if (!PRETTY) { PRETTY = fs.readFileSync(W + 'p26c.pretty.js', 'utf8').split('\n'); RANGES = JSON.parse(fs.readFileSync(W + 'p26c.ranges.json', 'utf8')); }
    const r = RANGES.find((x) => x.label === label || x.label.replace(/ \?$/, '') === label);
    if (!r) return null;
    const lits = [...unitText.matchAll(/"([^"\\]{6,60})"|\.([A-Za-z_$][\w$]{5,})/g)].map((m) => m[1] || '.' + m[2]);
    for (const l of lits.slice(0, 6)) {
      for (let i = r.from - 1; i < r.to; i++) if (PRETTY[i].includes(l)) return { line: i + 1, range: [r.from, r.to] };
    }
    return { line: null, range: [r.from, r.to] };
  } catch { return null; }
}

// ── everything at once ──
export async function bothSides(root = ROOT) {
  const S = await freshSide(root);
  const C = refSide();
  labelRef(C, S);
  S.mods = modulesOf(S); C.mods = modulesOf(C);
  return { S, C };
}
