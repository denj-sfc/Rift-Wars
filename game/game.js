class Game {
    constructor(laneWidth, laneHeight, isOpponent = false) {
        this.playerMoney = 300;
        this.playerLives = 100;
        this.gridHeight = 40;
        this.gridWidth = 40;
        this.enemies = [];
        this.towers = [];
        this.grid = [];
        this.smartSpawnTimer = null;
        this.moneyTimer = null;
        this.gameRunning = false;
        this.isOpponent = isOpponent;
        this.oppPosIndex = 0;
        this.resize(laneWidth, laneHeight);
        this.amount = 250;
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
        this.path = [
            { x: 6, y: laneHeight / 4 },
            { x: laneWidth / 2, y: laneHeight / 4 },
            { x: laneWidth / 2, y: (laneHeight * 3) / 4 },
            { x: laneWidth - 6, y: (laneHeight * 3) / 4 },
        ];
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
        strokeWeight(Math.max(8, Math.min(this.cellHeight, this.cellWidth)));
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

    spawnEnemy(enemyClass) {
        this.enemies.push(new enemyClass(this.path[0].x, this.path[0].y, this));
    }

    startGameTimers() {
        this.stopGameTimers();
        this.gameRunning = true;
        this.updateMoney();
        if (this.isOpponent) {
            this.smartSpawnTimer = setInterval(() => {
                if (this.gameRunning && this.enemies.length > 0) smartSpawn(this);
                if (this.oppPosIndex >= oppPos.length) {
                    clearInterval(this.smartSpawnTimer);
                    this.smartSpawnTimer = null;
                }
            }, 2000);
        }
    }

    stopGameTimers() {
        this.gameRunning = false;
        if (this.smartSpawnTimer !== null) clearInterval(this.smartSpawnTimer);
        if (this.moneyTimer !== null) clearInterval(this.moneyTimer);
        this.smartSpawnTimer = null;
        this.moneyTimer = null;
    }

    spawnTower(x, y, towerClass = BasicTower) {
        const tower = new towerClass(x, y, this);
        if (this.playerMoney < tower.cost) return false;
        this.towers.push(tower);
        this.playerMoney -= tower.cost;
        return true;
    }

    updateMoney() {
        if (!this.gameRunning) return;
        this.moneyTimer = setTimeout(() => {
            if (this.gameRunning) {
                this.playerMoney += this.amount;
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
    const laneWidth = Math.max(1, (width - sidebarWidth) / 2);
    const laneHeight = Math.max(1, height - bottomBarHeight);
    player1Game = new Game(laneWidth, laneHeight);
    player2Game = new Game(laneWidth, laneHeight, true);
    games = [player1Game, player2Game];
    waveManager = new WaveManager(games);
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
    stroke(200);
    strokeWeight(2);
    line(sidebarWidth + games[0].laneWidth, 0, sidebarWidth + games[0].laneWidth, height - bottomBarHeight);
    document.getElementById("player1Money").textContent = player1Game.playerMoney;
    document.getElementById("player1Health").textContent = player1Game.playerLives;
    document.getElementById("player2Health").textContent = player2Game.playerLives;
    document.getElementById("player2Money").textContent = player2Game.playerMoney;
    document.getElementById("eco").textContent = player1Game.amount;
    document.getElementById("waveNumber").textContent = waveManager.wave;
    document.getElementById("enemiesLeft").textContent = waveManager.queue.length + player1Game.enemies.length;
    if (waveManager.queue.length) {
        document.getElementById("waveCountdown").textContent = "-";
    } else {
        document.getElementById("waveCountdown").textContent = Math.ceil(waveManager.countdown / 1000) + "s";
    }
    if (gameRunning && games.some((game) => game.playerLives <= 0)) {
        gameOver(player1Game.playerLives <= 0 ? "OPPONENT" : "PLAYER");
    }
}

function mousePressed(event) {
    if (!gameRunning || !event || event.target.id !== "gameCanvas") return;
    const x = mouseX - sidebarWidth;
    if (x >= 0 && x < player1Game.laneWidth && mouseY >= 0 && mouseY < player1Game.laneHeight) {
        selectTower(towerType);
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
        game.resize(Math.max(1, (width - sidebarWidth) / 2), Math.max(1, height - bottomBarHeight));
    }
    redraw();
}

function selectTower(towerType) {
    if (!gameRunning) return;
    let towerClass;
    switch (towerType) {
        case "basic":
            towerClass = BasicTower;
            break;
        case "tank":
            towerClass = TankTower;
            break;
        default:
            return;
    }
    const x = mouseX - sidebarWidth;
    if (x >= 0 && x < player1Game.laneWidth && mouseY >= 0 && mouseY < player1Game.laneHeight) {
        player1Game.spawnTower(x, mouseY, towerClass);
    }
}
