(function () {
    'use strict';

    const RETRO_STORAGE_KEY = 'retroSourceOpenCount';
    const COPY_RESET_DELAY_MS = 1600;
    const MAILTO_DELAY_MS = 100;
    const EMAIL_ADDRESS = 'yuval.grimberg@gmail.com';
    const CV_PUBLIC_PATH = ['cv', 'html'].join('.');
    const REPO_SNAPSHOT_URL = './assets/data/github-repos.json';
    const CLIPPY_AGENT_BASE_PATH = './assets/vendor/clippyjs/agents/';

    const FALLBACK_REPO_SNAPSHOT = {
        categories: {
            featured: { label: 'Featured' },
            lab: { label: 'Lab' },
            tools: { label: 'Tools' },
            learning: { label: 'Learning Archive' },
            forks: { label: 'Forks / References' },
            meta: { label: 'Meta' }
        },
        repos: [
            {
                name: 'BGR_PathPlanning_Control',
                category: 'featured',
                url: 'https://github.com/grimgrimberg/BGR_PathPlanning_Control',
                language: 'Python',
                tags: ['autonomy', 'path planning', 'control'],
                pitch: 'Formula Student autonomous racing path planning and control stack.'
            },
            {
                name: 'orbital-rendezvous-lqi',
                category: 'featured',
                url: 'https://github.com/grimgrimberg/orbital-rendezvous-lqi',
                language: 'Python',
                tags: ['orbital mechanics', 'LQI', 'MPC'],
                pitch: 'Orbital propagator plus CW rendezvous LQI and MPC comparison.'
            },
            {
                name: 'github-repo-summarizer',
                category: 'featured',
                url: 'https://github.com/grimgrimberg/github-repo-summarizer',
                language: 'Python',
                tags: ['FastAPI', 'LLM', 'tooling'],
                pitch: 'FastAPI and CLI repo summarizer with deterministic packing.'
            },
            {
                name: 'daily-movers-agent',
                category: 'featured',
                url: 'https://github.com/grimgrimberg/daily-movers-agent',
                language: 'Python',
                tags: ['LangGraph', 'reports', 'agentic AI'],
                pitch: 'Agentic market-movers pipeline with explainable digests.'
            }
        ]
    };

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

    const ROLE_FITS = {
        robotics: {
            title: 'Robotics Systems Developer',
            summary:
                'I connect controls, perception, code, and physical constraints without pretending robots live in clean PowerPoint rectangles.',
            proof: 'BGR driverless stack',
            tools: 'Python, ROS2, OpenCV',
            mode: 'Build, test, iterate',
            bullets: [
                'Led path planning and control work for a real Formula Student driverless effort.',
                'Comfortable translating messy system behavior into debuggable software loops.',
                'Useful when the job needs range, not a one-trick framework certificate.'
            ]
        },
        autonomy: {
            title: 'Autonomy / Controls Engineer',
            summary:
                'Strong fit for path planning, control loops, estimation-adjacent work, and teams that need engineering judgment when the demo meets reality.',
            proof: 'Path planning + LQI',
            tools: 'Control, dynamics, Python',
            mode: 'Model, simulate, validate',
            bullets: [
                'Formula Student work shows practical autonomy under vehicle constraints.',
                'Orbital rendezvous work shows comfort with state-space thinking and controller comparison.',
                'I like systems that can be explained, plotted, and debugged under pressure.'
            ]
        },
        simulation: {
            title: 'Simulation / GNC Developer',
            summary:
                'I can build the simulation scaffolding around a control idea, then keep it inspectable enough that other humans can trust it.',
            proof: 'Orbital rendezvous LQI',
            tools: 'SciPy, MATLAB, plotting',
            mode: 'Reproduce, compare, explain',
            bullets: [
                'Built orbital propagation and rendezvous-control experiments with reproducible plots.',
                'Comfortable moving between equations, code, and visual inspection.',
                'Good fit for simulation work where correctness and communication both matter.'
            ]
        },
        ai: {
            title: 'AI Tooling / Developer Tools',
            summary:
                'I build small systems that turn noisy inputs into useful outputs: repo summaries, agentic reports, fallbacks, and boring-but-important glue.',
            proof: 'Repo summarizer + agents',
            tools: 'FastAPI, LangGraph, testing',
            mode: 'Ship useful tools',
            bullets: [
                'GitHub repo summarizer shows product-shaped AI tooling, not just prompt confetti.',
                'Daily movers agent shows multi-step pipeline thinking with outputs and fallbacks.',
                'I care about deterministic structure, testability, and making tools usable by people.'
            ]
        }
    };

    const FAKE_REVIEWS = [
        'Ray Charles: Holy sh*t, this is the best engineering portfolio I have ever heard. Spiritual endorsement.',
        "Stephen Hawking: It made me walk again. Well, not literally - I'm still dead. Interdimensional consultation.",
        "Elon Musk: Damn, I wish I had hired Yuval for Tesla autopilot. We probably wouldn't have crashed into all those traffic cones.",
        "Albert Einstein: E=mc² was cute, but Yuval's control algorithms? That is the real theory of everything.",
        'Doctor Strange: I saw 14,000,605 possible futures. In ALL of them, Yuval gets the job.'
    ];

    const ROAST_LINES = [
        'Roast mode is opt-in, so here it is: some repos are polished, some are learning fossils, and one or two look like they escaped a lab notebook. Still useful. Still honest.',
        'Yuval has range. This is a strength until you ask him to name the one thing he does. Then the spreadsheet starts sweating.',
        'The portfolio has a goose, a terminal, and a CV request flow. Subtle? No. Memorable? Unfortunately, yes.',
        'He says "systems thinking" because "I keep pulling on threads until the machine confesses" sounds less LinkedIn-compliant.'
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

    let funClickCount = 0;
    let sourceOpenCount = 0;
    let konamiSequence = [];
    let repoSnapshot = FALLBACK_REPO_SNAPSHOT;
    let commandHistory = [];
    let realClippyAgent = null;
    let realClippyLoaded = false;
    let realClippyLoadStarted = false;
    let realClippyHideTimer = null;

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
        return `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(previewText)}`;
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

    async function copyEmailAddress(button) {
        const copied = await copyTextToClipboard(EMAIL_ADDRESS);
        const status = document.getElementById('copy-email-status');
        const originalHtml = button?.innerHTML;

        if (status) {
            status.textContent = copied ? 'Email copied. Now go make something happen.' : `Copy failed. Email: ${EMAIL_ADDRESS}`;
        }

        if (button) {
            button.innerHTML = copied ? '<span>Copied Email</span>' : `<span>${EMAIL_ADDRESS}</span>`;
            window.setTimeout(() => {
                button.innerHTML = originalHtml || 'Copy Email Address';
            }, COPY_RESET_DELAY_MS);
        }

        return copied;
    }

    function setCvGateStatus(message, isError = false) {
        const status = document.getElementById('cv-gate-status');
        if (!status) {
            return;
        }

        status.textContent = message;
        status.classList.toggle('text-tech-pink', isError);
        status.classList.toggle('text-tech-green', !isError);
    }

    function revealPublicCv(announce = true) {
        const panel = document.getElementById('cv-unlocked-panel');
        const publicLink = document.getElementById('cv-public-link');

        if (publicLink) {
            publicLink.href = CV_PUBLIC_PATH;
        }

        if (panel) {
            panel.hidden = false;
        }

        try {
            window.sessionStorage.setItem('portfolioCvUnlocked', 'true');
        } catch (error) {
            // Session persistence is a convenience only.
        }

        setCvGateStatus('Human enough. Public CV unlocked.');
        if (announce) {
            showClippy('CV unlocked. Public version, no phone-number buffet for scrapers. Responsible chaos.', 18000);
        }
    }

    function initCvGate() {
        const answerInput = document.getElementById('cv-human-answer');
        const unlockButton = document.getElementById('cv-unlock-button');

        if (!answerInput || !unlockButton) {
            return;
        }

        try {
            if (window.sessionStorage.getItem('portfolioCvUnlocked') === 'true') {
                revealPublicCv(false);
            }
        } catch (error) {
            // Ignore storage failures and keep the gate interactive.
        }

        const verify = () => {
            const answer = answerInput.value.trim();
            if (answer === '13' || answer.toLowerCase() === 'thirteen') {
                revealPublicCv();
                return;
            }

            setCvGateStatus('Not quite. Hint: Clippy counted on his wire and got 13.', true);
            answerInput.focus();
        };

        unlockButton.addEventListener('click', verify);
        answerInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                verify();
            }
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
                    <span class="text-2xl text-white" aria-hidden="true">✓</span>
            </div>
            <h4 class="text-2xl font-bold text-tech-cyan mb-3">Email Client Opened (or Ready)!</h4>
            <p class="text-gray-300 mb-4">If your default email client did not appear, use the link below or copy the message manually.</p>
            <div class="space-y-4 max-w-xl mx-auto">
                <a id="retry-mailto" class="inline-flex items-center space-x-2 bg-gradient-to-r from-tech-purple to-tech-cyan hover:from-tech-cyan hover:to-tech-purple text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300">
                    <span aria-hidden="true">✉</span><span>Try Opening Email Again</span>
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

    function renderGooseFallback(gooseContainer) {
        const fallbackImage = document.createElement('img');
        fallbackImage.src = './assets/images/goose.png';
        fallbackImage.alt = 'Small goose mascot';
        fallbackImage.loading = 'lazy';
        fallbackImage.decoding = 'async';
        fallbackImage.className = 'goose-frame-fallback';
        gooseContainer.replaceChildren(fallbackImage);
        gooseContainer.dataset.gooseReady = 'fallback';
    }

    async function initGooseAnimation() {
        const gooseContainer = document.getElementById('goose-fun-zone');
        if (!gooseContainer || gooseContainer.dataset.gooseReady) {
            return;
        }

        gooseContainer.dataset.gooseReady = 'loading';

        try {
            const response = await fetch('./assets/images/jumpy-goose.json', { cache: 'force-cache' });
            if (!response.ok) {
                throw new Error(`Goose animation failed to load: ${response.status}`);
            }

            const animationData = await response.json();
            const frames = (animationData.assets || [])
                .filter((asset) => typeof asset.p === 'string' && asset.p.startsWith('data:image/'))
                .sort((left, right) => Number(left.id) - Number(right.id))
                .map((asset) => asset.p);

            if (!frames.length) {
                throw new Error('Goose animation does not include embedded image frames.');
            }

            const gooseImage = document.createElement('img');
            gooseImage.src = frames[0];
            gooseImage.alt = 'Animated goose mascot';
            gooseImage.loading = 'lazy';
            gooseImage.decoding = 'async';
            gooseImage.className = 'goose-frame-player';
            gooseImage.dataset.gooseFramePlayer = 'true';
            gooseImage.dataset.gooseFrame = '0';
            gooseContainer.replaceChildren(gooseImage);
            gooseContainer.dataset.gooseReady = 'true';
            gooseContainer.dataset.gooseFrameCount = String(frames.length);

            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (reducedMotion || frames.length === 1) {
                return;
            }

            const frameMs = Math.max(34, 1000 / Number(animationData.fr || 24));
            let frameIndex = 0;
            let lastFrameTime = window.performance.now();

            const playNextFrame = (timestamp) => {
                if (!document.body.contains(gooseImage)) {
                    return;
                }

                if (timestamp - lastFrameTime >= frameMs) {
                    frameIndex = (frameIndex + 1) % frames.length;
                    gooseImage.src = frames[frameIndex];
                    gooseImage.dataset.gooseFrame = String(frameIndex);
                    lastFrameTime = timestamp;
                }

                window.requestAnimationFrame(playNextFrame);
            };

            window.requestAnimationFrame(playNextFrame);
        } catch {
            renderGooseFallback(gooseContainer);
        }
    }

    function updateRealClippyGlobals() {
        window.clippyAgent = realClippyAgent;
        window.clippyLoaded = realClippyLoaded;
    }

    function hideFallbackClippy() {
        const clippyElement = document.getElementById('custom-clippy');
        if (clippyElement) {
            if (clippyElement.dataset.hideTimer) {
                window.clearTimeout(Number(clippyElement.dataset.hideTimer));
                delete clippyElement.dataset.hideTimer;
            }
            clippyElement.classList.remove('show');
        }
    }

    function showFallbackClippy(message, durationMs = 12000) {
        const clippyElement = document.getElementById('custom-clippy');
        const clippyText = document.getElementById('clippy-text');
        if (!clippyElement || !clippyText) {
            return;
        }

        if (message) {
            clippyText.textContent = message;
        }

        clippyElement.classList.add('show');

        if (clippyElement.dataset.hideTimer) {
            window.clearTimeout(Number(clippyElement.dataset.hideTimer));
            delete clippyElement.dataset.hideTimer;
        }

        if (durationMs <= 0) {
            return;
        }

        const timerId = window.setTimeout(() => {
            hideClippy();
        }, durationMs);
        clippyElement.dataset.hideTimer = String(timerId);
    }

    function initRealClippy() {
        if (realClippyLoadStarted) {
            return;
        }

        realClippyLoadStarted = true;
        updateRealClippyGlobals();

        if (!window.clippy || typeof window.clippy.load !== 'function' || !window.jQuery) {
            return;
        }

        window.clippy.BASE_PATH = CLIPPY_AGENT_BASE_PATH;

        try {
            window.clippy.load(
                'Clippy',
                (agent) => {
                    realClippyAgent = agent;
                    realClippyLoaded = true;
                    updateRealClippyGlobals();
                    allowRealClippySoundAfterGesture(realClippyAgent);
                    realClippyAgent.hide(true);
                    resetRealClippyQueue(realClippyAgent);
                    window.dispatchEvent(new CustomEvent('portfolio:clippy-ready'));
                },
                () => {
                    realClippyLoaded = false;
                    updateRealClippyGlobals();
                }
            );
        } catch {
            realClippyLoaded = false;
            updateRealClippyGlobals();
        }
    }

    function selectClippyAnimation(preferredAnimation) {
        if (!realClippyAgent || !preferredAnimation) {
            return null;
        }

        if (typeof realClippyAgent.hasAnimation === 'function' && realClippyAgent.hasAnimation(preferredAnimation)) {
            return preferredAnimation;
        }

        return null;
    }

    function allowRealClippySoundAfterGesture(agent) {
        const animator = agent?._animator;
        if (!animator || typeof animator._playSound !== 'function' || animator._portfolioSoundGuarded) {
            return;
        }

        let userGestureSeen = false;
        const originalPlaySound = animator._playSound.bind(animator);
        const markGesture = () => {
            userGestureSeen = true;
            document.removeEventListener('pointerdown', markGesture, true);
            document.removeEventListener('keydown', markGesture, true);
        };

        document.addEventListener('pointerdown', markGesture, { once: true, capture: true });
        document.addEventListener('keydown', markGesture, { once: true, capture: true });

        animator._playSound = function guardedPlaySound() {
            if (!userGestureSeen) {
                return;
            }

            try {
                originalPlaySound();
            } catch {
                // Browser audio policies vary. Clippy visuals and speech bubbles still matter most.
            }
        };
        animator._portfolioSoundGuarded = true;
    }

    function resetRealClippySpeech(agent) {
        const balloon = agent?._balloon;
        if (!balloon) {
            return;
        }

        if (balloon._loop) {
            window.clearTimeout(balloon._loop);
        }

        if (balloon._hiding) {
            window.clearTimeout(balloon._hiding);
        }

        balloon._active = false;
        balloon._hold = false;
        balloon._hiding = null;
        balloon._addWord = null;

        if (typeof agent.closeBalloon === 'function') {
            agent.closeBalloon();
        }
    }

    function resetRealClippyQueue(agent) {
        const queue = agent?._queue;
        if (!queue) {
            return;
        }

        queue._queue = [];
        queue._active = false;
    }

    function summonRealClippy(message, animation = 'GetAttention', durationMs = 12000) {
        if (!realClippyAgent || !realClippyLoaded) {
            return false;
        }

        try {
            hideFallbackClippy();

            if (realClippyHideTimer) {
                window.clearTimeout(realClippyHideTimer);
                realClippyHideTimer = null;
            }

            if (typeof realClippyAgent.stop === 'function') {
                realClippyAgent.stop();
            }
            resetRealClippyQueue(realClippyAgent);
            resetRealClippySpeech(realClippyAgent);

            const left = Math.max(16, Math.min(window.innerWidth - 150, window.innerWidth - 180));
            const top = Math.max(76, Math.min(window.innerHeight - 180, window.innerHeight - 240));
            realClippyAgent.moveTo(left, top);
            realClippyAgent.show(true);

            const selectedAnimation = selectClippyAnimation(animation);
            if (selectedAnimation) {
                realClippyAgent.play(selectedAnimation);
            }

            if (message) {
                window.setTimeout(() => {
                    if (realClippyAgent && realClippyLoaded) {
                        realClippyAgent.speak(message);
                    }
                }, selectedAnimation ? 450 : 120);
            }

            if (durationMs > 0) {
                realClippyHideTimer = window.setTimeout(() => {
                    if (!realClippyAgent || !realClippyLoaded) {
                        return;
                    }

                    const goodbye = selectClippyAnimation('GoodBye');
                    if (goodbye) {
                        realClippyAgent.play(goodbye);
                        window.setTimeout(() => {
                            realClippyAgent?.hide(true);
                            resetRealClippyQueue(realClippyAgent);
                        }, 1200);
                    } else {
                        realClippyAgent.hide(true);
                        resetRealClippyQueue(realClippyAgent);
                    }
                }, durationMs);
            }

            return true;
        } catch {
            return false;
        }
    }

    function showClippy(message, durationMs = 12000) {
        if (summonRealClippy(message, 'GetAttention', durationMs)) {
            return;
        }

        showFallbackClippy(message, durationMs);
    }

    function showClippyIntro() {
        showClippy(
            'Hey there! Looking to hire an awesome engineer? Ask me for projects, CV, contact, reviews, or the goose.',
            18000
        );
    }

    function pinClippyGuide(message) {
        if (summonRealClippy(message, 'Explain', 0)) {
            return;
        }

        showFallbackClippy(message, 0);
    }

    function hideClippy() {
        if (realClippyHideTimer) {
            window.clearTimeout(realClippyHideTimer);
            realClippyHideTimer = null;
        }

        if (realClippyAgent && realClippyLoaded) {
            realClippyAgent.hide(true);
            resetRealClippyQueue(realClippyAgent);
        }

        hideFallbackClippy();
    }

    function scheduleClippyIntro() {
        let introShown = false;

        const showIntroOnce = () => {
            if (introShown) {
                return;
            }

            const clippyElement = document.getElementById('custom-clippy');
            if (clippyElement?.classList.contains('show') || document.querySelector('.clippy-balloon:not([style*="display: none"])')) {
                return;
            }

            introShown = true;
            showClippyIntro();
        };

        if (realClippyLoaded) {
            window.setTimeout(showIntroOnce, 650);
            return;
        }

        window.addEventListener(
            'portfolio:clippy-ready',
            () => {
                window.setTimeout(showIntroOnce, 650);
            },
            { once: true }
        );

        window.setTimeout(() => {
            if (!realClippyLoaded) {
                showIntroOnce();
            }
        }, 4500);
    }

    function initKeyboardEasterEggs() {
        document.addEventListener('keydown', (event) => {
            if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
                const activeElement = document.activeElement;
                const isTyping =
                    activeElement &&
                    ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName);

                if (!isTyping) {
                    event.preventDefault();
                    openCommandPalette('help');
                    return;
                }
            }

            if (event.key === 'Escape') {
                closeCommandPalette();
            }

            if (event.altKey && event.shiftKey && event.code === 'KeyC') {
                event.preventDefault();
                showClippy('Old-school Clippy activated. No third-party script, no clipboard drama, just one paperclip doing its job.', 18000);
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

            showClippy('Konami code activated. Ultimate easter egg unlocked.', 18000);

            document.body.style.animation = 'rainbow 2s infinite';
            window.setTimeout(() => {
                document.body.style.animation = '';
            }, 5000);
            konamiSequence = [];
        });
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getRepoCategory(categoryKey) {
        return repoSnapshot.categories?.[categoryKey]?.label || categoryKey;
    }

    function getOrderedCategories() {
        return ['featured', 'lab', 'tools', 'learning', 'forks', 'meta'];
    }

    function repoMatches(repo, term) {
        const normalized = term.toLowerCase();
        const aliases = {
            bgr: 'BGR_PathPlanning_Control',
            racing: 'BGR_PathPlanning_Control',
            orbital: 'orbital-rendezvous-lqi',
            orbit: 'orbital-rendezvous-lqi',
            lqi: 'orbital-rendezvous-lqi',
            summarizer: 'github-repo-summarizer',
            github: 'github-repo-summarizer',
            movers: 'daily-movers-agent',
            daily: 'daily-movers-agent',
            gnc: 'gnc-tracking-intercept-sim',
            jetpack: 'jetpack_joyride_rl',
            goose: 'grimgrimberg.github.io'
        };
        const aliasTarget = aliases[normalized];

        return (
            repo.name.toLowerCase() === normalized ||
            repo.name.toLowerCase().includes(normalized) ||
            (aliasTarget && repo.name === aliasTarget) ||
            repo.tags?.some((tag) => tag.toLowerCase().includes(normalized))
        );
    }

    function findRepo(term) {
        if (!term) {
            return null;
        }

        return repoSnapshot.repos.find((repo) => repoMatches(repo, term));
    }

    function formatRepoLine(repo) {
        const tags = repo.tags?.length ? ` | ${repo.tags.slice(0, 3).join(', ')}` : '';
        return `<a href="${escapeHtml(repo.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.name)}</a> <span class="text-gray-500">(${escapeHtml(repo.language || 'mixed')}${escapeHtml(tags)})</span>\n  ${escapeHtml(repo.pitch)}`;
    }

    function formatRepoGroup(categoryKey, repos) {
        if (!repos.length) {
            return '';
        }

        return `<strong>${escapeHtml(getRepoCategory(categoryKey))}</strong>\n${repos.map(formatRepoLine).join('\n\n')}`;
    }

    function formatRepos(categoryFilter) {
        const categoryAliases = {
            '--featured': 'featured',
            featured: 'featured',
            '--labs': 'lab',
            '--lab': 'lab',
            labs: 'lab',
            lab: 'lab',
            '--tools': 'tools',
            tools: 'tools',
            '--learning': 'learning',
            learning: 'learning',
            '--forks': 'forks',
            forks: 'forks',
            '--meta': 'meta',
            meta: 'meta'
        };
        const selectedCategory = categoryAliases[categoryFilter];

        if (selectedCategory) {
            const repos = repoSnapshot.repos.filter((repo) => repo.category === selectedCategory);
            return formatRepoGroup(selectedCategory, repos) || `No repos found for ${escapeHtml(selectedCategory)}.`;
        }

        return getOrderedCategories()
            .map((categoryKey) =>
                formatRepoGroup(
                    categoryKey,
                    repoSnapshot.repos.filter((repo) => repo.category === categoryKey)
                )
            )
            .filter(Boolean)
            .join('\n\n');
    }

    function formatRepoDetail(repo) {
        if (!repo) {
            return 'I could not find that repo in the local snapshot. Try `repos` or `repos --featured`.';
        }

        return `<strong>${escapeHtml(repo.name)}</strong>
Category: ${escapeHtml(getRepoCategory(repo.category))}
Language: ${escapeHtml(repo.language || 'mixed')}
Tags: ${escapeHtml(repo.tags?.join(', ') || 'not tagged')}
Why it matters: ${escapeHtml(repo.pitch)}
Open: <a href="${escapeHtml(repo.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.url)}</a>`;
    }

    function scrollToSection(sectionId) {
        const target = document.getElementById(sectionId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function getRoleFit(roleKey) {
        return ROLE_FITS[roleKey] || ROLE_FITS.robotics;
    }

    function formatHireRole(roleKey) {
        const role = getRoleFit(roleKey);
        return `<strong>${escapeHtml(role.title)}</strong>
${escapeHtml(role.summary)}

Proof: ${escapeHtml(role.proof)}
Tools: ${escapeHtml(role.tools)}
Mode: ${escapeHtml(role.mode)}

${role.bullets.map((bullet) => `- ${escapeHtml(bullet)}`).join('\n')}`;
    }

    function setHireRole(roleKey) {
        const role = getRoleFit(roleKey);
        const title = document.getElementById('hire-role-title');
        const summary = document.getElementById('hire-role-summary');
        const proof = document.getElementById('hire-role-proof');
        const tools = document.getElementById('hire-role-tools');
        const mode = document.getElementById('hire-role-mode');
        const bullets = document.getElementById('hire-role-bullets');

        if (title) title.textContent = role.title;
        if (summary) summary.textContent = role.summary;
        if (proof) proof.textContent = role.proof;
        if (tools) tools.textContent = role.tools;
        if (mode) mode.textContent = role.mode;
        if (bullets) {
            bullets.replaceChildren(
                ...role.bullets.map((bullet) => {
                    const item = document.createElement('li');
                    item.textContent = bullet;
                    return item;
                })
            );
        }

        document.querySelectorAll('[data-hire-role]').forEach((button) => {
            const isActive = button.getAttribute('data-hire-role') === roleKey;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        document.querySelectorAll('[data-command-run^="hire "]').forEach((button) => {
            if (button.classList.contains('hire-command-button')) {
                button.setAttribute('data-command-run', `hire ${roleKey}`);
            }
        });
    }

    function initHireCommandCenter() {
        document.querySelectorAll('[data-hire-role]').forEach((button) => {
            button.addEventListener('click', () => {
                setHireRole(button.getAttribute('data-hire-role') || 'robotics');
            });
        });
    }

    function showClippyGuide(message) {
        const guideMessage =
            message ||
            'Old Clippy reporting for duty. I can route you to hire fit, projects, repos, CV, contact, reviews, or the goose.';

        pinClippyGuide(guideMessage);
    }

    function getCommandResponse(rawCommand) {
        const command = rawCommand.trim();
        const normalized = command.toLowerCase();
        const [verb, ...args] = normalized.split(/\s+/).filter(Boolean);

        if (!command || verb === 'help') {
            return `<strong>Commands</strong>
help              show this list
hire robotics     show role-fit packet
hire autonomy     match projects to autonomy roles
hire simulation   match projects to simulation/GNC roles
hire ai           match projects to AI/tooling roles
projects          jump to featured work
repos             show categorized GitHub snapshot
repos --featured  show the strongest hiring proof
repos --labs      show experiments and sharp edges
repo orbital      inspect one repo
compare bgr lqi   compare two repos
score repos       show category logic without public numbers
reviews           epic fictional reviews
roast yuval       opt-in roast mode
skills            jump to skills
contact / hire    email, LinkedIn, GitHub, CV gate
cv                jump to human-checked public CV
goose / honk      controlled chaos, explicit click only
clippy            summon the guide
honest            mildly spicy truth
clear             clear the terminal`;
        }

        if (verb === 'clear') {
            return '__CLEAR__';
        }

        if (verb === 'projects') {
            scrollToSection('projects');
            return 'Jumping to featured projects. The short version: BGR, orbital LQI, repo summarizer, daily movers agent.';
        }

        if (verb === 'hire' && args.length > 0) {
            const roleAlias = {
                robotics: 'robotics',
                robot: 'robotics',
                autonomy: 'autonomy',
                control: 'autonomy',
                controls: 'autonomy',
                simulation: 'simulation',
                sim: 'simulation',
                gnc: 'simulation',
                ai: 'ai',
                tooling: 'ai',
                tools: 'ai'
            };
            const roleKey = roleAlias[args[0]] || 'robotics';
            scrollToSection('hire');
            setHireRole(roleKey);
            return formatHireRole(roleKey);
        }

        if (verb === 'fit' || verb === 'proof') {
            scrollToSection('hire');
            return `${formatHireRole('robotics')}

Try \`hire autonomy\`, \`hire simulation\`, or \`hire ai\` for a narrower fit.`;
        }

        if (verb === 'skills') {
            scrollToSection('skills');
            return 'Jumping to skills. Control, autonomy, Python, AI tooling, and a stubborn respect for edge cases.';
        }

        if (verb === 'about') {
            scrollToSection('about');
            return 'Jumping to the human-readable background. No résumé fog machine required.';
        }

        if (verb === 'contact' || verb === 'hire') {
            scrollToSection('contact');
            return `<strong>Contact</strong>
Email: <a href="mailto:${EMAIL_ADDRESS}">${EMAIL_ADDRESS}</a>
LinkedIn: <a href="https://www.linkedin.com/in/yuval-grimberg-933215173" target="_blank" rel="noopener noreferrer">linkedin.com/in/yuval-grimberg-933215173</a>
GitHub: <a href="https://github.com/grimgrimberg" target="_blank" rel="noopener noreferrer">github.com/grimgrimberg</a>
CV: public version unlocks after a tiny human check; full-detail PDF can still be requested by email.

The form below builds an email draft. If your mail app refuses to cooperate, copy buttons are waiting like adults.`;
        }

        if (verb === 'cv' || verb === 'resume') {
            scrollToSection('contact');
            return `CV: jump to Contact and pass the tiny human check to reveal the public CV.

The public CV is intentionally scrubbed of phone/private contact details. Static GitHub Pages cannot provide real access control, so this is anti-scraper friction, not a bank vault.`;
        }

        if (verb === 'github') {
            return `<a href="https://github.com/grimgrimberg" target="_blank" rel="noopener noreferrer">github.com/grimgrimberg</a>`;
        }

        if (verb === 'linkedin') {
            return `<a href="https://www.linkedin.com/in/yuval-grimberg-933215173" target="_blank" rel="noopener noreferrer">LinkedIn profile</a>`;
        }

        if (verb === 'repos') {
            return formatRepos(args[0]);
        }

        if (verb === 'repo') {
            return formatRepoDetail(findRepo(args.join(' ')));
        }

        if (verb === 'compare') {
            const left = findRepo(args[0] || 'bgr');
            const right = findRepo(args[1] || 'orbital');

            return `<strong>Comparison</strong>

${formatRepoDetail(left)}

---

${formatRepoDetail(right)}

Verdict: compare scope, not ego. Featured repos show finish; Lab repos show appetite. Both matter, but hiring pages should lead with finish.`;
        }

        if (verb === 'score' && args[0] === 'repos') {
            return `<strong>Repo categories, no public numbers</strong>
Featured: strongest hiring proof, original work, inspectable scope.
Lab: promising systems that still need polish.
Tools: developer or AI utilities with product shape.
Learning Archive: older coursework and experiments.
Forks / References: useful context, not claimed as original work.

The numeric scoring stays private because turning yourself into a scoreboard is how LinkedIn wins.`;
        }

        if (verb === 'reviews' || verb === 'references') {
            scrollToSection('reviews');
            return `<strong>Epic reviews</strong>
${FAKE_REVIEWS.map((review) => `- ${escapeHtml(review)}`).join('\n')}`;
        }

        if (verb === 'roast') {
            const target = args.join(' ') || 'yuval';
            const roast = ROAST_LINES[Math.floor(Math.random() * ROAST_LINES.length)];
            scrollToSection('reviews');
            showClippy(`Roast mode accepted. ${roast}`, 18000);
            return `<strong>Roast mode: ${escapeHtml(target)}</strong>
${escapeHtml(roast)}

This is opt-in. Public surface remains hireable. The terminal is where the eyebrows happen.`;
        }

        if (verb === 'goose') {
            const quote = GOOSE_QUOTES[Math.floor(Math.random() * GOOSE_QUOTES.length)];
            const wisdom = document.getElementById('goose-wisdom');
            if (wisdom) {
                wisdom.textContent = `"${quote}"`;
            }
            return `Goose says: "${escapeHtml(quote)}"`;
        }

        if (verb === 'honk') {
            playHonkSound();
            return 'Honk delivered. Explicit user action, legally and emotionally clean.';
        }

        if (verb === 'clippy') {
            showClippyGuide();
            return 'Clippy summoned and pinned. Helpful first, spicy sidekick second.';
        }

        if (verb === 'honest') {
            return `Honest mode:
Yuval is strongest where systems thinking, control, Python, and stubborn curiosity overlap.
Some repos are polished. Some are labs. Some are old learning fossils.
The flex is not perfection. The flex is range, follow-through, and enough taste to know what deserves the main stage.`;
        }

        if (verb === 'joke') {
            return 'A control engineer walks into a bar, overshoots, corrects, oscillates twice, and finally settles near the counter.';
        }

        return `Unknown command: ${escapeHtml(command)}\nTry \`help\`, \`repos\`, \`projects\`, \`contact\`, or \`goose\`.`;
    }

    function appendCommandOutput(command, responseHtml) {
        const output = document.getElementById('command-output');
        if (!output) {
            return;
        }

        if (responseHtml === '__CLEAR__') {
            output.innerHTML = '';
            return;
        }

        const entry = document.createElement('div');
        entry.className = 'command-line';
        entry.innerHTML = `
            <div class="command-input-line">&gt; ${escapeHtml(command || 'help')}</div>
            <div class="command-response">${responseHtml}</div>
        `;
        output.appendChild(entry);
        output.scrollTop = output.scrollHeight;
    }

    function runCommand(command) {
        const response = getCommandResponse(command);
        commandHistory.push(command);
        appendCommandOutput(command, response);
    }

    async function loadRepoSnapshot() {
        try {
            const response = await fetch(REPO_SNAPSHOT_URL, { cache: 'no-store' });
            if (!response.ok) {
                return;
            }

            const data = await response.json();
            if (Array.isArray(data.repos) && data.repos.length > 0) {
                repoSnapshot = data;
            }
        } catch (error) {
            console.info('Repo snapshot fallback is in use.');
        }
    }

    function openCommandPalette(seedCommand) {
        const palette = document.getElementById('command-palette');
        const input = document.getElementById('command-input');
        if (!palette || !input) {
            return;
        }

        palette.classList.remove('hidden');
        document.querySelectorAll('[data-command-open]').forEach((button) => {
            button.setAttribute('aria-expanded', 'true');
        });

        if (!commandHistory.length) {
            appendCommandOutput('welcome', 'Type `help`, `repos`, `projects`, `cv`, `contact`, or `goose`. This is a static GitHub Pages site, so the repo list comes from a baked-in snapshot.');
        }

        if (seedCommand && seedCommand !== 'help') {
            input.value = seedCommand;
        }

        window.setTimeout(() => input.focus(), 0);
    }

    function closeCommandPalette() {
        const palette = document.getElementById('command-palette');
        if (!palette || palette.classList.contains('hidden')) {
            return;
        }

        palette.classList.add('hidden');
        document.querySelectorAll('[data-command-open]').forEach((button) => {
            button.setAttribute('aria-expanded', 'false');
        });
    }

    function initCommandPalette() {
        const form = document.getElementById('command-form');
        const input = document.getElementById('command-input');

        document.querySelectorAll('[data-command-open]').forEach((button) => {
            button.addEventListener('click', () => openCommandPalette());
        });

        document.querySelectorAll('[data-command-close]').forEach((button) => {
            button.addEventListener('click', closeCommandPalette);
        });

        document.querySelectorAll('[data-command-run]').forEach((button) => {
            button.addEventListener('click', () => {
                const command = button.getAttribute('data-command-run') || 'help';
                openCommandPalette();
                runCommand(command);
            });
        });

        if (form && input) {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const command = input.value.trim() || 'help';
                input.value = '';
                runCommand(command);
            });
        }
    }

    function initGuideButtons() {
        const guideButton = document.getElementById('clippy-guide-button');
        const gooseButton = document.getElementById('goose-mini-button');
        const clippyCloseButton = document.getElementById('clippy-close-button');
        const emailButton = document.getElementById('open-email-client-btn');
        const gameRequestButton = document.querySelector('[data-game-request]');
        const copyButtons = [document.getElementById('copy-email-address'), document.getElementById('quick-copy-email')];

        clippyCloseButton?.addEventListener('click', hideClippy);
        emailButton?.addEventListener('click', openEmailClient);
        gameRequestButton?.addEventListener('click', showRetroGameRequest);

        document.querySelectorAll('[data-game-source]').forEach((button) => {
            button.addEventListener('click', () => {
                openGameSource(button.dataset.gameSource);
            });
        });

        guideButton?.addEventListener('click', () => {
            showClippyGuide('I can guide you to hire fit, projects, contact, CV, repos, reviews, roast mode, or the goose. Start with Command if you like typing.');
        });

        gooseButton?.addEventListener('click', () => {
            playHonkSound();
            const quote = GOOSE_QUOTES[Math.floor(Math.random() * GOOSE_QUOTES.length)];
            showClippy(`Goose says: ${quote}`, 16000);
        });

        copyButtons.forEach((button) => {
            button?.addEventListener('click', () => copyEmailAddress(button));
        });

        scheduleClippyIntro();
    }

    function readSourceOpenCount() {
        try {
            const storedValue = window.localStorage.getItem(RETRO_STORAGE_KEY) || '0';
            return Number.parseInt(storedValue, 10) || 0;
        } catch (error) {
            return 0;
        }
    }

    function writeSourceOpenCount(value) {
        try {
            window.localStorage.setItem(RETRO_STORAGE_KEY, String(value));
        } catch (error) {
            console.info('Could not persist retro source counter.');
        }
    }

    function updateSourceOpenCounter() {
        const counter = document.getElementById('source-open-count');
        if (!counter) {
            return;
        }

        counter.textContent = String(sourceOpenCount);
        if (sourceOpenCount > 0) {
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
            'RETRO SOURCE',
            gameName,
            'Opening the external source page for this classic.<br><br><strong>Archive policy:</strong> this portfolio does not host game files, ROMs, cracks, installers, or mystery ZIPs named after your childhood.'
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
        note.textContent = 'Use external game pages responsibly. Verify availability and licensing before downloading anything.';
        actions.appendChild(note);

        document.body.appendChild(modal);
    }

    function showRetroGameRequest() {
        const modal = buildModalShell(
            'RETRO NOMINATION',
            'Suggest a Retro Entry',
            "Have a favorite 90s game that belongs in the archive?<br><br>Send the title, source page, and why it deserves shelf space."
        );
        const actions = modal.querySelector('[data-modal-actions]');

        appendModalButton(
            actions,
            'Send Request',
            'block w-full bg-gradient-to-r from-tech-purple to-tech-pink text-white font-bold py-3 px-6 rounded-lg text-center',
            null,
            'mailto:yuval.grimberg@gmail.com?subject=Retro Game Archive Nomination&body=Hi Yuval! I would nominate this retro game for the archive:%0D%0A%0D%0ATitle:%0D%0ASource page:%0D%0AWhy it belongs:'
        );

        appendModalButton(
            actions,
            'Maybe Later',
            'w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg',
            () => modal.remove()
        );

        document.body.appendChild(modal);
    }

    function openGameSource(gameId) {
        const gameLinks = {
            'little-fighter-2': 'https://www.lf2.net/en/intro.html',
            airxonix: 'https://www.myabandonware.com/game/airxonix-iid',
            elastomania: 'https://elastomania.com/'
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

        sourceOpenCount += 1;
        writeSourceOpenCount(sourceOpenCount);
        updateSourceOpenCounter();

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
        initRealClippy();
        loadRepoSnapshot();
        initProjectCardObserver();
        initFunZone();
        initGooseAnimation();
        initHireCommandCenter();
        initCvGate();
        initCommandPalette();
        initGuideButtons();
        initKeyboardEasterEggs();
        injectRainbowKeyframes();

        sourceOpenCount = readSourceOpenCount();
        updateSourceOpenCounter();
    }

    window.openEmailClient = openEmailClient;
    window.openGameSource = openGameSource;
    window.showRetroGameRequest = showRetroGameRequest;
    window.showClippy = showClippy;
    window.hideClippy = hideClippy;
    window.openCommandPalette = openCommandPalette;

    document.addEventListener('DOMContentLoaded', initPage);
})();
