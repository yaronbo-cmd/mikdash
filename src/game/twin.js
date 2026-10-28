/* twin.js — two thumbs at the Mount (wave 17; docs/PRINCIPLES.md §2–§4; docs/WAVE17-BRIEF.md "the contract").
 * The owner (5.10 07:54–07:59): "באחד זז ובשני מכה… לרוחב… מצלמה כמו ברול סטאר… שליטה בשני אגודלים".
 *
 *   const T = createTwin({ ui, view, stages, emit, sfx, haptic, settings, root,
 *     live() → bool (the game is live: started, not the reel, not the opening, not the whole view),
 *     stage() → the stage he works at ('har' turns it on), moment() → bool (a card, a modal or a moment owns the screen),
 *     work(hp) → { icon, label, strike, at:{x,y,z}, go(ev) } | null  (what the right thumb does here, now),
 *     marks() → [{ job, icon, label, x, y, z }]  (the deal's cards as markers in the world) });
 *   T.update(ms) every game frame · T.on · T.pips() · T.feedback(at, text, kind) · T.event(type, d) · T.destroy()
 *
 * ON when all hold: landscape (innerWidth > innerHeight and innerWidth ≥ 640), the stage is 'har', the game is live, no
 * ?twin=0. ON sets `.tw-on` on the game root and emits `twin {on}`; rotating the phone flips it live. While ON:
 *  · the left thumb: a floating stick (where it lands in the left zone; radius 60; a small dead zone; release = stop) walks
 *    him along the stick relative to the camera (stages.hero.drive: on the ground, never through a wall, a rock, the crane);
 *  · the right thumb: the work button (the job's icon when there is work at hand; tap = the place's basic act, drag = the
 *    aimed act, release = do it); three pips that refill in about a second (the strikes only);
 *  · the follow camera (settings().cam !== 'director'): one bearing, 57° down, soft, a small lead toward his walk, never a
 *    cut; a pinch on the free canvas zooms out (he may leave the screen) and a touch on the stick brings it back to him.
 * Every touch on material answers at once four ways (dust, a float, a shake and a buzz, a sound): T.feedback.
 * No allocation per frame: the markers are a pool, the vectors are numbers.
 */
const CSS = `
.gm .tw-zone,.gm .tw-pad,.gm .tw-mk,.gm .tw-aim,.gm .tw-flash{display:none}
.gm.tw-on .tw-zone.tw-nostick{display:none!important}
/* ── fable32 (build 39) ── the guided walk: the whole world is the walk's surface (under every pad, button and card), no stick drawn ── /fable32 ── */
body .gm.tw-on.tw-g39 .tw-zone{left:0;top:0;width:100%;bottom:0;z-index:3}
.gm.tw-on.tw-g39 .tw-base,.gm.tw-on.tw-g39 .tw-ghost,.gm.tw-on.tw-g39 .tw-zone .tw-tip{display:none!important}
.gm.tw-on .tw-zone{display:block;position:absolute;left:0;bottom:0;width:var(--tw-left-w,45vw);top:var(--tw-left-top,35vh);z-index:4;touch-action:none;pointer-events:auto;-webkit-user-select:none;user-select:none}
.gm.tw-on.tw-hold .tw-zone,.gm.tw-on.tw-hold .tw-pad{opacity:.25;pointer-events:none}
.tw-base{position:absolute;left:0;top:0;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;background:radial-gradient(circle,rgba(28,20,10,.18),rgba(28,20,10,.38));border:2px solid rgba(255,236,190,.55);box-shadow:0 0 0 1px rgba(0,0,0,.25);opacity:0;transition:opacity .12s;pointer-events:none}
.tw-base.on{opacity:1}
.tw-knob{position:absolute;left:50%;top:50%;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#FFF1C8,#E2B65A 70%,#9A6F1E);box-shadow:0 2px 8px rgba(0,0,0,.4)}
.tw-ghost{position:absolute;left:calc(18% - 30px);bottom:calc(16% + env(safe-area-inset-bottom,0px));width:60px;height:60px;border-radius:50%;border:2px dashed rgba(255,236,190,.45);pointer-events:none;transition:opacity .3s}
.tw-zone.act .tw-ghost{opacity:0}
.tw-tip{position:absolute;padding:6px 10px;border-radius:12px;background:rgba(28,20,10,.82);color:#FFF6DA;font:700 13px/1.2 "Heebo",system-ui,sans-serif;direction:rtl;white-space:nowrap;pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.35);animation:tw-bob 1.2s ease-in-out infinite alternate}
.tw-zone .tw-tip{left:calc(18% - 40px);bottom:calc(16% + 70px + env(safe-area-inset-bottom,0px))}
.tw-pad .tw-tip{right:8px;bottom:146px}
.tw-tip[hidden]{display:none}
.gm.tw-on .tw-pad .tw-tip.ux-hand{right:96px;bottom:106px;background:#FFD66E;color:#2A1804;white-space:normal;max-width:112px;text-align:center}   /* ── ux24 ── ── /ux24 ── */
/* ── twin20 ── */
.tw-pad .tw-tip.t20{right:8px;bottom:176px}
.tw-pw20{position:absolute;right:30px;bottom:136px;display:none;gap:5px;pointer-events:none}.tw-pw20.on{display:flex}
.tw-pw20 i{display:block;width:22px;height:8px;border-radius:4px;background:rgba(40,28,12,.6);border:1px solid rgba(255,236,190,.6)}.tw-pw20 i.f{background:#FFD66E}
.tw-btn.aiming .tw-ic{transition:none}
.tw-mk.aimed .tw-mi{background:#FFD66E;transform:scale(1.25);box-shadow:0 0 0 6px rgba(255,255,255,.5)}
/* ── /twin20 ── */
@keyframes tw-bob{from{transform:translateY(0)}to{transform:translateY(-5px)}}
.gm.tw-on .tw-pad{display:block;position:absolute;right:calc(env(safe-area-inset-right,0px) + 6px);bottom:calc(env(safe-area-inset-bottom,0px) + 4px);width:var(--tw-right-w,230px);height:var(--tw-right-h,210px);z-index:4;pointer-events:none;direction:rtl}
.tw-btn{position:absolute;right:22px;bottom:20px;width:96px;height:96px;border-radius:50%;border:3px solid rgba(255,236,190,.75);background:radial-gradient(circle at 40% 30%,#6B5434,#2A1E10);color:#FFF6DA;font:800 13px/1.1 "Heebo",system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;pointer-events:auto;touch-action:none;-webkit-user-select:none;user-select:none;box-shadow:0 4px 14px rgba(0,0,0,.45);opacity:.55;transition:opacity .15s,transform .08s,border-color .15s}
.tw-btn .tw-ic{font-size:34px;line-height:1}
.tw-btn.awake{opacity:1;border-color:#FFD66E;background:radial-gradient(circle at 40% 30%,#C8923A,#6A4614)}
.tw-btn.awake::after{content:"";position:absolute;inset:-8px;border-radius:50%;border:2px solid rgba(255,214,110,.6);animation:tw-ring 1.4s ease-out infinite}
.tw-btn.down{transform:scale(.92)}
.tw-btn.empty{filter:saturate(.4) brightness(.8)}
@keyframes tw-ring{from{transform:scale(.92);opacity:.9}to{transform:scale(1.18);opacity:0}}
.tw-rg,.tw-rgo{position:absolute;right:22px;bottom:20px;width:96px;height:96px;border-radius:50%;pointer-events:none;box-sizing:border-box;opacity:0}
.tw-rgo{border:4px solid rgba(255,214,110,.95);box-shadow:0 0 10px rgba(255,190,70,.6);transform:scale(1.14)}
.tw-rg{border:3px solid #FFF6DA;box-shadow:0 0 0 2px rgba(40,28,12,.55);will-change:transform}
.tw-pad.ring .tw-rg,.tw-pad.ring .tw-rgo{opacity:1}
.tw-btn.g-perfect{border-color:#FFE08A;box-shadow:0 0 22px 8px rgba(255,200,80,.95)}.tw-btn.g-good{border-color:#FFF6DA}.tw-btn.g-soft{filter:brightness(.85)}
.tw-pips{position:absolute;right:30px;bottom:124px;display:flex;gap:5px;pointer-events:none}
.tw-pips i{display:block;width:22px;height:8px;border-radius:4px;background:rgba(40,28,12,.6);border:1px solid rgba(255,236,190,.6);overflow:hidden;position:relative}
.tw-pips i b{position:absolute;inset:0;background:#FFD66E;transform-origin:right;transform:scaleX(1)}
.tw-hand{position:absolute;right:136px;bottom:34px;width:64px;height:64px;border-radius:50%;border:2px solid rgba(255,236,190,.5);background:#2A1E10;color:#FFF6DA;font:800 11px/1.05 "Heebo",system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:auto;touch-action:none;opacity:.5;overflow:hidden}
.tw-hand .tw-fill{position:absolute;left:0;right:0;bottom:0;background:rgba(255,214,110,.35);height:0}
.tw-hand span{position:relative}
.tw-hand.ready{opacity:1;border-color:#FFD66E;box-shadow:0 0 16px 4px rgba(255,214,110,.75);animation:tw-glow 1s ease-in-out infinite alternate}
@keyframes tw-glow{from{box-shadow:0 0 8px 2px rgba(255,214,110,.5)}to{box-shadow:0 0 22px 7px rgba(255,214,110,.95)}}
.gm.tw-on .tw-mk{display:flex;position:absolute;left:0;top:0;z-index:3;pointer-events:none;flex-direction:column;align-items:center;gap:2px;direction:rtl;font:700 12px/1.1 "Heebo",system-ui,sans-serif;color:#FFF6DA;text-shadow:0 1px 3px rgba(0,0,0,.8);transform:translate(-999px,-999px);will-change:transform}
.tw-mk.f26l .tw-mi{position:relative}.tw-mk.f26l .tw-mi::after{content:"";position:absolute;left:2px;right:2px;bottom:-9px;height:6px;border-radius:3px;border:1px solid rgba(20,40,60,.8);background:linear-gradient(90deg,#4FA3DA calc(var(--f26l,0)*100%),rgba(230,240,250,.85) 0)}
.tw-mk .tw-mi{width:44px;height:44px;border-radius:50%;background:rgba(42,30,16,.82);border:2px solid #FFD66E;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 0 0 4px rgba(255,214,110,.22)}
.tw-mk.near .tw-mi{background:#C8923A;animation:tw-glow .8s ease-in-out infinite alternate}
.tw-mk i{display:block;width:2px;height:16px;background:linear-gradient(#FFD66E,rgba(255,214,110,0))}
.gm.tw-on .tw-aim{display:block;position:absolute;left:0;top:0;height:6px;width:0;border-radius:3px;background:linear-gradient(90deg,rgba(255,255,255,.9),rgba(255,214,110,.35));transform-origin:0 50%;z-index:3;pointer-events:none;opacity:0}
.gm.tw-on .tw-aim.on{opacity:1}
.gm .tw-goal{display:none}
.gm.tw-on .tw-goal{display:flex;position:absolute;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:rgba(42,30,16,.85);border:2px solid #FFD66E;color:#FFF6DA;font-size:20px;align-items:center;justify-content:center;z-index:3;pointer-events:none;transform:translate(-999px,-999px)}
.tw-goal b{position:absolute;left:50%;top:50%;width:0;height:0;border:8px solid transparent;border-left:12px solid #FFD66E;margin:-8px 0 0 -6px;transform-origin:6px 8px}
.gm.tw-on .tw-flash{display:block;position:absolute;inset:0;z-index:5;pointer-events:none;background:radial-gradient(circle at var(--fx,50%) var(--fy,50%),rgba(255,220,120,.55),rgba(255,200,80,0) 55%);opacity:0;transition:opacity .25s}
.gm.tw-on .tw-flash.on{opacity:1;transition:none}
`;
// ── nav19 ── the overview button "מבט על" (note 1: in the right zone above the pips, 60 px), the compass as a button (note 3), "אני" over him
// in the overview
const CSS_NAV = `
.gm .tw-ov,.gm .tw-me{display:none}
.gm.tw-on .tw-ov{display:flex;position:absolute;right:20px;bottom:140px;width:60px;height:60px;border-radius:50%;border:2px solid rgba(255,236,190,.7);background:radial-gradient(circle at 40% 30%,#4E6A7A,#1E2C36);color:#FFF6DA;font:800 11px/1.05 "Heebo",system-ui,sans-serif;flex-direction:column;align-items:center;justify-content:center;gap:1px;pointer-events:auto;touch-action:none;-webkit-user-select:none;user-select:none;box-shadow:0 3px 10px rgba(0,0,0,.4);padding:0}
.tw-ov .tw-ovi{font-size:22px;line-height:1}
.tw-ov.on{border-color:#FFD66E;background:radial-gradient(circle at 40% 30%,#C8923A,#6A4614)}
.gm.tw-on .tw-pad .tw-tip{bottom:208px}
.gm.tw-on .tw-goal{z-index:5;pointer-events:auto;cursor:pointer;touch-action:none;width:46px;height:46px;margin:-23px 0 0 -23px;font-size:21px;box-shadow:0 0 0 4px rgba(255,214,110,.25),0 2px 8px rgba(0,0,0,.4)}
.gm.tw-on.tw-hold .tw-goal{pointer-events:none}
.tw-goal.go{animation:tw-goal-go .35s ease-out}
@keyframes tw-goal-go{from{box-shadow:0 0 0 0 rgba(255,214,110,.95)}to{box-shadow:0 0 0 22px rgba(255,214,110,0)}}
.gm.tw-on .tw-me{display:block;position:absolute;left:0;top:0;z-index:3;pointer-events:none;transform:translate(-999px,-999px);direction:rtl;font:800 12px/1 "Heebo",system-ui,sans-serif;color:#2A1E10}
.tw-me span{display:block;padding:4px 8px;border-radius:10px;background:#FFD66E;box-shadow:0 2px 6px rgba(0,0,0,.45);white-space:nowrap}
.tw-me i{display:block;width:0;height:0;margin:0 auto;border:7px solid transparent;border-top:9px solid #FFD66E}
`;
// ── /nav19 ──
// ── cam28 ── the "lift me up" hint on the right half (the first 3 days; a quiet chip, no bob) and the chip behind a wall
const CSS_28 = `
.gm .tw-lift{display:none}
.gm.tw-on .tw-lift{display:flex;position:absolute;right:150px;top:46%;z-index:3;pointer-events:none;flex-direction:column;align-items:center;gap:2px;direction:rtl;font:700 12px/1.15 "Heebo",system-ui,sans-serif;color:#FFF6DA;text-shadow:0 1px 3px rgba(0,0,0,.85);opacity:.78;transition:opacity .4s}
.gm.tw-on .tw-lift[hidden]{display:none}
.tw-lift b{font:800 26px/1 "Heebo",system-ui,sans-serif;width:44px;height:44px;border-radius:50%;border:2px solid rgba(255,236,190,.7);background:rgba(28,20,10,.55);display:flex;align-items:center;justify-content:center;padding-top:8px;box-sizing:border-box}
.tw-lift span{padding:3px 8px;border-radius:10px;background:rgba(28,20,10,.62);white-space:nowrap}
.tw-mk.c28o{opacity:.5}
`;
// ── /cam28 ──
// ── crafta19 ── the ring ≥ 110 px (FUN19 §2: 116 round the 96-px button) and its mirror on the work (ui.ring, under .tw-on: 112 px)
const CSS_CA = `
.gm.tw-on .tw-rg,.gm.tw-on .tw-rgo{right:12px;bottom:10px;width:116px;height:116px}
.gm.tw-on .tw-rgo{transform:none;border-width:5px}
.gm.tw-on .tw-pad.rg-hit .tw-rgo{box-shadow:0 0 26px 10px rgba(255,200,80,.9)}
.gm.tw-on .gm-ring b,.gm.tw-on .gm-ring i{left:-56px;top:-56px;width:112px;height:112px}
.gm.tw-on .gm-ring b{border-width:6px}.gm.tw-on .gm-ring i{border-width:5px}
`;
// ── /crafta19 ──
const R = 60, DEAD = 8, SPEED = 11, PIPS = 3, PIP_MS = 330, PIP_WAIT = 300;   // ── crafta19 ── (PIP_WAIT 700 → 300: at the rhythm's ≈ 1 act a second the pips never run dry — a touch that does nothing is the bug; a mash still dries them) ── /crafta19 ──   // ── twin18 ── (PIP_WAIT 380 → 700: the pips really run dry under a quick thumb) ── /twin18 ──
// ── recovered (16–26c) ── the grade windows (seconds from the gold moment: מושלם · טוב · the rest soft), shared with stations.js's timing acts
export const GRADE = Object.freeze({ PERF: 0.085, GOOD: 0.2 });
// ── recovered (16–26c) ── a grade from the offset to the gold moment (k widens the windows) — stations.js's timing acts
export const gradeOf = (d, k = 1) => (Math.abs(d) <= GRADE.PERF * k ? 'perfect' : Math.abs(d) <= GRADE.GOOD * k ? 'good' : 'soft');
// ── recovered (16–26c) ── the soft stick (T.pace.soft = walk.js STICK): the thumb's reach → 0…1 past the dead zone, eased (ease) or with
// a low end (low); stickMove: the speed rises by acc and falls by dec (seconds to the top speed), the heading turns over `turn` s;
// stickVel: the protocol stick's velocity eases to the thumb's over tau
function stickCurve(L, c) {
  if (!(L > c.dead)) return 0;
  const m = Math.min(1, L / c.R);
  return c.ease > 0 ? 1 - Math.pow(1 - m, c.ease) : m < 0.5 ? m - c.low * m * (1 - 2 * m) : m;
}
// ── recovered (build 24) ── the protocol stick (T.pace.p24): its radius in px, its dead zone (of the radius) and the velocity's time constant (s)
export const STICK24 = Object.freeze({ R: 56, dead: 0.15, tau: 0.05 });
// ── fable32 (build 39) ── the guided walk (the owner, 26.10: "לחצת - זזת לכיוון הנקודה. לא לחצת נשארת לעמוד. בלי שרואים בכלל גויסטיק."):
// on when the shift gives T.guide39 (shift/guide39.js) and no ?stick=1 (the developer's stick: the old floating stick, the door help with
// it). A thumb held anywhere on the world walks him on the guide's way to the task's place at `speed` of the pace (`tau`: its ease in);
// released, he stops; the drag only chooses between open places (`pick` px); an act that takes the stick (T.stickUse) gets the hold as a
// steady push (`push`) where it walks (the ashes' descent), the drag where it aims (the pyre's row) ── /fable32 ──
export const WALK39 = Object.freeze({ speed: 0.82, tau: 0.18, pick: 28, push: 0.72 });
// ── build 51 ── (the inspector's review 27.10 §1 and §4 item 13: "~8 amot/s — he overshoots the place"; the coordinator's build-51 brief,
// item 13) within `near` amot of the guide's place he walks at most `v` amot/s ── /build 51 ──
export const WALK51 = Object.freeze({ near: 6, v: 5 });
/** one frame of the guided walk's velocity (pure): toward the guide's direction g {x, z, k} at WALK39.speed of top, eased in over tau;
 *  no direction (no place, or there) → eased to rest, and at rest under 0.3 */
export function walk39(v, g, top, dt) {
  let k = g ? Math.max(0, Math.min(1, g.k == null ? 1 : g.k)) * WALK39.speed : 0;
  if (g && Number.isFinite(g.left) && g.left < WALK51.near && top > 0) k = Math.min(k, WALK51.v / top);   // ── build 51 ── (WALK51) ── /build 51 ──
  stickVel(v, g ? g.x * k : 0, g ? g.z * k : 0, top, dt, WALK39.tau);
  if (!g && Math.hypot(v.vx, v.vz) < 0.3) { v.vx = 0; v.vz = 0; }
  return v;
}
// ── fable32 (build 40) ── the act's camera: the thing near the right thumb (shlav-alef-bimui-he.md §1 ש3 and rule 3: the object at 55–65 %
// of the width, the kohen seen). An act's authored view (camWork's { p, t }) is slid sideways — the camera and its look together, at most
// `pan` amot — so the thing (touch40.js's globalThis.__T40.obj) stands at `at` of the width; if that leaves him past `hero` (NDC, the left
// edge −1) it steps back along its look, up to `back` amot. Pure; frozen by the caller while a finger is on the thing.
export const CAM40 = Object.freeze({ at: 0.6, hero: -0.82, pan: 6, back: 8 });
// ── fable32 (build 41) ── (the coordinator's build-41 brief, item 2: the menorah's view had his head huge on the left) every act's view also
// keeps his whole figure at most `big` of the screen's height (HERO41: his figure's height, the model's bounds measured by tools/cam41.js:
// 3.96) and inside the frame on both sides (`heroR`), stepping back up to `back` amot ── /fable32 ──
export const CAM41 = Object.freeze({ ...CAM40, back: 14, big: 0.45, heroR: 0.92 });
export const HERO41 = 3.96;
export function pan40(p, t, O, H, tanH, c = CAM40, tanV = 0) {
  let fx = t[0] - p[0], fy = t[1] - p[1], fz = t[2] - p[2];
  const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
  const rl = Math.hypot(fz, fx) || 1, rx = -fz / rl, rz = fx / rl;
  const want = 2 * c.at - 1;
  const depth = (q, back, sh) => (q.x - (p[0] - fx * back + rx * sh)) * fx + (q.y - (p[1] - fy * back)) * fy + (q.z - (p[2] - fz * back + rz * sh)) * fz;
  const at = (q, back, sh) => { const vx = q.x - (p[0] - fx * back + rx * sh), vy = q.y - (p[1] - fy * back), vz = q.z - (p[2] - fz * back + rz * sh), d = vx * fx + vy * fy + vz * fz; return d > 0.2 ? (vx * rx + vz * rz) / (d * tanH) : -9; };
  // (build 41: his figure's share of the screen's height at that depth — H.h his height, tanV the view's half-height tangent)
  const big = (back, sh) => { if (!H || !(H.h > 0) || !(tanV > 0)) return 0; const d = depth(H, back, sh); return d > 0.2 ? H.h / (2 * d * tanV) : 9; };
  let best = null;
  for (let back = 0; back <= c.back; back += 1) {
    const vx = O.x - (p[0] - fx * back), vy = O.y - (p[1] - fy * back), vz = O.z - (p[2] - fz * back), d = vx * fx + vy * fy + vz * fz;
    if (!(d > 0.2)) continue;
    const sh = Math.max(-c.pan, Math.min(c.pan, vx * rx + vz * rz - want * d * tanH));
    best = { back, sh };
    if (!H) break;
    const hx = at(H, back, sh);
    if (hx >= c.hero && hx <= (c.heroR || 9) && (!(c.big > 0) || big(back, sh) <= c.big)) break;   // (build 41: both sides and his size too)
  }
  if (!best) return null;
  const P = [p[0] - fx * best.back + rx * best.sh, p[1] - fy * best.back, p[2] - fz * best.back + rz * best.sh], Tg = [t[0] + rx * best.sh, t[1], t[2] + rz * best.sh];
  return { p: P, t: Tg, sh: best.sh, back: best.back, ox: at(O, best.back, best.sh), hx: H ? at(H, best.back, best.sh) : null, big: H ? big(best.back, best.sh) : null };
}
// ── /fable32 ──
// ── build 51 ── THE OBJECT RULE (the inspector's review 27.10 §1 and §4 item 1; the coordinator's build-51 brief, item 1: "in 5 of 8 acts
// the kohen is 3–5× bigger than the thing and hides it"): in every act view the thing is ≥ `w` of the screen's width and ≥ `h` of its
// height, and the line from the camera to the thing's middle does not pass through him (a ray against his figure: a cylinder of `R` amot
// from his feet to his top). After pan40 (the thing near the right thumb, him ≤ 45 %) the view is slid along its own look toward the thing
// (the thing keeps its place on the screen) until it is `aimW` wide (never nearer than `near` amot, never taller than `maxH`); each of the
// `swing` turns round the thing's upright (0, ±30°, ±50°) is tried and scored: through him, the rule missed, a wall in the way (the
// caller's cut), him over `big` of the height, him right of the thing, the size of the turn. Pure (the cut is the caller's).
// A thing in his own hands (flagged 'self' by its act — the pan on the way down, the vessel carried, the teni, the log held up — or its middle within `self` amot of him) keeps build 41's view.
/** the things a lifted view serves (measured, build 51: the bed of coals on the altar, the laver — from above he is shorter on the screen
 *  and the thing no smaller; lifted, the inner altar and the menorah's lamps cut him at 844 — 60 % of their frames — so they stay level) */
export const LIFT51 = Object.freeze(['d21']);   // ── build 52 ── (the laver: its own view from the side — day33 KV52 — no longer lifted) ── /build 52 ──
// ── build 52 ── (the coordinator's build-52 play-test, nice to have: "he is over 45 % at the menorah and the inner altar — pull back so he
// is ≤ 45 % while the thing stays ≥ 28 %"): those two things' rule at 28 % (aim 30 %) — the slide stops sooner, before he passes 45 % ── /build 52 ──
export const OBJ52 = Object.freeze({ hk26: Object.freeze({ w: 0.28, aimW: 0.3 }), hk26alt: Object.freeze({ w: 0.28, aimW: 0.3 }) });
export const OBJ51 = Object.freeze({ w: 0.3, h: 0.2, aimW: 0.36, maxH: 0.95, near: 1.4, swing: Object.freeze([0, 0.52, -0.52, 0.87, -0.87]), lift: Object.freeze([0, 2, 4]), liftK: 2, bigK: 40, whole: 45, wK: 150, R: 0.6, big: 0.45, self: 0.25 });
/** does the segment from the camera C to the thing's middle O pass through his figure (feet A, height top, radius R)? (pure) */
export function occl51(C, O, A, top, R = OBJ51.R) {
  const dx = O.x - C.x, dz = O.z - C.z, fx = C.x - A.x, fz = C.z - A.z, a = dx * dx + dz * dz, b = 2 * (fx * dx + fz * dz), c = fx * fx + fz * fz - R * R;
  if (a < 1e-9) return false;
  const D = b * b - 4 * a * c; if (D < 0) return false;
  const q = Math.sqrt(D), s0 = Math.max(0, (-b - q) / (2 * a)), s1 = Math.min(0.97, (-b + q) / (2 * a)); if (s0 > s1) return false;
  const y0 = C.y + (O.y - C.y) * s0, y1 = C.y + (O.y - C.y) * s1;
  return Math.max(y0, y1) >= A.y && Math.min(y0, y1) <= A.y + top;
}
/** the thing's share of the screen from a camera at P looking at T (pure): its world box bb [x0, y0, z0, x1, y1, z1]'s corners projected,
 *  clipped to the screen → { w, h, x0, x1, y0, y1 } (NDC) — w, h 0 when a corner is behind the camera's near plane */
export function share51(P, T, bb, tanH, tanV) {
  let fx = T[0] - P[0], fy = T[1] - P[1], fz = T[2] - P[2]; const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
  const rl = Math.hypot(fx, fz) || 1, rx = -fz / rl, rz = fx / rl, ux = -rz * fy, uy = rz * fx - rx * fz, uz = rx * fy;
  let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
  for (const i of [0, 3]) for (const j of [1, 4]) for (const k of [2, 5]) {
    const vx = bb[i] - P[0], vy = bb[j] - P[1], vz = bb[k] - P[2], d = vx * fx + vy * fy + vz * fz;
    if (!(d > 0.05)) return { w: 0, h: 0, x0: -1, x1: 1, y0: -1, y1: 1, behind: true };
    const x = (vx * rx + vz * rz) / (d * tanH), y = (vx * ux + vy * uy + vz * uz) / (d * tanV);
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  return { w: Math.max(0, (Math.min(1, x1) - Math.max(-1, x0)) / 2), h: Math.max(0, (Math.min(1, y1) - Math.max(-1, y0)) / 2), x0, x1, y0, y1 };
}
/** his figure from P looking at T (pure): his middle across the width and up (NDC) and his height's share of the screen — his feet and his
 *  top each projected, so a look from above (he is shorter on the screen) counts as cam41 measures it — or null (behind the camera) */
function fig51(P, T, H, tanH, tanV) {
  let fx = T[0] - P[0], fy = T[1] - P[1], fz = T[2] - P[2]; const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
  const rl = Math.hypot(fx, fz) || 1, rx = -fz / rl, rz = fx / rl, ux = -rz * fy, uy = rz * fx - rx * fz, uz = rx * fy;
  const pr = (y) => { const vx = H.x - P[0], vy = y - P[1], vz = H.z - P[2], d = vx * fx + vy * fy + vz * fz; return d > 0.2 ? { x: (vx * rx + vz * rz) / (d * tanH), y: (vx * ux + vy * uy + vz * uz) / (d * tanV), d } : null; };
  const a = pr(H.y), b = pr(H.y + H.h), m = pr(H.y + H.h / 2);
  if (!a || !b || !m) return null;
  const inS = (q) => Math.abs(q.x) <= 1 && Math.abs(q.y) <= 1;
  return { x: m.x, y: (a.y + b.y) / 2, s: Math.abs(b.y - a.y) / 2, d: m.d, whole: inS(a) && inS(b) };
}
/** the object rule on a view { p, t } (pure): → { p, t, w, h, occ, a, s, big, hx, ok, score, cands } | null (no box). H: his feet
 *  { x, y, z } and height h; cut(P, T) → true when a wall stands between (optional) */
export function obj51(p, t, bb, H, tanH, tanV, c = OBJ51, cut = null) {
  if (!bb || !(tanH > 0) || !(tanV > 0)) return null;
  const O = { x: (bb[0] + bb[3]) / 2, y: (bb[1] + bb[4]) / 2, z: (bb[2] + bb[5]) / 2 };
  const self = !!(H && Math.hypot(O.x - H.x, O.z - H.z) < c.self);
  const cands = [];
  // (each turn also lifted — 2, 4 amot, still looking at the same point: from above he is shorter on the screen, a flat thing taller)
  for (const a of c.swing) for (const L of (c.lift || [0])) {
    const ca = Math.cos(a), sa = Math.sin(a), rot = (q) => [O.x + (q[0] - O.x) * ca - (q[2] - O.z) * sa, q[1], O.z + (q[0] - O.x) * sa + (q[2] - O.z) * ca];
    let P = rot(p), T = rot(t); P[1] += L;
    const D = [O.x - P[0], O.y - P[1], O.z - P[2]], dist = Math.hypot(D[0], D[1], D[2]) || 1;
    let s = 0, v = share51(P, T, bb, tanH, tanV);
    // (him kept — whole in the frame and ≤ big — while he was: c.whole false (a macro) lets him go)
    const keep = (P2, T2) => { const F = fig51(P2, T2, H, tanH, tanV); return !!F && (c.whole === false || F.whole) && (Math.abs(F.x) >= 1.1 || F.s <= c.big); };
    const whole0 = (P2, T2) => { const F = fig51(P2, T2, H, tanH, tanV); return !!F && F.whole; };
    let kept = !!H && keep(P, T), wh = !!H && whole0(P, T), sK = wh ? 0 : null, vK = wh ? v : null;
    if (!(v.w >= c.aimW && v.h >= c.h)) {
      const smax = Math.max(0, 1 - c.near / dist);
      for (let k = 1; k <= 16; k++) {
        const s2 = (smax * k) / 16, P2 = [P[0] + D[0] * s2, P[1] + D[1] * s2, P[2] + D[2] * s2], T2 = [T[0] + D[0] * s2, T[1] + D[1] * s2, T[2] + D[2] * s2], v2 = share51(P2, T2, bb, tanH, tanV);
        if (v2.behind || v2.h > c.maxH) break;
        // (him ≤ big and whole: once the rule holds, no nearer than where he would pass `big` of the height or leave the frame)
        const k2 = !!H && keep(P2, T2);
        if (H && v.w >= c.w && v.h >= c.h && kept && !k2) break;
        s = s2; v = v2; kept = k2; wh = !!H && whole0(P2, T2); if (wh) { sK = s2; vK = v2; }
        if (v2.w >= c.aimW && v2.h >= c.h) break;
      }
    }
    const P0 = P, T0 = T;
    // (the slide's end; and, when it lost him — cut by the frame — before the rule held, also where it last had him whole:
    //  the score chooses between the thing a little small and him cut)
    const mk = (s, v, alt) => {
    const P = [P0[0] + D[0] * s, P0[1] + D[1] * s, P0[2] + D[2] * s], T = [T0[0] + D[0] * s, T0[1] + D[1] * s, T0[2] + D[2] * s];
    const ok = v.w >= c.w && v.h >= c.h;
    const occ = !self && !!H && occl51({ x: P[0], y: P[1], z: P[2] }, O, H, H.h, c.R);
    // (c.avoid: other things that must not stand between — the other lamb: the line to the thing within its radius, or the camera in it)
    let blk = 0;
    if (c.avoid) for (const q of c.avoid) { const ux = O.x - P[0], uy = O.y - P[1], uz = O.z - P[2], L2 = ux * ux + uy * uy + uz * uz || 1, k = Math.max(0, Math.min(0.97, ((q.x - P[0]) * ux + (q.y - P[1]) * uy + (q.z - P[2]) * uz) / L2)); if (Math.hypot(P[0] + ux * k - q.x, P[1] + uy * k - q.y, P[2] + uz * k - q.z) < (q.r || 0.8)) blk = 1; }
    // (him: his middle's place across the width and his height's share at his depth)
    // (his screen box — his middle across the width ± c.R·1.4 (the head is wider), feet to top — and how much of the thing's box it covers
    //  when he stands in front of it or level with it)
    let hx = null, big = 0, cover = 0, whole = false;
    if (H) {
      let fx = T[0] - P[0], fy = T[1] - P[1], fz = T[2] - P[2]; const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
      const F = fig51(P, T, H, tanH, tanV);
      if (F) {
        const d = F.d; hx = F.x; big = F.s; whole = F.whole;
        const hy = F.y, hw = (c.R * 1.4) / (d * tanH), dO = (O.x - P[0]) * fx + (O.y - P[1]) * fy + (O.z - P[2]) * fz;
        if (d < dO + 0.5) { const X0 = Math.max(-1, v.x0), X1 = Math.min(1, v.x1), Y0 = Math.max(-1, v.y0), Y1 = Math.min(1, v.y1), A = Math.max(1e-6, (X1 - X0) * (Y1 - Y0)), ix = Math.max(0, Math.min(X1, hx + hw) - Math.max(X0, hx - hw)), iy = Math.max(0, Math.min(Y1, hy + big) - Math.max(Y0, hy - big)); cover = Math.min(1, (ix * iy) / A); }
      }
    }
    const thingX = (Math.max(-1, v.x0) + Math.min(1, v.x1)) / 2, inF = hx != null && Math.abs(hx) < 1.1;
    const score = (occ ? 100 : 0) + (blk ? 70 : 0) + 60 * cover + (ok ? 0 : 40 + (c.wK || 100) * Math.max(0, c.w - v.w) + 100 * Math.max(0, c.h - v.h)) + (big > c.big && inF && (whole || c.whole === false || !H) ? (c.bigK || 25) * Math.min(1.5, big - c.big) : 0) + (inF && hx > thingX - 0.15 ? 8 : 0) + Math.abs(a) * 8 + L * (c.liftK || 0) + (H && c.whole !== false && !whole ? (c.whole || 0) + (inF ? 0 : 30) : 0) + (c.prefer != null && a + L * 10 + (alt ? 100 : 0) !== c.prefer ? 5 : 0);   // (prefer: the turn, lift and stop chosen last frame — no flicker)
    cands.push({ p: P, t: T, w: v.w, h: v.h, occ, a, L, key: a + L * 10 + (alt ? 100 : 0), s, big, hx, whole, cover, ok, score });
    };
    mk(s, v, 0);
    if (H && c.whole !== false && !wh && sK != null && sK !== s) mk(sK, vK, 1);
  }
  cands.sort((x, y) => x.score - y.score);
  let best = null, n = 0;
  // (a wall in the way: the same view raised over it — up 1.5, then 3 amot, still looking at the thing — then the next candidate)
  for (const q of cands) {
    if (!cut) { best = q; break; }
    if (n >= 4) break; n++;
    for (const up of [0, 1.5, 3]) { const P2 = [q.p[0], q.p[1] + up, q.p[2]]; if (cut(P2, q.t)) continue; const v2 = up ? share51(P2, q.t, bb, tanH, tanV) : q; best = up ? { ...q, p: P2, w: v2.w, h: v2.h, up } : q; break; }
    if (best) break;
  }
  if (!best) return null;
  return { ...best, self, cands: cands.length };
}
// ── /build 51 ──
export const STICK39 = (() => { try { return typeof location !== 'undefined' && /[?&]stick=1(&|$)/.test(location.search || ''); } catch (e) { return false; } })();
const stick24 = (L, r) => { const m = Math.min(1, L / r); return m < STICK24.dead ? 0 : m; };
function stickMove(m, want, hd, dt, c, top) {
  const sp0 = m.sp;
  if (want > 0) m.rel = 0; else if (!(m.rel > 0)) m.rel = Math.max(top, sp0);
  const up = top / c.acc, down = (want > 0 ? top : m.rel) / c.dec;
  m.sp = want > m.sp ? Math.min(want, m.sp + up * dt) : Math.max(want, m.sp - down * dt);
  if (Number.isFinite(hd)) {
    if (!Number.isFinite(m.hd) || sp0 <= 0.06 * top) m.hd = hd;
    else { const d = Math.atan2(Math.sin(hd - m.hd), Math.cos(hd - m.hd)); m.hd += d * (1 - Math.exp(-dt * 3 / c.turn)); }
  }
  return m;
}
function stickVel(v, x, z, k, dt, tau = STICK24.tau) {
  const a = dt > 0 ? 1 - Math.exp(-dt / tau) : 0;
  v.vx = v.vx * (1 - a) + x * k * a; v.vz = v.vz * (1 - a) + z * k * a;
  return v;
}
const CA19 = true;   // ── crafta19 ── FUN19 §2's rule under two thumbs (one switch for a bisect) ── /crafta19 ──
const CAM = { az: 0.42, el: 0.995, d: 30, lead: 0.32 };   // (az from +x toward +z, el 57°, 30 amot: him ≈ 80 px at 390 tall)
const isLand = () => typeof innerWidth === 'number' && innerWidth > innerHeight && innerWidth >= 640;
const noTwin = () => { try { return /[?&]twin=0\b/.test(location.search || ''); } catch (e) { return false; } };

export function createTwin(o = {}) {
  const doc = typeof document !== 'undefined' ? document : null;
  const fn = (k) => typeof o[k] === 'function';
  const call = (k, a, b, c) => { try { return fn(k) ? o[k](a, b, c) : null; } catch (e) { return null; } };   // ── stages21 ── (c: camSide's third) ── /stages21 ──   // (no rest array: called every frame)
  const st = { on: false, force: null, camOn: false, stamped: false, hold: false, t: 0, chk: 0, prevMs: 0, az: CAM.az, camAz: CAM.az, camEl: CAM.el /* ── stages21 ── (the follow camera's elevation: raised when no bearing clears the built masses) ── /stages21 ── */ };   // ── nav19 ── (az: the stick's, read from the camera · camAz: the follow camera's bearing) ── /nav19 ──
  const camQ = { px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0 };   // ── nav19 ── (the camera read each frame: one object) ── /nav19 ──
  const T = { on: false };
  if (!doc || !doc.body) { T.update = () => {}; T.pips = () => PIPS; T.feedback = () => {}; T.event = () => {}; T.destroy = () => {}; T.onWork = () => () => {}; return T; }
  if (!doc.getElementById('tw-css')) { const s = doc.createElement('style'); s.id = 'tw-css'; s.textContent = CSS + CSS_NAV + CSS_CA + CSS_28; doc.head.appendChild(s); }   /* ── crafta19 ── (+ CSS_CA) ── /crafta19 ── */   // ── nav19 ── (+ CSS_NAV) ── /nav19 ──
  const root = () => o.root || (o.ui && o.ui.root) || doc.body;
  const el = (cls, html = '', tag = 'div') => { const e = doc.createElement(tag); e.className = cls; if (html) e.innerHTML = html; return e; };
  /* the DOM: the stick's zone, the buttons' pad, the markers' pool, the aim, the gold flash */
  const zone = el('tw-zone', '<div class="tw-ghost"></div><div class="tw-tip">גררו כאן כדי ללכת</div><div class="tw-base"><div class="tw-knob"></div></div>');
  zone.setAttribute('aria-label', 'גררו כאן כדי ללכת');
  const base = zone.querySelector('.tw-base'), knob = zone.querySelector('.tw-knob');
  const pad = el('tw-pad', '<div class="tw-tip">הקישו כדי לעבוד</div><div class="tw-rgo"></div><div class="tw-rg"></div><div class="tw-pips" aria-hidden="true"><i><b></b></i><i><b></b></i><i><b></b></i></div><button class="tw-hand" type="button" aria-label="יד של אומן"><div class="tw-fill"></div><span>יד של<br>אומן</span></button><button class="tw-btn" type="button" aria-label="עבודה"><span class="tw-ic">✋</span><span class="tw-lb">עבודה</span></button>');
  const btn = pad.querySelector('.tw-btn'), ic = btn.querySelector('.tw-ic'), lb = btn.querySelector('.tw-lb'), pipEl = [...pad.querySelectorAll('.tw-pips b')];
  const handBtn = pad.querySelector('.tw-hand'), handFill = handBtn.querySelector('.tw-fill');
  // ── twin18 ── the timing ring on the work button (contract 4): a ring closes on the gold one; a touch on the gold = מושלם
  const rg = pad.querySelector('.tw-rg'), RG = { on: false, t0: 0, cyc: 1.0, s: 0, src: '' };
  const PERF = GRADE.PERF, GOOD = GRADE.GOOD, RGO = { u: 0, d: 0, win: 0 };   // ── recovered (16–26c) ── (GRADE)   // (seconds from the gold moment: מושלם · טוב · the rest soft)
  /** where the ring is now: { u: 0…1 to the gold, d: seconds from the gold moment } | null (no ring) */
  function ringNow(ms) {
    if (call('rhythm') === false) return null;
    const s = spec;
    const o2 = RGO;   // (one object, filled: no allocation per frame)
    if (s && (s.strike || s.beatRing)) { const b = call('beat');   /* ── crafta19 ── (beatRing: a rhythm craft — the dressing, the column — closes on the music's beat too) ── /crafta19 ── */ if (!b || !b.on) return null; const toB = b.to; o2.u = Math.max(0, Math.min(1, 1 - toB / b.cyc)); o2.d = Math.abs(toB); o2.win = b.win; return o2; }
    if (s && s.craft && s.noRing) return null;   // ── crafta19 ── (FUN19: the ring is the rhythm crafts' — beatRing above; the treadwheel is graded by its pace, the cord, the survey and the key stone by the hand) ── /crafta19 ──
    if (s && s.craft) { const ph = (((ms - RG.t0) / 1000) / RG.cyc) % 1; o2.u = ph; o2.d = Math.min(ph, 1 - ph) * RG.cyc; o2.win = PERF; return o2; }
    return null;
  }
  /** the touch's grade (contract 4): 'perfect' | 'good' | 'soft'; the rhythm setting off → always 'good' */
  function gradeNow(ms) { const r = ringNow(ms); if (!r) return 'good'; return r.d <= Math.max(PERF, r.win || 0) ? 'perfect' : r.d <= GOOD ? 'good' : 'soft'; }
  T.grade = gradeNow;
  // ── /twin18 ──
  // the first-time hints at the thumbs (P3): each until its thumb is first used (remembered on this device)
  const tipWalk = zone.querySelector('.tw-tip'), tipWork = pad.querySelector('.tw-tip');
  const TIPS = 'bh_twin_tips'; let tips = 0; try { tips = +(localStorage.getItem(TIPS) || 0) | 0; } catch (e) { tips = 0; }
  const tipDone = (bit) => { if (tips & bit) return; tips |= bit; try { localStorage.setItem(TIPS, String(tips)); } catch (e) { /* not kept */ } syncTips(); };
  const syncTips = () => { tipWalk.hidden = !!(tips & 1); tipWork.hidden = !!(tips & 2); };
  syncTips();
  // ── twin20 ── the aim's power pips (above the work button) and the second tip
  const pw20 = el('tw-pw20', '<i></i><i></i><i></i>'), tip20 = el('tw-tip t20', 'גררו לכיוון — הכהן מכוון'); tip20.hidden = true; pad.appendChild(pw20); pad.appendChild(tip20);
  // ── /twin20 ──
  const aim = el('tw-aim'), flash = el('tw-flash'), goal = el('tw-goal', '<span></span><b></b>'), goalIc = goal.firstChild, goalAr = goal.lastChild;
  const MK = [0, 1, 2, 3].map(() => { const m = el('tw-mk', '<div class="tw-mi"></div><span></span><i></i>'); return { el: m, ic: m.firstChild, lb: m.children[1], job: null, x: 0, y: 0, z: 0, on: false }; });
  const mount = () => { const r = root(); if (zone.parentNode !== r) { r.appendChild(zone); r.appendChild(pad); r.appendChild(aim); r.appendChild(flash); r.appendChild(goal); for (const m of MK) r.appendChild(m.el); r.appendChild(me); r.appendChild(liftEl); } };   // ── nav19 ── (+ me) ── /nav19 ──
  // ── nav19 ── the overview (note 1): a tap lifts the camera high over the whole site — every marker, his work, "אני" over him; a second
  // tap, the stick, a card or a key moment's own shots bring it back. One bearing (the follow camera's): what lay to the right stays right.
  const MKP = { n: 0, x: [0, 0, 0, 0], y: [0, 0, 0, 0] };   // ── nav19 ── ── /nav19 ──
  const OV = { on: false, k: 0, x: -30, z: 0, d: 700, el: 1.36, n: 0 };
  const ovBtn = el('tw-ov', '<span class="tw-ovi">🗺</span><span class="tw-ovl">מבט על</span>', 'button'); ovBtn.type = 'button'; ovBtn.setAttribute('aria-label', 'מבט על');
  const ovLb = ovBtn.querySelector('.tw-ovl'), ovIc = ovBtn.querySelector('.tw-ovi');
  pad.appendChild(ovBtn);
  const me = el('tw-me', '<span>אני</span><i></i>');
  const liftEl = el('tw-lift', '<b>⌃</b><span>גררו למעלה — לראות מגבוה</span>'); liftEl.hidden = true;   // ── cam28 ── ── /cam28 ──
  function overview(on, why = '') {
    on = !!on; if (on === OV.on) return;
    if (on && (!st.on || st.hold)) return;
    OV.on = on; if (on) OV.n++;
    ovBtn.classList.toggle('on', on); ovLb.textContent = on ? 'חזרה' : 'מבט על'; ovIc.textContent = on ? '↩' : '🗺';
    if (on) { zoom.goal = 1; zoom.free = false; }
    call('emit', 'twinOverview', { on, why });
  }
  T.overview = overview;
  // (the supervisor, phase B: a full twin-touch left two thumbs ON after the phone turned to portrait — the mode was only re-checked from
  // the game's frame, which a part had stopped calling) the turn of the phone itself turns two thumbs off at once, frame or no frame
  const onTurn = () => { st.chk = 0; if (st.on && st.force == null && !isLand()) setOn(false); };
  if (typeof window !== 'undefined' && window.addEventListener) { window.addEventListener('resize', onTurn); window.addEventListener('orientationchange', onTurn); }
  ovBtn.addEventListener('pointerdown', (e) => { if (!st.on) return; e.preventDefault(); e.stopPropagation(); overview(!OV.on, 'tap'); try { o.sfx && o.sfx.play && o.sfx.play('whoosh'); } catch (err) { /* */ } });
  ovBtn.addEventListener('click', (e) => e.preventDefault());
  // the compass is a button (note 3): a tap brings him to his work (the game's goTo: ≤ 1.5 s), and the overview lets go
  goal.setAttribute('role', 'button'); goal.setAttribute('aria-label', 'אל העבודה');
  goal.addEventListener('pointerdown', (e) => {
    if (!st.on || st.hold || !goalOn) return; e.preventDefault(); e.stopPropagation();
    stickEnd('goal'); overview(false, 'goal');
    const r = call('goTo'); goal.classList.remove('go'); void goal.offsetWidth; goal.classList.add('go');
    try { o.sfx && o.sfx.play && o.sfx.play('whoosh'); } catch (err) { /* */ } call('haptic', 12);
    call('emit', 'twinCompass', { ok: !!(r && r.ok), how: r && r.how || null });
    // ── ux24 ── (docs/UX24.md #11) the kid who walks by the arrow never drags the stick: "גררו כאן כדי ללכת" stood 12 minutes
    // over the left corner (shots l-040s … l-740s). Three walks by the arrow retire it too
    uxCompassN++; if (uxCompassN >= 3) tipDone(1);
    // ── /ux24 ──
  });
  let uxCompassN = 0;   // ── ux24 ── ── /ux24 ──
  // ── /nav19 ──

  /* ── the mode ── */
  function want() {
    if (st.force != null) return !!st.force;
    if (!isLand() || noTwin() || globalThis.__MG_AUTO) return false;
    if (!call('live')) return false;
    return !!call('stage');   // ── twin18 ── (every stage of the building site, not only the Mount) ── /twin18 ──
  }
  function setOn(on) {
    if (on === st.on) return;
    st.on = T.on = on; mount();
    if (!on && OV.on) overview(false, 'off');   // ── nav19 ── ── /nav19 ──
    const r = root(); if (r && r.classList) r.classList.toggle('tw-on', on);
    if (!on && IN28.on) { IN28.on = false; try { if (o.view && o.view.closeCam) o.view.closeCam(false, 'cam28i'); } catch (e) { /* */ } }   // ── cam28 ── ── /cam28 ──
    if (!on) { stickEnd(); drive(0, 0); setCam(false); for (const m of MK) m.on = false; aim.classList.remove('on'); t20Off(); try { if (o.stages && typeof o.stages.xray === 'function') o.stages.xray(false); } catch (e) { /* */ } }   // ── twin18 ── (xray off) ── /twin18 ──
    else {
      st.cam0 = true;   // (the follow camera glides in from where the camera is: no cut)
      // the entry, as the battle's (PRINCIPLES §5.5): a whoosh, a breath, the stamp with the strongest sound, the work music on the beat
      if (!st.stamped) { st.stamped = true; try { if (o.sfx && typeof o.sfx.play === 'function') o.sfx.play('whoosh'); if (o.ui && typeof o.ui.stamp === 'function') o.ui.stamp('יוצאים לעבודה!'); } catch (e) { /* LAND17's */ } }
    }
    call('emit', 'twin', { on });
  }
  const camMode = () => { const s = call('settings'); return s && s.cam === 'director' ? 'director' : 'follow'; };
  function setCam(on) { if (on === st.camOn) return; st.camOn = on; if (o.view && typeof o.view.twinCam === 'function') o.view.twinCam(on); if (on) st.cam0 = true; }

  /* ── the left thumb ── */
  const stick = { id: null, bx: 0, by: 0, dx: 0, dy: 0, on: false, t0: 0, walked: 0 };
  const g39 = () => !STICK39 && !globalThis.__STICK39 && typeof T.guide39 === 'function';   // ── fable32 (build 39) ── (the guided walk: the shift's guide, no developer's stick) ── /fable32 ──
  const g39drag = { x: 0, z: 0 };
  const hp = { x: 0, y: 0, z: 0, yaw: 0, vis: false }, hp0 = { x: 0, z: 0 };
  const hero = () => { const s = o.stages; if (s && typeof s.heroXYZ === 'function') return s.heroXYZ(hp); return null; };
  function drive(vx, vz) { try { const h = o.stages && o.stages.hero; if (h && typeof h.drive === 'function') h.drive(vx, vz); } catch (e) { /* the world's */ } }
  function stickEnd(why = '') {
    if (!stick.on) return;
    // ── recovered (16–26c) ── the soft stick let go: where the shift parks him (__SH_STOP) he stops facing it; else he coasts to a stop
    // (update()); T.stickUse hears the release
    let soft = T.pace && T.pace.soft, lift = /^(pointerup|pointercancel|lostpointercapture)$/.test(why), park = null;
    if (soft && lift) { try { const h = hero(); if (h && typeof globalThis.__SH_STOP === 'function') park = globalThis.__SH_STOP(h); if (park && o.stages && o.stages.hero && o.stages.hero.setPos) o.stages.hero.setPos(h.x, h.z, Math.atan2(park.x - h.x, park.z - h.z)); } catch (e) { park = null; } }
    stick.coast = !!(soft && lift && !park && stick.m && stick.m.sp > 0);
    if (!stick.coast && stick.m) { stick.m.sp = 0; if (stick.v) stick.v.vx = stick.v.vz = 0; }
    stick.parkedAt = park ? performance.now() : 0; stick.M = 0;
    if (typeof T.stickUse === 'function') { try { T.stickUse(0, 0, 0); } catch (e) { /* the shift's */ } }
    stick.on = false; stick.id = null; stick.dx = stick.dy = 0; stick.rimT = 0; stick.sprint = false; base.classList.remove('on'); zone.classList.remove('act'); if (!stick.coast) drive(0, 0); stick.parked = false;   // ── fable32 ── ── /fable32 ──   // ── recovered (16–26c) ── (rimT, sprint; a coast keeps driving)
    call('emit', 'twinWalk', { d: Math.round(stick.walked * 10) / 10, why });
    // ── nav19 ── (the supervisor, B2) "גררו כאן כדי ללכת" is retired once the stick has walked him three times (2 amot or more each),
    // saved on this device so it stays gone
    if (!(tips & 1) && stick.walked >= 2) { let n = 0; try { n = (+(localStorage.getItem('bh_twin_walks') || 0) | 0) + 1; localStorage.setItem('bh_twin_walks', String(n)); } catch (e) { n = (st.walks = (st.walks || 0) + 1); } if (n >= 3) tipDone(1); }
    // ── /nav19 ──
  }
  zone.addEventListener('pointerdown', (e) => {
    if (!st.on || stick.on || zone.classList.contains('tw-nostick')) return;   // ── fable32 (build 4) ── (the shift: no stick — the genre's tap-to-go) ── /fable32 ──
    if (zoom.pin) return;   // ── fix26 ── (a pinch's finger) ── /fix26 ──
    e.preventDefault(); e.stopPropagation();
    stick.id = e.pointerId; stick.on = true; stick.coast = false; if (!stick.m) stick.m = { sp: 0, hd: NaN }; stick.dx = stick.dy = 0; stick.walked = 0; stick.t0 = performance.now(); stick.az0 = Number.isFinite(globalThis.__SH_STICK_AZ) ? globalThis.__SH_STICK_AZ : NaN;   // ── fable32 (build 12) ── ── /fable32 ──   // ── recovered (16–26c) ── (coast, m)
    const r = zone.getBoundingClientRect();
    stick.bx = e.clientX; stick.by = e.clientY;
    base.style.transform = `translate(${Math.round(e.clientX - r.left)}px,${Math.round(e.clientY - r.top)}px)`; knob.style.transform = '';
    base.classList.add('on'); zone.classList.add('act');
    try { zone.setPointerCapture(e.pointerId); } catch (err) { /* a synthetic pointer */ }
    if (!(T.camOver && T.camOver.orbit32)) { zoom.goal = 1; zoom.free = false; }   // (the stick brings the camera back to him)   // ── fable32 (build 5) ── (the shift's orbit camera keeps the pinch's zoom — Roblox) ── /fable32 ──
    overview(false, 'stick');   // ── nav19 ── ── /nav19 ──
    if (hero()) { hp0.x = hp.x; hp0.z = hp.z; }
    call('emit', 'twinStick', { x: Math.round(e.clientX), y: Math.round(e.clientY) });   // ── nav19 ── (the walk's tip goes after three walks: stickEnd) ── /nav19 ──
  });
  zone.addEventListener('pointermove', (e) => {
    if (!stick.on || e.pointerId !== stick.id) return;
    e.preventDefault();
    let dx = e.clientX - stick.bx, dy = e.clientY - stick.by; const L = Math.hypot(dx, dy), RR = T.pace && T.pace.p24 ? T.pace.p24.R : T.pace && T.pace.soft ? T.pace.soft.R : R;   // ── recovered (16–26c) ── (the pace's own reach)
    if (L > RR) { dx *= RR / L; dy *= RR / L; }
    stick.dx = dx; stick.dy = dy;
    knob.style.transform = `translate(${Math.round(dx)}px,${Math.round(dy)}px)`;
  });
  const zUp = (e) => { if (stick.on && e.pointerId === stick.id) stickEnd(e.type); };
  zone.addEventListener('pointerup', zUp); zone.addEventListener('pointercancel', zUp); zone.addEventListener('lostpointercapture', zUp);

  /* ── the right thumb: the work button, its pips, the aim ── */
  let spec = null, specT = 0;
  const pip = { n: PIPS, fill: 0, last: -1e9 };
  const bt = { id: null, x: 0, y: 0, dx: 0, dy: 0, drag: false, t0: 0 };
  const listeners = new Set();
  T.onWork = (f) => { listeners.add(f); return () => listeners.delete(f); };
  function fire(ev) {
    // (a craft running takes the button: hands.js's twin input)
    for (const f of listeners) { try { if (f(ev) === true) { if (ev.t === 'tap' || ev.t === 'up') { call('emit', 'twinWork', { how: ev.t === 'tap' ? 'tap' : 'drag', job: spec && spec.job || null, craft: true, power: ev.power || 1 /* twin20 */ }); tipDone(2); } return true; } } catch (e) { /* the job's */ } }
    const s = (CA19 && ev.spec) || spec;   // ── crafta19 ── (the work the touch-down showed is the one its release does) ── /crafta19 ──
    if (ev.t !== 'tap' && ev.t !== 'up') return false;   // (the place's own act: done at the release — a tap, or the end of a drag)
    if (!s || typeof s.go !== 'function') { if (ev.t === 'tap') { try { o.sfx && o.sfx.play && o.sfx.play('ui'); } catch (e) { /* */ } } return false; }
    if (s.strike) {
      if (pip.n <= 0) { btn.classList.add('empty'); call('emit', 'twinPips', { n: 0, dry: true }); return false; }
      pip.n--; pip.last = performance.now(); pip.fill = 0; call('emit', 'twinPips', { n: pip.n });
    }
    call('emit', 'twinWork', { how: ev.t === 'tap' ? 'tap' : 'drag', job: s.job || null, power: ev.power || 1, aimed: !!ev.aimed /* twin20 */ }); tipDone(2);
    try { s.go(ev); } catch (e) { /* the game's */ }
    return true;
  }
  const bPos = () => { const r = btn.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  btn.addEventListener('pointerdown', (e) => {
    if (T.swallowUp && performance.now() - T.swallowUp > 40) T.swallowUp = 0;   // ── recovered (16–26c) ── (an old swallow lapses)
    if (!st.on || bt.id != null) return;
    e.preventDefault(); e.stopPropagation();
    const c = bPos(); bt.id = e.pointerId; bt.x = c.x; bt.y = c.y; bt.dx = bt.dy = 0; bt.drag = false; bt.t0 = performance.now(); bt.spec = spec && !spec.craft ? spec : null;   // ── crafta19 ── ── /crafta19 ──
    btn.classList.add('down');
    try { btn.setPointerCapture(e.pointerId); } catch (err) { /* synthetic */ }
    st.tDown = performance.now();
    // (the touch itself answers at once, four ways, when it lands on material: PRINCIPLES §4, within 50 ms)
    const s = spec;
    // ── twin18 ── the grade of this touch (the ring), its own answer; a strike fires now, on the touch
    const g = s && (s.strike || s.craft) ? gradeNow(st.tDown) : null;
    bt.grade = g; bt.fired = false;
    if (g && !CA19) { btn.classList.remove('g-perfect', 'g-good', 'g-soft'); void btn.offsetWidth; btn.classList.add('g-' + g); setTimeout(() => btn.classList.remove('g-' + g), 260); call('emit', 'twinGrade', { g, job: s.job || null }); }   // ── crafta19 ── (!CA19: the grade shows at the impact, T.graded) ── /crafta19 ──
    if (s && s.at && (!s.strike || pip.n > 0) && !(CA19 && (s.strike || s.craft))) {   // ── crafta19 ── (FUN19 rule 1: no number at the touch — the kohen's fall is its answer; the "+N" comes at the impact) ── /crafta19 ──
      if (g === 'perfect' && s.craft) T.perfect(s.at);
      else T.feedback(s.at, s.strike || s.craft ? (g === 'soft' ? '+1' : g === 'good' && s.craft ? 'טוב' : '+1') : '', g === 'good' && s.craft ? 'good' : '', s.strike || s.craft ? { sfx: g && o.sfx && o.sfx.has && o.sfx.has(g) ? g : 'tap', soft: g === 'soft' } : { sfx: 'ui' });
    }
    if (s && s.strike) { bt.fired = true; fire({ t: 'tap', grade: g }); }
    // ── /twin18 ──
    if (!(s && s.at) && !(s && s.craft)) { try { call('haptic', 10); } catch (e) { /* */ } if (!(s && s.act31)) { try { o.sfx && o.sfx.play && o.sfx.play('tap'); } catch (e) { /* */ } } }   // ── fable32 (build 3) ── every touch on the button answers within the frame: a buzz always, a tick when no act of its own answers (the act's own input answers its touch-down) ── /fable32 ──
    if (s && s.craft) fire({ t: 'press', down: true });   // ── craftb19 ── (a craft hears the touch-down at once: the kohen's first frame ≤ 50 ms, FUN19 §2) ── /craftb19 ──
    call('emit', 'twinBtn', { at: 'down', job: s ? s.job : null, hold: st.hold, why: s ? '' : call('why') });
  });
  btn.addEventListener('pointermove', (e) => {
    if (e.pointerId !== bt.id) return;
    e.preventDefault();
    bt.dx = e.clientX - bt.x; bt.dy = e.clientY - bt.y;
    if (!bt.drag && Math.hypot(bt.dx, bt.dy) > 18) { bt.drag = true; fire({ t: 'down', dx: 0, dy: 0 }); }
    if (bt.drag) { fire({ t: 'move', dx: bt.dx, dy: bt.dy }); if (!T.noPinch) t20Step(bt.dx, bt.dy); }   // ── recovered (16–26c) ── (T.noPinch)   // ── twin20 ── (aimAt → the world's aim + the target + the power) ── /twin20 ──
  });
  const bUp = (e) => {
    if (e.pointerId !== bt.id) return;
    const drag = bt.drag; bt.id = null; btn.classList.remove('down'); aim.classList.remove('on'); if (e.type === 'pointercancel' || e.type === 'lostpointercapture') t20Off(true);   // ── twin20 ── ── /twin20 ──
    if (T.swallowUp) { T.swallowUp = 0; return; }   // ── recovered (16–26c) ── (T.swallowUp: this release belongs to what the touch-down already did)
    if (spec && spec.craft) fire({ t: 'press', down: false });   // ── craftb19 ── (the release, before its tap or its drag's end) ── /craftb19 ──
    if (e.type === 'pointercancel' || e.type === 'lostpointercapture') { if (drag) fire({ t: 'cancel', dx: bt.dx, dy: bt.dy }); return; }
    if (bt.fired && !drag) return;   // ── twin18 ── (the strike already fired on the touch) ── /twin18 ──
    const k20 = drag ? t20Release() : null;   // ── twin20 ── (the aimed release: the target the knob chose, the power) ── /twin20 ──
    fire(drag ? { t: 'up', dx: bt.dx, dy: bt.dy, grade: bt.grade, spec: k20 && k20.spec || bt.spec, power: k20 ? k20.power : 1, aimed: !!k20 } : { t: 'tap', grade: bt.grade, spec: bt.spec });   // ── crafta19 ── (spec: the touch-down's) ── /crafta19 ──
  };
  btn.addEventListener('pointerup', bUp); btn.addEventListener('pointercancel', bUp); btn.addEventListener('lostpointercapture', bUp);
  btn.addEventListener('click', (e) => e.preventDefault());
  /** the aim, drawn from the work in the world along the thumb's drag (the line Brawl Stars draws on the ground) */
  function aimAt(dx, dy) {
    const s = spec, at = s && s.at; if (!at || !o.view || !o.view.project) return;
    const q = (o.view.projectRaw || o.view.project).call(o.view, at.x, at.y, at.z); if (!q || !q.on) return;
    const L = Math.min(180, Math.hypot(dx, dy) * 1.6), a = Math.atan2(dy, dx);
    aim.style.width = `${Math.round(L)}px`; aim.style.transform = `translate(${Math.round(q.x)}px,${Math.round(q.y)}px) rotate(${a}rad)`;
    aim.classList.add('on');
  }
  T.aim = aimAt;
  // ── twin20 ── the right thumb as a joystick: a drag ≥ 18 px aims (camera-relative like the left stick); its DIRECTION picks the work point
  // within reach (the knob passing over a marker's bearing lights it), its LENGTH the power (3 pips: 1.0 · 1.3 · 1.6); the release does it.
  // A tap alone is untouched. The aim is drawn in the world by stages.aim (one flat arrow); the act reads globalThis.__TW_POWER.
  const P20 = [1.0, 1.3, 1.6], L20 = [3, 5.5, 8], t20 = { lvl: 0, pick: null, dir: 0, on: false, vx: 0, vz: 0 };
  const pw = (v, ms) => { try { globalThis.__TW_POWER = v ? { p: v, until: performance.now() + ms } : null; } catch (e) { /* */ } };
  function t20Step(dx, dy) {
    const L = Math.hypot(dx, dy), h = hero(); if (!h || !(L > 0)) return;
    const fx = -Math.cos(st.az), fz = -Math.sin(st.az), rx = -fz, rz = fx, ux = dx / L, uy = -dy / L;
    const vx = fx * uy + rx * ux, vz = fz * uy + rz * ux, lvl = L < 42 ? 0 : L < 70 ? 1 : 2;
    let best = null, bc = 0.5; const list = call('marks') || [];
    for (let i = 0; i < list.length; i++) { const m = list[i], ex = m.x - h.x, ez = m.z - h.z, d = Math.hypot(ex, ez); if (d > 16 || d < 1.2) continue; const c = (ex * vx + ez * vz) / d; if (c > bc) { bc = c; best = m; } }
    t20.lvl = lvl; t20.pick = best; t20.on = true; t20.vx = vx; t20.vz = vz;
    t20.dir = best ? Math.atan2(best.z - h.z, best.x - h.x) : Math.atan2(vz, vx);   // (a chosen target: the arrow turns to it)
    for (const m of MK) m.el.classList.toggle('aimed', !!(best && m.on && m.job === best.job));
    pw20.classList.add('on'); pw20.children[0].className = 'f'; pw20.children[1].className = lvl >= 1 ? 'f' : ''; pw20.children[2].className = lvl >= 2 ? 'f' : '';
    btn.classList.add('aiming'); const k = Math.min(1, 46 / L); ic.style.transform = `translate(${Math.round(dx * k)}px,${Math.round(dy * k)}px)`;
    pw(P20[lvl], 6000);
    try { if (o.stages && typeof o.stages.aim === 'function') o.stages.aim(h.x, h.z, t20.dir, L20[lvl], true, !!best); else aimAt(dx, dy); } catch (e) { /* the world's */ }
  }
  function t20Off(cancel) {
    if (t20.on || cancel) { try { if (o.stages && typeof o.stages.aim === 'function') o.stages.aim(0, 0, 0, 1, false); } catch (e) { /* */ } }
    t20.on = false; t20.pick = null; pw20.classList.remove('on'); btn.classList.remove('aiming'); ic.style.transform = '';
    for (const m of MK) m.el.classList.remove('aimed');
    if (cancel) pw(0, 0);
  }
  /** the release of a drag: { spec (the picked marker's work, or null: the touch-down's), power } */
  function t20Release() {
    const pick = t20.pick, power = P20[t20.lvl]; let sp = null;
    if (pick) { try { sp = call('pickMark', pick); } catch (e) { sp = null; } }
    pw(power, 1500); t20Off();
    try { const n = (+(localStorage.getItem('bh_twin_aimed') || 0) | 0) + 1; localStorage.setItem('bh_twin_aimed', String(n)); if (n >= 3) tipDone(4); } catch (e) { /* */ }
    return { spec: sp, power };
  }
  let tip20T = 0, tip20Last = 0;
  function tip20Step(ms) {   // the second tip: once, after the walking tip retires (and the first work), ≈ 7 s in all; gone after 3 aimed acts
    const dt = tip20Last ? Math.min(0.1, (ms - tip20Last) / 1000) : 0; tip20Last = ms;
    const want = !!(tips & 1) && !!(tips & 2) && !(tips & 4) && !(tips & 8) && !!spec && !t20.on && st.on;
    if (want) { tip20T += dt; if (tip20T > 7) tipDone(8); }
    const show = want && tip20T <= 7; if (tip20.hidden === show) tip20.hidden = !show;
  }
  T.t20 = () => ({ on: t20.on, lvl: t20.lvl, pick: t20.pick && t20.pick.job, dir: t20.dir, tip: !tip20.hidden });
  // ── /twin20 ──

  /* "יד של אומן": charges from good work (perfect strokes), glows when ready; a tap = the craft's special */
  const hand = { k: 0 };
  // ── ux24 ── (docs/UX24.md #10) "יד של אומן מוכנה!" said nothing a kid could act on (shots l-110s, l-218s: it glowed, he never
  // touched it): the first two times it is ready, a tip over it says what to do; it goes on the touch or after 5 s
  const uxHand = { rd: false, el: el('tw-tip ux-hand', 'לחצו כאן — מכה של אומן!'), t: 0 };
  uxHand.el.hidden = true; pad.appendChild(uxHand.el);
  function uxHandTip(on) {
    clearTimeout(uxHand.t);
    if (!on) { uxHand.el.hidden = true; return; }
    let n = 0; try { n = +(localStorage.getItem('bh_ux24_hand') || 0) | 0; } catch (e) { n = uxHand.n | 0; }
    if (n >= 2) return;
    try { localStorage.setItem('bh_ux24_hand', String(n + 1)); } catch (e) { uxHand.n = n + 1; }
    uxHand.el.hidden = false; uxHand.t = setTimeout(() => { uxHand.el.hidden = true; }, 5000);
  }
  handBtn.addEventListener('pointerdown', () => { clearTimeout(uxHand.t); uxHand.el.hidden = true; }, true);
  // ── /ux24 ──
  handBtn.addEventListener('pointerdown', (e) => {
    if (!st.on) return; e.preventDefault(); e.stopPropagation();
    if (hand.k < 1) { call('emit', 'twinHand', { ready: false }); return; }
    const s = spec; if (!s || typeof s.special !== 'function') { call('emit', 'twinHand', { ready: true, none: true }); return; }
    hand.k = 0; call('emit', 'twinHand', { ready: true, used: true });
    try { s.special(); } catch (err) { /* the game's */ }
  });

  /* ── the pinch on the free canvas: zoom out to see what is built (he may leave the screen) ── */
  const zoom = { k: 1, goal: 1, free: false, ids: new Map(), d0: 0, k0: 1 };
  // ── craftb19 ── while a craft runs in the world (hands.js under two thumbs), the follow camera comes closer (0.62 of its distance) and
  // looks between him and his work, so the craft reads at a phone's size (the cloth, the bob, the kerf); it eases back when the craft
  // ends; never in the overview or a pinch's free view. NAV19: yours to keep, tune or replace. One object, no allocation.
  const CBC = { k: 1, ox: 0, oz: 0, oy: 0, vk: 0, vl: null };   // ── places24 ── (vk, vl: the real place's view)   // ── site20 ── (oy: the gaze's lift to the key stone) ── /site20 ──
  function cbCam(dt, h) {
    const Hh = globalThis.__HANDS, Wk = call('camWork');   // ── polish23 ── (Phase B's day: a work with its stage of props in the world asks for the same closer camera — { x, z } the stage's middle, k the distance's share)
    const on = !!((Hh && Hh.twin && !OV.on && !zoom.free) || (Wk && !OV.on && !zoom.free));
    let wx = 0, wz = 0, wy = 0, kk = 0.62;
    { const iw = !!((Hh && Hh.twin) || Wk); if (iw !== !!CBC.iw) { CBC.iw = iw; zoom.goal = 1; zoom.free = false; } }   // ── fix26 ── (a work begins or ends: the pinch's zoom starts again at 1) ── /fix26 ──
    if (Wk && !(Hh && Hh.twin) && Number.isFinite(Wk.x) && Number.isFinite(Wk.z) && Math.hypot(Wk.x - h.x, Wk.z - h.z) < 14) { const sh = Number.isFinite(Wk.share) ? Wk.share : 0.5; /* ── fix26 ── (a work may ask the gaze nearer its stage) ── /fix26 ── */ wx = (Wk.x - h.x) * sh; wz = (Wk.z - h.z) * sh; if (Number.isFinite(Wk.k)) kk = Wk.k; }
    // ── /polish23 ──
    // ── site20 ── the key stone (atW.ks: the stone's own point): the gaze goes 0.8 of the way to it, and rises half-way to its height — it hangs
    // up the frame at first and lands in its middle, with him beside it
    if (on && Hh && Hh.twin && typeof Hh.atW === 'function') { const a = Hh.atW(); if (a && Number.isFinite(a.x) && Number.isFinite(a.z) && Math.hypot(a.x - h.x, a.z - h.z) < 12) { const kf = a.ks ? 0.8 : 0.4; wx = (a.x - h.x) * kf; wz = (a.z - h.z) * kf; if (a.ks && Number.isFinite(a.y)) wy = Math.max(-1, Math.min(6, (a.y - h.y - 1.6) * 0.5)); } }
    // ── /site20 ──
    const e = 1 - Math.exp(-dt * 3);
    // ── places24 ── a work on a real place may ask for its own camera (Wk.view = { p, t }: the place's view — inside the Heichal's door for the
    // menorah / the golden altar; the אמרכל stays outside): eased in over ~0.9 s, held while it is asked, eased back when it is not
    { let V = Wk && Wk.view && Wk.view.p && Wk.view.t && !OV.on && !zoom.free ? Wk.view : null;
      // ── fable32 (build 40) ── the thing near the right thumb (pan40); held as it was while a finger is on the thing ── /fable32 ──
      // ── fable32 (build 41) ── every authored act view, with a thing to touch or without (the laver, the lot): his figure ≤ 45 % of the
      // height and inside the frame — without a thing the view only steps back (no slide) ── /fable32 ──
      { const G40 = globalThis.__T40, O0 = G40 && G40.obj;
        if (V && !globalThis.__CAM40_OFF && !V.own) {   /* ── build 52 ── (V.own: an act's view set by hand for its look — the shochet's binding, the laver — taken as it is: no pan40, no obj51) ── */
          const O = O0 || (h ? { x: h.x, y: (h.y || 16) + HERO41 / 2, z: h.z, at: 0.5, none: true } : null);
          if (!O) { CBC.v40 = null; }
          else if (G40 && G40.down && CBC.v40) V = CBC.v40;
          else { let r40 = null; try { const cam = globalThis.__T && globalThis.__T.camera, tanH = Math.tan(((cam && cam.fov) || 50) * Math.PI / 360) * ((typeof innerWidth === 'number' ? innerWidth : 844) / (typeof innerHeight === 'number' ? innerHeight : 390)); const H40 = h ? { x: h.x, y: (h.y || 16) + HERO41 / 2, z: h.z, h: HERO41 } : null, tanV = Math.tan(((cam && cam.fov) || 50) * Math.PI / 360);   /* (his middle and his height — build 41) */ const M51 = !!(Wk && Wk.view && Wk.view.macro), C40a = O.none ? { ...CAM41, pan: 0 } : Number.isFinite(O.at) ? { ...CAM41, at: O.at } : CAM41, C40 = M51 ? { ...C40a, big: 9, heroR: 9, hero: -9, back: 0 } : C40a; r40 = pan40(V.p, V.t, O, H40, tanH, C40, tanV);   /* ── build 51 ── (a macro view — the lamb, the shochet's binding: the thing first, him not stepped back for; the object rule brings it to its aim) ── */
            // (never into a wall — the House's narrow hall, a chamber: the slide shortened while its line from the look is cut and the
            // authored one's is not; else the authored view as it was — cam28's seg, the guard's own test)
            const sg = globalThis.__DAY && globalThis.__DAY.cam28, cut = (P, Tg) => !!(sg && typeof sg.seg === 'function' && sg.seg(Tg[0], Tg[1], Tg[2], P[0], P[1], P[2]));
            // ── fable32 (build 41) ── (the lamb's pen, a chamber: a step back cut by a wall) first the same step raised over it — the camera
            // looks down at him and the thing — then the shorter steps ── /fable32 ──
            if (r40 && cut(r40.p, r40.t) && !cut(V.p, V.t)) { for (const up of [2, 4, 6]) { const P2 = [r40.p[0], r40.p[1] + up, r40.p[2]]; if (!cut(P2, r40.t)) { r40 = { ...r40, p: P2, up }; break; } } }
            if (r40 && cut(r40.p, r40.t) && !cut(V.p, V.t)) { let q = null; for (const k of [0.6, 0.3]) { q = pan40(V.p, V.t, O, H40, tanH, { ...C40, pan: Math.abs(r40.sh) * k, back: r40.back * k }, tanV); if (q && !cut(q.p, q.t)) break; q = null; } r40 = q; } /* ── build 51 ── the object rule (obj51): the thing ≥ 30 % of the width and 20 % of the height, never behind him ── */ { const bb51 = (O0 && O0.bb) || (globalThis.__OBJ51K && globalThis.__OBJ51K.bb) || null, id51 = (O0 && O0.bb && O0.id) || (globalThis.__OBJ51K && globalThis.__OBJ51K.id) || ''; if (bb51 && !globalThis.__OBJ51_OFF && !(O0 && O0.self)) { const Oc = [(bb51[0] + bb51[3]) / 2, (bb51[1] + bb51[4]) / 2 + 0.3, (bb51[2] + bb51[5]) / 2], segO = (P) => !!(sg && typeof sg.seg === 'function' && sg.seg(Oc[0], Oc[1], Oc[2], P[0], P[1], P[2])), cutA = segO(V.p), cut51 = (P) => !cutA && segO(P);   /* (the line of sight to the thing — counted only where the authored view's own is clear: a look into a mass is not a wall) */ const b0 = r40 || { p: V.p, t: V.t, sh: 0, back: 0 }, q51 = obj51(b0.p, b0.t, bb51, h ? { x: h.x, y: h.y || 16, z: h.z, h: HERO41 } : null, tanH, tanV, { ...OBJ51, ...(M51 ? { big: 9, whole: false, lift: [0], aimW: Wk.view.aimW || OBJ51.aimW } : LIFT51.includes(id51) ? {} : { lift: [0] }), ...(OBJ52[id51] || {}), ...(CBC.a51 == null ? {} : { prefer: CBC.a51 }), ...(Array.isArray(globalThis.__AVOID51) ? { avoid: globalThis.__AVOID51 } : {}) }, cut51); try { globalThis.__CAM51R = q51 ? { w: Math.round(q51.w * 100), h: Math.round(q51.h * 100), occ: q51.occ, a: Math.round(q51.a * 57), L: q51.L, s: Math.round(q51.s * 100) / 100, big: Math.round(q51.big * 100), self: q51.self } : { none: 1 }; } catch (e3) { /* */ } if (q51 && !q51.self) { r40 = { ...b0, p: q51.p, t: q51.t, o51: q51 }; CBC.a51 = q51.key; } } } /* ── /build 51 ── */ try { globalThis.__CAM40R = r40 ? { back: r40.back, sh: Math.round(r40.sh * 10) / 10, big: r40.big == null ? null : Math.round(r40.big * 100) / 100, hx: r40.hx == null ? null : Math.round(r40.hx * 100) / 100, up: r40.up || 0 } : { none: 1, cutV: cut(V.p, V.t) }; } catch (e2) { /* */ }   /* ── fable32 (build 41) ── (the tools' note: the act view's step) ── */ } catch (e) { r40 = null; } if (r40) { V = { p: r40.p, t: r40.t, e: V.e }; CBC.v40 = V; CBC.r40 = r40; } }
        } else { CBC.v40 = null; CBC.a51 = null; } }
      if (V) { if (!CBC.vl) CBC.vl = { p: V.p.slice(), t: V.t.slice() }; else { const ev = 1 - Math.exp(-dt * (V.e > 0 ? V.e : 2.4)); for (let i = 0; i < 3; i++) { CBC.vl.p[i] += (V.p[i] - CBC.vl.p[i]) * ev; CBC.vl.t[i] += (V.t[i] - CBC.vl.t[i]) * ev; } } }   // (a view that moves — the act's next place — glides, never cuts)   // ── recovered (16–26c) ── (V.e: the view's own ease)
      // ── build 51 ── an act's view may ask its own field of view (Wk.view.fov — the shochet's macro on the lamb, 35°): eased in, and the
      // camera's own back when it is not asked ── /build 51 ──
      { const cam = globalThis.__T && globalThis.__T.camera, fw = Wk && Wk.view && Wk.view.fov > 0 && !OV.on && !zoom.free ? Wk.view.fov : 0;
        if (cam && cam.isPerspectiveCamera) { if (fw) { if (CBC.fov0 == null) CBC.fov0 = cam.fov; const nf = cam.fov + (fw - cam.fov) * (1 - Math.exp(-dt * 3)); if (Math.abs(nf - cam.fov) > 0.01) { cam.fov = nf; cam.updateProjectionMatrix(); } } else if (CBC.fov0 != null) { let nf = cam.fov + (CBC.fov0 - cam.fov) * (1 - Math.exp(-dt * 3)); if (Math.abs(nf - CBC.fov0) < 0.05) { nf = CBC.fov0; CBC.fov0 = null; } cam.fov = nf; cam.updateProjectionMatrix(); } } }
      CBC.vk += ((V ? 1 : 0) - CBC.vk) * (1 - Math.exp(-dt * 2.6)); if (!V && CBC.vk < 0.002) { CBC.vk = 0; CBC.vl = null; }
      // (the place's view stands nearer than the orbit's 35-amah minimum: hold the near limits while it is on — main.js view.closeCam, keyed)
      const hold = !!(V || CBC.vk > 0); if (hold !== !!CBC.vh && o.view && typeof o.view.closeCam === 'function') { o.view.closeCam(hold, 'p24'); CBC.vh = hold; } }
    // ── /places24 ──
    CBC.k += ((on ? kk : 1) - CBC.k) * e; CBC.ox += (wx - CBC.ox) * e; CBC.oz += (wz - CBC.oz) * e; CBC.oy += (wy - CBC.oy) * e;   // ── site20 ── (oy) ── /site20 ──
    return CBC;
  }
  // ── /craftb19 ──
  const canvas = () => doc.getElementById('c') || doc.querySelector('canvas');
  // ── fix26 ── (the owner, 10.10: "זום אין / זום אאוט לא עובד פה טוב") — a pinch whose one finger lands on the walk zone (its left 45% from a
  // third of the height down: most pinches in the middle of a phone) was the stick's, and never a zoom. Now: two fingers on the canvas or the
  // zone, before the stick's finger has moved (or both on the canvas) = a pinch — the stick lets go. With no work: out to ×6 (the day's
  // world seen; free of him), back by the stick; during a work: ×[0.7, 1.6] of the close camera, which stays on. A two-finger double-tap resets.
  const zoneOf = (t) => !!(t && zone && (t === zone || zone.contains(t)));
  const inWork = () => !!((globalThis.__HANDS && globalThis.__HANDS.twin) || call('camWork'));
  zoom.pin = false; zoom.pinT = 0; zoom.moved = false; zoom.tap2 = 0;
  // ── cam28 ── "lift me up" (the owner, 12.10: "לחיצה על חצי מסך ימין שיעלה אותי קצת או הרבה למעלה"): one finger's vertical drag on the
  // free right half of the canvas (the work button, "מבט על" and the stick are their own elements) raises the follow camera at once and
  // continuously — 24 px a little (+15°, ×1.3 the distance), 120 px a lot (the overview's height, he stays in the middle). It holds
  // while the finger holds and eases back over 1.5 s after the release; a double-tap on the right half keeps it up ("stay up") or lets
  // it down. Off during a work (a work's taps on the world are its own), a card, the overview. The pinch stays.
  const LIFT = { id: null, x0: 0, y0: 0, t0: 0, drag: false, goal: 0, k: 0, stay: false, stayK: 0, relK: 0, relT: 9, tapT: 0, tapX: 0, tapY: 0, n: 0, max: 0, ev: 0 };
  const liftOf = (up) => { const a = Math.abs(up); const k = a < 8 ? 0 : a < 24 ? 0.15 * (a - 8) / 16 : Math.min(1, 0.15 + 0.85 * (a - 24) / 96); return up < 0 ? -k : k; };
  const liftOk = () => !!o.lift && st.on && st.camOn && !st.hold && !OV.on && !inWork() && !(T.camOver && T.camOver.shift30);   // ── flow31 ── (not in the shift: the lift fought the button — a zoom button there) ── /flow31 ──   // (o.lift: Phase B's day — the building game's right half keeps its taps as they were)
  function liftRelease(why) {
    if (LIFT.id == null && why !== 'stay') return;
    LIFT.id = null; LIFT.drag = false;
    if (LIFT.stay) LIFT.stayK = Math.max(0, Math.min(1, LIFT.k)); else { LIFT.relK = LIFT.k; LIFT.relT = 0; }
    call('emit', 'twinLift', { at: 'up', k: Math.round(LIFT.k * 100) / 100, stay: LIFT.stay, why });
  }
  function liftStay(on) {
    on = !!on; if (on === LIFT.stay) return; LIFT.stay = on;
    if (on) LIFT.stayK = Math.max(0.15, LIFT.k); else { LIFT.relK = LIFT.k; LIFT.relT = 0; }
    call('emit', 'twinLift', { at: 'stay', stay: on, k: Math.round(LIFT.stayK * 100) / 100 });
  }
  function liftStep(dt) {
    if (!liftOk()) { if (LIFT.id != null) liftRelease('off'); if (LIFT.stay) liftStay(false); }
    if (LIFT.id != null) LIFT.k += (LIFT.goal - LIFT.k) * (1 - Math.exp(-dt * 9));
    else if (LIFT.stay) LIFT.k += (LIFT.stayK - LIFT.k) * (1 - Math.exp(-dt * 6));
    else if (LIFT.k > 0) { LIFT.relT += dt; const u = Math.min(1, LIFT.relT / 1.5), e = 1 - u * u * (3 - 2 * u); LIFT.k = LIFT.relK * e; if (u >= 1) LIFT.k = 0; }
    if (LIFT.k > LIFT.max) LIFT.max = LIFT.k;
  }
  const liftDown = (e) => {
    if (LIFT.id != null || zoom.ids.size !== 1 || e.clientX < innerWidth * 0.5 || !liftOk()) return;
    LIFT.id = e.pointerId; LIFT.x0 = e.clientX; LIFT.y0 = e.clientY; LIFT.t0 = Number.isFinite(e.timeStamp) && e.timeStamp > 0 ? e.timeStamp : performance.now(); LIFT.drag = false; LIFT.goal = LIFT.stay ? LIFT.stayK : LIFT.k;   // (t0: the event's own time — a busy frame does not stretch a tap)
  };
  const liftMove = (e) => {
    if (e.pointerId !== LIFT.id) return;
    if (zoom.ids.size >= 2) { liftRelease('pinch'); return; }
    const up = LIFT.y0 - e.clientY, k = liftOf(up);
    if (!LIFT.drag && Math.abs(up) >= 8) { LIFT.drag = true; LIFT.n++; tipDone28(); call('emit', 'twinLift', { at: 'down' }); }
    if (LIFT.drag) { globalThis.__TW_GEST = performance.now(); LIFT.goal = Math.max(0, Math.min(1, (LIFT.stay ? LIFT.stayK : 0) + k)); }
  };
  const liftUp = (e) => {
    if (e.pointerId !== LIFT.id) return;
    const now = Number.isFinite(e.timeStamp) && e.timeStamp > 0 ? e.timeStamp : performance.now(), tap = !LIFT.drag && now - LIFT.t0 < 350 && Math.hypot(e.clientX - LIFT.x0, e.clientY - LIFT.y0) < 12;
    liftRelease(e.type);
    if (tap && e.type === 'pointerup') {
      if (now - LIFT.tapT < 450 && Math.hypot(e.clientX - LIFT.tapX, e.clientY - LIFT.tapY) < 48) { LIFT.tapT = 0; globalThis.__TW_GEST = performance.now(); liftStay(!LIFT.stay); }
      else {
        LIFT.tapT = now; LIFT.tapX = e.clientX; LIFT.tapY = e.clientY;
        // (the first tap of a double-tap opened an info card under it — "שער ניקנור" over the whole frame: a single tap on the right half
        //  now picks only when no second tap came in the window)
        if (o.view && typeof o.view.pickAt === 'function') { globalThis.__TW_GEST = performance.now(); const x = e.clientX, y = e.clientY, t = now; setTimeout(() => { if (LIFT.tapT === t) o.view.pickAt(x, y); }, 470); }
      }
    }
  };
  // the hint: the first 3 days on this device (from its first showing), until the lift was used 3 times; never during a work or a card
  let hint28 = { d0: 0, n: 0 }; try { hint28 = JSON.parse(localStorage.getItem('bh_cam28_lift') || 'null') || hint28; } catch (e) { /* */ }
  const hintSave = () => { try { localStorage.setItem('bh_cam28_lift', JSON.stringify(hint28)); } catch (e) { /* not kept */ } };
  function tipDone28() { hint28.n = (hint28.n | 0) + 1; hintSave(); }
  function hintStep() {
    let want = liftOk() && LIFT.k < 0.05 && !stick.on && (hint28.n | 0) < 3 && !globalThis.__CAM28_NOHINT;
    if (want) { const now = Date.now(); if (!hint28.d0) { hint28.d0 = now; hintSave(); } if (now - hint28.d0 > 3 * 864e5) want = false; }
    if (liftEl.hidden === want) liftEl.hidden = !want;
  }
  T.lift = () => ({ id: LIFT.id, tapT: Math.round(LIFT.tapT), ids: zoom.ids.size, ok: liftOk(), k: Math.round(LIFT.k * 1000) / 1000, goal: LIFT.goal, stay: LIFT.stay, held: LIFT.id != null, n: LIFT.n, max: Math.round(LIFT.max * 1000) / 1000, hint: !liftEl.hidden, el: Math.round(st.el28 * 1000) / 1000, d: Math.round(st.d28 * 10) / 10 });
  T.liftReset = () => { LIFT.max = 0; };
  // ── /cam28 ──
  const onPtr = (e) => {
    if (!st.on) return;
    if (e.type === 'pointerdown') {
      if (T.noPinch) return;   // ── recovered (16–26c) ── (T.noPinch: no pinch, no drag-turn)
      const c = e.target === canvas(), zn = zoneOf(e.target); if (!c && !zn) return;
      const now = performance.now(); zoom.ids.set(e.pointerId, [e.clientX, e.clientY, now, zn]);
      if (c) liftDown(e);   // ── cam28 ── ── /cam28 ──
      // ── cam28 ── the right thumb lifting and the left one landing on the walk zone: the stick's, not a pinch; else a pinch lets the lift go
      if (zoom.ids.size === 2 && LIFT.id != null) { if (zn && LIFT.drag) { zoom.ids.delete(e.pointerId); return; } liftRelease('pinch'); }
      // ── /cam28 ──
      if (zoom.ids.size === 2) {
        const [a, b] = [...zoom.ids.values()];
        if ((a[3] || b[3]) && stick.on && Math.hypot(stick.dx, stick.dy) > 14) { zoom.ids.delete(e.pointerId); return; }   // (he walks with one thumb — the stick has moved —, the other touched: not a pinch)
        zoom.pin = true; globalThis.__TW_GEST = now; zoom.pinT = now; zoom.moved = false; zoom.d0 = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1; zoom.k0 = zoom.goal;
        if (stick.on) stickEnd('pinch');
        if (zn) { e.stopImmediatePropagation(); e.preventDefault(); }   // (the second finger on the zone starts no stick)
      }
      return;
    }
    if (!zoom.ids.has(e.pointerId)) return;
    if (e.type === 'pointermove') {
      const p = zoom.ids.get(e.pointerId); p[0] = e.clientX; p[1] = e.clientY;
      liftMove(e);   // ── cam28 ── ── /cam28 ──
      if (zoom.ids.size === 2 && zoom.pin) {
        const [a, b] = [...zoom.ids.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1; if (Math.abs(d - zoom.d0) > 24) zoom.moved = true;
        if (stick.on) stickEnd('pinch');
        if (inWork()) { zoom.goal = Math.max(0.7, Math.min(1.6, zoom.k0 * zoom.d0 / d)); zoom.free = false; }
        else { zoom.goal = Math.max(0.7, Math.min(6, zoom.k0 * zoom.d0 / d)); zoom.free = zoom.goal > 1.3; }
      }
      return;
    }
    liftUp(e);   // ── cam28 ── ── /cam28 ──
    if (zoom.pin || zoom.ids.size === 2) globalThis.__TW_GEST = performance.now();
    if (zoom.pin && zoom.ids.size === 2) {
      const now = performance.now(); zoom.pin = false;
      if (!zoom.moved && now - zoom.pinT < 350) { if (now - zoom.tap2 < 600) { zoom.goal = 1; zoom.free = false; zoom.tap2 = 0; call('emit', 'twinZoom', { reset: true }); } else zoom.tap2 = now; }
    }
    zoom.ids.delete(e.pointerId);
  };
  // ── /fix26 ──
  for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) window.addEventListener(t, onPtr, true);
  // ── fix26 ── two fingers never zoom the PAGE under two thumbs (a phone's own pinch-zoom took the gesture and left the HUD enlarged): the
  // game's pinch is the camera's
  const noPage = (e) => { if (st.on && e.touches && e.touches.length > 1 && e.cancelable) e.preventDefault(); };
  try { doc.addEventListener('touchmove', noPage, { passive: false, capture: true }); doc.addEventListener('gesturestart', (e) => { if (st.on && e.cancelable) e.preventDefault(); }, { passive: false }); } catch (e) { /* */ }
  // ── /fix26 ──

  /* ── four answers to a touch on material, at once (PRINCIPLES §4: within 50 ms) ── */
  const fb = { t0: 0, dust: 0, float: 0, buzz: 0, sound: 0, n: 0 };
  T.feedback = (at, text = '+1', kind = '', o2 = {}) => {
    const t = performance.now(); fb.t0 = st.tDown || t; fb.n++;
    // ── twin18 ── (contract 3) JUICE18's juice.hit answers every touch on material when it is there — today's four answers below
    // stay its fallback. kind: 'rock' | 'strike' | 'craft' | 'pick'; craft = the job's trade (jobs.js)
    { const J = call('juice'); if (J && typeof J.hit === 'function') { const s0 = spec; try { J.hit(o2.hit || (s0 && s0.craft ? 'craft' : s0 && s0.job === 'rock' ? 'rock' : s0 && s0.strike ? 'strike' : 'pick'), { at, text, perfect: kind === 'gold', combo: o2.combo || 0, craft: s0 && s0.trade || null, quality: kind === 'gold' ? 1 : o2.soft ? 0.6 : 0.82, grade: o2.grade || null }); const t2 = performance.now(); fb.dust = fb.float = fb.buzz = fb.sound = t2; return; } catch (e) { /* JUICE18's: the fallback below */ } } }
    // ── /twin18 ──
    const S = o.stages;
    try { if (at && S && typeof S.dustBurst === 'function') { S.dustBurst(at.x, at.y, at.z, kind === 'gold' ? 12 : 7, 2.4, 2, 1.2); if (kind === 'gold' && typeof S.sparkBurst === 'function') S.sparkBurst(at.x, at.y + 0.6, at.z, 18, 4, 6); fb.dust = performance.now(); } } catch (e) { /* the world's */ }
    try { const q = at && o.view && o.view.project ? (o.view.projectRaw || o.view.project).call(o.view, at.x, at.y + 1.6, at.z) : null; const x = q && q.on ? q.x : innerWidth * 0.5, y = q && q.on ? q.y : innerHeight * 0.45;
      if (o.sfx && typeof o.sfx.pop === 'function') { o.sfx.pop(text, Math.round(x), Math.round(y - 24), kind === 'gold' ? 'gold big' : kind || 'stone'); fb.float = performance.now(); } } catch (e) { /* */ }
    try { if (S && typeof S.twinShake === 'function') S.twinShake(kind === 'gold' ? 0.14 : 0.07, kind === 'gold' ? 0.18 : 0.08); call('haptic', kind === 'gold' ? [12, 30, 18] : 10); fb.buzz = performance.now(); } catch (e) { /* */ }
    try { if (!o2.quiet && o.sfx && typeof o.sfx.play === 'function') { o.sfx.play(o2.sfx || 'tap', { combo: 4 }); } fb.sound = performance.now(); } catch (e) { /* */ }
  };
  /** a perfect stroke: a gold flash and a big "מושלם!" (seen from afar) */
  T.perfect = (at) => {
    let fx = '50%', fy = '45%';
    try { const q = at && o.view && o.view.project ? (o.view.projectRaw || o.view.project).call(o.view, at.x, at.y + 1, at.z) : null; if (q && q.on) { fx = `${Math.round(q.x)}px`; fy = `${Math.round(q.y)}px`; } } catch (e) { /* */ }
    flash.style.setProperty('--fx', fx); flash.style.setProperty('--fy', fy);
    flash.classList.add('on'); setTimeout(() => flash.classList.remove('on'), 160);
    T.feedback(at, 'מושלם!', 'gold', { sfx: 'perfect' });
    hand.k = Math.min(1, hand.k + 0.34);
  };
  // ── crafta19 ── the impact's grade on the button (the act's, never the touch's) and the gold flash without a number
  function caFlash(at) {
    let fx = '50%', fy = '45%';
    try { const q = at && o.view && o.view.project ? (o.view.projectRaw || o.view.project).call(o.view, at.x, at.y + 1, at.z) : null; if (q && q.on) { fx = `${Math.round(q.x)}px`; fy = `${Math.round(q.y)}px`; } } catch (e) { /* */ }
    flash.style.setProperty('--fx', fx); flash.style.setProperty('--fy', fy); flash.classList.add('on'); setTimeout(() => flash.classList.remove('on'), 120);
    hand.k = Math.min(1, hand.k + 0.34);
  }
  /** q: 0 ok · 1 good · 2 gold — the button and its ring answer the act at its impact */
  T.graded = (q) => {
    const g = q >= 2 ? 'perfect' : q >= 1 ? 'good' : 'soft';
    btn.classList.remove('g-perfect', 'g-good', 'g-soft'); void btn.offsetWidth; btn.classList.add('g-' + g); setTimeout(() => btn.classList.remove('g-' + g), 260);
    pad.classList.remove('rg-hit'); void pad.offsetWidth; if (q >= 2) pad.classList.add('rg-hit');
    call('emit', 'twinGrade', { g, job: spec && spec.job || null, at: 'impact' });
  };
  // ── /crafta19 ──
  /** the game's events: a perfect strike flashes gold and charges the craftsman's hand; a good one charges it a little */
  T.event = (type, d) => {
    if (!st.on || !d) return;
    if (type === 'strike') { if (d.perfect && CA19) caFlash(spec && spec.at); else if (d.perfect) T.perfect(spec && spec.at); else hand.k = Math.min(1, hand.k + 0.08); }   // ── crafta19 ── (the perfect strike's flash without a second "+N": juice.hit already scored it at the impact) ── /crafta19 ──
    else if (type === 'jobDone' && d.q >= 0.9) hand.k = Math.min(1, hand.k + 0.34);
  };

  /* ── every frame ── */
  const cam = { x: 0, y: 0, z: 0, lx: 0, lz: 0, u: 1, p0: { px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0 }, now: {} };
  // ── cam28 ── the start frame (T.intro): his back's bearing first, then turns of it until the line to him is clear (o.clear)
  const IN28 = { on: false, fresh: false, t: 0, az: 0, el: 0.436, n: 0 };
  // (the brief asked 12 amot: at this camera's 32° the 6.5-amah hero is cut at the head from 12 — the frame is 6.9 amot tall there. 20 amot
  //  looking at his middle shows all of him, ≈ 57 % of the frame's height ⚑)
  const I28 = { d: 20, y: 4.5 };   // (the look point 4.5 amot up: his head sits under the three-line HUD)
  function introAz(h) {
    const yaw = Number.isFinite(h.yaw) ? h.yaw : 0, back = Math.atan2(-Math.cos(yaw), -Math.sin(yaw));   // (he faces (sin yaw, cos yaw) — test/cam28-yaw.cjs's two frames: his face, his back; behind him as an angle from +x toward +z)
    if (!fn('clear')) return back;
    const hy = h.y + I28.y;
    // (behind him first, a little higher when the altar or the ramp stands there — "from behind" over "from the side"; then the turns)
    for (const [off, el] of [[0, 0.436], [0.35, 0.436], [-0.35, 0.436], [0, 0.65], [0.35, 0.65], [-0.35, 0.65], [0, 0.85], [0.7, 0.436], [-0.7, 0.436], [0.7, 0.7], [-0.7, 0.7], [1.1, 0.436], [-1.1, 0.436], [1.6, 0.436], [-1.6, 0.436], [2.2, 0.436], [-2.2, 0.436], [Math.PI, 0.436]]) {
      const a = back + off, c = Math.cos(el) * I28.d, sn = Math.sin(el) * I28.d;
      if (call('clear', [h.x + Math.cos(a) * c, hy + sn, h.z + Math.sin(a) * c], [h.x, h.y + 1.6, h.z]) === true)   /* (the line to his head: the guard's own) */ { IN28.off = off; IN28.el = el; return a; }
    }
    IN28.off = null; IN28.el = 0.436; return back;
  }
  T.intro = (why = '') => { if (globalThis.__SH_NOINTRO) { IN28.on = false; return; }   /* ── fable32 (build 12) ── (a headless test's: the intro's 2.6 s never pass at one frame per 15 s) ── /fable32 ── */ IN28.on = true; IN28.fresh = true; IN28.n++; IN28.why = why; call('emit', 'twinIntro', { why }); };
  T.introState = () => ({ on: IN28.on, t: Math.round(IN28.t * 100) / 100, az: Math.round(IN28.az * 100) / 100, off: IN28.off, el: IN28.el, n: IN28.n });
  T.viewK = () => CBC.vk;
  // ── /cam28 ──
  T.update = (ms) => {
    try { if (globalThis.__S29TICK) globalThis.__S29TICK(ms); } catch (e) { /* ── shift29 ── the shift's world ticks with the game's frame (shift/draw.js) ── /shift29 ── */ }
    tip20Step(ms);   // ── twin20 ── ── /twin20 ──
    const dt = st.prevMs ? Math.min(0.6, Math.max(0, (ms - st.prevMs) / 1000)) : 0; st.prevMs = ms;
    if ((st.chk -= dt) <= 0) { st.chk = 0.25; setOn(want()); }
    if (!st.on) return;
    { const g = g39(); if (g !== st.g39) { st.g39 = g; root().classList.toggle('tw-g39', g); zone.setAttribute('aria-label', g ? 'החזיקו כדי ללכת' : 'גררו כאן כדי ללכת'); } }   // ── fable32 (build 39) ── (the guided walk: the world's surface, no stick drawn) ── /fable32 ──
    // (second fix round) the thumbs are held ONLY while a card that asks something is open (moment()); a film — a key moment, a course's
    // beat — only takes the camera for its shots (film()), the stick and the button stay live
    const moment = !!call('moment'), film = !!call('film');
    if (moment !== st.hold) { st.hold = moment; root().classList.toggle('tw-hold', moment); if (moment && stick.on) dbgPush(ms, 'hold'); if (moment) stickEnd('hold'); call('emit', 'twinHold', { on: moment }); }
    const h = hero();
    // ── nav19 ── (note 12, "אני מושך ימינה והדמות פונה שמאלה") the stick walks him relative to the camera on the screen NOW — the follow
    // camera's fixed bearing was assumed, but a key moment's or a check's own shots (film), the director's camera, the glide back
    // and the overview each look from their own bearing: a drag right walked him to the right of a camera that was not there
    if (o.view && typeof o.view.camNow === 'function') { o.view.camNow(camQ); const bx = camQ.px - camQ.tx, bz = camQ.pz - camQ.tz; if (bx * bx + bz * bz > 0.25) st.az = Math.atan2(bz, bx); }
    if (Number.isFinite(globalThis.__SH_STICK_AZ)) { if (stick.on && Number.isFinite(stick.az0)) st.az = stick.az0; else st.az = globalThis.__SH_STICK_AZ; }   /* ── fable32 (build 12) ── (frozen at touch-down: the follow camera never turns 'up' under the thumb) ── /fable32 ── */   // ── fable32 ── (the shift: the camera's INTENDED bearing, which holds under the thumb — the eased, guarded camera jitters and the thumb's direction jittered with it) ── /fable32 ──
    // ── /nav19 ──
    // (debug: the stick held, he does not move — what holds him: the game's state each such frame)
    if (stick.on && h && Math.hypot(stick.dx, stick.dy) > DEAD) { if (Math.hypot(h.x - dbg.x, h.z - dbg.z) < 0.01 && dt > 0) dbgPush(ms, 'still'); dbg.x = h.x; dbg.z = h.z; }
    // ── recovered (16–26c) ── the soft stick's coast after the thumb lifts: it ends at a moment, a walk or a busy station; the
    // protocol stick (build 24) eases its velocity to rest over tau, the soft one decelerates along its heading
    const soft = T.pace && T.pace.soft;
    if (soft && !stick.on && stick.coast && h && stick.m) {
      if (moment || (globalThis.__S29W && globalThis.__S29W.on) || (globalThis.__S29S && globalThis.__S29S.busy)) { stick.coast = false; stick.m.sp = 0; }
      else if (T.pace.p24 && stick.v) {
        const v = stickVel(stick.v, 0, 0, 0, dt, T.pace.p24.tau);
        stick.m.sp = Math.hypot(v.vx, v.vz); if (stick.m.sp < 0.05) { v.vx = v.vz = 0; stick.coast = false; }
        drive(v.vx, v.vz); stick.vx = v.vx; stick.vz = v.vz;
      } else {
        stickMove(stick.m, 0, NaN, dt, soft, 11);
        const sp = stick.m.sp;
        drive(Math.sin(stick.m.hd) * sp, Math.cos(stick.m.hd) * sp); stick.vx = Math.sin(stick.m.hd) * sp; stick.vz = Math.cos(stick.m.hd) * sp;
        if (sp <= 0) { stick.coast = false; drive(0, 0); stick.vx = stick.vz = 0; }
      }
    }
    // the stick → his walk, relative to the camera's bearing (screen up = away from the camera)
    if (soft && stick.on && h && !moment && T.pace.p24) {
      // ── recovered (build 24) ── the protocol stick: the thumb's reach (stick24) is the velocity's share of the top speed (11 × pace.k);
      // held at the rim (pace.rim) for pace.after s it sprints (× pace.mul); with T.stickUse the stick is the shift's (an act's input), not a walk
      const P = T.pace.p24, pc = T.pace, L = Math.hypot(stick.dx, stick.dy), M = stick24(L, P.R), ux = L > 0 ? stick.dx / L : 0, uy = L > 0 ? -stick.dy / L : 0;
      if (!stick.m) stick.m = { sp: 0, hd: NaN }; if (!stick.v) stick.v = { vx: 0, vz: 0 };
      let top = 11 * (pc.k || 1);
      if (pc.mul > 0 && !pc.k) { stick.rimT = M >= (pc.rim || 0.95) ? (stick.rimT || 0) + dt : 0; stick.sprint = stick.rimT > (pc.after || 0.6); if (stick.sprint) top *= pc.mul; } else stick.sprint = false;
      stick.M = M;
      const G = g39();   // ── fable32 (build 39) ── ── /fable32 ──
      if (typeof T.stickUse === 'function') {
        try { if (G && T.stickUse.d21) T.stickUse(0, WALK39.push, WALK39.push); else T.stickUse(ux * M, uy * M, M); } catch (e) { /* the shift's */ }   // ── fable32 (build 39) ── (the guided hold: the ashes' descent pushed steadily) ── /fable32 ──
        stick.v.vx = stick.v.vz = 0; stick.m.sp = 0; drive(0, 0); stick.vx = stick.vz = 0;
      } else if (G) {   // ── fable32 (build 39) ── the guided walk: the guide's way, the drag only to choose; no motion with no place ── /fable32 ──
        const Ld = Math.hypot(stick.dx, stick.dy), fx = -Math.cos(st.az), fz = -Math.sin(st.az);
        let drag = null;
        if (Ld >= WALK39.pick) { const qx = stick.dx / Ld, qy = -stick.dy / Ld; g39drag.x = fx * qy - fz * qx; g39drag.z = fz * qy + fx * qx; drag = g39drag; }
        let g = null;
        try { g = T.guide39(hp, drag); } catch (e) { g = null; }
        const v = walk39(stick.v, g, top, dt);
        stick.m.sp = Math.hypot(v.vx, v.vz); drive(v.vx, v.vz); stick.vx = v.vx; stick.vz = v.vz; stick.sprint = false; stick.M = g ? WALK39.speed : 0;
      } else {
        const fx = -Math.cos(st.az), fz = -Math.sin(st.az), v = stickVel(stick.v, (fx * uy - fz * ux) * M, (fz * uy + fx * ux) * M, top, dt, P.tau);
        let dvx = v.vx, dvz = v.vz;
        if (typeof T.assist38 === 'function' && !g39()) { try { const a = T.assist38(hp.x, hp.z, dvx, dvz); if (a) { dvx = a[0]; dvz = a[1]; } } catch (e) { /* the shift's */ } }   // ── fable32 (build 38) ── (the help at narrow openings: the stick's heading bent into the door — world22 assist38; the speed the stick's) ── /fable32 ──
        stick.m.sp = Math.hypot(dvx, dvz); drive(dvx, dvz); stick.vx = dvx; stick.vz = dvz;
      }
      stick.parked = false; stick.walked = Math.hypot(hp.x - hp0.x, hp.z - hp0.z);
    } else if (soft && stick.on && h && !moment) {
      // ── recovered (16–26c) ── the soft stick: the speed eases toward the thumb's (stickCurve × 11 × pace.k), the heading turns toward it
      const L = Math.hypot(stick.dx, stick.dy), pc = T.pace;
      if (!stick.m) stick.m = { sp: 0, hd: NaN };
      const M = stickCurve(L, soft);
      let want = 11 * M * (pc.k || 1);
      if (pc.mul > 0 && !pc.k) { stick.rimT = L / soft.R >= (pc.rim || 0.95) ? (stick.rimT || 0) + dt : 0; stick.sprint = stick.rimT > (pc.after || 0.6); if (stick.sprint) want *= pc.mul; }
      let hd = NaN;
      if (L > soft.dead) { const fx = -Math.cos(st.az), fz = -Math.sin(st.az), rx = -fz, rz = fx, ux = stick.dx / L, uy = -stick.dy / L, vx = fx * uy + rx * ux, vz = fz * uy + rz * ux; hd = Math.atan2(vx, vz); }
      stickMove(stick.m, want, hd, dt, soft, 11);
      const sp = stick.m.sp, vx = Number.isFinite(stick.m.hd) ? Math.sin(stick.m.hd) * sp : 0, vz = Number.isFinite(stick.m.hd) ? Math.cos(stick.m.hd) * sp : 0;
      drive(vx, vz); stick.vx = vx; stick.vz = vz; stick.parked = false; stick.walked = Math.hypot(hp.x - hp0.x, hp.z - hp0.z);
    } else if (stick.on && h && !moment) {
      const L = Math.hypot(stick.dx, stick.dy);
      // ── fable32 ── the arrival stop (the owner 13.10: "הדמות אמורה להיעצר כשמגיעה לנקודת משימה"): the shift says when he is at the next place —
      // he stops there and faces it; the thumb must be lifted and pushed again to walk on
      if (typeof globalThis.__SH_STOP === 'function' && !stick.parked) { try { const q = globalThis.__SH_STOP(h); if (q) { stick.parked = true; drive(0, 0); stick.vx = stick.vz = 0; try { if (o.stages && o.stages.hero && o.stages.hero.setPos) o.stages.hero.setPos(h.x, h.z, Math.atan2(q.x - h.x, q.z - h.z)); } catch (e) { /* */ } } } catch (e) { /* */ } }
      if (stick.parked) { drive(0, 0); stick.vx = stick.vz = 0; stick.walked = Math.hypot(hp.x - hp0.x, hp.z - hp0.z); }
      else if (L > DEAD) {
        const m = Math.min(1, (L - DEAD) / (R - DEAD)); let sp = SPEED * (0.35 + 0.65 * m);
        { const pc = T.pace; if (pc && pc.mul > 0) { stick.rimT = m >= (pc.rim || 0.95) ? (stick.rimT || 0) + dt : 0; stick.sprint = stick.rimT > (pc.after || 0.6); if (stick.sprint) sp *= pc.mul; } else { stick.rimT = 0; stick.sprint = false; } }   // ── recovered (16–26c) ── (a sprint at the rim)
        const fx = -Math.cos(st.az), fz = -Math.sin(st.az), rx = -fz, rz = fx;   // forward on the ground, and its right (── nav19 ── st.az: the camera's bearing AS IT IS)
        const ux = stick.dx / L, uy = -stick.dy / L;
        const vx = (fx * uy + rx * ux) * sp, vz = (fz * uy + rz * ux) * sp;
        drive(vx, vz); stick.vx = vx; stick.vz = vz;
      } else { drive(0, 0); stick.vx = stick.vz = 0; }
      stick.walked = Math.hypot(hp.x - hp0.x, hp.z - hp0.z);
    }
    // the follow camera
    if (OV.on && (moment || film)) overview(false, moment ? 'hold' : 'film');   // ── nav19 ── ── /nav19 ──
    setCam((camMode() === 'follow' || OV.on) && !moment && !film);   // ── nav19 ── (|| OV.on: the overview from the director's camera too) ── /nav19 ──
    if (st.camOn && h && Number.isFinite(h.x) && o.view && typeof o.view.camSet === 'function') {
      const k = 1 - Math.exp(-dt * 5.5), kl = 1 - Math.exp(-dt * 3);
      const lvx = stick.on ? stick.vx || 0 : 0, lvz = stick.on ? stick.vz || 0 : 0;
      cam.lx += (lvx * CAM.lead - cam.lx) * kl; cam.lz += (lvz * CAM.lead - cam.lz) * kl;
      // ── shift29 ── the shift's camera (shift/camera.js sets T.camOver = { el, d, az, ox, oz }): its elevation, distance, bearing and a target offset in place of CAM's
      const CO = T.camOver && typeof T.camOver === 'object' ? T.camOver : null, cEl = CO && Number.isFinite(CO.el) ? CO.el : CAM.el, cD = CO && Number.isFinite(CO.d) ? CO.d : CAM.d, cAz = CO && Number.isFinite(CO.az) ? CO.az : CAM.az;
      // ── /shift29 ──
      const cc = cbCam(dt, h), gx = h.x + (CO ? CO.ox || 0 : cam.lx) + cc.ox, gy = h.y + 1.6 + cc.oy + (CO && Number.isFinite(CO.oy) ? CO.oy : 0) /* ── shift30 ── (the shift's look point lift) ── /shift30 ── */, gz = h.z + (CO ? CO.oz || 0 : cam.lz) + cc.oz;   // ── shift29 ── (+ CO's offset) ── /shift29 ──   // ── craftb19 ── (cc: closer to a craft) ── /craftb19 ──
      if (st.cam0) { st.cam0 = false; cam.x = gx; cam.y = gy; cam.z = gz; cam.u = 0; o.view.camNow(cam.p0); }
      else { const kp = CO && CO.shift30 ? 1 - Math.exp(-dt * 9) : k; cam.x += (gx - cam.x) * kp; cam.y += (gy - cam.y) * kp; cam.z += (gz - cam.z) * kp; }   // ── shift30 ── (the shift's follow camera keeps up with his run: 9/s, its lead set to match) ── /shift30 ──
      zoom.k += (zoom.goal - zoom.k) * (1 - Math.exp(-dt * 4));
      // ── nav19 ── the overview: the target glides to the site's middle (a quarter toward him), the camera rises to 78° and 700 amot
      OV.k += ((OV.on ? 1 : 0) - OV.k) * (1 - Math.exp(-dt * 3.2)); if (!OV.on && OV.k < 0.002) OV.k = 0;
      const oe = OV.k * OV.k * (3 - 2 * OV.k), oX = OV.x + (h.x - OV.x) * 0.25, oZ = OV.z + (h.z - OV.z) * 0.25;
      { const elw = OV.on ? null : (CO ? null : call('camEl')) /* ── shift29 ── */; st.camEl += ((typeof elw === 'number' && Number.isFinite(elw) ? elw : cEl) - st.camEl) * (1 - Math.exp(-dt * (CO && CO.shift30 ? 12 : 3) /* ── flow31 ── (the shift's zoom button eases its own) ── /flow31 ── */)); }   // ── stages21 ──
      let el2 = st.camEl + (OV.el - st.camEl) * oe;
      let d = cD * zoom.k * cc.k + (OV.d - cD * zoom.k * cc.k) * oe;   // ── shift29 ── (cD) ── /shift29 ──   // ── craftb19 ── (* cc.k) ── /craftb19 ──
      // ── cam28 ── the lift: +15° and ×1.3 at a short drag, up to the overview's elevation and distance at a long one (he stays the target)
      liftStep(dt);
      if (LIFT.k > 0.0005) { const u = LIFT.k, sm = 0.15; let ea, dm;
        if (u <= sm) { ea = 0.26 * u / sm; dm = 1 + 0.3 * u / sm; }
        else { const v = (u - sm) / (1 - sm), vv = v * v * (3 - 2 * v); ea = 0.26 + (Math.max(OV.el, el2 + 0.26) - el2 - 0.26) * vv; dm = 1.3 + (OV.d / Math.max(1, d) - 1.3) * vv; }
        el2 = Math.min(1.45, el2 + ea); d *= dm; }
      st.el28 = el2; st.d28 = d;
      // ── /cam28 ──
      const ce = Math.cos(el2), se = Math.sin(el2);
      const bX = cam.x + (oX - cam.x) * oe, bY = cam.y + (h.y - cam.y) * oe, bZ = cam.z + (oZ - cam.z) * oe;
      // ── nav19 ── (note 11) the bearing: the follow camera's, or the side the game asks for (the wall's outer face while he works a
      // high course from its foot — else the wall stands between the camera and him); eased the short way round, ~0.7 s
      { const want = OV.on ? null : call('camSide', d, cEl, cAz) /* ── shift29 ── */,   /* ── stages21 ── (the camera's distance and elevation: a bearing is asked for only if a built mass stands between it and him) ── /stages21 ── */ aw = typeof want === 'number' && Number.isFinite(want) ? want : cAz; let da = aw - st.camAz; da = Math.atan2(Math.sin(da), Math.cos(da)); st.camAz += da * (CO && CO.shift30 && !OV.on ? 1 : 1 - Math.exp(-dt * 3)); }   /* ── shift30 ── (the shift's follow camera eases its own bearing, round the clear side: taken as it is, no second lag) ── /shift30 ── */
      let px = bX + ce * Math.cos(st.camAz) * d, py = bY + se * d, pz = bZ + ce * Math.sin(st.camAz) * d, tx = bX, ty = bY, tz = bZ;
      // ── /nav19 ──
      // ── /nav19 ──
      // ── places24 ── the place's view (CBC.vl), blended by CBC.vk (smooth): the follow camera's pose → the view's
      if (cc.vk > 0.001 && cc.vl) { const V = cc.vl, u = cc.vk * cc.vk * (3 - 2 * cc.vk);
        const zk = zoom.free ? 1 : zoom.k, vp0 = V.t[0] + (V.p[0] - V.t[0]) * zk, vp1 = V.t[1] + (V.p[1] - V.t[1]) * zk, vp2 = V.t[2] + (V.p[2] - V.t[2]) * zk;   // ── fix26 ── (the place's view, nearer or farther by the pinch) ── /fix26 ──
        px += (vp0 - px) * u; py += (vp1 - py) * u; pz += (vp2 - pz) * u; tx += (V.t[0] - tx) * u; ty += (V.t[1] - ty) * u; tz += (V.t[2] - tz) * u; }
      // ── /places24 ──
      // ── cam28 ── the start of Phase B (a new day, every teleport or fade): the first frame shows HIM from behind at 20 amot (I28), 25° down,
      // on a bearing whose line to him no solid and no smoke column crosses; held 1 s, then it glides to the follow camera in 1.6 s
      if (IN28.on) { if (IN28.fresh) { IN28.fresh = false; IN28.t = 0; cam.u = 1; IN28.az = CO && CO.orbit32 ? cAz : introAz(h) /* ── fable32 (build 12) ── (the shift's orbit camera: the intro on the thumb's own bearing — no turn under the thumb after a fade) ── /fable32 ── */; if (o.view.closeCam) o.view.closeCam(true, 'cam28i'); call('camCut'); }   // (camCut: the guard takes this frame as it is — a fade's cut, not a glide)
        IN28.t += dt; const u = Math.max(0, Math.min(1, (IN28.t - 1.0) / 1.6)), e = u * u * (3 - 2 * u);
        const hx = h.x, hy = h.y + I28.y, hz = h.z, c25 = Math.cos(IN28.el) * I28.d, s25 = Math.sin(IN28.el) * I28.d;
        const ix = hx + Math.cos(IN28.az) * c25, iy = hy + s25, iz = hz + Math.sin(IN28.az) * c25;
        px = ix + (px - ix) * e; py = iy + (py - iy) * e; pz = iz + (pz - iz) * e; tx = hx + (tx - hx) * e; ty = hy + (ty - hy) * e; tz = hz + (tz - hz) * e;
        if (u >= 1) { IN28.on = false; if (o.view.closeCam) o.view.closeCam(false, 'cam28i'); call('emit', 'twinIntro', { end: true }); } }
      // ── /cam28 ──
      if (cam.u < 1) {   // (the glide in from the director's frame: never a cut)
        cam.u = Math.min(1, cam.u + dt / 0.9); const e = cam.u < 0.5 ? 2 * cam.u * cam.u : 1 - Math.pow(-2 * cam.u + 2, 2) / 2, P = cam.p0;
        px = P.px + (px - P.px) * e; py = P.py + (py - P.py) * e; pz = P.pz + (pz - P.pz) * e; tx = P.tx + (tx - P.tx) * e; ty = P.ty + (ty - P.ty) * e; tz = P.tz + (tz - P.tz) * e;
      }
      o.view.camSet(px, py, pz, tx, ty, tz);
    }
    // the right thumb's work, ten times a second
    if ((specT -= dt) <= 0 && h) {
      specT = 0.1;
      const s = moment ? null : call('work', h);
      spec = s && typeof s === 'object' ? s : null;
      const awake = !!spec;
      btn.classList.toggle('awake', awake);
      const icon = spec ? spec.icon || '✋' : '✋', label = spec ? spec.label || 'עבודה' : 'עבודה';
      if (ic.textContent !== icon) ic.textContent = icon;
      if (lb.textContent !== label) lb.textContent = label;
    }
    // (fix round) the coach's bubble never over him: at the bottom, or at the top when he stands down there
    if (specT === 0.1 && h) bubStep(h);
    // ── twin18 ── the timing ring: drawn on the button while an act with a moment waits for the thumb
    { const r = spec && !st.hold ? ringNow(ms) : null, on = !!r;
      if (on !== RG.on) { RG.on = on; pad.classList.toggle('ring', on); }
      if (r) { const sc = (CA19 ? 1 + 0.8 * (1 - r.u) : 1.14 + 0.7 * (1 - r.u)).toFixed(3); if (sc !== RG.s) { RG.s = sc; rg.style.transform = `scale(${sc})`; } } }   // ── crafta19 ── (CA19: the ring's own 116 px is the gold) ── /crafta19 ──
    if (spec && spec.craft && RG.src !== spec.job) { RG.src = spec.job; RG.t0 = ms; } else if (!(spec && spec.craft)) RG.src = '';
    // ── /twin18 ──
    // the pips refill (≈ 1 s from empty), one after another, a moment after the last strike
    if (pip.n < PIPS && ms - pip.last > PIP_WAIT) { pip.fill += (dt * 1000) / PIP_MS; if (pip.fill >= 1) { pip.fill = 0; pip.n++; if (pip.n >= PIPS) { btn.classList.remove('empty'); call('emit', 'twinPips', { n: pip.n, full: true }); } } }
    for (let i = 0; i < PIPS; i++) { const f = i < pip.n ? 1 : i === pip.n ? pip.fill : 0; const tr = `scaleX(${f.toFixed(2)})`; if (pipEl[i].style.transform !== tr) pipEl[i].style.transform = tr; }
    // the craftsman's hand
    { const rd = hand.k >= 1; if (rd !== uxHand.rd) { uxHand.rd = rd; uxHandTip(rd); } }   // ── ux24 ── ── /ux24 ──
    handBtn.classList.toggle('ready', hand.k >= 1); const hh = `${Math.round(hand.k * 100)}%`; if (handFill.style.height !== hh) handFill.style.height = hh;
    goalStep();
    hintStep();   // ── cam28 ── ── /cam28 ──
    // the markers: the deal's cards over their work in the world
    const list = call('marks') || [];
    MKP.n = 0;   // ── nav19 ── (the markers placed this frame: their labels never stack) ── /nav19 ──
    for (let i = 0; i < MK.length; i++) {
      const m = MK[i], a = list[i];
      if (!a || moment) { if (m.on) { m.on = false; m.el.style.transform = 'translate(-999px,-999px)'; } continue; }
      if (m.job !== a.job) { m.job = a.job; m.ic.textContent = a.icon || '★'; m.lb.textContent = a.label || ''; }
      const q = o.view && o.view.project ? (o.view.projectRaw || o.view.project).call(o.view, a.x, a.y + 5, a.z) : null;
      if (!q || !q.on) { if (m.on) { m.on = false; m.el.style.transform = 'translate(-999px,-999px)'; } continue; }
      m.on = true;
      const near = !!(spec && spec.job === a.job);
      m.el.classList.toggle('near', near);
      if (m.el.classList.toggle('f26l', a.lvl != null)) m.el.style.setProperty('--f26l', String(a.lvl));   // ── fix26 ── (the kiyor's level: a small blue bar on its chip) ── /fix26 ──
      m.el.classList.toggle('h26p', !!a.pulse);   // ── hero26 ── (the next errand's marker pulses after a work when none is near him) ── /hero26 ──
      // ── nav19 ── (the supervisor, B2: in the overview two markers' labels stacked) a marker whose box (112 × 66) would sit on one placed
      // before it this frame is set beside it — to the side away from it, or up when that runs off the screen
      // ── cam28 ── (shot 5: "הזוכים בפיס" over the altar's wall) a chip whose anchor stands behind a wall from the camera is drawn at half
      // alpha; and never over the HUD — its top at the HUD's bottom + 8 over its column
      { const oc = fn('occl') ? call('occl', a.x, a.y + 5, a.z) === true : false; if (oc !== !!m.oc) { m.oc = oc; m.el.classList.toggle('c28o', oc); } }
      let mx = q.x - 40, my = Math.max(96, uxHudBelow(q.x) + 8, q.y - 70);
      // ── /cam28 ──
      for (let g = 0; g < 3; g++) { let hit = -1; for (let j = 0; j < MKP.n; j++) if (Math.abs(MKP.x[j] - mx) < 112 && Math.abs(MKP.y[j] - my) < 66) { hit = j; break; } if (hit < 0) break;
        const dir = mx >= MKP.x[hit] ? 1 : -1, nx = MKP.x[hit] + dir * 114; if (nx > 8 && nx < innerWidth - 104) mx = nx; else my = MKP.y[hit] - 66; }
      my = Math.max(my, 96, uxHudBelow(mx + 40) + 8);   // ── cam28 ── (a stacked chip pushed up stops under the HUD too) ── /cam28 ──
      MKP.x[MKP.n] = mx; MKP.y[MKP.n] = my; MKP.n++;
      m.el.style.transform = `translate(${Math.round(mx)}px,${Math.round(my)}px)`;   // (never under the top bar's pill)
      // ── /nav19 ──
    }
  };
  Object.defineProperty(T, 'walking', { get: () => stick.on && Math.hypot(stick.dx, stick.dy) > DEAD });
  Object.defineProperty(T, 'cam', { get: () => st.camOn });
  Object.defineProperty(T, 'mode', { get: () => camMode() });
  Object.defineProperty(T, 'hold', { get: () => st.hold });
  T.btnPos = () => { const r = btn.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top - 6, on: st.on }; };
  let bubEl = null, bubTop = false, bubFlipT = 0;
  function bubStep(h) {
    if (!bubEl || !bubEl.isConnected) bubEl = root().querySelector('.gm-bub');
    const V = o.view, pr = V && (V.projectRaw || V.project); if (!bubEl || !pr) return;
    if (bubEl.classList.contains('gm-hidden') || !bubEl.textContent) return;
    const f = pr.call(V, h.x, h.y, h.z), fx = f.x, fy = f.y, fon = f.on, hd = pr.call(V, h.x, h.y + 3.8, h.z);
    if (!fon || !hd.on) return;
    const r = bubEl.getBoundingClientRect(), top = Math.min(fy, hd.y) - 6, bot = Math.max(fy, hd.y) + 6;
    let over = r.width > 0 && r.left < fx + 40 && r.right > fx - 40 && r.top < bot && r.bottom > top;
    // ── fable20 ── nor over the piece he works (the general work craft's workpiece: its point, 70 px round) ── /fable20 ──
    if (!over && r.width > 0) { const Hh = globalThis.__HANDS; const a = Hh && Hh.twin && typeof Hh.atW === 'function' ? Hh.atW() : null; if (a && Number.isFinite(a.x)) { const w = pr.call(V, a.x, a.y - 1.5, a.z); if (w.on && r.left < w.x + 70 && r.right > w.x - 70 && r.top < w.y + 90 && r.bottom > w.y - 60) over = true; } }
    if (over && performance.now() - bubFlipT > 700) { bubFlipT = performance.now(); bubTop = !bubTop; root().classList.toggle('tw-bub-top', bubTop); call('emit', 'twinBub', { top: bubTop }); }   // ── fable20 ── (≥ 700 ms between flips: both places over something is not a flicker) ── /fable20 ──
  }
  /** the next work off the screen: an arrow at the edge toward it (the follow camera is close — the rocks lie 100 amot apart) */
  let goalOn = false, meOn = false;
  let uxGoal = null;   // ── ux24 ── ── /ux24 ──
  const onMk = (g) => { const L = call('marks'); if (!L) return false; for (let i = 0; i < L.length; i++) if (Math.abs(L[i].x - g.x) < 0.5 && Math.abs(L[i].z - g.z) < 0.5) return true; return false; };   // ── nav19 ── (the compass over a marker: above its icon) ── /nav19 ──
  function goalStep() {
    const g = uxGoal || call('goal'), V = o.view, pr = V && (V.projectRaw || V.project);   // ── ux24 ── (uxGoal: a test's goal, test/ux24-touch.cjs) ── /ux24 ──
    // ── nav19 ── in the overview: "אני" over him, and his work's compass ON its place (the arrow down at it), a tap brings him there
    const ovw = (OV.k > 0.5 || LIFT.k > 0.5) && pr;   // ── cam28 ── (lifted high: "אני" over him too) ── /cam28 ──
    if (ovw) { const hh = hp, qm = pr.call(V, hh.x, hh.y + 2.5, hh.z); if (qm.on) { meOn = true; me.style.transform = `translate(${Math.round(qm.x - 18)}px,${Math.round(qm.y - 34)}px)`; } else if (meOn) { meOn = false; me.style.transform = 'translate(-999px,-999px)'; } }
    else if (meOn) { meOn = false; me.style.transform = 'translate(-999px,-999px)'; }
    if (ovw && g && !st.hold) { const qg = pr.call(V, g.x, g.y + 2, g.z); if (qg.on && qg.x > 30 && qg.x < innerWidth - 30 && qg.y > 60 && qg.y < innerHeight - 30) { goalOn = true; if (goalIc.textContent !== (g.icon || '★')) goalIc.textContent = g.icon || '★'; goal.style.transform = `translate(${Math.round(qg.x)}px,${Math.round(Math.max(40, uxHudBelow(qg.x) + 27 /* ── cam28 ── (never under the HUD) ── /cam28 ── */, qg.y - (onMk(g) ? 118 : 34)))}px)`; goalAr.style.transform = 'rotate(1.571rad) translateX(26px)'; return; } }
    // ── /nav19 ──
    if (!g || !pr || st.hold || spec) { if (goalOn) { goalOn = false; goal.style.transform = 'translate(-999px,-999px)'; } return; }
    const q = pr.call(V, g.x, g.y + 2, g.z), Wd = innerWidth, Hd = innerHeight, cx = Wd / 2, cy = Hd / 2;
    let x = q.x, y = q.y; if (!q.on) { x = cx - (x - cx) * 4; y = cy - (y - cy) * 4; }   // (behind the camera: the other way)
    const mx = 70, myT = 110, myB = 70;
    if (q.on && x > mx && x < Wd - mx && y > myT && y < Hd - myB) { if (goalOn) { goalOn = false; goal.style.transform = 'translate(-999px,-999px)'; } return; }
    const dx = x - cx, dy = y - cy, k = Math.min(Math.abs((Wd / 2 - mx) / (dx || 1e-6)), Math.abs(((dy < 0 ? cy - myT : Hd - myB - cy)) / (dy || 1e-6)));
    let ex = cx + dx * k, ey = cy + dy * k;
    // (fix round: never inside the thumbs' zones — at the top and the side edges above them)
    const zl = Wd * 0.45, zt = Hd * 0.35 - 28, rb = Wd - 236, rt = Hd - 214 - 28;
    if (ex < zl && ey > zt) { ex = mx; ey = zt; }   // (the left edge, just above the stick's zone — it still points the way)
    if (ex > rb && ey > rt) { ex = Wd - mx; ey = rt; }   // (the right edge, above the buttons)
    // ── ux24 ── (docs/UX24.md #4) never under the HUD: at the left edge the arrow sat on the score's capsule (shot l-057s, l-072s)
    // — it goes down below whatever HUD piece covers its column (the rects are read twice a second)
    { const hb = uxHudBelow(ex); if (ey - 23 < hb + 4) ey = hb + 27; }
    // ── /ux24 ──
    goalOn = true;
    if (goalIc.textContent !== (g.icon || '★')) goalIc.textContent = g.icon || '★';
    goal.style.transform = `translate(${Math.round(ex)}px,${Math.round(ey)}px)`;
    goalAr.style.transform = `rotate(${Math.atan2(dy, dx).toFixed(2)}rad) translateX(26px)`;
  }
  // ── ux24 ── the lowest bottom of the HUD's top pieces over a column x (the bar, the score's capsule, the pill), cached 0.5 s
  let uxHudT = -1e9, uxHud = [];
  function uxHudBelow(x) {
    const now = performance.now();
    if (now - uxHudT > 500) {
      uxHudT = now; uxHud = [];
      for (const e of document.querySelectorAll('.gm .gm-top, .gm .gm-top > *, .gm .gm-sc, .gm .gm-goal .gm-pill, .gm .gm-dock nav, .gm .dy-hud' /* ── cam28 ── (Phase B's HUD) ── /cam28 ── */)) { const r = e.getBoundingClientRect(); if (r.width > 2 && r.height > 2 && r.top < innerHeight * 0.4) uxHud.push([r.left - 26, r.right + 26, r.bottom]); }
    }
    let b = 0; for (const [l, r, bt] of uxHud) if (x >= l && x <= r && bt > b) b = bt;
    return b;
  }
  // ── /ux24 ──
  /* (debug ring: the frames the stick was held while he stood still, with the game's state then) */
  const dbg = { x: 0, z: 0, list: [] };
  function dbgPush(ms, kind) { const w = call('why'); dbg.list.push(`${Math.round(ms)}:${kind}:${w || ''}`); if (dbg.list.length > 40) dbg.list.shift(); }
  T.pips = () => pip.n;
  T.spec = () => spec;
  T.held19 = () => bt.id != null;   // ── recovered (build 19) ── (the work button held)
  T.pinch = () => !!zoom.pin;   // ── fable32 (build 5) ── ── /fable32 ──
  T.noStick = (on) => { zone.classList.toggle('tw-nostick', !!on); if (on && stick.on) stickEnd(); return !!on; };   // ── fable32 (build 4) ── ── /fable32 ──
  T.stick = () => ({ on: stick.on, dx: Math.round(stick.dx), dy: Math.round(stick.dy), walked: stick.walked, sprint: !!stick.sprint, sp: stick.m ? Math.round(stick.m.sp * 100) / 100 : 0, coast: !!stick.coast, soft: !!(T.pace && T.pace.soft), R: T.pace && T.pace.p24 ? T.pace.p24.R : T.pace && T.pace.soft ? T.pace.soft.R : R, parkedAt: stick.parkedAt || 0, M: (stick.on && stick.M) || 0 });   // ── recovered (16–26c) ── (+ the paced stick's state)
  T.destroy = () => { setOn(false); try { window.removeEventListener('resize', onTurn); window.removeEventListener('orientationchange', onTurn); } catch (e) { /* */ } for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) window.removeEventListener(t, onPtr, true); for (const e of [zone, pad, aim, flash, goal, me, ...MK.map((m) => m.el)]) { try { e.remove(); } catch (err) { /* */ } } };
  // tests and bots read what a player sees
  globalThis.__TWIN = { graded: (q) => T.graded(q) /* ── crafta19 ── (CRAFTB19's acts: the button answers the impact) ── /crafta19 ── */, on: () => st.on, force: (v) => { st.force = v; st.chk = 0; }, pips: () => pip.n, spec: () => (spec ? { icon: spec.icon, label: spec.label, job: spec.job || null, strike: !!spec.strike } : null), stick: T.stick, t20: () => T.t20() /* ── twin20 ── */, fb: () => ({ ...fb }), cam: () => ({ on: st.camOn, mode: camMode(), zoom: zoom.k, goal: zoom.goal, free: zoom.free, pin: zoom.pin, ids: zoom.ids.size /* ── fix26 ── */ }), hand: () => hand.k, marks: () => MK.filter((m) => m.on).map((m) => m.job), goal: () => goalOn, over: (v) => { if (v !== undefined) overview(v, 'test'); return { on: OV.on, k: Math.round(OV.k * 100) / 100, n: OV.n }; }, az: () => st.az, goTo: () => call('goTo'), dbg: () => dbg.list.slice(), ring: () => { const r = ringNow(performance.now()); return r ? { on: true, u: r.u, d: r.d, cyc: spec && spec.strike ? null : RG.cyc } : { on: false }; }, probe: () => { const h = hero(); let w = null, err = null; try { w = h ? o.work(h) : 'no hero'; } catch (e) { err = e && e.message; } return { specT, prev: st.prevMs, h: h && [Math.round(h.x), Math.round(h.z)], w: w && typeof w === 'object' ? w.job : w, err, moment: !!call('moment') }; }, charge: () => { hand.k = 1; } };
  globalThis.__TWIN.hudB = (x) => uxHudBelow(x); globalThis.__TWIN.lift = () => T.lift(); globalThis.__TWIN.intro = () => T.introState(); globalThis.__TWIN.liftReset = () => T.liftReset();   // ── cam28 ── ── /cam28 ──
  globalThis.__TWIN.uxGoal = (g) => { uxGoal = g && Number.isFinite(g.x) ? { x: g.x, y: g.y || 0, z: g.z, icon: g.icon || '⛏' } : null; };   // ── ux24 ── (a goal the test sets: the arrow's clamp is proved at every edge) ── /ux24 ──
  return T;
}
