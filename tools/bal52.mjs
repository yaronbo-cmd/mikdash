// ── build 52 ── bal52.mjs — the ashes' pan walk (תרומת הדשן) in node, a child's two thumbs: the left on the stick (forward, full), the
// right dragging against the meter's tilt as he saw it a reaction ago (~250 ms), his eye a little rough; the spills per walk (the ramp
// down included) at a level, many seeds. The coordinator's build-52 check: "a child-like correction ≤ 1 spill — else soften level 1".
//   node tools/bal52.mjs [--n 200] [--level 1] [--lat 0.25] [--gain 2.5] [--p '{"deshen":{"1":{...}}}']
import { rig, FLAGS, seeded } from '../test/rig33.mjs';
import { practiceSave31 } from '../src/avodah/shift/practice31.js';
import '../src/avodah/shift/focus17.js';
import { D21 } from '../src/avodah/shift/day33.js';

const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
if (opt('--p', null)) globalThis.__LV36P = JSON.parse(opt('--p', '{}'));
const N = +opt('--n', 200), L = +opt('--level', 1), LAT = +opt('--lat', 0.25), GAIN = +opt('--gain', 2.5), LOOK = 0.1, NOISE = 0.1;
const SAVE = () => ({ served30: 5, roles23: { m: 6, h: [], kiyor: { n: 6, best: 100, last: 75 }, deshen: { n: 2, best: 100, last: 100 } }, roles26: { m: 5, h: [] } });

/** one walk: the spills from the walk's start to the foot of the ramp */
export async function walk52(seed, o = {}) {
  const lat = o.lat ?? LAT, gain = o.gain ?? GAIN, rnd = seeded(7000 + seed * 31);
  const R = rig(FLAGS, { save: practiceSave31(SAVE()), practice: { role: 'deshen', day: 7, fed: 44, seed: 4242 + seed * 17 }, rng: seeded(11 + seed * 13), lv36: o.level ?? L });
  R.E.start(); R.H.y = 25; await R.step(0.3); await R.step(0.5);
  for (let i = 0; i < 40 && R.E.d21() && R.E.d21().ph === 'sweep'; i++) { const K = R.E.d21(), s = K.side ? K.side[Math.min(K.n, K.side.length - 1)] : 1; R.E.d21swipe(0.6 * s, 0.04, 100); await R.step(0.3); }
  await R.step(1);
  const hist = []; let T = 0, nextLook = 0, u = 0, walked = false;
  for (let i = 0; i < 4000; i++) {
    const K = R.E.d21(); if (!K || K.ph === 'foot' || K.ph === 'go' || K.ph === 'turn') break;
    if (K.ph === 'walk' || K.ph === 'desc') {
      walked = true; hist.push([T, K.b]);
      if (T >= nextLook) {   // (he looks every 0.1 s; what he sees is the meter a reaction ago, a little rough)
        nextLook = T + LOOK; let j = hist.length - 1; while (j > 0 && hist[j][0] > T - lat) j--;
        const seen = hist[j][1] + (rnd() - 0.5) * 2 * NOISE;
        u = Math.max(-1, Math.min(1, -gain * seen));
        R.E.d21bal(u);
      }
      R.E.d21stick(1);
    }
    await R.step(0.05, 0.05); T += 0.05;
  }
  const K = R.E.d21();
  return { spills: K ? K.spills | 0 : -1, walked };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const hist = {}; let sum = 0, n = 0, le1 = 0;
  for (let s = 0; s < N; s++) { const r = await walk52(s); if (!r.walked) continue; n++; sum += r.spills; if (r.spills <= 1) le1++; hist[r.spills] = (hist[r.spills] || 0) + 1; }
  console.log(JSON.stringify({ level: L, lat: LAT, gain: GAIN, n, mean: Math.round((sum / Math.max(1, n)) * 100) / 100, le1: Math.round((le1 / Math.max(1, n)) * 100), hist, bal: D21.bal }));
}
