/* ══════════════════════════════════════════════════════════
   main.js
   Listens for the 'pagesLoaded' event fired by page-loader.js,
   then initialises all components that depend on page DOM.
══════════════════════════════════════════════════════════ */

document.addEventListener('pagesLoaded', () => {

  // Initialise progress bar on page 1
  updateProgressBar(1);

  // Page 1 — video-gated continue button
  initIntroVideoGate();

  // Render branching scenario choices (page 3)
  renderChoicesPanel();

  // Initialise ACP form validation (page 7)
  initAcpValidation();

  // Initialise the knowledge-check quiz (page 8)
  initKnowledgeCheck();

  // ── Modal backdrop click-to-close ─────────────────────
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', e => {
      if (e.target !== backdrop) return;
      if (backdrop.id === 'video-modal')     closeVideoModal();
      if (backdrop.id === 'hs-modal')        closeHotspotModal();
      if (backdrop.id === 'pillar-modal')    closePillarModal();
      if (backdrop.id === 'acp-notes-modal') closeAcpModal();
    });
  });

  // ── Escape key closes any open modal / the burger drawer ─
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('video-modal')?.classList.contains('open'))     closeVideoModal();
    if (document.getElementById('hs-modal')?.classList.contains('open'))        closeHotspotModal();
    if (document.getElementById('pillar-modal')?.classList.contains('open'))    closePillarModal();
    if (document.getElementById('acp-notes-modal')?.classList.contains('open')) closeAcpModal();
    if (document.getElementById('burger-drawer')?.classList.contains('open'))   closeBurgerMenu();
  });

});
