/* energy.js — Drag-and-drop / tap-to-select cellular respiration equation */
'use strict';

const CHIP_DATA = {
  glucose: { label: 'C₆H₁₂O₆', sub: 'Glucose',       ariaLabel: 'Glucose' },
  oxygen:  { label: '6O₂',      sub: 'Oxygen',         ariaLabel: 'Oxygen' },
  co2:     { label: '6CO₂',     sub: 'Carbon Dioxide', ariaLabel: 'Carbon Dioxide' },
  water:   { label: '6H₂O',     sub: 'Water',          ariaLabel: 'Water' },
  atp:     { label: 'ATP',       sub: 'Energy',         ariaLabel: 'ATP Energy' },
};
const slotsState = {};
let draggingId  = null;
let kbSelected  = null;  // also used for tap-to-select on mobile

function initEnergy() {
  const ids = Object.keys(CHIP_DATA);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const bank = document.getElementById('bank-items');
  if (!bank) return;
  bank.innerHTML = ids.map(id => `
    <div class="ec-chip" id="chip-${id}" draggable="true" data-id="${id}"
         tabindex="0" role="button" aria-label="${CHIP_DATA[id].ariaLabel} — tap to select or drag to slot">
      ${CHIP_DATA[id].label} <span class="chip-sub">${CHIP_DATA[id].sub}</span>
    </div>`).join('');

  bank.querySelectorAll('.ec-chip').forEach(chip => {
    const id = chip.dataset.id;

    // ── Mouse drag ────────────────────────────────────
    chip.addEventListener('dragstart', () => {
      draggingId = id;
      chip.style.opacity = '0.5';
    });
    chip.addEventListener('dragend', () => {
      chip.style.opacity = '';
      draggingId = null;
    });

    // ── Touch: tap-to-select approach ─────────────────
    // touchstart selects the chip; user then taps a slot to place
    chip.addEventListener('touchstart', e => {
      // Don't select if already placed
      if (chip.classList.contains('placed')) return;
      selectChipKb(id);
    }, { passive: true });

    // touchend: also try drag-to-slot if finger moved
    chip.addEventListener('touchend', e => {
      const touch = e.changedTouches[0];
      // Temporarily remove pointer events so elementFromPoint sees through chip
      chip.style.pointerEvents = 'none';
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      chip.style.pointerEvents = '';
      if (el) {
        const slot = el.closest('.eq-slot');
        if (slot && slot.dataset.accepts) {
          const accepts = slot.dataset.accepts;
          if (kbSelected === accepts || draggingId === accepts) {
            placeChip(accepts);
            kbSelected = null;
            draggingId = null;
          } else if (kbSelected || draggingId) {
            wrongSlotFlash(slot);
          }
        }
      }
    }, { passive: true });

    // ── Keyboard ──────────────────────────────────────
    chip.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectChipKb(id);
      }
    });

    // ── Click (desktop fallback, also fires after tap on mobile) ─
    chip.addEventListener('click', () => {
      if (!chip.classList.contains('placed')) selectChipKb(id);
    });
  });
}

function selectChipKb(id) {
  // Deselect all chips visually
  document.querySelectorAll('.ec-chip').forEach(c => c.classList.remove('kb-selected'));
  if (kbSelected === id) {
    kbSelected = null;
    return;
  }
  kbSelected = id;
  const chip = document.getElementById('chip-' + id);
  if (chip) chip.classList.add('kb-selected');
}

function eqDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function eqDrop(e, accepts) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const id = draggingId || kbSelected;
  if (!id) return;
  if (id === accepts) { placeChip(accepts); kbSelected = null; }
  else { wrongSlotFlash(e.currentTarget); }
  draggingId = null;
}

function eqClick(accepts) {
  const id = kbSelected || draggingId;
  if (!id) return;
  if (id === accepts) { placeChip(accepts); kbSelected = null; }
  else { wrongSlotFlash(document.getElementById('slot-' + accepts)); }
}

function placeChip(id) {
  if (slotsState[id]) return;
  slotsState[id] = true;

  const slot = document.getElementById('slot-' + id);
  if (slot) {
    slot.classList.add('filled', 'correct');
    slot.innerHTML = `<span class="slot-chip-label">${CHIP_DATA[id].label}</span><span class="slot-chip-sub">${CHIP_DATA[id].sub}</span>`;
    slot.setAttribute('aria-label', CHIP_DATA[id].sub + ' — placed');
  }
  const chip = document.getElementById('chip-' + id);
  if (chip) chip.classList.add('placed');

  // Deselect
  document.querySelectorAll('.ec-chip').forEach(c => c.classList.remove('kb-selected'));
  kbSelected = null;

  // Show Check Answer button once all 5 placed
  if (Object.keys(CHIP_DATA).every(k => slotsState[k])) {
    const btn = document.getElementById('eq-check-btn');
    if (btn) btn.hidden = false;
    // Hide hint
    const hintBox = document.getElementById('eq-hint-box');
    if (hintBox) hintBox.hidden = true;
    const hintBtn = document.getElementById('hint-toggle-btn');
    if (hintBtn) hintBtn.style.display = 'none';
  }
}

function wrongSlotFlash(el) {
  if (!el) return;
  el.style.borderColor = '#ef4444';
  el.style.background  = 'rgba(239,68,68,0.1)';
  setTimeout(() => { el.style.borderColor = ''; el.style.background = ''; }, 600);
}

function checkEquationAnswer() {
  const fb = document.getElementById('eq-check-feedback');
  if (!fb) return;
  // Every placed chip is correct by construction (wrongSlotFlash prevents wrong placements)
  fb.style.display = 'block';
  fb.style.background = 'rgba(34,197,94,0.1)';
  fb.style.border = '1px solid rgba(34,197,94,0.35)';
  fb.style.borderLeft = '4px solid #22c55e';
  fb.innerHTML = `<strong style="color:#86efac;font-size:0.68rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;display:block;margin-bottom:8px;">✅ Correct!</strong>
    <div style="font-family:'Merriweather',serif;font-size:1rem;font-weight:700;color:var(--teal);padding:10px 14px;background:rgba(0,168,142,0.1);border-radius:8px;margin-bottom:10px;">
      C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP
    </div>
    <p style="color:var(--text-muted);font-size:0.88rem;"><strong style="color:var(--white);">Glucose + Oxygen → Carbon Dioxide + Water + Energy.</strong>
    Every cell runs on this reaction. Without sufficient insulin to allow glucose uptake, even a well-oxygenated cell cannot produce energy — and the patient deteriorates.</p>`;
  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function resetEnergy() {
  Object.keys(CHIP_DATA).forEach(id => { slotsState[id] = false; });
  const bank = document.getElementById('bank-items');
  if (bank) bank.innerHTML = '';

  ['glucose','oxygen','co2','water','atp'].forEach(id => {
    const slot = document.getElementById('slot-' + id);
    if (slot) {
      slot.classList.remove('filled', 'correct');
      slot.innerHTML = '<span class="slot-placeholder">?</span>';
      slot.setAttribute('aria-label', 'Empty slot');
    }
  });

  // Reset check button and feedback
  const btn = document.getElementById('eq-check-btn');
  if (btn) btn.hidden = true;
  const fb = document.getElementById('eq-check-feedback');
  if (fb) { fb.style.display = 'none'; fb.innerHTML = ''; }
  const hintBtn = document.getElementById('hint-toggle-btn');
  if (hintBtn) hintBtn.style.display = '';

  kbSelected = null;
  draggingId = null;
  initEnergy();
}

function toggleEqHint() {
  const box = document.getElementById('eq-hint-box');
  const btn = document.getElementById('hint-toggle-btn');
  if (!box) return;
  const showing = !box.hidden;
  box.hidden = showing;
  if (btn) btn.setAttribute('aria-expanded', String(!showing));
}
