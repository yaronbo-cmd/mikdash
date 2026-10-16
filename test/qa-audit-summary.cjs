// Summarize the DOM audits of a qa-walk run: node test/qa-audit-summary.cjs test/out/qa/phone-first.json [--full]
// Several reports and --counts: one row per report with the number of distinct findings per category (UI wave 4:
//   node test/qa-audit-summary.cjs test/out/qa-ui/after/*-ui.json --counts
// ); --cat=small,contrast limits the detailed listing to those categories.
const fs = require('fs');
const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const full = process.argv.includes('--full');
const counts = process.argv.includes('--counts');
const catArg = (process.argv.find((a) => a.startsWith('--cat=')) || '').slice(6);
const CATS = ['clipped', 'overflow', 'offscreen', 'small', 'overlaps', 'contrast', 'canvasText', 'rtl', 'names', 'hiddenNames', 'nodraft'];
const order = ['names', 'hiddenNames', 'nodraft', 'hscroll', 'clipped', 'offscreen', 'overflow', 'overlaps', 'contrast', 'small', 'canvasText', 'rtl'];

function aggregate(R) {
  const agg = {};
  for (const a of R.audits) {
    if (!a || a.err) { if (!counts) console.log('audit error', a && a.tag, a && a.err); continue; }
    for (const k of CATS) {
      for (const v of a[k] || []) {
        const key = k + ' | ' + v.replace(/\d+(\.\d+)?:1/, 'N:1').replace(/ \d+×\d+px/, '').replace(/ \d+×\d+( \(box \d+×\d+\))?$/, '').replace(/sw=\d+\/\d+ sh=\d+\/\d+/, 'sw/sh').replace(/\[-?\d+…-?\d+\]/g, '[..]');
        (agg[key] = agg[key] || { n: 0, tags: [], ex: v }).n++;
        if (agg[key].tags.length < 4) agg[key].tags.push(a.tag);
      }
    }
    if (a.hscroll) (agg['hscroll'] = agg['hscroll'] || { n: 0, tags: [], ex: '' }).n++, agg['hscroll'].tags.push(a.tag);
  }
  return agg;
}

if (counts) {
  const cols = ['names', 'nodraft', 'hscroll', 'clipped', 'offscreen', 'overflow', 'overlaps', 'contrast', 'small', 'canvasText'];
  console.log(['report'.padEnd(34), 'screens', ...cols].join(' | '));
  for (const f of files) {
    const R = JSON.parse(fs.readFileSync(f, 'utf8')), agg = aggregate(R);
    const n = (c) => Object.keys(agg).filter((k) => k.split(' | ')[0] === c || (c === 'hscroll' && k === 'hscroll')).length;
    console.log([f.split('/').slice(-2).join('/').padEnd(34), String(R.audits.length).padStart(7), ...cols.map((c) => String(n(c)).padStart(c.length))].join(' | ') + (R.errors && R.errors.length ? `  errors ${R.errors.length}` : '') + (R.notes && R.notes.length ? `  notes ${R.notes.length}` : ''));
  }
  process.exit(0);
}

for (const f of files) {
  const R = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (files.length > 1) console.log(`\n# ${f}`);
  const agg = aggregate(R);
  for (const cat of order) {
    if (catArg && !catArg.split(',').includes(cat)) continue;
    const rows = Object.entries(agg).filter(([k]) => k.split(' | ')[0] === cat).sort((a, b) => b[1].n - a[1].n);
    if (!rows.length) continue;
    console.log(`\n## ${cat} (${rows.length} distinct)`);
    for (const [, v] of rows.slice(0, full ? 999 : 25)) console.log(`  ${String(v.n).padStart(3)}×  ${v.ex.slice(0, 230)}   [${v.tags.join(', ')}]`);
  }
  if (catArg) continue;
  console.log('\nnotes:', JSON.stringify(R.notes, null, 1));
  console.log('errors:', R.errors.length, R.errors.slice(0, 5));
  console.log('warns:', R.warns);
  if (R.boot) console.log('boot:', JSON.stringify({ ...R.boot, lt: undefined, loader: (R.boot.loader || []).map((x) => x.t + ' ' + x.txt) }));
  console.log('perf:', (R.perf || []).map((p) => `${p.view}: ${p.total}/${p.scene} calls, ${(p.triangles / 1e6).toFixed(2)}M tris, ${p.sceneVertsM}M verts, heap ${p.heapMB && p.heapMB.used}MB, programs ${p.programs}`).join('\n      '));
  console.log('memory:', JSON.stringify(R.memory), 'longTasks (JS, outside renders):', (R.longTasksAll || []).length, JSON.stringify((R.longTasksAll || []).sort((a, b) => b.d - a.d).slice(0, 10)));
  if (R.service) console.log('service:', JSON.stringify(R.service));
}
