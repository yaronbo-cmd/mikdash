// probe134 script: work 2 driven fast — the act's own fingers, the act's update(1/60) called in-page between moves (the cloud's renderer
// draws ~1 frame a second, so waiting for frames took 25 min at level 2). Stills: the start (the pitch beads), mid-tilt, the dive.
module.exports = async ({ pg, st, shot, log, wait }) => {
  const act = () => pg.evaluate(() => { const a = window.__T.game.h109.act && window.__T.game.h109.act(); return a && a.dbg ? a.dbg() : null; });
  for (let i = 0; i < 60; i++) { const s = await st(); if (s && s.phase === 'act') break; await wait(1000); }
  await wait(1500); await shot('chil-start');
  const run = (fn) => pg.evaluate(fn);
  const r = await pg.evaluate(() => {
    const A = () => window.__T.game.h109.act(), D = () => A().dbg(), U = (n) => { for (let i = 0; i < n; i++) A().update(1 / 60); };
    const DIRS = { N: [0, -1], NE: [0.707, -0.707], E: [1, 0], SE: [0.707, 0.707], S: [0, 1], SW: [-0.707, 0.707], W: [-1, 0], NW: [-0.707, -0.707] };
    const H = innerHeight, log = [];
    for (const p of D().pts) {
      const d = D(), B = d.basis, w = [-DIRS[p.d][0], -DIRS[p.d][1]];
      const det = B.r[0] * -B.f[1] - B.f[0] * -B.r[1]; const dx = (w[0] * -B.f[1] - B.f[0] * -w[1]) / det, dy = (B.r[0] * w[1] - w[0] * B.r[1]) / det;
      const L = Math.hypot(dx, dy) || 1, R = 0.72 * 0.1 * H, a = { x: d.head[0], y: d.head[1] }, to = { x: a.x + (dx / L) * R, y: a.y + (dy / L) * R };
      A().down({ id: 31, ...a }); for (let k = 1; k <= 4; k++) { A().move({ id: 31, x: a.x + (to.x - a.x) * k / 4, y: a.y + (to.y - a.y) * k / 4 }); U(2); }
      for (let g = 0; g < 600 && !D().pts.find((q) => q.d === p.d).done; g++) U(1);
      A().up({ id: 31, ...to }); U(2);
      log.push(p.d + ':' + JSON.stringify(D().pts.find((q) => q.d === p.d)));
    }
    return log;
  });
  for (const l of r) log(l);
  await shot('chil-freed');
  // a warning tilt (over 85 %): the tremble, then let go before the scrape
  log('warn', JSON.stringify(await pg.evaluate(() => { const A = () => window.__T.game.h109.act(), D = () => A().dbg(); const d = D(); const a = { x: d.head[0], y: d.head[1] }; A().down({ id: 33, ...a }); A().move({ id: 33, x: a.x + 0.093 * innerHeight, y: a.y }); for (let i = 0; i < 30; i++) A().update(1 / 60); const k = D().k; A().up({ id: 33, x: a.x, y: a.y }); for (let i = 0; i < 40; i++) A().update(1 / 60); return { k, scuffs: D().scuffs }; })));
  const p2 = await pg.evaluate(() => {
    const A = () => window.__T.game.h109.act(), D = () => A().dbg(), U = (n) => { for (let i = 0; i < n; i++) A().update(1 / 60); }, log = [];
    for (let s = 0; s < 40; s++) {
      let d = D(); if (d.out || d.dive || d.finished || d.salt) break;
      const a = { x: d.loop[0], y: d.loop[1] }; let y = a.y; A().down({ id: 32, ...a });
      for (let k = 0; k < 30; k++) { y -= 2.5; A().move({ id: 32, x: a.x, y }); U(3); if (D().out || D().caught) break; }
      A().up({ id: 32, x: a.x, y }); U(2);
      d = D(); log.push(`pull ${s} rise ${d.rise} sc ${d.scuffs} br ${d.broke} out ${d.out}`);
    }
    return log;
  });
  for (const l of p2) log(l);
  await wait(2500); await shot('chil-dive');
  for (let i = 0; i < 16; i++) { const s = await st(); log('after', s.phase, s.mission); if (s.phase !== 'act') break; await pg.evaluate(() => { try { const A = window.__T.game.h109.act(); A.down({ id: 40, x: 320, y: 200 }); A.up({ id: 40, x: 320, y: 200 }); } catch (e) { /* */ } }); await wait(1500); }
  log('res', await pg.evaluate(() => JSON.stringify(window.__T.game.h109.M.st.res) + ' flaws ' + JSON.stringify(window.__T.game.h109.M.st.flaws)));
};
