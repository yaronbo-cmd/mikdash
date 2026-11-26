// probe137 script: a work driven fast by its model's bot through the act's own probe() (the cloud's renderer draws ~1 frame a second):
// the act's update(1/60) called in-page with the bot's inputs fed into the act's model; stills on the way and the result.
//   env: BOT='{"two":true}' (the bot's options)
module.exports = async ({ pg, st, shot, log, wait }) => {
  for (let i = 0; i < 80; i++) { const s = await st(); if (s && s.phase === 'act') break; if (i % 5 === 0) log('wait', s && s.phase, s && s.mission); await wait(1000); }
  await wait(1500);
  log('start', JSON.stringify(await pg.evaluate(() => window.__T.game.h109.act().dbg())).slice(0, 700)); await shot('start');
  const O = JSON.parse(process.env.BOT || '{}');
  for (let leg = 0; leg < 60; leg++) {
    const r = await pg.evaluate(([O]) => {
      const A = () => window.__T.game.h109.act(); const a = A(); if (!a || !a.probe) return null;
      const { S, K, A: In } = a.probe();
      if (!In.feed) In.feed = (S2) => K.bot(S2, O);
      for (let k = 0; k < 300; k++) { const d = a.dbg(); if (d.finished || d.busy) return d; a.update(1 / 60); }
      return a.dbg();
    }, [O]);
    if (!r) break;
    log('leg', leg, JSON.stringify(r).slice(0, 420));
    if (leg === 1) await shot('mid');
    if (r.finished || r.busy) break;
  }
  await shot('end');
  for (let i = 0; i < 16; i++) { const s = await st(); log('after', s.phase, s.mission); if (s.phase !== 'act') break; await wait(1500); }
  await shot('after');
  log('res', await pg.evaluate(() => { const M = window.__T.game.h109.M; return M ? JSON.stringify({ res: M.st.res, flaws: M.st.flaws, walls: M.st.walls, planks: (M.st.planks || []).length, corners: M.st.corners }) : 'n/a'; }));
};
