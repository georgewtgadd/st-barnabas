/* types.js — 5 diabetes classifications click-to-reveal */
'use strict';

const TYPE_DATA = [
  {
    num: 1,
    tag: 'Type I',
    modalTag: 'Autoimmune Diabetes',
    label: 'Absolute Insulin Deficiency',
    badge: { color: 'linear-gradient(135deg,#7c3aed,#a855f7)' },
    stripe: '#7c3aed',
    mechanism: 'Autoimmune destruction of beta cells',
    sections: [
      { label: 'Mechanism', body: 'Type 1 diabetes is an autoimmune condition in which the body\'s own immune system attacks and destroys the insulin-producing <strong>beta cells</strong> in the Islets of Langerhans. The exact trigger is not fully understood, but genetic susceptibility and environmental factors are both implicated.' },
      { label: 'Clinical Features', body: 'Typically presents acutely, often in childhood or adolescence, although it can occur at any age. Classic symptoms include polyuria, polydipsia, weight loss and, if untreated, diabetic ketoacidosis (DKA). The defining feature is <strong>absolute insulin deficiency</strong>.' },
      { label: 'Management', body: 'Requires <strong>exogenous insulin for survival</strong> using basal-bolus therapy or insulin pump treatment. There is no non-insulin substitute that can prevent DKA in established Type 1 diabetes.' }
    ],
    eol: 'At end of life, patients with Type 1 diabetes must usually continue at least a low-dose basal insulin to prevent DKA, while avoiding burdensome intensive monitoring. The goal becomes comfort and prevention of symptomatic hypo- or hyperglycaemia rather than tight control.'
  },
  {
    num: 2,
    tag: 'Type II',
    modalTag: 'Type 2 Diabetes',
    label: 'Insulin Resistance & Relative Deficiency',
    badge: { color: 'linear-gradient(135deg,#0178b0,#38bdf8)' },
    stripe: '#0197de',
    mechanism: 'Insulin resistance with progressive beta cell dysfunction',
    sections: [
      { label: 'Mechanism', body: 'Type 2 diabetes is characterised by a combination of <strong>insulin resistance</strong> and <strong>progressive beta cell failure</strong>. Early on, the pancreas compensates by making more insulin, but over time insulin secretion becomes insufficient for the body\'s needs.' },
      { label: 'Clinical Features', body: 'Onset is often gradual and many patients remain asymptomatic for years. It is commonly associated with obesity, inactivity and increasing age, but can also occur in lean people and in diverse ethnic groups. Hyperglycaemia may present with fatigue, thirst, polyuria or recurrent infection.' },
      { label: 'Management', body: 'Management is progressive: lifestyle measures, oral or injectable non-insulin agents, and insulin when endogenous production declines. Importantly, <strong>corticosteroid therapy can unmask previously undiagnosed diabetes or markedly worsen existing Type 2 control</strong>, so active glucose monitoring is required when steroids are started.' }
    ],
    eol: 'At end of life, many Type 2 medicines are reduced or stopped, especially agents with high hypoglycaemia risk or poor benefit in the terminal phase. Steroid courses still require attention because they can push glucose markedly upward even when oral intake is low. Management should remain symptom-led and proportionate.'
  },
  {
    num: 3,
    tag: 'Type 3c',
    modalTag: 'Pancreatogenic Diabetes',
    label: 'Pancreatogenic Diabetes',
    badge: { color: 'linear-gradient(135deg,#d97706,#fbbf24)' },
    stripe: '#d97706',
    mechanism: 'Exocrine pancreas damage with loss of islet function',
    sections: [
      { label: 'Mechanism', body: 'Type 3c arises when the <strong>exocrine pancreas is damaged</strong> by chronic pancreatitis, pancreatic cancer, cystic fibrosis, pancreatectomy or other pancreatic disorders. Destruction of the gland can reduce both insulin-producing beta cells and glucagon-producing alpha cells.' },
      { label: 'Clinical Features', body: 'Patients often have <strong>both diabetes and exocrine pancreatic insufficiency</strong>. Weight loss, steatorrhoea and malabsorption are common. It is frequently misclassified as Type 1 or Type 2 diabetes unless the underlying pancreatic disease is recognised.' },
      { label: 'Distinguishing Features', body: 'A history of pancreatic disease, need for pancreatic enzyme replacement therapy, and <strong>erratic glucose patterns</strong> are key clues. Because glucagon secretion may also be impaired, hypoglycaemia can be severe and difficult to correct.' }
    ],
    eol: 'Type 3c is particularly important in palliative oncology and gastroenterology. The combined loss of insulin, glucagon and digestion makes management unpredictable. As intake falls, patients may swing rapidly between hyperglycaemia and hypoglycaemia, so treatment should be simplified and closely individualised.'
  },
  {
    num: 4,
    tag: 'MRD / SIDD',
    modalTag: 'Malnutrition-Related / Severe Insulin-Deficient Diabetes',
    label: 'Malnutrition-Related Diabetes',
    badge: { color: 'linear-gradient(135deg,#16a34a,#4ade80)' },
    stripe: '#16a34a',
    mechanism: 'Lean undernourished phenotype with marked insulin deficiency',
    sections: [
      { label: 'Mechanism', body: 'Malnutrition-related diabetes describes diabetes arising in <strong>lean or chronically undernourished individuals</strong> with limited pancreatic reserve and marked insulin deficiency. In modern phenotyping, some of these patients overlap with the <strong>SIDD (Severe Insulin-Deficient Diabetes)</strong> cluster: they are not autoimmune, but their beta cell function is profoundly impaired.' },
      { label: 'Clinical Features', body: 'These patients are often thin, may have a history of childhood or long-term undernutrition, and can present with severe hyperglycaemia despite lacking the classic obesity-associated Type 2 picture. Ketosis is variable, but glucose control is often unstable because glycogen stores and nutritional reserves are poor.' },
      { label: 'Distinguishing Features', body: 'The key distinction is that the problem is <strong>not classic insulin resistance alone</strong>. Instead, there is a severe insulin-deficient phenotype in a malnourished or low-BMI patient. This matters because treatment frequently requires insulin sooner than expected, alongside nutritional assessment and correction of underlying deficiency.' }
    ],
    eol: 'At end of life, this group is highly vulnerable to hypoglycaemia because oral intake is low, glycogen stores are depleted and glucagon responses may be ineffective. Even small insulin doses can have large effects. Management should be cautious, nutrition-aware and focused on symptom prevention.'
  },
  {
    num: 5,
    tag: 'MODY',
    modalTag: 'Monogenic Diabetes',
    label: 'Monogenic Diabetes (MODY)',
    badge: { color: 'linear-gradient(135deg,#dc2626,#f87171)' },
    stripe: '#dc2626',
    mechanism: 'Single gene mutation affecting beta cell function',
    sections: [
      { label: 'Mechanism', body: 'Maturity-Onset Diabetes of the Young (MODY) is caused by <strong>a mutation in a single gene</strong> involved in beta cell function or insulin signalling. Unlike Type 1 or Type 2 diabetes, MODY follows a clear hereditary pattern, usually autosomal dominant.' },
      { label: 'Clinical Features', body: 'Multiple subtypes exist. Some, such as GCK-MODY, produce mild stable fasting hyperglycaemia, whereas others, such as HNF1A- or HNF4A-MODY, are progressive and often highly sensitive to sulfonylureas. A strong <strong>family history across generations</strong> is a major clue.' },
      { label: 'Distinguishing Features', body: 'Patients are usually antibody-negative and may not fit the expected pattern for Type 1 or Type 2 diabetes. <strong>Genetic testing</strong> confirms the diagnosis. Correct classification matters because treatment can differ substantially from standard pathways.' }
    ],
    eol: 'MODY is uncommon in palliative practice but still important to recognise. If treatment relies on sulfonylureas, falling intake can sharply increase hypoglycaemia risk. Therapy should therefore be simplified with attention to the individual subtype, current nutrition and comfort goals.'
  }
];

let typesVisited = new Set();

function openTypeModal(num) {
  const d = TYPE_DATA[num - 1];
  if (!d) return;

  typesVisited.add(num);
  markTypeVisited(num);

  const stripe = document.getElementById('tm-stripe');
  if (stripe) stripe.style.background = d.stripe;

  const badge = document.getElementById('tm-badge');
  if (badge) {
    badge.style.background = d.badge.color;
    badge.textContent = d.tag;
  }

  const tagEl = document.getElementById('tm-tag');
  if (tagEl) tagEl.textContent = d.modalTag || ('Classification ' + num);

  document.getElementById('tm-title').textContent = d.label;

  const body = document.getElementById('tm-body');
  body.innerHTML = `<div class="tm-body-grid">
    ${d.sections.map(s => `
      <div class="tm-section">
        <div class="tm-sec-label">${s.label}</div>
        <div class="tm-sec-body">${s.body}</div>
      </div>`).join('')}
    <div class="tm-eol">
      <div class="tm-eol-label">End of Life Considerations</div>
      <p>${d.eol}</p>
    </div>
  </div>`;

  const hint = document.getElementById('tm-hint');
  if (hint) {
    hint.textContent = typesVisited.size < 5
      ? `${typesVisited.size} of 5 explored — ${5 - typesVisited.size} remaining`
      : 'All five classifications explored — you can now continue.';
  }

  document.getElementById('type-modal').classList.add('open');
  checkTypesComplete();
}

function closeTypeModal() {
  document.getElementById('type-modal').classList.remove('open');
}

function markTypeVisited(num) {
  const card = document.getElementById('tc-' + num);
  if (card) card.classList.add('visited');
  const tick = document.getElementById('tv-' + num);
  if (tick) {
    tick.removeAttribute('hidden');
    tick.classList.add('visible');
  }
}

function checkTypesComplete() {
  if (typesVisited.size >= 5) {
    const btn = document.getElementById('types-continue-btn');
    const lockTxt = document.getElementById('types-lock-text');
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    }
    if (lockTxt) lockTxt.textContent = '✅ All classifications explored — you may continue';
  }
}
