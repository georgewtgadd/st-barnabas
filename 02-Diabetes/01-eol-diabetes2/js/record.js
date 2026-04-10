/* record.js — Learning record population, export, finish */
'use strict';

function populateRecord() {
  // Date
  const now = new Date();
  const dateEl = document.getElementById('rec-export-date');
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) + ' at ' + now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });

  // Dilemma reflection
  const reflEl  = document.getElementById('rec-dilemma-text');
  const textarea = document.getElementById('dilemma-reflection');
  if (reflEl) {
    const val = textarea && textarea.value.trim();
    reflEl.textContent = val || 'No reflection recorded.';
    if (!val) reflEl.style.color = '#9aacbc';
  }

  // Quiz score
  const scoreEl     = document.getElementById('rec-quiz-score');
  const breakdownEl = document.getElementById('rec-quiz-breakdown');
  const score  = window._quizScore  !== undefined ? window._quizScore  : null;
  const pct    = window._quizPct    !== undefined ? window._quizPct    : null;
  const passed = window._quizPassed !== undefined ? window._quizPassed : null;
  const answers = window._quizAnswers || {};
  const qdata   = window._quizDataRef || [];

  if (scoreEl) {
    if (score !== null) {
      const badge = passed ? '✅ Pass' : '📚 Review Recommended';
      scoreEl.innerHTML = `<strong style="color:var(--navy);font-size:1.1rem;">${score} / ${qdata.length}</strong> &nbsp;·&nbsp; ${pct}% &nbsp;·&nbsp; <span style="font-weight:600;color:${passed ? '#059669' : '#c0392b'};">${badge}</span>`;
    } else {
      scoreEl.textContent = 'Quiz not yet completed.';
    }
  }

  if (breakdownEl) {
    breakdownEl.innerHTML = '';
    Object.keys(answers).forEach(i => {
      const qi = parseInt(i);
      const qd = qdata[qi];
      if (!qd) return;
      const correct = answers[qi] === qd.correct;
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:7px 12px;background:#f8fafc;border:1px solid #e2eaf4;border-radius:6px;font-size:.8rem;';
      row.innerHTML = `<span style="color:#4a5a72;flex:1;padding-right:12px;">Q${qi + 1}: ${qd.q.length > 70 ? qd.q.substring(0,68) + '…' : qd.q}</span><span style="font-weight:700;color:${correct ? '#059669' : '#c0392b'};flex-shrink:0;">${correct ? '✓ Correct' : '✗ Incorrect'}</span>`;
      breakdownEl.appendChild(row);
    });
  }
}

function exportLearningRecord() {
  populateRecord();
  setTimeout(() => window.print(), 200);
}

function finishModule() {
  populateRecord();
  const overlay = document.getElementById('finish-overlay');
  if (overlay) overlay.classList.add('show');
}
