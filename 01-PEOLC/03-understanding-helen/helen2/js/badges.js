/* ══════════════════════════════════════════════════════════
   js/badges.js — Micro-badge system

   Designed to be reusable across other modules in the series:
   each badge is a simple {id, title, description, icon, check}
   definition. To port to another module, replace BADGE_DEFS
   with that module's own list — everything else (rendering,
   PDF drawing) is generic and reads from BADGE_DEFS directly.

   Icons are drawn as small inline SVGs (not emoji) so they can
   also be reproduced as vector shapes in the PDF export without
   the font-encoding issues emoji cause in jsPDF's standard fonts.
══════════════════════════════════════════════════════════ */

const BADGE_DEFS = [
  {
    id: 'listener',
    title: 'Attentive Listener',
    description: "Watched Helen's introduction in full",
    check: () => window._introVideoWatched === true,
  },
  {
    id: 'judgement',
    title: 'Good Judgement',
    description: 'Chose the best response at every point in the first visit',
    check: () => {
      const sa = window._scenarioAnswers || {};
      return sa[1] && sa[1].quality === 'best' && sa[2] && sa[2].quality === 'best';
    },
  },
  {
    id: 'safety',
    title: 'Home Safety Expert',
    description: "Identified all 4 risks in Helen's living room",
    check: () => window._hotspotsFound && window._hotspotsFound.size === 4,
  },
  {
    id: 'holistic',
    title: 'Holistic Thinker',
    description: 'Explored all Four Pillars of Wellbeing',
    check: () => window._pillarsExplored && window._pillarsExplored.size === 4,
  },
  {
    id: 'noticed',
    title: 'Noticed Sophie',
    description: "Correctly spotted Sophie's signs of anticipatory grief",
    check: () => window._sophieNoticed === true,
  },
  {
    id: 'champion',
    title: 'Knowledge Champion',
    description: 'Passed the final knowledge check',
    check: () => window._quizPassed === true,
  },
];

function getEarnedBadges() {
  return BADGE_DEFS.map(b => ({ ...b, earned: !!b.check() }));
}

/* ── On-screen badge case ─────────────────────────────────── */
function renderBadgeCase(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const badges = getEarnedBadges();
  const earnedCount = badges.filter(b => b.earned).length;

  el.innerHTML = `
    <div class="badge-case-header">
      <span class="badge-case-count">${earnedCount} / ${badges.length} badges earned</span>
    </div>
    <div class="badge-grid">
      ${badges.map(b => `
        <div class="badge-tile ${b.earned ? 'earned' : 'locked'}" role="group" aria-label="${b.title} — ${b.earned ? 'earned' : 'not yet earned'}">
          <div class="badge-icon" aria-hidden="true">
            ${b.earned
              ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6.5"/><path d="M8.5 9.5l2 2 4.5-4.5"/><path d="M9 15l-1.5 5 4.5-2 4.5 2-1.5-5"/></svg>'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6.5"/><path d="M9 15l-1.5 5 4.5-2 4.5 2-1.5-5"/><circle cx="12" cy="9" r="2" fill="currentColor" stroke="none"/></svg>'}
          </div>
          <div class="badge-title">${b.title}</div>
          <div class="badge-desc">${b.description}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ── PDF badge row — drawn with jsPDF vector primitives, no
   emoji/unicode symbols, so nothing corrupts in the export. ── */
function drawBadgesInPdf(doc, x, y, navy, muted) {
  const badges = getEarnedBadges();
  const earnedCount = badges.filter(b => b.earned).length;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...navy);
  doc.text('Badges earned: ' + earnedCount + ' / ' + badges.length, x, y);
  y += 16;

  badges.forEach(b => {
    if (b.earned) {
      doc.setDrawColor(...navy);
      doc.setLineWidth(1);
      doc.circle(x + 4, y - 3, 4, 'S');
      doc.setLineWidth(0.8);
      doc.line(x + 2, y - 3, x + 3.5, y - 1.3);
      doc.line(x + 3.5, y - 1.3, x + 6.2, y - 5.2);
    } else {
      doc.setDrawColor(...muted);
      doc.setLineWidth(0.6);
      doc.circle(x + 4, y - 3, 4, 'S');
    }
    doc.setFont('helvetica', b.earned ? 'bold' : 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...(b.earned ? navy : muted));
    doc.text(b.title, x + 14, y);
    y += 14;
  });

  return y;
}
