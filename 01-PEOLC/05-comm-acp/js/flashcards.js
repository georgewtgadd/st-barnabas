/* ══════════════════════════════════════════════════════════
   js/flashcards.js  ·  Page 4 — MCA Principles Flashcards
══════════════════════════════════════════════════════════ */

const CARDS_REQUIRED = 5;   // recommended, but no longer required to continue
let _flippedCards = new Set();
let _flashcardsDone = false;

window._flashcardsResult = null;

function flipCard(num) {
  const card = document.getElementById('flashcard-' + num);
  if (!card) return;

  card.classList.toggle('flipped');

  if (card.classList.contains('flipped')) {
    _flippedCards.add(num);
  }

  _updateFlashcardProgress();
  _checkFlashcardsDone();
}

function _updateFlashcardProgress() {
  const hint = document.getElementById('flashcard-hint');
  if (!hint) return;
  const remaining = CARDS_REQUIRED - _flippedCards.size;
  if (remaining > 0) {
    hint.textContent = 'Flip ' + remaining + ' more card' + (remaining > 1 ? 's' : '') + ' to see them all — or continue whenever you\'re ready.';
  } else {
    hint.textContent = 'All cards explored — nice work!';
  }
}

function _checkFlashcardsDone() {
  if (_flippedCards.size >= CARDS_REQUIRED && !_flashcardsDone) {
    _flashcardsDone = true;
    window._flashcardsResult = 'completed';
  }
}

document.addEventListener('pagesLoaded', () => {
  const lock = document.getElementById('flashcards-locked-msg');
  const btn  = document.getElementById('flashcards-continue-btn');
  if (lock) lock.style.display = '';
  if (btn)  btn.hidden = false; // Continue is available from the start — flipping cards is encouraged, not required
});
