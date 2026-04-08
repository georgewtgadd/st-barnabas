/* ══════════════════════════════════════════════════════════
   js/record.js  ·  Learning record population & export
══════════════════════════════════════════════════════════ */

function populateLearningRecord() {
  // Date
  const dateEl = document.getElementById('rec-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Communication activity (page 3)
  const commBadge = document.getElementById('rec-comm-badge');
  const commScore = document.getElementById('rec-comm-score');
  const commR     = window._commResult;
  if (commScore) commScore.textContent = commR === 'correct' ? 'Correct — B, C, E selected ✓' : commR === 'incorrect' ? 'Attempted — not all correct' : 'Not attempted';
  if (commBadge) {
    commBadge.textContent = commR === 'correct' ? 'Completed' : commR === 'incorrect' ? 'Partial' : '—';
    commBadge.className   = 'record-badge ' + (commR === 'correct' ? 'badge-pass' : commR === 'incorrect' ? 'badge-done' : '');
  }

  // Flashcards (page 4)
  const flashBadge = document.getElementById('rec-flash-badge');
  const flashScore = document.getElementById('rec-flash-score');
  const flashR     = window._flashcardsResult;
  if (flashScore) flashScore.textContent = flashR === 'completed' ? 'All 5 principles explored ✓' : 'Not completed';
  if (flashBadge) {
    flashBadge.textContent = flashR === 'completed' ? 'Completed' : '—';
    flashBadge.className   = 'record-badge ' + (flashR === 'completed' ? 'badge-pass' : '');
  }

  // Capacity ordering (page 5)
  const capBadge = document.getElementById('rec-cap-badge');
  const capScore = document.getElementById('rec-cap-score');
  const capR     = window._capResult;
  if (capScore) capScore.textContent = capR === 'correct' ? 'Correct order identified ✓' : capR === 'incorrect' ? 'Attempted — order incorrect' : 'Not attempted';
  if (capBadge) {
    capBadge.textContent = capR === 'correct' ? 'Correct' : capR === 'incorrect' ? 'Attempted' : '—';
    capBadge.className   = 'record-badge ' + (capR === 'correct' ? 'badge-pass' : capR === 'incorrect' ? 'badge-done' : '');
  }

  // Scenario (page 8)
  const scenBadge = document.getElementById('rec-scen-badge');
  const scenScore = document.getElementById('rec-scen-score');
  const scenR     = window._scenarioResult;
  if (scenScore) scenScore.textContent = scenR === 'completed' ? 'All 3 stages completed correctly ✓' : 'Not completed';
  if (scenBadge) {
    scenBadge.textContent = scenR === 'completed' ? 'Completed' : '—';
    scenBadge.className   = 'record-badge ' + (scenR === 'completed' ? 'badge-pass' : '');
  }

  // Quiz
  const qScore  = document.getElementById('rec-quiz-score');
  const qResult = document.getElementById('rec-quiz-result');
  const qBadge  = document.getElementById('rec-quiz-badge');
  if (qScore)  qScore.textContent  = window._quizScoreText || '—';
  if (qResult) qResult.innerHTML   = window._quizPassed === true
    ? '<span style="color:#059669;font-weight:600;">PASS</span>'
    : window._quizPassed === false
    ? '<span style="color:#dc2626;font-weight:600;">NOT YET PASSED</span>'
    : '—';
  if (qBadge) {
    qBadge.textContent = window._quizPassed === true ? 'Pass' : window._quizPassed === false ? 'Not Passed' : '—';
    qBadge.className   = 'record-badge ' + (window._quizPassed === true ? 'badge-pass' : window._quizPassed === false ? 'badge-fail' : '');
  }
}

function exportLearningRecord() {
  const notes = (document.getElementById('rec-notes') || {}).value || '';

  const lines = [
    'ST BARNABAS HOSPICE — LEARNING RECORD',
    '════════════════════════════════════════════════',
    'Module:       Communication & Advance Care Planning',
    'Series:       Palliative Care Fundamentals · Module 2',
    'Date:         ' + new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }),
    '',
    'COMMUNICATION IN PRACTICE (7-38-55 Activity)',
    '────────────────────────────────────────────────',
    'Result: ' + (window._commResult === 'correct' ? 'Correct — Actions B, C, E identified' : window._commResult || 'Not attempted'),
    '',
    'MCA PRINCIPLES (Flashcards)',
    '────────────────────────────────────────────────',
    'Result: ' + (window._flashcardsResult === 'completed' ? 'All 5 principles explored' : 'Not completed'),
    '',
    'CAPACITY ASSESSMENT (Two-Stage Ordering)',
    '────────────────────────────────────────────────',
    'Result: ' + (window._capResult === 'correct' ? 'Correct order identified' : window._capResult || 'Not attempted'),
    '',
    'BEST INTERESTS BRANCHING SCENARIO',
    '────────────────────────────────────────────────',
    'Result: ' + (window._scenarioResult === 'completed' ? 'All 3 stages completed successfully' : 'Not completed'),
    '',
    'KNOWLEDGE CHECK (MCQ)',
    '────────────────────────────────────────────────',
    'Score:  ' + (window._quizScoreText || '—'),
    'Result: ' + (window._quizPassed === true ? 'PASS' : window._quizPassed === false ? 'NOT YET PASSED' : '—'),
    '',
    'ADDITIONAL NOTES',
    '────────────────────────────────────────────────',
    notes || 'None',
    '',
    '════════════════════════════════════════════════',
    'Generated by St Barnabas Hospice E-Learning Platform',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'learning-record-cacp.txt';
  a.click();
  URL.revokeObjectURL(a.href);
}

function finishModule() {
  if (typeof SCORM !== 'undefined') {
    SCORM.setCompletion('completed');
    SCORM.finish();
  }
  const overlay = document.getElementById('finish-overlay');
  if (overlay) overlay.classList.add('show');
}

function closeOrRedirect() {
  try { window.close(); } catch (e) {}
  const overlay = document.getElementById('finish-overlay');
  if (overlay) overlay.classList.remove('show');
}
