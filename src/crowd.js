/* ─────────────────────────────────────────────────────────────────────────────
 * crowd.js — people doing real things on the Temple Mount (PEOPLE, wave 6). Not wanderers: small looping scenes with
 * their props, chosen by the state of the world.
 *
 *   const crowd = createCrowd({ scene, camera, stages, life, ground });
 *   crowd.setScene(kind)   'site' | 'plaza' | 'festival' | 'night' | 'auto' (default: from the build phase, the time of
 *                          day and the calendar — Sukkot is 15–21 Tishrei; a Phase A night is 'rest': nobody)
 *   crowd.scene            the scene shown now;  crowd.update(dt) every frame (main.js registers it with life)
 *   crowd.setEnabled(b), crowd.stats → { people, stations, scene }, crowd.stations (ids), crowd.view(id) → {p, t}
 *   ── world12 ── crowd.setScene('chag'): the night of Chanukat HaBayit (an illustration in the manner of Simchat Beit
 *   HaShoeva, Sukkah 5:2–4): the dancers with torches, the Levites on the fifteen steps, the pilgrims of every land with
 *   their gifts, the guards' torches. crowd.setBuildup(n): the build-up to it — n groups of pilgrims from named lands
 *   (LANDS) walk up to the Mount with gifts in the building's day scene (0 = none).
 *
 * Everyone is an actors.js figure of ONE createActors instance (one draw call per dress kind in view + one for all the
 * held items and set-down props), so a station costs no draw call of its own. No allocations per frame (a walk's promise
 * per lap, a scene's people when the scene changes).
 *
 * The scenes (sources: bus/SOURCES.md §7, drafts for the owner; where the sources are silent it is an illustration, ⚑):
 * · site (Phase A, the life of the building site, round the site where the builder works): a scribe at his table with
 *   the wage roll and a worker before him, the overseer and his assistant with the plan, a water carrier with his jar
 *   going between them, a woman selling bread to the workers, onlookers and children watching the work. (illus.)
 * · plaza (the finished Mount, by day): pilgrims come up through the Chuldah gates and turn right, round the Mount
 *   (Middot 2:2 «נכנסין דרך ימין ומקיפין»), one mourner walks to the left and those he passes turn to him («השוכן בבית
 *   הזה ינחמך»); all barefoot and without a staff (Berakhot 9:5); a sage teaching his students seated round him in the
 *   shade of the Royal Stoa (Pesachim 26a teaches in the shade of the Heichal: the portico's shade is illus. ⚑); elders
 *   talking; kohanim of the mishmar walking to the courts; Levite guards at the gates (Middot 1:1); doves sold outside
 *   the gates, on the plaza below the southern steps (where they were sold is not in the sources: illus. ⚑, Keritot 1:7);
 *   people going down to immerse at a mikveh by the southern steps (archaeology: illus.); a family with its bikkurim
 *   basket behind the flute player (Bikkurim 3:3–4; brought from Shavuot until Chanukah, Bikkurim 1:6).
 * · festival (Sukkot): the plaza, with the lulav and etrog in every walker's hands (Sukkah 3), men carrying the aravot
 *   from Motza up to the courts (Sukkah 4:5), the bikkurim family.
 * · night: the Levite guards with torches at the gates, the officer of the Temple Mount going round them with torches
 *   burning before him and greeting each «שלום עליך» (Middot 1:1–2); on Sukkot, Simchat Beit HaShoeva in the Ezrat Nashim:
 *   men of deeds dancing with torches, the Levites with their instruments on the fifteen steps (Sukkah 5:1–4).
 * The money changers sit only from 25 Adar (Shekalim 1:3): never in these scenes now.
 * 1 unit = 1 amah; +x east, +z south, +y up.
 * ──────────────────────────────────────────────────────────────────────────── */
import { createActors as defActors } from './actors.js';

// where things happen (world, amot): the Chuldah gates come up onto the plaza at the double and the triple gate
const GATE_D = [-101, 316], GATE_T = [31, 316];
const CHULDAH_Y = -51.35;                    // the paved plaza below the southern steps (WORLD's city.js)
const PIL = ['#8C5A3C', '#3F5F8C', '#7A3E3E', '#C9A66B', '#556B3A', '#E0D7C5', '#6B4E7A', '#B55A3A', '#D8C9A8', '#2F4F4F', '#9E7B4F', '#4E6E8E'];
const WORK = ['#B8A07A', '#9E7B4F', '#C9A66B', '#8C6E4E', '#D8C9A8'];
// ── world12 ── the pilgrims of every land, coming up for Chanukat HaBayit (the owner, 29.9 20:37: "להזמין למסיבה מכל קצוות
// תבל"). Each: its Hebrew name, what it brings, the colours its people wear (only the cloth: no caricature of any people),
// the items they carry, and the source that the Jews of that land sent gifts to the House or came up to it (drafts, ⚑ for
// the owner: the build-up itself is an illustration — המחשה)
export const LANDS = [
  { id: 'bavel', he: 'בבל', gift: 'מחצית השקל ומתנות', items: ['jar', 'basket', null, 'scroll'], col: ['#3F5F8C', '#E0D7C5', '#2F4F4F'], src: 'יוספוס, קדמוניות היהודים 18.9.1 (18.312)' },
  { id: 'mitzrayim', he: 'מצרים · אלכסנדריה', gift: 'אומנים ונחושת לשערים', items: ['basket', null, 'jar', null], col: ['#E0D7C5', '#D8C9A8', '#9E7B4F'], src: 'בבלי יומא לח, א' },
  { id: 'romi', he: 'רומי', gift: 'כסף לקורבנות', items: ['jar', null, 'basket', null], col: ['#7A3E3E', '#E0D7C5', '#B55A3A'], src: 'פילון, המשלחת אל גאיוס 156–157' },
  { id: 'madai', he: 'מדי ופרס', gift: 'מתנות מעבר לפרת', items: ['basket', 'jar', null, null], col: ['#6B4E7A', '#C9A66B', '#4E6E8E'], src: 'פילון, המשלחת אל גאיוס 216' },
  { id: 'sheva', he: 'שבא · תימן', gift: 'זהב ולבונה', items: ['basket', null, 'jar', null], col: ['#C9A66B', '#556B3A', '#E0D7C5'], src: 'ישעיהו ס, ו (החזון; המחשה)' },
  { id: 'asia', he: 'אסיה', gift: 'כסף הקודש', items: ['jar', null, null, 'basket'], col: ['#4E6E8E', '#D8C9A8', '#8C5A3C'], src: 'יוספוס, קדמוניות היהודים 16.6.2 (16.162–165)' },
  { id: 'kirene', he: 'קירנה', gift: 'כסף הקודש', items: ['basket', null, 'jar', null], col: ['#B55A3A', '#E0D7C5', '#556B3A'], src: 'יוספוס, קדמוניות היהודים 16.6.5 (16.169)' },
  { id: 'chadyav', he: 'חדייב', gift: 'נברשת של זהב', items: ['basket', 'jar', null, null], col: ['#8C5A3C', '#E2A93B', '#2F4F4F'], src: 'משנה יומא ג, י' },
];

function sukkotNow(d = new Date()) {
  try {
    const f = new Intl.DateTimeFormat('en-u-ca-hebrew', { month: 'long', day: 'numeric' }).formatToParts(d);
    const m = (f.find((p) => p.type === 'month') || {}).value || '', day = +((f.find((p) => p.type === 'day') || {}).value || 0);
    return /tishri|tishrei/i.test(m) && day >= 15 && day <= 22;
  } catch (e) { return false; }
}

export function createCrowd(ctx) {
  const { scene, stages, life } = ctx;
  let camera = ctx.camera || null;
  const groundF = ctx.ground || ((x, z) => (stages && stages.groundAt ? stages.groundAt(x, z) : 0));
  const mk = (ctx.actors && ctx.actors.createActors) || defActors;
  const actors = mk({ scene, camera, blobs: life && life.blobs ? life.blobs : null, ground: groundF });
  let seed = 911;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  let want = 'auto', cur = null, enabled = true, siteKey = null, T = 0;
  const people = [], props = [], acts = [];          // acts: per-person behaviours (update(dt))
  const at = { x: 0, z: 0, yaw: 0 };                  // the site scene's anchor (the builder's work spot)

  /* ── helpers ── */
  function person(kind, x, z, o = {}) {
    const a = actors.add(kind, x, z, { yaw: o.yaw || 0, item: o.item, col: o.col, col2: o.col2, scale: o.scale, y: o.y, fadeIn: true, speed: o.speed, ground: o.y !== undefined ? () => o.y : undefined });
    a.vis = 0; a.visT = 1;
    people.push(a);
    return a;
  }
  function prop(item, x, z, yaw = 0, y) { const p = actors.prop(item, x, y !== undefined ? y : groundF(x, z), z, yaw); if (p) props.push(p); return p; }
  // a lap along a path: fade in at its start, walk, fade out at its end, wait, again (staggered by `delay`)
  // `pre` (0…1): the first lap starts that far along its path, already in view (a plaza full from the first frame)
  function lap(a, pts, speed, delay, gap = 2, pre) {
    const L = { pts, speed, st: 'wait', t: pre !== undefined ? 0 : delay, gap, y: a.fixedY, pre };
    a.visT = 0; a.vis = 0;
    acts.push({ a, update(dt) {
      if (L.st === 'wait') {
        L.t -= dt; if (L.t > 0) return;
        let rest = pts.slice(1), x0 = pts[0][0], z0 = pts[0][1];
        if (L.pre !== undefined) {
          // walk the polyline to the fraction `pre` of its length and start from there
          let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
          let d = L.pre * len, i = 1;
          for (; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= l) { const u = l ? d / l : 0; x0 = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u; z0 = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u; break; } d -= l; }
          rest = pts.slice(Math.min(i, pts.length - 1)); L.pre = undefined; a.vis = 1;
        }
        a.x = x0; a.z = z0; a.yaw = Math.atan2(rest[0][0] - x0, rest[0][1] - z0);
        a.visT = 1; L.st = 'walk';
        actors.walk(a, rest, speed).then(() => { if (!a.alive) return; L.st = 'out'; a.visT = 0; L.t = 0.7; });
      } else if (L.st === 'out') { L.t -= dt; if (L.t <= 0) { L.st = 'wait'; L.t = gap < 0 ? -gap : gap * (0.6 + rnd() * 0.8); } }   // (gap < 0: exactly, a group keeps together)
    } });
  }
  // a figure that stays and lives: looks about, a gesture now and then
  function idle(a, o = {}) {
    let t = rnd() * 3;
    acts.push({ a, update(dt) {
      t -= dt; if (t > 0) return;
      t = (o.every || 3.5) * (0.6 + rnd() * 0.8);
      if (o.look) { a.look = typeof o.look === 'function' ? o.look() : o.look; }
      if (o.gest && rnd() < 0.55) { const g = pick(o.gest); actors.pose(a, g); setTimeout(() => { if (a.alive) actors.pose(a, o.rest || 'stand'); }, 1400 + rnd() * 900); }
    } });
  }
  const R = (dx, dz) => [at.x + dx * Math.cos(at.yaw) + dz * Math.sin(at.yaw), at.z - dx * Math.sin(at.yaw) + dz * Math.cos(at.yaw)];

  /* ── the scenes ── */
  const STATIONS = {
    // Phase A: round the site where the builder works (anchor: his spot, facing the site; +dx = his left, −dz = behind him)
    scribe: { scenes: ['site'], build() {
      const [tx, tz] = R(8.5, -9);
      prop('table', tx, tz, at.yaw + Math.PI / 2);
      const s = person('pilgrim', tx + 1.6 * Math.sin(at.yaw + Math.PI / 2 + Math.PI), tz + 1.6 * Math.cos(at.yaw + Math.PI / 2 + Math.PI), { item: 'scroll', col: '#E0D7C5', col2: '#556B3A' });
      s.yaw = Math.atan2(tx - s.x, tz - s.z); actors.pose(s, 'sit');
      idle(s, { every: 4, look: () => [tx, tz] });
      const w = person('worker', tx + 1.9 * Math.sin(at.yaw + Math.PI / 2), tz + 1.9 * Math.cos(at.yaw + Math.PI / 2), { col: pick(WORK), col2: '#2B69B5' });
      w.yaw = Math.atan2(tx - w.x, tz - w.z);
      idle(w, { every: 3, gest: ['offer', 'talk'], look: [s.x, s.z] });
      const q = person('worker', w.x + 1.6 * Math.sin(at.yaw), w.z + 1.6 * Math.cos(at.yaw), { col: pick(WORK), col2: '#A3261F' });
      q.yaw = w.yaw; idle(q, { every: 5, look: () => [s.x, s.z] });
    } },
    overseer: { scenes: ['site'], build() {
      const [x, z] = R(-7.5, -6.5);
      const o = person('pilgrim', x, z, { item: 'scroll', col: '#6B4E7A', col2: '#E0D7C5' });
      o.yaw = Math.atan2(stages.hero ? stages.hero.position.x - x : 0, stages.hero ? stages.hero.position.z - z : 1);
      idle(o, { every: 4, look: () => [at.x + 12 * Math.sin(at.yaw), at.z + 12 * Math.cos(at.yaw)] });
      const [x2, z2] = R(-9, -5.4);
      const h = person('worker', x2, z2, { col: pick(WORK), col2: '#E2A93B' });
      h.yaw = o.yaw; idle(h, { every: 3, gest: ['point', 'talk'], rest: 'stand', look: () => [at.x + 14 * Math.sin(at.yaw), at.z + 14 * Math.cos(at.yaw)] });
    } },
    water: { scenes: ['site'], build() {
      const a = person('pilgrim', 0, 0, { item: 'jar', col: '#C9A66B', col2: '#3F5F8C', speed: 2.6 });
      const p0 = R(7, -10.5), p1 = R(0, -12), p2 = R(-6.5, -8);
      lap(a, [p0, p1, p2], 2.6, 0.5, 1.5);
    } },
    bread: { scenes: ['site'], build() {
      const [x, z] = R(11, -12.5);
      const b = person('woman', x, z, { item: 'bread', col: '#B55A3A', col2: '#E0D7C5' });
      b.yaw = Math.atan2(at.x - x, at.z - z);
      idle(b, { every: 4, gest: ['offer'], look: () => R(8.5, -9) });
    } },
    onlookers: { scenes: ['site'], build() {
      const look = () => { const h = stages.hero; return h ? [h.position.x, h.position.z] : [at.x, at.z]; };
      [[-4, -19, 1], [-1.5, -19.5, 1], [2.5, -18.8, 1], [0.6, -17.2, 0.62], [-2.6, -17.4, 0.6]].forEach(([dx, dz, sc], k) => {
        const [x, z] = R(dx, dz);
        const a = person(k === 1 ? 'woman' : 'pilgrim', x, z, { scale: sc, col: pick(PIL), col2: pick(PIL) });
        a.yaw = Math.atan2(at.x - x, at.z - z);
        idle(a, { every: 3, look, gest: sc < 1 ? ['point'] : ['talk'] });
      });
    } },
    // the finished Mount
    circle: { scenes: ['plaza', 'festival', 'chag'], build(fest) {
      const paths = [
        [GATE_T, [62, 302], [118, 268], [168, 205], [186, 130]],
        [GATE_D, [-66, 298], [-6, 284], [56, 266], [126, 226], [160, 170]],
      ];
      paths.forEach((pts, k) => {
        // families and companions walk together: groups of 1–4 on one line, side by side, a child among them now and then
        for (let g = 0; g < 7; g++) {
          const sp = 2.5 + rnd() * 0.7, pre = (g + 0.15 + rnd() * 0.6) / 7.4, n = 1 + Math.floor(rnd() * 4);
          const base = pts.map(([x, z], j) => (j === 0 ? [x + (rnd() - 0.5) * 6, z] : [x + (rnd() - 0.5) * 8, z + (rnd() - 0.5) * 8]));
          for (let i = 0; i < n; i++) {
            const side = (i - (n - 1) / 2) * 1.5, back = (i % 2) * 0.9, child = n > 2 && i === n - 1;
            const jit = base.map(([x, z], j) => { const q = base[Math.min(j + 1, base.length - 1)], p0 = base[Math.max(0, j - 1)], dx = q[0] - p0[0], dz = q[1] - p0[1], l = Math.hypot(dx, dz) || 1; return [x + dz / l * side - dx / l * back, z - dx / l * side - dz / l * back]; });
            const a = person(rnd() < 0.4 ? 'woman' : 'pilgrim', jit[0][0], jit[0][1], { item: fest && !child ? 'lulav' : null, col: pick(PIL), col2: pick(PIL), speed: sp, scale: child ? 0.62 : undefined });
            lap(a, jit, sp, g * 6 + k * 1.3, -(2.5 + g * 0.6), pre);
          }
        }
      });
      // the mourner walks round to the left; those he passes turn to him
      const m = person('pilgrim', 0, 0, { col: '#3A3533', col2: '#2A2522', speed: 2.2 });
      const back = paths[1].slice().reverse();
      lap(m, back, 2.2, 9, 6);
      acts.push({ a: m, update() {
        for (const p of people) {
          if (p === m) continue;
          const near = m.vis > 0.5 && (p.x - m.x) ** 2 + (p.z - m.z) ** 2 < 40;
          if (near) { if (!p.lookA) p.lookA = [0, 0]; p.lookA[0] = m.x; p.lookA[1] = m.z; p.look = p.lookA; p.mournLook = true; }
          else if (p.mournLook) { p.look = null; p.mournLook = false; }
        }
      } });
    } },
    teach: { scenes: ['plaza', 'festival'], build() {
      const cx = -20, cz = 352;
      prop('stone', cx, cz - 0.2, 0, groundF(cx, cz) + 0.28);
      const t = person('pilgrim', cx, cz, { col: '#E8E2D4', col2: '#F2EEE6', y: groundF(cx, cz) + 0.52 });
      t.yaw = Math.PI; actors.pose(t, 'sit');
      idle(t, { every: 2.6, gest: ['talk'], rest: 'sit' });
      for (let i = 0; i < 7; i++) {
        const a0 = -1.1 + i * (2.2 / 6), x = cx + Math.sin(a0) * 3.4, z = cz - Math.cos(a0) * 3.4;
        const s = person('pilgrim', x, z, { col: pick(PIL), col2: pick(PIL) });
        s.yaw = Math.atan2(cx - x, cz - z); actors.pose(s, 'sit');
        idle(s, { every: 4, look: [cx, cz] });
      }
    } },
    elders: { scenes: ['plaza', 'festival'], build() {
      const cx = -64, cz = 246;
      for (let i = 0; i < 3; i++) {
        const a0 = i * 2.1 + 0.3, x = cx + Math.sin(a0) * 1.5, z = cz + Math.cos(a0) * 1.5;
        const e = person('pilgrim', x, z, { col: pick(['#E0D7C5', '#D8C9A8', '#8C5A3C']), col2: '#F2EEE6' });
        e.col2.set('#EDEAE4'); e.yaw = Math.atan2(cx - x, cz - z);
        idle(e, { every: 2.8, gest: ['talk'], look: () => { const o = people[people.indexOf(e) + (rnd() < 0.5 ? 1 : -1)]; return o ? [o.x, o.z] : [cx, cz]; } });
      }
    } },
    mishmar: { scenes: ['plaza', 'festival'], build() {
      const pts = [GATE_D, [-84, 250], [-66, 170], [-56, 100]];
      for (let i = 0; i < 4; i++) {
        const a = person('kohen', pts[0][0], pts[0][1], { speed: 2.8 });
        lap(a, pts.map(([x, z]) => [x + (i % 2 ? 1.2 : -1.2), z]), 2.8, 4 + i * 1.3, 14, i < 2 ? 0.35 - i * 0.03 : undefined);
      }
    } },
    guards: { scenes: ['plaza', 'festival', 'night', 'chag'], build(fest, night) {
      for (const [x, z] of [[GATE_D[0] - 7, GATE_D[1] + 1], [GATE_D[0] + 7, GATE_D[1] + 1], [GATE_T[0] - 7, GATE_T[1] + 1], [GATE_T[0] + 7, GATE_T[1] + 1]]) {
        const g = person('levite', x, z, { item: night ? 'torch' : null });
        g.yaw = Math.PI; idle(g, { every: 5 });
      }
    } },
    doves: { scenes: ['plaza', 'festival'], build() {
      const x = -34, z = 452, y = CHULDAH_Y;
      prop('table', x, z, 0, y);
      for (const dx of [-0.45, 0.45]) prop('cage', x + dx, z, 0, y + 0.86);
      const s = person('pilgrim', x, z - 1.5, { col: '#7A3E3E', col2: '#D8C9A8', y });
      s.yaw = 0; idle(s, { every: 3, gest: ['offer', 'talk'] });
      const b = person('woman', x + 0.4, z + 1.8, { col: pick(PIL), col2: pick(PIL), y });
      b.yaw = Math.PI; idle(b, { every: 4, gest: ['talk'] });
      const c = person('pilgrim', 0, 0, { item: 'cage', col: pick(PIL), col2: pick(PIL), y, speed: 2.4 });
      lap(c, [[x + 1.5, z + 1.5], [x + 10, z - 4], [x + 22, z - 20]], 2.4, 3, 8);
    } },
    mikveh: { scenes: ['plaza', 'festival'], build() {
      const x = -126, z = 446, y = CHULDAH_Y;
      prop('mikveh', x, z, 0, y);
      for (let i = 0; i < 3; i++) {
        const a = person(i === 1 ? 'woman' : 'pilgrim', 0, 0, { col: pick(PIL), col2: pick(PIL), y, speed: 2.2 });
        lap(a, [[x - 14, z + 16], [x - 4, z + 4], [x, z - 0.3]], 2.2, i * 6, 4, i === 0 ? 0.5 : undefined);
        const b = person('pilgrim', 0, 0, { col: pick(PIL), col2: pick(PIL), y, speed: 2.2 });
        lap(b, [[x + 0.6, z + 0.4], [x + 6, z - 6], [x + 22, z - 16]], 2.2, 4 + i * 6, 5);
      }
    } },
    bikkurim: { scenes: ['plaza', 'festival'], build() {
      const pts = [GATE_T, [24, 240], [14, 170], [8, 110]];
      const g = [['pilgrim', 'halil', 0], ['pilgrim', 'basket', -2.2], ['woman', null, -3.4], ['pilgrim', 'basket', -4.4, 0.62]];
      g.forEach(([k, item, off, sc]) => {
        const a = person(k, 0, 0, { item, col: pick(PIL), col2: pick(PIL), scale: sc, speed: 2.2 });
        if (item === 'halil') a.playing = true;
        lap(a, pts.map(([x, z], j) => [x + (sc ? 0.9 : 0), z + (j === 0 ? -off : 0)]), 2.2, 6 - off * 0.45, 16);
      });
    } },
    aravot: { scenes: ['festival'], build() {
      const pts = [GATE_D, [-60, 220], [-32, 150], [-24, 104]];
      for (let i = 0; i < 3; i++) {
        const a = person('pilgrim', 0, 0, { item: 'aravah', col: pick(PIL), col2: pick(PIL), speed: 2.4 });
        lap(a, pts.map(([x, z]) => [x + i * 1.6, z]), 2.4, 2 + i * 1.8, 18);
      }
    } },
    // ── world12 ── the pilgrims of every land: in the building's day scene (the build-up: `buildN` groups) they walk up from
    // the Chuldah gates across the plaza toward the courts with their gifts; on the night of the celebration all of them
    // stand in the Ezrat Nashim's side and on the plaza, torches among them
    lands: { scenes: ['site', 'chag'], build(fest, night, kind) {
      const n = kind === 'chag' ? LANDS.length : Math.min(LANDS.length, buildN);
      // the building's day: each land's group has come up and stands behind the onlookers, gifts in hand, watching the House
      // rise (they walk the last stretch in from behind; the long road up is the toast's) — so the work's own frame shows them
      if (kind === 'site') {
        if (!siteKey) return;
        const look = () => { const h = stages.hero; return h ? [h.position.x, h.position.z] : [at.x, at.z]; };
        for (let g = 0; g < n; g++) {
          const L = LANDS[g], bx = -12 + (g % 4) * 8, bz = -25 - Math.floor(g / 4) * 6.5;
          L.items.forEach((item, i) => {
            const [x, z] = R(bx + (i % 2) * 1.5 - 0.75, bz - Math.floor(i / 2) * 1.4), [x0, z0] = R(bx + (i % 2) * 1.5, bz - 14 - i);
            const a = person(i === 2 ? 'woman' : 'pilgrim', x0, z0, { item, col: L.col[i % 3], col2: L.col[(i + 1) % 3], speed: 2.2, scale: i === 3 ? 0.66 : undefined });
            a.land = L.id;
            actors.walk(a, [[x, z]], 2.2);
            idle(a, { every: 3.5, look, gest: i === 3 ? ['point'] : ['talk', 'offer'] });
          });
        }
        return;
      }
      for (let g = 0; g < n; g++) {
        const L = LANDS[g], gate = g % 2 ? GATE_T : GATE_D;
        const pts = [gate, [gate[0] * 0.6 + 20, 262 - (g % 3) * 8], [60 + (g % 4) * 12, 170 - g * 4], [150 - (g % 3) * 6, 80 - g * 7]];
        L.items.forEach((item, i) => {
          const a = person(i === 2 ? 'woman' : 'pilgrim', pts[0][0], pts[0][1], { item: kind === 'chag' && i === 1 ? 'torch' : item, col: L.col[i % 3], col2: L.col[(i + 1) % 3], speed: 2.3, scale: i === 3 ? 0.66 : undefined });
          a.land = L.id;
          const off = (i - 1.5) * 1.4;
          const path = pts.map(([x, z]) => [x + off, z + (i % 2) * 1.2]);
          if (kind === 'chag') lap(a, path, 2.1, g * 2.5 + i * 0.4, 3, 0.2 + ((g * 0.13 + i * 0.05) % 0.7));
          else lap(a, path, 2.3, g * 7 + i * 0.5, 6 + g, g < 2 ? 0.25 + g * 0.2 : undefined);
        });
      }
    } },
    // the night
    officer: { scenes: ['night'], build() {
      const stops = [[GATE_D[0], GATE_D[1] - 3], [GATE_T[0], GATE_T[1] - 3], [60, 200], [-60, 200]];
      const o = person('levite', stops[0][0], stops[0][1], { col: '#D8CCB0', speed: 2.6 });
      const tb = person('pilgrim', stops[0][0], stops[0][1] - 2.5, { item: 'torch', col: '#8C6E4E', col2: '#E0D7C5', speed: 2.6 });
      let i = 0, wait = 0;
      acts.push({ a: o, update(dt) {
        if (o.path) { tb.look = null; return; }
        wait -= dt; if (wait > 0) return;
        i = (i + 1) % stops.length; const [x, z] = stops[i];
        actors.walk(o, [[x, z]], 2.6); wait = 3.2;
        actors.walk(tb, [[x + 1.2 * Math.sign(x - o.x || 1), z - 2.2]], 2.9);
      } });
      idle(o, { every: 2.2, gest: ['bow'] });
    } },
    shoeva: { scenes: ['night', 'chag'], sukkot: true, build() {   // (world12: and on the night of the celebration)
      const cx = 70, cz = 0, y = 6;
      for (let i = 0; i < 8; i++) {
        const a0 = i / 8 * Math.PI * 2, x = cx + Math.sin(a0) * 7, z = cz + Math.cos(a0) * 7;
        const d = person('pilgrim', x, z, { item: 'torch', col: '#E0D7C5', col2: '#F2EEE6', y });
        d.ring = { a0, r: 7, cx, cz };
        acts.push({ a: d, update() {
          const a1 = d.ring.a0 + T * 0.35, x1 = cx + Math.sin(a1) * 7, z1 = cz + Math.cos(a1) * 7;
          d.x = x1; d.z = z1; d.yaw = a1 + Math.PI / 2; d.wk = 0.6; d.ph += 0.12;
          d.armT[2] = 2.3 + Math.sin(T * 3 + a0 * 2) * 0.5; d.armT[0] = 1.2 + Math.sin(T * 3 + a0 * 2 + 1.5) * 0.6;
        } });
      }
      // the Levites with their instruments on the fifteen steps (Sukkah 5:4)
      [[3, -0.9, 'kinor'], [5, -0.3, 'nevel'], [5, 0.3, 'kinor'], [7, 0.9, 'cymbals'], [9, -0.5, 'nevel'], [9, 0.5, 'kinor']].forEach(([j, ph, item]) => {
        const R0 = 6 + 0.5 * j + 0.25, x = 10 + R0 * Math.cos(ph), z = R0 * Math.sin(ph);
        const l = person('levite', x, z, { item, y: 13.5 - 0.5 * j });
        l.yaw = Math.PI / 2; l.playing = true;
      });
    } },
  };

  /* ── choosing and building a scene ── */
  function autoScene() {
    const night = !!(life && life.night);
    // (Phase A at night: the site rests and the Mount's night scenes need the finished Mount — nobody is shown)
    if (life && life.phase === 'build') return night ? 'rest' : 'site';
    if (night) return 'night';
    return sukkotNow() ? 'festival' : 'plaza';
  }
  function clear() {
    for (const a of people) actors.remove(a);
    for (const p of props) actors.unprop(p);
    people.length = 0; props.length = 0; acts.length = 0;
  }
  // the site scene gathers round the builder's work spot (he faces the site)
  function anchor() {
    const h = stages && stages.hero, id = h && h.at;
    if (!id || !h.position) return null;
    const p = h.position; at.x = p.x; at.z = p.z; at.yaw = typeof h.yaw === 'number' ? h.yaw : 0;
    return id;
  }
  function build(kind) {
    clear();
    cur = kind;
    const fest = kind === 'festival', night = kind === 'night' || kind === 'chag', sk = sukkotNow() || kind === 'chag';   // (world12: the celebration's night has the Beit HaShoeva's scene)
    if (kind === 'site') siteKey = anchor();
    for (const id in STATIONS) {
      const S = STATIONS[id];
      if (!S.scenes.includes(kind)) continue;
      if (S.sukkot && !sk) continue;
      if (kind === 'site' && !siteKey && id !== 'lands') continue;   // (world12: the lands' pilgrims walk their own way)
      try { S.build(fest, night, kind); } catch (e) { console.warn('[crowd] station failed', id, e); }
    }
  }
  // ── world12 ── the build-up: how many lands' groups walk up in the building's day scene
  let buildN = 0;
  function setBuildup(n) {
    const v = Math.max(0, Math.min(LANDS.length, n | 0));
    if (v === buildN) return buildN;
    buildN = v;
    if (cur === 'site') build('site');
    return buildN;
  }
  function setScene(kind) {
    want = ['site', 'plaza', 'festival', 'night', 'chag'].includes(kind) ? kind : 'auto';
    const k = want === 'auto' ? autoScene() : want;
    if (k !== cur) build(k);
    return cur;
  }
  let check = 0;
  function update(dt) {
    if (!enabled) { actors.update(dt); return; }
    T += dt;
    // (every half second: the auto scene may change with the phase or the time; the site scene follows the builder)
    if ((check -= dt) <= 0) {
      check = 0.5;
      const k = want === 'auto' ? autoScene() : want;
      if (k !== cur) build(k);
      else if (k === 'site') { const h = stages && stages.hero, id = h && h.at; if (id && id !== siteKey && !h.busy) build('site'); }
    }
    for (let i = 0; i < acts.length; i++) acts[i].update(dt);
    actors.update(dt);
  }
  function setEnabled(v) {
    enabled = !!v;
    actors.setEnabled(enabled);
  }
  // camera poses that frame a station (tests and the tour)
  const VIEWS = {
    circle: { p: [58, 24, 246], t: [36, 1, 304] }, teach: { p: [-2, 12, 334], t: [-20, 1, 352] }, elders: { p: [-52, 9, 234], t: [-64, 2, 246] },
    shoeva: { p: [98, 26, 30], t: [48, 8, 0] }, chag: { p: [170, 40, 70], t: [40, 10, 0] }, officer: { p: [-40, 30, 262], t: [-40, 0, 316] }, doves: { p: [-20, -40, 436], t: [-34, -50, 452] },
  };
  return {
    setScene, update, setEnabled, actors, setBuildup, get buildup() { return buildN; }, LANDS,   // (world12)
    get scene() { return cur; },
    get stats() { return { people: people.length, stations: Object.keys(STATIONS).filter((id) => STATIONS[id].scenes.includes(cur)).length, scene: cur, drawn: actors.drawn }; },
    get stations() { return Object.keys(STATIONS); },
    view(id) { const v = VIEWS[id]; if (v) return v; if (id === 'site' && cur === 'site') { const [x, z] = R(-6, -44); const [tx, tz] = R(0, -8); return { p: [x, groundF(x, z) + 15, z], t: [tx, groundF(tx, tz) + 2, tz] }; } return null; },
    setCamera(c) { camera = c; actors.setCamera(c); },
    sukkot: sukkotNow,
  };
}
