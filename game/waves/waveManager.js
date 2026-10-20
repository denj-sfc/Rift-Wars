class WaveManager {
    constructor(games) {
        this.games = games;
        this.wave = 0;
        this.queue = [];
        this.spawnInterval = 800;
        this.spawnTimer = 0;
        this.countdownLength = 5000;
        this.countdown = this.countdownLength;
    }

    update(dt) {
        if (this.queue.length === 0) {
            this.countdown -= dt;
            if (this.countdown > 0) return;
            this.wave++;
            this.queue = waveAlgorithm(this.wave);
            this.countdown = this.countdownLength;
            this.spawnTimer = 0;
        }

        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            const enemyClass = this.queue.shift();
            for (const game of this.games) game.spawnEnemy(enemyClass);
            this.spawnTimer = this.spawnInterval;
        }
    }
}
