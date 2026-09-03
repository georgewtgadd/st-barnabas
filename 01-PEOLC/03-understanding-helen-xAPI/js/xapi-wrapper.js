/* ══════════════════════════════════════════════════════════
   xapi-wrapper.js — xAPI (Tin Can) statement reporting.
   Replaces js/scorm-api.js.

   Launch: expects the standard "Tin Can Launch Link" query
   parameters appended by the LMS/LRS launcher —
     ?endpoint=...&auth=...&actor=...&registration=...
   (this is how Moodle's Tin Can Launch Link, Rustici-hosted
   launches, and most LRS-fronted LMSs launch xAPI content.)

   If no launch parameters are present (e.g. previewing the
   file directly, or opened via "Open in a new window" outside
   an LMS), statements are skipped silently — the module still
   runs standalone with no errors.

   To hard-code a fallback LRS (for direct-hosted deployments
   with no dynamic launch link), fill in XAPI_FALLBACK below.
══════════════════════════════════════════════════════════ */

// ── Replace with your organisation's real domain before deployment.
const XAPI_ACTIVITY_BASE = 'https://sbheducation.org/xapi/activities/understanding-helen';

// ── Optional static fallback (leave blank to disable).
const XAPI_FALLBACK = {
  endpoint: '',       // e.g. 'https://your-lrs.example.com/xapi/'
  auth: '',           // e.g. 'Basic base64(key:secret)'
  actor: null         // e.g. { "mbox": "mailto:learner@example.com", "name": "Learner" }
};

let xapiConfig = null;      // { endpoint, auth, actor, registration }
let xapiRegistration = null;
let xapiInitialised = false;

function xapiParseLaunchParams() {
  const params = new URLSearchParams(window.location.search);
  const endpoint = params.get('endpoint') || XAPI_FALLBACK.endpoint;
  const auth = params.get('auth') || XAPI_FALLBACK.auth;
  const actorRaw = params.get('actor');
  const registration = params.get('registration') || null;

  let actor = XAPI_FALLBACK.actor;
  if (actorRaw) {
    try { actor = JSON.parse(actorRaw); } catch (e) { /* ignore malformed actor */ }
  }

  if (!endpoint || !auth || !actor) return null;

  return {
    endpoint: endpoint.endsWith('/') ? endpoint : endpoint + '/',
    auth,
    actor,
    registration
  };
}

function xapiInitialize() {
  if (xapiInitialised) return;
  xapiConfig = xapiParseLaunchParams();
  xapiInitialised = true;
  if (!xapiConfig) return; // No LRS available — no-op mode.

  xapiRegistration = xapiConfig.registration;
  xapiSendStatement({
    verbId: 'http://adlnet.gov/expapi/verbs/initialized',
    verbDisplay: 'initialized',
    objectId: XAPI_ACTIVITY_BASE,
    objectName: 'Understanding Helen',
    objectDescription: 'Palliative Care Fundamentals — Module 3'
  });
}

/* ── CORE: send a single xAPI statement ──────────────────
   opts: { verbId, verbDisplay, objectId, objectName, objectDescription,
           objectType, result, extensions } */
function xapiSendStatement(opts) {
  if (!xapiConfig) return;

  const statement = {
    actor: xapiConfig.actor,
    verb: {
      id: opts.verbId,
      display: { 'en-GB': opts.verbDisplay }
    },
    object: {
      id: opts.objectId,
      objectType: opts.objectType || 'Activity',
      definition: {
        name: { 'en-GB': opts.objectName || '' },
        description: { 'en-GB': opts.objectDescription || '' }
      }
    },
    context: {}
  };

  if (xapiRegistration) statement.context.registration = xapiRegistration;
  if (opts.result) statement.result = opts.result;
  if (opts.extensions) {
    statement.object.definition.extensions = opts.extensions;
  }

  try {
    fetch(xapiConfig.endpoint + 'statements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': xapiConfig.auth,
        'X-Experience-API-Version': '1.0.3'
      },
      body: JSON.stringify(statement),
      keepalive: true // allows the request to complete during page unload
    }).catch(() => { /* LRS unreachable — fail silently, don't block the learner */ });
  } catch (e) { /* ignore */ }
}

/* Called on every page change (see navigation.js). */
function xapiSendProgress(pageNum, totalPages, pageTitle) {
  xapiSendStatement({
    verbId: 'http://adlnet.gov/expapi/verbs/progressed',
    verbDisplay: 'progressed',
    objectId: XAPI_ACTIVITY_BASE,
    objectName: 'Understanding Helen',
    extensions: {
      'https://sbheducation.org/xapi/extensions/progress': Math.round((pageNum / totalPages) * 100)
    },
    result: {
      extensions: {
        'https://sbheducation.org/xapi/extensions/current-page': pageTitle || ('page-' + pageNum)
      }
    }
  });
}

/* A discrete interaction — video watched, hotspot found, pillar opened. */
function xapiSendExperienced(activitySlug, name, description) {
  xapiSendStatement({
    verbId: 'http://adlnet.gov/expapi/verbs/experienced',
    verbDisplay: 'experienced',
    objectId: XAPI_ACTIVITY_BASE + '/' + activitySlug,
    objectName: name,
    objectDescription: description || ''
  });
}

/* A choice made in the branching scenario or quiz — recorded with the
   response given and whether it was correct, using a real xAPI
   interaction object so the LRS can report on it meaningfully. */
function xapiSendAnswered(activitySlug, name, response, correct, choices) {
  xapiSendStatement({
    verbId: 'http://adlnet.gov/expapi/verbs/answered',
    verbDisplay: 'answered',
    objectId: XAPI_ACTIVITY_BASE + '/' + activitySlug,
    objectName: name,
    objectType: 'Activity',
    result: {
      success: !!correct,
      response: response
    },
    extensions: choices ? { 'https://sbheducation.org/xapi/extensions/choices': choices } : undefined
  });
}

/* Called once the knowledge-check results are shown (see
   knowledge-check.js) — records score and marks the course complete. */
function xapiSendScoreAndComplete(score, total) {
  const scaled = total > 0 ? Math.round((score / total) * 100) / 100 : 0;
  const passed = scaled >= 0.8;

  xapiSendStatement({
    verbId: passed ? 'http://adlnet.gov/expapi/verbs/passed' : 'http://adlnet.gov/expapi/verbs/failed',
    verbDisplay: passed ? 'passed' : 'failed',
    objectId: XAPI_ACTIVITY_BASE,
    objectName: 'Understanding Helen',
    result: {
      score: { scaled, raw: score, min: 0, max: total },
      success: passed,
      completion: true
    }
  });

  xapiSendStatement({
    verbId: 'http://adlnet.gov/expapi/verbs/completed',
    verbDisplay: 'completed',
    objectId: XAPI_ACTIVITY_BASE,
    objectName: 'Understanding Helen',
    result: { completion: true }
  });
}

function xapiTerminate() {
  if (!xapiConfig) return;
  xapiSendStatement({
    verbId: 'http://adlnet.gov/expapi/verbs/terminated',
    verbDisplay: 'terminated',
    objectId: XAPI_ACTIVITY_BASE,
    objectName: 'Understanding Helen'
  });
}

window.addEventListener('beforeunload', xapiTerminate);
