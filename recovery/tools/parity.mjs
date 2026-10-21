// recovery R2 — is a module of the working tree the same program as its 26c segment?
//   node recovery/tools/parity.mjs <module> [<module> …]   e.g. src/temple.js, temple.js, avodah/shift/walk.js
//   node recovery/tools/parity.mjs --all [--json <file>]  every module of either bundle
//   node recovery/tools/parity.mjs --page                  the whole page (build.mjs's play.html + 26c's head script and
//                                                          title) byte for byte against recovery/build26c.min.html
// options: --windows N (differences shown, default 3) · --ctx N (tokens around each, default 10) · --root DIR (another tree)
// Verdicts: PASS · FAIL (structure: the units differ; names: the same shapes but the names do not map one-to-one, or a
// top-level name comes from another module) · MISSING-IN-FRESH (a 26c module the tree does not have yet) · MISSING-IN-26c.
// Exit code 0 when every requested module passes (--page: the bytes are identical).
// How it works: plib.mjs (the fresh build is bundled with build.mjs's settings, in memory; nothing is written).
import fs from 'fs';
import { ROOT, REF26, bothSides, compareModule, findLabel, prettyLine, buildFresh, playPage, checkBuildMjs, freshSide } from './plib.mjs';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const flag = (k) => { const i = argv.indexOf(k); if (i < 0) return false; argv.splice(i, 1); return true; };
const windows = +opt('--windows', 3), ctx = +opt('--ctx', 10), root = opt('--root', ROOT), jsonOut = opt('--json', null);
const all = flag('--all'), page = flag('--page'), selfcheck = flag('--selfcheck');
const t0 = Date.now();
const note = checkBuildMjs(root);
if (note) console.log(note);

if (page) {
  const ref = fs.readFileSync(REF26, 'utf8');
  const { min, esbuild } = await buildFresh(root, { names: false });
  const mine = Buffer.from(playPage(root, min, ref), 'utf8'), theirs = fs.readFileSync(REF26);
  let a = 0; while (a < mine.length && a < theirs.length && mine[a] === theirs[a]) a++;
  let z = 0; while (z < mine.length - a && z < theirs.length - a && mine[mine.length - 1 - z] === theirs[theirs.length - 1 - z]) z++;
  const same = a === mine.length && a === theirs.length;
  console.log(`page: fresh ${mine.length.toLocaleString('en-US')} B · 26c ${theirs.length.toLocaleString('en-US')} B · Δ ${(mine.length - theirs.length).toLocaleString('en-US')} B (esbuild ${esbuild})`);
  if (same) console.log('page: BYTE-IDENTICAL');
  else {
    console.log(`page: differs — common prefix ${a.toLocaleString('en-US')} B, common suffix ${z.toLocaleString('en-US')} B; the differing middle is ${(mine.length - a - z).toLocaleString('en-US')} B here vs ${(theirs.length - a - z).toLocaleString('en-US')} B in 26c`);
    const show = (b) => JSON.stringify(b.slice(Math.max(0, a - 60), a + 60).toString('utf8'));
    console.log('  first difference at byte', a.toLocaleString('en-US'));
    console.log('  here:', show(mine)); console.log('  26c :', show(theirs));
  }
  console.log(`(${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  process.exit(same ? 0 : 1);
}

if (selfcheck) {
  // the parity build equals what build.mjs writes (run node build.mjs first): dist/play.html without the 26c dressing
  const S = await freshSide(root);
  const dist = fs.readFileSync(root + '/dist/play.html', 'utf8');
  const ok = dist.includes(S.rawMin.replace(/<\/script/gi, '<\\/script'));
  console.log('selfcheck: the min bundle is', ok ? 'the one in dist/play.html' : 'NOT the one in dist/play.html (stale dist? run node build.mjs)');
  process.exit(ok ? 0 : 1);
}

const { S, C } = await bothSides(root);
const labels = [...new Set([...S.mods.keys(), ...C.mods.keys()])];
const want = all ? labels : argv.map((q) => { const l = findLabel(labels, q); if (!l) { console.log(`${q}: no module of that name in either bundle`); process.exitCode = 2; } return l; }).filter(Boolean);
const results = want.map((l) => compareModule(S, C, l, { windows, ctx }));
const fmt = (r) => {
  const head = `${r.verdict.padEnd(16)} ${r.label}`;
  if (r.verdict === 'PASS') return `${head}  (${r.fresh} units, ${r.tokens.toLocaleString('en-US')} tokens)`;
  if (r.verdict !== 'FAIL') return `${head}  (units here ${r.fresh}, in 26c ${r.ref})`;
  let s = `${head}  — ${r.why === 'names' ? 'same shapes, names differ' : `${r.unitsChanged} unit(s) changed, ${r.unitsOnlyFresh} only here, ${r.unitsOnlyRef} only in 26c`} (units here ${r.fresh}, in 26c ${r.ref})`;
  r.diffs.forEach((d, k) => {
    const pl = d.refHead ? prettyLine(r.label, C.js.slice(d.refAt, d.refAt + 4000)) : null;
    s += `\n  #${k + 1} unit ${d.unitFresh} here ~ unit ${d.unitRef} in 26c, token ${d.token}` + (pl ? ` · p26c.pretty.js ${pl.line ? 'line ≈' + pl.line : 'module'} (module ${pl.range[0]}–${pl.range[1]})` : '') + (d.why ? `\n     ${d.why}` : '');
    s += `\n     here: ${d.fresh.replace(/\s+/g, ' ')}\n     26c : ${d.ref.replace(/\s+/g, ' ')}`;
  });
  return s;
};
if (all) {
  const order = { FAIL: 0, 'MISSING-IN-FRESH': 1, 'MISSING-IN-26c': 2, PASS: 3 };
  const short = results.slice().sort((a, b) => order[a.verdict] - order[b.verdict] || a.label.localeCompare(b.label));
  for (const r of short) console.log(r.verdict === 'FAIL' ? fmt({ ...r, diffs: r.diffs.slice(0, 1) }) : fmt(r));
  const cnt = {}; for (const r of results) cnt[r.verdict] = (cnt[r.verdict] || 0) + 1;
  const src = (v) => results.filter((r) => r.verdict === v && r.label.startsWith('src/')).length;
  console.log(`\nmodules ${results.length}: ` + Object.entries(cnt).map(([k, v]) => `${k} ${v}`).join(' · ') + ` | src/ only: PASS ${src('PASS')}, FAIL ${src('FAIL')}, MISSING-IN-FRESH ${src('MISSING-IN-FRESH')}`);
} else for (const r of results) console.log(fmt(r));
if (C.ambiguous.length) console.log(`note: ${C.ambiguous.length} unit(s) of 26c's tail lie between two modules and match nothing here yet: ` + C.ambiguous.slice(0, 4).map((u) => `${JSON.stringify(u.text.slice(0, 30))} between ${u.between[0]} | ${u.between[1]}`).join('; '));
console.log(`(fresh build ${S.ms.build} ms, analysis ${S.ms.analyze} + ${C.ms.analyze} ms, total ${((Date.now() - t0) / 1000).toFixed(1)} s)`);
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ when: new Date().toISOString(), results: results.map(({ diffs, ...r }) => ({ ...r, first: diffs && diffs[0] })) }, null, 1));
if (results.some((r) => r.verdict !== 'PASS')) process.exitCode = process.exitCode || 1;
