/* ─────────────────────────────────────────────────────────────────────────────
 * pen/art.js: the drawings of "הוצאת הטלה מהדיר", in code as inline SVG (no image files; our own art, drawn from scratch).
 *
 *   DEFS                  → one <svg> of shared gradients, appended once to the overlay
 *   piece(kind, len)      → the inner markup of a top-down token, viewBox 0 0 (100·len) 100, its FACE AT THE LEFT (forward in RTL)
 *   pieceSvg(kind, len)   → a full <svg> string;  pen(w, h) → the pen itself (straw floor, the rail fence, the open gate)
 *   COIN                  → the פרוטה (the same coin as the tile game, its own gradient ids)
 *   M · ML · CELL         → the pen's margins and cell size in SVG units (the UI maps cells to pixels with them)
 *
 * Warm Temple palette: limestone #E9D7BB · cedar #8A6A45 · gold #D9B45A · deep blue #2A4A7A · linen #F1ECE0.
 * The animals are clean rounded silhouettes seen from above, a face at the front, like soft board-game tokens.
 * Every drawing is an illustration (המחשה) — docs/PEN35.md carries a note for each.
 * ──────────────────────────────────────────────────────────────────────────── */
export const CELL = 100, M = 32, ML = 84;   // a cell · the fence margin · the left margin (room for the open gate leaf)
const lg = (id, c, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="png-${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${c.map((k, q) => `<stop offset="${(q / (c.length - 1)).toFixed(2)}" stop-color="${k}"/>`).join('')}</linearGradient>`;
export const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
${lg('wool', ['#FFFFFF', '#F6F1E6', '#DDD2BC'])}${lg('cream', ['#FFF8EA', '#EADFC8', '#CDBC9C'])}${lg('goat', ['#D2C6B6', '#A89888', '#7A6A5A'])}
${lg('cow', ['#FFFDF6', '#F2E9D6', '#D9CDB2'])}${lg('hay', ['#F6D97A', '#E2B85A', '#B8841E'])}${lg('wood', ['#C99A62', '#8A6A45', '#5A3618'])}
${lg('water', ['#8EC5F2', '#4F86C2', '#2A4A7A'])}${lg('linen', ['#FFFFFF', '#F1ECE0', '#CFC4AC'])}${lg('gold', ['#FFF3C4', '#E9C765', '#B8841E'], 0, 0, 1, 1)}
${lg('basket', ['#E2B97A', '#C08A48', '#8A5A22'])}
<radialGradient id="png-coin" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFF3C4"/><stop offset=".55" stop-color="#E2B84E"/><stop offset="1" stop-color="#8E5E12"/></radialGradient>
<radialGradient id="png-straw" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#EBD69C"/><stop offset="1" stop-color="#D4B874"/></radialGradient>
</defs></svg>`;
const U = (k) => `url(#png-${k})`;
const shadow = (w) => `<rect x="8" y="12" width="${w - 14}" height="84" rx="40" fill="#5A3A14" opacity=".16"/>`;
const eyes = (x, dy = 22) => `<circle cx="${x}" cy="${50 - dy}" r="3.4" fill="#2A1A0C"/><circle cx="${x}" cy="${50 + dy}" r="3.4" fill="#2A1A0C"/><circle cx="${x - 1}" cy="${49 - dy}" r="1.1" fill="#fff"/><circle cx="${x - 1}" cy="${49 + dy}" r="1.1" fill="#fff"/>`;

const PIECE = {
  /* the lamb: a woolly cloud of a body, a cream head with two ears, a gold ear tag (the hero piece) */
  lamb: (w) => `${shadow(w)}
<rect x="62" y="16" width="${w - 74}" height="68" rx="34" fill="${U('wool')}"/>
${[[70, 20], [96, 14], [124, 16], [152, 20], [70, 80], [96, 86], [124, 84], [152, 80], [174, 32], [176, 68]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="${U('wool')}" stroke="#DDD2BC" stroke-width="1"/>`).join('')}
<rect x="66" y="22" width="${w - 82}" height="56" rx="28" fill="#F9F5EC"/>
<circle cx="${w - 16}" cy="50" r="9" fill="${U('wool')}" stroke="#DDD2BC" stroke-width="1"/>
<ellipse cx="44" cy="22" rx="18" ry="8" transform="rotate(-28 44 22)" fill="#DCCBAB"/><ellipse cx="44" cy="78" rx="18" ry="8" transform="rotate(28 44 78)" fill="#DCCBAB"/>
<rect x="38" y="4" width="18" height="11" rx="3" transform="rotate(-28 47 10)" fill="${U('gold')}" stroke="#9A6E12" stroke-width="1.2"/>
<path d="M22 50C22 30 36 20 52 20C66 20 76 30 76 50C76 70 66 80 52 80C36 80 22 70 22 50Z" fill="${U('cream')}"/>
<ellipse cx="26" cy="50" rx="8" ry="7" fill="#D9BFA8"/><path d="M22 47l3 3-3 3" stroke="#A8846A" stroke-width="1.6" fill="none" stroke-linecap="round"/>
${eyes(44, 18)}`,
  /* the goat: a grey-taupe body, two horns sweeping back and out past the head, a little beard at the front */
  goat: (w) => `${shadow(w)}
<rect x="56" y="18" width="${w - 68}" height="64" rx="32" fill="${U('goat')}"/>
<path d="M${w - 14} 44c8 2 10 8 4 14" stroke="#6E5E50" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M50 28C62 8 84 2 104 10" stroke="#3A2E24" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M50 72C62 92 84 98 104 90" stroke="#3A2E24" stroke-width="8" fill="none" stroke-linecap="round"/>
<path d="M50 28C62 8 84 2 104 10" stroke="#7A6A5A" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/><path d="M50 72C62 92 84 98 104 90" stroke="#7A6A5A" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
<ellipse cx="50" cy="26" rx="14" ry="6" transform="rotate(-35 50 26)" fill="#A89888"/><ellipse cx="50" cy="74" rx="14" ry="6" transform="rotate(35 50 74)" fill="#A89888"/>
<path d="M26 50C26 32 38 22 54 22C70 22 78 34 78 50C78 66 70 78 54 78C38 78 26 68 26 50Z" fill="#C4B4A2"/>
<path d="M14 50c0-6 6-10 14-9l-2 16c-7 1-12-2-12-7z" fill="#F1ECE0" stroke="#A89888" stroke-width="1.2"/>
<ellipse cx="29" cy="50" rx="7" ry="6" fill="#6E5E50"/>
${eyes(46, 16)}`,
  /* the cow: a long cream body with brown patches, a pink muzzle, horns and ears to the sides */
  cow: (w) => `${shadow(w)}
<rect x="60" y="14" width="${w - 72}" height="72" rx="36" fill="${U('cow')}"/>
<path d="M96 26c14-6 30-4 38 8c4 10-6 20-20 18c-14-2-26-10-18-26z" fill="#8A5A3A"/><path d="M${w - 90} 70c10-10 30-10 38 2c2 8-10 14-22 12c-10-2-18-6-16-14z" fill="#8A5A3A"/><path d="M${w - 50} 24c10 0 16 8 14 16c-8 6-18 2-20-6c0-6 2-10 6-10z" fill="#8A5A3A"/>
<path d="M${w - 12} 40c10 4 10 14 2 20" stroke="#8A5A3A" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="${w - 10}" cy="62" r="5" fill="#5A3A2A"/>
<path d="M56 24C44 8 30 10 26 20C32 24 42 28 56 30Z" fill="#E9D7BB" stroke="#B8A080" stroke-width="1.2"/><path d="M56 76C44 92 30 90 26 80C32 76 42 72 56 70Z" fill="#E9D7BB" stroke="#B8A080" stroke-width="1.2"/>
<ellipse cx="52" cy="18" rx="12" ry="5" transform="rotate(-20 52 18)" fill="#D9C8AC"/><ellipse cx="52" cy="82" rx="12" ry="5" transform="rotate(20 52 82)" fill="#D9C8AC"/>
<path d="M22 50C22 30 36 20 54 20C72 20 82 32 82 50C82 68 72 80 54 80C36 80 22 70 22 50Z" fill="#F2E9D6"/>
<path d="M60 26c8 2 12 10 8 18c-6 2-12-2-14-8c0-6 2-10 6-10z" fill="#8A5A3A"/>
<ellipse cx="30" cy="50" rx="11" ry="12" fill="#E9A9A0"/><circle cx="27" cy="45" r="2" fill="#B86A60"/><circle cx="27" cy="55" r="2" fill="#B86A60"/>
${eyes(50, 17)}`,
  /* a hay bale: a golden block bound with two cords, straw ends sticking out */
  hay: (w) => `${shadow(w)}
<rect x="14" y="14" width="${w - 28}" height="72" rx="10" fill="${U('hay')}"/>
${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((q) => `<path d="M${20 + q * ((w - 40) / 11)} ${18 + (q % 3) * 6}l${(q % 2 ? 14 : 10)} ${60 - (q % 4) * 6}" stroke="${q % 2 ? '#FFF0B0' : '#B8841E'}" stroke-width="2" opacity=".8" stroke-linecap="round"/>`).join('')}
${[[16, 30], [w - 28, 46], [40, 84], [w - 50, 12]].map(([x, y]) => `<path d="M${x} ${y}l-8 ${y > 50 ? 6 : -6}" stroke="#E2B85A" stroke-width="2.4" stroke-linecap="round"/>`).join('')}
<rect x="${w * 0.33 - 5}" y="12" width="10" height="76" rx="2" fill="#7A5A28" opacity=".85"/><rect x="${w * 0.67 - 5}" y="12" width="10" height="76" rx="2" fill="#7A5A28" opacity=".85"/>
<rect x="14" y="14" width="${w - 28}" height="72" rx="10" fill="none" stroke="#9A6E18" stroke-width="2"/>`,
  /* the water trough: a cedar box, water inside, a ripple of light */
  trough: (w) => `${shadow(w)}
<rect x="10" y="12" width="${w - 20}" height="76" rx="8" fill="${U('wood')}"/>
<rect x="22" y="24" width="${w - 44}" height="52" rx="5" fill="${U('water')}"/>
<path d="M34 36C60 30 90 42 120 36S180 30 ${w - 36} 38" stroke="#BFE3FF" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/>
<path d="M40 60C70 54 100 66 130 60S190 54 ${w - 40} 62" stroke="#BFE3FF" stroke-width="2" fill="none" stroke-linecap="round" opacity=".45"/>
<path d="M${w * 0.5 - 28} 44l10 -3M${w * 0.6} 66l12 -2" stroke="#F6D97A" stroke-width="2" stroke-linecap="round" opacity=".8"/>
${[0.25, 0.75].map((f) => `<rect x="${w * f - 3}" y="12" width="6" height="76" fill="#5A3618" opacity=".55"/>`).join('')}
<rect x="10" y="12" width="${w - 20}" height="76" rx="8" fill="none" stroke="#4A2E12" stroke-width="2"/>`,
  /* a kohen pushing a basket: the woven basket in front; behind it the kohen seen from above — linen shoulders,
     the sash, two arms to the basket's rim, the white cap on his head */
  kohen: (w) => `${shadow(w)}
<rect x="104" y="20" width="${w - 118}" height="60" rx="30" fill="${U('linen')}" stroke="#CFC4AC" stroke-width="1.2"/>
<rect x="124" y="20" width="10" height="60" rx="3" fill="#2A4A7A" opacity=".75"/><rect x="124" y="20" width="10" height="60" rx="3" fill="none" stroke="#D9B45A" stroke-width="1.5" opacity=".9"/>
<path d="M112 34C94 30 78 36 66 42M112 66C94 70 78 64 66 58" stroke="#F1ECE0" stroke-width="12" fill="none" stroke-linecap="round"/>
<path d="M112 34C94 30 78 36 66 42M112 66C94 70 78 64 66 58" stroke="#CFC4AC" stroke-width="1" fill="none" stroke-linecap="round"/>
<circle cx="66" cy="42" r="7" fill="#E8B894"/><circle cx="66" cy="58" r="7" fill="#E8B894"/>
<circle cx="${w - 46}" cy="50" r="23" fill="#E8B894"/>
<circle cx="${w - 44}" cy="50" r="19" fill="#FFFFFF" stroke="#CFC4AC" stroke-width="1.5"/><path d="M${w - 58} 44c6-4 22-4 28 0M${w - 58} 56c6 4 22 4 28 0" stroke="#DDD2BC" stroke-width="2" fill="none" stroke-linecap="round"/>
<circle cx="46" cy="50" r="34" fill="${U('basket')}"/>
${[12, 20, 28].map((r) => `<circle cx="46" cy="50" r="${r}" fill="none" stroke="#8A5A22" stroke-width="1.6" opacity=".55"/>`).join('')}
${[0, 30, 60, 90, 120, 150].map((a) => `<path d="M46 16V84" stroke="#8A5A22" stroke-width="1.4" opacity=".4" transform="rotate(${a} 46 50)"/>`).join('')}
<circle cx="46" cy="50" r="34" fill="none" stroke="#6A4A1A" stroke-width="3"/>
<path d="M22 50c6-18 42-18 48 0" stroke="#D9B07A" stroke-width="3" fill="none" stroke-linecap="round"/>
<circle cx="38" cy="44" r="6" fill="#C8302A"/><circle cx="52" cy="40" r="5" fill="#6B3A7A"/><circle cx="50" cy="56" r="6" fill="#9FD37A"/>`,
};
export const PIECE_KINDS = Object.keys(PIECE);
export function piece(kind, len = 2) { const f = PIECE[kind]; return f ? f(len * CELL) : ''; }
export function pieceSvg(kind, len = 2, cls = '') { return `<svg class="${cls}" viewBox="0 0 ${len * CELL} ${CELL}" aria-hidden="true" focusable="false">${piece(kind, len)}</svg>`; }

/* ── the pen: a straw floor with faint cell lines, a rail fence of cedar posts round it, the gate open in the left fence ── */
function straws(x0, y0, w, h, seed = 7) {
  let a = seed >>> 0; const r = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let out = '';
  for (let q = 0; q < 170; q++) {
    const x = x0 + r() * w, y = y0 + r() * h, ang = r() * Math.PI, L = 10 + r() * 22;
    out += `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l${(Math.cos(ang) * L).toFixed(1)} ${(Math.sin(ang) * L).toFixed(1)}" stroke="${q % 3 ? '#C9A45A' : '#F5E4AE'}" stroke-width="${(1.2 + r() * 1.6).toFixed(1)}" stroke-linecap="round" opacity="${(0.35 + r() * 0.4).toFixed(2)}"/>`;
  }
  return out;
}
export function pen(w = 6, h = 6, exitRow = 2) {
  const W = w * CELL, H = h * CELL, x0 = ML, y0 = M, X1 = x0 + W, Y1 = y0 + H;
  const VW = ML + W + M, VH = M + H + M;
  const rail = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#5A3618" stroke-width="15" stroke-linecap="round" opacity=".35"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="#A07A50" stroke-width="12" stroke-linecap="round"/><path d="M${x1} ${y1 - 3}L${x2} ${y2 - 3}" stroke="#D9B07A" stroke-width="3" stroke-linecap="round" opacity=".8"/><path d="M${x1} ${y1 + 4}L${x2} ${y2 + 4}" stroke="#6A4A2A" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
  const vrail = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#5A3618" stroke-width="15" stroke-linecap="round" opacity=".35"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="#A07A50" stroke-width="12" stroke-linecap="round"/><path d="M${x1 - 3} ${y1}L${x2 - 3} ${y2}" stroke="#D9B07A" stroke-width="3" stroke-linecap="round" opacity=".8"/><path d="M${x1 + 4} ${y1}L${x2 + 4} ${y2}" stroke="#6A4A2A" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
  const post = (x, y) => `<rect x="${x - 11}" y="${y - 11}" width="22" height="22" rx="6" fill="#6A4A2A" stroke="#3A2410" stroke-width="2"/><rect x="${x - 7}" y="${y - 7}" width="14" height="14" rx="4" fill="#8A6A45"/><circle cx="${x}" cy="${y}" r="3.5" fill="#C99A62" opacity=".8"/>`;
  const gy0 = y0 + exitRow * CELL, gy1 = gy0 + CELL;       // the gate opening on the left fence
  let s = `<svg class="pn-bg" viewBox="0 0 ${VW} ${VH}" aria-hidden="true" focusable="false" preserveAspectRatio="none">`;
  // the floor: straw, with a faint cell grid and a trodden lane to the gate
  s += `<rect x="${x0 - 14}" y="${y0 - 14}" width="${W + 28}" height="${H + 28}" rx="10" fill="url(#png-straw)"/>`;
  s += `<rect x="${x0}" y="${gy0 + 8}" width="${W}" height="${CELL - 16}" rx="12" fill="#C9A96A" opacity=".35"/>`;
  s += straws(x0 - 10, y0 - 10, W + 20, H + 20);
  for (let i = 1; i < w; i++) s += `<path d="M${x0 + i * CELL} ${y0}V${Y1}" stroke="#7A5A28" stroke-width="1.2" opacity=".18"/>`;
  for (let j = 1; j < h; j++) s += `<path d="M${x0} ${y0 + j * CELL}H${X1}" stroke="#7A5A28" stroke-width="1.2" opacity=".18"/>`;
  // hoof prints toward the gate
  for (let i = 0; i < w; i++) for (const dy of [-16, 14]) s += `<ellipse cx="${x0 + i * CELL + 50 + (dy < 0 ? -12 : 12)}" cy="${gy0 + 50 + dy}" rx="5" ry="7" fill="#8A6A45" opacity=".22" transform="rotate(-90 ${x0 + i * CELL + 50 + (dy < 0 ? -12 : 12)} ${gy0 + 50 + dy})"/>`;
  // the fence shadow on the straw
  s += `<rect x="${x0 - 8}" y="${y0 - 8}" width="${W + 16}" height="${H + 16}" rx="8" fill="none" stroke="#5A3A14" stroke-width="12" opacity=".12"/>`;
  // the rails: top, bottom, right, and the left with the gap at the exit row
  const r = 16;   // the rails sit this far outside the cells
  s += rail(x0 - r, y0 - r, X1 + r, y0 - r) + rail(x0 - r, Y1 + r, X1 + r, Y1 + r) + vrail(X1 + r, y0 - r, X1 + r, Y1 + r);
  s += vrail(x0 - r, y0 - r, x0 - r, gy0 - 2) + vrail(x0 - r, gy1 + 2, x0 - r, Y1 + r);
  // the posts: corners, every two cells, and both sides of the gate
  for (let i = 0; i <= w; i += 2) { s += post(x0 - r + i * CELL, y0 - r) + post(x0 - r + i * CELL, Y1 + r); }
  for (let j = 2; j < h; j += 2) { s += post(X1 + r, y0 - r + j * CELL); if (j !== exitRow && j !== exitRow + 1) s += post(x0 - r, y0 - r + j * CELL); }
  s += post(x0 - r, gy0 - 2) + post(x0 - r, gy1 + 2);
  // the gate leaf, swung open outward (to the left), hinged on the lower post
  const hx = x0 - r, hy = gy1 + 2;
  s += `<ellipse cx="${x0 - 44}" cy="${gy0 + 50}" rx="40" ry="42" fill="#D9BE7E" opacity=".9"/>`;
  s += `<g transform="rotate(62 ${hx} ${hy})"><path d="M${hx} ${hy}V${hy - CELL + 2}" stroke="#5A3618" stroke-width="13" stroke-linecap="round" opacity=".3"/><path d="M${hx} ${hy}V${hy - CELL + 2}" stroke="#A07A50" stroke-width="10" stroke-linecap="round"/><path d="M${hx - 8} ${hy - 12}H${hx + 8}M${hx - 8} ${hy - CELL + 14}H${hx + 8}M${hx - 8} ${hy - CELL / 2}H${hx + 8}" stroke="#A07A50" stroke-width="5" stroke-linecap="round"/><path d="M${hx} ${hy - 6}L${hx} ${hy - CELL + 8}" stroke="#E2BC8A" stroke-width="2" opacity=".5"/></g>`;
  // a little arrow on the straw outside the gate, pointing the way out
  s += `<path d="M${x0 - 40} ${gy0 + 50}h-26m8-9l-8 9 8 9" stroke="#8A6A45" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>`;
  s += '</svg>';
  return { svg: s, VW, VH };
}
/* the פרוטה: a small bronze-gold coin with a pomegranate (never a face, never a foreign image) */
export const COIN = `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="50" r="46" fill="url(#png-coin)"/><circle cx="50" cy="50" r="38" fill="none" stroke="#8E5E12" stroke-width="2" opacity=".6"/><circle cx="50" cy="56" r="17" fill="#B8841E"/><path d="M42 40L44 31L48 36L50 28L52 36L56 31L58 40Z" fill="#8E5E12"/><ellipse cx="44" cy="50" rx="4" ry="6" fill="#FFF3C4" opacity=".35"/></svg>`;
