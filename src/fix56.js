/* ── build 56ב ── fix56.js — the tester's stage menu (tester56.js) keeps the chosen stage for ONE start: the query in localStorage
 * 'bh_fix' and the hash in 'bh_fixh'. Imported FIRST by main.js, before any module reads location: it puts them into the page's own
 * address (history.replaceState — no reload), so every developer fixture the builds already have (?h45go=1 … ?h56go=1, ?h42stock,
 * ?h49voy, ?h50test, ?tester=1, #shift=card) works as if the link had said so. The owner, 29.10 18:07–18:12: "אני כן אצטרך להיכנס
 * לכל שלב בעצמי… תעשה את זה הכי פשוט". Never a Divine Name. */
const KEEP56 = /^bh_(settings|mute|haptics|music_vol|avodah_mute|tester44|loc29|fix|fixh|fixclear)$/;
/** this phone's game save cleared (the settings stay) */
export function clearSave56(ls) {
  const ks = []; for (let i = 0; i < ls.length; i++) { const k = ls.key(i); if (k && /^bh_/.test(k) && !KEEP56.test(k)) ks.push(k); }
  ks.forEach((k) => ls.removeItem(k));
}
/** Phase B: every role served once (day 3), so the roles book offers each one's practice (practice31: "any role you have had") */
export function seedB56(ls) {
  const H = 3600e3, now = Date.now(), d = 3;
  const shift = { day33state: { day: d, night: false, at: now - 3 * H, fuel: 64, fed: 25, logs: 0, left: 180, perutot: 12, washed: false, tamD: 'wait', tamE: 'wait', lambs: [true, true, false, false, false, false], tasks: [] },
    roles23: { m: d - 1, h: [[1, 'deshen', 'deshen'], [2, 'm22', 'm22']], kiyor: { n: 2, best: 100, last: 100 }, deshen: { n: 1, best: 90, last: 90 }, m22: { n: 1, best: 85, last: 85 }, menorah: { n: 1, best: 80, last: 80 }, inner: { n: 1, best: 85, last: 85 }, lamb: { n: 1, best: 80, last: 80 }, shochet: { n: 1, best: 90, last: 90 }, zorek: { n: 1, best: 90, last: 90 } },
    roles26: { m: d - 1, h: [[1, 'menorah'], [2, 'inner']] }, perutot: 12, served30: d - 1 };
  ls.setItem('bh_avodah', JSON.stringify({ v: 1, name: 'בודק', mishmar: 5, seenIntro: true, created: now - 9 * 24 * H, lastSeen: now - 3 * H, shift }));
}
(function fix56() {
  const g = globalThis;
  let S = '', H = '';
  try { S = g.location.search || ''; H = g.location.hash || ''; } catch (e) { /* */ }
  // (build.mjs replaces every `location.search` / `location.hash` in the bundle by __QS56 / __QH56: the artifact's frame may refuse
  //  history.replaceState, so the game reads the chosen stage from these, whatever the frame allows)
  g.__QS56 = S; g.__QH56 = H;
  let q = '', h = '';
  try {
    const c = g.localStorage.getItem('bh_fixclear');   // (the menu's choice: clear the save here, at the start — the game saved itself as the page unloaded)
    if (c) { g.localStorage.removeItem('bh_fixclear'); clearSave56(g.localStorage); if (c === 'B') seedB56(g.localStorage); }
    q = g.localStorage.getItem('bh_fix') || '';
    h = g.localStorage.getItem('bh_fixh') || '';
    if (q) g.localStorage.removeItem('bh_fix');
    if (h) g.localStorage.removeItem('bh_fixh');
  } catch (e) { return; }
  if (!q && !h) return;
  const base = S.replace(/^\?/, '').split('&').filter((p) => p && !/^(h\d\dgo|h42stock|h42at|h49voy|h50test|tester)=/.test(p)).join('&');   // (a stage chosen before: its flags out)
  const S2 = [base, q].filter(Boolean).join('&');
  g.__QS56 = S2 ? '?' + S2 : ''; g.__QH56 = h ? '#' + h : H;
  if (/(^|&)tester=1(&|$)/.test(q)) { try { g.localStorage.setItem('bh_tester44', '1'); } catch (e) { /* */ } }   // (hooks/avodah.js reads the real address for it)
  try { g.history.replaceState(g.history.state, '', g.location.pathname + g.__QS56 + g.__QH56); g.__FIX56 = { q, h }; } catch (e) { g.__FIX56 = { q, h, frame: String(e && e.message) }; }
})();
