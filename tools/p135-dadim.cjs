// probe135 script: work 1 at its level, driven through the act's own fingers (act.down / move / up): each spigot dragged from the
// basket to its seat, then aimed at its own station's hands (the model's solver, in node) through the act's _aim, and locked (level 1:
// the finger lifted; from level 2: a second finger as the knob, let go). ENV: BAD=1 aims the first one at the floor (a wet try).
const path = require('path');
module.exports = async ({ pg, st, shot, log, wait }) => {
  const D = await import(path.resolve(__dirname, '../src/game/h135/dadim-model.js'));
  const { BOOK } = await import(path.resolve(__dirname, '../src/game/world/grid.js'));
  const act = () => pg.evaluate(() => { const a = window.__T.game.h109.act && window.__T.game.h109.act(); return a && a.dbg ? a.dbg() : null; });
  for (let i = 0; i < 60; i++) { const s = await st(); if (s && s.phase === 'act') break; await wait(1000); }
  await wait(1500);
  let d = await act(); log('dadim', JSON.stringify(d).slice(0, 300)); await shot('dadim-start');
  const lv = d.lv, S = D.fresh(lv, BOOK.s12);
  for (const q of d.seats) {
    const n = q.n, s = BOOK.s12.seats[n]; D.place(S, n);
    const sol = D.solve(S, n, s.i, D.whenOf(S, n)) || D.solve(S, n, s.i, 'morning');
    const r = await pg.evaluate(async ([n, sol, lv]) => {
      const sl = (ms) => new Promise((r) => setTimeout(r, ms)), A = () => window.__T.game.h109.act(), Dd = () => A().dbg();
      let d = Dd(); const b = d.basketXY, seat = d.seats.find((x) => x.n === n).seat;
      A().down({ id: 31, x: b[0], y: b[1] }); for (let k = 1; k <= 6; k++) { A().move({ id: 31, x: b[0] + ((seat[0] - b[0]) * k) / 6, y: b[1] + ((seat[1] - b[1]) * k) / 6 }); await sl(30); } A().up({ id: 31, x: seat[0], y: seat[1] }); await sl(100);
      d = Dd(); const m = d.seats.find((x) => x.n === n).mouth;
      A().down({ id: 32, x: m[0], y: m[1] }); await sl(60);
      if (lv > 1) { A().down({ id: 33, x: 40, y: 300 }); await sl(60); }
      A()._aim(n, sol.yaw, sol.pitch); await sl(400);
      A().up({ id: 32, x: m[0], y: m[1] }); await sl(60);
      if (lv > 1) { A().up({ id: 33, x: 40, y: 300 }); await sl(60); }
      return Dd().seats.find((x) => x.n === n);
    }, [n, sol, lv]);
    log('seat', n, JSON.stringify(r));
  }
  await wait(800); await shot('dadim-tests'); await wait(1600); await shot('dadim-tests2');
  for (let i = 0; i < 20; i++) { const s = await st(); d = await act(); log('after', s.phase, s.mission, d && JSON.stringify(d.ev.slice(-5))); if (s.phase !== 'act') break; await wait(1500); if (i === 2) await shot('dadim-end'); }
  log('res', await pg.evaluate(() => { const M = window.__T.game.h109.M; return M ? JSON.stringify(M.st.res) + ' ' + JSON.stringify(M.st.spigots) : 'n/a'; }));
};
