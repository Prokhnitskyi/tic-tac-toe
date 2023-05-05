const GameBoard = (function () {
  const boardElement = document.querySelector('#board');
  let grid = ['', '', '', '', '', '', '', '', ''];
  let games = [];
  let currentGameIndex;
  let currentPlayer = 0;
  let boardFilled = false;

  function Player ({ name = '', mark = 'X' }) {
    let gamesWon = 0;
    const makeMark = (index) => {
      grid[index] = mark;
      renderBoard();
    };

    return { name, mark, gamesWon, makeMark };
  }

  function Game ({ index = 0, players }) {
    const updateResultsView = () => {
      const player1ResultContainer = getResultsContainer('[data-player="1"]');
      const player2ResultContainer = getResultsContainer('[data-player="2"]');

      player1ResultContainer.name.textContent = players.at(0).name;
      player1ResultContainer.score.textContent = players.at(0).gamesWon;

      player2ResultContainer.name.textContent = players.at(1).name;
      player2ResultContainer.score.textContent = players.at(1).gamesWon;
    };
    const updateScore = () => {
      players[currentPlayer].gamesWon++;
    };
    return { index, players, updateScore, updateResultsView };
  }

  function renderBoard (clean = false) {

    if (clean) {
      grid.forEach((cell, index) => {
        grid[index] = '';
      });
    }

    boardElement.innerHTML = grid.map((cellValue, index) => {
      const row = Math.floor((index / 3));
      const col = index % 3;

      return `<div class="board__cell" data-index="${index}" data-row="${row}" data-col="${col}">${cellValue}</div>`;
    }).join('\n');
  }

  function startNewGame ({samePlayers = false, names = ['Player 1', 'Player 2']} = {samePlayers : false, names : ['Player 1', 'Player 2']}) {
    renderBoard(true);
    boardElement.classList.remove('board--disabled');
    currentGameIndex = ++currentGameIndex || 0;
    const player1 = Player({ name: names[0], mark: '⛌' });
    const player2 = Player({ name: names[1], mark: '◯' });
    const game = Game({
      index: currentGameIndex,
      players: samePlayers ? games[currentGameIndex - 1].players : [player1, player2],
    });
    game.updateResultsView();
    games.push(game);
    boardElement.addEventListener('click', makeTurn);
  }

  function makeTurn (event) {
    const element = event.target;
    if (!element.classList.contains('board__cell')) return;
    if (element.textContent) return;
    const currentGame = games[currentGameIndex];
    const playerObj = currentGame.players[currentPlayer];
    const cellIndex = element.dataset.index;
    playerObj.makeMark(cellIndex);
    const winner = checkWinCondition(playerObj.mark);

    if (winner === true) {
      currentGame.updateScore();
      endRound(`${playerObj.name} won!`);
    } else if (getBoardFilledStatus() === true) {
      boardElement.classList.add('board--disabled');
      endRound('Tie!');
    }

    currentGame.updateResultsView();
    currentPlayer = currentPlayer === 0 ? 1 : 0;
  }

  function endRound (text) {
    boardElement.removeEventListener('click', makeTurn);
    GameConfiguration.showModal(GameConfiguration.selectors.nextRoundModal);
    GameConfiguration.selectors.nextRoundMessage.textContent = text;
  }

  function getBoardFilledStatus () {
    boardFilled = grid.every(cell => Boolean(cell));
    return boardFilled;
  }

  function checkWinCondition (mark) {
    const gridSliced = getGridLines();
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

  function getGridLines () {
    return {
      row0: grid.slice(0, 3),
      row1: grid.slice(3, 6),
      row2: grid.slice(6),
      col0: [grid.at(0), grid.at(3), grid.at(6)],
      col1: [grid.at(1), grid.at(4), grid.at(7)],
      col2: [grid.at(2), grid.at(5), grid.at(8)],
      dia0: [grid.at(0), grid.at(4), grid.at(8)],
      dia1: [grid.at(2), grid.at(4), grid.at(6)],
    };
  }

  function colorLine (lineName) {
    let cells = document.querySelectorAll('.board__cell');
    cells.forEach(cell => cell.classList.add('board__cell--end'));

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

  function getResultsContainer (selector) {
    const container = document.querySelector(selector);
    const name = container.querySelector('.results__name');
    const score = container.querySelector('.results__score');
    return { container, name, score };
  }

  function resetModule () {
    games = [];
    currentGameIndex = -1; // magic number as alternative to assign undefined
    currentPlayer = 0;
    boardFilled = false;
  }

  return { startNewGame, resetModule };
})();

const GameConfiguration = (function () {
  const selectors = {
    nextRoundModal: document.querySelector('#next-round'),
    nextRoundForm: document.querySelector('.next-round-form'),
    nextRoundMessage: document.querySelector('.round_results_text'),
    closeNextRoundBtn: document.querySelector('#next-round-close'),
    startNextRoundBtn: document.querySelector('#next-round-start'),
    singlePlayerBtn: document.querySelector('#single-player'),
    multiplayerBtn: document.querySelector('#multiplayer'),
    resetBtn: document.querySelector('#hard-reset'),
    newGameModal: document.querySelector('#new-game-config'),
    configForm: document.querySelector('.config-modal-form'),
    closeConfigBtn: document.querySelector('#config-close'),
    firstUsernameInput: document.querySelector('#username1'),
    secondUsernameInput: document.querySelector('#username2'),
  };

  function closeModal () {
    this.closest('form').reset();
    this.closest('dialog').close();
  }

  function showModal(modal) {
    setTimeout(() => modal.showModal(),500);
  }

  function initMultiplayer (event) {
    GameBoard.startNewGame({samePlayers: false, names: getNames()});
  }

  function getNames () {
    return [
      selectors.firstUsernameInput.value,
      selectors.secondUsernameInput.value
    ];
  }

  function resetGameBoard () {
    GameBoard.resetModule();
    GameBoard.startNewGame();
  }


  function initGameBoard () {
    GameBoard.startNewGame();
    selectors.closeNextRoundBtn.addEventListener('click', closeModal);
    selectors.nextRoundForm.addEventListener('submit', () => GameBoard.startNewGame(
      { samePlayers: true }));
    selectors.singlePlayerBtn.addEventListener('click', () => showModal(selectors.newGameModal));
    selectors.multiplayerBtn.addEventListener('click', () => showModal(selectors.newGameModal));
    selectors.configForm.addEventListener('submit', initMultiplayer);
    selectors.resetBtn.addEventListener('click', resetGameBoard);
  }

  return { initGameBoard, selectors, showModal };
})();

GameConfiguration.initGameBoard();