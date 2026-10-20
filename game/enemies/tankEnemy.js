class TankEnemy extends Enemy {
    constructor(x, y, game) {
        super(x, y, game);
        this.health = 400;
        this.maxHealth = 400;
        this.speed = windowWidth / 2000;
        this.value = 200;
        this.damage = 25;
        this.size = 1.4;
        this.color = color(150, 90, 255);
    }
}
