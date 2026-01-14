import { processGuess } from './game.js';
import { CONFIG } from './config.js';

export function connectTwitch(channelName) {
    // tmi is loaded globally via script tag
    // eslint-disable-next-line no-undef
    const client = new tmi.Client({
        channels: [channelName]
    });

    client.connect();

    client.on('message', (channel, tags, message, self) => {
        const color = tags['color'] || CONFIG.DEFAULT_COLOR;
        const name = tags['display-name'];

        // Ignore messages with more than 2 words
        if (message.split(' ').length > 2) return;

        // Prevent XSS
        message = message.replace(/[^a-zA-Zа-яА-ЯёЁ0-9]/g, '');

        if (message.length > 0) {
            processGuess(name, color, message);
        }
    });
}
