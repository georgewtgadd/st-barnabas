/* ══════════════════════════════════════════════════════════
   js/sort.js  ·  Myth or Fact — drag + touch + tap-to-place
══════════════════════════════════════════════════════════ */

const statementsData = {
  s1: { text: 'Palliative care means stopping all active treatment.',                                  answer: 'myth' },
  s2: { text: 'Palliative care can begin at the point of diagnosis.',                                  answer: 'fact' },
  s3: { text: 'Palliative care is only for people who are dying imminently.',                          answer: 'myth' },
  s4: { text: 'Palliative care addresses psychological and spiritual needs, not just physical ones.',   answer: 'fact' },
  s5: { text: 'Palliative care is only delivered in a hospice.',                                       answer: 'myth' },
  s6: { text: 'Families and carers are an explicit focus of palliative care.',                         answer: 'fact' },
};

/* ── State ───────────────────────────────────────────── */
let placements      = {};   // { s1: 'myth', … }
let checkResults    = {};   // { s1: true|false, … }  populated after checkSort()
let selectedStmt    = null;
let _sortDone       = false;
let _hasChecked     = false; // true once checkSort() has run at least once

window._sortResult     = null;
window._sortPlacements = {};

/* ══ MOUSE DRAG ═════════════════════════════════════════ */
function _initMouseDrag() {
  document.querySelectorAll('.sort-stmt').forEach(el => {
    el.addEventListener('dragstart', e => {
      if (el.classList.contains('placed')) { e.preventDefault(); return; }
      e.dataTransfer.setData('text/plain', el.id);
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));
  });
}

function onDrop(e, col) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const id = e.dataTransfer.getData('text/plain');
  if (id) _placeStatement(id, col);
}

/* ══ TOUCH DRAG ═════════════════════════════════════════ */
let _tEl        = null;
let _tGhost     = null;
let _tTargetCol = null;
let _tScrollInt = null;  // interval for auto-scroll during drag

function _initTouchDrag() {
  document.querySelectorAll('.sort-stmt').forEach(el => {
    el.addEventListener('touchstart',  _touchStart, { passive: false });
    el.addEventListener('touchmove',   _touchMove,  { passive: false });
    el.addEventListener('touchend',    _touchEnd,   { passive: false });
    el.addEventListener('touchcancel', _touchEnd,   { passive: false });
  });
}

function _touchStart(e) {
  const el = e.currentTarget;
  if (el.classList.contains('placed')) return;

  _tEl = el;
  const t = e.touches[0];
  const r = el.getBoundingClientRect();
  const w = Math.min(r.width, window.innerWidth - 24);

  _tGhost = el.cloneNode(true);
  Object.assign(_tGhost.style, {
    position:      'fixed',
    zIndex:        '9999',
    pointerEvents: 'none',
    width:         w + 'px',
    left:          (t.clientX - w / 2) + 'px',
    top:           (t.clientY - 36) + 'px',
    opacity:       '0.92',
    transform:     'scale(1.04) rotate(1deg)',
    background:    '#e8eef8',
    border:        '2px solid #22417e',
    borderRadius:  '8px',
    padding:       '11px 16px',
    fontSize:      '0.88rem',
    fontFamily:    'DM Sans, sans-serif',
    lineHeight:    '1.5',
    boxShadow:     '0 10px 28px rgba(0,0,0,0.25)',
    transition:    'none',
    userSelect:    'none',
  });
  document.body.appendChild(_tGhost);
  el.classList.add('dragging');

  /* Start auto-scroll check */
  _tScrollInt = setInterval(_autoScroll, 60);

  e.preventDefault();
}

function _touchMove(e) {
  if (!_tGhost) return;
  const t = e.touches[0];
  const w = _tGhost.offsetWidth;

  _tGhost.style.left = (t.clientX - w / 2) + 'px';
  _tGhost.style.top  = (t.clientY - 36) + 'px';

  /* Detect target column */
  _tGhost.style.display = 'none';
  const under = document.elementFromPoint(t.clientX, t.clientY);
  _tGhost.style.display = '';

  ['myth-col','fact-col'].forEach(id => {
    const c = document.getElementById(id);
    if (c) c.classList.remove('drag-over');
  });
  _tTargetCol = null;

  if (under) {
    const overMyth = under.closest('#myth-col');
    const overFact = under.closest('#fact-col');
    if (overMyth) { overMyth.classList.add('drag-over'); _tTargetCol = 'myth'; }
    else if (overFact) { overFact.classList.add('drag-over'); _tTargetCol = 'fact'; }
  }
  e.preventDefault();
}

function _touchEnd(e) {
  clearInterval(_tScrollInt); _tScrollInt = null;
  if (_tGhost) { _tGhost.remove(); _tGhost = null; }
  if (_tEl)    _tEl.classList.remove('dragging');

  ['myth-col','fact-col'].forEach(id => {
    const c = document.getElementById(id);
    if (c) c.classList.remove('drag-over');
  });

  if (_tEl && _tTargetCol) _placeStatement(_tEl.id, _tTargetCol);

  _tEl        = null;
  _tTargetCol = null;
  e.preventDefault();
}

/* Auto-scroll page when ghost near viewport edges */
function _autoScroll() {
  if (!_tGhost) return;
  const top = parseFloat(_tGhost.style.top);
  const vh  = window.innerHeight;
  const ZONE = 80; // px from edge to start scrolling
  const SPEED = 8;

  if (top + 60 > vh - ZONE) window.scrollBy(0, SPEED);
  else if (top < ZONE)       window.scrollBy(0, -SPEED);
}

/* ══ TAP-TO-SELECT (primary mobile interaction) ════════ */
function selectStatement(el) {
  if (el.classList.contains('placed')) return;

  if (selectedStmt === el.id) {
    el.classList.remove('selected');
    selectedStmt = null;
    _hideKeyboardBtns();
    return;
  }

  if (selectedStmt) {
    const prev = document.getElementById(selectedStmt);
    if (prev) prev.classList.remove('selected');
  }
  selectedStmt = el.id;
  el.classList.add('selected');
  _showKeyboardBtns();

  /* On touch devices: scroll drop zones into view so user can see them */
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    const cols = document.getElementById('myth-col');
    if (cols) setTimeout(() => cols.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
  }
}

function _showKeyboardBtns() {
  const row = document.getElementById('keyboard-sort-btns');
  if (row) row.style.display = 'flex';
}
function _hideKeyboardBtns() {
  const row = document.getElementById('keyboard-sort-btns');
  if (row) row.style.display = 'none';
}

function placeSelected(col) {
  if (!selectedStmt) return;
  _placeStatement(selectedStmt, col);
  selectedStmt = null;
  _hideKeyboardBtns();
}

/* ══ CORE: PLACE ════════════════════════════════════════ */
function _placeStatement(id, col) {
  const stmt = document.getElementById(id);
  if (!stmt || stmt.classList.contains('placed')) return;

  stmt.classList.add('placed');
  stmt.classList.remove('selected');
  placements[id] = col;
  window._sortPlacements[id] = col;

  /* If we've already checked answers, clear check results since layout changed */
  if (_hasChecked) {
    checkResults = {};
    _hasChecked  = false;
    _clearPlacedMarkers();
    _lockSortContinue();
  }

  const list = document.getElementById(col + '-items');
  if (!list) return;

  const div = document.createElement('div');
  div.className = 'sort-placed ' + col;
  div.setAttribute('data-id', id);
  div.innerHTML =
    '<span class="sort-placed-text">' + statementsData[id].text + '</span>' +
    '<span class="sort-placed-status" aria-hidden="true"></span>' +
    '<span class="sort-placed-remove" role="button" tabindex="0" ' +
    'onclick="returnStatement(\'' + id + '\')" ' +
    'onkeydown="if(event.key===\'Enter\'||event.key===\' \')returnStatement(\'' + id + '\')" ' +
    'aria-label="Remove from ' + col + '">✕</span>';
  list.appendChild(div);
}

/* ══ RETURN TO POOL ═════════════════════════════════════ */
function returnStatement(id) {
  const original = document.getElementById(id);
  if (original) original.classList.remove('placed', 'selected');

  delete placements[id];
  delete window._sortPlacements[id];
  delete checkResults[id];

  const placed = document.querySelector('.sort-placed[data-id="' + id + '"]');
  if (placed) placed.remove();

  /* Keep feedback showing — don't wipe it. If all-correct state, reset it. */
  if (_sortDone) {
    /* Item removed after a pass — shouldn't happen but reset gracefully */
    _lockSortContinue();
  }
  /* If feedback was showing a "some-wrong" message, leave it — user can re-check */
}

/* ══ MARK PLACED ITEMS WITH ✓ / ✗ ══════════════════════ */
function _applyPlacedMarkers() {
  document.querySelectorAll('.sort-placed').forEach(div => {
    const id      = div.getAttribute('data-id');
    const correct = checkResults[id];
    const status  = div.querySelector('.sort-placed-status');
    if (!status) return;

    div.classList.remove('checked-correct', 'checked-wrong');
    if (correct === true) {
      div.classList.add('checked-correct');
      status.textContent = '✓';
    } else if (correct === false) {
      div.classList.add('checked-wrong');
      status.textContent = '✗';
    }
  });
}

function _clearPlacedMarkers() {
  document.querySelectorAll('.sort-placed').forEach(div => {
    div.classList.remove('checked-correct', 'checked-wrong');
    const status = div.querySelector('.sort-placed-status');
    if (status) status.textContent = '';
  });
}

/* ══ CHECK ANSWERS ══════════════════════════════════════ */
function checkSort() {
  const ids      = Object.keys(statementsData);
  const unplaced = ids.filter(id => !placements[id]);
  const fb       = document.getElementById('sort-feedback');

  if (unplaced.length > 0) {
    fb.className = 'sort-feedback show some-wrong';
    fb.innerHTML = '⚠️ Please sort all ' + ids.length + ' statements before checking. (' + unplaced.length + ' remaining)';
    return;
  }

  /* Score and record per-item results */
  checkResults = {};
  let correct  = 0;
  const wrong  = [];
  ids.forEach(id => {
    const ok = statementsData[id].answer === placements[id];
    checkResults[id] = ok;
    if (ok) correct++;
    else wrong.push('"' + statementsData[id].text + '" is a <strong>' + statementsData[id].answer + '</strong>');
  });
  _hasChecked = true;

  /* Mark placed items visually */
  _applyPlacedMarkers();

  if (correct === ids.length) {
    fb.className = 'sort-feedback show all-correct';
    fb.innerHTML = '✓ Well done — all ' + ids.length + ' statements correctly sorted!';
    window._sortResult = 'all-correct';
    _unlockSortContinue();
  } else {
    fb.className = 'sort-feedback show some-wrong';
    fb.innerHTML = '⚠️ ' + (ids.length - correct) + ' statement(s) need reviewing. ' +
      'Remove the <strong>✗</strong> items and try again:<br>' +
      '<ul style="margin-top:8px;padding-left:18px;">' +
      wrong.map(w => '<li>' + w + '</li>').join('') + '</ul>';
    window._sortResult = 'some-wrong';
    _lockSortContinue();
  }
}

function _unlockSortContinue() {
  _sortDone = true;
  const lock = document.getElementById('sort-locked-msg');
  const btn  = document.getElementById('sort-continue-btn');
  if (lock) lock.style.display = 'none';
  if (btn)  btn.hidden = false;
}
function _lockSortContinue() {
  _sortDone = false;
  const lock = document.getElementById('sort-locked-msg');
  const btn  = document.getElementById('sort-continue-btn');
  if (lock) lock.style.display = '';
  if (btn)  btn.hidden = true;
}

/* ══ RESET ══════════════════════════════════════════════ */
function resetSort() {
  placements  = {};
  checkResults= {};
  _hasChecked = false;
  window._sortPlacements = {};
  window._sortResult     = null;
  selectedStmt           = null;

  document.querySelectorAll('.sort-stmt').forEach(el => el.classList.remove('placed', 'selected'));
  ['myth-items','fact-items'].forEach(id => {
    const el = document.getElementById(id); if (el) el.innerHTML = '';
  });

  const fb = document.getElementById('sort-feedback');
  if (fb) { fb.className = 'sort-feedback'; fb.textContent = ''; }

  _lockSortContinue();
  _hideKeyboardBtns();
}

/* ══ INIT ═══════════════════════════════════════════════ */
document.addEventListener('pagesLoaded', () => {
  _initMouseDrag();
  _initTouchDrag();
  _lockSortContinue();
});
