/* ══════════════════════════════════════════════════════════
   js/scorm.js  ·  SCORM 1.2 wrapper
   Safe to load outside an LMS — gracefully no-ops.
══════════════════════════════════════════════════════════ */

const SCORM = (() => {
  let _api    = null;
  let _active = false;
  let _start  = Date.now();

  function _find() {
    try {
      let w = window;
      for (let i = 0; i < 7; i++) {
        if (w.API) return w.API;
        if (!w.parent || w.parent === w) break;
        w = w.parent;
      }
      if (window.opener) {
        let w2 = window.opener;
        for (let i = 0; i < 7; i++) {
          if (w2.API) return w2.API;
          if (!w2.parent || w2.parent === w2) break;
          w2 = w2.parent;
        }
      }
    } catch (e) {}
    return null;
  }

  function _fmt(ms) {
    const t = Math.floor(ms / 1000);
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function initialize() {
    _api = _find();
    if (!_api) { console.info('[SCORM] No API — running standalone.'); return false; }
    const ok = _api.LMSInitialize('');
    _active  = (ok === 'true' || ok === true);
    if (_active) {
      _start = Date.now();
      _api.LMSSetValue('cmi.core.score.min', '0');
      _api.LMSSetValue('cmi.core.score.max', '100');
      _api.LMSSetValue('cmi.core.lesson_status', 'incomplete');
      _api.LMSCommit('');
    }
    console.info('[SCORM] Initialize:', _active);
    return _active;
  }

  function finish(status, score) {
    if (!_active) return false;
    _api.LMSSetValue('cmi.core.session_time', _fmt(Date.now() - _start));
    if (status != null) _api.LMSSetValue('cmi.core.lesson_status', status);
    if (score  != null) _api.LMSSetValue('cmi.core.score.raw', String(Math.round(score)));
    _api.LMSCommit('');
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

  function setCompletion(status) {
    set('cmi.core.lesson_status', status);
    commit();
  }

  function setScore(raw, min, max) {
    set('cmi.core.score.raw', raw);
    set('cmi.core.score.min', min || 0);
    set('cmi.core.score.max', max || 100);
    commit();
  }

  function saveBookmark(n) {
    set('cmi.core.lesson_location', String(n));
    commit();
  }

  return { initialize, finish, set, get, commit, setCompletion, setScore, saveBookmark,
           isInitialized: () => _active };
})();
