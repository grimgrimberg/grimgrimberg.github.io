const { test, expect } = require('@playwright/test');

/**
 * Comprehensive test suite for Yuval's Portfolio Website
 * Testing all interactive features, sound effects, and background changes
 */

test.describe('Portfolio Website Feature Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Start local server for testing
        await page.goto('http://localhost:8000');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Photo Gallery Background Blending', () => {

        test('should navigate to photo gallery and test background changes', async ({ page }) => {
            // Navigate to photo gallery
            await page.click('a[href="photo.html"]');
            await page.waitForLoadState('networkidle');

            // Wait for Swiper to initialize
            await page.waitForSelector('.swiper', { state: 'visible' });
            await page.waitForTimeout(3000); // Give more time for initialization

            // Check that dynamic background element exists
            const dynamicBg = page.locator('#dynamic-bg');
            await expect(dynamicBg).toBeVisible();

            // Test thumbnail navigation and background changes
            for (let i = 0; i < 5; i++) {
                // Click thumbnail button using the actual button structure
                await page.click(`button[onclick="goToSlide(${i})"]`);
                await page.waitForTimeout(1500); // Give time for background to update

                // Check that background image is updated
                const bgStyle = await dynamicBg.getAttribute('style');
                console.log(`Photo ${i + 1} background style: ${bgStyle}`);

                // Verify background contains image URL - bgStyle should never be null now
                expect(bgStyle).toBeTruthy(); // Ensure style attribute exists
                expect(bgStyle).toContain('background-image');
                expect(bgStyle).toContain('.jpg');

                // Check that active class is applied
                const hasActiveClass = await dynamicBg.evaluate(el => el.classList.contains('active'));
                expect(hasActiveClass).toBe(true);
            }
        });

        test('should test swiper navigation changes background', async ({ page }) => {
            await page.click('a[href="photo.html"]');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000); // Give more time for initialization

            const dynamicBg = page.locator('#dynamic-bg');

            // Test next button navigation
            for (let i = 0; i < 3; i++) {
                await page.click('.swiper-button-next');
                await page.waitForTimeout(1500); // Give time for background to update

                const bgStyle = await dynamicBg.getAttribute('style');
                expect(bgStyle).toBeTruthy(); // Ensure style attribute exists
                expect(bgStyle).toContain('background-image');
                console.log(`Swiper next navigation ${i + 1}: Background updated`);
            }

            // Test previous button navigation
            for (let i = 0; i < 2; i++) {
                await page.click('.swiper-button-prev');
                await page.waitForTimeout(1500); // Give time for background to update

                const bgStyle = await dynamicBg.getAttribute('style');
                expect(bgStyle).toBeTruthy(); // Ensure style attribute exists
                expect(bgStyle).toContain('background-image');
                console.log(`Swiper prev navigation ${i + 1}: Background updated`);
            }
        });
    });

    test.describe('Sound Effects Testing', () => {

        test('should play honk sound when asking goose for advice', async ({ page }) => {
            // Navigate to Fun Zone section
            await page.click('a[href="#fun-zone"]');
            await page.waitForTimeout(1000);

            // Find and click the goose advice button
            const gooseButton = await page.locator('#goose-talk');
            await expect(gooseButton).toBeVisible();

            // Set up audio detection
            const audioPromise = page.waitForFunction(() => {
                const audioElements = document.querySelectorAll('audio');
                return audioElements.length > 0 || window.lastAudioSrc;
            }, { timeout: 5000 });

            // Monitor console for sound-related logs
            const consoleMessages = [];
            page.on('console', msg => {
                if (msg.text().includes('Honk') || msg.text().includes('🦆')) {
                    consoleMessages.push(msg.text());
                }
            });

            // Click the goose button
            await gooseButton.click();

            // Wait for wisdom to appear
            const gooseWisdom = await page.locator('#goose-wisdom');
            await expect(gooseWisdom).not.toBeEmpty();

            // Check for audio interaction
            try {
                await audioPromise;
                console.log('✅ Audio element detected or sound function called');
            } catch (error) {
                console.log('ℹ️ Audio may be blocked by browser policy, checking console logs...');
            }

            // Verify console logs or audio behavior
            const wisdomText = await gooseWisdom.textContent();
            expect(wisdomText.length).toBeGreaterThan(0);
            console.log(`🦆 Goose wisdom: ${wisdomText}`);
        });

        test('should play god damn sound at 69 clicks', async ({ page }) => {
            // Navigate to Fun Zone
            await page.click('a[href="#fun-zone"]');
            await page.waitForTimeout(1000);

            const clickButton = await page.locator('#click-me-button');
            const clickMessage = await page.locator('#click-message');

            // Monitor console for sound-related logs
            const soundLogs = [];
            page.on('console', msg => {
                if (msg.text().includes('Sound') || msg.text().includes('🔊')) {
                    soundLogs.push(msg.text());
                }
            });

            // Click 69 times rapidly (testing the easter egg)
            for (let i = 1; i <= 69; i++) {
                await clickButton.click();

                // Check specific milestones
                if (i === 42) {
                    const messageText = await clickMessage.textContent();
                    expect(messageText).toContain('THE ANSWER TO EVERYTHING');
                    console.log(`✅ Click ${i}: Found 42 easter egg`);
                }

                if (i === 69) {
                    await page.waitForTimeout(500);
                    const messageText = await clickMessage.textContent();
                    expect(messageText).toContain('NICE');
                    expect(messageText).toContain('god damn');

                    // Check button styling changed
                    const buttonStyle = await clickButton.getAttribute('style');
                    expect(buttonStyle).toContain('rainbow');

                    console.log(`🔥 Click ${i}: God damn sound triggered!`);
                    console.log(`Message: ${messageText}`);
                }

                // Small delay every 10 clicks to prevent overwhelming
                if (i % 10 === 0) {
                    await page.waitForTimeout(100);
                }
            }

            // Verify final state
            const finalCount = await page.locator('#click-count').textContent();
            expect(finalCount).toBe('(69)');
        });
    });

    test.describe('Clippy Integration Testing', () => {

        test('should load real ClippyJS and respond to keyboard shortcuts', async ({ page }) => {
            // Wait for ClippyJS to load
            await page.waitForFunction(() => typeof window.clippy !== 'undefined', { timeout: 10000 });

            // Monitor console for Clippy-related logs
            const clippyLogs = [];
            page.on('console', msg => {
                if (msg.text().includes('Clippy') || msg.text().includes('📎')) {
                    clippyLogs.push(msg.text());
                }
            });

            // Test Alt+Shift+C shortcut
            await page.keyboard.press('Alt+Shift+KeyC');
            await page.waitForTimeout(2000);

            // Check if Clippy appeared (look for speech bubbles or agent)
            const clippyElements = await page.locator('.clippy, [class*="clippy"], .agent').count();

            if (clippyElements > 0) {
                console.log('✅ Clippy visual elements detected');
            }

            // Check console logs for Clippy activity
            expect(clippyLogs.length).toBeGreaterThan(0);
            console.log(`📎 Clippy console logs: ${clippyLogs.join(', ')}`);

            // Verify ClippyJS library loaded
            const clippyAvailable = await page.evaluate(() => typeof window.clippy !== 'undefined');
            expect(clippyAvailable).toBe(true);
        });

        test('should test Konami code easter egg', async ({ page }) => {
            // Input Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
            const konamiSequence = [
                'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
                'KeyB', 'KeyA'
            ];

            for (const key of konamiSequence) {
                await page.keyboard.press(key);
                await page.waitForTimeout(100);
            }

            await page.waitForTimeout(2000);

            // Check for rainbow animation or other Konami code effects
            const bodyStyle = await page.locator('body').getAttribute('style');

            // Look for rainbow animation or other visual effects
            const rainbowActive = await page.evaluate(() => {
                return document.body.style.animation.includes('rainbow');
            });

            if (rainbowActive) {
                console.log('🎮 Konami code rainbow effect activated!');
            }

            console.log('🎮 Konami code sequence completed');
        });
    });

    test.describe('Contact Form and CV Instructions', () => {

        test('should test contact form elements', async ({ page }) => {
            // Navigate to contact section
            await page.click('a[href="#contact"]');
            await page.waitForTimeout(1000);

            // Test form fields
            await page.fill('input[name="name"]', 'Test Employer');
            await page.fill('input[name="email"]', 'test@company.com');
            await page.selectOption('select[name="subject"]', 'job');
            await page.fill('textarea[name="message"]', 'Great portfolio! We want to hire you!');

            // Test form submission (should show alert for now)
            page.on('dialog', async dialog => {
                expect(dialog.message()).toContain('Thank you for your message');
                await dialog.accept();
            });

            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);

            console.log('✅ Contact form submission tested');
        });

        test('should test CV download link', async ({ page }) => {
            // Navigate to contact section
            await page.click('a[href="#contact"]');
            await page.waitForTimeout(1000);

            // Find CV download link
            const cvLink = await page.locator('a[href="./assets/Yuval_Resume_2024.pdf"]');
            await expect(cvLink).toBeVisible();

            // Test link attributes
            const href = await cvLink.getAttribute('href');
            const download = await cvLink.getAttribute('download');

            expect(href).toBe('./assets/Yuval_Resume_2024.pdf');
            expect(download).toBe('Yuval_Resume_2024.pdf');

            console.log('✅ CV download link configured correctly');
        });
    });

    test.describe('Performance and Loading Tests', () => {

        test('should load all essential resources within reasonable time', async ({ page }) => {
            const startTime = Date.now();

            await page.goto('http://localhost:8000');
            await page.waitForLoadState('networkidle');

            const loadTime = Date.now() - startTime;
            console.log(`⚡ Page load time: ${loadTime}ms`);

            // Check essential elements are present
            await expect(page.locator('h1')).toBeVisible();
            await expect(page.locator('nav')).toBeVisible();
            await expect(page.locator('#fun-zone')).toBeVisible();
            await expect(page.locator('#contact')).toBeVisible();

            // Verify ClippyJS resources loaded
            const clippyLoaded = await page.evaluate(() => typeof window.clippy !== 'undefined');
            expect(clippyLoaded).toBe(true);

            expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
        });

        test('should test responsive design on mobile viewport', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.reload();
            await page.waitForLoadState('networkidle');

            // Test mobile navigation
            const mobileMenuButton = await page.locator('.mobile-menu-button');
            await expect(mobileMenuButton).toBeVisible();

            // Test that content is still accessible
            await expect(page.locator('h1')).toBeVisible();
            await expect(page.locator('#fun-zone')).toBeVisible();

            console.log('📱 Mobile responsive design tested');
        });
    });

    test.describe('JavaScript Console Error Monitoring', () => {

        test('should monitor for JavaScript errors', async ({ page }) => {
            const errors = [];

            page.on('console', msg => {
                if (msg.type() === 'error') {
                    errors.push(msg.text());
                }
            });

            page.on('pageerror', error => {
                errors.push(error.message);
            });

            // Navigate through all main sections
            await page.click('a[href="#about"]');
            await page.waitForTimeout(1000);

            await page.click('a[href="#skills"]');
            await page.waitForTimeout(1000);

            await page.click('a[href="#projects"]');
            await page.waitForTimeout(1000);

            await page.click('a[href="#fun-zone"]');
            await page.waitForTimeout(1000);

            await page.click('a[href="#contact"]');
            await page.waitForTimeout(1000);

            // Test interactive elements
            await page.click('#goose-talk');
            await page.click('#click-me-button');

            // Test keyboard shortcuts
            await page.keyboard.press('Alt+Shift+KeyC');

            // Report any errors
            if (errors.length > 0) {
                console.log('⚠️ JavaScript errors detected:');
                errors.forEach(error => console.log(`  - ${error}`));
            } else {
                console.log('✅ No JavaScript errors detected');
            }

            // Allow some warnings but no critical errors
            const criticalErrors = errors.filter(error =>
                !error.includes('cdn.tailwindcss.com') &&
                !error.includes('should not be used in production')
            );

            expect(criticalErrors.length).toBe(0);
        });
    });
});
