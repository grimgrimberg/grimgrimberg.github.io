const { test, expect } = require('@playwright/test');

function siteUrl(relativePath) {
    if (relativePath === 'index.html') {
        return '/';
    }

    return `/${relativePath}`;
}

test.describe('site hygiene', () => {
    test('maintained pages avoid horizontal overflow at mobile widths', async ({ page }) => {
        const widths = [
            { width: 320, height: 568 },
            { width: 390, height: 844 }
        ];

        for (const viewport of widths) {
            await page.setViewportSize(viewport);

            for (const target of ['index.html', 'photo.html']) {
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
});
