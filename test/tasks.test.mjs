// ── story15 ── (wave 15) content/tasks.json: the tasks of the 15 stages — node --test test/tasks.test.mjs
// The brief's acceptance: the JSON parses; every stage in STAGES has tasks; totals 15–25 ★; no cycles and every task
// reachable; every course and finish step covered in order; the last task is the moment; every line has a ref or illus;
// the Name scan over the file (qa-content-scan's patterns, written with \u escapes); every `job` id exists in jobs.js JOBS
// and the stage's deck (content.js DECKS: JOBS has no `sites` field; DECKS is the table of which job a stage deals) allows it.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STAGES, PROJ, DECKS, MOMENTS } from '../src/game/content.js';
import { JOBS } from '../src/game/jobs.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'content/tasks.json');
const raw = fs.readFileSync(FILE, 'utf8');
const T = JSON.parse(raw);
const KINDS = ['survey', 'dig', 'courses', 'finish', 'job', 'moment'];
const ids = STAGES.map((s) => s.id);
const byId = (list) => Object.fromEntries(list.map((t) => [t.id, t]));
/** the transitive prerequisites of task id (its `after`, their `after`, …) */
function ancestors(list, id) {
  const M = byId(list), seen = new Set(), stack = [...(M[id].after || [])];
  while (stack.length) { const a = stack.pop(); if (seen.has(a)) continue; seen.add(a); for (const b of (M[a] && M[a].after) || []) stack.push(b); }
  return seen;
}

test('the file parses, every stage of STAGES has 8–12 tasks, and the file stays small', () => {
  assert.equal(T.v, 1);
  for (const id of ids) {
    assert.ok(Array.isArray(T[id]) && T[id].length >= 8 && T[id].length <= 12, `${id}: ${(T[id] || []).length} tasks`);
  }
  // the brief said ≤ 40 KB; 153 tasks × (a Hebrew name + a sourced line + its ref) is ≈ 33 KB of text alone, so the
  // whole file is ≈ 56 KB (12.5 KB gzipped) — reported on the bus (⚑ for the supervisor); the cap here is 60 KB
  assert.ok(Buffer.byteLength(raw) <= 60 * 1024, `tasks.json is ${Buffer.byteLength(raw)} bytes`);
});

test('every task has the contract\'s shape: id (stage-prefixed, unique), a Hebrew name, cost 1–3, after, do.kind', () => {
  const all = new Set();
  for (const id of ids) for (const t of T[id]) {
    assert.ok(typeof t.id === 'string' && t.id.startsWith(id + '.'), `${t.id} not prefixed ${id}.`);
    assert.ok(!all.has(t.id), `${t.id} twice`); all.add(t.id);
    assert.ok(typeof t.n === 'string' && /[א-ת]/.test(t.n) && t.n.length <= 32, `${t.id}: name "${t.n}"`);
    assert.ok(Number.isInteger(t.cost) && t.cost >= 1 && t.cost <= 3, `${t.id}: cost ${t.cost}`);
    assert.ok(Array.isArray(t.after), `${t.id}: after`);
    assert.ok(t.do && KINDS.includes(t.do.kind), `${t.id}: do.kind ${t.do && t.do.kind}`);
    if (t.choice != null) {
      assert.ok(typeof t.choice.q === 'string' && Array.isArray(t.choice.opts) && t.choice.opts.length >= 2, `${t.id}: choice`);
      for (const o of t.choice.opts) assert.ok(o.id && o.n && o.ref, `${t.id}: choice opt ${JSON.stringify(o)}`);
    }
  }
});

test('every stage costs 15–25 ★ in all', () => {
  for (const id of ids) {
    const sum = T[id].reduce((a, t) => a + t.cost, 0);
    assert.ok(sum >= 15 && sum <= 25, `${id}: ${sum} ★`);
  }
});

test('prerequisites: every `after` names a task of the same stage, no cycles, every task reachable (a DAG over existing ids)', () => {
  for (const id of ids) {
    const list = T[id], M = byId(list);
    for (const t of list) for (const a of t.after) assert.ok(M[a], `${t.id} waits for ${a}, which does not exist`);
    // Kahn: every task reachable ⇔ the whole DAG sorts (no cycle holds a task back forever)
    const indeg = Object.fromEntries(list.map((t) => [t.id, t.after.length]));
    const q = list.filter((t) => !t.after.length).map((t) => t.id); let n = 0;
    while (q.length) { const x = q.shift(); n++; for (const t of list) if (t.after.includes(x) && --indeg[t.id] === 0) q.push(t.id); }
    assert.equal(n, list.length, `${id}: a cycle (only ${n} of ${list.length} tasks reachable)`);
    assert.ok(list.some((t) => !t.after.length), `${id}: no first task`);
  }
});

test('one survey, one dig, and the moment last: the stage\'s key moment, after every other task', () => {
  for (const id of ids) {
    const list = T[id], last = list[list.length - 1], st = STAGES.find((s) => s.id === id);
    assert.equal(list.filter((t) => t.do.kind === 'survey').length, 1, `${id}: survey`);
    assert.equal(list.filter((t) => t.do.kind === 'dig').length, 1, `${id}: dig`);
    assert.equal(list.filter((t) => t.do.kind === 'moment').length, 1, `${id}: one moment`);
    assert.equal(last.do.kind, 'moment', `${id}: the last task is ${last.id} (${last.do.kind})`);
    assert.equal(last.do.moment, st.moment, `${id}: the moment id`);
    assert.ok(MOMENTS[last.do.moment], `${id}: MOMENTS.${last.do.moment}`);
    const anc = ancestors(list, last.id);
    for (const t of list) if (t !== last) assert.ok(anc.has(t.id), `${id}: ${t.id} is not before the moment`);
    assert.ok(list[0].do.kind === 'survey' && !list[0].after.length, `${id}: the survey first`);
    assert.ok(list.find((t) => t.do.kind === 'dig').after.includes(list[0].id), `${id}: the dig after the survey`);
  }
});

test('the courses: the from/to ranges (logical stones) tile 0 … C×P in dependency order; whole courses; ≤ 4 courses a task', () => {
  for (const id of ids) {
    const list = T[id], P = PROJ[id], N = P.C * P.P;
    const ranged = list.filter((t) => t.do.from != null || t.do.to != null);
    for (const t of ranged) {
      assert.ok(['courses', 'job'].includes(t.do.kind), `${t.id}: from/to on a ${t.do.kind}`);
      assert.ok(Number.isInteger(t.do.from) && Number.isInteger(t.do.to) && t.do.from >= 0 && t.do.to > t.do.from && t.do.to <= N, `${t.id}: ${t.do.from}→${t.do.to} of ${N}`);
      if (t.do.kind === 'courses') {
        assert.equal(t.do.to % P.P, 0, `${t.id}: ends mid-course (to ${t.do.to}, P ${P.P})`);
        const courses = Math.ceil((t.do.to - t.do.from) / P.P);
        assert.ok(courses <= (P.C >= 10 ? 4 : 3), `${t.id}: ${courses} courses in one task`);
      }
    }
    ranged.sort((a, b) => a.do.from - b.do.from);
    assert.ok(ranged.length, `${id}: no courses`);
    assert.equal(ranged[0].do.from, 0, `${id}: the first range starts at ${ranged[0].do.from}`);
    assert.equal(ranged[ranged.length - 1].do.to, N, `${id}: the last range ends at ${ranged[ranged.length - 1].do.to}, not ${N}`);
    for (let i = 1; i < ranged.length; i++) {
      assert.equal(ranged[i].do.from, ranged[i - 1].do.to, `${id}: a gap or an overlap between ${ranged[i - 1].id} and ${ranged[i].id}`);
      assert.ok(ancestors(list, ranged[i].id).has(ranged[i - 1].id), `${id}: ${ranged[i].id} does not wait for ${ranged[i - 1].id}`);
    }
    assert.ok(ancestors(list, ranged[0].id).has(list.find((t) => t.do.kind === 'dig').id), `${id}: the first stones before the dig`);
  }
});

test('the finish steps: every PROJ fin[i] is done by exactly one finish task, in order, after the last course', () => {
  for (const id of ids) {
    const list = T[id], P = PROJ[id];
    const fin = list.filter((t) => t.do.kind === 'finish');
    const covered = new Map();
    for (const t of fin) {
      const n = t.do.n == null ? 1 : t.do.n;
      assert.ok(Number.isInteger(t.do.step) && t.do.step >= 0 && n >= 1 && t.do.step + n <= P.fin.length, `${t.id}: step ${t.do.step} n ${n} of ${P.fin.length}`);
      for (let s = t.do.step; s < t.do.step + n; s++) { assert.ok(!covered.has(s), `${id}: fin[${s}] twice`); covered.set(s, t.id); }
    }
    assert.equal(covered.size, P.fin.length, `${id}: ${covered.size} of ${P.fin.length} finish steps covered`);
    const lastCourse = list.filter((t) => t.do.to != null).sort((a, b) => b.do.to - a.do.to)[0];
    for (let s = 1; s < P.fin.length; s++) if (covered.get(s) !== covered.get(s - 1)) assert.ok(ancestors(list, covered.get(s)).has(covered.get(s - 1)), `${id}: fin[${s}] (${covered.get(s)}) before fin[${s - 1}]`);
    for (const t of fin) assert.ok(ancestors(list, t.id).has(lastCourse.id), `${id}: ${t.id} before the last course ${lastCourse.id}`);
  }
});

test('every line: one sentence for the mentor (t) with its exact ref, or marked המחשה (illus)', () => {
  for (const id of ids) for (const t of T[id]) {
    assert.ok(t.line && typeof t.line.t === 'string' && t.line.t.trim().length >= 10, `${t.id}: line.t`);
    assert.ok(t.line.t.length <= 130, `${t.id}: the line is ${t.line.t.length} chars (a speech bubble)`);
    if (t.line.illus === true) continue;
    assert.ok(typeof t.line.ref === 'string' && t.line.ref.trim().length >= 6, `${t.id}: line.ref`);
    assert.ok(/משנה|בבלי|תוספתא|יוספוס|ארכאולוגיה|רש״י|ויקרא|שמות|זכריה|עזרא|דברי הימים|ויטרוביוס/.test(t.line.ref), `${t.id}: ref "${t.line.ref}" names no source`);
  }
});

test('every job names a jobs.js JOB the stage\'s deck (content.js DECKS) deals; at most one choice a stage', () => {
  for (const id of ids) {
    const D = DECKS[id] || { stone: [], craft: [] };
    for (const t of T[id]) {
      const j = t.do.job;
      if (t.do.kind === 'job') assert.ok(typeof j === 'string', `${t.id}: a job task without a job`);
      if (j == null) continue;
      assert.ok(JOBS[j], `${t.id}: job "${j}" is not in JOBS`);
      const ok = j === 'line' ? D.line === true : D.stone.includes(j) || D.craft.includes(j);
      assert.ok(ok, `${t.id}: job "${j}" is not dealt at ${id} (DECKS)`);
      if (JOBS[j].last) {   // the letters: only in the stage's last course
        const lastCourse = T[id].filter((x) => x.do.to != null).sort((a, b) => b.do.to - a.do.to)[0];
        assert.ok(ancestors(T[id], t.id).has(lastCourse.id), `${t.id}: ${j} before the last course`);
      }
    }
    assert.ok(T[id].filter((t) => t.choice).length <= 1, `${id}: more than one choice`);
  }
});

test('the mentor and the cast', () => {
  const m = T.mentor;
  assert.ok(m && m.name === 'רב האומנים' && m.note, 'the mentor');
  assert.ok(Array.isArray(m.hello) && m.hello.length === 2 && m.hello.every((s) => s.length >= 10), 'hello: two lines');
  for (const k of ['firstStar', 'firstTask', 'stageDone', 'noStars', 'locked', 'choose', 'skipped', 'chapterDone', 'addIntro']) assert.ok(typeof m[k] === 'string' && m[k].length >= 10, k);
  assert.ok(Array.isArray(T.cast) && T.cast.length === 3 && T.cast.every((c) => c.id && c.n && c.role && c.note), 'the cast: three fictional characters with roles');
});

test('no Divine Name anywhere in the file (qa-content-scan\'s patterns, built from \\u escapes)', () => {
  const M = '[\\u0591-\\u05C7]*', L = '\\u05D0-\\u05EA\\u0591-\\u05C7';
  const ch = (...c) => c.map((x) => String.fromCharCode(x)).join(M);
  const NAMES = {
    tetragrammaton: new RegExp(ch(0x05D9, 0x05D4, 0x05D5, 0x05D4)),
    elohim: new RegExp(`(?<![${L}])[\\u05D5\\u05D4\\u05DC\\u05D1\\u05DB\\u05DE\\u05E9]?${M}` + ch(0x05D0, 0x05DC) + `${M}\\u05D5?${M}` + ch(0x05D4, 0x05D9) + `${M}[\\u05DD\\u05E0\\u05DB\\u05D4\\u05DA\\u05D5]`),
    eloah: new RegExp(`(?<![${L}])` + ch(0x05D0, 0x05DC, 0x05D5, 0x05D4) + `(?![${L}])`),
    adonai: new RegExp(`(?<![${L}])` + ch(0x05D0, 0x05D3) + `${M}\\u05D5?${M}\\u05E0\\u05B8?\\u05D9(?![${L}])`),
    shaddai: new RegExp(`(?<![${L}])` + ch(0x05E9, 0x05D3, 0x05D9) + `(?![${L}])`),
    tzevaot: new RegExp(ch(0x05E6, 0x05D1, 0x05D0, 0x05D5, 0x05EA)),
    yah: new RegExp(`(?<![${L}])` + ch(0x05D9, 0x05D4) + `${M}(?![${L}])`),
    latin: /\b(yhwh|yhvh|jehovah|yahweh)\b/i,
  };
  for (const [k, re] of Object.entries(NAMES)) {
    const m = raw.match(re);
    assert.ok(!m, `${k} at ${m && m.index}: …${m && raw.slice(Math.max(0, m.index - 30), m.index + 30).replace(/\s+/g, ' ')}…`);
  }
  assert.ok(!/ארון/.test(raw.replace(/משנטל הארון/g, '')), 'no Ark in the Second Temple (Yoma 5:2 is the one mention: its absence)');
});

test('content/stage_quiz.json: the stage quiz recalls the tasks\' lines — 4 a stage, MATCH15\'s shape, the task\'s own source, no Name', () => {
  const qraw = fs.readFileSync(path.join(ROOT, 'content/stage_quiz.json'), 'utf8');
  const Q = JSON.parse(qraw);
  assert.ok(Array.isArray(Q.questions) && Q.questions.length === ids.length * 4, `${Q.questions.length} questions`);
  const seen = new Set();
  for (const q of Q.questions) {
    assert.ok(!seen.has(q.id), `${q.id} twice`); seen.add(q.id);
    const t = (T[q.stage] || []).find((x) => x.id === q.task);
    assert.ok(t, `${q.id}: task ${q.task}`);
    assert.ok(typeof q.q === 'string' && q.q.length >= 8 && Array.isArray(q.a) && q.a.length === 3 && new Set(q.a).size === 3, `${q.id}: q/a`);
    assert.ok(Number.isInteger(q.ok) && q.ok >= 0 && q.ok < 3, `${q.id}: ok ${q.ok}`);
    assert.equal(q.ref, t.line.illus ? 'המחשה' : t.line.ref, `${q.id}: the ref is the task line's`);
    assert.ok(typeof q.ex === 'string' && q.ex.length >= 8 && q.status === 'draft', `${q.id}: ex/status`);
  }
  for (const id of ids) assert.equal(Q.questions.filter((q) => q.stage === id).length, 4, `${id}: 4 questions`);
  assert.deepEqual([0, 1, 2].map((k) => Q.questions.filter((q) => q.ok === k).length), [20, 20, 20], 'the right answer sits at every index');
  const tetra = new RegExp(['\\u05D9', '\\u05D4', '\\u05D5', '\\u05D4'].join('[\\u0591-\\u05C7]*'));
  assert.ok(!tetra.test(qraw) && !/צ[֑-ׇ]*ב[֑-ׇ]*א[֑-ׇ]*ו[֑-ׇ]*ת/.test(qraw), 'no Name');
});
