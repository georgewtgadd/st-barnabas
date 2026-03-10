/* types.js — 5 diabetes types click-to-reveal */
'use strict';

const TYPE_DATA = [
  {
    num: 1, tag: 'Type I', label: 'Absolute Insulin Deficiency',
    badge: { color: 'linear-gradient(135deg,#7c3aed,#a855f7)' },
    stripe: '#7c3aed',
    mechanism: 'Autoimmune destruction of beta cells',
    sections: [
      { label: 'Mechanism', body: 'Type 1 diabetes is an autoimmune condition in which the body\'s own immune system attacks and destroys the insulin-producing <strong>beta cells</strong> in the Islets of Langerhans. The exact trigger is not fully understood — a combination of genetic susceptibility and environmental factors (e.g. viral infections) is implicated.' },
      { label: 'Clinical Features', body: 'Typically presents acutely, often in childhood or adolescence (though can occur at any age). Classic symptoms: polydipsia, polyuria, weight loss, diabetic ketoacidosis (DKA). <strong>Absolute insulin deficiency</strong> — the body produces no insulin at all.' },
      { label: 'Management', body: 'Requires <strong>exogenous insulin for survival</strong> — basal-bolus or continuous subcutaneous insulin infusion (pump). No alternative exists. Without insulin, DKA develops within hours to days.' }
    ],
    eol: 'At end of life, Type 1 patients MUST receive at least a low-dose basal insulin to prevent DKA — a distressing and potentially rapidly fatal complication. Complete insulin withdrawal is not appropriate. Typical approach: reduce to once-daily long-acting insulin at approximately 50% of usual dose, with capillary glucose monitoring once daily unless symptomatic.'
  },
  {
    num: 2, tag: 'Type II', label: 'Insulin Resistance & Relative Deficiency',
    badge: { color: 'linear-gradient(135deg,#0178b0,#38bdf8)' },
    stripe: '#0197de',
    mechanism: 'Progressive beta cell dysfunction',
    sections: [
      { label: 'Mechanism', body: 'Type 2 is characterised by a combination of <strong>insulin resistance</strong> (cells become less responsive to insulin) and <strong>progressive beta cell failure</strong>. Initially, the pancreas compensates by producing more insulin, but over time beta cells cannot keep up with demand.' },
      { label: 'Clinical Features', body: 'Often insidious onset — many patients are asymptomatic for years. Strongly associated with obesity, physical inactivity, and older age. Accounts for <strong>approximately 90%</strong> of all diabetes cases. Hyperglycaemia-related osmotic symptoms when poorly controlled.' },
      { label: 'Management', body: 'Progressive: lifestyle interventions → oral agents (metformin, SGLT2i, GLP-1 agonists) → insulin as beta cell function declines. Many patients eventually require insulin, but this is not universal.' }
    ],
    eol: 'At end of life, many Type 2 medications should be stopped: metformin (risk of lactic acidosis if renal function deteriorates), SGLT2 inhibitors, sulfonylureas (high hypo risk with reduced intake). If insulin-dependent, reduce dose significantly. If diet-controlled only, monitoring may be sufficient — consider stopping regular finger-pricks and only testing if symptoms suggest hypo or hyper.'
  },
  {
    num: 3, tag: 'Type 3c', label: 'Pancreatogenic Diabetes',
    badge: { color: 'linear-gradient(135deg,#d97706,#fbbf24)' },
    stripe: '#d97706',
    mechanism: 'Exocrine pancreas damage affecting beta cells',
    sections: [
      { label: 'Mechanism', body: 'Type 3c arises when the <strong>exocrine pancreas is damaged</strong> — through pancreatitis, pancreatic cancer, cystic fibrosis, pancreatectomy, or haemochromatosis. Destruction of exocrine tissue leads to simultaneous loss of the Islets of Langerhans, causing insulin deficiency. Also called pancreatogenic diabetes.' },
      { label: 'Clinical Features', body: 'Often requires both <strong>insulin replacement</strong> and <strong>pancreatic enzyme replacement therapy (PERT)</strong>. Malabsorption is common. This type is frequently misclassified as Type 1 or 2. In the context of pancreatic cancer, it may be the presenting complaint.' },
      { label: 'Distinguishing Features', body: 'History of pancreatic disease. Steatorrhoea (fatty stools) due to fat malabsorption. Response to insulin is often <strong>unpredictable and erratic</strong> due to simultaneous glucagon deficiency — making hypoglycaemia a significant risk.' }
    ],
    eol: 'Particularly relevant in palliative oncology — up to 50% of patients with pancreatic cancer develop Type 3c. The dual loss of insulin AND glucagon makes glycaemic management especially challenging. Erratic glucose patterns are common. Hypoglycaemia risk is high as intake declines. At EoL, prioritise symptom relief: reduce/stop insulin if patient is no longer eating, and ensure PERT is available if nutrition continues.'
  },
  {
    num: 4, tag: 'Type IV', label: 'Lean Insulin Resistance',
    badge: { color: 'linear-gradient(135deg,#16a34a,#4ade80)' },
    stripe: '#16a34a',
    mechanism: 'Non-obesity-related insulin resistance in older adults',
    sections: [
      { label: 'Mechanism', body: 'Type 4 diabetes (a more recently proposed classification) describes <strong>insulin resistance in older, lean individuals</strong> where the classic obesity-associated pathway does not apply. Research suggests this may involve <strong>immune-mediated mechanisms</strong> — specifically the accumulation of senescent T-cells with age that drive insulin resistance independently of adipose tissue.' },
      { label: 'Clinical Features', body: 'Presents in <strong>older adults</strong> (typically 70s+) without obesity or traditional Type 2 risk factors. May be underdiagnosed as it does not fit the typical Type 2 profile. Blood glucose elevation is often moderate; ketoacidosis is rare.' },
      { label: 'Management', body: 'Oral agents are typically first-line. Response to standard Type 2 treatments is variable. Insulin may eventually be required. Careful monitoring for hypoglycaemia given reduced counter-regulatory response in older adults.' }
    ],
    eol: 'In EoL care, Type 4 patients are typically older and may have multiple comorbidities. The blunted adrenaline and glucagon responses in older adults mean that hypoglycaemia symptoms may be atypical or absent ("silent hypos"). This makes hypoglycaemia particularly dangerous. Gentle targets (6–12 mmol/L) and reduced monitoring frequency are appropriate in the terminal phase.'
  },
  {
    num: 5, tag: 'Type V', label: 'Monogenic Diabetes (MODY)',
    badge: { color: 'linear-gradient(135deg,#dc2626,#f87171)' },
    stripe: '#dc2626',
    mechanism: 'Single gene mutation — hereditary',
    sections: [
      { label: 'Mechanism', body: 'Maturity-Onset Diabetes of the Young (MODY) is caused by <strong>a mutation in a single gene</strong> involved in beta cell function or insulin signalling. Unlike Type 1 and 2 which are polygenic and complex, MODY follows a <strong>Mendelian inheritance pattern</strong> — typically autosomal dominant with 50% penetrance.' },
      { label: 'Clinical Features', body: 'Multiple subtypes exist (MODY1–MODY13), most commonly GCK-MODY (mild, stable) and HNF1A-MODY (progressive, sulphonylurea-sensitive). Often misdiagnosed as Type 1 or 2. Strong <strong>family history</strong> across generations. Typically presents before age 25.' },
      { label: 'Distinguishing Features', body: 'Absence of autoimmune markers (GAD, IA2 antibodies). No significant insulin resistance. Positive family history. <strong>Genetic testing</strong> is required for definitive diagnosis. Correct identification is important — HNF1A and HNF4A-MODY respond dramatically to low-dose sulphonylureas, avoiding the need for insulin.' }
    ],
    eol: 'MODY is relatively rare in palliative settings but important to recognise. If a patient has been on sulphonylureas for MODY, these carry significant hypoglycaemia risk as intake declines — particularly in liver disease which impairs clearance. Consider switching to low-dose insulin or stopping treatment entirely in the terminal phase, in discussion with the patient and specialist diabetes team if available.'
  }
];

let typesVisited = new Set();

function openTypeModal(num) {
  const d = TYPE_DATA[num - 1];
  if (!d) return;

  typesVisited.add(num);
  markTypeVisited(num);

  // Stripe + badge
  const stripe = document.getElementById('tm-stripe');
  if (stripe) stripe.style.background = d.stripe;

  const badge = document.getElementById('tm-badge');
  if (badge) { badge.style.background = d.badge.color; badge.textContent = d.tag; }

  document.getElementById('tm-tag').textContent   = 'Diabetes Type ' + num;
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
  if (hint) hint.textContent = typesVisited.size < 5
    ? `${typesVisited.size} of 5 explored — ${5 - typesVisited.size} remaining`
    : 'All five types explored — you can now continue.';

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
  if (tick) tick.hidden = false;
}

function checkTypesComplete() {
  if (typesVisited.size >= 5) {
    const btn = document.getElementById('types-continue-btn');
    const msg = document.getElementById('types-locked-msg');
    const lockTxt = document.getElementById('types-lock-text');
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
    if (lockTxt) lockTxt.textContent = '✅ All types explored — you may continue';
  }
}
