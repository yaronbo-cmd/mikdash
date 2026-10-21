// recovery R1 — diff the CSS literals inside two bundles (from extract.mjs's cssjs.json + cssjs/*.css), rule by rule.
// usage: node recovery/tools/cssdiff.mjs <dirA> <dirB>   → a markdown report on stdout
import fs from 'fs';
import path from 'path';
const [A, B] = process.argv.slice(2);
const load = (d) => JSON.parse(fs.readFileSync(path.join(d, 'cssjs.json'), 'utf8')).map((c) => ({ ...c, text: fs.readFileSync(path.join(d, 'cssjs', c.sha + '.css'), 'utf8') }));
// flat rules: "selector" → "body" (at-rules kept whole by their prelude + inner rules)
function rules(css) {
  const out = new Map();
  const s = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let depth = 0, sel = '', body = '', stack = [];
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '{') { depth++; if (depth === 1) { stack = [sel.trim()]; sel = ''; } else { stack.push(body.trim()); body = ''; } continue; }
    if (ch === '}') {
      if (depth >= 2) { out.set(stack.join(' ⟩ '), (out.get(stack.join(' ⟩ ')) || '') + body.trim()); stack.pop(); body = ''; }
      else if (depth === 1) { out.set(stack[0], (out.get(stack[0]) || '') + body.trim()); body = ''; }
      depth--; continue;
    }
    if (depth === 0) sel += ch; else body += ch;
  }
  return out;
}
const a = load(A), b = load(B);
for (const c of [...a, ...b]) c.rules = rules(c.text);
const norm = (x) => x.replace(/\s+/g, '');
const shaA = new Set(a.map((c) => c.sha)), shaB = new Set(b.map((c) => c.sha));
const onlyA = a.filter((c) => !shaB.has(c.sha)), onlyB = b.filter((c) => !shaA.has(c.sha));
const sim = (x, y) => { const k1 = new Set(x.rules.keys()), k2 = new Set(y.rules.keys()); let n = 0; for (const k of k1) if (k2.has(k)) n++; return n / Math.max(1, Math.min(k1.size, k2.size)); };
const used = new Set();
const lines = [`CSS literals: ${a.length} in A, ${b.length} in B; identical ${a.length - onlyA.length}; changed/removed in A ${onlyA.length}; changed/new in B ${onlyB.length}`, ''];
for (const y of onlyB) {
  let best = null, bs = 0;
  for (const x of onlyA) { if (used.has(x)) continue; const s = sim(x, y); if (s > bs) { bs = s; best = x; } }
  if (best && bs >= 0.3) {
    used.add(best);
    const add = [], del = [], chg = [];
    for (const [k, v] of y.rules) { if (!best.rules.has(k)) add.push(k); else if (norm(best.rules.get(k)) !== norm(v)) chg.push(k); }
    for (const k of best.rules.keys()) if (!y.rules.has(k)) del.push(k);
    lines.push(`- CHANGED ${best.sha}→${y.sha} (${best.chars}→${y.chars} chars, ${best.rules.size}→${y.rules.size} rules) «${y.head.slice(0, 60)}»`);
    if (add.length) lines.push(`  - +${add.length} rules: ${add.slice(0, 40).join(' · ')}${add.length > 40 ? ' …' : ''}`);
    if (chg.length) lines.push(`  - ~${chg.length} rules: ${chg.slice(0, 40).join(' · ')}${chg.length > 40 ? ' …' : ''}`);
    if (del.length) lines.push(`  - −${del.length} rules: ${del.slice(0, 40).join(' · ')}${del.length > 40 ? ' …' : ''}`);
  } else {
    lines.push(`- NEW ${y.sha} (${y.chars} chars, ${y.rules.size} rules) «${y.head.slice(0, 70)}»`);
    lines.push(`  - selectors: ${[...y.rules.keys()].slice(0, 30).join(' · ')}${y.rules.size > 30 ? ' …' : ''}`);
  }
}
for (const x of onlyA) if (!used.has(x)) lines.push(`- GONE ${x.sha} (${x.chars} chars) «${x.head.slice(0, 70)}»`);
console.log(lines.join('\n'));
