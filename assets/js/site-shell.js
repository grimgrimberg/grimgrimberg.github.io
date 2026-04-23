(function () {
    const NAV_ACTIVE_BACKGROUND = 'rgba(10, 15, 28, 0.8)';

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
                    behavior: 'smooth',
                    block: 'start'
                });
            });

            anchor.dataset.anchorReady = 'true';
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

        const hamburgerIcon = mobileMenuButton.querySelector('i');

        cloneDesktopLinks(mobileNavList, desktopNav);
        initSmoothAnchors();

        const closeMobileMenu = () => {
            mobileMenuPanel.classList.add('translate-x-full');
            mobileMenu.classList.add('pointer-events-none');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            hamburgerIcon?.classList.replace('fa-times', 'fa-bars');

            window.setTimeout(() => {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('pointer-events-none');
                document.body.style.overflow = '';
            }, 300);
        };

        const openMobileMenu = () => {
            mobileMenu.classList.remove('hidden');
            mobileMenuButton.setAttribute('aria-expanded', 'true');

            requestAnimationFrame(() => {
                mobileMenuPanel.classList.remove('translate-x-full');
                hamburgerIcon?.classList.replace('fa-bars', 'fa-times');
            });

            document.body.style.overflow = 'hidden';
        };

        mobileMenuButton.addEventListener('click', (event) => {
            event.preventDefault();
            const isOpen = mobileMenuButton.getAttribute('aria-expanded') === 'true';
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        mobileMenuClose?.addEventListener('click', (event) => {
            event.preventDefault();
            closeMobileMenu();
        });

        mobileMenuBackdrop?.addEventListener('click', closeMobileMenu);

        mobileMenu.querySelectorAll('.mobile-nav-link').forEach((link) => {
            link.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && mobileMenuButton.getAttribute('aria-expanded') === 'true') {
                closeMobileMenu();
            }
        });

        mobileMenuButton.dataset.menuReady = 'true';
    }

    document.addEventListener('DOMContentLoaded', () => {
        initNavbarBackground();
        initMobileMenu();
        initSmoothAnchors();
    });
})();
