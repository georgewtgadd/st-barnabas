# Communication & Advance Care Planning — xAPI conversion

This package was converted from SCORM 1.2 to xAPI (Tin Can), and the "Best
Interests Conversation" scenario was rebuilt as a full branching tree. Summary
of what changed, and how to check it before it goes anywhere near a live LRS.

## What changed

**xAPI / Tin Can**
- `js/scorm.js` → `js/xapi.js`. Same graceful-standalone behaviour (runs and
  logs to the console with no LMS/LRS present), but now speaks xAPI 1.0.3.
- `imsmanifest.xml` → `tincan.xml`.
- Launch parameters (`endpoint`, `auth`, `actor`, `registration`) are read
  from the URL query string on load — the convention used by SCORM Cloud,
  Learning Locker, Watershed and most LMSs that support xAPI-launched
  content. See the comment block at the top of `js/xapi.js`.
- Activity IDs live under `https://www.stbarnabashospice.co.uk/xapi/comm-acp/…`
  — these are just stable identifiers, they don't need to resolve to real
  pages, but they should be a domain St Barnabas actually controls. Update
  `ACTIVITY_BASE` in `js/xapi.js` if that should point somewhere else.
- Every stage choice in the scenario sends a `responded` statement (which
  option, correct or not) — so an LRS report can now show *which path*
  learners took, not just pass/fail. Resets are logged too.

**The Best Interests Conversation scenario**
- Old design: 3 fixed stages, wrong answer → instant retry of the same
  stage. New design: 7 stages in a branching graph, 8 distinct endings.
  A wrong choice sends you down a genuinely different path — two of those
  paths are "damage control" stages that, if also answered wrong, end the
  meeting early (*Complaint Escalation*, *Family Disengages*) before the
  final recommendation is ever reached.
- The only way back is the **Reset scenario** button (top of the activity,
  and again on every ending screen) — there's no more instant per-question
  retry, which was the main ask: wrong choices should have consequences,
  not just a scolding pop-up.
- A breadcrumb along the top shows the path taken so far, with off-track
  steps highlighted.

**Illustrations**
- Emoji replaced with a small bespoke SVG avatar set (clinician + two family
  members in 8 moods, plus door/sofa/handshake/heart/clipboard icons),
  styled to the course's existing navy/gold palette. Defined once as
  `<symbol>` elements at the top of `pages/page-09-scenario.html` and
  referenced via `<use>`. I don't have a photo/video generation tool in
  this environment, so this was the closest achievable substitute — if you
  later generate real AI images or video elsewhere, they can be dropped
  into `/images/scenes/` and swapped in for the `<use>` references in
  `js/scenario.js`'s `_avatar()` calls without touching the branching logic.

**Learning record page**
- The old fixed "Stage 1/2/3" rows don't make sense for a variable-length
  path, so `pages/page-11-record.html` and `js/record.js` now show
  **path taken** and **ending reached** instead — also reflected in the
  PDF export.

## How to test locally

The module must be served over HTTP(S) — `page-loader.js` fetches the page
fragments, which `file://` won't allow. From this folder:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`. With no `?endpoint=…` in the
URL, `xapi.js` runs in standalone mode and logs every statement it *would*
have sent to the browser console — open DevTools to watch them while you
click through the scenario.

To test against a real LRS, launch with something like:

```
index.html?endpoint=https%3A%2F%2Fyour-lrs.example.com%2Fxapi%2F
          &auth=Basic%20BASE64CREDENTIALS
          &actor=%7B%22name%22%3A%22Test%20Learner%22%2C%22mbox%22%3A%22mailto%3Atest%40example.com%22%7D
```

## Suggested next steps

- Swap `ACTIVITY_BASE` in `js/xapi.js` to a namespace you're happy to commit
  to long-term (it becomes part of every statement's activity ID).
- If you want real photography/video/illustration in place of the SVG
  avatars, generate it separately and wire it in via `_avatar()` in
  `js/scenario.js` — the branching logic doesn't need to change.
- Worth a proofread of the eight ending texts for tone/clinical accuracy —
  I drafted them to extend the existing MCA/7-38-55 framing, but they're
  new content and deserve a second pair of eyes before this goes live with
  learners.
