/* ══════════════════════════════════════════════════════════
   js/cases.js  ·  Five case study MCQs — page 10
   80% pass mark required to unlock learning record (page 11).
══════════════════════════════════════════════════════════ */

const CASES_PASS_MARK = 80;

const casesData = [
  {
    patient: 'Patient 1 — Margaret, 68, lung cancer',
    quote:   '"Over the past few weeks my face has been getting puffier — particularly around my eyes in the mornings. Both my arms feel heavy and my rings won\'t fit any more. Now I can\'t catch my breath even sitting still."',
    question: 'What is the most likely diagnosis and what is the priority initial action?',
    options: [
      { text: 'Cardiac failure — commence IV furosemide and restrict fluids',                                                              correct: false },
      { text: 'Superior Vena Cava Obstruction (SVCO) — sit the patient upright and administer high-dose dexamethasone urgently',           correct: true  },
      { text: 'Anaphylactic reaction — administer IM adrenaline immediately',                                                              correct: false },
      { text: 'Bilateral deep vein thrombosis — arrange urgent compression ultrasound',                                                    correct: false },
    ],
    rationale: 'Classic SVCO: facial oedema worse in the mornings (fluid redistributes when lying flat overnight), bilateral arm swelling from obstructed venous drainage, and dyspnoea from airway compression. Immediate management is sitting the patient upright, high-dose dexamethasone, and urgent oncology referral for radiotherapy or SVC stenting.'
  },
  {
    patient: 'Patient 2 — Colin, 72, prostate cancer with spinal metastases',
    quote:   '"My back pain has been there for months but this week it feels like a tight band around my chest. My legs feel like lead — I nearly fell on the stairs. And I can\'t seem to pass urine properly."',
    question: 'This presentation requires what immediate response?',
    options: [
      { text: 'Prescribe stronger analgesia and arrange physiotherapy in the next few days',                                               correct: false },
      { text: 'Nurse the patient flat with log-rolling precautions and administer high-dose dexamethasone immediately — urgent MRI whole spine within 24 hours', correct: true },
      { text: 'Advise rest and arrange a GP review in 1–2 weeks',                                                                          correct: false },
      { text: 'Refer to urology for bladder scan — the urinary symptoms are the primary concern',                                          correct: false },
    ],
    rationale: 'MSCC until proven otherwise: new band-like thoracic pain, bilateral motor weakness (heavy legs, near-fall), and bladder dysfunction are all red flags. The urinary symptoms are part of MSCC — not an isolated urological problem. Per NICE NG127: nurse flat immediately, high-dose dexamethasone 16mg, urgent MRI of the whole spine within 24 hours. Do not wait for imaging before implementing spinal precautions.'
  },
  {
    patient: 'Patient 3 — Pauline, 61, breast cancer',
    quote:   '"I\'ve been terribly confused lately — my daughter says I\'m not making sense. I keep needing the toilet constantly but still feel really thirsty. I\'ve also been dreadfully constipated for a week."',
    question: 'Which metabolic emergency best explains this triad of symptoms, and what is the treatment?',
    options: [
      { text: 'Dehydration secondary to poor oral intake — commence subcutaneous fluids at home',                                          correct: false },
      { text: 'Opioid toxicity — reduce the opioid dose and monitor',                                                                      correct: false },
      { text: 'Malignant hypercalcaemia — check serum calcium, IV hydration followed by IV bisphosphonate',                                correct: true  },
      { text: 'Urinary tract infection causing confusion — send MSU and start antibiotics',                                                correct: false },
    ],
    rationale: '"Stones, Bones, Groans and Moans" maps perfectly here: confusion (Moans), polyuria and polydipsia (Stones), and constipation (Groans). Treatment is IV hydration followed by IV bisphosphonate (Zoledronic acid or Pamidronate). UTI is possible but would not explain the complete picture. Opioid toxicity causes drowsiness and myoclonus, not polyuria.'
  },
  {
    patient: 'Patient 4 — Derek, 57, advanced head and neck cancer',
    quote:   'You are visiting Derek at home. He suddenly begins to bleed heavily from the mouth. You are alone with him.',
    question: 'Applying the ABC framework, what is your FIRST priority action?',
    options: [
      { text: 'Call 999 immediately and wait outside for the ambulance',                                                                   correct: false },
      { text: 'Apply direct pressure to the wound site to stem the bleeding',                                                              correct: false },
      { text: 'Speak calmly and reassuringly to Derek — your composed presence is the first and most important intervention',              correct: true  },
      { text: 'Locate the anticipatory medication and administer Midazolam as the first step',                                             correct: false },
    ],
    rationale: 'ABC: A = Assure (calm the patient first — fear worsens the experience), B = Be There (do not leave), C = Comfort/Cover/Call (dark towels, Midazolam if prescribed, then call for help). Medication is the third step, not the first. Calling 999 and leaving the patient alone is the worst possible response in this situation.'
  },
  {
    patient: 'Patient 5 — Joan, 79, brain metastases from lung cancer',
    quote:   'You are called to Joan who is having a generalised tonic-clonic seizure at her hospice bedside. The seizure has now been ongoing for six minutes.',
    question: 'After ensuring a safe environment and airway, what is the NEXT priority?',
    options: [
      { text: 'Administer buccal Midazolam (10mg) immediately as first-line treatment',                                                   correct: false },
      { text: 'Check blood glucose (BM) to exclude hypoglycaemia before administering anticonvulsants',                                   correct: true  },
      { text: 'Call 999 for an ambulance — all seizures in hospice patients require hospital transfer',                                    correct: false },
      { text: 'Administer IV diazepam as this is more rapidly effective than buccal Midazolam',                                           correct: false },
    ],
    rationale: 'After establishing safety, check blood glucose. Hypoglycaemia causes seizure-like episodes and requires completely different treatment — giving anticonvulsants to a hypoglycaemic patient could be harmful. Only after excluding hypoglycaemia should buccal Midazolam be given. Hospice patients rarely need 999. IV diazepam is not the preferred route in community/hospice settings.'
  }
];

/* ── STATE ─────────────────────────────────────────── */
let _casesAnswers  = [];    /* { selected: idx|null, correct: bool, answered: bool } */
let _casesShuffled = [];    /* questions with shuffled options */

/* ── INIT ──────────────────────────────────────────── */
function renderCases() {
  _casesAnswers  = casesData.map(() => ({ selected: null, correct: false, answered: false }));
  _casesShuffled = casesData.map(q => {
    const opts = q.options.map((o, i) => ({ ...o, origIdx: i }));
    /* shuffle */
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return { ...q, options: opts };
  });

  /* Progress dots */
  const dots = document.getElementById('cases-dots');
  if (dots) {
    dots.innerHTML = _casesShuffled.map((_, i) =>
      `<div class="cases-dot" id="cdot-${i}" aria-hidden="true"></div>`
    ).join('');
  }

  const container = document.getElementById('cases-questions-container');
  if (!container) return;

  container.innerHTML = _casesShuffled.map((q, qi) => {
    const letters = ['A','B','C','D'];
    const opts = q.options.map((opt, oi) => `
      <div class="cases-option" id="copt-${qi}-${oi}" role="button" tabindex="0"
           onclick="casesSelectOption(${qi},${oi})"
           onkeydown="if(event.key==='Enter'||event.key===' ')casesSelectOption(${qi},${oi})"
           aria-label="Option ${letters[oi]}: ${opt.text.replace(/"/g,'&quot;')}">
        <div class="cases-opt-letter">${letters[oi]}</div>
        <span>${opt.text}</span>
      </div>`).join('');

    const isFirst = qi === 0;
    const isLast  = qi === casesData.length - 1;

    return `
    <div class="cases-q-card${isFirst ? ' active' : ''}" id="cqcard-${qi}">
      <div class="cases-patient-card">
        <div class="cases-patient-eyebrow">${q.patient}</div>
        <div class="cases-patient-quote">${q.quote}</div>
      </div>
      <div class="cases-q-header">
        <div class="cases-q-num">Question ${qi + 1} of ${_casesShuffled.length}</div>
        <div class="cases-q-text">${q.question}</div>
      </div>
      <div class="cases-options">${opts}</div>
      <div class="cases-submit-row">
        <div class="cases-nav-row">
          ${qi > 0 ? `<button class="btn btn-secondary" style="font-size:.82rem;padding:10px 18px;" onclick="casesShowCard(${qi-1})">← Prev</button>` : ''}
        </div>
        <button class="cases-submit-btn" id="csubmit-${qi}" onclick="casesSubmit(${qi})" disabled>Submit Answer</button>
        <div class="cases-nav-row">
          ${!isLast ? `<button class="btn btn-secondary" id="cnext-${qi}" style="font-size:.82rem;padding:10px 18px;display:none;" onclick="casesShowCard(${qi+1})">Next →</button>` : ''}
          ${isLast  ? `<button class="btn btn-primary" id="cresults-${qi}" style="display:none;" onclick="casesShowResults()">See Results →</button>` : ''}
        </div>
      </div>
      <div class="cases-feedback" id="cfb-${qi}" role="alert" aria-live="polite"></div>
    </div>`;
  }).join('');
}

/* ── SELECT OPTION ─────────────────────────────────── */
function casesSelectOption(qi, oi) {
  if (_casesAnswers[qi] && _casesAnswers[qi].answered) return;
  for (let i = 0; i < 4; i++) {
    const o = document.getElementById(`copt-${qi}-${i}`);
    if (o) o.classList.remove('selected');
  }
  const el = document.getElementById(`copt-${qi}-${oi}`);
  if (el) el.classList.add('selected');
  _casesAnswers[qi].selected = oi;
  const submit = document.getElementById(`csubmit-${qi}`);
  if (submit) submit.disabled = false;
}

/* ── SUBMIT ────────────────────────────────────────── */
function casesSubmit(qi) {
  if (!_casesAnswers[qi] || _casesAnswers[qi].answered) return;
  const oi = _casesAnswers[qi].selected;
  if (oi === null) return;

  _casesAnswers[qi].answered = true;
  const q       = _casesShuffled[qi];
  const correct = q.options[oi].correct;
  _casesAnswers[qi].correct = correct;

  /* Mark all options */
  q.options.forEach((opt, i) => {
    const el = document.getElementById(`copt-${qi}-${i}`);
    if (!el) return;
    el.classList.add('locked');
    el.setAttribute('tabindex', '-1');
    if (opt.correct) el.classList.add('correct');
    if (i === oi && !opt.correct) el.classList.add('incorrect');
  });

  /* Dot */
  const dot = document.getElementById(`cdot-${qi}`);
  if (dot) dot.classList.add(correct ? 'correct' : 'incorrect');

  /* Feedback */
  const fb = document.getElementById(`cfb-${qi}`);
  if (fb) {
    fb.className = `cases-feedback show ${correct ? 'correct' : 'incorrect'}`;
    fb.innerHTML = `<span class="cases-feedback-badge">${correct ? '✅ Correct' : '❌ Incorrect'}</span><p>${q.rationale}</p>`;
  }

  /* Submit btn off */
  const sub = document.getElementById(`csubmit-${qi}`);
  if (sub) sub.disabled = true;

  /* Show next/results */
  const isLast = qi === casesData.length - 1;
  if (!isLast) {
    const nx = document.getElementById(`cnext-${qi}`);
    if (nx) nx.style.display = '';
  } else {
    const rs = document.getElementById(`cresults-${qi}`);
    if (rs) rs.style.display = '';
  }
}

/* ── NAVIGATE CARDS ────────────────────────────────── */
function casesShowCard(qi) {
  document.querySelectorAll('.cases-q-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById('cqcard-' + qi);
  if (card) card.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── SHOW RESULTS ──────────────────────────────────── */
function casesShowResults() {
  document.querySelectorAll('.cases-q-card').forEach(c => c.classList.remove('active'));

  const correctCount = _casesAnswers.filter(a => a.correct).length;
  const total        = _casesAnswers.length;
  const pct          = Math.round((correctCount / total) * 100);
  const passed       = pct >= CASES_PASS_MARK;

  window._casesScore  = `${correctCount} / ${total} (${pct}%)`;
  window._casesPassed = passed;

  const res = document.getElementById('cases-results');
  if (!res) return;

  const icon = pct === 100 ? '🌟' : passed ? '✅' : '📚';
  const lbl  = passed ? 'Well done — you passed!' : 'Review recommended';
  const msg  = passed
    ? `<strong>Excellent work.</strong> You scored ${correctCount} out of ${total} (${pct}%). You have demonstrated a solid understanding of recognising and responding to palliative emergencies. Continue to your learning record.`
    : `<strong>Not to worry.</strong> You scored ${correctCount} out of ${total} (${pct}%). A score of ${CASES_PASS_MARK}% or above is required. Review the module sections and try again — use the rationale in each question to guide your revision.`;

  res.innerHTML = `
    <div class="cases-results-icon">${icon}</div>
    <div class="cases-results-score">${correctCount} / ${total}</div>
    <div class="cases-results-label">${lbl}</div>
    <div class="cases-results-breakdown">
      <div class="cases-stat"><div class="cases-stat-num" style="color:#34d399;">${correctCount}</div><div class="cases-stat-lbl">Correct</div></div>
      <div class="cases-stat"><div class="cases-stat-num" style="color:#f87171;">${total - correctCount}</div><div class="cases-stat-lbl">Incorrect</div></div>
      <div class="cases-stat"><div class="cases-stat-num" style="color:var(--text-muted);">${total}</div><div class="cases-stat-lbl">Total</div></div>
    </div>
    <div class="cases-results-msg">${msg}</div>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <button class="btn btn-secondary" onclick="casesRetry()">↩ Try Again</button>
      ${passed ? `<button class="btn btn-primary" id="cases-to-record-btn" onclick="goToPage(11)">My Learning Record →</button>` : ''}
    </div>`;
  res.classList.add('show');

  SCORM.setScore(pct, 0, 100);
  if (passed) {
    SCORM.setCompletion('passed');
    unlockContinue('_lock_cases', 'cases-locked-msg', 'cases-continue-btn');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── RETRY ─────────────────────────────────────────── */
function casesRetry() {
  const res = document.getElementById('cases-results');
  if (res) res.classList.remove('show');
  lockContinue('_lock_cases', 'cases-locked-msg', 'cases-continue-btn');
  window._casesScore  = null;
  window._casesPassed = null;
  if (SCORM.isInitialized()) {
    SCORM.set('cmi.core.lesson_status', 'incomplete');
    SCORM.commit();
  }
  renderCases();
}
