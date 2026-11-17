const reserveMoney = 300;
const heavyHealth = 200;
const opponentTickRate = 500; // milliseconds between AI decisions
const minTowers = 3; // always build up to this many towers first
const maxTowers = 10; // stop building and only upgrade past this many
const crowdSize = 8; // enemies on the path before a splash tower is worth it
const sendDelay = 4000; // milliseconds between AI enemy sends

// Rule-based opponent (S2). Each tick it reads the game state and takes at most one action:
// 1. under attack or too few towers -> place a tower
// 2. strong enemies on the path or coming in the wave, or tower limit reached -> upgrade a tower
// 3. send timer ready and spare money -> send an enemy to the player
// 4. otherwise -> place a tower
function reactiveOpponent(game) {
    if (!game.isOpponent) return;

    let enemyHealth = 0;
    let heavyEnemy = false;
    for (let i = 0; i < game.enemies.length; i++) {
        enemyHealth += game.enemies[i].health;
        if (game.enemies[i].health >= heavyHealth) heavyEnemy = true;
    }

    let underAttack = false;
    if (enemyHealth > game.towers.length * 100) underAttack = true;

    const strongerWaveComing = waveManager.queue.includes(TankEnemy) || waveManager.queue.includes(TankPlusEnemy);

    let budget = game.playerMoney;
    if (!underAttack) budget -= reserveMoney;

    game.sendTimer -= opponentTickRate;

    if (underAttack || game.towers.length < minTowers) {
        placeOpponentTower(game, budget, heavyEnemy, underAttack);
        return;
    }

    if (heavyEnemy || strongerWaveComing || game.towers.length >= maxTowers) {
        if (upgradeOpponentTower(game, budget)) return;
    }

    if (game.sendTimer <= 0 && sendOpponentEnemy(game, budget)) {
        game.sendTimer = sendDelay;
        return;
    }

    if (game.towers.length < maxTowers) placeOpponentTower(game, budget, heavyEnemy, underAttack);
}

// upgrades the lowest level tower it can afford
function upgradeOpponentTower(game, budget) {
    let lowest = null;
    for (const tower of game.towers) {
        if (tower.level >= tower.maxLevel) continue;
        if (lowest === null || tower.level < lowest.level) lowest = tower;
    }
    if (lowest === null || budget < lowest.getUpgradeCost()) return false;
    return game.upgradeTower(lowest);
}

// sends the most expensive enemy it can afford into the player's lane
function sendOpponentEnemy(game, budget) {
    let choice = null;
    for (const option of sendableEnemies) {
        if (option.cost > budget) continue;
        if (choice === null || option.cost > choice.cost) choice = option;
    }
    if (choice === null) return false;
    return game.sendEnemy(choice, player1Game);
}

// places a tower on the valid grid cell that covers the most of the enemies' route (S3)
function placeOpponentTower(game, budget, heavyEnemy, underAttack) {
    let tower = new BasicTower(0, 0, game);
    let towerClass = BasicTower;
    const tank = new TankTower(0, 0, game);
    const splash = new SplashTower(0, 0, game);
    if ((heavyEnemy || !underAttack) && budget >= tank.cost) {
        tower = tank;
        towerClass = TankTower;
    } else if (game.enemies.length >= crowdSize && budget >= splash.cost) {
        tower = splash;
        towerClass = SplashTower;
    }
    if (budget < tower.cost) return false;

    let route = game.path;
    if (game.enemies.length > 0) {
        const oldest = game.enemies[0];
        route = [oldest];
        for (let i = oldest.pathIndex; i < game.path.length; i++) {
            route.push(game.path[i]);
        }
    }

    const step = Math.min(game.unitWidth, game.unitHeight);
    const routeSamples = samplePath(route, step);

    let best = null;
    let bestCoverage = 0;
    for (let i = 0; i < game.grid.length; i++) {
        const cell = game.grid[i];
        if (!game.canPlaceTower(cell.x, cell.y)) continue;

        let coverage = 0;
        for (let j = 0; j < routeSamples.length; j++) {
            if (isWithin(cell, routeSamples[j], tower.range)) coverage++;
        }
        if (coverage > bestCoverage) {
            bestCoverage = coverage;
            best = cell;
        }
    }
    if (best === null) return false;
    return game.spawnTower(best.x, best.y, towerClass);
}
