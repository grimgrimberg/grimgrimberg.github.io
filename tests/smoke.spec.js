const { test, expect } = require('@playwright/test');

const DESKTOP_PROJECT = 'Desktop Chrome';
const MOBILE_PROJECTS = new Set(['iPhone 12', 'Mobile Narrow 320']);
const MAINTAINED_PAGE_PATHS = ['/', '/photo.html'];
const NARROW_VIEWPORTS = [
    { width: 320, height: 568 },
    { width: 375, height: 844 },
    { width: 390, height: 844 }
];

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

    await page.locator('.contact-composer summary').click();
    await page.locator('#contact-name').scrollIntoViewIfNeeded();
    await page.fill('#contact-name', fields.name);
    await page.fill('#contact-email', fields.email);
    await page.fill('#contact-message', fields.message);
    await page.click('#open-email-client-btn');

    return fields;
}

async function openDrawer(page, pagePath, options = {}) {
    const relativePath = pagePath === '/' ? 'index.html' : pagePath.replace(/^\//, '');
    await page.goto(siteUrl(relativePath), { waitUntil: 'domcontentloaded' });

    if (options.scrollY) {
        await page.evaluate((scrollY) => window.scrollTo(0, scrollY), options.scrollY);
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(50);
    }

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

async function submitCommand(page, command) {
    await page.fill('#command-input', command);
    await page.locator('#command-form button[type="submit"]').click();
}

test.describe('maintained smoke suite', () => {
    test('primary pages use local generated CSS instead of Tailwind CDN', async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== DESKTOP_PROJECT, 'Static runtime check runs once on desktop');

        for (const target of ['index.html', 'photo.html', 'thank-you.html']) {
            await page.goto(siteUrl(target), { waitUntil: 'domcontentloaded' });
            await expect(page.locator('script[src*="cdn.tailwindcss.com"]')).toHaveCount(0);
            await expect(page.locator('link[href="assets/css/output.css"]')).toHaveCount(1);
        }
    });

    test('primary page hero copy stays readable with the local CSS build', async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== DESKTOP_PROJECT, 'Visual CSS smoke runs once on desktop');

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
        test.skip(testInfo.project.name === 'Mobile Narrow 320', '320px project is reserved for narrow layout regressions');

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

        await expect(page.locator('#hire')).toContainText('Hire Me Command Center');
        await page.locator('[data-hire-role="ai"]').scrollIntoViewIfNeeded();
        await page.locator('[data-hire-role="ai"]').click();
        await expect(page.locator('#hire-role-title')).toHaveText('AI Tooling / Developer Tools');
        await expect(page.locator('#reviews')).toContainText('Epic Reviews');
        await expect(page.locator('#reviews')).toContainText('Ray Charles');
        await expect(page.locator('#reviews')).toContainText('Stephen Hawking');
        await expect(page.locator('#reviews')).toContainText('Doctor Strange');
        await expect(page.locator('#retro-games')).toContainText('Retro Classics');
        await expect(page.locator('#retro-games')).toContainText('Hosted Game Files');
        await expect(page.locator('#retro-games [data-game-source]')).toHaveCount(6);
        await expect(page.locator('#retro-games')).toContainText('Dangerous Dave');
        await expect(page.locator('#retro-games')).toContainText('SkyRoads');
        await page.waitForFunction(() => window.clippyLoaded === true && Boolean(window.clippyAgent), null, {
            timeout: 10000
        });
        await page.locator('#clippy-guide-button').click();
        await expect(page.locator('.clippy')).toBeVisible();
        await expect(page.locator('.clippy-balloon')).toContainText('I can guide');

        await page.click('#command-palette-button');
        await expect(page.locator('#command-palette')).toBeVisible();
        const commandChecks = [
            { command: 'repos --featured', expected: ['BGR_PathPlanning_Control', 'orbital-rendezvous-lqi'] },
            { command: 'hire ai', expected: ['AI Tooling / Developer Tools'] },
            { command: 'reviews', expected: ['Epic reviews'] },
            { command: 'roast yuval', expected: ['Roast mode'] },
            { command: 'cv', expected: ['Read the public CV'] }
        ];

        for (const { command, expected } of commandChecks) {
            await submitCommand(page, command);
            for (const text of expected) {
                await expect(page.locator('#command-output')).toContainText(text);
            }
        }

        await page.locator('#command-palette .command-close').click();
        await expect(page.locator('#command-palette')).toBeHidden();

        if (MOBILE_PROJECTS.has(testInfo.project.name)) {
            await page.locator('#contact').scrollIntoViewIfNeeded();
        } else {
            await page.locator('#desktop-nav a[href="#contact"]').click();
            await expect(page.locator('#contact')).toBeInViewport();
        }

        await page.click('#goose-talk');
        const gooseMascot = page.locator('[data-goose-mascot="true"]');
        await expect(gooseMascot).toBeAttached();
        await expect(gooseMascot).toHaveAttribute('src', /assets\/images\/desk-goose\.svg$/);
        await expect(page.locator('#goose-fun-zone')).toHaveAttribute('data-goose-ready', 'static');
        await expect(page.locator('#goose-wisdom')).not.toHaveText('');

        await page.click('#click-me-button');
        await expect(page.locator('#click-count')).toHaveText('(1)');
        await expect(page.locator('#click-message')).not.toHaveText('');

        await expect(page.locator('#contact a[href="cv.html"]')).toBeVisible();
        await expect(page.locator('#contact a[download]')).toHaveAttribute('href', 'assets/cv/yuval-grimberg-master-cv-september-2026.pdf');

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

    test('direct contact, retro source, and goose controls work without external services', async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== DESKTOP_PROJECT, 'Direct affordance regression runs once on desktop');

        await page.addInitScript(() => {
            window.__copiedText = '';
            window.__sourceClicks = [];
            window.localStorage.clear();

            Object.defineProperty(navigator, 'clipboard', {
                configurable: true,
                value: {
                    writeText: async (text) => {
                        window.__copiedText = text;
                    }
                }
            });

            HTMLAnchorElement.prototype.click = function () {
                window.__sourceClicks.push(this.href);
            };
        });

        await page.goto(siteUrl('index.html'), { waitUntil: 'domcontentloaded' });

        const directEmail = page.locator('#contact a[href="mailto:yuval.grimberg@gmail.com"]');
        await expect(directEmail).toHaveAttribute('href', 'mailto:yuval.grimberg@gmail.com');
        await expect(directEmail).toContainText('yuval.grimberg@gmail.com');

        const copyEmailButton = page.locator('#copy-email-address');
        await copyEmailButton.scrollIntoViewIfNeeded();
        await copyEmailButton.click();
        await expect(page.locator('#copy-email-status')).toContainText('Email copied');
        await expect.poll(() => page.evaluate(() => window.__copiedText)).toBe('yuval.grimberg@gmail.com');

        const gooseTerrorButton = page.locator('#goose-terror-button');
        await gooseTerrorButton.scrollIntoViewIfNeeded();
        await gooseTerrorButton.click();
        await expect(page.locator('#goose-terror-layer')).toHaveAttribute('data-goose-terror', 'active');
        await expect(gooseTerrorButton).toHaveAttribute('aria-pressed', 'true');
        await page.locator('#goose-terror-stop').click();
        await expect(page.locator('#goose-terror-layer')).toHaveCount(0);
        await expect(gooseTerrorButton).toHaveAttribute('aria-pressed', 'false');

        const sourceChecks = [
            {
                gameId: 'elastomania',
                heading: 'Elastomania',
                href: 'https://archive.org/details/elmav10'
            },
            {
                gameId: 'dave',
                heading: 'Dangerous Dave',
                href: 'https://www.old-games.org/games/dave'
            }
        ];

        for (const [index, source] of sourceChecks.entries()) {
            const sourceButton = page.locator(`[data-game-source="${source.gameId}"]`);
            await sourceButton.scrollIntoViewIfNeeded();
            await sourceButton.click();
            await expect(page.locator('#source-open-count')).toHaveText(String(index + 1));
            await expect.poll(() => page.evaluate(() => window.__sourceClicks.join('\n'))).toContain(source.href);

            const sourceModal = page.locator('body > .fixed').filter({ hasText: 'Opening the external source page' });
            await expect(sourceModal.getByRole('heading', { name: source.heading })).toBeVisible();
            await sourceModal.getByRole('button', { name: 'Got It' }).click();
            await expect(sourceModal).toHaveCount(0);
        }
    });

    test('contact copy falls back cleanly when navigator.clipboard is unavailable', async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== DESKTOP_PROJECT, 'Clipboard fallback runs once on desktop');

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
        const closeStrategies = ['close-button', 'backdrop'];

        for (const [index, path] of MAINTAINED_PAGE_PATHS.entries()) {
            const drawer = await openDrawer(page, path);
            const panelBox = await drawer.panel.boundingBox();
            expect(panelBox).not.toBeNull();
            expect(panelBox.width).toBeLessThanOrEqual(viewportWidth - 56);
            await drawer.button.click();
            await expect(drawer.menu).toBeHidden();
            await drawer.button.click();
            await expect(drawer.menu).toBeVisible();

            if (closeStrategies[index] === 'close-button') {
                await page.locator('#mobile-menu-panel .mobile-menu-close').click();
            } else {
                await page.locator('#mobile-menu-backdrop').click({ position: { x: 10, y: 10 } });
            }

            await expect(drawer.menu).toBeHidden();
        }
    });

    test('critical mobile touch targets stay comfortably tappable on maintained pages', async ({ page }, testInfo) => {
        test.skip(!MOBILE_PROJECTS.has(testInfo.project.name), 'Mobile-only smoke');

        await page.goto(siteUrl('index.html'), { waitUntil: 'domcontentloaded' });
        await expectTouchTarget(page.locator('#mobile-menu-button'), 'homepage mobile menu button');
        await page.locator('#mobile-menu-button').click();
        await expectTouchTarget(page.locator('#mobile-menu-panel .mobile-menu-close'), 'homepage mobile menu close button');
        await page.locator('#mobile-menu-backdrop').click({ position: { x: 10, y: 10 } });
        await expectTouchTarget(page.locator('#goose-talk'), 'goose advice button');
        await expectTouchTarget(page.locator('#goose-terror-button'), 'goose terror button');
        await expectTouchTarget(page.locator('#click-me-button'), 'click counter button');
        await expectTouchTarget(page.getByRole('link', { name: 'Read my contribution' }), 'first project details link');
        await expectTouchTarget(page.getByRole('link', { name: 'Inspect the racing stack' }), 'BGR repository link');
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

    test('drawer stays usable across narrow viewport states', async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== DESKTOP_PROJECT, 'Viewport probe on desktop project only');

        const states = [
            { name: 'initial', scrollY: 0 },
            { name: 'scrolled', scrollY: 1400 }
        ];

        for (const viewport of NARROW_VIEWPORTS) {
            await page.setViewportSize(viewport);

            for (const path of MAINTAINED_PAGE_PATHS) {
                for (const state of states) {
                    const drawer = await openDrawer(page, path, { scrollY: state.scrollY });
                    const panelBox = await drawer.panel.boundingBox();

                    expect(panelBox, `${path} drawer panel should be measurable in ${state.name} state at ${viewport.width}px`).not.toBeNull();
                    expect(panelBox.width, `${path} drawer panel should leave a tappable gutter at ${viewport.width}px`).toBeLessThanOrEqual(viewport.width - 56);

                    if (state.name === 'initial') {
                        await page.locator('#mobile-menu-backdrop').click({ position: { x: 10, y: 10 } });
                        await expect(drawer.menu).toBeHidden();
                        continue;
                    }

                    const menuBox = await drawer.menu.boundingBox();

                    expect(menuBox, `${path} drawer overlay should be measurable after scrolling at ${viewport.width}px`).not.toBeNull();
                    expect(menuBox.height, `${path} drawer overlay should cover the viewport after scrolling at ${viewport.width}px`).toBeGreaterThanOrEqual(viewport.height - 1);
                    expect(panelBox.height, `${path} drawer panel should cover the viewport after scrolling at ${viewport.width}px`).toBeGreaterThanOrEqual(viewport.height - 1);

                    await drawer.button.click();
                    await expect(drawer.menu).toBeHidden();
                }
            }
        }
    });

    test('photo gallery initializes background and updates EXIF data', async ({ page }, testInfo) => {
        test.skip(testInfo.project.name !== DESKTOP_PROJECT, 'Photo behavior smoke runs once on desktop');

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
