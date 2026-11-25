/* ── build 133 ── h133/nima.js — work 4 "מלא נימא" (spec docs/specs/shlav-10-he.md, עבודה 4). The rules: nima-model.js.
 * The last stone of a way on its wooden rollers, led by the left thumb (the three states of the kevesh: drag, let go, hold to brake),
 * brought to the altar's face and stopped a hair from it (Rambam 2:13 "ואויר מעט היה מפסיק בין הכבש למזבח"). Near the face the
 * picture goes close and the time three times slower: the gap is seen large in the close-up, and comes back to its true size (a thin
 * shadow line) when the picture leaves it. The stone comes down where it stands when the thumb leaves the brake; the kohen's feather
 * goes down the gap by itself (a confirmation, not a step). A touch scratches the altar (−20, it stays).
 *   level 1: the head stone "פורח" of the great kevesh, from z 17–15 on slab 6 north to the upper block's south face; then the crew
 *            builds the two small kevashim quickly;
 *   level 2: the last stone of the small kevesh to the sovev, up its lane east of the kevesh to the sovev's south face;
 *   level 3: the last stone of the small kevesh to the yesod: west along its lane, a turn north (slow enough: +20), to the spur's face.
 * A perfect gap: one hair runs round the whole altar through every gap there is and closes on itself, a thin string's sound.
 *   NIMA_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { WORDS } from './model.js';
import { fresh, load, save, step, gapOf, closeOf, result, done, NM, WAYS } from './nima-model.js';
import { mats10, own, wedge, smallRamps } from './world.js';
import { award, extra, hurt, finish, thumb, V3, lens } from './kit10.js';
import { box } from '../h131/world.js';
import { createVoices } from '../h129/sound129.js';
import { fingers } from '../h113/acts.js';
import { createGang, createBeat } from '../h109/kit.js';

const S10 = BOOK.s10, R = S10.ramp, U = S10.upper, F = S10.floor, B9 = S10.block9;
export const NA = Object.freeze({ FOV: 50, CLOSE_FOV: 7, SLOW: 3, LIFT: 0.3 });
/** each level's way in the world: the stone's leading edge at s (0 … len), its height there, its size and the face's close-up view */
// (review fix 16, rule 65: the ways read the address book — BOOK.s10.nima's lanes, the faces they stop at; the lengths are the model's)
const NB = S10.nima, LEN = { 1: WAYS[1].len, 2: WAYS[2].len, 3: WAYS[3].len };
const FACE = { 1: U[3], 2: NB.b.to[1] - 0.5, 3: NB.c.to[1] - 0.5 };   // (the upper block's south face; the sovev's; the spur's)
const X1 = NB.a.from[0], X2 = NB.b.from[0], X3 = NB.c.turn[0], X30 = NB.c.from[0], Z3 = NB.c.from[1], T3 = WAYS[3].turn;
const WAY = {
  1: { at: (s) => ({ x: X1, z: FACE[1] + LEN[1] - s, y: S10.rampY(FACE[1] + LEN[1] - s) }), size: [16, 2], dir: [0, -1], face: FACE[1],
    cam: [[X1 + 18, 31, 24], [X1, 24, 12]], close: [[X1 + 7, FACE[1] + 16.9, FACE[1] + 2.4], [X1 + 7, FACE[1] + 14.45, FACE[1]]], top: true },
  2: { at: (s) => ({ x: X2, z: FACE[2] + LEN[2] - s, y: S10.ksY(FACE[2] + LEN[2] - s) }), size: [2, 1.2], dir: [0, -1], face: FACE[2],
    cam: [[X2 + 15, 24, 26], [X2 - 1, 20, 14]], close: [[X2, FACE[2] + 12.4, FACE[2] + 2.4], [X2, FACE[2] + 10.45, FACE[2]]] },
  3: { at: (s) => (s < T3 ? { x: X30 - s, z: Z3, y: F + 1 } : { x: X3, z: Z3 - (s - T3), y: F + 1 }), size: [1, 1], dir: [-1, 0], face: FACE[3],
    cam: [[X3 + 16.5, 24, 26], [X3 + 2.5, 17, 14]], close: [[X3, FACE[3] + 6.4, FACE[3] + 2.4], [X3, FACE[3] + 4.45, FACE[3]]] },
};
void B9;

export const NIMA_ACT = {
  icon: '🪶',
  title: 'מלא נימא',
  walkLine: () => '',
  stand(m) { const lv = (m && m.lv) | 0 || 1, s = S10.w4[['a', 'b', 'c'][lv - 1]]; const W = WAY[lv], a = W.at(0); return { x: s[0], z: s[1], face: [a.x, a.z] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = createVoices(X.sfx), Mt = mats10(X), W = WAY[lv];
    const root = new T.Group(); root.name = 'h133-nima-act'; X.props.root.add(root);
    const A = { t: 0, ev: [], ended: false, finished: false, busy: 0, close: false, feather: null, hair: null, build: null };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    const b0 = Mo.workOf('nima');
    let S = b0 && b0.id === m.id ? load(b0) : null; if (S && (done(S) || S.lv !== lv)) S = null; const resumed = !!S;
    if (!S) S = fresh(lv);
    let n0 = -1; const keep = () => { const b = save(S, m.id), k0 = JSON.stringify(b); if (k0 === n0) return; n0 = k0; Mo.keep('nima', b); X.save(); };   // (review fix 3/4: any change of the work is kept, not only a new count)
    const headBefore = (Mo.st.done || []).some((id) => id.startsWith('nima')) || !!Mo.st.crews;
    // ── the stone: level 1 the head stone (16 × 2, its top on the kevesh's slope); levels 2, 3 a block of the small kevesh
    if (lv === 1) own('head', true);
    const stone = new T.Group(); root.add(stone);
    if (lv === 1) wedge(X, Mt.y10white, -8, 8, 0, 2, -1.2 + 0, -1.2 - 2 * (9 / 32), 0, -2 * (9 / 32), stone);
    else box(X, Mt.y10white, -W.size[0] / 2, -0.9, 0, W.size[0] / 2, 0, W.size[1], stone);
    if (lv === 3) stone.rotation.y = 0;
    const rollers = []; for (let k = 0; k < 3; k++) { const c = new T.Mesh(new T.CylinderGeometry(0.14, 0.14, (lv === 1 ? 16.4 : 1.4), 8), Mt.y10wood); c.castShadow = true; root.add(c); rollers.push(c); }
    const bar = box(X, Mt.y10woodD, -0.08, -0.08, -0.9, 0.08, 0.08, 0.9, root); bar.visible = false;
    const shadow = box(X, Mt.y10charcoal, -0.5, -0.5, -0.004, 0.5, 0.5, 0.004, root); shadow.visible = false;   // (the gap's thin shadow line, true size)
    // the gap itself, dark between the two faces (the shadow down in it): as wide as the gap, the close-up shows it large
    const slit = box(X, Mt.y10hole, -0.5, -0.6, -0.5, 0.5, 0, 0.5, root); slit.visible = false;
    const feather = new T.Mesh(new T.PlaneGeometry(0.06, 0.32), Mt.y10salt); feather.visible = false; root.add(feather);
    // ── the crew: the helper with the last roller, the kohen with the feather beside the stone
    const Bt = createBeat(X), gang = createGang(X), men = [];
    function castMen() {
      gang.clear(); men.length = 0; const a = W.at(0), side = lv === 1 ? 9.2 : 1.6;
      const h = gang.add(a.x + side, a.z + 2.2, { role: 'hold', item: 'log', crew: 1, fx: a.x, fz: a.z }); if (h && h.a) h.a.fixedY = a.y - (lv === 1 ? 0 : 0.9); men.push(h);
      const k = gang.add(a.x - side, a.z + 1.2, { role: 'hold', variant: 'kohen', fx: a.x, fz: a.z - 3 }); if (k && k.a) k.a.fixedY = a.y - (lv === 1 ? 0 : 0.9); men.push(k);
    }
    // ── the camera: the way and the face; the close-up at the face (the gap seen large) and the time three times slower
    const cam0 = X.camera, fov0 = cam0.fov;
    const home = (d = 0) => { lens(X, NA.FOV); X.shot(W.cam[0].slice(), W.cam[1].slice(), d); };
    const closeUp = (on) => {
      if (on === A.close) return; A.close = on; ev(on ? 'close' : 'wide');
      if (on) { lens(X, NA.CLOSE_FOV); X.shot(W.close[0].slice(), W.close[1].slice(), 0.5); }
      else home(0.6);
    };
    const pos = () => { const a = W.at(S.mo.s); return a; };
    const TH = thumb({ dir() { const a = pos(), d = dirAt(), p = X.scr(a.x, a.y, a.z), q = X.scr(a.x + d[0] * 2, a.y + (lv === 1 ? 2 * 9 / 32 : 0), a.z + d[1] * 2); const dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy) || 1; return { x: dx / L, y: dy / L }; } });
    const dirAt = () => (lv === 3 && S.mo.s >= 6 ? [0, -1] : W.dir);
    const FG = fingers(X, {
      down(f) { if (A.finished || A.busy || f.x > innerWidth * 0.6) return; TH.down(f); X.hand(null); },
      move(f) { TH.move(f); }, up(f) { TH.up(f); },
    });
    function draw(dt) {
      const a = pos(), d = dirAt(), Mm = S.mo;
      // the stone: its leading edge at a, its body behind it (level 1 a wedge on the slope; else a block)
      if (lv === 1) stone.position.set(a.x, a.y + NA.LIFT * (S.seated ? 0 : 1), a.z);
      else { stone.position.set(a.x - d[0] * 0 , a.y + (S.seated ? 0 : NA.LIFT), a.z); stone.rotation.y = d[0] ? Math.PI / 2 * (d[0] < 0 ? 1 : -1) : 0; }
      rollers.forEach((c, k) => { c.visible = !S.seated; const o = 0.4 + k * (lv === 1 ? 0.6 : 0.35); const x = a.x - d[0] * o, z = a.z - d[1] * o; c.position.set(x, (lv === 1 ? S10.rampY(z) : a.y) + 0.12, z); c.rotation.set(0, 0, 0); if (d[1]) c.rotation.z = Math.PI / 2; else c.rotation.x = Math.PI / 2; });
      bar.visible = !S.seated && Mm.brake > 0.05; if (bar.visible) { const x = a.x - d[0] * (W.size[1] + 0.5), z = a.z - d[1] * (W.size[1] + 0.5); bar.position.set(x, a.y + 0.2, z); bar.rotation.set(d[1] ? -0.9 * Mm.brake : 0, d[0] ? Math.PI / 2 : 0, d[0] ? 0.9 * Mm.brake : 0); }
      { const g0 = gapOf(S); slit.visible = g0 > 1e-4 && g0 < 0.6; if (slit.visible) { slit.scale.set(lv === 1 ? 16 : W.size[0], 1, g0); slit.position.set(a.x, a.y - 0.012 + (S.seated ? 0 : NA.LIFT), W.face + g0 / 2); } }
      // the true gap's thin shadow line (seen once the picture leaves the close-up)
      const g = gapOf(S); shadow.visible = !!S.seated && g > 0;
      if (shadow.visible) { const wd = lv === 1 ? 16 : 1.6; shadow.scale.set(wd, lv === 1 ? 1.1 : 0.9, 1); shadow.position.set(a.x, a.y - 0.45, W.face + (d[1] < 0 ? 0.004 : 0)); }
      if (!S.seated) { V.scrape(Math.min(1, Math.abs(Mm.v) / 2)); V.creak(Mm.brake * Math.min(1, Math.abs(Mm.v) * 2)); }
      // the feather down the gap
      const Fh = A.feather; if (Fh) { Fh.t += dt; const u = Math.min(1, Fh.t / 2.2); feather.visible = true; feather.position.set(a.x + Math.sin(Fh.t * 5) * 0.05, a.y + 0.6 - u * (Fh.through ? 1.6 : 0.6), W.face + Math.max(0.002, g / 2)); feather.rotation.z = Math.sin(Fh.t * 3) * 0.3; if (u >= 1) { A.feather = null; feather.visible = false; Fh.res(); } }   // (review fix 16: the feather goes once it is down)
      // (review fix 8: the crew's helper brings a far stone close — seen, and the gap with it)
      const Sl = A.slide; if (Sl) { Sl.t += dt; const u = Math.min(1, Sl.t / 1.2); S.mo.s = Sl.from + (Sl.to - Sl.from) * (u * u * (3 - 2 * u)); V.scrape(0.4 * (1 - u)); if (u >= 1) { A.slide = null; Sl.res(); } }
      // the hair round the altar (a perfect gap)
      const Hh = A.hair; if (Hh) { Hh.t += dt; const u = Math.min(1, Hh.t / 2.4); Hh.g.children.forEach((c, k) => { c.visible = u * 4 > k; c.scale.x = Math.max(0.001, Math.min(1, u * 4 - k)); }); V.frame(); if (u >= 1 && !Hh.rung) { Hh.rung = 1; V.harp(392); } if (Hh.t > 3.4) { root.remove(Hh.g); A.hair = null; Hh.res(); } }
      // the crew builds the two small kevashim (level 1's first completion)
      const Bd = A.build; if (Bd) { Bd.t += dt; const k = Math.min(1, Bd.t / 3); Bd.g.scale.y = Math.max(0.01, k); Bd.g.position.y = F * (1 - k); if (k >= 1 && !Bd.done) { Bd.done = 1; V.thud(); X.dust(-29, F + 1, 30, 10, 4); X.dust(-47, F + 1, 30, 10, 4); setTimeout(() => { if (!A.ended) Bd.res(); }, 400); } }
    }
    function onEvents(es) {
      for (const e of es) {
        ev(e.k);
        if (e.k === 'turn') { if (e.clean) { V.knock(0.6); X.line('הפנייה עברה בלי לגעת בפינה', 1500); } else { V.bump(); X.shake(0.1, 0.15); X.line('נגעה בפינה, מאטה', 1500); } }
        else if (e.k === 'touch') { V.thud(); X.shake(0.2, 0.3); if (e.free) X.line('הניסוי החינם: הצוות תופס, בלי שריטה', 2000); else hurt(X, Mo, 'nima.scratch', faceAt(), { where: ['a', 'b', 'c'][lv - 1], lv }); }
        else if (e.k === 'seated') seated(e);
      }
    }
    const faceAt = () => { const a = pos(); return V3(X, a.x, a.y + 0.5, W.face); };
    async function seated(e) {
      A.busy = 1; TH.up(null); V.stop(); V.thud(); X.dust(pos().x, pos().y, pos().z, 6, 2);
      keep();
      // the feather goes down the gap by itself; through when there is a gap
      await new Promise((res) => { A.feather = { t: 0, through: e.gap > 0, res }; V.quill && V.quill(); });
      if (A.ended) return;
      if (e.close === 'crew') {
        X.line('רחוק: העוזר מקרב את האבן', 1600);
        await new Promise((res) => { A.slide = { t: 0, from: S.mo.s, to: S.way.len - NM.NEAR, res }; });
        if (A.ended) return;
        S.seated.gap = +gapOf(S).toFixed(4); S.seated.tef = +(gapOf(S) * 6).toFixed(3); keep();
      }
      if (e.grade) award(X, faceAt(), e.grade, lv, 'מקרבים');
      if (e.bonus) extra(X, NM.PTS.turn, lv, 'turn', 'פנייה נקייה');
      if (e.grade === 'gold') {
        try { X.quick(faceAt(), WORDS.quick); } catch (er) { /* */ }
        closeUp(false); await X.wait(0.7); await hairRound();
      } else closeUp(false);
      if (A.ended) return;
      if (lv === 1 && !headBefore) await buildSmall();
      if (A.ended) return;
      Mo.keep('nima', null);
      const res = result(S);
      await finish(X, A, res, WORDS.nima, faceAt(), { eye: W.cam[0].slice(), aim: W.cam[1].slice(), secs: 1.4, kohen: false, own: () => (gang.list || []).map((w) => w.a), after: () => { try { Mo.filmOver(); } catch (er) { /* */ } try { gang.clear(); } catch (er) { /* */ } } });
    }
    /** one hair round the whole altar, at the upper block's foot, through every gap: four lines that grow and close */
    function hairRound() {
      return new Promise((res) => {
        const g = new T.Group(); root.add(g); const y = S10.base + 0.6, e = 0.35, b = [U[0] - e, U[1] - e, U[2] + e, U[3] + e];
        const side = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), geo = new T.BoxGeometry(L, 0.06, 0.06); geo.translate(L / 2, 0, 0); const m = new T.Mesh(geo, Mt.y10glow); m.position.set(x0, y, z0); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); m.scale.x = 0.001; m.visible = false; g.add(m); return m; };
        side(b[0], b[3], b[2], b[3]); side(b[2], b[3], b[2], b[1]); side(b[2], b[1], b[0], b[1]); side(b[0], b[1], b[0], b[3]);
        X.shot([-38 + 40, 50, -3.5 + 40], [-38, 22, -3.5], 1.0);
        A.hair = { t: 0, g, res, rung: 0 };
      });
    }
    function buildSmall() {
      return new Promise((res) => {
        const g = new T.Group(); root.add(g); smallRamps(X, Mt, g); g.scale.y = 0.01; g.position.y = F;
        X.shot([-12, 28, 52], [-38, 18, 26], 1.0); X.line('הצוות בונה את שני הכבשים הקטנים, מובדלים מן המזבח מלא נימא', 2600);
        A.build = { t: 0, g, res: () => { A.build = null; res(); } };
      });
    }
    function hint() {
      if (resumed || !S.free || A.hintOn) return; A.hintOn = 1;
      const a = pos(), d = dirAt(), p = X.scr(a.x, a.y, a.z), q = X.scr(a.x + d[0] * 3, a.y, a.z + d[1] * 3);
      X.hand({ x: a.x, y: a.y, z: a.z }, Math.max(-90, Math.min(90, q.x - p.x)), Math.max(-90, Math.min(90, q.y - p.y)));
    }
    return {
      close: true, kohenWorks: true,
      begin() {
        try { X.kohen(false); } catch (e) { /* (the kohen with the feather stands by the stone, one of the figures) */ }
        castMen(); FG.attach(); home(0.01); X.line('', 0);
        X.wait(0.9).then(() => { if (!A.ended) hint(); });
        ev(resumed ? 'resume' : 'begin'); keep();
      },
      update(dt) {
        A.t += dt;
        try {
          V.frame(); Bt.step(dt); gang.update(dt, Bt);
          if (!A.busy && !A.finished) {
            const near = closeOf(S); if (near !== A.close && S.mo.pulled) closeUp(near);
            const sdt = A.close ? dt / NA.SLOW : dt;   // (the close-up: the time three times slower)
            onEvents(step(S, TH.read(dt), sdt));
          }
          draw(dt);
          if (A.t % 1 < dt) keep();
        } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h133] nima', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { TH.up(null); keep(); },
      wants(p) { if (!p) return true; return p.x < innerWidth * 0.6; },
      holds() { return TH.on; },
      lensFov: NA.FOV,
      end() { A.ended = true; FG.detach(); V.stop(); X.hand(null); lens(X, fov0); try { gang.clear(); } catch (e) { /* */ } X.props.remove(root); if (lv === 1) own('head', false); },
      at() { return faceAt(); },
      dbg() {
        const a = pos(), sc = X.scr(a.x, a.y, a.z), Mm = S.mo;
        return { id: m.id, lv, t: +A.t.toFixed(2), ev: A.ev.slice(-10), s: +Mm.s.toFixed(4), len: S.way.len, v: +Mm.v.toFixed(3), brake: +Mm.brake.toFixed(2), gap: +gapOf(S).toFixed(4), close: A.close, seated: S.seated, turn: S.turn, free: S.free, touched: S.touched, at: [Math.round(sc.x), Math.round(sc.y)], thumb: TH.dbg(), dir: (() => { try { const d = TH && dirAt(), a2 = pos(), p = X.scr(a2.x, a2.y, a2.z), q = X.scr(a2.x + d[0] * 2, a2.y + (lv === 1 ? 2 * 9 / 32 : 0), a2.z + d[1] * 2), L = Math.hypot(q.x - p.x, q.y - p.y) || 1; return [+((q.x - p.x) / L).toFixed(3), +((q.y - p.y) / L).toFixed(3)]; } catch (e) { return null; } })(), busy: A.busy, finished: A.finished };
      },
    };
  },
};
