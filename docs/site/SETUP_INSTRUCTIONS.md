# Setup Instructions

## Purpose

This repo is a root-static GitHub Pages site. The maintained user-facing flow lives in `index.html`, `photo.html`, and `cv.html`, plus `404.html` for missing routes.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start a local static server:

```bash
npm run serve
```

3. Open the maintained pages:

- [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- [http://127.0.0.1:8000/photo.html](http://127.0.0.1:8000/photo.html)
- [http://127.0.0.1:8000/cv.html](http://127.0.0.1:8000/cv.html)

## Optional CSS Build

```bash
npm run build
```

Use this when you change Tailwind classes, theme tokens, or shared site styles. The primary pages now load the generated local CSS directly.

## Testing

```bash
npm run lint
npm run test:models
npm test
```

- `npm run lint` runs the repo-specific static and runtime hygiene checks.
- `npm run test:models` checks the lab simulation models in plain Node.
- `npm test` runs the maintained Playwright smoke matrix aimed at the current live pages, not a broad cross-device lab.
- `.github/workflows/site-checks.yml` runs all of the above, plus a check that `output.css` matches `styles.css`, on pushes to `dev` and on pull requests.

## Branching

- Treat `dev` as the working/source branch convention.
- Create review branches from `dev`.

## Legacy Pages

`about.html`, `projects.html`, `vision.html`, and `thank-you.html` are tiny `noindex` redirect pages into the matching homepage section, so old links still land somewhere useful. Local harness pages live under `tests/fixtures/`.
