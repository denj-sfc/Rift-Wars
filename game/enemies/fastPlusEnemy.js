class FastPlusEnemy extends FastEnemy {
    constructor(x, y, game) {
        super(x, y, game);
        this.buffRange = 4;
        this.speedBoost = 1.25;
        this.outline = color(255, 255, 255);
    }

    onDefeat() {
        for (const enemy of this.enemiesInRange(this.buffRange)) {
            enemy.speed *= this.speedBoost;
        }
    }

    draw() {
        super.draw();
        stroke(this.outline);
        strokeWeight(2);
        noFill();
        circle(this.x, this.y, this.diameter());
        noStroke();
    }
}
