/* Drs'. Drip — motion layer (GSAP + ScrollTrigger + SplitText + Lenis) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const body = document.body, loader = $('#loader');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const done = () => { body.classList.remove('is-loading'); if (loader) loader.remove(); };

  if (reduce || !window.gsap || !window.ScrollTrigger) { done(); return; }

  try {
    document.documentElement.classList.add('js');
    gsap.registerPlugin(ScrollTrigger, ...(window.SplitText ? [SplitText] : []));
    const E = 'power4.out', E2 = 'expo.out';
    const FULL = 78, EMPTY = 285; // liquid translateY inside the bag
    const liq = el => el.querySelector('.liq');

    /* ---------- smooth scroll ---------- */
    let lenis = null;
    if (window.Lenis) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      window.__lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      lenis.stop();
      $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
        const id = a.getAttribute('href'); if (id.length < 2) return;
        const t = $(id); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: id === '#top' ? 0 : -60, duration: 1.4 });
      }));
    }

    /* ---------- nav hides on scroll down ---------- */
    const nav = $('#nav'); let lastY = 0;
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => {
      const y = s.scroll(); nav.classList.toggle('hide', y > 300 && y > lastY && !$('#links').classList.contains('open')); lastY = y;
    } });

    const lines = el => new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'sl' }).lines;

    /* ---------- preloader → hero intro ---------- */
    $$('#heroTitle .ln').forEach(l => { const s = document.createElement('span'); s.innerHTML = l.innerHTML; l.innerHTML = ''; l.appendChild(s); });
    const intro = gsap.timeline({ paused: true })
      .fromTo('#heroMedia', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: 'expo.inOut' }, .2)
      .from('#liquid', { opacity: 0, scale: 1.2, duration: 2.4, ease: 'power2.out' }, 0)
      .from($$('#heroTitle .ln > span'), { yPercent: 115, rotate: 3, duration: 1.4, stagger: .1, ease: E2 }, .5)
      .from('.hero-kicker span', { y: 20, opacity: 0, duration: 1, stagger: .08, ease: E2 }, .7)
      .from('.hero-lede, .hero-cta > *', { y: 26, opacity: 0, duration: 1.1, stagger: .08, ease: E2 }, .95)
      .from('.hero-bar span', { y: 16, opacity: 0, duration: 1, stagger: .08, ease: E2 }, 1.15)
      .from('.hero-cap', { opacity: 0, duration: 1 }, 1.4)
      .from('.nav > *', { y: -20, opacity: 0, duration: 1, stagger: .05, ease: E2 }, 1)
      .add(() => { lenis && lenis.start(); ScrollTrigger.refresh(); }, 1.2);

    const pre = gsap.timeline({ onComplete: () => { done(); if (intro.progress() === 0) intro.play(); } })
      .from('.loader-logo', { scale: .6, opacity: 0, duration: 1, ease: 'back.out(1.7)' })
      .from('.loader-sub span', { yPercent: 110, opacity: 0, duration: .9, stagger: .1, ease: E2 }, '<.3')
      .fromTo('.loader-drop', { y: -10, opacity: 0 }, { y: 200, opacity: 1, duration: .7, ease: 'power2.in', repeat: 1 }, '<.1')
      .to('#loaderFill', { height: '100%', duration: 1.6, ease: 'power2.inOut' }, 0)
      .to('.loader-mark', { y: -30, opacity: 0, duration: .55, ease: 'power3.in' }, '+=.1')
      .to('#loader', { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'expo.inOut' }, '-=.1')
      .add(() => intro.play(), '<.35');
    setTimeout(() => { if (document.body.contains(loader)) pre.progress(1); }, 6000);

    /* hero parallax out */
    gsap.to('.hero-visual', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-copy', { yPercent: -22, opacity: .2, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* ---------- headings, labels, fades ---------- */
    $$('h2.split').forEach(h => {
      gsap.from(lines(h), { yPercent: 110, duration: 1.3, stagger: .1, ease: E2, scrollTrigger: { trigger: h, start: 'top 86%' } });
    });
    $$('.label').forEach(l => gsap.from(l, { opacity: 0, x: -20, duration: 1, ease: E, scrollTrigger: { trigger: l, start: 'top 92%' } }));
    $$('.fade-up').forEach(el => gsap.from(el, { y: 40, opacity: 0, duration: 1.2, ease: E, scrollTrigger: { trigger: el, start: 'top 90%' } }));

    /* ---------- velocity band ---------- */
    const band = $('#band');
    if (band) {
      const loop = gsap.to(band, { xPercent: -33.333, duration: 30, ease: 'none', repeat: -1 });
      ScrollTrigger.create({ trigger: '.band', start: 'top bottom', end: 'bottom top', onUpdate: s => {
        const v = Math.min(Math.abs(s.getVelocity()) / 280, 6);
        gsap.to(loop, { timeScale: (s.direction < 0 ? -1 : 1) * (1 + v), duration: .3, overwrite: true });
        gsap.to(loop, { timeScale: s.direction < 0 ? -1 : 1, duration: 1.2, delay: .3 });
      } });
    }

    /* ---------- story: words fill on scroll ---------- */
    const bq = $('#bigQuote');
    if (bq) {
      const words = new SplitText(bq, { type: 'words', wordsClass: 'w' }).words;
      gsap.to(words, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: bq, start: 'top 80%', end: 'bottom 50%', scrub: true } });
    }
    const team = $('.team');
    gsap.timeline({ scrollTrigger: { trigger: team, start: 'top 85%' } })
      .from(team, { clipPath: 'inset(0% 50% 0% 50%)', duration: 1.6, ease: 'expo.inOut' })
      .to(team.querySelector('img'), { scale: 1, duration: 2, ease: E2 }, 0);
    $$('[data-count]').forEach(b => {
      const end = +b.dataset.count, suf = b.dataset.suf || '', o = { v: 0 };
      gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: b, start: 'top 90%' }, onUpdate: () => { b.textContent = Math.round(o.v) + suf; } });
    });
    gsap.from('.stat-row > div', { y: 50, opacity: 0, duration: 1.2, stagger: .1, ease: E, scrollTrigger: { trigger: '.stat-row', start: 'top 90%' } });

    /* ---------- drips: pinned horizontal (desktop) ---------- */
    const mm = gsap.matchMedia();
    const panels = $$('.d-panel');
    mm.add('(min-width: 1025px)', () => {
      const track = $('#dripTrack');
      const dist = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '#dripPin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
      gsap.to('#dripBar', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#dripPin', start: 'top top', end: () => '+=' + dist(), scrub: true, invalidateOnRefresh: true } });
      panels.forEach(p => {
        gsap.fromTo(p.querySelector('.d-img img'), { xPercent: -6, scale: 1.15 }, { xPercent: 6, scale: 1.05, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
        gsap.from(p.querySelectorAll('.d-body > *, .d-body li'), { y: 40, opacity: 0, duration: 1, stagger: .05, ease: E, scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 72%' } });
      });
      gsap.from('.d-intro > *:not(h2)', { y: 30, opacity: 0, duration: 1, stagger: .1, ease: E, scrollTrigger: { trigger: '#dripPin', start: 'top 70%' } });
    });
    mm.add('(max-width: 1024px)', () => {
      panels.forEach(p => {
        gsap.timeline({ scrollTrigger: { trigger: p, start: 'top 85%' } })
          .from(p, { y: 70, opacity: 0, duration: 1.2, ease: E })
          .from(p.querySelector('.d-img'), { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, .1);
      });
    });

    /* ---------- visit: pinned, bag fills step by step ---------- */
    const steps = $$('#vsteps li');
    const vimgs = $$('.vphotos img');
    const setStep = i => { steps.forEach((li, k) => li.classList.toggle('on', k === i)); vimgs.forEach((im, k) => im.classList.toggle('on', k === i)); };
    mm.add('(min-width: 1025px)', () => {
      $('#vsteps').classList.add('pinned'); setStep(0);
      const tl = gsap.timeline({ scrollTrigger: { trigger: '#visitPin', start: 'top top', end: '+=240%', pin: true, scrub: 1, anticipatePin: 1,
        onUpdate: s => setStep(Math.min(3, Math.floor(s.progress * 4))),
        onLeave: () => steps.forEach(li => li.classList.add('on')), onEnterBack: s => setStep(3) } });
      tl.fromTo('.vphotos', { yPercent: -4 }, { yPercent: 4, ease: 'none', duration: 1 }, 0);
      return () => { $('#vsteps').classList.remove('pinned'); };
    });
    mm.add('(max-width: 1024px)', () => {
      gsap.fromTo(steps, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: .12, ease: E, scrollTrigger: { trigger: '#vsteps', start: 'top 85%' } });
    });

    /* ---------- treatments: rows + cursor preview ---------- */
    window.__animRows = panel => panel && gsap.from(panel.querySelectorAll('.trow'), { y: 30, opacity: 0, duration: .8, stagger: .06, ease: E, clearProps: 'opacity,transform' });
    ScrollTrigger.create({ trigger: '.tpanel.on', start: 'top 88%', once: true, onEnter: () => window.__animRows($('.tpanel.on')) });
    const tprev = $('#tprev');
    if (tprev && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const img = tprev.querySelector('img');
      gsap.set(tprev, { opacity: 0, scale: .6, xPercent: 0 });
      const xTo = gsap.quickTo(tprev, 'x', { duration: .6, ease: 'power3' }), yTo = gsap.quickTo(tprev, 'y', { duration: .6, ease: 'power3' });
      let rot = 0;
      addEventListener('pointermove', e => { xTo(e.clientX + 30); yTo(e.clientY - 150); });
      $$('.trow').forEach(r => {
        r.addEventListener('pointerenter', () => { img.src = r.dataset.img; rot = gsap.utils.random(-6, 6); gsap.to(tprev, { opacity: 1, scale: 1, rotate: rot, duration: .5, ease: E }); });
        r.addEventListener('pointerleave', () => gsap.to(tprev, { opacity: 0, scale: .6, duration: .4, ease: 'power2.in' }));
      });
    }

    /* ---------- specials ---------- */
    gsap.from('.prow', { y: 40, opacity: 0, duration: 1, stagger: .07, ease: E, scrollTrigger: { trigger: '.plist', start: 'top 85%' } });
    gsap.from('.pdots', { scaleX: 0, transformOrigin: 'left', duration: 1.4, stagger: .07, ease: E2, scrollTrigger: { trigger: '.plist', start: 'top 80%' } });
    $$('.amt[data-amt]').forEach(el => {
      const end = +el.dataset.amt, o = { v: 0 };
      gsap.to(o, { v: end, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' }, onUpdate: () => { el.textContent = '₱' + Math.round(o.v).toLocaleString('en-PH'); } });
    });
    gsap.from('.countdown b', { yPercent: 60, opacity: 0, duration: 1.2, stagger: .08, ease: E2, scrollTrigger: { trigger: '.countdown', start: 'top 90%' } });
    gsap.from('.edit-amt b', { scale: .6, opacity: 0, duration: 1.6, ease: E2, scrollTrigger: { trigger: '.edit', start: 'top 80%' } });

    /* poster feed: endless rows that speed up and skew with scroll velocity */
    const feeds = [[$('#feedA'), -50, 60], [$('#feedB'), 0, 70]].filter(f => f[0]).map(([el, from, dur]) => {
      gsap.set(el, { xPercent: from });
      return gsap.to(el, { xPercent: from === 0 ? -50 : 0, duration: dur, ease: 'none', repeat: -1 });
    });
    const skewTo = gsap.quickTo('.feed-row', 'skewX', { duration: .5, ease: 'power3' });
    ScrollTrigger.create({ trigger: '.feed', start: 'top bottom', end: 'bottom top', onUpdate: s => {
      const v = s.getVelocity();
      skewTo(gsap.utils.clamp(-8, 8, v / -300));
      feeds.forEach(t => { gsap.to(t, { timeScale: 1 + Math.min(Math.abs(v) / 250, 6), duration: .3, overwrite: true }); gsap.to(t, { timeScale: 1, duration: 1.2, delay: .3 }); });
    }, onLeave: () => skewTo(0), onLeaveBack: () => skewTo(0) });
    gsap.from('.feed', { y: 80, opacity: 0, duration: 1.4, ease: E, scrollTrigger: { trigger: '.feed', start: 'top 92%' } });

    /* ---------- lounge collage ---------- */
    $$('.cl').forEach(c => {
      const sp = +c.dataset.speed || 0, img = c.querySelector('img');
      gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 88%' } })
        .from(c.querySelector('.cl-img'), { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' })
        .to(img, { scale: 1.06, duration: 2, ease: E2 }, 0)
        .from(c.querySelector('figcaption'), { y: 20, opacity: 0, duration: 1, ease: E }, .6);
      mm.add('(min-width: 681px)', () => gsap.to(c, { yPercent: sp * -100, ease: 'none', scrollTrigger: { trigger: '.collage', start: 'top bottom', end: 'bottom top', scrub: true } }));
    });

    /* ---------- reviews ---------- */
    gsap.from('#ringFill', { strokeDashoffset: 326.7, duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: '.rating', start: 'top 85%' } });

    /* ---------- branches ---------- */
    gsap.from('#branchList', { y: 50, opacity: 0, duration: 1.2, ease: E, scrollTrigger: { trigger: '#branchList', start: 'top 88%' } });

    /* ---------- CTA + footer ---------- */
    gsap.from('.cta .hero-ctas > *', { y: 30, opacity: 0, duration: 1, stagger: .1, ease: E, scrollTrigger: { trigger: '.cta .hero-ctas', start: 'top 92%' } });
    const fw = $('.foot-word');
    if (fw) {
      const ch = new SplitText(fw, { type: 'chars', mask: 'chars' }).chars;
      gsap.from(ch, { yPercent: 100, duration: 1.3, stagger: .05, ease: E2, scrollTrigger: { trigger: fw, start: 'top 98%' } });
    }

    /* ---------- magnetic buttons ---------- */
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      $$('.magnetic').forEach(b => {
        const xTo = gsap.quickTo(b, 'x', { duration: .6, ease: 'elastic.out(1,.4)' }), yTo = gsap.quickTo(b, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
        b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .3); yTo((e.clientY - r.top - r.height / 2) * .4); });
        b.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
      });
      /* hero arch tilts toward the pointer */
      const arch = $('.hero-visual');
      const rx = gsap.quickTo(arch, 'rotationY', { duration: 1, ease: 'power3' }), ry = gsap.quickTo(arch, 'rotationX', { duration: 1, ease: 'power3' });
      gsap.set(arch, { transformPerspective: 1000 });
      $('#hero').addEventListener('pointermove', e => { rx((e.clientX / innerWidth - .5) * 10); ry((e.clientY / innerHeight - .5) * -8); });
    }

    addEventListener('load', () => ScrollTrigger.refresh());
    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  } catch (err) {
    console.error(err); document.documentElement.classList.remove('js'); window.__lenis && window.__lenis.start(); done();
  }
})();
