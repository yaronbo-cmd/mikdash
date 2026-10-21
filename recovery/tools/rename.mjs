// recovery R2 — a module of a bundle back as a DRAFT ES module: top-level names restored (26c: recovery/work/symmap26c.json;
// fresh: the names build), imports rebuilt from the module's references to other modules' top-level names and its init_x()
// calls, exports from other modules' references to its names, a wrapped module's hoisted `var a` + `a = …` folded into
// `const a = …` (`let` when the bundle assigns it again). Locals stay minified, or with --canon become _0, _1 … numbered per
// top-level unit in order of first use, so the same code prints the same on both sides and `diff` shows only real changes.
// An aid for R3–R7, not a final product.
//   node recovery/tools/rename.mjs <module> [--side 26c|fresh] [--canon] [--out FILE] [--no-pretty]
//   e.g. node recovery/tools/rename.mjs temple.js --canon --out /tmp/t26.js
//        node recovery/tools/rename.mjs temple.js --side fresh --canon --out /tmp/t15.js && diff /tmp/t15.js /tmp/t26.js
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { ROOT, bothSides, findLabel, unitTokens } from './plib.mjs';
import { walk } from './r1lib.mjs';
const require = createRequire('/home/claude/tools-npm/');

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const flag = (k) => { const i = argv.indexOf(k); if (i < 0) return false; argv.splice(i, 1); return true; };
const sideName = opt('--side', '26c'), out = opt('--out', null), canon = flag('--canon'), noPretty = flag('--no-pretty'), root = opt('--root', ROOT);
if (!argv.length) { console.error('usage: node recovery/tools/rename.mjs <module> [--side 26c|fresh] [--canon] [--out FILE]'); process.exit(2); }

const { S, C } = await bothSides(root);
const X = sideName === 'fresh' ? S : C;
const labels = [...new Set([...S.mods.keys(), ...C.mods.keys()])];
const label = findLabel(labels, argv[0]);
if (!label || !X.mods.get(label)) { console.error(`${argv[0]}: not in the ${sideName} bundle`); process.exit(2); }
const idx = X.mods.get(label), U = idx.map((i) => X.units[i]);

// ── the bundle-wide facts: who references which top-level name, how often each name is assigned ──
const refs = new Map(), assigned = new Map();
for (const u of X.units) {
  if (u.kind === 'wrap') continue;
  walk.full(u.node, (n) => {
    if (n.type === 'Identifier' && X.top.has(n.name)) { const d = X.top.get(n.name); if (d.module !== u.label) { if (!refs.has(n.name)) refs.set(n.name, new Set()); refs.get(n.name).add(u.label); } }
    else if (n.type === 'AssignmentExpression' && n.left.type === 'Identifier') assigned.set(n.left.name, (assigned.get(n.left.name) || 0) + 1);
    else if (n.type === 'UpdateExpression' && n.argument.type === 'Identifier') assigned.set(n.argument.name, (assigned.get(n.argument.name) || 0) + 2);
  });
}
// a source name without esbuild's collision suffix when the declaring file has it that way
const fileCache = new Map();
const srcText = (mod) => { if (!fileCache.has(mod)) { let t = ''; try { t = fs.readFileSync(path.join(root, mod), 'utf8'); } catch {} fileCache.set(mod, t); } return fileCache.get(mod); };
function realName(mod, name) {
  if (!name) return null;
  const m = /^(.*?)(\d+)$/.exec(name);
  if (!m || !mod || !mod.startsWith('src/')) return name;
  const t = srcText(mod), has = (n) => new RegExp(`\\b(?:function\\*?|const|let|var|class)\\s+${n.replace(/\$/g, '\\$')}\\b|\\b${n.replace(/\$/g, '\\$')}\\s*[,}]`).test(t);
  return !has(name) && has(m[1]) ? m[1] : name;
}
const own = new Set(U.map((u) => u.decl).filter(Boolean));
const topName = (n) => { const d = X.top.get(n); return d ? realName(d.module, d.src) || n : n; };
const relTo = (mod) => {
  if (mod.startsWith('node_modules/three/build/')) return 'three';
  if (mod.startsWith('node_modules/')) return mod.replace(/^node_modules\//, '');
  let r = path.relative(path.dirname(label), mod).split(path.sep).join('/');
  return r.startsWith('.') ? r : './' + r;
};

// ── rename the tokens of each unit ──
const initOf = new Map();   // init_x name → module
for (const u of X.units) if (u.kind === 'wrap') initOf.set(u.decl, u.label);
const imports = new Map(), sideEffects = new Set();
const used = new Map();   // the local name chosen for an imported/own top-level name → minified name (collisions)
function nameFor(n) {
  if (!X.top.has(n)) return null;
  let s = topName(n);
  if (used.has(s) && used.get(s) !== n) s = s + '_' + n;
  used.set(s, n);
  return s;
}
const hoisted = new Map();   // a wrapped module's bare `var a` → its unit
const lines = [];
for (const u of U) {
  if (u.kind === 'wrap') continue;
  const toks = unitTokens(X, u);
  const loc = new Map(); let nloc = 0;
  let text = u.text, shift = 0;
  const reps = [];
  for (const t of toks) {
    if (t.v !== '\u0000id') continue;
    const n = t.name;
    let to;
    if (X.top.has(n)) {
      to = nameFor(n);
      const d = X.top.get(n);
      if (!own.has(n) && d.module && d.module !== label) {
        if (initOf.has(n)) { sideEffects.add(initOf.get(n)); continue; }
        if (!imports.has(d.module)) imports.set(d.module, new Map());
        imports.get(d.module).set(to, topName(n));
      }
    } else if (canon) { if (!loc.has(n)) loc.set(n, '_' + nloc++); to = loc.get(n); }
    else continue;
    reps.push([t.pos, t.end, to]);
  }
  // shorthand `{k}` whose value got another name → `{k: v}`
  const short = new Set(); toks.forEach((t, i) => { if (t.v.endsWith(':') && toks[i + 1] && toks[i + 1].pos === t.pos) short.add(t.pos); });
  const seen = new Set();
  for (const [a, b, to] of reps.sort((x, y) => x[0] - y[0])) {
    if (seen.has(a)) continue; seen.add(a);
    const orig = X.js.slice(a, b);
    const rep = short.has(a) && to !== orig ? `${orig}: ${to}` : to;
    text = text.slice(0, a - u.start + shift) + rep + text.slice(b - u.start + shift);
    shift += rep.length - (b - a);
  }
  const nd = u.node;
  const exp = (n) => (n && refs.has(n) ? 'export ' : '');
  if (u.kind.endsWith('decl')) {
    const n = nd.id.type === 'Identifier' ? nd.id.name : null;
    if (!nd.init && n && u.sub !== true && X.top.has(n)) { hoisted.set(n, lines.length); lines.push(null); continue; }
    const kw = n && (assigned.get(n) || 0) > 0 ? 'let' : u.kind === 'vardecl' || u.kind === 'constdecl' ? 'const' : 'let';
    lines.push(`${exp(n)}${kw} ${text};`);
  } else if ((u.kind === 'seq' || u.kind === 'expr') && nd.type === 'AssignmentExpression' && nd.operator === '=' && nd.left.type === 'Identifier' && hoisted.has(nd.left.name)) {
    const n = nd.left.name; hoisted.delete(n);
    lines.push(`${exp(n)}${(assigned.get(n) || 0) > 1 ? 'let' : 'const'} ${text};`);
  } else if ((u.kind === 'seq' || u.kind === 'expr') && nd.type === 'CallExpression' && nd.callee.type === 'Identifier' && initOf.has(nd.callee.name) && !nd.arguments.length) {
    sideEffects.add(initOf.get(nd.callee.name));
  } else if (u.kind === 'seq' || u.kind === 'expr') lines.push(text + ';');
  else lines.push((nd.type === 'FunctionDeclaration' || nd.type === 'ClassDeclaration') ? exp(nd.id && nd.id.name) + text : text);
}
for (const [n, at] of hoisted) lines[at] = `${refs.has(n) ? 'export ' : ''}let ${nameFor(n)};`;
const head = [`// DRAFT of ${label} from the ${sideName === 'fresh' ? 'working tree' : '26c'} bundle (recovery/tools/rename.mjs${canon ? ' --canon' : ''}) — not a source file.`,
  `// Top-level names: ${sideName === 'fresh' ? "the names build's" : 'symmap26c.json (unknown ones stay minified)'}; locals ${canon ? 'canonical (_0, _1 … per unit)' : 'minified'}.`];
const imp = [];
for (const [mod, names] of [...imports].sort((a, b) => a[0].localeCompare(b[0]))) {
  const parts = [...names].sort((a, b) => a[0].localeCompare(b[0])).map(([local, real]) => (local === real ? local : `${real} as ${local}`));
  imp.push(`import { ${parts.join(', ')} } from '${relTo(mod)}';`);
  sideEffects.delete(mod);
}
const named = new Set([...imports.keys()].map(relTo));
for (const r of [...new Set([...sideEffects].map(relTo))].sort()) if (!named.has(r)) imp.push(`import '${r}';`);
let src = [...head, ...imp, '', ...lines.filter((l) => l != null)].join('\n') + '\n';
if (!noPretty) {
  try { src = await require('prettier').format(src, { parser: 'babel', printWidth: 140, singleQuote: true }); }
  catch (e) { src = `// (prettier failed: ${String(e.message).split('\n')[0]})\n` + src; }
}
if (out) { fs.writeFileSync(out, src); console.log(`${out}: ${label} (${sideName}), ${U.length} units, ${imp.length} imports, ${src.split('\n').length} lines`); }
else process.stdout.write(src);
