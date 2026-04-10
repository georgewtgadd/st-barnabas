/* ══════════════════════════════════════════════════════════
   js/main.js  ·  Entry point — fires after pagesLoaded
   Mirrors Module 2 main.js pattern exactly.
══════════════════════════════════════════════════════════ */

document.addEventListener('pagesLoaded', () => {

  /* SCORM */
  SCORM.initialize();

  /* Start on page 1 */
  goToPage(1);

  /* Init feature modules that need DOM ready */
  initDnD();
  initSeizures();
  renderCases();

  /* Page-change hooks */
  document.addEventListener('pageChanged', e => {
    const p = e.detail.page;
    if (p === 11) populateLearningRecord();
  });

  /* Modal backdrop — close on click outside inner panel */
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) backdrop.classList.remove('open');
    });
  });

  /* Escape key closes any open modal */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open')
        .forEach(m => m.classList.remove('open'));
    }
  });

  /* SCORM finish on unload */
  window.addEventListener('beforeunload', () => {
    if (SCORM.isInitialized()) SCORM.finish('incomplete', null);
  });

});
