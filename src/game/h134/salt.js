/* ── build 134 ── h134/salt.js — the salt lump (spec docs/specs/shlav-11-he.md, "בול המלח"): an EVENT inside the act right after a flaw,
 * not a work. Sukkah 48b: "נפגמה קרן המזבח, והביאו בול של מלח וסתמוהו. לא מפני שהוכשר לעבודה, אלא מפני שלא יראה מזבח פגום".
 * A worker comes with a lump of salt: the work hand holds the lump, the helping hand turns it (a drag round it, the mouse's wheel, R)
 * until its outline sits on the notch's; then the work hand pushes it in (a short drag toward the notch, or letting go on it). The flaw is
 * hidden for looks only: the horn STAYS flawed, the lump gives no points back, its patch stays white. Its shape and gesture: המחשה.
 *   createSalt(X, { at, corner, onDone }) → { on, update(dt), down(f), move(f), up(f), helperDown(f), helperMove(f), wheel(n), grip(f), dbg() }
 */
import { mats11 } from './look.js';

const TURN0 = { SE: -45, NE: -30, NW: -30, SW: -45 };   // (the lump comes turned this far from the notch: fixed, rule 56; build 134, the review: shorter — two or three taps of +15°, never twenty)
export const SALT = Object.freeze({ OK: 12, PUSH: 26, STEP: 15, R: 0.16 });
export function createSalt(X, o) {
  const T = X.THREE, Mt = mats11(X), root = new T.Group(); root.name = 'h134-salt'; X.props.root.add(root);
  const at = new T.Vector3(...o.at), cam = X.camera;
  const shape = new T.Shape(); const R = SALT.R; shape.moveTo(-R, -R * 0.6); shape.lineTo(R * 0.9, -R * 0.75); shape.lineTo(R * 0.55, R * 0.8); shape.lineTo(-R * 0.35, R * 0.55); shape.closePath();
  const notch = new T.Mesh(new T.ShapeGeometry(shape), Mt.y11hollow); root.add(notch);
  const lump = new T.Mesh(new T.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false }), Mt.y11salt); lump.castShadow = true; root.add(lump);
  const S = { on: true, a: TURN0[o.corner] || 60, f: null, h: null, pushed: false, t: 0, push: 0, ok: false };
  const face = () => { const q = cam.quaternion.clone(); return q; };
  const toward = () => cam.position.clone().sub(at).normalize();
  function place() {
    const q = face(), n = toward();
    notch.position.copy(at).addScaledVector(n, 0.02); notch.quaternion.copy(q);
    const k = S.pushed ? Math.max(0, 1 - S.push) : 1;
    lump.position.copy(at).addScaledVector(n, 0.03 + 0.22 * k).add(new T.Vector3(0, 0.05 * k, 0));
    lump.quaternion.copy(q).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 0, 1), (S.a * Math.PI) / 180));
  }
  const scr = () => { const r = X.scr(lump.position.x, lump.position.y, lump.position.z); return { x: r.x, y: r.y }; };
  const nscr = () => { const r = X.scr(at.x, at.y, at.z); return { x: r.x, y: r.y }; };
  const aligned = () => Math.abs((((S.a % 360) + 540) % 360) - 180) <= SALT.OK;
  try { X.line('הקרן נסדקה! אחזו בגוש המלח, סובבו אותו ביד השנייה עד שהוא מאיר, ודחפו לתוך השבר', 4200); } catch (e) { /* */ }
  function finish() { S.pushed = true; S.push = 0; try { X.dust(at.x, at.y, at.z, 8, 0.1); X.play && X.play('stone'); } catch (e) { /* */ } }
  const A = {
    get on() { return S.on; },
    grip(f) { const p = scr(); return Math.hypot(f.x - p.x, f.y - p.y) < Math.max(48, 60 * (innerHeight / 360) * 0.5); },
    down(f) { if (S.pushed) return false; if (!S.f) { S.f = { id: f.id, x0: f.x, y0: f.y }; return true; } return false; },
    move(f) {
      if (S.h && f.id === S.h.id) { const p = scr(), a0 = Math.atan2(S.h.y - p.y, S.h.x - p.x), a1 = Math.atan2(f.y - p.y, f.x - p.x); let d = ((a1 - a0) * 180) / Math.PI; if (d > 180) d -= 360; if (d < -180) d += 360; S.a += d; S.h.x = f.x; S.h.y = f.y; return; }
      if (S.f && f.id === S.f.id && aligned()) { const n = nscr(), p = scr(), v0 = [n.x - p.x, n.y - p.y], L = Math.hypot(...v0) || 1, d = ((f.x - S.f.x0) * v0[0] + (f.y - S.f.y0) * v0[1]) / L; if (d > SALT.PUSH) finish(); }
    },
    up(f) {
      if (S.h && f.id === S.h.id) { if (Math.hypot(f.x - S.h.x0, f.y - S.h.y0) < 12) S.a += SALT.STEP; S.h = null; return; }
      if (S.f && f.id === S.f.id) { S.f = null; if (aligned() && !S.pushed) finish(); }
    },
    helperDown(f) { if (!S.f || S.h) return false; S.h = { id: f.id, x: f.x, y: f.y, x0: f.x, y0: f.y }; return true; },
    wheel(n) { S.a += Math.sign(n) * SALT.STEP; },
    update(dt) {
      S.t += dt; place();
      const ok = aligned(); if (ok !== S.ok) { S.ok = ok; lump.material = ok ? Mt.y11glow : Mt.y11salt; }
      if (S.pushed) { S.push = Math.min(1, S.push + dt / 0.35); if (S.push >= 1 && S.on) { S.on = false; try { X.props.remove(root); } catch (e) { /* */ } if (o.onDone) o.onDone(); } }
      // (nobody's turn takes long: after 40 s the worker leaves it for the next visit; the horn stays flawed and the block waits)
      if (S.t > 40 && !S.pushed && S.on && !S.f) { S.on = false; try { X.props.remove(root); } catch (e) { /* */ } if (o.onLater) o.onLater(); }
    },
    end() { if (S.on) { S.on = false; try { X.props.remove(root); } catch (e) { /* */ } } },
    dbg() { const p = scr(), n = nscr(); return { a: Math.round(S.a), ok: aligned(), pushed: S.pushed, lump: [Math.round(p.x), Math.round(p.y)], notch: [Math.round(n.x), Math.round(n.y)], held: !!S.f }; },
  };
  place();
  return A;
}
