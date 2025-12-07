/**
 * Portfolio Application - Bundled Version
 * All modules combined for compatibility
 */

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Portfolio System Initializing...');

    // CRITICAL FIX: Wait for jQuery and Clippy libraries to load
    // Since scripts are loaded with defer, they may not be ready immediately
    function waitForLibraries(callback, attempts = 0) {
        const maxAttempts = 50; // 5 seconds max wait

        if (typeof $ !== 'undefined' && typeof clippy !== 'undefined') {
            console.log('✅ Libraries loaded: jQuery and Clippy ready');
            callback();
        } else if (attempts < maxAttempts) {
            console.log(`⏳ Waiting for libraries... (attempt ${attempts + 1}/${maxAttempts})`);
            setTimeout(() => waitForLibraries(callback, attempts + 1), 100);
        } else {
            console.warn('⚠️ Libraries not loaded, continuing without Clippy');
            callback();
        }
    }

    waitForLibraries(function () {
        try {
            // ==========================================
            // ANIMATIONS MODULE
            // ==========================================
            function initAnimations() {
                if (typeof AOS !== 'undefined') {
                    AOS.init({
                        duration: 800,
                        easing: 'ease-in-out',
                        once: true,
                        mirror: false
                    });
                }

                const observerOptions = {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                };

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('animate-fade-in');
                        }
                    });
                }, observerOptions);

                document.querySelectorAll('.project-card').forEach(card => {
                    observer.observe(card);
                });

                console.log('Animations module initialized');
            }

            // Goose animation removed - keeping function stub for compatibility
            function loadGooseAnimation() {
                // Goose animation container removed from HTML
                console.log('Goose animation disabled');
            }

            // ==========================================
            // NAVIGATION MODULE
            // ==========================================
            function initNavigation() {
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

            // ==========================================
            // MOBILE MENU MODULE
            // ==========================================
            function initMobileMenu() {
                const mobileMenuButton = document.querySelector('.mobile-menu-button');
                const mobileMenu = document.getElementById('mobile-menu');
                const mobileMenuPanel = document.getElementById('mobile-menu-panel');
                const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
                const mobileMenuClose = document.querySelector('.mobile-menu-close');
                const mobileNavList = document.getElementById('mobile-nav-list');
                const desktopNav = document.getElementById('desktop-nav');
                let mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
                const hamburgerIcon = mobileMenuButton?.querySelector('i');

                function buildMobileNavLinks() {
                    try {
                        const desktopLinks = desktopNav ? desktopNav.querySelectorAll('a') : [];
                        if (desktopLinks && desktopLinks.length && mobileNavList) {
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

                buildMobileNavLinks();
                bindMobileLinkClosers();

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

                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                        closeMobileMenu();
                    }
                });

                console.log('Mobile navigation initialized successfully');
            }

            // ==========================================
            // CONTACT FORM MODULE
            // ==========================================
            function initContactForm() {
                const simpleForm = document.getElementById('simple-contact-form');

                if (simpleForm) {
                    simpleForm.addEventListener('submit', function (e) {
                        e.preventDefault();
                        openEmailClient();
                    });
                }

                console.log('Contact form module initialized');
            }

            function openEmailClient() {
                const nameEl = document.getElementById('contact-name');
                const emailEl = document.getElementById('contact-email');
                const subjectEl = document.getElementById('contact-subject');
                const messageEl = document.getElementById('contact-message');
                const statusEl = document.getElementById('contact-status');

                const name = nameEl.value.trim();
                const email = emailEl.value.trim();
                const subject = subjectEl.value.trim();
                const message = messageEl.value.trim();

                const invalid = [];
                if (!name) invalid.push(nameEl);
                if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) invalid.push(emailEl);
                if (!message) invalid.push(messageEl);

                if (invalid.length) {
                    invalid.forEach(el => {
                        el.classList.add('ring-2', 'ring-red-500');
                        el.setAttribute('aria-invalid', 'true');
                    });
                    setTimeout(() => invalid.forEach(el => {
                        el.classList.remove('ring-2', 'ring-red-500');
                        el.removeAttribute('aria-invalid');
                    }), 1500);
                    alert('Please provide a valid Name, Email and Message.');
                    return;
                }

                const emailSubject = `Portfolio Contact: ${subject || 'General Inquiry'}`;
                const emailBody = `Hi Yuval,%0D%0A%0D%0AName: ${name}%0D%0AEmail: ${email}%0D%0ASubject: ${subject || 'N/A'}%0D%0A%0D%0AMessage:%0D%0A${message}%0D%0A%0D%0A---%0D%0AThis message was sent from your portfolio website.%0D%0A%0D%0ABest regards,%0D%0A${name}`;
                const mailtoLink = `mailto:yuval.grimberg@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${emailBody}`;

                const successHtml = `
                <div class="text-center py-8" id="contact-success" data-contact-sent="true">
                    <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-tech-green to-tech-cyan rounded-full flex items-center justify-center">
                        <i class="fas fa-check text-2xl text-white"></i>
                    </div>
                    <h4 class="text-2xl font-bold text-tech-cyan mb-3">Email Client Opened (or Ready)!</h4>
                    <p class="text-gray-300 mb-4">If your default email client didn't appear, just click the button below or copy the message manually.</p>
                    <div class="space-y-4 max-w-xl mx-auto">
                        <a id="retry-mailto" href="${mailtoLink}" class="inline-flex items-center space-x-2 bg-gradient-to-r from-tech-purple to-tech-cyan hover:from-tech-cyan hover:to-tech-purple text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300">
                            <i class="fas fa-envelope"></i><span>Try Opening Email Again</span>
                        </a>
                        <div class="text-left bg-gray-800/60 border border-gray-700 rounded-lg p-4 overflow-y-auto max-h-56 text-sm font-mono" id="email-preview" aria-label="Email preview">Hi Yuval,

Name: ${name}
Email: ${email}
Subject: ${subject || 'N/A'}

Message:
${message}

---
This message was sent from your portfolio website.

Best regards,
${name}</div>
                        <button id="copy-email-content" class="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">Copy Message to Clipboard</button>
                        <a href="index.html#contact" class="text-tech-cyan hover:text-tech-purple text-sm inline-block">Send another message</a>
                    </div>
                </div>`;

                const formContainer = document.getElementById('simple-contact-form');
                formContainer.innerHTML = successHtml;
                statusEl.textContent = 'Contact form processed – success screen displayed';

                const copyBtn = document.getElementById('copy-email-content');
                copyBtn?.addEventListener('click', () => {
                    const rawText = document.getElementById('email-preview').textContent;
                    navigator.clipboard.writeText(rawText).then(() => {
                        copyBtn.textContent = 'Copied!';
                        setTimeout(() => copyBtn.textContent = 'Copy Message to Clipboard', 1500);
                    });
                });

                setTimeout(() => {
                    try {
                        window.location.href = mailtoLink;
                    } catch (e) {
                        console.log('mailto navigation failed in this environment');
                    }
                }, 100);
            }

            // Expose globally
            window.openEmailClient = openEmailClient;

            // ==========================================
            // INTERACTIVE FEATURES MODULE
            // ==========================================
            let funClickCount = 0;

            function initInteractiveFeatures() {
                const clickMeButton = document.getElementById('click-me-button');
                const clickCountDisplay = document.getElementById('click-count');
                const clickMessage = document.getElementById('click-message');

                if (clickMeButton) {
                    clickMeButton.addEventListener('click', function () {
                        funClickCount++;
                        clickCountDisplay.textContent = `(${funClickCount})`;

                        const messages = [
                            "Great! You can follow instructions.",
                            "Wow, you're persistent. I like that in a teammate.",
                            "Still clicking? This is exactly the attention to detail we need.",
                            "You're either very dedicated or very bored. Either way, hired!",
                            "Ok seriously, you'd fit right into our QA testing team.",
                            "At this point you're just stress-testing my button. Respect.",
                            "You know what? Let's talk. Email me.",
                            "This is getting weird but I admire your commitment.",
                            "Are you trying to find the meaning of life? It's 42, btw.",
                            "🎉 CONGRATS! You found the persistence level of a true engineer!"
                        ];

                        if (funClickCount <= messages.length) {
                            clickMessage.textContent = messages[funClickCount - 1];
                        }

                        if (funClickCount === 42) {
                            clickMessage.innerHTML = '🎊 THE ANSWER TO EVERYTHING! You are definitely engineer material! 🎊';
                            clickMeButton.classList.add('animate-bounce');

                            if (window.clippyAgent && window.clippyLoaded) {
                                window.clippyAgent.moveTo(200, 200);
                                window.clippyAgent.show();
                                window.clippyAgent.play('Congratulate');
                                window.clippyAgent.speak('🎉 42! The Answer to Life, Universe, and Everything! You\'re a true geek!');
                                setTimeout(() => window.clippyAgent.hide(), 8000);
                            }
                        }

                        if (funClickCount === 69) {
                            clickMessage.innerHTML = '🔥 NICE! 69 clicks! god damn you\'re committed! 🔥';
                            clickMeButton.style.background = 'linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0)';
                            clickMeButton.style.animation = 'rainbow 2s infinite';

                            try {
                                const godDamnAudio = new Audio('./assets/sounds/god-dam.mp3');
                                godDamnAudio.volume = 0.7;
                                godDamnAudio.play().catch(e => console.log('🔊 Sound play blocked by browser'));
                                console.log('🔊 Playing god damn sound at 69 clicks!');
                            } catch (error) {
                                console.log('🔊 God damn sound file not found');
                            }

                            if (window.clippyAgent && window.clippyLoaded) {
                                window.clippyAgent.moveTo(300, 200);
                                window.clippyAgent.show();
                                window.clippyAgent.play('GetAttention');
                                window.clippyAgent.speak('NICE! 69 clicks! That\'s... nice. 😏');
                                setTimeout(() => window.clippyAgent.hide(), 8000);
                            }
                        }

                        if (funClickCount % 5 === 0 && funClickCount !== 42 && funClickCount !== 69) {
                            clickMeButton.style.background = `linear-gradient(45deg, hsl(${Math.random() * 360}, 70%, 50%), hsl(${Math.random() * 360}, 70%, 50%))`;
                        }
                    });
                }

                const gooseTalkButton = document.getElementById('goose-talk');
                const gooseWisdom = document.getElementById('goose-wisdom');

                if (gooseTalkButton) {
                    const gooseQuotes = [
                        "Debugging is like being a detective in a crime where you're also the murderer.",
                        "There are only 10 types of people: those who understand binary and those who don't.",
                        "If it works, don't touch it. If it doesn't work, blame the hardware.",
                        "Code never lies, comments sometimes do, but geese always honk truth.",
                        "The best debugging tool is a good night's sleep. The second best is coffee.",
                        "Real programmers count from 0. Real geese count backwards from infinity.",
                        "Why do programmers prefer dark mode? Because light attracts bugs!",
                        "A day without git commits is like a day without sunshine. Depressing and unproductive.",
                        "In Soviet Russia, code debugs you! Wait, that's everywhere now.",
                        "I don't always test my code, but when I do, I do it in production. 🦆"
                    ];

                    gooseTalkButton.addEventListener('click', function () {
                        try {
                            const audio = new Audio('./assets/sounds/honk-sound.mp3');
                            audio.volume = 0.6;
                            audio.play().catch(e => console.log('🦆 Honk sound play blocked'));
                        } catch (error) {
                            console.log('🦆 Honk sound file not found');
                        }

                        const randomQuote = gooseQuotes[Math.floor(Math.random() * gooseQuotes.length)];
                        gooseWisdom.textContent = `"${randomQuote}"`;

                        gooseWisdom.style.animation = 'none';
                        setTimeout(() => {
                            gooseWisdom.style.animation = 'pulse 1s ease-in-out';
                        }, 10);
                    });
                }

                console.log('Interactive features module initialized');
            }

            // ==========================================
            // CLIPPY MODULE
            // ==========================================
            let clippyAgent = null;
            let clippyLoaded = false;
            let clippyInitAttempts = 0;
            let clippyHideTimeout = null;
            const MAX_CLIPPY_ATTEMPTS = 10;

            window.CLIPPY_CDN = 'https://cdn.jsdelivr.net/gh/smore-inc/clippy.js@master/build/agents/';
            const CLIPPY_CDN_FALLBACK = 'https://cdn.jsdelivr.net/gh/pi0/clippyjs@master/assets/agents/';

            function initClippy() {
                initializeRealClippy();
                setupClippyKeyboardShortcuts();
                setupMobileClippyToggle();

                window.clippyAgent = clippyAgent;
                window.clippyLoaded = clippyLoaded;
                window.summonClippy = summonClippy;
                window.checkClippyStatus = checkClippyStatus;

                console.log('Clippy module initialized');
            }

            function initializeRealClippy() {
                clippyInitAttempts++;
                console.log(`📎 Clippy init attempt ${clippyInitAttempts}/${MAX_CLIPPY_ATTEMPTS}`);

                if (clippyInitAttempts > MAX_CLIPPY_ATTEMPTS) {
                    console.log('❌ Clippy failed to load after max attempts');
                    return;
                }

                if (typeof clippy !== 'undefined' && typeof $ !== 'undefined') {
                    console.log('🎉 Loading REAL Microsoft Office Clippy!');

                    try {
                        clippy.load('Clippy', function (agent) {
                            clippyAgent = agent;
                            clippyLoaded = true;
                            window.clippyAgent = clippyAgent;
                            window.clippyLoaded = clippyLoaded;

                            console.log('📎 REAL Clippy loaded successfully!');
                            clippyAgent.moveTo(100, 100);
                            clippyAgent.show();
                            clippyAgent.speak("Hi! I'm Clippy. I'm here to help you navigate Yuval's portfolio!");

                            setTimeout(() => {
                                clippyAgent.hide();
                            }, 8000);
                        }, function (error) {
                            console.log('❌ Primary CDN failed, trying fallback:', error);
                            window.CLIPPY_CDN = CLIPPY_CDN_FALLBACK;

                            clippy.load('Clippy', function (agent) {
                                clippyAgent = agent;
                                clippyLoaded = true;
                                window.clippyAgent = clippyAgent;
                                window.clippyLoaded = clippyLoaded;

                                console.log('📎 Clippy loaded from fallback CDN!');
                                clippyAgent.moveTo(100, 100);
                                clippyAgent.show();
                                clippyAgent.speak("Hi! I'm Clippy from the fallback CDN!");
                                setTimeout(() => clippyAgent.hide(), 8000);
                            }, function (fallbackError) {
                                console.log('❌ Both CDNs failed:', fallbackError);
                                setTimeout(initializeRealClippy, 3000);
                            });
                        });
                    } catch (error) {
                        console.log('❌ Clippy initialization error:', error);
                        setTimeout(initializeRealClippy, 2000);
                    }
                } else {
                    console.log('⏳ Waiting for ClippyJS and jQuery to load...');
                    setTimeout(initializeRealClippy, 1500);
                }
            }

            function summonClippy(message = "Manual summon test!", anim = 'GetAttention') {
                console.log('📎 Manual summon requested');
                if (clippyAgent && clippyLoaded) {
                    if (clippyHideTimeout) clearTimeout(clippyHideTimeout);

                    const x = Math.max(10, Math.min(window.innerWidth - 180, 100));
                    const y = Math.max(10, Math.min(window.innerHeight - 180, 100));

                    clippyAgent.moveTo(x, y);
                    clippyAgent.show();

                    setTimeout(() => {
                        if (anim) clippyAgent.play(anim);
                        if (message) setTimeout(() => clippyAgent.speak(message), 500);
                    }, 200);

                    clippyHideTimeout = setTimeout(() => {
                        clippyAgent.play('GoodBye');
                        setTimeout(() => clippyAgent.hide(), 1200);
                    }, 12000);
                }
            }

            function checkClippyStatus() {
                console.log('📎 CLIPPY STATUS:', {
                    agent: !!clippyAgent,
                    loaded: clippyLoaded,
                    attempts: clippyInitAttempts
                });
            }

            function setupClippyKeyboardShortcuts() {
                document.addEventListener('keydown', function (e) {
                    if (e.altKey && e.shiftKey && e.code === 'KeyC') {
                        e.preventDefault();
                        if (clippyAgent && clippyLoaded) {
                            const animations = ['GetAttention', 'Congratulate', 'Thinking'];
                            const randomAnim = animations[Math.floor(Math.random() * animations.length)];
                            summonClippy("🎯 Secret activated! You found Clippy!", randomAnim);
                        }
                    }
                });
            }

            function setupMobileClippyToggle() {
                const clippyToggleBtn = document.getElementById('clippy-mobile-toggle');
                if (clippyToggleBtn) {
                    clippyToggleBtn.addEventListener('click', () => {
                        if (clippyAgent && clippyLoaded) {
                            summonClippy();
                        }
                    });
                }
            }

            // ==========================================
            // RETRO GAMES MODULE
            // ==========================================
            let downloadCount = parseInt(localStorage.getItem('retroDownloadCount') || '0');

            function initRetroGames() {
                updateDownloadCounter();
                window.downloadGame = downloadGame;
                window.showRetroGameRequest = showRetroGameRequest;
                console.log('Retro games module initialized');
            }

            function downloadGame(gameId) {
                const gameLinks = {
                    'little-fighter-2': 'https://lf2.net/download_lf2_en.html',
                    'airxonix': 'https://www.myabandonware.com/download/mc1f-airxonix',
                    'elastomania': 'https://archive.org/details/elmav10'
                };

                const gameNames = {
                    'little-fighter-2': 'Little Fighter 2',
                    'airxonix': 'Airxonix',
                    'elastomania': 'Elastomania'
                };

                const link = document.createElement('a');
                link.href = gameLinks[gameId];
                link.download = `${gameNames[gameId]}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                downloadCount++;
                localStorage.setItem('retroDownloadCount', downloadCount.toString());
                updateDownloadCounter();
            }

            function showRetroGameRequest() {
                alert('Send your retro game requests to yuval.grimberg@gmail.com!');
            }

            function updateDownloadCounter() {
                const counter = document.getElementById('download-count');
                if (counter) {
                    counter.textContent = downloadCount;
                }
            }

            // ==========================================
            // EASTER EGGS MODULE
            // ==========================================
            function initEasterEggs() {
                const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
                window.konamiSequence = [];

                document.addEventListener('keydown', function (e) {
                    window.konamiSequence.push(e.code);
                    if (window.konamiSequence.length > konamiCode.length) {
                        window.konamiSequence.shift();
                    }

                    if (window.konamiSequence.length === konamiCode.length &&
                        window.konamiSequence.every((code, index) => code === konamiCode[index])) {

                        if (window.clippyAgent && window.clippyLoaded) {
                            window.clippyAgent.moveTo(window.innerWidth / 2 - 100, window.innerHeight / 2 - 100);
                            window.clippyAgent.show();
                            window.clippyAgent.play('Congratulate');
                            window.clippyAgent.speak("🎮 KONAMI CODE ACTIVATED!");
                        }

                        document.body.style.animation = 'rainbow 2s infinite';
                        setTimeout(() => {
                            document.body.style.animation = '';
                        }, 5000);
                        window.konamiSequence = [];
                    }
                });

                const style = document.createElement('style');
                style.textContent = `
                @keyframes rainbow {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(360deg); }
                }
            `;
                document.head.appendChild(style);

                console.log('Easter eggs module initialized');
            }

            // ==========================================
            // INITIALIZE ALL MODULES
            // ==========================================
            initAnimations();
            initNavigation();
            initMobileMenu();
            initContactForm();
            initInteractiveFeatures();
            initClippy();
            initRetroGames();
            initEasterEggs();
            loadGooseAnimation(); // Disabled - no longer loads animation

            console.log('✅ Portfolio System Online: grimgrimberg.github.io fully initialized');
        } catch (error) {
            console.error('❌ Initialization error:', error);
        }
    });
});
