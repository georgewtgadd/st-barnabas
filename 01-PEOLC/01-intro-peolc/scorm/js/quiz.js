/* ══════════════════════════════════════════════════════════
   js/quiz.js  ·  True / False knowledge check — page 8
══════════════════════════════════════════════════════════ */

const PASS_MARK = 80; // %

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

// State — expose for record.js
window._quizScoreText = null;
window._quizPct       = null;
window._quizPassed    = null;

let _quizState = {
  currentQ:  0,
  answers:   {},  // { 1: true|false, … }
  done:      false,
};

function renderQuiz() {
  _quizState = { currentQ: 0, answers: {}, done: false };
  window._quizScoreText = null;
  window._quizPct       = null;
  window._quizPassed    = null;

  const container = document.getElementById('quiz-question-container');
  const results   = document.getElementById('quiz-results');
  const backNav   = document.getElementById('quiz-back-nav');
  if (!container) return;

  container.innerHTML = '';
  if (results) results.classList.remove('show');
  if (backNav) backNav.style.display = 'flex';

  // Build question cards
  quizData.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className  = 'quiz-question-card' + (idx === 0 ? ' active' : '');
    card.id         = 'quiz-card-' + item.id;
    card.innerHTML = `
      <div class="quiz-q-num">Question ${idx + 1} of ${quizData.length}</div>
      <div class="quiz-q-text">${item.q}</div>
      <div class="quiz-tf-btns" role="group" aria-label="True or False?">
        <button class="quiz-tf-btn" id="q${item.id}-true"
                onclick="answerQuiz(${item.id},true)"
                aria-label="True">✓ True</button>
        <button class="quiz-tf-btn" id="q${item.id}-false"
                onclick="answerQuiz(${item.id},false)"
                aria-label="False">✗ False</button>
      </div>
      <div class="quiz-feedback" id="qfb-${item.id}" role="alert" aria-live="polite"></div>
      <div class="quiz-nav-row">
        <button class="btn btn-secondary" style="opacity:0;pointer-events:none;" aria-hidden="true"></button>
        <button class="btn btn-primary" id="qnext-${item.id}"
                onclick="${idx < quizData.length - 1 ? 'showQuestion(' + (idx + 1) + ')' : 'showResults()'}" hidden>
          ${idx < quizData.length - 1 ? 'Next →' : 'See Results →'}
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  // Progress dots
  _renderDots();
  _showQuestion(0);
}

function _renderDots() {
  let wrap = document.querySelector('.quiz-progress-dots');
  if (!wrap) {
    // Build progress bar above container
    const bar = document.createElement('div');
    bar.className = 'quiz-progress';
    bar.innerHTML = '<span>Question</span><div class="quiz-progress-dots"></div><span id="quiz-q-counter">1 / ' + quizData.length + '</span>';
    const container = document.getElementById('quiz-question-container');
    if (container) container.parentNode.insertBefore(bar, container);
    wrap = document.querySelector('.quiz-progress-dots');
  }
  if (!wrap) return;
  wrap.innerHTML = '';
  quizData.forEach((item, idx) => {
    const dot = document.createElement('div');
    dot.className = 'quiz-dot';
    dot.id = 'qdot-' + item.id;
    wrap.appendChild(dot);
  });
}

function _showQuestion(idx) {
  document.querySelectorAll('.quiz-question-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById('quiz-card-' + quizData[idx].id);
  if (card) {
    card.classList.add('active');
    _quizState.currentQ = idx;
    const counter = document.getElementById('quiz-q-counter');
    if (counter) counter.textContent = (idx + 1) + ' / ' + quizData.length;
  }
}

function showQuestion(idx) { _showQuestion(idx); }

function answerQuiz(id, choice) {
  const item  = quizData.find(q => q.id === id);
  if (!item || _quizState.answers[id] !== undefined) return;

  const correct = (choice === item.answer);
  _quizState.answers[id] = correct;

  // Update dot
  const dot = document.getElementById('qdot-' + id);
  if (dot) {
    dot.classList.add('answered');
    dot.classList.add(correct ? 'correct' : 'incorrect');
  }

  // Style buttons
  const trueBtn  = document.getElementById('q' + id + '-true');
  const falseBtn = document.getElementById('q' + id + '-false');
  [trueBtn, falseBtn].forEach(b => { if (b) b.disabled = true; });

  if (trueBtn)  trueBtn.classList.add(item.answer === true  ? 'correct-glow' : (choice === true  ? 'wrong-glow' : ''));
  if (falseBtn) falseBtn.classList.add(item.answer === false ? 'correct-glow' : (choice === false ? 'wrong-glow' : ''));

  // Feedback
  const fb = document.getElementById('qfb-' + id);
  if (fb) {
    fb.className = 'quiz-feedback show ' + (correct ? 'correct' : 'incorrect');
    fb.innerHTML = `
      <span class="quiz-feedback-badge">${correct ? '✓ Correct' : '✗ Incorrect'}</span>
      <p>${item.feedback}</p>
    `;
  }

  // Show next btn
  const nextBtn = document.getElementById('qnext-' + id);
  if (nextBtn) nextBtn.hidden = false;

  // Check if last question
  if (Object.keys(_quizState.answers).length === quizData.length) {
    setTimeout(showResults, 800);
  }
}

function showResults() {
  const container = document.getElementById('quiz-question-container');
  const results   = document.getElementById('quiz-results');
  const backNav   = document.getElementById('quiz-back-nav');
  const progress  = document.querySelector('.quiz-progress');

  if (container) container.style.display = 'none';
  if (progress)  progress.style.display  = 'none';
  if (backNav)   backNav.style.display   = 'none';
  if (results)   results.classList.add('show');

  const correctCount   = Object.values(_quizState.answers).filter(Boolean).length;
  const incorrectCount = quizData.length - correctCount;
  const pct            = Math.round((correctCount / quizData.length) * 100);
  const passed         = pct >= PASS_MARK;

  window._quizPct       = pct;
  window._quizPassed    = passed;
  window._quizScoreText = correctCount + ' / ' + quizData.length + ' (' + pct + '%)';

  // Populate results
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

  // SCORM score
  if (typeof SCORM !== 'undefined') {
    SCORM.setScore(pct, 0, 100);
    if (passed) SCORM.setCompletion('passed');
  }
}

function retryQuiz() {
  const container = document.getElementById('quiz-question-container');
  const results   = document.getElementById('quiz-results');
  const progress  = document.querySelector('.quiz-progress');
  const backNav   = document.getElementById('quiz-back-nav');
  const dotWrap   = document.querySelector('.quiz-progress-dots');

  if (results)   results.classList.remove('show');
  if (container) { container.innerHTML = ''; container.style.display = ''; }
  if (progress)  { progress.remove(); }
  if (backNav)   backNav.style.display = 'flex';

  renderQuiz();
}
