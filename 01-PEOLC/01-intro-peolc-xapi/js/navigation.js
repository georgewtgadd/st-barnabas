/* ══════════════════════════════════════════════════════════
   js/navigation.js  ·  Page routing and progress bar
   Drives BOTH the desktop horizontal bar and the burger drawer's
   vertical list — every step control carries data-step="N", and
   _updateNav() updates every matching element, however many exist.
══════════════════════════════════════════════════════════ */

const TOTAL_PAGES = 9;
let currentPage   = 1;
let highestPage   = 1;

const PAGE_LABELS = [
  '', // 1-indexed
  'Introduction',
  'What is it?',
  'Myth or Fact?',
  'Reflect',
  'Phases & Layers',
  'GMC & NICE',
  'Apply',
  'Quiz',
  'My Record',
];

function goToPage(n) {
  if (n < 1 || n > TOTAL_PAGES) return;

  // Hide current
  const prev = document.getElementById('page-' + currentPage);
  if (prev) prev.classList.remove('active');

  // Show new
  const next = document.getElementById('page-' + n);
  if (next) next.classList.add('active');

  currentPage = n;
  if (n > highestPage) highestPage = n;

  _updateNav();
  updateProgressBar();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Dispatch for main.js hooks (quiz render, record populate)
  document.dispatchEvent(new CustomEvent('pageChanged', { detail: { page: n } }));
}

function navClick(n) {
  if (n > highestPage) return; // locked — not yet unlocked
  goToPage(n);
  if (typeof closeProgressDrawer === 'function') closeProgressDrawer();
}

function _updateNav() {
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    const btns = document.querySelectorAll('.nav-step[data-step="' + i + '"]');
    btns.forEach(btn => {
      btn.classList.remove('current', 'done');
      btn.disabled = false;

      if (i === currentPage) {
        btn.classList.add('current');
        btn.setAttribute('aria-current', 'step');
      } else if (i <= highestPage) {
        btn.classList.add('done');
        btn.removeAttribute('aria-current');
      } else {
        btn.removeAttribute('aria-current');
        btn.disabled = true;
      }
    });
  }

  const mobileCurrent = document.getElementById('progress-nav-mobile-current');
  if (mobileCurrent) {
    mobileCurrent.textContent = 'Step ' + currentPage + ' of ' + TOTAL_PAGES + ' — ' + PAGE_LABELS[currentPage];
  }
}

function updateProgressBar() {
  const pct = Math.round(((currentPage - 1) / (TOTAL_PAGES - 1)) * 100);
  const fill  = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');
  if (fill)  fill.style.width = pct + '%';
  if (label) label.textContent = pct + '% complete';
  const bar = document.querySelector('.module-progress-bar');
  if (bar)   bar.setAttribute('aria-valuenow', pct);
}
