import { CONFIG } from './config.js';

export function addLastUsedWord(word) {
    const container = document.querySelector('.guessing .last-words');
    const html = `<div class="msg">${word} уже было использовано</div>`;
    container.insertAdjacentHTML('afterbegin', html);
}

export function addBestMatch(word, distance, name, color) {
    const container = document.querySelector('.guessing .best-match');
    const messageHtml = createMessageHtml(word, distance, name, color);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = messageHtml.trim();
    const newMsgElement = tempDiv.firstElementChild;

    const children = Array.from(container.children);
    let insertIndex = children.length;
    const newDistance = parseFloat(distance);

    for (let i = 0; i < children.length; i++) {
        const childDistance = parseFloat(children[i].dataset.distance);
        if (childDistance > newDistance) {
            insertIndex = i;
            break;
        }
    }

    if (insertIndex === children.length) {
        container.appendChild(newMsgElement);
    } else {
        container.insertBefore(newMsgElement, children[insertIndex]);
    }
}

export function addMessageToLastWordsList(word, distance, name, color) {
    const container = document.querySelector('.guessing .last-words');
    const messageHtml = createMessageHtml(word, distance, name, color);
    container.insertAdjacentHTML('afterbegin', messageHtml);
}

function createMessageHtml(word, distance, name, color) {
    const width = Math.max(0, 100 - (distance / CONFIG.MAX_DISTANCE) * 100);

    return `
        <div class="msg" data-distance="${distance}">
            <div class="bg" style="width: ${width}%"></div>
            <div class="word-and-distance">
                <div class="word">${word}</div>
                <div class="distance">${distance}</div>
            </div>
            <div class="name" style="color: ${color}">${name}</div>
        </div>
    `;
}

export function showWinner(name) {
    const winnerBlock = document.querySelector('.winner');
    winnerBlock.innerText = `Победитель: ${name}`;
    winnerBlock.style.display = 'block';
}

export function hideWinner() {
    const winnerBlock = document.querySelector('.winner');
    winnerBlock.style.display = 'none';
}

export function resetBoard() {
    document.querySelector('.guessing .last-words').innerHTML = '';
    document.querySelector('.guessing .best-match').innerHTML = '';
    hideWinner();
}
