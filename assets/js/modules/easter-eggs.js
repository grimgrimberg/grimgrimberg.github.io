/**
 * Easter Eggs Module
 * Handles Konami code and other hidden features
 */

export function initEasterEggs() {
    setupKonamiCode();
    setupRainbowAnimation();
    console.log('Easter eggs module initialized');
}

function setupKonamiCode() {
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];

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
                window.clippyAgent.speak("🎮 KONAMI CODE ACTIVATED! You've unlocked the ultimate easter egg! I'm so excited I'm doing my victory dance! 🎮");
            }

            document.body.style.animation = 'rainbow 2s infinite';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 5000);
            window.konamiSequence = [];
        }
    });
}

function setupRainbowAnimation() {
    const style = document.createElement('style');
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
