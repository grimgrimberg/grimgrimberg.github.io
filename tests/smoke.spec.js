const { test, expect } = require('@playwright/test');
const { pathToFileURL } = require('url');
const path = require('path');

const MOBILE_PROJECTS = new Set(['iPhone 12', 'Mobile Narrow 320']);

function siteUrl(relativePath) {
    return pathToFileURL(path.join(__dirname, '..', relativePath)).href;
}

async function fillContactForm(page, overrides = {}) {
    const fields = {
        name: 'Playwright Tester',
        email: 'tester@example.com',
        message: 'This is an automated smoke test message.',
        ...overrides
    };

    await page.locator('#contact-name').scrollIntoViewIfNeeded();
    await page.fill('#contact-name', fields.name);
    await page.fill('#contact-email', fields.email);
    await page.fill('#contact-message', fields.message);
    await page.click('#open-email-client-btn');

    return fields;
}

async function openDrawer(page, path) {
    const relativePath = path === '/' ? 'index.html' : path.replace(/^\//, '');
    await page.goto(siteUrl(relativePath), { waitUntil: 'domcontentloaded' });

    const button = page.locator('#mobile-menu-button');
    const menu = page.locator('#mobile-menu');
    const panel = page.locator('#mobile-menu-panel');

    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('aria-expanded', 'false');

    await button.click();
    await expect(menu).toBeVisible();
    await expect(panel).toBeVisible();
    await expect(button).toHaveAttribute('aria-expanded', 'true');

    return { button, menu, panel };
}

test.describe('maintained smoke suite', () => {
    test('homepage loads, navigation works, and core homepage features still respond', async ({ page }, testInfo) => {
        const pageErrors = [];
        page.on('pageerror', (error) => pageErrors.push(error.message));

        await page.addInitScript(() => {
            window.__copiedText = '';
            window.__mailtoAttempts = [];
            window.__portfolioMailtoHandler = (url) => {
                window.__mailtoAttempts.push(url);
            };

            Object.defineProperty(navigator, 'clipboard', {
                configurable: true,
                value: {
                    writeText: async (text) => {
                        window.__copiedText = text;
                    }
                }
            });
        });

        await page.goto(siteUrl('index.html'), { waitUntil: 'domcontentloaded' });

        if (MOBILE_PROJECTS.has(testInfo.project.name)) {
            await page.locator('#contact').scrollIntoViewIfNeeded();
        } else {
            await page.locator('#desktop-nav a[href="#contact"]').click();
            await expect(page.locator('#contact-name')).toBeInViewport();
        }

        await page.click('#goose-talk');
        await expect(page.locator('#goose-wisdom')).not.toHaveText('');

        await page.click('#click-me-button');
        await expect(page.locator('#click-count')).toHaveText('(1)');
        await expect(page.locator('#click-message')).not.toHaveText('');

        const fields = await fillContactForm(page);
        const success = page.locator('#contact-success');
        await expect(success).toBeVisible();
        await expect(success).toHaveAttribute('data-contact-sent', 'true');
        await expect(page.locator('#email-preview')).toContainText(fields.name);
        await expect(page.locator('#email-preview')).toContainText(fields.email);

        const copyButton = page.locator('#copy-email-content');
        await copyButton.click();
        await expect(copyButton).toHaveText(/Copied!/);
        await expect.poll(() => page.evaluate(() => window.__copiedText)).toContain(fields.name);
        await expect.poll(() => page.evaluate(() => window.__mailtoAttempts.length)).toBe(1);

        expect(pageErrors).toEqual([]);
    });

    test('contact copy falls back cleanly when navigator.clipboard is unavailable', async ({ page }) => {
        await page.addInitScript(() => {
            window.__fallbackCopiedText = '';
            window.__mailtoAttempts = [];
            window.__portfolioMailtoHandler = (url) => {
                window.__mailtoAttempts.push(url);
            };

            Object.defineProperty(navigator, 'clipboard', {
                configurable: true,
                value: {
                    writeText: async () => {
                        throw new Error('clipboard denied');
                    }
                }
            });

            const originalExecCommand = Document.prototype.execCommand;
            Document.prototype.execCommand = function (command) {
                if (command === 'copy') {
                    const activeElement = document.activeElement;
                    window.__fallbackCopiedText =
                        activeElement && typeof activeElement.value === 'string' ? activeElement.value : '';
                    return true;
                }

                return originalExecCommand ? originalExecCommand.call(this, command) : false;
            };
        });

        await page.goto(siteUrl('index.html'), { waitUntil: 'domcontentloaded' });
        const fields = await fillContactForm(page, {
            name: 'Fallback Tester',
            email: 'fallback@example.com'
        });

        const copyButton = page.locator('#copy-email-content');
        await copyButton.click();
        await expect(copyButton).toHaveText(/Copied!/);
        await expect.poll(() => page.evaluate(() => window.__fallbackCopiedText)).toContain(fields.name);
        await expect.poll(() => page.evaluate(() => window.__mailtoAttempts.length)).toBe(1);
    });

    test('mobile drawer works on the maintained pages for mobile projects', async ({ page }, testInfo) => {
        test.skip(!MOBILE_PROJECTS.has(testInfo.project.name), 'Mobile-only smoke');

        const viewportWidth = page.viewportSize().width;

        const homepageDrawer = await openDrawer(page, '/');
        const homepageBox = await homepageDrawer.panel.boundingBox();
        expect(homepageBox).not.toBeNull();
        expect(homepageBox.width).toBeLessThanOrEqual(viewportWidth - 56);
        await page.locator('#mobile-menu-panel .mobile-menu-close').click();
        await expect(homepageDrawer.menu).toBeHidden();

        const photoDrawer = await openDrawer(page, '/photo.html');
        const photoBox = await photoDrawer.panel.boundingBox();
        expect(photoBox).not.toBeNull();
        expect(photoBox.width).toBeLessThanOrEqual(viewportWidth - 56);
        await page.locator('#mobile-menu-backdrop').click({ position: { x: 10, y: 10 } });
        await expect(photoDrawer.menu).toBeHidden();
    });

    test('drawer keeps a tappable backdrop gutter at 320, 375, and 390 pixels', async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== 'Desktop Chrome', 'Viewport probe on desktop project only');

        const widths = [320, 375, 390];
        const pages = ['/', '/photo.html'];

        for (const width of widths) {
            await page.setViewportSize({ width, height: width === 320 ? 568 : 844 });

            for (const path of pages) {
                const drawer = await openDrawer(page, path);
                const panelBox = await drawer.panel.boundingBox();
                expect(panelBox).not.toBeNull();
                expect(panelBox.width).toBeLessThanOrEqual(width - 56);
                await page.locator('#mobile-menu-backdrop').click({ position: { x: 10, y: 10 } });
                await expect(drawer.menu).toBeHidden();
            }
        }
    });

    test('photo gallery initializes background and updates EXIF data', async ({ page }) => {
        await page.goto(siteUrl('photo.html'), { waitUntil: 'domcontentloaded' });

        await expect(page.locator('#dynamic-bg')).toBeAttached();
        await expect.poll(async () => {
            return page.locator('#dynamic-bg').evaluate((element) => getComputedStyle(element).backgroundImage);
        }).toContain('DSC02477');
        await expect(page.locator('#exif-data')).toContainText('Sony a7 II');

        await page.evaluate(() => window.goToSlide(3));
        await expect.poll(async () => {
            return page.locator('#dynamic-bg').evaluate((element) => getComputedStyle(element).backgroundImage);
        }).toContain('DSC03675');
        await expect(page.locator('#exif-data')).toContainText('75mm');
        await expect(page.locator('#exif-data')).toContainText('1/800s');
    });
});
