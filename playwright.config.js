import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    testMatch: '**/smoke.spec.js',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    timeout: 90000,
    reporter: [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }]
    ],
    use: {
        baseURL: 'http://127.0.0.1:8000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'off',
        actionTimeout: 15000,
        navigationTimeout: 30000
    },
    projects: [
        {
            name: 'Desktop Chrome',
            use: { ...devices['Desktop Chrome'] }
        },
        {
            name: 'iPhone 12',
            use: {
                ...devices['iPhone 12'],
                browserName: 'chromium'
            }
        },
        {
            name: 'Mobile Narrow 320',
            use: {
                ...devices['iPhone SE'],
                browserName: 'chromium',
                viewport: { width: 320, height: 568 }
            }
        }
    ],
    webServer: {
        command: 'npm run serve',
        url: 'http://127.0.0.1:8000',
        reuseExistingServer: !process.env.CI,
        timeout: 30000
    },
    globalSetup: require.resolve('./tests/global-setup.js'),
    globalTeardown: require.resolve('./tests/global-teardown.js')
});
