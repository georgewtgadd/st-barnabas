/* ══════════════════════════════════════════════════════════
   js/scenario.js  ·  Page 9 — Best Interests Branching Scenario
══════════════════════════════════════════════════════════ */

const scenarioStages = [
  {
    id: 1,
    title: 'Stage 1: The Opening',
    context: `You enter the family room. David looks angry; Sarah is crying. They are waiting to discuss a clinically indicated PEG feeding tube for Arthur, who has advanced dementia and can no longer swallow safely. There is no LPA or ADRT in place.\n\nHow do you begin?`,
    question: 'Choose the most effective opening approach:',
    options: [
      {
        label: 'A',
        text: 'Stand by the door and say, "I\'m here to discuss the PEG tube. We need a decision quickly as the ward is very busy."',
        correct: false,
        outcome: 'David snaps: "You\'re just treating him like a bed number!"',
        feedback: `<strong>Communication Failure.</strong> By standing (55% Body Language signal = indifference) and mentioning the ward's busyness (38% Tone = task over person), you signalled the decision matters more than the family. This shuts down the collaborative Best Interests process before it has begun.`,
        feedbackType: 'error',
      },
      {
        label: 'B',
        text: 'Sit down at the table, lean forward slightly, and say in a calm, soft tone: "Thank you for meeting me. I can see this is incredibly difficult. Before we talk about medical options, could you tell me more about what Arthur was like before he became unwell?"',
        correct: true,
        outcome: 'Sarah stops crying and nods. David relaxes his shoulders.',
        feedback: `<strong>✓ Success.</strong> By sitting at eye level and using a calm, soft tone, you\'ve used your 55% (Body Language) and 38% (Tone) to remove psychological barriers. Asking about Arthur as a person follows <strong>MCA Principle 4 (Best Interests)</strong> — you begin by seeking his past values and beliefs.`,
        feedbackType: 'success',
      },
    ],
  },
  {
    id: 2,
    title: 'Stage 2: Navigating Conflict',
    context: `David says, "He needs the tube! You can't just let him starve." Sarah whispers, "But Dad always said he never wanted to be a burden or hooked up to machines."\n\nHow do you respond?`,
    question: 'Choose the most effective response:',
    options: [
      {
        label: 'A',
        text: '"Sarah is right — we have to follow the least restrictive option. A feeding tube is quite invasive, so we should probably avoid it."',
        correct: false,
        outcome: 'David becomes defensive. "You\'re just taking her side to save money. I want to speak to your manager."',
        feedback: `<strong>Communication Failure.</strong> You took a side in a family dispute and used clinical jargon (<em>"least restrictive"</em>) before the family is ready to hear it. This increases conflict and removes Arthur from the centre of the conversation.`,
        feedbackType: 'error',
      },
      {
        label: 'B',
        text: '"David, I hear your concern about his comfort. Sarah, you\'ve mentioned his past wishes. Under the Mental Capacity Act, our goal isn\'t to choose what you want, but to work together to figure out what Arthur would want if he could speak for himself today."',
        correct: true,
        outcome: 'Both siblings go quiet. David says, "He was a very independent man. He hated being fussed over."',
        feedback: `<strong>✓ Success.</strong> You remained neutral and refocused the conversation on Arthur. This aligns with the <strong>MCA Section 4 checklist</strong> — consulting those close to the patient to ascertain his <em>past and present wishes, feelings, beliefs and values</em>.`,
        feedbackType: 'success',
      },
    ],
  },
  {
    id: 3,
    title: 'Stage 3: The Recommendation',
    context: `The MDT has assessed that a PEG tube would not improve Arthur's quality of life and may cause him distress. Based on everything you have heard from the family, you need to communicate the clinical recommendation.\n\nHow do you deliver this?`,
    question: 'Choose the most effective way to communicate the recommendation:',
    options: [
      {
        label: 'A',
        text: '"The MDT has decided a PEG isn\'t in his Best Interests. We will start end-of-life care instead. Do you have any questions?"',
        correct: false,
        outcome: 'Sarah starts crying again. David feels the decision was "done to them" rather than "with them."',
        feedback: `<strong>Clinical/Legal Failure.</strong> While the clinical conclusion may be correct, the communication failed. Stating the MDT "decided" excludes the family from the Best Interests process. Under the MCA, the Best Interests decision must involve consultation with those close to the patient — it is a collaborative process, not a notification.`,
        feedbackType: 'error',
      },
      {
        label: 'B',
        text: '"Based on what you\'ve told me about Arthur\'s love for independence, and our clinical assessment that a tube wouldn\'t help him get stronger, we recommend focusing on his comfort — careful hand feeding for pleasure, rather than a tube. How does that sound in light of what Arthur valued?"',
        correct: true,
        outcome: 'The family agrees. They feel Arthur\'s voice was heard through them.',
        feedback: `<strong>✓ Scenario Complete.</strong> You successfully balanced the 7-38-55 Rule with the MCA. By linking the clinical recommendation to <strong>Arthur's own values</strong> and inviting the family's perspective, you conducted a genuine Best Interests process — treating it as a discovery, not a directive.`,
        feedbackType: 'success',
      },
    ],
  },
];

let _currentStage  = 1;
let _stageResults  = {};   // { stageId: true|false }
let _scenarioDone  = false;
window._scenarioResult = null;

function startScenario() {
  const intro = document.getElementById('scenario-intro');
  const stages = document.getElementById('scenario-stages');
  if (intro)  intro.style.display = 'none';
  if (stages) stages.style.display = 'block';
  _showStage(1);
}

function _showStage(n) {
  _currentStage = n;

  // Hide all stages
  document.querySelectorAll('.scenario-stage').forEach(s => s.classList.remove('active'));

  const stageEl = document.getElementById('stage-' + n);
  if (stageEl) stageEl.classList.add('active');

  // Update tracker
  _updateTracker(n);
}

function _updateTracker(current) {
  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById('tracker-dot-' + i);
    if (!dot) continue;
    dot.className = 'tracker-dot';
    if (_stageResults[i] === true) dot.classList.add('done');
    else if (i === current)        dot.classList.add('current');
  }
}

function chooseOption(stageId, optionLabel) {
  const stage = scenarioStages.find(s => s.id === stageId);
  if (!stage) return;

  const opt = stage.options.find(o => o.label === optionLabel);
  if (!opt) return;

  // Disable all buttons in this stage
  document.querySelectorAll(`#stage-${stageId} .stage-option`).forEach(b => b.disabled = true);

  // Show feedback
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

  // Show action buttons
  const actions = document.getElementById('stage-' + stageId + '-actions');
  if (actions) actions.style.display = 'flex';

  if (opt.correct) {
    _stageResults[stageId] = true;
    _updateTracker(_currentStage);

    // Show 'Next Stage' button or complete
    const nextBtn   = document.getElementById('stage-' + stageId + '-next');
    const retryBtn  = document.getElementById('stage-' + stageId + '-retry');
    if (nextBtn)  nextBtn.hidden = false;
    if (retryBtn) retryBtn.hidden = true;

    if (stageId === 3) {
      // All done
      _scenarioDone = true;
      window._scenarioResult = 'completed';
      _unlockScenarioContinue();
    }
  } else {
    // Show retry
    const nextBtn  = document.getElementById('stage-' + stageId + '-next');
    const retryBtn = document.getElementById('stage-' + stageId + '-retry');
    if (nextBtn)  nextBtn.hidden = true;
    if (retryBtn) retryBtn.hidden = false;
  }
}

function retryStage(stageId) {
  // Re-enable buttons
  document.querySelectorAll(`#stage-${stageId} .stage-option`).forEach(b => b.disabled = false);

  // Hide feedback
  const fb = document.getElementById('stage-' + stageId + '-feedback');
  if (fb) { fb.className = 'stage-feedback'; fb.innerHTML = ''; }

  // Hide actions
  const actions = document.getElementById('stage-' + stageId + '-actions');
  if (actions) actions.style.display = 'none';
}

function nextStage(fromStage) {
  const next = fromStage + 1;
  if (next <= 3) {
    _showStage(next);
  }
}

function _unlockScenarioContinue() {
  const lock = document.getElementById('scenario-locked-msg');
  const btn  = document.getElementById('scenario-continue-btn');
  if (lock) lock.style.display = 'none';
  if (btn)  btn.hidden = false;
}

document.addEventListener('pagesLoaded', () => {
  const lock = document.getElementById('scenario-locked-msg');
  const btn  = document.getElementById('scenario-continue-btn');
  if (lock) lock.style.display = '';
  if (btn)  btn.hidden = true;
});
