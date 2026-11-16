// «Режим захисту»: повноекранне вікно з кодом на будь-якій сторінці (і на «Швидкому наборі»), поки в storage стоїть прапорець pml.
// Код вводиться «віртуально» (без поля вводу), тому сторінка не може підглянути клавіші, а слухач працює лише поки вікно показане.
(() => {
  if (window.__pmlOff) window.__pmlOff();
  const alive = () => typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
  if (!alive()) return;
  let host = null, dots, obs, code = '', busy = false, cfg = {};
  const KEYS = ['keydown', 'keyup', 'keypress'];
  const key = e => {
    if (!host) return;
    e.stopImmediatePropagation(); e.preventDefault(); if (e.type !== 'keydown' || busy) return;
    if (e.key === 'Enter') submit();
    else if (e.key === 'Backspace') { code = code.slice(0, -1); draw(); }
    else if (e.key === 'Escape') { code = ''; draw(); }
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && code.length < 64) { code += e.key; draw(); }
  };
  const draw = () => { if (dots) dots.textContent = '•'.repeat(code.length); };
  async function submit() {
    busy = true; let ok = false;
    try { ok = await chrome.runtime.sendMessage({ t: 'pm-try', c: code }); } catch { }
    busy = false; code = ''; draw();
    if (!ok && host) { dots.parentNode.classList.remove('bad'); void dots.offsetWidth; dots.parentNode.classList.add('bad'); }
  }
  function show() {
    if (host && host.isConnected) return;
    const tx = cfg.tx || {}; host = document.createElement('div'); host.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483647';
    const r = host.attachShadow({ mode: 'closed' }), st = document.createElement('style');
    st.textContent = `.o{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,#031a08,#000 70%);font-family:'Courier New',ui-monospace,monospace;color:#00ff41;cursor:default;user-select:none}
    .c{text-align:center;padding:0 24px}svg{width:64px;height:64px;filter:drop-shadow(0 0 10px #00ff41)}
    h1{margin:14px 0 22px;font:800 clamp(22px,4vw,34px)/1.1 'Courier New',monospace;letter-spacing:.12em;text-transform:uppercase;text-shadow:0 0 10px #00ff41,0 0 28px rgba(0,255,65,.6)}
    .f{display:flex;align-items:center;justify-content:center;gap:2px;width:min(360px,86vw);height:50px;margin:0 auto;border:1px solid #00ff41;border-radius:6px;background:rgba(0,0,0,.55);box-shadow:0 0 18px rgba(0,255,65,.4);font-size:26px;letter-spacing:.25em;overflow:hidden}
    .f::after{content:'';width:10px;height:24px;margin-left:6px;background:#00ff41;animation:b 1s steps(2) infinite}
    @keyframes b{50%{opacity:0}}
    .f.bad{border-color:#ff3b3b;box-shadow:0 0 18px rgba(255,59,59,.7);animation:s .35s}
    @keyframes s{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
    p{margin:18px 0 0;font-size:17px;opacity:.75}`;
    const o = document.createElement('div'); o.className = 'o';
    o.innerHTML = '<div class="c"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg><h1></h1><div class="f"><span></span></div><p></p></div>';
    o.querySelector('h1').textContent = tx.t || 'Protected'; o.querySelector('p').textContent = tx.p || ''; dots = o.querySelector('.f span');
    r.append(st, o); (document.documentElement || document).append(host);
    for (const k of KEYS) addEventListener(k, key, true);
    obs = new MutationObserver(() => { if (host && !host.isConnected && document.documentElement) document.documentElement.append(host); }); obs.observe(document, { childList: true, subtree: false });
    code = '';
  }
  function hide() { if (!host) return; for (const k of KEYS) removeEventListener(k, key, true); if (obs) obs.disconnect(); host.remove(); host = obs = dots = null; code = ''; }
  const off = window.__pmlOff = () => { hide(); try { chrome.storage.onChanged.removeListener(onCh); } catch { } };
  async function sync() {
    try { const r = await chrome.storage.local.get(['pml', 'pm']); cfg = r.pm || {}; r.pml ? show() : hide(); } catch { }
  }
  const onCh = (c, a) => { if (!alive()) return off(); if (a === 'local' && (c.pml || c.pm)) sync(); };
  chrome.storage.onChanged.addListener(onCh); sync();
})();
