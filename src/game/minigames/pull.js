/* מקימים עמוד (raising a column) — GAMES14, wave 14: her ❤️ (VOTES14), a stone card at har (the Royal Stoa).
 * The marble column lies on its base; a rope runs from its head over the shear-legs' pulley down to her hands. Pull the
 * rope down, hand over hand: the column rises. Too fast and it sways (the rope slips while it sways) — but it never falls.
 * At the top, pull gently and let go when the plumb line hangs true along its edge. Two columns a job.
 * Levels (FUN14's 0–2): L1 4 heights of rope, ±3° · L2 heavier, ±2° · L3 gusts of wind, ±1.2°.
 * q = .4 steady + .4 true + .2 par. The autopilot pulls steadily and slows at the top. Raising by rope: המחשה. */
import { clamp } from './frame.js';

const FACT = { he: 'כל עמוד בסטווים היה אבן אחת של שיש לבן, ובסטיו המלכותי עמדו 162 עמודים — שלושה אנשים בזרועות פרושות הקיפו עמוד אחד. ההרמה בחבל כאן — המחשה.', ref: 'יוסף בן מתתיהו, מלחמת היהודים ה, ה, ב; קדמוניות היהודים טו, יא, ה', status: 'draft', illus: true };
const RX = 0.86;                                         // where the rope comes down (the right side, under her thumb)

function model({ level = 0, rng = Math.random } = {}) {
  const L = clamp(+level || 0, 0, 2), cols = 2;
  const rope = 5.5 + 0.5 * L, gain = 1 / rope, tol = [0.033, 0.022, 0.013][Math.round(L)], vmax = 2.4 - 0.25 * L;
  const parT = cols * (rope / 0.9 + 3.5) + 3;
  const M = {
    kind: 'pull', level: L, cols, col: 0, ang: 0, sway: 0, sph: 0, recent: 0, t: 0, pt: 0, phase: 'pull', quiet: 0, gustT: 3 + rng() * 2,
    jerks: 0, overs: 0, colOvers: 0, hauled: 0, crew: 0, accs: [], ps: {}, done: false, progress: 0, fx: [], _a: null, _w: 0, ease: 0, warned: 0, tol, gain,
    tilt() { return this.ang + this.sway * 0.06 * Math.sin(this.sph); },
    true_() { return Math.abs(1 - this.ang) <= tol; },
    drag(x, y, ph, id) {
      if (this.done || this.phase !== 'pull') return;
      if (ph === 'down') { this.ps[id] = { y, dn: true }; return; }
      const p = this.ps[id]; if (!p) return;
      if (ph !== 'move') { delete this.ps[id]; return; }
      const dy = y - p.y; p.y = y;
      if (dy <= 0 || this.ease) return;                   // only a downward pull hauls the rope
      this.acc = (this.acc || 0) + dy; this.quiet = 0; this.hauled += dy;
      if ((this.ropeT = (this.ropeT || 0) + dy) > 0.22) { this.ropeT = 0; this.fx.push({ sfx: 'rope', haptic: 5 }); }   // the rope's creak under her hands
      const slip = clamp((this.sway - 0.5) / 0.5);
      this.ang += dy * gain * (1 - 0.85 * slip);
      if (slip > 0.3 && this.t - this.warned > 1.5) { this.warned = this.t; this.fx.push({ pop: { t: 'לאט! העמוד מתנדנד', x: 0.4, y: 0.25, kind: 'bad' }, sfx: 'creak', o: { tension: 0.8 } }); }
      if (this.ang > 1 + tol) {                           // past the plumb: the crew eases it back
        this.overs++; this.colOvers++; this.ease = 0.8; this.ps = {};
        this.fx.push({ pop: { t: 'עבר את האנך — עוד פעם, בעדינות', x: 0.45, y: 0.2, kind: 'bad' }, sfx: 'creak', o: { tension: 1 }, haptic: [20, 30, 20] });
      }
      this.progress = this.col * 40 + Math.floor(clamp(this.ang) * 39);
    },
    tap() { if (this.phase === 'pull' && !this.ease) { this.ang = Math.min(1, this.ang + 0.08); this.acc = (this.acc || 0) + 0.05; } },
    step(dt) {
      if (this.done) return;
      this.t += dt; this.pt += dt; this.quiet += dt; this.sph += dt * 5.5;
      const rdt = this.rdt || dt, vNow = (this.acc || 0) / Math.max(rdt, 1 / 60); this.acc = 0;   // the haul's speed (heights a second, in real time): a yank sways it
      this.vs = (this.vs || 0) + (vNow - (this.vs || 0)) * Math.min(1, rdt / 0.06); const v = this.vs;
      if (v > vmax) { const was = this.sway; this.sway = Math.min(1.2, this.sway + (v - vmax) * dt * 4); if (was < 0.5 && this.sway >= 0.5) this.jerks++; }
      this.sway = Math.max(0, this.sway - dt * 0.4);
      if (L >= 1.5 && this.phase === 'pull' && (this.gustT -= dt) <= 0) { this.gustT = 2.5 + rng() * 2.5; this.sway = Math.min(1.2, this.sway + 0.35); this.fx.push({ pop: { t: 'רוח!', x: 0.3, y: 0.15 }, sfx: 'whoosh' }); }
      if (this.phase === 'set') { if (this.pt > 1.1) { this.col++; if (this.col >= cols) { this.done = true; this.phase = 'done'; } else { this.phase = 'pull'; this.ang = 0; this.sway = 0; this.pt = 0; this.fx.push({ hint: 'ועכשיו העמוד השני', sfx: 'rope' }); } } return; }
      if (this.ease) { this.ease = Math.max(0, this.ease - dt); this.ang += (1 - tol * 2.5 - this.ang) * Math.min(1, dt * 4); if (!this.ease && this.colOvers >= 2) { this.crew = 1; this.ang = 1; this.sway = 0; this.setIt(); this.fx.push({ hint: 'הצוות כיוון את העמוד לאנך' }); } return; }
      const held = Object.keys(this.ps).length > 0;
      if (!held && this.true_() && this.sway < 0.25) this.setIt();
      else if (!this.patient && !this.hold && this.quiet > 3) { this.ang = Math.min(1, this.ang + dt * 0.06); this.crew = 1; }   // a test's idle hand: the crew hauls, slowly
    },
    setIt() {
      const acc = clamp(1 - Math.abs(1 - this.ang) / tol * 0.6) * (this.crew ? 0.4 : 1);
      this.accs.push(acc); this.ang = 1; this.sway = 0; this.phase = 'set'; this.pt = 0; this.progress = this.col * 40 + 40; this.crew = 0; this.colOvers = 0;
      this.fx.push({ sfx: 'thud', haptic: [15, 40, 15], dust: { x: 0.62, y: 0.86, n: 14 }, pop: { t: acc > 0.85 ? 'האנך אמת!' : 'עומד!', x: 0.4, y: 0.3, kind: 'big' } }, { sfx: 'chime', o: { combo: this.col + 2 } });
    },
    cue() {
      if (this.phase !== 'pull' || this.ease) return null;
      const rem = (1 - this.ang) / gain;                  // rope still to haul (in heights)
      if (rem < 0.5) return { x: RX, y: 0.42, x2: RX, y2: 0.42 + Math.max(0.03, rem), ms: 2000 };   // gently, to the plumb
      return { x: RX, y: 0.3, x2: RX, y2: 0.82 };
    },
    auto() {
      if (this.phase !== 'pull' || this.ease) { if (this._a) { this._a = null; return { x: RX, y: 0.9, p: 'up', id: 1 }; } return null; }
      const a = this._a, rem = (1 - this.ang) / gain;
      if (a) {                                            // a steady haul, then a slow one to the plumb
        if (a.y >= a.goal - 1e-9 || this.sway > 0.45) { this._a = null; this._w = 0.14; return { x: RX, y: a.y, p: 'up', id: 1 }; }
        a.y = Math.min(a.goal, a.y + a.sp);
        return { x: RX, y: a.y, p: 'move', id: 1 };
      }
      if ((this._w -= 1 / 60) > 0 || (this.true_() && rem < tol * 0.3 / gain) || this.sway > 0.3) return null;
      this._a = rem >= 0.6 ? { y: 0.32, goal: Math.min(0.9, 0.32 + rem - 0.5), sp: 0.022 } : { y: 0.3, goal: 0.3 + rem, sp: 0.008 };
      return { x: RX, y: this._a.y, p: 'down', id: 1 };
    },
    result() {
      const mean = (a, d) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : d);
      const steady = clamp(1 - this.jerks * 0.18 - this.overs * 0.12) * clamp(this.hauled / (cols * rope * 0.6)), acc = mean(this.accs, 0.3) * clamp(1 - this.overs * 0.1), par = clamp(1 - (this.t - parT) / parT);
      const quality = clamp(0.4 * steady + 0.4 * acc + 0.2 * par);
      return { quality, perfect: quality >= 0.97 && !this.jerks && !this.overs, score: Math.round(quality * 300), steady, acc, par, jerks: this.jerks, overs: this.overs, cols: this.col };
    },
  };
  return M;
}

function draw(g, M, W, H) {
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#9CC0DE'); sky.addColorStop(0.75, '#E8D7B0'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,250,235,.45)';                                            // the Stoa's standing columns, far behind
  for (let i = 0; i < 6; i++) g.fillRect(W * (0.04 + i * 0.075), H * 0.42, W * 0.03, H * 0.44);
  g.fillRect(W * 0.02, H * 0.38, W * 0.46, H * 0.05);
  g.fillStyle = '#CDB88E'; g.fillRect(0, H * 0.86, W, H * 0.14);                      // the paving
  g.strokeStyle = 'rgba(120,96,60,.4)'; g.lineWidth = 1; g.beginPath(); for (let x = 0; x < W; x += W / 8) { g.moveTo(x, H * 0.86); g.lineTo(x - 10, H); } g.stroke();
  const bx = W * 0.6, by = H * 0.86, len = H * 0.62, cw = Math.max(16, W * 0.075);
  const ax = W * 0.6, ay = H * 0.08;                                                // the shear-legs' apex and pulley
  g.strokeStyle = '#6E4A2A'; g.lineWidth = 7; g.lineCap = 'round';
  g.beginPath(); g.moveTo(W * 0.4, by); g.lineTo(ax, ay); g.lineTo(W * 0.8, by); g.stroke(); g.lineCap = 'butt';
  g.fillStyle = '#4A3420'; g.beginPath(); g.arc(ax, ay, 8, 0, 6.2832); g.fill();
  const th = (Math.PI / 2) * clamp(M.tilt(), 0, 1.15), hx = bx - Math.cos(th) * len, hy = by - Math.sin(th) * len;   // the column's head
  const px = bx + cw * 0.5 + 6, true_ = M.true_() && M.phase === 'pull';
  g.strokeStyle = true_ || M.phase === 'set' ? '#FFD66E' : 'rgba(255,240,200,.85)'; g.lineWidth = true_ ? 3 : 1.5;   // the plumb line by its edge
  g.beginPath(); g.moveTo(px, ay + 14); g.lineTo(px, by - 26); g.stroke();
  g.fillStyle = '#7C7C84'; g.beginPath(); g.moveTo(px - 6, by - 26); g.lineTo(px + 6, by - 26); g.lineTo(px, by - 12); g.fill();
  g.save(); g.translate(bx, by); g.rotate(th);                                       // the white marble column (its base at the pivot; it rises up-left)
  g.fillStyle = '#F3EFE4'; g.fillRect(-len, -cw / 2, len, cw);
  g.strokeStyle = 'rgba(160,150,130,.6)'; g.lineWidth = 1; for (const f of [-0.25, 0, 0.25]) { g.beginPath(); g.moveTo(-len + 10, f * cw); g.lineTo(-10, f * cw); g.stroke(); }
  g.fillStyle = '#E2D9C4'; g.fillRect(-len - 8, -cw / 2 - 6, 14, cw + 12); g.fillRect(-12, -cw / 2 - 4, 12, cw + 8);   // the capital and the base
  g.restore();
  g.fillStyle = '#B9A47C'; g.fillRect(bx - cw, by - 4, cw * 2, 8);                   // the plinth
  g.strokeStyle = '#8A6A3A'; g.lineWidth = 3;                                        // the rope: head → pulley → down to her hands
  g.beginPath(); g.moveTo(hx, hy); g.lineTo(ax, ay); g.lineTo(W * RX, ay + 6); g.lineTo(W * RX, H); g.stroke();
  g.strokeStyle = 'rgba(60,40,20,.55)'; g.lineWidth = 3;                             // marks that run down as she hauls
  const off = (M.ang * H * 4.5) % 18;
  g.beginPath(); for (let y = ay + 12 + off; y < H; y += 18) { g.moveTo(W * RX - 3, y); g.lineTo(W * RX + 3, y + 5); } g.stroke();
  for (const id in M.ps) { const p = M.ps[id]; g.fillStyle = '#D9A77B'; g.beginPath(); g.arc(W * RX, p.y * H, 11, 0, 6.2832); g.fill(); }
  if (M.sway > 0.25) { g.fillStyle = `rgba(255,140,90,${Math.min(0.9, M.sway)})`; g.font = '800 15px Heebo, system-ui, sans-serif'; g.textAlign = 'center'; g.fillText('〰', hx, hy - 12); }
  g.fillStyle = 'rgba(28,20,10,.72)'; g.fillRect(W - 92, 6, 86, 22);
  g.fillStyle = '#F3E6C4'; g.font = '700 13px Heebo, system-ui, sans-serif'; g.textAlign = 'right'; g.direction = 'rtl';
  g.fillText(`עמוד ${Math.min(M.col + 1, M.cols)}/${M.cols}`, W - 12, 22);
}

export const pull = {
  kind: 'pull', topic: 'stoa', n: 'מקימים עמוד', kicker: 'הסטיו המלכותי', step: 'stone', secs: [18, 30], fact: FACT, guide: 99, model, draw,   // (the hand stays: at the top it shows the gentle haul)
  hint: 'משוך את החבל למטה, יד אחרי יד — לאט, שלא יתנדנד', howto: 'משוך את החבל למטה, יד אחרי יד. למעלה — לאט, ועזוב כשהאנך ישר לאורך העמוד',
};
// ── crafta19 ── the column pull IN THE WORLD under two thumbs (FUN19 §2, binding; RESEARCH19's B2, approved): hand over hand — a short
// UPWARD swipe on the work button (≥ 30 px) is one heave on the rope, the act at the swipe's crossing, graded on the music's beat
// (gold ±90 ms, ±120 at L1); a tap is a heave too (≤ good). The column rises on the shear legs about 6° a heave and the ratchet holds
// it (it never falls back); at 90° it drops into its socket: +100 "עומד!", and a last heave on gold +50 "ישר כאנך". Raising by rope: המחשה.
import { act as caAct, bonus as caBonus, actsQ as caQ, beatQ as caBeatQ } from './acts.js';
const PL_N = [15, 15, 18];
function columnModel({ level = 0 } = {}) {
  const L = clamp(level | 0, 0, 2), N = PL_N[L];
  const M = {
    kind: 'pull', juice: true, twinOnly: true, level: L, N, k: 0, u: 0, uT: 0, heave: 0, phase: 'raise', t: 0, pt: 0, d0x: 0, d0y: 0, d0on: false, d0used: false,
    pressed: false, fx: [], acts: [], pts: 0, done: false, progress: 0,
    coach: "החליקו למעלה על 'עבודה' בקצב — יד אחר יד: כל משיכה מרימה את העמוד",
    heaveOnce(tap) {
      if (this.phase !== 'raise') return null;
      const q = caBeatQ(L), a = caAct(this, q, { tap: !!tap, power: 1, x: 0.5, y: 0.35 });
      this.k++; this.uT = Math.min(1, this.k / N); this.heave = 1; this.progress = this.k;
      this.fx.push({ sfx: 'rope', haptic: 10 });
      if (this.k >= N) { this.phase = 'stand'; this.pt = 0; caBonus(this, 100, 'עומד!'); if (a.q === 2) caBonus(this, 50, 'ישר כאנך'); this.fx.push({ sfx: 'thud', haptic: [16, 40, 20] }); }
      return a;
    },
    step(dt) {
      if (this.done) return;
      this.t += dt; this.pt += dt; this.heave = Math.max(0, this.heave - dt * 3);
      this.u += (this.uT - this.u) * Math.min(1, dt * 7);   // (the ratchet: it only ever rises)
      if (this.phase === 'stand' && this.pt > 1.4) { this.done = true; this.phase = 'done'; }
    },
    touch(down) { if (down) this.pressed = true; this.grip = down ? 1 : 0; },
    drag(x, y, ph) {
      if (this.phase !== 'raise') return;
      if (ph === 'down') { this.d0on = true; this.d0used = false; this.d0x = x; this.d0y = y; return; }
      if (!this.d0on) return;
      if (ph === 'move') { if (!this.d0used && (this.d0y - y) * 160 >= 30 - 18) { this.d0used = true; this.pressed = false; this.heaveOnce(false); } return; }
      if (ph === 'up' && !this.d0used) { this.pressed = false; this.heaveOnce(true); }   // (a drag that was no upward swipe: a heave all the same, ≤ good)
      this.d0on = false;
    },
    twinTap() { this.pressed = false; this.heaveOnce(true); },
    tap() { this.heaveOnce(true); },
    cue() { return null; },
    auto() { return null; },
    result() { const q = caQ(this, 0.8); return { quality: q, perfect: q >= 0.97 && this.acts.length > 0, score: this.pts | 0, columns: this.phase === 'raise' ? 0 : 1 }; },
  };
  return M;
}
pull.world = { kind: 'pull', model: columnModel, twinOnly: true, beatRing: true, hint: 'החלקה למעלה בקצב — משיכה בחבל', howto: 'כל החלקה למעלה היא משיכה; בקצב — זהב', fact: pull.fact };
// ── /crafta19 ──
