# Portfolio Test Suites

This repo keeps two maintained Playwright surfaces:

- `smoke.spec.js` runs through `npm test` using `playwright.config.js`.
- `site-hygiene.spec.js` runs through `npm run lint:runtime` using `playwright.hygiene.config.js`.
- `fixtures/mobile-nav-test.html` is a legacy navigation harness covered by hygiene checks. It is publicly accessible because GitHub Pages publishes the repository root.

Use `npm run lint` and `npm test -- --reporter=line` as the default acceptance
gates for portfolio changes. Older one-off specs were removed because they
targeted stale `localhost:8000` flows or duplicated checks now covered by the
maintained smoke and hygiene suites.
