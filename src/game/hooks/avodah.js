/* ─────────────────────────────────────────────────────────────────────────────
 * hooks/avodah.js (HOOKS agent): the Phase A → Phase B handoff — "the service after Chanukat HaBayit" (the owner's
 * order), as a soft gate with two invitations, never a lock (the owner: everything reachable in the game):
 *   building   the menu's gold button reads "הצצה" (a preview: the House is still being built)
 *   altar      the horns done (the altar complete): an invitation card — "offerings before the Heichal was founded"
 *              (Ezra 3:6) — opens Phase B straight into "העבודה שלך היום" (3 minutes), then "חזרה לבניית הבית"
 *   done       Chanukat HaBayit (the finale): the full invitation; the menu button is the plain "שלב ב׳"
 * The menu button, #avodah and the demo mode always open Phase B (the investors' bypass). ⚑ the owner may choose a
 * hard gate instead (GATE = 'hard': the button appears only from the altar on, #avodah and demo still open it).
 * Pure: G is the Phase A save; texts are drafts with their sources; Divine Names are written ה׳.
 * ──────────────────────────────────────────────────────────────────────────── */
export const GATE = 'soft';                 // ⚑ 'soft' (built) · 'hard' (no button before the altar, except demo)
export const INTENT_KEY = 'bh_avodah_intent';

/** where the builder is on the way to the service */
export function avodahStage(G) {
  if (!G) return 'building';
  if (G.celeb) return 'done';
  const k = G.st && G.st.karnot;
  return k && k.done ? 'altar' : 'building';
}
/** the Phase A menu button: {t, sub} or null (hidden: only with GATE 'hard' before the altar, outside the demo) */
export function menuLabel(G, gate = GATE) {
  const s = avodahStage(G);
  if (s === 'building') {
    if (gate === 'hard' && !(G && G.demo)) return null;
    return { t: 'הצצה: העבודה בבית · שלב ב׳', sub: 'נפתח במלואו בחנוכת הבית — אפשר להציץ כבר עכשיו' };
  }
  if (s === 'altar') return { t: 'העבודה בבית · שלב ב׳', sub: 'המזבח שלם: מקריבים עוד לפני שיש היכל (עזרא ג, ו)' };
  return { t: 'העבודה בבית · שלב ב׳', sub: 'התמיד, הקטורת והנרות — לפי השעון האמיתי' };
}
/** the invitation cards (kind: 'altar' | 'finale') → {kick, title, html} */
export function invite(kind) {
  if (kind === 'altar') {
    return {
      kick: 'המזבח שלם',
      title: 'מקריבים עוד לפני שיש היכל',
      q: 'מִיּוֹם אֶחָד לַחֹדֶשׁ הַשְּׁבִיעִי הֵחֵלּוּ לְהַעֲלוֹת עֹלוֹת לַה׳ וְהֵיכַל ה׳ לֹא יֻסָּד', ref: 'עזרא ג, ו',
      d: 'כך היה בשיבת ציון, בימי ישוע בן יוצדק וזרובבל (עזרא ג, ב): המזבח נבנה, והעבודה התחילה, עוד לפני שנוסד ההיכל. אפשר לעלות עכשיו לעבודה הראשונה שלך — הפייס, התפקיד שלך, והשיר — ולחזור לבנות.',
      go: 'לעבודה הראשונה (כ־3 דקות)', stay: 'להמשיך לבנות', intent: 'mine',
    };
  }
  return {
    kick: 'חנוכת הבית',
    title: 'הבית שלם — העבודה מתחילה',
    q: 'וַיַּעֲשׂוּ אֶת חַג הַסֻּכּוֹת כַּכָּתוּב וְעֹלַת יוֹם בְּיוֹם בְּמִסְפָּר', ref: 'עזרא ג, ד',
    d: 'מעכשיו המקדש עובד לפי השעון האמיתי של ירושלים: התמיד בשחר ובין הערביים, הפייס בכל בוקר, והמועדים כסדרם. הבניין נשמר — אפשר לחזור אליו בכל עת.',
    go: 'לעבודה בבית', stay: 'אחר כך', intent: 'home',
  };
}
