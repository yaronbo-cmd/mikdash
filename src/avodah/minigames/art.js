/* ─────────────────────────────────────────────────────────────────────────────
 * art.js: the illustrated card style: one warm palette (lit limestone, linen, gold, dawn) for the games the 3D
 * world cannot carry (the lotteries' fingers, the musaf count, the Levites' song) and for every SVG fallback.
 *
 *   ensureArt(doc)                  gradients (a hidden <svg><defs>) + scoped CSS, once per document
 *   hall(svg, w, h, { wall })       a hewn-stone hall: ashlar wall with drafted margins, a warm floor, torch glow
 *   raisedHand(parent, x, y, s)     → { set(n) } a hand held up with n fingers (1 or 2; 0 hides it)
 *   beast(parent, kind, x, y, s)    a calm, standing animal in side view: bull · ram · lamb · goat
 *   levite(parent, x, y, s)         a Levite with a kinor (lyre)
 *   person(parent, x, y, s, tone)   one of the people in the Azara (bows with .av-crowd.bow)
 *
 * The figures are illustrations, not reconstructions; no animal is ever shown hurt (PROJECT.md §2.3).
 * ──────────────────────────────────────────────────────────────────────────── */
const SVGNS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs = {}, parent) {   // (common.js has the same helper; kept local so the two modules stay acyclic)
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

const DEFS = `
<linearGradient id="avaRobe" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E9DDC4"/><stop offset=".45" stop-color="#FFFDF6"/><stop offset="1" stop-color="#DCCDAE"/></linearGradient>
<linearGradient id="avaTurban" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E6DCC8"/></linearGradient>
<radialGradient id="avaSkin" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#EDC39A"/><stop offset="1" stop-color="#C08A5F"/></radialGradient>
<linearGradient id="avaSash" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7A2E5C"/><stop offset=".33" stop-color="#7A2E5C"/><stop offset=".33" stop-color="#2F4F8A"/><stop offset=".66" stop-color="#2F4F8A"/><stop offset=".66" stop-color="#A8323A"/><stop offset="1" stop-color="#A8323A"/></linearGradient>
<linearGradient id="avaWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CDB386"/><stop offset="1" stop-color="#E2CDA4"/></linearGradient>
<linearGradient id="avaFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9D7B2"/><stop offset="1" stop-color="#D9C095"/></linearGradient>
<radialGradient id="avaGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE3A3" stop-opacity=".55"/><stop offset="1" stop-color="#FFE3A3" stop-opacity="0"/></radialGradient>
<linearGradient id="avaGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3CF6E"/><stop offset="1" stop-color="#B8862A"/></linearGradient>
<linearGradient id="avaWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8743F"/><stop offset="1" stop-color="#7A4F28"/></linearGradient>
<linearGradient id="avaWool" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF4E4"/><stop offset="1" stop-color="#DCCDB0"/></linearGradient>
<linearGradient id="avaHide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8683A"/><stop offset="1" stop-color="#6E4122"/></linearGradient>
<linearGradient id="avaGoat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E4A3A"/><stop offset="1" stop-color="#352820"/></linearGradient>`;

const CSS = `
.av-mg .av-kohen .av-robe{fill:url(#avaRobe);stroke:#A48E68;stroke-width:.9}
.av-mg .av-kohen.hl .av-robe{stroke:#E0A83A;stroke-width:2.1}
.av-mg .av-kohen.won .av-robe{fill:#FFF1C4;stroke:#E0A83A;stroke-width:2.5}
.av-mg .av-kohen .av-sleeve{fill:url(#avaRobe);stroke:#A48E68;stroke-width:.7}
.av-mg .av-kohen .av-fold{fill:none;stroke:#CDBB98;stroke-width:.8;stroke-linecap:round}
.av-mg .av-kohen .av-face,.av-mg .av-hand{fill:url(#avaSkin);stroke:#9C7452;stroke-width:.5}
.av-mg .av-kohen .av-beard{fill:#5B3E26;opacity:.8}
.av-mg .av-kohen .av-turban{fill:url(#avaTurban);stroke:#B8A98C;stroke-width:.6}
.av-mg .av-kohen .av-belt{fill:url(#avaSash)}
.av-mg .av-shadow{fill:rgba(70,45,15,.16)}
.av-mg .av-hall-wall{fill:url(#avaWall)}
.av-mg .av-ashlar{fill:#D8C194;stroke:#B99E70;stroke-width:.8}
.av-mg .av-ashlar-in{fill:#E6D3AC}
.av-mg .av-hall-floor{fill:url(#avaFloor)}
.av-mg .av-slab{fill:none;stroke:#CDB68C;stroke-width:.7}
.av-mg .av-glow{fill:url(#avaGlow)}
.av-mg .av-rhand{transition:opacity .2s}
.av-mg .av-rhand.off{opacity:0}
.av-mg .av-rhand .av-fg{fill:url(#avaSkin);stroke:#9C7452;stroke-width:.5}
.av-mg .av-beast .b-body{stroke:rgba(60,35,15,.45);stroke-width:.8}
.av-mg .av-beast .b-leg{stroke-width:2.4;stroke-linecap:round}
.av-mg .av-beast .b-horn{fill:none;stroke:#E9DBC0;stroke-width:1.6;stroke-linecap:round}
.av-mg .av-beast .b-eye{fill:#2A1C10}
.av-mg .av-levite .av-robe{fill:url(#avaRobe);stroke:#8A9AB5;stroke-width:.9}
.av-mg .av-levite .l-band{fill:#5E7FA8}
.av-mg .av-levite .l-hair{fill:#4A3322}
.av-mg .av-levite .l-kinor{fill:none;stroke:url(#avaWood);stroke-width:1.8;stroke-linecap:round}
.av-mg .av-levite .l-str{stroke:#F3E3B5;stroke-width:.5}
.av-mg .av-duchan{fill:#D9C39A;stroke:#B39A6E;stroke-width:.8}
.av-mg .av-levite .l-cym{fill:url(#avaGold);stroke:#8A6420;stroke-width:.6}
.av-mg .av-levite .l-pipe{stroke:#B08A4E;stroke-width:1.8;stroke-linecap:round}
.av-mg .av-levite .l-cyms{transform-box:fill-box;transform-origin:50% 50%}
.av-mg .av-levite.hl .av-robe{stroke:#E0A83A;stroke-width:2.2}
.av-mg .av-levite.l-tziltzal.hit .l-cyms{animation:avCym .35s ease-out 3}
@keyframes avCym{50%{transform:scale(1.35)}}
.av-mg .av-crowd .av-person{transform-box:fill-box;transform-origin:50% 100%}
.av-mg .av-person .p-body{stroke:rgba(60,35,15,.35);stroke-width:.6}
.av-mg .av-person .p-head{fill:url(#avaSkin)}
.av-mg .av-lane{fill:url(#avaWood);stroke:#6E4526;stroke-width:1}
.av-mg .av-lane-str{stroke:#F3E3B5;stroke-width:1;opacity:.8}
.av-mg .av-hitline{fill:url(#avaGold)}
.av-mg svg .av-note{fill:#2F5E8E;stroke:#F3E3B5;stroke-width:1.5}
`;

export function ensureArt(doc = document) {
  if (!doc || !doc.head || doc.getElementById('av-art-css')) return;
  const s = doc.createElement('style');
  s.id = 'av-art-css'; s.textContent = CSS;
  doc.head.appendChild(s);
  const d = doc.createElement('div');
  d.id = 'av-art-defs';
  d.setAttribute('aria-hidden', 'true');
  d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  d.innerHTML = `<svg width="0" height="0" focusable="false"><defs>${DEFS}</defs></svg>`;
  doc.body.appendChild(d);
}

/** a hewn-stone hall behind a scene: the wall (ashlar with drafted margins) over the top `wall` px, then the floor */
export function hall(svg, w, h, { wall = 46 } = {}) {
  ensureArt(svg.ownerDocument);
  const g = svgEl('g', { class: 'av-art-hall', 'aria-hidden': 'true' }, svg);
  svgEl('rect', { x: 0, y: 0, width: w, height: wall, class: 'av-hall-wall' }, g);
  const bh = wall / 2;
  for (let r = 0; r < 2; r++) {
    for (let x = r ? -24 : 0; x < w; x += 48) {
      svgEl('rect', { x: x + 1, y: r * bh + 1, width: 46, height: bh - 2, rx: 1, class: 'av-ashlar' }, g);
      svgEl('rect', { x: x + 4.5, y: r * bh + 4.5, width: 39, height: bh - 9, rx: 1, class: 'av-ashlar-in' }, g);
    }
  }
  svgEl('rect', { x: 0, y: wall, width: w, height: h - wall, class: 'av-hall-floor' }, g);
  for (let y = wall + 26; y < h; y += 34) svgEl('line', { x1: 0, y1: y, x2: w, y2: y, class: 'av-slab' }, g);
  svgEl('ellipse', { cx: w / 2, cy: h * 0.55, rx: w * 0.55, ry: h * 0.5, class: 'av-glow' }, g);
  return g;
}

/** a hand held up, with one or two fingers (the lottery: "ומה הן מוציאין, אחת או שתים", Yoma 2:1) */
export function raisedHand(parent, x, y, s = 1) {
  ensureArt(parent.ownerDocument);
  const g = svgEl('g', { class: 'av-rhand off', transform: `translate(${x} ${y}) scale(${s})`, 'aria-hidden': 'true' }, parent);
  svgEl('rect', { x: -3.2, y: 0, width: 6.4, height: 6, rx: 2.4, class: 'av-fg' }, g);                        // the fist
  svgEl('rect', { x: -1.4, y: 5, width: 2.8, height: 5, rx: 1.2, class: 'av-fg' }, g);                        // the wrist
  const f1 = svgEl('rect', { x: -2.9, y: -6, width: 2.4, height: 7.5, rx: 1.2, class: 'av-fg' }, g);
  const f2 = svgEl('rect', { x: 0.5, y: -5.4, width: 2.4, height: 7, rx: 1.2, class: 'av-fg' }, g);
  return {
    g,
    set(n) { g.classList.toggle('off', !n); f1.style.display = n >= 1 ? '' : 'none'; f2.style.display = n >= 2 ? '' : 'none'; },
  };
}

/** a calm, standing animal (side view, facing right). kinds: bull · ram · lamb · goat */
export function beast(parent, kind, x, y, s = 1) {
  ensureArt(parent.ownerDocument);
  const g = svgEl('g', { class: `av-beast ${kind}`, transform: `translate(${x} ${y}) scale(${s})`, 'aria-hidden': 'true' }, parent);
  const fill = kind === 'bull' ? 'url(#avaHide)' : kind === 'goat' ? 'url(#avaGoat)' : 'url(#avaWool)';
  const leg = kind === 'bull' ? '#5A3519' : kind === 'goat' ? '#2B2019' : '#8C7658';
  const big = kind === 'bull' ? 1.25 : kind === 'lamb' ? 0.82 : 1;
  svgEl('ellipse', { cx: 0, cy: 13 * big + 1, rx: 13 * big, ry: 2, class: 'av-shadow' }, g);
  for (const lx of [-8, -4, 5, 9]) svgEl('line', { x1: lx * big, y1: 3 * big, x2: lx * big, y2: 13 * big, class: 'b-leg', stroke: leg }, g);
  if (kind === 'ram' || kind === 'lamb') {
    // wool: a cloud of overlapping curls
    const d = `M${-12 * big} ${2 * big} q${-2 * big} ${-8 * big} ${4 * big} ${-9 * big} q${3 * big} ${-5 * big} ${8 * big} ${-2 * big} q${4 * big} ${-4 * big} ${8 * big} 0 q${6 * big} 0 ${5 * big} ${6 * big} q${2 * big} ${6 * big} ${-5 * big} ${7 * big} l${-16 * big} 0 q${-5 * big} 0 ${-4 * big} ${-2 * big} z`;
    svgEl('path', { d, fill, class: 'b-body' }, g);
  } else {
    svgEl('path', { d: `M${-12 * big} ${-3 * big} q0 ${-5 * big} ${6 * big} ${-5 * big} l${13 * big} 0 q${6 * big} 0 ${6 * big} ${6 * big} l0 ${3 * big} q0 ${4 * big} ${-5 * big} ${4 * big} l${-15 * big} 0 q${-5 * big} 0 ${-5 * big} ${-5 * big} z`, fill, class: 'b-body' }, g);
    svgEl('path', { d: `M${-12 * big} ${-2 * big} q${-4 * big} ${2 * big} ${-3 * big} ${8 * big}`, fill: 'none', stroke: leg, 'stroke-width': 1.4, 'stroke-linecap': 'round' }, g);   // the tail
  }
  // the head, facing right
  const hx = 13 * big, hy = -5 * big;
  const headFill = kind === 'ram' ? '#3E3128' : kind === 'lamb' ? '#EADDC4' : fill;
  svgEl('ellipse', { cx: hx, cy: hy, rx: 4.6 * big, ry: 3.6 * big, fill: headFill, class: 'b-body', transform: `rotate(25 ${hx} ${hy})` }, g);
  svgEl('circle', { cx: hx + 1.2 * big, cy: hy - 1 * big, r: 0.7, class: 'b-eye' }, g);
  if (kind === 'bull') svgEl('path', { d: `M${hx - 2} ${hy - 3} q-1 -4 -4 -4 M${hx + 1} ${hy - 3.4} q1 -4 4 -4.4`, class: 'b-horn' }, g);
  if (kind === 'ram') svgEl('path', { d: `M${hx - 1.5} ${hy - 2.5} a3.2 3.2 0 1 0 -3.2 3.2 a1.8 1.8 0 1 0 1.8 -1.8`, class: 'b-horn' }, g);
  if (kind === 'goat') {
    svgEl('path', { d: `M${hx - 1} ${hy - 3} q-2 -5 -6 -6`, class: 'b-horn' }, g);
    svgEl('path', { d: `M${hx + 2.5} ${hy + 3} l-0.6 3.4 l1.6 -2.6 z`, fill: '#2B2019' }, g);           // the beard
  }
  return g;
}

/** a Levite on the duchan with his instrument: 'kinor' (a lyre, the default) · 'nevel' (a tall harp) · 'tziltzal' (Ben
 *  Arza's pair of cymbals) · 'chalil' (a reed pipe) — ── avoda12 ── the song's instruments (Arachin 2:3, 2:5; Tamid 7:3) */
export function levite(parent, x, y, s = 1, kind = 'kinor') {
  ensureArt(parent.ownerDocument);
  const g = svgEl('g', { class: `av-levite l-${kind}`, transform: `translate(${x} ${y}) scale(${s})`, 'aria-hidden': 'true' }, parent);
  svgEl('path', { d: 'M-8 28 L-6.5 3 Q0 -2 6.5 3 L8 28 Z', class: 'av-robe' }, g);
  svgEl('rect', { x: -7, y: 11, width: 14, height: 2.4, rx: 1, class: 'l-band' }, g);
  svgEl('circle', { cx: 0, cy: -4.5, r: 4.8, class: 'av-hand' }, g);
  svgEl('path', { d: 'M-4.8 -5 Q0 -11.5 4.8 -5 Q2.5 -8 0 -8 Q-2.5 -8 -4.8 -5 Z', class: 'l-hair' }, g);
  if (kind === 'nevel') {
    // the nevel: taller than the kinor, standing beside him (an illustration: its shape is not described in the Mishnah)
    svgEl('path', { d: 'M3 27 L3 -12 Q12 -10 12 2 L12 22 Q12 27 3 27 Z', class: 'l-kinor' }, g);
    for (const sx of [5.2, 7.4, 9.6]) svgEl('line', { x1: sx, y1: -9 + (sx - 5) * 0.8, x2: sx, y2: 25, class: 'l-str' }, g);
    svgEl('circle', { cx: 4.5, cy: 12, r: 1.6, class: 'av-hand' }, g);
  } else if (kind === 'tziltzal') {
    // the cymbals, one in each hand, raised to strike
    const cg = svgEl('g', { class: 'l-cyms' }, g);   // (animated as a group: the ellipses keep their own rotation)
    svgEl('ellipse', { cx: -7.5, cy: 1, rx: 4, ry: 1.6, class: 'l-cym', transform: 'rotate(-60 -7.5 1)' }, cg);
    svgEl('ellipse', { cx: 7.5, cy: 1, rx: 4, ry: 1.6, class: 'l-cym', transform: 'rotate(60 7.5 1)' }, cg);
    svgEl('circle', { cx: -6.6, cy: 3.6, r: 1.6, class: 'av-hand' }, g);
    svgEl('circle', { cx: 6.6, cy: 3.6, r: 1.6, class: 'av-hand' }, g);
  } else if (kind === 'chalil') {
    // the chalil held to the lips, pointing down and forward
    svgEl('line', { x1: 0.5, y1: -2, x2: 7, y2: 14, class: 'l-pipe' }, g);
    svgEl('circle', { cx: 3.4, cy: 5, r: 1.5, class: 'av-hand' }, g);
    svgEl('circle', { cx: 5.6, cy: 10.5, r: 1.5, class: 'av-hand' }, g);
  } else {
    // the kinor, held against the chest
    svgEl('path', { d: 'M-5 20 Q-9 8 -6 1 M5 20 Q9 8 6 1 M-6 1.5 L6 1.5 M-5 20 L5 20', class: 'l-kinor' }, g);
    for (const sx of [-2.6, 0, 2.6]) svgEl('line', { x1: sx, y1: 2, x2: sx, y2: 19.5, class: 'l-str' }, g);
    svgEl('circle', { cx: 5, cy: 13, r: 1.6, class: 'av-hand' }, g);
  }
  return g;
}

/** one of the people (Israel) standing in the Azara */
export function person(parent, x, y, s = 1, tone = 0) {
  ensureArt(parent.ownerDocument);
  const TONES = ['#8E6A48', '#6F7F5A', '#7E5A6E', '#A0784A', '#5E6E86'];
  const g = svgEl('g', { class: 'av-person', transform: `translate(${x} ${y}) scale(${s})` }, parent);
  svgEl('path', { d: 'M-6.5 18 L-5 2 Q0 -1.5 5 2 L6.5 18 Z', class: 'p-body', fill: TONES[tone % TONES.length] }, g);
  svgEl('circle', { cx: 0, cy: -3, r: 4, class: 'p-head' }, g);
  svgEl('path', { d: 'M-4.6 -3 Q-4.6 -8.4 0 -8.4 Q4.6 -8.4 4.6 -3 L4.2 2 L3 -2.5 Q0 -5 -3 -2.5 L-4.2 2 Z', fill: '#EFE6D2', stroke: 'rgba(60,35,15,.3)', 'stroke-width': 0.5 }, g);   // a head cloth
  return g;
}
