/* ── build 113 ── h113/acts3.js — stations 4 and 5 of stage 04 (spec "המשחקונים"):
 *   4 hanging the leaf: tilt its head toward you (the upper pin must pass under the lintel), lead its foot over the socket, let go (the
 *     pin drops in), straighten it slowly (the upper pin finds the lintel's socket with a click); then a push, and it turns, heavy;
 *   5 the lock: close the leaves, the bar through the rings into the lock box where wooden pins drop into it (seen in a cutaway: an
 *     illustration), and the key from the chain: turned pegs up, pushed to its shoulder, lifted with one finger while another slides
 *     the bar. Level 3 is Beit HaMoked at evening: locked from inside, out by the wicket, and the Levite's check with the second key.
 */
import { H113, GATES, LV, PISH, inherit, lockGap, ringOff, lockOf, qOf, starsOf } from './model.js';
import { SH4, mats, frameOf, pivotX, leafYaw, makeLeaf, gateBuild, label, keep, gateKeep, box, makeDerrick } from './world.js';
import { fingers, MOUSE, sc, heroAt, nearPt } from './acts.js';
import { clamp, lerp, ease } from '../h109/kit.js';

const D2R = Math.PI / 180, F = H113.FINGER;

/* ───────── 4. hanging the leaf ───────── */
export const HANG = {
  icon: '🚪', title: 'תליית הכנף',
  walkLine: (m) => `${GATES[m.lv].name}: תולים את הכנף`,
  stand(m) { const G = GATES[m.lv], Fr = frameOf(G); return { x: G.c + 2.6, z: Fr.in(6.2), face: [pivotX(G, -1), Fr.zp] }; },
  prepare(m, X) { for (const D of SH4.dk) D.hide(); },
  make(m, X) {
    const lv = X.level(), L = LV[lv], G = GATES[m.lv], Fr = frameOf(G), st = X.M.st, PR = X.props, T = X.THREE;
    SH4.busy = 1;
    gateBuild(X, m.lv, { leaves: true });
    const I = inherit(st, m.lv), Lf = st.leaf[m.lv] || {}, heavy = lv >= 3 ? 0.55 : 1;
    const sockX = pivotX(G, -1, (st.sock[m.lv] && st.sock[m.lv].list && (st.sock[m.lv].list.find((s) => s.id === 'L') || {}).ex) || 0);
    const leaf = makeLeaf(X, { side: -1, s: Fr.s, planks: Lf.planks, rings: lv === 1 ? 1 : 2, pish: m.lv === 3 });
    const D = SH4.dk[0];
    const A = { phase: 'tilt', th: 3, thT: 3, om: 0, fx: sockX + 0.7, fxT: sockX + 0.7, drop: 0, low: I.low, phi: 0, w: 0, pts: 40, falls: 0, rims: 0, tired: 0, workT: 0, pushed: 0, busy: false, t: 0, gauge: label(X), tip: label(X), crew: [], other: null, otherTh: 7, door: null, sub: null, shadow: null, over: false, strip: null };
    const win = L.leafTilt, drop = L.leafDrop, tol = L.pinTol;
    // the second leaf: at level 1 the crews hang it at the same time, mirrored (spec 4); at level 2–3 theirs already stands on its pins
    if (m.lv === 1) { A.other = makeLeaf(X, { side: 1, s: Fr.s, rings: 1 }); }
    else { A.other = makeLeaf(X, { side: 1, s: Fr.s, rings: 2 }); A.otherTh = 0; }
    function poseOther(th, phi = 1.35) { const g = A.other; g.position.set(pivotX(G, 1), Fr.sill - 0.005 + (th > 0.5 ? 0.15 : 0), Fr.zp); g.rotation.set(th * D2R * Fr.s, leafYaw(1, Fr.s, phi), 0); }
    poseOther(A.otherTh, m.lv === 1 ? 0 : 1.35);
    function pose() {
      const g = leaf, seat = A.phase === 'straight' || A.phase === 'seated' || A.phase === 'spin' || A.phase === 'sub';
      const y = seat ? Fr.sill - 0.005 - A.low * F : Fr.sill + 0.16 - A.drop;
      g.position.set(A.fx, y, Fr.zp); g.rotation.set(A.th * D2R * Fr.s, leafYaw(-1, Fr.s, A.phi), 0);
      // the derrick's rope to its head (it leans on it: spec 4)
      if (A.phase !== 'spin' && A.phase !== 'seated' && A.phase !== 'sub') { const top = topAt(); D.aim(top.x, 38, top.z - Fr.s * 1.5); D.ropeTo(top); } else D.rope.show(false);
      if (A.shadow) { A.shadow.visible = lv === 1 && A.phase === 'foot'; A.shadow.position.set(A.fx, Fr.sill + 0.02, Fr.zp); }
      gaugeShow();
    }
    function topAt() { const h = H113.LEAF_H + 0.3; return { x: A.fx + 2.4, y: Fr.sill + h * Math.cos(A.th * D2R), z: Fr.zp + Fr.s * h * Math.sin(A.th * D2R) }; }
    function gaugeShow() {
      if (A.phase !== 'tilt' && A.phase !== 'foot') { A.gauge.set(''); return; }
      const ok = A.th >= win[0] && A.th <= win[1], under = A.th >= win[0];
      const bars = Math.round(clamp(A.th / drop, 0, 1) * 10);
      A.gauge.set(`${'▮'.repeat(bars)}${'▯'.repeat(10 - bars)} ${under ? (ok ? 'מתחת למשקוף ✓' : 'מסוכן!') : 'נוגע במשקוף'}`, { x: A.fx + 0.4, y: Fr.sill + H113.LEAF_H * 0.92, z: Fr.zp + Fr.s * 2.6 }, ok);
    }
    function crewAt(x, z, fx, fz, o = {}) { let w = null; try { w = SH4.crew.add(x, z, { ...o, role: o.role || 'kneel', fx, fz, crew: o.crew || 2 }); } catch (e) { w = null; } if (w) A.crew.push(w); return w; }
    function shot(k) {
      if (k === 'foot') { X.shot([sockX + 3.6, Fr.sill + 2.6, Fr.in(5.4)], [sockX + 0.6, Fr.sill + 0.3, Fr.zp], 0.9); return; }
      if (k === 'sub') { const h = holeAt(); X.shot([h.x + 2.4, h.y + 1.4, h.z + Fr.s * 4.2], [h.x, h.y + 0.6, h.z], 1.0); return; }
      // ¾ from inside the court: the whole leaf in the frame (twenty amot: the camera is far, the kohen smaller here)
      // (the court's floor inside may stand above the sill: the camera keeps above it; the whole leaf in the frame)
      const cz = Fr.in(34), gy = X.ground(G.c + 9, cz) || 6;
      X.shot([G.c + 9, Math.max(19, gy + 9), cz], [G.c - 2.2, 15.5, Fr.zp], 1.1);
    }
    async function fall() {
      // tilted past its threshold (or straightened with its foot not in): it leaves the workers' hands and falls on the Chel (−40)
      A.busy = true; A.falls++; A.pts = Math.min(A.pts, 20);
      const th0 = A.th; for (let i = 1; i <= 18; i++) { await X.wait(0.03); A.th = th0 + (90 - th0) * (i / 18) ** 2; leaf.rotation.x = A.th * D2R * Fr.s; leaf.position.y = Fr.sill + 0.1; }
      D.rope.show(false);
      X.loss(40, { x: A.fx + 2.5, y: 8, z: Fr.in(10) }, 'הכנף נשמטה ונסדקה לאורכה', 1, 'cedar'); X.shake(0.5, 0.6); X.dust(A.fx + 2.5, 6.5, Fr.in(10), 40, 8); X.play('crash');
      await X.wait(1.2);
      X.line(lv === 1 ? 'הצוות בונה אותה מחדש בחצר' : 'קרשים חדשים בחצר · הצוות מרכיב');
      leaf.visible = false; await X.wait(2.6);
      leaf.visible = true; A.th = A.thT = 3; A.om = 0; A.fx = A.fxT = sockX + 0.7; A.drop = 0; A.phase = 'tilt'; A.workT = 0; A.tired = 0; pose();
      A.busy = false; shot('tilt'); X.line('שוב: הטו לאט את ראש הכנף אליכם');
    }
    async function dropIn() {
      A.busy = true; A.phase = 'dropping';
      for (let i = 1; i <= 6; i++) { await X.wait(0.03); A.drop = (0.165 * i) / 6; pose(); }
      X.play('thud'); X.dust(A.fx, Fr.sill + 0.1, Fr.zp, 6, 0.5); try { X.haptic && X.haptic(20); } catch (e) { /* */ }
      X.word({ x: A.fx, y: Fr.sill + 1.2, z: Fr.zp }, 'הפין בגומה');
      if (m.lv === 1) { A.otherTh = 7; }
      A.phase = 'straight'; A.busy = false; shot('tilt');
      X.line('גררו את הראש בחזרה למעלה · לאט בסוף'); X.hand({ x: A.fx + 2.4, y: Fr.sill + 14, z: Fr.zp + Fr.s * 2 }, 0, -40);
    }
    async function seated(v) {
      A.busy = true; A.phase = 'seated'; A.th = 0; A.om = 0; pose(); D.rope.show(false);
      const at = { x: A.fx + 2.4, y: H113.TOP - 1, z: Fr.zp };
      if (v > 25) {
        A.rims++; A.pts = Math.min(A.pts, 20);
        X.loss(20, at, 'הפין העליון הכה בשפת הגומה', 0); X.sparks(A.fx, H113.TOP, Fr.zp, 12); X.dust(A.fx, H113.TOP, Fr.zp, 10, 1); X.shake(0.25, 0.3);
        X.line('הצוות סותם בעופרת'); await X.wait(1.6);
      } else {
        X.play('settle'); X.hit(at, A.pts >= 40 ? 'gold' : 'good', { text: 'נקישה! הכנף עומדת', craft: 'נגרים' });
      }
      if (m.lv === 1) { A.otherTh = 0; }
      // what came from the stations before (spec 4): a deep socket (it sits low, scrapes), an oval one (it wobbles), a lean (light)
      if (A.low >= 0.5 || Math.abs(I.lean) >= 1 || I.wobble) {
        const what = A.low >= 0.5 ? 'יושבת נמוך ושורטת' : I.wobble ? 'מתנדנדת בסיבוב' : 'נוטה: פס אור בצד';
        X.word({ x: A.fx + 2.5, y: 12, z: Fr.zp }, `הכנף ${what}`);
        if (Math.abs(I.lean) >= 1) { A.strip = box(X, mats(X).chalk, A.fx + 4.75, Fr.sill + 0.5, Fr.zp - 0.05, A.fx + 4.85, Fr.sill + H113.LEAF_H * 0.9, Fr.zp + 0.05); A.strip.material = mats(X).chalk; }
        const w = crewAt(A.fx + 1.2, Fr.in(1.4), A.fx, Fr.zp, { role: 'hammer', item: 'mallet', crew: 1 });
        X.line('הנגר מתקן בטלאי וביתד'); await X.wait(2.6); SH4.crew.remove(w); if (A.strip) { PR.remove(A.strip); A.strip = null; }
        A.pts = Math.min(A.pts, 20);
      }
      // level 2: the second leaf must meet the first (spec 4): a gap — the carpenter adds a strip; a jam — trimmed
      if (m.lv === 2) {
        const g = I.gap;
        if (Math.abs(g) > 1.5) { A.pts = Math.min(A.pts, 20); X.word({ x: G.c, y: 10, z: Fr.zp }, g > 0 ? `רווח ${Math.round(g)} אצבעות · הנגר מוסיף פס` : 'הכנפיים נדחקות · מקצצים'); const w = crewAt(G.c, Fr.in(1.2), G.c, Fr.zp, { role: 'hammer', item: 'chisel', crew: 1 }); await X.wait(2.4); SH4.crew.remove(w); A.hangGap = -g; }
      }
      if (m.lv === 3) { await subStart(); return; }
      spinStart();
    }
    function spinStart() {
      A.phase = 'spin'; A.busy = false; A.spinT = 0;
      shot('tilt'); X.line('דחפו את הכנף · היא מסתובבת'); X.hand({ x: A.fx + 3.6, y: Fr.sill + 7, z: Fr.zp }, 60, 0);
    }
    /* level 3: the wicket's little door on its tiny pins (spec 4: the same motion, a window three times smaller; a macro ≤ 10 s) */
    function holeAt() { const d = leaf.userData.parts.door; const p = d ? d.getWorldPosition(new T.Vector3()) : leaf.position.clone(); return { x: p.x + 0.45, y: p.y, z: p.z }; }
    async function subStart() {
      const d = leaf.userData.parts.door; if (!d) { spinStart(); return; }
      A.sub = { th: 2, thT: 2, om: 0, fx: 0.18, fxT: 0.18, ph: 'tilt', t: 0 };
      A.phase = 'sub'; A.busy = false; shot('sub');
      X.line('הפשפש: אותה תנועה, חלון קטן'); X.hand({ x: holeAt().x, y: holeAt().y + 1.4, z: holeAt().z }, 0, 30);
    }
    function poseSub() {
      const d = leaf.userData.parts.door, S = A.sub; if (!d) return;
      d.rotation.x = -S.th * D2R; d.position.x = (leaf.userData.parts.hole ? leaf.userData.parts.hole.x0 : 0.3) + 0.04 + S.fx;
      d.position.y = (leaf.userData.parts.hole ? leaf.userData.parts.hole.y0 : 0.3) + (S.ph === 'tilt' || S.ph === 'foot' ? 0.05 : 0);
      A.tip.set(S.ph === 'tilt' ? (S.th >= 6 && S.th <= 7 ? 'מתחת ✓' : `${S.th.toFixed(1)}°`) : S.ph === 'foot' ? 'מעל הפין?' : '', { x: holeAt().x, y: holeAt().y + 1.9, z: holeAt().z }, S.th >= 6 && S.th <= 7);
    }
    const Fg = fingers(X, {
      down(f) {
        if (A.busy) return;
        f.th0 = A.thT; f.fx0 = A.fxT; X.hand(null);
        if (A.phase === 'spin') { f.what = 'push'; f.lastX = f.x; f.lastT = performance.now(); return; }
        if (A.phase === 'sub') { f.what = 'sub'; f.sth0 = A.sub.thT; f.sfx0 = A.sub.fxT; return; }
        // the head (the upper part) or the foot (the lower part) of the leaf on the screen
        const head = X.scr(A.fx + 2.4, Fr.sill + 12, Fr.zp), foot = X.scr(A.fx + 2.4, Fr.sill + 1.5, Fr.zp);
        f.what = A.phase === 'foot' && Math.abs(f.y - foot.y) < Math.abs(f.y - head.y) ? 'foot' : 'head';
      },
      move(f) {
        if (A.busy) return;
        const H = Math.max(300, innerHeight), W = Math.max(320, innerWidth);
        if (f.what === 'head' && (A.phase === 'tilt' || A.phase === 'foot' || A.phase === 'straight')) A.thT = clamp(f.th0 + ((f.y - f.y0) / H) * 26, A.phase === 'straight' ? -0.5 : 0, 30);
        if (f.what === 'foot' && A.phase === 'foot') A.fxT = clamp(f.fx0 - ((f.x - f.x0) / W) * 3.2, sockX - 1.2, sockX + 1.8);
        if (f.what === 'push') { const now = performance.now(), dx = f.x - f.lastX, dt = Math.max(8, now - f.lastT) / 1000; f.lastX = f.x; f.lastT = now; A.w += clamp(-dx / W * 9, -0.6, 0.6) * heavy / Math.max(1, dt * 30); A.pushed = 1; }
        if (f.what === 'sub') {
          const S = A.sub;
          if (S.ph === 'tilt' || S.ph === 'straight') S.thT = clamp(f.sth0 + ((f.y - f.y0) / H) * 18, -0.3, 16);
          if (S.ph === 'foot') S.fxT = clamp(f.sfx0 - ((f.x - f.x0) / W) * 0.8, -0.2, 0.5);
        }
      },
      up(f) {
        if (A.busy) return;
        if (f.what === 'head' && A.phase === 'tilt') {
          if (A.th >= win[0] && A.th <= win[1] + 0.6) { A.phase = 'foot'; shot('foot'); X.line('גררו את רגל הכנף מעל הגומה · שחררו'); X.hand({ x: A.fx, y: Fr.sill + 0.5, z: Fr.zp }, -50, 0); }
          else if (A.th < win[0]) X.line('עוד הטיה: הפין העליון נוגע במשקוף', 1600);
          return;
        }
        if (f.what === 'foot' && A.phase === 'foot') {
          const off = Math.abs(A.fx - sockX) / F;
          if (off <= tol) { A.fx = A.fxT = sockX; dropIn(); }
          else { X.word({ x: A.fx, y: Fr.sill + 1.2, z: Fr.zp }, `לא מעל הגומה (${off.toFixed(1)} אצבעות)`); X.play('thud'); }
          return;
        }
        if (f.what === 'sub') {
          const S = A.sub;
          if (S.ph === 'tilt' && S.th >= 6 && S.th <= 7.3) { S.ph = 'foot'; X.line('רגל הפשפש מעל הפין הקטן'); }
          else if (S.ph === 'tilt' && S.th > 12) subFail();
          else if (S.ph === 'foot') { if (Math.abs(S.fx) / F <= (L.pishPin || 0.5)) { S.fx = S.fxT = 0; S.ph = 'straight'; X.play('thud'); X.line('יישרו לאט'); } else { X.word(holeAt(), 'לא מעל הפין'); } }
          else if (S.ph === 'straight' && S.th <= 0.4) { subDone(); }
        }
      },
    });
    async function subFail() { A.busy = true; A.pts = Math.min(A.pts, 20); X.word(holeAt(), 'הפשפש נשמט · מרימים שוב'); X.play('thud'); A.sub.th = A.sub.thT = 2; await X.wait(1.0); A.sub.ph = 'tilt'; A.busy = false; }
    async function subDone() { A.busy = true; X.play('settle'); X.hit({ ...holeAt(), y: holeAt().y + 1.5 }, 'gold', { text: 'הפשפש תלוי', craft: 'נגרים' }); A.tip.set(''); await X.wait(0.8); spinStart(); }
    async function finish() {
      if (A.over) return; A.over = true; A.busy = true;
      st.hang[m.lv] = { done: 1, gap: +(A.hangGap || 0).toFixed(2) }; X.save();
      const q = qOf(A.pts); X.end({ q, stars: starsOf(q), at: { x: G.c, y: 16, z: Fr.zp } });
    }
    return {
      close: true,
      begin() {
        keep(X, [gateKeep(G, 6)]); Fg.attach();
        D.place(G.c - 14, Fr.in(2.5), 0); D.crewIn(1);
        if (lv === 1) { A.shadow = new T.Mesh(new T.CircleGeometry(0.16, 16), mats(X).shadowB.clone()); A.shadow.rotation.x = -Math.PI / 2; A.shadow.renderOrder = 996; PR.root.add(A.shadow); }
        // two workers at its foot (spec 4: "שני פועלים אוחזים ברגלה")
        crewAt(sockX + 1.2, Fr.in(1.5), sockX + 1.2, Fr.zp, { role: 'hold', crew: 2 }); crewAt(sockX + 3.4, Fr.in(1.5), sockX + 3.4, Fr.zp, { role: 'hold', crew: 2 });
        heroAt(X, G.c + 2.6, Fr.in(6.2), sockX, Fr.zp);
        pose(); shot('tilt');
        X.line('גררו את ראש הכנף אליכם · לאט');
        X.hand({ x: A.fx + 2.4, y: Fr.sill + 13, z: Fr.zp }, 0, 40);
      },
      update(dt) {
        A.t += dt;
        // the head follows the finger with weight (rule 21), the foot lags behind the workers
        const k = 18 * heavy;
        const acc = k * (A.thT - A.th) - 2 * Math.sqrt(k) * A.om; A.om += acc * dt; const thPrev = A.th; A.th += A.om * dt;
        A.vth = (A.th - thPrev) / Math.max(dt, 1e-3);
        A.fx = lerp(A.fx, A.fxT, 1 - Math.exp(-dt * 3 * heavy));
        if (A.busy) { if (m.lv === 1 && A.other) poseOther(lerp(A.otherNow || 0, A.otherTh, 0.1), 0); return; }
        if (m.lv === 1 && A.other) { A.otherNow = lerp(A.otherNow || 0, A.otherTh, 1 - Math.exp(-dt * 1.5)); poseOther(A.otherNow, 0); }
        if ((A.phase === 'tilt' || A.phase === 'foot' || A.phase === 'straight') && A.th > drop) { fall(); return; }
        // the workers' window (spec 4: L2 12 s, L3 8 s; level 3 they tremble after 8 s)
        if ((A.phase === 'tilt' || A.phase === 'foot') && A.th > 3.5 && Number.isFinite(L.window)) {
          A.workT += dt;
          if (A.workT > L.window && !A.tired) { A.tired = 1; X.word(topAt(), 'הפועלים מתעייפים!'); }
          if (A.tired) A.th += Math.sin(A.t * 40) * 0.08;
          if (A.workT > L.window + 4) { A.tired = 0; A.workT = 0; A.thT = 3; A.phase = 'tilt'; X.line('הפועלים מניחים · מתחילים שוב', 1800); A.pts = Math.min(A.pts, 20); }
        }
        if (A.phase === 'straight' && A.th <= 0.05 && A.thT <= 0.05) { seated(Math.abs(A.vth)); return; }
        if (A.phase === 'spin') {
          // the first thing in the House that moves: a push, it turns both ways, heavy, and stops slowly (bounded by the jamb and the wall)
          A.spinT += dt;
          A.w *= Math.exp(-dt * 0.55 / heavy); A.phi += A.w * dt;
          if (A.phi > 1.55) { A.phi = 1.55; A.w = -A.w * 0.3; X.play('thud'); }
          if (A.phi < -1.45) { A.phi = -1.45; A.w = -A.w * 0.3; X.play('thud'); }
          if (I.wobble) leaf.position.x = A.fx + Math.sin(A.t * 9) * 0.03 * Math.abs(A.w);
          if (Math.abs(A.w) > 0.2 && Math.random() < 0.05) X.play('rope');
          if ((A.pushed && A.spinT > 3.5 && Math.abs(A.w) < 0.05) || A.spinT > 9) { finish(); return; }
        }
        if (A.phase === 'sub') {
          const S = A.sub, ks = 26; const a2 = ks * (S.thT - S.th) - 2 * Math.sqrt(ks) * S.om; S.om += a2 * dt; S.th += S.om * dt; S.fx = lerp(S.fx, S.fxT, 1 - Math.exp(-dt * 4));
          if (S.th > 12 && S.ph !== 'straight') { subFail(); return; }
          poseSub(); S.t += dt;
          if (S.t > 10 && !S.late) { S.late = 1; X.line('לאט ובעדינות · הפשפש קטן', 1500); }
        }
        pose();
      },
      down(p) { Fg.down(p); }, move(p) { Fg.move(p); }, up(p) { Fg.up(p); },
      end() {
        Fg.detach(); for (const w of A.crew) SH4.crew.remove(w); D.hide();
        PR.remove(leaf); if (A.other) PR.remove(A.other); if (A.shadow) PR.remove(A.shadow); if (A.strip) PR.remove(A.strip);
        A.gauge.remove(); A.tip.remove(); keep(X, []); SH4.busy = 0; gateBuild(X, m.lv);
      },
      at() { return { x: G.c, y: 16, z: Fr.zp }; },
      dbg() {
        return { lv, phase: A.phase, busy: A.busy, th: +A.th.toFixed(2), thT: +A.thT.toFixed(2), win, drop, fx: +A.fx.toFixed(3), sockX: +sockX.toFixed(3), off: +((A.fx - sockX) / F).toFixed(2), tol, phi: +A.phi.toFixed(2), w: +A.w.toFixed(2), pts: A.pts, falls: A.falls, rims: A.rims, workT: +A.workT.toFixed(1), window: L.window,
          head: sc(X, { x: A.fx + 2.4, y: Fr.sill + 12, z: Fr.zp }), foot: sc(X, { x: A.fx + 2.4, y: Fr.sill + 1.5, z: Fr.zp }), body: sc(X, { x: A.fx + 3.2, y: Fr.sill + 7, z: Fr.zp }),
          sub: A.sub ? { ph: A.sub.ph, th: +A.sub.th.toFixed(2), fx: +A.sub.fx.toFixed(3), at: sc(X, holeAt()) } : null };
      },
    };
  },
};

/* ───────── 5. the lock: the bar, the pins, the key ───────── */
/** the cutaway of the lock box (an illustration: a window into the mechanism, spec 5): the bar with its holes, the pins hanging over it,
 *  the key board with its pegs under them; drawn on a canvas in a frame on the screen while the key is in */
function cutaway(title) {
  const box2 = document.createElement('div'); box2.className = 'h113-cut'; const c = document.createElement('canvas'); const b = document.createElement('b'); b.textContent = title || 'בתוך המנעול (המחשה)';
  box2.appendChild(c); box2.appendChild(b); document.body.appendChild(box2);
  const C = { el: box2, c, show(on) { box2.style.display = on ? '' : 'none'; } };
  C.place = () => { const w = Math.round(Math.min(innerWidth * 0.4, 420)), h = Math.round(w * 0.5); c.width = w * 2; c.height = h * 2; c.style.width = w + 'px'; c.style.height = h + 'px'; box2.style.right = '14px'; box2.style.top = Math.round(innerHeight * 0.2) + 'px'; C.w = w; C.h = h; };
  C.place();
  /** S: { pins: [x 0..1], pinY: [0 down … 1 up], bar (0 closed … 1 open), holes: [x], key: { in (0..1), up (pegs up), lift (0..1), pegs: [x] } } */
  C.draw = (S) => {
    const g = c.getContext('2d'), W = c.width, H = c.height;
    g.clearRect(0, 0, W, H); g.fillStyle = '#2A1C10'; g.fillRect(0, 0, W, H);
    const bx = W * 0.08, bw = W * 0.84, by = H * 0.18, bh = H * 0.64;
    // the box's walls (cut)
    g.fillStyle = '#8A5A30'; g.fillRect(bx, by, bw, H * 0.08); g.fillRect(bx, by + bh - H * 0.06, bw, H * 0.06);
    g.fillStyle = '#5A3A1E'; for (let i = 0; i < 12; i++) g.fillRect(bx + (i * bw) / 12, by + 2, 3, H * 0.08 - 4);
    // the bar: it slides left to open; its holes under the pins when locked
    const barY = by + bh * 0.42, barH = bh * 0.2, off = -S.bar * bw * 0.36;
    g.fillStyle = '#B07A42'; g.fillRect(bx - 20 + off, barY, bw + 40, barH);
    g.fillStyle = '#7A4E28'; for (let i = 0; i < 9; i++) g.fillRect(bx + off + (i * bw) / 9, barY + barH * 0.15, 2, barH * 0.7);
    g.fillStyle = '#1A120A'; for (const hx of S.holes) g.fillRect(bx + hx * bw - bw * 0.03 + off, barY, bw * 0.06, barH * 0.6);
    // the pins (wooden): from the box's top down into the bar's holes (y 0: down in the holes)
    S.pins.forEach((px, i) => {
      const x = bx + px * bw - bw * 0.025, up = S.pinY[i], top = by + H * 0.08, y1 = barY + barH * 0.55 - up * barH * 0.75;
      g.fillStyle = up >= 0.95 ? '#F2D27A' : S.stuck === i ? '#E0503A' : '#D9B070'; g.fillRect(x, top, bw * 0.05, y1 - top);
      g.strokeStyle = '#3A2410'; g.lineWidth = 2; g.strokeRect(x, top, bw * 0.05, y1 - top);
    });
    // the key board: from the left, under the bar, its pegs up into the holes when lifted
    if (S.key && S.key.in > 0) {
      const kx = bx - bw * 0.35 + S.key.in * bw * 0.35, ky = barY + barH + H * 0.04 - S.key.lift * barH * 0.62;
      g.fillStyle = '#C9A06A'; g.fillRect(kx - bw * 0.62, ky, bw * 0.62 + bw * 0.35 + bw * 0.1, H * 0.07);
      g.fillStyle = '#8A6A3A'; g.fillRect(kx - bw * 0.62, ky - H * 0.03, bw * 0.06, H * 0.13);   // (its shoulder)
      for (const p of S.key.pegs) { const x = kx - bw * 0.62 + bw * 0.06 + p * bw * 0.9 * 0.97; g.fillStyle = '#E8C890'; if (S.key.up) g.fillRect(x - 4, ky - H * 0.05, 9, H * 0.05); else g.fillRect(x - 4, ky + H * 0.07, 9, H * 0.05); }
    }
    g.fillStyle = '#FFF6DA'; g.font = `900 ${Math.round(H * 0.08)}px Heebo, system-ui`; g.textAlign = 'right'; g.fillText(S.text || '', W - 10, H - 8);
  };
  C.remove = () => box2.remove();
  return C;
}

export const LOCK = {
  icon: '🔑', title: 'המנעול',
  walkLine: (m) => (m.lv === 3 ? 'בית המוקד בערב: נועלים מבפנים' : `${GATES[m.lv].name}: בריח, פינים ומפתח`),
  stand(m) { const G = GATES[m.lv], Fr = frameOf(G); return { x: G.c - 7.4, z: Fr.in(3.4), face: [G.c - 3, Fr.zp] }; },
  prepare(m, X) { for (const D of SH4.dk) D.hide(); },
  make(m, X) {
    const lv = X.level(), L = LV[lv], G = GATES[m.lv], Fr = frameOf(G), st = X.M.st, PR = X.props, T = X.THREE, M = mats(X);
    SH4.busy = 1;
    gateBuild(X, m.lv, { leaves: true });
    const I = inherit(st, m.lv), gap0 = lockGap(st, m.lv), roff = ringOff(st, m.lv), LK = lockOf(lv);
    const Lf = st.leaf[m.lv] || {}, gold = !!st.gold[m.lv];
    const legs = [makeLeaf(X, { side: -1, s: Fr.s, planks: Lf.planks, rings: lv === 1 ? 1 : 2, pish: m.lv === 3, gold }), makeLeaf(X, { side: 1, s: Fr.s, rings: lv === 1 ? 1 : 2, gold })];
    const zBar = Fr.zp + Fr.s * (H113.LEAF_T / 2 + 0.36), yBar = Fr.sill + 7.2 - 0.12;
    // the bar: its right end travels from the left jamb (open) to the lock box on the right leaf (locked)
    const OPEN = G.c - 4.6, SHUT = G.c + 3.9, BOX = G.c + 3.1;
    const bar = box(X, M.cedarD, -H113.BAR_L, -0.18, -0.15, 0, 0.18, 0.15); const barG = new T.Group(); barG.add(bar); bar.position.set(-H113.BAR_L / 2, 0, 0); PR.root.add(barG);
    const lockB = box(X, M.cedar, BOX - 0.8, yBar - 0.55, zBar - 0.32, BOX + 0.8, yBar + 0.75, zBar + 0.38);
    // the chain under the marble's place on the jamb's inner face, the keys hanging on it (Middot 1:9: "שלשלת")
    const chainAt = { x: G.c + 5.05, y: Fr.sill + 5.6, z: Fr.in(2.2) };
    const keys = LK.keys.map((k, i) => { const g = box(X, M.cedarL, -0.06, -1.1, -0.18, 0.06, 0, 0.18); g.position.set(chainAt.x - 0.08, chainAt.y - i * 0.15, chainAt.z + (i - (LK.keys.length - 1) / 2) * 0.5); return { k, g }; });
    const chain = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 1.4, 4), M.iron); chain.position.set(chainAt.x - 0.06, chainAt.y + 0.7, chainAt.z); PR.root.add(chain);
    const A = { phase: 'close', phi: [1.35, 1.35], w: [0, 0], closed: [0, 0], bar: OPEN, barT: OPEN, pins: LK.pins.map(() => 0), locked: 0, pts: 40, slams: 0, tears: 0, shears: 0, shimTry: 0, gap: gap0, ringOK: !roff, push: 0, ki: lv >= 2 ? 0 : 0, key: null, busy: false, t: 0, step: 'close', crew: [], lab: label(X), over: false, opened: 0, wrongKey: 0, levite: null, pishBar: 0 };
    const C = cutaway(); C.show(false);
    const ringX = (() => { const L2 = []; if (lv === 1) L2.push(G.c - 2.2, G.c + 1.2); else L2.push(G.c - 3.6, G.c - 1.4, G.c + 1.0, G.c + 2.2); return L2; })();
    const blockAt = roff ? ringX[roff.ring] : null;
    function crewAt(x, z, fx, fz, o = {}) { let w = null; try { w = SH4.crew.add(x, z, { ...o, role: o.role || 'kneel', fx, fz, crew: o.crew || 2 }); } catch (e) { w = null; } if (w) A.crew.push(w); return w; }
    function poseLeaves() {
      legs.forEach((g, i) => { const side = i ? 1 : -1; g.position.set(pivotX(G, side), Fr.sill - 0.005 - (i ? 0 : I.low * F), Fr.zp); g.rotation.set(0, leafYaw(side, Fr.s, A.phi[i]), 0); });
      if (A.gap && A.closed[0] && A.closed[1]) legs[0].position.x -= A.gap * F * 0.5;
    }
    function poseBar() { barG.position.set(A.bar, yBar, zBar); }
    function shot(k, cut) {
      const d = cut ? 0.01 : 1.0;   // (a cut through the shut gate: a flight would pass through its leaves)
      if (k === 'close') X.shot([G.c + 3, Fr.sill + 9, Fr.in(19)], [G.c, Fr.sill + 6, Fr.zp], 1.0);
      else if (k === 'shim') X.shot([G.c + 0.6, Fr.sill + 1.4, Fr.in(3.2)], [G.c, Fr.sill + 0.5, Fr.zp], 0.9);
      else if (k === 'out') X.shot([G.c - 2, Fr.sill + 4.5, Fr.out(9)], [G.c - 2.6, Fr.sill + 1.6, Fr.zp], d);
      // (the key: the lock box and the chain, the bar's grip while it is locked; the bar: its whole travel, from the left jamb to the box)
      else if (k === 'key') X.shot([G.c + 3.4, yBar + 1.6, Fr.in(10)], [G.c + 2.9, yBar - 0.4, zBar], 1.0);
      else X.shot([G.c - 0.2, yBar + 2.6, Fr.in(17.5)], [G.c - 0.4, yBar - 1.0, zBar], d);
    }
    const pinX = (i) => G.c + 2.5 + LK.pins[i] * 1.2;   // (the pins' places in the box, over the bar's holes when locked)
    function cutDraw(text) {
      if (text) C.lastText = text;
      const S = { pins: LK.pins.map((p) => 0.12 + p * 0.76), pinY: A.pins, bar: clamp((SHUT - A.bar) / (SHUT - OPEN), 0, 1) * 1.6, holes: LK.pins.map((p) => 0.12 + p * 0.76), key: A.key ? { in: A.key.in, up: A.key.up, lift: A.key.lift, pegs: A.key.k.pegs.map((p) => 0.12 + p * 0.76) } : null, stuck: A.stuck, text };
      C.draw(S);
    }
    /* close: each leaf dragged to the middle; heavy; a slam is a jolt, no damage (spec 5) */
    function closeStep(dt) {
      for (const i of [0, 1]) {
        if (A.closed[i]) continue;
        A.w[i] *= Math.exp(-dt * 0.9); A.phi[i] += A.w[i] * dt;
        if (A.phi[i] > 1.4) { A.phi[i] = 1.4; A.w[i] = 0; }
        if (A.phi[i] <= 0) {
          const v = Math.abs(A.w[i]); A.phi[i] = 0; A.w[i] = 0; A.closed[i] = 1;
          if (v > 0.9) { A.slams++; A.pts = Math.min(A.pts, 10); X.word({ x: G.c, y: Fr.sill + 9, z: Fr.zp }, 'טריקה! הפין רועד'); X.shake(0.25, 0.3); X.play('crash'); }
          else { X.play('thud'); X.dust(G.c + (i ? 2.5 : -2.5), Fr.sill + 0.2, Fr.zp, 6, 2); }
          if (A.closed[0] && A.closed[1]) afterClose();
        }
      }
      poseLeaves();
    }
    async function afterClose() {
      A.busy = true; await X.wait(0.5);
      if (A.gap) {
        // the gap from the stations before: three lead shims, read the gap in fingers up close (spec 5)
        A.step = 'shim'; shot('shim');
        A.lab.set(lv === 1 ? `רווח ${Math.abs(A.gap)} אצבעות` : 'רווח · כמה אצבעות?', { x: G.c, y: Fr.sill + 1.2, z: Fr.zp }, true);
        A.shims = [1, 2, 3].map((n, k) => { const g = box(X, M.lead, -0.3, 0, -0.2, 0.3, 0.04 * n, 0.2); g.position.set(G.c + 1.0 + k * 0.75, Fr.sill, Fr.in(1.4)); return { n, g, lab: label(X) }; });
        for (const s of A.shims) s.lab.set(String(s.n), { x: s.g.position.x, y: Fr.sill + 0.45, z: s.g.position.z });
        crewAt(G.c + 3.2, Fr.in(1.9), G.c + 1.5, Fr.zp, { role: 'kneel', crew: 1 });
        X.line('בחרו טס עופרת לפי הרווח'); A.busy = false; return;
      }
      barStart();
    }
    async function shimPick(s) {
      A.busy = true; A.shimTry++;
      const need = Math.abs(A.gap);
      if (s.n === need) { X.play('thud'); X.hit({ x: G.c, y: Fr.sill + 1.6, z: Fr.zp }, A.shimTry === 1 ? 'gold' : 'good', { text: 'הכנפיים ישרות', craft: 'נגרים' }); if (A.shimTry > 1) A.pts = Math.min(A.pts, 20); A.gap = 0; }
      else {
        X.word({ x: G.c, y: Fr.sill + 1.6, z: Fr.zp }, s.n < need ? 'הרווח נשאר' : 'הרווח התהפך'); X.play('thud');
        if (A.shimTry >= 2) { X.line('הנגר מתקן בעצמו'); await X.wait(1.6); A.gap = 0; A.pts = Math.min(A.pts, 10); }
        else { A.busy = false; return; }
      }
      for (const q of A.shims) { PR.remove(q.g); q.lab.remove(); } A.shims = null; A.lab.set('');
      poseLeaves(); await X.wait(0.6); barStart();
    }
    function barStart() {
      A.step = 'bar'; A.busy = false; shot('bar');
      X.line('גררו את הבריח דרך הטבעות אל המנעול'); X.hand({ x: A.bar - 1, y: yBar, z: zBar }, -60, 0);
    }
    function barStep(dt) {
      // the bar follows the finger with lag; a ring out of line stops it; the box's pins drop when it is home
      const prev = A.bar; let to = A.barT;
      if (!A.ringOK && blockAt != null && to > blockAt - 0.15 && prev <= blockAt - 0.15 + 1e-3) {
        to = blockAt - 0.15;
        if (A.barT > blockAt + 0.05 && A.pushing) { A.forceT = (A.forceT || 0) + dt; if (A.forceT > 0.8) { tear(); return; } }
        if (!A.blockSaid) { A.blockSaid = 1; X.word({ x: blockAt, y: yBar + 0.8, z: zBar }, 'נתקע בטבעת · דחפו את הכנף'); X.play('thud'); }
      } else A.forceT = 0;
      if (A.locked && A.step !== 'open') to = SHUT;
      A.bar = lerp(A.bar, clamp(to, OPEN, SHUT), 1 - Math.exp(-dt * 6));
      if (A.step === 'bar' && A.bar > SHUT - 0.04) { A.bar = SHUT; lockNow(); }
      poseBar();
    }
    async function tear() {
      A.busy = true; A.tears++; A.pts = Math.min(A.pts, 20); A.forceT = 0;
      X.loss(20, { x: blockAt, y: yBar + 1, z: zBar }, 'הבריח בכוח: הטבעת נתלשה', 0); X.play('crack'); X.dust(blockAt, yBar, zBar, 10, 0.8);
      const w = crewAt(blockAt + 0.8, Fr.in(1.6), blockAt, Fr.zp, { role: 'hammer', item: 'mallet', crew: 1 });
      X.line('הנגר מחזיר את הטבעת'); await X.wait(2.2); SH4.crew.remove(w); A.ringOK = 1; A.barT = A.bar; A.busy = false;
    }
    async function lockNow() {
      A.locked = 1; A.step = 'locked'; A.busy = true;
      C.show(true); C.place();
      for (let i = 0; i <= 8; i++) { A.pins = A.pins.map(() => 1 - i / 8); cutDraw('הפינים נופלים'); await X.wait(0.04); }
      X.play('tap'); X.play('thud'); X.hit({ x: BOX, y: yBar + 1.2, z: zBar }, A.pts >= 40 ? 'gold' : 'good', { text: 'נעול!', craft: 'נגרים' });
      await X.wait(0.8);
      if (m.lv === 3) { await mokedOut(); return; }
      keyStart();
    }
    /* the key: once open to check it works, then locked again (spec 5) */
    function keyStart() {
      A.step = 'key'; A.key = null; A.busy = false; A.stuck = -1;
      shot('key'); cutDraw('');
      X.line(LK.keys.length > 1 ? 'פתחו לבדיקה: הקישו על השלשלת לבחור מפתח' : 'פתחו לבדיקה: הקישו על המפתח בשלשלת');
      X.hand(chainAt, 0, 12);
    }
    async function keyFetch() {
      if (A.busy) return;
      const k = keys[A.ki % keys.length]; A.busy = true; X.play('rope');
      if (A.key) { A.key.g.position.copy(A.key.home); A.key.g.rotation.set(0, 0, 0); }
      A.key = { k: k.k, g: k.g, home: k.g.position.clone(), in: 0.05, up: lv === 1 ? 0 : (A.ki % 2 ? 1 : 0), lift: 0, turn: 0 };
      const to = new T.Vector3(BOX - 1.3, yBar - 0.35, zBar + Fr.s * 0.5); const from = k.g.position.clone();
      for (let i = 1; i <= 14; i++) { await X.wait(0.03); const u = ease(i / 14); k.g.position.set(lerp(from.x, to.x, u), lerp(from.y, to.y, u), lerp(from.z, to.z, u)); }
      k.g.rotation.z = Math.PI / 2;
      A.pins = A.pins.map(() => 0); A.stuck = -1;
      A.step = 'insert'; A.busy = false; cutDraw(A.key.up ? 'היתדות למעלה' : 'היתדות למטה: סובבו');
      X.line(A.key.up ? 'דחפו פנימה עד הכתף' : 'סובבו את המפתח: היתדות למעלה'); X.hand({ x: to.x, y: to.y, z: to.z }, A.key.up ? 50 : 0, A.key.up ? 0 : 30);
      A.ki++;
    }
    function liftOK() { return A.key && A.key.up && A.key.in >= 0.98 && A.key.lift >= 0.85; }
    function pinsUp() { if (!A.key) return A.pins.map(() => 0); return LK.pins.map((p) => (A.key.up && A.key.in >= 0.98 && A.key.k.pegs.some((q) => Math.abs(q - p) < 0.04) ? A.key.lift : 0)); }
    async function opened() {
      A.busy = true; A.step = 'opened'; A.opened = 1; X.play('rope');
      X.hit({ x: BOX, y: yBar + 1.2, z: zBar }, A.key.k.ok && !A.wrongKey ? 'gold' : 'good', { text: 'נפתח · המפתח עובד', craft: 'לויים' });
      // the leaf opens a moment and closes (spec 5: "הכנף נפתחת לרגע ונסגרת")
      for (let i = 1; i <= 10; i++) { await X.wait(0.04); A.phi[1] = 0.25 * Math.sin((i / 10) * Math.PI); poseLeaves(); }
      A.phi[1] = 0; poseLeaves();
      A.key.lift = 0; A.key.in = 0; A.key.g.position.copy(A.key.home); A.key.g.rotation.set(0, 0, 0); A.key = null; A.pins = A.pins.map(() => 0);
      A.step = 'relock'; A.busy = false; cutDraw('');
      X.line('דחפו את הבריח חזרה · הפינים ייפלו'); X.hand({ x: A.bar - 1, y: yBar, z: zBar }, -60, 0);
    }
    /* level 3, Beit HaMoked: out by the wicket, the wicket locked from outside, the Levite's check with the second key (Tamid 3:6, a
       reconstruction) */
    async function mokedOut() {
      A.busy = true; A.step = 'pishOut'; C.show(false);
      X.line('יוצאים דרך הפשפש');
      shot('out', true); await X.wait(0.6);
      heroAt(X, G.c + 2.4, Fr.out(2.2), pivotX(G, -1) + 1.2, Fr.zf);   // (beside the wicket, not before it: the small bar in sight)
      A.levite = crewAt(G.c + 5.2, Fr.out(3.0), G.c, Fr.zf, { role: 'hold', item: 'torch', crew: 3, tunic: '#E8E0CC' });
      await X.wait(0.8);
      A.pishBar = 0; A.step = 'pishLock'; A.busy = false; A.ki = 2;
      A.lab.set('בריח הפשפש', { x: pivotX(G, -1) + 1.2, y: Fr.sill + 1.0, z: Fr.out(0.4) });
      X.line('נעלו את הפשפש: גררו את הבריח הקטן'); X.hand({ x: pivotX(G, -1) + 0.9, y: Fr.sill + 1.0, z: Fr.out(0.4) }, -50, 0);
    }
    async function pishLocked() {
      A.busy = true; X.play('tap'); X.hit({ x: pivotX(G, -1) + 1.2, y: Fr.sill + 2, z: Fr.out(0.4) }, 'gold', { text: 'הפשפש נעול', craft: 'לויים' });
      A.lab.set(''); await X.wait(0.8);
      X.line('הלוי: ״פתח לי את המנעול הגדול מבחוץ״');
      await X.wait(1.6);
      // the Levite's check: through the wicket, the arm in to the armpit with the long key (spec 5, level 3)
      A.step = 'reach'; A.reach = 0; A.busy = false; A.ki = 1;
      shot('bar', true); C.show(true); C.place();
      A.key = { k: LK.keys[1], g: keys[1].g, home: keys[1].g.position.clone(), in: 0, up: 1, lift: 0, turn: 0 }; A.reachKey = 1;
      keys[1].g.visible = false;
      cutDraw('היד נכנסת · לאט');
      X.line('גררו לאט פנימה עד הכתף · היד עד בית השחי');
    }
    async function finish() {
      if (A.over) return; A.over = true; A.busy = true;
      st.lock[m.lv] = { done: 1 }; X.save();
      C.show(false);
      const q = qOf(A.pts); X.end({ q, stars: starsOf(q), at: { x: G.c, y: Fr.sill + 9, z: Fr.zp } });
    }
    const Fg = fingers(X, {
      down(f) {
        if (A.busy) return; X.hand(null);
        f.lastX = f.x; f.lastY = f.y; f.lastT = performance.now();
        if (A.step === 'close') { const l = X.scr(G.c - 2.5, Fr.sill + 6, Fr.zp), r = X.scr(G.c + 2.5, Fr.sill + 6, Fr.zp); const pl = X.scr(pivotX(G, -1) + Math.cos(A.phi[0]) * 2.5, Fr.sill + 6, Fr.zp + Fr.s * Math.sin(A.phi[0]) * 2.5), pr = X.scr(pivotX(G, 1) - Math.cos(A.phi[1]) * 2.5, Fr.sill + 6, Fr.zp + Fr.s * Math.sin(A.phi[1]) * 2.5); void l; void r; f.leaf = Math.hypot(f.x - pl.x, f.y - pl.y) < Math.hypot(f.x - pr.x, f.y - pr.y) ? 0 : 1; if (A.closed[f.leaf]) f.leaf = 1 - f.leaf; f.what = 'leaf'; return; }
        if (A.step === 'bar' || A.step === 'relock') {
          if (!A.ringOK && blockAt != null && A.bar >= blockAt - 0.2) { const lp = X.scr(blockAt + 0.4, yBar - 1.6, Fr.zp); if (Math.hypot(f.x - lp.x, f.y - lp.y) < 90) { f.what = 'nudge'; return; } }
          f.what = 'bar'; f.bar0 = A.barT; A.pushing = 1; return;
        }
        if (A.step === 'key' || A.step === 'insert' || A.step === 'lifted' || A.step === 'pishLock' || A.step === 'reach') {
          if ((A.step === 'key' || A.step === 'insert' || (A.step === 'lifted' && !A.reachKey)) && nearPt(X, chainAt, f, 70)) { f.what = 'chain'; return; }
          if (A.step === 'insert' && A.key && !A.key.up) { f.what = 'turn'; const c = X.scr(A.key.g.position.x, A.key.g.position.y, A.key.g.position.z); f.cx = c.x; f.cy = c.y; f.a0 = Math.atan2(f.y - c.y, f.x - c.x); return; }
          if (A.step === 'insert' && A.key) { f.what = 'in'; f.in0 = A.key.in; return; }
          if (A.step === 'reach') { f.what = 'reach'; f.r0 = A.reach; return; }
          if (A.step === 'pishLock') { f.what = 'pbar'; f.p0 = A.pishBar; return; }
          if (A.step === 'lifted') {
            // the first finger lifts (up), the second slides the bar (sideways); with a mouse a tap latches the lift
            const lifting = [...Fg.L.values()].some((g) => g !== f && g.what === 'lift');
            if (MOUSE) { if (A.key.lift < 0.5 && !A.mLift) { f.what = 'mtap'; return; } f.what = 'slide'; f.bar0 = A.bar; return; }
            f.what = lifting ? 'slide' : 'lift'; f.bar0 = A.bar; f.l0 = A.key.lift; return;
          }
        }
        if (A.step === 'shim') { f.what = 'shim'; return; }
      },
      move(f) {
        if (A.busy) return;
        const W = Math.max(320, innerWidth), now = performance.now(), dt = Math.max(8, now - f.lastT) / 1000, dx = f.x - f.lastX;
        f.lastX = f.x; f.lastT = now;
        if (f.what === 'leaf') {
          // (toward the middle on the screen closes it, away opens it: the leaf's edge and the opening's middle as the camera sees them)
          const i = f.leaf, side = i ? 1 : -1, e = X.scr(pivotX(G, side) - side * Math.cos(A.phi[i]) * 2.5, Fr.sill + 6, Fr.zp + Fr.s * Math.sin(A.phi[i]) * 2.5), c = X.scr(G.c, Fr.sill + 6, Fr.zp);
          const dir = Math.sign(c.x - e.x) || (i ? -1 : 1);
          A.w[i] += -clamp((dx * dir) / W * 7, -0.5, 0.5) / Math.max(1, dt * 30); return;
        }
        // (the bar runs along x: the screen's direction of +x at the bar)
        const a = X.scr(G.c - 2, yBar, zBar), b = X.scr(G.c + 2, yBar, zBar), ux = (b.x - a.x) / 4, uy = (b.y - a.y) / 4, per = Math.hypot(ux, uy) || 1;
        const along = ((f.x - f.x0) * ux + (f.y - f.y0) * uy) / (per * per);
        if (f.what === 'bar') { A.barT = clamp(f.bar0 + along, OPEN, SHUT + 0.3); return; }
        if (f.what === 'turn' && A.key) { const ang = Math.atan2(f.y - f.cy, f.x - f.cx); let d = ang - f.a0; d = Math.atan2(Math.sin(d), Math.cos(d)); f.a0 = ang; A.key.turn += d; A.key.g.rotation.x = A.key.turn; if (Math.abs(A.key.turn) > 2.6) { A.key.up = 1; A.key.turn = 0; A.key.g.rotation.x = 0; X.play('tap'); cutDraw('היתדות למעלה'); X.line('דחפו פנימה עד הכתף'); f.what = null; } return; }
        if (f.what === 'in' && A.key) { A.key.in = clamp(f.in0 + along / 1.3, 0.05, 1); A.key.g.position.x = BOX - 1.3 + A.key.in * 1.0; if (A.key.in >= 1 && A.step === 'insert') { A.step = 'lifted'; X.play('thud'); cutDraw('הכתף עצרה'); X.line(MOUSE ? 'הקישו להרים, וגררו את הבריח החוצה' : 'אצבע מרימה את המפתח, השנייה גוררת את הבריח'); } cutDraw(''); return; }
        if (f.what === 'lift' && A.key) { A.key.lift = clamp(f.l0 + (f.y0 - f.y) / 70, 0, 1); A.pins = pinsUp(); cutDraw(A.key.lift >= 0.85 ? 'הפינים למעלה' : ''); return; }
        if (f.what === 'slide' && A.key) {
          const want = clamp(f.bar0 + along, OPEN, SHUT);
          const up = pinsUp(); const all = up.every((u) => u >= 0.85);
          if (want < A.bar - 0.02 && !all) {
            A.stuck = up.findIndex((u) => u < 0.85);
            f.force = (f.force || 0) + dt; if (f.force > 0.9) { shear(); f.what = null; return; }
            cutDraw(A.key.k.ok ? 'פין עוד למטה' : 'פין אחד נשאר למטה: מפתח אחר'); if (!A.key.k.ok) A.wrongKey = 1;
            return;
          }
          f.force = 0; A.stuck = -1; A.bar = want; A.barT = want; poseBar(); cutDraw('');
          if (A.bar <= SHUT - 1.15) opened();
          return;
        }
        if (f.what === 'reach' && A.key) {
          // a long slow drag in: too fast and the arm catches in the wicket (spec 5, level 3: "גרירה ארוכה ואיטית")
          const sp = Math.abs(dx) / dt;
          if (sp > 900) { if (!A.fastSaid) { A.fastSaid = 1; X.word({ x: G.c - 2, y: yBar + 1, z: zBar }, 'לאט! היד נתפסת'); } return; }
          A.reach = clamp(f.r0 + Math.abs(along) / 6, 0, 1); A.key.in = A.reach; cutDraw(A.reach >= 1 ? 'עד הכתף' : 'היד נכנסת');
          if (A.reach >= 1) { A.step = 'lifted'; X.play('thud'); X.line(MOUSE ? 'הקישו להרים, וגררו את הבריח' : 'הרימו וגררו את הבריח הגדול'); f.what = null; }
          return;
        }
        if (f.what === 'pbar') { A.pishBar = clamp(f.p0 + Math.abs(along) / 1.6, 0, 1); A.lab.set(`בריח הפשפש ${Math.round(A.pishBar * 100)}%`, A.lab.at, A.pishBar >= 1); if (A.pishBar >= 1) { f.what = null; pishLocked(); } }
      },
      up(f) {
        if (A.busy) return;
        if (f.what === 'bar') { A.pushing = 0; if (A.step === 'relock' && A.barT >= SHUT - 0.05) relocked(); return; }
        if (f.what === 'nudge') { A.ringOK = 1; A.blockSaid = 0; X.play('thud'); X.word({ x: blockAt, y: yBar + 0.8, z: zBar }, 'הטבעות בקו'); A.push++; return; }
        if (f.what === 'chain' && f.moved < 14) { keyFetch(); return; }
        if (f.what === 'lift' && A.key) { if (A.key.lift < 0.85 && A.bar < SHUT - 0.05) { A.pins = A.pins.map(() => 0); X.play('thud'); X.word({ x: BOX, y: yBar + 0.8, z: zBar }, 'ההרמה נשמטה · הבריח נעצר'); } A.key.lift = 0; A.pins = pinsUp(); cutDraw(''); return; }
        if (f.what === 'mtap' && A.key && f.moved < 14) { A.mLift = 1; A.key.lift = 1; A.pins = pinsUp(); cutDraw('הפינים למעלה'); return; }
        if (f.what === 'shim' && A.shims && f.moved < 14) { let best = null, bd = 80; for (const s of A.shims) { const q = X.scr(s.g.position.x, s.g.position.y + 0.1, s.g.position.z), d = Math.hypot(q.x - f.x, q.y - f.y); if (d < bd) { bd = d; best = s; } } if (best) shimPick(best); return; }
        if (f.what === 'leaf') return;
      },
    });
    async function shear() {
      A.busy = true; A.shears++; A.pts = Math.min(A.pts, 20);
      X.loss(20, { x: BOX, y: yBar + 1, z: zBar }, 'בריח בכוח: פין עץ נגזר', 0); X.play('crack');
      const i = Math.max(0, A.stuck); A.pins[i] = -0.6; cutDraw('הפין השבור נופל'); await X.wait(0.6);
      const w = crewAt(BOX + 0.9, Fr.in(1.6), BOX, Fr.zp, { role: 'hammer', item: 'chisel', crew: 1 });
      X.line('הנגר מחליף את הפין'); await X.wait(2.4); SH4.crew.remove(w);
      A.pins = pinsUp(); A.stuck = -1; cutDraw(''); A.busy = false;
    }
    async function relocked() {
      A.busy = true; A.bar = SHUT; poseBar();
      for (let i = 0; i <= 8; i++) { A.pins = A.pins.map(() => 1 - i / 8); cutDraw('הפינים נופלים'); await X.wait(0.04); }
      A.pins = A.pins.map(() => 0); cutDraw('נעול');
      X.play('tap'); X.hit({ x: BOX, y: yBar + 1.2, z: zBar }, 'gold', { text: m.lv === 3 ? 'השער נעול ללילה' : 'נעול שוב', craft: 'לויים' });
      if (A.wrongKey) A.pts = Math.min(A.pts, 20);
      await X.wait(1.0); finish();
    }
    return {
      close: true,
      begin() {
        keep(X, [gateKeep(G, 6)]); Fg.attach();
        poseLeaves(); poseBar();
        heroAt(X, G.c - 7.4, Fr.in(3.4), G.c - 3, Fr.zp);   // (beside the left jamb: the leaves, the bar's way and the box clear)
        // a Levite stands by (the gates' keepers were Levites, Middot 1:1)
        A.levite = crewAt(G.c - 4.2, Fr.in(4.6), G.c, Fr.zp, { role: 'hold', item: 'staff', crew: 3, tunic: '#E8E0CC' });
        shot('close');
        X.line(m.lv === 3 ? 'ערב בבית המוקד: סגרו את הכנפיים' : 'גררו כל כנף אל האמצע');
        X.hand({ x: G.c - 3.4, y: Fr.sill + 6, z: Fr.in(3.6) }, 60, 0);
      },
      update(dt) {
        A.t += dt;
        if (A.step === 'close') closeStep(dt);
        if (A.step === 'bar' || A.step === 'relock' || A.step === 'locked') barStep(dt);
        if (A.step === 'lifted' && A.key) { A.key.g.position.y = yBar - 0.35 + A.key.lift * 0.12; }
        if (C.el.style.display !== 'none' && (A.t * 10 | 0) % 3 === 0) cutDraw(C.lastText || '');
      },
      down(p) { Fg.down(p); }, move(p) { Fg.move(p); }, up(p) { Fg.up(p); },
      end() {
        Fg.detach(); for (const w of A.crew) SH4.crew.remove(w);
        for (const g of legs) PR.remove(g); PR.remove(barG); PR.remove(lockB); PR.remove(chain); for (const k of keys) PR.remove(k.g);
        if (A.shims) for (const s of A.shims) { PR.remove(s.g); s.lab.remove(); }
        A.lab.remove(); C.remove(); keep(X, []); SH4.busy = 0; gateBuild(X, m.lv);
      },
      at() { return { x: G.c, y: Fr.sill + 8, z: Fr.zp }; },
      dbg() {
        const a = X.scr(G.c - 2, yBar, zBar), b = X.scr(G.c + 2, yBar, zBar);
        return { lv, step: A.step, busy: A.busy, phi: A.phi.map((v) => +v.toFixed(2)), closed: A.closed, gap: A.gap, bar: +A.bar.toFixed(2), OPEN, SHUT, blockAt, ringOK: A.ringOK, locked: A.locked, pins: A.pins.map((v) => +v.toFixed(2)), pts: A.pts,
          key: A.key ? { ok: A.key.k.ok, up: A.key.up, in: +A.key.in.toFixed(2), lift: +A.key.lift.toFixed(2), at: sc(X, A.key.g.position) } : null, keys: LK.keys.length, ki: A.ki, reach: A.reach, pishBar: A.pishBar, stuck: A.stuck,
          leafL: sc(X, { x: pivotX(G, -1) + Math.cos(A.phi[0]) * 2.5, y: Fr.sill + 6, z: Fr.zp + Fr.s * Math.sin(A.phi[0]) * 2.5 }), leafR: sc(X, { x: pivotX(G, 1) - Math.cos(A.phi[1]) * 2.5, y: Fr.sill + 6, z: Fr.zp + Fr.s * Math.sin(A.phi[1]) * 2.5 }),
          barAt: sc(X, { x: A.bar - 1, y: yBar, z: zBar }), barU: [b.x - a.x, b.y - a.y], chain: sc(X, chainAt), nudge: blockAt != null ? sc(X, { x: blockAt + 0.4, y: yBar - 1.6, z: Fr.zp }) : null,
          shims: A.shims ? A.shims.map((s) => ({ n: s.n, at: sc(X, s.g.position) })) : null, slams: A.slams, tears: A.tears, shears: A.shears };
      },
    };
  },
};
void box; void PISH; void makeDerrick;
