/* ══════════════════════════════════════════════
   LEARNING RECORD
══════════════════════════════════════════════ */
function populateLearningRecord() {
  var d = new Date();
  var dateStr = d.toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
  var recDate = document.getElementById('rec-date');
  if (recDate) recDate.textContent = dateStr;

  var recMatcher = document.getElementById('rec-matcher');
  if (recMatcher && typeof MATCHER_CHIPS !== 'undefined' && typeof matcherAnswers !== 'undefined') {
    var correct = MATCHER_CHIPS.filter(c => matcherAnswers[c.id] === c.correct).length;
    recMatcher.innerHTML = `Completed. Score: <strong>${correct} / ${MATCHER_CHIPS.length}</strong>`;
  }

  var recRation = document.getElementById('rec-ration');
  if (recRation && typeof RATION_CHIPS !== 'undefined' && typeof rationAnswers !== 'undefined') {
    var correct = RATION_CHIPS.filter(c => rationAnswers[c.id] === c.correct).length;
    recRation.innerHTML = `Completed. Score: <strong>${correct} / ${RATION_CHIPS.length}</strong>`;
  }

  var recHypo = document.getElementById('rec-hypo');
  if (recHypo && typeof HYPO_SCENARIOS !== 'undefined') {
    recHypo.innerHTML = `All <strong>${HYPO_SCENARIOS.length}</strong> scenarios successfully completed.`;
  }

  var recMcq = document.getElementById('rec-mcq');
  if (recMcq && typeof quizScore !== 'undefined' && quizScore) {
    recMcq.innerHTML = `Score: <strong>${quizScore.pct}%</strong> (${quizScore.correct} / ${quizScore.total})`;
  }
}

function exportLearningRecord() { window.print(); }
function finishModule() { document.getElementById('finish-overlay').classList.add('show'); }
function closeOverlay() { document.getElementById('finish-overlay').classList.remove('show'); }

window.populateLearningRecord = populateLearningRecord;
window.exportLearningRecord = exportLearningRecord;
window.finishModule = finishModule;
window.closeOverlay = closeOverlay;
