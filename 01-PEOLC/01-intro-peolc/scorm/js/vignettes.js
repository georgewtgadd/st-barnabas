/* ══════════════════════════════════════════════════════════
   js/vignettes.js  ·  Patient vignette activity — page 7
══════════════════════════════════════════════════════════ */

const vignetteFeedback = {
  1: {
    correct:   true,
    correctMsg: '<strong>✓ Correct — Margaret IS approaching end of life.</strong><br>She meets <strong>Criterion A</strong> (advanced, progressive, incurable condition) and <strong>Criterion B</strong> (general frailty with co-existing conditions). Repeated admissions and withdrawal of disease-modifying treatment indicate a trajectory likely to lead to death within 12 months.',
    incorrectMsg: 'Not quite. Margaret meets <strong>Criterion A</strong> and <strong>Criterion B</strong> — advanced heart failure with withdrawal of active treatment and increasing frailty is a clear indicator that she is approaching end of life.',
  },
  2: {
    correct:   false,
    correctMsg: '<strong>✓ Correct — David is NOT approaching end of life.</strong><br>David is recovering well from a routine procedure, has no serious comorbidities, and has a normal expected outcome. None of the four GMC criteria apply.',
    incorrectMsg: 'Not quite. David does not meet any of the four criteria. His hip replacement is a routine procedure with a good expected recovery, and his mild hypertension is controlled. He is not approaching end of life.',
  },
  3: {
    correct:   true,
    correctMsg: '<strong>✓ Correct — Priya IS approaching end of life.</strong><br>She meets <strong>Criterion A</strong> — rapidly progressing, incurable MND with a prognosis now measured in months. The loss of swallowing and ventilation needs are strong indicators of terminal trajectory.',
    incorrectMsg: 'Not quite. Priya meets <strong>Criterion A</strong> — rapidly progressive, incurable MND with a prognosis measured in months. Her condition clearly qualifies her as approaching end of life under the GMC &amp; NICE definition.',
  },
};

// State — expose for record.js
window.vignetteAnswered = { 1: null, 2: null, 3: null };

let _vigsDone = false;

function answerVignette(num, isYes) {
  const data = vignetteFeedback[num];
  if (!data) return;

  const userSaysYes = isYes;
  const isCorrect   = (userSaysYes === data.correct);

  window.vignetteAnswered[num] = { choice: isYes, correct: isCorrect };

  // Style buttons
  const yesBtn = document.getElementById('vig-' + num + '-yes');
  const noBtn  = document.getElementById('vig-' + num + '-no');
  [yesBtn, noBtn].forEach(b => { if (b) b.disabled = true; });

  if (yesBtn) yesBtn.style.borderColor = isYes  ? (isCorrect ? '#059669' : '#dc2626') : '';
  if (noBtn)  noBtn.style.borderColor  = !isYes ? (isCorrect ? '#059669' : '#dc2626') : '';

  // Feedback
  const fb = document.getElementById('vig-' + num + '-feedback');
  if (fb) {
    fb.className = 'vignette-rationale show ' + (isCorrect ? 'correct' : 'incorrect');
    fb.innerHTML = isCorrect ? data.correctMsg : data.incorrectMsg;
  }

  _checkAllVignettes();
}

function _checkAllVignettes() {
  const all = window.vignetteAnswered;
  const allAnsweredCorrectly =
    all[1] && all[1].correct &&
    all[2] && all[2].correct &&
    all[3] && all[3].correct;

  if (allAnsweredCorrectly) {
    _vigsDone = true;
    const lock = document.getElementById('vig-locked-msg');
    const btn  = document.getElementById('vig-continue-btn');
    if (lock) lock.style.display = 'none';
    if (btn)  btn.hidden = false;
  }
}

function resetVignettes() {
  window.vignetteAnswered = { 1: null, 2: null, 3: null };
  _vigsDone = false;

  for (let i = 1; i <= 3; i++) {
    const yesBtn = document.getElementById('vig-' + i + '-yes');
    const noBtn  = document.getElementById('vig-' + i + '-no');
    const fb     = document.getElementById('vig-' + i + '-feedback');
    [yesBtn, noBtn].forEach(b => {
      if (b) { b.disabled = false; b.style.borderColor = ''; }
    });
    if (fb) { fb.className = 'vignette-rationale'; fb.innerHTML = ''; }
  }

  const lock = document.getElementById('vig-locked-msg');
  const btn  = document.getElementById('vig-continue-btn');
  if (lock) lock.style.display = '';
  if (btn)  btn.hidden = true;
}

function openGmcModal() {
  const m = document.getElementById('gmc-ref-modal');
  if (m) m.classList.add('open');
}

function closeGmcModal() {
  const m = document.getElementById('gmc-ref-modal');
  if (m) m.classList.remove('open');
}
