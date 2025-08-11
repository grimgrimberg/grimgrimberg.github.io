import { defineConfig, devices } from '@playwright/test';

/**
 * Comprehensive Playwright Configuration for Portfolio Testing
 * Covers Desktop, Mobile, and Cross-Device Responsive Testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }]
    ],

    use: {
        baseURL: 'http://localhost:8000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 30000,
        navigationTimeout: 60000,
    },

    projects: [
        // Desktop Testing Projects
        {
            name: 'Desktop Chrome',
            use: { ...devices['Desktop Chrome'] },
            testMatch: ['**/responsive-mobile-desktop.spec.js', '**/portfolio-features.spec.js']
        },
        {
            name: 'Desktop Firefox',
            use: { ...devices['Desktop Firefox'] },
            testMatch: ['**/responsive-mobile-desktop.spec.js']
        },
        {
            name: 'Desktop Safari',
            use: { ...devices['Desktop Safari'] },
            testMatch: ['**/responsive-mobile-desktop.spec.js']
        },

        // Mobile Testing Projects
        {
            name: 'iPhone 12',
            use: { ...devices['iPhone 12'] },
            testMatch: ['**/responsive-mobile-desktop.spec.js', '**/mobile-nav-positioning.spec.js']
        },
        {
            name: 'iPhone SE',
            use: { ...devices['iPhone SE'] },
            testMatch: ['**/responsive-mobile-desktop.spec.js', '**/mobile-nav-positioning.spec.js']
        },
        {
            name: 'Galaxy S9+',
            use: { ...devices['Galaxy S9+'] },
            testMatch: ['**/responsive-mobile-desktop.spec.js', '**/mobile-nav-positioning.spec.js']
        },
        {
            name: 'Pixel 5',
            use: { ...devices['Pixel 5'] },
            testMatch: ['**/responsive-mobile-desktop.spec.js', '**/mobile-nav-positioning.spec.js']
        },

        // Tablet Testing Projects
        {
            name: 'iPad Pro',
            use: { ...devices['iPad Pro'] },
            testMatch: ['**/responsive-mobile-desktop.spec.js']
        },
        {
            name: 'Galaxy Tab S4',
            use: { ...devices['Galaxy Tab S4'] },
            testMatch: ['**/responsive-mobile-desktop.spec.js']
        },

        // Custom Responsive Breakpoint Testing
        {
            name: 'Mobile Portrait 375px',
            use: {
                ...devices['iPhone 12'],
                viewport: { width: 375, height: 667 }
            },
            testMatch: ['**/responsive-mobile-desktop.spec.js']
        },
        {
            name: 'Tablet Landscape 1024px',
            use: {
                ...devices['iPad Pro'],
                viewport: { width: 1024, height: 768 }
            },
            testMatch: ['**/responsive-mobile-desktop.spec.js']
        },
        {
            name: 'Desktop Large 1920px',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 }
            },
            testMatch: ['**/responsive-mobile-desktop.spec.js']
        },

        // High DPI Testing
        {
            name: 'High DPI Mobile',
            use: {
                ...devices['iPhone 12'],
                deviceScaleFactor: 3,
                viewport: { width: 375, height: 812 }
            },
            testMatch: ['**/mobile-touch-gestures.spec.js']
        },

        // Slow Network Testing (Mobile)
        {
            name: 'Mobile Slow 3G',
            use: {
                ...devices['Pixel 5'],
                launchOptions: {
                    slowMo: 100
                }
            },
            testMatch: ['**/responsive-mobile-desktop.spec.js']
        },

        // Accessibility Testing
        {
            name: 'Mobile Accessibility',
            use: {
                ...devices['iPhone 12'],
                reducedMotion: 'reduce',
                forcedColors: 'active'
            },
            testMatch: ['**/mobile-touch-gestures.spec.js']
        },

        // Dark Mode Testing
        {
            name: 'Dark Mode Desktop',
            use: {
                ...devices['Desktop Chrome'],
                colorScheme: 'dark'
            },
            testMatch: ['**/responsive-mobile-desktop.spec.js']
        },
        {
            name: 'Dark Mode Mobile',
            use: {
                ...devices['iPhone 12'],
                colorScheme: 'dark'
            },
            testMatch: ['**/mobile-touch-gestures.spec.js']
        }
    ],

    webServer: {
        command: 'python -m http.server 8000',
        url: 'http://localhost:8000',
        reuseExistingServer: !process.env.CI,
        cwd: process.cwd(),
        timeout: 120000,
    },

    // Global test configuration
    globalSetup: require.resolve('./tests/global-setup.js'),
    globalTeardown: require.resolve('./tests/global-teardown.js'),
});
