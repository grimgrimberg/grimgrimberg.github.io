async function globalSetup() {
    const fs = require('fs');
    const path = require('path');

    const testResultsDir = path.join(__dirname, '..', 'test-results');
    if (!fs.existsSync(testResultsDir)) {
        fs.mkdirSync(testResultsDir, { recursive: true });
    }

    console.log('Starting maintained Playwright smoke setup...');
    console.log('Projects: Desktop Chrome, iPhone 12, Mobile Narrow 320');
}

module.exports = globalSetup;
