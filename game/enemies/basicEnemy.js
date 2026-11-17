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
        this.reward = 10; // money given to the player who defeats it
        this.hitTime = -1000; // time the enemy was last damaged
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

    // how far the enemy still has to travel along the path
    distanceToEnd() {
        const path = this.game.path;
        if (this.pathIndex >= path.length) return 0;
        let distance = dist(this.x, this.y, path[this.pathIndex].x, path[this.pathIndex].y);
        for (let i = this.pathIndex; i < path.length - 1; i++) {
            distance += dist(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
        }
        return distance;
    }

    enemiesInRange(cells) {
        const radius = cells * Math.min(this.game.unitWidth, this.game.unitHeight);
        return this.game.enemies.filter((enemy) => enemy !== this && dist(this.x, this.y, enemy.x, enemy.y) <= radius);
    }

    draw() {
        // flash white for a moment after being hit
        if (millis() - this.hitTime < 100) fill(255);
        else fill(this.color);
        if (this.outline) {
            stroke(this.outline);
            strokeWeight(2);
        } else {
            noStroke();
        }
        circle(this.x, this.y, Math.min(this.game.unitWidth - 5, this.game.unitHeight - 5) * this.size);

        const fullBarWidth = 100 / 3;
        const healthBarWidth = (this.health / this.maxHealth) * fullBarWidth;
        const healthBarHeight = 5;

        noStroke();
        fill(120, 0, 0);
        rect(this.x - fullBarWidth / 2, this.y - 25, fullBarWidth, healthBarHeight);
        fill(0, 255, 0);
        rect(this.x - fullBarWidth / 2, this.y - 25, healthBarWidth, healthBarHeight);
    }
}
