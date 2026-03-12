/* ══════════════════════════════════════════════════════════
   js/scorm.js  ·  SCORM 1.2 wrapper
   Safe to load outside an LMS — gracefully no-ops.
══════════════════════════════════════════════════════════ */

const SCORM = (() => {
  let _api    = null;
  let _active = false;

  function _find() {
    try {
      let w = window;
      for (let i = 0; i < 5; i++) {
        if (w.API) return w.API;
        if (!w.parent || w.parent === w) break;
        w = w.parent;
      }
    } catch (e) {}
    return null;
  }

  function initialize() {
    _api = _find();
    if (!_api) { console.info('[SCORM] No API — running standalone.'); return false; }
    const ok = _api.LMSInitialize('');
    _active = (ok === 'true' || ok === true);
    console.info('[SCORM] Initialize:', _active);
    return _active;
  }

  function finish() {
    if (!_active) return false;
    _api.LMSFinish('');
    _active = false;
  }

  function set(element, value) {
    if (!_active) return false;
    return _api.LMSSetValue(element, value);
  }

  function get(element) {
    if (!_active) return '';
    return _api.LMSGetValue(element);
  }

  function commit() {
    if (!_active) return false;
    return _api.LMSCommit('');
  }

  function setCompletion(status /* 'completed' | 'passed' | 'failed' | 'incomplete' */) {
    set('cmi.core.lesson_status', status);
    commit();
  }

  function setScore(raw, min, max) {
    set('cmi.core.score.raw', raw);
    set('cmi.core.score.min', min || 0);
    set('cmi.core.score.max', max || 100);
    commit();
  }

  return { initialize, finish, set, get, commit, setCompletion, setScore };
})();
