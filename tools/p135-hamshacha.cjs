// probe135 script: work 3 at its level, driven through the act's own fingers: each path (world points, the same as the model test's)
// dug with one finger in small steps; then every bend packed by a held finger on it while the water runs. ENV: NOPACK=1 leaves them.
const P = {
  1: [[[-69, 56.8], [-69, 40.5], [-61.5, 40.5], [-61.5, 32.5], [-60.5, 32.5], [-60.5, 28.1]]],
  2: [[[-69, 56.8], [-69, 44], [-63, 44], [-63, 38]], [[-60, 56.8], [-60, 50.5], [-66, 50.5], [-66, 44.6]], [[-63, 38], [-63, 32.5], [-60.5, 32.5], [-60.5, 28.1]]],
};
P[3] = [[[-69, 56.8], [-69, 44], [-64, 44], [-64, 39.5], [-66, 39.5], [-66, 32.8], [-60.5, 32.8], [-60.5, 28.1]], P[2][1]];
module.exports = async ({ pg, st, shot, log, wait }) => {
  const act = () => pg.evaluate(() => { const a = window.__T.game.h109.act && window.__T.game.h109.act(); return a && a.dbg ? a.dbg() : null; });
  for (let i = 0; i < 60; i++) { const s = await st(); if (s && s.phase === 'act') break; await wait(1000); }
  await wait(2500);
  let d = await act(); log('hamshacha', JSON.stringify(d).slice(0, 400)); await shot('hamshacha-start');
  const paths = P[d.lv];
  for (const path of paths) {
    const r = await pg.evaluate(async ([path]) => {
      const sl = (ms) => new Promise((r) => setTimeout(r, ms)), A = () => window.__T.game.h109.act();
      let p0 = A()._scr(...path[0]); A().down({ id: 51, x: p0[0], y: p0[1] }); await sl(40);
      for (let k = 1; k < path.length; k++) {
        const [ax, az] = path[k - 1], [bx, bz] = path[k], n = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.3);
        for (let s = 1; s <= n; s++) { const q = A()._scr(ax + ((bx - ax) * s) / n, az + ((bz - az) * s) / n); A().move({ id: 51, x: q[0], y: q[1] }); await sl(25); }
      }
      const pe = A()._scr(...path[path.length - 1]); A().up({ id: 51, x: pe[0], y: pe[1] }); await sl(100);
      return A().dbg();
    }, [path]);
    log('path', JSON.stringify({ segs: r.segs, bends: r.bends.map((b) => b.state + ':' + b.crack), breaches: r.breaches, ev: r.ev.slice(-5) }));
  }
  await shot('hamshacha-dug');
  for (let i = 0; i < 40; i++) {
    d = await act(); if (!d) break;
    if (!process.env.NOPACK) {
      const b = d.bends.find((x) => (x.state === 'ok' || x.state === 'breach') && x.packed < 1);
      if (b) { await pg.evaluate(async ([s]) => { const A = () => window.__T.game.h109.act(); A().down({ id: 52, x: s[0], y: s[1] }); await new Promise((r) => setTimeout(r, 1200)); A().up({ id: 52, x: s[0], y: s[1] }); }, [b.scr]); }
    }
    d = await act(); if (!d) break; log('flow', JSON.stringify({ t: d.t, fill: d.fill, met: d.met, segs: d.segs, bends: d.bends.map((b) => b.state + ':' + b.packed), breaches: d.breaches, done: d.done, ev: d.ev.slice(-3) }));
    if (i === 3) await shot('hamshacha-flow');
    if (d.done || d.finished) break; await wait(800);
  }
  await shot('hamshacha-full');
  for (let i = 0; i < 20; i++) { const s = await st(); log('after', s.phase, s.mission); if (s.phase !== 'act') break; await wait(1500); if (i === 2) await shot('hamshacha-end'); }
  log('res', await pg.evaluate(() => { const M = window.__T.game.h109.M; return M ? JSON.stringify(M.st.res) + ' water ' + M.st.water : 'n/a'; }));
};
