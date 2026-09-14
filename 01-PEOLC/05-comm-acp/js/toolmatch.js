/* ══════════════════════════════════════════════════════════
   js/toolmatch.js  ·  Page 7 — ACP Tool Matching Activity
   Matches: ADRT→Legal, ReSPECT→Clinical, PPCare→Wish
══════════════════════════════════════════════════════════ */

const CORRECT_MATCHES = {
  adrt:    'legal',
  respect: 'clinical',
  ppcare:  'wish',
};

let _selectedTool   = null;
let _matches        = {};   // { toolKey: labelKey }
let _matchDone      = false;
window._matchResult = null;

function selectTool(toolKey) {
  if (_matches[toolKey]) return;   // already matched

  // Deselect previous
  if (_selectedTool) {
    const prev = document.getElementById('tool-' + _selectedTool);
    if (prev) prev.classList.remove('selected');
  }

  if (_selectedTool === toolKey) {
    _selectedTool = null;
    return;
  }

  _selectedTool = toolKey;
  const el = document.getElementById('tool-' + toolKey);
  if (el) el.classList.add('selected');
}

function selectLabel(labelKey) {
  if (!_selectedTool) {
    // No tool selected — give a hint
    const fb = document.getElementById('match-feedback');
    if (fb) {
      fb.className = 'toolmatch-feedback show incorrect';
      fb.innerHTML = 'Select a <strong>document</strong> on the left first, then select its matching <strong>status</strong> on the right.';
    }
    return;
  }

  // Check if label already used
  const alreadyUsed = Object.values(_matches).includes(labelKey);
  if (alreadyUsed) {
    const fb = document.getElementById('match-feedback');
    if (fb) {
      fb.className = 'toolmatch-feedback show incorrect';
      fb.innerHTML = 'That status is already matched. Remove an existing match first.';
    }
    return;
  }

  // Record match
  _matches[_selectedTool] = labelKey;

  // Update tool chip
  const toolEl  = document.getElementById('tool-' + _selectedTool);
  const labelEl = document.getElementById('label-' + labelKey);

  const isCorrect = (CORRECT_MATCHES[_selectedTool] === labelKey);

  if (toolEl) {
    toolEl.classList.remove('selected');
    toolEl.classList.add('matched', isCorrect ? 'correct' : 'incorrect');
    toolEl.disabled = true;
  }
  if (labelEl) {
    labelEl.classList.add('matched', isCorrect ? 'correct' : 'incorrect');
    labelEl.disabled = true;
  }

  // Update connector
  const connectors = { adrt: 1, respect: 2, ppcare: 3 };
  const connIdx = connectors[_selectedTool];
  const connEl  = document.getElementById('connector-' + connIdx);
  if (connEl) connEl.classList.add('matched', isCorrect ? '' : 'incorrect');

  _selectedTool = null;

  // Clear feedback
  const fb = document.getElementById('match-feedback');
  if (fb) { fb.className = 'toolmatch-feedback'; fb.innerHTML = ''; }

  // Check if all matched
  if (Object.keys(_matches).length === 3) {
    _checkAllMatches();
  }
}

function _checkAllMatches() {
  const allCorrect = Object.entries(_matches).every(
    ([tool, label]) => CORRECT_MATCHES[tool] === label
  );

  const fb = document.getElementById('match-feedback');
  if (fb) {
    if (allCorrect) {
      fb.className = 'toolmatch-feedback show correct';
      fb.innerHTML = `<strong>✓ All matched correctly!</strong>
        The ADRT is the only <em>legally binding</em> document — it allows a person to refuse specific treatments in advance.
        The ReSPECT form is a <em>clinical recommendation</em> guiding emergency decisions.
        A Preferred Place of Care plan records a person's <em>wish</em>, but is not legally binding.`;
      _matchDone = true;
      window._matchResult = 'correct';
      _unlockMatchContinue();
    } else {
      fb.className = 'toolmatch-feedback show incorrect';
      fb.innerHTML = 'Some matches need reviewing. Use the Reset button to try again.';
      window._matchResult = 'incorrect';
    }
  }
}

function resetMatch() {
  _matches      = {};
  _selectedTool = null;
  _matchDone    = false;
  window._matchResult = null;

  ['adrt','respect','ppcare'].forEach(key => {
    const el = document.getElementById('tool-' + key);
    if (el) { el.classList.remove('selected','matched','correct','incorrect'); el.disabled = false; }
  });
  ['legal','clinical','wish'].forEach(key => {
    const el = document.getElementById('label-' + key);
    if (el) { el.classList.remove('selected','matched','correct','incorrect'); el.disabled = false; }
  });
  [1,2,3].forEach(i => {
    const el = document.getElementById('connector-' + i);
    if (el) el.className = 'connector-line';
  });

  const fb = document.getElementById('match-feedback');
  if (fb) { fb.className = 'toolmatch-feedback'; fb.innerHTML = ''; }

  _lockMatchContinue();
}

function _unlockMatchContinue() {
  const lock = document.getElementById('match-locked-msg');
  const btn  = document.getElementById('match-continue-btn');
  if (lock) lock.style.display = 'none';
  if (btn)  btn.hidden = false;
}

function _lockMatchContinue() {
  const lock = document.getElementById('match-locked-msg');
  const btn  = document.getElementById('match-continue-btn');
  if (lock) lock.style.display = '';
  if (btn)  btn.hidden = true;
}

document.addEventListener('pagesLoaded', () => {
  _lockMatchContinue();
});
