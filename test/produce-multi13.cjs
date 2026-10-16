// PRODUCER13: two owner-path harnesses in one queue ticket, one after the other (the queue gives the producer one run per ~22 min).
//   node test/produce-multi13.cjs --runs='[["produce-games13.cjs","--tag=g13","--budget=290"],["produce-phaseb13.cjs","--tag=pb1","--budget=270"]]'
// Each harness runs as its own node process with its own browser and budget; their outputs are theirs (<tag>-log.json, shots).
const { spawnSync } = require('child_process');
const path = require('path'), fs = require('fs');
const A = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true]; }));
try { const f = path.join(__dirname, 'out/produce', (A.tag || 'multi') + '.args.json'); if (fs.existsSync(f)) Object.assign(A, JSON.parse(fs.readFileSync(f, 'utf8'))); } catch (e) { console.log('args file: ' + e.message); }
const runs = typeof A.runs === 'string' ? JSON.parse(A.runs) : A.runs || [];
const T0 = Date.now();
for (const [file, ...argv] of runs) {
  console.log(`\n===== ${Math.round((Date.now() - T0) / 1000)}s ${file} ${argv.join(' ')}`);
  const r = spawnSync(process.execPath, [path.join(__dirname, file), ...argv], { stdio: 'inherit', env: process.env });
  console.log(`===== ${file} rc=${r.status}`);
}
