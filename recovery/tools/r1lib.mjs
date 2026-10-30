// recovery R1 — shared helpers: split a game page into its parts, cut the esbuild IIFE into "units", normalize units so that
// code which differs only by minified local names compares equal.
//   unit = one top-level statement of the IIFE body, except: a `var a=…,b=…` is one unit per declarator, and an expression
//   statement `a(),b(),c()` is one unit per comma element (esbuild's minifier merges these across module boundaries).
import { createRequire } from 'module';
import crypto from 'crypto';
const require = createRequire('/home/claude/tools-npm/');
export const acorn = require('acorn');
export const walk = require('acorn-walk');

export const sha = (s, n = 12) => crypto.createHash('sha256').update(s).digest('hex').slice(0, n);

// ── the page ──
export function splitHtml(html) {
  const blocks = [];
  const re = /<(script|style)\b[^>]*>/g;
  let m;
  while ((m = re.exec(html))) {
    const end = html.indexOf('</' + m[1], m.index + m[0].length);
    blocks.push({ tag: m[1], open: m[0], start: m.index + m[0].length, end, text: html.slice(m.index + m[0].length, end) });
    re.lastIndex = end;
  }
  const app = blocks.filter((b) => b.tag === 'script').sort((a, b) => b.text.length - a.text.length)[0];
  let shell = '', last = 0, i = 0;
  for (const b of blocks) { shell += html.slice(last, b.start) + (b === app ? '/*__APP__*/' : `/*__${b.tag.toUpperCase()}_${i++}__*/`); last = b.end; }
  shell += html.slice(last);
  return { blocks, app, js: app.text.replace(/<\\\/script/gi, '</script'), shell };
}

// ── units ──
export function parse(js) {
  return acorn.parse(js, { ecmaVersion: 'latest', sourceType: 'script', ranges: false });
}
export function iifeBody(ast) {
  const st = ast.body[0];
  const fn = st.expression.callee; // (()=>{…})()
  return fn.body.body;
}
export function splitStatements(list, push) {
  // (push's third argument, R2: the unit's place in its statement — 0 starts a statement; parity compares the grouping too)
  for (const st of list) {
    if (st.type === 'VariableDeclaration') st.declarations.forEach((d, i) => push(d, st.kind + 'decl', i));
    else if (st.type === 'ExpressionStatement' && st.expression.type === 'SequenceExpression') st.expression.expressions.forEach((e, i) => push(e, 'seq', i));
    else if (st.type === 'ExpressionStatement') push(st.expression, 'expr', 0);
    else push(st, st.type, 0);
  }
}
// the body of an esbuild module wrapper `X = helper(() => { … })` / `X = helper((e, t) => { … })`, or null
export function wrapperBody(node, helpers) {
  const init = node.type === 'VariableDeclarator' ? node.init : node.type === 'AssignmentExpression' ? node.right : null;
  if (!init || init.type !== 'CallExpression' || init.callee.type !== 'Identifier' || !helpers.includes(init.callee.name)) return null;
  let f = init.arguments[0];
  // the names-kept build writes the wrapper as an object with one method named by the module's path: __esm({ "src/x.js"() {…} })
  if (f && f.type === 'ObjectExpression' && f.properties.length === 1 && f.properties[0].value && /FunctionExpression$/.test(f.properties[0].value.type)) f = f.properties[0].value;
  if (!f || !/FunctionExpression$/.test(f.type) || f.body.type !== 'BlockStatement') return null;
  return f.body.body;
}
// units of the IIFE; with `helpers` (the esm/cjs helper names) a module wrapper becomes its head unit (kind 'wrap', the text
// cut to `X=helper(()=>{`) followed by its body's statements as units (sub:true)
export function units(ast, js, helpers = null) {
  const out = [];
  splitStatements(iifeBody(ast), (node, kind, i) => {
    const body = helpers && wrapperBody(node, helpers);
    if (!body) { out.push({ start: node.start, end: node.end, kind, node, first: i === 0 }); return; }
    const a0 = node.init.arguments[0], fb = a0.type === 'ObjectExpression' ? a0.properties[0].value.body : a0.body;
    out.push({ start: node.start, end: node.end, kind: 'wrap', headEnd: fb.start + 1, node, first: i === 0 });
    splitStatements(body, (n, k, j) => out.push({ start: n.start, end: n.end, kind: k, sub: true, node: n, first: j === 0 }));
  });
  for (const u of out) u.text = u.kind === 'wrap' ? js.slice(u.start, u.headEnd) : js.slice(u.start, u.end);
  return out;
}

// ── normalization ── identifiers become "_" unless they are a property name (after . or ?.), an object key (`{k:` / `,k:`),
// a well-known global, or a keyword; strings, templates, numbers, regexes and punctuation are kept.
const GLOBALS = new Set('window document globalThis Math Object Array JSON Date Number String Boolean Symbol Promise Map Set WeakMap WeakSet Error TypeError RangeError console performance navigator location localStorage sessionStorage requestAnimationFrame cancelAnimationFrame setTimeout clearTimeout setInterval clearInterval Float32Array Uint8Array Uint16Array Uint32Array Int8Array Int16Array Int32Array Uint8ClampedArray Float64Array ArrayBuffer DataView Infinity NaN undefined parseInt parseFloat isNaN isFinite Intl Reflect Proxy BigInt atob btoa fetch URL Blob Image AudioContext OfflineAudioContext webkitAudioContext HTMLCanvasElement OffscreenCanvas TextDecoder TextEncoder Event CustomEvent KeyboardEvent PointerEvent TouchEvent matchMedia getComputedStyle innerWidth innerHeight devicePixelRatio screen history addEventListener removeEventListener dispatchEvent queueMicrotask structuredClone crypto WebAssembly Worker self arguments'.split(' '));
export function normTokens(text) {
  const toks = [];
  let prev = null, prev2 = null;
  const raw = [];
  try {
    for (const t of acorn.tokenizer(text, { ecmaVersion: 'latest' })) raw.push(t);
  } catch (e) { return ['<tokerr>', text]; }
  for (let i = 0; i < raw.length; i++) {
    const t = raw[i], ty = t.type;
    let v;
    if (ty.label === 'name') {
      const p = raw[i - 1], n = raw[i + 1];
      if (p && (p.type.label === '.' || p.type.label === '?.')) v = '.' + t.value;
      else if (n && n.type.label === ':' && p && (p.type.label === '{' || p.type.label === ',')) {
        // `{k: a}` and `{k}` print alike after renaming (esbuild writes the shorthand when the minified local happens to be
        // named k): a key whose value is a lone local is dropped, so both normalize to `{ _ }`
        const v2 = raw[i + 2], v3 = raw[i + 3];
        if (v2 && v2.type.label === 'name' && !GLOBALS.has(v2.value) && v3 && (v3.type.label === ',' || v3.type.label === '}')) { i += 1; continue; }
        v = t.value + ':';
      }
      else if (GLOBALS.has(t.value)) v = '$' + t.value;
      else v = '_';
    } else if (ty.label === 'string') v = JSON.stringify(t.value);
    else if (ty.label === 'num') v = '#' + String(t.value);
    else if (ty.label === 'template') v = '`' + t.value;
    else if (ty.label === 'regexp') v = '/' + (t.value && t.value.pattern) + '/';
    else if (ty.keyword) v = ty.keyword;
    else v = ty.label === 'privateId' ? '#_' : ty.label;
    toks.push(v);
  }
  return toks;
}
// the "stable" tokens a minifier cannot touch: strings, template text, numbers (non-trivial), property names, keys, regexes
export function stableTokens(norm) {
  return norm.filter((v) => v[0] === '"' || v[0] === '`' || v[0] === '.' || v[0] === '/' || v.endsWith(':') && v.length > 2 || (v[0] === '#' && !/^#(0|1|2|-?1)$/.test(v)));
}
export function literalStrings(text) {
  const out = [];
  try {
    for (const t of acorn.tokenizer(text, { ecmaVersion: 'latest' })) {
      if (t.type.label === 'string' || t.type.label === 'template') out.push(t.value);
    }
  } catch (e) { /* ignore */ }
  return out;
}
