class Game {
    constructor(laneWidth, laneHeight, isOpponent = false) {
        this.playerMoney = 300;
        this.playerLives = 100;
        this.gridHeight = 200;
        this.gridWidth = 200;
        this.unitsAcross = 40; // towers, enemies and the path are sized from this
        this.enemies = [];
        this.towers = [];
        this.grid = [];
        this.opponentTimer = null;
        this.moneyTimer = null;
        this.gameRunning = false;
        this.isOpponent = isOpponent;
        this.resize(laneWidth, laneHeight);
        this.amount = 250;
        this.sendTimer = 0;
        // statistics for this game
        this.enemiesDefeated = 0;
        this.towersPlaced = 0;
        this.moneyEarned = 0;
    }

    resize(laneWidth, laneHeight) {
        const scaleX = this.laneWidth ? laneWidth / this.laneWidth : 1;
        const scaleY = this.laneHeight ? laneHeight / this.laneHeight : 1;
        for (const entity of [...this.enemies, ...this.towers]) {
            entity.x *= scaleX;
            entity.y *= scaleY;
        }
        this.laneWidth = laneWidth;
        this.laneHeight = laneHeight;
        this.cellWidth = laneWidth / this.gridWidth;
        this.cellHeight = laneHeight / this.gridHeight;
        this.unitWidth = laneWidth / this.unitsAcross;
        this.unitHeight = laneHeight / this.unitsAcross;
        this.path = [
            { x: 6, y: laneHeight / 4 },
            { x: laneWidth / 2, y: laneHeight / 4 },
            { x: laneWidth / 2, y: (laneHeight * 3) / 4 },
            { x: laneWidth - 6, y: (laneHeight * 3) / 4 },
        ];
        this.pathSamples = samplePath(this.path, Math.min(this.unitWidth, this.unitHeight));
        this.clearance = Math.max(this.unitWidth, this.unitHeight) * 1.5;
        this.createGrid();
    }

    draw() {
        this.drawPath();
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (this.gameRunning) enemy.update();
            if (this.enemies.includes(enemy)) enemy.draw();
        }
        for (const tower of this.towers) tower.draw();
        noStroke();
    }

    drawPath() {
        stroke(120);
        strokeWeight(Math.max(8, Math.min(this.unitHeight, this.unitWidth)));
        for (let i = 0; i < this.path.length - 1; i++) {
            line(this.path[i].x, this.path[i].y, this.path[i + 1].x, this.path[i + 1].y);
        }
    }

    createGrid() {
        this.grid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid.push({
                    x: (x + 0.5) * this.cellWidth,
                    y: (y + 0.5) * this.cellHeight,
                });
            }
        }
    }

    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) this.enemies.splice(index, 1);
    }

    defeatEnemy(enemy) {
        if (!this.enemies.includes(enemy)) return;
        enemy.onDefeat();
        this.removeEnemy(enemy);
        this.playerMoney += enemy.reward;
        this.moneyEarned += enemy.reward;
        this.enemiesDefeated++;
    }

    spawnEnemy(enemyClass) {
        this.enemies.push(new enemyClass(this.path[0].x, this.path[0].y, this));
    }

    // pays to send an enemy into another lane and raises this player's income
    sendEnemy(option, targetGame) {
        if (this.playerMoney < option.cost) return false;
        this.playerMoney -= option.cost;
        this.amount += option.income;
        targetGame.spawnEnemy(option.type);
        return true;
    }

    startGameTimers() {
        this.stopGameTimers();
        this.gameRunning = true;
        this.updateMoney();
        if (this.isOpponent) {
            this.opponentTimer = setInterval(() => {
                if (this.gameRunning) reactiveOpponent(this);
            }, opponentTickRate);
        }
    }

    stopGameTimers() {
        this.gameRunning = false;
        if (this.opponentTimer !== null) clearInterval(this.opponentTimer);
        if (this.moneyTimer !== null) clearInterval(this.moneyTimer);
        this.opponentTimer = null;
        this.moneyTimer = null;
    }

    // inside the lane, off the path and not too close to another tower
    canPlaceTower(x, y) {
        const margin = Math.min(this.unitWidth, this.unitHeight);
        if (x < margin || x > this.laneWidth - margin || y < margin || y > this.laneHeight - margin) return false;
        if (!isClearOf({ x: x, y: y }, this.pathSamples, this.clearance)) return false;
        return isClearOf({ x: x, y: y }, this.towers, this.clearance);
    }

    spawnTower(x, y, towerClass = BasicTower) {
        if (!this.canPlaceTower(x, y)) return false;
        const tower = new towerClass(x, y, this);
        if (this.playerMoney < tower.cost) return false;

        this.towers.push(tower);
        this.playerMoney -= tower.cost;
        this.towersPlaced++;
        return true;
    }

    upgradeTower(tower) {
        if (tower.level >= tower.maxLevel) return false;
        const cost = tower.getUpgradeCost();
        if (this.playerMoney < cost) return false;

        this.playerMoney -= cost;
        tower.upgrade();
        return true;
    }

    towerAt(x, y) {
        for (const tower of this.towers) {
            if (isWithin(tower, { x: x, y: y }, Math.max(this.unitWidth, this.unitHeight))) return tower;
        }
        return null;
    }

    updateMoney() {
        if (!this.gameRunning) return;
        this.moneyTimer = setTimeout(() => {
            if (this.gameRunning) {
                this.playerMoney += this.amount;
                this.moneyEarned += this.amount;
                this.updateMoney();
            }
        }, 6000);
    }
}

let games = [];
const sidebarWidth = window.innerWidth * 0.15;
const bottomBarHeight = window.innerHeight * 0.1;
const topBarHeight = window.innerHeight * 0.1;
const topBarWidth = (window.innerWidth * 0.7) / 8;
document.documentElement.style.setProperty("--sidebar-width", `${sidebarWidth}px`);
document.documentElement.style.setProperty("--bottom-bar-height", `${bottomBarHeight}px`);
document.documentElement.style.setProperty("--top-bar-height", `${topBarHeight}px`);
document.documentElement.style.setProperty("--top-bar-width", `${topBarWidth}px`);

function resetGames() {
    stopGameTimers();
    const lanes = gameMode === "survival" ? 1 : 2;
    const laneWidth = Math.max(1, (width - sidebarWidth) / lanes);
    const laneHeight = Math.max(1, height - bottomBarHeight);
    player1Game = new Game(laneWidth, laneHeight);
    if (gameMode === "survival") {
        player2Game = null;
        games = [player1Game];
    } else {
        player2Game = new Game(laneWidth, laneHeight, true);
        games = [player1Game, player2Game];
    }
    waveManager = new WaveManager(games);
    selectedTower = null;
    towerType = null;

    setVisible("player2UI", gameMode !== "survival");
    setVisible("sendPanel", gameMode !== "survival");
    document.getElementById("gameModeText").textContent = gameMode === "survival" ? "SURVIVAL" : "VS AI";
    document.getElementById("player1Name").textContent = profile.name;
}

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("gameContainer");
    canvas.id("gameCanvas");
    resizeCanvas(windowWidth, windowHeight, true);
    angleMode(RADIANS);
    resetGames();
    noLoop();
}

function draw() {
    background(30);
    if (gameRunning) waveManager.update(Math.min(deltaTime, 100));
    for (let i = 0; i < games.length; i++) {
        push();
        translate(sidebarWidth + i * games[i].laneWidth, 0);
        games[i].draw();
        pop();
    }
    if (games.length > 1) {
        stroke(200);
        strokeWeight(2);
        line(sidebarWidth + games[0].laneWidth, 0, sidebarWidth + games[0].laneWidth, height - bottomBarHeight);
    }
    drawPlacementPreview();
    updateUI();
    if (gameRunning) checkGameOver();
}

function checkGameOver() {
    if (player1Game.playerLives <= 0) {
        if (player2Game) gameOver("OPPONENT WINS!", false);
        else gameOver("YOU REACHED WAVE " + waveManager.wave, false);
    } else if (player2Game && player2Game.playerLives <= 0) {
        gameOver(profile.name + " WINS!", true);
    }
}

// shows where the chosen tower would go: green if it can be placed, red if not
function drawPlacementPreview() {
    const towerClass = getTowerClass(towerType);
    const x = mouseX - sidebarWidth;
    if (!gameRunning || !towerClass) return;
    if (x < 0 || x >= player1Game.laneWidth || mouseY < 0 || mouseY >= player1Game.laneHeight) return;

    const preview = new towerClass(x, mouseY, player1Game);
    const valid = player1Game.canPlaceTower(x, mouseY) && player1Game.playerMoney >= preview.cost;
    push();
    translate(sidebarWidth, 0);
    if (valid) stroke(0, 255, 0);
    else stroke(255, 0, 0);
    strokeWeight(2);
    noFill();
    circle(x, mouseY, preview.range * 2);
    circle(x, mouseY, player1Game.clearance);
    pop();
}

function updateUI() {
    document.getElementById("player1Money").textContent = player1Game.playerMoney;
    document.getElementById("player1Health").textContent = player1Game.playerLives;
    if (player2Game) {
        document.getElementById("player2Health").textContent = player2Game.playerLives;
        document.getElementById("player2Money").textContent = player2Game.playerMoney;
    }
    document.getElementById("eco").textContent = player1Game.amount;
    document.getElementById("waveNumber").textContent = waveManager.wave;
    document.getElementById("enemiesLeft").textContent = waveManager.queue.length + player1Game.enemies.length;
    if (waveManager.queue.length) {
        document.getElementById("waveCountdown").textContent = "-";
    } else {
        document.getElementById("waveCountdown").textContent = Math.ceil(waveManager.countdown / 1000) + "s";
    }

    if (selectedTower && !player1Game.towers.includes(selectedTower)) selectedTower = null;
    setVisible("towerPanel", selectedTower !== null);
    if (selectedTower) {
        document.getElementById("towerLevel").textContent = selectedTower.level + "/" + selectedTower.maxLevel;
        document.getElementById("towerDamage").textContent = selectedTower.damage;
        document.getElementById("towerRange").textContent = selectedTower.range;
        document.getElementById("towerFireRate").textContent = selectedTower.fireRate;
        if (selectedTower.level >= selectedTower.maxLevel) {
            document.getElementById("upgradeCost").textContent = "MAX";
        } else {
            document.getElementById("upgradeCost").textContent = selectedTower.getUpgradeCost();
        }
        document.getElementById("targetingMode").textContent = targetingModes[selectedTower.targeting].toUpperCase();
    }
}

function mousePressed(event) {
    if (!gameRunning || !event || event.target.id !== "gameCanvas") return;
    const x = mouseX - sidebarWidth;
    if (x >= 0 && x < player1Game.laneWidth && mouseY >= 0 && mouseY < player1Game.laneHeight) {
        if (towerType) selectTower(towerType);
        else selectedTower = player1Game.towerAt(x, mouseY);
    }
    towerType = null;
}

function keyPressed() {
    if (keyCode === ESCAPE) {
        if (gameRunning) pauseGame();
        else if (!document.getElementById("pauseMenu").classList.contains("hidden")) resumeGame();
        return false;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight, true);
    for (const game of games) {
        game.resize(Math.max(1, (width - sidebarWidth) / games.length), Math.max(1, height - bottomBarHeight));
    }
    redraw();
}

function getTowerClass(towerType) {
    switch (towerType) {
        case "basic":
            return BasicTower;
        case "tank":
            return TankTower;
        case "splash":
            return SplashTower;
        default:
            return null;
    }
}

function selectTower(towerType) {
    if (!gameRunning) return;
    const towerClass = getTowerClass(towerType);
    if (!towerClass) return;
    const x = mouseX - sidebarWidth;
    if (x >= 0 && x < player1Game.laneWidth && mouseY >= 0 && mouseY < player1Game.laneHeight) {
        player1Game.spawnTower(x, mouseY, towerClass);
    }
}

function upgradeSelectedTower() {
    towerType = null;
    if (!gameRunning || !selectedTower) return;
    player1Game.upgradeTower(selectedTower);
}

function cycleTargeting() {
    towerType = null;
    if (!gameRunning || !selectedTower) return;
    selectedTower.targeting = (selectedTower.targeting + 1) % targetingModes.length;
}

function sendEnemy(name) {
    towerType = null;
    if (!gameRunning || !player2Game) return;
    for (const option of sendableEnemies) {
        if (option.name === name) player1Game.sendEnemy(option, player2Game);
    }
}
