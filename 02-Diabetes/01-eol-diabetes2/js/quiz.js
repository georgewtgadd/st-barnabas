/* quiz.js — one-question-at-a-time MCQ, mirroring palliative module style */
'use strict';

const QUIZ_DATA = [
  {
    q: 'Which pancreatic cell type secretes insulin when blood glucose rises after a meal?',
    options: ['Alpha cells', 'Beta cells', 'Delta cells'],
    correct: 1,
    feedback: {
      correct: 'Correct. <strong>Beta cells</strong> secrete insulin in response to rising glucose, helping tissues take up glucose and lowering blood sugar.',
      wrong: 'Not quite. The correct answer is <strong>beta cells</strong>. Alpha cells secrete glucagon, while delta cells secrete somatostatin.'
    }
  },
  {
    q: 'Which statement best describes the exocrine function of the pancreas?',
    options: ['It releases insulin directly into the bloodstream', 'It produces digestive enzymes that empty into the duodenum', 'It stores glucose as glycogen in muscle'],
    correct: 1,
    feedback: {
      correct: 'Correct. The <strong>exocrine pancreas</strong> secretes digestive enzymes through ducts into the duodenum to support nutrient breakdown and absorption.',
      wrong: 'Not quite. The exocrine pancreas <strong>produces digestive enzymes that empty into the duodenum</strong>. Releasing insulin into blood is an endocrine function.'
    }
  },
  {
    q: 'A patient with chronic pancreatitis now requires both insulin and pancreatic enzyme replacement therapy. Which type of diabetes is most likely?',
    options: ['Type I', 'Type 3c', 'MODY'],
    correct: 1,
    feedback: {
      correct: 'Correct. <strong>Type 3c</strong> follows exocrine pancreatic damage, so patients may need both insulin and pancreatic enzyme replacement therapy.',
      wrong: 'Not quite. The answer is <strong>Type 3c</strong>, which occurs after pancreatic disease such as chronic pancreatitis.'
    }
  },
  {
    q: 'A lean undernourished patient has severe hyperglycaemia with marked insulin deficiency but no autoimmune markers. Which classification best fits this presentation?',
    options: ['Type II diabetes', 'Malnutrition-related / SIDD phenotype', 'Gestational diabetes'],
    correct: 1,
    feedback: {
      correct: 'Correct. This pattern is consistent with <strong>malnutrition-related diabetes or a severe insulin-deficient (SIDD) phenotype</strong>, where the problem is not classic obesity-driven Type 2 diabetes.',
      wrong: 'Not quite. The best answer is <strong>malnutrition-related / SIDD phenotype</strong>, reflecting severe insulin deficiency in a lean or undernourished patient.'
    }
  },
  {
    q: 'Why do corticosteroids require active glucose monitoring in people with or at risk of diabetes?',
    options: ['They always cause hypoglycaemia', 'They can unmask new diabetes or worsen existing glycaemic control', 'They block glucagon release completely'],
    correct: 1,
    feedback: {
      correct: 'Correct. <strong>Corticosteroids can unmask previously undiagnosed diabetes and worsen existing hyperglycaemia</strong>, so monitoring and treatment adjustment are often needed.',
      wrong: 'Not quite. The correct answer is that <strong>corticosteroids can unmask new diabetes or worsen existing control</strong>, which is why active management is required.'
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

  q.options.forEach((_, j) => {
    const btn = document.getElementById('qopt-' + j);
    if (!btn) return;
    btn.disabled = true;
    if (j === q.correct) btn.classList.add('correct');
    else if (j === optIdx && !isCorrect) btn.classList.add('incorrect');
  });

  const fb = document.getElementById('q-fb');
  if (fb) {
    fb.style.display = 'flex';
    fb.className = 'q-feedback ' + (isCorrect ? 'correct-fb' : 'wrong-fb');
    fb.innerHTML = (isCorrect ? '✅ ' : '❌ ') + (isCorrect ? q.feedback.correct : q.feedback.wrong);
  }

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
        ? 'Well done. You have demonstrated a solid understanding of the physiology and classification concepts in this package. Proceed to your Learning Record.'
        : 'You scored ' + score + ' out of ' + QUIZ_DATA.length + '. Review the relevant sections if you wish. You can still proceed to your Learning Record.'}</div>
    </div>`;

  const nav = document.getElementById('quiz-nav');
  if (nav) nav.style.display = 'flex';
}
