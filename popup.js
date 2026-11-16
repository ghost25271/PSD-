'use strict';
const $ = s => document.querySelector(s);
const norm = u => { u = (u || '').trim(); if (!u) return null; if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u; return /^(https?|ftp|file):/i.test(u) ? u : null; };
let D = null, TAB = null;
async function snap(winId) {   // знімок видимої частини сторінки: PNG без втрат -> до 1600 px, WebP високої якості
  const du = await chrome.tabs.captureVisibleTab(winId, { format: 'png' });
  const im = new Image(); im.src = du; await im.decode();
  let src = im, w = im.naturalWidth, h = im.naturalHeight;
  const tw = Math.min(w, 1600), k = tw / w, th = Math.round(h * k);
  while (w / 2 >= tw) {   // зменшуємо вдвічі, доки не наблизимось: чіткіше за одноразове стиснення
    const c = document.createElement('canvas'); c.width = Math.round(w / 2); c.height = Math.round(h / 2);
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, c.width, c.height);
    src = c; w = c.width; h = c.height;
  }
  const c = document.createElement('canvas'); c.width = tw; c.height = th;
  const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, tw, th);
  return c.toDataURL('image/webp', 0.95);
}
const holder = v => { if (!D) return null; const [pid, fid] = v.split(':'); const p = D.p.find(x => x.id === pid); return p ? (fid ? p.t.find(x => x.id === fid) : p) : null; };
function check() {
  const url = norm($('#u').value), h = holder($('#d').value);
  $('#ok').disabled = !url;
  $('#note').textContent = !url ? t('pp_cant')
    : (h && h.t.some(x => x.url === url) ? t($('#shot').checked ? 'pp_exists_shot' : 'pp_exists') : '');
}
(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); TAB = tab || null;
  $('#t').value = (tab && tab.title) || ''; $('#u').value = (tab && /^(https?|ftp|file):/i.test(tab.url || '') ? tab.url : '') || '';
  D = (await chrome.storage.local.get('d')).d || null;
  const lg = D && D.s && D.s.lang;   // мова — та сама, що обрана в налаштуваннях розширення
  setLang(!lg || lg === 'auto' ? detectLang() : lg); document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); }); document.title = t('app');
  const s = $('#d');
  if (D && D.p) {
    D.p.forEach(p => {
      s.append(new Option(p.name, p.id));
      p.t.filter(x => x.folder).forEach(f => s.append(new Option('   ↳ ' + f.title, p.id + ':' + f.id)));
    });
    s.value = D.cur;
  } else s.append(new Option(t('pp_current'), ''));
  $('#u').oninput = check; s.onchange = check; $('#shot').onchange = check; check();
  $('#ok').onclick = async () => {
    const url = norm($('#u').value); if (!url) return;
    $('#ok').disabled = true; $('#ok').textContent = t('pp_saving');
    let shot = null; if ($('#shot').checked && TAB) { try { shot = await snap(TAB.windowId); } catch { } }
    const [pid, fid] = $('#d').value.split(':');
    const q = (await chrome.storage.local.get('q')).q || [];
    q.push({ title: $('#t').value, url, page: pid || null, folder: fid || null, shot });
    await chrome.storage.local.set({ q });
    $('#ok').textContent = t('pp_done'); setTimeout(() => window.close(), 700);
  };
})();
