// probe136 script: the dawn finale (#shachar: round 1 by the crews) — stills along the way, until the result card
module.exports = async ({ pg, st, shot, log, wait, unmodal }) => {
  for (let i = 0; i < 90; i++) {
    const s = await st(); const card = await pg.evaluate(() => !!document.querySelector('.h136-card'));
    if (i % 4 === 0) { log('state', s && s.phase, s && s.mission, card); await shot('t' + i); }
    if (card) { log('card', await pg.evaluate(() => document.querySelector('.h136-card').innerText.replace(/\n/g, ' | '))); await shot('card'); break; }
    await wait(2000);
  }
};
