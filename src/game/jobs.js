/* ─────────────────────────────────────────────────────────────────────────────
 * jobs.js: the course loop (FUN14, wave 14). The owner's daughter, after playing on her phone: "זה ארוך ומשעמם, היא
 * רק בורחת למשחקי הביניים" — three taps a stone, 32 stones a course. Now a course is built by a few JOBS, each a
 * short game of its own gesture: the deal "מה נעשה עכשיו?" offers two cards (one stone card and one craft card:
 * Herod had priests taught as masons and as carpenters, קדמוניות היהודים טו, יא, ב), she picks one, he walks to his
 * work, she plays it (20–30 s), and the job sets its share of the course (S.quickSet), pays coins by its stars
 * (ECON14's S.payJob) and stays in the building (SITE14's stages.jobReveal).
 *
 *   J(G, id, has)              jobs a course: clamp(round(10 / C), 1, 3), at most the deck's size
 *   deal(G, id, has, o)        → { cards: [jobId, jobId?], key: {i, game, what}|null, quarry: bool }  (the rules: D1)
 *   share(G, id, has)          stones the next job sets: ⌈stones left in the course ÷ jobs left⌉
 *   setShare(G, id, upTo, o)   sets stones (quickSet / setKey / an event's strokes / pays a segment) up to `upTo`
 *   playJob(host, id, job)     the whole turn (walk, game, share, pay, reveal) → { job, site, q, stars, coins, … }
 *
 * Pure but for playJob (its host is index.js). Nothing random but the deal (seeded by the save: the same save deals the
 * same cards). No timers, no loss: a skipped job still builds (the crew does it, q 0.8) and pays the skip's coins.
 * ──────────────────────────────────────────────────────────────────────────── */
import * as S from './state.js';
import * as C from './content.js';
import { PROJ, DECKS, keyOf, SIDX } from './content.js';
import * as TL from './tools.js';   // ── tools21 ──

const ALTAR = new Set(['yesod', 'sovev', 'guf', 'karnot']);
/* the registry. kind: the trade's card slot · family: the gesture (the deal never offers two of one family) ·
   game: the key of minigames/index.js GAMES (null: built in) · hand: the card's looping hand · src: the card's line */
export const JOBS = {
  key: { id: 'key', n: 'האבן המיוחדת', kind: 'stone', trade: 'סתתים', family: 'timing', game: null, hand: 'tap' },
  strike: { id: 'strike', n: 'סתת בקצב', kind: 'stone', trade: 'סתתים', family: 'rhythm', game: null, hand: 'tap', secs: 20,
    src: { ref: 'המחשה', illus: true } },
  line: { id: 'line', n: 'החוט הצבוע', kind: 'stone', trade: 'סתתים', family: 'pull', game: 'snap', hand: 'pull',
    src: { ref: 'זכריה א, טז (חוט הצבע: המחשה)' } },
  arch: { id: 'arch', n: 'בניית קשת', kind: 'stone', trade: 'סתתים', family: 'drag', game: 'place', skin: 'arch', hand: 'drag',
    src: { ref: 'ארכאולוגיה; קדמוניות היהודים טו, יא, ה' } },
  F1: { id: 'F1', n: 'השלם את הנדבך', kind: 'stone', trade: 'סתתים', family: 'drag', game: 'course', skin: 'course', hand: 'drag',
    src: { ref: 'ארכאולוגיה: הבנייה ההרודיאנית' } },
  column: { id: 'column', n: 'מקימים עמוד', kind: 'stone', trade: 'סתתים', family: 'pull', game: 'pull', hand: 'pull',
    src: { ref: 'מלחמת היהודים ה, ה, ב (תרגום חופשי)' } },
  tread: { id: 'tread', n: 'המנופאי: גלגל הדריכה', kind: 'stone', trade: 'מנופאים', family: 'hold', game: 'tread', hand: 'hold',
    src: { ref: 'המחשה (ויטרוביוס י, ב)', illus: true } },
  waves: { id: 'waves', n: 'גלי הים', kind: 'stone', trade: 'סתתים', family: 'place', game: 'waves', hand: 'drag',
    src: { ref: 'סוכה נא, ב; בבא בתרא ד, א (הגרירה: המחשה)' } },
  letters: { id: 'letters', n: 'חריטת אותיות', kind: 'stone', trade: 'סתתים', family: 'draw', game: 'draw', skin: 'letters', hand: 'drag', last: true,
    src: { ref: 'מזר 1968; מלחמת היהודים ד, ט, יב' } },
  saw: { id: 'saw', n: 'ניסור קורות ארז', kind: 'craft', trade: 'נגרים', family: 'saw', game: 'saw', hand: 'pull',
    src: { ref: 'עזרא ג, ז (הניסור: המחשה)' } },
  gold: { id: 'gold', n: 'שפשף עד שיבריק', kind: 'craft', trade: 'צורפים', family: 'rub', game: 'cover', skin: 'gold', hand: 'rub',
    src: { ref: 'מדות ד, א' } },
  plaster: { id: 'plaster', n: 'סיד על המזבח', kind: 'craft', trade: 'סיידים', family: 'rub', game: 'cover', skin: 'plaster', hand: 'rub',
    src: { ref: 'מדות ג, ד' } },
  bronze: { id: 'bronze', n: 'נחושת מצהיבה', kind: 'craft', trade: 'נחושתנים', family: 'rub', game: 'cover', skin: 'bronze', hand: 'rub',
    src: { ref: 'מדות ב, ג' } },
  wheel: { id: 'wheel', n: 'הגלגל על הבור', kind: 'craft', trade: 'שואבי מים', family: 'circle', game: 'wheel', hand: 'circle',
    src: { ref: 'מדות ה, ד' } },
  aqueduct: { id: 'aqueduct', n: 'אמת המים', kind: 'craft', trade: 'בוני האמה', family: 'turn', game: 'pipes', hand: 'tap',
    src: { ref: 'יומא לא, א (התוואי: המחשה)' } },
  rafts: { id: 'rafts', n: 'רפסודות הארזים', kind: 'craft', trade: 'נגרים', family: 'steer', game: 'rafts', hand: 'drag',
    src: { ref: 'דברי הימים ב ב, טו; עזרא ג, ז' } },
};
// ── craftb19 ── (FUN19 §3: guf leads with the plumb — "4 courses, each found true"; the owner's note 15: the plumb in his hand, the
// hammer on his belt) the plumb check as a job of its own: game 'plumb' (minigames/plumb.js; in the world: stages.craft.plumb)
Object.assign(JOBS, {
  plumb: { id: 'plumb', n: 'בדיקת האנך', kind: 'stone', trade: 'מודדים', family: 'plumb', game: 'plumb', hand: 'hold',
    src: { ref: 'עמוס ז, ז (האנך: המחשה)', illus: true } },
});
// ── /craftb19 ──
// ── tools21 ── each job names its tool (tools.js JOB_TOOL; a rub or a water craft has none: ×1)
for (const k of Object.keys(JOBS)) JOBS[k].tool = TL.JOB_TOOL[k] || null;
// ── /tools21 ──
/* a job's fact where its site has its own (the result card's line): the kiyor's wheel is Ben Katin's mukhni */
export const SITE_FACT = {
  wheel: { kiyor: { he: 'בן קטין עשה מוכני לכיור: "ואף הוא עשה מוכני לכיור, שלא יהיו מימיו נפסלין בלינה".', ref: 'יומא ג, י', status: 'draft' } },
};
/* at the altar the strike is the wooden mallet: no iron touches its stones (the game's tool there is wood) */
export const MALLET = { n: 'מקבת העץ', src: { ref: 'מדות ג, ד (המקבת: המחשה)' } };
export const jobName = (job, id) => (job === 'strike' && ALTAR.has(id) ? MALLET.n : (JOBS[job] || {}).n || '');
export const jobSrc = (job, id) => (job === 'strike' && ALTAR.has(id) ? MALLET.src : (JOBS[job] || {}).src || null);

/** the stars of a result (D2): a finished job ★, q ≥ .7 ★★, q ≥ .9 ★★★ — never ☆☆☆; a skip 0 */
export const starsOf = (q, skipped = false) => (skipped ? 0 : q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1);
/** coins for a result: ECON14's PAY when it is there, else D2's rule: stars × (level + 2); a skip 3 */
export function coinsFor(stars, level, skipped = false) {
  try { if (C.PAY && typeof C.PAY.coins === 'function') return skipped ? (C.PAY.skip | 0) || 3 : C.PAY.coins(stars, level) | 0; } catch (e) { /* ECON14's */ }
  return skipped ? 3 : stars * ((level | 0) + 2);
}

/* ───────── the save: G.jobs (lazy) ───────── */
export function jobsOf(G) {
  const J0 = G.jobs;
  if (J0 && typeof J0 === 'object' && J0.v === 1) return J0;
  G.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: {}, deals: {}, sig: {}, best: {} };
  return G.jobs;
}
/** a job's level, 1-based (L1–L3): three ★★★ raise it */
export const levelOf = (G, job) => Math.min(3, 1 + ((jobsOf(G).lv[job] | 0)));
export const playsAt = (G, id, job) => jobsOf(G).n[`${id}:${job}`] | 0;

/* ───────── the course ───────── */
const siteOf = (G, id) => (G.st && G.st[id] && !G.st[id].done ? G.st[id] : null);
/** the course being laid at site id (0-based), or −1 outside the courses */
export function courseOf(G, id) {
  const s = siteOf(G, id), P = PROJ[id];
  if (!s || !P || s.p !== 'courses' || s.ready) return -1;
  return Math.min(P.C - 1, Math.floor(s.set / P.P));
}
/** this course's loop state (reset when the course changes) */
export function curOf(G, id) {
  const J0 = jobsOf(G), c = courseOf(G, id);
  let cur = J0.cur[id];
  if (!cur || cur.c !== c) cur = J0.cur[id] = { c, n: 0, key: 0, deal: null, re: 0, line: 0 };
  return cur;
}
/** is the loop on at site id: in the courses of a site with a deck, once the first-time flow has set the first stone and named
    the kohen (ftue 5: "סיתות, סיתות, הנחה" — the strike card is that line; the board that ends the tutorial still comes when
    the mentor's stones run out). Before, the old taps: the great stone by the pill, the crew, the name. */
export const LOOP_FTUE = 5;
export function loopOn(G, id) {
  return !!(G && G.ftue >= LOOP_FTUE && DECKS[id] && courseOf(G, id) >= 0);
}

/* ───────── the deck ───────── */
const builtIn = (job) => job === 'key' || job === 'strike';
/** may job be dealt at site id now (its game has landed; letters only in the stage's last course) */
export function dealable(G, id, job, has) {
  const R = JOBS[job]; if (!R) return false;
  if (!builtIn(job) && !(typeof has === 'function' && has(R.game))) return false;
  if (R.last) { const P = PROJ[id], c = courseOf(G, id); if (!P || c !== P.C - 1) return false; }
  return true;
}
export function deckOf(G, id, has) {
  const D = DECKS[id]; if (!D) return { stone: [], craft: [] };
  return { stone: D.stone.filter((j) => dealable(G, id, j, has)), craft: D.craft.filter((j) => dealable(G, id, j, has)) };
}
/** jobs a course: clamp(round(10 / C), 1, 3), at most the deck's size (D1). Its static deck: the games in the build */
export function J(G, id, has) {
  const P = PROJ[id], D = DECKS[id]; if (!P || !D) return 1;
  const size = [...D.stone, ...D.craft].filter((j) => { const R = JOBS[j]; return R && (builtIn(j) || (typeof has === 'function' && has(R.game))); }).length;
  return Math.max(1, Math.min(3, Math.round(10 / P.C), size));
}
export const jobsLeft = (G, id, has) => Math.max(1, J(G, id, has) - curOf(G, id).n);
/** stones left in the course being laid */
export function leftInCourse(G, id) {
  const s = siteOf(G, id), P = PROJ[id], c = courseOf(G, id);
  return s && c >= 0 ? Math.max(0, Math.min(s.n, (c + 1) * P.P) - s.set) : 0;
}
/** the stones the next job sets: ⌈stones left in the course ÷ jobs left⌉ */
export const share = (G, id, has) => Math.ceil(leftInCourse(G, id) / jobsLeft(G, id, has));
/** the key stone in [from, to) that waits for the player's hands → {i, game, what} | null */
export function keyIn(G, id, from, to) {
  const s = siteOf(G, id); if (!s) return null;
  for (let i = from; i < to && i < s.n; i++) { const k = keyOf(id, i); if (k && s.keys[i] == null) return { i, ...k }; }
  return null;
}
/** the key stone this course deals: the first in the next job's share, once a course (D1: "at most one key stone a course") */
export function keyDue(G, id, has) {
  const s = siteOf(G, id); if (!s || curOf(G, id).key) return null;
  return keyIn(G, id, s.set, s.set + share(G, id, has));
}
/** stones the site can set now: its stock, plus what the meter pays for at once (the materials rule) */
export function stockOf(G, id) {
  const s = siteOf(G, id); if (!s) return 0;
  let n = Math.max(0, s.paid - s.set), paid = s.paid;
  const res = { ...G.res }, cost = S.segCost(id), seg = (PROJ[id] && PROJ[id].S) || C.SEG;
  for (let k = 0; k < 12 && paid < s.n && S.canAfford(res, cost); k++) {
    for (const [r, v] of Object.entries(cost)) res[r] = Math.max(0, (res[r] || 0) - v);
    const add = Math.min(seg, s.n - paid); paid += add; n += add;
  }
  return n;
}

/* ───────── the deal (D1) ───────── */
/** a small seeded random (mulberry32): the same save deals the same cards */
function rnd(seed) {
  let a = (seed >>> 0) || 0x9E3779B9;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = (arr, r) => (arr.length ? arr[Math.floor(r() * arr.length) % arr.length] : null);
const fam = (job) => (JOBS[job] || {}).family;
/**
 * The two cards. Rules (D1): one stone card and one craft card (without a craft in the deck: two gesture families);
 * never the job just played; the course's key stone when it is due (at most once a course); the stage's signature by its
 * second deal; the stock empty and nothing to pay with → one card, "▶ הביאו אבנים" (quarry: true).
 * o: { re: the ↻ count (another pair), seed } → { cards, key, quarry, sig }
 */
export function deal(G, id, has, o = {}) {
  const J0 = jobsOf(G), cur = curOf(G, id);
  if (!DECKS[id] || cur.c < 0) return { cards: [], key: null, quarry: false };
  // ── flow16 ── the balance (the owner, 4.10: "הדמות לא עושה כלום"): his own work never waits for stock — the deal is dealt
  // whatever the stock, and an empty stock adds one card, "▶ הביאו אבנים" (the crews' stones). In the first-time flow the
  // board is still the lesson: there the empty stock deals the quarry alone, as before.
  if (stockOf(G, id) <= 0 && !freeHands(G)) return { cards: [], key: null, quarry: true };
  // ── /flow16 ──
  const last = J0.last[id] || null, dk = deckOf(G, id, has), D = DECKS[id];
  const r = rnd((o.seed != null ? o.seed : ((SIDX[id] | 0) + 1) * 7919) + (J0.deals[id] | 0) * 104729 + (o.re | 0) * 1299709 + cur.c * 31);
  const avoid = new Set([last, ...(o.re ? (o.prev || []) : [])].filter(Boolean));
  // the course's key stone, when due: its card in the stage's first two deals and at every even course; at an odd course the
  // stone card is another job and the crane sets the key stone (0.8) — so the House's one-job courses deal the strike and the
  // treadwheel too, not only key stones
  const keyAll = keyDue(G, id, has), others = dk.stone.filter((j) => j !== 'key' && j !== last);
  const key = keyAll && ((J0.deals[id] | 0) < 2 || cur.c % 2 === 0 || !others.length) ? keyAll : null;
  let stone = dk.stone.filter((j) => j !== 'key' && !avoid.has(j));
  if (!stone.length) stone = dk.stone.filter((j) => j !== 'key' && j !== last);
  let craft = dk.craft.filter((j) => !avoid.has(j));
  if (!craft.length) craft = dk.craft.filter((j) => j !== last);
  const sigDue = D.sig && !J0.sig[id] && (J0.deals[id] | 0) < 2 && dealable(G, id, D.sig, has) && D.sig !== last ? D.sig : null;
  let a = key ? 'key' : null, b = null;
  if (sigDue) {
    if (JOBS[sigDue].kind === 'craft') b = sigDue;
    else if (!a) a = sigDue;
    else b = sigDue;                                   // (the key holds the stone slot: the signature takes the other, two families)
  }
  if (!a) a = pick(stone.filter((j) => j !== b), r) || (key ? 'key' : null);
  if (!b) {
    const cr = craft.filter((j) => j !== a);
    if (cr.length) b = pick(cr, r);
    else {
      const other = stone.filter((j) => j !== a && fam(j) !== fam(a));
      b = pick(other, r) || pick(stone.filter((j) => j !== a), r);
    }
  }
  let cards = [a, b].filter(Boolean).filter((j, k, arr) => arr.indexOf(j) === k);
  if (!cards.length) { const any = [...dk.stone.filter((j) => j !== 'key'), ...dk.craft]; if (any.length) cards = [pick(any, r)]; }   // (a tiny deck: the last job again, rather than none)
  if (cards.length === 1) {   // (a deck with no second stone card — the kiyor's — deals two crafts of two gestures)
    const pool = [...stone, ...craft].filter((j) => j !== 'key' && !cards.includes(j));
    const extra = pick(pool.filter((j) => fam(j) !== fam(cards[0])), r) || pick(pool, r);
    if (extra) cards.push(extra);
  }
  return { cards, key: cards.includes('key') ? key : null, keyPass: !!keyAll && !cards.includes('key'), quarry: stockOf(G, id) <= 0, sig: sigDue && cards.includes(sigDue) ? sigDue : null };   // ── flow16 ── (quarry: the extra card)
}
// ── flow16 ── the balance: once the first-time flow is over (its board is the lesson) the kohen's own hands never wait for the stock
export const freeHands = (G) => !!(G && G.ftue >= 99);
export const HAND_MAX = 4;   // his hand-dressed stones a job when the stock is out: he always moves, the course still needs the quarry
/** the stones the crews still need for this course (the extra card's "כ־N אבנים"): the course's rest beyond his next share, ≥ 5, by 5s */
export function crewsNeed(G, id, has) {
  const left = leftInCourse(G, id), mine = share(G, id, has);
  return Math.max(5, Math.round(Math.max(left - mine, left * 0.5) / 5) * 5);
}
// ── /flow16 ──
/** the deal on the table at site id (kept until a card is played or ↻): deals it when there is none */
export function dealNow(G, id, has, o = {}) {
  const cur = curOf(G, id), J0 = jobsOf(G);
  // (the cards stay under her finger while the crews set stones: a new pair only after a job, a new course, ↻, or the stock's turn)
  const out = stockOf(G, id) <= 0;
  // ── flow16 ── (the stock's turn only flips the extra card; the cards stay)
  if (freeHands(G) && cur.deal && cur.deal.cards && cur.deal.cards.length && !o.re) { if (cur.deal.quarry !== out) cur.deal.quarry = out; return cur.deal; }
  // ── /flow16 ──
  const stale = !cur.deal || cur.deal.quarry !== out || (freeHands(G) && !(cur.deal.cards && cur.deal.cards.length));   // ── flow16 ── (a v28 save's quarry-only deal: dealt again)
  if (!stale && !o.re) return cur.deal;
  if (o.re) cur.re = (cur.re | 0) + 1; else cur.re = 0;   // (one ↻ a deal)
  const d = deal(G, id, has, { re: o.re ? cur.re : 0, prev: cur.deal && cur.deal.cards });
  if (!o.re) J0.deals[id] = (J0.deals[id] | 0) + (d.cards.length ? 1 : 0);
  if (d.sig) J0.sig[id] = 1;
  if (d.key || d.keyPass) cur.key = 1;   // (dealt — or passed to the crane: if she picks another card, the crane sets it at 0.8)
  cur.deal = { ...d, set: G.st[id] ? G.st[id].set : 0, t: (J0.deals[id] | 0) };
  return cur.deal;
}
/** "חדש!": a job not yet played at this site */
export const isNew = (G, id, job) => !playsAt(G, id, job);

/* ───────── the share ───────── */
/**
 * Set stones at site id until `upTo` stones are set (the course's end at most): a stone by quickSet, a key stone by setKey
 * (the key card's own result at o.keyAt, else the crane's 0.8), an event or a reset by perfect strokes, a segment paid
 * from the meter when it can (the materials rule). Stops at anything else (the course check, an unpaid segment, the
 * moment). → one merged out (as S.stroke's) + { blocked, first } for the host's strokeOutcome
 */
export function setShare(G, id, upTo, o = {}) {
  const s = siteOf(G, id), P = PROJ[id];
  const out = { ok: false, id, stones: [], course: 0, phase: null, event: null, reset: null, reached: null, blocked: null, paid: 0, keyQ: null, first: null, q: null };
  if (!s || !P) return out;
  const end = Math.min(s.n, upTo, (Math.floor(s.set / P.P) + 1) * P.P);
  for (let g = 0; g < 400 && s.set < end && !out.reached; g++) {
    const j = S.jobOf(G, id); if (!j) break;
    let r = null;
    if (j.kind === 'stone') r = S.quickSet(G, id);
    else if (j.kind === 'key') {
      const mine = o.keyAt != null && j.i === o.keyAt;
      r = S.setKey(G, id, mine ? o.keyR || { quality: 0.8 } : { quality: 0.8 });
      if (mine) out.keyQ = r.q;
    } else if (j.kind === 'event' || j.kind === 'reset') {
      for (let k = 0; k < 4; k++) { r = S.stroke(G, id, true); if (!r.ok || r.done) break; }
    } else if (j.kind === 'pay' && j.step === 'seg' && S.canAfford(G.res, j.cost)) {
      const p = S.payStep(G, id); if (!p.ok) { out.blocked = 'pay'; break; }
      out.paid += p.step && p.step.stones ? p.step.stones : 0;
      continue;
    } else if (j.kind === 'pay' && j.step === 'seg' && o.hands && (out.hand | 0) < HAND_MAX) {
      // ── flow16 ── the balance: his own stones, dressed by his hands on his banker, pay nothing — one at a time, at most HAND_MAX a
      //  job (the owner: "אם נבטל לגמרי את השער… נהיה בבעיה מהצד השני"); the rest of the course is the crews', from the stock
      s.paid = Math.min(s.n, s.paid + 1); s.hand = (s.hand | 0) + 1; out.hand = (out.hand | 0) + 1;
      continue;
      // ── /flow16 ──
    } else { out.blocked = j.kind; break; }
    if (!r || !r.ok) { out.blocked = out.blocked || j.kind; break; }
    if (!out.first) out.first = j;
    out.ok = true;
    out.stones.push(...(r.stones || []));
    if (r.course) out.course = r.course;
    if (r.phase) out.phase = r.phase;
    if (r.event) out.event = r.event;
    if (r.reset != null && r.reset >= 0) out.reset = r.reset;
    if (r.reached) out.reached = r.reached;
    if (r.q != null) out.q = r.q;
  }
  return out;
}

/** after a job: its count in the course, its plays, its level (three ★★★ in a row raise it), the last job here */
export function noteJob(G, id, job, stars, q) {
  const J0 = jobsOf(G), cur = curOf(G, id), k = `${id}:${job}`;
  J0.n[k] = (J0.n[k] | 0) + 1;
  J0.last[id] = job;
  J0.best[job] = Math.max(+J0.best[job] || 0, Math.round((+q || 0) * 100) / 100);
  if (stars >= 3) { J0.s3[job] = (J0.s3[job] | 0) + 1; if (J0.s3[job] >= 3 && (J0.lv[job] | 0) < 2) { J0.lv[job] = (J0.lv[job] | 0) + 1; J0.s3[job] = 0; return { up: levelOf(G, job) }; } }
  else J0.s3[job] = 0;
  return { up: 0, cur };
}

/* ───────── the turn (the host is index.js) ───────── */
/**
 * playJob(host, id, job) — the whole turn: the course's count, the walk, the game, the share, the pay, the reveal.
 * host: { G(), has(game), run(game, ctx) → Promise<r>, key(id, k) → Promise<r>, strike(id) → Promise<r>, walk(id, job) → Promise,
 *         outcome(id, out, perfect), pay(id, job, info) → coins, reveal(id, job, q, o), emit(type, d), persist() }
 * → { job, site, q, stars, coins, skipped, stones, up }
 */
export async function playJob(host, id, job) {
  const G = host.G(), R = JOBS[job];
  if (!R || !loopOn(G, id)) return null;
  const cur = curOf(G, id), s = G.st[id], P = PROJ[id];
  const has = host.has;
  const sh = share(G, id, has), set0 = s.set;
  const upTo = Math.min(s.n, set0 + sh);
  const key = job === 'key' ? keyIn(G, id, set0, upTo) || keyIn(G, id, set0, (cur.c + 1) * P.P) : null;
  const level = levelOf(G, job), n = playsAt(G, id, job);
  host.emit('jobStart', { job, site: id, c: cur.c, share: sh, level, n });
  TL.use(TL.jobTool(job, ALTAR.has(id)), { job: `${id}:${job}:${n}` });   // ── tools21 ── (his tool for this job: its tier pays the acts; the float says it once)
  cur.deal = null;
  let r = null;
  try {
    const walk = host.walk(id, job);                      // he walks to his work while the sheet rises
    if (job === 'key') r = key ? await host.key(id, key) : null;
    else if (job === 'strike') { await walk; r = await host.strike(id, { level }); }
    else r = await host.run(R.game, { site: id, skin: R.skin, level: level - 1, n, job });
  } catch (e) { r = null; }
  if (!r || typeof r !== 'object') r = { quality: 0.8, perfect: false, skipped: true };
  const G2 = host.G();
  if (G2 !== G || !siteOf(G2, id)) return null;           // (a new game, a demo switch: the turn is gone)
  const skipped = !!r.skipped, q = Math.max(0, Math.min(1, Number.isFinite(+r.quality) ? +r.quality : 0.8));
  const stars = starsOf(q, skipped);
  // the share: what the crews and her strikes set meanwhile counts in (D1)
  const want = Math.max(upTo, key ? key.i + 1 : 0);
  const out = setShare(G, id, want, { hands: freeHands(G), ...(key ? { keyAt: key.i, keyR: { quality: q, perfect: !!r.perfect } } : {}) });   // ── flow16 ── (hands: his stones never wait for the stock)
  curOf(G, id);                                           // (a course closed by this job: the next one starts clean)
  const c2 = jobsOf(G).cur[id];
  if (c2 && c2.c === cur.c) c2.n++;
  const note = noteJob(G, id, job, stars, q);
  let coins = 0;
  try { coins = host.pay(id, job, { level, q, stars, skipped, perfect: !!r.perfect }) | 0; } catch (e) { coins = 0; }
  // (the reveal first: its camera beat holds the frame, then a course this job closed gets its own beat after it)
  try { host.reveal(id, job, q, { site: id, n: n + 1, course: cur.c }); } catch (e) { /* SITE14's */ }
  host.outcome(id, out, !!r.perfect, key);
  const res = { job, site: id, q, stars, coins, skipped, stones: out.stones.length, up: note.up, course: out.course, blocked: out.blocked, world: r.world || null, fact: r.fact || null };   // ── flow16 ── (world: the craft played in the world — the work's screen point for the float; fact: its line)
  host.emit('jobDone', { ...res, kind: R.kind, c: cur.c, n: n + 1 });
  TL.release();   // ── tools21 ──
  host.persist();
  return res;
}
