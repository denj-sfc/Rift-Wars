// Player profile, lifetime statistics and high scores, saved in the browser's localStorage
const profileKey = "riftWarsProfile";
const maxHighScores = 5;

function newProfile() {
    return {
        name: "PLAYER",
        gamesPlayed: 0,
        wins: 0,
        enemiesDefeated: 0,
        towersPlaced: 0,
        moneyEarned: 0,
        highestWave: 0,
        mostEnemiesDefeated: 0,
        highScores: [], // best survival runs: { name, wave, enemies }
    };
}

function loadProfile() {
    const saved = localStorage.getItem(profileKey);
    if (saved === null) return newProfile();
    return { ...newProfile(), ...JSON.parse(saved) };
}

function saveProfile() {
    localStorage.setItem(profileKey, JSON.stringify(profile));
}

let profile = loadProfile();
document.getElementById("playerName").value = profile.name;

function saveProfileName() {
    const name = document.getElementById("playerName").value.trim().toUpperCase();
    profile.name = name || "PLAYER";
    document.getElementById("playerName").value = profile.name;
    saveProfile();
}

// adds a survival run to the high score table, keeping it sorted by wave
function addHighScore(score) {
    let index = profile.highScores.length;
    for (let i = 0; i < profile.highScores.length; i++) {
        if (score.wave > profile.highScores[i].wave) {
            index = i;
            break;
        }
    }
    profile.highScores.splice(index, 0, score);
    if (profile.highScores.length > maxHighScores) profile.highScores.splice(maxHighScores);
}

// called once when a game ends
function recordGame(won) {
    profile.gamesPlayed++;
    if (won) profile.wins++;
    profile.enemiesDefeated += player1Game.enemiesDefeated;
    profile.towersPlaced += player1Game.towersPlaced;
    profile.moneyEarned += player1Game.moneyEarned;
    if (waveManager.wave > profile.highestWave) profile.highestWave = waveManager.wave;
    if (player1Game.enemiesDefeated > profile.mostEnemiesDefeated) {
        profile.mostEnemiesDefeated = player1Game.enemiesDefeated;
    }
    if (gameMode === "survival") {
        addHighScore({ name: profile.name, wave: waveManager.wave, enemies: player1Game.enemiesDefeated });
    }
    saveProfile();
    showGameStats();
}

// fills in the game over screen
function showGameStats() {
    document.getElementById("gameWave").textContent = waveManager.wave;
    document.getElementById("gameEnemies").textContent = player1Game.enemiesDefeated;
    document.getElementById("gameTowers").textContent = player1Game.towersPlaced;
    document.getElementById("gameMoney").textContent = player1Game.moneyEarned;
    document.getElementById("gameTotalGames").textContent = profile.gamesPlayed;
    document.getElementById("gameTotalWins").textContent = profile.wins;
}

// fills in and opens the statistics menu
function showStats() {
    document.getElementById("statsName").textContent = profile.name;
    document.getElementById("statGames").textContent = profile.gamesPlayed;
    document.getElementById("statWins").textContent = profile.wins;
    document.getElementById("statEnemies").textContent = profile.enemiesDefeated;
    document.getElementById("statTowers").textContent = profile.towersPlaced;
    document.getElementById("statMoney").textContent = profile.moneyEarned;
    document.getElementById("statWave").textContent = profile.highestWave;
    document.getElementById("statMostEnemies").textContent = profile.mostEnemiesDefeated;
    for (let i = 0; i < maxHighScores; i++) {
        const score = profile.highScores[i];
        let text = i + 1 + ". ---";
        if (score) text = `${i + 1}. ${score.name} - WAVE ${score.wave} (${score.enemies} defeated)`;
        document.getElementById("highScore" + i).textContent = text;
    }
    showMenu("statsMenu");
}

function resetStats() {
    const name = profile.name;
    profile = newProfile();
    profile.name = name;
    saveProfile();
    showStats();
}
