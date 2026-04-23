const { test, expect } = require('@playwright/test');

const MOBILE_PROJECTS = new Set(['iPhone 12', 'Mobile Narrow 320']);

function siteUrl(relativePath) {
    if (relativePath === 'index.html') {
        return '/';
    }

    return `/${relativePath}`;
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

async function openDrawer(page, pagePath) {
    const relativePath = pagePath === '/' ? 'index.html' : pagePath.replace(/^\//, '');
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

async function expectTouchTarget(locator, label) {
    await locator.scrollIntoViewIfNeeded();
    await expect(locator, `${label} should be visible`).toBeVisible();

    const box = await locator.boundingBox();
    expect(box, `${label} should have a measurable bounding box`).not.toBeNull();
    expect(box.width, `${label} width should meet the 44px touch target minimum`).toBeGreaterThanOrEqual(44);
    expect(box.height, `${label} height should meet the 44px touch target minimum`).toBeGreaterThanOrEqual(44);
}

test.describe('maintained smoke suite', () => {
    test('primary pages use local generated CSS instead of Tailwind CDN', async ({ page }) => {
        for (const target of ['index.html', 'photo.html', 'thank-you.html']) {
            await page.goto(siteUrl(target), { waitUntil: 'domcontentloaded' });
            await expect(page.locator('script[src*="cdn.tailwindcss.com"]')).toHaveCount(0);
            await expect(page.locator('link[href="assets/css/output.css"]')).toHaveCount(1);
        }
    });

    test('primary page hero copy stays readable with the local CSS build', async ({ page }) => {
        const heroChecks = [
            { target: 'index.html', selector: '#hero p.font-tech' },
            { target: 'photo.html', selector: 'main section:first-of-type p.font-tech' }
        ];

        for (const { target, selector } of heroChecks) {
            await page.goto(siteUrl(target), { waitUntil: 'domcontentloaded' });
            const color = await page.locator(selector).evaluate((element) => getComputedStyle(element).color);
            expect(color).not.toBe('rgb(0, 0, 0)');
        }
    });

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

    test('critical mobile touch targets stay comfortably tappable on maintained pages', async ({ page }, testInfo) => {
        test.skip(!MOBILE_PROJECTS.has(testInfo.project.name), 'Mobile-only smoke');

        await page.goto(siteUrl('index.html'), { waitUntil: 'domcontentloaded' });
        await expectTouchTarget(page.locator('#mobile-menu-button'), 'homepage mobile menu button');
        await page.locator('#mobile-menu-button').click();
        await expectTouchTarget(page.locator('#mobile-menu-panel .mobile-menu-close'), 'homepage mobile menu close button');
        await page.locator('#mobile-menu-backdrop').click({ position: { x: 10, y: 10 } });
        await expectTouchTarget(page.locator('#goose-talk'), 'goose advice button');
        await expectTouchTarget(page.locator('#click-me-button'), 'click counter button');
        await expectTouchTarget(page.getByRole('link', { name: 'View Details' }).first(), 'first project details link');
        await expectTouchTarget(page.locator('a[aria-label="Open the BGR Path Planning Control repository"]'), 'first project repository icon link');
        await expectTouchTarget(page.locator('footer').getByLabel('Open GitHub profile'), 'homepage footer GitHub link');
        await expectTouchTarget(page.locator('footer').getByRole('link', { name: 'About' }), 'homepage footer About link');

        await page.goto(siteUrl('photo.html'), { waitUntil: 'domcontentloaded' });
        await expectTouchTarget(page.locator('#mobile-menu-button'), 'photo page mobile menu button');
        await page.locator('#mobile-menu-button').click();
        await expectTouchTarget(page.locator('#mobile-menu-panel .mobile-menu-close'), 'photo page mobile menu close button');
        await page.locator('#mobile-menu-backdrop').click({ position: { x: 10, y: 10 } });
        await expectTouchTarget(page.locator('footer').getByLabel('Open GitHub profile'), 'photo page footer GitHub link');
        await expectTouchTarget(page.locator('footer').getByRole('link', { name: 'Home' }), 'photo page footer Home link');
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
