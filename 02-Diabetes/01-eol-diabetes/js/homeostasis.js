/* homeostasis.js — Interactive homeostasis cycle */
'use strict';

const HOMEO_DATA = {
  high: {
    eyebrow: 'High Blood Glucose',
    title: 'After Eating — The Insulin Response',
    steps: [
      { type: 'high', num: '1', text: '<strong>Blood glucose rises</strong> above the set point (~5.0 mmol/L) after a carbohydrate-containing meal. Glucose is absorbed from the gut into the portal bloodstream.' },
      { type: 'high', num: '2', text: '<strong>Beta cells in the Islets of Langerhans detect the rise.</strong> They secrete insulin directly into the bloodstream within minutes.' },
      { type: 'high', num: '3', text: '<strong>Insulin acts like a key</strong> — unlocking cell membranes to allow glucose entry for energy production (ATP). This is the "lock and key" mechanism.' },
      { type: 'high', num: '4', text: '<strong>The liver stores excess glucose</strong> as glycogen (glycogenesis). Muscle cells also take up glucose. Blood glucose falls back toward the set point.' }
    ],
    eol: 'In EoL care, patients eating very little will spend less time in this high-glucose state. However, corticosteroids and stress hormones can artificially drive glucose up even without food intake — requiring insulin dose adjustment.'
  },
  low: {
    eyebrow: 'Low Blood Glucose',
    title: 'Fasting or Exercise — The Glucagon Response',
    steps: [
      { type: 'low', num: '1', text: '<strong>Blood glucose falls below the set point</strong> during fasting, exercise, or if too much insulin has been administered.' },
      { type: 'low', num: '2', text: '<strong>Alpha cells in the Islets of Langerhans detect the drop</strong> and secrete glucagon into the bloodstream. Simultaneously, insulin secretion is suppressed.' },
      { type: 'low', num: '3', text: '<strong>Glucagon signals the liver</strong> to break down stored glycogen back into glucose (glycogenolysis) and release it into the blood.' },
      { type: 'low', num: '4', text: '<strong>Blood glucose rises</strong> back toward the set point. In prolonged fasting, gluconeogenesis also produces new glucose from amino acids and fats.' }
    ],
    eol: 'In EoL care, reduced oral intake and continuing insulin doses creates a high risk of hypoglycaemia. Insulin doses should be proactively reduced as intake falls. In malnourished patients, glycogen stores may be depleted — making this glucagon response unreliable.'
  },
  'insulin-resp': {
    eyebrow: 'Hormone Response',
    title: 'Insulin — The Glucose Key',
    steps: [
      { type: 'high', num: '🔑', text: '<strong>Insulin is a peptide hormone</strong> produced by beta cells. It binds to receptors on cell membranes, triggering the translocation of GLUT4 glucose transporters to the cell surface.' },
      { type: 'high', num: '2', text: '<strong>This "unlocks" the cell</strong> to glucose entry — the classic "lock and key" analogy. Without insulin, cells cannot absorb glucose regardless of blood levels.' },
      { type: 'high', num: '3', text: '<strong>Insulin also inhibits glucose production</strong> in the liver, promotes glycogen synthesis, and suppresses fat breakdown (lipolysis).' }
    ],
    eol: 'Even at end of life, Type 1 and insulin-dependent Type 2 patients need some insulin to prevent DKA. The dose should be the minimum necessary — not titrated for glycaemic perfection.'
  },
  store: {
    eyebrow: 'Glucose Storage',
    title: 'Glycogen Synthesis — The Liver as Battery',
    steps: [
      { type: 'high', num: '1', text: '<strong>When blood glucose is high</strong>, insulin stimulates the liver and muscles to polymerise glucose molecules into glycogen chains (glycogenesis).' },
      { type: 'high', num: '2', text: '<strong>The liver can store ~100g of glycogen</strong>; muscles store ~400g. This acts as a short-term energy battery, rapidly releasable when needed.' },
      { type: 'high', num: '3', text: '<strong>Excess glucose beyond glycogen capacity</strong> is converted to fat (lipogenesis) — explaining why chronic hyperglycaemia leads to weight gain.' }
    ],
    eol: 'Malnourished EoL patients often have severely depleted glycogen stores. If they become hypoglycaemic, the normal glucagon-mediated rescue response may fail — oral or IV glucose may be needed urgently.'
  },
  'glucagon-resp': {
    eyebrow: 'Hormone Response',
    title: 'Glucagon — The Glucose Mobiliser',
    steps: [
      { type: 'low', num: '📡', text: '<strong>Glucagon is secreted by alpha cells</strong> when blood glucose falls below approximately 4 mmol/L, or in response to protein intake, exercise, or stress.' },
      { type: 'low', num: '2', text: '<strong>Glucagon binds to liver receptors</strong>, activating glycogen phosphorylase — the enzyme that breaks down glycogen into glucose (glycogenolysis).' },
      { type: 'low', num: '3', text: '<strong>Glucagon also stimulates gluconeogenesis</strong> — the production of new glucose from non-carbohydrate sources such as amino acids, lactate and glycerol.' }
    ],
    eol: 'Injectable glucagon (GlucaGen) can be used to treat severe hypoglycaemia when IV access is unavailable. However, it requires adequate liver glycogen stores to work — it may be ineffective in cachectic or malnourished palliative patients.'
  },
  release: {
    eyebrow: 'Glycogen Breakdown',
    title: 'Glycogenolysis — Releasing the Battery',
    steps: [
      { type: 'low', num: '⚡', text: '<strong>Glycogenolysis is triggered by glucagon and adrenaline</strong>. The enzyme glycogen phosphorylase cleaves glucose-1-phosphate units from glycogen chains.' },
      { type: 'low', num: '2', text: '<strong>Glucose-1-phosphate is converted</strong> to glucose-6-phosphate, then free glucose which enters the bloodstream, raising blood glucose levels.' },
      { type: 'low', num: '3', text: '<strong>This process begins within minutes</strong> of a hypoglycaemic stimulus — making it the body\'s fastest rescue mechanism for low blood sugar.' }
    ],
    eol: 'Understanding this pathway helps explain why beta-blockers (commonly used for cardiac conditions) can mask hypoglycaemia symptoms — they block the adrenaline-mediated response that would normally trigger glycogen release and alert the patient.'
  }
};

let homeoVisited = new Set();

function openHomeoModal(key) {
  const data = HOMEO_DATA[key];
  if (!data) return;

  homeoVisited.add(key);

  document.getElementById('hm-eyebrow').textContent = data.eyebrow;
  document.getElementById('hm-title').textContent   = data.title;

  const body = document.getElementById('hm-body');
  body.innerHTML = `
    <div class="hm-detail">
      <div class="hm-steps">
        ${data.steps.map(s => `
          <div class="hm-step ${s.type}">
            <div class="hm-step-num">${s.num}</div>
            <p>${s.text}</p>
          </div>`).join('')}
      </div>
      ${data.eol ? `<div class="hm-eol"><div class="hm-eol-label">EoL Relevance</div><p>${data.eol}</p></div>` : ''}
    </div>`;

  document.getElementById('homeo-modal').classList.add('open');
  document.getElementById('homeo-modal').focus();
}

function closeHomeoModal() {
  document.getElementById('homeo-modal').classList.remove('open');
}

function initHomeostasis() {
  // Nothing to init beyond event listeners (handled in main.js)
}
