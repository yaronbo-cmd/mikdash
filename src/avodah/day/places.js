/* places.js — where the day's errands stand (amot, the finished Temple's own coordinates; ENGINE22). Props of a work stand BESIDE these. */
import { KIYOR, GATES, WOOD_CHAMBER, PENS_GATE } from '../../places.js';
export const PLACE22 = {
  moked: { x: GATES.moked.x + 14, z: -52, he: 'בית המוקד' },   // ── polish23 ── (the fire: east of the door's front — the lambs' marker stands 20 amot west of it, no longer a stone's throw)
  kiyor: { x: KIYOR.x + 3.1, z: KIYOR.z, he: 'הכיור' },
  pen: { x: PENS_GATE.x, z: PENS_GATE.z + 6, he: 'הדיר' },
  wood: { x: (WOOD_CHAMBER.x0 + WOOD_CHAMBER.x1) / 2, z: (WOOD_CHAMBER.z0 + WOOD_CHAMBER.z1) / 2, he: 'לשכת העצים' },
  gate: { x: -6, z: 0, he: 'שער ניקנור' },
  store: { x: -70.5, z: -54.6, he: 'לשכת הנסכים' },
  seals: { x: -14, z: -30, he: 'דוכן החותמות' },
  night: { x: -20, z: -50, he: 'משמר הלילה' },
  lambs: { x: -166, z: -56, he: 'לשכת הטלאים' },   // ── polish23 ── (west, at the lambs' chamber door: GATES.moked −160 ± 6)
  close: { x: -16.5, z: 3, he: 'שער ניקנור' },   // ── polish23 ── (the open floor x −20…−16, z 0…6: no wall block between the camera and him)
  court: { x: -20, z: 0, he: 'העזרה' },
  // the sheets' own spots (the lots, the altar's east, the Ulam's steps, the rings, the ramp, the Levites' platform) — each errand its own marker
  gazit: { x: -81, z: 55.5, he: 'לשכת הגזית' },
  deshen: { x: -27.4, z: 17, he: 'מזרח הכבש' },
  altar: { x: -19, z: 6, he: 'המזבח' },
  ulam: { x: -62, z: 0, he: 'מעלות האולם' },
  heichal: { x: -74, z: 0, he: 'פתח האולם' },
  rings: { x: -38, z: -40, he: 'בית המטבחיים' },
  ringsE: { x: -28, z: -38, he: 'בית המטבחיים' },
  limbs: { x: -50, z: 34, he: 'הכבש' },
  duchan: { x: -12, z: -14, he: 'הדוכן' },
  ketoret: { x: -66, z: -6, he: 'מעלות האולם' },
};
export const placeAt = (id) => PLACE22[id] || PLACE22.court;
