/* homeostasis.js — Step-by-step homeostasis modals */
'use strict';

const HOMEO_STEPS = {
  high: [
    {
      title: 'Blood Glucose Rises',
      eyebrow: 'High Pathway · Step 1',
      steps: [
        { type:'high', num:'1a', text: '<strong>Dietary carbohydrates</strong> are broken down into glucose in the small intestine by amylase and other enzymes.' },
        { type:'high', num:'1b', text: 'Glucose is absorbed across the intestinal epithelium and enters the <strong>portal vein</strong>, flowing directly to the liver.' },
        { type:'high', num:'1c', text: 'Blood glucose rapidly rises above the set point (~5.0 mmol/L) — signalling the pancreas to respond.' }
      ],
      eol: 'In EoL care, patients eating very little will have blunted post-meal glucose rises. However, corticosteroids can elevate blood glucose even without carbohydrate intake — an important clinical consideration.'
    },
    {
      title: 'Beta Cells Secrete Insulin',
      eyebrow: 'High Pathway · Step 2',
      steps: [
        { type:'high', num:'1', text: 'GLUT2 glucose transporters in <strong>beta cell membranes</strong> allow glucose to enter the cell proportionally to blood levels.' },
        { type:'high', num:'2', text: 'Rising intracellular glucose triggers ATP production, which closes K⁺ channels, depolarises the cell, and triggers <strong>insulin granule exocytosis</strong>.' },
        { type:'high', num:'3', text: 'Insulin enters the bloodstream and rapidly reaches target tissues — primarily liver, muscle and adipose.' }
      ],
      eol: 'In Type 1 diabetes and late-stage insulin-dependent Type 2, beta cells are absent or exhausted. No endogenous insulin is produced — exogenous insulin must be given, even at end of life, to prevent DKA.'
    },
    {
      title: 'Insulin Unlocks Cells',
      eyebrow: 'High Pathway · Step 3',
      steps: [
        { type:'high', num:'🔑', text: 'Insulin binds to <strong>tyrosine kinase receptors</strong> on cell membranes — a precise "lock and key" interaction.' },
        { type:'high', num:'2', text: 'This triggers translocation of <strong>GLUT4 glucose transporters</strong> to the cell surface, dramatically increasing glucose uptake.' },
        { type:'high', num:'3', text: 'Glucose enters the cell and enters glycolysis, producing ATP for all cellular functions.' }
      ],
      eol: 'Without insulin (Type 1 or late insulin-dependent Type 2), cells cannot take up glucose — they starve while blood glucose rises. This is why even minimal insulin is essential for comfort at end of life.'
    },
    {
      title: 'Excess Glucose Stored as Glycogen',
      eyebrow: 'High Pathway · Step 4',
      steps: [
        { type:'high', num:'1', text: 'Insulin stimulates <strong>glycogenesis</strong> — the synthesis of glycogen chains from glucose in the liver (~100g capacity) and muscle (~400g).' },
        { type:'high', num:'2', text: 'Insulin also suppresses <strong>hepatic glucose output</strong> — the liver stops producing new glucose from amino acids (gluconeogenesis).' },
        { type:'high', num:'3', text: 'Blood glucose gradually falls back toward the set point. Any remaining excess is converted to fat (lipogenesis) via acetyl-CoA.' }
      ],
      eol: 'Malnourished EoL patients have severely depleted glycogen stores. If they become hypoglycaemic, the glucagon rescue response may fail — oral glucose gel or IV dextrose may be needed.'
    }
  ],
  low: [
    {
      title: 'Blood Glucose Falls',
      eyebrow: 'Low Pathway · Step 1',
      steps: [
        { type:'low', num:'1a', text: 'Blood glucose drops below the set point (~5.0 mmol/L) due to <strong>reduced food intake, prolonged fasting, intense exercise, or excess insulin</strong>.' },
        { type:'low', num:'1b', text: 'At approximately <strong>4 mmol/L</strong>, physiological responses begin. Below 3.5 mmol/L, neuroglycopenic symptoms appear (confusion, weakness, sweating).' },
        { type:'low', num:'1c', text: 'The autonomic nervous system also activates, triggering adrenaline release — the classic "hypo symptoms" of tremor, palpitations and anxiety.' }
      ],
      eol: 'At end of life, reduced food intake combined with unchanged insulin doses is the most common cause of hypoglycaemia. Proactive dose reduction as intake falls is essential. Hypo symptoms in dying patients are distressing and avoidable.'
    },
    {
      title: 'Alpha Cells Detect the Drop',
      eyebrow: 'Low Pathway · Step 2',
      steps: [
        { type:'low', num:'1', text: '<strong>Alpha cells</strong> in the Islets of Langerhans directly sense falling blood glucose via GLUT1 transporters and K-ATP channels.' },
        { type:'low', num:'2', text: 'Alpha cells secrete <strong>glucagon</strong> into the portal bloodstream. Simultaneously, beta cell insulin secretion is suppressed via paracrine somatostatin.' },
        { type:'low', num:'3', text: 'The alpha-to-beta cell ratio (~1:3.5) means glucagon release is physiologically counterbalanced in health — but disrupted in diabetes.' }
      ],
      eol: 'In Type 3c (pancreatogenic) diabetes, alpha cells are destroyed alongside beta cells — so the glucagon rescue response is absent. This makes hypoglycaemia in these patients especially dangerous and difficult to treat.'
    },
    {
      title: 'Glucagon Signals the Liver',
      eyebrow: 'Low Pathway · Step 3',
      steps: [
        { type:'low', num:'1', text: 'Glucagon binds to hepatic <strong>glucagon receptors</strong>, activating adenylate cyclase and triggering a cAMP signalling cascade.' },
        { type:'low', num:'2', text: 'This activates <strong>glycogen phosphorylase</strong> — cleaving glucose-1-phosphate from glycogen chains (glycogenolysis).' },
        { type:'low', num:'3', text: 'Glucose-1-phosphate is converted to glucose-6-phosphate, then free glucose — exported into the bloodstream within minutes.' }
      ],
      eol: 'Injectable glucagon (GlucaGen) can reverse severe hypoglycaemia when IV access is unavailable. However, it requires adequate hepatic glycogen — it is unreliable in cachectic, malnourished, or fasting EoL patients.'
    },
    {
      title: 'Glucose Released into Blood',
      eyebrow: 'Low Pathway · Step 4',
      steps: [
        { type:'low', num:'1', text: '<strong>Free glucose</strong> is exported from the liver into the hepatic vein and systemic circulation, raising blood glucose levels.' },
        { type:'low', num:'2', text: 'In prolonged hypoglycaemia, <strong>gluconeogenesis</strong> also activates — synthesising new glucose from amino acids (alanine), lactate and glycerol from fat.' },
        { type:'low', num:'3', text: 'Blood glucose rises back toward the set point. As it normalises, glucagon secretion falls and insulin secretion resumes.' }
      ],
      eol: 'If a patient has been prescribed long-acting insulin and is now not eating, the hypoglycaemia risk persists for many hours (e.g. insulin glargine acts up to 24h). Once-daily blood glucose monitoring and dose reduction are the clinical priorities.'
    }
  ]
};

function openHomeoStep(pathway, stepIdx) {
  const data = HOMEO_STEPS[pathway] && HOMEO_STEPS[pathway][stepIdx];
  if (!data) return;

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
}

function closeHomeoModal() {
  document.getElementById('homeo-modal').classList.remove('open');
}

// Legacy alias — old modal may call openHomeoModal
function openHomeoModal(key) { /* no-op for backwards compat */ }

function initHomeostasis() { /* no setup needed */ }
