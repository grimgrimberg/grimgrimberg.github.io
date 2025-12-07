const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 390, height: 844 } }); // iPhone 12/13/14

test('Mobile Navigation Verification', async ({ page }) => {
    // Go to the local page (assuming served via file:// or http://localhost:8000)
    // Since we don't have a server running, we might need to use file path or start one.
    // For now, let's assume the user will run the server or we can use file://
    // But Playwright works best with a server.
    // I'll assume the user can run `python -m http.server 8000` as per instructions.
    // But I can't start a background server easily and keep it running for the test tool.
    // I'll try to use the file path.

    const path = require('path');
    const filePath = 'file://' + path.resolve(__dirname, '../index.html');
    await page.goto(filePath);

    // Check if the mobile menu button exists
    const menuButton = page.locator('.mobile-menu-button');
    await expect(menuButton).toBeVisible();

    // Click the menu button
    await menuButton.click();

    // Check if the drawer opens
    const drawer = page.locator('#mobile-menu-drawer');
    await expect(drawer).not.toHaveClass(/translate-x-full/);
    await expect(drawer).toBeVisible();

    // Check if links are visible
    const aboutLink = drawer.locator('a[href="#about"]');
    await expect(aboutLink).toBeVisible();

    // Check computed style
    const overlay = page.locator('#mobile-menu-overlay');
    const position = await overlay.evaluate((el) => window.getComputedStyle(el).position);
    console.log('Overlay position:', position);

    if (position !== 'fixed') {
        console.log('CSS NOT LOADED CORRECTLY!');
    }

    // Close the menu by clicking the overlay
    await overlay.evaluate(el => el.click());

    // Check if drawer closes
    await expect(drawer).toHaveClass(/translate-x-full/);
});
