/* ══════════════════════════════════════════════════════════
   js/communication.js  ·  Page 3 — Select-3 activity
══════════════════════════════════════════════════════════ */

const CORRECT_OPTIONS = ['B', 'C', 'E'];
const MAX_SELECT      = 3;

let _commSelected = new Set();
let _commLocked   = false;   // true while showing results (correct OR incorrect)
let _commDone     = false;   // true once correct answer confirmed

window._commResult = null;

/* ── Selection ───────────────────────────────────────── */
function commSelect(letter) {
  if (_commLocked) return;   // no changes while results are displayed

  const optEl = document.getElementById('comm-opt-' + letter);
  if (!optEl) return;

  if (_commSelected.has(letter)) {
    _commSelected.delete(letter);
    optEl.classList.remove('selected');
  } else {
    if (_commSelected.size >= MAX_SELECT) return;
    _commSelected.add(letter);
    optEl.classList.add('selected');
  }

  _updateCommCounter();
}

function _updateCommCounter() {
  const counter = document.getElementById('comm-counter');
  if (counter) counter.textContent = _commSelected.size + ' / ' + MAX_SELECT + ' selected';
}

/* ── Check ───────────────────────────────────────────── */
function checkComm() {
  // Guard: already correctly completed
  if (_commDone) return;

  const fb = document.getElementById('comm-feedback');

  if (_commSelected.size < MAX_SELECT) {
    if (fb) {
      fb.className = 'activity-feedback show incorrect';
      fb.innerHTML = '<p>⚠️ Please select exactly <strong>3 actions</strong> before checking.</p>';
    }
    return;
  }

  // Lock selections while showing result
  _commLocked = true;

  const selected = Array.from(_commSelected);
  const isCorrect = CORRECT_OPTIONS.every(l => selected.includes(l))
                 && selected.every(l => CORRECT_OPTIONS.includes(l));

  // Style each option button
  ['A', 'B', 'C', 'D', 'E'].forEach(letter => {
    const optEl    = document.getElementById('comm-opt-' + letter);
    if (!optEl) return;
    const wasChosen  = _commSelected.has(letter);
    const shouldBe   = CORRECT_OPTIONS.includes(letter);
    const verdict    = optEl.querySelector('.select-option-verdict');

    optEl.classList.remove('selected');

    if (shouldBe && wasChosen) {
      optEl.classList.add('correct');
      if (verdict) verdict.textContent = '✓ Correct choice';
    } else if (!shouldBe && wasChosen) {
      optEl.classList.add('incorrect');
      if (verdict) verdict.textContent = '✗ Not the most effective here';
    } else if (shouldBe && !wasChosen) {
      optEl.classList.add('correct');
      if (verdict) verdict.textContent = '✓ This should have been selected';
    }
  });

  if (!fb) return;   // safety guard

  if (isCorrect) {
    fb.className = 'activity-feedback show correct';
    fb.innerHTML = `<strong>✓ Correct!</strong>
      <p>Actions <strong>B</strong>, <strong>C</strong>, and <strong>E</strong> address all three components of Mehrabian's Rule.
      <strong>B</strong> removes environmental barriers, <strong>C</strong> maximises the 55% body language impact,
      and <strong>E</strong> removes physical blockers before the conversation starts.</p>`;
    _commDone = true;
    window._commResult = 'correct';
    _unlockCommContinue();

  } else {
    fb.className = 'activity-feedback show incorrect';
    fb.innerHTML = `<p>Not quite. Revisit each option — focus on which actions address the
      <strong>Environment</strong>, <strong>Body Language</strong>, and <strong>Physical comfort</strong>
      of the patient before the conversation begins.</p>
      <p style="margin-top:8px;"><strong>Use the Reset button</strong> to try again.</p>`;
    window._commResult = 'incorrect';
    // Do NOT auto-reset — user clicks Reset to try again
  }
}

/* ── Reset ───────────────────────────────────────────── */
function resetComm() {
  if (_commDone) return;   // don't reset a correctly completed activity

  _commSelected.clear();
  _commLocked = false;
  window._commResult = null;

  ['A', 'B', 'C', 'D', 'E'].forEach(letter => {
    const optEl = document.getElementById('comm-opt-' + letter);
    if (optEl) {
      optEl.classList.remove('selected', 'correct', 'incorrect');
      const verdict = optEl.querySelector('.select-option-verdict');
      if (verdict) verdict.textContent = '';
    }
  });

  _updateCommCounter();

  const fb = document.getElementById('comm-feedback');
  if (fb) { fb.className = 'activity-feedback'; fb.innerHTML = ''; }
}

/* ── Continue unlock ─────────────────────────────────── */
function _unlockCommContinue() {
  const lockEl = document.getElementById('comm-locked-msg');
  const contBtn = document.getElementById('comm-continue-btn');
  if (lockEl)  lockEl.style.display = 'none';
  if (contBtn) {
    contBtn.removeAttribute('hidden');
    contBtn.style.display = 'inline-flex';
  }
}

function _lockCommContinue() {
  const lockEl = document.getElementById('comm-locked-msg');
  const contBtn = document.getElementById('comm-continue-btn');
  if (lockEl)  lockEl.style.display = '';
  if (contBtn) {
    contBtn.setAttribute('hidden', '');
    contBtn.style.display = 'none';
  }
}

document.addEventListener('pagesLoaded', () => {
  _lockCommContinue();
  _updateCommCounter();
});
