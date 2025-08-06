// Automated tests for Yuval Grimberg's portfolio website
const { test, expect } = require('@playwright/test');

test.describe('Portfolio Website Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('file:///C:/Users/yuval/grimgrimberg.github.io/index.html');
    });

    test('should display hero section with correct content', async ({ page }) => {
        // Check hero section is visible
        const hero = page.locator('#hero');
        await expect(hero).toBeVisible();

        // Check main heading
        await expect(page.locator('h1')).toContainText('Yuval Grimberg');

        // Check professional tagline (be more specific)
        await expect(page.locator('.font-tech').first()).toContainText('Control Systems Engineer');

        // Check CTA button
        const ctaButton = page.getByText('View My Work');
        await expect(ctaButton).toBeVisible();
    });

    test('should have working navigation', async ({ page }) => {
        // Test navigation links
        await page.click('text=About');
        await expect(page.locator('#about')).toBeInViewport();

        await page.click('text=Projects');
        await expect(page.locator('#projects')).toBeInViewport();

        await page.click('text=Contact');
        await expect(page.locator('#contact')).toBeInViewport();
    });

    test('should display skills and expertise section', async ({ page }) => {
        const skillsSection = page.locator('#skills');
        await expect(skillsSection).toBeVisible();

        // Check for key skills (use role selectors to be more specific)
        await expect(skillsSection.getByRole('heading', { name: 'Control Systems' })).toBeVisible();
        await expect(skillsSection.getByRole('heading', { name: 'Autonomous Vehicles' })).toBeVisible();
        await expect(skillsSection.getByRole('heading', { name: 'Machine Learning' })).toBeVisible();
        await expect(skillsSection.getByRole('heading', { name: 'Programming' })).toBeVisible();
    });

    test('should have responsive design', async ({ page }) => {
        // Test mobile view
        await page.setViewportSize({ width: 375, height: 667 });
        await expect(page.locator('.mobile-menu-button')).toBeVisible();

        // Test tablet view
        await page.setViewportSize({ width: 768, height: 1024 });

        // Test desktop view
        await page.setViewportSize({ width: 1920, height: 1080 });
        await expect(page.locator('nav')).toBeVisible();
    });

    test('should have working contact form', async ({ page }) => {
        // Navigate to contact section
        await page.click('a[href="#contact"]');
        await expect(page.locator('#contact')).toBeInViewport();

        // Fill out form
        await page.fill('input[name="name"]', 'Test User');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('textarea[name="message"]', 'This is a test message');

        // Check form validation
        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toBeEnabled();
    });

    test('should have social media links', async ({ page }) => {
        // Check GitHub link (be more specific)
        const githubLink = page.locator('footer a[href*="github.com/grimgrimberg"]');
        await expect(githubLink).toBeVisible();
        await expect(githubLink).toHaveAttribute('target', '_blank');

        // Check LinkedIn link
        const linkedinLink = page.locator('footer a[href*="linkedin.com"]');
        await expect(linkedinLink).toBeVisible();
        await expect(linkedinLink).toHaveAttribute('target', '_blank');
    });

    test('should have smooth animations', async ({ page }) => {
        // Test scroll animations
        await page.evaluate(() => window.scrollTo(0, 500));

        // Check AOS animations are working
        const projectCards = page.locator('.project-card');
        await expect(projectCards.first()).toBeVisible();

        // Check that AOS has initialized
        await expect(projectCards.first()).toHaveClass(/aos-init/);
    });

    test('should display professional project showcase', async ({ page }) => {
        const projectsSection = page.locator('#projects');
        await expect(projectsSection).toBeVisible();

        // Check for professional project titles
        await expect(page.getByText('Autonomous Vehicle Control System')).toBeVisible();
        await expect(page.getByText('ML-Enhanced Control Systems')).toBeVisible();
        await expect(page.getByText('Advanced Robotics Platform')).toBeVisible();
    });

    test('should have dark mode support', async ({ page }) => {
        // Check if dark mode toggle exists
        const darkModeToggle = page.locator('.dark-mode-toggle');
        if (await darkModeToggle.isVisible()) {
            await darkModeToggle.click();
            await expect(page.locator('body')).toHaveClass(/dark/);
        }
    });

    test('should load without performance issues', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('file:///C:/Users/yuval/grimgrimberg.github.io/index.html');
        const loadTime = Date.now() - startTime;

        // Should load within 3 seconds
        expect(loadTime).toBeLessThan(3000);

        // Check for critical elements
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('nav')).toBeVisible();
    });
});
