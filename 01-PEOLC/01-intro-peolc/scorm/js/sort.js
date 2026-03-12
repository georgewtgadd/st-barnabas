/* ══════════════════════════════════════════════════════════
   js/sort.js  ·  Myth or Fact sort — mouse drag + touch drag
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
let selectedStmt    = null; // id of keyboard-selected statement
let _sortDone       = false;

window._sortResult     = null;
window._sortPlacements = {};

/* ══ MOUSE DRAG ══════════════════════════════════════════ */
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

/* ══ TOUCH DRAG ══════════════════════════════════════════ */
let _tEl        = null;   // element being touch-dragged
let _tGhost     = null;   // floating clone shown under finger
let _tTargetCol = null;   // 'myth' | 'fact' | null

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
  const w = el.getBoundingClientRect().width;

  /* Create a visual ghost that follows the finger */
  _tGhost = el.cloneNode(true);
  Object.assign(_tGhost.style, {
    position:      'fixed',
    zIndex:        '9999',
    pointerEvents: 'none',
    width:         w + 'px',
    left:          (t.clientX - w / 2) + 'px',
    top:           (t.clientY - 36) + 'px',
    opacity:       '0.9',
    transform:     'scale(1.06) rotate(1.5deg)',
    background:    '#e8eef8',
    border:        '2px solid #22417e',
    borderRadius:  '8px',
    padding:       '11px 16px',
    fontSize:      '0.88rem',
    fontFamily:    'DM Sans, sans-serif',
    boxShadow:     '0 10px 28px rgba(0,0,0,0.25)',
    transition:    'none',
    userSelect:    'none',
    lineHeight:    '1.5',
  });
  document.body.appendChild(_tGhost);
  el.classList.add('dragging');
  e.preventDefault();
}

function _touchMove(e) {
  if (!_tGhost) return;
  const t = e.touches[0];
  const w = _tGhost.offsetWidth;

  _tGhost.style.left = (t.clientX - w / 2) + 'px';
  _tGhost.style.top  = (t.clientY - 36) + 'px';

  /* Hide ghost briefly so elementFromPoint can see what's underneath */
  _tGhost.style.display = 'none';
  const under = document.elementFromPoint(t.clientX, t.clientY);
  _tGhost.style.display = '';

  const mythCol = document.getElementById('myth-col');
  const factCol = document.getElementById('fact-col');
  if (mythCol) mythCol.classList.remove('drag-over');
  if (factCol) factCol.classList.remove('drag-over');
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
  /* Remove ghost */
  if (_tGhost) { _tGhost.remove(); _tGhost = null; }
  if (_tEl)    _tEl.classList.remove('dragging');

  /* Clear drop-zone highlights */
  document.querySelectorAll('.sort-col').forEach(c => c.classList.remove('drag-over'));

  /* Place if over a valid column */
  if (_tEl && _tTargetCol) {
    _placeStatement(_tEl.id, _tTargetCol);
  }

  _tEl        = null;
  _tTargetCol = null;
  e.preventDefault();
}

/* ══ CLICK / KEYBOARD SELECTION (fallback for touch) ════ */
function selectStatement(el) {
  if (el.classList.contains('placed')) return;

  /* Tapping already-selected → deselect */
  if (selectedStmt === el.id) {
    el.classList.remove('selected');
    selectedStmt = null;
    _hideKeyboardBtns();
    return;
  }

  /* Deselect previous */
  if (selectedStmt) {
    const prev = document.getElementById(selectedStmt);
    if (prev) prev.classList.remove('selected');
  }
  selectedStmt = el.id;
  el.classList.add('selected');
  _showKeyboardBtns();
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

/* ══ CORE: PLACE A STATEMENT ══════════════════════════════ */
function _placeStatement(id, col) {
  const stmt = document.getElementById(id);
  if (!stmt || stmt.classList.contains('placed')) return;

  stmt.classList.add('placed');
  stmt.classList.remove('selected');
  placements[id] = col;
  window._sortPlacements[id] = col;

  const list = document.getElementById(col + '-items');
  if (!list) return;

  const div = document.createElement('div');
  div.className = 'sort-placed ' + col;
  div.setAttribute('data-id', id);
  div.innerHTML =
    statementsData[id].text +
    '<span class="sort-placed-remove" role="button" tabindex="0" ' +
    'onclick="returnStatement(\'' + id + '\')" ' +
    'onkeydown="if(event.key===\'Enter\'||event.key===\' \')returnStatement(\'' + id + '\')" ' +
    'aria-label="Remove from ' + col + '">✕</span>';
  list.appendChild(div);
}

/* ══ RETURN TO POOL ═══════════════════════════════════════ */
function returnStatement(id) {
  const original = document.getElementById(id);
  if (original) original.classList.remove('placed', 'selected');

  delete placements[id];
  delete window._sortPlacements[id];

  const placed = document.querySelector('.sort-placed[data-id="' + id + '"]');
  if (placed) placed.remove();

  const fb = document.getElementById('sort-feedback');
  if (fb && !fb.classList.contains('all-correct')) {
    fb.className = 'sort-feedback'; fb.textContent = '';
  }
  _lockSortContinue();
}

/* ══ CHECK ANSWERS ════════════════════════════════════════ */
function checkSort() {
  const ids      = Object.keys(statementsData);
  const unplaced = ids.filter(id => !placements[id]);
  const fb       = document.getElementById('sort-feedback');

  if (unplaced.length > 0) {
    fb.className = 'sort-feedback show some-wrong';
    fb.innerHTML = '⚠️ Please sort all ' + ids.length + ' statements before checking. (' + unplaced.length + ' remaining)';
    return;
  }

  let correct = 0;
  const wrong = [];
  ids.forEach(id => {
    if (statementsData[id].answer === placements[id]) correct++;
    else wrong.push('"' + statementsData[id].text + '" is a <strong>' + statementsData[id].answer + '</strong>');
  });

  if (correct === ids.length) {
    fb.className = 'sort-feedback show all-correct';
    fb.innerHTML = '✓ Well done — all ' + ids.length + ' statements correctly sorted!';
    window._sortResult = 'all-correct';
    _unlockSortContinue();
  } else {
    fb.className = 'sort-feedback show some-wrong';
    fb.innerHTML = '⚠️ ' + (ids.length - correct) + ' statement(s) need reviewing:<br>' +
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

/* ══ RESET ════════════════════════════════════════════════ */
function resetSort() {
  placements = {};
  window._sortPlacements = {};
  window._sortResult     = null;
  selectedStmt           = null;

  document.querySelectorAll('.sort-stmt').forEach(el => el.classList.remove('placed', 'selected'));
  const mythList = document.getElementById('myth-items');
  const factList = document.getElementById('fact-items');
  if (mythList) mythList.innerHTML = '';
  if (factList) factList.innerHTML = '';

  const fb = document.getElementById('sort-feedback');
  if (fb) { fb.className = 'sort-feedback'; fb.textContent = ''; }

  _lockSortContinue();
  _hideKeyboardBtns();
}

/* ══ INIT ═════════════════════════════════════════════════ */
document.addEventListener('pagesLoaded', () => {
  _initMouseDrag();
  _initTouchDrag();
  _lockSortContinue();
});
