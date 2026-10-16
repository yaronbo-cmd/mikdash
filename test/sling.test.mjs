// test/sling.test.mjs — (FUN12, wave 12) "הקלע של דוד" without a browser: every level stands at rest (nothing falls unhit), the
// dotted arc is the stone's real flight, and every level can be won within its five stones by the game's own solver (a greedy
// player: each shot is the best of the solver's aims at the standing targets, tried on a snapshot of the world).
//   node test/sling.test.mjs
import * as SL from '../src/games/sling.js';
import Matter from '../src/games/vendor/matter.min.js';

const { Body, Composite, Sleeping } = Matter;
let fails = 0;
const check = (name, ok, info = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${info ? ' — ' + info : ''}`); if (!ok) fails++; };

// 1. rest: five seconds without a stone, nothing falls
for (let lv = 1; lv <= SL.LEVELS.length; lv++) {
  const W = SL.makeWorld(lv);
  for (let i = 0; i < 300; i++) SL.stepWorld(W);
  const moved = W.items.filter((b) => Math.hypot(b.position.x - b.x0, b.position.y - b.y0) > 2 || Math.abs(b.angle - b.a0) > 0.05).length;
  check(`level ${lv} (${SL.LEVELS[lv - 1].n}) stands at rest`, W.down === 0 && moved === 0, `down ${W.down}, moved ${moved}/${W.items.length}`);
}

// 2. the dots are the stone's flight (an open sky: level 1, a shot over everything)
{
  const W = SL.makeWorld(1), v = SL.velOf({ x: 60, y: 40 }), pts = SL.arc(v, 60);
  const b = SL.launch(W, v); let err = 0;
  for (let i = 0; i < 40; i++) { SL.stepWorld(W); err = Math.max(err, Math.hypot(b.position.x - pts[i].x, b.position.y - pts[i].y)); }
  check('the dotted arc follows the stone (40 steps)', err < 1.5, `max error ${err.toFixed(2)} units`);
}

// 3. every level can be won in five stones
const snap = (W) => ({ items: W.items.map((b) => ({ b, x: b.position.x, y: b.position.y, a: b.angle, vx: b.velocity.x, vy: b.velocity.y, w: b.angularVelocity, s: b.isSleeping, down: !!b.down, k: b.kickT })), down: W.down, t: W.t, used: W.used,
  g: W.goliath ? { ...W.goliath, parts: W.goliath.parts.slice() } : null, tdown: W.targets.map((t) => !!t.down) });
function restore(W, S) {
  for (const it of S.items) { Body.setPosition(it.b, { x: it.x, y: it.y }); Body.setAngle(it.b, it.a); Body.setVelocity(it.b, { x: it.vx, y: it.vy }); Body.setAngularVelocity(it.b, it.w); Sleeping.set(it.b, it.s); it.b.down = it.down; it.b.kickT = it.k; }
  for (const s of W.shots) if (!s.gone) { s.gone = true; Composite.remove(W.engine.world, s.b); }
  W.down = S.down; W.t = S.t; W.used = S.used; W.targets.forEach((t, i) => { t.down = S.tdown[i]; });
  if (S.g) { const g = W.goliath; if (g.fall >= 0 && S.g.fall < 0) { for (const b of [...S.g.parts, S.g.brow]) Composite.add(W.engine.world, b); } Object.assign(g, S.g); }
}
function fire(W, pull, steps = 330) { SL.launch(W, SL.velOf(pull)); for (let i = 0; i < steps; i++) SL.stepWorld(W); }
for (let lv = 1; lv <= SL.LEVELS.length; lv++) {
  const W = SL.makeWorld(lv), log = [];
  for (let shot = 0; shot < SL.STONES && !SL.allDown(W); shot++) {
    const S0 = snap(W), cands = [];
    W.targets.forEach((t, i) => { if (t.down) return; const p = SL.aimPoint(W, i); if (!p) return; for (const lob of [false, true]) { for (const dy of [0, -8, 8]) { const q = SL.solve({ x: p.x, y: p.y + dy }, lob); if (q) cands.push({ i, lob, dy, q }); } } });
    let best = null;
    for (const c of cands) {
      restore(W, S0); fire(W, c.q);
      const sc = W.down * 10 + (W.goliath && W.goliath.fall >= 0 ? 50 : 0);
      if (!best || sc > best.sc) best = { ...c, sc };
    }
    restore(W, S0);
    if (!best) { log.push('no aim'); break; }
    fire(W, best.q);
    log.push(`t${best.i}${best.lob ? 'L' : ''}→${W.down}`);
  }
  for (let i = 0; i < 90 && !SL.allDown(W); i++) SL.stepWorld(W);
  check(`level ${lv} (${SL.LEVELS[lv - 1].n}) can be won in ${SL.STONES} stones`, SL.allDown(W), `${W.used} stones: ${log.join(' ')}`);
}
console.log(fails ? `${fails} FAILED` : 'all ok');
process.exit(fails ? 1 : 0);
