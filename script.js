/* ═══════════════════════════════════════════════════════════
   VIGOSS – script.js
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── Navbar scroll ─────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ─── Hamburger menu ────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const isOpen = navLinks.classList.contains('open');
  hamburger.setAttribute('aria-expanded', isOpen);
});
// Close nav on link click (mobile)
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ─── Reveal on scroll ──────────────────────────────────── */
const revealEls = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger children within the same parent
      const siblings = entry.target.parentElement.querySelectorAll('[data-reveal]');
      let delay = 0;
      siblings.forEach((el, idx) => {
        if (el === entry.target) delay = idx * 80;
      });
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

/* ─── GPU Filter tabs ───────────────────────────────────── */
const tabs    = document.querySelectorAll('.tab');
const gpuGrid = document.getElementById('gpu-grid');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const filter = tab.dataset.filter;
    const cards  = gpuGrid.querySelectorAll('.gpu-card');

    cards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !show);
    });
  });
});

/* ─── Cost Calculator ───────────────────────────────────── */
const calcGpu   = document.getElementById('calc-gpu');
const calcCount = document.getElementById('calc-count');
const calcHours = document.getElementById('calc-hours');

const resPerGpu = document.getElementById('res-per-gpu');
const resCount  = document.getElementById('res-count');
const resHours  = document.getElementById('res-hours');
const resTotal  = document.getElementById('res-total');
const hoursDisp = document.getElementById('hours-display');

function updateCalc() {
  const rate  = parseFloat(calcGpu.value)  || 0;
  const count = parseInt(calcCount.value)  || 1;
  const hours = parseInt(calcHours.value)  || 1;
  const total = rate * count * hours;

  resPerGpu.textContent = `AUD $${rate.toFixed(2)}`;
  resCount.textContent  = `× ${count}`;
  resHours.textContent  = `× ${hours} hrs`;
  resTotal.textContent  = `AUD $${total.toFixed(2)}`;
  hoursDisp.textContent = `${hours} hrs`;
}

calcGpu.addEventListener('change', updateCalc);
calcHours.addEventListener('input', updateCalc);
calcCount.addEventListener('input', updateCalc);

// Stepper buttons
document.getElementById('step-up').addEventListener('click', () => {
  const v = parseInt(calcCount.value) || 1;
  if (v < 128) { calcCount.value = v + 1; updateCalc(); }
});
document.getElementById('step-down').addEventListener('click', () => {
  const v = parseInt(calcCount.value) || 1;
  if (v > 1) { calcCount.value = v - 1; updateCalc(); }
});

updateCalc(); // initialise

/* ─── Hero Canvas — animated particle grid ───────────────── */
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H, particles, animId;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initParticles();
  }

  function initParticles() {
    const count = Math.floor((W * H) / 10000);
    particles = Array.from({ length: count }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - .5) * .3,
      vy: (Math.random() - .5) * .3,
      r:  Math.random() * 1.5 + .5,
      o:  Math.random() * .5 + .1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(99,102,241,${(1 - dist / 120) * .15})`;
          ctx.lineWidth   = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99,102,241,${p.o})`;
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    animId = requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();
  draw();
})();

/* ─── Smooth anchor scrolling with offset ───────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h')) || 68;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'smooth',
    });
  });
});
