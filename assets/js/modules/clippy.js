/**
 * Clippy Module
 * Handles the REAL Microsoft Office Clippy with all authentic animations
 */

let clippyAgent = null;
let clippyLoaded = false;
let clippyInitAttempts = 0;
let clippyHideTimeout = null;
const MAX_CLIPPY_ATTEMPTS = 10;

// Set the CDN paths for ClippyJS agents
window.CLIPPY_CDN = 'https://cdn.jsdelivr.net/gh/smore-inc/clippy.js@master/build/agents/';
const CLIPPY_CDN_FALLBACK = 'https://cdn.jsdelivr.net/gh/pi0/clippyjs@master/assets/agents/';

export function initClippy() {
    initializeRealClippy();
    setupClippyKeyboardShortcuts();
    setupMobileClippyToggle();

    // Expose global functions
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
        console.log('❌ Clippy failed to load after max attempts. Using fallback.');
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
                console.log('Available animations:', clippyAgent.animations());

                // Show Clippy immediately on load
                clippyAgent.moveTo(100, 100);
                clippyAgent.show();
                clippyAgent.speak("Hi! I'm Clippy. I'm here to help you navigate Yuval's portfolio!");

                // Auto-hide after 8 seconds
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
                    setTimeout(() => {
                        clippyAgent.hide();
                    }, 8000);
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

function clippySummon(message = null, anim = 'GetAttention') {
    console.log('📎 clippySummon called:', { loaded: clippyLoaded, agent: !!clippyAgent, message, anim });

    if (!(clippyAgent && clippyLoaded)) {
        console.log('📎 Clippy not ready, showing fallback');
        showClippy(message || "📎 Clippy is loading… try again in a moment.");
        return;
    }

    try {
        if (clippyHideTimeout) {
            clearTimeout(clippyHideTimeout);
            clippyHideTimeout = null;
            console.log('📎 Cancelled previous hide timeout');
        }

        const x = Math.max(10, Math.min(window.innerWidth - 180, 100));
        const y = Math.max(10, Math.min(window.innerHeight - 180, 100));
        console.log('📎 Moving Clippy to:', { x, y });

        clippyAgent.moveTo(x, y);
        clippyAgent.show();

        setTimeout(() => {
            if (anim && clippyAgent) {
                console.log('📎 Playing animation:', anim);
                clippyAgent.stop();
                clippyAgent.play(anim);
            }

            if (message && clippyAgent) {
                console.log('📎 Speaking message:', message);
                setTimeout(() => {
                    clippyAgent.speak(message);
                }, anim ? 500 : 0);
            }
        }, 200);

        clippyHideTimeout = setTimeout(() => {
            try {
                console.log('📎 Auto-hiding Clippy');
                clippyAgent.play('GoodBye');
                setTimeout(() => clippyAgent.hide(), 1200);
            } catch (error) {
                console.log('📎 Hide error:', error);
            }
        }, 12000);

        console.log('📎 Clippy summoned successfully');
    } catch (error) {
        console.log('📎 Summon error:', error);
        showClippy("📎 Clippy had a glitch! Try again.");
    }
}

function summonClippy(message = "Manual summon test!", anim = 'GetAttention') {
    console.log('📎 Manual summon requested');
    clippySummon(message, anim);
}

function checkClippyStatus() {
    console.log('📎 CLIPPY STATUS REPORT:');
    console.log('  Agent object:', clippyAgent);
    console.log('  Loaded flag:', clippyLoaded);
    console.log('  Init attempts:', clippyInitAttempts);
    console.log('  jQuery available:', typeof $ !== 'undefined');
    console.log('  Clippy library:', typeof clippy !== 'undefined');
    console.log('  CDN path:', window.CLIPPY_CDN);
    console.log('  Hide timeout active:', !!clippyHideTimeout);
    if (clippyAgent) {
        console.log('  Agent visible:', clippyAgent._el ? clippyAgent._el.style.display !== 'none' : 'unknown');
    }
}

function setupClippyKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
        // Alt+Shift+C for REAL Clippy magic!
        if (e.altKey && e.shiftKey && e.code === 'KeyC') {
            e.preventDefault();

            if (clippyAgent && clippyLoaded) {
                const animations = ['GetAttention', 'Congratulate', 'Thinking', 'Explain', 'LookRight', 'LookLeft', 'CheckingSomething'];
                const randomAnim = animations[Math.floor(Math.random() * animations.length)];
                const phrases = [
                    "🎯 Secret activated! You found the REAL Microsoft Office Clippy! You're definitely tech-savvy!",
                    "Looking for Yuval's contact info? Scroll down to the contact section!",
                    "Want to see his photography skills? Check out the Fun Zone!",
                    "Pro tip: Try clicking the counter button exactly 42 times...",
                    "This portfolio is so well-coded, I couldn't find any bugs! And I'm very thorough!",
                    "I'm the REAL Clippy! Not some CSS impostor! I have authentic Microsoft animations!",
                    "Did you know Yuval can debug autonomous vehicles AND make you laugh? Rare combo!",
                    "I've seen countless resumes since 1997, but this portfolio is next level!",
                    "Fun fact: I can do over 50 different animations! Want to see another one?",
                    "📎 CLIPPY EASTER EGG UNLOCKED! You've discovered the authentic Microsoft Office experience!"
                ];
                clippySummon(phrases[Math.floor(Math.random() * phrases.length)], randomAnim);
            } else {
                showClippy("🔗📎 REAL Clippy is loading... But I can tell you're trying to hire an awesome engineer! 📎");
            }
        }
    });
}

function setupMobileClippyToggle() {
    const clippyToggleBtn = document.getElementById('clippy-mobile-toggle');
    if (clippyToggleBtn) {
        clippyToggleBtn.addEventListener('click', () => {
            if (clippyAgent && clippyLoaded) {
                clippySummon();
            } else {
                showClippy("📎 Hi! I'm Clippy. Tap again later if I hide.");
            }
        });
    }
}

// Fallback custom clippy functions
function showClippy(message = null) {
    const clippy = document.getElementById('custom-clippy');
    const clippyText = document.getElementById('clippy-text');

    if (message && clippyText) {
        clippyText.textContent = message;
    }

    if (clippy) {
        clippy.classList.add('show');
        setTimeout(() => {
            hideClippy();
        }, 8000);
    }
}

function hideClippy() {
    const clippy = document.getElementById('custom-clippy');
    if (clippy) {
        clippy.classList.remove('show');
    }
}
