/* ─────────────────────────────────────────────────────────────────────────────
 * art.js: the pieces of "משחק האוצר", drawn in code (canvas paths; no image files) and cached as sprites.
 *
 *   const A = createArt(px);      // px = the sprite size in device pixels (a cell × dpr)
 *   A.get(key) → canvas           // keys: v0…v5 (vessels) · light · log · ashlar · wstone · nugget · coin ·
 *                                 //       blk:<field>:<1-3> · earth1 · earth2 · nug · vine · b1 b2 b3 (special badges)
 *   ICON(key, size) → canvas      // small icons for the HUD (stone, cedar, gold, silver, bronze, wstone, log, v0…)
 *
 * Every vessel has its own colour AND silhouette (colour-blind safe): the menorah (gold, seven branches), the altar
 * (whitewashed, the red line, horns and fire), the sealed oil jug (glazed blue, a gold seal — an illustration), the
 * showbread (stacked loaves), the pomegranate (crimson with a crown), the two silver trumpets (a V of long bells).
 * Holy vessels are drawn whole and warm; nothing here is ever drawn broken.
 * ──────────────────────────────────────────────────────────────────────────── */
const mk = (w, h) => {
  const c = typeof OffscreenCanvas !== 'undefined' && !globalThis.document ? new OffscreenCanvas(w, h) : document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
};
const lin = (g, x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
const rad = (g, x, y, r0, r1, stops) => { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
const GOLD = [[0, '#FFF6C8'], [0.28, '#FFD75E'], [0.6, '#D89A1E'], [0.85, '#9A6410'], [1, '#FFE08A']];
const SILVER = [[0, '#FFFFFF'], [0.3, '#DDE6EE'], [0.62, '#8F9EAD'], [0.85, '#5D6B79'], [1, '#EEF4F9']];
const shade = (g, blur = 5, dy = 3, a = 0.38) => { g.shadowColor = `rgba(40,20,0,${a})`; g.shadowBlur = blur; g.shadowOffsetY = dy; g.shadowOffsetX = 0; };
const noShade = (g) => { g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetY = 0; };
function gloss(g, x, y, rx, ry, a = 0.55) {
  g.save(); g.globalAlpha = a; g.fillStyle = rad(g, x, y, 0, Math.max(rx, ry), [[0, '#FFFFFF'], [1, 'rgba(255,255,255,0)']]);
  g.beginPath(); g.ellipse(x, y, rx, ry, -0.5, 0, Math.PI * 2); g.fill(); g.restore();
}
function flame(g, x, y, h, w = h * 0.42) {
  g.save();
  g.fillStyle = rad(g, x, y - h * 0.35, 0, h * 1.1, [[0, 'rgba(255,240,170,0.55)'], [1, 'rgba(255,190,60,0)']]);
  g.beginPath(); g.arc(x, y - h * 0.35, h * 1.1, 0, Math.PI * 2); g.fill();
  g.fillStyle = lin(g, x, y - h, x, y, [[0, '#FFF7C0'], [0.45, '#FFC53D'], [1, '#E0521B']]);
  g.beginPath(); g.moveTo(x, y - h);
  g.bezierCurveTo(x + w * 0.9, y - h * 0.45, x + w * 0.7, y, x, y);
  g.bezierCurveTo(x - w * 0.7, y, x - w * 0.9, y - h * 0.45, x, y - h); g.fill();
  g.fillStyle = 'rgba(255,255,235,0.9)'; g.beginPath(); g.ellipse(x, y - h * 0.3, w * 0.22, h * 0.22, 0, 0, Math.PI * 2); g.fill();
  g.restore();
}

/* ── the vessels (drawn in a 100×100 box) ── */
const VESSEL = [
  function menorah(g) {
    shade(g, 4, 3);
    // straight diagonal branches (the project's default, REVIEW ⚑1; the Arch of Titus shows round ones)
    g.strokeStyle = lin(g, 10, 20, 90, 80, GOLD); g.lineCap = 'round'; g.lineWidth = 6;
    for (const r of [36, 24, 12]) { g.beginPath(); g.moveTo(50 - r, 30); g.lineTo(50, 30 + r); g.lineTo(50 + r, 30); g.stroke(); }
    g.lineWidth = 7; g.beginPath(); g.moveTo(50, 28); g.lineTo(50, 80); g.stroke();
    g.fillStyle = lin(g, 20, 76, 80, 96, GOLD);
    g.beginPath(); g.moveTo(36, 80); g.lineTo(64, 80); g.lineTo(70, 88); g.lineTo(30, 88); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(26, 88); g.lineTo(74, 88); g.lineTo(80, 95); g.lineTo(20, 95); g.closePath(); g.fill();
    noShade(g);
    g.fillStyle = lin(g, 0, 20, 0, 34, GOLD);
    for (const x of [14, 26, 38, 50, 62, 74, 86]) { g.beginPath(); g.ellipse(x, 29, 5.2, 3.2, 0, 0, Math.PI * 2); g.fill(); }
    for (const [y] of [[48], [60], [72]]) { g.beginPath(); g.ellipse(50, y, 5, 3.4, 0, 0, Math.PI * 2); g.fill(); }
    for (const x of [14, 26, 38, 50, 62, 74, 86]) flame(g, x, 26, 13);
    g.strokeStyle = 'rgba(255,255,230,0.7)'; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(16, 33); g.lineTo(30, 47); g.stroke();
  },
  function altar(g) {
    shade(g, 5, 3);
    g.fillStyle = lin(g, 0, 84, 0, 95, [[0, '#E9DFC6'], [1, '#B9AB8A']]);
    g.beginPath(); g.roundRect(8, 83, 84, 12, 2); g.fill();
    g.fillStyle = lin(g, 12, 36, 88, 88, [[0, '#FFFFFF'], [0.5, '#F4EEDD'], [1, '#CFC3A4']]);
    g.beginPath(); g.roundRect(14, 38, 72, 47, 3); g.fill();
    noShade(g);
    g.strokeStyle = 'rgba(140,120,85,0.35)'; g.lineWidth = 1.2;
    for (const y of [50, 72]) { g.beginPath(); g.moveTo(15, y); g.lineTo(85, y); g.stroke(); }
    for (const [x, y0, y1] of [[36, 38, 50], [62, 38, 50], [28, 72, 85], [52, 72, 85], [74, 72, 85]]) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); }
    g.fillStyle = lin(g, 0, 58, 0, 64, [[0, '#E0483A'], [1, '#9E1F16']]);
    g.fillRect(14, 58, 72, 6);
    // the horns (keranot) and the fire of the arrangement
    g.fillStyle = lin(g, 0, 26, 0, 40, [[0, '#FFFFFF'], [1, '#D8CDB2']]);
    for (const x of [14, 74]) { g.beginPath(); g.moveTo(x, 40); g.lineTo(x, 30); g.lineTo(x + 6, 26); g.lineTo(x + 12, 30); g.lineTo(x + 12, 40); g.closePath(); g.fill(); }
    flame(g, 50, 38, 24, 14); flame(g, 38, 39, 15); flame(g, 62, 39, 15);
    gloss(g, 30, 44, 14, 5, 0.5);
  },
  function jug(g) {
    shade(g, 5, 3);
    g.fillStyle = lin(g, 20, 30, 80, 94, [[0, '#9ED4FF'], [0.35, '#3D8FD8'], [0.75, '#16508F'], [1, '#0B2E57']]);
    g.beginPath();
    g.moveTo(41, 24); g.lineTo(59, 24);
    g.bezierCurveTo(58, 34, 60, 38, 66, 42);
    g.bezierCurveTo(86, 52, 84, 88, 60, 93);
    g.lineTo(40, 93);
    g.bezierCurveTo(16, 88, 14, 52, 34, 42);
    g.bezierCurveTo(40, 38, 42, 34, 41, 24); g.fill();
    noShade(g);
    g.strokeStyle = lin(g, 60, 30, 84, 60, [[0, '#6FB6F2'], [1, '#123F73']]); g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(59, 32); g.bezierCurveTo(80, 26, 86, 44, 72, 52); g.stroke();
    g.fillStyle = lin(g, 0, 17, 0, 27, [[0, '#7FC0F5'], [1, '#1D5A9C']]);
    g.beginPath(); g.ellipse(50, 23, 12, 4.5, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,230,150,0.9)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(40, 58); g.bezierCurveTo(50, 62, 60, 62, 72, 56); g.stroke();
    // the seal of the Kohen Gadol (Shabbat 21b): a gold disc on the mouth
    shade(g, 3, 2, 0.3);
    g.fillStyle = rad(g, 47, 16, 1, 11, GOLD);
    g.beginPath(); g.arc(50, 18, 9, 0, Math.PI * 2); g.fill();
    noShade(g);
    g.strokeStyle = 'rgba(120,70,0,0.8)'; g.lineWidth = 1.4;
    g.beginPath(); g.arc(50, 18, 5.2, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(50, 14.5); g.lineTo(50, 21.5); g.moveTo(46.5, 18); g.lineTo(53.5, 18); g.stroke();
    gloss(g, 36, 56, 8, 14, 0.6);
  },
  function bread(g) {
    // the showbread: loaves with raised "horns" at their ends (Menachot 11:4), three of a row of six
    const loaf = (y, w) => {
      const x0 = 50 - w / 2, x1 = 50 + w / 2;
      shade(g, 4, 2, 0.32);
      g.fillStyle = lin(g, 0, y - 10, 0, y + 12, [[0, '#F4C98A'], [0.4, '#C27A36'], [1, '#6E3A14']]);
      g.beginPath();
      g.moveTo(x0, y - 11); g.lineTo(x0 + 7, y - 11); g.lineTo(x0 + 9, y - 3);
      g.lineTo(x1 - 9, y - 3); g.lineTo(x1 - 7, y - 11); g.lineTo(x1, y - 11);
      g.bezierCurveTo(x1 + 2, y + 2, x1 - 2, y + 10, x1 - 8, y + 11);
      g.lineTo(x0 + 8, y + 11); g.bezierCurveTo(x0 + 2, y + 10, x0 - 2, y + 2, x0, y - 11); g.fill();
      noShade(g);
      g.fillStyle = 'rgba(255,245,210,0.55)'; g.beginPath(); g.ellipse(50, y + 1, w * 0.3, 3, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(120,60,15,0.45)'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(x0 + 9, y - 3); g.lineTo(x1 - 9, y - 3); g.stroke();
    };
    loaf(84, 80); loaf(61, 76); loaf(38, 72);
    // the frankincense cup (bazikh) on top — two were set with the bread (Menachot 11:5)
    shade(g, 3, 2, 0.3);
    g.fillStyle = lin(g, 40, 14, 60, 26, GOLD);
    g.beginPath(); g.moveTo(40, 16); g.lineTo(60, 16); g.lineTo(56, 26); g.lineTo(44, 26); g.closePath(); g.fill();
    noShade(g);
  },
  function pomegranate(g) {
    shade(g, 5, 3);
    g.fillStyle = rad(g, 38, 46, 4, 44, [[0, '#FF9A8A'], [0.35, '#E8313F'], [0.8, '#8E0F22'], [1, '#5A0716']]);
    g.beginPath(); g.moveTo(50, 26);
    g.bezierCurveTo(78, 24, 90, 48, 86, 64); g.bezierCurveTo(82, 84, 64, 94, 50, 94);
    g.bezierCurveTo(36, 94, 18, 84, 14, 64); g.bezierCurveTo(10, 48, 22, 24, 50, 26); g.fill();
    noShade(g);
    g.fillStyle = lin(g, 0, 10, 0, 30, [[0, '#E5555F'], [1, '#7E1020']]);
    g.beginPath(); g.moveTo(38, 30);
    for (const [x, y] of [[36, 14], [43, 22], [47, 10], [50, 21], [53, 10], [57, 22], [64, 14], [62, 30]]) g.lineTo(x, y);
    g.closePath(); g.fill();
    g.strokeStyle = 'rgba(80,0,10,0.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(40, 29); g.lineTo(60, 29); g.stroke();
    g.strokeStyle = 'rgba(255,200,200,0.35)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(66, 36); g.bezierCurveTo(74, 50, 74, 70, 64, 84); g.stroke();
    gloss(g, 34, 44, 11, 15, 0.65);
    // a small golden bell beside it: "פעמון זהב ורימון" on the hem of the me'il (Exodus 28:34)
    shade(g, 3, 2, 0.35);
    g.fillStyle = lin(g, 70, 70, 94, 96, GOLD);
    g.beginPath(); g.moveTo(82, 72); g.bezierCurveTo(90, 72, 92, 84, 95, 92); g.lineTo(69, 92); g.bezierCurveTo(72, 84, 74, 72, 82, 72); g.fill();
    noShade(g);
    g.fillStyle = '#8A5A10'; g.beginPath(); g.arc(82, 94, 3, 0, Math.PI * 2); g.fill();
  },
  function trumpets(g) {
    // the two silver trumpets (Numbers 10:2): long straight tubes with a flared bell
    const tube = (x0, y0, x1, y1) => {
      const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0);
      g.save(); g.translate(x0, y0); g.rotate(a);
      shade(g, 4, 3, 0.35);
      g.fillStyle = lin(g, 0, -12, 0, 12, SILVER);
      g.beginPath(); g.moveTo(0, -3.2); g.lineTo(L - 20, -3.2); g.bezierCurveTo(L - 8, -4, L - 3, -9, L, -14);
      g.lineTo(L, 14); g.bezierCurveTo(L - 3, 9, L - 8, 4, L - 20, 3.2); g.lineTo(0, 3.2); g.closePath(); g.fill();
      noShade(g);
      g.fillStyle = lin(g, 0, -6, 0, 6, SILVER);
      g.beginPath(); g.ellipse(2, 0, 3.5, 5.5, 0, 0, Math.PI * 2); g.fill();
      for (const t of [0.3, 0.55]) { g.beginPath(); g.ellipse(L * t, 0, 2.2, 4.6, 0, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = 'rgba(40,50,60,0.55)'; g.beginPath(); g.ellipse(L, 0, 2.4, 13, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(6, -1.6); g.lineTo(L - 22, -1.6); g.stroke();
      g.restore();
    };
    tube(42, 92, 14, 14); tube(58, 92, 86, 14);
  },
];

/* ── the light (5 in a row): the menorah's light, gathering a kind ── */
function light(g) {
  g.fillStyle = rad(g, 50, 52, 2, 48, [[0, 'rgba(255,255,240,1)'], [0.35, 'rgba(255,220,120,0.9)'], [0.7, 'rgba(255,170,40,0.35)'], [1, 'rgba(255,150,0,0)']]);
  g.beginPath(); g.arc(50, 52, 48, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,236,160,0.75)'; g.lineWidth = 2.2; g.lineCap = 'round';
  for (let q = 0; q < 12; q++) {
    const a = q * Math.PI / 6, r0 = 20, r1 = q % 2 ? 34 : 44;
    g.beginPath(); g.moveTo(50 + Math.cos(a) * r0, 52 + Math.sin(a) * r0); g.lineTo(50 + Math.cos(a) * r1, 52 + Math.sin(a) * r1); g.stroke();
  }
  g.fillStyle = lin(g, 0, 60, 0, 72, GOLD);
  g.beginPath(); g.ellipse(50, 66, 11, 5, 0, 0, Math.PI * 2); g.fill();
  flame(g, 50, 63, 30, 14);
}

/* ── the field objects ── */
function ashlar(g) {
  // a dressed ashlar with drafted margins and a flat boss (the Herodian way of dressing)
  shade(g, 5, 3);
  g.fillStyle = lin(g, 0, 18, 0, 30, [[0, '#FBF1D9'], [1, '#E3D2AC']]);
  g.beginPath(); g.moveTo(14, 30); g.lineTo(24, 18); g.lineTo(90, 18); g.lineTo(80, 30); g.closePath(); g.fill();
  g.fillStyle = lin(g, 80, 0, 92, 0, [[0, '#CDB98E'], [1, '#A89266']]);
  g.beginPath(); g.moveTo(80, 30); g.lineTo(90, 18); g.lineTo(90, 72); g.lineTo(80, 86); g.closePath(); g.fill();
  g.fillStyle = lin(g, 14, 30, 80, 86, [[0, '#F6E9C8'], [1, '#D6C195']]);
  g.fillRect(12, 30, 68, 56);
  noShade(g);
  g.fillStyle = lin(g, 20, 38, 72, 78, [[0, '#E9D8AE'], [1, '#C6AE7E']]);
  g.fillRect(21, 39, 50, 38);
  g.strokeStyle = 'rgba(110,85,40,0.45)'; g.lineWidth = 1.2; g.strokeRect(21, 39, 50, 38);
  g.strokeStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.moveTo(21, 39); g.lineTo(71, 39); g.stroke();
  g.strokeStyle = 'rgba(120,95,50,0.25)';
  for (let x = 16; x < 80; x += 4) { g.beginPath(); g.moveTo(x, 31); g.lineTo(x, 37); g.moveTo(x, 79); g.lineTo(x, 85); g.stroke(); }
}
function wstone(g) {
  // a whole field stone, unhewn (Middot 3:4: no iron touched it)
  shade(g, 5, 3);
  g.fillStyle = rad(g, 40, 40, 4, 50, [[0, '#EDE6D6'], [0.6, '#B9AE98'], [1, '#7D7462']]);
  g.beginPath(); g.moveTo(22, 40);
  g.bezierCurveTo(24, 20, 56, 12, 74, 24); g.bezierCurveTo(92, 36, 92, 64, 80, 78);
  g.bezierCurveTo(66, 92, 30, 94, 18, 78); g.bezierCurveTo(10, 66, 14, 50, 22, 40); g.fill();
  noShade(g);
  g.strokeStyle = 'rgba(90,80,60,0.35)'; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(34, 60); g.bezierCurveTo(46, 56, 58, 66, 70, 60); g.stroke();
  gloss(g, 40, 34, 14, 8, 0.45);
}
function log(g) {
  // a cedar log for the sea of Jaffa (Ezra 3:7)
  shade(g, 5, 3);
  g.fillStyle = lin(g, 0, 30, 0, 74, [[0, '#B8703E'], [0.45, '#8A4A22'], [1, '#4E250E']]);
  g.beginPath(); g.roundRect(10, 32, 70, 40, 18); g.fill();
  noShade(g);
  g.strokeStyle = 'rgba(40,15,0,0.45)'; g.lineWidth = 1.5;
  for (const y of [42, 52, 62]) { g.beginPath(); g.moveTo(16, y); g.bezierCurveTo(34, y - 3, 52, y + 3, 72, y); g.stroke(); }
  g.fillStyle = rad(g, 78, 52, 1, 22, [[0, '#F2C58E'], [0.5, '#D8995C'], [1, '#9C5A2A']]);
  g.beginPath(); g.ellipse(78, 52, 13, 20, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(120,60,20,0.55)'; g.lineWidth = 1.1;
  for (const r of [4, 8, 12]) { g.beginPath(); g.ellipse(78, 52, r * 0.65, r, 0, 0, Math.PI * 2); g.stroke(); }
  g.fillStyle = '#4F7A3A'; g.beginPath(); g.ellipse(26, 30, 7, 3.5, -0.5, 0, Math.PI * 2); g.fill();
}
function nugget(g) {
  shade(g, 5, 3);
  g.fillStyle = lin(g, 20, 20, 80, 86, GOLD);
  g.beginPath();
  for (const [x, y] of [[30, 30], [52, 20], [74, 30], [84, 54], [72, 80], [44, 86], [22, 70], [18, 46]]) g.lineTo(x, y);
  g.closePath(); g.fill();
  noShade(g);
  g.fillStyle = 'rgba(255,255,220,0.55)';
  g.beginPath(); g.moveTo(30, 30); g.lineTo(52, 20); g.lineTo(50, 44); g.lineTo(32, 48); g.closePath(); g.fill();
  g.fillStyle = 'rgba(120,70,0,0.3)';
  g.beginPath(); g.moveTo(84, 54); g.lineTo(72, 80); g.lineTo(56, 60); g.closePath(); g.fill();
  sparkle(g, 64, 32, 9);
}
function sparkle(g, x, y, r) {
  g.save(); g.fillStyle = 'rgba(255,255,255,0.95)';
  g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r * 0.22, y - r * 0.22); g.lineTo(x + r, y); g.lineTo(x + r * 0.22, y + r * 0.22);
  g.lineTo(x, y + r); g.lineTo(x - r * 0.22, y + r * 0.22); g.lineTo(x - r, y); g.lineTo(x - r * 0.22, y - r * 0.22); g.closePath(); g.fill();
  g.restore();
}
/* a silver shekel riding on a vessel: the three pomegranates of the Jerusalem shekel (no pagan image) */
function coin(g) {
  shade(g, 3, 2, 0.35);
  g.fillStyle = rad(g, 44, 44, 2, 34, SILVER);
  g.beginPath(); g.arc(50, 50, 32, 0, Math.PI * 2); g.fill();
  noShade(g);
  g.strokeStyle = 'rgba(70,80,90,0.7)'; g.lineWidth = 3; g.beginPath(); g.arc(50, 50, 26, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(60,70,80,0.9)'; g.lineWidth = 3.4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(50, 70); g.lineTo(50, 44); g.moveTo(50, 52); g.lineTo(38, 40); g.moveTo(50, 52); g.lineTo(62, 40); g.stroke();
  g.fillStyle = 'rgba(60,70,80,0.95)';
  for (const [x, y] of [[50, 36], [36, 36], [64, 36]]) { g.beginPath(); g.arc(x, y, 5.5, 0, Math.PI * 2); g.fill(); }
}

/* ── blockers (the cell holds no piece): bedrock · a standing cedar · copper ore ── */
function blk(g, field, n) {
  if (field === 'forest') {
    g.fillStyle = lin(g, 0, 70, 0, 100, [[0, '#6E5A34'], [1, '#4A3A20']]); g.fillRect(2, 74, 96, 24);
    shade(g, 4, 2, 0.35);
    g.fillStyle = lin(g, 0, 60, 0, 96, [[0, '#7A4A26'], [1, '#4A2A12']]); g.fillRect(44, 60, 12, 34);
    const tiers = [[80, 44], [60, 36], [42, 28]].slice(0, n + 0);
    tiers.forEach(([y, w], q) => {
      g.fillStyle = lin(g, 0, y - 22, 0, y, [[0, q === n - 1 ? '#5FA05A' : '#4C8A4A'], [1, '#1E4A26']]);
      g.beginPath(); g.moveTo(50 - w, y); g.bezierCurveTo(50 - w * 0.6, y - 14, 50 - w * 0.2, y - 20, 50, y - 24);
      g.bezierCurveTo(50 + w * 0.2, y - 20, 50 + w * 0.6, y - 14, 50 + w, y); g.closePath(); g.fill();
    });
    noShade(g);
    return;
  }
  const ore = field === 'gold';
  const base = ore ? [[0, ['#6B6157', '#554C43', '#3E3731'][n - 1]], [1, '#231E1A']] : [[0, ['#DCD3C3', '#BDB09A', '#9A8C76'][n - 1]], [1, ['#A1937C', '#7C6D57', '#574A3A'][n - 1]]];
  shade(g, 4, 3, 0.4);
  g.fillStyle = lin(g, 0, 0, 0, 100, base);
  g.beginPath(); g.roundRect(4, 4, 92, 92, 10); g.fill();
  noShade(g);
  g.strokeStyle = ore ? 'rgba(0,0,0,0.55)' : 'rgba(55,40,22,0.6)'; g.lineWidth = 3; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(10, 8); g.lineTo(90, 8); g.stroke();
  g.strokeStyle = ore ? 'rgba(0,0,0,0.35)' : 'rgba(90,70,40,0.35)'; g.lineWidth = 2;
  g.lineWidth = 3.2;
  for (let q = 0; q < n; q++) { const y = 34 + q * 20; g.beginPath(); g.moveTo(8, y); g.bezierCurveTo(30, y - 5, 60, y + 5, 92, y - 2); g.stroke(); }
  if (ore) {
    g.strokeStyle = '#3FA88A'; g.lineWidth = 3.2;
    g.beginPath(); g.moveTo(16, 70); g.lineTo(34, 58); g.lineTo(46, 64); g.lineTo(66, 44); g.stroke();
    g.strokeStyle = '#E38B3C'; g.lineWidth = 2.6;
    g.beginPath(); g.moveTo(56, 84); g.lineTo(70, 70); g.lineTo(86, 72); g.stroke();
    for (let q = 0; q < n; q++) { g.fillStyle = '#E8A04C'; g.beginPath(); g.arc(24 + q * 24, 26, 3.4, 0, Math.PI * 2); g.fill(); }
  } else {
    g.strokeStyle = 'rgba(80,60,30,0.55)'; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(62, 8); g.lineTo(56, 26); g.lineTo(64, 38); g.stroke();
  }
  gloss(g, 28, 16, 20, 7, 0.4);
}
function earth(g, n) {
  g.fillStyle = lin(g, 0, 0, 0, 100, n === 2 ? [[0, '#6A4A2C'], [1, '#4A301A']] : [[0, '#9A7248'], [1, '#76542F']]);
  g.beginPath(); g.roundRect(1, 1, 98, 98, 8); g.fill();
  g.fillStyle = n === 2 ? 'rgba(30,18,8,0.45)' : 'rgba(60,40,20,0.35)';
  for (const [x, y, r] of [[18, 22, 4], [70, 16, 3], [40, 70, 5], [82, 64, 4], [26, 86, 3], [60, 44, 2.5]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
}
function nug(g) { g.globalAlpha = 0.85; g.save(); g.translate(62, 62); g.scale(0.36, 0.36); nugget(g); g.restore(); g.globalAlpha = 1; }
function vine(g) {
  g.strokeStyle = '#2F6B2A'; g.lineWidth = 4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(6, 30); g.bezierCurveTo(30, 10, 60, 50, 94, 26); g.stroke();
  g.beginPath(); g.moveTo(6, 74); g.bezierCurveTo(36, 96, 64, 56, 94, 78); g.stroke();
  g.beginPath(); g.moveTo(28, 6); g.bezierCurveTo(12, 40, 44, 60, 26, 94); g.stroke();
  g.beginPath(); g.moveTo(74, 6); g.bezierCurveTo(90, 40, 56, 62, 76, 94); g.stroke();
  g.fillStyle = '#4E9A3E';
  for (const [x, y, a] of [[20, 20, 0.6], [80, 30, -0.4], [16, 78, -0.6], [84, 80, 0.5], [50, 40, 0.2], [46, 70, -0.3]]) {
    g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.ellipse(0, 0, 8, 4.5, 0, 0, Math.PI * 2); g.fill(); g.restore();
  }
  g.fillStyle = '#6A2A6E'; for (const [x, y] of [[60, 20], [64, 24], [58, 26]]) { g.beginPath(); g.arc(x, y, 3.2, 0, Math.PI * 2); g.fill(); }
}
/* special badges: 1 מקבת (a mason's hammer: a row) · 2 אזמל (a chisel: a column) · 3 יתד (a wedge: 3×3) */
function badge(g, kind) {
  g.save();
  g.fillStyle = rad(g, 50, 50, 10, 50, [[0, 'rgba(255,240,190,0)'], [0.75, 'rgba(255,215,110,0.0)'], [1, 'rgba(255,200,80,0.55)']]);
  if (kind === 3) { g.beginPath(); g.arc(50, 50, 48, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = 'rgba(255,236,170,0.9)';
  const arrow = (x, y, a) => { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(8, 0); g.lineTo(-4, -7); g.lineTo(-4, 7); g.closePath(); g.fill(); g.restore(); };
  if (kind === 1) { arrow(94, 50, 0); arrow(6, 50, Math.PI); }
  if (kind === 2) { arrow(50, 94, Math.PI / 2); arrow(50, 6, -Math.PI / 2); }
  // the tool in a small medallion at the corner
  g.translate(18, 18);
  shade(g, 3, 1, 0.4);
  g.fillStyle = rad(g, -3, -3, 1, 16, [[0, '#FFF6D8'], [1, '#C98F2C']]);
  g.beginPath(); g.arc(0, 0, 15, 0, Math.PI * 2); g.fill();
  noShade(g);
  g.strokeStyle = '#4A2E10'; g.fillStyle = '#4A2E10'; g.lineWidth = 3; g.lineCap = 'round';
  if (kind === 1) { g.beginPath(); g.moveTo(-6, 8); g.lineTo(4, -2); g.stroke(); g.save(); g.translate(5, -4); g.rotate(-0.8); g.fillRect(-8, -3.5, 16, 7); g.restore(); }
  else if (kind === 2) { g.beginPath(); g.moveTo(-7, 7); g.lineTo(3, -3); g.stroke(); g.beginPath(); g.moveTo(3, -9); g.lineTo(9, -3); g.lineTo(2, 0); g.lineTo(0, -2); g.closePath(); g.fill(); }
  else { g.beginPath(); g.moveTo(-8, -8); g.lineTo(8, -8); g.lineTo(0, 10); g.closePath(); g.fill(); }
  g.restore();
}

const DRAW = {
  v0: VESSEL[0], v1: VESSEL[1], v2: VESSEL[2], v3: VESSEL[3], v4: VESSEL[4], v5: VESSEL[5],
  light, ashlar, wstone, log, nugget, coin, nug, vine,
  earth1: (g) => earth(g, 1), earth2: (g) => earth(g, 2),
  halo: (g) => { g.fillStyle = rad(g, 50, 50, 0, 50, [[0, 'rgba(255,248,210,0.95)'], [0.45, 'rgba(255,214,110,0.45)'], [1, 'rgba(255,190,60,0)']]); g.fillRect(0, 0, 100, 100); },
  b1: (g) => badge(g, 1), b2: (g) => badge(g, 2), b3: (g) => badge(g, 3),
};
function paint(key, px) {
  const c = mk(px, px), g = c.getContext('2d');
  g.scale(px / 100, px / 100);
  const m = /^blk:(\w+):(\d)$/.exec(key);
  if (m) blk(g, m[1], +m[2]);
  else if (DRAW[key]) DRAW[key](g);
  return c;
}
export function createArt(px) {
  const cache = new Map();
  return {
    px,
    get(key) { let c = cache.get(key); if (!c) { c = paint(key, px); cache.set(key, c); } return c; },
  };
}
/* icons for the HUD: the materials and the vessels */
const ICON_KEY = { stone: 'ashlar', cedar: 'blk:forest:3', gold: 'nugget', silver: 'coin', bronze: 'blk:gold:1', wstone: 'wstone', log: 'log' };
const icons = new Map();
export function ICON(key, size = 28) {
  const dpr = Math.min(2, (globalThis.devicePixelRatio || 1));
  const k = key + ':' + size;
  let c = icons.get(k);
  if (!c) { c = paint(ICON_KEY[key] || key, Math.round(size * dpr)); icons.set(k, c); }
  return c;
}
/* the field's scene behind the board (painted once per size): the quarry's cut cliffs, the cedars of Lebanon, a lamplit mine */
export function scene(g, field, W, H) {
  const hill = (y0, amp, col, seed) => {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) g.lineTo(x, y0 + Math.sin(x / 70 + seed) * amp + Math.sin(x / 23 + seed * 2) * amp * 0.3);
    g.lineTo(W, H); g.fill();
  };
  if (field === 'quarry') {
    hill(H * 0.2, 10, 'rgba(250,226,180,0.35)', 1);
    // cut cliff faces: stepped benches of pale limestone with the marks of the blocks taken out
    for (let q = 0; q < 4; q++) {
      const y = H * (0.1 + q * 0.055), x0 = W * (0.5 + q * 0.06);
      g.fillStyle = `rgba(${248 - q * 14},${232 - q * 16},${200 - q * 18},0.55)`; g.fillRect(x0, y, W - x0, H * 0.06);
      g.strokeStyle = 'rgba(120,90,50,0.3)'; g.lineWidth = 1;
      for (let x = x0 + 10; x < W; x += 26) g.strokeRect(x, y + 4, 20, H * 0.06 - 8);
    }
    g.fillStyle = 'rgba(255,240,205,0.5)';
    for (const [x, y, w] of [[0.1, 0.86, 30], [0.2, 0.9, 22], [0.82, 0.88, 34]]) { g.fillRect(W * x, H * y, w, w * 0.6); }
  } else if (field === 'forest') {
    hill(H * 0.12, 18, 'rgba(200,215,230,0.45)', 2);
    g.fillStyle = 'rgba(255,255,255,0.55)';
    for (const x of [0.2, 0.55, 0.85]) { g.beginPath(); g.moveTo(W * x - 26, H * 0.12 + 8); g.lineTo(W * x, H * 0.08); g.lineTo(W * x + 26, H * 0.12 + 8); g.fill(); }
    for (let row = 0; row < 3; row++) {
      const y = H * (0.2 + row * 0.04), s = 0.6 + row * 0.25;
      g.fillStyle = ['rgba(40,90,60,0.45)', 'rgba(30,72,46,0.6)', 'rgba(20,52,32,0.75)'][row];
      for (let x = -10 + row * 13; x < W + 20; x += 34 * s) {
        for (let t = 0; t < 3; t++) { const w = (18 - t * 4) * s, ty = y - t * 9 * s; g.beginPath(); g.moveTo(x - w, ty); g.lineTo(x, ty - 12 * s); g.lineTo(x + w, ty); g.fill(); }
      }
    }
    g.fillStyle = 'rgba(90,150,200,0.35)'; g.fillRect(0, H * 0.93, W, H * 0.07);
  } else {
    // the mine: timber frames and lamps
    g.strokeStyle = 'rgba(120,76,36,0.8)'; g.lineWidth = 10;
    for (const x of [W * 0.06, W * 0.94]) { g.beginPath(); g.moveTo(x, H); g.lineTo(x, H * 0.08); g.stroke(); }
    g.beginPath(); g.moveTo(0, H * 0.09); g.lineTo(W, H * 0.09); g.stroke();
    for (const [x, y] of [[0.12, 0.16], [0.88, 0.16], [0.12, 0.86], [0.88, 0.86]]) {
      g.fillStyle = rad(g, W * x, H * y, 2, 70, [[0, 'rgba(255,214,120,0.55)'], [1, 'rgba(255,170,60,0)']]);
      g.beginPath(); g.arc(W * x, H * y, 70, 0, Math.PI * 2); g.fill();
      flame(g, W * x, H * y + 6, 14);
    }
    g.fillStyle = 'rgba(255,215,94,0.7)';
    for (let q = 0; q < 26; q++) { const x = (q * 97) % W, y = H * (0.12 + ((q * 53) % 80) / 100); g.fillRect(x, y, 2, 2); }
  }
}
export const KIND_HE = ['מנורה', 'מזבח', 'פך השמן', 'לחם הפנים', 'רימון', 'חצוצרות'];
