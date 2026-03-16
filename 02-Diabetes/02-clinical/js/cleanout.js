/* cleanout.js — Medication rationalisation drag/touch activity */
'use strict';

const DRUG_DATA = {
  metformin:        { label: 'Metformin',      sub: 'Biguanide',          correct: 'stop', reason: 'GI disturbance and reduced renal function make this inappropriate at end of life.' },
  statin:           { label: 'Statin',          sub: 'Lipid-lowering',     correct: 'stop', reason: 'Statins prevent long-term cardiovascular events — no benefit in the terminal phase.' },
  antihypertensive: { label: 'Antihypertensive',sub: 'Blood pressure',     correct: 'stop', reason: 'Blood pressure control has no benefit in the dying phase and may cause postural hypotension.' },
  sulphonylurea:    { label: 'Sulphonylurea',   sub: 'Insulin secretagogue',correct: 'stop', reason: 'High hypoglycaemia risk — especially dangerous when intake is minimal.' },
};

const placements = {};
let draggingId = null;

function initCleanout() {
  const bank = document.getElementById('co-bank-items');
  if (!bank) return;

  const ids = Object.keys(DRUG_DATA);
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [ids[i],ids[j]]=[ids[j],ids[i]]; }

  bank.innerHTML = ids.map(id => `
    <div class="drug-chip" id="dchip-${id}" draggable="true" data-id="${id}"
         tabindex="0" role="button"
         aria-label="${DRUG_DATA[id].label} — drag to Stop or Continue column">
      ${DRUG_DATA[id].label}
      <span class="drug-chip-sub">${DRUG_DATA[id].sub}</span>
    </div>`).join('');

  bank.querySelectorAll('.drug-chip').forEach(chip => {
    chip.addEventListener('dragstart', () => { draggingId = chip.dataset.id; chip.style.opacity = '0.45'; });
    chip.addEventListener('dragend',   () => { chip.style.opacity = ''; draggingId = null; });
    chip.addEventListener('touchstart', () => { draggingId = chip.dataset.id; chip.style.opacity = '0.45'; }, { passive: true });
    chip.addEventListener('touchend', e => {
      chip.style.opacity = '';
      const t = e.changedTouches[0];
      const el = document.elementFromPoint(t.clientX, t.clientY);
      if (el) { const col = el.closest('.sort-col'); if (col) { const zone = col.dataset.zone; if (zone) placeChip(draggingId, zone); } }
      draggingId = null;
    }, { passive: true });
    chip.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openChipPicker(chip.dataset.id); }
    });
  });
}

function openChipPicker(id) {
  const stop = confirm(`Place "${DRUG_DATA[id].label}" in:\n\nOK = Stop\nCancel = Continue (Keep)`);
  placeChip(id, stop ? 'stop' : 'continue');
}

function coDragOver(e, zone) { e.preventDefault(); document.getElementById('co-col-' + zone).classList.add('drag-over'); }
function coDragLeave(zone)   { document.getElementById('co-col-' + zone).classList.remove('drag-over'); }

function coDrop(e, zone) {
  e.preventDefault();
  coDragLeave(zone);
  if (draggingId) placeChip(draggingId, zone);
  draggingId = null;
}

function placeChip(id, zone) {
  if (!id || !DRUG_DATA[id]) return;
  if (placements[id]) removePlacement(id);
  placements[id] = zone;

  const chip = document.getElementById('dchip-' + id);
  if (chip) chip.classList.add('placed');

  const listEl = document.getElementById('co-placed-' + zone);
  const empty  = document.getElementById('co-empty-' + zone);
  if (empty) empty.style.display = 'none';

  if (listEl) {
    const div = document.createElement('div');
    div.className = 'placed-chip in-' + zone;
    div.id = 'placed-' + id;
    div.innerHTML = `<span>${DRUG_DATA[id].label}</span><button class="remove-btn" onclick="removePlacement('${id}')" aria-label="Remove ${DRUG_DATA[id].label}">✕</button>`;
    listEl.appendChild(div);
  }
  checkCleanoutComplete();
}

function removePlacement(id) {
  const zone = placements[id];
  if (!zone) return;
  delete placements[id];
  const chip = document.getElementById('dchip-' + id);
  if (chip) chip.classList.remove('placed');
  const placed = document.getElementById('placed-' + id);
  if (placed) placed.remove();
  const listEl = document.getElementById('co-placed-' + zone);
  if (listEl && listEl.children.length === 0) {
    const empty = document.getElementById('co-empty-' + zone);
    if (empty) empty.style.display = '';
  }
  hideFeedback();
}

function checkCleanoutComplete() {
  if (Object.keys(placements).length < Object.keys(DRUG_DATA).length) return;
  const correct = Object.entries(placements).every(([id, zone]) => DRUG_DATA[id].correct === zone);
  showFeedback(correct);
}

function showFeedback(allCorrect) {
  const fb = document.getElementById('co-feedback');
  if (!fb) return;
  if (allCorrect) {
    fb.className = 'cleanout-feedback show all-correct';
    fb.innerHTML = `<span class="fb-badge">✅ Correct — All four should be stopped</span>
      <p>In the terminal phase with only sips of water being taken, <strong>all four medications should be discontinued</strong>. Metformin risks GI disturbance, sulphonylureas risk dangerous hypoglycaemia, while statins and antihypertensives no longer provide clinical benefit. The priority is comfort.</p>`;
  } else {
    const wrongOnes = Object.entries(placements)
      .filter(([id, zone]) => DRUG_DATA[id].correct !== zone)
      .map(([id]) => `<strong>${DRUG_DATA[id].label}</strong> — ${DRUG_DATA[id].reason}`)
      .join('<br>');
    fb.className = 'cleanout-feedback show has-errors';
    fb.innerHTML = `<span class="fb-badge">⚠️ Some need reviewing</span><p>${wrongOnes}</p>`;
  }
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideFeedback() {
  const fb = document.getElementById('co-feedback');
  if (fb) { fb.className = 'cleanout-feedback'; fb.innerHTML = ''; }
}

function checkCleanout() {
  if (Object.keys(placements).length < Object.keys(DRUG_DATA).length) {
    const fb = document.getElementById('co-feedback');
    if (fb) { fb.className = 'cleanout-feedback show has-errors'; fb.innerHTML = `<span class="fb-badge">⚠️ Place all four medications first</span><p>Drag each medication into either the <strong>Stop</strong> or <strong>Continue</strong> column before checking.</p>`; }
    return;
  }
  checkCleanoutComplete();
}

function resetCleanout() {
  Object.keys(placements).forEach(id => {
    delete placements[id];
    const chip = document.getElementById('dchip-' + id);
    if (chip) chip.classList.remove('placed');
    const placed = document.getElementById('placed-' + id);
    if (placed) placed.remove();
  });
  ['stop','continue'].forEach(zone => {
    const empty = document.getElementById('co-empty-' + zone);
    if (empty) empty.style.display = '';
  });
  hideFeedback();
}
