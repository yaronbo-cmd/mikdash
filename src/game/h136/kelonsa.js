/* ── build 136 ── h136/kelonsa.js — work 2 "כלונסות הארז, שלא יבעט" (spec docs/specs/shlav-13-he.md v4, עבודה 2; the model:
 * kelonsa-model.js). The pole hangs on a short rope from a wheeled trolley on a temporary wooden rail (y 72) over the 11-amah gap between
 * the Heichal's wall (the screen's left) and the Ulam's front from inside (its right). The fixed view for each pole: from the south of it,
 * at its height, looking north along the hall (the gap fills about three quarters of the screen); the kohen on a scaffold under it.
 *   · the WORK hand on the leather strap at the pole's middle slides it along (left: into the deep pocket; right: back to the seat);
 *   · the HELPING hand on the ring at its east end tilts it (up and down), with a little weight: it goes on after the finger stops;
 *   · both fingers off with each end in its socket ≥ 0.05 (after the west end went deep) = the lock: a deep "תוק".
 * Levels 2–3: the front leans east in sections; each lock freezes its own; he chooses the order: a wide view of the gap and its pockets,
 * a tap on a pocket's pole brings it up. A crack in the plaster that grows, the seat that moves away: what the lean looks like.
 *   KELONSA_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { WORDS } from './model.js';
import * as K from './kelonsa-model.js';
import { mats13 } from './look.js';
import { own, SH13 } from './world.js';
import { award, extra, hurt, finish, V3, lens, voices13, ring, HANDS, dp } from './kit13.js';
import { fingers } from '../h113/acts.js';

const S13 = BOOK.s13, KS = S13.kelonsa, FR = S13.front, HW = S13.heichalWall, RAD = Math.PI / 180;
export const KT = Object.freeze({ FOV: 40, GRIP: 34, CHOOSE: [[-84, 74, 38], [-86.5, 64, -6]], PICK_R: 70 });

function make(m, X) {
  const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = voices13(X), Mt = mats13(X);
  const root = new T.Group(); root.name = 'h136-kelonsa-act'; X.props.root.add(root);
  const A = { t: 0, ev: [], ended: false, finished: false, busy: 0, sl: null, tl: null, cam: null };
  const ev = (e) => { A.ev.push(e); if (A.ev.length > 24) A.ev.shift(); };
  const b0 = Mo.workOf(m.k);
  let S = b0 && b0.id === m.id ? K.load(b0) : null; if (S && S.lv !== lv) S = null; const resumed = !!S;
  if (!S) S = K.fresh(lv);
  let k0 = ''; const keep = () => { const b = K.save(S, m.id), k = JSON.stringify(b); if (k === k0) return; k0 = k; Mo.keep(m.k, b); X.save(); };
  // ── the lean the world reads (the seats move with it)
  SH13.lean = { dAt: (z) => S.d[K.secOf(lv, z)] || 0 };
  // ── what the act draws: the rail, the trolley, the pole (its strap and its ring), the scaffold, the waiting poles, the live cracks
  const rail = new T.Group(); root.add(rail);
  const poleG = new T.Group(); root.add(poleG);
  const pole = new T.Mesh(new T.CylinderGeometry(KS.r, KS.r * 1.06, KS.len, 14), Mt.y13cedar); pole.rotation.z = Math.PI / 2; pole.castShadow = true; poleG.add(pole);
  const strap = new T.Mesh(new T.CylinderGeometry(KS.r + 0.06, KS.r + 0.06, 0.5, 14), Mt.y13belt); strap.rotation.z = Math.PI / 2; poleG.add(strap);
  const ringM = new T.Mesh(new T.TorusGeometry(0.42, 0.09, 6, 16), Mt.y13goldDark); ringM.rotation.y = Math.PI / 2; ringM.position.x = KS.half - 0.4; poleG.add(ringM);
  const trolley = new T.Mesh(X.props.geo.box, Mt.y13woodD); trolley.scale.set(1.2, 0.6, 1.4); root.add(trolley);
  const rope = new T.Mesh(X.props.geo.box, Mt.y13rope); root.add(rope);
  const scaf = new T.Group(); root.add(scaf);
  const waiting = new T.Group(); root.add(waiting);
  const cracks = new T.Group(); root.add(cracks);
  const marks = new T.Group(); root.add(marks);
  const ghost = new T.Mesh(X.props.geo.box, Mt.y13ghost); ghost.visible = false; root.add(ghost);
  const rings = { sl: ring(HANDS.R), tl: ring(HANDS.L) };
  function buildRail(z) {
    for (let k = rail.children.length - 1; k >= 0; k--) rail.remove(rail.children[k]);
    const R = KS.rail;
    for (const dz of [-0.5, 0.5]) { const b = new T.Mesh(X.props.geo.box, Mt.y13wood); b.scale.set(R.x1 - R.x0, 0.3, 0.2); b.position.set((R.x0 + R.x1) / 2, R.y, z + dz); rail.add(b); }
    for (const x of [R.x0, R.x1]) { const p = new T.Mesh(X.props.geo.box, Mt.y13woodD); p.scale.set(0.3, 0.3, 1.4); p.position.set(x, R.y, z); rail.add(p); }
  }
  function buildScaffold(z) {
    for (let k = scaf.children.length - 1; k >= 0; k--) scaf.remove(scaf.children[k]);
    const y = KS.scaffold.y, h = KS.scaffold.half, x0 = HW.x1 + 0.3, x1 = FR.x0 - 0.3;
    const deck = new T.Mesh(X.props.geo.box, Mt.y13wood); deck.scale.set(x1 - x0, 0.25, h * 2); deck.position.set((x0 + x1) / 2, y - 0.12, z); deck.receiveShadow = true; scaf.add(deck);
    for (const x of [x0 + 0.3, x1 - 0.3]) for (const s of [-1, 1]) { const leg = new T.Mesh(X.props.geo.box, Mt.y13woodD); leg.scale.set(0.25, y - S13.hallFloor, 0.25); leg.position.set(x, (y + S13.hallFloor) / 2, z + s * (h - 0.2)); scaf.add(leg); }
    SH13.scaf = [x0, z - h, x1, z + h, y];
  }
  function buildWaiting() {
    for (let k = waiting.children.length - 1; k >= 0; k--) waiting.remove(waiting.children[k]);
    for (const z of K.leftPoles(S)) {
      if (z === S.cur) continue;
      // (the waiting poles lie on the hall's floor under their places, a gold ring at each: tap one to bring it up)
      const p = new T.Mesh(new T.CylinderGeometry(KS.r, KS.r, KS.len, 10), Mt.y13cedarL); p.rotation.z = Math.PI / 2; p.position.set(-86.5, S13.hallFloor + KS.r, z); waiting.add(p);
      const g = new T.Mesh(new T.TorusGeometry(0.9, 0.12, 6, 20), Mt.y13goldLit); g.rotation.x = Math.PI / 2; g.position.set(-86.5, S13.hallFloor + 2.2, z); g.userData.z = z; waiting.add(g);
    }
  }
  function choosing() { return S.cur == null && !S.done; }
  const camOf = (z) => KS.cam(z);
  function view(d = 0.8) {
    lens(X, KT.FOV);
    if (choosing()) { X.shot(KT.CHOOSE[0].slice(), KT.CHOOSE[1].slice(), d); A.cam = 'choose'; return; }
    const c = camOf(S.cur); X.shot(c[0].slice(), c[1].slice(), d); A.cam = S.cur;
  }
  function gear() {
    if (S.cur == null) { poleG.visible = false; trolley.visible = false; rope.visible = false; ghost.visible = false; buildWaiting(); return; }
    poleG.visible = true; trolley.visible = true; rope.visible = true;
    own('pole' + S.cur, true); buildRail(S.cur); buildScaffold(S.cur); buildWaiting();
    // (level 1: the place's shadow — where the locked pole lies)
    ghost.visible = lv === 1; ghost.scale.set(KS.len, 2 * KS.r, 2 * KS.r); ghost.position.set((KS.lock.w + KS.lock.e) / 2, KS.y, S.cur);
    try { X.stages.hero.place({ x: HW.x1 + 1.6, z: S.cur + 1.4, face: [-86.5, S.cur] }); } catch (e) { /* */ }
  }
  gear();
  // ── the screen: the strap and the ring where they are now
  const scr = (x, y, z) => { const r = X.scr(x, y, z); return { x: r.x, y: r.y }; };
  const strapScr = () => scr(S.px + S.sway, KS.y, S.cur);
  const ringScr = () => { const c = Math.cos(S.phi * RAD), s = Math.sin(S.phi * RAD); return scr(S.px + S.sway + (KS.half - 0.4) * c, KS.y + (KS.half - 0.4) * s, S.cur); };
  /** screen px per amah along the gap (x) and up (y), at the pole */
  const ppa = () => { const a = scr(-86.5, KS.y, S.cur), b = scr(-85.5, KS.y, S.cur), c = scr(-86.5, KS.y + 1, S.cur); return { x: Math.max(4, Math.hypot(b.x - a.x, b.y - a.y)), y: Math.max(4, Math.hypot(c.x - a.x, c.y - a.y)) }; };
  const near = (f, p, r) => Math.hypot(f.x - p.x, f.y - p.y) < Math.max(dp(KT.GRIP), r || 0);
  function pickAt(f) {
    let best = null, bd = 1e9;
    for (const z of K.leftPoles(S)) { const p = scr(-86.5, S13.hallFloor + 2.2, z), q = scr(-86.5, KS.y, z), d = Math.min(Math.hypot(f.x - p.x, f.y - p.y), Math.hypot(f.x - q.x, f.y - q.y)); if (d < bd) { bd = d; best = z; } }
    return bd < dp(KT.PICK_R) ? best : null;
  }
  // ── the fingers: the first on the strap or the ring is that role; at level 1 the strap is enough (the tilt rights itself)
  const FG = fingers(X, {
    down(f) {
      if (A.finished || A.busy) return;
      if (choosing()) { const z = pickAt(f); if (z != null && K.pick(S, z)) { ev('pick:' + z); V.knock(1.4); gear(); view(0.9); keep(); } return; }
      if (S.phase !== 'hang') return;
      const sp = strapScr(), rp = ringScr();
      const dS = Math.hypot(f.x - sp.x, f.y - sp.y), dR = Math.hypot(f.x - rp.x, f.y - rp.y);
      if (!A.tl && (dR < dS || A.sl) && near(f, rp)) { A.tl = { id: f.id, y0: f.y, phi0: S.phi }; X.hand(null); ev('ring'); return; }
      if (!A.sl && near(f, sp, dp(48))) { A.sl = { id: f.id, x0: f.x, px0: S.px }; X.hand(null); ev('strap'); return; }
    },
    move(f) {
      const P = ppa();
      if (A.sl && f.id === A.sl.id) { A.sl.want = A.sl.px0 + (f.x - A.sl.x0) / P.x; return; }
      if (A.tl && f.id === A.tl.id) { const dy = -(f.y - A.tl.y0) / P.y; A.tl.want = A.tl.phi0 + Math.atan2(dy, KS.half) / RAD; }
    },
    up(f) { if (A.sl && f.id === A.sl.id) A.sl = null; if (A.tl && f.id === A.tl.id) A.tl = null; },
  });
  const poleAt = () => V3(X, S.px != null ? S.px : -86.5, KS.y, S.cur != null ? S.cur : 0);
  function handle(e) {
    const at = poleAt();
    if (e.k === 'enter') { ev('enter:' + (e.clean ? 'clean' : 'ok')); V.knock(1.2); if (e.clean) extra(X, 10, lv, 'clean', 'כניסה נקייה'); }
    else if (e.k === 'free') { V.rim(); ev('free'); try { X.line('ניסוי חינם: הכלונס נטוי מדי. הורידו את הטבעת עד שהוא ישר', 2400); } catch (er) { /* */ } }
    else if (e.k === 'jam') { V.rim(); ev('jam'); hurt(X, Mo, 'kelonsa.rim', V3(X, HW.x1, KS.y, S.cur), { lv, at: S.cur }); }
    else if (e.k === 'knock') { V.knock(2.2); ev('knock'); }
    else if (e.k === 'deep') { V.seat(); ev('deep'); }
    else if (e.k === 'out') { ev('out'); }
    else if (e.k === 'seat') { V.seat(); ev('seat'); }
    else if (e.k === 'crack') { V.crack(); ev('crack:' + e.sec); const zs = (K.KL.SECT[lv] || K.KL.SECT[1])[e.sec]; hurt(X, Mo, 'kelonsa.crack', V3(X, FR.x0, KS.y, (zs[0] + zs[1]) / 2), { lv, at: e.sec }); try { X.dust(FR.x0 - 0.3, KS.y + 3, (zs[0] + zs[1]) / 2, 5, 3); } catch (er) { /* */ } }
    else if (e.k === 'lock') {
      ev('lock:' + e.z + ':' + e.grade); V.tok(); try { X.shake(0.12, 0.22); X.dust(FR.x0 - 0.2, KS.y, e.z, 4, 2); } catch (er) { /* */ }
      award(X, at, e.grade, lv, 'ארז');
      Mo.st.poles[e.z] = { d: e.d, bw: e.bw, be: e.be }; keep();
    } else if (e.k === 'choose') { own('pole' + A.lastZ, false); ev('choose'); A.view = 0.6; }
    else if (e.k === 'done') { ev('done'); done(); }
  }
  async function done() {
    if (A.busy) return; A.busy = 2;
    for (const z of KS.zs) own('pole' + z, false);
    const res = K.result(S), at = V3(X, -86.5, KS.y, 0);
    Mo.keep(m.k, null); X.save();
    await X.wait(0.6);
    // (the rail taken away by itself; a look up: the poles like the ribs of a great space)
    rail.visible = false; trolley.visible = false; rope.visible = false; poleG.visible = false; SH13.scaf = null;
    await finish(X, A, res, WORDS.kelonsa, at, { eye: [-86.5, 40, 34], aim: [-86.5, 70, -4], secs: 1.8, kohen: true, after: () => { try { Mo.filmOver(); } catch (er) { /* */ } } });
  }
  function hint() { if (resumed || A.hintOn || S.cur == null) return; A.hintOn = 1; try { X.hand({ x: S.px, y: KS.y, z: S.cur }, 0, 40); } catch (e) { /* */ } }
  function draw() {
    if (S.cur != null) {
      A.lastZ = S.cur;
      const x = S.px + S.sway;
      poleG.position.set(x, KS.y, S.cur); poleG.rotation.z = S.phi * RAD;
      trolley.position.set(S.px, KS.rail.y + 0.3, S.cur);
      const top = KS.rail.y, bot = KS.y + KS.r; rope.scale.set(0.08, top - bot, 0.08); rope.position.set((S.px + x) / 2, (top + bot) / 2, S.cur);
      const sp = strapScr(), rp = ringScr();
      if (A.sl) rings.sl.show(sp.x, sp.y, 1); else rings.sl.show(sp.x, sp.y, 0);
      if (lv > 1 || A.tl) rings.tl.show(rp.x, rp.y, A.tl ? 1 : 0); else rings.tl.hide();
      ringM.material = A.tl ? Mt.y13goldLit : Mt.y13goldDark;
    } else { rings.sl.hide(); rings.tl.hide(); }
    // the live cracks: in the corners and between the sections, as wide as the lean's difference
    for (let k = cracks.children.length - 1; k >= 0; k--) cracks.remove(cracks.children[k]);
    const SE = K.KL.SECT[lv] || K.KL.SECT[1];
    const crackAt = (z, w) => { if (w < 0.01) return; const c = new T.Mesh(X.props.geo.box, Mt.y13crack); c.scale.set(0.05, 8 + w * 10, 0.05 + w * 0.8); c.position.set(FR.x0 - 0.02, KS.y - 1, z); cracks.add(c); };
    crackAt(-29.6, S.d[0]); crackAt(29.6, S.d[S.d.length - 1]);
    for (let i = 1; i < SE.length; i++) crackAt(SE[i][0], Math.abs(S.d[i] - S.d[i - 1]));
    // (the seat's mark in the front's inner face moves east with its section: drawn live here for the poles of this level)
    for (let k = marks.children.length - 1; k >= 0; k--) marks.remove(marks.children[k]);
    for (const z of S.zs) { const d = S.d[K.secOf(lv, z)] || 0, r = new T.Mesh(new T.RingGeometry(KS.seat.dia / 2, KS.seat.dia / 2 + 0.12, 16), Mt.y13goldLit); r.rotation.y = -Math.PI / 2; r.position.set(FR.x0 - 0.03 + d, KS.y, z); marks.add(r); }
  }
  return {
    close: true, kohenWorks: true,
    begin() {
      FG.attach(); view(0.01);
      X.line(resumed ? '' : lv === 1 ? 'גררו את הרצועה שמאלה: הקצה נכנס לשקע העמוק. אחר כך ימינה אל המושב, ועזבו' : lv === 2 ? 'הקיר נוטה החוצה. כל כלונס שננעל עוצר את הקטע שלו. בחרו כלונס' : 'שלושה קטעים נוטים. הסדר שתבחרו קובע. בחרו כלונס', resumed ? 0 : 5200);
      X.wait(0.9).then(() => { if (!A.ended) hint(); });
      ev(resumed ? 'resume' : 'begin'); keep();
    },
    update(dt) {
      A.t += dt;
      try {
        V.frame && V.frame();
        if (!A.busy && !A.finished) {
          let inp = { slide: A.sl ? (A.sl.want != null ? A.sl.want : S.px) : null, tilt: A.tl ? (A.tl.want != null ? A.tl.want : S.phi) : null, held: !!(A.sl || A.tl) };
          if (A.feed) { inp = A.feed(S) || {}; if (inp.pick != null) { if (A.view == null && K.pick(S, inp.pick)) { ev('pick:' + inp.pick); gear(); view(0.9); } inp = {}; } }   // (A.feed: the probes' bot)
          const evs = K.step(S, Math.min(dt, 1 / 30), inp);
          for (const e of evs) handle(e);
          // between poles the camera moves only when no finger is down
          if (A.view != null && !A.sl && !A.tl) { A.view -= dt; if (A.view <= 0) { A.view = null; gear(); view(0.9); } }
        }
        draw();
        if (A.t % 1 < dt) keep();
      } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h136] kelonsa', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
    },
    down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
    cancel() { A.sl = null; A.tl = null; keep(); },
    wants(p) {
      if (!p) return true; if (A.sl || A.tl) return true;
      if (choosing()) return pickAt(p) != null;
      if (S.cur == null) return false;
      return near(p, strapScr(), dp(48)) || near(p, ringScr());
    },
    holds() { return !!(A.sl || A.tl); },
    lensFov: KT.FOV,
    end() {
      A.ended = true; FG.detach(); V.hush(); X.hand(null); lens(X, fov0);
      rings.sl.remove(); rings.tl.remove();
      for (const z of KS.zs) own('pole' + z, false);
      SH13.lean = null; SH13.scaf = null; SH13.key = '';
      X.props.remove(root);
    },
    at() { return poleAt(); },
    dbg() {
      const r3 = (v) => +(+v).toFixed(3), E = S.cur != null ? K.ends(S) : null, sp = S.cur != null ? strapScr() : null, rp = S.cur != null ? ringScr() : null;
      return { id: m.id, lv, cur: S.cur, phase: S.phase, px: r3(S.px || 0), phi: r3(S.phi || 0), inW: S.inW, deep: S.deep, d: S.d.map(r3), frozen: S.frozen, bw: E && r3(E.bw), be: E && r3(E.be),
        steps: S.steps.map((s) => s.grade[0]).join(''), flaws: S.flaws.map((x) => x.f), done: S.done, busy: A.busy, finished: A.finished, cam: A.cam,
        strap: sp && [Math.round(sp.x), Math.round(sp.y)], ring: rp && [Math.round(rp.x), Math.round(rp.y)], ppa: S.cur != null ? ppa() : null,
        picks: K.leftPoles(S).map((z) => { const p = scr(-86.5, S13.hallFloor + 2.2, z); return [z, Math.round(p.x), Math.round(p.y)]; }), held: { sl: !!A.sl, tl: !!A.tl }, ev: A.ev.slice(-12) };
    },
    probe() { return { S, K, A }; },
  };
}
export const KELONSA_ACT = { icon: '🌲', title: 'כלונסות הארז', walkLine: () => 'הכלונסות: אל המעלות, ופנימה אל חלל האולם', stand() { const s = S13.stands.kelonsa; return { x: s[0], z: s[1], face: [FR.face, 0] }; }, prepare() {}, make };
