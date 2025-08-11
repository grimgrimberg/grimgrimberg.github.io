const { test, expect } = require('@playwright/test');

/**
 * Mobile Navigation Test Suite
 * Tests mobile hamburger menu functionality and responsive navigation
 */

test.describe('Mobile Navigation Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Mobile Menu Button', () => {
        
        test('should display hamburger menu on mobile viewports', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Check hamburger button is visible on mobile
            const mobileMenuButton = page.locator('.mobile-menu-button');
            await expect(mobileMenuButton).toBeVisible();
            
            // Verify desktop navigation is hidden on mobile
            const desktopNav = page.locator('nav .hidden.md\\:flex');
            await expect(desktopNav).not.toBeVisible();
        });

        test('should hide hamburger menu on desktop viewports', async ({ page }) => {
            // Set desktop viewport
            await page.setViewportSize({ width: 1920, height: 1080 });
            
            // Check hamburger button is hidden on desktop
            const mobileMenuButton = page.locator('.mobile-menu-button');
            await expect(mobileMenuButton).not.toBeVisible();
            
            // Verify desktop navigation is visible
            const desktopNav = page.locator('nav .hidden.md\\:flex');
            await expect(desktopNav).toBeVisible();
        });
    });

    test.describe('Mobile Menu Functionality', () => {
        
        test('should toggle mobile menu when hamburger button is clicked', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            const mobileMenuButton = page.locator('.mobile-menu-button');
            
            // Click hamburger button
            await mobileMenuButton.click();
            
            // Check if mobile menu appears (this will fail until implemented)
            const mobileMenu = page.locator('#mobile-menu, .mobile-menu');
            await expect(mobileMenu).toBeVisible();
            
            // Click again to close
            await mobileMenuButton.click();
            await expect(mobileMenu).not.toBeVisible();
        });

        test('should contain all navigation links in mobile menu', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Open mobile menu
            await page.click('.mobile-menu-button');
            
            // Check for navigation links
            const expectedLinks = ['Home', 'About', 'Expertise', 'Projects', 'Fun Zone', 'Contact'];
            
            for (const linkText of expectedLinks) {
                const link = page.locator('#mobile-menu').getByRole('link', { name: linkText });
                await expect(link).toBeVisible();
            }
        });

        test('should close mobile menu when clicking outside', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Open mobile menu
            await page.click('.mobile-menu-button');
            
            const mobileMenu = page.locator('#mobile-menu');
            await expect(mobileMenu).toBeVisible();
            
            // Click outside menu (on backdrop)
            await page.click('body', { position: { x: 50, y: 200 } });
            
            // Menu should close
            await expect(mobileMenu).not.toBeVisible();
        });

        test('should close mobile menu when navigation link is clicked', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Open mobile menu
            await page.click('.mobile-menu-button');
            
            const mobileMenu = page.locator('#mobile-menu');
            await expect(mobileMenu).toBeVisible();
            
            // Click a navigation link
            await page.click('#mobile-menu a[href="#about"]');
            
            // Menu should close and page should scroll to section
            await expect(mobileMenu).not.toBeVisible();
            await expect(page.locator('#about')).toBeInViewport();
        });
    });

    test.describe('Mobile Navigation Accessibility', () => {
        
        test('should have proper ARIA attributes on hamburger button', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            const mobileMenuButton = page.locator('.mobile-menu-button');
            
            // Check ARIA attributes
            await expect(mobileMenuButton).toHaveAttribute('aria-label');
            await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
            
            // Click to open menu
            await mobileMenuButton.click();
            await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
        });

        test('should support keyboard navigation', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Focus hamburger button with keyboard
            await page.keyboard.press('Tab');
            const mobileMenuButton = page.locator('.mobile-menu-button');
            await expect(mobileMenuButton).toBeFocused();
            
            // Press Enter to open menu
            await page.keyboard.press('Enter');
            const mobileMenu = page.locator('#mobile-menu');
            await expect(mobileMenu).toBeVisible();
            
            // Press Escape to close menu
            await page.keyboard.press('Escape');
            await expect(mobileMenu).not.toBeVisible();
        });
    });

    test.describe('Mobile Menu Animation', () => {
        
        test('should animate menu open/close smoothly', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            const mobileMenuButton = page.locator('.mobile-menu-button');
            const mobileMenu = page.locator('#mobile-menu');
            
            // Open menu and check animation
            await mobileMenuButton.click();
            await expect(mobileMenu).toBeVisible();
            
            // Check for transform or opacity transition
            const menuStyle = await mobileMenu.getAttribute('style');
            expect(menuStyle).toContain('transform'); // or 'transition'
        });

        test('should transform hamburger icon to X when open', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            const hamburgerIcon = page.locator('.mobile-menu-button i');
            
            // Initially should show bars icon
            await expect(hamburgerIcon).toHaveClass(/fa-bars/);
            
            // Click to open menu
            await page.click('.mobile-menu-button');
            
            // Icon should change to X or have active class
            await expect(hamburgerIcon).toHaveClass(/fa-times|fa-x|active/);
        });
    });

    test.describe('Mobile Menu Touch Interactions', () => {
        
        test('should handle touch events properly', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Enable touch events
            await page.emulateMedia({ media: 'screen' });
            
            const mobileMenuButton = page.locator('.mobile-menu-button');
            
            // Use tap instead of click for mobile
            await mobileMenuButton.tap();
            
            const mobileMenu = page.locator('#mobile-menu');
            await expect(mobileMenu).toBeVisible();
        });

        test('should support swipe gestures to close menu', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Open mobile menu
            await page.click('.mobile-menu-button');
            
            const mobileMenu = page.locator('#mobile-menu');
            await expect(mobileMenu).toBeVisible();
            
            // Simulate swipe left gesture
            await page.mouse.move(350, 300);
            await page.mouse.down();
            await page.mouse.move(50, 300);
            await page.mouse.up();
            
            // Menu should close (if swipe gesture is implemented)
            await expect(mobileMenu).not.toBeVisible();
        });
    });

    test.describe('Cross-Device Navigation Consistency', () => {
        
        test('should maintain navigation state across viewport changes', async ({ page }) => {
            // Start on desktop
            await page.setViewportSize({ width: 1920, height: 1080 });
            
            // Navigate to a section
            await page.click('a[href="#about"]');
            await expect(page.locator('#about')).toBeInViewport();
            
            // Resize to mobile
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Should still be on the same section
            await expect(page.locator('#about')).toBeInViewport();
            
            // Mobile menu should be available
            await expect(page.locator('.mobile-menu-button')).toBeVisible();
        });

        test('should have consistent link behavior between desktop and mobile', async ({ page }) => {
            const testLink = '#projects';
            
            // Test desktop navigation
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.click(`a[href="${testLink}"]`);
            await expect(page.locator(testLink)).toBeInViewport();
            
            // Reset scroll position
            await page.goto('http://localhost:8000');
            
            // Test mobile navigation
            await page.setViewportSize({ width: 375, height: 667 });
            await page.click('.mobile-menu-button');
            await page.click(`#mobile-menu a[href="${testLink}"]`);
            await expect(page.locator(testLink)).toBeInViewport();
        });
    });
});
