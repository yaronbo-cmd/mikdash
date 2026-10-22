// recovery R6 — unmin: a rename.mjs draft of a 26c module (top-level names restored, locals minified, esbuild's minified forms) →
// a readable ES module that esbuild minifies back to the same units (check with parity.mjs). Two parts:
//  1. names: a JSON file { "top": { min: name }, "scopes": { "<function path>": { min: name } } } — a function's path is its name
//     and its enclosing functions' names joined by ">" (a function's name: its declaration's, the variable or property it is
//     assigned to, else "fn@<line>"); a scope key may also be the last name alone. Renaming is scope-aware (eslint-scope) and is
//     checked afterwards: every identifier must still resolve to the same binding (a name that shadows or captures fails loudly).
//     A local key may be "min@line" (its declaration line in the draft) for a letter reused in sibling blocks.
//  2. forms: esbuild's statement forms undone — `a, b;` → `a; b;` · `a && b();` → `if (a) b();` · `a || b();` → `if (!a) b();`
//     (only where esbuild folds it back) · `a ? b() : c();` → if/else · `return (a, b)` / `if ((a, b))` / `throw (a, b)` → `a;` first ·
//     `=> (a, b)` → a block · `!0`/`!1`/`void 0` → true/false/undefined · `typeof x == 's'` → `===` · `let` never reassigned →
//     `const` · `catch {}` → `catch (e)` (the tree's style; --no-catch keeps it). Then names.patches (text edits, checked).
// usage: node recovery/tools/unmin.mjs <draft.js> [--names names.json] [--out file.js] [--head header.txt] [--scopes] [--no-catch]
//   --scopes: list each function path with its minified locals (declaration in context, uses) — the sheet to write names from.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire('/home/claude/tools-npm/');
const acorn = require('acorn');
const escope = require('eslint-scope');
const { generate } = require('astring');
const prettier = require('prettier');

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const file = args.find((a, i) => !a.startsWith('--') && !['--names', '--out', '--head'].includes(args[i - 1]));
const NAMES = opt('--names') ? JSON.parse(fs.readFileSync(opt('--names'), 'utf8')) : { top: {}, scopes: {} };
// names.draftPatches: [find, replace] on the draft before anything (e.g. rename.mjs's `let a; … ({ r: a } = T);` back to the source's
// `const { r: a } = T;`); each find must occur exactly once
let src = fs.readFileSync(file, 'utf8');
for (const [f, r] of NAMES.draftPatches || []) { const n = src.split(f).length - 1; if (n !== 1) throw new Error(`draft patch "${f.slice(0, 60)}" occurs ${n} times`); src = src.replace(f, () => r); }
const parse = (s) => acorn.parse(s, { ecmaVersion: 'latest', sourceType: 'module', ranges: true, locations: true });
const analyze = (ast) => escope.analyze(ast, { ecmaVersion: 2022, sourceType: 'module' });
const ast = parse(src);

// ── function paths ──
const parentOf = new Map();
(function link(n, p) { if (!n || typeof n.type !== 'string') return; parentOf.set(n, p); for (const k in n) { if (k === 'loc' || k === 'range') continue; const v = n[k]; if (Array.isArray(v)) v.forEach((c) => c && typeof c.type === 'string' && link(c, n)); else if (v && typeof v.type === 'string') link(v, n); } })(ast, null);
const isFn = (n) => n && /Function/.test(n.type);
function fnName(f) {
  if (f.id && f.id.name) return f.id.name;
  const p = parentOf.get(f);
  if (p && p.type === 'VariableDeclarator' && p.id.type === 'Identifier') return p.id.name;
  if (p && p.type === 'AssignmentExpression' && p.left.type === 'Identifier') return p.left.name;
  if (p && (p.type === 'Property' || p.type === 'MethodDefinition') && p.key && (p.key.name || p.key.value)) return String(p.key.name || p.key.value);
  if (p && p.type === 'AssignmentExpression' && p.left.type === 'MemberExpression' && p.left.property.name) return p.left.property.name;
  return 'fn@' + f.loc.start.line;
}
function pathOf(node) {   // the function path of the scope block (a function, or the module)
  const parts = [];
  let n0 = node; const p0 = parentOf.get(node);
  if (p0 && isFn(p0) && p0.id === node) n0 = parentOf.get(p0);   // (a function's own name belongs to the scope around it)
  for (let n = n0; n; n = parentOf.get(n)) if (isFn(n)) parts.unshift(fnName(n));
  return parts.join('>');
}

// ── 1. names ──
const sm = analyze(ast);
const before = bindingMap(ast, sm);
const varsOf = [];
for (const sc of sm.scopes) for (const v of sc.variables) if (v.identifiers.length) varsOf.push([sc, v]);
if (args.includes('--scopes')) {
  const by = new Map();
  for (const [sc, v] of varsOf) {
    if (sc.type === 'module' || sc.type === 'global') continue;
    const p = pathOf(v.identifiers[0]);
    if (!by.has(p)) by.set(p, []);
    const d = v.identifiers[0], line = src.split('\n')[d.loc.start.line - 1].trim().slice(0, 110);
    by.get(p).push(`${v.name}×${v.references.length}  ${d.loc.start.line}: ${line}`);
  }
  for (const [p, l] of by) { console.log('## ' + p); for (const x of l) console.log('   ' + x); }
  process.exit(0);
}
const topMap = NAMES.top || {}, scopeMap = NAMES.scopes || {};
for (const [sc, v] of varsOf) {
  let to = null;
  if (sc.type === 'module') to = topMap[v.name] || null;
  else {
    const p = pathOf(v.identifiers[0]), last = p.split('>').pop(), at = `${v.name}@${v.identifiers[0].loc.start.line}`;   // (name@line: one of the letters reused in sibling blocks)
    const look = (m) => m && (m[at] || m[v.name]);
    to = look(scopeMap[p]) || look(scopeMap[last]) || null;
  }
  if (!to || to === v.name) continue;
  for (const id of v.identifiers) id.name = to;
  for (const r of v.references) r.identifier.name = to;
}
// import/export specifiers: the imported name follows the local one (the exporter is renamed to the same name)
(function fix(n) {
  if (!n || typeof n.type !== 'string') return;
  if (n.type === 'ImportSpecifier' && n.imported && topMap[n.imported.name]) n.imported = { ...n.imported, name: topMap[n.imported.name] };
  if (n.type === 'ExportSpecifier' && n.exported && n.exported.name !== n.local.name && topMap[n.exported.name]) n.exported = { ...n.exported, name: topMap[n.exported.name] };
  if (n.type === 'Property' && n.shorthand && n.value) { const vn = n.value.type === 'AssignmentPattern' ? n.value.left.name : n.value.name; if (vn !== (n.key.name || n.key.value)) n.shorthand = false; }
  for (const k in n) { if (k === 'loc' || k === 'range') continue; const v = n[k]; if (Array.isArray(v)) v.forEach(fix); else if (v && typeof v.type === 'string') fix(v); }
})(ast);
// the check: same bindings as before (identifiers in source order → binding index)
{ const after = bindingMap(ast, analyze(ast)); if (after.length !== before.length) throw new Error('rename: identifier count changed'); const m = new Map(); for (let i = 0; i < before.length; i++) { const k = before[i] + '|' + after[i]; if (before[i] !== -1 || after[i] !== -1) { const a = m.get('b' + before[i]), b = m.get('a' + after[i]); if ((a != null && a !== after[i]) || (b != null && b !== before[i])) throw new Error(`rename changed a binding at identifier #${i}: ${idList(ast)[i].name} (line ${idList(ast)[i].loc.start.line})`); m.set('b' + before[i], after[i]); m.set('a' + after[i], before[i]); } void k; } }
function idList(t) { const out = []; (function w(n) { if (!n || typeof n.type !== 'string') return; if (n.type === 'Identifier') out.push(n); for (const k in n) { if (k === 'loc' || k === 'range') continue; const v = n[k]; if (Array.isArray(v)) v.forEach(w); else if (v && typeof v.type === 'string') w(v); } })(t); return out; }
function bindingMap(t, s) {
  const of = new Map(); let k = 0;
  for (const sc of s.scopes) for (const v of sc.variables) { const id = k++; for (const d of v.identifiers) of.set(d, id); for (const r of v.references) of.set(r.identifier, id); }
  for (const sc of s.scopes) for (const r of sc.through) if (!of.has(r.identifier)) of.set(r.identifier, 'g:' + r.identifier.name);
  return idList(t).map((n) => (of.has(n) ? of.get(n) : -1));
}

// ── let → const (no write but the declaration's own) ──
{
  const s2 = analyze(ast), writes = new Map();
  for (const sc of s2.scopes) for (const v of sc.variables) { const w = v.references.some((r) => r.isWrite() && !r.init); for (const d of v.identifiers) writes.set(d, w); }
  (function w(n) {
    if (!n || typeof n.type !== 'string') return;
    if (n.type === 'VariableDeclaration' && n.kind === 'let') {
      const p = parentOf.get(n), inForHead = p && p.type === 'ForStatement' && p.init === n;
      const ids = []; (function col(q) { if (!q) return; if (q.type === 'Identifier') ids.push(q); else if (q.type === 'ObjectPattern') q.properties.forEach((x) => col(x.type === 'RestElement' ? x.argument : x.value)); else if (q.type === 'ArrayPattern') q.elements.forEach(col); else if (q.type === 'AssignmentPattern') col(q.left); else if (q.type === 'RestElement') col(q.argument); })({ type: 'ArrayPattern', elements: n.declarations.map((d) => d.id) });
      const forOf = p && (p.type === 'ForOfStatement' || p.type === 'ForInStatement') && p.left === n;
      if (!inForHead && (forOf || n.declarations.every((d) => d.init)) && ids.every((i) => writes.get(i) === false)) n.kind = 'const';
    }
    for (const k in n) { if (k === 'loc' || k === 'range') continue; const v = n[k]; if (Array.isArray(v)) v.forEach(w); else if (v && typeof v.type === 'string') w(v); }
  })(ast);
}

// ── 2. forms ──
const ES = (e) => ({ type: 'ExpressionStatement', expression: e });
const block = (l) => (l.length === 1 ? l[0] : { type: 'BlockStatement', body: l });
const NEG_OK = new Set(['Identifier', 'MemberExpression', 'CallExpression', 'ChainExpression']);
function neg(e) { return { type: 'UnaryExpression', operator: '!', prefix: true, argument: e }; }
function stmt(s) {   // one statement → a list of statements
  if (!s) return [s];
  switch (s.type) {
    case 'ExpressionStatement': {
      const e = s.expression;
      if (e.type === 'SequenceExpression') return e.expressions.flatMap((x) => stmt(ES(x)));
      if (e.type === 'LogicalExpression' && e.operator === '&&') return [{ type: 'IfStatement', test: e.left, consequent: block(stmt(ES(e.right))), alternate: null }];
      if (e.type === 'LogicalExpression' && e.operator === '||' && NEG_OK.has(e.left.type)) return [{ type: 'IfStatement', test: neg(e.left), consequent: block(stmt(ES(e.right))), alternate: null }];
      if (e.type === 'ConditionalExpression') return [{ type: 'IfStatement', test: e.test, consequent: block(stmt(ES(e.consequent))), alternate: block(stmt(ES(e.alternate))) }];
      return [s];
    }
    case 'ReturnStatement': case 'ThrowStatement':
      if (s.argument && s.argument.type === 'SequenceExpression') { const ex = s.argument.expressions; return [...ex.slice(0, -1).flatMap((x) => stmt(ES(x))), { ...s, argument: ex[ex.length - 1] }]; }
      return [s];
    case 'IfStatement': {
      let pre = [], test = s.test;
      if (test.type === 'SequenceExpression') { pre = test.expressions.slice(0, -1).flatMap((x) => stmt(ES(x))); test = test.expressions[test.expressions.length - 1]; }
      let cons = inner(s.consequent);
      if (s.alternate && openIf(cons)) cons = { type: 'BlockStatement', body: [cons] };   // (a dangling else: the outer else must not bind to an inner if)
      return [...pre, { ...s, test, consequent: cons, alternate: s.alternate ? inner(s.alternate) : null }];
    }
    case 'ForStatement': case 'ForInStatement': case 'ForOfStatement': case 'WhileStatement': case 'DoWhileStatement': case 'LabeledStatement':
      return [{ ...s, body: inner(s.body) }];
    default: return [s];
  }
}
// does a statement end in an `if` without an else (directly, or as a loop's or label's body)? — then an else after it would bind to it
function openIf(n) {
  if (!n) return false;
  if (n.type === 'IfStatement') return !n.alternate || openIf(n.alternate);
  if (/^(For|ForIn|ForOf|While|Labeled)Statement$/.test(n.type)) return openIf(n.body);
  return false;
}
function inner(s) { const l = stmt(s); return l.length === 1 && l[0].type !== 'VariableDeclaration' ? l[0] : { type: 'BlockStatement', body: l }; }
function lists(n) {
  if (!n || typeof n.type !== 'string') return;
  for (const k in n) { if (k === 'loc' || k === 'range') continue; const v = n[k]; if (Array.isArray(v)) v.forEach(lists); else if (v && typeof v.type === 'string') lists(v); }
  if (n.type === 'Program' || n.type === 'BlockStatement' || n.type === 'StaticBlock') n.body = n.body.flatMap(stmt);
  // `if (!x) return; rest` at a function body's end is folded by esbuild into `if (!!x) { rest }` (and `if (a || b) return; rest` into
  // `if (!(a || b)) { rest }`) — the negation marks it: undo it
  if (n.type === 'BlockStatement' && isFn(parentOf.get(n)) && n.body.length) {
    const last = n.body[n.body.length - 1];
    const t = last.type === 'IfStatement' && !last.alternate && last.test.type === 'UnaryExpression' && last.test.operator === '!' ? last.test.argument : null;
    if (t && ((t.type === 'UnaryExpression' && t.operator === '!') || t.type === 'LogicalExpression')) {   // (`!!x`, or `!(a || b)` / `!(a && b)`)
      const rest = last.consequent.type === 'BlockStatement' ? last.consequent.body : [last.consequent];
      n.body = [...n.body.slice(0, -1), { type: 'IfStatement', test: last.test.argument, consequent: { type: 'ReturnStatement', argument: null }, alternate: null }, ...rest];
    }
  }
  if (n.type === 'SwitchCase') n.consequent = n.consequent.flatMap(stmt);
  if (n.type === 'ArrowFunctionExpression' && n.expression && n.body.type === 'SequenceExpression') { const ex = n.body.expressions; n.body = { type: 'BlockStatement', body: [...ex.slice(0, -1).flatMap((x) => stmt(ES(x))), { type: 'ReturnStatement', argument: ex[ex.length - 1] }] }; n.expression = false; }
  for (const k of ['consequent', 'alternate', 'body']) if ((n.type === 'IfStatement' || /^(For|While|DoWhile|Labeled)/.test(n.type)) && n[k] && n[k].type === 'ExpressionStatement') n[k] = inner(n[k]);
}
lists(ast);
// the imports in the original order (the module's init calls in its 26c wrapper show it; the draft sorts them): names.importOrder
if (NAMES.importOrder) {
  const imps = ast.body.filter((n) => n.type === 'ImportDeclaration'), rest = ast.body.filter((n) => n.type !== 'ImportDeclaration');
  const at = (n) => { const i = NAMES.importOrder.indexOf(n.source.value); return i < 0 ? 1e3 : i; };
  ast.body = [...imps.map((n, i) => [n, i]).sort((a, b) => at(a[0]) - at(b[0]) || a[1] - b[1]).map((x) => x[0]), ...rest];
}
(function exprs(n) {
  if (!n || typeof n.type !== 'string') return;
  for (const k in n) {
    if (k === 'loc' || k === 'range') continue;
    const v = n[k];
    const fixE = (e) => {
      if (e && e.type === 'UnaryExpression' && e.operator === '!' && e.argument.type === 'Literal' && (e.argument.value === 0 || e.argument.value === 1)) return { type: 'Literal', value: e.argument.value === 0, raw: String(e.argument.value === 0) };
      if (e && e.type === 'UnaryExpression' && e.operator === 'void' && e.argument.type === 'Literal' && e.argument.value === 0) return { type: 'Identifier', name: 'undefined' };
      if (e && e.type === 'BinaryExpression' && (e.operator === '==' || e.operator === '!=') && ((e.left.type === 'UnaryExpression' && e.left.operator === 'typeof' && e.right.type === 'Literal' && typeof e.right.value === 'string') || (e.right.type === 'UnaryExpression' && e.right.operator === 'typeof' && e.left.type === 'Literal' && typeof e.left.value === 'string'))) return { ...e, operator: e.operator + '=' };
      return e;
    };
    if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) { v[i] = fixE(v[i]); exprs(v[i]); } }
    else if (v && typeof v.type === 'string') { n[k] = fixE(v); exprs(n[k]); }
  }
})(ast);
if (!args.includes('--no-catch')) (function c(n) {
  if (!n || typeof n.type !== 'string') return;
  if (n.type === 'CatchClause' && !n.param) { const used = new Set(idList(n.body).map((x) => x.name)); n.param = { type: 'Identifier', name: ['e', 'err', 'e2', 'e3', 'e4'].find((x) => !used.has(x)) }; }
  for (const k in n) { if (k === 'loc' || k === 'range') continue; const v = n[k]; if (Array.isArray(v)) v.forEach(c); else if (v && typeof v.type === 'string') c(v); }
})(ast);

// ── out ──
let code = generate(ast).replace(/^\/\/ DRAFT[^\n]*\n(\/\/[^\n]*\n)?/, '');
code = await prettier.format(code, { parser: 'babel', printWidth: 150, singleQuote: true, trailingComma: 'all', objectWrap: 'collapse' });
// names.patches: [find, replace] pairs applied to the final text — e.g. a single-use const the original had (esbuild folds it into its
// one use but keeps its renaming slot: slotmap.mjs shows the shift); each find must occur exactly once
for (const [f, r] of NAMES.patches || []) { const n = code.split(f).length - 1; if (n !== 1) throw new Error(`patch "${f.slice(0, 60)}" occurs ${n} times`); code = code.replace(f, () => r); }
const head = opt('--head') ? fs.readFileSync(opt('--head'), 'utf8').replace(/\s*$/, '\n') : '';
if (opt('--out')) { fs.writeFileSync(opt('--out'), head + code); console.log(opt('--out'), (head + code).split('\n').length, 'lines'); } else process.stdout.write(head + code);
