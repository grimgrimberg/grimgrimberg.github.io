const { test, expect } = require('@playwright/test');

/**
 * Simple Mobile Navigation Test - Basic functionality validation
 * Tests the mobile hamburger menu button and validates navigation behavior
 */

test.describe('Mobile Navigation - Basic Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForLoadState('networkidle');
    });

    test('should show hamburger menu button on mobile', async ({ page }) => {
        // Set mobile viewport (iPhone size)
        await page.setViewportSize({ width: 375, height: 667 });

        // Check hamburger button exists and is visible
        const mobileMenuButton = page.locator('.mobile-menu-button');
        await expect(mobileMenuButton).toBeVisible();

        // Check it contains a hamburger icon
        const iconElement = mobileMenuButton.locator('i.fa-bars');
        await expect(iconElement).toBeVisible();
    });

    test('should hide desktop navigation on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        // Desktop navigation should be hidden on mobile
        const desktopNav = page.locator('nav .hidden.md\\:flex');
        await expect(desktopNav).not.toBeVisible();
    });

    test('should show desktop navigation on desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });

        // Desktop navigation should be visible
        const desktopNav = page.locator('nav .hidden.md\\:flex');
        await expect(desktopNav).toBeVisible();

        // Mobile menu button should be hidden
        const mobileMenuButton = page.locator('.mobile-menu-button');
        await expect(mobileMenuButton).not.toBeVisible();
    });

    test('should respond to hamburger button click', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        // Track console logs to see if click is registered
        const consoleLogs = [];
        page.on('console', msg => consoleLogs.push(msg.text()));

        const mobileMenuButton = page.locator('.mobile-menu-button');
        await mobileMenuButton.click();

        // Should log mobile menu click (current implementation)
        expect(consoleLogs).toContain('Mobile menu clicked');
    });

    test('should maintain responsive behavior across different mobile sizes', async ({ page }) => {
        const mobileSizes = [
            { width: 320, height: 568 }, // iPhone SE
            { width: 375, height: 667 }, // iPhone 8
            { width: 414, height: 896 }, // iPhone 11
            { width: 360, height: 640 }  // Android
        ];

        for (const size of mobileSizes) {
            await page.setViewportSize(size);

            // Mobile menu should be visible on all mobile sizes
            const mobileMenuButton = page.locator('.mobile-menu-button');
            await expect(mobileMenuButton).toBeVisible();

            // Desktop nav should be hidden
            const desktopNav = page.locator('nav .hidden.md\\:flex');
            await expect(desktopNav).not.toBeVisible();
        }
    });

    test('should have clickable navigation links in desktop mode', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });

        // Test that navigation links work in desktop mode
        const navLinks = ['#hero', '#about', '#skills', '#projects', '#contact'];

        for (const link of navLinks) {
            await page.click(`a[href="${link}"]`);
            await page.waitForTimeout(500); // Wait for smooth scroll

            // Check if section is in viewport
            const section = page.locator(link);
            await expect(section).toBeInViewport();
        }
    });

    test('should handle navigation in tablet viewport', async ({ page }) => {
        // Test tablet viewport (768px is the md breakpoint)
        await page.setViewportSize({ width: 768, height: 1024 });

        // At 768px, should show desktop navigation (md:flex kicks in)
        const desktopNav = page.locator('nav .hidden.md\\:flex');
        await expect(desktopNav).toBeVisible();

        // Mobile menu should be hidden
        const mobileMenuButton = page.locator('.mobile-menu-button');
        await expect(mobileMenuButton).not.toBeVisible();
    });
});
