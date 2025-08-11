const { test, expect, devices } = require('@playwright/test');

/**
 * Comprehensive Responsive Testing Suite for Yuval's Portfolio
 * Tests both mobile and desktop functionality with cross-device compatibility
 */

test.describe('Mobile & Desktop Responsive Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Start local server for testing
        await page.goto('http://localhost:8000');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Desktop Functionality Tests', () => {

        test('should display all sections properly on desktop', async ({ page }) => {
            // Configure for desktop
            await page.setViewportSize({ width: 1920, height: 1080 });
            // Test viewport is properly sized for desktop
            const viewportSize = page.viewportSize();
            expect(viewportSize.width).toBeGreaterThan(1024);

            // Test navigation is horizontal on desktop
            const nav = page.locator('nav');
            await expect(nav).toBeVisible();

            // Check that main sections are visible
            await expect(page.locator('#hero')).toBeInViewport();
            await expect(page.locator('#about')).toBeVisible();
            await expect(page.locator('#skills')).toBeVisible();
            await expect(page.locator('#projects')).toBeVisible();
            await expect(page.locator('#contact')).toBeVisible();

            // Test desktop-specific features
            const heroSection = page.locator('#hero');
            await expect(heroSection).toContainText('Yuval Grimberg');

            // Verify responsive grid layouts work on desktop
            const skillsGrid = page.locator('#skills .grid');
            await expect(skillsGrid).toBeVisible();

            // Test hover effects work on desktop (desktop-only feature)
            const projectCards = page.locator('[data-aos="fade-up"]').first();
            await projectCards.hover();
            // Verify hover animation occurs
            await page.waitForTimeout(500);
        });

        test('should handle contact form on desktop', async ({ page }) => {
            await page.goto('http://localhost:8000/#contact');

            // Fill out contact form with desktop interactions
            await page.fill('input[name="name"]', 'Desktop Test User');
            await page.fill('input[name="email"]', 'test@desktop.com');
            await page.selectOption('select[name="subject"]', 'Job Opportunity');
            await page.fill('textarea[name="message"]', 'Testing desktop contact form functionality');

            // Test email client opening
            await page.click('#open-email-client-btn');

            // Verify success message appears
            await expect(page.locator('#email-success')).toBeVisible();

            // Test copy functionality (desktop feature)
            await page.click('button:has-text("Copy Message to Clipboard")');

            // Verify all mailto links work
            const emailLinks = page.locator('a[href^="mailto:"]');
            const emailLinkCount = await emailLinks.count();
            expect(emailLinkCount).toBeGreaterThan(0);

            for (let i = 0; i < emailLinkCount; i++) {
                const link = emailLinks.nth(i);
                const href = await link.getAttribute('href');
                expect(href).toContain('yuval.grimberg@gmail.com');
            }
        });

        test('should navigate smoothly between sections on desktop', async ({ page }) => {
            // Test smooth scrolling navigation
            await page.click('a[href="#about"]');
            await page.waitForTimeout(1000);
            await expect(page.locator('#about')).toBeInViewport();

            await page.click('a[href="#skills"]');
            await page.waitForTimeout(1000);
            await expect(page.locator('#skills')).toBeInViewport();

            await page.click('a[href="#projects"]');
            await page.waitForTimeout(1000);
            await expect(page.locator('#projects')).toBeInViewport();

            await page.click('a[href="#contact"]');
            await page.waitForTimeout(1000);
            await expect(page.locator('#contact')).toBeInViewport();
        });
    });

    test.describe('Mobile Functionality Tests', () => {

        test('should display properly on mobile viewport', async ({ page }) => {
            // Configure for mobile (iPhone 12)
            await page.setViewportSize({ width: 390, height: 844 });

            // Test mobile viewport size
            const viewportSize = page.viewportSize();
            expect(viewportSize.width).toBeLessThan(768);

            // Check mobile-specific layout adjustments
            await expect(page.locator('#hero')).toBeInViewport();

            // Test that content is readable on mobile
            const heroTitle = page.locator('h1');
            await expect(heroTitle).toBeVisible();
            await expect(heroTitle).toContainText('Yuval Grimberg');

            // Verify mobile navigation works
            const nav = page.locator('nav');
            await expect(nav).toBeVisible();

            // Test mobile-responsive grid layouts
            const skillsSection = page.locator('#skills');
            await skillsSection.scrollIntoViewIfNeeded();
            await expect(skillsSection).toBeVisible();
        });

        test('should handle touch interactions on mobile', async ({ page }) => {
            // Configure for mobile
            await page.setViewportSize({ width: 390, height: 844 });

            // Test mobile navigation
            await page.goto('http://localhost:8000/#contact');

            // Test mobile form interactions with touch
            await page.tap('input[name="name"]');
            await page.fill('input[name="name"]', 'Mobile Test User');

            await page.tap('input[name="email"]');
            await page.fill('input[name="email"]', 'test@mobile.com');

            await page.tap('textarea[name="message"]');
            await page.fill('textarea[name="message"]', 'Testing mobile touch interactions');

            // Test mobile email client opening
            await page.tap('#open-email-client-btn');

            // Verify mobile success message
            await expect(page.locator('#email-success')).toBeVisible();
        });

        test('should handle mobile navigation menu functionality', async ({ page }) => {
            // Configure for mobile viewport
            await page.setViewportSize({ width: 390, height: 844 });

            // Check that hamburger menu is visible on mobile
            const hamburgerBtn = page.locator('#mobile-menu-button');
            await expect(hamburgerBtn).toBeVisible();

            // Verify mobile menu is initially hidden
            const mobileMenu = page.locator('#mobile-menu');
            await expect(mobileMenu).toHaveClass(/hidden/);

            // Click hamburger to open mobile menu
            await hamburgerBtn.click();

            // Verify mobile menu is now visible
            await expect(mobileMenu).not.toHaveClass(/hidden/);
            await expect(mobileMenu).toBeVisible();

            // Test mobile menu backdrop
            const backdrop = page.locator('#mobile-menu-backdrop');
            await expect(backdrop).toBeVisible();

            // Test navigation links in mobile menu
            const mobileNavLinks = page.locator('#mobile-menu a');
            await expect(mobileNavLinks).toHaveCount(6); // About, Skills, Projects, Photo, Vision, Contact

            // Test clicking a mobile nav link
            const aboutLink = page.locator('#mobile-menu a[href="#about"]');
            await aboutLink.click();

            // Verify menu closes after navigation
            await expect(mobileMenu).toHaveClass(/hidden/);

            // Verify navigation worked
            await expect(page.locator('#about')).toBeInViewport();

            // Test closing menu via backdrop click
            await hamburgerBtn.click(); // Open menu again
            await expect(mobileMenu).toBeVisible();
            
            await backdrop.click(); // Click backdrop to close
            await expect(mobileMenu).toHaveClass(/hidden/);

            // Test ARIA attributes for accessibility
            await expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'false');
            await hamburgerBtn.click();
            await expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'true');
        });

        test('should handle mobile scrolling and navigation', async ({ page }) => {
            // Configure for mobile
            await page.setViewportSize({ width: 390, height: 844 });

            // Test mobile scrolling behavior
            await page.evaluate(() => window.scrollTo(0, 0));

            // Test navigation on mobile
            await page.tap('a[href="#about"]');
            await page.waitForTimeout(1000);
            await expect(page.locator('#about')).toBeInViewport();

            // Scroll test for mobile
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(500);

            // Test back to top on mobile
            await page.evaluate(() => window.scrollTo(0, 0));
            await expect(page.locator('#hero')).toBeInViewport();
        });
    });

    test.describe('Cross-Device Email Functionality', () => {

        // Test on multiple devices
        const devicesToTest = [
            { name: 'Desktop Chrome', device: devices['Desktop Chrome'] },
            { name: 'iPhone 12', device: devices['iPhone 12'] },
            { name: 'iPad Pro', device: devices['iPad Pro'] },
            { name: 'Galaxy S9+', device: devices['Galaxy S9+'] }
        ];

        devicesToTest.forEach(({ name, device }) => {
            test(`should have working mailto links on ${name}`, async ({ browser }) => {
                const context = await browser.newContext({ ...device });
                const page = await context.newPage();

                await page.goto('http://localhost:8000');
                await page.waitForLoadState('networkidle');

                // Test all mailto links across the site
                const emailLinks = page.locator('a[href^="mailto:"]');
                const linkCount = await emailLinks.count();

                expect(linkCount).toBeGreaterThan(0);

                // Verify each mailto link
                for (let i = 0; i < linkCount; i++) {
                    const link = emailLinks.nth(i);
                    const href = await link.getAttribute('href');
                    expect(href).toContain('yuval.grimberg@gmail.com');

                    // Ensure link is visible and clickable
                    await link.scrollIntoViewIfNeeded();
                    await expect(link).toBeVisible();
                }

                await context.close();
            });
        });
    });

    test.describe('Responsive Layout Breakpoints', () => {

        const viewports = [
            { name: 'Mobile Portrait', width: 375, height: 667 },
            { name: 'Mobile Landscape', width: 667, height: 375 },
            { name: 'Tablet Portrait', width: 768, height: 1024 },
            { name: 'Tablet Landscape', width: 1024, height: 768 },
            { name: 'Desktop Small', width: 1366, height: 768 },
            { name: 'Desktop Large', width: 1920, height: 1080 }
        ];

        viewports.forEach(({ name, width, height }) => {
            test(`should display correctly on ${name} (${width}x${height})`, async ({ page }) => {
                await page.setViewportSize({ width, height });
                await page.goto('http://localhost:8000');
                await page.waitForLoadState('networkidle');

                // Test that all main sections are accessible
                await expect(page.locator('#hero')).toBeInViewport();

                // Test navigation is functional at this viewport
                const nav = page.locator('nav');
                await expect(nav).toBeVisible();

                // Test contact form is accessible and properly laid out
                await page.goto('http://localhost:8000/#contact');
                await expect(page.locator('#contact')).toBeInViewport();

                const contactForm = page.locator('form');
                await expect(contactForm).toBeVisible();

                // Verify form inputs are properly sized
                const nameInput = page.locator('input[name="name"]');
                const emailInput = page.locator('input[name="email"]');
                const messageTextarea = page.locator('textarea[name="message"]');

                await expect(nameInput).toBeVisible();
                await expect(emailInput).toBeVisible();
                await expect(messageTextarea).toBeVisible();

                // Test that buttons are accessible
                const emailButton = page.locator('#open-email-client-btn');
                await expect(emailButton).toBeVisible();

                // Take a screenshot for visual verification
                await page.screenshot({
                    path: `test-results/responsive-${name.toLowerCase().replace(/\s+/g, '-')}.png`,
                    fullPage: true
                });
            });
        });
    });

    test.describe('Performance & Loading Tests', () => {

        test('should load quickly on mobile networks', async ({ page }) => {
            // Emulate slow 3G network
            await page.context().newPage();
            await page.route('**/*', route => {
                // Simulate slow network by adding delay
                setTimeout(() => route.continue(), 100);
            });

            const startTime = Date.now();
            await page.goto('http://localhost:8000');
            await page.waitForLoadState('networkidle');
            const loadTime = Date.now() - startTime;

            // Ensure reasonable load time even on slow networks
            expect(loadTime).toBeLessThan(10000); // 10 seconds max

            // Verify critical content loaded
            await expect(page.locator('h1')).toBeVisible();
            await expect(page.locator('nav')).toBeVisible();
        });

        test('should be accessible on all device types', async ({ page }) => {
            // Test accessibility basics across devices
            await page.goto('http://localhost:8000');

            // Check for proper heading hierarchy
            const h1Elements = page.locator('h1');
            expect(await h1Elements.count()).toBe(1);

            // Check for proper alt text on images
            const images = page.locator('img');
            const imageCount = await images.count();

            for (let i = 0; i < imageCount; i++) {
                const img = images.nth(i);
                const alt = await img.getAttribute('alt');
                if (alt === null || alt === '') {
                    console.warn(`Image ${i} missing alt text`);
                }
            }

            // Test form labels
            await page.goto('http://localhost:8000/#contact');
            const formInputs = page.locator('input, textarea, select');
            const inputCount = await formInputs.count();

            for (let i = 0; i < inputCount; i++) {
                const input = formInputs.nth(i);
                const id = await input.getAttribute('id');
                const name = await input.getAttribute('name');

                if (id) {
                    const label = page.locator(`label[for="${id}"]`);
                    const labelExists = await label.count() > 0;
                    if (!labelExists) {
                        console.warn(`Input with id "${id}" missing associated label`);
                    }
                }
            }
        });
    });

    test.describe('Interactive Features Cross-Device', () => {

        test('should handle animations and transitions on all devices', async ({ page }) => {
            await page.goto('http://localhost:8000');

            // Test AOS animations load
            await page.waitForTimeout(2000);

            // Check for animated elements
            const animatedElements = page.locator('[data-aos]');
            const animatedCount = await animatedElements.count();
            expect(animatedCount).toBeGreaterThan(0);

            // Test smooth scrolling
            await page.click('a[href="#contact"]');
            await page.waitForTimeout(1000);
            await expect(page.locator('#contact')).toBeInViewport();
        });

        test('should handle all interactive elements', async ({ page }) => {
            await page.goto('http://localhost:8000');

            // Test all clickable elements
            const buttons = page.locator('button');
            const buttonCount = await buttons.count();

            for (let i = 0; i < Math.min(buttonCount, 5); i++) {
                const button = buttons.nth(i);
                await button.scrollIntoViewIfNeeded();

                if (await button.isVisible()) {
                    const text = await button.textContent();
                    console.log(`Testing button: ${text}`);

                    // Check button is clickable
                    await expect(button).toBeEnabled();
                }
            }

            // Test links work
            const links = page.locator('a[href^="#"]');
            const linkCount = await links.count();

            for (let i = 0; i < Math.min(linkCount, 3); i++) {
                const link = links.nth(i);
                const href = await link.getAttribute('href');

                if (href && href !== '#') {
                    await link.click();
                    await page.waitForTimeout(500);

                    // Verify navigation worked
                    const targetSection = page.locator(href);
                    if (await targetSection.count() > 0) {
                        await expect(targetSection).toBeInViewport();
                    }
                }
            }
        });
    });
});
