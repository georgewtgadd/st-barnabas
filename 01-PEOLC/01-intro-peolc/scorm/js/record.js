/* ══════════════════════════════════════════════════════════
   js/record.js  ·  Learning record population & export
══════════════════════════════════════════════════════════ */

function populateLearningRecord() {
  // Date
  const dateEl = document.getElementById('rec-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Sort
  const sortScore  = document.getElementById('rec-sort-score');
  const sortBadge  = document.getElementById('rec-sort-badge');
  const res        = window._sortResult;
  const placements = window._sortPlacements || {};
  const attempted  = Object.keys(placements).length;
  if (sortScore) sortScore.textContent = res === 'all-correct' ? '6 / 6 — All correct ✓' : attempted > 0 ? attempted + ' / 6 placed' : 'Not attempted';
  if (sortBadge) {
    sortBadge.textContent = res === 'all-correct' ? 'Completed' : attempted > 0 ? 'Partial' : '—';
    sortBadge.className = 'record-badge ' + (res === 'all-correct' ? 'badge-pass' : attempted > 0 ? 'badge-done' : '');
  }

  // Reflection
  const reflText  = document.getElementById('rec-reflection-text');
  const reflBadge = document.getElementById('rec-reflect-badge');
  const rText     = window._reflectionText || (document.getElementById('reflect-input') ? document.getElementById('reflect-input').value.trim() : '');
  if (reflText) {
    reflText.textContent = rText || 'No reflection recorded.';
    reflText.className   = 'record-reflection-text' + (rText ? '' : ' empty');
  }
  if (reflBadge) {
    reflBadge.textContent = rText ? 'Saved' : '—';
    reflBadge.className   = 'record-badge ' + (rText ? 'badge-pass' : '');
  }

  // Vignettes
  const va     = window.vignetteAnswered || { 1: null, 2: null, 3: null };
  const vigBadge = document.getElementById('rec-vig-badge');
  const labels = { 1: 'rec-vig-1', 2: 'rec-vig-2', 3: 'rec-vig-3' };
  const names  = { 1: 'Margaret', 2: 'David', 3: 'Priya' };
  let   allCorrect = true;
  [1,2,3].forEach(n => {
    const el = document.getElementById(labels[n]);
    const v  = va[n];
    if (el) {
      if (!v) { el.textContent = '—'; allCorrect = false; }
      else {
        const choice = v.choice ? 'Yes' : 'No';
        el.innerHTML = v.correct
          ? '<span style="color:#059669;font-weight:600;">✓ Correct (' + choice + ')</span>'
          : '<span style="color:#dc2626;font-weight:600;">✗ Incorrect (' + choice + ')</span>';
        if (!v.correct) allCorrect = false;
      }
    }
  });
  if (vigBadge) {
    const attempted3 = [1,2,3].filter(n => va[n] !== null).length;
    vigBadge.textContent = allCorrect && attempted3 === 3 ? 'All Correct' : attempted3 > 0 ? attempted3 + '/3 answered' : '—';
    vigBadge.className   = 'record-badge ' + (allCorrect && attempted3 === 3 ? 'badge-pass' : attempted3 > 0 ? 'badge-done' : '');
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
  const va    = window.vignetteAnswered || {};
  const v1    = va[1] ? (va[1].correct ? 'Correct (Yes)' : 'Incorrect') : '—';
  const v2    = va[2] ? (va[2].correct ? 'Correct (No)'  : 'Incorrect') : '—';
  const v3    = va[3] ? (va[3].correct ? 'Correct (Yes)' : 'Incorrect') : '—';

  const lines = [
    'ST BARNABAS HOSPICE — LEARNING RECORD',
    '════════════════════════════════════════════════',
    'Module:       What is End of Life Palliative Care?',
    'Series:       Palliative Care Fundamentals · Module 1',
    'Date:         ' + new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }),
    '',
    'MYTH OR FACT ACTIVITY',
    '────────────────────────────────────────────────',
    'Score: ' + (window._sortResult === 'all-correct' ? '6 / 6 — All correct' : 'Partial'),
    '',
    'REFLECTIVE ACTIVITY',
    '────────────────────────────────────────────────',
    window._reflectionText || (document.getElementById('reflect-input') ? document.getElementById('reflect-input').value.trim() : '') || 'No reflection recorded.',
    '',
    'PATIENT VIGNETTES',
    '────────────────────────────────────────────────',
    'Margaret (81, heart failure):   ' + v1,
    'David (58, post-hip replace):   ' + v2,
    'Priya (67, MND):                ' + v3,
    '',
    'KNOWLEDGE CHECK (True or False)',
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
  a.download = 'learning-record-eolpc.txt';
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
