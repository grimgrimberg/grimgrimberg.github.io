# Copilot Instructions for Yuval's Portfolio Website

## Architecture Overview

This is a **single-page portfolio website** for a Control Systems Engineer, built with TailwindCSS and vanilla JavaScript. The architecture follows a **component-driven, glass-morphism design** with interactive features and comprehensive testing.

### Key Design Patterns
- **Glass-morphism UI**: Uses `.glass-effect` class with `backdrop-filter: blur(10px)` 
- **Tech Color Palette**: Custom CSS variables (`--tech-blue`, `--tech-cyan`, `--tech-purple`, etc.)
- **AOS Animations**: Animate On Scroll library with `data-aos` attributes
- **Mobile-First Responsive**: TailwindCSS breakpoints with `md:hidden` patterns

## Critical Workflows

### Development Setup
```bash
npm install                    # Install dependencies
npm run build                 # Build TailwindCSS (required for production)
npm run watch                 # Watch CSS changes during development
python -m http.server 8000    # Local server (required for testing)
```

### Testing Workflow
```bash
npx playwright test                           # Run all tests
npx playwright test --project="iPhone 12"    # Mobile-specific testing
npx playwright show-report                   # View HTML test report
```

**Critical**: Always start local server before running tests - tests expect `http://localhost:8000`

## Mobile Navigation Issue (KNOWN BUG)

The mobile hamburger menu exists but is **not functional**:
- Button exists: `<button class="md:hidden mobile-menu-button">`
- Handler exists but empty: `console.log('Mobile menu clicked');`
- **Missing**: Slide-out menu, menu items, toggle functionality

### Fix Pattern
```javascript
// Expected mobile menu implementation in index.html
const mobileMenuButton = document.querySelector('.mobile-menu-button');
const mobileMenu = document.createElement('div'); // Create slide-out menu
// Add menu items, toggle classes, backdrop handling
```

## Project-Specific Conventions

### Contact Form Architecture
- **No backend**: Uses `mailto:` links with pre-filled content
- **Form validation**: Client-side only, highlights invalid fields with `ring-red-500`
- **Email generation**: Constructs mailto URLs with form data

### Interactive Features Pattern
```javascript
// All interactive elements follow this pattern:
function openEmailClient() {
    // 1. Gather form data
    // 2. Validate inputs
    // 3. Generate mailto URL
    // 4. Show success state
}
```

### Animation System
- **AOS Library**: `data-aos="fade-up"` with delays (`data-aos-delay="200"`)
- **Custom Animations**: Defined in `tailwind.config.js` (`animate-pulse-glow`, `animate-float`)
- **Hover Effects**: `.hover-lift` class for transform animations

## Testing Architecture

### Multi-Device Testing
- **Playwright Config**: 15+ device configurations (Desktop Chrome/Firefox/Safari, iPhone 12, Galaxy S9+, iPad Pro)
- **Test Structure**: Device-specific projects in `playwright.config.js`
- **Responsive Testing**: Tests viewport changes and touch interactions

### Test File Patterns
- `portfolio-features.spec.js`: Main functionality tests
- `responsive-mobile-desktop.spec.js`: Cross-device compatibility
- `contact-form.spec.js`: Email functionality testing

## File Structure Significance

```
assets/css/
├── styles.css     # Source TailwindCSS (edit this)
└── output.css     # Compiled CSS (auto-generated, don't edit)

tests/
├── global-setup.js     # Test environment initialization
├── global-teardown.js  # Test cleanup and reporting
└── *.spec.js          # Individual test suites

_includes/nav.html      # Jekyll-style includes (legacy, not used)
index.html             # Main SPA (1900+ lines)
photo.html             # Photography gallery page
```

## Integration Points

### External Dependencies
- **TailwindCSS CDN**: Used in development, local build for production
- **AOS Library**: Scroll animations from CDN
- **Font Awesome**: Icons from CDN
- **Lottie**: Animation rendering for goose character

### Performance Considerations
- **Image Optimization**: PowerShell script in `optimize-images.ps1`
- **Local CSS Build**: `npm run build` creates minified CSS
- **No external APIs**: All functionality is client-side

## Common Debugging Patterns

### CSS Issues
1. Check if `npm run build` was run after TailwindCSS changes
2. Verify custom colors are defined in both `index.html` and `tailwind.config.js`
3. Glass effects require `backdrop-filter` support

### JavaScript Issues  
1. Check browser console for errors (especially Lottie loading)
2. Verify AOS initialization: `AOS.init()` called after DOM load
3. Form validation errors show as red rings on inputs

### Mobile Issues
1. Test on actual devices - viewport meta tag is crucial
2. Touch events may differ from click events
3. **Mobile nav is currently broken** - needs implementation

## Next Actions for Mobile Nav

Create slide-out navigation with:
1. Menu container with backdrop
2. Navigation links from desktop menu
3. Smooth slide animations
4. Proper z-index layering
5. Close on outside click or menu item selection
