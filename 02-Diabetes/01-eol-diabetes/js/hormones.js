/* hormones.js — Glucose Elevator simulation */
'use strict';

let glucoseLevel = 5.8; // mmol/L

const ELEVATOR_ACTIONS = {
  adrenaline: { delta: +3.5, label: 'Adrenaline injected', risk: 'Risk: Sustained high levels accelerate diabetic complications and increase cardiovascular stress. In EoL care, agitation and pain should be treated aggressively to prevent adrenaline-driven glucose spikes.' },
  cortisol:   { delta: +4.0, label: 'Corticosteroid given', risk: 'Risk: Steroid-induced hyperglycaemia is common in palliative care. Monitor glucose when starting steroids and consider low-dose insulin if levels exceed 15 mmol/L with symptoms.' },
  insulin:    { delta: -3.2, label: 'Insulin released', risk: '' },
  glycogen:   { delta: +2.8, label: 'Glycogen mobilised (glucagon ↑)', risk: 'Note: In malnourished EoL patients, glycogen stores may be depleted — making this response unreliable. Glucagon treatment for hypo may be ineffective.' }
};

function elevatorAction(type) {
  const action = ELEVATOR_ACTIONS[type];
  if (!action) return;
  glucoseLevel = Math.max(0.5, Math.min(20, glucoseLevel + action.delta));
  renderElevator(action.label, action.risk);
}

function resetElevator() {
  glucoseLevel = 5.8;
  renderElevator('Reset to normal', '');
}

function renderElevator(lastAction, risk) {
  const lvl = glucoseLevel;
  const MAX_VAL = 15;
  const pct = Math.min(100, Math.max(2, (lvl / MAX_VAL) * 100));

  const fill   = document.getElementById('elevator-fill');
  const marker = document.getElementById('elevator-marker');
  const emVal  = document.getElementById('em-value');
  const status = document.getElementById('eip-status');
  const last   = document.getElementById('eip-last');
  const riskEl = document.getElementById('eip-risk');

  if (fill)   fill.style.height = pct + '%';
  if (marker) marker.style.bottom = pct + '%';
  if (emVal)  emVal.textContent = lvl.toFixed(1);
  if (last)   last.textContent = lastAction;
  if (riskEl) riskEl.textContent = risk;

  let statusText = 'Normal Range';
  let fillColor = 'linear-gradient(0deg, rgba(34,197,94,0.5) 0%, rgba(0,197,220,0.3) 100%)';

  if (lvl < 4) {
    statusText = '⚠️ Hypoglycaemia';
    fillColor = 'linear-gradient(0deg, rgba(239,68,68,0.6) 0%, rgba(220,38,38,0.4) 100%)';
  } else if (lvl >= 4 && lvl < 7) {
    statusText = '✅ Normal Range';
    fillColor = 'linear-gradient(0deg, rgba(34,197,94,0.5) 0%, rgba(0,197,220,0.3) 100%)';
  } else if (lvl >= 7 && lvl < 12) {
    statusText = '⚠️ Hyperglycaemia';
    fillColor = 'linear-gradient(0deg, rgba(249,115,22,0.5) 0%, rgba(253,202,15,0.3) 100%)';
  } else {
    statusText = '🔴 Severe Hyperglycaemia / DKA Risk';
    fillColor = 'linear-gradient(0deg, rgba(220,38,38,0.7) 0%, rgba(239,68,68,0.4) 100%)';
  }

  if (status) status.textContent = statusText;
  if (fill)   fill.style.background = fillColor;
}

function initHormones() {
  renderElevator('Use the buttons to simulate hormone effects', '');
}
