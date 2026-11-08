# Repository Notes

## Reality Check

- This repo is a root-static GitHub Pages site.
- The maintained pages are `index.html`, `photo.html`, and `cv.html`. `404.html` is served by GitHub Pages for missing routes and must use root-absolute asset paths.
- `dev` is the working/source branch convention.
- Do not assume `main` is the source branch.
- Do not assume Jekyll templates or GitHub Actions are part of the active runtime unless the repo is changed to make that true.

## Runtime Layout

- Shared shell and navigation logic: `assets/js/site-shell.js`
- Homepage behavior: `assets/js/index-page.js`
- Photography page behavior: `assets/js/photo-page.js`
- Lab loader and navigation: `assets/js/portfolio-labs.js` (lazy-imports `path-playground.js` and `lab-experiments.js`, which pull in three.js)
- Interactive state: `assets/js/state-machine.js`. Every interactive part is an explicit machine mirrored to `<html data-<name>-state>`; `PortfolioState.snapshot()` returns them all. Read and extend the table in `docs/site/STATE.md` instead of adding booleans, timers or your own Escape/focus-trap handlers.

## CSS Layout

- `assets/css/styles.css` is the Tailwind source stylesheet.
- `assets/css/output.css` is the committed runtime CSS for the maintained pages and legacy pages.
- Do not reintroduce `cdn.tailwindcss.com` on the maintained pages unless there is a deliberate rollback.

## Testing

- Prefer the maintained Playwright smoke suite over stale broad-matrix assumptions.
- Focus changes on real current selectors and user flows on `index.html` and `photo.html`.

## Legacy Routes

`about.html`, `projects.html`, `vision.html`, and `thank-you.html` are `noindex` meta-refresh redirects into homepage sections. Keep them that way. Local harness pages belong under `tests/fixtures/`.
