/* ══════════════════════════════════════════════════════════
   intro.js — Page 1: gate "Continue" until the intro video
   has been watched (mirrors the lock pattern used on the
   hotspot and pillars activities).
══════════════════════════════════════════════════════════ */

function unlockIntroContinue() {
  const btn = document.getElementById('intro-continue-btn');
  const msg = document.getElementById('intro-locked-msg');
  const badge = document.querySelector('.video-required-badge');

  if (btn && btn.disabled) {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';
    btn.setAttribute('aria-label', 'Continue to Her Profile');

    // Report to the LRS, if one is present (see js/xapi-wrapper.js)
    if (typeof xapiSendExperienced === 'function') {
      xapiSendExperienced('video/intro', "Helen's Introduction Video", "Helen introduces herself and shares what matters most to her.");
    }
  }
  if (msg) {
    msg.innerHTML = '<span aria-hidden="true">✅</span><span>Video watched — you may continue</span>';
    msg.style.color = '#6ee7b7';
  }
  if (badge) {
    badge.textContent = 'Watched';
    badge.classList.add('done');
  }
}

function initIntroVideoGate() {
  const vid = document.getElementById('intro-video');
  if (!vid) return;

  vid.addEventListener('ended', unlockIntroContinue);

  // Fallback: also unlock if the learner scrubs to near the very end,
  // so re-visiting the page and skipping to the end isn't a dead end.
  vid.addEventListener('timeupdate', () => {
    if (vid.duration && vid.currentTime / vid.duration >= 0.97) {
      unlockIntroContinue();
    }
  });
}
