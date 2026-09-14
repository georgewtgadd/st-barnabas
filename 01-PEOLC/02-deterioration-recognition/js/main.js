/* ══════════════════════════════════════════════════════════
   js/main.js  ·  Entry point — fires after pagesLoaded
══════════════════════════════════════════════════════════ */

/* ── Expand / pop-out controls (header + launch gate) ────────
   Fixes content being squeezed inside a small LMS iframe.
   Both actions are fully defensive — neither can throw — so the
   launch gate can never get stuck open if fullscreen or pop-ups
   are blocked by the LMS iframe's permissions policy.            */
function toggleModuleFullscreen() {
  const el = document.documentElement;
  const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;

  if (isFullscreen) {
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    try { if (exit) exit.call(document); } catch (e) { /* no-op */ }
    return;
  }

  const request = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (!request) { openModuleInNewTab(); return; }

  try {
    const result = request.call(el);
    if (result && typeof result.catch === 'function') {
      result.catch(() => openModuleInNewTab());
    }
  } catch (e) {
    openModuleInNewTab();
  }
}

function openModuleInNewTab() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('launched', '1');
    const win = window.open(url.toString(), '_blank', 'noopener');
    return !!win;
  } catch (e) {
    return false;
  }
}

function _updateFullscreenButton() {
  const btn   = document.getElementById('expand-fullscreen-btn');
  const label = document.getElementById('expand-fullscreen-label');
  const active = !!(document.fullscreenElement || document.webkitFullscreenElement);
  if (btn)   btn.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Expand module to fill your screen');
  if (label) label.textContent = active ? 'Exit' : 'Expand';
}
document.addEventListener('fullscreenchange', _updateFullscreenButton);
document.addEventListener('webkitfullscreenchange', _updateFullscreenButton);

/* ── Launch gate ──────────────────────────────────────────────
   Shown once before the module content. Dismissing it removes
   `inert` from the rest of the app shell.                       */
function dismissLaunchGate() {
  const gate = document.getElementById('launch-gate');
  if (gate) gate.classList.add('launch-gate-closed');

  ['header', '.progress-nav', '.progress-nav-mobile', '.module-progress-bar', '#main-content', 'footer']
    .forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.removeAttribute('inert');
    });

  const brand = document.querySelector('.brand');
  if (brand) brand.focus();
}

function gateExpandAndStart() {
  try { toggleModuleFullscreen(); } finally { dismissLaunchGate(); }
}
function gateNewTabAndStart() {
  try { openModuleInNewTab(); } finally { dismissLaunchGate(); }
}

(function initLaunchGate() {
  const gate = document.getElementById('launch-gate');
  if (!gate) return;

  const params = new URLSearchParams(window.location.search);
  if (params.get('launched') === '1') {
    dismissLaunchGate();
    return;
  }

  gate.addEventListener('click', e => { if (e.target === gate) dismissLaunchGate(); });
  const firstBtn = gate.querySelector('button');
  if (firstBtn) firstBtn.focus();
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !gate.classList.contains('launch-gate-closed')) {
      dismissLaunchGate();
    }
  });
})();

/* ── Burger / drawer navigation ──────────────────────────────── */
function openProgressDrawer() {
  const backdrop = document.getElementById('progress-drawer-backdrop');
  const burgerBtn = document.getElementById('burger-btn');
  if (!backdrop) return;
  backdrop.classList.add('open');
  if (burgerBtn) burgerBtn.setAttribute('aria-expanded', 'true');
  const firstFocusable = backdrop.querySelector('.nav-step:not(:disabled)') || backdrop.querySelector('.modal-close');
  if (firstFocusable) firstFocusable.focus();
}

function closeProgressDrawer() {
  const backdrop = document.getElementById('progress-drawer-backdrop');
  const burgerBtn = document.getElementById('burger-btn');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  if (burgerBtn) { burgerBtn.setAttribute('aria-expanded', 'false'); }
}

function toggleProgressDrawer() {
  const backdrop = document.getElementById('progress-drawer-backdrop');
  if (backdrop && backdrop.classList.contains('open')) closeProgressDrawer();
  else openProgressDrawer();
}

document.addEventListener('click', e => {
  const backdrop = document.getElementById('progress-drawer-backdrop');
  if (backdrop && e.target === backdrop) closeProgressDrawer();
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const backdrop = document.getElementById('progress-drawer-backdrop');
  if (backdrop && backdrop.classList.contains('open')) closeProgressDrawer();
});


/* ══════════════════════════════════════════════════════════
   MAIN — Initialisation
   Runs after page-loader.js fires the 'pagesLoaded' event,
   ensuring all page DOM exists before wiring up components.
   Depends on: xapi.js · navigation.js · interactive.js
               pdf-viewer.js · akps.js · mcq.js · case-study.js
══════════════════════════════════════════════════════════ */

document.addEventListener('pagesLoaded', function () {

  XAPI.initialize();

  // Set progress bar to page 1
  updateProgressBar(1);

  // Build MCQ question cards (page 10 DOM is now available)
  renderMCQ();

  // Default interactive states
  showPhase('months');   // Page 4 — timeline default
  showTraj('cancer');    // Page 6 — trajectories default

  // Wire up AKPS gate-check textarea listener
  var q1 = document.getElementById('bob3-q1-input');
  if (q1) q1.addEventListener('input', window.checkPage9Gate);
  if (typeof window.checkPage9Gate === 'function') window.checkPage9Gate();

  // Save state on tab/window close
  window.addEventListener('beforeunload', function () {
    XAPI.finish();
  });

});
