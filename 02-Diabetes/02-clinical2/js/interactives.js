/* ══════════════════════════════════════════════
   INTERACTIVE 1 — MED RISK MATCHER (Page 5)
══════════════════════════════════════════════ */
var matcherAnswers   = {};
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
══════════════════════════════════════════════ */
var rationAnswers   = {};
const RATION_CHIPS = [
  { id: 'rc-metf',    text: 'Metformin',        correct: 'ration-stop'     },
  { id: 'rc-stat',    text: 'Statin',            correct: 'ration-stop'     },
  { id: 'rc-aht',     text: 'Antihypertensive',  correct: 'ration-stop'     },
  { id: 'rc-sulph',   text: 'Sulphonylurea',     correct: 'ration-stop'     },
  { id: 'rc-basins',  text: 'Basal Insulin',     correct: 'ration-continue' },
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
  var existing = document.getElementById('placed-' + chipId);
  if (existing) existing.remove();
  if (context === 'matcher')  delete matcherAnswers[chipId];
  if (context === 'ration')   delete rationAnswers[chipId];
  chip.style.display = 'none';
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
  var zones = Array.from(document.querySelectorAll('[data-context="' + context + '"]'));
  var currentZoneId = context === 'matcher' ? matcherAnswers[chipId] : rationAnswers[chipId];
  var nextZoneIdx = 0;
  if (currentZoneId) {
    var curIdx = zones.findIndex(z => z.id === currentZoneId);
    nextZoneIdx = (curIdx + 1) % zones.length;
  }
  placeChip(chipId, zones[nextZoneIdx].id, context);
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
    else { placed.classList.add('placed-wrong'); }
  });
  var fb = document.getElementById('matcher-feedback');
  if (fb) {
    fb.style.display = 'block';
    if (correct === MATCHER_CHIPS.length) {
      fb.className = 'drag-feedback correct';
      fb.innerHTML = '🌟 <strong>Perfect!</strong> You have correctly identified the end-of-life risk profile for each medication.';
      document.getElementById('matcher-continue-btn').disabled = false;
      document.getElementById('matcher-continue-btn').style.opacity = '1';
      document.getElementById('matcher-continue-btn').style.cursor = 'pointer';
    } else {
      fb.className = 'drag-feedback wrong';
      fb.innerHTML = '❌ <strong>Not quite.</strong> Some medications are in the wrong risk category. Review the table on the previous page and try again.';
    }
  }
}

function resetMatcher() {
  MATCHER_CHIPS.forEach(c => returnChipToBank(c.id, 'matcher'));
  var fb = document.getElementById('matcher-feedback');
  if (fb) fb.style.display = 'none';
}

function checkRation() {
  var correct = 0;
  RATION_CHIPS.forEach(function(c) {
    var placed = document.getElementById('placed-' + c.id);
    if (!placed) return;
    var zoneId = rationAnswers[c.id];
    if (zoneId === c.correct) { placed.classList.add('placed-correct'); correct++; }
    else { placed.classList.add('placed-wrong'); }
  });
  var fb = document.getElementById('ration-feedback');
  if (fb) {
    fb.style.display = 'block';
    if (correct === RATION_CHIPS.length) {
      fb.className = 'drag-feedback correct';
      fb.innerHTML = '🌟 <strong>Excellent.</strong> You have correctly rationalised the medications for this Type 1 patient. Remember: Basal insulin is a physiological necessity.';
      document.getElementById('ration-continue-btn').disabled = false;
      document.getElementById('ration-continue-btn').style.opacity = '1';
      document.getElementById('ration-continue-btn').style.cursor = 'pointer';
    } else {
      fb.className = 'drag-feedback wrong';
      fb.innerHTML = '❌ <strong>Review required.</strong> Some medications have been incorrectly categorised. Consider the patient\'s Type 1 diagnosis and terminal phase.';
    }
  }
}

function resetRation() {
  RATION_CHIPS.forEach(c => returnChipToBank(c.id, 'ration'));
  var fb = document.getElementById('ration-feedback');
  if (fb) fb.style.display = 'none';
}

/* ══════════════════════════════════════════════
   INTERACTIVE 3 — HYPO SCENARIOS (Page 7)
══════════════════════════════════════════════ */
const HYPO_SCENARIOS = [
  {
    title: 'Scenario 1: Conscious & Swallowing',
    text: 'A patient in the terminal phase is alert but appears shaky and confused. Blood glucose is 3.2 mmol/L. They are able to swallow safely.',
    opts: ['Give 15-20g of quick-acting carbohydrate (e.g. 150ml Lucozade or 5-7 glucose tablets)', 'Administer IM Glucagon immediately', 'Wait 30 minutes and re-test'],
    correct: 0,
    fb: 'Correct. If the patient can swallow safely, <strong>oral quick-acting carbohydrate</strong> is the first-line treatment. Follow with a long-acting carb if they are eating.'
  },
  {
    title: 'Scenario 2: Drowsy but Swallowing Unsafe',
    text: 'The patient is now very drowsy and has a weak swallow. Blood glucose is 2.8 mmol/L. Oral treatment is no longer safe.',
    opts: ['Force oral glucose juice into the mouth', 'Apply glucose gel (e.g. Glucogel) to the inside of the cheeks', 'Give a large meal immediately'],
    correct: 1,
    fb: 'Correct. When swallowing is unsafe but the patient is not yet unconscious, <strong>buccal glucose gel</strong> is an effective and safe alternative.'
  },
  {
    title: 'Scenario 3: Unconscious / Terminal Phase',
    text: 'The patient is now unconscious in the final hours of life. Blood glucose is 3.0 mmol/L. The Advance Care Plan focuses on comfort and avoiding invasive interventions.',
    opts: ['Transfer to A&E for IV Glucose', 'Administer IM Glucagon', 'Focus on comfort; treat symptoms (e.g. repositioning, mouth care) rather than the number, as per ACP'],
    correct: 2,
    fb: 'Correct. In the final hours, if the patient is unconscious and the ACP prioritises comfort, <strong>aggressive treatment of the number is often inappropriate</strong>. Focus on symptom relief.'
  }
];

var hypoIdx = 0;
function initHypo() {
  hypoIdx = 0;
  renderHypo();
}

function renderHypo() {
  var wrap = document.getElementById('hypo-scenarios-wrap');
  if (!wrap) return;
  wrap.innerHTML = HYPO_SCENARIOS.map(function(s, i) {
    var isLocked = i > hypoIdx;
    var isDone   = i < hypoIdx;
    return `
    <div class="hypo-card ${isLocked ? 'locked' : ''} ${isDone ? 'done' : ''}" id="hypo-card-${i}">
      <div class="hypo-card-head">
        <div class="hypo-card-num">Scenario ${i+1}</div>
        <div class="hypo-card-title">${s.title}</div>
      </div>
      <div class="hypo-card-body">
        <p class="hypo-text">${s.text}</p>
        <div class="hypo-options">
          ${s.opts.map((opt, oi) => `
            <button class="hypo-opt" onclick="answerHypo(${i},${oi})" ${isLocked||isDone?'disabled':''}>${opt}</button>
          `).join('')}
        </div>
        <div class="hypo-fb" id="hypo-fb-${i}"></div>
      </div>
    </div>`;
  }).join('');
  if (hypoIdx >= HYPO_SCENARIOS.length) {
    var done = document.getElementById('hypo-all-done');
    if (done) done.classList.add('show');
    var btn = document.getElementById('hypo-continue-btn');
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
  }
}

function answerHypo(si, oi) {
  var s = HYPO_SCENARIOS[si];
  var fb = document.getElementById('hypo-fb-' + si);
  if (oi === s.correct) {
    fb.innerHTML = '✅ ' + s.fb;
    fb.className = 'hypo-fb show correct';
    setTimeout(function() { hypoIdx++; renderHypo(); }, 1500);
  } else {
    fb.innerHTML = '❌ Not quite. Consider the patient\'s safety and the clinical context.';
    fb.className = 'hypo-fb show wrong';
  }
}

/* ══════════════════════════════════════════════
   INTERACTIVE 4 — DOSE SIMULATOR (Page 9)
══════════════════════════════════════════════ */
const INTAKE_LABELS   = ['Nothing (0%)', 'Sips / Minimal (25%)', 'Small snacks (50%)', 'Light meals (75%)', 'Full meals (100%)'];
const CONSCIOUS_LABELS = ['Unconscious', 'Semi-conscious / Drowsy', 'Confused / Agitated', 'Drowsy but rousable', 'Fully alert'];

const DOSE_MATRIX = [
  [
    { basal:'Stop / Specialist advice', bolus:'Stop',             level:'critical', note:'Unconscious and not eating. High risk of hypoglycaemia. Seek specialist advice immediately regarding basal insulin withdrawal.', warn:'Type 1 patients still need basal insulin until the very end — do not stop without specialist input.' },
    { basal:'50–70% reduction',  bolus:'Stop',             level:'danger',   note:'Drowsy and not eating. Significant basal reduction required to prevent overnight hypos.', warn:'' },
    { basal:'30–50% reduction',  bolus:'Stop',             level:'danger',   note:'Confused and not eating. Monitor closely for symptoms of both hypo and hyperglycaemia.', warn:'' },
    { basal:'20–30% reduction',  bolus:'Stop',             level:'amber',    note:'Alert but not eating. Basal insulin must continue at a reduced dose to prevent DKA.', warn:'' },
    { basal:'10–20% reduction',  bolus:'Stop',             level:'amber',    note:'Fully alert but not eating. Maintain basal (reduced) and monitor BG levels.', warn:'' },
  ],
  [
    { basal:'50–70% reduction',  bolus:'Stop',             level:'danger',   note:'Minimal intake and drowsy. High risk of hypoglycaemia.', warn:'' },
    { basal:'30–50% reduction',  bolus:'Stop',             level:'danger',   note:'Minimal intake and semi-conscious. Focus on comfort.', warn:'' },
    { basal:'20–30% reduction',  bolus:'Stop',             level:'amber',    note:'Minimal intake and confused. Basal insulin is essential.', warn:'' },
    { basal:'10–20% reduction',  bolus:'Stop',             level:'amber',    note:'Minimal intake but rousable. Reduce basal to prevent hypos.', warn:'' },
    { basal:'Usual dose',        bolus:'Stop',             level:'safe',     note:'Minimal intake but alert. Monitor BG closely.', warn:'' },
  ],
  [
    { basal:'30–50% reduction',  bolus:'50% reduction',    level:'danger',   note:'Eating small snacks but drowsy. Balance risk of hypo vs DKA.', warn:'' },
    { basal:'20–30% reduction',  bolus:'50% reduction',    level:'amber',    note:'Eating small snacks and semi-conscious.', warn:'' },
    { basal:'10–20% reduction',  bolus:'50% reduction',    level:'amber',    note:'Eating small snacks and confused.', warn:'' },
    { basal:'Usual dose',        bolus:'50% reduction',    level:'safe',     note:'Eating small snacks and rousable.', warn:'' },
    { basal:'Usual dose',        bolus:'Usual dose',       level:'safe',     note:'Eating small snacks and alert.', warn:'' },
  ],
  [
    { basal:'20–30% reduction',  bolus:'Usual dose',       level:'amber',    note:'Eating light meals but drowsy.', warn:'' },
    { basal:'10–20% reduction',  bolus:'Usual dose',       level:'amber',    note:'Eating light meals and semi-conscious.', warn:'' },
    { basal:'Usual dose',        bolus:'Usual dose',       level:'safe',     note:'Eating light meals and confused.', warn:'' },
    { basal:'Usual dose',        bolus:'Usual dose',       level:'safe',     note:'Eating light meals and rousable.', warn:'' },
    { basal:'Usual dose',        bolus:'Usual dose',       level:'safe',     note:'Eating light meals and alert.', warn:'' },
  ],
  [
    { basal:'10–20% reduction',  bolus:'Usual dose',       level:'amber',    note:'Eating well but drowsy.', warn:'' },
    { basal:'Usual dose',        bolus:'Usual dose',       level:'safe',     note:'Eating well and semi-conscious.', warn:'' },
    { basal:'Usual dose',        bolus:'Usual dose',       level:'safe',     note:'Eating well and confused.', warn:'' },
    { basal:'Usual dose',        bolus:'Usual dose',       level:'safe',     note:'Eating well and rousable.', warn:'' },
    { basal:'Usual dose',        bolus:'Usual dose',       level:'safe',     note:'Eating well and alert.', warn:'' },
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

window.checkMatcher = checkMatcher;
window.resetMatcher = resetMatcher;
window.checkRation = checkRation;
window.resetRation = resetRation;
window.answerHypo = answerHypo;
window.updateDoseSim = updateDoseSim;
window.onDragStart = onDragStart;
window.onChipClick = onChipClick;
