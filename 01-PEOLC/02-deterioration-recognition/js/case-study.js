/* ══════════════════════════════════════════════════════════
   CASE STUDY — Answer Reveals & Learning Record
   js/case-study.js
══════════════════════════════════════════════════════════ */

/**
 * Opens an answer reveal panel inline (no modal needed).
 * The cab-answer element is a sibling of the reveal button.
 * @param {string} id - base id, e.g. 'bob3-q1' → element 'bob3-q1-answer'
 */
function openAnswerModal(id) {
  var el = document.getElementById(id + '-answer');
  if (!el) return;
  var showing = el.style.display !== 'none';
  el.style.display = showing ? 'none' : 'block';
}

function saveActivity9() {
  // Autosave is handled by the textarea's oninput → checkPage9Gate
}

// populateLearningRecord() and exportLearningRecord() now live in
// js/record.js, matching the pattern used across the module series.
