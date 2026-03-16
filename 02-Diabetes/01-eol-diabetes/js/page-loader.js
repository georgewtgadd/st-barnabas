/* page-loader.js — Fetch all 11 page fragments and inject into <main> */
'use strict';

(function () {
  const PAGES = [
    'pages/page-01-welcome.html',
    'pages/page-02-dilemmas.html',
    'pages/page-03-energy.html',
    'pages/page-04-pancreas.html',
    'pages/page-05-islets.html',
    'pages/page-06-hormones.html',
    'pages/page-07-homeostasis.html',
    'pages/page-08-ranges.html',
    'pages/page-09-types.html',
    'pages/page-10-quiz.html',
    'pages/page-11-record.html'
  ];

  const main = document.querySelector('main');

  Promise.all(PAGES.map(url =>
    fetch(url).then(r => {
      if (!r.ok) throw new Error('Failed to load: ' + url);
      return r.text();
    })
  )).then(htmls => {
    htmls.forEach(html => {
      const div = document.createElement('div');
      div.innerHTML = html;
      while (div.firstChild) main.appendChild(div.firstChild);
    });
    document.dispatchEvent(new Event('pagesLoaded'));
  }).catch(err => {
    console.error('Page loader error:', err);
    main.innerHTML = `<div style="padding:48px;text-align:center;">
      <p style="color:#fca5a5;font-size:1rem;margin-bottom:12px;">⚠️ Unable to load module pages.</p>
      <p style="color:rgba(255,255,255,0.5);font-size:0.85rem;">Please serve this module via a local web server (e.g. <code>npx serve .</code> or VS Code Live Server).<br>This module cannot be opened directly as a file:// URL.</p>
    </div>`;
  });
})();
