/* ══════════════════════════════════════════════════════════
   js/categorisation.js  ·  Palliative Emergencies — page 4
   Score box only appears after first answer.
   "More info" button opens detail modal per condition.
══════════════════════════════════════════════════════════ */

let _catAnswered = {};
let _catCorrect  = 0;
const _CAT_TOTAL = 6;

/* ── MODAL CONTENT ──────────────────────────────────── */
const CAT_DETAIL = {
  'cc-1': {
    icon: '😴', eyebrow: 'Expected Deterioration',
    title: 'Terminal Restlessness',
    body: `<p>Terminal restlessness (also called terminal agitation) is a normal part of the dying process for many patients. It occurs in the final hours or days of life, caused by neurological, metabolic, and physiological changes as the body shuts down.</p>
<ul>
  <li><strong>It is not</strong> a sign of uncontrolled pain or a preventable complication</li>
  <li><strong>Management:</strong> Anticipatory medication (e.g. Midazolam SC via syringe driver), calm quiet environment, reduce stimulation</li>
  <li><strong>Communication:</strong> Families find this deeply distressing — explaining what is happening and why it does not mean the patient is suffering is essential</li>
</ul>
<div class="modal-warning">⚠️ If restlessness is sudden in onset or atypical, consider a reversible cause such as urinary retention, constipation, pain, or medication effect before attributing it to the terminal phase.</div>`
  },
  'cc-2': {
    icon: '🚨', eyebrow: 'Palliative Emergency',
    title: 'Metastatic Spinal Cord Compression (MSCC)',
    body: `<p>MSCC is a true oncological emergency. Without prompt treatment it causes irreversible spinal cord injury and permanent paralysis. It affects approximately 5% of cancer patients and most commonly involves the thoracic spine.</p>
<ul>
  <li><strong>Act within hours</strong> — NICE NG127 requires urgent MRI of the whole spine within 24 hours</li>
  <li><strong>Nurse flat immediately</strong> — implement spinal precautions before imaging is available</li>
  <li><strong>High-dose dexamethasone</strong> 16mg reduces cord oedema — give immediately</li>
  <li><strong>Urgent referral</strong> to oncology or spinal surgery team</li>
</ul>
<div class="modal-warning">⚠️ Do not wait for imaging before implementing spinal precautions. If MSCC is suspected on clinical grounds, act first.</div>`
  },
  'cc-3': {
    icon: '🩹', eyebrow: 'Expected Deterioration',
    title: 'Skin Breakdown',
    body: `<p>Pressure ulcer development in bed-bound or immobile patients is an anticipated consequence of advanced illness. As patients deteriorate, circulation to the skin diminishes and pressure injuries become almost inevitable in the final days of life.</p>
<ul>
  <li>This is <strong>not a failure of care</strong> — it is an expected part of dying in many cases</li>
  <li><strong>Prevention:</strong> Regular repositioning, pressure-relieving mattresses, nutritional support where appropriate</li>
  <li><strong>At end of life:</strong> Comfort takes priority — gentle, dignified skin care focused on preventing pain, not healing</li>
</ul>`
  },
  'cc-4': {
    icon: '🚨', eyebrow: 'Palliative Emergency',
    title: 'Superior Vena Cava Obstruction (SVCO)',
    body: `<p>SVCO is a medical emergency caused by compression of the superior vena cava by a mediastinal tumour (most commonly lung cancer or lymphoma), preventing venous return from the head, neck, and arms.</p>
<ul>
  <li><strong>Classic signs:</strong> Facial oedema (periorbital, worse in morning), distended neck veins, bilateral arm swelling, dyspnoea</li>
  <li><strong>Immediate:</strong> Sit patient upright, high-dose dexamethasone, urgent oncology referral</li>
  <li><strong>Avoid IV access</strong> in the arms — elevated venous pressure means infusions may not drain effectively</li>
  <li><strong>Definitive treatment:</strong> Radiotherapy or SVC stenting</li>
</ul>`
  },
  'cc-5': {
    icon: '🛏️', eyebrow: 'Expected Deterioration',
    title: 'Incontinence',
    body: `<p>Loss of bladder and bowel control is an expected and common feature of advancing illness, particularly in patients with neurological involvement or as part of the final phase of dying.</p>
<ul>
  <li>This requires <strong>dignified, compassionate nursing care</strong> — not investigation or emergency intervention</li>
  <li>Consider catheterisation for patient comfort; barrier creams for skin protection; absorbent pads</li>
  <li><strong>Important distinction:</strong> Sudden incontinence associated with back pain and leg weakness is a red flag for MSCC — this is a different clinical situation requiring emergency response</li>
</ul>`
  },
  'cc-6': {
    icon: '🩸', eyebrow: 'Palliative Emergency',
    title: 'Catastrophic Haemorrhage',
    body: `<p>Catastrophic terminal haemorrhage occurs when a tumour erodes a major blood vessel — most commonly in head and neck cancers involving the carotid artery, or in lung cancer with haemoptysis. It is rare but requires an immediate, structured response.</p>
<ul>
  <li><strong>At-risk patients</strong> must have anticipatory medication (Midazolam SC/IM) prescribed in advance</li>
  <li><strong>Dark-coloured towels</strong> should be available at home to limit the visual impact</li>
  <li><strong>ABC response:</strong> Assure → Be There → Comfort/Cover/Call</li>
  <li>The goal is <strong>comfort and dignity</strong> — do not attempt resuscitation in most cases</li>
</ul>`
  }
};

/* ── ANSWER ─────────────────────────────────────────── */
function catAnswer(cardId, chosen, btn) {
  if (_catAnswered[cardId]) return;

  const card   = document.getElementById(cardId);
  const correct = card.dataset.answer;
  const isRight = (chosen === correct);

  _catAnswered[cardId] = chosen;
  if (isRight) _catCorrect++;

  card.querySelectorAll('.cat-btn').forEach(b => b.disabled = true);
  card.classList.add(isRight ? 'answered-correct' : 'answered-wrong');

  const resultEl = document.getElementById(cardId + '-result');
  if (resultEl) {
    resultEl.className = 'cat-result ' + (isRight ? 'correct' : 'wrong');
    const label = isRight
      ? '✓ Correct — ' + correct.charAt(0).toUpperCase() + correct.slice(1)
      : '✗ This is a ' + correct + ' condition';
    resultEl.innerHTML = label
      + `  <button class="cat-more-btn" onclick="openCatDetailModal('${cardId}')" aria-label="More information about ${CAT_DETAIL[cardId].title}">More info →</button>`;
  }

  _updateCatScore();
}

function _updateCatScore() {
  const answered = Object.keys(_catAnswered).length;
  const box = document.getElementById('cat-score-box');
  if (!box) return;

  box.style.display = 'block';

  if (answered === _CAT_TOTAL) {
    box.textContent = `✓ Complete: ${_catCorrect} / ${_CAT_TOTAL} correct. `
      + (_catCorrect === _CAT_TOTAL
          ? 'Excellent — all categories correctly identified!'
          : 'Review the "More info" links for any conditions you found challenging.');
    window._catResult = `${_catCorrect} / ${_CAT_TOTAL} correct`;
    unlockContinue('_lock_cat', 'cat-locked-msg', 'cat-continue-btn');
  } else {
    box.textContent = `${answered} of ${_CAT_TOTAL} answered — ${_catCorrect} correct`;
  }
}

/* ── MODAL ──────────────────────────────────────────── */
function openCatDetailModal(cardId) {
  const data = CAT_DETAIL[cardId];
  if (!data) return;
  document.getElementById('cdm-icon').textContent    = data.icon;
  document.getElementById('cdm-eyebrow').textContent = data.eyebrow;
  document.getElementById('cdm-title').textContent   = data.title;
  document.getElementById('cdm-body').innerHTML      = data.body;
  const m = document.getElementById('cat-detail-modal');
  m.classList.add('open');
  m.querySelector('.modal-close').focus();
}

function closeCatDetailModal() {
  document.getElementById('cat-detail-modal').classList.remove('open');
}
