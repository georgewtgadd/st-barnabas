/* hormones.js — Glucose Elevator simulation */
'use strict';

let glucoseLevel = 5.8; // mmol/L

const ELEVATOR_ACTIONS = {
  adrenaline: {
    delta: +3.5,
    label: 'Adrenaline surge',
    risk: 'Risk: acute stress, pain and agitation can drive transient hyperglycaemia. Treating the underlying trigger is often just as important as reacting to the glucose reading.'
  },
  cortisol: {
    delta: +4.0,
    label: 'Corticosteroid given',
    risk: 'Risk: steroid therapy can unmask previously undiagnosed diabetes or worsen established diabetes. When steroids are started, glucose should be monitored and treatment actively adjusted to prevent symptomatic hyperglycaemia.'
  },
  insulin: {
    delta: -3.2,
    label: 'Insulin released',
    risk: 'Physiology: beta-cell insulin release helps glucose enter tissues and suppresses hepatic glucose output. Excess replacement, however, can cause hypoglycaemia if intake is poor.'
  },
  glycogen: {
    delta: +2.8,
    label: 'Glucagon released',
    risk: 'Note: glucagon raises blood glucose by mobilising liver glycogen. In malnutrition, cachexia or advanced pancreatic disease, this counter-regulatory response may be weak or ineffective.'
  }
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
