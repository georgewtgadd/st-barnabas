/* ══════════════════════════════════════════════════════════
   js/capacity.js  ·  Page 5 — Two-Stage Test Drag-to-Order
   Correct order: Understand → Retain → Weigh-up → Communicate
══════════════════════════════════════════════════════════ */

const CORRECT_ORDER = ['understand', 'retain', 'weigh', 'communicate'];

let _capDragSrc  = null;
let _capDone     = false;
window._capResult = null;

function _initCapacityDrag() {
  const list = document.getElementById('order-list');
  if (!list) return;

  list.querySelectorAll('.order-item').forEach(item => {
    item.setAttribute('draggable', 'true');

    item.addEventListener('dragstart', e => {
      _capDragSrc = item;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      list.querySelectorAll('.order-item').forEach(i => i.classList.remove('over'));
    });

    item.addEventListener('dragover', e => {
      e.preventDefault();
      if (_capDragSrc && _capDragSrc !== item) {
        item.classList.add('over');
      }
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('over');
    });

    item.addEventListener('drop', e => {
      e.preventDefault();
      item.classList.remove('over');
      if (!_capDragSrc || _capDragSrc === item) return;

      const items      = Array.from(list.querySelectorAll('.order-item'));
      const srcIndex   = items.indexOf(_capDragSrc);
      const destIndex  = items.indexOf(item);

      if (srcIndex < destIndex) {
        list.insertBefore(_capDragSrc, item.nextSibling);
      } else {
        list.insertBefore(_capDragSrc, item);
      }

      _capDragSrc = null;
      _clearCapResults();
    });
  });

  // Touch reorder (simple tap-swap via up/down buttons)
  _initTouchOrder();
}

function _initTouchOrder() {
  // For mobile: show move buttons that appear on tap
  const list = document.getElementById('order-list');
  if (!list) return;

  list.querySelectorAll('.order-item').forEach(item => {
    item.querySelectorAll('.order-move-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const direction = btn.dataset.dir;
        const items     = Array.from(list.querySelectorAll('.order-item'));
        const idx       = items.indexOf(item);

        if (direction === 'up' && idx > 0) {
          list.insertBefore(item, items[idx - 1]);
        } else if (direction === 'down' && idx < items.length - 1) {
          list.insertBefore(items[idx + 1], item);
        }

        _clearCapResults();
      });
    });
  });
}

function checkCapacity() {
  const list  = document.getElementById('order-list');
  if (!list) return;

  const items = Array.from(list.querySelectorAll('.order-item'));
  const order = items.map(i => i.dataset.key);

  const correct = order.every((key, idx) => key === CORRECT_ORDER[idx]);

  items.forEach((item, idx) => {
    item.classList.remove('correct', 'incorrect');
    const resultEl = item.querySelector('.order-result');
    if (order[idx] === CORRECT_ORDER[idx]) {
      item.classList.add('correct');
      if (resultEl) resultEl.textContent = '✓';
    } else {
      item.classList.add('incorrect');
      if (resultEl) resultEl.textContent = '✗';
    }
  });

  const fb = document.getElementById('capacity-feedback');
  if (fb) {
    if (correct) {
      fb.className = 'activity-feedback show correct';
      fb.innerHTML = `<strong>✓ Correct order!</strong>
        <p>The functional test requires demonstrating all four elements:
        <strong>Understand</strong> the information, <strong>Retain</strong> it long enough to decide,
        <strong>Weigh up</strong> the information, and <strong>Communicate</strong> the decision.
        Remember — capacity is <em>decision-specific</em>.</p>`;
      _capDone = true;
      window._capResult = 'correct';
      _unlockCapContinue();
    } else {
      fb.className = 'activity-feedback show incorrect';
      fb.innerHTML = `<p>Not quite right. Review the four elements and try reordering them.
        Think about the logical sequence — what must come before a patient can weigh up a decision?</p>`;
      window._capResult = 'incorrect';
    }
  }
}

function resetCapacity() {
  const list = document.getElementById('order-list');
  if (!list) return;

  // Shuffle items back to a random order
  const items = Array.from(list.querySelectorAll('.order-item'));
  // Remove and re-append in shuffled order
  const shuffled = items.sort(() => Math.random() - 0.5);
  shuffled.forEach(item => {
    item.classList.remove('correct','incorrect');
    const resultEl = item.querySelector('.order-result');
    if (resultEl) resultEl.textContent = '';
    list.appendChild(item);
  });

  _capDone = false;
  window._capResult = null;

  const fb = document.getElementById('capacity-feedback');
  if (fb) { fb.className = 'activity-feedback'; fb.innerHTML = ''; }

  _lockCapContinue();
}

function _clearCapResults() {
  if (!_capDone) return;
  const list = document.getElementById('order-list');
  if (!list) return;
  list.querySelectorAll('.order-item').forEach(item => {
    item.classList.remove('correct','incorrect');
    const resultEl = item.querySelector('.order-result');
    if (resultEl) resultEl.textContent = '';
  });
  const fb = document.getElementById('capacity-feedback');
  if (fb) { fb.className = 'activity-feedback'; fb.innerHTML = ''; }
  _capDone = false;
  window._capResult = null;
  _lockCapContinue();
}

function _unlockCapContinue() {
  const lock = document.getElementById('capacity-locked-msg');
  const btn  = document.getElementById('capacity-continue-btn');
  if (lock) lock.style.display = 'none';
  if (btn)  btn.hidden = false;
}

function _lockCapContinue() {
  const lock = document.getElementById('capacity-locked-msg');
  const btn  = document.getElementById('capacity-continue-btn');
  if (lock) lock.style.display = '';
  if (btn)  btn.hidden = true;
}

document.addEventListener('pagesLoaded', () => {
  _initCapacityDrag();
  _lockCapContinue();

  // Shuffle items on load
  const list = document.getElementById('order-list');
  if (list) {
    const items = Array.from(list.querySelectorAll('.order-item'));
    // Put in shuffled order (not already-correct)
    const shuffled = [items[1], items[3], items[0], items[2]]; // Retain, Communicate, Understand, Weigh
    shuffled.forEach(item => list.appendChild(item));
  }
});
