

let secret_word_id = '';
let words_count = 0;
let tmi_client = null;
let welcomeHideTimer = null;
let skipWelcomeOnce = false;
let gameStartInProgress = false;

function showWelcome() {
    const welcomeSection = document.getElementById('welcome');
    if (!welcomeSection) return;

    if (welcomeHideTimer) {
        clearTimeout(welcomeHideTimer);
        welcomeHideTimer = null;
    }
    welcomeSection.style.display = 'flex';
    requestAnimationFrame(() => {
        welcomeSection.classList.add('is-visible');
    });
}

function hideWelcome() {
    const welcomeSection = document.getElementById('welcome');
    if (!welcomeSection) return;

    welcomeSection.classList.remove('is-visible');
    if (welcomeHideTimer) {
        clearTimeout(welcomeHideTimer);
    }
    welcomeHideTimer = setTimeout(() => {
        welcomeSection.style.display = 'none';
    }, 360);
}

function readSettingsFromInputs() {
    const channelInput = document.getElementById('channel-name');
    const restartInput = document.getElementById('restart-time');
    const channelValue = channelInput ? channelInput.value.trim() : '';
    const restartValue = restartInput ? parseInt(restartInput.value, 10) : NaN;

    return {
        channelValue,
        restartValue: Number.isFinite(restartValue) ? restartValue : null
    };
}

function applySettingsFromInputs(persist) {
    const { channelValue, restartValue } = readSettingsFromInputs();

    if (channelValue) {
        channel_name = channelValue;
        if (persist) {
            localStorage.setItem('channel_name', channelValue);
        }
    }

    if (restartValue !== null) {
        restart_time = restartValue;
        if (persist) {
            localStorage.setItem('restart_time', String(restartValue));
        }
    }

    return !!channelValue;
}

async function startGame() {
    if (!channel_name || gameStartInProgress) return;
    gameStartInProgress = true;
    try {
        hideWelcome();
        const settingsSection = document.getElementById('settings');
        if (settingsSection) settingsSection.style.display = 'none';
        const guessingMeta = document.querySelector('.guessing-meta');
        if (guessingMeta) guessingMeta.style.display = 'block';
        const totalWordsValue = document.getElementById('total-words-value');
        if (totalWordsValue) totalWordsValue.textContent = '0';
        secret_word_id = await generate_secret_word();
        if (typeof window.startRoundHints === 'function') {
            window.startRoundHints();
        }
        create_chat_connection(channel_name);
    } finally {
        gameStartInProgress = false;
    }
}

async function generate_secret_word() {
    const data = await kontekstno_query('random-challenge');
    room_id = data.id;
    return room_id;
}

async function kontekstno_query(method = '', word = '', challenge_id = '') {

    let url = '';

    if (method == 'random-challenge') {
        url = "https://xn--80aqu.xn--e1ajbkccewgd.xn--p1ai/" + method;
    }

    if (method == 'score') {
        url = "https://xn--80aqu.xn--e1ajbkccewgd.xn--p1ai/score?challenge_id=" + challenge_id + "&word=" + word + "&challenge_type=random";
    }



    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }

    return await response.json();
}

function create_chat_connection(channel_name = '') {

    if (tmi_client) {
        tmi_client.disconnect().catch((err) => console.error('Error disconnecting:', err));
    }

    tmi_client = new tmi.Client({
        channels: [channel_name]
    });

    tmi_client.connect();

    tmi_client.on('message', (channel, tags, message, self) => {


        const color = tags['color'] || '#00FF00';
        const name = tags['display-name'];

        if (message.split(' ').length > 2) return;

        message = message.replace(/[^\p{L}0-9]/gu, '');
        if (!message) return;

        words_count++;
        if (words_count === 1) {
            if (typeof hideInfoPanel === 'function') {
                hideInfoPanel();
            } else {
                const infoSection = document.getElementById('info');
                if (infoSection) infoSection.classList.remove('is-visible');
            }
        }

        process_message(name, color, message).catch((error) => {
            console.error('Word check failed:', error);
        });

    });

}

function loadSettings() {
    const storedChannel = localStorage.getItem('channel_name');
    const storedRestartTime = localStorage.getItem('restart_time');

    if (storedChannel) {
        channel_name = storedChannel;
        const channelInput = document.getElementById('channel-name');
        if (channelInput) channelInput.value = channel_name;
    }

    if (storedRestartTime) {
        restart_time = parseInt(storedRestartTime, 10);
        const restartInput = document.getElementById('restart-time');
        if (restartInput) restartInput.value = restart_time;
    }

    return !!channel_name;
}

const saveBtn = document.getElementById('save-settings-btn');
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        applySettingsFromInputs(true);
    });
}

const restartTimeInput = document.getElementById('restart-time');
if (restartTimeInput) {
    restartTimeInput.addEventListener('input', (event) => {
        const value = event.target.value;
        const cleaned = value.replace(/\D+/g, '');
        if (value !== cleaned) {
            event.target.value = cleaned;
        }
    });
}

const welcomeBtn = document.getElementById('welcome-start-btn');
if (welcomeBtn) {
    welcomeBtn.addEventListener('click', () => {
        hideWelcome();
        const settingsSection = document.getElementById('settings');
        loadSettings();
        if (settingsSection) {
            settingsSection.style.display = 'block';
        }
    });
}

const startBtn = document.getElementById('start-game-btn');
if (startBtn) {
    startBtn.addEventListener('click', () => {
        if (applySettingsFromInputs(false)) {
            skipWelcomeOnce = true;
            startGame();
        }
    });
}


async function getTwitchUserData(username) {
    try {
        const response = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${username}`);
        const data = await response.json();

        if (data && data[0]) {
            return data[0];
        }

        console.error('User not found.');
        return null;
    } catch (error) {
        console.error('Request error:', error);
        return null;
    }
}


const LEADERBOARD_ANIM_MS = 250;
let leaderboardHideTimer = null;

function showLeaderboardPanel() {
    const leaderboardSection = document.getElementById('leaderboard');
    if (!leaderboardSection) return;

    if (leaderboardHideTimer) {
        clearTimeout(leaderboardHideTimer);
        leaderboardHideTimer = null;
    }

    leaderboardSection.style.display = 'flex';
    requestAnimationFrame(() => {
        leaderboardSection.classList.add('is-visible');
    });

    if (typeof renderLeaderboard === 'function') {
        renderLeaderboard();
    }
}

function hideLeaderboardPanel() {
    const leaderboardSection = document.getElementById('leaderboard');
    if (!leaderboardSection) return;

    leaderboardSection.classList.remove('is-visible');
    if (leaderboardHideTimer) {
        clearTimeout(leaderboardHideTimer);
    }
    leaderboardHideTimer = setTimeout(() => {
        leaderboardSection.style.display = 'none';
    }, LEADERBOARD_ANIM_MS);
}

window.showLeaderboardPanel = showLeaderboardPanel;
window.hideLeaderboardPanel = hideLeaderboardPanel;

const leaderboardBtn = document.getElementById('menu-button-leaderboard');
if (leaderboardBtn) {
    leaderboardBtn.addEventListener('click', () => {
        const welcomeSection = document.getElementById('welcome');
        if (welcomeSection && welcomeSection.classList.contains('is-visible')) {
            return;
        }
        const leaderboardSection = document.getElementById('leaderboard');
        if (!leaderboardSection) return;

        const isVisible = leaderboardSection.classList.contains('is-visible');
        if (isVisible) {
            hideLeaderboardPanel();
        } else {
            showLeaderboardPanel();
        }
    });
}

const resetLeaderboardBtn = document.getElementById('reset-leaderboard-btn');
if (resetLeaderboardBtn) {
    resetLeaderboardBtn.addEventListener('click', resetLeaderboard);
}

async function app() {
    try {
        const ready = loadSettings();

        if (ready) {
            const shouldSkipWelcome = skipWelcomeOnce;
            skipWelcomeOnce = false;
            if (shouldSkipWelcome) {
                hideWelcome();
            } else {
                showWelcome();
            }
            document.getElementById('settings').style.display = 'none';
            if (shouldSkipWelcome) {
                await startGame();
            }
        } else {
            document.getElementById('settings').style.display = 'none';
            showWelcome();
        }

    } catch (error) {
        console.error(error);
    }
}

app();
