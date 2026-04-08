/* ══════════════════════════════════════════════════════════
   js/main.js  ·  Entry point — fires after pagesLoaded
══════════════════════════════════════════════════════════ */

document.addEventListener('pagesLoaded', () => {
  SCORM.initialize();

  goToPage(1);

  renderQuiz();

  document.addEventListener('pageChanged', e => {
    const p = e.detail.page;

    if (p === 11) {
      populateLearningRecord();
    }
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) backdrop.classList.remove('open');
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
