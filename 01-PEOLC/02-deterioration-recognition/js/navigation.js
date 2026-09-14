/* ══════════════════════════════════════════════════════════
   PAGE NAVIGATION — 12-page module
   js/navigation.js
══════════════════════════════════════════════════════════ */

var visited    = new Set([1]);
var TOTAL_PAGES = 12;

function updateProgressBar(num) {
  var pct  = Math.round(((num - 1) / (TOTAL_PAGES - 1)) * 100);
  var fill = document.getElementById('progress-fill');
  var lbl  = document.getElementById('progress-label');
  if (fill) fill.style.width = pct + '%';
  if (lbl) {
    lbl.textContent = pct + '% complete';
    var bar = lbl.closest('.module-progress-bar');
    if (bar) bar.setAttribute('aria-valuenow', pct);
  }
}

function goToPage(num) {
  visited.add(num);

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  var page = document.getElementById('page-' + num);
  if (page) page.classList.add('active');

  // Update nav steps (desktop bar + drawer)
  for (var i = 1; i <= TOTAL_PAGES; i++) {
    [document.getElementById('nav-' + i), document.getElementById('drawer-nav-' + i)].forEach(function(step) {
      if (!step) return;
      step.classList.remove('current', 'done');
      step.removeAttribute('aria-current');
      if (i === num) {
        step.classList.add('current');
        step.setAttribute('aria-current', 'step');
        step.disabled = false;
      } else if (visited.has(i)) {
        step.classList.add('done');
        step.disabled = false;
      } else {
        step.disabled = true;
      }
    });
  }

  var mobileCurrent = document.getElementById('progress-nav-mobile-current');
  if (mobileCurrent) mobileCurrent.textContent = 'Step ' + num + ' of ' + TOTAL_PAGES;

  updateProgressBar(num);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Focus first heading for accessibility
  var h = page && page.querySelector('h1,h2');
  if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }

  // Report to the LRS, if one is present (see js/xapi.js)
  if (typeof XAPI !== 'undefined') {
    XAPI.experienced('pages/page-' + num, 'Page ' + num);
  }

  // Populate learning record when reaching page 12
  if (num === 12 && typeof populateLearningRecord === 'function') {
    populateLearningRecord();
  }

  if (typeof closeProgressDrawer === 'function') closeProgressDrawer();
}

function navClick(num) {
  if (visited.has(num)) goToPage(num);
}

// finishModule() and closeOrRedirect() now live in js/record.js,
// matching the pattern used across the module series.
