/* ══════════════════════════════════════════════════════════
   js/main.js  ·  Entry point
══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // SCORM
  SCORM.initialize();

  // Start on page 1
  goToPage(1);

  // Page-change hooks
  document.addEventListener('pageChanged', e => {
    const p = e.detail.page;

    // Page 8 — render (or re-render) the quiz each time the user arrives
    if (p === 8) {
      renderQuiz();
    }

    // Page 9 — populate learning record
    if (p === 9) {
      populateLearningRecord();
    }
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
      }
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
    }
  });

  window.addEventListener('beforeunload', () => {
    SCORM.finish();
  });
});
