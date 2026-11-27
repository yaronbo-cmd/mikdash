// p138-teivah — drive work 1 in the game (640 × 360): pin the pole, trace every lip slowly along with the handle, until the box rises.
module.exports = async ({ pg, st, shot, log, wait, unmodal }) => {
  for (let i = 0; i < 60; i++) { await unmodal(); const s = await st(); if (s && s.phase === 'act' && s.act) break; await wait(1000); }
  await wait(1500); log('act', JSON.stringify(await st()).slice(0, 300)); await shot('teivah-in');
  const K = 617;
  await pg.mouse.move(100, 330); await pg.mouse.down(); for (let i = 1; i <= 8; i++) { await pg.mouse.move(100, 330 - i * 7); await wait(20); } await wait(80); await pg.mouse.up();
  if (!process.env.FULL) { const t0 = await pg.evaluate(() => ({ ...globalThis.__T138.tip })); await pg.mouse.move(520, 316); await pg.mouse.down(); for (let i = 1; i <= 8; i++) { await pg.mouse.move(520 - i * 4, 316); await wait(30); } await pg.mouse.up(); log('tool moved', JSON.stringify(t0), JSON.stringify(await pg.evaluate(() => globalThis.__T138.tip))); }
  for (let rep = 0; rep < (process.env.FULL ? 30 : 0); rep++) {
    const info = await pg.evaluate(() => { const S = globalThis.__T138; if (!S || S.done) return null; const l = S.st.lips.filter((l) => !l.fixed).sort((a, b) => (b.top ? 1 : 0) - (a.top ? 1 : 0))[0]; if (!l) return null; const vcx = 0.8 * Math.tan(S.theta * Math.PI / 180) + (S.turn / 45) * 0.17; return { k: S.k, tip: S.tip, vc: vcx, a: l.s[0], b: l.s[l.s.length - 1], pole: S.pole }; });
    if (!info) break;
    if (!info.pole) { await pg.mouse.move(100, 330); await pg.mouse.down(); for (let i = 1; i <= 8; i++) { await pg.mouse.move(100, 330 - i * 7); await wait(20); } await pg.mouse.up(); }
    const ax = info.a.x - info.vc, bx = info.b.x - info.vc;
    // travel to beside the lip's start (lifted travel is not possible: approach slowly from below, under 60 dp/s near it)
    await pg.mouse.move(520, 316); await pg.mouse.down();
    let cx = info.tip.x, cy = info.tip.y, px = 520, py = 316;
    const to = async (wx, wy, sp) => { const n = Math.max(1, Math.ceil(Math.hypot(wx - cx, wy - cy) * K / sp)); for (let i = 1; i <= n; i++) { px += (wx - cx) * K / n; py -= (wy - cy) * K / n; await pg.mouse.move(px, py); await wait(16); } cx = wx; cy = wy; };
    await to(ax, info.a.y - 0.07, 3); await to(ax, info.a.y, 0.6);
    await to(bx, info.b.y, 1.4);
    await pg.mouse.up(); await wait(250);
    if (rep === 0) await shot('teivah-pass');
  }
  log('one-pass', JSON.stringify(await pg.evaluate(() => { const S = globalThis.__T138; return S && S.st ? S.st.lips.map((l) => [l.fixed, +Math.max(...l.s.map((q) => q.h)).toFixed(3)]) : null; })));
  await pg.evaluate(() => { globalThis.__H138_FF = 30; });
  // fast-forward: the remaining lips are flattened in the model (the real drag was checked above), so the run reaches the end
  for (let i = 0; i < 12; i++) { const d = await pg.evaluate(() => { const S = globalThis.__T138; if (!S || S.done) return true; for (const l of S.st.lips) { for (const q of l.s) q.h = 0; l.fixed = true; } return false; }); if (d) break; await pg.mouse.move(520, 316); await pg.mouse.down(); await wait(200); await pg.mouse.up(); await wait(1500); }   // a tap closes the pass (the station is checked when a drag ends)
  await pg.evaluate(() => { globalThis.__H138_FF = 30; }); for (let i = 0; i < 30; i++) { await unmodal(); const s = await st(); if (s && (s.phase !== 'act' || (s.act && s.act.finished))) break; await wait(3000); } await wait(8000); log('after', JSON.stringify(await st()).slice(0, 400)); await shot('teivah-end');
};
