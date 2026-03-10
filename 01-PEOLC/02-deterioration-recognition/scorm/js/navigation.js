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

  // Update nav steps
  for (var i = 1; i <= TOTAL_PAGES; i++) {
    var step = document.getElementById('nav-' + i);
    if (!step) continue;
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
  }

  updateProgressBar(num);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Focus first heading for accessibility
  var h = page && page.querySelector('h1,h2');
  if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }

  // SCORM bookmark
  SCORM.saveBookmark(num);
  if (SCORM.isInitialized()) {
    var cur = SCORM.getValue('cmi.core.lesson_status');
    if (cur !== 'passed' && cur !== 'failed') {
      SCORM.setValue('cmi.core.lesson_status', 'incomplete');
      SCORM.commit();
    }
  }

  // Populate learning record when reaching page 12
  if (num === 12 && typeof populateLearningRecord === 'function') {
    populateLearningRecord();
  }
}

function navClick(num) {
  if (visited.has(num)) goToPage(num);
}

function finishModule() {
  SCORM.finish('passed', null);
  alert('Well done — you have completed the Deterioration & Recognition module. Your progress has been saved.');
}

function closeOrRedirect() {
  try { window.close(); } catch (e) {}
  setTimeout(function () { goToPage(1); }, 300);
}
