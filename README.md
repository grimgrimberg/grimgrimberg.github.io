# Yuval Grimberg Portfolio

Static personal site for [grimgrimberg.github.io](https://grimgrimberg.github.io).

## What This Repo Actually Is

- Root-served static HTML/CSS/JS for GitHub Pages.
- Primary maintained pages:
  - `index.html`
  - `photo.html`
  - `thank-you.html`
  - `cv.html`
- Legacy compatibility pages:
  - `about.html`
  - `projects.html`
  - `vision.html`
  - `mobile-nav-test.html`

This repo is not React and is not driven by Jekyll templates in its current maintained flow.

## Branch Model

- `dev` is the working/source branch convention for this repo.
- Feature work should branch from `dev`.
- The GitHub Pages publish setting is a repository setting, so this repo does not assume a specific deploy branch unless that is verified in GitHub.

## Runtime Shape

- `index.html` and `photo.html` are the main live surfaces.
- Shared shell behavior lives in `assets/js/site-shell.js`.
- Page-specific behavior lives in:
  - `assets/js/index-page.js`
  - `assets/js/photo-page.js`
- Legacy standalone pages still use `assets/js/scripts.js`.

## CSS Story

- `assets/css/styles.css` is the Tailwind v4 source-of-truth stylesheet.
- `npm run build` produces the committed `assets/css/output.css` used by the maintained pages and legacy compatibility pages.
- Primary pages no longer depend on the Tailwind CDN runtime.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start a local static server from the repo root:

```bash
npm run serve
```

3. Open:

- [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- [http://127.0.0.1:8000/photo.html](http://127.0.0.1:8000/photo.html)
- [http://127.0.0.1:8000/thank-you.html](http://127.0.0.1:8000/thank-you.html)

## Commands

```bash
npm run lint
npm test
npm run test:headed
npm run build
npm run watch
npm run serve
```

- `npm run lint` runs the repo-specific static and runtime hygiene checks.
- `npm test` runs the maintained Playwright smoke suite.
- Use `npm run lint` and `npm test -- --reporter=line` as the default acceptance gates before pushing portfolio changes.
- `npm run build` rebuilds the committed Tailwind CSS used by the site pages.
- `npm run serve` launches the same local static server shape the smoke suite uses.

## File Guide

```text
assets/
  css/
    styles.css
    output.css
  js/
    index-page.js
    photo-page.js
    site-shell.js
    scripts.js
tests/
  README.md
  site-hygiene.spec.js
  smoke.spec.js
index.html
photo.html
thank-you.html
cv.html
```

## Notes

- `.nojekyll` is present so GitHub Pages serves the repo as plain static files.
- Legacy pages are intentionally kept reachable, but they are not the main maintained user journey.
