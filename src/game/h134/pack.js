/* ── build 134 ── h134/pack.js — stage 11 "הקרנות" (spec docs/specs/shlav-11-he.md v4) as a pack for the stage director
 * (h109/director.js `pack`): its plan and save (model.js createH134: a level per station per visit), its acts (acts.js), its world
 * (world.js); the opening (rule 3: where am I — the altar's top from the south-east, the four frames at its corners; a tap skips it);
 * the circuit (spec "סיום השלב: ההקפה הראשונה", once, alone, no points; Zevachim 5:3 "ובא לו לקרן דרומית מזרחית, מזרחית צפונית,
 * צפונית מערבית, מערבית דרומית"): the kohen up the kevesh, the work thumb held leads him along the priests' walk; at each horn a tap
 * on it — the horn in its turn glints, one out of turn only trembles a little; a flawed horn does not glint and its white salt patch
 * stands out. After the fourth the camera pulls back at once to the whole altar; fireworks fill the screen only when no horn is
 * flawed ("המזבח שלם"), else the flawed horn keeps a faint light. Then the result card (as stage 10's) with "שוב, לשיפור" — the
 * repair of a flawed horn, or the station with the fewest stars.
 */
import { h131Card } from '../h131/card.js';
import { PLAN, LINES, NEXT_STAGE, TITLES, CORNERS, RU, LOSS, MUL, createH134, fromOld } from './model.js';
import { ACTS } from './acts.js';
import { SH11, initWorld, finalWorld, restWorld } from './world.js';
import { mats11 } from './look.js';
import { filmFigs } from '../h128/figgate.js';
import { createGang, createBeat } from '../h109/kit.js';
import { box } from '../h131/world.js';
import { BOOK } from '../world/grid.js';

const S11 = BOOK.s11, S10 = BOOK.s10, CAM = S11.cam, END = CAM.end, R = S10.ramp, F = S11.floor, Y1 = S11.top, MID = S11.mid;
const near = (X, on) => { try { if (X.view && X.view.closeCam) X.view.closeCam(!!on, 'h134-film'); } catch (e) { /* */ } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const beat = (X, ms) => (X && X.wait ? X.wait(ms / 1000) : sleep(ms));
function tapOr(X, ms) {
  return new Promise((res) => {
    let done = false; const f = () => { if (done) return; done = true; removeEventListener('pointerdown', f, true); res(true); };
    setTimeout(() => addEventListener('pointerdown', f, true), 250);
    beat(X, ms).then(() => { if (!done) { done = true; removeEventListener('pointerdown', f, true); res(false); } });
  });
}
/** the end's round over the altar (cam:end: a circle round the middle) */
export function endRound(n = 4) {
  const [cx, cz] = END.c, out = [];
  for (let i = 0; i < n; i++) { const a = Math.PI / 4 + (i / n) * Math.PI * 2; out.push([[cx + Math.cos(a) * END.R, END.y, cz + Math.sin(a) * END.R], [cx, Y1, cz], 2.2]); }
  return out;
}
/** an old save whose old stage 11 ('karnot') was done: the new stage stands built by the crews */
export function migrate11(G, oldDone) {
  if (!G || G.h134) return false;
  if (!oldDone) return false;
  G.h134 = fromOld(true); return true;
}
const frames = (fn) => new Promise((res) => { let last = performance.now(); const cap = globalThis.__H134_AUTO_CIRCUIT ? 1 : 0.1; const go = (ms) => { const dt = Math.min(cap, (ms - last) / 1000); last = ms; if (fn(dt)) res(); else requestAnimationFrame(go); }; requestAnimationFrame(go); });
const UI = (e) => !!(e.target && e.target.closest && e.target.closest('button,.gm-top,.gm-menu,.gm-modal'));

/** the circuit's path: up the kevesh to its head, then along the priests' walk to each horn's stand in the Mishna's order */
export function circuitPath() {
  const head = [(R.x0 + R.x1) / 2, R.head - 1.2];
  return { foot: [(R.x0 + R.x1) / 2, R.foot + 1.5], head, legs: CORNERS.map((c) => S11.horns[c].stand.slice()) };
}
/** the circuit (once, alone, no points) → { root, gang, flawed: [corners] } when the fourth horn was touched */
export async function circuit(X, opts = {}) {
  const T = X.THREE, Mt = mats11(X), M = X.M, root = new T.Group(); root.name = 'h134-circuit'; X.props.root.add(root);
  const P = circuitPath(), flawed = CORNERS.filter((c) => M.flawed(c));
  const C = { x: P.foot[0], z: P.foot[1], y: F, t: 0, idle: 0, held: null, leg: -1, i: 0, at: false, touched: [], shake: null, glint: [], done: false };
  try { globalThis.__H134_CIRCUIT = C; } catch (e) { /* (the probes' eyes) */ }
  const Bt = createBeat(X), gang = createGang(X);
  const k = gang.add(C.x, C.z, { role: 'hold', variant: 'kohen', item: null, fx: C.x, fz: C.z - 5 }); if (opts.keep) opts.keep.push(k); if (k && k.a) k.a.fixedY = F;
  // (the first stills: 'carry' gave him a stone on a barrow; build 134, r13 stills: the finale's figures gate hid him — he and the crews are the film's own)
  // the crews below the altar, on the court's floor, watching
  const crew = []; for (let i = 0; i < 6; i++) { const z = 40 - i * 5, side = i % 2 ? R.x0 - 1.4 : R.x1 + 1.4; const w = gang.add(side, z, { role: 'point', crew: i, fx: (R.x0 + R.x1) / 2, fz: z }); if (w && w.a) w.a.fixedY = F; crew.push(w); if (opts.keep) opts.keep.push(w); }
  X.line('ההקפה: החזיקו אצבע על המסך והכהן הולך. נגעו בכל קרן כשהיא מוארת, לפי הסדר', 4200);
  near(X, true);
  const hornAt = (c) => { const h = S11.horns[c]; return [(h.box[0] + h.box[2]) / 2, (h.box[1] + h.box[3]) / 2]; };
  const tapHorn = (sx, sy) => {
    let best = null, bd = 1e9;
    for (const c of CORNERS) { const [x, z] = hornAt(c), p = X.scr(x, Y1 + 0.5, z); const d = Math.hypot(sx - p.x, sy - p.y); if (d < bd) { bd = d; best = c; } }
    return bd < Math.max(70, innerHeight * 0.16) ? best : null;
  };
  function touch(c) {
    if (!C.at) return;
    const want = CORNERS[C.i];
    if (c !== want) { C.shake = { c, t: 0 }; try { X.haptic && X.haptic(8); } catch (e) { /* */ } return; }
    C.touched.push(c); C.i++; C.at = false;
    const [x, z] = hornAt(c);
    if (!M.flawed(c)) {
      const g = box(X, Mt.y11glow, S11.horns[c].box[0] - 0.04, Y1, S11.horns[c].box[1] - 0.04, S11.horns[c].box[2] + 0.04, S11.horns[c].y1 + 0.06, S11.horns[c].box[3] + 0.04, root); g.renderOrder = 3; C.glint.push({ g, t: 0 });
      try { X.sparks(x, Y1 + 1.1, z, 18); X.play && X.play('click', { level: 2 }); } catch (e) { /* */ }
    } else { try { X.line(`הקרן ${RU[c]} פגומה: הטלאי הלבן של בול המלח נראה. רק תיקון מחזיר אותה`, 2600); X.play && X.play('stone'); } catch (e) { /* */ } }
    if (C.i >= 4) { C.done = true; return; }
    X.line(`עכשיו לקרן ${RU[CORNERS[C.i]]}`, 2000);
  }
  const dn = (e) => { if (UI(e)) return; const c = C.at ? tapHorn(e.clientX, e.clientY) : null; if (c) { touch(c); return; } C.held = { id: e.pointerId }; };
  const up = (e) => { if (C.held && e.pointerId === C.held.id) C.held = null; };
  addEventListener('pointerdown', dn, true); addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const target = () => (C.leg < 0 ? P.head : P.legs[Math.min(3, C.i)]);
  await frames((dt) => {
    C.t += dt; Bt.step(dt); gang.update(dt, Bt);
    if (!C.held) C.idle += dt; else C.idle = 0;
    const auto = opts.auto || C.idle > 8;
    if ((C.held || auto) && !C.at && !C.done) {
      const [tx, tz] = target(), dx = tx - C.x, dz = tz - C.z, L = Math.hypot(dx, dz), sp = 2.6 * dt;
      if (L <= sp) { C.x = tx; C.z = tz; if (C.leg < 0) C.leg = 0; else { C.at = true; X.line(`נגיעה ביד בקרן ${RU[CORNERS[C.i]]}`, 2400); } }
      else { C.x += (dx / L) * sp; C.z += (dz / L) * sp; }
    }
    if (C.at && auto && C.idle > (opts.auto ? 0.3 : 10)) touch(CORNERS[C.i]);   // (a probe, or nobody's hand for ten seconds: the horn in its turn)
    C.y = C.z >= R.foot ? F : C.z > R.head ? S10.rampY(C.z) : Y1;
    if (k && k.a) {
      const [tx, tz] = C.at ? hornAt(CORNERS[C.i]) : target();
      k.a.x = C.x; k.a.z = C.z; k.a.fixedY = C.y; k.a.yaw = Math.atan2(tx - C.x, tz - C.z); k.fx = tx; k.fz = tz; k.stride = (C.held || auto) && !C.at && !C.done ? 0.8 : 0; k.rate = 1.2;
    }
    // (build 134, the review: the horn in its turn is lit, softly pulsing, so the order shows in the world)
    if (!C.done) { const c = CORNERS[C.i], hb = S11.horns[c].box; if (!C.turn || C.turn.c !== c) { if (C.turn) root.remove(C.turn.g); const g = box(X, Mt.y11glow, hb[0] - 0.2, Y1, hb[1] - 0.2, hb[2] + 0.2, Y1 + 0.03, hb[3] + 0.2, root); C.turn = { c, g, y0: g.position.y }; } C.turn.g.position.y = C.turn.y0 + Math.abs(Math.sin(C.t * 3)) * 0.04; }
    else if (C.turn) { root.remove(C.turn.g); C.turn = null; }
    for (const q of C.glint) { q.t += dt; q.g.visible = q.t < 1.2 && Math.floor(q.t * 8) % 2 === 0; }
    if (C.shake) { C.shake.t += dt; const g = SH11.g && SH11.g.getObjectByName('h134-horn-' + C.shake.c); if (g) g.position.x = C.shake.t < 0.4 ? Math.sin(C.shake.t * 60) * 0.03 : 0; if (C.shake.t >= 0.4) C.shake = null; }
    // the camera (the first stills: from behind him it sat in his back at the horns and saw only the kevesh's face): on the kevesh high
    // behind him; on the top from outside the altar's nearest edge (at a corner its diagonal), a little above, he and his horn in the middle
    const soft = (e, a) => { if (!C.eye) C.eye = e.slice(); const k = Math.min(1, dt * 2.5); for (let j = 0; j < 3; j++) C.eye[j] += (e[j] - C.eye[j]) * k; X.shot(C.eye.slice(), a, 0.01); };
    // (build 134, the p10 still: from behind and above the kevesh's white face filled the whole screen — now from its east side, the slope
    // in profile, he on it and the altar's top ahead)
    if (C.leg < 0 && C.z > R.head) soft([C.x + 13, C.y + 5, C.z + 3], [C.x, C.y + 1.2, C.z - 2.5]);
    else {
      const U = S11.upper, dx0 = C.x - U[0], dx1 = U[2] - C.x, dz0 = C.z - U[1], dz1 = U[3] - C.z;
      const nx = dx1 < 3 ? 1 : dx0 < 3 ? -1 : 0, nz = dz1 < 3 ? 1 : dz0 < 3 ? -1 : 0, L = Math.hypot(nx, nz) || 1;
      const ox = (nx || (dz1 < dz0 ? 0 : 0)) / L, oz = (nz || (!nx ? 1 : 0)) / L;
      // (r13 stills: the aim beyond the horn left it at the screen's foot — now between him and his horn, a little lower and nearer)
      const [hx, hz] = C.at || C.leg >= 0 ? hornAt(CORNERS[Math.min(3, C.i)]) : [C.x, C.z], ax = (C.x + hx) / 2, az = (C.z + hz) / 2;
      soft([ax + ox * 9.5, C.y + 5.2, az + oz * 9.5], [ax, C.y + 1.5, az]);   // (r14 stills: at 6 out his head was off the top: the big kohen whole, the horn by his feet)
    }
    return C.done;
  });
  removeEventListener('pointerdown', dn, true); removeEventListener('pointerup', up, true); removeEventListener('pointercancel', up, true);
  return { root, gang, crew, flawed };
}
/** fireworks over the altar (fixed places, three volleys) */
async function fireworks(X) {
  const P = [[0, 30, 0], [-12, 36, -8], [12, 34, 6], [-6, 42, 10], [8, 40, -12], [0, 48, 0], [-16, 44, 4], [16, 46, -4], [0, 38, 14]];
  for (let i = 0; i < P.length; i++) { const p = P[i]; try { X.sparks(MID[0] + p[0], p[1], MID[1] + p[2], 46); X.dust(MID[0] + p[0], p[1], MID[1] + p[2], 4, 8); if (X.play) X.play('fanfare', { level: 3 }); } catch (e) { /* */ } await beat(X, 330); }
}
function pointsRows(st) {
  let base = 0, lvb = 0; for (const [id, r] of Object.entries(st.res || {})) { const lv = +String(id).slice(-1) || 1, p = (r && r.pts) | 0; base += p; lvb += p * ((MUL[lv] || 1) - 1); }
  return `<ul class="pts"><li>נקודות העבודות: ${base}</li>${lvb ? `<li>בונוס הרמה: ${lvb}</li>` : ''}<li>הרצף הטוב ביותר: ${st.best | 0}</li></ul>`;
}
/** the stars of a station: its best over the levels */
const starsOf = (st, k) => Math.max(0, ...[1, 2, 3].map((lv) => (st.res[k + lv] ? st.res[k + lv].stars | 0 : 0)));
/** the button's station: a flawed horn's repair first; else the station with the fewest stars (an extraction's: its corner's packing,
 *  which goes on into it in one run) */
export function againOf(M) {
  const st = M.st, fl = M.flawedHorns();
  if (fl.length) return 'fix' + fl[0];
  const cand = [...CORNERS.map((c) => ['orez' + c, Math.min(starsOf(st, 'orez' + c), starsOf(st, 'chilutz' + c))]), ['chotem', starsOf(st, 'chotem')]];
  cand.sort((a, b) => a[1] - b[1]);
  return cand[0][0];
}
const nameOf = (k) => (k === 'chotem' ? TITLES.chotem : k.startsWith('fix') ? `תיקון הקרן ${RU[k.slice(3)]}` : `${TITLES.orez} · הקרן ${RU[k.slice(4)]}`);
/** the result card: each horn's state, the works' stars, what stands in the world, every flaw in its place; "שוב, לשיפור" */
function resultCard(M) {
  return new Promise((res) => {
    if (typeof document === 'undefined') { res(null); return; }
    const st = M.st, best = st.bestOf || {}, row = (w) => { const b = best[w]; const s = b ? b.stars | 0 : 0; return `<li><b>${TITLES[w]}</b> <i>${'★'.repeat(s)}${'☆'.repeat(3 - s)}</i></li>`; };
    // (the 640 × 360 still: the card's button fell under the screen — the horns in one line when whole, only the flawed ones listed)
    const fh = CORNERS.filter((c) => M.flawed(c)), horns = fh.length ? fh.map((c) => `<li>הקרן ${RU[c]}: <b class="f">פגומה</b> (מכוסה בבול מלח, לא כשרה)</li>`).join('') : '';
    const fl = {}; for (const x of st.flaws || []) if (LOSS[x.f][2] !== 'pegum') { const k = x.f + (x.corner || ''); fl[k] = fl[k] || { n: 0, x }; fl[k].n++; }
    const fls = Object.values(fl).map(({ n, x }) => `<li>${LOSS[x.f][0]}${x.corner ? ` (${RU[x.corner]})` : ''}${n > 1 ? ` ×${n}` : ''}</li>`).join('') || '<li>אין נזקים למראה</li>';
    const low = againOf(M), whole = !M.flawedHorns().length;
    const el = document.createElement('div'); el.className = 'h109-ui h134-card';
    el.innerHTML = `<style>.h134-card{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:rgba(14,10,4,.42);font-family:Heebo,system-ui;direction:rtl}.h134-card>div{background:#FBF6EA;color:#3A2A14;border-radius:16px;padding:14px 22px;width:min(92vw,560px);max-height:92vh;overflow:auto;box-shadow:0 8px 30px rgba(0,0,0,.35)}.h134-card h3{margin:0 0 4px;font-size:22px}.h134-card ul{margin:2px 0 6px;padding:0 18px;font-size:15px;line-height:1.35}.h134-card ul.r,.h134-card ul.pts{display:flex;flex-wrap:wrap;gap:2px 18px;list-style:none;padding:0}@media (max-height:420px){.h134-card>div{padding:10px 16px}.h134-card h3{font-size:19px}.h134-card ul{font-size:14px}}.h134-card i{color:#C08A1A;font-style:normal;letter-spacing:1px}.h134-card .f{color:#B0402A}.h134-card .w{color:#2E7A3A;font-weight:800}.h134-card button{font:800 17px Heebo,system-ui;border:0;border-radius:12px;padding:10px 16px;margin-inline-end:8px;min-height:44px;background:#C08A1A;color:#fff}.h134-card button.b{background:#E8DCC2;color:#3A2A14}</style>`
      + `<div><h3>הקרנות</h3>${whole ? '<div class="w">המזבח שלם: ארבע הקרנות שלמות</div>' : `<ul>${horns}</ul>`}<ul class="r">${['orez', 'chilutz', 'chotem'].map(row).join('')}</ul>${pointsRows(st)}<b>מה נשאר בעולם</b><ul>${fls}</ul><button class="a">שוב, לשיפור: ${nameOf(low)}</button><button class="b">להמשיך</button></div>`;
    document.body.appendChild(el);
    const close = (v) => { try { el.remove(); } catch (e) { /* */ } res(v); };
    el.querySelector('.a').addEventListener('click', (e) => { e.stopPropagation(); close(low); });
    el.querySelector('.b').addEventListener('click', (e) => { e.stopPropagation(); close(null); });
    setTimeout(() => close(null), 25000);
  });
}

export function makePack11(env = {}) {
  const RD = endRound();
  const P = {
    time: env,
    id: 'karnot', key: 'h134', wordScreen: true,
    name: 'הקרנות', PLAN, ACTS, icon: '🔺',
    create: (save) => createH134(save),
    count: (M) => M.count(),
    freeFilms: true,
    workLinks: true,
    workSeed() { /* (a work played again keeps every flaw in the world: the model's own replay rules) */ },
    quiet: true,
    byPlan: true,
    endTitle: 'הקרנות נבנו!',
    upStrip: true,
    endSub: 'ואחד קרן ואחד קרן, אמה על אמה (מידות ג, א)',
    nextStage: NEXT_STAGE,
    endView: [RD[0][0], RD[0][1]],
    film: endRound(3),
    sync(M, S0, instant, X) { if (!X || !SH11.X) return; if (M.finished() && !M.mission()) finalWorld(X); },
    visits: true,
    unitEnd: () => null,
    /** the opening (rule 3): from the south-east over the altar's top, the four frames at its corners; a tap skips it */
    before(m, X, M) {
      try { globalThis.__H134_X = X; } catch (e) { /* (the probes: the hero to a station) */ }
      const st = M.st;
      if (m || st.intro) return null;
      return (async () => {
        st.intro = 1; X.save(); near(X, true);
        const acting = () => { try { return !!(X.acting && X.acting()); } catch (e) { return false; } };
        X.line(LINES.stage, 0);
        const shots = [[RD[0][0], RD[0][1]], CAM.open];
        for (let i = 0; i < shots.length; i++) {
          if (acting()) break;
          X.shot(shots[i][0].slice(), shots[i][1].slice(), i ? 2.6 : 0.01);
          if (await tapOr(X, i ? 3000 : 2200)) break;
        }
        if (!acting()) X.line('');
        if (!acting()) { try { X.stages.hero.place({ x: S11.start[0], z: S11.start[1], face: [R.x0 + 8, R.foot] }); } catch (e) { /* */ } }
        near(X, false);
      })();
    },
    /** the circuit (once, alone, no points), the pull-back (fireworks only when the altar is whole), the result card */
    async finale(X) {
      const M = X.M, st = M.st; finalWorld(X);
      const keepers = []; let figsBack = null; try { figsBack = filmFigs({ keep: () => keepers }); } catch (e) { figsBack = null; }
      try { X.kohen(false); } catch (e) { /* */ }
      let C = null;
      if (!st.finale) {
        try { C = await circuit(X, { auto: !!globalThis.__H134_AUTO_CIRCUIT, keep: keepers }); } catch (e) { console.warn('[h134] circuit', e && e.message); }
        st.finale = 1; X.save(); SH11.key = ''; finalWorld(X);
      }
      const whole = !M.flawedHorns().length;
      try {
        // (after the fourth horn: the camera pulls back at once — the yesod, the sovev and its line, the four horns, the kevesh)
        X.shot([MID[0] + 38, 46, MID[1] + 46], [MID[0], Y1 - 2, MID[1] + 6], 1.4); await beat(X, 1400);
        if (whole) { X.line('המזבח שלם', 3000); await fireworks(X); }
        else {
          const T = X.THREE, Mt = mats11(X);
          for (const c of M.flawedHorns()) { const h = S11.horns[c]; const g = box(X, Mt.y11bad, h.box[0] - 0.1, Y1, h.box[1] - 0.1, h.box[2] + 0.1, h.y1 + 0.2, h.box[3] + 0.1, C ? C.root : X.props.root); g.name = 'h134-flawlight'; }
          X.line(`יש קרן פגומה: ${M.flawedHorns().map((c) => RU[c]).join(', ')}. "שוב, לשיפור" מוביל לתיקון`, 3600); await beat(X, 2600); void T;
        }
      } catch (e) { /* */ }
      if (C) { try { C.gang.clear(); } catch (e) { /* */ } try { X.props.remove(C.root); } catch (e) { /* */ } }
      near(X, false);
      const low = await resultCard(M);
      if (low) { P.again = low; try { X.line(`שוב, לשיפור: ${nameOf(low)}. הולכים אל התחנה`, 4000); } catch (e) { /* */ } }
      h131Card(true);
      if (figsBack) SH11.figsBack = figsBack;
    },
    rest(X, M) { restWorld(X, M); },
    dispose() {},
  };
  void initWorld;
  return P;
}
