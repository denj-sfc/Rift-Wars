let player1Game;
let player2Game;

function startGameTimers() {
    for (const game of games) game.startGameTimers();
}

function stopGameTimers() {
    for (const game of games) game.stopGameTimers();
}
