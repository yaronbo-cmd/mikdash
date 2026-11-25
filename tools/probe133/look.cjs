module.exports = async ({ pg, st, shot, log, wait, unmodal }) => {
  let s; for (let i = 0; i < 80; i++) { await unmodal(); s = await st(); if (s && s.phase === 'act' && s.act && s.act.t > 1) break; await wait(500); }
  await wait(4000); await shot('look'); s = await st(); log(JSON.stringify({ cam: s.act.cam, eye: s.act.eye, base: s.act.base, e0: s.act.e0, stone: s.act.stone, look: s.look, wl: s.wl, fov: s.fov })); log(await pg.evaluate(() => { const c = window.__T.camera; return JSON.stringify([c.position.x, c.position.y, c.position.z, c.fov]); }));
};
