/* quiz.js — one-question-at-a-time MCQ, mirroring palliative module style */
'use strict';

const QUIZ_DATA = [
  {
    q: 'According to NICE guidelines, what is the post-prandial (at least 90 minutes after meals) target for a person with Type 2 Diabetes?',
    options: ['Under 7.8 mmol/L', 'Under 8.5 mmol/L', '5 to 9 mmol/L'],
    correct: 1,
    feedback: {
      correct: 'Correct! The NICE post-prandial target for Type 2 Diabetes is under 8.5 mmol/L. Note that under 7.8 mmol/L is the reference figure for non-diabetics, and 5–9 mmol/L is the target for Type 1 Diabetes.',
      wrong: 'Not quite. The NICE post-prandial target for Type 2 Diabetes is <strong>under 8.5 mmol/L</strong>. Under 7.8 mmol/L is the non-diabetic reference figure, while 5–9 mmol/L applies to Type 1 Diabetes.'
    }
  },
  {
    q: 'A lean, older patient presents with insulin resistance that is not associated with obesity. Which type of diabetes does research suggest this might be?',
    options: ['Type II', 'Type 3c', 'Type IV'],
    correct: 2,
    feedback: {
      correct: 'Correct! Type IV diabetes describes insulin resistance in older, lean individuals where the typical obesity-associated pathway does not apply.',
      wrong: 'Not quite. The answer is <strong>Type IV</strong> — insulin resistance in older, lean individuals not associated with obesity, distinct from the typical Type 2 pathway.'
    }
  },
  {
    q: 'Which hormone is responsible for the "lock and key" action that allows glucose to enter body cells for energy?',
    options: ['Glucagon', 'Insulin', 'Somatostatin'],
    correct: 1,
    feedback: {
      correct: 'Correct! Insulin is the "key" that binds to receptors on cell membranes, triggering translocation of GLUT4 glucose transporters — unlocking the cell to allow glucose entry.',
      wrong: 'Not quite. The answer is <strong>insulin</strong>. Glucagon has the opposite effect — raising blood glucose. Somatostatin regulates other islet cells.'
    }
  },
  {
    q: 'A patient with chronic pancreatitis now requires both insulin and pancreatic enzyme replacement therapy. Which type of diabetes is most likely?',
    options: ['Type I', 'Type 3c', 'Type V'],
    correct: 1,
    feedback: {
      correct: 'Correct! Type 3c (pancreatogenic diabetes) arises from exocrine pancreas damage — such as chronic pancreatitis — which simultaneously destroys the Islets of Langerhans.',
      wrong: 'Not quite. The answer is <strong>Type 3c</strong>. Chronic pancreatitis damages both the exocrine pancreas and adjacent Islets — causing insulin deficiency and exocrine insufficiency.'
    }
  },
  {
    q: 'Which hormone, often released during stress, rapidly increases blood glucose to provide immediate energy?',
    options: ['Adrenaline', 'Cortisol', 'Glycogen'],
    correct: 0,
    feedback: {
      correct: 'Correct! Adrenaline, released from the adrenal medulla in response to acute stress, rapidly mobilises glucose for the fight-or-flight response.',
      wrong: 'Not quite. The answer is <strong>Adrenaline</strong>. Cortisol acts more slowly over hours to days. Glycogen is not a hormone — it is the stored form of glucose.'
    }
  }
];

/* ── State ─────────────────────────────────────────── */
let _qIdx      = 0;
let _answers   = {};
let _dotStates = [];

/* ══ INIT ════════════════════════════════════════════ */
function renderQuiz() {
  _qIdx      = 0;
  _answers   = {};
  _dotStates = QUIZ_DATA.map(() => 'unanswered');
  window._quizScore   = null;
  window._quizPct     = null;
  window._quizPassed  = null;
  window._quizAnswers = {};
  _renderQuestion(_qIdx);
}

/* ── Progress bar ───────────────────────────────────── */
function _buildProgress() {
  const wrap = document.getElementById('quiz-wrap');
  if (!wrap) return;
  let bar = document.getElementById('quiz-progress-bar');
  if (bar) bar.remove();
  bar = document.createElement('div');
  bar.id = 'quiz-progress-bar';
  bar.className = 'quiz-progress-bar';
  bar.innerHTML =
    '<span class="qpb-label">Question</span>' +
    '<div class="qpb-dots">' +
    QUIZ_DATA.map((_, i) => '<div class="qpb-dot" id="qpbdot-' + i + '"></div>').join('') +
    '</div>' +
    '<span class="qpb-counter" id="qpb-counter">1 / ' + QUIZ_DATA.length + '</span>';
  wrap.insertAdjacentElement('beforebegin', bar);
}

function _updateProgress() {
  QUIZ_DATA.forEach((_, i) => {
    const dot = document.getElementById('qpbdot-' + i);
    if (!dot) return;
    dot.className = 'qpb-dot ' + _dotStates[i];
  });
  const ctr = document.getElementById('qpb-counter');
  if (ctr) ctr.textContent = (_qIdx + 1) + ' / ' + QUIZ_DATA.length;
}

/* ── Render single question ─────────────────────────── */
function _renderQuestion(idx) {
  const wrap = document.getElementById('quiz-wrap');
  if (!wrap) return;
  _buildProgress();

  const q      = QUIZ_DATA[idx];
  const isLast = idx === QUIZ_DATA.length - 1;

  wrap.innerHTML = `
    <div class="quiz-q" id="qq-current">
      <div class="qnum">Question ${idx + 1} of ${QUIZ_DATA.length}</div>
      <div class="qtext">${q.q}</div>
      <div class="q-options" id="q-opts">
        ${q.options.map((opt, j) => `
          <button class="q-option" id="qopt-${j}"
                  onclick="selectAnswer(${idx},${j})"
                  aria-label="Option ${String.fromCharCode(65+j)}: ${opt}">
            <div class="opt-letter">${String.fromCharCode(65 + j)}</div>
            <span>${opt}</span>
          </button>`).join('')}
      </div>
      <div class="q-feedback" id="q-fb" style="display:none;"></div>
      <div class="quiz-next-row quiz-nav-hidden" id="quiz-next-row">
        <button class="btn btn-primary" onclick="${isLast ? 'showQuizResults()' : '_nextQuestion()'}">
          ${isLast ? 'See Results →' : 'Next →'}
        </button>
      </div>
    </div>`;

  _updateProgress();
}

/* ══ ANSWER ══════════════════════════════════════════ */
function selectAnswer(qIdx, optIdx) {
  if (_answers[qIdx] !== undefined) return;
  _answers[qIdx] = optIdx;
  window._quizAnswers = { ..._answers };

  const q         = QUIZ_DATA[qIdx];
  const isCorrect = optIdx === q.correct;
  _dotStates[qIdx] = isCorrect ? 'correct' : 'incorrect';

  // Style options
  q.options.forEach((_, j) => {
    const btn = document.getElementById('qopt-' + j);
    if (!btn) return;
    btn.disabled = true;
    if (j === q.correct)             btn.classList.add('correct');
    else if (j === optIdx && !isCorrect) btn.classList.add('incorrect');
  });

  // Feedback
  const fb = document.getElementById('q-fb');
  if (fb) {
    fb.style.display = 'flex';
    fb.className = 'q-feedback ' + (isCorrect ? 'correct-fb' : 'wrong-fb');
    fb.innerHTML = (isCorrect ? '✅ ' : '❌ ') + (isCorrect ? q.feedback.correct : q.feedback.wrong);
  }

  // Show next button
  const nextRow = document.getElementById('quiz-next-row');
  if (nextRow) nextRow.classList.remove('quiz-nav-hidden');

  _updateProgress();
}

function _nextQuestion() {
  _qIdx++;
  if (_qIdx < QUIZ_DATA.length) _renderQuestion(_qIdx);
}

/* ══ RESULTS ═════════════════════════════════════════ */
function showQuizResults() {
  const score = QUIZ_DATA.reduce((s, q, i) => s + (_answers[i] === q.correct ? 1 : 0), 0);
  const pct   = Math.round((score / QUIZ_DATA.length) * 100);
  const pass  = pct >= 80;

  window._quizScore  = score;
  window._quizPct    = pct;
  window._quizPassed = pass;

  // Hide progress bar
  const bar = document.getElementById('quiz-progress-bar');
  if (bar) bar.remove();

  const wrap = document.getElementById('quiz-wrap');
  if (wrap) wrap.innerHTML = `
    <div class="quiz-results">
      <div class="qr-score-wrap">
        <div class="qr-score">${score}</div>
        <div class="qr-denom">out of ${QUIZ_DATA.length}</div>
        <div class="qr-pct">${pct}% score</div>
      </div>
      <div class="qr-badge ${pass ? 'pass' : 'fail'}">${pass ? '🎉 Passed' : '📚 Review Recommended'}</div>
      <div class="qr-message">${pass
        ? 'Well done! You have demonstrated a solid understanding of EoL diabetes management concepts. Proceed to your Learning Record.'
        : 'You scored ' + score + ' out of ' + QUIZ_DATA.length + '. Review the relevant sections if you wish. You can still proceed to your Learning Record.'}</div>
    </div>`;

  const nav = document.getElementById('quiz-nav');
  if (nav) nav.style.display = 'flex';
}
