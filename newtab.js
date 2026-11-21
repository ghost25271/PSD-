'use strict';
const L = (k, ...a) => t(k, ...a);   // переклад (i18n.js); окреме ім'я, бо `t` часто затінюється змінною плитки
setLang(detectLang());
const $ = s => document.querySelector(s);
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
const uid = () => Math.random().toString(36).slice(2, 10);
const mk = (title, url) => ({ id: uid(), title, url, ad: Date.now() });
const WALL_DEF = { wcv: 14, wvt: 6, wry: 0, wrx: 6, wpd: 1400, wz: 40,
  wfill: 88, wasp: 1.35, wcol: 0, wrow: 0, wva: 'center', wox: 0, woy: 0, wsc: 100, wgap: 14, wrad: 14 };
const WALL_CURVE = ['wcv', 'wvt', 'wry', 'wrx', 'wpd', 'wz'];   // геометрія вигину: у v1.11 модель змінилась (чаша замість поворотів плиток), тому старі значення скидаються
const WALL_GONE = ['wga', 'wgc', 'wgb', 'wbd', 'wsd', 'wr', 'wra', 'wrh', 'wrg'];   // прибрані опції (скло, відображення)
const WALL_PRE = [
  ['wp_classic', {}],
  ['wp_strong', { wcv: 24, wvt: 12, wrx: 8, wpd: 1000, wz: 50 }],
  ['wp_flat', { wcv: 0, wvt: 0, wrx: 0, wry: 0 }],
  ['wp_compact', { wfill: 70, wgap: 10 }]
];
const DEF = () => ({
  s: { w: 150, h: 110, gap: 16, r: 16, fs: 13, foy: 0, un: '', uns: true, unc: '#fe6220', unz: 44, al: true, alm: '5', cds: true, cd: [{ t: 'до Нового Року', d: '2026-12-31', y: true }], tsh: true, tpos: 'on', cf: [], op: 1, bt: 'color', c1: '#1f2328', c2: '#40284a', bi: null, blur: 0, dim: 0.2,
    tfs: 13, tf: 'inherit', tw: false, ti: false, tsk: false, tskc: '#000000', tc: '#ffffff', 
    neon: true, nc: '#000000', nt: 2, nb: 'off', tr: 8, trv: 2, tg: 18, tcl: '#ff5900',
    pe: true, pm: 'ripple', ps: 4, pq: 'linear', pd: 'normal', pz: 18, pt: 2, pk: 1, pl: 40, pg: 6, pi: 1, pc: '#ea430b', pr: false, prv: 10,
    tilt: true, tm: 10, ts: 1.03, glare: true, rm: false, ta: true,
    sb: true, st: true, pnc: true, prm: false, lpw: 'm', lpb: true, pmt: 'fake', pmi: '5', hc: false, hcp: '24', hcw: 'm', hs: false, hsw: 'm', hcl: [], pth: 'dark', lay: 'cat', pcat: 0, pop: 0, pcs: 0, pbs: 0, pob: -1,  sw: 560, sn: false, se: 'google', lang: 'auto',
    tpl: 'flat', sc: 100, wver: 5, ic: 'google', icv: true, ics: 25, icl: 24, icver: 2, tpb: 'flat', ...WALL_DEF },
  p: [{ id: 'p1', name: L('p_home'), t: [mk('YouTube', 'https://www.youtube.com'), mk(L('eng_wiki'), 'https://' + LANG + '.wikipedia.org'), mk('GitHub', 'https://github.com'),
    mk('Alerts', 'https://alerts.in.ua/'), mk('VirusTotal', 'https://www.virustotal.com/gui/home/upload'), mk('DeepL', 'https://www.deepl.com/uk/translator'), mk('Old.m.ua', 'https://old.m.ua/ua/'), mk('Facebook', 'https://www.facebook.com/?locale=uk_UA'),
    mk('Gmail', 'https://mail.google.com/mail/u/0/#inbox'), mk('Дизайн-ресурси', 'https://newmedia.ua/thematic-compilation-uk/55-bezkoshtovnykh-resursiv-dlya-dyzayneriv/'), mk('InvisTools', 'https://invistools.com/uk/'), mk('Ghost Web', 'https://radishevsky.wixsite.com/ghostweb'), mk('Епіцентр', 'https://epicentrk.ua/'),
    mk('Google Maps', 'https://www.google.com/maps'), mk('Google Drive', 'https://drive.google.com'), mk('Claude', 'https://claude.ai'), mk('Telegram', 'https://web.telegram.org'), mk('NFSU2', 'https://nfsu2.xyz/'), mk('Arena of Champions', 'https://arenaofchampions.live/')] },
    ...[2, 3, 4, 5].map(n => ({ id: 'p' + n, name: L('p_home').replace('1', n), t: [] }))],
  cur: 'p1'
});
// Міграція: нові ключі отримують значення за замовчуванням, старі зберігаються.
// Розмір назви раніше брався з fs, тому для старих даних tfs = fs.
const fixS = s => {
  s = s || {}; const o = { ...DEF().s, tfs: s.fs ?? 13, ...s };
  o.lay = 'cat'; o.lv2 = 1; if (!o.hcv) { o.hcw = 'm'; o.hsw = 'm'; o.hcv = 1; } if (!o.hcv2) { for (const k of ['hcw', 'hsw']) { if (o[k] === 's') o[k] = 'c'; else if (o[k] === '360') o[k] = 'm'; } o.hcv2 = 1; } o.hs = !!o.hs; if (!Array.isArray(o.hcl)) o.hcl = []; delete o.hco;   // 1.91: головний вигляд меню — категорії (один раз; далі вибір користувача зберігається)
  delete o.vst; delete o.ach; delete o.achs;   // рейтинг і досягнення прибрано
  if (s.pn) o.pc = s.nc || o.nc; delete o.pn;   // «колір анімації» прибрано: беремо колір неону один раз
  if (s.prv === undefined) o.prv = s.prs === undefined ? 10 : Math.max(1, Math.min(12, Math.round(13 - s.prs))); delete o.prs;
  o.ic = 'google';   // джерело іконок більше не налаштовується: завжди найчіткіші
  delete o.tba; delete o.tbg; delete o.the; delete o.thc;
  if (s.tsh === undefined) o.tsh = !s.thide; delete o.thide;
  if (!Array.isArray(o.cf)) o.cf = [];
  if (s.trv !== 2) { o.tr = 8; o.trv = 2; }   // нові закруглені вкладки
  if (typeof o.pm !== 'string') { if (o.pm === true) o.prm = true; o.pm = 'ripple'; }   // ключ pm помилково використовувався для «Режиму захисту» і затирав стиль ефекту
  o.pm = ({ breathe: 'ripple', blinds: 'ripple', lightning: 'portal', laser: 'portal', ghost: 'fire' })[o.pm] || o.pm;   // ефекти замінено
  if (o.tpl === '3d') o.tpl = 'flat'; if (o.tpb === '3d') o.tpb = 'flat';   // шаблон «3D-блоки» видалено
  if (s.wver !== 5) {                                                          // міграція налаштувань стіни
    WALL_CURVE.forEach(k => { o[k] = WALL_DEF[k]; });                          // нова модель вигину — нові стандартні кути
    WALL_GONE.forEach(k => delete o[k]); o.wver = 5;                           // скло й відображення прибрано раніше
  }
  if (['heart', 'flicker', 'twin'].includes(o.pm)) o.pm = 'ripple'; if (o.pm === 'pumpkin') o.pm = 'sheen';   // стилі прибрано
  if (o.bt === 'live') o.bt = 'gradient'; delete o.lw;   // живі шпалери прибрано
  if (s.icver !== 2) { o.ics = 78; o.icl = 24; o.icver = 2; }   // нова модель іконок: повна іконка / компактний значок на знімку
  delete o.icp; delete o.titles; o.rm = false;   // стара галочка «Показувати назви» замінена на «Ховати назви»; анімації завжди ввімкнені
  ['d3z', 'd3a', 'd3g', 'cols', 'rows'].forEach(k => delete o[k]); return o;   // «Розкладку» прибрано: старі cols/rows більше не діють
};
const fixD = d => { d.s = fixS(d.s); delete d.pa; const mg = ts => (ts || []).forEach(t => { if (t.shot && t.img && !t.si) { t.si = t.img; t.img = null; t.fill = false; t.dm = 'shot'; } if (t.t) mg(t.t); }); (d.p || []).forEach(p => mg(p.t));   // знімок сторінки тепер зберігається окремо від власної іконки
   if (!d.m172 && d.p && d.p[0]) { d.m172 = 1; const all = []; (function w(ts) { (ts || []).forEach(t => { if (t.url) all.push(t.url); if (t.t) w(t.t); }); })(d.p.flatMap(p => p.t)); for (const [n, u] of [['NFSU2', 'https://nfsu2.xyz/'], ['Arena of Champions', 'https://arenaofchampions.live/']]) if (!all.includes(u)) d.p[0].t.push(mk(n, u)); }   // одноразово додає нові типові посилання
   d.themes = Array.isArray(d.themes) ? d.themes : []; d.engines = Array.isArray(d.engines) ? d.engines : []; splitPages(d); return d; };
// Ліміт плиток на сторінці (20 — клас., 15 — 3D-стіна): надлишок переноситься на сторінки-продовження, нічого не видаляється
let limHit = 0;
const nextName = d => { let n = d.p.length + 1; while (d.p.some(x => x.name === L('p_n', n))) n++; return L('p_n', n); };
const limOf = d => d.s.tpl === 'wall' ? 15 : 50;
let limSave = 0;
function mergePages(d) {   // ліміт піднято (20 → 50): сторінки-продовження, створені автоматично, повертаються на попередню сторінку
  const lim = limOf(d);
  for (let i = 0; i < d.p.length; i++) {
    const p = d.p[i]; let n;
    while (p.nx && (n = d.p.find(x => x.id === p.nx))) {
      while (p.t.length < lim && n.t.length) p.t.push(n.t.shift());
      if (n.t.length) break;
      d.p.splice(d.p.indexOf(n), 1); p.nx = n.nx || null; if (!p.nx) delete p.nx; if (d.cur === n.id) d.cur = p.id;
    }
  }
}
function splitPages(d) {
  if (!d.m50 && d.s.tpl !== 'wall') { d.m50 = 1; mergePages(d); limSave = 1; }
  const lim = limOf(d);
  for (let i = 0; i < d.p.length; i++) {
    const p = d.p[i]; if (!Array.isArray(p.t) || p.t.length <= lim) continue;
    const over = p.t.splice(lim); let n = p.nx && d.p.find(x => x.id === p.nx);
    if (n) n.t.unshift(...over);
    else {
      n = { id: uid(), name: nextName(d), t: over }; if (p.pw) n.pw = p.pw; d.p.splice(i + 1, 0, n); p.nx = n.id;
    }
    limHit = 1;
  }
}
const NOSTYLE = new Set(['un', 'uns', 'unc', 'unz', 'cds', 'cd', 'al', 'alm', 'pnc', 'prm', 'lpw', 'lpb', 'pmt', 'pmi', 'hc', 'hcp', 'hcw', 'hs', 'hsw', 'hcv', 'hcv2', 'hcl', 'pob', 'pth', 'lay', 'lv2', 'pcat', 'pop', 'pcs', 'pbs', 'w', 'h', 'gap', 'fs', 'tfs', 'foy', 'titles', 'tsh', 'cf', 'bi', 'rm', 'sb', 'sw', 'sn', 'se', 'st', 'lang', 'ic', 'ics', 'icp', 'tpb', 'sc', 'wver', 'wsc', 'wgap']);
const styleKeys = () => Object.keys(DEF().s).filter(k => !NOSTYLE.has(k));
const stylePick = s => { const o = {}; styleKeys().forEach(k => o[k] = s[k]); return o; };
const PRESETS = {
  pr_cyber: { bt: 'gradient', c1: '#0a0120', c2: '#2a0a52', r: 6, tf: 'Courier New,monospace', tw: true, tc: '#d9fbff', neon: true, nc: '#00f0ff', nt: 3, nb: 'smooth', pe: true, pm: 'runner', ps: 5, pk: 2, pl: 55, pg: 9, pc: '#ff2bd6', tilt: true, tm: 12, ts: 1.04, glare: true },
  pr_glass: { bt: 'gradient', c1: '#4568dc', c2: '#b06ab3', r: 24, neon: true, nc: '#ffffff', nt: 1, nb: 'off', pe: true, pc: '#ffffff', pm: 'ripple', ps: 3, pz: 22, pt: 1, tilt: true, tm: 9, ts: 1.04, glare: true },
  pr_retro: { bt: 'gradient', c1: '#240046', c2: '#ff6d00', r: 4, tf: 'Impact,sans-serif', tc: '#ffe66d', neon: true, nc: '#ffe66d', nt: 3, nb: 'smooth', pe: true, pm: 'runner', ps: 3, pk: 1, pl: 60, pg: 8, pr: true, prv: 9, tilt: true, tm: 8, glare: false },
  pr_forest: { bt: 'gradient', c1: '#0b2b1a', c2: '#1f6f4a', r: 18, neon: true, nc: '#4ade80', nt: 2, pe: true, pc: '#4ade80', pm: 'ripple', ps: 3, pz: 16, tilt: true, tm: 8 },
  pr_hl: { bt: 'gradient', c1: '#16110c', c2: '#4a2f0c', r: 4, tf: 'Trebuchet MS,sans-serif', tw: true, tc: '#ffb53d', neon: true, nc: '#ff9d00', nt: 2, nb: 'smooth', pe: true, pm: 'scan', ps: 4, pc: '#ff9d00', pg: 8, tilt: true, tm: 6, ts: 1.03, glare: false },
  pr_stalker: { bt: 'gradient', c1: '#14160f', c2: '#3b3d26', r: 2, tf: 'Courier New,monospace', tw: true, tc: '#cfc784', neon: true, nc: '#8f9d3f', nt: 1, nb: 'off', pe: true, pm: 'dash', ps: 2, pc: '#a9b44a', pg: 4, tilt: false, glare: false },
  pr_gta: { bt: 'gradient', c1: '#1a0838', c2: '#ff3d8b', r: 8, tf: 'Impact,sans-serif', tw: false, tc: '#ffffff', neon: true, nc: '#ff4fa3', nt: 3, nb: 'smooth', pe: true, pm: 'runner', ps: 5, pk: 2, pl: 55, pg: 10, pc: '#00e5ff', tilt: true, tm: 10, ts: 1.05, glare: true },
  pr_metro: { bt: 'gradient', c1: '#04070a', c2: '#10292d', r: 3, tf: 'Courier New,monospace', tw: true, tc: '#8fe3c8', neon: true, nc: '#e8a33d', nt: 2, nb: 'fast', pe: true, pm: 'ripple', ps: 2.5, pz: 18, pt: 1, pc: '#e8a33d', pg: 6, tilt: true, tm: 5, ts: 1.02, glare: false },
  pr_l4d: { bt: 'gradient', c1: '#100606', c2: '#431010', r: 4, tf: 'Impact,sans-serif', tw: false, tc: '#eadfce', neon: true, nc: '#c1121f', nt: 2, nb: 'smooth', pe: true, pm: 'blood', ps: 3, tilt: true, tm: 8, ts: 1.03, glare: false },
  pr_halloween: { bt: 'gradient', c1: '#12061a', c2: '#3a1503', r: 10, tf: 'Impact,sans-serif', tw: false, tc: '#ffb347', neon: true, nc: '#ff7a00', nt: 2, nb: 'smooth', pe: true, pm: 'sheen', ps: 3, tilt: true, tm: 8, ts: 1.04, glare: false },
  pr_wow: { bt: 'gradient', c1: '#0a1426', c2: '#1d3a6b', r: 6, tf: 'Georgia,serif', tw: true, tc: '#f3d27a', neon: true, nc: '#f4c542', nt: 2, nb: 'smooth', pe: true, pm: 'runner', ps: 3, pk: 1, pl: 60, pg: 8, pc: '#f4c542', tilt: true, tm: 7, ts: 1.03, glare: true },
  pr_darknet: { bt: 'gradient', c1: '#000000', c2: '#031a08', r: 0, tf: 'Courier New,monospace', tw: true, tc: '#39ff14', neon: true, nc: '#00ff41', nt: 1, nb: 'fast', pe: true, pm: 'glitch', ps: 5, tilt: false, glare: false },
  pr_space: { bt: 'gradient', c1: '#04030f', c2: '#241353', r: 22, tf: 'Trebuchet MS,sans-serif', tw: false, tc: '#d3dbff', neon: true, nc: '#8c7bff', nt: 2, nb: 'smooth', pe: true, pm: 'stars', ps: 3, tilt: true, tm: 10, ts: 1.04, glare: true },
  pr_sunset: { bt: 'gradient', c1: '#2d1b4e', c2: '#ff7e5f', r: 20, neon: true, nc: '#ffd1a9', nt: 2, pe: true, pc: '#ffd1a9', pm: 'ripple', ps: 3, pz: 20, pt: 1, tilt: true, tm: 10, ts: 1.04 }
};
let D, timer, drag = null, dragH = null, dropT = null, editing = null, editH = null, pending = null, removeImg = false, openF = null, fxT = null, tst = null;
let TEST = null;   // {p, cur}: справжні сторінки, відкладені на час тестового режиму (тестові плитки ніколи не зберігаються)
const flush = () => { clearTimeout(timer); timer = 0; const out = TEST ? { ...D, p: TEST.p, cur: TEST.cur } : D; try { localStorage.setItem('sdd', JSON.stringify(out)); } catch { } return chrome.storage.local.set({ d: out }); };
const save = () => { clearTimeout(timer); timer = setTimeout(flush, 200); };
addEventListener('pagehide', () => { if (timer) flush(); });
const page = () => D.p.find(p => p.id === D.cur) || D.p[0];
const walk = a => a.flatMap(t => t.folder ? [t, ...walk(t.t)] : [t]);
const norm = u => { u = u.trim(); if (!u) return null; if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u; return /^(https?|ftp|file):/i.test(u) ? u : null; };
const host = u => { try { return new URL(u).hostname.replace(/^www\./, '') || u; } catch { return u; } };
let curH = 110;   // фактична висота плитки
const iconSz = px => { const p = (px || curH * D.s.ics / 100) * (devicePixelRatio || 1); return [32, 64, 128, 256].find(n => n >= p) || 256; };
const favLocal = (u, px) => `${chrome.runtime.getURL('_favicon/')}?pageUrl=${encodeURIComponent(u)}&size=${iconSz(px)}`;
const favRemote = (u, px) => `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(u)}&size=${iconSz(px)}`;
const col = u => { let h = 0; for (const c of u) h = (h * 31 + c.charCodeAt(0)) | 0; return `hsl(${Math.abs(h) % 360} 35% 30%)`; };
const clamp = v => Math.max(1, Math.min(8, parseInt(v) || 1));
const isUrlLike = s => /^https?:\/\//i.test(s) || /^[\w-]+(\.[\w-]+)+(:\d+)?([\/?#]\S*)?$/.test(s);
const parseUrls = t => t.split(/\s+/).filter(Boolean).filter(isUrlLike).map(norm).filter(Boolean);

/* ---------- Зображення: IndexedDB (Blob), окремо від налаштувань ---------- */
const db = new Promise((res, rej) => { const r = indexedDB.open('sd', 1); r.onupgradeneeded = () => r.result.createObjectStore('i'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const tx = (m, f) => db.then(d => new Promise((res, rej) => { const q = f(d.transaction('i', m).objectStore('i')); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }));
const imgPut = (k, b) => tx('readwrite', s => s.put(b, k));
const imgGet = k => tx('readonly', s => s.get(k));
const imgDel = k => k && tx('readwrite', s => s.delete(k));
const urls = new Map();
async function imgUrl(k) {
  if (urls.has(k)) return urls.get(k);
  const b = await imgGet(k); if (!b) return null;
  const u = URL.createObjectURL(b); urls.set(k, u); return u;
}
const freeImg = k => { if (!k) return; const u = urls.get(k); if (u) { URL.revokeObjectURL(u); urls.delete(k); } imgDel(k); };
async function saveImg(file, max, q) {
  const src = URL.createObjectURL(file), im = new Image(); im.src = src; await im.decode();
  const w0 = im.naturalWidth || 256, h0 = im.naturalHeight || 256, k = Math.min(1, max / Math.max(w0, h0));
  const c = document.createElement('canvas'); c.width = Math.round(w0 * k); c.height = Math.round(h0 * k);
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(src);
  const blob = await new Promise(r => c.toBlob(r, 'image/webp', q));
  const id = uid(); await imgPut(id, blob); return id;
}
async function gc() {   // прибирає зображення, на які ніхто не посилається
  if (timer || TEST) return;
  const [r, keys] = await Promise.all([chrome.storage.local.get('d'), tx('readonly', s => s.getAllKeys())]);
  const d = r.d; if (!d || !d.p || !d.p.length) return;
  const used = new Set([d.s && d.s.bi, ...d.p.flatMap(p => walk(p.t || []).flatMap(t => [t.img, t.si, t.st]))].filter(Boolean));
  for (const k of keys) if (!used.has(k)) imgDel(k);
}

/* ---------- Спливаючі елементи (top layer, видно навіть над діалогами) ---------- */
const MI = {   // значки пунктів контекстного меню
  open: '<path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  pin: '<path d="M12 17v5M9 3h6l-1 6 3 3v2H7v-2l3-3z"/>',
  unpin: '<path d="M12 17v5M9 3h6l-1 6 3 3v2H7v-2l3-3zM3 3l18 18"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  qr: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14v3M14 20h3M20 20h1"/>',
  priv: '<path d="M3 11l2-6.5A2 2 0 0 1 6.9 3h10.2A2 2 0 0 1 19 4.5L21 11M2 11h20M6.5 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17.5 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9.5 17h5"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  move: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  out: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/>',
  del: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
  key: '<path d="M21 2l-9.6 9.6M15.5 7.5l3 3M7.5 20a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"/>',
  page: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5"/>'
};
const hideMenu = () => { try { $('#menu').hidePopover(); } catch { } };
function menu(e, items) {
  e.preventDefault(); const m = $('#menu'); hideMenu();
  m.replaceChildren(...items.map(([l, f, ic]) => { const b = el('button'); b.innerHTML = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${MI[ic] || ''}</svg>`; b.append(el('span', null, l)); b.onclick = () => { hideMenu(); f(); }; return b; }));
  m.showPopover();
  m.style.left = Math.min(e.clientX, innerWidth - m.offsetWidth - 6) + 'px';
  m.style.top = Math.min(e.clientY, innerHeight - m.offsetHeight - 6) + 'px';
}
function toast(msg, undo, exp) {
  if (tst) tst.fin();
  const n = $('#toast'), tm = setTimeout(() => tst && tst.fin(), 6000);
  const hide = () => { try { n.hidePopover(); } catch { } };
  n.replaceChildren(el('span', null, msg));
  if (undo) { const b = el('button', null, L('undo')); b.onclick = () => { clearTimeout(tm); tst = null; hide(); undo(); }; n.append(b); }
  tst = { fin: () => { clearTimeout(tm); tst = null; hide(); if (exp) exp(); } };
  hide(); n.showPopover();
}
document.addEventListener('click', hideMenu);
addEventListener('keydown', e => { if (e.key === 'Escape') { hideMenu(); $('#panel').classList.remove('open'); } });

/* ---------- Пульсація: один плаваючий елемент поверх плитки під курсором ---------- */
const fx = el('div'); fx.id = 'fx';
fx.append(el('i', 'sh'));
for (let i = 0; i < 14; i++) {   // частинки для стилів «листя / сніг / зорі»
  const p = el('i', 'pt'), sg = i % 2 ? 1 : -1;
  p.style.cssText = `--x:${(i * 37 + 11) % 90 + 3}%;--y:${(i * 53 + 17) % 78 + 6}%;--s:${6 + (i * 7) % 9}px;--dl:${((i * 0.37) % 2.4).toFixed(2)}s;--k:${(0.8 + ((i * 13) % 7) / 10).toFixed(1)};--sw:${sg * (8 + (i * 5) % 14)}px;--r:${(i * 47) % 360}deg`;
  fx.append(p);
}
const fcv = el('canvas', 'fc'), gcv = el('canvas', 'gc'); fx.append(fcv, gcv);
/* ---- Рушій canvas-ефектів: вогонь, кров, глітч, портал. ~30 к/с, лише поки плитка під курсором ---- */
const FIRE = { W: 56, H: 0, heat: null, img: null, ctx: null, pal: null };
const FX = { raf: 0, last: 0, t0: 0, mode: '', w: 0, h: 0, g: null, S: null };
function fireInit() {
  const w = fx.offsetWidth || 150, h = fx.offsetHeight || 110, W = FIRE.W, H = Math.max(16, Math.round(W * h / w));
  if (FIRE.H !== H) { FIRE.H = H; FIRE.heat = new Uint8Array(W * H); fcv.width = W; fcv.height = H; FIRE.ctx = fcv.getContext('2d'); FIRE.img = FIRE.ctx.createImageData(W, H); }
  if (!FIRE.pal) {   // 256 кольорів: прозоре → червоний → оранжевий → жовтий → майже білий
    const p = FIRE.pal = new Uint8ClampedArray(256 * 4);
    for (let i = 0; i < 256; i++) { const t = i / 255; p[i * 4] = Math.min(255, t * 520); p[i * 4 + 1] = Math.max(0, Math.min(255, (t - .3) * 420)); p[i * 4 + 2] = Math.max(0, Math.min(255, (t - .78) * 900)); p[i * 4 + 3] = Math.min(255, t * 620); }
  }
  FIRE.heat.fill(0);
}
function fireStep() {
  const { W, H, heat, img } = FIRE, d = img.data, pal = FIRE.pal, dec = 255 / (H * .68);
  for (let x = 0; x < W; x++) heat[(H - 1) * W + x] = 200 + Math.random() * 55;
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W; x++) {
    const s = heat[(y + 1) * W + x], r = (Math.random() * 3 | 0) - 1, xx = x + r < 0 ? 0 : x + r >= W ? W - 1 : x + r;
    const v = s - Math.random() * dec * 1.5; heat[y * W + xx] = v > 0 ? v : 0;
  }
  for (let i = 0, n = W * H; i < n; i++) { const h = heat[i] * 4, j = i * 4; d[j] = pal[h]; d[j + 1] = pal[h + 1]; d[j + 2] = pal[h + 2]; d[j + 3] = pal[h + 3]; }
  FIRE.ctx.putImageData(img, 0, 0);
}
const rnd = (a, b) => a + Math.random() * (b - a);
const hex2 = c => { const g = FX.g; g.fillStyle = '#000'; g.fillStyle = c; const s = g.fillStyle; if (s[0] === '#') return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)]; const m = s.match(/[\d.]+/g) || [255, 79, 216]; return [+m[0], +m[1], +m[2]]; };
/* Кров: калюжа зверху, в'язкі краплі з зупинками, глянцевий блиск, слід залишається і потім висихає */
function bloodInit() {
  const w = FX.w, h = FX.h, n = Math.max(5, Math.round(w / 17)), k = w / 150;
  FX.S = { drips: Array.from({ length: n }, (_, i) => ({ x: (i + .5) * w / n + rnd(-5, 5) * k, w: rnd(5.5, 10) * k, y: 0, v: 0, tv: 0, st: 0, delay: rnd(0, 1.6), fade: 1, ph: 0 })) };
}
function bloodStep(dt, t) {
  const g = FX.g, w = FX.w, h = FX.h, S = FX.S, sp = (D.s.ps || 4) / 4, ph = h * .13, base = h * .55 * sp;
  g.clearRect(0, 0, w, h);
  const edge = x => ph + 3 * Math.sin(x * .11 + t * .9) + 2 * Math.sin(x * .27 - t * 1.3);
  for (const d of S.drips) {   // фізика
    if (d.delay > 0) { d.delay -= dt; continue; }
    if (d.ph === 0) { d.ph = 1; d.y = ph; d.fade = 1; d.v = 0; d.st = 0; }
    if (d.ph === 1) {
      if ((d.st -= dt) <= 0) { d.st = rnd(.15, .5); d.tv = Math.random() < .25 ? 0 : rnd(.25, 1.25) * base; }   // в'язка крапля: то стоїть, то біжить
      d.v += (d.tv - d.v) * Math.min(1, dt * 5); d.y += d.v * dt;
      if (d.y > h + d.w * 2) { d.ph = 2; }
    } else if ((d.fade -= dt * 1.4) <= 0) { d.ph = 0; d.delay = rnd(.1, 1.2); d.x = rnd(.04, .96) * w; d.w = rnd(5.5, 10) * w / 150; }
  }
  // калюжа
  const gp = g.createLinearGradient(0, 0, 0, ph + 8); gp.addColorStop(0, '#3a0005'); gp.addColorStop(.55, '#8c0b15'); gp.addColorStop(1, '#6a0810');
  g.fillStyle = gp; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, edge(0));
  for (let x = 4; x <= w + 4; x += 4) g.lineTo(x, edge(x)); g.lineTo(w, 0); g.closePath(); g.fill();
  // сліди і краплі
  for (const d of S.drips) {
    if (d.ph === 0) continue;
    g.globalAlpha = Math.max(0, d.fade);
    const x = d.x, tw = d.w * .8, y0 = edge(x) - 4, hy = d.y;
    if (hy > y0) {
      const gt = g.createLinearGradient(x - tw / 2, 0, x + tw / 2, 0); gt.addColorStop(0, '#3a0005'); gt.addColorStop(.3, '#9b0e18'); gt.addColorStop(.5, '#d12a34'); gt.addColorStop(.72, '#8c0b15'); gt.addColorStop(1, '#3a0005');
      g.fillStyle = gt; g.beginPath(); g.moveTo(x - tw * .9, y0); g.quadraticCurveTo(x - tw / 2, y0 + 8, x - tw / 2, y0 + 16); g.lineTo(x - tw / 2, hy); g.lineTo(x + tw / 2, hy); g.lineTo(x + tw / 2, y0 + 16); g.quadraticCurveTo(x + tw / 2, y0 + 8, x + tw * .9, y0); g.closePath(); g.fill();
      const r = d.w * .62, by = hy + r * .35;   // крапля-цибулина
      const gb = g.createRadialGradient(x - r * .3, by - r * .45, r * .08, x, by, r * 1.25); gb.addColorStop(0, '#e24a52'); gb.addColorStop(.35, '#b3141e'); gb.addColorStop(1, '#4a0007');
      g.fillStyle = gb; g.beginPath(); g.ellipse(x, by, r, r * 1.2, 0, 0, 6.2832); g.fill();
      g.fillStyle = 'rgba(255,225,225,.8)'; g.beginPath(); g.ellipse(x - r * .35, by - r * .45, r * .22, r * .35, -.5, 0, 6.2832); g.fill();
    }
  }
  g.globalAlpha = 1;
  g.fillStyle = 'rgba(255,200,200,.35)'; g.fillRect(0, 1.5, w, 1.5);   // глянець на калюжі
}
/* Глітч: нерегулярні спалахи — кольорові смуги-зсуви, блоки шуму, розрив кадру; між спалахами — рухома смуга розгортки */
function glitchInit() { FX.S = { next: .25, left: 0, bars: [], roll: 0 }; }
function glitchStep(dt, t) {
  const g = FX.g, w = FX.w, h = FX.h, S = FX.S;
  g.clearRect(0, 0, w, h);
  S.roll = (S.roll + dt * h * .35) % (h * 1.4);
  const gr = g.createLinearGradient(0, S.roll - h * .2, 0, S.roll); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,.07)');
  g.fillStyle = gr; g.fillRect(0, S.roll - h * .2, w, h * .2);
  if (S.left > 0) S.left -= dt; else if ((S.next -= dt) <= 0) { S.left = rnd(.1, .26); S.next = rnd(.35, 1.1); }
  if (S.left <= 0) return;
  const n = 4 + (Math.random() * 6 | 0);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const y = rnd(0, h), bh = Math.random() < .3 ? rnd(8, h * .22) : rnd(1.5, 7), dx = rnd(-.12, .12) * w, c = Math.random();
    g.fillStyle = c < .38 ? 'rgba(0,255,240,.38)' : c < .76 ? 'rgba(255,0,200,.36)' : 'rgba(255,255,255,.28)';
    g.fillRect(dx < 0 ? 0 : dx, y, w - Math.abs(dx), bh);
    if (Math.random() < .5) { g.fillStyle = c < .5 ? 'rgba(255,0,200,.3)' : 'rgba(0,255,240,.3)'; g.fillRect(dx < 0 ? -dx : 0, y + bh * .3, w - Math.abs(dx), Math.max(1, bh * .4)); }
  }
  g.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 7; i++) { const s = rnd(2, 9); g.fillStyle = Math.random() < .5 ? '#000' : Math.random() < .5 ? '#fff' : '#0ff'; g.globalAlpha = rnd(.35, .85); g.fillRect(rnd(0, w), rnd(0, h), s * rnd(1, 3), s); }
  g.globalAlpha = 1;
  if (Math.random() < .35) { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(rnd(0, w), 0, 1.5, h); }   // розрив
  if (Math.random() < .25) { g.fillStyle = 'rgba(0,255,240,.12)'; g.fillRect(0, 0, w * .5, h); g.fillStyle = 'rgba(255,0,200,.12)'; g.fillRect(w * .5, 0, w * .5, h); }
}
/* Портал: вертикальний овал, що відкривається; обертова воронка, дуги на краю, іскри, що летять по спіралі */
function portalInit() {
  const col = hex2(getComputedStyle(fx).getPropertyValue('--pcol').trim() || '#ff4fd8');
  FX.S = { col, sp: Array.from({ length: 18 }, () => ({ a: rnd(0, 6.28), r: rnd(.9, 1.5), v: rnd(.6, 1.6), life: rnd(0, 1) })) };
}
function portalStep(dt, t) {
  const g = FX.g, w = FX.w, h = FX.h, S = FX.S, [R, G, B] = S.col, sp = (D.s.ps || 4) / 4, T = t * sp;
  const op = Math.min(1, t * 3.2), e = 1 - Math.pow(1 - op, 3);
  const cx = w / 2, cy = h / 2, pul = 1 + .03 * Math.sin(T * 5), rx = w * .27 * e * pul, ry = h * .43 * e * pul;
  const c = a => `rgba(${R},${G},${B},${a})`, lt = a => `rgba(${Math.min(255, R + 110)},${Math.min(255, G + 110)},${Math.min(255, B + 110)},${a})`;
  g.clearRect(0, 0, w, h);
  if (rx < 1) return;
  g.globalCompositeOperation = 'source-over';
  const gd = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry) * 1.15); gd.addColorStop(0, 'rgba(0,0,0,.78)'); gd.addColorStop(.62, c(.32)); gd.addColorStop(1, c(0));
  g.save(); g.translate(cx, cy); g.scale(rx / ry, 1); g.translate(-cx, -cy); g.fillStyle = gd; g.beginPath(); g.arc(cx, cy, ry * 1.15, 0, 6.2832); g.fill(); g.restore();
  g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (let k = 0; k < 4; k++) {   // спіральні рукави воронки
    g.beginPath(); g.strokeStyle = lt(.5 - k * .05); g.lineWidth = 1.6;
    for (let i = 0; i <= 26; i++) { const r = i / 26, a = k * 1.5708 + r * 5.2 - T * 3.4, x = cx + Math.cos(a) * rx * r * .94, y = cy + Math.sin(a) * ry * r * .94; i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }
  for (const [lw, a] of [[13, .1], [7, .2], [3.2, .95]]) { g.strokeStyle = lw > 4 ? c(a) : lt(a); g.lineWidth = lw; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 6.2832); g.stroke(); }
  for (let k = 0; k < 3; k++) { const a0 = T * (2.2 + k * .8) + k * 2.1; g.strokeStyle = `rgba(255,255,255,${.75 - k * .15})`; g.lineWidth = 2.2; g.beginPath(); g.ellipse(cx, cy, rx * (1 + k * .045), ry * (1 + k * .045), 0, a0, a0 + .9 + k * .25); g.stroke(); }
  for (const p of S.sp) {   // іскри
    p.life += dt * p.v * sp; if (p.life >= 1) { p.life = 0; p.a = rnd(0, 6.28); p.r = rnd(.95, 1.5); p.v = rnd(.6, 1.6); }
    const r = p.r + p.life * .55, a = p.a + p.life * 2.4, x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r, s = 1.2 + (1 - p.life) * 1.8;
    g.fillStyle = lt((1 - p.life) * .95); g.beginPath(); g.arc(x, y, s, 0, 6.2832); g.fill();
  }
  g.globalCompositeOperation = 'source-over';
}
function fxStart(m) {
  if (m === 'fire') { fireInit(); FX.mode = m; }
  else if (m === 'blood' || m === 'glitch' || m === 'portal') {
    const dpr = Math.min(2, devicePixelRatio || 1), w = fx.offsetWidth || 150, h = fx.offsetHeight || 110;
    FX.w = w; FX.h = h; gcv.width = Math.round(w * dpr); gcv.height = Math.round(h * dpr); FX.g = gcv.getContext('2d'); FX.g.setTransform(dpr, 0, 0, dpr, 0, 0);
    ({ blood: bloodInit, glitch: glitchInit, portal: portalInit })[m](); FX.mode = m;
  } else return;
  FX.t0 = performance.now(); FX.last = FX.t0; FX.raf = requestAnimationFrame(fxLoop);
}
function fxLoop(now) {
  FX.raf = requestAnimationFrame(fxLoop);
  const dt = now - FX.last; if (dt < 33) return; FX.last = now;
  if (FX.mode === 'fire') fireStep(); else { const t = (now - FX.t0) / 1000, d = Math.min(.1, dt / 1000); ({ blood: bloodStep, glitch: glitchStep, portal: portalStep })[FX.mode](d, t); }
}
function fireStop() { if (FX.raf) { cancelAnimationFrame(FX.raf); FX.raf = 0; } }
fx.append(el('i', 'ss'));   // привид (стиль «Привид»)
function showFx(t, g) {
  fx.classList.remove('on'); fireStop(); if (!t || !D.s.pe || drag || D.s.tpl === 'wall') return;
  if (fx.parentNode !== g) g.append(fx);
  fx.style.left = t.offsetLeft + 'px'; fx.style.top = t.offsetTop + 'px';
  fx.style.width = t.offsetWidth + 'px'; fx.style.height = t.offsetHeight + 'px';
  void fx.offsetWidth; fx.classList.add('on');
  fxStart(D.s.pm);
}
const clr = t => { ['--rx', '--ry', '--mx', '--my', '--pp'].forEach(p => { t.style.removeProperty(p); fx.style.removeProperty(p); }); };
addEventListener('resize', () => { fx.classList.remove('on'); fxT = null; });

/* ---------- Вигляд ---------- */
const rs = document.documentElement.style, svc = {};
const sv = (k, v) => { v = String(v); if (svc[k] !== v) { svc[k] = v; rs.setProperty(k, v); } };   // пише лише змінені змінні
const setA = (e, k, v) => { if (e.dataset[k] !== v) e.dataset[k] = v; };
/* ---------- Власні шрифти: файл зберігається в IndexedDB, підключається через FontFace ---------- */
const fontCur = (k = 'tf') => D.s.cf.find(f => D.s[k] === `"${f.n}",sans-serif`);
function fontBtn() { const b = $('#delfont'); if (b) b.disabled = !fontCur(); }
const fontsOk = new Set(); let fontKey = '';
async function loadFont(f) { if (fontsOk.has(f.k)) return true; try { const b = await imgGet(f.k); if (!b) return false; const ff = new FontFace(f.n, await b.arrayBuffer()); await ff.load(); document.fonts.add(ff); fontsOk.add(f.k); return true; } catch { return false; } }
function fontOpts() {
  const sels = [...document.querySelectorAll('select[data-k=tf]')]; if (!sels.length) return;
  const key = D.s.cf.map(f => f.k).join();
  if (key === fontKey) return; fontKey = key;
  sels.forEach(sel => {
    sel.querySelectorAll('option[data-cf]').forEach(o => o.remove());
    D.s.cf.forEach(f => { const o = el('option', null, f.n); o.value = `"${f.n}",sans-serif`; o.dataset.cf = 1; sel.append(o); loadFont(f); });
    sel.value = D.s[sel.dataset.k];
  });
}
/* ---------- Ім'я користувача на сторінці (шрифт, колір, неон) ---------- */
function unApply() {
  const u = $('#uname'), s = D.s, n = (s.un || '').trim(); if (!u) return;
  const sh = $('#unshow'); if (sh) sh.textContent = n || '—'; fontBtn();
  u.hidden = !s.uns || !n; if (u.hidden) return;
  if (u.textContent !== n) u.textContent = n;
  if (!document.getElementById('unf-ru')) { const l = el('link'); l.id = 'unf-ru'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Russo+One&display=swap'; document.head.append(l); }
  u.style.fontFamily = '"Russo One",system-ui,sans-serif'; u.style.fontSize = Math.round(13 + ((s.unz || 26) - 14) / 30 * 9) + 'px'; u.style.color = s.unc || '#ff4fd8';
}
/* ---------- Вікна повідомлень і введення у стилі «матриці» замість системних alert/prompt ---------- */
function mx(msg, o = {}) {
  return new Promise(res => {
    const d = $('#mx'), i = $('#mx-i'), ok = $('#mx-ok'); let r = null;
    $('#mx-m').textContent = msg; i.hidden = !o.input; i.type = o.pw ? 'password' : 'text'; i.value = o.def || '';
    const valid = () => !o.input || (o.valid ? o.valid(o.pw ? i.value : i.value.trim()) : i.value.trim().length > 0);
    const sync = () => { ok.disabled = !valid(); }; sync(); i.oninput = sync;
    d.onclose = () => res(r);
    ok.onclick = () => { if (!valid()) return; r = o.input ? (o.pw ? i.value : i.value) : true; d.close(); };
    i.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); ok.click(); } };
    d.onclick = e => { const b = d.getBoundingClientRect(); if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) d.close(); };   // клік поза вікном закриває
    d.showModal(); if (o.input) { i.focus(); i.select(); } else ok.focus();
  });
}
const mxAlert = m => mx(m), mxPrompt = (m, def, valid) => mx(m, { input: 1, def, valid });
/* ---------- Власне вікно-попередження замість системного confirm ---------- */
function ask(titleKey, msg) {
  return new Promise(res => {
    const d = $('#warn'); $('#warn-t').textContent = L(titleKey); $('#warn-m').textContent = msg; let r = false;
    d.onclose = () => res(r);
    $('#warn-ok').onclick = () => { r = true; d.close(); }; $('#warn-no').onclick = () => d.close();
    d.showModal(); $('#warn-no').focus();
  });
}

/* ---------- Лічильник днів до події + таймери доби (напр. 18:00 — кінець робочого дня) ---------- */
const cdDays = e => {   // скільки днів лишилось; для щорічних — до найближчої дати; null — подія минула
  const [y, m, d] = e.d.split('-').map(Number), t0 = new Date(); t0.setHours(0, 0, 0, 0);
  let t = new Date(y, m - 1, d); if (e.y) { t = new Date(t0.getFullYear(), m - 1, d); if (t < t0) t = new Date(t0.getFullYear() + 1, m - 1, d); }
  const n = Math.round((t - t0) / 864e5); return n < 0 ? null : n;
};
const tmNext = tm => { const [h, m] = tm.split(':').map(Number), n = new Date(), t = new Date(n); t.setHours(h, m, 0, 0); if (t <= n) t.setDate(t.getDate() + 1); return t.getTime(); };   // найближчий момент закінчення таймера
const cdVal = e => {   // {k: ключ сортування, s: текст, done}
  if (e.tm && e.x) { const ms = e.x - Date.now(); if (ms <= 0) return { k: 1e9, s: '', done: 1 }; const mins = Math.ceil(ms / 6e4), hh = Math.floor(mins / 60), mm = mins % 60; return { k: ms / 864e5, s: hh ? L('cd_hm', hh, mm) : L('cd_m', mm) }; }
  if (e.tm) {   // щоденний таймер до заданого часу; після нього — до завтрашнього
    const [h, m] = e.tm.split(':').map(Number), now = new Date(), t = new Date(now); t.setHours(h, m, 0, 0); if (t <= now) t.setDate(t.getDate() + 1);
    const mins = Math.ceil((t - now) / 6e4), hh = Math.floor(mins / 60), mm = mins % 60;
    return { k: (t - now) / 864e5, s: hh ? L('cd_hm', hh, mm) : L('cd_m', mm) };
  }
  const n = cdDays(e); return n === null ? { k: 1e9, s: L('cd_past'), done: 1 } : { k: n, s: n === 0 ? L('cd_today') : L('cd_days', n) };
};
/* ім'я та лічильник стоять у верхній панелі ліворуч від годинника; вкладки відступають на їхню ширину, щоб нічого не накладалось */
const sideFit = () => { const w = Math.max($('#side').offsetWidth, $('#uname').hidden ? 0 : $('#uname').offsetWidth + 52); document.documentElement.style.setProperty('--sidew', w ? w + 14 + 'px' : '0px'); };
const sideRO = new ResizeObserver(sideFit); sideRO.observe($('#side')); sideRO.observe($('#uname'));
function cdApply(noEv) {
  if (typeof cdLock === 'function') cdLock();
  if (!noEv && typeof evCheck === 'function') evCheck();
  const box = $('#cd'), s = D.s; if (!box) return;
  const list = (s.cd || []).map(e => ({ e, v: cdVal(e) })).sort((a, b) => a.v.k - b.v.k);
  const L2 = $('#cd-l'); if (L2) {
    L2.replaceChildren(...list.map(({ e, v }) => { const r = el('div', 'cdr'), x = el('button', null, '×'); x.type = 'button'; x.title = L('delete'); x.onclick = () => { s.cd = s.cd.filter(q => q !== e); cdApply(); save(); };
      r.append(el('span', null, (e.tm ? '⏱ ' : e.y ? '↻ ' : '') + e.t + (e.tm ? ' · ' + e.tm : '')), el('b', null, v.s), x); return r; }));
    if (!list.length) L2.append(el('div', 'cdn', L('cd_none')));
  }
  const vis = s.cds ? list.filter(x => !x.v.done) : [];   // усі активні події — одна під одною
  box.hidden = !vis.length; if (box.hidden) return;
  box.style.fontFamily = '"Russo One",system-ui,sans-serif'; box.style.setProperty('--cc', s.unc || '#ff4fd8');
  box.replaceChildren(...vis.map(({ e, v }) => { const r = el('div', 'cdi'); r.append(el('span', null, e.t), el('b', null, v.s)); return r; }));
}
/* власний календар у стилі панелі (системний вибір дати не стилізується) */
const CAL = { y: 0, m: 0, sel: '', mode: 'date' };
const fmtD = (iso, o) => new Intl.DateTimeFormat(LANG, o).format(new Date(iso + 'T00:00:00'));
function calRender() {
  const c = $('#cal'), y = CAL.y, m = CAL.m, first = new Date(y, m, 1), off = (first.getDay() + 6) % 7, dim = new Date(y, m + 1, 0).getDate(), td = new Date(), tIso = `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, '0')}-${String(td.getDate()).padStart(2, '0')}`;
  const head = el('div', 'ch'), pv = el('button', null, '‹'), nx = el('button', null, '›'), ttl = el('b', null, new Intl.DateTimeFormat(LANG, { month: 'long', year: 'numeric' }).format(first));
  pv.type = nx.type = 'button'; pv.onclick = () => { CAL.m--; if (CAL.m < 0) { CAL.m = 11; CAL.y--; } calRender(); }; nx.onclick = () => { CAL.m++; if (CAL.m > 11) { CAL.m = 0; CAL.y++; } calRender(); };
  head.append(pv, ttl, nx);
  const g = el('div', 'cg'); for (let i = 0; i < 7; i++) g.append(el('i', null, new Intl.DateTimeFormat(LANG, { weekday: 'short' }).format(new Date(2024, 0, 1 + i))));
  for (let i = 0; i < off; i++) g.append(el('span'));
  for (let d = 1; d <= dim; d++) {
    const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, b = el('button', iso === CAL.sel ? 'on' : iso === tIso ? 'td' : '', String(d)); b.type = 'button';
    b.onclick = () => { CAL.sel = iso; $('#cd-d').value = iso; $('#cd-dt').textContent = fmtD(iso, { day: 'numeric', month: 'long', year: 'numeric' }); c.hidden = true; }; g.append(b);
  }
  c.replaceChildren(head, g);
}
$('#cd-db').onclick = () => { const c = $('#cal'); if (!c.hidden) { c.hidden = true; return; } const b = CAL.sel ? new Date(CAL.sel + 'T00:00:00') : new Date(); CAL.y = b.getFullYear(); CAL.m = b.getMonth(); calRender(); c.hidden = false; };
const cdHasT = () => (D.s.cd || []).some(e => e.tm);
function cdLock() {   // таймер дня — лише один
  const bt = $('#cd-mode button[data-v=time]'), lk = cdHasT(); if (!bt) return;
  bt.disabled = lk; bt.title = lk ? L('cd_one') : '';
  if (lk && CAL.mode === 'time') { CAL.mode = 'date'; $('#cd-mode').querySelectorAll('button').forEach(x => x.classList.toggle('on', x.dataset.v === 'date')); $('#cd-pd').hidden = false; $('#cd-yl').classList.toggle('inv', $('#cd-pd').hidden); $('#cd-pt').hidden = true; }
}
$('#cd-mode').onclick = e => { const b = e.target.closest('button'); if (!b || b.disabled) return; CAL.mode = b.dataset.v; cdForm(); };
function cdForm() {
  $('#cd-mode').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === CAL.mode));
  $('#cd-pd').hidden = CAL.mode !== 'date'; $('#cd-yl').classList.toggle('inv', $('#cd-pd').hidden); $('#cd-pt').hidden = CAL.mode !== 'time'; $('#cal').hidden = true;
  const dt = $('#cd-dt'); if (!CAL.sel) dt.textContent = L('cd_pickdate'); cdLock();
}
$('#cd-add').onclick = () => {
  const n = $('#cd-n'), t = n.value.trim().slice(0, 40); if (D.s.cd.length >= 12) return;
  if (CAL.mode === 'time') { if (cdHasT()) return cdLock(); const tm = $('#cd-tm').value; if (!tm) return $('#cd-tm').focus(); D.s.cd.push({ t: t || L('cd_def'), tm, x: tmNext(tm) }); }
  else { if (!CAL.sel) return $('#cd-db').focus(); D.s.cd.push({ t: t || L('cd_def'), d: CAL.sel, y: $('#cd-y').checked }); CAL.sel = ''; $('#cd-d').value = ''; $('#cd-dt').textContent = L('cd_pickdate'); }
  n.value = ''; cdApply(); cdLock(); save();
};
document.addEventListener('visibilitychange', () => { if (!document.hidden) cdApply(); });
setInterval(() => { if (!document.hidden && D.s.cds && D.s.cd.length) { cdApply(); evNext(); } }, 30000);   // таймери оновлюються і перевіряються раз на 30 с
/* ---------- Сповіщення, коли таймер добіг кінця або настала дата події ---------- */
const EVQ = []; let evOpen = false, evBusy = false;
const isoOf = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const evKey = e => e.t + '|' + (e.tm || e.d);
/* дзеркало подій у малому ключі storage — з нього сповіщення показує фон на будь-якому сайті */
let evMir = '';
function evMirror() {
  const o = { on: !!D.s.cds, list: (D.s.cd || []).map(e => ({ k: evKey(e), t: e.t, tm: e.tm || '', x: e.x || 0, d: e.d || '', y: !!e.y })), tx: { k: L('ev_k'), t: L('ev_t'), d: L('ev_d'), ok: L('ev_ok') }, lang: LANG }, s = JSON.stringify(o);
  if (s !== evMir) { evMir = s; try { chrome.storage.local.set({ evc: o }); } catch { } }
}
async function evCheck() {
  if (!D || !D.s) return; evMirror(); if (!D.s.cds || evBusy) return; evBusy = true; const gone = [];
  try {
    const now = new Date(), iso = isoOf(now), got = await chrome.storage.local.get('evf'), f = got.evf || {}; let ch = false;
    for (const e of D.s.cd || []) if (e.tm && !e.x) { const [h, m] = e.tm.split(':').map(Number), t0 = new Date(now); t0.setHours(h, m, 0, 0);
      e.x = f[evKey(e)] === iso || e.f === iso || (t0 <= now && now - t0 < 216e5) ? t0.getTime() : tmNext(e.tm); gone.mig = 1; delete e.f; }   // старі таймери без мітки кінця
    for (const e of D.s.cd || []) {
      const k = evKey(e), fresh = f[k] !== iso;
      if (e.tm) { if (now.getTime() >= e.x) { if (fresh && now - e.x < 6e5) { f[k] = iso; ch = true; EVQ.push({ k: 'ev_t', n: e.t, s: e.tm }); } gone.push(e); } }
      else if (!e.y) { const n = cdDays(e); if (n === 0) { if (fresh) { f[k] = iso; ch = true; EVQ.push({ k: 'ev_d', n: e.t, s: fmtD(iso, { day: 'numeric', month: 'long', year: 'numeric' }) }); } gone.push(e); } else if (n === null) gone.push(e); }
      else if (cdDays(e) === 0 && fresh) { f[k] = iso; ch = true; EVQ.push({ k: 'ev_d', n: e.t, s: fmtD(iso, { day: 'numeric', month: 'long', year: 'numeric' }) }); }
    }
    if (ch) await chrome.storage.local.set({ evf: f });
    if (gone.length || gone.mig) { D.s.cd = D.s.cd.filter(e => !gone.includes(e)); save(); }   // виконана подія/таймер зі списку видаляється (щорічні лишаються)
  } catch { } finally { evBusy = false; }
  if (gone.length || gone.mig) cdApply(true);
  evNext();
}
function evNext() {
  if (evOpen || !EVQ.length || document.querySelector('dialog[open]')) return;
  const q = EVQ.shift(), d = $('#evn'); evOpen = true;
  $('#evn-t').textContent = L(q.k); $('#evn-n').textContent = q.n; $('#evn-s').textContent = q.s; d.showModal(); $('#evn-ok').focus();
}
$('#evn-ok').onclick = () => $('#evn').close();
$('#evn').addEventListener('close', () => { evOpen = false; setTimeout(evNext, 150); });
document.addEventListener('close', () => setTimeout(evNext, 150), true);

/* ---------- Автоблокування: після N хвилин бездіяльності сторінки з паролем знову закриваються ---------- */
const AL = { last: Date.now() };
const alAct = () => { AL.last = Date.now(); };   // лише мітка часу — без таймерів на кожну подію
['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(t => addEventListener(t, alAct, { passive: true, capture: true }));
const alTick = () => {
  if (!D || !D.s.al || !unl.size || Date.now() - AL.last <= (+D.s.alm || 5) * 60000) return;
  unl.clear(); renderTabs(); renderGrid();   // відкриті паролем сторінки знову заблоковані
};
setInterval(alTick, 5000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) alTick(); });
$('#lock-rst').onclick = () => $('#pwrst').click();   // «Скинути пароль» доступне просто з екрана блокування

/* ---------- Вікно «Що нового»: після оновлення коротко показує зміни (під час випуску оновлюйте v та items) ---------- */
const WN = {
  v: '1.97.0', date: '2026-11-12',
  last: ['lu_8'],
  blocks: [['fb_1', 'cat_tiles', 5], ['fb_2', 'cat_look', 4], ['fb_3', 'cat_fx', 3], ['fb_4', 'cat_profile', 6], ['fb_5', 'cat_nav', 2], ['fb_6', 'cat_main', 3]]   // [заголовок, значок із CATS, кількість пунктів fi_N_M]
};
if (typeof CHANGELOG !== 'undefined' && Array.isArray(CHANGELOG) && CHANGELOG[0] && CHANGELOG[0].v) WN.v = String(CHANGELOG[0].v);   // версія з файлу changelog.js
function wnShow() {
  const box = $('#wn-b'), cl = typeof CHANGELOG !== 'undefined' && Array.isArray(CHANGELOG) && CHANGELOG.length ? CHANGELOG : [{ v: WN.v, d: WN.date, items: WN.last.map(k => L(k)) }];
  const T = x => x && typeof x === 'object' && !Array.isArray(x) ? (x[LANG] || x.uk || x.en || '') : (x == null ? '' : String(x));
  const fmt = d => { try { return new Intl.DateTimeFormat(LANG, { day: 'numeric', month: 'long' }).format(new Date(d + 'T00:00:00')); } catch { return d || ''; } };
  box.replaceChildren(...cl.map(e => {
    const c = el('section', 'wl'), h = el('div', 'wdt'), dd = new Date(e.d + 'T00:00:00'), ok = !isNaN(dd);
    let dn = '', mn = e.d || ''; try { if (ok) { dn = String(dd.getDate()); mn = new Intl.DateTimeFormat(LANG, { month: 'long' }).format(dd); } } catch { }
    h.append(el('b', null, dn), el('span', null, mn));
    if (e.v) h.append(el('small', null, 'v' + e.v));
    const rt = el('div', 'wr'), ul = el('ul');
    (e.items || []).forEach(it => { const li = el('li'); if (Array.isArray(it)) li.append(el('b', null, T(it[0]) + ': '), document.createTextNode(T(it[1]))); else li.textContent = T(it); ul.append(li); });
    rt.append(ul);
    if (e.fixes && e.fixes.length) { const n = e.fixes.length, dt = el('details', 'wfx'), fu = el('ul'); e.fixes.forEach(f => fu.append(el('li', null, T(f)))); dt.append(el('summary', null, L(n === 1 ? 'wn_fix1' : (LANG === 'uk' && n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? 'wn_fix2' : 'wn_fix', n)), fu); rt.append(dt); }
    c.append(h, rt);
    return c;
  }));
  if (!$('#wn').open) { $('#wn').showModal(); box.scrollTop = 0; }
}
const wnClose = () => { $('#wn').close(); document.body.classList.remove('wnew'); if (D.sv !== WN.v) { D.sv = WN.v; save(); } };
$('#wn-ok').onclick = wnClose; $('#newsbtn').onclick = wnShow;
$('#wn').addEventListener('close', () => { document.body.classList.remove('wnew'); if (D.sv !== WN.v) { D.sv = WN.v; save(); } });

/* ---------- Інтерфейс: прозорість вікна, колір повзунків, колір фону ---------- */
const SLC = ['#d6194b', '#00e5ff', '#39ff14', '#a855f7', '#ff8a00'];
const PBG = [   // [акцент r g b, акцент2, акцент2 r g b, акцент1, акцент3, акцент3 r g b, свічення r g b, фон1, фон2, секції r g b, поля, шапка]
  ['224 53 155', '#ff5fb0', '255 95 176', '#e0359b', '#8a2be2', '138 43 226', '214 25 120', '#100820', '#1d0d33', '20 10 32', '#1c1030', '#14091f'],
  ['40 140 255', '#5fb4ff', '95 180 255', '#2f8cff', '#6a4dff', '106 77 255', '30 110 220', '#050c1e', '#0b1b3a', '6 14 34', '#0e1a33', '#08122a'],
  ['40 220 120', '#6dffa8', '109 255 168', '#22c55e', '#0e9f6e', '14 159 110', '20 180 90', '#04140c', '#082a1a', '6 24 16', '#0c2417', '#06180f'],
  ['255 70 90', '#ff7d8c', '255 125 140', '#ef3a4f', '#b3122a', '179 18 42', '220 30 50', '#180508', '#33101a', '28 8 12', '#2a0f16', '#1b070b'],
  ['150 160 180', '#c3cadb', '195 202 219', '#8a94ab', '#5b647a', '91 100 122', '120 130 150', '#0c0d10', '#1b1d24', '16 17 22', '#1a1c23', '#101116']
];
const POB = ['#ff4fa0', '#00e5ff', '#39ff14', '#a855f7', '#ffd400'];   // колір контура блоків налаштувань (-1 — за палітрою фону)
const PBV = ['--pk', '--pk2', '--pk2r', '--pk1', '--pk3', '--pk3r', '--pg', '--pb1', '--pb2', '--ps', '--pi', '--ph'];
function uiApply() {
  const s = D.s, ci = Math.min(4, Math.max(0, s.pcs | 0)), bi = Math.min(4, Math.max(0, s.pbs | 0));
  sv('--pop', (1 - s.pop * .005).toFixed(3)); sv('--cherry', SLC[ci]);
  PBV.forEach((v, i) => sv(v, PBG[bi][i]));
  const oi = Number.isInteger(s.pob) && s.pob >= 0 && s.pob < 5 ? s.pob : -1;
  if (oi < 0) { PNL.removeAttribute('data-ob'); PNL.style.removeProperty('--pob'); } else { PNL.dataset.ob = ''; const c = POB[oi]; PNL.style.setProperty('--pob', [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)).join(' ')); }
  [['#sws-c', ci], ['#sws-b', bi], ['#sws-o', oi]].forEach(([q, n]) => { const g = $(q); if (g) [...g.children].forEach((b, i) => { b.classList.toggle('on', i === n); b.setAttribute('aria-checked', i === n); }); });
}
function uiInit() {
  [['#sws-c', 'pcs', SLC], ['#sws-b', 'pbs', PBG.map(p => p[3])], ['#sws-o', 'pob', POB]].forEach(([q, k, cols]) => {
    const g = $(q); g.replaceChildren(); cols.forEach((c, i) => { const b = el('i', 'swb'); b.style.setProperty('--c', c); b.dataset.i = i; b.setAttribute('role', 'radio'); b.tabIndex = 0; g.append(b); });
    const pick = e => { const b = e.target.closest('.swb'); if (!b) return; D.s[k] = k === 'pob' && D.s.pob === +b.dataset.i ? -1 : +b.dataset.i; uiApply(); save(); };
    g.onclick = pick; g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e); } };
  });
}
/* Зсув по вертикалі: допустимий діапазон рахується з реальних розмірів, щоб плитки не заходили під пошук і не вилазили за край */
let foyRaf = 0;
function foyFit() {
  foyRaf = 0; if (!D || D.s.tpl === 'wall') return;
  const m = $('main'), g = $('#grid'), pt = parseFloat(getComputedStyle(m).paddingTop) || 0, ex = parseFloat(rs.getPropertyValue('--rex')) || 0;
  const lo = -Math.max(0, Math.floor(pt - 6)), hi = Math.max(0, Math.floor(m.clientHeight - 6 - pt - g.offsetHeight - ex));
  const i = document.querySelector('input[data-k=foy]');
  if (i && (+i.min !== lo || +i.max !== Math.max(lo + 1, hi))) { i.min = lo; i.max = Math.max(lo + 1, hi); }
  const v = Math.min(hi, Math.max(lo, D.s.foy | 0)); sv('--foy', v + 'px');
  if (i && +i.value !== v) i.value = v; if (i) setP(i);
}
const foyLater = () => { if (!foyRaf) foyRaf = requestAnimationFrame(foyFit); };
let bgKey = '', wlKey = '', wtpPx = 1400;
const mbox = { w: 0, h: 0 }, WMAX = 300;
const cellsN = () => page().t.reduce((a, t) => a + (t.cw || 1) * (t.ch || 1), 1);   // з кнопкою «+»
function fitK(w, h, gp, wl, ce) {   // найбільший множник масштабу, при якому вся сітка лишається у вікні
  const W = mbox.w, H = Math.max(120, mbox.h - 6);
  if (wl) { const r = Math.ceil((page().t.length + 1) / (ce || 1)); return Math.max(0.1, Math.min(2, (W - (ce - 1) * gp) / (ce * w), (H - (r - 1) * gp) / (r * h))); }
  const ex = parseFloat(rs.getPropertyValue('--rex')) || 0, n = cellsN(), ok = k => { const c = Math.max(1, Math.floor((W + gp) / (w * k + gp))); return w * k <= W && Math.ceil(n / c) * (h * k + gp + ex) - gp <= H; };
  if (ok(2)) return 2; let lo = 0.1, hi = 2; for (let i = 0; i < 12; i++) { const m = (lo + hi) / 2; if (ok(m)) lo = m; else hi = m; } return lo;
}
const scMax = (k, kmax) => { const i = document.querySelector(`input[data-k=${k}]`); if (!i) return; const m = Math.max(+i.min + 10, Math.min(200, Math.floor(kmax * 100))); if (+i.max !== m) { i.max = m; setP(i); } };
const pncTxt = () => { hcList(); const t = $('#pnc-t'); if (t) t.textContent = L(D.s.pnc !== false ? 'sw_on' : 'sw_off'); const u = $('#hc-t'); if (u) u.textContent = L(D.s.hc ? 'sw_on' : 'sw_off'); const v = $('#hs-t'); if (v) v.textContent = L(D.s.hs ? 'sw_on' : 'sw_off'); };
const pncSync = () => { pncTxt(); try { chrome.storage.local.set({ pnc: D.s.pnc !== false }); } catch { } };   // окремий малий ключ для скрипта-перехоплювача (не тягнемо всі дані на кожен сайт)
/* Автоочистка історії: малий ключ 'hc' читає фоновий скрипт; дозвіл «history» — необов'язковий, просимо при вмиканні */
/* список сайтів, історія яких чиститься окремо від решти (повністю, незалежно від обраного періоду) */
const hcNorm = v => { v = (v || '').trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/^www\./, '').split(/[\/?#:]/)[0]; return /^[a-z0-9\u0400-\u04ff-]+(\.[a-z0-9\u0400-\u04ff-]+)+$/.test(v) ? v : ''; };
function hcList() {   // сайти в інтерфейсі не показуємо — лише індикатор на кнопці «Список»
  const a = D.s.hcl || [], g = $('#hc-now'), s = $('#hs-now'), l = $('#hc-ls');
  if (g) g.disabled = !D.s.hc; if (s) s.disabled = !D.s.hs || !a.length; if (l) l.classList.toggle('has', a.length > 0);
}
function hcAdd() {
  const i = $('#hc-site'), h = hcNorm(i.value); if (!h) { i.classList.add('bad'); setTimeout(() => i.classList.remove('bad'), 600); return; }
  D.s.hcl = [...new Set([...(D.s.hcl || []), h])].slice(0, 100); i.value = ''; hcList(); save(); hcSync();
}
/* вікно зі списком сайтів — у стилі «матриці» */
const BL = $('#bl');
function blDraw() {
  const a = D.s.hcl || [], on = !!D.s.hs, g = $('#bl-g'); BL.dataset.m = ''; $('#bl .blk').textContent = '// CLASSIFIED'; $('#bl-f').hidden = true; { const h2 = $('#bl h2'); h2.dataset.i18n = 'hc_sites'; h2.textContent = L('hc_sites'); }
  $('#bl-n').textContent = L('hc_tot') + ': ' + a.length; $('#bl-s').textContent = L(on ? 'hc_act' : 'hc_pau'); $('#bl-s').className = on ? 'on' : 'off';
  g.replaceChildren(...(a.length ? a.map((h, i) => { const r = el('div', 'blr'), n = el('b', null, '#' + String(i + 1).padStart(3, '0')), t = el('span', 'blt', h), s = el('i', on ? 'on' : 'off', '— ' + L(on ? 'hc_act' : 'hc_pau')), x = el('button', null, '×'); x.type = 'button'; x.title = L('delete'); x.onclick = () => { D.s.hcl = a.filter(q => q !== h); hcList(); blDraw(); save(); hcSync(); }; r.append(n, t, s, x); return r; }) : [el('div', 'blz', L('hc_empty'))]));
}
$('#hc-ls').onclick = () => { blDraw(); BL.showModal(); };
$('#bl-x').onclick = () => BL.close(); BL.addEventListener('click', e => { if (e.target === BL) BL.close(); });
$('#hc-add').onclick = hcAdd; $('#hc-site').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); hcAdd(); } });
/* «Режим захисту»: налаштування передаємо у фон (код і його хеш зберігає лише фон) */
let pmLast = '';
async function pmSync(force) {
  pmBtn();
  const cfg = { on: !!D.s.prm, m: +D.s.pmi || 5, t: D.s.pmt || 'fake', tx: { t: L('pm_lt'), p: L('pm_lp') } }, k = JSON.stringify(cfg);
  if (k === pmLast && !force) return; pmLast = k;
  try { pmUi(await chrome.runtime.sendMessage({ t: 'pm-cfg', cfg })); } catch { }
}
let pmHas = false;
/* «Заблокувати зараз» активна лише якщо захист увімкнено і (код фейковий або справжній код уже задано) */
function pmBtn() { const n = $('#pm-now'); if (n) n.disabled = !(D.s.prm && (D.s.pmt !== 'real' || pmHas)); }
function pmUi(has) { pmHas = !!has; pmBtn(); const s = $('#pm-st'); if (s) { s.textContent = L(has ? 'pm_set' : 'pm_unset'); s.className = has ? 'on' : 'off'; } }
$('#pm-code').onclick = async () => {
  const a = await mx(L('pm_new'), { input: 1, pw: 1, valid: v => v.length >= 4 }); if (!a) return;
  const b = await mx(L('pm_rep'), { input: 1, pw: 1, valid: v => v.length > 0 }); if (b == null) return;
  if (a !== b) return mxAlert(L('pm_mis'));
  try { await chrome.runtime.sendMessage({ t: 'pm-set', c: a }); pmUi(true); } catch { }
};
$('#pm-now').onclick = () => { try { chrome.runtime.sendMessage({ t: 'pm-lock' }); } catch { } };
let hcLast; const hcSync = () => { try { chrome.storage.local.set({ hc: { on: !!D.s.hc, h: +D.s.hcp || 0, w: D.s.hcw || 'm', son: !!D.s.hs, sw: D.s.hsw || 'm', sites: D.s.hcl || [] } }); } catch { } };
for (const k of ['hc', 'hs']) document.querySelector('[data-k=' + k + ']').addEventListener('change', async e => {
  if (!e.target.checked) return;
  let ok = false; try { ok = await chrome.permissions.request({ permissions: ['history'] }); } catch { }
  if (!ok) { e.target.checked = false; e.target.dispatchEvent(new Event('input', { bubbles: true })); }
});
for (const [id, t] of [['hc-now', 'hc-now'], ['hs-now', 'hs-now']]) $('#' + id).onclick = async () => {
  const b = $('#' + id); let ok = false; if (b.disabled) return;
  try { ok = await chrome.permissions.request({ permissions: ['history'] }); } catch { }
  if (!ok) { b.textContent = L('hc_deny'); setTimeout(() => { b.textContent = L('hc_now'); }, 2500); return; }
  hcSync(); let n = 0; try { n = await chrome.runtime.sendMessage({ t }); } catch { }
  if (!n) return;
  b.textContent = '✓ ' + L('hc_done'); setTimeout(() => { b.textContent = L('hc_now'); }, 2500);
};
let pncLast; async function applyS() {
  { const k = [D.s.hc, D.s.hcp, D.s.hcw, D.s.hs, D.s.hsw, (D.s.hcl || []).join('|')].join(); if (k !== hcLast) { hcLast = k; hcSync(); pncTxt(); } }
  if (D.s.pnc !== pncLast) { pncLast = D.s.pnc; pncSync(); }
  pmSync();
  if (D.s.tpl !== 'wall' && D.p.some(p => p.nx)) {   // повернулись із 3D-стіни: автоматичні сторінки-продовження зливаються назад
    const sg = D.p.map(p => p.t.length).join(); mergePages(D);
    if (D.p.map(p => p.t.length).join() !== sg) { if (!D.p.some(p => p.id === D.cur)) D.cur = D.p[0].id; renderTabs(); redraw(); save(); }
  }
  if (D.p.some(p => p.t.length > limOf(D))) { splitPages(D); if (!D.p.some(p => p.id === D.cur)) D.cur = D.p[0].id; renderTabs(); redraw(); save(); limHit = 0; }
  const s = D.s, b = document.body, pn = $('#panel'), pc = s.pr ? '#ff2d2d' : s.pc;
  let w = s.w, h = s.h, ce = 0, gp = s.gap;
  const wl = s.tpl === 'wall';
  if (wl) gp = s.wgap + (Math.abs(s.wcv) + Math.abs(s.wvt)) * 0.3;   // свій відступ стіни + запас на вигині, щоб плитки не наїжджали
  if (wl && mbox.w) {   // стіна: підбір колонок і розміру так, щоб заповнити екран
    const n = page().t.length + 1, W = Math.min(mbox.w, 2400) * s.wfill / 100, H = Math.max(120, mbox.h - 6) * s.wfill / 100, asp = s.wasp;
    const cands = s.wcol > 0 ? [s.wcol] : s.wrow > 0 ? [Math.ceil(n / s.wrow)] : Array.from({ length: Math.min(n, 14) }, (_, i) => i + 1);
    let best = null;
    for (const c of cands) { const r = Math.ceil(n / c), wc = Math.min((W - gp * (c - 1)) / c, ((H - gp * (r - 1)) / r) * asp); if (!best || wc > best.w) best = { w: wc, c }; }
    w = Math.min(Math.max(40, best.w), WMAX); h = w / asp; ce = best.c;
  }
  sv('--rex', (s.tsh && s.tpos === 'under' && !wl ? Math.round(s.tfs * 1.7) : 0) + 'px');
  {   // масштаб усіх плиток (у кожного вигляду свій), але так, щоб сітка не виходила за межі вікна
    const k0 = (wl ? s.wsc : s.sc) / 100, kmax = mbox.w ? fitK(w, h, gp, wl, ce) : 2, k = Math.min(k0, kmax);
    w *= k; h *= k; scMax(wl ? 'wsc' : 'sc', kmax);
  } curH = h;
  sv('--w', w.toFixed(1) + 'px'); sv('--h', h.toFixed(1) + 'px'); sv('--gap', gp + 'px'); sv('--r', (wl ? s.wrad : s.r) + 'px'); sv('--fs', s.fs + 'px'); sv('--op', s.op);
  sv('--dim', s.bt === 'image' ? s.dim : 0);
  b.classList.toggle('nt', !s.tsh); b.classList.toggle('tu', s.tsh && s.tpos === 'under' && !wl); sv('--rex', (s.tsh && s.tpos === 'under' && !wl ? Math.round(s.tfs * 1.7) : 0) + 'px'); fontOpts(); setA(pn, 'bt', s.bt);
  sv('--tfs', s.tfs + 'px'); sv('--tf', s.tf); uiApply(); unApply(); cdApply(); foyLater(); sv('--tw', s.tw ? 700 : 400); sv('--ti', s.ti ? 'italic' : 'normal'); sv('--tsw', s.tsk ? '2px' : '0px'); sv('--tskc', s.tskc); fontBtn();
  sv('--tc', s.tc); sv('--nc', s.nc); sv('--tcl', s.tcl || s.nc); sv('--tr', (s.tr ?? 20) + 'px'); sv('--tg', (s.tg ?? 18) + 'px'); if (tV && tV.pg !== s.tg) { tV.pg = s.tg; tabsLayout(false); } sv('--nt', s.nt + 'px');
  b.classList.toggle('neon', !!s.neon);
  setA(b, 'nb', s.nb); 
  const hw = ['blood', 'fire', 'leaves', 'snow', 'stars', 'glitch', 'sheen'].includes(s.pm);   // Halloween-стилі мають власні кольори
  sv('--pcol', pc); sv('--pdur', (6 / s.ps).toFixed(2) + 's');
  sv('--pz', s.pz + 'px'); sv('--pt', s.pt + 'px'); sv('--pi', s.pi);
  sv('--pq', { linear: 'linear', smooth: 'cubic-bezier(.4,0,.2,1)', out: 'ease-out', steps: 'steps(8)' }[s.pq] || 'linear');
  sv('--pdir', s.pd); sv('--prs', (13 - s.prv) + 's');
  const seg = 360 / s.pk, A = seg * (1 - s.pl / 100), tail = seg - A, f = n => n.toFixed(1) + 'deg';
  sv('--pstops', s.pr
    ? `transparent 0deg,transparent ${f(A)},#a855f7 ${f(A + tail * 0.3)},#22d3ee ${f(A + tail * 0.65)},#4ade80 ${f(seg)}`
    : `transparent 0deg,transparent ${f(A)},${pc} ${f(seg)}`);
  setA(fx, 'm', s.pm); fx.toggleAttribute('data-rgb', !!s.pr && !hw);
  const fl = []; if (!hw && s.pg > 0) fl.push(`drop-shadow(0 0 ${s.pg}px ${pc})`); if (s.pr && !hw) fl.push('hue-rotate(var(--hue))');
  const fv = fl.join(' ') || 'none'; if (fx.style.filter !== fv) fx.style.filter = fv;   // фільтр лише коли він потрібен
  setA(pn, 'pm', s.pm); pn.toggleAttribute('data-pr', !!s.pr);
  if (!s.pe) fx.classList.remove('on');
  b.classList.toggle('tilt', !!s.tilt && !wl); b.classList.toggle('glare', !!s.glare && !wl);
  b.classList.toggle('rm', !!s.rm); b.classList.toggle('ta', !!s.ta); b.classList.toggle('nosb', !s.sb); b.classList.toggle('sbtop', !!s.st);
  sv('--sw', s.sw + 'px'); sv('--ts', s.ts);
  b.classList.toggle('wall', wl); setA(b, 'wva', s.wva); b.classList.toggle('wwc', wl && page().t.length <= 150);
  sv('--wrx', s.wrx + 'deg'); sv('--wry', s.wry + 'deg'); sv('--wox', s.wox + 'px'); sv('--woy', s.woy + 'px'); sv('--wz', s.wz + 'px');
  if (wl && ce > 0) {   // відстань перспективи пропорційна розміру стіни: вигляд однаковий на великих і малих плитках
    const rr = Math.ceil((page().t.length + 1) / ce), gw = ce * w + (ce - 1) * gp, gh = rr * h + (rr - 1) * gp;
    wtpPx = Math.round(s.wpd / 1400 * Math.max(gw, gh * 1.3)); sv('--wtp', wtpPx + 'px');
  }
  { const wb = $('#wallbtn'), wt = L(wl ? 'wall_on_tip' : 'wall_off_tip'); if (wb.title !== wt) { wb.title = wt; wb.setAttribute('aria-label', L('wall_aria')); } }
  b.classList.toggle('fitc', wl); b.classList.toggle('noic', !s.icv); sv('--icl', s.icl / 100); setA(pn, 'tpl', s.tpl);
  sv('--cols', ce); sv('--ics', s.ics / 100);
  if (wl && ce > 0) {
    const wk = [w.toFixed(1), h.toFixed(1), gp, ce, mbox.w, mbox.h, page().t.length, s.wcv, s.wvt, s.wrx, s.wry, s.wpd, s.wz].join('|');
    if (wk !== wlKey) { wlKey = wk; wallLayout(); }
  }
  const bl = s.bt === 'image' ? s.blur : 0, bk = [s.bt, s.c1, s.c2, s.bi, bl].join('|');
  if (bk !== bgKey) {   // фон перемальовуємо лише при зміні
    bgKey = bk; const bg = $('#bg');
    bg.style.backgroundColor = s.c1; bg.style.backgroundImage = 'none';
    bg.style.filter = bl ? `blur(${bl}px)` : 'none'; bg.style.transform = bl ? 'scale(1.08)' : 'none';
    if (s.bt === 'gradient') bg.style.backgroundImage = `linear-gradient(135deg,${s.c1},${s.c2})`;
    else if (s.bt === 'image' && s.bi) { const u = await imgUrl(s.bi); if (u && bgKey === bk) bg.style.backgroundImage = `url(${u})`; if (u && localStorage.getItem('sdbk') !== s.bi) idle(() => mkThumb(u, s.bi)); }
  }
  try { localStorage.setItem('sdp', JSON.stringify({ bt: s.bt, c1: s.c1, c2: s.c2, bi: s.bi, dim: s.dim })); } catch { }
}
const idle = f => (window.requestIdleCallback || setTimeout)(f, { timeout: 1500 });
async function mkThumb(u, id) {   // мініатюра фону для миттєвого показу при наступному відкритті
  try {
    const b = await (await fetch(u)).blob(), im = await createImageBitmap(b), k = Math.min(1, 1280 / im.width), c = new OffscreenCanvas(Math.round(im.width * k), Math.round(im.height * k));
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    const d = await b2d(await c.convertToBlob({ type: 'image/webp', quality: 0.6 }));
    if (d.length < 1.5e6) { localStorage.setItem('sdb', d); localStorage.setItem('sdbk', id); }
  } catch { }
}
function wallLayout() {   // геометрія стіни: кожна плитка лежить на вигнутій поверхні; рахується раз на зміну розкладки
  if (D.s.tpl !== 'wall') return;
  const els = [...gridEl.children].filter(n => n.classList.contains('tile') || n.classList.contains('add')); if (!els.length) return;
  const s = D.s, W = gridEl.clientWidth / 2, H = gridEl.clientHeight / 2, P = wtpPx;
  const pos = els.map(n => [n.offsetLeft + n.offsetWidth / 2 - W, n.offsetTop + n.offsetHeight / 2 - H]);   // центр плитки відносно центру стіни (усі читання — до записів)
  const hx = Math.max(1, ...pos.map(p => Math.abs(p[0]))), hy = Math.max(1, ...pos.map(p => Math.abs(p[1])));
  const R = Math.PI / 180, cv = s.wcv * R, vt = s.wvt * R, cA = Math.cos(s.wry * R), sA = Math.sin(s.wry * R), cX = Math.cos(s.wrx * R), sX = Math.sin(s.wrx * R);
  els.forEach((n, i) => {
    const [dx, dy] = pos[i], th = dx / hx * cv, ph = dy / hy * vt;
    let X = dx, Y = dy, Z = 0;   // точка на поверхні: ввігнутий циліндр по X і по Y (від'ємний кут — опукла стіна)
    if (Math.abs(cv) > 1e-4) { const r = hx / cv; X = r * Math.sin(th); Z += r * (1 - Math.cos(th)); }
    if (Math.abs(vt) > 1e-4) { const r = hy / vt; Y = r * Math.sin(ph); Z += r * (1 - Math.cos(ph)); }
    const x1 = X * cA + Z * sA, z1 = -X * sA + Z * cA;        // поворот усієї стіни: спочатку навколо Y, потім нахил назад навколо X
    const y2 = Y * cX - z1 * sX, z2 = Y * sX + z1 * cX;
    const k = s.wz / Math.max(1, P - z2), st = n.style;        // при наведенні центр плитки в проєкції лишається на місці: край не «тікає» з-під курсора
    st.setProperty('--tx', (x1 - dx).toFixed(1) + 'px'); st.setProperty('--ty', (y2 - dy).toFixed(1) + 'px'); st.setProperty('--tz', z2.toFixed(1) + 'px');
    st.setProperty('--ta', (ph / R).toFixed(2) + 'deg'); st.setProperty('--tb', (-th / R).toFixed(2) + 'deg');
    st.setProperty('--hx', (-x1 * k).toFixed(1) + 'px'); st.setProperty('--hy', (-y2 * k).toFixed(1) + 'px');
  });
}
function setP(i) {   // заливка повзунка + значення у відсотках його діапазону (точне значення — у підказці)
  const p = (i.value - i.min) / (i.max - i.min) * 100; i.style.setProperty('--p', p + '%');
  const o = i.nextElementSibling; if (o && o.tagName === 'OUTPUT') o.textContent = Math.round(p) + '%';
  i.title = L('value', i.value);
}
let deps = null, ctls = null;   // списки елементів кешуються: DOM налаштувань не змінюється
const compileShow = expr => {   // "tpl=wall&neon" → [шаблонна частина, решта]: шаблон ховає опцію, вимкнений перемикач лише притушує (макет не стрибає)
  const mk = ps => st => ps.every(f => f(st));
  const tp = [], ot = expr.split('&').map(p => {
    const m = /^(!?)(\w+)(?:(!?=)(.*))?$/.exec(p); if (!m) return () => true;
    const f = st => { const v = st[m[2]]; if (m[3]) { const eq = String(v) === m[4]; return m[3] === '=' ? eq : !eq; } return m[1] ? !v : !!v; };
    if (m[2] === 'tpl') { tp.push(f); return null; } return f;
  }).filter(Boolean);
  return [mk(tp), mk(ot)];
};
let pcN = 0, pcDh = -1, pcRaf = 0;
const secKey = s => s.firstElementChild.dataset.i18n;
const secOrder = secs => { const po = D.po || [], pos = s => { const i = po.indexOf(secKey(s)); return i < 0 ? 1000 + (+s.dataset.i || 0) : i; }; secs.forEach((s, i) => { if (s.dataset.i == null) s.dataset.i = i; }); return secs.sort((a, b) => pos(a) - pos(b)); };
/* ---------- Меню за категоріями: бокова панель категорій + секції вибраної категорії ---------- */
const CI = p => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const CATS = [
  ['cat_main', 's_lang s_ui s_data s_reset', CI('<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>')],
  ['cat_tiles', 's_tpl s_tiles s_icons s_titles s_wpre s_wlay s_wcurve s_whover', CI('<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>')],
  ['cat_look', 's_themes s_bg', CI('<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 1.6-2.2-.5-1.3.3-2.3 1.6-2.3H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>')],
  ['cat_fx', 's_tilt s_pulse s_neon', CI('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>')],
  ['cat_nav', 's_tabs s_search', CI('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>')],
    ['cat_profile', 's_name s_cd s_alock s_hist s_panic s_prot s_lp', CI('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>')]
];
function catBuild() {
  const nav = $('#pnav'); nav.replaceChildren(...CATS.map(([k, , svg], i) => { const b = el('div', 'cb'); b.role = 'tab'; b.tabIndex = 0; b.dataset.c = i; b.innerHTML = svg; const sp = el('span'); sp.dataset.i18n = k; sp.textContent = L(k); b.append(sp); return b; }));
  const pick = e => { const b = e.target.closest('.cb'); if (!b) return; D.s.pcat = +b.dataset.c; catApply(); balanceLater(); save(); };
  nav.onclick = pick; nav.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e); } };
}
function catApply() {
  const cat = D.s.lay === 'cat', ci = Math.min(CATS.length - 1, Math.max(0, D.s.pcat | 0)), keys = CATS[ci][1].split(' ');
  PNL.dataset.lay = cat ? 'cat' : 'cur';
  const gk = cat ? 'pwc' : 'pw'; if (gk !== GK) { GK = gk; loadGeo(false); }   // для кожного вигляду меню — свій розмір і положення
  document.querySelectorAll('#pnav .cb').forEach((b, i) => { b.classList.toggle('on', i === ci); b.setAttribute('aria-selected', i === ci); });
  document.querySelectorAll('.pcols section').forEach(s => s.classList.toggle('cx', cat && !keys.includes(secKey(s))));
  phFirst();
}
function balanceCols() {   // колонки панелі розкладаємо один раз (а не CSS multicol): зміна повзунка перераховує лише свою колонку
  pcRaf = 0; if (!PNL.classList.contains('open')) { pcN = 0; return; }
  catApply();
  const pc = $('.pcols'), n = Math.min(D.s.lay === 'cat' ? 1 : 9, Math.max(1, Math.floor(($('.pb').clientWidth - 32 + 22) / (235 + 22)))), secs = secOrder([...pc.querySelectorAll('section')]);
  const cols = Array.from({ length: n }, () => el('div', 'pcol')); pc.replaceChildren(...cols); cols[0].append(...secs);
  const hs = secs.map(s => s.offsetHeight), tot = hs.reduce((a, b) => a + b, 0) / n; let c = 0, acc = 0;
  secs.forEach((s, i) => { if (acc > 0 && c < n - 1 && acc + hs[i] / 2 > tot) { c++; acc = 0; } cols[c].append(s); acc += hs[i]; });
  pcN = n;
}
/* права панель: опис функції, над якою курсор (або фокус) */
let phKey = '';
function phShow(sec) {
  const k = sec && secKey(sec); if (!k || k === phKey) return; phKey = k;
  const cs = CATS.find(c => c[1].split(' ').includes(k)); $('#ph-t').textContent = L(k);
  $('#ph-p').textContent = L('h_' + k); $('#phelp .phi').innerHTML = cs ? cs[2] : '';
}
const phFirst = () => { phKey = ''; const s = [...document.querySelectorAll('.pcols section')].find(x => !x.classList.contains('cx') && !x.classList.contains('dh')); if (s) phShow(s); else { $('#ph-t').textContent = ''; $('#ph-p').textContent = L('h_none'); } };
$('.pb').addEventListener('mouseover', e => phShow(e.target.closest('section')));
$('.pb').addEventListener('focusin', e => phShow(e.target.closest('section')));
const balanceLater = () => { if (!pcRaf) pcRaf = requestAnimationFrame(balanceCols); };
function updDeps() {   // ховає опції, які не впливають на поточний шаблон або залежать від вимкнених перемикачів
  if (!deps) deps = [...document.querySelectorAll('[data-show]')].map(e => [e, compileShow(e.dataset.show)]);
  const st = D.s; let dh = 0; deps.forEach(([e, [a, b]]) => { const hid = !a(st); if (hid) dh++; e.classList.toggle('dh', hid); const off = !b(st); e.classList.toggle('dd', off); e.inert = off; });
  if (dh !== pcDh) { pcDh = dh; balanceLater(); }   // набір схованих опцій змінився → перебалансувати колонки   // шаблон — ховаємо; вимкнений перемикач — притушуємо, місце лишається
}
const VIRT = { tcl: st => st.tcl || st.nc, sbb: st => !!(st.sb && !st.st), st: st => !!(st.sb && st.st) };   // пошук: «внизу» / «вгорі» — взаємовиключні галочки
const ctlVal = i => { const k = i.dataset.k; return k in VIRT ? VIRT[k](D.s) : D.s[k]; };
let apRaf = 0; const applyLater = () => { if (!apRaf) apRaf = requestAnimationFrame(() => { apRaf = 0; applyS(); }); };
const COUNT_K = ['wcol', 'wrow', 'pk'];   // кількості (колонки, рядки, сегменти) — цілі, тому крок лишається цілим
function fineSteps() {   // крок кожного повзунка = рівно 1% його шкали (100 положень); рахунки не чіпаємо
  document.querySelectorAll('input[type=range][data-k]').forEach(i => {
    if (COUNT_K.includes(i.dataset.k)) { i.step = 1; return; }
    i.step = +((i.max - i.min) / 100).toPrecision(6);
  });
}
/* Перемикач-тулбар замість випадного списку: <select data-seg> лишається джерелом значення, кнопки лише дзеркалять його */
const SEGS = [];
function segInit() {
  document.querySelectorAll('select[data-seg]').forEach(s => {
    if (s._seg) return; const bar = el('div', 'seg'); s._seg = bar; s.parentElement.classList.add('sg'); s.after(bar); SEGS.push(s);
    bar.onclick = e => { const b = e.target.closest('button'); if (!b) return; s.value = b.dataset.v; s.dispatchEvent(new Event('input', { bubbles: true })); segSync(); };
  });
}
function segSync() {
  SEGS.forEach(s => {
    const bar = s._seg, o = [...s.options]; if (s.dataset.min) o.forEach(x => { x.textContent = L('cd_m', x.value); }); else if (s.dataset.lbl) o.forEach(x => { x.textContent = L(s.dataset.lbl + x.value); });
    if (bar.children.length !== o.length) bar.replaceChildren(...o.map(x => { const b = el('button'); b.type = 'button'; b.dataset.v = x.value; return b; }));
    o.forEach((x, i) => { const b = bar.children[i]; if (b.textContent !== x.textContent) b.textContent = x.textContent; b.classList.toggle('on', x.value === s.value); });
  });
}
function sync() {
  if (!ctls) fineSteps();
  (ctls || (ctls = [...document.querySelectorAll('[data-k]')])).forEach(i => {
    const v = ctlVal(i); if (i.type === 'checkbox') i.checked = !!v; else i.value = v; if (i.type === 'range') setP(i);
  });
  updDeps(); segSync();
}
const lockIcon = open => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('class', 'lki'); s.innerHTML = open ? '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>' : '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'; return s; };
const TVIS = 5, TSIDE = 330;   // видимих вкладок одночасно; місце під праву панель кнопок (дзеркально й зліва)
let tOff = 0, tLast = null, tV = null;
function tabsLayout(anim) {   // вікно з видимими вкладками: ширина й зсув, зі слайдом
  if (!tV) return; const { vp, trk, tb, prev, next } = tV, N = tb.length;
  const pos = tb.map(b => b.offsetLeft), wd = tb.map(b => b.offsetWidth);
  const avail = Math.max(120, innerWidth - 2 * TSIDE - 3 * 38 - 24);
  let k = Math.min(TVIS, N); const span = (o, c) => pos[o + c - 1] + wd[o + c - 1] - pos[o];
  tOff = Math.max(0, Math.min(tOff, N - 1)); while (k > 1 && (span(Math.min(tOff, N - k), k) > avail)) k--;
  tOff = Math.max(0, Math.min(tOff, N - k)); tV.k = k;
  vp.style.transition = trk.style.transition = anim ? '' : 'none';
  const pad = (D.s.tg ?? 18) * 1.5 + 6; vp.style.width = (span(tOff, k) + 2 * pad) + 'px';
  clearTimeout(tV.ht); tb.forEach(b => b.style.visibility = '');   // на час слайду видно всі; потім ховаємо ті, що за межами вікна (щоб їхні краї не визирали в зоні розсіювання)
  const hide = () => tb.forEach((b, i) => { b.style.visibility = i < tOff || i >= tOff + k ? 'hidden' : ''; });
  if (anim) tV.ht = setTimeout(hide, 280); else hide(); trk.style.transform = `translateX(${-pos[tOff]}px)`;
  prev.disabled = tOff <= 0; next.disabled = tOff >= N - k;
}
function tabsScroll(d) { if (!tV) return; tOff += d; tabsLayout(true); }
function renderTabs() {
  const n = $('#tabs'), plus = el('button', 'tab plus', '+'); plus.id = 'addp'; plus.title = L('p_new_tip'); plus.setAttribute('aria-label', L('p_new_tip'));
  const tb = D.p.map(p => { const b = el('button', 'tab' + (p.id === D.cur ? ' on' : '') + (p.pw ? ' lk' : ''), p.name); b.dataset.id = p.id; const tc = el('i', 'tc', tcTxt(p)); tc.title = L('cnt_tip'); b.append(tc); if (p.pw) { b.title = L(isLocked(p) ? 'pw_locked' : 'pw_unlocked'); b.prepend(lockIcon(!isLocked(p))); } return b; });
  if (tb.length <= TVIS) { tV = null; n.classList.remove('slide'); n.replaceChildren(...tb, plus); tLast = D.cur; return; }
  const mkn = (c, t) => { const b = el('button', 'tnav'); b.type = 'button'; b.title = L(t); b.setAttribute('aria-label', L(t)); return b; };
  const prev = mkn('‹', 'tabs_prev'), next = mkn('›', 'tabs_next'), vp = el('div', 'tv'), trk = el('div', 'ttr');
  prev.id = 'tprev'; next.id = 'tnext'; trk.append(...tb); vp.append(trk); n.classList.add('slide'); n.replaceChildren(prev, vp, next, plus);
  tV = { vp, trk, tb, prev, next, k: TVIS };
  if (D.cur !== tLast) { const a = D.p.findIndex(p => p.id === D.cur); tabsLayout(false); if (a < tOff) tOff = a; else if (a >= tOff + tV.k) tOff = a - tV.k + 1; }   // перейшли на іншу сторінку — показуємо її
  tLast = D.cur; tabsLayout(false);
}
let tRz = 0; addEventListener('resize', () => { clearTimeout(tRz); tRz = setTimeout(() => tV && tabsLayout(false), 120); });
function favImg(u, txt, px) {
  const im = new Image(); im.alt = ''; im.decoding = 'async';
  const local = () => { im.onload = null; im.onerror = () => im.replaceWith(document.createTextNode((txt || '?')[0].toUpperCase())); im.src = favLocal(u || '', px); };
  if (D.s.ic === 'google' && !TEST && /^https?:/i.test(u || '')) {   // якісна іконка; якщо немає або замала — локальна
    im.referrerPolicy = 'no-referrer'; im.onerror = local; im.onload = () => { if (im.naturalWidth < 32) local(); }; im.src = favRemote(u, px);
  } else local();
  return im;
}
// джерело зображення плитки: обране користувачем (dm), якщо воно призначене; інакше авто: знімок → URL → своя іконка → іконка сайту
const srcOf = t => { const d = t.dm; if (d === 'fav') return null; if (d === 'shot' && t.si) return 'shot'; if (d === 'url' && t.iu) return 'url'; if (d === 'icon' && t.img) return 'icon'; return t.si ? 'shot' : t.iu ? 'url' : t.img ? 'icon' : null; };
const pq = []; let pr = 0;   // черга підвантаження зображень плиток: порціями по кадрах, щоб не блокувати перший показ
const paced = fn => { pq.push(fn); if (!pr) pr = requestAnimationFrame(pdrain); };
function pdrain() { pr = 0; const t0 = performance.now(); while (pq.length && performance.now() - t0 < 6) { const f = pq.shift(); try { f(); } catch { } } if (pq.length) pr = requestAnimationFrame(pdrain); }
const shotUrl = async t => {   // на плитку — легка мініатюра (декодується в рази швидше); великий знімок лише для збільшених плиток
  if (t.st && (t.cw || 1) < 2 && (t.ch || 1) < 2) { const u = await imgUrl(t.st); if (u) return u; }
  return imgUrl(t.si);
};
async function thumbOf(b) {   // WebP шириною 560 px; для малих знімків мініатюра не потрібна
  const im = await createImageBitmap(b); if (im.width <= 700) { im.close(); return null; }
  const k = 560 / im.width, w = 560, h = Math.round(im.height * k), c = new OffscreenCanvas(w, h), x = c.getContext('2d');
  x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, w, h); im.close();
  const id = uid(); await imgPut(id, await c.convertToBlob({ type: 'image/webp', quality: 0.85 })); return id;
}
async function thumbAll() {   // одноразово створює мініатюри для вже збережених знімків: по одному, у фоні
  const todo = D.p.flatMap(p => walk(p.t)).filter(t => t.si && !t.st && !t.stn);
  for (const t of todo) {
    while (document.hidden) await new Promise(r => setTimeout(r, 3000));
    try { const si = t.si, b = await imgGet(si); if (b && t.si === si) { const id = await thumbOf(b); if (id) t.st = id; else t.stn = 1; save(); } else if (!b) t.stn = 1; } catch { }
    await new Promise(r => setTimeout(r, 150));
  }
}
function visit(t) {
  if (!t || t.folder) return; t.v = (t.v || 0) + 1;
  save(); flush();
}
function mkTile(t) {
  const f = !!t.folder, a = el('a', 'tile' + (f ? ' folder' : ''));
  if (f) { a.tabIndex = 0; a.setAttribute('role', 'button'); a.title = `${t.title} (${t.t.length})`; } else { a.href = t.url; a.rel = 'noopener'; }
  const sc = srcOf(t); a.dataset.id = t.id; a.draggable = true; if (sc === 'shot') a.classList.add('shot');
  a.style.gridColumn = 'span ' + (t.cw || 1); a.style.gridRow = 'span ' + (t.ch || 1);
  a.style.setProperty('--tcol', t.bg || (f ? 'hsl(215 18% 30%)' : col(t.url)));
  const i = el('div', 'ic');
  if (sc) {
    (sc === 'url' ? Promise.resolve(t.iu) : sc === 'shot' ? shotUrl(t) : imgUrl(t.img)).then(u => u && paced(() => {

      if (sc === 'shot' || t.fill) { const bl = el('div', 'bgl'); bl.style.backgroundImage = `url("${u}")`; a.prepend(bl); a.classList.add('fill'); }
      else { const im = new Image(); im.alt = ''; im.decoding = 'async'; if (sc === 'url') { im.referrerPolicy = 'no-referrer'; im.onerror = () => i.replaceChildren(favImg(t.url, t.title)); } im.src = u; i.replaceChildren(im); }
}));
  } else if (f) {
    const p = el('div', 'fp'); t.t.slice(0, 4).forEach(c => p.append(favImg(c.url, c.title))); i.append(p);
  } else i.append(favImg(t.url, t.title));
  a.append(i, el('span', 'tt', t.title));
  { const lr = lpOf(t); if (lr && D.s.lpb !== false && (lr.s === 'dead' || lr.s === 'err' || lr.s === 'parked')) { const d = el('div', 'lpd ' + lr.s); d.title = L('lp_s_' + lr.s); a.append(d); } }
  if (t.pin) { const pn = el('div', 'pin'); pn.title = L('m_pinned'); pn.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M16 3l5 5-2 1-3.5 3.5.7 4.3-1.4 1.4-3.6-3.6L7 20l-1-1 4.4-4.7L6.8 10.7l1.4-1.4 4.3.7L16 6.5z"/></svg>'; a.append(pn); }
  if (sc === 'shot' && !f) { const lg = el('div', 'logo'); lg.append(favImg(t.url, t.title, Math.min(curH * D.s.icl / 100, 96))); a.append(lg); }   // логотип сайту завжди видно
  return a;
}
const gridEl = $('#grid'), fgridEl = $('#fgrid');
const pinFix = h => { const a = h.t.filter(x => x.pin), b = h.t.filter(x => !x.pin), n = [...a, ...b]; if (n.every((x, i) => x === h.t[i])) return false; h.t = n; return true; };   // закріплені — завжди попереду
function fill(g, h) {
  pinFix(h);
  const f = document.createDocumentFragment(), add = el('button', 'add', '+'); add.title = L('add_tip');
  h.t.forEach(t => f.append(mkTile(t))); f.append(add);
  g.classList.toggle('big', h.t.length > 250); g.classList.toggle('wc', h.t.length <= 150); fx.classList.remove('on'); fxT = null; g.replaceChildren(f);
  if (g === gridEl) { wlKey = ''; wallLayout(); applyLater(); cntUpd(); }
}
/* ---------- Паролі сторінок ---------- */
const unl = new Set();   // хеші паролів, відкритих у цій вкладці; при виході зі сторінки — знову блокуються
const isLocked = p => !!(p && p.pw && !unl.has(p.pw.h));
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const pwHash = async (pw, salt) => hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 60000 }, await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']), 256));
const pwOk = async (p, pw) => !!p.pw && await pwHash(pw, p.pw.s) === p.pw.h;
const pwSet = async (p, pw) => { const s = uid() + uid(), o = { s, h: await pwHash(pw, s) }; p.pw = o; D.p.forEach(x => { if (x.nx === p.id || p.nx === x.id) x.pw = o; }); };   // сторінки-продовження успадковують пароль
const pwClear = p => { const h = p.pw && p.pw.h; D.p.forEach(x => { if (x.pw && x.pw.h === h) delete x.pw; }); unl.delete(h); };
const lockEl = $('#lock');
function renderGrid() {
  const p = page(), k = p.pw ? p.pw.h : null;
  for (const h of [...unl]) if (h !== k) unl.delete(h);   // виходимо зі сторінки — вона знову заблокована
  const lk = isLocked(p); document.body.classList.toggle('lk', lk);
  if (!lk) { lockEl.hidden = true; return fill(gridEl, p); }
  fx.classList.remove('on'); fxT = null; gridEl.replaceChildren(); lockEl.hidden = false;
  $('#lock-n').textContent = p.name; $('#lock-e').textContent = ''; $('#lock-i').value = '';
  cntUpd(); if (!document.querySelector('dialog[open]') && !TEST) setTimeout(() => $('#lock-i').focus(), 0);
}
const tcTxt = p => p.id === D.cur ? p.t.length + '/' + limOf(D) : String(p.t.length);
const cntUpd = () => { document.querySelectorAll('#tabs .tab[data-id]').forEach(b => { const p = D.p.find(x => x.id === b.dataset.id), c = b.querySelector('.tc'); if (p && c) { const t = tcTxt(p); if (c.textContent !== t) c.textContent = t; } }); };   // лічильник плиток у заголовках сторінок
const renderFolder = () => { if (openF) fill(fgridEl, openF); };
const redraw = () => { renderGrid(); renderFolder(); };

/* ---------- Папки ---------- */
function openFolder(f) {
  if (!f) return; openF = f; $('#fd-t').textContent = f.title; renderFolder(); $('#fd').showModal();
}
$('#fd-x').onclick = () => $('#fd').close();
$('#fd-e').onclick = () => openEdit(openF, page());
$('#fd').addEventListener('click', e => { if (e.target === $('#fd')) $('#fd').close(); });
$('#fd').addEventListener('close', () => { openF = null; if (fxT) clr(fxT); fxT = null; fx.classList.remove('on'); renderGrid(); });
function moveTile(t, from, to) {
  to = room(to); from.t = from.t.filter(x => x !== t); to.t.push(t); redraw(); save();
  toast(L('tt_moved', to.title || page().name));
}
function moveToPage(t, from, target) {   // переносить плитку як є (розмір, зображення, режим показу) на обрану сторінку
  const i = from.t.indexOf(t); if (i < 0) return;
  const g = room(target); if (g === from) return;   // повна сторінка → її сторінка-продовження
  from.t.splice(i, 1); g.t.push(t); redraw(); save();
  toast(L('tt_to_page', t.title, g.name), () => { g.t = g.t.filter(x => x !== t); from.t.splice(Math.min(i, from.t.length), 0, t); redraw(); save(); });
}
function delTile(t, h) {
  const i = h.t.indexOf(t); if (i < 0) return;
  h.t.splice(i, 1); redraw(); save();
  toast(L('tt_deleted', t.title), () => { h.t.splice(Math.min(i, h.t.length), 0, t); redraw(); save(); }, () => walk([t]).forEach(x => { freeImg(x.img); freeImg(x.si); freeImg(x.st); }));
}

/* ---------- Тестовий режим (тимчасово): 3 несправжні заповнені сторінки для перевірки продуктивності ---------- */
async function testOn() {
  if (TEST) return; TEST = { p: D.p, cur: D.cur };
  for (let i = 0; i < 6; i++) {   // 6 різних «знімків» 560 px, як у справжніх мініатюр
    const c = new OffscreenCanvas(560, 340), x = c.getContext('2d'); x.fillStyle = `hsl(${i * 57} 30% 22%)`; x.fillRect(0, 0, 560, 340);
    for (let k = 0; k < 70; k++) { x.fillStyle = `hsl(${(i * 57 + k * 13) % 360} 55% ${25 + (k * 7) % 45}%)`; x.fillRect((k * 83) % 520, (k * 47) % 300, 30 + (k * 29) % 140, 14 + (k * 17) % 50); }
    await imgPut('tst' + i, await c.convertToBlob({ type: 'image/webp', quality: 0.8 }));
  }
  const lim = limOf(D); D.p = [0, 1, 2].map(k => ({ id: 'tp' + k, name: 'Test ' + (k + 1), t: Array.from({ length: lim }, (_, i) => { const n = k * lim + i + 1, o = { id: 'tt' + n, title: 'Test ' + n, url: 'https://test' + n + '.example' }; if (i % 3 !== 2) Object.assign(o, { si: 'tst' + (n % 6), shot: true, dm: 'shot', stn: 1 }); return o; }) }));
  D.cur = 'tp0'; document.body.classList.add('test'); renderTabs(); renderGrid(); testBtn(); toast(L('test_toast'));
  await testBench();
}
function testOff() {
  if (!TEST) return; D.p = TEST.p; D.cur = D.p.some(p => p.id === TEST.cur) ? TEST.cur : D.p[0].id; TEST = null;
  for (let i = 0; i < 6; i++) freeImg('tst' + i);
  document.body.classList.remove('test'); $('#test-res').textContent = ''; renderTabs(); renderGrid(); testBtn(); drainQ();
}
const testBtn = () => { };
async function testBench() {   // перемикає 3 сторінки й міряє: час побудови та час до повного показу зображень
  const out = [], raf2 = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  for (const id of ['tp1', 'tp2', 'tp0']) {
    if (!TEST) return; D.cur = id; const t0 = performance.now(); renderTabs(); renderGrid(); const t1 = performance.now();
    await raf2(); while (pq.length) await raf2(); out.push([t1 - t0, performance.now() - t0]);
    await new Promise(r => setTimeout(r, 150));
  }
  const f = v => Math.round(v), avg = out.reduce((a, b) => a + b[0], 0) / out.length;
  $('#test-res').textContent = L('test_res', f(avg), f(Math.max(...out.map(o => o[0]))), f(Math.max(...out.map(o => o[1]))));
}
/* ---------- Ліміт плиток на сторінці: надлишок іде на сторінку-продовження ---------- */
const LIM = () => D.s.tpl === 'wall' ? 15 : 20;
function room(h) {   // h — сторінка або папка; повна сторінка → наступна сторінка-продовження (створюється при потребі)
  if (!D.p.includes(h) || h.t.length < LIM()) return h;
  let p = h;
  for (;;) { const nx = p.nx && D.p.find(x => x.id === p.nx); if (!nx) break; p = nx; if (p.t.length < LIM()) return p; }
  const n = { id: uid(), name: nextName(D), t: [] }; if (p.pw) n.pw = p.pw;
  D.p.splice(D.p.indexOf(p) + 1, 0, n); p.nx = n.id; return n;
}
function showPage(p, from) {   // після додавання на іншу сторінку — переходимо на неї й повідомляємо
  if (p === from || !D.p.includes(p)) return false;
  D.cur = p.id; renderTabs(); toast(L('pg_full', LIM(), p.name)); return true;
}
/* ---------- Додавання: вставка, перетягування посилань, черга з іконки на панелі ---------- */
function addUrls(items, h) {
  const added = [], org = h; let last = h;
  for (const it of items) {
    if (h.t.some(x => x.url === it.url)) continue;
    const g = room(h), t = mk((it.title || '').trim().slice(0, 80) || host(it.url), it.url); g.t.push(t); added.push([g, t]); last = g;
  }
  if (!added.length) return toast(L('tt_exists'));
  const moved = showPage(last, org); redraw(); save();
  if (!moved) toast(L('tt_added', added.length), () => { added.forEach(([g, t]) => { g.t = g.t.filter(x => x !== t); }); redraw(); save(); });
}
document.addEventListener('paste', e => {
  const tg = e.target; if ((tg.closest && tg.closest('input,textarea,select,[contenteditable]')) || $('#ed').open) return;
  if (isLocked(page())) return;
  const u = parseUrls(e.clipboardData.getData('text') || ''); if (!u.length) return;
  e.preventDefault(); addUrls(u.map(url => ({ url })), openF || page());
});
const urlDrag = e => { const ty = e.dataTransfer ? [...e.dataTransfer.types] : []; return ty.includes('text/uri-list') || ty.includes('text/plain'); };
function urlsFrom(dt) {
  const list = (dt.getData('text/uri-list') || dt.getData('text/plain') || '').replace(/^#.*$/gm, '');
  let title = ''; const html = dt.getData('text/html');
  if (html) { try { const a = new DOMParser().parseFromString(html, 'text/html').querySelector('a'); title = a ? a.textContent.trim() : ''; } catch { } }
  const us = parseUrls(list); return us.map(url => ({ url, title: us.length === 1 ? title : '' }));
}
async function drainQ() {
  if (TEST) return;
  const r = await chrome.storage.local.get('q'); if (!r.q || !r.q.length) return;
  await chrome.storage.local.remove('q');
  let n = 0, lastG = null; const cur0 = page();
  for (const it of r.q) {
    const p = D.p.find(x => x.id === it.page) || page();
    const h = it.folder ? (p.t.find(x => x.id === it.folder && x.folder) || p) : p;
    const url = norm(it.url || ''); if (!url) continue;
    let t = h.t.find(x => x.url === url); if (t && !it.shot) continue;
    if (!t) { t = mk((it.title || '').trim().slice(0, 80) || host(url), url); const g = room(h); g.t.push(t); lastG = g; }
    if (it.shot) {
      try { const id = uid(); await imgPut(id, await (await fetch(it.shot)).blob()); if (t.si) freeImg(t.si); freeImg(t.st); t.st = null; t.stn = 0; t.si = id; thumbOf(await imgGet(id)).then(s => { if (s && t.si === id) { t.st = s; save(); } else if (!s) t.stn = 1; }).catch(() => { }); t.shot = true; t.dm = 'shot'; } catch { }
    }
    n++;
  }
  if (n) { const mv = lastG && showPage(lastG, cur0); redraw(); save(); if (!mv) toast(`${L('tt_from_bar')} ${n}`); }
}
chrome.storage.onChanged.addListener((c, a) => { if (D && a === 'local' && c.q && c.q.newValue && c.q.newValue.length) drainQ(); });

/* ---------- Редагування плитки ---------- */
function updUrlRow() {
  const isF = editing ? !!editing.folder : $('#e-type').value === 'folder';
  $('#e-urll').style.display = isF ? 'none' : '';
}
let ed = { dm: null, rmShot: false };
const SRC = ['shot', 'icon', 'url'], ELBL = { shot: 'e_sw_shot', icon: 'e_sw_icon', url: 'e_sw_url' };
const edAvail = () => ({ shot: !!(editing && editing.si && !ed.rmShot), icon: !!(pending || (editing && editing.img && !removeImg)), url: /^https?:\/\/\S+$/i.test($('#e-iu').value.trim()) });
function edSync() {   // доступність і підсвітка перемикачів: не призначений тип — неактивний
  const av = edAvail(); if (ed.dm !== 'fav' && !av[ed.dm]) ed.dm = ['shot', 'url', 'icon'].find(k => av[k]) || null;
  $('#e-sw').querySelectorAll('button').forEach(b => { const s = b.dataset.s, on = ed.dm === s; b.disabled = !av[s]; b.classList.toggle('on', on); b.title = av[s] ? '' : L('e_na'); b.querySelector('i').textContent = av[s] ? (on ? '●' : '○') : '—'; });
  $('#e-shotst').textContent = av.shot ? L('e_shot_yes') : L('e_shot_no'); $('#e-shotrm').disabled = !av.shot;
  $('#e-swh').textContent = ed.dm === 'fav' ? L('e_sw_fav') : '';
  edPrev();
}
let edPv = 0;
async function edPrev() {
  const my = ++edPv, box = $('#e-prev'), d = ed.dm, fillM = $('#e-mode').value === 'fill'; let u = null;
  if (d === 'shot' && editing) u = await imgUrl(editing.si);
  else if (d === 'icon') u = pending ? URL.createObjectURL(pending) : (editing && editing.img ? await imgUrl(editing.img) : null);
  else if (d === 'url') u = $('#e-iu').value.trim();
  if (my !== edPv) return; box.replaceChildren(); box.className = 'prev'; box.style.backgroundImage = '';
  box.style.setProperty('--tcol', ($('#e-auto').checked ? col($('#e-url').value || $('#e-title').value || 'x') : $('#e-bg').value));
  if (u && (d === 'shot' || fillM)) { box.classList.add('fill'); box.style.backgroundImage = `url("${u}")`; }
  else if (u) { const im = new Image(); im.alt = ''; im.referrerPolicy = 'no-referrer'; im.onerror = () => box.replaceChildren(favImg($('#e-url').value, $('#e-title').value)); im.src = u; box.append(im); }
  else box.append(favImg($('#e-url').value, $('#e-title').value, 64));
}
function openEdit(t, h) {
  editing = t; editH = h; pending = null; removeImg = false; ed = { dm: t && t.dm || null, rmShot: false };
  $('#e-h').textContent = t ? (t.folder ? L('e_edit_folder') : L('e_edit_tile')) : L('e_new');
  $('#e-typel').style.display = (t || h !== page()) ? 'none' : ''; $('#e-type').value = t && t.folder ? 'folder' : 'site';
  $('#e-title').value = t ? t.title : ''; $('#e-url').value = t && t.url || '';
  $('#e-auto').checked = !(t && t.bg); $('#e-bg').value = (t && t.bg) || '#333333';
  $('#e-mode').value = t && t.fill ? 'fill' : 'icon';
  $('#e-file').value = ''; $('#e-iu').value = (t && t.iu) || '';
  $('#ed').style.translate = ''; edSync();
  updUrlRow(); $('#ed').showModal(); $((t && t.folder) ? '#e-title' : '#e-url').focus();
}
$('#e-sw').onclick = e => { const b = e.target.closest('button'); if (!b || b.disabled) return; ed.dm = ed.dm === b.dataset.s ? 'fav' : b.dataset.s; edSync(); };   // повторний клік по активному — іконка сайту за замовчуванням
$('#e-shotrm').onclick = () => { ed.rmShot = true; edSync(); };
$('#e-iu').addEventListener('input', edSync); $('#e-mode').addEventListener('change', edPrev);
['#e-url', '#e-title', '#e-bg', '#e-auto'].forEach(s => $(s).addEventListener('input', edPrev));
$('#e-x').onclick = () => $('#ed').close();
(() => {   // перетягування вікна за заголовок
  const dlg = $('#ed'), hd = $('#e-head'); let sx = 0, sy = 0, ox = 0, oy = 0, on = false;
  hd.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; on = true; sx = e.clientX; sy = e.clientY; const m = /(-?[\d.]+)px (-?[\d.]+)px/.exec(dlg.style.translate || ''); ox = m ? +m[1] : 0; oy = m ? +m[2] : 0; hd.setPointerCapture(e.pointerId); });
  hd.addEventListener('pointermove', e => {
    if (!on) return; let x = ox + e.clientX - sx, y = oy + e.clientY - sy;
    const r = dlg.getBoundingClientRect(), cx = r.left - (dlg.style.translate ? ox : 0), cy = r.top - (dlg.style.translate ? oy : 0);   // базова позиція без зсуву
    x = Math.max(-cx - r.width + 90, Math.min(innerWidth - cx - 90, x)); y = Math.max(-cy, Math.min(innerHeight - cy - 50, y));
    dlg.style.translate = `${x}px ${y}px`;
  });
  const end = () => { on = false; }; hd.addEventListener('pointerup', end); hd.addEventListener('pointercancel', end);
})();
$('#e-type').onchange = updUrlRow;
$('#e-bg').oninput = () => $('#e-auto').checked = false;
$('#e-file').onchange = e => { pending = e.target.files[0] || null; removeImg = false; if (pending) ed.dm = 'icon'; edSync(); };
$('#e-rm').onclick = () => { pending = null; removeImg = true; $('#e-file').value = ''; edSync(); };
$('#e-cancel').onclick = () => $('#ed').close();
$('#ed form').onsubmit = async e => {
  e.preventDefault();
  const isF = editing ? !!editing.folder : $('#e-type').value === 'folder'; let url = null;
  const iu = $('#e-iu').value.trim(); if (iu && !/^https?:\/\/\S+$/i.test(iu)) { mxAlert(L('e_bad_img')); return; }
  if (!isF) { url = norm($('#e-url').value); if (!url) { mxAlert(L('e_bad_url')); return; } }
  let t = editing; if (!t) { t = isF ? { id: uid(), title: '', folder: true, t: [] } : mk('', url); { const g = room(editH); g.t.push(t); showPage(g, editH); } }
  if (!isF) t.url = url;
  t.title = $('#e-title').value.trim() || (isF ? L('o_folder') : host(url));
  t.bg = $('#e-auto').checked ? null : $('#e-bg').value; t.fill = $('#e-mode').value === 'fill';
  if ((pending || removeImg) && t.img) { freeImg(t.img); t.img = null; }
  if (pending) t.img = await saveImg(pending, t.fill ? 800 : 256, 0.85);
  if (ed.rmShot && t.si) { freeImg(t.si); freeImg(t.st); t.si = t.st = null; t.stn = 0; t.shot = false; }
  t.iu = iu || null; if (ed.dm) t.dm = ed.dm; else delete t.dm;   // три джерела зберігаються одночасно; dm — яке показувати
  $('#ed').close(); redraw(); if (openF) $('#fd-t').textContent = openF.title; save();
};

/* ---------- Сітка: події (для головної сітки і для папки) ---------- */
const LP = { fired: 0 };
function tipHide() { try { $('#tip').hidePopover(); } catch { } }
function tipShow(t, n) {   // мініпідказка після довгого натискання: адреса, дата додавання, кількість відвідувань
  const m = $('#tip'), f = !!t.folder, row = (k, v) => { const r = el('div', 'tr'); r.append(el('span', null, L(k)), el('b', null, v)); return r; };
  const ad = t.ad ? new Date(t.ad).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
  m.replaceChildren(el('div', 'tn', t.title || (f ? '' : t.url)), ...(f ? [] : [el('div', 'tu2', t.url)]), row('tip_added', ad), row(f ? 'tip_items' : 'tip_visits', String(f ? t.t.length : t.v || 0)));
  tipHide(); m.showPopover(); const r = n.getBoundingClientRect(), w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = Math.max(6, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 6)) + 'px';
  m.style.top = (r.bottom + 8 + h > innerHeight - 6 ? Math.max(6, r.top - h - 8) : r.bottom + 8) + 'px';
  clearTimeout(tipHide.t); tipHide.t = setTimeout(tipHide, 6000);
}
addEventListener('pointerdown', tipHide, true); addEventListener('keydown', tipHide, true); addEventListener('wheel', tipHide, { passive: true });
function bindGrid(g, getH) {
  let lt = 0, lx = 0, ly = 0; const lpOff = () => { clearTimeout(lt); lt = 0; };
  g.addEventListener('click', e => { if (LP.fired) { LP.fired = 0; e.preventDefault(); e.stopImmediatePropagation(); } }, true);   // після довгого натискання плитка не відкривається
  g.addEventListener('pointerdown', e => {
    lpOff(); LP.fired = 0; const n = e.target.closest('.tile'); if (!n || e.button !== 0) return; lx = e.clientX; ly = e.clientY;
    lt = setTimeout(() => { lt = 0; const t = getH().t.find(x => x.id === n.dataset.id); if (t) { LP.fired = 1; tipShow(t, n); } }, 550);
  });
  g.addEventListener('pointermove', e => { if (lt && Math.hypot(e.clientX - lx, e.clientY - ly) > 6) lpOff(); });
  ['pointerup', 'pointercancel', 'dragstart', 'contextmenu'].forEach(ev => g.addEventListener(ev, lpOff));
  const open = n => openFolder(getH().t.find(x => x.id === n.dataset.id));
  const hit = e => { const n = e.target.closest('.tile:not(.folder)'); if (n && (e.button === 0 || e.button === 1)) visit(getH().t.find(x => x.id === n.dataset.id), n); };
  g.addEventListener('click', hit); g.addEventListener('auxclick', hit);
  g.addEventListener('click', e => {
    if (e.target.closest('.add')) { openEdit(null, getH()); return; }
    const n = e.target.closest('.tile.folder'); if (n) { e.preventDefault(); open(n); }
  });
  g.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const n = e.target.closest && e.target.closest('.tile.folder'); if (n) { e.preventDefault(); open(n); }
  });
  g.addEventListener('contextmenu', e => {
    const n = e.target.closest('.tile'); if (!n) return;
    const h = getH(), t = h.t.find(x => x.id === n.dataset.id); if (!t) return;
    const it = [];
    if (t.folder) it.push([L('m_open'), () => openFolder(t), 'folder']); else it.push([L('m_open_new'), () => { visit(t, n); window.open(t.url, '_blank'); }, 'open']);
    it.push([L(t.pin ? 'm_unpin' : 'm_pin'), () => { if (t.pin) delete t.pin; else t.pin = 1; pinFix(h); redraw(); save(); }, t.pin ? 'unpin' : 'pin']);
    it.push([L('m_edit'), () => openEdit(t, h), 'edit']);
    if (!t.folder && /^https?:/i.test(t.url || '')) {
      it.push([L('m_private'), () => { visit(t, n); try { chrome.windows.create({ url: t.url, incognito: true }).catch(() => toast(L('m_private_no'))); } catch { toast(L('m_private_no')); } }, 'priv']);   // потрібен дозвіл «Дозволити в режимі анонім» у налаштуваннях розширення
      it.push([L('m_qr'), () => qrShow(t), 'qr']);
      it.push([L('m_copy'), () => { navigator.clipboard.writeText(t.url).then(() => toast(L('m_copied')), () => toast(L('m_copy_no'))); }, 'copy']);
    }
    if (D.p.length > 1) it.push([L('m_move'), () => setTimeout(() => menu(e, D.p.filter(p => p !== h).map(p => [`${p.name} · ${p.t.length}/${limOf(D)}`, () => moveToPage(t, h, p)], 'page')), 0), 'move']);   // другий рівень: список сторінок
    if (!t.folder) {
      if (h === openF) it.push([L('m_out'), () => moveTile(t, h, page()), 'out']);
      else h.t.filter(x => x.folder).slice(0, 8).forEach(f => it.push([L('m_into', f.title), () => moveTile(t, h, f), 'folder']));
    }
    it.push([L('delete'), () => delTile(t, h), 'del']); menu(e, it);
  });
  g.addEventListener('dragstart', e => {
    const t = e.target.closest && e.target.closest('.tile'); if (!t) return;
    drag = t; dragH = getH(); dropT = null; fx.classList.remove('on');
    e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', t.dataset.id);
    requestAnimationFrame(() => t.classList.add('drag'));
  });
  g.addEventListener('dragover', e => {
    if (!drag) { if (urlDrag(e)) { e.preventDefault(); g.classList.add('urlover'); } return; }
    if (dragH !== getH()) return; e.preventDefault();
    const t = e.target.closest('.tile');
    if (dropT && dropT !== t) { dropT.classList.remove('dropin'); dropT = null; }
    if (!t || t === drag) return;
    const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
    if (t.classList.contains('folder') && !drag.classList.contains('folder') && x > 0.25 && x < 0.75) { t.classList.add('dropin'); dropT = t; return; }
    const ref = e.clientX < r.left + r.width / 2 ? t : t.nextSibling;
    if (ref !== drag.nextSibling) g.insertBefore(drag, ref);
  });
  g.addEventListener('dragleave', e => { if (!g.contains(e.relatedTarget)) g.classList.remove('urlover'); });
  g.addEventListener('drop', e => {
    e.preventDefault(); g.classList.remove('urlover'); if (drag) return;
    const u = urlsFrom(e.dataTransfer); if (u.length) addUrls(u, getH());
  });
  g.addEventListener('dragend', () => {
    if (!drag) return;
    const d = drag, h = dragH; drag = null; dragH = null; d.classList.remove('drag');
    if (dropT) {
      const f = h.t.find(x => x.id === dropT.dataset.id), t = h.t.find(x => x.id === d.dataset.id);
      dropT.classList.remove('dropin'); dropT = null;
      if (f && t && f !== t) { h.t = h.t.filter(x => x !== t); f.t.push(t); redraw(); save(); toast(L('tt_moved', f.title)); } else redraw();
      return;
    }
    const m = new Map(h.t.map(t => [t.id, t]));
    h.t = [...g.querySelectorAll('.tile')].map(n => m.get(n.dataset.id)).filter(Boolean); const pf = pinFix(h); save(); if (pf) redraw();
    if (D.s.tpl === 'wall' && g === gridEl) wallLayout();   // після перестановки перераховуємо місце кожної плитки на стіні
  });
  g.addEventListener('mouseover', e => {
    if (D.s.tpl === 'wall') return;   // у стіні наведення обробляє лише CSS: жодного JS
    const t = e.target.closest('.tile'); if (t === fxT) return;
    if (fxT) clr(fxT); fxT = t; showFx(t, g);
    if (t) { const pp = Math.round(2 * Math.max(t.offsetWidth, t.offsetHeight)) + 'px'; t.style.setProperty('--pp', pp); fx.style.setProperty('--pp', pp); }
  });
  g.addEventListener('mouseleave', () => { if (fxT) clr(fxT); fxT = null; fx.classList.remove('on'); g.classList.remove('urlover'); });
  let raf = 0;   // 3D-нахил і блик: один оновлюваний кадр за раз
  g.addEventListener('mousemove', e => {
    const s = D.s; if (s.tpl === 'wall' || !(s.tilt || s.glare)) return;
    const t = fxT; if (!t || raf) return; const cx = e.clientX, cy = e.clientY;
    raf = requestAnimationFrame(() => {
      raf = 0; if (fxT !== t) return;
      let nx, ny;
      { const gr = g.getBoundingClientRect(); nx = (cx - gr.left - t.offsetLeft) / t.offsetWidth; ny = (cy - gr.top - t.offsetTop) / t.offsetHeight; }
      nx = Math.min(1, Math.max(0, nx)); ny = Math.min(1, Math.max(0, ny));
      t.style.setProperty('--mx', nx * 100 + '%'); t.style.setProperty('--my', ny * 100 + '%');
      if (s.tilt) {
        const A = s.tm * 1.8, ry = ((nx - 0.5) * 2 * A).toFixed(2) + 'deg', rx = ((0.5 - ny) * 2 * A).toFixed(2) + 'deg';
        t.style.setProperty('--rx', rx); t.style.setProperty('--ry', ry); fx.style.setProperty('--rx', rx); fx.style.setProperty('--ry', ry);
      }
    });
  });
}
bindGrid(gridEl, page);
bindGrid(fgridEl, () => openF);

/* ---------- Сторінки ---------- */
const tabs = $('#tabs');
tabs.addEventListener('click', e => {
  const nv = e.target.closest('.tnav'); if (nv) { if (!nv.disabled) tabsScroll(nv.id === 'tnext' ? 3 : -3); return; }
  const b = e.target.closest('.tab'); if (!b) return;
  if (b.id === 'addp') {
    const p = { id: uid(), name: nextName(D), t: [] }; D.p.push(p); D.cur = p.id;
  } else D.cur = b.dataset.id;
  renderTabs(); renderGrid(); save();
});
let whAcc = 0, whT = 0, whL = 0, whRun = 0;   // колесо миші перемикає сторінки плиток
addEventListener('wheel', e => {
  if (e.ctrlKey || !D || D.p.length < 2 || e.target.closest('#panel,dialog,#menu,[popover]') || document.querySelector('dialog[open]')) return;
  const m = $('main'); if (m.scrollHeight > m.clientHeight + 2 && e.target.closest('main')) return;   // якщо сторінка прокручується сама — не заважаємо
  const now = performance.now(); if (now - whL > 250) whAcc = 0; whRun = now - whL < 140 ? whRun + 1 : 0; whL = now;
  whAcc += Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  if (Math.abs(whAcc) < 24 || now - whT < 90) return;
  const i = D.p.findIndex(p => p.id === D.cur), st = 1 + Math.min(3, Math.floor(whRun / 3)), n = Math.max(0, Math.min(D.p.length - 1, i + (whAcc > 0 ? st : -st))); whAcc = 0;   // чим швидше крутиться колесо — тим більший крок
  if (n === i) return; whT = now; D.cur = D.p[n].id; renderTabs(); renderGrid(); save();
}, { passive: true });
lockEl.onsubmit = async e => {
  e.preventDefault(); const p = page(), v = $('#lock-i').value; if (!v) return;
  if (await pwOk(p, v)) { unl.add(p.pw.h); renderTabs(); renderGrid(); }
  else { $('#lock-e').textContent = L('pw_wrong'); lockEl.classList.remove('bad'); void lockEl.offsetWidth; lockEl.classList.add('bad'); $('#lock-i').select(); }
};
// діалог пароля: режими set (новий), change (поточний + новий), remove / ask (лише поточний)
const pwd = $('#pwd'); let pwRes = null;
function askPw(mode, p) {
  return new Promise(res => {
    pwRes = res; const cur = mode !== 'set', neu = mode === 'set' || mode === 'change';
    $('#pwd-t').textContent = L({ set: 'pw_set_t', change: 'pw_change_t', remove: 'pw_remove_t', ask: 'pw_ask_t' }[mode], p.name);
    $('#pwd-c').hidden = !cur; $('#pwd-n').hidden = !neu; $('#pwd-r').hidden = !neu;
    ['pwd-ci', 'pwd-ni', 'pwd-ri'].forEach(i => { $('#' + i).value = ''; $('#' + i).type = 'password'; }); $('#pwd-e').textContent = '';
    pwd.dataset.mode = mode; pwd._p = p; pwd.showModal(); $(cur ? '#pwd-ci' : '#pwd-ni').focus();
  });
}
const pwdDone = ok => { const r = pwRes; pwRes = null; if (pwd.open) pwd.close(); if (r) r(ok); };
$('#pwd-x').onclick = () => pwdDone(false);
pwd.addEventListener('cancel', () => { pwRes && pwRes(false); pwRes = null; });
$('#pwd-eye').onclick = e => { const t = $('#pwd-ni').type === 'password' ? 'text' : 'password'; ['pwd-ci', 'pwd-ni', 'pwd-ri'].forEach(i => $('#' + i).type = t); e.currentTarget.classList.toggle('on', t === 'text'); };
$('#pwd-f').onsubmit = async e => {
  e.preventDefault(); const m = pwd.dataset.mode, p = pwd._p, err = k => { $('#pwd-e').textContent = L(k); return false; };
  if (m !== 'set' && !(await pwOk(p, $('#pwd-ci').value))) return err('pw_wrong');
  if (m === 'set' || m === 'change') {
    const n = $('#pwd-ni').value; if (!n) return err('pw_empty'); if (n !== $('#pwd-ri').value) return err('pw_mismatch');
    await pwSet(p, n); unl.add(p.pw.h);
  } else if (m === 'remove') pwClear(p);
  pwdDone(true); renderTabs(); renderGrid(); save();
  toast(L(m === 'remove' ? 'pw_removed' : 'pw_saved'));
};
tabs.addEventListener('contextmenu', e => {
  const b = e.target.closest('.tab'); if (!b || !b.dataset.id) return;
  const p = D.p.find(x => x.id === b.dataset.id);
  menu(e, [
    [L('m_rename'), async () => { const n = await mxPrompt(L('p_new_name'), p.name); if (n && n.trim()) { p.name = n.trim(); renderTabs(); save(); } }, 'edit'],
    ...(p.pw ? [
      ...(isLocked(p) ? [] : [[L('pw_lock_now'), () => { unl.delete(p.pw.h); renderTabs(); renderGrid(); }, 'lock']]),
      [L('pw_change'), () => askPw('change', p), 'key'], [L('pw_remove'), () => askPw('remove', p), 'unlock']
    ] : [[L('pw_set'), () => askPw('set', p), 'lock']]),
    [L('m_del_page'), async () => {
      if (D.p.length < 2) return mxAlert(L('p_last'));
      if (p.pw && !(await askPw('ask', p))) return;
      walk(p.t).forEach(t => { freeImg(t.img); freeImg(t.si); freeImg(t.st); }); D.p = D.p.filter(x => x !== p); if (D.cur === p.id) D.cur = D.p[0].id;
      renderTabs(); renderGrid(); save();
    }, 'del']
  ]);
});
tabs.addEventListener('dragover', e => { if (drag && dragH === page() && e.target.dataset.id) e.preventDefault(); });
tabs.addEventListener('drop', e => {   // перетягнути плитку (або папку) на іншу сторінку
  const id = e.target.dataset.id; if (!drag || !id || id === D.cur || dragH !== page()) return; e.preventDefault();
  const p = page(), t = p.t.find(x => x.id === drag.dataset.id);
  const tp = room(D.p.find(x => x.id === id)); p.t = p.t.filter(x => x !== t); tp.t.push(t);
  drag.classList.remove('drag'); drag = null; dragH = null; renderGrid(); save();
});

/* ---------- Теми ---------- */
function cleanTheme(src) {   // перевіряє значення за обмеженнями полів панелі
  const out = {};
  for (const k of styleKeys()) {
    if (!(k in src)) continue;
    const i = document.querySelector(`[data-k="${k}"]`); let v = src[k]; if (!i) continue;
    if (k === 'pm') v = ({ breathe: 'ripple', blinds: 'ripple', lightning: 'portal', laser: 'portal', ghost: 'fire' })[v] || v;
    if (i.type === 'checkbox') { if (typeof v === 'boolean') out[k] = v; }
    else if (i.type === 'range') { const n = +v; if (isFinite(n)) out[k] = Math.min(+i.max, Math.max(+i.min, n)); }
    else if (i.type === 'color') { if (/^#[0-9a-f]{6}$/i.test(v)) out[k] = v; }
    else if (i.tagName === 'SELECT') { if ([...i.options].some(o => o.value === v)) out[k] = v; }
  }
  return out;
}
function applyTheme(name, th) {
  const prev = stylePick(D.s);
  Object.assign(D.s, stylePick(DEF().s), th);
  if (D.s.bt === 'image' && !D.s.bi) D.s.bt = 'gradient';
  sync(); applyS(); save();
  toast(L('th_applied', name), () => { Object.assign(D.s, prev); sync(); applyS(); save(); });
}
function renderThemes(sel = '') {
  const s = $('#theme'); s.replaceChildren(new Option(L('th_choose'), ''));
  const g1 = document.createElement('optgroup'); g1.label = L('th_builtin');
  Object.keys(PRESETS).forEach(n => g1.append(new Option(L(n), 'b:' + n))); s.append(g1);
  if (D.themes.length) { const g2 = document.createElement('optgroup'); g2.label = L('th_mine'); D.themes.forEach(t => g2.append(new Option(t.name, 'u:' + t.id))); s.append(g2); }
  s.value = sel;
}
const themeFile = () => { const th = stylePick(D.s); if (th.bt === 'image') th.bt = 'gradient'; return th; };
$('#theme').onchange = e => {
  const v = e.target.value; if (!v) return;
  if (v[0] === 'b') applyTheme(L(v.slice(2)), PRESETS[v.slice(2)]);
  else { const t = D.themes.find(x => x.id === v.slice(2)); if (t) applyTheme(t.name, t.s); }
};
$('#th-save').onclick = async () => {
  const n = ((await mxPrompt(L('th_prompt'), L('th_default'))) || '').trim().slice(0, 40); if (!n) return;
  const t = { id: uid(), name: n, s: themeFile() }; D.themes.push(t); renderThemes('u:' + t.id); save(); toast(L('th_saved', n));
};
$('#th-del').onclick = async () => {
  const v = $('#theme').value; if (!v.startsWith('u:')) return toast(L('th_only_own'));
  const t = D.themes.find(x => x.id === v.slice(2)); if (!t || !await ask('w_del', L('th_del_confirm', t.name))) return;
  D.themes = D.themes.filter(x => x !== t); renderThemes(); save();
};
$('#th-exp').onclick = () => {
  const a = el('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ sdTheme: 1, name: L('th_default'), s: themeFile() })], { type: 'application/json' }));
  a.download = 'speed-dial-theme.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
};
$('#th-imp').onclick = () => $('#th-f').click();
$('#th-f').onchange = async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  try {
    const j = JSON.parse(await f.text()); if (!j.sdTheme || !j.s || typeof j.s !== 'object') throw 0;
    const t = { id: uid(), name: String(j.name || L('th_imp_default')).slice(0, 40), s: { ...stylePick(DEF().s), ...cleanTheme(j.s) } };
    D.themes.push(t); renderThemes('u:' + t.id); save(); toast(L('th_imported', t.name));
  } catch { mxAlert(L('th_bad')); }
};

/* ---------- Налаштування ---------- */
/* Вікно налаштувань: по центру, переміщується за заголовок, змінює розмір за краї та кути */
const PNL = $('#panel'), MINW = 380, MINH = 240; let GK = 'pw', geo = null, act = null, mvRaf = 0, lastE = null;
const setGeo = g => { geo = g; PNL.style.left = g.x + 'px'; PNL.style.top = g.y + 'px'; PNL.style.width = g.w + 'px'; PNL.style.height = g.h + 'px'; };
const fitGeo = g => {
  const W = innerWidth, H = innerHeight;
  g.w = Math.min(Math.max(g.w, MINW), W); g.h = Math.min(Math.max(g.h, MINH), H);
  g.x = Math.min(Math.max(g.x, 0), W - g.w); g.y = Math.min(Math.max(g.y, 0), H - g.h); return g;
};
function loadGeo(reset) {
  let g = null; if (!reset) { try { g = JSON.parse(localStorage.getItem(GK)); } catch { } }
  if (!g || ![g.x, g.y, g.w, g.h].every(Number.isFinite)) {
    g = { w: 0, h: 0, x: 0, y: 0 }; const cat = GK === 'pwc'; g.w = cat ? 1112 : 1320; g.h = 740; g.x = (innerWidth - Math.min(g.w, innerWidth - 32)) / 2; g.y = (innerHeight - Math.min(g.h, innerHeight - 32)) / 2;
    if (cat && geo) { g.x = geo.x; g.y = geo.y; }   // вперше відкрите меню з категоріями з'являється на місці поточного
  }
  const cat = GK === 'pwc'; g.w = cat ? 1112 : 1320; g.h = 740;   // розмір фіксований (без розтягування); зберігається лише положення
  g.w = Math.min(g.w, innerWidth - 32); g.h = Math.min(g.h, innerHeight - 32);
  setGeo(fitGeo(g));
}
loadGeo();
addEventListener('resize', () => geo && setGeo(fitGeo({ ...geo })));
const DN = $('#dn'), dst = { step: 1, m: 0, amt: 0, order: '' };
const dnPick = i => { dst.m = i; const M = DONATE[i]; dst.amt = M.fixed ? 0 : (M.amounts[1] || M.amounts[0] || 0); };
const dnTotal = () => { const M = DONATE[dst.m]; return M.fixed ? L('dn_fixed') : `${dst.amt || 0} ${M.cur}`; };
function dnRow(k, v) { const r = el('div', 'drow'); r.append(el('span', '', k), el('b', '', v)); return r; }
function dnBtn(txt, cls, fn) { const b = el('button', cls, txt); b.type = 'button'; b.onclick = fn; return b; }
function dnOpen() { const M = DONATE[dst.m]; window.open(M.url.split('{amount}').join(dst.amt || ''), '_blank', 'noopener,noreferrer'); }
function dnRender() {
  const M = DONATE[dst.m], root = $('#dn-main');
  $('#dn-steps').replaceChildren(...['dn_s1', 'dn_s2', 'dn_s3'].map((k, i) => el('span', i + 1 === dst.step ? 'on' : i + 1 < dst.step ? 'ok' : '', (i + 1 < dst.step ? '✓ ' : (i + 1) + '. ') + L(k))));
  const kids = [];
  if (dst.step === 1) {
    const it = el('div', 'ditem'); it.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 2.8 5 6.3 5c2 0 3.5 1 4.5 2.5h2.4C14.2 6 15.7 5 17.7 5c3.5 0 5.3 3.6 3.9 6.8C19.5 16.4 12 21 12 21z"/></svg><div><b></b><small></small></div><em></em>';
    it.querySelector('b').textContent = L('dn_item'); it.querySelector('small').textContent = L('dn_item_t'); it.querySelector('em').remove();
    kids.push(it);
    kids.push(el('h4', '', L('dn_method')));
    const ml = el('div', 'dmeth'); DONATE.forEach((o, i) => {
      const b = el('button', 'dopt' + (i === dst.m ? ' on' : '')); b.type = 'button'; b.style.setProperty('--dc', o.color || '#fff');
      b.append(el('i', 'rad'), el('b', '', o.name), el('small', '', o.sub || '')); b.onclick = () => { dnPick(i); dnRender(); }; ml.append(b);
    });
    kids.push(ml);
    if (!M.fixed) {
      kids.push(el('h4', '', L('dn_amount')));
      const ch = el('div', 'dchips'); M.amounts.forEach(n => { const c = el('button', 'chip' + (n === dst.amt ? ' on' : ''), `${n} ${M.cur}`); c.type = 'button'; c.onclick = () => { dst.amt = n; dnRender(); }; ch.append(c); });
      const ci = el('input', 'dcust'); ci.type = 'number'; ci.min = 1; ci.max = 100000; ci.placeholder = L('dn_custom'); if (!M.amounts.includes(dst.amt) && dst.amt) ci.value = dst.amt;
      ci.oninput = () => { dst.amt = Math.max(0, Math.min(100000, Math.floor(+ci.value) || 0)); ch.querySelectorAll('.chip').forEach(c => c.classList.remove('on')); $('#dn-tot').textContent = dnTotal(); $('#dn-go').disabled = !dst.amt; };
      ch.append(ci); kids.push(ch);
    }
    if (!M.fixed) { const tot = el('div', 'dtotal'); tot.append(el('span', '', L('dn_total')), el('b', '', dnTotal())); tot.querySelector('b').id = 'dn-tot'; kids.push(tot); }
    const go = dnBtn(L('dn_pay'), 'pri dgo', () => { dst.order = 'SD-' + Date.now().toString(36).toUpperCase().slice(-6); dnOpen(); dst.step = 2; dnRender(); }); go.id = 'dn-go'; go.disabled = !M.fixed && !dst.amt;
    kids.push(go, el('p', 'dnote', '🔒 ' + L('dn_secure')));
  } else if (dst.step === 2) {
    const sp = el('div', 'dspin'); kids.push(sp, el('h3', 'dh3', L('dn_wait')), el('p', 'dtxt c', L('dn_wait_sub')));
    const bx = el('div', 'dbox'); bx.append(dnRow(L('dn_order'), '#' + dst.order), dnRow(L('dn_method'), M.name), ...(M.fixed ? [] : [dnRow(L('dn_total'), dnTotal())])); kids.push(bx);
    kids.push(dnBtn(L('dn_done'), 'pri dgo', () => { dst.step = 3; dnRender(); }));
    const rw = el('div', 'row end'); rw.append(dnBtn(L('dn_back'), '', () => { dst.step = 1; dnRender(); }), dnBtn(L('dn_reopen'), '', dnOpen)); kids.push(rw);
  } else {
    const cf = el('div', 'dconf'); for (let i = 0; i < 18; i++) { const s = el('i'); s.style.cssText = `--x:${(i * 29 + 7) % 100}%;--d:${(i % 6) * .12}s;--h:${(i * 47) % 360}`; cf.append(s); }
    const ok = el('div', 'dok'); ok.innerHTML = '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    kids.push(cf, ok, el('h3', 'dh3', L('dn_thanks')), el('p', 'dtxt c', L('dn_thanks_sub')));
    const bx = el('div', 'dbox rc'); bx.append(dnRow(L('dn_order'), '#' + dst.order), dnRow(L('dn_method'), M.name), ...(M.fixed ? [] : [dnRow(L('dn_total'), dnTotal())]), dnRow('', new Date().toLocaleString(LANG))); kids.push(bx);
    kids.push(dnBtn(L('close'), 'pri dgo', () => DN.close()));
  }
  root.replaceChildren(...kids);
}
$('#donbtn').onclick = () => { dst.step = 1; dnPick(0); dnRender(); DN.showModal(); };
$('#dn-x').onclick = () => DN.close(); DN.addEventListener('click', e => { if (e.target === DN) DN.close(); });
let fontLn = 0;   // шрифт підвантажується лише при першому відкритті налаштувань
$('#gear').onclick = () => {
  if (!PNL.classList.contains('open') && !(D.s.un || '').trim()) return showReg();   // без імені доступу до налаштувань немає
  PNL.classList.toggle('open'); balanceLater();
  if (!fontLn && PNL.classList.contains('open')) { fontLn = 1; const l = el('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap'; document.head.append(l); }
};
new ResizeObserver(() => { if (PNL.classList.contains('open') && Math.min(D.s.lay === 'cat' ? 2 : 9, Math.max(1, Math.floor(($('.pb').clientWidth - 32 + 22) / 257))) !== pcN) balanceLater(); }).observe($('.pb'));
$('#px').onclick = () => PNL.classList.remove('open');
const delFont = k => {
  const f = fontCur(k); if (!f) return; const v = `"${f.n}",sans-serif`;
  D.s.cf = D.s.cf.filter(x => x !== f); freeImg(f.k); fontsOk.delete(f.k); if (D.s.tf === v) D.s.tf = 'inherit'; fontKey = ''; fontOpts(); applyS(); sync(); save();
};
$('#delfont').onclick = () => delFont('tf');
let fontTo = 'tf';
$('#addfont').onclick = () => { fontTo = 'tf'; $('#fontf').click(); };
$('#fontf').onchange = async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  let n = f.name.replace(/\.[^.]+$/, '').replace(/[^\p{L}\p{N} _-]/gu, '').trim().slice(0, 40) || 'Font', m = n, i = 2; while (D.s.cf.some(x => x.n === m)) m = n + ' ' + i++;
  const k = uid(); try {
    if (f.size > 8e6) throw 0;
    await imgPut(k, f); const x = { n: m, k }; if (!await loadFont(x)) { imgDel(k); throw 0; }
    D.s.cf.push(x); D.s[fontTo] = `"${m}",sans-serif`; fontOpts(); applyS(); sync(); save();
  } catch { mxAlert(L('font_bad')); }
};
/* 3D-стіна: окрема кнопка-перемикач і окреме вікно налаштувань */
$('#wallbtn').onclick = () => {
  if (D.s.tpl === 'wall') D.s.tpl = D.s.tpb || 'flat'; else { D.s.tpb = D.s.tpl; D.s.tpl = 'wall'; }
  sync(); applyS(); save();
};
const renderWpre = () => $('#wpre').replaceChildren(...WALL_PRE.map(([n], i) => { const b = el('button', 'chip', L(n)); b.type = 'button'; b.dataset.i = i; return b; }));
$('#wpre').addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return;
  Object.assign(D.s, WALL_DEF, WALL_PRE[+b.dataset.i][1]); sync(); applyS(); save();
});
$('#wreset').onclick = () => { Object.assign(D.s, WALL_DEF); sync(); applyS(); save(); };
new ResizeObserver(() => foyLater()).observe($('#grid'));
new ResizeObserver(es => { const r = es[0].contentRect; mbox.w = r.width; mbox.h = r.height; if (D) applyLater(); }).observe($('main'));
PNL.querySelector('.ph').addEventListener('dblclick', e => { if (e.target.closest('button')) return; try { localStorage.removeItem(GK); } catch { } loadGeo(true); });
PNL.addEventListener('pointerdown', e => {
  const rz = e.target.closest('.rz'), hd = e.target.closest('.ph');
  if (!rz && !(hd && !e.target.closest('button'))) return;
  e.preventDefault(); act = { d: rz ? rz.dataset.d : 'm', sx: e.clientX, sy: e.clientY, g: { ...geo } }; PNL.setPointerCapture(e.pointerId); PNL.classList.add('mv'); document.body.classList.add('mvb');   // на час руху вимикаємо важкі ефекти
});
PNL.addEventListener('pointermove', e => {
  if (!act) return; lastE = e; if (mvRaf) return;
  mvRaf = requestAnimationFrame(() => {
    mvRaf = 0; if (!act) return;
    const dx = lastE.clientX - act.sx, dy = lastE.clientY - act.sy, o = act.g, d = act.d, W = innerWidth, H = innerHeight, g = { ...o };
    if (d === 'm') { g.x = Math.min(Math.max(o.x + dx, 0), W - o.w); g.y = Math.min(Math.max(o.y + dy, 0), H - o.h); geo = g; PNL.style.transform = `translate3d(${g.x - o.x}px,${g.y - o.y}px,0)`; return; }   // рух — лише transform (без перерахунку розкладки)
    else {
      if (d.includes('e')) g.w = Math.min(o.w + dx, W - o.x);
      if (d.includes('s')) g.h = Math.min(o.h + dy, H - o.y);
      if (d.includes('w')) { const nx = Math.max(o.x + dx, 0); g.x = nx; g.w = o.w + (o.x - nx); }
      if (d.includes('n')) { const ny = Math.max(o.y + dy, 0); g.y = ny; g.h = o.h + (o.y - ny); }
      if (g.w < MINW) { if (d.includes('w')) g.x = o.x + o.w - MINW; g.w = MINW; }
      if (g.h < MINH) { if (d.includes('n')) g.y = o.y + o.h - MINH; g.h = MINH; }
    }
    setGeo(g);
  });
});
const endAct = () => { if (!act) return; act = null; PNL.style.transform = ''; setGeo(geo); PNL.classList.remove('mv'); document.body.classList.remove('mvb'); try { localStorage.setItem(GK, JSON.stringify(geo)); } catch { } };
PNL.addEventListener('pointerup', endAct); PNL.addEventListener('pointercancel', endAct);
document.addEventListener('input', e => {
  const i = e.target, k = i.dataset.k; if (!k) return; const st = D.s;
  if (k === 'sbb' || k === 'st') {   // пошук: внизу / вгорі — одна з двох або вимкнено
    st.sb = i.checked; if (i.checked) st.st = k === 'st';
    ctls.forEach(c => { if (c.dataset.k in VIRT) c.checked = ctlVal(c); });
  } else st[k] = i.type === 'checkbox' ? i.checked : i.type === 'range' ? +(+i.value).toFixed(4) : i.value;
  if (i.type === 'range') setP(i);
  updDeps(); applyLater(); save();
  if (k === 'ic') redraw(); else if (k === 'lang') useLang();
});
$('#bgfile').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  const id = await saveImg(f, 1920, 0.82); freeImg(D.s.bi); D.s.bi = id; D.s.bt = 'image'; sync(); applyS(); save();
};
$('#bgrm').onclick = () => { freeImg(D.s.bi); D.s.bi = null; D.s.bt = 'gradient'; sync(); applyS(); save(); };
$('#pdef').onclick = () => {
  const d = DEF().s; Object.keys(d).forEach(k => { if (k[0] === 'p') D.s[k] = d[k]; });
  sync(); applyS(); save();
};
$('#pwrst').onclick = async () => {   // знімає паролі з усіх сторінок (плитки лишаються)
  if (!D.p.some(p => p.pw)) return toast(L('pw_none'));
  if (!await ask('w_pw', L('pw_reset_confirm'))) return;
  D.p.forEach(p => delete p.pw); unl.clear(); renderTabs(); renderGrid(); save(); toast(L('pw_reset_done'));
};
$('#rst').onclick = async () => {   // скидає лише налаштування; плитки, вкладки й свої теми лишаються
  if (!await ask('w_rst', L('rst_confirm'))) return;
  freeImg(D.s.bi); D.s.cf.forEach(f => freeImg(f.k)); { const k = ['un', 'cd', 'cds', 'al', 'alm'], keep = k.map(q => D.s[q]); D.s = DEF().s; k.forEach((q, i) => { if (keep[i] !== undefined) D.s[q] = keep[i]; }); } fontKey = ''; D.cur = D.cur; delete D.po;
  document.querySelectorAll('dialog[open]').forEach(x => x.close());
  useLang(); save(); toast(L('rst_done'));
};
const b2d = b => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });
$('#exp').onclick = async () => {
  if (TEST) return toast(L('test_block'));
  const ids = new Set([D.s.bi, ...D.s.cf.map(f => f.k), ...D.p.flatMap(p => walk(p.t).flatMap(t => [t.img, t.si, t.st]))].filter(Boolean)), imgs = {};
  for (const id of ids) { const b = await imgGet(id); if (b) imgs[id] = await b2d(b); }
  const a = el('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ d: D, imgs })], { type: 'application/json' }));
  a.download = 'speed-dial-backup.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
};
$('#lnk').onclick = async () => {   // усі адреси плиток → текстовий файл (місце обирає користувач)
  const out = [], sub = (a, d) => a.forEach(t => { if (t.folder) { out.push('  '.repeat(d) + '▸ ' + t.title); sub(t.t || [], d + 1); } else out.push('  '.repeat(d) + t.title + ' — ' + t.url); });
  D.p.forEach((p, i) => { if (i) out.push(''); out.push('=== ' + p.name + ' ==='); sub(p.t, 0); });
  const blob = new Blob([out.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
  try {
    if (window.showSaveFilePicker) { const h = await showSaveFilePicker({ suggestedName: 'speed-dial-links.txt', types: [{ description: 'Text', accept: { 'text/plain': ['.txt'] } }] }); const w = await h.createWritable(); await w.write(blob); await w.close(); }
    else { const a = el('a'); a.href = URL.createObjectURL(blob); a.download = 'speed-dial-links.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); }
    toast(L('links_done'));
  } catch (e) { if (e && e.name !== 'AbortError') mxAlert(String(e)); }
};
$('#imp').onclick = () => $('#impf').click();
$('#impf').onchange = async e => {
  const f = e.target.files[0]; if (TEST) { e.target.value = ''; return toast(L('test_block')); } if (!f || !await ask('w_imp', L('imp_confirm'))) return;
  try {
    const j = JSON.parse(await f.text()); if (!j.d || !j.d.p || !j.d.p.length) throw 0;
    await tx('readwrite', s => s.clear());
    for (const [id, u] of Object.entries(j.imgs || {})) await imgPut(id, await (await fetch(u)).blob());
    D = fixD(j.d); if (!D.p.some(p => p.id === D.cur)) D.cur = D.p[0].id;
    await flush(); location.reload();
  } catch { mxAlert(L('imp_bad')); }
};

/* ---------- Пошук ---------- */
const ENG = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=%s' },
  { id: 'ddg', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=%s' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=%s' },
  { id: 'brave', name: 'Brave Search', url: 'https://search.brave.com/search?q=%s' },
  { id: 'ecosia', name: 'Ecosia', url: 'https://www.ecosia.org/search?q=%s' },
  { id: 'startpage', name: 'Startpage', url: 'https://www.startpage.com/do/search?q=%s' },
  { id: 'yahoo', name: 'Yahoo', url: 'https://search.yahoo.com/search?p=%s' },
  { id: 'gimg', nk: 'eng_gimg', name: 'Google Images', url: 'https://www.google.com/search?tbm=isch&q=%s' },
  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/results?search_query=%s' },
  { id: 'wiki', nk: 'eng_wiki', name: 'Wikipedia', url: null },   // адреса залежить від мови інтерфейсу
  { id: 'github', name: 'GitHub', url: 'https://github.com/search?q=%s' }
];
const engines = () => ENG.concat(D.engines);
const ename = e => e.nk ? L(e.nk) : e.name;
const eurl = e => e.id === 'wiki' ? `https://${LANG}.wikipedia.org/w/index.php?search=%s` : e.url;
function renderEngines() {
  const s = $('#se'); s.replaceChildren(...ENG.map(e => new Option(ename(e), e.id)));
  if (D.engines.length) { const g = document.createElement('optgroup'); g.label = L('eng_mine'); D.engines.forEach(e => g.append(new Option(e.name, e.id))); s.append(g); }
  if (!engines().some(e => e.id === D.s.se)) D.s.se = 'google';
  s.value = D.s.se; $('#sq').placeholder = L('sq_ph', ename(engines().find(e => e.id === D.s.se)));
  const del = $('#se-del'); if (del) del.disabled = !D.engines.some(e => e.id === D.s.se);   // «Видалити свою» активна лише коли обрано власну систему
}
$('#se').onchange = e => { D.s.se = e.target.value; renderEngines(); save(); $('#sq').focus(); };
$('#sb').onsubmit = e => {
  e.preventDefault(); const q = $('#sq').value.trim(); if (!q) return;
  const en = engines().find(x => x.id === D.s.se) || ENG[0], url = eurl(en).split('%s').join(encodeURIComponent(q));
  if (D.s.sn) window.open(url, '_blank'); else { if (timer) flush(); location.assign(url); }
};
document.addEventListener('keydown', e => {   // «/» — перейти до пошуку
  if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || document.body.classList.contains('nosb')) return;
  if ((e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) || document.querySelector('dialog[open]')) return;
  e.preventDefault(); $('#sq').focus();
});
$('#se-add').onclick = async () => {
  const n = ((await mxPrompt(L('se_name_prompt'), '')) || '').trim().slice(0, 30); if (!n) return;
  const u = ((await mxPrompt(L('se_url_prompt'), 'https://', v => /^https?:\/\/\S+$/i.test(v) && v.includes('%s'))) || '').trim();
  if (!/^https?:\/\/\S+$/i.test(u) || !u.includes('%s')) return mxAlert(L('se_url_bad'));
  const e = { id: 'c' + uid(), name: n, url: u }; D.engines.push(e); D.s.se = e.id; renderEngines(); save();
};
$('#se-del').onclick = async () => {
  const e = D.engines.find(x => x.id === D.s.se);
  if (!e) return;
  if (!await ask('w_del', L('se_del_confirm', e.name))) return;
  D.engines = D.engines.filter(x => x !== e); D.s.se = 'google'; renderEngines(); save();
};

/* ---------- Мова інтерфейсу ---------- */
function applyLang() {
  if (typeof D !== 'undefined' && D && D.s) pncTxt();
  document.documentElement.lang = LANG; document.title = L('app');
  document.querySelectorAll('input[type=file]:not([hidden])').forEach(i => {   // власна кнопка «Вибрати файл» (рідний напис браузера не залежить від мови розширення)
    const b = el('button', 'fbtn'); b.type = 'button'; b.dataset.i18n = 'b_choose'; b.onclick = () => i.click(); i.before(b); i.hidden = true;
  });
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = L(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-title]').forEach(e => { e.title = L(e.dataset.i18nTitle); });
  document.querySelectorAll('[data-i18n-ph]').forEach(e => { e.placeholder = L(e.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', L(e.dataset.i18nAria)); });
  const ls = $('#lang'); ls.replaceChildren(new Option(L('lang_auto'), 'auto'), ...LANGS.map(([c, n]) => new Option(n, c)));
  segInit(); cdForm(); catBuild(); catApply(); uiInit(); renderTabs(); redraw(); applyS(); hbTitle(); testBtn(); setPth();
  idle(() => { renderThemes($('#theme').value); renderEngines(); renderWpre(); sync(); balanceLater(); });   // панель налаштувань — не критична для першого кадру
}
const hbTitle = () => { const on = document.body.classList.contains('hid'), b = $('#hidebtn'); b.title = b.ariaLabel = L(on ? 'hide_off' : 'hide_on'); b.setAttribute('aria-pressed', on); };
$('#hidebtn').onclick = () => { document.body.classList.toggle('hid'); hbTitle(); };
function useLang() { setLang(D.s.lang === 'auto' ? detectLang() : D.s.lang); applyLang(); }

/* ---------- Синхронізація між вкладками ---------- */
document.addEventListener('visibilitychange', async () => {
  if (document.hidden || timer || !D || TEST || document.querySelector('dialog[open]')) return;
  const r = await chrome.storage.local.get('d'); if (!r.d || timer) return;
  const nd = fixD(r.d); if (JSON.stringify(nd) === JSON.stringify(D)) return;
  D = nd; if (!D.p.some(p => p.id === D.cur)) D.cur = D.p[0].id;
  useLang();
});

/* ---------- Перший запуск: вікно з вводом імені ---------- */
/* Цифровий дощ за вікном входу: легкий canvas (≈20 кадрів/с), працює лише поки вікно відкрите й вкладка видима */
const RAIN = (() => {
  const cv = $('#nm-rain'), cx = cv.getContext('2d', { alpha: false }), FS = 18, GL = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎ0123456789ABCDEF<>/{}[]=+*#$%'.split('');
  let raf = 0, last = 0, cols = [], on = false;
  const rnd = () => GL[Math.random() * GL.length | 0];
  function size() {
    cv.width = innerWidth; cv.height = innerHeight; cx.font = FS + 'px "MS Gothic","Noto Sans Mono CJK JP",Consolas,monospace'; cx.textBaseline = 'top';
    cx.fillStyle = '#010805'; cx.fillRect(0, 0, cv.width, cv.height);
    cols = Array.from({ length: Math.ceil(cv.width / FS) }, () => ({ y: -Math.random() * cv.height / FS, v: .22 + Math.random() * .55, ch: '', row: -1 }));
  }
  function frame(t) {
    raf = on && !document.hidden ? requestAnimationFrame(frame) : 0;
    if (t - last < 48) return; last = t;
    cx.fillStyle = 'rgba(1,8,5,.1)'; cx.fillRect(0, 0, cv.width, cv.height);
    const rows = cv.height / FS;
    cols.forEach((c, i) => {
      c.y += c.v; const r = c.y | 0; if (r === c.row) return;
      if (c.row >= 0 && c.row < rows) { cx.fillStyle = '#17c46f'; cx.fillText(c.ch, i * FS, c.row * FS); }
      c.row = r; c.ch = rnd();
      if (r >= 0 && r < rows) { cx.fillStyle = '#d7ffe9'; cx.fillText(c.ch, i * FS, r * FS); }
      else if (r > rows && Math.random() > .975) { c.y = -Math.random() * 12; c.v = .22 + Math.random() * .55; c.row = -1; }
    });
  }
  const kick = () => { if (on && !raf && !document.hidden) raf = requestAnimationFrame(frame); };
  document.addEventListener('visibilitychange', kick);
  addEventListener('resize', () => { if (on) size(); });
  return {
    start() { if (matchMedia('(prefers-reduced-motion:reduce)').matches) return; on = true; cv.hidden = false; size(); kick(); },
    stop() { on = false; cancelAnimationFrame(raf); raf = 0; }
  };
})();
$('#nm').addEventListener('close', RAIN.stop);
function showReg(edit) {
  const d = $('#nm'); if (!d || d.open) return; const i = $('#reg-i'); i.value = D.s.un || '';
  if (!document.getElementById('unf-ru')) { const l = el('link'); l.id = 'unf-ru'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Russo+One&display=swap'; document.head.append(l); }
  $('#reg-h').textContent = L(edit ? 'reg_t2' : 'reg_t'); d.classList.toggle('edit', !!edit);
  if (!edit) PNL.classList.remove('open');
  d.oncancel = e => { if (!(D.s.un || '').trim()) e.preventDefault(); };   // без імені закрити не можна
  d.onclick = e => { if (e.target === d && (D.s.un || '').trim()) d.close(); };
  $('#reg-f').onsubmit = e => {
    e.preventDefault(); const n = i.value.trim().slice(0, 24);
    if (!n) { i.value = ''; i.classList.remove('bad'); void i.offsetWidth; i.classList.add('bad'); i.focus(); return; }
    D.s.un = n; unApply(); save(); d.close();
  };
  i.oninput = () => i.classList.remove('bad');
  d.showModal(); RAIN.start(); i.focus(); i.select();
}
$('#unedit').onclick = () => showReg(true);

/* ---------- Старт ---------- */
(async () => {
  let c = null; try { c = JSON.parse(localStorage.getItem('sdd')); } catch { }
  if (c && c.s && c.s.wver === 5 && c.s.tpl !== '3d' && !('cols' in c.s) && c.p && c.p.length) { D = fixD(c); useLang(); }   // миттєвий кадр зі знімка
  const r = await chrome.storage.local.get('d');
  const mig = !r.d || !r.d.s || r.d.s.wver !== 5 || r.d.s.tpl === '3d' || 'cols' in r.d.s;
  const nd = fixD(r.d || DEF());
  if (!D || (!timer && JSON.stringify(nd) !== JSON.stringify(D))) { D = nd; useLang(); }
  if (mig || limHit || limSave) { limSave = 0; save(); }
  limHit = 0;
  if (!r.d) D.sv = WN.v;   // нова установка: вікно змін не потрібне
  else if (D.sv !== WN.v) { document.body.classList.add('wnew'); if ((D.s.un || '').trim()) setTimeout(wnShow, 700); }
  if (!(D.s.un || '').trim()) showReg();
  drainQ().then(() => setTimeout(thumbAll, 1200));
  setTimeout(() => (window.requestIdleCallback || setTimeout)(gc), 15000);
})();

/* ---------- Таймер: скільки часу відкрито браузер ---------- */
(async () => {
  const up = $('#up'); let t0 = Date.now();
  try { const r = await chrome.storage.session.get('bt'); if (r.bt) t0 = r.bt; else await chrome.storage.session.set({ bt: t0 }); } catch { }
  const f = n => String(n).padStart(2, '0'), tick = () => {
    if (document.hidden) return; const s = Math.max(0, Math.floor((Date.now() - t0) / 1000));
    up.textContent = `${Math.floor(s / 3600)}:${f(Math.floor(s / 60) % 60)}:${f(s % 60)}`;
  };
  tick(); setInterval(tick, 1000); document.addEventListener('visibilitychange', tick);
})();

/* ---------- Налаштування: перенесення блоків (захопити за заголовок, скинути на інший блок — міняються місцями) ---------- */
(() => {
  const pc = $('.pcols'); let ds = null;
  const clr = () => { pc.querySelectorAll('.sdrag,.sover').forEach(x => x.classList.remove('sdrag', 'sover')); pc.querySelectorAll('section[draggable]').forEach(x => x.removeAttribute('draggable')); ds = null; };
  pc.addEventListener('mousedown', e => { clr(); const h = e.target.closest('h3'); if (h) h.parentElement.draggable = true; });
  pc.addEventListener('dragstart', e => {
    const s = e.target.closest && e.target.closest('section'); if (!s || e.target !== s) return;
    ds = s; e.dataTransfer.setData('text/x-sec', secKey(s)); e.dataTransfer.effectAllowed = 'move'; requestAnimationFrame(() => s.classList.add('sdrag'));
  });
  pc.addEventListener('dragover', e => {
    if (!ds) return; const s = e.target.closest('section'); e.preventDefault();
    pc.querySelectorAll('.sover').forEach(x => x !== s && x.classList.remove('sover')); if (s && s !== ds) s.classList.add('sover');
  });
  pc.addEventListener('drop', e => {
    if (!ds) return; const s = e.target.closest('section'); e.preventDefault();
    if (s && s !== ds) {
      const o = secOrder([...pc.querySelectorAll('section')]).map(secKey), a = o.indexOf(secKey(ds)), b = o.indexOf(secKey(s));
      [o[a], o[b]] = [o[b], o[a]]; D.po = o; save();
    }
    clr(); balanceCols();
  });
  pc.addEventListener('dragend', () => { clr(); });
  pc.addEventListener('mouseup', () => { if (!ds) pc.querySelectorAll('section[draggable]').forEach(x => x.removeAttribute('draggable')); });
})();

/* ---------- Темний / світлий вигляд вікна налаштувань ---------- */
/* поточна версія розширення в шапці налаштувань (шрифт Iceland) */
try {
  $('#pver').textContent = 'v' + chrome.runtime.getManifest().version;
  const l = el('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Iceland&display=swap'; document.head.append(l);
} catch { }
function setPth() { const t = D.s.pth === 'light' ? 'light' : 'dark'; PNL.dataset.th = t; document.body.dataset.pth = t; $('#pth-d').classList.toggle('on', t === 'dark'); $('#pth-l').classList.toggle('on', t === 'light'); $('#pth-d').setAttribute('aria-pressed', t === 'dark'); $('#pth-l').setAttribute('aria-pressed', t === 'light'); }
$('#pth-d').onclick = () => { D.s.pth = 'dark'; setPth(); save(); };
$('#pth-l').onclick = () => { D.s.pth = 'light'; setPth(); save(); };

/* ---------- Оновлення без перевстановлення: нові файли пишуться прямо в папку розширення, дані в chrome.storage лишаються ---------- */
const idb = (m, k, v) => new Promise((res, rej) => { const o = indexedDB.open('sdupd', 1); o.onupgradeneeded = () => o.result.createObjectStore('s'); o.onerror = () => rej(o.error); o.onsuccess = () => { try { const s = o.result.transaction('s', m === 'get' ? 'readonly' : 'readwrite').objectStore('s'); const q = m === 'get' ? s.get(k) : m === 'set' ? s.put(v, k) : s.delete(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); } catch (e) { rej(e); } }; });
var updX = '', updV = '';
const updMark = v => {
  updV = v || ''; document.body.classList.toggle('upd', !!v);
  const n = $('#upn'); n.hidden = !v || updX === v;
  if (v) { $('#upn-t').textContent = L('upd_n'); $('#upn-s').textContent = L('upd_n2', v); }
};
const updPoll = () => chrome.storage.local.get(['updv', 'updt', 'updx']).then(r => { updX = r.updx || ''; updMark(r.updv); if (Date.now() - (r.updt || 0) > 6e5) chrome.runtime.sendMessage({ t: 'upd-check' }).catch(() => { }); });
updPoll(); document.addEventListener('visibilitychange', () => { if (!document.hidden) updPoll(); });   // повернулися на вкладку — перевіряємо, чи не вийшла нова версія
chrome.storage.onChanged.addListener((c, a) => { if (a === 'local' && c.updv) updMark(c.updv.newValue); });
let updBusy = false;
async function updRun() {
  if (updBusy) return;
  const cur = chrome.runtime.getManifest().version;
  if (UPD_BASE.includes('YOUR_')) return mxAlert(L('upd_cfg'));
  let v = (await chrome.storage.local.get('updv')).updv;
  if (!v) { const r = await chrome.runtime.sendMessage({ t: 'upd-check' }).catch(() => null); if (r === null || r === undefined) return mxAlert(L('upd_err')); if (!r) return mxAlert(L('upd_no', cur)); v = r; }
  if (!window.showDirectoryPicker) return mxAlert(L('upd_nofs'));
  let h = null; try { h = await idb('get', 'dir'); } catch (e) { }
  if (!(await mx(L(h ? 'upd_ask' : 'upd_ask1', cur, v)))) return;
  updBusy = true; document.body.classList.add('updb');
  try {
    if (h && (await h.queryPermission({ mode: 'readwrite' })) !== 'granted' && (await h.requestPermission({ mode: 'readwrite' })) !== 'granted') h = null;
    if (!h) h = await showDirectoryPicker({ mode: 'readwrite' });
    const mf = JSON.parse(await (await (await h.getFileHandle('manifest.json')).getFile()).text());   // це справді папка цього розширення?
    if (mf.name !== chrome.runtime.getManifest().name || mf.version !== cur) { await idb('del', 'dir').catch(() => { }); throw new Error('wrong'); }
    await idb('set', 'dir', h).catch(() => { });
    const list = await (await fetch(UPD_BASE + 'files.json?t=' + Date.now(), { cache: 'no-store' })).json();
    const files = [];
    for (const p of list) { const r = await fetch(UPD_BASE + p + '?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) throw new Error('dl'); files.push([p, await r.blob()]); }   // спершу все завантажуємо, і лише потім пишемо
    files.sort((a, b) => (a[0] === 'manifest.json') - (b[0] === 'manifest.json'));
    for (const [p, blob] of files) {
      const parts = p.split('/'), name = parts.pop(); let d = h;
      for (const s of parts) d = await d.getDirectoryHandle(s, { create: true });
      const w = await (await d.getFileHandle(name, { create: true })).createWritable(); await w.write(blob); await w.close();
    }
    await chrome.storage.local.remove('updv');
    await mxAlert(L('upd_ok', v));
    try { const tb = await chrome.tabs.getCurrent(); await chrome.storage.local.set({ updre: tb ? tb.id : 0 }); } catch (e) { }
    chrome.runtime.reload();
  } catch (e) {
    if (e && e.name === 'AbortError') { /* користувач закрив вибір папки */ } else await mxAlert(L(e && e.message === 'wrong' ? 'upd_wrong' : 'upd_fail'));
  }
  updBusy = false; document.body.classList.remove('updb');
}
$('#updbtn').onclick = updRun;
$('#upn').onclick = e => { if (e.target.id === 'upn-x') { updX = updV; chrome.storage.local.set({ updx: updV }).catch(() => { }); $('#upn').hidden = true; } else updRun(); };

/* ---------- «Пульс»: сканує посилання плиток — мертві, переїхали, повільні, припарковані домени ---------- */
var PLS = { t: 0, r: {} };   // var: плитки можуть малюватися ще до цього рядка
function lpOf(t) { const x = PLS && PLS.r && PLS.r[t.id]; return x && x.u === t.url ? x : null; }   // function + var: викликається ще під час першого малювання плиток
const lpSkip = u => { try { const o = new URL(u), h = o.hostname; return !/^https?:$/.test(o.protocol) || h === 'localhost' || !h.includes('.') || /\.(local|lan|internal|home|corp)$/.test(h) || /^(10\.|127\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h) || h.startsWith('['); } catch { return true; } };
const lpReg = h => h.replace(/^www\./, '').split('.').slice(-2).join('.');
const LP_AUTH = /login|signin|sign-in|auth|sso|account|oauth|consent|verify|session|captcha|cookie|continue=|redirect|return/i;
const LP_PARK = /domain (is |may be |name )?(for sale|parked|available)|buy this domain|this domain (name )?(is|may be) (for sale|available)|parked (free|domain|page)|sedoparking|hugedomains|afternic|домен (продається|продаж)/i;
async function lpOne(u) {
  const once = async () => {
    const ac = new AbortController(), tm = setTimeout(() => ac.abort(), 8000), t0 = performance.now();
    try {
      const r = await fetch(u, { signal: ac.signal, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'follow' });
      const o = { c: r.status, ms: Math.round(performance.now() - t0) };
      if (r.redirected && r.url && r.url !== u) o.to = r.url;
      let body = '', done = false;
      if (r.ok && r.body && /html/i.test(r.headers.get('content-type') || '')) {   // читаємо лише початок сторінки, щоб не вантажити зайвого
        const rd = r.body.getReader(), td = new TextDecoder(); let n = 0;
        while (n < 30000) { const x = await rd.read(); if (x.done) { done = true; break; } n += x.value.length; body += td.decode(x.value, { stream: true }); }
        rd.cancel().catch(() => { });
      } else if (r.body) r.body.cancel().catch(() => { });
      o.park = done && body.length < 30000 && LP_PARK.test(body);
      return o;
    } finally { clearTimeout(tm); }
  };
  let o; try { o = await once(); } catch { await new Promise(r => setTimeout(r, 1500)); try { o = await once(); } catch { o = { c: 0, ms: 0 }; } }   // одна повторна спроба, щоб не лякати хибними «мертвими»
  const x = { u, c: o.c, ms: o.ms };
  if (!o.c || o.c === 404 || o.c === 410) x.s = 'dead';
  else if (o.c >= 500) x.s = 'err';
  else if (o.park) x.s = 'parked';
  else {
    x.s = 'ok';
    if (o.to) { try { const a = new URL(u), b = new URL(o.to); if (lpReg(a.hostname) !== lpReg(b.hostname) && !LP_AUTH.test(b.hostname + b.pathname + b.search)) { x.s = 'moved'; x.to = o.to; } } catch { } }
    if (x.s === 'ok' && o.ms > 3500) x.s = 'slow';
  }
  return x;
}
const lpAll = () => walk(D.p.flatMap(p => p.t)).filter(t => !t.folder && t.url && !lpSkip(t.url));
const lpProb = () => lpAll().filter(t => { const r = lpOf(t); return r && ['dead', 'err', 'parked', 'moved'].includes(r.s); });
function lpBtn(txt) { const b = $('#lp-res'); if (!b) return; const n = PLS.t ? lpProb().length : 0; b.textContent = txt || (PLS.t ? L('lp_resn', n) : L('lp_res')); b.classList.toggle('bad', !txt && n > 0); }
let lpBusy = false;
async function lpScan(quiet) {
  if (lpBusy) return; if (!navigator.onLine) { if (!quiet) mxAlert(L('lp_off')); return; }
  const ts = lpAll(); if (!ts.length) { if (!quiet) mxAlert(L('lp_empty')); return; }
  lpBusy = true; $('#lp-scan').disabled = true;
  const urls = [...new Set(ts.map(t => t.url))], res = new Map(); let n = 0, i = 0;
  const upd = () => { const s = L('lp_run', n, urls.length); lpBtn(s); if (BL.open && BL.dataset.m === 'lp') $('#bl-s').textContent = s; };
  upd();
  const worker = async () => { while (i < urls.length) { const u = urls[i++]; res.set(u, await lpOne(u)); n++; upd(); } };
  await Promise.all(Array.from({ length: quiet ? 2 : 5 }, worker));
  const r = {}; for (const t of ts) { const x = res.get(t.url); if (x) r[t.id] = { ...x }; }
  PLS = { t: Date.now(), r }; try { chrome.storage.local.set({ lp: PLS }); } catch { }
  lpBusy = false; $('#lp-scan').disabled = false; lpBtn(); redraw(); if (BL.open && BL.dataset.m === 'lp') lpDraw();
}
const holderOf = t => { for (const p of D.p) { if (p.t.includes(t)) return p; for (const f of p.t) if (f.folder && f.t.includes(t)) return f; } return null; };
let lpF = 'p';
function lpDraw() {
  BL.dataset.m = 'lp'; $('#bl .blk').textContent = '// PULSE'; const h2 = $('#bl h2'); h2.dataset.i18n = 's_lp'; h2.textContent = L('s_lp');
  const ord = ['dead', 'err', 'parked', 'moved', 'slow', 'ok'], cnt = {}, rows = [];
  for (const t of lpAll()) { const r = lpOf(t); if (!r) continue; cnt[r.s] = (cnt[r.s] || 0) + 1; if (lpF === 'a' || ['dead', 'err', 'parked', 'moved'].includes(r.s)) rows.push([t, r]); }
  rows.sort((a, b) => ord.indexOf(a[1].s) - ord.indexOf(b[1].s));
  $('#bl-n').textContent = PLS.t ? L('lp_last', new Date(PLS.t).toLocaleString(/^[a-z]{2}/i.test(D.s.lang || '') && D.s.lang !== 'auto' ? D.s.lang : undefined, { dateStyle: 'medium', timeStyle: 'short' })) : L('lp_never');
  $('#bl-s').textContent = lpBusy ? L('lp_run', 0, 0) : ord.filter(k => cnt[k]).map(k => L('lp_s_' + k) + ' ' + cnt[k]).join(' · '); $('#bl-s').className = '';
  const f = $('#bl-f'); f.hidden = false;
  f.replaceChildren(...[['p', 'lp_f_p'], ['a', 'lp_f_a']].map(([k, tk]) => { const b = el('button', 'lpf' + (lpF === k ? ' on' : ''), L(tk)); b.type = 'button'; b.onclick = () => { lpF = k; lpDraw(); }; return b; }));
  const g = $('#bl-g');
  if (!rows.length) { g.replaceChildren(el('div', 'blr', PLS.t ? L('lp_none') : L('lp_never'))); return; }
  g.replaceChildren(...rows.map(([t, r]) => {
    const row = el('div', 'blr lpr'), st = el('b', 'lps ' + r.s, L('lp_s_' + r.s)), nm = el('span', 'blt');
    let host = r.u; try { host = new URL(r.u).hostname; } catch { }
    nm.append(el('span', 'lpn', t.title || host), el('small', null, host + (r.c ? ' · ' + r.c : '') + (r.ms ? ' · ' + r.ms + ' ms' : '') + (r.to ? ' → ' + r.to : '')));
    const ac = el('span', 'lpa'), bt = (k, fn) => { const b = el('button', null, L(k)); b.type = 'button'; b.onclick = fn; ac.append(b); };
    const op = el('a', null, L('lp_open')); op.href = r.u; op.target = '_blank'; op.rel = 'noopener'; ac.append(op);
    if (r.to) bt('lp_fix', () => { t.url = r.to; delete PLS.r[t.id]; try { chrome.storage.local.set({ lp: PLS }); } catch { } redraw(); save(); lpBtn(); lpDraw(); });
    bt('lp_rm', async () => { if (!(await mx(L('lp_del', t.title)))) return; const h = holderOf(t); if (h) { delTile(t, h); lpBtn(); lpDraw(); } });
    row.append(st, nm, ac); return row;
  }));
}
$('#lp-scan').onclick = () => lpScan(false);
$('#lp-res').onclick = () => { lpDraw(); BL.showModal(); };
chrome.storage.local.get('lp').then(x => { if (x.lp && x.lp.r) PLS = x.lp; lpBtn(); redraw(); }).catch(() => { });
setTimeout(() => { const d = { 7: 7, 30: 30 }[D && D.s && D.s.lpw]; if (d && Date.now() - PLS.t > d * 864e5 && !document.hidden) lpScan(true); }, 9000);

/* ---------- QR-код плитки: скануєте телефоном і відкриваєте адресу ---------- */
function qrShow(t) {
  let u = t.url; try { u = new URL(t.url).href; } catch { }   // href кодує кирилицю й IDN, щоб QR прочитався будь-яким телефоном
  let q = null;
  for (const lv of [QRLib.L.M, QRLib.L.L]) { try { q = new QRLib.QRCode(0, lv); q.addData(u); q.make(); break; } catch { q = null; } }
  if (!q) return mxAlert(L('qr_long'));
  const cv = $('#qr-c'), x = cv.getContext('2d'), n = q.getModuleCount(), b = 4, s = Math.floor(264 / (n + b * 2)), off = Math.floor((264 - s * n) / 2);
  x.fillStyle = '#fff'; x.fillRect(0, 0, 264, 264); x.fillStyle = '#000';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) x.fillRect(off + c * s, off + r * s, s, s);
  $('#qr-t').textContent = t.title || ''; $('#qr-u').textContent = u; $('#qr').showModal();
}
$('#qr-ok').onclick = () => $('#qr').close();
$('#qr').addEventListener('click', e => { if (e.target.id === 'qr') $('#qr').close(); });
