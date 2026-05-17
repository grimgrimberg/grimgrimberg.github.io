# Portfolio Audit UI Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize and polish the current portfolio branch with a surgical audit pass.

**Architecture:** Keep the static GitHub Pages shape: root HTML pages, Tailwind v4 source CSS, generated committed CSS, and page-specific vanilla JavaScript. Avoid broad extraction from the current homepage script; remove or quarantine stale code only when it is proven unused by active pages and package scripts.

**Tech Stack:** Static HTML, Tailwind CSS v4 CLI, vanilla JavaScript, Playwright Test, PowerShell on Windows.

---

### Task 1: Confirm Active Surface And Remove Proven Dead Code

**Files:**
- Delete if still unreferenced: `assets/js/app.js`
- Delete if still unreferenced: `assets/js/main.js`
- Delete if still unreferenced: `assets/js/modules/animations.js`
- Delete if still unreferenced: `assets/js/modules/clippy.js`
- Delete if still unreferenced: `assets/js/modules/contact-form.js`
- Delete if still unreferenced: `assets/js/modules/easter-eggs.js`
- Delete if still unreferenced: `assets/js/modules/interactive-features.js`
- Delete if still unreferenced: `assets/js/modules/navigation.js`
- Delete if still unreferenced: `assets/js/modules/retro-games.js`
- Modify: `README.md`

- [x] **Step 1: Reconfirm no active page imports the old module tree**

Run:

```powershell
rg -n "assets/js/(app|main|modules/)|modules/" . --glob '!node_modules/**' --glob '!playwright-report/**' --glob '!test-results/**' --glob '!assets/css/output.css'
```

Expected: no active HTML page references `assets/js/app.js`, `assets/js/main.js`, or `assets/js/modules/*`.

- [x] **Step 2: Delete the unreferenced module experiment**

Use `apply_patch` delete hunks for the files listed above.

- [x] **Step 3: Update README file guide**

Keep `assets/js/site-shell.js`, `assets/js/index-page.js`, `assets/js/photo-page.js`, and `assets/js/scripts.js` as the documented JavaScript entrypoints. Do not mention deleted module files.

- [x] **Step 4: Re-run the reference search**

Run the command from Step 1.

Expected: only historical markdown notes may mention the deleted module tree.

### Task 2: Tighten Static Hygiene Checks

**Files:**
- Modify: `scripts/lint-site.mjs`
- Modify: `tests/site-hygiene.spec.js`

- [x] **Step 1: Expand static lint coverage to all root HTML pages**

Update the static lint page lists so `cv.html` and `mobile-nav-test.html` are checked for viewport tags, placeholder links, unsafe `javascript:` links, remote runtime dependencies, and external-link rel hygiene.

- [x] **Step 2: Add static privacy/security checks**

Add checks that root HTML pages do not use `tel:`, WhatsApp, calendar links, or remote scripts/styles. Keep the stricter homepage CSP/referrer checks in Playwright.

- [x] **Step 3: Keep Playwright hygiene aligned**

Ensure `tests/site-hygiene.spec.js` still checks all root HTML pages and homepage privacy, with no weakening of the no-overflow or no-remote-runtime assertions.

- [x] **Step 4: Verify static lint**

Run:

```powershell
npm run lint:static
```

Expected: `Site lint passed.`

### Task 3: Remove Inline Event Handlers From Active UI Surfaces

**Files:**
- Modify: `photo.html`
- Modify: `assets/js/photo-page.js`
- Modify: `mobile-nav-test.html`
- Modify: `tests/smoke.spec.js`

- [x] **Step 1: Replace photo thumbnail inline handlers**

Change thumbnail buttons from `onclick="goToSlide(N)"` to `data-slide-index="N"` and add descriptive `aria-label` values.

- [x] **Step 2: Bind thumbnail clicks in `photo-page.js`**

Add a function that attaches click listeners to `[data-slide-index]`, parses the numeric index, and calls `goToSlide(index)`.

- [x] **Step 3: Replace mobile harness inline handlers**

Change mobile harness buttons to `data-viewport-width` and `data-viewport-height`, then bind the click handlers in the existing inline script.

- [x] **Step 4: Keep smoke tests on active APIs**

Ensure photo gallery smoke still uses `window.goToSlide(3)` and does not depend on inline attributes.

- [x] **Step 5: Verify no inline handlers on active pages**

Run:

```powershell
rg -n "onclick=|onload=|onerror=|onmouseover=" index.html photo.html thank-you.html cv.html mobile-nav-test.html
```

Expected: no matches.

### Task 4: Polish UI Consistency Without Redesigning

**Files:**
- Modify: `photo.html`
- Modify: `assets/css/styles.css`
- Modify: `assets/css/output.css`
- Modify as needed: `index.html`
- Modify as needed: `cv.html`
- Modify as needed: `thank-you.html`

- [x] **Step 1: Align photo page color tokens**

Update photo page inline styles to use the current calmer cyan, amber, green, and coral palette instead of the older purple-heavy palette.

- [x] **Step 2: Fix obvious mobile rough edges**

Check mobile view for clipped text, crowding, horizontal overflow, inaccessible touch targets, stale color contrast, and modal/card alignment. Apply focused CSS/HTML fixes only where observed.

- [x] **Step 3: Add missing privacy metadata to maintained pages**

Ensure maintained public pages have appropriate `referrer` metadata and do not add remote runtime dependencies.

- [x] **Step 4: Rebuild CSS**

Run:

```powershell
npm run build
```

Expected: Tailwind completes successfully and updates `assets/css/output.css`.

### Task 5: Quarantine Stale Tests And Document Maintained Gates

**Files:**
- Delete if stale and unused by package scripts: `tests/contact-form.spec.js`
- Delete if stale and unused by package scripts: `tests/mobile-nav-complete.spec.js`
- Delete if stale and unused by package scripts: `tests/mobile-nav-positioning.spec.js`
- Delete if stale and unused by package scripts: `tests/mobile-nav-simple.spec.js`
- Delete if stale and unused by package scripts: `tests/mobile-navigation.spec.js`
- Delete if stale and unused by package scripts: `tests/mobile-touch-gestures.spec.js`
- Delete if stale and unused by package scripts: `tests/portfolio-features.spec.js`
- Delete if stale and unused by package scripts: `tests/portfolio.spec.js`
- Delete if stale and unused by package scripts: `tests/responsive-mobile-desktop.spec.js`
- Delete if stale and unused by package scripts: `tests/site-hardening-pass1.spec.js`
- Delete if stale and unused by package scripts: `tests/verification.spec.js`
- Create: `tests/README.md`
- Modify: `README.md`

- [x] **Step 1: Confirm package scripts only run maintained suites**

Run:

```powershell
Get-Content package.json
```

Expected: `npm test` runs `playwright test` with `playwright.config.js`, and that config matches only `tests/smoke.spec.js`; `npm run lint:runtime` uses `playwright.hygiene.config.js`, matching only `tests/site-hygiene.spec.js`.

- [x] **Step 2: Delete stale specs**

Use `apply_patch` delete hunks for stale specs that are not referenced by package scripts and are not the maintained smoke/hygiene suites.

- [x] **Step 3: Add test ownership note**

Create `tests/README.md` documenting that `smoke.spec.js` and `site-hygiene.spec.js` are the maintained Playwright suites.

- [x] **Step 4: Update README commands section**

Clarify that `npm run lint` and `npm test -- --reporter=line` are the default acceptance gates for this static site.

### Task 6: Full Verification And Browser QA

**Files:**
- No source edits unless verification exposes a bug.

- [x] **Step 1: Syntax check edited JavaScript**

Run:

```powershell
node --check assets\js\index-page.js
node --check assets\js\photo-page.js
node --check assets\js\site-shell.js
```

Expected: all commands exit 0.

- [x] **Step 2: Run full lint**

Run:

```powershell
npm run lint
```

Expected: static lint passes and Playwright hygiene passes.

- [x] **Step 3: Run maintained smoke suite**

Run:

```powershell
npm test -- --reporter=line
```

Expected: maintained smoke tests pass on desktop and mobile projects.

- [x] **Step 4: Browser QA**

Use the in-app Browser/Playwright tooling on `http://127.0.0.1:8000/` to check page identity, meaningful content, console health, desktop viewport, mobile viewport, and at least one interaction from Command Center, Clippy, contact, CV gate, retro archive, reviews or roast, goose, mobile drawer, and photo gallery.

- [x] **Step 5: Commit and push**

Stage the audited source changes, commit them on `codex/portfolio-audit-ui-cleanup`, then push the branch.
