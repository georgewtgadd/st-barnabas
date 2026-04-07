/* ══════════════════════════════════════════════════════════
   SBH EDUCATION — Module 4: Symptom Management & Emergencies
   js/scripts.js · SCORM 1.2 · mirrors Module 2 conventions
══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════
   SECTION 1 — SCORM 1.2 API WRAPPER
══════════════════════════════════════════════════════════ */
var SCORM = (function () {
  'use strict';
  var _api = null, _initialized = false, _finished = false, _sessionStart = Date.now();
  function _findAPI(win) { var n=0; while(!win.API&&win.parent&&win.parent!==win){if(++n>7)return null;win=win.parent;} return win.API||null; }
  function _getAPI() { var a=_findAPI(window); if(!a&&window.opener&&window.opener!==window)a=_findAPI(window.opener); return a; }
  function initialize() {
    if(_initialized||_finished)return false;
    _api=_getAPI();
    if(!_api){console.info('[SCORM] standalone mode');return false;}
    if(_api.LMSInitialize('')==='true'||_api.LMSInitialize('')===true){_initialized=true;_sessionStart=Date.now();setValue('cmi.core.lesson_status','incomplete');setValue('cmi.core.score.min','0');setValue('cmi.core.score.max','100');commit();return true;}
    return false;
  }
  function setValue(el,val){if(!_initialized||_finished||!_api)return false;return _api.LMSSetValue(el,String(val))==='true'||_api.LMSSetValue(el,String(val))===true;}
  function getValue(el){return(!_initialized||_finished||!_api)?'':_api.LMSGetValue(el);}
  function commit(){if(!_initialized||_finished||!_api)return false;return _api.LMSCommit('')==='true'||_api.LMSCommit('')===true;}
  function _fmt(ms){var t=Math.floor(ms/1000),h=Math.floor(t/3600),m=Math.floor((t%3600)/60),s=t%60;return(h<10?'0':'')+h+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s;}
  function finish(status,score){if(_finished||!_initialized||!_api)return false;setValue('cmi.core.session_time',_fmt(Date.now()-_sessionStart));if(status!=null)setValue('cmi.core.lesson_status',status);if(score!=null)setValue('cmi.core.score.raw',String(Math.round(score)));commit();_api.LMSFinish('');_finished=true;return true;}
  function saveBookmark(n){setValue('cmi.core.lesson_location',String(n));setValue('cmi.suspend_data',JSON.stringify({page:n}));commit();}
  function getBookmark(){try{var d=JSON.parse(getValue('cmi.suspend_data'));return d.page||1;}catch(e){}var l=parseInt(getValue('cmi.core.lesson_location'),10);return isNaN(l)?1:l;}
  return{initialize,setValue,getValue,commit,finish,saveBookmark,getBookmark,isInitialized:()=>_initialized};
}());

/* ══════════════════════════════════════════════════════════
   SECTION 2 — PAGE NAVIGATION
══════════════════════════════════════════════════════════ */
var visited = new Set([1]);
var TOTAL_PAGES = 11;

function updateProgressBar(num) {
  var pct  = Math.round(((num-1)/(TOTAL_PAGES-1))*100);
  var fill = document.getElementById('progress-fill');
  var lbl  = document.getElementById('progress-label');
  if(fill) fill.style.width = pct+'%';
  if(lbl){ lbl.textContent = pct+'% complete'; var bar=lbl.closest('.module-progress-bar'); if(bar)bar.setAttribute('aria-valuenow',pct); }
}

function goToPage(num) {
  visited.add(num);
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  var page = document.getElementById('page-'+num);
  if(page) page.classList.add('active');
  for(var i=1;i<=TOTAL_PAGES;i++){
    var step = document.getElementById('nav-'+i);
    if(!step) continue;
    step.classList.remove('current','done'); step.removeAttribute('aria-current');
    if(i===num){ step.classList.add('current'); step.setAttribute('aria-current','step'); step.disabled=false; }
    else if(visited.has(i)){ step.classList.add('done'); step.disabled=false; }
    else { step.disabled=true; }
  }
  updateProgressBar(num);
  window.scrollTo({top:0,behavior:'smooth'});
  var h = page && page.querySelector('h1,h2');
  if(h){ h.setAttribute('tabindex','-1'); h.focus(); }
  SCORM.saveBookmark(num);
  if(num===11) populateLearningRecord();
}

function navClick(num){ if(visited.has(num)) goToPage(num); }

/* ══════════════════════════════════════════════════════════
   PAGE 2 — DRAG AND DROP
   Incorrect cards are returned to pool on "Check"
══════════════════════════════════════════════════════════ */
var _dndDraggingId = null;

function dndInitCards() {
  document.querySelectorAll('.dnd-card').forEach(function(card) {
    card.addEventListener('dragstart', function(e) {
      _dndDraggingId = this.dataset.id;
      this.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', function() { this.classList.remove('dragging'); });
    card.addEventListener('keydown', function(e) {
      if(e.key==='Enter'||e.key===' ') { e.preventDefault(); dndKeyboardPlace(this); }
    });
  });
}

function dndKeyboardPlace(card) {
  var cat = card.dataset.cat;
  var pool = document.getElementById('dnd-pool');
  if(!pool.contains(card)) return; // already placed
  var zoneCards = document.getElementById('zone-'+cat+'-cards');
  var clone = card.cloneNode(true);
  clone.dataset.id = card.dataset.id;
  clone.draggable = true;
  dndBindClone(clone);
  zoneCards.appendChild(clone);
  card.style.display = 'none';
  clearDndFeedback();
}

function dndBindClone(card) {
  card.addEventListener('dragstart', function(e) {
    _dndDraggingId = this.dataset.id;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('from-zone', this.closest('.dnd-zone-cards') ? this.closest('.dnd-zone').id : 'pool');
  });
  card.addEventListener('dragend', function() { this.classList.remove('dragging'); });
}

function dndOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
function dndLeave(e) { e.currentTarget.classList.remove('drag-over'); }

function dndDrop(e, zoneCat) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if(!_dndDraggingId) return;

  var sourceCard = document.querySelector('[data-id="'+_dndDraggingId+'"]');
  if(!sourceCard) return;

  var zoneCards = document.getElementById('zone-'+zoneCat+'-cards');

  // If dragged from pool (hidden original), create a clone in zone
  var pool = document.getElementById('dnd-pool');
  var originalInPool = pool.querySelector('[data-id="'+_dndDraggingId+'"]');

  if(originalInPool) {
    var clone = originalInPool.cloneNode(true);
    clone.dataset.id = _dndDraggingId;
    clone.draggable = true;
    dndBindClone(clone);
    zoneCards.appendChild(clone);
    originalInPool.style.display = 'none';
  } else {
    // Moving from one zone to another
    sourceCard.classList.remove('correct-placed','wrong-placed');
    zoneCards.appendChild(sourceCard);
  }

  clearDndFeedback();
  _dndDraggingId = null;
}

function clearDndFeedback() {
  var fb = document.getElementById('dnd-feedback');
  fb.textContent=''; fb.className='dnd-feedback';
}

function dndCheck() {
  // For each zone, check each placed card
  var zones = ['breathlessness','secretions'];
  var correct=0, wrong=0, total=0;
  var wrongCardIds = [];

  zones.forEach(function(cat) {
    var zoneCards = document.getElementById('zone-'+cat+'-cards');
    if(!zoneCards) return;
    zoneCards.querySelectorAll('.dnd-card').forEach(function(card) {
      total++;
      card.classList.remove('correct-placed','wrong-placed');
      if(card.dataset.cat === cat) { correct++; card.classList.add('correct-placed'); }
      else { wrong++; card.classList.add('wrong-placed'); wrongCardIds.push(card.dataset.id); }
    });
  });

  // Count un-placed cards
  document.querySelectorAll('#dnd-pool .dnd-card').forEach(function(c){
    if(c.style.display!=='none') total++;
  });

  var fb = document.getElementById('dnd-feedback');
  if(wrong === 0 && total === 6) {
    fb.innerHTML = '✅ <strong>All correct!</strong> Fan therapy, calm reassurance, and upright positioning help breathlessness. Side-lying, family education, and mouth care address terminal secretions.';
    fb.className = 'dnd-feedback correct';
    window._dndResult = '6/6 correct — All interventions correctly matched';
  } else {
    fb.innerHTML = '❌ <strong>'+correct+'/'+total+' correct.</strong> Incorrect cards (shown in red) have been returned to the pool — try again.';
    fb.className = 'dnd-feedback wrong';
    window._dndResult = correct+'/6 correct — Activity completed';

    // Return wrong cards to pool
    setTimeout(function() {
      wrongCardIds.forEach(function(id) {
        var inZone = document.querySelector('.dnd-zone-cards [data-id="'+id+'"]');
        if(inZone && inZone.classList.contains('wrong-placed')) {
          inZone.remove();
          var original = document.querySelector('#dnd-pool [data-id="'+id+'"]');
          if(original) original.style.display = '';
        }
      });
    }, 1200);
  }
}

function dndReset() {
  ['breathlessness','secretions'].forEach(function(cat) {
    var zc = document.getElementById('zone-'+cat+'-cards');
    if(zc) zc.innerHTML = '';
  });
  document.querySelectorAll('#dnd-pool .dnd-card').forEach(function(c){
    c.style.display = '';
    c.classList.remove('correct-placed','wrong-placed','dragging');
  });
  clearDndFeedback();
  window._dndResult = null;
}

/* ══════════════════════════════════════════════════════════
   PAGE 4 — CATEGORISATION + MODAL
══════════════════════════════════════════════════════════ */
var _catAnswered = {};
var _catCorrect = 0;
var _catTotal = 6;

var CAT_DETAIL = {
  'cc-1': {
    eyebrow: 'Expected Deterioration',
    title: 'Terminal Restlessness',
    body: '<p>Terminal restlessness (also called terminal agitation) is a normal and expected part of the dying process for many patients. It occurs in the final hours or days of life and is caused by a combination of neurological, metabolic, and physiological changes as the body shuts down.</p><ul><li><strong>It is not:</strong> a sign of uncontrolled pain or a preventable complication</li><li><strong>Management:</strong> Anticipatory medication (e.g. Midazolam SC/syringe driver), calm quiet environment, reduce stimulation, family support and explanation</li><li><strong>Communication:</strong> Families find this distressing — explain what is happening and why it does not mean the patient is suffering</li></ul>'
  },
  'cc-2': {
    eyebrow: 'Palliative Emergency',
    title: 'Metastatic Spinal Cord Compression (MSCC)',
    body: '<p>MSCC is a true oncological emergency. Without prompt treatment, it causes irreversible spinal cord injury and permanent paralysis. It affects approximately 5% of cancer patients and most commonly involves the thoracic spine.</p><ul><li><strong>Act within hours</strong> — NICE NG127 requires urgent MRI within 24 hours of suspected diagnosis</li><li><strong>Immediate action:</strong> Nurse flat (spinal precautions), high-dose dexamethasone 16mg, urgent oncology referral</li><li><strong>Do not wait</strong> for imaging before implementing spinal precautions if you suspect MSCC</li></ul>'
  },
  'cc-3': {
    eyebrow: 'Expected Deterioration',
    title: 'Skin Breakdown',
    body: '<p>Pressure ulcer development in bed-bound or immobile patients is an anticipated consequence of advanced illness and immobility. As patients deteriorate, circulation to the skin diminishes and pressure injuries become almost inevitable in the final days.</p><ul><li>This is not a failure of care — it is an expected part of dying</li><li><strong>Prevention:</strong> Regular repositioning, pressure-relieving mattresses, nutritional support where appropriate</li><li><strong>At end of life:</strong> Comfort takes priority over aggressive wound care — gentle, dignified skin care focused on preventing pain</li></ul>'
  },
  'cc-4': {
    eyebrow: 'Palliative Emergency',
    title: 'Superior Vena Cava Obstruction (SVCO)',
    body: '<p>SVCO is a medical emergency caused by obstruction of the superior vena cava, usually by a mediastinal tumour (most commonly lung cancer or lymphoma). It prevents venous return from the head, neck, and arms.</p><ul><li><strong>Symptoms:</strong> Facial oedema (especially periorbital), distended neck veins, bilateral arm swelling, dyspnoea</li><li><strong>Immediate treatment:</strong> High-dose dexamethasone, sit patient upright, urgent oncology referral for radiotherapy or SVC stenting</li><li><strong>IV access:</strong> Avoid arms — use leg or femoral route if IV access is essential</li></ul>'
  },
  'cc-5': {
    eyebrow: 'Expected Deterioration',
    title: 'Incontinence',
    body: '<p>Loss of bladder and bowel control is an expected and common feature of advancing illness and functional decline, particularly in patients with neurological involvement, general frailty, or as part of the dying process.</p><ul><li>This requires dignified, compassionate nursing care — not investigation or emergency intervention</li><li>Consider: catheterisation for patient comfort, barrier creams for skin protection, absorbent pads</li><li>Sudden onset of urinary or faecal incontinence associated with back pain and leg weakness is different — this is a red flag for MSCC</li></ul>'
  },
  'cc-6': {
    eyebrow: 'Palliative Emergency',
    title: 'Catastrophic Haemorrhage',
    body: '<p>Catastrophic terminal haemorrhage occurs when a tumour erodes a major blood vessel — most commonly in head and neck cancers involving the carotid artery, or in lung cancer with haemoptysis. It is rare but constitutes a clinical emergency requiring immediate structured response.</p><ul><li><strong>At-risk patients</strong> should have anticipatory medication (Midazolam) prescribed and dark towels available in the home</li><li><strong>ABC approach:</strong> Assure → Be There → Comfort/Cover/Call</li><li><strong>Do not attempt resuscitation</strong> in most cases — the goal is comfort and dignity</li></ul>'
  }
};

function catAnswer(cardId, answer, btn) {
  if(_catAnswered[cardId]) return;
  var card = document.getElementById(cardId);
  if(!card) return;
  var correct = card.dataset.answer;
  var isRight = (answer === correct);
  _catAnswered[cardId] = answer;

  card.querySelectorAll('.cat-btn').forEach(function(b){ b.disabled=true; });
  card.classList.add(isRight ? 'answered-correct' : 'answered-wrong');

  var resultEl = document.getElementById(cardId+'-result');
  if(resultEl) {
    resultEl.className = 'cat-result '+(isRight?'correct':'wrong');
    var label = isRight ? '✓ Correct — '+correct.charAt(0).toUpperCase()+correct.slice(1)
                        : '✗ This is a '+correct+' condition';
    resultEl.innerHTML = label + ' &nbsp;<button class="cat-more-btn" onclick="openCatModal(\''+cardId+'\')">More info →</button>';
  }

  if(isRight) _catCorrect++;
  updateCatScore();
}

function updateCatScore() {
  var answered = Object.keys(_catAnswered).length;
  if(answered === 0) return;
  var box = document.getElementById('cat-score-box');
  if(!box) return;
  box.style.display = 'block';
  box.textContent = answered+' of '+_catTotal+' answered — '+_catCorrect+' correct';
  if(answered === _catTotal) {
    box.textContent = '✓ Complete: '+_catCorrect+'/'+_catTotal+' correct. '+(
      _catCorrect===_catTotal ? 'Excellent — you correctly identified all categories!' : 'Review the conditions you found challenging before continuing.'
    );
    window._catResult = _catCorrect+'/'+_catTotal+' — Emergency identification exercise';
  }
}

function openCatModal(cardId) {
  var data = CAT_DETAIL[cardId];
  if(!data) return;
  document.getElementById('cat-modal-eyebrow').textContent = data.eyebrow;
  document.getElementById('cat-modal-title').textContent   = data.title;
  document.getElementById('cat-modal-body').innerHTML      = data.body;
  var m = document.getElementById('cat-modal');
  m.classList.add('open');
  m.querySelector('.modal-close').focus();
}

function closeCatModal() {
  document.getElementById('cat-modal').classList.remove('open');
}

/* ══════════════════════════════════════════════════════════
   PAGE 5 — ABC SEQUENCE (no label hints)
══════════════════════════════════════════════════════════ */
var _abcSelected = [];
var _abcCorrect  = ['A','B','C'];

function abcSelect(card) {
  if(card.classList.contains('abc-placed')) return;
  if(_abcSelected.length >= 3) return;
  card.classList.add('abc-placed');
  _abcSelected.push({ label: card.dataset.label, el: card });
  var idx = _abcSelected.length - 1;
  var numEl = card.querySelector('.abc-card-num');
  if(numEl) numEl.textContent = idx+1;
  var slot = document.getElementById('abc-seq-'+idx);
  if(slot) {
    slot.textContent = 'Step '+(idx+1)+' — selected';
    slot.classList.add('filled');
  }
  clearAbcFeedback();
}

function abcCheck() {
  if(_abcSelected.length < 3) {
    var fb = document.getElementById('abc-feedback');
    fb.innerHTML = '⚠️ Please select all three steps before checking.';
    fb.className = 'abc-feedback wrong';
    return;
  }
  var isCorrect = _abcSelected.every(function(item, idx) { return item.label === _abcCorrect[idx]; });

  for(var i=0;i<3;i++){
    var slot = document.getElementById('abc-seq-'+i);
    if(slot){ slot.classList.remove('filled'); slot.classList.add(_abcSelected[i].label===_abcCorrect[i]?'correct':'wrong'); }
  }

  var fb = document.getElementById('abc-feedback');
  if(isCorrect) {
    fb.innerHTML = '✅ <strong>Correct order!</strong> Step 1 = Assure (calm the patient with your voice and presence). Step 2 = Be There (never leave them alone). Step 3 = Comfort, Cover &amp; Call (dark towels to mask blood, Midazolam if prescribed, senior support). The patient\'s emotional experience — especially their fear — must be addressed first.';
    fb.className = 'abc-feedback correct';
    window._abcResult = 'Correct — A→B→C sequence: Assure → Be There → Comfort/Cover/Call';
  } else {
    fb.innerHTML = '❌ Not quite. The correct order is: <strong>1st — Reassure the patient calmly → 2nd — Stay present, do not leave → 3rd — Cover the wound with dark towels, give medication if prescribed, call for help.</strong> Your calm presence comes before any clinical action.';
    fb.className = 'abc-feedback wrong';
    window._abcResult = 'Incorrect — reviewed (A→B→C not applied correctly)';
  }
}

function abcReset() {
  _abcSelected = [];
  document.querySelectorAll('.abc-card').forEach(function(c){
    c.classList.remove('abc-placed');
    var n = c.querySelector('.abc-card-num');
    if(n) n.textContent = '';
  });
  for(var i=0;i<3;i++){
    var slot = document.getElementById('abc-seq-'+i);
    if(slot){ slot.innerHTML='<span>'+(i===0?'1st':i===1?'2nd':'3rd')+' action</span>'; slot.className='abc-seq-slot'; }
  }
  clearAbcFeedback();
}

function clearAbcFeedback() {
  var fb = document.getElementById('abc-feedback');
  if(fb){ fb.textContent=''; fb.className='abc-feedback'; }
}

/* ══════════════════════════════════════════════════════════
   PAGE 6 — HYPERCALCAEMIA TOGGLE
══════════════════════════════════════════════════════════ */
function toggleHC(id) {
  var card = document.getElementById(id);
  var body = document.getElementById(id+'-body');
  var chev = document.getElementById(id+'-chev');
  if(!card||!body) return;
  var open = card.getAttribute('aria-expanded')==='true';
  card.setAttribute('aria-expanded', open?'false':'true');
  body.classList.toggle('open', !open);
  if(chev) chev.textContent = open ? '↓' : '↑';
}

/* ══════════════════════════════════════════════════════════
   PAGE 8 — SVCO DIAGRAM
══════════════════════════════════════════════════════════ */
function showSVCO(num) {
  document.querySelectorAll('.svco-panel').forEach(function(p){ p.classList.remove('active'); });
  var panel = document.getElementById('svco-'+num);
  if(panel) panel.classList.add('active');
}

/* ══════════════════════════════════════════════════════════
   PAGE 9 — DRAGGABLE REORDER
══════════════════════════════════════════════════════════ */
var _seqDragEl = null;
var _seqDragOver = null;

function seqInit() {
  var list = document.getElementById('seq-list');
  if(!list) return;

  list.querySelectorAll('.seq-item').forEach(function(item) {
    item.addEventListener('dragstart', function(e) {
      _seqDragEl = this;
      this.classList.add('dragging-source');
      e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', function() {
      this.classList.remove('dragging-source');
      list.querySelectorAll('.seq-item').forEach(function(i){
        i.classList.remove('drag-over-top','drag-over-bottom');
      });
      _seqDragEl = null;
      _seqDragOver = null;
    });
    item.addEventListener('dragover', function(e) {
      e.preventDefault();
      if(!_seqDragEl || _seqDragEl === this) return;
      var rect = this.getBoundingClientRect();
      var mid  = rect.top + rect.height/2;
      list.querySelectorAll('.seq-item').forEach(function(i){
        i.classList.remove('drag-over-top','drag-over-bottom');
      });
      if(e.clientY < mid) { this.classList.add('drag-over-top'); _seqDragOver = {el:this, pos:'before'}; }
      else                { this.classList.add('drag-over-bottom'); _seqDragOver = {el:this, pos:'after'}; }
    });
    item.addEventListener('drop', function(e) {
      e.preventDefault();
      if(!_seqDragEl || !_seqDragOver) return;
      if(_seqDragOver.pos === 'before') { list.insertBefore(_seqDragEl, _seqDragOver.el); }
      else { _seqDragOver.el.after(_seqDragEl); }
      seqClearBadges();
      clearSeqFeedback();
    });

    // Touch/keyboard fallback
    item.addEventListener('keydown', function(e) {
      var items = Array.from(list.querySelectorAll('.seq-item'));
      var idx = items.indexOf(this);
      if(e.key==='ArrowUp'&&idx>0){ e.preventDefault(); list.insertBefore(this,items[idx-1]); this.focus(); seqClearBadges(); clearSeqFeedback(); }
      if(e.key==='ArrowDown'&&idx<items.length-1){ e.preventDefault(); items[idx+1].after(this); this.focus(); seqClearBadges(); clearSeqFeedback(); }
    });
  });
}

function seqClearBadges() {
  document.querySelectorAll('.seq-item-badge').forEach(function(b){ b.textContent=''; b.className='seq-item-badge'; });
}

function clearSeqFeedback() {
  var fb = document.getElementById('seq-feedback');
  if(fb){ fb.textContent=''; fb.className='seq-feedback'; }
}

function seqCheck() {
  var list = document.getElementById('seq-list');
  var items = Array.from(list.querySelectorAll('.seq-item'));
  var correctOrder = [1,2,3,4]; // data-order values
  var allCorrect = true;

  items.forEach(function(item, idx) {
    var badge = document.getElementById(item.id+'-badge');
    var isCorrect = parseInt(item.dataset.order) === correctOrder[idx];
    if(!isCorrect) allCorrect = false;
    if(badge) {
      badge.textContent = isCorrect ? '✓' : '✗';
      badge.className = 'seq-item-badge '+(isCorrect?'correct':'wrong');
    }
  });

  var fb = document.getElementById('seq-feedback');
  if(allCorrect) {
    fb.innerHTML = '✅ <strong>Correct!</strong> The right sequence is: 1. Safe environment &amp; airway → 2. Check blood glucose (exclude hypoglycaemia) → 3. Administer Buccal Midazolam → 4. Monitor &amp; seek specialist advice. Checking the BM before giving anticonvulsants is critical — hypoglycaemia can mimic seizure and needs different treatment entirely.';
    fb.className = 'seq-feedback correct';
    window._seqResult = 'Correct order: Safety → BM check → Buccal Midazolam → Monitor & advice';
  } else {
    fb.innerHTML = '❌ Not quite. Correct order: <strong>1. Safe environment/airway → 2. Check BM (rule out hypoglycaemia) → 3. Administer Buccal Midazolam → 4. Monitor &amp; seek specialist advice.</strong> Use the arrow keys or drag to reorder and try again.';
    fb.className = 'seq-feedback wrong';
    window._seqResult = 'Incorrect — reviewed';
  }
}

function seqReset() {
  var list = document.getElementById('seq-list');
  var items = Array.from(list.querySelectorAll('.seq-item'));
  // Shuffle back to random order
  items.sort(function(){ return Math.random()-.5; });
  items.forEach(function(item){ list.appendChild(item); });
  seqClearBadges();
  clearSeqFeedback();
  window._seqResult = null;
}

/* ══════════════════════════════════════════════════════════
   PAGE 10 — MCQ: 5 CASE STUDIES
══════════════════════════════════════════════════════════ */
var _mcqData = [
  {
    patient: 'Patient 1 — Margaret, 68, lung cancer',
    quote: '"Over the past few weeks my face has been getting puffier — particularly around my eyes in the mornings. Both arms feel heavy and my rings don\'t fit any more. Now I can\'t catch my breath when I\'m sitting still."',
    question: 'What is the most likely diagnosis and what is the priority initial action?',
    options: [
      { letter:'A', text:'Cardiac failure — commence furosemide IV and restrict fluids', correct:false },
      { letter:'B', text:'Superior Vena Cava Obstruction — sit the patient upright and administer high-dose dexamethasone urgently', correct:true },
      { letter:'C', text:'Anaphylactic reaction — administer IM adrenaline immediately', correct:false },
      { letter:'D', text:'Bilateral deep vein thrombosis — refer for compression ultrasound', correct:false }
    ],
    rationale: 'This is a classic presentation of SVCO: facial oedema worse in the mornings (fluid redistributes when lying flat overnight), bilateral arm swelling, and progressive dyspnoea from airway compression. Adrenaline is for anaphylaxis (rapid onset, urticaria, airway involvement). Furosemide addresses cardiac oedema, not venous obstruction. The priority is sitting the patient upright, urgent dexamethasone, and an oncology referral for radiotherapy or SVC stenting.'
  },
  {
    patient: 'Patient 2 — Colin, 72, prostate cancer with spinal metastases',
    quote: '"I\'ve had back pain for months but this week it feels like a tight band around my chest. My legs feel like lead — I nearly fell on the stairs this morning. And I can\'t seem to pass urine properly."',
    question: 'This presentation requires what immediate response?',
    options: [
      { letter:'A', text:'Prescribe stronger analgesia and arrange physiotherapy in the next few days', correct:false },
      { letter:'B', text:'Nurse the patient flat with log-rolling precautions and administer high-dose dexamethasone immediately — urgent MRI of whole spine within 24 hours', correct:true },
      { letter:'C', text:'Advise rest at home and arrange GP review in 1–2 weeks', correct:false },
      { letter:'D', text:'Refer to urology for bladder scan — the urinary symptoms are the primary concern', correct:false }
    ],
    rationale: 'This is MSCC until proven otherwise: new band-like thoracic pain, bilateral motor weakness (heavy legs, near-fall), and bladder dysfunction. The urinary symptoms are part of MSCC, not an isolated urological problem. Patients with suspected MSCC must be nursed flat immediately (spinal precautions), given high-dose dexamethasone (16mg), and have an urgent MRI of the whole spine within 24 hours per NICE NG127. Do not wait for imaging before implementing spinal precautions.'
  },
  {
    patient: 'Patient 3 — Pauline, 61, breast cancer',
    quote: '"I\'ve been terribly confused lately — my daughter says I\'m not making sense. I keep needing to go to the toilet constantly but I still feel really thirsty. I\'ve also been dreadfully constipated for a week."',
    question: 'Which metabolic emergency best explains this triad of symptoms and what is the treatment?',
    options: [
      { letter:'A', text:'Dehydration secondary to poor oral intake — commence subcutaneous fluids at home', correct:false },
      { letter:'B', text:'Opioid toxicity — reduce the opioid dose and monitor', correct:false },
      { letter:'C', text:'Malignant hypercalcaemia — check serum calcium, IV hydration followed by IV bisphosphonate', correct:true },
      { letter:'D', text:'Urinary tract infection causing confusion — send MSU and start antibiotics', correct:false }
    ],
    rationale: 'This triad of confusion (Moans), polyuria + polydipsia (Stones), and constipation (Groans) is classic hypercalcaemia. The mnemonic "Stones, Bones, Groans and Moans" maps perfectly here. Treatment is IV hydration followed by IV bisphosphonate (Zoledronic acid or Pamidronate) once hypercalcaemia is confirmed on blood test. UTI is possible but would not explain the complete clinical picture. Opioid toxicity causes drowsiness and myoclonus, not polyuria.'
  },
  {
    patient: 'Patient 4 — Derek, 57, advanced head and neck cancer',
    quote: 'You are visiting Derek at home. He suddenly begins to bleed heavily from the mouth. You are alone with him.',
    question: 'Applying the ABC framework, what is your FIRST priority action?',
    options: [
      { letter:'A', text:'Call 999 immediately and wait outside for the ambulance', correct:false },
      { letter:'B', text:'Apply direct pressure to the wound site to stem the bleeding', correct:false },
      { letter:'C', text:'Speak calmly and reassuringly to Derek — your composed presence is the first and most important intervention', correct:true },
      { letter:'D', text:'Locate the anticipatory medication and administer Midazolam as the first step', correct:false }
    ],
    rationale: 'The ABC framework for terminal haemorrhage: A = Assure (calm the patient with your voice first — fear and panic worsen the experience), B = Be There (do not leave), C = Comfort/Cover/Call (dark towels, Midazolam if prescribed, call for senior support). Calling 999 alone and leaving the patient is the worst possible response. Medication is the third step, not the first. Direct pressure is appropriate for minor bleeds, not in the context of a terminal haemorrhage in a palliative patient.'
  },
  {
    patient: 'Patient 5 — Joan, 79, brain metastases from lung cancer',
    quote: 'You are called to Joan, who is having a generalised tonic-clonic seizure at her hospice bedside. The seizure has now been ongoing for six minutes.',
    question: 'After ensuring a safe environment and checking the airway, what is the NEXT priority?',
    options: [
      { letter:'A', text:'Administer buccal Midazolam (10mg) immediately as first-line anticonvulsant treatment', correct:false },
      { letter:'B', text:'Check blood glucose (BM) to exclude hypoglycaemia before administering anticonvulsants', correct:true },
      { letter:'C', text:'Call 999 for an ambulance — all seizures in hospice patients require hospital transfer', correct:false },
      { letter:'D', text:'Administer IV Diazepam as this is more rapidly effective than buccal Midazolam', correct:false }
    ],
    rationale: 'After establishing safety (environment, airway, recovery position where possible), the next step is to check blood glucose. Hypoglycaemia causes seizure-like episodes and requires a completely different treatment — giving anticonvulsants to a hypoglycaemic patient could be dangerous. Only after excluding hypoglycaemia should buccal Midazolam be administered. Hospice patients rarely need 999 — the palliative care team has protocols for this. IV Diazepam is not the preferred route in community/hospice settings; buccal Midazolam is the standard.'
  }
];

var _mcqAnswers = [];
var _mcqShuffled = [];

function _shuffle(arr) {
  for(var i=arr.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=arr[i];arr[i]=arr[j];arr[j]=t; }
  return arr;
}

function renderMCQ() {
  _mcqAnswers = _mcqData.map(function(){ return {selected:null,correct:false,answered:false}; });
  _mcqShuffled = _mcqData.map(function(q) {
    var opts = q.options.map(function(o){ return {text:o.text,correct:o.correct,letter:o.letter}; });
    _shuffle(opts);
    return {patient:q.patient, quote:q.quote, question:q.question, options:opts, rationale:q.rationale};
  });

  var dots = document.getElementById('mcq-dots');
  if(dots) dots.innerHTML = _mcqShuffled.map(function(_,i){ return '<div class="mcq-dot" id="mdot-'+i+'"></div>'; }).join('');

  var container = document.getElementById('mcq-questions-container');
  if(!container) return;

  container.innerHTML = _mcqShuffled.map(function(q, qi) {
    var letters = ['A','B','C','D'];
    var optHtml = q.options.map(function(opt,oi){
      return '<div class="mcq-option" id="mopt-'+qi+'-'+oi+'" role="button" tabindex="0"'
        +' onclick="selectOption('+qi+','+oi+')"'
        +' onkeydown="if(event.key===\'Enter\'||event.key===\' \')selectOption('+qi+','+oi+')"'
        +' aria-label="Option '+letters[oi]+': '+opt.text.replace(/"/g,'&quot;')+'">'
        +'<div class="mcq-option-letter">'+letters[oi]+'</div>'
        +opt.text
        +'</div>';
    }).join('');

    return '<div class="mcq-q-card'+(qi===0?' active':'')+'" id="mqcard-'+qi+'">'
      +'<div class="mcq-patient-card">'
        +'<div class="mcq-patient-eyebrow">'+q.patient+'</div>'
        +'<div class="mcq-patient-quote">'+q.quote+'</div>'
      +'</div>'
      +'<div class="mcq-q-header">'
        +'<div class="mcq-q-num">Question '+(qi+1)+' of '+_mcqShuffled.length+'</div>'
        +'<div class="mcq-q-text">'+q.question+'</div>'
      +'</div>'
      +'<div class="mcq-options">'+optHtml+'</div>'
      +'<div class="mcq-submit-row">'
        +'<div class="mcq-nav-row">'+(qi>0?'<button class="btn btn-secondary" style="font-size:.82rem;padding:10px 18px;" onclick="showMCQCard('+(qi-1)+')">← Prev</button>':'')+'</div>'
        +'<button class="mcq-submit-btn" id="msubmit-'+qi+'" onclick="submitAnswer('+qi+')" disabled>Submit Answer</button>'
        +'<div class="mcq-nav-row">'
          +(qi<_mcqShuffled.length-1?'<button class="btn btn-secondary" id="mnext-'+qi+'" style="font-size:.82rem;padding:10px 18px;display:none;" onclick="showMCQCard('+(qi+1)+')">Next →</button>':'')
          +(qi===_mcqShuffled.length-1?'<button class="btn btn-primary" id="mresults-'+qi+'" style="display:none;" onclick="showMCQResults()">See Results →</button>':'')
        +'</div>'
      +'</div>'
      +'<div class="mcq-feedback" id="mfb-'+qi+'" role="alert" aria-live="polite"></div>'
      +'</div>';
  }).join('');
}

function selectOption(qi, oi) {
  if(_mcqAnswers[qi]&&_mcqAnswers[qi].answered) return;
  for(var i=0;i<4;i++){ var o=document.getElementById('mopt-'+qi+'-'+i); if(o)o.classList.remove('selected'); }
  var el = document.getElementById('mopt-'+qi+'-'+oi);
  if(el) el.classList.add('selected');
  _mcqAnswers[qi].selected = oi;
  var submit = document.getElementById('msubmit-'+qi);
  if(submit) submit.disabled = false;
}

function submitAnswer(qi) {
  if(!_mcqAnswers[qi]||_mcqAnswers[qi].answered) return;
  var oi = _mcqAnswers[qi].selected;
  if(oi===null) return;
  _mcqAnswers[qi].answered = true;
  var q = _mcqShuffled[qi];
  var correct = q.options[oi].correct;
  _mcqAnswers[qi].correct = correct;

  for(var i=0;i<q.options.length;i++){
    var opt = document.getElementById('mopt-'+qi+'-'+i);
    if(!opt) continue;
    opt.classList.add('locked'); opt.setAttribute('tabindex','-1');
    if(q.options[i].correct) opt.classList.add('correct');
    if(i===oi&&!q.options[i].correct) opt.classList.add('incorrect');
  }

  var dot = document.getElementById('mdot-'+qi);
  if(dot){ dot.classList.remove('answered'); dot.classList.add(correct?'correct':'incorrect'); }

  var fb = document.getElementById('mfb-'+qi);
  if(fb){
    fb.className='mcq-feedback show '+(correct?'correct':'incorrect');
    fb.innerHTML='<span class="mcq-feedback-badge">'+(correct?'✅ Correct':'❌ Incorrect')+'</span><p>'+q.rationale+'</p>';
  }

  var submit = document.getElementById('msubmit-'+qi);
  if(submit) submit.disabled = true;
  if(qi<_mcqShuffled.length-1){ var nx=document.getElementById('mnext-'+qi); if(nx)nx.style.display=''; }
  else { var rs=document.getElementById('mresults-'+qi); if(rs)rs.style.display=''; }
}

function showMCQCard(qi) {
  document.querySelectorAll('.mcq-q-card').forEach(c=>c.classList.remove('active'));
  var card = document.getElementById('mqcard-'+qi);
  if(card) card.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}

function showMCQResults() {
  document.querySelectorAll('.mcq-q-card').forEach(c=>c.classList.remove('active'));
  var correctCount   = _mcqAnswers.filter(a=>a.correct).length;
  var incorrectCount = _mcqAnswers.length - correctCount;
  var pct = Math.round((correctCount/_mcqAnswers.length)*100);
  var passed = pct >= 80;

  var icon, msg;
  if(pct===100){ icon='🌟'; msg='Outstanding — a perfect score! You have a strong command of recognising and responding to palliative emergencies across all five clinical scenarios.'; }
  else if(passed){ icon='✅'; msg='Well done — you scored '+correctCount+' out of '+_mcqAnswers.length+' ('+pct+'%). Review the rationale for any questions you found challenging before continuing.'; }
  else { icon='📚'; msg='You scored '+correctCount+' out of '+_mcqAnswers.length+' ('+pct+'%). A score of 80% or above is required. Review the module sections and try again.'; }

  var res = document.getElementById('mcq-results');
  if(!res) return;
  res.innerHTML = '<div style="font-size:3rem;margin-bottom:12px;">'+icon+'</div>'
    +'<div class="quiz-results-score">'+correctCount+'/'+_mcqAnswers.length+'</div>'
    +'<div class="quiz-results-label">'+(passed?'Passed — well done!':'Review recommended')+'</div>'
    +'<div class="quiz-results-breakdown">'
      +'<div class="quiz-result-stat"><div class="quiz-result-stat-num" style="color:#059669;">'+correctCount+'</div><div class="quiz-result-stat-lbl">Correct</div></div>'
      +'<div class="quiz-result-stat"><div class="quiz-result-stat-num" style="color:#dc2626;">'+incorrectCount+'</div><div class="quiz-result-stat-lbl">Incorrect</div></div>'
      +'<div class="quiz-result-stat"><div class="quiz-result-stat-num" style="color:var(--navy-light);">'+_mcqAnswers.length+'</div><div class="quiz-result-stat-lbl">Total</div></div>'
    +'</div>'
    +'<div class="quiz-results-msg">'+msg+'</div>'
    +'<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">'
      +'<button class="btn btn-secondary" onclick="retryMCQ()">🔄 Retry Quiz</button>'
      +(passed?'<button class="btn btn-primary" onclick="goToPage(11)">My Learning Record →</button>':'')
    +'</div>';
  res.classList.add('show');
  window.scrollTo({top:0,behavior:'smooth'});
  SCORM.finish(passed?'passed':'failed', pct);
}

function retryMCQ() {
  var res = document.getElementById('mcq-results');
  if(res) res.classList.remove('show');
  var btn = document.getElementById('mcq-continue-btn');
  if(btn){ btn.disabled=true; btn.style.opacity='.4'; btn.style.cursor='not-allowed'; }
  var failMsg = document.getElementById('mcq-fail-msg');
  if(failMsg) failMsg.remove();
  if(SCORM.isInitialized()){ SCORM.setValue('cmi.core.lesson_status','incomplete'); SCORM.commit(); }
  renderMCQ();
}

/* ══════════════════════════════════════════════════════════
   LEARNING RECORD (called by inline script in page 11)
══════════════════════════════════════════════════════════ */
function populateLearningRecord() {
  var d = new Date();
  var el = document.getElementById('export-date');
  if(el) el.textContent = d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});

  var dnd = document.getElementById('record-dnd');
  if(dnd) dnd.innerHTML = window._dndResult || 'Not yet completed.';

  var cat = document.getElementById('record-cat');
  if(cat) cat.textContent = window._catResult || 'Not yet completed.';

  var abc = document.getElementById('record-abc');
  if(abc) abc.textContent = window._abcResult || 'Not yet completed.';

  var seq = document.getElementById('record-seq');
  if(seq) seq.textContent = window._seqResult || 'Not yet completed.';

  // MCQ score
  var mcqEl = document.getElementById('record-mcq');
  var mcqDetail = document.getElementById('record-mcq-detail');
  var scoreDiv = document.getElementById('mcq-results');

  if(mcqEl && scoreDiv && scoreDiv.classList.contains('show')){
    var scoreNum = scoreDiv.querySelector('.quiz-results-score');
    var rawScore = scoreNum ? scoreNum.textContent.trim() : '—';
    var parts = rawScore.split('/');
    var passed = false;
    if(parts.length===2){var c=parseInt(parts[0]),t=parseInt(parts[1]);if(!isNaN(c)&&!isNaN(t)&&t>0)passed=(c/t)>=0.8;}
    var pct = (parts.length===2&&!isNaN(parseInt(parts[0]))&&!isNaN(parseInt(parts[1])))?Math.round((parseInt(parts[0])/parseInt(parts[1]))*100)+'%':'';
    mcqEl.innerHTML = '<strong style="color:var(--navy);">Score: '+rawScore+(pct?' ('+pct+')':'')+'</strong>'
      +'&nbsp;&nbsp;<span style="font-weight:700;color:'+(passed?'#059669':'#dc2626')+'">'+(passed?'✓ Pass':'✗ Did not reach 80% pass mark')+'</span>';

    if(mcqDetail){
      mcqDetail.innerHTML='';
      document.querySelectorAll('.mcq-q-card').forEach(function(card,i){
        var qText=card.querySelector('.mcq-q-text');
        var patientEl=card.querySelector('.mcq-patient-eyebrow');
        var feedback=card.querySelector('.mcq-feedback');
        var correct=feedback&&feedback.classList.contains('correct');
        var badge=feedback?feedback.querySelector('.mcq-feedback-badge'):null;
        var div=document.createElement('div');
        div.style.cssText='background:#f8fafc;border:1px solid #e2eaf4;border-left:4px solid '+(correct?'#059669':'#dc2626')+';border-radius:0 8px 8px 0;padding:10px 14px;font-size:.83rem;line-height:1.65;';
        div.innerHTML='<div style="font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:#7a8a9e;font-weight:700;margin-bottom:3px;">'+(patientEl?patientEl.textContent:'Case '+(i+1))+'</div>'
          +'<div style="font-weight:700;color:var(--navy);margin-bottom:3px;">Q'+(i+1)+': '+(qText?qText.textContent.trim():'')+'</div>'
          +'<div style="color:'+(correct?'#059669':'#dc2626')+';font-weight:600;">'+(badge?badge.textContent.trim():(correct?'✓ Correct':'✗ Incorrect'))+'</div>';
        mcqDetail.appendChild(div);
      });
    }
  }
}

/* ══════════════════════════════════════════════════════════
   SECTION — MODAL KEYBOARD TRAP
══════════════════════════════════════════════════════════ */
document.addEventListener('keydown', function(e) {
  if(e.key==='Escape') { closeCatModal(); }
});

/* ══════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  SCORM.initialize();
  updateProgressBar(1);
  dndInitCards();
  seqInit();
  renderMCQ();

  window.addEventListener('beforeunload', function () {
    if(SCORM.isInitialized()) SCORM.finish('incomplete', null);
  });
});
