// probe134 script: work 2 at its level — for each point, the head dragged away from it (the basis locked at the touch) and held, then
// the loop pulled up hand over hand, slowly; stills on the way. ENV: FAST=1 pulls too fast (the break → the salt).
module.exports = async ({ pg, st, shot, log, wait }) => {
  const act = () => pg.evaluate(() => { const a = window.__T.game.h109.act && window.__T.game.h109.act(); return a && a.dbg ? a.dbg() : null; });
  for (let i = 0; i < 60; i++) { const s = await st(); if (s && s.phase === 'act') break; await wait(1000); }
  await wait(1500);
  let d = await act(); log('chil', JSON.stringify(d).slice(0, 400)); await shot('chil-start');
  const H = await pg.evaluate(() => innerHeight);
  const DIRS = { N: [0, -1], NE: [0.707, -0.707], E: [1, 0], SE: [0.707, 0.707], S: [0, 1], SW: [-0.707, 0.707], W: [-1, 0], NW: [-0.707, -0.707] };
  for (const p of d.pts) {
    d = await act(); const B = d.basis, w = [-DIRS[p.d][0], -DIRS[p.d][1]];
    // screen (dx, dy) with world = r·dx + f·(−dy): solve the 2×2
    const det = B.r[0] * -B.f[1] - B.f[0] * -B.r[1]; const dx = (w[0] * -B.f[1] - B.f[0] * -w[1]) / det, dy = (B.r[0] * w[1] - w[0] * B.r[1]) / det;
    const L = Math.hypot(dx, dy) || 1, R = 0.72 * 0.1 * H, a = { x: d.head[0], y: d.head[1] };
    await pg.mouse.move(a.x, a.y); await pg.mouse.down();
    for (let k = 1; k <= 6; k++) { await pg.mouse.move(a.x + (dx / L) * R * k / 6, a.y + (dy / L) * R * k / 6); await wait(40); }
    await wait(900); if (p === d.pts[0]) await shot('chil-tilt');
    await pg.mouse.up(); await wait(300);
    log('point', p.d, JSON.stringify((await act()).pts));
  }
  for (let s = 0; s < 14; s++) {
    d = await act(); if (!d || d.out || d.dive || d.finished) break;
    const a = { x: d.loop[0], y: d.loop[1] }, dist = process.env.FAST ? 300 : 130, n = process.env.FAST ? 4 : 30;
    await pg.mouse.move(a.x, a.y); await pg.mouse.down();
    for (let k = 1; k <= n; k++) { await pg.mouse.move(a.x, a.y - dist * k / n); await wait(process.env.FAST ? 16 : 45); }
    await pg.mouse.up(); await wait(250);
    d = await act(); log('pull', s, 'rise', d && d.rise, 'speed', d && d.speed, 'scuffs', d && d.scuffs, 'broke', d && d.broke, JSON.stringify(d && d.ev.slice(-2)));
    if (s === 1) await shot('chil-pull');
    if (d && d.salt) { log('salt', JSON.stringify(d.salt)); await shot('chil-salt'); break; }
  }
  await wait(1200); await shot('chil-dive');
  for (let i = 0; i < 16; i++) { const s = await st(); log('after', s.phase, s.mission); if (s.phase !== 'act') break; await pg.mouse.click(450, 200); await wait(1500); }
  await shot('chil-end');
};
