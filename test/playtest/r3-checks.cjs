// Round 3 hooks, checked in the real HUD (HOOKS agent): the game harness (src/game over a fake world, no WebGL) and the
// scenes bot's page (the real scenes panel over a mock world). Each check prints PASS/FAIL; screenshots go to
// test/out/playtest/r3-*.png.
//   node test/playtest/r3-checks.cjs [--no-build]
// 1. the demo reel: the ✦ button counts the highlights; after the Heichal the camera keeps its shot (QA P2-20); the reel
//    ends on the outro (QA P1-4) with the two doors; no stray key moment inside a live highlight
// 2. the Ezrat Nashim done → the Ark mystery card (Shekalim 6:1–2) → "לחקור" opens the Ark tab
// 3. crews waiting at a blocked site → the cue → one tap moves them; the rest card offers the same
// 4. a caravan arriving in the session → a chime and a toast → one tap collects it
// 5. the scenes panel: stamps, "לתחנה הבאה", the door at each tab's end; the Phase B home announces Yom Kippur
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'test/out/playtest');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
if (!args.includes('--no-build')) {
  const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
  esbuild.buildSync({ entryPoints: [path.join(ROOT, 'test/game-harness-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(ROOT, 'test/out/game-harness.bundle.js'), logLevel: 'warning' });
  esbuild.buildSync({ entryPoints: [path.join(__dirname, 'scenes-bot-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(OUT, 'scenes-bot.bundle.js'), logLevel: 'warning' });
  esbuild.buildSync({ entryPoints: [path.join(ROOT, 'test/avodah-harness-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(ROOT, 'test/out/avodah-harness.bundle.js'), logLevel: 'warning' });
}
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + String(info).slice(0, 160) : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gamePage(b, { init = {}, demo = false } = {}) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
  const pg = await ctx.newPage();
  const errors = [];
  pg.on('pageerror', (e) => errors.push(e.message));
  pg.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.addInitScript(({ init, demo }) => {
    try { localStorage.clear(); if (demo) localStorage.setItem('bh_settings', JSON.stringify({ demo: true })); for (const [k, v] of Object.entries(init)) localStorage.setItem(k, v); } catch (e) { /* */ }
    window.__HK_FORCE = true; window.__OPENED = [];
    window.__openScenes = (k) => { window.__OPENED.push(k); return Promise.resolve(true); };
  }, { init, demo });
  await pg.goto('file://' + path.join(ROOT, 'test/game-harness.html') + '?fast=1&api12=1&tod=noon');
  await pg.waitForFunction(() => window.__H && window.__H.game && window.__H.game.state, null, { timeout: 20000 });
  return { ctx, pg, errors };
}
const E = (pg, fn, a) => pg.evaluate(fn, a);
const wf = (pg, fn, a, ms = 5000) => pg.waitForFunction(fn, a, { timeout: ms, polling: 100 }).then(() => true, () => false);
const dismissAll = async (pg, max = 8) => { for (let k = 0; k < max; k++) { const b = await pg.$('.gm-modal.on .gm-btn-gold'); if (!b) break; const t = await b.textContent(); if (/לחקור|העבודה בבית|סיור/.test(t)) break; await b.click(); await sleep(300); } };
/** click through the cards until `stop` matches the open card's text (or ms pass): the cards come on their own timers */
const cardsUntil = async (pg, stop, ms = 20000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const t = await E(pg, () => (document.querySelector('.gm-modal.on') || {}).textContent || '');
    if (t && stop.test(t)) return true;
    if (t) { await E(pg, () => { const m = document.querySelector('.gm-modal.on'); const b = m && (m.querySelector('.gm-btn-gold') || m.querySelector('.gm-btn')); if (b) b.click(); }); }
    await sleep(350);
  }
  return false;
};
const modalText = (pg) => E(pg, () => (document.querySelector('.gm-modal.on') || {}).textContent || '');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-first-run', '--disable-background-networking'] });
  try {
    /* ── 1. the demo reel ── */
    {
      const { ctx, pg, errors } = await gamePage(b, { demo: true });
      await wf(pg, () => __H.game.state.demo && __H.game.state.ftue >= 1);
      const label0 = await E(pg, () => document.querySelector('.gm-demo .gm-hl').textContent);
      check('reel: the ✦ button counts the highlights (1/8)', /1\/8/.test(label0.replace(/[⁦-⁩]/g, '')), label0);
      // jump to the House: every site but the Heichal and the Kodesh is done; the Heichal is next (a live highlight)
      await E(pg, () => { const g = __H.game.state; g.ftue = 99; for (const id of ['har', 'wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka', 'yesod', 'sovev', 'guf', 'karnot', 'kiyor', 'ulam']) g.st[id] = { done: true }; g.bh = g.bh.map(() => 0); g.crews = [{ at: null }, { at: null }, { at: null }]; __H.game._.resync(); });
      await sleep(300);
      const n0 = await E(pg, () => __H.world.calls.length);
      await pg.click('.gm-demo .gm-hl');
      const shone = await wf(pg, () => __H.world.calls.some((c) => c.fn === 'shine'), null, 6000);
      await wf(pg, () => !!document.querySelector('.gm-modal.on'), null, 5000);
      await dismissAll(pg);
      await sleep(1600);
      const focusAfter = await E(pg, (n0) => __H.world.calls.slice(n0).filter((c) => c.fn === 'focus').map((c) => c.args[0]), n0);
      const heichalFocusIdx = focusAfter.lastIndexOf('heichal');
      check('reel (QA P2-20): after "ההיכל בזהב" the camera keeps the Heichal until the next press', shone && !focusAfter.slice(heichalFocusIdx + 1).includes('kodesh'), JSON.stringify(focusAfter));
      const label1 = await E(pg, () => document.querySelector('.gm-demo .gm-hl').textContent.replace(/[⁦-⁩]/g, ''));
      check('reel: the button says 8/8 before the last highlight', /8\/8/.test(label1), label1);
      // the last highlight: the craftsmen in boxes (a moment) → Chanukat HaBayit → the outro
      await pg.click('.gm-demo .gm-hl');
      await wf(pg, () => !!document.querySelector('.gm-mo.on'), null, 5000);
      await pg.click('.gm-mo-skip'); await sleep(500);
      const outro = await cardsUntil(pg, /סוף ההדגמה/);
      const txt = await modalText(pg);
      check('reel (QA P1-4): the finale is followed by the outro', outro, txt.slice(0, 80));
      check('outro: lists the eight highlights', (await E(pg, () => document.querySelectorAll('.gm-modal.on ul.gm-reel li').length)) === 8);
      check('outro: offers the tour (and Phase B where the host has it) and a way to stay', /סיור בבית המקדש/.test(txt) && /להישאר/.test(txt), txt.slice(-120));
      await pg.screenshot({ path: path.join(OUT, 'r3-demo-outro.png') });
      // choose the tour → the scenes open on the tour
      await E(pg, () => { const b = [...document.querySelectorAll('.gm-modal.on .gm-btn')].find((x) => /סיור/.test(x.textContent)); if (b) b.click(); });
      await sleep(400);
      check('outro: "סיור" opens the tour', (await E(pg, () => window.__OPENED.slice())).includes('tour'));
      const label2 = await E(pg, () => document.querySelector('.gm-demo .gm-hl').textContent);
      check('reel: after the last highlight the button reads "סיום ההדגמה ✦" and opens the outro again', /סיום ההדגמה/.test(label2), label2);
      await cardsUntil(pg, /^$/, 1500);
      await E(pg, () => document.querySelector('.gm-demo .gm-hl').click());
      check('reel: pressing it again is never dead (the outro again)', await wf(pg, () => /סוף ההדגמה/.test((document.querySelector('.gm-modal.on') || {}).textContent || ''), null, 4000));
      check('reel: no stray key moment inside a live highlight', !(await E(pg, () => window.__GAME_LOG.some((e) => e.type === 'moment' && e.d && ['wall', 'heichal'].includes(e.d.id)))));
      check('reel: no console errors', errors.length === 0, errors.join(' | '));
      await ctx.close();
    }
    /* ── 2. the Ark mystery after the wood chamber ── */
    {
      const { ctx, pg, errors } = await gamePage(b);
      await E(pg, () => { const g = __H.game.state; g.ftue = 99; g.name = 'אלעזר'; g.mishmar = 3; g.story.priests = 1; g.st.har = { done: true }; g.st.wall = { done: true }; g.bh = g.bh.map(() => 0); g.st.nashim = { w: 999, ph: 3, ready: true }; __H.game._.resync(); });
      await dismissAll(pg);
      await E(pg, () => { __H.game._.runMoment('nashim'); });   // (not awaited: it resolves when the moment ends)
      await wf(pg, () => !!document.querySelector('.gm-mo.on'), null, 5000);
      await pg.click('.gm-mo-skip'); await sleep(600);
      const skipCard = await wf(pg, () => /לשכת העצים/.test((document.querySelector('.gm-modal.on .gm-mskip') || {}).textContent || ''), null, 6000);
      check('a skipped moment keeps its fact: the stage card carries its "done" line and source', skipCard, await E(pg, () => (document.querySelector('.gm-modal.on .gm-mskip') || {}).textContent || ''));
      const ok = await cardsUntil(pg, /אבן אחת ברצפה/);
      const t = await modalText(pg);
      check('mystery: after the Ezrat Nashim (the wood chamber) the Ark card comes', ok, t.slice(0, 90));
      check('mystery: the Mishnah\'s line with its source, marked טיוטה and "פרשנות של המשחק"', /משנה מחברותיה/.test(t) && /שקלים ו, ב/.test(t) && /טיוטה/.test(t) && /פרשנות של המשחק/.test(t));
      await pg.screenshot({ path: path.join(OUT, 'r3-mystery.png') });
      await E(pg, () => { const b = [...document.querySelectorAll('.gm-modal.on .gm-btn')].find((x) => /לחקור/.test(x.textContent)); if (b) b.click(); });
      await sleep(300);
      check('mystery: "לחקור" opens "איפה הארון?"', (await E(pg, () => window.__OPENED.slice())).includes('ark'));
      check('mystery: once (saved in the story)', await E(pg, () => !!__H.game.state.story.arkInv));
      check('mystery: no console errors', errors.length === 0, errors.join(' | '));
      await ctx.close();
    }
    /* ── 3. crews that wait, 4. a caravan that arrives ── */
    {
      const { ctx, pg, errors } = await gamePage(b);
      await E(pg, () => { const g = __H.game.state; g.ftue = 99; g.name = 'אלעזר'; g.mishmar = 3; g.story.priests = 1; g.st.har = { done: true }; g.bh = g.bh.map(() => 0); g.st.wall = { w: 60, ph: 2 }; g.res.cedar = 0; g.res.stone = 0; g.crews = [{ at: 'wall' }, { at: 'wall' }]; g.routes = ['wagons', 'cedar']; __H.game._.resync(); });
      await dismissAll(pg);
      const blocked = await E(pg, () => { const hk = __H.game._.hk(); return hk._.N.idleCrews(__H.game.state).length; });
      check('idle crews: two crews at the wall, which waits for cedar', blocked === 2, blocked);
      await E(pg, () => __H.game._.hk()._.idleNow());
      const toast = await wf(pg, () => !!document.querySelector('.gm-toast [data-hk="move"]'), null, 3000);
      check('idle crews: a toast names the site and the material, with one button', toast && /מחכ/.test(await E(pg, () => document.querySelector('.gm-toasts').textContent)), await E(pg, () => document.querySelector('.gm-toasts').textContent));
      await pg.screenshot({ path: path.join(OUT, 'r3-idle-crews.png') });
      await pg.click('.gm-toast [data-hk="move"]'); await sleep(300);
      const at = await E(pg, () => __H.game.state.crews.map((c) => c.at));
      check('idle crews: one tap moves them where they are useful (the quarry)', at.every((x) => x === 'quarry'), JSON.stringify(at));
      // the rest card offers the same before the player leaves
      await E(pg, () => { const g = __H.game.state; g.crews.forEach((c) => { c.at = 'wall'; }); __H.game._.resync(); __H.game._.hk()._.restNow(); });
      const rest = await wf(pg, () => /להעביר/.test((document.querySelector('.gm-modal.on') || {}).textContent || ''), null, 4000);
      check('rest card: "להעביר … למחצבה" when crews wait', rest, (await modalText(pg)).slice(-120));
      await E(pg, () => { const b = [...document.querySelectorAll('.gm-modal.on .gm-btn')].find((x) => /להעביר/.test(x.textContent)); if (b) b.click(); });
      await sleep(300);
      check('rest card: the button moves them', (await E(pg, () => __H.game.state.crews.map((c) => c.at))).every((x) => x === 'quarry'));
      // a caravan arriving now
      await E(pg, () => { const g = __H.game.state, t = Date.now(); g.car = [{ r: 'cedar', len: 'short', t0: t - 60000, t1: t + 1500, y: 70 }]; __H.game._.resync(); });
      const beat = await wf(pg, () => !!document.querySelector('.gm-toast [data-hk="collect"]'), null, 6000);
      check('arrival: a toast when the caravan reaches its bay, with "לאסוף"', beat, await E(pg, () => (document.querySelector('.gm-toasts') || {}).textContent || ''));
      await pg.screenshot({ path: path.join(OUT, 'r3-arrival.png') });
      const c0 = await E(pg, () => __H.game.state.res.cedar);
      await pg.click('.gm-toast [data-hk="collect"]'); await sleep(400);
      const c1 = await E(pg, () => ({ cedar: __H.game.state.res.cedar, car: __H.game.state.car.length }));
      check('arrival: one tap collects it (the cedar is in stock)', c1.car === 0 && c1.cedar > c0, JSON.stringify(c1));
      check('crews/arrival: no console errors', errors.length === 0, errors.join(' | '));
      await ctx.close();
    }
    /* ── 5. the scenes panel ── */
    {
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
      const pg = await ctx.newPage();
      const errors = []; pg.on('pageerror', (e) => errors.push(e.message));
      const HTML = path.join(OUT, 'scenes-bot.html');
      if (!fs.existsSync(HTML)) fs.writeFileSync(HTML, `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{height:100%;margin:0;background:#CBB28A}</style></head><body><script src="scenes-bot.bundle.js"></script></body></html>`);
      await pg.addInitScript(() => { try { localStorage.clear(); } catch (e) { /* */ } });
      await pg.goto('file://' + HTML + '?now=2026-09-27T20:00:00%2B03:00');
      await pg.waitForFunction(() => !!window.__SC, null, { timeout: 20000 });
      await E(pg, () => window.__SC.open('tour'));
      await sleep(200);
      const s1 = await E(pg, () => ({ row: (document.querySelector('.sc-stamps') || {}).textContent || '', next: !!document.querySelector('[data-hk="nextstop"]') }));
      check('tour: a stamp row under the tabs (1/10 at the first stop)', /1\/10/.test(s1.row.replace(/[⁦-⁩]/g, '')), s1.row);
      check('tour: "לתחנה הבאה" at a stop with more cards', s1.next);
      await pg.screenshot({ path: path.join(OUT, 'r3-tour-stamps.png') });
      await pg.click('[data-hk="nextstop"]'); await sleep(300);
      const s2 = await E(pg, () => ({ id: window.__SC.state.id, card: window.__SC.state.card, row: document.querySelector('.sc-stamps').textContent }));
      check('tour: "לתחנה הבאה" goes to the next view (stop 2, its first card)', s2.id === 'kiyor' && s2.card === 0 && /2\/10/.test(s2.row.replace(/[⁦-⁩]/g, '')), JSON.stringify(s2));
      // walk to the end
      for (let k = 0; k < 60; k++) { const more = await E(pg, () => { const S = window.__SC.state; return S.open && !(S.stop === S.stops.length - 1 && !!document.querySelector('.sc-done')); }); if (!more) break; await E(pg, () => window.__SC.next()); await sleep(40); }
      const door = await E(pg, () => (document.querySelector('.sc-done') || {}).textContent || '');
      check('tour: the last card shows 10/10 and the door to the Ark (Yoma 5:2)', /10/.test(door) && /יומא ה, ב/.test(door) && /איפה הארון/.test(door), door.slice(0, 120));
      await pg.screenshot({ path: path.join(OUT, 'r3-tour-door.png') });
      await pg.click('.sc-done [data-hk="door"]'); await sleep(300);
      check('tour: the door opens "איפה הארון?"', (await E(pg, () => window.__SC.state.mode)) === 'ark');
      for (let k = 0; k < 20; k++) { const more = await E(pg, () => !document.querySelector('.sc-done')); if (!more) break; await E(pg, () => window.__SC.next()); await sleep(40); }
      const door2 = await E(pg, () => (document.querySelector('.sc-done') || {}).textContent || '');
      check('ark: the last step\'s door leads to the service (Kelim 1:9)', /כלים א, ט/.test(door2), door2.slice(0, 100));
      await pg.click('.sc-done [data-hk="door"]'); await sleep(300);
      for (let k = 0; k < 30; k++) { const more = await E(pg, () => !document.querySelector('.sc-done')); if (!more) break; await E(pg, () => window.__SC.next()); await sleep(40); }
      const door3 = await E(pg, () => (document.querySelector('.sc-done') || {}).textContent || '');
      check('yk: the last chapter says when the real Yom Kippur comes, and all 25 stamps', /יום הכיפורים הבא/.test(door3) && /25/.test(door3), door3.slice(0, 140));
      await pg.screenshot({ path: path.join(OUT, 'r3-yk-end.png') });
      const kept = await E(pg, () => JSON.parse(localStorage.getItem('bh_stamps') || '{}'));
      check('stamps: kept on the device (25)', Object.keys(kept.tour || {}).length + Object.keys(kept.ark || {}).length + Object.keys(kept.yk || {}).length === 25, JSON.stringify(kept.done));
      check('scenes: no page errors', errors.length === 0, errors.join(' | '));
      await ctx.close();
    }
    /* ── 5b. the Phase B home announces Yom Kippur (ten days before) ── */
    {
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
      const pg = await ctx.newPage();
      const errors = []; pg.on('pageerror', (e) => errors.push(e.message));
      await pg.addInitScript(() => { try { localStorage.clear(); } catch (e) { /* */ } });
      await pg.goto('file://' + path.join(ROOT, 'test/avodah-harness.html') + '?fast=1&now=2027-10-01T12:00:00%2B03:00');
      // the name pick first ("בחר בשבילי"), then the home
      for (let k = 0; k < 20; k++) { const done = await E(pg, () => { const b = [...document.querySelectorAll('button')].find((x) => /בחר בשבילי/.test(x.textContent)); if (b) { b.click(); return true; } return !!document.querySelector('.hk-yk'); }); if (done) break; await sleep(300); }
      await sleep(600);
      for (let k = 0; k < 6; k++) { const more = await E(pg, () => { const m = document.querySelector('.av-modal.on'); const b = m && (m.querySelector('.av-btn.gold') || m.querySelector('button')); if (b && !document.querySelector('.hk-yk')) { b.click(); return true; } return false; }); if (!more) break; await sleep(500); }
      const ok = await wf(pg, () => /יום הכיפורים/.test(document.body.textContent) && !!document.querySelector('.hk-yk'), null, 12000);
      const t = await E(pg, () => (document.querySelector('.hk-yk') || {}).textContent || '');
      check('home (1 Oct 2027): "בעוד 10 ימים: יום הכיפורים" with the button to the service', ok && /10/.test(t), t.slice(0, 100));
      if (ok) await pg.screenshot({ path: path.join(OUT, 'r3-home-yk.png') });
      check('home: no page errors', errors.length === 0, errors.join(' | '));
      await ctx.close();
    }
  } finally { await b.close(); }
  const failed = results.filter((r) => !r.ok);
  fs.writeFileSync(path.join(OUT, 'r3-checks.json'), JSON.stringify({ when: new Date().toISOString(), results }, null, 1));
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
