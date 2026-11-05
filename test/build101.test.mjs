// build 101 — the world's foundation (the owner, 4.11 21:55: "דמות כפולה שהולכת בהבהוב… המדרגות עומדות באוויר… כל 5 שניות עולה דמות
// ונבלעת לתוך האדמה"; 5.11 01:18 he chose "בסיס לעולם קודם"): one kind of people at the works, nobody on what is not built, every man and
// loose thing on the floor with its shadow, holes that cast no shadow, a working light and a nearer camera.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('build 101: the kit — contact shadow, jar, stone pile, table; the light presets and the camera', async () => {
  const W = await import('../src/game/world101.js');
  assert.equal(W.CREW101.crowd, 1); assert.ok(W.CREW101.n >= 30 && W.CREW101.near >= 150 && W.CREW101.keep > W.CREW101.near, 'many real figures, kept as the camera turns');
  assert.ok(W.CREW101.behind < -1000, 'not dropped when behind the camera (no swap as it turns)');
  for (const L of [W.LIGHT101, W.LIGHT101B]) { assert.ok(L.time.el >= 20 && L.time.el <= 40, 'a sun high enough for short shadows'); assert.equal(L.time.night, false); assert.equal(L.grade.gain.length, 3); }
  assert.ok(W.CAM101.d < 34 && W.CAM101.d >= 18, 'nearer than build 64');
  const b = W.blob101(0.5, 0.4); assert.equal(b.name, 'blob101'); assert.ok(b.position.y > 0 && b.position.y < 0.1); assert.equal(b.material.depthWrite, false);
  const j = W.jar101({ h: 1.6 }); const bb = { lo: Infinity, hi: -Infinity };
  j.traverse((n) => { if (n.isMesh && !n.userData.blob101) { n.geometry.computeBoundingBox(); const g = n.geometry.boundingBox; bb.lo = Math.min(bb.lo, g.min.y + n.position.y); bb.hi = Math.max(bb.hi, g.max.y + n.position.y); } });
  assert.ok(Math.abs(bb.lo) < 0.01, 'the jar stands on its foot at y 0'); assert.ok(Math.abs(bb.hi - 1.6) < 0.05, 'h amot high');
  assert.ok(j.children.some((c) => c.userData.blob101), 'its shadow under it');
  const p = W.pile101({ n: 8 }); const stones = p.children.filter((c) => c.isMesh && c.geometry.type === 'BoxGeometry' && c.geometry.parameters.depth > 1.5);
  assert.equal(stones.length, 8); for (const s of stones) assert.ok(s.position.y > 0.16, 'every stone on the skids, none on the floor');
  assert.ok(W.table101().children.some((c) => c.userData.blob101));
});

test('build 101: crew71 draws crowd.js people too when tuned, with their held things', () => {
  const C = read('src/crew71.js');
  assert.match(C, /function tune\(t\) \{ cfg = t \? Object\.freeze\(\{ \.\.\.CREW71, \.\.\.t \}\) : CREW71;/);
  assert.match(C, /if \(cfg\.hide\)/, 'no cylinder near the camera among the real people');
  assert.match(C, /cfg\.crowd && stages && stages\.crowd/);
  assert.match(C, /function held101\(kind\)/);
  assert.match(C, /\(!a\.lod71 && a\.K && a\.K\.m && !a\.K\.m\.visible\)\) continue;/, 'a real man is not dropped because his dress\'s instanced mesh hid itself (the flicker)');
  const R = read('src/crowd.js');
  assert.match(R, /_people: people, get enabled\(\) \{ return enabled; \}/);
  assert.match(R, /setFloor101\(v\)/);
  assert.match(R, /if \(cur === 'site' && !onFloor\(x, z\)\) \{ a\.visT = 0; a\.off101 = true; \}/, 'nobody placed on steps or a wall top');
  assert.match(R, /if \(cur === 'site' && !pathOnFloor\(pts\)\) \{ a\.off101 = true; return; \}/, 'no walk over them');
});

test('build 101: har42 — life layer off, crowd kept as real people on the floor, the working light, the stage-06 plan in lime', () => {
  const H = read('src/game/har42.js');
  assert.match(H, /const ON101 = qs\('h101'\) !== '0';/);
  assert.match(H, /if \(ON101 \|\| STG === 'yesod'[^)]*\) \{ try \{ if \(stages\.setLife\) stages\.setLife\(false\);/);
  assert.match(H, /c71\.tune\(F101\.CREW101\)/); assert.match(H, /stages\.crowd\.setFloor101\(true\)/);
  assert.match(H, /o\.timeOfDay\(qs\('light101'\) === 'b' \? 'work2' : 'work'\)/);
  assert.match(H, /if \(ON101 && qs\('cam101'\) !== 'far'\) Object\.assign\(FOLLOW, F101\.CAM101\);/);
  assert.match(H, /if \(st\.calm101 !== calm\)/, 'the site\'s people out of an act\'s frame');
  assert.match(H, /F101\.pile101\(/); assert.match(H, /F101\.jar101\(/);
  assert.match(H, /if \(st\.props\.plan49 && !ON101\)/, 'the lime plan stays on the court');
  const M = read('src/main.js'); assert.match(M, /TIMES\.work = LIGHT101\.time; GRADE\.work = LIGHT101\.grade; TIMES\.work2 = LIGHT101B\.time;/);
  assert.match(M, /holeNormal101\(gtao\.normalMaterial\)/, 'the AO keeps the holes');
});

test('build 101: holes cast no shadow — the done stages\' depth material discards as the colour pass does', () => {
  const B = read('src/batch.js');
  assert.match(B, /export function holeDepthMaterial\(\)/); assert.match(B, /export function holeNormal101\(m\)/);
  const S = read('src/stages.js');
  assert.match(S, /m\.customDepthMaterial = building \? st\.depth : HOLE101 \? holeDepthMaterial\(\) : undefined;/);
  assert.match(S, /if \(HOLE101\) for \(const m of meshes\) m\.customDepthMaterial = holeDepthMaterial\(\);/);
});
