/* kings/css.js — the stylesheet of the courts and the chart (injected once; everything under .kg). Light/dark tokens. */
const LIGHT = '--kf:"Frank Ruhl Libre",serif;--kh:"Heebo",system-ui,sans-serif;--ki:#2A2016;--ks:#6B5A45;--kb:#EFE4CE;--kc:#FBF6EC;--kp:#FFF9EC;--kl:rgba(120,92,52,.24);'
  + '--kgo:#855E14;--kgh:#E8B94A;--kr:#9E2B25;--ko:#276B43;--kbl:#1F4F7A;--kha:#F6ECD6;'
  + '--ks1:#B4D3CE;--ks2:#86B5B4;--kd:#3F7A80;--ksi:#2E5E63;--kl1:#F3E5C6;--kl2:#DCC49A;--kco:#5B4630;--krs:#2F5D78;';
const DARK = '--ki:#F3E9D6;--ks:#C2B195;--kb:#1A1510;--kc:#262019;--kp:#2C241A;--kl:rgba(232,200,150,.2);'
  + '--kgo:#E4B656;--kgh:#F2CF77;--kr:#E0675F;--ko:#6CC592;--kbl:#93BCEA;--kha:#2A2219;'
  + '--ks1:#24414A;--ks2:#1B323A;--kd:#6FA6AE;--ksi:#9CC7CB;--kl1:#3B3226;--kl2:#2A231A;--kco:#C9B28A;--krs:#8FC3E0;';
export const CSS = `
.kg{${LIGHT}position:fixed;inset:var(--ktop,0px) 0 0;z-index:60;display:flex;flex-direction:column;background:var(--kb);color:var(--ki);direction:rtl;font-family:var(--kh);pointer-events:auto;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;overflow:hidden}
.kg.kdk{${DARK}}
.kg *{box-sizing:border-box}
.krow,.kbanner,.ksay,.koffer,.kvoy,.kletter,.kbtn{border:1px solid var(--kl);background:var(--kc)}
.kbanner,.ksay,.koffer,.kvoy,.kletter{margin:8px 12px;padding:12px;border-radius:14px}
.ksay,.kvoy,.kletter,.kpaper{background:var(--kp)}
.ktop{display:flex;align-items:center;gap:8px;padding:6px 10px;padding-top:max(6px,env(safe-area-inset-top,0px));min-height:56px;border-bottom:1px solid var(--kl);flex:none}
.ktop h2{flex:1;margin:0;font:700 20px/1.1 var(--kf);min-width:0}
.ktop h2 small{display:block;font:500 12px var(--kh);color:var(--ks);margin-top:2px}
.kbtn{min-width:44px;min-height:44px;border-radius:12px;color:var(--ki);font:600 15px var(--kh);display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 12px;cursor:pointer}
.kbtn:disabled{opacity:.55}
.kpri{background:linear-gradient(#EDC25A,#C9962B);color:#2A1A06;border-color:#9A7016}
.kx{font-size:22px;padding:0}
.kbody{flex:1;overflow-y:auto;overscroll-behavior:contain;padding-bottom:max(12px,env(safe-area-inset-bottom,0px));padding-inline:max(0px,calc((100% - 620px)/2))}
.kchart{display:block;width:100%;height:auto;max-height:48vh;background:var(--kl2)}
.khatch{fill:none;stroke:var(--kd);stroke-width:10;opacity:.13}
.kcoast{fill:none;stroke:var(--kco);stroke-width:1.1;stroke-linejoin:round}
.klake{fill:var(--ks1);stroke:var(--kco);stroke-width:.7}.kriver path{fill:none;stroke:var(--kd);stroke-width:1.2;opacity:.7;stroke-linecap:round}
.kcedar path{fill:#4F7A45}
.kwn{font:italic 500 9px var(--kf);fill:var(--ksi);text-anchor:middle}.kbig{font-size:16px;letter-spacing:1px}.kland{fill:var(--ks)}
.kroute{fill:none;stroke-linecap:round;stroke-linejoin:round}.kroute.ksea{stroke:var(--krs);stroke-width:1.4;stroke-dasharray:5 4;opacity:.8}
.kroute.kroad{stroke:#9A6634;stroke-width:1.6;stroke-dasharray:1.5 3.5}.kroute.kcart{stroke:#9A6634;stroke-width:1.3;stroke-dasharray:4 3}
.kroute.khl{stroke:var(--kgh);stroke-width:3;opacity:1}
.kdot{fill:var(--kco)}.klead{stroke:var(--kco);stroke-width:.9;stroke-dasharray:2 2}
.klbl,.kvt{fill:var(--ki);text-anchor:middle;paint-order:stroke;stroke:var(--kha);stroke-width:3px;stroke-linejoin:round}.klbl{font:600 10px var(--kh)}
.ksm{font-size:9px;font-weight:500}.kpl{font:700 11.5px var(--kf)}
.kpin{cursor:pointer}.khit{fill:transparent}.kpinc{fill:var(--kc);stroke:var(--kgo);stroke-width:2}.kemb{fill:var(--kr)}
.kring,.kvb{transform-box:fill-box;transform-origin:center}.kring{fill:none;stroke:var(--kgh);stroke-width:2.2;opacity:0}
.kpin.kbusy .kring{opacity:.8;stroke-dasharray:3 3}.kpin.karrp .kring{opacity:1;animation:kgpulse 1.4s ease-in-out infinite}.kpin.klock{opacity:.5}
.khomec{fill:var(--kgo);stroke:var(--kha);stroke-width:1.5}
.kframe{fill:none;stroke:var(--kco);stroke-width:1.2;opacity:.55}
.kvt{font:700 9.5px var(--kh)}
.kv.karr .kvb{animation:kgpulse 1.4s ease-in-out infinite}
@keyframes kgpulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:.3}}
.klist{list-style:none;margin:0;padding:8px 10px 4px;display:flex;flex-direction:column;gap:8px}
.krow{display:flex;align-items:center;gap:10px;min-height:66px;padding:8px 10px;border-radius:14px;cursor:pointer;width:100%;text-align:right;color:inherit;font:inherit}
.krow.khot{border-color:var(--kgh);box-shadow:0 0 0 2px rgba(232,185,74,.35)}
.krow .kseal{width:44px;height:44px;flex:none;color:var(--ks)}.kseal svg{width:100%;height:100%;display:block}
.kmid{flex:1;min-width:0}.kmid b{font:700 16px var(--kf);display:block}.kmid small{display:block;font-size:13px;color:var(--ks);margin-top:2px}
.kpips{display:inline-flex;gap:3px;vertical-align:middle}.kpips i{width:8px;height:8px;border-radius:50%;border:1.3px solid var(--kgo);display:block}.kpips i.on{background:var(--kgo)}
.kchip{display:inline-block;font:600 11px var(--kh);padding:2px 7px;border-radius:999px;border:1px solid var(--kl);color:var(--ks);white-space:nowrap}
.kdraft{color:var(--kr);border-color:rgba(158,43,37,.35)}.killus{color:var(--kbl);border-color:rgba(31,79,122,.35)}.know{color:#2A1A06;background:var(--kgh);border-color:var(--kgo)}
.kbanner{margin-bottom:0;font-size:14px;line-height:1.45;display:flex;gap:10px;align-items:center}
.kbanner b{font-family:var(--kf)}.kbanner .kbtn{flex:none}
.ksheet{position:absolute;inset:0;background:var(--kb);display:flex;flex-direction:column;transform:translateY(102%);transition:transform .28s ease;z-index:3}
.ksheet.kopen{transform:none}
.khead{display:flex;gap:12px;padding:12px 12px 4px;align-items:flex-end}
.kportrait{width:120px;height:140px;flex:none;filter:drop-shadow(0 6px 10px rgba(40,28,12,.25))}.kportrait svg{width:100%;height:100%;display:block}
.kwho{flex:1;min-width:0;padding-bottom:6px}.kwho h3{margin:0;font:700 21px/1.2 var(--kf)}.kwho p{margin:4px 0 0;font-size:13px;color:var(--ks)}
.krel{margin-top:8px;font-size:13px}.krel .kpips{margin-inline-start:6px}
.ksay p{margin:0 0 6px;font:500 16px/1.45 var(--kf)}.ksay p::before{content:"״";color:var(--kgo);margin-inline-end:2px}
.ksec{margin:14px 12px 4px;font:700 13px var(--kh);color:var(--ks)}
.koffer h4{margin:0 0 4px;font:700 17px var(--kf);display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.koffer p{margin:0 0 8px;font-size:13.5px;color:var(--ks);line-height:1.4}
.kterms{display:flex;gap:12px;align-items:center;margin:6px 0 10px;font:700 15px var(--kh);flex-wrap:wrap}
.kterms span{display:inline-flex;align-items:center;gap:4px}.kterms svg{width:18px;height:18px;flex:none}.kterms .kt{color:var(--ks);font-weight:600}
.koffer .kbtn{width:100%}.koffer.koff{opacity:.66}.kwhy{font-size:13px;color:var(--ks);text-align:center;margin-top:6px}
.kvoy{border:1.5px solid var(--kgh)}
.kbar{height:8px;border-radius:4px;background:var(--kl);overflow:hidden;margin:8px 0}.kbar i{display:block;height:100%;background:linear-gradient(90deg,var(--kgh),var(--kgo))}
.kfacts{margin:4px 12px 16px}.kfact{padding:8px 0;border-top:1px solid var(--kl);font-size:14px;line-height:1.5}
.kq{display:block;font:500 16px/1.6 var(--kf);margin-bottom:2px}.kref{display:block;font-size:12px;color:var(--ks);margin-top:3px}
.kmodal{position:absolute;inset:0;background:rgba(24,18,10,.55);display:flex;align-items:flex-end;justify-content:center;z-index:6;padding:12px;padding-bottom:max(12px,env(safe-area-inset-bottom,0px))}
.kpaper{width:100%;max-width:440px;max-height:100%;overflow-y:auto;border-radius:18px;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,.35);border:1px solid var(--kl)}
.kpaper h3{font:700 21px/1.25 var(--kf);margin:0 0 10px;text-align:center}
.kdl{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin:0 0 10px;font-size:15px}.kdl dt{color:var(--ks)}.kdl dd{margin:0;font-weight:700;display:flex;align-items:center;gap:4px}.kdl svg{width:18px;height:18px}
.knote{font-size:13.5px;line-height:1.45;color:var(--ks);margin:0 0 10px}
.kacts{display:flex;gap:8px}.kacts .kbtn{flex:1}
.kstamp{width:92px;height:92px;margin:4px auto 8px;display:block}.kpress{animation:kgstamp .5s cubic-bezier(.2,1.6,.4,1) both}
@keyframes kgstamp{0%{transform:scale(2.2) rotate(-18deg);opacity:0}60%{transform:scale(.92) rotate(3deg);opacity:1}100%{transform:none;opacity:1}}
.kcrates{display:flex;justify-content:center;gap:6px;margin:6px 0 10px;flex-wrap:wrap}.kcrate{width:40px;height:40px;border-radius:8px;background:#B98A55;border:2px solid #7A5530;display:flex;align-items:center;justify-content:center}.kcrate svg{width:24px;height:24px}
.kgain{font:800 26px var(--kh);text-align:center;margin:0 0 8px;display:flex;justify-content:center;gap:14px;flex-wrap:wrap}.kgain span{display:inline-flex;align-items:center;gap:6px}.kgain svg{width:26px;height:26px}
.kfly{position:fixed;width:30px;height:30px;z-index:90;pointer-events:none;transition:transform .75s cubic-bezier(.3,.7,.3,1),opacity .75s}
.kup{text-align:center;font:700 15px var(--kh);color:var(--ko);margin:6px 0}
.kletter{font:500 15.5px/1.55 var(--kf)}
.kletter b{display:block;font:700 13px var(--kh);color:var(--kgo);margin-bottom:4px}
.kstory h3{margin:6px 0 4px;font:800 19px var(--kh)}.kstory>p{margin:0 0 8px;font:500 15.5px/1.5 var(--kf)}
.kstory-who{display:flex;gap:10px;align-items:flex-start}.kstory-who .kportrait{width:84px;height:98px}.kstory-who .ksay{flex:1;margin:0}
.kstory .ksay p{opacity:0;animation:kin .5s ease-out forwards}
@keyframes kin{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.kg *,.kfly{animation:none!important;transition:none!important}.kstory .ksay p{opacity:1}}
`;
