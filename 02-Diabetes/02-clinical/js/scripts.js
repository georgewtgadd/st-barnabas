/* ══════════════════════════════════════════════════════════
   ST BARNABAS HOSPICE — EoL Clinical Management
   js/scripts.js  ·  Module 3
══════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════
   SCORM 1.2 WRAPPER
══════════════════════════════════════════════ */
var SCORM = (function () {
  var _api = null, _initialized = false, _finished = false, _start = Date.now();
  function _find(w) { var n=0; while (!w.API && w.parent && w.parent !== w) { if(++n>7) return null; w=w.parent; } return w.API||null; }
  function _get()   { var a=_find(window); if(!a&&window.opener&&window.opener!==window) a=_find(window.opener); return a; }
  function initialize() {
    if (_initialized||_finished) return false;
    _api=_get(); if(!_api){console.info('[SCORM] standalone'); return false;}
    if (_api.LMSInitialize('')==='true'||_api.LMSInitialize('')===true) {
      _initialized=true; _start=Date.now();
      setValue('cmi.core.lesson_status','incomplete');
      setValue('cmi.core.score.min','0'); setValue('cmi.core.score.max','100');
      commit(); return true;
    }
    return false;
  }
  function setValue(el,val) { if(!_initialized||_finished||!_api) return false; return _api.LMSSetValue(el,String(val))==='true'; }
  function getValue(el)     { return (!_initialized||_finished||!_api)?'':_api.LMSGetValue(el); }
  function commit()         { if(!_initialized||_finished||!_api) return false; return _api.LMSCommit('')==='true'; }
  function _fmt(ms) { var t=Math.floor(ms/1000),h=Math.floor(t/3600),m=Math.floor((t%3600)/60),s=t%60; return (h<10?'0':'')+h+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s; }
  function finish(status, score) {
    if (_finished||!_initialized||!_api) return false;
    setValue('cmi.core.session_time',_fmt(Date.now()-_start));
    if (status!=null) setValue('cmi.core.lesson_status',status);
    if (score!=null)  setValue('cmi.core.score.raw',String(Math.round(score)));
    commit(); _api.LMSFinish(''); _finished=true; return true;
  }
  function saveBookmark(n) { setValue('cmi.core.lesson_location',String(n)); setValue('cmi.suspend_data',JSON.stringify({page:n})); commit(); }
  function getBookmark()   { try{var d=JSON.parse(getValue('cmi.suspend_data'));return d.page||1;}catch(e){} var l=parseInt(getValue('cmi.core.lesson_location'),10); return isNaN(l)?1:l; }
  return { initialize, setValue, getValue, commit, finish, saveBookmark, getBookmark, isInitialized:()=>_initialized };
}());

/* ══════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════ */
var currentPage = 1;
const TOTAL_PAGES = 11;
var visited = new Set([1]);

function goToPage(n) {
  if (n < 1 || n > TOTAL_PAGES) return;
  visited.add(n);
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  var page = document.getElementById('page-' + n);
  if (page) page.classList.add('active');
  for (var i = 1; i <= TOTAL_PAGES; i++) {
    var step = document.getElementById('nav-' + i);
    if (!step) continue;
    step.classList.remove('current', 'done');
    step.removeAttribute('aria-current');
    if (i === n)         { step.classList.add('current'); step.setAttribute('aria-current','step'); step.disabled = false; }
    else if (visited.has(i)) { step.classList.add('done'); step.disabled = false; }
    else                 { step.disabled = true; }
  }
  updateProgressBar(n);
  currentPage = n;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  var h = page && page.querySelector('h1, h2');
  if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
  SCORM.saveBookmark(n);
  if (SCORM.isInitialized()) {
    var cur = SCORM.getValue('cmi.core.lesson_status');
    if (cur !== 'passed' && cur !== 'failed') { SCORM.setValue('cmi.core.lesson_status','incomplete'); SCORM.commit(); }
  }
  // Populate learning record when reached
  if (n === 11) populateLearningRecord();
}

function navClick(n) { if (visited.has(n)) goToPage(n); }

function updateProgressBar(n) {
  var pct  = Math.round(((n - 1) / (TOTAL_PAGES - 1)) * 100);
  var fill = document.getElementById('progress-fill');
  var lbl  = document.getElementById('progress-label');
  if (fill) { fill.style.width = pct + '%'; fill.closest('[role="progressbar"]').setAttribute('aria-valuenow', pct); }
  if (lbl)  lbl.textContent = pct + '% complete';
}

/* ══════════════════════════════════════════════
   INTERACTIVE 1 — MED RISK MATCHER (Page 5)
   Drag medications to risk categories
══════════════════════════════════════════════ */
var matcherAnswers   = {}; // chipId → zoneId
var matcherComplete  = false;
var matcherScore     = null; // {correct, total}

const MATCHER_CHIPS = [
  { id: 'mc-sulph', text: 'Sulphonylurea',       correct: 'zone-hypo' },
  { id: 'mc-sglt2', text: 'SGLT2 Inhibitor',     correct: 'zone-dka'  },
  { id: 'mc-metf',  text: 'Metformin',            correct: 'zone-renal'},
  { id: 'mc-stat',  text: 'Statin',               correct: 'zone-nob'  },
  { id: 'mc-aht',   text: 'Antihypertensive',     correct: 'zone-nob'  },
];

function initMatcher() {
  renderMatcherChips();
  setupDropZones('matcher');
}

function renderMatcherChips() {
  var bank = document.getElementById('matcher-bank');
  if (!bank) return;
  bank.innerHTML = MATCHER_CHIPS.map(c =>
    `<div class="drag-chip" id="${c.id}" draggable="true"
          tabindex="0" role="button"
          aria-label="Drag ${c.text} to a category"
          ondragstart="onDragStart(event,'${c.id}','matcher')"
          onclick="onChipClick(event,'${c.id}','matcher')"
          onkeydown="if(event.key==='Enter')onChipClick(event,'${c.id}','matcher')">${c.text}</div>`
  ).join('');
}

/* ══════════════════════════════════════════════
   INTERACTIVE 2 — RATIONALISATION (Page 6)
   Drag meds to Stop/Continue
══════════════════════════════════════════════ */
var rationAnswers   = {};
var rationComplete  = false;
var rationScore     = null;

const RATION_CHIPS = [
  { id: 'rc-metf',    text: 'Metformin',        correct: 'stop'     },
  { id: 'rc-stat',    text: 'Statin',            correct: 'stop'     },
  { id: 'rc-aht',     text: 'Antihypertensive',  correct: 'stop'     },
  { id: 'rc-sulph',   text: 'Sulphonylurea',     correct: 'stop'     },
  { id: 'rc-basins',  text: 'Basal Insulin',     correct: 'continue' },
];

function initRation() {
  renderRationChips();
  setupDropZones('ration');
}

function renderRationChips() {
  var bank = document.getElementById('ration-bank');
  if (!bank) return;
  bank.innerHTML = RATION_CHIPS.map(c =>
    `<div class="drag-chip" id="${c.id}" draggable="true"
          tabindex="0" role="button"
          aria-label="Drag ${c.text}"
          ondragstart="onDragStart(event,'${c.id}','ration')"
          onclick="onChipClick(event,'${c.id}','ration')"
          onkeydown="if(event.key==='Enter')onChipClick(event,'${c.id}','ration')">${c.text}</div>`
  ).join('');
}

/* ── SHARED DRAG & DROP ENGINE ───────────────────────── */
var _dragging = null;
var _dragContext = null;

function onDragStart(evt, chipId, context) {
  _dragging = chipId;
  _dragContext = context;
  evt.dataTransfer.setData('text/plain', chipId);
  document.getElementById(chipId).classList.add('dragging');
}

function setupDropZones(context) {
  var zones = document.querySelectorAll('[data-context="' + context + '"]');
  zones.forEach(function(zone) {
    zone.addEventListener('dragover', function(e) { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', function()  { zone.classList.remove('drag-over'); });
    zone.addEventListener('drop',      function(e) {
      e.preventDefault(); zone.classList.remove('drag-over');
      var chipId = e.dataTransfer.getData('text/plain') || _dragging;
      placeChip(chipId, zone.id, context);
    });
  });
}

function placeChip(chipId, zoneId, context) {
  if (!chipId) return;
  var chip = document.getElementById(chipId);
  if (!chip) return;
  // Remove from previous zone if already placed
  var existing = document.getElementById('placed-' + chipId);
  if (existing) existing.remove();
  // Return to previous zone tracking
  if (context === 'matcher')  delete matcherAnswers[chipId];
  if (context === 'ration')   delete rationAnswers[chipId];
  // Hide chip in bank
  chip.style.display = 'none';
  // Create placed clone
  var clone = document.createElement('div');
  clone.className = 'drag-chip';
  clone.id = 'placed-' + chipId;
  clone.textContent = chip.textContent;
  clone.style.cursor = 'pointer';
  clone.title = 'Click to return to bank';
  clone.onclick = function() { returnChipToBank(chipId, context); };
  var zoneChips = document.getElementById(zoneId + '-chips');
  if (!zoneChips) zoneChips = document.getElementById(zoneId).querySelector('.drop-zone-chips');
  if (zoneChips) {
    // Remove placeholder if present
    var ph = zoneChips.querySelector('.drop-placeholder');
    if (ph) ph.style.display = 'none';
    zoneChips.appendChild(clone);
  }
  if (context === 'matcher')  matcherAnswers[chipId]  = zoneId;
  if (context === 'ration')   rationAnswers[chipId]   = zoneId;
  _dragging = null; _dragContext = null;
  updateCheckBtn(context);
}

function returnChipToBank(chipId, context) {
  var chip = document.getElementById(chipId);
  if (!chip) return;
  var placed = document.getElementById('placed-' + chipId);
  if (placed) placed.remove();
  chip.style.display = '';
  chip.classList.remove('dragging', 'placed-correct', 'placed-wrong');
  if (context === 'matcher')  delete matcherAnswers[chipId];
  if (context === 'ration')   delete rationAnswers[chipId];
  updateCheckBtn(context);
}

function onChipClick(evt, chipId, context) {
  // Keyboard / tap fallback — show a prompt to choose a zone
  // Only trigger on keyboard (not drag)
  if (evt.type !== 'click' || evt.detail > 0) return; // ignore real clicks (drag handles them)
  // For real click: small contextual menu
}

function updateCheckBtn(context) {
  var ids = context === 'matcher' ? MATCHER_CHIPS.map(c=>c.id) : RATION_CHIPS.map(c=>c.id);
  var placed = context === 'matcher' ? matcherAnswers : rationAnswers;
  var allPlaced = ids.every(id => placed[id]);
  var btn = document.getElementById(context + '-check-btn');
  if (btn) btn.disabled = !allPlaced;
}

function checkMatcher() {
  var correct = 0;
  MATCHER_CHIPS.forEach(function(c) {
    var placed = document.getElementById('placed-' + c.id);
    if (!placed) return;
    var zoneId = matcherAnswers[c.id];
    if (zoneId === c.correct) { placed.classList.add('placed-correct'); correct++; }
    else                      { placed.classList.add('placed-wrong'); }
  });
  matcherScore = { correct: correct, total: MATCHER_CHIPS.length };
  matcherComplete = true;
  var pct = Math.round((correct / MATCHER_CHIPS.length) * 100);
  var fb = document.getElementById('matcher-feedback');
  if (fb) {
    fb.className = 'drag-feedback show ' + (correct === MATCHER_CHIPS.length ? 'correct' : correct >= 3 ? 'partial' : 'incorrect');
    fb.innerHTML = (correct === MATCHER_CHIPS.length)
      ? '✅ <strong>Perfect!</strong> You matched all ' + MATCHER_CHIPS.length + ' medications correctly. Each drug carries a distinct risk at end of life.'
      : '⚠️ You placed ' + correct + ' of ' + MATCHER_CHIPS.length + ' correctly (' + pct + '%). Review the highlighted errors — the correct categories remain. Reset to try again.';
  }
  var btn = document.getElementById('matcher-check-btn');
  if (btn) btn.disabled = true;
  // Unlock continue
  var contBtn = document.getElementById('matcher-continue-btn');
  if (contBtn) { contBtn.disabled = false; contBtn.style.opacity = '1'; contBtn.style.cursor = 'pointer'; }
}

function resetMatcher() {
  matcherAnswers = {}; matcherComplete = false; matcherScore = null;
  MATCHER_CHIPS.forEach(function(c) {
    var placed = document.getElementById('placed-' + c.id);
    if (placed) placed.remove();
    var chip = document.getElementById(c.id);
    if (chip) { chip.style.display = ''; chip.classList.remove('placed-correct','placed-wrong','dragging'); }
  });
  var fb = document.getElementById('matcher-feedback');
  if (fb) fb.className = 'drag-feedback';
  var btn = document.getElementById('matcher-check-btn');
  if (btn) btn.disabled = true;
}

function checkRation() {
  var correct = 0;
  RATION_CHIPS.forEach(function(c) {
    var placed = document.getElementById('placed-' + c.id);
    if (!placed) return;
    var zoneId = rationAnswers[c.id];
    var actualZone = zoneId === 'ration-stop' ? 'stop' : 'continue';
    if (actualZone === c.correct) { placed.classList.add('placed-correct'); correct++; }
    else                          { placed.classList.add('placed-wrong'); }
  });
  rationScore = { correct: correct, total: RATION_CHIPS.length };
  rationComplete = true;
  var fb = document.getElementById('ration-feedback');
  if (fb) {
    fb.className = 'drag-feedback show ' + (correct === RATION_CHIPS.length ? 'correct' : correct >= 3 ? 'partial' : 'incorrect');
    fb.innerHTML = (correct === RATION_CHIPS.length)
      ? '✅ <strong>Correct!</strong> All medications correctly rationalised. In a dying patient with no oral intake, stopping all non-essential drugs reduces the pill burden and respects the principle of comfort-focused care. Basal insulin is continued in Type 1.'
      : '⚠️ You placed ' + correct + ' of ' + RATION_CHIPS.length + ' correctly. Note: in the terminal phase, most medications should be stopped. Only insulin (Type 1) should continue to prevent DKA.';
  }
  var btn = document.getElementById('ration-check-btn');
  if (btn) btn.disabled = true;
  var contBtn = document.getElementById('ration-continue-btn');
  if (contBtn) { contBtn.disabled = false; contBtn.style.opacity = '1'; contBtn.style.cursor = 'pointer'; }
}

function resetRation() {
  rationAnswers = {}; rationComplete = false; rationScore = null;
  RATION_CHIPS.forEach(function(c) {
    var placed = document.getElementById('placed-' + c.id);
    if (placed) placed.remove();
    var chip = document.getElementById(c.id);
    if (chip) { chip.style.display = ''; chip.classList.remove('placed-correct','placed-wrong','dragging'); }
  });
  var fb = document.getElementById('ration-feedback');
  if (fb) fb.className = 'drag-feedback';
  var btn = document.getElementById('ration-check-btn');
  if (btn) btn.disabled = true;
}

/* ══════════════════════════════════════════════
   INTERACTIVE 3 — HYPO SCENARIOS (Page 7)
   Sequential reveal — one scenario at a time
══════════════════════════════════════════════ */
const HYPO_SCENARIOS = [
  {
    id: 'hs1', num: '1',
    title: 'Mrs Ahmed — Type 2, Sulphonylurea',
    setup: 'Mrs Ahmed is 78, Type 2 on a Sulphonylurea, found drowsy in her chair. Blood glucose: 2.8 mmol/L. She is still conscious and can respond to simple commands. Her swallowing reflex appears intact.',
    question: 'What is your immediate next step?',
    options: [
      { text: 'Give 150–200ml of fruit juice or Lucozade orally', correct: true,  fb: 'Correct. She is conscious with an intact swallow — oral fast-acting glucose is safe, effective, and first-line. Retest in 15 minutes and contact the prescriber to stop or reduce the sulphonylurea.' },
      { text: 'Administer Glucagon IM — she is too drowsy to drink safely', correct: false, fb: 'Not yet. Glucagon is reserved for patients who cannot swallow safely or are unconscious. Mrs Ahmed is conscious and can swallow — try oral glucose first.' },
      { text: 'Call 999 for IV glucose as blood glucose is below 3.0', correct: false, fb: 'Not at this stage. IV glucose is for patients who cannot receive oral or IM treatment. Mrs Ahmed can swallow — start with oral glucose immediately.' },
    ]
  },
  {
    id: 'hs2', num: '2',
    title: 'Mr Patel — Type 1, Last Days of Life',
    setup: 'Mr Patel is 82, Type 1 Diabetes, in the last days of life. He is unresponsive and cannot swallow. Blood glucose: 2.1 mmol/L. His Advance Care Plan states he wishes to remain at home with no hospital transfer.',
    question: 'Which management approach is most appropriate?',
    options: [
      { text: 'Call 999 for IV 10% glucose — hypoglycaemia must be corrected', correct: false, fb: 'His Advance Care Plan clearly states no hospital transfer. Calling 999 would override his documented wishes. Clinical need must be balanced with patient autonomy.' },
      { text: 'Attempt to give oral glucose by placing a sugary drink between his lips', correct: false, fb: 'Never attempt to give anything by mouth to an unconscious patient — aspiration risk is life-threatening. This must not be used when a patient cannot swallow safely.' },
      { text: 'Consider Glucagon IM/SC if in keeping with the care plan, and discuss with the palliative team', correct: true,  fb: 'Correct. For an unresponsive patient at home, Glucagon IM or SC is appropriate — no IV access needed. This must align with his ACP, and the palliative team should review the overall insulin regimen.' },
    ]
  },
  {
    id: 'hs3', num: '3',
    title: 'Mrs Clarke — Type 1, No Glucose Monitor',
    setup: 'Mrs Clarke, 69, Type 1. She has been eating very little for three days — only sips of water. She is alert but pale and trembling. No blood glucose monitor is available. She has been taking her usual insulin dose.',
    question: 'How should this be managed?',
    options: [
      { text: 'Wait until a glucose monitor is available before treating', correct: false, fb: 'With classic symptoms (tremor, pallor, minimal intake with unchanged insulin), waiting risks rapid deterioration. Clinical suspicion alone is sufficient to treat.' },
      { text: 'Treat presumptively with oral glucose and arrange urgent medication review', correct: true,  fb: 'Correct. The clinical picture — tremors, pallor, minimal intake, unchanged insulin — strongly suggests hypoglycaemia. Treat presumptively then arrange urgent dose review. Her basal should be reduced by at least 20–30%.' },
      { text: 'Reduce insulin dose only — do not give glucose without a confirmed reading', correct: false, fb: 'Reducing insulin is the right medium-term action, but her immediate symptoms need treating now. A patient with tremors who has not eaten in three days should receive glucose immediately.' },
    ]
  }
];

var hypoAnswered = {}; // scId → optIdx

function initHypoScenarios() {
  // Show only scenario 1 initially
  var sc1 = document.getElementById('hscenario-hs1');
  if (sc1) sc1.classList.add('visible');
}

function answerHypo(scId, optIdx) {
  if (hypoAnswered[scId] !== undefined) return;
  hypoAnswered[scId] = optIdx;
  var sc = HYPO_SCENARIOS.find(s => s.id === scId);
  if (!sc) return;

  // Lock options and style
  sc.options.forEach(function(_, i) {
    var btn = document.getElementById('hopt-' + scId + '-' + i);
    if (!btn) return;
    btn.disabled = true;
    if (sc.options[i].correct)          btn.classList.add('correct');
    else if (i === optIdx && !sc.options[i].correct) btn.classList.add('incorrect');
  });

  // Show feedback
  var fb = document.getElementById('hfb-' + scId);
  if (fb) {
    var opt = sc.options[optIdx];
    fb.className = 'hypo-feedback show ' + (opt.correct ? 'correct' : 'incorrect');
    fb.innerHTML = '<span class="hypo-fb-icon">' + (opt.correct ? '✅' : '❌') + '</span><span>' + opt.feedback + '</span>';
  }

  // Reveal next scenario
  var allIds = HYPO_SCENARIOS.map(s => s.id);
  var idx = allIds.indexOf(scId);
  var nextId = allIds[idx + 1];
  if (nextId) {
    setTimeout(function() {
      var hint = document.getElementById('hnext-hint-' + scId);
      if (hint) hint.classList.add('show');
      setTimeout(function() {
        var nextEl = document.getElementById('hscenario-' + nextId);
        if (nextEl) {
          nextEl.classList.add('visible');
          nextEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        var hint2 = document.getElementById('hnext-hint-' + scId);
        if (hint2) hint2.classList.remove('show');
      }, 900);
    }, 600);
  } else {
    // All done
    setTimeout(function() {
      var allDone = document.getElementById('hypo-all-done');
      if (allDone) {
        allDone.classList.add('show');
        allDone.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      var contBtn = document.getElementById('hypo-continue-btn');
      if (contBtn) { contBtn.disabled = false; contBtn.style.opacity = '1'; contBtn.style.cursor = 'pointer'; }
    }, 600);
  }
}

function buildHypoScenarios() {
  var wrap = document.getElementById('hypo-scenarios-wrap');
  if (!wrap) return;
  wrap.innerHTML = HYPO_SCENARIOS.map(function(sc) {
    var opts = sc.options.map(function(opt, i) {
      return `<button class="hypo-option" id="hopt-${sc.id}-${i}"
                      onclick="answerHypo('${sc.id}',${i})"
                      aria-label="Option ${String.fromCharCode(65+i)}: ${opt.text}">
        <div class="hypo-opt-letter">${String.fromCharCode(65+i)}</div>
        <div>${opt.text}</div>
      </button>`;
    }).join('');
    return `
    <div class="hypo-scenario" id="hscenario-${sc.id}">
      <div class="hypo-scenario-header">
        <div class="hypo-scenario-num">${sc.num}</div>
        <div class="hypo-scenario-title">${sc.title}</div>
      </div>
      <div class="hypo-scenario-body">
        <div class="hypo-setup">${sc.setup}</div>
        <p class="hypo-question">${sc.question}</p>
        <div class="hypo-options">${opts}</div>
        <div class="hypo-feedback" id="hfb-${sc.id}"></div>
        <div class="hypo-next-hint" id="hnext-hint-${sc.id}">⬇ Next scenario unlocking…</div>
      </div>
    </div>`;
  }).join('');
}

/* ══════════════════════════════════════════════
   INTERACTIVE 4 — DOSE SIMULATOR (Page 9)
══════════════════════════════════════════════ */
const INTAKE_LABELS = [
  'Nothing — nil by mouth',
  'Sips of water only',
  'Very little (bites and sips)',
  'Half meals',
  'Full meals (100%)'
];
const CONSCIOUS_LABELS = [
  'Unconscious / unresponsive',
  'Minimal response to voice',
  'Drowsy but rousable',
  'Fully alert and orientated'
];

const DOSE_MATRIX = [
  // intake=0 nothing
  [
    { basal:'Stop basal',    bolus:'Stop all bolus', level:'critical', note:'Patient is unconscious — insulin cannot be given safely. Seek urgent specialist advice. Consider whether ongoing insulin aligns with the care plan.', warn:'Do NOT give insulin to an unconscious patient without specialist guidance.' },
    { basal:'Reduce by 50%', bolus:'Stop all bolus', level:'danger',   note:'Minimal consciousness, nil intake. Substantial basal reduction needed to prevent hypoglycaemia. Urgent specialist review.', warn:'Extreme hypo risk.' },
    { basal:'Reduce by 40–50%', bolus:'Stop all bolus', level:'danger',   note:'Drowsy and eating nothing. No bolus insulin. Reduce basal substantially and retest 4–6 hourly.', warn:'' },
    { basal:'Reduce by 30–40%', bolus:'Stop all bolus', level:'amber',    note:'Alert but eating nothing. Stop all bolus. Reduce basal to minimum to prevent DKA. Review daily.', warn:'Do not stop basal entirely — DKA risk in Type 1.' },
  ],
  // intake=1 sips
  [
    { basal:'Stop basal',        bolus:'Stop all bolus', level:'critical', note:'Unconscious with occasional sips — insulin not safe to administer. Urgent specialist advice.', warn:'Never give insulin to an unconscious patient.' },
    { basal:'Reduce by 40%',     bolus:'Stop all bolus', level:'danger',   note:'Sips only, minimal responsiveness. Significant basal reduction. No bolus. Diabetology input needed.', warn:'' },
    { basal:'Reduce by 30–40%',  bolus:'Stop all bolus', level:'amber',    note:'Drowsy, sips only. Reduce basal to prevent hypo while preventing DKA. No bolus appropriate.', warn:'' },
    { basal:'Reduce by 20–30%',  bolus:'Stop all bolus', level:'amber',    note:'Alert but sips only — no carbohydrate to cover. Stop bolus. Reduce basal. Daily review.', warn:'' },
  ],
  // intake=2 very little
  [
    { basal:'Stop basal',        bolus:'Stop all bolus',            level:'critical', note:'Unconscious — insulin cannot safely be given.', warn:'' },
    { basal:'Reduce by 30%',     bolus:'0–2 units per meal only',   level:'danger',   note:'Very little intake, minimal consciousness. Major basal reduction. Minimal bolus only with meaningful food.', warn:'' },
    { basal:'Reduce by 20–30%',  bolus:'2–4 units per meal',        level:'amber',    note:'Drowsy, eating very little. Reduce basal meaningfully. Small bolus with actual food. Monitor closely.', warn:'' },
    { basal:'Reduce by 20%',     bolus:'Halve usual bolus',         level:'amber',    note:'Alert but eating very little. ~20% basal reduction. Halve bolus and only give with food.', warn:'' },
  ],
  // intake=3 half meals
  [
    { basal:'Stop basal',        bolus:'Stop all bolus',            level:'critical', note:'Unconscious — insulin cannot be given safely regardless of intake.', warn:'' },
    { basal:'Reduce by 20%',     bolus:'50% of usual dose',         level:'amber',    note:'Half meals but poorly responsive. Meaningful reduction. Monitor 4-hourly.', warn:'' },
    { basal:'Reduce by 10–20%',  bolus:'50–75% of usual dose',      level:'amber',    note:'Drowsy but half portions. Modest reductions aligned with actual intake.', warn:'' },
    { basal:'Reduce by 10%',     bolus:'70–80% of usual dose',      level:'safe',     note:'Alert and eating half meals. Modest reductions to reflect reduced carbohydrate. Review weekly.', warn:'' },
  ],
  // intake=4 full meals
  [
    { basal:'Stop basal',        bolus:'Stop all bolus', level:'critical', note:'Unconscious — insulin cannot be given safely.', warn:'' },
    { basal:'Reduce by 10%',     bolus:'Usual with caution', level:'amber', note:'Full meals but poorly responsive — unusual. Seek specialist input. Close monitoring.', warn:'' },
    { basal:'Slight reduction',  bolus:'Usual dose',       level:'safe',   note:'Drowsy but eating well. Continue with close monitoring.', warn:'' },
    { basal:'Usual dose',        bolus:'Usual dose',       level:'safe',   note:'Alert and eating fully. Maintain usual regimen with regular glucose review.', warn:'' },
  ]
];

function initDoseSim() { updateDoseSim(); }

function updateDoseSim() {
  var intakeSlider    = document.getElementById('intake-slider');
  var consciousSlider = document.getElementById('conscious-slider');
  if (!intakeSlider || !consciousSlider) return;
  var intake    = parseInt(intakeSlider.value);
  var conscious = parseInt(consciousSlider.value);
  var rec = DOSE_MATRIX[intake][conscious];

  var ivl = document.getElementById('intake-value-label');
  var cvl = document.getElementById('conscious-value-label');
  if (ivl) ivl.textContent = INTAKE_LABELS[intake];
  if (cvl) cvl.textContent = CONSCIOUS_LABELS[conscious];

  var colours = { critical:'#ef4444', danger:'#f97316', amber:'#fdca0f', safe:'#22c55e' };
  var bgCols   = { critical:'rgba(239,68,68,0.1)', danger:'rgba(249,115,22,0.1)', amber:'rgba(253,202,15,0.08)', safe:'rgba(34,197,94,0.08)' };
  var bdCols   = { critical:'rgba(239,68,68,0.4)', danger:'rgba(249,115,22,0.4)', amber:'rgba(253,202,15,0.3)', safe:'rgba(34,197,94,0.3)' };
  var labels   = { critical:'🔴 Critical — Specialist Required', danger:'🟠 High Risk — Urgent Review', amber:'🟡 Caution — Close Monitoring', safe:'🟢 Standard Adjustment' };

  var out = document.getElementById('dose-output');
  if (out) {
    out.innerHTML = `
    <div class="sim-output-inner" style="background:${bgCols[rec.level]};border:2px solid ${bdCols[rec.level]};border-radius:12px;padding:20px 22px;">
      <div style="font-size:0.68rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${colours[rec.level]};margin-bottom:14px;">${labels[rec.level]}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
        <div style="background:rgba(0,0,0,0.25);border-radius:10px;padding:14px 16px;">
          <div style="font-size:0.62rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--teal-light);margin-bottom:6px;">Basal Insulin</div>
          <div style="font-family:'Merriweather',serif;font-size:1rem;font-weight:700;color:var(--white);">${rec.basal}</div>
        </div>
        <div style="background:rgba(0,0,0,0.25);border-radius:10px;padding:14px 16px;">
          <div style="font-size:0.62rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--teal-light);margin-bottom:6px;">Bolus Insulin</div>
          <div style="font-family:'Merriweather',serif;font-size:1rem;font-weight:700;color:var(--white);">${rec.bolus}</div>
        </div>
      </div>
      <p style="font-size:0.86rem;color:var(--text-muted);line-height:1.7;">${rec.note}</p>
      ${rec.warn ? `<div style="margin-top:12px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:10px 14px;font-size:0.82rem;color:#fca5a5;font-weight:600;">⚠️ ${rec.warn}</div>` : ''}
    </div>`;
  }
}

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
    fb: { y: 'Correct. In Type 1, withdrawing insulin causes DKA — a distressing and preventable deterioration. Doses should be reduced as intake falls, but not stopped without specialist advice.', n: 'Not quite. The answer is <strong>No</strong>. Type 1 patients cannot produce any insulin. Stopping it causes DKA within hours. Basal must continue (dose-reduced) until the patient is unconscious and specialist input has been sought.' }
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
  // Dots
  var dots = document.getElementById('quiz-dots');
  if (dots) dots.innerHTML = QUIZ_DATA.map((_,i) => `<div class="mcq-dot" id="qdot-${i}"></div>`).join('');
  // Questions
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
  // Deselect all
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

  // Style options
  for (var i = 0; i < q.opts.length; i++) {
    var opt = document.getElementById('qopt-' + qi + '-' + i);
    if (!opt) continue;
    opt.classList.add('locked');
    opt.setAttribute('tabindex', '-1');
    if (i === q.correct) opt.classList.add('correct');
    if (i === oi && !correct) opt.classList.add('incorrect');
  }

  // Update dot
  var dot = document.getElementById('qdot-' + qi);
  if (dot) dot.className = 'mcq-dot ' + (correct ? 'correct' : 'incorrect');

  // Show feedback
  var fb = document.getElementById('qfb-' + qi);
  if (fb) {
    fb.className = 'mcq-feedback show ' + (correct ? 'correct' : 'incorrect');
    fb.innerHTML = '<span class="mcq-feedback-badge">' + (correct ? '✅ Correct' : '❌ Incorrect') + '</span>' + (correct ? q.fb.y : q.fb.n);
  }

  sub.disabled = true;

  // Show next or results button
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
  if (pct === 100) { icon = '🌟'; msg = 'Perfect score! You have an excellent grasp of diabetes management at end of life.'; }
  else if (passed) { icon = '✅'; msg = 'Well done — you scored ' + correct + ' out of ' + QUIZ_DATA.length + '. Review any questions you found challenging before moving on.'; }
  else             { icon = '📚'; msg = 'You scored ' + correct + ' out of ' + QUIZ_DATA.length + ' (' + pct + '%). Review the rationale and revisit earlier sections before continuing.'; }

  var res = document.getElementById('quiz-results');
  if (res) {
    res.innerHTML = `
    <div class="mcq-results-icon">${icon}</div>
    <div class="mcq-results-score">${pct}%</div>
    <div class="mcq-results-label">${passed ? 'Passed — well done!' : 'Review recommended'}</div>
    <div class="mcq-results-breakdown">
      <div class="mcq-result-stat"><div class="mcq-result-stat-num" style="color:#059669;">${correct}</div><div class="mcq-result-stat-lbl">Correct</div></div>
      <div class="mcq-result-stat"><div class="mcq-result-stat-num" style="color:#dc2626;">${QUIZ_DATA.length - correct}</div><div class="mcq-result-stat-lbl">Incorrect</div></div>
      <div class="mcq-result-stat"><div class="mcq-result-stat-num" style="color:var(--navy);">${QUIZ_DATA.length}</div><div class="mcq-result-stat-lbl">Total</div></div>
    </div>
    <div class="mcq-results-msg">${msg}</div>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <button class="btn btn-secondary-light" onclick="retryQuiz()" style="font-size:0.85rem;">🔄 Retry Quiz</button>
    </div>`;
    res.classList.add('show');
  }
  // Enable continue button
  var contBtn = document.getElementById('quiz-continue-btn');
  if (contBtn) {
    contBtn.disabled = false;
    contBtn.style.opacity = '1';
    contBtn.style.cursor = 'pointer';
    if (!passed) {
      var warn = document.getElementById('quiz-pass-warn');
      if (!warn) {
        warn = document.createElement('p');
        warn.id = 'quiz-pass-warn';
        warn.style.cssText = 'font-size:0.82rem;color:#fca5a5;text-align:right;margin-top:6px;';
        warn.innerHTML = '⚠️ Score below 80% — review and retry is recommended.';
        contBtn.parentNode.insertBefore(warn, contBtn.nextSibling);
      }
    }
  }
  SCORM.finish(passed ? 'passed' : 'failed', pct);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function retryQuiz() {
  var res = document.getElementById('quiz-results');
  if (res) res.classList.remove('show');
  if (SCORM.isInitialized()) { SCORM.setValue('cmi.core.lesson_status','incomplete'); SCORM.commit(); }
  renderQuiz();
}

/* ══════════════════════════════════════════════
   LEARNING RECORD (Page 11)
══════════════════════════════════════════════ */
function populateLearningRecord() {
  // Date
  var d = new Date();
  var dateEl = document.getElementById('rec-date');
  if (dateEl) dateEl.textContent = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Med Matcher
  var mmEl = document.getElementById('rec-matcher');
  if (mmEl) {
    if (matcherScore) {
      var pct = Math.round((matcherScore.correct / matcherScore.total) * 100);
      mmEl.innerHTML = `<strong>${matcherScore.correct} / ${matcherScore.total}</strong> correct (${pct}%) — ${matcherScore.correct === matcherScore.total ? '✅ All medications correctly categorised' : '⚠️ Some medications placed incorrectly'}`;
    } else {
      mmEl.textContent = 'Activity not completed.';
    }
  }

  // Rationalisation
  var ratEl = document.getElementById('rec-ration');
  if (ratEl) {
    if (rationScore) {
      var rpct = Math.round((rationScore.correct / rationScore.total) * 100);
      ratEl.innerHTML = `<strong>${rationScore.correct} / ${rationScore.total}</strong> correct (${rpct}%) — ${rationScore.correct === rationScore.total ? '✅ All medications correctly rationalised' : '⚠️ Some medications placed incorrectly'}`;
    } else {
      ratEl.textContent = 'Activity not completed.';
    }
  }

  // Hypo scenarios
  var hypoEl = document.getElementById('rec-hypo');
  if (hypoEl) {
    var done = Object.keys(hypoAnswered).length;
    if (done === 0) {
      hypoEl.textContent = 'Scenarios not completed.';
    } else {
      var correct = HYPO_SCENARIOS.filter(function(sc) {
        var idx = hypoAnswered[sc.id];
        return idx !== undefined && sc.options[idx].correct;
      }).length;
      hypoEl.innerHTML = `<strong>${correct} / ${HYPO_SCENARIOS.length}</strong> answered correctly — ${done} of ${HYPO_SCENARIOS.length} scenarios completed.`;
    }
  }

  // MCQ
  var mcqEl = document.getElementById('rec-mcq');
  if (mcqEl) {
    if (quizScore) {
      var passed = quizScore.pct >= 80;
      mcqEl.innerHTML = `<strong>${quizScore.correct} / ${quizScore.total}</strong> (${quizScore.pct}%) — <span style="font-weight:700;color:${passed?'#059669':'#dc2626'};">${passed?'✅ Pass':'✗ Did not meet 80% threshold'}</span>`;
    } else {
      mcqEl.textContent = 'Assessment not completed.';
    }
  }
}

function exportLearningRecord() {
  // Gather extra notes
  var notes = document.getElementById('rec-extra') ? document.getElementById('rec-extra').value : '';
  // Print
  window.print();
}

/* ══════════════════════════════════════════════
   COMPLETION
══════════════════════════════════════════════ */
function finish() {
  populateLearningRecord();
  goToPage(11);
}

function showFinishOverlay() {
  var overlay = document.getElementById('finish-overlay');
  if (overlay) overlay.classList.add('show');
}

function finishModule() {
  SCORM.finish('passed', null);
  showFinishOverlay();
}

function closeOverlay() {
  var overlay = document.getElementById('finish-overlay');
  if (overlay) overlay.classList.remove('show');
  try { window.close(); } catch(e) {}
  setTimeout(function() { goToPage(1); }, 300);
}

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  SCORM.initialize();
  updateProgressBar(1);
  // Init interactives
  initMatcher();
  setupDropZones('matcher');
  initRation();
  setupDropZones('ration');
  buildHypoScenarios();
  initHypoScenarios();
  initDoseSim();
  renderQuiz();

  window.addEventListener('beforeunload', function () {
    if (SCORM.isInitialized()) SCORM.finish('incomplete', null);
  });
});

/* ══════════════════════════════════════════════
   TOUCH SUPPORT — drag-and-drop on mobile
══════════════════════════════════════════════ */
(function() {
  document.addEventListener('touchstart', function(e) {
    var chip = e.target.closest('.drag-chip[draggable]');
    if (!chip) return;
    chip._touchContext = chip.closest('[data-context]') ? null : null;
    // Determine context from parent or id
    var ctx = chip.id.startsWith('mc-') ? 'matcher' : chip.id.startsWith('rc-') ? 'ration' : null;
    if (!ctx) return;
    chip._ctx = ctx;
    chip.style.opacity = '0.5';
    e.stopPropagation();
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    var chip = document.querySelector('.drag-chip[style*="opacity: 0.5"], .drag-chip[style*="opacity:0.5"]');
    if (!chip) return;
    chip.style.opacity = '';
    var ctx = chip._ctx;
    if (!ctx) return;
    var touch = e.changedTouches[0];
    var el = document.elementFromPoint(touch.clientX, touch.clientY);
    var zone = el && el.closest('.drop-zone[data-context="' + ctx + '"]');
    if (zone) {
      placeChip(chip.id, zone.id, ctx);
    }
  });
})();
