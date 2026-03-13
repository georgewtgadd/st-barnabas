/* ══════════════════════════════════════════════════════════
   js/quiz.js  ·  True / False knowledge check — page 8
   One-question-at-a-time render — no hidden cards in DOM
══════════════════════════════════════════════════════════ */

const PASS_MARK = 80;

const quizData = [
  {
    id: 1,
    q: 'Palliative care is only provided in the last days of life.',
    answer: false,
    feedback: 'Palliative care can begin at or around the time of diagnosis of a life-limiting condition — well before the final days.',
  },
  {
    id: 2,
    q: 'End of life care may begin when a person is thought to be in the last 12 months of life.',
    answer: true,
    feedback: 'This is the GMC and NICE definition — identifying people likely to die within 12 months allows timely access to support.',
  },
  {
    id: 3,
    q: 'Using the term "palliative care" too late can limit access to symptom control and support.',
    answer: true,
    feedback: 'Delayed use of palliative care terminology can result in missed opportunities for advance care planning, symptom management and emotional support.',
  },
  {
    id: 4,
    q: 'Palliative care means stopping all active treatment.',
    answer: false,
    feedback: 'Palliative care is delivered alongside active treatments. The two are not mutually exclusive.',
  },
  {
    id: 5,
    q: 'Clear and compassionate language can improve patient understanding and decision-making.',
    answer: true,
    feedback: 'Good communication — honest, compassionate and timely — is central to high-quality palliative and end of life care.',
  },
];

/* ── State ───────────────────────────────────────────── */
window._quizScoreText = null;
window._quizPct       = null;
window._quizPassed    = null;

let _currentIdx  = 0;   // index into quizData (0-based)
let _answers     = {};  // { quizData[i].id: true|false }  true = correct
let _dotStates   = [];  // 'unanswered' | 'correct' | 'incorrect'

/* ══ INIT ════════════════════════════════════════════════ */
function renderQuiz() {
  _currentIdx = 0;
  _answers    = {};
  _dotStates  = quizData.map(() => 'unanswered');

  window._quizScoreText = null;
  window._quizPct       = null;
  window._quizPassed    = null;

  const results = document.getElementById('quiz-results');
  const backNav = document.getElementById('quiz-back-nav');
  if (results) results.classList.remove('show');
  if (backNav) backNav.style.display = 'flex';

  _buildProgressBar();
  _renderQuestion(_currentIdx);
}

/* ── Progress bar (built once, dots updated each question) */
function _buildProgressBar() {
  /* Remove any existing bar first */
  const old = document.getElementById('quiz-progress-bar');
  if (old) old.remove();

  const container = document.getElementById('quiz-question-container');
  if (!container) return;

  const bar = document.createElement('div');
  bar.id        = 'quiz-progress-bar';
  bar.className = 'quiz-progress';
  bar.innerHTML =
    '<span class="quiz-progress-label">Question</span>' +
    '<div class="quiz-progress-dots" id="quiz-progress-dots">' +
    quizData.map((_, i) =>
      '<div class="quiz-dot" id="qdot-' + i + '" aria-hidden="true"></div>'
    ).join('') +
    '</div>' +
    '<span id="quiz-q-counter" class="quiz-progress-counter">1 / ' + quizData.length + '</span>';

  container.parentNode.insertBefore(bar, container);
}

function _updateDots() {
  quizData.forEach((_, i) => {
    const dot = document.getElementById('qdot-' + i);
    if (!dot) return;
    dot.className = 'quiz-dot ' + _dotStates[i];
  });
  const counter = document.getElementById('quiz-q-counter');
  if (counter) counter.textContent = (_currentIdx + 1) + ' / ' + quizData.length;
}

/* ── Render a single question ──────────────────────────── */
function _renderQuestion(idx) {
  const container = document.getElementById('quiz-question-container');
  if (!container) return;

  const item    = quizData[idx];
  const isLast  = idx === quizData.length - 1;
  const nextFn  = isLast ? 'showResults()' : 'advanceQuestion()';
  const nextLbl = isLast ? 'See Results →' : 'Next →';

  container.style.display = '';
  container.innerHTML = `
    <div class="quiz-question-card" id="quiz-current-card">
      <div class="quiz-q-num">Question ${idx + 1} of ${quizData.length}</div>
      <div class="quiz-q-text">${item.q}</div>
      <div class="quiz-tf-btns" role="group" aria-label="True or False?">
        <button class="quiz-tf-btn" id="btn-true"
                onclick="answerQuiz(true)"
                aria-label="True">✓ True</button>
        <button class="quiz-tf-btn" id="btn-false"
                onclick="answerQuiz(false)"
                aria-label="False">✗ False</button>
      </div>
      <div class="quiz-feedback" id="quiz-current-feedback" role="alert" aria-live="polite"></div>
      <div class="quiz-nav-row" id="quiz-next-row" style="display:none;justify-content:flex-end;">
        <button class="btn btn-primary" onclick="${nextFn}">${nextLbl}</button>
      </div>
    </div>`;

  _updateDots();
}

/* ══ ANSWER A QUESTION ═══════════════════════════════════ */
function answerQuiz(choice) {
  /* Guard: only accept one answer per question */
  const item = quizData[_currentIdx];
  if (_answers[item.id] !== undefined) return;

  const correct = (choice === item.answer);
  _answers[item.id] = correct;
  _dotStates[_currentIdx] = correct ? 'correct' : 'incorrect';

  /* Style the chosen button */
  const trueBtn  = document.getElementById('btn-true');
  const falseBtn = document.getElementById('btn-false');
  [trueBtn, falseBtn].forEach(b => { if (b) b.disabled = true; });

  if (trueBtn)  trueBtn.classList.add(item.answer === true  ? 'correct-glow' : (choice === true  ? 'wrong-glow' : ''));
  if (falseBtn) falseBtn.classList.add(item.answer === false ? 'correct-glow' : (choice === false ? 'wrong-glow' : ''));

  /* Show feedback */
  const fb = document.getElementById('quiz-current-feedback');
  if (fb) {
    fb.className = 'quiz-feedback show ' + (correct ? 'correct' : 'incorrect');
    fb.innerHTML =
      '<span class="quiz-feedback-badge">' + (correct ? '✓ Correct' : '✗ Incorrect') + '</span>' +
      '<p>' + item.feedback + '</p>';
  }

  /* Show next / results button */
  const nextRow = document.getElementById('quiz-next-row');
  if (nextRow) nextRow.style.display = 'flex';

  _updateDots();
}

/* ══ ADVANCE TO NEXT QUESTION ════════════════════════════ */
function advanceQuestion() {
  _currentIdx++;
  if (_currentIdx < quizData.length) {
    _renderQuestion(_currentIdx);
  }
}

/* ══ SHOW RESULTS ════════════════════════════════════════ */
function showResults() {
  const container = document.getElementById('quiz-question-container');
  const results   = document.getElementById('quiz-results');
  const bar       = document.getElementById('quiz-progress-bar');
  const backNav   = document.getElementById('quiz-back-nav');

  if (container) container.style.display = 'none';
  if (bar)       bar.style.display       = 'none';
  if (backNav)   backNav.style.display   = 'none';
  if (results)   results.classList.add('show');

  const correctCount   = Object.values(_answers).filter(Boolean).length;
  const incorrectCount = quizData.length - correctCount;
  const pct            = Math.round((correctCount / quizData.length) * 100);
  const passed         = pct >= PASS_MARK;

  window._quizPct       = pct;
  window._quizPassed    = passed;
  window._quizScoreText = correctCount + ' / ' + quizData.length + ' (' + pct + '%)';

  const icon  = document.getElementById('quiz-results-icon');
  const score = document.getElementById('quiz-results-score');
  const lbl   = document.getElementById('quiz-results-label');
  const msg   = document.getElementById('quiz-results-msg');
  const cBtn  = document.getElementById('quiz-continue-btn');
  const sc    = document.getElementById('stat-correct');
  const si    = document.getElementById('stat-incorrect');
  const st    = document.getElementById('stat-total');

  if (icon)  icon.textContent  = passed ? '🎉' : '📚';
  if (score) score.textContent = pct + '%';
  if (lbl)   lbl.textContent   = passed ? 'Well done — you passed!' : 'Keep reviewing — try again.';
  if (sc)    sc.textContent    = correctCount;
  if (si)    si.textContent    = incorrectCount;
  if (st)    st.textContent    = quizData.length;

  if (msg) {
    msg.innerHTML = passed
      ? '<strong>Excellent work.</strong> You\'ve demonstrated a solid understanding of end of life palliative care. Your results have been recorded. Continue to your learning record.'
      : '<strong>Not to worry.</strong> Review the content and try again. Focus on the questions you found tricky — use the ↩ Try Again button below.';
  }

  if (cBtn) cBtn.hidden = !passed;

  if (typeof SCORM !== 'undefined') {
    SCORM.setScore(pct, 0, 100);
    if (passed) SCORM.setCompletion('passed');
  }
}

/* ══ RETRY ═══════════════════════════════════════════════ */
function retryQuiz() {
  const results = document.getElementById('quiz-results');
  const bar     = document.getElementById('quiz-progress-bar');
  const backNav = document.getElementById('quiz-back-nav');

  if (results) results.classList.remove('show');
  if (bar)     { bar.remove(); }
  if (backNav) backNav.style.display = 'flex';

  renderQuiz();
}
