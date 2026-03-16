/* ══════════════════════════════════════════════════════════
   page-loader.js
   Fetches all 7 page fragments sequentially, injects them
   into <main>, then fires the custom 'pagesLoaded' event.
   Requires a web server (file:// will not work — correct for
   any LMS / SCORM delivery environment).
══════════════════════════════════════════════════════════ */

(async function loadPages() {
  const pages = [
    'pages/page-01-intro.html',
    'pages/page-02-profile.html',
    'pages/page-03-scenario.html',
    'pages/page-04-hotspot.html',
    'pages/page-05-pillars.html',
    'pages/page-06-sophie.html',
    'pages/page-07-acp.html'
  ];

  const main = document.getElementById('main-content');
  if (!main) {
    console.error('page-loader: <main id="main-content"> not found.');
    return;
  }

  try {
    for (const url of pages) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
      const html = await res.text();
      main.insertAdjacentHTML('beforeend', html);
    }
  } catch (err) {
    console.error('page-loader error:', err);
    main.innerHTML = `
      <div style="padding:48px; text-align:center; color:#f87171;">
        <h2 style="margin-bottom:12px;">Module failed to load</h2>
        <p style="color:#c5d3e8;">${err.message}</p>
        <p style="margin-top:12px; font-size:0.85rem; color:#8a9ab8;">
          This module requires a web server. Make sure it is being served
          over HTTP/S rather than opened directly as a file.
        </p>
      </div>`;
    return;
  }

  // All pages injected — notify main.js
  document.dispatchEvent(new CustomEvent('pagesLoaded'));
})();
