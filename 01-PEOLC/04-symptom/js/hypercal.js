/* ══════════════════════════════════════════════════════════
   js/hypercal.js  ·  Hypercalcaemia click-reveal — page 6
══════════════════════════════════════════════════════════ */

function toggleHC(id) {
  const card = document.getElementById(id);
  const body = document.getElementById(id + '-body');
  const chev = document.getElementById(id + '-chev');
  if (!card || !body) return;

  const open = card.getAttribute('aria-expanded') === 'true';
  card.setAttribute('aria-expanded', open ? 'false' : 'true');
  body.classList.toggle('open', !open);
  if (chev) chev.textContent = open ? '↓' : '↑';
}
