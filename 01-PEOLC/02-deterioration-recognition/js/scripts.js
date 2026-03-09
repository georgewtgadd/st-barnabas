/* ══════════════════════════════════════════════════════════
   ST BARNABAS HOSPICE — What is End of Life Palliative Care?
   js/scripts.js  ·  SCORM 1.2 Edition for EQUAL Online
   ──────────────────────────────────────────────────────────
   SCORM 1.2 data model elements used:
     cmi.core.lesson_status   → "passed" | "failed" | "incomplete" | "not attempted"
     cmi.core.score.raw       → 0–100  (quiz percentage)
     cmi.core.score.min       → 0
     cmi.core.score.max       → 100
     cmi.core.session_time    → HH:MM:SS
     cmi.core.lesson_location → current page number (bookmark)
     cmi.suspend_data         → JSON string bookmark
══════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════
   SECTION 1 — SCORM 1.2 API WRAPPER
   Finds the LMS-injected API object and exposes safe helpers
   for Initialize, SetValue, GetValue, Commit and Finish.
══════════════════════════════════════════════════════════ */

var SCORM = (function () {

  'use strict';

  var _api          = null;
  var _initialized  = false;
  var _finished     = false;
  var _sessionStart = Date.now();

  /* ── Find the API object injected by the LMS ─────────── */
  // SCORM 1.2 spec: walk up to 7 parent frames looking for
  // a window that exposes an object called "API".
  function _findAPI(win) {
    var attempts = 0;
    while (win.API == null && win.parent != null && win.parent !== win) {
      attempts++;
      if (attempts > 7) { return null; }
      win = win.parent;
    }
    return win.API || null;
  }

  function _getAPI() {
    var api = _findAPI(window);
    if (api == null && window.opener != null && window.opener !== window) {
      api = _findAPI(window.opener);
    }
    return api;
  }

  /* ── Initialize ─────────────────────────────────────── */
  function initialize() {
    if (_initialized || _finished) { return false; }
    _api = _getAPI();
    if (_api == null) {
      // No LMS present — running as a standalone file. Fail silently.
      console.info('[SCORM] No LMS API found — running in standalone mode.');
      return false;
    }
    var result = _api.LMSInitialize('');
    if (result === 'true' || result === true) {
      _initialized  = true;
      _sessionStart = Date.now();
      // Tell the LMS the learner has started
      setValue('cmi.core.lesson_status', 'incomplete');
      setValue('cmi.core.score.min',     '0');
      setValue('cmi.core.score.max',     '100');
      commit();
      return true;
    }
    console.warn('[SCORM] LMSInitialize failed. Error:', _api.LMSGetLastError());
    return false;
  }

  /* ── SetValue ────────────────────────────────────────── */
  function setValue(element, value) {
    if (!_initialized || _finished || _api == null) { return false; }
    var result = _api.LMSSetValue(element, String(value));
    if (result !== 'true' && result !== true) {
      console.warn('[SCORM] LMSSetValue failed for', element, '—', _api.LMSGetLastError());
      return false;
    }
    return true;
  }

  /* ── GetValue ────────────────────────────────────────── */
  function getValue(element) {
    if (!_initialized || _finished || _api == null) { return ''; }
    return _api.LMSGetValue(element);
  }

  /* ── Commit (flush buffered data to the LMS) ─────────── */
  function commit() {
    if (!_initialized || _finished || _api == null) { return false; }
    var result = _api.LMSCommit('');
    if (result !== 'true' && result !== true) {
      console.warn('[SCORM] LMSCommit failed:', _api.LMSGetLastError());
      return false;
    }
    return true;
  }

  /* ── Format elapsed ms as HH:MM:SS ──────────────────── */
  function _formatTime(ms) {
    var total = Math.floor(ms / 1000);
    var h     = Math.floor(total / 3600);
    var m     = Math.floor((total % 3600) / 60);
    var s     = total % 60;
    return (h < 10 ? '0' : '') + h + ':' +
           (m < 10 ? '0' : '') + m + ':' +
           (s < 10 ? '0' : '') + s;
  }

  /* ── Finish ──────────────────────────────────────────── */
  // status : 'passed' | 'failed' | 'incomplete'  (or null to leave unchanged)
  // score  : number 0–100  (or null to skip score reporting)
  // Guards against double-calling — safe to call from both
  // showResults() and the beforeunload handler.
  function finish(status, score) {
    if (_finished || !_initialized || _api == null) { return false; }

    setValue('cmi.core.session_time', _formatTime(Date.now() - _sessionStart));

    if (status !== null && status !== undefined) {
      setValue('cmi.core.lesson_status', status);
    }
    if (score !== null && score !== undefined) {
      setValue('cmi.core.score.raw', String(Math.round(score)));
    }

    commit();

    var result = _api.LMSFinish('');
    _finished  = true;

    if (result !== 'true' && result !== true) {
      console.warn('[SCORM] LMSFinish failed:', _api.LMSGetLastError());
      return false;
    }
    return true;
  }

  /* ── Bookmark helpers ────────────────────────────────── */
  function saveBookmark(pageNum) {
    setValue('cmi.core.lesson_location', String(pageNum));
    setValue('cmi.suspend_data', JSON.stringify({ page: pageNum }));
    commit();
  }

  function getBookmark() {
    try {
      var raw = getValue('cmi.suspend_data');
      if (raw) {
        var data = JSON.parse(raw);
        return data.page || 1;
      }
    } catch (e) { /* ignore JSON parse errors */ }
    var loc = parseInt(getValue('cmi.core.lesson_location'), 10);
    return isNaN(loc) ? 1 : loc;
  }

  /* ── Public surface ──────────────────────────────────── */
  return {
    initialize:    initialize,
    setValue:      setValue,
    getValue:      getValue,
    commit:        commit,
    finish:        finish,
    saveBookmark:  saveBookmark,
    getBookmark:   getBookmark,
    isInitialized: function () { return _initialized; }
  };

}());


/* ══════════════════════════════════════════════════════════
   SECTION 2 — PAGE NAVIGATION
══════════════════════════════════════════════════════════ */

var visited     = new Set([1]);
var TOTAL_PAGES = 7;

function updateProgressBar(num) {
  var pct   = Math.round(((num - 1) / (TOTAL_PAGES - 1)) * 100);
  var fill  = document.getElementById('progress-fill');
  var label = document.getElementById('progress-label');
  if (fill)  { fill.style.width = pct + '%'; }
  if (label) {
    label.textContent = pct + '% complete';
    var bar = label.closest('.module-progress-bar');
    if (bar) { bar.setAttribute('aria-valuenow', pct); }
  }
}

function goToPage(num) {
  visited.add(num);

  document.querySelectorAll('.page').forEach(function (p) {
    p.classList.remove('active');
  });

  var page = document.getElementById('page-' + num);
  if (page) { page.classList.add('active'); }

  for (var i = 1; i <= TOTAL_PAGES; i++) {
    var step = document.getElementById('nav-' + i);
    if (!step) { continue; }
    step.classList.remove('current', 'done');
    step.removeAttribute('aria-current');
    if (i === num) {
      step.classList.add('current');
      step.setAttribute('aria-current', 'step');
      step.disabled = false;
    } else if (visited.has(i)) {
      step.classList.add('done');
      step.disabled = false;
    } else {
      step.disabled = true;
    }
  }

  updateProgressBar(num);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Move focus to heading for screen readers
  var heading = page && page.querySelector('h1, h2');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }

  // SCORM: save bookmark and keep status as incomplete
  SCORM.saveBookmark(num);
  if (SCORM.isInitialized()) {
    var current = SCORM.getValue('cmi.core.lesson_status');
    if (current !== 'passed' && current !== 'failed') {
      SCORM.setValue('cmi.core.lesson_status', 'incomplete');
      SCORM.commit();
    }
  }
}

function navClick(num) {
  if (visited.has(num)) { goToPage(num); }
}


/* ══════════════════════════════════════════════════════════
   SECTION 3 — REFLECTIVE ACTIVITY
══════════════════════════════════════════════════════════ */

var savedReflection = '';

function saveReflection() {
  var textarea = document.getElementById('reflect-input');
  if (!textarea) { return; }
  savedReflection = textarea.value.trim();
  var banner = document.getElementById('reflect-saved-banner');
  if (banner) { banner.classList.add('show'); }
}

function downloadReflection() {
  var textarea = document.getElementById('reflect-input');
  var text     = textarea ? textarea.value.trim() : '';
  if (!text) {
    alert('Please type your reflection before downloading.');
    return;
  }
  var lines = [
    'St Barnabas Hospice \u2014 E-Learning Platform',
    'Module: What is End of Life Palliative Care?',
    'Activity: Reflective Activity \u2014 Terminology & Its Impact',
    '',
    'Question:',
    'What challenges can arise from using the terms "palliative care" and "end of life care"?',
    'What impact might this have on patients, families, and professionals?',
    '',
    'My Response:',
    text,
    '',
    'Saved: ' + new Date().toLocaleString('en-GB'),
  ];
  var blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href     = url;
  a.download = 'palliative-care-reflection.txt';
  a.click();
  URL.revokeObjectURL(url);
}

function openModelAnswerModal() {
  var modal = document.getElementById('model-answer-modal');
  if (!modal) { return; }

  var panel    = document.getElementById('user-answer-panel');
  var textEl   = document.getElementById('user-answer-text');
  var live     = document.getElementById('reflect-input');
  var display  = savedReflection || (live ? live.value.trim() : '');

  if (panel && textEl) {
    if (display) {
      textEl.textContent  = display;
      panel.style.display = 'block';
    } else {
      panel.style.display = 'none';
    }
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  var closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) { closeBtn.focus(); }
}

function closeModelAnswerModal() {
  var modal = document.getElementById('model-answer-modal');
  if (modal) { modal.classList.remove('open'); }
  document.body.style.overflow = '';
}


/* ══════════════════════════════════════════════════════════
   SECTION 4 — PHASES & LAYERS INTERACTIVE MODEL
   Based on Wong et al (2024)
══════════════════════════════════════════════════════════ */

var PHASES_REQUIRED = 4;
var phasesExplored  = new Set();

var phaseData = {
  phase: {
    1: {
      icon: '\uD83D\uDFE2', tag: 'Phase 1', name: 'Stable',
      stripe: '#0197de', iconBg: 'rgba(1,151,222,0.14)', tagColor: '#7dd3fc',
      definition: 'The person has a life-limiting illness but their symptoms are adequately controlled and their condition is not actively changing. Care during this phase focuses on maintaining quality of life, monitoring, and early advance care planning.',
      listLabel: 'Clinical characteristics',
      items: [
        'Illness present and acknowledged',
        'Symptoms managed \u2014 person can engage in daily life',
        'Palliative care can begin here, well before end of life',
        'Good opportunity to introduce advance care planning',
        'Regular review and monitoring in primary care or community setting'
      ],
      source: 'Wong et al (2024) Phases and Layers of Palliative Care Framework'
    },
    2: {
      icon: '\uD83D\uDFE1', tag: 'Phase 2', name: 'Unstable',
      stripe: '#0d9488', iconBg: 'rgba(13,148,136,0.14)', tagColor: '#5eead4',
      definition: 'An acute change or deterioration has occurred that was not expected as part of the usual illness trajectory. This may require urgent assessment and often a change in the care plan. The person may recover to a stable state, deteriorate further, or die.',
      listLabel: 'Clinical characteristics',
      items: [
        'Unexpected acute deterioration or new clinical problem',
        'Requires urgent assessment \u2014 often results in care plan change',
        'Person and family may need additional emotional support',
        'Review of goals of care and treatment decisions is important',
        'Person may stabilise, deteriorate, or die \u2014 uncertainty is high'
      ],
      source: 'Wong et al (2024) Phases and Layers of Palliative Care Framework'
    },
    3: {
      icon: '\uD83D\uDFE0', tag: 'Phase 3', name: 'Deteriorating',
      stripe: '#fdca0f', iconBg: 'rgba(253,202,15,0.12)', tagColor: '#fdca0f',
      definition: 'The person\'s condition is worsening gradually over weeks or months as a result of their life-limiting illness. Advance care planning should be well established, and the focus shifts more towards comfort and quality of life.',
      listLabel: 'Clinical characteristics',
      items: [
        'Progressive functional decline over weeks or months',
        'Expected as part of illness trajectory \u2014 not a sudden change',
        'Increasing symptom burden requiring proactive management',
        'Advance care planning should be complete or underway',
        'Key time to discuss preferred place of death and ReSPECT'
      ],
      source: 'Wong et al (2024) Phases and Layers of Palliative Care Framework'
    },
    4: {
      icon: '\uD83D\uDD34', tag: 'Phase 4', name: 'Terminal',
      stripe: '#ef4444', iconBg: 'rgba(220,38,38,0.14)', tagColor: '#fca5a5',
      definition: 'The person is in the last hours or days of life. Death is expected imminently. The focus is entirely on comfort, dignity, and supporting the person and their loved ones through this final stage.',
      listLabel: 'Clinical characteristics',
      items: [
        'Death expected within hours or days',
        'Emphasis on comfort, dignity, and symptom control',
        'Anticipatory medicines should be in place',
        'Family and carers need clear information and support',
        'Preferred place of death should be honoured where possible'
      ],
      source: 'Wong et al (2024) Phases and Layers of Palliative Care Framework'
    },
    5: {
      icon: '\uD83D\uDC9C', tag: 'Phase 5', name: 'Bereavement',
      stripe: '#7c6ef5', iconBg: 'rgba(124,110,245,0.14)', tagColor: '#c4b5fd',
      definition: 'Bereavement care begins at the time of death and continues for as long as families and carers need support. Grief is a normal response to loss, but some individuals experience complicated grief that requires specialist intervention.',
      listLabel: 'Key considerations',
      items: [
        'Care and support for family and carers after death',
        'Grief is individual \u2014 responses vary greatly',
        'Anticipatory grief may have begun long before death',
        'Consider referral to bereavement services where appropriate',
        'Children in the family require specific, age-appropriate support'
      ],
      source: 'Wong et al (2024) Phases and Layers of Palliative Care Framework'
    }
  },
  layer: {
    1: {
      icon: '\uD83E\uDE7A', tag: 'Layer', name: 'Physical Care',
      stripe: '#0197de', iconBg: 'rgba(1,151,222,0.14)', tagColor: '#7dd3fc',
      definition: 'Physical care encompasses all aspects of symptom management, comfort, and clinical care. It includes pain management, breathlessness, nausea, fatigue, and other physical symptoms. The goal is not cure but the best possible quality of life.',
      listLabel: 'Examples of physical care',
      items: [
        'Pain assessment and management (pharmacological and non-pharmacological)',
        'Breathlessness management including oxygen and positioning',
        'Nausea, vomiting, and appetite support',
        'Wound care, pressure area prevention, and comfort positioning',
        'Anticipatory prescribing for common end of life symptoms'
      ],
      source: 'Wong et al (2024) Phases and Layers of Palliative Care Framework'
    },
    2: {
      icon: '\uD83D\uDD4A\uFE0F', tag: 'Layer', name: 'Psychological & Emotional',
      stripe: '#7c6ef5', iconBg: 'rgba(124,110,245,0.14)', tagColor: '#c4b5fd',
      definition: 'This layer recognises that living with a life-limiting illness profoundly affects mental and emotional wellbeing. Fear, grief, loss of identity, anxiety, and depression are common. Support may range from active listening to specialist psychological services.',
      listLabel: 'Key psychological dimensions',
      items: [
        'Anticipatory grief \u2014 grief before the loss occurs',
        'Anxiety about dying, pain, and being a burden',
        'Adjustment to changing roles and loss of independence',
        'Depression \u2014 often underdiagnosed in palliative patients',
        'Specialist counselling or psychological support where needed'
      ],
      source: 'Wong et al (2024) Phases and Layers of Palliative Care Framework'
    },
    3: {
      icon: '\uD83E\uDD1D', tag: 'Layer', name: 'Social & Practical',
      stripe: '#2ecc8e', iconBg: 'rgba(46,204,142,0.12)', tagColor: '#6ee7b7',
      definition: 'Serious illness affects not just the individual but everyone around them. This layer addresses family and carer wellbeing, social connection, financial hardship, and practical day-to-day needs.',
      listLabel: 'Social and practical considerations',
      items: [
        'Carer support \u2014 recognising and preventing carer burnout',
        'Financial hardship \u2014 benefits, CHC, and welfare advice',
        'Home adaptations, equipment, and care packages',
        'Risk of social isolation and loneliness',
        'Safeguarding considerations for vulnerable individuals'
      ],
      source: 'Wong et al (2024) Phases and Layers of Palliative Care Framework'
    },
    4: {
      icon: '\u2728', tag: 'Layer', name: 'Spiritual & Cultural',
      stripe: '#fdca0f', iconBg: 'rgba(253,202,15,0.1)', tagColor: '#fde68a',
      definition: 'Spiritual wellbeing relates to meaning, purpose, peace, and identity in the face of death. Cultural beliefs shape how people understand illness, dying, and death. Sensitive attention to these dimensions is central to person-centred palliative care.',
      listLabel: 'Key dimensions',
      items: [
        'Religious practices, rituals, and faith community support',
        'Cultural beliefs about death, dying, and the afterlife',
        'Meaning-making and life review',
        'Spiritual distress \u2014 existential suffering, fear, or despair',
        'Chaplaincy and spiritual care services'
      ],
      source: 'Wong et al (2024) Phases and Layers of Palliative Care Framework'
    },
    5: {
      icon: '\uD83D\uDCAC', tag: 'Layer', name: 'Communication & ACP',
      stripe: '#0d9488', iconBg: 'rgba(13,148,136,0.14)', tagColor: '#5eead4',
      definition: 'Clear, compassionate communication is the thread that runs through all of palliative care. Advance Care Planning allows people to express their wishes, values, and preferences for future care.',
      listLabel: 'Key communication elements',
      items: [
        'Honest, sensitive conversations about prognosis and goals of care',
        'Advance Care Planning \u2014 recording wishes, values, and preferences',
        'ReSPECT conversations and documentation',
        'DNACPR discussions and decision-making',
        'Lasting Power of Attorney (Health & Welfare)'
      ],
      source: 'Wong et al (2024) Phases and Layers of Palliative Care Framework'
    },
    6: {
      icon: '\uD83D\uDD17', tag: 'Layer', name: 'Coordination & MDT',
      stripe: '#ef4444', iconBg: 'rgba(220,38,38,0.12)', tagColor: '#fca5a5',
      definition: 'Effective palliative care depends on seamless coordination across a multidisciplinary team and across care settings. Poor coordination leads to fragmented care, avoidable hospital admissions, and unmet needs.',
      listLabel: 'Coordination in practice',
      items: [
        'MDT working \u2014 GP, specialist nurse, social worker, chaplain, OT, physio',
        'Shared care records and handover between settings',
        'Named keyworker or care coordinator for the person and family',
        'Avoiding avoidable hospital admissions through proactive planning',
        'Hospice, community, hospital, and care home integration'
      ],
      source: 'Wong et al (2024) Phases and Layers of Palliative Care Framework'
    }
  }
};

function openPhaseDetail(type, id) {
  var key  = type + '-' + id;
  var data = phaseData[type] && phaseData[type][id];
  if (!data) { return; }

  phasesExplored.add(key);

  document.querySelectorAll('.phase-btn, .layer-btn').forEach(function (b) {
    b.classList.remove('active');
  });
  var btn = document.getElementById((type === 'phase' ? 'pb-' : 'lb-') + id);
  if (btn) { btn.classList.add('active'); }

  var stripe = document.getElementById('phm-stripe');
  if (stripe) { stripe.style.background = data.stripe; }

  var iconEl = document.getElementById('phm-icon');
  if (iconEl) { iconEl.style.background = data.iconBg; iconEl.textContent = data.icon; }

  var tagEl = document.getElementById('phm-tag');
  if (tagEl) { tagEl.style.color = data.tagColor; tagEl.textContent = data.tag; }

  var titleEl = document.getElementById('phm-title');
  if (titleEl) { titleEl.textContent = data.name; }

  var defEl = document.getElementById('phm-definition');
  if (defEl) { defEl.textContent = data.definition; }

  var listLabelEl = document.getElementById('phm-list-label');
  if (listLabelEl) { listLabelEl.textContent = data.listLabel; }

  var listEl = document.getElementById('phm-list');
  if (listEl) {
    listEl.innerHTML = '<ul class="phase-detail-list">' +
      data.items.map(function (item) {
        return '<li><div class="phase-detail-dot" style="background:' + data.stripe + ';"></div><span>' + item + '</span></li>';
      }).join('') +
    '</ul>';
  }

  var sourceEl = document.getElementById('phm-source');
  if (sourceEl) { sourceEl.textContent = data.source; }

  var remaining = PHASES_REQUIRED - phasesExplored.size;
  var hintEl    = document.getElementById('phm-hint');
  if (hintEl) {
    hintEl.textContent = phasesExplored.size < PHASES_REQUIRED
      ? 'Explore ' + remaining + ' more item' + (remaining !== 1 ? 's' : '') + ' to unlock Continue.'
      : 'All required items explored \u2014 you may now continue.';
  }

  var modal = document.getElementById('phase-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    var closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) { closeBtn.focus(); }
  }
}

function closePhaseModal() {
  var modal = document.getElementById('phase-modal');
  if (modal) { modal.classList.remove('open'); }
  document.body.style.overflow = '';
  document.querySelectorAll('.phase-btn, .layer-btn').forEach(function (b) {
    b.classList.remove('active');
  });
  if (phasesExplored.size >= PHASES_REQUIRED) { unlockPhasesContinue(); }
}

function unlockPhasesContinue() {
  var lockMsg = document.getElementById('phases-locked-msg');
  if (lockMsg) {
    lockMsg.innerHTML = '<span aria-hidden="true">\u2705</span><span>Enough items explored \u2014 you may now continue.</span>';
    lockMsg.style.color = '#6ee7b7';
  }
  var btn = document.getElementById('phases-continue-btn');
  if (btn) {
    btn.disabled           = false;
    btn.style.opacity      = '1';
    btn.style.cursor       = 'pointer';
    btn.setAttribute('aria-label', 'Continue to GMC and NICE Definitions');
    btn.focus();
  }
}


/* ══════════════════════════════════════════════════════════
   SECTION 5 — QUIZ
   Pass mark = 80% (matches adlcp:masteryscore in manifest)
══════════════════════════════════════════════════════════ */

var PASS_MARK = 80;

var quizData = [
  {
    question: 'Palliative care is only provided in the last days of life.',
    answer: false,
    feedbackCorrect:   '\u2705 Correct. Palliative care can begin at the point of diagnosis with a life-limiting illness and continues throughout the illness trajectory \u2014 it is not limited to the final days or weeks of life.',
    feedbackIncorrect: '\u274c Incorrect. Palliative care is not limited to the last days of life. It can begin at diagnosis and run alongside curative or life-prolonging treatment.'
  },
  {
    question: 'End of life care may begin when a person is thought to be in the last 12 months of life.',
    answer: true,
    feedbackCorrect:   '\u2705 Correct. According to NICE and GMC guidance, a person is \u201capproaching the end of life\u201d when they are likely to die within the next 12 months \u2014 this is the threshold for end of life care.',
    feedbackIncorrect: '\u274c Incorrect. NICE and GMC guidance defines \u201capproaching the end of life\u201d as when a person is likely to die within the next 12 months \u2014 this is when end of life care may begin.'
  },
  {
    question: 'Using the term \u201cpalliative care\u201d too late can limit access to symptom control and support.',
    answer: true,
    feedbackCorrect:   '\u2705 Correct. Delayed use of palliative care terminology can mean patients miss vital symptom control, advance care planning, and psychological support that could have improved their quality of life.',
    feedbackIncorrect: '\u274c Incorrect. Late or avoided use of palliative care language is linked to delayed referrals, missed opportunities for symptom control, and reduced quality of life for patients and families.'
  },
  {
    question: 'Palliative care means stopping all active treatment.',
    answer: false,
    feedbackCorrect:   '\u2705 Correct. Palliative care can be \u2014 and often is \u2014 provided alongside curative or life-prolonging treatment. It focuses on quality of life, not on withholding treatment.',
    feedbackIncorrect: '\u274c Incorrect. Palliative care does not mean stopping active treatment. It can run alongside chemotherapy, radiotherapy, or other treatments, focusing on comfort and quality of life.'
  },
  {
    question: 'Clear and compassionate language can improve patient understanding and decision-making.',
    answer: true,
    feedbackCorrect:   '\u2705 Correct. Person-centred communication that is honest, clear, and compassionate supports patients in making informed decisions about their care and helps reduce fear and uncertainty.',
    feedbackIncorrect: '\u274c Incorrect. Research and guidance consistently show that clear, compassionate communication improves patient understanding, supports informed decision-making, and reduces distress.'
  }
];

var currentQuestion = 0;
var quizAnswers     = [];
var quizScore       = null; // set when results are shown; guards beforeunload logic

function renderQuiz() {
  quizAnswers = quizData.map(function () { return { answered: false, correct: false }; });
  quizScore   = null;

  var dotsContainer = document.getElementById('quiz-dots');
  if (dotsContainer) {
    dotsContainer.innerHTML = quizData.map(function (_, i) {
      return '<div class="quiz-dot" id="qdot-' + i + '" aria-hidden="true"></div>';
    }).join('');
  }

  var container = document.getElementById('quiz-questions-container');
  if (!container) { return; }

  container.innerHTML = quizData.map(function (q, i) {
    return (
      '<div class="quiz-question-card' + (i === 0 ? ' active' : '') + '" id="qcard-' + i + '">' +
        '<div class="quiz-q-num">Question ' + (i + 1) + ' of ' + quizData.length + '</div>' +
        '<p class="quiz-q-text">' + q.question + '</p>' +
        '<div class="quiz-tf-btns">' +
          '<button class="quiz-tf-btn" id="qtrue-'  + i + '" onclick="answerQuiz(' + i + ', true)"  aria-label="True">\u2713 True</button>' +
          '<button class="quiz-tf-btn" id="qfalse-' + i + '" onclick="answerQuiz(' + i + ', false)" aria-label="False">\u2717 False</button>' +
        '</div>' +
        '<div class="quiz-feedback" id="qfeedback-' + i + '" role="alert" aria-live="polite"></div>' +
        '<div class="quiz-nav-row" id="qnav-' + i + '" style="display:none;">' +
          (i > 0
            ? '<button class="btn btn-secondary" onclick="showQuestion(' + (i - 1) + ')" style="font-size:0.82rem;padding:10px 18px;">\u2190 Back</button>'
            : '<span></span>') +
          (i < quizData.length - 1
            ? '<button class="btn btn-primary" onclick="showQuestion(' + (i + 1) + ')">Next Question \u2192</button>'
            : '<button class="btn btn-primary" onclick="showResults()">See Results \u2192</button>') +
        '</div>' +
      '</div>'
    );
  }).join('');
}

function answerQuiz(index, userAnswer) {
  if (quizAnswers[index].answered) { return; }

  var q       = quizData[index];
  var correct = (userAnswer === q.answer);

  quizAnswers[index].answered = true;
  quizAnswers[index].correct  = correct;

  var trueBtn  = document.getElementById('qtrue-'  + index);
  var falseBtn = document.getElementById('qfalse-' + index);
  if (trueBtn)  { trueBtn.disabled  = true; }
  if (falseBtn) { falseBtn.disabled = true; }

  if (userAnswer === true) {
    if (trueBtn)              { trueBtn.classList.add(correct  ? 'correct-glow' : 'wrong-glow'); }
    if (!correct && falseBtn) { falseBtn.classList.add('correct-glow'); }
  } else {
    if (falseBtn)            { falseBtn.classList.add(correct ? 'correct-glow' : 'wrong-glow'); }
    if (!correct && trueBtn) { trueBtn.classList.add('correct-glow'); }
  }

  var fb = document.getElementById('qfeedback-' + index);
  if (fb) {
    fb.className = 'quiz-feedback show ' + (correct ? 'correct' : 'incorrect');
    fb.innerHTML =
      '<span class="quiz-feedback-badge">' + (correct ? '\u2705 Correct' : '\u274c Incorrect') + '</span>' +
      '<p>' + (correct ? q.feedbackCorrect : q.feedbackIncorrect) + '</p>';
  }

  var dot = document.getElementById('qdot-' + index);
  if (dot) { dot.classList.add(correct ? 'correct' : 'incorrect'); }

  var nav = document.getElementById('qnav-' + index);
  if (nav) { nav.style.display = 'flex'; }
}

function showQuestion(index) {
  document.querySelectorAll('.quiz-question-card').forEach(function (c) {
    c.classList.remove('active');
  });
  var card = document.getElementById('qcard-' + index);
  if (card) { card.classList.add('active'); currentQuestion = index; }
  var progressText = document.getElementById('quiz-progress-text');
  if (progressText) { progressText.textContent = 'Question ' + (index + 1) + ' of ' + quizData.length; }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showResults() {
  document.querySelectorAll('.quiz-question-card').forEach(function (c) {
    c.classList.remove('active');
  });

  var correctCount   = quizAnswers.filter(function (a) { return a.correct;  }).length;
  var incorrectCount = quizAnswers.filter(function (a) { return !a.correct; }).length;
  var pct            = Math.round((correctCount / quizData.length) * 100);
  var passed         = pct >= PASS_MARK;
  quizScore          = pct; // flags beforeunload not to double-call finish()

  var icon, message;
  if (pct === 100) {
    icon    = '\uD83C\uDF1F';
    message = 'Outstanding! You answered every question correctly. You have a strong understanding of palliative and end of life care terminology, definitions, and principles.';
  } else if (passed) {
    icon    = '\u2705';
    message = 'Well done \u2014 you answered ' + correctCount + ' out of ' + quizData.length + ' correctly and have passed this module (' + PASS_MARK + '% required). Review any questions you found challenging.';
  } else if (pct >= 60) {
    icon    = '\uD83D\uDCDA';
    message = 'You answered ' + correctCount + ' out of ' + quizData.length + ' correctly (' + pct + '%). The pass mark is ' + PASS_MARK + '%. Please review the GMC &amp; NICE Definitions and What is Palliative Care? sections, then retry the quiz.';
  } else {
    icon    = '\uD83D\uDD04';
    message = 'You answered ' + correctCount + ' out of ' + quizData.length + ' correctly (' + pct + '%). The pass mark is ' + PASS_MARK + '%. We recommend working through the full module again before retrying.';
  }

  var results = document.getElementById('quiz-results');
  if (!results) { return; }

  results.innerHTML =
    '<div class="quiz-results-icon" aria-hidden="true">' + icon + '</div>' +
    '<div class="quiz-results-score">' + pct + '%</div>' +
    '<div class="quiz-results-label">' + (passed ? 'Module Passed \u2014 Well done!' : 'Module not yet passed') + '</div>' +
    '<div class="quiz-results-breakdown" role="list">' +
      '<div class="quiz-result-stat" role="listitem"><div class="quiz-result-stat-num stat-correct">'   + correctCount   + '</div><div class="quiz-result-stat-lbl">Correct</div></div>' +
      '<div class="quiz-result-stat" role="listitem"><div class="quiz-result-stat-num stat-incorrect">' + incorrectCount + '</div><div class="quiz-result-stat-lbl">Incorrect</div></div>' +
      '<div class="quiz-result-stat" role="listitem"><div class="quiz-result-stat-num" style="color:var(--yellow);">' + quizData.length + '</div><div class="quiz-result-stat-lbl">Total</div></div>' +
    '</div>' +
    '<div class="quiz-results-msg">' + message + '</div>' +
    '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">' +
      '<button class="btn btn-secondary" onclick="retryQuiz()"  aria-label="Retry the quiz">\uD83D\uDD04 Retry Quiz</button>' +
      '<button class="btn btn-primary"   onclick="goToPage(1)"  aria-label="Return to start">\u21A9 Back to Start</button>' +
    '</div>';

  results.classList.add('show');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // ── SCORM: report final score and pass/fail status ─────
  SCORM.finish(passed ? 'passed' : 'failed', pct);
}

function retryQuiz() {
  var results = document.getElementById('quiz-results');
  if (results) { results.classList.remove('show'); }
  currentQuestion = 0;
  renderQuiz();
  showQuestion(0);

  // SCORM: revert to incomplete so the learner can earn a pass on retry
  if (SCORM.isInitialized()) {
    SCORM.setValue('cmi.core.lesson_status', 'incomplete');
    SCORM.commit();
  }
}


/* ══════════════════════════════════════════════════════════
   SECTION 6 — AKPS SLIDER (Page 9)
══════════════════════════════════════════════════════════ */

var AKPS_SCORES = [10,20,30,40,50,60,70,80,90,100];

var AKPS_DATA = {
  10:  { label:'Moribund',                sublabel:'Fatal processes progressing rapidly',                           cls:'pink',   icon:'🔴', title:'Moribund',                 body:'Patient is actively dying. All Five Priorities of Care should be implemented immediately. Bob presenting as conversational at this score would be highly inconsistent.' },
  20:  { label:'Very sick',               sublabel:'Active supportive treatment necessary',                        cls:'red',    icon:'🔴', title:'End of life — hours/days',  body:'Likely in the final weeks of life. Syringe driver and comfort care should be actively in place. Inconsistent with Bob walking to the door unassisted.' },
  30:  { label:'Severely disabled',       sublabel:'Hospitalisation indicated, death not imminent',               cls:'red',    icon:'🔴', title:'Severely disabled',         body:'AKPS ≤30 is associated with a prognosis of weeks, not months. All anticipatory decisions should be documented and shared with the wider team.' },
  40:  { label:'Disabled',                sublabel:'Requires special care and assistance',                        cls:'red',    icon:'🔴', title:'Significant decline',       body:'High care needs. Review syringe driver requirements and ensure the out-of-hours team are briefed. Proactive family communication is essential.' },
  50:  { label:'Considerable assistance', sublabel:'Requires frequent medical care',                              cls:'orange', icon:'⚠️', title:'Key clinical threshold',    body:'⚠️ AKPS ≤50 is a key threshold — consider specialist palliative care referral. Bob\'s self-report of "fine" is clinically inconsistent with this level of need.' },
  60:  { label:'Occasional assistance',   sublabel:'Able to care for most personal needs',                       cls:'orange', icon:'⚠️', title:'Increasing dependency',     body:'Bob requires occasional help. Review medications and anticipatory care plan. His "plodding along" phrasing may be masking this level of dependency.' },
  70:  { label:'Limited self-care',       sublabel:'Cares for self; unable to carry on normal activity or work', cls:'amber',  icon:'⚠️', title:'Functional decline present', body:'At AKPS 70, Bob is managing self-care but unable to sustain normal activity. His score is <strong>inconsistent with saying he is "fine"</strong> — this warrants probing.' },
  80:  { label:'Self-caring with effort', sublabel:'Some signs or symptoms of disease present',                  cls:'amber',  icon:'💛', title:'Mild-moderate decline',     body:'Managing independently but with effort. Consider initiating advance care planning and reviewing support needs at this visit.' },
  90:  { label:'Minor limitations',       sublabel:'Normal activity with effort, some symptoms',                 cls:'green',  icon:'✅', title:'Minor limitations',         body:'Minor symptoms present. Ensure routine symptom review continues and begin documenting preferences and goals of care.' },
  100: { label:'Fully active',            sublabel:'No complaints, no evidence of disease',                      cls:'green',  icon:'✅', title:'Fully active',              body:'No functional impairment. This score would be inconsistent with Bob\'s known diagnoses and recent hospitalisation three weeks ago.' }
};

window.akpsConfirmedScore = null;
window.akpsConfirmedLabel = null;
window.akpsConfirmedCls   = null;
window.akpsConfirmedSub   = null;

function updateAKPSSlider(val) {
  var score = AKPS_SCORES[val - 1];
  var d = AKPS_DATA[score];
  if (!d) { return; }
  var numEl = document.getElementById('akps-num');
  var lblEl = document.getElementById('akps-label');
  var subEl = document.getElementById('akps-sublabel');
  if (numEl) { numEl.textContent = score; }
  if (lblEl) { lblEl.textContent = d.label; }
  if (subEl) { subEl.textContent = d.sublabel; }
  var interp = document.getElementById('akps-interp');
  if (interp) { interp.className = 'akps-interpretation ' + d.cls; }
  var iconEl  = document.getElementById('akps-interp-icon');
  var titleEl = document.getElementById('akps-interp-title-text');
  var bodyEl  = document.getElementById('akps-interp-body');
  if (iconEl)  { iconEl.textContent  = d.icon; }
  if (titleEl) { titleEl.textContent = d.title; }
  if (bodyEl)  { bodyEl.innerHTML    = d.body; }
  /* Reset confirm state if slider moved after confirming */
  if (window.akpsConfirmedScore !== null && score !== window.akpsConfirmedScore) {
    var btn  = document.getElementById('akps-confirm-btn');
    var note = document.getElementById('akps-confirmed-note');
    if (btn)  { btn.classList.remove('confirmed'); btn.textContent = '✓ Confirm this score & save to Learning Record'; }
    if (note) { note.classList.remove('show'); }
    window.akpsConfirmedScore = null;
    checkPage9Gate();
  }
}

function confirmAKPSScore() {
  var slider = document.getElementById('akps-slider');
  if (!slider) { return; }
  var score = AKPS_SCORES[slider.value - 1];
  var d = AKPS_DATA[score];
  window.akpsConfirmedScore = score;
  window.akpsConfirmedLabel = d.label;
  window.akpsConfirmedCls   = d.cls;
  window.akpsConfirmedSub   = d.sublabel;
  var btn  = document.getElementById('akps-confirm-btn');
  var note = document.getElementById('akps-confirmed-note');
  if (btn)  { btn.classList.add('confirmed'); btn.textContent = '✓ Score ' + score + ' confirmed'; }
  if (note) { note.classList.add('show'); }
}

/* ── Activity save (shows ✓ Response saved indicator) ── */
function saveActivity9() {
  var note = document.getElementById('bob3-q1-saved-note');
  if (!note) { return; }
  note.style.display = 'inline';
  clearTimeout(saveActivity9._timer);
  saveActivity9._timer = setTimeout(function () {
    note.style.display = 'none';
  }, 2500);
}

/* ── Gate: AKPS confirmed AND activity has text ── */
function checkPage9Gate() {
  var akpsOk = window.akpsConfirmedScore !== null;
  var q1     = document.getElementById('bob3-q1-input');
  var q1Ok   = q1 && q1.value.trim().length > 0;
  var btn    = document.getElementById('page9-continue-btn');
  var nudge  = document.getElementById('page9-gate-nudge');
  if (!btn) { return; }
  var pass = akpsOk && q1Ok;
  btn.disabled      = !pass;
  btn.style.opacity = pass ? '1' : '.4';
  btn.style.cursor  = pass ? 'pointer' : 'not-allowed';
  if (nudge) { nudge.style.display = pass ? 'none' : 'block'; }
}


/* ══════════════════════════════════════════════════════════
   SECTION 7 — INIT & GLOBAL EVENTS
══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  // Open SCORM connection to EQUAL Online
  SCORM.initialize();

  // Page 9 — AKPS slider init
  var akpsSlider = document.getElementById('akps-slider');
  if (akpsSlider) { updateAKPSSlider(akpsSlider.value); }

  // Page 9 — gate listener on textarea
  var bob3q1 = document.getElementById('bob3-q1-input');
  if (bob3q1) { bob3q1.addEventListener('input', checkPage9Gate); }
  checkPage9Gate();

  // UI init
  updateProgressBar(1);
  renderQuiz();

  // Close modals on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
    backdrop.addEventListener('click', function (e) {
      if (e.target !== backdrop) { return; }
      if (backdrop.id === 'phase-modal')        { closePhaseModal(); }
      if (backdrop.id === 'model-answer-modal') { closeModelAnswerModal(); }
    });
  });

  // Close modals on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') { return; }
    if (document.getElementById('phase-modal')?.classList.contains('open'))        { closePhaseModal(); }
    if (document.getElementById('model-answer-modal')?.classList.contains('open')) { closeModelAnswerModal(); }
  });

  // Safety net: always call LMSFinish when the learner closes/navigates away.
  // If the quiz has already been completed, SCORM.finish() is a no-op (guarded
  // by the _finished flag), so no data will be overwritten.
  window.addEventListener('beforeunload', function () {
    if (SCORM.isInitialized()) {
      if (quizScore === null) {
        // Learner left before completing the quiz
        SCORM.finish('incomplete', null);
      } else {
        // Quiz was completed — finish() was already called in showResults().
        // Call again harmlessly; the wrapper's _finished guard prevents double-reporting.
        SCORM.finish(null, null);
      }
    }
  });

});
