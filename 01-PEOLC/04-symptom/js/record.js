/* ══════════════════════════════════════════════════════════
   js/record.js  ·  Learning record — page 11
══════════════════════════════════════════════════════════ */

function populateLearningRecord() {
  /* Date */
  const dateEl = document.getElementById('rec-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  /* ── Page 2 — DnD ─────────────────────────────── */
  const dndScore = document.getElementById('rec-dnd-score');
  const dndBadge = document.getElementById('rec-dnd-badge');
  const dndRes   = window._dndResult;
  if (dndScore) dndScore.textContent = dndRes || 'Not completed';
  if (dndBadge) {
    dndBadge.textContent = dndRes && dndRes.includes('6 / 6') ? 'All Correct' : dndRes ? 'Completed' : '—';
    dndBadge.className   = 'record-badge ' + (dndRes && dndRes.includes('6 / 6') ? 'badge-pass' : dndRes ? 'badge-done' : '');
  }

  /* ── Page 4 — Categorisation ──────────────────── */
  const catScore = document.getElementById('rec-cat-score');
  const catBadge = document.getElementById('rec-cat-badge');
  const catRes   = window._catResult;
  if (catScore) catScore.textContent = catRes || 'Not completed';
  if (catBadge) {
    const allCat = catRes && catRes.startsWith('6');
    catBadge.textContent = catRes ? catRes : '—';
    catBadge.className   = 'record-badge ' + (allCat ? 'badge-pass' : catRes ? 'badge-done' : '');
  }

  /* ── Page 5 — ABC ─────────────────────────────── */
  const abcScore = document.getElementById('rec-abc-score');
  const abcBadge = document.getElementById('rec-abc-badge');
  const abcRes   = window._abcResult;
  if (abcScore) abcScore.textContent = abcRes || 'Not completed';
  if (abcBadge) {
    abcBadge.textContent = abcRes ? (abcRes.includes('Correct') ? 'Correct' : 'Reviewed') : '—';
    abcBadge.className   = 'record-badge ' + (abcRes && abcRes.includes('Correct') ? 'badge-pass' : abcRes ? 'badge-done' : '');
  }

  /* ── Page 9 — Seizure sequence ────────────────── */
  const seqScore = document.getElementById('rec-seq-score');
  const seqBadge = document.getElementById('rec-seq-badge');
  const seqRes   = window._seqResult;
  if (seqScore) seqScore.textContent = seqRes || 'Not completed';
  if (seqBadge) {
    seqBadge.textContent = seqRes ? (seqRes.includes('Correct') ? 'Correct' : 'Reviewed') : '—';
    seqBadge.className   = 'record-badge ' + (seqRes && seqRes.includes('Correct') ? 'badge-pass' : seqRes ? 'badge-done' : '');
  }

  /* ── Page 10 — Case studies ───────────────────── */
  const casesScore = document.getElementById('rec-cases-score');
  const casesResult= document.getElementById('rec-cases-result');
  const casesBadge = document.getElementById('rec-cases-badge');
  if (casesScore)  casesScore.textContent  = window._casesScore  || '—';
  if (casesResult) {
    casesResult.innerHTML = window._casesPassed === true
      ? '<span style="color:#059669;font-weight:600;">PASS</span>'
      : window._casesPassed === false
      ? '<span style="color:#dc2626;font-weight:600;">NOT YET PASSED</span>'
      : '—';
  }
  if (casesBadge) {
    casesBadge.textContent = window._casesPassed === true ? 'Pass' : window._casesPassed === false ? 'Not Passed' : '—';
    casesBadge.className   = 'record-badge ' + (window._casesPassed === true ? 'badge-pass' : window._casesPassed === false ? 'badge-fail' : '');
  }

  /* Per-question breakdown */
  const breakdown = document.getElementById('rec-cases-breakdown');
  if (breakdown && typeof _casesAnswers !== 'undefined' && _casesAnswers.length) {
    breakdown.innerHTML = '';
    _casesAnswers.forEach((ans, i) => {
      if (!ans.answered) return;
      const q   = typeof _casesShuffled !== 'undefined' ? _casesShuffled[i] : casesData[i];
      const div = document.createElement('div');
      div.className = 'record-q-item ' + (ans.correct ? 'correct-q' : 'wrong-q');
      div.innerHTML = `<strong>Case ${i+1}: ${casesData[i].patient}</strong><br>
        <span style="color:${ans.correct ? '#059669' : '#dc2626'};font-weight:600;">${ans.correct ? '✓ Correct' : '✗ Incorrect'}</span>`;
      breakdown.appendChild(div);
    });
  }
}

/* ── EXPORT AS BRANDED PDF ────────────────────────────
   Uses the vendored jsPDF UMD build (js/vendor/jspdf.umd.min.js)
   — no external CDN dependency. Logo drawn from images/logo.png. */
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
    doc.save('learning-record-symptom-emergencies.pdf');
  };

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
    row('Module', 'Symptom Management & Emergencies');
    row('Series', 'Palliative & End of Life Care · Module 4');
    row('Organisation', 'St Barnabas Hospice');
    row('Date', dateStr);
    y += 6;

    sectionTitle('Respiratory — Intervention Matching');
    row('Result', window._dndResult || 'Not completed');
    y += 6;

    sectionTitle('Palliative Emergencies — Categorisation');
    row('Result', window._catResult || 'Not completed');
    y += 6;

    sectionTitle('Terminal Haemorrhage — ABC Sequence');
    row('Result', window._abcResult || 'Not completed');
    y += 6;

    sectionTitle('Seizures — Step Ordering');
    row('Result', window._seqResult || 'Not completed');
    y += 6;

    sectionTitle('Case Studies — MCQ Assessment');
    row('Score', window._casesScore || 'Not attempted');
    row('Result', window._casesPassed === true ? 'PASS' : window._casesPassed === false ? 'NOT YET PASSED' : '—');
    if (typeof _casesAnswers !== 'undefined' && _casesAnswers.length) {
      y += 4;
      _casesAnswers.forEach((ans, i) => {
        if (!ans.answered) return;
        paragraph('Case ' + (i + 1) + ' (' + casesData[i].patient + '): ' + (ans.correct ? '[Correct]' : '[Incorrect]'));
      });
    }
    y += 6;

    sectionTitle('Additional Notes');
    const notes = (document.getElementById('rec-notes') || {}).value || '';
    paragraph(notes || 'None recorded.');

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
}

/* ── FINISH MODULE ─────────────────────────────────── */
function finishModule() {
  if (typeof XAPI !== 'undefined') {
    XAPI.setCompletion('', 'Symptom Management & Emergencies', {
      success: (window._casesPassed !== false),
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
