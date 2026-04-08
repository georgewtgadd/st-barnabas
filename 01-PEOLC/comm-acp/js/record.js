/* ══════════════════════════════════════════════════════════
   js/record.js  ·  Learning record population & PDF export
   PDF generated client-side via jsPDF (loaded in index.html)
══════════════════════════════════════════════════════════ */

function populateLearningRecord() {
  const now = new Date();

  // Date & time
  const dateEl = document.getElementById('rec-date');
  const timeEl = document.getElementById('rec-time');
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  // ── Communication ───────────────────────────────────────
  const commR     = window._commResult;
  const commBadge = document.getElementById('rec-comm-badge');
  const commScore = document.getElementById('rec-comm-score');
  if (commScore) commScore.textContent = commR === 'correct'
    ? 'Correct — all three effective actions identified (B, C, E) ✓'
    : commR === 'incorrect' ? 'Attempted — incorrect selection made'
    : 'Not attempted';
  if (commBadge) {
    commBadge.textContent = commR === 'correct' ? 'Completed' : commR ? 'Attempted' : '—';
    commBadge.className   = 'record-badge ' + (commR === 'correct' ? 'badge-pass' : commR ? 'badge-done' : '');
  }

  // ── Flashcards ──────────────────────────────────────────
  const flashR     = window._flashcardsResult;
  const flashBadge = document.getElementById('rec-flash-badge');
  const flashScore = document.getElementById('rec-flash-score');
  if (flashScore) flashScore.textContent = flashR === 'completed'
    ? 'All five MCA principles explored ✓'
    : 'Not all cards explored';
  if (flashBadge) {
    flashBadge.textContent = flashR === 'completed' ? 'Completed' : '—';
    flashBadge.className   = 'record-badge ' + (flashR === 'completed' ? 'badge-pass' : '');
  }

  // ── Capacity ordering ───────────────────────────────────
  const capR     = window._capResult;
  const capBadge = document.getElementById('rec-cap-badge');
  const capScore = document.getElementById('rec-cap-score');
  if (capScore) capScore.textContent = capR === 'correct'
    ? 'Correct sequence identified: Understand → Retain → Weigh Up → Communicate ✓'
    : capR === 'incorrect' ? 'Attempted — sequence not correct on final attempt'
    : 'Not attempted';
  if (capBadge) {
    capBadge.textContent = capR === 'correct' ? 'Correct' : capR ? 'Attempted' : '—';
    capBadge.className   = 'record-badge ' + (capR === 'correct' ? 'badge-pass' : capR ? 'badge-done' : '');
  }

  // ── Scenario ────────────────────────────────────────────
  const scenR     = window._scenarioResult;
  const choices   = window._scenarioChoices  || {};
  const attempts  = window._scenarioAttempts || {};
  const scenBadge = document.getElementById('rec-scen-badge');
  const scenScore = document.getElementById('rec-scen-score');

  const stageLabels = { A: 'Option A (incorrect approach)', B: 'Option B (correct approach)' };
  const attemptText = n => {
    const a = attempts[n] || 0;
    const c = choices[n];
    if (!c) return '—';
    const attempt_str = a === 1 ? 'first attempt' : a + ' attempts';
    return stageLabels[c] + ' — correct on ' + attempt_str;
  };

  ['s1','s2','s3'].forEach((id, i) => {
    const el = document.getElementById('rec-scen-' + id);
    if (el) el.textContent = attemptText(i + 1);
  });

  if (scenScore) scenScore.textContent = scenR === 'completed'
    ? 'All three stages completed successfully ✓'
    : 'Not completed';
  if (scenBadge) {
    scenBadge.textContent = scenR === 'completed' ? 'Completed' : '—';
    scenBadge.className   = 'record-badge ' + (scenR === 'completed' ? 'badge-pass' : '');
  }

  // ── Quiz ────────────────────────────────────────────────
  const qScore  = document.getElementById('rec-quiz-score');
  const qResult = document.getElementById('rec-quiz-result');
  const qBadge  = document.getElementById('rec-quiz-badge');
  if (qScore)  qScore.textContent  = window._quizScoreText || '—';
  if (qResult) qResult.innerHTML   = window._quizPassed === true
    ? '<span style="color:#059669;font-weight:600;">PASS</span>'
    : window._quizPassed === false
    ? '<span style="color:#dc2626;font-weight:600;">NOT YET PASSED</span>'
    : '—';
  if (qBadge) {
    qBadge.textContent = window._quizPassed === true ? 'Pass' : window._quizPassed === false ? 'Not Passed' : '—';
    qBadge.className   = 'record-badge ' + (window._quizPassed === true ? 'badge-pass' : window._quizPassed === false ? 'badge-fail' : '');
  }
}

/* ══ PDF EXPORT ══════════════════════════════════════════ */
function exportLearningRecord() {
  if (typeof window.jspdf === 'undefined' && typeof jspdf === 'undefined') {
    alert('PDF library is still loading — please try again in a moment.');
    return;
  }

  const { jsPDF } = window.jspdf || jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const now  = new Date();
  const W    = 210;
  const MARGIN = 18;
  const COL  = W - MARGIN * 2;
  let y      = 0;

  /* ── Helpers ── */
  function checkPage(needed) {
    if (y + needed > 275) {
      doc.addPage();
      y = 18;
    }
  }

  function heading1(text) {
    checkPage(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(34, 65, 126);
    doc.text(text, MARGIN, y);
    y += 8;
    doc.setDrawColor(34, 65, 126);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, W - MARGIN, y);
    y += 6;
  }

  function heading2(text, r, g, b) {
    checkPage(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(r || 34, g || 65, b || 126);
    doc.text(text, MARGIN, y);
    y += 5;
    doc.setDrawColor(r || 34, g || 65, b || 126);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, y, W - MARGIN, y);
    y += 4;
  }

  function row(label, value, valueColor) {
    checkPage(8);
    const labelW = 62;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(90, 106, 130);
    doc.text(label, MARGIN, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(valueColor ? valueColor[0] : 26, valueColor ? valueColor[1] : 46, valueColor ? valueColor[2] : 74);

    const lines = doc.splitTextToSize(value || '—', COL - labelW);
    doc.text(lines, MARGIN + labelW, y);
    y += Math.max(6, lines.length * 4.5);
  }

  function outcomeItem(text) {
    checkPage(7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(5, 100, 70);
    doc.text('✓', MARGIN + 1, y);
    doc.setTextColor(26, 46, 74);
    const lines = doc.splitTextToSize(text, COL - 10);
    doc.text(lines, MARGIN + 8, y);
    y += Math.max(6, lines.length * 4.5);
  }

  function textArea(label, value) {
    if (!value) return;
    checkPage(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(90, 106, 130);
    doc.text(label, MARGIN, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(26, 46, 74);
    const lines = doc.splitTextToSize(value, COL);
    doc.text(lines, MARGIN, y);
    y += lines.length * 4.5 + 3;
  }

  function spacer(h) { y += h || 4; }
  function badge(text, passed) {
    const col = passed ? [5, 100, 70] : [180, 50, 50];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...col);
    return text;
  }

  /* ══ Page 1 — Header ══ */
  // Blue header band
  doc.setFillColor(34, 65, 126);
  doc.rect(0, 0, W, 36, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('Learning Record', MARGIN, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(197, 211, 232);
  doc.text('Communication & Advance Care Planning', MARGIN, 24);
  doc.text('Palliative Care Fundamentals · Module 5', MARGIN, 30);

  // Yellow accent line
  doc.setFillColor(253, 202, 15);
  doc.rect(0, 36, W, 2, 'F');

  y = 48;

  /* ── Module details ── */
  heading1('Module Details');
  row('Module title', 'Communication & Advance Care Planning');
  row('Series', 'Palliative Care Fundamentals · Module 5');
  row('Provider', 'St Barnabas Hospice');
  row('Date completed', (document.getElementById('rec-date') || {}).textContent || now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
  row('Time completed', (document.getElementById('rec-time') || {}).textContent || now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
  spacer(6);

  /* ── Learning outcomes ── */
  heading1('Learning Outcomes Addressed');
  outcomeItem('Critique communication styles using Mehrabian\'s 7-38-55 Rule to improve sensitive conversations');
  outcomeItem('Execute a mental capacity assessment in line with the Mental Capacity Act (2005)');
  outcomeItem('Distinguish between an ADRT and a ReSPECT form and their respective legal statuses');
  outcomeItem('Apply a Best Interests decision-making process within a challenging clinical scenario');
  outcomeItem('Formulate clear clinical recommendations using ACP tools for a specific case study');
  spacer(6);

  /* ── Activities ── */
  heading1('Activities & Performance');

  heading2('Activity 1 — Communication in Practice (7-38-55 Rule)');
  row('Task', 'Select the three most effective communication actions in a sensitive clinical scenario');
  row('Correct answers', 'B (Environmental barrier removed), C (Body Language — seated at eye level), E (Physical comfort checked)');
  row('Result', (document.getElementById('rec-comm-score') || {}).textContent || '—');
  spacer(5);

  heading2('Activity 2 — MCA Five Principles (Flashcards)');
  row('Task', 'Explore all five statutory principles of the Mental Capacity Act (2005) via interactive flashcards');
  row('Principles covered', 'Presumption of Capacity · Support to Decide · Unwise Decisions · Best Interests · Least Restrictive');
  row('Result', (document.getElementById('rec-flash-score') || {}).textContent || '—');
  spacer(5);

  heading2('Activity 3 — Capacity Assessment Ordering');
  row('Task', 'Arrange the four functional elements of Stage 2 of the MCA capacity test in the correct sequence');
  row('Correct order', 'Understand → Retain → Weigh Up → Communicate');
  row('Result', (document.getElementById('rec-cap-score') || {}).textContent || '—');
  spacer(5);

  heading2('Activity 4 — Best Interests Scenario (Arthur, 84)');
  row('Clinical context', 'Arthur, 84, advanced dementia — PEG feeding tube decision; no LPA or ADRT in place');
  row('Stage 1 — The Opening', (document.getElementById('rec-scen-s1') || {}).textContent || '—');
  row('Stage 2 — Navigating Conflict', (document.getElementById('rec-scen-s2') || {}).textContent || '—');
  row('Stage 3 — The Recommendation', (document.getElementById('rec-scen-s3') || {}).textContent || '—');
  row('Overall result', (document.getElementById('rec-scen-score') || {}).textContent || '—');
  spacer(5);

  heading2('Knowledge Check — Five-Question MCQ');
  row('Topics assessed', 'MCA principles · Mehrabian\'s Rule · ADRT · Next of Kin · Best Interests (Section 4 MCA)');
  row('Pass mark', '80% (4 out of 5 correct)');
  row('Score', window._quizScoreText || '—');
  const passed = window._quizPassed;
  row('Result', passed === true ? 'PASS' : passed === false ? 'NOT YET PASSED' : '—',
      passed === true ? [5, 100, 70] : passed === false ? [180, 50, 50] : null);
  spacer(8);

  /* ── Reflection ── */
  heading1('Personal Reflection & Actions');
  const reflection = (document.getElementById('rec-reflection') || {}).value || '';
  const action     = (document.getElementById('rec-action')     || {}).value || '';
  const notes      = (document.getElementById('rec-notes')      || {}).value || '';
  textArea('What will you do differently in practice?', reflection || 'No response recorded.');
  textArea('Specific action or learning need identified:', action || 'No response recorded.');
  textArea('Additional notes:', notes || 'None.');
  spacer(6);

  /* ── Supervisor ── */
  heading1('Supervisor / Line Manager Sign-Off');
  row('Name',  (document.getElementById('rec-supervisor-name') || {}).value || '');
  row('Role',  (document.getElementById('rec-supervisor-role') || {}).value || '');
  row('Date reviewed', (document.getElementById('rec-supervisor-date') || {}).value || '');
  spacer(8);

  // Signature lines
  checkPage(28);
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y + 12, MARGIN + 75, y + 12);
  doc.line(MARGIN + 90, y + 12, MARGIN + 165, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Learner signature', MARGIN, y + 17);
  doc.text('Supervisor signature', MARGIN + 90, y + 17);
  y += 22;

  /* ── Footer on each page ── */
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(244, 247, 252);
    doc.rect(0, 284, W, 13, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(130, 140, 160);
    doc.text('St Barnabas Hospice · Palliative Care Fundamentals · Module 5', MARGIN, 291);
    doc.text('Page ' + p + ' of ' + totalPages, W - MARGIN, 291, { align: 'right' });
    doc.text('Generated: ' + now.toLocaleDateString('en-GB'), W / 2, 291, { align: 'center' });
  }

  doc.save('learning-record-cacp-module5.pdf');
}

/* ══ FINISH ══════════════════════════════════════════════ */
function finishModule() {
  if (typeof SCORM !== 'undefined') {
    SCORM.setCompletion('completed');
    SCORM.finish();
  }
  const overlay = document.getElementById('finish-overlay');
  if (overlay) overlay.classList.add('show');
}

function closeOrRedirect() {
  try { window.close(); } catch (e) {}
  const overlay = document.getElementById('finish-overlay');
  if (overlay) overlay.classList.remove('show');
}
