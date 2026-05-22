/* =====================================================
   DOC VIEWER — Notion embed iframe overlay
   ===================================================== */

const DocViewer = (function () {

  const state = {
    isOpen: false,
    overlayEl: null,
    shellEl: null,
    iframeEl: null,
    titleEl: null,
    headerEl: null,
    loaderEl: null,
    originalBodyPR: '',
  };

  function init() {
    _buildShell();

    document.querySelectorAll('[data-notion-url]').forEach(btn => {
      if (btn.classList.contains('project-card__cmd--wip')) return;
      btn.addEventListener('click', () => {
        const card   = btn.closest('[data-accent]');
        const url    = btn.dataset.notionUrl;
        const title  = btn.dataset.title || 'Documentation';
        const accent = (card && card.dataset.accent) || 'violet';
        open(url, title, accent);
      });
    });
  }

  function _buildShell() {
    const overlay = document.createElement('div');
    overlay.id = 'doc-viewer-overlay';
    overlay.className = 'dv-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="dv-shell">
        <header class="dv-header" id="dv-header">
          <button class="dv-close" aria-label="Fermer la documentation">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <div class="dv-header__meta">
            <span class="dv-header__label">Documentation</span>
            <h2 class="dv-header__title" id="dv-title">Projet</h2>
          </div>
          <div class="dv-header__accent-line"></div>
        </header>
        <div class="dv-iframe-wrap">
          <div class="dv-loader" id="dv-loader">
            <span class="dv-loader__dot"></span>
            <span class="dv-loader__dot"></span>
            <span class="dv-loader__dot"></span>
          </div>
          <iframe
            id="dv-iframe"
            class="dv-iframe"
            allowfullscreen
            loading="lazy"
            title="Documentation"
            src="about:blank">
          </iframe>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    state.overlayEl = overlay;
    state.shellEl   = overlay.querySelector('.dv-shell');
    state.iframeEl  = overlay.querySelector('#dv-iframe');
    state.titleEl   = overlay.querySelector('#dv-title');
    state.headerEl  = overlay.querySelector('#dv-header');
    state.loaderEl  = overlay.querySelector('#dv-loader');

    _bindGlobalEvents();
  }

  function open(url, title, accent) {
    ['orange', 'violet', 'teal', 'rose'].forEach(a =>
      state.headerEl.classList.remove('dv-header--accent-' + a)
    );
    state.headerEl.classList.add('dv-header--accent-' + accent);
    state.titleEl.textContent = title;

    state.loaderEl.classList.add('is-visible');
    state.iframeEl.classList.remove('is-loaded');
    state.iframeEl.src = 'about:blank';

    _lockBodyScroll();
    state.overlayEl.classList.remove('is-closing');
    state.overlayEl.classList.add('is-open');
    state.isOpen = true;

    state.iframeEl.onload = () => {
      if (state.iframeEl.src === 'about:blank' || state.iframeEl.src === window.location.href) return;
      state.loaderEl.classList.remove('is-visible');
      state.iframeEl.classList.add('is-loaded');
    };
    state.iframeEl.src = url;
  }

  function close() {
    if (!state.isOpen) return;
    state.isOpen = false;
    state.overlayEl.classList.add('is-closing');
    state.overlayEl.classList.remove('is-open');

    state.shellEl.addEventListener('transitionend', function handler() {
      state.shellEl.removeEventListener('transitionend', handler);
      state.overlayEl.classList.remove('is-closing');
      state.iframeEl.src = 'about:blank';
      state.loaderEl.classList.remove('is-visible');
      state.iframeEl.classList.remove('is-loaded');
      _unlockBodyScroll();
    }, { once: true });
  }

  function _lockBodyScroll() {
    const sw = _getScrollbarWidth();
    state.originalBodyPR = document.body.style.paddingRight;
    document.body.style.overflow     = 'hidden';
    document.body.style.paddingRight = sw + 'px';
  }

  function _unlockBodyScroll() {
    document.body.style.overflow     = '';
    document.body.style.paddingRight = state.originalBodyPR;
  }

  function _bindGlobalEvents() {
    state.overlayEl.querySelector('.dv-close').addEventListener('click', close);
    state.overlayEl.addEventListener('click', e => {
      if (e.target === state.overlayEl) close();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && state.isOpen) close();
    });
  }

  function _getScrollbarWidth() {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:-9999px;width:100px;overflow:scroll';
    document.body.appendChild(el);
    const w = el.offsetWidth - el.clientWidth;
    document.body.removeChild(el);
    return w;
  }

  return { init, open, close };

})();

document.addEventListener('DOMContentLoaded', DocViewer.init);
