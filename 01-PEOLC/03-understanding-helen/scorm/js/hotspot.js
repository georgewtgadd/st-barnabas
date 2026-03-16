/* ══════════════════════════════════════════════════════════
   hotspot.js — Hotspot activity: data, click, modal, unlock
══════════════════════════════════════════════════════════ */

const HS_TOTAL = 4;
const hsFound  = new Set();

const hsData = {
  1: {
    eyebrow: 'High Risk',
    eyebrowClass: 'tag-risk',
    title: '💊 Medication Storage',
    body: 'Multiple prescription bottles are visible on a low table within easy reach and without clear organisation. This raises immediate concerns around accidental overdose, confusion between medications, and missed doses. Unsecured medication is also a safeguarding concern if vulnerable visitors are present.',
    action: '<strong>Action:</strong> Discuss with GP or pharmacist. Consider a dosette/blister pack system and review secure storage options.'
  },
  2: {
    eyebrow: 'High Risk',
    eyebrowClass: 'tag-risk',
    title: '⚠️ Trip Hazard',
    body: 'Papers, envelopes and loose items are scattered across the table and floor area. Falls are the leading cause of injury in older adults, and a cluttered environment significantly increases risk — particularly for someone with reduced mobility or poor vision.',
    action: '<strong>Action:</strong> Clear walkways. Arrange a falls risk assessment and consider referral to occupational therapy.'
  },
  3: {
    eyebrow: 'Concern',
    eyebrowClass: 'tag-concern',
    title: '📺 Electrical Safety',
    body: 'An older CRT television is present. Older electrical appliances may not meet modern safety standards and can present fire risks, particularly if they overheat or have worn wiring.',
    action: '<strong>Action:</strong> Check for a working smoke alarm. Consider requesting a home fire safety visit from the local fire service.'
  },
  6: {
    eyebrow: 'Concern',
    eyebrowClass: 'tag-concern',
    title: '🧍 Social Isolation',
    body: 'The room has a dim, enclosed atmosphere and the television appears to be Helen\'s primary source of stimulation and company. Loneliness is a significant and often underrecognised health risk in older adults, linked to depression, cognitive decline, and poorer health outcomes.',
    action: '<strong>Action:</strong> Explore connections to community groups, befriending services, or regular welfare checks. Note in care plan.'
  }
};

function clickHotspot(id) {
  hsFound.add(id);

  // Mark the hotspot button as visited
  const btn = document.getElementById(`hs-${id}`);
  if (btn) {
    btn.classList.add('visited');
    btn.setAttribute('aria-label', 'Explored');
    const tooltip = btn.querySelector('.hs-tooltip');
    if (tooltip) tooltip.textContent = '✓ Explored';
    const svg = btn.querySelector('svg');
    if (svg) svg.innerHTML = '<polyline points="20 6 9 17 4 12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  // Light up the pill tracker
  const pill = document.getElementById(`pill-${id}`);
  if (pill) pill.classList.add('found');

  // Open the modal for this hotspot
  openHotspotModal(id);

  // Update lock message
  if (hsFound.size < HS_TOTAL) {
    const remaining = HS_TOTAL - hsFound.size;
    const lockText = document.getElementById('hs-lock-text');
    if (lockText) lockText.textContent = `${remaining} hotspot${remaining !== 1 ? 's' : ''} remaining`;
  }
}

function openHotspotModal(id) {
  const data = hsData[id];
  if (!data) return;

  document.getElementById('hs-modal-eyebrow').textContent = data.eyebrow;
  document.getElementById('hs-modal-eyebrow').className   = `hs-modal-tag ${data.eyebrowClass}`;
  document.getElementById('hs-modal-title').textContent   = data.title;
  document.getElementById('hs-modal-body').textContent    = data.body;
  document.getElementById('hs-modal-action').innerHTML    = data.action;

  const modal = document.getElementById('hs-modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeHotspotModal() {
  const modal = document.getElementById('hs-modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';

  // If all found, unlock continue after modal closes
  if (hsFound.size === HS_TOTAL) {
    unlockHotspotContinue();
  }
}

function unlockHotspotContinue() {
  const lockMsg = document.getElementById('hs-locked-msg');
  if (lockMsg) {
    lockMsg.innerHTML = '<span aria-hidden="true">✅</span><span>All 4 hotspots explored — you may now continue.</span>';
    lockMsg.style.color = '#6ee7b7';
  }
  const continueBtn = document.getElementById('hs-continue-btn');
  if (continueBtn) {
    continueBtn.disabled = false;
    continueBtn.style.opacity = '1';
    continueBtn.style.cursor = 'pointer';
    continueBtn.setAttribute('aria-label', 'Continue to next section');
    continueBtn.focus();
  }
}
