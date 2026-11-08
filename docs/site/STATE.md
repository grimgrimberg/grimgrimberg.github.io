# Interactive State

Every interactive part of the site is an explicit state machine built with
`assets/js/state-machine.js`. A machine has one named state and a fixed list of
allowed transitions. Its state is mirrored onto `<html>` as `data-<name>-state`.

## Reading state

- **In the browser console, a test or an agent:** `PortfolioState.snapshot()`
  returns every machine's current state, for example
  `{ menu: 'closed', palette: 'open', lab: 'drive', ... }`.
- **From the DOM:** read `document.documentElement.dataset`, or select on the
  attribute: `html[data-palette-state="open"]`.
- **Watching changes:** listen for `portfolio:state` on `document`.
  `event.detail` is `{ machine, from, to, event }`.
- **Overlays:** `<html data-overlay-top="...">` names the overlay that
  currently owns Escape and Tab.

Prefer these over inferring state from classes, `hidden`, opacity or text.

## Rules

- **Change state only with `machine.send(event)`.** It returns `false` and
  changes nothing when the current state has no such event. Use that return
  value to guard re-entry, double clicks and late timers. Do not add parallel
  booleans.
- **Use the shared shapes.**
  - `defineLoader(name)` gives `idle → loading → ready | failed`, and `failed`
    can retry.
  - `defineChoice(name, options)` gives exclusive selections.
- **Overlays register with `PortfolioState.overlays.open(name, { close,
  container })`** and unregister with `overlays.remove(name)` when they close.
  Escape closes only the top overlay, and only the top overlay traps Tab. Do not
  add your own Escape or focus-trap listeners.
- **When you add a machine,** add a row below and a test that reads its
  `data-<name>-state`.

## Machines

| Machine | Page | States | Owner |
| --- | --- | --- | --- |
| `menu` | index, photo | closed → opening → open → closing → closed (opening and closing are the 300 ms slide) | `site-shell.js` |
| `palette` | index | closed, open | `index-page.js` |
| `dialog` | index | closed, open (retro source and nomination dialogs; only one at a time) | `index-page.js` |
| `goose` | index | idle, loose (goose terror mode) | `index-page.js` |
| `clippy` | index | idle, loading, ready, failed (the animated agent's scripts and sprites) | `index-page.js` |
| `helper` | index | hidden, text, agent (which helper is on screen) | `index-page.js` |
| `contact` | index | editing, drafted ("Build another draft" returns to editing and keeps what was typed) | `index-page.js` |
| `email-copy` | index | idle, copying, copied, failed | `index-page.js` |
| `hire` | index | robotics, autonomy, simulation, ai | `index-page.js` |
| `lab` | index | drive, space, perception, reconstruction, brain | `portfolio-labs.js` |
| `reconstruction` | index | closed, open (the cross-origin viewer iframe is requested and holding WebGL) | `portfolio-labs.js` |
| `lab-drive`, `lab-experiments`, `brain-lab` | index | loader states for each lab's code and data | `portfolio-labs.js` |
| `drive-scene` | index | uninitialized, ready, unavailable (WebGL) | `path-playground.js` |
| `drive-run` | index | stopped, running, complete | `path-playground.js` |
| `experiment-scene` | index | uninitialized, ready, unavailable (WebGL) | `lab-experiments.js` |
| `experiment-run` | index | paused, playing | `lab-experiments.js` |
| `brain-hero` | fly101 | loader states for the rotating brain | `fly-brain.js` |

## Not machines

These are derived signals, not states, so they stay as they are:

- **Reading position on `<body>`:** `quiet-reading`, `path-scene-near` and
  `hero-intro-near` are recomputed from intersection observers.
- **The scrolled nav background.**
- **The click counter and the retro source counter.**

`photo-page.js` (the gallery) is not converted yet. Photo changes need the
owner's approval first.
