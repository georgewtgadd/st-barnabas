/* ══════════════════════════════════════════════════════════
   js/abc.js  ·  Terminal haemorrhage ABC sequence — page 5
   Cards show descriptions only (no A/B/C labels).
   Must be checked to unlock continue.
══════════════════════════════════════════════════════════ */

let _abcSelected   = [];
const _abcCorrect  = ['A', 'B', 'C']; /* correct order by data-label */

function abcSelect(card) {
  if (card.classList.contains('abc-placed')) return;
  if (_abcSelected.length >= 3) return;

  card.classList.add('abc-placed');
  _abcSelected.push({ label: card.dataset.label, el: card });

  const idx   = _abcSelected.length - 1;
  const numEl = card.querySelector('.abc-card-num');
  if (numEl) numEl.textContent = idx + 1;

  const slot = document.getElementById('abc-seq-' + idx);
  if (slot) {
    slot.textContent = `Step ${idx + 1} selected`;
    slot.classList.add('filled');
  }
  _clearAbcFb();
}

function abcCheck() {
  if (_abcSelected.length < 3) {
    _showAbcFb('⚠️ Please select all three steps before checking.', false);
    return;
  }

  const isCorrect = _abcSelected.every((item, i) => item.label === _abcCorrect[i]);

  _abcSelected.forEach((item, i) => {
    const slot = document.getElementById('abc-seq-' + i);
    if (slot) {
      slot.classList.remove('filled');
      slot.classList.add(item.label === _abcCorrect[i] ? 'correct' : 'wrong');
    }
  });

  if (isCorrect) {
    _showAbcFb(
      '✅ <strong>Correct order!</strong> ' +
      '<strong>Step 1 — Assure:</strong> Speak calmly and directly to the patient — your composure is the most powerful tool you have. ' +
      '<strong>Step 2 — Be There:</strong> Never leave them alone under any circumstances. ' +
      '<strong>Step 3 — Comfort, Cover &amp; Call:</strong> Use dark towels to mask blood, administer Midazolam if prescribed, and call for senior support immediately.',
      true
    );
    window._abcResult = 'Correct — A (Assure) → B (Be There) → C (Comfort/Cover/Call) ✓';
    unlockContinue('_lock_abc', 'abc-locked-msg', 'abc-continue-btn');
  } else {
    _showAbcFb(
      '❌ Not quite. The correct order is: ' +
      '<strong>1st — Reassure the patient calmly</strong> → ' +
      '<strong>2nd — Stay present, do not leave</strong> → ' +
      '<strong>3rd — Cover the wound, give medication if prescribed, call for help.</strong> ' +
      'Your calm presence addresses the patient\'s fear before any clinical action.',
      false
    );
    window._abcResult = 'Incorrect — reviewed';
  }
}

function abcReset() {
  _abcSelected = [];
  document.querySelectorAll('.abc-card').forEach(c => {
    c.classList.remove('abc-placed');
    const n = c.querySelector('.abc-card-num');
    if (n) n.textContent = '';
  });
  for (let i = 0; i < 3; i++) {
    const slot = document.getElementById('abc-seq-' + i);
    if (slot) {
      slot.innerHTML = `<span>${i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'} action</span>`;
      slot.className = 'abc-seq-slot';
    }
  }
  _clearAbcFb();
  lockContinue('_lock_abc', 'abc-locked-msg', 'abc-continue-btn');
  window._abcResult = null;
}

function _showAbcFb(html, ok) {
  const fb = document.getElementById('abc-feedback');
  if (!fb) return;
  fb.innerHTML = html;
  fb.className = 'abc-feedback ' + (ok ? 'show-correct' : 'show-wrong');
}

function _clearAbcFb() {
  const fb = document.getElementById('abc-feedback');
  if (fb) { fb.className = 'abc-feedback'; fb.textContent = ''; }
}
