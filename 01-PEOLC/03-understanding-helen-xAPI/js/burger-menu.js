/* ══════════════════════════════════════════════════════════
   burger-menu.js — Slide-out navigation drawer
══════════════════════════════════════════════════════════ */

function toggleBurgerMenu() {
  const btn = document.getElementById('burger-btn');
  const isOpen = btn && btn.getAttribute('aria-expanded') === 'true';
  if (isOpen) closeBurgerMenu(); else openBurgerMenu();
}

function openBurgerMenu() {
  const btn = document.getElementById('burger-btn');
  const drawer = document.getElementById('burger-drawer');
  const backdrop = document.getElementById('burger-backdrop');
  if (btn) btn.setAttribute('aria-expanded', 'true');
  if (drawer) drawer.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
  const closeBtn = drawer && drawer.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeBurgerMenu() {
  const btn = document.getElementById('burger-btn');
  const drawer = document.getElementById('burger-drawer');
  const backdrop = document.getElementById('burger-backdrop');
  if (btn) btn.setAttribute('aria-expanded', 'false');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  document.body.style.overflow = '';
}
