// build 124 B — writes docs/specs/sefer-ktovot-he.md from the one address book (src/game/world/grid.js BOOK, rule 65): a Hebrew table
// of every address, stage by stage. Run: node tools/book-table.mjs   (the file is generated: change the book, then run this again)
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BOOK } from '../src/game/world/grid.js';

const out = fileURLToPath(new URL('../docs/specs/sefer-ktovot-he.md', import.meta.url));
const n = (v) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(2)));
const KIND = {
  stretch: 'קטע חומה', stand: 'עמדה', stake: 'יתד', gate: 'שער', post: 'עמוד סורג', eye: 'נקודת כיוון', steps: 'מעלות', yard: 'חצר',
  court: 'עזרה', column: 'עמוד', beam: 'קורה', ladder: 'סולם', chamber: 'לשכה', door: 'פתח', basin: 'מקווה', rod: 'קנה', inlet: 'כניסת מים',
  outlet: 'גלישה', pit: 'בור', hollow: 'גומת מקור', vessel: 'כלי', trestles: 'חמורים', stock: 'מלאי', heap: 'ערמה', bench: 'ספסל',
  // (build 126) the kinds the stages' moved places brought
  slot: 'מקום בחומה', crew: 'איש צוות', stone: 'אבן', line: 'קו', rack: 'מתלה',
  // ── h127 ── (build 127) the kinds stages 01 and 05's moved places brought
  brake: 'עמוד בלם', block: 'גלגלת', scaffold: 'פיגום', pile: 'ערמת אבנים', lane: 'שביל', cross: 'מעבר', mark: 'סימון', jar: 'כד',
  crane: 'מנוף', course: 'נדבך', corner: 'פינה',
  // ── /h127 ──
  // ── h128 ── (build 128) stage 06's kinds
  sledge: 'מזחלת', ramp: 'כבש', sill: 'סף', notch: 'שקע עצירה', rough: 'קורה מחוספסת', capstan: 'כננת', end: 'קצה', table: 'שולחן', gap: 'רווח',
  wicket: 'פשפש', view: 'נקודת מבט', wagon: 'עגלה',
  // ── /h128 ──
  // ── h129 ── (build 129) stage 07's kinds
  well: 'בור מים', wheel: 'גלגל', trough: 'שוקת', channel: 'תעלה', sluice: 'אבן סכר', arch: 'קשת', vault: 'קמרון', ring: 'טבעת קמרון',
  hearth: 'מדורה', slab: 'טבלה', ledge: 'רובד', levi: 'בן לוי', crowd: 'קהל',
  // ── /h129 ──
};
const L = [
  '# ספר הכתובות — כל המקומות לפי שלב',
  '',
  'נוצר אוטומטית מתוך `src/game/world/grid.js` (BOOK) על ידי `node tools/book-table.mjs`. אין לערוך ביד: משנים את הספר ומריצים שוב.',
  '',
  'יחידות: אמות. x מזרחה, z דרומה, y למעלה. התא: רשת של 25 × 25 אמה (העמודה מן הכותל המזרחי מערבה, השורה מן הצפון דרומה).',
  'הרשת לעולם אינה מצוירת במשחק. "המחשה" — מידה שאינה במקורות.',
  '',
];
for (const k of ['s01', 's02', 's03', 's04', 's05', 's06', 's07']) {   // ── h128 ── (+ s06) ── /h128 ──   // ── h129 ── (+ s07) ── /h129 ──   // ── h127 ── (build 127: stage 01's section too) ── /h127 ──
  const S = BOOK[k], B = S.bounds;
  L.push(`## שלב ${String(S.stage).padStart(2, '0')} — ${S.name}`, '');
  L.push(`תחום: x ${n(B.x0)} עד ${n(B.x1)}, z ${n(B.z0)} עד ${n(B.z1)} · ${S.entries.length} כתובות`, '');
  L.push('| מזהה | סוג | תיאור | x | z | y | תא | מקור |', '|---|---|---|---|---|---|---|---|');
  for (const e of S.entries) L.push(`| \`${e.id}\` | ${KIND[e.kind] || e.kind} | ${e.label} | ${n(e.x)} | ${n(e.z)} | ${e.y != null ? n(e.y) : ''} | ${e.cell} | ${e.src} |`);
  L.push('');
}
// ── h128 ── the sea sheet of stage 06 (outside the Mount's grid: its own cells of 30 km)
{
  const SEA = BOOK.s06.sea;
  L.push(`### ${SEA.sheet.name}`, '', `${SEA.sheet.n} × ${SEA.sheet.n} משבצות של ${SEA.sheet.km} ק"מ. העמודה מן המזרח מערבה, השורה מן הצפון דרומה (כמו ברשת ההר). ק"מ: מזרחה (שלילי = מערבה) ודרומה מן הפינה הצפונית-מזרחית של הגיליון, אמצע המשבצת.`, '');
  L.push('| מזהה | תיאור | משבצת | ק"מ | מקור |', '|---|---|---|---|---|');
  for (const e of SEA.entries) L.push(`| \`${e.id}\` | ${e.label} | ${e.cell} | ${n(e.km[0])}, ${n(e.km[1])} | ${e.src} |`);
  L.push('', 'על הסיפון המקומות נמדדים מרגל התורן (x קדימה אל החרטום, z ימינה אל צד ימין של הספינה): ראו `BOOK.s06.sea.deck`, `quay`, `cam` בקוד. כולם המחשה.', '');
}
// ── /h128 ──
// ── h129 ── stage 07: the gates that lock at night are stage 04's entries (read, never retyped)
L.push('### שלב 07 — השערים שננעלים בלילה', '', 'נקראים מן הספר של שלב 04: ' + BOOK.s07.night.gates.map((id) => '`' + id + '`').join(', ') + '.', '');
// ── /h129 ──
writeFileSync(out, L.join('\n'));
console.log('wrote', out, Object.keys(BOOK).filter((k) => /^s0\d$/.test(k)).map((k) => `${k}:${BOOK[k].entries.length}`).join(' '));
