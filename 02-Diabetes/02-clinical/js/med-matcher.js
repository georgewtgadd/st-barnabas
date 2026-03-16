/* med-matcher.js — Medication risk category matching activity */
'use strict';

const MM_DRUGS = {
  sulphonylurea: { label: 'Sulphonylurea',     sub: 'e.g. Gliclazide',    correct: 'hypo',      reason: 'Stimulates insulin secretion regardless of food intake — the classic hypoglycaemia culprit when a patient stops eating.' },
  sglt2:         { label: 'SGLT2 Inhibitor',   sub: 'e.g. Empagliflozin', correct: 'dka',       reason: 'Can trigger euglycaemic DKA — ketoacidosis with near-normal blood glucose, making it easy to miss.' },
  metformin:     { label: 'Metformin',          sub: 'Biguanide',          correct: 'gi',        reason: 'Causes GI disturbance and risks lactic acidosis with reduced renal clearance in dying patients.' },
  statin:        { label: 'Statin',             sub: 'e.g. Atorvastatin',  correct: 'nobenefit', reason: 'Prevents long-term cardiovascular events over years — entirely without benefit in the terminal phase.' },
  antihypertensive: { label: 'Antihypertensive', sub: 'e.g. Amlodipine',  correct: 'nobenefit', reason: 'Blood pressure control has no benefit in the dying phase and may cause postural hypotension, increasing fall risk.' },
};

const mmPlacements = {};
let mmDragging = null;

function initMatcher() {
  const bank = document.getElementById('mm-bank-items');
  if (!bank) return;
  const ids = Object.keys(MM_DRUGS);
  for (let i = ids.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [ids[i],ids[j]]=[ids[j],ids[i]]; }
  bank.innerHTML = ids.map(id => `
    <div class="drug-chip" id="mmchip-${id}" draggable="true" data-id="${id}"
         tabindex="0" role="button" aria-label="${MM_DRUGS[id].label} — drag to correct risk category">
      ${MM_DRUGS[id].label}
      <span class="drug-chip-sub">${MM_DRUGS[id].sub}</span>
    </div>`).join('');

  bank.querySelectorAll('.drug-chip').forEach(chip => {
    chip.addEventListener('dragstart', () => { mmDragging = chip.dataset.id; chip.style.opacity = '0.45'; });
    chip.addEventListener('dragend',   () => { chip.style.opacity = ''; mmDragging = null; });
    chip.addEventListener('touchstart', () => { mmDragging = chip.dataset.id; chip.style.opacity = '0.45'; }, { passive: true });
    chip.addEventListener('touchend', e => {
      chip.style.opacity = '';
      const t = e.changedTouches[0];
      const el = document.elementFromPoint(t.clientX, t.clientY);
      if (el) { const zone = el.closest('.matcher-zone'); if (zone) { const z = zone.id.replace('mm-zone-',''); placeMatcherChip(mmDragging, z); } }
      mmDragging = null;
    }, { passive: true });
    chip.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const zones = ['hypo','dka','gi','nobenefit'];
        const labels = ['A — Hypoglycaemia Risk','B — DKA Risk','C — GI/Renal Risk','D — No Benefit'];
        const choice = prompt(`Place "${MM_DRUGS[chip.dataset.id].label}" in:\n${zones.map((z,i)=>`${i+1}. ${labels[i]}`).join('\n')}\n\nEnter 1–4:`);
        const idx = parseInt(choice) - 1;
        if (idx >= 0 && idx < zones.length) placeMatcherChip(chip.dataset.id, zones[idx]);
      }
    });
  });
}

function mmDragOver(e, zone)  { e.preventDefault(); document.getElementById('mm-zone-'+zone).classList.add('drag-over'); }
function mmDragLeave(zone)    { document.getElementById('mm-zone-'+zone).classList.remove('drag-over'); }
function mmDrop(e, zone)      { e.preventDefault(); mmDragLeave(zone); if (mmDragging) placeMatcherChip(mmDragging, zone); mmDragging = null; }

function placeMatcherChip(id, zone) {
  if (!id || !MM_DRUGS[id]) return;
  if (mmPlacements[id]) removeMatcherChip(id);
  mmPlacements[id] = zone;

  const chip = document.getElementById('mmchip-' + id);
  if (chip) chip.classList.add('placed');

  const list = document.getElementById('mm-placed-' + zone);
  const hint = document.getElementById('mm-hint-' + zone);
  if (hint) hint.style.display = 'none';

  if (list) {
    const div = document.createElement('div');
    div.className = 'placed-chip';
    div.id = 'mmplaced-' + id;
    div.innerHTML = `<span>${MM_DRUGS[id].label}</span><button class="remove-btn" onclick="removeMatcherChip('${id}')" aria-label="Remove ${MM_DRUGS[id].label}">✕</button>`;
    list.appendChild(div);
  }
  hideMmFeedback();
}

function removeMatcherChip(id) {
  const zone = mmPlacements[id];
  if (!zone) return;
  delete mmPlacements[id];
  const chip = document.getElementById('mmchip-' + id);
  if (chip) chip.classList.remove('placed');
  const placed = document.getElementById('mmplaced-' + id);
  if (placed) placed.remove();
  const list = document.getElementById('mm-placed-' + zone);
  if (list && !list.children.length) {
    const hint = document.getElementById('mm-hint-' + zone);
    if (hint) hint.style.display = '';
  }
  hideMmFeedback();
}

function checkMatcher() {
  const fb = document.getElementById('mm-feedback');
  if (!fb) return;
  if (Object.keys(mmPlacements).length < Object.keys(MM_DRUGS).length) {
    fb.className = 'cleanout-feedback show has-errors';
    fb.innerHTML = `<span class="fb-badge">⚠️ Place all five medications first</span><p>Drag each medication into a risk category before checking your answers.</p>`;
    return;
  }
  const wrong = Object.entries(mmPlacements).filter(([id, zone]) => MM_DRUGS[id].correct !== zone).map(([id]) => id);
  if (wrong.length === 0) {
    fb.className = 'cleanout-feedback show all-correct';
    fb.innerHTML = `<span class="fb-badge">✅ All five correct!</span>
      <p>${Object.keys(MM_DRUGS).map(id => `<strong>${MM_DRUGS[id].label}:</strong> ${MM_DRUGS[id].reason}`).join('<br><br>')}</p>`;
  } else {
    // Mark wrong ones red, correct ones green
    wrong.forEach(id => { const el = document.getElementById('mmplaced-'+id); if (el) el.style.borderColor = '#ef4444'; });
    Object.keys(mmPlacements).filter(id => !wrong.includes(id)).forEach(id => { const el = document.getElementById('mmplaced-'+id); if (el) el.style.borderColor = '#22c55e'; });
    fb.className = 'cleanout-feedback show has-errors';
    fb.innerHTML = `<span class="fb-badge">⚠️ ${wrong.length} placement${wrong.length > 1 ? 's' : ''} need reviewing</span>
      <p>${wrong.map(id => `<strong>${MM_DRUGS[id].label}</strong> — ${MM_DRUGS[id].reason}`).join('<br><br>')}</p>`;
  }
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function resetMatcher() {
  Object.keys(mmPlacements).forEach(id => {
    delete mmPlacements[id];
    const chip = document.getElementById('mmchip-'+id); if (chip) chip.classList.remove('placed');
    const placed = document.getElementById('mmplaced-'+id); if (placed) placed.remove();
  });
  ['hypo','dka','gi','nobenefit'].forEach(zone => {
    const hint = document.getElementById('mm-hint-'+zone); if (hint) hint.style.display = '';
  });
  hideMmFeedback();
}

function hideMmFeedback() {
  const fb = document.getElementById('mm-feedback');
  if (fb) { fb.className = 'cleanout-feedback'; fb.innerHTML = ''; }
}
