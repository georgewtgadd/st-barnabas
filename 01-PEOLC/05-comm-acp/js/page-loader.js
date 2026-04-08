/* ══════════════════════════════════════════════════════════
   js/page-loader.js  ·  Fetch all page fragments into <main>
   Requires: HTTP/S server (not file:// URL).
══════════════════════════════════════════════════════════ */

(async function loadPages() {
  const main = document.getElementById('main-content');
  if (!main) { console.error('[loader] <main id="main-content"> not found'); return; }

  const pages = [
    'pages/page-01-intro.html',
    'pages/page-02-communication.html',
    'pages/page-03-comm-practice.html',
    'pages/page-04-mca-principles.html',
    'pages/page-05-capacity-test.html',
    'pages/page-06-legal-protections.html',
    'pages/page-07-acp-tools.html',
    'pages/page-08-best-interests.html',
    'pages/page-09-scenario.html',
    'pages/page-10-quiz.html',
    'pages/page-11-record.html',
  ];

  try {
    const htmlParts = await Promise.all(
      pages.map(url =>
        fetch(url).then(r => {
          if (!r.ok) throw new Error('Failed to load ' + url + ' (' + r.status + ')');
          return r.text();
        })
      )
    );

    main.innerHTML = htmlParts.join('\n');
    console.info('[loader] All ' + pages.length + ' pages loaded.');
    document.dispatchEvent(new CustomEvent('pagesLoaded'));
  } catch (err) {
    console.error('[loader] Error:', err);
    main.innerHTML = `
      <div style="padding:60px 40px;text-align:center;color:#fff;font-family:sans-serif;">
        <h2 style="margin-bottom:12px;">⚠️ Module could not load</h2>
        <p style="color:rgba(255,255,255,.6);max-width:500px;margin:0 auto;line-height:1.7;">
          This module must be served over HTTP/S. Please open it using a web server
          (e.g. VS Code Live Server, or upload to your LMS).
        </p>
        <p style="margin-top:12px;color:rgba(255,255,255,.35);font-size:.8rem;">${err.message}</p>
      </div>`;
  }
})();
