/* ── build 129 ── h129/night.js — the stage's tenth work, "הלילה בבית המוקד" (brief §7; Middot 1:8–9): night falls on the finished
 * Beit HaMoked. The fire is lit (the torch dragged to the wood); the elders of the father's house sleep on the stone ledges, the young
 * kohanim on the floor each with his cloak. The time of locking: the marble slab, an amah square, lifted by its ring (both thumbs; a
 * mouse alone), slowly — let go before it stands on its prop and it falls back with a bang (an elder lifts his head); the keys taken
 * from the chain; the gates of the Azarah locked one after another (the camera flies to each, each bolt shot home); the keys back and
 * the slab lowered to its place, touching down gently (faster than SOFT a corner cracks: night.slab); his cloak spread on it.
 * The night's look (nightRig: the world's dark and the fire's light) serves the pack's finale too.
 * The model: model.js (slabFresh, slabStep, nightPts, SLAB). Places: BOOK.s07.night and stage 04's gate entries.
 */
import { SLAB, QUICK, LOSS, LINES, slabFresh, slabStep, nightPts, qOf, starsOf } from './model.js';
import { SH7, mats7, box, own, setBusy, vaultWhole } from './world.js';
import { createVoices } from './sound129.js';
import { card, cite, holdLens } from './ui7.js';
import { fingers, MOUSE, onY } from '../h113/acts.js';
import { gripR } from '../h109/grips.js';
import { BOOK } from '../world/grid.js';

const S7 = BOOK.s07, N7 = S7.night, CAM = S7.cam, F16 = S7.floors.azara, HS = N7.slabSize;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const FIRE_I = 40;    // (the fire's light: the hall warm, the slab five amot off it readable, nothing burnt white)
const GATES = () => N7.gates.map((id) => BOOK.s04.entries.find((e) => e.id === id)).filter(Boolean);

/** the night's look: the world's clock at the dark night, the fire on the hearth (its logs, its flames, its light); apply(k) on, off() */
export function nightRig(X) {
  const T = X.THREE, M = mats7(X), g = new T.Group(); g.name = 'h129-night'; let on = false, t = 0;
  const h = N7.hearth;
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI, l = new T.Mesh(new T.CylinderGeometry(0.12, 0.14, 1.6, 6), M.h7timberD); l.rotation.z = Math.PI / 2; l.rotation.y = a; l.position.set(h[0], F16 + 0.15 + (i % 2) * 0.12, h[1]); g.add(l); }
  const ring = new T.Mesh(new T.TorusGeometry(1, 0.18, 6, 16), M.h7holy); ring.rotation.x = Math.PI / 2; ring.position.set(h[0], F16 + 0.1, h[1]); g.add(ring);
  const flameM = new T.MeshBasicMaterial({ color: 0xFFB04A, transparent: true, opacity: 0.85, depthWrite: false, blending: T.AdditiveBlending });
  const flames = []; for (let i = 0; i < 4; i++) { const f = new T.Mesh(new T.ConeGeometry(0.35 - i * 0.05, 1.3 - i * 0.15, 8), flameM); f.position.set(h[0] + Math.cos(i * 1.7) * 0.25, F16 + 0.9, h[1] + Math.sin(i * 1.7) * 0.25); g.add(f); flames.push(f); }
  const light = new T.PointLight(0xFF9A4A, 0, N7.ledges.length * 8, 1.6); light.position.set(h[0], F16 + 2.2, h[1]); g.add(light);
  let fire = 0;
  const R = {
    lit: (v) => { fire = v ? 1 : 0; light.intensity = v ? FIRE_I : 0; for (const f of flames) f.visible = !!v; },
    apply(k = 1) {
      if (!on) { on = true; X.props.root.add(g); try { const E = X.pack && X.pack.time; if (E && E.setTime) E.setTime('night'); } catch (e) { /* */ } }
      if (k && fire === 0 && R.autoLit !== false) R.lit(1);
    },
    frame(dt) { t += dt; const k = fire ? 1 : 0; light.intensity = k * FIRE_I * (1 + Math.sin(t * 11) * 0.08 + Math.sin(t * 23) * 0.05); flames.forEach((f, i) => { f.scale.y = 1 + 0.25 * Math.sin(t * (9 + i * 3) + i); f.rotation.y = t * (1 + i * 0.3); }); },
    off() { if (!on) return; on = false; X.props.remove(g); try { const E = X.pack && X.pack.time; if (E && E.restoreTime) E.restoreTime(); } catch (e) { /* */ } },
  };
  R.lit(0);
  return R;
}

/** a sleeper: a body under a cloak and a head, lying along (dx, dz) — no figure of the crews lies down */
function sleeper(X, x, y, z, a, col, parent) {
  const T = X.THREE, M = mats7(X), g = new T.Group();
  const body = new T.Mesh(X.props.geo.box, new T.MeshStandardMaterial({ color: col, roughness: 1, flatShading: true })); body.scale.set(1.8, 0.42, 0.62); body.position.set(-0.15, 0.21, 0); g.add(body);
  const head = new T.Mesh(new T.SphereGeometry(0.2, 10, 8), new T.MeshStandardMaterial({ color: '#B98E6A', roughness: 0.9 })); head.position.set(0.95, 0.24, 0); g.add(head);
  const cap = new T.Mesh(new T.SphereGeometry(0.21, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M.h7cloak); cap.position.copy(head.position); g.add(cap);
  g.position.set(x, y, z); g.rotation.y = -a; parent.add(g); g.userData.head = [head, cap];
  return g;
}

export const NIGHT = {
  icon: '🔑', title: 'הלילה בבית המוקד',
  walkLine: () => 'בית המוקד: זמן הנעילה',
  stand() { const s = N7.hearth; return { x: s[0] + 3, z: s[1] + 2, face: [N7.slab[0], N7.slab[1]] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, Mo = X.M, st = Mo.st, V = createVoices(X.sfx), MT = mats7(X);
    const A = { phase: 'intro', t: 0, ev: [], fing: new Map(), base: 0, lockI: -1 };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    own('slab', 1); setBusy(X, 1); X.kohen(false); vaultWhole(X);
    const cam0 = X.camera, fov0 = cam0.fov, lens = (f) => { try { cam0.fov = f; cam0.updateProjectionMatrix(); } catch (e) { /* */ } };
    const rig = SH7.rig || nightRig(X); SH7.rig = rig; rig.autoLit = false; rig.apply(1); rig.lit(0);
    const root = new T.Group(); root.name = 'h129-night-act'; X.props.root.add(root);
    // ── the sleepers: the elders on the ledges, the young kohanim on the floor round the fire (none on the slab's side)
    const elders = N7.ledges.map((b, i) => { const lx = b[2] - b[0], lz = b[3] - b[1], along = lx >= lz ? 0 : Math.PI / 2; return sleeper(X, (b[0] + b[2]) / 2, N7.ledgeY, (b[1] + b[3]) / 2, along + (i % 2 ? Math.PI : 0), ['#5E5A70', '#6A5E4E', '#4E5E6A'][i % 3], root); });
    const young = []; for (let i = 0; i < 6; i++) { const a = Math.PI * (0.15 + (i / 5) * 0.7), r = 5.2; young.push(sleeper(X, N7.hearth[0] + Math.cos(a) * r * 1.3, F16, N7.hearth[1] + Math.sin(a) * r, a + Math.PI / 2, '#E2DAC6', root)); }
    const levi = sleeper(X, N7.levi[0], N7.levi[2], N7.levi[1], 0, '#DCCDAE', root);
    // ── the slab, its ring, the chain with the keys under it; the torch by the hearth
    const sl = N7.slab, slab = new T.Group(); slab.position.set(sl[0], F16, sl[1]); root.add(slab);
    const pit = box(X, MT.h7dark, sl[0] - HS / 2 + 0.06, F16 - 0.5, sl[1] - HS / 2 + 0.06, sl[0] + HS / 2 - 0.06, F16 + 0.01, sl[1] + HS / 2 - 0.06, root);
    const plate = new T.Group(); slab.add(plate);
    const marble = new T.Mesh(X.props.geo.box, new T.MeshStandardMaterial({ color: '#EEE8DE', roughness: 0.35 })); marble.scale.set(HS, 0.12, HS); marble.position.set(0, 0.06, HS / 2); plate.add(marble); plate.position.z = -HS / 2;
    const ringM = new T.Mesh(new T.TorusGeometry(0.16, 0.035, 6, 16), MT.h7bronze); ringM.rotation.x = Math.PI / 2; ringM.position.set(0, 0.14, HS * 0.75); plate.add(ringM);
    const glow = new T.Mesh(new T.RingGeometry(0.2, 0.3, 20), new T.MeshBasicMaterial({ color: 0xFFD86A, transparent: true, opacity: 0.9, depthWrite: false })); glow.rotation.x = -Math.PI / 2; glow.position.set(0, 0.13, HS * 0.75); plate.add(glow);
    const chain = box(X, MT.h7iron, sl[0] - 0.03, F16 - 0.45, sl[1] - 0.03, sl[0] + 0.03, F16 - 0.02, sl[1] + 0.03, root);
    const keys = new T.Group(); for (let i = 0; i < 3; i++) { const kk = new T.Mesh(X.props.geo.box, MT.h7bronze); kk.scale.set(0.05, 0.3, 0.1); kk.position.set(sl[0] - 0.12 + i * 0.12, F16 - 0.3, sl[1]); keys.add(kk); } root.add(keys);
    const torch = new T.Group(); { const s = new T.Mesh(new T.CylinderGeometry(0.05, 0.06, 1.1, 6), MT.h7timberD); s.rotation.z = Math.PI / 2; torch.add(s); const tip = new T.Mesh(new T.SphereGeometry(0.16, 8, 6), new T.MeshBasicMaterial({ color: 0xFFB04A })); tip.position.x = 0.6; torch.add(tip); }
    const th0 = [N7.hearth[0] + 3.2, F16 + 0.6, N7.hearth[1] - 1.6]; torch.position.set(...th0); root.add(torch);
    const lamp = new T.PointLight(0xFFD9A0, 0, 10, 1.6); lamp.position.set(sl[0] + 1.2, F16 + 2.6, sl[1] + 1.6); root.add(lamp);   // (his lamp by the slab: the ring and the keys read at night)
    const gLamp = new T.PointLight(0xFFD9A0, 0, 24, 1.6); root.add(gLamp);   // (the kohen's lamp at each gate he locks)
    const cloak = new T.Mesh(X.props.geo.box, MT.h7cloak); cloak.scale.set(HS * 1.15, 0.05, HS * 1.15); cloak.position.set(sl[0], F16 + 0.15, sl[1]); cloak.visible = false; root.add(cloak);
    // ── the slab's model
    const S = slabFresh();
    const setSlab = () => { plate.rotation.x = -S.h * 1.2; };   // (hinged on its far edge: up to ~70° on its prop)
    const ringAt = () => { const v = new T.Vector3(); ringM.getWorldPosition(v); return v; };
    const scr = (v) => { const r = X.scr(v.x, v.y, v.z); return { x: r.x, y: r.y }; };
    const unit = () => 0.3 * innerHeight;   // (the slab's whole lift: this far up on the screen)
    const lift = (u) => { void u; };   // (as in vault.js: the hall's walls stand behind the camera; no lift of its own)
    const need = () => (MOUSE ? 1 : 2);
    const target = () => { if (A.fing.size < need()) return null; let v = Infinity; for (const f of A.fing.values()) v = Math.min(v, A.base + (f.y0 - f.y) / unit()); return v; };
    const camHome = (d = 1) => X.shot(CAM.night[0], CAM.night[1], d);
    // ── the gauge: the slab's height, the prop's mark, the soft speed
    const gauge = document.createElement('div'); gauge.className = 'h109-ui'; gauge.style.cssText = 'position:fixed;right:5%;top:30%;width:22px;height:40%;border-radius:11px;background:rgba(20,16,30,.6);border:2px solid rgba(255,240,200,.9);z-index:60;pointer-events:none;display:none';
    gauge.innerHTML = '<b style="position:absolute;left:-8px;right:-8px;height:4px;background:#8FE07A"></b><u style="position:absolute;left:2px;right:2px;bottom:2px;background:#FFD86A;border-radius:8px"></u>'; document.body.appendChild(gauge);
    const gaugeSync = () => { gauge.children[0].style.top = (1 - SLAB.OPEN) * 100 + '%'; gauge.children[1].style.height = clamp(S.h, 0, 1) * 96 + '%'; gauge.style.borderColor = S.phase === 'lower' && -S.v > SLAB.SOFT * 0.9 ? '#FF7A5A' : 'rgba(255,240,200,.9)'; };
    // ── the steps
    async function lightFire() { A.phase = 'fire'; X.shot(CAM.nightHall[0], CAM.nightHall[1], 1.4); X.line('הלילה בבית המוקד · הדליקו את המדורה: גררו את הלפיד אל העצים', 6000); X.hand({ x: th0[0], y: th0[1], z: th0[2] }, -gripR() / 2, 0); }
    async function fireLit() {
      A.phase = 'sleep'; rig.lit(1); V.fire(0.6); X.quick({ x: N7.hearth[0], y: F16 + 1.4, z: N7.hearth[1] }, 'דולקת!', null); torch.visible = false; ev('fire');
      X.line('זקני בית אב ישנים על רובדי האבן, ופרחי הכהונה איש כסתו בארץ', 3600);
      await X.wait(3.4);
      A.phase = 'lift'; camHome(1.2); lamp.intensity = 6; lift(0.22); gauge.style.display = '';
      X.line(LINES.night + ' · הגיע זמן הנעילה: הגביהו את טבלת השיש בטבעת' + (MOUSE ? ' (גררו למעלה, לאט)' : ' בשני האגודלים יחד, לאט, עד הפס הירוק'), 6500);
      const r = ringAt(); X.hand({ x: r.x, y: r.y, z: r.z }, 0, -gripR() / 3);
    }
    async function lockGates() {
      A.phase = 'lock'; lift(0); gauge.style.display = 'none'; keys.visible = false; V.lock(0); X.quick(ringAt(), 'המפתחות!', null);
      X.line('נעל הכהן מבפנים, ובן לוי ישן לו מבחוץ', 3000); await X.wait(1.2);
      const G = GATES();
      for (let i = 0; i < G.length; i++) {
        const g = G[i], sg = g.z < -1 ? 1 : g.z > 1 ? -1 : 0, GC = N7.gateCam, D = GC.back, eye = sg ? [g.x - D / 4, F16 + GC.up, g.z + sg * D] : [g.x - D, F16 + GC.up, g.z + D / 4], aim = [g.x, F16 + GC.lamp, g.z];
        gLamp.position.set(sg ? g.x : g.x - GC.lamp, F16 + GC.lamp + 2, sg ? g.z + sg * GC.lamp : g.z); gLamp.intensity = 40;
        A.lockI = i; X.shot(eye, aim, 0.9); X.line('נועל: ' + g.label, 1400); await X.wait(1.0); V.lock(i); X.quick({ x: g.x, y: F16 + 4, z: g.z }, 'ננעל!', null); await X.wait(0.5);
      }
      X.shot(N7.levi.length ? [N7.levi[0] + 6, N7.levi[2] + 6, N7.levi[1] - 6] : CAM.night[0], [N7.levi[0], N7.levi[2], N7.levi[1]], 1.0); X.line('ובן לוי ישן לו מבחוץ', 2200); await X.wait(2.2);
      A.phase = 'lower'; gLamp.intensity = 0; camHome(1.0); keys.visible = true; lift(0.22); gauge.style.display = '';
      X.line('המפתחות חזרו לשלשלת · החזירו את הטבלא למקומה: הורידו אותה לאט, שתגע ברכות', 6000);
      const r = ringAt(); X.hand({ x: r.x, y: r.y, z: r.z }, 0, gripR() / 3);
    }
    async function finish(soft) {
      A.phase = 'done'; lift(0); gauge.style.display = 'none'; X.hand(null);
      cloak.visible = true; V.cloak();
      if (soft) X.quick({ x: sl[0], y: F16 + 0.5, z: sl[1] }, 'במקומה!', cloak);
      st.night = { bangs: S.bangs, dmg: S.dmg }; X.save();
      await X.wait(1.2);
      X.shot(CAM.nightHall[0], CAM.nightHall[1], 1.6); X.line('נתן כסותו עליה, ישן לו', 2600);
      await X.wait(2.4);
      await card(X, `<b style="font:900 20px Heebo,system-ui">טבלת השיש</b>${cite(LINES.middot19)}`, 9000);
      const pts = nightPts(S), q = qOf(pts);
      X.end({ stars: starsOf(q), q, pts, perfect: pts >= 40, flags: { bangs: S.bangs, 'night.slab': S.dmg ? 1 : 0 }, at: { x: sl[0], y: F16 + 0.5, z: sl[1] } });
    }
    let bangT = 0;
    function stepSlab(dt) {
      slabStep(S, target(), dt); setSlab(); gaugeSync();
      for (const e of S.ev) {
        ev(e.e);
        if (e.e === 'bang') { V.thud(); X.shake(0.12, 0.2); bangT = 1.6; X.line('הטבלא נפלה חזרה בקול · זקן הרים את ראשו · הגביהו שוב, והחזיקו עד הפס הירוק', 3600); }
        if (e.e === 'keys') { X.quick(ringAt(), QUICK.holds, plate); V.knock(1.2); A.fing.clear(); lockGates(); }
        if (e.e === 'loss') { const p = Mo.mark('night.slab', m.id, [sl[0], sl[1]]); const c = box(X, MT.h7crack, sl[0] + HS / 2 - 0.4, F16 + 0.125, sl[1] + HS / 2 - 0.3, sl[0] + HS / 2 - 0.02, F16 + 0.14, sl[1] + HS / 2 - 0.27, root); c.rotation.y = 0.6; V.crack(); X.loss(p, { x: sl[0], y: F16 + 0.4, z: sl[1] }, LOSS['night.slab'][0]); }
        if (e.e === 'down') finish(e.soft);
      }
      if (bangT > 0) { bangT -= dt; const hd = elders[0].userData.head; for (const q of hd) q.position.y = 0.24 + (bangT > 0 ? 0.25 : 0); }
      if (S.phase === 'lift' || S.phase === 'lower') V.creak(Math.abs(S.v) * 1.6);
    }
    // ── the fingers
    const nearRing = (p) => { const s = scr(ringAt()); return Math.hypot(p.x - s.x, p.y - s.y) < gripR() * 1.3; };
    const nearTorch = (p) => { const s = scr(torch.position); return Math.hypot(p.x - s.x, p.y - s.y) < gripR(); };
    const FG = fingers(X, {
      down(f) {
        if (A.phase === 'fire' && nearTorch(f)) { f.torch = 1; X.hand(null); return; }
        if ((A.phase === 'lift' || A.phase === 'lower') && A.fing.size < 2 && nearRing(f)) { if (!A.fing.size) A.base = S.h; A.fing.set(f.id, f); X.hand(null); }
      },
      move(f) { if (f.torch) { const q = onY(X, f, F16 + 0.6); if (q) { torch.position.set(q.x, F16 + 0.6, q.z); if (Math.hypot(q.x - N7.hearth[0], q.z - N7.hearth[1]) < 1.3) { f.torch = 0; fireLit(); } } } },
      up(f) { if (f.torch) { f.torch = 0; torch.position.set(...th0); return; } if (A.fing.has(f.id)) { A.fing.delete(f.id); if (A.fing.size) A.base = S.h; } },
    });
    return {
      close: true,
      begin() { FG.attach(); lens(CAM.nightFov); X.shot(CAM.nightHall[0], CAM.nightHall[1], 1.6); setSlab(); setTimeout(lightFire, 1600); },
      update(dt) {
        A.t += dt; holdLens(X, CAM.nightFov);
        try { V.frame(); rig.frame(dt); if (A.phase !== 'intro' && A.phase !== 'fire') V.fire(0.5); if (A.phase === 'lift' || A.phase === 'lower') stepSlab(dt); }
        catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h129] night', e && e.message); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { A.fing.clear(); },
      wants(p) { if (!p) return true; if (A.phase === 'fire') return nearTorch(p); if (A.phase === 'lift' || A.phase === 'lower') return nearRing(p); return false; },
      holds() { return A.fing.size > 0; },
      end() {
        lift(0); FG.detach(); V.stop(); X.hand(null); gauge.remove(); lens(fov0);
        X.props.remove(root); void pit; void chain; void levi; void young;
        own('slab', 0); setBusy(X, 0);
        // (the night stays for the pack's finale, which turns it off)
      },
      at() { return new T.Vector3(sl[0], F16 + 0.5, sl[1]); },
      dbg() {
        const r = scr(ringAt()), tq = scr(torch.position), hq = scr({ x: N7.hearth[0], y: F16 + 0.6, z: N7.hearth[1] });
        return { id: m.id, phase: A.phase, mouse: MOUSE, ev: A.ev.slice(-10), nf: FG.n, n: A.fing.size, need: need(), h: +S.h.toFixed(3), v: +S.v.toFixed(3), sphase: S.phase, bangs: S.bangs, dmg: S.dmg, ring: [Math.round(r.x), Math.round(r.y)], torch: [Math.round(tq.x), Math.round(tq.y)], hearth: [Math.round(hq.x), Math.round(hq.y)], unit: Math.round(unit()), open: SLAB.OPEN, soft: SLAB.SOFT, lockI: A.lockI };
      },
    };
  },
};
