class TankTower extends BasicTower {
    constructor(x, y, game) {
        super(x, y, game);
        this.damage = 50;
        this.cost = 300;
        this.range = 150;
        this.fireRate = 1000; // milliseconds
        this.lastAttackTime = millis();
        this.angle = 0;
        this.targetting = 0;
        this.color = color(0, 255, 0); // green
    }
}