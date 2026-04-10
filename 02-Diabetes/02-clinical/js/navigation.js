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
  if (n === 11 && typeof populateLearningRecord === 'function') populateLearningRecord();
}

function navClick(n) { if (visited.has(n)) goToPage(n); }

function updateProgressBar(n) {
  var pct  = Math.round(((n - 1) / (TOTAL_PAGES - 1)) * 100);
  var fill = document.getElementById('progress-fill');
  var lbl  = document.getElementById('progress-label');
  if (fill) { fill.style.width = pct + '%'; fill.closest('[role="progressbar"]').setAttribute('aria-valuenow', pct); }
  if (lbl)  lbl.textContent = pct + '% complete';
}

window.navClick = navClick;
window.goToPage = goToPage;
window.SCORM = SCORM;
