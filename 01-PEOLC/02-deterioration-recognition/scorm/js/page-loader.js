/* ══════════════════════════════════════════════════════════
   PAGE LOADER
   Fetches all page HTML fragments and injects them into <main>.
   This runs before main.js so all page DOM exists when init fires.
   js/page-loader.js
══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var PAGES = [
    'pages/page-01-intro.html',
    'pages/page-02-recognition.html',
    'pages/page-03-tools.html',
    'pages/page-04-timeline.html',
    'pages/page-05-diagnosis.html',
    'pages/page-06-trajectories.html',
    'pages/page-07-priorities.html',
    'pages/page-08-bob-profile.html',
    'pages/page-09-bob-visit.html',
    'pages/page-10-mcq.html',
    'pages/page-11-active-dying.html',
    'pages/page-12-learning-record.html'
  ];

  var main = document.getElementById('main-content');

  /**
   * Fetch all pages in order and inject them as HTML into <main>.
   * Uses sequential promises to maintain correct DOM order.
   */
  function loadPages() {
    return PAGES.reduce(function (chain, url) {
      return chain.then(function () {
        return fetch(url)
          .then(function (res) {
            if (!res.ok) throw new Error('Failed to load ' + url + ' (' + res.status + ')');
            return res.text();
          })
          .then(function (html) {
            var wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            while (wrapper.firstChild) {
              main.appendChild(wrapper.firstChild);
            }
          });
      });
    }, Promise.resolve());
  }

  loadPages()
    .then(function () {
      // All pages are now in the DOM — fire a custom event that main.js listens for
      document.dispatchEvent(new Event('pagesLoaded'));
    })
    .catch(function (err) {
      console.error('[PageLoader] Error loading pages:', err);
      // Fallback message in main
      main.innerHTML = '<p style="padding:48px;text-align:center;color:#fca5a5;">'
        + 'Error loading module content. Please reload the page.<br>'
        + '<small style="opacity:.6;">' + err.message + '</small></p>';
    });

}());
