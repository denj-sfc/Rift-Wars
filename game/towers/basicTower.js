// targeting priorities a tower can cycle through (S7)
const targetingModes = ["first", "last", "strong", "weak"];

class BasicTower {
    constructor(x, y, game) {
        this.game = game;
        // current position
        this.x = x;
        this.y = y;
        // tower damage
        this.damage = 20;
        // index into targetingModes, defaults to the enemy furthest along the path
        this.targeting = targetingModes.indexOf("first");
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
        // upgrades
        this.level = 1;
        this.maxLevel = 3;
        // where the last shot landed, used to draw the shot
        this.shotX = null;
        this.shotY = null;
        this.shotLength = 100; // milliseconds the shot stays visible
    }

    // picks an enemy in range using the tower's targeting priority
    findTarget() {
        let target = null;
        let bestScore = 0;
        const enemies = this.game.enemies;

        for (let i = 0; i < enemies.length; i++) {
            const enemyDistance = dist(this.x, this.y, enemies[i].x, enemies[i].y);
            if (enemyDistance >= this.range) continue;

            let score;
            switch (targetingModes[this.targeting]) {
                case "first": // furthest along the path
                    score = enemies[i].distanceToEnd();
                    break;
                case "last": // closest to the tower
                    score = enemyDistance;
                    break;
                case "strong": // most health
                    score = -enemies[i].health;
                    break;
                case "weak": // least health
                    score = enemies[i].health;
                    break;
            }

            if (target === null || score < bestScore) {
                bestScore = score;
                target = enemies[i];
            }
        }
        return target;
    }

    hit(enemy, damage) {
        enemy.health -= damage;
        enemy.hitTime = millis();
        if (enemy.health <= 0) this.game.defeatEnemy(enemy);
    }

    attack(target) {
        this.hit(target, this.damage);
    }

    getUpgradeCost() {
        return Math.floor(this.cost * 0.6 * this.level);
    }

    upgrade() {
        this.level++;
        this.damage = Math.floor(this.damage * 1.5);
        this.range = Math.floor(this.range * 1.15);
        this.fireRate = Math.floor(this.fireRate * 0.85);
    }

    draw() {
        const target = this.findTarget();
        const { unitWidth, unitHeight } = this.game;

        // damage enemy every x seconds when targetted
        if (this.game.gameRunning && target && millis() - this.lastAttackTime >= this.fireRate) {
            this.shotX = target.x;
            this.shotY = target.y;
            this.attack(target);
            this.lastAttackTime = millis();
        }

        if (target) {
            this.angle = atan2(target.y - this.y, target.x - this.x);
        }

        // draw shot while it is fresh
        if (this.shotX !== null && millis() - this.lastAttackTime < this.shotLength) {
            this.drawShot();
        }

        // draw tower
        push();
        translate(this.x, this.y);
        rotate(this.angle);

        fill(this.color);
        noStroke();

        triangle(
            Math.min(unitWidth, unitHeight) / 2,
            0,
            -Math.min(unitWidth, unitHeight),
            -unitHeight / 2,
            -Math.min(unitWidth, unitHeight),
            unitHeight / 2,
        );
        fill(255, 255, 0);
        circle(Math.min(unitWidth - 5, unitHeight - 5), 0, 5);

        pop();

        // draw one dot per level under the tower
        fill(255);
        noStroke();
        for (let i = 0; i < this.level; i++) {
            circle(this.x + (i - (this.level - 1) / 2) * 8, this.y + unitHeight, 5);
        }

        // draw tower range, brighter when selected
        if (this === selectedTower) {
            stroke(255);
            strokeWeight(3);
        } else {
            stroke(255, 0, 0);
            strokeWeight(2);
        }
        noFill();
        circle(this.x, this.y, this.range * 2);
    }

    drawShot() {
        stroke(255, 255, 0);
        strokeWeight(3);
        line(this.x, this.y, this.shotX, this.shotY);
    }
}
