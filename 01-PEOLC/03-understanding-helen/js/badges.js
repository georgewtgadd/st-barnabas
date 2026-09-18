/* ══════════════════════════════════════════════════════════
   js/badges.js — Module completion badge

   A single badge, earned when the learner deliberately finishes
   the module (clicks "Finish Module" on the record page) — not
   just by navigating to the last page. To port to another module
   in the series, only OVERALL_BADGE's title/description/check
   need changing; rendering and PDF drawing are generic.

   Drawn as a vector icon (not emoji) so it reproduces cleanly in
   the PDF export without jsPDF's standard-font glyph issues.
══════════════════════════════════════════════════════════ */

const OVERALL_BADGE = {
  id: 'complete',
  title: 'Module Complete',
  description: 'Completed Understanding Helen from start to finish',
  check: () => window._moduleFinished === true,
};

function getOverallBadge() {
  return { ...OVERALL_BADGE, earned: !!OVERALL_BADGE.check() };
}

/* ── On-screen badge ──────────────────────────────────────── */
function renderBadgeCase(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const overall = getOverallBadge();

  el.innerHTML = `
    <div class="badge-overall ${overall.earned ? 'earned' : 'locked'}">
      <div class="badge-overall-icon" aria-hidden="true">
        ${overall.earned
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="7"/><path d="M8.3 9.3l2 2 5-5"/><path d="M8.7 15.2l-1.7 5.8 5-2.3 5 2.3-1.7-5.8"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="7"/><path d="M8.7 15.2l-1.7 5.8 5-2.3 5 2.3-1.7-5.8"/></svg>'}
      </div>
      <div>
        <div class="badge-overall-title">${overall.title}</div>
        <div class="badge-overall-desc">${overall.earned ? overall.description : 'Finish the module to earn this'}</div>
      </div>
    </div>
  `;
}

/* ── PDF badge line — drawn with jsPDF vector primitives, no
   emoji/unicode symbols, so nothing corrupts in the export. ── */
function drawBadgesInPdf(doc, x, y, navy, muted) {
  const overall = getOverallBadge();
  const yellow = [217, 119, 6];

  if (overall.earned) {
    doc.setDrawColor(...yellow);
    doc.setLineWidth(1.2);
    doc.circle(x + 5, y - 3, 5, 'S');
    doc.setLineWidth(0.9);
    doc.line(x + 2.5, y - 3, x + 4.3, y - 1.1);
    doc.line(x + 4.3, y - 1.1, x + 7.7, y - 6.2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...yellow);
    doc.text(overall.title + ' — earned', x + 16, y);
  } else {
    doc.setDrawColor(...muted);
    doc.setLineWidth(0.6);
    doc.circle(x + 5, y - 3, 5, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...muted);
    doc.text(overall.title + ' — not yet earned', x + 16, y);
  }
  y += 18;

  return y;
}
