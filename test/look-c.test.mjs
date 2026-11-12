// look round C (docs/specs/look/C-light-sky-air.md): the work light, the shadow box, the cloud shadows' one chunk
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WORK, workPreset, lerpHex, sunDir, shadowBox, createWorkLight, actSun, ACT_SUN } from '../src/look/light.js';
import { airPatch, airUniforms, windPatch, CLOUD } from '../src/look/air.js';

// the presets as main.js has them (only the fields the work light reads)
const T = { dawn: { el: 14, az: 20, bloom: 0.22, bloomT: 1.8 }, noon: { el: 62, az: 100, bloom: 0.18, bloomT: 1.9 } };
const G = { dawn: { fogN: 420, fogF: 7000, sat: 1.08, gain: [1.035, 1, 0.955], lift: [0.004, 0.005, 0.011], vig: 0.2 }, noon: { fogN: 480, fogF: 7600, sat: 1.07, gain: [1, 1, 0.985], lift: [0.002, 0.003, 0.006], vig: 0.14 } };
const hsl = (hex) => { const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  const h = d === 0 ? 0 : mx === r ? 60 * (((g - b) / d) % 6) : mx === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4); return { h, s: d / (1 - Math.abs(mx + mn - 1) || 1), l: (mx + mn) / 2 }; };

test('C5: the sun rises with the stage\'s progress, 28° to 62°, along the presets\' azimuths; the same progress, the same sun', () => {
  const a = workPreset(0, T, G), b = workPreset(1, T, G), m = workPreset(0.5, T, G);
  assert.equal(a.el, 28); assert.equal(b.el, 62); assert.ok(m.el > a.el && m.el < b.el);
  assert.ok(a.az > T.dawn.az && a.az < T.noon.az); assert.equal(b.az, T.noon.az);
  assert.deepEqual(workPreset(0.37, T, G), workPreset(0.37, T, G));
  assert.equal(workPreset(-3, T, G).el, 28); assert.equal(workPreset(9, T, G).el, 62);
  for (let p = 0; p < 1; p += 0.1) assert.ok(workPreset(p + 0.1, T, G).el > workPreset(p, T, G).el);
});

test('C1: one golden light, near-white cream (not yellow), a warm ground bounce', () => {
  for (const k of ['morning', 'noon']) {
    const s = hsl(WORK[k].sun), g = hsl(WORK[k].hg);
    assert.ok(s.h >= 30 && s.h <= 45 && s.l >= 0.9, `${k} sun ${WORK[k].sun}`);
    assert.ok(g.h >= 30 && g.h <= 45, `${k} bounce ${WORK[k].hg} is warm`);
  }
  assert.ok(WORK.morning.sunI < 3.05 && WORK.noon.sunI < 2.95, 'weaker than the old dawn / noon suns');
  assert.equal(lerpHex('#000000', '#FFFFFF', 0.5), '#808080');
  const d = sunDir(90, 0); assert.ok(Math.abs(d[1] - 1) < 1e-9);
});

test('C5: some acts hold their sun higher (a long shadow would hide their work)', () => {
  assert.equal(actSun('course', 0), 0);
  for (const k of Object.keys(ACT_SUN)) { assert.equal(actSun(k, 0), ACT_SUN[k][0]); assert.equal(actSun(k, 1), 1); }
});

test('C5: the sun holds still while an act runs and eases to its place in the walk', () => {
  const calls = []; const W = createWorkLight((p, how) => calls.push([+p.toFixed(3), how]));
  W.set({ p: 0.2, act: false }); assert.deepEqual(calls.pop(), [0.2, 'full']);
  W.set({ p: 0.2, act: true }); assert.equal(calls.pop()[1], 'act');
  W.set({ p: 0.5, act: true }); for (let i = 0; i < 50; i++) W.tick(0.1);
  assert.equal(W.state().p, 0.2, 'no move during the act');
  W.set({ p: 0.5, act: false }); for (let i = 0; i < 200; i++) W.tick(0.05);
  assert.equal(W.state().p, 0.5, 'reached in the walk');
  assert.ok(calls.some((c) => c[1] === 'move'));
  W.set({ p: 0.8, act: false }); W.tick(0.05); W.set({ p: 0.8, act: true });
  assert.equal(W.state().p, 0.8, 'an act begins at its own progress\'s sun');
  W.set(null); assert.equal(calls.pop()[1], 'off'); assert.equal(W.on, false);
});

test('C2: the shadow box\'s centre lands on whole texels of the light\'s view (no shimmer)', () => {
  const d = sunDir(40, 60), half = 60, size = 2048, tex = 2 * half / size;
  const rx = d[2] / Math.hypot(d[0], d[2]), rz = -d[0] / Math.hypot(d[0], d[2]);
  for (const t of [[0, 0, 0], [253.3, -35.2, 361.7], [-12.77, 4, 9.31]]) {
    const c = shadowBox(t, d, half, size);
    const a = c[0] * rx + c[2] * rz; assert.ok(Math.abs(a / tex - Math.round(a / tex)) < 1e-6);
    assert.ok(Math.hypot(c[0] - t[0], c[1] - t[1], c[2] - t[2]) < tex * 1.5);
  }
});

test('C4: the cloud shadows are one chunk, added once, multiplying the direct light only (at most 0.25)', () => {
  const sh = { uniforms: {}, vertexShader: '#include <common>\n#include <begin_vertex>', fragmentShader: '#include <common>\n#include <lights_fragment_end>' };
  airPatch(sh); airPatch(sh);
  assert.equal(sh.fragmentShader.split('float airShade(').length, 2);
  assert.match(sh.fragmentShader, /reflectedLight\.directDiffuse \*= airK/);
  assert.doesNotMatch(sh.fragmentShader, /indirectDiffuse \*= airK/);
  assert.equal(sh.uniforms.uAirC, airUniforms().uAirC);
  assert.ok(CLOUD.max <= 0.25);
  windPatch(sh); assert.match(sh.vertexShader, /uniform float uAirT/);
  for (const f of ['src/look/shader.js', 'src/look/ground.js', 'src/batch.js']) assert.match(readFileSync(new URL('../' + f, import.meta.url), 'utf8'), /airPatch\(sh\)/, f);
});

test('the work light is set in one place: main.js (the director only reports its progress)', () => {
  const dir = readFileSync(new URL('../src/game/h109/director.js', import.meta.url), 'utf8');
  assert.match(dir, /view\.workLight\(\{ p: M\.progress\(\)/);
  assert.doesNotMatch(dir, /\.intensity\s*=|setTimeOfDay/);
});
