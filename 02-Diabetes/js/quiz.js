/* quiz.js — 5-question knowledge check */
'use strict';

const QUIZ_DATA = [
  {
    q: 'According to NICE guidelines, what is the post-prandial (at least 90 minutes after meals) target for a person with Type 2 Diabetes?',
    options: ['Under 7.8 mmol/L', 'Under 8.5 mmol/L', '5 to 9 mmol/L'],
    correct: 1,
    feedback: {
      correct: 'Correct! The NICE post-prandial target for Type 2 Diabetes is under 8.5 mmol/L. Note that under 7.8 mmol/L is the reference figure for non-diabetics, and 5–9 mmol/L is the target for Type 1 Diabetes.',
      wrong: 'Not quite. The NICE post-prandial target for Type 2 Diabetes is <strong>under 8.5 mmol/L</strong>. Under 7.8 mmol/L is the non-diabetic reference figure, while 5–9 mmol/L applies to Type 1 Diabetes.'
    }
  },
  {
    q: 'A lean, older patient presents with insulin resistance that is not associated with obesity. Which type of diabetes does research suggest this might be?',
    options: ['Type II', 'Type 3c', 'Type IV'],
    correct: 2,
    feedback: {
      correct: 'Correct! Type IV diabetes describes insulin resistance in older, lean individuals where the typical obesity-associated pathway does not apply. Research suggests immune-mediated mechanisms — specifically senescent T-cells — may drive this form.',
      wrong: 'Not quite. The answer is <strong>Type IV</strong> — a recently proposed classification describing insulin resistance in older, lean individuals not associated with obesity. This is distinct from Type 2, which is typically linked to excess adipose tissue.'
    }
  },
  {
    q: 'Which hormone is responsible for the "lock and key" action that allows glucose to enter body cells for energy?',
    options: ['Glucagon', 'Insulin', 'Somatostatin'],
    correct: 1,
    feedback: {
      correct: 'Correct! Insulin is the "key" that binds to receptors on cell membranes, triggering translocation of GLUT4 glucose transporters — effectively unlocking the cell to allow glucose entry for energy (ATP) production.',
      wrong: 'Not quite. The answer is <strong>insulin</strong>. Glucagon has the opposite effect — raising blood glucose. Somatostatin regulates other islet cells. Insulin is the hormone that unlocks cells to allow glucose entry.'
    }
  },
  {
    q: 'A patient with a history of chronic pancreatitis now requires both insulin and pancreatic enzyme replacement therapy. Which type of diabetes is most likely?',
    options: ['Type I', 'Type 3c', 'Type V'],
    correct: 1,
    feedback: {
      correct: 'Correct! Type 3c (pancreatogenic diabetes) arises from damage to the exocrine pancreas — such as chronic pancreatitis — which simultaneously destroys the Islets of Langerhans, causing insulin deficiency. Pancreatic enzyme replacement (PERT) is required for the exocrine insufficiency.',
      wrong: 'Not quite. The answer is <strong>Type 3c</strong> (pancreatogenic diabetes). Chronic pancreatitis damages the exocrine pancreas and the adjacent Islets of Langerhans, causing both insulin deficiency and exocrine insufficiency — hence the need for both insulin and PERT.'
    }
  },
  {
    q: 'Which hormone, often released during stress, rapidly increases blood glucose to provide immediate energy?',
    options: ['Adrenaline', 'Cortisol', 'Glycogen'],
    correct: 0,
    feedback: {
      correct: 'Correct! Adrenaline (epinephrine), released from the adrenal medulla in response to acute stress, rapidly mobilises glucose to fuel the fight-or-flight response. In EoL care, pain and agitation can trigger adrenaline surges, causing unwanted glucose spikes in diabetic patients.',
      wrong: 'Not quite. The answer is <strong>Adrenaline</strong>. While cortisol also raises blood glucose, it acts more slowly over hours to days. Glycogen is not a hormone — it is the stored form of glucose in the liver. Adrenaline is the rapid-acting stress hormone.'
    }
  }
];

const quizAnswers = {};

function renderQuiz() {
  const wrap = document.getElementById('quiz-wrap');
  if (!wrap) return;
  wrap.innerHTML = QUIZ_DATA.map((q, i) => `
    <div class="quiz-q" id="qq-${i}" role="group" aria-labelledby="qtext-${i}">
      <div class="qnum">Question ${i + 1} of ${QUIZ_DATA.length}</div>
      <div class="qtext" id="qtext-${i}">${q.q}</div>
      <div class="q-options" id="qopts-${i}">
        ${q.options.map((opt, j) => `
          <button class="q-option" id="qopt-${i}-${j}"
                  onclick="selectAnswer(${i},${j})"
                  aria-label="Option ${String.fromCharCode(65+j)}: ${opt}">
            <div class="opt-letter">${String.fromCharCode(65 + j)}</div>
            <span>${opt}</span>
          </button>`).join('')}
      </div>
      <div class="q-feedback" id="qfb-${i}" style="display:none;"></div>
    </div>`).join('') +
    `<div class="quiz-results" id="quiz-results" style="display:none;">
      <div class="qr-score-wrap">
        <div class="qr-score" id="qr-score">0</div>
        <div class="qr-denom">out of ${QUIZ_DATA.length}</div>
        <div class="qr-pct" id="qr-pct"></div>
      </div>
      <div class="qr-badge" id="qr-badge"></div>
      <div class="qr-message" id="qr-message"></div>
    </div>`;
}

function selectAnswer(qIdx, optIdx) {
  if (quizAnswers[qIdx] !== undefined) return; // already answered
  quizAnswers[qIdx] = optIdx;

  const q    = QUIZ_DATA[qIdx];
  const isCorrect = optIdx === q.correct;
  const card = document.getElementById('qq-' + qIdx);
  const fb   = document.getElementById('qfb-' + qIdx);

  // Style all options
  q.options.forEach((_, j) => {
    const btn = document.getElementById('qopt-' + qIdx + '-' + j);
    if (btn) {
      btn.disabled = true;
      if (j === q.correct) btn.classList.add('correct');
      else if (j === optIdx && !isCorrect) btn.classList.add('incorrect');
    }
  });

  // Feedback
  if (fb) {
    fb.style.display = 'flex';
    fb.className = 'q-feedback ' + (isCorrect ? 'correct-fb' : 'wrong-fb');
    fb.innerHTML = (isCorrect ? '✅ ' : '❌ ') + (isCorrect ? q.feedback.correct : q.feedback.wrong);
  }
  if (card) card.classList.add(isCorrect ? 'answered-correct' : 'answered-wrong');

  // Check if all answered
  if (Object.keys(quizAnswers).length === QUIZ_DATA.length) showResults();
}

function showResults() {
  const score = QUIZ_DATA.reduce((s, q, i) => s + (quizAnswers[i] === q.correct ? 1 : 0), 0);
  const pct   = Math.round((score / QUIZ_DATA.length) * 100);
  const pass  = pct >= 80;

  const res    = document.getElementById('quiz-results');
  const sc     = document.getElementById('qr-score');
  const pctEl  = document.getElementById('qr-pct');
  const badge  = document.getElementById('qr-badge');
  const msg    = document.getElementById('qr-message');
  const nav    = document.getElementById('quiz-nav');

  if (sc)    sc.textContent    = score;
  if (pctEl) pctEl.textContent = pct + '% score';
  if (badge) { badge.textContent = pass ? '🎉 Passed' : '📚 Review Recommended'; badge.className = 'qr-badge ' + (pass ? 'pass' : 'fail'); }
  if (msg)   msg.textContent   = pass
    ? 'Well done! You have demonstrated a solid understanding of EoL diabetes management concepts. Proceed to your Learning Record.'
    : 'You scored ' + score + ' out of ' + QUIZ_DATA.length + '. Review the relevant sections and revisit the quiz if you wish. You can still proceed to your Learning Record.';
  if (res)   res.style.display = 'block';
  if (nav)   nav.style.display = 'flex';

  // Store for learning record
  window._quizScore    = score;
  window._quizPct      = pct;
  window._quizPassed   = pass;
  window._quizAnswers  = { ...quizAnswers };
}
