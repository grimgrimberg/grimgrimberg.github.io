# Yuval Grimberg Portfolio

Static personal site for [grimgrimberg.github.io](https://grimgrimberg.github.io).

## What This Repo Actually Is

- Root-served static HTML/CSS/JS for GitHub Pages.
- Primary maintained pages:
  - `index.html`
  - `photo.html`
  - `thank-you.html`
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

- The primary pages still use the Tailwind CDN in this phase.
- `npm run build` produces `assets/css/output.css`, which is still used by legacy pages.
- That means the built CSS is not yet the runtime source of truth for the primary pages.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start a local static server from the repo root:

```bash
python -m http.server 8000
```

3. Open:

- [http://localhost:8000/](http://localhost:8000/)
- [http://localhost:8000/photo.html](http://localhost:8000/photo.html)

## Commands

```bash
npm test
npm run test:headed
npm run build
npm run watch
```

- `npm test` runs the maintained Playwright smoke suite.
- `npm run build` rebuilds `assets/css/output.css` for legacy pages and any future migration away from the CDN flow.

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
index.html
photo.html
thank-you.html
```

## Notes

- `.nojekyll` is present so GitHub Pages serves the repo as plain static files.
- Legacy pages are intentionally kept reachable, but they are not the main maintained user journey.
