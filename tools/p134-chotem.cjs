// probe134 script: work 3 at its level, driven through the act's own fingers (act.down / move / up — the director's path; the cloud's
// software renderer makes real mouse events take seconds each): the cup chosen by a tap, the drill's head held down (pressure 1, a
// second finger) while the bow is drawn to and fro, to the spec's counts (water 10 after the breaking through, wine 18 / 15 / 13), then
// the handle pulled. ENV: OFF=n drills the wine n strokes short (a narrow pair: the test fails, then fixed). One real mouse tap first.
module.exports = async ({ pg, st, shot, log, wait }) => {
  const act = () => pg.evaluate(() => { const a = window.__T.game.h109.act && window.__T.game.h109.act(); return a && a.dbg ? a.dbg() : null; });
  for (let i = 0; i < 60; i++) { const s = await st(); if (s && s.phase === 'act') break; await wait(1000); }
  await wait(1500);
  let d = await act(); log('chotem', JSON.stringify(d).slice(0, 500)); await shot('chotem-start');
  // one real tap (the mouse, through the director): the wine cup chosen
  await pg.mouse.click(d.cups[1][0], d.cups[1][1]); await wait(1500); d = await act(); log('real tap → sel', d.sel);
  const drill = (side, n) => pg.evaluate(async ([side, n, ci]) => {
    const sl = (ms) => new Promise((r) => setTimeout(r, ms)), A = () => window.__T.game.h109.act(), D = () => A().dbg();
    let d = D(); A().down({ id: 11, x: d.cups[ci][0], y: d.cups[ci][1] }); A().up({ id: 11, x: d.cups[ci][0], y: d.cups[ci][1] }); await sl(50);
    d = D(); const H = innerHeight, W = innerWidth, h0 = { x: d.head[0], y: d.head[1] };
    A().down({ id: 12, ...h0 }); A().move({ id: 12, x: h0.x, y: h0.y + 0.05 * H });
    const b = { x: d.bow[0], y: d.bow[1] }; A().down({ id: 13, ...b }); let x = b.x, dir = 1, guard = 0;
    const one = async () => { for (let k = 0; k < 4; k++) { x += dir * 0.045 * W; A().move({ id: 13, x, y: b.y }); await sl(20); } dir = -dir; };
    while (!D().c[side].open && guard++ < 40) await one();
    for (let i = 0; i < n; i++) await one();
    A().up({ id: 13, x, y: b.y }); A().up({ id: 12, x: h0.x, y: h0.y + 0.05 * H });
    return { sel: D().sel, c: D().c[side], times: D().times, ev: D().ev.slice(-3) };
  }, [side, n, side === 'water' ? 0 : 1]);
  const lv = d.lv, toWine = { 1: 18, 2: 15, 3: 13 }[lv] - (+process.env.OFF || 0);
  log('water', JSON.stringify(await drill('water', 10))); await shot('chotem-water');
  log('wine', JSON.stringify(await drill('wine', toWine)));
  const test = async () => {
    await pg.evaluate(async () => { const sl = (ms) => new Promise((r) => setTimeout(r, ms)), A = () => window.__T.game.h109.act(); const d = A().dbg(); A().down({ id: 21, x: d.knob[0], y: d.knob[1] }); for (let k = 1; k <= 5; k++) { A().move({ id: 21, x: d.knob[0], y: d.knob[1] + 0.03 * innerHeight * k }); await sl(30); } A().up({ id: 21, x: d.knob[0], y: d.knob[1] + 0.15 * innerHeight }); });
    await wait(2500); await shot('chotem-test'); await wait(4000); d = await act(); log('tests', JSON.stringify(d && d.tests), JSON.stringify(d && d.ev.slice(-4)));
  };
  await test();
  if (process.env.OFF && d && !d.finished && !d.busy) { log('fix', JSON.stringify(await drill('wine', +process.env.OFF))); await test(); }
  for (let i = 0; i < 16; i++) { const s = await st(); log('after', s.phase, s.mission); if (s.phase !== 'act') break; await wait(1500); if (i === 1) await shot('chotem-end'); }
  log('cups', await pg.evaluate(() => { const M = window.__T.game.h109.M; return M ? JSON.stringify(M.st.cups) + ' ' + JSON.stringify(M.st.res) : 'n/a'; }));
};
