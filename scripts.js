const boardElement = document.querySelector('#board');

const Gameboard = (function () {
    let grid = ['', '', '', '', '', '', '', '', ''];
    let games = [];
    let currentGameIndex;
    let currentPlayer = 0;

    function Player({name = '', mark = 'X'}) {
        let gamesWon = 0;
        const makeMark = (index) => {
            grid[index] = mark;
            renderBoard();
        };

        return {name, mark, gamesWon, makeMark};
    }

    function Game({index = 0, players}) {
        let winner;
        return {index, players, winner};
    }

    function renderBoard(board = boardElement) {
        board.innerHTML = grid.map((cellValue, index) => {
            const row = Math.floor((index / 3));
            const col = index % 3;

            return `<div class="board__cell" data-index="${index}" data-row="${row}" data-col="${col}">${cellValue}</div>`;
        }).join('\n');
    }

    function startNewGame() {
        currentGameIndex = ++currentGameIndex || 0;
        const player1 = Player({});
        const player2 = Player({mark: "O"});
        const game = Game({
            index: currentGameIndex,
            players: [player1, player2]
        });
        games.push(game);
    }

    function makeTurn(event) {
        const element = event.target;
        if (!element.classList.contains('board__cell')) return;
        if (element.textContent) return;

        const currentGame = games[currentGameIndex];
        const cellIndex = element.dataset.index;
        currentGame.players[currentPlayer].makeMark(cellIndex);
        currentPlayer = currentPlayer === 0 ? 1 : 0;
    }

    return {renderBoard, startNewGame, makeTurn};
})();

Gameboard.renderBoard();
Gameboard.startNewGame();

boardElement.addEventListener('click', Gameboard.makeTurn);