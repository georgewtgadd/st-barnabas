/* ══════════════════════════════════════════════════════════
   TIMELINE — Page 4
   js/timeline.js
══════════════════════════════════════════════════════════ */

function showPhase(phase) {
  ['months', 'days', 'hours'].forEach(function (p) {
    var node    = document.getElementById('htl-' + p);
    var content = document.getElementById('htl-content-' + p);
    if (node)    { node.classList.remove('active');    node.setAttribute('aria-pressed', 'false'); }
    if (content) { content.classList.remove('active'); }
  });
  var node    = document.getElementById('htl-' + phase);
  var content = document.getElementById('htl-content-' + phase);
  if (node)    { node.classList.add('active');    node.setAttribute('aria-pressed', 'true'); }
  if (content) { content.classList.add('active'); }
}


/* ══════════════════════════════════════════════════════════
   TRAJECTORIES OF DYING — Page 6
   js/trajectories.js
══════════════════════════════════════════════════════════ */

function showTraj(traj) {
  document.querySelectorAll('.traj-select-btn').forEach(function (b) {
    b.classList.remove('active-cancer', 'active-organ', 'active-frailty');
    b.setAttribute('aria-pressed', 'false');
  });
  document.querySelectorAll('.traj-detail').forEach(function (d) {
    d.classList.remove('active');
  });

  var btn = document.getElementById('tbtn-' + traj);
  var det = document.getElementById('tdet-' + traj);
  var cls = traj === 'cancer' ? 'active-cancer' : traj === 'organ' ? 'active-organ' : 'active-frailty';

  if (btn) { btn.classList.add(cls); btn.setAttribute('aria-pressed', 'true'); }
  if (det) { det.classList.add('active'); }
}


/* ══════════════════════════════════════════════════════════
   FIVE PRIORITIES FLIPCARDS — Page 7
   js/flipcards.js
══════════════════════════════════════════════════════════ */

function flipCard(card) {
  card.classList.toggle('flipped');
  var flipped = card.classList.contains('flipped');
  var lbl = card.getAttribute('aria-label') || '';
  card.setAttribute(
    'aria-label',
    lbl.replace(/ — click to flip.*$/, '') + (flipped ? ' — click to flip back' : ' — click to flip')
  );
}
