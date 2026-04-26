const { test, expect } = require('@playwright/test');

const pagesToCheck = ['/', '/photo.html', '/about.html', '/projects.html', '/thank-you.html'];

test.describe('site hardening pass 1', () => {
    test('user-facing pages avoid placeholder anchors', async ({ page }) => {
        for (const path of pagesToCheck) {
            await page.goto(path);

            const placeholderLinks = await page.locator('a[href="#"]').evaluateAll((links) =>
                links.map((link) => ({
                    text: (link.textContent || '').trim(),
                    href: link.getAttribute('href')
                }))
            );

            expect(placeholderLinks, `${path} still contains placeholder anchors`).toEqual([]);
        }
    });

    test('external links opened in new tabs are hardened', async ({ page }) => {
        for (const path of pagesToCheck) {
            await page.goto(path);

            const unsafeLinks = await page.locator('a[target="_blank"]').evaluateAll((links) =>
                links
                    .map((link) => ({
                        href: link.href,
                        rel: link.getAttribute('rel') || ''
                    }))
                    .filter((link) => {
                        const relParts = link.rel.split(/\s+/).filter(Boolean);
                        return !relParts.includes('noopener') || !relParts.includes('noreferrer');
                    })
            );

            expect(unsafeLinks, `${path} has target=_blank links without rel hardening`).toEqual([]);
        }
    });

    test('photo page mobile navigation opens and closes', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/photo.html');

        const menuButton = page.locator('#mobile-menu-button');
        await expect(menuButton).toBeVisible();
        await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

        await menuButton.click();

        await expect(page.locator('#mobile-menu')).toBeVisible();
        await expect(page.locator('#mobile-menu-panel')).toBeVisible();
        await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

        await page.locator('#mobile-menu-backdrop').click();
        await expect(page.locator('#mobile-menu')).toBeHidden();
        await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });
});
