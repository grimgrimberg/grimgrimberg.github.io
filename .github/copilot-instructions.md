# Repository Notes

## Reality Check

- This repo is a root-static GitHub Pages site.
- The maintained pages are `index.html`, `photo.html`, and `thank-you.html`.
- `dev` is the working/source branch convention.
- Do not assume `main` is the source branch.
- Do not assume Jekyll templates or GitHub Actions are part of the active runtime unless the repo is changed to make that true.

## Runtime Layout

- Shared shell and navigation logic: `assets/js/site-shell.js`
- Homepage behavior: `assets/js/index-page.js`
- Photography page behavior: `assets/js/photo-page.js`
- Legacy helper script: `assets/js/scripts.js`

## CSS Layout

- Primary pages still use the Tailwind CDN in this phase.
- `assets/css/output.css` remains relevant for legacy pages.
- Do not claim the built CSS is the production truth for the primary pages.

## Testing

- Prefer the maintained Playwright smoke suite over stale broad-matrix assumptions.
- Focus changes on real current selectors and user flows on `index.html` and `photo.html`.

## Legacy Routes

`about.html`, `projects.html`, `vision.html`, and `mobile-nav-test.html` are compatibility-only routes. Keep them low-risk and avoid treating them as primary product surfaces unless the repo is intentionally reoriented.
