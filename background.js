importScripts('upd.js');
// Запам'ятовує момент запуску браузера для таймера на стартовій сторінці (storage.session очищується при закритті браузера)
const mark = () => chrome.storage.session.set({ bt: Date.now() });
chrome.runtime.onStartup.addListener(mark);
chrome.runtime.onInstalled.addListener(async () => { const r = await chrome.storage.session.get('bt'); if (!r.bt) mark(); });

// Паніка-клавіша: поточний сайт ховається (перехід на Gmail); якщо це вже Gmail — нічого не робимо
const PANIC_URL = 'https://mail.google.com/mail/u/0/#inbox';
chrome.runtime.onMessage.addListener((m, s) => { if (m && m.t === 'panic' && s.tab) panic(s.tab); });
async function panic(tab) {
  if ((tab.url || '').startsWith('https://mail.google.com/')) return;
  const [g] = await chrome.tabs.query({ url: 'https://mail.google.com/*' });
  if (g) { await chrome.tabs.update(g.id, { active: true }); await chrome.windows.update(g.windowId, { focused: true }); }
  else await chrome.tabs.create({ url: PANIC_URL });
}

// Вже відкриті вкладки не отримують скрипт автоматично — вставляємо його при встановленні/оновленні та старті браузера
async function injectPanic() {
  const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
  for (const t of tabs) chrome.scripting.executeScript({ target: { tabId: t.id }, files: ['panic.js', 'lock.js'] }).catch(() => { });
}
chrome.runtime.onInstalled.addListener(injectPanic);
chrome.runtime.onStartup.addListener(injectPanic);

// Автоочистка історії (дозвіл «history» необов'язковий і запитується у налаштуваннях)
const hcBase = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
const hcOk = () => chrome.permissions.contains({ permissions: ['history'] });
async function hcGen(force) {            // уся історія за обраний період
  const c = (await chrome.storage.local.get('hc')).hc || {};
  if (!c.on) return 0; if (!(await hcOk())) return 0;
  const now = Date.now(); await chrome.history.deleteRange({ startTime: c.h ? now - c.h * 36e5 : 0, endTime: now }); return 1;
}
async function hcSites(force) {          // окремі сайти — повністю
  const c = (await chrome.storage.local.get('hc')).hc || {};
  if (!c.son) return 0; if (!(await hcOk())) return 0;
  if (!(c.sites || []).length) return 0;
  let n = 1;
  for (const h of c.sites || []) {
    const items = await chrome.history.search({ text: h, startTime: 0, maxResults: 5000 });
    for (const it of items) { const q = hcBase(it.url); if (q === h || q.endsWith('.' + h)) { await chrome.history.deleteUrl({ url: it.url }).catch(() => { }); n++; } }
  }
  return n;
}
// розклад задає користувач: m — лише вручну, c — при закритті браузера, число — кожні N хв
async function hcSched(start) {
  const c = (await chrome.storage.local.get('hc')).hc || {};
  for (const [al, on, w, run] of [['hc', c.on, c.w, hcGen], ['hs', c.son, c.sw, hcSites]]) {
    const n = +w;
    if (on && n > 0) { const cur = await chrome.alarms.get(al); if (!cur || cur.periodInMinutes !== n) chrome.alarms.create(al, { delayInMinutes: n, periodInMinutes: n }); } else chrome.alarms.clear(al);
    if (start && on && w === 'c') run().catch(() => { });   // підстраховка: якщо під час закриття очистка не встигла
  }
}
chrome.alarms.onAlarm.addListener(a => { if (a.name === 'hc') hcGen().catch(() => { }); if (a.name === 'hs') hcSites().catch(() => { }); });
chrome.storage.onChanged.addListener((c, a) => { if (a === 'local' && c.hc) hcSched(); });
chrome.runtime.onStartup.addListener(() => hcSched(true));
chrome.runtime.onInstalled.addListener(() => hcSched());
chrome.runtime.onMessage.addListener((m, s, send) => { if (m && m.t === 'hc-now') { hcGen(true).then(send, () => send(0)); return true; } if (m && m.t === 'hs-now') { hcSites(true).then(send, () => send(0)); return true; } });

// «При закритті»: коли закривається останнє вікно браузера, виконуємо очистку
chrome.windows.onRemoved.addListener(async () => {
  try {
    if ((await chrome.windows.getAll()).length) return;
    const c = (await chrome.storage.local.get('hc')).hc || {};
    if (c.on && c.w === 'c') await hcGen();
    if (c.son && c.sw === 'c') await hcSites();
  } catch { }
});

/* ---------- Події/таймери: коли час настав — відкриваємо нову вкладку, і «Швидкий набір» показує сповіщення ---------- */
const evIso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
let evBusy = false;
async function evRun() {
  if (evBusy) return; evBusy = true;
  try {
    const c = (await chrome.storage.local.get('evc')).evc; if (!c || !c.on || !(c.list || []).length) return;
    const g = await chrome.storage.local.get(['evf', 'evo']), f = g.evf || {}, o = g.evo || {}, now = new Date(), iso = evIso(now); let due = 0;
    for (const e of c.list) {
      if (f[e.k] === iso || o[e.k] === iso) continue;   // вже показано або вкладку вже відкривали
      let hit = false;
      if (e.tm) { if (e.x) hit = now >= e.x && now - e.x < 6e5; else { const [h, m] = e.tm.split(':').map(Number), t = new Date(now); t.setHours(h, m, 0, 0); const diff = now - t; hit = diff >= 0 && diff < 6e5; } }
      else hit = !!e.d && (e.y ? e.d.slice(5) === iso.slice(5) : e.d === iso);
      if (hit) { o[e.k] = iso; due++; }
    }
    if (!due) return;
    await chrome.storage.local.set({ evo: o });
    const old = (await chrome.tabs.query({})).find(t => /^chrome:\/\/newtab|^chrome-extension:\/\/[a-z]+\/newtab\.html/i.test(t.url || t.pendingUrl || ''));
    if (old) { await chrome.tabs.update(old.id, { active: true }); await chrome.windows.update(old.windowId, { focused: true }); }
    else await chrome.tabs.create({});   // нова вкладка = «Швидкий набір»
  } catch { } finally { evBusy = false; }
}
const evSched = async () => { if (!(await chrome.alarms.get('ev'))) chrome.alarms.create('ev', { delayInMinutes: 1, periodInMinutes: 1 }); };
chrome.alarms.onAlarm.addListener(a => { if (a.name === 'ev') evRun(); });
chrome.runtime.onStartup.addListener(evSched); chrome.runtime.onInstalled.addListener(evSched); evSched();
chrome.storage.onChanged.addListener((c, a) => { if (a === 'local' && c.evc) evRun(); });

/* ---------- Режим захисту: після бездіяльності браузера (chrome.idle) на всіх вкладках з'являється вікно з кодом ---------- */
const pmGet = async () => (await chrome.storage.local.get('pm')).pm || {};
const pmReady = c => !!c.on && (c.t !== 'real' || (c.h && c.s));   // справжній код без заданого коду не блокує (щоб не замкнути себе)
const b64 = u => btoa(String.fromCharCode(...u)), unb64 = s => Uint8Array.from(atob(s), ch => ch.charCodeAt(0));
async function pmHash(code, salt) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 120000 }, k, 256));
}
const pmArm = async () => chrome.idle.setDetectionInterval(Math.max(15, (+(await pmGet()).m || 5) * 60));
async function pmLock() { if (pmReady(await pmGet())) { await chrome.storage.local.set({ pml: 1 }); return true; } return false; }
chrome.idle.onStateChanged.addListener(s => { if (s !== 'active') pmLock(); });
chrome.runtime.onStartup.addListener(async () => { await chrome.storage.local.remove('pml'); pmArm(); });   // при відкритті браузера блокування не вмикається
chrome.runtime.onInstalled.addListener(pmArm); pmArm();
chrome.runtime.onMessage.addListener((m, s, send) => {
  if (!m || !String(m.t).startsWith('pm-')) return;
  (async () => {
    const c = await pmGet();
    if (m.t === 'pm-cfg') { const n = { ...c, ...m.cfg }; await chrome.storage.local.set({ pm: n }); if (!n.on) await chrome.storage.local.remove('pml'); else pmArm(); return !!n.h; }
    if (m.t === 'pm-set') { const salt = crypto.getRandomValues(new Uint8Array(16)); await chrome.storage.local.set({ pm: { ...c, s: b64(salt), h: b64(await pmHash(String(m.c), salt)) } }); return true; }
    if (m.t === 'pm-lock') return pmLock();
    if (m.t === 'pm-try') {
      let ok = c.t !== 'real';   // «фейковий» код: достатньо Enter
      if (!ok && c.h) { const a = await pmHash(String(m.c), unb64(c.s)), h = unb64(c.h); ok = a.length === h.length && a.every((v, i) => v === h[i]); }
      if (ok) await chrome.storage.local.remove('pml'); return ok;
    }
  })().then(send, () => send(false));
  return true;
});

/* ---------- Оновлення: перевірка нової версії (manifest.json у репозиторії) ---------- */
const vNew = (a, c) => { const x = String(a).split('.').map(Number), y = String(c).split('.').map(Number); for (let i = 0; i < 4; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
async function updCheck() {
  if (UPD_BASE.includes('YOUR_')) return null;
  try {
    const r = await fetch(UPD_BASE + 'manifest.json?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) return null;
    const m = await r.json(), v = vNew(m.version, chrome.runtime.getManifest().version) ? m.version : '';
    await chrome.storage.local.set({ updv: v, updt: Date.now() });
    try { chrome.action.setBadgeText({ text: v ? '↑' : '' }); if (v) chrome.action.setBadgeBackgroundColor({ color: '#22c55e' }); } catch (e) { }   // значок на панелі браузера теж сповіщає про оновлення
    return v;
  } catch (e) { return null; }
}
const updSched = async () => { const a = await chrome.alarms.get('upd'); if (!a || a.periodInMinutes !== 15) chrome.alarms.create('upd', { delayInMinutes: 1, periodInMinutes: 15 }); updCheck(); };   // раз на 15 хв — маленький запит
chrome.alarms.onAlarm.addListener(a => { if (a.name === 'upd') updCheck(); });
chrome.runtime.onStartup.addListener(updSched); chrome.runtime.onInstalled.addListener(updSched);
chrome.runtime.onMessage.addListener((m, s, send) => { if (m && m.t === 'upd-check') { updCheck().then(send); return true; } });

/* після оновлення Chrome показує стандартну нову вкладку — повертаємо в неї наше розширення */
chrome.storage.local.get('updre').then(async r => {
  if (!r.updre) return; await chrome.storage.local.remove('updre');
  try { await chrome.tabs.update(r.updre, { url: chrome.runtime.getURL('newtab.html') }); } catch (e) { }
});
