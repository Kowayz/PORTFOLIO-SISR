/* ============================================
   Portfolio BTS SIO SISR — Ethan GESLIN
   script.js — interactions & animations
   ============================================ */

'use strict';

// ── SCROLL PROGRESS BAR ─────────────────────
const progressBar = document.getElementById('scrollProgress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  }, { passive: true });
}

// ── NAV: scroll state ───────────────────────
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── NAV: burger menu ────────────────────────
const burger   = document.getElementById('burger');
const navLinks = document.querySelector('.nav__links');

burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  const spans = burger.querySelectorAll('span');
  if (open) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ── ACTIVE NAV LINK ─────────────────────────
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav__links a');

function updateActiveNav() {
  const scrollY = window.scrollY + Math.floor(window.innerHeight * 0.3);
  let activeId = '';
  sections.forEach(s => {
    if (s.offsetTop <= scrollY) activeId = s.id;
  });
  navAnchors.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + activeId);
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

// ── REVEAL ON SCROLL ─────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── ABOUT: counter animation ─────────────────
const statNums = document.querySelectorAll('.about__stat-num[data-count]');
if (statNums.length) {
  const COUNT_DURATION = 1100;

  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      const start = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / COUNT_DURATION, 1);
        const eased = 1 - (1 - progress) ** 3;
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.6 });

  statNums.forEach(el => countObserver.observe(el));
}

// ── SKILL CARD BARS ──────────────────────────
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const bar = entry.target;
    setTimeout(() => { bar.style.width = bar.getAttribute('data-level') + '%'; }, 280);
    barObserver.unobserve(bar);
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-card__fill').forEach(b => barObserver.observe(b));

// ── TYPEWRITER ───────────────────────────────
const typeTarget = document.querySelector('.type-cursor');
if (typeTarget) {
  const phrases = [
    'Administrateur Systèmes & Réseaux',
    'Passionné de cybersécurité',
    'Intégrateur d\'infrastructures',
    'Disponible en alternance',
  ];
  let phraseIdx = 0, charIdx = 0, deleting = false;

  function typeStep() {
    const cur = phrases[phraseIdx];
    typeTarget.textContent = deleting ? cur.slice(0, --charIdx) : cur.slice(0, ++charIdx);

    let delay = deleting ? 38 : 76;
    if (!deleting && charIdx === cur.length) { delay = 2600; deleting = true; }
    else if (deleting && charIdx === 0)      { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; delay = 380; }

    setTimeout(typeStep, delay);
  }
  setTimeout(typeStep, 1400);
}

// ── TECH BADGES: staggered entrance ─────────
const techContainer = document.querySelector('.tech-badges');
if (techContainer) {
  const badgeObs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    techContainer.querySelectorAll('.tech-badge').forEach((badge, i) => {
      badge.style.opacity   = '0';
      badge.style.transform = 'translateY(10px)';
      setTimeout(() => {
        badge.style.transition = 'opacity 300ms ease, transform 300ms ease';
        badge.style.opacity    = '1';
        badge.style.transform  = 'none';
      }, i * 55);
    });
    badgeObs.unobserve(techContainer);
  }, { threshold: 0.2 });
  badgeObs.observe(techContainer);
}

// ── AP TABLE: row hover accent ───────────────
document.querySelectorAll('.ap-table tbody tr').forEach(row => {
  row.addEventListener('mouseenter', () => { row.style.boxShadow = 'inset 3px 0 0 var(--primary)'; });
  row.addEventListener('mouseleave', () => { row.style.boxShadow = ''; });
});

// ── SMOOTH ANCHOR SCROLL ─────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});

// ── CONTACT FORM ─────────────────────────────
const form     = document.getElementById('contactForm');
const feedback = document.getElementById('formFeedback');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const nom     = form.nom.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    feedback.className   = 'form-feedback';
    feedback.textContent = '';

    if (!nom || !email || !message) {
      feedback.className   = 'form-feedback error';
      feedback.textContent = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      feedback.className   = 'form-feedback error';
      feedback.textContent = 'Adresse email invalide.';
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled     = true;
    btn.textContent  = 'Envoi en cours…';

    await new Promise(r => setTimeout(r, 1200));

    btn.disabled  = false;
    btn.innerHTML = `Envoyer <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
    feedback.className   = 'form-feedback success';
    feedback.textContent = 'Message envoyé ! Je vous répondrai dans les meilleurs délais.';
    form.reset();

    setTimeout(() => { feedback.className = 'form-feedback'; feedback.textContent = ''; }, 6000);
  });
}
