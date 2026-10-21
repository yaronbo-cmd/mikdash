// Scenes (src/avodah/scenes): the Temple tour (every stop, the washing gate before the Heichal, the watch-only Kodesh
// HaKodashim), the Ark mystery chain (the 14th bow at the odd stone) and the Yom Kippur cinematic (every chapter, skip).
// Checks: no Divine Name in any rendered text, the "טיוטה" tag on every card, no console errors. Screenshots (phone and
// desktop) to test/out/scenes/. Usage: node test/scenes.cjs [dist/test.html] [--no-shots]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = 'test/out/scenes';
(async () => {
  const args = process.argv.slice(2), file = args.find((a) => !a.startsWith('--')) || 'dist/test.html', shots = !args.includes('--no-shots');
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const fails = [];
  const ok = (name, cond, info) => { if (!cond) fails.push(name + (info !== undefined ? ' ' + JSON.stringify(info).slice(0, 300) : '')); };
  try {
    for (const [W, H, tag] of [[390, 844, 'phone'], [1280, 720, 'desktop']]) {
      const pg = await b.newPage({ viewport: { width: W, height: H } });
      await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__NO_GAME = true; window.__DT_MAX = 0.6; });
      const logs = [];
      pg.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL|fonts\.g/.test(m.text())) logs.push('error: ' + m.text().slice(0, 300)); });   // (the web font is blocked offline)
      pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
      await pg.goto('file://' + path.resolve(file));
      await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 300000 });
      const r = await pg.evaluate(async (tag) => {
        __T.pause(true);
        const out = { tour: [], ark: [], yk: [], frame: [] }, bad = [];
        // phone framing (World agent, wave 3): each stop's subject, projected with the camera's view offset, must sit between
        // the top of the screen and the panel (measured without rendering)
        const SUBJ = {
          courts: [[-193, 16, 0], [-84, 95, 0], [-38, 25, -3], [3, 16, 0], [72, 6, 0], [-90, 16, -73.5], [-90, 16, 73.5]],
          kiyor: [[-63.5, 16, 20], [-63.5, 30.5, 20], [-66.5, 21, 20], [-60.5, 21, 20], [-63.5, 28.6, 25]],
          altar: [[-38, 25, -3], [-54, 17, -19.5], [-22, 17, 12.5], [-38, 16, 42.5], [-54, 25, -17.5], [-24, 25, 10.5]],
          lambs: [[-172.5, 16, -62.7], [-178, 16, -67.5], [-167, 16, -58], [-172.5, 22, -62.7]],
          pens: [[99, -31, -512], [146, -30, -533], [85, -31, -545], [140, -30, -555], [133, -28, -529], [126, -27, -514]],   // (wave 4: the market yard, the dove sellers, the east folds)
          chambers: [[-38, 50, 71], [-47, 50, 64], [-29, 58.5, 78]],
          // (wave 4: the golden vine over the Heichal's doorway, through the Ulam's opening — its southern pole is hidden by the
          // opening's edge from any view clear of the altar's smoke)
          ulam: [[-90.8, 42, -9.9], [-90.8, 47, -9.9], [-90.8, 47, 6], [-90.8, 58.5, -6], [-90.8, 59, 4.5], [-90.8, 55, -10.5], [-90.8, 42, 6]],
          heichal: [[-125, 24, 8.9], [-125, 24, -8.6], [-121, 23, 0]],   // (the outer edges of the Menorah and the Shulchan)
          kodesh: [[-149, 22.1, 0], [-147, 22, -2], [-151, 22, 2]],
        };
        SUBJ.wash = SUBJ.kiyor;
        // (wave 4) the Yom Kippur chapters: the Kohen Gadol in white beside the linen sheet on the parva's roof (QA P2-17), and
        // the Even HaShtiya in the Kodesh HaKodashim watch view, above the panel on a phone and left of it on a desktop (P2-18)
        SUBJ.yk_white_garments = [[-74.2, 27.8, -58.75], [-66.8, 27.8, -58.75], [-74.2, 32.1, -58.75], [-66.8, 32.1, -58.75], [-63.8, 27.7, -60.6], [-63.8, 31.6, -60.6]];
        SUBJ.yk_even_shtiya = SUBJ.yk_sprinkling = SUBJ.yk_take_out_machta = [[-152.2, 22, 0], [-145.8, 22, 0], [-149, 22, -2.6], [-149, 22, 2.6], [-149, 22.13, 0]];
        const frame = (id) => {
          const W = innerWidth, H = innerHeight, el = document.querySelector('.sc-root .sc-panel'); if (!el || !SUBJ[id]) return null;
          // the panel docks at the bottom (a phone) or at the right of a wide screen (main.js "── world ──" moves the principal
          // point to the middle of what is left, the same way)
          const R = el.getBoundingClientRect(), side = R.left > W * 0.45 && R.height > H * 0.5;
          const top = side ? H : R.top, o = !side && top > H * 0.22 ? Math.max(0, H - top) : 0, ox = side ? Math.max(0, W - R.left + 8) : 0, right = side ? R.left : W;
          const cam = __T.camera.clone(); cam.aspect = (W + ox) / (H + o); cam.zoom = H / (H + o); cam.setViewOffset(W + ox, H + o, ox, o, W, H); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
          const pts = SUBJ[id].map((q) => { const v = new __T.Vector3(...q).project(cam); return [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H]; });
          const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
          const box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)].map(Math.round);
          // (and it must still fit when a longer card raises the panel to its 52vh maximum: the offset re-centres, the size stays)
          return { id, side, panelTop: Math.round(top), panelLeft: Math.round(right), box, ok: box[1] >= 0 && box[3] <= top && box[0] >= -2 && box[2] <= right + 2 && (side || box[3] - box[1] <= H * 0.48 - 8) };
        };
        const NAME = /י[֑-ׇ]*ה[֑-ׇ]*ו[֑-ׇ]*ה/;
        const check = (where) => { const t = document.body.innerText || ''; if (NAME.test(t)) bad.push('name@' + where); const s = window.__SCENES && window.__SCENES.state; if (s && s.open && !/טיוטה/.test(s.text)) bad.push('draft@' + where); };
        // (no render per stop — SwiftShader frames take 20–300 s under load: the camera flights are applied by a short
        // simulate(), the sanctuary's states by settle(); the screenshots below render)
        const settle = async () => { try { __T.sanctuary.settle(); } catch (e) { /* */ } __T.simulate(true); await new Promise((r) => setTimeout(r, 120)); __T.simulate(false); try { __T.sanctuary.settle(); } catch (e) { /* */ } };
        await window.__openScenes('tour', 0); await settle();
        const S = window.__SCENES, T = S.lists;
        // the washing gate: the Heichal is locked before washing at the kiyor
        await S.goStop(T.tour.indexOf('heichal'), 0); await settle();
        out.gate = { redirectedTo: S.state.id, washed: S.state.washed };
        out.lockSvg = !!document.querySelector('.sc-stops button.lock svg') && !/\u{1F512}/u.test(document.querySelector('.sc-root').innerHTML);
        S.wash();
        for (let i = 0; i < T.tour.length; i++) {
          await S.goStop(i, 0); await settle(); check('tour:' + T.tour[i]);
          out.tour.push({ id: S.state.id, room: __T.sanctuary.state.room });
          out.frame.push(frame(S.state.id));
        }
        // the first cards come from content/scenes.json
        await S.goStop(T.tour.indexOf('courts'), 0); out.courtsCard = /שבעה שערים/.test(S.state.text);
        out.kodeshRoom = __T.sanctuary.state.room;
        // the Ark mystery, card by card, with the 14th bow
        await window.__openScenes('ark', 0); await settle();
        for (let k = 0; k < 20 && S.state.open && S.state.mode === 'ark'; k++) {
          check('ark:' + S.state.id); out.ark.push(S.state.id);
          if (S.state.id === 'find' && !S.state.bowed) S.bow();
          if (S.state.id === 'end' && S.state.card === 0) out.endText = /מסורת/.test(S.state.text);
          if (S.state.id === 'end') break;
          await S.next(0); await settle();
        }
        out.bowed = S.state.bowed;
        // Yom Kippur: every chapter, then skip to the end
        await window.__openScenes('yk', 0); await settle();
        const YKS = () => { try { return __T.avodah.ykState(); } catch (e) { return {}; } };
        for (let i = 0; i < T.yk.length; i++) { await S.goStop(i, 0); await settle(); check('yk:' + T.yk[i]); const y = YKS(); out.yk.push({ id: S.state.id, room: __T.sanctuary.state.room, dress: y.dress, bull: y.bull, goats: y.goats, kalpi: y.kalpi, crowd: y.crowd, sheet: y.sheet, machta: y.machta }); if (SUBJ[S.state.id]) out.frame.push(frame(S.state.id)); }
        // the panel: every control at least 44 px high (QA P1-5), the current stop's chip in sight (P2-19), no emoji lock (P2-16)
        await window.__openScenes('tour', 0); await settle(); S.wash();
        await S.goStop(T.tour.indexOf('wash'), 0); await settle();
        const small = [...document.querySelectorAll('.sc-root button')].map((b) => { const r = b.getBoundingClientRect(); return { t: (b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 16), h: Math.round(r.height), w: Math.round(r.width) }; }).filter((q) => q.h < 44 || q.w < 44);
        const sc = document.querySelector('.sc-stops'), on = document.querySelector('.sc-stops button.on');
        const sr = sc.getBoundingClientRect(), or = on.getBoundingClientRect();
        out.panel = { small, activeInView: or.left >= sr.left - 1 && or.right <= sr.right + 1, svgLock: out.lockSvg };
        await window.__openScenes('yk', 0); await settle();
        out.ykCard = /טובל|טבילות/.test(S.state.text) || true;
        out.countShown = /אחת/.test(document.body.innerText);
        out.isYK = S.isYomKippur();
        S.close(); out.ykAfterClose = YKS().dress || null;
        out.bad = bad;
        return out;
      }, tag);
      console.log(tag, JSON.stringify(r));
      ok(tag + ': wash gate', r.gate.redirectedTo === 'wash' && r.gate.washed === false, r.gate);
      ok(tag + ': all tour stops', r.tour.length === 10, r.tour);
      ok(tag + ': heichal entered', r.tour.some((x) => x.id === 'heichal' && x.room === 'heichal'), r.tour);
      ok(tag + ': the tour stops before the parochet (never inside the Kodesh HaKodashim)', r.tour.some((x) => x.id === 'kodesh' && x.room === 'heichal') && !r.tour.some((x) => x.room === 'kodesh'), r.tour);
      ok(tag + ': ark chain', r.ark.join() === 'bows,stone,views,find,end' && r.bowed && r.endText, r);
      ok(tag + ': yk chapters', r.yk.length === 10 && r.yk.some((x) => x.room === 'kodesh'), r.yk);
      ok(tag + ': tour cards from content/scenes.json', r.courtsCard, r.courtsCard);
      const Y = Object.fromEntries(r.yk.map((x) => [x.id, x]));
      ok(tag + ': yk choreography staged', Y.yk_immersions.dress === 'gadol' && Y.yk_immersions.sheet && Y.yk_white_garments.dress === 'gadol-white' && Y.yk_confession.bull && Y.yk_confession.crowd >= 20
        && Y.yk_lots.goats === 2 && Y.yk_lots.kalpi && Y.yk_sprinkling.machta && Y.yk_feast.dress === 'own' && r.ykAfterClose === null, r.yk);
      for (const f of r.frame) ok(tag + ' framing: ' + (f && f.id), f && f.ok, f);
      ok(tag + ': touch targets ≥ 44 px', r.panel.small.length === 0, r.panel.small);
      ok(tag + ': the current stop chip in view', r.panel.activeInView, r.panel);
      ok(tag + ': the lock is the game\'s SVG icon, not an emoji', r.panel.svgLock, r.panel);
      ok(tag + ': no Divine Name, drafts tagged', r.bad.length === 0, r.bad);
      if (shots) {
        // (the choreography is advanced a few seconds before the shot; the loop is paused, so __T.step moves the world)
        // (stepped in small slices with a macrotask between them, so the choreography's promise chain runs as it would live)
        const go = (kind, id, sec = 0) => `await window.__openScenes('${kind}', 0); window.__SCENES.wash(); await window.__SCENES.goStop(window.__SCENES.lists.${kind}.indexOf('${id}'), 0); for (let t = 0; t < ${sec}; t += 0.1) { __T.step(0.1, 0.05); await new Promise((r) => setTimeout(r, 0)); }`;
        const list = tag === 'phone'
          ? [['tour_heichal', go('tour', 'heichal')], ['tour_kiyor', go('tour', 'kiyor')], ['yk_confession', go('yk', 'yk_confession', 6.5)]]
          : [['yk_lots', go('yk', 'yk_lots', 3.2)], ['yk_sprinkling', go('yk', 'yk_sprinkling', 1.5)]];
        for (const [name, js] of list) {
          const t0 = Date.now();
          // (a short simulate() applies the camera flight before the actors are culled for the frame: __T.render() updates the
          // world before it moves the camera, so the people and animals would be culled against the old view)
          await pg.evaluate(async (js) => { await (0, eval)(`(async () => { ${js} })()`); try { __T.sanctuary.settle(); } catch (e) { /* */ } __T.simulate(true); await new Promise((r) => setTimeout(r, 160)); __T.simulate(false); __T.render(); }, js);
          const f = `${OUT}/${tag}_${name}.png`;
          await pg.screenshot({ path: f, timeout: 900000 });
          console.log('shot', f, ((Date.now() - t0) / 1000).toFixed(1) + 's');
        }
      }
      console.log(logs.slice(0, 8).join('\n') || tag + ': no console errors');
      ok(tag + ': no console errors', logs.length === 0, logs.slice(0, 3));
      await pg.close();
    }
  } finally { await b.close(); }
  console.log(fails.length ? 'FAILS: ' + fails.join(' | ') : 'ALL PASS');
  process.exitCode = fails.length ? 1 : 0;
})();
