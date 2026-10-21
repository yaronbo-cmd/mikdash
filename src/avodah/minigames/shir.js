/* ─────────────────────────────────────────────────────────────────────────────
 * shir.js: the libations and the song of the day (Tamid 7:3–4; Sukkah 4:9, 5:5; Arachin 2:3, 2:5–6).
 * 1. (Sukkot) the water libation: the people call "הגבה ידך!" — raise your hand high, then pour.
 * 2. The wine at the south-west horn: hold to pour.
 * 3. ── avoda12 ── (wave 12, the owner: "הלויים שיר של יום בכל יום") the signal: the kohen bends to pour, the sgan waves the
 *    cloths — and the player strikes the צלצל at that moment, in Ben Arza's place (⚑ המחשה): "שחה לנסך, והניף הסגן
 *    בסודרין, והקיש בן ארזא בצלצל, ודברו הלוים בשיר" (Tamid 7:3). An early tap only waits; nothing is ever stuck.
 * 4. The song of TODAY (shir_shel_yom.json, Tamid 7:4) by the Levites on the duchan with their instruments — kinorot,
 *    nevalim, the one tziltzal, and on the twelve days of Arachin 2:3 the chalil; the kohanim's two trumpets beside Ben
 *    Arza. Tap the lyre notes as they reach the line. At each פרק: the trumpets — תקיעה (hold), תרועה (three quick taps),
 *    תקיעה (hold) — and the people bow. Each פרק shows one true line: the Mishnah's words for today; why this psalm today
 *    (RH 31a); the chalil's days (Arachin 2:3) or the ma'amad (Yoma 20b).
 *    Nine blasts for the morning Tamid (Sukkah 5:5) = three פרקים — Rashi on Sukkah 53b: "ושלשה פרקים היו בשיר"
 *    (avodah_gaps.json shir_perakim; the day's 21 blasts: trumpets_count).
 *    On a repeat the song plays one פרק of the three (docs/HOOKS.md §13: ~10 s a morning); the card says so.
 * 5. The musaf's song (segment 'musaf'): on Shabbat Haazinu, one of its six parts (RH 31a, ⚑ which part); on Chol HaMoed
 *    Sukkot the day's psalm (Sukkah 55a, בבדיקה).
 * The music: Phase B events through ctx.emit → main.js → music.event(type, d, 'B') (WORLD12's `shir` state, agreed on the bus):
 * shirBlast {n: 0, kind: 'ttt'} (the two kohanim at the table of fats as the wine is given), shirStart {day, psalm, chalil,
 * perakim, bpm, musaf?, part?} (the cymbal: the Levites begin), shirBlast {n, kind: 'tekiah' | 'teruah'} (the player's blasts at
 * each פרק's end), shirEnd (back to `phaseB`; also when the game is skipped).
 * ──────────────────────────────────────────────────────────────────────────── */
import { svgEl, press, esc } from './common.js';
import { gapGame, gapLine, gap, dayLine, shirWhy, chalilToday, haazinuPart } from '../data.js';
import { hall, levite, person } from './art.js';
import { LEVEL } from '../../places.js';

/** the beat of the Levites' song (one lyre note a beat): WORLD12's `shir` state, docs/MUSIC.md */
export const SHIR_BPM = 92;
const NOTE_SPEED = 95;   // px/s in the lane

/** The musaf's song of a day, or null: Shabbat → Haazinu's part; Chol HaMoed Sukkot → the day's psalm (Sukkah 55a). */
export function musafSong(theme, dayKey) {
  const info = (theme && theme.info) || {};
  if (info.isShabbat) {
    const p = haazinuPart(dayKey);
    return p ? { kind: 'haazinu', n: p.n, title: `שירת האזינו — חלק ${p.n} מששה: "${p.he}"`, source: 'ראש השנה לא, א', flag: true } : null;
  }
  const sd = theme && theme.sukkot ? theme.sukkot.day : 0;
  if (sd >= 2 && sd <= 7) {
    const g = gap('shir_musaf_days'), list = ['הבו לה׳ בני אלים', 'ולרשע אמר אלקים', 'מי יקום לי עם מרעים', 'בינו בוערים בעם', 'הסירותי מסבל שכמו', 'ימוטו כל מוסדי ארץ'];
    return g ? { kind: 'sukkot', n: sd - 1, title: `שיר המוסף, יום ${sd - 1} של חול המועד: "${list[sd - 2]}"`, source: 'סוכה נה, א', check: true } : null;
  }
  return null;
}

export const shir = {
  id: 'shir', title: 'נסכים ושיר של יום', kicker: 'המזבח והדוכן',
  intro: 'נסך את היין בקרן הדרומית־מערבית. כשהסגן מניף בסודרין — הקש בצלצל, והלויים פותחים בשיר של יום. ובכל פרק: חצוצרות, והעם משתחווים.',
  introAgain: 'נסך את היין, הקש בצלצל — והלויים בשיר. הפעם פרק אחד מן השלושה.',
  stage(W) { W.look('altarTop', 1500); W.av('limbs', 'fire'); },
  after(W) { W.av('levites', false); W.av('bow', false); },
  play(api) {
    const { ctx } = api, W = api.world;
    const theme = ctx.theme || {};
    const psalm = theme.psalm || null;
    const musaf = ctx.segment === 'musaf' ? musafSong(theme, ctx.day) : null;
    const water = !!(theme.sukkot && theme.sukkot.water) && ctx.segment !== 'erev' && ctx.segment !== 'musaf';
    const chalil = chalilToday(theme.info);
    const weekday = theme.info && typeof theme.info.weekday === 'number' ? theme.info.weekday : (psalm ? psalm.js_weekday : 0);
    // the music (WORLD12's `shir` state, agreed on the bus): shirStart {day…} · shirBlast {n, kind} · shirEnd
    const emit = (type, d = {}) => { try { if (ctx.emit) ctx.emit(type, d); } catch (e) { /* the music is optional */ } };
    let sang = false, ended = false;
    const endSong = () => { if (sang && !ended) { ended = true; emit('shirEnd', {}); } };
    api.onCleanup(endSong);
    const svg = api.svg('0 0 360 250', 'המזבח, הדוכן והעם');
    svg.classList.add('av-shir');
    let phase = water ? 0 : 1;
    const bg = svgEl('rect', { x: 0, y: 0, width: 360, height: 250, class: 'av-court' }, svg);
    const top = svgEl('g', {}, svg);
    svgEl('rect', { x: 20, y: 40, width: 150, height: 110, class: 'av-altartop' }, top);
    svgEl('text', { x: 95, y: 32, class: 'av-lab', 'text-anchor': 'middle' }, top).textContent = 'המזבח';
    svgEl('rect', { x: 20, y: 130, width: 22, height: 20, class: 'av-horn' }, top);
    svgEl('text', { x: 46, y: 146, class: 'av-lab small' }, top).textContent = 'קרן דרומית־מערבית';
    const bowls = svgEl('g', {}, top);
    svgEl('ellipse', { cx: 31, cy: 124, rx: 8, ry: 3, class: 'av-silver' }, bowls);
    svgEl('ellipse', { cx: 50, cy: 124, rx: 8, ry: 3, class: 'av-silver' }, bowls);
    svgEl('path', { d: 'M200 60 L200 20 L230 28 L200 36', class: 'av-flag' }, top);
    svgEl('text', { x: 215, y: 76, class: 'av-lab small', 'text-anchor': 'middle' }, top).textContent = 'הסגן והסודרים';
    const people = svgEl('g', { class: 'av-crowd' }, svg);
    for (let k = 0; k < 14; k++) person(people, 190 + (k % 7) * 23 + (k >= 7 ? 11 : 0), 184 + Math.floor(k / 7) * 26, 1.1, k);
    const meter = document.createElement('div');
    meter.className = 'av-meter'; meter.innerHTML = '<i></i><span></span>';
    api.play.appendChild(meter);
    const setMeter = (u, label) => { meter.querySelector('i').style.width = `${Math.round(u * 100)}%`; meter.querySelector('span').textContent = label; };
    const hold = api.button(water ? 'הגבה ידך!' : 'החזק כדי לנסך', () => {}, 'gold hold');
    const H = api.hold(hold);
    let u = 0;
    // "נתנו לו יין לנסך … ושני כהנים עומדים על שלחן החלבים ושתי חצוצרות של כסף בידם, תקעו והריעו ותקעו" (Tamid 7:3)
    const wineGiven = () => { W && W.av('trumpets'); emit('shirBlast', { n: 0, kind: 'ttt' }); api.sfx && api.sfx.play('tekiah'); };
    if (water) {
      api.hint('ניסוך המים: העם קורא "הגבה ידך!" — הרם את היד גבוה ונסך לספל.');
      setMeter(0, 'מים');
    } else { api.hint('"נתנו לו יין לנסך" — שני כהנים תוקעים. החזק כדי לנסך בקרן הדרומית־מערבית.'); setMeter(0, 'יין'); wineGiven(); }
    // 3D: "עלה בכבש ופנה לשמאלו, שני ספלים של כסף היו שם ... מערבי של מים, מזרחי של יין" (Sukkah 4:9)
    const T3 = api.three;
    let bowlWarned = false;
    const bowls3d = () => {
      if (!T3) return;
      const y = LEVEL.altarTop + 0.35;
      const pick = (west) => (d) => {
        if (d && (phase === 0) !== west && !bowlWarned) { bowlWarned = true; api.hint('"מערבי של מים, מזרחי של יין" — ואם החליף, יצא (סוכה ד, ט).'); }
        H.set(d);
      };
      // the world's two bowls stand on the altar's top by the SW horn (the libation props of avodah3d.js: west
      // (-51.2, 9.6), east (-50.2, 10.1)); the rings fan out ×2.6 around them so a finger tells them apart
      const W0 = [-51.2, 9.6], E0 = [-50.2, 10.1], M = [(W0[0] + E0[0]) / 2, (W0[1] + E0[1]) / 2], k = 2.6;
      const at = (b) => [M[0] + (b[0] - M[0]) * k, y, M[1] + (b[1] - M[1]) * k];
      T3.targets([
        { key: 'bowl-west', at: at(W0), label: 'הספל המערבי', onHold: pick(true) },
        { key: 'bowl-east', at: at(E0), label: 'הספל המזרחי', onHold: pick(false) },
      ]);
      (api.controls).appendChild(meter);
    };
    if (T3) { T3.focus('shitin', 900); bowls3d(); }
    api.loop((dt) => {
      if (phase > 1) return;
      if (!H.held()) return;
      u = Math.min(1, u + dt * 0.55);
      setMeter(u, phase === 0 ? 'מים' : 'יין');
      if (Math.random() < 0.08) api.sfx && api.sfx.play('pour');
      if (u < 1) return;
      H.set(false);
      if (phase === 0) {
        W && W.av('libation', 'water');
        api.hint('"הגבה ידך!" — וכל העם ראה. עכשיו היין.', 'ok');
        phase = 1; u = 0; setMeter(0, 'יין'); hold.innerHTML = 'החזק כדי לנסך';
        api.sfx && api.sfx.play('chime', { n: 5 });
        api.after(700, wineGiven);
        return;
      }
      phase = 2; hold.remove(); meter.remove();
      if (T3) T3.clear();
      W && W.av('libation', 'wine'); W && W.kohen('player').pose('pour');
      W && W.av('levites', true, { chalil });
      W && W.look('duchan', 1400);
      signal();
    });

    /* ── the duchan: the hall, the Levites with their instruments, the sgan's cloths — and the cymbal ── */
    const PERAKIM = gapGame('shir_perakim', 'perakim', 3), PER = api.repeat ? 1 : PERAKIM;
    const beat = 60 / SHIR_BPM, GAP = NOTE_SPEED * beat, NOTES = 6;
    const pm = ctx.segment === 'erev';
    let perek = 0, notes = [], lane = null, hitLine = 70, laneBtn = null, trumpetBtn = null, cymBtn = null, tSeq = [], tState = 0, pressT = 0, tapCount = 0, tapTimer = null;
    let score = 0, waved = false, wavedAt = 0, benArza = null, sganFlag = null, perekEl = null;
    const head = document.createElement('div');
    head.className = 'av-shir-head';
    head.style.cssText = 'margin:2px 2px 4px;font:500 13px/1.45 Heebo,sans-serif';
    const psalmHTML = musaf
      ? `<b>${esc(musaf.title)}</b> <span class="av-ref">${esc(musaf.source)}</span>${musaf.flag ? ' <span class="av-draft">⚑ טיוטה</span>' : ''}${musaf.check ? ' <span class="av-draft av-check">בבדיקה</span>' : ''}`
      : psalm ? `<b>שיר של יום · ${esc(psalm.day_he)}</b>: "${esc(psalm.first_words_he)}" (${esc(psalm.psalm_ref)}) <span class="av-ref">${esc(psalm.source || 'תמיד ז, ד')}</span>` : '<b>שיר של יום</b>';
    const kelim = `על הדוכן לפחות שנים עשר לויים: כינורות, נבלים וצלצל אחד${chalil ? ' — <b>והיום גם חלילים</b>' : ''}; ושתי חצוצרות בידי הכהנים.`;
    head.innerHTML = `<div class="av-shir-psalm">${psalmHTML}</div><div class="av-shir-kelim" style="color:var(--av-soft);font-size:12.5px">${kelim}</div><div class="av-shir-perek" aria-live="polite" style="font-weight:700;margin-top:2px"></div>`;
    perekEl = head.querySelector('.av-shir-perek');
    function stageDuchan() {
      top.remove(); bg.setAttribute('class', 'av-court dusk');
      api.play.insertBefore(head, svg);
      svg.insertBefore(hall(svg, 360, 250, { wall: 48 }), people);
      lane = svgEl('g', {}, svg);
      svgEl('rect', { x: 30, y: 60, width: 300, height: 34, rx: 17, class: 'av-lane' }, lane);
      for (const y of [69, 77, 85]) svgEl('line', { x1: 44, y1: y, x2: 316, y2: y, class: 'av-lane-str' }, lane);   // the kinor's strings
      svgEl('rect', { x: hitLine - 2.5, y: 54, width: 5, height: 46, rx: 2, class: 'av-hitline' }, lane);
      lane.style.opacity = '0.35';
      // the duchan, and on it no fewer than twelve Levites (Arachin 2:6): kinorot (≥ 9, 2:5), two nevalim (2:3), the one
      // tziltzal (Ben Arza, in the middle), and on the chalil's days two chalilim (2:3) in place of two kinorot
      const duchan = svgEl('g', {}, svg);
      svgEl('rect', { x: 84, y: 141, width: 236, height: 8, rx: 1.5, class: 'av-duchan' }, duchan);
      svgEl('rect', { x: 76, y: 149, width: 252, height: 9, rx: 1.5, class: 'av-duchan' }, duchan);
      const kinds = ['kinor', chalil ? 'chalil' : 'kinor', 'kinor', 'nevel', 'kinor', 'tziltzal', 'kinor', 'kinor', 'nevel', 'kinor', chalil ? 'chalil' : 'kinor', 'kinor'];
      kinds.forEach((kd, k) => { const g = levite(duchan, 100 + k * 19, 117, 0.84, kd); if (kd === 'tziltzal') benArza = g; });
      svgEl('text', { x: 100 + 5 * 19, y: 170, class: 'av-lab small', 'text-anchor': 'middle' }, duchan).textContent = 'בן ארזא';
      svg.insertBefore(duchan, people);
      // the sgan on the altar's horn with the cloths (Tamid 7:3), at the left
      // (above the lane, at the hall's wall: the flag waves until the cymbal is struck)
      const sg = svgEl('g', { 'aria-hidden': 'true' }, svg);
      svgEl('line', { x1: 22, y1: 6, x2: 22, y2: 52, stroke: '#6E4A26', 'stroke-width': 2 }, sg);
      svgEl('path', { d: 'M22 8 L58 16 L22 26 Z', class: 'av-flag' }, sg);
      sganFlag = sg.querySelector('.av-flag');
      svgEl('text', { x: 80, y: 22, class: 'av-lab', 'text-anchor': 'middle' }, sg).textContent = 'הסגן';
    }
    function signal() {
      stageDuchan();
      cymBtn = api.button('צלצל!', () => strike(), 'gold');
      cymBtn.dataset.k = 'tziltzal';
      api.hint('"שחה לנסך" — הכהן מתכופף לנסך. חכה שהסגן יניף בסודרין — ואז הקש בצלצל!');
      api.after(900 + Math.random() * 900, () => {
        if (phase !== 2) return;
        waved = true; wavedAt = performance.now();
        sganFlag.classList.add('wave'); sganFlag.style.animation = 'av-wave .45s ease-in-out infinite';
        api.hint('הסגן מניף בסודרין — עכשיו! הקש בצלצל.');
        api.after(7000, () => { if (phase === 2) strike(true); });   // (no one waits forever: Ben Arza strikes)
      });
    }
    function strike(auto = false) {
      if (phase !== 2) return;
      if (!waved) { api.hint('עוד לא — חכה שהסגן יניף בסודרין.'); return; }
      phase = 3;
      const quick = !auto && performance.now() - wavedAt < 1200;
      cymBtn.remove(); cymBtn = null;
      if (sganFlag) sganFlag.style.animation = '';
      api.sfx && api.sfx.play('cymbal');
      if (benArza) benArza.classList.add('hit');
      if (quick) { score++; api.sparkle((100 + 5 * 19) / 360 * 100, 48, 10); }
      api.hint(auto ? 'בן ארזא הקיש בצלצל — והלויים פתחו בשיר.' : quick ? 'בדיוק בזמן! "והקיש בן ארזא בצלצל, ודברו הלוים בשיר".' : '"והקיש בן ארזא בצלצל, ודברו הלוים בשיר".', 'ok');
      sang = true;
      emit('shirStart', { day: weekday, psalm: psalm ? psalm.psalm : null, chalil, perakim: PER, bpm: SHIR_BPM, ...(musaf ? { musaf: musaf.kind, part: musaf.n } : {}), segment: ctx.segment || 'shachar' });
      api.after(1200, song);
    }
    function song() {
      phase = 4;
      lane.style.opacity = '';
      // (a phone's card keeps the lane, the buttons and the line in view: the intro has done its work)
      const intro = api.play.parentNode && api.play.parentNode.querySelector('.av-mg-intro'); if (intro) intro.style.display = 'none';
      laneBtn = api.button('נגן', () => strum(), 'gold');
      laneBtn.dataset.k = 'nagen';
      trumpetBtn = api.button('חצוצרה', () => {}, 'ghost');
      trumpetBtn.dataset.k = 'trumpet';
      trumpetBtn.addEventListener('pointerdown', () => { pressT = performance.now(); });
      trumpetBtn.addEventListener('pointerup', () => blow(performance.now() - pressT));
      trumpetBtn.disabled = true;
      startPerek();
    }
    /** the true line of each פרק: today's words (Tamid 7:4) · why today (RH 31a) · the chalil's days or the ma'amad */
    function perekLine(p) {
      const why = shirWhy(weekday);
      const order = PER === 1 ? ['why'] : ['words', 'why', chalil ? 'chalil' : 'maamad'];
      const k = order[p] || 'words';
      if (musaf && p === 0) return { text: musaf.kind === 'haazinu' ? 'בשבת, בשיר של המוסף — חלק אחד משירת האזינו בכל שבת.' : 'בחול המועד, בשיר של המוסף — מזמור אחר בכל יום.', line: musaf.kind === 'haazinu' ? dayLine('haazinu') : gapLine('shir_musaf_days') };
      if (pm && p === 0) return { text: 'גם בתמיד של בין הערביים אמרו הלויים שירה.', line: gapLine('shir_afternoon', 'הרמב״ם — שירה על כל עולות הציבור') || gapLine('shir_afternoon') };
      if (k === 'why' && why && psalm && !musaf) return { text: `למה "${psalm.first_words_he}" ב${psalm.day_he}?`, line: { quote: why, source: 'ראש השנה לא, א', status: 'draft' } };
      if (k === 'chalil') return { text: 'היום החליל מנגן לפני המזבח — רק שנים עשר יום בשנה.', line: dayLine('chalil_days'), mark: 'chalil' };
      if (k === 'maamad') return { text: 'הכהנים בעבודה, הלויים על הדוכן — וישראל, אנשי המעמד, עומדים ליד הקרבן.', line: dayLine('maamad'), mark: 'maamad' };
      if (psalm && !musaf) return { text: `${psalm.day_he}: "${psalm.first_words_he}"`, line: { quote: psalm.quote_nikud || psalm.quote, source: psalm.source || 'תמיד ז, ד', status: 'draft' } };
      return { text: '', line: gapLine('shir_perakim') };
    }
    function startPerek() {
      notes = [];
      for (let k = 0; k < NOTES; k++) notes.push({ x: 330 + k * GAP, el: svgEl('circle', { cx: 330 + k * GAP, cy: 77, r: 11, class: 'av-note' }, lane), done: false, n: k });
      const L = perekLine(perek);
      perekEl.textContent = `${PER === 1 ? `פרק אחד מן ה${PERAKIM === 3 ? 'שלושה' : PERAKIM}` : `פרק ${perek + 1} מתוך ${PER}`}${L.text ? ' · ' + L.text : ''}`;
      api.cite(L.line);
      // the line's subject lights up in the picture: the two chalilim, or the people of the ma'amad
      svg.querySelectorAll('.av-levite.l-chalil').forEach((g) => g.classList.toggle('hl', L.mark === 'chalil'));
      if (L.mark === 'maamad' && !svg.querySelector('.av-maamad-lab')) svgEl('text', { x: 270, y: 178, class: 'av-lab av-maamad-lab', 'text-anchor': 'middle' }, svg).textContent = 'אנשי המעמד';
      api.hint('"נגן" כשהצליל על הקו.');
      tState = 0; laneBtn.disabled = false; trumpetBtn.disabled = true;
    }
    api.loop((dt) => {
      if (phase !== 4 || !notes.length) return;
      let left = 0;
      for (const n of notes) {
        if (n.done) continue;
        n.x -= dt * NOTE_SPEED;
        n.el.setAttribute('cx', n.x);
        if (n.x < hitLine - 22) { n.done = true; n.el.classList.add('late'); combo = 0; if (comboEl) comboEl.textContent = ''; }
        else left++;
      }
      if (!left && tState === 0) trumpets();
    });
    let combo = 0, comboEl = null;
    function strum() {
      const n = notes.find((x) => !x.done && Math.abs(x.x - hitLine) < 20);
      if (!n) { combo = 0; const near = notes.find((x) => !x.done); if (near && near.x - hitLine < 60) api.hint('מוקדם מעט — חכה שהצליל יגיע לקו.'); return; }
      n.done = true; n.el.classList.add('hit'); score++; combo++;
      api.sfx && api.sfx.play('lyre', { n: [0, 2, 4, 7, 4, 2][n.n % 6] + perek * 2 });
      if (!comboEl) comboEl = svgEl('text', { x: hitLine, y: 52, class: 'av-lab big', 'text-anchor': 'middle' }, svg);
      comboEl.textContent = combo > 1 ? `×${combo}` : '';
      if (combo > 0 && combo % 6 === 0) { api.sparkle((hitLine / 360) * 100, 30, 10); api.sfx && api.sfx.play('chime', { n: Math.min(10, combo / 2) }); }
    }
    function trumpets() {
      tState = 1; laneBtn.disabled = true; trumpetBtn.disabled = false;
      tSeq = ['tekiah', 'teruah', 'tekiah'];
      api.hint('הגיעו לפרק — תקעו! תקיעה: החזק את החצוצרה.');
    }
    function blow(ms) {
      if (phase !== 4 || tState < 1 || tState > 3) return;
      const want = tSeq[tState - 1];
      if (want === 'tekiah') {
        if (ms < 450) { api.hint('תקיעה — קול ארוך: החזק את החצוצרה.'); return; }
        api.sfx && api.sfx.play('tekiah'); W && W.av('trumpets');
        emit('shirBlast', { n: perek + 1, kind: 'tekiah' });
        tState++;
      } else {
        tapCount++;
        clearTimeout(tapTimer);
        if (tapCount >= 3) { tapCount = 0; api.sfx && api.sfx.play('teruah'); emit('shirBlast', { n: perek + 1, kind: 'teruah' }); tState++; }
        else { tapTimer = setTimeout(() => { tapCount = 0; }, 900); api.hint('תרועה — שלוש הקשות קצרות ברצף.'); return; }
      }
      if (tState === 2) api.hint('תרועה — שלוש הקשות קצרות.');
      if (tState === 3) api.hint('ועוד תקיעה.');
      if (tState === 4) bow();
    }
    function bow() {
      tState = 5; trumpetBtn.disabled = true;
      people.classList.add('bow'); api.sfx && api.sfx.play('crowd');
      W && W.av('bow', true);
      api.hint('"על כל פרק תקיעה, ועל כל תקיעה השתחויה" — העם משתחווים.', 'ok');
      api.after(1300, () => {
        people.classList.remove('bow'); W && W.av('bow', false);
        perek++;
        notes.forEach((n) => n.el.remove());
        if (perek < PER) startPerek();
        else {
          phase = 5; laneBtn.disabled = true;
          endSong();
          const which = musaf ? 'למוסף' : pm ? 'לתמיד של בין הערביים' : 'לתמיד של שחר';
          const day = `בכל יום ${gapGame('trumpets_count', 'min', 21)} תקיעות במקדש: שלוש לפתיחת השערים, תשע לתמיד של שחר ותשע לתמיד של בין הערביים.`;
          api.done({ text: PER === 1 ? `פרק אחד מן ה${PERAKIM === 3 ? 'שלושה' : PERAKIM} — בחזרה מקצרים. בשלמותו: שלושה פרקים, תשע תקיעות ${which}. ${day}` : `תשע תקיעות ${which} — שלושה פרקים, ובכל פרק תקיעה, תרועה, תקיעה. ${day}${pm || musaf ? '' : ' "זה הוא סדר התמיד לעבודת בית אלקינו".'}`, score, linger: 1500 });
        }
      });
    }
    api.solver(async () => {
      for (let k = 0; k < (water ? 2 : 1); k++) { const key = phase === 0 ? 'bowl-west' : 'bowl-east'; await api.wait(40); api.hit(key, hold, 'down'); const p0 = phase; while (phase === p0) await api.wait(30); api.hit(key, hold, 'up'); }
      while (phase === 2 && !waved) await api.wait(30);
      if (cymBtn) press(cymBtn);
      while (phase < 4 || !laneBtn) await api.wait(30);
      for (let p = 0; p < PER; p++) {
        while (tState !== 1) { if (notes.some((x) => !x.done && Math.abs(x.x - hitLine) < 14)) press(laneBtn); await api.wait(8); }
        const blowT = async (ms) => { trumpetBtn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); await new Promise((r) => setTimeout(r, ms)); trumpetBtn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); await new Promise((r) => setTimeout(r, 30)); };
        await blowT(520); for (let k = 0; k < 3; k++) await blowT(40); await blowT(520);
        while (tState === 5 && perek === p) await api.wait(30);
      }
    });
  },
};
