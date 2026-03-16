/* dose-adjust.js — Type 1 insulin dose adjustment simulator */
'use strict';

const INTAKE_LABELS  = ['Nothing — nil by mouth', 'Sips of water only', 'Very little — bites/sips', 'Half meals', 'Full meals (100%)'];
const CONSCIOUS_LABELS = ['Unconscious / unresponsive', 'Minimal response to voice', 'Drowsy but rousable', 'Fully alert and orientated'];

const DOSE_MATRIX = [
  // [intake 0-4][conscious 0-3] → { basal, bolus, notes, warning }
  // intake=0 (nothing)
  [
    { basal: 'Stop basal', bolus: 'Stop all bolus', level: 'critical', notes: 'Patient is unconscious and not eating. Insulin cannot be given safely. Seek urgent specialist advice. Consider whether ongoing insulin aligns with the care plan.', warning: 'Do NOT administer insulin to an unconscious patient without specialist guidance.' },
    { basal: 'Reduce by 50%', bolus: 'Stop all bolus', level: 'danger', notes: 'Minimal consciousness, nil intake. Basal should be significantly reduced to prevent hypoglycaemia. Bolus insulin has no role without food. Urgent specialist review required.', warning: 'Hypo risk is extreme — monitor closely.' },
    { basal: 'Reduce by 40–50%', bolus: 'Stop all bolus', level: 'danger', notes: 'Drowsy and not eating. No bolus insulin. Reduce basal substantially. Retest glucose 4–6 hourly or as tolerated.', warning: 'Nil intake with unchanged basal carries high hypo risk.' },
    { basal: 'Reduce by 30–40%', bolus: 'Stop all bolus', level: 'amber', notes: 'Alert but eating nothing. Stop bolus doses entirely. Reduce basal to minimum required to prevent ketoacidosis. Review daily.', warning: 'Ensure basal is not stopped entirely — DKA risk in Type 1.' },
  ],
  // intake=1 (sips only)
  [
    { basal: 'Stop basal', bolus: 'Stop all bolus', level: 'critical', notes: 'Unconscious with only occasional sips. Insulin administration is not safe. Seek specialist advice urgently.', warning: 'Never give insulin to an unconscious patient without specialist guidance.' },
    { basal: 'Reduce by 40%', bolus: 'Stop all bolus', level: 'danger', notes: 'Sips only, minimal responsiveness. Significant basal reduction required. No bolus insulin. Seek diabetology input.', warning: '' },
    { basal: 'Reduce by 30–40%', bolus: 'Stop all bolus', level: 'amber', notes: 'Drowsy, sips only. Bolus insulin is not appropriate. Reduce basal dose to prevent hypo while maintaining protection against DKA.', warning: '' },
    { basal: 'Reduce by 20–30%', bolus: 'Stop all bolus', level: 'amber', notes: 'Alert but taking only sips — no carbohydrates to cover. Stop all bolus doses. Reduce basal by 20–30%. Review glucose and dose daily.', warning: '' },
  ],
  // intake=2 (very little)
  [
    { basal: 'Stop basal', bolus: 'Stop all bolus', level: 'critical', notes: 'Unconscious — cannot safely receive insulin. Specialist advice required urgently.', warning: '' },
    { basal: 'Reduce by 30%', bolus: 'Reduce to 0–2 units per meal', level: 'danger', notes: 'Minimal consciousness, very little intake. Major basal reduction. Minimal bolus only if patient takes meaningful food.', warning: '' },
    { basal: 'Reduce by 20–30%', bolus: 'Reduce to 2–4 units per meal', level: 'amber', notes: 'Drowsy, eating very little. Reduce basal meaningfully. Small bolus doses only with actual food consumption. Monitor closely.', warning: '' },
    { basal: 'Reduce by 20%', bolus: 'Reduce to half usual bolus', level: 'amber', notes: 'Alert but eating very little. Reduce basal by ~20%. Halve bolus doses and only give with food. Daily glucose review.', warning: '' },
  ],
  // intake=3 (half meals)
  [
    { basal: 'Stop basal', bolus: 'Stop all bolus', level: 'critical', notes: 'Unconscious — insulin cannot be given safely regardless of oral intake.', warning: '' },
    { basal: 'Reduce by 20%', bolus: 'Reduce to 50% of usual', level: 'amber', notes: 'Eating half meals but poorly responsive. Meaningful dose reduction. Monitor glucose 4-hourly.', warning: '' },
    { basal: 'Reduce by 10–20%', bolus: 'Reduce to 50–75% of usual', level: 'amber', notes: 'Drowsy but eating half portions. Modest basal reduction, reduced bolus aligned with actual intake.', warning: '' },
    { basal: 'Reduce by 10%', bolus: 'Reduce to 70–80% of usual', level: 'safe', notes: 'Alert and eating half meals. Modest dose reductions to reflect reduced carbohydrate intake. Review weekly or if intake changes.', warning: '' },
  ],
  // intake=4 (full meals)
  [
    { basal: 'Stop basal', bolus: 'Stop all bolus', level: 'critical', notes: 'Unconscious — insulin cannot be given safely.', warning: '' },
    { basal: 'Reduce by 10%', bolus: 'Usual dose with caution', level: 'amber', notes: 'Eating full meals but poorly responsive — unusual combination. Seek specialist input. Close monitoring essential.', warning: '' },
    { basal: 'Slight reduction', bolus: 'Usual dose', level: 'safe', notes: 'Drowsy but eating well — may reflect post-prandial state or natural fluctuation. Continue usual doses with close monitoring.', warning: '' },
    { basal: 'Usual dose', bolus: 'Usual dose', level: 'safe', notes: 'Alert and eating full meals normally. Maintain usual insulin regimen with regular glucose monitoring. Reassess as clinical status changes.', warning: '' },
  ],
];

function initDoseSim() {
  updateDoseSim();
}

function updateDoseSim() {
  const intake    = parseInt(document.getElementById('intake-slider')?.value ?? 4);
  const conscious = parseInt(document.getElementById('conscious-slider')?.value ?? 3);

  const il = document.getElementById('intake-label');
  const cl = document.getElementById('conscious-label');
  if (il) il.textContent = INTAKE_LABELS[intake];
  if (cl) cl.textContent = CONSCIOUS_LABELS[conscious];

  const rec = DOSE_MATRIX[intake][conscious];
  const colours = { critical: '#ef4444', danger: '#f97316', amber: '#fdca0f', safe: '#22c55e' };
  const bgColours = { critical: 'rgba(239,68,68,0.1)', danger: 'rgba(249,115,22,0.1)', amber: 'rgba(253,202,15,0.08)', safe: 'rgba(34,197,94,0.08)' };
  const borderColours = { critical: 'rgba(239,68,68,0.4)', danger: 'rgba(249,115,22,0.4)', amber: 'rgba(253,202,15,0.3)', safe: 'rgba(34,197,94,0.3)' };
  const levelLabels = { critical: '🔴 Critical — Specialist Required', danger: '🟠 High Risk — Urgent Review', amber: '🟡 Caution — Close Monitoring', safe: '🟢 Standard Adjustment' };

  const out = document.getElementById('dose-output');
  if (out) {
    out.innerHTML = `
      <div style="background:${bgColours[rec.level]};border:2px solid ${borderColours[rec.level]};border-radius:14px;padding:22px 24px;">
        <div style="font-size:0.68rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${colours[rec.level]};margin-bottom:12px;">${levelLabels[rec.level]}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px;">
          <div style="background:rgba(0,0,0,0.2);border-radius:10px;padding:14px 16px;">
            <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--teal);margin-bottom:6px;">Basal Insulin</div>
            <div style="font-family:'Merriweather',serif;font-size:1rem;font-weight:700;color:var(--white);">${rec.basal}</div>
          </div>
          <div style="background:rgba(0,0,0,0.2);border-radius:10px;padding:14px 16px;">
            <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--teal);margin-bottom:6px;">Bolus Insulin</div>
            <div style="font-family:'Merriweather',serif;font-size:1rem;font-weight:700;color:var(--white);">${rec.bolus}</div>
          </div>
        </div>
        <p style="font-size:0.86rem;color:var(--text-muted);line-height:1.7;">${rec.notes}</p>
        ${rec.warning ? `<div style="margin-top:12px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:10px 14px;font-size:0.82rem;color:#fca5a5;font-weight:600;">⚠️ ${rec.warning}</div>` : ''}
      </div>`;
  }

  const rat = document.getElementById('dose-rationale');
  if (rat) {
    rat.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:4px;">
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 18px;">
          <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--teal);margin-bottom:8px;">Why reduce the basal?</div>
          <p style="font-size:0.82rem;color:var(--text-muted);line-height:1.65;">As intake falls, the hepatic glucose output that basal insulin counters also falls. An unchanged basal dose will cause progressive hypoglycaemia — especially overnight.</p>
        </div>
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 18px;">
          <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--teal);margin-bottom:8px;">Why stop the bolus?</div>
          <p style="font-size:0.82rem;color:var(--text-muted);line-height:1.65;">Bolus insulin covers post-meal glucose rises. If there is no meaningful carbohydrate intake, giving bolus insulin causes hypoglycaemia without any physiological purpose.</p>
        </div>
      </div>`;
  }
}
