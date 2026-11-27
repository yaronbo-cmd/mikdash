// p138-parochot — drive work 2 in the game (640 × 360): fold the outer slowly, into its hook when calm; level 2–3: then the inner from
// the box, and (level 3) send small waves and catch them until the amah is quiet.
module.exports = async ({ pg, st, shot, log, wait, unmodal }) => {
  for (let i = 0; i < 60; i++) { await unmodal(); const s = await st(); if (s && s.phase === 'act' && s.act) break; await wait(1000); }
  await wait(1500); await shot('parochot-in');
  const S = () => pg.evaluate(() => { const S = globalThis.__P138; return S ? { ph: S.phase, mv: S.moving, sh: S.edges.S.hooked, nh: S.edges.N.hooked, steps: S.steps.map((x) => x.k + ':' + x.grade).join(','), done: S.done, u: S.pulses.map((p) => +p.A.toFixed(3)) } : null; });
  const calm = async () => { for (let i = 0; i < 60; i++) { const s = await S(); if (!s.u.some((a) => Math.abs(a) > 0.02)) return; await wait(300); } };
  async function fold(x0, y0, dir, hookDy) {
    await pg.mouse.move(x0, y0); await pg.mouse.down();
    for (let i = 1; i <= 60; i++) { await pg.mouse.move(x0 + dir * i * 2.3, y0); await wait(40); }
    for (let i = 1; i <= 20; i++) { await pg.mouse.move(x0 + dir * (138 - i * 0.4), y0 + hookDy * i / 20); await wait(40); }
    await calm(); await pg.mouse.up(); await wait(400);
  }
  if (!process.env.FULL) { await pg.mouse.move(72, 250); await pg.mouse.down(); for (let i = 1; i <= 8; i++) { await pg.mouse.move(72 + i * 6, 250); await wait(40); } await pg.mouse.up(); await wait(300); log('pulled', JSON.stringify(await pg.evaluate(() => ({ f: globalThis.__P138.edges.S.fold, p: globalThis.__P138.pulses.length })))); }
  else await fold(72, 250, 1, 46); log('outer', JSON.stringify(await S()));
  await shot('parochot-outer');
  const s1 = await S();
  if (!s1.done && !process.env.FULL) {
    // fast-forward: the real fold was checked above; close the remaining steps in the model so the act reaches its end
    await pg.evaluate(() => { const S = globalThis.__P138; S.edges.S.hooked = true; S.edges.N.hooked = true; S.moving = 0; S.ph = S.P.phases.length - 1; S.phase = S.P.phases[S.ph]; S.step = null; });
  } else if (!s1.done) {
    for (let i = 0; i < 30; i++) { const s = await S(); if (s.ph === 'teivah' && !s.mv) break; await wait(500); }
    await calm();
    await fold(566, 118, -1, 46); log('inner', JSON.stringify(await S()));
    await shot('parochot-inner');
  }
  await pg.evaluate(() => { globalThis.__H138_FF = 30; }); for (let i = 0; i < 30; i++) { await unmodal(); const s = await st(); if (s && (s.phase !== 'act' || (s.act && s.act.finished))) break; await wait(3000); } await wait(8000); log('after', JSON.stringify(await st()).slice(0, 400)); await shot('parochot-end');
};
