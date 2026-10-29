// ── fable32 (build 40) ── touch the thing itself (the owner, 26.10 22:19: "במקום לחצנים נלחץ על הפריט במסך בעצמו"; hachraot-he.md
// "נוגעים בחפץ עצמו — במקום כפתורים"): each act's own input layer laid over the act's object on the screen (shift/touch40.js — the
// object's projected bounds + a margin, ≥ 96 px; the old right-hand pad only as the fallback: a footprint under 44 px, the object off the
// screen, or the player's switch), frozen under the finger, a hand on the thing the first time and after two misses; the act's camera
// slid so the thing stands near the right thumb with him still seen (twin.js pan40), held while a finger is on the thing; the follow
// camera's wall guard as build 39 had it (two tries reverted); the pause card's switch (prefs28 pad40); the laver's two rings untouched (the approved two-thumb exception); GAME_BUILD 40; a Divine-Name scan of the changed files by code points.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { T40, box40, hit40, fallback40, createTouch40, PAD40_KEY } from '../src/avodah/shift/touch40.js';
import { SHARED } from '../src/avodah/shift/draw.js';
import { pan40, CAM40 } from '../src/game/twin.js';
import { prefsHTML, pad40HTML } from '../src/avodah/shift/prefs28.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');

// ── a tiny document with listeners (no browser) ──
function mkDoc() {
  const cl = () => { const s = new Set(); return { add: (...c) => c.forEach((x) => s.add(x)), remove: (...c) => c.forEach((x) => s.delete(x)), toggle: (c, on) => { const w = on === undefined ? !s.has(c) : !!on; if (w) s.add(c); else s.delete(c); return w; }, contains: (c) => s.has(c), has: (c) => s.has(c) }; };
  const mk = (tag) => {
    const L = {};
    return { tagName: tag, children: [], style: {}, dataset: {}, attrs: {}, id: '', className: '', innerHTML: '', textContent: '', parent: null, classList: cl(),
      setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'id') this.id = String(v); }, getAttribute(k) { return this.attrs[k] ?? null; },
      appendChild(c) { c.parent = this; this.children.push(c); return c; }, remove() { if (this.parent) { const a = this.parent.children; a.splice(a.indexOf(this), 1); this.parent = null; } },
      addEventListener(t, f) { (L[t] = L[t] || []).push(f); }, removeEventListener(t, f) { L[t] = (L[t] || []).filter((g) => g !== f); },
      fire(t, ev = {}) { for (const f of L[t] || []) f({ target: this, ...ev }); }, querySelectorAll: () => [], querySelector: () => null };
  };
  const doc = { body: mk('body'), head: mk('head'), documentElement: mk('html'), createElement: mk };
  const DL = {};
  doc.addEventListener = (t, f) => { (DL[t] = DL[t] || []).push(f); }; doc.removeEventListener = (t, f) => { DL[t] = (DL[t] || []).filter((g) => g !== f); };
  doc.fire = (t, ev) => { for (const f of DL[t] || []) f(ev); };
  doc.getElementById = (id) => [...doc.head.children, ...doc.body.children].find((x) => x.id === id) || null;
  return doc;
}
function withGlobals(g, fn) {
  const old = {}; for (const k of Object.keys(g)) { old[k] = globalThis[k]; globalThis[k] = g[k]; }
  try { return fn(); } finally { for (const k of Object.keys(g)) { if (old[k] === undefined) delete globalThis[k]; else globalThis[k] = old[k]; } }
}
const store = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear() }; };
// a plain projection: world (x, y) → screen px at 40 px an amah from (300, 200); z ignored
const proj = (x, y) => ({ x: 300 + x * 40, y: 200 - y * 40 });

// ───────── the hit area ─────────
test('build 40: the thing\'s box on the screen (box40: each part projected, its radius measured), the hit area (hit40: + margin, at least T40.box square, kept on the screen) and the fallback\'s test (fallback40: small, off the screen, none, the switch)', () => {
  const b = box40([{ x: 2, y: 1, z: 0, r: 0.5 }], proj);
  assert.ok(Math.abs(b.x - 380) < 1e-9 && Math.abs(b.y - 160) < 1e-9, 'its middle where the part is projected');
  assert.ok(Math.abs(b.w - 40) < 1e-9 && Math.abs(b.fp - 40) < 1e-9, 'r 0.5 at 40 px an amah: 40 px across');
  const two = box40([{ x: 0, y: 0, z: 0, r: 0.5 }, { x: 4, y: 0, z: 0, r: 0.5 }], proj);
  assert.ok(two.w >= 4 * 40 + 40 - 1e-9, 'two parts: one box over both');
  assert.equal(box40([{ x: 0, y: 0, z: 0 }], () => null), null, 'nothing on the screen: no box');
  const h = hit40(b, 640, 296);
  assert.ok(h.w >= T40.box && h.h >= T40.box, 'never under the finger rules\' size');
  assert.ok(h.l <= b.l - T40.margin + 1e-9 || h.w >= b.w + 2 * T40.margin, 'the box and its margin inside');
  assert.ok(h.l >= 0 && h.t >= 0 && h.l + h.w <= 640 && h.t + h.h <= 296, 'on the screen');
  const edge = hit40({ l: 600, r: 660, t: 270, b: 300, w: 60, h: 30, x: 630, y: 285, fp: 60 }, 640, 296);
  assert.ok(edge.l + edge.w <= 640 - T40.edge + 1e-9 && edge.t + edge.h <= 296 - T40.edge + 1e-9, 'a thing at the corner: its area pulled onto the screen');
  assert.equal(T40.min, 44, 'the owner\'s 44 px');
  assert.equal(fallback40(b, 640, 296), 'small', 'a thing 40 px across is under it: the work pad');
  assert.equal(fallback40({ ...b, fp: 30 }, 640, 296), 'small', 'under 44 px → the work pad');
  assert.equal(fallback40({ ...b, fp: 60 }, 640, 296), '', '60 px → on the thing');
  assert.equal(fallback40({ ...b, fp: 60, x: -20 }, 640, 296), 'off');
  assert.equal(fallback40(null, 640, 296), 'none');
  assert.equal(fallback40({ ...b, fp: 60 }, 640, 296, true), 'switch', 'the player\'s switch → the work pad');
});

test('build 40: the act\'s layer on the thing (createTouch40) — on the thing: .t40-obj, its rect the hit area; frozen while a finger is down; the work pad (.t40-pad, the CSS right half) when small or by the switch; off → as it was; the hand the first time, retired by a touch on the thing, back after two touches that missed it', () => {
  const doc = mkDoc(), pad = doc.createElement('div'), ls = store();
  withGlobals({ localStorage: ls, innerWidth: 640, innerHeight: 296, __G39: undefined }, () => {
    let now = 0; const clock = () => now;   // (build 41: the fall to the pad waits T41.settle — the test's own clock)
    const t = createTouch40({ doc, pad, id: 'x40', proj, clock });
    const big = [{ x: 2, y: 1, z: 0, r: 1 }];
    assert.equal(t.place(true, big, 'x40'), 'obj');
    assert.ok(pad.classList.contains('t40-obj') && !pad.classList.contains('t40-pad'));
    const L = parseFloat(pad.style.left), W = parseFloat(pad.style.width), Tp = parseFloat(pad.style.top), H = parseFloat(pad.style.height);
    assert.ok(W >= T40.box && H >= T40.box, 'the hit area ≥ T40.box');
    assert.ok(L <= 380 - 40 && L + W >= 380 + 40 && Tp <= 160 - 40 && Tp + H >= 160 + 40, 'it holds the thing');
    assert.equal(pad.style.right, 'auto'); assert.equal(pad.style.bottom, 'auto');
    assert.ok(SHARED.obj40 && SHARED.obj40.id === 'x40' && globalThis.__T40 && globalThis.__T40.obj === SHARED.obj40, 'the thing published for the act\'s camera');
    const hand = doc.body.children.find((e) => e.className === 't40-hand');
    assert.ok(hand && hand.classList.contains('on'), 'the first time: the hand on the thing');
    assert.equal(hand.innerHTML, '👆', 'a hand, no text');
    // a finger on the thing: frozen
    pad.fire('pointerdown', {});
    assert.equal(globalThis.__T40.down, true);
    t.place(true, [{ x: -3, y: -2, z: 0, r: 1 }], 'x40');
    assert.equal(parseFloat(pad.style.left), L, 'never moves under the finger');
    pad.fire('pointerup', {});
    assert.equal(globalThis.__T40.down, false);
    t.place(true, [{ x: -3, y: -2, z: 0, r: 1 }], 'x40');
    assert.notEqual(parseFloat(pad.style.left), L, 'lifted: it follows the thing again');
    assert.equal(hand.classList.contains('on'), false, 'touched: the hand retired');
    assert.ok(JSON.parse(ls.getItem('bh_t40_hand')).includes('x40'), 'kept on this device');
    // two touches on the world in a row (no walk there) → the hand again
    const zone = doc.createElement('div'); zone.closest = (sel) => (/tw-zone/.test(sel) ? zone : null);
    doc.fire('pointerdown', { target: zone }); doc.fire('pointerdown', { target: zone });
    t.place(true, big, 'x40');
    assert.equal(hand.classList.contains('on'), true, 'two misses: the hand back');
    pad.fire('pointerdown', {}); pad.fire('pointerup', {}); t.place(true, big, 'x40');
    assert.equal(hand.classList.contains('on'), false);
    // small → the work pad, the CSS's own right half (build 41: once it has stayed small past T41.settle)
    t.place(true, [{ x: 0, y: 0, z: 0, r: 0.3 }], 'x40'); now += 1.1;
    assert.equal(t.place(true, [{ x: 0, y: 0, z: 0, r: 0.3 }], 'x40'), 'pad');
    assert.ok(pad.classList.contains('t40-pad') && !pad.classList.contains('t40-obj'));
    assert.equal(pad.style.left, ''); assert.equal(pad.style.width, '');
    // the switch
    ls.setItem(PAD40_KEY, '1');
    assert.equal(t.place(true, big, 'x40'), 'pad', 'the switch on: the work pad');
    ls.setItem(PAD40_KEY, '0');
    assert.equal(t.place(true, big, 'x40'), 'obj');
    // off
    t.place(false);
    assert.ok(!pad.classList.contains('t40-obj') && !pad.classList.contains('t40-pad') && pad.style.left === '');
    assert.equal(SHARED.obj40, null); assert.equal(globalThis.__T40, null);
    t.destroy();
  });
});

// ───────── the act's camera ─────────
test('build 40: the act\'s camera (twin.js pan40) — the authored view slid sideways so the thing stands at CAM40.at (55–65 %) of the width; stepped back along its look when he would leave the frame; the slide capped', () => {
  assert.ok(CAM40.at >= 0.55 && CAM40.at <= 0.65);
  const tanH = Math.tan((50 * Math.PI) / 360) * (844 / 390);
  // the view: from 12 amot south, looking north at the thing; he stands 2 amot east of it
  const p = [0, 20, -12], t = [0, 18, 0], O = { x: 0, y: 18, z: 0 }, H = { x: 2, y: 18, z: 0 };   // (looking north, the screen's right is the world's −x: he at +x stands left of it)
  const r = pan40(p, t, O, H, tanH);
  assert.ok(r, 'a view');
  assert.ok(Math.abs(r.ox - (2 * CAM40.at - 1)) < 0.02, `the thing at ${(((r.ox + 1) / 2) * 100).toFixed(1)} % of the width`);
  assert.ok(r.hx >= CAM40.hero && r.hx < r.ox, 'he is seen, left of the thing');
  assert.ok(Math.abs(r.p[1] - p[1]) < 1e-9 && r.back === 0, 'no step back needed');
  // he far to the left: the camera steps back
  const r2 = pan40(p, t, O, { x: 14, y: 18, z: 0 }, tanH);
  assert.ok(r2.back > 0 && r2.hx >= CAM40.hero - 1e-9, 'stepped back so he stays in the frame');
  // never more than CAM40.pan sideways
  const r3 = pan40(p, t, { x: 40, y: 18, z: 0 }, null, tanH);
  assert.ok(Math.abs(r3.sh) <= CAM40.pan + 1e-9);
  // the twin: the view's slide from globalThis.__T40, held while a finger is down
  const tw = read('src/game/twin.js');
  // (build 41: every authored view — with a thing (O0) or without (his middle, no slide) — and the freeze kept)
  assert.match(tw, /const G40 = globalThis\.__T40, O0 = G40 && G40\.obj;/);
  assert.match(tw, /else if \(G40 && G40\.down && CBC\.v40\) V = CBC\.v40;/, 'frozen under the finger');
  assert.match(tw, /r40 = pan40\(V\.p, V\.t, O,/);
});

// (the follow camera by a wall — the brief's second camera item — is not in this build: two tries, a rise and a swing round him,
// were each measured worse in the probe at 640 × 296 and 844 × 390, and cam28.js is back as build 39 had it)
test('build 40: the follow camera\'s wall guard as build 39 had it (the two tries reverted: no WALL40)', () => {
  assert.ok(!/WALL40/.test(read('src/avodah/day/cam28.js')));
});

// ───────── the acts ─────────
test('build 40: every act\'s layer goes on its thing — the ashes (the bed, the pan), the pyre (the log, the layer), the House (the gate, the inner altar, the lamp, the teni), the blood (the legs, the neck, the vessel, the base), the lamb (its eight places), the lot (his hand); each destroyed with its act; the laver\'s two rings untouched', () => {
  const want = {
    'src/avodah/shift/deshen21.js': [/t40\.place\(padOn && !!k, ph === 'sweep' \? \[\{ x: D21\.bed\.x/, /t40\.destroy\(\)/],
    'src/avodah/shift/maaracha22.js': [/t40\.place\(padOn && !!k, sorting \? \[\{ x: SHOW\[0\]/, /t40\.destroy\(\)/],
    'src/avodah/shift/heichal26.js': [/P26\.gate\.x[^]*GOLD_ALTAR\.x[^]*t40\.place\(!!o40, o40, id40\)/, /t40\.destroy\(\)/],   // (build 41: the inner altar's own top, GOLD_ALTAR — was his stand, P26.alt)
    'src/avodah/shift/dam27.js': [/ph === 'bind' \? \[\{ \.\.\.FORE, r: 0\.6 \}, \{ \.\.\.HIND, r: 0\.6 \}\] : ph === 'cut' \? \[\{ \.\.\.NECK/, /t40\.destroy\(\)/],
    'src/avodah/shift/pen25.js': [/at25\(i, La, a0\.hy, a0\.hp\); pts40\.push/, /pad\.__t40\.destroy\(\)/],
    'src/avodah/shift/pis23.js': [/t40\.place\(wantUp && !!h40, h40, 'p23'\)/, /pad\.__t40\.destroy\(\)/],
  };
  for (const [f, res] of Object.entries(want)) {
    const s = read(f);
    assert.match(s, /import \{ createTouch40 \} from '\.\/touch40\.js';/, f);
    for (const re of res) assert.match(s, re, `${f}: ${re}`);
  }
  assert.ok(!/touch40/.test(read('src/avodah/shift/kiyor20.js')), 'the laver keeps its two rings (the approved two-thumb exception)');
});

test('build 40: the work pad\'s switch (prefs28 pad40) — in the pause card\'s row only (hud.js), ≥ 44 px like its neighbours, pressed state; touch40 reads the same key', () => {
  const h = pad40HTML();
  assert.match(h, /data-p28="pad40"/); assert.match(h, /aria-pressed="false"/); assert.match(h, /class="p28 off"/);
  assert.match(prefsHTML(null, 'sh-p28', h), /data-p28="mute"[^]*data-p28="haptics"[^]*data-p28="pad40"/);
  assert.match(read('src/avodah/shift/hud.js'), /prefsHTML\(h\.prefs\.sfx, 'sh-p28', pad40HTML\(\)\)/);
  assert.ok(!/pad40HTML/.test(read('src/avodah/shift/lobby35.js')), 'not on the opening screen');
  assert.match(read('src/avodah/shift/prefs28.js'), /export const PAD40_KEY = 'bh_pad40';/);
  assert.equal(PAD40_KEY, 'bh_pad40');
  assert.match(read('src/avodah/shift/prefs28.js'), /\.p28\{min-height:44px;min-width:44px/);
});

test('build 40: GAME_BUILD 40; no Divine Name in the changed files (by code points); the pilgrims\' word', () => {
  assert.equal(GAME_BUILD, 56);   // (build 41: the constant moved on) (build 42: again) (build 43: again) (build 44: again) (build 45: again) (build 46: again) (build 47: again) (build 48: again) (build 49: again) (build 50: again) (build 51: again)
  const files = ['src/avodah/shift/touch40.js', 'src/avodah/shift/deshen21.js', 'src/avodah/shift/maaracha22.js', 'src/avodah/shift/heichal26.js', 'src/avodah/shift/dam27.js', 'src/avodah/shift/pen25.js', 'src/avodah/shift/pis23.js', 'src/avodah/shift/prefs28.js', 'src/avodah/shift/hud.js', 'src/game/twin.js', 'tools/autoplay35.js', 'tools/kid34/kid.cjs', 'tools/kid34/kidpage.js', 'PROJECT.md', 'test/build40.test.mjs'];
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  const P = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of files) {
    const s = read(f);
    for (const n of N) assert.ok(!s.includes(n), `${f}: a Name`);
    if (f !== 'test/build40.test.mjs') assert.ok(!s.includes(P), `${f}: the pilgrims are עולי רגל`);
  }
});
