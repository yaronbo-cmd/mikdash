<title>בית המקדש</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Secular+One&family=Heebo:wght@400;600;800&family=Noto+Serif+Hebrew:wght@400;700;900&display=swap">
<style>
:root{
  --sky1:#5FB4E0;--sky2:#C9E8F6;
  --card:#FFF9EA;--card2:#FBF0D3;--line:#E2CFA0;--line2:#CBB27A;
  --ink:#5B4426;--ink2:#8B7350;--ink3:#B49A6A;
  --gold:#E8B33C;--goldD:#C08E1E;--goldL:#F8D75E;
  --green:#54B84E;--greenD:#37943B;
  --red:#D9534F;--blue:#3E6FA8;
  color-scheme:light;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{height:100%}
body{background:linear-gradient(180deg,var(--sky1) 0%,var(--sky2) 46%,#EFE3C2 100%) fixed;
  color:var(--ink);font-family:'Heebo',system-ui,sans-serif;direction:rtl;overflow-x:hidden}
.wrap{position:relative;max-width:560px;margin:0 auto;min-height:100dvh}
.scr{display:none;flex-direction:column;min-height:100dvh}
.scr.on{display:flex}
h1,h2,h3,.disp{font-family:'Secular One','Heebo',sans-serif;font-weight:400}

.gbtn{font-family:'Secular One','Heebo',sans-serif;font-size:17px;color:#fff;border:none;cursor:pointer;
  background:linear-gradient(180deg,#6BC94F,var(--green) 45%,var(--greenD));
  padding:13px 26px;border-radius:16px;letter-spacing:.5px;
  box-shadow:0 4px 0 #26702B,0 7px 14px rgba(40,80,30,.3);transition:transform .1s,box-shadow .1s;
  text-shadow:0 1px 2px rgba(0,0,0,.25)}
.gbtn:active{transform:translateY(3px);box-shadow:0 1px 0 #26702B}
.gbtn:disabled{filter:grayscale(.7);opacity:.6;cursor:default;transform:none}
.gbtn.gold{background:linear-gradient(180deg,#FFDF6B,var(--gold) 50%,var(--goldD));box-shadow:0 4px 0 #96690F,0 7px 14px rgba(120,80,10,.3)}
.gbtn.gold:active{box-shadow:0 1px 0 #96690F}
.gbtn.ghost{background:var(--card);color:var(--ink2);box-shadow:0 3px 0 var(--line2);font-size:14px;text-shadow:none}
.gbtn:focus-visible,.nb:focus-visible{outline:3px solid #fff;outline-offset:2px}

#s0{align-items:center;justify-content:center;text-align:center;gap:14px;padding:34px 20px}
.logo{width:min(180px,46vw)}
.logo svg{width:100%;filter:drop-shadow(0 10px 18px rgba(90,60,10,.35));animation:flt 4.2s ease-in-out infinite}
@keyframes flt{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
.t-big{font-family:'Secular One',sans-serif;font-size:clamp(38px,11vw,62px);color:#fff;line-height:1.05;
  text-shadow:0 3px 0 var(--goldD),0 7px 16px rgba(90,60,10,.4)}
.t-sub{font-family:'Noto Serif Hebrew',serif;font-size:13px;color:#fff;opacity:.95;text-shadow:0 1px 3px rgba(60,40,10,.45);line-height:1.8;font-style:italic}
.wb{display:none;background:var(--card);border:2px solid var(--line);border-radius:16px;padding:13px 16px;max-width:330px;width:92%;box-shadow:0 6px 16px rgba(90,60,10,.2)}
.wb.on{display:block;animation:pop .45s cubic-bezier(.34,1.56,.64,1)}
@keyframes pop{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}
.wb h3{font-size:17px;color:var(--ink)}
.wb p{font-size:12px;color:var(--ink2);margin-top:2px}
.chips{display:flex;gap:6px;margin-top:9px;flex-wrap:wrap;justify-content:center}
.chip{background:var(--card2);border:1.5px solid var(--line2);border-radius:12px;padding:3px 11px;font-size:13px;color:var(--ink);font-weight:800}
.credit{font-size:10.5px;color:#fff;opacity:.85;text-shadow:0 1px 2px rgba(60,40,10,.4);line-height:1.8}

.hud{position:sticky;top:env(safe-area-inset-top,0px);z-index:30;padding:8px 10px 6px;display:flex;flex-direction:column;gap:6px}
.rrow{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
.rrow::-webkit-scrollbar{display:none}
.rc{display:flex;align-items:center;gap:4px;background:var(--card);border:2px solid var(--line);
  border-radius:20px;padding:3px 10px 3px 12px;font-size:12px;white-space:nowrap;
  box-shadow:0 2px 0 var(--line2);transition:transform .2s}
.rc b{font-weight:800;color:var(--ink);font-variant-numeric:tabular-nums}
.rc.flash{transform:scale(1.12)}
.hudrow{display:flex;gap:6px;align-items:center}
.progchip{display:flex;align-items:center;gap:7px;background:var(--card);border:2px solid var(--line);
  border-radius:20px;padding:4px 12px;box-shadow:0 2px 0 var(--line2);flex:1}
.progchip .star{font-size:14px}
.pbar{flex:1;height:9px;background:#E9DCB8;border-radius:5px;overflow:hidden;border:1px solid var(--line2)}
.pfill{height:100%;background:linear-gradient(90deg,var(--gold),var(--goldL));border-radius:5px;transition:width .8s ease}
.progchip b{font-size:12px;font-weight:800;font-variant-numeric:tabular-nums}
.hbtn{background:var(--card);border:2px solid var(--line);border-radius:14px;padding:4px 11px;font-size:15px;cursor:pointer;box-shadow:0 2px 0 var(--line2)}

.nav{position:fixed;bottom:0;left:0;right:0;z-index:40;display:flex;justify-content:center;gap:8px;
  padding:8px 12px calc(10px + env(safe-area-inset-bottom,0px));pointer-events:none}
.nb{pointer-events:auto;font-family:'Secular One',sans-serif;font-size:13px;cursor:pointer;position:relative;
  background:var(--card);color:var(--ink2);border:2px solid var(--line);border-radius:18px;
  padding:10px 13px;box-shadow:0 3px 0 var(--line2),0 6px 14px rgba(90,60,10,.22);transition:all .15s}
.nbadge{position:absolute;top:-5px;left:-5px;width:14px;height:14px;border-radius:50%;
  background:var(--red);border:2px solid #fff;animation:fpp 1.2s ease-in-out infinite}
.expc.ret{border-color:var(--goldD);box-shadow:0 3px 0 var(--goldD),0 0 18px rgba(232,179,60,.45);animation:fpp 1.6s ease-in-out infinite}
.exph{display:flex;align-items:center;gap:10px}
.exph .i{font-size:28px}
.exph .n{font-family:'Secular One',sans-serif;font-size:16px;color:var(--ink)}
.exph .d{font-size:10.5px;color:var(--ink3);font-weight:800}
.expfact{font-size:11px;color:var(--ink2);margin-top:4px;line-height:1.6}
.nb.on{background:linear-gradient(180deg,#FFDF6B,var(--gold));color:#5B3E06;border-color:var(--goldD);box-shadow:0 3px 0 #96690F,0 6px 14px rgba(120,80,10,.3)}
.nb:active{transform:translateY(2px)}
.pane{display:none;flex:1;padding-bottom:86px}
.pane.on{display:block}

.worldwrap{position:relative;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;
  scrollbar-width:none;direction:ltr;touch-action:pan-x;user-select:none;-webkit-user-select:none}
.worldwrap::-webkit-scrollbar{display:none}
#world{width:760px;display:block;margin:0 auto}
.mp{cursor:pointer}
.fp-locked{fill:rgba(110,85,40,.10);stroke:#B49A6A;stroke-width:1.2;stroke-dasharray:5 4}
.fp-avail{fill:rgba(232,179,60,.32);stroke:var(--goldD);stroke-width:2;animation:fpp 1.3s ease-in-out infinite}
@keyframes fpp{0%,100%{opacity:1}50%{opacity:.45}}
#pin{animation:bob 1s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
.popin{animation:bpop .5s cubic-bezier(.34,1.7,.64,1)}
@keyframes bpop{0%{opacity:.3}60%{opacity:1}100%{opacity:1}}
.thump{animation:thmp .16s ease-out}
@keyframes thmp{50%{transform:translateY(1.5px)}}
#world.shake{animation:wshake .13s}
@keyframes wshake{25%{transform:translate(1.5px,1px)}75%{transform:translate(-1.5px,-1px)}}
.boulder-hot{cursor:pointer;animation:fpp 1.6s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}

.goal{margin:6px 12px 10px;background:var(--card);border:2px solid var(--line);border-radius:18px;
  padding:12px 14px;box-shadow:0 4px 0 var(--line2),0 8px 18px rgba(90,60,10,.18);
  display:flex;align-items:center;gap:11px;cursor:pointer}
.goal .gi{font-size:30px}
.goal .gt{flex:1;min-width:0}
.goal .gl{font-size:10px;color:var(--ink3);font-weight:800;letter-spacing:1px}
.goal .gn{font-family:'Secular One',sans-serif;font-size:17px;color:var(--ink)}
.goal .gc{font-size:11.5px;color:var(--ink2);margin-top:1px}
.goal .gc .lack{color:var(--red);font-weight:800}
.soonrow{display:flex;gap:6px;justify-content:center;padding:0 12px 12px;flex-wrap:wrap}
.soon{font-size:11px;color:var(--ink2);background:rgba(255,249,234,.75);border:1.5px dashed var(--line2);border-radius:12px;padding:4px 12px}

.panel{padding:12px}
.pcard{background:var(--card);border:2px solid var(--line);border-radius:16px;padding:13px;margin-bottom:9px;box-shadow:0 3px 0 var(--line2)}
.pcard h3{font-size:17px;color:var(--ink)}
.pcard .win{font-size:10px;color:var(--goldD);letter-spacing:1px;margin:2px 0 4px;font-weight:800}
.pcard p{font-size:12px;color:var(--ink2);line-height:1.65}
.clock{font-family:'Secular One',sans-serif;font-size:42px;color:var(--ink);text-align:center;font-variant-numeric:tabular-nums;margin-top:6px;text-shadow:0 2px 0 #fff}
.dt{font-size:11px;color:var(--ink2);text-align:center;letter-spacing:2px;margin-bottom:10px}
.locked-av{text-align:center;padding:40px 26px}
.locked-av .big{font-size:44px;margin-bottom:10px}
.locked-av h3{font-size:19px;color:var(--ink)}
.locked-av p{font-size:12.5px;color:var(--ink2);margin-top:8px;line-height:1.8}
.step{display:flex;gap:10px;padding:12px;margin-bottom:7px;background:var(--card);border:2px solid var(--line);border-radius:14px;transition:all .25s}
.step.act{border-color:var(--gold);box-shadow:0 3px 0 var(--goldD);background:#FFFDF2}
.step.past{opacity:.45}
.sn{width:27px;height:27px;border-radius:50%;background:var(--card2);border:2px solid var(--line2);display:flex;align-items:center;justify-content:center;
  font-size:12px;color:var(--ink);flex-shrink:0;font-weight:800}
.step.act .sn{background:var(--gold);border-color:var(--goldD);color:#fff}
.sb{flex:1}
.sname{font-size:14.5px;color:var(--ink);font-weight:800}
.sdesc{font-size:11.5px;color:var(--ink2);line-height:1.6;margin:3px 0 4px}
.spas{font-family:'Noto Serif Hebrew',serif;font-size:10.5px;color:var(--ink3);font-style:italic;border-right:3px solid var(--gold);padding-right:7px;line-height:1.55;margin-bottom:7px}
.kbtn{font-family:'Secular One',sans-serif;font-size:13px;background:linear-gradient(180deg,#6BC94F,var(--green) 45%,var(--greenD));color:#fff;border:none;border-radius:12px;padding:8px 18px;cursor:pointer;box-shadow:0 3px 0 #26702B;text-shadow:0 1px 2px rgba(0,0,0,.2)}
.kbtn:active{transform:translateY(2px);box-shadow:0 1px 0 #26702B}
.kbtn.mg{background:linear-gradient(180deg,#FFDF6B,var(--gold) 50%,var(--goldD));color:#5B3E06;box-shadow:0 3px 0 #96690F;text-shadow:none}
.wait{text-align:center;padding:22px 14px}
.wait h3{font-size:15px;color:var(--ink)}
.wait .cd{font-family:'Secular One',sans-serif;font-size:32px;color:var(--goldD);font-variant-numeric:tabular-nums;margin-top:6px}
.donebox{text-align:center;padding:20px 14px}
.donebox h3{color:var(--greenD);font-size:18px}
.donebox p{margin-top:6px}

.qcard.solved{border-color:#9CCB8F}
.qq{font-size:14px;color:var(--ink);line-height:1.6;margin-bottom:10px;font-weight:800}
.qopts{display:flex;flex-direction:column;gap:6px}
.qo{background:#fff;border:2px solid var(--line);border-radius:12px;padding:9px 13px;font-size:13px;color:var(--ink2);cursor:pointer;text-align:right;font-family:inherit;box-shadow:0 2px 0 var(--line2);transition:all .15s}
.qo:active{transform:translateY(1px)}
.qo.right{background:#E9F6E2;border-color:#7BBB6A;color:#37752E;font-weight:800}
.qo.wrong{background:#FBE9E7;border-color:#DB9C93;color:#A94438}
.qexp{display:none;margin-top:10px;border-right:3px solid var(--gold);padding:8px 11px;background:var(--card2);font-size:12px;color:var(--ink2);line-height:1.7;border-radius:4px}
.qexp.on{display:block}
.qexp .src{font-size:10px;color:var(--ink3);display:block;margin-top:3px;font-weight:800}

.ov{display:none;position:fixed;inset:0;z-index:100;background:rgba(60,40,10,.45);align-items:flex-end;justify-content:center}
.ov.on{display:flex;animation:fade .2s}
@keyframes fade{from{opacity:0}to{opacity:1}}
.sheet{background:var(--card);border-radius:22px 22px 0 0;width:100%;max-width:560px;max-height:84dvh;overflow-y:auto;
  padding:14px 16px calc(18px + env(safe-area-inset-bottom,0px));box-shadow:0 -8px 30px rgba(60,40,10,.3);
  animation:up .3s cubic-bezier(.34,1.3,.64,1)}
@keyframes up{from{transform:translateY(60%)}to{transform:translateY(0)}}
.grip{width:44px;height:5px;background:var(--line2);border-radius:3px;margin:0 auto 12px}
.sh-head{display:flex;align-items:center;gap:11px}
.sh-ico{font-size:34px}
.sh-name{font-family:'Secular One',sans-serif;font-size:21px;color:var(--ink)}
.sh-num{font-size:11px;color:var(--ink3);font-weight:800}
.mx{margin-right:auto;background:var(--card2);border:2px solid var(--line);border-radius:50%;width:32px;height:32px;font-size:13px;cursor:pointer;color:var(--ink2)}
.sh-hal{font-family:'Noto Serif Hebrew',serif;margin:11px 0;border-right:3px solid var(--gold);padding:8px 11px;background:var(--card2);border-radius:4px;font-size:13px;color:var(--ink);line-height:1.8}
.sh-hal .src{font-size:10.5px;color:var(--ink3);display:block;margin-top:4px;font-family:'Heebo';font-weight:800}
.sh-cost{font-size:13px;color:var(--ink2);margin-bottom:4px}
.sh-cost .lack{color:var(--red);font-weight:800}
.sh-prod{font-size:12px;color:var(--greenD);font-weight:800;margin-bottom:8px}
.sh-timer{display:flex;align-items:center;gap:10px;margin:10px 0}
.cnt{font-family:'Secular One',sans-serif;font-size:18px;color:var(--goldD);font-variant-numeric:tabular-nums}
.tprog{flex:1;height:10px;background:#E9DCB8;border-radius:5px;overflow:hidden;border:1px solid var(--line2)}
.tfill{height:100%;background:linear-gradient(90deg,var(--gold),var(--goldL));border-radius:5px;transition:width .2s}
.sh-done{font-size:15px;color:var(--greenD);font-weight:800;text-align:center;padding:8px}
.sh-tap{font-size:13px;color:var(--ink);text-align:center;background:var(--card2);border:2px dashed var(--line2);border-radius:12px;padding:10px;margin-top:6px;font-weight:800}
.smg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0}
.sm{background:#fff;border:2px solid var(--line);border-radius:12px;padding:9px 4px;text-align:center;cursor:pointer;font-family:inherit;color:inherit;box-shadow:0 2px 0 var(--line2);transition:all .15s}
.sm.sel{border-color:var(--goldD);background:#FFF4D6}
.sm.rt{border-color:#7BBB6A;background:#E9F6E2}
.sm.wr{border-color:#DB9C93;background:#FBE9E7}
.sm .i{font-size:19px}
.sm .n{font-size:10px;color:var(--ink);margin-top:2px;font-weight:800}
.sm .q{font-size:9px;color:var(--ink3)}
.kres{font-size:14px;text-align:center;padding:8px;min-height:34px;font-weight:800}

#toast{position:fixed;top:calc(env(safe-area-inset-top,0px) + 10px);left:50%;transform:translateX(-50%) translateY(-130px);
  background:var(--card);border:2px solid var(--line);border-radius:16px;padding:10px 18px;
  max-width:310px;width:88%;z-index:300;text-align:center;box-shadow:0 5px 0 var(--line2),0 12px 26px rgba(60,40,10,.3);
  transition:transform .5s cubic-bezier(.34,1.56,.64,1)}
#toast.on{transform:translateX(-50%) translateY(0)}
#toast .ti{font-size:20px}
#toast .tt{font-size:14px;color:var(--ink);font-weight:800}
#toast .tb{font-size:11px;color:var(--ink2);line-height:1.5}

#celeb{display:none;position:fixed;inset:0;z-index:400;background:rgba(12,7,0,.93);align-items:center;justify-content:center;flex-direction:column;gap:12px;text-align:center;padding:26px}
#celeb.on{display:flex}
#fw{position:absolute;inset:0;pointer-events:none}
#celeb .ic{font-size:56px;animation:ci 1.2s ease-in-out infinite}
@keyframes ci{0%,100%{transform:scale(1)rotate(-4deg)}50%{transform:scale(1.1)rotate(4deg)}}
#celeb h2{font-size:clamp(32px,10vw,56px);color:#F8D75E;text-shadow:0 3px 0 #96690F,0 8px 24px rgba(232,179,60,.5);position:relative;z-index:2}
#celeb p{font-family:'Noto Serif Hebrew',serif;font-size:13px;color:#E8D9AE;font-style:italic;line-height:1.9;max-width:300px;position:relative;z-index:2}
#celeb p small{color:var(--gold);font-style:normal}

.flt{position:fixed;font-size:17px;font-weight:800;color:var(--goldD);pointer-events:none;z-index:500;animation:fup 1s ease-out forwards;text-shadow:0 1px 0 #fff}
@keyframes fup{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-48px)}}
.pt{position:fixed;border-radius:50%;pointer-events:none;z-index:500;animation:ptx 1.2s ease-out forwards}
@keyframes ptx{0%{transform:translate(0,0)scale(1);opacity:1}100%{transform:translate(var(--dx),var(--dy))scale(0);opacity:0}}
</style>

<div class="wrap">

<!-- SPLASH -->
<div class="scr on" id="s0">
  <div class="logo">
    <svg viewBox="0 0 200 220" role="img" aria-label="בית המקדש">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCF3D0"/><stop offset="1" stop-color="#C9A45C"/></linearGradient>
        <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8D75E"/><stop offset="1" stop-color="#B5821A"/></linearGradient>
      </defs>
      <rect x="15" y="175" width="170" height="22" fill="url(#lg1)" rx="2"/>
      <rect x="28" y="155" width="144" height="22" fill="url(#lg1)" rx="2"/>
      <rect x="44" y="140" width="112" height="17" fill="#EADDA8" rx="2"/>
      <rect x="46" y="88" width="11" height="54" fill="#DECF9A"/><rect x="66" y="88" width="11" height="54" fill="#DECF9A"/>
      <rect x="123" y="88" width="11" height="54" fill="#DECF9A"/><rect x="143" y="88" width="11" height="54" fill="#DECF9A"/>
      <rect x="57" y="92" width="86" height="50" fill="url(#lg1)"/>
      <polygon points="32,88 100,34 168,88" fill="url(#lg2)"/>
      <circle cx="100" cy="34" r="4.5" fill="#FFF5A0"/>
      <rect x="96" y="100" width="8" height="18" fill="url(#lg2)"/>
      <rect x="82" y="104" width="36" height="2.5" fill="url(#lg2)"/>
      <rect x="82" y="100" width="5" height="7" rx="2.5" fill="url(#lg2)"/><rect x="91" y="99" width="5" height="7" rx="2.5" fill="url(#lg2)"/>
      <rect x="104" y="99" width="5" height="7" rx="2.5" fill="url(#lg2)"/><rect x="113" y="100" width="5" height="7" rx="2.5" fill="url(#lg2)"/>
      <circle cx="84" cy="99" r="2.5" fill="#FFEB70"/><circle cx="93" cy="98" r="2.5" fill="#FFEB70"/><circle cx="100" cy="97" r="2.8" fill="#FFFFFF"/>
      <circle cx="107" cy="98" r="2.5" fill="#FFEB70"/><circle cx="116" cy="99" r="2.5" fill="#FFEB70"/>
      <ellipse cx="100" cy="147" rx="13" ry="5.5" fill="#FF5A10" opacity=".9"><animate attributeName="rx" values="13;17;13" dur=".75s" repeatCount="indefinite"/></ellipse>
      <ellipse cx="100" cy="138" rx="8" ry="10" fill="#FF8A2A"><animate attributeName="ry" values="10;15;10" dur=".58s" repeatCount="indefinite"/></ellipse>
      <ellipse cx="100" cy="128" rx="5" ry="8" fill="#FFD700"><animate attributeName="ry" values="8;13;8" dur=".68s" repeatCount="indefinite"/></ellipse>
    </svg>
  </div>
  <div class="t-big">בית המקדש</div>
  <p class="t-sub">״וְעָשׂוּ לִי מִקְדָּשׁ וְשָׁכַנְתִּי בְּתוֹכָם״ · שמות כה, ח</p>
  <div class="wb" id="wb"><h3>ברוך שובך! 👋</h3><p id="wb-p"></p><div class="chips" id="wb-chips"></div></div>
  <button class="gbtn" id="startBtn" onclick="startGame()">▶ &nbsp;בנה את הבית</button>
  <button class="gbtn ghost" onclick="newGame()">משחק חדש</button>
  <p class="credit">בטא 4.0 · תוכן ואיורים בהשראת מכון ״לשכנו תדרשו״ · mikdash3.co.il</p>
</div>

<!-- MAIN -->
<div class="scr" id="s1">
  <div class="hud">
    <div class="rrow" id="rrow"></div>
    <div class="hudrow">
      <div class="progchip"><span class="star">⭐</span><div class="pbar"><div class="pfill" id="prog-f" style="width:0%"></div></div><b id="prog-t">0/15</b></div>
      <button class="hbtn" onclick="goSplash()" aria-label="מסך פתיחה">🏠</button>
    </div>
  </div>

  <div class="pane on" id="p-world">
    <div class="worldwrap" id="worldwrap"><svg id="world" viewBox="0 0 720 548" role="img" aria-label="הר הבית — עולם הבנייה"></svg></div>
    <div class="goal" id="goal" onclick="goalClick()"></div>
    <div class="soonrow"><span class="soon">🕎 כלי הקודש — בקרוב</span><span class="soon">👘 בגדי כהונה — בקרוב</span></div>
  </div>

  <div class="pane" id="p-sup">
    <div class="panel">
      <div class="pcard"><h3>🚢 משלחות אספקה</h3><p>שלח משלחות אמיתיות — ארזים מהלבנון, זהב מאופיר, חילזון מחוף זבולון. הן מפליגות <b>בזמן אמת</b>, שעות ואף יממה — וממשיכות גם כשאתה לא כאן. חזור מחר ואסוף את השלל.</p></div>
      <div id="suplist"></div>
    </div>
  </div>

  <div class="pane" id="p-av"><div id="av-inner"></div></div>

  <div class="pane" id="p-qz">
    <div class="panel">
      <div class="pcard"><h3>📜 אוצר הידע</h3><p>כל תשובה נכונה בפעם הראשונה — ‎+10 זהב. הידע הזה אמיתי, מהמקורות.</p></div>
      <div id="qlist"></div>
    </div>
  </div>

  <div class="nav">
    <button class="nb on" id="nb-world" onclick="sw('world')">🏗 העולם</button>
    <button class="nb" id="nb-sup" onclick="sw('sup')">🚢 משלחות<span class="nbadge" id="sup-badge" hidden></span></button>
    <button class="nb" id="nb-av" onclick="sw('av')">🔥 עבודה</button>
    <button class="nb" id="nb-qz" onclick="sw('qz')">📜 ידע</button>
  </div>
</div>
</div>

<!-- BUILDING SHEET -->
<div class="ov" id="ov-b" onclick="if(event.target===this)closeSheet()">
  <div class="sheet"><div class="grip"></div><div id="sheet-body"></div></div>
</div>

<!-- KETORET -->
<div class="ov" id="ov-k" onclick="if(event.target===this)closeK()">
  <div class="sheet"><div class="grip"></div>
    <div class="sh-head"><span class="sh-ico">🌿</span><div><div class="sh-name">רקיחת הקטורת</div><div class="sh-num">מיני-משחק</div></div>
      <button class="mx" onclick="closeK()" aria-label="סגור">✕</button></div>
    <p style="font-size:12.5px;color:var(--ink2);line-height:1.7;margin-top:8px">בחר את <b style="color:var(--goldD)">11 הסממנים</b> הנכונים בלבד. סממן זר אחד — והקטורת נפסלת! <span style="color:var(--ink3)">״בַּד בְּבַד יִהְיֶה״ — שמות ל, לד</span></p>
    <div class="smg" id="smg"></div>
    <div class="kres" id="kres"></div>
  </div>
</div>

<div id="toast"><div class="ti" id="t-i">🔔</div><div class="tt" id="t-t">-</div><div class="tb" id="t-b">-</div></div>

<div id="celeb">
  <canvas id="fw"></canvas>
  <div class="ic">🕍</div>
  <h2>חנוכת הבית!</h2>
  <p>״וַתֵּצֵא אֵשׁ מִלִּפְנֵי ה׳ וַתֹּאכַל עַל־הַמִּזְבֵּחַ אֶת־הָעֹלָה״<br><small>ויקרא ט, כד</small></p>
  <button class="gbtn gold" style="margin-top:8px;position:relative;z-index:2" onclick="endCeleb()">כנס לעבודת הקודש ▶</button>
</div>

<script>
'use strict';
const $=id=>document.getElementById(id);
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const KEY='bh_beta2';

/* ════ data ════ */
const RES={s:['🪨','אבן'],c:['🌲','ארז'],g:['✨','זהב'],si:['🪙','כסף'],n:['🟤','נחושת'],t:['🟦','תכלת'],k:['👷','פועלים']};
const START_RES={s:400,c:250,g:200,si:120,n:200,t:40,k:40};
const BLD=[
 {id:'har',n:'שיטוח ההר',i:'⛰',cost:{k:2},work:24,h:'הר המוריה היה משופע. כדי לבנות עליו, יישרו את פסגתו והקיפו אותו בקירות תמך אדירים — מפעל של כ-144 דונם. ״מי שלא ראה בניין הורדוס — לא ראה בניין נאה מימיו״.',src:'סוכה נא, ב'},
 {id:'wall',n:'חומת העזרה',i:'🏛',cost:{s:80,k:4},work:14,h:'העזרה הייתה 187 אמה אורך ו-135 אמה רוחב.',src:'משנה מדות ב, ו',prod:['k',6]},
 {id:'sorag',n:'הסורג',i:'🚧',cost:{s:30,n:10,k:2},work:8,h:'הסורג היה גדר בגובה עשרה טפחים, שסימנה עד היכן מותר לזרים ולטמאים להיכנס.',src:'משנה מדות ב, ג'},
 {id:'gates',n:'שערי העזרה',i:'🚪',cost:{s:40,n:15,k:3},work:12,h:'שבעה שערים היו בעזרה — שלושה בצפון, שלושה בדרום, ואחד במזרח.',src:'משנה מדות ב, ו',prod:['si',6]},
 {id:'nashim',n:'עזרת הנשים',i:'🏛',cost:{s:60,c:10,k:5},work:14,h:'עזרת הנשים — אורך 135 אמה על רוחב 135 אמה, ובארבע פינותיה ארבע לשכות: לשכת הנזירים, לשכת העצים, לשכת המצורעים ולשכת בית שמניא.',src:'משנה מדות ב, ה',prod:['si',4]},
 {id:'nikanor',n:'שער ניקנור וט״ו המעלות',i:'🚪',cost:{n:40,si:15,k:4},work:12,h:'חמש עשרה מעלות עולות מעזרת הנשים לעזרת ישראל — כנגד חמש עשרה שיר המעלות שבתהלים. דלתות הנחושת של ניקנור — נעשו בהן נסים, ונחושתן הייתה מוצהבת כזהב.',src:'משנה מדות ב, ה · יומא לח ע״א'},
 {id:'lishka',n:'לשכות הכהנים',i:'🧵',cost:{s:25,c:15,k:2},work:10,h:'בעזרה היו לשכות ייעודיות לכהנים, בהן התלבשו בבגדי הכהונה; ובצפון המזבח — בית המטבחיים, עשרים וארבע טבעות ושולחנות השיש.',src:'משנה מדות א · ה',prod:['c',6]},
 {id:'yesod',n:'יסוד המזבח',i:'🪨',cost:{s:60,k:5},work:12,h:'היסוד הקיף את צפון ומערב המזבח, וחסר בקרן הדרומית-מזרחית — שלא הייתה בחלקו של בנימין.',src:'משנה מדות ג, א'},
 {id:'sovev',n:'סובב המזבח',i:'⬜',cost:{s:40,k:3},work:10,h:'הסובב היה מקום מדרך לכהנים ברוחב אמה, סביב המזבח.',src:'משנה מדות ג, א'},
 {id:'guf',n:'גוף המזבח (הראל)',i:'🔥',cost:{s:70,n:20,k:5},work:16,h:'גוף המזבח, מקום שריפת הקרבנות, נקרא בשם ״הראל״.',src:'יחזקאל מג, טו',prod:['g',4]},
 {id:'karnot',n:'קרנות המזבח',i:'📐',cost:{s:20,n:25,k:3},work:8,h:'בארבע פינות המזבח בלטו קרנות, כל אחת אמה על אמה.',src:'משנה מדות ג, א'},
 {id:'kiyor',n:'הכיור',i:'⛲',cost:{n:30,si:10,k:2},work:10,h:'הכיור עמד בין האולם למזבח, ובו קידשו הכהנים ידיהם ורגליהם לפני העבודה.',src:'שמות ל, יח',prod:['n',6]},
 {id:'ulam',n:'האולם',i:'🏟',cost:{s:50,c:40,g:10,k:6},work:18,h:'האולם, פתח ההיכל, היה ברוחב מאה אמה. ״ההיכל צר מאחוריו ורחב מלפניו — דומה לארי״.',src:'משנה מדות ד, ז'},
 {id:'heichal',n:'ההיכל',i:'🏰',cost:{c:60,g:30,t:5,k:8},work:22,h:'בהיכל עמדו המנורה, השולחן ומזבח הזהב, ופתחו כלל דלתות ופשפשים.',src:'משנה מדות ד, א',prod:['t',2]},
 {id:'kodesh',n:'קדש הקדשים',i:'👑',cost:{c:20,g:50,t:10,k:4},work:16,h:'בקדש הקדשים עמד ארון הברית; בבית שני היה ריק. רק הכהן הגדול נכנס אליו, פעם בשנה — ביום הכיפורים.',src:'משנה מדות ד, ה'},
];
const IDX={};BLD.forEach((b,i)=>IDX[b.id]=i);
const MIZBEACH=['yesod','sovev','guf','karnot'];
const PHASES=['⛏ חפירה ויסודות','🪵 יציקת המסגרת','🧱 הבנייה עצמה'];
const TAMID=[
 {n:'קידוש ידיים ורגליים',i:'🫶',d:'הכהן מקדש ידיו ורגליו מן הכיור — יד ימין על רגל ימין, בבת אחת. בלי קידוש — העבודה פסולה.',p:'״וְרָחֲצוּ אַהֲרֹן וּבָנָיו מִמֶּנּוּ״ — שמות ל, יט'},
 {n:'תרומת הדשן',i:'🥄',d:'הכהן לוקח במחתה מעט עפר מהמערכה הגדולה ומניחו בצד המזבח — העבודה הראשונה של היום.',p:'ויקרא ו, ג'},
 {n:'סידור המערכה',i:'🪵',d:'מסדרים את עצי המערכה ומעלים שני גזרי עצים — האש לעולם לא כבתה.',p:'״אֵשׁ תָּמִיד תּוּקַד עַל־הַמִּזְבֵּחַ״ — ויקרא ו, ו'},
 {n:'שחיטת התמיד',i:'🐑',d:'כבש בן שנתו, תמים, נשחט בצפון העזרה — קרבן הציבור הראשון של היום.',p:'במדבר כח, ג-ד'},
 {n:'קבלת הדם וזריקתו',i:'💧',d:'הדם נקבל בכלי שרת ונזרק על המזבח — שתי מתנות שהן ארבע, על שתי קרנות נגדיות.',p:'זבחים נג'},
 {n:'הקטרת האיברים',i:'🔥',d:'האיברים מועלים על הכבש ומוקטרים על המערכה — ריח ניחוח.',p:'ויקרא א, ט'},
 {n:'מנחת התמיד ומליחתה',i:'🌾',d:'עשירית האיפה סולת בשמן — ונמלחת על גבי המזבח, בזוית מערבית-דרומית.',p:'״בַּמֶּלַח תִּמְלָח״ — ויקרא ב, יג'},
 {n:'רקיחת הקטורת',i:'🌿',d:'מיני-משחק: זהה את אחד-עשר הסממנים המדויקים של הקטורת!',p:'״בַּד בְּבַד יִהְיֶה״ — שמות ל, לד',mg:true},
 {n:'ניסוך היין',i:'🍷',d:'רביעית ההין יין נמסך לספל שעל גג המזבח, ויורד אל השיתין.',p:'במדבר כח, ז'},
 {n:'שיר של יום',i:'🎵',d:'הלויים על הדוכן שרים את שיר היום בכינורות, נבלים ומצלתיים — וישראל עונים.',p:'תמיד פרק ז'},
];
const SAM=[['צרי','🌱',70,1],['ציפורן','🌿',70,1],['חלבנה','🍃',70,1],['לבונה','⬜',70,1],['מור','🌺',34,1],['קציעה','🟫',34,1],['שיבולת נרד','🌸',34,1],['כרכום','🟡',34,1],['קושט','🟤',12,1],['קילופה','🟢',3,1],['קינמון','🔴',9,1],['שמן זית','🫒',20,0],['דבש','🍯',15,0],['מלח סדומית','🧂',50,0]];
const QUIZ=[
 {q:'באיזו קרן של המזבח לא היה יסוד?',o:['צפונית-מערבית','דרומית-מזרחית','צפונית-מזרחית','דרומית-מערבית'],a:1,e:'היסוד הקיף רק את צפון ומערב המזבח. הקרן הדרומית-מזרחית לא הייתה בחלקו של בנימין ״הטורף״ — ולכן נותרה בלא יסוד.',src:'משנה מדות ג, א · זבחים נג'},
 {q:'כמה סממנים היו בקטורת?',o:['7','10','11','13'],a:2,e:'אחד-עשר סממנים נאמרו למשה בסיני. ״חיסר אחד מכל סממניה — חייב מיתה״.',src:'כריתות ו · פיטום הקטורת'},
 {q:'איזה חומר נאסר בבניית בית המקדש?',o:['נחושת','ברזל','עופרת','בדיל'],a:1,e:'״וּמַקָּבוֹת וְהַגַּרְזֶן כָּל־כְּלִי בַרְזֶל לֹא־נִשְׁמַע בַּבַּיִת בְּהִבָּנֹתוֹ״ — הברזל מקצר חיי אדם, והמזבח מאריכם.',src:'מלכים א ו, ז'},
 {q:'בן כמה הכבש של קרבן התמיד?',o:['בן שנתו','בן שנתיים','בן שלוש','מיום שנולד'],a:0,e:'״כְּבָשִׂים בְּנֵי־שָׁנָה תְמִימִם שְׁנַיִם לַיּוֹם״ — אחד בבוקר ואחד בין הערביים.',src:'במדבר כח, ג'},
 {q:'מי נכנס לקדש הקדשים — ומתי?',o:['כל כהן, בכל יום','הכהן הגדול, בכל שבת','הכהן הגדול, ביום הכיפורים','המלך, בחג הסוכות'],a:2,e:'רק הכהן הגדול, פעם אחת בשנה — ביום הכיפורים, בבגדי לבן, בענן הקטורת.',src:'ויקרא טז'},
 {q:'מתי נפתח שער המזרח של החצר הפנימית?',o:['בכל יום','רק ביום כיפור','בשבתות ובראשי חודשים','לעולם לא'],a:2,e:'״יִהְיֶה סָגוּר שֵׁשֶׁת יְמֵי הַמַּעֲשֶׂה וּבְיוֹם הַשַּׁבָּת יִפָּתֵחַ וּבְיוֹם הַחֹדֶשׁ יִפָּתֵחַ״.',src:'יחזקאל מו, א'},
 {q:'מה היו מידות העזרה?',o:['100 על 100 אמה','187 על 135 אמה','500 על 500 אמה','70 על 70 אמה'],a:1,e:'כל העזרה הייתה אורך 187 אמה על רוחב 135 אמה.',src:'משנה מדות ה, א'},
 {q:'״ההיכל צר מאחוריו ורחב מלפניו״ — דומה ל...?',o:['נשר','שור','ארי','איל'],a:2,e:'״דומה לארי״ — שנאמר ״הוֹי אֲרִיאֵל אֲרִיאֵל קִרְיַת חָנָה דָוִד״. האולם רחב 100 אמה וההיכל מאחוריו 70.',src:'משנה מדות ד, ז'},
];

/* ════ expeditions — מקורות מאומתים ════ */
const EXP=[
 {id:'shemen',n:'עצי שמן לכרובים',i:'🫒',hrs:3,cost:{si:15,k:3},yield:{c:120},
  v:'וַיַּעַשׂ בַּדְּבִיר שְׁנֵי כְרוּבִים עֲצֵי־שָׁמֶן, עֶשֶׂר אַמּוֹת קוֹמָתוֹ',src:'מלכים א ו, כג',
  fact:'הכרובים — עשר אמות קומתם, עצי שמן מצופים זהב.'},
 {id:'copper',n:'נחושת ערי הדדעזר',i:'🟤',hrs:4,cost:{si:20,k:5},yield:{n:350},
  v:'לָקַח דָּוִיד נְחֹשֶׁת רַבָּה מְאֹד — בָּהּ עָשָׂה שְׁלֹמֹה אֶת יָם הַנְּחֹשֶׁת',src:'דברי הימים א יח, ח',
  fact:'הכלים נוצקו בכיכר הירדן, ״לֹא נֶחְקַר מִשְׁקַל הַנְּחֹשֶׁת״.'},
 {id:'stone',n:'מחצבות הגזית',i:'⛏',hrs:6,cost:{si:25,k:8},yield:{s:500},
  v:'וַיַּסִּעוּ אֲבָנִים גְּדֹלוֹת, אֲבָנִים יְקָרוֹת... אַבְנֵי גָזִית',src:'מלכים א ה, לא',
  fact:'שמונים אלף חוצבים בהר ושבעים אלף נושאי סבל.'},
 {id:'techelet',n:'חילזון התכלת',i:'🐚',hrs:8,cost:{si:30,k:4},yield:{t:60},
  v:'עוֹלֶה אֶחָד לְשִׁבְעִים שָׁנָה, וּבְדָמוֹ צוֹבְעִין תְּכֵלֶת — לְפִיכָךְ דָּמָיו יְקָרִים',src:'מנחות מד ע״א',
  fact:'טמון בחולות חופו של זבולון (מגילה ו ע״א).'},
 {id:'cedar',n:'ארזי הלבנון',i:'🌲',hrs:12,cost:{si:40,k:6},yield:{c:400},
  v:'וּנְבִיאֵם לְךָ רַפְסֹדוֹת עַל יָם יָפוֹ, וְאַתָּה תַּעֲלֶה אֹתָם יְרוּשָׁלִָם',src:'דברי הימים ב ב, טו',
  fact:'עשרת אלפים איש בחודש: ״חֹדֶשׁ יִהְיוּ בַלְּבָנוֹן, שְׁנַיִם חֳדָשִׁים בְּבֵיתוֹ״.'},
 {id:'gems',n:'אוצרות דוד — שוהם ושיש',i:'💎',hrs:18,cost:{si:60,k:6},yield:{g:120,si:80},
  v:'אַבְנֵי שֹׁהַם וּמִלּוּאִים... וְאַבְנֵי שַׁיִשׁ לָרֹב',src:'דברי הימים א כט, ב',
  fact:'דוד הכין הכל מראש — אף שידע שלא יבנה בעצמו.'},
 {id:'ophir',n:'זהב אופיר',i:'🚢',hrs:24,cost:{si:100,k:10},yield:{g:420},
  v:'וַיָּבֹאוּ אוֹפִירָה וַיִּקְחוּ מִשָּׁם זָהָב, אַרְבַּע מֵאוֹת וְעֶשְׂרִים כִּכָּר',src:'מלכים א ט, כח',
  fact:'מעציון גבר שעל ים סוף, עם מלחי צור ״יֹדְעֵי הַיָּם״. התשואה: 420 — כמניין הככרים.'},
];
const EIDX={};EXP.forEach((e,i)=>EIDX[e.id]=i);

/* ════ state ════ */
let G=null;
function fresh(){return {v:4,res:{...START_RES},b:{},quiz:{},svc:{date:'',step:0,count:0},exp:{},daily:{last:'',streak:0},celeb:false,lastSeen:Date.now(),lastPassive:Date.now()}}
function save(){G.lastSeen=Date.now();store.set(KEY,JSON.stringify(G))}
function load(){const d=store.get(KEY);let pv=99;
  if(d){try{const p=JSON.parse(d);pv=p.v||0;G={...fresh(),...p,res:{...START_RES,...p.res}}}catch(e){G=fresh()}}else G=fresh();
  /* migration from timer-based saves */
  for(const b of BLD){const st=G.b[b.id];if(!st)continue;
    if(st.endsAt!==undefined){
      if(st.done||st.endsAt<=Date.now())G.b[b.id]={done:true};
      else{const tot=(st.total||30)*1000,elp=Date.now()-(st.startedAt||Date.now());
        G.b[b.id]={w:Math.max(1,Math.min(b.work-1,Math.round(elp/tot*b.work)))}}}}
  if(!G.b.har&&BLD.some(b=>b.id!=='har'&&G.b[b.id]))G.b.har={done:true};
  if(pv<4&&G.b.har&&G.b.har.w!==undefined)G.b.har.w=Math.min(23,G.b.har.w*2)}
setInterval(()=>{if(G)save()},12000);
addEventListener('visibilitychange',()=>{if(document.hidden&&G)save()});

function bState(i){const b=BLD[i],st=G.b[b.id];
  if(st&&st.done)return 'done';
  if(st&&st.w!==undefined)return 'building';
  const prevOk=i===0||(G.b[BLD[i-1].id]&&G.b[BLD[i-1].id].done);
  return prevOk?'avail':'locked'}
function doneCount(){return BLD.filter(b=>G.b[b.id]&&G.b[b.id].done).length}
function mizbeachDone(){return MIZBEACH.every(id=>G.b[id]&&G.b[id].done)}
function canAfford(cost){return Object.entries(cost).every(([k,v])=>(G.res[k]||0)>=v)}
function phaseOf(i){const b=BLD[i],st=G.b[b.id];if(!st||st.w===undefined)return 0;
  const r=st.w/b.work;return r<1/3?0:r<2/3?1:2}
function startBuild(i){const b=BLD[i];
  if(bState(i)!=='avail'||!canAfford(b.cost))return;
  for(const[k,v]of Object.entries(b.cost))G.res[k]-=v;
  G.b[b.id]={w:0};
  save();renderRes();paintScene();renderGoal();closeSheet();
  toast('🔨','הבנייה החלה!',b.id==='har'?'לחץ על סלע — הבנאי ירוץ ויפצח אותו בשתי מכות!':'לחץ על אתר הבנייה — הבנאי ירוץ ויעבוד!')}
function svgClient(pt){const svg=$('world');const r=svg.getBoundingClientRect();
  const sc=r.width/720;return[r.left+pt[0]*sc,r.top+pt[1]*sc]}
const ROCKCOL=['#B7A075','#8F7A50','#CBB88E','#A78D5C'];
const BUILDCOL=['#F8D75E','#E8B33C','#DCC28C','#CBB27A'];
function chips(ptSvg,cols,n){const[cx,cy]=svgClient(ptSvg);
  for(let i=0;i<(n||6);i++){const p=document.createElement('div');p.className='pt';
    const a=Math.random()*Math.PI*2,d=26+Math.random()*46;
    p.style.cssText=`left:${cx}px;top:${cy}px;width:${3+Math.random()*4}px;height:${3+Math.random()*3}px;border-radius:2px;background:${cols[i%cols.length]}`;
    p.style.setProperty('--dx',Math.cos(a)*d+'px');p.style.setProperty('--dy',(Math.sin(a)*d-34)+'px');
    document.body.appendChild(p);setTimeout(()=>p.remove(),1300)}}
function shakeWorld(){const w=$('world');w.classList.remove('shake');void w.offsetWidth;w.classList.add('shake')}
function stonesCleared(){return Math.floor(((G.b.har&&G.b.har.w)||0)/2)}
function doWorkCore(bid,ptSvg){const i=IDX[bid],b=BLD[i],st=G.b[bid];
  if(!st||st.w===undefined)return;
  const prevPhase=phaseOf(i);
  st.w++;
  chips(ptSvg,bid==='har'?ROCKCOL:BUILDCOL);shakeWorld();
  const[cx,cy]=svgClient(ptSvg);
  if(st.w>=b.work){delete st.w;st.done=true;save();
    renderRes();paintScene();renderGoal();renderProg();
    toast('🎉',b.n+' — הושלם!','המקדש הולך ונבנה');
    sparkle(cx,cy,14);maybeCeleb();
    if(sheetB===bid)renderSheet();
    return}
  const ph=phaseOf(i);
  if(bid!=='har'&&ph!==prevPhase){paintScene();floatTxt(PHASES[ph],cx,cy-34)}
  chipT.textContent=bid==='har'?('⛏ '+stonesCleared()+'/12'):('🔨 '+st.w+'/'+b.work);
  const gw=$('goal-w');if(gw)gw.textContent=bid==='har'?stonesCleared():st.w;
  const sw2=$('sh-w');if(sw2){sw2.textContent=st.w;
    const sf=$('sh-tf');if(sf)sf.style.width=(st.w/b.work*100)+'%'}
  save()}

/* ════ HERO — הבנאי ════ */
const GOFF={har:[8,10],wall:[6.6,8.4],sorag:[7.8,8.7],gates:[6,8.3],
  nashim:[11.7,5.9],nikanor:[10.1,5.5],lishka:[7.15,3.95],
  yesod:[8.2,6.2],sovev:[8.15,6.15],guf:[8.1,6.1],karnot:[8.05,6.05],
  kiyor:[6.55,7.0],ulam:[6.35,5.0],heichal:[4.4,6.55],kodesh:[2.9,6.55]};
const hero={x:0,y:0,g:null,flip:null,swingAnim:null,busy:false,q:[]};
function heroTap(job){if(hero.q.length>=3)return;hero.q.push(job);pumpHero()}
function pumpHero(){if(hero.busy||!hero.q.length)return;hero.busy=true;
  const job=hero.q.shift();
  const side=job.pt[0]>=hero.x?-1:1;
  const tx=job.pt[0]+side*15,ty=job.pt[1]+3;
  hero.flip.setAttribute('transform',side===-1?'scale(1,1)':'scale(-1,1)');
  const dist=Math.hypot(tx-hero.x,ty-hero.y);
  const dur=Math.max(100,Math.min(460,dist*2.1));
  const a=hero.g.animate(
    [{transform:`translate(${hero.x}px,${hero.y}px)`},{transform:`translate(${tx}px,${ty}px)`}],
    {duration:dur,easing:'ease-out',fill:'forwards'});
  a.onfinish=()=>{hero.x=tx;hero.y=ty;
    hero.g.style.transform=`translate(${tx}px,${ty}px)`;
    try{a.cancel()}catch(e){}
    doSwing(job)}}
function doSwing(job){
  if(hero.swingAnim)hero.swingAnim.beginElement();
  setTimeout(()=>heroImpact(job),140);
  setTimeout(()=>{hero.busy=false;pumpHero()},290)}
function heroImpact(job){
  if(job.rock){const rb=job.rock;
    if(rb.gone||bState(0)!=='building')return;
    rb.hp--;
    if(rb.hp<=0){rb.gone=true;rb.g.style.display='none';chips(job.pt,ROCKCOL,10)}
    else{rb.crack.style.display='';rb.g.classList.add('thump')}
    doWorkCore('har',job.pt)}
  else doWorkCore(job.bid,job.pt)}
function applyPassive(capMin){const now=Date.now();
  let mins=(now-(G.lastPassive||now))/60000;
  if(capMin!==undefined)mins=Math.min(mins,capMin);
  if(mins<=0){G.lastPassive=now;return {}}
  const gains={};
  for(const b of BLD){if(b.prod&&G.b[b.id]&&G.b[b.id].done){const[r,rate]=b.prod;gains[r]=(gains[r]||0)+rate*mins}}
  for(const[r,v]of Object.entries(gains))G.res[r]=(G.res[r]||0)+v;
  G.lastPassive=now;return gains}
function settleExp(){const back=[];
  for(const e of EXP){const st=G.exp[e.id];
    if(st&&st.endsAt&&st.endsAt<=Date.now()){G.exp[e.id]={ret:true};back.push(e)}}
  return back}
function retCount(){return EXP.filter(e=>G.exp[e.id]&&G.exp[e.id].ret).length}
function startExp(i){const e=EXP[i];
  if(G.exp[e.id]||!canAfford(e.cost))return;
  for(const[k,v]of Object.entries(e.cost))G.res[k]-=v;
  G.exp[e.id]={endsAt:Date.now()+e.hrs*3600000};
  save();renderRes();renderSup();
  toast(e.i,'המשלחת יצאה!',e.n+' — תשוב בעוד '+e.hrs+' שעות, גם אם לא תהיה כאן')}
function collectExp(i){const e=EXP[i];const st=G.exp[e.id];
  if(!st||!st.ret)return;
  delete G.exp[e.id];
  for(const[k,v]of Object.entries(e.yield))gain(k,v);
  save();renderSup();updateSupBadge();
  sparkle(innerWidth/2,innerHeight/2,14);
  toast(e.i,e.n+' — השלל נאסף!',Object.entries(e.yield).map(([k,v])=>'+'+v+RES[k][0]).join(' '))}
function updateSupBadge(){const b=$('sup-badge');if(b)b.hidden=retCount()===0}
function fmtDur(ms){const h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000);
  return h>0?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`}
function renderSup(){const el2=$('suplist');if(!el2)return;
  el2.innerHTML=EXP.map((e,i)=>{const st=G.exp[e.id];
    let body='';
    if(st&&st.ret)body=`<button class="gbtn gold" style="width:100%;margin-top:8px" onclick="collectExp(${i})">🎁 המשלחת חזרה — אסוף את השלל!</button>`;
    else if(st&&st.endsAt){const rem=Math.max(0,st.endsAt-Date.now());
      const pct=Math.min(100,(1-rem/(e.hrs*3600000))*100);
      body=`<div class="sh-timer" style="margin:8px 0 0"><span class="cnt" id="exp-cd-${e.id}">${fmtDur(rem)}</span>
        <div class="tprog"><div class="tfill" id="exp-tf-${e.id}" style="width:${pct}%"></div></div>
        <button class="kbtn" style="font-size:11px;padding:6px 10px" onclick="G.exp['${e.id}'].endsAt=Date.now();save()">⏩ הדגמה</button></div>
        <div class="expfact" style="color:var(--ink3)">המשלחת בדרך — תמשיך גם כשתצא מהמשחק. חזור מאוחר יותר!</div>`}
    else{const ok=canAfford(e.cost);
      body=`<div class="sh-cost" style="margin-top:7px">עלות: ${costStr(e.cost)} · ⛵ ${e.hrs} שעות אמיתיות</div>
        <div class="sh-prod">שלל: ${Object.entries(e.yield).map(([k,v])=>'+'+v+' '+RES[k][1]).join(' · ')}</div>
        <button class="gbtn" style="width:100%;padding:11px" onclick="startExp(${i})" ${ok?'':'disabled'}>${ok?'⛵ שלח משלחת':'חסרים משאבים'}</button>`}
    return `<div class="pcard expc ${st&&st.ret?'ret':''}">
      <div class="exph"><span class="i">${e.i}</span>
        <div style="flex:1"><div class="n">${e.n}</div><div class="d">${e.hrs} שעות · זמן אמת</div></div></div>
      <div class="spas" style="margin-top:7px">״${e.v}״ — ${e.src}</div>
      <div class="expfact">${e.fact}</div>${body}</div>`}).join('')}
function offlineReport(){const away=(Date.now()-(G.lastSeen||Date.now()))/1000;
  const back=settleExp();
  if(away<60&&!back.length)return null;
  const gains=applyPassive(480);
  if(!Object.values(gains).some(v=>v>=1)&&!back.length)return null;
  return {away,gains,back}}

/* ════ ISO WORLD ════ */
const NS='http://www.w3.org/2000/svg';
const TW=22,TH=11,OX=360,OY=118;
const px=(u,v,z=0)=>[OX+(u-v)*TW,OY+(u+v)*TH-z];
const PAL={stone:['#F2E5BE','#DCC28C','#BC9A5E'],white:['#FCF5DF','#EDDFB4','#D2B87E'],
  gold:['#F8D75E','#E2B134','#C08E1E'],copper:['#DE9A5C','#BE7A40','#986130'],
  wood:['#C79A62','#A97D49','#876139'],blue:['#7DA3D4','#5880B0','#43648E']};
function el(tag,attrs,parent){const e=document.createElementNS(NS,tag);
  for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e}
function poly(parent,points,fill,extra){return el('polygon',{points:points.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),fill,stroke:'rgba(90,60,20,.28)','stroke-width':'.8','stroke-linejoin':'round',...(extra||{})},parent)}
function shade(hex,f){const n=parseInt(hex.slice(1),16);
  const r=Math.max(0,Math.min(255,(n>>16)+f)),g2=Math.max(0,Math.min(255,(n>>8&255)+f)),b=Math.max(0,Math.min(255,(n&255)+f));
  return '#'+((r<<16|g2<<8|b).toString(16).padStart(6,'0'))}
function makeGrads(svg){const defs=el('defs',{},svg);
  for(const[name,pal]of Object.entries(PAL)){
    for(const[side,base]of[['L',pal[1]],['R',pal[2]]]){
      const lg=el('linearGradient',{id:'g'+side+'-'+name,x1:'0',y1:'0',x2:'0',y2:'1'},defs);
      el('stop',{offset:'0',['stop-color']:shade(base,14)},lg);
      el('stop',{offset:'1',['stop-color']:shade(base,-16)},lg)}}}
function prism(g,u,v,w,d,h,zb,palName,topOver){const pal=PAL[palName];
  if(h>=10)poly(g,[px(u+w,v,zb),px(u+w+0.9,v+0.5,zb),px(u+w+0.9,v+d+0.5,zb),px(u+0.9,v+d+0.5,zb),px(u,v+d,zb),px(u+w,v+d,zb)],
    'rgba(60,40,15,.16)',{stroke:'none'});
  poly(g,[px(u,v+d,zb+h),px(u+w,v+d,zb+h),px(u+w,v+d,zb),px(u,v+d,zb)],`url(#gL-${palName})`);
  poly(g,[px(u+w,v,zb+h),px(u+w,v+d,zb+h),px(u+w,v+d,zb),px(u+w,v,zb)],`url(#gR-${palName})`);
  poly(g,[px(u,v,zb+h),px(u+w,v,zb+h),px(u+w,v+d,zb+h),px(u,v+d,zb+h)],topOver?PAL[topOver][0]:pal[0]);
  el('polyline',{points:[px(u,v+d,zb+h),px(u,v,zb+h),px(u+w,v,zb+h)].map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    fill:'none',stroke:'rgba(255,252,235,.55)','stroke-width':'1'},g)}
function faceRect(g,u1,u2,vf,z1,z2,fill){
  poly(g,[px(u1,vf,z2),px(u2,vf,z2),px(u2,vf,z1),px(u1,vf,z1)],fill,{stroke:'none'})}
function faceRectE(g,uf,v1,v2,z1,z2,fill){
  poly(g,[px(uf,v1,z2),px(uf,v2,z2),px(uf,v2,z1),px(uf,v1,z1)],fill,{stroke:'none'})}
function diamond(u,v,w,d,z=0){return [px(u,v,z),px(u+w,v,z),px(u+w,v+d,z),px(u,v+d,z)]}

/* פריסה לפי מסכת מידות — מערב משמאל-למעלה, מזרח מימין-למטה.
   סקאלה ~1u=25 אמה. עזרה 187×135 (u1.4–8.9), עזרת נשים 135×135 (u8.9–14.3),
   רוב ההר פנוי מן הדרום (v>7.4). */
const SCENE=[
 /* סורג — טבעת סביב כל המתחם */
 {b:'sorag',p:[0.85,1.45,13.9,0.22,5,0,'wood']},
 {b:'sorag',p:[0.85,1.67,0.22,6.06,5,0,'wood']},
 /* חומה — צפון+מערב */
 {b:'wall',p:[1.4,2.0,0.35,5.4,16,0,'stone']},
 {b:'wall',p:[1.4,2.0,1.2,0.35,16,0,'stone']},
 {b:'gates',p:[2.6,1.85,0.9,0.65,22,0,'stone'],x:'arch'},
 {b:'wall',p:[3.5,2.0,1.5,0.35,16,0,'stone']},
 {b:'gates',p:[5.0,1.85,0.9,0.65,22,0,'stone'],x:'arch'},
 {b:'wall',p:[5.9,2.0,1.5,0.35,16,0,'stone']},
 {b:'gates',p:[7.4,1.85,0.9,0.65,22,0,'stone'],x:'arch'},
 {b:'wall',p:[8.3,2.0,6.0,0.35,16,0,'stone']},
 /* קודש הקדשים · היכל · אולם — בקצה המערבי, חזית 100 אמה למזרח */
 {b:'lishka',p:[2.2,2.5,1.4,0.9,9,0,'stone'],top:'blue'},
 {b:'kodesh',p:[1.7,3.3,0.85,2.8,32,0,'white'],x:'kodesh'},
 {b:'heichal',p:[2.55,3.3,2.2,2.8,36,0,'white'],x:'heichal'},
 {b:'ulam',p:[4.75,2.7,0.95,4.0,42,0,'white'],x:'ulam'},
 {b:'lishka',p:[6.3,2.55,1.6,1.0,9,0,'stone'],top:'blue',x:'shulchanot'},
 /* מחיצת עזרה/עזרת-נשים + עזרת הנשים ולשכות פינותיה */
 {b:'wall',p:[8.75,2.35,0.35,1.8,16,0,'stone']},
 {b:'nashim',p:[9.1,2.35,4.85,4.7,1,0,'white']},
 {b:'nashim',p:[9.25,2.5,1.25,1.25,10,0,'stone'],top:'blue'},
 {b:'nashim',p:[12.55,2.5,1.25,1.25,10,0,'stone'],top:'blue'},
 {b:'lishka',p:[2.2,5.95,1.4,0.9,9,0,'stone'],top:'blue'},
 /* המזבח — יסוד · סובב · גוף (עם כבש לדרום) · קרנות */
 {b:'yesod',p:[6.6,4.6,1.3,1.3,3,0,'stone']},
 {b:'sovev',p:[6.72,4.72,1.06,1.06,6,3,'stone']},
 {b:'guf',p:[6.88,4.88,0.74,0.74,11,9,'stone'],x:'fire'},
 {b:'karnot',p:[6.88,4.88,0.2,0.2,3,20,'stone']},
 {b:'karnot',p:[7.42,4.88,0.2,0.2,3,20,'stone']},
 {b:'karnot',p:[6.88,5.42,0.2,0.2,3,20,'stone']},
 {b:'karnot',p:[7.42,5.42,0.2,0.2,3,20,'stone']},
 /* שער ניקנור + ט״ו המעלות */
 {b:'nikanor',p:[8.6,4.15,0.9,1.1,26,0,'stone'],x:'nikanor'},
 {b:'kiyor',cyl:[6.1,6.5,13,13]},
 {b:'nashim',p:[9.25,5.65,1.25,1.25,10,0,'stone'],top:'blue'},
 {b:'nashim',p:[12.55,5.65,1.25,1.25,10,0,'stone'],top:'blue'},
 {b:'wall',p:[8.75,5.25,0.35,1.8,16,0,'stone']},
 /* חומה — מזרח (שער המזרח) + דרום */
 {b:'wall',p:[13.95,2.0,0.35,2.2,16,0,'stone']},
 {b:'gates',p:[13.8,4.2,0.65,1.0,24,0,'stone'],x:'archE'},
 {b:'wall',p:[13.95,5.2,0.35,2.2,16,0,'stone']},
 {b:'wall',p:[1.4,7.05,1.2,0.35,16,0,'stone']},
 {b:'gates',p:[2.6,6.95,0.9,0.65,22,0,'stone'],x:'arch'},
 {b:'wall',p:[3.5,7.05,1.5,0.35,16,0,'stone']},
 {b:'gates',p:[5.0,6.95,0.9,0.65,22,0,'stone'],x:'arch'},
 {b:'wall',p:[5.9,7.05,1.5,0.35,16,0,'stone']},
 {b:'gates',p:[7.4,6.95,0.9,0.65,22,0,'stone'],x:'arch'},
 {b:'wall',p:[8.3,7.05,6.0,0.35,16,0,'stone']},
 {b:'sorag',p:[14.63,1.67,0.22,6.06,5,0,'wood']},
 {b:'sorag',p:[0.85,7.73,13.9,0.22,5,0,'wood']},
];
const ANCHOR={har:[8,10,8],wall:[6.6,7.25,24],sorag:[7.8,7.85,13],gates:[6,7.3,30],
  nashim:[11.7,4.7,18],nikanor:[9.05,4.7,34],lishka:[7.1,3.05,17],
  yesod:[7.25,5.25,10],sovev:[7.25,5.25,14],guf:[7.25,5.25,26],karnot:[7.25,5.25,31],
  kiyor:[6.1,6.5,22],ulam:[5.2,4.7,50],heichal:[3.65,4.7,44],kodesh:[2.1,4.7,42]};
const BOULDERS=[[4,3],[6.5,2.6],[9,3.4],[11.5,5],[12.6,7.6],[12,10.5],[10.3,12.8],[7.6,13.4],[5.6,12.4],[3.4,9.8],[3.1,6.6],[5.4,5.2]];
let sceneParts=[],chip,chipT,pin,puffs,firePillar,paveG,roughG,rocks=[],prevStates={};

function drawExtras(g,part){const x=part.x;if(!x)return;
  if(x==='kodesh'){/* גג זהב לקודש הקדשים */
    prism(g,1.62,3.22,1.0,2.95,4,32,'gold')}
  if(x==='heichal'){/* פס זהב, כלה-עורב, חלונות — פני הדרום */
    faceRect(g,2.55,4.75,6.1,32,35.2,PAL.gold[1]);
    for(let u=2.68;u<4.65;u+=0.34)poly(g,[px(u,6.1,36),px(u+0.15,6.1,38.6),px(u+0.3,6.1,36)],PAL.gold[0],{stroke:'none'});
    faceRect(g,2.85,3.2,6.1,18,24,'#7A5C34');
    faceRect(g,3.5,3.85,6.1,18,24,'#7A5C34');
    faceRect(g,4.2,4.55,6.1,18,24,'#7A5C34')}
  if(x==='ulam'){/* חזית 100 אמה למזרח: פתח גבוה, פסי זהב, כלה-עורב, י״ב מעלות */
    faceRectE(g,5.7,4.15,5.25,0,20,'#5E4426');
    faceRectE(g,5.7,4.2,4.28,0,20,PAL.gold[1]);faceRectE(g,5.7,5.12,5.2,0,20,PAL.gold[1]);
    faceRectE(g,5.7,3.0,3.28,0,33,PAL.gold[1]);faceRectE(g,5.7,3.66,3.94,0,33,PAL.gold[1]);
    faceRectE(g,5.7,5.46,5.74,0,33,PAL.gold[1]);faceRectE(g,5.7,6.12,6.4,0,33,PAL.gold[1]);
    faceRectE(g,5.7,2.75,6.65,34,37,PAL.gold[1]);faceRectE(g,5.7,2.75,6.65,37,38.4,PAL.gold[0]);
    for(let v=2.82;v<6.6;v+=0.34)poly(g,[px(5.7,v,42),px(5.7,v+0.15,44.6),px(5.7,v+0.3,42)],PAL.gold[0],{stroke:'none'});
    prism(g,5.7,4.05,0.14,1.3,4.6,0,'white');prism(g,5.84,4.05,0.14,1.3,3.2,0,'white');
    prism(g,5.98,4.05,0.14,1.3,2.0,0,'white');prism(g,6.12,4.05,0.14,1.3,0.9,0,'white')}
  if(x==='nikanor'){/* דלתות נחושת ממורטת + ט״ו מעלות בחצי גורן עגולה */
    const[mx,my]=px(9.62,4.7,1);
    for(let i=15;i>=1;i--){const r=2.6+i*2.0;
      el('path',{d:`M ${mx.toFixed(1)},${(my-r*.5).toFixed(1)} A ${r} ${(r*.5).toFixed(1)} 0 0 1 ${mx.toFixed(1)},${(my+r*.5).toFixed(1)}`,
        fill:'none',stroke:i%2?'rgba(120,95,50,.4)':'rgba(160,130,80,.3)','stroke-width':'1.6'},g)}
    faceRectE(g,9.5,4.32,4.66,0,16,PAL.copper[1]);
    faceRectE(g,9.5,4.74,5.08,0,16,PAL.copper[1]);
    faceRectE(g,9.5,4.66,4.74,0,16,PAL.copper[2]);
    faceRectE(g,9.5,4.32,5.08,16,17.4,PAL.gold[1])}
  if(x==='shulchanot'){/* בית המטבחיים — טבעות ושולחנות */
    for(let i=0;i<4;i++){const[tx,ty]=px(6.55+i*0.34,3.85,0);
      el('rect',{x:tx-3,y:ty-4,width:6,height:4,fill:'#D8CBB0',stroke:'rgba(90,60,20,.3)','stroke-width':'.6'},g)}
    for(let i=0;i<4;i++){const[tx,ty]=px(6.5+i*0.32,4.25,0);
      el('circle',{cx:tx,cy:ty,r:1.6,fill:'none',stroke:'#8F7A50','stroke-width':'1'},g)}}
  if(x==='arch'){const u=part.p[0],vf=part.p[1]+part.p[3];
    faceRect(g,u+.22,u+.68,vf,0,14,'#6B4E2E')}
  if(x==='archE'){const uf=part.p[0]+part.p[2];
    faceRectE(g,uf,part.p[1]+0.25,part.p[1]+0.75,0,15,'#6B4E2E')}
  if(x==='fire'){/* כבש המזבח — לדרום */
    poly(g,[px(6.95,5.9,17),px(6.95,6.85,0),px(6.95,5.9,0)],`url(#gL-stone)`);
    poly(g,[px(7.5,5.9,17),px(7.5,6.85,0),px(7.5,5.9,0)],`url(#gR-stone)`);
    poly(g,[px(6.95,5.9,17),px(7.5,5.9,17),px(7.5,6.85,0),px(6.95,6.85,0)],PAL.stone[0]);
    const fg=el('g',{},g);const[cx,cy]=px(7.25,5.25,20);
    const e1=el('ellipse',{cx,cy:cy-1,rx:7,ry:3,fill:'#FF5A10',opacity:.9},fg);
    el('animate',{attributeName:'rx',values:'7;9;7',dur:'.7s',repeatCount:'indefinite'},e1);
    const e2=el('ellipse',{cx,cy:cy-6,rx:4.5,ry:6,fill:'#FF8A2A'},fg);
    el('animate',{attributeName:'ry',values:'6;9;6',dur:'.55s',repeatCount:'indefinite'},e2);
    const e3=el('ellipse',{cx,cy:cy-11,rx:2.6,ry:4.5,fill:'#FFD700'},fg);
    el('animate',{attributeName:'ry',values:'4.5;7.5;4.5',dur:'.65s',repeatCount:'indefinite'},e3)}}
function drawCyl(g,cu,cv,r,h){const[cx,cy]=px(cu,cv,0);const ry=r*.5;
  el('ellipse',{cx,cy,rx:r+3,ry:ry+1.5,fill:'rgba(90,60,20,.15)',stroke:'none'},g);
  el('path',{d:`M ${cx-r},${cy-h} L ${cx-r},${cy} A ${r} ${ry} 0 0 0 ${cx+r},${cy} L ${cx+r},${cy-h} A ${r} ${ry} 0 0 1 ${cx-r},${cy-h} Z`,fill:PAL.copper[1],stroke:'rgba(90,60,20,.28)','stroke-width':'.8'},g);
  el('ellipse',{cx,cy:cy-h,rx:r,ry,fill:PAL.copper[0],stroke:'rgba(90,60,20,.28)','stroke-width':'.8'},g);
  el('ellipse',{cx,cy:cy-h,rx:r*.6,ry:ry*.6,fill:'#9CC8DE'},g)}
function partBox(part){if(part.cyl){const[cu,cv]=part.cyl;return[cu-.55,cv-.55,1.1,1.1,14,0]}
  const[u,v,w,d,h,zb]=part.p;return[u,v,w,d,h,zb]}
function drawPhases(g,part){const[u,v,w,d,h,zb]=partBox(part);
  const dirt=el('g',{style:'display:none'},g);
  poly(dirt,diamond(u,v,w,d,zb),'#CBB183',{stroke:'#A78D5C','stroke-dasharray':'4 3'});
  for(let i=0;i<4;i++){const ru=u+w*(0.2+0.6*((i*0.37)%1)),rv=v+d*(0.2+0.6*((i*0.61)%1));
    el('circle',{cx:px(ru,rv,zb)[0],cy:px(ru,rv,zb)[1],r:2.2,fill:'#A78D5C'},dirt)}
  const slab=el('g',{style:'display:none'},g);prism(slab,u,v,w,d,Math.min(3.5,h),zb,'stone');
  const frame=el('g',{style:'display:none'},g);prism(frame,u,v,w,d,Math.min(3.5,h),zb,'stone');
  for(const[cu,cv]of[[u,v],[u+w,v],[u,v+d],[u+w,v+d]]){
    const[x1,y1]=px(cu,cv,zb),[,y2]=px(cu,cv,zb+h);
    el('line',{x1,y1,x2:x1,y2,stroke:PAL.wood[1],'stroke-width':'2.4','stroke-linecap':'round'},frame)}
  el('polygon',{points:diamond(u,v,w,d,zb+h).map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),
    fill:'none',stroke:PAL.wood[1],'stroke-width':'2','stroke-dasharray':'5 4'},frame);
  return{dirt,slab,frame}}

let nightO=null;
function updateNight(){if(!nightO)return;const h=new Date().getHours();
  let fill='#1A2A52',op=0;
  if(h>=20||h<5){op=.34}
  else if(h<7){fill='#E8A25C';op=.15}
  else if(h>=17&&h<20){fill='#D97A3C';op=.17}
  nightO.setAttribute('fill',fill);nightO.setAttribute('opacity',op);
  nightO.style.display=op===0?'none':''}
function buildWorld(){const svg=$('world');
  makeGrads(svg);
  el('circle',{cx:96,cy:64,r:30,fill:'#FFF3B8',opacity:.9},svg);
  el('circle',{cx:96,cy:64,r:48,fill:'#FFF3B8',opacity:.28},svg);
  const clouds=el('g',{opacity:.92},svg);
  el('animateTransform',{attributeName:'transform',type:'translate',values:'0 0; 44 3; 0 0',dur:'70s',repeatCount:'indefinite'},clouds);
  for(const[cx,cy,s]of[[560,52,1],[200,90,.7],[646,120,.55]]){
    const c=el('g',{},clouds);
    el('ellipse',{cx,cy,rx:34*s,ry:12*s,fill:'#fff'},c);
    el('ellipse',{cx:cx+22*s,cy:cy+4*s,rx:24*s,ry:9*s,fill:'#fff'},c);
    el('ellipse',{cx:cx-24*s,cy:cy+5*s,rx:20*s,ry:8*s,fill:'#fff'},c)}
  for(const[dur,begin,yy]of[[26,'0s',0],[34,'-15s',34]]){
    const bird=el('g',{},svg);
    el('path',{d:'M0,0 Q4,-4 8,0 M8,0 Q12,-4 16,0',fill:'none',stroke:'#4A5A66','stroke-width':'1.6','stroke-linecap':'round'},bird);
    el('animateMotion',{path:`M -30,${74+yy} C 200,${58+yy} 480,${96+yy} 780,${64+yy}`,dur:dur+'s',begin,repeatCount:'indefinite'},bird)}
  el('path',{d:'M0,196 Q120,150 260,186 Q400,214 720,176 L720,300 L0,300 Z',fill:'#CDBD8E',opacity:.6,stroke:'none'},svg);
  el('path',{d:'M0,214 Q200,180 420,206 Q580,224 720,204 L720,320 L0,320 Z',fill:'#B9A878',opacity:.5,stroke:'none'},svg);
  const plat=el('g',{},svg);
  poly(plat,[px(0,16,0),px(16,16,0),px(16,16,-46),px(0,16,-46)],'#D0B47C');
  poly(plat,[px(16,0,0),px(16,16,0),px(16,16,-46),px(16,0,-46)],'#B29157');
  for(const zz of[-14,-28,-40]){
    el('line',{x1:px(0,16,zz)[0],y1:px(0,16,zz)[1],x2:px(16,16,zz)[0],y2:px(16,16,zz)[1],stroke:'rgba(90,60,20,.2)','stroke-width':'1'},plat);
    el('line',{x1:px(16,0,zz)[0],y1:px(16,0,zz)[1],x2:px(16,16,zz)[0],y2:px(16,16,zz)[1],stroke:'rgba(90,60,20,.18)','stroke-width':'1'},plat)}
  /* שערי חולדה — בכותל הדרומי של ההר */
  for(const[u1,u2]of[[5.0,5.8],[6.1,6.9],[9.6,10.4],[10.7,11.5],[11.8,12.6]]){
    faceRect(plat,u1,u2,16,-26,-6,'#6B532F');
    poly(plat,[px(u1,16,-6),px((u1+u2)/2,16,-1),px(u2,16,-6)],'#6B532F',{stroke:'none'})}
  poly(plat,diamond(0,0,16,16),'#E2D2A2');
  roughG=el('g',{},plat);
  for(let i=0;i<9;i++){const ru=1.5+((i*2.3+1.1)%13),rv=1.5+((i*3.1+2.4)%13);
    el('ellipse',{cx:px(ru,rv)[0],cy:px(ru,rv)[1]-2,rx:16,ry:7,fill:'#CBB183',opacity:.7},roughG)}
  paveG=el('g',{style:'display:none'},plat);
  poly(paveG,diamond(0,0,16,16),'#EFE2BC');
  poly(paveG,diamond(1.1,1.1,13.8,13.8),'#F5EBCA',{stroke:'rgba(90,60,20,.15)'});
  for(let i=3;i<=13;i+=2.5){
    el('line',{x1:px(i,1.4)[0],y1:px(i,1.4)[1],x2:px(i,14.6)[0],y2:px(i,14.6)[1],stroke:'rgba(120,95,50,.12)','stroke-width':'1'},paveG);
    el('line',{x1:px(1.4,i)[0],y1:px(1.4,i)[1],x2:px(14.6,i)[0],y2:px(14.6,i)[1],stroke:'rgba(120,95,50,.12)','stroke-width':'1'},paveG)}
  /* סטווים כפולים לאורך שולי ההר (צפון · מערב · מזרח) */
  const stoa=(uu,vv,ww,dd,horiz)=>{
    poly(paveG,diamond(uu,vv,ww,dd,11),'#F7EFD8',{stroke:'rgba(90,60,20,.2)'});
    const n=Math.floor((horiz?ww:dd)/1.35);
    for(let i=0;i<=n;i++){
      const cu=horiz?uu+0.25+i*1.35:uu+ww/2,cv=horiz?vv+dd/2:vv+0.25+i*1.35;
      if((horiz?cu+0.1:cv+0.1)>(horiz?uu+ww:vv+dd))break;
      const[sx,sy]=px(cu,cv,0),[,ty]=px(cu,cv,11);
      el('rect',{x:sx-1.1,y:ty,width:2.2,height:sy-ty,fill:PAL.white[1],stroke:'rgba(90,60,20,.25)','stroke-width':'.5'},paveG)}};
  stoa(0.25,0.25,15.5,0.85,true);
  stoa(0.25,1.2,0.85,13.5,false);
  stoa(14.9,1.2,0.85,13.5,false);
  /* הסטיו המלכותי — בסיליקה בדרום ההר */
  prism(paveG,0.6,14.0,14.8,1.45,3.5,0,'stone');
  for(const rv of[14.35,15.1])for(let cu=1.3;cu<15.1;cu+=1.25){
    const[sx,sy]=px(cu,rv,3.5),[,ty]=px(cu,rv,15);
    el('rect',{x:sx-1.4,y:ty,width:2.8,height:sy-ty,fill:PAL.white[0],stroke:'rgba(90,60,20,.3)','stroke-width':'.6'},paveG);
    el('ellipse',{cx:sx,cy:ty,rx:2.4,ry:1.1,fill:PAL.white[1]},paveG)}
  prism(paveG,0.5,13.9,15.0,1.65,2.5,15,'white');
  /* קהל עולי רגל בחצר הדרומית */
  for(let i=0;i<10;i++){const cu=2.5+((i*1.73+0.7)%11),cv=8.6+((i*2.31+1.2)%4.6);
    const[qx,qy]=px(cu,cv,0);
    el('ellipse',{cx:qx,cy:qy,rx:2.2,ry:1,fill:'rgba(90,60,20,.2)'},paveG);
    el('path',{d:`M${qx-2},${qy-1} Q${qx-2.3},${qy-7.5} ${qx},${qy-7.5} Q${qx+2.3},${qy-7.5} ${qx+2},${qy-1} Z`,
      fill:['#F6EEDA','#E8D9BC','#DCE7F2','#F0E3CE'][i%4],stroke:'#B49A6A','stroke-width':'.5'},paveG);
    el('circle',{cx:qx,cy:qy-9,r:1.8,fill:'#E8C49A',stroke:'#B08858','stroke-width':'.4'},paveG)}
  for(const[u,v]of[[-1.6,15.1],[16.6,14.6]]){const[tx,ty]=px(u,v,0);const t=el('g',{},svg);
    el('rect',{x:tx-2,y:ty-14,width:4,height:15,fill:'#8A6B3E',rx:1.5},t);
    el('ellipse',{cx:tx-6,cy:ty-19,rx:9,ry:7,fill:'#7FA95C'},t);
    el('ellipse',{cx:tx+6,cy:ty-20,rx:9,ry:7,fill:'#6E9A4E'},t);
    el('ellipse',{cx:tx,cy:ty-26,rx:9,ry:7,fill:'#8BB468'},t)}
  /* boulders (הר stage) */
  const bldrG=el('g',{},svg);
  BOULDERS.forEach(([bu,bv])=>{const[bx,by]=px(bu,bv,0);const b=el('g',{class:'mp'},bldrG);
    el('ellipse',{cx:bx,cy:by+2,rx:13,ry:5,fill:'rgba(90,60,20,.18)',stroke:'none'},b);
    el('ellipse',{cx:bx,cy:by-4,rx:11,ry:8,fill:'#B7A075',stroke:'#8F7A50','stroke-width':'1'},b);
    el('ellipse',{cx:bx-3,cy:by-7,rx:5,ry:3.5,fill:'#CBB88E',stroke:'none'},b);
    const crack=el('path',{d:`M ${bx-6},${by-9} L ${bx-2},${by-5} L ${bx-5},${by-1} M ${bx+2},${by-11} L ${bx+1},${by-5} L ${bx+5},${by-1}`,
      fill:'none',stroke:'#6B5A3A','stroke-width':'1.5','stroke-linecap':'round',style:'display:none'},b);
    const rb={g:b,crack,hp:2,gone:false,pt:[bx,by-5]};
    b.addEventListener('click',()=>{
      if(bState(0)==='building'&&!rb.gone)heroTap({rock:rb,pt:rb.pt});
      else if(bState(0)!=='done')openSheet('har')});
    rocks.push(rb)});
  /* dynamic parts */
  for(const part of SCENE){
    const g=el('g',{class:'mp'},svg);g.dataset.b=part.b;
    let fp,vg,ph;
    if(part.cyl){const[cu,cv,r,h]=part.cyl;
      fp=el('ellipse',{cx:px(cu,cv)[0],cy:px(cu,cv)[1],rx:r+4,ry:(r+4)*.5,class:'fp-locked'},g);
      ph=drawPhases(g,part);
      vg=el('g',{},g);drawCyl(vg,cu,cv,r,h)}
    else{const[u,v,w,d,h,zb]=part.p;
      fp=el('polygon',{points:diamond(u,v,w,d,zb).map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' '),class:'fp-locked'},g);
      ph=drawPhases(g,part);
      vg=el('g',{},g);prism(vg,u,v,w,d,h,zb,part.p[6],part.top);drawExtras(vg,part)}
    sceneParts.push({b:part.b,g,fp,vg,...ph});
    g.addEventListener('click',()=>{
      if(bState(IDX[part.b])==='building'){const go=GOFF[part.b];
        heroTap({bid:part.b,pt:px(go[0],go[1],0)})}
      else openSheet(part.b)});
    el('title',{},g).textContent=BLD[IDX[part.b]].n}
  /* workers walking */
  for(const[dur,begin]of[['46s','0s'],['46s','-23s']]){
    const wk=el('g',{},svg);
    el('ellipse',{cx:0,cy:-1,rx:3,ry:1.4,fill:'rgba(90,60,20,.25)'},wk);
    el('path',{d:'M-2.6,-2 Q-3,-10 0,-10 Q3,-10 2.6,-2 Z',fill:'#F6EEDA',stroke:'#B49A6A','stroke-width':'.7'},wk);
    el('circle',{cx:0,cy:-12,r:2.6,fill:'#E8C49A',stroke:'#B08858','stroke-width':'.6'},wk);
    el('animateMotion',{path:`M ${px(3,9).join(',')} L ${px(13,9).join(',')} L ${px(13,13).join(',')} L ${px(3,13).join(',')} Z`,dur,begin,repeatCount:'indefinite'},wk)}
  /* fire pillar */
  firePillar=el('g',{style:'display:none'},svg);
  const[fx,fy]=px(7.25,5.25,22);
  const fr=el('rect',{x:fx-4,y:20,width:8,height:fy-20,fill:'#FFF3B0',opacity:.55},firePillar);
  el('animate',{attributeName:'opacity',values:'.55;.2;.55',dur:'1.1s',repeatCount:'indefinite'},fr);
  /* dust puffs */
  puffs=el('g',{style:'display:none','pointer-events':'none'},svg);
  for(let i=0;i<3;i++){const c=el('circle',{cx:(i-1)*13,cy:0,r:4+i*1.5,fill:'#D9C9A2',opacity:'0'},puffs);
    el('animate',{attributeName:'cy',values:'0;-26',dur:'1.5s',begin:(i*.45)+'s',repeatCount:'indefinite'},c);
    el('animate',{attributeName:'opacity',values:'.8;0',dur:'1.5s',begin:(i*.45)+'s',repeatCount:'indefinite'},c)}
  /* chip */
  chip=el('g',{style:'display:none','pointer-events':'none'},svg);
  el('rect',{x:-40,y:-30,width:80,height:24,rx:12,fill:'#FFF9EA',stroke:'#CBB27A','stroke-width':'2'},chip);
  chipT=el('text',{x:0,y:-13,'text-anchor':'middle','font-size':'13','font-weight':'800',fill:'#5B4426'},chip);
  /* pin */
  pin=el('g',{id:'pin',style:'display:none','pointer-events':'none'},svg);
  el('path',{d:'M0,0 C -13,-16 -13,-34 0,-38 C 13,-34 13,-16 0,0 Z',fill:'#E8B33C',stroke:'#96690F','stroke-width':'2.5'},pin);
  el('text',{x:0,y:-21,'text-anchor':'middle','font-size':'14'},pin).textContent='🔨';
  /* hero — הבנאי */
  const[hx,hy]=px(8,10,0);hero.x=hx;hero.y=hy;
  hero.g=el('g',{style:`transform:translate(${hx}px,${hy}px)`,'pointer-events':'none'},svg);
  hero.flip=el('g',{},hero.g);
  el('ellipse',{cx:0,cy:1,rx:6.5,ry:2.6,fill:'rgba(90,60,20,.28)',stroke:'none'},hero.flip);
  const armG=el('g',{transform:'translate(3,-14)'},hero.flip);
  el('line',{x1:0,y1:0,x2:8,y2:5,stroke:'#E8C49A','stroke-width':'2.6','stroke-linecap':'round'},armG);
  el('line',{x1:8,y1:5,x2:14,y2:1,stroke:'#A97D49','stroke-width':'2.4','stroke-linecap':'round'},armG);
  el('path',{d:'M12,-3 L18,1 L15,5 L10,2 Z',fill:'#8F7A50',stroke:'#6B5A3A','stroke-width':'.8'},armG);
  hero.swingAnim=el('animateTransform',{attributeName:'transform',type:'rotate',
    values:'14 0 0; -96 0 0; 10 0 0',keyTimes:'0; .45; 1',dur:'0.27s',begin:'indefinite',additive:'sum'},armG);
  el('path',{d:'M-5,0 Q-6.4,-13 0,-14 Q6.4,-13 5,0 Z',fill:'#F6EEDA',stroke:'#B49A6A','stroke-width':'.9'},hero.flip);
  el('rect',{x:-5,y:-7,width:10,height:2.2,fill:'#A97D49',rx:1},hero.flip);
  el('circle',{cx:0,cy:-17.5,r:3.6,fill:'#E8C49A',stroke:'#B08858','stroke-width':'.7'},hero.flip);
  el('ellipse',{cx:0,cy:-20.6,rx:4.4,ry:2.4,fill:'#FFFDF4',stroke:'#CBB27A','stroke-width':'.8'},hero.flip);
  /* day-night tint (real clock) */
  nightO=el('rect',{x:0,y:0,width:720,height:548,fill:'#1A2A52',opacity:0,
    style:'mix-blend-mode:multiply;display:none','pointer-events':'none'},svg);
  updateNight()}
function place(elm,b,dz=0){const a=ANCHOR[b];const[x,y]=px(a[0],a[1],a[2]+dz);
  elm.setAttribute('transform',`translate(${x.toFixed(1)},${y.toFixed(1)})`)}
function paintScene(){
  const harSt=bState(0),harDone=harSt==='done';
  roughG.style.display=harDone?'none':'';
  paveG.style.display=harDone?'':'none';
  const goneTarget=stonesCleared();
  let need=goneTarget-rocks.filter(r=>r.gone).length;
  let odd=((G.b.har&&G.b.har.w)||0)%2===1&&!rocks.some(r=>!r.gone&&r.hp===1);
  rocks.forEach(rb=>{
    if(harDone||rb.gone){rb.g.style.display='none';return}
    if(need>0){rb.gone=true;rb.hp=0;rb.g.style.display='none';need--;return}
    rb.g.style.display='';
    if(odd&&rb.hp>1){rb.hp=1;rb.crack.style.display='';odd=false}
    rb.g.classList.toggle('boulder-hot',harSt==='building')});
  let availB=null,buildingB=null;
  if(harSt==='avail')availB='har';
  if(harSt==='building')buildingB='har';
  for(const sp of sceneParts){const i=IDX[sp.b],st=bState(i);
    const prev=prevStates[sp.b];
    sp.dirt.style.display='none';sp.slab.style.display='none';sp.frame.style.display='none';
    if(st==='locked'){sp.fp.style.display=harDone?'':'none';sp.fp.setAttribute('class','fp-locked');sp.vg.style.display='none'}
    else if(st==='avail'){availB=availB||sp.b;sp.fp.style.display='';sp.fp.setAttribute('class','fp-avail');sp.vg.style.display='none'}
    else if(st==='building'){buildingB=sp.b;sp.fp.style.display='none';sp.vg.style.display='none';
      const ph=phaseOf(i);
      if(ph===0)sp.dirt.style.display='';
      else if(ph===1)sp.slab.style.display='';
      else sp.frame.style.display=''}
    else{sp.fp.style.display='none';sp.vg.style.display='';
      if(prev&&prev!=='done'){sp.vg.classList.remove('popin');void sp.vg.getBBox;sp.vg.classList.add('popin')}}}
  for(const b of Object.keys(ANCHOR))if(IDX[b]!==undefined)prevStates[b]=bState(IDX[b]);
  if(buildingB){place(chip,buildingB,16);chip.style.display='';
    const bb=BLD[IDX[buildingB]];
    chipT.textContent=buildingB==='har'?('⛏ '+stonesCleared()+'/12'):('🔨 '+(G.b[buildingB].w||0)+'/'+bb.work);
    place(puffs,buildingB,-6);puffs.style.display=''}
  else{chip.style.display='none';puffs.style.display='none'}
  if(availB&&!buildingB){place(pin,availB,14);pin.style.display=''}else pin.style.display='none';
  firePillar.style.display=G.celeb?'':'none'}

/* ════ HUD ════ */
function renderRes(){$('rrow').innerHTML=Object.entries(RES).map(([k,[ic]])=>
  `<span class="rc" id="rc-${k}">${ic} <b>${Math.floor(G.res[k]||0)}</b></span>`).join('')}
function flash(k){const e=$('rc-'+k);if(e){e.classList.remove('flash');void e.offsetWidth;e.classList.add('flash')}}
function gain(r,v){G.res[r]=(G.res[r]||0)+v;renderRes();flash(r)}
function renderProg(){const d=doneCount();$('prog-t').textContent=d+'/'+BLD.length;$('prog-f').style.width=(d/BLD.length*100)+'%'}

/* ════ goal ════ */
function costStr(cost){return Object.entries(cost).map(([k,v])=>{
  const lack=(G.res[k]||0)<v?' class="lack"':'';return `<span${lack}>${v}${RES[k][0]}</span>`}).join(' · ')}
function currentTarget(){for(let i=0;i<BLD.length;i++){const st=bState(i);
  if(st==='building')return{i,st};if(st==='avail')return{i,st}}return null}
function renderGoal(){const g=$('goal');const t=currentTarget();
  if(!t){g.innerHTML=`<span class="gi">🎉</span><div class="gt"><div class="gl">הבית שלם!</div>
    <div class="gn">עבור לעבודת הקודש</div><div class="gc">קרבן התמיד מחכה לך</div></div>`;return}
  const b=BLD[t.i];
  if(t.st==='building'){const st=G.b[b.id];const ph=phaseOf(t.i);
    const har=b.id==='har';
    g.innerHTML=`<span class="gi">🔨</span><div class="gt"><div class="gl">${har?'שלח את הבנאי לסלעים — שתי מכות מפצחות סלע!':'הקש על אתר הבנייה — הבנאי יעבוד!'}</div>
      <div class="gn">${b.n}</div><div class="gc">${har?'סלעים שפוצחו':PHASES[ph]} · <b id="goal-w">${har?stonesCleared():st.w||0}</b>/${har?12:b.work}</div></div>
      <span style="font-size:22px">👆</span>`}
  else g.innerHTML=`<span class="gi">${b.i}</span><div class="gt"><div class="gl">היעד הבא · ${t.i+1}/${BLD.length}</div>
      <div class="gn">${b.n}</div><div class="gc">${costStr(b.cost)}</div></div>
      <span style="font-size:22px">◀</span>`}
function goalClick(){const t=currentTarget();if(!t){sw('av');return}
  if(t.st==='building'){sw('world')}else openSheet(BLD[t.i].id)}

/* ════ sheet ════ */
let sheetB=null;
function openSheet(bid){sheetB=bid;renderSheet();$('ov-b').classList.add('on')}
function closeSheet(){sheetB=null;$('ov-b').classList.remove('on')}
function renderSheet(){if(!sheetB)return;const i=IDX[sheetB],b=BLD[i],st=bState(i);
  let body='';
  if(st==='building'){const s=G.b[b.id];const pct=Math.min(100,(s.w||0)/b.work*100);
    body=`<div class="sh-timer"><span class="cnt"><b id="sh-w">${s.w||0}</b>/${b.work}</span>
      <div class="tprog"><div class="tfill" id="sh-tf" style="width:${pct}%"></div></div></div>
      <div class="sh-tap">👆 ${b.id==='har'?'לחץ על סלע במפה — הבנאי ירוץ ויפצח אותו!':'לחץ על אתר הבנייה במפה — הבנאי יעבוד!'}</div>`}
  else if(st==='done')body=`<div class="sh-done">✓ הושלם${b.prod?` · מייצר +${b.prod[1]} ${RES[b.prod[0]][1]} לדקה`:''}</div>`;
  else if(st==='avail'){const ok=canAfford(b.cost);
    body=`<div class="sh-cost">עלות: ${costStr(b.cost)} · 🔨 ${b.work} הקשות</div>
      ${b.prod?`<div class="sh-prod">בסיום: +${b.prod[1]} ${RES[b.prod[0]][1]} לדקה</div>`:''}
      <button class="gbtn" style="width:100%" onclick="startBuild(${i})" ${ok?'':'disabled'}>${ok?'🔨 &nbsp;התחל בנייה':'חסרים משאבים'}</button>`}
  else body=`<div class="sh-cost">🔒 נעול — השלם קודם את: <b>${BLD[i-1].n}</b></div>`;
  $('sheet-body').innerHTML=`
    <div class="sh-head"><span class="sh-ico">${b.i}</span>
      <div><div class="sh-name">${b.n}</div><div class="sh-num">שלב ${i+1} מתוך ${BLD.length}</div></div>
      <button class="mx" onclick="closeSheet()" aria-label="סגור">✕</button></div>
    <div class="sh-hal">${b.h}<span class="src">📜 מקור: ${b.src}</span></div>${body}`}

/* ════ avodah ════ */
let demoWin=false,stepLeft=0,curStep=-1;
function inWindow(){if(demoWin)return true;const h=new Date().getHours();return h>=5&&h<12}
function todayStr(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function nextWinCd(){const now=new Date();const nxt=new Date(now);
  nxt.setHours(5,0,0,0);if(now.getHours()>=5)nxt.setDate(nxt.getDate()+1);
  return Math.floor((nxt-now)/1000)}
function fmtHMS(s){return [3600,60,1].map(u=>String(Math.floor(s/u)%(u===3600?24:60)).padStart(2,'0')).join(':')}
function renderAv(){const el2=$('av-inner');
  if(!mizbeachDone()){el2.innerHTML=`<div class="locked-av"><div class="big">🔒</div>
    <h3>אין עבודה בלא מזבח</h3><p>השלם את ארבעת שלבי המזבח — יסוד, סובב, גוף וקרנות —<br>ושערי העבודה ייפתחו.</p>
    <button class="gbtn gold" style="margin-top:14px" onclick="sw('world')">🏗 &nbsp;לעולם הבנייה</button></div>`;return}
  if(G.svc.date!==todayStr()){G.svc.date=todayStr();G.svc.step=0}
  const now=new Date();
  const clock=`<div class="clock" id="avclock">${fmtHMS(now.getHours()*3600+now.getMinutes()*60+now.getSeconds())}</div>
    <div class="dt">שעון המקדש · זמן אמיתי</div>`;
  if(G.svc.step>=TAMID.length){el2.innerHTML=`<div class="panel">${clock}
    <div class="pcard donebox"><h3>✓ תמיד של שחר הוקרב היום</h3>
    <p>ריח ניחוח עלה. סה״כ תמידים: <b style="color:var(--goldD)">${G.svc.count}</b><br>העבודה הבאה — מחר עם עלות השחר.</p></div></div>`;return}
  if(!inWindow()){el2.innerHTML=`<div class="panel">${clock}
    <div class="pcard wait"><h3>זמן התמיד של שחר — מעלות השחר עד חצות היום</h3>
    <div class="cd" id="wincd">${fmtHMS(nextWinCd())}</div>
    <p style="margin-top:8px">עד פתיחת חלון העבודה הבא (05:00)</p>
    <button class="gbtn ghost" style="margin-top:12px" onclick="demoWin=true;renderAv()">⏵ מצב הדגמה — פתח עכשיו</button></div></div>`;return}
  const steps=TAMID.map((s,i)=>{const past=i<G.svc.step,act=i===G.svc.step;
    let a='';
    if(act)a=s.mg?`<button class="kbtn mg" onclick="openK()">🌿 פתח את מיני-משחק הקטורת ▶</button>`
      :`<button class="kbtn" id="stepbtn" onclick="tapStep()">🔨 עבוד! (5)</button>`;
    return `<div class="step ${act?'act':''} ${past?'past':''}">
      <div class="sn">${past?'✓':i+1}</div>
      <div class="sb"><div class="sname">${s.i} ${s.n}</div><div class="sdesc">${s.d}</div>
      ${s.p?`<div class="spas">${s.p}</div>`:''}${a}</div></div>`}).join('');
  el2.innerHTML=`<div class="panel">${clock}
    <div class="pcard"><h3>🌅 תמיד של שחר</h3><div class="win">קרבן הציבור הראשון · בוצע ${G.svc.count} פעמים</div>
    <p>שני כבשים בני שנה ליום — אחד בבוקר ואחד בין הערביים. עיקר עבודת המקדש, יום אחר יום.</p></div>${steps}</div>`;
  stepLeft=5;curStep=G.svc.step}
function tapStep(){const btn=$('stepbtn');if(!btn)return;
  stepLeft--;sparkle(innerWidth/2,innerHeight*.5,4);
  if(stepLeft<=0){advanceStep(TAMID[curStep]);return}
  btn.textContent=`🔨 עבוד! (${stepLeft})`}
function advanceStep(s){G.svc.step++;
  sparkle(innerWidth/2,innerHeight*.45,10);
  if(G.svc.step>=TAMID.length){G.svc.count++;gain('g',5);gain('si',3);
    toast('🔥','הקרבן הושלם!','ריח ניחוח עלה — ‎+5✨ ‎+3🪙')}
  else toast(s.i,s.n+' — הושלם','המשך לשלב הבא');
  save();renderAv()}

/* ════ ketoret ════ */
let kSel=new Set(),kDone=false,kOrder=[];
function openK(){kSel=new Set();kDone=false;
  kOrder=SAM.map((_,i)=>i).sort(()=>Math.random()-.5);
  renderK();$('ov-k').classList.add('on')}
function closeK(){$('ov-k').classList.remove('on')}
function renderK(){$('smg').innerHTML=kOrder.map(i=>{const[n,ic,q]=SAM[i];
  return `<button class="sm" id="sm-${i}" onclick="pickSam(${i})">
    <div class="i">${ic}</div><div class="n">${n}</div><div class="q">${q} מנה</div></button>`}).join('');
  $('kres').textContent=''}
function pickSam(i){if(kDone)return;const e=$('sm-'+i);const ok=SAM[i][3]===1;
  if(kSel.has(i)){kSel.delete(i);e.classList.remove('sel');return}
  if(!ok){e.classList.add('wr');kDone=true;
    $('kres').innerHTML='<span style="color:var(--red)">❌ סממן זר! הקטורת נפסלה — נסה שוב.</span>';
    setTimeout(()=>{kDone=false;kSel.clear();renderK()},1800);return}
  kSel.add(i);e.classList.add('sel');
  if(kSel.size>=11){kDone=true;
    kSel.forEach(j=>$('sm-'+j).classList.add('rt'));
    $('kres').innerHTML='<span style="color:var(--greenD)">✓ מושלם! קטורת כשרה — בד בבד!</span>';
    setTimeout(()=>{closeK();gain('g',5);
      toast('🌿','קטורת כשרה!','כל 11 הסממנים — ‎+5✨');
      G.svc.step++;save();renderAv()},1500)}}

/* ════ quiz ════ */
function renderQuiz(){$('qlist').innerHTML=QUIZ.map((q,qi)=>{const solved=G.quiz[qi];
  return `<div class="pcard qcard ${solved?'solved':''}" id="qc-${qi}">
    <div class="qq">${qi+1}. ${q.q}</div>
    <div class="qopts">${q.o.map((o,oi)=>
      `<button class="qo ${solved&&oi===q.a?'right':''}" onclick="answerQ(${qi},${oi})" ${solved?'disabled':''}>${o}</button>`).join('')}</div>
    <div class="qexp ${solved?'on':''}" id="qe-${qi}">${q.e}<span class="src">מקור: ${q.src}</span></div></div>`}).join('')}
function answerQ(qi,oi){if(G.quiz[qi])return;const q=QUIZ[qi];
  const card=$('qc-'+qi);const btns=card.querySelectorAll('.qo');
  if(oi===q.a){G.quiz[qi]=true;btns[oi].classList.add('right');
    btns.forEach(b=>b.disabled=true);
    $('qe-'+qi).classList.add('on');card.classList.add('solved');
    gain('g',10);save();sparkle(innerWidth/2,innerHeight/2,8);
    toast('📜','נכון מאוד!','‎+10✨ — הידע הזה שלך לתמיד')}
  else{btns[oi].classList.add('wrong');setTimeout(()=>btns[oi].classList.remove('wrong'),900)}}

/* ════ celebration ════ */
let fwRaf=null,fwPts=[];
function maybeCeleb(){if(doneCount()>=BLD.length&&!G.celeb){G.celeb=true;save();paintScene();setTimeout(celebrate,600)}}
function celebrate(){$('celeb').classList.add('on');
  const fc=$('fw');fc.width=innerWidth;fc.height=innerHeight;
  const ctx=fc.getContext('2d');let t=0;fwPts=[];
  function launch(){const x=60+Math.random()*(innerWidth-120),y=40+Math.random()*(innerHeight*.5);
    const hue=Math.random()*55+30;
    for(let i=0;i<70;i++){const a=Math.random()*Math.PI*2,sp=Math.random()*6.5+2;
      fwPts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,hue})}}
  launch();launch();
  (function draw(){ctx.fillStyle='rgba(12,7,0,.16)';ctx.fillRect(0,0,fc.width,fc.height);
    if(++t%20===0&&t<300)launch();
    for(const p of fwPts){p.x+=p.vx;p.y+=p.vy;p.vy+=.11;p.life-=.012;
      ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=`hsl(${p.hue},92%,64%)`;
      ctx.beginPath();ctx.arc(p.x,p.y,2,0,7);ctx.fill()}
    ctx.globalAlpha=1;fwPts=fwPts.filter(p=>p.life>0);
    fwRaf=requestAnimationFrame(draw)})()}
function endCeleb(){$('celeb').classList.remove('on');cancelAnimationFrame(fwRaf);fwPts=[];sw('av')}

/* ════ fx ════ */
let toastT=null;
function toast(i,t,b){$('t-i').textContent=i;$('t-t').textContent=t;$('t-b').textContent=b;
  const e=$('toast');e.classList.add('on');clearTimeout(toastT);
  toastT=setTimeout(()=>e.classList.remove('on'),4200)}
function sparkle(x,y,n){for(let i=0;i<n;i++){const p=document.createElement('div');p.className='pt';
  const a=i/n*Math.PI*2,d=45+Math.random()*70;
  p.style.cssText=`left:${x}px;top:${y}px;width:${3+Math.random()*4}px;height:${3+Math.random()*4}px;background:${['#F8D75E','#FF8A2A','#FFF3A0','#E8B33C'][i%4]}`;
  p.style.setProperty('--dx',Math.cos(a)*d+'px');p.style.setProperty('--dy',Math.sin(a)*d+'px');
  document.body.appendChild(p);setTimeout(()=>p.remove(),1300)}}
function floatTxt(txt,x,y){const e=document.createElement('div');e.className='flt';e.textContent=txt;
  e.style.left=(x-30)+'px';e.style.top=y+'px';document.body.appendChild(e);setTimeout(()=>e.remove(),1000)}

/* ════ nav ════ */
function sw(t){document.querySelectorAll('.pane').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('on'));
  $('p-'+t).classList.add('on');$('nb-'+t).classList.add('on');
  if(t==='av')renderAv();if(t==='qz')renderQuiz();if(t==='sup')renderSup();
  if(t==='world'){paintScene();renderGoal()}}
function goSplash(){save();$('s1').classList.remove('on');$('s0').classList.add('on');checkWB()}
function startGame(){$('s0').classList.remove('on');$('s1').classList.add('on');
  renderRes();renderProg();paintScene();renderGoal();sw('world');updateSupBadge();dailyGift();
  const ww=$('worldwrap');ww.scrollLeft=(760-ww.clientWidth)/2}
function newGame(){G=fresh();save();prevStates={};
  rocks.forEach(rb=>{rb.hp=2;rb.gone=false;rb.g.style.display='';rb.crack.style.display='none'});
  startGame();
  setTimeout(()=>toast('⛰','ברוך הבא!','קודם כל — משטחים את ההר. לחץ על הסמן הזהוב!'),600)}

/* ════ welcome back ════ */
function checkWB(){const rep=offlineReport();const wb=$('wb');
  if(!rep){wb.classList.remove('on');return}
  const mins=Math.round(rep.away/60);
  $('wb-p').textContent=(mins>=60?`נעדרת ${Math.floor(mins/60)} שעות ו-${mins%60} דקות`:`נעדרת ${mins} דקות`)+' — והעולם המשיך בלעדיך:';
  $('wb-chips').innerHTML=[
    ...rep.back.map(e=>`<span class="chip">${e.i} ${e.n} חזרה!</span>`),
    ...Object.entries(rep.gains).filter(([,v])=>v>=1).map(([r,v])=>`<span class="chip">+${Math.floor(v)} ${RES[r][0]}</span>`)
  ].join('');
  wb.classList.add('on');save()}
function dailyGift(){const t=todayStr();if(G.daily.last===t)return;
  const y=new Date(Date.now()-86400000);
  const ys=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate();
  G.daily.streak=G.daily.last===ys?(G.daily.streak||0)+1:1;
  G.daily.last=t;
  const mult=Math.min(G.daily.streak,7);
  gain('s',20*mult);gain('g',5*mult);save();
  setTimeout(()=>toast('🎁',`מתנת היום — יום ${G.daily.streak} ברצף!`,`+${20*mult}🪨 +${5*mult}✨ · חזור מחר להגדלת הרצף`),1200)}

/* ════ tick ════ */
setInterval(()=>{if(!G)return;
  applyPassive();
  const back=settleExp();
  if(!$('s1').classList.contains('on'))return;
  renderRes();
  if(back.length){updateSupBadge();
    toast('⛵',back[0].n+' חזרה!','עבור למשלחות ואסוף את השלל');
    if($('p-sup').classList.contains('on'))renderSup()}
  for(const e of EXP){const st=G.exp[e.id];
    if(st&&st.endsAt){const cd=$('exp-cd-'+e.id),tf=$('exp-tf-'+e.id);
      const rem=Math.max(0,st.endsAt-Date.now());
      if(cd)cd.textContent=fmtDur(rem);
      if(tf)tf.style.width=Math.min(100,(1-rem/(e.hrs*3600000))*100)+'%'}}
  updateNight();
  const ac=$('avclock');if(ac){const n=new Date();ac.textContent=fmtHMS(n.getHours()*3600+n.getMinutes()*60+n.getSeconds())}
  const wc=$('wincd');if(wc)wc.textContent=fmtHMS(nextWinCd())},1000);

/* ════ boot ════ */
function boot(){load();buildWorld();checkWB();
  $('startBtn').textContent=doneCount()>0?'▶  המשך בנייה':'▶  בנה את הבית'}
if(window.claude&&window.claude.hot&&window.claude.hot.ready){window.claude.hot.ready(boot)}else{boot()}
</script>
