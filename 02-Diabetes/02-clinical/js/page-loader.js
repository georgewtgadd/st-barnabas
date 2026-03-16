/* page-loader.js */
'use strict';
(function () {
  const PAGES = [
    'pages/page-01-outcomes.html',
    'pages/page-02-priorities.html',
    'pages/page-03-targets.html',
    'pages/page-04-medication.html',
    'pages/page-05-cleanout.html',
    'pages/page-06-hypo.html',
    'pages/page-07-hyper.html',
    'pages/page-08-flashcards.html',
    'pages/page-09-type1.html',
    'pages/page-10-quiz.html',
  ];
  const main = document.querySelector('main');
  Promise.all(PAGES.map(url => fetch(url).then(r => { if (!r.ok) throw new Error('Failed: ' + url); return r.text(); })))
    .then(htmls => {
      htmls.forEach(html => { const d = document.createElement('div'); d.innerHTML = html; while (d.firstChild) main.appendChild(d.firstChild); });
      document.dispatchEvent(new Event('pagesLoaded'));
    })
    .catch(err => {
      main.innerHTML = `<div style="padding:48px;text-align:center;">
        <p style="color:#fca5a5;font-size:1rem;margin-bottom:12px;">⚠️ Unable to load module pages.</p>
        <p style="color:rgba(255,255,255,0.5);font-size:0.85rem;">Serve via a local web server — cannot open as file:// URL.<br><code style="font-size:0.8rem;">npx serve .</code> or VS Code Live Server.</p>
        <p style="color:rgba(255,255,255,0.3);font-size:0.75rem;margin-top:8px;">${err.message}</p>
      </div>`;
    });
})();
