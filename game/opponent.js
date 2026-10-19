const oppPos = [
    { column: 16, row: 8 },
    { column: 16, row: 7 },
    { column: 24, row: 28 },
    { column: 25, row: 28 },
];

function smartSpawn(game) {
    if (!game.isOpponent || game.oppPosIndex >= oppPos.length) return;
    const position = oppPos[game.oppPosIndex];
    const cell = game.grid[position.row * game.gridWidth + position.column];
    if (cell && game.spawnTower(cell.x, cell.y)) game.oppPosIndex++;
}
