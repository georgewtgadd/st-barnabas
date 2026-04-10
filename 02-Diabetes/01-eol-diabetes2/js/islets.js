/* islets.js — Beta cell slider and donut chart */
'use strict';

const DONUT_SEGMENTS = [
  { id: 'alpha',  pct: 20, color: 'rgba(249,115,22,0.85)',  label: 'Alpha' },
  { id: 'beta',   pct: 70, color: 'rgba(0,168,142,0.9)',    label: 'Beta' },
  { id: 'delta',  pct:  5, color: 'rgba(124,110,245,0.8)',  label: 'Delta' },
  { id: 'fcell',  pct:  5, color: 'rgba(253,202,15,0.75)',  label: 'F' }
];

function drawDonut(betaPct) {
  const svg = document.getElementById('islet-donut-svg');
  if (!svg) return;

  const remaining = 100 - betaPct;
  const otherThree = [
    { color: 'rgba(249,115,22,0.85)', pct: 20 },
    { color: 'rgba(124,110,245,0.8)', pct: 5 },
    { color: 'rgba(253,202,15,0.75)', pct: 5 }
  ];
  // Scale others to fill remaining
  const scale = remaining / 30;
  const scaled = otherThree.map(s => ({ ...s, pct: s.pct * scale }));
  const segments = [{ color: 'rgba(0,168,142,0.9)', pct: betaPct }, ...scaled];

  const cx = 60, cy = 60, r = 46, inner = 32;
  let startAngle = -90;
  let paths = '';

  segments.forEach(seg => {
    const angle = (seg.pct / 100) * 360;
    const endAngle = startAngle + angle;
    const s = polarToXY(cx, cy, r, startAngle);
    const e = polarToXY(cx, cy, r, endAngle);
    const si = polarToXY(cx, cy, inner, startAngle);
    const ei = polarToXY(cx, cy, inner, endAngle);
    const large = angle > 180 ? 1 : 0;
    paths += `<path d="M${s.x},${s.y} A${r},${r} 0 ${large},1 ${e.x},${e.y} L${ei.x},${ei.y} A${inner},${inner} 0 ${large},0 ${si.x},${si.y} Z" fill="${seg.color}" stroke="rgba(0,0,0,0.3)" stroke-width="1.5"/>`;
    startAngle = endAngle;
  });

  svg.innerHTML = paths;
}

function polarToXY(cx, cy, r, angle) {
  const rad = (angle * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function updateIslets(val) {
  const betaPct = parseInt(val, 10);

  // Slider display
  const disp = document.getElementById('slider-val-display');
  if (disp) disp.textContent = betaPct + '%';

  // Donut centre
  const dcVal = document.getElementById('dc-beta-val');
  if (dcVal) dcVal.textContent = betaPct + '%';

  // Beta cell card percentage
  const pctBeta = document.getElementById('pct-beta');
  if (pctBeta) pctBeta.textContent = betaPct + '%';

  // Redraw donut
  drawDonut(betaPct);

  // Card state
  const betaCard = document.getElementById('islet-beta');
  const warning  = document.getElementById('beta-warning');

  if (betaPct < 30) {
    if (betaCard) betaCard.classList.add('deficient');
    if (warning)  warning.hidden = false;
  } else {
    if (betaCard) betaCard.classList.remove('deficient');
    if (warning)  warning.hidden = true;
  }

  // Status panel
  const isNormal   = document.getElementById('is-normal');
  const isWarning  = document.getElementById('is-warning');
  const isCritical = document.getElementById('is-critical');
  if (betaPct >= 70) {
    if (isNormal)   isNormal.hidden   = false;
    if (isWarning)  isWarning.hidden  = true;
    if (isCritical) isCritical.hidden = true;
  } else if (betaPct >= 30) {
    if (isNormal)   isNormal.hidden   = true;
    if (isWarning)  isWarning.hidden  = false;
    if (isCritical) isCritical.hidden = true;
  } else {
    if (isNormal)   isNormal.hidden   = true;
    if (isWarning)  isWarning.hidden  = true;
    if (isCritical) isCritical.hidden = false;
  }
}

function initIslets() {
  drawDonut(70);
}
