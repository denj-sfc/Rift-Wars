class Enemy {
    constructor(x, y, game) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.health = 100;
        this.maxHealth = 100;
        this.speed = windowWidth / 800;
        this.pathIndex = 1;
        this.damage = 10;
        this.size = 1;
        this.color = color(255, 80, 80);
        this.outline = null;
    }

    update() {
        if (this.pathIndex >= this.game.path.length) {
            this.game.playerLives -= this.damage; // damage player
            this.game.removeEnemy(this);
            return;
        }

        const target = this.game.path[this.pathIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
            this.x = target.x;
            this.y = target.y;
            this.pathIndex++;
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    onDefeat() {}

    enemiesInRange(cells) {
        const radius = cells * Math.min(this.game.cellWidth, this.game.cellHeight);
        return this.game.enemies.filter((enemy) => enemy !== this && dist(this.x, this.y, enemy.x, enemy.y) <= radius);
    }

    draw() {
        fill(this.color);
        if (this.outline) {
            stroke(this.outline);
            strokeWeight(2);
        } else {
            noStroke();
        }
        circle(this.x, this.y, Math.min(this.game.cellWidth - 5, this.game.cellHeight - 5) * this.size);

        const healthBarWidth = (this.health / this.maxHealth) * (100 / 3);
        const healthBarHeight = 5;

        fill(0, 255, 0);
        noStroke();
        rect(this.x - healthBarWidth / 2, this.y - 25, healthBarWidth, healthBarHeight);
    }
}
