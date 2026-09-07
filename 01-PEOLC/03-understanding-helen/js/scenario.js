/* ══════════════════════════════════════════════════════════
   scenario.js — Branching scenario (page 3)
   Two decision "beats": the choice players make changes what
   they see happen next (a reaction from Simon and Helen), not
   just a feedback message. A poor or so-so choice plays out
   its consequence and offers "Reset & Try Again"; only the
   best choice opens the door to what happens next.
══════════════════════════════════════════════════════════ */

const scenarioBeats = {

  1: {
    sceneLabel: '📍 Setting the Scene',
    sceneText: `You arrive at the family home for a routine visit. Simon is in the kitchen surrounded by
      unopened bills. Helen is in her armchair, breathing heavily. Sophie's bedroom door is shut.
      <br><br>
      Simon looks up, exhausted. <em>"Sorry about the mess. I've just come in from a shift and
      haven't checked on everyone yet."</em>`,
    question: 'How do you respond?',
    onBest: 'video',   // best choice unlocks the video, which then advances to beat 2
    answers: [
      {
        quality: 'best',
        label: '✅ Best Response',
        text: '"Simon, you look exhausted. Let\'s sit for a moment and talk about how you are managing."',
        ariaLabel: 'Acknowledge Simon\'s exhaustion',
        reactionIcon: '🙂',
        reaction: 'Simon\'s shoulders drop. He pulls out a chair and, for the first time in weeks, starts to really talk.',
        message: 'Acknowledging Simon\'s exhaustion first builds trust and opens the door to a deeper conversation — making it far more likely he\'ll disclose the real pressures the family is under. This is person-centred care in action.'
      },
      {
        quality: 'neutral',
        label: '⚠️ Acceptable — but incomplete',
        text: '"Helen, your breathing looks heavy. Let\'s check your oxygen levels first."',
        ariaLabel: 'Check Helen\'s oxygen levels first',
        reactionIcon: '😕',
        reaction: 'Helen nods and lets you check her oxygen. Simon quietly goes back to sorting the bills, unprompted and unheard.',
        message: 'Attending to Helen\'s immediate health need is reasonable, but it misses Simon\'s visible distress. A holistic approach means attending to the whole family — not just the clinical task in front of you.'
      },
      {
        quality: 'poor',
        label: '❌ Missed Opportunity',
        text: '"I have a lot of patients today, so let\'s just get through the vitals quickly."',
        ariaLabel: 'Get through the vitals quickly',
        reactionIcon: '😟',
        reaction: 'Simon\'s face closes off. "Right — of course," he says flatly, and doesn\'t speak again for the rest of the visit.',
        message: 'Rushing through the visit sends a clear message that their lives are simply a task to complete. This damages trust and makes it far less likely the family will open up about the real pressures they\'re facing.'
      }
    ]
  },

  2: {
    sceneLabel: '📍 A Little Later',
    sceneText: `Simon has just told you how much he's been carrying. As the conversation settles, Helen
      glances toward the hallway. <em>"Sophie hasn't come out of her room all day,"</em> Simon says quietly.`,
    question: 'What do you do?',
    onBest: 'page4',   // best choice moves on to Helen's Living Room
    answers: [
      {
        quality: 'best',
        label: '✅ Best Response',
        text: '"Would it be alright if I said a quick hello to Sophie before I go — no pressure, just so she knows I\'m here?"',
        ariaLabel: 'Offer to say a low-pressure hello to Sophie',
        reactionIcon: '🙂',
        reaction: 'Simon manages a small, grateful smile. "I think she\'d like that," he says. Sophie doesn\'t say much — but she opens the door.',
        message: 'Offering gentle, low-pressure contact respects Sophie\'s autonomy while showing the family she hasn\'t been forgotten — exactly what the Family &amp; Carer pillar calls for.'
      },
      {
        quality: 'neutral',
        label: '⚠️ Acceptable — but incomplete',
        text: '"I\'ll make a note to raise Sophie at the next multidisciplinary team meeting."',
        ariaLabel: 'Note Sophie for the MDT meeting',
        reactionIcon: '😕',
        reaction: 'It\'s the correct process — but Simon\'s face falls slightly. Right now, in this room, nothing changes for Sophie.',
        message: 'Escalating to the MDT is good practice and should still happen — but it isn\'t a substitute for a human moment today. Process and presence both matter.'
      },
      {
        quality: 'poor',
        label: '❌ Missed Opportunity',
        text: '"That\'s a shame, but let\'s focus on getting Helen\'s oxygen levels sorted for today."',
        ariaLabel: 'Move straight on to Helen\'s oxygen levels',
        reactionIcon: '😟',
        reaction: 'Simon looks away. Sophie\'s door stays shut, and the moment passes.',
        message: 'Moving straight past Sophie, even with good clinical intent, reinforces the message that only Helen\'s illness is being seen — not its impact on the whole family.'
      }
    ]
  }
};

let currentBeatNum = 1;
let currentAnswers = [];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderChoicesPanel() {
  currentBeatNum = 1;
  renderScenarioBeat();
}

function renderScenarioBeat() {
  const beat = scenarioBeats[currentBeatNum];
  const panel = document.getElementById('choices-panel-1');
  const context = document.getElementById('scenario-context');
  if (!panel || !beat) return;

  // Scene panel (left column)
  if (context) {
    context.className = 'scenario-context';
    context.innerHTML = `
      <div class="scenario-context-label" aria-hidden="true">${beat.sceneLabel}</div>
      <p>${beat.sceneText}</p>
    `;
  }

  const labels = ['A', 'B', 'C'];
  currentAnswers = shuffleArray(beat.answers);

  const buttonsHTML = currentAnswers.map((ans, i) => `
    <button class="choice-card" data-index="${i}"
      onclick="makeChoice(this)"
      aria-label="Option ${labels[i]}: ${ans.ariaLabel}">
      <div class="choice-marker" aria-hidden="true">${labels[i]}</div>
      <div class="choice-card-text">${ans.text}</div>
    </button>`).join('');

  panel.innerHTML = `
    <h2 style="font-family:'Merriweather',serif; font-size:1.1rem; margin-bottom:4px; color:var(--white);">${beat.question}</h2>
    <p class="choices-hint">Select the response you feel is most appropriate. You'll see how Simon and Helen react, with feedback on your choice.</p>
    ${buttonsHTML}
    <div class="scenario-reaction" id="scenario-reaction" role="alert" aria-live="polite"></div>
    <button class="btn-next" id="btn-watch-next" hidden onclick="scenarioBestChoiceContinue()" aria-label="See what happens next">
      ▶ See What Happens Next
    </button>
    <button class="btn-reset" id="btn-retry" hidden onclick="retryQuestion()" aria-label="Reset and try again">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
      </svg>
      Reset &amp; Try Again
    </button>
    <div style="margin-top:16px;">
      <button class="btn btn-secondary" onclick="goToPage(2)" style="font-size:0.82rem; padding:10px 18px;" aria-label="Back to Helen's profile">
        <span aria-hidden="true">←</span> Back to Profile
      </button>
    </div>
  `;
}

function makeChoice(btn) {
  const ans = currentAnswers[parseInt(btn.dataset.index, 10)];
  if (!ans) return;
  const beat = scenarioBeats[currentBeatNum];

  // Lock all choices
  document.querySelectorAll('#choices-panel-1 .choice-card').forEach(c => {
    c.setAttribute('aria-disabled', 'true');
    c.onclick = null;
    c.style.cursor = 'default';
    c.style.transform = 'none';
  });

  btn.classList.add(ans.quality);

  // Swap the scene panel to show what actually happens — the "reaction" —
  // instead of leaving the original static context text in place.
  const context = document.getElementById('scenario-context');
  if (context) {
    context.classList.add('scenario-context-reacted', 'reacted-' + ans.quality);
    context.innerHTML = `
      <div class="scenario-context-label" aria-hidden="true">${ans.quality === 'best' ? '✅ What Happens' : '💬 What Happens'}</div>
      <p class="scenario-reaction-text"><span aria-hidden="true">${ans.reactionIcon}</span> ${ans.reaction}</p>
    `;
  }

  // Feedback / explanation panel
  const fb = document.getElementById('scenario-reaction');
  fb.className = 'scenario-reaction show ' + ans.quality;
  fb.innerHTML = '<div class="feedback-badge">' + ans.label + '</div><p>' + ans.message + '</p>';

  if (ans.quality === 'best') {
    const nextBtn = document.getElementById('btn-watch-next');
    nextBtn.hidden = false;
    nextBtn.textContent = currentBeatNum === 1 ? '▶ Watch What Happens Next' : '▶ Continue to Helen\'s Living Room';
    nextBtn.focus();
  } else {
    document.getElementById('btn-retry').hidden = false;
    document.getElementById('btn-retry').focus();
  }

  // Track for the Learning Record (see js/record.js)
  window._scenarioAnswers = window._scenarioAnswers || {};
  window._scenarioAnswers[currentBeatNum] = { text: ans.text, quality: ans.quality };

  // Report this choice to the LRS, if one is present (see js/xapi.js)
  if (typeof XAPI !== 'undefined') {
    XAPI.responded(
      'scenario/beat-' + currentBeatNum,
      beat.question,
      ans.text,
      { 'https://www.stbarnabashospice.co.uk/xapi/extensions/quality': ans.quality }
    );
  }
}

function scenarioBestChoiceContinue() {
  const beat = scenarioBeats[currentBeatNum];
  if (beat.onBest === 'video') {
    openVideoModal();
  } else if (beat.onBest === 'page4') {
    goToPage(4);
  }
}

// Called by the video modal's "Continue" button (see video-modal.js /
// index.html) once the learner has watched Scene 2.
function advanceScenarioAfterVideo() {
  currentBeatNum = 2;
  renderScenarioBeat();
  const heading = document.querySelector('#choices-panel-1 h2');
  if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
}

function retryQuestion() {
  renderScenarioBeat();
}
