# Yuval Grimberg Portfolio

Static personal site for [grimgrimberg.github.io](https://grimgrimberg.github.io).

## What This Repo Actually Is

- Root-served static HTML/CSS/JS for GitHub Pages.
- Primary maintained pages:
  - `index.html`
  - `photo.html`
  - `cv.html`
  - `fly101.html` (project notes; the Fly101 repo is private, so never link to it or copy private paths)
  - `404.html` (served by GitHub Pages for any missing path, so it uses root-absolute URLs)
- Legacy URLs kept as `noindex` redirects into homepage sections:
  - `about.html`, `projects.html`, `vision.html`, `thank-you.html`
- Crawl and sharing files: `robots.txt`, `sitemap.xml`, `apple-touch-icon.png`, `assets/images/og-card.png`

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
- The interactive labs live in:
  - `assets/js/portfolio-labs.js`: lab switching, plus a lazy loader that imports the scenes when a lab nears the viewport or the page goes idle
  - `assets/js/path-playground.js` and `assets/js/lab-experiments.js`: the three.js scenes
  - `assets/js/lab-models.mjs`: the pure simulation models, tested by `npm run test:models`
  - `assets/js/fly-brain.js`: the connectome point cloud, shared by the `Connectome` lab and `fly101.html`
- Clippy (jQuery + clippy.js, about 1.5 MB with the sprite sheet) is injected on demand: after page load on desktop, on the first Guide click on phones.

## CSS Story

- `assets/css/styles.css` is the Tailwind v4 source-of-truth stylesheet.
- `npm run build` produces the committed `assets/css/output.css` used by every page. CI fails if it is stale.
- `assets/css/original-plus-3d.css` holds hand-written overrides for the hero, nav, labs and goose, loaded after `output.css` on the homepage.
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
- [http://127.0.0.1:8000/cv.html](http://127.0.0.1:8000/cv.html)

## Commands

```bash
npm run lint
npm run test:models
npm test
npm run test:headed
npm run build
npm run watch
npm run serve
```

- `npm run lint` runs the repo-specific static and runtime hygiene checks.
- `npm run test:models` checks the lab simulation models in plain Node.
- `npm test` runs the maintained Playwright smoke suite.
- `.github/workflows/site-checks.yml` runs the build check, lint, model tests and smoke suite on pushes to `dev` and on pull requests.
- Use `npm run lint` and `npm test -- --reporter=line` as the default acceptance gates before pushing portfolio changes.
- `npm run build` rebuilds the committed Tailwind CSS used by the site pages.
- `npm run serve` launches the same local static server shape the smoke suite uses.

## File Guide

```text
assets/
  css/
    styles.css
    output.css
    original-plus-3d.css
  data/
    github-repos.json
  images/
    fly101/          # renders of the connectome, fly and arm
    projects/        # line-art schematics for the project cards
    icons/           # inline-ready skill icons
  js/
    index-page.js
    photo-page.js
    site-shell.js
    portfolio-labs.js
    path-playground.js
    lab-experiments.js
    lab-models.mjs
    fly-brain.js
  vendor/
    clippyjs/
    three/
scripts/
  lint-site.mjs
  optimize-images.ps1
tests/
  README.md
  fixtures/
    mobile-nav-test.html
  site-hygiene.spec.js
  smoke.spec.js
docs/
  site/
    CONTEXT.md
    DESIGN.md
    PRODUCT.md
    SETUP_INSTRUCTIONS.md
  archive/
    AUDIT_SITE_PASS_1.md
    CHANGELOG_SITE_PASS_1.md
    REFACTORING_SUMMARY.md
index.html
photo.html
cv.html
fly101.html
404.html
robots.txt
sitemap.xml
```

## Notes

- `.nojekyll` is present so GitHub Pages serves the repo as plain static files.
- Legacy pages are intentionally kept reachable, but they are not the main maintained user journey.
- Root markdown is intentionally sparse. Product/design context lives under `docs/site/`, while older audit notes live under `docs/archive/`.
