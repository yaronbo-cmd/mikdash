// ── fable32 (build 36) ── lvl36sim.mjs — the mastery levels measured in node (no browser): every built role's act played in a practice run
// (the day engine, test/rig33.mjs) by the autoplayer's two hands — "child" (tools/autoplay35.js's human: slower, misjudges sometimes) and
// "skilled" (plays near the gold moment: a skilled human's small timing and aim errors) — at a level, many seeds; the מהודר share per
// role, profile and level (svivat-avoda-he.md §4.5: level 1, the child 60–80 %; level 4, the skilled 20–40 %).
//   node tools/lvl36sim.mjs [--n 60] [--roles a,b] [--levels 1,4] [--profiles child,skilled] [--json out.json]
// The hands' models are the same as tools/autoplay35.js's (child) and its skilled profile (build 36); a direct call of the engine's
// surface stands for the pads (as the browser bot does without a pad). Never a Divine Name.
import { rig, FLAGS, seeded } from '../test/rig33.mjs';
import { practiceSave31 } from '../src/avodah/shift/practice31.js';
import { D21, M22, P25, P26, P27 } from '../src/avodah/shift/day33.js';
import '../src/avodah/shift/focus17.js';   // (every act's module: their sources register)

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] != null ? args[i + 1] : d; };
if (opt('--p', null)) globalThis.__LV36P = JSON.parse(opt('--p', '{}'));   // ── fable32 (build 37) ── (--p '{"lamb":{"4":{"sz":0.5}}}': a level's knobs tried — lvl36.js par36) ── /fable32 ──
const N = +opt('--n', 60), ROLES = opt('--roles', 'kiyor,deshen,m22,lamb,inner,menorah,shochet,zorek').split(','), LEVELS = opt('--levels', '1,2,3,4').split(',').map(Number), PROFILES = opt('--profiles', 'child,skilled').split(',');
const SAVE = () => ({ served30: 5, roles23: { m: 6, h: [], kiyor: { n: 6, best: 100, last: 75 }, deshen: { n: 2, best: 100, last: 100 }, m22: { n: 2, best: 80, last: 80 }, lamb: { n: 2, best: 100, last: 45 }, menorah: { n: 2, best: 90, last: 90 }, inner: { n: 1, best: 95, last: 95 }, shochet: { n: 1, best: 100, last: 100 }, zorek: { n: 1, best: 88, last: 88 } }, roles26: { m: 6, h: [] } });
// a gaussian from the bot's own rng
const gauss = (rnd) => { let u = 0, v = 0; while (u === 0) u = rnd(); v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

/** the hands (HAND.child mirrors autoplay35.js's H(); HAND.skilled its build-36 skilled profile) */
export const HAND = {
  child: { k20h: [0.3, 0.4], balK: [2.2, 2], balFF: 0.4, balNoise: 0.3, balDt: 0.09, lat: 0.2, swBad: 0.12, side: 0.15, sortWrong: [0.08, 0.1], stackAim: 1.4, miss: [0.06, 0.18], mimicStamp: 0.25, dirtSay: 0.3, pull: { fast: 0.15, fastNo: 0.2, v: [1.4, 0.5] }, pour: 'child', bindShort: 0.18, bindDir: 0.15, cut: 'child', recvLag: 0.65, recvNoise: 0.08, throwP: 0.18, throwA: 'child', swirlRest: 0.01, exactR: 1.2 },
  skilled: { k20h: [0.03, 0.05], balK: [3.2, 0], balFF: 0.9, balNoise: 0.08, balDt: 0.05, lat: 0.1, swBad: 0.02, side: 0.02, sortWrong: [0.01, 0.02], stackSd: 0.012, miss: [0.01, 0.1], mimicStamp: 0.06, dirtSay: 0.05, pull: { sd: [0.22, 0.28], v: 1.55 }, pour: 'skilled', pourT: 0.045, bindShort: 0.02, bindDir: 0.03, cut: 'skilled', cutT: 0.03, recvLag: 0.92, recvNoise: 0.02, throwP: 0.05, throwA: 'skilled', aSd: 1.0, swirlRest: 0.002, exactR: 0.4 },
};

async function settle(R) { await R.step(0.5); }
// ── fable32 (build 37) ── one balance hand for every balance act (the ashes' pan, the laver's stream at level 4, the teni), the same
// lines in tools/autoplay35.js: the tilt as seen a reaction ago (lat: the child 0.2 s, the skilled 0.1 s — read between his looks,
// interpolated), its rate over a fixed 0.1 s less his own counter of then (the push he feels: the wind and the shake), a child's eye
// rough (±0.15) and his gain gentler (1.74; the skilled 3.2, the push fed forward 0.9). Build 36 took the rate over one look: in the
// page the looks come 0.05 or 0.1 s apart (the frames and the bot's timer beat), and that jitter became a ±1 counter that rocked the
// pan — the browser's skilled hand 0/10 at the ashes' level 4 where node made 30 %. ── /fable32 ──
export function hand37(T, b, child, rnd, mem) {
  const lat = child ? 0.2 : 0.1, W = 0.1, fix = 2.4, h = mem.h || (mem.h = []), us = mem.us || (mem.us = []);
  h.push([T, b]);
  while (h.length > 3 && h[1][0] <= T - lat - W - 0.1) h.shift();
  while (us.length > 2 && us[1][0] <= T - lat - W - 0.1) us.shift();
  const bAt = (t) => { let i = h.length - 1; while (i > 0 && h[i][0] > t) i--; const p = h[i], q = h[i + 1]; return q && q[0] > p[0] && t > p[0] ? p[1] + (q[1] - p[1]) * Math.min(1, (t - p[0]) / (q[0] - p[0])) : p[1]; };
  const uAt = (t) => { let i = us.length - 1; while (i >= 0 && us[i][0] > t) i--; return i >= 0 ? us[i][1] : 0; };
  const s1 = bAt(T - lat), s0 = bAt(T - lat - W), d = (s1 - s0) / W - uAt(T - lat - W / 2) * fix;
  const seen = s1 + (child ? (rnd() - 0.5) * 0.3 : (rnd() - 0.5) * 0.08), k = child ? 1.74 : 3.2, ff = child ? 0.4 : 0.9;
  const u = Math.max(-1, Math.min(1, -seen * k - (ff * d) / fix));
  us.push([T, u]);
  return u;
}
// the look's interval: the page's (as measured in the browser, build 37: a skilled hand every frame, 0.05 s, one in eight 0.1; a child every other, 0.1, one in ten 0.05)
export const look37 = (child, rnd) => { const r = rnd(); return child ? (r < 0.1 ? 0.05 : 0.1) : r < 0.12 ? 0.1 : 0.05; };
function balance(K, H, rnd, mem, setU) { setU(hand37(K.bT != null ? K.bT : K.T, K.b, H === HAND.child, rnd, mem)); }
// ── fable32 (build 37) ── the eye's model (the lamb): a spot is missed by its drawn size — pen25's k (the region's scale × 0.62 if small
// × the level's sz) — and a little more when the lamb shows more spots (attention): one logistic in the size for both hands (the same
// slope; the child's half-seen size larger), set by build 36's guesses — the skilled 1 % a hoof's plain spot, 10 % a small one; the
// child 6 % the plain one. The sizes are the game's; the curve is a guess — no eyes. tools/autoplay35.js carries the same numbers. ── /fable32 ──
export const EYE37 = { child: { k50: 0.099, w: 0.0367 }, skilled: { k50: 0.031, w: 0.0367 }, att: 0.15 };
export function miss37(s, L, prof) {
  const k = (L.big ? 1.45 : 1) * (s.r < 4 ? 0.17 : s.r < 6 ? 0.2 : 0.26) * (s.small ? 0.62 : 1) * (s.sz || 1), e = EYE37[prof], n = (L.spots || []).length;
  return Math.min(0.9, (1 / (1 + Math.exp((k - e.k50) / e.w))) * (1 + EYE37.att * Math.max(0, n - 1)));
}
const PLAY = {
  async kiyor(R, H, L, rnd) {
    await settle(R);
    for (let i = 0; i < 40 && R.E.k20().ph !== 'pose'; i++) await R.step(0.1);
    R.E.k20in('L', true); R.E.k20in('R', true);
    // (a thumb lifted once now and then — autoplay35's child: 30 % of the washes with the ring's guide; without it, and the longer the
    // water runs, more: 1 − (1 − p)^(T / 3.5 s))
    const K0 = R.E.k20(), guide = !!(K0.P36 && K0.P36.guide), p0 = H.k20h[guide ? 0 : 1], pL = 1 - Math.pow(1 - p0, K0.T / 3.5), mem = {};
    let lifted = rnd() < pL ? 0 : 1, liftAt = rnd() * K0.T * 0.8, tBal = 0, tt = 0;
    for (let i = 0; i < 400 && R.E.k20() && R.E.k20().ph === 'pose'; i++) {
      const K = R.E.k20();
      tt += 0.05;
      if (!lifted && tt >= liftAt) { lifted = 1; R.E.k20in('R', false); await R.step(0.4); R.E.k20in('R', true); }
      if (K.P36 && K.P36.bal && (tBal += 0.05) >= (mem.nx || H.balDt) - 1e-6) { tBal = 0; mem.nx = look37(H === HAND.child, rnd); balance(K, H, rnd, mem, (u) => R.E.k20bal(u)); }   // ── fable32 (build 37) ── (the page's look intervals) ── /fable32 ──
      await R.step(0.05, 0.05);
    }
  },
  async deshen(R, H, L, rnd) {
    await settle(R);
    for (let i = 0; i < 40 && R.E.d21() && R.E.d21().ph === 'sweep'; i++) {
      const K = R.E.d21(), want = K.side ? K.side[Math.min(K.n, K.side.length - 1)] : 1, dir = K.side && rnd() < H.side ? -want : want;
      if (rnd() < H.swBad) R.E.d21swipe(0.15 * dir, 0.04, 120); else R.E.d21swipe((0.55 + rnd() * 0.2) * dir, 0.04, 100);
      await R.step(0.3);
    }
    await R.step(1); const mem = {};
    for (let i = 0; i < 2000 && R.E.d21() && R.E.d21().ph !== 'foot'; i++) {
      const K = R.E.d21();
      if (K.ph === 'walk' || K.ph === 'desc') {
        balance(K, H, rnd, mem, (u) => R.E.d21bal(u));
        R.E.d21stick(H === HAND.child ? (Math.abs(K.b) > 0.55 ? 0.5 : 0.75 + rnd() * 0.25) : Math.abs(K.b) > 0.4 ? 0.55 : 1);
      }
      await R.step(look37(H === HAND.child, rnd), 0.05);   // ── fable32 (build 37) ── (the page's look intervals — was H.balDt, even) ── /fable32 ──
    }
    // the walk to the heap's gold mark: he stops within his radius (a skilled hand nearer), somewhere round it
    const g = D21.go[2], a = rnd() * 2 * Math.PI, r = H.exactR * Math.sqrt(rnd());
    R.at(g[0] + r * Math.cos(a), g[1] + r * Math.sin(a)); await R.step(0.2); R.E.d21tap(); await R.step(D21.pour + 0.6);
  },
  async m22(R, H, L, rnd) {
    await settle(R);
    for (let i = 0; i < 400 && R.E.m22() && ['in', 'sort'].includes(R.E.m22().ph); i++) {
      const K = R.E.m22();
      if (K.ph === 'sort' && K.ls === 'on') { const wrong = rnd() < H.sortWrong[L >= 2 ? 1 : 0], take = wrong ? !K.cur.ok : !!K.cur.ok; R.E.m22swipe(take ? 0.5 : -0.5, 0, 100); }
      await R.step(0.1);
    }
    await R.step(1.2); R.at(M22.stand.x, M22.stand.z, 25); await R.step(1.0);
    const dFor = (air, r) => (2 * r * (1 + air)) / (1 - air);
    for (let guard = 0; guard < 60 && R.E.m22() && R.E.m22().ph === 'stack'; guard++) {
      const K = R.E.m22(), layer = K.layer, size = layer === 4 ? 'M' : 'LMS'[layer - 1], r = M22.r[size];
      const i1 = K.got.findIndex((g) => g.size === size && !g.at && (layer === 4 ? g.s2 : !g.s2));
      if (i1 < 0) { await R.step(0.1); continue; }
      const laid = K.got.filter((g) => g.at && g.at.ly === layer);
      if (!laid.length) { R.E.m22place(i1, -0.6); await R.step(0.15); continue; }
      const band = R.E.band22(), mid = (band[0] + band[1]) / 2,
        aim = H === HAND.child ? mid + (rnd() - 0.5) * (band[1] - band[0]) * H.stackAim : mid + gauss(rnd) * H.stackSd;
      R.E.m22place(i1, laid[0].at.x + dFor(Math.max(0.01, Math.min(0.95, aim)), r));
      await R.step(0.15);
    }
    for (let i = 0; i < 30 && R.E.m22() && R.E.m22().ph !== 'ready'; i++) await R.step(0.1);
    R.E.m22tap(); await R.step(M22.ign + 0.3);
  },
  async lamb(R, H, L, rnd) {
    await settle(R);
    for (let n = 0; n < 600 && R.E.p25() && !/^(lead|end)$/.test(R.E.p25().ph); n++) {
      const K = R.E.p25();
      if (K.ph === 'scan') {
        const spots = (K.L && K.L.spots) || [], next = spots.find((s) => !s.seen && !s.gone && !(s.skip36 = s.skip36 != null ? s.skip36 : rnd() < miss37(s, K.L, H === HAND.child ? 'child' : 'skilled')));   // ── fable32 (build 37) ── (the eye by the spot's drawn size — was H.miss: 6 % / 18 %, 1 % / 10 %) ── /fable32 ──
        if (next) { R.E.p25focus(next.i); R.E.p25tap(); await R.step(0.1); continue; }
        const blem = spots.some((s) => s.kind === 'blem' && s.seen && (!K.P36 || !K.P36.mimic || s.shown36)), dirt = spots.some((s) => s.kind === 'dirt' && !s.gone);
        const say = blem || (dirt && rnd() < H.dirtSay) ? 'pasul' : 'tamim';
        if (!R.E.p25stamp(say)) R.E.p25stamp('tamim'); await R.step(0.2); continue;
      }
      if (K.ph === 'dirt') {
        const sp = K.L.spots[K.zi];
        // (level 3: up close a blemish and dirt look alike — a hand that does not brush says "פסול" at once now and then)
        if (K.P36 && K.P36.mimic && rnd() < H.mimicStamp) { R.E.p25stamp('pasul'); await R.step(0.2); continue; }
        R.E.p25swipe(0.5, 0.02, 100); if (sp && sp.kind === 'blem') sp.shown36 = 1; await R.step(0.2); continue;
      }
      if (K.ph === 'blem') { const sp = K.L.spots[K.zi]; if (sp) sp.shown36 = 1; await R.step(H === HAND.child ? 0.5 : 0.15); R.E.p25tap(); await R.step(0.1); continue; }
      if (K.ph === 'wait') { R.E.p25tap(); await R.step(0.2); continue; }
      await R.step(0.1);
    }
  },
  async gate(R) { await R.step(0.6); R.E.r26swipe(0.5, 0, 100); R.E.r26hold(true); await R.step(P26.key + 0.2); R.E.r26hold(false); await R.step(P26.opn + 0.2); },
  async inner(R, H, L, rnd) {
    await PLAY.gate(R); const a = P26.alt; R.at(a.x + 1, a.z); await R.step(1.2);
    for (let i = 0; i < 30 && R.E.r26() && R.E.r26().ph === 'pull'; i++) {
      const K = R.E.r26(), guide = !!(K.P36 && K.P36.guide);
      const v = H === HAND.child ? (rnd() < (guide ? H.pull.fast : H.pull.fastNo) ? 2.8 : H.pull.v[0] + rnd() * H.pull.v[1]) : H.pull.v + gauss(rnd) * H.pull.sd[guide ? 0 : 1];
      R.E.r26pull(v); await R.step(H === HAND.child ? 0.7 : 0.35);
    }
    const mem = {}; let tb = 0;
    for (let i = 0; i < 400 && R.E.r26() && R.E.r26().ph !== 'out'; i++) {
      const K = R.E.r26();
      if (K.ph === 'teni36' && (tb += 0.05) >= (mem.nx || H.balDt) - 1e-6) { tb = 0; mem.nx = look37(H === HAND.child, rnd); balance(K, H, rnd, mem, (u) => R.E.r26bal(u)); }   // ── fable32 (build 37) ── ── /fable32 ──
      await R.step(0.05, 0.05);
    }
  },
  async menorah(R, H, L, rnd) {
    await PLAY.gate(R); const a = P26.walkM; R.at(a.x + 1, a.z); await R.step(1.2);
    let want = 0.95, rel = null;
    for (let i = 0; i < 12000 && R.E.r26() && !['out'].includes(R.E.r26().ph); i++) {
      const K = R.E.r26(), P = K.P36 || { lo: 0.9, hi: 1 };
      if (K.ph === 'wick') { if (rnd() < H.swBad) R.E.r26swipe(0.02, -0.15, 100); else R.E.r26swipe(0, -0.5, 100); await R.step(0.25); continue; }
      if (K.ph === 'wipe') { if (rnd() < H.swBad) R.E.r26swipe(0.15, 0, 100); else R.E.r26swipe(0.5, 0, 100); await R.step(0.25); continue; }
      if (K.ph === 'pour' && !K.held) {
        // a child aims as he always did (0.86 … 1.0+, by eye — the band's width unread); the skilled at the band's middle, released a
        // little early or late (his timing's spread × the slow fill's pace)
        want = H.pour === 'child' ? 0.86 + rnd() * 0.14 + rnd() * rnd() * 0.08 : (P.lo + P.hi) / 2 + gauss(rnd) * H.pourT * P26.pour.r1;
        R.E.r26hold(true); await R.step(0.01, 0.01); continue;
      }
      if (K.ph === 'pour' && K.held) { if (K.fill >= want) R.E.r26hold(false); await R.step(0.01, 0.01); continue; }
      if (K.ph === 'new' || K.ph === 'kuz') { R.E.r26tap(); await R.step(0.2); continue; }
      if (K.ph === 'drag') { R.E.r26light(); await R.step(0.2); continue; }
      if (K.ph === 'altar') { R.E.r26light('altar'); await R.step(0.2); continue; }
      await R.step(0.05);
    }
  },
  async shochet(R, H, L, rnd) {
    await settle(R);
    for (let i = 0; i < 10 && R.E.r27() && R.E.r27().ph === 'bind'; i++) {
      const K = R.E.r27(), bad = rnd() < H.bindShort || (K.P36 && K.P36.turn && rnd() < H.bindDir);
      R.E.r27bind(!bad); await R.step(bad ? 0.4 : P27.bound + 0.1);
    }
    for (let i = 0; i < 200 && R.E.r27() && R.E.r27().ph !== 'cut'; i++) await R.step(0.1);
    for (let tries = 0; tries < 40 && R.E.r27() && R.E.r27().ph === "cut"; tries++) {
      // the moment: the child's aim off by up to ±0.15 now and then (autoplay35's); the skilled taps at the middle with a human timing spread
      const K = R.E.r27(), err = H.cut === 'child' ? (rnd() < 0.3 ? (rnd() - 0.5) * 0.3 : (rnd() - 0.5) * 0.08) : (gauss(rnd) * H.cutT) / K.sweep;
      const want = Math.max(0.02, Math.min(0.98, 0.5 + err));
      for (let j = 0; j < 800; j++) { const k = R.E.r27(); if (!k || k.ph !== 'cut') break; if (Math.abs(k.u - want) < 0.006) break; await R.step(0.004, 0.004); }
      R.E.r27tap(); await R.step(0.3);
    }
    await R.step(P27.cutd + 0.2);
  },
  async zorek(R, H, L, rnd) {
    await settle(R);
    for (let i = 0; i < 300 && R.E.r27().ph !== 'recv'; i++) await R.step(0.1);
    for (let i = 0; i < 600 && R.E.r27() && R.E.r27().ph === 'recv'; i++) { const K = R.E.r27(); R.E.r27move((K.sp - K.pos) * H.recvLag + (rnd() - 0.5) * 2 * H.recvNoise); await R.step(H === HAND.child ? 0.06 : 0.035, H === HAND.child ? 0.06 : 0.035); }
    let rest = 0;
    const swirl = async (s) => { for (let t = 0; t < s; t += 0.05) { if (rest <= 0 && rnd() < H.swirlRest) rest = 1.5 + rnd() * 2.5; if (rest > 0) rest -= 0.05; else R.E.r27swirl((H === HAND.child ? 5.5 : 7) * 0.05); await R.step(0.05, 0.05); } };
    await swirl(P27.full + 0.1);
    for (let i = 0; i < 300 && !(R.E.men5t() != null && R.E.st33.t > R.E.men5t()); i++) await swirl(0.1);
    // the walks to the corners: the swirl goes on (a few seconds' carry)
    await swirl(2.5); R.at(P27.at.NE.x, P27.at.NE.z); await swirl(0.6);
    for (const c of ['NE', 'SW']) {
      for (let tries = 0; tries < 30; tries++) {
        const K = R.E.r27(); if (!K || !/^aim2?$/.test(K.ph)) break;
        if (K.clot) { await swirl(1.5); continue; }
        const p = H.throwA === 'child' ? 0.35 + (rnd() - 0.5) * 0.36 : 0.33 + gauss(rnd) * H.throwP, a = H.throwA === 'child' ? (rnd() < 0.5 ? (rnd() - 0.5) * 6 : (rnd() - 0.5) * 26) : gauss(rnd) * H.aSd;
        R.E.r27throw(p, a); await swirl(0.2);
      }
      await swirl(P27.splash + 0.1);
      if (c === 'NE') { await swirl(2.5); R.at(P27.at.SW.x, P27.at.SW.z); await swirl(0.5); }
    }
    R.E.r27swipe(0, 0.4, 150); await R.step(P27.poured + 0.2);
  },
};
export async function run1(role, L, prof, seed) {
  const H = HAND[prof], rnd = seeded(9000 + seed * 31 + L * 7 + (prof === 'skilled' ? 5 : 0));
  const R = rig(FLAGS, { save: practiceSave31(SAVE()), practice: { role, day: 7, fed: 44, seed: 4242 + seed * 17 }, rng: seeded(11 + seed * 13), lv36: L });
  let out = null; R.E.on17((ev) => { if (ev.type === 'rate30' && ev.id === role && !out) out = { rating: ev.rating, q: ev.q }; });
  R.E.start(); if (role === 'deshen') R.H.y = 25; await R.step(0.3);
  await PLAY[role](R, H, L, rnd);
  for (let i = 0; i < 60 && !out; i++) await R.step(0.2);
  if (!out) { const K = R.E.r27 && R.E.r27(); globalThis.__last36 = K ? { ph: K.ph, clot: K.clot, coag: K.coag, gifts: K.gifts, retries: K.retries, t: K.t } : null; }
  return out || { rating: "stuck", q: 0 };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const table = {};
  for (const role of ROLES) for (const prof of PROFILES) for (const L of LEVELS) {
    let h = 0, k = 0, t = 0, s = 0, qs = 0;
    for (let i = 0; i < N; i++) { const r = await run1(role, L, prof, i); if (r.rating === 'mehudar') h++; else if (r.rating === 'kasher') k++; else if (r.rating === 'tikkun') t++; else s++; qs += r.q || 0; }
    const row = { role, prof, L, n: N, mehudar: +(h / N).toFixed(3), kasher: +(k / N).toFixed(3), tikkun: +(t / N).toFixed(3), stuck: s, q: +(qs / N).toFixed(3) };
    (table[role] || (table[role] = [])).push(row);
    console.log(`${role.padEnd(8)} ${prof.padEnd(8)} L${L}  מהודר ${(100 * row.mehudar).toFixed(0).padStart(3)}%  כשר ${(100 * row.kasher).toFixed(0).padStart(3)}%  ט״ת ${(100 * row.tikkun).toFixed(0).padStart(3)}%  stuck ${s}  q̄ ${row.q}`);
  }
  const j = opt('--json', null); if (j) (await import('node:fs')).writeFileSync(j, JSON.stringify(table, null, 1));
}
