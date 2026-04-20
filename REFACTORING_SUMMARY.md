# Refactoring Summary

## Current State

The repo has been hardened toward a plain static-site model.

## What Changed

- Primary page behavior was moved out of inline script blocks and into:
  - `assets/js/index-page.js`
  - `assets/js/photo-page.js`
- Shared nav and shell behavior remains in `assets/js/site-shell.js`.
- `assets/js/scripts.js` is now explicitly a legacy helper for older standalone pages.
- The repo now carries `.nojekyll` and no longer needs stale Jekyll-era source files to describe the live site.

## What This Is Not

- Not a React app.
- Not an active Jekyll source tree.
- Not a build-first site where `assets/css/output.css` is the runtime source of truth for `index.html` and `photo.html`.

## Practical Outcome

- The maintained pages are easier to review because the page logic is in dedicated files.
- Mobile navigation behavior is shared and testable.
- The codebase has a cleaner separation between maintained pages and legacy compatibility pages.

## Follow-On Work

- Migrate the primary pages off the Tailwind CDN onto a local compiled CSS path in a separate controlled pass.
- Prune or archive legacy standalone pages once they are no longer needed.
