/* ══════════════════════════════════════════════════════════
   js/main.js  ·  Entry point — fires after pagesLoaded
══════════════════════════════════════════════════════════ */

document.addEventListener('pagesLoaded', () => {
  // SCORM
  SCORM.initialize();

  // Start on page 1
  goToPage(1);

  // Render quiz
  renderQuiz();

  // Page-change hooks
  document.addEventListener('pageChanged', e => {
    const p = e.detail.page;

    // Page 8 — re-render quiz if re-visited after results shown
    if (p === 8) {
      const container = document.getElementById('quiz-question-container');
      if (container && container.style.display === 'none') {
        // Quiz was in results state — reset for re-attempt
        // (user can use Retry inside results panel)
      }
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
