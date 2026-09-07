/* ══════════════════════════════════════════════════════════
   acp.js — ACP form validation, print, notes modal
══════════════════════════════════════════════════════════ */

function initAcpValidation() {
  // Text inputs / textareas
  document.querySelectorAll('.acp-validate').forEach(el => {
    el.addEventListener('input', () => validateAcpField(el));
    el.addEventListener('blur',  () => validateAcpField(el));
  });
  // Selects
  document.querySelectorAll('.acp-validate-select').forEach(el => {
    el.addEventListener('change', () => validateAcpSelect(el));
  });
  // Pre-check known confirmed items
  const dnr  = document.getElementById('chk-dnr');
  const meds = document.getElementById('chk-meds');
  if (dnr)  dnr.checked  = true;
  if (meds) meds.checked = true;
}

function validateAcpField(el) {
  const raw    = el.value.trim().toLowerCase();
  const answer = (el.dataset.answer || '').toLowerCase();
  const mode   = el.dataset.match || 'contains';
  if (!raw) { el.classList.remove('acp-correct', 'acp-incorrect'); return; }
  let correct = false;
  if (mode === 'contains') {
    correct = raw.includes(answer);
  } else if (mode === 'contains-any') {
    correct = answer.split('|').some(a => raw.includes(a.trim()));
  }
  el.classList.toggle('acp-correct',   correct);
  el.classList.toggle('acp-incorrect', !correct);
}

function validateAcpSelect(el) {
  const val    = el.value.toLowerCase();
  const answer = (el.dataset.answer || '').toLowerCase();
  if (!val) { el.classList.remove('acp-correct', 'acp-incorrect'); return; }
  el.classList.toggle('acp-correct',   val === answer);
  el.classList.toggle('acp-incorrect', val !== answer);
}

function printAcp() {
  window.print();
}

function openAcpModal() {
  const modal = document.getElementById('acp-notes-modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeAcpModal() {
  document.getElementById('acp-notes-modal').classList.remove('open');
  document.body.style.overflow = '';
}
