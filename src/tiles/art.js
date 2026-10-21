/* ─────────────────────────────────────────────────────────────────────────────
 * tiles/art.js: the pictures of "זיכרון המקדש", drawn in code as inline SVG (no image files; our own art).
 *
 *   DEFS                 → one <svg> of shared gradients, appended once to the overlay (the pictures reference them by id)
 *   pic(id)              → the inner markup of a 100×100 picture (menorah · incense · laver · table · lamb · logs · basket ·
 *                          jug · salt · shofar · trumpets · pomegranate · moked · cap · harp · ramp)
 *   svg(id, cls)         → a full <svg> element string;  ROSETTE (the back face's emboss) · COIN (the פרוטה)
 *
 * Warm Temple palette: limestone #E9D7BB · cedar #8A6A45 · gold #D9B45A · deep blue #2A4A7A · linen #F1ECE0.
 * Holy things are drawn whole and warm; nothing here is ever drawn broken. Every picture is an illustration (המחשה) —
 * docs/TILES35.md carries the source line of each.
 * ──────────────────────────────────────────────────────────────────────────── */
const G = {
  gold: ['#FFF3C4', '#E9C765', '#B8841E', '#FFE08A'], silver: ['#FFFFFF', '#D5DEE7', '#7F8E9C', '#EEF3F8'],
  bronze: ['#F0C98A', '#B9792F', '#6A3E12', '#D9A050'], clay: ['#F2B98A', '#C8703D', '#7A3E1C', '#E09A66'],
  wood: ['#D9B07A', '#9A6B3E', '#5A3618'], linen: ['#FFFFFF', '#F1ECE0', '#CFC4AC'], stone: ['#FAF2E2', '#E9D7BB', '#BFA98A'],
  blue: ['#8EC5F2', '#2A4A7A', '#15294A'], crimson: ['#FF8A7A', '#C8302A', '#6E1410'], flame: ['#FFF7C0', '#FFC53D', '#E0521B'],
  green: ['#9FD37A', '#4E8A34'], cream: ['#FFFDF6', '#F0E6D2', '#CDBC9C'],
};
const lg = (id, c, x1 = 0, y1 = 0, x2 = 1, y2 = 1) => `<linearGradient id="tlg-${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${c.map((k, q) => `<stop offset="${(q / (c.length - 1)).toFixed(2)}" stop-color="${k}"/>`).join('')}</linearGradient>`;
export const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
${lg('gold', G.gold)}${lg('silver', G.silver)}${lg('bronze', G.bronze)}${lg('clay', G.clay)}${lg('wood', G.wood, 0, 0, 0, 1)}
${lg('linen', G.linen, 0, 0, 0, 1)}${lg('stone', G.stone, 0, 0, 1, 1)}${lg('blue', G.blue, 0, 0, 0, 1)}${lg('crimson', G.crimson, 0.2, 0, 0.8, 1)}
${lg('flame', G.flame, 0, 0, 0, 1)}${lg('green', G.green, 0, 0, 0, 1)}${lg('cream', G.cream, 0, 0, 0, 1)}
<radialGradient id="tlg-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".9"/><stop offset="1" stop-color="#FFD66E" stop-opacity="0"/></radialGradient>
<radialGradient id="tlg-coin" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFF3C4"/><stop offset=".55" stop-color="#E2B84E"/><stop offset="1" stop-color="#8E5E12"/></radialGradient>
</defs></svg>`;
const U = (k) => `url(#tlg-${k})`;
const flame = (x, y, h) => `<path d="M${x} ${y - h}C${x + h * .5} ${y - h * .42} ${x + h * .4} ${y} ${x} ${y}C${x - h * .4} ${y} ${x - h * .5} ${y - h * .42} ${x} ${y - h}Z" fill="${U('flame')}"/><circle cx="${x}" cy="${y - h * .28}" r="${(h * .14).toFixed(1)}" fill="#FFFDEB" opacity=".9"/>`;
const shadow = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#5A3A14" opacity=".14"/>`;
const sparkle = (x, y, r) => `<path d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="#FFFFFF"/>`;

const PIC = {
  /* the menorah: seven straight diagonal branches (the project's default; the Arch of Titus shows round ones), lamps lit */
  menorah: () => `${shadow(50, 95, 30, 3)}
<g stroke="${U('gold')}" stroke-width="6" stroke-linecap="round" fill="none"><path d="M14 31L50 67L86 31"/><path d="M26 31L50 55L74 31"/><path d="M38 31L50 43L62 31"/><path d="M50 29V80" stroke-width="7"/></g>
<path d="M34 79H66L72 88H28Z" fill="${U('gold')}"/><path d="M23 88H77L83 95H17Z" fill="${U('gold')}"/>
<ellipse cx="50" cy="52" rx="5" ry="3" fill="${U('gold')}"/><ellipse cx="50" cy="66" rx="5" ry="3" fill="${U('gold')}"/>
${[14, 26, 38, 50, 62, 74, 86].map((x) => `<ellipse cx="${x}" cy="30" rx="5.5" ry="3" fill="${U('gold')}"/>`).join('')}
${[14, 26, 38, 50, 62, 74, 86].map((x) => flame(x, 27, 13)).join('')}`,
  /* the incense altar: a small gold-plated altar with four horns, a curl of incense smoke */
  incense: () => `${shadow(52, 93, 26, 3)}
<path d="M48 36C42 28 54 24 50 16C47 10 54 7 52 2" stroke="#9FA8B2" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".75"/>
<path d="M60 38C56 32 64 28 61 22" stroke="#9FA8B2" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".55"/>
<path d="M28 48H72V86H28Z" fill="${U('gold')}"/><path d="M72 48L82 40V78L72 86Z" fill="#A8761A"/><path d="M28 48L38 40H82L72 48Z" fill="#FFE9A6"/>
<path d="M22 86H78V92H22Z" fill="${U('wood')}"/>
${[[28, 48], [72, 48], [38, 40], [82, 40]].map(([x, y]) => `<path d="M${x - 4} ${y}L${x} ${y - 9}L${x + 4} ${y}Z" fill="#FFE9A6" stroke="#B8841E" stroke-width="1"/>`).join('')}
<path d="M32 56H68" stroke="#B8841E" stroke-width="1.2" opacity=".6"/><path d="M32 66H68M32 76H68" stroke="#B8841E" stroke-width="1" opacity=".4"/>`,
  /* the laver: a bronze basin on its stand, water inside, two spouts */
  laver: () => `${shadow(50, 94, 28, 3)}
<path d="M14 40C18 66 34 72 50 72C66 72 82 66 86 40Z" fill="${U('bronze')}"/>
<ellipse cx="50" cy="40" rx="36" ry="10" fill="#D9A050"/><ellipse cx="50" cy="40" rx="30" ry="7" fill="${U('blue')}"/>
<ellipse cx="42" cy="38" rx="9" ry="2.2" fill="#BFE3FF" opacity=".8"/>
<path d="M42 72L38 86H62L58 72Z" fill="${U('bronze')}"/><rect x="26" y="85" width="48" height="8" rx="3" fill="#8A5A22"/>
<path d="M14 50h-6v8" stroke="#8A5A22" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M86 50h6v8" stroke="#8A5A22" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M8 66c-3 4-3 7 0 7s3-3 0-7z" fill="#5F9BD8"/><path d="M92 66c-3 4-3 7 0 7s3-3 0-7z" fill="#5F9BD8"/>`,
  /* the shewbread table: gold, two stacks of six loaves with raised ends */
  table: () => `${shadow(50, 94, 32, 3)}
<rect x="12" y="52" width="76" height="8" rx="2" fill="${U('gold')}"/><rect x="18" y="60" width="7" height="32" fill="#C9962A"/><rect x="75" y="60" width="7" height="32" fill="#C9962A"/>
<rect x="25" y="72" width="50" height="4" fill="#E2B84E"/><rect x="14" y="90" width="15" height="4" rx="1" fill="#A8761A"/><rect x="71" y="90" width="15" height="4" rx="1" fill="#A8761A"/>
${[0, 1].map((k) => [0, 1, 2, 3, 4, 5].map((q) => { const x = 19 + k * 38, y = 46 - q * 5.6; return `<rect x="${x}" y="${y}" width="24" height="5.2" rx="2.4" fill="#C27A36"/><rect x="${x + 1}" y="${y}" width="22" height="2" rx="1" fill="#F4C98A" opacity=".85"/><rect x="${x}" y="${y}" width="3" height="5.2" rx="1.5" fill="#8A4A1A" opacity=".6"/><rect x="${x + 21}" y="${y}" width="3" height="5.2" rx="1.5" fill="#8A4A1A" opacity=".6"/>`; }).join('')).join('')}`,
  /* the lamb of the Tamid: a woolly lamb standing, gentle and whole */
  lamb: () => `${shadow(52, 92, 30, 3)}
<ellipse cx="54" cy="58" rx="28" ry="18" fill="${U('cream')}"/>
${[[30, 50], [41, 43], [54, 40], [67, 43], [78, 51], [26, 60], [80, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8.5" fill="${U('cream')}" stroke="#CDBC9C" stroke-width="1"/>`).join('')}
<ellipse cx="54" cy="60" rx="24" ry="14" fill="#F3EAD6"/>
${[36, 46, 60, 70].map((x) => `<rect x="${x}" y="70" width="6" height="18" rx="2" fill="#D9C8A8"/><rect x="${x}" y="84" width="6" height="5" rx="1.5" fill="#6E4A2C"/>`).join('')}
<ellipse cx="22" cy="50" rx="12" ry="10" fill="#EADFC8"/><ellipse cx="13" cy="44" rx="5.5" ry="3" transform="rotate(-25 13 44)" fill="#DCCBAB"/>
<circle cx="18" cy="49" r="1.8" fill="#3A2A14"/><ellipse cx="13" cy="54" rx="3" ry="2" fill="#D9BFA8"/>
<circle cx="36" cy="38" r="5" fill="${U('cream')}" stroke="#CDBC9C" stroke-width="1"/>`,
  /* cedar logs for the altar's fire: three logs bound with a cord, seen end-on */
  logs: () => `${shadow(50, 92, 30, 3)}
<rect x="12" y="60" width="76" height="20" rx="6" fill="#8A5A2E" opacity=".35"/>
${[[34, 66], [66, 66], [50, 42]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="#7A5230"/><circle cx="${x}" cy="${y}" r="12" fill="#D9B07A"/><circle cx="${x}" cy="${y}" r="8" fill="none" stroke="#A8794A" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="4" fill="none" stroke="#A8794A" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="1.5" fill="#8A5A2E"/>`).join('')}
<path d="M22 58C34 50 66 50 78 58" stroke="#B8841E" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M22 60C34 52 66 52 78 60" stroke="#E9C765" stroke-width="1.2" fill="none"/>`,
  /* a basket of first fruits: woven, a handle, fruit on top */
  basket: () => `${shadow(50, 94, 30, 3)}
<path d="M28 44C34 14 66 14 72 44" stroke="${U('wood')}" stroke-width="5" fill="none" stroke-linecap="round"/>
<circle cx="40" cy="36" r="8" fill="#6B3A7A"/><circle cx="52" cy="32" r="9" fill="${U('crimson')}"/><path d="M48 23l4-3 4 3-4 2z" fill="#8E1E1A"/><circle cx="63" cy="38" r="7" fill="${U('green')}"/>
${[[30, 40], [34, 44], [28, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#2A4A7A"/>`).join('')}
<path d="M18 46H82L74 90H26Z" fill="#C9A06A"/>
${[54, 62, 70, 78].map((y) => `<path d="M${22 + (y - 46) / 5.5} ${y}H${78 - (y - 46) / 5.5}" stroke="#8A6A45" stroke-width="2"/>`).join('')}
${[32, 42, 52, 62, 72].map((x, q) => `<path d="M${x} 50L${x - 2 + (q % 2) * 4} 88" stroke="#A8794A" stroke-width="2" opacity=".7"/>`).join('')}
<rect x="14" y="42" width="72" height="8" rx="4" fill="${U('wood')}"/>`,
  /* the oil jug: a clay jug (the sealed jug of the Kohen Gadol), its mouth sealed with a gold seal — colours an illustration */
  jug: () => `${shadow(50, 95, 26, 3)}
<path d="M42 26H58C58 36 60 40 66 44C86 54 84 90 60 94H40C16 90 14 54 34 44C40 40 42 36 42 26Z" fill="${U('clay')}"/>
<path d="M59 34C80 28 86 46 72 54" stroke="#8A4A26" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M40 60C50 64 60 64 70 58" stroke="#F2B98A" stroke-width="1.6" fill="none" opacity=".8"/>
<ellipse cx="50" cy="25" rx="11" ry="4" fill="#B0603A"/>
<ellipse cx="38" cy="60" rx="6" ry="14" fill="#FFFFFF" opacity=".22"/>
<circle cx="50" cy="20" r="9" fill="${U('gold')}"/><circle cx="50" cy="20" r="5" fill="none" stroke="#7A4A08" stroke-width="1.4"/><path d="M50 16v8M46 20h8" stroke="#7A4A08" stroke-width="1.4"/>`,
  /* the salt of the offerings: a white heap on a wooden dish, crystals glinting (Lev. 2:13) */
  salt: () => `${shadow(50, 94, 32, 3)}
<path d="M12 72H88L80 88H20Z" fill="${U('wood')}"/><path d="M16 72H84" stroke="#D9B07A" stroke-width="2"/>
<path d="M20 72C28 52 42 42 50 36C58 42 72 52 80 72Z" fill="${U('linen')}"/><path d="M26 70C32 56 42 48 50 42C54 44 60 50 66 58" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".8"/>
${[[36, 60], [56, 54], [64, 66], [44, 48]].map(([x, y]) => `<rect x="${x - 3}" y="${y - 3}" width="6" height="6" transform="rotate(30 ${x} ${y})" fill="#FFFFFF" stroke="#CFC4AC" stroke-width="1"/>`).join('')}
${sparkle(30, 44, 5)}${sparkle(70, 50, 4)}${sparkle(52, 28, 4)}`,
  /* a shofar: a curved ram's horn, narrow mouthpiece to a wide bell */
  shofar: () => `${shadow(52, 92, 30, 3)}
<path d="M16 22C8 46 18 70 42 80C56 86 74 86 88 72L90 60C78 70 62 72 48 64C30 54 26 40 28 24Z" fill="${U('cream')}"/>
<path d="M16 22C8 46 18 70 42 80C56 86 74 86 88 72L90 60C78 70 62 72 48 64C30 54 26 40 28 24Z" fill="none" stroke="#8A6A45" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M22 40c6-2 8-2 12-6M26 54c6-2 10-3 14-8M36 68c8-2 12-4 16-10M58 76c8 0 14-2 20-6" stroke="#B89C70" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M16 22L28 24" stroke="#5A3618" stroke-width="3" stroke-linecap="round"/>
<path d="M84 66c3 2 5 4 6 8" stroke="#FFFFFF" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".8"/>`,
  /* the two silver trumpets, in a V */
  trumpets: () => `${shadow(50, 94, 30, 3)}
${[-22, 22].map((a) => `<g transform="rotate(${a} 50 92)"><rect x="47" y="34" width="6" height="52" fill="${U('silver')}"/><path d="M43 36H57L67 10H33Z" fill="${U('silver')}"/><ellipse cx="50" cy="10" rx="17" ry="4" fill="#E9EEF3" stroke="#7F8E9C" stroke-width="1"/><rect x="44" y="84" width="12" height="7" rx="2" fill="#9AA7B3"/><rect x="45" y="50" width="10" height="4" rx="1" fill="#B8C4CE"/><path d="M48 38V80" stroke="#FFFFFF" stroke-width="1.4" opacity=".8"/></g>`).join('')}`,
  /* a pomegranate: crimson, with its crown and a leaf */
  pomegranate: () => `${shadow(50, 94, 24, 3)}
<circle cx="50" cy="60" r="30" fill="${U('crimson')}"/>
<path d="M38 32L40 18L46 27L50 13L54 27L60 18L62 32Z" fill="#8E1E1A"/><path d="M42 32L50 30L58 32L56 36H44Z" fill="#B82A22"/>
<ellipse cx="72" cy="38" rx="11" ry="5" transform="rotate(-35 72 38)" fill="${U('green')}"/><path d="M64 44L80 32" stroke="#3E7A2A" stroke-width="1.2"/>
<ellipse cx="38" cy="50" rx="7" ry="11" transform="rotate(20 38 50)" fill="#FFFFFF" opacity=".25"/>`,
  /* the fire of the Chamber of the Hearth: a bronze chest-like brazier, coals and flames (an illustration) */
  moked: () => `${shadow(50, 95, 32, 3)}
<rect x="20" y="58" width="60" height="30" rx="3" fill="${U('bronze')}"/><path d="M20 58C30 50 70 50 80 58Z" fill="#D9A050"/>
<rect x="22" y="88" width="8" height="6" fill="#6A3E12"/><rect x="70" y="88" width="8" height="6" fill="#6A3E12"/>
<path d="M26 70H74M26 80H74" stroke="#6A3E12" stroke-width="1.4" opacity=".7"/><circle cx="50" cy="75" r="3" fill="#6A3E12"/>
${[[36, 56], [50, 54], [64, 56], [43, 58], [57, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#E0521B"/><circle cx="${x}" cy="${y}" r="2" fill="#FFC53D"/>`).join('')}
${flame(50, 52, 34)}${flame(36, 52, 20)}${flame(64, 52, 22)}`,
  /* the kohen's cap: a white linen cap, wound (Exodus 28:40) */
  cap: () => `${shadow(50, 88, 30, 4)}
<path d="M24 72C20 44 34 22 50 18C66 22 80 44 76 72Z" fill="${U('linen')}"/>
<path d="M28 60C38 54 62 54 72 60M30 50C40 44 60 44 70 50M34 40C42 34 58 34 66 40M40 30C46 26 54 26 60 30" stroke="#CFC4AC" stroke-width="2.2" fill="none" stroke-linecap="round"/>
<path d="M26 66C36 60 64 60 74 66" stroke="#FFFFFF" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".9"/>
<path d="M18 70H82C84 70 86 72 86 74V78C86 80 84 82 82 82H18C16 82 14 80 14 78V74C14 72 16 70 18 70Z" fill="#F7F2E6" stroke="#CFC4AC" stroke-width="1.5"/><path d="M20 76H80" stroke="#E6DCC6" stroke-width="2"/>
<path d="M36 30C40 25 45 22 50 21" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  /* the Levites' harp (nevel): a wooden frame, a gold crossbar, seven strings */
  harp: () => `${shadow(50, 94, 28, 3)}
<path d="M30 84C14 62 20 34 36 16L44 20C30 36 26 58 38 80Z" fill="${U('wood')}"/><path d="M70 84C86 62 80 34 64 16L56 20C70 36 74 58 62 80Z" fill="${U('wood')}"/>
<rect x="34" y="14" width="32" height="6" rx="3" fill="${U('gold')}"/><path d="M26 80C34 90 66 90 74 80L70 92H30Z" fill="${U('wood')}"/>
${[38, 42, 46, 50, 54, 58, 62].map((x) => `<path d="M${x} 20V84" stroke="#FFF8E0" stroke-width="1.3" opacity=".9"/>`).join('')}
<circle cx="50" cy="88" r="3" fill="#D9B45A"/>`,
  /* the ramp of the altar: a sloped ramp (no steps, Exodus 20:23) rising to the whitewashed altar with its red line */
  ramp: () => `${shadow(50, 94, 34, 3)}
<rect x="56" y="36" width="34" height="52" fill="${U('stone')}"/><rect x="56" y="59" width="34" height="4" fill="#C8302A"/>
<path d="M58 36h6v-7h-6zM82 36h6v-7h-6z" fill="#FAF2E2" stroke="#BFA98A" stroke-width="1"/>
<path d="M60 48h26M60 72h26M73 36v12M66 48v24M80 48v24M73 72v16" stroke="#BFA98A" stroke-width="1" opacity=".6"/>
<path d="M8 88L56 36V88Z" fill="#E9D7BB"/><path d="M8 88L56 36" stroke="#BFA98A" stroke-width="2"/>
<path d="M22 88L56 52M36 88L56 66" stroke="#BFA98A" stroke-width="1" opacity=".5"/>
<rect x="4" y="88" width="92" height="6" rx="2" fill="#BFA98A"/>${flame(73, 30, 10)}`,
};
export const PIC_IDS = Object.keys(PIC);
export function pic(id) { const f = PIC[id]; return f ? f() : ''; }
export function svg(id, cls = '') { return `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${pic(id)}</svg>`; }
/* the back face's emboss: an eight-petal rosette (a plain ornament of the stonework) */
export const ROSETTE = (() => {
  const petals = (dx, dy, c, o) => [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<ellipse cx="${50 + dx}" cy="${30 + dy}" rx="7" ry="20" transform="rotate(${a} ${50 + dx} ${50 + dy})" fill="${c}" opacity="${o}"/>`).join('');
  return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">${petals(0, 1.4, '#FFFFFF', 0.55)}${petals(0, -1.4, '#6E4A2C', 0.3)}${petals(0, 0, '#E9D7BB', 1)}<circle cx="50" cy="50" r="7" fill="#D9B45A" opacity=".55"/><circle cx="50" cy="50" r="3" fill="#FFF3C4" opacity=".8"/></svg>`;
})();
/* the פרוטה: a small bronze-gold coin with a pomegranate (never a face, never a pagan image) */
export const COIN = `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="50" r="46" fill="url(#tlg-coin)"/><circle cx="50" cy="50" r="38" fill="none" stroke="#8E5E12" stroke-width="2" opacity=".6"/><circle cx="50" cy="56" r="17" fill="#B8841E"/><path d="M42 40L44 31L48 36L50 28L52 36L56 31L58 40Z" fill="#8E5E12"/><ellipse cx="44" cy="50" rx="4" ry="6" fill="#FFF3C4" opacity=".35"/></svg>`;
