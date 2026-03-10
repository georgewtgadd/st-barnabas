/* ══════════════════════════════════════════════════════════
   MCQ ASSESSMENT — Page 10
   js/mcq.js
══════════════════════════════════════════════════════════ */

var _mcqData = [
  /* Q1 — Clinical Prioritization */
  {
    question: 'Bob reports worsening pain, breathlessness at rest, and has not opened his bowels for several days. Which of the following should be your immediate clinical suspicion regarding the link between these symptoms?',
    options: [
      { letter: 'A', text: 'Opioid-induced constipation is likely exacerbating his nausea and causing abdominal distension, which worsens his breathlessness.', correct: true },
      { letter: 'B', text: 'The breathlessness is purely anxiety-related due to his fear of dying.', correct: false },
      { letter: 'C', text: 'His lack of appetite is the primary cause of his constipation.', correct: false },
      { letter: 'D', text: 'The pain is unrelated to his bowel habits and should be treated with increased oral morphine immediately.', correct: false }
    ],
    rationale: 'In palliative care, we look for symptom clusters. Opioids cause constipation — if Bob hasn\'t moved his bowels in days, he will feel nauseous and full. This "fullness" pushes up on the diaphragm, making it harder to breathe. Addressing the constipation often improves the nausea and breathlessness. Option D is dangerous — giving more morphine to someone already constipated without a laxative plan will worsen the nausea and distension.'
  },
  /* Q2 — Existential Distress */
  {
    question: 'Bob says, "I\'m scared… I think I\'m going to die. And I think I\'m going to be on my own when it happens." What is the most therapeutic initial response?',
    options: [
      { letter: 'A', text: '"Don\'t be silly, Bob, the nurses are here around the clock."', correct: false },
      { letter: 'B', text: '"We have excellent medications that will make sure you aren\'t in pain when the time comes."', correct: false },
      { letter: 'C', text: '(Silence / holding his hand) "It sounds like you\'ve been thinking about this a lot. Can you tell me more about what scares you the most?"', correct: true },
      { letter: 'D', text: '"I\'ll go and call your son right now so you won\'t be alone."', correct: false }
    ],
    rationale: 'This is an open-ended, validating response. When a patient says "I think I\'m going to die," they aren\'t usually looking for medical denial — they are looking for a safe space to voice their fear. By asking "what scares you most?" you allow Bob to lead the conversation.\n\nOption A is dismissive reassurance — it shuts Bob down. Option B ignores his emotional pain to focus on physical medications. Option D is premature — Bob hasn\'t spoken to his son in four years, so calling him without a plan could cause more trauma.'
  },
  /* Q3 — Total Pain / Dog */
  {
    question: 'Bob is visibly distressed about his dog. In palliative care, addressing this "total pain" is a priority. Which action best supports Bob\'s psychological well-being?',
    options: [
      { letter: 'A', text: 'Tell him not to worry about the dog and focus on his breathing.', correct: false },
      { letter: 'B', text: 'Suggest he gives the dog away now to save him the stress later.', correct: false },
      { letter: 'C', text: 'Offer to contact a specialist charity (like the Cinnamon Trust) or a local contact to create a formal pet care plan.', correct: true },
      { letter: 'D', text: 'Remind him that the hospital/hospice doesn\'t allow animals, so he needs to find a kennel.', correct: false }
    ],
    rationale: 'This addresses "Total Pain." To Bob, the dog is not just a pet — it\'s a family member and a source of significant guilt. By involving a specialist charity like the Cinnamon Trust, you provide a concrete solution that reduces physiological stress, which in turn can lower perceived pain and breathlessness.\n\nOptions A and B ignore the profound bond between humans and animals, which is often the most important thing to a patient in their final days.'
  },
  /* Q4 — Coordination of care */
  {
    question: 'Bob expresses a wish to "sort things out" with his estranged son. Who is the least appropriate person to involve in this specific coordination?',
    options: [
      { letter: 'A', text: 'The Palliative Care Social Worker.', correct: false },
      { letter: 'B', text: 'The GP or Lead Consultant (for medical prognosis to time the conversation).', correct: false },
      { letter: 'C', text: 'The Hospital Chaplain or Spiritual Care Lead.', correct: false },
      { letter: 'D', text: 'The Night Pharmacist.', correct: true }
    ],
    rationale: 'While the pharmacist is vital for Bob\'s physical comfort (medications), they have no clinical or professional role in mediating family estrangement or addressing spiritual "unfinished business."\n\nThe Social Worker and Chaplain can facilitate the difficult conversation with the son. The GP/Consultant provides the prognosis so the family understands the urgency. All three are gold-standard MDT members for this situation.'
  }
];

// Fisher-Yates shuffle
function _shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

var _mcqAnswers  = [];
var _mcqCurrent  = 0;
var _mcqShuffled = [];

function renderMCQ() {
  _mcqAnswers = _mcqData.map(function () { return { selected: null, correct: false, answered: false }; });
  _mcqCurrent = 0;

  _mcqShuffled = _mcqData.map(function (q) {
    var opts = q.options.map(function (o) { return { text: o.text, correct: o.correct, letter: o.letter }; });
    _shuffle(opts);
    return { question: q.question, options: opts, rationale: q.rationale };
  });

  // Render progress dots
  var dots = document.getElementById('mcq-dots');
  if (dots) {
    dots.innerHTML = _mcqShuffled.map(function (_, i) {
      return '<div class="mcq-dot" id="mdot-' + i + '" aria-hidden="true"></div>';
    }).join('');
  }

  // Render question cards
  var container = document.getElementById('mcq-questions-container');
  if (!container) return;

  container.innerHTML = _mcqShuffled.map(function (q, qi) {
    var optHtml = q.options.map(function (opt, oi) {
      var letters = ['A', 'B', 'C', 'D'];
      return '<div class="mcq-option" id="mopt-' + qi + '-' + oi + '" role="button" tabindex="0" '
        + 'onclick="selectOption(' + qi + ',' + oi + ')" '
        + 'onkeydown="if(event.key===\'Enter\'||event.key===\' \')selectOption(' + qi + ',' + oi + ')" '
        + 'aria-label="Option ' + letters[oi] + ': ' + opt.text.replace(/"/g, '&quot;') + '">'
        + '<div class="mcq-option-letter">' + letters[oi] + '</div>'
        + opt.text
        + '</div>';
    }).join('');

    return '<div class="mcq-q-card' + (qi === 0 ? ' active' : '') + '" id="mqcard-' + qi + '">'
      + '<div class="mcq-q-header"><div class="mcq-q-num">Question ' + (qi + 1) + ' of ' + _mcqShuffled.length + '</div>'
      + '<div class="mcq-q-text quiz-q-text">' + q.question + '</div></div>'
      + '<div class="mcq-options">' + optHtml + '</div>'
      + '<div class="mcq-submit-row">'
        + '<div class="mcq-nav-row">'
          + (qi > 0 ? '<button class="btn btn-secondary" style="font-size:0.82rem;padding:10px 18px;" onclick="showMCQCard(' + (qi - 1) + ')">← Prev</button>' : '')
        + '</div>'
        + '<button class="mcq-submit-btn" id="msubmit-' + qi + '" onclick="submitAnswer(' + qi + ')" disabled>Submit Answer</button>'
        + '<div class="mcq-nav-row">'
          + (qi < _mcqShuffled.length - 1 ? '<button class="btn btn-secondary" id="mnext-' + qi + '" style="font-size:0.82rem;padding:10px 18px;display:none;" onclick="showMCQCard(' + (qi + 1) + ')">Next →</button>' : '')
          + (qi === _mcqShuffled.length - 1 ? '<button class="btn btn-primary" id="mresults-' + qi + '" style="display:none;" onclick="showMCQResults()">See Results →</button>' : '')
        + '</div>'
      + '</div>'
      + '<div class="mcq-feedback quiz-feedback" id="mfb-' + qi + '" role="alert" aria-live="polite"></div>'
      + '</div>';
  }).join('');
}

function selectOption(qi, oi) {
  if (_mcqAnswers[qi] && _mcqAnswers[qi].answered) return;
  for (var i = 0; i < 4; i++) {
    var opt = document.getElementById('mopt-' + qi + '-' + i);
    if (opt) opt.classList.remove('selected');
  }
  var el = document.getElementById('mopt-' + qi + '-' + oi);
  if (el) el.classList.add('selected');
  _mcqAnswers[qi].selected = oi;
  var submit = document.getElementById('msubmit-' + qi);
  if (submit) submit.disabled = false;
}

function submitAnswer(qi) {
  if (!_mcqAnswers[qi] || _mcqAnswers[qi].answered) return;
  var oi = _mcqAnswers[qi].selected;
  if (oi === null) return;

  _mcqAnswers[qi].answered = true;
  var q       = _mcqShuffled[qi];
  var correct = q.options[oi].correct;
  _mcqAnswers[qi].correct = correct;

  for (var i = 0; i < q.options.length; i++) {
    var opt = document.getElementById('mopt-' + qi + '-' + i);
    if (!opt) continue;
    opt.classList.add('locked');
    opt.setAttribute('tabindex', '-1');
    if (q.options[i].correct)          opt.classList.add('correct');
    if (i === oi && !q.options[i].correct) opt.classList.add('incorrect');
  }

  var dot = document.getElementById('mdot-' + qi);
  if (dot) { dot.classList.remove('answered'); dot.classList.add(correct ? 'correct' : 'incorrect'); }

  var fb = document.getElementById('mfb-' + qi);
  if (fb) {
    fb.className = 'mcq-feedback quiz-feedback show ' + (correct ? 'correct' : 'incorrect');
    fb.innerHTML = '<span class="mcq-feedback-badge quiz-feedback-badge">' + (correct ? '✅ Correct' : '❌ Incorrect') + '</span>'
      + '<p>' + q.rationale.replace(/\n/g, '</p><p style="margin-top:8px;"></p><p>') + '</p>';
  }

  var submit = document.getElementById('msubmit-' + qi);
  if (submit) submit.disabled = true;

  if (qi < _mcqShuffled.length - 1) {
    var next = document.getElementById('mnext-' + qi);
    if (next) next.style.display = '';
  } else {
    var res = document.getElementById('mresults-' + qi);
    if (res) res.style.display = '';
  }
}

function showMCQCard(qi) {
  document.querySelectorAll('.mcq-q-card').forEach(c => c.classList.remove('active'));
  var card = document.getElementById('mqcard-' + qi);
  if (card) card.classList.add('active');
  _mcqCurrent = qi;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showMCQResults() {
  document.querySelectorAll('.mcq-q-card').forEach(c => c.classList.remove('active'));
  var correctCount   = _mcqAnswers.filter(a => a.correct).length;
  var incorrectCount = _mcqAnswers.length - correctCount;
  var pct    = Math.round((correctCount / _mcqAnswers.length) * 100);
  var passed = pct >= 80;

  var icon, msg;
  if (pct === 100) { icon = '🌟'; msg = 'Outstanding! You answered every question correctly. You have a strong understanding of how to recognise, assess and respond to Bob\'s care needs.'; }
  else if (passed) { icon = '✅'; msg = 'Well done — you scored ' + correctCount + ' out of ' + _mcqAnswers.length + '. Review any questions you found challenging before moving on.'; }
  else             { icon = '📚'; msg = 'You scored ' + correctCount + ' out of ' + _mcqAnswers.length + ' (' + pct + '%). Review the rationale for each question and revisit the relevant sections before continuing.'; }

  var res = document.getElementById('mcq-results');
  if (!res) return;
  res.innerHTML =
    '<div class="mcq-results-icon">' + icon + '</div>'
    + '<div class="mcq-results-score quiz-results-score">' + correctCount + ' / ' + _mcqAnswers.length + '</div>'
    + '<div class="mcq-results-label">' + (passed ? 'Passed — well done!' : 'Review recommended') + '</div>'
    + '<div class="mcq-results-breakdown">'
      + '<div class="mcq-result-stat"><div class="mcq-result-stat-num" style="color:#34d399;">' + correctCount + '</div><div class="mcq-result-stat-lbl">Correct</div></div>'
      + '<div class="mcq-result-stat"><div class="mcq-result-stat-num" style="color:#f87171;">' + incorrectCount + '</div><div class="mcq-result-stat-lbl">Incorrect</div></div>'
      + '<div class="mcq-result-stat"><div class="mcq-result-stat-num" style="color:var(--yellow);">' + _mcqAnswers.length + '</div><div class="mcq-result-stat-lbl">Total</div></div>'
    + '</div>'
    + '<div class="mcq-results-msg">' + msg + '</div>'
    + '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">'
      + '<button class="btn btn-secondary" onclick="retryMCQ()">🔄 Retry Quiz</button>'
      + '<button class="btn btn-primary" onclick="goToPage(11)">Continue to Bob\'s Final Visit →</button>'
    + '</div>';
  res.classList.add('show');

  // Save MCQ score to learning record state
  window._mcqFinalScore      = correctCount + ' / ' + _mcqAnswers.length;
  window._mcqFinalPassed     = passed;

  // Unlock continue button on page 10
  var continueBtn = document.getElementById('mcq-continue-btn');
  if (continueBtn && passed) {
    continueBtn.disabled = false;
    continueBtn.style.opacity = '1';
    continueBtn.style.cursor  = 'pointer';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  SCORM.finish(passed ? 'passed' : 'failed', pct);
}

function retryMCQ() {
  var res = document.getElementById('mcq-results');
  if (res) res.classList.remove('show');
  if (SCORM.isInitialized()) { SCORM.setValue('cmi.core.lesson_status', 'incomplete'); SCORM.commit(); }
  renderMCQ();
}
