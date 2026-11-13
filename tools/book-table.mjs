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
for (const k of ['s02', 's03', 's04', 's05']) {
  const S = BOOK[k], B = S.bounds;
  L.push(`## שלב ${String(S.stage).padStart(2, '0')} — ${S.name}`, '');
  L.push(`תחום: x ${n(B.x0)} עד ${n(B.x1)}, z ${n(B.z0)} עד ${n(B.z1)} · ${S.entries.length} כתובות`, '');
  L.push('| מזהה | סוג | תיאור | x | z | y | תא | מקור |', '|---|---|---|---|---|---|---|---|');
  for (const e of S.entries) L.push(`| \`${e.id}\` | ${KIND[e.kind] || e.kind} | ${e.label} | ${n(e.x)} | ${n(e.z)} | ${e.y != null ? n(e.y) : ''} | ${e.cell} | ${e.src} |`);
  L.push('');
}
writeFileSync(out, L.join('\n'));
console.log('wrote', out, Object.keys(BOOK).filter((k) => /^s0\d$/.test(k)).map((k) => `${k}:${BOOK[k].entries.length}`).join(' '));
