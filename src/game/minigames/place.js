/* place.js (FUN14, wave 14): put the stones in their places. Two skins:
 *  · 'arch' — בניית קשת (her ❤️): Robinson's Arch at the Mount. The voussoirs seat on the wooden frame in order from both sides,
 *    the keystone last; then the frame's wedges are knocked out and the arch stands by itself. L1: 5 stones · L2: 7, each to
 *    the seat of its size · L3: 9, and an even knock-out (left, right, left…). Source: Robinson's Arch (archaeology) and
 *    קדמוניות היהודים טו, יא, ה; the wooden frame (the centering) is המחשה.
 *  · 'course' — השלם את הנדבך (F1): fill the course's gap with stones of mixed lengths, no joint over a joint below.
 * Gesture: tap a stone, then tap its place (and with GAMES14's drag channel: drag it there). A wrong place is never a loss:
 * the stone floats back and the place glows where it can go. */
import { clamp } from './frame.js';

const ARCH = { 0: 5, 1: 7, 2: 9 };
function archModel(L, rng) {
  const n = ARCH[L], key = (n - 1) / 2;
  // a seat's size (L2+): the springers are the biggest, the keystone the smallest of its rank
  const sizeOf = (k) => (L ? Math.min(2, Math.abs(k - key) > key * 0.6 ? 2 : Math.abs(k - key) > key * 0.25 ? 1 : 0) : 0);
  const slots = Array.from({ length: n }, (_, k) => ({ k, a: Math.PI - (Math.PI * (k + 0.5)) / n, size: sizeOf(k), set: false }));
  const pool = slots.map((s) => s.size);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const stones = pool.map((size, i) => ({ i, size, used: false }));
  return { n, key, slots, stones };
}
const COURSE = { 0: [3, 0], 1: [4, 1], 2: [5, 2] };                 // stones, decoys
function courseModel(L, rng) {
  const [n, decoys] = COURSE[L];
  // the gap: n stones of mixed lengths (0.12…0.3 of the width) that fill it exactly; the course below has its own joints
  const lens = Array.from({ length: n }, () => 0.6 + rng() * 0.9), sum = lens.reduce((a, b) => a + b, 0), W = 0.84;
  let x = 0.08; const cuts = [];
  const slots = lens.map((l, k) => { const w = (l / sum) * W, s = { k, x, w, set: false }; x += w; if (k < n - 1) cuts.push(x); return s; });
  const below = []; let bx = 0.02;
  while (bx < 0.98) { const w = 0.16 + rng() * 0.14; below.push(bx); bx += w; }
  // keep the joints below away from the gap's own joints (no joint over a joint)
  const safe = below.filter((b) => cuts.every((c) => Math.abs(c - b) > 0.035));
  const stones = slots.map((s) => ({ i: s.k, w: s.w, used: false }));
  for (let d = 0; d < decoys; d++) stones.push({ i: n + d, w: slots[d % n].w * (d % 2 ? 1.35 : 0.7), used: false, decoy: true });
  for (let i = stones.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [stones[i], stones[j]] = [stones[j], stones[i]]; }
  return { n, slots, stones, below: safe };
}

export const place = {
  kind: 'place', topic: 'stone', n: 'בניית קשת', kicker: 'קשת רובינסון', step: 'place', secs: [15, 30],
  hint: 'הקש על אבן, ואז על המקום שלה — מלמטה למעלה, משני הצדדים',
  howto: 'הקש על אבן ואז על המקום המואר בקשת. אבן הראשה אחרונה', guide: 2,
  fact: { he: 'קשת רובינסון נשאה גרם מדרגות מן הרחוב שלמטה אל הר הבית; שרידיה בולטים עד היום מן הכותל המערבי, ליד פינתו הדרומית.', ref: 'ארכאולוגיה; קדמוניות היהודים טו, יא, ה (מסגרת העץ: המחשה)', status: 'draft', illus: false },

  model({ level = 0, rng = Math.random, setup = {} } = {}) {
    const L = clamp(level | 0, 0, 2), skin = setup.skin === 'course' ? 'course' : 'arch';
    const S0 = skin === 'arch' ? archModel(L, rng) : courseModel(L, rng);
    const M = {
      level: L, skin, ...S0, sel: -1, phase: 'build', t: 0, pt: 0, miss: 0, knocks: [], dropped: 0, done: false, progress: 0, fx: [],
      fly: null, wob: 0, par: skin === 'arch' ? 9 + 3 * L : 7 + 3 * L,
      /** the seats a stone may go to now: the arch from the bottom up on both sides, the keystone last; the course left to right */
      open() {
        if (this.skin === 'course') { const s = this.slots.find((x) => !x.set); return s ? [s.k] : []; }
        const n = this.n, key = this.key, out = [];
        const l = this.slots.findIndex((s, k) => k < key && !s.set), r = (() => { for (let k = n - 1; k > key; k--) if (!this.slots[k].set) return k; return -1; })();
        if (l >= 0) out.push(l); if (r >= 0) out.push(r);
        if (l < 0 && r < 0 && !this.slots[key].set) out.push(key);
        return out;
      },
      fits(st, k) {
        if (!st) return false;
        if (this.skin === 'course') return !st.decoy && Math.abs(st.w - this.slots[k].w) < 0.004;
        return st.size === this.slots[k].size;
      },
      step(dt) {
        if (this.done) return;
        this.t += dt; this.pt += dt;
        if (this.fly) { this.fly.t += dt * 3.2; if (this.fly.t >= 1) this.fly = null; }
        if (this.wob > 0) this.wob = Math.max(0, this.wob - dt * 1.5);
        if (this.phase === 'stand' && this.pt > 1.2) { this.done = true; this.phase = 'done'; }
        if (!this.patient && this.phase === 'build' && this.pt > 9) { const k = this.open()[0], st = this.stones.find((s) => !s.used && this.fits(s, k)); if (st != null && k != null) this.seat(st, k, 'הצוות הניח'); this.pt = 0; }
        if (!this.patient && this.phase === 'knock' && this.pt > 6) { this.knock(this.knocks.length % 2 ? 1 : 0); this.pt = 0; }
      },
      seat(st, k, say) {
        st.used = true; this.slots[k].set = true; this.sel = -1; this.progress++; this.pt = 0;
        this.fly = { k, t: 0 };
        const left = this.slots.filter((s) => !s.set).length;
        const p = this.pos(k);
        this.fx.push({ sfx: 'thud', haptic: 14, dust: { x: p.x, y: p.y, n: 8 }, pop: { t: say || (left ? (this.skin === 'arch' && k === this.key ? 'אבן הראשה!' : 'במקומה') : 'כל האבנים במקומן!'), x: p.x, y: p.y - 0.1, kind: 'good' } });
        if (!left) {
          if (this.skin === 'arch') { this.phase = 'knock'; this.fx.push({ sfx: 'chime', o: { combo: 6 }, howto: L >= 2 ? 'עכשיו הוצא את היתדות: שמאל, ימין, שמאל, ימין — בשווה' : 'עכשיו הוצא את שתי היתדות: הקש על כל יתד', guide: 1 }); }
          else { this.phase = 'stand'; this.pt = 0; this.fx.push({ sfx: 'chime', o: { combo: 8 }, hint: 'הנדבך שלם: אף חיבור אינו עומד מעל חיבור', pop: { t: 'הנדבך שלם!', x: 0.5, y: 0.3, kind: 'big' } }); }
        }
      },
      /** the frame's wedges: L1–L2 one tap each; L3 four each, evenly (two on one side in a row: a wobble, never a fall) */
      knock(side) {
        if (this.phase !== 'knock') return;
        const need = L >= 2 ? 4 : 1, lastSide = this.knocks.length ? this.knocks[this.knocks.length - 1] : -1;
        const done = (s) => this.knocks.filter((x) => x === s).length >= need;
        if (done(side)) return;
        if (L >= 2 && lastSide === side) { this.miss += 0.5; this.wob = 1; this.fx.push({ sfx: 'creak', shake: 0.5, pop: { t: 'בשווה! עכשיו הצד השני', x: side ? 0.75 : 0.25, y: 0.62, kind: 'bad' } }); }
        this.knocks.push(side);
        this.fx.push({ sfx: 'strike', haptic: 10, dust: { x: side ? 0.78 : 0.22, y: 0.8, n: 6 } });
        if (done(0) && done(1)) { this.phase = 'stand'; this.pt = 0; this.dropped = 1; this.fx.push({ sfx: 'split', shake: 0.8, haptic: [20, 40, 20], hint: 'הקשת עומדת בכוח עצמה — בלי מסגרת העץ!', pop: { t: 'הקשת עומדת!', x: 0.5, y: 0.25, kind: 'big' } }); }
      },
      /** where seat k is, in the canvas' 0…1 box */
      pos(k) {
        if (this.skin === 'course') { const s = this.slots[k]; return { x: s.x + s.w / 2, y: 0.57 }; }   // (the gap: 0.5…0.64 of the canvas)
        const a = this.slots[k].a; return { x: 0.5 + Math.cos(a) * 0.34, y: 0.62 - Math.sin(a) * 0.42 };
      },
      trayPos(idx) { const m = this.stones.length, w = 0.9 / m; return { x: 0.05 + w * (idx + 0.5), y: 0.9 }; },
      hitTray(x, y) { if (y < 0.8) return -1; const m = this.stones.length, w = 0.9 / m, i = Math.floor((x - 0.05) / w); return i >= 0 && i < m && !this.stones[i].used ? i : -1; },
      hitSeat(x, y) {
        let best = -1, bd = 1e9;
        for (const s of this.slots) { if (s.set) continue; const p = this.pos(s.k), d = Math.hypot(x - p.x, (y - p.y) * 0.8); if (d < bd) { bd = d; best = s.k; } }
        return bd < (this.skin === 'course' ? 0.16 : 0.13) ? best : -1;
      },
      tryPut(k) {
        const st = this.stones[this.sel];
        if (!st) return;
        if (this.open().includes(k) && this.fits(st, k)) { this.seat(st, k); return; }
        this.miss++; this.wob = 0.6;
        const why = !this.open().includes(k) ? (this.skin === 'arch' ? 'עוד לא — מלמטה למעלה' : 'משמאל לימין') : this.skin === 'arch' ? 'לא בגודל הזה' : st.decoy ? 'האבן הזאת לא מתאימה לרווח' : 'לא באורך הזה';
        const p = this.pos(k);
        this.fx.push({ sfx: 'crack', haptic: 8, pop: { t: why, x: p.x, y: p.y - 0.08, kind: 'bad' } });
      },
      tap(x = 0.5, y = 0.5) {
        if (this.done) return;
        if (this.phase === 'knock') { this.knock(x > 0.5 ? 1 : 0); return; }
        if (this.phase !== 'build') return;
        const ti = this.hitTray(x, y);
        if (ti >= 0) { this.sel = ti; this.fx.push({ sfx: 'creak', haptic: 6 }); return; }
        if (this.sel < 0) return;
        const k = this.hitSeat(x, y);
        if (k >= 0) this.tryPut(k);
      },
      /* the drag channel (GAMES14): down on a stone, drag it to its place, let go */
      drag(x, y, ph) {
        if (this.done) return;
        if (ph === 'down') { if (this.phase === 'knock') { this.knock(x > 0.5 ? 1 : 0); return; } const ti = this.hitTray(x, y); if (ti >= 0) { this.sel = ti; this.dragAt = { x, y }; } else if (this.sel >= 0) { const k = this.hitSeat(x, y); if (k >= 0) this.tryPut(k); } return; }
        if (ph === 'move' && this.dragAt) { this.dragAt = { x, y }; return; }
        if ((ph === 'up' || ph === 'cancel') && this.dragAt) { this.dragAt = null; const k = this.hitSeat(x, y); if (k >= 0 && this.sel >= 0) this.tryPut(k); }
      },
      /** the hand: the stone that fits an open seat, then that seat; the wedges */
      cue() {
        if (this.done || this.phase === 'stand') return null;
        if (this.phase === 'knock') { const need = L >= 2 ? 4 : 1, l = this.knocks.filter((s) => s === 0).length, r = this.knocks.length - l, last = this.knocks[this.knocks.length - 1]; const side = l >= need ? 1 : r >= need ? 0 : last === 0 ? 1 : 0; return { x: side ? 0.78 : 0.22, y: 0.8 }; }
        const open = this.open();
        if (this.sel >= 0) { const k = open.find((q) => this.fits(this.stones[this.sel], q)); if (k != null) return this.pos(k); }
        for (let i = 0; i < this.stones.length; i++) if (!this.stones[i].used && open.some((k) => this.fits(this.stones[i], k))) return this.trayPos(i);
        return null;
      },
      auto() {
        if (this.pt < 0.35) return null;
        const c = this.cue(); if (!c) return null;
        this.tap(c.x, c.y); this.pt = 0; return null;
      },
      result() {
        const slow = Math.max(0, this.t - this.par) / 40;
        const quality = clamp(1 - 0.1 * this.miss - slow, 0.3, 1);
        return { quality, perfect: this.miss === 0 && slow === 0, score: Math.round(quality * 300) + (this.miss ? 0 : 50) };
      },
    };
    return M;
  },

  draw(g, M, W, H, fx) {
    const sh = fx && fx.shake ? fx.shake : 0;
    g.save(); g.translate(sh * (Math.random() - 0.5), 0);
    g.fillStyle = '#2E2416'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#3A2E1E'; g.fillRect(0, H * 0.78, W, H * 0.22);              // the tray's ledge
    const stoneCol = (size) => ['#E3D2AC', '#D6C092', '#C7AE7C'][size | 0];
    if (M.skin === 'arch') {
      const cx = W * 0.5, base = H * 0.62, R = W * 0.34, Ry = H * 0.42;
      // the piers
      g.fillStyle = '#C9B285'; g.fillRect(cx - R - W * 0.1, base, W * 0.11, H * 0.16); g.fillRect(cx + R - W * 0.01, base, W * 0.11, H * 0.16);
      // the wooden frame (the centering) and its wedges, until they are knocked out
      if (!M.dropped) {
        g.strokeStyle = '#8B5A2B'; g.lineWidth = 6; g.beginPath(); g.ellipse(cx, base, R * 0.86, Ry * 0.86, 0, Math.PI, 0); g.stroke();
        g.lineWidth = 3; for (let k = 1; k < 6; k++) { const a = Math.PI - (Math.PI * k) / 6; g.beginPath(); g.moveTo(cx, base); g.lineTo(cx + Math.cos(a) * R * 0.84, base - Math.sin(a) * Ry * 0.84); g.stroke(); }
        const need = M.level >= 2 ? 4 : 1;
        for (const side of [0, 1]) {
          const out = M.knocks.filter((s) => s === side).length / need, wx = side ? W * 0.78 : W * 0.22;
          g.fillStyle = M.phase === 'knock' ? '#FFD66E' : '#A0703C';
          g.beginPath(); g.moveTo(wx - 18 + (side ? 1 : -1) * out * 26, H * 0.8); g.lineTo(wx + 18 + (side ? 1 : -1) * out * 26, H * 0.8); g.lineTo(wx + (side ? 1 : -1) * out * 26, H * 0.71); g.closePath(); g.fill();
        }
      }
      // the seats: set stones, open seats glowing
      const open = M.phase === 'build' ? M.open() : [];
      for (const s of M.slots) {
        const a0 = Math.PI - (Math.PI * s.k) / M.n, a1 = Math.PI - (Math.PI * (s.k + 1)) / M.n, wob = M.wob * Math.sin(M.t * 30) * 2;
        g.beginPath(); g.ellipse(cx + wob, base, R * 1.12, Ry * 1.12, 0, -a0, -a1); g.ellipse(cx + wob, base, R * 0.88, Ry * 0.88, 0, -a1, -a0, true); g.closePath();
        if (s.set) { g.fillStyle = stoneCol(s.size); g.fill(); g.strokeStyle = '#7A5E36'; g.lineWidth = 1.5; g.stroke(); }
        else { g.fillStyle = open.includes(s.k) ? 'rgba(255,214,110,.30)' : 'rgba(255,255,255,.06)'; g.fill(); g.strokeStyle = open.includes(s.k) ? '#FFD66E' : 'rgba(255,246,218,.25)'; g.lineWidth = open.includes(s.k) ? 2.5 : 1; g.setLineDash(open.includes(s.k) ? [] : [4, 4]); g.stroke(); g.setLineDash([]); }
        if (M.level && !s.set) { const p = M.pos(s.k); g.fillStyle = 'rgba(255,246,218,.7)'; g.font = '700 11px Heebo, sans-serif'; g.textAlign = 'center'; g.fillText(['•', '••', '•••'][s.size], p.x * W, p.y * H + 4); }
      }
    } else {
      // the course: the course below with its joints, the gap above it
      const y0 = H * 0.5, h = H * 0.14;
      g.fillStyle = '#C9B285'; g.fillRect(W * 0.02, y0 + h, W * 0.96, h);
      g.strokeStyle = '#7A5E36'; g.lineWidth = 2; for (const b of M.below) { g.beginPath(); g.moveTo(b * W, y0 + h); g.lineTo(b * W, y0 + 2 * h); g.stroke(); }
      g.fillStyle = '#D8C49A'; g.fillRect(W * 0.0, y0, W * 0.08, h); g.fillRect(W * 0.92, y0, W * 0.08, h);
      const open = M.phase === 'build' ? M.open() : [];
      for (const s of M.slots) {
        if (s.set) { g.fillStyle = '#E3D2AC'; g.fillRect(s.x * W + 1, y0 + 1, s.w * W - 2, h - 2); g.strokeStyle = '#7A5E36'; g.strokeRect(s.x * W + 1, y0 + 1, s.w * W - 2, h - 2); }
        else if (open.includes(s.k)) { g.fillStyle = 'rgba(255,214,110,.28)'; g.fillRect(s.x * W, y0, s.w * W, h); g.strokeStyle = '#FFD66E'; g.lineWidth = 2.5; g.strokeRect(s.x * W, y0, s.w * W, h); }
      }
      g.strokeStyle = 'rgba(255,246,218,.3)'; g.setLineDash([5, 4]); g.strokeRect(W * 0.08, y0, W * 0.84, h); g.setLineDash([]);
    }
    // the tray
    for (let i = 0; i < M.stones.length; i++) {
      const st = M.stones[i]; if (st.used) continue;
      const p = M.trayPos(i), sel = M.sel === i, lift = sel ? 8 : 0;
      const bw = M.skin === 'arch' ? [W * 0.07, W * 0.085, W * 0.1][st.size] : st.w * W * 0.62, bh = H * 0.075;
      let x = p.x * W, y = p.y * H - lift;
      if (sel && M.dragAt) { x = M.dragAt.x * W; y = M.dragAt.y * H; }
      g.fillStyle = M.skin === 'arch' ? stoneCol(st.size) : '#E3D2AC';
      g.fillRect(x - bw / 2, y - bh / 2, bw, bh);
      g.strokeStyle = sel ? '#FFD66E' : '#7A5E36'; g.lineWidth = sel ? 3 : 1.5; g.strokeRect(x - bw / 2, y - bh / 2, bw, bh);
      if (M.skin === 'arch' && M.level) { g.fillStyle = '#5A3A0A'; g.font = '700 11px Heebo, sans-serif'; g.textAlign = 'center'; g.fillText(['•', '••', '•••'][st.size], x, y + 4); }
    }
    if (M.phase === 'stand' && M.skin === 'arch') { g.fillStyle = 'rgba(255,214,110,.18)'; g.fillRect(0, 0, W, H * 0.7); }
    g.restore();
  },
};
/** השלם את הנדבך (F1): place.js's second skin, as its own game (its own title, how-to and fact) */
export const course = {
  ...place, kind: 'course', n: 'השלם את הנדבך', kicker: 'הנדבך', hint: 'הקש על אבן באורך המתאים, ואז על הרווח — משמאל לימין',
  howto: 'הקש על האבן שאורכה כאורך הרווח המואר, ואז על הרווח', guide: 2,
  fact: { he: 'בכותל המערבי אבנים באורכים שונים, ואף חיבור בין שתי אבנים אינו עומד מעל חיבור שבנדבך שמתחתיו.', ref: 'ארכאולוגיה: הבנייה ההרודיאנית', status: 'draft', illus: false },
  model(o = {}) { return place.model({ ...o, setup: { ...(o.setup || {}), skin: 'course' } }); },
};
