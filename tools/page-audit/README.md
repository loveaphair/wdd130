# Page Audit Tool

A small browser-based Page Audit tool used for the WDD130 course. It fetches a student site (GitHub Pages), runs structural and accessibility checks, optionally queries external services (W3C validator, GitHub API), and renders an HTML report in the page UI.

Where to open
- Open `tools/page-audit/index.html` in a browser (must be served over HTTP due to ES modules and fetch()).

Quick usage
- Serve repository root via a simple server (examples):
  - Python: `python -m http.server`
  - VS Code Live Server
- Open `tools/page-audit/index.html`.
- Enter a GitHub username (or a full GitHub Pages URL) and click "Run Audit".

What it checks (high level)
- Structural HTML: doctype, html/head/body presence and order
- Head content: meta charset, meta viewport, title content rules per course/week
- File naming patterns in `src`/`href` attributes
- Image folder existence via GitHub API, image presence and alt text
- Optional: W3C HTML validation via validator.w3.org
- Course-specific checks (see `scripts-vieja/course/`)

Primary files
- `index.html` — UI and form
- `css/audit.css` — styles for the report
- `scripts-vieja/wdd130-w01-homepage.js` — main orchestrator (entry point)

Key modules
- `scripts-vieja/utils/reportTestLineItem.js` — helper to produce a `.lineitem` fragment (label, mark, standardHtml)
- `scripts-vieja/utils/resetReport.js` — clears the report and hides messages
- `scripts-vieja/utils/parseHTML.js` and `plainHTML.js` — fetch + DOMParser / raw HTML
- `scripts-vieja/utils/validateHTML.js` — POSTs to W3C validator and displays results
- `scripts-vieja/utils/getImageSize.js` — attempts to read Content-Length for image size estimation
- `scripts-vieja/views/displayGitHubLinks.js` — renders page + repo links
- `scripts-vieja/views/displayImageList.js` — builds an image list grid with existence and alt checks
- `scripts-vieja/tests/*` — many small checks (doctype, head content, file naming, attribute spacing, capitalization, folder image checks)
- `scripts-vieja/utils/groupReportResults.js` — (new) groups report items into Errors / Needs manual review / Passing checks

New grouped-report behavior
- Goal: improve reviewer efficiency by grouping results after the audit finishes.
- Order: Errors (❌) appear first, Needs manual review (👀 or items with blank mark) next, and Passing checks (✅) last.
- Implementation details:
  - After the main auditor finishes, it calls `groupReportResults()` which scans `.lineitem` elements under `#report`, classifies them (by presence of ❌, 👀, blank mark, or ✅), preserves non-lineitem callouts (links) at the top, and rebuilds the report DOM into three clearly labeled sections.
  - This approach avoids changing all individual test modules; they can continue to append fragments using `createLineItem()` as before.

Developer guidance
- Keep using `createLineItem({ label, passed, standardHtml })` to return a fragment containing an element with `class="lineitem"`.
- To force manual review classification include '👀' in the `standardHtml` or omit a mark (the `.mark` div will be blank) — the grouping script treats both as manual-review.
- Tests that append `h3` headings may be stripped by the grouping script to prevent duplicate headings; avoid the old top-level `h3` elements if possible and rely on grouped section headings instead.
- Suggested refactors (next steps):
  - Return structured result objects from checks instead of appending DOM nodes directly. Example shape: `{ label: 'doctype', status: 'error'|'review'|'pass', html: '<p>...</p>' }`.
  - Centralize network helpers and add retry/backoff + an optional GitHub token for authenticated API requests.
  - Make `reportEl` and `messageEl` explicit parameters for functions to reduce global coupling and enable unit tests.

Notes and caveats
- Many checks rely on fetch to external origins (student pages, GitHub API, W3C validator). CORS, rate-limits, and missing Content-Length headers can cause unexpected results.
- Image size checks use the `Content-Length` header which is not always present and may be blocked by CORS.

What I changed in this update
- Added `scripts-vieja/utils/groupReportResults.js` and wired it into `wdd130-w01-homepage.js` so that the report is grouped automatically after an audit run.

If you'd like I can next:
- Refactor a test (e.g., `checkHTMLDoc`) to return structured results and update the aggregator to use objects instead of scanning DOM nodes.
- Or refactor modules to accept `reportEl`/`messageEl` parameters for better testability.

— End of README
Workspace: Collecting workspace informationOverview
- What it is: A small browser-based "Page Audit" tool for WDD130 homepages. It fetches a student site (GitHub Pages), runs a series of structural and accessibility checks, queries external services (w3 validator, GitHub API), and renders an HTML report to the page UI.
- Where to open: index.html

Quick usage
- Serve the repository over HTTP (modules + fetch require a local server). Example:
  - Python: `python -m http.server` from repo root
  - VS Code Live Server
- Open index.html in the browser.
- Enter a GitHub username (or a full GitHub Pages URL) and click "Run Audit".
- The report appears in the #report element; errors and warnings show in #message.

Primary files (entry + styles)
- UI page: index.html
- Styles: audit.css
- Entry module (main auditor): wdd130-w01-homepage.js

Module map and exported/used symbols
- Main orchestrator
  - `wdd130w01homepage.buildReport` — main flow invoked on submit / onload via query param; uses DOM globals: `#username`, `#auditForm`, `#report`, `#message`.
  - Key helpers called by the main flow (links below point to the files that export these functions):
    - `utils.resetReport`
    - `tests.checkURL`
    - `utils.parseHTML`
    - `utils.plainHTML`
    - `views.displayGitHubLinks`
    - `tests.checkTemplateUsed`
    - `utils.validateHTML`
    - `tests.checkFolderImages`
    - `tests.checkFileNamingConventions`
    - `tests.checkHTMLDoc`
    - `tests.checkCapitalizedTags`
    - `tests.checkHTMLAttributeSpacing`
    - `tests.checkHeadContent`
    - `course.wdd130w01htmlbody`

Views (render parts of the report)
- `views.displayGitHubLinks` — creates GitHub page + repo links and appends to global `report`.
- `views.displayImageList` — scans images (img, source/srcset, CSS url()) and builds a grid with existence checks and size checks (calls `utils.getImageSize`).

Utilities
- DOM / report helpers:
  - `utils/reportTestLineItem.createLineItem`
  - `utils/reportTestLineItem.appendToReport`
- Fetch helpers:
  - `utils/plainHTML` — fetch text/html
  - `utils.parseHTML` — fetch + DOMParser
- Image size:
  - `utils.getImageSize` — uses fetch and Content-Length header
  - `utils.getAllImageSizes`

Tests (checks)
- Structural & naming checks:
  - `tests.checkHTMLDoc` — doctype, <html>, <head>, <body>
  - `tests.checkHeadContent` — meta charset, viewport, <title> content rules per course/week
  - `tests.checkHTMLAttributeSpacing` — spaces around '=' in attributes
  - `tests.checkCapitalizedTags` — uppercase tags existence
  - `tests.checkFileNamingConventions` — filenames found in src/href/data attributes and common naming problems
  - `tests.checkFolderImages` — queries GitHub API for an images folder
  - `tests.checkTemplateUsed` — GitHub API repo check for a template repo
  - `tests.checkURL` — verifies page URL responds (used during input validation)
- Course rule checks:
  - `course/wdd130-w01-htmlbody.wdd130w01htmlbody` — body structure expectations for WDD130 week01, and calls `views.displayImageList`

How files connect (runtime flow)
1. User submits the form in index.html — handled by the module scripts-vieja/wdd130-w01-homepage.js.
2. getAuditURL() normalizes the input (username or full URL), calls `tests.checkURL` to ensure the page is reachable.
3. buildReport(url) does:
   - reset UI: `utils.resetReport`
   - fetch DOM & raw HTML: `utils.parseHTML` and `utils.plainHTML`
   - render link summary: `views.displayGitHubLinks`
   - run template check: `tests.checkTemplateUsed`
   - validate w3 HTML: `utils.validateHTML` (POSTs to validator.w3.org)
   - check images folder via GitHub API: `tests.checkFolderImages`
   - file naming rules: `tests.checkFileNamingConventions`
   - other HTML tests and course-specific checks (see list above) — many append line items via `utils/reportTestLineItem.createLineItem`

Important implementation/architecture notes & caveats
- Modules rely on a mix of local imports and global DOM globals:
  - wdd130-w01-homepage.js defines `report` and `message` as DOM nodes and many other modules (e.g., `views.displayGitHubLinks`, tests) append directly to them without explicit imports. This creates implicit coupling to the hosting page and makes unit testing harder.
- Global variables used across modules:
  - `report` and `message` are expected globals (declared in wdd130-w01-homepage.js). Several modules reference them directly (no import). Consider passing `report`/`message` as explicit args.
- Fetch / CORS / network behavior:
  - Many checks use fetch() to external origins: GitHub API, w3.org validator, and student pages. CORS and rate limiting can fail silently or cause opaque responses.
  - `utils.getImageSize` reads Content-Length header and divides by 1024; if Content-Length is absent or blocked by CORS it returns NaN or throws. `views.displayImageList` contains fallback logic when fetch errors occur, but overall image size checks are unreliable for cross-origin images without proper CORS headers.
- Error handling is inconsistent:
  - Some modules catch errors and set `message.innerHTML`, others may throw or leave unhandled Promise rejections. The validator call throws on non-200.
- String-based HTML parsing:
  - Several tests use regexes on the raw HTML string (e.g., title checks, tag casing). That approach works for simple checks but can be error-prone for edge cases. Already some modules use DOM parsing (`parseHTML`) and XMLSerializer; consider standardizing on DOM-based checks for structural queries and using the raw HTML only when necessary.
- Relative URLs and URL resolution:
  - `displayImageList` uses `new URL(rawSrc, baseUrl).href` for resolution which is good; but `getAllImageSizes` currently concatenates `${url}${img.src}` which may double paths. Prefer `new URL(img.getAttribute('src') || img.src, baseUrl).href`.
- `displayGitHubLinks` extracts username via URL parsing; it then calls `report.appendChild(links)` but `report` is a global not passed in. This is an implicit contract with the page.
- Rate limits / GitHub API:
  - `tests.checkFolderImages` and `tests.checkTemplateUsed` call GitHub API unauthenticated — subject to rate limiting. For higher volume or CI runs, add token-based auth or caching.

Recommended small improvements
- Make report/message explicit dependencies: refactor functions to accept `reportEl` and `messageEl` parameters (or an audit context object). This makes testing and reuse safer.
- Centralize network helpers: wrap fetch with retry and consistent error handling; normalize URL resolution in one utility.
- Improve image size robustness: handle missing Content-Length, and skip size checks for cross-origin images without CORS; show "unknown" rather than NaN.
- Avoid regex-only checks for structure where a DOM parsed tree is available — prefer Document queries for accuracy.
- Add unit tests (Jest / Playwright) that use a mocked DOM (jsdom) and mocked fetch to assert behavior.
- Document the global contract (IDs expected in index.html: `#username`, `#auditForm`, `#report`, `#message`) in code comments or README.

Files list (open these)
- index.html
- audit.css
- wdd130-w01-homepage.js
- resetReport.js
- plainHTML.js
- parseHTML.js
- validateHTML.js
- getImageSize.js
- reportTestLineItem.js
- displayImageList.js
- displayGitHubLinks.js
- wdd130-w01-htmlbody.js
- checkURL.js
- checkTemplateUsed.js
- checkFolderImages.js
- checkFileNamingConventions.js
- checkHTMLDoc.js
- checkHeadContent.js
- checkCapitalizedTags.js
- checkHTMLAttributeSpacing.js