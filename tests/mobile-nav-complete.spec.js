const { test, expect } = require('@playwright/test');

// Lean suite: exactly the 3 scenarios requested
test.describe('Mobile navbar', () => {
    test.describe.configure({ mode: 'serial' });
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('http://localhost:8000');
        await page.locator('#mobile-menu-button').waitFor({ state: 'visible', timeout: 15000 });
    });

    test('1) tapping the burger opens the right drawer', async ({ page }) => {
        const burger = page.locator('#mobile-menu-button');
        await expect(burger).toBeVisible();
        await expect(burger).toHaveAttribute('aria-expanded', 'false');

        await burger.click();

        await expect(page.locator('#mobile-menu')).toBeVisible();
        await expect(burger).toHaveAttribute('aria-expanded', 'true');
        // Sanity: drawer panel is attach and visible
        await expect(page.locator('#mobile-menu-panel')).toBeVisible();
    });

    test('2) opening while page is scrolled still shows the drawer', async ({ page }) => {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await page.locator('#mobile-menu-button').click();
        await expect(page.locator('#mobile-menu')).toBeVisible();
        // Body scroll should be disabled
        const overflow = await page.evaluate(() => document.body.style.overflow);
        expect(overflow).toBe('hidden');
    });

    test('3) drawer works while scrolling: panel scrolls, link is visible and clickable', async ({ page }) => {
        await page.locator('#mobile-menu-button').click();
        const panel = page.locator('#mobile-menu-panel');
        await expect(panel).toBeVisible();

        // If content is taller than viewport, panel becomes scrollable
        const scrollable = await panel.evaluate(el => el.scrollHeight > el.clientHeight);
        if (scrollable) await panel.evaluate(el => el.scrollTop = el.scrollHeight);

        const link = panel.locator('.mobile-nav-link', { hasText: 'Projects' });
        await expect(link).toBeVisible();
        await link.click({ noWaitAfter: true });

        // Drawer should close after navigation
        await expect(page.locator('#mobile-menu')).toBeHidden();
        // Land in Projects section (allow smooth-scroll time)
        await page.waitForTimeout(200);
        await expect(page.locator('#projects')).toBeVisible();
    });
});
