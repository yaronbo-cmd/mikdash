/* ─────────────────────────────────────────────────────────────────────────────
 * kings/map.js — the hand-drawn sea chart (SVG): coasts, rivers, routes, the courts' pins, and the ships, carts and
 * caravans moving on it. buildChart() → an SVG string; bindChart(svg) → { update(voyages, now) }.
 * ──────────────────────────────────────────────────────────────────────────── */
import { W, H, proj, PLACES, MED, ISLANDS, SEAS, LAKES, RIVERS, WATER_NAMES, PATHS } from './geo.js';
import { GLYPH, EMBLEMS } from './art.js';
import { PARTNERS } from './data.js';
import { phase } from './logic.js';

const f1 = (v) => Math.round(v * 10) / 10;
const projAll = (list) => list.map((q) => proj(...q));
/** a smooth path through points (quadratic curves via the midpoints): the hand-drawn look */
function smooth(p, closed) {
  if (p.length < 3) return 'M' + p.map((q) => f1(q[0]) + ' ' + f1(q[1])).join('L');
  const n = p.length; const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d;
  if (closed) {
    const m0 = mid(p[n - 1], p[0]); d = `M${f1(m0[0])} ${f1(m0[1])}`;
    for (let i = 0; i < n; i++) { const m = mid(p[i], p[(i + 1) % n]); d += `Q${f1(p[i][0])} ${f1(p[i][1])} ${f1(m[0])} ${f1(m[1])}`; }
    return d + 'Z';
  }
  d = `M${f1(p[0][0])} ${f1(p[0][1])}`;
  for (let i = 1; i < n - 1; i++) { const m = mid(p[i], p[i + 1]); d += `Q${f1(p[i][0])} ${f1(p[i][1])} ${f1(m[0])} ${f1(m[1])}`; }
  return d + `L${f1(p[n - 1][0])} ${f1(p[n - 1][1])}`;
}

/** Court pins sit on their place, except Tyre, which stands out to sea on a leader line (Akko and Sidon are close). */
const PIN_OFF = { tyre: [-34, 4] };
export function pinAt(pid) {
  const p = PARTNERS.find((x) => x.id === pid); const [x, y] = proj(...PLACES[p.place].ll); const o = PIN_OFF[pid] || [0, 0];
  return [x + o[0], y + o[1], x, y];
}
const LABELS = { jaffa: [-17, -3], akko: [14, 3], sidon: [16, -1], cyprus: [0, 4], damascus: [15, 3], palmyra: [0, -8] };
const CEDARS = [[34.25, 35.98], [34.0, 35.82], [34.45, 36.12]];

export function buildChart() {
  const sea = [MED, ...SEAS].map((s) => smooth(projAll(s), true)).join('');
  const isl = ISLANDS.map((s) => smooth(projAll(s), true)).join('');
  const lakes = LAKES.map((s) => smooth(projAll(s), true)).join('');
  const rivers = RIVERS.map((s) => `<path d="${smooth(projAll(s), false)}"/>`).join('');
  const cedars = CEDARS.map(([la, lo]) => { const [x, y] = proj(la, lo); return `<path transform="translate(${f1(x)} ${f1(y)})" d="M0-7l-4 5h2.4l-3.4 4h10l-3.4-4H4Z"/>`; }).join('');
  const routes = Object.entries(PATHS).map(([id, list]) => {
    const kind = id === 'jaffa' || id === 'akko' ? 'cart' : (id === 'petra' || id === 'adiabene' ? 'road' : 'sea');
    return `<path id="kr-${id}" class="kroute k${kind}" d="${smooth(projAll(list), false)}"/>`;
  }).join('');
  const places = Object.entries(PLACES).filter(([id]) => !PARTNERS.some((p) => p.place === id) && id !== 'jerusalem').map(([id, pl]) => {
    const [x, y] = proj(...pl.ll); const o = LABELS[id] || [0, 12];
    return `<circle class="kdot" cx="${f1(x)}" cy="${f1(y)}" r="2.2"/><text class="klbl ksm" x="${f1(x + o[0])}" y="${f1(y + o[1])}">${pl.n}</text>`;
  }).join('');
  const water = WATER_NAMES.map((w) => { const [x, y] = proj(...w.ll); return `<text class="kwn${w.big ? ' kbig' : ''}${w.land ? ' kland' : ''}" x="${f1(x)}" y="${f1(y)}">${w.n}</text>`; }).join('');
  const pins = PARTNERS.map((p) => {
    const [x, y, px, py] = pinAt(p.id);
    const lead = x !== px || y !== py ? `<path class="klead" d="M${f1(px)} ${f1(py)}L${f1(x)} ${f1(y)}"/><circle class="kdot" cx="${f1(px)}" cy="${f1(py)}" r="2.2"/>` : '';
    return `${lead}<g class="kpin" data-p="${p.id}" transform="translate(${f1(x)} ${f1(y)})">`
      + `<circle class="khit" r="22"/><circle class="kring" r="16"/><circle class="kpinc" r="12.5"/>`
      + `<g class="kemb" transform="scale(.36) translate(-32 -32)">${EMBLEMS[p.seal]}</g>`
      + `<text class="klbl kpl" y="27">${p.short}</text></g>`;
  }).join('');
  const [jx, jy] = proj(...PLACES.jerusalem.ll);
  const home = `<g class="khome" transform="translate(${f1(jx)} ${f1(jy)})"><circle class="khomec" r="8"/><path d="M-4.5 3.5V-1.5L0-4.5 4.5-1.5V3.5Z" fill="#FFF7DE"/>`
    + `<text class="klbl kpl" x="-27" y="6">ירושלים</text></g>`;
  return `<svg class="kchart" viewBox="0 0 ${W} ${H}" role="img" aria-label="מפת הים הגדול והארצות שסביבו">`
    + '<defs><radialGradient id="kland" cx=".55" cy=".45" r=".75"><stop style="stop-color:var(--kl1)"/><stop offset="1" style="stop-color:var(--kl2)"/></radialGradient>'
    + '<linearGradient id="ksea" x1="0" y1="0" x2="1" y2="1"><stop style="stop-color:var(--ks1)"/><stop offset="1" style="stop-color:var(--ks2)"/></linearGradient>'
    + `<clipPath id="kseaclip"><path d="${sea}"/></clipPath></defs>`
    + `<rect width="${W}" height="${H}" fill="url(#kland)"/>`
    + `<path fill="url(#ksea)" d="${sea}"/>`
    + `<g clip-path="url(#kseaclip)"><path class="khatch" d="${sea}${isl}"/></g>`
    + `<path fill="url(#kland)" d="${isl}"/><path class="kcoast" d="${sea}${isl}"/>`
    + `<path class="klake" d="${lakes}"/><g class="kriver">${rivers}</g>`
    + `<g class="kcedar">${cedars}</g>`
    + water + `<g class="kroutes">${routes}</g>` + places + home
    + `<g class="kpins">${pins}</g><g class="kmoving"></g>`
    + `<rect class="kframe" x="3" y="3" width="${W - 6}" height="${H - 6}" rx="6"/></svg>`;
}

export const clock = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000)); const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const ss = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}` : `${m}:${String(ss).padStart(2, '0')}`;
};

/** Bind a rendered chart: measure the routes once, then update() places the moving glyphs (cheap: ≤ 5 vessels). */
export function bindChart(svg) {
  const lens = {}; const paths = {};
  for (const id of Object.keys(PATHS)) { const el = svg.querySelector('#kr-' + id); if (el) { paths[id] = el; try { lens[id] = el.getTotalLength(); } catch (e) { lens[id] = 0; } } }
  const layer = svg.querySelector('.kmoving');
  const mk = (cls) => { const g = svg.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', cls); return g; };
  const nodes = new Map();
  const at = (id, t) => { const el = paths[id]; if (!el || !lens[id]) return null; try { const p = el.getPointAtLength(Math.max(0, Math.min(1, t)) * lens[id]); return [p.x, p.y]; } catch (e) { return null; } };
  function node(v) {
    let n = nodes.get(v.id);
    if (!n) {
      const g = mk('kv');
      g.innerHTML = '<g class="kvb"></g><text class="kvt"></text>';
      layer.appendChild(g); n = { g, body: g.firstChild, text: g.lastChild, kind: '', flip: 0, label: '' }; nodes.set(v.id, n);
    }
    return n;
  }
  function update(voys, now) {
    const live = new Set();
    for (const v of voys) {
      live.add(v.id);
      const ph = phase(v, now); const n = node(v);
      let kind = ph.kind === 'court' ? 'letter' : ph.kind === 'arrived' ? 'cart' : ph.kind;
      const t = ph.a + (ph.b - ph.a) * ph.f;
      let p = at(ph.path, t);
      if (ph.kind === 'arrived') { const j = proj(...PLACES.jerusalem.ll); p = [j[0] + 19, j[1] - 3]; }
      if (!p) continue;
      const ahead = at(ph.path, t + (ph.b >= ph.a ? 0.01 : -0.01)) || p;
      const flip = ahead[0] < p[0] - 0.05 ? -1 : 1;
      if (n.kind !== kind) { n.kind = kind; n.body.innerHTML = GLYPH[kind] ? GLYPH[kind](v.p === 'tyre' ? '#B58AB0' : undefined) : ''; n.text.setAttribute('y', kind === 'sea' ? '17' : '-12'); }
      n.g.setAttribute('transform', `translate(${f1(p[0])} ${f1(p[1])})`);
      if (n.flip !== flip) { n.flip = flip; n.body.setAttribute('transform', `scale(${flip} 1)`); }
      const label = kind === 'sea' && p[0] < 185 ? clock(ph.left) : '';
      if (n.label !== label) { n.label = label; n.text.textContent = label; }
      n.g.classList.toggle('karr', ph.kind === 'arrived');
    }
    for (const [id, n] of nodes) if (!live.has(id)) { n.g.remove(); nodes.delete(id); }
  }
  return { update, at, lens };
}
