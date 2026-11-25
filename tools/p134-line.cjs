// probe134 script: the opening line of a work — its text and box on the screen (it wraps on a 640-wide phone), and a still.
module.exports = async ({ pg, st, shot, log, wait }) => {
  for (let i = 0; i < 60; i++) { const s = await st(); if (s && s.phase === 'act') break; await wait(500); }
  log('line', await pg.evaluate(() => { const e = document.querySelector('.h109-line'); if (!e) return 'none'; const r = e.getBoundingClientRect(); return JSON.stringify({ t: e.textContent, cls: e.className, r: [r.left, r.top, r.width, r.height].map(Math.round) }); }));
  await shot('line');
};
