const boardElement = document.querySelector('#board');

const Gameboard = (function (){
    let gameboard =
        [['X','O', 'X'],
         ['O','X','O'],
         ['X','','']];
    let players = {};

    function renderBoard(boardElement){
        boardElement.innerHTML = gameboard.flat().map((cellValue) => (
            `<div class="board__cell">${cellValue}</div>`
        )).join('\n');
    }

    return {renderBoard};
})();