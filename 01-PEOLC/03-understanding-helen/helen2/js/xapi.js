/* ══════════════════════════════════════════════════════════
   js/xapi.js  ·  xAPI (Tin Can) wrapper
   Safe to load outside an LRS — gracefully no-ops and logs
   statements to the console instead of sending them.

   LAUNCH: expects the LMS/LRS to launch this package with the endpoint,
   auth and actor passed as URL query parameters, e.g.:
     index.html?endpoint=https%3A%2F%2Flrs.example.com%2Fxapi%2F
               &auth=Basic%20xxxxx
               &actor=%7B%22mbox%22%3A%22mailto%3Alearner%40example.com%22%7D
   This is the convention used by SCORM Cloud, Learning Locker, Watershed
   and most LMSs that support "Tin Can launch" for content packages.
══════════════════════════════════════════════════════════ */

const XAPI = (() => {

  /* ── Configuration ─────────────────────────────────────────
     IRI namespace for this course's activities. This does not need
     to resolve to a real page — it just needs to be a stable identifier
     your organisation controls. Update if St Barnabas Hospice's LRS
     activity IDs should live under a different path.                  */
  const ACTIVITY_BASE = 'https://www.stbarnabashospice.co.uk/xapi/understanding-helen';
  const COURSE_ACTIVITY = {
    id: ACTIVITY_BASE,
    definition: {
      name: { 'en-GB': 'Understanding Helen' },
      type: 'http://adlnet.gov/expapi/activities/course',
    },
  };

  const VERBS = {
    initialized: { id: 'http://adlnet.gov/expapi/verbs/initialized', display: { 'en-GB': 'initialized' } },
    terminated:  { id: 'http://adlnet.gov/expapi/verbs/terminated',  display: { 'en-GB': 'terminated' } },
    experienced: { id: 'http://adlnet.gov/expapi/verbs/experienced', display: { 'en-GB': 'experienced' } },
    answered:    { id: 'http://adlnet.gov/expapi/verbs/answered',    display: { 'en-GB': 'answered' } },
    responded:   { id: 'http://adlnet.gov/expapi/verbs/responded',   display: { 'en-GB': 'responded' } },
    completed:   { id: 'http://adlnet.gov/expapi/verbs/completed',   display: { 'en-GB': 'completed' } },
    passed:      { id: 'http://adlnet.gov/expapi/verbs/passed',      display: { 'en-GB': 'passed' } },
    failed:      { id: 'http://adlnet.gov/expapi/verbs/failed',      display: { 'en-GB': 'failed' } },
    reset:       { id: 'https://www.stbarnabashospice.co.uk/xapi/verbs/reset', display: { 'en-GB': 'reset' } },
  };

  let _endpoint = null;   // e.g. https://lrs.example.com/xapi/
  let _auth     = null;   // e.g. "Basic xxxxx" or "Bearer xxxxx"
  let _actor    = null;   // xAPI Agent object
  let _registration = null;
  let _active   = false;

  /* ── Parse launch parameters ────────────────────────────── */
  function _parseLaunch() {
    try {
      const params = new URLSearchParams(window.location.search);
      const endpoint = params.get('endpoint');
      const auth     = params.get('auth');
      const actor    = params.get('actor');
      const reg      = params.get('registration');

      if (endpoint) {
        _endpoint = endpoint.endsWith('/') ? endpoint : endpoint + '/';
        _auth = auth || null;
        _registration = reg || null;
        try {
          _actor = actor ? JSON.parse(actor) : { name: 'Anonymous Learner', mbox: 'mailto:anonymous@example.com' };
        } catch (e) {
          _actor = { name: 'Anonymous Learner', mbox: 'mailto:anonymous@example.com' };
        }
        return true;
      }
    } catch (e) { /* no-op */ }
    return false;
  }

  /* ── Send a statement ────────────────────────────────────── */
  function _send(statement) {
    if (!_active) {
      console.info('[xAPI] (standalone, not sent)', statement);
      return Promise.resolve(false);
    }
    const body = Object.assign({
      actor: _actor,
      timestamp: new Date().toISOString(),
    }, statement);
    if (_registration) {
      body.context = Object.assign({ registration: _registration }, body.context || {});
    }

    return fetch(_endpoint + 'statements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Experience-API-Version': '1.0.3',
        'Authorization': _auth || '',
      },
      body: JSON.stringify(body),
      keepalive: true,
    }).then(r => {
      if (!r.ok) console.warn('[xAPI] LRS responded', r.status);
      return r.ok;
    }).catch(err => {
      console.warn('[xAPI] Send failed:', err.message);
      return false;
    });
  }

  /* ── Public: initialise / terminate ─────────────────────── */
  function initialize() {
    _active = _parseLaunch();
    console.info('[xAPI] Initialize:', _active ? ('active → ' + _endpoint) : 'standalone (no launch params found)');
    if (_active) {
      statement(VERBS.initialized, COURSE_ACTIVITY);
    }
    return _active;
  }

  function finish() {
    if (!_active) return;
    statement(VERBS.terminated, COURSE_ACTIVITY);
  }

  /* ── Public: generic statement sender ───────────────────── */
  function statement(verb, object, extra) {
    const stmt = Object.assign({
      verb,
      object: {
        id: object.id,
        objectType: 'Activity',
        definition: object.definition || {},
      },
    }, extra || {});
    return _send(stmt);
  }

  /* ── Public: convenience helpers ─────────────────────────── */

  // A learner viewed / arrived at a page or activity
  function experienced(activityIdSuffix, name) {
    return statement(VERBS.experienced, {
      id: ACTIVITY_BASE + '/' + activityIdSuffix,
      definition: { name: { 'en-GB': name }, type: 'http://adlnet.gov/expapi/activities/media' },
    });
  }

  // A learner chose an option within an interaction (e.g. a scenario stage, quiz question)
  function responded(activityIdSuffix, name, responseText, extensions) {
    return statement(VERBS.responded, {
      id: ACTIVITY_BASE + '/' + activityIdSuffix,
      definition: {
        name: { 'en-GB': name },
        type: 'http://adlnet.gov/expapi/activities/interaction',
        extensions: extensions || undefined,
      },
    }, {
      result: {
        response: responseText,
        extensions: extensions || undefined,
      },
    });
  }

  // Mark an activity (quiz, scenario, whole course) completed, with optional pass/fail + score
  function setCompletion(activityIdSuffix, name, opts) {
    opts = opts || {};
    const object = {
      id: ACTIVITY_BASE + (activityIdSuffix ? '/' + activityIdSuffix : ''),
      definition: { name: { 'en-GB': name } },
    };
    const result = { completion: true };
    if (typeof opts.success === 'boolean') result.success = opts.success;
    if (opts.score) result.score = opts.score;
    if (opts.responseId) {
      result.extensions = Object.assign(
        { 'https://www.stbarnabashospice.co.uk/xapi/extensions/outcome': opts.responseId },
        opts.extensions || {}
      );
    } else if (opts.extensions) {
      result.extensions = opts.extensions;
    }

    statement(VERBS.completed, object, { result });
    if (typeof opts.success === 'boolean') {
      statement(opts.success ? VERBS.passed : VERBS.failed, object, { result });
    }
  }

  function setScore(activityIdSuffix, name, raw, min, max, passed) {
    setCompletion(activityIdSuffix, name, {
      success: typeof passed === 'boolean' ? passed : undefined,
      score: { raw, min: min || 0, max: max || 100, scaled: max ? raw / max : undefined },
    });
  }

  function loggedReset(activityIdSuffix, name) {
    statement(VERBS.reset, {
      id: ACTIVITY_BASE + '/' + activityIdSuffix,
      definition: { name: { 'en-GB': name } },
    });
  }

  return {
    initialize, finish, statement,
    experienced, responded, setCompletion, setScore, loggedReset,
    VERBS, ACTIVITY_BASE,
    isActive: () => _active,
  };
})();
