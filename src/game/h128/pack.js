/* ── build 128 ── h128/pack.js — stage 06 "שער ניקנור וחמש עשרה המעלות" as a pack for the stage director (h109/director.js `pack`):
 * its plan and save (free choice: model.js createH128), its acts, its world (world.js, drawn from the save); the opening (8 s,
 * skippable: the gate house with no doors and the bare slope where the steps will be); the end (about 40 s, a tap skips a part): the
 * Levites on the fifteen steps before dawn, each ring sounding its note as they step on it (his three as he built them); the sunrise
 * on the closed doors; the north leaf near, its salt stains; the Mishnah's card (content.js `nikanor`) and a small summary card.
 *
 * The sea (station 1, part 3): SEA_IN_PLAY is false until part 3 builds it. While it is false the pack's create() gives the sea's
 * three works to the crews as skipped (st.res[id].skip, st.seaSkip; no stars, no points) so the plan opens at the capstan; the count
 * on the top pill leaves them out. The plan itself keeps all eleven works, so __H109_ONLY pages for capstan, steps, wicket and close
 * and the whole-stage page (__H128_FULL) work today; part 3 turns the flag on and a save with st.seaSkip plays the sea again.
 */
import { PLAN, LINES, createH128 } from './model.js';
import { ACTS } from './acts.js';
import { SH6, initWorld, finalWorld, rebuild } from './world.js';
import { createVoices } from './sound128.js';
import { makeLook, ringBoxes, LOOK_RING_K } from '../world/look.js';
import { stageById } from '../content.js';
import { BOOK } from '../world/grid.js';

export const SEA_IN_PLAY = false;
const S6 = BOOK.s06, CAM = S6.cam;
const LOOK6 = makeLook({ boxes: ringBoxes(BOOK.s02.side, BOOK.s02.ring.T, BOOK.s02.ring.top), K: LOOK_RING_K });
const SEA_IDS = ['sea1', 'sea2', 'sea3'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const beat = (X, ms) => (X && X.wait ? X.wait(ms / 1000) : sleep(ms));
const near = (X, on) => { try { if (X.view && X.view.closeCam) X.view.closeCam(!!on, 'h128-film'); } catch (e) { /* */ } };

/** the sea's works given to the crews (skipped) while the sea is not in play */
export function seaSkip(M) {
  for (const id of SEA_IDS) if (!M.isDone(id)) { M.st.cur = id; M.done({ stars: 0, q: 0, pts: 0 }); M.st.res[id].skip = 1; }
  M.st.seaSkip = 1; return M;
}
export function createStage06(save) { const M = createH128(save); if (!SEA_IN_PLAY) seaSkip(M); return M; }
const skipped = (M) => PLAN.filter((m) => M.st.res[m.id] && M.st.res[m.id].skip).length;

/** a tap anywhere (or `ms`) ends a part of a film */
function tapOr(X, ms) {
  return new Promise((res) => {
    let done = false; const f = () => { if (done) return; done = true; removeEventListener('pointerdown', f, true); res(true); };
    setTimeout(() => addEventListener('pointerdown', f, true), 250);
    beat(X, ms).then(() => { if (!done) { done = true; removeEventListener('pointerdown', f, true); res(false); } });
  });
}
/** a card over the world (the Mishnah's, the summary): title, lines; a tap or `ms` closes it */
function card(X, html, ms = 7000) {
  const el = document.createElement('div'); el.className = 'h109-ui h128-card';
  el.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);max-width:min(560px,86vw);padding:18px 22px;border-radius:16px;background:rgba(255,248,230,.96);color:#3A2608;font:600 17px/1.5 Heebo,system-ui;direction:rtl;text-align:center;z-index:70;box-shadow:0 6px 24px rgba(0,0,0,.35)';
  el.innerHTML = html; document.body.appendChild(el);
  return tapOr(X, ms).then(() => { el.remove(); });
}
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** the light of the end: before dawn (k 0) to the sunrise from the east, low and golden (k 1); restored after */
function dawnRig(X) {
  const S = X.scene, T = X.THREE, R = (globalThis.__T && globalThis.__T.renderer) || null;
  const L = []; S.traverse((o) => { if (o.isDirectionalLight || o.isHemisphereLight || o.isAmbientLight) L.push(o); });
  const saved = { L: L.map((l) => ({ l, i: l.intensity, c: l.color.clone(), g: l.groundColor ? l.groundColor.clone() : null, p: l.position ? l.position.clone() : null, tp: l.target ? l.target.position.clone() : null })), fog: S.fog ? S.fog.color.clone() : null, exp: R ? R.toneMappingExposure : null, envI: S.environmentIntensity };
  const blue = new T.Color('#3A4A78'), gold = new T.Color('#FFB868'), sky = new T.Color('#7A7090'), fogD = new T.Color('#2A3048'), fogG = new T.Color('#E8B888');
  const apply = (k) => {
    for (const s of saved.L) {
      if (s.l.isDirectionalLight) {
        s.l.intensity = s.i * (0.18 + 0.95 * k); s.l.color.copy(blue).lerp(gold, k);
        if (s.p && s.l.target) { const tp = s.l.target.position, d = s.p.distanceTo(s.tp || tp) || 400; s.l.position.set(tp.x + d * 0.92, tp.y + d * (0.08 + 0.25 * k), tp.z + d * 0.12); }
      } else if (s.l.isHemisphereLight) { s.l.intensity = s.i * (0.35 + 0.45 * k); s.l.color.copy(blue).lerp(sky, k); }
      else s.l.intensity = s.i * (0.3 + 0.5 * k);
    }
    if (S.fog && saved.fog) S.fog.color.copy(fogD).lerp(fogG, k);
    S.environmentIntensity = (saved.envI == null ? 1 : saved.envI) * (0.3 + 0.7 * k);
  };
  return {
    apply,
    off() { for (const s of saved.L) { s.l.intensity = s.i; s.l.color.copy(s.c); if (s.g) s.l.groundColor.copy(s.g); if (s.p) s.l.position.copy(s.p); } if (S.fog && saved.fog) S.fog.color.copy(saved.fog); if (R && saved.exp != null) R.toneMappingExposure = saved.exp; if (saved.envI != null) S.environmentIntensity = saved.envI; },
  };
}

export function makePack06() {
  const P = {
    id: 'nikanor', key: 'h128', name: 'שער ניקנור', PLAN, ACTS, icon: '🚪',
    create: (save) => createStage06(save),
    count: (M) => { const k = skipped(M); return [M.nDone() - k, PLAN.length - k]; },
    freeFilms: true,
    look: LOOK6,
    endTitle: 'שער ניקנור נבנה!',
    endSub: 'חמש עשרה המעלות · מוקפות כחצי גורן עגולה (מידות ב, ה)',
    film: CAM.film,
    /** the world as the save has it (world.js rebuilds on a key; here only the stage's end: everything closed) */
    sync(M, S0, instant, X) { if (!X || !SH6.X) return; if (M.finished() && !SH6.final) finalWorld(X); else if (instant) rebuild(X, true); },
    unitEnd: () => null,
    /** the opening (8 s, skippable): the Mount from high, the gate house with no doors, the bare slope; the line of the stage */
    before(m, X, M) {
      const st = M.st;
      if (m || st.intro) return null;
      return (async () => {
        st.intro = 1; X.save(); near(X, true);
        X.shot(CAM.open[0][0], CAM.open[0][1], 0.01); await beat(X, 200);
        X.line(LINES.stage, 0);
        X.shot(CAM.open[1][0], CAM.open[1][1], 2.6);
        if (await tapOr(X, 3400)) { X.line(''); near(X, false); return; }
        X.shot(CAM.open[2][0], CAM.open[2][1], 2.2);
        await tapOr(X, 3600);
        X.line(''); near(X, false);
      })();
    },
    /** the end: the Levites on the steps before dawn, the sunrise on the doors, the north leaf's salt, the Mishnah's card, the summary */
    async finale(X) {
      near(X, true); X.line(''); finalWorld(X);
      const st = X.M.st, V = createVoices(X.sfx), rig = dawnRig(X), lev = [];
      try {
        rig.apply(0);
        // 1. the Levites climb the fifteen steps; each ring sounds its note as they step on it (his three as he built them)
        X.shot(CAM.endSteps[0], CAM.endSteps[1], 1.2);
        X.line(LINES.levites, 0);
        const fr = S6.levites.from, to = S6.levites.to, crew = SH6.crew;
        for (let k = 0; k < 6; k++) { const w = crew && crew.add(fr[0] + (k % 3) * 1.6, fr[1] + Math.floor(k / 3) * 2.4 - 1.2, { variant: 'levite', item: k % 2 ? 'kinor' : 'nevel', crew: 0, tunic: '#F4F1E8' }); if (w) { w.a.playing = true; lev.push(w); } }
        const C0 = S6.steps.c, R1 = S6.steps.R1, tread = S6.steps.tread;
        let skip = false; const sk = () => { skip = true; }; addEventListener('pointerdown', sk, true);
        for (let i = 1; i <= 15 && !skip; i++) {
          const r = R1 - tread * (i - 0.5);
          lev.forEach((w, k) => { w.a.path = [[C0[0] + r, (k % 3 - 1) * 1.6]]; w.a.pi = 0; w.a.speed = 1.6; w.a.walkT0 = undefined; });
          const rec = st.rings[i], dull = !!(rec && (rec.crack || rec.corner));
          await beat(X, i === 1 ? 2400 : 520);
          V.step(i, dull);
        }
        removeEventListener('pointerdown', sk, true);
        lev.forEach((w) => { w.a.path = [[to[0], (w.a.z > 0 ? 1 : -1) * 2]]; w.a.pi = 0; });
        await beat(X, 900);
        // 2. the sun rises in the east; its light falls on the closed doors: the bronze turns yellow like gold
        X.line(''); X.shot(CAM.endSun[0], CAM.endSun[1], 2.4);
        for (let k = 0; k <= 30; k++) { rig.apply(k / 30); await beat(X, 90); }
        V.gong(98, false);
        await tapOr(X, 2600);
        // 3. near the north leaf: the salt stains (no words)
        X.shot(CAM.endSalt[0], CAM.endSalt[1], 2.2);
        await tapOr(X, 4200);
        // 4. the Mishnah's card (content.js 'nikanor'), then the summary card
        const c = (stageById('nikanor') || {}).card || {};
        await card(X, `<b style="font:900 20px Heebo,system-ui">שער ניקנור</b><p style="margin:10px 0">${esc(c.q || '')}</p><small>(${esc(c.ref || '')})</small>`, 9000);
        const done = PLAN.filter((m2) => !(st.res[m2.id] && st.res[m2.id].skip)), stars = done.reduce((a, m2) => a + ((st.res[m2.id] && st.res[m2.id].stars) | 0), 0);
        const dmg = [];
        if ((st.cap.timber || []).length) dmg.push('קורה שבורה בכבש');
        for (const i of [1, 8, 15]) { const r = st.rings[i]; if (r && r.crack) dmg.push(`אבן סדוקה במעלה ${i}`); if (r && r.corner) dmg.push(`פינה חסרה באבן הסגירה של מעלה ${i}`); }
        for (const k of ['N', 'S']) if ((st.bolts[k].tooth || []).some(Boolean)) dmg.push(`שן עקומה בפשפש ה${k === 'N' ? 'צפוני' : 'דרומי'}`);
        if ((st.close.dent || []).some(Boolean)) dmg.push('שקע בכנף השער');
        await card(X, `<b style="font:900 20px Heebo,system-ui">שער ניקנור וחמש עשרה המעלות</b><p style="margin:8px 0">${done.length} עבודות · ${'★'.repeat(Math.min(3, Math.round(stars / Math.max(1, done.length))))} (${stars} כוכבים)</p><small>${dmg.length ? 'נשאר בעולם: ' + esc(dmg.join(' · ')) : 'בלי נזק אחד'}</small>`, 7000);
      } catch (e) { console.warn('[h128] finale', e && e.message); }
      for (const w of lev) try { SH6.crew.remove(w); } catch (e) { /* */ }
      rig.off(); X.line(''); near(X, false);
      st.film = 1; X.save();
    },
    /** after a reload, the stage done: the gate, its doors and steps as he built them */
    rest(X) { initWorld(X); finalWorld(X); },
    dispose() {},
  };
  return P;
}
