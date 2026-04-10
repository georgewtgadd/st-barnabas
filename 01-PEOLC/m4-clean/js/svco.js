/* ══════════════════════════════════════════════════════════
   js/svco.js  ·  SVCO image diagram hotspots — page 8
══════════════════════════════════════════════════════════ */

function showSVCO(num) {
  document.querySelectorAll('.svco-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('svco-' + num);
  if (panel) panel.classList.add('active');
}
