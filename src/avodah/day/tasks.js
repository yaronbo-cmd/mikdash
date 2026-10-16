/* tasks.js — the ממונים' requests: the day's list (ENGINE22; the contract). The fifteen ממונים (memunim.json) and the night's
 * watchers come to the אמרכל with a request, a place and an hour; a request past its hour just leaves the list ("הכהנים סיימו"),
 * costs nothing. The morning/evening sheets (src/avodah/minigames) are tasks too (`game`), played as today.
 *   const T = createTasks({ clock, stock, emit, save })        save = G.avodah.day.tasks  ({ [id]: 'done'|'passed' } + n)
 *   T.list() · T.open() · T.get(id) · T.done(id, q) → pts · T.force(id) · T.at(place) · T.sync() (the clock moved) */
const H = (h) => h;                     // temple hours: 18…24 then 0…18 (a night task's due is "after midnight")
const tOf = (h) => (((h - 18) % 24) + 24) % 24;
/** id · he (the ממונה's line) · from · place · work · openH · dueH · pts · src (the Mishnah, after the end) */
export const TEMPLATES = [
  // the night
  { id: 'watch', from: 'ish-har', fromHe: 'איש הר הבית', place: 'night', work: 'watch', openH: 18.5, dueH: 3.5, pts: 12, icon: '🔥', he: 'בואו איתי בין המשמרות — שלום עליך, איש הר הבית.', src: 'מידות א, ב' },
  { id: 'fire', from: 'zekenim', fromHe: 'זקני בית אב', place: 'moked', work: 'fire', openH: 18, dueH: 3.5, pts: 10, icon: '🪵', he: 'המדורה בבית המוקד שוככת — הביאו עצים.', src: 'מידות א, ו' },
  { id: 'lambs', from: 'hamemune', fromHe: 'הממונה', place: 'lambs', work: 'lambs', openH: 20, dueH: 3.5, pts: 12, icon: '🐑', he: 'ביקור הטלאים לאור אבוקה — ששה טלאים מבוקרים.', src: 'ערכין ב, ה' },
  // the dawn: the sheets, at their hours
  { id: 'g-payis1', game: 'payis1', from: 'matitya_ben_shmuel', place: 'gazit', openH: 4, dueH: 6, pts: 0, icon: '☝', he: 'הפיס הראשון — מי יזכה בתרומת הדשן?', src: 'תמיד א, ב' },
  { id: 'g-kiddush', game: 'kiddush', from: 'gvini', place: 'kiyor', openH: 4.33, dueH: 6, pts: 0, icon: '💧', he: 'עמדו כהנים לעבודתכם — קידוש ידיים ורגליים.', src: 'תמיד א, ד' },
  { id: 'kiyor', from: 'hamemune', fromHe: 'הממונה', place: 'kiyor', work: 'kiyor', openH: 4.2, dueH: 6.5, pts: 12, icon: '⚙', he: 'המוכני — הכיור ריק, מלאו אותו.', src: 'יומא ג, י' },
  { id: 'g-deshen', game: 'deshen', from: 'matitya_ben_shmuel', place: 'deshen', openH: 4.58, dueH: 6.5, pts: 0, icon: '🔥', he: 'תרומת הדשן — הגיע עת.', src: 'תמיד א, ד' },
  { id: 'g-maaracha', game: 'maaracha', from: 'hamemune', fromHe: 'המסדרים', place: 'altar', openH: 4.8, dueH: 6.5, pts: 0, icon: '🪵', he: 'סידור המערכה — עצי תאנה ואגוז.', src: 'תמיד ב, ג' },
  { id: 'g-payis2', game: 'payis2', from: 'matitya_ben_shmuel', place: 'gazit', openH: 5, dueH: 6.5, pts: 0, icon: '☝', he: 'הפיס השני — שלושה עשר תפקידים.', src: 'תמיד ג, א' },
  { id: 'g-barkai', game: 'barkai', from: 'barkai', fromHe: 'ברקאי', place: 'ulam', openH: 5.17, dueH: 6.5, pts: 0, icon: '🌅', he: 'האיר פני כל המזרח?', src: 'תמיד ג, ב' },
  { id: 'g-taleh', game: 'taleh', from: 'hamemune', fromHe: 'הממונה', place: 'lambs', openH: 5.25, dueH: 6.5, pts: 0, icon: '🐑', he: 'צאו והביאו טלה מלשכת הטלאים.', src: 'תמיד ג, ג' },
  { id: 'g-shaarim', game: 'shaarim', from: 'ben_gever', place: 'gate', openH: 5.4, dueH: 7, pts: 0, icon: '🚪', he: 'פתיחת שערי העזרה — שלוש תקיעות.', src: 'תמיד ג, ז' },
  { id: 'g-heichal', game: 'heichal', from: 'hamemune', fromHe: 'שני הזוכים', place: 'heichal', openH: 5.5, dueH: 7, pts: 0, icon: '🕯', he: 'בהיכל — דישון מזבח הזהב והטבת הנרות.', src: 'תמיד ג, ט' },
  { id: 'g-zerika', game: 'zerika', from: 'hamemune', fromHe: 'הזוכים בפיס', place: 'rings', openH: 5.67, dueH: 7.2, pts: 0, icon: '🥣', he: 'שחיטה, קבלה וזריקה — העבודה היא שלכם.', src: 'תמיד ד, א' },
  { id: 'g-evarim', game: 'evarim', from: 'hamemune', fromHe: 'הכהנים', place: 'limbs', openH: 6, dueH: 7.5, pts: 0, icon: '🍖', he: 'האברים אל הכבש.', src: 'תמיד ד, ב' },
  { id: 'g-payis3', game: 'payis3', from: 'matitya_ben_shmuel', place: 'gazit', openH: 6.5, dueH: 8, pts: 0, icon: '☝', he: 'חדשים לקטורת — באו והפיסו.', src: 'תמיד ה, ב' },
  { id: 'g-ketoret', work: 'ketoret', sheet: 'ketoret', from: 'beit_avtinas', place: 'ketoret', openH: 6.83, dueH: 8, pts: 16, icon: '💨', he: 'הקטורת — פרס בכל פעם.', src: 'תמיד ו, ג' },
  { id: 'g-birkat', work: 'birkat', sheet: 'birkat', from: 'hamemune', fromHe: 'הכהנים', place: 'ulam', openH: 7.08, dueH: 9, pts: 12, icon: '🙌', he: 'ברכת כהנים על מעלות האולם.', src: 'תמיד ז, ב' },
  { id: 'g-shir', work: 'shir', sheet: 'shir', from: 'hugras_ben_levi', place: 'duchan', openH: 7.25, dueH: 9.5, pts: 16, icon: '🎵', he: 'נסכים ושיר של יום.', src: 'תמיד ז, ג' },
  // the day
  { id: 'queue', from: 'petachya', place: 'gate', work: 'queue', openH: 7.5, dueH: 12, pts: 15, icon: '🕊', he: 'תור בדוכן הקינים, ועולי הרגל מחכים בשער — כוונו כל אחד למקומו.', src: 'שקלים ה, א; זבחים ה, ג' },
  { id: 'seals', from: 'yochanan_ben_pinchas', place: 'seals', work: 'seals', openH: 8, dueH: 13, pts: 14, icon: '🔖', he: 'מי שצריך נסכים — חותם: עגל, זכר, גדי, חוטא.', src: 'שקלים ה, ג–ד' },
  { id: 'wood', from: 'hamemune', fromHe: 'לשכת העצים', place: 'wood', work: 'wood', openH: 8.5, dueH: 13, pts: 12, icon: '🪵', he: 'בדקו את העצים לתולעים — עץ תולע פסול למזבח.', src: 'מידות ב, ה' },
  { id: 'wicks', from: 'ben_bevai', place: 'store', work: 'wicks', openH: 9, dueH: 13.5, pts: 8, icon: '🕯', he: 'הפתילות והשמן לנרות — חסרים בחדר.', src: 'שקלים ה, א' },
  { id: 'pen', from: 'hamemune', fromHe: 'הדיר [המחשה]', place: 'pen', work: 'pen', openH: 9.5, dueH: 14, pts: 12, icon: '💧', he: 'הדיר: מים, מספוא ומיון החדשים מן המבוקרים. [המחשה]', src: 'ערכין ב, ה' },
  { id: 'kiyor2', from: 'hamemune', fromHe: 'הממונה', place: 'kiyor', work: 'kiyor', openH: 14.75, dueH: 18, pts: 10, icon: '⚙', he: 'הכיור התרוקן — מלאו אותו למחר.',   /* ── fix26 ── (opened by the kiddush's end — tasks.force; the clock's hour only after the evening use) ── /fix26 ── */ src: 'יומא ג, י' },
  { id: 'nechunya', from: 'nechunya', place: 'court', work: 'water', openH: 10, dueH: 14, pts: 8, icon: '🚰', he: 'שיחין ובורות — מים לעולי הרגל.', src: 'שקלים ה, א' },
  // the evening
  { id: 'g-erev', work: 'erev', sheet: 'erev', from: 'hamemune', fromHe: 'הממונה', place: 'ringsE', openH: 14.5, dueH: 16.5, pts: 14, icon: '🌇', he: 'התמיד של בין הערביים — נשחט בשמונה ומחצה.', src: 'פסחים ה, א' },
  { id: 'g-neirot', work: 'neirot', sheet: 'neirot', from: 'beit_avtinas', place: 'ketoret', openH: 15.5, dueH: 17.5, pts: 14, icon: '🕯', he: 'קטורת והדלקת הנרות מן הנר המערבי.', src: 'תמיד ו, א' },
  { id: 'g-shir2', work: 'shir2', sheet: 'shir', from: 'hugras_ben_levi', place: 'duchan', openH: 15.75, dueH: 17.5, pts: 14, icon: '🎵', he: 'נסכים ושיר של בין הערביים.', src: 'ערכין ב, ג' },
  { id: 'g-machar', game: 'machar', from: 'hamemune', fromHe: 'הממונה', place: 'lambs', openH: 16, dueH: 18, pts: 0, icon: '🐑', he: 'הטלה של מחר — ביקור הטלאים.', src: 'ערכין ב, ה' },
  // the close
  { id: 'vessels', from: 'ben_gever', place: 'close', work: 'vessels', openH: 16.3, dueH: 18, pts: 12, icon: '🏺', he: 'ספרו את הכלים — תשעים ושלשה.', src: 'תמיד ג, ד' },
  { id: 'account', from: 'achiya', place: 'store', work: 'account', openH: 16.6, dueH: 18, pts: 12, icon: '⚖', he: 'חשבון הערב — החותמות מול הנסכים.', src: 'שקלים ה, ד' },
  { id: 'gates', from: 'ben_gever', place: 'close', work: 'gates', openH: 17.2, dueH: 18, pts: 14, icon: '🔑', he: 'נעילת שערים — האבן, הטבעת והמפתחות.', src: 'מידות א, ט' },
];
/** the restock errands a low store opens (never a block): wine/flour/oil → Achiya, wood → the wood chamber, doves → Petachia … */
export const RESTOCK = {
  wine: { from: 'achiya', place: 'store', icon: '🍷', he: 'נגמר היין לנסכים — לכו למחסן והביאו.' },
  oil: { from: 'ben_bevai', place: 'store', icon: '🫒', he: 'השמן לנרות מתמעט — לכו למחסן.' },
  flour: { from: 'achiya', place: 'store', icon: '🌾', he: 'הסולת למנחות מתמעטת — לכו למחסן.' },
  wood: { from: 'hamemune', fromHe: 'לשכת העצים', place: 'wood', icon: '🪵', he: 'העצים למערכה מתמעטים.' },
  doves: { from: 'petachya', place: 'gate', icon: '🕊', he: 'הקינים בדוכן מתמעטים.' },
  salt: { from: 'hamemune', fromHe: 'לשכת המלח', place: 'store', icon: '🧂', he: 'המלח לקרבנות מתמעט.' },
  ketoret: { from: 'beit_avtinas', place: 'store', icon: '💨', he: 'הקטורת מתמעטת — בית אבטינס פיטמו, לכו והביאו.' },
  lambs: { from: 'hamemune', fromHe: 'הממונה', place: 'lambs', icon: '🐑', he: 'פחות משישה טלאים מבוקרים — ביקור הטלאים.' },
};
const payOf = (pts, q) => Math.round(pts * (0.6 + 0.4 * Math.max(0, Math.min(1, q == null ? 1 : q))));
export function createTasks({ clock, stock, emit = () => {}, save = {} } = {}) {
  if (!save.s) save.s = {};              // id → 'done' | 'passed' (this day's)
  const tasks = new Map();
  const T = {
    TEMPLATES, RESTOCK,
    list: () => [...tasks.values()],
    open: () => [...tasks.values()].filter((t) => t.state === 'open'),
    get: (id) => tasks.get(id) || null,
    at: (place) => [...tasks.values()].filter((t) => t.state === 'open' && t.place === place),
    /** build the day's list from the templates (a new day / a restore) */
    reset() {
      tasks.clear();
      for (const m of TEMPLATES) tasks.set(m.id, { ...m, openedAt: null, state: 'wait' });
      for (const id in save.s) { const t = tasks.get(id); if (t) t.state = save.s[id]; }
    },
    newDay() { save.s = {}; T.reset(); T.sync(); },
    /** the clock moved: open what is due to open, pass what is past its hour (no penalty) */
    sync() {
      const now = clock.now(), t = now.t;
      for (const k of tasks.values()) {
        if (k.state === 'done' || k.state === 'passed') continue;
        if (k.practice && k.state === 'open') continue;   // ── guide27 ── (a practice stays open till he plays it or the day ends) ── /guide27 ──
        let a = tOf(k.openH), z = tOf(k.dueH); if (k.dueH === 18) z = 24;
        if (t >= z - 1e-9) { k.state = 'passed'; save.s[k.id] = 'passed'; emit('taskPassed', { id: k.id, he: k.he }); }
        else if (t >= a && k.state === 'wait') { k.state = 'open'; k.openedAt = t; emit('taskOpen', { id: k.id, he: k.he, from: k.from, fromHe: k.fromHe || '', place: k.place, due: k.dueH }); }
      }
      // a low store opens its restock errand (at most one per kind, for two hours, only while the gates are open)
      if (now.block === 'dawn' || now.block === 'day' || now.block === 'evening') for (const k of stock.low()) {
        const R = RESTOCK[k]; if (!R) continue;
        const id = 'restock-' + k, ex = tasks.get(id);
        if (ex && (ex.state === 'open' || ex.state === 'wait')) continue;
        if (ex && ex.state === 'done' && stock.get(k) >= 6) continue;
        const dueT = Math.min(23.9, t + 2);
        tasks.set(id, { id, restock: k, from: R.from, fromHe: R.fromHe, place: R.place, work: k === 'ketoret' ? 'pitum' : 'restock', openH: now.h   /* ── payis24 ── (the ketoret restock is the pitum at בית אבטינס) */, dueH: (18 + dueT) % 24 === 18 ? 18 : (18 + dueT) % 24, pts: 8, icon: R.icon, he: R.he, src: 'שקלים ה, א', state: 'open', openedAt: t });
        emit('taskOpen', { id, he: R.he, from: R.from, place: R.place, restock: k });
      }
    },
    done(id, q = 1) {
      const k = tasks.get(id); if (!k || k.state !== 'open') return 0;
      k.state = 'done'; save.s[id] = 'done';
      const pts = payOf(k.pts, q);
      if (k.restock) stock.add(k.restock, k.restock === 'ketoret' ? 2 : k.restock === 'lambs' ? 2 : 6);
      emit('taskDone', { id, pts, q, he: k.he, game: k.game || null, practice: !!k.practice /* ── guide27 ── ── /guide27 ── */ });
      return pts;
    },
    /** tests: open a task now whatever the hour */
    force(id, o2) { const k = tasks.get(id); if (!k) return null; if (k.state === 'wait' || k.state === 'passed') { k.state = 'open'; delete save.s[id]; emit('taskOpen', { id, he: k.he, from: k.from, place: k.place, forced: true, say: !!(o2 && o2.say) /* ── fix26 ── (an errand the day opens by an event: its ממונה speaks) ── /fix26 ── */ }); } return k; },
    counts() { let d = 0, p = 0, o = 0; for (const k of tasks.values()) { if (k.state === 'done') d++; else if (k.state === 'passed') p++; else if (k.state === 'open') o++; } return { done: d, passed: p, open: o }; },
    /** the horizon: the nearest open task by due hour */
    nextDue() { const t = clock.now().t; let best = null; for (const k of tasks.values()) if (k.state === 'open') { const z = k.dueH === 18 ? 24 : tOf(k.dueH); if (!best || z < best.z) best = { k, z, hours: z - t }; } return best; },
  };
  T.reset();
  void H;
  return T;
}
