/* ══════════════════════════════════════════════════════════
   AKPS SLIDER — Page 9
   js/akps.js
══════════════════════════════════════════════════════════ */

(function () {

  var SCORES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  var AKPS_DATA = {
    10:  { label: 'Moribund',                sublabel: 'Fatal processes progressing rapidly',                             cls: 'pink',   icon: '🔴', title: 'Moribund',                 body: 'Patient is actively dying. All Five Priorities of Care should be implemented immediately. Bob presenting as conversational at this score would be highly inconsistent.' },
    20:  { label: 'Very sick',               sublabel: 'Active supportive treatment necessary',                          cls: 'red',    icon: '🔴', title: 'End of life — hours/days',  body: 'Likely in the final weeks of life. Syringe driver and comfort care should be actively in place. Inconsistent with Bob walking to the door.' },
    30:  { label: 'Severely disabled',       sublabel: 'Hospitalisation indicated, death not imminent',                 cls: 'red',    icon: '🔴', title: 'Severely disabled',          body: 'AKPS ≤30 is associated with a prognosis of weeks, not months. All anticipatory decisions should be documented and shared.' },
    40:  { label: 'Disabled',                sublabel: 'Requires special care and assistance',                          cls: 'red',    icon: '🔴', title: 'Significant decline',        body: 'High care needs. Review syringe driver requirements and ensure out-of-hours team are briefed. Proactive family communication is essential.' },
    50:  { label: 'Considerable assistance', sublabel: 'Requires frequent medical care',                                cls: 'orange', icon: '⚠️', title: 'Key clinical threshold',    body: '⚠️ AKPS ≤50 is a key threshold — consider referral to specialist palliative care. Bob\'s self-report of "fine" is clinically inconsistent with this score.' },
    60:  { label: 'Occasional assistance',   sublabel: 'Able to care for most personal needs',                         cls: 'orange', icon: '⚠️', title: 'Increasing dependency',     body: 'Bob requires occasional help. Review medications and anticipatory care plan. His "plodding along" phrasing may be masking this level of need.' },
    70:  { label: 'Limited self-care',       sublabel: 'Cares for self; unable to carry on normal activity or work',   cls: 'amber',  icon: '⚠️', title: 'Functional decline present', body: 'At AKPS 70, Bob is managing self-care but unable to work or sustain normal activity. His score is <strong>inconsistent with saying he is "fine"</strong> — this warrants probing.' },
    80:  { label: 'Self-caring with effort', sublabel: 'Some signs or symptoms of disease present',                    cls: 'amber',  icon: '💛', title: 'Mild-moderate decline',      body: 'Managing independently but with effort. Consider initiating advance care planning and reviewing support needs at this visit.' },
    90:  { label: 'Minor limitations',       sublabel: 'Normal activity with effort, some symptoms',                   cls: 'green',  icon: '✅', title: 'Minor limitations',          body: 'Minor symptoms present. Ensure routine symptom review continues and begin documenting preferences and goals of care.' },
    100: { label: 'Fully active',            sublabel: 'No complaints, no evidence of disease',                        cls: 'green',  icon: '✅', title: 'Fully active',               body: 'No functional impairment. This score would be inconsistent with Bob\'s known diagnoses and recent hospitalisation.' }
  };

  // Exposed to populateLearningRecord()
  window.akpsConfirmedScore = null;
  window.akpsConfirmedLabel = null;
  window.akpsConfirmedCls   = null;
  window.akpsConfirmedSub   = null;

  window.updateAKPSSlider = function (val) {
    var score = SCORES[val - 1];
    var d     = AKPS_DATA[score];

    document.getElementById('akps-num').textContent      = score;
    document.getElementById('akps-label').textContent    = d.label;
    document.getElementById('akps-sublabel').textContent = d.sublabel;

    var interp = document.getElementById('akps-interp');
    interp.className = 'akps-interpretation ' + d.cls;
    document.getElementById('akps-interp-icon').textContent       = d.icon;
    document.getElementById('akps-interp-title-text').textContent = d.title;
    document.getElementById('akps-interp-body').innerHTML         = d.body;

    // Reset confirm state if score changed after confirming
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

}());


/* ── Page 9 gate (AKPS confirmed + activity response entered) ── */
window.checkPage9Gate = function () {
  var akpsOk = window.akpsConfirmedScore !== null;
  var q1     = document.getElementById('bob3-q1-input');
  var q1Ok   = q1 && q1.value.trim().length > 0;
  var btn    = document.getElementById('page9-continue-btn');
  var nudge  = document.getElementById('page9-gate-nudge');
  if (!btn) return;
  var pass = akpsOk && q1Ok;
  btn.disabled      = !pass;
  btn.style.opacity = pass ? '1' : '.4';
  btn.style.cursor  = pass ? 'pointer' : 'not-allowed';
  if (nudge) nudge.style.display = pass ? 'none' : 'block';
};

// Wire up textarea listeners once DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  var q1 = document.getElementById('bob3-q1-input');
  if (q1) q1.addEventListener('input', window.checkPage9Gate);
  window.checkPage9Gate();
});
