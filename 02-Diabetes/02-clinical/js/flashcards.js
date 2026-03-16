/* flashcards.js — flip card activity */
'use strict';

function flipCard(id) {
  const card = document.getElementById('fc-' + id);
  if (!card) return;
  card.classList.toggle('flipped');
  const isFlipped = card.classList.contains('flipped');
  card.setAttribute('aria-label', isFlipped ? 'Card flipped — showing answer. Click to flip back.' : 'Click to reveal answer');
}

function resetFlashcards() {
  document.querySelectorAll('.flashcard').forEach(card => {
    card.classList.remove('flipped');
    card.setAttribute('aria-label', 'Click to reveal answer');
  });
}
