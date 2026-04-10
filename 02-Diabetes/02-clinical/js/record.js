/* ══════════════════════════════════════════════
   LEARNING RECORD
══════════════════════════════════════════════ */
function populateLearningRecord() {
  var d = new Date();
  var dateStr = d.toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
  var recDate = document.getElementById('rec-date');
  if (recDate) recDate.textContent = dateStr;

  // 1. Risk Matcher
  var recMatcher = document.getElementById('rec-matcher');
  var recMatcherDetails = document.getElementById('rec-matcher-details');
  if (recMatcher && typeof MATCHER_CHIPS !== 'undefined' && typeof matcherAnswers !== 'undefined') {
    var correct = MATCHER_CHIPS.filter(c => matcherAnswers[c.id] === c.correct).length;
    recMatcher.innerHTML = `Completed. Score: <strong>${correct} / ${MATCHER_CHIPS.length}</strong>`;
    
    var details = MATCHER_CHIPS.map(c => {
      var isCorrect = matcherAnswers[c.id] === c.correct;
      var zoneName = document.getElementById(matcherAnswers[c.id]) ? document.getElementById(matcherAnswers[c.id]).querySelector('.drop-zone-title').textContent : 'Unknown';
      return `<div style="margin-bottom:4px;">${isCorrect ? '✅' : '❌'} <strong>${c.text}</strong> placed in: ${zoneName}</div>`;
    }).join('');
    if (recMatcherDetails) recMatcherDetails.innerHTML = details;
  }

  // 2. Rationalisation
  var recRation = document.getElementById('rec-ration');
  var recRationDetails = document.getElementById('rec-ration-details');
  if (recRation && typeof RATION_CHIPS !== 'undefined' && typeof rationAnswers !== 'undefined') {
    var correct = RATION_CHIPS.filter(c => rationAnswers[c.id] === c.correct).length;
    recRation.innerHTML = `Completed. Score: <strong>${correct} / ${RATION_CHIPS.length}</strong>`;
    
    var details = RATION_CHIPS.map(c => {
      var isCorrect = rationAnswers[c.id] === c.correct;
      var zoneName = document.getElementById(rationAnswers[c.id]) ? document.getElementById(rationAnswers[c.id]).querySelector('.drop-zone-title').textContent : 'Unknown';
      return `<div style="margin-bottom:4px;">${isCorrect ? '✅' : '❌'} <strong>${c.text}</strong> placed in: ${zoneName}</div>`;
    }).join('');
    if (recRationDetails) recRationDetails.innerHTML = details;
  }

  // 3. Hypo Scenarios
  var recHypo = document.getElementById('rec-hypo');
  var recHypoDetails = document.getElementById('rec-hypo-details');
  if (recHypo && typeof HYPO_SCENARIOS !== 'undefined') {
    recHypo.innerHTML = `All <strong>${HYPO_SCENARIOS.length}</strong> scenarios successfully completed.`;
    
    var details = HYPO_SCENARIOS.map((s, i) => {
      return `<div style="margin-bottom:8px;"><strong>Scenario ${i+1}:</strong> ${s.title}<br><span style="color:#059669;">Rationale: ${s.fb}</span></div>`;
    }).join('');
    if (recHypoDetails) recHypoDetails.innerHTML = details;
  }

  // 4. Dose Simulator
  var recSimDetails = document.getElementById('rec-sim-details');
  if (recSimDetails) {
    var intakeSlider = document.getElementById('intake-slider');
    var consciousSlider = document.getElementById('conscious-slider');
    if (intakeSlider && consciousSlider && typeof INTAKE_LABELS !== 'undefined' && typeof CONSCIOUS_LABELS !== 'undefined') {
      var intake = INTAKE_LABELS[intakeSlider.value];
      var conscious = CONSCIOUS_LABELS[consciousSlider.value];
      recSimDetails.innerHTML = `Last simulation state: <strong>Intake:</strong> ${intake} | <strong>Consciousness:</strong> ${conscious}`;
    }
  }

  // 5. MCQ
  var recMcq = document.getElementById('rec-mcq');
  var recMcqDetails = document.getElementById('rec-mcq-details');
  if (recMcq && typeof quizScore !== 'undefined' && quizScore) {
    recMcq.innerHTML = `Score: <strong>${quizScore.pct}%</strong> (${quizScore.correct} / ${quizScore.total})`;
    
    if (typeof QUIZ_DATA !== 'undefined' && typeof quizAnswers !== 'undefined') {
      var details = QUIZ_DATA.map((q, i) => {
        var isCorrect = quizAnswers[i] === q.correct;
        return `<div style="margin-bottom:4px;">${isCorrect ? '✅' : '❌'} <strong>Q${i+1}:</strong> ${isCorrect ? 'Correct' : 'Incorrect'}</div>`;
      }).join('');
      if (recMcqDetails) recMcqDetails.innerHTML = details;
    }
  }

  // 6. Reflections
  var extra = document.getElementById('rec-extra');
  var extraPrint = document.getElementById('rec-extra-print');
  if (extra && extraPrint) {
    extraPrint.textContent = extra.value || 'No additional reflections provided.';
  }
}

function exportLearningRecord() {
  // Update print-only reflection before printing
  var extra = document.getElementById('rec-extra');
  var extraPrint = document.getElementById('rec-extra-print');
  if (extra && extraPrint) {
    extraPrint.textContent = extra.value || 'No additional reflections provided.';
  }
  window.print();
}

function finishModule() { document.getElementById('finish-overlay').classList.add('show'); }
function closeOverlay() { document.getElementById('finish-overlay').classList.remove('show'); }

window.populateLearningRecord = populateLearningRecord;
window.exportLearningRecord = exportLearningRecord;
window.finishModule = finishModule;
window.closeOverlay = closeOverlay;
