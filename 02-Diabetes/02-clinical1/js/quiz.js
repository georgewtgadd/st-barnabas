/* ══════════════════════════════════════════════
   INTERACTIVE 5 — MCQ (Page 10)
══════════════════════════════════════════════ */
const QUIZ_DATA = [
  {
    q: 'What is the recommended capillary blood glucose target for a patient in the terminal phase?',
    opts: ['4.0–7.0 mmol/L (tight control)', '6.0–15.0 mmol/L (relaxed comfort target)', 'Under 8.5 mmol/L (near-normal)'],
    correct: 1,
    fb: { y: 'Correct. Targets are relaxed to 6–15 mmol/L in the terminal phase. Tight control is no longer the goal — avoiding symptomatic hypoglycaemia is.', n: 'Not quite. The correct answer is <strong>6.0–15.0 mmol/L</strong>. Tight control (4–7) is appropriate for longer-term management, not at end of life.' }
  },
  {
    q: 'Which drug class carries the highest risk of hypoglycaemia when a patient reduces food intake at end of life?',
    opts: ['Metformin', 'SGLT2 inhibitors', 'Sulphonylureas'],
    correct: 2,
    fb: { y: 'Correct. Sulphonylureas stimulate insulin secretion regardless of food intake — making hypoglycaemia highly likely when a patient is eating poorly.', n: 'Not quite. The answer is <strong>Sulphonylureas</strong>. They stimulate insulin secretion regardless of intake. Metformin is an insulin sensitiser; SGLT2s carry a DKA risk instead.' }
  },
  {
    q: 'In a Type 1 patient who has stopped eating and drinking, should basal insulin be stopped entirely?',
    opts: ['Yes — the patient is not eating so insulin is not needed', 'No — basal insulin must continue (adjusted) to prevent DKA', 'It depends on the patient\'s blood glucose reading'],
    correct: 1,
    fb: { y: 'Correct. In Type 1, withdrawing insulin causes DKA — a distressing and preventable deterioration. Doses should be reduced as intake falls, but not stopped without specialist advice.', n: 'Not quite. The answer is <strong>No</strong>. Type 1 patients cannot produce any insulin. Stopping it causes DKA within hours. Basal must continue (dose-reduced) until the patient is unconscious.' }
  },
  {
    q: 'Which presentation is most indicative of hypoglycaemia (rather than hyperglycaemia)?',
    opts: ['Fruity-smelling breath, deep laboured breathing', 'Cool, clammy skin and sudden confusion', 'Extreme thirst, frequent urination, drowsiness'],
    correct: 1,
    fb: { y: 'Correct. Cool clammy skin and sudden confusion are driven by the adrenaline surge as blood glucose drops. Fruity breath = ketones (DKA). Extreme thirst/polyuria = hyperglycaemia.', n: 'Not quite. <strong>Cool, clammy skin and sudden confusion</strong> are classic hypoglycaemia signs. Fruity breath indicates DKA; extreme thirst/polyuria indicate hyperglycaemia.' }
  },
  {
    q: 'A patient with suspected DKA has an Advance Care Plan stating they wish to remain at home for comfort care only. What should primarily guide your decision?',
    opts: ['Transfer to A&E — DKA requires IV treatment', "The patient's documented wishes in their ACP", 'Wait for blood glucose results before deciding'],
    correct: 1,
    fb: { y: "Correct. DKA requires hospital-level care — but whether to pursue it depends entirely on the patient's documented wishes. Clinical need does not override patient autonomy.", n: "Not quite. The answer is <strong>the patient's ACP</strong>. While DKA is serious, a patient may have documented they wish to remain at home for comfort care. Their wishes take precedence." }
  }
];

var quizIdx = 0;
var quizAnswers = {};
var quizScore = null;

function renderQuiz() {
  quizIdx = 0; quizAnswers = {}; quizScore = null;
  var dots = document.getElementById('quiz-dots');
  if (dots) dots.innerHTML = QUIZ_DATA.map((_,i) => `<div class="mcq-dot" id="qdot-${i}"></div>`).join('');
  var qwrap = document.getElementById('quiz-questions');
  if (!qwrap) return;
  qwrap.innerHTML = QUIZ_DATA.map(function(q, qi) {
    var opts = q.opts.map(function(opt, oi) {
      return `<div class="mcq-option" id="qopt-${qi}-${oi}" role="button" tabindex="0"
                   onclick="selectAnswer(${qi},${oi})"
                   onkeydown="if(event.key==='Enter'||event.key===' ')selectAnswer(${qi},${oi})"
                   aria-label="Option ${String.fromCharCode(65+oi)}: ${opt}">
        <div class="mcq-opt-letter">${String.fromCharCode(65+oi)}</div>
        ${opt}
      </div>`;
    }).join('');
    return `<div class="mcq-card${qi===0?' active':''}" id="qcard-${qi}">
      <div class="mcq-card-head">
        <div class="mcq-card-num">Question ${qi+1} of ${QUIZ_DATA.length}</div>
        <div class="mcq-card-text">${q.q}</div>
      </div>
      <div class="mcq-options">${opts}</div>
      <div class="mcq-submit-row">
        <div></div>
        <button class="mcq-submit-btn" id="qsubmit-${qi}" onclick="submitAnswer(${qi})" disabled>Submit Answer</button>
        <div>
          ${qi < QUIZ_DATA.length-1 ? `<button class="btn btn-secondary" id="qnext-${qi}" style="display:none;font-size:0.82rem;padding:10px 18px;" onclick="nextQuestion(${qi+1})">Next →</button>` : ''}
          ${qi === QUIZ_DATA.length-1 ? `<button class="btn btn-primary-navy" id="qresults" style="display:none;" onclick="showResults()">See Results →</button>` : ''}
        </div>
      </div>
      <div class="mcq-feedback" id="qfb-${qi}"></div>
    </div>`;
  }).join('');
}

function selectAnswer(qi, oi) {
  if (quizAnswers[qi] !== undefined) return;
  for (var i = 0; i < QUIZ_DATA[qi].opts.length; i++) {
    var o = document.getElementById('qopt-' + qi + '-' + i);
    if (o) o.classList.remove('selected');
  }
  document.getElementById('qopt-' + qi + '-' + oi).classList.add('selected');
  var sub = document.getElementById('qsubmit-' + qi);
  if (sub) { sub.disabled = false; sub._selectedOi = oi; }
}

function submitAnswer(qi) {
  var sub = document.getElementById('qsubmit-' + qi);
  if (!sub) return;
  var oi = sub._selectedOi;
  if (oi === undefined || oi === null) return;
  if (quizAnswers[qi] !== undefined) return;
  quizAnswers[qi] = oi;
  var q = QUIZ_DATA[qi];
  var correct = (oi === q.correct);
  for (var i = 0; i < q.opts.length; i++) {
    var opt = document.getElementById('qopt-' + qi + '-' + i);
    if (!opt) continue;
    opt.classList.add('locked');
    opt.setAttribute('tabindex', '-1');
    if (i === q.correct) opt.classList.add('correct');
    if (i === oi && !correct) opt.classList.add('incorrect');
  }
  var dot = document.getElementById('qdot-' + qi);
  if (dot) dot.className = 'mcq-dot ' + (correct ? 'correct' : 'incorrect');
  var fb = document.getElementById('qfb-' + qi);
  if (fb) {
    fb.className = 'mcq-feedback show ' + (correct ? 'correct' : 'incorrect');
    fb.innerHTML = '<span class="mcq-feedback-badge">' + (correct ? '✅ Correct' : '❌ Incorrect') + '</span>' + (correct ? q.fb.y : q.fb.n);
  }
  sub.disabled = true;
  if (qi < QUIZ_DATA.length - 1) {
    var nxt = document.getElementById('qnext-' + qi);
    if (nxt) nxt.style.display = '';
  } else {
    var res = document.getElementById('qresults');
    if (res) res.style.display = '';
  }
}

function nextQuestion(qi) {
  document.querySelectorAll('.mcq-card').forEach(c => c.classList.remove('active'));
  var card = document.getElementById('qcard-' + qi);
  if (card) card.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showResults() {
  document.querySelectorAll('.mcq-card').forEach(c => c.classList.remove('active'));
  var correct = Object.keys(quizAnswers).filter(i => quizAnswers[i] === QUIZ_DATA[i].correct).length;
  var pct = Math.round((correct / QUIZ_DATA.length) * 100);
  quizScore = { correct, total: QUIZ_DATA.length, pct };
  var passed = pct >= 80;
  var icon, msg;
  if (pct === 100) { icon = '🌟'; msg = 'Perfect score! You have an excellent grasp of clinical management at end of life.'; }
  else if (passed) { icon = '✅'; msg = 'Well done — you scored ' + correct + ' out of ' + QUIZ_DATA.length + '. Review any questions you found challenging before moving on.'; }
  else             { icon = '📚'; msg = 'You scored ' + correct + ' out of ' + QUIZ_DATA.length + ' (' + pct + '%). Review the rationale and revisit earlier sections before continuing.'; }
  var res = document.getElementById('quiz-results');
  if (res) {
    res.innerHTML = `
    <div class="mcq-results-icon">${icon}</div>
    <div class="mcq-results-score">${pct}%</div>
    <div class="mcq-results-label">${passed ? 'Passed — well done!' : 'Review recommended'}</div>
    <p class="mcq-results-msg">${msg}</p>`;
    res.classList.add('show');
  }
  var btn = document.getElementById('quiz-continue-btn');
  if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
  if (typeof SCORM !== 'undefined') SCORM.finish(passed ? 'passed' : 'failed', pct);
}

window.selectAnswer = selectAnswer;
window.submitAnswer = submitAnswer;
window.nextQuestion = nextQuestion;
window.showResults = showResults;
window.renderQuiz = renderQuiz;
