/* ══ INITIALISATION ══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  if (typeof SCORM !== 'undefined') SCORM.initialize();
  
  // Initialize all interactive components
  if (typeof initMatcher === 'function') initMatcher();
  if (typeof initRation === 'function') initRation();
  if (typeof initHypo === 'function') initHypo();
  if (typeof initDoseSim === 'function') initDoseSim();
  if (typeof renderQuiz === 'function') renderQuiz();

  // Handle bookmarking
  var bookmark = 1;
  if (typeof SCORM !== 'undefined') bookmark = SCORM.getBookmark();
  if (typeof goToPage === 'function') goToPage(bookmark);
});

// Global finish handler
window.finish = function() { 
  if (typeof goToPage === 'function') goToPage(11); 
};
