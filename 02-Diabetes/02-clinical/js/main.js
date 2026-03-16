/* main.js — initialise all components after pagesLoaded */
'use strict';

document.addEventListener('pagesLoaded', function () {
  SCORM.initialize();
  goToPage(1);

  const nav2 = document.getElementById('nav-2');
  if (nav2) nav2.disabled = false;

  initCleanout();
  renderQuiz();

  // Close modals on backdrop click / Escape
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
    modal.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('open'); });
  });

  window.addEventListener('beforeunload', () => SCORM.finish());
});
