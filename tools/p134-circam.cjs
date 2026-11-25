// probe134 script: the circuit's camera — the circuit set by hand at points of its path (the foot, half up the kevesh, each horn's
// stand), a still and the camera's numbers at each (the cloud draws ~1 frame a second: no walking).
module.exports = async ({ pg, st, shot, log, wait, unmodal }) => {
  for (let i = 0; i < 60; i++) { const s = await st(); if (s && s.mission) break; await wait(1000); }
  await pg.evaluate(() => { const H = window.__T.game.h109; H._goId(H.M.mission() ? H.M.mission().id : 'chilutzSW1'); });
  for (let i = 0; i < 60; i++) { const s = await st(); if (s.phase === 'act') break; await wait(1000); }
  await wait(1000); await pg.evaluate(() => window.__T.game.h109._end({ stars: 3, q: 1, pts: 120 }));
  for (let i = 0; i < 90; i++) { if (await pg.evaluate(() => !!window.__H134_CIRCUIT)) break; await unmodal(); await wait(1000); }
  const P = [['foot', -38, 44, -1, 0], ['ramp', -38, 26, -1, 0], ['SE', -25.5, 9, 0, 0], ['NE', -25.5, -16, 0, 1], ['NW', -50.5, -16, 0, 2]];
  for (const [n, x, z, leg, i] of P) {
    await pg.evaluate(([x, z, leg, i]) => { const C = window.__H134_CIRCUIT; C.x = x; C.z = z; C.leg = leg; C.i = i; C.at = leg >= 0; C.idle = 0; C.held = { id: 999 }; C.eye = null; }, [x, z, leg, i]);
    await wait(6000);
    log(n, await pg.evaluate(() => { const c = window.__H134_X.camera, C = window.__H134_CIRCUIT; return JSON.stringify({ cam: [c.position.x, c.position.y, c.position.z].map((v) => +v.toFixed(1)), eye: C.eye && C.eye.map((v) => +v.toFixed(1)), C: [C.x, C.y, C.z].map((v) => +v.toFixed(1)), fov: c.fov }); }));
    await shot('cam-' + n);
  }
};
