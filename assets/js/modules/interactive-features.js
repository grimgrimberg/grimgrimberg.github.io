/**
 * Interactive Features Module
 * Handles Click Me button, Goose wisdom button, and sound effects
 */

let funClickCount = 0;

export function initInteractiveFeatures() {
    initClickMeButton();
    initGooseWisdom();
    console.log('Interactive features module initialized');
}

function initClickMeButton() {
    const clickMeButton = document.getElementById('click-me-button');
    const clickCountDisplay = document.getElementById('click-count');
    const clickMessage = document.getElementById('click-message');

    if (!clickMeButton) return;

    clickMeButton.addEventListener('click', function () {
        funClickCount++;
        clickCountDisplay.textContent = `(${funClickCount})`;

        // Fun messages based on click count
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

            // Show Clippy for the achievement
            if (window.clippyAgent && window.clippyLoaded) {
                window.clippyAgent.moveTo(200, 200);
                window.clippyAgent.show();
                window.clippyAgent.play('Congratulate');
                window.clippyAgent.speak('🎉 42! The Answer to Life, Universe, and Everything! You\'re a true geek!');
                setTimeout(() => window.clippyAgent.hide(), 8000);
            }
        }

        // Add some visual flair
        if (funClickCount % 5 === 0 && funClickCount !== 42) {
            clickMeButton.style.background = `linear-gradient(45deg, hsl(${Math.random() * 360}, 70%, 50%), hsl(${Math.random() * 360}, 70%, 50%))`;
        }
    });
}

function initGooseWisdom() {
    const gooseTalkButton = document.getElementById('goose-talk');
    const gooseWisdom = document.getElementById('goose-wisdom');

    if (!gooseTalkButton) return;

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
        playHonkSound();

        const randomQuote = gooseQuotes[Math.floor(Math.random() * gooseQuotes.length)];
        gooseWisdom.textContent = `"${randomQuote}"`;

        // Add animation
        gooseWisdom.style.animation = 'none';
        setTimeout(() => {
            gooseWisdom.style.animation = 'pulse 1s ease-in-out';
        }, 10);
    });
}

function playHonkSound() {
    try {
        const audio = new Audio('./assets/sounds/honk-sound.mp3');
        audio.volume = 0.6;
        audio.play().catch(e => {
            console.log('🦆 Honk sound play blocked by browser policy');
        });
    } catch (error) {
        console.log('🦆 Honk sound file not found or failed to load');
    }
}
