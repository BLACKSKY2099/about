/* ============================================================
   BLACKSKY2099 — Cosmic Dark Theme
   script.js
   ============================================================ */

'use strict';

/* ============================================================
   1. STARFIELD CANVAS
   ============================================================ */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars = [], nebulae = [];
  const NUM_STARS = 280;
  const NUM_NEBULAE = 5;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function initStars() {
    stars = [];
    for (let i = 0; i < NUM_STARS; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: randomBetween(0.2, 1.8),
        alpha: randomBetween(0.1, 0.9),
        speed: randomBetween(0.0008, 0.003),
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.85 ? 260 : (Math.random() > 0.7 ? 200 : 0),
      });
    }

    nebulae = [];
    const colors = [
      'rgba(167,139,250,0.04)',
      'rgba(56,189,248,0.03)',
      'rgba(244,114,182,0.025)',
      'rgba(52,211,153,0.02)',
      'rgba(251,146,60,0.02)',
    ];
    for (let i = 0; i < NUM_NEBULAE; i++) {
      nebulae.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: randomBetween(150, 400),
        color: colors[i % colors.length],
      });
    }
  }

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Nebulae
    nebulae.forEach(n => {
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      grad.addColorStop(0, n.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Stars
    frame++;
    stars.forEach(s => {
      const twinkle = Math.sin(frame * s.speed * 60 + s.phase);
      const alpha = s.alpha * (0.6 + 0.4 * twinkle);
      let color;
      if (s.hue === 260) color = `rgba(167,139,250,${alpha})`;
      else if (s.hue === 200) color = `rgba(56,189,248,${alpha})`;
      else color = `rgba(255,255,255,${alpha})`;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();

      // Subtle glow for larger stars
      if (s.r > 1.2) {
        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        glow.addColorStop(0, color.replace(/[\d.]+\)$/, `${alpha * 0.3})`));
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    requestAnimationFrame(draw);
  }

  resize();
  initStars();
  draw();
  window.addEventListener('resize', () => { resize(); initStars(); });
})();

/* ============================================================
   2. CURSOR GLOW
   ============================================================ */
(function initCursor() {
  const el = document.getElementById('cursorGlow');
  if (!el || window.matchMedia('(pointer: coarse)').matches) {
    if (el) el.style.display = 'none';
    return;
  }
  let tx = 0, ty = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  function lerp(a, b, t) { return a + (b - a) * t; }
  function animate() {
    cx = lerp(cx, tx, 0.06);
    cy = lerp(cy, ty, 0.06);
    el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ============================================================
   3. NAV — SCROLL & MOBILE TOGGLE
   ============================================================ */
(function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!nav || !toggle || !links) return;

  // Scroll class
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    lastY = y;
  }, { passive: true });

  // Mobile toggle
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  function updateActive() {
    const scrollY = window.scrollY + window.innerHeight / 3;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const bot = top + sec.offsetHeight;
      if (scrollY >= top && scrollY < bot) {
        navLinkEls.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${sec.id}`);
        });
      }
    });
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();

/* ============================================================
   4. SCROLL REVEAL
   ============================================================ */
(function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        setTimeout(() => el.classList.add('revealed'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ============================================================
   5. COUNTER ANIMATION
   ============================================================ */
(function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOut(progress) * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  els.forEach(el => observer.observe(el));
})();

/* ============================================================
   6. SMOOTH SCROLL
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 70;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   7. CARD HOVER GLOW (TILT)
   ============================================================ */
(function initTilt() {
  const cards = document.querySelectorAll('.mission-card, .build-card, .stat-card, .contact-card');
  if (window.matchMedia('(pointer: coarse)').matches) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ============================================================
   8. PAGE LOAD ANIMATION
   ============================================================ */
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});
