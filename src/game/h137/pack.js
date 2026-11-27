/* ── build 137 ── h137/pack.js — stage 14 "ההיכל" (spec docs/specs/shlav-14-he.md v3) as a pack for the stage director
 * (h109/director.js `pack`): its plan and save (model.js createH137: a level per work per visit), its acts (acts.js), its world (world.js);
 * the opening (rule 3: where am I — over the court, the Heichal's walls and the cells' wing rising by themselves to the cells' height,
 * no crews; a tap skips it); after work 1 the walls rise to 62, after work 2 the two ceilings, the upper chamber, the roof and its
 * parapet rise and the doors hang by themselves (a short look each, once); the finale "ההברקה האחרונה": the last seam on the south
 * wall, one stroke of the agate (the work hand leads, the helper turns the stone into the relief) — it is the last thing he does; then,
 * with no action: the gold of the whole Heichal from matte to polished in one wave from the seam, one deep sound, the fireworks; the
 * camera out to the roof: the birds try to land on the parapet and turn away from the "כלה עורב" spikes (Middot 4:6). No dawn, no
 * gate, no doors that open (that was stage 13's). Then the result card with "שוב, לשיפור".
 */
import { h131Card } from '../h131/card.js';
import { PLAN, LINES, NEXT_STAGE, TITLES, KINDS, LOSS, MUL, WORDS, createH137, fromOld } from './model.js';
import { ACTS } from './acts.js';
import { SH14, initWorld, finalWorld, restWorld, sync as syncWorld } from './world.js';
import { mats14, box } from './look.js';
import { voices14, dp, ring, HANDS } from './kit14.js';
import * as HVK from './havraka-model.js';
import { BOOK } from '../world/grid.js';
import { filmFigs } from '../h128/figgate.js';

const S14 = BOOK.s14, CAM = S14.cam, END = CAM.end, F = S14.floor, ZB = S14.zahav, RF = S14.roof, HV = HVK.HV;
const near = (X, on) => { try { if (X.view && X.view.closeCam) X.view.closeCam(!!on, 'h137-film'); } catch (e) { /* */ } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const beat = (X, ms) => (X && X.wait ? X.wait(ms / 1000) : sleep(ms));
function tapOr(X, ms) {
  return new Promise((res) => {
    let done = false; const f = () => { if (done) return; done = true; removeEventListener('pointerdown', f, true); res(true); };
    setTimeout(() => addEventListener('pointerdown', f, true), 250);
    beat(X, ms).then(() => { if (!done) { done = true; removeEventListener('pointerdown', f, true); res(false); } });
  });
}
export function endRound(n = 4) {
  const [cx, , cz] = [END.c[0], 0, END.c[2]], out = [];
  for (let i = 0; i < n; i++) { const a = -Math.PI * 0.35 + (i / n) * Math.PI * 0.7; out.push([[cx + Math.cos(a) * END.R, END.y, cz + Math.sin(a) * END.R], [cx, 60, cz], 2.2]); }
  return out;
}
/** an old save whose old stage 14 ('heichal') was done: the new stage stands built by the crews */
export function migrate14(G, oldDone) {
  if (!G || G.h137) return false;
  if (!oldDone) return false;
  G.h137 = fromOld(true); return true;
}
const frames = (fn) => new Promise((res) => { let last = performance.now(); const go = (ms) => { const dt = Math.min(0.1, (ms - last) / 1000); last = ms; if (fn(dt)) res(); else requestAnimationFrame(go); }; requestAnimationFrame(go); });
const UI = (e) => !!(e.target && e.target.closest && e.target.closest('button,.gm-top,.gm-menu,.gm-modal'));

/** the walls rising after a work (once each): a short look from over the court */
async function wallsLook(X, w) {
  if (SH14.looking) return; SH14.looking = true;
  try {
    near(X, true); SH14.fast = w >= 2 ? 14 : 8;
    X.shot(CAM.open[0].slice(), [-125, w >= 2 ? 80 : 50, 0], 1.6);
    try { X.line(w >= 2 ? 'שתי התקרות, העלייה, הגג והמעקה עולים. הדלתות נתלות' : 'הכתלים של ההיכל עולים עד שישים ושתיים', 3600); } catch (e) { /* */ }
    await frames(() => SH14.H >= SH14.HT - 0.01);
    await beat(X, 800);
  } finally { SH14.fast = 0; SH14.looking = false; near(X, false); }
}

/* ───────── the finale: the last seam (one stroke of the agate), the shine, the roof and its birds ───────── */
const SEAM = { x: ZB.seam.x, y: 34, z: ZB.seam.z, len: HV.LEN * 0.01 };   // (the seam across the band at eye height, 1.8 amot = 180 dp)
const AG = 150;   // (the agate on the screen, dp: ≥ 144)
async function havraka(X) {
  const T = X.THREE, Mt = mats14(X), V = voices14(X), root = new T.Group(); root.name = 'h137-havraka'; X.props.root.add(root);
  const D = 360 / (200 * Math.tan(20 * Math.PI / 180)), nz = -1;   // (the south wall's normal: −z, into the Heichal)
  const eye = [SEAM.x, SEAM.y + 0.25, SEAM.z + nz * D], aim = [SEAM.x, SEAM.y - 0.1, SEAM.z];
  try { X.lens && X.lens(40); } catch (e) { /* */ }
  try { const c = X.camera; if (c && Math.abs(c.fov - 40) > 0.01) { SH14.fov0 = c.fov; c.fov = 40; c.updateProjectionMatrix(); } } catch (e) { /* */ }
  X.shot(eye, aim, 1.2); await beat(X, 1300);
  // the seam's frame: x from its start along the wall (as he faces it: screen right = −x of the world), y up; dp
  const wp = (x, y, off = 0.04) => [SEAM.x + SEAM.len / 2 - x * 0.01, SEAM.y + y * 0.01, SEAM.z + nz * off];
  const seam = box(X, Mt.y14scar, 0, 0, 0, 1, 1, 1, root); { const a = wp(0, 0), b = wp(HV.LEN, 0); seam.scale.set(Math.abs(a[0] - b[0]), 0.035, 0.02); seam.position.set((a[0] + b[0]) / 2, SEAM.y, SEAM.z + nz * 0.03); }
  const relief = box(X, Mt.y14goldMatte, 0, 0, 0, 1, 1, 1, root); { const a = wp(HV.LEN / 2, 0), b = wp(HV.LEN, 0); relief.scale.set(Math.abs(a[0] - b[0]), 0.5, 0.06); relief.position.set((a[0] + b[0]) / 2, SEAM.y, SEAM.z + nz * 0.05); }
  // the polish the stone leaves behind it: a bright strip growing along the seam (the relief's half shines only where the stone was
  // turned onto it; turned wrong, it stays matte there) — the stroke is an action, not an animation (build 137 review)
  const trail = [];
  { const n = 24; for (let i = 0; i < n; i++) { const a = wp(HV.LEN * i / n, 0), b = wp(HV.LEN * (i + 1) / n, 0); const q = new T.Mesh(new T.PlaneGeometry(Math.abs(a[0] - b[0]) + 0.005, 0.5), Mt.y14gold.clone()); q.material.transparent = true; q.material.opacity = 0; if (q.material.emissive) q.material.emissive.set('#FFE7A0'); q.position.set((a[0] + b[0]) / 2, SEAM.y, SEAM.z + nz * 0.085); q.rotation.y = Math.PI; root.add(q); trail.push({ q, x: HV.LEN * (i + 0.5) / n, on: 0, ok: true }); } }
  let sparkT = 0;
  const stone = new T.Group(); root.add(stone);
  const bar = new T.Mesh(new T.BoxGeometry(AG * 0.01, 0.12, 0.1), Mt.y14agate); bar.position.x = -AG * 0.005; stone.add(bar);
  const gW = new T.Mesh(new T.BoxGeometry(0.16, 0.2, 0.14), Mt.y14handR); stone.add(gW);
  const gH = new T.Mesh(new T.BoxGeometry(0.16, 0.2, 0.14), Mt.y14handL); gH.position.x = -AG * 0.01; stone.add(gH);
  const rings = { w: ring(HANDS.R), h: ring(HANDS.L) };
  let tAll = 0;
  const S = HVK.fresh(); let ang = 0, tip = { x: 4, y: 0, down: false };
  const scr = (p) => { try { const r = X.scr(p[0], p[1], p[2]); return { x: r.x, y: r.y }; } catch (e) { return { x: innerWidth / 2, y: innerHeight / 2 }; } };
  const toSeam = (cx, cy) => { try { const ray = X.rayAt(cx, cy), t = (SEAM.z - ray.origin.z) / ray.direction.z, hx = ray.origin.x + ray.direction.x * t, hy = ray.origin.y + ray.direction.y * t; return { x: (SEAM.x + SEAM.len / 2 - hx) / 0.01, y: (hy - SEAM.y) / 0.01 }; } catch (e) { return null; } };
  const tailOf = () => ({ x: tip.x - AG * Math.cos(ang * Math.PI / 180), y: tip.y - AG * Math.sin(ang * Math.PI / 180) });
  const near56 = (e, p) => { const s = scr(wp(p.x, p.y, 0.1)); return Math.abs(e.clientX - s.x) <= dp(32) && Math.abs(e.clientY - s.y) <= dp(32); };
  const H = { w: null, h: null };
  const dn = (e) => {
    if (UI(e) || S.done) return;
    if (e.button === 2 || (H.w && !H.h && near56(e, tailOf()))) { H.h = { id: e.pointerId, y0: e.clientY, a0: ang }; return; }
    if (!H.w && (near56(e, tip) || near56(e, { x: tip.x - 30, y: tip.y }))) { H.w = { id: e.pointerId }; const q = toSeam(e.clientX, e.clientY); if (q) tip = { x: Math.max(tip.x - 20, q.x), y: q.y, down: true }; return; }
    if (!H.h && H.w && near56(e, tailOf())) H.h = { id: e.pointerId, y0: e.clientY, a0: ang };
  };
  const mv = (e) => {
    if (H.w && e.pointerId === H.w.id) { const q = toSeam(e.clientX, e.clientY); if (q) tip = { x: q.x, y: q.y, down: true }; }
    if (H.h && e.pointerId === H.h.id) { const dy = (H.h.y0 - e.clientY) / dp(1); ang = Math.max(-HV.MAX_ANG, Math.min(HV.MAX_ANG, H.h.a0 + Math.atan2(dy, AG) * 180 / Math.PI * 1.6)); }
  };
  const up = (e) => { if (H.w && e.pointerId === H.w.id) { H.w = null; tip = { ...tip, down: false }; } if (H.h && e.pointerId === H.h.id) H.h = null; };
  const ctx = (e) => { e.preventDefault(); };
  addEventListener('pointerdown', dn, true); addEventListener('pointermove', mv, true); addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true); addEventListener('contextmenu', ctx, true);
  try { X.line('התפר האחרון: הובילו את האגט לאורך התפר בתנועה אחת. באמצע, היד השנייה מטה את האבן אל התבליט', 5200); } catch (e) { /* */ }
  try { X.hand({ x: wp(4, 0, 0.1)[0], y: SEAM.y, z: SEAM.z + nz * 0.1 }, 0, 40); } catch (e) { /* */ }
  const auto = !!globalThis.__H137_AUTO_FINALE;
  let res = null;
  await frames((dt) => {
    tAll += dt;
    let inp;
    if (auto) { inp = HVK.bot(S, {}); tip = { ...inp.tip }; ang = inp.ang; } else inp = { tip: H.w ? tip : { ...tip, down: false }, ang };
    if (H.w || auto) X.hand(null);
    for (const e of HVK.step(S, dt, inp)) {
      if (e.k === 'start') V.agate(0.6);
      if (e.k === 'lift' || e.k === 'off') { V.agate(0); try { X.line('האבן עזבה את התפר. ממשיכים מאותו מקום', 1800); } catch (er) { /* */ } }
      if (e.k === 'done') res = e;
    }
    V.agate(S.on ? 0.8 : 0);
    // the stone: its lead grip on the tip, turned by the helper
    const p = wp(S.on ? S.x : tip.x, tip.y, 0.1); stone.position.set(p[0], p[1], p[2]); stone.rotation.set(0, Math.PI, ang * Math.PI / 180);
    { const relief = S.x > HV.LEN / 2, right = Math.abs(ang - HV.RELIEF) <= HV.ANG_TOL;
      for (const tr of trail) if (S.on && !tr.on && tr.x <= S.x) { tr.on = 1; tr.ok = tr.x <= HV.LEN / 2 || right; }
      for (const tr of trail) if (tr.on) { tr.q.material.opacity = Math.min(tr.ok ? 0.85 : 0.25, tr.q.material.opacity + dt * 3); if (tr.q.material.emissiveIntensity != null) tr.q.material.emissiveIntensity = tr.ok ? 0.5 + 0.25 * Math.sin(tAll * 6 - tr.x * 0.08) : 0; }
      sparkT -= dt; if (S.on && relief && right && sparkT <= 0) { sparkT = 0.12; const p = wp(S.x, 0, 0.12); try { X.sparks(p[0], p[1], p[2], 3); } catch (er) { /* */ } } }
    seam.scale.x = Math.max(0.001, (HV.LEN - S.x) * 0.01); { const a = wp(S.x, 0), b = wp(HV.LEN, 0); seam.position.x = (a[0] + b[0]) / 2; }
    const sw = scr(wp(tip.x, tip.y, 0.1)), t = tailOf(), sh = scr(wp(t.x, t.y, 0.1));
    if (H.w) rings.w.show(sw.x, sw.y, Math.min(1, S.x / HV.LEN), S.on); else rings.w.hide();
    if (H.h) rings.h.show(sh.x, sh.y, Math.abs(ang) / HV.MAX_ANG, S.x > HV.LEN / 2 && Math.abs(ang - HV.RELIEF) <= HV.ANG_TOL); else rings.h.hide();
    return !!res;
  });
  removeEventListener('pointerdown', dn, true); removeEventListener('pointermove', mv, true); removeEventListener('pointerup', up, true); removeEventListener('pointercancel', up, true); removeEventListener('contextmenu', ctx, true);
  rings.w.remove(); rings.h.remove(); V.agate(0);
  // the points: the one step (40 / 20 / 10), no cost for tries
  try { const base = res.grade === 'gold' ? 40 : res.grade === 'good' ? 20 : 10; X.hit({ x: SEAM.x, y: SEAM.y + 0.6, z: SEAM.z + nz * 0.3 }, res.grade, { craft: 'זהב', text: `+${base}` }); } catch (e) { /* */ }
  const st = X.M.st; st.seam = res.grade; X.save();
  // the shine: the seam is gone, all the Heichal's gold from matte to polished in one wave out of the seam
  root.remove(seam); root.remove(stone); V.deep(); try { X.haptic && X.haptic([30, 40, 60]); } catch (e) { /* */ }
  const wave = new T.Mesh(new T.RingGeometry(0.1, 0.6, 40), Mt.y14goldLit); wave.position.set(SEAM.x, SEAM.y, SEAM.z + nz * 0.08); wave.rotation.y = Math.PI; root.add(wave);
  X.shot([SEAM.x, SEAM.y + 3, SEAM.z + nz * 16], [SEAM.x, SEAM.y + 2, SEAM.z], 2.2);
  let tw = 0;
  await frames((dt) => { tw += dt; const r = 1 + tw * 22; wave.scale.setScalar(r); wave.material.opacity = Math.max(0, 1 - tw / 1.8); wave.material.transparent = true; if (tw > 0.9 && SH14.shine < 1) { SH14.shine = 1; SH14.key = ''; syncWorld(X, X.M); } return tw > 1.9; });
  root.remove(wave);
  if (res.grade === 'gold') { try { X.perfect(WORDS.havraka, { x: SEAM.x, y: SEAM.y + 2, z: SEAM.z + nz * 2 }); } catch (e) { /* */ } }
  for (let i = 0; i < 6; i++) { try { X.sparks(-130 + i * 5, 30 + (i % 3) * 6, (i % 2 ? 1 : -1) * 6, 22); } catch (e) { /* */ } V.shine(); await beat(X, 260); }
  try { const c = X.camera; if (c && SH14.fov0) { c.fov = SH14.fov0; c.updateProjectionMatrix(); SH14.fov0 = null; } } catch (e) { /* */ }
  X.props.remove(root);
  return res;
}
/** with no action: out to the roof, the birds turn away from the spikes (a few seconds; animals, not figures: they show what the spikes do) */
async function roofBirds(X) {
  const T = X.THREE, Mt = mats14(X), root = new T.Group(); root.name = 'h137-birds'; X.props.root.add(root);
  X.shot([-84, RF.top + 16, -34], [-128, RF.parapet, 0], 2.2); await beat(X, 2000);
  const birds = [0, 1, 2].map((i) => { const g = new T.Group(); const b = new T.Mesh(new T.BoxGeometry(0.6, 0.22, 0.22), Mt.y14bird); g.add(b); for (const s of [-1, 1]) { const w = new T.Mesh(new T.BoxGeometry(0.3, 0.04, 0.6), Mt.y14bird); w.position.z = s * 0.35; g.add(w); g.userData['w' + s] = w; } g.position.set(-100 - i * 6, RF.top + 8 + i, -26 - i * 3); root.add(g); return g; });
  try { X.line('"וכלה עורב" על המעקה: העורבים לא נוחתים (מדות ד, ו)', 4200); } catch (e) { /* */ }
  let t = 0;
  await frames((dt) => {
    t += dt;
    birds.forEach((g, i) => {
      const k = Math.min(1, Math.max(0, (t - i * 0.4) / 2.2)), x0 = -100 - i * 6, tx = -120 - i * 9, tz = -RF.y * 0 - 14.7;
      const land = k < 0.7, x = x0 + (tx - x0) * Math.min(1, k / 0.7), z = (-26 - i * 3) + (tz - (-26 - i * 3)) * Math.min(1, k / 0.7);
      const y = land ? RF.top + 8 + i - (RF.top + 8 + i - (RF.top + 0.8)) * (k / 0.7) : RF.top + 0.8 + (k - 0.7) * 30;   // (down to the spikes, then up and away)
      g.position.set(land ? x : tx - (k - 0.7) * 12, y, land ? z : tz - (k - 0.7) * 26); g.rotation.y = land ? Math.atan2(tz - z, tx - x) * -1 : 2.2;
      const f = Math.sin(t * (land && k > 0.5 ? 30 : 14) + i); for (const s of [-1, 1]) g.userData['w' + s].rotation.x = s * f * 0.7;
    });
    return t > 4.4;
  });
  X.props.remove(root);
}
async function fireworks(X) {
  const P = [[0, 24, 0], [-10, 30, -6], [10, 28, 6], [-5, 36, 8], [7, 34, -10], [0, 42, 0], [-14, 38, 3], [14, 40, -3]];
  const [cx, cz] = [-118, 0];
  for (const p of P) { try { X.sparks(cx + p[0], RF.y + p[1] * 0.4, cz + p[2], 46); X.dust(cx + p[0], RF.y + p[1] * 0.4, cz + p[2], 4, 8); if (X.play) X.play('fanfare', { level: 3 }); } catch (e) { /* */ } await beat(X, 330); }
}
function pointsRows(st) {
  let base = 0, lvb = 0; for (const [id, r] of Object.entries(st.res || {})) { const lv = +String(id).slice(-1) || 1, p = (r && r.pts) | 0; base += p; lvb += p * ((MUL[lv] || 1) - 1); }
  return `<ul class="pts"><li>נקודות העבודות: ${base}</li>${lvb ? `<li>בונוס הרמה: ${lvb}</li>` : ''}<li>הרצף הטוב ביותר: ${st.best | 0}</li></ul>`;
}
const starsOf = (st, k) => Math.max(0, ...[1, 2, 3].map((lv) => (st.res[k + lv] ? st.res[k + lv].stars | 0 : 0)));
export function againOf(M) { const c = KINDS.map((k) => [k, starsOf(M.st, k)]); c.sort((a, b) => a[1] - b[1]); return c[0][0]; }
function resultCard(M) {
  return new Promise((res) => {
    if (typeof document === 'undefined') { res(null); return; }
    const st = M.st, best = st.bestOf || {}, row = (w) => { const b = best[w]; const s = b ? b.stars | 0 : Math.max(0, ...Object.keys(st.res || {}).filter((id) => id.startsWith(w)).map((id) => st.res[id].stars | 0)); return `<li><b>${TITLES[w]}</b> <i>${'★'.repeat(s)}${'☆'.repeat(3 - s)}</i></li>`; };
    const fl = {}; for (const x of st.flaws || []) { fl[x.f] = (fl[x.f] || 0) + 1; }
    const fls = Object.entries(fl).map(([f, n]) => `<li>${LOSS[f] ? LOSS[f][0] : f}${n > 1 ? ` ×${n}` : ''}</li>`).join('') || '<li>אין נזקים למראה</li>';
    const low = againOf(M), seam = st.seam === 'gold' ? 'התפר האחרון נעלם במהלך אחד' : st.seam ? 'התפר האחרון הוברק' : '';
    const el = document.createElement('div'); el.className = 'h109-ui h137-card';
    el.innerHTML = `<style>.h137-card{position:fixed;inset:0;z-index:60;display:grid;place-items:center;background:rgba(14,10,4,.42);font-family:Heebo,system-ui;direction:rtl}.h137-card>div{background:#FBF6EA;color:#3A2A14;border-radius:16px;padding:14px 22px;width:min(92vw,560px);max-height:92vh;overflow:auto;box-shadow:0 8px 30px rgba(0,0,0,.35)}.h137-card h3{margin:0 0 4px;font-size:22px}.h137-card ul{margin:2px 0 6px;padding:0 18px;font-size:15px;line-height:1.35}.h137-card ul.r,.h137-card ul.pts{display:flex;flex-wrap:wrap;gap:2px 18px;list-style:none;padding:0}@media (max-height:420px){.h137-card>div{padding:10px 16px}.h137-card h3{font-size:19px}.h137-card ul{font-size:14px}}.h137-card i{color:#C08A1A;font-style:normal;letter-spacing:1px}.h137-card .w{color:#2E7A3A;font-weight:800}.h137-card button{font:800 17px Heebo,system-ui;border:0;border-radius:12px;padding:10px 16px;margin-inline-end:8px;min-height:44px;background:#C08A1A;color:#fff}.h137-card button.b{background:#E8DCC2;color:#3A2A14}</style>`
      + `<div><h3>ההיכל</h3><div class="w">כל הבית טוח בזהב, חוץ מאחר הדלתות${seam ? ' · ' + seam : ''}</div><ul class="r">${KINDS.map(row).join('')}</ul>${pointsRows(st)}<b>מה נשאר בעולם</b><ul>${fls}</ul><button class="a">שוב, לשיפור: ${TITLES[low]}</button><button class="b">להמשיך</button></div>`;
    document.body.appendChild(el);
    const close = (v) => { try { el.remove(); } catch (e) { /* */ } res(v); };
    el.querySelector('.a').addEventListener('click', (e) => { e.stopPropagation(); close(low); });
    el.querySelector('.b').addEventListener('click', (e) => { e.stopPropagation(); close(null); });
    setTimeout(() => close(null), 25000);
  });
}

export function makePack14(env = {}) {
  const RD = endRound();
  const P = {
    time: env,
    id: 'heichal', key: 'h137', wordScreen: true,
    name: 'ההיכל', PLAN, ACTS, icon: '✨',
    create: (save) => createH137(save),
    count: (M) => M.count(),
    freeFilms: true,
    workLinks: true,
    workSeed(M) { M.st.intro = 1; M.st.look = 3; },
    quiet: true,
    byPlan: true,
    endTitle: 'ההיכל נבנה!',
    upStrip: true,
    endSub: 'שכל הבית טוח בזהב, חוץ מאחר הדלתות (מדות ד, א)',
    nextStage: NEXT_STAGE,
    endView: [RD[0][0], RD[0][1]],
    film: endRound(3),
    sync(M, S0, instant, X) {
      if (!X || !SH14.X) return;
      if (M.finished() && !M.mission()) finalWorld(X);
      // (after works 1 and 2: the walls, then the ceilings, the roof and the doors rise by themselves — a short look each, once)
      const w = M.wallsWanted();
      if (w > (M.st.look | 0) && !(X.acting && X.acting())) { M.st.look = w; M.st.walls = Math.max(M.st.walls | 0, w); X.save(); wallsLook(X, w).catch(() => {}); }
    },
    visits: true,
    unitEnd: () => null,
    /** the opening (rule 3): over the court from the south-east, the Heichal's walls and the cells' wing rising to the cells' height */
    before(m, X, M) {
      try { globalThis.__H137_X = X; } catch (e) { /* (the probes) */ }
      const st = M.st;
      if (m || st.intro) { return null; }
      return (async () => {
        st.intro = 1; X.save(); near(X, true);
        const acting = () => { try { return !!(X.acting && X.acting()); } catch (e) { return false; } };
        SH14.H = S14.hallFloor; SH14.key = '';
        X.line(LINES.stage, 0);
        X.shot(CAM.open[0].slice(), CAM.open[1].slice(), 0.01);
        const V = voices14(X);
        const tick = setInterval(() => { try { if (SH14.H < SH14.HT - 0.5) V.knock(); } catch (e) { /* */ } }, 700);
        SH14.fast = 2.6;
        const tapped = await tapOr(X, 7000);
        clearInterval(tick);
        if (tapped) { SH14.fast = 60; await beat(X, 400); }
        SH14.fast = 0;
        if (!acting()) X.line('');
        if (!acting()) { try { X.stages.hero.place({ x: S14.start[0], z: S14.start[1], face: [-92, 0] }); } catch (e) { /* */ } }
        near(X, false);
      })();
    },
    /** the last seam (his), the shine, the roof's birds (once, after it); then the result card */
    async finale(X) {
      const M = X.M, st = M.st; finalWorld(X);
      near(X, true);
      let figsBack = null; try { figsBack = filmFigs({}); } catch (e) { figsBack = null; }   // (no idle figures: only the kohen)
      if (!st.finale) {
        try { await havraka(X); } catch (e) { console.warn('[h137] havraka', e && e.message); }
        try { await fireworks(X); } catch (e) { /* */ }
        try { await roofBirds(X); } catch (e) { /* */ }
        st.finale = 1; X.save(); SH14.key = ''; finalWorld(X);
      }
      near(X, false);
      const low = await resultCard(M);
      if (low) { P.again = low; try { X.line(`שוב, לשיפור: ${TITLES[low]}. הולכים אל העבודה`, 4000); } catch (e) { /* */ } }
      h131Card(true);
      if (figsBack) SH14.figsBack = figsBack;
    },
    rest(X, M) { restWorld(X, M); },
    dispose() {},
  };
  void initWorld;
  return P;
}
