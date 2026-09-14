/* ══════════════════════════════════════════════════════════
   PDF TOOL VIEWER — Page 3
   js/pdf-viewer.js
══════════════════════════════════════════════════════════ */

var _currentPigPage = 1;
var _zoomState      = {};
var _ZOOM_STEP      = 25;
var _ZOOM_MIN       = 75;
var _ZOOM_MAX       = 300;

/**
 * zoomDoc(imgId, direction)
 * Zooms by changing the width of .pdfv-scroll-inner.
 * The browser provides scrollbars automatically once content overflows.
 * @param {string} imgId     - id of the <img> element
 * @param {number} direction - +1 = zoom in, -1 = zoom out
 */
function zoomDoc(imgId, direction) {
  var img   = document.getElementById(imgId);
  if (!img) return;
  var inner = img.parentElement;            // .pdfv-scroll-inner
  var outer = inner && inner.parentElement; // .pdfv-scroll-outer
  if (!inner || !outer) return;

  var current = _zoomState[imgId] || 100;
  var next    = current + direction * _ZOOM_STEP;
  next = Math.max(_ZOOM_MIN, Math.min(_ZOOM_MAX, next));
  _zoomState[imgId] = next;

  inner.style.width = (next === 100) ? '' : next + '%';

  var levelEl = document.getElementById(imgId.replace('-img', '-level'));
  if (levelEl) levelEl.textContent = next + '%';
}

function zoomReset(imgId) {
  var img   = document.getElementById(imgId);
  if (!img) return;
  var inner = img.parentElement;
  if (inner) inner.style.width = '';
  _zoomState[imgId] = 100;

  var levelEl = document.getElementById(imgId.replace('-img', '-level'));
  if (levelEl) levelEl.textContent = '100%';

  var outer = inner && inner.parentElement;
  if (outer) { outer.scrollTop = 0; outer.scrollLeft = 0; }
}

function showPdfTool(id) {
  document.querySelectorAll('.pdfv-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.pdfv-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  var panel = document.getElementById('ppanel-' + id);
  var tab   = document.getElementById('ptab-' + id);
  if (panel) panel.classList.add('active');
  if (tab)   { tab.classList.add('active'); tab.setAttribute('aria-selected', 'true'); }

  // Reset zoom on all images in the newly shown panel
  if (panel) {
    panel.querySelectorAll('.pdfv-img').forEach(function (img) {
      if (img.id) zoomReset(img.id);
    });
  }
}

function pigPage(pageNum) {
  _currentPigPage = pageNum;
  var img  = document.getElementById('pig-img');
  var ind  = document.getElementById('pig-indicator');
  var prev = document.getElementById('pig-prev');
  var next = document.getElementById('pig-next');
  if (img) {
    img.src = 'images/tools/pig' + (pageNum === 1 ? '1' : '2') + '.jpg';
    img.alt = 'PIG Tool — GSF Proactive Identification Guidance page ' + pageNum;
  }
  if (ind)  ind.textContent  = pageNum + ' / 2';
  if (prev) prev.disabled    = (pageNum === 1);
  if (next) next.disabled    = (pageNum === 2);
  if (img && img.id) zoomReset(img.id);
}
