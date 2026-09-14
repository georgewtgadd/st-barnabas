/* ══════════════════════════════════════════════════════════
   js/record.js  ·  Learning record population & branded PDF export
══════════════════════════════════════════════════════════ */

function populateLearningRecord() {
  var dateEl = document.getElementById('export-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // AKPS
  var akpsEl = document.getElementById('export-akps-score');
  var akpsBadge = document.getElementById('rec-akps-badge');
  if (akpsEl) {
    if (window.akpsConfirmedScore !== null && window.akpsConfirmedScore !== undefined) {
      akpsEl.textContent = window.akpsConfirmedScore + ' — ' + window.akpsConfirmedLabel + ' (' + window.akpsConfirmedSub + ')';
      setBadge('rec-akps-badge', 'Scored', 'badge-pass');
    } else {
      akpsEl.textContent = 'Not scored.';
      setBadge('rec-akps-badge', '—', '');
    }
  }

  // Bob's visit — questions
  fillReflection('bob3-q1-input', 'export-bob-questions');

  // MCQ
  var mcqEl = document.getElementById('export-mcq-score');
  if (mcqEl) {
    if (window._mcqFinalScore) {
      var pct = (window._mcqTotal) ? Math.round((window._mcqRaw / window._mcqTotal) * 100) + '%' : '';
      mcqEl.textContent = window._mcqFinalScore.trim() + (pct ? ' (' + pct + ')' : '') + ' — ' + (window._mcqFinalPassed ? 'Pass' : 'Did not meet 80% pass mark');
      setBadge('rec-mcq-badge', window._mcqFinalPassed ? 'Pass' : 'Not Passed', window._mcqFinalPassed ? 'badge-pass' : 'badge-fail');
    } else {
      mcqEl.textContent = 'Assessment not yet completed.';
      setBadge('rec-mcq-badge', '—', '');
    }
  }

  // Page 11 activities
  fillReflection('bob4-q1-input', 'export-bob4-q1');
  fillReflection('bob4-q2-input', 'export-bob4-q2');
}

function fillReflection(inputId, targetId) {
  var input = document.getElementById(inputId);
  var target = document.getElementById(targetId);
  if (!target) return;
  var val = (input && input.value.trim()) ? input.value.trim() : '';
  target.textContent = val || 'No response recorded.';
  target.className = 'record-reflection-text' + (val ? '' : ' empty');
}

function setBadge(id, text, cls) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'record-badge ' + (cls || '');
}

/* ── Branded PDF export ──────────────────────────────────
   Uses the vendored jsPDF UMD build (js/vendor/jspdf.umd.min.js)
   — no external CDN dependency. Logo drawn from images/logo.png. */
function exportLearningRecordPDF() {
  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF({ unit: 'pt', format: 'a4' });
  var pageWidth = doc.internal.pageSize.getWidth();
  var margin = 48;
  var y = 0;

  var navy = [34, 65, 126];
  var yellow = [253, 202, 15];
  var muted = [90, 106, 130];
  var dark = [26, 46, 74];

  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.rect(0, 0, pageWidth, 92, 'F');
  doc.setFillColor(yellow[0], yellow[1], yellow[2]);
  doc.rect(0, 92, pageWidth, 4, 'F');

  function finishHeaderAndBody() {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Learning Record', margin, 44);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('St Barnabas Hospice — CPD Portfolio', margin, 62);

    y = 128;
    renderBody();
    doc.save('learning-record-deterioration-recognition.pdf');
  }

  var img = new Image();
  img.onload = function () {
    try {
      var h = 34;
      var w = (img.width / img.height) * h;
      doc.addImage(img, 'PNG', pageWidth - margin - w, 20, w, h);
    } catch (e) { /* ignore */ }
    finishHeaderAndBody();
  };
  img.onerror = finishHeaderAndBody;
  img.src = 'images/logo.png';

  function sectionTitle(title) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.text(title, margin, y);
    doc.setDrawColor(yellow[0], yellow[1], yellow[2]);
    doc.setLineWidth(1.5);
    doc.line(margin, y + 6, margin + 60, y + 6);
    y += 24;
  }

  function row(label, value) {
    checkPageBreak(20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(muted[0], muted[1], muted[2]);
    doc.text(label, margin, y);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.setFont('helvetica', 'bold');
    var lines = doc.splitTextToSize(String(value), pageWidth - margin * 2 - 170);
    doc.text(lines, margin + 170, y);
    y += Math.max(16, lines.length * 13);
  }

  function paragraph(text) {
    checkPageBreak(16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    var lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 13 + 10;
  }

  function checkPageBreak(need) {
    var pageHeight = doc.internal.pageSize.getHeight();
    if (y + need > pageHeight - 60) {
      doc.addPage();
      y = 48;
    }
  }

  function renderBody() {
    var dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    sectionTitle('Module Details');
    row('Module', 'Deterioration & Recognition');
    row('Series', 'Palliative & End of Life Care · Module 2');
    row('Organisation', 'St Barnabas Hospice');
    row('Date', dateStr);
    y += 6;

    sectionTitle("Bob's Visit — AKPS Score");
    row('Score', (window.akpsConfirmedScore !== null && window.akpsConfirmedScore !== undefined)
      ? window.akpsConfirmedScore + ' — ' + window.akpsConfirmedLabel
      : 'Not scored');
    y += 6;

    sectionTitle("Bob's Visit — Questions You Would Ask");
    var q0 = document.getElementById('bob3-q1-input');
    paragraph((q0 && q0.value.trim()) ? q0.value.trim() : 'No response recorded.');

    sectionTitle('Case Study Assessment — What Would You Do?');
    row('Score', window._mcqFinalScore ? window._mcqFinalScore.trim() : 'Not attempted');
    row('Result', window._mcqFinalScore ? (window._mcqFinalPassed ? 'PASS' : 'NOT YET PASSED') : '—');
    y += 6;

    sectionTitle('Signs of Deterioration You Identified in Bob');
    var q1 = document.getElementById('bob4-q1-input');
    paragraph((q1 && q1.value.trim()) ? q1.value.trim() : 'No response recorded.');

    sectionTitle('Your Care Plan for Bob');
    var q2 = document.getElementById('bob4-q2-input');
    paragraph((q2 && q2.value.trim()) ? q2.value.trim() : 'No response recorded.');

    sectionTitle('Additional Reflections');
    var notes = document.getElementById('export-extra-notes');
    paragraph((notes && notes.value.trim()) ? notes.value.trim() : 'None recorded.');

    var pageCount = doc.internal.getNumberOfPages();
    for (var i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      var pageHeight = doc.internal.pageSize.getHeight();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(muted[0], muted[1], muted[2]);
      doc.text('Generated by St Barnabas Hospice E-Learning Platform', margin, pageHeight - 30);
      doc.text('Page ' + i + ' of ' + pageCount, pageWidth - margin - 60, pageHeight - 30);
    }
  }
}

function finishModule() {
  if (typeof XAPI !== 'undefined') {
    XAPI.setCompletion('', 'Deterioration & Recognition', {
      success: (window._mcqFinalPassed !== false),
    });
    XAPI.finish();
  }
  var overlay = document.getElementById('finish-overlay');
  if (overlay) overlay.classList.add('show');
}

function closeOrRedirect() {
  try { window.close(); } catch (e) {}
  var overlay = document.getElementById('finish-overlay');
  if (overlay) overlay.classList.remove('show');
}
