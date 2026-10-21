/* אבנים שלמות (whole stones): the altar's stones from the valley of Beit Kerem (Middot 3:4, a draft for CONTENT).
 * Field stones arrive one by one; accept the whole ones for the altar and set aside any stone that is nicked or that
 * iron touched. No tool strikes them here: they are only inspected, carried and laid. Speed rises by level. */
export const whole = {
  kind: 'whole', topic: 'yesod', n: 'אבנים שלמות', kicker: 'אבני המזבח', step: 'altar', secs: [20, 40],
  hint: 'שלמה — למזבח. פגומה או שנגע בה ברזל — הצידה',
  howto: 'אבן שלמה — ✓ למזבח. אבן פגומה, או שנגע בה ברזל — ✗ פסולה', guide: 2,   // (wave 8B) the first-time how-to
  buttons: [{ id: 'ok', label: '✓ שלמה — למזבח', cls: 'fx-ok' }, { id: 'no', label: '✗ פסולה', cls: 'fx-no' }],
  fact: { he: 'אבני המזבח הובאו שלמות מבקעת בית כרם, "שֶׁלֹּא הוּנַף עֲלֵיהֶן בַּרְזֶל"; "נִפְגְּמָה אַחַת מֵהֶן, הִיא פְסוּלָה וְכֻלָּן כְּשֵׁרוֹת".', ref: 'משנה מידות ג, ד', status: 'draft', illus: false },

  model({ level = 0, rng, setup = {} } = {}) {
    const n = 10 + level, I = 3 - 0.35 * level;           // (wave 8B) a calmer look at level 0 (was 2.3 s); the first two stones wait for a player          // (wave 7) harder = less time to judge each stone, not more stones (was 10 + 2·level: 12 → 22 s)
    const stones = Array.from({ length: n }, (_, i) => {
      const r = rng(), kind = i === 0 ? 'whole' : i === 1 ? 'nick' : r < 0.58 ? 'whole' : r < 0.83 ? 'nick' : 'iron';
      const pts = Array.from({ length: 10 }, () => 0.78 + rng() * 0.3);
      return { kind, pts, rot: rng() * 6.28, cut: rng() * 10 | 0, q: -1, choice: null };
    });
    const M = {
      level, n, stones, i: 0, phase: 'in', pt: 0, pile: 0, heap: 0, done: false, progress: 0, fx: [], told: false,
      cur() { return stones[this.i]; },
      lim() { return this.hold || (this.patient && this.i < 2 && level <= 1) ? 1e9 : I; },
      /** (wave 8B) where a player taps: the right button (the hand teaches the first two stones) */
      cue() { const s = this.cur(); return s && (this.phase === 'look' || this.phase === 'in') ? { btn: s.kind === 'whole' ? 'ok' : 'no', now: false, timed: false } : null; },
      step(dt) {
        if (this.done) return;
        this.pt += dt;
        if (this.phase === 'in' && this.pt > 0.35) { this.phase = 'look'; this.pt = 0; }
        else if (this.phase === 'look' && this.pt > this.lim()) this.decide(null);
        else if (this.phase === 'out' && this.pt > 0.35) {
          this.i++; this.phase = 'in'; this.pt = 0;
          if (this.i >= n) { this.done = true; this.phase = 'done'; }
        }
      },
      decide(ok) {
        const s = this.cur(); if (!s || s.choice !== null) return;
        const good = s.kind === 'whole';
        s.choice = ok;
        s.q = ok === null ? 0.5 : ok === good ? 1 : 0;
        if (ok === true) this.pile++; else this.heap++;
        const pop = ok === null ? ['המשגיח הניח בצד', ''] : ok && good ? ['שלמה ✓', 'good'] : !ok && !good ? ['נכון — פסולה', 'good']
          : ok ? [s.kind === 'iron' ? 'נגע בה ברזל — פסולה' : 'נפגמה — פסולה', 'bad'] : ['היא הייתה שלמה', 'bad'];
        this.fx.push({ sfx: ok ? 'settle' : 'grind', haptic: s.q >= 1 ? 8 : 20, pop: { t: pop[0], x: 0.5, y: 0.2, kind: pop[1] } });
        if (s.q >= 1 && this.stones.slice(0, this.i + 1).every((k) => k.q >= 1) && (this.i + 1) % 4 === 0) this.fx.push({ sfx: 'chime', o: { combo: (this.i + 1) / 4 + 1 } });
        this.phase = 'out'; this.pt = 0; this.progress++;
      },
      press(id) { if (this.phase === 'look' || this.phase === 'in') this.decide(id === 'ok'); },
      tap() { if (!this.told) { this.told = true; this.fx.push({ hint: 'בחר בכפתור: שלמה — למזבח, או פסולה', sfx: 'ui' }); } },
      auto() {
        const s = this.cur();
        if (this.phase !== 'look' || !s || this.pt < 0.45) return false;
        return s.kind === 'whole' ? 'ok' : 'no';
      },
      result() {
        const qs = stones.map((s) => (s.q < 0 ? 0.5 : s.q));
        const quality = qs.reduce((a, b) => a + b, 0) / qs.length;
        return { quality, perfect: qs.every((q) => q >= 1), score: Math.round(quality * 200) + qs.filter((q) => q >= 1).length * 10 };
      },
    };
    if (setup && setup.onWorld) M.fx.push({ world: 'field' });                   // PEOPLE: a field stone at the hero's feet
    return M;
  },

  draw(g, M, W, H) {
    if (!M._sky || M._sky.h !== H) { const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#E9CF9E'); sky.addColorStop(1, '#B89C6C'); M._sky = { h: H, sky }; }
    g.fillStyle = M._sky.sky; g.fillRect(0, 0, W, H);
    g.fillStyle = '#8F7550'; g.fillRect(0, H * 0.72, W, H * 0.28);                              // the ground
    const blob = (x, y, r, s, lit) => {
      g.save(); g.translate(x, y); g.rotate(s.rot);
      g.beginPath();
      const sub = M.level / 4;                                                                     // defects grow subtler by level
      for (let k = 0; k <= 10; k++) { const a = (k / 10) * 6.283, rr = r * s.pts[k % 10] * (s.kind === 'nick' && k % 10 === s.cut ? 0.62 + 0.2 * sub : 1); g[k ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); }
      g.closePath(); g.fillStyle = lit ? '#DCCDAA' : '#CBB892'; g.fill(); g.strokeStyle = '#6B5A3A'; g.lineWidth = 2; g.stroke();
      if (s.kind === 'nick') { const a = (s.cut / 10) * 6.283; g.fillStyle = '#F7F0DE'; g.beginPath(); g.arc(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7, r * (0.14 - 0.06 * sub), 0, 6.29); g.fill(); }
      if (s.kind === 'iron') { const L = 1 - 0.45 * sub; g.strokeStyle = '#EDEFF5'; g.lineWidth = 2.5 - sub; g.beginPath(); g.moveTo(-r * 0.45 * L, -r * 0.1 * L); g.lineTo(r * 0.35 * L, r * 0.22 * L); g.stroke(); g.strokeStyle = '#8A8F9A'; g.lineWidth = 1; g.stroke(); }
      g.restore();
    };
    for (let k = 0; k < M.pile; k++) blob(W * 0.12 + (k % 4) * 16, H * 0.68 - Math.floor(k / 4) * 14, 12, M.stones[0], true);   // the altar's pile
    for (let k = 0; k < M.heap; k++) blob(W * 0.86 - (k % 4) * 15, H * 0.9 - Math.floor(k / 4) * 12, 10, M.stones[1], false);  // set aside
    const s = M.cur();
    if (s) {
      let x = W * 0.5, y = H * 0.44;
      if (M.phase === 'in') x = W * (1.15 - 0.65 * Math.min(1, M.pt / 0.35));
      if (M.phase === 'out') { const k = Math.min(1, M.pt / 0.35); if (s.choice) { x = W * (0.5 - 0.38 * k); y = H * (0.44 + 0.2 * k); } else { x = W * (0.5 + 0.36 * k); y = H * (0.44 + 0.4 * k); } }
      blob(x, y, Math.min(W, H) * 0.2, s, true);
      if (M.phase === 'look' && M.lim() < 99) { g.fillStyle = 'rgba(255,214,110,.9)'; g.fillRect(W * 0.3, H * 0.08, W * 0.4 * (1 - Math.min(1, M.pt / M.lim())), 5); }
    }
    g.fillStyle = '#1C140A'; g.font = '700 14px Heebo, system-ui, sans-serif'; g.textAlign = 'right'; g.direction = 'rtl';
    g.fillText(`אבן ${Math.min(M.i + 1, M.n)}/${M.n} · למזבח ${M.pile}`, W - 10, H - 10);
  },
};
