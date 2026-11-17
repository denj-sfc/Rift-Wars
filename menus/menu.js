let gameRunning = false;
let settingsReturnMenu = "mainMenu";

function hideAllMenus() {
    const menus = document.querySelectorAll(".menu");
    menus.forEach(function (menu) {
        menu.classList.add("hidden");
    });
}

function showMenu(menuID) {
    hideAllMenus();
    document.getElementById("gameContainer").classList.add("hidden");
    document.getElementById(menuID).classList.remove("hidden");
}

function setVisible(id, visible) {
    if (visible) document.getElementById(id).classList.remove("hidden");
    else document.getElementById(id).classList.add("hidden");
}

// mode is "survival" or "competitive"; leave it out to replay the last mode
function startGame(mode) {
    if (mode) gameMode = mode;
    hideAllMenus();
    document.getElementById("gameContainer").classList.remove("hidden");
    gameRunning = true;
    resetGames();
    startGameTimers();
    loop();
}

function pauseGame() {
    if (!gameRunning) {
        return;
    }
    gameRunning = false;
    stopGameTimers();
    noLoop();
    document.getElementById("pauseMenu").classList.remove("hidden");
}

function resumeGame() {
    hideAllMenus();
    document.getElementById("gameContainer").classList.remove("hidden");
    gameRunning = true;
    startGameTimers();
    loop();
}

function returnToMainMenu() {
    gameRunning = false;
    stopGameTimers();
    noLoop();
    showMenu("mainMenu");
}

function gameOver(message, won) {
    gameRunning = false;
    stopGameTimers();
    noLoop();
    document.getElementById("winnerText").textContent = message;
    recordGame(won);
    showMenu("gameOverMenu");
}

function openSettings(fromMenu) {
    settingsReturnMenu = fromMenu;
    hideAllMenus();
    if (fromMenu === "pauseMenu") {
        document.getElementById("gameContainer").classList.remove("hidden");
    } else {
        document.getElementById("gameContainer").classList.add("hidden");
    }
    document.getElementById("settingsMenu").classList.remove("hidden");
}

function closeSettings() {
    hideAllMenus();
    if (settingsReturnMenu === "pauseMenu") {
        document.getElementById("gameContainer").classList.remove("hidden");
    } else {
        document.getElementById("gameContainer").classList.add("hidden");
    }
    document.getElementById(settingsReturnMenu).classList.remove("hidden");
}
