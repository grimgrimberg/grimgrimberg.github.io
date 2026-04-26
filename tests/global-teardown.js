async function globalTeardown() {
    const fs = require('fs');
    const path = require('path');

    const summaryPath = path.join(__dirname, '..', 'test-results', 'test-summary.json');
    const summary = {
        timestamp: new Date().toISOString(),
        suite: 'Maintained smoke suite',
        projects: ['Desktop Chrome', 'iPhone 12', 'Mobile Narrow 320'],
        features: [
            'homepage navigation',
            'mobile drawer behavior',
            'contact success UI',
            'clipboard fallback',
            'goose wisdom',
            'click counter',
            'photo gallery background and EXIF'
        ]
    };

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log('Playwright smoke teardown complete.');
}

module.exports = globalTeardown;
