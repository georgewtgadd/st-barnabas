/* types.js — Data for the Diabetes Spectrum cards */
'use strict';

const TYPES_DATA = {
  1: {
    title: 'Type 1 Diabetes',
    tag: 'Absolute Insulin Deficiency',
    modalTag: 'Type 1',
    sections: [
      { label: 'Mechanism', body: 'An autoimmune condition where the body\'s immune system attacks and destroys the <strong>insulin-producing beta cells</strong> in the Islets of Langerhans. This leads to a total lack of endogenous insulin.' },
      { label: 'Key Features', body: 'Usually develops quickly over weeks or months. It is not related to diet or lifestyle. Without insulin, glucose cannot enter cells, leading to life-threatening ketoacidosis (DKA).' },
      { label: 'Management', body: 'Lifelong insulin therapy is essential for survival. In palliative care, insulin must be continued even if the patient is not eating, as it is required to prevent DKA.' }
    ],
    eol: 'In the final days of life, Type 1 patients still require a basal dose of insulin to prevent metabolic crisis (DKA), even if they are no longer conscious or eating.'
  },
  2: {
    title: 'Type 2 Diabetes',
    tag: 'Insulin Resistance & Relative Deficiency',
    modalTag: 'Type 2',
    sections: [
      { label: 'Mechanism', body: 'The body becomes resistant to the effects of insulin, and the pancreas eventually fails to produce enough to compensate. This is often associated with obesity and lifestyle, but genetics also play a major role.' },
      { label: 'Key Features', body: 'Develops gradually. Many people have no symptoms for years. Over time, high glucose levels damage small and large blood vessels.' },
      { label: 'Management', body: 'Management is progressive: lifestyle measures, oral or injectable non-insulin agents, and insulin when endogenous production declines. Importantly, <strong>corticosteroid therapy can unmask previously undiagnosed diabetes or markedly worsen existing Type 2 control</strong>, so active glucose monitoring is required when steroids are started.' }
    ],
    eol: 'At end of life, the focus shifts from long-term control to symptom prevention. Medications that cause hypoglycaemia (like sulphonylureas) or GI distress (like Metformin) are often reviewed and discontinued.'
  },
  3: {
    title: 'Type 3c Diabetes',
    tag: 'Pancreatogenic Diabetes',
    modalTag: 'Type 3c',
    sections: [
      { label: 'Mechanism', body: 'Type 3c arises when the <strong>exocrine pancreas is damaged</strong> by chronic pancreatitis, pancreatic cancer, cystic fibrosis, pancreatectomy or other pancreatic disorders. Destruction of the gland can reduce both insulin-producing beta cells and glucagon-producing alpha cells.' },
      { label: 'Distinguishing Features', body: 'A history of pancreatic disease, need for pancreatic enzyme replacement therapy, and <strong>erratic glucose patterns</strong> are key clues. Because glucagon secretion may also be impaired, hypoglycaemia can be severe and difficult to correct.' }
    ],
    eol: 'Type 3c is particularly important in palliative oncology. The combined loss of insulin, glucagon and digestion makes management unpredictable. As intake falls, patients may swing rapidly between hyperglycaemia and hypoglycaemia, so treatment should be simplified and closely individualised.'
  },
  4: {
    title: 'Type 4 Diabetes',
    tag: 'Age-Related Insulin Resistance',
    modalTag: 'Type 4',
    sections: [
      { label: 'Mechanism', body: 'A newly proposed classification describing <strong>insulin resistance in older, lean individuals</strong>. Unlike classic Type 2, it is not typically associated with obesity.' },
      { label: 'Research Context', body: 'While not yet a formally universal clinical diagnosis, research suggests it may be a distinct condition driven by age-related changes in the immune system (T-cell dysfunction) and metabolism rather than weight.' }
    ],
    eol: 'In older palliative patients, this phenotype explains why "non-typical" patients may still develop significant hyperglycaemia. Management should focus on comfort and avoiding the dehydration associated with high glucose.'
  },
  5: {
    title: 'Type 5 Diabetes (SIDD)',
    tag: 'Malnutrition-Related / Severe Insulin-Deficient',
    modalTag: 'Type 5 / SIDD',
    sections: [
      { label: 'Mechanism', body: 'Also known as <strong>Severe Insulin-Deficient Diabetes (SIDD)</strong> or malnutrition-related diabetes. It is a form of diabetes distinct from Type 1 and Type 2, often caused by chronic undernutrition leading to impaired pancreatic development.' },
      { label: 'Key Features', body: 'Characterised by low BMI and severe insulin deficiency without the autoimmune markers found in Type 1. It is often seen in populations with a history of nutritional deprivation.' }
    ],
    eol: 'At end of life, this group is highly vulnerable to hypoglycaemia because oral intake is low, glycogen stores are depleted and glucagon responses may be ineffective. Management should be cautious, nutrition-aware and focused on symptom prevention.'
  },
  6: {
    title: 'Monogenic Diabetes (MODY)',
    tag: 'Single Gene Mutation',
    modalTag: 'MODY',
    sections: [
      { label: 'Mechanism', body: '<strong>Maturity Onset Diabetes of the Young (MODY)</strong> is caused by a mutation in a single gene. It is hereditary and usually diagnosed before age 25.' },
      { label: 'Clinical Clues', body: 'It is often misdiagnosed as Type 1 or Type 2. A strong family history of diabetes across multiple generations is a major clue. Depending on the gene affected, it may not require insulin.' }
    ],
    eol: 'Understanding a patient has MODY can help simplify treatment at end of life, as some forms respond very well to low-dose oral medications rather than complex insulin regimens.'
  }
};
