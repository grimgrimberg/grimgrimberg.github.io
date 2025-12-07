/**
 * Main Entry Point
 * Orchestrates all modules and initializes the application
 */

import { initNavigation, initMobileMenu } from './modules/navigation.js';
import { initAnimations, loadGooseAnimation } from './modules/animations.js';
import { initContactForm } from './modules/contact-form.js';
import { initInteractiveFeatures } from './modules/interactive-features.js';
import { initClippy } from './modules/clippy.js';
import { initRetroGames } from './modules/retro-games.js';
import { initEasterEggs } from './modules/easter-eggs.js';

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Portfolio System Initializing...');

    try {
        // Initialize all modules
        initAnimations();
        initNavigation();
        initMobileMenu();
        initContactForm();
        initInteractiveFeatures();
        initClippy();
        initRetroGames();
        initEasterEggs();
        loadGooseAnimation();

        console.log('✅ Portfolio System Online: grimgrimberg.github.io fully initialized');
    } catch (error) {
        console.error('❌ Initialization error:', error);
    }
});
