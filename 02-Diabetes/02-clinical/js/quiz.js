/* quiz.js — one-question-at-a-time MCQ */
'use strict';

const QUIZ_DATA = [
  {
    q: 'What is the recommended capillary blood glucose target range for a patient in the terminal phase of illness?',
    options: ['4.0 to 7.0 mmol/L', '6.0 to 15.0 mmol/L', 'Under 8.5 mmol/L'],
    correct: 1,
    feedback: {
      correct: 'Correct! In the terminal phase, targets are relaxed to 6–15 mmol/L to prioritise comfort. Tight control is no longer the goal — avoiding symptomatic hypoglycaemia is.',
      wrong: 'Not quite. The correct answer is <strong>6.0 to 15.0 mmol/L</strong>. In the terminal phase, glycaemic targets are deliberately relaxed. Tight control (4–7) is only appropriate for longer-term management, not at end of life.'
    }
  },
  {
    q: 'Which drug class carries the highest risk of causing hypoglycaemia if a patient reduces their food intake at end of life?',
    options: ['Metformin', 'SGLT2 Inhibitors', 'Sulphonylureas'],
    correct: 2,
    feedback: {
      correct: 'Correct! Sulphonylureas stimulate insulin secretion regardless of food intake — making hypoglycaemia highly likely when a patient is eating poorly or taking only sips of water.',
      wrong: 'Not quite. The answer is <strong>Sulphonylureas</strong>. They stimulate insulin secretion regardless of food intake. Metformin works differently (insulin sensitiser) and SGLT2 inhibitors carry a DKA risk rather than hypoglycaemia.'
    }
  },
  {
    q: 'True or False: In a patient with Type 1 Diabetes, insulin should generally be continued as long as the person remains conscious.',
    options: ['True', 'False'],
    correct: 0,
    feedback: {
      correct: 'Correct! Unlike Type 2, insulin in Type 1 is a survival requirement, not just a blood glucose tool. Stopping it causes DKA — a distressing and potentially rapid deterioration. Doses should be adjusted, not stopped, without specialist advice.',
      wrong: 'Not quite. The correct answer is <strong>True</strong>. In Type 1 Diabetes, insulin must be continued as long as the patient is conscious. The body cannot survive without it. Doses should be reduced as intake falls, but not withdrawn without specialist guidance.'
    }
  },
  {
    q: 'Which symptom is most indicative of hypoglycaemia rather than hyperglycaemia?',
    options: ['Fruity-smelling breath', 'Extreme thirst and polyuria', 'Cool, clammy skin and tremors'],
    correct: 2,
    feedback: {
      correct: 'Correct! Cool, clammy skin and tremors are classic signs of hypoglycaemia — caused by the adrenaline surge as the body responds to low blood glucose. Fruity breath and extreme thirst are hyperglycaemia/DKA signs.',
      wrong: 'Not quite. The answer is <strong>cool, clammy skin and tremors</strong>. These are classic hypoglycaemia signs. Fruity-smelling breath indicates ketones (DKA/hyperglycaemia), and extreme thirst/polyuria are also hyperglycaemia features.'
    }
  },
  {
    q: 'What should primarily guide the decision to transfer a patient with suspected DKA or HHS to hospital?',
    options: ['Current blood glucose reading', "The patient's Advance Care Plan and wishes", 'Hospital policy and bed availability'],
    correct: 1,
    feedback: {
      correct: "Correct! DKA and HHS require acute hospital care that cannot be delivered in a community or standard hospice setting — but whether to pursue that care depends entirely on the patient's documented wishes and Advance Care Plan. Clinical need does not override patient autonomy.",
      wrong: "Not quite. The answer is <strong>the patient's Advance Care Plan and wishes</strong>. While DKA and HHS are serious emergencies requiring hospital-level care, a patient may have clearly documented they wish to remain at home for comfort-focused care. Their wishes take precedence."
    }
  }
];

let _qIdx    = 0;
let _answers = {};

function renderQuiz() {
  _qIdx = 0; _answers = {};
  window._quizScore = null; window._quizPct = null; window._quizPassed = null;
  _renderQuestion(0);
}

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
    '<div class="qpb-dots">' + QUIZ_DATA.map((_, i) => `<div class="qpb-dot" id="qpbdot-${i}"></div>`).join('') + '</div>' +
    `<span class="qpb-counter" id="qpb-counter">1 / ${QUIZ_DATA.length}</span>`;
  wrap.insertAdjacentElement('beforebegin', bar);
}

function _updateProgress() {
  QUIZ_DATA.forEach((_, i) => {
    const dot = document.getElementById('qpbdot-' + i);
    if (dot) dot.className = 'qpb-dot ' + (_answers[i] !== undefined ? (_answers[i] === QUIZ_DATA[i].correct ? 'correct' : 'incorrect') : '');
  });
  const ctr = document.getElementById('qpb-counter');
  if (ctr) ctr.textContent = (_qIdx + 1) + ' / ' + QUIZ_DATA.length;
}

function _renderQuestion(idx) {
  const wrap = document.getElementById('quiz-wrap');
  if (!wrap) return;
  _buildProgress();
  const q = QUIZ_DATA[idx];
  const isLast = idx === QUIZ_DATA.length - 1;
  wrap.innerHTML = `
    <div class="quiz-q" id="qq-current">
      <div class="qnum">Question ${idx + 1} of ${QUIZ_DATA.length}</div>
      <div class="qtext">${q.q}</div>
      <div class="q-options" id="q-opts">
        ${q.options.map((opt, j) => `
          <button class="q-option" id="qopt-${j}" onclick="selectAnswer(${idx},${j})" aria-label="Option ${String.fromCharCode(65+j)}: ${opt}">
            <div class="opt-letter">${String.fromCharCode(65+j)}</div>
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

function selectAnswer(qIdx, optIdx) {
  if (_answers[qIdx] !== undefined) return;
  _answers[qIdx] = optIdx;
  const q = QUIZ_DATA[qIdx];
  const isCorrect = optIdx === q.correct;

  q.options.forEach((_, j) => {
    const btn = document.getElementById('qopt-' + j);
    if (!btn) return;
    btn.disabled = true;
    if (j === q.correct)                  btn.classList.add('correct');
    else if (j === optIdx && !isCorrect)  btn.classList.add('incorrect');
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

function showQuizResults() {
  const score = QUIZ_DATA.reduce((s, q, i) => s + (_answers[i] === q.correct ? 1 : 0), 0);
  const pct   = Math.round((score / QUIZ_DATA.length) * 100);
  const pass  = pct >= 80;
  window._quizScore = score; window._quizPct = pct; window._quizPassed = pass;
  window._quizAnswers = { ..._answers };

  const bar = document.getElementById('quiz-progress-bar');
  if (bar) bar.remove();

  const wrap = document.getElementById('quiz-wrap');
  if (wrap) wrap.innerHTML = `
    <div class="quiz-results">
      <div class="qr-score-wrap" style="margin-bottom:16px;">
        <div class="qr-score">${score}</div>
        <div class="qr-denom">out of ${QUIZ_DATA.length}</div>
        <div class="qr-pct">${pct}% score</div>
      </div>
      <div class="qr-badge ${pass ? 'pass' : 'fail'}">${pass ? '🎉 Passed' : '📚 Review Recommended'}</div>
      <div class="qr-message">${pass
        ? 'Excellent. You have demonstrated a solid understanding of end-of-life clinical management and medication safety. Proceed to close the module.'
        : `You scored ${score} out of ${QUIZ_DATA.length}. Review the relevant slides and try again if you wish — all questions remain available from the navigation bar.`}
      </div>
    </div>`;

  const nav = document.getElementById('quiz-nav');
  if (nav) nav.style.display = 'flex';

  if (typeof SCORM !== 'undefined') {
    SCORM.setScore(pct, 0, 100);
    if (pass) SCORM.setCompletion('passed');
  }
}
