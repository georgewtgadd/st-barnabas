/* ══════════════════════════════════════════════════════════
   js/sort.js  ·  Myth or Fact drag-drop sort activity
══════════════════════════════════════════════════════════ */

const statementsData = {
  s1: { text: 'Palliative care means stopping all active treatment.',                              answer: 'myth' },
  s2: { text: 'Palliative care can begin at the point of diagnosis.',                              answer: 'fact' },
  s3: { text: 'Palliative care is only for people who are dying imminently.',                      answer: 'myth' },
  s4: { text: 'Palliative care addresses psychological and spiritual needs, not just physical ones.', answer: 'fact' },
  s5: { text: 'Palliative care is only delivered in a hospice.',                                   answer: 'myth' },
  s6: { text: 'Families and carers are an explicit focus of palliative care.',                     answer: 'fact' },
};

// State
let placements      = {};    // { s1: 'myth', s2: 'fact', … }
let selectedStmt    = null;  // currently keyboard-selected item id
let _sortDone       = false;

// Expose for record.js
window._sortResult     = null;  // 'all-correct' | 'some-wrong'
window._sortPlacements = {};

/* ── Drag events ─────────────────────────────────────── */
function _initDrag() {
  document.querySelectorAll('.sort-stmt').forEach(el => {
    el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', el.id);
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));
  });
}

/* ── Keyboard / click selection ──────────────────────── */
function selectStatement(el) {
  if (el.classList.contains('placed')) return;

  if (selectedStmt === el.id) {
    // Deselect
    el.classList.remove('selected');
    selectedStmt = null;
    _hideKeyboardBtns();
    return;
  }

  // Deselect previous
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

/* ── Drop handler ────────────────────────────────────── */
function onDrop(e, col) {
  e.preventDefault();
  const colEl = e.currentTarget;
  colEl.classList.remove('drag-over');
  const id = e.dataTransfer.getData('text/plain');
  if (id) _placeStatement(id, col);
}

/* ── Core: place a statement ─────────────────────────── */
function _placeStatement(id, col) {
  const stmt = document.getElementById(id);
  if (!stmt || stmt.classList.contains('placed')) return;

  // Mark original as placed
  stmt.classList.add('placed');
  stmt.classList.remove('selected');
  placements[id] = col;
  window._sortPlacements[id] = col;

  // Create placed item in drop zone
  const list = document.getElementById(col + '-items');
  if (!list) return;
  const div = document.createElement('div');
  div.className = 'sort-placed ' + col;
  div.setAttribute('data-id', id);
  div.innerHTML = statementsData[id].text +
    '<span class="sort-placed-remove" onclick="returnStatement(\'' + id + '\')" ' +
    'aria-label="Remove from ' + col + '">✕</span>';
  list.appendChild(div);
}

/* ── Return a placed statement to pool ───────────────── */
function returnStatement(id) {
  const original = document.getElementById(id);
  if (original) {
    original.classList.remove('placed', 'selected');
  }
  delete placements[id];
  delete window._sortPlacements[id];

  // Remove from drop zone
  const placed = document.querySelector('.sort-placed[data-id="' + id + '"]');
  if (placed) placed.remove();

  // Reset feedback & lock
  const fb = document.getElementById('sort-feedback');
  if (fb) { fb.className = 'sort-feedback'; fb.textContent = ''; }
  _lockSortContinue();
}

/* ── Check answers ───────────────────────────────────── */
function checkSort() {
  const ids = Object.keys(statementsData);
  const unplaced = ids.filter(id => !placements[id]);
  const fb = document.getElementById('sort-feedback');

  if (unplaced.length > 0) {
    fb.className = 'sort-feedback show some-wrong';
    fb.innerHTML = '⚠️ Please sort all ' + ids.length + ' statements before checking. ' +
      '(' + unplaced.length + ' remaining)';
    return;
  }

  let correct = 0;
  let details = [];
  ids.forEach(id => {
    const right = statementsData[id].answer === placements[id];
    if (right) correct++;
    else details.push('"' + statementsData[id].text + '" is a <strong>' + statementsData[id].answer + '</strong>');
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
      details.map(d => '<li>' + d + '</li>').join('') + '</ul>';
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

/* ── Reset ───────────────────────────────────────────── */
function resetSort() {
  placements = {};
  window._sortPlacements = {};
  window._sortResult = null;
  selectedStmt = null;

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

/* ── Init ────────────────────────────────────────────── */
document.addEventListener('pagesLoaded', () => {
  _initDrag();
  _lockSortContinue();
});
