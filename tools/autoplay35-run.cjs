// ── recovered (R9) ── autoplay35-run — the autoplayer's runner: a page in headless Chromium (SwiftShader), a returning player's save, the
// start screen's play, tools/autoplay35.js injected and started; the morning per phase, the events, screenshots.
// Run ONLY through the browser queue:  /home/claude/wt/bus/brun node tools/autoplay35-run.cjs [options]
//   --run NAME      the run's name (its folder)                         --page FILE   the page (default out/index.html; node tools/mkout.cjs)
//   --minutes N     wall minutes at most (default 4)                    --shots K     screenshots spread over the run (default 3)
//   --human         a child's hand (slower, misjudges sometimes)        --seed S      Math.random's and the hand's seed (default 1)
//   --continue      go on with the run's saved day (its storage.json)   --sound       sounds on (the page's autoplay; __SFX26C counted)
//   --days D        sunsets to play through (default 1: the morning and the first day)    --morning   stop at the morning's end (his role done)
//   --day N         start on day N's morning: the save as after N−1 mornings (day33state: day N−1 ended; roles23/roles26: the lots'
//                   counts and history — P23.open / P26.open: day 2 the pyre and the inner altar, day 3 the lamb and the menorah)
//   --q LEVEL       the page's quality (window.__FORCE_Q; default low — SwiftShader draws 'high' at a frame in seconds; the game's logic
//                   is the same at every level)          --size WxH    the viewport (default 640x296)
//   --frames        play on the page's own render loop (default: the world simulated without drawing — main.js __T.simulate, 0.05 s steps
//                   in real time — and a frame drawn only for a screenshot: SwiftShader takes seconds a frame)
// Writes /tmp/claude-0/-home-claude/92bf52df-7cb5-51be-8ceb-ea3690eaf336/auto/<run>/ — log.json (the morning's table, the marks, the events, the
// notes, the page's errors), shot-<i>.png, storage.json; and prints the table.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] != null && !args[i + 1].startsWith('--') ? args[i + 1] : d; };
const flag = (k) => args.includes(k);
const run = opt('--run', 'run'), page = path.resolve(opt('--page', 'out/index.html')), minutes = +opt('--minutes', 4), shots = +opt('--shots', 3);
const Q = opt('--q', 'low'), [VW, VH] = opt('--size', '640x296').split('x').map(Number);
const frames = flag('--frames');
const human = flag('--human'), cont = flag('--continue'), sound = flag('--sound'), seed = +opt('--seed', 1) || 1, days = +opt('--days', 1) || 1, morningOnly = flag('--morning'), dayN = +opt('--day', 0) || 0;
const OUT = path.join('/tmp/claude-0/-home-claude/92bf52df-7cb5-51be-8ceb-ea3690eaf336/auto', run);
fs.mkdirSync(OUT, { recursive: true });
const store = path.join(OUT, 'storage.json');

(async () => {
  const t0 = Date.now(), el = () => ((Date.now() - t0) / 1000).toFixed(1) + 's';
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', ...(sound ? ['--autoplay-policy=no-user-gesture-required'] : ['--mute-audio'])] });
  const ctx = await b.newContext({ viewport: { width: VW, height: VH }, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const saved = cont && fs.existsSync(store) ? JSON.parse(fs.readFileSync(store, 'utf8')) : null;
  // the save after N−1 mornings (day 1: none): the tasks of P23.open and the roles of P26.open, each once, at full mastery
  const T23 = ['deshen', 'm22', 'lamb'], R26 = ['menorah', 'inner', 'menorah'], past = Math.max(0, Math.min(3, dayN - 1));
  const roles23 = { m: past, h: T23.slice(0, past).map((id, i) => [i + 1, id, id]) }, roles26 = { m: past, h: R26.slice(0, past).map((id, i) => [i + 1, id]) };
  for (const id of [...T23.slice(0, past), ...R26.slice(0, past)]) roles23[id] = { n: ((roles23[id] && roles23[id].n) | 0) + 1, best: 100, last: 100 };
  const pre = past ? { shift: { day33state: { day: dayN - 1, night: true, at: Date.now() }, roles23, roles26 } } : {};   // (the shift's save: A.shift, shift/index.js shiftSave)
  await ctx.addInitScript(({ seed, saved, sound, Q, pre }) => {
    window.__FORCE_Q = Q;
    // a seeded Math.random (the day's lots, lambs and logs repeat for a seed) and the save: a returning player's, or the run's own
    let a = seed >>> 0; Math.random = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    try {
      if (!sessionStorage.getItem('auto35')) {
        sessionStorage.setItem('auto35', '1'); localStorage.clear();
        if (saved) for (const [k, v] of Object.entries(saved)) localStorage.setItem(k, v);
        else localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, name: 'דרור', mishmar: 5, seenIntro: true, created: Date.now(), lastSeen: Date.now(), ...pre }));
      }
    } catch (e) { /* */ }
    if (sound) globalThis.__SFX26C = {};
  }, { seed, saved, sound, Q, pre });
  const pg = await ctx.newPage();
  const errors = [];
  pg.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 300)); });
  pg.on('pageerror', (e) => errors.push('PAGEERR ' + String(e.message).slice(0, 300)));
  console.log('auto35', run, path.relative(process.cwd(), page), human ? 'human' : 'normal', 'seed', seed, cont ? '(continue)' : '');
  await pg.goto('file://' + page, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 240000, polling: 1000 });
  console.log('booted', el());
  await pg.waitForSelector('.lb-play', { timeout: 120000 });
  await pg.waitForTimeout(1500);
  await pg.click('.lb-play', { force: true });
  await pg.waitForFunction(() => globalThis.__SHIFT && globalThis.__SHIFT.E && globalThis.__SHIFT.E.st33 && globalThis.__SHIFT.E.st33.phase === 'run', null, { timeout: 120000, polling: 250 });
  console.log('the day began', el());
  if (dayN) console.log('day', await pg.evaluate(() => globalThis.__SHIFT.E.st33.day));
  if (!frames) await pg.evaluate(() => { window.__T.pause(true); window.__T.simulate(true, 0.05); });
  await pg.addScriptTag({ path: path.join(__dirname, 'autoplay35.js') });
  await pg.evaluate(({ human, seed, days }) => { globalThis.__AUTO35_P = globalThis.__AUTO35.start({ human, seed, days }).then((t) => { globalThis.__AUTO35_T = t; }); }, { human, seed, days });
  const end = t0 + minutes * 60000, shotAt = Array.from({ length: shots }, (_, i) => t0 + ((i + 1) / (shots + 1)) * (end - t0));
  let shot = 0, last = '';
  for (;;) {
    await pg.waitForTimeout(2000);
    const s = await pg.evaluate(() => globalThis.__AUTO35.state()).catch(() => null);
    if (s) { const line = `${el()} t ${s.t} ${s.phase} marks ${Object.keys(s.marks).join(',')}${s.err ? ' ERR ' + s.err.slice(0, 80) : ''}`; if (line.slice(line.indexOf(' t ')) !== last) { console.log(line); last = line.slice(line.indexOf(' t ')); } }
    while (shot < shots && Date.now() >= shotAt[shot]) { if (!frames) await pg.evaluate(() => window.__T.render()).catch(() => {}); await pg.screenshot({ path: path.join(OUT, `shot-${shot}.png`), timeout: 240000 }).catch(() => {}); console.log('shot', shot, el()); shot++; }
    const done = (morningOnly && s && s.marks.roleDone != null) || await pg.evaluate(() => !globalThis.__AUTO35.on).catch(() => false);
    if (done || Date.now() > end) break;
  }
  const res = await pg.evaluate(() => ({ state: globalThis.__AUTO35.state(), events: globalThis.__AUTO35.events(), trace: globalThis.__AUTO35.trace(), sfx: globalThis.__SFX26C || null, ls: Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])) }));
  await pg.evaluate(() => globalThis.__AUTO35.stop()).catch(() => {});
  while (shot < shots) { if (!frames) await pg.evaluate(() => window.__T.render()).catch(() => {}); await pg.screenshot({ path: path.join(OUT, `shot-${shot}.png`), timeout: 240000 }).catch(() => {}); shot++; }
  fs.writeFileSync(store, JSON.stringify(res.ls));
  const log = { run, page, human, seed, days, day: dayN || null, cont, sound, q: Q, size: [VW, VH], frames, wallS: Math.round((Date.now() - t0) / 1000), table: res.state.table, marks: res.state.marks, acts: res.state.acts, walks: res.state.walks, stuck: res.state.stuck, lag: res.state.lag, err: res.state.err, notes: res.state.notes, sfx: res.sfx, errors: errors.slice(0, 40), events: res.events, trace: res.trace };
  fs.writeFileSync(path.join(OUT, 'log.json'), JSON.stringify(log, null, 1));
  const tb = res.state.table;
  console.log('table', JSON.stringify({ role: tb.role, lot: tb.lot, preDawn: tb.preDawn, toLot: tb.toLot, lotS: tb.lot === undefined ? null : tb.lot, toGate: tb.toGate, gate: tb.gate, walkIn: tb.walkIn, act: tb.act, roleTotal: tb.roleTotal, morning: tb.morning }));
  console.log('marks', JSON.stringify(res.state.marks));
  console.log(errors.length ? 'errors:\n' + errors.slice(0, 10).join('\n') : 'no page errors', '·', el());
  await b.close();
})().catch((e) => { console.error('FAIL', e && e.stack || e); process.exit(1); });
