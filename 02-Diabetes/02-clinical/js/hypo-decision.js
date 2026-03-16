/* hypo-decision.js — Three branching hypo management scenarios */
'use strict';

const HYPO_SCENARIOS = [
  {
    id: 'sc1',
    title: 'Scenario 1',
    setup: 'Mrs Ahmed is 78, Type 2 on a Sulphonylurea, found drowsy in her chair. Blood glucose: 2.8 mmol/L. She is still conscious and can respond to simple commands. Her swallowing reflex appears intact.',
    question: 'What is your immediate next step?',
    options: [
      { text: 'Give 150–200ml of fruit juice or Lucozade orally', correct: true,  feedback: 'Correct. She is conscious with an intact swallow — oral fast-acting glucose is safe, effective, and the first-line response. Retest in 15 minutes and contact the prescriber to stop or reduce the sulphonylurea.' },
      { text: 'Administer Glucagon IM as she is too drowsy to drink safely', correct: false, feedback: 'Not yet. Glucagon is reserved for patients who cannot swallow safely or are unconscious. Mrs Ahmed is conscious and can swallow — try oral glucose first. Glucagon also requires more time to act and has side effects.' },
      { text: 'Call 999 for IV glucose as blood glucose is below 3.0', correct: false, feedback: 'Not at this stage. IV glucose via 999 is for patients who cannot receive oral or IM treatment. Mrs Ahmed can swallow — start with oral glucose immediately. Call for help only if she deteriorates or fails to respond.' },
    ]
  },
  {
    id: 'sc2',
    title: 'Scenario 2',
    setup: 'Mr Patel is 82, Type 1 Diabetes, in the last days of life. He is unresponsive and cannot swallow. Blood glucose: 2.1 mmol/L. His Advance Care Plan states he wishes to remain at home with no hospital transfer.',
    question: 'Which management approach is most appropriate?',
    options: [
      { text: 'Call 999 for IV 10% glucose — hypoglycaemia must be corrected', correct: false, feedback: 'His Advance Care Plan clearly states no hospital transfer. Calling 999 for IV treatment would override his documented wishes. Clinical need must be balanced with patient autonomy — his ACP guides this decision.' },
      { text: 'Attempt to give oral glucose by placing a sugary drink between his lips', correct: false, feedback: 'Never attempt to give anything by mouth to an unconscious or unresponsive patient — risk of aspiration is significant and life-threatening. This approach must not be used when a patient cannot swallow safely.' },
      { text: 'Consider Glucagon IM/SC if in keeping with the care plan, and discuss with the palliative team', correct: true, feedback: 'Correct. For an unresponsive patient in the community, Glucagon IM or SC is the appropriate intervention — it does not require IV access and is deliverable in the home setting. The decision must align with his ACP, and the palliative team should be involved to review the overall insulin regimen.' },
    ]
  },
  {
    id: 'sc3',
    title: 'Scenario 3',
    setup: 'Mrs Clarke, 69, Type 1. She\'s been eating very little for three days — only sips of water. She is alert but pale and trembling. No blood glucose monitor is available on the visit. She has been taking her usual insulin dose.',
    question: 'How should this be managed?',
    options: [
      { text: 'Wait until a glucose monitor is available before treating', correct: false, feedback: 'With classic symptoms (tremor, pallor, reduced intake with unchanged insulin dose), waiting for a meter risks rapid deterioration. Clinical suspicion is sufficient to treat when in doubt. In a pre-terminal patient, the risk of under-treating hypoglycaemia outweighs the risk of over-treating suspected hypoglycaemia.' },
      { text: 'Treat presumptively with oral glucose and arrange urgent medication review', correct: true, feedback: 'Correct. The clinical picture — tremors, pallor, minimal intake, unchanged insulin dose — is strongly suggestive of hypoglycaemia. Treat presumptively with oral glucose while she can swallow. Then arrange urgent review of her insulin dose: as intake has dropped, her basal dose should be reduced by at least 20–30% and bolus doses stopped.' },
      { text: 'Reduce insulin dose only — do not give glucose without a confirmed reading', correct: false, feedback: 'Reducing the insulin is the right medium-term action, but her immediate symptoms need treating now. A patient with tremors and pallor who hasn\'t eaten in three days should receive glucose immediately. Documentation can follow treatment.' },
    ]
  }
];

const hdAnswered = {};

function initHypoDecision() {
  const wrap = document.getElementById('hypo-dt-wrap');
  if (!wrap) return;
  wrap.innerHTML = HYPO_SCENARIOS.map(sc => `
    <div class="hd-scenario" id="hd-${sc.id}" role="region" aria-labelledby="hd-title-${sc.id}">
      <div class="hd-header">
        <div class="hd-num">${sc.title.split(' ')[1]}</div>
        <div id="hd-title-${sc.id}" class="hd-title">${sc.title}</div>
      </div>
      <div class="hd-setup">${sc.setup}</div>
      <div class="hd-question">${sc.question}</div>
      <div class="hd-options" id="hd-opts-${sc.id}">
        ${sc.options.map((opt, i) => `
          <button class="hd-option" id="hdopt-${sc.id}-${i}"
                  onclick="answerHypoDecision('${sc.id}',${i})"
                  aria-label="Option ${String.fromCharCode(65+i)}: ${opt.text}">
            <div class="hd-opt-letter">${String.fromCharCode(65+i)}</div>
            <div class="hd-opt-text">${opt.text}</div>
          </button>`).join('')}
      </div>
      <div class="hd-feedback" id="hd-fb-${sc.id}" style="display:none;" role="alert" aria-live="polite"></div>
    </div>`).join('');
}

function answerHypoDecision(scId, optIdx) {
  if (hdAnswered[scId] !== undefined) return;
  hdAnswered[scId] = optIdx;

  const sc  = HYPO_SCENARIOS.find(s => s.id === scId);
  const opt = sc.options[optIdx];

  sc.options.forEach((_, i) => {
    const btn = document.getElementById(`hdopt-${scId}-${i}`);
    if (!btn) return;
    btn.disabled = true;
    if (sc.options[i].correct)         btn.classList.add('hd-correct');
    else if (i === optIdx && !opt.correct) btn.classList.add('hd-incorrect');
  });

  const fb = document.getElementById(`hd-fb-${scId}`);
  if (fb) {
    fb.style.display = 'block';
    fb.className = `hd-feedback ${opt.correct ? 'hd-fb-correct' : 'hd-fb-wrong'}`;
    fb.innerHTML = `<span class="hd-fb-icon">${opt.correct ? '✅' : '❌'}</span> ${opt.feedback}`;
  }

  if (Object.keys(hdAnswered).length === HYPO_SCENARIOS.length) {
    const comp = document.getElementById('hypo-dt-complete');
    if (comp) { comp.hidden = false; comp.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  }
}
