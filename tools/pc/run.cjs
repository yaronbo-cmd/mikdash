// tools/pc/run.cjs — the test runs on a home PC with no assistant on it: plays the jobs of tools/pc/jobs.json with the probe
// (tools/probe109.cjs) on the machine's own graphics card, some at once, and writes out/pc/summary.txt (a short text that is read
// from afar) beside each job's log and stills (out/pc/<name>.log, out/pc/<name>/). Started by run-tests.cmd; `node tools/pc/run.cjs`.
// DRY=1: the plan is printed and nothing is run.
const { spawn, execSync } = require('child_process');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), OUT = path.join(ROOT, 'out', 'pc');
const plan = JSON.parse(fs.readFileSync(path.join(__dirname, 'jobs.json'), 'utf8'));
const git = (a) => { try { return execSync('git ' + a, { cwd: ROOT }).toString().trim(); } catch (e) { return '?'; } };
/** Windows: Playwright's headless shell (its full chrome.exe is blocked there); elsewhere the probe's own default */
function exe() {
  if (process.env.PROBE_EXE) return process.env.PROBE_EXE;
  if (process.platform !== 'win32') return null;
  const base = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  let dirs = []; try { dirs = fs.readdirSync(base).filter((d) => /^chromium_headless_shell-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1]); } catch (e) { /* */ }
  for (const d of dirs) { const p = path.join(base, d, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'); if (fs.existsSync(p)) return p; }
  return null;
}
const KEEP = /STUCK|bot RES|bot done|\bend \S+ stars|^\[\d+s\] loss |no errors|PAGEERR|PAGE CRASHED|TimeoutError|renderer|wall |MODAL|EVALERR|console error/;
function digest(name) {
  let txt = ''; try { txt = fs.readFileSync(path.join(OUT, name + '.log'), 'utf8'); } catch (e) { return ['  (no log)']; }
  const L = txt.split(/\r?\n/), keep = L.filter((l) => KEEP.test(l)).map((l) => '  ' + l.slice(0, 700));
  let shots = 0; try { shots = fs.readdirSync(path.join(OUT, name)).filter((f) => f.endsWith('.png')).length; } catch (e) { /* */ }
  return [...keep.slice(0, 120), `  stills: ${shots} · log lines: ${L.length} · last line: ${(L.filter(Boolean).pop() || '').slice(0, 200)}`];
}
function run(job) {
  return new Promise((done) => {
    const dir = path.join(OUT, job.name), log = path.join(OUT, job.name + '.log');
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const env = { ...process.env, PROBE_GPU: '1' }; const x = exe(); if (x) env.PROBE_EXE = x; if (job.mouse) env.MOUSE = '1'; else delete env.MOUSE;
    const t0 = Date.now(), fd = fs.openSync(log, 'w');
    console.log(`start  ${job.name}`);
    const p = spawn(process.execPath, [path.join('tools', 'probe109.cjs'), job.script, dir, String(job.w || 960), String(job.h || 600)], { cwd: ROOT, env, stdio: ['ignore', fd, fd] });
    const kill = setTimeout(() => { try { p.kill(); } catch (e) { /* */ } }, (job.maxMin || 240) * 60000);
    p.on('exit', (code) => { clearTimeout(kill); fs.closeSync(fd); const min = ((Date.now() - t0) / 60000).toFixed(1); console.log(`end    ${job.name}  ${min} min  exit ${code}`); done({ job, code, min }); });
  });
}
(async () => {
  const head = git('log --oneline -1'), jobs = plan.jobs || [], lanes = Math.max(1, plan.lanes | 0 || 2);
  console.log(`commit ${head}\n${jobs.length} runs, ${lanes} at a time\n`);
  if (process.env.DRY) { for (const j of jobs) console.log('would run', JSON.stringify(j)); console.log('exe', exe()); return; }
  fs.mkdirSync(OUT, { recursive: true });
  const sum = path.join(OUT, 'summary.txt'), T0 = new Date();
  fs.writeFileSync(sum, `RUNNING since ${T0.toISOString()} · commit ${head} · plan ${plan.id || ''}\n`);
  const res = []; let i = 0;
  await Promise.all(Array.from({ length: Math.min(lanes, jobs.length) }, async () => { while (i < jobs.length) res.push(await run(jobs[i++])); }));
  const out = [`DONE ${new Date().toISOString()} (started ${T0.toISOString()}) · commit ${head} · plan ${plan.id || ''} · exe ${exe() || 'default'}`];
  for (const r of res.sort((a, b) => jobs.indexOf(a.job) - jobs.indexOf(b.job))) out.push('', `== ${r.job.name} · ${r.job.script} · ${r.job.mouse ? 'mouse' : 'touch'} ${r.job.w || 960}x${r.job.h || 600} · ${r.min} min · exit ${r.code}`, ...digest(r.job.name));
  fs.writeFileSync(sum, out.join('\n') + '\n');
  console.log('\nsummary: out/pc/summary.txt');
})();
