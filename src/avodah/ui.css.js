/* ui.css.js: the Phase B stylesheet (injected once by ui.js). The Phase A look (src/game/ui.css.js): the same
 * palette, fonts and shapes, as --av-* tokens with light/dark. Everything sits under .av. Phone first (390×844). */
import { BLOOD } from './works/blood.js';   // ── blooda25 ── (the sheet's blood and line: the palette's one source, DAM25 §4.2)
export const CSS = `
:root{
  --av-ink:#2A2016; --av-soft:#6B5A45; --av-faint:#776750; --av-gold-text:#855E14;
  --av-panel:rgba(251,246,236,.94); --av-solid:#FBF6EC; --av-raise:#FFFDF8; --av-line:rgba(120,92,52,.22);
  --av-gold:#A97A1E; --av-gold-hi:#E8B94A; --av-gold-ink:#3B2A08; --av-red:#A3261F; --av-ok:#276B43; --av-blue:#1F4F7A;
  --av-shadow:0 8px 26px rgba(40,28,12,.18); --av-scrim:rgba(24,18,10,.45); --av-bar:rgba(120,92,52,.16);
  --av-play:#EFE3C8; --av-play2:#E2D0AC; --av-live:#C0392B;
}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){
  --av-ink:#F3E9D6; --av-soft:#C2B195; --av-faint:#A39377; --av-gold-text:#E4B656;
  --av-panel:rgba(27,22,17,.94); --av-solid:#1D1813; --av-raise:#262019; --av-line:rgba(232,200,150,.18);
  --av-gold:#E4B656; --av-gold-hi:#F2CF77; --av-gold-ink:#1D1406; --av-red:#E0675F; --av-ok:#6CC592; --av-blue:#93BCEA;
  --av-shadow:0 8px 26px rgba(0,0,0,.45); --av-scrim:rgba(0,0,0,.58); --av-bar:rgba(232,200,150,.14);
  --av-play:#3A3024; --av-play2:#2A2219; --av-live:#FF6B5B;
}}
:root[data-theme="dark"]{
  --av-ink:#F3E9D6; --av-soft:#C2B195; --av-faint:#A39377; --av-gold-text:#E4B656;
  --av-panel:rgba(27,22,17,.94); --av-solid:#1D1813; --av-raise:#262019; --av-line:rgba(232,200,150,.18);
  --av-gold:#E4B656; --av-gold-hi:#F2CF77; --av-gold-ink:#1D1406; --av-red:#E0675F; --av-ok:#6CC592; --av-blue:#93BCEA;
  --av-shadow:0 8px 26px rgba(0,0,0,.45); --av-scrim:rgba(0,0,0,.58); --av-bar:rgba(232,200,150,.14);
  --av-play:#3A3024; --av-play2:#2A2219; --av-live:#FF6B5B;
}
body.av-on .top, body.av-on .dock, body.av-on #hint, body.av-on #mk{display:none!important}
.av{position:fixed;inset:0;z-index:30;pointer-events:none;direction:rtl;color:var(--av-ink);
  font-family:"Heebo",system-ui,-apple-system,"Segoe UI",Arial,sans-serif;-webkit-tap-highlight-color:transparent}
.av :where(button){font:inherit;color:inherit;margin:0;border:0;background:none;cursor:pointer}
.av :where(p,h1,h2,h3,ul,ol){margin:0}
.av .av-hidden{display:none!important}
.av-i{width:1.2em;height:1.2em;display:inline-block;vertical-align:-.25em;flex:0 0 auto}
.av-num{font-variant-numeric:tabular-nums;direction:ltr;unicode-bidi:isolate}
.av-draft{display:inline-block;font:700 10.5px/1.5 "Heebo",sans-serif;color:var(--av-blue);border:1px solid currentColor;border-radius:999px;padding:0 7px;letter-spacing:.3px;flex:0 0 auto;white-space:nowrap}

/* ── top bar ── */
.av-top{position:absolute;top:0;inset-inline:0;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 0;display:flex;gap:8px;align-items:center}
.av-rb{pointer-events:auto;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--av-panel);border:1px solid var(--av-line);box-shadow:var(--av-shadow);flex:0 0 auto}
.av-rb .av-i{width:22px;height:22px}
.av-status{pointer-events:auto;flex:1 1 auto;min-width:0;min-height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:6px 12px;border-radius:18px;background:var(--av-panel);border:1px solid var(--av-line);box-shadow:var(--av-shadow);text-align:center}
.av-status b{font:700 13.5px/1.2 "Heebo",sans-serif;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.av-status small{font:500 12px/1.2 "Heebo",sans-serif;color:var(--av-soft);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.av-livedot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--av-live);margin-inline-end:6px;vertical-align:1px;animation:av-pulse 1.4s ease-in-out infinite}
@keyframes av-pulse{0%,100%{opacity:1}50%{opacity:.35}}
.av-prog{position:absolute;top:calc(env(safe-area-inset-top,0px) + 64px);inset-inline:0;display:flex;justify-content:center;pointer-events:none}
.av-prog div{pointer-events:auto;display:flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:var(--av-panel);border:1px solid var(--av-line);box-shadow:var(--av-shadow);font:600 12.5px/1 "Heebo",sans-serif;max-width:94vw}
.av-prog i{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--av-bar);flex:0 0 auto}
.av-prog i.done{background:var(--av-gold)}
.av-prog i.cur{background:var(--av-gold-hi);box-shadow:0 0 0 3px rgba(232,185,74,.35)}
.av-prog .dots{display:flex;gap:4px;flex-wrap:nowrap}

/* ── the home panel: a bottom sheet on phones, a side panel on wide screens ── */
.av-home{position:absolute;inset-inline:0;bottom:0;max-height:66vh;display:flex;flex-direction:column;background:var(--av-solid);border-top:1px solid var(--av-line);border-radius:22px 22px 0 0;box-shadow:0 -10px 34px rgba(40,28,12,.22);pointer-events:auto;transform:translateY(105%);transition:transform .28s cubic-bezier(.2,.8,.2,1);padding-bottom:env(safe-area-inset-bottom,0px)}
.av-home.on{transform:none}
@media (min-width:760px){ .av-home{inset-inline:auto 16px;left:16px;right:auto;bottom:16px;top:84px;width:420px;max-height:none;border:1px solid var(--av-line);border-radius:20px} }
.av-tabs{display:flex;gap:4px;padding:10px 12px 0}
.av-tabs button{flex:1 1 0;min-height:44px;border-radius:12px;font:700 14px/1 "Heebo",sans-serif;color:var(--av-soft);border:1px solid transparent}
.av-tabs button[aria-pressed="true"]{background:var(--av-ink);color:var(--av-solid)}
.av-body{overflow-y:auto;padding:12px 14px 18px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
.av-head{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}
.av-head h2{font:900 22px/1.15 "Frank Ruhl Libre","Times New Roman",serif}
.av-head p{font:500 13px/1.4 "Heebo",sans-serif;color:var(--av-soft);margin-top:3px}
.av-grow{flex:1 1 auto;min-width:0}
.av-badge{display:inline-flex;align-items:center;gap:4px;font:700 11px/1 "Heebo",sans-serif;padding:5px 8px;border-radius:999px;background:var(--av-bar);color:var(--av-ink);white-space:nowrap}
.av-badge.live{background:#B3261E;color:#fff}   /* ── ui ── AA in light and dark (white on the dark theme's #FF6B5B was 2.8:1) */
.av-badge.real{background:linear-gradient(180deg,#F2CF77,#E0A83A);color:#2A1A04}
.av-badge.gold{background:rgba(232,185,74,.22);color:var(--av-gold-text)}
.av-box{margin-top:10px;padding:12px;border-radius:16px;background:var(--av-raise);border:1px solid var(--av-line)}
.av-box.live{border-color:var(--av-live);box-shadow:0 0 0 2px rgba(192,57,43,.12)}
.av-box.fest{border-color:var(--av-gold-hi);background:linear-gradient(180deg,rgba(242,207,119,.18),transparent 70%),var(--av-raise)}
.av-box h3{font:800 16px/1.25 "Heebo",sans-serif;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.av-box p{font:500 13.5px/1.5 "Heebo",sans-serif;margin-top:5px}
.av-box small{display:block;font:500 12px/1.4 "Heebo",sans-serif;color:var(--av-soft);margin-top:4px}
.av-sec{margin:16px 2px 6px;font:700 12px/1 "Heebo",sans-serif;letter-spacing:.5px;color:var(--av-soft)}
.av-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.av-tile{display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-height:64px;padding:10px 12px;border-radius:14px;background:var(--av-raise)!important;border:1px solid var(--av-line)!important;text-align:start}
.av-tile b{font:700 14px/1.2 "Heebo",sans-serif}
.av-tile small{font:500 11.5px/1.3 "Heebo",sans-serif;color:var(--av-soft)}
.av-tile.wide{grid-column:1/-1;background:linear-gradient(180deg,#F2CF77,#E0A83A)!important;border-color:#B7862A!important;color:#2A1A04}
.av-tile.wide small{color:#4A3408}
.av-tile.done b::after{content:" ✓";color:var(--av-ok)}
.av-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:46px;padding:10px 18px;border-radius:14px;background:var(--av-raise)!important;border:1px solid var(--av-line)!important;font:700 15px/1.1 "Heebo",sans-serif;white-space:nowrap;touch-action:none;user-select:none;-webkit-user-select:none}
.av-btn.gold{background:linear-gradient(180deg,#F2CF77,#E0A83A)!important;border-color:#B7862A!important;color:#2A1A04!important;box-shadow:0 3px 12px rgba(169,122,30,.35)}
.av-btn.ghost{background:transparent!important}
.av-btn.big{min-height:56px;font-size:20px;padding:12px 28px}
.av-btn[disabled]{opacity:.5;cursor:default}
.av-btn.hold:active{transform:scale(.97)}
.av-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--av-line)}
.av-row:last-child{border-bottom:0}
.av-row small{display:block;color:var(--av-soft);font-size:12px;margin-top:2px}
.av-row .n{font:700 12px/1 "Heebo",sans-serif;color:var(--av-faint);width:22px;text-align:center;flex:0 0 auto}
.av-row.on .n{color:var(--av-gold-text)}
.av-row.off b{color:var(--av-soft);font-weight:600}   /* ── ui ── (QA P2-3) soft ink, not a half-transparent row */
.av-row button{flex:1 1 auto;text-align:start;display:flex;flex-direction:column;justify-content:center;min-height:44px}
.av-bar{height:10px;border-radius:6px;background:var(--av-bar);overflow:hidden;margin-top:8px}
.av-bar i{display:block;height:100%;background:linear-gradient(90deg,#E0A83A,#F2CF77)}
.av-ladder{display:flex;flex-direction:column;gap:6px;margin-top:6px}
.av-ladder div{display:flex;gap:8px;align-items:center;padding:8px 10px;border-radius:12px;background:var(--av-raise);border:1px solid var(--av-line);font:500 13px/1.35 "Heebo",sans-serif}
.av-ladder div.met{border-color:var(--av-gold-hi)}
.av-ladder div.lock{color:var(--av-soft);background:transparent;border-style:dashed}
.av-ladder div.lock b{color:var(--av-soft)}
.av-ladder b{font:800 13px/1 "Heebo",sans-serif;color:var(--av-gold-text);width:20px;text-align:center;flex:0 0 auto}
.av-roles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.av-roles span{padding:8px 6px;border-radius:10px;background:var(--av-raise);border:1px solid var(--av-line);font:600 12px/1.25 "Heebo",sans-serif;text-align:center}
.av-roles span.got{border-color:var(--av-gold-hi);background:rgba(232,185,74,.18)}

/* ── modal cards ── */
.av-modal{position:absolute;inset:0;display:grid;place-items:center;padding:14px;background:var(--av-scrim);pointer-events:auto;opacity:0;transition:opacity .22s}
.av-modal.on{opacity:1}
.av-card{width:min(100%,460px);max-height:calc(100vh - 28px);overflow-y:auto;background:var(--av-solid);border:1px solid var(--av-line);border-radius:20px;box-shadow:var(--av-shadow);padding:16px 16px 14px;transform:translateY(12px);transition:transform .24s cubic-bezier(.2,.8,.2,1)}
.av-modal.on .av-card{transform:none}
.av-kick{font:700 11.5px/1 "Heebo",sans-serif;letter-spacing:.5px;color:var(--av-gold-text)}
.av-card h2{font:900 24px/1.15 "Frank Ruhl Libre","Times New Roman",serif;margin:6px 0 8px;text-wrap:balance}
.av-card p{font:500 15px/1.6 "Heebo",sans-serif}
.av-card .av-q{font:500 17px/1.8 "Frank Ruhl Libre","Times New Roman",serif;margin-top:8px;padding-inline-start:10px;border-inline-start:3px solid var(--av-gold-hi)}
.av-ref{display:block;margin-top:6px;font:700 12.5px/1.3 "Heebo",sans-serif;color:var(--av-blue)}
.av-ref::before{content:"מקור · ";font-weight:500;opacity:.8}
.av-note{margin-top:8px;padding:8px 10px;border-radius:12px;background:var(--av-bar);font:500 12.5px/1.5 "Heebo",sans-serif;color:var(--av-soft)}
.av-cite{margin:8px 0 0;padding:8px 10px;border-radius:12px;background:var(--av-bar);font:500 13px/1.5 "Heebo",sans-serif;color:var(--av-ink)}
.av-cite .av-ref{margin-inline-start:4px}
.av-draft.av-check{background:rgba(120,80,190,.14);color:#4E2F7A;border-color:rgba(120,80,190,.35)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .av-draft.av-check{background:rgba(170,140,230,.22);color:#DCCBF7}}
:root[data-theme="dark"] .av-draft.av-check{background:rgba(170,140,230,.22);color:#DCCBF7}
.av-card details{margin-top:12px;border-top:1px solid var(--av-line);padding-top:8px}
.av-card summary{cursor:pointer;font:700 13px/1.4 "Heebo",sans-serif;color:var(--av-soft)}
.av-sub{margin-top:10px}
.av-sub h4{font:800 14.5px/1.3 "Heebo",sans-serif;margin:0;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.av-gain{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.av-gain span{display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border-radius:999px;background:var(--av-bar);font:700 12.5px/1 "Heebo",sans-serif}
.av-gain span.live{background:var(--av-live);color:#fff}
.av-gain span.real{background:linear-gradient(180deg,#F2CF77,#E0A83A);color:#2A1A04}
.av-card .av-go{width:100%;margin-top:14px}
.av-input{width:100%;box-sizing:border-box;margin-top:8px;min-height:46px;padding:11px 12px;border-radius:12px;border:1px solid var(--av-line);background:var(--av-raise);color:var(--av-ink);font:500 16px/1.2 "Heebo",sans-serif}
.av-mishmarot{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;max-height:32vh;overflow-y:auto;padding:3px 0}
.av-mishmarot button{position:relative;min-width:44px;min-height:40px;padding:8px 11px;border-radius:999px;border:1px solid var(--av-line)!important;font:600 14px/1 "Frank Ruhl Libre",serif;background:var(--av-raise)!important}
.av-mishmarot button[aria-pressed="true"]{background:var(--av-ink)!important;color:var(--av-solid)!important}
.av-mishmarot button::after{content:"";position:absolute;inset:-3px 0}   /* ── ui ── a 44 px hit area */
.av-toast{position:absolute;top:calc(env(safe-area-inset-top,0px) + 108px);inset-inline:0;margin:0 auto;width:max-content;max-width:92vw;padding:9px 14px;border-radius:14px;background:var(--av-solid);border:1px solid var(--av-gold-hi);box-shadow:var(--av-shadow);font:700 13.5px/1.4 "Heebo",sans-serif;pointer-events:none;opacity:0;transform:translateY(-6px);transition:opacity .2s,transform .2s}
.av-toast.on{opacity:1;transform:none}

/* ── mini-games ── */
.av-mg{position:absolute;inset:0;display:grid;place-items:center;padding:10px;background:radial-gradient(120% 90% at 50% 40%,rgba(10,8,5,.16),rgba(10,8,5,.6));pointer-events:auto;opacity:0;transition:opacity .22s}
.av-mg.on{opacity:1}
.av-mg-card{position:relative;width:min(100%,440px);max-height:calc(100vh - 20px);overflow-y:auto;background:var(--av-solid);border:1px solid var(--av-gold-hi);border-radius:20px;box-shadow:var(--av-shadow);padding:12px 12px 10px}
.av-mg-top{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px}
.av-mg-t{font:900 19px/1.15 "Frank Ruhl Libre",serif;flex:1 1 100%;order:2}
.av-mg-top .av-kick{order:1}
.av-mg-intro{font:500 13px/1.45 "Heebo",sans-serif;color:var(--av-soft);margin-bottom:8px}
.av-mine{color:var(--av-gold-text)}
.av-play{position:relative;border-radius:14px;background:linear-gradient(180deg,var(--av-play),var(--av-play2));overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
.av-play.shake{animation:av-shake .32s}
.av-play.quake{animation:av-quake .6s}
@keyframes av-shake{20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}
@keyframes av-quake{10%{transform:translate(-8px,3px)}25%{transform:translate(7px,-4px)}40%{transform:translate(-6px,4px)}60%{transform:translate(4px,-2px)}80%{transform:translate(-2px,1px)}}
.av-svg{display:block;width:100%;height:auto;max-height:46vh;direction:ltr}
.av-ctl{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px;position:relative}   /* (QA P1-6) the pour meter anchors here, not over the header's badges */
.av-ctl:empty{display:none}
.av-hint{min-height:2.8em;margin-top:8px;text-align:center;font:600 14px/1.4 "Heebo",sans-serif}
/* phones, portrait: the panels dock at the bottom so the world (the camera shifts up to match, main.js) stays in view */
@media (max-width:759px) and (orientation:portrait){
  .av-mg{place-items:end center;padding:8px 8px calc(8px + env(safe-area-inset-bottom,0px));background:linear-gradient(to top,rgba(10,8,5,.42),rgba(10,8,5,0) 62%)}
  .av-mg-card{max-height:60vh}
  .av-svg{max-height:27vh}
  .av-mg-intro{font-size:12.5px;line-height:1.4;margin-bottom:6px}
  .av-modal{place-items:end center;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px));background:linear-gradient(to top,rgba(10,8,5,.45),rgba(10,8,5,0) 60%)}
  .av-card{max-height:64vh}
}
.av-hint.ok{color:var(--av-ok)}
.av-hint.miss{color:var(--av-red)}
.av-skip{position:absolute;top:2px;inset-inline-end:4px;display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;padding:0 10px;font:600 13px/1 "Heebo",sans-serif;color:var(--av-soft);text-decoration:underline}   /* ── ui ── 44 × 44 (was 36 × 29) */
.av-mg-top{padding-inline-end:40px}
.av-float{position:absolute;transform:translate(-50%,-50%);font:900 22px/1 "Heebo",sans-serif;color:var(--av-gold-text);pointer-events:none;animation:av-up 1.1s ease-out forwards}
.av-float.ok{color:var(--av-ok)}
@keyframes av-up{to{transform:translate(-50%,-160%);opacity:0}}
.av-spark{position:absolute;width:6px;height:6px;margin:-3px;border-radius:50%;background:#FFD66E;box-shadow:0 0 8px 2px rgba(255,200,80,.8);pointer-events:none;animation:av-spark .8s ease-out forwards}
@keyframes av-spark{to{transform:translate(var(--dx),var(--dy));opacity:0}}
.av-meter{position:absolute;top:8px;inset-inline-start:10px;width:130px;height:18px;border-radius:9px;background:#3B2E1E;overflow:hidden}
.av-meter i{display:block;height:100%;width:0;background:linear-gradient(90deg,#1F5F8F,#2F7FB8)}
.av-meter span{position:absolute;inset:0;text-align:center;font:700 11.5px/18px "Heebo",sans-serif;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.6)}   /* white on a dark track and a deep-blue fill: ≥ 5:1 (UI-S5) */
.av-tray{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;padding:8px}
.av-chip{min-height:44px;padding:8px 12px;border-radius:12px;background:var(--av-raise)!important;border:1px solid var(--av-line)!important;font:700 13.5px/1.1 "Heebo",sans-serif}
.av-chip.mine{border-color:var(--av-gold-hi)!important;box-shadow:0 0 0 2px rgba(232,185,74,.35)}
.av-chip small{font-size:10.5px;color:var(--av-gold-text)}
.av-chip.set{opacity:.35}
.av-quiz{padding:10px}
.av-quiz .av-q{font:800 16px/1.35 "Heebo",sans-serif;text-align:center}
.av-opts{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.av-opt{min-height:46px;padding:10px 12px;border-radius:12px;background:var(--av-raise)!important;border:1px solid var(--av-line)!important;font:600 14.5px/1.25 "Heebo",sans-serif}
.av-opt.ok{border-color:var(--av-ok)!important;color:var(--av-ok)}
.av-opt[disabled]{opacity:.45;text-decoration:line-through}
.av-opt.num{font-size:20px}
.av-incense{position:absolute;inset:0;pointer-events:none;background:radial-gradient(80% 70% at 50% 40%,rgba(255,250,235,.85),rgba(255,245,220,.35) 60%,transparent);animation:av-cloud 2.4s ease-out forwards}
@keyframes av-cloud{from{opacity:0}to{opacity:1}}

/* SVG pieces of the mini-games */
.av-svg text{font-family:"Heebo",sans-serif;direction:rtl;unicode-bidi:embed}
/* the pictures are drawn in x-right coordinates (direction:ltr on the svg); each Hebrew text runs RTL, so the anchors
   are mirrored here: no anchor = the text starts at x and runs right; "end" = it ends at x */
.av-svg text:not([text-anchor]){text-anchor:end}
.av-svg text[text-anchor="end"]{text-anchor:start}
.av-lab{font-size:11.5px;font-weight:600;fill:#6B5234}
.av-lab.big{font-size:14px;font-weight:800}
.av-lab.small{font-size:9.5px}
.av-lab.light{fill:#F6E7C8}
.av-say{font:900 26px "Frank Ruhl Libre",serif;fill:#3B2A08}
.av-say.small{font-size:16px}
.av-hall .av-say,.av-veil+.av-say{fill:#FFF3D6}
.av-floor{fill:#E4D2AE;stroke:#C4AC82}
.av-robe{fill:#FBF8F1;stroke:#9C8A6A;stroke-width:1}
.av-belt{fill:#8E3B6E}
.av-face{fill:#D9A77C;stroke:#9C7452;stroke-width:.8}
.av-turban{fill:#FFFFFF;stroke:#B8A98C;stroke-width:.8}
.av-kohen.hl .av-robe{stroke:#E0A83A;stroke-width:2.2}
.av-kohen.won .av-robe{fill:#FFF1C4;stroke:#E0A83A;stroke-width:2.6}
.av-kohen.aside{opacity:.35}
.av-fing{font:800 10px "Heebo",sans-serif;fill:#8A6A3A}
.av-count{font:900 22px "Heebo",sans-serif;fill:#A97A1E}
.av-roletag{font:800 14px "Heebo",sans-serif;fill:#3B2A08}
.av-pick{fill:none;stroke:#E8B94A;stroke-width:3;transition:r .15s}
.av-pick.landed{stroke:#2E7D4F;stroke-width:4}
.av-azara{fill:#E8DABF;stroke:#B39A6E;stroke-width:2}
.av-torch{fill:#FFC04A;filter:drop-shadow(0 0 6px #FFB02E)}
.av-bronze{fill:#B07A45;stroke:#6E4A26;stroke-width:1.2}
.av-spigot rect{fill:#8A5E33}
.av-spigot.busy rect:first-child{fill:#5A4230}
.av-spigot{cursor:pointer}
.av-hit{fill:transparent;cursor:pointer}
.av-water{fill:#9DD0F0}
.av-night{fill:#0E1222;opacity:.78;pointer-events:none}
.av-stone{fill:#D8C6A0;stroke:#A8916A;stroke-width:1.2}
.av-glow{fill:#FFB347;opacity:.5;filter:blur(18px)}
.av-flame{fill:#FFB02E;stroke:#FF7A1A;stroke-width:1}
.av-flame.big{fill:rgba(255,160,40,.9)}
.av-altartop{fill:#D5C3A0;stroke:#9C8358;stroke-width:1.5}
.av-log{fill:#7A5A36;stroke:#4A3620;stroke-width:.8}
.av-heap{cursor:pointer;transition:transform .35s}
.av-heap.moved.right{transform:translateX(-60px)}
.av-heap.moved.left{transform:translateX(60px)}
.av-ember{fill:#E8591F;stroke:#FFB36B;stroke-width:1.5;filter:drop-shadow(0 0 5px #FF7A1A);cursor:pointer}
.av-ember.hidden{opacity:.15;pointer-events:none}
.av-ember.taken{opacity:0;pointer-events:none;transition:opacity .3s}
.av-spot{fill:rgba(255,214,110,.18);stroke:#E8B94A;stroke-width:2.2;stroke-dasharray:5 4;cursor:pointer;animation:av-blink 1.2s ease-in-out infinite}
.av-spot.seen{animation:none;stroke:#2E7D4F;stroke-dasharray:none}
.av-spot.set{fill:rgba(46,125,79,.25);stroke:#2E7D4F;animation:none}
@keyframes av-blink{50%{stroke-opacity:.35}}
.av-bark{stroke:#3E2A18;stroke-width:1.2}
.av-ring{fill:#E9D2A8;stroke:#7A5A36}
.av-leaf{stroke:#2F4A22;stroke-width:1}
.av-leaf.fig,.av-leaf.nut{fill:#4F7F4B}.av-leaf.pine{fill:#3F6B4A}.av-leaf.olive{fill:#8C9A6A}.av-leaf.vine{fill:#6E8F3A}
.av-choice{cursor:pointer}
.av-choice.taken{opacity:.3}
.av-star{fill:#fff}
.av-hill{fill:#5B4A3A}
.av-hill.far{fill:#7A6A5A}
.av-hebron{fill:#FFD98A;filter:blur(3px)}
.av-roof{fill:#8A7350}
.av-chamber{fill:#E3D3B1;stroke:#A8916A;stroke-width:2}
.av-wool{fill:#F4EFE4;stroke:#B9AE98;stroke-width:1.4}
.av-wool.head{fill:#EFE8DA}
.av-lambmini{cursor:pointer}
.av-leg{fill:#E6DCC8;stroke:#B9AE98}
.av-ear{fill:#EBDDCB;stroke:#B9AE98;stroke-width:1.4}
.av-eye{fill:#2A2016}
.av-nostril{fill:#5A4636}
.av-lip{fill:none;stroke:#8A6A5A;stroke-width:2}
.av-torchlight{fill:rgba(255,220,150,.28);filter:blur(10px);pointer-events:none}
.av-find{font:800 11px "Heebo",sans-serif;fill:#F6E7C8;paint-order:stroke;stroke:#2A2016;stroke-width:3px}
.av-find.hot{fill:#FFB4A8}
.av-flaw{fill:none;stroke:#7A2A1A;stroke-width:2.2}
.av-flaw.soft{stroke:#B98E6A;stroke-width:1.4}
.av-gold{fill:#E6B84A;stroke:#A7791C;stroke-width:1.2}
.av-silver{fill:#D9DCE1;stroke:#858C96;stroke-width:1.2}
.av-cup{cursor:pointer;transition:transform .5s}
.av-hall{fill:#2A2016}
.av-door{fill:#C9A14A;stroke:#7A5A20;stroke-width:2}
.av-ash{fill:#8C857A;stroke:#5E574C;cursor:pointer}
.av-ash.taken{opacity:0;transition:opacity .3s;pointer-events:none}
.av-arm{fill:none;stroke:#E6B84A;stroke-width:5}
.av-lamp{cursor:pointer}
.av-lamp .av-flame{opacity:0;transition:opacity .3s}
.av-lamp.lit .av-flame{opacity:1}
.av-lamp.fresh .av-gold{fill:#FFE39A}
.av-stone3{cursor:pointer}
.av-stone3.on .av-stone{fill:#F0DFB8}
.av-court{fill:#E6D7B8}
.av-court.dusk{fill:#E9C9A0}
.av-ringmark{fill:none;stroke:#555;stroke-width:3}
.av-ringmark.set{stroke:#2E7D4F;stroke-width:4}
.av-veil{fill:#1C160F}
.av-zone{fill:rgba(46,125,79,.25);stroke:#2E7D4F;stroke-dasharray:4 3}
.av-blood{fill:${BLOOD.wet}}
.av-corner rect:first-child{fill:#C7B28A;stroke:#7A6440;stroke-width:1.5}
.av-corner.sel rect:first-child{fill:#F2CF77}
.av-corner.done rect:first-child{fill:#9FC7A8}
.av-altarside{fill:#E1D2B2;stroke:#9C8358}
.av-redline{fill:${BLOOD.line}}
.av-bloodmark{fill:${BLOOD.mark};opacity:.8}
.av-base{fill:#BFA67C;stroke:#7A6440;cursor:pointer}
.av-base.set{fill:#9FC7A8}
.av-slot{fill:#F2E7D0;stroke:#B39A6E}
.av-dot{fill:#A97A1E}
.av-dot.mine{fill:#E0675F}
.av-rampzone{fill:#D8C6A0;stroke:#9C8358;stroke-width:1.2;cursor:pointer}
.av-rampzone.set{fill:#9FC7A8}
.av-mid{stroke:#7A6440;stroke-dasharray:5 4;stroke-width:1.5}
.av-limb{fill:#C98A7A;stroke:#8A5A4A}
.av-salt{fill:#fff}
.av-ulam{fill:#E8DDC8;stroke:#A8916A}
.av-person{fill:#8E7456;transition:transform .5s}
.av-crowd.bow .av-person,.away .av-person{transform:translateY(8px) scaleY(.7)}
.away{opacity:.5;transition:opacity .8s}
.av-puff{fill:rgba(255,250,238,.7);filter:blur(4px)}
.av-step{fill:#E3D5B7;stroke:#B9A57F}
.av-headline{stroke:rgba(169,122,30,.35);stroke-dasharray:6 5;stroke-width:1.5}
.av-headline.on{stroke:#2E7D4F}
.av-arms{fill:none;stroke:#D9A77C;stroke-width:3.5;stroke-linecap:round}
.av-arms.hl{stroke:#E0A83A}
.av-horn{fill:#C7B28A;stroke:#7A6440}
.av-flag{fill:#F4F0E6;stroke:#8A7350;stroke-width:1.2}
.av-flag.wave{animation:av-wave .5s ease-in-out 3}
@keyframes av-wave{50%{transform:skewY(-10deg)}}
.av-lane{fill:rgba(0,0,0,.08);stroke:#B39A6E}
.av-hitline{fill:#A97A1E}
.av-note{fill:#1F4F7A}
.av-note.hit{fill:#2E7D4F;opacity:0;transition:opacity .25s}
.av-note.late{opacity:.2}
.av-levite{fill:#6E8FB5}
.av-cloak{fill:#9C7A52;stroke:#6E5436}
.av-hide{fill:#8A5A3A}
.av-sky{fill:#CFE0EE}
.av-arc{fill:none;stroke:rgba(169,122,30,.4);stroke-dasharray:4 5;stroke-width:2}
.av-tick{fill:#8A7350}
.av-mark{fill:none;stroke:#2E7D4F;stroke-width:2.5}
.av-sun{fill:#FFC53D;filter:drop-shadow(0 0 6px #FFB02E)}
.av-taper{fill:#555}
.av-taper.on{fill:#FFB02E;filter:drop-shadow(0 0 6px #FF7A1A)}
.av-i{color:inherit}
.av-willow{fill:none;stroke:#6E8F3A;stroke-width:3;stroke-linecap:round}
.av-house{fill:#1E1A22}
.lit1 .av-house{fill:#3A2E22}.lit2 .av-house{fill:#5A4630}.lit3 .av-house{fill:#7A5E3A}.lit4 .av-house{fill:#A07A46}
.av-menorah50{cursor:pointer}
.av-menorah50 .av-fl{opacity:0;transition:opacity .4s}
.av-menorah50.on .av-fl{opacity:1}
.av-ladder{stroke:#8A7350;stroke-width:2}
.av-torchfly{cursor:pointer}
.av-bread{fill:#E8C98A;stroke:#A07A3A}
.av-bread.old{fill:#C9A56A}
.av-say.light{fill:#FFF3D6}
/* ── hooks ── (HOOKS agent: the day panel, the ritual button, "בפועל" dots, tiers, the Sukkot strip, vessels, the brief card) */
.av-prog i.mine{box-shadow:0 0 0 2px var(--av-gold-hi)}
.av-prog i.mine.cur{box-shadow:0 0 0 3px var(--av-gold-hi),0 0 0 5px rgba(232,185,74,.35)}
.hk-today{display:flex;flex-direction:column;gap:6px}
.hk-pips{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.hk-pip{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 4px;border-radius:12px;background:var(--av-bar);text-align:center;min-width:0}
.hk-pip i{width:14px;height:14px;border-radius:50%;border:2px solid var(--av-faint)}
.hk-pip.on i{background:var(--av-gold);border-color:var(--av-gold)}
.hk-pip b{font:700 12.5px/1.2 "Heebo",sans-serif}
.hk-pip small{font:500 11px/1.25 "Heebo",sans-serif;color:var(--av-soft);overflow:hidden;text-overflow:ellipsis;max-width:100%}
.hk-line{display:block;font:500 12.5px/1.45 "Heebo",sans-serif;color:var(--av-ink)}
.hk-soft{color:var(--av-soft)}
.hk-mine{width:100%;display:flex;flex-direction:column;align-items:center;gap:2px}
.hk-mine small{font:500 11.5px/1.3 "Heebo",sans-serif;opacity:.85}
.hk-tag{font-style:normal;font:700 10.5px/1 "Heebo",sans-serif;padding:3px 7px;border-radius:999px;background:var(--av-bar);color:var(--av-soft)}
.hk-t2{background:rgba(46,125,79,.16);color:var(--av-ok)}.hk-t3{background:rgba(31,79,122,.16);color:var(--av-blue)}.hk-t4{background:rgba(232,185,74,.3);color:var(--av-gold-ink)}
.hk-pa small{font:500 12.5px/1.45 "Heebo",sans-serif}
.hk-fest{display:flex;flex-direction:column;gap:5px;margin-top:8px}
.hk-fest small{display:block;font:500 12px/1.45 "Heebo",sans-serif}
.hk-bulls{display:flex;gap:4px;direction:rtl}
.hk-bulls span{flex:1;text-align:center;padding:5px 0;border-radius:8px;background:var(--av-bar);font:700 13px/1 "Heebo",sans-serif;color:var(--av-soft)}
.hk-bulls span.past{background:rgba(169,122,30,.22);color:var(--av-ink)}
.hk-bulls span.now{background:var(--av-gold-hi);color:var(--av-gold-ink);box-shadow:0 0 0 2px var(--av-gold)}
.hk-tiers,.hk-vessels{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.hk-tiers span{display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:10px;background:var(--av-raise);border:1px solid var(--av-line);font:500 12px/1.2 "Heebo",sans-serif}
.hk-tiers i{font-style:normal;font:700 11px/1 "Heebo",sans-serif;padding:3px 6px;border-radius:999px;background:var(--av-bar)}
.hk-vessels span{padding:5px 8px;border-radius:10px;background:var(--av-bar);color:var(--av-faint);font:600 12px/1.2 "Heebo",sans-serif}
.hk-vessels span.got{background:var(--av-raise);border:1px solid var(--av-gold);color:var(--av-ink)}
.hk-brief{margin-top:8px;font:500 14px/1.45 "Heebo",sans-serif}
.hk-src{margin-top:6px}
.hk-auto{height:3px;margin-top:10px;border-radius:2px;background:var(--av-bar);overflow:hidden}
.hk-auto i{display:block;height:100%;width:100%;background:var(--av-gold);transform-origin:right;animation:hk-auto linear forwards}
@keyframes hk-auto{from{transform:scaleX(1)}to{transform:scaleX(0)}}
/* ── end hooks ── */
@media (prefers-reduced-motion: reduce){ .av *,.av *::before,.av *::after{animation:none!important;transition:none!important} }
@media (max-width:370px){ .av-grid{grid-template-columns:1fr} .av-btn{padding:9px 13px;font-size:14px} }
`;
