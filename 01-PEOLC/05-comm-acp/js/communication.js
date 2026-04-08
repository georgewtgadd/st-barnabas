/* ══════════════════════════════════════════════════════════
   js/communication.js  ·  Page 3 — Select-3 activity
══════════════════════════════════════════════════════════ */

const CORRECT_OPTIONS = ['B', 'C', 'E'];
const MAX_SELECT      = 3;

let _commSelected  = new Set();
let _commChecked   = false;
let _commDone      = false;

window._commResult = null;

function commSelect(letter) {
  if (_commChecked) return;

  const btn = document.getElementById('comm-opt-' + letter);
  if (!btn) return;

  if (_commSelected.has(letter)) {
    _commSelected.delete(letter);
    btn.classList.remove('selected');
  } else {
    if (_commSelected.size >= MAX_SELECT) return;
    _commSelected.add(letter);
    btn.classList.add('selected');
  }

  _updateCommCounter();
}

function _updateCommCounter() {
  const counter = document.getElementById('comm-counter');
  if (counter) {
    counter.textContent = _commSelected.size + ' / ' + MAX_SELECT + ' selected';
  }
}

function checkComm() {
  if (_commSelected.size < MAX_SELECT) {
    const fb = document.getElementById('comm-feedback');
    if (fb) {
      fb.className = 'activity-feedback show incorrect';
      fb.innerHTML = '<p>⚠️ Please select exactly <strong>3 actions</strong> before checking.</p>';
    }
    return;
  }

  _commChecked = true;

  const selected = Array.from(_commSelected);
  const correct  = CORRECT_OPTIONS.every(l => selected.includes(l)) && selected.every(l => CORRECT_OPTIONS.includes(l));

  ['A','B','C','D','E'].forEach(letter => {
    const btn = document.getElementById('comm-opt-' + letter);
    if (!btn) return;

    const isSelected = _commSelected.has(letter);
    const isCorrect  = CORRECT_OPTIONS.includes(letter);

    btn.classList.remove('selected');

    if (isCorrect && isSelected) {
      btn.classList.add('correct');
      const v = btn.querySelector('.select-option-verdict');
      if (v) v.textContent = '✓ Correct choice';
    } else if (!isCorrect && isSelected) {
      btn.classList.add('incorrect');
      const v = btn.querySelector('.select-option-verdict');
      if (v) v.textContent = '✗ Not the most effective here';
    } else if (isCorrect && !isSelected) {
      btn.classList.add('correct');
      const v = btn.querySelector('.select-option-verdict');
      if (v) v.textContent = '✓ This should have been selected';
    }
  });

  const fb = document.getElementById('comm-feedback');
  if (fb) {
    if (correct) {
      fb.className = 'activity-feedback show correct';
      fb.innerHTML = `<strong>✓ Correct!</strong>
        <p>Actions B, C, and E address all three components of Mehrabian's Rule.
        <strong>B</strong> removes environmental barriers, <strong>C</strong> maximises the 55% body language impact,
        and <strong>E</strong> removes physical blockers before the conversation starts.</p>`;
      _commDone = true;
      window._commResult = 'correct';
      _unlockCommContinue();
    } else {
      fb.className = 'activity-feedback show incorrect';
      fb.innerHTML = `<p>Not quite. Revisit each option — focus on which actions address the <strong>Environment</strong>,
        <strong>Body Language</strong>, and <strong>Physical comfort</strong> of the patient before the conversation begins.</p>`;
      window._commResult = 'incorrect';
      // Allow retry
      setTimeout(() => {
        _commChecked = false;
        _commSelected.clear();
        _updateCommCounter();
        ['A','B','C','D','E'].forEach(letter => {
          const btn = document.getElementById('comm-opt-' + letter);
          if (btn) {
            btn.classList.remove('correct','incorrect');
            const v = btn.querySelector('.select-option-verdict');
            if (v) v.textContent = '';
          }
        });
      }, 2800);
    }
  }
}

function resetComm() {
  _commSelected.clear();
  _commChecked = false;
  _commDone    = false;
  window._commResult = null;

  ['A','B','C','D','E'].forEach(letter => {
    const btn = document.getElementById('comm-opt-' + letter);
    if (btn) {
      btn.classList.remove('selected','correct','incorrect');
      const v = btn.querySelector('.select-option-verdict');
      if (v) v.textContent = '';
    }
  });

  _updateCommCounter();

  const fb = document.getElementById('comm-feedback');
  if (fb) { fb.className = 'activity-feedback'; fb.innerHTML = ''; }

  _lockCommContinue();
}

function _unlockCommContinue() {
  const lock = document.getElementById('comm-locked-msg');
  const btn  = document.getElementById('comm-continue-btn');
  if (lock) lock.style.display = 'none';
  if (btn)  btn.hidden = false;
}

function _lockCommContinue() {
  const lock = document.getElementById('comm-locked-msg');
  const btn  = document.getElementById('comm-continue-btn');
  if (lock) lock.style.display = '';
  if (btn)  btn.hidden = true;
}

document.addEventListener('pagesLoaded', () => {
  _lockCommContinue();
  _updateCommCounter();
});
