
let is_game_finished = false;
const DISTANCE_LEVELS = [
    1,
    150,
    550,
    1400,
    2800
];
const checked_words = new Set();
const pending_words = new Set();
const iwawwa = new Set(['ивавва', 'ивава', 'акане', 'аканэ', 'iwawwa', 'iwawa', 'akane']);
const iwawwa_img = [
    'iwawwa_2.avif',
    'iwawwa_3.avif',
    'iwawwa_4.avif',
    'iwawwa_5.avif'
];
const INFO_DURATION_MS = 10000;
let infoHideTimer = null;
let infoAnimationFrame = null;
let infoEndTime = 0;
const infoSection = document.getElementById('info');
const infoTimerValue = infoSection ? infoSection.querySelector('.info-timer-value') : null;
const infoTimerProgress = infoSection ? infoSection.querySelector('.info-timer-progress') : null;
const celebrationLayer = document.getElementById('celebration');
const welcomeSection = document.getElementById('welcome');
const CONFETTI_COLORS = ['#ff4d4d', '#ff9f1c', '#ffe66d', '#7be495', '#4d96ff', '#7f5af0', '#ff6ec7'];
let celebrationCleanupTimer = null;
let confettiAnimationFrame = null;
let confettiLastTime = 0;
let confettiParticles = [];
const CONFETTI_GRAVITY = 720;
const CONFETTI_DRAG = 0.12;
const confettiTimers = [];
let round_words_count = 0;
const totalWordsValue = document.getElementById('total-words-value');
const restartTimerSection = document.querySelector('.restart-timer');
const restartTimerValue = document.getElementById('restart-timer-value');
let restartTimerInterval = null;
const hintSection = document.getElementById('hint');
const hintText = hintSection ? hintSection.querySelector('.hint-text') : null;
const hintCloseBtn = hintSection ? hintSection.querySelector('.hint-close') : null;
const hintPrevBtn = hintSection ? hintSection.querySelector('.hint-prev') : null;
const hintNextBtn = hintSection ? hintSection.querySelector('.hint-next') : null;
const hintDots = hintSection ? hintSection.querySelector('.hint-dots') : null;
const hintRotateTimerValue = hintSection ? hintSection.querySelector('.hint-rotate-timer') : null;
const hintCountdown = document.getElementById('hint-countdown');
const HINT_START_DELAY_MS = 120000;
const HINT_ROTATE_MS = 10000;
const HINT_REOPEN_DELAY_MS = 300000;
const HINT_HIDE_ANIM_MS = 260;
const HINTS = [
    'Начни с общего: предмет, действие, чувство, место — потом уточняй.',
    'Пробуй базовые слова: цвет, форма, материал, размер, функция.',
    'Сравни с последними близкими словами и сделай шаг в их сторону.',
    'Ищи синонимы и родственные: часть, свойство, категория.',
    'Меняй часть речи: существительное → прилагательное или глагол.',
    'Если застрял — смени тему на минуту и вернись.',
    'Пиши через е: лёд и лед засчитываются как одно.'
];
let hintStartTimer = null;
let hintRotateTimer = null;
let hintHideTimer = null;
let hintIndex = 0;
let hintsEnabled = false;

function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[&<>"']/g, (char) => {
        if (char === '&') return '&amp;';
        if (char === '<') return '&lt;';
        if (char === '>') return '&gt;';
        if (char === '"') return '&quot;';
        if (char === "'") return '&#39;';
        return char;
    });
}

function sanitizeColor(value) {
    if (typeof value !== 'string') return '#f2f2f2';
    const trimmed = value.trim();
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) {
        return trimmed;
    }
    return '#f2f2f2';
}

function updateInfoTimer() {
    if (!infoSection) return;

    if (!infoTimerValue || !infoTimerProgress) return;

    const now = performance.now();
    const remainingMs = Math.max(0, infoEndTime - now);
    const remainingSeconds = remainingMs / 1000;
    const progress = remainingMs / INFO_DURATION_MS;

    const displaySeconds = remainingSeconds < 10 ? remainingSeconds.toFixed(1) : remainingSeconds.toFixed(0);
    infoTimerValue.textContent = `${displaySeconds}s`;
    infoTimerProgress.style.transform = `scaleX(${progress})`;

    if (remainingMs > 0) {
        infoAnimationFrame = requestAnimationFrame(updateInfoTimer);
    } else {
        infoAnimationFrame = null;
    }
}

function showInfoPanel() {
    if (!infoSection) return;

    infoSection.classList.add('is-visible');
    if (infoHideTimer) {
        clearTimeout(infoHideTimer);
    }
    if (infoAnimationFrame) {
        cancelAnimationFrame(infoAnimationFrame);
    }

    infoEndTime = performance.now() + INFO_DURATION_MS;
    updateInfoTimer();
    infoHideTimer = setTimeout(() => {
        hideInfoPanel();
    }, INFO_DURATION_MS);
}

function hideInfoPanel() {
    if (!infoSection) return;

    infoSection.classList.remove('is-visible');
    if (infoHideTimer) {
        clearTimeout(infoHideTimer);
        infoHideTimer = null;
    }
    if (infoAnimationFrame) {
        cancelAnimationFrame(infoAnimationFrame);
        infoAnimationFrame = null;
    }
}

window.showInfoPanel = showInfoPanel;
window.hideInfoPanel = hideInfoPanel;

function clearCelebration() {
    if (!celebrationLayer) return;
    celebrationLayer.innerHTML = '';
    confettiParticles = [];
    if (confettiAnimationFrame) {
        cancelAnimationFrame(confettiAnimationFrame);
        confettiAnimationFrame = null;
    }
    if (confettiTimers.length) {
        confettiTimers.forEach((timer) => clearTimeout(timer));
        confettiTimers.length = 0;
    }
    if (celebrationCleanupTimer) {
        clearTimeout(celebrationCleanupTimer);
        celebrationCleanupTimer = null;
    }
}

function updateTotalWords() {
    if (totalWordsValue) {
        totalWordsValue.textContent = String(round_words_count);
    }
}

function showRestartTimer(seconds) {
    if (!restartTimerSection || !restartTimerValue) return;

    if (restartTimerInterval) {
        clearInterval(restartTimerInterval);
    }

    let remaining = Math.max(1, seconds);
    restartTimerValue.textContent = String(remaining);
    restartTimerSection.style.display = 'flex';
    restartTimerInterval = setInterval(() => {
        remaining -= 1;
        restartTimerValue.textContent = String(Math.max(0, remaining));
        if (remaining <= 0) {
            clearInterval(restartTimerInterval);
            restartTimerInterval = null;
        }
    }, 1000);
}

function hideRestartTimer() {
    if (restartTimerInterval) {
        clearInterval(restartTimerInterval);
        restartTimerInterval = null;
    }
    if (restartTimerSection) {
        restartTimerSection.style.display = 'none';
    }
}

function formatHintTime(ms) {
    const seconds = Math.max(0, ms / 1000);
    const value = seconds < 10 ? seconds.toFixed(1) : Math.ceil(seconds).toFixed(0);
    return `${value}s`;
}

let hintTimerFrame = null;
let hintCountdownEnd = 0;
let hintCountdownFadeStart = 0;
let hintCountdownHideTimer = null;
let hintRotateEnd = 0;
let hintSwitchTimer = null;
let hintClickCount = 0;

function updateHintTimers() {
    const now = performance.now();
    let needsNext = false;

    if (hintCountdown && hintCountdownEnd > 0) {
        const remaining = hintCountdownEnd - now;
        if (remaining <= 0) {
            stopHintCountdown();
        } else {
            hintCountdown.textContent = formatHintTime(remaining);
            if (now >= hintCountdownFadeStart) {
                hintCountdown.classList.add('is-fading');
            } else {
                hintCountdown.classList.remove('is-fading');
            }
            needsNext = true;
        }
    }

    if (hintRotateTimerValue && hintRotateEnd > 0 && hintSection && hintSection.classList.contains('is-visible')) {
        const remaining = Math.max(0, hintRotateEnd - now);
        hintRotateTimerValue.textContent = formatHintTime(remaining);
        if (remaining > 0) {
            needsNext = true;
        }
    }

    if (needsNext) {
        hintTimerFrame = requestAnimationFrame(updateHintTimers);
    } else {
        hintTimerFrame = null;
    }
}

function ensureHintTimerFrame() {
    if (!hintTimerFrame) {
        hintTimerFrame = requestAnimationFrame(updateHintTimers);
    }
}

function startHintCountdown(durationMs) {
    if (!hintCountdown) return;
    if (durationMs <= 0) {
        stopHintCountdown();
        return;
    }
    if (hintCountdownHideTimer) {
        clearTimeout(hintCountdownHideTimer);
        hintCountdownHideTimer = null;
    }
    hintCountdownEnd = performance.now() + durationMs;
    hintCountdownFadeStart = hintCountdownEnd - 10000;
    hintCountdown.textContent = formatHintTime(durationMs);
    hintCountdown.style.display = 'flex';
    hintCountdown.classList.add('is-visible');
    hintCountdown.classList.remove('is-fading');
    hintCountdown.style.setProperty('--hint-countdown-scale', '1');
    hintCountdown.style.setProperty('--hint-countdown-rot', '0deg');
    hintClickCount = 0;
    ensureHintTimerFrame();
}

function stopHintCountdown() {
    if (!hintCountdown) return;
    hintCountdownEnd = 0;
    hintCountdownFadeStart = 0;
    hintClickCount = 0;
    hintCountdown.classList.remove('is-fading');
    hintCountdown.classList.remove('is-visible');
    hintCountdown.style.setProperty('--hint-countdown-scale', '1');
    hintCountdown.style.setProperty('--hint-countdown-rot', '0deg');
    if (hintCountdownHideTimer) {
        clearTimeout(hintCountdownHideTimer);
    }
    hintCountdownHideTimer = setTimeout(() => {
        if (hintCountdownEnd === 0) {
            hintCountdown.style.display = 'none';
        }
    }, HINT_HIDE_ANIM_MS);
}

function renderHintDots() {
    if (!hintDots) return;
    hintDots.innerHTML = '';
    HINTS.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'hint-dot';
        if (index === hintIndex) {
            dot.classList.add('is-active');
        }
        hintDots.appendChild(dot);
    });
}

function resetHintRotateCountdown() {
    hintRotateEnd = performance.now() + HINT_ROTATE_MS;
    if (hintRotateTimerValue && hintSection && hintSection.classList.contains('is-visible')) {
        hintRotateTimerValue.textContent = formatHintTime(HINT_ROTATE_MS);
        ensureHintTimerFrame();
    }
}

function setHintIndex(nextIndex) {
    if (!HINTS.length) return;
    const total = HINTS.length;
    hintIndex = ((nextIndex % total) + total) % total;
    if (hintText) {
        hintText.textContent = HINTS[hintIndex];
    }
    renderHintDots();
    resetHintRotateCountdown();
}

function animateHintTo(nextIndex) {
    if (!HINTS.length) return;
    const total = HINTS.length;
    const normalized = ((nextIndex % total) + total) % total;
    if (!hintText || !hintSection || !hintSection.classList.contains('is-visible')) {
        setHintIndex(normalized);
        return;
    }
    if (hintSwitchTimer) {
        clearTimeout(hintSwitchTimer);
    }
    hintText.classList.add('is-switching');
    hintSwitchTimer = setTimeout(() => {
        hintIndex = normalized;
        hintText.textContent = HINTS[hintIndex];
        hintText.classList.remove('is-switching');
        renderHintDots();
        resetHintRotateCountdown();
    }, 180);
}

function startHintRotation() {
    if (hintRotateTimer) {
        clearInterval(hintRotateTimer);
    }
    resetHintRotateCountdown();
    hintRotateTimer = setInterval(() => {
        animateHintTo(hintIndex + 1);
    }, HINT_ROTATE_MS);
}

function stopHintRotation() {
    if (hintRotateTimer) {
        clearInterval(hintRotateTimer);
        hintRotateTimer = null;
    }
    hintRotateEnd = 0;
}

function showHintPanel() {
    if (!hintSection || !hintText) return;
    if (hintHideTimer) {
        clearTimeout(hintHideTimer);
        hintHideTimer = null;
    }
    if (hintStartTimer) {
        clearTimeout(hintStartTimer);
        hintStartTimer = null;
    }
    stopHintCountdown();
    setHintIndex(hintIndex);
    hintSection.style.display = 'flex';
    requestAnimationFrame(() => {
        hintSection.classList.add('is-visible');
        resetHintRotateCountdown();
    });
    startHintRotation();
}

function hideHintPanel() {
    if (!hintSection) return;
    hintSection.classList.remove('is-visible');
    if (hintText) {
        hintText.classList.remove('is-switching');
    }
    if (hintSwitchTimer) {
        clearTimeout(hintSwitchTimer);
        hintSwitchTimer = null;
    }
    stopHintRotation();
    if (hintHideTimer) {
        clearTimeout(hintHideTimer);
    }
    hintHideTimer = setTimeout(() => {
        hintSection.style.display = 'none';
    }, HINT_HIDE_ANIM_MS);
}

function scheduleHintStart(delay) {
    if (!hintsEnabled) return;
    if (hintStartTimer) {
        clearTimeout(hintStartTimer);
        hintStartTimer = null;
    }
    if (delay <= 0) {
        showHintPanel();
        return;
    }
    startHintCountdown(delay);
    hintStartTimer = setTimeout(() => {
        if (!hintsEnabled) return;
        showHintPanel();
    }, delay);
}

function startRoundHints() {
    hintsEnabled = true;
    hintIndex = 0;
    hideHintPanel();
    scheduleHintStart(HINT_START_DELAY_MS);
}

function stopRoundHints() {
    hintsEnabled = false;
    if (hintStartTimer) {
        clearTimeout(hintStartTimer);
        hintStartTimer = null;
    }
    stopHintCountdown();
    stopHintRotation();
    hideHintPanel();
}

window.startRoundHints = startRoundHints;
window.stopRoundHints = stopRoundHints;

if (hintCloseBtn) {
    hintCloseBtn.addEventListener('click', () => {
        if (!hintsEnabled) return;
        hideHintPanel();
        scheduleHintStart(HINT_REOPEN_DELAY_MS);
    });
}

if (hintPrevBtn) {
    hintPrevBtn.addEventListener('click', () => {
        if (!hintsEnabled) return;
        animateHintTo(hintIndex - 1);
        if (hintSection && hintSection.classList.contains('is-visible')) {
            startHintRotation();
        }
    });
}

if (hintNextBtn) {
    hintNextBtn.addEventListener('click', () => {
        if (!hintsEnabled) return;
        animateHintTo(hintIndex + 1);
        if (hintSection && hintSection.classList.contains('is-visible')) {
            startHintRotation();
        }
    });
}

if (hintCountdown) {
    hintCountdown.addEventListener('click', () => {
        if (!hintsEnabled) return;
        hintClickCount += 1;
        const direction = hintClickCount % 2 === 0 ? 1 : -1;
        const scale = 1 + hintClickCount * 0.035;
        const tilt = 3 + hintClickCount * 0.6;
        hintCountdown.style.setProperty('--hint-countdown-scale', scale.toFixed(3));
        hintCountdown.style.setProperty('--hint-countdown-rot', `${direction * tilt}deg`);
        if (hintClickCount >= 10) {
            hintClickCount = 0;
            showHintPanel();
        }
    });
}

function isWelcomeVisible() {
    return !!(welcomeSection && welcomeSection.classList.contains('is-visible'));
}

function createConfettiPiece(x, y, vx, vy) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';

    const size = 6 + Math.random() * 7;
    const height = size * (1.4 + Math.random() * 2);
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const patternAngle = Math.floor(Math.random() * 180);
    const patternSize = 6 + Math.random() * 6;

    piece.style.setProperty('--size', `${size}px`);
    piece.style.setProperty('--height', `${height}px`);
    piece.style.setProperty('--color', color);
    piece.style.setProperty('--pattern-angle', `${patternAngle}deg`);
    piece.style.setProperty('--pattern-size', `${patternSize}px`);
    piece.style.borderRadius = Math.random() > 0.75 ? '999px' : '4px';

    const rotation = Math.random() * 360;
    piece.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
    celebrationLayer.appendChild(piece);

    return {
        el: piece,
        x,
        y,
        vx,
        vy,
        rotation,
        spin: (Math.random() * 2 - 1) * 420,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 2 + Math.random() * 3,
        wobbleAmp: 8 + Math.random() * 14,
        life: 0,
        ttl: 4.2 + Math.random() * 2.2
    };
}

function startConfettiAnimation() {
    if (!confettiParticles.length) return;
    if (confettiAnimationFrame) return;
    confettiLastTime = performance.now();

    const step = (now) => {
        const dt = Math.min(0.033, (now - confettiLastTime) / 1000);
        confettiLastTime = now;

        const width = window.innerWidth;
        const height = window.innerHeight;

        confettiParticles = confettiParticles.filter((p) => {
            p.life += dt;
            p.vx -= p.vx * CONFETTI_DRAG * dt;
            p.vy += CONFETTI_GRAVITY * dt;
            p.vy -= p.vy * (CONFETTI_DRAG * 0.4) * dt;

            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.rotation += p.spin * dt;
            p.wobble += p.wobbleSpeed * dt;

            const wobbleX = Math.sin(p.wobble) * p.wobbleAmp;
            p.el.style.transform = `translate3d(${p.x + wobbleX}px, ${p.y}px, 0) rotate(${p.rotation}deg)`;

            const lifeRatio = p.life / p.ttl;
            if (lifeRatio > 0.7) {
                p.el.style.opacity = `${Math.max(0, 1 - (lifeRatio - 0.7) / 0.3)}`;
            }

            if (p.life > p.ttl) {
                p.el.remove();
                return false;
            }

            const outBottom = p.y > height + 120 && p.vy > 0;
            const outTop = p.y < -120 && p.vy < 0;
            const outLeft = p.x < -120 && p.vx < 0;
            const outRight = p.x > width + 120 && p.vx > 0;
            if (outBottom || outTop || outLeft || outRight) {
                p.el.remove();
                return false;
            }

            return true;
        });

        if (confettiParticles.length) {
            confettiAnimationFrame = requestAnimationFrame(step);
        } else {
            confettiAnimationFrame = null;
        }
    };

    confettiAnimationFrame = requestAnimationFrame(step);
}

function spawnBurst({ x, y, count, angle, spread, speedMin, speedMax }) {
    for (let i = 0; i < count; i++) {
        const speed = speedMin + Math.random() * (speedMax - speedMin);
        const theta = angle + (Math.random() - 0.5) * spread;
        const vx = Math.cos(theta) * speed;
        const vy = Math.sin(theta) * speed;
        confettiParticles.push(createConfettiPiece(x, y, vx, vy));
    }
}

function spawnConfetti() {
    if (!celebrationLayer) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const leftCannon = { x: width * 0.18, y: height + 20 };
    const rightCannon = { x: width * 0.82, y: height + 20 };
    const centerTop = { x: width * 0.5, y: -20 };
    const centerBottom = { x: width * 0.5, y: height + 20 };

    spawnBurst({
        x: leftCannon.x,
        y: leftCannon.y,
        count: 26,
        angle: -Math.PI / 2,
        spread: 1.2,
        speedMin: 360,
        speedMax: 720
    });
    spawnBurst({
        x: rightCannon.x,
        y: rightCannon.y,
        count: 26,
        angle: -Math.PI / 2,
        spread: 1.2,
        speedMin: 360,
        speedMax: 720
    });

    confettiTimers.push(setTimeout(() => {
        spawnBurst({
            x: centerTop.x,
            y: centerTop.y,
            count: 22,
            angle: Math.PI / 2,
            spread: 2.4,
            speedMin: 160,
            speedMax: 320
        });
        startConfettiAnimation();
    }, 200));

    confettiTimers.push(setTimeout(() => {
        spawnBurst({
            x: centerBottom.x,
            y: centerBottom.y,
            count: 18,
            angle: -Math.PI / 2,
            spread: 1.4,
            speedMin: 260,
            speedMax: 540
        });
        startConfettiAnimation();
    }, 520));

    confettiTimers.push(setTimeout(() => {
        spawnBurst({
            x: leftCannon.x + 40,
            y: height + 10,
            count: 14,
            angle: -Math.PI / 2,
            spread: 1.1,
            speedMin: 240,
            speedMax: 520
        });
        spawnBurst({
            x: rightCannon.x - 40,
            y: height + 10,
            count: 14,
            angle: -Math.PI / 2,
            spread: 1.1,
            speedMin: 240,
            speedMax: 520
        });
        startConfettiAnimation();
    }, 760));

    startConfettiAnimation();
}

function triggerCelebration(originRect) {
    clearCelebration();
    spawnConfetti();
    celebrationCleanupTimer = setTimeout(() => {
        clearCelebration();
    }, 6000);
}

function getDistanceLevel(distance) {
    for (let i = DISTANCE_LEVELS.length - 1; i >= 0; i--) {
        if (distance >= DISTANCE_LEVELS[i]) {
            return i + 1;
        }
    }
    return 0;
}



async function process_message(name, nickname_color, word, force_win = false) {

    if (is_game_finished) return;

    word = word.toLowerCase().replace(/\u0451/g, '\u0435');

    const isChecked = checked_words.has(word);
    const isPending = pending_words.has(word);
    if (isChecked || isPending) {
        console.log(`Слово "${word}" не найдено.`);
        const last_words_container = document.querySelector('.guessing .last-words');

        const html = `
            <div class="msg msg-used">
                <span class="word">${escapeHtml(word)}</span>
                <span class="status">уже было использовано</span>
            </div>
        `;
        last_words_container.insertAdjacentHTML('afterbegin', html);
        return;
    }

    if (iwawwa.has(word)) {
        const last_words_container = document.querySelector('.guessing .last-words');
        const pig = iwawwa_img[Math.floor(Math.random() * iwawwa_img.length)];
        const html = `
            <div class="msg">
                <div class="bg"></div>
                <div class="iwawwa">
                    <div class="word"><img src="assets/img/iwawwa_1.avif" alt=""></div>
                    <div class="distance"><img src="assets/img/${pig}" alt=""></div>
                </div>
            </div>
        `;
        last_words_container.insertAdjacentHTML('afterbegin', html);
        return;
    }

    console.log(`Слово "${word}" не найдено.`);

    pending_words.add(word);
    let word_check;
    try {
        if (force_win) {
            word_check = { distance: 1 };
        } else {
            word_check = await kontekstno_query('score', word, secret_word_id);
        }
    } catch (error) {
        pending_words.delete(word);
        throw error;
    }

    if (!word_check.distance) {
        console.log(`Слово "${word}" не найдено.`);
        pending_words.delete(word);
        return;
    }

    if (checked_words.has(word)) {
        pending_words.delete(word);
        return;
    }

    if (word_check.distance == 1) {
        handle_win(name);
    }

    const best_match_container = document.querySelector('.guessing .best-match');

    const new_message = message_template(word, word_check.distance, name, nickname_color);

    console.log(word_check);

    checked_words.add(word);
    pending_words.delete(word);
    round_words_count += 1;
    updateTotalWords();

    const last_words_container = document.querySelector('.guessing .last-words');
    last_words_container.insertAdjacentHTML('afterbegin', new_message);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = new_message.trim();
    const newMsgElement = tempDiv.firstElementChild;

    const container = best_match_container;
    const children = Array.from(container.children);
    let insertIndex = children.length;
    const newDistance = parseFloat(word_check.distance);

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


function message_template(word, distance, name, nickname_color) {

    const numericDistance = Number(distance);
    const safeDistance = Number.isFinite(numericDistance) ? numericDistance : 0;
    const width = Math.max(0, 100 - (safeDistance / 2800) * 100);
    const distance_level = getDistanceLevel(safeDistance);
    const safeWord = escapeHtml(word);
    const safeName = escapeHtml(name);
    const safeColor = sanitizeColor(nickname_color);

    return `
        <div class="msg distance-level-${distance_level}" data-distance="${safeDistance}">
            <div class="bg" style="width: ${width}%"></div>
            <div class="word-and-distance">
                <div class="word">${safeWord}</div>
                <div class="distance">${safeDistance}</div>
            </div>
            <div class="name" style="color: ${safeColor}">
                <span>${safeName}</span>
            </div>
        </div>
    `;
}

function handle_win(winner_name) {
    is_game_finished = true;

    if (typeof window.stopRoundHints === 'function') {
        window.stopRoundHints();
    }

    if (typeof updateLeaderboard === 'function') {
        updateLeaderboard(winner_name);
        if (typeof window.showLeaderboardPanel === 'function') {
            window.showLeaderboardPanel();
        } else {
            const leaderboardSection = document.getElementById('leaderboard');
            if (leaderboardSection) leaderboardSection.style.display = 'flex';
        }
    }

    document.getElementById('winner-avatar').src = '';
    getTwitchUserData(winner_name).then((user) => {
        console.log(user);
        document.getElementById('winner-avatar').src = user.logo;
    });

    const winnerBlock = document.getElementById('winner');
    winnerBlock.querySelector('.winner-name').innerText = winner_name;
    winnerBlock.style.display = 'block';
    triggerCelebration(winnerBlock.getBoundingClientRect());

    const restartSeconds = Math.max(1, Number.parseInt(restart_time, 10) || 20);
    showRestartTimer(restartSeconds);
    const timeout = restartSeconds * 1000;

    setTimeout(async () => {
        try {
            secret_word_id = await generate_secret_word();
            if (typeof window.startRoundHints === 'function') {
                window.startRoundHints();
            }
        } catch (e) {
            console.error(e);
        }

        document.querySelector('.guessing .last-words').innerHTML = '';
        document.querySelector('.guessing .best-match').innerHTML = '';
        checked_words.clear();
        round_words_count = 0;
        updateTotalWords();
        winnerBlock.style.display = 'none';
        hideRestartTimer();
        clearCelebration();

        if (typeof window.hideLeaderboardPanel === 'function') {
            window.hideLeaderboardPanel();
        } else {
            const leaderboardSection = document.getElementById('leaderboard');
            if (leaderboardSection) leaderboardSection.style.display = 'none';
        }

        is_game_finished = false;
    }, timeout);
}

document.getElementById('test-win-btn').addEventListener('click', () => {
    const randomSuffix = Math.floor(Math.random() * 10000);
    process_message('TestUser', '#FFFFFF', 'WinWord' + randomSuffix, true);
});

document.getElementById('menu-button-settings').addEventListener('click', () => {
    if (isWelcomeVisible()) return;
    const settingsSection = document.getElementById('settings');
    settingsSection.style.display = 'block';
});
document.getElementById('menu-button-info').addEventListener('click', () => {
    showInfoPanel();
});

const settingsCloseBtn = document.getElementById('settings-close-btn');
if (settingsCloseBtn) {
    settingsCloseBtn.addEventListener('click', () => {
        const settingsSection = document.getElementById('settings');
        if (settingsSection) settingsSection.style.display = 'none';
    });
}

const infoCloseBtn = infoSection ? infoSection.querySelector('.info-close') : null;
if (infoCloseBtn) {
    infoCloseBtn.addEventListener('click', () => {
        hideInfoPanel();
    });
}


