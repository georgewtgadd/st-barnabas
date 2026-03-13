/* ══════════════════════════════════════════════════════════
   js/reflection.js  ·  Reflective activity on page 4
══════════════════════════════════════════════════════════ */

// Expose for record.js
window._reflectionText = '';

function saveReflection() {
  const ta = document.getElementById('reflect-input');
  if (!ta) return;
  window._reflectionText = ta.value.trim();

  const banner = document.getElementById('reflect-saved-banner');
  if (banner) {
    banner.classList.add('show');
    setTimeout(() => banner.classList.remove('show'), 4000);
  }
}

function downloadReflection() {
  const ta   = document.getElementById('reflect-input');
  const text = ta ? ta.value.trim() : window._reflectionText;
  if (!text) { alert('Please write your reflection before downloading.'); return; }

  const content = [
    'St Barnabas Hospice — Reflective Activity',
    'Module: What is End of Life Palliative Care?',
    'Date: ' + new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }),
    '',
    'REFLECTION',
    '──────────────────────────────────────────',
    text,
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'reflection-eolpc.txt';
  a.click();
  URL.revokeObjectURL(a.href);
}

function openModelAnswerModal() {
  // Pre-fill user answer panel
  const ta   = document.getElementById('reflect-input');
  const text = ta ? ta.value.trim() : '';
  const panel = document.getElementById('user-answer-panel');
  const paraEl = document.getElementById('user-answer-text');

  if (panel && paraEl) {
    if (text) {
      paraEl.textContent = text;
      panel.style.display = 'block';
    } else {
      panel.style.display = 'none';
    }
  }

  const modal = document.getElementById('model-answer-modal');
  if (modal) modal.classList.add('open');
}

function closeModelAnswerModal() {
  const modal = document.getElementById('model-answer-modal');
  if (modal) modal.classList.remove('open');
}
