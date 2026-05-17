const { test, expect } = require('@playwright/test');

const ROOT_HTML_PAGES = [
    'index.html',
    'photo.html',
    'thank-you.html',
    'about.html',
    'projects.html',
    'vision.html',
    'cv.html',
    'mobile-nav-test.html'
];

function siteUrl(relativePath) {
    if (relativePath === 'index.html') {
        return '/';
    }

    return `/${relativePath}`;
}

test.describe('site hygiene', () => {
    test('all root html pages avoid horizontal overflow at mobile widths', async ({ page }) => {
        const widths = [
            { width: 320, height: 568 },
            { width: 375, height: 812 },
            { width: 390, height: 844 }
        ];

        for (const viewport of widths) {
            await page.setViewportSize(viewport);

            for (const target of ROOT_HTML_PAGES) {
                await page.goto(siteUrl(target), { waitUntil: 'domcontentloaded' });
                const overflow = await page.evaluate(() => ({
                    documentWidth: document.documentElement.scrollWidth,
                    viewportWidth: window.innerWidth
                }));

                expect(
                    overflow.documentWidth,
                    `${target} should not overflow horizontally at ${viewport.width}px`
                ).toBeLessThanOrEqual(overflow.viewportWidth + 1);
            }
        }
    });

    test('all root html pages load without blocking mobile runtime errors', async ({ page }) => {
        const failures = [];

        page.on('pageerror', (error) => {
            failures.push(`pageerror: ${error.message}`);
        });

        page.on('console', (message) => {
            if (message.type() === 'error') {
                failures.push(`console error: ${message.text()}`);
            }
        });

        await page.setViewportSize({ width: 390, height: 844 });

        for (const target of ROOT_HTML_PAGES) {
            failures.length = 0;
            await page.goto(siteUrl(target), { waitUntil: 'domcontentloaded' });

            expect(failures, `${target} should not emit blocking errors on mobile`).toEqual([]);
        }
    });

    test('maintained pages keep skip links connected to the main landmark', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });

        for (const target of ['index.html', 'photo.html']) {
            await page.goto(siteUrl(target), { waitUntil: 'domcontentloaded' });
            await page.keyboard.press('Tab');

            const skipLink = page.locator('.skip-link');
            await expect(skipLink, `${target} should expose a keyboard-first skip link`).toBeFocused();
            await skipLink.click();

            await expect(page.locator('#main-content'), `${target} should keep the main landmark reachable`).toBeInViewport();
        }
    });

    test('homepage keeps the public surface privacy-hardened', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        await expect(page.locator('script[src^="https://"]')).toHaveCount(0);
        await expect(page.locator('[onclick], [onload], [onerror], [onmouseover]')).toHaveCount(0);
        await expect(page.locator('a[href^="tel:"], a[href*="wa.me"], a[href*="whatsapp"], a[href*="calendar"]')).toHaveCount(0);
        await expect(page.locator('a[href$=".pdf"], a[href*=".pdf?"]')).toHaveCount(0);

        const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
        expect(csp).toContain("script-src 'self'");
        expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");

        const referrer = await page.locator('meta[name="referrer"]').getAttribute('content');
        expect(referrer).toBe('no-referrer');
    });

    test('root pages avoid remote scripts and stylesheets', async ({ page }) => {
        for (const target of ROOT_HTML_PAGES) {
            await page.goto(siteUrl(target), { waitUntil: 'domcontentloaded' });
            await expect(
                page.locator('script[src^="https://"], link[rel="stylesheet"][href^="https://"]'),
                `${target} should not depend on remote runtime or stylesheet assets`
            ).toHaveCount(0);
        }
    });
});
