/* record.js — Learning record population and print */
'use strict';

function populateRecord() {
  const wrap = document.getElementById('record-wrap');
  if (!wrap) return;

  const now   = new Date();
  const score = window._quizScore  !== undefined ? window._quizScore  : '—';
  const pct   = window._quizPct    !== undefined ? window._quizPct + '%' : '—';
  const pass  = window._quizPassed !== undefined ? (window._quizPassed ? '✅ Pass' : '📚 Review') : '—';
  const answers = window._quizAnswers || {};

  const dateStr = now.toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });

  const QUIZ_DATA_REF = window._quizDataRef || [];
  const qRows = Object.keys(answers).map(i => {
    const qi = parseInt(i);
    const qData = QUIZ_DATA_REF[qi];
    const isCorrect = qData && answers[qi] === qData.correct;
    return `<div class="rsd-row">
      <div class="rsd-q">Q${qi + 1}: ${qData ? qData.q.substring(0,60) + '…' : 'Question ' + (qi+1)}</div>
      <div class="rsd-result ${isCorrect ? 'correct' : 'wrong'}">${isCorrect ? '✓ Correct' : '✗ Incorrect'}</div>
    </div>`;
  }).join('');

  wrap.innerHTML = `
    <div class="record-card">
      <div class="rec-section-label">📋 Module Details</div>
      <div class="rec-meta-grid">
        <div class="rec-meta-item"><div class="rec-meta-key">Module</div><div class="rec-meta-val">EoL Diabetes Management</div></div>
        <div class="rec-meta-item"><div class="rec-meta-key">Provider</div><div class="rec-meta-val">St Barnabas Hospice</div></div>
        <div class="rec-meta-item"><div class="rec-meta-key">Series</div><div class="rec-meta-val">Clinical Training · Module 2</div></div>
        <div class="rec-meta-item"><div class="rec-meta-key">Date Completed</div><div class="rec-meta-val">${dateStr}</div></div>
        <div class="rec-meta-item"><div class="rec-meta-key">Time</div><div class="rec-meta-val">${timeStr}</div></div>
        <div class="rec-meta-item"><div class="rec-meta-key">Quiz Result</div><div class="rec-meta-val">${pass}</div></div>
      </div>
    </div>

    <div class="record-card">
      <div class="rec-section-label">🎯 Learning Outcomes Achieved</div>
      <div class="rec-outcomes">
        <div class="rec-outcome"><div class="rec-outcome-tick">1</div><p>Explain the homeostatic cycle of insulin and glucagon in maintaining blood glucose levels.</p></div>
        <div class="rec-outcome"><div class="rec-outcome-tick">2</div><p>Differentiate between the five types of diabetes and their distinct pathophysiologies.</p></div>
        <div class="rec-outcome"><div class="rec-outcome-tick">3</div><p>Identify normal blood glucose ranges for non-diabetics versus those with Type 1 or Type 2 diabetes.</p></div>
      </div>
    </div>

    <div class="record-card">
      <div class="rec-section-label">📊 Knowledge Check Results</div>
      <div class="rec-score-display">
        <div class="rsd-big">
          <div class="rsd-score">${score}<span style="font-size:1.2rem;color:var(--text-muted)">/${QUIZ_DATA_REF.length || 5}</span></div>
          <div class="rsd-label">${pct} — ${pass}</div>
        </div>
        <div class="rsd-details">
          ${qRows || '<p style="font-size:0.84rem;color:var(--text-muted);">Complete the quiz to see your answers here.</p>'}
        </div>
      </div>
    </div>

    <div class="record-card">
      <div class="rec-section-label">📖 Reflective Note</div>
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:8px;padding:14px;">
        <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:8px;">Your reflection from the Clinical Dilemmas activity (Slide 2):</div>
        <div id="rec-reflection-text" style="font-size:0.88rem;color:var(--white);line-height:1.7;font-style:italic;">
          ${document.getElementById('dilemma-reflection') && document.getElementById('dilemma-reflection').value.trim()
            ? document.getElementById('dilemma-reflection').value.trim()
            : '<span style="color:var(--text-muted);">No reflection recorded.</span>'}
        </div>
      </div>
    </div>`;
}

function printRecord() {
  populateRecord();
  setTimeout(() => window.print(), 150);
}
