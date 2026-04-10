/* ══════════════════════════════════════════════════════════
   js/seizures.js  ·  Seizure management drag-to-reorder — page 9
   Supports mouse drag, touch, and arrow keys.
   Must be checked to unlock continue.
══════════════════════════════════════════════════════════ */

let _seqDragEl   = null;
let _seqDragOver = null;

/* ── INIT ─────────────────────────────────────────────── */
function initSeizures() {
  const list = document.getElementById('seq-list');
  if (!list) return;

  list.querySelectorAll('.seq-item').forEach(item => {
    /* Mouse drag */
    item.addEventListener('dragstart', e => {
      _seqDragEl = item;
      item.classList.add('seq-dragging-src');
      e.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('seq-dragging-src');
      list.querySelectorAll('.seq-item').forEach(i => {
        i.classList.remove('seq-drag-over-top', 'seq-drag-over-bottom');
      });
      _seqDragEl = null;
      _seqDragOver = null;
    });
    item.addEventListener('dragover', e => {
      e.preventDefault();
      if (!_seqDragEl || _seqDragEl === item) return;
      const rect = item.getBoundingClientRect();
      const mid  = rect.top + rect.height / 2;
      list.querySelectorAll('.seq-item').forEach(i => {
        i.classList.remove('seq-drag-over-top', 'seq-drag-over-bottom');
      });
      if (e.clientY < mid) {
        item.classList.add('seq-drag-over-top');
        _seqDragOver = { el: item, pos: 'before' };
      } else {
        item.classList.add('seq-drag-over-bottom');
        _seqDragOver = { el: item, pos: 'after' };
      }
    });
    item.addEventListener('drop', e => {
      e.preventDefault();
      if (!_seqDragEl || !_seqDragOver) return;
      if (_seqDragOver.pos === 'before') {
        list.insertBefore(_seqDragEl, _seqDragOver.el);
      } else {
        _seqDragOver.el.after(_seqDragEl);
      }
      _seqClearBadges();
      _seqClearFb();
    });

    /* Touch drag — simple swap */
    let _touchStartY = 0;
    item.addEventListener('touchstart', e => {
      _touchStartY = e.touches[0].clientY;
    }, { passive: true });
    item.addEventListener('touchend', e => {
      const dy = e.changedTouches[0].clientY - _touchStartY;
      const items = Array.from(list.querySelectorAll('.seq-item'));
      const idx   = items.indexOf(item);
      if (Math.abs(dy) < 20) return;
      if (dy < 0 && idx > 0)               list.insertBefore(item, items[idx - 1]);
      if (dy > 0 && idx < items.length - 1) items[idx + 1].after(item);
      _seqClearBadges();
      _seqClearFb();
    }, { passive: true });

    /* Arrow keys */
    item.addEventListener('keydown', e => {
      const items = Array.from(list.querySelectorAll('.seq-item'));
      const idx   = items.indexOf(item);
      if (e.key === 'ArrowUp' && idx > 0) {
        e.preventDefault();
        list.insertBefore(item, items[idx - 1]);
        item.focus();
        _seqClearBadges();
        _seqClearFb();
      }
      if (e.key === 'ArrowDown' && idx < items.length - 1) {
        e.preventDefault();
        items[idx + 1].after(item);
        item.focus();
        _seqClearBadges();
        _seqClearFb();
      }
    });
  });
}

/* ── CHECK ─────────────────────────────────────────── */
function seqCheck() {
  const list   = document.getElementById('seq-list');
  if (!list) return;
  const items  = Array.from(list.querySelectorAll('.seq-item'));
  const order  = [1, 2, 3, 4]; /* data-order values for correct sequence */
  let allRight = true;

  items.forEach((item, idx) => {
    const badge    = document.getElementById(item.id + '-badge');
    const isRight  = parseInt(item.dataset.order) === order[idx];
    if (!isRight) allRight = false;
    if (badge) {
      badge.textContent = isRight ? '✓' : '✗';
      badge.className   = 'seq-item-badge ' + (isRight ? 'correct' : 'wrong');
    }
  });

  const fb = document.getElementById('seq-feedback');
  if (allRight) {
    fb.innerHTML = '✅ <strong>Correct!</strong> ' +
      '1. Safe environment &amp; airway → ' +
      '2. Check blood glucose (exclude hypoglycaemia before giving anticonvulsants) → ' +
      '3. Administer Buccal Midazolam → ' +
      '4. Monitor &amp; seek specialist palliative advice. ' +
      'Checking the BM first is critical — hypoglycaemia mimics seizure and requires entirely different treatment.';
    fb.className = 'seq-feedback show-correct';
    window._seqResult = 'Correct — Safety → BM check → Buccal Midazolam → Monitor & advice ✓';
    unlockContinue('_lock_seq', 'seq-locked-msg', 'seq-continue-btn');
  } else {
    fb.innerHTML = '❌ Not quite. Correct order: ' +
      '<strong>1. Safe environment/airway → ' +
      '2. Check BM (rule out hypoglycaemia) → ' +
      '3. Administer Buccal Midazolam → ' +
      '4. Monitor &amp; seek specialist advice.</strong> ' +
      'Use the drag handles or ↑↓ arrow keys to reorder and try again.';
    fb.className = 'seq-feedback show-wrong';
    window._seqResult = 'Incorrect — reviewed';
  }
}

/* ── RESET ─────────────────────────────────────────── */
function seqReset() {
  const list  = document.getElementById('seq-list');
  if (!list) return;
  const items = Array.from(list.querySelectorAll('.seq-item'));
  /* Shuffle */
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    list.appendChild(items[j]);
    [items[i], items[j]] = [items[j], items[i]];
  }
  _seqClearBadges();
  _seqClearFb();
  lockContinue('_lock_seq', 'seq-locked-msg', 'seq-continue-btn');
  window._seqResult = null;
}

function _seqClearBadges() {
  document.querySelectorAll('.seq-item-badge').forEach(b => {
    b.textContent = '';
    b.className   = 'seq-item-badge';
  });
}
function _seqClearFb() {
  const fb = document.getElementById('seq-feedback');
  if (fb) { fb.textContent = ''; fb.className = 'seq-feedback'; }
}
