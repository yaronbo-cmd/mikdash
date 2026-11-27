/* ── build 138 ── h138/kit15.js — what the acts of stage 15 share: the 2D screen over the game (screen.js) as an act of the director.
 * The view from inside the teivah fills the whole screen, and the amah's section is drawn as the gray prototype proved it (build 138:
 * the prototypes ירון tries on his phone and the game run the same view code). While the act runs the canvas lies over the world (the
 * world is not drawn through it), its fingers are its own; the points go to the one old system (X.bonus, X.loss: −20 × the level, kept
 * in the save by Mo.flaw), the stars and the full-screen perfect to the director (X.end). */
import { makeScreen } from './screen.js';
import { mulOf } from './model.js';

export function overlayAct(m, X, viewOf, o = {}) {
  const lv = m.lv | 0 || 1, Mo = X.M;
  const A = { t: 0, ended: false, finished: false, el: null, SC: null, view: null, ev: [] };
  const flawOf = o.flawOf || (() => null);
  function begin() {
    const cv = document.createElement('canvas'); cv.className = 'h109-ui h138-screen';
    cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:55;display:block;background:#000;touch-action:none;pointer-events:auto';
    document.body.appendChild(cv); A.el = cv;
    A.SC = makeScreen(cv, {
      add(n, why) { if (n > 0) { try { X.bonus(n, 'h138-' + why, ''); } catch (e) { /* */ } } },
      loss(n, label, at) { const f = flawOf(label); try { if (f && Mo.flaw) Mo.flaw(f, { lv }); } catch (e) { /* */ } try { X.loss(n, { sx: at.x, sy: at.y }, label); } catch (e) { /* */ } return true; },
      audio: () => { try { return X.sfx && X.sfx.context; } catch (e) { return null; } },
      get muted() { try { return !!(X.sfx && X.sfx.muted); } catch (e) { return false; } },
    });
    try { X.kohen(false); } catch (e) { /* */ }
    try { X.line(''); } catch (e) { /* */ }
    A.view = viewOf(A.SC, lv, {
      onEnd(r) { if (A.finished) return; A.finished = true; A.res = r; setTimeout(() => { try { X.end({ stars: r.stars, q: r.q, pts: r.pts, perfect: r.perfect, flags: { dmg: r.dmg } }); } catch (e) { /* */ } }, 300); },
      onEvent(e) { A.ev.push(e.e); if (A.ev.length > 30) A.ev.shift(); if (o.onEvent) o.onEvent(e); },
    });
  }
  return {
    close: true, kohenWorks: false,
    begin,
    update(dt) { A.t += dt; try { if (A.view) { const k = Math.min(40, globalThis.__H138_FF | 0 || 1); for (let i = 0; i < k; i++) A.view.frame(dt); } }   /* __H138_FF: the probes' fast-forward (slow headless frames) */ catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h138]', m.k, e && e.message); } } },
    down() {}, move() {}, up() {}, cancel() {},
    wants() { return false; }, holds() { return !!(A.SC && A.SC.F.size); },
    end() { A.ended = true; try { A.SC && A.SC.dispose(); } catch (e) { /* */ } try { A.el && A.el.remove(); } catch (e) { /* */ } try { X.kohen(true); } catch (e) { /* */ } },
    at() { return null; },
    dbg() { const S = A.view && A.view.S; return { id: m.id, lv, finished: A.finished, ev: A.ev.slice(-10), k: S && S.k, steps: S && S.steps ? S.steps.map((s) => s.grade[0]).join('') : S && S.grades ? S.grades.join(',') : null }; },
    probe() { return { A, S: A.view && A.view.S }; },
    mul: mulOf(lv),
  };
}
