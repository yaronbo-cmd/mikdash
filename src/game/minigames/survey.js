// ── crafta19 ── המדידה (the survey) IN THE WORLD under two thumbs (FUN19 §2–§3, binding; the owner's note 7: "המדידה בהתחלה לפני המכות על
// הסלע לא ברורה"). He kneels at the first stake with the reel; the player HOLDS the work button and DRAGS: the measuring cord pays out
// with the thumb toward the far stake and a counter climbs in amot to the Mishnah's number; the RELEASE at the far stake is the act
// (its impact): within ±5 % of the mark gold at L1 (±4 % L2, ±3 % L3), ±10 % good, else ok (the crew corrects it); the counter slows within ±8 % of the mark and ticks every 50 amot. L1: two sides (the crew does the rest), L2+:
// four. A tap: the cord runs out by itself to good. The number: "הר הבית חמש מאות אמה על חמש מאות אמה" (מדות ב, א) — טיוטה.
import { act, bonus, actsQ } from './acts.js';
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const SURVEY_AT = { har: { amot: 500, he: '500 אמה', ref: 'מדות ב, א', q: 'הר הבית חמש מאות אמה על חמש מאות אמה' } };
const SV_GOLD = [0.05, 0.04, 0.03];
const PX = 200;   // the thumb's pull for the whole side (px): 500 amot (±3 % = ±6 px)

function model({ level = 0, setup = {} } = {}) {
  const L = clamp(level | 0, 0, 2), sides = L ? 4 : 2, S = SURVEY_AT[setup.site] || SURVEY_AT.har;
  const M = {
    kind: 'survey', juice: true, twinOnly: true, level: L, sides, side: 0, phase: 'ready', t: 0, pt: 0, u: 0, x0: 0, y0: 0, autoT: 0, grip: 0,
    amot: 0, mark0: S.amot, ref: S.ref, label: S.he, fx: [], acts: [], pts: 0, done: false, progress: 0, h: 0, tol: 0.03,
    coach: 'החזיקו את הכפתור וגררו: החבל נפרש מן היתד — שחררו כשהמונה מגיע ל־500 אמה',
    mark() { return 1; },
    step(dt) {
      if (this.done) return;
      const rd = this.rdt > 0 ? Math.min(0.25, this.rdt) : dt; this.t += dt; this.pt += rd;   // (the stamp's pause on the real clock)
      if (this.phase === 'auto') { this.autoT += dt; this.u = Math.min(0.95, this.autoT / 0.9 * 0.95); if (this.autoT >= 0.95) this.release(true); }
      if (this.phase === 'stamp' && this.pt > 1.3) { this.side++; this.u = 0; if (this.side >= sides) { this.done = true; this.phase = 'done'; } else { this.phase = 'ready'; this.pt = 0; if (this.qTap) { this.qTap = 0; this.twinTap(); } } }
      this.amot = Math.round(this.u * S.amot); this.h = this.phase === 'stamp' ? 1 : this.u;
    },
    release(tap) {
      if (this.phase !== 'pay' && this.phase !== 'auto') return;
      const e = Math.abs(this.u - 1), q = e <= SV_GOLD[L] ? 2 : e <= 0.1 ? 1 : 0;   // (gold ±5 % L1 · ±4 % L2 · ±3 % L3: RESEARCH19, approved)
      act(this, q, { tap: !!tap, power: this.u, x: 0.5, y: 0.3, say: q < 2 && !tap ? 'הצוות מתקן' : '' });
      this.u = 1; this.amot = S.amot; this.progress++; this.phase = 'stamp'; this.pt = 0;
      this.fx.push({ sfx: q === 2 ? 'chime' : 'thud', haptic: q === 2 ? [12, 30, 12] : 12 });
      if (this.side + 1 >= sides) bonus(this, 100, 'נמדד!');
    },
    drag(x, y, ph) {
      if (this.done) return;
      if (ph === 'down') { if (this.phase !== 'ready') return; this.phase = 'pay'; this.x0 = x; this.y0 = y; this.u = 0.06; this.tick = 0; return; }
      if (this.phase !== 'pay') return;
      if (ph === 'move') {
        // the counter slows within ±8 % of the mark (that stretch takes twice the thumb's travel): the release there is easy to time
        const raw = 0.06 + Math.hypot(x - this.x0, y - this.y0) * 160 / PX, u = raw < 0.92 ? raw : raw < 1.24 ? 0.92 + (raw - 0.92) / 2 : 1.08 + (raw - 1.24);
        this.u = clamp(u, 0, 1.2);
        const tick = Math.floor(this.u * S.amot / 50); if (tick > (this.tick | 0)) { this.tick = tick; this.fx.push({ haptic: 5, sfx: 'ui' }); }   // (a tick every 50 amot)
        return;
      }
      if (ph === 'up') this.release(false);
      else if (ph === 'cancel') { this.phase = 'ready'; this.u = 0; }
    },
    touch(down) { this.grip = down && this.phase === 'ready' ? 1 : 0; },
    twinTap() { if (this.phase === 'ready') { this.phase = 'auto'; this.autoT = 0; } else if (this.phase === 'stamp') this.qTap = 1; },   // (a tap while the last side is stamped: kept for the next)
    tap() { this.twinTap(); },
    cue() { return null; },
    auto() { return null; },
    result() { const q = actsQ(this, 0.8); return { quality: q, perfect: q >= 0.97 && this.acts.length === sides, score: this.pts | 0, sides: this.side }; },
  };
  return M;
}
export const survey = {
  kind: 'survey', topic: 'survey', n: 'המדידה', kicker: 'מודדים את ההר', step: 'survey', secs: [6, 14],
  hint: 'החזיקו וגררו — שחררו ב־500 אמה', howto: 'החבל נפרש עם האגודל; שחררו כשהמונה מגיע למידה',
  fact: { he: '"הר הבית חמש מאות אמה על חמש מאות אמה". חבל המידה והיתדות: המחשה.', ref: 'מדות ב, א', status: 'draft', illus: true },
  model, twinOnly: true,
  // (no sheet of its own: under two thumbs only — the portrait keeps the old measuring strokes)
  draw() {},
};
survey.world = survey;
// ── /crafta19 ──
