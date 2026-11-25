// probe134 script: work 1 at its level — every pebble dragged to its solution by the mouse (the left hand), the pot tapped to pour,
// layer 2 the same; stills on the way. ENV: FALL=1 lets the third pebble go outside the frame (the flaw → the salt event).
module.exports = async ({ pg, st, shot, log, wait, errs }) => {
  const act = () => pg.evaluate(() => { const a = window.__T.game.h109.act && window.__T.game.h109.act(); return a && a.dbg ? a.dbg() : null; });
  for (let i = 0; i < 60; i++) { const s = await st(); if (s && s.phase === 'act') break; await wait(1000); }
  await wait(1500);
  const drag = async (a, b) => { await pg.mouse.move(a.x, a.y); await pg.mouse.down(); for (let k = 1; k <= 8; k++) { await pg.mouse.move(a.x + (b.x - a.x) * k / 8, a.y + (b.y - a.y) * k / 8); await wait(30); } await wait(120); await pg.mouse.up(); await wait(350); };
  for (const layer of [1, 2]) {
    let d = await act(); log('layer', layer, 'pieces', d.pieces.length, 'cellPx', d.cellPx);
    await shot('orez-l' + layer + '-start');
    for (let i = 0; i < d.pieces.length; i++) {
      d = await act(); const p = d.pieces[i];
      if (process.env.FALL && layer === 1 && i === 2) { await drag(p.scr, { x: p.scr.x + 700, y: p.scr.y + 30 }); log('fall', JSON.stringify((await act()).ev.slice(-2))); await wait(2500); await shot('orez-salt'); const sd = (await act()).salt; log('salt', JSON.stringify(sd)); continue; }
      const to = await pg.evaluate(([i, o, x, z]) => window.__T.game.h109.act().aim(i, o, x, z), [i, p.sol.o, p.sol.x, p.sol.z]);
      await drag(p.scr, to);
      if (i === 2) await shot('orez-l' + layer + '-three');
    }
    d = await act(); log('covered', d.covered, 'canClose', d.canClose, 'loose', d.loose, 'ev', JSON.stringify(d.ev.slice(-3)));
    await shot('orez-l' + layer + '-full');
    await pg.mouse.click(d.pot[0], d.pot[1]); await wait(4000);
    await shot('orez-l' + layer + '-poured');
  }
  for (let i = 0; i < 20; i++) { const s = await st(); log('after', s.phase, s.mission, JSON.stringify(s.act && s.act.ev ? s.act.ev.slice(-3) : '')); if (s.phase !== 'act') break; await wait(1500); if (i === 2) await shot('orez-end'); }
  log('save', await pg.evaluate(() => { const M = window.__T.game.h109.M || null; try { const G = JSON.parse(localStorage.getItem(Object.keys(localStorage).find((k) => /mikdash|temple|save/i.test(k)) || '') || 'null'); return JSON.stringify(G && G.h134 ? { done: G.h134.done, res: G.h134.res, horn: G.h134.horns.SE } : null).slice(0, 600); } catch (e) { return 'n/a ' + e.message; } }));
};
