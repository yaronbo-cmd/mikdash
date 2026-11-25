// probe134 script: work 2 at its level, driven through the act's own fingers (in-page, a frame between moves): for each point the head
// dragged away from it (the world direction through the basis locked at the touch) and held until it lets go; then the loop pulled up
// hand over hand, a few pixels a frame. ENV: FAST=1 pulls too fast (the break → the salt event).
module.exports = async ({ pg, st, shot, log, wait }) => {
  const act = () => pg.evaluate(() => { const a = window.__T.game.h109.act && window.__T.game.h109.act(); return a && a.dbg ? a.dbg() : null; });
  for (let i = 0; i < 60; i++) { const s = await st(); if (s && s.phase === 'act') break; await wait(1000); }
  await wait(1500);
  let d = await act(); log('chil', JSON.stringify(d).slice(0, 400)); await shot('chil-start');
  const r = await pg.evaluate(async (fast) => {
    const fr = () => new Promise((r) => requestAnimationFrame(() => r())), A = () => window.__T.game.h109.act(), D = () => A().dbg();
    const DIRS = { N: [0, -1], NE: [0.707, -0.707], E: [1, 0], SE: [0.707, 0.707], S: [0, 1], SW: [-0.707, 0.707], W: [-1, 0], NW: [-0.707, -0.707] };
    const H = innerHeight, log = [];
    for (const p of D().pts) {
      const d = D(), B = d.basis, w = [-DIRS[p.d][0], -DIRS[p.d][1]];
      const det = B.r[0] * -B.f[1] - B.f[0] * -B.r[1]; const dx = (w[0] * -B.f[1] - B.f[0] * -w[1]) / det, dy = (B.r[0] * w[1] - w[0] * B.r[1]) / det;
      const L = Math.hypot(dx, dy) || 1, R = 0.72 * 0.1 * H, a = { x: d.head[0], y: d.head[1] }, to = { x: a.x + (dx / L) * R, y: a.y + (dy / L) * R };
      A().down({ id: 31, ...a }); for (let k = 1; k <= 4; k++) { A().move({ id: 31, x: a.x + (to.x - a.x) * k / 4, y: a.y + (to.y - a.y) * k / 4 }); await fr(); }
      for (let g = 0; g < 300 && !D().pts.find((q) => q.d === p.d).done; g++) await fr();
      A().up({ id: 31, ...to }); await fr();
      log.push(p.d + ':' + JSON.stringify(D().pts.find((q) => q.d === p.d)));
    }
    for (let s = 0; s < 40; s++) {
      let d = D(); if (d.out || d.dive || d.finished || d.salt) break;
      const a = { x: d.loop[0], y: d.loop[1] }; let y = a.y; A().down({ id: 32, ...a });
      for (let k = 0; k < 30; k++) { y -= fast ? 25 : 2.5; A().move({ id: 32, x: a.x, y }); await fr(); if (D().out || D().caught) break; }
      A().up({ id: 32, x: a.x, y }); await fr();
      d = D(); log.push(`pull ${s} rise ${d.rise} sp ${d.speed} sc ${d.scuffs} br ${d.broke} ${JSON.stringify(d.ev.slice(-2))}`);
    }
    return log;
  }, !!process.env.FAST);
  for (const l of r) log(l);
  await wait(800); await shot('chil-after'); d = await act(); log('state', JSON.stringify(d).slice(0, 300));
  for (let i = 0; i < 16; i++) { const s = await st(); log('after', s.phase, s.mission); if (s.phase !== 'act') break; await pg.evaluate(() => { try { const A = window.__T.game.h109.act(); A.down({ id: 40, x: 320, y: 200 }); A.up({ id: 40, x: 320, y: 200 }); } catch (e) { /* */ } }); await wait(1500); if (i === 1) await shot('chil-end'); }
  log('horn', await pg.evaluate(() => { const M = window.__T.game.h109.M; return M ? JSON.stringify(M.st.horns) + ' ' + JSON.stringify(M.st.res) + ' flaws ' + JSON.stringify(M.st.flaws) : 'n/a'; }));
};
