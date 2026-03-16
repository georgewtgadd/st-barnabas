/* ══════════════════════════════════════════════════════════
   navigation.js — Page navigation, progress bar, nav steps
══════════════════════════════════════════════════════════ */

const visited = new Set([1]);
const TOTAL_PAGES = 7;

function updateProgressBar(num) {
  const pct = Math.round(((num - 1) / (TOTAL_PAGES - 1)) * 100);
  const fill  = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');
  if (fill)  fill.style.width = pct + '%';
  if (label) label.textContent = pct + '% complete';
}

function goToPage(num) {
  visited.add(num);

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(`page-${num}`);
  if (page) page.classList.add('active');

  // Update nav steps
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    const step = document.getElementById(`nav-${i}`);
    if (!step) continue;
    step.classList.remove('current', 'done');
    step.removeAttribute('aria-current');

    if (i === num) {
      step.classList.add('current');
      step.setAttribute('aria-current', 'step');
      step.disabled = false;
    } else if (visited.has(i)) {
      step.classList.add('done');
      step.disabled = false;
    } else {
      step.disabled = true;
    }
  }

  updateProgressBar(num);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Show floating notes button only on page 7
  document.body.classList.toggle('acp-notes-visible', num === 7);

  // Move focus to heading for screen readers
  const heading = page && page.querySelector('h1, h2');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }
}

// Only navigate to pages already visited
function navClick(num) {
  if (visited.has(num)) goToPage(num);
}
