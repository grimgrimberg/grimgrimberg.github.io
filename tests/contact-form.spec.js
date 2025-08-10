const { test, expect } = require('@playwright/test');

test.describe('Contact Form Send a Message', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8000');
        await page.waitForLoadState('domcontentloaded');
    });

    test('fills and triggers openEmailClient success UI', async ({ page }) => {
        // Scroll to contact section
        await page.locator('a[href="#contact"]').first().click();
        const name = page.locator('#contact-name');
        await expect(name).toBeVisible();

        await name.fill('Playwright Tester');
        await page.fill('#contact-email', 'tester@example.com');
        await page.fill('#contact-message', 'This is an automated test message.');

        // Trigger mailto function
        await page.click('#open-email-client-btn');

        // Expect replacement success container
        const success = page.locator('#contact-success');
        await expect(success).toBeVisible();
        await expect(success).toHaveAttribute('data-contact-sent', 'true');

        // Check email preview content exists
        const preview = page.locator('#email-preview');
        await expect(preview).toContainText('Playwright Tester');
        await expect(preview).toContainText('tester@example.com');

        // Copy button flow
        const copyBtn = page.locator('#copy-email-content');
        await expect(copyBtn).toBeVisible();
        await copyBtn.click();
        // Button label should transiently change
        await expect(copyBtn).toHaveText(/Copied!/);
    });
});
