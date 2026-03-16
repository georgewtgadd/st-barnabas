/* scorm.js — SCORM 1.2 wrapper, graceful no-op outside LMS */
'use strict';
const SCORM = (() => {
  let _api = null, _active = false;
  function _find() {
    try { let w = window; for (let i=0;i<5;i++) { if(w.API) return w.API; if(!w.parent||w.parent===w) break; w=w.parent; } } catch(e) {}
    return null;
  }
  function initialize() {
    _api = _find();
    if (!_api) { console.info('[SCORM] No API — standalone.'); return false; }
    const ok = _api.LMSInitialize('');
    _active = (ok === 'true' || ok === true);
    return _active;
  }
  function finish()            { if(!_active) return; _api.LMSFinish(''); _active=false; }
  function set(el,val)         { if(!_active) return false; return _api.LMSSetValue(el,val); }
  function commit()            { if(!_active) return false; return _api.LMSCommit(''); }
  function setCompletion(s)    { set('cmi.core.lesson_status',s); commit(); }
  function setScore(raw,mn,mx) { set('cmi.core.score.raw',raw); set('cmi.core.score.min',mn||0); set('cmi.core.score.max',mx||100); commit(); }
  return { initialize, finish, set, commit, setCompletion, setScore };
})();
