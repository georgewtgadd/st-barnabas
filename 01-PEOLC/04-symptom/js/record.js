/* ══════════════════════════════════════════════════════════
   js/record.js  ·  Learning record — page 11
══════════════════════════════════════════════════════════ */

function populateLearningRecord() {
  /* Date */
  const dateEl = document.getElementById('rec-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  /* ── Page 2 — DnD ─────────────────────────────── */
  const dndScore = document.getElementById('rec-dnd-score');
  const dndBadge = document.getElementById('rec-dnd-badge');
  const dndRes   = window._dndResult;
  if (dndScore) dndScore.textContent = dndRes || 'Not completed';
  if (dndBadge) {
    dndBadge.textContent = dndRes && dndRes.includes('6 / 6') ? 'All Correct' : dndRes ? 'Completed' : '—';
    dndBadge.className   = 'record-badge ' + (dndRes && dndRes.includes('6 / 6') ? 'badge-pass' : dndRes ? 'badge-done' : '');
  }

  /* ── Page 4 — Categorisation ──────────────────── */
  const catScore = document.getElementById('rec-cat-score');
  const catBadge = document.getElementById('rec-cat-badge');
  const catRes   = window._catResult;
  if (catScore) catScore.textContent = catRes || 'Not completed';
  if (catBadge) {
    const allCat = catRes && catRes.startsWith('6');
    catBadge.textContent = catRes ? catRes : '—';
    catBadge.className   = 'record-badge ' + (allCat ? 'badge-pass' : catRes ? 'badge-done' : '');
  }

  /* ── Page 5 — ABC ─────────────────────────────── */
  const abcScore = document.getElementById('rec-abc-score');
  const abcBadge = document.getElementById('rec-abc-badge');
  const abcRes   = window._abcResult;
  if (abcScore) abcScore.textContent = abcRes || 'Not completed';
  if (abcBadge) {
    abcBadge.textContent = abcRes ? (abcRes.includes('Correct') ? 'Correct' : 'Reviewed') : '—';
    abcBadge.className   = 'record-badge ' + (abcRes && abcRes.includes('Correct') ? 'badge-pass' : abcRes ? 'badge-done' : '');
  }

  /* ── Page 9 — Seizure sequence ────────────────── */
  const seqScore = document.getElementById('rec-seq-score');
  const seqBadge = document.getElementById('rec-seq-badge');
  const seqRes   = window._seqResult;
  if (seqScore) seqScore.textContent = seqRes || 'Not completed';
  if (seqBadge) {
    seqBadge.textContent = seqRes ? (seqRes.includes('Correct') ? 'Correct' : 'Reviewed') : '—';
    seqBadge.className   = 'record-badge ' + (seqRes && seqRes.includes('Correct') ? 'badge-pass' : seqRes ? 'badge-done' : '');
  }

  /* ── Page 10 — Case studies ───────────────────── */
  const casesScore = document.getElementById('rec-cases-score');
  const casesResult= document.getElementById('rec-cases-result');
  const casesBadge = document.getElementById('rec-cases-badge');
  if (casesScore)  casesScore.textContent  = window._casesScore  || '—';
  if (casesResult) {
    casesResult.innerHTML = window._casesPassed === true
      ? '<span style="color:#059669;font-weight:600;">PASS</span>'
      : window._casesPassed === false
      ? '<span style="color:#dc2626;font-weight:600;">NOT YET PASSED</span>'
      : '—';
  }
  if (casesBadge) {
    casesBadge.textContent = window._casesPassed === true ? 'Pass' : window._casesPassed === false ? 'Not Passed' : '—';
    casesBadge.className   = 'record-badge ' + (window._casesPassed === true ? 'badge-pass' : window._casesPassed === false ? 'badge-fail' : '');
  }

  /* Per-question breakdown */
  const breakdown = document.getElementById('rec-cases-breakdown');
  if (breakdown && typeof _casesAnswers !== 'undefined' && _casesAnswers.length) {
    breakdown.innerHTML = '';
    _casesAnswers.forEach((ans, i) => {
      if (!ans.answered) return;
      const q   = typeof _casesShuffled !== 'undefined' ? _casesShuffled[i] : casesData[i];
      const div = document.createElement('div');
      div.className = 'record-q-item ' + (ans.correct ? 'correct-q' : 'wrong-q');
      div.innerHTML = `<strong>Case ${i+1}: ${casesData[i].patient}</strong><br>
        <span style="color:${ans.correct ? '#059669' : '#dc2626'};font-weight:600;">${ans.correct ? '✓ Correct' : '✗ Incorrect'}</span>`;
      breakdown.appendChild(div);
    });
  }
}

/* ── EXPORT ────────────────────────────────────────── */
function exportLearningRecord() {
  const notes = (document.getElementById('rec-notes') || {}).value || '';

  const lines = [
    'SBH EDUCATION — LEARNING RECORD',
    '════════════════════════════════════════════════════',
    'Module:       Symptom Management & Emergencies',
    'Series:       Clinical Excellence · Module 4',
    'Organisation: SBH Education',
    'Date:         ' + new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }),
    '',
    'PAGE 2 — RESPIRATORY: Intervention Matching (Drag & Drop)',
    '────────────────────────────────────────────────────',
    window._dndResult || 'Not completed',
    '',
    'PAGE 4 — PALLIATIVE EMERGENCIES: Categorisation',
    '────────────────────────────────────────────────────',
    window._catResult || 'Not completed',
    '',
    'PAGE 5 — TERMINAL HAEMORRHAGE: ABC Sequence',
    '────────────────────────────────────────────────────',
    window._abcResult || 'Not completed',
    '',
    'PAGE 9 — SEIZURES: Step Ordering',
    '────────────────────────────────────────────────────',
    window._seqResult || 'Not completed',
    '',
    'PAGE 10 — CASE STUDIES: MCQ Assessment',
    '────────────────────────────────────────────────────',
    'Score:  ' + (window._casesScore  || '—'),
    'Result: ' + (window._casesPassed === true ? 'PASS' : window._casesPassed === false ? 'NOT YET PASSED' : '—'),
  ];

  if (typeof _casesAnswers !== 'undefined' && _casesAnswers.length) {
    lines.push('');
    lines.push('Case-by-case:');
    _casesAnswers.forEach((ans, i) => {
      lines.push(`  Case ${i+1} (${casesData[i].patient}): ${ans.answered ? (ans.correct ? 'Correct' : 'Incorrect') : 'Not answered'}`);
    });
  }

  lines.push('');
  lines.push('ADDITIONAL NOTES');
  lines.push('────────────────────────────────────────────────────');
  lines.push(notes || 'None');
  lines.push('');
  lines.push('════════════════════════════════════════════════════');
  lines.push('Generated by SBH Education E-Learning Platform');

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'learning-record-m4-symptom-emergencies.txt';
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ── FINISH MODULE ─────────────────────────────────── */
function finishModule() {
  if (typeof SCORM !== 'undefined') {
    SCORM.setCompletion('completed');
    SCORM.finish('completed', null);
  }
  const overlay = document.getElementById('finish-overlay');
  if (overlay) overlay.classList.add('show');
}
