/* ── build 138 ── h138/pack.js — stage 15 "קודש הקדשים" (spec docs/specs/shlav-15-he.md v4) as a pack for the stage director
 * (h109/director.js `pack`): its plan and save (model.js createH138: a level per work per visit), its acts (acts.js), its world (world.js).
 * The opening (rule 3: where am I): from the Heichal's door westward, the west end where the two parochot will hang and, past it, only
 * black — the room nobody sees; a tap skips it. After work 1 the parochot hang by themselves (a short look, once).
 * THE FINALE IS OPEN (the owner 27.11 11:31 UTC: a crescendo with a flood of dopamine, or straight to the film; a brainstorm first): for
 * now the stage ends on the result card after work 2 — no finale of its own is built until he decides. */
import { h131Card } from '../h131/card.js';
import { PLAN, LINES, NEXT_STAGE, TITLES, KINDS, LOSS, MUL, createH138, fromOld } from './model.js';
import { ACTS } from './acts.js';
import { SH15, initWorld, finalWorld, restWorld, sync as syncWorld } from './world.js';
import { endRound } from '../h137/pack.js';
import { BOOK } from '../world/grid.js';

const B = BOOK.s15;
const near = (X, on) => { try { if (X.view && X.view.closeCam) X.view.closeCam(!!on, 'h138-film'); } catch (e) { /* */ } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const beat = (X, ms) => (X && X.wait ? X.wait(ms / 1000) : sleep(ms));
function tapOr(X, ms) {
  return new Promise((res) => {
    let done = false; const f = () => { if (done) return; done = true; removeEventListener('pointerdown', f, true); res(true); };
    setTimeout(() => addEventListener('pointerdown', f, true), 250);
    beat(X, ms).then(() => { if (!done) { done = true; removeEventListener('pointerdown', f, true); res(false); } });
  });
}
/** an old save whose old stage 15 ('kodesh') was done: the new stage stands built by the crews */
export function migrate15(G, oldDone) { if (!G || G.h138 || !oldDone) return false; G.h138 = fromOld(true); return true; }
const starsOf = (st, k) => Math.max(0, ...[1, 2, 3].map((lv) => (st.res[k + lv] ? st.res[k + lv].stars | 0 : 0)));
export function againOf(M) { const c = KINDS.map((k) => [k, starsOf(M.st, k)]); c.sort((a, b) => a[1] - b[1]); return c[0][0]; }
function pointsRows(st) {
  let base = 0, lvb = 0; for (const [id, r] of Object.entries(st.res || {})) { const lv = +String(id).slice(-1) || 1, p = (r && r.pts) | 0; base += p; lvb += p * ((MUL[lv] || 1) - 1); }
  return `<ul class="pts"><li>נקודות העבודות: ${base}</li>${lvb ? `<li>בונוס הרמה: ${lvb}</li>` : ''}<li>הרצף הטוב ביותר: ${st.best | 0}</li></ul>`;
}
function resultCard(M) {
  return new Promise((res) => {
    if (typeof document === 'undefined') { res(null); return; }
    const st = M.st, best = st.bestOf || {}, row = (w) => { const b = best[w]; const s = b ? b.stars | 0 : starsOf(st, w); return `<li><b>${TITLES[w]}</b> <i>${'★'.repeat(s)}${'☆'.repeat(3 - s)}</i></li>`; };
    const fl = {}; for (const x of st.flaws || []) fl[x.f] = (fl[x.f] || 0) + 1;
    const fls = Object.entries(fl).map(([f, n]) => `<li>${LOSS[f] ? LOSS[f][0] : f}${n > 1 ? ` ×${n}` : ''}</li>`).join('') || '<li>אין נזקים למראה</li>';
    const low = againOf(M);
    const el = document.createElement('div'); el.className = 'h109-ui h138-card';
    el.innerHTML = `<style>.h138-card{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:rgba(14,10,4,.5);font-family:Heebo,system-ui;direction:rtl}.h138-card>div{background:#FBF6EA;color:#3A2A14;border-radius:16px;padding:14px 22px;width:min(92vw,560px);max-height:92vh;overflow:auto;box-shadow:0 8px 30px rgba(0,0,0,.35)}.h138-card h3{margin:0 0 4px;font-size:22px}.h138-card ul{margin:2px 0 6px;padding:0 18px;font-size:15px;line-height:1.35}.h138-card ul.r,.h138-card ul.pts{display:flex;flex-wrap:wrap;gap:2px 18px;list-style:none;padding:0}.h138-card i{color:#C08A1A;font-style:normal;letter-spacing:1px}.h138-card .w{color:#2E7A3A;font-weight:800}.h138-card button{font:800 17px Heebo,system-ui;border:0;border-radius:12px;padding:10px 16px;margin-inline-end:8px;min-height:44px;background:#C08A1A;color:#fff}.h138-card button.b{background:#E8DCC2;color:#3A2A14}</style>`
      + `<div><h3>קודש הקדשים</h3><div class="w">הזהב תוקן מבפנים בלי לראות, ושתי הפרוכות פרופות: החיצונה מן הדרום והפנימית מן הצפון (יומא ה, א)</div><ul class="r">${KINDS.map(row).join('')}</ul>${pointsRows(st)}<b>מה נשאר בעולם</b><ul>${fls}</ul><button class="a">שוב, לשיפור: ${TITLES[low]}</button><button class="b">להמשיך</button></div>`;
    document.body.appendChild(el);
    const close = (v) => { try { el.remove(); } catch (e) { /* */ } res(v); };
    el.querySelector('.a').addEventListener('click', (e) => { e.stopPropagation(); close(low); });
    el.querySelector('.b').addEventListener('click', (e) => { e.stopPropagation(); close(null); });
    setTimeout(() => close(null), 25000);
  });
}
/** the parochot hanging by themselves after work 1 (once): a short look at the west end */
async function hungLook(X) {
  if (SH15.looking) return; SH15.looking = true;
  try { near(X, true); X.shot([-120, 34, 8], [-138.5, 30, 0], 1.6); try { X.line('שתי הפרוכות נתלות, וביניהן אמה (יומא ה, א)', 3600); } catch (e) { /* */ } await beat(X, 2600); }
  finally { SH15.looking = false; near(X, false); }
}
export function makePack15(env = {}) {
  const RD = endRound();
  const P = {
    time: env,
    id: 'kodesh', key: 'h138', wordScreen: true,
    name: 'קודש הקדשים', PLAN, ACTS, icon: '🕯',
    create: (save) => createH138(save),
    count: (M) => M.count(),
    freeFilms: true,
    workLinks: true,
    workSeed(M) { M.st.intro = 1; M.st.look = 1; },
    quiet: true,
    byPlan: true,
    endTitle: 'קודש הקדשים נבנה!',
    upStrip: true,
    endSub: 'שתי פרוכות, וביניהן אמה (יומא ה, א)',
    nextStage: NEXT_STAGE,
    endView: [RD[0][0], RD[0][1]],
    film: endRound(3),
    sync(M, S0, instant, X) {
      if (!X || !SH15.X) return;
      if (M.finished() && !M.mission()) finalWorld(X);
      const h = M.hungWanted();
      if (h > (M.st.look | 0) && !(X.acting && X.acting())) { M.st.look = h; M.st.hung = 1; X.save(); syncWorld(X, M); hungLook(X).catch(() => {}); }
    },
    visits: true,
    unitEnd: () => null,
    before(m, X, M) {
      try { globalThis.__H138_X = X; } catch (e) { /* (the probes) */ }
      const st = M.st;
      if (m || st.intro) return null;
      return (async () => {
        st.intro = 1; X.save(); near(X, true);
        X.line(LINES.stage, 0);
        X.shot([-100, 30, 0], [-145, 32, 0], 0.01);
        X.shot([-118, 32, 0], [-150, 32, 0], 5);
        await tapOr(X, 5200);
        X.line('');
        try { X.stages.hero.place({ x: B.stand.heichal.x + 4, z: 0, face: [-150, 0] }); } catch (e) { /* */ }
        near(X, false);
      })();
    },
    /** the finale is open (see above): the result card only */
    async finale(X) {
      const M = X.M; finalWorld(X);
      const low = await resultCard(M);
      if (low) { P.again = low; try { X.line(`שוב, לשיפור: ${TITLES[low]}. הולכים אל העבודה`, 4000); } catch (e) { /* */ } }
      h131Card(true);
    },
    rest(X, M) { restWorld(X, M); },
    dispose() {},
  };
  void initWorld;
  return P;
}
