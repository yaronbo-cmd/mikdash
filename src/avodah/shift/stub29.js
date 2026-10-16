// ── shift29 ── stub29.js — a stand-in for SHIFT29B's world modules (pilgrims / stations / camera / walk) on their posted signatures,
// so the engine runs in the browser before s29-world is merged: DOM chips only, no figures; an act resolves after 800 ms, quality 1.
// index.js uses the real modules when they are present (the merge); this file is then only the tests' fallback.
const GATE = { x: -6, y: 16, z: 0 };
export const STUB_STATIONS = {
  kiyor: { at: { x: -57, y: 16, z: 14.2 }, stand: { x: -54, z: 14.2 }, verb: 'hold', label: 'קידוש ידיים', icon: '💧' },
  rings: { at: { x: -50, y: 16, z: -36 }, stand: { x: -50, z: -33 }, verb: 'tapBeat', label: 'השחיטה', icon: '⭕' },
  altar: { at: { x: -22, y: 16, z: 3 }, stand: { x: -17, z: 3 }, verb: 'drag', label: 'הזריקה לפינה', icon: '🔥' },
  duchan: { at: { x: -13.5, y: 16, z: -6 }, stand: { x: -14, z: -9 }, verb: 'tapBeat', label: 'הקן', icon: '🕊' },
  seals: { at: { x: -20, y: 16, z: -20 }, stand: { x: -20, z: -17 }, verb: 'tapRight', label: 'החותם הנכון', icon: '🔖' },
};
const ROUTES = { olah: ['kiyor', 'rings', 'altar'], ken: ['kiyor', 'duchan', 'altar'], mincha: ['kiyor', 'seals', 'altar'] };
const ICONS = { olah: '🐑', ken: '🕊', mincha: '🌾' };
export function stubPilgrims({ world, view, root, onTap } = {}) {
  const doc = document, L = []; let n = 0;
  const hp = { x: 0, y: 0, z: 0 };
  return {
    gateSpot: GATE,
    spawn(type) {
      const w = L.filter((p) => p.state === 'wait').length; if (w >= 3) return null;
      const el = doc.createElement('div'); el.className = 'sh-stubp'; el.style.cssText = 'position:fixed;left:0;top:0;z-index:31;pointer-events:auto;font:28px/1 sans-serif;text-align:center;width:64px;margin-left:-32px;transform:translate(-999px,-999px)';
      el.innerHTML = `<div>${ICONS[type]}</div><div style="height:6px;width:60px;margin:2px auto;background:#333"><i style="display:block;height:6px;background:#7c4"></i></div>`;
      (root || doc.body).appendChild(el);
      const P = { id: ++n, type, icon: ICONS[type], patience: 1, state: 'wait', route: ROUTES[type].slice(), step: 0, pos: { x: GATE.x + 2, y: 16, z: GATE.z - 4 + w * 4 }, el, acting: false };
      el.addEventListener('click', (e) => { e.stopPropagation(); onTap && onTap(P); });
      L.push(P); return P;
    },
    tick() {
      try { world.heroXYZ(hp); } catch (e) { /* */ }
      for (const P of L) {
        if (P.state === 'taken') { const dx = P.pos.x - hp.x, dz = P.pos.z - hp.z, d = Math.hypot(dx, dz); if (d > 1.6) { P.pos.x = hp.x + dx / d * 1.6; P.pos.z = hp.z + dz / d * 1.6; } }
        const q = view.project(P.pos.x, P.pos.y + 4.2, P.pos.z);
        P.el.style.transform = q && q.on !== false ? `translate(${Math.round(q.x)}px,${Math.round(q.y)}px)` : 'translate(-999px,-999px)';
        const b = P.el.querySelector('i'); b.style.width = `${Math.round(P.patience * 100)}%`; b.style.background = P.patience > 0.55 ? '#7c4' : P.patience > 0.25 ? '#e3a83a' : '#b8742a';
      }
    },
    list: () => L.slice(), take(P) { P.state = 'taken'; }, release(P) { P.state = 'atStation'; },
    remove(P) { const i = L.indexOf(P); if (i >= 0) L.splice(i, 1); try { P.el.remove(); } catch (e) { /* */ } },
    done(P) { this.remove(P); }, next: () => L.find((p) => p.state === 'wait') || null, clear() { for (const P of L.slice()) this.remove(P); },
  };
}
export function stubStations() {
  return { STATIONS: STUB_STATIONS, act: (id, P) => new Promise((res) => { P.acting = true; setTimeout(() => { P.acting = false; res({ quality: 1, gold: true }); }, 800); }), cue() {}, place() {}, clear() {}, wrong() {} };
}
export function stubCam() { return { on() {}, off() {}, focus() {} }; }
// ── /shift29 ──
