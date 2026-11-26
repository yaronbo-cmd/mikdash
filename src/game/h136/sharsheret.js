/* ── build 136 ── h136/sharsheret.js — work 3 "שרשראות הזהב, פרח כהונה" (spec docs/specs/shlav-13-he.md v4, עבודה 3; the model:
 * sharsheret-model.js). "ושרשרות של זהב היו קבועות בתקרת האולם, שבהן פרחי כהונה עולין ורואין את העטרות" (Middot 3:8).
 * The kohen between the two chains (0.8 apart), a hand on each: right gold (the north chain, the screen's right — he faces west), left
 * sky blue. The view: from under him and a little behind, up; frozen while a thumb is down; when both hands hold and nothing touches,
 * it slides to the new height in half a second.
 *   · CLIMB: touch a hand (its half of the screen) and drag up: the gold ring marks the link nearest the thumb within reach; lift the
 *     thumb and the hand takes it (no ring: it returns, no slip). A hand in the air keeps the other from letting go.
 *   · THE SWING: a small sideways drag of the HOLDING hand — against the body's motion calms it, with it through the middle pumps (a spark
 *     on the bracelet when it took). Each grab graded by the swing then: 40 / 20 / 10; level 3 a grab at the swing's edge crushes a link.
 *   · THE TOP (y 86): his eyes. One thumb on the open hall turns the body round the chain (100 dp = 30°); a finger on the holding hand
 *     (the screen's bottom band, its bracelet shown there) steadies — the turn stops meanwhile. A crown in the centre circle, the swing
 *     under its threshold for a second: a sun ray from its window touches the gold, its name shows (40). Hen: only its glint — swing on
 *     purpose until, at the swing's edge, the eyes pass through the zone; two edges in a row.
 * Level 1 one thumb: every drag up moves the lower hand (the other holds by itself).
 *   SHARSHERET_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { WORDS } from './model.js';
import * as K from './sharsheret-model.js';
import { mats13, kohenClimber } from './look.js';
import { SH13 } from './world.js';
import { award, hurt, finish, V3, lens, voices13, ring, HANDS, dp } from './kit13.js';
import { fingers } from '../h113/acts.js';

const S13 = BOOK.s13, CH = S13.chains, RAD = Math.PI / 180;
export const SR = Object.freeze({ FOV: 54, EYE_FOV: 50, DECIDE: 12, NUDGE: 14, BAND: 0.72, SLIDE: 0.5, TURN_DP: 100, TURN_DEG: 30 });
const zOf = (k) => (k === 'R' ? CH.z[0] : CH.z[1]);

function make(m, X) {
  const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = voices13(X), Mt = mats13(X);
  const root = new T.Group(); root.name = 'h136-sharsheret-act'; X.props.root.add(root);
  const A = { t: 0, ev: [], ended: false, finished: false, busy: 0, f: new Map(), upF: null, airY: null, camK: '', slide: 0 };
  const ev = (e) => { A.ev.push(e); if (A.ev.length > 24) A.ev.shift(); };
  const b0 = Mo.workOf(m.k);
  let S = b0 && b0.id === m.id ? K.load(b0) : null; if (S && S.lv !== lv) S = null; const resumed = !!S;
  if (!S) S = K.fresh(lv);
  let k0 = ''; const keep = () => { const b = K.save(S, m.id), k = JSON.stringify(b); if (k === k0) return; k0 = k; Mo.keep(m.k, b); X.save(); };
  // ── what the act draws: the climber, the scaffold he starts from, the gold ring on the marked link, the rays to the crowns
  const climber = kohenClimber(X); climber.rotation.y = 0; root.add(climber);
  const scaf = new T.Group(); root.add(scaf);
  { const y = S.y0 - 1.8, h = 1.6, x = CH.x, z = CH.zc;
    const deck = new T.Mesh(X.props.geo.box, Mt.y13wood); deck.scale.set(h * 2, 0.25, h * 2); deck.position.set(x + 0.6, y - 0.12, z); scaf.add(deck);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const leg = new T.Mesh(X.props.geo.box, Mt.y13woodD); leg.scale.set(0.22, y - S13.hallFloor, 0.22); leg.position.set(x + 0.6 + sx * (h - 0.2), (y + S13.hallFloor) / 2, z + sz * (h - 0.2)); scaf.add(leg); } }
  const mark = new T.Mesh(new T.TorusGeometry(0.22, 0.05, 6, 16), Mt.y13goldLit); mark.visible = false; root.add(mark);
  const rays = new T.Group(); root.add(rays);
  const rings = { R: ring(HANDS.R, 52), L: ring(HANDS.L, 52) };
  let circle = null, band = null;
  try {
    circle = document.createElement('div'); circle.className = 'h109-ui h136-circle'; circle.style.cssText = 'position:fixed;z-index:5;pointer-events:none;border-radius:50%;border:3px solid rgba(255,240,184,.85);left:50%;top:50%;transform:translate(-50%,-50%);display:none;box-shadow:0 0 10px rgba(255,220,140,.6)'; document.body.appendChild(circle);
    band = document.createElement('div'); band.className = 'h109-ui h136-band'; band.style.cssText = `position:fixed;z-index:5;pointer-events:none;left:50%;bottom:${Math.round(dp(18))}px;width:${Math.round(dp(64))}px;height:${Math.round(dp(64))}px;margin-left:${-Math.round(dp(32))}px;border-radius:50%;border:5px solid ${HANDS.R};display:none;box-shadow:0 0 10px ${HANDS.R}`; document.body.appendChild(band);
  } catch (e) { circle = null; band = null; }
  X.kohen(false);
  try { X.stages.hero.place({ x: CH.x + 1, z: CH.zc + 1.2, face: [CH.x - 5, CH.zc] }); } catch (e) { /* */ }
  // ── the camera
  const cam0 = X.camera, fov0 = cam0.fov;
  const handsAt = () => ({ R: A.upF && S.air === 'R' && A.airY != null ? A.airY : S.h.R, L: A.upF && S.air === 'L' && A.airY != null ? A.airY : S.h.L });
  function climbView(d) {
    const lo = Math.min(S.h.R, S.h.L), hi = Math.max(S.h.R, S.h.L);
    lens(X, SR.FOV);
    X.shot([CH.x + 5.2, lo - 3.2, CH.zc + 0.6], [CH.x - 0.4, hi + 2.2, CH.zc], d);
    A.camK = lo.toFixed(2);
  }
  function eyeView() {
    lens(X, SR.EYE_FOV);
    const ez = CH.zc + S.s, y = S.yaw * RAD;
    X.track([CH.x, CH.eye, ez], [CH.x - 20 * Math.cos(y), CH.eye + 0.5, ez + 20 * Math.sin(y)], 40, 0.6);
  }
  // ── the screen
  const scr = (x, y, z) => { const r = X.scr(x, y, z); return { x: r.x, y: r.y }; };
  const handScr = (k) => scr(CH.x, handsAt()[k] + 0.9, zOf(k) + S.s);
  const ppa = () => { const a = scr(CH.x, S.h.L, CH.zc), b = scr(CH.x, S.h.L + 1, CH.zc); return Math.max(6, Math.hypot(b.x - a.x, b.y - a.y)); };
  const handOf = (f) => { if (lv === 1) return K.low(S); const r = handScr('R'), l = handScr('L'); return f.x > (r.x + l.x) / 2 ? 'R' : 'L'; };
  const inBand = (f) => f.y > innerHeight * SR.BAND;
  // ── the fingers
  const FG = fingers(X, {
    down(f) {
      if (A.finished || A.busy || S.done) return;
      const g = { id: f.id, x0: f.x, y0: f.y, x: f.x, y: f.y, role: null, k: null, nx: f.x };
      if (S.top) { g.role = inBand(f) ? 'steady' : 'turn'; if (g.role === 'turn' && [...A.f.values()].some((o) => o.role === 'steady')) g.role = 'dead'; A.f.set(f.id, g); X.hand(null); ev(g.role); return; }
      g.k = handOf(f);
      if (S.air && g.k === S.air) return;   // (the hand in the air is the other finger's)
      g.role = S.air ? 'hold' : 'pending';
      A.f.set(f.id, g); X.hand(null); ev('hand:' + g.k);
    },
    move(f) {
      const g = A.f.get(f.id); if (!g) return; g.x = f.x; g.y = f.y;
      if (g.role === 'pending') {
        const dx = f.x - g.x0, dy = f.y - g.y0;
        if (Math.hypot(dx, dy) < dp(SR.DECIDE)) return;
        if (-dy > Math.abs(dx) * 0.8) { if (K.lift(S, g.k)) { g.role = 'up'; A.upF = g.id; g.h0 = S.h[g.k]; V.rustle(0.6); ev('lift:' + g.k); } else g.role = 'dead'; }
        else if (Math.abs(dx) > Math.abs(dy)) { g.role = 'hold'; g.nx = g.x0; }
        else g.role = 'dead';
      }
      if (g.role === 'up') { const want = g.h0 + (g.y0 - f.y) / ppa(); A.airY = Math.max(g.h0, Math.min(want, K.reach(S, S.air) + 0.6)); K.aim(S, want); return; }
      if (g.role === 'hold' || g.role === 'steady') {
        const dx = f.x - g.nx;
        if (Math.abs(dx) >= dp(SR.NUDGE)) { g.nx = f.x; const out = K.nudge(S, dx < 0 ? 1 : -1, []); for (const e of out) handle(e); }
        return;
      }
      if (g.role === 'turn') { const dx = f.x - (g.tx != null ? g.tx : g.x0); g.tx = f.x; if (!S.steady) A.turn = (A.turn || 0) + (-dx / dp(SR.TURN_DP)) * SR.TURN_DEG; }
    },
    up(f) {
      const g = A.f.get(f.id); if (!g) return; A.f.delete(f.id);
      if (g.role === 'up' && A.upF === g.id) { A.upF = null; A.airY = null; const out = K.grab(S, []); for (const e of out) handle(e); keep(); }
    },
  });
  const atK = (k) => V3(X, CH.x, S.h[k], zOf(k) + S.s);
  function handle(e) {
    if (e.k === 'grab') { ev('grab:' + e.grade); V.rustle(1); award(X, atK(e.hand), e.grade, lv, 'זהב'); }
    else if (e.k === 'back') { V.rustle(0.5); ev('back'); }
    else if (e.k === 'free') { ev('free'); try { X.line('ניסוי חינם: התנודה הייתה גדולה. גרירה קטנה הצידה של היד שאוחזת מרגיעה אותה', 2600); } catch (er) { /* */ } }
    else if (e.k === 'bump') { V.knock(1.2); V.breath(); try { X.shake(0.08, 0.12); } catch (er) { /* */ } ev('bump'); }
    else if (e.k === 'crush') { ev('crush'); hurt(X, Mo, 'sharsheret.link', V3(X, CH.x, e.y, CH.zc), { lv, at: +(+e.y).toFixed(2) }); }
    else if (e.k === 'calm' || e.k === 'pump') { ev(e.k); V.spark(); const k = S.air ? K.other(S.air) : 'L'; try { X.sparks(CH.x, S.h[k] + 0.9, zOf(k) + S.s, 4); } catch (er) { /* */ } }
    else if (e.k === 'miss') ev('miss');
    else if (e.k === 'top') { ev('top'); V.breath(); try { X.line(lv === 1 ? 'למעלה. גררו על החלל: הגוף מסתובב. מצאו את עטרת חלם בעיגול, ושקט' : 'למעלה. מצאו את העטרות. יד על הצמיד למטה מייצבת', 4200); } catch (er) { /* */ } }
    else if (e.k === 'glint') { ev('glint:' + e.n); V.shine(); const c = K.crownOf('hen'); try { X.sparks(c.x + 1, c.y, c.z, 8); } catch (er) { /* */ } }
    else if (e.k === 'crown') {
      ev('crown:' + e.crown); const c = K.crownOf(e.crown); V.shine();
      award(X, V3(X, c.x + 1, c.y, c.z), 'gold', lv, 'זהב');
      if (!Mo.st.crowns.includes(e.crown)) Mo.st.crowns.push(e.crown); SH13.key = ''; keep();
      const w = S13.windows.find((x) => x.z === c.z), r = new T.Mesh(X.props.geo.box, Mt.y13ray); r.scale.set(0.3, c.y - w.y1 + 0.6, 0.8); r.position.set(c.x + 0.6, (w.y1 + c.y) / 2, c.z); r.rotation.z = 0.25; rays.add(r);
      try { X.line(`עטרת ${c.he}`, 1800); } catch (er) { /* */ }
    } else if (e.k === 'done') { ev('done'); done(); }
  }
  async function done() {
    if (A.busy) return; A.busy = 2;
    const res = K.result(S), at = V3(X, -91, 87.5, 0);
    Mo.keep(m.k, null); X.save();
    await X.wait(1.0);
    // (the descent: he slides down to the scaffold by himself, a second, with a rustle; a look down through the opening)
    V.rustle(1.2); const y0 = S.h.R, y1 = S.y0 + 2;
    for (let i = 0; i <= 20; i++) { const k = i / 20; S.h.R = y0 + (y1 - y0) * k; S.h.L = S.h.R - 0.3; S.s *= 0.85; await X.wait(0.05); }
    await finish(X, A, res, WORDS.sharsheret, at, { eye: [CH.x + 2, 30, 26], aim: [-90, 82, -4], secs: 2.0, kohen: false, after: () => { try { Mo.filmOver(); } catch (er) { /* */ } } });
  }
  function hint() { if (resumed || A.hintOn) return; A.hintOn = 1; try { X.hand({ x: CH.x, y: S.h[K.low(S)] + 0.9, z: zOf(K.low(S)) }, 0, -40); } catch (e) { /* */ } }
  function draw(dt) {
    const H = handsAt(), lo = Math.min(H.R, H.L);
    SH13.handsY = Math.min(S.h.R, S.h.L); SH13.sway = S.s;
    climber.position.set(CH.x, lo - 0.3, CH.zc + S.s);
    climber.userData.pose(H.R - (lo - 0.3), zOf('R') - CH.zc, H.L - (lo - 0.3), zOf('L') - CH.zc);
    climber.visible = !S.top || A.busy === 2;
    if (S.tgt != null && S.air) { mark.visible = true; mark.position.set(CH.x, S.tgt, zOf(S.air) + S.s); mark.rotation.y = Math.PI / 2; } else mark.visible = false;
    if (!S.top) {
      for (const k of ['R', 'L']) { const p = handScr(k), on = [...A.f.values()].some((g) => g.k === k && g.role && g.role !== 'dead'); rings[k].show(p.x, p.y, on ? 1 : 0, S.sparkT > 0 && S.air && k !== S.air); }
      if (circle) circle.style.display = 'none'; if (band) band.style.display = 'none';
      // the camera: frozen under a thumb; with both hands holding and nothing down, it slides to the new height
      if (!A.f.size && !S.air && A.camK !== Math.min(S.h.R, S.h.L).toFixed(2)) climbView(SR.SLIDE);
    } else {
      rings.R.hide(); rings.L.hide();
      if (circle) { const r = (innerHeight / 2) * Math.tan(K.SH.CIRCLE * RAD) / Math.tan((SR.EYE_FOV / 2) * RAD); circle.style.display = 'block'; circle.style.width = circle.style.height = Math.round(r * 2) + 'px'; circle.style.borderColor = S.seeT > 0 ? 'rgba(255,214,90,1)' : 'rgba(255,240,184,.85)'; }
      if (band) { band.style.display = A.busy ? 'none' : 'block'; band.style.boxShadow = S.sparkT > 0 ? '0 0 22px 8px #FFF0B8' : `0 0 10px ${HANDS.R}`; }
      if (!A.busy) eyeView();
    }
    void dt;
  }
  return {
    close: true, kohenWorks: true,
    begin() {
      FG.attach(); climbView(0.01);
      X.line(resumed ? '' : lv === 1 ? 'גררו יד למעלה: טבעת זהב מסמנת חוליה. הרימו את האגודל והיד נתפסת' : lv === 2 ? 'יד אחת עולה, השנייה אוחזת. גרירה קטנה הצידה של היד שאוחזת מרגיעה את התנודה' : 'מהר, אבל בלי להיכנס לנדנוד. בקצה התנודה חוליה נמעכת', resumed ? 0 : 5200);
      X.wait(0.9).then(() => { if (!A.ended) hint(); });
      ev(resumed ? 'resume' : 'begin'); keep();
    },
    update(dt) {
      A.t += dt;
      try {
        V.frame && V.frame();
        if (!A.busy && !A.finished) {
          const steady = [...A.f.values()].some((g) => g.role === 'steady');
          let inp = { turn: A.turn || 0, steady }; A.turn = 0;
          if (A.feed) { const b = A.feed(S) || {}, out = []; if (b.nudge) K.nudge(S, b.nudge, out); if (b.lift && K.lift(S, b.lift)) V.rustle(0.6); if (b.aim != null) { K.aim(S, b.aim); if (b.grab) K.grab(S, out); } for (const e of out) handle(e); inp = { turn: b.turn || 0, steady: !!b.steady }; }   // (A.feed: the probes' bot)
          const evs = K.step(S, Math.min(dt, 1 / 30), inp);
          for (const e of evs) handle(e);
        } else if (A.busy) { K.step(S, Math.min(dt, 1 / 30), {}); }
        draw(dt);
        if (A.t % 1 < dt) keep();
      } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h136] sharsheret', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
    },
    down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
    cancel() { A.f.clear(); if (S.air) { const out = K.grab(S, []); for (const e of out) handle(e); } A.upF = null; A.airY = null; keep(); },
    // (all the screen is the act's here: the hands' halves while climbing, the hall and the bracelet at the top — no free camera)
    wants() { return !A.finished; },
    holds() { return A.f.size > 0; },
    lensFov: SR.FOV,
    end() {
      A.ended = true; FG.detach(); V.hush(); X.hand(null); lens(X, fov0);
      rings.R.remove(); rings.L.remove(); try { if (circle) circle.remove(); if (band) band.remove(); } catch (e) { /* */ }
      SH13.sway = 0; SH13.handsY = 40; SH13.key = '';
      X.kohen(true);
      X.props.remove(root);
    },
    at() { return V3(X, CH.x, Math.min(S.h.R, S.h.L), CH.zc); },
    dbg() {
      const r3 = (v) => +(+v).toFixed(3);
      return { id: m.id, lv, h: { R: r3(S.h.R), L: r3(S.h.L) }, air: S.air, tgt: S.tgt, s: r3(S.s), amp: r3(K.swingAmp(S)), top: S.top, yaw: r3(S.yaw), seen: S.seen.slice(), crowns: S.crowns, hen: S.hen.n,
        steps: S.steps.map((s) => s.grade[0]).join(''), flaws: S.flaws.map((x) => x.f), done: S.done, busy: A.busy, finished: A.finished,
        hands: { R: (() => { const p = handScr('R'); return [Math.round(p.x), Math.round(p.y)]; })(), L: (() => { const p = handScr('L'); return [Math.round(p.x), Math.round(p.y)]; })() }, ppa: Math.round(ppa()), fingers: [...A.f.values()].map((g) => g.role), ev: A.ev.slice(-12) };
    },
    probe() { return { S, K, A }; },
  };
}
export const SHARSHERET_ACT = { icon: '⛓️', title: 'שרשראות הזהב', walkLine: () => 'השרשראות: אל המעלות, ופנימה אל השרשראות', stand() { const s = S13.stands.sharsheret; return { x: s[0], z: s[1], face: [S13.front.face, 0] }; }, prepare() {}, make };
