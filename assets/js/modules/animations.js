/**
 * Animations Module
 * Handles AOS initialization and intersection observers
 */

export function initAnimations() {
    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }

    // Intersection Observer for project cards
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

    // Observe all project cards
    document.querySelectorAll('.project-card').forEach(card => {
        observer.observe(card);
    });

    console.log('Animations module initialized');
}

/**
 * Load Goose Animation
 */
export function loadGooseAnimation() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.9.6/lottie.min.js';
    script.onload = function () {
        if (window.lottie) {
            const gooseContainer = document.getElementById('goose-fun-zone');
            if (gooseContainer) {
                lottie.loadAnimation({
                    container: gooseContainer,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    path: './assets/images/jumpy-goose.json'
                });
            }
        }
    };
    document.head.appendChild(script);
}
