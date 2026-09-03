/* ══════════════════════════════════════════════════════════
   landing.js — Launch screen: start the module (full screen),
   or open it in a new window/tab instead.
══════════════════════════════════════════════════════════ */

function requestAppFullscreen() {
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (!req) return;
  try {
    const result = req.call(el);
    if (result && result.catch) result.catch(() => { /* fullscreen denied/unsupported — fine, module still opens */ });
  } catch (e) { /* ignore */ }
}

function toggleFullscreen() {
  const isFs = document.fullscreenElement || document.webkitFullscreenElement;
  if (isFs) {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit) exit.call(document);
  } else {
    requestAppFullscreen();
  }
}

function startModule() {
  requestAppFullscreen();

  const landing = document.getElementById('landing-screen');
  const app = document.getElementById('module-app');
  if (landing) landing.classList.add('landing-hidden');
  if (app) app.hidden = false;

  if (typeof xapiInitialize === 'function') xapiInitialize();

  const heading = document.querySelector('#page-1 h1, #page-1 h2');
  if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
}

function openModuleInNewWindow() {
  window.open(window.location.href, '_blank', 'noopener');
}
