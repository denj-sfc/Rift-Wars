class BasicTower {
    constructor(x, y, game) {
        this.game = game;
        // current position
        this.x = x;
        this.y = y;
        // tower damage
        this.damage = 20;
        // tower targetting state
        this.targetting = 0;
        // time of the last attack
        this.lastAttackTime = millis();
        // cost to place
        this.cost = 150;
        this.fireRate = 500;
        // angle
        this.angle = 0;
        // range
        this.range = 100;
        //colour
        this.color = color(0, 0, 255);

    }

    draw() {
        let targetX = null;
        let targetY = null;
        let target = null;

        let closestDistance = this.range;
        let enemies = this.game.enemies;
        let { cellWidth, cellHeight } = this.game;

        // find nearest enemy
        for (let i = 0; i < enemies.length; i++) {
            let enemyDistance = dist(this.x, this.y, enemies[i].x, enemies[i].y);

            if (enemyDistance < closestDistance) {
                closestDistance = enemyDistance;
                this.targetting = 1;
                target = enemies[i];
                targetX = enemies[i].x;
                targetY = enemies[i].y;
            }
        }

        // damage enemy every x seconds when targetted
        if (this.game.gameRunning && target && millis() - this.lastAttackTime >= this.fireRate) {
            target.health -= this.damage;
            this.lastAttackTime = millis();

            if (target.health <= 0) {
                this.game.playerMoney += target.value;
                this.game.removeEnemy(target);
            }
        }

        if (targetX !== null && targetY !== null) {
            this.angle = atan2(targetY - this.y, targetX - this.x);
        }

        // draw tower
        push();
        translate(this.x, this.y);
        rotate(this.angle);

        fill(this.color);
        noStroke();

        triangle(
            Math.min(cellWidth, cellHeight)/2,
            0,
            -Math.min(cellWidth, cellHeight),
            -cellHeight/2,
            -Math.min(cellWidth, cellHeight),
            cellHeight/2
        );
        fill(255, 255, 0);
        circle(Math.min(cellWidth-5, cellHeight-5), 0, 5);

        pop();

        // draw tower range
        stroke(255, 0, 0);
        noFill();
        strokeWeight(2);
        circle(this.x, this.y, this.range * 2, 500, 500);
    }
}
