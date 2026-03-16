/* navigation.js */
'use strict';
let currentPage = 1;
const TOTAL_PAGES = 10;

function goToPage(n) {
  const prev = document.getElementById('page-' + currentPage);
  const next = document.getElementById('page-' + n);
  if (!next) return;
  if (prev) prev.classList.remove('active');
  next.classList.add('active');

  const prevNav = document.getElementById('nav-' + currentPage);
  if (prevNav) { prevNav.classList.remove('current'); if (!prevNav.classList.contains('done')) prevNav.classList.add('done'); prevNav.removeAttribute('aria-current'); prevNav.disabled = false; }

  currentPage = n;
  const curNav = document.getElementById('nav-' + n);
  if (curNav) { curNav.classList.add('current'); curNav.setAttribute('aria-current','step'); curNav.disabled = false; }

  updateProgressBar();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const nxtNav = document.getElementById('nav-' + (n + 1));
  if (nxtNav) nxtNav.disabled = false;
}

function navClick(n) {
  const btn = document.getElementById('nav-' + n);
  if (btn && !btn.disabled) goToPage(n);
}

function updateProgressBar() {
  const pct   = Math.round(((currentPage - 1) / (TOTAL_PAGES - 1)) * 100);
  const fill  = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');
  if (fill)  { fill.style.width = pct + '%'; fill.closest('[role="progressbar"]').setAttribute('aria-valuenow', pct); }
  if (label) label.textContent = pct + '% complete';
}
