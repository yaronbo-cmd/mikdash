/* clock.js — the Temple day in GAME time (docs/PHASEB-DAY-DESIGN.md §1; ENGINE22).
 *   const C = createDayClock({ save })       save = G.avodah.day, mutated in place: { n (day number), h (temple hour 0–24) }
 *   C.now() → { h, block, label, period, toNext: { id, he, minGame, minReal }, t }
 *   C.tick(dtRealSec) · C.pause() · C.resume() · C.skipTo(h) (tests) · C.on(fn(type, d)) · C.ended · C.nextDay()
 * A day begins at 18:00 (the gates are locked; the night) and runs 24 temple hours: night 18→04 (5 real minutes in all),
 * dawn 04→07 (9), day 07→14 (21), evening 14→16 (6), close 16→18 (4). The clock pauses (paused flag) whenever the page is
 * hidden or the host says so — nothing is lost by leaving. Events: 'quarter' (every ¼ hour), 'block' ({ block }), 'end'.
 * Temple hours are the equinox hours (calendar.js varies the real ones; a game day does not). */
export const BLOCKS = [
  { id: 'night', t0: 0, t1: 10, minPerHour: 0.5, he: 'לילה' },
  { id: 'dawn', t0: 10, t1: 13, minPerHour: 3, he: 'שחר' },
  { id: 'day', t0: 13, t1: 20, minPerHour: 3, he: 'יום' },
  { id: 'evening', t0: 20, t1: 22, minPerHour: 3, he: 'בין הערביים' },
  { id: 'close', t0: 22, t1: 24, minPerHour: 2, he: 'סיום היום' },
];
/** the day's fixed appointments (temple hour h) — the horizon's "next" */
export const APPOINTMENTS = [
  { id: 'watch', he: 'סבב איש הר הבית', h: 18.5 },
  { id: 'moked', he: 'המדורה בבית המוקד', h: 22 },
  { id: 'hashkama', he: 'ההשכמה והפיס', h: 4 },
  { id: 'tamid-shachar', he: 'התמיד של שחר', h: 5 + 40 / 60 },
  { id: 'ketoret', he: 'הקטורת', h: 6 + 50 / 60 },
  { id: 'korbanot', he: 'קרבנות היחיד', h: 8 },
  { id: 'tamid-erev', he: 'התמיד של בין הערביים', h: 14.5 },
  { id: 'ketoret-erev', he: 'קטורת ונרות', h: 15.5 },
  { id: 'neilah', he: 'נעילת השערים', h: 18 },
];
const tOf = (h) => (((h - 18) % 24) + 24) % 24;          // hours since 18:00
const hOf = (t) => (18 + t) % 24;
export const blockOf = (t) => { for (const b of BLOCKS) if (t < b.t1) return b; return BLOCKS[BLOCKS.length - 1]; };
/** real minutes to cross from t0 to t1 (hours since 18:00) */
export function realMinutes(t0, t1) {
  let m = 0;
  for (const b of BLOCKS) { const a = Math.max(t0, b.t0), z = Math.min(t1, b.t1); if (z > a) m += (z - a) * b.minPerHour; }
  return m;
}
const W = ['', 'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע', 'עשר', 'אחת עשרה', 'שתים עשרה'];
/** "חמש ומחצה" for a temple hour (a 12-hour face; the block says morning or evening) */
export function labelHe(h) {
  let q = Math.round(h * 4) / 4; q = ((q % 24) + 24) % 24;
  let hh = Math.floor(q), mm = Math.round((q - hh) * 60);
  const w = (x) => W[((x % 12) || 12)];
  if (mm === 0) return w(hh);
  if (mm === 15) return `${w(hh)} ורבע`;
  if (mm === 30) return `${w(hh)} ומחצה`;
  return `${w(hh + 1)} פחות רבע`;
}
export function periodHe(h) { const t = tOf(h); return blockOf(t).id === 'night' ? (h >= 18 && h < 20 ? 'ערב' : 'לילה') : h < 12 ? (h < 5 ? 'לפנות בוקר' : 'בוקר') : 'אחר הצהריים'; }
/** the next appointment after temple hour h (null after the last one of the day) → { id, he, h, hours } */
export function nextAppointment(h, skip = '') {
  const t = tOf(h); let best = null;
  for (const a of APPOINTMENTS) { let ta = tOf(a.h); if (a.id === 'neilah') ta = 24; if (ta > t + 1e-6 && a.id !== skip && (!best || ta < best.ta)) best = { ...a, ta }; }
  return best ? { id: best.id, he: best.he, h: best.h, hours: best.ta - t } : null;
}
export function createDayClock({ save = {} } = {}) {
  if (!Number.isFinite(save.n) || save.n < 1) save.n = 1;
  if (!Number.isFinite(save.h)) save.h = 18;
  let t = tOf(save.h), paused = false, ended = false, lastQ = Math.floor(t * 4), lastBlock = blockOf(t).id;
  if (save.h === 18 && save.t24) { t = 24; ended = true; }
  const subs = [];
  const fire = (type, d) => { for (const f of subs) { try { f(type, d); } catch (e) { /* a listener's */ } } };
  const C = {
    on(f) { subs.push(f); return () => { const i = subs.indexOf(f); if (i >= 0) subs.splice(i, 1); }; },
    now() {
      const b = blockOf(Math.min(t, 23.999)), h = ended ? 18 : hOf(t), nx = nextAppointment(h);
      return {
        h, t, block: b.id, blockHe: b.he, label: labelHe(h), period: periodHe(h), n: save.n, ended,
        toNext: nx ? { id: nx.id, he: nx.he, h: nx.h, minGame: Math.round(nx.hours * 60), minReal: Math.max(1, Math.round(realMinutes(t, t + nx.hours))) } : null,
      };
    },
    tick(dtReal) {
      if (paused || ended || !(dtReal > 0)) return;
      let left = Math.min(dtReal, 600) / 60;              // real minutes (a long frame never skips a block)
      while (left > 1e-9 && !ended) {
        const b = blockOf(Math.min(t, 23.9999)), need = (b.t1 - t) * b.minPerHour;
        if (left >= need) { left -= need; t = b.t1; } else { t += left / b.minPerHour; left = 0; }
        step();
      }
    },
    pause() { paused = true; }, resume() { paused = false; },
    get paused() { return paused; }, get ended() { return ended; },
    skipTo(h) { const nt = tOf(h); if (nt < t) return; t = nt; ended = false; step(); },
    /** a new day: the night of the next day (the host calls it after dayEnd's chain) */
    nextDay() { save.n++; t = 0; ended = false; lastQ = 0; lastBlock = 'night'; save.h = 18; delete save.t24; fire('block', { block: 'night' }); },
  };
  function step() {
    if (t >= 24 - 1e-9) { t = 24; ended = true; save.h = 18; save.t24 = 1; fire('end', { n: save.n }); return; }
    save.h = Math.round(hOf(t) * 1000) / 1000;
    const b = blockOf(t).id;
    if (b !== lastBlock) { lastBlock = b; fire('block', { block: b }); }
    const q = Math.floor(t * 4);
    if (q < lastQ) lastQ = q;                                  // (skipTo / a new day)
    while (lastQ < q) { lastQ++; fire('quarter', { h: hOf(lastQ / 4) }); }   // (every quarter crossed, even in one long tick)
  }
  return C;
}
