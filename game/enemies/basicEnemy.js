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
    }

    update() {
        // stop when the enemy reaches the end
        if (this.pathIndex >= this.game.path.length) {
            this.game.playerLives -= this.damage; // damage player
            this.game.removeEnemy(this); // remove the enemy from the game when it reaches the end
            return;
        }

        // get the current target point
        let target = this.game.path[this.pathIndex];
        // work out direction and distance to target
        let dx = target.x - this.x;
        let dy = target.y - this.y;
        let distance = sqrt(dx * dx + dy * dy);

        // snap to point if close enough else move toward it
        if (distance < this.speed) {
            this.x = target.x;
            this.y = target.y;
            this.pathIndex++;
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    // called by a tower when this enemy is killed, before it is removed
    onDefeat() {}

    // other enemies within a radius measured in grid cells
    enemiesInRange(cells) {
        const radius = cells * Math.min(this.game.cellWidth, this.game.cellHeight);
        return this.game.enemies.filter((enemy) => enemy !== this && dist(this.x, this.y, enemy.x, enemy.y) <= radius);
    }

    diameter() {
        return Math.min(this.game.cellWidth - 5, this.game.cellHeight - 5) * this.size;
    }

    draw() {
        fill(this.color);
        noStroke();
        circle(this.x, this.y, this.diameter());

        // draw health above enemy, scaled to max health so every type has the same bar width
        let healthBarWidth = (this.health / this.maxHealth) * (100 / 3);
        let healthBarHeight = 5;

        fill(0, 255, 0); // green
        noStroke();
        rect(this.x - healthBarWidth / 2, this.y - 25, healthBarWidth, healthBarHeight);
    }
}
