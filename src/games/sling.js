/* ─────────────────────────────────────────────────────────────────────────────
 * games/sling.js — (FUN12, wave 12) "הקלע של דוד": a game in the manner of Angry Birds, in our world and with our own art (the
 * owner, 29.9: "בירדס זה משחק טוב אפשר לשחק רוגטקה של דוד המלך נגד גוליית"). The valley of Elah: the slinger on his rock at the
 * right (RTL), the towers at the left. Drag anywhere back and release; on release the sling whirls once overhead and lets the
 * stone go (a sling, not a slingshot — the fact at the end says so; no whirl under reduced motion). Dots show the arc on the
 * first two shots of a level. Five stones a level ("וַיִּבְחַר לוֹ חֲמִשָּׁה חַלֻּקֵי אֲבָנִים מִן הַנַּחַל", שמואל א יז, מ).
 * Ten levels of cedar beams and ashlar blocks; the targets are helmets and shields on poles (never people), knocked down by
 * physics (matter-js 0.20.0, MIT, vendored). The last level is Goliath behind the great shield: only a stone to the forehead
 * fells him, and he falls on his face like a cartoon (יז, מט) — no blood, no death shown, no caricature.
 *   run(S, { level, sfx, reduced, onDown }) → { won, stars, used, down, targets, level, goliath, score, quit, winner }
 *   makeWorld(level) — the physics alone (node-safe: test/sling.test.mjs plays every level with the solver)
 * Test hook: `.g10-sling` carries __g10 = { state(), aimAt(i) } (page CSS px).
 * ──────────────────────────────────────────────────────────────────────────── */
import Matter from './vendor/matter.min.js';
import { h, sleep, injectCSS, fitCanvas, PLAYERS } from './shell.js';

const { Engine, Bodies, Body, Composite, Events } = Matter;
export const WW = 400, WH = 640, GROUND = 590;         // the world in design units (≈ CSS px on a 390-px phone)
const LEDGE = 522;                                       // the slinger's rock (its top), x 318…410
export const ANCHOR = { x: 334, y: 478 };                // the pouch at rest: every stone leaves from here
const HAND = { x: 348, y: 466 };
export const MAXPULL = 96, VMAX = 11.8, G_STEP = 0.001 * (1000 / 60) * (1000 / 60), FA = 0.004, R_STONE = 8.5;
export const STONES = 5, DOTS_FOR = 2;
const PULL_SHOW = 0.5;   // the pouch is drawn at half the pull: a full pull to the right stays on a 390-px screen (the dots show the aim)

/* ── the ten levels: [kind, x, bottom y, (w | pole kind), (pole height)] — a kind stands on the y given (its bottom) ── */
const L = (n, items, o = {}) => ({ n, items, ...o });
export const LEVELS = [
  L('שתי קסדות', [['pole', 150, GROUND, 'helmet', 50], ['pole', 80, GROUND, 'helmet', 50]]),
  L('הגשר', [['post', 110, GROUND], ['post', 190, GROUND], ['plank', 150, 526, 110], ['pole', 150, 516, 'shield', 46], ['pole', 250, GROUND, 'helmet', 44]]),
  L('מעל החומה', [['block', 90, GROUND], ['block', 90, 560], ['pole', 90, 530, 'helmet', 44], ['block', 196, GROUND], ['block', 196, 560], ['block', 196, 530], ['pole', 150, GROUND, 'shield', 44]], { tip: 'מגן מאחורי החומה? משוך הרבה למטה — האבן תעלה גבוה ותיפול מעליה' }),
  L('שתי קומות', [['post', 100, GROUND], ['post', 180, GROUND], ['plank', 140, 526, 104], ['post', 110, 516], ['post', 170, 516], ['plank', 140, 452, 88], ['pole', 140, 442, 'helmet', 44], ['pole', 140, GROUND, 'shield', 42]]),
  L('חומת האבנים', [['block', 212, GROUND], ['block', 242, GROUND], ['block', 212, 560], ['block', 242, 560], ['block', 212, 530], ['block', 242, 530], ['pole', 227, 500, 'helmet', 40], ['pole', 150, GROUND, 'shield', 48], ['pole', 90, GROUND, 'shield', 48]]),
  L('המגדל הגבוה', [['post', 100, GROUND], ['post', 160, GROUND], ['plank', 130, 526, 92], ['post', 106, 516], ['post', 154, 516], ['plank', 130, 452, 80], ['post', 112, 442], ['post', 148, 442], ['plank', 130, 378, 70], ['pole', 130, GROUND, 'helmet', 40], ['pole', 130, 516, 'shield', 40], ['pole', 130, 368, 'helmet', 44]]),
  L('שני מגדלים וגשר', [['block', 60, GROUND], ['block', 60, 560], ['block', 60, 530], ['block', 60, 500], ['block', 200, GROUND], ['block', 200, 560], ['post', 200, 530], ['plank', 130, 466, 184], ['pole', 100, 456, 'helmet', 42], ['pole', 160, 456, 'helmet', 42], ['pole', 130, GROUND, 'shield', 50]]),
  L('גל האבנים', [['block', 80, GROUND], ['block', 110, GROUND], ['block', 140, GROUND], ['block', 170, GROUND], ['block', 95, 560], ['block', 125, 560], ['block', 155, 560], ['block', 110, 530], ['block', 140, 530], ['block', 125, 500], ['pole', 125, 470, 'helmet', 44], ['block', 34, GROUND], ['pole', 34, 560, 'shield', 50], ['slab', 236, GROUND, 40], ['pole', 214, GROUND, 'shield', 44]]),
  L('המבצר', [['block', 70, GROUND], ['block', 70, 560], ['block', 70, 530], ['block', 232, GROUND], ['block', 232, 560], ['block', 232, 530], ['plank', 151, 500, 196], ['pole', 151, GROUND, 'shield', 52], ['pole', 110, 490, 'helmet', 42], ['pole', 192, 490, 'helmet', 42]]),
  L('גָּלְיָת', [['block', 176, GROUND], ['block', 176, 560], ['pole', 176, 530, 'great', 104], ['block', 132, GROUND], ['slab', 132, 560, 30]], { goliath: { x: 78 } }),
];
/** the win's title by what the level's targets were: helmets, shields, both — or Goliath */
export function winTitle(lv) {
  const d = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, (lv | 0) - 1))];
  if (d.goliath) return 'גָּלְיָת נָפַל!';
  const k = new Set(d.items.filter((i) => i[0] === 'pole').map((i) => (i[3] === 'helmet' ? 'h' : 's')));
  return k.size > 1 ? 'כל הקסדות והמגינים נפלו!' : k.has('h') ? 'כל הקסדות נפלו!' : 'כל המגינים נפלו!';
}
export const targetsOf = (lv) => { const d = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, (lv | 0) - 1))]; return d.goliath ? 1 : d.items.filter((i) => i[0] === 'pole').length; };

/* ── the facts at the end of a level (drafts, each with its source) ── */
export const FACTS = [
  { id: 'sl_sling', he: 'קלע, לא רוגטקה: רצועה ובאמצעה כף לאבן. מסובבים אותה מעל הראש ומשחררים קצה אחד. בשבט בנימין היו קלעים מופלאים: ״כָּל זֶה קֹלֵעַ בָּאֶבֶן אֶל הַשַּׂעֲרָה וְלֹא יַחֲטִא״.', ref: 'שופטים כ, טז' },
  { id: 'sl_spoils', he: 'דוד ושרי צבאו הקדישו משלל מלחמותיהם לבית (הראשון): ״מִן הַמִּלְחָמוֹת וּמִן הַשָּׁלָל הִקְדִּישׁוּ לְחַזֵּק לְבֵית ה׳״. מן הנחושת הרבה שלקח דוד עשה שלמה את ים הנחושת, העמודים וכלי הנחושת.', ref: 'שמואל ב ח, יא; דברי הימים א יח, ח; כו, כז' },
  { id: 'sl_goren', he: 'דוד קנה את גורן ארוונה היבוסי ובנה בה מזבח: ״וַיִּקֶן דָּוִד אֶת הַגֹּרֶן וְאֶת הַבָּקָר בְּכֶסֶף שְׁקָלִים חֲמִשִּׁים״. במקום הזה נבנה אחר כך בית המקדש.', ref: 'שמואל ב כד, יח–כה; דברי הימים ב ג, א' },
  { id: 'sl_sword', he: 'חרב גלית נשמרה בנוב, עיר הכהנים, עטופה בשמלה: ״הִנֵּה הִיא לוּטָה בַשִּׂמְלָה אַחֲרֵי הָאֵפוֹד״.', ref: 'שמואל א כא, י' },
];

/* ── the progress (G.games.sling = { lv, best: {lv: stars} }) ── */
function slot(G) {
  const o = G && typeof G === 'object' ? G : {};
  if (!o.games || typeof o.games !== 'object' || Array.isArray(o.games)) o.games = {};
  let s = o.games.sling;
  if (!s || typeof s !== 'object') s = o.games.sling = { lv: 1, best: {} };
  if (!(s.lv >= 1 && s.lv <= LEVELS.length)) s.lv = 1;
  if (!s.best || typeof s.best !== 'object') s.best = {};
  return s;
}
export const levelOf = (G) => slot(G).lv | 0 || 1;
/** a finished level: its best stars; a win opens the next (after the last, the valley again from level 1) */
export function record(G, lv, r) {
  if (!G || !r || r.quit) return;
  const s = slot(G);
  if (r.won) { s.best[lv] = Math.max(s.best[lv] | 0, r.stars | 0); if (lv === s.lv) s.lv = lv >= LEVELS.length ? 1 : lv + 1; }
}

/* ───────── the physics world of one level (no DOM) ───────── */
const dAng = (a) => { let x = a % (2 * Math.PI); if (x > Math.PI) x -= 2 * Math.PI; if (x < -Math.PI) x += 2 * Math.PI; return x; };
export function makeWorld(lv) {
  const def = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, (lv | 0) - 1))];
  const engine = Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8 });
  engine.gravity.y = 1;
  const W = { lv, def, engine, items: [], targets: [], shots: [], goliath: null, t: 0, down: 0, used: 0, events: [], knock: [] };
  const add = (b) => { Composite.add(engine.world, b); return b; };
  add(Bodies.rectangle(WW / 2, GROUND + 60, WW * 4, 120, { isStatic: true, friction: 0.9, label: 'ground' }));
  add(Bodies.rectangle(366, LEDGE + 60, 96, 120, { isStatic: true, friction: 0.9, label: 'ledge' }));
  const gap = 0.4;
  const mk = (kind, w, hh, b) => { b.plugin = { kind, w, h: hh }; W.items.push(b); return add(b); };
  const wood = { density: 0.0009, friction: 0.7, frictionStatic: 0.9 }, rock = { density: 0.0024, friction: 0.7, frictionStatic: 0.9 };
  for (const it of def.items) {
    const [k, x, y] = it;
    if (k === 'post') mk('post', 12, 64, Bodies.rectangle(x, y - 32 - gap, 12, 64, wood));
    else if (k === 'plank') mk('plank', it[3] || 90, 10, Bodies.rectangle(x, y - 5 - gap, it[3] || 90, 10, wood));
    else if (k === 'block') mk('block', 29.6, 30, Bodies.rectangle(x, y - 15 - gap, 29.6, 30, rock));
    else if (k === 'slab') mk('slab', it[3] || 64, 18, Bodies.rectangle(x, y - 9 - gap, it[3] || 64, 18, rock));
    else if (k === 'pole') {
      const kind = it[3] || 'helmet', hp = it[4] || 50, top = y - 6 - hp;
      const foot = Bodies.rectangle(x, y - 3 - gap, 14, 6, { density: 0.0008 });
      const shaft = Bodies.rectangle(x, y - 6 - hp / 2 - gap, 6, hp, { density: 0.0008 });
      const head = kind === 'helmet' ? Bodies.rectangle(x, top - 7 - gap, 24, 14, { density: 0.0008 })
        : kind === 'great' ? Bodies.rectangle(x, top + 20 - gap, 16, 52, { density: 0.0008 })
          : Bodies.circle(x, top + 8 - gap, 13, { density: 0.0008 });
      foot.plugin = { kind: 'foot', w: 14, h: 6 }; shaft.plugin = { kind: 'shaft', w: 6, h: hp }; head.plugin = { kind };
      const b = Body.create({ parts: [foot, shaft, head], friction: 0.7, frictionStatic: 0.9 });
      b.plugin = { kind: 'target', head: kind };
      b.x0 = b.position.x; b.y0 = b.position.y; b.a0 = b.angle;
      if (!def.goliath) W.targets.push(b);
      W.items.push(b); add(b);
    }
  }
  if (def.goliath) {
    const gx = def.goliath.x;
    const st = (x, y, w, hh, o = {}) => add(Bodies.rectangle(gx + x, y, w, hh, { isStatic: true, label: 'goliath', ...o }));
    const parts = [st(0, GROUND - 42, 34, 84), st(0, GROUND - 130, 56, 96), st(-2, GROUND - 196, 30, 34), st(-2, GROUND - 222, 34, 16)];
    const brow = add(Bodies.circle(gx + 12, GROUND - 205, 9, { isStatic: true, isSensor: true, label: 'forehead' }));
    W.goliath = { x: gx, parts, brow, fall: -1, ang: 0, down: false, hitAt: null, hit: null };
    W.targets.push({ goliath: true });
  }
  Events.on(engine, 'collisionStart', (ev) => {
    for (const p of ev.pairs) {
      const a = p.bodyA.parent || p.bodyA, b = p.bodyB.parent || p.bodyB;
      const shot = a.label === 'shot' ? a : b.label === 'shot' ? b : null, other = shot === a ? b : a;
      if (W.goliath && W.goliath.fall < 0 && shot && (p.bodyA.label === 'forehead' || p.bodyB.label === 'forehead')) { W.goliath.hit = shot; continue; }
      if (p.bodyA.isSensor || p.bodyB.isSensor) continue;
      const sp = Math.hypot(a.velocity.x - b.velocity.x, a.velocity.y - b.velocity.y);
      // a solid blow topples a pole (the game helps its physics a little: a hit that shakes a helmet counts, like a cartoon)
      for (const [t, o] of [[a, b], [b, a]]) if (t.plugin && t.plugin.kind === 'target' && !t.down && !o.isStatic && sp > (o.label === 'shot' ? 2.4 : 3.4)) W.knock.push({ t, dir: Math.sign(t.position.x - o.position.x) || -1 });
      if (sp > 2.2) {
        const c = p.collision && p.collision.supports && p.collision.supports[0];
        W.events.push({ k: 'hit', x: c ? c.x : other.position.x, y: c ? c.y : other.position.y, sp, wood: /post|plank/.test((other.plugin && other.plugin.kind) || ''), shot: !!shot, mass: Math.min(2, (shot || other).mass || 1) });
      }
    }
  });
  // the world settles before it is shown (a level begins at rest; the poles held still meanwhile), then sleeps until a stone wakes it
  const poles = W.items.filter((b) => b.plugin.kind === 'target');
  for (const b of poles) Body.setStatic(b, true);
  for (let i = 0; i < 90; i++) Engine.update(engine, 1000 / 60);
  for (const b of poles) { Body.setStatic(b, false); Body.setVelocity(b, { x: 0, y: 0 }); Body.setAngularVelocity(b, 0); }
  for (const b of W.items) { b.x0 = b.position.x; b.y0 = b.position.y; b.a0 = b.angle; Matter.Sleeping.set(b, true); }
  W.events = [];
  return W;
}
function fell(W, shot) {
  const g = W.goliath; g.fall = 0; g.hitAt = { x: g.brow.position.x, y: g.brow.position.y };
  for (const b of [...g.parts, g.brow]) Composite.remove(W.engine.world, b);
  Body.setVelocity(shot, { x: -shot.velocity.x * 0.2, y: -2 });
  W.events.push({ k: 'goliath', x: g.hitAt.x, y: g.hitAt.y });
}
/** one physics step (1/60 s); → the events since the last step ({k:'hit'|'down'|'goliath'|'fell'}) */
export function stepWorld(W) {
  Engine.update(W.engine, 1000 / 60);
  W.t += 1 / 60;
  if (W.goliath && W.goliath.hit && W.goliath.fall < 0) fell(W, W.goliath.hit);   // (after the step: the pairs still hold his bodies inside it)
  for (const k of W.knock) if (!k.t.down && !(W.t - (k.t.kickT == null ? -9 : k.t.kickT) < 0.5)) { k.t.kickT = W.t; Matter.Sleeping.set(k.t, false); Body.setAngularVelocity(k.t, 0.16 * (k.dir < 0 ? -1 : 1)); Body.setVelocity(k.t, { x: k.t.velocity.x + 1.2 * k.dir, y: k.t.velocity.y - 0.6 }); }
  W.knock.length = 0;
  for (const s of W.shots) {
    s.t += 1 / 60;
    const b = s.b;
    if (!s.gone && (b.position.x < -80 || b.position.x > WW + 80 || b.position.y > WH + 60 || s.t > 8)) { s.gone = true; Composite.remove(W.engine.world, b); }
  }
  for (const b of W.targets) {
    if (b.goliath || b.down) continue;
    if (Math.abs(dAng(b.angle - b.a0)) > 0.9 || b.position.y - b.y0 > 24 || b.position.x < -30 || b.position.y > WH + 30 || Math.hypot(b.position.x - b.x0, b.position.y - b.y0) > 70) {
      b.down = true; W.down++; W.events.push({ k: 'down', x: b.position.x, y: b.position.y - 30 });
    }
  }
  const g = W.goliath;
  if (g && g.fall >= 0 && !g.down) {
    g.fall += 1 / 60;
    const u = Math.min(1, g.fall / 0.95);
    g.ang = (Math.PI / 2) * u * u;                       // he topples forward, faster and faster
    if (u >= 1) { g.down = true; g.ang = Math.PI / 2; W.down++; W.targets[0].down = true; W.events.push({ k: 'fell', x: g.x + 150, y: GROUND - 10 }); }
  }
  const ev = W.events; W.events = [];
  return ev;
}
export const allDown = (W) => W.targets.every((t) => t.down);
/** the stone leaves the pouch with the pull's velocity (pull: the drag, from the pouch, in world units) */
export function velOf(pull) {
  const l = Math.hypot(pull.x, pull.y), k = Math.min(1, MAXPULL / Math.max(1e-6, l));
  return { x: -pull.x * k * (VMAX / MAXPULL), y: -pull.y * k * (VMAX / MAXPULL) };
}
export function launch(W, v) {
  const b = Bodies.circle(ANCHOR.x, ANCHOR.y, R_STONE, { density: 0.006, restitution: 0.2, friction: 0.5, frictionAir: FA, label: 'shot' });
  Composite.add(W.engine.world, b);
  Body.setVelocity(b, v);
  W.shots.push({ b, t: 0 });
  W.used++;
  return b;
}
/** the arc a stone would fly, ignoring what it hits: [{x, y}] every step (the dots, and the solver) */
export function arc(v, steps = 150) {
  const out = []; let x = ANCHOR.x, y = ANCHOR.y, vx = v.x, vy = v.y;
  for (let i = 0; i < steps; i++) {
    vx = vx * (1 - FA); vy = vy * (1 - FA) + G_STEP;
    x += vx; y += vy;
    out.push({ x, y });
    if (y > GROUND + 10 || x < -40) break;
  }
  return out;
}
/** where to aim at a standing target: its helmet / shield, or Goliath's forehead */
export function aimPoint(W, i) {
  const t = W.targets[i]; if (!t) return null;
  if (t.goliath) return W.goliath && W.goliath.brow ? { x: W.goliath.brow.position.x, y: W.goliath.brow.position.y } : null;
  const head = t.parts.find((p) => p.plugin && /helmet|shield|great/.test(p.plugin.kind));
  return head ? { x: head.position.x, y: head.position.y } : { x: t.position.x, y: t.position.y };
}
/** the solver: a pull whose arc passes through point p — a flat shot (lob: the high one) → {x, y} (world units) | null */
export function solve(p, lob = false) {
  let best = null;
  for (let a = 0; a <= 80; a += 1) {
    const ang = ((lob ? 80 - a : a) - 5) * Math.PI / 180;   // above the horizontal, toward the left
    let lo = 0.15, hi = 1;
    for (let it = 0; it < 22; it++) {
      const m = (lo + hi) / 2, v = { x: -Math.cos(ang) * VMAX * m, y: -Math.sin(ang) * VMAX * m };
      const pts = arc(v, 220); let yAt = null;
      for (let j = 1; j < pts.length; j++) if (pts[j].x <= p.x) { const q = pts[j - 1], r = pts[j], f = (q.x - p.x) / Math.max(1e-6, q.x - r.x); yAt = q.y + (r.y - q.y) * f; break; }
      if (yAt == null) { lo = m; continue; }                // short: more power
      if (yAt > p.y) lo = m; else hi = m;                   // below the point: more power
    }
    const m = (lo + hi) / 2, v = { x: -Math.cos(ang) * VMAX * m, y: -Math.sin(ang) * VMAX * m };
    const pts = arc(v, 220);
    let d = 1e9; for (const q of pts) d = Math.min(d, Math.hypot(q.x - p.x, q.y - p.y));
    if (d < 4 && m < 0.995) { best = { x: -v.x * MAXPULL / VMAX, y: -v.y * MAXPULL / VMAX }; break; }
  }
  return best;
}
export function snapshot(W) { return W.items.map((b) => ({ b, x: b.position.x, y: b.position.y, a: b.angle, vx: b.velocity.x, vy: b.velocity.y, w: b.angularVelocity, s: b.isSleeping })); }

/* ───────── the drawing (canvas 2D, the board's warm look) ───────── */
function ashlar(g, w, hh) {
  const gr = g.createLinearGradient(0, -hh / 2, 0, hh / 2); gr.addColorStop(0, '#FBF3DE'); gr.addColorStop(0.55, '#E9D9B4'); gr.addColorStop(1, '#C9B288');
  g.fillStyle = gr; g.fillRect(-w / 2, -hh / 2, w, hh);
  g.strokeStyle = 'rgba(110,80,40,.75)'; g.lineWidth = 1; g.strokeRect(-w / 2 + 0.5, -hh / 2 + 0.5, w - 1, hh - 1);
  const m = Math.min(4, hh * 0.18); if (w > 12 && hh > 12) { g.strokeStyle = 'rgba(110,80,40,.28)'; g.strokeRect(-w / 2 + m, -hh / 2 + m, w - 2 * m, hh - 2 * m); }
}
function cedar(g, w, hh) {
  const gr = g.createLinearGradient(-w / 2, -hh / 2, w / 2, hh / 2); gr.addColorStop(0, '#B7773F'); gr.addColorStop(0.5, '#9A5E2C'); gr.addColorStop(1, '#7A4520');
  g.fillStyle = gr; g.fillRect(-w / 2, -hh / 2, w, hh);
  g.strokeStyle = 'rgba(60,30,10,.35)'; g.lineWidth = 1;
  const long = w > hh;
  for (let i = 1; i < 3; i++) { g.beginPath(); if (long) { g.moveTo(-w / 2 + 2, -hh / 2 + (hh * i) / 3); g.lineTo(w / 2 - 2, -hh / 2 + (hh * i) / 3 + 0.8); } else { g.moveTo(-w / 2 + (w * i) / 3, -hh / 2 + 2); g.lineTo(-w / 2 + (w * i) / 3 + 0.8, hh / 2 - 2); } g.stroke(); }
  g.strokeStyle = 'rgba(50,24,6,.7)'; g.strokeRect(-w / 2 + 0.5, -hh / 2 + 0.5, w - 1, hh - 1);
}
const BRONZE = (g, r) => { const gr = g.createRadialGradient(-r * 0.3, -r * 0.4, 1, 0, 0, r * 1.3); gr.addColorStop(0, '#FFE2A0'); gr.addColorStop(0.45, '#D19A4C'); gr.addColorStop(1, '#8A5A22'); return gr; };
function drawPart(g, p, down) {
  const k = p.plugin && p.plugin.kind;
  g.save(); g.translate(p.position.x, p.position.y); g.rotate(p.angle);
  const pw = p.plugin.w, ph = p.plugin.h;
  if (k === 'block' || k === 'slab') ashlar(g, pw, ph);
  else if (k === 'post' || k === 'plank') cedar(g, pw, ph);
  else if (k === 'foot') { g.fillStyle = '#6B4A2A'; g.fillRect(-7, -3, 14, 6); }
  else if (k === 'shaft') { g.fillStyle = '#8A6238'; g.fillRect(-3, -ph / 2, 6, ph); g.strokeStyle = 'rgba(40,20,5,.5)'; g.lineWidth = 1; g.strokeRect(-3, -ph / 2, 6, ph); }
  else if (k === 'helmet') {   // a bronze helmet: a dome with a rim
    g.fillStyle = BRONZE(g, 12); g.beginPath(); g.moveTo(-12, 7); g.lineTo(-12, 0); g.quadraticCurveTo(-12, -8, 0, -8); g.quadraticCurveTo(12, -8, 12, 0); g.lineTo(12, 7); g.closePath(); g.fill();
    g.fillStyle = '#7A4A18'; g.fillRect(-13, 4, 26, 3);
    g.strokeStyle = 'rgba(255,240,200,.6)'; g.lineWidth = 1.5; g.beginPath(); g.arc(-3, -2, 5, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
  } else if (k === 'shield') {   // a round bronze shield with its boss
    g.fillStyle = BRONZE(g, 13); g.beginPath(); g.arc(0, 0, 13, 0, 6.2832); g.fill();
    g.strokeStyle = '#6E4412'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#FFE7B0'; g.beginPath(); g.arc(0, 0, 3.5, 0, 6.2832); g.fill();
  } else if (k === 'great') {   // the great shield (צִּנָּה, יז, ז): tall, of wood and bronze
    const gr = g.createLinearGradient(-8, 0, 8, 0); gr.addColorStop(0, '#8A5A22'); gr.addColorStop(0.5, '#D19A4C'); gr.addColorStop(1, '#8A5A22');
    g.fillStyle = gr; g.beginPath(); g.roundRect ? g.roundRect(-8, -26, 16, 52, 5) : g.rect(-8, -26, 16, 52); g.fill();
    g.strokeStyle = '#5A3208'; g.lineWidth = 1.5; g.stroke();
    g.strokeStyle = 'rgba(255,230,170,.7)'; g.beginPath(); g.moveTo(0, -20); g.lineTo(0, 20); g.stroke();
  }
  if (down && /helmet|shield|great/.test(k)) { g.globalAlpha = 0.35; g.fillStyle = '#FFF3C4'; g.beginPath(); g.arc(0, 0, 15, 0, 6.2832); g.fill(); g.globalAlpha = 1; }
  g.restore();
}
function drawGoliath(g, G0) {   // a giant in scale armour (שמואל א יז, ד–ז): drawn with dignity, facing right; he falls forward
  const x = G0.x;
  g.save();
  g.translate(x + 16, GROUND); g.rotate(G0.ang); g.translate(-16, 0);
  const bronze = BRONZE(g, 30);
  g.strokeStyle = '#5E4526'; g.lineWidth = 4; g.beginPath(); g.moveTo(-30, -6); g.lineTo(-30, -236); g.stroke();   // the spear
  g.fillStyle = '#9AA0A8'; g.beginPath(); g.moveTo(-30, -250); g.lineTo(-25, -234); g.lineTo(-35, -234); g.closePath(); g.fill();
  for (const dx of [-9, 9]) { g.fillStyle = '#7A5A3A'; g.fillRect(dx - 7, -84, 14, 84); g.fillStyle = bronze; g.fillRect(dx - 7.5, -58, 15, 40); g.fillStyle = '#4A3218'; g.fillRect(dx - 8, -6, 18, 6); }   // legs, bronze greaves, sandals
  g.fillStyle = '#8C3B2A'; g.beginPath(); g.moveTo(-26, -84); g.lineTo(26, -84); g.lineTo(22, -102); g.lineTo(-22, -102); g.closePath(); g.fill();   // the kilt
  g.fillStyle = '#A8763A'; g.fillRect(-28, -176, 56, 76);                                  // the coat of scales
  g.fillStyle = 'rgba(90,55,20,.55)';
  for (let r = 0; r < 7; r++) for (let c = 0; c < 6; c++) { g.beginPath(); g.arc(-23 + c * 9.4 + (r % 2) * 4.5, -170 + r * 10.5, 4.2, 0, Math.PI); g.fill(); }
  g.fillStyle = '#C9955E'; g.fillRect(22, -168, 12, 44);                                   // the arm, forward
  g.strokeStyle = '#6B4A2A'; g.lineWidth = 3; g.beginPath(); g.moveTo(-18, -178); g.lineTo(20, -120); g.stroke();   // the javelin between his shoulders
  g.fillStyle = '#C9955E'; g.fillRect(-7, -188, 14, 12);                                    // the neck
  g.fillStyle = '#C9955E'; g.beginPath(); g.ellipse(-2, -200, 15, 17, 0, 0, 6.2832); g.fill();   // the head
  g.fillStyle = '#5A3A22'; g.beginPath(); g.moveTo(-14, -196); g.quadraticCurveTo(-4, -176, 12, -190); g.lineTo(12, -186); g.quadraticCurveTo(-2, -172, -16, -190); g.closePath(); g.fill();   // a short beard
  g.fillStyle = '#2A1A0E'; g.beginPath(); g.arc(7, -202, 1.8, 0, 6.2832); g.fill();          // the eye
  g.fillStyle = bronze; g.beginPath(); g.moveTo(-18, -206); g.quadraticCurveTo(-18, -228, -2, -229); g.quadraticCurveTo(15, -228, 15, -209); g.lineTo(-18, -206); g.fill();   // the bronze helmet (כּוֹבַע נְחֹשֶׁת)
  g.fillStyle = '#7A4A18'; g.fillRect(-19, -209, 35, 3);
  g.restore();
}
function drawScene(g, W, o) {
  const { w, hh, s, ox, oy, t, reduced } = o;
  const sky = g.createLinearGradient(0, 0, 0, hh); sky.addColorStop(0, '#8DB7E0'); sky.addColorStop(0.62, '#F2D7A6'); sky.addColorStop(1, '#E9C48A');
  g.fillStyle = sky; g.fillRect(0, 0, w, hh);
  g.save(); g.translate(ox, oy); g.scale(s, s);
  const x0 = -ox / s, x1 = (w - ox) / s;
  // a few soft clouds over the valley (still under reduced motion)
  g.fillStyle = 'rgba(255,255,255,.55)';
  for (const [cx, cy, k] of [[70, -110, 1], [250, -30, 0.8], [330, 120, 0.6]]) {
    const dx = reduced ? 0 : ((t * 4 * k) % (WW + 160)), X = ((cx + dx + 80) % (WW + 160)) - 80;
    g.beginPath(); g.ellipse(X, cy, 34 * k, 11 * k, 0, 0, 6.2832); g.ellipse(X + 18 * k, cy - 8 * k, 20 * k, 10 * k, 0, 0, 6.2832); g.ellipse(X - 16 * k, cy - 5 * k, 16 * k, 8 * k, 0, 0, 6.2832); g.fill();
  }
  // the valley of Elah: a hill on each side and the valley between (שמואל א יז, ג)
  g.fillStyle = 'rgba(255,236,190,.55)'; g.beginPath(); g.arc(60, -150, 26, 0, 6.2832); g.fill();   // the sun, soft
  g.fillStyle = '#C9C2B2'; g.beginPath(); g.moveTo(x0, 250); g.bezierCurveTo(90, 200, 170, 240, 230, 225); g.bezierCurveTo(300, 205, 350, 235, x1, 215); g.lineTo(x1, 420); g.lineTo(x0, 420); g.closePath(); g.fill();   // the far ridge
  g.fillStyle = '#C8B08A'; g.beginPath(); g.moveTo(x0, 300); g.bezierCurveTo(30, 250, 130, 262, 250, 480); g.lineTo(x0, 490); g.closePath(); g.fill();   // their hill
  g.fillStyle = '#BFA57C'; g.beginPath(); g.moveTo(150, 500); g.bezierCurveTo(250, 300, 330, 262, x1, 280); g.lineTo(x1, 510); g.closePath(); g.fill();   // Israel's hill
  // the two camps, a tent or three on each hill ("וּפְלִשְׁתִּים עֹמְדִים אֶל הָהָר מִזֶּה וְיִשְׂרָאֵל עֹמְדִים אֶל הָהָר מִזֶּה וְהַגַּיְא בֵּינֵיהֶם", יז, ג)
  const tent = (x, y, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(x - 9, y); g.lineTo(x, y - 11); g.lineTo(x + 9, y); g.closePath(); g.fill(); g.fillStyle = 'rgba(40,24,6,.35)'; g.fillRect(x - 1.2, y - 6, 2.4, 6); };
  tent(22, 272, '#8C6A4A'); tent(50, 268, '#9A5A3A'); tent(84, 277, '#8C6A4A');
  tent(318, 284, '#E6D8B8'); tent(346, 276, '#D8C6A0'); tent(378, 280, '#E6D8B8');
  g.fillStyle = '#AE9366'; g.beginPath(); g.moveTo(x0, 540); g.bezierCurveTo(90, 480, 250, 520, x1, 500); g.lineTo(x1, GROUND); g.lineTo(x0, GROUND); g.closePath(); g.fill();
  for (const [tx, ty, r] of [[36, 505, 16], [262, 488, 12], [300, 500, 9]]) { g.fillStyle = '#6E5A34'; g.fillRect(tx - 1.5, ty, 3, 16); g.fillStyle = '#7C8A4A'; g.beginPath(); g.arc(tx, ty, r, 0, 6.2832); g.fill(); g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(tx - r * 0.3, ty - r * 0.3, r * 0.5, 0, 6.2832); g.fill(); }   // terebinths (אֵלָה)
  const gr = g.createLinearGradient(0, GROUND, 0, WH + 40); gr.addColorStop(0, '#C9A673'); gr.addColorStop(1, '#8A6A45');
  g.fillStyle = gr; g.fillRect(x0, GROUND, x1 - x0, WH + 200 - GROUND);
  g.fillStyle = 'rgba(80,60,30,.25)'; g.fillRect(x0, GROUND, x1 - x0, 3);
  // the brook the stones came from (יז, מ), at his feet
  g.fillStyle = '#7FB4D0'; g.beginPath(); g.ellipse(368, GROUND + 22, 60, 8, 0, 0, 6.2832); g.fill();
  g.fillStyle = '#B9B2A4'; for (const [px, py] of [[330, GROUND + 20], [345, GROUND + 26], [392, GROUND + 18], [405, GROUND + 25]]) { g.beginPath(); g.ellipse(px, py, 4, 2.6, 0, 0, 6.2832); g.fill(); }
  // his rock
  g.fillStyle = '#A48A63'; g.beginPath(); g.moveTo(314, GROUND); g.lineTo(320, LEDGE + 4); g.quadraticCurveTo(360, LEDGE - 6, x1, LEDGE + 2); g.lineTo(x1, GROUND); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(70,50,25,.35)'; g.lineWidth = 1.5; g.stroke();
  // the bodies
  for (const b of W.items) { const parts = b.parts.length > 1 ? b.parts.slice(1) : [b]; for (const p of parts) drawPart(g, p, !!b.down); }
  if (W.goliath) drawGoliath(g, W.goliath);
  for (const sh of W.shots) if (!sh.gone) { const b = sh.b; g.fillStyle = '#8F8A80'; g.beginPath(); g.arc(b.position.x, b.position.y, R_STONE, 0, 6.2832); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(b.position.x - 2.5, b.position.y - 2.5, 3, 0, 6.2832); g.fill(); }
  drawSlinger(g, o);
  // the dots of the arc (the first shots of a level)
  if (o.dots) {   // white dots with a dark rim, fading along the arc
    g.lineWidth = 1.2; g.strokeStyle = 'rgba(60,34,8,.6)';
    o.dots.forEach((p, i) => { if (i % 3 !== 2) return; g.globalAlpha = Math.max(0.25, 1 - i / 160); g.fillStyle = '#FFFBEF'; g.beginPath(); g.arc(p.x, p.y, 3.4, 0, 6.2832); g.fill(); g.stroke(); });
    g.globalAlpha = 1;
  }
  for (const f of o.fx) {
    const a = Math.max(0, 1 - f.age / f.life);
    if (f.k === 'dust') { g.fillStyle = `rgba(214,190,150,${0.6 * a})`; g.beginPath(); g.arc(f.x, f.y - f.age * 12, 4 + f.age * 20, 0, 6.2832); g.fill(); }
    else if (f.k === 'txt') {   // "נפל!" and, under it, the stones it brought (a number alone, left to right: no bidi mix)
      const X = Math.max(34, Math.min(WW - 34, f.x)), Y = f.y - f.age * 26;
      g.globalAlpha = a; g.fillStyle = '#FFF3C4'; g.strokeStyle = 'rgba(60,30,5,.8)'; g.lineWidth = 3; g.textAlign = 'center';
      g.font = '900 17px "Frank Ruhl Libre", serif'; g.strokeText(f.t, X, Y); g.fillText(f.t, X, Y);
      if (f.n) { g.font = '800 15px "Heebo", sans-serif'; const d0 = g.direction; g.direction = 'ltr'; g.strokeText('+' + f.n, X, Y + 17); g.fillStyle = '#FFE08A'; g.fillText('+' + f.n, X, Y + 17); g.direction = d0; }
      g.globalAlpha = 1;
    }
    else if (f.k === 'star') { g.globalAlpha = a; g.fillStyle = '#FFE27A'; g.save(); g.translate(f.x, f.y); g.rotate(reduced ? 0 : f.age * 4); g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 5 : 13 + f.age * 10; g.lineTo(Math.cos(i * Math.PI / 5) * r, Math.sin(i * Math.PI / 5) * r); } g.closePath(); g.fill(); g.restore(); g.globalAlpha = 1; }
  }
  g.restore();
}
function drawSlinger(g, o) {   // the young shepherd on his rock, the sling in his raised hand (a simple figure, from behind)
  const fx = 372, fy = LEDGE + 1;
  g.fillStyle = '#6E4A2A'; g.fillRect(fx - 6, fy - 22, 5, 22); g.fillRect(fx + 2, fy - 22, 5, 22);   // legs
  g.fillStyle = '#E4D2A8'; g.beginPath(); g.moveTo(fx - 12, fy - 20); g.lineTo(fx + 12, fy - 20); g.lineTo(fx + 8, fy - 52); g.lineTo(fx - 8, fy - 52); g.closePath(); g.fill();   // the tunic
  g.fillStyle = '#8A5A2E'; g.fillRect(fx + 6, fy - 40, 9, 12);   // the shepherd's bag (יַלְקוּט)
  g.fillStyle = '#C99A6E'; g.beginPath(); g.arc(fx, fy - 60, 8, 0, 6.2832); g.fill();   // the head
  g.fillStyle = '#9A4A22'; g.beginPath(); g.arc(fx, fy - 63, 8, Math.PI * 1.05, Math.PI * 1.95); g.fill();   // ruddy hair (אַדְמוֹנִי, יז, מב)
  g.strokeStyle = '#C99A6E'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(fx - 5, fy - 48); g.lineTo(HAND.x, HAND.y); g.stroke(); g.lineCap = 'butt';   // the arm
  // the sling: two cords from the hand to the pouch
  const P = o.pouch;
  g.strokeStyle = '#5A3A1A'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(HAND.x, HAND.y); g.lineTo(P.x + 4, P.y - 3); g.moveTo(HAND.x + 1, HAND.y + 1); g.lineTo(P.x - 4, P.y + 3); g.stroke();
  g.fillStyle = '#7A5230'; g.beginPath(); g.ellipse(P.x, P.y, 9, 6, Math.atan2(P.y - HAND.y, P.x - HAND.x), 0, 6.2832); g.fill();
  if (o.loaded) { g.fillStyle = '#8F8A80'; g.beginPath(); g.arc(P.x, P.y - 1, R_STONE - 1, 0, 6.2832); g.fill(); }
}

/* ───────── the game ───────── */
const CSS = `
.g10-sling{position:relative;flex:1;min-height:0;width:100%;touch-action:none;cursor:grab}
.g10-sling canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.g10-sl-hud{position:absolute;top:calc(env(safe-area-inset-top,0px) + 8px);left:10px;right:10px;display:flex;justify-content:space-between;gap:8px;pointer-events:none;z-index:2}
.g10-sl-hud span{background:rgba(20,12,4,.62);border-radius:999px;padding:4px 12px;font:800 14.5px/1.3 "Heebo",sans-serif;color:#FFF3D6;white-space:nowrap}
.g10-sl-hud i{font-style:normal;color:#FFD66E}
.g10-sl-hud .peb{letter-spacing:2px;font-size:16px}
.g10-sl-tip{position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 56px);text-align:center;pointer-events:none;font:800 15px/1.3 "Heebo",sans-serif;color:#FFF3D6;transition:opacity .3s}
.g10-sl-tip span{display:inline-block;background:rgba(20,12,4,.66);border-radius:999px;padding:6px 14px;max-width:88%}
.g10-sl-x{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);inset-inline-end:10px;z-index:4}
@media (prefers-reduced-motion:reduce){.g10-sl-tip{transition:none}}
`;
export function icon(g, s) {
  const sky = g.createLinearGradient(0, 0, 0, s); sky.addColorStop(0, '#9CC2E6'); sky.addColorStop(1, '#F2D7A6');
  g.fillStyle = sky; g.beginPath(); g.roundRect ? g.roundRect(0, 0, s, s, s * 0.2) : g.rect(0, 0, s, s); g.fill();
  g.fillStyle = '#C9A673'; g.fillRect(0, s * 0.8, s, s * 0.2);
  const k = s / 76;
  g.save(); g.scale(k, k);
  g.fillStyle = '#9A5E2C'; g.fillRect(12, 34, 6, 27); g.fillRect(34, 34, 6, 27); g.fillRect(9, 28, 34, 6);
  g.fillStyle = '#D19A4C'; g.beginPath(); g.arc(26, 21, 7, Math.PI, 0); g.fill(); g.fillRect(18, 20, 16, 3);
  g.strokeStyle = '#5A3A1A'; g.lineWidth = 2; g.beginPath(); g.moveTo(66, 30); g.lineTo(54, 42); g.moveTo(66, 30); g.lineTo(58, 46); g.stroke();
  g.fillStyle = '#7A5230'; g.beginPath(); g.ellipse(55, 45, 6, 4, -0.8, 0, 6.2832); g.fill();
  g.fillStyle = 'rgba(255,250,235,.95)'; for (const [x, y] of [[48, 36], [42, 30], [36, 27]]) { g.beginPath(); g.arc(x, y, 1.8, 0, 6.2832); g.fill(); }
  g.restore();
}
export const GAME = {
  id: 'sling', title: 'הקלע של דוד', sub: 'חמש אבנים מן הנחל — הפל את הקסדות והמגינים. בסוף: גָּלְיָת.', chip: 'לבד · 10 שלבים', pay: { stone: 10 },
  how: [
    'משוך את הקלע אחורה — מכל מקום במסך — ושחרר. ככל שמושכים יותר, האבן עפה רחוק יותר.',
    'הפל את כל הקסדות והמגינים שעל המוטות. בשתי האבנים הראשונות הנקודות מראות את הדרך.',
    'חמש אבנים בכל שלב. בשלב האחרון — גָּלְיָת: רק אבן במצח.',
  ],
  quote: { he: 'וַיִּבְחַר לוֹ חֲמִשָּׁה חַלֻּקֵי אֲבָנִים מִן הַנַּחַל', src: 'שמואל א יז, מ' },
  solo: 'לבד', soloSub: 'השלבים נשמרים', duelSub: 'אותו שלב, תור לכל אחד — מי מפיל יותר?',
  icon, facts: FACTS, run,
};

/** one level: resolves when it is won, when the five stones are spent and the world is still, or on the exit */
async function run(S, ctx = {}) {
  const { sfx = () => {}, reduced } = ctx;
  const lv = Math.max(1, Math.min(LEVELS.length, (ctx.level | 0) || (ctx.G ? levelOf(ctx.G) : 1)));
  injectCSS('g10-sl-css', CSS);
  const scr = S.screen('g10-sl');
  scr.style.cssText = 'display:flex;flex-direction:column;align-items:stretch';
  const box = h('div', 'g10-sling'); box.setAttribute('role', 'application'); box.setAttribute('aria-label', 'הקלע של דוד: משוך אחורה ושחרר');
  const cv = document.createElement('canvas'); box.appendChild(cv);
  const hud = h('div', 'g10-sl-hud'); box.appendChild(hud);
  const tip = h('div', 'g10-sl-tip', LEVELS[lv - 1].goliath   // (the last level: David's answer, a draft with its source)
    ? '<span>״וְאָנֹכִי בָא אֵלֶיךָ בְּשֵׁם ה׳…״ <small style="opacity:.85">(שמואל א יז, מה · טיוטה)</small><br>רק אבן במצח</span>'
    : `<span>${LEVELS[lv - 1].tip || 'משוך את הקלע אחורה ושחרר'}</span>`); box.appendChild(tip);
  const x = h('button', 'g10-x g10-sl-x', 'יציאה'); x.type = 'button'; box.appendChild(x);
  scr.appendChild(box);
  let W = makeWorld(lv), def = W.def, who = ctx.duel ? (ctx.first | 0) : 0;
  let quit = false, raf = 0, finish = null, drag = null, whirl = null, lastShotAt = -9, over = false, won = false, score = 0;
  const fx = [];
  let done = new Promise((r) => { finish = r; });
  /* a duel on one phone: the same level twice, one turn each (the phone passes between them); a new turn = a fresh valley */
  const newTurn = (p) => {
    W = makeWorld(lv); def = W.def; who = p; over = false; won = false; score = 0; lastShotAt = -9; whirl = null; drag = null; fx.length = 0;
    tip.innerHTML = `<span>${PLAYERS[p].name}: משוך את הקלע אחורה ושחרר</span>`; tip.style.opacity = '1';
    done = new Promise((r) => { finish = r; }); paintHud(); return done;
  };
  x.addEventListener('click', async () => { if (await S.confirm('לצאת מהמשחק?')) { quit = true; finish(); } });
  let geo = { s: 1, ox: 0, oy: 0, w: 1, hh: 1 };
  const toWorld = (cx, cy) => { const r = cv.getBoundingClientRect(); return { x: (cx - r.left - geo.ox) / geo.s, y: (cy - r.top - geo.oy) / geo.s }; };
  const toPage = (p) => { const r = cv.getBoundingClientRect(); return { x: r.left + geo.ox + p.x * geo.s, y: r.top + geo.oy + p.y * geo.s }; };
  const left = () => STONES - W.used - (whirl ? 1 : 0);
  const ready = () => !over && !whirl && left() > 0 && (W.used === 0 || W.t - lastShotAt > 1.1);
  function paintHud() {
    const n = left();
    const pl = ctx.duel ? `<span class="who" style="box-shadow:inset 0 0 0 3px ${PLAYERS[who].color}">תור <i>${PLAYERS[who].name}</i></span>` : '';
    hud.innerHTML = `${pl}<span>שלב <i>${lv}</i>${ctx.duel ? '' : ` · ${def.n}`}</span><span class="peb" aria-label="${n} אבנים נשארו">${'●'.repeat(Math.max(0, n))}<span style="opacity:.35;background:none;padding:0">${'●'.repeat(Math.max(0, STONES - n))}</span></span>`;
  }
  paintHud();
  box.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button') || !ready() || quit) return;
    e.preventDefault();
    try { box.setPointerCapture(e.pointerId); } catch (x2) { /* */ }
    drag = { id: e.pointerId, start: toWorld(e.clientX, e.clientY), pull: { x: 0, y: 0 } };
    sfx('rope');
  });
  box.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const p = toWorld(e.clientX, e.clientY);
    let px = p.x - drag.start.x, py = p.y - drag.start.y;
    const l = Math.hypot(px, py); if (l > MAXPULL) { px *= MAXPULL / l; py *= MAXPULL / l; }
    drag.pull = { x: px, y: py };
  });
  const release = (e) => {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    const pull = drag.pull; drag = null;
    if (over || quit || whirl || left() <= 0) return;                             // (the level ended under the finger)
    if (Math.hypot(pull.x, pull.y) < 14) return;                                   // a tap, not a pull
    const v = velOf(pull);
    if (v.x > -0.6) { tip.innerHTML = '<span>משוך אחורה — ימינה, הרחק מהמגדלים</span>'; tip.style.opacity = '1'; return; }
    tip.style.opacity = '0';
    whirl = { t0: performance.now(), v, pull, dur: reduced ? 0 : 240 };
    sfx('whoosh');
    paintHud();
  };
  box.addEventListener('pointerup', release);
  box.addEventListener('pointercancel', () => { drag = null; });
  box.__g10 = {
    state: () => ({
      level: lv, name: def.n, stones: left(), used: W.used, targets: W.targets.length, down: W.down, over, won, flying: W.shots.some((q) => !q.gone && W.t - q.t < 99 && Math.hypot(q.b.velocity.x, q.b.velocity.y) > 0.5),
      ready: ready(), goliath: W.goliath ? { fall: W.goliath.fall, down: W.goliath.down } : null, pouch: toPage(ANCHOR), scale: geo.s,
      aims: W.targets.map((t, i) => (t.down ? null : aimPoint(W, i))).map((p) => (p ? toPage(p) : null)),
    }),
    /** a drag (page px) that the arc says reaches standing target i: { from, to } (lob: the high arc) */
    aimAt(i, lob = false) {
      const p = aimPoint(W, i); if (!p) return null;
      const pull = solve(p, lob); if (!pull) return null;
      const from = toPage(ANCHOR), to = toPage({ x: ANCHOR.x + pull.x, y: ANCHOR.y + pull.y });
      return { from, to, pull };
    },
  };
  let acc = 0, last = performance.now();
  function frame() {
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (whirl && now - whirl.t0 >= whirl.dur) { launch(W, whirl.v); lastShotAt = W.t; whirl = null; paintHud(); }
    if (!quit) {
      acc += dt;
      let n = 0;
      while (acc >= 1 / 60 && n < 4) {
        acc -= 1 / 60; n++;
        for (const ev of stepWorld(W)) {
          if (ev.k === 'hit') { if (!reduced) fx.push({ k: 'dust', x: ev.x, y: ev.y, age: 0, life: 0.5 }); if (ev.sp > 3) sfx(ev.wood ? 'wood' : 'thud', { mass: ev.mass * 0.5 }); }
          else if (ev.k === 'down') {
            score += 500; sfx('chime', { combo: W.down });
            let got = 0; try { got = ctx.onDown ? +ctx.onDown(W.down) || 0 : 0; } catch (e) { /* */ }
            fx.push({ k: 'txt', t: 'נפל!', n: got > 0 ? got : 0, x: ev.x, y: ev.y, age: 0, life: 1.2 });   // (in the quarry's cycle: the stones it brought)
          }
          else if (ev.k === 'goliath') { fx.push({ k: 'star', x: ev.x, y: ev.y, age: 0, life: 0.9 }); sfx('crack'); }
          else if (ev.k === 'fell') { score += 3000; for (let i = 0; i < (reduced ? 0 : 7); i++) fx.push({ k: 'dust', x: ev.x - 90 + i * 30, y: GROUND - 4, age: -i * 0.04, life: 0.9 }); sfx('thud', { mass: 2 }); try { ctx.onDown && ctx.onDown(W.down); } catch (e) { /* */ } }
        }
      }
      if (n >= 4) acc = 0;
      for (const f of fx) f.age += dt;
      for (let i = fx.length - 1; i >= 0; i--) if (fx[i].age > fx[i].life) fx.splice(i, 1);
      if (!over && allDown(W)) { over = true; won = true; setTimeout(() => finish(), reduced ? 500 : 1300); sfx(W.used <= 2 ? 'win3' : 'm3win'); }
      else if (!over && !whirl && W.used >= STONES && W.t - lastShotAt > 2.2) {
        const still = W.t - lastShotAt > 6 || W.items.every((b) => b.isSleeping || Math.hypot(b.velocity.x, b.velocity.y) < 0.25);
        if (still) { over = true; setTimeout(() => finish(), 500); }
      }
    }
    // draw
    const { w, h: hh, g } = fitCanvas(cv);
    const s = Math.min(w / WW, hh / WH), ox = (w - WW * s) / 2, oy = hh - WH * s;
    geo = { s, ox, oy, w, hh };
    let pouch = { ...ANCHOR }, dots = null;
    if (drag) { pouch = { x: ANCHOR.x + drag.pull.x * PULL_SHOW, y: ANCHOR.y + drag.pull.y * PULL_SHOW }; if (W.used < DOTS_FOR && Math.hypot(drag.pull.x, drag.pull.y) >= 14) dots = arc(velOf(drag.pull), 150); }
    else if (whirl) {   // the sling whirls once overhead, then lets the stone go
      const u = whirl.dur ? Math.min(1, (now - whirl.t0) / whirl.dur) : 1, a0 = Math.atan2(whirl.pull.y, whirl.pull.x);
      const a = a0 + u * Math.PI * 2, r = 22;
      pouch = { x: HAND.x + Math.cos(a) * r, y: HAND.y - 8 + Math.sin(a) * r };
      if (W.used < DOTS_FOR) dots = arc(whirl.v, 150);
    }
    drawScene(g, W, { w, hh, s, ox, oy, t: now / 1000, reduced, pouch, loaded: (drag || (!whirl && ready())) && left() > 0, dots, fx });
    raf = requestAnimationFrame(frame);
  }
  await sleep(30);
  raf = requestAnimationFrame(frame);
  const turnResult = () => {
    const used = W.used, stars = won ? (used <= 2 ? 3 : used <= 3 ? 2 : 1) : 0;
    return { won, stars, used, down: W.down, targets: W.targets.length, level: lv, goliath: !!W.goliath && won, score: score + (won ? (STONES - used) * 1000 : 0) };
  };
  try {
    if (ctx.duel) tip.innerHTML = `<span>${PLAYERS[who].name} מתחיל: משוך את הקלע אחורה ושחרר</span>`;
    await done;
    if (quit) return { quit: true, level: lv };
    if (!ctx.duel) { const r = turnResult(); return { ...r, winner: r.won ? 0 : 1 }; }
    const rs = []; rs[who] = turnResult();
    const next = 1 - who;
    await S.card(`<h2>תור ${PLAYERS[next].name}</h2><p>${PLAYERS[1 - next].name}: ${rs[1 - next].down} מתוך ${rs[1 - next].targets}${rs[1 - next].won ? ` ב־${rs[1 - next].used} אבנים` : ''}. עכשיו אותו שלב — חמש אבנים ל${PLAYERS[next].name}.</p>`, [{ value: 'go', label: 'מוכן', gold: true }]);
    await newTurn(next);
    if (quit) return { quit: true, level: lv };
    rs[next] = turnResult();
    const [a, b] = rs, cmp = a.down !== b.down ? b.down - a.down : a.won && b.won ? a.used - b.used : 0;
    return { duel: true, winner: cmp < 0 ? 0 : cmp > 0 ? 1 : -1, down: [a.down, b.down], used: [a.used, b.used], targets: a.targets, level: lv, won: a.won || b.won, stars: 0, goliath: !!W.goliath && (a.won || b.won) };
  } finally { cancelAnimationFrame(raf); }
}
export { run };
