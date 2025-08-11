// Global setup for Playwright tests
async function globalSetup(config) {
    console.log('🚀 Starting global setup for responsive testing...');

    // Create test results directory
    const fs = require('fs');
    const path = require('path');

    const testResultsDir = path.join(__dirname, '..', 'test-results');
    if (!fs.existsSync(testResultsDir)) {
        fs.mkdirSync(testResultsDir, { recursive: true });
    }

    // Create screenshots directory for responsive testing
    const screenshotsDir = path.join(testResultsDir, 'responsive-screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    console.log('✅ Test directories created');
    console.log('🌐 Testing will cover:');
    console.log('  - Desktop: Chrome, Firefox, Safari');
    console.log('  - Mobile: iPhone 12, iPhone SE, Galaxy S9+, Pixel 5');
    console.log('  - Tablets: iPad Pro, Galaxy Tab S4');
    console.log('  - Custom breakpoints: 375px, 768px, 1024px, 1920px');
    console.log('  - Accessibility: Reduced motion, forced colors');
    console.log('  - Network conditions: Slow 3G simulation');
    console.log('  - Color schemes: Light and dark mode');

    return async () => {
        // This function will be called after all tests
        console.log('🧹 Global setup cleanup completed');
    };
}

module.exports = globalSetup;
