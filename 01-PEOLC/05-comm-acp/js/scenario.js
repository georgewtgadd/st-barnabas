/* ══════════════════════════════════════════════════════════
   js/scenario.js  ·  Page 8 — Best Interests Branching Scenario
   Single-page design: image swaps on every stage / outcome
══════════════════════════════════════════════════════════ */

const scenarioStages = [
  {
    id: 1,
    options: {
      A: {
        correct: false,
        outcome: 'David snaps: "You\'re just treating him like a bed number!"',
        feedback: '<strong>Communication Failure.</strong> By standing at the door (55% Body Language = disengagement) and mentioning the ward\'s busyness (38% Tone = task over person), you signalled that the decision matters more than the family. This shuts down the collaborative Best Interests process before it begins.',
        feedbackType: 'error',
        image: 'scene-s1-wrong',
      },
      B: {
        correct: true,
        outcome: 'Sarah stops crying and nods. David\'s shoulders relax.',
        feedback: '<strong>✓ Success.</strong> By sitting at eye level and using a calm, soft tone, you\'ve used your 55% (Body Language) and 38% (Tone) to remove psychological barriers. Asking about Arthur as a person follows <strong>MCA Principle 4 (Best Interests)</strong> — beginning by seeking his past values and beliefs.',
        feedbackType: 'success',
        image: 'scene-s1-correct',
      },
    },
  },
  {
    id: 2,
    options: {
      A: {
        correct: false,
        outcome: 'David becomes defensive. "I want to speak to your manager."',
        feedback: '<strong>Communication Failure.</strong> You took a side in a family dispute and used clinical jargon (<em>"least restrictive"</em>) before the family was ready to hear it. This increases conflict and removes Arthur from the centre of the conversation.',
        feedbackType: 'error',
        image: 'scene-s2-wrong',
      },
      B: {
        correct: true,
        outcome: 'Both siblings go quiet. David says, "He was a very independent man. He hated being fussed over."',
        feedback: '<strong>✓ Success.</strong> You remained neutral and refocused the conversation on Arthur. This aligns with the <strong>MCA Section 4 checklist</strong> — consulting those close to the patient to ascertain his <em>past and present wishes, feelings, beliefs and values</em>.',
        feedbackType: 'success',
        image: 'scene-s2-correct',
      },
    },
  },
  {
    id: 3,
    options: {
      A: {
        correct: false,
        outcome: 'Sarah starts crying again. David feels the decision was "done to them" rather than "with them."',
        feedback: '<strong>Clinical/Legal Failure.</strong> While the clinical conclusion may be correct, the communication failed. Stating the MDT "decided" excludes the family. Under the MCA, Best Interests is a collaborative <em>process</em> — not a notification.',
        feedbackType: 'error',
        image: 'scene-s3-wrong',
      },
      B: {
        correct: true,
        outcome: 'The family agrees. They feel Arthur\'s voice was heard through them.',
        feedback: '<strong>✓ Scenario Complete.</strong> You successfully balanced the 7-38-55 Rule with the MCA. By linking the clinical recommendation to <strong>Arthur\'s own values</strong> and inviting the family\'s perspective, you conducted a genuine Best Interests process — treating it as a discovery, not a directive.',
        feedbackType: 'success',
        image: 'scene-s3-correct',
      },
    },
  },
];

/* ── State ─────────────────────────────────────────────── */
let _stageResults  = {};   // { 1: true|false, … }
let _scenarioDone  = false;
window._scenarioResult      = null;
window._scenarioChoices     = {};   // { 1: 'A'|'B', … }
window._scenarioAttempts    = { 1: 0, 2: 0, 3: 0 };

/* ── Scene image switcher ───────────────────────────────── */
function _showScene(imageId) {
  document.querySelectorAll('.scene-image').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(imageId);
  if (target) target.classList.add('active');
}

/* ── Start ──────────────────────────────────────────────── */
function startScenario() {
  const intro  = document.getElementById('scenario-intro-panel');
  const stages = document.getElementById('scenario-stages-wrap');
  if (intro)  intro.style.display = 'none';
  if (stages) stages.style.display = 'block';

  _showScene('scene-s1-wrong'.replace('wrong', 'intro') || 'scene-intro');
  // Actually show intro→s1 image (stage 1 hasn't been answered yet)
  _showScene('scene-intro');
  _updateTracker(1);
  _revealStage(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Reveal a stage (animate in) ───────────────────────── */
function _revealStage(n) {
  const stageEl = document.getElementById('stage-' + n);
  if (!stageEl) return;
  stageEl.classList.add('active');
  stageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Tracker ────────────────────────────────────────────── */
function _updateTracker(current) {
  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById('tracker-dot-' + i);
    if (!dot) continue;
    dot.className = 'tracker-dot';
    if (_stageResults[i] === true) dot.classList.add('done');
    else if (i === current)        dot.classList.add('current');
  }
  const lbl = document.getElementById('tracker-label');
  if (lbl) {
    const done = Object.values(_stageResults).filter(Boolean).length;
    lbl.textContent = done === 3 ? 'All stages complete' : 'Stage ' + current + ' of 3';
  }
}

/* ── Choose an option ───────────────────────────────────── */
function chooseOption(stageId, optionLabel) {
  const stage = scenarioStages.find(s => s.id === stageId);
  if (!stage) return;
  const opt = stage.options[optionLabel];
  if (!opt) return;

  window._scenarioAttempts[stageId] = (window._scenarioAttempts[stageId] || 0) + 1;

  // Disable buttons
  document.querySelectorAll('#stage-' + stageId + ' .stage-option').forEach(b => b.disabled = true);

  // Switch scene image immediately — always, regardless of right/wrong
  _showScene(opt.image);

  // Feedback
  const fb = document.getElementById('stage-' + stageId + '-feedback');
  if (fb) {
    fb.className = 'stage-feedback show ' + opt.feedbackType;
    fb.innerHTML = `
      <div class="stage-feedback-header">
        <span>${opt.feedbackType === 'success' ? '✓' : '✗'}</span>
        <span>${opt.outcome}</span>
      </div>
      <div class="stage-feedback-body">${opt.feedback}</div>`;
  }

  // Actions
  const actions = document.getElementById('stage-' + stageId + '-actions');
  if (actions) actions.style.display = 'flex';

  const nextBtn  = document.getElementById('stage-' + stageId + '-next');
  const retryBtn = document.getElementById('stage-' + stageId + '-retry');

  if (opt.correct) {
    _stageResults[stageId] = true;
    // Record the successful choice (first correct attempt label)
    if (!window._scenarioChoices[stageId]) {
      window._scenarioChoices[stageId] = optionLabel;
    }
    _updateTracker(stageId);

    if (nextBtn)  { nextBtn.removeAttribute('hidden');  nextBtn.style.display = 'inline-flex'; }
    if (retryBtn) { retryBtn.setAttribute('hidden', ''); retryBtn.style.display = 'none'; }

    if (stageId === 3) {
      // Scenario complete
      _scenarioDone = true;
      window._scenarioResult = 'completed';
      _unlockScenarioContinue();
    }
  } else {
    if (retryBtn) { retryBtn.removeAttribute('hidden');  retryBtn.style.display = 'inline-flex'; }
    if (nextBtn)  { nextBtn.setAttribute('hidden', '');  nextBtn.style.display = 'none'; }
  }
}

/* ── Retry a stage ──────────────────────────────────────── */
function retryStage(stageId) {
  // Re-enable option buttons
  document.querySelectorAll('#stage-' + stageId + ' .stage-option').forEach(b => b.disabled = false);

  // Clear feedback
  const fb = document.getElementById('stage-' + stageId + '-feedback');
  if (fb) { fb.className = 'stage-feedback'; fb.innerHTML = ''; }

  // Hide actions
  const actions = document.getElementById('stage-' + stageId + '-actions');
  if (actions) actions.style.display = 'none';

  // Revert image: stage 1 retry → intro, stage 2 → s1-correct, stage 3 → s2-correct
  const revertImages = { 1: 'scene-intro', 2: 'scene-s1-correct', 3: 'scene-s2-correct' };
  _showScene(revertImages[stageId] || 'scene-intro');
}

/* ── Advance to next stage ──────────────────────────────── */
function nextStage(fromStage) {
  const next = fromStage + 1;
  if (next <= 3) {
    _updateTracker(next);
    _revealStage(next);
  }
}

/* ── Continue unlock ────────────────────────────────────── */
function _unlockScenarioContinue() {
  const lockEl  = document.getElementById('scenario-locked-msg');
  const contBtn = document.getElementById('scenario-continue-btn');
  if (lockEl)  lockEl.style.display = 'none';
  if (contBtn) { contBtn.removeAttribute('hidden'); contBtn.style.display = 'inline-flex'; }
}

document.addEventListener('pagesLoaded', () => {
  const lockEl  = document.getElementById('scenario-locked-msg');
  const contBtn = document.getElementById('scenario-continue-btn');
  if (lockEl)  lockEl.style.display = '';
  if (contBtn) { contBtn.setAttribute('hidden', ''); contBtn.style.display = 'none'; }
});
