/* ─────────────────────────────────────────────────────────────────────────────
 * net/partner.js — NET10 (wave 10): the other kohen in MY world ("כהנים יחד").
 *
 *   const pk = createPartner({ scene, camera, life, ground, project, ui, W, H })
 *   pk.show(bool)                    he fades in / out
 *   pk.target(x, z, yaw)             where his builder works now: he walks there (far → he appears there), then faces his work
 *   pk.strike(perfect)               one blow of his hammer (a gold ✦ over him on a perfect one)
 *   pk.say(text, gold)               a word over his head (his stone, his cheer)
 *   pk.label(name, sub)              his plate
 *   pk.state → { on, x, y, z, screen: {x, y, on}, visible }   (tests)
 * An actors.js kohen in the four white garments with a mason's hammer, at the builder's size (1.6 × life: the same scale as
 * the player's builder, so the two read as peers on a phone). His own actors instance (2 draw calls while he is in view),
 * advanced inside life.update (so the loop, __T.simulate and __T.render all move him). His plate is the DOM (ui.plate); when
 * he is out of the frame, a chip at the screen's edge points to him (tap: the camera looks at him).
 * 1 unit = 1 amah; +x east, +z south, +y up.
 * ──────────────────────────────────────────────────────────────────────────── */
import { Vector3 } from 'three';
import { createActors, ACTOR_S } from '../actors.js';

const CV = new Vector3();

const SCALE = 1.6 / ACTOR_S;           // the builder's size (stages.js HERO_S 1.6)
const HEAD = 3.5;                      // plate height over his feet, in the rig's units (× his size: 5.6 amot)
const SWING = 0.5;                     // one blow (s): up 0.3, down 0.08, settle

export function createPartner({ scene, camera, life, ground, project, ui, size, mine }) {
  let actors = null, a = null, on = false, want = null, swingT = -1, perfect = false, sayQ = [];
  const scr = { x: 0, y: 0, on: false };
  const S = { name: '', sub: '' };
  const view = () => (typeof size === 'function' ? size() : { w: innerWidth, h: innerHeight });

  function build() {
    if (actors) return true;
    try {
      actors = createActors({ scene, camera, blobs: (life && life.blobs) || null, ground });
      a = actors.add('kohen', 0, 0, { scale: SCALE, hidden: true, young: false, col2: '#3B2718' });
      actors.setItem(a, 'hammer');
      if (life && typeof life.addUpdater === 'function') life.addUpdater(update);
      return true;
    } catch (e) { console.warn('[net] partner', e); actors = null; a = null; return false; }
  }

  function show(v) {
    if (v && !build()) return;
    on = !!v;
    if (a) a.visT = on ? 1 : 0;
    if (!on) { ui.plateOff(); ui.edgeOff(); }
  }
  function target(x, z, yaw) {
    if (!a || !Number.isFinite(x) || !Number.isFinite(z)) return;
    const d = Math.hypot(x - a.x, z - a.z);
    if (want && Math.hypot(x - want[0], z - want[1]) < 1.2 && a.vis > 0) { want[2] = yaw; return; }
    want = [x, z, yaw];
    if (a.vis < 0.05 || d > 140) {                         // first seen, or far away: he is simply there (a fade)
      a.x = x; a.z = z; a.y = ground(x, z); a.path = null; a.yaw = yaw || 0; a.vis = Math.min(a.vis, 0.05);
      return;
    }
    actors.walk(a, [[x, z]], Math.min(16, Math.max(5, d / 1.6)));
  }
  function strike(p) { if (!a || !on) return; swingT = 0; perfect = !!p; }
  /** both arms up for a moment (a shared round number of stones) */
  function celebrate() {
    if (!a || !on || swingT >= 0) return;
    try { actors.pose(a, 'lift'); setTimeout(() => { if (a && swingT < 0) { actors.pose(a, 'stand'); actors.setItem(a, 'hammer'); } }, 1500); } catch (e) { /* */ }
  }
  function say(text, gold) { if (on) sayQ.push([text, !!gold]); }
  function label(name, sub) { S.name = name; S.sub = sub || ''; }

  // the blow: the right arm up over the head, then down on the stone (the crews' swing, crews.js swing(): R_TOP → R_HIT)
  function pose(dt) {
    if (swingT < 0) {
      // at rest: the hammer held low, facing his work
      if (!a.path && want && Number.isFinite(want[2])) { let dy = want[2] - a.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); a.yaw += dy * Math.min(1, dt * 5); }
      return;
    }
    swingT += dt;
    const u = swingT / SWING;
    let r;
    if (u < 0.6) r = 0.45 + (2.55 - 0.45) * Math.sin((u / 0.6) * Math.PI / 2);
    else if (u < 0.76) { const v = (u - 0.6) / 0.16; r = 2.55 + (0.4 - 2.55) * v * v; }
    else r = 0.4 + Math.sin(Math.min(1, (u - 0.76) / 0.24) * Math.PI) * 0.08;
    a.arm[2] = a.armT[2] = r; a.arm[3] = a.armT[3] = -0.1;
    a.arm[0] = a.armT[0] = 0.9; a.arm[1] = a.armT[1] = -0.3;          // the left hand steadies the work
    a.tilt = a.tiltT = -r + 0.2;
    a.bow = a.bowT = u < 0.6 ? 0.04 : 0.3;
    if (u >= 0.76 && swingT - dt < 0.76 * SWING && perfect) say('✦', true);
    if (u >= 1) { swingT = -1; a.armT[0] = 0; a.armT[1] = 0.05; a.armT[2] = 0.62; a.armT[3] = -0.05; a.bowT = 0; a.tiltT = 0; }
  }

  function update(dt) {
    if (!actors) return;
    if (on && a) pose(dt);
    actors.update(dt);
    if (!on || !a || (typeof window !== 'undefined' && window.__HUD_HOLD)) return;   // (tests: the plate stays on the frame being shot)
    const q0 = project(a.x, a.y + HEAD * a.s, a.z), p = { x: q0.x, y: q0.y, on: q0.on };   // (the projection is one shared object: copied)
    const { w, h } = view();
    scr.x = p.x; scr.y = p.y; scr.on = !!p.on && p.x > 6 && p.x < w - 6 && p.y > 56 && p.y < h - 96;
    if (a.vis < 0.3) { ui.plateOff(); ui.edgeOff(); return; }
    if (scr.on) {
      ui.edgeOff();
      ui.plate(p.x, p.y, S.name, S.sub);
      while (sayQ.length) { const [t, g] = sayQ.shift(); ui.float(p.x, p.y - 26, t, g); }
    } else {
      ui.plateOff(); sayQ.length = 0;
      // the edge chip: ahead of the camera, where he projects, held inside the frame (it follows him smoothly); behind it, at
      // the side he is on (the camera's own left/right — the projection mirrors behind the camera), mid-height
      camera.updateMatrixWorld();
      CV.set(a.x, a.y + 2, a.z).applyMatrix4(camera.matrixWorldInverse);
      const ahead = CV.z < 0 && p.on;
      const dir = ahead ? (p.x < w / 2 ? -1 : 1) : CV.x < 0 ? -1 : 1;
      const ex = ahead ? Math.min(w - 64, Math.max(64, p.x)) : dir < 0 ? 64 : w - 64;
      let y = Math.min(h - 150, Math.max(150, ahead ? p.y : h * 0.5));
      // never over my own builder: the chip steps above (or below) him
      const m = typeof mine === 'function' ? mine() : null;
      if (m) { const q = project(m.x, m.y + 2.5, m.z); if (q.on && Math.abs(q.x - ex) < 100 && Math.abs(q.y - y) < 90) y = q.y - 120 >= 150 ? q.y - 120 : Math.min(h - 150, q.y + 110); }
      ui.edge(ex, y, dir, S.name);
    }
  }

  return {
    show, target, strike, celebrate, say, label, update,
    get state() { return { on, x: a ? a.x : null, y: a ? a.y : null, z: a ? a.z : null, vis: a ? a.vis : 0, screen: { ...scr }, visible: on && !!a && a.vis > 0.5 && scr.on, swinging: swingT >= 0 }; },
    get actor() { return a; },
  };
}
