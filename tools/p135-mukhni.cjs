// probe135 script: work 2 at its level, driven through the act's own fingers: the work finger goes round the wheel's rim on screen
// (clockwise as seen) at REV rev/s; from level 2 a second finger (the brake) is held while the speed runs over SAFE. Screenshots on the way.
module.exports = async ({ pg, st, shot, log, wait }) => {
  const act = () => pg.evaluate(() => { const a = window.__T.game.h109.act && window.__T.game.h109.act(); return a && a.dbg ? a.dbg() : null; });
  for (let i = 0; i < 60; i++) { const s = await st(); if (s && s.phase === 'act') break; await wait(1000); }
  await wait(1500);
  let d = await act(); log('mukhni', JSON.stringify(d).slice(0, 500)); await shot('mukhni-start');
  const REV = +(process.env.REV || 0.35);
  for (let leg = 0; leg < +(process.env.LEGS || 40); leg++) {
    const r = await pg.evaluate(async ([REV]) => {
      const sl = (ms) => new Promise((r) => setTimeout(r, ms)), A = () => window.__T.game.h109.act();
      if (!A() || !A().dbg) return null; let d = A().dbg(); if (d.finished || d.busy) return d;
      const W = d.wheel, lv = d.lv; let a = -Math.PI / 2; const pt = () => ({ x: W.c[0] + Math.cos(a) * W.ax * 0.95, y: W.c[1] + Math.sin(a) * W.ay * 0.95 });
      A().down({ id: 41, ...pt() }); let br = false;
      for (let k = 0; k < 16; k++) {
        a += REV * Math.PI * 2 * 0.09; A().move({ id: 41, ...pt() }); await sl(90);
        d = A().dbg(); if (!d || d.finished || d.busy) break;
        const want = lv > 1 && d.w > 0.42; if (want && !br) { A().down({ id: 42, x: 30, y: 30 }); br = true; } else if (!want && br) { A().up({ id: 42, x: 30, y: 30 }); br = false; }
      }
      if (br) A().up({ id: 42, x: 30, y: 30 }); A().up({ id: 41, ...pt() });
      return A().dbg();
    }, [REV]);
    if (!r) break; log('leg', leg, JSON.stringify({ d: r.d, w: r.w, steps: r.steps, flaws: r.flaws, done: r.done, ev: r.ev.slice(-4) }));
    if (leg === 1) await shot('mukhni-turning');
    if (r.done || r.finished) break;
  }
  await shot('mukhni-bottom');
  for (let i = 0; i < 20; i++) { const s = await st(); log('after', s.phase, s.mission); if (s.phase !== 'act') break; await wait(1500); if (i === 2) await shot('mukhni-end'); }
  log('res', await pg.evaluate(() => { const M = window.__T.game.h109.M; return M ? JSON.stringify(M.st.res) : 'n/a'; }));
};
