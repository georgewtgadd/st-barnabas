/* ══════════════════════════════════════════════════════════
   js/main.js  ·  Entry point
══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // SCORM — wrapped so a missing runtime doesn't break the module
  try { SCORM.initialize(); } catch(e) { console.warn('SCORM not available:', e); }

  // Start on page 1
  goToPage(1);

  // Page-change hooks
  document.addEventListener('pageChanged', e => {
    const p = e.detail.page;

    if (p === 8) {
      renderQuiz();
    }

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
    try { SCORM.finish(); } catch(e) {}
  });

});
