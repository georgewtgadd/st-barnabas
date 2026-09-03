/* ══════════════════════════════════════════════════════════
   pillars.js — Four Pillars: data, open/close modal, unlock
   Modal content is condensed and split into tabs (Complex
   Needs / Interventions / Outcomes) so only one list is on
   screen at a time, instead of three columns at once.
══════════════════════════════════════════════════════════ */

const PILLARS_TOTAL = 4;
const pillarsOpened = new Set();
let currentPillarId = null;
let currentPillarTab = 'needs';

const pillarData = {
  1: {
    icon: '🫁', tag: 'Pillar One', name: 'Physical',
    stripe: '#0197de', iconBg: 'rgba(1,151,222,0.14)', tagColor: '#7dd3fc',
    definition: 'A person\'s bodily health — symptoms, comfort, function and medical needs. In palliative care this means managing pain, breathlessness and fatigue to protect quality of life, not seeking a cure.',
    needs: ['Intractable symptoms', 'Pain management', 'Metastatic cord compression', 'Frailty'],
    interventions: ['Physiotherapy', 'Occupational therapy', 'Medical management', 'Specialist nursing care'],
    outcomes: ['Symptom optimisation', 'Advance Care Planning', 'Anticipatory prescribing', 'Lasting Power of Attorney (Health & Welfare)']
  },
  2: {
    icon: '🕊️', tag: 'Pillar Two', name: 'Psychological & Spiritual',
    stripe: '#7c6ef5', iconBg: 'rgba(124,110,245,0.14)', tagColor: '#c4b5fd',
    definition: 'A person\'s emotional and inner life. Psychological wellbeing covers coping with fear, grief and loss of independence; spiritual wellbeing — religious or not — covers meaning, purpose and peace.',
    needs: ['Depression or anxiety', 'Difficulty accepting diagnosis', 'Cognitive impairment', 'Family or relationship breakdown'],
    interventions: ['Spiritual care', 'Counselling & wellbeing team', 'Specialist nurses', 'Volunteers'],
    outcomes: ['Clarity on preferences and wishes', 'A sense of peace and purpose', 'Acceptance', 'Agreed focus of care']
  },
  3: {
    icon: '💷', tag: 'Pillar Three', name: 'Financial',
    stripe: '#fdca0f', iconBg: 'rgba(253,202,15,0.1)', tagColor: '#fde68a',
    definition: 'An often-overlooked pillar. Serious illness reduces income while raising costs — unresolved pressure causes stress and fuel poverty, and can undermine care at home.',
    needs: ['Risk of poverty, incl. funeral poverty', 'Need for a care package', 'Benefit eligibility', 'Home adaptations'],
    interventions: ['Welfare & benefits advisors', 'Social work', 'Continuing Health Care', 'Care coordination'],
    outcomes: ['Access to eligible benefits', 'CHC funding secured', 'Home adaptations arranged', 'Will & Lasting Power of Attorney (Finance)']
  },
  4: {
    icon: '👨‍👩‍👧', tag: 'Pillar Four', name: 'Family & Carer',
    stripe: '#2ecc8e', iconBg: 'rgba(46,204,142,0.12)', tagColor: '#6ee7b7',
    definition: 'No one lives in isolation. This covers connections to family, friends and community, plus the wellbeing of carers — one person\'s illness affects the whole family system.',
    needs: ['Carer burnout risk', 'Family trauma history', 'Complex communication needs', 'Pre/post-bereavement needs'],
    interventions: ['Wellbeing & counselling services', 'Specialist nursing care', 'Volunteers', 'Care coordination'],
    outcomes: ['Know who to contact in a crisis', 'Emergency care plan in place', 'Safeguarding concerns managed']
  }
};

const PILLAR_TABS = [
  { key: 'needs',         label: 'Complex Needs' },
  { key: 'interventions', label: 'Interventions' },
  { key: 'outcomes',      label: 'Outcomes' }
];

function openPillarModal(id) {
  const p = pillarData[id];
  pillarsOpened.add(id);
  currentPillarId = id;
  currentPillarTab = 'needs';

  document.getElementById('pm-stripe').style.background = p.stripe;
  const icon = document.getElementById('pm-icon');
  icon.style.background = p.iconBg;
  icon.textContent = p.icon;
  const tag = document.getElementById('pm-tag');
  tag.style.color = p.tagColor;
  tag.textContent = p.tag;
  document.getElementById('pm-name').textContent       = p.name;
  document.getElementById('pm-definition').textContent = p.definition;

  document.getElementById('pm-key-grid').innerHTML = `
    <div class="pillar-tabs" role="tablist" aria-label="${p.name} — details">
      ${PILLAR_TABS.map(t => `
        <button class="pillar-tab" role="tab" id="ptab-${t.key}"
                aria-selected="false" aria-controls="pillar-tab-panel"
                onclick="switchPillarTab('${t.key}')">${t.label}</button>
      `).join('')}
    </div>
    <div class="pillar-tab-panel" id="pillar-tab-panel" role="tabpanel"></div>
  `;
  renderPillarTabPanel();

  // Mark pillar as visited
  document.querySelectorAll('.pillar-col').forEach(el => el.classList.remove('active'));
  const col = document.getElementById('pc-' + id);
  if (col) {
    col.classList.add('active');
    col.classList.add('visited-pillar');
  }

  const modal = document.getElementById('pillar-modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();

  // Report to the LRS, if one is present (see js/xapi-wrapper.js)
  if (typeof xapiSendExperienced === 'function') {
    xapiSendExperienced('pillar/' + id, p.name + ' Pillar', p.definition);
  }

  // Update footer hint
  const remaining = PILLARS_TOTAL - pillarsOpened.size;
  const hint = document.getElementById('pm-hint');
  if (hint) {
    hint.textContent = remaining > 0
      ? remaining + ' pillar' + (remaining !== 1 ? 's' : '') + ' remaining — explore all before continuing.'
      : 'All pillars explored — you may now continue.';
  }
}

function switchPillarTab(key) {
  currentPillarTab = key;
  renderPillarTabPanel();
}

function renderPillarTabPanel() {
  const p = pillarData[currentPillarId];
  if (!p) return;

  PILLAR_TABS.forEach(t => {
    const btn = document.getElementById('ptab-' + t.key);
    if (!btn) return;
    const active = t.key === currentPillarTab;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  const panel = document.getElementById('pillar-tab-panel');
  const items = p[currentPillarTab] || [];
  if (panel) {
    panel.innerHTML = items.map(a => `
      <div class="pillar-key-item"><div class="pillar-key-dot" style="background:${p.stripe}"></div><span>${a}</span></div>
    `).join('');
  }
}

function closePillarModal() {
  document.getElementById('pillar-modal').classList.remove('open');
  document.body.style.overflow = '';
  document.querySelectorAll('.pillar-col').forEach(el => el.classList.remove('active'));

  if (pillarsOpened.size === PILLARS_TOTAL) {
    unlockPillarsContinue();
  }
}

function unlockPillarsContinue() {
  const lockMsg = document.getElementById('pillars-locked-msg');
  if (lockMsg) {
    lockMsg.innerHTML = '<span aria-hidden="true">✅</span><span>All four pillars explored — you may now continue.</span>';
    lockMsg.style.color = '#6ee7b7';
  }
  const btn = document.getElementById('pillars-continue-btn');
  if (btn) {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
    btn.setAttribute('aria-label', 'Continue to Advance Care Planning');
    btn.focus();
  }
}
