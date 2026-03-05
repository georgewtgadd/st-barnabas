/* ══════════════════════════════════════════════════════════
   ST BARNABAS HOSPICE — Deterioration & Recognition
   js/scripts.js  ·  SCORM 1.2  ·  v3 (11-page rebuild)
══════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════
   SECTION 1 — SCORM 1.2 API WRAPPER
══════════════════════════════════════════════════════════ */
var SCORM = (function () {
  'use strict';
  var _api = null, _initialized = false, _finished = false, _sessionStart = Date.now();

  function _findAPI(win) {
    var n = 0;
    while (!win.API && win.parent && win.parent !== win) { if (++n > 7) return null; win = win.parent; }
    return win.API || null;
  }
  function _getAPI() {
    var a = _findAPI(window);
    if (!a && window.opener && window.opener !== window) a = _findAPI(window.opener);
    return a;
  }
  function initialize() {
    if (_initialized || _finished) return false;
    _api = _getAPI();
    if (!_api) { console.info('[SCORM] standalone mode'); return false; }
    if (_api.LMSInitialize('') === 'true' || _api.LMSInitialize('') === true) {
      _initialized = true; _sessionStart = Date.now();
      setValue('cmi.core.lesson_status','incomplete');
      setValue('cmi.core.score.min','0'); setValue('cmi.core.score.max','100');
      commit(); return true;
    }
    console.warn('[SCORM] LMSInitialize failed'); return false;
  }
  function setValue(el, val) {
    if (!_initialized || _finished || !_api) return false;
    return _api.LMSSetValue(el, String(val)) === 'true' || _api.LMSSetValue(el, String(val)) === true;
  }
  function getValue(el) { return (!_initialized || _finished || !_api) ? '' : _api.LMSGetValue(el); }
  function commit() {
    if (!_initialized || _finished || !_api) return false;
    return _api.LMSCommit('') === 'true' || _api.LMSCommit('') === true;
  }
  function _fmt(ms) {
    var t=Math.floor(ms/1000),h=Math.floor(t/3600),m=Math.floor((t%3600)/60),s=t%60;
    return (h<10?'0':'')+h+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s;
  }
  function finish(status, score) {
    if (_finished || !_initialized || !_api) return false;
    setValue('cmi.core.session_time', _fmt(Date.now()-_sessionStart));
    if (status != null) setValue('cmi.core.lesson_status', status);
    if (score  != null) setValue('cmi.core.score.raw', String(Math.round(score)));
    commit(); _api.LMSFinish(''); _finished = true; return true;
  }
  function saveBookmark(n) { setValue('cmi.core.lesson_location',String(n)); setValue('cmi.suspend_data',JSON.stringify({page:n})); commit(); }
  function getBookmark() {
    try { var d=JSON.parse(getValue('cmi.suspend_data')); return d.page||1; } catch(e){}
    var l=parseInt(getValue('cmi.core.lesson_location'),10); return isNaN(l)?1:l;
  }
  return { initialize, setValue, getValue, commit, finish, saveBookmark, getBookmark, isInitialized:()=>_initialized };
}());


/* ══════════════════════════════════════════════════════════
   SECTION 2 — PAGE NAVIGATION  (11 pages)
══════════════════════════════════════════════════════════ */
var visited = new Set([1]);
var TOTAL_PAGES = 12;

function updateProgressBar(num) {
  var pct  = Math.round(((num-1)/(TOTAL_PAGES-1))*100);
  var fill = document.getElementById('progress-fill');
  var lbl  = document.getElementById('progress-label');
  if (fill) fill.style.width = pct+'%';
  if (lbl)  { lbl.textContent = pct+'% complete'; var bar=lbl.closest('.module-progress-bar'); if(bar) bar.setAttribute('aria-valuenow',pct); }
}

function goToPage(num) {
  visited.add(num);
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  var page = document.getElementById('page-'+num);
  if (page) page.classList.add('active');
  for (var i=1; i<=TOTAL_PAGES; i++) {
    var step = document.getElementById('nav-'+i);
    if (!step) continue;
    step.classList.remove('current','done'); step.removeAttribute('aria-current');
    if (i===num) { step.classList.add('current'); step.setAttribute('aria-current','step'); step.disabled=false; }
    else if (visited.has(i)) { step.classList.add('done'); step.disabled=false; }
    else { step.disabled=true; }
  }
  updateProgressBar(num);
  window.scrollTo({top:0,behavior:'smooth'});
  var h = page && page.querySelector('h1,h2');
  if (h) { h.setAttribute('tabindex','-1'); h.focus(); }
  SCORM.saveBookmark(num);
  if (SCORM.isInitialized()) {
    var cur=SCORM.getValue('cmi.core.lesson_status');
    if (cur!=='passed'&&cur!=='failed') { SCORM.setValue('cmi.core.lesson_status','incomplete'); SCORM.commit(); }
  }
}

function navClick(num) { if (visited.has(num)) goToPage(num); }


/* ══════════════════════════════════════════════════════════
   SECTION 3 — PAGE 3: PDF TOOL VIEWER
══════════════════════════════════════════════════════════ */
var _currentPigPage = 1;

/* Per-image zoom state: imgId → zoom % (100 = 100%) */
var _zoomState = {};
var _ZOOM_STEP = 25;   /* percent per click  */
var _ZOOM_MIN  = 75;
var _ZOOM_MAX  = 300;

/*
 * zoomDoc(imgId, direction)
 *   imgId     — id of the <img> element
 *   direction — +1 = zoom in, -1 = zoom out
 *
 * Strategy: zoom by changing the width of .pdfv-scroll-inner (the inner
 * wrapper). Because .pdfv-scroll-outer has overflow:auto, the browser
 * gives us scrollbars automatically once the content is wider/taller
 * than the viewport. The image itself stays width:100% of its parent,
 * so it fills whatever size we set.
 */
function zoomDoc(imgId, direction) {
  var img   = document.getElementById(imgId);
  if (!img) return;
  var inner = img.parentElement;           /* .pdfv-scroll-inner  */
  var outer = inner && inner.parentElement;/* .pdfv-scroll-outer  */
  if (!inner || !outer) return;

  var current = _zoomState[imgId] || 100;
  var next    = current + direction * _ZOOM_STEP;
  next = Math.max(_ZOOM_MIN, Math.min(_ZOOM_MAX, next));
  _zoomState[imgId] = next;

  /* Drive zoom by setting inner width as % of outer's clientWidth */
  if (next === 100) {
    inner.style.width = '';          /* let CSS min-width:100% take over */
  } else {
    inner.style.width = next + '%';
  }

  /* Update the level badge  e.g. "spict-img" → "spict-level" */
  var levelId = imgId.replace('-img', '-level');
  var levelEl = document.getElementById(levelId);
  if (levelEl) levelEl.textContent = next + '%';
}

function zoomReset(imgId) {
  var img   = document.getElementById(imgId);
  if (!img) return;
  var inner = img.parentElement;
  if (inner) inner.style.width = '';
  _zoomState[imgId] = 100;

  var levelId = imgId.replace('-img', '-level');
  var levelEl = document.getElementById(levelId);
  if (levelEl) levelEl.textContent = '100%';

  /* Scroll back to top-left */
  var outer = inner && inner.parentElement;
  if (outer) { outer.scrollTop = 0; outer.scrollLeft = 0; }
}

function showPdfTool(id) {
  document.querySelectorAll('.pdfv-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.pdfv-tab').forEach(t => {
    t.classList.remove('active'); t.setAttribute('aria-selected','false');
  });
  var panel = document.getElementById('ppanel-'+id);
  var tab   = document.getElementById('ptab-'+id);
  if (panel) panel.classList.add('active');
  if (tab)   { tab.classList.add('active'); tab.setAttribute('aria-selected','true'); }

  /* Reset zoom on all images in this panel */
  if (panel) {
    panel.querySelectorAll('.pdfv-img').forEach(function(img) {
      if (img.id) zoomReset(img.id);
    });
  }
}

function pigPage(pageNum) {
  _currentPigPage = pageNum;
  var img  = document.getElementById('pig-img');
  var ind  = document.getElementById('pig-indicator');
  var prev = document.getElementById('pig-prev');
  var next = document.getElementById('pig-next');
  if (img)  img.src = 'images/tools/pig'+(pageNum===1?'1':'2')+'.jpg';
  if (img)  img.alt = 'PIG Tool — GSF Proactive Identification Guidance page '+pageNum;
  if (ind)  ind.textContent = pageNum+' / 2';
  if (prev) prev.disabled = (pageNum===1);
  if (next) next.disabled = (pageNum===2);
  /* Reset zoom when turning pages */
  if (img && img.id) zoomReset(img.id);
}


/* ══════════════════════════════════════════════════════════
   SECTION 4 — PAGE 4: HORIZONTAL TIMELINE
══════════════════════════════════════════════════════════ */
function showPhase(phase) {
  // Update nodes
  ['months','days','hours'].forEach(function(p) {
    var node = document.getElementById('htl-'+p);
    if (node) { node.classList.remove('active'); node.setAttribute('aria-pressed','false'); }
    var content = document.getElementById('htl-content-'+p);
    if (content) content.classList.remove('active');
  });
  var node = document.getElementById('htl-'+phase);
  if (node) { node.classList.add('active'); node.setAttribute('aria-pressed','true'); }
  var content = document.getElementById('htl-content-'+phase);
  if (content) content.classList.add('active');
}


/* ══════════════════════════════════════════════════════════
   SECTION 5 — PAGE 6: TRAJECTORIES OF DYING
══════════════════════════════════════════════════════════ */
function showTraj(traj) {
  // Update select buttons
  document.querySelectorAll('.traj-select-btn').forEach(function(b) {
    b.classList.remove('active-cancer','active-organ','active-frailty');
    b.setAttribute('aria-pressed','false');
  });
  document.querySelectorAll('.traj-detail').forEach(function(d) { d.classList.remove('active'); });

  var btn  = document.getElementById('tbtn-'+traj);
  var det  = document.getElementById('tdet-'+traj);
  var cls  = traj==='cancer'?'active-cancer':traj==='organ'?'active-organ':'active-frailty';
  if (btn) { btn.classList.add(cls); btn.setAttribute('aria-pressed','true'); }
  if (det) det.classList.add('active');
}


/* ══════════════════════════════════════════════════════════
   SECTION 6 — CASE STUDY REVEAL ANSWERS
══════════════════════════════════════════════════════════ */
function toggleVabReveal(id) {
  var el  = document.getElementById(id);
  var btn = el && el.previousElementSibling;
  if (!el) return;
  var showing = el.classList.contains('show');
  el.classList.toggle('show');
  if (btn && btn.classList.contains('vab-reveal-btn')) {
    btn.textContent = showing ? '🔍 Reveal suggested answer' : '🔼 Hide answer';
  }
}

function toggleReveal(id) {
  var el  = document.getElementById(id);
  var btn = el && el.previousElementSibling;
  if (!el) return;
  var showing = el.classList.contains('show');
  el.classList.toggle('show');
  if (btn && btn.classList.contains('cab-reveal-btn')) {
    btn.textContent = showing ? '🔍 Reveal suggested answer' : '🔼 Hide answer';
  }
}


/* ══════════════════════════════════════════════════════════
   SECTION 7 — PAGE 9: MCQ
══════════════════════════════════════════════════════════ */
var _mcqData = [
  /* Q1 — Clinical Prioritization */
  {
    question: 'Bob reports worsening pain, breathlessness at rest, and has not opened his bowels for several days. Which of the following should be your immediate clinical suspicion regarding the link between these symptoms?',
    options: [
      { letter:'A', text:'Opioid-induced constipation is likely exacerbating his nausea and causing abdominal distension, which worsens his breathlessness.', correct:true },
      { letter:'B', text:'The breathlessness is purely anxiety-related due to his fear of dying.', correct:false },
      { letter:'C', text:'His lack of appetite is the primary cause of his constipation.', correct:false },
      { letter:'D', text:'The pain is unrelated to his bowel habits and should be treated with increased oral morphine immediately.', correct:false }
    ],
    rationale: 'In palliative care, we look for symptom clusters. Opioids cause constipation — if Bob hasn\'t moved his bowels in days, he will feel nauseous and full. This "fullness" pushes up on the diaphragm, making it harder to breathe. Addressing the constipation often improves the nausea and breathlessness. Option D is dangerous — giving more morphine to someone already constipated without a laxative plan will worsen the nausea and distension.'
  },
  /* Q2 — Existential Distress */
  {
    question: 'Bob says, "I\'m scared… I think I\'m going to die. And I think I\'m going to be on my own when it happens." What is the most therapeutic initial response?',
    options: [
      { letter:'A', text:'"Don\'t be silly, Bob, the nurses are here around the clock."', correct:false },
      { letter:'B', text:'"We have excellent medications that will make sure you aren\'t in pain when the time comes."', correct:false },
      { letter:'C', text:'(Silence / holding his hand) "It sounds like you\'ve been thinking about this a lot. Can you tell me more about what scares you the most?"', correct:true },
      { letter:'D', text:'"I\'ll go and call your son right now so you won\'t be alone."', correct:false }
    ],
    rationale: 'This is an open-ended, validating response. When a patient says "I think I\'m going to die," they aren\'t usually looking for medical denial — they are looking for a safe space to voice their fear. By asking "what scares you most?" you allow Bob to lead the conversation.\n\nOption A is dismissive reassurance — it shuts Bob down. Option B ignores his emotional pain to focus on physical medications. Option D is premature — Bob hasn\'t spoken to his son in four years, so calling him without a plan could cause more trauma.'
  },
  /* Q3 — Total Pain / Dog */
  {
    question: 'Bob is visibly distressed about his dog. In palliative care, addressing this "total pain" is a priority. Which action best supports Bob\'s psychological well-being?',
    options: [
      { letter:'A', text:'Tell him not to worry about the dog and focus on his breathing.', correct:false },
      { letter:'B', text:'Suggest he gives the dog away now to save him the stress later.', correct:false },
      { letter:'C', text:'Offer to contact a specialist charity (like the Cinnamon Trust) or a local contact to create a formal pet care plan.', correct:true },
      { letter:'D', text:'Remind him that the hospital/hospice doesn\'t allow animals, so he needs to find a kennel.', correct:false }
    ],
    rationale: 'This addresses "Total Pain." To Bob, the dog is not just a pet — it\'s a family member and a source of significant guilt. By involving a specialist charity like the Cinnamon Trust, you provide a concrete solution that reduces physiological stress, which in turn can lower perceived pain and breathlessness.\n\nOptions A and B ignore the profound bond between humans and animals, which is often the most important thing to a patient in their final days.'
  },
  /* Q4 — Coordination of care */
  {
    question: 'Bob expresses a wish to "sort things out" with his estranged son. Who is the least appropriate person to involve in this specific coordination?',
    options: [
      { letter:'A', text:'The Palliative Care Social Worker.', correct:false },
      { letter:'B', text:'The GP or Lead Consultant (for medical prognosis to time the conversation).', correct:false },
      { letter:'C', text:'The Hospital Chaplain or Spiritual Care Lead.', correct:false },
      { letter:'D', text:'The Night Pharmacist.', correct:true }
    ],
    rationale: 'While the pharmacist is vital for Bob\'s physical comfort (medications), they have no clinical or professional role in mediating family estrangement or addressing spiritual "unfinished business."\n\nThe Social Worker and Chaplain can facilitate the difficult conversation with the son. The GP/Consultant provides the prognosis so the family understands the urgency. All three are gold-standard MDT members for this situation.'
  }
];

// Shuffle array in place (Fisher-Yates)
function _shuffle(arr) {
  for (var i=arr.length-1; i>0; i--) {
    var j=Math.floor(Math.random()*(i+1));
    var tmp=arr[i]; arr[i]=arr[j]; arr[j]=tmp;
  }
  return arr;
}

var _mcqAnswers = [];   // { selected: null|idx, correct: bool, answered: bool }
var _mcqCurrent = 0;
var _mcqShuffled = []; // each question has options already shuffled

function renderMCQ() {
  _mcqAnswers = _mcqData.map(function() { return { selected:null, correct:false, answered:false }; });
  _mcqCurrent = 0;

  // Shuffle options within each question (keep a 'origIndex' for correct tracking)
  _mcqShuffled = _mcqData.map(function(q) {
    var opts = q.options.map(function(o,i) { return { text:o.text, correct:o.correct, letter:o.letter }; });
    _shuffle(opts);
    return { question:q.question, options:opts, rationale:q.rationale };
  });

  // Render dots
  var dots = document.getElementById('mcq-dots');
  if (dots) {
    dots.innerHTML = _mcqShuffled.map(function(_,i) {
      return '<div class="mcq-dot" id="mdot-'+i+'" aria-hidden="true"></div>';
    }).join('');
  }

  // Render question cards
  var container = document.getElementById('mcq-questions-container');
  if (!container) return;
  container.innerHTML = _mcqShuffled.map(function(q, qi) {
    var optHtml = q.options.map(function(opt, oi) {
      var letters = ['A','B','C','D'];
      return '<div class="mcq-option" id="mopt-'+qi+'-'+oi+'" role="button" tabindex="0" '
        +'onclick="selectOption('+qi+','+oi+')" '
        +'onkeydown="if(event.key===\'Enter\'||event.key===\' \')selectOption('+qi+','+oi+')" '
        +'aria-label="Option '+letters[oi]+': '+opt.text.replace(/"/g,'&quot;')+'">'
        +'<div class="mcq-option-letter">'+letters[oi]+'</div>'
        +opt.text
        +'</div>';
    }).join('');
    return '<div class="mcq-q-card'+(qi===0?' active':'')+'" id="mqcard-'+qi+'">'
      +'<div class="mcq-q-header"><div class="mcq-q-num">Question '+(qi+1)+' of '+_mcqShuffled.length+'</div>'
      +'<div class="mcq-q-text">'+q.question+'</div></div>'
      +'<div class="mcq-options">'+optHtml+'</div>'
      +'<div class="mcq-submit-row">'
        +'<div class="mcq-nav-row">'
          +(qi>0?'<button class="btn btn-secondary" style="font-size:0.82rem;padding:10px 18px;color:var(--navy);border-color:rgba(34,65,126,0.3);" onclick="showMCQCard('+(qi-1)+')">← Prev</button>':'')
        +'</div>'
        +'<button class="mcq-submit-btn" id="msubmit-'+qi+'" onclick="submitAnswer('+qi+')" disabled>Submit Answer</button>'
        +'<div class="mcq-nav-row">'
          +(qi<_mcqShuffled.length-1?'<button class="btn btn-secondary" id="mnext-'+qi+'" style="font-size:0.82rem;padding:10px 18px;color:var(--navy);border-color:rgba(34,65,126,0.3);display:none;" onclick="showMCQCard('+(qi+1)+')">Next →</button>':'')
          +(qi===_mcqShuffled.length-1?'<button class="btn btn-primary" id="mresults-'+qi+'" style="display:none;background:var(--navy);color:var(--white);border-color:var(--navy);" onclick="showMCQResults()">See Results →</button>':'')
        +'</div>'
      +'</div>'
      +'<div class="mcq-feedback" id="mfb-'+qi+'" role="alert" aria-live="polite"></div>'
      +'</div>';
  }).join('');
}

function selectOption(qi, oi) {
  if (_mcqAnswers[qi] && _mcqAnswers[qi].answered) return;
  // Deselect all options for this question
  for (var i=0; i<4; i++) {
    var opt = document.getElementById('mopt-'+qi+'-'+i);
    if (opt) opt.classList.remove('selected');
  }
  // Select clicked
  var el = document.getElementById('mopt-'+qi+'-'+oi);
  if (el) el.classList.add('selected');
  _mcqAnswers[qi].selected = oi;
  // Enable submit
  var submit = document.getElementById('msubmit-'+qi);
  if (submit) submit.disabled = false;
}

function submitAnswer(qi) {
  if (!_mcqAnswers[qi] || _mcqAnswers[qi].answered) return;
  var oi = _mcqAnswers[qi].selected;
  if (oi === null) return;

  _mcqAnswers[qi].answered = true;
  var q = _mcqShuffled[qi];
  var correct = q.options[oi].correct;
  _mcqAnswers[qi].correct = correct;

  // Lock all options + apply correct/incorrect styles
  for (var i=0; i<q.options.length; i++) {
    var opt = document.getElementById('mopt-'+qi+'-'+i);
    if (!opt) continue;
    opt.classList.add('locked');
    opt.setAttribute('tabindex','-1');
    if (q.options[i].correct)  opt.classList.add('correct');
    if (i===oi && !q.options[i].correct) opt.classList.add('incorrect');
  }

  // Update dot
  var dot = document.getElementById('mdot-'+qi);
  if (dot) { dot.classList.remove('answered'); dot.classList.add(correct?'correct':'incorrect'); }

  // Show feedback
  var fb = document.getElementById('mfb-'+qi);
  if (fb) {
    fb.className = 'mcq-feedback show '+(correct?'correct':'incorrect');
    fb.innerHTML = '<span class="mcq-feedback-badge">'+(correct?'✅ Correct':'❌ Incorrect')+'</span>'
      +'<p>'+q.rationale.replace(/\n/g,'</p><p style="margin-top:8px;"></p><p>')+'</p>';
  }

  // Disable submit, show next/results button
  var submit = document.getElementById('msubmit-'+qi);
  if (submit) submit.disabled = true;
  if (qi < _mcqShuffled.length-1) {
    var next = document.getElementById('mnext-'+qi);
    if (next) next.style.display = '';
  } else {
    var res = document.getElementById('mresults-'+qi);
    if (res) res.style.display = '';
  }
}

function showMCQCard(qi) {
  document.querySelectorAll('.mcq-q-card').forEach(c => c.classList.remove('active'));
  var card = document.getElementById('mqcard-'+qi);
  if (card) card.classList.add('active');
  _mcqCurrent = qi;
  window.scrollTo({top:0,behavior:'smooth'});
}

function showMCQResults() {
  document.querySelectorAll('.mcq-q-card').forEach(c => c.classList.remove('active'));
  var correctCount   = _mcqAnswers.filter(a => a.correct).length;
  var incorrectCount = _mcqAnswers.length - correctCount;
  var pct = Math.round((correctCount/_mcqAnswers.length)*100);
  var passed = pct >= 75;

  var icon, msg;
  if (pct===100) { icon='🌟'; msg='Outstanding! You answered every question correctly. You have a strong understanding of how to recognise, assess and respond to Bob\'s care needs.'; }
  else if (passed) { icon='✅'; msg='Well done — you scored '+correctCount+' out of '+_mcqAnswers.length+'. Review any questions you found challenging before moving on.'; }
  else { icon='📚'; msg='You scored '+correctCount+' out of '+_mcqAnswers.length+' ('+pct+'%). Review the rationale for each question and revisit the relevant sections before continuing.'; }

  var res = document.getElementById('mcq-results');
  if (!res) return;
  res.innerHTML = '<div class="mcq-results-icon">'+icon+'</div>'
    +'<div class="mcq-results-score">'+pct+'%</div>'
    +'<div class="mcq-results-label">'+(passed?'Passed — well done!':'Review recommended')+'</div>'
    +'<div class="mcq-results-breakdown">'
      +'<div class="mcq-result-stat"><div class="mcq-result-stat-num" style="color:#059669;">'+correctCount+'</div><div class="mcq-result-stat-lbl">Correct</div></div>'
      +'<div class="mcq-result-stat"><div class="mcq-result-stat-num" style="color:#dc2626;">'+incorrectCount+'</div><div class="mcq-result-stat-lbl">Incorrect</div></div>'
      +'<div class="mcq-result-stat"><div class="mcq-result-stat-num" style="color:var(--navy);">'+_mcqAnswers.length+'</div><div class="mcq-result-stat-lbl">Total</div></div>'
    +'</div>'
    +'<div class="mcq-results-msg">'+msg+'</div>'
    +'<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">'
      +'<button class="btn btn-secondary" style="color:var(--navy);border-color:rgba(34,65,126,0.3);" onclick="retryMCQ()">🔄 Retry Quiz</button>'
      +'<button class="btn btn-primary" style="background:var(--navy);color:var(--white);border-color:var(--navy);" onclick="goToPage(11)">Continue to Bob\'s Final Visit →</button>'
    +'</div>';
  res.classList.add('show');
  window.scrollTo({top:0,behavior:'smooth'});
  SCORM.finish(passed?'passed':'failed', pct);
}

function retryMCQ() {
  var res = document.getElementById('mcq-results');
  if (res) res.classList.remove('show');
  if (SCORM.isInitialized()) { SCORM.setValue('cmi.core.lesson_status','incomplete'); SCORM.commit(); }
  renderMCQ();
}


/* ══════════════════════════════════════════════════════════
   SECTION 8 — PAGE 11: FLIPCARDS
══════════════════════════════════════════════════════════ */
function flipCard(card) {
  card.classList.toggle('flipped');
  var flipped = card.classList.contains('flipped');
  var lbl = card.getAttribute('aria-label') || '';
  card.setAttribute('aria-label', lbl.replace(/ — click to flip.*$/,'') + (flipped?' — click to flip back':' — click to flip'));
}
/* ══════════════════════════════════════════════════════
   AKPS SLIDER — Page 9
══════════════════════════════════════════════════════ */
(function () {

  var SCORES = [10,20,30,40,50,60,70,80,90,100];

  var AKPS_DATA = {
    10:  { label:'Moribund',               sublabel:'Fatal processes progressing rapidly',                              cls:'pink',   icon:'🔴', title:'Moribund',                body:'Patient is actively dying. All Five Priorities of Care should be implemented immediately. Bob presenting as conversational at this score would be highly inconsistent.' },
    20:  { label:'Very sick',              sublabel:'Active supportive treatment necessary',                           cls:'red',    icon:'🔴', title:'End of life — hours/days', body:'Likely in the final weeks of life. Syringe driver and comfort care should be actively in place. Inconsistent with Bob walking to the door.' },
    30:  { label:'Severely disabled',      sublabel:'Hospitalisation indicated, death not imminent',                  cls:'red',    icon:'🔴', title:'Severely disabled',        body:'AKPS ≤30 is associated with a prognosis of weeks, not months. All anticipatory decisions should be documented and shared.' },
    40:  { label:'Disabled',               sublabel:'Requires special care and assistance',                           cls:'red',    icon:'🔴', title:'Significant decline',      body:'High care needs. Review syringe driver requirements and ensure out-of-hours team are briefed. Proactive family communication is essential.' },
    50:  { label:'Considerable assistance',sublabel:'Requires frequent medical care',                                 cls:'orange', icon:'⚠️', title:'Key clinical threshold',   body:'⚠️ AKPS ≤50 is a key threshold — consider referral to specialist palliative care. Bob\'s self-report of "fine" is clinically inconsistent with this score.' },
    60:  { label:'Occasional assistance',  sublabel:'Able to care for most personal needs',                          cls:'orange', icon:'⚠️', title:'Increasing dependency',    body:'Bob requires occasional help. Review medications and anticipatory care plan. His "plodding along" phrasing may be masking this level of need.' },
    70:  { label:'Limited self-care',      sublabel:'Cares for self; unable to carry on normal activity or work',    cls:'amber',  icon:'⚠️', title:'Functional decline present',body:'At AKPS 70, Bob is managing self-care but unable to work or sustain normal activity. His score is <strong>inconsistent with saying he is "fine"</strong> — this warrants probing.' },
    80:  { label:'Self-caring with effort',sublabel:'Some signs or symptoms of disease present',                     cls:'amber',  icon:'💛', title:'Mild-moderate decline',    body:'Managing independently but with effort. Consider initiating advance care planning and reviewing support needs at this visit.' },
    90:  { label:'Minor limitations',      sublabel:'Normal activity with effort, some symptoms',                    cls:'green',  icon:'✅', title:'Minor limitations',        body:'Minor symptoms present. Ensure routine symptom review continues and begin documenting preferences and goals of care.' },
    100: { label:'Fully active',           sublabel:'No complaints, no evidence of disease',                         cls:'green',  icon:'✅', title:'Fully active',             body:'No functional impairment. This score would be inconsistent with Bob\'s known diagnoses and recent hospitalisation.' }
  };

  // Stored so populateLearningRecord() can read it
  window.akpsConfirmedScore = null;
  window.akpsConfirmedLabel = null;

  window.updateAKPSSlider = function (val) {
    var score = SCORES[val - 1];
    var d = AKPS_DATA[score];

    document.getElementById('akps-num').textContent      = score;
    document.getElementById('akps-label').textContent    = d.label;
    document.getElementById('akps-sublabel').textContent = d.sublabel;

    var interp = document.getElementById('akps-interp');
    interp.className = 'akps-interpretation ' + d.cls;
    document.getElementById('akps-interp-icon').textContent       = d.icon;
    document.getElementById('akps-interp-title-text').textContent = d.title;
    document.getElementById('akps-interp-body').innerHTML         = d.body;

    // Reset confirm state if score has changed after confirming
    if (window.akpsConfirmedScore !== null && score !== window.akpsConfirmedScore) {
      var btn  = document.getElementById('akps-confirm-btn');
      var note = document.getElementById('akps-confirmed-note');
      if (btn)  { btn.classList.remove('confirmed'); btn.textContent = '✓ Confirm this score & save to Learning Record'; }
      if (note) { note.classList.remove('show'); }
    }
  };

  window.confirmAKPSScore = function () {
    var val   = document.getElementById('akps-slider').value;
    var score = SCORES[val - 1];
    var d     = AKPS_DATA[score];

    window.akpsConfirmedScore = score;
    window.akpsConfirmedLabel = d.label;
    window.akpsConfirmedCls   = d.cls;
    window.akpsConfirmedSub   = d.sublabel;

    var btn  = document.getElementById('akps-confirm-btn');
    var note = document.getElementById('akps-confirmed-note');
    if (btn)  { btn.classList.add('confirmed'); btn.textContent = '✓ Score ' + score + ' confirmed'; }
    if (note) { note.classList.add('show'); }
  };

})();

/* ══════════════════════════════════════════════════════════
   SECTION 9 — MODULE COMPLETION
══════════════════════════════════════════════════════════ */
function finishModule() {
  // Mark as passed if MCQ was passed, otherwise incomplete
  SCORM.finish('passed', null);
  alert('Well done — you have completed the Deterioration & Recognition module. Your progress has been saved.');
}

/* ══════════════════════════════════════════════════════
   SCENARIO — selectChoice()
   Add this function to Bob's scripts.js
   Called by choice-card buttons on pages 9 and 11
══════════════════════════════════════════════════════ */

const CHOICE_FEEDBACK = {
  best: {
    label: '✓ Best response',
    text:  'This is the most effective approach. Open, curious questioning allows Bob to share what he may be minimising. Asking about specific symptoms — sleep, appetite, breathing — gives him permission to disclose concerns he might otherwise downplay.'
  },
  neutral: {
    label: '⚠ Acceptable, but incomplete',
    text:  'Taking observations is appropriate, but accepting "I\'m fine" at face value and moving quickly to the task misses the opportunity to explore what may lie beneath Bob\'s presentation. Clinical curiosity is just as important as clinical measurement.'
  },
  poor: {
    label: '✗ Not recommended',
    text:  'Leading with a clinical concern — especially one that Bob hasn\'t raised — risks causing alarm without context and can damage rapport. Bob values his independence and tends to minimise; confronting him with a symptom he hasn\'t mentioned may cause him to shut down further.'
  }
};

function selectChoice(btn, quality, pageId) {
  // Disable all choices in this panel
  const panel = btn.closest('.choices-panel');
  panel.querySelectorAll('.choice-card').forEach(c => {
    c.setAttribute('aria-disabled', 'true');
    c.style.pointerEvents = 'none';
  });

  // Mark selected card
  btn.classList.add(quality);

  // Show feedback
  const feedbackId = 'feedback-' + pageId.replace('page-', '');
  const fb = document.getElementById(feedbackId);
  if (fb) {
    const data = CHOICE_FEEDBACK[quality];
    fb.className = 'scenario-feedback show ' + quality;
    fb.innerHTML = '<strong style="display:block;margin-bottom:6px;">' + data.label + '</strong>' + data.text;
  }

  // Show nav button
  const navId = 'nav-' + pageId.replace('page-', '');
  const nav = document.getElementById(navId);
  if (nav) nav.style.display = 'flex';
}


/* ══════════════════════════════════════════════════════════
   SECTION 10 — INIT & GLOBAL EVENTS
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  SCORM.initialize();
  updateProgressBar(1);
  renderMCQ();
  // Default: show first phase on timeline
  showPhase('months');
  // Default: show cancer trajectory
  showTraj('cancer');

  window.addEventListener('beforeunload', function () {
    if (SCORM.isInitialized()) SCORM.finish('incomplete', null);
  });
});


