/* ══════════════════════════════════════════════════════════
   js/dnd.js  ·  Respiratory drag-and-drop — page 2
   Mirrors Module 2 sort.js pattern exactly:
     - All functions defined here in pre-loaded JS
     - Page HTML calls these globals via inline handlers
     - No <script> tags inside page fragments
   Incorrect cards returned to pool on check.
   All 6 must be correct to unlock continue.
══════════════════════════════════════════════════════════ */

let _dndDragging = null;

/* ── INIT (called from main.js after pagesLoaded) ───── */
function initDnD() {
  document.querySelectorAll('.dnd-card').forEach(card => {
    card.addEventListener('dragstart', e => {
      _dndDragging = card;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.dataset.id);
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      _dndDragging = null;
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        document.querySelectorAll('.dnd-card').forEach(c => c.removeAttribute('data-kb-selected'));
        card.setAttribute('data-kb-selected', '1');
      }
    });
  });
}

/* ── DROP ZONE HANDLERS called from inline HTML attrs ── */
/* Mirrors Module 2 onDrop(e, col) in sort.js            */

function dndZoneOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function dndZoneLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function dndZoneDrop(e, cat) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const id = e.dataTransfer.getData('text/plain');
  if (id) dndPlaceCard(id, cat);
}

/* ── KEYBOARD / TAP PLACEMENT ───────────────────────── */
function dndKeyPlace(targetCat) {
  const sel = document.querySelector('.dnd-card[data-kb-selected]');
  if (!sel) return;
  sel.removeAttribute('data-kb-selected');
  dndPlaceCard(sel.dataset.id, targetCat);
}

/* ── CORE PLACE FUNCTION ────────────────────────────── */
function dndPlaceCard(id, targetCat) {
  const original = document.querySelector(`#dnd-pool [data-id="${id}"]`);
  if (!original || original.classList.contains('dnd-placed')) return;

  original.classList.add('dnd-placed');

  const zoneCards = document.getElementById('zone-' + targetCat + '-cards');
  if (!zoneCards) return;

  const clone = original.cloneNode(true);
  clone.draggable = true;
  clone.classList.remove('dnd-placed', 'dragging');
  clone.removeAttribute('data-kb-selected');
  clone.dataset.id = id;
  clone.dataset.placedIn = targetCat;

  /* Allow dragging placed clone back out */
  clone.addEventListener('dragstart', e => {
    _dndDragging = clone;
    clone.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setTimeout(() => {
      clone.remove();
      const orig = document.querySelector(`#dnd-pool [data-id="${id}"]`);
      if (orig) orig.classList.remove('dnd-placed', 'correct-placed', 'wrong-placed');
    }, 0);
  });

  zoneCards.appendChild(clone);
  _dndClearFeedback();
}

/* ── CHECK ──────────────────────────────────────────── */
function dndCheck() {
  const zones    = ['breathlessness', 'secretions'];
  let correct    = 0;
  const wrongIds = [];

  const unplaced = document.querySelectorAll('#dnd-pool .dnd-card:not(.dnd-placed)').length;
  if (unplaced > 0) {
    _dndShowFb('⚠️ Please place all 6 cards before checking. (' + unplaced + ' still in the pool)', false);
    return;
  }

  zones.forEach(cat => {
    const container = document.getElementById('zone-' + cat + '-cards');
    if (!container) return;
    container.querySelectorAll('.dnd-card').forEach(card => {
      card.classList.remove('correct-placed', 'wrong-placed');
      if (card.dataset.cat === cat) {
        correct++;
        card.classList.add('correct-placed');
      } else {
        card.classList.add('wrong-placed');
        wrongIds.push({ id: card.dataset.id, el: card });
      }
    });
  });

  if (correct === 6) {
    _dndShowFb(
      '✅ <strong>All correct!</strong> Fan therapy, calm reassurance, and upright positioning help breathlessness. ' +
      'Side-lying, explaining physiology to the family, and mouth care address terminal secretions.',
      true
    );
    window._dndResult = '6 / 6 \u2014 All interventions correctly matched \u2713';
    unlockContinue('_lock_dnd', 'dnd-locked-msg', 'dnd-continue-btn');
  } else {
    _dndShowFb(
      '❌ <strong>' + correct + ' / 6 correct.</strong> Incorrect cards (shown in red) have been returned to the pool — try again.',
      false
    );
    window._dndResult = correct + ' / 6 correct (activity completed)';
    setTimeout(() => {
      wrongIds.forEach(({ el }) => {
        const id   = el.dataset.id;
        el.remove();
        const orig = document.querySelector('#dnd-pool [data-id="' + id + '"]');
        if (orig) orig.classList.remove('dnd-placed', 'correct-placed', 'wrong-placed');
      });
    }, 1200);
  }
}

/* ── RESET ──────────────────────────────────────────── */
function dndReset() {
  ['breathlessness', 'secretions'].forEach(cat => {
    const c = document.getElementById('zone-' + cat + '-cards');
    if (c) c.innerHTML = '';
  });
  document.querySelectorAll('#dnd-pool .dnd-card').forEach(c => {
    c.classList.remove('dnd-placed', 'correct-placed', 'wrong-placed', 'dragging');
    c.removeAttribute('data-kb-selected');
  });
  _dndClearFeedback();
  lockContinue('_lock_dnd', 'dnd-locked-msg', 'dnd-continue-btn');
  window._dndResult = null;
}

function _dndShowFb(html, ok) {
  const fb = document.getElementById('dnd-feedback');
  if (!fb) return;
  fb.innerHTML = html;
  fb.className = 'dnd-feedback ' + (ok ? 'show-correct' : 'show-wrong');
}
function _dndClearFeedback() {
  const fb = document.getElementById('dnd-feedback');
  if (fb) { fb.className = 'dnd-feedback'; fb.textContent = ''; }
}
