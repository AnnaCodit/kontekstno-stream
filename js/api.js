import { CONFIG } from './config.js';

export async function fetchSecretWordId() {
    const url = `${CONFIG.API_BASE_URL}random-challenge`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch secret word ID. Status: ${response.status}`);
    }
    const data = await response.json();
    return data.id;
}

export async function checkWordDistance(word, challengeId) {
    const url = new URL(CONFIG.API_SCORE_URL);
    url.searchParams.append('challenge_id', challengeId);
    url.searchParams.append('word', word);
    url.searchParams.append('challenge_type', 'random');

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`Failed to check word distance. Status: ${response.status}`);
    }
    return await response.json();
}
