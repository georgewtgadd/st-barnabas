/* ══════════════════════════════════════════════════════════
   js/main.js  ·  Entry point — fires after pagesLoaded
══════════════════════════════════════════════════════════ */

document.addEventListener('pagesLoaded', () => {
  // SCORM
  SCORM.initialize();

  // Start on page 1
  goToPage(1);

  // Page-change hooks
  document.addEventListener('pageChanged', e => {
    const p = e.detail.page;

    // Page 8 — render quiz fresh each time the user arrives
    if (p === 8) {
      renderQuiz();
    }

    // Page 9 — populate learning record
    if (p === 9) {
      populateLearningRecord();
    }
  });

  // Modal backdrop — close on click outside inner
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
      }
    });
  });

  // Escape key — close any open modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
    }
  });

  // SCORM finish on unload
  window.addEventListener('beforeunload', () => {
    SCORM.finish();
  });
});
