# Site Audit Pass 1

## Follow-Up Update

The branch has now completed the main deferred follow-ups from pass 1:

- Maintained pages (`index.html`, `photo.html`, and `thank-you.html`) now load the committed local Tailwind build from `assets/css/output.css`.
- The repo is explicitly root-static with `.nojekyll`, and stale Jekyll leftovers have been removed.
- The maintained Playwright smoke suite now runs against a served local HTTP URL instead of `file://`.
- The shared stylesheet no longer leaks legacy global paragraph/section rules into the maintained pages.

## What The Repo Actually Is

This repo currently behaves as a GitHub Pages friendly static site served directly from root HTML files, not as a React app and not as an active Jekyll source repo.

Verified signals:

- `index.html`, `photo.html`, and `thank-you.html` are standalone deployable pages in the repo root.
- Active maintained pages now load the local committed Tailwind build from `assets/css/output.css`.
- `package.json` defines the Tailwind build and local static server commands actually used by the repo.
- `.nojekyll` is present, and `_config.yml`, `_includes/`, `_layouts/`, and `Gemfile.lock` have been removed from the active tree.
- `main.js`, `app.js`, and the JS module tree exist, but the active root pages were still carrying large inline scripts before this pass.

Practical conclusion: this is now a root-static GitHub Pages repo with a maintained primary flow and a smaller set of compatibility pages.

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

- README and tooling used to describe a local Tailwind build flow while the main active pages still depended on CDN Tailwind.
- Older pages such as `about.html`, `projects.html`, and `vision.html` still depended on `assets/css/output.css`.
- The shared stylesheet also contained old global element rules that leaked into the maintained pages after the local CSS migration.

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

### Follow-up completion

- Migrated `index.html`, `photo.html`, and `thank-you.html` off `cdn.tailwindcss.com` onto the committed local Tailwind build.
- Switched local development and Playwright smoke coverage to a served `http://127.0.0.1:8000/` flow.
- Removed stale `tailwind.config.js` and the stale `package.json` `main` entry.
- Fixed a real regression where legacy global `p` and `section` rules made primary-page copy unreadable after the CSS migration.
- Aligned the local mobile navigation harness with the served `127.0.0.1` URL.

### Test coverage

- Added `tests/site-hardening-pass1.spec.js`.
- Extended the Desktop Chrome Playwright project to include that focused smoke spec.

## What I Intentionally Did Not Change

- I did not migrate the site to Jekyll, React, Vite, Next, or any other framework.
- I did not remove legacy pages like `about.html`, `projects.html`, `vision.html`, or `mobile-nav-test.html`; I only made low-risk fixes where they affected link safety or markup sanity.
- I did not remove legacy pages like `about.html`, `projects.html`, `vision.html`, or `mobile-nav-test.html`; they are still kept for compatibility.
- I did not rewrite the site into a framework app or redesign its visual identity.

## Validation

Verified locally:

- `npx playwright test --project="Desktop Chrome" --grep "site hardening pass 1" --workers=1 --reporter=line --timeout=15000`
  - Result: 3 passed
- `npm run build`
  - Result: succeeded
- `npm test`
  - Result: 18 passed, 3 skipped

Notes:

- The Playwright global setup/teardown still writes summaries into `test-results/`, but that directory is now ignored and untracked.

## Recommended Phase 2

1. Prune or archive old pages and manual test harnesses.
   `about.html`, `projects.html`, `vision.html`, and `mobile-nav-test.html` look legacy or auxiliary.

2. Tighten Playwright ownership.
   Align config, tracked specs, and output handling so only active smoke/regression tests remain in the default path.

3. Clean up branch/deploy ambiguity.
   If `dev` is the real source branch, remote defaults and deployment docs should say that explicitly.
