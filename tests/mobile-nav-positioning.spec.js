const { test, expect } = require('@playwright/test');

test.describe('Mobile Navigation Positioning Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForLoadState('networkidle');
    });

    test('mobile menu button should be visible and accessible on mobile viewport', async ({ page }) => {
        // Set mobile viewport (iPhone 12)
        await page.setViewportSize({ width: 390, height: 844 });

        // Check that mobile menu button exists and is visible
        const mobileMenuButton = page.locator('#mobile-menu-button');
        await expect(mobileMenuButton).toBeVisible();

        // Check button is within viewport bounds
        const buttonBox = await mobileMenuButton.boundingBox();
        const viewport = page.viewportSize();

        expect(buttonBox.x).toBeGreaterThanOrEqual(0);
        expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(viewport.width);
        expect(buttonBox.y).toBeGreaterThanOrEqual(0);
        expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(viewport.height);

        // Test button accessibility
        await expect(mobileMenuButton).toHaveAttribute('aria-label', 'Toggle mobile menu');
        await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');

        // Test button click functionality
        await mobileMenuButton.click();

        // Verify menu opens
        const mobileMenu = page.locator('#mobile-menu');
        await expect(mobileMenu).toBeVisible();

        // Verify aria-expanded changes
        await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
    });

    test('mobile menu button should remain visible on very small screens', async ({ page }) => {
        // Test on very small viewport (iPhone SE size)
        await page.setViewportSize({ width: 320, height: 568 });

        const mobileMenuButton = page.locator('#mobile-menu-button');
        await expect(mobileMenuButton).toBeVisible();

        // Ensure no horizontal scroll is needed
        const buttonBox = await mobileMenuButton.boundingBox();
        expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(320);
    });

    test('navigation container should not cause horizontal overflow', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 568 });

        // Check that the navigation doesn't cause horizontal scroll
        const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = page.viewportSize().width;

        expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth);
    });
});
