/* energy.js — Drag-and-drop cellular respiration equation */
'use strict';

const CHIP_DATA = {
  glucose: { label: 'C₆H₁₂O₆', sub: 'Glucose',        ariaLabel: 'Glucose — drag to reactants' },
  oxygen:  { label: '6O₂',      sub: 'Oxygen',          ariaLabel: 'Oxygen — drag to reactants' },
  co2:     { label: '6CO₂',     sub: 'Carbon Dioxide',  ariaLabel: 'Carbon dioxide — drag to products' },
  water:   { label: '6H₂O',     sub: 'Water',           ariaLabel: 'Water — drag to products' },
  atp:     { label: 'ATP',       sub: 'Energy',          ariaLabel: 'ATP Energy — drag to products' }
};
const slotsState = {};
let draggingId = null;
let kbSelected = null;

function initEnergy() {
  // Render chips in shuffled order
  const ids = Object.keys(CHIP_DATA);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const bank = document.getElementById('bank-items');
  if (!bank) return;
  bank.innerHTML = ids.map(id => `
    <div class="ec-chip" id="chip-${id}" draggable="true" data-id="${id}"
         tabindex="0" role="button" aria-label="${CHIP_DATA[id].ariaLabel}">
      ${CHIP_DATA[id].label} <span class="chip-sub">${CHIP_DATA[id].sub}</span>
    </div>`).join('');

  // Attach drag + keyboard listeners
  bank.querySelectorAll('.ec-chip').forEach(chip => {
    chip.addEventListener('dragstart', () => {
      draggingId = chip.dataset.id;
      chip.style.opacity = '0.5';
    });
    chip.addEventListener('dragend', () => { chip.style.opacity = ''; draggingId = null; });

    // ── Touch drag support ─────────────────────────────
    chip.addEventListener('touchstart', e => {
      draggingId = chip.dataset.id;
      chip.style.opacity = '0.5';
    }, { passive: true });
    chip.addEventListener('touchend', e => {
      chip.style.opacity = '';
      // Find which slot the finger is over
      const touch = e.changedTouches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el) {
        const slot = el.closest('.eq-slot');
        if (slot) {
          const accepts = slot.dataset.accepts;
          if (accepts) {
            if (draggingId === accepts) { placeChip(accepts); }
            else { wrongSlotFlash(slot); }
          }
        }
      }
      draggingId = null;
    }, { passive: true });
    chip.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectChipKb(chip.dataset.id); }
    });
  });
}

function selectChipKb(id) {
  document.querySelectorAll('.ec-chip').forEach(c => c.classList.remove('kb-selected'));
  if (kbSelected === id) { kbSelected = null; return; }
  kbSelected = id;
  const chip = document.getElementById('chip-' + id);
  if (chip) chip.classList.add('kb-selected');
}

function eqDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }

function eqDrop(e, accepts) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (draggingId === accepts) { placeChip(accepts); } else { wrongSlotFlash(e.currentTarget); }
  draggingId = null;
}

function eqClick(accepts) {
  const id = kbSelected || draggingId;
  if (!id) return;
  if (id === accepts) { placeChip(accepts); kbSelected = null; } else { wrongSlotFlash(document.getElementById('slot-' + accepts)); }
}

function placeChip(id) {
  if (slotsState[id]) return;
  slotsState[id] = true;
  const slot = document.getElementById('slot-' + id);
  if (slot) {
    slot.classList.add('filled', 'correct');
    slot.innerHTML = `<span class="slot-chip-label">${CHIP_DATA[id].label}</span><span class="slot-chip-sub">${CHIP_DATA[id].sub}</span>`;
    slot.setAttribute('aria-label', CHIP_DATA[id].sub + ' placed correctly');
  }
  const chip = document.getElementById('chip-' + id);
  if (chip) chip.classList.add('placed');
  checkEquationComplete();
}

function wrongSlotFlash(el) {
  if (!el) return;
  el.style.borderColor = '#ef4444';
  el.style.background = 'rgba(239,68,68,0.1)';
  setTimeout(() => { el.style.borderColor = ''; el.style.background = ''; }, 600);
}

function checkEquationComplete() {
  if (Object.keys(CHIP_DATA).every(id => slotsState[id])) {
    const inc  = document.getElementById('ec-incomplete');
    const comp = document.getElementById('ec-complete');
    if (inc)  inc.hidden  = true;
    if (comp) comp.hidden = false;
    // Hide hint
    const hintBox = document.getElementById('eq-hint-box');
    if (hintBox) hintBox.hidden = true;
    const hintBtn = document.getElementById('hint-toggle-btn');
    if (hintBtn) hintBtn.style.display = 'none';
  }
}

function resetEnergy() {
  Object.keys(CHIP_DATA).forEach(id => { slotsState[id] = false; });
  const bank = document.getElementById('bank-items');
  if (bank) { bank.innerHTML = ''; }
  const slots = ['glucose','oxygen','co2','water','atp'];
  slots.forEach(id => {
    const slot = document.getElementById('slot-' + id);
    if (slot) {
      slot.classList.remove('filled','correct');
      slot.innerHTML = '<span class="slot-placeholder">?</span>';
      slot.setAttribute('aria-label', 'Empty slot');
    }
  });
  const inc  = document.getElementById('ec-incomplete');
  const comp = document.getElementById('ec-complete');
  if (inc)  inc.hidden = false;
  if (comp) comp.hidden = true;
  kbSelected = null;
  draggingId = null;
  // Re-shuffle
  const hintBtn = document.getElementById('hint-toggle-btn');
  if (hintBtn) hintBtn.style.display = '';
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

function toggleAnswer() {
  const body = document.getElementById('ec-answer-body');
  const btn  = document.getElementById('ec-reveal-btn');
  if (!body || !btn) return;
  const hidden = body.hidden;
  body.hidden = !hidden;
  btn.textContent = hidden ? '🙈 Hide Answer' : '👁 Reveal Answer';
}
