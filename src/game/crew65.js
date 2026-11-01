/* ── build 65 ── crew65.js — the real crews back on the Mount (the owner, 1.11: "הדמויות ברקע… אין תחושת בנייה"; "אפשר למלא את העולם בעוד צוותים
 * אמיתיים, שייראה יותר פעיל"; and, for the players to come, every figure in the world an actor driven by state, not by the stage's director).
 * The Mount's crews are crews.js's own people (actors.js figures: head cloth, belt, pick, basket) — the stage tells crews.js WHERE the work
 * is (a front: the stands round the sectors being brought down and his rocks still standing, the rubble's drop and pile, the foreman, the way
 * in) and HOW MANY crews (four), and crews.js does the rest. The hammer act's hewers are those same diggers: the act sets their beat
 * (crews.beat), so they strike with it and he with them. Pure. Never a Divine Name. ── /build 65 ── */

export const CREW65 = Object.freeze({ crews: 4, wall: 3, rockR: 4.6, secR: 6.5, pileE: 26, pileS: 10, bossE: 9, bossS: 8, enterE: 30, enterS: -12, maxSec: 4 });

/** the sectors at work now, for the share p: his rocks still standing (sector i, rock n) first, then the crews' sectors between their start
 *  and their end (crewSec: (i, p) → { lv }) — at most c.maxSec; none at all: his first rock's sector (the crews wait by it) */
export function active65(sect, p, done, crewSec, c = CREW65) {
  const out = [];
  for (let i = 0; i < sect.length; i++) { const s = sect[i]; if (Number.isFinite(s.his) && !done(`hammer${s.his}`)) out.push({ i, rock: s.his }); }
  for (let i = 0; i < sect.length; i++) { const s = sect[i]; if (Number.isFinite(s.his)) continue; const { lv } = crewSec(i, p); if (lv > 0 && lv < 1) out.push({ i, rock: -1 }); }
  if (!out.length) { const i = sect.findIndex((s) => s.his === 0); out.push({ i: i < 0 ? 0 : i, rock: -1, idle: true }); }
  return out.slice(0, c.maxSec);
}

/** the front for crews.js: { stand: [[x, z, fx, fz]…], drop, pile, boss, enter, key } — two stands at each active place (a rock: its flanks, a
 *  sector: its downhill side), facing it; the rubble carried from the first place east (downhill: the crest's east flank) to the pile */
export function front65(sect, rocks, p, done, crewSec, c = CREW65) {
  const act = active65(sect, p, done, crewSec, c), stand = [];
  for (const a of act) {
    const s = sect[a.i], r = a.rock >= 0 && rocks[a.rock] ? rocks[a.rock] : null, cx = r ? r.x : s.x, cz = r ? r.z : s.z, R = r ? c.rockR : c.secR;
    const a0 = r ? 0.55 : 1.57;   // (a rock: from the south-east, where his camera looks from; a sector: from the south)
    for (const sg of [-1, 1]) { const ang = a0 + sg * 0.8, x = cx + Math.cos(ang) * R, z = cz + Math.sin(ang) * R; stand.push([r2(x), r2(z), r2(cx), r2(cz)]); }
  }
  const f = act[0], s0 = sect[f.i], r0 = f.rock >= 0 && rocks[f.rock] ? rocks[f.rock] : null, dx = r0 ? r0.x : s0.x, dz = r0 ? r0.z : s0.z;
  return {
    stand, drop: [r2(dx + 3), r2(dz + 3)], pile: [r2(dx + c.pileE), r2(dz + c.pileS)], boss: [r2(dx + c.bossE), r2(dz + c.bossS)], enter: [r2(dx + c.enterE), r2(dz + c.enterS)],
    key: act.map((a) => `${a.i}${a.idle ? 'w' : ''}`).join(','),
  };
}
const r2 = (v) => Math.round(v * 10) / 10;

/** the crews' stroke phase (0…1, the blow at `hit`) that lands their blow on the act's beat (its phase 0): the act's phase ph → u */
export function beatU65(ph, hit = 0.66) { const u = (ph + hit) % 1; return u < 0 ? u + 1 : u; }
