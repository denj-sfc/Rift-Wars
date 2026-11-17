class SplashTower extends BasicTower {
    constructor(x, y, game) {
        super(x, y, game);
        this.damage = 15;
        this.cost = 250;
        this.range = 110;
        this.fireRate = 1200; // milliseconds
        this.splashRange = 3; // cells around the target that also take damage
        this.color = color(255, 140, 0); // orange
    }

    // damages the target and every enemy close to it
    attack(target) {
        const nearby = target.enemiesInRange(this.splashRange);
        super.attack(target);
        for (const enemy of nearby) this.hit(enemy, this.damage);
    }

    drawShot() {
        super.drawShot();
        const radius = this.splashRange * Math.min(this.game.unitWidth, this.game.unitHeight);
        stroke(255, 140, 0);
        noFill();
        circle(this.shotX, this.shotY, radius * 2);
    }
}
