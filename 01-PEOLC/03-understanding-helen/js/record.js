/* ══════════════════════════════════════════════════════════
   js/record.js  ·  Learning record population & branded PDF export
══════════════════════════════════════════════════════════ */

function populateLearningRecord() {
  const dateEl = document.getElementById('rec-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Video
  const watched = !!window._introVideoWatched;
  setBadge('rec-video-badge', watched ? 'Watched' : 'Not yet', watched ? 'badge-pass' : '');
  const vs = document.getElementById('rec-video-status');
  if (vs) vs.textContent = watched ? 'Watched in full' : 'Not yet watched';

  // Scenario
  const sa = window._scenarioAnswers || {};
  const s1 = document.getElementById('rec-scenario-1');
  const s2 = document.getElementById('rec-scenario-2');
  if (s1) s1.innerHTML = sa[1] ? qualityChip(sa[1].quality) + ' ' + escapeHtml(sa[1].text) : '—';
  if (s2) s2.innerHTML = sa[2] ? qualityChip(sa[2].quality) + ' ' + escapeHtml(sa[2].text) : '—';
  const scenarioDone = sa[1] && sa[2];
  const scenarioBest = sa[1] && sa[1].quality === 'best' && sa[2] && sa[2].quality === 'best';
  setBadge('rec-scenario-badge',
    scenarioDone ? (scenarioBest ? 'Best response' : 'Completed') : '—',
    scenarioDone ? 'badge-pass' : '');

  // Hotspots
  const hsFound = window._hotspotsFound ? window._hotspotsFound.size : 0;
  const hsScore = document.getElementById('rec-hotspot-score');
  if (hsScore) hsScore.textContent = hsFound + ' / 4 identified';
  setBadge('rec-hotspot-badge', hsFound === 4 ? 'All found' : hsFound > 0 ? 'Partial' : '—', hsFound === 4 ? 'badge-pass' : hsFound > 0 ? 'badge-done' : '');

  // Pillars
  const pFound = window._pillarsExplored ? window._pillarsExplored.size : 0;
  const pScore = document.getElementById('rec-pillars-score');
  if (pScore) pScore.textContent = pFound + ' / 4 explored';
  setBadge('rec-pillars-badge', pFound === 4 ? 'All explored' : pFound > 0 ? 'Partial' : '—', pFound === 4 ? 'badge-pass' : pFound > 0 ? 'badge-done' : '');

  // Quiz
  const qScore  = document.getElementById('rec-quiz-score');
  const qResult = document.getElementById('rec-quiz-result');
  if (qScore)  qScore.textContent  = window._quizScoreText || '—';
  if (qResult) qResult.innerHTML   = window._quizPassed === true
    ? '<span style="color:#059669;font-weight:600;">PASS</span>'
    : window._quizPassed === false
    ? '<span style="color:#dc2626;font-weight:600;">NOT YET PASSED</span>'
    : '—';
  setBadge('rec-quiz-badge',
    window._quizPassed === true ? 'Pass' : window._quizPassed === false ? 'Not Passed' : '—',
    window._quizPassed === true ? 'badge-pass' : window._quizPassed === false ? 'badge-fail' : '');
}

function setBadge(id, text, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'record-badge ' + (cls || '');
}

function qualityChip(quality) {
  if (quality === 'best')    return '<span style="color:#059669;font-weight:600;">✓ Best response —</span>';
  if (quality === 'neutral') return '<span style="color:#d97706;font-weight:600;">△ Acceptable —</span>';
  return '<span style="color:#dc2626;font-weight:600;">✕ Needed work —</span>';
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/* ── Branded PDF export ──────────────────────────────────
   Uses the vendored jsPDF UMD build (js/vendor/jspdf.umd.min.js)
   — no external CDN dependency, so this works offline / inside
   a restricted LMS iframe. The logo is drawn from images/logo.png. */
function exportLearningRecordPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 0;

  const navy = [34, 65, 126];
  const yellow = [253, 202, 15];
  const muted = [90, 106, 130];
  const dark = [26, 46, 74];

  // ── Header band ──────────────────────────────────────
  doc.setFillColor(...navy);
  doc.rect(0, 0, pageWidth, 92, 'F');
  doc.setFillColor(...yellow);
  doc.rect(0, 92, pageWidth, 4, 'F');

  const finishHeaderAndBody = () => {
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
    doc.save('learning-record-understanding-helen.pdf');
  };

  // Try to embed the real logo; fall back to a text wordmark if it can't load
  const img = new Image();
  img.onload = () => {
    try {
      const h = 34;
      const w = (img.width / img.height) * h;
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
    doc.setTextColor(...navy);
    doc.text(title, margin, y);
    doc.setDrawColor(...yellow);
    doc.setLineWidth(1.5);
    doc.line(margin, y + 6, margin + 60, y + 6);
    y += 24;
  }

  function row(label, value) {
    checkPageBreak(20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...muted);
    doc.text(label, margin, y);
    doc.setTextColor(...dark);
    doc.setFont('helvetica', 'bold');
    const lines = doc.splitTextToSize(String(value), pageWidth - margin * 2 - 170);
    doc.text(lines, margin + 170, y);
    y += Math.max(16, lines.length * 13);
  }

  function paragraph(text) {
    checkPageBreak(16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...dark);
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 13 + 10;
  }

  function checkPageBreak(need) {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + need > pageHeight - 60) {
      doc.addPage();
      y = 48;
    }
  }

  function renderBody() {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    sectionTitle('Module Details');
    row('Module', 'Understanding Helen');
    row('Series', 'Palliative & End of Life Care · Module 3');
    row('Organisation', 'St Barnabas Hospice');
    row('Date', dateStr);
    y += 6;

    sectionTitle("Helen's Introduction Video");
    row('Status', window._introVideoWatched ? 'Watched in full' : 'Not yet watched');
    y += 6;

    sectionTitle('The First Visit — Branching Scenario');
    const sa = window._scenarioAnswers || {};
    row('Beat 1 (response to Simon)', sa[1] ? qualityLabel(sa[1].quality) + ' — ' + sa[1].text : 'Not attempted');
    row('Beat 2 (response about Sophie)', sa[2] ? qualityLabel(sa[2].quality) + ' — ' + sa[2].text : 'Not attempted');
    y += 6;

    sectionTitle("Helen's Living Room — Home Safety Assessment");
    const hsFound = window._hotspotsFound ? window._hotspotsFound.size : 0;
    row('Risks identified', hsFound + ' / 4');
    y += 6;

    sectionTitle('Four Pillars of Holistic Wellbeing');
    const pFound = window._pillarsExplored ? window._pillarsExplored.size : 0;
    row('Pillars explored', pFound + ' / 4');
    y += 6;

    sectionTitle('Check Your Understanding — Knowledge Check');
    row('Score', window._quizScoreText || 'Not attempted');
    row('Result', window._quizPassed === true ? 'PASS' : window._quizPassed === false ? 'NOT YET PASSED' : '—');
    const qa = window._quizAnswers || [];
    if (qa.length) {
      y += 4;
      qa.forEach((a, i) => {
        if (!a) return;
        paragraph((i + 1) + '. ' + a.prompt + '\n   Your answer: ' + a.chosen + (a.correct ? '  [Correct]' : '  [Incorrect]'));
      });
    }
    y += 6;

    sectionTitle('Additional Notes');
    const notes = (document.getElementById('rec-notes') || {}).value || '';
    paragraph(notes || 'None recorded.');

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      doc.text('Generated by St Barnabas Hospice E-Learning Platform', margin, pageHeight - 30);
      doc.text('Page ' + i + ' of ' + pageCount, pageWidth - margin - 60, pageHeight - 30);
    }
  }

  function qualityLabel(q) {
    if (q === 'best') return 'Best response';
    if (q === 'neutral') return 'Acceptable';
    return 'Needed work';
  }
}

function finishModule() {
  if (typeof XAPI !== 'undefined') {
    XAPI.setCompletion('', 'Understanding Helen', {
      success: (window._quizPassed !== false),
    });
    XAPI.finish();
  }
  const overlay = document.getElementById('finish-overlay');
  if (overlay) overlay.classList.add('show');
}

function closeOrRedirect() {
  try { window.close(); } catch (e) {}
  const overlay = document.getElementById('finish-overlay');
  if (overlay) overlay.classList.remove('show');
}
