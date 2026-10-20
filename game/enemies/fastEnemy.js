class FastEnemy extends Enemy {
    constructor(x, y, game) {
        super(x, y, game);
        this.health = 50;
        this.maxHealth = 50;
        this.speed = windowWidth / 350;
        this.damage = 5;
        this.size = 0.7;
        this.color = color(255, 200, 60);
    }
}
