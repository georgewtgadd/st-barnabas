/* ══════════════════════════════════════════════════════════
   video-modal.js — Scene 2 video modal open / close
══════════════════════════════════════════════════════════ */

function openVideoModal() {
  const modal = document.getElementById('video-modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  const vid = document.getElementById('modal-video');
  if (vid) vid.play().catch(() => {});
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeVideoModal() {
  const modal = document.getElementById('video-modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  const vid = document.getElementById('modal-video');
  if (vid) { vid.pause(); vid.currentTime = 0; }
}
