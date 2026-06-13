/* ============================================================
   VØRM Studio — main.js
   ============================================================ */

(function () {
  'use strict';

  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ────────────────────────────────────────────
     1. NAV — scroll-aware frosted glass
  ─────────────────────────────────────────────── */
  const navbar = qs('#navbar');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ────────────────────────────────────────────
     2. MOBILE BURGER
  ─────────────────────────────────────────────── */
  const burger   = qs('#burger');
  const navLinks = qs('#navLinks');

  burger.addEventListener('click', () => {
    const isOpen = burger.classList.toggle('open');
    burger.setAttribute('aria-expanded', isOpen);
    navLinks.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  qsa('a', navLinks).forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ────────────────────────────────────────────
     3. HERO ENTRANCE
  ─────────────────────────────────────────────── */
  setTimeout(() => {
    const heroLeft  = qs('#heroLeft');
    const heroRight = qs('#heroRight');
    if (heroLeft)  heroLeft.classList.add('in');
    if (heroRight) heroRight.classList.add('in');
  }, 120);

  /* ────────────────────────────────────────────
     4. PARALLAX — hero bg
  ─────────────────────────────────────────────── */
  const bgImg = qs('#bgImg');

  if (bgImg) {
    window.addEventListener('scroll', () => {
      bgImg.style.transform = `scale(1.04) translateY(${window.scrollY * 0.18}px)`;
    }, { passive: true });
  }

  /* ────────────────────────────────────────────
     5. CARD SLIDESHOW
  ─────────────────────────────────────────────── */
  const cardImages = [
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516131206008-dd041a9764fd?w=800&auto=format&fit=crop&q=80',
  ];

  const cardImg     = qs('.card__img');
  const cardCounter = qs('#cardCounter');
  const dots        = qsa('.card__dot');
  let   currentIdx  = 0;
  let   slideTimer;

  function goToSlide(idx, instant = false) {
    currentIdx = (idx + cardImages.length) % cardImages.length;

    if (!instant) {
      cardImg.style.opacity = '0';
      setTimeout(() => {
        cardImg.src = cardImages[currentIdx];
        cardImg.style.opacity = '1';
      }, 320);
    } else {
      cardImg.src = cardImages[currentIdx];
    }

    cardCounter.textContent = `0${currentIdx + 1} / 0${cardImages.length}`;
    dots.forEach((d, i) => d.classList.toggle('card__dot--active', i === currentIdx));
  }

  function startAutoSlide() {
    slideTimer = setInterval(() => goToSlide(currentIdx + 1), 4000);
  }

  function resetAutoSlide() {
    clearInterval(slideTimer);
    startAutoSlide();
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.idx, 10));
      resetAutoSlide();
    });
  });

  // swipe
  let touchStartX = 0;
  if (cardImg) {
    cardImg.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    cardImg.addEventListener('touchend', e => {
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) { goToSlide(delta < 0 ? currentIdx + 1 : currentIdx - 1); resetAutoSlide(); }
    }, { passive: true });
  }

  startAutoSlide();

  /* ────────────────────────────────────────────
     6. COUNTER ANIMATION
  ─────────────────────────────────────────────── */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.querySelector('span').outerHTML;
    const duration = 1200;
    const start    = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 2);
      el.innerHTML   = `${Math.round(eased * target)}${suffix}`;
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        qsa('.stat__num').forEach(animateCounter);
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const statsEl = qs('.stats');
  if (statsEl) statsObserver.observe(statsEl);

  /* ────────────────────────────────────────────
     7. SCROLL REVEAL
  ─────────────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // stagger siblings in same parent
        const siblings = qsa('.reveal', entry.target.parentElement);
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 80}ms`;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  qsa('.reveal').forEach(el => revealObserver.observe(el));

  /* ────────────────────────────────────────────
     8. CURSOR GLOW (desktop only)
  ─────────────────────────────────────────────── */
  if (window.matchMedia('(hover: hover)').matches) {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed;
      width: 320px;
      height: 320px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,61,0,0.08) 0%, transparent 70%);
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: left 0.18s ease, top 0.18s ease;
      z-index: 0;
    `;
    document.body.appendChild(glow);

    document.addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    }, { passive: true });
  }

  /* ────────────────────────────────────────────
     9. CONTACT FORM
  ─────────────────────────────────────────────── */
  const form = qs('#contactForm');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const btn = qs('.cta__submit', form);
      const name  = form.querySelector('[name="name"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();

      if (!name || !email) {
        // Simple shake on empty required fields
        form.querySelectorAll('.cta__input').forEach(input => {
          if (!input.value.trim() && input.type !== 'textarea') {
            input.style.borderColor = 'var(--fire)';
            input.addEventListener('input', () => { input.style.borderColor = ''; }, { once: true });
          }
        });
        return;
      }

      // Simulate send
      btn.textContent = 'Sending…';
      btn.style.opacity = '0.7';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = `
          Sent
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7l4 4 6-6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
        btn.style.background = '#1a7a4a';
        btn.style.opacity = '1';

        // Reset form
        setTimeout(() => {
          form.reset();
          btn.innerHTML = `Send brief <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7h12M8 2l5 5-5 5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }, 1200);
    });
  }

  /* ────────────────────────────────────────────
     10. WORK ITEM — hover tilt (desktop)
  ─────────────────────────────────────────────── */
  if (window.matchMedia('(hover: hover)').matches) {
    qsa('.work__item').forEach(item => {
      item.addEventListener('mousemove', e => {
        const rect = item.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 4;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 4;
        item.style.transform = `perspective(600px) rotateX(${-y}deg) rotateY(${x}deg)`;
      });

      item.addEventListener('mouseleave', () => {
        item.style.transform = '';
      });
    });
  }

})();