let player1Game;
let player2Game;
let waveManager;

function startGameTimers() {
    for (const game of games) game.startGameTimers();
}

function stopGameTimers() {
    for (const game of games) game.stopGameTimers();
}

// points spaced `step` apart along a path
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
