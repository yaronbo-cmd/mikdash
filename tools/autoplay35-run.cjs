// ── recovered (R9) ── autoplay35-run — the autoplayer's runner: a page in headless Chromium (SwiftShader), a returning player's save, the
// start screen's play, tools/autoplay35.js injected and started; the morning per phase, the events, screenshots.
// Run ONLY through the browser queue:  /home/claude/wt/bus/brun node tools/autoplay35-run.cjs [options]
//   --run NAME      the run's name (its folder)                         --page FILE   the page (default out/index.html; node tools/mkout.cjs)
//   --minutes N     wall minutes at most (default 4)                    --shots K     screenshots spread over the run (default 3)
//   --human         a child's hand (slower, misjudges sometimes)        --seed S      Math.random's and the hand's seed (default 1)
//   --continue      go on with the run's saved day (its storage.json)   --sound       sounds on (the page's autoplay; __SFX26C counted)
//   --days D        sunsets to play through (default 1: the morning and the first day)    --morning   stop at the morning's end (his role done)
//   --day N         start on day N's morning: the save as after N−1 mornings (day33state: day N−1 ended; roles23/roles26: the lots'
//                   counts and history — P23.open / P26.open: day 2 the pyre and the inner altar, day 3 the lamb and the menorah, day 4
//                   the shochet, day 5 the zorek (build 27))
//   --shots27 a,b   phase shots of the blood roles (bind, wait, cut, recv, carry, hold, aimNE, high, highCue, gammaNE, carry2, aimSW,
//                   gammaSW, pour, npcRecv, npcNE): the world frozen, a frame drawn, shot-<name>.png      --high27   the first throw over the
//                   thread      --book   at the end, the roles book opened and taken (shot-book.png)
//   --shots30 a,b   build 30's shots: k20, d21, men, inner, shochet, zorek (an act in progress, its one line), end-<id> (an act's end: the
//                   rating and the source line), src-<id> (the source's card, opened by a tap), sum (the day's summary)   --bad30 kiyor   three
//                   lifts at the laver (a טעון תיקון end)
//   --q LEVEL       the page's quality (window.__FORCE_Q; default low — SwiftShader draws 'high' at a frame in seconds; the game's logic
//                   is the same at every level)          --size WxH    the viewport (default 640x296)
//   --frames        play on the page's own render loop (default: the world simulated without drawing — main.js __T.simulate, 0.05 s steps
//                   in real time — and a frame drawn only for a screenshot: SwiftShader takes seconds a frame)
//   ── build 31 ── the roles book's practice:
//   --from RUN      start from another run's saved storage (its storage.json) — e.g. a morning played with --morning
//   --practice a,b  before the day: the full lobby, its roles book (shot-book31.png, shot-book31b.png — the second lot), "לתרגל" for each
//                   role in turn (kiyor deshen m22 lamb inner menorah shochet zorek), the bot plays the act (its --shots30 names: k20, d21,
//                   m22, lamb, men, inner, shochet, zorek — the act in progress with the "אימון" tag), the end card (shot-p31end-<role>.png),
//                   "חזרה" (or "עוד פעם" with --again31 ROLE: that role twice); the saved day compared before and after (byte by byte), the
//                   lobby's "המשך יום N" (shot-lobby31.png)          --resume31   then the lobby's play: the day goes on — its state compared
//                   with the saved one (shot-resumed31.png) and played on (--morning / --days as usual)     --sum31   after the resume, the
//                   day's end at once (E.debug.setFuel(10), E.debug.night(): the tamids not on time): the summary (shot-sum31.png) and its
//                   read-only roles book (shot-sumbook31.png)
//   --src31         at each end card, its source line tapped: end30's card (shot-src31-<role>.png), closed back to the end card
//   --pause31       in each run, the pause card (shot-pause31.png: "המשך", "מהתחלה", "חזרה לספר התפקידים"), then "המשך"
//   --book31 a,b    only the book: give the save these roles' records (a fresh save: a returning player who had them), open the book,
//                   shot-book31.png (its top), shot-book31b.png (the second lot's), shot-book31c.png (the first lot's doors), and stop.
//                   In a --practice run the shots are only those named in --shots30 (book31, book31b, book31c, p31end or p31end-<role>,
//                   lobby31): SwiftShader takes seconds a frame
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
const shots30 = (opt('--shots30', '') || '').split(',').filter(Boolean), bad30 = opt('--bad30', '');   // ── fable32 (build 30) ── (the build's shots; a poor act for a טעון תיקון end) ── /fable32 ──
const human = flag('--human'), cont = flag('--continue'), sound = flag('--sound'), seed = +opt('--seed', 1) || 1, days = +opt('--days', 1) || 1, morningOnly = flag('--morning'), dayN = +opt('--day', 0) || 0, shots27 = (opt('--shots27', '') || '').split(',').filter(Boolean), high27 = flag('--high27'), book = flag('--book');
const OUT = path.join('/tmp/claude-0/-home-claude/92bf52df-7cb5-51be-8ceb-ea3690eaf336/auto', run);
fs.mkdirSync(OUT, { recursive: true });
const store = path.join(OUT, 'storage.json');
// ── fable32 (build 31) ── the practice runs ── /fable32 ──
const src31 = flag('--src31'), pause31 = flag('--pause31');   // ── fable32 (build 31) ── (the end card's source line tapped; the pause card in a run) ── /fable32 ──
const fromRun = opt('--from', ''), practice = (opt('--practice', '') || '').split(',').filter(Boolean), again31 = opt('--again31', ''), resume31 = flag('--resume31'), sum31 = flag('--sum31'), book31 = (opt('--book31', '') || '').split(',').filter(Boolean);
const fromStore = fromRun ? path.join(path.dirname(OUT), fromRun, 'storage.json') : null;
if (fromStore && !fs.existsSync(fromStore)) { console.log('FAIL --from: no storage at', fromStore); process.exit(2); }

(async () => {
  const t0 = Date.now(), el = () => ((Date.now() - t0) / 1000).toFixed(1) + 's';
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', ...(sound ? ['--autoplay-policy=no-user-gesture-required'] : ['--mute-audio'])] });
  const ctx = await b.newContext({ viewport: { width: VW, height: VH }, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const saved = fromStore && fs.existsSync(fromStore) ? JSON.parse(fs.readFileSync(fromStore, 'utf8')) : cont && fs.existsSync(store) ? JSON.parse(fs.readFileSync(store, 'utf8')) : null;   // ── fable32 (build 31) ── (--from: another run's) ── /fable32 ──
  // the save after N−1 mornings (day 1: none): the tasks of P23.open and the roles of P26.open, each once, at full mastery
  const T23 = ['deshen', 'm22', 'lamb', 'deshen', 'm22', 'lamb'], R26 = ['menorah', 'inner', 'menorah', 'shochet', 'zorek', 'menorah'], past = Math.max(0, Math.min(5, dayN - 1));
  const roles23 = { m: past, h: T23.slice(0, past).map((id, i) => [i + 1, id, id]) }, roles26 = { m: past, h: R26.slice(0, past).map((id, i) => [i + 1, id]) };
  for (const id of [...T23.slice(0, past), ...R26.slice(0, past)]) roles23[id] = { n: ((roles23[id] && roles23[id].n) | 0) + 1, best: 100, last: 100 };
  if (past) roles23.kiyor = { n: past, best: 100, last: 100 };   // ── fable32 (build 31) ── (the laver: every morning — build 30 rates it; its row in the roles book) ── /fable32 ──
  for (const id of book31) roles23[id] = roles23[id] || { n: 1, best: 100, last: 100 };   // ── fable32 (build 31) ── ── /fable32 ──
  const pre = past ? { shift: { day33state: { day: dayN - 1, night: true, at: Date.now() }, roles23, roles26 } } : book31.length ? { shift: { roles23, roles26 } } : {};   // (the shift's save: A.shift, shift/index.js shiftSave) ── fable32 (build 31) ── (--book31: the roles alone) ── /fable32 ──
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
  // ── fable32 (build 31) ── the roles book's practice: the book (its doors, its locked roles), each role's run by the bot, its end card,
  // "חזרה"; the saved day before and after; then (--resume31) the day itself ── /fable32 ──
  const P31 = { results: [], before: null, after: null, same: null, doors: null, locked: null, resumed: null, sum: null };
  const snap31 = async (name) => { await pg.evaluate(() => window.__T.render()).catch(() => {}); await pg.screenshot({ path: path.join(OUT, `shot-${name}.png`), timeout: 240000 }).catch(() => {}); console.log('shot', name, el()); };
  const pump31 = async (cond, ms, arg) => { const t1 = Date.now(); for (;;) { const req = await pg.evaluate(() => globalThis.__AUTO35 && globalThis.__AUTO35.shotReq).catch(() => null); if (req) { await snap31(req); await pg.evaluate(() => globalThis.__AUTO35.shotTaken()).catch(() => {}); continue; } const v = await pg.evaluate(cond, arg).catch(() => null); if (v) return v; if (Date.now() - t1 > ms) return null;
      if (Date.now() - (pump31.last || 0) > 10000) { pump31.last = Date.now(); const q = await pg.evaluate(() => { const E = globalThis.__SHIFT && globalThis.__SHIFT.E, st = E && E.st33, A = globalThis.__AUTO35 && globalThis.__AUTO35.state(); return st ? `t ${st.t.toFixed(1)} paused ${!!st.paused} k20 ${st.k20 && st.k20.ph} d21 ${st.d21 && st.d21.ph} m22 ${st.m22 && st.m22.ph} p25 ${st.p25 && st.p25.ph} r26 ${st.r26 && st.r26.ph} r27 ${st.r27 && st.r27.ph} end ${!!(E.p31 && E.p31() && E.p31().end)} card ${!!document.querySelector('.p31-end')} pause ${!!document.querySelector('.sh-pause')} bot ${A && A.on} ${A && A.phase} ${A && A.err ? A.err.slice(0, 120) : ''}` : 'no engine'; }).catch((e) => 'eval ' + e.message); console.log('  ·', el(), q); }
      await pg.waitForTimeout(250); } };
  const save31 = () => pg.evaluate(() => { try { const A = JSON.parse(localStorage.getItem('bh_avodah') || '{}'), s = A.shift || {}, r = s.roles23 || {}; return { day: JSON.stringify(s.day33state || null), lot: JSON.stringify([r.m, r.h, s.roles26 || null]), served30: s.served30, perutot: s.perutot, badges33: JSON.stringify(s.badges33 || null), shop: JSON.stringify(s.day33 || null), roles: Object.fromEntries(Object.entries(r).filter(([k]) => k !== 'm' && k !== 'h').map(([k, v]) => [k, { n: v.n, pr: v.pr | 0, best: v.best, r30: v.r30 || null }])), label: (((document.querySelector('.lb-play') || {}).textContent || '').match(/המשך יום \d+|משחק/) || [''])[0] }; } catch (e) { return { err: String(e) }; } });
  const writeLog31 = async () => {   // (the log, and the page's storage — the next run's --from)
    const ls = await pg.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)]))).catch(() => null);
    if (ls) fs.writeFileSync(store, JSON.stringify(ls));
    fs.writeFileSync(path.join(OUT, 'log.json'), JSON.stringify({ run, page, human, seed, from: fromRun || null, practice, p31: P31, errors: errors.slice(0, 40) }, null, 1));
  };
  if (practice.length || book31.length) {
    if (!frames) await pg.evaluate(() => { window.__T.pause(true); window.__T.simulate(true, 0.05); });
    await pg.addScriptTag({ path: path.join(__dirname, 'autoplay35.js') });
    P31.before = await save31(); console.log('before', P31.before.label, P31.before.day.slice(0, 200));
    if (await pg.$('[data-lb=home]')) { await pg.click('[data-lb=home]', { force: true }); await pg.waitForTimeout(600); }
    await pg.click('[data-lb=roles]', { force: true }); await pg.waitForSelector('.p23-bk', { timeout: 30000 }); await pg.waitForTimeout(500);
    P31.doors = await pg.evaluate(() => [...document.querySelectorAll('.p23-bk [data-p31]')].map((b) => `${b.dataset.p31}:${Math.round(b.getBoundingClientRect().height)}px`));
    P31.locked = await pg.evaluate(() => [...document.querySelectorAll('.p23-bk .q.lk')].map((q) => q.textContent.trim().replace(/\s+/g, ' ')));
    console.log('doors', P31.doors.join(' '), '| locked', P31.locked.join(' · '));
    const want31 = (n) => !practice.length || shots30.includes(n);   // (in a practice run only the shots asked for: SwiftShader takes seconds a frame)
    if (want31('book31')) await snap31('book31');
    if (want31('book31b')) { await pg.evaluate(() => { const h = document.querySelector('.p23-bk h4'); if (h) h.scrollIntoView(); }).catch(() => {}); await snap31('book31b'); }
    if (want31('book31c')) { await pg.evaluate(() => { const g = document.querySelector('.p23-bk .g .p31') || document.querySelector('.p23-bk .g'); if (g) g.scrollIntoView({ block: 'center' }); }).catch(() => {}); await snap31('book31c'); }
    if (!practice.length) { await writeLog31(); console.log(errors.length ? 'errors:\n' + errors.slice(0, 10).join('\n') : 'no page errors', '·', el()); await b.close(); return; }
    for (const role of practice) {
      for (let rep = 0; rep < (again31 === role ? 2 : 1); rep++) {
        if (rep === 0) {
          await pg.waitForSelector(`.p23-bk [data-p31="${role}"]`, { timeout: 30000 });
          await pg.evaluate((r) => document.querySelector(`.p23-bk [data-p31="${r}"]`).scrollIntoView({ block: 'center' }), role);
          await pg.click(`.p23-bk [data-p31="${role}"]`, { force: true });
        }
        const w0 = Date.now();
        await pg.waitForFunction((r) => globalThis.__SHIFT && globalThis.__SHIFT.E && globalThis.__SHIFT.E.prac31 === r && globalThis.__SHIFT.E.st33.phase === 'run', role, { timeout: 60000, polling: 200 });
        if (!frames) await pg.evaluate(() => { window.__T.pause(true); window.__T.simulate(true, 0.05); });
        await pg.evaluate((o) => { globalThis.__AUTO35.stop(); globalThis.__AUTO35_P = globalThis.__AUTO35.start(o).catch((e) => { if (!/^stopped$/.test(String(e && e.message))) throw e; }); }, { human, seed: seed + P31.results.length, practice: true, shots30 });
        if (pause31 && rep === 0) {   // (the pause card in a practice run: "המשך", "מהתחלה", "חזרה לספר התפקידים")
          await pg.waitForTimeout(3000); await pg.click('.sh-pbtn', { force: true }).catch(() => {}); await pg.waitForSelector('.sh-pause', { timeout: 10000 }).catch(() => {});
          P31.pause = await pg.evaluate(() => ({ paused: globalThis.__SHIFT.E.st33.paused, text: ((document.querySelector('.sh-pause') || {}).textContent || '').replace(/\s+/g, ' ').slice(0, 200), back: [...document.querySelectorAll('.sh-pause [data-sh=backP]')].map((x) => Math.round(x.getBoundingClientRect().height)) }));
          console.log('pause', JSON.stringify(P31.pause)); await snap31('pause31'); await pg.click('.sh-pause [data-sh=resume]', { force: true }).catch(() => {});
        }
        const ok = await pump31(() => !!document.querySelector('.p31-end') && !globalThis.__AUTO35.on, Math.max(60000, (minutes * 60000) / Math.max(1, practice.length)));
        const s = await pg.evaluate(() => { const E = globalThis.__SHIFT.E, A = globalThis.__AUTO35.state(); return { p31: E.p31(), t: Math.round(E.st33.t * 10) / 10, a: { stuck: A.stuck, err: A.err, marks: A.marks, rate: A.rate, notes: A.notes }, tag: !!document.querySelector('.f17-top .p31-tag'), fire: (() => { const f = document.querySelector('.f17-fire'); return f ? getComputedStyle(f).display : null; })(), card: ((document.querySelector('.p31-end') || {}).textContent || '').replace(/\s+/g, ' ').slice(0, 220), btn: [...document.querySelectorAll('.p31-end button')].map((x) => `${x.dataset.p31}:${Math.round(x.getBoundingClientRect().height)}`) }; });
        const done = s.p31 && s.p31.done, m = s.a.marks || {}, inAt = m.k20pose != null ? m.k20pose : m.actIn;
        const r = { role, rep, ok: !!ok, rating: done ? done.rating : null, q: done ? done.q : null, act: done && inAt != null && m.p31end != null ? Math.round((m.p31end - inAt) * 10) / 10 : null, end: s.t, wallS: Math.round((Date.now() - w0) / 100) / 10, stuck: s.a.stuck, err: s.a.err, tag: s.tag, fire: s.fire, btn: s.btn, card: s.card, coins: (s.a.rate || []).map((x) => x[4]) };
        P31.results.push(r); console.log('practice', JSON.stringify(r));
        if (rep === 0 && (shots30.includes('p31end') || shots30.includes(`p31end-${role}`))) await snap31(`p31end-${role}`);
        if (src31 && rep === 0) {   // (the source line: a tap opens end30's card of the act's lines, over the end card; "סגור" back to it)
          await pg.click('.p31-end [data-p31=src]', { force: true }).catch(() => {}); await pg.waitForSelector('.r30-c', { timeout: 10000 }).catch(() => {});
          r.src = await pg.evaluate(() => ((document.querySelector('.r30-c') || {}).textContent || '').replace(/\s+/g, ' ').slice(0, 300)); console.log('source card', r.src);
          await snap31(`src31-${role}`); await pg.click('.r30-c button', { force: true }).catch(() => {}); await pg.waitForTimeout(300);
          r.srcBack = await pg.evaluate(() => !document.querySelector('.r30-c') && !!document.querySelector('.p31-end'));
        }
        if (rep === 1) { r.again = true; }
        await pg.evaluate(() => globalThis.__AUTO35.stop()).catch(() => {});
        if (again31 === role && rep === 0) { await pg.click('.p31-end [data-p31=again]', { force: true }); await pg.waitForTimeout(400); continue; }
        await pg.click('.p31-end [data-p31=back]', { force: true });
        await pg.waitForSelector('.p23-bk', { timeout: 60000 }); await pg.waitForTimeout(400);
      }
    }
    await pg.click('.p23-bk [data-p23=close]', { force: true }).catch(() => {}); await pg.waitForTimeout(800);
    P31.after = await save31();
    P31.same = { day: P31.after.day === P31.before.day, label: P31.after.label === P31.before.label, lot: P31.after.lot === P31.before.lot, served30: P31.after.served30 === P31.before.served30, perutot: P31.after.perutot === P31.before.perutot, badges: P31.after.badges33 === P31.before.badges33, shop: P31.after.shop === P31.before.shop };
    console.log('the saved day after the practice', JSON.stringify(P31.same), '|', P31.after.label);
    console.log('roles before', JSON.stringify(P31.before.roles)); console.log('roles after ', JSON.stringify(P31.after.roles));
    if (shots30.includes('lobby31')) await snap31('lobby31');
    if (!resume31) { await writeLog31(); console.log(errors.length ? 'errors:\n' + errors.slice(0, 10).join('\n') : 'no page errors', '·', el()); await b.close(); return; }
  }
  // ── /fable32 ──
  await pg.click('.lb-play', { force: true });
  await pg.waitForFunction(() => globalThis.__SHIFT && globalThis.__SHIFT.E && globalThis.__SHIFT.E.st33 && globalThis.__SHIFT.E.st33.phase === 'run', null, { timeout: 120000, polling: 250 });
  console.log('the day began', el());
  if (dayN) console.log('day', await pg.evaluate(() => globalThis.__SHIFT.E.st33.day));
  // ── fable32 (build 31) ── the day after the practice runs: where it was? (its saved state against the engine's, key by key) ── /fable32 ──
  if (resume31) {
    await pg.waitForTimeout(1500);
    P31.resumed = await pg.evaluate((saved) => { const E = globalThis.__SHIFT.E, st = E.st33, s = JSON.parse(saved || 'null') || {}, keys = ['day', 'fed', 'level', 'logs', 'washed', 'p23day', 'lot', 'd21day', 'm22day', 'p25day', 'p26day', 'role26', 'r26day', 'perutot', 'tamids'], out = {}; for (const k of keys) out[k] = [s[k] === undefined ? null : s[k], st[k] === undefined ? null : st[k]]; return { prac31: E.prac31, resumed: st.resumed, tasks: E.state().tasks, saved: s.tasks || null, cmp: out, same: keys.every((k) => s[k] === undefined || JSON.stringify(s[k]) === JSON.stringify(st[k])) }; }, P31.after ? P31.after.day : null);
    console.log('resumed', JSON.stringify(P31.resumed));
    await snap31('resumed31');
    if (sum31) {
      await pg.evaluate(() => { const E = globalThis.__SHIFT.E; E.debug.setFuel(10); E.debug.night(); });   // (the fire low at the jump to sunset: the tamids not on time — the summary's wording for them)
      await pg.waitForSelector('.f17-sum', { timeout: 60000 }).catch(() => {}); await pg.waitForTimeout(2600);
      P31.sum = await pg.evaluate(() => ((document.querySelector('.f17-sum') || {}).textContent || '').replace(/\s+/g, ' ').slice(0, 600));
      console.log('summary', P31.sum);
      await snap31('sum31');
      await pg.click('.f17-sum [data-f17=book]', { force: true }).catch(() => {}); await pg.waitForTimeout(600);
      P31.sumBook = await pg.evaluate(() => ({ doors: document.querySelectorAll('.p23-bk [data-p31]').length, note: ((document.querySelector('.p23-bk .n31') || {}).textContent || '') }));
      console.log('summary book', JSON.stringify(P31.sumBook));
      await snap31('sumbook31');
      await writeLog31(); console.log(errors.length ? 'errors:\n' + errors.slice(0, 10).join('\n') : 'no page errors', '·', el()); await b.close(); return;
    }
  }
  // ── /fable32 ──
  if (!frames) await pg.evaluate(() => { window.__T.pause(true); window.__T.simulate(true, 0.05); });
  await pg.addScriptTag({ path: path.join(__dirname, 'autoplay35.js') });
  await pg.evaluate(({ human, seed, days, shots27, high27, shots30, bad30 }) => { globalThis.__AUTO35_P = globalThis.__AUTO35.start({ human, seed, days, shots27, high27, shots30, bad30 }).then((t) => { globalThis.__AUTO35_T = t; }).catch((e) => { if (!/^stopped$/.test(String(e && e.message))) throw e; }); }   /* (build 27: the bot's own "stopped" at the run's end — an --book run lived long enough to report it — is not the page's error) */, { human, seed, days, shots27, high27, shots30, bad30 });
  const end = t0 + minutes * 60000, shotAt = Array.from({ length: shots }, (_, i) => t0 + ((i + 1) / (shots + 1)) * (end - t0));
  let shot = 0, last = '';
  let lastPoll = 0;
  for (;;) {
    await pg.waitForTimeout(300);
    // a phase shot (build 27): the bot froze the world — draw a frame, take it, let it go on
    const req = await pg.evaluate(() => globalThis.__AUTO35.shotReq).catch(() => null);
    if (req) {
      await pg.evaluate(() => window.__T.render()).catch(() => {});
      await pg.screenshot({ path: path.join(OUT, `shot-${req}.png`), timeout: 240000 }).catch(() => {});
      console.log('shot', req, el());
      await pg.evaluate(() => globalThis.__AUTO35.shotTaken()).catch(() => {});
      continue;
    }
    if (Date.now() - lastPoll < 2000) continue;
    lastPoll = Date.now();
    const s = await pg.evaluate(() => globalThis.__AUTO35.state()).catch(() => null);
    if (s) { const line = `${el()} t ${s.t} ${s.phase} marks ${Object.keys(s.marks).join(',')}${s.err ? ' ERR ' + s.err.slice(0, 80) : ''}`; if (line.slice(line.indexOf(' t ')) !== last) { console.log(line); last = line.slice(line.indexOf(' t ')); } }
    while (shot < shots && Date.now() >= shotAt[shot]) { if (!frames) await pg.evaluate(() => window.__T.render()).catch(() => {}); await pg.screenshot({ path: path.join(OUT, `shot-${shot}.png`), timeout: 240000 }).catch(() => {}); console.log('shot', shot, el()); shot++; }
    const done = (morningOnly && s && s.marks.roleDone != null && !(s.pend30 > 0)) || await pg.evaluate(() => !globalThis.__AUTO35.on).catch(() => false);   // ── fable32 (build 30) ── (an end's shot still to take: wait for it) ── /fable32 ──
    if (done || Date.now() > end) break;
  }
  const res = await pg.evaluate(() => ({ state: globalThis.__AUTO35.state(), events: globalThis.__AUTO35.events(), trace: globalThis.__AUTO35.trace(), sfx: globalThis.__SFX26C || null, ls: Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])) }));
  await pg.evaluate(() => globalThis.__AUTO35.stop()).catch(() => {});
  while (shot < shots) { if (!frames) await pg.evaluate(() => window.__T.render()).catch(() => {}); await pg.screenshot({ path: path.join(OUT, `shot-${shot}.png`), timeout: 240000 }).catch(() => {}); shot++; }
  if (book) {
    await pg.evaluate(() => { try { window.__T.simulate(false); globalThis.__SHIFT.roles(); } catch (e) { /* */ } }).catch(() => {}); await pg.waitForTimeout(600);
    await pg.screenshot({ path: path.join(OUT, 'shot-book.png'), timeout: 240000 }).catch(() => {});
    await pg.evaluate(() => { try { document.querySelector('.p23-bk h4').scrollIntoView(); } catch (e) { /* */ } }).catch(() => {}); await pg.waitForTimeout(300);
    await pg.screenshot({ path: path.join(OUT, 'shot-book2.png'), timeout: 240000 }).catch(() => {}); console.log('shot book', el());
  }
  fs.writeFileSync(store, JSON.stringify(res.ls));
  const log = { run, page, human, seed, days, day: dayN || null, cont, sound, q: Q, size: [VW, VH], frames, wallS: Math.round((Date.now() - t0) / 1000), table: res.state.table, marks: res.state.marks, ratings: res.state.rate || [], acts: res.state.acts, walks: res.state.walks, stuck: res.state.stuck, lag: res.state.lag, err: res.state.err, notes: res.state.notes, sfx: res.sfx, errors: errors.slice(0, 40), events: res.events, trace: res.trace, p31: P31 /* ── fable32 (build 31) ── */ };
  fs.writeFileSync(path.join(OUT, 'log.json'), JSON.stringify(log, null, 1));
  const tb = res.state.table;
  console.log('table', JSON.stringify({ role: tb.role, lot: tb.lot, preDawn: tb.preDawn, toLot: tb.toLot, lotS: tb.lot === undefined ? null : tb.lot, toGate: tb.toGate, gate: tb.gate, walkIn: tb.walkIn, toRing: tb.toRing, ringToCut: tb.ringToCut, cutToNE: tb.cutToNE, neToSW: tb.neToSW, swToEnd: tb.swToEnd, act: tb.act, roleTotal: tb.roleTotal, morning: tb.morning, mastery: tb.r26r && tb.r26r.mastery, coins: tb.coins }));
  console.log('marks', JSON.stringify(res.state.marks));
  console.log('ratings', JSON.stringify(res.state.rate || []));   // ── fable32 (build 30) ── (each act's rating: [t, id, rating, q, coins]) ── /fable32 ──
  console.log(errors.length ? 'errors:\n' + errors.slice(0, 10).join('\n') : 'no page errors', '·', el());
  await b.close();
})().catch((e) => { console.error('FAIL', e && e.stack || e); process.exit(1); });
