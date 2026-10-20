class TankPlusEnemy extends TankEnemy {
    constructor(x, y, game) {
        super(x, y, game);
        this.buffRange = 4;
        this.healthBoost = 50;
        this.outline = color(255, 255, 255);
    }

    onDefeat() {
        for (const enemy of this.enemiesInRange(this.buffRange)) {
            enemy.health += this.healthBoost;
            enemy.maxHealth += this.healthBoost;
        }
    }
}
