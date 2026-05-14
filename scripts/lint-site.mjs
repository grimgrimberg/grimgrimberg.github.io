import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const rootHtmlPages = readdirSync(cwd)
    .filter((filePath) => filePath.endsWith('.html'))
    .sort();
const maintainedPages = ['index.html', 'photo.html', 'thank-you.html', 'cv.html'];
const failures = [];

function read(filePath) {
    return readFileSync(path.join(cwd, filePath), 'utf8');
}

function normalize(source) {
    return source.replace(/\s+/g, ' ').trim();
}

function record(filePath, message) {
    failures.push(`${filePath}: ${message}`);
}

function requireMatch(filePath, source, regex, message) {
    if (!regex.test(source)) {
        record(filePath, message);
    }
}

function countMatches(source, regex) {
    const matches = source.match(regex);
    return matches ? matches.length : 0;
}

function findTag(normalizedSource, regex) {
    const match = normalizedSource.match(regex);
    return match ? match[0] : '';
}

for (const filePath of rootHtmlPages) {
    const source = read(filePath);
    const normalized = normalize(source);

    requireMatch(filePath, normalized, /<meta[^>]+name=["']viewport["']/i, 'missing viewport meta tag');

    if (/href\s*=\s*["']#["']/i.test(normalized)) {
        record(filePath, 'contains href="#" placeholder links');
    }

    if (/href\s*=\s*["']javascript:/i.test(normalized)) {
        record(filePath, 'contains javascript: links');
    }

    if (/href\s*=\s*["'](?:tel:|https?:\/\/(?:wa\.me|[^"']*whatsapp)|[^"']*calendar)/i.test(normalized)) {
        record(filePath, 'contains a phone, WhatsApp, or calendar contact link');
    }

    if (/<script\b[^>]+src=["']https?:\/\//i.test(normalized)) {
        record(filePath, 'contains a remote script dependency');
    }

    if (/<link\b[^>]+rel=["']stylesheet["'][^>]+href=["']https?:\/\//i.test(normalized)) {
        record(filePath, 'contains a remote stylesheet dependency');
    }

    const anchorTags = normalized.match(/<a\b[^>]*>/gi) ?? [];
    for (const anchorTag of anchorTags) {
        if (!/target=["']_blank["']/i.test(anchorTag)) {
            continue;
        }

        const relMatch = anchorTag.match(/\brel=["']([^"']+)["']/i);
        const relValue = relMatch ? relMatch[1].toLowerCase() : '';
        if (!relValue.includes('noopener') || !relValue.includes('noreferrer')) {
            record(filePath, 'target="_blank" link missing rel="noopener noreferrer"');
        }
    }
}

for (const filePath of maintainedPages) {
    const normalized = normalize(read(filePath));

    if (countMatches(normalized, /<link[^>]+href=["']assets\/css\/output\.css["'][^>]*>/gi) !== 1) {
        record(filePath, 'maintained page should include exactly one assets/css/output.css link');
    }

    if (/cdn\.tailwindcss\.com/i.test(normalized)) {
        record(filePath, 'maintained page should not load cdn.tailwindcss.com');
    }
}

for (const filePath of ['index.html', 'photo.html']) {
    const normalized = normalize(read(filePath));
    const menuButton = findTag(normalized, /<button\b[^>]*id=["']mobile-menu-button["'][^>]*>/i);
    const closeButton = findTag(normalized, /<button\b[^>]*class=["'][^"']*\bmobile-menu-close\b[^"']*["'][^>]*>/i);

    if (!/\btouch-target\b/i.test(menuButton)) {
        record(filePath, `${filePath === 'index.html' ? 'homepage' : 'photo page'} mobile menu button should carry touch-target protection`);
    }

    if (!/\btouch-target\b/i.test(closeButton)) {
        record(filePath, `${filePath === 'index.html' ? 'homepage' : 'photo page'} drawer close button should carry touch-target protection`);
    }
}
requireMatch(
    'index.html',
    normalize(read('index.html')),
    /class=["'][^"']*\bfooter-link-list\b/i,
    'homepage footer should keep the footer-link-list class'
);
requireMatch(
    'photo.html',
    normalize(read('photo.html')),
    /class=["'][^"']*\bfooter-link-list\b/i,
    'photo footer should keep the footer-link-list class'
);

if (countMatches(normalize(read('index.html')), /\bfooter-social-link\b/g) < 3) {
    record('index.html', 'homepage footer social links should use footer-social-link sizing');
}

if (countMatches(normalize(read('photo.html')), /\bfooter-social-link\b/g) < 3) {
    record('photo.html', 'photo footer social links should use footer-social-link sizing');
}

if (countMatches(normalize(read('index.html')), /\bproject-action-link\b/g) < 3) {
    record('index.html', 'homepage project detail links should use project-action-link sizing');
}

if (countMatches(normalize(read('index.html')), /\bproject-icon-link\b/g) < 3) {
    record('index.html', 'homepage project icon links should use project-icon-link sizing');
}

if (failures.length > 0) {
    console.error('Site lint failed:\n');
    for (const failure of failures) {
        console.error(`- ${failure}`);
    }
    process.exit(1);
}

console.log('Site lint passed.');
