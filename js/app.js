import { initGame, processGuess } from './game.js';
import { connectTwitch } from './twitch.js';
import { CONFIG } from './config.js';

async function startApp() {
    console.log('Starting Wordotron 9000...');

    // Setup Test Button
    const testBtn = document.getElementById('test-win-btn');
    if (testBtn) {
        testBtn.addEventListener('click', () => {
            const randomSuffix = Math.floor(Math.random() * 10000);
            processGuess('TestUser', '#0000FF', 'WinWord' + randomSuffix, true);
        });
    }

    await initGame();

    if (CONFIG.DEFAULT_CHANNEL) {
        connectTwitch(CONFIG.DEFAULT_CHANNEL);
    }
}

// Start the application
startApp();
