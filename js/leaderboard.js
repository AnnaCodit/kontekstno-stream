// Leaderboard Logic
const LEADERBOARD_KEY = 'word_game_leaderboard';

function getLeaderboardData() {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    return data ? JSON.parse(data) : {};
}

function saveLeaderboardData(data) {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(data));
}

function updateLeaderboard(winnerName) {
    const data = getLeaderboardData();
    if (data[winnerName]) {
        data[winnerName]++;
    } else {
        data[winnerName] = 1;
    }
    saveLeaderboardData(data);
    renderLeaderboard();
}

function renderLeaderboard() {
    const data = getLeaderboardData();
    const listContainer = document.querySelector('#leaderboard .list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    // Convert to array and sort
    const sortedWinners = Object.entries(data)
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .slice(0, 5); // Take top 5

    if (sortedWinners.length === 0) {
        listContainer.innerHTML = '<div style="text-align: center; color: #777;">Пока нет победителей</div>';
        return;
    }

    sortedWinners.forEach((item, index) => {
        const name = item[0];
        const wins = item[1];

        const itemDiv = document.createElement('div');
        itemDiv.className = 'leaderboard-item';

        const rankDiv = document.createElement('div');
        rankDiv.className = 'rank';
        rankDiv.textContent = `#${index + 1}`;
        itemDiv.appendChild(rankDiv);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'name';
        nameDiv.textContent = name; // Safe assignment
        itemDiv.appendChild(nameDiv);

        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'score';
        scoreDiv.textContent = `${wins} 🏆`;
        itemDiv.appendChild(scoreDiv);

        listContainer.appendChild(itemDiv);
    });
}

function resetLeaderboard() {
    if (confirm('Вы уверены, что хотите сбросить таблицу лидеров?')) {
        localStorage.removeItem(LEADERBOARD_KEY);
        renderLeaderboard();
    }
}
