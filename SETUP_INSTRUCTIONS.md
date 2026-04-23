# Setup Instructions

## Purpose

This repo is a root-static GitHub Pages site. The maintained user-facing flow lives in `index.html`, `photo.html`, and `thank-you.html`.

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
- [http://127.0.0.1:8000/thank-you.html](http://127.0.0.1:8000/thank-you.html)

## Optional CSS Build

```bash
npm run build
```

Use this when you change Tailwind classes, theme tokens, or shared site styles. The primary pages now load the generated local CSS directly.

## Testing

```bash
npm test
```

The maintained Playwright suite is a small smoke matrix aimed at the current live pages, not a broad cross-device lab.

## Branching

- Treat `dev` as the working/source branch convention.
- Create review branches from `dev`.

## Legacy Pages

`about.html`, `projects.html`, `vision.html`, and `mobile-nav-test.html` remain in the repo for compatibility and reference, but they are not the primary maintained surfaces.
