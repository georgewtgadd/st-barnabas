/* ══════════════════════════════════════════════════════════
   js/sophie.js — Page 6: "spot the signs" exercise
══════════════════════════════════════════════════════════ */

const SOPHIE_SIGNS = ['door', 'eating', 'school', 'recognises'];
const SOPHIE_DISTRACTORS = ['headphones', 'simon', 'age'];

function checkSophieSigns() {
  const list = document.getElementById('sophie-signs-list');
  if (!list) return;

  const checked = Array.from(list.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
  const correctSelected   = checked.filter(v => SOPHIE_SIGNS.includes(v));
  const incorrectSelected = checked.filter(v => SOPHIE_DISTRACTORS.includes(v));
  const missed = SOPHIE_SIGNS.filter(v => !checked.includes(v));

  const wellSpotted = correctSelected.length >= 3 && incorrectSelected.length <= 1;

  window._sophieNoticed = wellSpotted;
  window._sophieSignsCorrect = correctSelected.length;
  window._sophieSignsTotal = SOPHIE_SIGNS.length;

  // Mark each item so the checklist itself shows right/wrong at a glance
  list.querySelectorAll('.sophie-sign-item').forEach(item => {
    const input = item.querySelector('input');
    const val = input.value;
    input.disabled = true;
    if (SOPHIE_SIGNS.includes(val) && input.checked)      item.classList.add('sign-correct');
    else if (SOPHIE_SIGNS.includes(val) && !input.checked) item.classList.add('sign-missed');
    else if (SOPHIE_DISTRACTORS.includes(val) && input.checked) item.classList.add('sign-wrong');
  });

  const resultEl = document.getElementById('sophie-signs-result');
  const feedback = document.getElementById('sophie-signs-feedback');
  if (resultEl) {
    resultEl.textContent = wellSpotted
      ? `Well spotted — you identified ${correctSelected.length} of ${SOPHIE_SIGNS.length} real signs.`
      : `You caught ${correctSelected.length} of ${SOPHIE_SIGNS.length} — worth a second look at what's below.`;
    resultEl.className = 'sophie-signs-result ' + (wellSpotted ? 'good' : 'partial');
  }
  if (feedback) feedback.hidden = false;

  const btn = document.getElementById('sophie-check-btn');
  if (btn) btn.hidden = true;

  if (typeof XAPI !== 'undefined') {
    XAPI.responded('sophie/signs', 'Which of these are signs Sophie needs support?', checked.join(', '), {
      'https://www.stbarnabashospice.co.uk/xapi/extensions/correct': correctSelected.length,
      'https://www.stbarnabashospice.co.uk/xapi/extensions/total': SOPHIE_SIGNS.length
    });
  }
}

/* Carries the "did you notice Sophie's signs" result forward onto
   the ACP page — a small nudge either way, not a hard gate. */
function populateAcpSophieNote() {
  const note = document.getElementById('acp-sophie-note');
  if (!note) return;

  if (window._sophieNoticed === true) {
    note.hidden = false;
    note.className = 'info-callout';
    note.innerHTML = '<p><strong>From Sophie\'s story:</strong> you picked up on her signs of anticipatory grief — make sure this ReSPECT form reflects a referral for her, not just Helen\'s own wishes.</p>';
  } else if (window._sophieNoticed === false) {
    note.hidden = false;
    note.className = 'info-callout';
    note.innerHTML = '<p><strong>Before you finish:</strong> this plan is also for the family Helen leaves behind. Worth a second look at whether Sophie needs a mention here too.</p>';
  } else {
    note.hidden = true;
  }
}
