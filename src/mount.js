// The Herodian Temple Mount platform, its walls, porticoes, gates and bridges.
import * as THREE from 'three';
import { mkParts, groundAO } from './batch.js';

export const PLAT = { X0: -300, X1: 277, Z0: -480, Z1: 400 };
// Middot 2:1 — the 500 × 500 square: most room to the south, then east, then north, least to the west.
export const SQUARE = { x0: -223, x1: 277, z0: -183.5, z1: 316.5 };

// Everything here is the `har` build stage (the Herodian platform replaces the natural hill).
export function buildMount(B, P) {
  B.stage('har');
  const { box, cornice, wall, door } = mkParts(B);
  const { X0, X1, Z0, Z1 } = PLAT;

  /* platform body + paving */
  box('ashBig', X0, -150, Z0, X1, -0.25, Z1, -200);
  box('pave', X0, -0.25, Z0, X1, 0, Z1, -999);
  P('har', X0, -150, Z0, X1, 0, Z1);
  P('kotel', X0 - 1.2, -150, Z0, X0 + 0.5, 32, Z1);

  /* string course at platform level */
  box('ashBig', X0 - 0.7, -1.6, Z0 - 0.7, X0, 0, Z1 + 0.7, -999);
  box('ashBig', X1, -1.6, Z0 - 0.7, X1 + 0.7, 0, Z1 + 0.7, -999);
  box('ashBig', X0, -1.6, Z0 - 0.7, X1, 0, Z0, -999);
  box('ashBig', X0, -1.6, Z1, X1, 0, Z1 + 0.7, -999);

  /* upper walls = back walls of the porticoes, with Herodian pilasters */
  const UW = 32;
  // the western wall, with the gate at Wilson's causeway: "שער קיפונוס במערב, יוצא לפרור" (Middot 1:3). Wave 4 (the CREWS
  // agent's request): a real opening, so the caravans' ox carts drive through instead of fading in the wall. Its size (14 ×
  // 22 amot, a plain lintel and jambs): illustration
  const CG = { z0: -66, z1: -52, h: 22 };
  box('ashBig', X0, 0, Z0, X0 + 6, UW, CG.z0); box('ashBig', X0, 0, CG.z1, X0 + 6, UW, Z1); box('ashBig', X0, CG.h, CG.z0, X0 + 6, UW, CG.z1);
  box('ash', X0 - 1, CG.h - 0.2, CG.z0 - 1.2, X0 + 0.4, CG.h + 1.6, CG.z1 + 1.2, -999);                                      // the lintel
  for (const z of [CG.z0, CG.z1]) box('ash', X0 - 1, 0, z - (z === CG.z0 ? 1.2 : 0), X0 + 0.4, CG.h - 0.2, z + (z === CG.z1 ? 1.2 : 0), -999);   // the jambs
  box('dark', X0 + 0.05, CG.h - 0.02, CG.z0, X0 + 5.95, CG.h, CG.z1, -999);                                                   // the passage's ceiling (in shade)
  box('ashBig', X1 - 6, 0, Z0, X1, UW, Z1);
  box('ashBig', X0 + 6, 0, Z0, X1 - 6, UW, Z0 + 6); box('ashBig', X0 + 6, 0, Z1 - 6, X1 - 6, UW + 2, Z1);
  const c0 = UW - 3, c1 = UW - 1.6;
  box('ash', X0 - 1.2, c0, Z0 - 1.2, X0, c1, Z1 + 1.2, -999);
  box('ash', X1, c0, Z0 - 1.2, X1 + 1.2, c1, Z1 + 1.2, -999);
  box('ash', X0, c0, Z0 - 1.2, X1, c1, Z0, -999);
  box('ash', X0, c0 + 2, Z1, X1, c1 + 2, Z1 + 1.2, -999);
  for (let z = Z0 + 5; z <= Z1 - 5; z += 7.2) {
    if (z > CG.z0 - 2.6 && z < CG.z1 + 2.6) continue;   // (no pilaster in the gate)
    box('ashBig', X0 - 0.9, 1.5, z - 1.3, X0, UW - 3, z + 1.3, -999);
    if (Math.abs(z) > 17) box('ashBig', X1, 1.5, z - 1.3, X1 + 0.9, UW - 3, z + 1.3, -999);
  }
  for (let x = X0 + 5; x <= X1 - 5; x += 7.2) {
    box('ashBig', x - 1.3, 1.5, Z0 - 0.9, x + 1.3, UW - 3, Z0, -999);
    box('ashBig', x - 1.3, 1.5, Z1, x + 1.3, UW - 1, Z1 + 0.9, -999);
  }

  /* double porticoes on the west, north and east (Solomon's) */
  const cols = [];
  const rowZ = (x, z0, z1, st) => { for (let z = z0; z <= z1; z += st) cols.push([x, z]); };
  const rowX = (z, x0, x1, st) => { for (let x = x0; x <= x1; x += st) cols.push([x, z]); };
  rowZ(-279, -466, 318, 9); rowZ(-264, -466, 318, 9);
  rowZ(256, -466, 318, 9); rowZ(241, -466, 318, 9);
  rowX(-459, -255, 232, 9); rowX(-444, -255, 232, 9);
  const archZ = (x, z0, z1) => box('wmarble', x - 1.3, 25.6, z0, x + 1.3, 27.4, z1, -999);
  const archX = (z, x0, x1) => box('wmarble', x0, 25.6, z - 1.3, x1, 27.4, z + 1.3, -999);
  archZ(-279, -468, 322); archZ(-264, -468, 322); archZ(256, -468, 322); archZ(241, -468, 322);
  archX(-459, -294, 271); archX(-444, -294, 271);
  const roof = (t, down) => {
    B.slab('cedar', t, 0.7, { down });
    B.slab('roof', t.map(([x, y, z]) => [x, y + 0.45, z]), 0.45, { down });
  };
  roof([[-294, 32.6, -474], [-294, 32.6, 324], [-261, 27.2, 324], [-261, 27.2, -474]], [1, 0]);
  roof([[238, 27.2, -474], [238, 27.2, 324], [271, 32.6, 324], [271, 32.6, -474]], [-1, 0]);
  roof([[-294, 32.6, -474], [-294, 27.2, -441], [271, 27.2, -441], [271, 32.6, -474]], [0, 1]);
  P('porticoes', -300, 0, -480, -258, 33, 330); P('porticoes', 236, 0, -480, 277, 33, 330); P('porticoes', -300, 0, -480, 277, 33, -438);

  /* the Royal Stoa — 162 columns in four rows, the fourth built into the wall (Ant. 15.11.5) */
  const royal = [];
  for (const z of [333, 350, 377]) for (let x = -286; x <= 263; x += 13.7) royal.push([x, z]);
  for (let x = -286; x <= 263; x += 13.7) box('wmarble', x - 1.6, 0, 392.6, x + 1.6, 23, 394, -999);
  for (const z of [333, 350, 377]) box('wmarble', -294, 20, z - 1.6, 271, 23, z + 1.6, -999);
  box('ash', -294, 23, 349, 271, 58, 351); box('ash', -294, 23, 376, 271, 58, 378);
  cornice(-294, 349, 271, 351, 58, 0.35); cornice(-294, 376, 271, 378, 58, 0.35);
  for (let x = -279.2; x <= 258; x += 13.7) {
    box('dark', x - 2.3, 41, 348.88, x + 2.3, 50, 349, -999);
    box('wmarble', x - 2.9, 50, 348.7, x + 2.9, 51.2, 349, -999);
    box('dark', x - 2.3, 41, 378, x + 2.3, 50, 378.12, -999);
  }
  roof([[-294, 23.8, 330.5], [-294, 36.6, 349], [271, 36.6, 349], [271, 23.8, 330.5]], [0, -1]);
  roof([[-294, 57.4, 347.4], [-294, 67.2, 363.5], [271, 67.2, 363.5], [271, 57.4, 347.4]], [0, -1]);
  roof([[-294, 67.2, 363.5], [-294, 57.4, 379.6], [271, 57.4, 379.6], [271, 67.2, 363.5]], [0, 1]);
  roof([[-294, 38.2, 378], [-294, 34.6, 394], [271, 34.6, 394], [271, 38.2, 378]], [0, 1]);
  box('ash', -300, 32, 331, -294, 37, 349); box('ash', -300, 32, 349, -294, 58, 378); box('ash', -300, 32, 378, -294, 38, 394);
  box('ash', 271, 32, 331, 277, 37, 349); box('ash', 271, 32, 349, 277, 58, 378); box('ash', 271, 32, 378, 277, 38, 394);
  B.tri('ash', [-300, 58, 349], [-300, 58, 378], [-300, 67, 363.5]);
  B.tri('ash', [277, 58, 378], [277, 58, 349], [277, 67, 363.5]);
  P('royal-stoa', -300, 0, 329, 277, 68, 400);

  /* the Chuldah gates in the southern wall, with the great stairway before them (Middot 1:3) */
  const chulda = (c, w, h) => {
    box('dark', c - w / 2, -44, Z1, c + w / 2, -44 + h, Z1 + 0.12, -999);
    box('ash', c - w / 2 - 1.4, -44, Z1, c - w / 2, -44 + h, Z1 + 0.9, -999);
    box('ash', c + w / 2, -44, Z1, c + w / 2 + 1.4, -44 + h, Z1 + 0.9, -999);
    box('ash', c - w / 2 - 1.4, -44 + h, Z1, c + w / 2 + 1.4, -44 + h + 2.4, Z1 + 1.0, -999);
  };
  chulda(-108, 8, 12); chulda(-94, 8, 12);
  chulda(18, 7, 11); chulda(31, 7, 11); chulda(44, 7, 11);
  box('pave', -150, -64, Z1, 70, -44, Z1 + 8, -999);
  for (let k = 0; k < 7; k++) box('pave', -150, -64, Z1 + 8 + 3 * k, 70, -45 - k, Z1 + 11 + 3 * k, -999);
  P('chulda', -150, -64, Z1 - 1, 70, -30, Z1 + 30);

  /* Robinson's Arch — a stair-bridge up to the Royal Stoa at the south-west corner */
  {
    const s = new THREE.Shape();
    s.moveTo(-342, -60); s.lineTo(-330, -60); s.lineTo(-330, -20);
    s.absarc(-315, -20, 15, Math.PI, 0, true);
    s.lineTo(-299.5, -20); s.lineTo(-299.5, 0); s.lineTo(-342, 0); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 30, bevelEnabled: false, curveSegments: 24 });
    // ── site14 ── (her ❤️ "בניית קשת") the arch on a material of its own, so stages.js lays it as she builds it: from the pier up,
    // the voussoirs from both haunches, the keystone last (FINCUT har.archStone: a height cut her arch jobs raise)
    const M = B.mats; if (M && M.ashBig && !M.archStone) M.archStone = { mat: groundAO(M.ashBig.mat.clone(), { macro: 0.12 }), tile: M.ashBig.tile };
    g.translate(0, 0, 348); B.geo(M && M.archStone ? 'archStone' : 'ashBig', g, -999);   // ── /site14 ──
    box('pave', -342, 0, 348, -300, 0.25, 378, -999);
    box('ash', -342, 0.25, 348, -341, 2, 378, -999);
    for (let k = 0; k < 26; k++) {
      const top = -2 - 2 * k, z0 = 378 + 4 * k;
      box('ashBig', -347, -72, z0, -325, top - 0.3, z0 + 4);
      box('pave', -347, top - 0.3, z0, -325, top, z0 + 4, -999);
    }
    P('robinson', -348, -72, 346, -299, 2, 482);
  }

  /* Wilson's Arch — the causeway west to the Upper City */
  {
    const s = new THREE.Shape();
    s.moveTo(-470, -84); s.lineTo(-299.5, -84); s.lineTo(-299.5, 0); s.lineTo(-470, 0); s.closePath();
    for (const [a, b] of [[-324, -301], [-358, -334], [-392, -368], [-426, -402]]) {
      const h = new THREE.Path(), m = (a + b) / 2, r = (b - a) / 2;
      h.moveTo(a, -83); h.lineTo(b, -83); h.lineTo(b, -24); h.absarc(m, -24, r, 0, Math.PI, false); h.lineTo(a, -83);
      s.holes.push(h);
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: 26, bevelEnabled: false, curveSegments: 20 });
    g.translate(0, 0, -72); B.geo('ashBig', g, -999);
    box('pave', -470, 0, -72, -300, 0.25, -46, -999);
    box('ash', -470, 0, -72, -300, 1.8, -71, -999); box('ash', -470, 0, -47, -300, 1.8, -46, -999);
    P('wilson', -470, -84, -72, -299, 2, -46);
  }

  /* the Eastern Gate — "Shushan the capital portrayed upon it" (Middot 1:3) */
  wall(268, -16, 285, 16, 0, 44);
  door('E', 285, 0, 12, 0, 20, 'gold');
  box('wmarble', 285, 23.5, -7.5, 285.35, 32, 7.5, -999);
  for (let k = -3; k <= 3; k++) box('gold', 285.35, 24.4, k * 1.9 - 0.55, 285.6, 27.4 + (Math.abs(k) % 2 ? 1.6 : 0) + (k === 0 ? 2.2 : 0), k * 1.9 + 0.55, -999);
  box('ash', 285, -72, -12, 295, -0.3, 12); box('pave', 285, -0.3, -12, 295, 0, 12, -999);
  for (let k = 0; k < 29; k++) {
    const top = -2 - 2 * k, z0 = 12 + 4 * k;
    box('ash', 285, -82, z0, 295, top - 0.3, z0 + 4);
    box('pave', 285, top - 0.3, z0, 295, top, z0 + 4, -999);
  }
  P('shushan', 268, -82, -16, 296, 45, 130);

  /* Antonia — four towers; the south-eastern one 70 cubits (War 5.5.8) */
  const A2 = (...a) => box('ash2', ...a);
  A2(-308, -72, -578, -182, 8, -480);
  A2(-300, 8, -570, -190, 36, -488);
  box('pave', -300, 36, -570, -190, 36.3, -488, -999);
  cornice(-300, -570, -190, -488, 36, 0.5, 'ash2');
  for (const [x0, z0, h] of [[-306, -576, 60], [-206, -576, 60], [-306, -504, 60], [-206, -504, 80]]) {
    A2(x0, 8, z0, x0 + 22, h, z0 + 22);
    cornice(x0, z0, x0 + 22, z0 + 22, h, 0.6, 'ash2');
    for (let k = 0; k < 7; k++) {
      const t = 1.6 + k * 3.1;
      A2(x0 + t, h + 0.2, z0 - 0.3, x0 + t + 1.6, h + 2.4, z0 + 1.2, -999);
      A2(x0 + t, h + 0.2, z0 + 20.8, x0 + t + 1.6, h + 2.4, z0 + 22.3, -999);
      A2(x0 - 0.3, h + 0.2, z0 + t, x0 + 1.2, h + 2.4, z0 + t + 1.6, -999);
      A2(x0 + 20.8, h + 0.2, z0 + t, x0 + 22.3, h + 2.4, z0 + t + 1.6, -999);
    }
    for (const yy of [h - 14, h - 26]) {
      box('dark', x0 + 9.8, yy, z0 + 22, x0 + 12.2, yy + 5, z0 + 22.1, -999);
      box('dark', x0 + 22, yy, z0 + 9.8, x0 + 22.1, yy + 5, z0 + 12.2, -999);
    }
  }
  P('antonia', -308, -72, -578, -182, 82, -480);

  return { cols, royal };
}

// The Herodian street along the foot of the Western Wall, with its row of shops
export function buildStreet(B, terrainH) {
  B.stage('har');
  for (let z = -470; z < 470; z += 20) {
    const y = Math.max(terrainH(-323, z + 10), terrainH(-301, z + 10), terrainH(-312, z + 10)) + 0.35;
    B.box('pave', -323, y - 4, z, -300.5, y, z + 20, -999);
    if ((z < -80 || z > -40) && (z < 330 || z > 490)) {
      const sy = Math.max(terrainH(-338, z + 10), y - 1);
      B.box('ash', -337, y - 4, z + 1, -324, y + 8, z + 19, y);
      B.box('ash', -337.5, y + 7.5, z + 0.5, -323.5, y + 8.4, z + 19.5, -999);
      B.box('dark', -324.06, y, z + 7.5, -323.96, y + 4.2, z + 12.5, -999);
      B.box('dark', -324.06, y + 5, z + 3, -323.96, y + 6.4, z + 5, -999);
    }
  }
}
