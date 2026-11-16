// Блокуючий мікро-скрипт: миттєво малює збережений фон, поки основні дані ще читаються зі сховища.
try {
  const c = JSON.parse(localStorage.getItem('sdp')), r = document.documentElement.style;
  if (c) {
    r.setProperty('--dim', c.bt === 'image' ? c.dim : 0);
    const t = c.bt === 'image' && c.bi && localStorage.getItem('sdbk') === c.bi && localStorage.getItem('sdb');
    r.background = t ? `url(${t}) center/cover ${c.c1}` : c.bt === 'gradient' ? `linear-gradient(135deg,${c.c1},${c.c2})` : c.c1;
  }
} catch (e) { }
