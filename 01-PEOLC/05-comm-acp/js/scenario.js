/* ══════════════════════════════════════════════════════════
   js/scenario.js  ·  Page 8 — Best Interests Branching Scenario
   Full divergent tree: a wrong choice sends the learner down a
   genuinely different path (not an instant retry of the same stage).
   Two "damage control / repair" stages can end the meeting early.
   The only way back to try a different path is Reset.
══════════════════════════════════════════════════════════ */

/* ── Avatar helper ──────────────────────────────────────────
   who: 'clinician' | 'david' | 'sarah' | 'door' | 'sofa' | 'handshake' | 'heart' | 'clipboard'
   mood (for clinician): 'neutral' | 'warm'
   mood (for david/sarah): 'angry' | 'sad' | 'defensive' | 'calm' | 'warm' | 'reflective' | 'relieved' | 'walkaway'
──────────────────────────────────────────────────────────── */
function _avatar(who, mood) {
  let symbol, moodClass;
  if (who === 'clinician') {
    symbol = mood === 'warm' ? 'bi-clinician-warm' : 'bi-clinician-neutral';
    moodClass = mood === 'warm' ? 'mood-warm-clinician' : 'mood-neutral-clinician';
  } else if (who === 'door' || who === 'sofa' || who === 'clipboard') {
    symbol = 'bi-' + who; moodClass = 'mood-object';
  } else if (who === 'handshake' || who === 'heart') {
    symbol = 'bi-' + who; moodClass = 'mood-warm';
  } else {
    symbol = 'bi-person-' + mood; moodClass = 'mood-' + mood;
  }
  return `<svg class="scene-avatar ${moodClass}" aria-hidden="true" focusable="false"><use href="#${symbol}"></use></svg>`;
}

/* ── The branching graph ─────────────────────────────────── */
const scenarioGraph = {
  start: 'stage1',

  nodes: {

    stage1: {
      label: 'The Opening',
      entryScene: {
        mood: 'scene-mood-neutral', tag: 'Briefing', tagClass: '',
        caption: 'The family room — David and Sarah are waiting.',
        avatars: [_avatar('door'), _avatar('sofa')],
      },
      context: `You enter the family room. David looks angry; Sarah is crying.`,
      question: 'How do you begin?',
      options: {
        A: {
          text: `Stand by the door and say, "I'm here to discuss the PEG tube. We need a decision quickly as the ward is very busy."`,
          correct: false,
          outcome: `David snaps: "You're just treating him like a bed number!"`,
          feedback: `<strong>Communication Failure.</strong> By standing at the door (55% Body Language = disengagement) and mentioning the ward's busyness (38% Tone = task over person), you signalled that the decision matters more than the family. This puts the whole conversation on the back foot before it's begun.`,
          scene: { mood: 'scene-mood-fail', tag: 'Stage 1 — Communication Failure', tagClass: 'tag-fail',
            caption: `David snaps: "You're just treating him like a bed number!"`,
            avatars: [_avatar('clinician', 'neutral'), _avatar('david', 'angry'), _avatar('sarah', 'sad')] },
          next: 'stage2a',
        },
        B: {
          text: `Sit down at the table, lean forward slightly, and say in a calm, soft tone: "Thank you for meeting me. I can see this is incredibly difficult. Before we talk about medical options, could you tell me more about what Arthur was like before he became unwell?"`,
          correct: true,
          outcome: `Sarah stops crying and nods. David's shoulders relax.`,
          feedback: `<strong>✓ Success.</strong> By sitting at eye level and using a calm, soft tone, you've used your 55% (Body Language) and 38% (Tone) to remove psychological barriers. Asking about Arthur as a person follows <strong>MCA Principle 4 (Best Interests)</strong> — beginning by seeking his past values and beliefs.`,
          scene: { mood: 'scene-mood-success', tag: 'Stage 1 — Success', tagClass: 'tag-success',
            caption: `Sarah stops crying and nods. David's shoulders relax.`,
            avatars: [_avatar('clinician', 'neutral'), _avatar('david', 'calm'), _avatar('sarah', 'calm')] },
          next: 'stage2b',
        },
      },
    },

    stage2a: {
      label: 'Damage Control',
      entryScene: { mood: 'scene-mood-fail', tag: 'Stage 2 — Damage Control', tagClass: 'tag-fail',
        caption: `The room is tense. David has his arms crossed; Sarah won't meet your eye.`,
        avatars: [_avatar('clinician', 'neutral'), _avatar('david', 'defensive'), _avatar('sarah', 'sad')] },
      context: `Your opening has put David and Sarah on edge. David folds his arms; Sarah stares at the floor, no longer looking at you. The silence is heavy.`,
      question: 'How do you recover?',
      options: {
        A: {
          text: `"There's no need to feel that way — I only meant that time matters clinically. Let's move on and talk about the PEG tube options."`,
          correct: false,
          outcome: `David stands up. "I want to speak to your manager — right now."`,
          feedback: `This brushes past the harm caused rather than repairing it. Under the MCA, a family who feels dismissed will disengage from the Best Interests consultation duty entirely — and once trust is gone this early, minimising their reaction rather than naming it can end the meeting altogether.`,
          scene: { mood: 'scene-mood-earlyfail', tag: 'Damage Control — Failed', tagClass: 'tag-fail',
            caption: `David stands up. "I want to speak to your manager — right now."`,
            avatars: [_avatar('clinician', 'neutral'), _avatar('david', 'angry'), _avatar('sarah', 'walkaway')] },
          end: 'ending-complaint',
        },
        B: {
          text: `"I'm sorry — that came out wrong, and I can see it landed badly. Can we start again? I'd really like to understand what mattered to Arthur, in your own time."`,
          correct: true,
          outcome: `David unfolds his arms, just slightly. Sarah looks up.`,
          feedback: `Acknowledging the misstep — not just apologising for it, but naming it — is a genuine repair. It re-opens the door to the collaborative, person-centred process the MCA requires. The family may stay more cautious for the rest of the conversation, but you're back in the room.`,
          scene: { mood: 'scene-mood-weak', tag: 'Damage Control — Recovered, Cautiously', tagClass: 'tag-weak',
            caption: `David unfolds his arms, just slightly. Sarah looks up.`,
            avatars: [_avatar('clinician', 'warm'), _avatar('david', 'defensive'), _avatar('sarah', 'reflective')] },
          next: 'stage3-recovered',
        },
      },
    },

    stage2b: {
      label: 'Navigating Conflict',
      entryScene: { mood: 'scene-mood-success', tag: 'Stage 2 — Navigating Conflict', tagClass: '',
        caption: `David and Sarah are both talking now — but pulling in different directions.`,
        avatars: [_avatar('clinician', 'neutral'), _avatar('david', 'angry'), _avatar('sarah', 'reflective')] },
      context: `David says, "He needs the tube! You can't just let him starve." Sarah whispers, "But Dad always said he never wanted to be a burden or hooked up to machines."`,
      question: 'How do you respond?',
      options: {
        A: {
          text: `"Sarah is right — we have to follow the least restrictive option. A feeding tube is quite invasive, so we should probably avoid it."`,
          correct: false,
          outcome: `David becomes defensive. "I want to speak to your manager."`,
          feedback: `<strong>Communication Failure.</strong> You took a side in a family dispute and used clinical jargon (<em>"least restrictive"</em>) before the family was ready to hear it. This increases conflict and removes Arthur from the centre of the conversation.`,
          scene: { mood: 'scene-mood-fail', tag: 'Stage 2 — Communication Failure', tagClass: 'tag-fail',
            caption: `David becomes defensive. "I want to speak to your manager."`,
            avatars: [_avatar('clinician', 'neutral'), _avatar('david', 'angry'), _avatar('sarah', 'sad')] },
          next: 'stage2b-recovery',
        },
        B: {
          text: `"David, I hear your concern about his comfort. Sarah, you've mentioned his past wishes. Under the Mental Capacity Act, our goal isn't to choose what you want, but to work together to figure out what Arthur would want if he could speak for himself today."`,
          correct: true,
          outcome: `Both siblings go quiet. David says, "He was a very independent man. He hated being fussed over."`,
          feedback: `<strong>✓ Success.</strong> You remained neutral and refocused the conversation on Arthur. This aligns with the <strong>MCA Section 4 checklist</strong> — consulting those close to the patient to ascertain his <em>past and present wishes, feelings, beliefs and values</em>.`,
          scene: { mood: 'scene-mood-success', tag: 'Stage 2 — Success', tagClass: 'tag-success',
            caption: `David: "He was a very independent man. He hated being fussed over."`,
            avatars: [_avatar('clinician', 'neutral'), _avatar('david', 'reflective'), _avatar('sarah', 'reflective')] },
          next: 'stage3-trusted',
        },
      },
    },

    'stage2b-recovery': {
      label: 'Repairing Mid-Conversation',
      entryScene: { mood: 'scene-mood-fail', tag: 'Stage 2 — Repairing Mid-Conversation', tagClass: 'tag-fail',
        caption: `David sits back, jaw tight. "So you've already decided, then?"`,
        avatars: [_avatar('clinician', 'neutral'), _avatar('david', 'defensive'), _avatar('sarah', 'reflective')] },
      context: `David sits back, jaw tight. "So you've already decided, then?" Sarah looks between you both, unsure whether to speak again.`,
      question: 'How do you respond?',
      options: {
        A: {
          text: `"No, I haven't decided anything — I was simply explaining the clinical guidance. It's important you understand the risks of the tube."`,
          correct: false,
          outcome: `David gets up and opens the door. "We're done here. Send someone else."`,
          feedback: `Repeating the clinical justification instead of naming what went wrong keeps the focus on being right rather than being heard. Without the family's trust, the consultation duty in s.4 MCA cannot be properly discharged — and this family has now had that trust tested twice.`,
          scene: { mood: 'scene-mood-earlyfail', tag: 'Repair Failed', tagClass: 'tag-fail',
            caption: `David gets up and opens the door. "We're done here. Send someone else."`,
            avatars: [_avatar('clinician', 'neutral'), _avatar('david', 'walkaway'), _avatar('sarah', 'walkaway')] },
          end: 'ending-disengage',
        },
        B: {
          text: `"I'm sorry, David — I didn't mean to suggest the decision is already made. Nothing is decided yet. I really do want to hear what you both think Arthur would have wanted."`,
          correct: true,
          outcome: `David stays seated. Sarah exhales, relieved the conversation didn't end there.`,
          feedback: `Naming the misstep directly and reaffirming that no decision has been made rebuilds the process as genuinely collaborative. It costs you some ground — David is still watching you closely — but the conversation can continue.`,
          scene: { mood: 'scene-mood-weak', tag: 'Repaired, Just', tagClass: 'tag-weak',
            caption: `David stays seated. Sarah exhales, relieved the conversation didn't end there.`,
            avatars: [_avatar('clinician', 'warm'), _avatar('david', 'defensive'), _avatar('sarah', 'relieved')] },
          next: 'stage3-strained',
        },
      },
    },

    'stage3-trusted': {
      label: 'The Recommendation',
      entryScene: { mood: 'scene-mood-success', tag: 'Stage 3 — The Recommendation', tagClass: '',
        caption: `The MDT's assessment is in. David and Sarah are listening closely, engaged.`,
        avatars: [_avatar('clinician', 'neutral'), _avatar('david', 'calm'), _avatar('sarah', 'calm')] },
      context: `The MDT has assessed that a PEG tube would not improve Arthur's quality of life and may cause him distress. David and Sarah have been open with you throughout. Based on everything you've heard, you need to communicate the clinical recommendation.`,
      question: 'How do you deliver this?',
      options: {
        A: {
          text: `"The MDT has decided a PEG isn't in his Best Interests. We will start end-of-life care instead. Do you have any questions?"`,
          correct: false,
          outcome: `Sarah starts crying again. David feels the decision was "done to them," not "with them."`,
          feedback: `<strong>Clinical/Legal Failure.</strong> Even with a strong relationship built up until now, saying the MDT "decided" excludes the family at the final, most important moment. Best Interests is a collaborative process throughout — not just at the start.`,
          scene: { mood: 'scene-mood-fail', tag: 'Clinical/Legal Failure', tagClass: 'tag-fail',
            caption: `Sarah starts crying again. David feels the decision was "done to them."`,
            avatars: [_avatar('clinician', 'neutral'), _avatar('david', 'sad'), _avatar('sarah', 'sad')] },
          end: 'ending-undone',
        },
        B: {
          text: `"Based on what you've told me about Arthur's love for independence, and our clinical assessment that a tube wouldn't help him get stronger, we recommend focusing on his comfort — careful hand feeding for pleasure, rather than a tube. How does that sound in light of what Arthur valued?"`,
          correct: true,
          outcome: `The family agrees. They feel Arthur's voice was heard through them.`,
          feedback: `<strong>✓ Success.</strong> You linked the clinical recommendation to Arthur's own values and invited the family's perspective — a genuine Best Interests process from start to finish.`,
          scene: { mood: 'scene-mood-best', tag: 'Scenario Complete', tagClass: 'tag-best',
            caption: `The family agrees. They feel Arthur's voice was heard through them.`,
            avatars: [_avatar('clinician', 'warm'), _avatar('david', 'warm'), _avatar('sarah', 'relieved')] },
          end: 'ending-best',
        },
      },
    },

    'stage3-strained': {
      label: 'The Recommendation, After a Rocky Conversation',
      entryScene: { mood: 'scene-mood-weak', tag: 'Stage 3 — A Rocky Road', tagClass: 'tag-weak',
        caption: `The conversation has settled, but David is still watching you carefully.`,
        avatars: [_avatar('clinician', 'neutral'), _avatar('david', 'defensive'), _avatar('sarah', 'calm')] },
      context: `The MDT has assessed that a PEG tube would not improve Arthur's quality of life. The conversation has been tense, and David is still watching you for any sign you're not being straight with them. You need to deliver the clinical recommendation.`,
      question: 'How do you deliver this?',
      options: {
        A: {
          text: `"The MDT has decided a PEG isn't in his Best Interests. We will start end-of-life care instead. Do you have any questions?"`,
          correct: false,
          outcome: `David: "Fine. Whatever you think is best." He doesn't sound convinced.`,
          feedback: `After a conversation David was already wary of, announcing a decision rather than inviting him in confirms his worst fear — that his input never really mattered. He may agree, but only because he feels there's no point arguing.`,
          scene: { mood: 'scene-mood-weak', tag: 'Reluctant Agreement', tagClass: 'tag-weak',
            caption: `David: "Fine. Whatever you think is best." He doesn't sound convinced.`,
            avatars: [_avatar('clinician', 'neutral'), _avatar('david', 'defensive'), _avatar('sarah', 'sad')] },
          end: 'ending-reluctant',
        },
        B: {
          text: `"I know this conversation hasn't been easy, and I want to be honest with you both. Based on what you've told me about Arthur's independence, and our clinical view that a tube won't help him get stronger, we'd recommend focusing on his comfort instead. What do you both think, in light of what Arthur valued?"`,
          correct: true,
          outcome: `David finally sits back properly. "Thank you for being straight with us."`,
          feedback: `Naming that the conversation was difficult, and still inviting the family in despite it, is what rebuilds a Best Interests process after a rocky start. Trust returns slowly, not with one perfect line — but this repairs it in time for the decision that matters most.`,
          scene: { mood: 'scene-mood-success', tag: 'Trust Rebuilt', tagClass: 'tag-success',
            caption: `David finally sits back properly. "Thank you for being straight with us."`,
            avatars: [_avatar('clinician', 'warm'), _avatar('david', 'calm'), _avatar('sarah', 'relieved')] },
          end: 'ending-rebuilt',
        },
      },
    },

    'stage3-recovered': {
      label: 'The Recommendation, Carefully Rebuilt',
      entryScene: { mood: 'scene-mood-weak', tag: 'Stage 3 — Carefully Rebuilt', tagClass: 'tag-weak',
        caption: `David and Sarah are engaging again — cautiously.`,
        avatars: [_avatar('clinician', 'neutral'), _avatar('david', 'calm'), _avatar('sarah', 'reflective')] },
      context: `The MDT has assessed that a PEG tube would not improve Arthur's quality of life. Since your repair earlier, David and Sarah have engaged cautiously — watching you closely, but still in the room. You need to deliver the clinical recommendation.`,
      question: 'How do you deliver this?',
      options: {
        A: {
          text: `"The MDT has decided a PEG isn't in his Best Interests. We will start end-of-life care instead. Do you have any questions?"`,
          correct: false,
          outcome: `Sarah nods slowly, but David stays guarded. The trust never quite returned.`,
          feedback: `For a family who was already hurt once and only just began to trust you again, this confirms their fear that nothing really changed. The MCA's Best Interests process demands genuine, ongoing consultation — not a return to announcement at the final hurdle.`,
          scene: { mood: 'scene-mood-weak', tag: 'Too Little, Too Late', tagClass: 'tag-weak',
            caption: `Sarah nods slowly, but David stays guarded. The trust never quite returned.`,
            avatars: [_avatar('clinician', 'neutral'), _avatar('david', 'defensive'), _avatar('sarah', 'reflective')] },
          end: 'ending-toolittle',
        },
        B: {
          text: `"Based on everything you've shared about Arthur's independence, and our clinical view that a tube wouldn't help him get stronger, we'd recommend focusing on his comfort instead — with you both involved in what that looks like. What are your thoughts, given what mattered to him?"`,
          correct: true,
          outcome: `David reaches over and squeezes Sarah's hand. "I think that's what he'd have wanted."`,
          feedback: `Carrying the repair through to the final, highest-stakes moment shows the family the change was real, not just words. A difficult start doesn't have to define the outcome.`,
          scene: { mood: 'scene-mood-success', tag: 'Hard-Won Understanding', tagClass: 'tag-success',
            caption: `David reaches over and squeezes Sarah's hand. "I think that's what he'd have wanted."`,
            avatars: [_avatar('clinician', 'warm'), _avatar('david', 'warm'), _avatar('sarah', 'relieved')] },
          end: 'ending-hardwon',
        },
      },
    },
  },

  endings: {
    'ending-best': {
      title: 'Best Interests, Truly Met',
      tag: 'tag-best', tagLabel: 'Ideal outcome', success: true,
      narrative: `The family agrees. They feel Arthur's voice was heard through them — not overridden by it.`,
      feedback: `<strong>You balanced the 7-38-55 Rule with the MCA at every stage.</strong> By using calm tone and open body language from the outset, and by consistently linking the clinical recommendation back to Arthur's own values, you conducted a genuine Best Interests process throughout — treating it as a discovery, not a directive.`,
      scene: { mood: 'scene-mood-best', avatars: [_avatar('handshake'), _avatar('heart')] },
    },
    'ending-undone': {
      title: 'Trust Undone at the Last Step',
      tag: 'tag-fail', tagLabel: 'Strong start, poor finish', success: false,
      narrative: `Sarah is crying again. David feels the decision was done to them, not with them — despite everything that came before.`,
      feedback: `You built real trust in Stages 1 and 2, but announcing the MDT's decision rather than inviting the family into it undid that work at the moment it mattered most. <strong>Best Interests is a collaborative process from the first minute to the last</strong> — good rapport early on doesn't bank credit you can spend on a rushed ending.`,
      scene: { mood: 'scene-mood-fail', avatars: [_avatar('clipboard'), _avatar('sarah', 'sad')] },
    },
    'ending-rebuilt': {
      title: 'Trust Rebuilt, Just in Time',
      tag: 'tag-good', tagLabel: 'Recovered outcome', success: true,
      narrative: `David finally sits back properly. "Thank you for being straight with us." It wasn't an easy conversation, but they got there together.`,
      feedback: `A misstep in Stage 2 could easily have ended this meeting. Instead, naming the mistake directly and staying honest all the way through the final recommendation rebuilt enough trust for a genuine agreement. <strong>Repair is possible under the MCA — but it has to be sustained, not just offered once.</strong>`,
      scene: { mood: 'scene-mood-success', avatars: [_avatar('handshake'), _avatar('sarah', 'relieved')] },
    },
    'ending-reluctant': {
      title: 'Reluctant Compliance',
      tag: 'tag-weak', tagLabel: 'Hollow outcome', success: false,
      narrative: `David: "Fine. Whatever you think is best." He agrees — but only because he's stopped believing it's worth arguing.`,
      feedback: `The family technically agreed, but David never felt genuinely consulted after the earlier conflict. An outcome reached because a family has given up is not the same as an outcome reached <em>with</em> them. <strong>The MCA's Best Interests process is about how the decision is reached, not just what the decision is.</strong>`,
      scene: { mood: 'scene-mood-weak', avatars: [_avatar('clipboard'), _avatar('david', 'defensive')] },
    },
    'ending-hardwon': {
      title: 'A Hard-Won Understanding',
      tag: 'tag-good', tagLabel: 'Recovered outcome', success: true,
      narrative: `David reaches over and squeezes Sarah's hand. "I think that's what he'd have wanted." A difficult opening didn't define where this ended up.`,
      feedback: `Your first attempt at rapport-building damaged the family's trust — but a genuine, immediate repair, followed through consistently to the final recommendation, earned it back. <strong>This is what a real Best Interests process looks like after a stumble: not a perfect start, but a sustained one.</strong>`,
      scene: { mood: 'scene-mood-success', avatars: [_avatar('heart'), _avatar('handshake')] },
    },
    'ending-toolittle': {
      title: 'Too Little, Too Late',
      tag: 'tag-weak', tagLabel: 'Hollow outcome', success: false,
      narrative: `Sarah nods slowly, but David stays guarded. The family technically agrees, but the trust never quite returned.`,
      feedback: `A single apology after the opening misstep wasn't enough on its own — and reverting to a top-down announcement at the final stage confirmed David's fear that nothing had really changed. <strong>Repair has to be carried all the way through the conversation, especially at the highest-stakes moment.</strong>`,
      scene: { mood: 'scene-mood-weak', avatars: [_avatar('clipboard'), _avatar('david', 'defensive')] },
    },
    'ending-complaint': {
      title: 'Complaint Escalation',
      tag: 'tag-fail', tagLabel: 'Meeting ended early', success: false, earlyStop: true,
      narrative: `David stands up. "I want to speak to your manager — right now." Sarah won't meet your eye. The meeting ends here — Arthur's own voice was never properly sought.`,
      feedback: `This is what a Best Interests conversation can look like when an early misstep is defended rather than repaired. Once a family feels unheard, minimising their reaction — rather than naming it and slowing down — can end the conversation altogether, before the Section 4 consultation has even really begun.`,
      scene: { mood: 'scene-mood-earlyfail', avatars: [_avatar('door'), _avatar('david', 'angry')] },
    },
    'ending-disengage': {
      title: 'Family Disengages',
      tag: 'tag-fail', tagLabel: 'Meeting ended early', success: false, earlyStop: true,
      narrative: `David gets up and opens the door. "We're done here. Send someone else." Sarah follows him out without a word.`,
      feedback: `Defending your position instead of naming what went wrong, twice in a row, told this family that being right mattered more than being heard. The Best Interests process depends on the family staying in the room — and this one has walked out before Arthur's voice could be properly sought.`,
      scene: { mood: 'scene-mood-earlyfail', avatars: [_avatar('door'), _avatar('sarah', 'walkaway')] },
    },
  },
};

/* ── State ─────────────────────────────────────────────── */
let _currentNodeId = null;
let _path = [];          // [{ nodeId, label, optionLabel, correct }]
let _started = false;

/* ── Scene panel ─────────────────────────────────────────── */
function _setScene(scene) {
  const panel = document.getElementById('scene-panel');
  const figs  = document.getElementById('scene-figures');
  const tag   = document.getElementById('scene-stage-tag');
  const cap   = document.getElementById('scene-caption-text');
  if (!panel) return;
  panel.className = 'scene-image-wrap ' + scene.mood;
  if (figs) figs.innerHTML = scene.avatars.join('');
  if (tag) { tag.textContent = scene.tag || ''; tag.className = 'scene-stage-tag ' + (scene.tagClass || ''); }
  if (cap) cap.textContent = scene.caption || '';
}

/* ── Breadcrumb ──────────────────────────────────────────── */
function _renderBreadcrumb(currentLabel) {
  const el = document.getElementById('scenario-breadcrumb');
  if (!el) return;
  const parts = _path.map(step =>
    `<span class="breadcrumb-step${step.correct === false ? ' step-off-track' : ''}">${step.label}</span>`
  );
  if (currentLabel) parts.push(`<span class="breadcrumb-step step-current">${currentLabel}</span>`);
  el.innerHTML = parts.join('<span class="breadcrumb-arrow" aria-hidden="true">→</span>');
}

/* ── Start ──────────────────────────────────────────────── */
function startScenario() {
  const intro    = document.getElementById('scenario-intro-panel');
  const stageBox = document.getElementById('scenario-stage-container');
  const endBox   = document.getElementById('scenario-ending-container');
  const resetBtn = document.getElementById('scenario-reset-btn');
  if (intro)    intro.style.display = 'none';
  if (stageBox) stageBox.style.display = 'block';
  if (endBox)   endBox.style.display = 'none';
  if (resetBtn) resetBtn.hidden = false;

  _started = true;
  _path = [];
  XAPI.experienced('scenario/best-interests', 'The Best Interests Conversation');
  _goToNode(scenarioGraph.start);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Render a stage node ─────────────────────────────────── */
function _goToNode(nodeId) {
  const node = scenarioGraph.nodes[nodeId];
  if (!node) return;
  _currentNodeId = nodeId;

  _setScene(node.entryScene);
  _renderBreadcrumb(node.label);

  const stepNum = _path.length + 1;
  const box = document.getElementById('scenario-stage-container');
  if (!box) return;

  const optionsHtml = Object.entries(node.options).map(([key, opt]) => `
    <button class="stage-option" id="opt-${key}" onclick="chooseOption('${key}')" aria-label="Option ${key}">
      <span class="stage-opt-letter" aria-hidden="true">${key}</span>
      <span class="stage-opt-text">${opt.text}</span>
    </button>`).join('');

  box.innerHTML = `
    <div class="scenario-stage active" id="current-stage">
      <div class="stage-header">
        <span class="stage-badge">Step ${stepNum}</span>
        <span class="stage-title">${node.label}</span>
      </div>
      <div class="stage-context">
        ${node.context}
        <div class="stage-question">${node.question}</div>
      </div>
      <div class="stage-options" role="group" aria-label="${node.label} options">
        ${optionsHtml}
      </div>
      <div class="stage-feedback" id="stage-feedback" role="alert" aria-live="polite"></div>
      <div class="stage-actions" id="stage-actions" style="display:none;">
        <button class="btn btn-primary" id="stage-continue-btn" onclick="advanceFromChoice()">Continue →</button>
      </div>
    </div>`;

  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Choose an option ────────────────────────────────────── */
function chooseOption(optionLabel) {
  const node = scenarioGraph.nodes[_currentNodeId];
  if (!node) return;
  const opt = node.options[optionLabel];
  if (!opt) return;

  document.querySelectorAll('#current-stage .stage-option').forEach(b => b.disabled = true);

  _setScene(opt.scene);

  const fb = document.getElementById('stage-feedback');
  if (fb) {
    fb.className = 'stage-feedback show ' + (opt.correct ? 'success' : 'error');
    fb.innerHTML = `
      <div class="stage-feedback-header">
        <span>${opt.correct ? '✓' : '✗'}</span>
        <span>${opt.outcome}</span>
      </div>
      <div class="stage-feedback-body">${opt.feedback}</div>`;
  }
  const actions = document.getElementById('stage-actions');
  if (actions) actions.style.display = 'flex';

  // Record this step in the path taken
  _path.push({ nodeId: _currentNodeId, label: node.label, optionLabel, correct: opt.correct });

  // Log the choice to the LRS — captures which path was taken, not just right/wrong
  XAPI.responded(
    'scenario/best-interests/' + _currentNodeId,
    node.label,
    optionLabel + ': ' + opt.outcome,
    { 'https://www.stbarnabashospice.co.uk/xapi/extensions/correct': opt.correct }
  );

  // Stash where to go next for the Continue button
  document.getElementById('stage-continue-btn').dataset.next = opt.next || '';
  document.getElementById('stage-continue-btn').dataset.end  = opt.end  || '';
}

/* ── Advance after reading feedback ─────────────────────── */
function advanceFromChoice() {
  const btn = document.getElementById('stage-continue-btn');
  if (!btn) return;
  const next = btn.dataset.next;
  const end  = btn.dataset.end;
  if (next) {
    _goToNode(next);
  } else if (end) {
    _renderEnding(end);
  }
}

/* ── Render an ending ─────────────────────────────────────── */
function _renderEnding(endingId) {
  const ending = scenarioGraph.endings[endingId];
  if (!ending) return;

  const stageBox = document.getElementById('scenario-stage-container');
  const endBox   = document.getElementById('scenario-ending-container');
  if (stageBox) stageBox.style.display = 'none';
  if (endBox)   endBox.style.display = 'block';

  _setScene(Object.assign({ tag: ending.tagLabel, tagClass: ending.tag, caption: ending.narrative }, ending.scene));
  _renderBreadcrumb(null);

  const pathHtml = _path.map(step =>
    `<span class="breadcrumb-step${step.correct === false ? ' step-off-track' : ''}">${step.label}: ${step.optionLabel}</span>`
  ).join('<span class="breadcrumb-arrow" aria-hidden="true">→</span>');

  if (endBox) {
    endBox.innerHTML = `
      <div class="scenario-ending">
        <span class="ending-tag ${ending.tag}">${ending.earlyStop ? '⏹ ' : ''}${ending.tagLabel}</span>
        <div class="ending-title">${ending.title}</div>
        <p class="ending-narrative">${ending.narrative}</p>
        <div class="ending-feedback">${ending.feedback}</div>
        <div class="ending-path-summary" aria-label="Path you took">${pathHtml}</div>
        <div class="ending-actions">
          <button class="btn btn-secondary" onclick="resetScenario()">↺ Reset &amp; Try a Different Path</button>
        </div>
      </div>`;
    endBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Expose the outcome for the Learning Record page (js/record.js)
  window._scenarioEndingTitle = ending.title;
  window._scenarioSuccess     = ending.success;
  window._scenarioPath        = _path.slice();

  // Score: how many of the choices on this path were the "right" one
  const correctCount = _path.filter(s => s.correct).length;
  XAPI.setCompletion('scenario/best-interests', 'The Best Interests Conversation', {
    success: ending.success,
    score: { raw: correctCount, min: 0, max: _path.length },
    responseId: endingId,
    extensions: {
      'https://www.stbarnabashospice.co.uk/xapi/extensions/path':
        _path.map(s => s.nodeId + ':' + s.optionLabel).join(','),
      'https://www.stbarnabashospice.co.uk/xapi/extensions/early-stop': !!ending.earlyStop,
    },
  });

  _unlockScenarioContinue();
}

/* ── Reset ────────────────────────────────────────────────── */
function resetScenario() {
  XAPI.loggedReset('scenario/best-interests', 'The Best Interests Conversation');

  _currentNodeId = null;
  _path = [];
  _started = false;

  const intro    = document.getElementById('scenario-intro-panel');
  const stageBox = document.getElementById('scenario-stage-container');
  const endBox   = document.getElementById('scenario-ending-container');
  const resetBtn = document.getElementById('scenario-reset-btn');
  if (intro)    intro.style.display = 'block';
  if (stageBox) { stageBox.style.display = 'none'; stageBox.innerHTML = ''; }
  if (endBox)   { endBox.style.display = 'none'; endBox.innerHTML = ''; }
  if (resetBtn) resetBtn.hidden = true;

  _setScene({
    mood: 'scene-mood-neutral', tag: 'Briefing', tagClass: '',
    caption: 'The family room — David and Sarah are waiting.',
    avatars: [_avatar('door'), _avatar('sofa')],
  });
  _renderBreadcrumb(null);

  // Re-lock the "Continue" course-nav control until a fresh ending is reached
  const lockEl  = document.getElementById('scenario-locked-msg');
  const contBtn = document.getElementById('scenario-continue-btn');
  if (lockEl)  lockEl.style.display = '';
  if (contBtn) { contBtn.setAttribute('hidden', ''); contBtn.style.display = 'none'; }

  const introPanel = document.getElementById('scenario-intro-panel');
  if (introPanel) introPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Continue unlock (course-level nav) ─────────────────── */
function _unlockScenarioContinue() {
  const lockEl  = document.getElementById('scenario-locked-msg');
  const contBtn = document.getElementById('scenario-continue-btn');
  if (lockEl)  lockEl.style.display = 'none';
  if (contBtn) { contBtn.removeAttribute('hidden'); contBtn.style.display = 'inline-flex'; }
}

document.addEventListener('pagesLoaded', () => {
  const lockEl  = document.getElementById('scenario-locked-msg');
  const contBtn = document.getElementById('scenario-continue-btn');
  const resetBtn = document.getElementById('scenario-reset-btn');
  if (lockEl)  lockEl.style.display = '';
  if (contBtn) { contBtn.setAttribute('hidden', ''); contBtn.style.display = 'none'; }
  if (resetBtn) resetBtn.hidden = true;
});
