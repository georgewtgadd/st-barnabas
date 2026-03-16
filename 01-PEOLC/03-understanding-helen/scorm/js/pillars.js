/* ══════════════════════════════════════════════════════════
   pillars.js — Four Pillars: data, open/close modal, unlock
══════════════════════════════════════════════════════════ */

const PILLARS_TOTAL = 4;
const pillarsOpened = new Set();

const pillarData = {
  1: {
    icon: '🫁', tag: 'Pillar One', name: 'Physical',
    stripe: '#0197de', iconBg: 'rgba(1,151,222,0.14)', tagColor: '#7dd3fc',
    definition: 'Physical wellbeing encompasses a person\'s bodily health — their symptoms, comfort, functional ability, and medical needs. In palliative care, the physical pillar is not about cure, but about maintaining quality of life: managing pain, breathlessness, fatigue, and other symptoms so a person can live as fully as possible for as long as possible.',
    complexNeeds: ['Intractable symptoms', 'Pain management', 'Metastatic cord compression', 'Bleed at end of life', 'Diabetes management at EOL', 'Seizure management at EOL', 'Frailty'],
    interventions: ['Physiotherapy', 'Occupational Therapy', 'Medical Management', 'Specialist Nursing Care', 'Complementary therapies', 'Volunteer support & coordination', 'Coordinator (PCCC and SpMDT)'],
    outcomes: ['Symptom optimisation', 'Reablement and adaption of function', 'Goal planning to support self/care and self management', 'Advance Care Planning', 'Anticipatory Prescribing', 'ReSPECT conversations and planning', 'Lasting Power of Attorney for Health and Welfare']
  },
  2: {
    icon: '🕊️', tag: 'Pillar Two', name: 'Psychological & Spiritual',
    stripe: '#7c6ef5', iconBg: 'rgba(124,110,245,0.14)', tagColor: '#c4b5fd',
    definition: 'This pillar recognises that a person\'s emotional and inner life is inseparable from their health. Psychological wellbeing includes how someone copes with fear, grief, identity, and loss of independence. Spiritual wellbeing — which may or may not be religious — relates to meaning, purpose, peace, and what sustains a person\'s sense of self in the face of serious illness.',
    complexNeeds: ['Loss of sense of self, depression/anxiety', 'Unwilling/unable to come to terms with diagnosis', 'Sensory or cognitive impairment', 'Psycho-sexual complexity', 'Relationship/family breakdown', 'Complex palliative rehab'],
    interventions: ['Spiritual Care', 'Occupational Therapy', 'Physiotherapy', 'Wellbeing Team and specialist counselling', 'Specialist Nurses', 'Complementary therapies', 'Volunteers'],
    outcomes: ['Person\'s focus of care', 'Clarity regarding preferences and wishes', 'Opportunity to make plans to achieve key milestones', 'A sense of peace and purpose', 'Acceptance']
  },
  3: {
    icon: '💷', tag: 'Pillar Three', name: 'Financial',
    stripe: '#fdca0f', iconBg: 'rgba(253,202,15,0.1)', tagColor: '#fde68a',
    definition: 'Financial wellbeing is often an overlooked but critical dimension of holistic care. Serious illness frequently reduces income while increasing costs. Unresolved financial pressures create significant stress for both patients and carers, can lead to fuel poverty and poor nutrition, and can erode the quality and sustainability of home-based care.',
    complexNeeds: ['Risk of harms associated with poverty including funeral poverty', 'Need for package of care', 'Eligibility for benefits for person and carer', 'Optimising home adaptations', 'Future planning'],
    interventions: ['Wellbeing Team and specialist welfare and benefit advisors', 'Social work expertise', 'Continuing Health Care', 'Occupational Therapy', 'Case management and care coordination', 'PCCC'],
    outcomes: ['Access to eligible benefits e.g. SR1', 'Access to CHC Funded Health Care', 'Rehoming/home adaptations', 'Access to funeral and care after death', 'Will writing', 'Lasting Power of Attorney for Finance']
  },
  4: {
    icon: '👨‍👩‍👧', tag: 'Pillar Four', name: 'Family & Carer',
    stripe: '#2ecc8e', iconBg: 'rgba(46,204,142,0.12)', tagColor: '#6ee7b7',
    definition: 'No one lives in isolation. This pillar addresses the relational world of the patient: their connections to family, friends, and community, as well as the wellbeing of those who provide care. Social isolation is a significant health risk. Carers carry enormous physical and emotional burdens. In family systems, the illness of one person affects everyone around them.',
    complexNeeds: ['History of family trauma', 'Psycho-social distress', 'Suicidal ideation', 'Anxiety re unplanned care needs', 'Risk of carer burnout', 'Risk of care break down', 'Complex communication needs', 'Pre and post bereavement needs'],
    interventions: ['Physiotherapy', 'Occupational Therapy', 'Medical Management', 'Wellbeing and counselling services', 'Specialist Nursing Care', 'Volunteers', 'Case management and care coordination'],
    outcomes: ['Family and carers feel able to manage and know who and where to escalate concerns to', 'Emergency care plans in place', 'Safe guarding concerns managed']
  }
};

function openPillarModal(id) {
  const p = pillarData[id];
  pillarsOpened.add(id);

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
    <div class="pillar-section-row">
      <div class="pillar-section-col">
        <div class="pillar-col-label" style="color:${p.tagColor}">Complex Needs</div>
        ${p.complexNeeds.map(a => `<div class="pillar-key-item"><div class="pillar-key-dot" style="background:${p.stripe}"></div><span>${a}</span></div>`).join('')}
      </div>
      <div class="pillar-section-col">
        <div class="pillar-col-label" style="color:${p.tagColor}">Specialist Interventions</div>
        ${p.interventions.map(a => `<div class="pillar-key-item"><div class="pillar-key-dot" style="background:${p.stripe}"></div><span>${a}</span></div>`).join('')}
      </div>
      <div class="pillar-section-col">
        <div class="pillar-col-label" style="color:${p.tagColor}">Person-Centred Outcomes</div>
        ${p.outcomes.map(a => `<div class="pillar-key-item"><div class="pillar-key-dot" style="background:${p.stripe}"></div><span>${a}</span></div>`).join('')}
      </div>
    </div>
  `;

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

  // Update footer hint
  const remaining = PILLARS_TOTAL - pillarsOpened.size;
  const hint = document.getElementById('pm-hint');
  if (hint) {
    hint.textContent = remaining > 0
      ? remaining + ' pillar' + (remaining !== 1 ? 's' : '') + ' remaining — explore all before continuing.'
      : 'All pillars explored — you may now continue.';
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
