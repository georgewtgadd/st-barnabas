/* ══════════════════════════════════════════════════════════
   js/navigation.js  ·  Page routing, progress bar & locks
══════════════════════════════════════════════════════════ */

const TOTAL_PAGES = 11;
let currentPage  = 1;
let highestPage  = 1;

/* ── COMPLETION FLAGS (set by feature modules) ──────── */
/* Each lock must be cleared before Continue is shown    */
window._lock_dnd      = true;   // page 2  — DnD all correct
window._lock_cat      = true;   // page 4  — all 6 categorised
window._lock_abc      = true;   // page 5  — ABC checked
window._lock_seq      = true;   // page 9  — sequence checked
window._lock_cases    = true;   // page 10 — ≥80% on MCQ

function goToPage(n) {
  if (n < 1 || n > TOTAL_PAGES) return;

  const prev = document.getElementById('page-' + currentPage);
  if (prev) prev.classList.remove('active');

  const next = document.getElementById('page-' + n);
  if (next) next.classList.add('active');

  currentPage = n;
  if (n > highestPage) highestPage = n;

  _updateNav();
  updateProgressBar();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  SCORM.saveBookmark(n);
  document.dispatchEvent(new CustomEvent('pageChanged', { detail: { page: n } }));
}

function navClick(n) {
  const btn = document.getElementById('nav-' + n);
  if (!btn || btn.disabled) return;
  goToPage(n);
}

function _updateNav() {
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    const btn = document.getElementById('nav-' + i);
    if (!btn) continue;
    btn.classList.remove('current', 'done');
    btn.removeAttribute('aria-current');

    if (i === currentPage) {
      btn.classList.add('current');
      btn.setAttribute('aria-current', 'step');
      btn.disabled = false;
    } else if (i <= highestPage) {
      btn.classList.add('done');
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
  }
}

function updateProgressBar() {
  const pct   = Math.round(((currentPage - 1) / (TOTAL_PAGES - 1)) * 100);
  const fill  = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');
  if (fill)  fill.style.width = pct + '%';
  if (label) label.textContent = pct + '% complete';
  const bar = document.querySelector('.module-progress-bar');
  if (bar)   bar.setAttribute('aria-valuenow', pct);
}

/* ── LOCK / UNLOCK HELPERS ─────────────────────────── */
function unlockContinue(lockKey, lockedMsgId, continueBtnId) {
  window[lockKey] = false;
  const lock = document.getElementById(lockedMsgId);
  const btn  = document.getElementById(continueBtnId);
  if (lock) lock.style.display = 'none';
  if (btn)  btn.hidden = false;
}

function lockContinue(lockKey, lockedMsgId, continueBtnId) {
  window[lockKey] = true;
  const lock = document.getElementById(lockedMsgId);
  const btn  = document.getElementById(continueBtnId);
  if (lock) lock.style.display = '';
  if (btn)  btn.hidden = true;
}
