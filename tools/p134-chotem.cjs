// probe134 script: work 3 at its level — each cup chosen by a tap, drilled with the space bar held briefly (pressure 1) and the bow
// dragged by the mouse (one stroke a drag), to the spec's counts (water 10 after the breaking through, wine 18 / 15 / 13), then the
// handle pulled down for the test. ENV: OFF=n drills the wine n strokes short (a narrow pair: the test fails, then fixed).
module.exports = async ({ pg, st, shot, log, wait }) => {
  const act = () => pg.evaluate(() => { const a = window.__T.game.h109.act && window.__T.game.h109.act(); return a && a.dbg ? a.dbg() : null; });
  for (let i = 0; i < 60; i++) { const s = await st(); if (s && s.phase === 'act') break; await wait(1000); }
  await wait(1500);
  let d = await act(); log('chotem', JSON.stringify(d).slice(0, 500)); await shot('chotem-start');
  const W = await pg.evaluate(() => innerWidth);
  let dir = 1;
  const stroke = async () => {
    d = await act(); const b = { x: d.bow[0], y: d.bow[1] };
    await pg.keyboard.down('Space'); await pg.mouse.move(b.x, b.y); await pg.mouse.down();
    for (let k = 1; k <= 4; k++) { await pg.mouse.move(b.x + dir * 0.17 * W * k / 4, b.y); await wait(15); }
    await pg.mouse.up(); await pg.keyboard.up('Space'); dir = -dir; await wait(60);
  };
  const lv = d.lv, toWine = { 1: 18, 2: 15, 3: 13 }[lv] - (+process.env.OFF || 0);
  for (const [i, side, n] of [[0, 'water', 10], [1, 'wine', toWine]]) {
    d = await act(); await pg.mouse.click(d.cups[i][0], d.cups[i][1]); await wait(300);
    d = await act(); log('sel', d.sel);
    for (let g = 0; g < 30 && !(await act()).c[side].open; g++) await stroke();
    for (let k = 0; k < n; k++) await stroke();
    d = await act(); log(side, JSON.stringify(d.c[side]), 'times', JSON.stringify(d.times));
    if (i === 0) await shot('chotem-water');
  }
  const test = async () => { d = await act(); const a = { x: d.knob[0], y: d.knob[1] }; await pg.mouse.move(a.x, a.y); await pg.mouse.down(); for (let k = 1; k <= 6; k++) { await pg.mouse.move(a.x, a.y + 50 * k / 6); await wait(30); } await pg.mouse.up(); await wait(2000); await shot('chotem-test'); await wait(3500); d = await act(); log('tests', JSON.stringify(d && d.tests), JSON.stringify(d && d.ev.slice(-4))); };
  await test();
  if (process.env.OFF && d && !d.finished) { d = await act(); await pg.mouse.click(d.cups[1][0], d.cups[1][1]); await wait(300); for (let k = 0; k < +process.env.OFF; k++) await stroke(); await test(); }
  for (let i = 0; i < 16; i++) { const s = await st(); log('after', s.phase, s.mission); if (s.phase !== 'act') break; await wait(1500); if (i === 1) await shot('chotem-end'); }
  log('cups', await pg.evaluate(() => { try { const k = Object.keys(localStorage).find((q) => { try { return !!JSON.parse(localStorage.getItem(q)).h134; } catch (e) { return false; } }); const G = JSON.parse(localStorage.getItem(k)); return JSON.stringify(G.h134.cups) + ' ' + JSON.stringify(G.h134.res); } catch (e) { return 'n/a'; } }));
};
