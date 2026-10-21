/* ─────────────────────────────────────────────────────────────────────────────
 * pitum.js: ── service13 ── "פיטום הקטורת" at Beit Avtinas (wave 13; the owner, 30.9: "כמו כן קטורת - פיטום הקטרת, עדיין
 * לדעתי לא נכנס למשחק" · row a117 of his table, "בית אבטינס על מעשה הקטרת", שקלים ה, א). No fail state; three parts:
 *   1. WEIGH the eleven spices on the balance in the baraita's order (כריתות ו ע״א): put the weight stone on the left pan
 *      (70 · 16 · 12 · 3 · 9 manim; a group's stone stays on the pan for its four) — a wrong stone explains itself with the
 *      baraita's own words — then hold to pour until the beam is level (too much: "הסר מעט"). A jar of honey stands on the
 *      shelf: "ואם נתן בה דבש פסלה" (כריתות ו ע״א).
 *   2. GRIND in the mortar to "הדק היטב היטב הדק" (כריתות ו ע״ב): the words come to the line, a tap on each pounds the
 *      pestle. An off-beat tap still pounds (no fail); the hint gives the chant and its reason.
 *   3. THE YEAR'S STORE: 368 manim — 365 for the days, a maneh a day ("פרס בשחרית ופרס בין הערבים", כריתות ו ע״ב), and 3 for
 *      the Kohen Gadol's handfuls on Yom Kippur (כריתות ו ע״א). The result `{ pitum: true }` makes index.js add it to the save
 *      (state.js pitumAdd); the morning's ketoret and the evening's then take ½ maneh each from it.
 * The spices' colours and jars are illustrations (their identifications are the content's open question: ketoret.json
 * rambam_identification, needs_check). Every tap target is ≥ 44 px on a 390-px phone (r ≥ 23 in the 360×230 picture).
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press, kohenFig, clamp } from './common.js';
import { hall } from './art.js';
import { SPICES, SPICE_WORDS, SPICE_SRC, PITUM_LINES, KETORET_YEAR } from '../data.js';
import { GATES, AVTINAS_FLOOR } from '../../places.js';

const CSS = `
.av-mg .av-p-hit{fill:transparent;cursor:pointer}
.av-mg .av-p-tgt{cursor:pointer}
.av-mg .av-p-tgt:focus{outline:none}
.av-mg .av-p-tgt:focus .av-p-ring,.av-mg .av-p-tgt.on .av-p-ring{stroke:#E8B94A;stroke-width:3}
.av-mg .av-p-ring{fill:none;stroke:rgba(232,185,74,.55);stroke-width:2;stroke-dasharray:4 3}
.av-mg .av-p-shelf{fill:#8C6A3F;stroke:#5A4226;stroke-width:1}
.av-mg .av-p-jar{stroke:#5A4226;stroke-width:1}
.av-mg .av-p-jar.done{opacity:.45}
.av-mg .av-p-jar.cur{stroke:#E8B94A;stroke-width:2.2}
.av-mg .av-p-honey{fill:#D9A43A;stroke:#7A5A1A;stroke-width:1}
.av-mg .av-p-post{fill:#8A6A3F;stroke:#4E3920;stroke-width:1}
.av-mg .av-p-beam{fill:#B8862A;stroke:#6E4A1A;stroke-width:1}
.av-mg .av-p-cord{stroke:#6E5A3A;stroke-width:1}
.av-mg .av-p-pan{fill:#C9A24A;stroke:#6E4A1A;stroke-width:1}
.av-mg .av-p-stone{fill:#7C766C;stroke:#3F3A33;stroke-width:1}
.av-mg .av-p-stone-t{fill:#FFF8E8;font:700 13px Heebo,sans-serif}
.av-mg .av-p-level{fill:none;stroke:#3F8F4E;stroke-width:3.5;stroke-linecap:round;opacity:0;transition:opacity .15s}
.av-mg .av-p-level.on{opacity:1}
.av-mg .av-p-stream{stroke-width:3;stroke-linecap:round;opacity:0}
.av-mg .av-p-lane{fill:rgba(40,28,14,.55);stroke:#A8916A;stroke-width:1}
.av-mg .av-p-hitline{fill:#E8B94A}
.av-mg .av-p-word rect{fill:#F4ECDA;stroke:#8A6A3F;stroke-width:1}
.av-mg .av-p-word text{fill:#3B2A12;font:700 15px Heebo,sans-serif}
.av-mg .av-p-word.hit rect{fill:#E8B94A;stroke:#8A6420}
.av-mg .av-p-word.late{opacity:.35}
.av-mg .av-p-mortar{fill:#BFB6A4;stroke:#6E675B;stroke-width:1.4}
.av-mg .av-p-pestle{fill:#9C8A6C;stroke:#5A4E3A;stroke-width:1;transition:transform .09s ease-in;transform-box:fill-box;transform-origin:50% 100%}
.av-mg .av-p-pestle.strike{transform:translateY(14px)}
.av-mg .av-p-grain{transition:r .25s}
.av-mg .av-p-bar{fill:#3B2E1E}
.av-mg .av-p-fill{fill:#E0A94A}
.av-mg .av-p-store{fill:#D8C194;stroke:#8A6A3F;stroke-width:1.4}
.av-mg .av-p-storefill{fill:#9A5B2E;transition:height .9s ease-out,y .9s ease-out}
.av-mg .av-p-smoke{fill:none;stroke:rgba(235,230,220,.85);stroke-width:4;stroke-linecap:round;opacity:0;transition:opacity .8s}
.av-mg .av-p-illus{fill:rgba(255,248,232,.75);font:500 9.5px Heebo,sans-serif}
.av-mg .av-p-rtl{direction:rtl}
`;
function ensureCss() {
  if (typeof document === 'undefined' || document.getElementById('av-pitum-css')) return;
  const s = document.createElement('style'); s.id = 'av-pitum-css'; s.textContent = CSS; document.head.appendChild(s);
}
/** a tap target in the picture: a group with a dashed ring and a transparent hit circle (r ≥ 23: ≥ 44.7 px at a phone's 0.97) */
function target(svg, x, y, r, label, onTap) {
  const g = svgEl('g', { class: 'av-p-tgt', tabindex: '0', role: 'button', 'aria-label': label }, svg);
  svgEl('circle', { cx: x, cy: y, r, class: 'av-p-ring' }, g);
  const hit = svgEl('circle', { cx: x, cy: y, r: Math.max(23, r), class: 'av-p-hit av-hit' }, g);
  g.addEventListener('pointerdown', (e) => { e.preventDefault(); onTap(g); });
  return { g, hit };
}
const walk = (W, to) => { try { return W.kohen('player', { garments: 'kohen' }).walkTo(to); } catch (e) { return null; } };

/** the spices' colours (illustration) */
const HUE = { tzori: '#C9A24A', tziporen: '#6B4A3A', chelbenah: '#B8B070', levonah: '#EDE3C8', mor: '#8B3E2F', ketziah: '#A8744A', shibolet_nerd: '#8A6A48', karkom: '#E08A1E', kosht: '#9C7B5B', kilufah: '#7A5230', kinamon: '#9A5B2E' };
/** the weight stones on the table, in manim (the baraita's five weights) */
const STONES = [70, 16, 12, 9, 3];
const G_WEIGHT = { g70: 70, g16: 16, kosht: 12, kilufah: 3, kinamon: 9 };
/** the chant (כריתות ו ע״ב): "הדק היטב היטב הדק" — one word a beat; a lyre note for each */
const CHANT = ['הדק', 'היטב', 'היטב', 'הדק'];
export const PITUM_BPM = 80;
const WORD_SPEED = 84;   // px/s in the lane
/** Beit Avtinas from the azara: the upper chamber over the Water Gate (places.js BEIT_AVTINAS; illustration) */
export const AVTINAS_SHOT = { p: [-6, 58, 24], t: [-38, AVTINAS_FLOOR + 2, 71] };

export const pitum = {
  id: 'pitum', title: 'פיטום הקטורת', kicker: 'בית אבטינס',
  intro: 'בבית אבטינס מכינים את הקטורת לכל השנה: שוקלים אחד עשר סממנים, כל אחד במשקלו — ושוחקים אותם דק דק, בקצב.',
  introAgain: 'שקול את אחד עשר הסממנים ושחוק בקצב: "הדק היטב, היטב הדק".',
  stage(W) { W.time('noon'); W.look(AVTINAS_SHOT, 1500); return walk(W, [GATES.mayim.x, GATES.mayim.z - 9]); },
  play(api) {
    ensureCss();
    const svg = api.svg('0 0 360 230', 'בית אבטינס: המאזניים, אחד עשר הסממנים והמכתשת');   // (360×230: on a phone the card's 27vh keeps it full width)
    hall(svg, 360, 230, { wall: 34 });
    svgEl('text', { x: 4, y: 227, class: 'av-p-illus' }, svg).textContent = 'צורות הסממנים וצבעיהם — המחשה';
    kohenFig(svg, { x: 32, y: 126, s: 1.05 });
    // ── the shelf: the eleven jars in the baraita's order (right to left), and a jar of honey at its end ──
    svgEl('rect', { x: 50, y: 47, width: 306, height: 6, rx: 2, class: 'av-p-shelf' }, svg);
    const jars = SPICES.map((s, i) => {
      const x = 340 - i * 26.5, g = svgEl('g', {}, svg);
      svgEl('path', { d: `M${x - 8} 46 q-2 -12 3 -17 h10 q5 5 3 17 z`, fill: HUE[s.id] || '#A8744A', class: 'av-p-jar' }, g);
      svgEl('rect', { x: x - 4.5, y: 25, width: 9, height: 5, rx: 1.5, fill: '#8C6A3F' }, g);
      return { s, x, g, path: g.firstChild };
    });
    const honey = target(svg, 24, 36, 23, 'צנצנת דבש', () => {
      if (phase !== 'weigh') return;
      api.miss(`"${PITUM_LINES.honey.quote}" (${PITUM_LINES.honey.source}) — דבש אינו נכנס לקטורת.`);
    });
    svgEl('path', { d: 'M16 46 q-3 -13 4 -18 h8 q7 5 4 18 z', class: 'av-p-honey' }, honey.g);
    svgEl('text', { x: 24, y: 42, class: 'av-lab small', 'text-anchor': 'middle' }, honey.g).textContent = 'דבש';
    // ── the balance ──
    const PX = 200, PY = 84, ARM = 78, DROP = 40;
    const bal = svgEl('g', {}, svg);
    svgEl('rect', { x: PX - 4, y: PY, width: 8, height: 86, rx: 2, class: 'av-p-post' }, bal);
    svgEl('rect', { x: PX - 26, y: PY + 82, width: 52, height: 8, rx: 3, class: 'av-p-post' }, bal);
    const beam = svgEl('rect', { x: PX - ARM - 4, y: PY - 3, width: ARM * 2 + 8, height: 6, rx: 3, class: 'av-p-beam' }, bal);
    const level = svgEl('path', { d: `M${PX - 26} ${PY + 14} h52 M${PX - 26} ${PY + 10} v8 M${PX + 26} ${PY + 10} v8`, class: 'av-p-level' }, bal);
    svgEl('circle', { cx: PX, cy: PY, r: 4, fill: '#6E4A1A' }, bal);
    const pan = (side) => {
      const g = svgEl('g', {}, bal);
      svgEl('path', { d: `M0 0 L-16 ${DROP} M0 0 L16 ${DROP}`, class: 'av-p-cord' }, g);
      svgEl('path', { d: `M-22 ${DROP} q22 14 44 0 z`, class: 'av-p-pan' }, g);
      const load = svgEl('g', {}, g);
      return { g, load, side };
    };
    const stonePan = pan(-1), spicePan = pan(1);
    const heap = svgEl('path', { d: '', fill: '#A8744A', stroke: 'rgba(60,40,20,.5)', 'stroke-width': 0.8 }, spicePan.load);
    const stream = svgEl('line', { x1: 0, y1: 0, x2: 0, y2: 0, class: 'av-p-stream' }, bal);
    const nameEl = svgEl('text', { x: PX, y: PY - 16, class: 'av-lab av-p-rtl', 'text-anchor': 'middle' }, bal);   // (over the pivot: clear of the beam's ends and the shelf)
    let angle = 0;
    function setBeam(a) {
      angle = a;
      const r = (a * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
      beam.setAttribute('transform', `rotate(${a} ${PX} ${PY})`);
      stonePan.g.setAttribute('transform', `translate(${PX - ARM * c} ${PY - ARM * s})`);
      spicePan.g.setAttribute('transform', `translate(${PX + ARM * c} ${PY + ARM * s})`);
    }
    // ── the weight stones on the table ──
    const stones = STONES.map((w, i) => {
      const x = 330 - i * 58, y = 204;
      const t = target(svg, x, y, 24, `אבן משקל ${w} מנה`, () => pickStone(w, t));
      svgEl('rect', { x: x - 17, y: y - 12, width: 34, height: 24, rx: 7, class: 'av-p-stone' }, t.g);
      svgEl('text', { x, y: y + 5, class: 'av-p-stone-t', 'text-anchor': 'middle' }, t.g).textContent = String(w);
      return { w, t };
    });
    // controls
    const pour = api.button('החזק — שפוך', () => {}, 'gold hold'); pour.dataset.k = 'pour';
    const less = api.button('הסר מעט', () => takeOut(), ''); less.dataset.k = 'less';
    const holdPour = api.hold(pour);
    pour.disabled = true; less.disabled = true;

    let phase = 'weigh', k = 0, onPan = 0, amount = 0, wasHeld = false, locked = false;
    const cur = () => SPICES[k];
    function showSpice() {
      const s = cur();
      wasHeld = false;
      jars.forEach((j, i) => { j.path.classList.toggle('cur', i === k); j.path.classList.toggle('done', i < k); });
      amount = 0; locked = false; heap.setAttribute('d', ''); heap.setAttribute('fill', HUE[s.id] || '#A8744A'); level.classList.remove('on');
      const need = G_WEIGHT[s.group];
      nameEl.textContent = onPan === need ? `${s.label} · ${need} מנה` : `${s.label} — כמה מנה?`;
      if (onPan !== need) {
        onPan = 0; stonePan.load.innerHTML = '';
        stones.forEach((x) => x.t.g.classList.remove('on'));
        pour.disabled = true;
        api.cite({ quote: SPICE_WORDS[s.group], source: SPICE_SRC, status: 'draft' });
        api.hint(`${s.label}: הנח על הכף את אבן המשקל שלו — הברייתא אומרת כמה.`);
      } else {
        pour.disabled = false;
        api.hint(`${s.label}: אותו משקל כמו הקודם — החזק "שפוך" עד שהמאזניים מתאזנים.`);
      }
      setBeam(onPan ? -12 : 0);
    }
    function pickStone(w, t) {
      if (phase !== 'weigh' || locked) return;
      const s = cur(), need = G_WEIGHT[s.group];
      if (w !== need) { api.miss(`"${SPICE_WORDS[s.group]}" (${SPICE_SRC}) — ${s.label}: ${need} מנה, לא ${w}.`); return; }
      if (onPan === need) return;
      onPan = need;
      stones.forEach((x) => x.t.g.classList.toggle('on', x.t === t));
      stonePan.load.innerHTML = '';
      svgEl('rect', { x: -12, y: DROP - 14, width: 24, height: 13, rx: 4, class: 'av-p-stone' }, stonePan.load);
      svgEl('text', { x: 0, y: DROP - 4, class: 'av-p-stone-t', 'text-anchor': 'middle', style: 'font-size:10px' }, stonePan.load).textContent = String(need);
      api.sfx && api.sfx.play('ui');
      nameEl.textContent = `${s.label} · ${need} מנה`;
      setBeam(-12);
      pour.disabled = false;
      api.hint(`נכון — ${need} מנה. עכשיו החזק "שפוך", ושחרר כשהקו הירוק מופיע: המאזניים מאוזנים.`, 'ok');
    }
    const tol = () => Math.max(0.5, G_WEIGHT[cur().group] * 0.1);
    function takeOut() {
      if (phase !== 'weigh' || locked) return;
      const need = G_WEIGHT[cur().group];
      amount = Math.max(0, amount - need * 0.07);
      api.sfx && api.sfx.play('ui');
      check(true);   // (taken back into the level: it settles; still too much or now too little: the hint says so)
    }
    function drawHeap() {
      const need = G_WEIGHT[cur().group], h = 3 + 13 * clamp(amount / need, 0, 1.3);
      heap.setAttribute('d', amount > 0 ? `M-18 ${DROP + 1} q18 ${-h * 2} 36 0 z` : '');
    }
    function check(released) {
      const need = G_WEIGHT[cur().group], d = amount - need;
      setBeam(clamp((d / need) * 30, -12, 12));
      level.classList.toggle('on', Math.abs(d) <= tol());   // the green line: release now
      drawHeap();
      less.disabled = !(d > tol());
      if (!released) return;
      if (Math.abs(d) <= tol()) { settle(); return; }
      if (d < 0) api.hint('עוד קצת — החזק שוב "שפוך".');
      else api.hint('יותר מדי — הקש "הסר מעט" עד שהמאזניים מתאזנים.');
    }
    function settle() {
      locked = true; pour.disabled = true; less.disabled = true;
      amount = G_WEIGHT[cur().group]; drawHeap(); setBeam(0); level.classList.add('on');
      stream.style.opacity = '0';
      api.sfx && api.sfx.play('chime', { n: 3 + (k % 5) });
      api.sparkle(((PX + ARM) / 360) * 100, 52, 8);
      const cb = cur().id === 'chelbenah';   // the galbanum smells bad — and still it is one of the eleven (כריתות ו ע״ב)
      api.hint(cb ? `${cur().label} — ${G_WEIGHT[cur().group]} מנה. ריחה רע, ובכל זאת היא אחת מאחד עשר הסממנים.` : `${cur().label} — ${G_WEIGHT[cur().group]} מנה. מאוזן!`, 'ok');
      if (cb) api.cite(PITUM_LINES.chelbenah);
      api.after(cb ? 1500 : 520, () => {
        k++;
        if (k < SPICES.length) { showSpice(); return; }
        jars.forEach((j) => { j.path.classList.remove('cur'); j.path.classList.add('done'); });
        grind();
      });
    }
    api.loop((dt) => {
      if (phase !== 'weigh' || locked || !onPan) return;
      const held = holdPour.held() && !pour.disabled;
      if (held) {
        const need = G_WEIGHT[cur().group];
        amount = Math.min(need * 1.3, amount + (need / 1.8) * dt);   // (the jar gives no more than a little over)
        const r = (angle * Math.PI) / 180, ex = PX + ARM * Math.cos(r), ey = PY + ARM * Math.sin(r);
        stream.setAttribute('x1', ex); stream.setAttribute('y1', 54); stream.setAttribute('x2', ex); stream.setAttribute('y2', ey + DROP - 4);
        stream.setAttribute('stroke', HUE[cur().id] || '#A8744A'); stream.style.opacity = '1';
        check(false);
      } else stream.style.opacity = '0';
      if (wasHeld && !held) check(true);
      wasHeld = held;
    });

    // ── 2. the mortar: "הדק היטב היטב הדק" ──
    const ROUNDS = api.repeat ? 2 : 4;
    const beat = 60 / PITUM_BPM, GAP = WORD_SPEED * beat, HIT = 292;
    let words = [], fine = 0, hits = 0, grindBtn = null, strikeT = 0, toldBeat = false, toldWhy = false;
    let mortar = null, pestle = null, grains = [], fineBar = null, laneG = null;
    function grind() {
      phase = 'grind';
      pour.remove(); less.remove();
      bal.style.transition = 'opacity .5s'; bal.style.opacity = '0';
      stones.forEach((x) => x.t.g.remove()); honey.g.remove();
      api.cite(PITUM_LINES.chant);
      api.hint('במכתשת: הקש "הדק!" כשהמילה מגיעה לקו — בקצב: הדק היטב, היטב הדק.');
      // the lane
      const lane = laneG = svgEl('g', {}, svg);
      svgEl('rect', { x: 14, y: 70, width: 332, height: 34, rx: 17, class: 'av-p-lane' }, lane);
      svgEl('rect', { x: HIT - 2.5, y: 64, width: 5, height: 46, rx: 2, class: 'av-p-hitline' }, lane);
      // the mortar and the pestle
      mortar = target(svg, 200, 166, 40, 'המכתשת', () => strike());
      svgEl('path', { d: 'M160 150 h80 q-4 40 -40 40 q-36 0 -40 -40 z', class: 'av-p-mortar' }, mortar.g);
      svgEl('ellipse', { cx: 200, cy: 150, rx: 40, ry: 7, fill: '#8C8374' }, mortar.g);
      for (let i = 0; i < 16; i++) grains.push(svgEl('circle', { cx: 170 + (i % 8) * 8.5, cy: 150 + Math.floor(i / 8) * 3, r: 3.2, fill: HUE[SPICES[i % 11].id], class: 'av-p-grain' }, mortar.g));
      pestle = svgEl('rect', { x: 206, y: 104, width: 11, height: 48, rx: 5, class: 'av-p-pestle' }, mortar.g);
      svgEl('rect', { x: 100, y: 214, width: 180, height: 8, rx: 4, class: 'av-p-bar' }, svg);
      fineBar = svgEl('rect', { x: 100, y: 214, width: 0, height: 8, rx: 4, class: 'av-p-fill' }, svg);
      svgEl('text', { x: 190, y: 209, class: 'av-lab small', 'text-anchor': 'middle' }, svg).textContent = 'דק מן הדק';
      grindBtn = api.button('הדק!', () => strike(), 'gold'); grindBtn.dataset.k = 'grind';
      const N = CHANT.length * ROUNDS;
      for (let i = 0; i < N; i++) {
        const g = svgEl('g', { class: 'av-p-word' }, lane), w = CHANT[i % 4];
        const rect = svgEl('rect', { x: -24, y: 76, width: 48, height: 22, rx: 11 }, g);
        const tx = svgEl('text', { x: 0, y: 92, 'text-anchor': 'middle' }, g); tx.textContent = w;
        words.push({ g, rect, w, i, x: 40 - i * GAP, done: false });
      }
      moveWords(0);
      phase = 'grind';
    }
    function moveWords(dt) {
      let left = 0;
      for (const o of words) {
        if (!o.done) { o.x += dt * WORD_SPEED; if (o.x > HIT + 24) { o.done = true; o.g.classList.add('late'); } else left++; }
        o.g.setAttribute('transform', `translate(${o.x} 0)`);
        o.g.style.opacity = o.x < 18 ? '0' : '';   // (behind the lane's start: not yet shown)
      }
      return left;
    }
    api.loop((dt) => {
      if (phase !== 'grind') return;
      if (!moveWords(dt)) { phase = 'ground'; api.after(350, pinch); }
    });
    function strike() {
      if (phase !== 'grind') return;
      const o = words.find((x) => !x.done && Math.abs(x.x - HIT) <= 22);
      pestle.classList.add('strike');
      clearTimeout(strikeT); strikeT = setTimeout(() => pestle && pestle.classList.remove('strike'), 120);
      api.sfx && api.sfx.play('step');
      if (o) {
        o.done = true; o.g.classList.add('hit'); hits++;
        fine = Math.min(1, fine + 1 / words.length);
        api.sfx && api.sfx.play('lyre', { n: o.w === 'הדק' ? 0 : 4 });
        api.float(o.w + '!', 58, 52);   // the word said aloud, over the mortar
        if (hits % 4 === 0) api.sparkle((HIT / 360) * 100, 38, 8);
        if (hits === Math.round(words.length / 2) && !toldWhy) { toldWhy = true; api.cite(PITUM_LINES.why); }   // halfway: why they spoke
      } else {
        fine = Math.min(1, fine + 0.3 / words.length);
        if (!toldBeat) { toldBeat = true; api.hint('בקצב הדיבור — הקש כשהמילה על הקו: "הדק היטב, היטב הדק".'); }
      }
      fineBar.setAttribute('width', 180 * fine);
      grains.forEach((g, i) => g.setAttribute('r', Math.max(0.9, 3.2 * (1 - fine * 0.75) - (i % 3) * 0.2)));
    }

    // ── 2½. a pinch of "מעלה עשן" (כריתות ו ע״א "מעלה עשן כל שהוא"; the Rambam adds it last): Beit Avtinas' secret — on the
    // golden altar their smoke "מתמר ועולה כמקל", the Alexandrians' "מפציע לכאן ולכאן" (יומא לח ע״א). The inset is an illustration.
    let pinchT = null;
    function pinch() {
      phase = 'pinch';
      if (grindBtn) grindBtn.remove();
      if (laneG) { laneG.style.transition = 'opacity .4s'; laneG.style.opacity = '0'; }   // the lane's words are said
      if (pestle) pestle.style.opacity = '0';
      api.cite(PITUM_LINES.ashan);
      api.hint('ולבסוף — קורט אחד של "מעלה עשן", כל שהוא. הקש עליו.');
      pinchT = target(svg, 268, 170, 24, 'קורט מעלה עשן', () => addPinch());
      svgEl('ellipse', { cx: 268, cy: 176, rx: 14, ry: 5, fill: '#8C8374' }, pinchT.g);
      svgEl('path', { d: 'M258 175 q10 -12 20 0 z', fill: '#6E6A5A' }, pinchT.g);
      svgEl('text', { x: 268, y: 202, class: 'av-lab small', 'text-anchor': 'middle' }, pinchT.g).textContent = 'מעלה עשן';
    }
    function addPinch() {
      if (phase !== 'pinch') return;
      phase = 'smoke';
      pinchT.g.remove();
      api.sfx && api.sfx.play('fire');
      grains.forEach((g) => g.setAttribute('fill', '#8A6A48'));   // mixed: one colour
      const inset = svgEl('g', { opacity: 0, style: 'transition:opacity .5s' }, svg);
      svgEl('rect', { x: 92, y: 60, width: 176, height: 84, rx: 10, fill: 'rgba(255,248,232,.94)', stroke: '#A8916A' }, inset);
      for (const [x, straight, lab] of [[140, false, 'אחרים'], [220, true, 'בית אבטינס']]) {
        svgEl('rect', { x: x - 18, y: 118, width: 36, height: 8, rx: 2, fill: '#D9B45A', stroke: '#8A6420' }, inset);   // a golden altar's top
        const d = straight ? `M${x} 116 q-2 -12 0 -24 q2 -12 0 -26` : `M${x} 116 q-2 -8 -10 -16 q-8 -8 -12 -20 M${x} 110 q6 -8 12 -12 q6 -6 8 -18 M${x} 104 q-2 -10 2 -18`;
        svgEl('path', { d, class: 'av-p-smoke', style: 'opacity:1;stroke:#9A9488' }, inset);
        svgEl('text', { x, y: 138, class: 'av-lab small', 'text-anchor': 'middle' }, inset).textContent = lab;
      }
      svgEl('text', { x: 262, y: 72, class: 'av-lab small', 'text-anchor': 'end' }, inset).textContent = 'המחשה';
      requestAnimationFrame(() => inset.setAttribute('opacity', 1));
      api.cite(PITUM_LINES.stick);
      api.hint('זה הסוד של בית אבטינס: העשן שלהם "מתמר ועולה כמקל".', 'ok');
      api.after(1800, () => { inset.setAttribute('opacity', 0); api.after(300, () => { inset.remove(); store(); }); });
    }

    // ── 3. the year's store ──
    function store() {
      phase = 'store';
      const S = svgEl('g', {}, svg);
      svgEl('path', { d: 'M296 190 q-14 -8 -12 -40 q2 -22 16 -26 v-8 h20 v8 q14 4 16 26 q2 32 -12 40 z', class: 'av-p-store' }, S);
      const fill = svgEl('rect', { x: 290, y: 188, width: 40, height: 0, class: 'av-p-storefill' }, S);
      const num = svgEl('text', { x: 310, y: 100, class: 'av-lab big av-p-rtl', 'text-anchor': 'middle' }, S);
      svgEl('text', { x: 310, y: 204, class: 'av-lab small', 'text-anchor': 'middle' }, S).textContent = 'אוצר הקטורת';
      const Y = KETORET_YEAR;
      let n = 0;
      const tick = () => { n = Math.min(Y.manim, n + 23); num.textContent = `${n} מנה`; if (n < Y.manim) api.after(40, tick); };
      tick();
      requestAnimationFrame(() => { fill.setAttribute('y', 130); fill.setAttribute('height', 58); });
      api.sfx && api.sfx.play('chime', { n: 8 });
      api.after(900, () => {
        api.cite(PITUM_LINES.year);
        api.done({
          text: `הקטורת של השנה מוכנה: ${Y.manim} מנה — ${Y.days} לימות השנה, מנה ליום (חצי בבוקר וחצי בין הערביים), ו־${Y.yk} לחפינת הכהן הגדול ביום הכיפורים.`,
          linger: 2200, pitum: true, fine: Math.round(fine * 100) / 100, hits, score: hits,
        });
      });
    }

    showSpice();
    // the solver (the harness): the right stone, hold until level, then every word on the line
    api.solver(async () => {
      while (phase === 'weigh') {
        const s = cur(), need = G_WEIGHT[s.group];
        if (onPan !== need) { const st = stones.find((x) => x.w === need); press(st.t.hit, 'down'); await api.wait(40); continue; }
        if (locked) { await api.wait(30); continue; }
        press(pour, 'down');
        while (!locked && amount < need - tol() * 0.5) await api.wait(8);
        press(pour, 'up');
        await api.wait(60);
      }
      while (phase === 'grind') {
        if (words.some((x) => !x.done && Math.abs(x.x - HIT) <= 12)) press(grindBtn);
        await api.wait(8);
      }
      while (phase === 'ground') await api.wait(20);
      if (phase === 'pinch' && pinchT) press(pinchT.hit, 'down');
    });
    return () => clearTimeout(strikeT);
  },
};
