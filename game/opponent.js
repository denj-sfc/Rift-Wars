const reserveMoney = 300;
const heavyHealth = 200;

function samplePath(points, step) {
    const samples = [];
    for (let i = 0; i < points.length - 1; i++) {
        const length = dist(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
        for (let travelled = 0; travelled < length; travelled += step) {
            samples.push({
                x: points[i].x + ((points[i + 1].x - points[i].x) * travelled) / length,
                y: points[i].y + ((points[i + 1].y - points[i].y) * travelled) / length,
            });
        }
    }
    return samples;
}

function isWithin(a, b, distance) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy < distance * distance;
}

function isClearOf(cell, others, clearance) {
    for (let i = 0; i < others.length; i++) {
        if (isWithin(cell, others[i], clearance)) return false;
    }
    return true;
}

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

    let budget = game.playerMoney;
    if (!underAttack) budget -= reserveMoney;

    let tower = new BasicTower(0, 0, game);
    let towerClass = BasicTower;
    const tank = new TankTower(0, 0, game);
    if ((heavyEnemy || !underAttack) && budget >= tank.cost) {
        tower = tank;
        towerClass = TankTower;
    }
    if (budget < tower.cost) return;

    // only count the path still ahead of the oldest enemy
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
    const pathSamples = samplePath(game.path, step);
    const clearance = Math.max(game.unitWidth, game.unitHeight) * 1.5;

    let best = null;
    let bestCoverage = 0;
    for (let i = 0; i < game.grid.length; i++) {
        const cell = game.grid[i];
        if (!isClearOf(cell, pathSamples, clearance)) continue;
        if (!isClearOf(cell, game.towers, clearance)) continue;

        let coverage = 0;
        for (let j = 0; j < routeSamples.length; j++) {
            if (isWithin(cell, routeSamples[j], tower.range)) coverage++;
        }
        if (coverage > bestCoverage) {
            bestCoverage = coverage;
            best = cell;
        }
    }
    if (best !== null) game.spawnTower(best.x, best.y, towerClass);
}
