# Site Audit Pass 1

## What The Repo Actually Is

This repo currently behaves as a GitHub Pages friendly static site served directly from root HTML files, not as a clean Jekyll source repo and not as a clean build-output-only repo.

Verified signals:

- `index.html`, `photo.html`, and `thank-you.html` are standalone deployable pages in the repo root.
- Active pages still load Tailwind from `cdn.tailwindcss.com`.
- `package.json` defines a Tailwind/PostCSS build to `assets/css/output.css`.
- `_config.yml`, `_includes/`, `_layouts/`, and `Gemfile.lock` are present, but the active site is not being driven by those templates.
- `main.js`, `app.js`, and the JS module tree exist, but the active root pages were still carrying large inline scripts before this pass.

Practical conclusion: this is a hybrid static-site repo with stale Jekyll-era scaffolding and a partial Tailwind/tooling refactor that was never fully adopted by the live pages.

## Branch Model Reality

Verified git state at audit time:

- Current working/source branch was `dev`.
- `origin/dev` exists and matches the checked-out `dev` HEAD.
- `origin/HEAD` still points to `main`.

Practical conclusion: `dev` is acting as the working canonical branch for source changes, but the remote default branch metadata still points at `main`, which is a source-of-truth ambiguity worth fixing later.

## Major Findings

### Repo hygiene

- There was no root `.gitignore`.
- `node_modules/` was committed.
- Playwright output directories were committed:
  - `.playwright-mcp/`
  - `playwright-report/`
  - `test-results/`
- The worktree was already dirty with generated Playwright artifacts before this pass.

### Delivery/build mismatch

- README and tooling described a local Tailwind build flow, but the main active pages still depended on CDN Tailwind.
- Older pages such as `about.html`, `projects.html`, and `vision.html` still depended on `assets/css/output.css`.
- Because of that split, switching the live root pages off CDN Tailwind in this pass would have been higher risk than justified.

### Maintainability drift

- `index.html` and `photo.html` duplicated navbar scroll, smooth-scroll, and mobile-nav behavior inline.
- `photo.html` rendered a mobile menu button without a working mobile menu.
- Legacy pages had malformed or weak document structure, including CSS loaded after body content.

### UX / accessibility / safety

- Multiple placeholder anchors used `href="#"`.
- Multiple `target="_blank"` links were missing `rel="noopener noreferrer"`.
- Contact form labels in `index.html` were not explicitly associated with inputs.
- The main pages lacked a skip link and main landmark.
- Non-critical gallery images were missing lazy/async loading hints.

## What Changed In Pass 1

### Repo hygiene

- Added a root `.gitignore`.
- Untracked committed local artifacts from git while keeping local copies available:
  - `node_modules/`
  - `.playwright-mcp/`
  - `playwright-report/`
  - `test-results/`

### Site hardening

- Added `assets/js/site-shell.js` as a shared source of truth for:
  - navbar background behavior
  - smooth in-page anchor scrolling
  - mobile menu wiring
- Removed duplicated nav/mobile-menu logic from the big inline blocks where safe.
- Implemented a real mobile drawer in `photo.html` using the shared nav behavior.
- Replaced placeholder project/detail links on `index.html` with real destinations.
- Replaced placeholder social links on `thank-you.html` with real LinkedIn, GitHub, and email actions.
- Added `rel="noopener noreferrer"` to outbound links that open in new tabs.
- Removed the unnecessary `target="_blank"` from the local CV download link.

### Accessibility and semantics

- Added a skip link and `<main>` landmark to `index.html` and `photo.html`.
- Added scroll offset support for hash-navigation targets in `index.html`.
- Converted the Clippy dismiss control from a clickable `div` to a button.
- Added `for` bindings and basic `autocomplete` attributes to the contact form.
- Added accessible names to icon-only external links where touched.
- Restored visible keyboard focus treatment for `photo.html` thumbnail buttons.

### Performance / asset handling

- Added `loading="lazy"` and `decoding="async"` to non-critical gallery images.
- Added intrinsic image dimensions for the optimized gallery assets.
- Added straightforward canonical/social metadata to the primary root pages touched in this pass.

### Test coverage

- Added `tests/site-hardening-pass1.spec.js`.
- Extended the Desktop Chrome Playwright project to include that focused smoke spec.

## What I Intentionally Did Not Change

- I did not migrate the site to Jekyll, React, Vite, Next, or any other framework.
- I did not remove the Jekyll-era files yet, because they are stale but not blocking the live-site hardening work.
- I did not switch the active root pages from CDN Tailwind to the local compiled CSS, because the current live pages still rely on inline Tailwind configuration and that change deserves a separate controlled pass.
- I did not remove legacy pages like `about.html`, `projects.html`, `vision.html`, or `mobile-nav-test.html`; I only made low-risk fixes where they affected link safety or markup sanity.
- I did not rewrite the README or stale setup/refactor docs in this pass, even though they are out of date.

## Validation

Verified locally:

- `npx playwright test --project="Desktop Chrome" --grep "site hardening pass 1" --workers=1 --reporter=line --timeout=15000`
  - Result: 3 passed
- `npm run build`
  - Result: succeeded

Notes:

- The Playwright global setup/teardown still writes summaries into `test-results/`, but that directory is now ignored and untracked.

## Recommended Phase 2

1. Pick one delivery model and finish it.
   Either keep this as a direct static-root Pages repo and archive/remove Jekyll remnants, or restore a real template-driven source flow.

2. Resolve the Tailwind truth gap.
   Either migrate the live root pages onto `assets/css/output.css` and shared JS, or explicitly document that CDN Tailwind is the intended runtime path.

3. Prune or archive old pages and manual test harnesses.
   `about.html`, `projects.html`, `vision.html`, and `mobile-nav-test.html` look legacy or auxiliary.

4. Reconcile docs with reality.
   `README.md`, `SETUP_INSTRUCTIONS.md`, and `REFACTORING_SUMMARY.md` currently describe workflows and assets that no longer match the tree.

5. Tighten Playwright ownership.
   Align config, tracked specs, and output handling so only active smoke/regression tests remain in the default path.

6. Clean up branch/deploy ambiguity.
   If `dev` is the real source branch, remote defaults and deployment docs should say that explicitly.
