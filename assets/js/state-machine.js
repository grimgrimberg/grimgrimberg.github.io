// Explicit state machines for the portfolio's interactive parts.
// Every machine mirrors its state onto <html> as data-<name>-state, so CSS, tests and agents read one attribute
// instead of inferring state from classes, timers or `hidden`. docs/site/STATE.md lists every machine.
(function () {
    'use strict';

    const machines = new Map();
    const root = document.documentElement;

    /**
     * define('menu', { initial: 'closed', states: { closed: { open: 'opening' }, ... } })
     * send(event) returns false and changes nothing when the current state has no such event,
     * which makes re-entry, double clicks and late timers harmless by construction.
     */
    function define(name, { initial, states }) {
        if (!(initial in states)) {
            throw new Error(`State machine "${name}" has no initial state "${initial}"`);
        }

        let current = initial;
        const attribute = `data-${name}-state`;
        root.setAttribute(attribute, current);

        const machine = {
            name,
            get state() {
                return current;
            },
            is(...candidates) {
                return candidates.includes(current);
            },
            can(event) {
                return Boolean(states[current][event]);
            },
            send(event, detail) {
                const next = states[current][event];
                if (!next) {
                    return false;
                }
                const from = current;
                current = next;
                root.setAttribute(attribute, current);
                document.dispatchEvent(new CustomEvent('portfolio:state', {
                    detail: { machine: name, from, to: next, event, ...detail }
                }));
                return true;
            }
        };

        machines.set(name, machine);
        return machine;
    }

    // The common lazy-load shape: idle → loading → ready | failed, with retry from failed.
    function defineLoader(name) {
        return define(name, {
            initial: 'idle',
            states: {
                idle: { load: 'loading' },
                loading: { resolve: 'ready', reject: 'failed' },
                ready: {},
                failed: { load: 'loading' }
            }
        });
    }

    // Exclusive selections (lab picker, hire tabs): any option can follow any other, and the event is the option's name.
    function defineChoice(name, options, initial = options[0]) {
        const states = Object.fromEntries(options.map((option) => [
            option,
            Object.fromEntries(options.filter((other) => other !== option).map((other) => [other, other]))
        ]));
        return define(name, { initial, states });
    }

    // Overlays (drawer, palette, dialogs, goose) form a stack. Escape closes only the top one and only the top one
    // traps Tab, so layered overlays no longer fight over focus or all close on one key press.
    const overlayStack = [];
    const overlays = {
        open(name, { close, container = null }) {
            overlays.remove(name);
            overlayStack.push({ name, close, container });
            root.setAttribute('data-overlay-top', name);
        },
        remove(name) {
            const index = overlayStack.findIndex((entry) => entry.name === name);
            if (index !== -1) {
                overlayStack.splice(index, 1);
            }
            const top = overlayStack[overlayStack.length - 1];
            if (top) {
                root.setAttribute('data-overlay-top', top.name);
            } else {
                root.removeAttribute('data-overlay-top');
            }
        },
        top() {
            return overlayStack[overlayStack.length - 1]?.name || null;
        }
    };

    function focusableIn(container) {
        return [...container.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])')]
            .filter((element) => !element.disabled && element.getClientRects().length && !element.closest('details:not([open]) > :not(summary)'));
    }

    document.addEventListener('keydown', (event) => {
        const top = overlayStack[overlayStack.length - 1];
        if (!top) {
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopImmediatePropagation();
            top.close('escape');
            return;
        }

        if (event.key !== 'Tab' || !top.container) {
            return;
        }

        const focusable = focusableIn(top.container);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first) {
            return;
        }
        if (!top.container.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
            event.preventDefault();
            (event.shiftKey ? last : first).focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }, true);

    window.PortfolioState = {
        define,
        defineLoader,
        defineChoice,
        overlays,
        get(name) {
            return machines.get(name) || null;
        },
        // One call for tests and agents: every machine's current state.
        snapshot() {
            return Object.fromEntries([...machines].map(([name, machine]) => [name, machine.state]));
        }
    };
})();
