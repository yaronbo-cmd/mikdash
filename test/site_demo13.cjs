// SITE13 (wave 13) — the owner's words, 30.9 11:12: "נראה שאני עובד לבד רק גלגלית אחת ישנה והיא שלי. צריך לדעתי עוד מכונות כאלה
// בסביבה ועוד מכונות בניה מגניבות מהימים ההם שייראה מלא פעילות". The DEMO as he enters it, each walled stage picked, the world
// left to run as it does in his first minute there; at each stage the game's own frame and that frame 3× farther (a child's
// pinch-out, put back after): the crews' machines on screen (stages.machines(): the crews' crane's hook and base, the
// shear-legs, the sledge), the ox carts drawn (crews.stats.carts), the draw calls, a shot of each (looked at).
// DECLARED HOOKS: the renderer's (__START_PAUSED + __T.simulate, a render before each shot), __NO_OPENING (the opening film),
// `__T.game.switchMode(true)` and `__T.game.jumpTo(id)` (the menu's "מצב הדגמה" and the picker's rows), and `__T.look` for the
// ×3 frame. No taps: this measures the site's life around him, not the play (PRODUCER13 plays it by touch).
// Usage: node test/site_demo13.cjs [dist/test.html] [--stages=wall,nashim,guf,ulam,heichal] [--secs=18] [--out=…]
// Pass: at every stage ≥ 2 lifting machines (his crane + the crews') and ≥ 1 cart drawn in the work or ×3 frame, draw calls
// ≤ 150 in both, no page errors.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const A = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return [m[1], m[2] === undefined ? true : m[2]]; }));
const file = path.resolve(process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dist/test.html');
const OUT = path.resolve(A.out || 'test/out/site13/demo'); fs.mkdirSync(OUT, { recursive: true });
const IDS = String(A.stages || 'wall,nashim,guf,ulam,heichal').split(','), SECS = +(A.secs || 18);
const W = 390, H = 844;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__START_PAUSED = true; window.__NO_OPENING = true; });
  const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto('file://' + file);
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { timeout: 400000 });
  // a card or the name field in the way: answered by touch, as a child would (the gold button; a name typed)
  const clearModals = async () => {
    for (let i = 0; i < 5; i++) {
      const m = await pg.evaluate(() => { const q = document.querySelector('.gm-modal.on .gm-input'), b = document.querySelector('.gm-modal.on .gm-btn-gold') || document.querySelector('.gm-modal.on button'); if (!b && !q) return null; const r = (q || b).getBoundingClientRect(); return { input: !!q, x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
      if (!m) return;
      await pg.touchscreen.tap(m.x, m.y); await wait(400);
      if (m.input) { await pg.keyboard.type('בונה'); await wait(200); const b = await pg.evaluate(() => { const x = document.querySelector('.gm-modal.on .gm-btn-gold'); if (!x) return null; const r = x.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }); if (b) await pg.touchscreen.tap(b.x, b.y); }
      await wait(900);
    }
  };
  await clearModals();
  await pg.evaluate(() => { __T.game.switchMode(true); });   // DECLARED: the menu's "מצב הדגמה"
  await wait(2500); await clearModals();
  const res = []; let pass = true;
  for (const id of IDS) {
    await clearModals();
    let ok = await pg.evaluate((id) => __T.game.jumpTo(id), id);   // DECLARED: the picker's row
    if (!ok) { await wait(2000); await clearModals(); ok = await pg.evaluate((id) => __T.game.jumpTo(id), id); }
    await wait(SECS * 1000);
    const row = { id, ok, frames: {} };
    for (const k of ['work', 'x3']) {
      const r = await pg.evaluate((k) => {
        __T.simulate(false);
        const cam = __T.camera, C = __T.controls, p0 = cam.position.toArray(), t0 = C.target.toArray();
        if (k === 'x3') __T.look(t0.map((t, i) => t + (p0[i] - t) * 3), t0);
        __T.render(); __T.render();
        const M = __T.stages.machines ? __T.stages.machines() : {}, V = __T.Vector3; cam.updateMatrixWorld();
        const on = (q) => { const v = new V(q[0], q[1], q[2]).project(cam); return v.z < 1 && Math.abs(v.x) < 1 && Math.abs(v.y) < 0.9; };
        let crews = 0, crewsHook = 0, shear = 0, sled = 0; for (const m of Object.values(M)) { if (on(m.base)) crews++; if (on(m.hook || m.crane)) crewsHook++; if (on([m.shear[0], 4, m.shear[1]])) shear++; if (on([m.sled[0], 2, m.sled[1]])) sled++; }
        const cr = __T.stages.crane ? __T.stages.crane() : null;
        const his = cr && cr.site ? on([cr.x, cr.y, cr.z]) || on([cr.bx, 4, cr.bz]) : false;
        const calls = __T.drawCalls().total, carts = __T.crews ? __T.crews.stats.carts : 0, lane = __T.stages.cartLane ? __T.stages.cartLane() : null;
        return { crews, crewsHook, shear, sled, his, calls, carts, lane: lane && lane.id, p0, t0 };
      }, k);
      const f = path.join(OUT, `${id}-${k}.png`);
      await pg.screenshot({ path: f, timeout: 240000 });
      if (k === 'x3') await pg.evaluate((r) => { __T.look(r.p0, r.t0); }, r);
      await pg.evaluate(() => __T.simulate(true));
      delete r.p0; delete r.t0; row.frames[k] = r;
    }
    const F = row.frames, lift = Math.max((F.work.his ? 1 : 0) + (F.work.crews || F.work.crewsHook ? 1 : 0), (F.x3.his ? 1 : 0) + (F.x3.crews || F.x3.crewsHook ? 1 : 0));
    row.pass = lift >= 2 && Math.max(F.work.carts, F.x3.carts) >= 1 && Math.max(F.work.calls, F.x3.calls) <= 150;
    if (!row.pass) pass = false;
    console.log(`${id}: jump ${ok} · work ${JSON.stringify(F.work)} · x3 ${JSON.stringify(F.x3)} → ${row.pass ? 'pass' : 'FAIL'}`);
    res.push(row);
  }
  fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(res, null, 1));
  if (errs.length) pass = false;
  console.log(errs.length ? 'PAGE ERRORS: ' + errs.slice(0, 3).join(' | ') : 'no page errors');
  console.log(pass ? 'ALL PASS' : 'FAIL');
  await b.close(); process.exit(pass ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
