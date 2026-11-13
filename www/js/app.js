/* Pitch Trainer — app UI */
(function () {
  'use strict';
  const M = window.PTMusic, CURM = window.PTCurriculum, CUR = CURM.SKILL, A = window.PTAudio;
  const VERSION = '1.1.0';
  const REPO = 'https://github.com/bluu704/pitch-trainer';
  const $app = document.getElementById('app');
  const rnd = M.rnd, pick = M.pick;
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hl = (s) => esc(s).replace(/\{([^}]+)\}/g, '<span class="hl">$1</span>');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

  /* ================= icons ================= */
  const P = (d, fill) => `<svg viewBox="0 0 24 24" fill="${fill ? 'currentColor' : 'none'}" stroke="${fill ? 'none' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const I = {
    play: P('<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z"/>', 1),
    chart: P('<path d="M6 20V11M12 20V5M18 20v-6"/>'),
    trophy: P('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>'),
    trophyF: P('<path d="M7 3h10v1h3.5v2.5A4 4 0 0 1 16.7 10.5 5 5 0 0 1 13 13.9V17h3v3H8v-3h3v-3.1a5 5 0 0 1-3.7-3.4A4 4 0 0 1 3.5 6.5V4H7V3zm-1.5 3v.5a2 2 0 0 0 1.5 1.9V6H5.5zm11.5 0v2.4a2 2 0 0 0 1.5-1.9V6H17z"/>', 1),
    gear: P('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    lock: P('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    star: P('<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z"/>', 1),
    flag: P('<path d="M5 22V3.5h11.5l-1.8 4 1.8 4H6.8V22z"/>', 1),
    check: P('<path d="M20 6L9 17l-5-5"/>'),
    x: P('<path d="M18 6L6 18M6 6l12 12"/>'),
    chevL: P('<path d="M15 18l-6-6 6-6"/>'),
    chevR: P('<path d="M9 18l6-6-6-6"/>'),
    chevUD: P('<path d="M7 15l5 5 5-5M7 9l5-5 5 5"/>'),
    vol: P('<path d="M11 5L6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>'),
    book: P('<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>'),
    clock: P('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    flame: P('<path d="M12 1.8c.9 3.4 5.6 5.7 5.6 11.4a5.6 5.6 0 0 1-11.2 0c0-2.6 1.3-4.4 2.5-5.6.3 1.9 1.1 3 2.3 3.5-.5-3.8.3-6.8.8-9.3z"/>', 1),
    bookmark: P('<path d="M6 3h12v18l-6-4-6 4z"/>', 1),
    bookmarkO: P('<path d="M6 3h12v18l-6-4-6 4z"/>'),
    note: P('<path d="M13 18V4l6 2.5"/><circle cx="9.5" cy="18" r="3.5" fill="currentColor" stroke="none"/>'),
    notes: P('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" fill="currentColor"/><circle cx="18" cy="16" r="3" fill="currentColor"/>'),
    chord: P('<path d="M15 4v14"/><ellipse cx="11.5" cy="18" rx="3.5" ry="2.6" fill="currentColor" stroke="none"/><ellipse cx="11.5" cy="12.5" rx="3.5" ry="2.6" fill="currentColor" stroke="none"/><ellipse cx="11.5" cy="7" rx="3.5" ry="2.6" fill="currentColor" stroke="none"/>'),
    stairs: P('<path d="M3 21h4.5v-4.5H12V12h4.5V7.5H21"/><circle cx="5" cy="13" r="1.6" fill="currentColor" stroke="none"/><circle cx="10" cy="8.5" r="1.6" fill="currentColor" stroke="none"/><circle cx="15" cy="4" r="1.6" fill="currentColor" stroke="none"/>'),
    prog: P('<path d="M4 20V10M9.3 20V5M14.6 20v-8M20 20V7"/>'),
    swap: P('<path d="M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3"/>'),
    keyboard: P('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M7 15h10"/>'),
    bulb: P('<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z"/>'),
    rotate: P('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
    bell: P('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>'),
    help: P('<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>'),
    msg: P('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>'),
    life: P('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M4.9 4.9l4.3 4.3M14.8 14.8l4.3 4.3M14.8 9.2l4.3-4.3M4.9 19.1l4.3-4.3"/>'),
    logout: P('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'),
    trash: P('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>'),
    user: P('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    sun: P('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    up: P('<path d="M12 19V5M5 12l7-7 7 7"/>'),
    down: P('<path d="M12 5v14M19 12l-7 7-7-7"/>'),
    zap: P('<path d="M13 2L3 14h9l-1 8 10-12h-9z"/>', 1),
    target: P('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>'),
    grad: P('<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>'),
    edit: P('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>')
  };
  const SKILL_ICON = { pitch: I.note, intervals: I.notes, chords: I.chord, scales: I.stairs, progs: I.prog };

  I.inf = P('<path d="M12 12c-2-2.7-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.3 6-4zm0 0c2 2.7 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.3-6 4z"/>');
  I.shuffle = P('<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>');
  I.undo = P('<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>');

  /* ================= state ================= */
  const KEY = 'pitchtrainer.v1';
  function defaults() {
    const prog = {}; M.SKILL_ORDER.forEach((k) => { prog[k] = { done: {}, bm: [] }; });
    return {
      v: 2, profile: { since: dkey(new Date()) }, loggedOut: false,
      settings: { instrument: 'piano', names: 'flat', transpose: 0, keyboard: false, hints: true, resetEar: true, resetStyle: 'harmonic', notifications: true, theme: 'system' },
      prog, lastSkill: 'pitch', days: {}, items: {}, best: {}, introSeen: false, endless: {}, endlessScope: 'all', ideas: null, xp: 0
    };
  }
  let S = defaults();
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!raw) return;
      const d = defaults();
      S = Object.assign(d, raw);
      S.settings = Object.assign(d.settings, raw.settings || {});
      M.SKILL_ORDER.forEach((k) => {
        const p = Object.assign({ done: {}, bm: [] }, (raw.prog || {})[k] || {});
        if ((raw.v || 1) < 2) { // 1.0 stored lesson indexes; convert to stable ids
          const done = {};
          Object.keys(p.done).forEach((i) => { const id = CURM.legacyId(k, +i); if (id) done[id] = p.done[i]; });
          p.done = done;
          p.bm = p.bm.map((i) => CURM.legacyId(k, +i)).filter(Boolean);
        }
        S.prog[k] = p;
      });
      S.v = 2;
      delete S.league;
    } catch (e) { /* storage unavailable */ }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }

  /* ================= dates ================= */
  function dkey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  const today = () => dkey(new Date());
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function monday(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const wd = (x.getDay() + 6) % 7; return addDays(x, -wd); }
  function streak() {
    let d = new Date(), n = 0;
    if (!S.days[dkey(d)]) d = addDays(d, -1);
    while (S.days[dkey(d)]) { n++; d = addDays(d, -1); }
    return n;
  }
  function bestStreak() {
    const ks = Object.keys(S.days).sort(); let best = 0, cur = 0, prev = null;
    ks.forEach((k) => { const d = new Date(k + 'T12:00:00'); cur = prev && Math.round((d - prev) / 864e5) === 1 ? cur + 1 : 1; best = Math.max(best, cur); prev = d; });
    return best;
  }
  function addXP(xp, lessons) {
    const k = today(), first = !S.days[k];
    S.days[k] = S.days[k] || { xp: 0, n: 0 };
    S.days[k].xp += xp; S.days[k].n += lessons || 1;
    S.xp = (S.xp || 0) + xp;
    save();
    return first;
  }

  /* ================= progress helpers ================= */
  const lessonsOf = (sk) => CUR[sk].lessons;
  const doneMap = (sk) => S.prog[sk].done;
  const isDone = (l) => !!S.prog[l.skill].done[l.id];
  const doneCount = (sk) => lessonsOf(sk).filter(isDone).length;
  function curIdx(sk) { const L = lessonsOf(sk); for (let i = 0; i < L.length; i++) if (!isDone(L[i])) return i; return L.length; }
  function learned(sk) {
    const set = new Set();
    lessonsOf(sk).forEach((l) => { if (isDone(l)) l.pool.forEach((x) => set.add(x)); });
    return M.ALL_ITEMS[sk].filter((x) => set.has(x));
  }
  function practicePool(sk) {
    let p = learned(sk);
    if (p.length < 2) {
      const set = new Set(); CUR[sk].units[0].lessons.forEach((i) => lessonsOf(sk)[i].pool.forEach((x) => set.add(x)));
      p = M.ALL_ITEMS[sk].filter((x) => set.has(x));
    }
    return p;
  }
  function practiceOpts(sk) {
    const L = lessonsOf(sk); let o = Object.assign({}, L[0].o);
    L.forEach((l) => { if (isDone(l)) o = Object.assign({}, o, l.o); });
    if (sk === 'pitch') { const oc = new Set(); L.forEach((l) => { if (isDone(l)) (l.o.oct || [4]).forEach((x) => oc.add(x)); }); o.oct = oc.size ? Array.from(oc) : [4]; }
    if (sk === 'intervals' && !o.dir) o.dir = 'up';
    delete o.arp; delete o.seq; delete o.inst; delete o.only; delete o.func; delete o.reset;
    return o;
  }
  const ENDLESS_ALL = { pitch: { oct: [3, 4, 5] }, intervals: { dir: 'any', wide: 1 }, chords: { inv: 1, wide: 1 }, scales: { randomRoot: 1, desc: 1 }, progs: { randomKey: 1, voice: 1 } };
  function itemStat(sk, it) { return S.items[sk + ':' + it] || [0, 0]; }
  function recordItem(sk, it, ok) { const k = sk + ':' + it; const v = S.items[k] || [0, 0]; v[0]++; if (ok) v[1]++; S.items[k] = v; }
  function skillAcc(sk) { let a = 0, c = 0; Object.keys(S.items).forEach((k) => { if (k.startsWith(sk + ':')) { a += S.items[k][0]; c += S.items[k][1]; } }); return a ? c / a : null; }
  const totalDone = () => M.SKILL_ORDER.reduce((s, k) => s + doneCount(k), 0);
  const totalLessons = () => M.SKILL_ORDER.reduce((s, k) => s + lessonsOf(k).length, 0);
  const stepsDone = () => [S.introSeen, Object.keys(S.days).length > 0, bestStreak() >= 2];

  const lbl = (sk, it, practice) => M.label(sk, it, { names: S.settings.names, transpose: practice && sk === 'pitch' ? (12 - S.settings.transpose) % 12 : 0 });
  const slbl = (sk, it, practice) => (sk === 'pitch' ? lbl(sk, it, practice) : M.shortLabel(sk, it));
  const seqLbl = (sk, arr) => arr.map((x) => slbl(sk, x)).join(' – ');

  /* ================= theme & layout ================= */
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function applyTheme() {
    const t = S.settings.theme === 'system' ? (mq && mq.matches ? 'dark' : 'light') : S.settings.theme;
    document.documentElement.setAttribute('data-theme', t);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0F1720' : '#F7F9FB');
    try {
      const SB = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.StatusBar;
      if (SB) { SB.setStyle({ style: t === 'dark' ? 'DARK' : 'LIGHT' }); SB.setBackgroundColor && SB.setBackgroundColor({ color: t === 'dark' ? '#0F1720' : '#F7F9FB' }); }
    } catch (e) { /* ignore */ }
  }
  if (mq && mq.addEventListener) mq.addEventListener('change', applyTheme);
  let desktop = false;
  function applyLayout() {
    const d = !isNative && window.innerWidth >= 900;
    const changed = d !== desktop;
    desktop = d;
    document.documentElement.classList.toggle('desktop', d);
    return changed;
  }
  window.addEventListener('resize', () => { if (applyLayout() && !top()) render(); });

  /* ================= navigation ================= */
  const nav = { tab: 'play', stack: [], overlay: null, menu: null, pathPop: null };
  function push(name, params) { nav.stack.push({ name, params: params || {} }); nav.pathPop = null; render(); }
  function pop() { A.stopAll(); stopTimers(); nav.stack.pop(); render(); }
  const top = () => nav.stack[nav.stack.length - 1];
  function handleBack() {
    if (nav.menu) { closeMenu(); return true; }
    if (nav.overlay) { if (nav.overlay.locked) return true; closeOverlay(); return true; }
    const t = top();
    if (t && t.name === 'lesson' && LS && LS.mode === 'endless' && !LS.result) { endEndless(); return true; }
    if (t && (t.name === 'lesson' || t.name === 'practice') && !t.params.finished) { confirmQuit(); return true; }
    if (t) { pop(); return true; }
    if (nav.tab !== 'play') { nav.tab = 'play'; render(); return true; }
    return false;
  }
  try { history.pushState({ pt: 1 }, ''); } catch (e) { /* ignore */ }
  window.addEventListener('popstate', () => {
    if (handleBack()) { try { history.pushState({ pt: 1 }, ''); } catch (e) { /* ignore */ } }
    else history.back();
  });

  /* ================= overlays ================= */
  function openOverlay(html, opts) {
    opts = opts || {};
    nav.overlay = { html, center: !!opts.center, locked: !!opts.locked, cls: opts.cls || '', onClose: opts.onClose };
    renderOverlay();
  }
  function closeOverlay() { const o = nav.overlay; nav.overlay = null; renderOverlay(); if (o && o.onClose) o.onClose(); }
  function renderOverlay() {
    let el = document.getElementById('ov');
    if (!nav.overlay) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('div'); el.id = 'ov'; document.body.appendChild(el); }
    const o = nav.overlay;
    el.className = 'ov ' + (o.center ? 'center ' : '') + o.cls;
    el.innerHTML = o.center ? `<div class="modal">${o.html}</div>` : `<div class="sheet"><div class="grab"></div>${o.html}</div>`;
    el.onclick = (e) => { if (e.target === el && !o.locked) closeOverlay(); };
  }
  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2200);
  }
  function openMenu(anchor, options, current, onPick) {
    closeMenu();
    const r = anchor.getBoundingClientRect();
    const ovl = document.createElement('div'); ovl.className = 'menu-ov'; ovl.onclick = closeMenu;
    const m = document.createElement('div'); m.className = 'menu';
    m.innerHTML = options.map((o, i) => `<button data-i="${i}" class="${String(o[0]) === String(current) ? 'on' : ''}">${esc(o[1])}</button>`).join('');
    document.body.appendChild(ovl); document.body.appendChild(m);
    const h = m.offsetHeight, vh = window.innerHeight;
    let topPx = r.top + r.height / 2 - 20; if (topPx + h > vh - 10) topPx = Math.max(10, vh - h - 10);
    m.style.top = topPx + 'px';
    m.style.left = Math.max(10, r.right - m.offsetWidth - 40) + 'px';
    m.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; const o = options[+b.dataset.i]; closeMenu(); onPick(o[0]); };
    nav.menu = { ovl, m };
  }
  function closeMenu() { if (nav.menu) { nav.menu.ovl.remove(); nav.menu.m.remove(); nav.menu = null; } }

  /* ================= render root ================= */
  let timers = [];
  function stopTimers() { timers.forEach((t) => clearInterval(t)); timers = []; }
  function render() {
    applyTheme();
    if (S.loggedOut) { $app.innerHTML = welcomeHTML(); return; }
    const t = top();
    if (!t) { $app.innerHTML = tabsHTML(); return; }
    if (t.name === 'path') { $app.innerHTML = pathHTML(t.params.sk); afterPath(t.params.sk); return; }
    if (t.name === 'lesson') { renderLesson(); return; }
    if (t.name === 'practice') { renderPractice(); return; }
  }

  /* ================= tabs ================= */
  const TABS = [['play', 'Play', 'play'], ['progress', 'Progress', 'chart'], ['endless', 'Endless', 'inf'], ['settings', 'Settings', 'gear']];
  function tabsHTML() {
    let body = '';
    if (nav.tab === 'play') body = homeHTML();
    else if (nav.tab === 'progress') body = progressHTML();
    else if (nav.tab === 'endless') body = endlessHTML();
    else body = settingsHTML();
    return `<div class="screen tabs"><div class="scroll" id="tabscroll"><div class="wrap">${body}</div></div>
      <nav class="tabbar"><div class="brand"><span class="logo-s">${I.note}</span><b>Pitch Trainer</b></div>
      ${TABS.map(([k, l, ic]) => `<button class="tab ${nav.tab === k ? 'on' : ''}" data-act="tab" data-k="${k}">${I[ic]}<span>${l}</span></button>`).join('')}
      <div class="side-foot"><span class="pill">${I.flame}${streak()} day streak</span><small>${S.xp || 0} XP · ${totalDone()} / ${totalLessons()} lessons</small></div></nav></div>`;
  }

  /* ---------- home ---------- */
  function greeting() { const h = new Date().getHours(); return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; }
  function weekStrip() {
    const m = monday(new Date()), tk = today(), L = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return `<div class="week">${L.map((l, i) => { const d = addDays(m, i), k = dkey(d), hit = !!S.days[k];
      return `<div class="wd ${k === tk ? 'today' : ''} ${hit ? 'hit' : ''}"><div class="dot">${hit ? I.check : l}</div><span>${d.getDate()}</span></div>`; }).join('')}</div>`;
  }
  function nextLesson() {
    let sk = S.lastSkill || 'pitch';
    if (curIdx(sk) >= lessonsOf(sk).length) sk = M.SKILL_ORDER.find((k) => curIdx(k) < lessonsOf(k).length) || sk;
    const i = Math.min(curIdx(sk), lessonsOf(sk).length - 1);
    return { sk, l: lessonsOf(sk)[i] };
  }
  function reviewSkills() { return M.SKILL_ORDER.filter((k) => learned(k).length >= 2); }
  function homeHTML() {
    const first = Object.keys(S.days).length === 0;
    const doneToday = !!S.days[today()];
    const nx = nextLesson();
    const nNew = nx.l.n.length;
    let card;
    if (first) {
      card = `<div class="over">Today's session</div><h3>Your first session</h3><p>Learn your first sounds today. Every session after builds on how you do.</p>
        <span class="chip">+ ${nNew || 1} new</span>
        <div class="btns"><button class="btn-white" data-act="session">${I.play} Start your first session</button></div>`;
    } else if (!doneToday) {
      card = `<div class="over">Today's session</div><h3>${esc(nx.l.t)}</h3><p>${esc(M.SKILLS[nx.sk].full)} · Unit ${nx.l.unit + 1} · ${esc(nx.l.d)}</p>
        <span class="chip">${nNew ? '+ ' + nNew + ' new' : 'Review'}</span>
        <div class="btns"><button class="btn-white" data-act="session">${I.play} Start session</button></div>`;
    } else {
      card = `<div class="over">Today's session</div><h3>Daily goal complete</h3><p>Nice work! ${streak()} day streak. Come back tomorrow to keep it alive.</p>
        <span class="chip">${I.check} Done</span>
        <div class="btns"><button class="btn-white" data-act="session">${I.play} Keep going</button>${reviewSkills().length ? '<button class="btn-ghost-w" data-act="review">Mixed review</button>' : ''}</div>`;
    }
    const skills = M.SKILL_ORDER.map((k) => {
      const s = M.SKILLS[k], n = lessonsOf(k).length, d = doneCount(k);
      return `<button class="skill c-${s.color}" data-act="skill" data-sk="${k}"><div class="sk-ic">${SKILL_ICON[k]}</div><b>${s.name}</b><small>${s.sub}</small>
        <div class="bar"><i style="width:${(d / n) * 100}%"></i></div><div class="cnt">${d} of ${n} lessons</div></button>`;
    }).join('');
    const todayXP = (S.days[today()] || {}).xp || 0;
    const side = `<aside class="home-side">
      <div class="side-card"><div class="sc-h">${I.flame}<b>${streak()}</b><span>day streak</span></div>${weekStrip()}</div>
      <div class="side-card"><div class="sc-row"><span>Today</span><b>${todayXP} XP</b></div><div class="bar"><i style="width:${Math.min(100, todayXP / 30 * 100)}%;background:var(--orange)"></i></div><small>Daily goal: 30 XP</small></div>
      <button class="side-card endless-cta" data-act="endless" data-k="mix">${I.inf}<div><b>Endless Random Mix</b><small>Best combo ${(S.endless.mix || {}).best || 0}</small></div>${I.chevR}</button>
    </aside>`;
    return `<div class="home-grid"><div class="home-main"><div class="home-head"><div><div class="greet">${greeting()}</div><h1>Ready to train?</h1></div><span class="pill">${I.flame}${streak()}</span></div>
      <div class="mobile-week">${weekStrip()}</div>
      <section class="session"><span class="time">${I.clock} ~5 min</span>${card}</section>
      <h2>Train a skill</h2><div class="skills">${skills}</div></div>${side}</div>`;
  }
  function skillSheet(sk) {
    const s = M.SKILLS[sk], n = lessonsOf(sk).length;
    const best = S.best[sk];
    openOverlay(`<div class="c-${s.color}"><div class="sh-head"><div class="sk-ic">${SKILL_ICON[sk]}</div><div><h3>${s.full}</h3><p>How would you like to train?</p></div></div>
      <button class="opt" data-act="learn" data-sk="${sk}"><span class="oi">${I.book}</span><div><b>Learn</b><small>${doneCount(sk)} of ${n} lessons done</small></div>${I.chevR}</button>
      <button class="opt" data-act="endless" data-k="${sk}"><span class="oi">${I.inf}</span><div><b>Endless</b><small>Random questions that never stop${(S.endless[sk] || {}).best ? ' · Best combo ' + S.endless[sk].best : ''}</small></div>${I.chevR}</button>
      <button class="opt fill" data-act="practice" data-sk="${sk}"><span class="oi">${I.play}</span><div><b>Practice</b><small>Test your ear with a timed quiz${best ? ' · Best ' + best : ''}</small></div>${I.chevR}</button></div>`);
  }

  /* ---------- path ---------- */
  function pathHTML(sk) {
    const s = M.SKILLS[sk], L = lessonsOf(sk), units = CUR[sk].units, cur = curIdx(sk), d = doneCount(sk);
    let html = '', k = 0;
    units.forEach((u) => {
      const ud = u.lessons.filter((i) => isDone(L[i])).length;
      html += `<div class="unit" id="u${u.idx}"><div class="over">Unit ${u.idx + 1} · ${ud} of ${u.lessons.length} done</div><b>${esc(u.t)}</b><small>${esc(u.d)}</small></div>`;
      u.lessons.forEach((i) => {
        const l = L[i];
        const off = Math.round(Math.sin(k * 0.85) * 46); k++;
        const done = isDone(l), isCur = i === cur;
        const special = l.kind === 'check' || l.kind === 'final';
        let cls = 'node', ic = I.lock;
        if (done) { cls += ' col'; ic = I.check; }
        else if (isCur) { cls += ' col cur'; ic = l.kind === 'final' ? I.trophyF : l.kind === 'check' ? I.flag : I.star; }
        else if (special) { cls += ' col'; ic = l.kind === 'final' ? I.trophyF : I.flag; }
        const bm = S.prog[sk].bm.includes(l.id);
        const st = doneMap(sk)[l.id];
        const stars = done ? `<div class="stars">${[1, 2, 3].map((x) => `<span class="${x <= (st.s || 1) ? '' : 'off'}">${I.star}</span>`).join('')}</div>` : '';
        html += `<div class="nodewrap" id="n${i}"><div class="nodein" style="transform:translateX(${off}px)">
          ${isCur ? '<div class="bubble">' + (d === 0 ? 'START' : 'NEXT') + '</div>' : ''}
          <button class="${cls}" data-act="node" data-i="${i}">${ic}${bm ? '<span class="bm-flag">' + I.bookmark + '</span>' : ''}</button>${stars}</div></div>`;
        if (nav.pathPop === i) html += popHTML(sk, l, done, isCur);
      });
    });
    const unav = units.map((u) => { const ud = u.lessons.filter((i) => isDone(L[i])).length;
      return `<button class="un-item" data-act="gounit" data-u="${u.idx}"><span class="un-n">${u.idx + 1}</span><div><b>${esc(u.t)}</b><div class="bar"><i style="width:${ud / u.lessons.length * 100}%"></i></div></div><small>${ud}/${u.lessons.length}</small></button>`; }).join('');
    return `<div class="screen c-${s.color}">
      <div class="topbar"><button class="iconbtn" data-act="back">${I.chevL}</button><div class="pbar"><i style="width:${(d / L.length) * 100}%"></i></div></div>
      <div class="path-title"><h1>${s.full}</h1><span class="pcount">${d} of ${L.length}</span></div>
      <div class="path-body"><aside class="unitnav"><div class="sec-t" style="margin-top:0">Units</div>${unav}</aside><div class="path" id="pathscroll">${html}</div></div></div>`;
  }
  function popHTML(sk, l, done, isCur) {
    const title = (l.idx + 1) + '. ' + l.t;
    const bm = S.prog[sk].bm.includes(l.id);
    if (done || isCur) {
      return `<div class="pop"><b>${esc(title)}</b><p>${esc(l.d)}${done ? ' · Best ' + (doneMap(sk)[l.id].acc || 0) + '%' : ''} · ${l.q} questions</p>
        <button class="btn" data-act="start" data-i="${l.idx}">${I.play} ${done ? 'Practice again' : 'Start lesson'}</button>
        <button class="btn sec mt" data-act="bm" data-i="${l.idx}">${bm ? 'Remove bookmark' : 'Bookmark for review'}</button></div>`;
    }
    const fin = l.kind === 'final';
    const msg = fin ? `${l.d.replace(/ Pass it to skip everything before it\.?/, '')} Pass it to skip everything before it. If you don't, nothing changes.`
      : 'Already know this? Pass the test to skip straight ahead. If you don\'t, nothing changes.';
    return `<div class="pop ${fin ? '' : 'locked'}"><b>${esc(title)}</b><p>${esc(msg)}</p>
      <button class="btn" data-act="testout" data-i="${l.idx}">${I.play} ${fin ? 'Take the exam' : 'Test out'}</button></div>`;
  }
  function afterPath(sk) {
    const el = document.getElementById('pathscroll');
    const target = nav.pathPop != null ? nav.pathPop : curIdx(sk);
    const n = document.getElementById('n' + Math.min(target, lessonsOf(sk).length - 1));
    if (el && n) {
      if (nav.pathScroll != null) el.scrollTop = nav.pathScroll;
      else el.scrollTop = Math.max(0, n.offsetTop - el.clientHeight / 2 + 40);
      el.onscroll = () => { nav.pathScroll = el.scrollTop; };
    }
  }

  /* ================= quiz generation ================= */
  const SCALE_ORDER = Object.keys(M.SCALES);
  function closeness(sk, a, b) {
    switch (sk) {
      case 'pitch': { const d = Math.abs(a - b) % 12; return Math.min(d, 12 - d); }
      case 'intervals': return Math.abs(a - b);
      case 'chords': {
        const x = M.CHORDS[a].iv, y = M.CHORDS[b].iv;
        let diff = Math.abs(x.length - y.length) * 1.5;
        for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) diff++;
        return diff;
      }
      case 'scales': return Math.abs(SCALE_ORDER.indexOf(a) - SCALE_ORDER.indexOf(b));
      case 'progs': {
        if (!M.PROGS[a] || !M.PROGS[b]) { const ra = M.ROMAN[a], rb = M.ROMAN[b]; return ra && rb ? Math.min(Math.abs(ra[0] - rb[0]), 12 - Math.abs(ra[0] - rb[0])) / 2 + (ra[1] === rb[1] ? 0 : 0.5) : 3; }
        const x = M.PROGS[a].chords, y = M.PROGS[b].chords;
        let diff = Math.abs(x.length - y.length);
        for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i].toLowerCase() !== y[i].toLowerCase()) diff++;
        return diff;
      }
    }
    return 1;
  }
  function distractors(sk, target, pool, n, hard) {
    let c = pool.filter((x) => x !== target);
    const fam = sk === 'progs' && !M.PROGS[target] ? M.FUNC_ITEMS : M.ALL_ITEMS[sk];
    if (c.length < n) c = c.concat(shuffle(fam.filter((x) => x !== target && !c.includes(x))).slice(0, n - c.length));
    if (hard) c = c.map((x) => [x, closeness(sk, target, x) + Math.random() * 0.9]).sort((p, q) => p[1] - q[1]).map((p) => p[0]);
    else c = shuffle(c);
    return c.slice(0, n);
  }
  function weightOf(sk, it, isNew) {
    const [a, c] = itemStat(sk, it);
    const err = a ? 1 - c / a : 0.4;
    return 1 + err * 3 + (isNew ? 1.5 : 0);
  }
  function weightedPick(sk, pool, avoid, newItems) {
    let cand = pool.filter((x) => !avoid.includes(x));
    if (!cand.length) cand = pool.filter((x) => x !== avoid[avoid.length - 1]);
    if (!cand.length) cand = pool;
    const w = cand.map((x) => weightOf(sk, x, newItems.includes(x)));
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < cand.length; i++) { r -= w[i]; if (r <= 0) return cand[i]; }
    return cand[cand.length - 1];
  }
  function sigOf(it, o) { return [JSON.stringify(it), o.oct && o.oct[0], o.root, o.dir, o.key, o.down].join('|'); }
  function setYN(q, asked, pool, yes, hard) {
    q.asked = asked;
    q.target = yes ? asked : distractors(q.sk, asked, pool, 1, hard)[0];
    q.sound = M.instance(q.sk, q.target, q.o);
    return q;
  }
  function makeQuestion(sk, pool, o, ctx) {
    const hard = ctx.hard;
    const small = pool.length === 1;
    const allowFind = (sk === 'pitch' || sk === 'intervals' || sk === 'chords') && !o.func;
    const allowOdd = sk !== 'progs' && !o.func;
    let kind;
    const r = Math.random();
    if (ctx.only) kind = ctx.only;
    else if (o.only && !(o.only === 'odd' && !allowOdd)) kind = o.only;
    else if (o.seq && pool.length >= 2) kind = 'seq';
    else if (small) kind = r < 0.6 ? 'find' : r < 0.85 ? 'yesno' : allowOdd ? 'odd' : 'find';
    else if (r < 0.12 && ctx.yn < ctx.maxYN) kind = 'yesno';
    else if (allowFind && r < 0.28) kind = 'find';
    else if (allowOdd && r < 0.38) kind = 'odd';
    else if (ctx.allowSeq && (sk === 'pitch' || sk === 'intervals' || sk === 'chords') && pool.length >= 3 && r < 0.5) kind = 'seq';
    else kind = 'identify';
    if (kind === 'find' && !allowFind) kind = small ? (allowOdd && r < 0.5 ? 'odd' : 'yesno') : 'identify';
    if (kind === 'identify' && small) kind = allowFind ? 'find' : 'yesno';
    if (kind === 'yesno') ctx.yn++;
    let target, oc, tries = 0;
    do {
      if (kind === 'seq') {
        const n = o.seq || 2; target = [];
        for (let i = 0; i < n; i++) target.push(weightedPick(sk, pool, target.slice(-1), ctx.newItems || []));
      } else target = weightedPick(sk, pool, ctx.recent, ctx.newItems || []);
      oc = M.concrete(sk, o);
      tries++;
    } while (ctx.seen.has(kind + sigOf(target, oc)) && tries < 8);
    ctx.seen.add(kind + sigOf(target, oc));
    if (kind !== 'seq') { ctx.recent.push(target); if (ctx.recent.length > (pool.length >= 4 ? 2 : 1)) ctx.recent.shift(); }
    const inst = A.resolveInstrument(o.inst || S.settings.instrument);
    const q = { sk, kind, target, o: oc, inst, reset: sk === 'pitch' && (S.settings.resetEar || o.reset) };
    if (o.func) q.ask = 'Home first, then which chord?';
    q.sound = kind === 'seq' ? M.seqInstance(sk, target, oc) : M.instance(sk, target, oc);
    if (kind === 'odd') {
      // two of one item, one of another; each in its own register so only the quality gives it away
      const other = distractors(sk, target, pool, 1, hard)[0];
      q.oddIdx = rnd(0, 2);
      q.options = [0, 1, 2].map((i) => {
        const it = i === q.oddIdx ? other : target;
        const oo = sk === 'pitch' ? Object.assign({}, o, { oct: o.oct && o.oct.length > 1 ? o.oct : [3, 4, 5] }) : o;
        return { it, sound: M.instance(sk, it, M.concrete(sk, oo)) };
      });
      // make sure the two pitch twins sit in different octaves
      if (sk === 'pitch') { const tw = q.options.filter((x, i) => i !== q.oddIdx); if (tw[0].sound.steps[0].notes[0] === tw[1].sound.steps[0].notes[0]) tw[1].sound = { steps: [{ t: 0, notes: [tw[0].sound.steps[0].notes[0] + (tw[0].sound.steps[0].notes[0] >= 72 ? -12 : 12)], d: 1.5 }] }; }
      q.odd = other;
    }
    const fam = sk === 'progs' && o.func ? M.FUNC_ITEMS : M.ALL_ITEMS[sk];
    if (kind === 'identify' || kind === 'seq') q.choices = fam.filter((x) => pool.includes(x));
    if (kind === 'yesno') setYN(q, target, pool, Math.random() < 0.5, hard);
    if (kind === 'find') {
      const opts = shuffle([target].concat(distractors(sk, target, pool, 3, hard)));
      q.options = opts.map((it) => ({ it, sound: M.instance(sk, it, oc) }));
    }
    return q;
  }
  function newCtx(count, extra) {
    extra = extra || {};
    return { recent: [], seen: new Set(), yn: 0, maxYN: Math.max(1, Math.floor((count || 20) * 0.15)), newItems: extra.newItems || [] };
  }
  function makeQuiz(sk, pool, o, count, extra) {
    extra = extra || {};
    const ctx = newCtx(count, extra);
    const out = [];
    for (let i = 0; i < count; i++) {
      ctx.hard = extra.hard || i >= count * 0.4;
      ctx.only = extra.only;
      out.push(makeQuestion(sk, pool, o, ctx));
    }
    return out;
  }

  /* ================= lesson engine ================= */
  let LS = null;
  function startLesson(sk, idx, mode) {
    A.init();
    const l = lessonsOf(sk)[idx];
    S.lastSkill = sk; save();
    const steps = [];
    if (mode === 'lesson' && l.n.length) {
      learnSlides(sk, l).forEach((s) => steps.push({ type: 'slide', s }));
      const qc = makeQuiz(sk, l.pool, l.o, 3, { only: 'yesno', newItems: l.n });
      const ans = shuffle([true, false, Math.random() < 0.5]);
      qc.forEach((q, i) => setYN(q, l.n[i % l.n.length], l.pool, ans[i], i > 0));
      qc.forEach((q) => steps.push({ type: 'q', q, phase: 'quick' }));
    } else if (mode === 'lesson' && l.slides) {
      typeSlides(l.slides, sk).forEach((s) => steps.push({ type: 'slide', s }));
    }
    const count = mode === 'testout' ? (l.kind === 'final' ? l.q : 15) : l.q;
    makeQuiz(sk, l.pool, l.o, count, { newItems: l.n, hard: mode === 'testout' || l.kind !== 'learn' }).forEach((q) => steps.push({ type: 'q', q, phase: 'quiz' }));
    LS = { mode, sk, idx, l, steps, i: 0, correct: 0, total: 0, requeue: 0, start: Date.now(), color: M.SKILLS[sk].color };
    push('lesson', {});
  }
  function startReview() {
    A.init();
    const sks = reviewSkills(); if (!sks.length) return;
    const steps = [];
    for (let i = 0; i < 20; i++) {
      const sk = sks[i % sks.length];
      const q = makeQuiz(sk, learned(sk), practiceOpts(sk), 1, { only: 'identify', hard: i > 6 })[0];
      steps.push({ type: 'q', q, phase: 'quiz' });
    }
    LS = { mode: 'review', sk: null, steps: shuffle(steps), i: 0, correct: 0, total: 0, requeue: 0, start: Date.now(), color: 'orange' };
    push('lesson', {});
  }
  function startHowItWorks() {
    const steps = howSlides().map((s) => ({ type: 'slide', s }));
    LS = { mode: 'intro', sk: 'pitch', steps, i: 0, correct: 0, total: 0, start: Date.now(), color: 'orange' };
    push('lesson', {});
  }

  /* ---------- endless ---------- */
  function startEndless(key) {
    A.init();
    const skills = key === 'mix' ? M.SKILL_ORDER.slice() : [key];
    const scope = S.endlessScope;
    const pools = {}, opts = {}, ctxs = {};
    skills.forEach((sk) => {
      pools[sk] = scope === 'learned' ? practicePool(sk) : M.ALL_ITEMS[sk].slice();
      opts[sk] = scope === 'learned' ? practiceOpts(sk) : Object.assign({}, ENDLESS_ALL[sk]);
      ctxs[sk] = newCtx(40); ctxs[sk].allowSeq = true; ctxs[sk].hard = true;
    });
    LS = { mode: 'endless', key, skills, pools, opts, ctxs, steps: [], i: 0, correct: 0, total: 0, combo: 0, bestCombo: 0, start: Date.now(), color: key === 'mix' ? 'orange' : M.SKILLS[key].color, lastSk: null };
    LS.steps.push(endlessQ());
    if (key !== 'mix') S.lastSkill = key;
    push('lesson', {});
  }
  function endlessQ() {
    const L = LS;
    let sk = pick(L.skills);
    if (L.skills.length > 1 && sk === L.lastSk) sk = pick(L.skills.filter((x) => x !== L.lastSk));
    L.lastSk = sk;
    return { type: 'q', q: makeQuestion(sk, L.pools[sk], L.opts[sk], L.ctxs[sk]), phase: 'quiz' };
  }
  function endEndless() {
    const L = LS; A.stopAll();
    if (!L.total) { LS = null; pop(); return; }
    const rec = S.endless[L.key] || { best: 0, runs: 0, answered: 0, correct: 0 };
    const isBest = L.bestCombo > rec.best;
    rec.best = Math.max(rec.best, L.bestCombo); rec.runs++; rec.answered += L.total; rec.correct += L.correct;
    S.endless[L.key] = rec;
    const xp = Math.max(1, Math.round(L.correct / 2));
    const first = addXP(xp);
    top().params.finished = true;
    L.result = { acc: Math.round(L.correct / L.total * 100), secs: Math.round((Date.now() - L.start) / 1000), xp, passed: true, first, isBest };
    A.sfx('done');
    renderLesson();
  }

  /* ---------- slides ---------- */
  const li = (arr) => `<div class="card">${arr.map((t) => `<div class="li">${hl(t)}</div>`).join('')}</div>`;
  function hearBtn(sk, it, o) { return `data-act="hear" data-sk="${sk}" data-it="${esc(JSON.stringify(it))}" data-o="${esc(JSON.stringify(o || {}))}"`; }
  const INTRO = {
    pitch: ['What is pitch training?', 'It is the first step: hear a single note and name it. Nail this and you can find any melody on your instrument.', ['Hear a note, then {name it}.', 'Start from one {home} note.', 'Grow to all 12, high and low.']],
    intervals: ['What are intervals?', 'An interval is the distance between two notes. Hear it and you can work out any melody from its first note.', ['Two notes, one {distance}.', 'Start with the strongest: the {perfect 5th}.', 'Grow to all 12, up, down, and together.']],
    chords: ['What is chord quality?', 'Every chord has a mood. Learn to hear whether it is bright, dark, tense, or dreamy.', ['Three or four notes, one {color}.', 'Start with the {major} triad.', 'Grow to every triad and 7th chord.']],
    scales: ['What is scale detection?', 'A scale is a ladder of notes. Each one has its own flavor, from bright Lydian to dark Phrygian.', ['Eight notes, one {flavor}.', 'Start with the {major} scale.', 'Grow to all 11 scales, any key.']],
    progs: ['What are progressions?', 'Songs move through chords in patterns. Recognize the pattern and you can play along by ear.', ['Four chords, one {pattern}.', 'Start with the classic {I-IV-V-I}.', 'Grow to all nine, any key.']]
  };
  function typeSlides(kind, sk) {
    const T = {
      seq: sk === 'pitch' ? ['Name the melody', 'Now you will hear a short tune of two or three notes. Tap the notes in the order you hear them.', ['Listen to the {whole tune} first.', 'Tap each note {in order}. Use undo if you slip.', 'Tap the wave to hear the tune again.']]
        : sk === 'intervals' ? ['Interval chains', 'You will hear three notes in a row. That makes two intervals. Name both, in order.', ['First interval: note 1 to note 2.', 'Second interval: note 2 to note 3.', 'Tap them {in order}. Use undo if you slip.']]
          : ['Chord chains', 'You will hear two chords in a row, each on its own root. Name both qualities, in order.', ['Listen for the {color} of each chord.', 'The roots change, so ignore how high they are.', 'Tap them {in order}. Use undo if you slip.']],
      odd: ['Odd one out', 'You will get three sounds. Two of them are the same kind, played in different places. One is different.', ['Tap {1}, {2}, and {3} to listen.', 'Ignore how high or low they are.', 'Pick the {one that doesn\'t belong}, then submit.']],
      func: ['Chord functions', 'Every key has a home chord, I. Each other chord pulls away from home in its own way.', ['First you hear {home} (I).', 'Then one more chord: {ii, iii, IV, V, or vi}.', 'Name it by how it feels next to home.']]
    }[kind];
    const s = [{ title: T[0], lead: T[1], html: li(T[2]), tag: 'Learn · 1 of 1' }];
    if (kind === 'func') {
      s.push({ title: 'Hear the functions', lead: 'Tap each to hear home, then that chord.', tag: 'Learn · 2 of 2',
        html: `<div class="list">${['IV', 'V', 'vi', 'ii', 'iii'].map((r) => `<button class="lrow" ${hearBtn('progs', r, {})}><div class="nm"><b>${r}</b><small>${({ IV: 'warm, lifting', V: 'tense, wants home', vi: 'soft, sad', ii: 'gentle, moving', iii: 'dreamy, in-between' })[r]}</small></div><div class="vis"></div><span class="tri"></span></button>`).join('')}</div>` });
      s[0].tag = 'Learn · 1 of 2';
    }
    return s;
  }
  function learnSlides(sk, l) {
    const out = [];
    const o = Object.assign({}, l.o);
    if (l.intro) { const it = INTRO[sk]; out.push({ title: it[0], lead: it[1], html: li(it[2]) }); }
    l.n.forEach((x) => {
      const d = M.DESC[sk][x];
      const name = lbl(sk, x);
      const isHome = sk === 'pitch' && x === 0;
      out.push({ title: `Meet ${name}${isHome ? ', your home' : ''}`, lead: sk === 'pitch' ? '' : M.subLabel(sk, x) || '',
        html: `<button class="tile ${sk === 'pitch' ? '' : 'lg'}" ${hearBtn(sk, x, o)}>${esc(slbl(sk, x))}</button>${li(d[1])}`, autoplay: { sk, it: x, o } });
      out.push({ title: sk === 'pitch' ? `Hear ${name}` : `The sound of ${name}`, lead: '',
        html: `<div class="card hear"><div class="big">${esc(sk === 'progs' ? x : slbl(sk, x))}</div><div class="row"><div>${hl(d[0])}<small>Tap to hear</small></div><button class="playc" ${hearBtn(sk, x, o)}>${I.play}</button></div></div>`
          + (sk === 'pitch' && x !== 0 ? `<div class="card hear mt"><div class="row"><div>Now hear it next to home, C.<small>Tap to compare</small></div><button class="playc" data-act="hearpair" data-b="${x}">${I.play}</button></div></div>` : '') });
    });
    if (sk === 'pitch') {
      out.push({ title: l.intro ? 'Meet the pitch ladder' : 'Your pitch ladder', lead: 'Higher sounds sit higher here, and every note you learn gets a rung based on how far it is from home, C.',
        html: ladderHTML(l.pool, l.n) + `<p class="note-small">${l.intro ? 'This is home. New notes will stack above and below it as you learn them.' : 'Tap any rung to hear it again.'}</p>` });
    } else {
      out.push({ title: `Every ${({ intervals: 'interval', chords: 'chord', scales: 'scale', progs: 'progression' })[sk]} you can hear`,
        lead: sk === 'scales' ? 'Every scale you have learned, brightest at the top. Tap any to hear it again.' : sk === 'intervals' ? 'Every interval you have learned, smallest to largest. Tap any to hear it again.' : `Every ${sk === 'chords' ? 'chord' : 'progression'} you have learned. Tap any to hear it again.`,
        html: hearList(sk, l.pool, l.n, o) });
    }
    if (l.intro) {
      out.push({ title: 'Your first questions', lead: sk === 'pitch' ? 'You\'ll hear one note at a time and answer {Yes} or {No}: is it the note we name? A couple of things first:' : 'You\'ll hear a sound and answer. A couple of things first:',
        html: li(sk === 'pitch' ? ['Tap {Yes} if the note matches, {No} if it doesn\'t.', 'Between questions, a few quick chords {reset your ear}.', 'That stops the last note from throwing off your next answer.']
          : ['Tap {Yes} or {No}, pick from a list, or find the right sound.', 'Tap the {wave} any time to hear the sound again.', 'Missed one? It comes back at the end so you can try again.']) });
    }
    const N = out.length;
    out.forEach((s, i) => { s.tag = `Learn · ${i + 1} of ${N}`; });
    return out;
  }
  function ladderHTML(pool, newItems) {
    const items = pool.slice().sort((a, b) => a - b);
    const H = 230, pad = 18;
    const y = (pc) => pad + (pc / 12) * (H - 2 * pad - 10);
    return `<div class="ladder"><div class="rail"></div>${items.map((pc) => `<button class="rung ${pc === 0 ? 'home' : ''} ${newItems.includes(pc) ? 'new' : ''}" style="bottom:${y(pc)}px" ${hearBtn('pitch', pc, { oct: [4] })}>${esc(lbl('pitch', pc))}</button>`).join('')}
      <span class="lab" style="bottom:${y(0)}px">Home</span></div>`;
  }
  function hearList(sk, pool, newItems, o) {
    let items = M.ALL_ITEMS[sk].filter((x) => pool.includes(x));
    if (sk === 'intervals') items = items.slice().sort((a, b) => b - a);
    const rows = items.map((x) => {
      let nm = '', vis = '';
      if (sk === 'intervals') {
        nm = `<b>${M.INTERVALS[x][0]}</b><small>${M.INTERVALS[x][1]}</small>`;
        vis = `<div class="ibar"><i style="width:${(x / 12) * 100}%"></i><em>${x}</em></div>`;
      } else if (sk === 'chords') {
        nm = `<b>${M.CHORDS[x].name}</b><small>${M.CHORDS[x].kind}</small>`;
        vis = `<div class="dline"></div>${M.CHORDS[x].iv.map((v) => `<span class="dd" style="left:${4 + (v / 12) * 92}%"></span>`).join('')}`;
      } else if (sk === 'scales') {
        const sc = M.SCALES[x];
        nm = `<b>${sc.name}</b>`;
        vis = `<div class="dline"></div>${sc.iv.map((v) => `<span class="dd ${v === sc.ch ? 'ch' : ''}" style="left:${4 + (v / 12) * 92}%"></span>`).join('')}<span class="dlab" style="left:2%">Root</span><span class="dlab" style="right:0">Octave</span>`;
      } else if (sk === 'progs') {
        const p = M.PROGS[x];
        nm = `<b>${x}</b>`;
        vis = `<div class="chips" style="height:26px;align-items:center">${p.chords.map((c, i) => `<span class="rn ${c === c.toLowerCase() ? 'mi' : ''} ${i === p.mark ? 'mk' : ''}">${c}</span>`).join('')}</div>`;
      }
      return `<button class="lrow ${newItems.includes(x) ? 'new' : ''}" ${hearBtn(sk, x, o)}><div class="nm">${nm}</div><div class="vis">${vis}</div><span class="tri"></span></button>`;
    });
    return `<div class="list">${rows.join('')}</div>`;
  }
  function howSlides() {
    const s = [
      { title: 'Why train your ear?', lead: 'Ear training teaches you to understand music just by listening, with no sheet music needed.', html: li(['You build up: single notes, then intervals, chords, scales, and full progressions.', 'Each skill stacks on the last, from one note to a full song.', 'The payoff: play tunes by ear, jam with others, and know what you are hearing.']) },
      { title: 'What is pitch training?', lead: 'It is the first step: hear a single note and name it. Nail this and you can find any melody on your instrument.', html: li(['Hear a note, then {name it}.', 'Start from one {home} note.', 'Grow to all 12, high and low.']) },
      { title: 'We start from home', lead: '', html: li(['Naming a note cold is hard.', 'So you lock in one note: {C}, your home.', 'Then learn every note by how it leans from home.']) },
      { title: 'Meet your home note', lead: 'This is C. Tap it and let it settle. Everything is measured against it.', html: `<button class="tile tint" ${hearBtn('pitch', 0, { oct: [4] })}>${esc(lbl('pitch', 0))}</button>` },
      { title: 'How a lesson flows', lead: '', html: li(['Learn the note and how it feels.', 'See where it sits on the ladder.', 'A quick check, then real practice.']) },
      { title: 'Ready when you are', lead: 'Let\'s tune up your ears, one note at a time.', html: '', final: true, btn: 'Done' }
    ];
    s.forEach((x, i) => { x.tag = `Learn · ${i + 1} of 6`; });
    return s;
  }

  /* ---------- lesson rendering ---------- */
  function renderLesson() {
    const L = LS; if (!L) { pop(); return; }
    if (L.result) { $app.innerHTML = resultHTML(); return; }
    const st = L.steps[L.i];
    const color = st.type === 'q' ? M.SKILLS[st.q.sk].color : L.color;
    const endless = L.mode === 'endless';
    const quizSteps = endless ? [] : L.steps.filter((x) => x.type === 'q' && x.phase === 'quiz');
    const qn = !endless && st.type === 'q' && st.phase === 'quiz' ? quizSteps.indexOf(st) + 1 : 0;
    const pct = endless ? 0 : (L.i / L.steps.length) * 100;
    let body = '', foot = '';
    if (st.type === 'slide') {
      const s = st.s;
      if (s.final) body = `<div style="margin-top:auto"><div class="ltag">Lesson done</div><h2>${esc(s.title)}</h2><p class="lead">${hl(s.lead)}</p></div>`;
      else body = `<div class="ltag">${esc(s.tag)}</div><h2>${esc(s.title)}</h2>${s.lead ? `<p class="lead">${hl(s.lead)}</p>` : ''}${s.html}`;
      foot = `<button class="btn" data-act="next">${s.btn || 'Next'}</button>`;
    } else {
      const q = st.q;
      let tag = st.phase === 'quick' ? `Quick check · ${L.steps.filter((x) => x.phase === 'quick').indexOf(st) + 1} of 3` : (st.retry ? 'Try again' : '');
      if (endless) tag = M.SKILLS[q.sk].full;
      const name = (it) => esc(lbl(q.sk, it));
      if (q.kind === 'yesno') {
        body = `<div class="qtop">${tag ? `<div class="qtag">${tag}</div>` : ''}<div class="qtitle">Is this ${q.sk === 'pitch' ? '' : 'a '}<span class="cc">${name(q.asked)}</span>?</div></div>
          <canvas class="wave" data-act="replay"></canvas><div class="qask">Yes or no?</div>`;
        foot = `<div class="yn"><button class="y" data-act="yn" data-v="1">${I.check} Yes<kbd>Y</kbd></button><button class="n" data-act="yn" data-v="0">${I.x} No<kbd>N</kbd></button></div>`;
      } else if (q.kind === 'find') {
        body = `<div class="qtop">${tag ? `<div class="qtag">${tag}</div>` : ''}</div><div style="margin:auto 0;text-align:center"><div class="qtitle">Find the <span class="cc">${name(q.target)}</span></div></div>
          <div class="qask">Tap each to listen, then pick one</div>
          <div class="grid" style="grid-template-columns:repeat(3,1fr)">${q.options.map((op, i) => `<button class="ch-b ${L.sel === i ? 'sel' : ''}" data-act="opt" data-i="${i}" data-k="${i + 1}" ${i === 3 ? 'style="grid-column:2"' : ''}>${I.vol}${i + 1}</button>`).join('')}</div>`;
        foot = `<button class="btn" data-act="submit" ${L.sel == null ? 'disabled' : ''}>Submit</button>`;
      } else if (q.kind === 'odd') {
        body = `<div class="qtop">${tag ? `<div class="qtag">${tag}</div>` : ''}</div><div style="margin:auto 0;text-align:center"><div class="qtitle">Which one is <span class="cc">different</span>?</div></div>
          <div class="qask">Tap each to listen, then pick the odd one out</div>
          <div class="grid g3">${q.options.map((op, i) => `<button class="ch-b ${L.sel === i ? 'sel' : ''}" data-act="opt" data-i="${i}" data-k="${i + 1}">${I.vol}${i + 1}</button>`).join('')}</div>`;
        foot = `<button class="btn" data-act="submit" ${L.sel == null ? 'disabled' : ''}>Submit</button>`;
      } else if (q.kind === 'seq') {
        L.seqPicks = L.seqPicks || [];
        body = `<div class="qtop">${tag ? `<div class="qtag">${tag}</div>` : ''}<div class="qtitle">Name the ${q.target.length} ${({ pitch: 'notes', intervals: 'intervals', chords: 'chords' })[q.sk] || 'sounds'} in order</div></div>
          <canvas class="wave" data-act="replay"></canvas>
          <div class="slots">${q.target.map((_, i) => `<span class="slot ${L.seqPicks[i] != null ? 'fill' : ''}">${L.seqPicks[i] != null ? esc(slbl(q.sk, L.seqPicks[i])) : i + 1}</span>`).join('')}<button class="iconbtn" data-act="undo" title="Undo">${I.undo}</button></div>
          ${choicesHTML(q, false)}`;
      } else {
        body = `<div class="qtop">${tag ? `<div class="qtag">${tag}</div>` : ''}</div><canvas class="wave" data-act="replay"></canvas>
          <div class="qask">${q.ask || M.SKILLS[q.sk].ask}</div>${choicesHTML(q, false)}`;
      }
    }
    const right = endless ? `<span class="combo">${I.flame}${L.combo}</span><span class="pcount">${L.correct}/${L.total}</span>` : `<span class="pcount">${qn ? qn + '/' + quizSteps.length : ''}</span>`;
    $app.innerHTML = `<div class="screen lesson c-${color}" id="lesson">
      <div class="topbar"><button class="iconbtn" data-act="quit" title="${endless ? 'End run' : 'Quit'}">${I.x}</button>${endless ? `<div class="endless-tag">${I.inf} Endless · ${L.key === 'mix' ? 'Random Mix' : M.SKILLS[L.key].name}</div>` : `<div class="pbar"><i style="width:${pct}%"></i></div>`}${right}</div>
      <div class="lbody">${body}</div>${foot ? `<div class="lfoot">${foot}</div>` : '<div class="lfoot-pad"></div>'}</div>`;
    startWave();
    if (st.type === 'q' && !st.played && st.q.kind !== 'find') { st.played = true; playQ(st.q); }
    if (st.type === 'slide' && st.s.autoplay && !st.played) { st.played = true; const a = st.s.autoplay; A.play(M.instance(a.sk, a.it, M.concrete(a.sk, a.o)).steps, S.settings.instrument); }
  }
  function choicesHTML(q, practice) {
    const sk = q.sk;
    if (sk === 'pitch' && S.settings.keyboard) return keyboardHTML(q.choices, practice);
    const n = q.choices.length;
    const g = q.o && q.o.func ? (n <= 2 ? 'g2' : 'g3') : sk === 'scales' || sk === 'progs' ? 'g2' : sk === 'chords' ? (n <= 4 ? 'g2' : 'g3') : n === 2 ? 'g2' : n === 3 ? 'g3' : n <= 4 ? 'g2' : '';
    return `<div class="grid ${g}">${q.choices.map((c, i) => `<button class="ch-b" data-act="pick" data-k="${i < 9 ? i + 1 : i === 9 ? 0 : ''}" data-it="${esc(JSON.stringify(c))}">${esc(sk === 'pitch' ? lbl(sk, c, practice) : M.shortLabel(sk, c))}${sk === 'chords' ? `<small>${M.CHORDS[c].kind === 'triad' ? 'triad' : '7th'}</small>` : ''}</button>`).join('')}</div>`;
  }
  function keyboardHTML(choices, practice) {
    const whites = [0, 2, 4, 5, 7, 9, 11], blacks = { 1: 1, 3: 2, 6: 4, 8: 5, 10: 6 };
    const w = 100 / 7;
    let h = whites.map((pc, i) => `<button class="kw ${choices.includes(pc) ? '' : 'dis'}" style="left:${i * w}%;width:${w}%" data-act="pick" data-it="${pc}">${esc(lbl('pitch', pc, practice))}</button>`).join('');
    h += Object.keys(blacks).map((pc) => `<button class="kbk ${choices.includes(+pc) ? '' : 'dis'}" style="left:${blacks[pc] * w - w * 0.32}%;width:${w * 0.64}%" data-act="pick" data-it="${pc}">${esc(lbl('pitch', +pc, practice))}</button>`).join('');
    return `<div class="kb">${h}</div>`;
  }
  async function playQ(q) {
    const id = (playQ.id = (playQ.id || 0) + 1);
    if (q.reset && q.kind !== 'find') {
      const r = M.resetEarSteps(S.settings.resetStyle);
      const ok = await A.play(r.steps, q.inst);
      if (!ok || id !== playQ.id) return;
      await sleep(450);
      if (id !== playQ.id) return;
    }
    A.play(q.sound.steps, q.inst);
  }

  function judge(ok, picked) {
    const L = LS, st = L.steps[L.i], q = st.q;
    if (st.answered) return;
    st.answered = true; st.ok = ok; st.picked = picked;
    if (st.phase === 'quiz' && !st.retry) { L.total++; if (ok) L.correct++; }
    if (L.mode === 'endless') { L.combo = ok ? L.combo + 1 : 0; L.bestCombo = Math.max(L.bestCombo, L.combo); }
    if (q.kind === 'seq') q.target.forEach((t, i) => recordItem(q.sk, t, picked[i] === t));
    else if (q.kind === 'odd') { recordItem(q.sk, q.target, ok); recordItem(q.sk, q.odd, ok); }
    else recordItem(q.sk, q.target, ok);
    if (q.kind === 'yesno' && q.asked !== q.target) recordItem(q.sk, q.asked, ok);
    A.sfx(ok ? 'good' : 'bad');
    if (!ok && st.phase === 'quiz' && L.mode === 'lesson' && L.requeue < 6 && !st.retry) {
      L.requeue++;
      const small = L.l.pool.length < 2, canFind = q.sk === 'pitch' || q.sk === 'intervals' || q.sk === 'chords';
      const retryKind = q.kind === 'seq' || q.kind === 'odd' ? q.kind : !small ? 'identify' : canFind ? 'find' : 'yesno';
      const nq = makeQuiz(q.sk, L.l.pool, L.l.o, 1, { only: retryKind, hard: true })[0];
      const item = q.kind === 'yesno' ? q.asked : q.target;
      if (retryKind === 'yesno') setYN(nq, item, L.l.pool, Math.random() < 0.5, true);
      else if (q.kind !== 'seq' && q.kind !== 'odd' && L.l.pool.includes(item)) {
        nq.target = item; nq.sound = M.instance(q.sk, item, nq.o);
        if (nq.kind === 'find') nq.options = shuffle([item].concat(distractors(q.sk, item, L.l.pool, 3, true))).map((it) => ({ it, sound: M.instance(q.sk, it, nq.o) }));
      }
      L.steps.push({ type: 'q', q: nq, phase: 'quiz', retry: true });
    }
    const lesson = document.getElementById('lesson');
    if (!lesson) return;
    if (q.kind !== 'seq') {
      lesson.querySelectorAll('[data-act="pick"]').forEach((b) => {
        const it = JSON.parse(b.dataset.it);
        if (it === q.target) b.classList.add('ok'); else if (it === picked) b.classList.add('bad'); else b.classList.add('dim');
        b.disabled = true;
      });
    } else lesson.querySelectorAll('[data-act="pick"],[data-act="undo"]').forEach((b) => { b.disabled = true; });
    lesson.querySelectorAll('[data-act="yn"]').forEach((b) => { b.disabled = true; if ((b.dataset.v === '1') !== picked) b.classList.add('faded'); });
    if (q.kind === 'find') lesson.querySelectorAll('[data-act="opt"]').forEach((b) => { const op = q.options[+b.dataset.i]; if (op.it === q.target) b.classList.add('ok'); else if (+b.dataset.i === L.sel) b.classList.add('bad'); });
    if (q.kind === 'odd') lesson.querySelectorAll('[data-act="opt"]').forEach((b) => { const i = +b.dataset.i; b.innerHTML = I.vol + esc(slbl(q.sk, q.options[i].it)); if (i === q.oddIdx) b.classList.add('ok'); else if (i === L.sel) b.classList.add('bad'); });
    const foot = lesson.querySelector('.lfoot'); if (foot) foot.style.visibility = 'hidden';
    const fb = document.createElement('div');
    fb.className = 'feedback ' + (ok ? 'good' : 'bad');
    const nm = (it) => esc(lbl(q.sk, it));
    let msg = '';
    if (!ok) {
      if (q.kind === 'yesno') msg = q.asked === q.target ? `It was ${nm(q.target)}.` : `That was ${nm(q.target)}, not ${nm(q.asked)}.`;
      else if (q.kind === 'find') msg = `The ${nm(q.target)} was number ${q.options.findIndex((o) => o.it === q.target) + 1}.`;
      else if (q.kind === 'seq') msg = `Correct answer: <b>${esc(seqLbl(q.sk, q.target))}</b>`;
      else if (q.kind === 'odd') msg = `Number ${q.oddIdx + 1} was different: <b>${nm(q.odd)}</b>. The others were ${nm(q.target)}. Tap any number to hear it again.`;
      else msg = `Correct answer: <b>${nm(q.target)}</b>`;
    } else msg = L.mode === 'endless' && L.combo >= 3 ? `${L.combo} in a row!` : pick(['Your ear is getting sharper.', 'Spot on.', 'Keep it going!', 'That\'s the one.']);
    const yours = compareItem(q, picked);
    const yLabel = yours == null ? '' : q.kind === 'seq' ? 'Yours' : q.kind === 'yesno' ? nm(yours) : 'Yours: ' + nm(yours);
    const cmp = !ok && yours != null ? `<div class="cmp"><button data-act="cmp" data-w="you">${I.play} ${yLabel}</button><button data-act="cmp" data-w="ans">${I.play} Answer${q.kind === 'seq' ? '' : ': ' + nm(q.target)}</button></div>` : '';
    fb.innerHTML = `<div class="fb-in"><h4>${ok ? I.check + ' ' + pick(['Nice!', 'Correct!', 'Great ear!', 'Nailed it!']) : I.x + ' Not quite'}</h4><p>${msg}</p>${cmp}<button class="btn ${ok ? 'green' : 'danger'}" data-act="next">Continue<kbd>Enter</kbd></button></div>`;
    lesson.appendChild(fb);
    if (!ok && S.settings.hints && yours != null) compareSeq(q, yours);
  }
  function soundFor(q, item) { return q.kind === 'seq' ? M.seqInstance(q.sk, item, q.o) : M.instance(q.sk, item, q.o); }
  function compareItem(q, picked) {
    if (q.kind === 'identify' || q.kind === 'seq') return picked;
    if (q.kind === 'find') return LS.sel != null ? q.options[LS.sel].it : null;
    if (q.kind === 'yesno') return q.asked !== q.target ? q.asked : null;
    return null;
  }
  async function compareSeq(q, yours) {
    await sleep(500);
    const a = await A.play(soundFor(q, yours).steps, q.inst);
    if (!a) return;
    await sleep(300);
    A.play(q.sound.steps, q.inst, { keep: true });
  }
  function nextStep() {
    const L = LS;
    A.stopAll();
    L.sel = null; L.seqPicks = [];
    if (L.mode === 'endless') { L.steps.push(endlessQ()); if (L.steps.length > 30) { L.steps.shift(); L.i--; } L.i++; renderLesson(); return; }
    if (L.i < L.steps.length - 1) { L.i++; renderLesson(); return; }
    finishLesson();
  }
  function finishLesson() {
    const L = LS;
    const acc = L.total ? Math.round((L.correct / L.total) * 100) : 100;
    const secs = Math.round((Date.now() - L.start) / 1000);
    const t = top(); if (t) t.params.finished = true;
    let xp = 0, passed = true;
    const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : 1;
    if (L.mode === 'intro') { S.introSeen = true; save(); pop(); toast('Step complete: Learn how it works'); return; }
    if (L.mode === 'lesson') {
      const l = L.l;
      if (l.kind === 'check' || l.kind === 'final') passed = acc >= 70;
      if (passed) {
        const prev = doneMap(L.sk)[l.id];
        doneMap(L.sk)[l.id] = { s: Math.max(stars, prev ? prev.s : 0), acc: Math.max(acc, prev ? prev.acc || 0 : 0) };
        xp = (l.kind === 'final' ? 40 : l.kind === 'check' ? 20 : 10) + (acc === 100 ? 5 : 0);
      } else xp = 3;
    } else if (L.mode === 'testout') {
      passed = acc >= 80;
      if (passed) {
        lessonsOf(L.sk).forEach((l, i) => { if (i <= L.idx && !isDone(l)) doneMap(L.sk)[l.id] = { s: i === L.idx ? stars : 1, acc: i === L.idx ? acc : 0 }; });
        xp = 25;
      } else xp = 3;
    } else if (L.mode === 'review') xp = 10 + Math.round(acc / 10);
    const first = addXP(xp);
    A.sfx(passed ? 'done' : 'bad');
    L.result = { acc, secs, xp, passed, stars, first };
    renderLesson();
  }
  function resultHTML() {
    const L = LS, r = L.result;
    const mm = Math.floor(r.secs / 60) + ':' + String(r.secs % 60).padStart(2, '0');
    if (L.mode === 'endless') {
      return `<div class="screen lesson c-${L.color}"><div class="lbody" style="justify-content:center;text-align:center">
        <div class="done-ic">${I.inf}</div><div class="ltag">Run complete</div><h2>${r.isBest ? 'New best combo!' : 'Nice run!'}</h2>
        <p class="lead">Endless · ${L.key === 'mix' ? 'Random Mix' : esc(M.SKILLS[L.key].full)} · Best combo ${(S.endless[L.key] || {}).best || 0}</p>
        <div class="stats3"><div class="stat"><small>Correct</small><b>${L.correct}/${L.total}</b></div><div class="stat"><small>Best combo</small><b>${L.bestCombo}</b></div><div class="stat"><small>Accuracy</small><b>${r.acc}%</b></div></div>
        <p class="lead">+${r.xp} XP · ${mm}</p></div>
        <div class="lfoot"><div class="row-btns"><button class="btn sec" data-act="finish">Done</button><button class="btn" data-act="eagain">Play again</button></div></div></div>`;
    }
    let title, sub;
    if (L.mode === 'testout') { title = r.passed ? 'You tested out!' : 'Not quite yet'; sub = r.passed ? 'Everything up to here is unlocked.' : 'You need 80% to skip ahead. Nothing changed.'; }
    else if (L.mode === 'review') { title = 'Review complete'; sub = 'Mixed practice keeps every skill sharp.'; }
    else if (!r.passed) { title = 'Almost there'; sub = 'You need 70% to pass this checkpoint. Try again!'; }
    else { title = L.l.kind === 'final' ? 'Skill mastered!' : L.l.kind === 'check' ? 'Checkpoint passed!' : pick(['Lesson complete!', 'Nicely done!', 'Great session!']); sub = L.l.t; }
    const stars = r.passed && L.mode !== 'review' ? `<div class="bigstars">${[1, 2, 3].map((x) => `<span class="${x <= r.stars ? '' : 'off'}">${I.star}</span>`).join('')}</div>` : '';
    return `<div class="screen lesson c-${L.color}"><div class="lbody" style="justify-content:center;text-align:center">
      <div class="done-ic">${r.passed ? I.check : I.rotate}</div><div class="ltag">${r.passed ? 'Lesson done' : 'Keep practicing'}</div>
      <h2>${esc(title)}</h2><p class="lead">${esc(sub)}</p>${stars}
      <div class="stats3"><div class="stat"><small>XP</small><b>+${r.xp}</b></div><div class="stat"><small>Accuracy</small><b>${r.acc}%</b></div><div class="stat"><small>Time</small><b>${mm}</b></div></div>
      </div><div class="lfoot"><button class="btn" data-act="finish">Continue<kbd>Enter</kbd></button></div></div>`;
  }
  function afterFinish(first) { pop(); if (first) setTimeout(streakModal, 250); }
  function streakModal() {
    const t = top(); if (t && (t.name === 'lesson' || t.name === 'practice')) return; // never cover an active lesson
    const n = streak(), m = monday(new Date()), tk = today(), L = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const days = L.map((l, i) => { const k = dkey(addDays(m, i)); const hit = !!S.days[k]; const past = k < tk;
      return `<div class="wd ${hit ? 'hit' : ''}"><span>${l}</span><div class="dot" style="${!hit && !past ? 'background:var(--soft);border-color:var(--soft)' : ''}">${hit ? I.check : past ? I.x : ''}</div></div>`; }).join('');
    openOverlay(`<div class="center-t"><div class="flame-big">${I.flame}</div><h3>${n} day streak!</h3><p>${n > 1 ? 'You\'re on fire. Keep showing up to grow it.' : 'You\'re on a roll. Keep showing up to grow it.'}</p></div>
      <div class="week" style="margin:4px 0 18px">${days}</div><button class="btn" data-act="closeov">Keep it up</button>`, { center: true });
  }
  function confirmQuit() {
    const pr = top().name === 'practice';
    openOverlay(`<h3>Quit this ${pr ? 'practice' : 'lesson'}?</h3><p>Your progress in this ${pr ? 'round' : 'lesson'} will be lost.</p>
      <div class="row-btns"><button class="btn sec" data-act="closeov">Keep going</button><button class="btn danger" data-act="doquit">Quit</button></div>`, { center: true });
  }

  /* ================= practice (timed) ================= */
  let PS = null;
  function startPractice(sk) {
    A.init();
    PS = { sk, pool: practicePool(sk), o: practiceOpts(sk), time: M.SKILLS[sk].practiceTime, left: M.SKILLS[sk].practiceTime, score: 0, total: 0, ctx: newCtx(40), q: null, lock: false, started: false };
    S.lastSkill = sk; save();
    push('practice', {});
  }
  function nextPracticeQ() {
    PS.ctx.hard = PS.total > 4; PS.ctx.only = 'identify';
    PS.q = makeQuestion(PS.sk, PS.pool, PS.o, PS.ctx);
    PS.lock = false;
    renderPractice();
    playQ(PS.q);
  }
  function renderPractice() {
    if (!PS) { pop(); return; }
    if (PS.result) { $app.innerHTML = practiceResultHTML(); return; }
    const s = M.SKILLS[PS.sk];
    if (!PS.started) {
      $app.innerHTML = `<div class="screen lesson c-${s.color}"><div class="topbar"><button class="iconbtn" data-act="back">${I.x}</button></div>
        <div class="lbody" style="justify-content:center;text-align:center"><div class="done-ic">${I.clock}</div><div class="ltag">Practice · ${s.full}</div>
        <h2>${PS.time} second challenge</h2><p class="lead">Answer as many as you can before time runs out. ${PS.pool.length} ${PS.pool.length === 1 ? 'sound' : 'sounds'} in the mix${PS.sk === 'pitch' && S.settings.transpose ? ', transposed to ' + M.TRANSPOSE_OPTIONS[S.settings.transpose] : ''}.</p>
        ${S.best[PS.sk] ? `<p class="lead">Your best: <b class="cc">${S.best[PS.sk]}</b></p>` : ''}</div>
        <div class="lfoot"><button class="btn" data-act="pgo">${I.play} Start<kbd>Enter</kbd></button></div></div>`;
      return;
    }
    $app.innerHTML = `<div class="screen lesson c-${s.color}" id="lesson">
      <div class="topbar"><button class="iconbtn" data-act="quit">${I.x}</button><div class="timer ${PS.left <= 10 ? 'low' : ''}"><i id="ptime" style="width:${(PS.left / PS.time) * 100}%"></i></div><span class="score">${PS.score}</span></div>
      <div class="lbody"><canvas class="wave" data-act="replay"></canvas><div class="qask">${s.ask}</div>${choicesHTML(PS.q, true)}</div><div class="lfoot-pad"></div></div>`;
    startWave();
  }
  function practiceTick() {
    if (!PS || PS.result) return;
    PS.left--;
    const el = document.getElementById('ptime');
    if (el) { el.style.width = (Math.max(0, PS.left) / PS.time) * 100 + '%'; if (PS.left <= 10) el.parentElement.classList.add('low'); }
    if (PS.left <= 0) endPractice();
  }
  async function practiceAnswer(it) {
    if (PS.lock) return;
    PS.lock = true;
    const q = PS.q, ok = it === q.target;
    PS.total++; if (ok) PS.score++;
    recordItem(PS.sk, q.target, ok);
    A.sfx(ok ? 'good' : 'bad');
    const lesson = document.getElementById('lesson');
    lesson.querySelectorAll('[data-act="pick"]').forEach((b) => { const v = JSON.parse(b.dataset.it); if (v === q.target) b.classList.add('ok'); else if (v === it) b.classList.add('bad'); });
    lesson.classList.add(ok ? 'flash-ok' : 'flash-bad');
    const sc = lesson.querySelector('.score'); if (sc) sc.textContent = PS.score;
    if (ok) await sleep(420);
    else if (S.settings.hints) { await sleep(300); await A.play(M.instance(q.sk, it, q.o).steps, q.inst); await sleep(150); await A.play(q.sound.steps, q.inst); }
    else await sleep(1000);
    if (PS && !PS.result && top() && top().name === 'practice') nextPracticeQ();
  }
  function endPractice() {
    stopTimers(); A.stopAll();
    const prev = S.best[PS.sk] || 0;
    const best = PS.score > prev;
    if (best) S.best[PS.sk] = PS.score;
    const first = addXP(Math.max(1, PS.score));
    PS.result = { best, prev, first };
    top().params.finished = true;
    A.sfx('done');
    renderPractice();
  }
  function practiceResultHTML() {
    const s = M.SKILLS[PS.sk], acc = PS.total ? Math.round((PS.score / PS.total) * 100) : 0;
    return `<div class="screen lesson c-${s.color}"><div class="lbody" style="justify-content:center;text-align:center">
      <div class="done-ic">${I.trophyF}</div><div class="ltag">Time's up!</div><h2>${PS.result.best ? 'New best score!' : 'Nice run!'}</h2>
      <p class="lead">${s.full} practice${PS.result.prev && !PS.result.best ? ' · Best ' + PS.result.prev : ''}</p>
      <div class="stats3"><div class="stat"><small>Score</small><b>${PS.score}</b></div><div class="stat"><small>Accuracy</small><b>${acc}%</b></div><div class="stat"><small>XP</small><b>+${Math.max(1, PS.score)}</b></div></div></div>
      <div class="lfoot"><div class="row-btns"><button class="btn sec" data-act="pfinish">Done</button><button class="btn" data-act="pagain">Play again</button></div></div></div>`;
  }

  /* ================= wave animation ================= */
  let waveRAF = null, lvl = 0, phase = 0;
  function startWave() {
    if (waveRAF) return;
    const loop = () => {
      const cvs = document.querySelector('canvas.wave');
      if (!cvs) { waveRAF = null; return; }
      const dpr = window.devicePixelRatio || 1, w = cvs.clientWidth, h = cvs.clientHeight;
      if (cvs.width !== Math.round(w * dpr) || cvs.height !== Math.round(h * dpr)) { cvs.width = Math.round(w * dpr); cvs.height = Math.round(h * dpr); }
      const g = cvs.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      lvl += (A.level() - lvl) * 0.12;
      phase += 0.035 + lvl * 0.06;
      const col = getComputedStyle(cvs).getPropertyValue('--c').trim() || '#FF9600';
      const amp = h * (0.12 + Math.min(lvl, 1) * 0.3);
      for (let k = 5; k >= 0; k--) {
        g.beginPath();
        const a = amp * (k === 0 ? 1 : 0.35 + k * 0.1), f = 1.5 + k * 0.17, p = phase * (1 + k * 0.13) + k;
        for (let x = 0; x <= w; x += 3) {
          const t = x / w, env = Math.sin(Math.PI * t) * 0.7 + 0.3;
          const y = h / 2 + Math.sin(t * Math.PI * 2 * f + p) * a * env;
          x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
        }
        g.strokeStyle = col; g.globalAlpha = k === 0 ? 1 : 0.22; g.lineWidth = k === 0 ? 3 : 1.2;
        g.stroke();
      }
      g.globalAlpha = 1;
      waveRAF = requestAnimationFrame(loop);
    };
    waveRAF = requestAnimationFrame(loop);
  }

  /* ================= progress tab ================= */
  function progressHTML() {
    const st = stepsDone(), nd = st.filter(Boolean).length;
    const steps = [['Learn how it works', 'Finish the intro slides', 'how'], ['Complete an activity', 'A daily mix, practice, or a lesson', 'session'], ['Practice 2 days in a row', 'Start a streak', null]];
    const firstOpen = st.indexOf(false);
    const stepsHTML = `<div class="steps-h"><span>First steps</span><span>${nd} of 3 done</span></div><div class="group">${steps.map((s, i) => {
      const cls = st[i] ? 'done' : i === firstOpen ? 'next' : 'lock';
      return `<button class="step ${cls}" ${!st[i] && s[2] && i === firstOpen ? `data-act="${s[2]}"` : ''}><span class="sc">${st[i] ? I.check : i > firstOpen ? I.lock.replace('<svg', '<svg style="width:11px;height:11px"') : ''}</span><div><b>${s[0]}</b><small>${s[1]}</small></div>${!st[i] && i === firstOpen && s[2] ? I.chevR : ''}</button>`;
    }).join('')}</div>`;
    const unlocked = nd === 3;
    const stats = statsHTML();
    return `<h1>Progress</h1><p class="lead" style="margin-top:4px">${unlocked ? 'Everything you have trained so far.' : 'Unlock your progress in 3 steps'}</p>
      ${unlocked ? '' : stepsHTML}
      ${unlocked ? stats : `<div class="locked-box"><div class="blur">${stats}</div><div class="lk">${I.lock}<span>Finish the first steps to unlock your stats</span></div></div>`}`;
  }
  function statsHTML() {
    const kpi = (ic, col, v, l) => `<div class="kpi" style="color:${col}">${ic}<div style="color:var(--text)"><b>${v}</b><small>${l}</small></div></div>`;
    const acc = M.SKILL_ORDER.map((k) => { const a = skillAcc(k); const s = M.SKILLS[k];
      return `<div class="acc-row c-${s.color}"><span class="n">${s.name}</span><div class="bar"><i style="width:${a == null ? 0 : a * 100}%"></i></div><em>${a == null ? '–' : Math.round(a * 100) + '%'}</em></div>`; }).join('');
    const start = addDays(monday(new Date()), -7 * 15), tk = today();
    let cells = '';
    for (let i = 0; i < 16 * 7; i++) { const k = dkey(addDays(start, i)); const d = S.days[k];
      const lv = !d ? '' : d.xp >= 40 ? 'l3' : d.xp >= 15 ? 'l2' : 'l1'; cells += `<i class="${k > tk ? 'fut' : lv}" title="${k}"></i>`; }
    const weak = Object.keys(S.items).map((k) => { const [a, c] = S.items[k]; return { k, a, r: c / a }; }).filter((x) => x.a >= 3 && x.r < 1).sort((x, y) => x.r - y.r).slice(0, 5);
    const weakHTML = weak.length ? weak.map((w) => { const [sk, raw] = w.k.split(':'); const it = sk === 'pitch' || sk === 'intervals' ? +raw : raw; const s = M.SKILLS[sk];
      return `<div class="acc-row c-${s.color}"><span class="n">${esc(M.label(sk, it, { names: S.settings.names }))}</span><div class="bar"><i style="width:${w.r * 100}%"></i></div><em>${Math.round(w.r * 100)}%</em><button class="playc" style="width:30px;height:30px" ${hearBtn(sk, it, practiceOpts(sk))}>${I.play}</button></div>`; }).join('')
      : '<div class="empty">No trouble spots yet. Keep training!</div>';
    const bms = [];
    M.SKILL_ORDER.forEach((sk) => S.prog[sk].bm.forEach((id) => { const l = lessonsOf(sk).find((x) => x.id === id); if (l) bms.push(l); }));
    const bmHTML = bms.length ? bms.map((l) => { const s = M.SKILLS[l.skill];
      return `<button class="step c-${s.color}" data-act="startbm" data-sk="${l.skill}" data-i="${l.idx}"><span class="sk-ic" style="width:30px;height:30px">${SKILL_ICON[l.skill]}</span><div><b>${l.idx + 1}. ${esc(l.t)}</b><small>${s.full}</small></div>${I.chevR}</button>`; }).join('')
      : '<div class="empty">Bookmark lessons on a skill path to review them here.</div>';
    const bests = ['mix'].concat(M.SKILL_ORDER).map((k) => { const s = k === 'mix' ? { name: 'Random Mix', color: 'orange' } : M.SKILLS[k];
      return `<div class="acc-row c-${s.color}"><span class="n">${s.name}</span><div style="flex:1"></div><em style="width:auto;color:var(--muted);margin-right:14px">${k === 'mix' ? '' : 'Practice ' + (S.best[k] || '–')}</em><em style="width:auto;color:var(--c)">Combo ${(S.endless[k] || {}).best || '–'}</em></div>`; }).join('');
    return `<div class="sec-t">Overview</div><div class="kpis">
      ${kpi(I.zap, 'var(--gold)', S.xp || 0, 'Total XP')}${kpi(I.flame, 'var(--orange)', streak(), 'Day streak')}
      ${kpi(I.trophyF, 'var(--purple)', bestStreak(), 'Best streak')}${kpi(I.grad, 'var(--teal)', totalDone() + '/' + totalLessons(), 'Lessons done')}</div>
      <div class="stat-grid"><div><div class="sec-t">Accuracy by skill</div><div class="group">${acc}</div></div>
      <div><div class="sec-t">Activity</div><div class="group"><div class="heat">${cells}</div></div></div>
      <div><div class="sec-t">Trouble spots</div><div class="group">${weakHTML}</div></div>
      <div><div class="sec-t">Bookmarked for review</div><div class="group">${bmHTML}</div></div>
      <div><div class="sec-t">Best scores</div><div class="group">${bests}</div></div></div>`;
  }

  /* ================= endless tab ================= */
  function endlessHTML() {
    const rec = (k) => S.endless[k] || { best: 0, runs: 0, answered: 0, correct: 0 };
    const mix = rec('mix');
    const card = (k) => { const s = M.SKILLS[k], r = rec(k);
      return `<button class="emode c-${s.color}" data-act="endless" data-k="${k}"><span class="sk-ic">${SKILL_ICON[k]}</span><div><b>${s.name} Endless</b><small>${r.runs ? `Best combo ${r.best} · ${r.runs} run${r.runs === 1 ? '' : 's'}` : s.sub + ' · no runs yet'}</small></div><span class="playc">${I.play}</span></button>`; };
    return `<h1>Endless</h1><p class="lead" style="margin-top:4px">Random questions that never stop. How long can you keep your combo going?</p>
      <button class="emix" data-act="endless" data-k="mix"><div class="emix-ic">${I.shuffle}</div><div class="emix-t"><div class="over">Infinite random mode</div><b>Random Mix</b><small>Pitch, intervals, chords, scales and progressions, all shuffled together.</small></div>
        <div class="emix-s"><span><b>${mix.best}</b>best combo</span><span><b>${mix.runs}</b>runs</span><span><b>${mix.answered ? Math.round(mix.correct / mix.answered * 100) + '%' : '–'}</b>accuracy</span></div>
        <span class="btn-white">${I.play} Start endless</span></button>
      <div class="sec-t">Sounds</div><div class="seg">${[['all', 'Everything'], ['learned', 'Learned so far']].map(([k, l]) => `<button class="${S.endlessScope === k ? 'on' : ''}" data-act="escope" data-k="${k}">${l}</button>`).join('')}</div>
      <div class="sec-t">Endless by skill</div><div class="emodes">${M.SKILL_ORDER.map(card).join('')}</div>`;
  }

  /* ================= settings ================= */
  const INSTR = [['random', 'Random'], ['piano', 'Piano'], ['guitar', 'Guitar'], ['cello', 'Cello'], ['clarinet', 'Clarinet'], ['trumpet', 'Trumpet'], ['sine', 'Sine Wave']];
  const RESET_STYLES = [['harmonic', 'Harmonious'], ['mixed', 'Mixed'], ['dissonant', 'Dissonant']];
  function settingsHTML() {
    const st = S.settings;
    const row = (act, ic, title, sub, right, extra) => `<button class="srow" data-act="${act}" ${extra || ''}><span class="si ${act === 'delete' ? 'danger' : ''}">${ic}</span><div class="st"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</div>${right}</button>`;
    const sel = (v) => `<span class="val">${esc(v)}${I.chevUD}</span>`;
    const tog = (on) => `<span class="tog ${on ? 'on' : ''}"></span>`;
    const chev = I.chevR;
    return `<h1>Settings</h1><div class="set-grid"><div>
      <div class="sec-t">Sound</div><div class="group">
        ${row('sel-instrument', I.vol, 'Instrument', 'Recorded instrument samples', sel(INSTR.find((x) => x[0] === st.instrument)[1]))}
        ${row('sel-names', I.note, 'Note names', '', sel(M.NAME_OPTIONS.find((x) => x[0] === st.names)[1]))}
        ${row('sel-transpose', I.swap, 'Transposition', 'Practice mode only', sel(M.TRANSPOSE_OPTIONS[st.transpose]))}
      </div>
      <div class="sec-t">Practice</div><div class="group">
        ${row('tg-keyboard', I.keyboard, 'Keyboard', 'Pitch trainer only', tog(st.keyboard))}
        ${row('tg-hints', I.bulb, 'Answer hints', 'Compare your pick with the answer after a miss', tog(st.hints))}
        ${row('tg-resetEar', I.rotate, 'Reset your ear', 'Short chords before each question', tog(st.resetEar))}
        ${row('sel-resetStyle', I.chord, 'Reset sound', 'Pleasant chords or a dissonant wipe', sel(RESET_STYLES.find((x) => x[0] === st.resetStyle)[1]), st.resetEar ? '' : 'style="opacity:.5"')}
        ${row('tg-notifications', I.bell, 'Notifications', 'Daily practice reminder', tog(st.notifications))}
      </div></div><div>
      <div class="sec-t">Appearance</div><div class="group"><div class="srow"><span class="si">${I.sun}</span><div class="st"><b>Theme</b></div>
        <div class="seg" style="width:190px">${[['system', 'Auto'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => `<button class="${st.theme === k ? 'on' : ''}" data-act="theme" data-k="${k}">${l}</button>`).join('')}</div></div></div>
      <div class="sec-t">Help</div><div class="group">
        ${row('how', I.help, 'How it works', '', chev)}
        ${row('board', I.msg, 'Feedback board', 'Share ideas and vote on what\'s next', chev)}
        ${row('contact', I.life, 'Contact us', '', chev)}
      </div>
      <div class="group" style="margin-top:18px">
        ${row('logout', I.logout, 'Log out', '', chev)}
        ${row('delete', I.trash, 'Delete account', '', chev)}
      </div></div></div>
      <div class="foot"><button data-act="doc" data-k="privacy">Privacy</button><button data-act="doc" data-k="terms">Terms</button><button data-act="doc" data-k="ack">Acknowledgements</button><button data-act="doc" data-k="log">Update log</button><div>Version ${VERSION}</div></div>`;
  }
  const DOCS = {
    privacy: ['Privacy', '<h4>Your data stays on your device</h4><p>Pitch Trainer stores your progress and settings only in this device\'s local storage. Nothing is sent to a server.</p><h4>No tracking</h4><p>There are no ads, analytics, or third-party trackers.</p><h4>Deleting data</h4><p>Use Settings → Delete account to erase everything instantly.</p>'],
    terms: ['Terms', '<p>Pitch Trainer is provided as-is for personal ear-training practice. You may use it freely. We make no guarantee that it is free of errors, and we are not liable for any damages arising from its use.</p>'],
    ack: ['Acknowledgements', '<ul><li>Instrument samples: FluidR3 GM SoundFont by Frank Wen, licensed CC BY 3.0, rendered by the midi-js-soundfonts project (Benjamin Gleitzman).</li><li>Typeface: Nunito (SIL Open Font License).</li><li>Android build: Capacitor.</li><li>Icons drawn in the style of Lucide (ISC License).</li></ul>'],
    log: ['Update log', `<h4>Version ${VERSION}</h4><ul><li>Real recorded instruments: piano, guitar, cello, clarinet, trumpet, with a soft room reverb.</li><li>Choose the ear-reset sound: harmonious, mixed, or dissonant.</li><li>62 new lessons (211 total): Deep Bass, Sky High, Melodies, Five Octaves, Quick Ears, Inversion Lab, Going Down, Random Keys and more.</li><li>New question type: name a short melody note by note.</li><li>Endless mode: Random Mix plus one endless mode per skill.</li><li>Desktop layout with keyboard shortcuts for the web version.</li></ul><h4>Version 1.0.0</h4><ul><li>Five skills, 149 lessons, skill paths, practice, streaks, light and dark themes.</li></ul>`]
  };
  function ideasList() {
    if (!S.ideas) S.ideas = [
      { t: 'Sight-singing mode with microphone', v: 41, me: false }, { t: 'Melodic dictation (longer melodies)', v: 33, me: false },
      { t: 'MIDI keyboard input', v: 27, me: false }, { t: 'Custom note ranges', v: 19, me: false }, { t: 'More instruments (violin, flute, organ)', v: 15, me: false }
    ];
    return S.ideas;
  }
  function boardSheet() {
    const ideas = ideasList().map((x, i) => Object.assign({ i }, x)).sort((a, b) => b.v - a.v);
    openOverlay(`<h3>Feedback board</h3><p>Share ideas and vote on what's next.</p>
      <div class="group" style="margin-bottom:14px">${ideas.map((x) => `<div class="idea"><button class="vote ${x.me ? 'on' : ''}" data-act="vote" data-i="${x.i}">${I.up}${x.v}</button><div>${esc(x.t)}${x.mine ? '<small>Your idea</small>' : ''}</div></div>`).join('')}</div>
      <input class="field" id="idea" maxlength="80" placeholder="Suggest an idea…"><button class="btn" data-act="addidea">Post idea</button>`);
  }
  async function syncNotifications(ask) {
    const LN = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
    try {
      if (LN) {
        await LN.cancel({ notifications: [{ id: 1 }] }).catch(() => {});
        if (!S.settings.notifications) return;
        let p = await LN.checkPermissions();
        if (p.display !== 'granted' && ask) p = await LN.requestPermissions();
        if (p.display !== 'granted') return;
        await LN.schedule({ notifications: [{ id: 1, title: 'Pitch Trainer', body: 'Time to train your ear! Keep your streak going.', schedule: { on: { hour: 19, minute: 0 }, allowWhileIdle: true } }] });
      } else if (ask && S.settings.notifications && 'Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch (e) { /* not supported */ }
  }
  function webReminder() {
    try {
      if (!S.settings.notifications || window.Capacitor || !('Notification' in window) || Notification.permission !== 'granted') return;
      if (!S.days[today()] && new Date().getHours() >= 18 && streak() > 0) new Notification('Pitch Trainer', { body: 'Don\'t lose your ' + streak() + ' day streak — a quick session keeps it alive!' });
    } catch (e) { /* ignore */ }
  }

  /* ================= welcome ================= */
  function welcomeHTML() {
    return `<div class="screen"><div class="welcome"><div class="logo">${I.note}</div><h1>Pitch Trainer</h1><p>Train your ear, one note at a time.</p>
      <button class="btn" data-act="welcome">Get started</button></div></div>`;
  }

  /* ================= events ================= */
  function seqPick(it) {
    const L = LS, st = L.steps[L.i], q = st.q;
    if (st.answered) return;
    L.seqPicks = (L.seqPicks || []).concat([it]);
    if (q.sk === 'pitch') A.play(M.instance('pitch', it, q.o).steps, q.inst); else A.sfx('tap');
    if (L.seqPicks.length >= q.target.length) { const picks = L.seqPicks.slice(); updateSlots(q); judge(same(picks, q.target), picks); }
    else updateSlots(q);
  }
  function updateSlots(q) {
    const el = document.querySelector('.slots'); if (!el) return;
    el.querySelectorAll('.slot').forEach((s, i) => { const v = LS.seqPicks[i]; s.classList.toggle('fill', v != null); s.textContent = v != null ? slbl(q.sk, v) : i + 1; });
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    const act = b.dataset.act;
    const sk = b.dataset.sk;
    switch (act) {
      case 'tab': nav.tab = b.dataset.k; render(); { const ts = document.getElementById('tabscroll'); if (ts) ts.scrollTop = 0; } break;
      case 'skill': skillSheet(sk); break;
      case 'learn': closeOverlay(); nav.pathScroll = null; push('path', { sk }); break;
      case 'practice': closeOverlay(); startPractice(sk); break;
      case 'endless': closeOverlay(); startEndless(b.dataset.k); break;
      case 'escope': S.endlessScope = b.dataset.k; save(); render(); break;
      case 'eagain': { const k = LS.key; LS = null; nav.stack.pop(); startEndless(k); break; }
      case 'back': pop(); break;
      case 'closeov': closeOverlay(); break;
      case 'session': { const nx = nextLesson(); startLesson(nx.sk, nx.l.idx, 'lesson'); break; }
      case 'review': startReview(); break;
      case 'how': closeOverlay(); startHowItWorks(); break;
      case 'gounit': { const u = document.getElementById('u' + b.dataset.u), el = document.getElementById('pathscroll'); if (u && el) el.scrollTo({ top: u.offsetTop - 10, behavior: 'smooth' }); break; }
      case 'node': { const i = +b.dataset.i; nav.pathPop = nav.pathPop === i ? null : i; const s = top().params.sk; const el = document.getElementById('pathscroll'); nav.pathScroll = el ? el.scrollTop : null; $app.innerHTML = pathHTML(s); afterPath(s); A.sfx('tap'); break; }
      case 'start': startLesson(top().params.sk, +b.dataset.i, 'lesson'); break;
      case 'testout': startLesson(top().params.sk, +b.dataset.i, 'testout'); break;
      case 'startbm': startLesson(sk, +b.dataset.i, 'lesson'); break;
      case 'bm': { const s = top().params.sk, l = lessonsOf(s)[+b.dataset.i], arr = S.prog[s].bm; const k = arr.indexOf(l.id); if (k >= 0) arr.splice(k, 1); else arr.push(l.id); save();
        const el = document.getElementById('pathscroll'); nav.pathScroll = el ? el.scrollTop : null; $app.innerHTML = pathHTML(s); afterPath(s); toast(k >= 0 ? 'Bookmark removed' : 'Bookmarked for review'); break; }
      case 'next': nextStep(); break;
      case 'quit': if (LS && LS.mode === 'endless' && top().name === 'lesson') endEndless(); else confirmQuit(); break;
      case 'doquit': closeOverlay(); stopTimers(); A.stopAll(); LS = null; PS = null; pop(); break;
      case 'finish': { const f = LS.result && LS.result.first; LS = null; afterFinish(f); break; }
      case 'replay': { const st = LS && top().name === 'lesson' ? LS.steps[LS.i] : null; if (st && st.q) A.play(st.q.sound.steps, st.q.inst); else if (PS && PS.q) A.play(PS.q.sound.steps, PS.q.inst); break; }
      case 'hear': { const it = JSON.parse(b.dataset.it), o = JSON.parse(b.dataset.o || '{}'); A.init(); A.play(M.instance(sk, it, M.concrete(sk, o)).steps, o.inst || S.settings.instrument); break; }
      case 'hearpair': A.init(); A.play([{ t: 0, notes: [60], d: 0.9 }, { t: 1.0, notes: [60 + +b.dataset.b], d: 1.3 }], S.settings.instrument); break;
      case 'pick': {
        const it = JSON.parse(b.dataset.it);
        if (top().name === 'practice') practiceAnswer(it);
        else if (LS.steps[LS.i].q.kind === 'seq') seqPick(it);
        else judge(it === LS.steps[LS.i].q.target, it);
        break;
      }
      case 'undo': if (LS && LS.seqPicks && LS.seqPicks.length) { LS.seqPicks.pop(); updateSlots(LS.steps[LS.i].q); } break;
      case 'yn': { const q = LS.steps[LS.i].q; const yes = b.dataset.v === '1'; judge(yes === (q.asked === q.target), yes); break; }
      case 'opt': { const q = LS.steps[LS.i].q; const i = +b.dataset.i; if (LS.steps[LS.i].answered) { A.play(q.options[i].sound.steps, q.inst); break; } LS.sel = i;
        document.querySelectorAll('[data-act="opt"]').forEach((x) => x.classList.toggle('sel', +x.dataset.i === i));
        const sb = document.querySelector('[data-act="submit"]'); if (sb) sb.disabled = false;
        A.play(q.options[i].sound.steps, q.inst); break; }
      case 'submit': { const q = LS.steps[LS.i].q; if (LS.sel == null) break;
        if (q.kind === 'odd') judge(LS.sel === q.oddIdx, q.options[LS.sel].it); else judge(q.options[LS.sel].it === q.target, q.options[LS.sel].it); break; }
      case 'cmp': { const st = LS.steps[LS.i], q = st.q; const y = compareItem(q, st.picked);
        A.play((b.dataset.w === 'you' ? soundFor(q, y) : q.sound).steps, q.inst); break; }
      case 'pgo': PS.started = true; PS.left = PS.time; stopTimers(); timers.push(setInterval(practiceTick, 1000)); nextPracticeQ(); break;
      case 'pfinish': { const f = PS.result && PS.result.first; PS = null; afterFinish(f); break; }
      case 'pagain': { const s = PS.sk; PS = null; nav.stack.pop(); startPractice(s); break; }
      case 'theme': S.settings.theme = b.dataset.k; save(); render(); break;
      case 'board': boardSheet(); break;
      case 'vote': { const x = ideasList()[+b.dataset.i]; x.me = !x.me; x.v += x.me ? 1 : -1; save(); boardSheet(); break; }
      case 'addidea': { const v = (document.getElementById('idea').value || '').trim(); if (v) { ideasList().push({ t: v, v: 1, me: true, mine: true }); save(); boardSheet(); toast('Thanks for the idea!'); } break; }
      case 'contact': openOverlay(`<h3>Contact us</h3><p>Found a bug or have a question? Open an issue on GitHub and we'll get back to you.</p><a class="btn" href="${REPO}/issues" target="_blank" rel="noopener" style="text-decoration:none">${I.msg} Open GitHub issues</a><button class="btn sec mt" data-act="closeov">Close</button>`); break;
      case 'doc': openOverlay(`<h3>${DOCS[b.dataset.k][0]}</h3><div class="prose">${DOCS[b.dataset.k][1]}</div><button class="btn sec mt" data-act="closeov">Close</button>`); break;
      case 'logout': openOverlay(`<h3>Log out?</h3><p>Your progress stays saved on this device. You can pick up where you left off.</p><div class="row-btns"><button class="btn sec" data-act="closeov">Cancel</button><button class="btn" data-act="dologout">Log out</button></div>`, { center: true }); break;
      case 'dologout': closeOverlay(); S.loggedOut = true; save(); nav.stack = []; nav.tab = 'play'; render(); break;
      case 'delete': openOverlay(`<h3>Delete account?</h3><p>This permanently erases your progress, streaks, and settings from this device. This can't be undone.</p><div class="row-btns"><button class="btn sec" data-act="closeov">Cancel</button><button class="btn danger" data-act="dodelete">Delete</button></div>`, { center: true }); break;
      case 'dodelete': closeOverlay(); try { localStorage.removeItem(KEY); } catch (er) { /* ignore */ } S = defaults(); S.loggedOut = true; save(); nav.stack = []; nav.tab = 'play'; syncNotifications(false); render(); break;
      case 'welcome': S.loggedOut = false; save(); A.init(); render(); break;
      default:
        if (act.startsWith('tg-')) { const k = act.slice(3); S.settings[k] = !S.settings[k]; save(); render(); if (k === 'notifications') syncNotifications(true); }
        else if (act.startsWith('sel-')) {
          const k = act.slice(4);
          const opts = k === 'instrument' ? INSTR : k === 'names' ? M.NAME_OPTIONS : k === 'resetStyle' ? RESET_STYLES : M.TRANSPOSE_OPTIONS.map((x, i) => [i, x]);
          openMenu(b, opts, S.settings[k], (v) => {
            S.settings[k] = v; save(); render(); A.init();
            if (k === 'instrument') { A.preload(v === 'random' ? null : [v]); A.play([{ t: 0, notes: [60, 64, 67], d: 1.2 }, { t: 1.3, notes: [60], d: 1.0 }], v); }
            if (k === 'resetStyle') A.play(M.resetEarSteps(v).steps, S.settings.instrument === 'random' ? 'piano' : S.settings.instrument);
          });
        }
    }
  });

  /* keyboard shortcuts (desktop) */
  document.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    const q = (sel) => document.querySelector(sel);
    const click = (el) => { if (el && !el.disabled) { el.click(); return true; } return false; };
    if (k === 'Escape') { handleBack(); e.preventDefault(); return; }
    if (nav.overlay || nav.menu) { if (k === 'Enter') click(q('#ov .btn:not(.sec)')); return; }
    const t = top(); if (!t || (t.name !== 'lesson' && t.name !== 'practice')) return;
    if (k === 'Enter') {
      if (click(q('.feedback [data-act="next"]')) || click(q('.lfoot [data-act="next"]')) || click(q('[data-act="submit"]')) || click(q('[data-act="finish"]')) || click(q('[data-act="pgo"]')) || click(q('[data-act="pfinish"]'))) e.preventDefault();
      return;
    }
    if (k === ' ' || k === 'r' || k === 'R') { click(q('canvas.wave')) || click(q('[data-act="replay"]')); e.preventDefault(); return; }
    if (k === 'y' || k === 'Y') { click(q('[data-act="yn"][data-v="1"]')); return; }
    if (k === 'n' || k === 'N') { click(q('[data-act="yn"][data-v="0"]')); return; }
    if (k === 'Backspace') { click(q('[data-act="undo"]')); return; }
    if (/^[0-9]$/.test(k)) {
      const opt = q(`[data-act="opt"][data-k="${k}"]`);
      if (opt) { click(opt); return; }
      click(q(`.ch-b[data-act="pick"][data-k="${k}"]`));
    }
  });
  // canvas.wave has data-act="replay"; make it clickable via keyboard helper
  HTMLCanvasElement.prototype.click = HTMLCanvasElement.prototype.click || function () { this.dispatchEvent(new MouseEvent('click', { bubbles: true })); };

  /* Android hardware back */
  function setupNative() {
    const C = window.Capacitor;
    if (!C || !C.Plugins) return;
    const App = C.Plugins.App;
    if (App && App.addListener) App.addListener('backButton', () => { if (!handleBack()) App.exitApp(); });
    try { C.Plugins.SplashScreen && C.Plugins.SplashScreen.hide(); } catch (e) { /* ignore */ }
  }

  /* ================= boot ================= */
  load();
  save();
  applyLayout();
  applyTheme();
  render();
  setupNative();
  syncNotifications(false);
  webReminder();
  // load the chosen instrument now, the rest in the background
  A.preload(S.settings.instrument === 'random' || S.settings.instrument === 'sine' ? ['piano'] : [S.settings.instrument]).then(() => setTimeout(() => A.preload(), 1500));
  document.addEventListener('visibilitychange', () => { if (document.hidden) A.stopAll(); else if (!top()) render(); });
  window.PT = { state: () => S, cur: () => LS, ps: () => PS, startLesson, startEndless, startReview, startPractice, nav, makeQuiz, makeQuestion, newCtx, practiceOpts, practicePool, lessons: lessonsOf };
})();
