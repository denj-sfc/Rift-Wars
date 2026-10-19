class Enemy {
    constructor(x, y, game) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.health = 100;
        this.speed = windowWidth / 800;
        this.pathIndex = 1;
        this.value = 100;
        this.damage = 10;
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

    draw() {
        fill(255, 80, 80);
        noStroke();
        circle(this.x, this.y, Math.min(this.game.cellWidth - 5, this.game.cellHeight - 5));

        // draw health above enemy
        let healthBarWidth = this.health / 3;
        let healthBarHeight = 5;

        fill(0, 255, 0); // green
        noStroke();
        rect(this.x - healthBarWidth / 2, this.y - 25, healthBarWidth, healthBarHeight);
    }
}
