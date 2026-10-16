// HOOK19: the music's pulse at EVERY stage, in the real game (dist/test.html, 844×390, real touch not needed): for each of the 15 stages
// the fixture puts him there (the stages before it done, this one in its courses), twin ON, and the live music is read:
//   · twin on → state 'work' at 124 BPM (day and night; the night is the same pulse, only its colour — music.js workN)
//   · a minigame sheet over the work (.fx-mg) does not take the pulse away
//   · twin off → the old calm (day 'build', night 'night'), and back on → 'work'
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/music-stages.cjs [--time=noon|night] [--stages=wall,gates] [--no-build]
//   run it through the bus: /home/claude/wt/bus/brun node test/music-stages.cjs --time=night
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
const TIME = (args.find((a) => a.startsWith('--time=')) || '--time=noon').slice(7), NIGHT = TIME === 'night';
const ALL = ['har', 'wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka', 'yesod', 'sovev', 'guf', 'karnot', 'kiyor', 'ulam', 'heichal', 'kodesh'];
const STAGES = (args.find((a) => a.startsWith('--stages=')) || '').slice(9).split(',').filter(Boolean);
const LIST = STAGES.length ? STAGES : ALL;
const results = [], rows = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript((TIME) => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = TIME; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      try { localStorage.clear(); } catch (e) { /* blocked */ }
    }, TIME);
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    await G(() => { const c = document.querySelector('.gm-cine'); if (c) c.click(); });
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(600);
    await G(() => { window.dispatchEvent(new Event('pointerdown')); });
    const live = await waitFor(() => __BH_MUSIC.get().running, null, 8000);
    check('the live music runs on a context (the probe reads the playing state, not only the wish)', live, JSON.stringify(await G(() => { const g = __BH_MUSIC.get(); return [g.running, g.state, g.want]; })));
    const read = () => G(() => { const g = __BH_MUSIC.get(); return { state: g.state, want: g.want, bpm: g.bpm, night: g.night, tw: !!document.querySelector('.tw-on') }; });
    const settle = async (n = 6) => { for (let i = 0; i < n; i++) { await pg.waitForTimeout(500); } };
    for (const site of LIST) {
      const tag = `[${site} · ${TIME}]`;
      await G((site) => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
        for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
        g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: 4, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], chk: 4, insp: 0, w: 0, ph: 2 };
        g.focus = site; g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; g.econ = Object.assign(g.econ || {}, { card1: 1 });
        g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: {}, deals: { [site]: 2 }, sig: { [site]: 1 }, best: {} };
        __T.game._.resync();
      }, site);
      let on = await waitFor(() => window.__TWIN && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 12000);
      if (!on) { await G(() => __TWIN.force(true)); on = await waitFor(() => !!document.querySelector('.gm.tw-on'), null, 5000); }
      for (let k = 0; k < 4; k++) { const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (!m) break; await m.click().catch(() => {}); await pg.waitForTimeout(400); }
      await settle(5);
      const a = await read();
      // ── stages21 ── (the owner, 8.10, note 4) a stage's ground ready (phase → courses): the 6.5 s reveal was the moment's 72 BPM over the work — under two thumbs the 124 stays
      await G(() => { __BH_MUSIC.event('phase', { id: 'x', ph: 'courses' }, 'A'); __BH_MUSIC.event('reveal', {}, 'A'); }); await settle(3); const rv = await read();
      check(`[${site} · ${TIME}] a stage's reveal keeps the work at 124 BPM`, rv.state === 'work' && rv.bpm === 124 && rv.want === 'work', JSON.stringify(rv));
      await G(() => __BH_MUSIC.event('start', {}, 'A'));   // (the reveal's 6.5 s timer cleared: the next checks read the calm, not the reveal)
      // ── /stages21 ──
      // a minigame sheet over the work
      await G(() => { const d = document.createElement('div'); d.className = 'fx-mg on'; d.id = '__mgprobe'; document.body.appendChild(d); });
      await settle(3); const m1 = await read();
      await G(() => { const d = document.getElementById('__mgprobe'); if (d) d.remove(); });
      // twin off → the old calm; on → work again
      await G(() => __TWIN.force(false)); await settle(4); const off = await read();
      await G(() => __TWIN.force(null)); await settle(4); const back = await read();
      rows.push({ site, a, m1, off, back });
      check(`${tag} twin on → the work state at 124 BPM`, a.tw && a.state === 'work' && a.want === 'work' && a.bpm === 124, JSON.stringify(a));
      check(`${tag} under a minigame sheet the pulse stays`, m1.state === 'work' && m1.bpm === 124, JSON.stringify(m1));
      check(`${tag} twin off → ${NIGHT ? 'night' : 'build'} (the old calm), and back on → work`, off.want === (NIGHT ? 'night' : 'build') && back.want === 'work', JSON.stringify([off.want, off.state, off.bpm, back.want, back.state]));
    }
    check('no console errors', logs.length === 0, logs.slice(0, 2).join(' | '));
    console.log('\nstage          twin→state/bpm   +sheet           off→want/state/bpm');
    for (const r of rows) console.log(`${r.site.padEnd(14)} ${String(r.a.state + '/' + r.a.bpm).padEnd(16)} ${String(r.m1.state + '/' + r.m1.bpm).padEnd(16)} ${r.off.want}/${r.off.state}/${r.off.bpm}`);
  } finally { await b.close(); }
  const bad = results.filter((x) => !x).length;
  console.log(`${results.length - bad}/${results.length} passed`);
  process.exit(bad ? 1 : 0);
})();
