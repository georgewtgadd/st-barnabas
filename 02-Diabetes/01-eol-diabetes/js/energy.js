/* energy.js — Drag-and-drop cellular respiration equation */
'use strict';

const CHIP_DATA = {
  glucose: { label: 'C₆H₁₂O₆', sub: 'Glucose' },
  oxygen:  { label: '6O₂',      sub: 'Oxygen' },
  co2:     { label: '6CO₂',     sub: 'Carbon Dioxide' },
  water:   { label: '6H₂O',     sub: 'Water' },
  atp:     { label: 'ATP',       sub: 'Energy' }
};
const SLOT_MAP = { glucose:'glucose', oxygen:'oxygen', co2:'co2', water:'water', atp:'atp' };
const slotsState = {};
let draggingId = null;

function initEnergy() {
  // Keyboard-accessible click-to-place: clicking a chip then a slot
  const chips = document.querySelectorAll('.ec-chip');
  chips.forEach(chip => {
    chip.addEventListener('dragstart', e => {
      draggingId = chip.dataset.id;
      chip.style.opacity = '0.5';
    });
    chip.addEventListener('dragend', () => { chip.style.opacity = ''; });
    chip.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectChipKb(chip.dataset.id); }
    });
  });
}

let kbSelected = null;
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
}

function eqClick(accepts) {
  const id = kbSelected || draggingId;
  if (!id) return;
  if (id === accepts) { placeChip(accepts); kbSelected = null; } else { wrongSlotFlash(document.getElementById('slot-' + accepts)); }
}

function placeChip(id) {
  if (slotsState[id]) return; // already filled
  slotsState[id] = true;

  // Update slot
  const slot = document.getElementById('slot-' + id);
  if (slot) {
    slot.classList.add('filled', 'correct');
    slot.innerHTML = `<span class="slot-chip-label">${CHIP_DATA[id].label}</span><span class="slot-chip-sub">${CHIP_DATA[id].sub}</span>`;
    slot.setAttribute('aria-label', CHIP_DATA[id].sub + ' placed correctly');
  }
  // Grey out chip
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
  const allIds = Object.keys(CHIP_DATA);
  if (allIds.every(id => slotsState[id])) {
    const inc  = document.getElementById('ec-incomplete');
    const comp = document.getElementById('ec-complete');
    if (inc)  inc.hidden  = true;
    if (comp) comp.hidden = false;
  }
}

function resetEnergy() {
  Object.keys(CHIP_DATA).forEach(id => {
    slotsState[id] = false;
    const slot = document.getElementById('slot-' + id);
    if (slot) {
      slot.classList.remove('filled','correct');
      slot.innerHTML = '<span class="slot-placeholder">?</span>';
      slot.setAttribute('aria-label', 'Empty slot');
    }
    const chip = document.getElementById('chip-' + id);
    if (chip) chip.classList.remove('placed','kb-selected');
  });
  const inc  = document.getElementById('ec-incomplete');
  const comp = document.getElementById('ec-complete');
  if (inc)  inc.hidden  = false;
  if (comp) comp.hidden = true;
  kbSelected = null;
  draggingId = null;
}
