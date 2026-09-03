/* ══════════════════════════════════════════════════════════
   knowledge-check.js — Page 8: five-question recap quiz with
   immediate feedback, drawing on every earlier section.
══════════════════════════════════════════════════════════ */

const quizQuestions = [
  {
    prompt: 'Simon is showing carer strain, and Sophie needs a bereavement referral. Which pillar of wellbeing covers this?',
    options: ['Physical', 'Psychological & Spiritual', 'Financial', 'Family & Carer'],
    correct: 3,
    explanation: 'The Family & Carer pillar covers the wellbeing of relatives and carers, not just the patient — including carer strain and a child\'s bereavement needs.'
  },
  {
    prompt: 'During the living room assessment, which finding was flagged as a high-risk safeguarding concern?',
    options: ['The armchair fabric', 'Unsecured medication within easy reach', 'The room\'s wallpaper', 'A framed photograph'],
    correct: 1,
    explanation: 'Multiple unsecured medications on a low table raise a real risk of accidental overdose or confusion between doses.'
  },
  {
    prompt: 'What has Helen clearly said about where she wants to be cared for?',
    options: ['She wants to be admitted to hospital', 'She wants to remain at home for as long as possible', 'She has no preference', 'She wants to move into residential care'],
    correct: 1,
    explanation: 'Helen has expressed a strong wish to remain at home for as long as possible, and does not want to die in hospital.'
  },
  {
    prompt: 'In the first-visit scenario, why was acknowledging Simon\'s exhaustion the strongest opening response?',
    options: ['It saved time on the visit', 'It built trust and opened the door to a deeper conversation', 'It matched hospital protocol exactly', 'It avoided discussing Helen\'s symptoms'],
    correct: 1,
    explanation: 'Naming what you see builds trust — that\'s what made Simon willing to open up about the pressure the family is under.'
  },
  {
    prompt: 'On a ReSPECT form, what does "DNACPR" mean?',
    options: ['Do Not Attempt Cardiopulmonary Resuscitation', 'Do Not Admit to Care Provider Review', 'Discharge Notice and Care Plan Report', 'Daily Nursing and Clinical Progress Record'],
    correct: 0,
    explanation: 'DNACPR stands for "Do Not Attempt Cardiopulmonary Resuscitation" — a clinical recommendation, confirmed for Helen and recorded in her notes.'
  }
];

let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

function initKnowledgeCheck() {
  quizIndex = 0;
  quizScore = 0;
  renderQuizQuestion();
}

function renderQuizProgress() {
  const el = document.getElementById('quiz-progress');
  if (!el) return;
  const dots = quizQuestions.map((_, i) => {
    let state = 'upcoming';
    if (i < quizIndex) state = 'done';
    if (i === quizIndex) state = 'current';
    return `<span class="quiz-dot quiz-dot-${state}" aria-hidden="true"></span>`;
  }).join('');
  el.innerHTML = `${dots}<span class="quiz-progress-text">Question ${Math.min(quizIndex + 1, quizQuestions.length)} of ${quizQuestions.length}</span>`;
}

function renderQuizQuestion() {
  quizAnswered = false;
  renderQuizProgress();
  const card = document.getElementById('quiz-card');
  if (!card) return;

  if (quizIndex >= quizQuestions.length) {
    renderQuizResults();
    return;
  }

  const q = quizQuestions[quizIndex];
  card.innerHTML = `
    <h3 class="quiz-question">${q.prompt}</h3>
    <div class="quiz-options" id="quiz-options">
      ${q.options.map((opt, i) => `
        <button class="quiz-option" data-index="${i}" onclick="answerQuiz(${i})" aria-label="${opt}">
          <span class="quiz-option-marker" aria-hidden="true">${String.fromCharCode(65 + i)}</span>
          <span>${opt}</span>
        </button>
      `).join('')}
    </div>
    <div class="quiz-explanation" id="quiz-explanation" role="alert" aria-live="polite"></div>
    <button class="btn-next" id="quiz-next-btn" hidden onclick="nextQuizQuestion()">
      ${quizIndex === quizQuestions.length - 1 ? 'See My Results' : 'Next Question'} →
    </button>
  `;
}

function answerQuiz(i) {
  if (quizAnswered) return;
  quizAnswered = true;

  const q = quizQuestions[quizIndex];
  const correct = i === q.correct;
  if (correct) quizScore++;

  document.querySelectorAll('#quiz-options .quiz-option').forEach((btn, idx) => {
    btn.onclick = null;
    btn.setAttribute('aria-disabled', 'true');
    if (idx === q.correct) btn.classList.add('correct');
    else if (idx === i) btn.classList.add('incorrect');
  });

  const exp = document.getElementById('quiz-explanation');
  exp.className = 'quiz-explanation show ' + (correct ? 'best' : 'poor');
  exp.innerHTML = `<div class="feedback-badge">${correct ? '✅ Correct' : '❌ Not quite'}</div><p>${q.explanation}</p>`;

  // Report this individual answer to the LRS (see js/xapi-wrapper.js)
  if (typeof xapiSendAnswered === 'function') {
    xapiSendAnswered(
      'quiz/q' + (quizIndex + 1),
      q.prompt,
      q.options[i],
      correct,
      q.options
    );
  }

  const nextBtn = document.getElementById('quiz-next-btn');
  nextBtn.hidden = false;
  nextBtn.focus();
}

function nextQuizQuestion() {
  quizIndex++;
  renderQuizQuestion();
}

function renderQuizResults() {
  const card = document.getElementById('quiz-card');
  const progress = document.getElementById('quiz-progress');
  if (progress) progress.innerHTML = '';
  if (!card) return;

  const total = quizQuestions.length;
  const pct = Math.round((quizScore / total) * 100);
  const strong = pct >= 80;

  card.innerHTML = `
    <div class="quiz-results">
      <div class="quiz-results-score">${quizScore}/${total}</div>
      <h3 class="quiz-question" style="margin-bottom:6px;">${strong ? 'Great work.' : 'Good effort.'}</h3>
      <p style="color:var(--text-muted); font-size:0.9rem; line-height:1.7; max-width:440px; margin:0 auto 24px;">
        ${strong
          ? 'You\'ve got a solid grasp of Helen\'s care — her preferences, the risks in her home, the Four Pillars, and the ReSPECT process.'
          : 'Worth a quick look back over the Four Pillars and Helen\'s notes before your next real assessment — you can retake this check any time.'}
      </p>
      <div style="display:flex; gap:14px; justify-content:center; flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="initKnowledgeCheck()" aria-label="Retake the check">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          Retake
        </button>
        <button class="btn btn-primary" onclick="finishModule()" aria-label="Finish the module">
          Finish Module <span aria-hidden="true">✓</span>
        </button>
      </div>
    </div>
  `;

  // Report the score and mark completion with the LRS, if one is present
  if (typeof xapiSendScoreAndComplete === 'function') xapiSendScoreAndComplete(quizScore, total);
}

function finishModule() {
  const card = document.getElementById('quiz-card');
  if (card) {
    card.innerHTML = `
      <div class="quiz-results">
        <div class="quiz-results-score" style="font-size:2.4rem;">✓</div>
        <h3 class="quiz-question">Module complete</h3>
        <p style="color:var(--text-muted); font-size:0.9rem; line-height:1.7; max-width:420px; margin:0 auto;">
          Thank you for spending this time getting to know Helen and her family. You can close this window,
          or use the menu to revisit any section.
        </p>
      </div>
    `;
  }
}
