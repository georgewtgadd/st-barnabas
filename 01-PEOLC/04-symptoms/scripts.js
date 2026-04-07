/* ══════════════════════════════════════════════════════════
   ST BARNABAS HOSPICE — Package 4: Symptom Management
   js/scripts.js
══════════════════════════════════════════════════════════ */

/* ── SCORM STUB (non-blocking standalone mode) ── */
var SCORM = (function () {
  var _api = null, _init = false;
  function _find(w) { var n=0; while(!w.API&&w.parent&&w.parent!==w){if(++n>7)return null;w=w.parent;} return w.API||null; }
  function initialize() { _api=_find(window); if(!_api&&window.opener)_api=_find(window.opener); if(!_api)return false; if(_api.LMSInitialize('')){_init=true;_api.LMSSetValue('cmi.core.lesson_status','incomplete');_api.LMSCommit('');} return _init; }
  function setValue(e,v){if(_init&&_api)_api.LMSSetValue(e,String(v));}
  function commit(){if(_init&&_api)_api.LMSCommit('');}
  function finish(status){if(_init&&_api){_api.LMSSetValue('cmi.core.lesson_status',status||'completed');_api.LMSCommit('');_api.LMSFinish('');}}
  function saveBookmark(n){setValue('cmi.core.lesson_location',String(n));commit();}
  return {initialize,setValue,commit,finish,saveBookmark,isInitialized:()=>_init};
}());

/* ── NAVIGATION ── */
var visited = new Set([1]);
var TOTAL_PAGES = 11;

function updateProgressBar(num) {
  var pct = Math.round(((num-1)/(TOTAL_PAGES-1))*100);
  var fill = document.getElementById('progress-fill');
  var lbl  = document.getElementById('progress-label');
  if(fill) fill.style.width = pct+'%';
  if(lbl)  { lbl.textContent = pct+'% complete'; var bar=lbl.closest('.module-progress-bar'); if(bar)bar.setAttribute('aria-valuenow',pct); }
}

function goToPage(num) {
  visited.add(num);
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  var page = document.getElementById('page-'+num);
  if(page) page.classList.add('active');

  for(var i=1;i<=TOTAL_PAGES;i++){
    var step = document.getElementById('nav-'+i);
    if(!step) continue;
    step.classList.remove('current','done');
    step.removeAttribute('aria-current');
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
══════════════════════════════════════════════════════════ */
var _dragId = null;

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.dnd-card').forEach(function(card) {
    card.addEventListener('dragstart', function(e) {
      _dragId = this.id;
      this.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', function() {
      this.classList.remove('dragging');
    });
    // Keyboard support
    card.addEventListener('keydown', function(e) {
      if(e.key==='Enter'||e.key===' ') {
        e.preventDefault();
        var cat = this.dataset.category;
        var zone = cat==='breathlessness'?'breathlessness':'secretions';
        dropCardById(this.id, zone);
      }
    });
  });
});

function allowDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

document.addEventListener('dragleave', function(e) {
  if(e.target.classList && e.target.classList.contains('dnd-zone')) {
    e.target.classList.remove('drag-over');
  }
});

function dropCard(e, zone) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if(!_dragId) return;
  dropCardById(_dragId, zone);
  _dragId = null;
}

function dropCardById(cardId, zone) {
  var card = document.getElementById(cardId);
  if(!card || card.classList.contains('placed')) return;

  var droppedArea = document.getElementById('dropped-'+zone);
  if(!droppedArea) return;

  // Clone into zone
  var clone = card.cloneNode(true);
  clone.draggable = false;
  clone.style.cursor = 'default';
  clone.removeAttribute('id');
  droppedArea.appendChild(clone);

  // Mark original as placed
  card.classList.add('placed');
  document.getElementById('dnd-feedback').textContent = '';
  document.getElementById('dnd-feedback').className = 'dnd-feedback';
}

function checkDnD() {
  var bCards = document.querySelectorAll('#dropped-breathlessness .dnd-card');
  var sCards = document.querySelectorAll('#dropped-secretions .dnd-card');
  var allPlaced = document.querySelectorAll('.dnd-card.placed').length;

  if(allPlaced < 6) {
    var fb = document.getElementById('dnd-feedback');
    fb.textContent = '⚠️ Please place all 6 intervention cards before checking.';
    fb.className = 'dnd-feedback show-wrong';
    return;
  }

  var correct = 0, total = 0;
  bCards.forEach(function(c) {
    total++;
    if(c.dataset.category === 'breathlessness') { correct++; c.classList.add('correct-placed'); }
    else { c.classList.add('wrong-placed'); }
  });
  sCards.forEach(function(c) {
    total++;
    if(c.dataset.category === 'secretions') { correct++; c.classList.add('correct-placed'); }
    else { c.classList.add('wrong-placed'); }
  });

  var fb = document.getElementById('dnd-feedback');
  if(correct === 6) {
    fb.innerHTML = '✅ <strong>All correct!</strong> Fan therapy, calm reassurance, and upright positioning help breathlessness. Side-lying, family education, and mouth care address terminal secretions.';
    fb.className = 'dnd-feedback show-correct';
    window._dndScore = 6;
  } else {
    fb.innerHTML = '❌ ' + correct + '/6 correct. Any red cards have been placed in the wrong column — review and try again.';
    fb.className = 'dnd-feedback show-wrong';
    window._dndScore = correct;
  }
}

function resetDnD() {
  document.getElementById('dropped-breathlessness').innerHTML = '';
  document.getElementById('dropped-secretions').innerHTML = '';
  document.querySelectorAll('.dnd-card').forEach(function(c) {
    c.classList.remove('placed','correct-placed','wrong-placed','dragging');
  });
  var fb = document.getElementById('dnd-feedback');
  fb.textContent = '';
  fb.className = 'dnd-feedback';
  window._dndScore = null;
}

/* ══════════════════════════════════════════════════════════
   PAGE 4 — CATEGORISATION
══════════════════════════════════════════════════════════ */
var _catAnswers = {};

function catAnswer(cardId, answer, btn) {
  var card = document.getElementById(cardId);
  if(!card || _catAnswers[cardId]) return; // already answered

  var correct = card.dataset.answer;
  var isRight = (answer === correct);
  _catAnswers[cardId] = answer;

  // Style the clicked button
  btn.classList.add(answer==='expected' ? 'btn-expected' : 'btn-emergency');

  // Disable both buttons
  card.querySelectorAll('.cat-btn').forEach(function(b){ b.disabled=true; });

  // Card border
  card.classList.add(isRight ? 'answered-'+correct : 'answered-'+(correct==='expected'?'emergency':'expected'));

  // Result text
  var result = document.getElementById(cardId+'-result');
  if(result) {
    result.className = 'cat-result ' + (isRight?'correct':'wrong');
    if(isRight) {
      result.textContent = '✓ Correct — '+correct.charAt(0).toUpperCase()+correct.slice(1)+' deterioration';
    } else {
      result.textContent = '✗ This is a '+correct+' condition requiring urgent action';
    }
  }

  // Update score
  updateCatScore();
}

function updateCatScore() {
  var total = document.querySelectorAll('.cat-card').length;
  var answered = Object.keys(_catAnswers).length;
  var correct = 0;
  document.querySelectorAll('.cat-card').forEach(function(card) {
    if(_catAnswers[card.id] === card.dataset.answer) correct++;
  });

  var scoreEl = document.getElementById('cat-score');
  if(answered === total) {
    scoreEl.textContent = '✓ Complete: '+correct+'/'+total+' correct. '+(correct===total?'Excellent — you correctly identified all categories!':'Review the conditions you missed before continuing.');
    window._catScore = correct+'/'+total;
  } else {
    scoreEl.textContent = answered+'/'+total+' answered';
  }
}

/* ══════════════════════════════════════════════════════════
   PAGE 5 — ABC SEQUENCE
══════════════════════════════════════════════════════════ */
var _abcSelected = [];
var _abcCorrectOrder = ['A','B','C'];

function selectABC(card) {
  if(card.classList.contains('placed')) return;
  if(_abcSelected.length >= 3) return;

  var label = card.dataset.label;
  _abcSelected.push({label:label, title:card.querySelector('.abc-step-title').textContent, order:parseInt(card.dataset.order)});
  card.classList.add('placed');

  var idx = _abcSelected.length - 1;
  var slot = document.getElementById('abc-slot-'+idx);
  if(slot) {
    slot.textContent = label + ' — ' + card.querySelector('.abc-step-title').textContent;
    slot.classList.add('filled');
  }
}

function checkABC() {
  if(_abcSelected.length < 3) {
    var fb = document.getElementById('abc-feedback');
    fb.textContent = '⚠️ Please select all three steps before checking.';
    fb.className = 'abc-feedback show-wrong';
    return;
  }

  var correct = true;
  _abcSelected.forEach(function(item, idx) {
    var slot = document.getElementById('abc-slot-'+idx);
    var expectedLabel = _abcCorrectOrder[idx];
    if(item.label !== expectedLabel) {
      correct = false;
      if(slot) { slot.classList.remove('filled'); slot.classList.add('wrong'); }
    } else {
      if(slot) { slot.classList.remove('filled'); slot.classList.add('correct'); }
    }
  });

  var fb = document.getElementById('abc-feedback');
  if(correct) {
    fb.innerHTML = '✅ <strong>Perfect!</strong> A → Assure, B → Be There, C → Comfort/Cover/Call. This sequence maintains the patient\'s dignity and reduces panic in an extremely distressing situation.';
    fb.className = 'abc-feedback show-correct';
    window._abcResult = 'Correct — A→B→C sequence';
  } else {
    fb.innerHTML = '❌ Not quite. The correct order is: <strong>A (Assure) → B (Be There) → C (Comfort, Cover & Call)</strong>. Your calm presence comes first; clinical actions follow.';
    fb.className = 'abc-feedback show-wrong';
    window._abcResult = 'Incorrect — reviewed';
  }
}

function resetABC() {
  _abcSelected = [];
  document.querySelectorAll('.abc-step-card').forEach(function(c){
    c.classList.remove('placed','selected');
  });
  ['abc-slot-0','abc-slot-1','abc-slot-2'].forEach(function(id,i){
    var el = document.getElementById(id);
    if(el){ el.textContent = (i===0?'1st':i===1?'2nd':'3rd'); el.className='abc-slot'; }
  });
  var fb = document.getElementById('abc-feedback');
  fb.textContent = ''; fb.className = 'abc-feedback';
}

/* ══════════════════════════════════════════════════════════
   PAGE 6 — HYPERCALCAEMIA CLICK REVEAL
══════════════════════════════════════════════════════════ */
function toggleHC(id) {
  var card = document.getElementById(id);
  var body = document.getElementById(id+'-body');
  var hint = document.getElementById(id+'-hint');
  if(!card||!body) return;
  var open = card.getAttribute('aria-expanded')==='true';
  card.setAttribute('aria-expanded', open?'false':'true');
  body.classList.toggle('show', !open);
  if(hint) hint.style.display = open?'':'none';
}

/* ══════════════════════════════════════════════════════════
   PAGE 8 — SVCO DIAGRAM
══════════════════════════════════════════════════════════ */
function showSVCO(num) {
  document.querySelectorAll('.svco-panel').forEach(function(p){ p.style.display='none'; });
  var panel = document.getElementById('svco-'+num);
  if(panel) panel.style.display='block';
}

/* ══════════════════════════════════════════════════════════
   PAGE 9 — SEIZURE SEQUENCE
══════════════════════════════════════════════════════════ */
var _seqSelected = [];
var _seqCorrectOrder = [1,2,3,4]; // data-order values

function selectSeq(card) {
  if(card.classList.contains('seq-placed')) return;
  if(_seqSelected.length >= 4) return;

  var order = parseInt(card.dataset.order);
  _seqSelected.push({order:order, title:card.querySelector('.seq-title').textContent});
  card.classList.add('seq-placed');

  var idx = _seqSelected.length - 1;
  var slot = document.getElementById('seq-slot-'+idx);
  if(slot) {
    slot.innerHTML = '<strong style="color:var(--blue);margin-right:8px;">'+(idx+1)+'.</strong><span>'+card.querySelector('.seq-title').textContent+'</span>';
    slot.classList.remove('empty');
  }
  card.querySelector('.seq-num').textContent = idx+1;
}

function checkSeq() {
  if(_seqSelected.length < 4) {
    var fb = document.getElementById('seq-feedback');
    fb.textContent = '⚠️ Please select all four steps before checking.';
    fb.className = 'seq-feedback show-wrong';
    return;
  }

  var correct = true;
  _seqSelected.forEach(function(item, idx) {
    var slot = document.getElementById('seq-slot-'+idx);
    if(item.order !== _seqCorrectOrder[idx]) {
      correct = false;
      if(slot) slot.classList.add('wrong');
    } else {
      if(slot) slot.classList.add('correct');
    }
  });

  var fb = document.getElementById('seq-feedback');
  if(correct) {
    fb.innerHTML = '✅ <strong>Correct sequence!</strong> 1. Safe environment/Airway → 2. Check BM → 3. Administer Buccal Midazolam → 4. Monitor & seek advice. This ensures patient safety and rules out treatable causes before giving medication.';
    fb.className = 'seq-feedback show-correct';
    window._seqResult = 'Correct order';
  } else {
    fb.innerHTML = '❌ Not quite. Correct order: <strong>1. Safe environment/Airway → 2. Check BM (exclude hypoglycaemia) → 3. Administer Buccal Midazolam → 4. Monitor & seek specialist advice.</strong>';
    fb.className = 'seq-feedback show-wrong';
    window._seqResult = 'Incorrect — reviewed';
  }
}

function resetSeq() {
  _seqSelected = [];
  document.querySelectorAll('.seq-card').forEach(function(c){
    c.classList.remove('seq-placed');
    c.querySelector('.seq-num').textContent = '?';
  });
  for(var i=0;i<4;i++){
    var slot = document.getElementById('seq-slot-'+i);
    if(slot){ slot.innerHTML='<span>Step '+(i+1)+'</span>'; slot.className='seq-slot empty'; }
  }
  var fb = document.getElementById('seq-feedback');
  fb.textContent=''; fb.className='seq-feedback';
}

/* ══════════════════════════════════════════════════════════
   PAGE 10 — RAPID FIRE FLIP CARDS
══════════════════════════════════════════════════════════ */
var _rfFlipped = new Set();

function flipRF(card) {
  card.classList.toggle('flipped');
  if(card.classList.contains('flipped')) {
    _rfFlipped.add(card);
  }
  if(_rfFlipped.size >= 3) {
    var complete = document.getElementById('rf-complete');
    if(complete) complete.style.display = 'block';
  }
}

/* ══════════════════════════════════════════════════════════
   PAGE 11 — LEARNING RECORD
══════════════════════════════════════════════════════════ */
function populateLearningRecord() {
  // Date
  var d = new Date();
  var el = document.getElementById('record-date');
  if(el) el.textContent = d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});

  // DnD
  var dnd = document.getElementById('record-dnd');
  if(dnd) {
    if(window._dndScore != null) {
      dnd.innerHTML = window._dndScore===6
        ? '<strong style="color:#059669;">✓ 6/6 correct</strong> — All interventions correctly matched to Breathlessness and Terminal Secretions'
        : '<strong>'+window._dndScore+'/6 correct</strong> — Activity completed';
    } else {
      dnd.textContent = 'Activity not submitted.';
    }
  }

  // Cat score
  var cat = document.getElementById('record-cat');
  if(cat) cat.textContent = window._catScore ? window._catScore+' — Emergency identification categorisation' : 'Activity not completed.';

  // ABC
  var abc = document.getElementById('record-abc');
  if(abc) abc.textContent = window._abcResult || 'Activity not completed.';

  // Seq
  var seq = document.getElementById('record-seq');
  if(seq) seq.textContent = window._seqResult || 'Activity not completed.';
}

function finishModule() {
  SCORM.finish('completed');
  // Flash a simple congratulations
  var overlay = document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:rgba(10,20,48,.94);z-index:9999;display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML='<div style="background:linear-gradient(160deg,#0f1c34,#1a3466);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:48px 40px;max-width:460px;width:90%;text-align:center;"><div style="font-size:3rem;margin-bottom:16px;">🎓</div><div style="font-size:.68rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#fdca0f;margin-bottom:10px;">Module Complete</div><h2 style="font-family:Merriweather,serif;font-size:1.6rem;color:#fff;margin-bottom:12px;">Well done!</h2><p style="font-size:.9rem;color:rgba(255,255,255,.7);line-height:1.75;margin-bottom:28px;">Package 4 complete. Your learning record has been saved. Export your record as PDF to submit as evidence.</p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;"><button onclick="this.closest(\'div[style]\').remove();goToPage(11);" style="padding:10px 22px;background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:8px;font-family:DM Sans,sans-serif;font-weight:600;cursor:pointer;">📄 View My Record</button><button onclick="this.closest(\'div[style]\').remove();" style="padding:10px 22px;background:#fdca0f;color:#22417e;border:none;border-radius:8px;font-family:DM Sans,sans-serif;font-weight:700;cursor:pointer;">Close</button></div></div>';
  document.body.appendChild(overlay);
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', function() {
  SCORM.initialize();
  updateProgressBar(1);

  window.addEventListener('beforeunload', function() {
    if(SCORM.isInitialized()) SCORM.finish('incomplete');
  });
});
