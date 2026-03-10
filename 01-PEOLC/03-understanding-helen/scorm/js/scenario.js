/* ══════════════════════════════════════════════════════════
   scenario.js — Branching scenario: answers, render, choice
══════════════════════════════════════════════════════════ */

const answerPool = [
  {
    quality: 'best',
    label: '✅ Best Response',
    message: 'By acknowledging Simon\'s exhaustion first, you build trust and open the door to a deeper conversation — making it far more likely that Simon will disclose the real pressures the family are under. This is person-centred care in action.',
    text: '"Simon, you look exhausted. Let\'s sit for a moment and talk about how you are managing."',
    ariaLabel: 'Acknowledge Simon\'s exhaustion'
  },
  {
    quality: 'neutral',
    label: '⚠️ Acceptable — but incomplete',
    message: 'Attending to Helen\'s immediate health need is reasonable, but it misses the opportunity to acknowledge Simon\'s visible distress. A holistic approach means attending to the whole family — not just the clinical task.',
    text: '"Helen, your breathing looks heavy. Let\'s check your oxygen levels first."',
    ariaLabel: 'Check Helen\'s oxygen levels first'
  },
  {
    quality: 'poor',
    label: '❌ Missed Opportunity',
    message: 'Rushing through the visit sends a clear message that their lives are simply a task to complete. This damages trust and makes it far less likely that the family will open up about the real pressures they are facing — including Simon\'s financial crisis and Sophie\'s withdrawal.',
    text: '"I have a lot of patients today, so let\'s just get through the vitals quickly."',
    ariaLabel: 'Get through the vitals quickly'
  }
];

// Module-level store for the current shuffled answers
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
  const panel = document.getElementById('choices-panel-1');
  if (!panel) return;

  const labels = ['A', 'B', 'C'];
  currentAnswers = shuffleArray(answerPool);

  const buttonsHTML = currentAnswers.map((ans, i) => `
    <button class="choice-card" data-index="${i}"
      onclick="makeChoice(this)"
      aria-label="Option ${labels[i]}: ${ans.ariaLabel}">
      <div class="choice-marker" aria-hidden="true">${labels[i]}</div>
      <div class="choice-card-text">${ans.text}</div>
    </button>`).join('');

  panel.innerHTML = `
    <h2 style="font-family:'Merriweather',serif; font-size:1.1rem; margin-bottom:4px; color:var(--white);">How do you respond?</h2>
    <p class="choices-hint">Select the response you feel is most appropriate. You'll receive immediate feedback on your choice.</p>
    ${buttonsHTML}
    <div class="scenario-feedback" id="scenario-feedback" role="alert" aria-live="polite"></div>
    <button class="btn-next" id="btn-watch-next" hidden onclick="openVideoModal()" aria-label="Watch what happens next">
      ▶ Watch What Happens Next
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

  // Lock all choices
  document.querySelectorAll('#choices-panel-1 .choice-card').forEach(c => {
    c.setAttribute('aria-disabled', 'true');
    c.onclick = null;
    c.style.cursor = 'default';
    c.style.transform = 'none';
  });

  btn.classList.add(ans.quality);

  // Show feedback
  const fb = document.getElementById('scenario-feedback');
  fb.className = 'scenario-feedback show ' + ans.quality;
  fb.innerHTML = '<div class="feedback-badge">' + ans.label + '</div><p>' + ans.message + '</p>';

  // Show watch next on best answer; always show reset
  if (ans.quality === 'best') {
    document.getElementById('btn-watch-next').hidden = false;
  }
  document.getElementById('btn-retry').hidden = false;
}

function retryQuestion() {
  renderChoicesPanel();
}
