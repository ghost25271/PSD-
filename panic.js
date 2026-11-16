// Паніка-клавіша («Функція Привид»): подвійне Esc на будь-якому сайті. Мінімум коду — лише один слухач клавіш.
// Скрипт можна вставляти повторно (фоновий скрипт робить це для вже відкритих вкладок після оновлення): старий слухач знімається.
(() => {
  if (window.__pncH) removeEventListener('keydown', window.__pncH, true);
  let on = true, last = 0;
  const alive = () => typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;   // після оновлення розширення «осиротілий» скрипт втрачає chrome.runtime
  try { chrome.storage.local.get('pnc').then(r => { on = r.pnc !== false; }).catch(() => { }); } catch { }
  try { chrome.storage.onChanged.addListener((c, a) => { if (a === 'local' && c.pnc) on = c.pnc.newValue !== false; }); } catch { }
  const h = window.__pncH = e => {
    if (!alive()) { removeEventListener('keydown', h, true); return; }   // контекст недійсний — слухач прибирає сам себе, помилок немає
    if (e.key !== 'Escape' || e.repeat) return;
    const t = performance.now();
    if (on && t - last < 450) { last = 0; try { chrome.runtime.sendMessage({ t: 'panic' }).catch(() => { }); } catch { } } else last = t;
  };
  addEventListener('keydown', h, true);
})();
