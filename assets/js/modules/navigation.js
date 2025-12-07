/**
 * Navigation Module
 * Handles mobile menu, smooth scrolling, navbar background transitions
 */

export function initNavigation() {
    // Navbar background on scroll with throttling
    let scrollTimeout;
    window.addEventListener('scroll', function () {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('glass-effect');
                navbar.style.backgroundColor = 'rgba(10, 15, 28, 0.8)';
            } else {
                navbar.classList.remove('glass-effect');
                navbar.style.backgroundColor = 'transparent';
            }
        }, 10);
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Back to Top Button
    const backToTopButton = document.getElementById('backToTopButton');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.remove('hidden');
            } else {
                backToTopButton.classList.add('hidden');
            }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    console.log('Navigation module initialized');
}

/**
 * Mobile Menu Module
 * Handles mobile navigation drawer
 */
export function initMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuPanel = document.getElementById('mobile-menu-panel');
    const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileNavList = document.getElementById('mobile-nav-list');
    const desktopNav = document.getElementById('desktop-nav');
    let mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const hamburgerIcon = mobileMenuButton?.querySelector('i');

    // Build mobile drawer links from desktop links (single source of truth)
    function buildMobileNavLinks() {
        try {
            const desktopLinks = desktopNav ? desktopNav.querySelectorAll('a') : [];
            if (desktopLinks && desktopLinks.length && mobileNavList) {
                // Clear any hardcoded items to avoid duplicates
                mobileNavList.innerHTML = '';
                desktopLinks.forEach(a => {
                    const href = a.getAttribute('href');
                    const label = a.textContent.trim();
                    const li = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = href || '#';
                    link.className = 'mobile-nav-link block py-3 px-4 text-white hover:text-tech-cyan hover:bg-tech-cyan/10 rounded-lg transition-all duration-300 border-l-4 border-transparent hover:border-tech-cyan';
                    link.innerHTML = `<span class="ml-3">${label}</span>`;
                    li.appendChild(link);
                    mobileNavList.appendChild(li);
                });
                // Refresh live NodeList for listeners below
                mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
            }
        } catch (e) {
            console.log('Mobile menu auto-build skipped', e);
        }
    }

    function openMobileMenu() {
        event?.stopPropagation();
        event?.preventDefault();

        mobileMenu.classList.remove('hidden');
        mobileMenuButton.setAttribute('aria-expanded', 'true');

        requestAnimationFrame(() => {
            mobileMenuPanel.style.transform = 'translateX(0)';
            hamburgerIcon?.classList.replace('fa-bars', 'fa-times');
        });

        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        event?.stopPropagation();
        event?.preventDefault();

        mobileMenuPanel.style.transform = 'translateX(100%)';
        mobileMenuButton.setAttribute('aria-expanded', 'false');
        hamburgerIcon?.classList.replace('fa-times', 'fa-bars');

        setTimeout(() => {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }

    function bindMobileLinkClosers() {
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => closeMobileMenu());
        });
    }

    // Initialize
    buildMobileNavLinks();
    bindMobileLinkClosers();

    // Event listeners
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            openMobileMenu();
        });
    }

    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            closeMobileMenu();
        });
    }

    if (mobileMenuBackdrop) {
        mobileMenuBackdrop.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            closeMobileMenu();
        });
    }

    // Close menu with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
            closeMobileMenu();
        }
    });

    console.log('Mobile navigation initialized successfully');
}
