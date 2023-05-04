const boardElement = document.querySelector('#board');

const GameBoard = (function () {
    let grid = ['', '', '', '', '', '', '', '', ''];
    let selectedBoard;
    let games = [];
    let currentGameIndex;
    let currentPlayer = 0;
    let boardFilled = false;

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
        selectedBoard = board;
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
        const playerObj = currentGame.players[currentPlayer];
        const cellIndex = element.dataset.index;
        playerObj.makeMark(cellIndex);
        const winner = checkWinCondition(playerObj.mark);

        if (winner === true) {
            playerObj.gamesWon++;
        } else if (getBoardFilledStatus() === true) {
            selectedBoard.classList.add('board--disabled');
        }

        currentPlayer = currentPlayer === 0 ? 1 : 0;
    }
    
    function getBoardFilledStatus() {
        boardFilled = grid.every(cell => Boolean(cell));
        return boardFilled;
    }

    function checkWinCondition(mark) {
        const gridSliced= getGridLines();
        let allSame = false;

        for (const gridSlicedElement in gridSliced) {
            allSame = gridSliced[gridSlicedElement].every(cell => cell === mark);
            if (allSame === true) {
                colorLine(gridSlicedElement);
                break;
            }
        }

        return allSame;
    }

    function getGridLines() {
        return {
            row0: grid.slice(0, 3),
            row1: grid.slice(3, 6),
            row2: grid.slice(6),
            col0: [grid.at(0), grid.at(3), grid.at(6)],
            col1: [grid.at(1), grid.at(4), grid.at(7)],
            col2: [grid.at(2), grid.at(5), grid.at(8)],
            dia0: [grid.at(0), grid.at(4), grid.at(8)],
            dia1: [grid.at(2), grid.at(4), grid.at(6)]
        }
    }

    function colorLine(lineName) {
        let cells = document.querySelectorAll('.board__cell');

        switch (lineName) {
            case 'dia0':
                cells = [cells[0], cells[4], cells[8]];
                break;
            case 'dia1':
                cells = [cells[2], cells[4], cells[6]];
                break;
            default:
                const direction = lineName.slice(0, 3);
                const value = lineName.slice(-1);
                cells = document.querySelectorAll(`[data-${direction}="${value}"]`);
        }

        cells.forEach(cell => cell.classList.add('board__cell--win'));
    }

    return {renderBoard, startNewGame, makeTurn, getBoardFilledStatus};
})();

GameBoard.renderBoard(boardElement);
GameBoard.startNewGame();

boardElement.addEventListener('click', GameBoard.makeTurn);