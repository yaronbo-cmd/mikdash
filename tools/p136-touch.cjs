// probe136 script: the act's own fingers (not the bot): a drag on what the act draws, its update(1/60) in-page; reports what changed
module.exports = async ({ pg, st, shot, log, wait }) => {
  for (let i = 0; i < 80; i++) { const s = await st(); if (s && s.phase === 'act') break; await wait(1000); }
  await wait(1500);
  const r = await pg.evaluate(() => {
    const a = window.__T.game.h109.act(), d0 = a.dbg(), out = { d0: JSON.stringify(d0).slice(0, 300) };
    const run = (n) => { for (let k = 0; k < n; k++) a.update(1 / 60); };
    const px = innerHeight / 360;
    if (d0.id.startsWith('maltra')) {
      run(150);   // (the swing-in)
      const h = d0.handles[0], th0 = a.dbg().th;
      a.down({ id: 7, x: h[0], y: h[1] }); for (let k = 0; k < 20; k++) { a.move({ id: 7, x: h[0], y: h[1] + k * 3 * px }); run(1); } run(60);
      out.pull = { th0, th1: a.dbg().th, T: a.dbg().T, wants: a.wants({ x: h[0], y: h[1] }) };
      a.up({ id: 7, x: h[0], y: h[1] + 60 * px }); run(10); out.after = a.dbg().T;
    } else if (d0.id.startsWith('kelonsa')) {
      const s = d0.strap, px0 = d0.px;
      a.down({ id: 7, x: s[0], y: s[1] }); for (let k = 0; k < 40; k++) { a.move({ id: 7, x: s[0] - k * 4 * px, y: s[1] }); run(2); }
      out.slide = { px0, px1: a.dbg().px, ev: a.dbg().ev, wants: a.wants({ x: s[0], y: s[1] }) }; a.up({ id: 7, x: s[0], y: s[1] }); run(5);
    } else {
      const d = a.dbg(), L = d.hands.L, h0 = d.h;
      a.down({ id: 7, x: L[0] - 8, y: L[1] }); for (let k = 0; k < 12; k++) { a.move({ id: 7, x: L[0] - 8, y: L[1] - k * 6 * px }); run(1); }
      out.mid = { air: a.dbg().air, tgt: a.dbg().tgt }; a.up({ id: 7, x: L[0] - 8, y: L[1] - 66 * px }); run(5);
      out.grab = { h0, h1: a.dbg().h, steps: a.dbg().steps, ev: a.dbg().ev };
    }
    return out;
  });
  log('touch', JSON.stringify(r).slice(0, 1200)); await shot('touch');
};
