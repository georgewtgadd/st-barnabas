/* main.js — Initialise all components after pagesLoaded */
'use strict';

document.addEventListener('pagesLoaded', function () {

  // ── Navigation: show page 1 and unlock nav step 2
  goToPage(1);
  const nav2 = document.getElementById('nav-2');
  if (nav2) nav2.disabled = false;

  // ── Energy equation
  initEnergy();

  // ── Islets slider
  initIslets();

  // ── Hormones elevator
  initHormones();

  // ── Quiz
  renderQuiz();

  // Expose quiz data for record.js
  window._quizDataRef = typeof QUIZ_DATA !== 'undefined' ? QUIZ_DATA : [];

  // ── Learning record — populate on navigate to page 11
  const _origGoToPage = window.goToPage;
  window.goToPage = function (n) {
    _origGoToPage(n);
    if (n === 11) populateRecord();
  };

  // ── Modal: Homeostasis — close on backdrop click
  const homeoModal = document.getElementById('homeo-modal');
  if (homeoModal) {
    homeoModal.addEventListener('click', function (e) {
      if (e.target === homeoModal) closeHomeoModal();
    });
    homeoModal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeHomeoModal();
    });
  }

  // ── Modal: Type — close on backdrop click
  const typeModal = document.getElementById('type-modal');
  if (typeModal) {
    typeModal.addEventListener('click', function (e) {
      if (e.target === typeModal) closeTypeModal();
    });
    typeModal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeTypeModal();
    });
  }

  // ── Modal: Dilemma — close on backdrop click
  const dilemmaModal = document.getElementById('dilemma-modal');
  if (dilemmaModal) {
    dilemmaModal.addEventListener('click', function (e) {
      if (e.target === dilemmaModal) closeDilemmaModal();
    });
    dilemmaModal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDilemmaModal();
    });
  }

});

// ── Dilemma modal controls
function openDilemmaModal() {
  const modal     = document.getElementById('dilemma-modal');
  const panel     = document.getElementById('dm-learner-panel');
  const textEl    = document.getElementById('dm-learner-text');
  const textarea  = document.getElementById('dilemma-reflection');

  if (textarea && textEl && panel) {
    const val = textarea.value.trim();
    if (val) {
      textEl.textContent = val;
      panel.style.display = 'block';
    } else {
      panel.style.display = 'none';
    }
  }

  modal.classList.add('open');
}
function closeDilemmaModal() {
  document.getElementById('dilemma-modal').classList.remove('open');
}
