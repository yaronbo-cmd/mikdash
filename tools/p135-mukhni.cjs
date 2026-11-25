// probe135 script: work 2 driven fast (the cloud's renderer draws ~1 frame a second): the act's own fingers, with the act's update(1/60)
// called in-page between moves. The work finger goes round the wheel's rim on screen (clockwise as seen) at REV rev/s; from level 2 a
// second finger on the brake's handle, dragged toward the wheel more while the speed runs over the target. Stills on the way.
module.exports = async ({ pg, st, shot, log, wait }) => {
  for (let i = 0; i < 60; i++) { const s = await st(); if (s && s.phase === 'act') break; await wait(1000); }
  await wait(1500);
  log('mukhni', JSON.stringify(await pg.evaluate(() => window.__T.game.h109.act().dbg())).slice(0, 500)); await shot('mukhni-start');
  const REV = +(process.env.REV || 0.4);
  for (let leg = 0; leg < 30; leg++) {
    const r = await pg.evaluate(([REV]) => {
      const A = () => window.__T.game.h109.act(); if (!A() || !A().dbg) return null;
      let d = A().dbg(); if (d.finished || d.busy || d.done) return d;
      const W = d.wheel, lv = d.lv; let a = -Math.PI / 2; const pt = () => ({ x: W.c[0] + Math.cos(a) * W.ax * 0.95, y: W.c[1] + Math.sin(a) * W.ay * 0.95 });
      A().down({ id: 41, ...pt() }); A().update(1 / 60);
      let br = null;
      for (let k = 0; k < 240; k++) {
        const tg = Math.min(REV, 0.1 + k * 0.004);
        a += tg * Math.PI * 2 / 60; A().move({ id: 41, ...pt() }); A().update(1 / 60);
        d = A().dbg(); if (!d || d.finished || d.busy || d.done) break;
        if (lv > 1) {
          const want = Math.max(0, Math.min(1, (d.w - tg) * 4 + (d.load > 0.6 ? 0.4 : 0)));
          const h = d.handle, dir = [W.c[0] - h[0], W.c[1] - h[1]], L = Math.hypot(dir[0], dir[1]) || 1, px = innerHeight / 360 * 70;
          if (!br) { A().down({ id: 42, x: h[0], y: h[1] }); br = h; }
          A().move({ id: 42, x: br[0] + dir[0] / L * (want - 0.35) * px, y: br[1] + dir[1] / L * (want - 0.35) * px });
        }
      }
      if (br) A().up({ id: 42, x: br[0], y: br[1] }); A().up({ id: 41, ...pt() }); A().update(1 / 60);
      return A().dbg();
    }, [REV]);
    if (!r) break; log('leg', leg, JSON.stringify({ d: r.d, w: r.w, load: r.load, brake: r.brake, sub: r.sub, steps: r.steps, flaws: r.flaws, done: r.done, ev: r.ev.slice(-5) }));
    if (leg === 0) await shot('mukhni-turning');
    if (r.d > 5 && !this_mid) { var this_mid = 1; await shot('mukhni-deep'); }
    if (r.done || r.finished) break;
  }
  await shot('mukhni-bottom');
  for (let i = 0; i < 20; i++) { const s = await st(); log('after', s.phase, s.mission); if (s.phase !== 'act') break; await wait(1500); if (i === 2) await shot('mukhni-end'); }
  log('res', await pg.evaluate(() => { const M = window.__T.game.h109.M; return M ? JSON.stringify(M.st.res) : 'n/a'; }));
};
