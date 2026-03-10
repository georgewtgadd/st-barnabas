/* ══════════════════════════════════════════════════════════
   SCORM 1.2 API WRAPPER
   js/scorm.js
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
      setValue('cmi.core.lesson_status', 'incomplete');
      setValue('cmi.core.score.min', '0');
      setValue('cmi.core.score.max', '100');
      commit();
      return true;
    }
    console.warn('[SCORM] LMSInitialize failed');
    return false;
  }

  function setValue(el, val) {
    if (!_initialized || _finished || !_api) return false;
    return _api.LMSSetValue(el, String(val)) === 'true' || _api.LMSSetValue(el, String(val)) === true;
  }

  function getValue(el) {
    return (!_initialized || _finished || !_api) ? '' : _api.LMSGetValue(el);
  }

  function commit() {
    if (!_initialized || _finished || !_api) return false;
    return _api.LMSCommit('') === 'true' || _api.LMSCommit('') === true;
  }

  function _fmt(ms) {
    var t = Math.floor(ms / 1000), h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function finish(status, score) {
    if (_finished || !_initialized || !_api) return false;
    setValue('cmi.core.session_time', _fmt(Date.now() - _sessionStart));
    if (status != null) setValue('cmi.core.lesson_status', status);
    if (score  != null) setValue('cmi.core.score.raw', String(Math.round(score)));
    commit();
    _api.LMSFinish('');
    _finished = true;
    return true;
  }

  function saveBookmark(n) {
    setValue('cmi.core.lesson_location', String(n));
    setValue('cmi.suspend_data', JSON.stringify({ page: n }));
    commit();
  }

  function getBookmark() {
    try { var d = JSON.parse(getValue('cmi.suspend_data')); return d.page || 1; } catch (e) {}
    var l = parseInt(getValue('cmi.core.lesson_location'), 10);
    return isNaN(l) ? 1 : l;
  }

  return {
    initialize,
    setValue,
    getValue,
    commit,
    finish,
    saveBookmark,
    getBookmark,
    isInitialized: () => _initialized
  };
}());
