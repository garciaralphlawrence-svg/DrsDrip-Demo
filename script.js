(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Split headline into words for the rise animation
  $$('.split').forEach(el => {
    const words = el.innerHTML.split(/\s+|&nbsp;/).filter(Boolean);
    el.innerHTML = words.map((w, i) => `<span class="w"><span style="transition-delay:${0.15 + i * 0.09}s">${w === 'drop' ? '<em>drop</em>' : w}</span></span>`).join(' ');
    requestAnimationFrame(() => setTimeout(() => el.classList.add('in'), 120));
  });

  // Reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = ((i % 4) * 0.08) + 's'; io.observe(el); });

  // Count-up stats
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const end = +e.target.dataset.count; let n = 0;
    const t = setInterval(() => { n++; e.target.textContent = n; if (n >= end) clearInterval(t); }, 220);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  // Nav state, IV scroll line, floating button, step line
  const nav = $('#nav'), fill = $('.ivfill'), drop = $('.ivdrop'), fb = $('.float-book');
  const steps = $$('.steps li'), path = $('#stepPath'), stepsBox = $('.steps');
  const secs = $$('main section[id]'), navLinks = $$('.links a');
  function onScroll() {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('solid', y > 60);
    fb.classList.toggle('show', y > innerHeight * 0.8);
    const p = Math.min(1, y / h);
    const lineH = fill.parentElement.clientHeight;
    fill.style.height = (p * 100) + '%';
    drop.style.transform = `translateY(${p * lineH - 6}px)`;
    if (stepsBox) {
      const r = stepsBox.getBoundingClientRect();
      const sp = Math.max(0, Math.min(1, (innerHeight * 0.65 - r.top) / r.height));
      path.style.strokeDashoffset = 600 - sp * 600;
      steps.forEach(li => li.classList.toggle('lit', li.getBoundingClientRect().top < innerHeight * 0.65));
    }
    let cur = '';
    secs.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = s.id; });
    navLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur));
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Mobile menu
  const burger = $('#burger'), links = $('#links');
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.links a, .links button').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open'); burger.setAttribute('aria-expanded', false); document.body.style.overflow = '';
  }));

  // Hero bubbles canvas
  const cv = $('#bubbles');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d'); let W, H, dpr, bs = [];
    const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    const N = innerWidth < 640 ? 26 : 55;
    for (let i = 0; i < N; i++) bs.push({ x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 4, s: .15 + Math.random() * .5, w: Math.random() * 6.28, a: .08 + Math.random() * .25 });
    let mx = -999, my = -999;
    cv.parentElement.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    let visible = true;
    new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(cv);
    (function tick() {
      if (visible) {
        ctx.clearRect(0, 0, W, H);
        for (const b of bs) {
          b.y -= b.s; b.w += .01; b.x += Math.sin(b.w) * .3;
          const dx = b.x - mx, dy = b.y - my, d = Math.hypot(dx, dy);
          if (d < 110) { b.x += dx / d * 1.6; b.y += dy / d * 1.6; }
          if (b.y < -10) { b.y = H + 10; b.x = Math.random() * W; }
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.28);
          ctx.strokeStyle = `rgba(159,227,220,${b.a})`; ctx.lineWidth = 1; ctx.stroke();
          ctx.fillStyle = `rgba(159,227,220,${b.a * .25})`; ctx.fill();
        }
      }
      requestAnimationFrame(tick);
    })();
  }

  // Hero bag parallax with pointer
  const stage = $('.bag-stage');
  if (stage && !reduce && matchMedia('(pointer:fine)').matches) {
    $('.hero').addEventListener('pointermove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      stage.style.translate = `${x * -24}px ${y * -18}px`;
      $$('.chip').forEach((c, i) => c.style.translate = `${x * (14 + i * 8)}px ${y * (10 + i * 6)}px`);
    });
  }

  // Magnetic buttons
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    $$('.magnet').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; });
      b.addEventListener('pointerleave', () => b.style.transform = '');
    });
    // Tilt tiles
    $$('.tilt').forEach(t => {
      t.addEventListener('pointermove', e => { const r = t.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; t.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`; });
      t.addEventListener('pointerleave', () => t.style.transform = '');
    });
  }

  // Drip rail controls
  const rail = $('#rail'), bar = $('#railbar');
  const upd = () => { const max = rail.scrollWidth - rail.clientWidth; const w = rail.clientWidth / rail.scrollWidth * 100; bar.style.width = w + '%'; bar.style.left = (max ? rail.scrollLeft / max : 0) * (100 - w) + '%'; };
  rail.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  $('#prev').onclick = () => rail.scrollBy({ left: -354, behavior: 'smooth' });
  $('#next').onclick = () => rail.scrollBy({ left: 354, behavior: 'smooth' });

  // Modals
  let lastFocus;
  function open(id, pick) {
    const m = $('#' + id); lastFocus = document.activeElement;
    m.hidden = false; document.body.style.overflow = 'hidden';
    if (id === 'book') {
      $('.book-form', m).hidden = false; $('.book-done', m).hidden = true;
      if (pick) $('#dripSel').value = pick;
      const d = $('input[type=date]', m); d.min = new Date().toISOString().slice(0, 10);
    }
    if (id === 'finder') startFinder();
    setTimeout(() => ($('input,button.opt,select', m) || $('.x', m)).focus(), 60);
  }
  function close(m) { m.hidden = true; document.body.style.overflow = ''; lastFocus && lastFocus.focus(); }
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]');
    if (o) { e.preventDefault(); open(o.dataset.open, o.dataset.pick); return; }
    const c = e.target.closest('[data-close]');
    if (c) { close(c.closest('.modal')); return; }
    if (e.target.classList.contains('modal')) close(e.target);
  });
  document.addEventListener('keydown', e => {
    const m = $$('.modal').find(x => !x.hidden);
    if (!m) return;
    if (e.key === 'Escape') close(m);
    if (e.key === 'Tab') {
      const f = $$('button,input,select,a[href]', m).filter(x => x.offsetParent);
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  });
  $('#bookForm').addEventListener('submit', e => {
    e.preventDefault();
    const m = $('#book'); $('.book-form', m).hidden = true; const d = $('.book-done', m); d.hidden = false;
    const s = $('.fill-drop span', d); s.style.animation = 'none'; s.offsetHeight; s.style.animation = '';
    e.target.reset(); $('button', d).focus();
  });

  // Drip finder quiz
  const DR = {
    glow: { name: 'Glow Drip', c1: '#f6d7c3', c2: '#e9a98b', why: 'You want brighter, fresher-looking skin. This is the lounge’s most requested drip.' },
    energy: { name: 'Energy Boost', c1: '#f7e7a8', c2: '#e2b84f', why: 'Your days are long and your energy runs low. Magnesium, B-complex and L-carnitine help you keep going.' },
    hydration: { name: 'Hydration', c1: '#c9eef0', c2: '#5fb8c4', why: 'Heat, travel or a late night has left you drained. Start with fluids and electrolytes.' },
    immunity: { name: 'Immunity Shield', c1: '#d6ecc9', c2: '#82b56b', why: 'You want to stay well. Vitamin C and zinc support your body’s defenses.' },
    recovery: { name: 'Recovery', c1: '#e0d4f3', c2: '#9b85c9', why: 'Your muscles need help bouncing back after training or a hard week.' }
  };
  const QS = [
    { q: 'What do you want most right now?', o: [['More energy', 'energy'], ['Glowing skin', 'glow'], ['To feel refreshed', 'hydration'], ['To stay well', 'immunity']] },
    { q: 'How was your past week?', o: [['Long work days', 'energy'], ['Sun, heat or travel', 'hydration'], ['Lots of training', 'recovery'], ['People sick around me', 'immunity']] },
    { q: 'How are you sleeping?', o: [['Not enough', 'energy'], ['Fine, but I wake up tired', 'recovery'], ['Well', 'glow'], ['Late nights out', 'hydration']] },
    { q: 'Pick the result you’d love after one session.', o: [['Fresher-looking skin', 'glow'], ['A clear head', 'energy'], ['Less sore muscles', 'recovery'], ['Feeling hydrated', 'hydration']] }
  ];
  let qi, score;
  const fbody = $('#fbody'), fprog = $('#fprog');
  function startFinder() { qi = 0; score = {}; renderQ(); }
  function renderQ() {
    fprog.style.width = (qi / QS.length * 100) + '%';
    if (qi >= QS.length) return renderResult();
    const q = QS[qi];
    fbody.innerHTML = `<div class="q-step"><p class="kicker">Drip finder · ${qi + 1} of ${QS.length}</p><h2 id="finderT">${q.q}</h2><div class="opts">${q.o.map(([t, k]) => `<button class="opt" data-k="${k}">${t}</button>`).join('')}</div></div>`;
    $$('.opt', fbody).forEach(b => b.onclick = () => { score[b.dataset.k] = (score[b.dataset.k] || 0) + 1; qi++; renderQ(); });
    setTimeout(() => $('.opt', fbody).focus(), 30);
  }
  function renderResult() {
    const k = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0], d = DR[k];
    fbody.innerHTML = `<div class="q-step result" style="--c1:${d.c1};--c2:${d.c2}"><div class="mini-bag"><span class="mini-liq"></span></div><div><p class="kicker">Your match</p><h2 id="finderT">${d.name}</h2><p>${d.why}</p><div class="hero-ctas"><button class="btn btn-solid" data-open="book" data-pick="${d.name}">Book this drip <span>→</span></button><button class="btn btn-ghost dark" id="again">Start again</button></div></div></div>`;
    $('#again').onclick = startFinder;
    $('[data-open=book]', fbody).addEventListener('click', () => { $('#finder').hidden = true; });
  }
})();
