(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const peso = n => '₱' + Math.round(n).toLocaleString('en-PH');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- DATA (from the Drs'. Drip Facebook page) ---------- */
  const BRANCHES = [
    { id: 'timog', name: 'Quezon City · Main', short: 'Timog (Main)', addr: 'G/F Newgrange Condotel, #32 Timog Avenue, Quezon City', open: 10, close: 19, phones: ['0917 896 4599', '(02) 8373 4685'], wa: '639178964599', q: '32 Timog Avenue, Quezon City' },
    { id: 'soho', name: 'Mandaluyong · SOHO Central', short: 'SOHO Central', addr: 'Level 1, Units 1 & 2, SOHO Central, Greenfield District, Shaw Blvd, Mandaluyong', open: 9, close: 18, phones: ['0917 129 5515', '(02) 8631 7788'], wa: '639171295515', q: 'SOHO Central Greenfield District Mandaluyong' },
    { id: 'capitol', name: 'Quezon City · Capitol Hills', short: 'Capitol Hills', addr: 'Celebrity Sports Plaza, Capitol Hills Drive, Quezon City', open: 10, close: 19, phones: ['0917 896 4599'], wa: '639178964599', q: 'Celebrity Sports Plaza, Capitol Hills Drive, Quezon City' }
  ];
  const SERVICES = {
    'Not sure yet': ['Consultation (a physician will guide me)'],
    'IV drips': ['Platinum Ultra White', 'Royal Cinderella IV Drip', "Myers' Plus Drip", 'NAD Ultimate Drip', 'Youthful Radiance IV Drip', 'Regen C Cellular Renewal', 'Skin Rejuvenation IV Drip'],
    'Skin': ['Juvelook', 'Rejuran', 'Exosomes', 'Skin Booster PRP', 'MSC Youth Revive'],
    'Lift & contour': ['Botox', 'Duolift COG Thread Lift', '3D Maxi Lift Ulthera Prime', 'Airetox + Zero'],
    'Body & metabolic': ['90-Day Metabolic Program', 'EOS Diode Laser Hair Removal'],
    'Anniversary packages': ['Platinum Ultra White · 23-session package', 'Royal Cinderella · 23-session package', "Myers' Plus Drip · 23-session package", 'NAD Ultimate Drip · 15-session package', 'Youthful Radiance · 15-session package', 'Skin Booster PRP · 4-session package', '₱30K Anniversary Edit']
  };
  const PROMO_END = new Date('2026-12-31T23:59:59+08:00');

  /* ---------- PH time helpers ---------- */
  function phNow() {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short' }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value;
    return { y: +g('year'), m: +g('month') - 1, d: +g('day'), h: +g('hour') % 24, min: +g('minute'), wd: g('weekday') };
  }
  function status(b) {
    const n = phNow();
    if (n.wd === 'Mon') return { open: false, text: 'Closed today · opens Tue ' + fmtH(b.open) };
    const t = n.h + n.min / 60;
    if (t >= b.open && t < b.close) return { open: true, text: 'Open now · until ' + fmtH(b.close) };
    if (t < b.open) return { open: false, text: 'Opens today ' + fmtH(b.open) };
    return { open: false, text: 'Closed · opens ' + (n.wd === 'Sun' ? 'Tue ' : 'tomorrow ') + fmtH(b.open) };
  }
  function fmtH(h) { const hh = Math.floor(h), mm = Math.round((h - hh) * 60); return ((hh + 11) % 12 + 1) + (mm ? ':' + String(mm).padStart(2, '0') : '') + (hh < 12 ? 'am' : 'pm'); }

  /* ---------- Headline split ---------- */
  $$('.split').forEach(el => {
    const words = el.innerHTML.split(/\s+|&nbsp;/).filter(Boolean);
    el.innerHTML = words.map((w, i) => `<span class="w"><span style="transition-delay:${0.15 + i * 0.08}s">${w === 'first' ? '<em>first</em>' : w}</span></span>`).join(' ');
    setTimeout(() => el.classList.add('in'), 140);
  });

  /* ---------- Reveal + counters ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = ((i % 4) * 0.08) + 's'; io.observe(el); });
  function countUp(el, end, fmt, dur = 1600) {
    if (reduce) { el.textContent = fmt(end); return; }
    const t0 = performance.now();
    (function f(t) { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(end * e); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target); const el = e.target;
    if (el.dataset.count) countUp(el, +el.dataset.count, v => Math.round(v) + (el.dataset.suffix || ''));
    if (el.dataset.amt) countUp(el, +el.dataset.amt, peso, 1800);
    if (el.id === 'ringFill') el.style.strokeDashoffset = 326.7 * (1 - 0.94);
  }), { threshold: 0.5 });
  $$('[data-count],[data-amt],#ringFill').forEach(el => cio.observe(el));

  /* ---------- Scroll effects ---------- */
  const nav = $('#nav'), fill = $('.ivfill'), drop = $('.ivdrop'), fb = $('.float-book');
  const steps = $$('.steps li'), path = $('#stepPath'), stepsBox = $('.steps');
  const secs = $$('main section[id]'), navLinks = $$('.links a');
  function onScroll() {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('solid', y > 60);
    fb.classList.toggle('show', y > innerHeight * 0.8);
    const p = Math.min(1, y / h);
    fill.style.height = (p * 100) + '%';
    drop.style.transform = `translateY(${p * fill.parentElement.clientHeight - 6}px)`;
    const r = stepsBox.getBoundingClientRect();
    const sp = Math.max(0, Math.min(1, (innerHeight * 0.65 - r.top) / r.height));
    path.style.strokeDashoffset = 600 - sp * 600;
    steps.forEach(li => li.classList.toggle('lit', li.getBoundingClientRect().top < innerHeight * 0.65));
    let cur = ''; secs.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = s.id; });
    navLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur));
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger'), links = $('#links');
  const setMenu = open => { links.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); document.body.style.overflow = open ? 'hidden' : ''; };
  burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  $$('.links a, .links button').forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- Hero bubbles ---------- */
  const cv = $('#bubbles');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d'); let W, H; const bs = [];
    const size = () => { const d = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    size(); addEventListener('resize', size);
    for (let i = 0; i < (innerWidth < 640 ? 26 : 55); i++) bs.push({ x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 4, s: .15 + Math.random() * .5, w: Math.random() * 6.28, a: .08 + Math.random() * .25 });
    let mx = -999, my = -999, vis = true;
    cv.parentElement.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    new IntersectionObserver(([e]) => vis = e.isIntersecting).observe(cv);
    (function tick() {
      if (vis) {
        ctx.clearRect(0, 0, W, H);
        for (const b of bs) {
          b.y -= b.s; b.w += .01; b.x += Math.sin(b.w) * .3;
          const dx = b.x - mx, dy = b.y - my, d = Math.hypot(dx, dy);
          if (d < 110 && d > 0) { b.x += dx / d * 1.6; b.y += dy / d * 1.6; }
          if (b.y < -10) { b.y = H + 10; b.x = Math.random() * W; }
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.28);
          ctx.strokeStyle = `rgba(243,227,181,${b.a})`; ctx.lineWidth = 1; ctx.stroke();
          ctx.fillStyle = `rgba(243,227,181,${b.a * .25})`; ctx.fill();
        }
      }
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- Pointer motion ---------- */
  if (!reduce && fine) {
    const stage = $('.bag-stage');
    $('.hero').addEventListener('pointermove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      stage.style.translate = `${x * -24}px ${y * -18}px`;
      $$('.chip').forEach((c, i) => c.style.translate = `${x * (14 + i * 8)}px ${y * (10 + i * 6)}px`);
    });
    $$('.magnet').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; });
      b.addEventListener('pointerleave', () => b.style.transform = '');
    });
    $$('.tilt').forEach(t => {
      t.addEventListener('pointermove', e => { const r = t.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; t.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`; });
      t.addEventListener('pointerleave', () => t.style.transform = '');
    });
  }

  /* ---------- Drip rail ---------- */
  const rail = $('#rail'), bar = $('#railbar');
  const upd = () => { const max = rail.scrollWidth - rail.clientWidth; const w = rail.clientWidth / rail.scrollWidth * 100; bar.style.width = w + '%'; bar.style.left = (max ? rail.scrollLeft / max : 0) * (100 - w) + '%'; };
  rail.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  $('#prev').onclick = () => rail.scrollBy({ left: -344, behavior: 'smooth' });
  $('#next').onclick = () => rail.scrollBy({ left: 344, behavior: 'smooth' });

  /* ---------- Treatment tabs ---------- */
  const ink = $('.tab-ink');
  const moveInk = t => { ink.style.left = t.offsetLeft + 'px'; ink.style.width = t.offsetWidth + 'px'; };
  $$('.tab').forEach(t => t.addEventListener('click', () => {
    $$('.tab').forEach(x => { x.classList.toggle('on', x === t); x.setAttribute('aria-selected', x === t); });
    $$('.tpanel').forEach(p => { const on = p.dataset.panel === t.dataset.tab; p.hidden = !on; p.classList.toggle('on', on); });
    moveInk(t);
  }));
  requestAnimationFrame(() => moveInk($('.tab.on'))); addEventListener('resize', () => moveInk($('.tab.on')));

  /* ---------- Countdown ---------- */
  function tickCd() {
    let s = Math.max(0, (PROMO_END - Date.now()) / 1000);
    const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60); s = Math.floor(s - m * 60);
    $('#cd-d').textContent = String(d).padStart(2, '0'); $('#cd-h').textContent = String(h).padStart(2, '0');
    $('#cd-m').textContent = String(m).padStart(2, '0'); $('#cd-s').textContent = String(s).padStart(2, '0');
  }
  tickCd(); setInterval(tickCd, 1000);

  /* ---------- Branches ---------- */
  const mapFrame = $('#mapFrame');
  const mapSrc = b => `https://maps.google.com/maps?q=${encodeURIComponent(b.q)}&z=16&output=embed`;
  function renderBranches(sel = 'timog') {
    $('#branchList').innerHTML = BRANCHES.map(b => {
      const st = status(b);
      return `<div class="branch reveal in ${b.id === sel ? 'on' : ''}" data-b="${b.id}" role="button" tabindex="0" aria-pressed="${b.id === sel}">
        <h3>${b.name} <span class="status ${st.open ? 'open' : ''}"><i></i>${st.text}</span></h3>
        <p>${b.addr}</p>
        <div class="meta"><span>Tue–Sun · ${fmtH(b.open)}–${fmtH(b.close)}</span>${b.phones.map(p => `<a href="tel:${p.replace(/[^0-9+]/g, '')}">${p}</a>`).join('')}</div>
        <button class="bk" data-book data-branch="${b.id}">Book at this branch →</button></div>`;
    }).join('');
    const b = BRANCHES.find(x => x.id === sel);
    if (mapFrame.dataset.b !== sel) { mapFrame.src = mapSrc(b); mapFrame.dataset.b = sel; }
  }
  let curBranch = 'timog';
  renderBranches();
  setInterval(() => renderBranches(curBranch), 60000);
  $('#branchList').addEventListener('click', e => { const c = e.target.closest('.branch'); if (c && !e.target.closest('[data-book],a')) { curBranch = c.dataset.b; renderBranches(curBranch); } });
  $('#branchList').addEventListener('keydown', e => { const c = e.target.closest('.branch'); if (c && (e.key === 'Enter' || e.key === ' ') && e.target === c) { e.preventDefault(); curBranch = c.dataset.b; renderBranches(curBranch); $(`.branch[data-b="${curBranch}"]`).focus(); } });

  /* ---------- Modal helpers ---------- */
  let lastFocus;
  function openModal(m) { lastFocus = document.activeElement; m.hidden = false; document.body.style.overflow = 'hidden'; }
  function closeModal(m) { m.hidden = true; document.body.style.overflow = ''; lastFocus && lastFocus.focus && lastFocus.focus(); }
  document.addEventListener('keydown', e => {
    const m = $$('.modal').find(x => !x.hidden);
    if (m) {
      if (e.key === 'Escape') closeModal(m);
      if (e.key === 'Tab') {
        const f = $$('button:not(:disabled),input,select,a[href]', m).filter(x => x.offsetParent);
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
        else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
      }
    } else if (e.key === 'Escape' && !chat.hidden) closeChat();
  });

  /* ---------- BOOKING ---------- */
  const bm = $('#book'), B = { branch: null, service: null, date: null, time: null, step: 0 };
  const sel = $('#bService');
  sel.innerHTML = Object.entries(SERVICES).map(([g, list]) => `<optgroup label="${g}">${list.map(s => `<option>${esc(s)}</option>`).join('')}</optgroup>`).join('');
  $('#bBranches').innerHTML = BRANCHES.map(b => `<button type="button" class="bopt" data-id="${b.id}"><span><b>${b.name}</b><small>${b.addr}</small></span><small>Tue–Sun<br> ${fmtH(b.open)}–${fmtH(b.close)}</small></button>`).join('');
  $('#bBranches').addEventListener('click', e => { const o = e.target.closest('.bopt'); if (!o) return; B.branch = o.dataset.id; $$('.bopt').forEach(x => x.classList.toggle('on', x === o)); B.time = null; refreshNav(); setTimeout(() => go(1), 250); });
  sel.addEventListener('change', () => { B.service = sel.value; refreshNav(); });

  let calY, calM;
  function today() { const n = phNow(); return new Date(n.y, n.m, n.d); }
  function renderCal() {
    const t = today(), first = new Date(calY, calM, 1), days = new Date(calY, calM + 1, 0).getDate();
    const max = new Date(t); max.setDate(max.getDate() + 60);
    $('#calTitle').textContent = first.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
    $('#calPrev').disabled = calY === t.getFullYear() && calM === t.getMonth();
    $('#calNext').disabled = new Date(calY, calM + 1, 1) > max;
    let h = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => `<span class="dow">${d}</span>`).join('');
    for (let i = 0; i < first.getDay(); i++) h += '<span></span>';
    for (let d = 1; d <= days; d++) {
      const dt = new Date(calY, calM, d), dis = dt < t || dt > max || dt.getDay() === 1;
      const isSel = B.date && dt.getTime() === B.date.getTime();
      h += `<button type="button" data-d="${d}" ${dis ? 'disabled' : ''} class="${isSel ? 'sel' : ''} ${dt.getTime() === t.getTime() ? 'today' : ''}" aria-label="${dt.toDateString()}${dt.getDay() === 1 ? ' (closed)' : ''}">${d}</button>`;
    }
    $('#calGrid').innerHTML = h;
  }
  $('#calGrid').addEventListener('click', e => { const b = e.target.closest('button[data-d]'); if (!b) return; B.date = new Date(calY, calM, +b.dataset.d); B.time = null; renderCal(); renderSlots(); refreshNav(); });
  $('#calPrev').onclick = () => { calM--; if (calM < 0) { calM = 11; calY--; } renderCal(); };
  $('#calNext').onclick = () => { calM++; if (calM > 11) { calM = 0; calY++; } renderCal(); };
  function renderSlots() {
    const g = $('#slotGrid');
    if (!B.date) { $('#slotTitle').textContent = 'Pick a date'; g.innerHTML = ''; return; }
    const br = BRANCHES.find(b => b.id === B.branch), n = phNow();
    const isToday = B.date.getTime() === today().getTime();
    $('#slotTitle').textContent = B.date.toLocaleDateString('en-PH', { weekday: 'long', month: 'short', day: 'numeric' });
    let h = '';
    for (let t = br.open; t <= br.close - 1; t += 0.5) {
      const past = isToday && t <= n.h + n.min / 60 + 1;
      h += `<button type="button" data-t="${t}" ${past ? 'disabled' : ''} class="${B.time === t ? 'sel' : ''}">${fmtH(t)}</button>`;
    }
    g.innerHTML = h || '<p class="hint">No more times today. Please pick another date.</p>';
    if (!$('button:not(:disabled)', g)) g.innerHTML = '<p class="hint">No more times today. Please pick another date.</p>';
  }
  $('#slotGrid').addEventListener('click', e => { const b = e.target.closest('button[data-t]'); if (!b) return; B.time = +b.dataset.t; renderSlots(); refreshNav(); });

  const panes = $$('.bpane'), stepsEl = $$('#bsteps li'), bNext = $('#bNext'), bBack = $('#bBack'), bnav = $('#bnav');
  function canNext() { return [B.branch, B.service, B.date && B.time != null, true][B.step]; }
  function refreshNav() { bNext.disabled = !canNext(); bBack.style.visibility = B.step ? 'visible' : 'hidden'; bNext.style.display = B.step >= 3 ? 'none' : ''; }
  function go(s) {
    B.step = s;
    panes.forEach(p => p.classList.toggle('on', +p.dataset.step === s));
    stepsEl.forEach((li, i) => { li.classList.toggle('on', i === s); li.classList.toggle('done', i < s); });
    $('#bsteps').hidden = s === 4; bnav.hidden = s === 4; $('#bookT').hidden = s === 4; $('.kicker', bm).hidden = s === 4;
    if (s === 1 && !B.service) { B.service = sel.value; }
    if (s === 2) { const t = today(); if (calY == null) { calY = t.getFullYear(); calM = t.getMonth(); } renderCal(); renderSlots(); }
    if (s === 3) $('#bSummary').innerHTML = summaryHTML();
    refreshNav();
    const f = $('.bpane.on button:not(:disabled), .bpane.on select, .bpane.on input', bm); f && setTimeout(() => f.focus(), 60);
  }
  bNext.onclick = () => canNext() && go(B.step + 1);
  bBack.onclick = () => go(Math.max(0, B.step - 1));
  $('#bsteps').addEventListener('click', e => { const i = $$('#bsteps li').indexOf(e.target.closest('li')); if (i > -1 && i < B.step) go(i); });
  const brName = () => BRANCHES.find(b => b.id === B.branch);
  const dateTxt = () => B.date.toLocaleDateString('en-PH', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) + ', ' + fmtH(B.time);
  function summaryHTML() { const b = brName(); return `<b>Branch:</b> ${b.name}<br><b>Service:</b> ${esc(B.service)}<br><b>Schedule:</b> ${dateTxt()}`; }

  function openBooking(opts = {}) {
    Object.assign(B, { branch: opts.branch || B.branch, service: opts.service || B.service, time: null, date: null });
    if (opts.service) sel.value = opts.service;
    if (opts.service && sel.value !== opts.service) { const o = new Option(opts.service, opts.service); sel.add(o, 0); sel.value = opts.service; }
    B.service = sel.value;
    $$('.bopt').forEach(x => x.classList.toggle('on', x.dataset.id === B.branch));
    openModal(bm);
    go(B.branch ? (opts.service ? 2 : 1) : 0);
  }
  let via = 'wa';
  $$('.send-row button').forEach(b => b.addEventListener('click', () => via = b.dataset.via));
  $('#bForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target), b = brName();
    const msg = `Hi Drs'. Drip! I'd like to book a visit.\n\nName: ${fd.get('name')}\nMobile: ${fd.get('phone')}\nBranch: ${b.name}\nService: ${B.service}\nPreferred schedule: ${dateTxt()}` + (fd.get('notes') ? `\nNotes: ${fd.get('notes')}` : '') + `\n\n(Sent from the Drs'. Drip website)`;
    let url, note;
    if (via === 'wa') { url = `https://wa.me/${b.wa}?text=${encodeURIComponent(msg)}`; note = 'We opened WhatsApp with your booking details. Just press send.'; }
    else if (via === 'ms') { try { await navigator.clipboard.writeText(msg); } catch {} url = 'https://m.me/DrsDrip'; note = 'We copied your booking details. Paste them in Messenger and press send.'; }
    else { url = `mailto:contact@drsdriplounge.com?subject=${encodeURIComponent('Booking request · ' + B.service)}&body=${encodeURIComponent(msg)}`; note = 'We opened your email app with your booking details. Just press send.'; }
    window.open(url, '_blank', 'noopener');
    try { const all = JSON.parse(localStorage.getItem('drsdrip-bookings') || '[]'); all.push({ branch: b.name, service: B.service, when: dateTxt(), at: Date.now() }); localStorage.setItem('drsdrip-bookings', JSON.stringify(all.slice(-5))); } catch {}
    // calendar file
    const s = new Date(B.date); s.setHours(Math.floor(B.time), (B.time % 1) * 60);
    const en = new Date(s.getTime() + 60 * 60000);
    const f = d => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Drs Drip//Booking//EN', 'BEGIN:VEVENT', `UID:${Date.now()}@drsdrip`, `DTSTART;TZID=Asia/Manila:${f(s)}`, `DTEND;TZID=Asia/Manila:${f(en)}`, `SUMMARY:Drs'. Drip · ${B.service} (to be confirmed)`, `LOCATION:${b.addr}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    $('#icsLink').href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    $('#doneText').textContent = note + ' The team will confirm your schedule.';
    e.target.reset(); go(4);
    const sp = $('.fill-drop span', bm); sp.style.animation = 'none'; sp.offsetHeight; sp.style.animation = '';
  });

  /* ---------- Global clicks ---------- */
  document.addEventListener('click', e => {
    const bk = e.target.closest('[data-book]');
    if (bk) { e.preventDefault(); if (!chat.hidden && bk.closest('.chat')) closeChat(); openBooking({ service: bk.dataset.pick, branch: bk.dataset.branch }); return; }
    const ch = e.target.closest('[data-chat]');
    if (ch) { e.preventDefault(); openChat(); return; }
    if (e.target.closest('[data-close]')) { closeModal(e.target.closest('.modal')); return; }
    if (e.target.classList.contains('modal')) closeModal(e.target);
  });

  /* ---------- DR. DRIP CHAT ---------- */
  const chat = $('#chat'), log = $('#chatLog'), chips = $('#chatChips'), fab = $('.chat-fab');
  const allBranches = () => BRANCHES.map(b => { const st = status(b); return `<li><b>${b.name}</b>: ${b.addr}. Tue–Sun, ${fmtH(b.open)}–${fmtH(b.close)}. <i>${st.text}</i></li>`; }).join('');
  const BOOK = (svc, label = 'Book now') => ({ t: label, book: svc || '' });
  const K = [
    { k: ['hi', 'hello', 'hey', 'kumusta', 'musta', 'good morning', 'good afternoon', 'good evening', 'yo'], a: () => ["Hi! I'm <b>Dr. Drip</b> 💚 I can tell you about our IV drips, skin treatments, promos, branches and hours, or help you book a visit. What would you like to know?"] },
    { k: ['price', 'prices', 'magkano', 'how much', 'cost', 'presyo', 'rate', 'rates', 'promo', 'promos', 'discount', 'package', 'packages', 'sale', 'anniversary', 'deal', 'deals', 'mura'], w: 0.9, a: () => [`Our <b>13th Anniversary specials</b> run until Dec 31, 2026, with up to 60% off:<ul><li>Platinum Ultra White, 23 sessions: <b>₱85,000</b></li><li>Royal Cinderella, 23 sessions: <b>₱70,000</b></li><li>Myers' Plus Drip, 23 sessions: <b>₱105,000</b></li><li>NAD Ultimate Drip, 15 sessions: <b>₱60,000</b></li><li>Youthful Radiance, 15 sessions: <b>₱39,999</b></li><li>Skin Booster PRP, 4 sessions: <b>₱15,000</b></li></ul>There's also the <b>₱30K Anniversary Edit</b> face combos. For single-session prices, message the team.`, [{ t: 'See all specials', go: '#specials' }, BOOK('', 'Book a visit')]] },
    { k: ['where', 'saan', 'branch', 'branches', 'location', 'address', 'near', 'mandaluyong', 'timog', 'capitol', 'soho', 'shaw', 'qc', 'quezon', 'directions', 'map'], a: () => [`We have 3 branches:<ul>${allBranches()}</ul>`, [{ t: 'Open map', go: '#branches' }, BOOK('', 'Book a visit')]] },
    { k: ['open', 'hours', 'oras', 'bukas', 'sarado', 'closed', 'close', 'monday', 'sunday', 'holiday', 'time', 'anong oras', 'today'], a: () => [`We're open <b>Tuesday to Sunday</b> and closed on Mondays. Here's each branch right now (PH time):<ul>${allBranches()}</ul>`, [BOOK('', 'Book a visit')]] },
    { k: ['book', 'booking', 'appointment', 'reserve', 'reservation', 'pa book', 'pabook', 'magpabook', 'schedule', 'sched', 'slot', 'walk in', 'walkin'], a: () => ["Sure! Pick your branch, service, date and time, and I'll send the request to the team through WhatsApp, Messenger or email. Walk-ins depend on availability, so booking first is best.", [BOOK('', 'Start booking')]] },
    { k: ['contact', 'phone', 'number', 'call', 'email', 'whatsapp', 'messenger', 'viber', 'text', 'tawag', 'landline'], a: () => [`You can reach us here:<ul><li>Timog (Main): <b>0917 896 4599</b> / (02) 8373 4685</li><li>SOHO Central: <b>0917 129 5515</b> / (02) 8631 7788</li><li>Email: <b>contact@drsdriplounge.com</b></li><li>WhatsApp: +63 917 896 4599</li></ul>`, [{ t: 'WhatsApp us', href: 'https://wa.me/639178964599' }, { t: 'Messenger', href: 'https://m.me/DrsDrip' }]] },
    { k: ['safe', 'ligtas', 'side effect', 'side effects', 'risk', 'risks', 'pregnant', 'buntis', 'breastfeeding', 'allergy', 'allergic', 'kidney', 'danger', 'delikado', 'fda'], a: () => ["Your safety comes first. <b>All services are subject to medical assessment and physician approval.</b> A physician checks your health history, medicines and allergies before any drip. If you're pregnant, breastfeeding, or have kidney, heart or other conditions, tell the doctor. They'll let you know whether a treatment is right for you. Please don't try IV drips at home.", [BOOK('Consultation (a physician will guide me)', 'Book a consultation')]] },
    { k: ['what is iv', 'iv drip', 'iv therapy', 'how does it work', 'ano ang iv', 'infusion', 'drip'], a: () => ["IV drip therapy gives vitamins, minerals and antioxidants straight into your bloodstream through a small line in your arm. You relax in our lounge chair while a nurse watches your drip. We've been doing this since <b>2013</b>, as the first IV drip lounge in the Philippines.", [{ t: 'See our drips', go: '#drips' }]] },
    { k: ['platinum', 'cinderella', 'difference', 'vs', 'versus', 'compare', 'which'], w: 2, a: () => ["Good question! Here's the difference:<ul><li><b>Platinum Ultra White</b> is glutathione-focused, with high glutathione for antioxidant support. It's made with brighter, more luminous-looking skin in mind.</li><li><b>Royal Cinderella</b> is a multi-ingredient drip with Vitamin C and glutathione, for a refreshed, glowing look.</li></ul>A physician will tell you which one suits you.", [BOOK('Platinum Ultra White', 'Book Platinum'), BOOK('Royal Cinderella IV Drip', 'Book Cinderella')]] },
    { k: ['glutathione', 'gluta', 'whitening', 'white', 'puti', 'pumuti', 'brighten', 'brightening', 'glow', 'glowing', 'skin drip', 'radiant'], a: () => ["For glowing skin, our favorites are <b>Platinum Ultra White</b> (high glutathione) and <b>Royal Cinderella</b> (Vitamin C + glutathione). Glutathione is an antioxidant that helps protect your cells and support skin wellness. Results vary from person to person.", [BOOK('Platinum Ultra White', 'Book Platinum'), BOOK('Royal Cinderella IV Drip', 'Book Cinderella')]] },
    { k: ['myers', 'energy', 'pagod', 'tired', 'fatigue', 'hangover', 'immune', 'immunity', 'sick', 'sakit', 'flu', 'vitamins', 'recharge'], a: () => ["Feeling tired or run-down? <b>Myers' Plus Drip</b> is our take on the classic vitamin-and-mineral drip. <b>Regen C</b> is a vitamin C drip for cellular renewal. A physician will check which one fits you.", [BOOK("Myers' Plus Drip", "Book Myers' Plus"), BOOK('Regen C Cellular Renewal', 'Book Regen C')]] },
    { k: ['nad', 'nad+', 'aging', 'anti aging', 'antiaging', 'longevity', 'cellular'], a: () => ["<b>NAD+</b> is a coenzyme your cells use to make energy, run metabolism and repair DNA. Research on NAD+ IV therapy in people is still developing, so talk with our medical team to see if it's right for you. Our <b>NAD Ultimate Drip</b> package is ₱60,000 for 15 sessions.", [BOOK('NAD Ultimate Drip', 'Book NAD')]] },
    { k: ['youthful', 'radiance', 'placenta', 'collagen'], a: () => ["<b>Youthful Radiance</b> is our formulation with placenta extract and collagen, made to support skin renewal and a youthful glow. The anniversary package is ₱39,999 for 15 sessions.", [BOOK('Youthful Radiance IV Drip', 'Book Youthful Radiance')]] },
    { k: ['regen', 'vitamin c', 'vit c'], a: () => ["<b>Regen C</b> is a physician-guided vitamin C IV drip that supports your body's natural renewal. It's one of our anniversary specials.", [BOOK('Regen C Cellular Renewal', 'Book Regen C')]] },
    { k: ['weight', 'lose', 'loss', 'pumayat', 'payat', 'taba', 'fat', 'glp', 'glp-1', 'glp1', 'metabolic', 'diet', 'slim', 'mounjaro', 'ozempic', 'tirzepatide', 'sugar', 'diabetes'], a: () => ["Our <b>90-Day Metabolic Program</b> goes beyond weight loss. It's physician-guided: a health assessment, a personal plan, nutrition and lifestyle guidance, and progress checks. <b>GLP-1 or GIP/GLP-1 treatment</b> is used only when it's medically right for you and under supervision.", [BOOK('90-Day Metabolic Program', 'Book a consult')]] },
    { k: ['juvelook', 'rejuran', 'exosome', 'exosomes', 'prp', 'booster', 'pores', 'acne', 'scar', 'scars', 'texture', 'dull', 'rejuvenation', 'msc', 'pdrn'], a: () => ["Our skin rejuvenation treatments:<ul><li><b>Juvelook</b>: a collagen-stimulating booster for texture and elasticity</li><li><b>Rejuran</b>: polynucleotides (PN) that repair and strengthen skin</li><li><b>Exosomes</b>: regenerative therapy for overall rejuvenation</li><li><b>Skin Booster PRP</b>: uses your own platelet-rich plasma (4 sessions for ₱15,000)</li><li><b>MSC Youth Revive</b></li></ul>", [{ t: 'See treatments', go: '#treatments' }, BOOK('Consultation (a physician will guide me)', 'Book a consult')]] },
    { k: ['botox', 'wrinkle', 'wrinkles', 'lines', 'thread', 'lift', 'ulthera', 'ultherapy', 'sagging', 'jawline', 'vshape', 'v shape', 'contour', 'airetox', 'face'], a: () => ["For lifting and contouring:<ul><li><b>Botox</b> smooths frown and forehead lines</li><li><b>Duolift COG Thread Lift</b> uses dissolvable threads to lift and boost collagen</li><li><b>3D Maxi Lift · Ulthera Prime</b> lifts with ultrasound</li><li><b>Airetox + Zero</b> refines contours and pores</li></ul>Ask about the <b>₱30K Anniversary Edit</b> combos!", [BOOK('Botox', 'Book Botox'), BOOK('₱30K Anniversary Edit', '₱30K Edit')]] },
    { k: ['laser', 'hair removal', 'buhok', 'underarm', 'kili', 'kilikili', 'diode', 'bikini', 'legs'], a: () => ["We offer <b>EOS Diode Laser Hair Removal</b>, and there's an <b>Unlimited</b> anniversary special for smoother skin.", [BOOK('EOS Diode Laser Hair Removal', 'Book laser')]] },
    { k: ['how long', 'gaano katagal', 'tagal', 'minutes', 'duration', 'oras ba'], a: () => ["It depends on the drip or treatment you choose. The team will tell you the exact time when they confirm your booking, so you can plan your day."] },
    { k: ['how often', 'ilang beses', 'sessions', 'session', 'frequency', 'weekly'], a: () => ["Your physician will suggest how often based on your goals. Our packages come in <b>4, 15 or 23 sessions</b>, and the more sessions you choose, the more you save."] },
    { k: ['pay', 'payment', 'gcash', 'card', 'cash', 'bayad', 'credit', 'installment'], a: () => ["Promo packages are priced for <b>cash or card</b> payment. They can't be combined with other promos and aren't transferable. For GCash or other options, please ask the team.", [{ t: 'Ask on WhatsApp', href: 'https://wa.me/639178964599' }]] },
    { k: ['who', 'about', 'history', 'first', 'since', 'founded', 'story', 'kailan', 'pioneer'], a: () => ["Drs'. Drip Lounge & Infusion Bar <b>pioneered IV drip therapy in the Philippines in 2013</b>, as the 1st IV Drip Lounge in the country. This year we celebrate <b>13 years</b>, with 3 branches and 130K followers. 94% of 230 reviewers recommend us 💚"] },
    { k: ['doctor', 'doctors', 'physician', 'derma', 'dermatologist', 'nurse', 'nurses', 'staff'], a: () => ["Every treatment is guided by our medical team. A <b>physician assesses and approves</b> each service, and trained nurses run and watch your drip. One guest wrote: “With knowledgeable and experienced dermatologists present, you know you’re in safe hands.”"] },
    { k: ['my booking', 'my appointment', 'booked', 'na book ko'], a: () => { let l = []; try { l = JSON.parse(localStorage.getItem('drsdrip-bookings') || '[]'); } catch {} return l.length ? [`Here's what you requested on this device:<ul>${l.map(x => `<li>${esc(x.service)} · ${esc(x.branch)} · ${esc(x.when)}</li>`).join('')}</ul>The team confirms each one by message.`] : ["I don't see any booking requests from this device yet.", [BOOK('', 'Book a visit')]]; } },
    { k: ['thanks', 'thank you', 'salamat', 'ty', 'tnx', 'ok', 'okay', 'sige'], a: () => ['You’re welcome! 💚 Anything else I can help with?'] }
  ];
  const norm = s => ' ' + s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9+\s-]/g, ' ').replace(/\s+/g, ' ') + ' ';
  function reply(q) {
    const t = norm(q); let best = null, score = 0;
    for (const it of K) {
      let s = 0; for (const k of it.k) if (t.includes(' ' + k + ' ') || (k.length > 4 && t.includes(k))) s += (k.includes(' ') ? 2 : 1) * (it.w || 1);
      if (s > score) { score = s; best = it; }
    }
    if (!best) return ["I'm not sure about that one yet. You can ask me about <b>drips, prices, branches, hours, safety</b> or <b>booking</b>, or chat with our team directly.", [{ t: 'WhatsApp the team', href: 'https://wa.me/639178964599' }, BOOK('', 'Book a visit')]];
    return best.a();
  }
  function add(html, who = 'bot', acts) {
    const d = document.createElement('div'); d.className = 'msg ' + who; d.innerHTML = html;
    if (acts && acts.length) {
      const a = document.createElement('div'); a.className = 'acts';
      acts.forEach(x => {
        if (x.href) a.insertAdjacentHTML('beforeend', `<a href="${x.href}" target="_blank" rel="noopener">${x.t}</a>`);
        else if (x.go) { const b = document.createElement('button'); b.textContent = x.t; b.onclick = () => { closeChat(); document.querySelector(x.go).scrollIntoView({ behavior: 'smooth' }); }; a.append(b); }
        else a.insertAdjacentHTML('beforeend', `<button data-book data-pick="${esc(x.book)}">${x.t}</button>`);
      });
      d.append(a);
    }
    log.append(d); log.scrollTop = log.scrollHeight;
  }
  function ask(q) {
    if (!q.trim()) return;
    add(esc(q), 'me');
    const ty = document.createElement('div'); ty.className = 'msg bot typing'; ty.innerHTML = '<i></i><i></i><i></i>'; log.append(ty); log.scrollTop = log.scrollHeight;
    setTimeout(() => { ty.remove(); const [h, acts] = reply(q); add(h, 'bot', acts); }, 650 + Math.random() * 500);
  }
  const CHIPS = ['Promos & prices', 'Branches & hours', 'Book a visit', 'Platinum vs Cinderella', 'Is it safe?', 'Weight program', 'Contact numbers'];
  chips.innerHTML = CHIPS.map(c => `<button type="button">${c}</button>`).join('');
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (b) ask(b.textContent); });
  $('#chatForm').addEventListener('submit', e => { e.preventDefault(); const i = $('#chatIn'); ask(i.value); i.value = ''; });
  let greeted = false;
  function openChat() {
    chat.hidden = false; fab.style.display = 'none';
    if (!greeted) { greeted = true; const st = status(BRANCHES[0]); add(`Hi! I'm <b>Dr. Drip</b> 💚, the Drs'. Drip assistant. Ask me about drips, skin treatments, promos, branches or booking.<br><small style="color:#5a6f67">Timog main branch: ${st.text}</small>`); }
    setTimeout(() => $('#chatIn').focus(), 100);
  }
  function closeChat() { chat.hidden = true; fab.style.display = ''; }
  $('[data-chat-close]').onclick = closeChat;
})();
