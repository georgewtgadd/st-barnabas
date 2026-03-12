/* ══════════════════════════════════════════════════════════
   js/phases.js  ·  Phases & Layers interactive page 5
══════════════════════════════════════════════════════════ */

const PHASES_REQUIRED = 4;   // minimum phases to open to unlock continue

const phaseData = {
  1: {
    type:   'phase', num: 1, color: '#0197de',
    label:  'Phase 1',
    name:   'Stable',
    icon:   '🔵', bg: 'rgba(1,151,222,0.15)',
    definition: 'The person has a life-limiting condition that is currently being managed. They may be receiving active treatment alongside palliative support. This is the time to begin advance care planning and ensure the person and family understand the trajectory ahead.',
    listLabel: 'Key features',
    items: [
      'Condition currently managed with treatment',
      'Begin advance care planning conversations',
      'Establish goals of care with patient and family',
      'Coordinate primary and specialist care',
      'Identify support needs early',
    ],
    source: 'Wong et al. (2024) — Palliative Care Phase Framework',
  },
  2: {
    type:   'phase', num: 2, color: '#0d9488',
    label:  'Phase 2',
    name:   'Unstable',
    icon:   '🟢', bg: 'rgba(13,148,136,0.15)',
    definition: 'The person experiences an unexpected change or deterioration that requires urgent assessment or intervention. The situation is unpredictable — the person may improve or decline. Care plans should be reviewed and updated.',
    listLabel: 'Key features',
    items: [
      'Unexpected change in condition',
      'Urgent assessment required',
      'Outcome unpredictable — may improve',
      'Review and update care plan',
      'Increase communication with family',
    ],
    source: 'Wong et al. (2024) — Palliative Care Phase Framework',
  },
  3: {
    type:   'phase', num: 3, color: '#fdca0f',
    label:  'Phase 3',
    name:   'Deteriorating',
    icon:   '🟡', bg: 'rgba(253,202,15,0.12)',
    definition: 'The person is on a gradual but expected decline. Day-to-day needs are increasing and the trajectory is clearly downward. This phase calls for proactive symptom management, updated planning and increased support for families.',
    listLabel: 'Key features',
    items: [
      'Gradual, expected decline',
      'Increasing care needs day to day',
      'Proactive symptom management',
      'Prepare family for what to expect',
      'Confirm preferred place of care',
    ],
    source: 'Wong et al. (2024) — Palliative Care Phase Framework',
  },
  4: {
    type:   'phase', num: 4, color: '#ef4444',
    label:  'Phase 4',
    name:   'Terminal',
    icon:   '🔴', bg: 'rgba(220,38,38,0.12)',
    definition: 'Death is expected within hours to days. The focus shifts entirely to comfort, dignity and support for the person and those close to them. All interventions should be reviewed against the goal of a peaceful, dignified death.',
    listLabel: 'Key features',
    items: [
      'Death expected within hours to days',
      'Focus entirely on comfort and dignity',
      'Review and cease non-beneficial interventions',
      'Support family emotionally and practically',
      'Ensure symptom control is optimal',
    ],
    source: 'Wong et al. (2024) — Palliative Care Phase Framework',
  },
  5: {
    type:   'phase', num: 5, color: '#7c6ef5',
    label:  'Phase 5',
    name:   'Bereavement',
    icon:   '💜', bg: 'rgba(124,110,245,0.15)',
    definition: 'Support continues beyond the death of the person to their family and carers. Bereavement care acknowledges the grief process and provides follow-up, emotional support and signposting to specialist services where needed.',
    listLabel: 'Key features',
    items: [
      'Support for family and carers after death',
      'Follow-up contact from the care team',
      'Acknowledge and validate grief',
      'Signpost to bereavement support services',
      'Review learning and care quality',
    ],
    source: 'Wong et al. (2024) — Palliative Care Phase Framework',
  },
};

const layerData = {
  1: {
    type:   'layer', num: 1, color: '#0197de',
    label:  'Layer 1',
    name:   'Physical Care',
    icon:   '🩺', bg: 'rgba(1,151,222,0.12)',
    definition: 'Physical care focuses on the assessment and management of symptoms such as pain, breathlessness, nausea, fatigue and agitation. It aims to maintain comfort and function for as long as possible.',
    listLabel: 'Examples include',
    items: [
      'Pain and symptom assessment',
      'Medication review and prescribing',
      'Wound and skin care',
      'Nutrition and hydration support',
      'Mobility and positioning assistance',
    ],
    source: 'Palliative Care — Six Dimensions of Support',
  },
  2: {
    type:   'layer', num: 2, color: '#7c6ef5',
    label:  'Layer 2',
    name:   'Psychological & Emotional',
    icon:   '🕊️', bg: 'rgba(124,110,245,0.12)',
    definition: 'Addresses the emotional and mental health needs of patients and families — including anxiety, depression, fear, adjustment to diagnosis and existential distress.',
    listLabel: 'Examples include',
    items: [
      'Counselling and psychological therapies',
      'Supporting adjustment to diagnosis',
      'Managing anxiety and depression',
      'Crisis intervention support',
      'Supporting families and carers emotionally',
    ],
    source: 'Palliative Care — Six Dimensions of Support',
  },
  3: {
    type:   'layer', num: 3, color: '#059669',
    label:  'Layer 3',
    name:   'Social & Practical',
    icon:   '🤝', bg: 'rgba(5,150,105,0.12)',
    definition: 'Supports day-to-day practical and social needs — from financial matters to housing and social isolation — ensuring the person can live as well as possible for as long as possible.',
    listLabel: 'Examples include',
    items: [
      'Benefits and financial advice',
      'Care at home coordination',
      'Equipment and adaptations',
      'Transport to appointments',
      'Social isolation and community connections',
    ],
    source: 'Palliative Care — Six Dimensions of Support',
  },
  4: {
    type:   'layer', num: 4, color: '#d97706',
    label:  'Layer 4',
    name:   'Spiritual & Cultural',
    icon:   '✨', bg: 'rgba(217,119,6,0.1)',
    definition: 'Explores questions of meaning, purpose, faith and cultural identity. Spiritual care is not limited to religion — it encompasses the human search for meaning at the end of life.',
    listLabel: 'Examples include',
      items: [
        'Chaplaincy and spiritual care services',
        'Respecting religious practices and rituals',
        'Supporting cultural preferences for care',
        'Existential and meaning-of-life conversations',
        'Life review and legacy work',
    ],
    source: 'Palliative Care — Six Dimensions of Support',
  },
  5: {
    type:   'layer', num: 5, color: '#0197de',
    label:  'Layer 5',
    name:   'Communication & ACP',
    icon:   '💬', bg: 'rgba(1,151,222,0.12)',
    definition: 'Clear, compassionate communication underpins all good palliative care. Advance care planning (ACP) ensures the person\'s wishes, values and preferences are documented and respected.',
    listLabel: 'Examples include',
    items: [
      'Honest and sensitive prognostic discussions',
      'Advance Care Planning (ACP)',
      'DNACPR conversations',
      'Preferred place of care documentation',
      'Family meetings and information sharing',
    ],
    source: 'Palliative Care — Six Dimensions of Support',
  },
  6: {
    type:   'layer', num: 6, color: '#0d9488',
    label:  'Layer 6',
    name:   'Coordination & MDT',
    icon:   '🔗', bg: 'rgba(13,148,136,0.12)',
    definition: 'Palliative care involves a multidisciplinary team working across organisational boundaries. Coordination ensures seamless, joined-up care between primary care, hospital, hospice and community services.',
    listLabel: 'Examples include',
    items: [
      'Multidisciplinary team meetings',
      'Care coordination across settings',
      'Handover and documentation',
      'Key worker / named contact for families',
      'Integration of voluntary sector services',
    ],
    source: 'Palliative Care — Six Dimensions of Support',
  },
};

// Tracking
let phasesOpened  = new Set();
let layersOpened  = new Set();
let _phasesDone   = false;

function openPhaseDetail(type, num) {
  const data = type === 'phase' ? phaseData[num] : layerData[num];
  if (!data) return;

  // Track
  if (type === 'phase') phasesOpened.add(num);
  else                  layersOpened.add(num);

  // Mark button active
  const btnId = (type === 'phase' ? 'phase-btn-' : 'layer-btn-') + num;
  const btn   = document.getElementById(btnId);
  if (btn) btn.classList.add('active');

  // Populate modal
  const stripe = document.getElementById('phm-stripe');
  const icon   = document.getElementById('phm-icon');
  const tag    = document.getElementById('phm-tag');
  const title  = document.getElementById('phm-title');
  const def    = document.getElementById('phm-definition');
  const listLbl= document.getElementById('phm-list-label');
  const list   = document.getElementById('phm-list');
  const source = document.getElementById('phm-source');
  const hint   = document.getElementById('phm-hint');

  if (stripe) { stripe.style.background = data.color; }
  if (icon)   { icon.style.background   = data.bg; icon.textContent = data.icon; }
  if (tag)    { tag.style.color = data.color; tag.textContent = data.label; }
  if (title)  { title.textContent = data.name; }
  if (def)    { def.textContent   = data.definition; }
  if (listLbl){ listLbl.textContent = data.listLabel; }
  if (list) {
    list.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'phase-detail-list';
    data.items.forEach(item => {
      const li  = document.createElement('li');
      const dot = document.createElement('div');
      dot.className = 'phase-detail-dot';
      dot.style.background = data.color;
      const span = document.createElement('span');
      span.textContent = item;
      li.appendChild(dot); li.appendChild(span);
      ul.appendChild(li);
    });
    list.appendChild(ul);
  }
  if (source) source.textContent = data.source;

  // Update hint
  if (hint && type === 'phase') {
    const remaining = PHASES_REQUIRED - phasesOpened.size;
    hint.textContent = remaining > 0
      ? 'Explore ' + remaining + ' more phase(s) to unlock continue.'
      : 'All required phases explored — continue when ready!';
  }

  // Open modal
  const modal = document.getElementById('phase-modal');
  if (modal) modal.classList.add('open');

  // Check if we can unlock continue
  unlockPhasesContinue();
}

function closePhaseModal() {
  const modal = document.getElementById('phase-modal');
  if (modal) modal.classList.remove('open');
}

function unlockPhasesContinue() {
  if (phasesOpened.size >= PHASES_REQUIRED) {
    _phasesDone = true;
    const lock = document.getElementById('phases-locked-msg');
    const btn  = document.getElementById('phases-continue-btn');
    if (lock) lock.style.display = 'none';
    if (btn)  btn.hidden = false;
  }
}
