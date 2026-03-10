/* ══════════════════════════════════════════════════════════
   CASE STUDY — Answer Reveals & Learning Record
   js/case-study.js
══════════════════════════════════════════════════════════ */

/**
 * Opens an answer reveal panel inline (no modal needed).
 * The cab-answer element is a sibling of the reveal button.
 * @param {string} id - base id, e.g. 'bob3-q1' → element 'bob3-q1-answer'
 */
function openAnswerModal(id) {
  var el = document.getElementById(id + '-answer');
  if (!el) return;
  var showing = el.style.display !== 'none';
  el.style.display = showing ? 'none' : 'block';
}

function saveActivity9() {
  // Autosave is handled by the textarea's oninput → checkPage9Gate
}

/* ══════════════════════════════════════════════════════════
   LEARNING RECORD — Page 12
   Populates exported display fields from in-page state
══════════════════════════════════════════════════════════ */
function populateLearningRecord() {

  // Date
  var d  = new Date();
  var el = document.getElementById('export-date');
  if (el) el.textContent = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // AKPS score
  var akpsEl = document.getElementById('export-akps-score');
  if (akpsEl) {
    if (window.akpsConfirmedScore !== null) {
      var colourMap = {
        green:  { bg: '#dcfce7', color: '#166534' },
        amber:  { bg: '#fef9c3', color: '#854d0e' },
        orange: { bg: '#ffedd5', color: '#9a3412' },
        red:    { bg: '#fee2e2', color: '#991b1b' },
        pink:   { bg: '#fce7f3', color: '#831843' }
      };
      var c = colourMap[window.akpsConfirmedCls] || colourMap.amber;
      akpsEl.innerHTML =
        '<strong style="font-family:Merriweather,serif; font-size:1.6rem; color:var(--navy);">'
        + window.akpsConfirmedScore + '</strong>'
        + '&nbsp;&nbsp;'
        + '<span style="display:inline-block; padding:4px 12px; border-radius:20px; font-size:.75rem; font-weight:700; background:' + c.bg + '; color:' + c.color + ';">'
        + window.akpsConfirmedLabel + '</span>'
        + '<div style="font-size:.78rem; color:#5a6a82; margin-top:5px;">' + window.akpsConfirmedSub + '</div>';
    } else {
      akpsEl.textContent = 'AKPS not scored.';
    }
  }

  // Page 9 activity
  var bobQ1El    = document.getElementById('bob3-q1-input');
  var exportBobQ1 = document.getElementById('export-bob-questions');
  if (exportBobQ1) {
    exportBobQ1.textContent = (bobQ1El && bobQ1El.value.trim()) ? bobQ1El.value.trim() : 'No response recorded.';
  }

  // MCQ score
  var mcqEl = document.getElementById('export-mcq-score');
  if (mcqEl) {
    if (window._mcqFinalScore) {
      var parts  = window._mcqFinalScore.split('/');
      var pct    = (parts.length === 2) ? Math.round((parseInt(parts[0]) / parseInt(parts[1])) * 100) + '%' : '';
      mcqEl.innerHTML =
        '<strong style="color:var(--navy);">Score: ' + window._mcqFinalScore.trim() + (pct ? ' (' + pct + ')' : '') + '</strong>'
        + '&nbsp;&nbsp;<span style="font-weight:700; color:' + (window._mcqFinalPassed ? '#059669' : '#dc2626') + ';">'
        + (window._mcqFinalPassed ? '✓ Pass' : '✗ Did not meet 80% pass mark') + '</span>';
    } else {
      mcqEl.textContent = 'Assessment not yet completed.';
    }
  }

  // Page 11 Activity 1 — signs of deterioration
  var q1  = document.getElementById('bob4-q1-input');
  var ex1 = document.getElementById('export-bob4-q1');
  if (ex1) ex1.textContent = (q1 && q1.value.trim()) ? q1.value.trim() : 'No response recorded.';

  // Page 11 Activity 2 — care plan
  var q2  = document.getElementById('bob4-q2-input');
  var ex2 = document.getElementById('export-bob4-q2');
  if (ex2) ex2.textContent = (q2 && q2.value.trim()) ? q2.value.trim() : 'No response recorded.';
}

/* ── Export learning record as PDF via browser print ── */
function exportLearningRecord() {
  window.print();
}

/* ── Module finish overlay ── */
function finish() {
  var overlay = document.getElementById('finish-overlay');
  if (overlay) overlay.classList.add('show');
}
