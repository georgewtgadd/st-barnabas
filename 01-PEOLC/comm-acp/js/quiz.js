/* ══════════════════════════════════════════════════════════
   js/quiz.js  ·  MCQ Knowledge Check — page 10
   One question at a time render
══════════════════════════════════════════════════════════ */

const PASS_MARK = 80;

const quizData = [
  {
    id: 1,
    q: 'Under the Mental Capacity Act (2005), which of the following is the correct first principle?',
    options: [
      { label: 'A', text: 'A person must be deemed to lack capacity if they refuse a recommended treatment.' },
      { label: 'B', text: 'A person must be assumed to have capacity unless it is established otherwise.', correct: true },
      { label: 'C', text: 'A clinician may override a patient\'s wishes if acting in their best interests.' },
      { label: 'D', text: 'Capacity must be assessed by a specialist before any clinical decision is made.' },
    ],
    feedback: 'The presumption of capacity is the cornerstone of the MCA (2005). A person must never be assumed to lack capacity without evidence — the burden of proof lies with those asserting that capacity is absent.',
  },
  {
    id: 2,
    q: 'According to Albert Mehrabian\'s research, what percentage of emotional impact comes from the words we use?',
    options: [
      { label: 'A', text: '55% — words are the most important element.' },
      { label: 'B', text: '38% — words carry a moderate impact.' },
      { label: 'C', text: '15% — words matter but less than most think.' },
      { label: 'D', text: '7% — words carry the least emotional impact of the three channels.', correct: true },
    ],
    feedback: 'Mehrabian\'s 7-38-55 rule states that in emotional communication: 7% is conveyed through words, 38% through tone of voice, and 55% through body language. This is particularly relevant in sensitive palliative care conversations.',
  },
  {
    id: 3,
    q: 'Which document is legally binding and allows a patient to refuse a specific treatment in advance?',
    options: [
      { label: 'A', text: 'The ReSPECT form — it is legally binding in emergency settings.' },
      { label: 'B', text: 'A Preferred Place of Care plan — it binds the clinical team to act on the patient\'s wishes.' },
      { label: 'C', text: 'An Advance Decision to Refuse Treatment (ADRT) — it is legally binding when validly completed.', correct: true },
      { label: 'D', text: 'A verbal instruction to the clinical team — this carries the same weight as a written document.' },
    ],
    feedback: 'An ADRT (also known as a "living will") is legally binding under the MCA (2005) if it is valid and applicable. The ReSPECT form is a clinical recommendation, not a legally binding document. Verbal wishes should be respected but are not legally enforceable.',
  },
  {
    id: 4,
    q: 'In the UK, a patient\'s \'Next of Kin\' has which of the following legal standing?',
    options: [
      { label: 'A', text: 'They can make binding treatment decisions on behalf of an incapacitated adult.' },
      { label: 'B', text: 'They have no legal standing to make decisions for an incapacitated adult.', correct: true },
      { label: 'C', text: 'They must be consulted before any clinical decision is made.' },
      { label: 'D', text: 'They automatically become a Lasting Power of Attorney upon the patient losing capacity.' },
    ],
    feedback: '"Next of Kin" is a social term with no legal basis in UK healthcare law. Only a Health & Welfare Lasting Power of Attorney (LPA), a Court-Appointed Deputy, or (in some circumstances) an Independent Mental Capacity Advocate (IMCA) has legal standing to make decisions for an incapacitated adult.',
  },
  {
    id: 5,
    q: 'When a patient lacks capacity and there is no LPA or ADRT, a clinician must make a Best Interests decision. Which legal framework governs this process?',
    options: [
      { label: 'A', text: 'The Human Rights Act (1998) — specifically Article 8 (right to private life).' },
      { label: 'B', text: 'The Mental Health Act (1983) — which provides powers to detain and treat.' },
      { label: 'C', text: 'The Mental Capacity Act (2005) — specifically Section 4 (Best Interests checklist).', correct: true },
      { label: 'D', text: 'The Health and Social Care Act (2012) — which establishes patient rights.' },
    ],
    feedback: 'The Mental Capacity Act (2005), Section 4 sets out the Best Interests checklist. Clinicians must consider all relevant circumstances, consult those close to the patient, and try to ascertain the patient\'s past wishes, feelings, beliefs and values.',
  },
];

/* ── State ───────────────────────────────────────────── */
window._quizScoreText = null;
window._quizPct       = null;
window._quizPassed    = null;

let _currentIdx = 0;
let _answers    = {};
let _dotStates  = [];

/* ══ INIT ════════════════════════════════════════════ */
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

function _buildProgressBar() {
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
    quizData.map((_, i) => '<div class="quiz-dot" id="qdot-' + i + '" aria-hidden="true"></div>').join('') +
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

function _renderQuestion(idx) {
  const container = document.getElementById('quiz-question-container');
  if (!container) return;

  const item   = quizData[idx];
  const isLast = idx === quizData.length - 1;

  container.style.display = '';
  container.innerHTML = `
    <div class="quiz-question-card" id="quiz-current-card">
      <div class="quiz-q-num">Question ${idx + 1} of ${quizData.length}</div>
      <div class="quiz-q-text">${item.q}</div>
      <div class="quiz-mcq-options" role="group" aria-label="Select the correct answer">
        ${item.options.map(opt => `
          <button class="quiz-mcq-option" id="qopt-${opt.label}"
                  onclick="answerQuiz('${opt.label}')"
                  aria-label="Option ${opt.label}: ${opt.text}">
            <span class="quiz-mcq-letter">${opt.label}</span>
            <span class="quiz-mcq-text">${opt.text}</span>
          </button>`).join('')}
      </div>
      <div class="quiz-feedback" id="quiz-current-feedback" role="alert" aria-live="polite"></div>
      <div class="quiz-nav-row quiz-nav-hidden" id="quiz-next-row">
        <button class="btn btn-primary" onclick="${isLast ? 'showResults()' : 'advanceQuestion()'}">
          ${isLast ? 'See Results →' : 'Next →'}
        </button>
      </div>
    </div>`;

  _updateDots();
}

/* ══ ANSWER ══════════════════════════════════════════ */
function answerQuiz(chosenLabel) {
  const item = quizData[_currentIdx];
  if (_answers[item.id] !== undefined) return;

  const correctOpt = item.options.find(o => o.correct);
  const correct    = (chosenLabel === correctOpt.label);
  _answers[item.id] = correct;
  _dotStates[_currentIdx] = correct ? 'correct' : 'incorrect';

  // Disable all options and highlight
  item.options.forEach(opt => {
    const btn = document.getElementById('qopt-' + opt.label);
    if (!btn) return;
    btn.disabled = true;
    if (opt.correct)          btn.classList.add('correct-glow');
    else if (opt.label === chosenLabel) btn.classList.add('wrong-glow');
  });

  // Feedback
  const fb = document.getElementById('quiz-current-feedback');
  if (fb) {
    fb.className = 'quiz-feedback show ' + (correct ? 'correct' : 'incorrect');
    fb.innerHTML =
      '<span class="quiz-feedback-badge">' + (correct ? '✓ Correct' : '✗ Incorrect') + '</span>' +
      '<p>' + item.feedback + '</p>';
  }

  const nextRow = document.getElementById('quiz-next-row');
  if (nextRow) nextRow.classList.remove('quiz-nav-hidden');

  _updateDots();
}

function advanceQuestion() {
  _currentIdx++;
  if (_currentIdx < quizData.length) _renderQuestion(_currentIdx);
}

/* ══ RESULTS ═════════════════════════════════════════ */
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
      ? '<strong>Excellent work.</strong> You\'ve demonstrated a solid understanding of communication and advance care planning. Your results have been recorded. Continue to your learning record.'
      : '<strong>Not to worry.</strong> Review the module content and try again — focus on the MCA principles and document types.';
  }

  if (cBtn) cBtn.hidden = !passed;

  if (typeof SCORM !== 'undefined') {
    SCORM.setScore(pct, 0, 100);
    if (passed) SCORM.setCompletion('passed');
  }
}

function retryQuiz() {
  const results = document.getElementById('quiz-results');
  const bar     = document.getElementById('quiz-progress-bar');
  const backNav = document.getElementById('quiz-back-nav');

  if (results) results.classList.remove('show');
  if (bar)     bar.remove();
  if (backNav) backNav.style.display = 'flex';

  renderQuiz();
}
