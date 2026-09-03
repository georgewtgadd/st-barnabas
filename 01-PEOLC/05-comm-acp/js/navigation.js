/* ══════════════════════════════════════════════════════════
   js/navigation.js  ·  Page routing and progress bar
══════════════════════════════════════════════════════════ */

const TOTAL_PAGES = 10;
let currentPage   = 1;
let highestPage   = 1;

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

  if (typeof XAPI !== 'undefined') {
    XAPI.experienced('pages/page-' + n, 'Page ' + n);
  }
  if (typeof closeProgressDrawer === 'function') closeProgressDrawer();

  document.dispatchEvent(new CustomEvent('pageChanged', { detail: { page: n } }));
}

function navClick(n) {
  if (n > highestPage) return;
  goToPage(n);
}

function _updateNav() {
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    [document.getElementById('nav-' + i), document.getElementById('drawer-nav-' + i)].forEach(btn => {
      if (!btn) return;
      btn.classList.remove('current', 'done');
      btn.disabled = false;

      if (i === currentPage) {
        btn.classList.add('current');
        btn.setAttribute('aria-current', 'step');
        btn.disabled = false;
      } else if (i <= highestPage) {
        btn.classList.add('done');
        btn.removeAttribute('aria-current');
        btn.disabled = false;
      } else {
        btn.removeAttribute('aria-current');
        btn.disabled = true;
      }
    });
  }
  const mobileCurrent = document.getElementById('progress-nav-mobile-current');
  if (mobileCurrent) mobileCurrent.textContent = 'Step ' + currentPage + ' of ' + TOTAL_PAGES;
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
