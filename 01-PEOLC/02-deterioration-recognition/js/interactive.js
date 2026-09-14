/* ══════════════════════════════════════════════════════════
   TIMELINE — Page 4
   js/timeline.js
══════════════════════════════════════════════════════════ */

var viewedPhases = new Set(['months']); // 'months' is shown by default

function showPhase(phase) {
  viewedPhases.add(phase);
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

  if (typeof XAPI !== 'undefined') XAPI.experienced('timeline/' + phase, 'Palliative Care Timeline — ' + phase);

  if (viewedPhases.size === 3) unlockTimelineContinue();
}

function unlockTimelineContinue() {
  var btn  = document.getElementById('timeline-continue-btn');
  var hint = document.getElementById('timeline-gate-nudge');
  if (btn)  { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
  if (hint) { hint.textContent = '✓ All three phases explored'; hint.classList.add('done'); }
}


/* ══════════════════════════════════════════════════════════
   TRAJECTORIES OF DYING — Page 6
   js/trajectories.js
══════════════════════════════════════════════════════════ */

var viewedTrajs = new Set(['cancer']); // 'cancer' is shown by default

function showTraj(traj) {
  viewedTrajs.add(traj);
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

  if (typeof XAPI !== 'undefined') XAPI.experienced('trajectories/' + traj, 'Trajectories of Dying — ' + traj);

  if (viewedTrajs.size === 3) unlockTrajContinue();
}

function unlockTrajContinue() {
  var btn  = document.getElementById('traj-continue-btn');
  var hint = document.getElementById('traj-gate-nudge');
  if (btn)  { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
  if (hint) { hint.textContent = '✓ All three trajectories explored'; hint.classList.add('done'); }
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
