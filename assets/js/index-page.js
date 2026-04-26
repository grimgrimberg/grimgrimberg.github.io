(function () {
    'use strict';

    const CLIPPY_COMMIT = '64a68695451696e6c1062cd9e9c7cfb230389f2c';
    const CLIPPY_ASSET_BASE = `https://cdn.jsdelivr.net/gh/pi0/clippyjs@${CLIPPY_COMMIT}/assets`;
    const CLIPPY_AGENT_BASE = `${CLIPPY_ASSET_BASE}/agents/`;
    const RETRO_STORAGE_KEY = 'retroDownloadCount';
    const COPY_RESET_DELAY_MS = 1600;
    const CLIPPY_WAIT_TIMEOUT_MS = 5000;
    const CLIPPY_WAIT_INTERVAL_MS = 250;
    const MAILTO_DELAY_MS = 100;

    const CLICK_MESSAGES = [
        'Great! You can follow instructions.',
        "Wow, you're persistent. I like that in a teammate.",
        "Still clicking? This is exactly the attention to detail we need.",
        "You're either very dedicated or very bored. Either way, hired!",
        "Ok seriously, you'd fit right into our QA testing team.",
        'At this point you are just stress-testing my button. Respect.',
        'You know what? Let us talk. Email me.',
        'This is getting weird but I admire your commitment.',
        'Are you trying to find the meaning of life? It is 42, by the way.',
        'Congrats. You found the persistence level of a true engineer.'
    ];

    const GOOSE_QUOTES = [
        "Debugging is like being a detective in a crime where you're also the murderer.",
        'There are only 10 types of people: those who understand binary and those who do not.',
        'If it works, do not touch it. If it does not work, blame the hardware.',
        'Code never lies, comments sometimes do, but geese always honk truth.',
        "The best debugging tool is a good night's sleep. The second best is coffee.",
        'Real programmers count from 0. Real geese count backwards from infinity.',
        'Why do programmers prefer dark mode? Because light attracts bugs.',
        'A day without git commits is like a day without sunshine.',
        'In Soviet Russia, code debugs you.',
        "I do not always test my code, but when I do, I do it before production."
    ];

    const CLIPPY_WELCOME_MESSAGES = [
        'It looks like you are browsing an engineering portfolio. Would you like help with that?',
        "Hi. I am the real Clippy. This portfolio is quite impressive, isn't it?",
        "I see you're checking out Yuval's work. Smart choice.",
        'Need help navigating the site? Try pressing Alt+Shift+C.',
        'Pro tip: there are more easter eggs in the Fun Zone.'
    ];

    const CLIPPY_SHORTCUT_MESSAGES = [
        'Secret activated. You found the real Microsoft Office Clippy.',
        "Looking for Yuval's contact info? Scroll down to the contact section.",
        'Want to see the photography work? Open the photography page from the nav.',
        'Pro tip: try clicking the counter button exactly 42 times.',
        'This portfolio is so well-coded that even I could not find a bug.'
    ];

    const CLIPPY_ANIMATIONS = [
        'GetAttention',
        'Congratulate',
        'Thinking',
        'Explain',
        'LookRight',
        'LookLeft',
        'CheckingSomething'
    ];

    const KONAMI_CODE = [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'KeyB',
        'KeyA'
    ];

    let clippyAgent = null;
    let clippyLoaded = false;
    let funClickCount = 0;
    let downloadCount = 0;
    let clippyHideTimer = null;
    let konamiSequence = [];

    function initAos() {
        if (window.AOS && typeof window.AOS.init === 'function') {
            window.AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                mirror: false
            });
        }
    }

    function updateContactStatus(message) {
        const statusEl = document.getElementById('contact-status');
        if (statusEl) {
            statusEl.textContent = message;
        }
    }

    function flashInvalidFields(fields) {
        fields.forEach((field) => field.classList.add('ring-2', 'ring-red-500'));
        window.setTimeout(() => {
            fields.forEach((field) => field.classList.remove('ring-2', 'ring-red-500'));
        }, 1500);
    }

    function buildEmailPreviewText(formData) {
        return [
            'Hi Yuval,',
            '',
            `Name: ${formData.name}`,
            `Email: ${formData.email}`,
            `Subject: ${formData.subject || 'N/A'}`,
            '',
            'Message:',
            formData.message,
            '',
            '---',
            'This message was sent from your portfolio website.',
            '',
            'Best regards,',
            formData.name
        ].join('\n');
    }

    function buildMailtoLink(formData, previewText) {
        const emailSubject = `Portfolio Contact: ${formData.subject || 'General Inquiry'}`;
        return `mailto:yuval.grimberg@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(previewText)}`;
    }

    function fallbackCopyText(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);

        let copied = false;
        try {
            copied = Boolean(document.execCommand && document.execCommand('copy'));
        } catch (error) {
            copied = false;
        }

        document.body.removeChild(textarea);
        return copied;
    }

    async function copyTextToClipboard(text) {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (error) {
                return fallbackCopyText(text);
            }
        }

        return fallbackCopyText(text);
    }

    function bindCopyButton() {
        const copyButton = document.getElementById('copy-email-content');
        const preview = document.getElementById('email-preview');
        if (!copyButton || !preview) {
            return;
        }

        copyButton.addEventListener('click', async () => {
            copyButton.disabled = true;

            const copied = await copyTextToClipboard(preview.textContent || '');
            copyButton.textContent = copied ? 'Copied!' : 'Copy failed - select text above';
            updateContactStatus(
                copied
                    ? 'Message copied to clipboard.'
                    : 'Clipboard access failed. Select the preview text and copy it manually.'
            );

            window.setTimeout(() => {
                copyButton.textContent = 'Copy Message to Clipboard';
                copyButton.disabled = false;
            }, COPY_RESET_DELAY_MS);
        });
    }

    function renderContactSuccess(mailtoLink, previewText) {
        const formContainer = document.getElementById('simple-contact-form');
        if (!formContainer) {
            return;
        }

        formContainer.innerHTML = '';

        const successContainer = document.createElement('div');
        successContainer.className = 'text-center py-8';
        successContainer.id = 'contact-success';
        successContainer.dataset.contactSent = 'true';
        successContainer.innerHTML = `
            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-tech-green to-tech-cyan rounded-full flex items-center justify-center">
                <i class="fas fa-check text-2xl text-white" aria-hidden="true"></i>
            </div>
            <h4 class="text-2xl font-bold text-tech-cyan mb-3">Email Client Opened (or Ready)!</h4>
            <p class="text-gray-300 mb-4">If your default email client did not appear, use the link below or copy the message manually.</p>
            <div class="space-y-4 max-w-xl mx-auto">
                <a id="retry-mailto" class="inline-flex items-center space-x-2 bg-gradient-to-r from-tech-purple to-tech-cyan hover:from-tech-cyan hover:to-tech-purple text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300">
                    <i class="fas fa-envelope" aria-hidden="true"></i><span>Try Opening Email Again</span>
                </a>
                <div class="text-left bg-gray-800/60 border border-gray-700 rounded-lg p-4 overflow-y-auto max-h-56 text-sm font-mono whitespace-pre-wrap break-words" id="email-preview" aria-label="Email preview" tabindex="0"></div>
                <button type="button" id="copy-email-content" class="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">Copy Message to Clipboard</button>
                <a href="index.html#contact" class="text-tech-cyan hover:text-tech-purple text-sm inline-block">Send another message</a>
            </div>
            <div id="contact-status" class="sr-only" aria-live="polite"></div>
        `;

        const retryLink = successContainer.querySelector('#retry-mailto');
        const preview = successContainer.querySelector('#email-preview');

        if (retryLink) {
            retryLink.href = mailtoLink;
        }

        if (preview) {
            preview.textContent = previewText;
        }

        formContainer.appendChild(successContainer);
        updateContactStatus('Email client ready. Use the copy button if your mail app did not open.');
        bindCopyButton();
    }

    function openEmailClient() {
        const nameEl = document.getElementById('contact-name');
        const emailEl = document.getElementById('contact-email');
        const subjectEl = document.getElementById('contact-subject');
        const messageEl = document.getElementById('contact-message');

        if (!nameEl || !emailEl || !subjectEl || !messageEl) {
            return;
        }

        const formData = {
            name: nameEl.value.trim(),
            email: emailEl.value.trim(),
            subject: subjectEl.value.trim(),
            message: messageEl.value.trim()
        };

        const invalidFields = [];
        if (!formData.name) {
            invalidFields.push(nameEl);
        }
        if (!formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
            invalidFields.push(emailEl);
        }
        if (!formData.message) {
            invalidFields.push(messageEl);
        }

        if (invalidFields.length > 0) {
            flashInvalidFields(invalidFields);
            updateContactStatus('Please provide a valid name, email, and message.');
            window.alert('Please provide a valid Name, Email and Message.');
            return;
        }

        const previewText = buildEmailPreviewText(formData);
        const mailtoLink = buildMailtoLink(formData, previewText);

        renderContactSuccess(mailtoLink, previewText);

        window.setTimeout(() => {
            try {
                if (typeof window.__portfolioMailtoHandler === 'function') {
                    window.__portfolioMailtoHandler(mailtoLink);
                    return;
                }

                window.location.assign(mailtoLink);
            } catch (error) {
                console.info('Mailto navigation failed in this environment.');
            }
        }, MAILTO_DELAY_MS);
    }

    function initProjectCardObserver() {
        if (!('IntersectionObserver' in window)) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-fade-in');
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        document.querySelectorAll('.project-card').forEach((card) => observer.observe(card));
    }

    function playAudio(path, volume) {
        try {
            const audio = new Audio(path);
            audio.volume = volume;
            audio.play().catch(() => {
                console.info('Audio playback was blocked by browser policy.');
            });
        } catch (error) {
            console.info('Audio asset failed to load.');
        }
    }

    function playGodDamnSound() {
        playAudio('./assets/sounds/god-dam.mp3', 0.7);
    }

    function playHonkSound() {
        playAudio('./assets/sounds/honk-sound.mp3', 0.6);
    }

    function initFunZone() {
        const clickMeButton = document.getElementById('click-me-button');
        const clickCountDisplay = document.getElementById('click-count');
        const clickMessage = document.getElementById('click-message');
        const gooseTalkButton = document.getElementById('goose-talk');
        const gooseWisdom = document.getElementById('goose-wisdom');

        if (clickMeButton && clickCountDisplay && clickMessage) {
            clickMeButton.addEventListener('click', () => {
                funClickCount += 1;
                clickCountDisplay.textContent = `(${funClickCount})`;

                if (funClickCount <= CLICK_MESSAGES.length) {
                    clickMessage.textContent = CLICK_MESSAGES[funClickCount - 1];
                }

                if (funClickCount === 42) {
                    clickMessage.textContent = 'THE ANSWER TO EVERYTHING! You are definitely engineer material.';
                    clickMeButton.classList.add('animate-bounce');
                }

                if (funClickCount === 69) {
                    playGodDamnSound();
                    clickMessage.textContent = 'Nice. You triggered the legendary god damn sound.';
                    clickMeButton.style.background = 'linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4d96ff, #9c88ff)';
                    clickMeButton.style.animation = 'rainbow 2s infinite';
                } else if (funClickCount % 5 === 0) {
                    clickMeButton.style.background = `linear-gradient(45deg, hsl(${Math.random() * 360}, 70%, 50%), hsl(${Math.random() * 360}, 70%, 50%))`;
                }
            });
        }

        if (gooseTalkButton && gooseWisdom) {
            gooseTalkButton.addEventListener('click', () => {
                playHonkSound();
                const randomQuote = GOOSE_QUOTES[Math.floor(Math.random() * GOOSE_QUOTES.length)];
                gooseWisdom.textContent = `"${randomQuote}"`;
                gooseWisdom.style.animation = 'none';
                window.setTimeout(() => {
                    gooseWisdom.style.animation = 'pulse 1s ease-in-out';
                }, 10);
            });
        }
    }

    function loadScriptOnce(id, src, onLoad) {
        const existing = document.getElementById(id);
        if (existing) {
            if (existing.dataset.loaded === 'true') {
                onLoad();
            } else {
                existing.addEventListener('load', onLoad, { once: true });
            }
            return;
        }

        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.addEventListener(
            'load',
            () => {
                script.dataset.loaded = 'true';
                onLoad();
            },
            { once: true }
        );
        document.head.appendChild(script);
    }

    function initGooseAnimation() {
        const gooseContainer = document.getElementById('goose-fun-zone');
        if (!gooseContainer) {
            return;
        }

        const startAnimation = () => {
            if (!window.lottie || gooseContainer.dataset.lottieReady === 'true') {
                return;
            }

            window.lottie.loadAnimation({
                container: gooseContainer,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: './assets/images/jumpy-goose.json'
            });
            gooseContainer.dataset.lottieReady = 'true';
        };

        if (window.lottie) {
            startAnimation();
            return;
        }

        loadScriptOnce(
            'lottie-player-script',
            'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.9.6/lottie.min.js',
            startAnimation
        );
    }

    function waitForGlobal(name, timeoutMs, intervalMs, onReady, onTimeout) {
        const deadline = Date.now() + timeoutMs;

        function check() {
            if (window[name]) {
                onReady(window[name]);
                return;
            }

            if (Date.now() >= deadline) {
                if (typeof onTimeout === 'function') {
                    onTimeout();
                }
                return;
            }

            window.setTimeout(check, intervalMs);
        }

        check();
    }

    function scheduleClippyHide(delayMs, goodbyeAnimation) {
        if (!clippyAgent || !clippyLoaded) {
            return;
        }

        window.clearTimeout(clippyHideTimer);
        clippyHideTimer = window.setTimeout(() => {
            if (!clippyAgent) {
                return;
            }

            if (goodbyeAnimation) {
                clippyAgent.play(goodbyeAnimation);
                window.setTimeout(() => {
                    clippyAgent.hide();
                }, 1200);
                return;
            }

            clippyAgent.hide();
        }, delayMs);
    }

    function showRealClippyWelcome() {
        if (!clippyAgent || !clippyLoaded) {
            return;
        }

        const x = Math.max(32, Math.random() * (window.innerWidth - 240));
        const y = Math.max(32, Math.random() * (window.innerHeight - 240));
        clippyAgent.moveTo(x, y);
        clippyAgent.show();
        clippyAgent.play('Wave');
        clippyAgent.speak(CLIPPY_WELCOME_MESSAGES[Math.floor(Math.random() * CLIPPY_WELCOME_MESSAGES.length)]);
        scheduleClippyHide(10000, 'Hide');
    }

    function showClippy(message) {
        const clippyElement = document.getElementById('custom-clippy');
        const clippyText = document.getElementById('clippy-text');
        if (!clippyElement || !clippyText) {
            return;
        }

        if (message) {
            clippyText.textContent = message;
        }

        clippyElement.classList.add('show');

        window.setTimeout(() => {
            hideClippy();
        }, 8000);
    }

    function hideClippy() {
        const clippyElement = document.getElementById('custom-clippy');
        if (clippyElement) {
            clippyElement.classList.remove('show');
        }
    }

    function initClippy() {
        window.CLIPPY_CDN = CLIPPY_AGENT_BASE;

        waitForGlobal(
            'clippy',
            CLIPPY_WAIT_TIMEOUT_MS,
            CLIPPY_WAIT_INTERVAL_MS,
            (clippyLibrary) => {
                clippyLibrary.load(
                    'Clippy',
                    (agent) => {
                        clippyAgent = agent;
                        clippyLoaded = true;
                        clippyAgent.hide();

                        if (Math.random() > 0.7) {
                            window.setTimeout(showRealClippyWelcome, 10000);
                        }
                    },
                    undefined,
                    CLIPPY_AGENT_BASE
                );
            },
            () => {
                console.info('ClippyJS did not load in time; fallback assistant remains available.');
            }
        );
    }

    function initKeyboardEasterEggs() {
        document.addEventListener('keydown', (event) => {
            if (event.altKey && event.shiftKey && event.code === 'KeyC') {
                event.preventDefault();

                if (clippyAgent && clippyLoaded) {
                    clippyAgent.moveTo(100, 100);
                    clippyAgent.show();
                    clippyAgent.play(CLIPPY_ANIMATIONS[Math.floor(Math.random() * CLIPPY_ANIMATIONS.length)]);
                    clippyAgent.speak(CLIPPY_SHORTCUT_MESSAGES[Math.floor(Math.random() * CLIPPY_SHORTCUT_MESSAGES.length)]);
                    scheduleClippyHide(12000, 'GoodBye');
                } else {
                    showClippy('Real Clippy is still loading, but the fallback assistant is here.');
                }
            }

            konamiSequence.push(event.code);
            if (konamiSequence.length > KONAMI_CODE.length) {
                konamiSequence.shift();
            }

            const isKonamiMatch =
                konamiSequence.length === KONAMI_CODE.length &&
                konamiSequence.every((code, index) => code === KONAMI_CODE[index]);

            if (!isKonamiMatch) {
                return;
            }

            if (clippyAgent && clippyLoaded) {
                clippyAgent.moveTo(window.innerWidth / 2 - 100, window.innerHeight / 2 - 100);
                clippyAgent.show();
                clippyAgent.play('Congratulate');
                clippyAgent.speak('Konami code activated. Ultimate easter egg unlocked.');
                scheduleClippyHide(8000, 'Hide');
            } else {
                showClippy('Konami code activated. Ultimate easter egg unlocked.');
            }

            document.body.style.animation = 'rainbow 2s infinite';
            window.setTimeout(() => {
                document.body.style.animation = '';
            }, 5000);
            konamiSequence = [];
        });
    }

    function readDownloadCount() {
        try {
            const storedValue = window.localStorage.getItem(RETRO_STORAGE_KEY) || '0';
            return Number.parseInt(storedValue, 10) || 0;
        } catch (error) {
            return 0;
        }
    }

    function writeDownloadCount(value) {
        try {
            window.localStorage.setItem(RETRO_STORAGE_KEY, String(value));
        } catch (error) {
            console.info('Could not persist retro download counter.');
        }
    }

    function updateDownloadCounter() {
        const counter = document.getElementById('download-count');
        if (!counter) {
            return;
        }

        counter.textContent = String(downloadCount);
        if (downloadCount > 0) {
            counter.style.animation = 'pulse 1s ease-in-out';
            window.setTimeout(() => {
                counter.style.animation = '';
            }, 1000);
        }
    }

    function buildModalShell(icon, title, bodyHtml) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-tech-dark border border-gray-600 rounded-2xl p-8 max-w-md mx-4 glass-effect">
                <div class="text-center">
                    <div class="text-4xl mb-4">${icon}</div>
                    <h3 class="text-2xl font-bold text-tech-cyan mb-4">${title}</h3>
                    <div class="text-gray-300 mb-6">${bodyHtml}</div>
                    <div class="space-y-3" data-modal-actions></div>
                </div>
            </div>
        `;

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.remove();
            }
        });

        return modal;
    }

    function appendModalButton(container, label, className, onClick, href) {
        if (href) {
            const link = document.createElement('a');
            link.href = href;
            link.className = className;
            link.textContent = label;
            container.appendChild(link);
            return;
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.textContent = label;
        button.addEventListener('click', onClick);
        container.appendChild(button);
    }

    function showGameDownloadModal(gameName) {
        const modal = buildModalShell(
            'GAME',
            gameName,
            'This classic game is ready for download.<br><br><strong>Note:</strong> provide the final download link in the code if you want to self-host it later.'
        );
        const actions = modal.querySelector('[data-modal-actions]');

        appendModalButton(
            actions,
            'Got It',
            'w-full bg-gradient-to-r from-tech-cyan to-tech-green text-white font-bold py-3 px-6 rounded-lg',
            () => modal.remove()
        );

        const note = document.createElement('div');
        note.className = 'text-xs text-gray-400';
        note.textContent = 'Contact Yuval if you need the original download source.';
        actions.appendChild(note);

        document.body.appendChild(modal);
    }

    function showRetroGameRequest() {
        const modal = buildModalShell(
            'RETRO',
            'Request a Retro Game',
            "Have a favorite 90s game you'd like to see here?<br><br>Send an email request."
        );
        const actions = modal.querySelector('[data-modal-actions]');

        appendModalButton(
            actions,
            'Send Request',
            'block w-full bg-gradient-to-r from-tech-purple to-tech-pink text-white font-bold py-3 px-6 rounded-lg text-center',
            null,
            'mailto:yuval.grimberg@gmail.com?subject=Retro Game Request&body=Hi Yuval! I would love to see this game in your retro collection: '
        );

        appendModalButton(
            actions,
            'Maybe Later',
            'w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg',
            () => modal.remove()
        );

        document.body.appendChild(modal);
    }

    function downloadGame(gameId) {
        const gameLinks = {
            'little-fighter-2': 'https://lf2.net/download_lf2_en.html',
            airxonix: 'https://www.myabandonware.com/download/mc1f-airxonix',
            elastomania: 'https://archive.org/details/elmav10'
        };

        const gameNames = {
            'little-fighter-2': 'Little Fighter 2',
            airxonix: 'Airxonix',
            elastomania: 'Elastomania'
        };

        if (!gameLinks[gameId] || !gameNames[gameId]) {
            return;
        }

        const link = document.createElement('a');
        link.href = gameLinks[gameId];
        link.rel = 'noopener noreferrer';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        downloadCount += 1;
        writeDownloadCount(downloadCount);
        updateDownloadCounter();

        if (clippyAgent && clippyLoaded) {
            clippyAgent.moveTo(200, 300);
            clippyAgent.show();
            clippyAgent.play('Congratulate');
            clippyAgent.speak(`Excellent choice. ${gameNames[gameId]} is opening now.`);
            scheduleClippyHide(8000, 'Hide');
            return;
        }

        showGameDownloadModal(gameNames[gameId]);
    }

    function injectRainbowKeyframes() {
        if (document.getElementById('phase-two-rainbow-style')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'phase-two-rainbow-style';
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                25% { filter: hue-rotate(90deg); }
                50% { filter: hue-rotate(180deg); }
                75% { filter: hue-rotate(270deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    function initPage() {
        initAos();
        initProjectCardObserver();
        initFunZone();
        initGooseAnimation();
        initClippy();
        initKeyboardEasterEggs();
        injectRainbowKeyframes();

        downloadCount = readDownloadCount();
        updateDownloadCounter();
    }

    window.openEmailClient = openEmailClient;
    window.downloadGame = downloadGame;
    window.showRetroGameRequest = showRetroGameRequest;
    window.showClippy = showClippy;
    window.hideClippy = hideClippy;

    document.addEventListener('DOMContentLoaded', initPage);
})();
