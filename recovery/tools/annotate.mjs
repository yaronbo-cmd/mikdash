// recovery R1 — the readable bundles: put a banner comment at the start of every module found by modmap.py, then run
// prettier, then read back on which line each banner landed → the module's line range in the prettified file.
// usage: node recovery/tools/annotate.mjs     (reads recovery/work/{modmap.json,x15/app.stub.js,x26c/app.stub.js})
// writes recovery/work/p26c.pretty.js, p15.pretty.js (+ .ranges.json: [{id,label,status,from,to,lines}])
import { createRequire } from 'module';
import fs from 'fs';
import { parse, sha } from './r1lib.mjs';
const require = createRequire('/home/claude/tools-npm/');
const prettier = require('prettier');
const W = '/home/claude/temple3d/recovery/work/';
const map = JSON.parse(fs.readFileSync(W + 'modmap.json', 'utf8'));
const PRETTIER = { parser: 'babel', printWidth: 110, singleQuote: true };

async function one(tag, jsFile, mods, banner) {
  let js = fs.readFileSync(jsFile, 'utf8');
  const ins = mods.map((m) => [m.start, banner(m)]).sort((a, b) => b[0] - a[0]);
  for (const [at, text] of ins) js = js.slice(0, at) + text + js.slice(at);
  parse(js); // still valid
  const t0 = Date.now();
  const out = await prettier.format(js, PRETTIER);
  const lines = out.split('\n');
  const marks = [];
  const re = /\/\* ═══ R1 (\S+) /;
  lines.forEach((l, i) => { const m = re.exec(l); if (m) marks.push([m[1], i + 1]); });
  const ranges = marks.map(([id, line], k) => {
    const m = mods.find((x) => x.id === id);
    const to = k + 1 < marks.length ? marks[k + 1][1] - 1 : lines.length;
    return { id, label: m.label, status: m.status, from: line, to, lines: to - line + 1 };
  });
  fs.writeFileSync(W + tag + '.pretty.js', out);
  fs.writeFileSync(W + tag + '.ranges.json', JSON.stringify(ranges, null, 1));
  console.log(tag, 'prettier', ((Date.now() - t0) / 1000).toFixed(1) + 's', lines.length, 'lines', marks.length, 'of', mods.length, 'banners found', 'sha256', sha(out, 16));
}
const m26 = map.mods26.map((m) => ({ ...m, id: '26c#' + m.j, label: m.label || '?' }));
await one('p26c', W + 'x26c/app.stub.js', m26, (m) => `/* ═══ R1 ${m.id} · ${m.label} · ${m.status}${m.k15 != null && map.rows.find((r) => r.k15 === m.k15 && r.moved) ? ' (moved)' : ''} · ${m.bytes} B min ═══ */`);
const st15 = Object.fromEntries(map.rows.map((r) => [r.k15, r.status]));
const m15 = map.mods15.map((m) => ({ ...m, id: '15#' + m.k, status: st15[m.k] }));
await one('p15', W + 'x15/app.stub.js', m15, (m) => `/* ═══ R1 ${m.id} · ${m.label} · in 26c: ${m.status} · ${m.bytes} B min ═══ */`);
