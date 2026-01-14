import * as API from './api.js';
import * as UI from './ui.js';
import { CONFIG } from './config.js';

const state = {
    isGameFinished: false,
    secretWordId: null,
    checkedWords: new Set()
};

export async function initGame() {
    try {
        state.secretWordId = await API.fetchSecretWordId();
        console.log('Secret Word ID:', state.secretWordId);
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}

export async function processGuess(name, color, word, forceWin = false) {
    if (state.isGameFinished) return;

    // Normalize word
    word = word.toLowerCase();
    word = word.charAt(0).toUpperCase() + word.slice(1);

    if (state.checkedWords.has(word)) {
        console.log(`Word "${word}" already checked.`);
        UI.addLastUsedWord(word);
        return;
    }

    console.log(`New word: ${word}. Processing...`);

    let result;
    if (forceWin) {
        result = { distance: 1 };
    } else {
        try {
            result = await API.checkWordDistance(word, state.secretWordId);
        } catch (error) {
            console.error('Error checking word:', error);
            return;
        }
    }

    if (!result.distance) {
        console.log(`Word "${word}" has no distance.`);
        return;
    }

    if (result.distance == 1) {
        handleWin(name);
    }

    state.checkedWords.add(word);

    // Add to lists
    UI.addMessageToLastWordsList(word, result.distance, name, color);
    UI.addBestMatch(word, result.distance, name, color);
}

function handleWin(winnerName) {
    state.isGameFinished = true;
    UI.showWinner(winnerName);

    const timeout = CONFIG.DEFAULT_RESTART_TIME * 1000;

    setTimeout(async () => {
        try {
            await initGame();
        } catch (e) {
            console.error(e);
        }

        state.checkedWords.clear();
        UI.resetBoard();
        state.isGameFinished = false;
    }, timeout);
}
