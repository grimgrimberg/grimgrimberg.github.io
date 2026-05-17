# Portfolio Audit And UI Cleanup Design

## Decision

Use a surgical audit pass on the current `codex/portfolio-audit-ui-cleanup`
working tree. The existing Clippy, reviews, retro archive, CV gate, command
center, goose, and contact changes are treated as the current product surface.

## Goals

- Keep the portfolio hireable first and personality-forward second.
- Clean obvious codebase drift without a broad rewrite.
- Tighten the mobile and desktop UI where the current design looks rough,
  inconsistent, clipped, stale, or harder to use than necessary.
- Keep the public surface privacy-conscious: email, LinkedIn, GitHub, public CV
  gate, copy actions, and external source links only.
- Verify the final state through the repo's maintained static, Playwright, and
  browser QA gates.

## Non-Goals

- No full redesign.
- No backend, analytics, contact form service, calendar, phone, WhatsApp, or
  secret-gated CV flow.
- No large module extraction from `assets/js/index-page.js` unless an audit
  finding proves a tiny extraction is safer than leaving it in place.
- No dependency churn unless the current toolchain cannot verify the site.

## Audit Scope

### Codebase Hygiene

- Identify unused or stale JavaScript entrypoints and modules.
- Identify stale Playwright specs that target old `localhost:8000` flows or old
  DOM contracts.
- Remove or quarantine dead artifacts only when they are proven unused by the
  active pages, docs, and maintained tests.
- Keep `assets/css/styles.css` as the Tailwind source of truth and
  `assets/css/output.css` as the generated committed artifact.

### UI Cleanup

- Review `index.html`, `photo.html`, `thank-you.html`, `cv.html`, and legacy
  compatibility pages at desktop and mobile widths.
- Fix obvious hierarchy, spacing, contrast, wrapping, overflow, card alignment,
  button consistency, and section transitions.
- Preserve the current calmer palette unless a specific section is visibly
  broken.
- Keep reviews, roast mode, retro archive, Clippy, and goose as secondary
  personality features.

### Privacy And Static-Site Security

- Keep remote scripts and styles out of maintained pages.
- Keep `target="_blank"` links on `rel="noopener noreferrer"`.
- Confirm there are no phone, WhatsApp, calendar, or private CV details on the
  public surface.
- Keep retro games as external source pages only, with no hosted game files.
- Keep the CV gate framed as scraper friction, not real access control.

## Verification Plan

Use the documented repo commands:

```powershell
npm run build
npm run lint
npm test -- --reporter=line
```

Use rendered browser QA on `http://127.0.0.1:8000/`:

- Confirm page identity and meaningful content.
- Check for framework overlays or blank states.
- Check console errors and relevant warnings.
- Verify at least one interaction from each major feature cluster:
  Command Center, Clippy, contact, CV gate, retro archive, reviews or roast,
  goose, mobile drawer, and photo gallery.
- Check desktop and one mobile viewport, with no horizontal overflow.

## Documentation Rules

- Update `CONTEXT.md` only for stable portfolio vocabulary.
- Create an ADR only if the implementation makes a hard-to-reverse decision
  that would surprise a future maintainer.
- Update README or audit notes only when command behavior, maintained pages, or
  verification gates change.

## Acceptance Criteria

- The active branch is `codex/portfolio-audit-ui-cleanup`.
- The site remains zero-backend and GitHub Pages friendly.
- The maintained pages do not rely on remote scripts or styles.
- No direct hosted game binaries or private contact channels are added.
- The visible UI is cleaner on desktop and mobile without losing the current
  personality.
- Build, lint, maintained Playwright smoke tests, and browser QA pass or any
  remaining blocker is documented with exact evidence.
