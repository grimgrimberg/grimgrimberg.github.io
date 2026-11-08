(function () {
    const NAV_ACTIVE_BACKGROUND = 'rgba(7, 10, 13, 0.94)';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function initNavbarBackground() {
        const navbar = document.getElementById('navbar');
        if (!navbar || navbar.dataset.navReady === 'true') {
            return;
        }

        const syncNavbar = () => {
            if (window.scrollY > 50) {
                navbar.classList.add('glass-effect');
                navbar.style.backgroundColor = NAV_ACTIVE_BACKGROUND;
            } else {
                navbar.classList.remove('glass-effect');
                navbar.style.backgroundColor = 'transparent';
            }
        };

        syncNavbar();
        window.addEventListener('scroll', syncNavbar, { passive: true });
        navbar.dataset.navReady = 'true';
    }

    function initSmoothAnchors() {
        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((anchor) => {
            if (anchor.dataset.anchorReady === 'true') {
                return;
            }

            anchor.addEventListener('click', (event) => {
                const target = document.querySelector(anchor.getAttribute('href'));
                if (!target) {
                    return;
                }

                event.preventDefault();
                target.scrollIntoView({
                    behavior: reducedMotion.matches ? 'auto' : 'smooth',
                    block: 'start'
                });
                // Keep the URL shareable and move keyboard focus with the scroll, so skip links actually skip.
                if (!anchor.hasAttribute('data-lab-target')) {
                    history.pushState(null, '', anchor.getAttribute('href'));
                }
                if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) {
                    target.setAttribute('tabindex', '-1');
                }
                target.focus({ preventScroll: true });
            });

            anchor.dataset.anchorReady = 'true';
        });
    }

    function initCurrentYear() {
        const year = String(new Date().getFullYear());
        document.querySelectorAll('[data-current-year]').forEach((element) => {
            element.textContent = year;
        });
    }

    function cloneDesktopLinks(mobileNavList, desktopNav) {
        if (!mobileNavList || !desktopNav || mobileNavList.children.length > 0) {
            return;
        }

        desktopNav.querySelectorAll('a').forEach((desktopLink) => {
            const href = desktopLink.getAttribute('href');
            const label = desktopLink.textContent.trim();
            if (!href || !label) {
                return;
            }

            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = href;
            link.className = 'mobile-nav-link block py-3 px-4 text-white hover:text-tech-cyan hover:bg-tech-cyan/10 rounded-lg transition-all duration-300 border-l-4 border-transparent hover:border-tech-cyan';
            link.innerHTML = `<span class="ml-3">${label}</span>`;
            item.appendChild(link);
            mobileNavList.appendChild(item);
        });
    }

    function initMobileMenu() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuPanel = document.getElementById('mobile-menu-panel');
        const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
        const mobileMenuClose = document.querySelector('.mobile-menu-close');
        const mobileNavList = document.getElementById('mobile-nav-list');
        const desktopNav = document.getElementById('desktop-nav');

        if (!mobileMenuButton || !mobileMenu || !mobileMenuPanel) {
            return;
        }

        if (mobileMenuButton.dataset.menuReady === 'true') {
            return;
        }

        const mobileMenuButtonParent = mobileMenuButton.parentElement;
        const mobileMenuButtonNextSibling = mobileMenuButton.nextSibling;
        let closeTimer = null;
        // opening and closing are the 300 ms slide; the panel only takes input in open.
        const menu = window.PortfolioState.define('menu', {
            initial: 'closed',
            states: {
                closed: { open: 'opening' },
                opening: { opened: 'open', close: 'closing' },
                open: { close: 'closing' },
                closing: { closed: 'closed', open: 'opening' }
            }
        });

        cloneDesktopLinks(mobileNavList, desktopNav);
        initSmoothAnchors();

        if (mobileMenu.parentElement !== document.body) {
            document.body.appendChild(mobileMenu);
        }

        const restoreMobileMenuButton = () => {
            if (mobileMenuButton.parentElement === mobileMenuButtonParent) {
                return;
            }

            if (mobileMenuButtonNextSibling?.parentElement === mobileMenuButtonParent) {
                mobileMenuButtonParent.insertBefore(mobileMenuButton, mobileMenuButtonNextSibling);
            } else {
                mobileMenuButtonParent.appendChild(mobileMenuButton);
            }
        };

        // returnFocus is false when a nav link closes the drawer: the anchor handler has already moved focus to the section.
        const closeMobileMenu = (returnFocus = true) => {
            if (!menu.send('close')) {
                return;
            }
            window.PortfolioState.overlays.remove('menu');
            mobileMenuPanel.classList.add('translate-x-full');
            mobileMenu.classList.add('pointer-events-none');
            mobileMenuButton.classList.remove('mobile-menu-button-open');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            restoreMobileMenuButton();
            if (returnFocus) {
                mobileMenuButton.focus({ preventScroll: true });
            }

            window.clearTimeout(closeTimer);
            closeTimer = window.setTimeout(() => {
                closeTimer = null;
                if (!menu.send('closed')) {
                    return;
                }
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('pointer-events-none');
                document.body.style.overflow = '';
            }, 300);
        };

        const openMobileMenu = () => {
            if (!menu.send('open')) {
                return;
            }
            window.clearTimeout(closeTimer);
            mobileMenu.classList.remove('pointer-events-none');
            mobileMenu.classList.remove('hidden');
            mobileMenuButton.classList.add('mobile-menu-button-open');
            mobileMenuButton.setAttribute('aria-expanded', 'true');
            document.body.appendChild(mobileMenuButton);
            window.PortfolioState.overlays.open('menu', { close: () => closeMobileMenu(), container: mobileMenuPanel });

            requestAnimationFrame(() => {
                if (!menu.send('opened')) {
                    return;
                }
                mobileMenuPanel.classList.remove('translate-x-full');
                mobileMenuClose?.focus({ preventScroll: true });
            });

            document.body.style.overflow = 'hidden';
        };

        mobileMenuButton.addEventListener('click', (event) => {
            event.preventDefault();
            if (menu.is('open', 'opening')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        mobileMenuClose?.addEventListener('click', (event) => {
            event.preventDefault();
            closeMobileMenu();
        });

        mobileMenuBackdrop?.addEventListener('click', () => closeMobileMenu());

        mobileMenu.querySelectorAll('.mobile-nav-link').forEach((link) => {
            link.addEventListener('click', () => closeMobileMenu(false));
        });

        // The drawer only exists below md; widening the window must not leave its overlay or scroll lock behind.
        window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
            if (event.matches) {
                closeMobileMenu(false);
            }
        });

        mobileMenuButton.dataset.menuReady = 'true';
    }

    document.addEventListener('DOMContentLoaded', () => {
        initNavbarBackground();
        initMobileMenu();
        initSmoothAnchors();
        initCurrentYear();
    });
})();
