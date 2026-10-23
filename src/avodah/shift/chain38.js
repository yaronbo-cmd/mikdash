/* ── fable32 (build 38) ── chain38.js — E3, the chain bar (docs/specs/svivat-avoda-he.md §6; the owner, 23.10 10:39: "פס שרשרת כן"):
 * the morning's order as the engine has it (day33.js CHAIN38 / E.chain38()) — a small line under the top bar, RTL: the laver, the first
 * lot, its three roles, the second lot, the great gate, the Heichal's two, the blood's two, the close. His own links ringed in gold, the
 * done ones ticked, the morning's now lit; a link that waits for another (the slaughter for the gate, the blood for the five lamps) shows
 * its wait, and a kohen who waited for him signs (✋) when his link is done. When his link ends: "שלך הושלם · עכשיו: ‹הבא›" with its
 * source (or המחשה), in the bar's own place for a few seconds; the bar steps below an act's source line (end30's .r30) while it shows. Information only — no clock, nothing lost, no tap (it never takes a thumb from the stick or the act). Narrow
 * screens (≤ 700 px) and his acts: the links far from now drawn as dots. Never a Divine Name. ── /fable32 ── */
const CSS = `.c38{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 54px);transform:translateX(-50%);z-index:30;display:none;flex-direction:column;align-items:center;gap:3px;direction:rtl;pointer-events:none;font-family:"Heebo",system-ui,sans-serif;color:#FFF6DA;-webkit-user-select:none;user-select:none;max-width:calc(100vw - 24px)}
.c38.on{display:flex}
.c38 .row{display:flex;align-items:center;gap:0;padding:2px 8px;border-radius:12px;background:rgba(28,20,10,.62);border:1px solid rgba(226,182,90,.55);box-shadow:0 2px 8px rgba(0,0,0,.35)}
.c38 .l{position:relative;box-sizing:border-box;border:2px solid transparent;display:flex;align-items:center;justify-content:center;width:22px;height:22px;margin:0 2px;border-radius:50%;font-style:normal;font-size:12px;line-height:1;opacity:.82;transition:transform .25s,opacity .25s}
.c38 .l+.l::before{content:"";position:absolute;left:100%;top:50%;width:6px;height:2px;margin-top:-1px;background:rgba(226,182,90,.6)}
.c38 .l.par{margin:0 0}
.c38 .l.shared{background:rgba(120,150,200,.28)}.c38 .l.watch{background:rgba(255,255,255,.12)}
.c38 .l.his{border-color:#FFD66E;background:rgba(255,214,110,.22);opacity:1}
.c38 .l.done{opacity:.5}.c38 .l.done::after{content:"✓";position:absolute;right:-3px;bottom:-4px;font:900 10px/1 Heebo,system-ui,sans-serif;color:#9CE29C;text-shadow:0 1px 2px #000}
.c38 .l.his.done{opacity:.78}
.c38 .l.now{opacity:1;transform:scale(1.18);animation:c38n 1.4s ease-in-out infinite}
.c38 .l.wait:not(.done){filter:grayscale(.6)}
.c38 .l.sign::after{content:"✋";position:absolute;right:-6px;top:-12px;font-size:12px;animation:c38s .5s ease-in-out infinite alternate}
.c38 .l.dot{width:8px;height:8px;margin:0 3px;border-width:0;font-size:0;background:rgba(255,236,190,.55)}.c38 .l.dot.done{background:rgba(156,226,156,.6)}.c38 .l.dot::after{display:none}
.c38 .msg{display:none;max-width:calc(100vw - 32px);box-sizing:border-box;padding:2px 12px 3px;border-radius:12px;background:rgba(28,20,10,.82);border:1.5px solid #E2B65A;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.c38.msgon .row{display:none}
.c38 .msg.on{display:block;animation:c38m .3s ease-out}
.c38 .msg b{display:block;font:900 13px/1.25 Heebo,system-ui,sans-serif}.c38 .msg small{display:block;font:700 10px/1.2 Heebo,system-ui,sans-serif;opacity:.85;overflow:hidden;text-overflow:ellipsis}
.c38.act .row{opacity:.55}
@media (orientation:portrait){.c38{top:calc(env(safe-area-inset-top,0px) + 112px)}}
@keyframes c38n{0%,100%{box-shadow:0 0 0 0 rgba(255,214,110,0)}50%{box-shadow:0 0 0 3px rgba(255,214,110,.45)}}
@keyframes c38s{from{transform:translateY(0) rotate(-12deg)}to{transform:translateY(-2px) rotate(12deg)}}
@keyframes c38m{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
body.f35-closing .c38,body.ch33-on .c38{display:none!important}`;
/** the bar's element and its draw (focus17 calls draw(F.chain, acting) each frame) */
export function createChain38(doc) {
  if (!doc) return { draw() {}, dispose() {} };
  if (!doc.getElementById('c38-css')) {
    const css = doc.createElement('style');
    css.id = 'c38-css';
    css.textContent = CSS;
    doc.head.appendChild(css);
  }
  const el = doc.createElement('div');
  el.className = 'c38';
  el.setAttribute('aria-label', 'סדר הבוקר');
  el.innerHTML = '<div class="row"></div><div class="msg"><b></b><small></small></div>';
  doc.body.appendChild(el);
  const row = el.querySelector('.row'),
    msg = el.querySelector('.msg'),
    mb = msg.querySelector('b'),
    ms = msg.querySelector('small');
  let key = '',
    mkey = '';
  const PAR = /^(deshen|m22|lamb|menorah|inner|shochet|zorek)$/;
  function draw(c, acting) {
    const on = !!(c && c.links && c.links.length);
    el.classList.toggle('on', on);
    if (!on) return;
    const r30 = doc.querySelector('.r30.on:not(.sr):not(.sl)'),   // (the act's source line in the middle; at a side it leaves the bar be)
      low = r30 ? Math.round(r30.getBoundingClientRect().bottom + 4) : 0,
      topS = low > 40 ? `${low}px` : '';
    if (el.style.top !== topS) el.style.top = topS;
    const narrow = (doc.defaultView && doc.defaultView.innerWidth) <= 700 || !!acting,
      ni = c.links.findIndex((x) => x.now);
    el.classList.toggle('act', !!acting);
    const k = `${narrow ? 1 : 0}|` + c.links.map((x) => `${x.id}${x.his ? 'h' : ''}${x.done ? 'd' : ''}${x.now ? 'n' : ''}${x.wait ? 'w' : ''}${x.sign ? 's' : ''}`).join(',');
    if (k !== key) {
      key = k;
      row.innerHTML = c.links
        .map((x, i) => {
          const dot = narrow && !x.his && !x.now && !x.sign && Math.abs(i - (ni < 0 ? c.links.length - 1 : ni)) > 1;
          const cls = ['l', x.kind === 'shared' ? 'shared' : x.kind === 'watch' ? 'watch' : '', PAR.test(x.id) ? 'par' : '', x.his ? 'his' : '', x.done ? 'done' : '', x.now ? 'now' : '', x.wait ? 'wait' : '', x.sign ? 'sign' : '', dot ? 'dot' : ''].filter(Boolean).join(' ');
          return `<i class="${cls}" data-c38="${x.id}" title="${x.he}" aria-label="${x.he}">${dot ? '' : x.icon}</i>`;
        })
        .join('');
    }
    // the line in the bar's own place (the same small footprint, in an act too), below the act's source line while that shows (end30)
    const m = c.msg ? `${c.msg.text}|${c.msg.src}` : '';
    if (m !== mkey) {
      mkey = m;
      msg.classList.toggle('on', !!m);
      el.classList.toggle('msgon', !!m);
      if (m) {
        mb.textContent = c.msg.text;
        ms.textContent = c.msg.src;
      }
    }
  }
  return {
    el,
    draw,
    dispose() {
      el.remove();
    },
  };
}
