const { test, expect } = require('@playwright/test');

const CHECKED_HTML_PAGES = [
    'index.html',
    'photo.html',
    'cv.html',
    'fly101.html',
    '404.html',
    'tests/fixtures/mobile-nav-test.html'
];

const LEGACY_REDIRECTS = {
    'about.html': '#about',
    'projects.html': '#projects',
    'vision.html': '#about',
    'thank-you.html': '#contact'
};

function siteUrl(relativePath) {
    if (relativePath === 'index.html') {
        return '/';
    }

    return `/${relativePath}`;
}

test.describe('site hygiene', () => {
    test('checked html pages avoid horizontal overflow at mobile widths', async ({ page }) => {
        const widths = [
            { width: 320, height: 568 },
            { width: 375, height: 812 },
            { width: 390, height: 844 }
        ];

        for (const viewport of widths) {
            await page.setViewportSize(viewport);

            for (const target of CHECKED_HTML_PAGES) {
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

    test('checked html pages load without blocking mobile runtime errors', async ({ page }) => {
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

        for (const target of CHECKED_HTML_PAGES) {
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
            await expect(page.locator('#main-content'), `${target} skip link should move keyboard focus into main`).toBeFocused();
            await expect(page, `${target} skip link should update the URL hash`).toHaveURL(/#main-content$/);
        }
    });

    test('legacy pages redirect into the matching homepage section', async ({ page }) => {
        for (const [legacyPage, hash] of Object.entries(LEGACY_REDIRECTS)) {
            await page.goto(siteUrl(legacyPage));
            await page.waitForURL((url) => url.pathname.endsWith('/index.html') && url.hash === hash);
        }
    });

    test('homepage keeps the public surface privacy-hardened', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        await expect(page.locator('script[src^="https://"]')).toHaveCount(0);
        await expect(page.locator('[onclick], [onload], [onerror], [onmouseover]')).toHaveCount(0);
        await expect(page.locator('a[href^="tel:"], a[href*="wa.me"], a[href*="whatsapp"], a[href*="calendar"]')).toHaveCount(0);
        const publicPdf = page.locator('a[href$=".pdf"], a[href*=".pdf?"]');
        await expect(publicPdf).toHaveCount(1);
        await expect(publicPdf).toHaveAttribute('href', 'assets/cv/yuval-grimberg-master-cv-september-2026.pdf');
        await expect(publicPdf).toHaveAttribute('download', '');

        const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
        expect(csp).toContain("script-src 'self'");
        expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");

        const referrer = await page.locator('meta[name="referrer"]').getAttribute('content');
        expect(referrer).toBe('no-referrer');
    });

    test('checked html pages avoid remote scripts and stylesheets', async ({ page }) => {
        for (const target of CHECKED_HTML_PAGES) {
            await page.goto(siteUrl(target), { waitUntil: 'domcontentloaded' });
            await expect(
                page.locator('script[src^="https://"], link[rel="stylesheet"][href^="https://"]'),
                `${target} should not depend on remote runtime or stylesheet assets`
            ).toHaveCount(0);
        }
    });
});
