const enemyProgression = [
    { type: Enemy, unlock: 1, count: 5, growth: 1.5 },
    { type: FastEnemy, unlock: 3, count: 3, growth: 1 },
    { type: TankEnemy, unlock: 4, count: 1, growth: 0.5 },
    { type: TankPlusEnemy, unlock: 7, count: 1, growth: 0.3 },
    { type: FastPlusEnemy, unlock: 8, count: 1, growth: 0.3 },
];

function waveAlgorithm(wave) {
    const enemies = [];
    for (const enemy of enemyProgression) {
        if (wave >= enemy.unlock) {
            const count = Math.floor(enemy.count + (wave - enemy.unlock) * enemy.growth);
            for (let i = 0; i < count; i++) enemies.push(enemy.type);
        }
    }

    for (let i = enemies.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [enemies[i], enemies[j]] = [enemies[j], enemies[i]];
    }
    return enemies;
}

// enemies a player can pay to send into the other lane (S6)
// income is added to the sender's economy each time
const sendableEnemies = [
    { name: "basic", type: Enemy, cost: 50, income: 10 },
    { name: "fast", type: FastEnemy, cost: 75, income: 15 },
    { name: "tank", type: TankEnemy, cost: 200, income: 40 },
];
