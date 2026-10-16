/* ─────────────────────────────────────────────────────────────────────────────
 * kings/art.js — the courts' stylized portraits, the wax seals, the map's glyphs and the goods' icons (SVG strings).
 *
 * Portraits are dignified and stylized: no likeness is claimed, no cult symbols (no wreaths, eagles, idols or divine
 * titles), no crowns beyond a plain band. Tyre wears Tyrian purple; Augustus a toga with a purple stripe; Helena a veil and
 * Monbaz a plain tall cap; Nikanor a white mantle before bronze doors; the Petra merchant a head cloth before rose rock.
 * ──────────────────────────────────────────────────────────────────────────── */
const ln = (d, c, w) => `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none"/>`;
const face = (x, y, s = 1, skin = '#D9A77C') => `<g transform="translate(${x} ${y}) scale(${s})">`
  + `<path d="M-7 18V30H7V18Z" fill="${skin}"/><ellipse cy="4" rx="15" ry="19" fill="${skin}"/>`
  + `<g stroke-linecap="round">${ln('M-8 1q3-2.2 6 0M2 1q3-2.2 6 0', '#3A2616', 1.3)}${ln('M0 3q-2.2 6 0 8.5', '#8C5E3C', 1.1)}</g></g>`;
const eyes = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#2A1A10"><ellipse cx="-5" cy="3.4" rx="1.6" ry="1.1"/><ellipse cx="5" cy="3.4" rx="1.6" ry="1.1"/></g>`;
const frame = (a, b, extra = '') => `<defs><linearGradient id="kgp-${a.slice(1)}" x2="0" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>`
  + `<path d="M4 140V46A56 42 0 0 1 116 46V140Z" fill="url(#kgp-${a.slice(1)})"/>${extra}`;
const body = (c) => `<path d="M16 140C18 108 36 98 60 98S102 108 104 140Z" fill="${c}"/>`;
const beard = (c, l = 0) => `<path d="M44 66C44 ${92 + l} 52 ${100 + l} 60 ${100 + l}S76 ${92 + l} 76 66C72 76 66 80 60 80S48 76 44 66Z" fill="${c}"/>`;
const mouth = (y, c) => ln(`M53 ${y}q7 2.6 14 0`, c, 1.5);

export const PORTRAITS = {
  tyre: frame('#5E8C8F', '#2F5559') + body('#6B2D5C') + ln('M50 99L60 122 70 99', '#D8B25A', 3)
    + face(60, 62) + beard('#2E1D14') + mouth(83, '#7A4A33')
    + '<path d="M43 58C42 36 78 36 77 58C72 50 48 50 43 58Z" fill="#8A2F2A"/>' + ln('M43 56q17-6 34 0', '#D8B25A', 2.2) + eyes(60, 62),
  rome: frame('#E8DDC8', '#BFAF93') + body('#F2EDE2') + ln('M34 104C50 118 58 132 62 140', '#7B2335', 7)
    + face(60, 62, 1, '#E0B48E') + '<path d="M44 55C44 36 76 36 76 55C72 48 66 46 60 47S48 48 44 55Z" fill="#6A4A2E"/>'
    + ln('M47 50l4 4M53 48l3 5M60 47l1 5M66 48l-2 5M72 50l-3 4', '#4E341F', 1.4) + mouth(76, '#9A5E44') + eyes(60, 62),
  adiabene: frame('#3E4F7A', '#1E2A48')
    // Monbaz (left): a plain tall cap with a gold band, a beard
    + '<path d="M6 140C8 112 22 104 38 104S66 112 68 140Z" fill="#7A3B2A"/>'
    + face(38, 70, 0.82, '#D2A075') + '<path d="M26 74C26 94 32 100 38 100S50 94 50 74C46 82 42 84 38 84S30 82 26 74Z" fill="#2A1B12"/>'
    + '<path d="M25 62C24 38 52 38 51 62C45 57 31 57 25 62Z" fill="#5B2C4F"/>' + ln('M25 61q13-5 26 0', '#E4B656', 2.4) + eyes(38, 70, 0.82)
    // Helena (right): a veil and a thin gold band
    + '<path d="M52 140C54 110 68 100 84 100S114 110 116 140ZM66 128C62 92 66 50 84 46C102 50 106 92 102 128Z" fill="#2B5E8C"/>'
    + face(84, 72, 0.8, '#E2B690') + ln('M72 64q12-6 24 0', '#E4B656', 2)
    + '<path d="M71 64C72 52 96 52 97 64C92 60 76 60 71 64Z" fill="#3A2416"/>' + ln('M80 84q4 1.6 8 0', '#A0604A', 1.3) + eyes(84, 72, 0.8),
  nikanor: frame('#C9A15E', '#8A6230', '<path d="M22 140V60H56V140M64 140V60H98V140" fill="#B07A3A" stroke="#6E4A1E" stroke-width="2"/><g fill="#6E4A1E"><circle cx="50" cy="100" r="2.5"/><circle cx="70" cy="100" r="2.5"/></g>')
    + body('#F4EFE4') + ln('M26 118H94M24 126H96', '#3E6A96', 2.4)
    + face(60, 62) + beard('#CFCAC0', 4) + mouth(83, '#8A7F72')
    + '<path d="M44 58C43 40 77 40 76 58C70 52 50 52 44 58Z" fill="#D9D4CA"/>' + ln('M45 50C52 42 68 42 75 50', '#F4EFE4', 5) + eyes(60, 62),
  petra: frame('#C98468', '#8E4E3E') + body('#6E4B2E') + ln('M40 104C48 118 72 118 80 104', '#E6D6B8', 3)
    + face(60, 64, 1, '#C58E63') + beard('#241710', 1) + mouth(85, '#6E432B')
    + '<path d="M38 104C34 70 40 44 60 42C80 44 86 70 82 104C78 88 76 66 76 60C70 54 50 54 44 60C44 66 42 88 38 104Z" fill="#EDE3CF"/>'
    + ln('M43 57q17-7 34 0', '#3A2A1C', 3.4) + eyes(60, 64),
};

/* ── the seals: a wax disc (wobbly edge) with an embossed emblem ── */
function wax(seed) {
  let d = '';
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2; const r = 28 + 1.8 * Math.sin(i * 2.7 + seed) + 1.2 * Math.cos(i * 5.1 + seed * 2);
    d += (i ? 'L' : 'M') + (32 + r * Math.cos(a)).toFixed(1) + ' ' + (32 + r * Math.sin(a)).toFixed(1);
  }
  return d + 'Z';
}
export const EMBLEMS = {
  cedar: '<path d="M32 14 L22 28 H28 L18 40 H27 L20 48 H44 L37 40 H46 L36 28 H42Z"/><rect x="30" y="47" width="4" height="7"/>',
  ingot: '<path d="M16 20 Q32 26 48 20 Q42 32 48 44 Q32 38 16 44 Q22 32 16 20Z"/>',
  lamp: '<path d="M32 6V14" stroke-width="2"/><path d="M18 25H46Q45 40 32 41Q19 40 18 25ZM22 23q-2.5-4 0-8q2.5 4 0 8M32 23q-2.5-4 0-8q2.5 4 0 8M42 23q-2.5-4 0-8q2.5 4 0 8M26 45H38L35 50H29Z"/>',
  door: '<path d="M16 50 V22 Q24 14 31 16 V50Z M33 50 V16 Q40 14 48 22 V50Z"/><g fill="none" stroke-width="1.4"><path d="M19 27 H28 V47 H19Z M36 27 H45 V47 H36Z"/></g>',
  camel: '<path d="M14 30 Q18 22 24 28 Q28 18 34 26 Q38 20 42 26 L46 22 Q50 20 51 24 L48 30 Q46 36 44 38 L44 48 H41 L40 39 H26 L25 48 H22 L21 38 Q14 36 14 30Z"/>',
};
export function sealSVG(kind, on = true, seed = 1) {
  const fill = on ? '#9E2B25' : 'none';
  const ink = on ? '#6E1712' : 'currentColor';
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="${wax(seed)}" fill="${fill}" stroke="${on ? '#7A1C17' : 'currentColor'}" stroke-width="${on ? 1.5 : 1.4}" ${on ? '' : 'stroke-dasharray="3 3" opacity=".55"'}/>`
    + (on ? '<circle cx="32" cy="32" r="21" fill="none" stroke="#C8574E" stroke-width="1.2" opacity=".8"/>' : '')
    + `<g fill="${on ? '#C9534A' : 'currentColor'}" stroke="${ink}" stroke-width="1" ${on ? '' : 'opacity=".45"'}>${EMBLEMS[kind] || ''}</g></svg>`;
}

/* ── the map's moving glyphs (drawn around 0,0, facing east; the map flips them) ── */
export const GLYPH = {
  sea: (sail = '#F4EAD0') => '<path d="M-11 2 H11 L7 7 H-7Z" fill="#6B4A2A"/><path d="M0 2 V-12" stroke="#4A321C" stroke-width="1.4"/>'
    + `<path d="M-7 -11 H7 Q9 -5 7 0 H-7 Q-5 -5 -7 -11Z" fill="${sail}" stroke="#4A321C" stroke-width=".8"/>`,
  cart: () => '<g stroke="#4A321C" stroke-width="1.2"><rect x="-9" y="-6" width="16" height="7" rx="1" fill="#8A5A2E"/><path d="M7-2H12"/><g fill="#E9DDC4"><circle cx="-5" cy="3" r="3"/><circle cx="4" cy="3" r="3"/></g></g>',
  road: () => '<g fill="#7A5534" stroke="#3E2A18" stroke-width=".7"><path d="M-10 0 Q-8 -6 -4 -3 Q-2 -9 2 -4 L5 -7 Q8 -8 8 -5 L6 -1 Q5 3 4 4 V9 H2 V4 H-5 V9 H-7 V3 Q-10 3 -10 0Z"/></g>',
  letter: () => '<g stroke="#6B4A2A" fill="#F3E6C8"><rect x="-8" y="-6" width="16" height="11" rx="1.5"/><path d="M-8-5L0 1 8-5"/></g><circle cy="2" r="2.2" fill="#9E2B25"/>',
};

/* ── the goods (inline icons in offers and the arrival) ── */
const i20 = (x) => `<svg viewBox="0 0 20 20" aria-hidden="true">${x}</svg>`;
export const ICON = {
  cedar: i20('<path d="M10 2 L5 9 H8 L3 15 H17 L12 9 H15Z" fill="#3F6B3A"/><rect x="9" y="15" width="2" height="3" fill="#6B4A2A"/>'),
  bronze: i20('<path d="M3 6 Q10 8.5 17 6 Q14.5 10 17 14 Q10 11.5 3 14 Q5.5 10 3 6Z" fill="#B8733A" stroke="#7A4A20" stroke-width=".8"/>'),
  gold: i20('<path d="M3 14 L6 7 H14 L17 14Z" fill="#E4B656" stroke="#8A6414" stroke-width=".9"/><path d="M7 8.5 H12" stroke="#FFF1B8" stroke-width="1"/>'),
  silver: i20('<g stroke="#6E7682"><circle cx="10" cy="10" r="7" fill="#C9CED6"/><circle cx="10" cy="10" r="4.4" fill="none" stroke-width=".9"/></g>'),
  time: i20('<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="10" cy="10" r="7"/><path d="M10 6V10L13 12"/></g>'),
};
