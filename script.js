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

document.querySelectorAll('.skill-row__fill, .skill-card__fill').forEach(b => barObserver.observe(b));

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

// ── TABLEAU DE SYNTHÈSE — accordéon ─────────
(function () {
  const toggle = document.getElementById('apSynthToggle');
  const panel  = document.getElementById('apSynthPanel');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    if (!open) {
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      // Lazy-load l'iframe au premier clic
      const iframe = panel.querySelector('iframe[data-src]');
      if (iframe) { iframe.src = iframe.dataset.src; delete iframe.dataset.src; }
    } else {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}());

// ── PDF VIEWER MODAL (PDF.js) ────────────────
document.addEventListener('DOMContentLoaded', function () {
  const modal      = document.getElementById('pdfModal');
  if (!modal) return;

  const badge      = document.getElementById('pdfModalBadge');
  const titleEl    = document.getElementById('pdfModalTitle');
  const dlBtn      = document.getElementById('pdfDl');
  const closeBtn   = document.getElementById('pdfClose');
  const loading    = document.getElementById('pdfLoading');
  const footerHint = document.getElementById('pdfFooterHint');
  const zoomPct    = document.getElementById('pdfZoomPct');
  const btnZoomIn  = document.getElementById('pdfZoomIn');
  const btnZoomOut = document.getElementById('pdfZoomOut');
  const btnZoomReset = document.getElementById('pdfZoomReset');
  const canvasWrap = document.getElementById('pdfCanvasWrap');
  const pdfBody    = document.getElementById('pdfBody');

  const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const WORKER    = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  const ACCENTS = {
    'ap-card--violet': { gradient:'linear-gradient(90deg,#7c3aed,#f43f5e)', dim:'rgba(124,58,237,0.14)', text:'#c4b5fd', border:'rgba(124,58,237,0.40)', hover:'rgba(124,58,237,0.24)' },
    'ap-card--purple': { gradient:'linear-gradient(90deg,#8b5cf6,#3b82f6)', dim:'rgba(139,92,246,0.14)', text:'#a78bfa', border:'rgba(139,92,246,0.40)', hover:'rgba(139,92,246,0.24)' },
    'ap-card--orange': { gradient:'linear-gradient(90deg,#f97316,#fbbf24)', dim:'rgba(249,115,22,0.14)', text:'#fdba74', border:'rgba(249,115,22,0.40)', hover:'rgba(249,115,22,0.24)' },
    'ap-card--rose':   { gradient:'linear-gradient(90deg,#f43f5e,#f97316)', dim:'rgba(244,63,94,0.14)', text:'#fda4af', border:'rgba(244,63,94,0.40)', hover:'rgba(244,63,94,0.24)' },
    'ap-card--teal':   { gradient:'linear-gradient(90deg,#14b8a6,#3b82f6)', dim:'rgba(20,184,166,0.14)', text:'#5eead4', border:'rgba(20,184,166,0.40)', hover:'rgba(20,184,166,0.24)' },
  };

  let pdfDoc   = null;
  let scale    = 1.2;
  let fitScale = 1.2;
  let zoomPending = false;

  function loadPdfJs(cb) {
    if (window.pdfjsLib) { cb(); return; }
    const s = document.createElement('script');
    s.src = PDFJS_CDN;
    s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER; cb(); };
    document.head.appendChild(s);
  }

  function computeFitScale(page) {
    const vp = page.getViewport({ scale: 1 });
    return Math.max(0.4, (pdfBody.clientWidth - 48) / vp.width);
  }

  function renderPageOnCanvas(page, canvas) {
    const dpr = window.devicePixelRatio || 1;
    const vp  = page.getViewport({ scale });
    canvas.width  = Math.floor(vp.width  * dpr);
    canvas.height = Math.floor(vp.height * dpr);
    canvas.style.width  = vp.width  + 'px';
    canvas.style.height = vp.height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return page.render({ canvasContext: ctx, viewport: vp }).promise;
  }

  async function renderAllPages() {
    if (!pdfDoc) return;
    loading.classList.remove('hidden');
    canvasWrap.innerHTML = '';

    const renders = [];
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const canvas = document.createElement('canvas');
      canvasWrap.appendChild(canvas);
      const page = await pdfDoc.getPage(i);
      renders.push(renderPageOnCanvas(page, canvas));
    }
    await Promise.all(renders);
    loading.classList.add('hidden');
    updateZoomUI();
  }

  function updateZoomUI() {
    zoomPct.textContent   = Math.round(scale / fitScale * 100) + '%';
    btnZoomOut.disabled   = scale <= fitScale * 0.4;
    btnZoomIn.disabled    = scale >= fitScale * 3;
  }

  function applyAccent(el) {
    const COLOR_MAP = {
      violet: ACCENTS['ap-card--violet'],
      purple: ACCENTS['ap-card--purple'],
      orange: ACCENTS['ap-card--orange'],
      rose:   ACCENTS['ap-card--rose'],
      teal:   ACCENTS['ap-card--teal'],
    };
    let accent = COLOR_MAP.violet;
    for (const [key, val] of Object.entries(COLOR_MAP)) {
      if ([...el.classList].some(c => c.endsWith('--' + key))) { accent = val; break; }
    }
    modal.style.setProperty('--modal-accent',        accent.gradient);
    modal.style.setProperty('--modal-accent-dim',    accent.dim);
    modal.style.setProperty('--modal-accent-text',   accent.text);
    modal.style.setProperty('--modal-accent-border', accent.border);
    modal.style.setProperty('--modal-accent-hover',  accent.hover);
  }

  function openModal(card) {
    badge.textContent   = card.dataset.num;
    titleEl.textContent = card.dataset.title;
    dlBtn.href          = card.dataset.pdf;
    applyAccent(card);

    modal.hidden = false;
    modal.classList.remove('closing');
    document.body.style.overflow = 'hidden';
    pdfBody.scrollTop = 0;
    canvasWrap.innerHTML = '';
    loading.classList.remove('hidden');

    loadPdfJs(() => {
      pdfjsLib.getDocument(card.dataset.pdf).promise.then(async pdf => {
        pdfDoc = pdf;
        footerHint.textContent = '// ' + pdf.numPages + ' page' + (pdf.numPages > 1 ? 's' : '') + ' · ESC pour fermer';
        const firstPage = await pdf.getPage(1);
        fitScale = computeFitScale(firstPage);
        scale    = fitScale;
        renderAllPages();
      }).catch(() => loading.classList.add('hidden'));
    });
  }

  function closeModal() {
    modal.classList.add('closing');
    setTimeout(() => {
      modal.hidden = true;
      modal.classList.remove('closing');
      pdfDoc = null;
      canvasWrap.innerHTML = '';
      document.body.style.overflow = '';
    }, 210);
  }

  // ── Zoom controls ──
  function applyZoom() {
    if (zoomPending) return;
    zoomPending = true;
    requestAnimationFrame(() => { zoomPending = false; renderAllPages(); });
  }

  btnZoomIn.addEventListener('click', () => {
    scale = Math.min(scale * 1.25, fitScale * 3); applyZoom();
  });
  btnZoomOut.addEventListener('click', () => {
    scale = Math.max(scale / 1.25, fitScale * 0.4); applyZoom();
  });
  btnZoomReset.addEventListener('click', () => {
    scale = fitScale; applyZoom();
  });

  pdfBody.addEventListener('wheel', e => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    scale = e.deltaY < 0
      ? Math.min(scale * 1.1, fitScale * 3)
      : Math.max(scale / 1.1, fitScale * 0.4);
    applyZoom();
  }, { passive: false });

  // ── Card triggers ──
  document.querySelectorAll('.ap-card[data-pdf]').forEach(card => {
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
    });
  });


  closeBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
});
