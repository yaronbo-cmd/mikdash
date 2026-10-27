/* ── shift29 ── stations.js — the shift's five stations and their short acts (WAVE29 SHIFT29B; docs/WAVE29-BRIEF.md "the contract";
 * PLAY27 §א: one thumb verb per act; DAM25: the blood only in its palette, at its places).
 *   STATIONS[id] = { id, he, label, verb, icon, at:{x,y,z} (the thing), stand:{x,z} (where the kohen stands) }
 *   createStations({ world, kit, twin, ctx, root, view, onTap }) → { act(id, P) → Promise<{quality, gold}>, cue(id, on), place(), clear(),
 *                                                                  near(pos, r), wrong(id, needId), busy }
 * Every act: ≤ 3 touches, ≤ 4 s, the kohen (the player, in his own look: hero26) acts within one frame, a word born on the thing; taps
 * alone finish it (a hold or a drag is only the gold way). The acts are short world acts, not the full works:
 *   kiyor  (hold)    his hands into the laver's water; let go at the mark = gold, a tap = good            (יומא ג; זבחים יט, ב)
 *   seals  (tapRight) three seals over the booth — עגל · זכר · גדי — tap the pilgrim's; a wrong one shakes      (שקלים ה, ג–ד · טיוטה ⚑)
 *   rings  (tapBeat)  a ring closes on him: tap on the beat; the linen screen, one deep tone, 0.6 s; the vessel in his hand (DAM25 §2.4)
 *   altar  (drag)    from the button toward the corner = gold, a tap = good; the Γ below the line on the real altar (blood.js worldMark)
 *   duchan (tapBeat)  the ken handed over at the דוכן, on the beat (yachid.js in short)
 * המחשה: the stations' places in the court (the real anchors: the laver, the north rings, the altar's corner, the דוכן; the seals' booth
 * is the shift's ⚑). Never a Divine Name; no red but BLOOD's, never on a figure or the floor. ── /shift29 ── */
import { man, flame } from '../works/figures.js';
import { liquid, worldMark, BLOOD } from '../works/blood.js';
import { TAMID_RING, ALTAR_CORNERS, LEVEL, MAARACHOT } from '../../places.js';
import { claim } from '../../light28.js';
import { addDrawer, layerOf, L, K29, SHARED, chipsTime, edgeChip, EDGE30_CSS, placeChip } from './draw.js';   // ── recovered (build 17) ── (+ placeChip: the mini chips)
// ── route31 ── the true routes' stations and their acts (route31.js) ── /route31 ──
import { STATIONS31, SLICE31, CLIMB31, PARTS31, PYRE31, KEN_MARK31, OLAH_MARK31, actPts31 } from './route31.js';
import { PLACE31 } from './layout31.js';   // ── fable32 (build 3) ── the laver at the real laver ── /fable32 ──
import { PACE } from './walk.js';   // ── recovered (16–26c) ── (PACE.laver: his walk up to the laver)
import { gradeOf, GRADE } from '../../game/twin.js';
import { pad40On } from './touch40.js';   // ── fable32 (build 41) ── (the work pad's switch) ── /fable32 ──   // ── recovered (build 17) ── (the timing acts' grade windows, shared with the twin)

export const STATIONS = Object.freeze({
  // ── shift30 ── the shift's own stage: a compact ring round the altar's east side (WAVE30 (3) — fidelity second, the owner's words):
  // the laver's act at a shift basin 10 amot south-east of the altar (BASIN30; the real laver's corridor is the 123-amot problem ⚑), the seals'
  // booth 8.5 amot from the gate's line, the דוכן's spot 9 amot from it, the rings and the altar's corner on their real places ── /shift30 ──
  kiyor: { id: 'kiyor', he: 'הכיור', label: 'קידוש ידיים', verb31: 'קדשו — החזיקו' /* ── route31 ── */, verb: 'hold', icon: '💧', at: PLACE31.kiyor.at, stand: PLACE31.kiyor.stand, act: { x: PLACE31.kiyor.at.x + 3, z: PLACE31.kiyor.at.z } /* ── fable32 (build 3) ── the real laver: he stands at the steps' foot and the act walks him up to it (anchors.js laver.stand) ── /fable32 ── */ },
  seals: { id: 'seals', he: 'החותמות', label: 'החותם הנכון', verb: 'tapRight', icon: '🏷️', at: { x: -19.5, y: LEVEL.azara, z: 12.6 }, stand: { x: -19.5, z: 10.2 } },
  rings: { id: 'rings', he: 'הטבעות', label: 'השחיטה', verb: 'tapBeat', icon: '◎', at: { x: TAMID_RING.afternoon[0], y: LEVEL.azara, z: TAMID_RING.afternoon[1] }, stand: { x: TAMID_RING.afternoon[0] + 0.4, z: TAMID_RING.afternoon[1] + 3.2 } },
  altar: { id: 'altar', he: 'המזבח', label: 'הזריקה לפינה', verb: 'drag', icon: '🔥', at: { x: ALTAR_CORNERS.NE[0], y: LEVEL.azara, z: ALTAR_CORNERS.NE[1] }, stand: { x: ALTAR_CORNERS.NE[0] + 2.6, z: ALTAR_CORNERS.NE[1] - 2.2 } },
  duchan: { id: 'duchan', he: 'הדוכן', label: 'הקן', verb: 'tapBeat', icon: '🕊', at: { x: -8.5, y: 14.5, z: -6 }, stand: { x: -13.2, z: -6 } },
  // ── fable32 (build 6) ── the day's wood: לשכת העץ at the court's south (מידות ה, ד — one of the six chambers; ⚑ המחשה: its exact spot) — 13 amot south of the ramp's foot
  wood: { id: 'wood', he: 'לשכת העץ', label: 'בקעו — בזמן', verb31: 'בקעו — בזמן', verb: 'swing', n: 3 /* ── recovered (build 17) ── the timing act (SWING17) ── */, icon: '🪵', at: { x: -38, y: LEVEL.azara, z: 58 }, stand: { x: -38, z: 55 } },
  // ── fable32 (build 7) ── the day's stores (99 Nights' chests: a few taps, the goods pop out) and the bakers' bowl (the crock pot: three things, 10 s) — ⚑ המחשה: the spots
  oil: { id: 'oil', he: 'לשכת השמנים', label: 'פתחו — בזמן', verb31: 'פתחו — בזמן', verb: 'swing' /* ── recovered (build 17) ── */, n: 3, icon: '🏺', at: { x: -54, y: LEVEL.azara, z: 58 }, stand: { x: -54, z: 55 } },   // (מידות ב, ה: "ששם היו נותנין יין ושמן"; ⚑ its real place is עזרת הנשים's SW corner)
  salt: { id: 'salt', he: 'לשכת המלח', label: 'קחו מלח — בזמן', verb31: 'קחו מלח — בזמן', verb: 'swing' /* ── recovered (build 17) ── */, n: 3, icon: '🧂', at: { x: -20, y: LEVEL.azara, z: -62 }, stand: { x: -20, z: -59 } },   // (מידות ה, ג: the court's north)
  bake: { id: 'bake', he: 'לשכת האופים', label: 'לושו — בזמן', verb31: 'לושו — בזמן', verb: 'swing' /* ── recovered (build 17) ── */, n: 3, icon: '🍞', at: { x: -24, y: LEVEL.azara, z: 58 }, stand: { x: -24, z: 55 } },   // (בית גרמו — לשכת עושי לחם הפנים is in בית המוקד, מידות א, ו; ⚑ המחשה: here, by the wood)
  song: { id: 'song', he: 'הדוכן', label: 'שירו — הקישו בקצב', verb31: 'שירו — הקישו בקצב', verb: 'tapBeat', icon: '🎶', at: { x: -8.5, y: 14.5, z: -6 }, stand: { x: -13.2, z: -6 } },   // ── fable32 (build 10) ── the Levites' song at the dawn tamid (תמיד ז, ג–ד; ערכין ב, ג–ו) ── /fable32 ──
  pen: { id: 'pen', he: 'דיר הטלאים', label: 'פתחו את הדיר — בזמן', verb31: 'פתחו את הדיר — בזמן', verb: 'swing' /* ── recovered (build 17) ── */, n: 3, icon: '🐑', at: { x: -17, y: LEVEL.azara, z: -53 }, stand: { x: -17, z: -46.5 } },   // ── fable32 (build 9) ── (the court's north-east, east of the tables) ── (⚑ המחשה: the real לשכת הטלאים is in בית המוקד, מידות א, ו — 170 amot west; ערכין ב, ה: six inspected lambs) ── /fable32 ──
  // ── recovered (16–26c) ── the pyre: the logs laid on the great pyre at the altar's top, a tap (the day's)
  pyre: { id: 'pyre', he: 'המערכה', label: 'הניחו על המערכה — הקישו', verb31: 'הניחו — הקישו', verb: 'tap', icon: '🔥', at: { x: MAARACHOT.great.x, y: 25, z: MAARACHOT.great.z }, stand: { x: -34, z: 5 } },
  ...STATIONS31,   // ── route31 ── (the true routes' ten: samicha · shechita · zerika · nituach · kevesh · hagasha · kemitza · haktara · melika · mitzui) ── /route31 ──
});
/** ── route31 ── the stations of the routes now played (the old three — rings, seals, duchan, altar — stay for the old tests, never on the court) ── /route31 ── */
export const LIVE31 = Object.freeze(['kiyor', 'wood', 'oil', 'salt', 'bake', 'pen', 'song' /* ── fable32 (build 6–10) ── */, 'pyre' /* ── recovered (16–26c) ── */, ...Object.keys(STATIONS31)]);
/** ── shift30 ── the shift's basin (a kit prop: a bronze bowl on a stand, two spigots) — the laver's act in the shift ── /shift30 ── */
export const BASIN30 = { x: -16, z: 18.5, r: 1.1, h: 2.6, off: true /* ── fable32 (build 3) ── the laver's act is at the real laver: the prop is not drawn ── /fable32 ── */ };
/** ── shift30 ── the gate chip's anchor (set by gate({ at })) and its look ── /shift30 ── */
const GATE30 = { st: { at: { x: -15, y: 16, z: 3 } }, css: `.s29-st{z-index:7}.s29-st.cue{z-index:8}.s30-gate{z-index:4}.s30-gate small{font:800 12px/1 "Heebo",system-ui,sans-serif;padding:2px 5px;border-radius:8px;background:#FFD66E;color:#2A1804}.s30-gate small:empty{display:none}.s30-gate.lit{border-color:#FFD66E}` };
/** the seal each offering asks (שקלים ה, ג: עגל · זכר · גדי · חוטא — the libations' measure) ⚑ a draft: the mincha → זכר */
export const SEAL_OF = Object.freeze({ mincha: 'זכר', olah: 'גדי', ken: 'זכר' });
export const SEALS3 = ['עגל', 'זכר', 'גדי'];
/** ── recovered (build 17) ── the acts' own camera views (SHARED.cam17, camera.js): the day's climb up the ramp (behind and above him,
 *  looking `ahead` amot up the way) and the timing act (beside him at `off` rad from behind, on the side toward the court's open
 *  middle `open`). The name is the recovery's. */
const CAM17 = Object.freeze({ climb: Object.freeze({ az: 0.2, el: 0.33, d: 14, ahead: 5 }), swing: Object.freeze({ off: 1.1, el: 0.5, d: 10, open: Object.freeze({ x: -20, z: 0 }) }) });
/** ── recovered (build 17) ── the timing act ("בקעו — בזמן"): a ring closes on the thing over C s; a tap when it meets the target ring
 *  (twin.js gradeOf: GRADE.PERF / GOOD, ×k) = gold / good, else a miss — the axe sticks (stuck s; graceStuck under the day's grace) and
 *  a tap within `buffer` of its freeing is kept; after a hit a pause, then the next ring; idle s without a tap ends it. The wood's chop:
 *  the clip from chopAt, the blow lands at chopImpact (×1/chopSpeed s later); readyAt: the raised axe's pose; ring0: the ring's start
 *  size; thing: the thing's distance (amot ×K29) before him; sfx: each act's hit sound. The name is the report's ("SWING17.sfx"). */
export const SWING17 = Object.freeze({ C: 0.8, pause: 0.2, stuck: 0.5, graceStuck: 0.15, buffer: 0.15, idle: 5, endTail: 0.25, hitStop: 0.06, chopAt: 0.62, chopImpact: 0.92, chopSpeed: 1.7, readyAt: 0.5, ring0: 3.2, thing: Object.freeze({ wood: 0.95, oil: 0.8, salt: 0.8, bake: 0.8, pen: 1 }), sfx: Object.freeze({ wood: 'split', oil: 'pour', salt: 'pop', bake: 'thud', pen: 'creak' }) });
/** the act's timing (s) */
export const ACT = Object.freeze({ max: 4, holdMark: 1.0, holdWin: 0.22, tapMin: 0.25, beat: 1.1, beatWin: 0.18, beatLead: 0.25, grave: 0.6, tail: 0.55, tailDay: 0.3 /* ── recovered (16–26c) ── (the day's acts: a shorter tail) ── */ });

const CSS = `.s29-st{position:absolute;left:0;top:0;min-width:58px;height:48px;padding:3px 8px;box-sizing:border-box;display:flex;align-items:center;gap:4px;border-radius:14px;background:rgba(40,28,12,.72);color:#FFF3D2;font:700 14px/1.1 "Heebo",system-ui,sans-serif;direction:rtl;white-space:nowrap;border:2px solid rgba(255,236,190,.55);pointer-events:auto;touch-action:manipulation;cursor:pointer;z-index:5;transform:translate(-999px,-999px);-webkit-user-select:none;user-select:none}
.s29-st i{font:22px/1 "Segoe UI Emoji","Noto Color Emoji",sans-serif;font-style:normal}
.s29-st.cue{background:#C8923A;color:#2A1804;border-color:#FFF1C8;animation:s29cue .7s ease-in-out infinite alternate;transform:scale(1.12)}
.s29-st.cue::before{content:"▼";position:absolute;left:50%;top:-26px;margin-left:-9px;font:900 18px/1 "Heebo",system-ui,sans-serif;color:#FFD66E;text-shadow:0 2px 4px rgba(0,0,0,.5);animation:s29bob .6s ease-in-out infinite alternate}
@keyframes s29bob{0%{transform:translateY(0)}100%{transform:translateY(-7px)}}
.s29-st.on{background:#FFD66E;color:#2A1804}
.s29-st.s29-hide{opacity:0;pointer-events:none;transition:opacity .2s}
@keyframes s29cue{0%{box-shadow:0 0 0 2px rgba(255,214,110,.4)}100%{box-shadow:0 0 0 9px rgba(255,214,110,.75)}}
.s29-no{position:absolute;left:0;top:0;z-index:8;pointer-events:none;padding:6px 12px;border-radius:12px;background:rgba(40,28,12,.86);color:#FFF6DA;font:800 17px/1.2 "Heebo",system-ui,sans-serif;direction:rtl;white-space:nowrap}
.s29-tip{position:absolute;left:0;top:0;z-index:8;pointer-events:none;padding:4px 10px;border-radius:10px;background:rgba(255,248,232,.92);color:#3B2A12;font:800 15px/1.2 "Heebo",system-ui,sans-serif;direction:rtl;white-space:nowrap;border:2px solid #E2B65A}
.s29-beat{position:absolute;left:0;top:0;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;z-index:7;pointer-events:none;border:4px solid #FFD66E;box-shadow:0 0 0 2px rgba(40,28,12,.45)}
.s29-beat.mark{border:3px dashed rgba(255,255,255,.9);box-shadow:none}
.s29-gauge{position:absolute;left:0;top:0;width:16px;height:86px;z-index:7;pointer-events:none;border-radius:8px;background:rgba(40,28,12,.55);border:2px solid rgba(255,236,190,.8);overflow:hidden}
.s29-gauge s{position:absolute;left:0;right:0;bottom:0;height:0;background:linear-gradient(#9FD3F0,#3C8DC4);text-decoration:none}
.s29-gauge u{position:absolute;left:0;right:0;height:8px;background:#FFD66E;box-shadow:0 0 0 1px #3B2A12;bottom:calc(100% / 1.6 - 4px);text-decoration:none}
.s29-seal{position:absolute;left:0;top:0;width:64px;height:52px;margin:-26px 0 0 -32px;border-radius:14px;z-index:8;display:flex;align-items:center;justify-content:center;background:#F4ECD8;color:#3B2A12;border:3px solid #8A6A45;font:800 19px/1 "Heebo",system-ui,sans-serif;direction:rtl;pointer-events:auto;touch-action:manipulation;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.35)}
.s29-seal.want{border-color:#E2B65A}
.s29-seal.shake{animation:s29sh .32s}
.s29-seal.ok{background:#FFD66E}
.s29-arrow{position:absolute;left:0;top:0;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;z-index:7;pointer-events:none;border:3px solid #FFD66E;background:rgba(255,214,110,.25);animation:s29cue .5s ease-in-out infinite alternate}
.s31-zone{position:absolute;left:0;top:0;transform:translate(-999px,-999px);width:170px;height:120px;margin:-60px 0 0 -85px;z-index:9;border-radius:22px;border:3px dashed rgba(255,236,190,.95);background:rgba(255,214,110,.14);pointer-events:auto;touch-action:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font:800 16px/1.1 "Heebo",system-ui,sans-serif;color:#FFF6DA;text-shadow:0 1px 3px rgba(0,0,0,.7);direction:rtl;-webkit-user-select:none;user-select:none}
.s31-zone.slice::after{content:"";position:absolute;left:18%;right:18%;top:50%;height:4px;border-radius:2px;background:linear-gradient(90deg,rgba(255,255,255,0),#FFF,rgba(255,255,255,0));animation:s31sw .9s ease-in-out infinite}
@keyframes s31sw{0%{transform:translateX(30px) scaleX(.3);opacity:0}50%{opacity:1}100%{transform:translateX(-30px) scaleX(1);opacity:0}}
.s31-cut{position:absolute;left:0;top:0;height:5px;border-radius:3px;background:#FFF;box-shadow:0 0 8px #FFD66E;z-index:10;pointer-events:none;transform-origin:0 50%;transition:opacity .35s}
.s31-pips{position:absolute;left:0;top:0;z-index:8;pointer-events:none;display:flex;gap:6px;direction:ltr}
.s17-zone{position:absolute;left:0;top:0;width:104px;height:104px;margin:-52px 0 0 -52px;z-index:9;border-radius:50%;pointer-events:auto;touch-action:none;transform:translate(-999px,-999px);-webkit-tap-highlight-color:transparent}
.s17-tg{position:absolute;left:0;top:0;width:64px;height:64px;margin:-32px 0 0 -32px;z-index:8;border-radius:50%;pointer-events:none;border:4px solid rgba(255,214,110,.95);box-shadow:0 0 0 2px rgba(40,28,12,.5),inset 0 0 10px rgba(255,214,110,.35);transform:translate(-999px,-999px)}
body.s41-zone .tw-btn{opacity:0!important;pointer-events:none!important}
.s17-tg.hot{border-color:#FFFFFF;box-shadow:0 0 0 2px rgba(40,28,12,.5),0 0 18px 6px rgba(255,214,110,.9)}
.s17-cl{position:absolute;left:0;top:0;width:64px;height:64px;margin:-32px 0 0 -32px;z-index:8;border-radius:50%;pointer-events:none;border:3px solid #FFF6DA;box-shadow:0 0 0 1px rgba(40,28,12,.55);transform:translate(-999px,-999px)}
.s17-cl.good{border-color:#FFD66E}.s17-cl.off{opacity:0}
.s17-wd{position:absolute;left:0;top:0;z-index:9;pointer-events:none;font:900 20px/1 "Heebo",system-ui,sans-serif;color:#FFF6DA;text-shadow:0 0 2px #3B2A12,0 2px 6px rgba(0,0,0,.7);white-space:nowrap;animation:s17wd .6s ease-out forwards}
.s17-wd.gold{color:#FFD66E;font-size:24px}.s17-wd.miss{color:#FFC690}
@keyframes s17wd{0%{opacity:0;margin-top:6px}20%{opacity:1}100%{opacity:0;margin-top:-34px}}
.s31-pips i{width:16px;height:16px;border-radius:50%;border:2px solid #FFF1C8;background:rgba(40,28,12,.55)}
.s31-pips i.on{background:#FFD66E}
.s29-fl.s31-pts{font:900 24px/1 "Heebo",system-ui,sans-serif;color:#FFF6DA;text-shadow:0 0 2px #3B2A12,0 2px 6px rgba(0,0,0,.6);z-index:5}.s29-fl.s31-pts.gold{color:#FFD66E}
.s29-arrow.down{border-radius:12px;width:40px;height:70px;margin:-35px 0 0 -20px}
.s29-arrow.down::after{content:"▼";position:absolute;left:0;right:0;bottom:2px;text-align:center;color:#FFF6DA;font:18px/1 sans-serif}`;

// ── recovered (16–26c) ── the ramp's climb as a path: from the ramp's foot up its middle line to the top (z 12, 25 amot high) — in the
// day (no pilgrim: a.P null) from where he stood, and on along the altar's top to CLIMB31.top; { pts, L (each leg), T (all) }
function climbPath(a) {
  const f = STATIONS31.kevesh.at, top = { x: f.x, z: 12, y: 25 }, foot = { x: f.x, z: f.z, y: 16 };
  const pts = a && !a.P ? [Number.isFinite(a.hx) && Math.hypot(a.hx - f.x, a.hz - f.z) > 0.3 ? { x: a.hx, z: a.hz, y: 16 } : null, foot, top, { x: CLIMB31.top.x, z: CLIMB31.top.z, y: 25 }].filter(Boolean) : [foot, top];
  const Ls = []; let T = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z); Ls.push(d); T += d; }
  return { pts, L: Ls, T };
}
/** ── recovered (16–26c) ── the place at u (0…1) of the act's climb path (a.cp) → { x, z, y, yaw } (at the day's end: facing the pyre) */
function climbAt(u, a) {
  const cp = a && a.cp ? a.cp : climbPath(a), at = Math.max(0, Math.min(1, u)) * cp.T;
  let run = 0;
  for (let i = 0; i < cp.L.length; i++) {
    const d = cp.L[i], p = cp.pts[i], q = cp.pts[i + 1];
    if (at <= run + d || i === cp.L.length - 1) {
      const k = d > 0 ? Math.max(0, Math.min(1, (at - run) / d)) : 1, yaw = a && !a.P && i === cp.L.length - 1 && k >= 1 ? Math.atan2(PYRE31.x - q.x, PYRE31.z - q.z) : Math.atan2(q.x - p.x, q.z - p.z);
      return { x: p.x + (q.x - p.x) * k, z: p.z + (q.z - p.z) * k, y: p.y + (q.y - p.y) * k, yaw };
    }
    run += d;
  }
  const e = cp.pts[cp.pts.length - 1];
  return { x: e.x, z: e.z, y: e.y, yaw: Math.PI };
}
/** ── recovered (16–26c) ── the climb's rate (of the path a second): the ramp itself still takes CLIMB31.s */
function climbRate(a) {
  const f = STATIONS31.kevesh.at, ramp = Math.abs(12 - f.z), cp = a && a.cp ? a.cp : climbPath(a);
  return ramp / CLIMB31.s / cp.T;
}

export function createStations(o = {}) {
  const S = o.world || null, ctx = o.ctx || {}, doc = typeof document !== 'undefined' ? document : null;
  const twin = o.twin || ctx.twin || null;
  const view = o.view || ctx.view || (globalThis.__T && globalThis.__T.view) || null;
  const root = layerOf(o.root || ctx.root || (doc && doc.body)) || null;   // (the shift's own layer: over the thumbs' zones, under the HUD)
  const gy = (x, z) => { try { const g = S && S.groundAt ? S.groundAt(x, z) : NaN; return Number.isFinite(g) ? g : 16; } catch (e) { return 16; } };
  const hp = { x: 0, y: 0, z: 0, yaw: 0 };
  const hero = () => { try { if (S && S.heroXYZ) S.heroXYZ(hp); } catch (e) { /* */ } return hp; };
  const sfx = (n, o2) => { try { const s = o.sfx || ctx.sfx; if (s && typeof s.play === 'function') s.play(n, o2); else if (typeof s === 'function') s(n); } catch (e) { /* */ } };
  const buzz = (ms) => { try { if (ctx.haptic) ctx.haptic(ms); else if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* */ } };
  if (doc && !doc.getElementById('s29s-css')) { const s = doc.createElement('style'); s.id = 's29s-css'; s.textContent = CSS + EDGE30_CSS + GATE30.css; doc.head.appendChild(s); }   // ── shift30 ── (+ the edge chips', the gate's) ── /shift30 ──
  const cues = new Set(); const chipEl = {}; let placed = false;
  let A = null;   // the act running: { id, P, t, res, phase, … }
  const log = [];

  /* ── the station chips (tappable: onTap(id)) ── */
  /** ── route31 ── the act starts at the TOUCH-DOWN on the big button when it names the act in reach (FLOW31's spec: near31 + id31): so
   *  the hold, the slice, the drag and the climb are measured on that same touch — one gesture does the act (a tap still finishes it) ── /route31 ── */
  let downBtn = null;
  const onNearDown = () => {
    if (A || !twin || typeof twin.spec !== 'function') return;
    let sp = null; try { sp = twin.spec(); } catch (e) { sp = null; }
    if (!sp || !sp.near31 || !sp.id31 || !STATIONS[sp.id31] || typeof sp.go !== 'function') return;
    try { sp.go({ t: 'down31' }); } catch (e) { return; }
    if (!A) { try { twin.swallowUp = performance.now(); } catch (e) { /* */ } return; }   // ── recovered (16–26c) ── (no act began: the twin swallows this touch's release)
    if (A && A.id === sp.id31 && A.phase === 'act') { A.fromDown = true; A.pdT = now(); A.touches++; if (A.st.verb === 'hold' || A.st.verb === 'holdWalk') { A.climb0 = A.climb /* ── recovered (16–26c) ── */; A.press = now(); sfx('tap'); buzz(12); } if (A.st.verb === 'tapBeat') A.swallowTap = true; log.push(['down31', A.id]); }
  };
  function place() {
    placed = true;
    if (doc && !downBtn) { downBtn = doc.querySelector('.gm.tw-on .tw-btn') || doc.querySelector('.tw-btn'); if (downBtn) downBtn.addEventListener('pointerdown', onNearDown, true); }   // ── route31 ── ── /route31 ──
    if (!doc || !root) return;
    for (const id in STATIONS) {
      if (chipEl[id] || !LIVE31.includes(id)) continue;   // ── route31 ── (only the routes' stations have chips) ── /route31 ──
      const st = STATIONS[id], e = doc.createElement('div'); e.className = 's29-st'; e.dataset.st = id; e.setAttribute('role', 'button'); e.setAttribute('aria-label', st.label);
      e.innerHTML = `<i aria-hidden="true">${st.icon}</i><span>${st.he}</span>`;
      e.addEventListener('pointerdown', (ev) => ev.stopPropagation());
      e.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); if (A && A.id === id) { input({ t: 'tap', src: 'chip' }); return; } try { o.onTap && o.onTap(id); } catch (err) { /* the engine's */ } });
      root.appendChild(e); chipEl[id] = e;
    }
  }
  /** ── shift30 ── the gate's chip (the line's): 🚪 השער + "תור N"; a tap → o.tap (the engine takes the one whose patience is lowest) →
   *  { text(n), at(_, lit), close() } — placed with the court's chips (over the gate, or at the edge toward it) ── /shift30 ── */
  function gate(g = {}) {
    if (!doc || !root) return null;
    if (g.at && Number.isFinite(g.at.x)) GATE30.st = { at: { x: g.at.x, y: g.at.y || 16, z: g.at.z } };
    let e = chipEl.gate;
    if (!e) { e = doc.createElement('div'); e.className = 's29-st s30-gate'; e.dataset.st = 'gate'; e.setAttribute('role', 'button'); e.setAttribute('aria-label', 'השער — לקחת עולה רגל');
      e.innerHTML = '<i aria-hidden="true">🚪</i><span>השער</span><small class="s30-q"></small>';
      e.addEventListener('pointerdown', (ev) => ev.stopPropagation());
      e.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); if (A) return; try { g.tap && g.tap(); } catch (err) { /* the engine's */ } });
      root.appendChild(e); chipEl.gate = e; }
    const q = e.querySelector('.s30-q');
    SHARED.gateAt = GATE30.st.at;   // (the follow camera turns toward the line when no one is with him)
    return { text(n) { SHARED.wait = n | 0; const t = n > 0 ? `תור ${n}` : ''; if (q.textContent !== t) { q.textContent = t; e.__w = 0; e.__we = 0; } }, at(_, lit) { e.classList.toggle('lit', !!lit); }, close() { try { e.remove(); } catch (err) { /* */ } delete chipEl.gate; }, el: e };
  }
  function cue(id, on) { if (!STATIONS[id]) return false; if (on) cues.add(id); else cues.delete(id); SHARED.cue = on ? id : SHARED.cue === id ? null : SHARED.cue;   /* ── shift30 ── (the follow camera turns toward the next station) ── /shift30 ── */ if (chipEl[id]) chipEl[id].classList.toggle('cue', !!on); return true; }
  function clear() {
    placed = false; if (downBtn) { downBtn.removeEventListener('pointerdown', onNearDown, true); downBtn = null; } cues.clear(); SHARED.cue = null; SHARED.wait = 0; SHARED.gateAt = null;   // ── route31 ── ── /route31 ──   // ── shift30 ── ── /shift30 ──   // ── recovered (16–26c) ── (the resets had been inside the route31 comment until then: live again)
    for (const id in chipEl) { try { chipEl[id].remove(); } catch (e) { /* */ } delete chipEl[id]; }
    if (A) finish(0, false, 'clear');
  }
  function near(pos, r = 3, pref = null) { if (!pos) return null; if (pref && STATIONS[pref]) { const s = STATIONS[pref].stand; if (Math.hypot(s.x - pos.x, s.z - pos.z) <= r) return pref; }   /* ── route31 ── (the one he needs first: two stations share a corner) ── /route31 ── */ let best = null, bd = 1e9; for (const id in STATIONS) { if (!LIVE31.includes(id)) continue; const s = STATIONS[id].stand, d = Math.hypot(s.x - pos.x, s.z - pos.z); if (d <= r && d < bd) { bd = d; best = id; } } return best; }
  /** "לא — הכיור קודם": over the station, 1 s, no penalty */
  function wrong(id, needId) {
    const st = STATIONS[id], nd = STATIONS[needId]; if (!st) return false;
    const text = nd ? `לא — ${nd.he} קודם` : 'לא כאן';
    note(st, text, 1000, 's29-no'); sfx('ui'); buzz(25); log.push(['wrong', id, needId]);
    return text;
  }
  const notes = [];
  function note(st, text, ms, cls) {
    if (!doc || !root) return null;
    const e = doc.createElement('div'); e.className = cls; e.textContent = text; root.appendChild(e);
    const n = { e, x: st.at.x, y: (st.at.y || 16) + 6.2, z: st.at.z, until: performance.now() + ms, w: 0, h: 0 }; notes.push(n);
    return n;
  }

  /* ── the act: input from the work button (twin.onWork + the button's own press/release for the hold) and the station's chip ── */
  let offWork = null, btnEl = null; const onDown = (ev) => { if (A) { A.upSeen = false; A.pdT = now(); input({ t: 'press', down: true, at: ev && ev.timeStamp > 0 ? ev.timeStamp / 1000 : 0 }); } }   /* (no stopPropagation: in the capture phase at the target it would stop twin.js's own handler) */, onUp = () => { if (A) { A.upSeen = true; input({ t: 'press', down: false }); } };   // ── recovered (16–26c) ── (upSeen: the release came here; at: the touch's own time for the timing act)
  function grab() {
    if (twin && typeof twin.onWork === 'function' && !offWork) offWork = twin.onWork((ev) => { if (!A) return false; input(ev); return true; });
    if (doc && !btnEl) { btnEl = doc.querySelector('.gm.tw-on .tw-btn') || doc.querySelector('.tw-btn'); if (btnEl) { btnEl.addEventListener('pointerdown', onDown, true); btnEl.addEventListener('pointerup', onUp, true); btnEl.addEventListener('pointercancel', onUp, true); } }
  }
  function letGo() {
    if (offWork) { try { offWork(); } catch (e) { /* */ } offWork = null; }
    if (btnEl) { btnEl.removeEventListener('pointerdown', onDown, true); btnEl.removeEventListener('pointerup', onUp, true); btnEl.removeEventListener('pointercancel', onUp, true); btnEl = null; }
  }
  const now = () => performance.now() / 1000;
  // ── fable32 (build 15) ── the real kohen (hero35.js) when loaded: the act plays his clips and takes his hands' places for the props; the kit's figure only without him
  const H35 = () => { const H = globalThis.__HERO35; return H && H.loaded ? H : null; };
  const CLIP35 = { wood: ['2H_Melee_Attack_Chop', 1.5], oil: ['PickUp', 1.6], salt: ['PickUp', 1.6], bake: ['Interact', 1.4], pen: ['Interact', 1.6], kiyor: ['Use_Item', 1.0], song: ['Spellcast_Raise', 0.8], nituach: ['Interact', 1.4], samicha: ['Interact', 1.0], seals: ['Interact', 1.2], duchan: ['Throw', 1.0], rings: ['Interact', 1.0], shechita: ['1H_Melee_Attack_Chop', 1.2], zerika: ['Throw', 1.2], altar: ['Throw', 1.2], hagasha: ['PickUp', 1.4], kemitza: ['PickUp', 1.2], haktara: ['Throw', 1.0], melika: ['Interact', 1.2], mitzui: ['Interact', 1.2] };
  function hero35Act(H, ph, tail) {
    const id = A.id, hit = A.hitT || 0;
    if (id === 'kevesh' || (id === 'kiyor' && A.kWalking)) { if (H.state().acting) H.free(); return; }   // ── recovered (16–26c) ── (walking: his gait is hero35's own)
    if (ph === 'tail') { if (!A.tail35) { A.tail35 = 1; if (A.gold && A.P) H.play('Cheer', { once: true, speed: 1.2 }); else if (!A.swing) H.free(); } return; }   // ── recovered (16–26c) ── (the cheer for a pilgrim's gold only)
    const c = CLIP35[id] || ['Interact', 1.2];
    // ── recovered (build 17) ── the timing act: the wood's axe raised and held ready between the blows (the chop clip stopped at readyAt)
    if (A.swing) { if (id === 'wood' && !H.state().acting && A.pose35 !== 'ready' && !(A.sw && now() < A.sw.stuckUntil)) { A.pose35 = 'ready'; H.play('2H_Melee_Attack_Chop', { at: SWING17.readyAt, speed: 0, act: true, restart: true, fade: 0.15 }); } return; }
    if (A.st.verb === 'tapN' || A.st.verb === 'tap3' || A.st.verb === 'tapOn' || A.st.verb === 'tapBeat' || A.st.verb === 'tapRight') { if (hit && hit !== A.hit35) { A.hit35 = hit; H.play(c[0], { once: true, speed: c[1], restart: true }); } else if (!hit && !A.hit35 && H.state().clip !== 'Idle' && !H.state().acting) H.play('Idle'); }
    else if (A.st.verb === 'hold' || A.st.verb === 'holdWalk') { if (A.press != null) { if (H.state().clip !== c[0]) H.play(c[0], { speed: c[1] * 0.8, act: true }); } else if (H.state().acting) H.free(); }   // ── recovered (16–26c) ── (act: true; let go: free)
    else if (A.st.verb === 'slice' || A.st.verb === 'drag' || A.st.verb === 'dragDown') { if ((A.drag || A.pdT) && A.pd35 !== A.pdT) { A.pd35 = A.pdT; H.play(c[0], { once: true, speed: c[1], restart: true }); } }
  }
  // ── /fable32 ──
  // ── recovered (16–26c) ── the laver: his walk up to it at PACE.laver (≥ 0.3 s; ×opts.kK) — the act's hold counts from its end
  const walkOf = (a) => (a && Number.isFinite(a.hx) ? Math.max(0.3, Math.hypot(a.x - a.hx, a.z - a.hz) / PACE.laver) * ((a.opts && a.opts.kK) || 1) : 0);
  const tailOf = (id) => (id === 'rings' || id === 'shechita' ? ACT.grave + 0.3 : id === 'kevesh' ? (A && !A.P ? CLIMB31.tailDay : CLIMB31.tail) : STATIONS31[id] ? 0.42 : A && !A.P ? ACT.tailDay : ACT.tail) *   /* ── recovered (16–26c) ── (the day's: tailDay) ── */   /* ── route31 ── (the short acts' tail 0.42 s: five acts a pilgrim) ── /route31 ── */ (globalThis.__S29_SLOW > 0 ? globalThis.__S29_SLOW : 1);   // (__S29_SLOW: a test's shot of the tail)   // (the act's end after the touch: the rings' stillness, the vessel)
  // ── recovered (build 17) ── opts (day33's): { C, k, grace, onHit(g, id), onMiss(row, id), fb18, kK } — the timing act's ring time and
  // window, the day's grace, its own word and sound on a hit or a miss (fb18: focus17/fx18 sound it), the laver's walk ×kK
  function act(id, P, opts) {
    const st = STATIONS[id]; if (!st) return Promise.resolve({ quality: 0, gold: false });
    if (A) finish(0.5, false, 'replaced');
    const h = hero();
    return new Promise((res) => {
      A = { id, st, P: P || null, t0: now(), t: 0, res, phase: 'act', touches: 0, q: 0, gold: false, endAt: 0, press: null, held: 0, drag: null, beatT: 0, pick: null, wrongs: 0,
        hx: h.x, hz: h.z, x: st.act ? st.act.x : h.x, z: st.act ? st.act.z : h.z, yaw: Math.atan2(st.at.z - (st.act ? st.act.z : h.z), st.at.x - (st.act ? st.act.x : h.x)), el: [], firstFrame: 0, type: P ? P.type : 'olah',
        pdT: 0, n3: 0, climb: 0, climbT: 0, fx: 0, fz: 0, cut: null };   // ── route31 ── (the slice's touch-down, the tables' taps, the ramp's climb) ── /route31 ──
      A.want = SEAL_OF[A.type] || 'זכר';
      if (id === 'kevesh') A.cp = climbPath(A);   // ── recovered (16–26c) ── (the climb's path, fixed at the act's start)
      A.opts = opts || {};
      // ── recovered (build 17) ── the timing act: in the day the camera stands beside him (CAM17.swing: the side toward the court's middle),
      // looking at the thing; the act's state A.sw; the thing (the log, the jar…) before him
      if (st.verb === 'swing' && !P) {
        const V = CAM17.swing, back = A.yaw + Math.PI, sides = [back + V.off, back - V.off].map((az) => ({ az, x: A.x + Math.cos(az) * V.d, z: A.z + Math.sin(az) * V.d }));
        const side = Math.hypot(sides[0].x - V.open.x, sides[0].z - V.open.z) <= Math.hypot(sides[1].x - V.open.x, sides[1].z - V.open.z) ? sides[0] : sides[1], ahead = (SWING17.thing[id] || 0.9) * K29 * 0.5;
        SHARED.cam17 = { id: 'swing', az: side.az, el: V.el, d: V.d, look: { x: A.x + Math.cos(A.yaw) * ahead, z: A.z + Math.sin(A.yaw) * ahead } };
      }
      if (st.verb === 'swing') {
        const C = A.opts.C > 0 ? A.opts.C : SWING17.C, reach = (SWING17.thing[id] || 0.9) * K29;
        A.sw = { C, k: A.opts.k > 0 ? A.opts.k : 1, t0: A.t0, last: A.t0, hits: 0, golds: 0, misses: 0, missRow: 0, pauseUntil: 0, stuckUntil: 0, buf: 0, imp: null, lat: [], pend: 0 };
        A.swing = true; A.thing = { x: A.x + Math.cos(A.yaw) * reach, z: A.z + Math.sin(A.yaw) * reach }; A.thing.y = gy(A.thing.x, A.thing.z) + 1.4;
      }
      if (P) P.acting = true;
      if (P && id === 'samicha') P.lean31 = true;   // ── route31 ── (the owner leans both hands on its head) ── /route31 ──
      SHARED.act = { x: A.x, y: gy(A.x, A.z), z: A.z, id };   // (the shift camera comes close to the act: camera.js)
      try { if (S && S.hero) { S.hero.drive(0, 0); const H = H35(); if (H) { S.hero.setPos(A.x, A.z, Math.atan2(Math.cos(A.yaw), Math.sin(A.yaw))); S.hero.show(true); } else S.hero.show(false); } } catch (e) { /* */ }   // ── fable32 (build 15) ── (the real kohen acts himself: turned to the thing, never hidden) ── /fable32 ──
      grab(); actUI(); sfx('ui');
      log.push(['act', id, P ? P.type : null, Math.round(performance.now())]);
    });
  }
  function actUI() {
    if (!doc || !root) return;
    const mk = (cls, html = '') => { const e = doc.createElement('div'); e.className = cls; e.innerHTML = html; root.appendChild(e); A.el.push(e); return e; };
    const tips = { hold: 'החזיקו — שחררו בסימן', tapRight: `הקישו על החותם: ${A.want}`, tapBeat: 'הקישו כשהטבעת נסגרת', drag: 'גררו מהכפתור אל הפינה',
      // ── route31 ── the true routes' verbs ── /route31 ──
      tapOn: A.id === 'samicha' ? 'הבעלים סומך — הקישו על הראש' : 'הקישו', slice: 'החליקו מהר על המסך — או הקישו', tap3: 'הקישו 3 פעמים', holdWalk: 'החזיקו — הוא עולה בכבש', dragDown: 'גררו למטה על הקיר',
      swing: A.id === 'wood' ? 'הקישו כשהטבעת נסגרת על הגזר' : 'הקישו כשהטבעת נסגרת' };   // ── recovered (build 17) ──
    if (A.id === 'kemitza') tips.hold = 'החזיקו — היד נסגרת; שחררו בסימן';
    if (A.id === 'kiyor') tips.hold = 'ידיים ורגליים — פעם אחת לפני העבודה: החזיקו, שחררו בסימן';
    A.tip = mk('s29-tip'); A.tip.textContent = tips[A.st.verb] || '';
    // ── route31 ── the act's own touch zone over the thing (the slice across the lamb, the tap on the head) and the tables' three pips ── /route31 ──
    if (A.st.verb === 'slice' || A.st.verb === 'tapOn') {
      const z = A.zone = mk('s31-zone' + (A.st.verb === 'slice' ? ' slice' : ''), A.st.verb === 'slice' ? '' : '👆');
      let d0 = null;
      z.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); ev.preventDefault(); d0 = { x: ev.clientX, y: ev.clientY, t: ev.timeStamp || performance.now(), mx: 0 }; A && (A.pdT = now()); try { z.setPointerCapture(ev.pointerId); } catch (e) { /* */ } if (A && A.phase === 'act') A.touches++; });
      z.addEventListener('pointermove', (ev) => { if (!d0) return; d0.mx = Math.max(d0.mx, Math.hypot(ev.clientX - d0.x, ev.clientY - d0.y)); d0.lx = ev.clientX; d0.ly = ev.clientY; });
      const upZ = (ev) => { if (!d0) return; ev.stopPropagation(); const d = d0; d0 = null; const px = Math.max(d.mx, Math.hypot(ev.clientX - d.x, ev.clientY - d.y)), ms = (ev.timeStamp || performance.now()) - d.t;   // (the events' own times: a busy frame never makes a quick slice slow)
        if (A && A.st.verb === 'slice' && px >= 12) { cutLine(d.x, d.y, ev.clientX, ev.clientY); input({ t: 'slice', px, ms }); } else input({ t: 'tap', src: 'zone' }); };
      z.addEventListener('pointerup', upZ); z.addEventListener('pointercancel', () => { d0 = null; });
    }
    if (A.st.verb === 'tap3') { A.pips = mk('s31-pips', '<i></i><i></i><i></i>'); }
    if (A.st.verb === 'tapN') { A.pips = mk('s31-pips', '<i></i>'.repeat(A.st.n || 5)); }   // ── fable32 (build 6) ── ── /fable32 ──
    // ── recovered (build 17) ── the timing act: the target ring (s17-tg), the closing ring (s17-cl) and a touch zone over the thing
    if (A.st.verb === 'swing') {
      A.tg = mk('s17-tg'); A.cl = mk('s17-cl');
      const z = A.zone17 = mk('s17-zone'); z.setAttribute('aria-label', A.st.label || 'הקישו');
      z.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); ev.preventDefault(); if (A && A.phase === 'act') { A.touches++; swingHit(ev.timeStamp > 0 ? ev.timeStamp / 1000 : now(), 'zone'); } });
      z.addEventListener('click', (ev) => { ev.stopPropagation(); ev.preventDefault(); });
    }
    if (A.st.verb === 'holdWalk') { A.gauge = mk('s29-gauge', '<s></s><u></u>'); A.fill = A.gauge.firstChild; A.gauge.lastChild.style.bottom = `calc(${(CLIMB31.gold * 100).toFixed(0)}% - 4px)`; }
    if (A.st.verb === 'dragDown') A.arrow = mk('s29-arrow down');
    if (A.st.verb === 'hold') { A.gauge = mk('s29-gauge', '<s></s><u></u>'); A.fill = A.gauge.firstChild; }
    if (A.st.verb === 'tapBeat') { A.mark = mk('s29-beat mark'); A.ring = mk('s29-beat'); }
    if (A.st.verb === 'drag') A.arrow = mk('s29-arrow');
    if (A.st.verb === 'tapRight') {
      const order = SEALS3.slice(); const r = (A.P ? A.P.id : 1) % 3; for (let i = 0; i < r; i++) order.push(order.shift());
      A.seals = order.map((name, i) => { const e = mk('s29-seal' + (name === A.want ? ' want' : ''), name); e.dataset.seal = name; e.__i = i;
        e.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); ev.preventDefault(); input({ t: 'seal', name, e }); }); return e; });
    }
  }
  /** ── route31 ── the slice's white line where the finger went (0.35 s) ── /route31 ── */
  function cutLine(x0, y0, x1, y1) {
    if (!doc || !root || !A) return;
    const e = doc.createElement('div'); e.className = 's31-cut'; const len = Math.max(12, Math.hypot(x1 - x0, y1 - y0));
    e.style.width = `${Math.round(len)}px`; e.style.transform = `translate(${Math.round(x0)}px,${Math.round(y0)}px) rotate(${Math.atan2(y1 - y0, x1 - x0).toFixed(3)}rad)`;
    root.appendChild(e); A.el.push(e); setTimeout(() => { e.style.opacity = '0'; }, 30);
  }
  function input(ev) {
    if (!A || A.phase !== 'act') return;
    const t = now() - A.t0, v = A.st.verb;
    if (ev.t === 'move' || ev.t === 'cancel') { if ((v === 'drag' || v === 'dragDown' || v === 'slice') && ev.t === 'move') { A.drag = { dx: ev.dx, dy: ev.dy }; } return; }
    if (ev.t === 'press') {
      if (ev.down) { A.touches++; if (v === 'hold' || v === 'holdWalk') { if (v === 'holdWalk') A.climb0 = A.climb; A.press = now(); sfx('tap'); buzz(12); } else if (v === 'swing') swingHit(ev.at > 0 ? ev.at : now(), 'btn'); else if (v === 'tapBeat' && !A.P) beatTap(); else buzz(10); return; }   // ── fable32 (build 3) ── (every touch-down buzzes) ── /fable32 ──   // ── recovered (build 17) ── (the timing act and the day's beat: on the touch-down)
      if (v === 'hold' && A.press != null && A.id === 'kiyor' && now() < A.t0 + walkOf(A)) { A.press = null; return; }   // ── recovered (16–26c) ── (let go while he still walks up: nothing)
      if (v === 'hold' && A.press != null) { const held = now() - (A.id === 'kiyor' ? Math.max(A.press, A.t0 + walkOf(A)) : A.press); A.press = null; A.held = held; if (held >= ACT.tapMin) { const gold = Math.abs(held - ACT.holdMark) <= ACT.holdWin; A.swallowTap = true; return done(gold ? 1 : 0.75, gold); } }
      // ── route31 ── the ramp: held, he climbs; let go at the top = gold; let go on the way = he finishes the climb (good) ── /route31 ──
      // ── recovered (16–26c) ── let go on the way: he stops there (a stop costs the gold); a new hold climbs on — the top ends it (drawAct)
      if (v === 'holdWalk' && A.press != null) { const held = now() - A.press; A.press = null; A.held = held; A.climb = Math.min(1, (A.climb0 || 0) + held * climbRate(A)); A.climb0 = A.climb; if (A.climb < 1) A.stops = (A.stops | 0) + 1; A.swallowTap = true; return; }
      return;
    }
    // ── route31 ── the slice on the act's zone: ≥ 60 px within 300 ms = gold; a slower or shorter one = good ── /route31 ──
    if (ev.t === 'slice') { if (v !== 'slice') return; const gold = ev.px >= SLICE31.px && ev.ms <= SLICE31.ms; A.sliceGot = { px: Math.round(ev.px), ms: Math.round(ev.ms), gold }; return done(gold ? 1 : 0.8, gold); }
    if (ev.t === 'down') { if (v === 'drag' || v === 'dragDown' || v === 'slice') A.drag = { dx: 0, dy: 0 }; return; }
    if (ev.t === 'seal') {
      A.touches++;
      if (ev.name === A.want) { ev.e.classList.add('ok'); return done(A.wrongs ? 0.7 : t <= 2.2 ? 1 : 0.85, !A.wrongs && t <= 2.2); }
      A.wrongs++; ev.e.classList.remove('shake'); void ev.e.offsetWidth; ev.e.classList.add('shake'); sfx('ui'); buzz(30);
      if (A.touches >= 3) { const w = A.seals && A.seals.find((e) => e.dataset.seal === A.want); if (w) w.classList.add('ok'); return done(0.5, false); }   // (the third touch finishes it: the right seal shown)
      return;
    }
    if (ev.t === 'tap' || ev.t === 'up') {
      // ── recovered (build 17) ── the timing act and the day's beat take the touch-down only (a chip's or a pilgrim's tap still counts)
      if ((v === 'swing' && ev.src !== 'chip' && ev.src !== 'pilgrim') || (v === 'tapBeat' && !A.P && ev.src !== 'chip' && ev.src !== 'pilgrim')) return;
      if (v === 'swing') { swingHit(now(), ev.src); return; }
      if (ev.src !== 'chip' && A.swallowTap) { A.swallowTap = false; return; }
      if (ev.src === 'chip' || (ev.t === 'tap' && !A.pdT && ev.src !== 'zone')) { if (v !== 'hold' && v !== 'holdWalk') A.touches++; }   // ── route31 ── (a touch is counted once: at its touch-down on the button or the zone) ── /route31 ──
      if (v === 'hold') return done(0.7, false);
      // ── route31 ── ── /route31 ──
      if (v === 'holdWalk') return;   // ── recovered (16–26c) ── (a tap does not climb)
      if (v === 'tapOn') return done(1, true);   // ── route31 ── (the act IS a tap — on the head, the corner, the pyre, or the button that names it) ── /route31 ──
      if (v === 'slice') {
        if (ev.t === 'up') { const px = Math.hypot(ev.dx || 0, ev.dy || 0), ms = (now() - (A.pdT || A.t0)) * 1000, gold = px >= SLICE31.px && ms <= SLICE31.ms; A.sliceGot = { px: Math.round(px), ms: Math.round(ms), gold, src: 'btn' }; return done(gold ? 1 : 0.8, gold); }
        return done(0.7, false);
      }
      if (v === 'tapN') { A.n3++; sfx('tap'); buzz(12); if (A.pips) { const q = A.pips.children[A.n3 - 1]; if (q) q.classList.add('on'); } A.hitT = now(); if (A.n3 >= (A.st.n || 5)) { const fast = t <= 4; return done(fast ? 1 : 0.8, fast); } return; }   // ── fable32 (build 6) ── (the axe: n taps, the log pops on the last) ── /fable32 ──
      if (v === 'tap3') { A.n3++; sfx('tap'); buzz(10); if (A.pips) { const q = A.pips.children[A.n3 - 1]; if (q) q.classList.add('on'); } if (A.n3 >= 3) { const fast = t <= 2.4; return done(fast ? 1 : 0.8, fast); } return; }
      if (v === 'dragDown') {
        if (ev.t === 'up') { const gold = (ev.dy || 0) >= 24 && (ev.dy || 0) >= Math.abs(ev.dx || 0) * 0.8; return done(gold ? 1 : 0.85, gold); }
        return done(0.7, false);
      }
      if (v === 'tapRight') { if (A.touches >= 3) return done(0.5, false); const w = A.seals && A.seals.find((e) => e.dataset.seal === A.want); if (w) { w.classList.remove('shake'); void w.offsetWidth; w.classList.add('shake'); } return; }   // (the button: the right seal shakes — "here"; the third touch finishes it)
      if (v === 'tapBeat') { const u = (t - ACT.beatLead) % (ACT.beat + 0.5), gold = t >= ACT.beatLead && Math.abs(u - ACT.beat) <= ACT.beatWin; A.beatT = u; return done(gold ? 1 : 0.7, gold); }
      if (v === 'drag') {
        let gold = false;
        if (ev.t === 'up') { gold = Math.hypot(ev.dx || 0, ev.dy || 0) >= 24; if (!A.pdT) A.touches++; }   // (the drag itself is the gold way ⚑: the camera glides during the act, an aim test misjudged a kid's straight drag)
        return done(gold ? 1 : 0.7, gold);
      }
    }
  }
  /* ── recovered (build 17) ── the timing act: a touch at time t (s) is graded against the ring's gold moment (t0 + C); the blow lands
   *  (imp.at) a moment later — the wood's when the axe meets the log — and swingLand() resolves it there; a touch while the axe is stuck
   *  is kept if within SWING17.buffer of its freeing; one during the pause or a pending blow restarts the ring */
  function swingHit(t, src) {
    const sw = A && A.sw; if (!sw || A.phase !== 'act') return;
    sw.last = t;
    if (t < sw.stuckUntil) { if (sw.stuckUntil - t <= SWING17.buffer) sw.buf = t; log.push(['sw-stuck', A.id]); return; }
    if (t < sw.pauseUntil || sw.imp) { sw.pauseUntil = 0; sw.t0 = t; sw.pend = 0; log.push(['sw-cut', A.id]); return; }
    const d = t - (sw.t0 + sw.C), gr = gradeOf(d, sw.k), g = gr === 'perfect' ? 'gold' : gr === 'good' ? 'good' : 'miss';
    sw.imp = { t, g, at: t + (A.id === 'wood' ? (SWING17.chopImpact - SWING17.chopAt) / SWING17.chopSpeed : 0.12), d: Math.round(d * 1000), src: src || '' };
    A.hitT = t; A.swingT = t; A.lat0 = t; A.latFrame = 0; if (!A.opts.fb18) buzz(g === 'miss' ? 12 : 25);
    const H = H35();
    if (H) {
      if (A.id === 'wood') H.play('2H_Melee_Attack_Chop', { once: true, at: SWING17.chopAt, speed: SWING17.chopSpeed, restart: true, fade: 0.04 });
      else { const c = CLIP35[A.id] || ['Interact', 1.2]; H.play(c[0], { once: true, speed: c[1] * 1.5, restart: true, fade: 0.05 }); }
      A.pose35 = 'swing';
    }
    log.push(['sw', A.id, g, sw.imp.d]);
  }
  /** the blow lands: a miss sticks the axe (opts.onMiss may end the act); a hit splits — opts.onHit gives the word, the streak, more */
  function swingLand() {
    const sw = A.sw, imp = sw.imp; sw.imp = null;
    const H = H35(), tn = now();
    if (imp.g === 'miss') {
      const grace = !!A.opts.grace, stuck = grace ? SWING17.graceStuck : SWING17.stuck;
      sw.misses++; sw.missRow++; sw.stuckUntil = tn + stuck; sw.t0 = tn + stuck; A.stuck = { t: tn }; if (!A.opts.fb18) sfx(grace ? 'soft' : 'thud');
      swingWord(grace ? 'כמעט! עוד אחת' : A.id === 'wood' ? 'החטאה — הגרזן נתקע' : 'לא בזמן', grace ? '' : 'miss'); if (H) H.hitStop(stuck);
      let r = null; try { r = A.opts.onMiss ? A.opts.onMiss(sw.missRow, A.id) : null; } catch (e) { r = null; }
      if (r && r.end) swingEnd('miss');
      return;
    }
    sw.hits++; sw.missRow = 0; if (imp.g === 'gold') sw.golds++; A.split = { t: tn, g: imp.g };
    { const n = A.st.n || 3; A.n3 = A.id === 'pen' ? n : (A.n3 | 0) >= n ? 1 : (A.n3 | 0) + 1; }
    let r = null; try { r = A.opts.onHit ? A.opts.onHit(imp.g, A.id) : null; } catch (e) { r = null; }
    if (!A.opts.fb18) { sfx(SWING17.sfx[A.id] || 'good'); if (imp.g === 'gold') sfx('perfect', { combo: Math.max(1, (r && r.streak) | 0) }); else sfx('good', { light: true }); }
    if (H) H.hitStop(SWING17.hitStop);
    swingWord((r && r.word) || (imp.g === 'gold' ? 'מושלם!' : 'טוב'), imp.g === 'gold' ? 'gold' : '');
    if (r && r.more === false) { swingEnd('full'); return; }
    sw.pauseUntil = tn + SWING17.pause; sw.t0 = sw.pauseUntil;
  }
  /** the timing act's end (why: full · miss · idle · stick · cancel): any hit → done (gold when half or more were gold), none → nothing */
  function swingEnd(why) {
    const sw = A.sw;
    if (sw) { if (sw.hits > 0) { A.swEnd = why; done(sw.golds * 2 >= sw.hits ? 1 : 0.85, sw.golds === sw.hits); } else finish(0, false, why); }
  }
  /** the blow's word over the thing (0.65 s) */
  function swingWord(text, cls) {
    if (!doc || !root || !view || !A || !A.thing) return;
    const p = view.project(A.thing.x, A.thing.y + 1.6, A.thing.z); if (!p || !p.on) return;
    const e = doc.createElement('div'); e.className = 's17-wd ' + (cls || ''); e.textContent = text; e.style.left = `${Math.round(p.x - 30)}px`; e.style.top = `${Math.round(p.y - 30)}px`;
    root.appendChild(e); setTimeout(() => { try { e.remove(); } catch (err) { /* */ } }, 650);
  }
  /** ── recovered (16–26c) ── the day's beat (tapBeat without a pilgrim): judged on the touch-down (the touch that began the act is not one) */
  function beatTap() {
    const t = now() - A.t0;
    if (A.fromDown && !A.beatOpen) { A.beatOpen = true; if (t < 0.05) return; }
    const u = (t - ACT.beatLead) % (ACT.beat + 0.5), gold = t >= ACT.beatLead && Math.abs(u - ACT.beat) <= ACT.beatWin;
    A.beatT = u; A.hitT = now(); done(gold ? 1 : 0.7, gold);
  }
  /** the act's moment: the effect on the world, then a short tail (the gravity of the rings: the screen, the tone), then resolve */
  function done(q, gold) {
    if (!A || A.phase !== 'act') return;
    A.phase = 'tail'; A.q = q; A.gold = !!gold; A.tDone = now();
    const id = A.id, tail = tailOf(id);
    if (id === 'rings' || id === 'shechita') { sfx('grave', { duck: 0.2 }); buzz(40); if (A.P) A.P.lambGone = true; }   // ── route31 ── (the slaughter: the screen, one deep tone) ── /route31 ──
    else if (!(A.opts && A.opts.fb18)) { sfx(gold ? 'perfect' : 'good'); buzz(gold ? 30 : 18); if (id === 'kiyor') sfx('water'); }   // ── recovered (build 18) ── (fb18: focus17/fx18 sound it)
    if (id === 'altar') { try { if (A.type === 'olah') worldMark('NE', 'lower'); else if (A.type === 'ken') worldMark('SE', 'upper'); } catch (e) { /* the world's */ } }
    if (id === 'duchan' && A.P) A.P.kenGone = true;
    if (id === 'seals' && A.P) A.P.sealed = true;
    // ── route31 ── the true routes' marks on the world: the olah's below the line at NE; the bird's above it at SE (DAM25 row 17); the
    // parts on the table; the bowl handed over; the fistful; the dove gone at the melika (the kohen's back hides it) ── /route31 ──
    if (id === 'zerika') { try { worldMark(OLAH_MARK31.corner, OLAH_MARK31.level); } catch (e) { /* the world's */ } }
    if (id === 'mitzui') { try { worldMark(KEN_MARK31.corner, KEN_MARK31.level); } catch (e) { /* the world's */ } }
    if (id === 'melika' && A.P) A.P.kenGone = true;
    if (id === 'nituach' && A.P) A.P.parts = true;
    if (id === 'hagasha' && A.P) A.P.bowlGiven = true;
    if (id === 'kemitza' && A.P) A.P.fistful = true;
    if (id === 'kevesh' && A.P) A.P.partsUp = true;
    A.pts = actPts31(id, q, gold);
    // (the word on the thing: no number at the slaughter — DAM25 §2.4; elsewhere the act's grade)
    const at = { x: A.st.at.x, y: (A.st.at.y || 16) + 3.2, z: A.st.at.z };
    if (id === 'rings' || id === 'shechita') { /* (no word: the stillness — the vessel's word comes at the tail) */ }
    else if (STATIONS31[id] || id === 'kiyor') { const on = thingAt(id); if (id !== 'kevesh') ptsAt(on, A.pts, gold); }   // ── route31 ── ("+N" born on the thing; the ramp's at the pyre, at its end) ── /route31 ──
    else if (!A.sw) floatAt(at, gold ? 'מושלם!' : 'טוב', gold ? 'gold' : 'good');   // ── recovered (build 17) ── (the timing act said its words)
    A.endAt = A.tDone + (id === 'kiyor' ? Math.max(tail, walkOf(A)) : A.sw ? SWING17.endTail : tail);   // ── recovered (16–26c) ── (the laver: he walks back; the timing act: a short end)
    for (const e of A.el) if (e !== A.seals) { if (!(A.seals && A.seals.includes(e))) e.style.opacity = '0.0'; }
  }
  /** ── route31 ── where the act's "+N" is born: on the thing itself (the head, the corner, the table, the pyre) ── /route31 ── */
  function thingAt(id) {
    if (!A) return { x: 0, y: 19, z: 0 };
    if ((id === 'samicha') && A.P) return { x: A.P._x, y: gy(A.P._x, A.P._z) + 4.2, z: A.P._z };
    if (id === 'kevesh' || id === 'haktara') return { x: PYRE31.x, y: 25 + 3, z: PYRE31.z };
    if (id === 'zerika' || id === 'melika' || id === 'mitzui' || id === 'hagasha') return { x: A.st.at.x + 1.2, y: 16 + 4.5, z: A.st.at.z };
    return { x: A.st.at.x, y: (A.st.at.y || 16) + 3.2, z: A.st.at.z };
  }
  /** ── route31 ── the act's "+N" born on the thing (its own DOM word, 1.1 s up and out; gold: "+3 מושלם!") ── /route31 ── */
  function ptsAt(at, n, gold) {
    if (!doc || !root || !view) return floatAt(at, `+${n}`, gold ? 'gold' : 'good');
    let p = view.project(at.x, at.y, at.z); if (!p || !p.on) { const h = hero(); p = view.project(h.x, (Number.isFinite(h.y) ? h.y : 16) + 4.5, h.z); }
    if (!p || !p.on) return null;
    const W = innerWidth || 844, H = innerHeight || 390, x = Math.max(60, Math.min(W - 60, p.x)), y = Math.max(90, Math.min(H - 40, p.y));
    const f = doc.createElement('div'); f.className = 's29-fl s31-pts' + (gold ? ' gold' : ''); f.textContent = `+${n}${gold ? ' מושלם!' : ''}`; f.style.setProperty('--x', `${Math.round(x - 30)}px`); f.style.setProperty('--y', `${Math.round(y - 14)}px`);
    root.appendChild(f); setTimeout(() => { try { f.remove(); } catch (e) { /* */ } }, 1200); log.push(['pts', A ? A.id : '', n, !!gold]);
    return f;
  }
  function floatAt(at, text, kind) { try { if (twin && typeof twin.feedback === 'function') { twin.feedback(at, text, kind); return; } } catch (e) { /* */ } try { if (ctx.float) ctx.float(at, text, kind); } catch (e) { /* */ } }
  function finish(q, gold, why) {
    const a = A; if (!a) return; A = null;
    try { if (doc && doc.body) doc.body.classList.remove('s41-zone'); } catch (e) { /* */ }   // ── fable32 (build 41) ── ── /fable32 ──
    SHARED.act = null;
    // ── recovered (16–26c) ── the real kohen freed (but his cheer); the act's own camera view gone; a release still to come swallowed
    try { const H = H35(); if (H && H.state().acting !== 'Cheer') H.free(); } catch (e) { /* */ }
    if (SHARED.cam17 && (SHARED.cam17.id === 'climb' || SHARED.cam17.id === 'swing')) SHARED.cam17 = null;
    if ((a.press != null || a.heldAtEnd) && !a.upSeen && twin) { try { twin.swallowUp = performance.now(); } catch (e) { /* */ } }
    for (const id in chipEl) chipEl[id].classList.remove('s29-hide', 'on');   // (the court's chips take taps again at once — the next station is one touch away)
    for (const e of a.el) { try { e.remove(); } catch (err) { /* */ } }
    letGo();
    if (a.P) { a.P.acting = false; a.P.lean31 = false; }
    try { if (S && S.hero) { const h = hero(); if (!(a.id === 'kevesh' && why === 'stick')) { if (a.id === 'kevesh' && (a.climb >= 1 || !a.P)) { const c = climbAt(Math.min(1, a.climb), a); S.hero.setPos(c.x, c.z, c.yaw); } /* ── fable32 (build 14.1) ── (climbed to the top: he STAYS there — the logs are laid by his own tap; the owner: 'יש לחיצה בראש מהגזרים אל המערכה? צריך כזו') ── /fable32 ── */ else S.hero.setPos(a.hx, a.hz, Math.atan2(Math.cos(a.yaw), Math.sin(a.yaw)) /* (his yaw: atan2(fx, fz)) */); } S.hero.show(true); void h; } } catch (e) { /* */ }   // ── recovered (16–26c) ── (the day's climb: he stays where he stopped; the stick took him: where he is)
    const r = { quality: Math.max(0, Math.min(1, q)), gold: !!gold, ms: Math.round((now() - a.t0) * 1000), touches: a.touches, why: why || a.swEnd || '', hits: a.sw ? a.sw.hits : undefined, golds: a.sw ? a.sw.golds : undefined, misses: a.sw ? a.sw.misses : undefined, lat: a.sw ? a.sw.lat.slice() : undefined /* ── recovered (build 17) ── */, pts: a.pts | 0, slice: a.sliceGot || null, first: a.firstFrame, fdt: a.fdt | 0 };   // ── route31 ── (+ the act's points, the slice's measure, the first frame) ── /route31 ──
    log.push(['done', a.id, r.quality, r.gold, r.ms, r.touches, r.slice, r.first, r.fdt]);
    // ── recovered (build 17) ── the timing act's tally, and the touch → frame latencies (ms) for the tests (__SW17: the last 200)
    if (a.sw) { log.push(['swing', a.id, { hits: a.sw.hits, golds: a.sw.golds, misses: a.sw.misses, lat: a.sw.lat.slice() }]); try { globalThis.__SW17 = (globalThis.__SW17 || []).concat(a.sw.lat).slice(-200); } catch (e) { /* */ } }
    try { a.res(r); } catch (e) { /* */ }
  }

  /* ── the frame: the cue rings, the booth, the acting kohen and his props, the chips and the act's DOM ── */
  let drawT0 = 0, drawDt = 0, seekN = 0;   // ── route31 ── (the game frame's own length: the act's first frame is judged against it) ── /route31 ──
  function draw(k, tt) {
    { const tn = performance.now(); drawDt = drawT0 ? tn - drawT0 : 0; drawT0 = tn; }
    if (placed && doc && !downBtn && (seekN = (seekN + 1) % 15) === 0) { downBtn = doc.querySelector('.gm.tw-on .tw-btn') || doc.querySelector('.tw-btn'); if (downBtn) downBtn.addEventListener('pointerdown', onNearDown, true); }   // ── recovered (16–26c) ── (the button came later: look for it every 15 frames)
    if (placed) {
      // the seals' booth (המחשה ⚑): a low table, three seal blocks on it
      const b = STATIONS.seals.at, by = gy(b.x, b.z);
      if (LIVE31.includes('seals')) { k.b(L(b.x), L(b.z), L(by) + 0.33, 1.2, 0.55, 0.06, '#C9B48E'); for (const dx of [-0.5, 0.5]) k.b(L(b.x) + dx, L(b.z), L(by) + 0.16, 0.06, 0.45, 0.32, '#8A6A45'); }
      if (LIVE31.includes('seals')) for (let i = 0; i < 3; i++) k.c(L(b.x) - 0.35 + i * 0.35, L(b.z), L(by) + 0.4, 0.07, 0.08, ['#B08A4A', '#C8A060', '#9C7A44'][i]);   // ── route31 ── (the seals' booth is off the court: no route uses it) ── /route31 ──
      { const Wd = STATIONS.wood.at, wy = gy(Wd.x, Wd.z); for (let i = 0; i < 6; i++) { const row = i < 3 ? 0 : i < 5 ? 1 : 2, col = i < 3 ? i - 1 : i < 5 ? (i - 3) - 0.5 : 0; k.c(L(Wd.x) + col * 0.5, L(Wd.z) + row * 0.02, L(wy) + 0.22 + row * 0.4, 0.2, L(2.6), '#8A6A45', { pitch: Math.PI / 2 }); } }   // ── fable32 (build 6) ── the wood store's pile (logs lying east–west) ── /fable32 ──
      { const O = STATIONS.oil.at, oy = gy(O.x, O.z); for (let i = 0; i < 3; i++) { k.c(L(O.x) + (i - 1) * 0.55, L(O.z), L(oy) + 0.3, 0.2, 0.6, '#A8784A'); k.c(L(O.x) + (i - 1) * 0.55, L(O.z), L(oy) + 0.62, 0.11, 0.12, '#7A5230'); }
        const Sa = STATIONS.salt.at, sy = gy(Sa.x, Sa.z); k.c(L(Sa.x), L(Sa.z), L(sy) + 0.18, 0.55, 0.36, '#F2EEE4'); k.c(L(Sa.x), L(Sa.z), L(sy) + 0.42, 0.3, 0.2, '#FFFFFF');
        const Bk = STATIONS.bake.at, bky = gy(Bk.x, Bk.z); k.b(L(Bk.x), L(Bk.z), L(bky) + 0.4, 1.3, 0.6, 0.06, '#C9B48E'); for (const dx of [-0.5, 0.5]) k.b(L(Bk.x) + dx, L(Bk.z), L(bky) + 0.2, 0.06, 0.5, 0.4, '#8A6A45'); k.c(L(Bk.x), L(Bk.z), L(bky) + 0.47, 0.24, 0.1, '#E8D9B8'); }   // ── fable32 (build 7) ── the oil jars, the salt heap, the bakers' table and bowl ── /fable32 ──
      if (!BASIN30.off) { const B = BASIN30, by2 = gy(B.x, B.z), a2 = L(B.x), s2 = L(B.z), y0 = L(by2);   // ── shift30 ── the shift's basin (המחשה) ── /shift30 ──
        k.c(a2, s2, y0 + 0.03, 0.7, 0.06, '#9A7A4A'); k.c(a2, s2, y0 + 0.55, 0.16, 1.0, '#A07A40'); k.c(a2, s2, y0 + 1.15, 0.6, 0.3, '#B98A48'); k.c(a2, s2, y0 + 1.31, 0.53, 0.02, '!#8FC6E6');
        for (const sd of [-1, 1]) k.c(a2 + 0.62 * sd, s2, y0 + 1.08, 0.045, 0.16, '#8A6A35', { pitch: 1.2 * sd }); }
      // ── route31 ── the parts in his arms from the tables to the ramp (pale shapes; never while an act draws its own kohen) ── /route31 ──
      if (!A && HANDS31.h > 0) { const PP = (globalThis.__S29P && globalThis.__S29P.list) ? globalThis.__S29P.list().find((q) => q.state === 'taken' && q.parts && !q.partsUp) : null;
        if (PP) { try { globalThis.__R31PARTS = (globalThis.__R31PARTS | 0) + 1; } catch (e) { /* tests */ } const h = hero(), fx = Math.sin(h.yaw || 0), fz = Math.cos(h.yaw || 0), hy = Number.isFinite(h.y) ? h.y : gy(h.x, h.z); parts(k, L(h.x + fx * 0.5 - fz * 1.3), L(h.z + fz * 0.5 + fx * 1.3), L(hy) + HANDS31.h - 0.05, 4, 1.0, 0.14); } }   // (at his right hand: seen from the camera behind him)
      for (const id of cues) { const s = STATIONS[id].stand, y = gy(s.x, s.z), pu = 0.5 + 0.5 * Math.sin(tt * 5); k.ring(L(s.x), L(s.z), L(y) + 0.01, 0.55 + 0.08 * pu, '!#FFD24A', 18); }
    }
    if (A) drawAct(k, tt);
    { const t0 = performance.now(); dom(); chipsTime(performance.now() - t0); }   // ── shift30 ── (the frame-time log's chips share) ── /shift30 ──
  }
  function drawAct(k, tt) {
    A.draws = (A.draws | 0) + 1;
    const t = now() - A.t0, ph = A.phase, tail = ph === 'tail' ? now() - A.tDone : 0, id = A.id, y = gy(A.x, A.z), a = L(A.x), s = L(A.z); let yw = A.yaw;
    if (!A.firstFrame) { A.firstFrame = Math.round(t * 1000); A.fdt = Math.round(drawDt); }
    const fwd = (d) => [a + Math.cos(yw) * d, s + Math.sin(yw) * d];
    let pose = 'stand', u = 1;
    if (id === 'kiyor') { const hold = A.press != null ? Math.min(1.6, now() - A.press) : 0; pose = 'scoop'; u = ph === 'tail' ? Math.max(0, 1 - tail * 2) : A.press != null ? Math.min(1, 0.3 + hold) : 0.25; }
    else if (id === 'seals') { pose = 'point'; u = ph === 'tail' ? 1 : 0.6; }
    else if (id === 'rings') { pose = ph === 'tail' && tail > ACT.grave ? 'hold' : 'stand'; }
    else if (id === 'altar') { pose = A.drag || ph === 'tail' ? 'reach' : 'hold'; u = ph === 'tail' ? 1 : A.drag ? Math.min(1, Math.hypot(A.drag.dx, A.drag.dy) / 80) : 0.6; }
    else if (id === 'duchan') { pose = ph === 'tail' ? 'raise' : 'reach'; u = ph === 'tail' ? Math.min(1, tail * 3) : 0.5; }
    // ── route31 ── the true routes' poses (within the first frame: the touch-down shows on him at once) ── /route31 ──
    let ma = a, ms = s, my = L(y), walk = false;
    if (id === 'samicha') { pose = 'stand'; }
    else if (id === 'shechita') { pose = ph === 'tail' && tail > ACT.grave ? 'hold' : A.drag || A.pdT ? 'reach' : 'stand'; u = 0.5; }
    else if (id === 'zerika') { pose = A.drag || ph === 'tail' ? 'reach' : 'hold'; u = ph === 'tail' ? 1 : A.drag ? Math.min(1, Math.hypot(A.drag.dx, A.drag.dy) / 80) : 0.6; }
    else if (id === 'pen') { const hit = A.hitT ? Math.max(0, 1 - (now() - A.hitT) * 5) : 0; pose = ph === 'tail' ? 'point' : 'reach'; u = 0.5 + 0.3 * hit; }   // (build 12: the gate's taps)
    else if (id === 'song') { pose = ph === 'tail' ? 'raise' : 'stand'; u = 0.6; }   // ── fable32 (build 10) ── ── /fable32 ──   // ── fable32 (build 9) ── ── /fable32 ──
    else if (id === 'oil' || id === 'salt' || id === 'bake') { const hit = A.hitT ? Math.max(0, 1 - (now() - A.hitT) * 5) : 0; pose = id === 'bake' ? 'scoop' : 'reach'; u = 0.5 + 0.3 * hit; }   // ── fable32 (build 7) ── ── /fable32 ──
    else if (id === 'wood') { const hit = A.hitT ? Math.max(0, 1 - (now() - A.hitT) * 5) : 0; pose = 'reach'; u = 0.9 - 0.55 * hit; }   // ── fable32 (build 6) ── (the swing: the arms fall on each tap) ── /fable32 ──
    else if (id === 'nituach') { pose = 'reach'; u = 0.35 + 0.2 * Math.min(3, A.n3) / 3 + (A.press != null ? 0.15 : 0); }
    else if (id === 'hagasha') { pose = 'reach'; u = ph === 'tail' ? 1 : 0.55; }
    else if (id === 'kemitza') { pose = 'scoop'; u = ph === 'tail' ? 1 : A.press != null ? Math.min(1, 0.3 + (now() - A.press)) : 0.25; }
    else if (id === 'haktara') { pose = ph === 'tail' ? 'raise' : 'hold'; u = ph === 'tail' ? Math.min(1, tail * 3) : 0.5; }
    else if (id === 'melika') { pose = 'reach'; u = ph === 'tail' ? 0.9 : 0.5; }
    else if (id === 'mitzui') { pose = 'reach'; u = ph === 'tail' ? 0.4 : A.drag ? Math.max(0.2, 0.9 - Math.min(1, (A.drag.dy || 0) / 80) * 0.6) : 0.9; }
    else if (id === 'kevesh') {
      // the climb: up the ramp's middle line from its foot to its top while held (a tap: he climbs by himself in the tail)
      // (by the clock, not by frames: a slow frame never slows the climb)
      if (ph === 'act' && A.press != null) A.climb = Math.min(1, (A.climb0 || 0) + (now() - A.press) * climbRate(A));   // ── recovered (16–26c) ── (along the act's path: climbAt(u, A))
      if (ph === 'tail' && A.P) { if (A.tailC0 == null) A.tailC0 = A.climb; A.climb = Math.min(1, A.tailC0 + (now() - A.tDone) / (CLIMB31.s * 0.55)); }   // ── recovered (16–26c) ── (the day's: no climb by himself)
      A.lastF = now();
      if (ph === 'act' && A.climb >= 1) { A.swallowTap = true; A.heldAtEnd = A.press != null; A.press = null; done(A.stops ? 0.8 : 1, !A.stops); }   // (held to the top: gold) ── recovered (16–26c) ── (a stop on the way: good)
      if (ph === 'act' && A.press == null && !A.P && twin && twin.stick && twin.stick().on) { finish(0, false, 'stick'); return; }   // ── recovered (16–26c) ── (the day's: the stick walks him off the ramp — the act ends)
      const c = climbAt(A.climb, A); ma = L(c.x); ms = L(c.z); my = L(c.y); walk = (A.press != null || (ph === 'tail' && A.P)) && A.climb < 1; A.cyaw = c.yaw;
      pose = A.climb >= 1 && ph === 'tail' ? 'raise' : 'carry'; u = 0.6;
      try { if (S && S.hero && S.hero.setPos && Math.hypot(c.x - (A.camX || 1e9), c.z - (A.camZ || 1e9)) > 0.4) { A.camX = c.x; A.camZ = c.z; S.hero.setPos(c.x, c.z, c.yaw); S.hero.show(!!H35()); } } catch (e) { /* */ }   // (the camera follows him up; setPos shows the world's own figure — hidden again: the act draws him; build 15: the real kohen stays)
      // ── recovered (build 17) ── the day's climb: its own camera view behind him, looking up the way (CAM17.climb)
      if (!A.P) SHARED.cam17 = { id: 'climb', az: CAM17.climb.az, el: CAM17.climb.el, d: CAM17.climb.d, look: { x: c.x + CAM17.climb.ahead * Math.sin(c.yaw), z: c.z + CAM17.climb.ahead * Math.cos(c.yaw) } };
    }
    const isR31 = !!STATIONS31[id];
    if (id === 'melika' && A.cy31 == null) A.cy31 = camYaw() + Math.PI;   // (his back to the camera: DAM25 row 17)
    // ── fable32 (build 3) ── the laver: he walks up the steps from where he stood to the laver's side in the act's first 0.6 s, and back down in the tail (no jump) ── /fable32 ──
    if (id === 'kiyor' && Number.isFinite(A.hx) && Math.hypot(A.x - A.hx, A.z - A.hz) > 0.5) {
      const wk = walkOf(A), w = ph === 'tail' ? 1 - Math.min(1, tail / wk) : Math.min(1, t / wk), e = w, wx = A.hx + (A.x - A.hx) * e, wz = A.hz + (A.z - A.hz) * e;   // ── recovered (16–26c) ── (at his walking pace, evenly: walkOf)
      ma = L(wx); ms = L(wz); my = L(gy(wx, wz)); walk = w > 0 && w < 1; A.kWalking = walk; if (walk) pose = 'stand';
      if (ph === 'tail') yw = Math.atan2(A.hz - A.z, A.hx - A.x);
    }
    const H = H35(); let R = null, Lh = null;
    if (H) {   // ── fable32 (build 15) ── the real kohen: his clips, his hands (world → the kit's frame [a, s, y]); on the ramp and at the laver he is moved along (setPos) ── /fable32 ──
      if (id === 'kevesh' || (id === 'kiyor' && walk)) { try { if (S && S.hero) { const wx = ma * K29, wz = ms * K29; if (Math.hypot(wx - (A.mv35x || 1e9), wz - (A.mv35z || 1e9)) > 0.05) { A.mv35x = wx; A.mv35z = wz; S.hero.setPos(wx, wz, id === 'kevesh' ? (Number.isFinite(A.cyaw) ? A.cyaw : Math.PI) /* ── recovered (16–26c) ── */ : Math.atan2(Math.cos(yw), Math.sin(yw))); S.hero.show(true); } } } catch (e) { /* */ } }
      hero35Act(H, ph, tail);
      const hr = H.handR(), hl = H.handL(); if (hr) R = [L(hr.x), L(hr.z), L(hr.y)]; if (hl) Lh = [L(hl.x), L(hl.z), L(hl.y)];
    } else {
      const r = isR31 ? man(k, ma, ms, my, { hero: true, pose, u, yaw: id === 'kevesh' ? -Math.PI / 2 : id === 'melika' ? A.cy31 : yw, t: tt, walk }) : id === 'kiyor' ? man(k, ma, ms, my, { hero: true, pose, u, yaw: yw, t: tt, walk }) : man(k, a, s, L(y), { hero: true, pose, u, yaw: yw, t: tt });
      R = r && r.R; Lh = r && r.L;
    }
    if (id === 'rings') {
      // the linen screen between the court and the act (two poles, a white cloth), up from the tap to the tail's end — and nothing behind it is drawn
      if (ph === 'tail') { const [ca, cs] = fwd(0.95), w = 1.5, nx = -Math.sin(yw), nz = Math.cos(yw); for (const sd of [-1, 1]) k.c(ca + nx * w * 0.5 * sd, cs + nz * w * 0.5 * sd, L(y) + 0.75, 0.025, 1.5, '#8A6A45'); k.b(ca, cs, L(y) + 0.95, w, 0.04, 1.1, '#F1ECE0', { yaw: -yw + Math.PI / 2 }); }
      // the vessel in his hands after the stillness: a gold bowl, its liquid (BLOOD.wet, the vessel's own tag)
      if (ph === 'tail' && tail > ACT.grave && R && Lh) { const va = (R[0] + Lh[0]) / 2, vs = (R[1] + Lh[1]) / 2, vy = (R[2] + Lh[2]) / 2; k.c(va, vs, vy, 0.11, 0.09, '#D9B45A'); liquid(k, va, vs, vy + 0.03, 0.095, 0); if (!A.vesselWord) { A.vesselWord = 1; floatAt({ x: A.x, y: y + 3.4, z: A.z }, A.gold ? 'קבלה — מושלם' : 'קבלה', A.gold ? 'gold' : 'good'); } }
    }
    if (id === 'altar' && R) {
      // the vessel in his right hand, tipped toward the corner as he gives
      const tilt = ph === 'tail' ? Math.min(0.9, tail * 3) : 0; k.c(R[0], R[1], R[2], 0.1, 0.085, '#D9B45A'); if (A.type === 'olah' && tilt < 0.6) liquid(k, R[0], R[1], R[2] + 0.03, 0.085, tilt);
      if (A.type === 'mincha' && ph === 'tail') { const m = MAARACHOT.great; flame(k, L(m.x), L(m.z), L(LEVEL.altarTop), 1.4 + tail, tt); }
    }
    if (id === 'kiyor' && R && Lh && A.press != null) { for (const H of [R, Lh]) k.s(H[0], H[1], H[2] - 0.02, 0.07, 0.025, 0.07, '!#BFE3F5'); }
    if (id === 'duchan' && R && Lh && ph === 'tail') { k.s(R[0], R[1], R[2] + 0.06, 0.06, 0.05, 0.08, '#ECEAE4'); k.s(Lh[0], Lh[1], Lh[2] + 0.06, 0.06, 0.05, 0.08, '#D9D6CF'); }
    if (id === 'seals' && ph === 'tail' && R) k.c(R[0], R[1], R[2], 0.06, 0.07, '#C8A060');
    if (isR31) drawAct31(k, tt, R, Lh, ph, tail, y, a, s, fwd);
    // ── fable32 (build 12) ── the owner: "אראה את הפעולה שביצעה הדמות" — the wood: a block and a log before him, the axe in his right hand that falls on each tap, chips fly, the log splits in two at the end
    if (id === 'wood') {
      const [bx, bz] = fwd(0.95), hit = A.hitT ? Math.max(0, 1 - (now() - A.hitT) * 4) : 0, n = A.st.n || 5, done2 = ph === 'tail' && !A.sw;
      k.c(bx, bz, L(y) + 0.2, 0.3, 0.4, '#6B5236');   // (the chopping block)
      // ── recovered (build 17) ── the timing act: each hit splits the log — the halves fly apart (gold: lighter, with sparks), then the
      // next log rises onto the block; a miss: the axe stuck in it, shaking
      const sa = A.split ? now() - A.split.t : 9, nx = -Math.sin(yw), nz = Math.cos(yw), splitting = A.sw && sa < SWING17.pause;
      if (splitting) {
        const u2 = sa / SWING17.pause, sp = 0.12 + u2 * 0.5, up = Math.sin(u2 * Math.PI) * 0.3;
        for (const sd of [-1, 1]) k.c(bx + nx * sp * sd, bz + nz * sp * sd, L(y) + 0.5 + up, 0.13, 0.25, A.split.g === 'gold' ? '#C89A5E' : '#B48A55', { pitch: 0.4 * sd + u2 * 1.2 * sd });
        if (A.split.g === 'gold' && u2 < 0.6) for (let i = 0; i < 8; i++) { const an = i * 0.785, r2 = 0.2 + u2 * 0.8; k.s(bx + Math.cos(an) * r2, bz + Math.sin(an) * r2, L(y) + 0.65 + u2 * 0.3, 0.035, 0.035, 0.035, '!#FFD66E'); }
      } else if (done2) { const sp = Math.min(0.35, tail * 0.9); k.c(bx + sp, bz, L(y) + 0.5, 0.13, 0.25, '#B48A55', { pitch: 0.25 }); k.c(bx - sp, bz, L(y) + 0.5, 0.13, 0.25, '#B48A55', { pitch: -0.25 }); }
      else { const rise = A.sw && sa < SWING17.pause + 0.12 ? (1 - (sa - SWING17.pause) / 0.12) * 0.5 : 0; k.c(bx, bz, L(y) + 0.52 + rise, 0.16, 0.25, '#A07A4A'); k.c(bx, bz, L(y) + 0.65 + rise, 0.14, 0.02, '#D9B98A'); }
      if (A.sw && now() < A.sw.stuckUntil) { const sp = Math.sin(now() * 70) * 0.04; k.b(bx + sp, bz, L(y) + 0.95, 0.05, 0.75, 0.05, '#7A5A3A', { pitch: 0.5 }); k.b(bx + sp, bz, L(y) + 0.68, 0.22, 0.14, 0.05, '#9AA3AA'); }
      else if (R) { const dxh = bx - R[0], dzh = bz - R[1], dh = Math.hypot(dxh, dzh) || 1, hx = R[0] + dxh / dh * 0.55, hz = R[1] + dzh / dh * 0.55, lift = 0.55 * (1 - hit); k.b(hx, hz, R[2] + lift * 0.5, 0.05, 0.9, 0.05, '#7A5A3A', { pitch: Math.PI / 2 - lift }); k.b(hx + dxh / dh * 0.4, hz + dzh / dh * 0.4, R[2] + lift, 0.22, 0.14, 0.05, '#9AA3AA'); }   // (the axe: the handle to the block, the head beyond it; it rises between taps)
      if (hit > 0.05) for (let i = 0; i < 5; i++) { const t2 = i * 1.3 + (A.n3 | 0), r2 = 0.2 + (1 - hit) * 0.5; k.s(bx + Math.cos(t2) * r2, bz + Math.sin(t2) * r2, L(y) + 0.6 + (1 - hit) * 0.5 - (1 - hit) * (1 - hit) * 0.6, 0.03, 0.03, 0.03, '#D9B98A'); }   // (chips)
      if (A.pips && !A.pipsNote) { A.pipsNote = 1; }
    }
    if (id === 'pen') {   // (the gate: a bar across the pen's opening that swings up with the taps; open = the lamb goes in)
      const [gx, gz] = fwd(1.0), op = ph === 'tail' ? 1 : Math.min(1, (A.n3 | 0) / (A.st.n || 3));
      for (const sd of [-1, 1]) k.c(gx + sd * 0.55, gz, L(y) + 0.45, 0.05, 0.9, '#8A6A45');
      k.b(gx, gz, L(y) + 0.5 + op * 0.45, 1.1 * (1 - op * 0.3), 0.06, 0.06, '#A07A4A', { yaw: -yw + Math.PI / 2, pitch: op * 1.1 });
      // (the lamb: beside him at the gate; open, it trots in through it — white body, a dark head, four legs)
      { const w = ph === 'tail' ? Math.min(1, tail / 0.9) : 0, nx = -Math.sin(yw), nz = Math.cos(yw), [lx0, lz0] = [a + nx * 0.7 + Math.cos(yw) * 0.2, s + nz * 0.7 + Math.sin(yw) * 0.2], lx = lx0 + (gx + Math.cos(yw) * 1.2 - lx0) * w, lz = lz0 + (gz + Math.sin(yw) * 1.2 - lz0) * w, hop = w > 0 && w < 1 ? Math.abs(Math.sin(tail * 14)) * 0.06 : 0, ly = L(y) + 0.3 + hop;
        k.s(lx, lz, ly, 0.3, 0.24, 0.22, '#F2EEE6'); k.s(lx + Math.cos(yw) * 0.3, lz + Math.sin(yw) * 0.3, ly + 0.1, 0.11, 0.1, 0.1, '#3A2E26');
        for (const [fx2, fz2] of [[0.16, 0.12], [0.16, -0.12], [-0.16, 0.12], [-0.16, -0.12]]) k.c(lx + Math.cos(yw) * fx2 - Math.sin(yw) * fz2, lz + Math.sin(yw) * fx2 + Math.cos(yw) * fz2, ly - 0.2, 0.025, 0.2, '#3A2E26'); }
    }
    // the owner (14.10): "לא רק הווד… כל הפעולות" — every act shows its thing done: the oil poured, the salt scooped, the loaves set, the logs carried, the song's notes
    if (id === 'oil' && R) {
      // the jar in his hands tips on each tap; a gold stream falls into the bowl on the ground, which fills tap by tap
      const hit = A.hitT ? Math.max(0, 1 - (now() - A.hitT) * 3) : 0, n = A.st.n || 3, fill = Math.min(1, (A.n3 | 0) / n), [bx, bz] = fwd(0.8);
      k.c(bx, bz, L(y) + 0.09, 0.22, 0.18, '#B9A27A'); if (fill > 0) k.c(bx, bz, L(y) + 0.1 + 0.08 * fill, 0.19, 0.02, '!#E2B93B');   // (the bowl, its oil)
      k.c(R[0], R[1], R[2] + 0.1, 0.1, 0.3, '#A8713F', { pitch: 0.4 + 0.8 * hit, yaw: -yw });   // (the jar: tips as he pours)
      if (hit > 0.05) for (let i = 0; i < 4; i++) { const u2 = i / 4 + (1 - hit); const yy = R[2] + 0.1 - (L(y) + 0.1 + 0.08 * fill); k.s(R[0] + (bx - R[0]) * (u2 % 1) * 0.6, R[1] + (bz - R[1]) * (u2 % 1) * 0.6, R[2] + 0.05 - yy * (u2 % 1), 0.025, 0.05, 0.025, '!#E2B93B'); }   // (the stream)
    }
    if (id === 'salt' && R) {
      // the salt heap before him sinks tap by tap; grains fly from his hand into the basket beside it
      const hit = A.hitT ? Math.max(0, 1 - (now() - A.hitT) * 3) : 0, n = A.st.n || 3, take = Math.min(1, (A.n3 | 0) / n), [hx2, hz2] = fwd(0.8), nx = -Math.sin(yw), nz = Math.cos(yw);
      k.s(hx2, hz2, L(y) + 0.22 * (1 - take * 0.5), 0.4, 0.26 * (1 - take * 0.5), 0.4, '#F4F1EA');   // (the heap)
      k.c(hx2 + nx * 0.7, hz2 + nz * 0.7, L(y) + 0.15, 0.2, 0.3, '#B08A58'); if (take > 0) k.c(hx2 + nx * 0.7, hz2 + nz * 0.7, L(y) + 0.3, 0.17, 0.02 + 0.06 * take, '#F4F1EA');   // (the basket fills)
      if (hit > 0.05) for (let i = 0; i < 6; i++) { const u2 = (i / 6 + (1 - hit)) % 1; k.s(R[0] + (hx2 + nx * 0.7 - R[0]) * u2, R[1] + (hz2 + nz * 0.7 - R[1]) * u2, R[2] + 0.2 * Math.sin(u2 * Math.PI) - 0.1, 0.02, 0.02, 0.02, '!#FFFFFF'); }   // (grains)
    }
    if (id === 'bake') {
      // the table before him: the dough he kneads (pressed flat on each tap); the loaves set beside it one a tap, golden
      const hit = A.hitT ? Math.max(0, 1 - (now() - A.hitT) * 3) : 0, n = A.st.n || 3, [tx2, tz2] = fwd(0.8), nx = -Math.sin(yw), nz = Math.cos(yw);
      k.b(tx2, tz2, L(y) + 0.5, 1.6, 0.6, 0.05, '#C9B48E', { yaw: -yw }); for (const sd of [-0.6, 0.6]) k.c(tx2 + nx * sd, tz2 + nz * sd, L(y) + 0.25, 0.05, 0.5, '#8A6A45');
      k.s(tx2, tz2, L(y) + 0.55 + 0.1 * (1 - hit), 0.18 + 0.06 * hit, 0.12 * (1 - 0.5 * hit) + 0.02, 0.18 + 0.06 * hit, '#EADFC6');   // (the dough, pressed)
      for (let i = 0; i < Math.min(n, A.n3 | 0); i++) { const sd = 0.3 + i * 0.22; k.s(tx2 + nx * sd, tz2 + nz * sd, L(y) + 0.6, 0.1, 0.07, 0.1, '#D2A24C'); }   // (the loaves, one a tap)
      if (hit > 0.05) for (let i = 0; i < 4; i++) k.s(tx2 + Math.cos(i * 1.6 + (A.n3 | 0)) * (0.25 + (1 - hit) * 0.3), tz2 + Math.sin(i * 1.6 + (A.n3 | 0)) * (0.25 + (1 - hit) * 0.3), L(y) + 0.6 + (1 - hit) * 0.25, 0.02, 0.02, 0.02, '#F4EFE3');   // (flour)
    }
    if (id === 'song' && R && Lh) {
      // the harp in his hands (a frame and strings); notes rise from it on each beat
      const mid = [(R[0] + Lh[0]) / 2, (R[1] + Lh[1]) / 2, (R[2] + Lh[2]) / 2];
      k.b(mid[0], mid[1], mid[2] + 0.15, 0.05, 0.4, 0.5, '#B8862E', { yaw: -yw }); k.b(mid[0], mid[1], mid[2] + 0.4, 0.05, 0.4, 0.05, '#B8862E', { yaw: -yw, pitch: 0.45 });
      for (let i = 0; i < 5; i++) k.c(mid[0] + (i - 2) * 0.03, mid[1] + (i - 2) * 0.05, mid[2] + 0.17, 0.006, 0.32 + i * 0.03, '#F2E6C8');
      const bt = ph === 'tail' ? tail : 9; if (bt < 1.2) for (let i = 0; i < 3; i++) { const u2 = bt / 1.2 + i * 0.3; if (u2 < 1) k.s(mid[0] + Math.sin(u2 * 6 + i) * 0.2, mid[1] + Math.cos(u2 * 5 + i) * 0.2, mid[2] + 0.5 + u2 * 1.2, 0.05 * (1 - u2) + 0.01, 0.05 * (1 - u2) + 0.01, 0.05 * (1 - u2) + 0.01, '!#FFD66E'); }   // (the notes)
    }
    if (id === 'kevesh' && !(H && !A.P)) {   // ── recovered (16–26c) ── (the day's real kohen carries his own: flow31's)
      // (build 14) the back-basket with his logs as he climbs the ramp (the same basket flow31 draws on him in the court); at the top it is empty — the logs flew onto the pyre (flow31's flight)
      const atTop = A.climb >= 1 && ph === 'tail', fyaw = -Math.PI / 2, fx0 = Math.cos(fyaw), fz0 = Math.sin(fyaw), bx = ma - fx0 * 0.32, bz = ms - fz0 * 0.32, nL = Math.min(10, (globalThis.__LOGS33 | 0) || 3); void atTop;
      k.c(bx, bz, my + 0.95, 0.26, 0.52, '#B08A58'); k.c(bx, bz, my + 0.7, 0.27, 0.03, '#8A6A45'); k.c(bx, bz, my + 1.2, 0.27, 0.03, '#8A6A45');
      for (let i = 0; i < nL; i++) { const ox = ((i % 3) - 1) * 0.1, oz = (Math.floor(i / 3) - 1) * 0.08; k.c(bx + ox, bz + oz, my + 1.25 + 0.1 * (i % 2), 0.045, 0.55, i % 2 ? '#A07A4A' : '#8A6A45', { pitch: 0.25 * ((i % 3) - 1) }); }
    }
    // ── /fable32 ──
    // (the gold act's answer on him: a ring of gold sparks out from his chest, 0.45 s — the kiddush's: drops of water off his hands)
    if (ph === 'tail' && tail < 0.45) {
      const u = tail / 0.45, r0 = 0.25 + 0.9 * u, cy = L(y) + 1.0 + 0.25 * u, sz = 0.07 * (1 - u) + 0.02;
      if (A.gold) for (let i = 0; i < 10; i++) { const t2 = i / 10 * Math.PI * 2 + u; k.s(a + Math.cos(t2) * r0, s + Math.sin(t2) * r0, cy + 0.15 * Math.sin(i * 1.7), sz, sz, sz, '!#FFD66E'); }
      if (id === 'kiyor' && R && Lh) for (let i = 0; i < 6; i++) { const H = i & 1 ? R : Lh; k.s(H[0] + 0.08 * Math.cos(i), H[1] + 0.08 * Math.sin(i), H[2] - 0.25 * u - 0.05 * i, 0.025, 0.035, 0.025, '!#CFEAF7'); }
    }
    // ── recovered (build 17) ── the timing act's frame: the touch → frame latency; the blow lands; the axe freed (a kept touch starts the
    // ring); the pen's count reset; a ring missed by all restarts; idle (SWING17.idle s, __S29_IDLE) or the stick ends it
    if (A.sw && A.lat0 && !A.latFrame) { A.latFrame = now(); A.sw.lat.push(Math.round((A.latFrame - A.lat0) * 1000)); if (A.sw.lat.length > 40) A.sw.lat.shift(); }
    if (A.sw && ph === 'act') {
      const sw = A.sw, tn = now();
      if (sw.imp && tn >= sw.imp.at) { swingLand(); if (!A || A.phase !== 'act') return; }
      if (sw.stuckUntil && tn >= sw.stuckUntil) { sw.stuckUntil = 0; A.stuck = null; A.pose35 = ''; if (sw.buf) { sw.t0 = tn; sw.buf = 0; } }
      if (A.id === 'pen' && A.n3 && A.split && tn - A.split.t > 0.9) A.n3 = 0;
      if (!sw.imp && !sw.stuckUntil && tn >= sw.pauseUntil && tn > sw.t0 + sw.C + GRADE.GOOD * sw.k + 0.08) sw.t0 = tn;
      if (!sw.imp && tn - sw.last > (globalThis.__S29_IDLE > 0 ? globalThis.__S29_IDLE : SWING17.idle)) { swingEnd('idle'); return; }
      if (!sw.imp && twin && twin.stick && twin.stick().on) { swingEnd('stick'); return; }
    }
    // the end, ≤ 4 s: a touch-less act finishes by itself at the cap (quality 0.4 — never stuck)
    if (ph === 'act' && A.st.verb === 'tapN' && now() - (A.hitT || A.t0) > (globalThis.__S29_IDLE > 0 ? globalThis.__S29_IDLE : 8)) { finish(0, false, 'idle'); return; }   // ── fable32 (build 11) ── (a tapN act left alone 8 s: cancelled, nothing gained — never stuck, never finished by itself) ── /fable32 ──
    if (ph === 'act' && globalThis.__S29_CAP > 0 && t >= globalThis.__S29_CAP) done(0.4, false);   // ── fable32 ── (no act ends by itself any more — the owner 13.10: "אני מגיע מנקודה לנקודה בלי שעושה משהו"; a test's own cap only) ── /fable32 ──   // (__S29_CAP: a slow test harness's own cap)
    if (ph === 'tail' && now() >= A.endAt) finish(A.q, A.gold);
  }
  /* ── route31 ── the ramp's line: foot (z 42.5, the court's floor) → top (z 10.5, the altar's top) ── /route31 ── — ── recovered (16–26c) ──
     now the module's climbAt(u, a), along the act's climb path */
  /** the parts: pale abstract shapes (PARTS31) — on a table, in his hands, on the pyre; never anatomical, never red */
  function parts(k, a, s, y, n = PARTS31.length, sc = 1, spread = 0.18) {
    for (let i = 0; i < n && i < PARTS31.length; i++) {
      const p = PARTS31[i], da = ((i % 3) - 1) * spread * sc, ds = (Math.floor(i / 3) - 0.5) * spread * sc;
      if (p.kind === 'slab') k.b(a + da, s + ds, y + p.h * sc * 0.5, p.w * sc, p.d * sc, p.h * sc, p.hex, { yaw: i * 0.7 });
      else if (p.kind === 'round') k.s(a + da, s + ds, y + p.r * sc * 0.7, p.r * sc, p.r * sc * 0.7, p.r * sc, p.hex);
      else k.c(a + da, s + ds, y + p.r * sc, p.r * sc, p.len * sc, p.hex, { pitch: Math.PI / 2, yaw: i * 0.9 });
    }
  }
  /** the camera's bearing from him (kit plane): the linen screen stands on it; at the melika his back is to it */
  function camYaw() { try { const c = view && view.camNow ? view.camNow({}) : null; if (c && Number.isFinite(c.px)) return Math.atan2(c.pz - A.z, c.px - A.x); } catch (e) { /* */ } return A.yaw + Math.PI; }
  const HANDS31 = { h: 0 };
  function drawAct31(k, tt, R, Lh, ph, tail, y, a, s, fwd) {
    const id = A.id, mid = R && Lh ? [(R[0] + Lh[0]) / 2, (R[1] + Lh[1]) / 2, (R[2] + Lh[2]) / 2] : null;
    if (id === 'shechita') {
      // the linen screen rises between the court and the act from the touch to the tail's end; the vessel after the stillness (DAM25)
      // (between the camera and him: the court sees the cloth, not the act — DAM25 "דם כן, פגר לא"; up 0.15 s, held through the stillness, down)
      const G31 = ACT.grave * (globalThis.__S29_SLOW > 0 ? globalThis.__S29_SLOW : 1);   // (a test's slow tail holds the screen as long)
      if (ph === 'tail' && tail < G31 + 0.15) { const cy = camYaw(), [ca, cs] = [a + Math.cos(cy) * 0.75, s + Math.sin(cy) * 0.75], w = 1.7, rise = Math.min(1, tail / 0.15) * (tail > G31 ? Math.max(0, 1 - (tail - G31) / 0.15) : 1), nx = -Math.sin(cy), nz = Math.cos(cy);
        for (const sd of [-1, 1]) k.c(ca + nx * w * 0.5 * sd, cs + nz * w * 0.5 * sd, L(y) + 1.05, 0.035, 2.1, '#8A6A45'); k.b(ca, cs, L(y) + 0.08 + 0.95 * rise, w, 0.05, 1.9 * rise, '#F1ECE0', { yaw: -cy }); }   // (the cloth across the camera's line: between its two poles)
      if (ph === 'tail' && tail > G31 && mid) { k.c(mid[0], mid[1], mid[2], 0.11, 0.09, '#D9B45A'); liquid(k, mid[0], mid[1], mid[2] + 0.03, 0.095, 0); if (!A.vesselWord) { A.vesselWord = 1; floatAt({ x: A.x, y: y + 3.4, z: A.z }, A.gold ? 'קבלה — מושלם' : 'קבלה', A.gold ? 'gold' : 'good'); } }
    }
    if (id === 'zerika' && R) { const tilt = ph === 'tail' ? Math.min(0.9, tail * 3) : 0; k.c(R[0], R[1], R[2], 0.1, 0.085, '#D9B45A'); if (tilt < 0.6) liquid(k, R[0], R[1], R[2] + 0.03, 0.085, tilt); }
    if (id === 'nituach') {
      // the marble table before him; the parts appear on it one pair a tap (pale shapes)
      const [ta, ts] = fwd(0.55); k.b(ta, ts, L(y) + 0.42, 0.8, 0.5, 0.05, '#8E877C'); for (const dx of [-0.32, 0.32]) k.b(ta + dx, ts, L(y) + 0.2, 0.06, 0.42, 0.4, '#6F685E');   // (a grey-veined marble top: the pale parts read on it)
      const n = ph === 'tail' ? PARTS31.length : Math.min(PARTS31.length, A.n3 * 2); if (n) parts(k, ta, ts, L(y) + 0.45, n, 1.1, 0.2);
      if (mid) HANDS31.h = mid[2] - L(y);   // (his hands' height on this kit: the parts ride there on the way to the ramp)
    }
    if (id === 'kevesh' && mid) {
      const top = A.climb >= 1 && ph === 'tail', to = tail - (CLIMB31.tail - 0.5);
      if (!top || to < 0) parts(k, mid[0], mid[1], mid[2] + 0.02, 4, 1.0, 0.14);   // (in his arms)
      if (top && to >= 0) {   // the parts onto the pyre; the flame jumps
        const m = PYRE31, u = Math.min(1, to / 0.3); parts(k, mid[0] + (L(m.x) - mid[0]) * u, mid[1] + (L(m.z) - mid[1]) * u, mid[2] + (L(25.3) - mid[2]) * u + 0.3 * Math.sin(u * Math.PI), 4, 1.0, 0.14);
        flame(k, L(m.x), L(m.z), L(25), 1.3 + 1.6 * Math.max(0, 1 - Math.abs(to - 0.35) * 2), tt);
        if (!A.pyreWord && u >= 1) { A.pyreWord = 1; ptsAt(thingAt('kevesh'), A.pts, A.gold); }
      }
    }
    if ((id === 'hagasha' || id === 'kemitza') && mid) {   // the bowl of fine flour (the pilgrim's, handed over at the corner)
      k.c(mid[0], mid[1], mid[2] - 0.01, 0.14, 0.07, '#B9A27A'); k.s(mid[0], mid[1], mid[2] + 0.03, 0.12, 0.045, 0.12, '#F5F0E2');
      if (id === 'kemitza' && R && (A.press != null || ph === 'tail')) { const cl = ph === 'tail' ? 1 : Math.min(1, (now() - A.press) / ACT.holdMark); k.s(R[0], R[1], R[2] + 0.04, 0.05 + 0.02 * (1 - cl), 0.045, 0.05, '#E9D9B8'); if (ph === 'tail') k.s(R[0], R[1], R[2] + 0.1, 0.045, 0.04, 0.045, '#F5F0E2'); }   // (the fist closes; the fistful)
    }
    if (id === 'haktara') { const m = PYRE31; if (R && ph !== 'tail') k.s(R[0], R[1], R[2] + 0.06, 0.045, 0.04, 0.045, '#F5F0E2'); if (ph === 'tail') flame(k, L(m.x), L(m.z), L(25), 1.3 + 1.4 * Math.max(0, 1 - tail * 2), tt); }
    if (id === 'melika' && mid && ph !== 'tail') k.s(mid[0], mid[1], mid[2] + 0.04, 0.07, 0.06, 0.09, '#ECEAE4');   // (the dove in his hands — his back to the camera; no wound: DAM25)
  }
  function dom() {
    const tn = performance.now();
    for (let i = notes.length - 1; i >= 0; i--) { const n = notes[i]; if (tn > n.until) { try { n.e.remove(); } catch (e) { /* */ } notes.splice(i, 1); continue; } if (!view) continue; const p = view.project(n.x, n.y, n.z); if (!p || !p.on) continue; if (!n.w) { n.w = n.e.offsetWidth || 120; n.h = n.e.offsetHeight || 30; } const c = claim(p.x, p.y, n.w, n.h, 'shift-no'); n.e.style.transform = `translate(${Math.round(c.x - n.w / 2)}px,${Math.round(c.y - n.h / 2)}px)`; }
    if (!view) return;
    // ── shift30 ── the court's chips: over their anchor when it is on the screen, at the edge toward it (arrow + amot) when not —
    // the stations' and the gate's (its line: "תור 2"); during an act they step aside (the act is the frame) ── /shift30 ──
    if (placed) { const hh = hero(), from = { x: hh.x, z: hh.z }, hy = Number.isFinite(hh.y) ? hh.y : 16;
      let avoid = null; { const ft = view.project(hh.x, hy, hh.z), fx = ft.x, fy = ft.y, hd = view.project(hh.x, hy + 6.8, hh.z); if (ft.on && hd.on) { const y0 = Math.min(fy, hd.y), y1 = Math.max(fy, hd.y), wd = Math.max(70, (y1 - y0) * 0.55); avoid = [fx, (y0 + y1) / 2, wd, y1 - y0]; } }   // (the kohen's own rect: no edge chip on him)
      for (const id in chipEl) {
        const e = chipEl[id], st = id === 'gate' ? GATE30.st : STATIONS[id]; if (!st) continue;
        if (!e.__w) { e.__w = e.offsetWidth || 90; e.__h = e.offsetHeight || 48; }
        e.classList.toggle('on', !!(A && A.id === id)); e.classList.toggle('s29-hide', !!A);
        { const f = SHARED.f31, hide = !!(f && !f.st.has(id)); if (e.__f31 !== hide) { e.__f31 = hide; e.classList.toggle('f31-off', hide); } if (hide) continue; }   // ── flow31 ── (three chips: only the next place's and the gate's) ── /flow31 ──
        if (A) continue;
        // ── recovered (build 17) ── b17 (focus17's mini mode): the chip of the prompt standing at its thing is hidden; the others but the
        // cued one shrink to their icon over the thing (placeChip; off the screen: hidden — no edge chips)
        if (SHARED.b17 && SHARED.prompt31 === id) { if (e.style.transform !== 'translate(-999px,-999px)') e.style.transform = 'translate(-999px,-999px)'; e.__on = false; continue; }
        { const mini = !!SHARED.b17 && !cues.has(id);
          if (e.__mini !== mini) { e.__mini = mini; e.classList.toggle('s17-mini', mini); e.__w = 0; e.__we = 0; e.__cx = e.__cy = -1e4; }
          if (!e.__w) { e.__w = e.offsetWidth || (mini ? 34 : 90); e.__h = e.offsetHeight || (mini ? 34 : 48); }
          if (mini) { const q = view.project(st.at.x, (st.at.y || 16) + 4.2, st.at.z), W = innerWidth || 844, H = innerHeight || 390; const inside = q && q.on && q.x > 24 && q.x < W - 24 && q.y > 64 && q.y < H - 70; const pc = inside ? placeChip(q.x, q.y, e.__w, e.__h, 64) : null, tr = pc ? `translate(${Math.round(pc.x - e.__w / 2)}px,${Math.round(pc.y - e.__h / 2)}px)` : 'translate(-999px,-999px)';
            if (e.style.transform !== tr) e.style.transform = tr; e.__on = !!pc; continue; } }
        edgeChip(e, st.at.x, (st.at.y || 16) + (id === 'gate' ? 6.2 : 5.2), st.at.z, { w: e.__w, h: e.__h, view, from, ground: (st.at.y || 16) + 0.5, avoid });
      } }
    if (!A) return;
    const c31 = A.id === 'kevesh' ? climbAt(A.climb, A) : null, y = c31 ? c31.y : gy(A.x, A.z), hpx = c31 ? view.project(c31.x, y + 2.2, c31.z) : view.project(A.x, y + 2.2, A.z);   // ── route31 ── (the ramp: the tip and the gauge go up with him) ── /route31 ──
    if (A.tip && hpx && hpx.on) { if (!A.tipW) { A.tipW = A.tip.offsetWidth || 150; A.tipH = A.tip.offsetHeight || 26; } const c = claim(hpx.x, hpx.y - 70, A.tipW, A.tipH, 'shift-tip'); A.tip.style.transform = `translate(${Math.round(c.x - A.tipW / 2)}px,${Math.round(c.y - A.tipH / 2)}px)`; }
    const t = now() - A.t0;
    if (A.gauge && hpx && hpx.on) { A.gauge.style.transform = `translate(${Math.round(hpx.x + 34)}px,${Math.round(hpx.y - 60)}px)`; const f = A.st.verb === 'holdWalk' ? A.climb : A.press != null ? Math.max(0, Math.min(1.6, now() - (A.id === 'kiyor' ? Math.max(A.press, A.t0 + walkOf(A)) : A.press))) / 1.6 : A.phase === 'tail' ? A.held / 1.6 : 0;   /* ── recovered (16–26c) ── (the laver's: from his arrival) ── */   /* ── route31 ── (the ramp's gauge: the climb) ── /route31 ── */ A.fill.style.height = `${(f * 100).toFixed(1)}%`; }
    if (A.ring && hpx && hpx.on) {
      const u = A.phase === 'tail' ? 1 : Math.max(0, (t - ACT.beatLead) % (ACT.beat + 0.5)) / ACT.beat, sc = A.phase === 'tail' ? 1 : t < ACT.beatLead ? 3.2 : Math.max(0.6, 3.2 - 2.2 * Math.min(1.2, u));
      A.ring.style.transform = `translate(${Math.round(hpx.x)}px,${Math.round(hpx.y)}px) scale(${sc.toFixed(3)})`; A.mark.style.transform = `translate(${Math.round(hpx.x)}px,${Math.round(hpx.y)}px)`;
      A.ring.style.borderColor = Math.abs(u - 1) <= ACT.beatWin / ACT.beat ? '#FFFFFF' : '#FFD66E';
    }
    if (A.arrow) { const c = view.project(A.st.at.x, A.st.at.y + 3, A.st.at.z); if (c && c.on) A.arrow.style.transform = `translate(${Math.round(c.x)}px,${Math.round(c.y)}px)`; }
    // ── route31 ── the zone over the thing (the lamb / the head / the corner) — placed once, never moving under the finger; the pips ── /route31 ──
    if (A.zone && !A.zoneAt) { const P = A.P, on = P && (A.id === 'samicha' || A.id === 'shechita') ? view.project(P._lx || P._x, gy(P._x, P._z) + (A.id === 'samicha' ? 1.2 : 1.0), P._lz || P._z) : view.project(A.st.at.x, (A.st.at.y || 16) + 2, A.st.at.z);
      const W = innerWidth || 844, H = innerHeight || 390, x = on && on.on ? Math.max(100, Math.min(W - 200, on.x)) : W * 0.42, yy = on && on.on ? Math.max(130, Math.min(H - 80, on.y)) : H * 0.55;
      A.zoneAt = [Math.round(x), Math.round(yy)]; A.zone.style.transform = `translate(${A.zoneAt[0]}px,${A.zoneAt[1]}px)`; }
    // ── recovered (build 17) ── the timing act's rings on the thing: the closing ring from ring0 × down to the target (and on, shrinking,
    // past it); good within GRADE.GOOD (×k) of the gold moment, the target hot within PERF; off during the pause, a stuck axe, a blow
    if (A.sw && A.tg && A.thing) { const p = view.project(A.thing.x, A.thing.y, A.thing.z);
      // ── fable32 (build 41) ── (the coordinator's build-41 brief, item 7) the thing's own zone on the screen: the work button beside it
      // hidden — only the fallback (the zone off the screen, or the player's switch) ── /fable32 ──
      { const Wd = innerWidth || 844, Hd = innerHeight || 390, onS = !!(p && p.on && p.x >= 0 && p.y >= 0 && p.x <= Wd && p.y <= Hd) && !pad40On(); if (doc && doc.body && doc.body.classList.contains('s41-zone') !== onS) doc.body.classList.toggle('s41-zone', onS); }
      if (p && p.on) { const tr = `translate(${Math.round(p.x)}px,${Math.round(p.y)}px)`, sw = A.sw, tn = now(), off = tn < sw.pauseUntil || tn < sw.stuckUntil || !!sw.imp || A.phase !== 'act', d = tn - (sw.t0 + sw.C), u = Math.max(0, (tn - sw.t0) / sw.C), sc = off ? 1 : u < 1 ? SWING17.ring0 - (SWING17.ring0 - 1) * u : Math.max(0.55, 1 - (u - 1) * 1.6);
        A.tg.style.transform = tr; A.zone17.style.transform = tr; A.cl.style.transform = `${tr} scale(${sc.toFixed(3)})`;
        const good = !off && Math.abs(d) <= GRADE.GOOD * sw.k; A.cl.classList.toggle('good', good); A.cl.classList.toggle('off', off); A.tg.classList.toggle('hot', !off && Math.abs(d) <= GRADE.PERF * sw.k); } }
    if (A.pips && hpx && hpx.on) A.pips.style.transform = `translate(${Math.round(hpx.x - 30)}px,${Math.round(hpx.y - 44)}px)`;
    if (A.seals && !A.sealsAt) { A.sealsAt = 1; const W = innerWidth || 844, H = innerHeight || 390; A.seals.forEach((e, i) => { e.style.left = `${Math.round(W / 2 + (i - 1) * 84)}px`; e.style.top = `${Math.round(H * 0.6)}px`; }); }   // (a fixed row in the middle of the screen: never moving under the finger while the camera glides in)
  }
  const off = addDrawer(o.kit || ctx.kit, draw);

  const api = {
    act, cue, place, clear, near, wrong, gate,   // ── shift30 ── (+ gate) ── /shift30 ──
    /** ── recovered (16–26c) ── end the act running (the timing act: by its tally) → was there one */
    cancel: (why) => (A ? (A.sw && A.phase === 'act' ? swingEnd(why || 'cancel') : A.phase === 'act' && finish(0, false, why || 'cancel'), true) : false),
    STATIONS, BASIN30,   // ── fable32 (build 3) ── (tests: the places) ── /fable32 ──
    /** ── route31 ── a tap on the thing from outside (the pilgrim's chip during the samicha) ── /route31 ── */
    poke: (src) => { if (A && A.phase === 'act') { input({ t: 'tap', src: src || 'pilgrim' }); return true; } return false; },
    get busy() { return !!A; },
    /** tests: the act running ({ id, verb, phase, t, firstFrame, want }) and the log */
    state: () => (A ? { id: A.id, verb: A.st.verb, phase: A.phase, t: +(now() - A.t0).toFixed(2), firstFrame: A.firstFrame, want: A.want, touches: A.touches, x: A.x, z: A.z, n3: A.n3, draws: A.draws | 0, sw: A.sw ? { toGold: +(A.sw.t0 + A.sw.C - now()).toFixed(3), C: A.sw.C, hits: A.sw.hits, golds: A.sw.golds, misses: A.sw.misses, stuck: now() < A.sw.stuckUntil, pause: now() < A.sw.pauseUntil, lat: A.sw.lat.slice(-6) } : null /* ── recovered (build 17) ── */ } : null),
    log: () => log.slice(-30),
    /** the seal chips' screen centres (tests) */
    sealsAt: () => (A && A.seals ? A.seals.map((e) => { const r = e.getBoundingClientRect(); return { name: e.dataset.seal, x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; }) : []),
    destroy() { clear(); off(); },
    BLOOD,
  };
  try { globalThis.__S29S = api; } catch (e) { /* tests */ }
  return api;
}
