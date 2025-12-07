/**
 * Retro Games Module
 * Handles retro gaming section functionality
 */

let downloadCount = parseInt(localStorage.getItem('retroDownloadCount') || '0');

export function initRetroGames() {
    updateDownloadCounter();

    // Expose global functions
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

    if (gameLinks[gameId] === `https://your-server.com/games/${gameId.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)).join('')}.zip`) {
        showGameDownloadModal(gameNames[gameId]);
    } else {
        const link = document.createElement('a');
        link.href = gameLinks[gameId];
        link.download = `${gameNames[gameId]}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        downloadCount++;
        localStorage.setItem('retroDownloadCount', downloadCount.toString());
        updateDownloadCounter();

        if (window.clippyAgent && window.clippyLoaded) {
            window.clippyAgent.moveTo(200, 300);
            window.clippyAgent.show();
            window.clippyAgent.play('Congratulate');
            window.clippyAgent.speak(`Excellent choice! ${gameNames[gameId]} is downloading. Get ready for some serious nostalgia! 🎮`);
            setTimeout(() => window.clippyAgent.hide(), 8000);
        }
    }
}

function showGameDownloadModal(gameName) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-tech-dark border border-gray-600 rounded-2xl p-8 max-w-md mx-4 glass-effect">
            <div class="text-center">
                <div class="text-4xl mb-4">🎮</div>
                <h3 class="text-2xl font-bold text-tech-cyan mb-4">${gameName}</h3>
                <p class="text-gray-300 mb-6">
                    This classic game is ready for download! 
                    <br><br>
                    <strong>Note:</strong> You'll need to provide the actual download links for these games in the JavaScript code.
                </p>
                <div class="space-y-3">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="w-full bg-gradient-to-r from-tech-cyan to-tech-green text-white font-bold py-3 px-6 rounded-lg">
                        Got It!
                    </button>
                    <div class="text-xs text-gray-400">
                        Contact Yuval for the actual download links
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function showRetroGameRequest() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-tech-dark border border-gray-600 rounded-2xl p-8 max-w-md mx-4 glass-effect">
            <div class="text-center">
                <div class="text-4xl mb-4">🕹️</div>
                <h3 class="text-2xl font-bold text-tech-purple mb-4">Request a Retro Game</h3>
                <p class="text-gray-300 mb-6">
                    Have a favorite 90s game you'd like to see here? 
                    <br><br>
                    Send me an email with your request!
                </p>
                <div class="space-y-3">
                    <a href="mailto:yuval.grimberg@gmail.com?subject=Retro Game Request&body=Hi Yuval! I'd love to see this game in your retro collection: " 
                       class="block w-full bg-gradient-to-r from-tech-purple to-tech-pink text-white font-bold py-3 px-6 rounded-lg text-center">
                        Send Request
                    </a>
                    <button onclick="this.closest('.fixed').remove()" 
                            class="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg">
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function updateDownloadCounter() {
    const counter = document.getElementById('download-count');
    if (counter) {
        counter.textContent = downloadCount;

        if (downloadCount > 0) {
            counter.style.animation = 'pulse 1s ease-in-out';
            setTimeout(() => {
                counter.style.animation = '';
            }, 1000);
        }
    }
}
