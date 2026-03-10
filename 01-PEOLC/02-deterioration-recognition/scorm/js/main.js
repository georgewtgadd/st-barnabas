/* ══════════════════════════════════════════════════════════
   MAIN — Initialisation
   js/main.js
   Runs after page-loader.js fires the 'pagesLoaded' event,
   ensuring all page DOM exists before wiring up components.
   Depends on: scorm.js · navigation.js · interactive.js
               pdf-viewer.js · akps.js · mcq.js · case-study.js
══════════════════════════════════════════════════════════ */

document.addEventListener('pagesLoaded', function () {

  // Initialise SCORM connection
  SCORM.initialize();

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
    if (SCORM.isInitialized()) SCORM.finish('incomplete', null);
  });

});
