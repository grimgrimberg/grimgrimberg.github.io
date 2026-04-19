# Site Hardening Pass 1 Changelog

## Before

- Repo mixed live pages, stale Jekyll scaffolding, partial Tailwind tooling, and committed local artifacts.
- `photo.html` showed a mobile menu button that did not work.
- `index.html` and `thank-you.html` still shipped placeholder links.
- External `target="_blank"` links were not consistently hardened.
- Main pages duplicated shared nav behavior inline.
- Contact form semantics and gallery loading hints were weak.

## After

- Added `.gitignore` and removed committed dependency/test-output directories from git tracking.
- Added a shared `assets/js/site-shell.js` for navbar, smooth-scroll, and mobile menu behavior.
- `photo.html` now has a working mobile drawer instead of a dead mobile button.
- Placeholder links were replaced with real destinations or removed.
- Outbound new-tab links now use `rel="noopener noreferrer"`.
- `index.html` and `photo.html` gained skip links, main landmarks, and safer navigation behavior.
- Contact form labels/autocomplete were tightened.
- Non-critical gallery images now use intrinsic dimensions plus lazy/async loading hints.
- Added a focused Playwright smoke spec for this pass and verified it locally.
