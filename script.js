function createGameboard() {
    let gameboard = ['_', '_', '_', '_', '_', '_', '_', '_', '_'];
    let playerCells = {
        X: [],
        O: [],
    };

    const drawCell = (cell, player) => {
        if (gameboard[cell - 1] !== '_') {
            alert('Pick valid cell');
            return 'invalid';
        } else {
            gameboard[cell - 1] = player.getMark();
            playerCells[player.getMark()].push(cell);
        }
    };

    const resetBoard = () => {
        gameboard = ['_', '_', '_', '_', '_', '_', '_', '_', '_'];
        playerCells = {
            X: [],
            O: [],
        };
    };

    const checkCombinations = (mark) => {
        const playerMarks = playerCells[mark];

        if (playerMarks.length >= 3) {
            if (
                (playerMarks.includes(1) && playerMarks.includes(2) && playerMarks.includes(3)) ||
                (playerMarks.includes(4) && playerMarks.includes(5) && playerMarks.includes(6)) ||
                (playerMarks.includes(7) && playerMarks.includes(8) && playerMarks.includes(9)) ||
                (playerMarks.includes(1) && playerMarks.includes(4) && playerMarks.includes(7)) ||
                (playerMarks.includes(2) && playerMarks.includes(5) && playerMarks.includes(8)) ||
                (playerMarks.includes(3) && playerMarks.includes(6) && playerMarks.includes(9)) ||
                (playerMarks.includes(1) && playerMarks.includes(5) && playerMarks.includes(9)) ||
                (playerMarks.includes(3) && playerMarks.includes(5) && playerMarks.includes(7))
            ) {
                return 'winner';
            }
        }

        if (gameboard.every((element) => element !== '_')) {
            return 'tie';
        }

        return false;
    };

    return { drawCell, checkCombinations, resetBoard };
}

function createPlayer(name, mark) {
    let points = 0;

    const getName = () => name;
    const getMark = () => mark;
    const getPoints = () => points;

    const addPoint = () => points++;

    return { getName, getMark, addPoint, getPoints };
}

const Game = (function () {
    const board = createGameboard();
    const players = [];
    let activePlayer, activeGame;

    const startNewGame = () => {
        activeGame = true;
        activePlayer = players[0];
        board.resetBoard();
        displayBoard.updateMark();
    };

    const newRound = (element) => {
        if (activeGame) {
            if (board.drawCell(Number(element.getAttribute('data-index')), activePlayer) === 'invalid') {
                return;
            }

            displayBoard.updateCell(element);

            if (board.checkCombinations(activePlayer.getMark()) === 'winner') {
                endGame(true);
            } else if (board.checkCombinations(activePlayer.getMark()) === 'tie') {
                endGame(false);
            } else {
                changeActivePlayer();
            }

            displayBoard.updateMark();
        }
    };

    const endGame = (haveWinner) => {
        let text;

        if (haveWinner) {
            activePlayer.addPoint();
            displayBoard.updatePoints();
            text = `${activePlayer.getName()} won!`;
        } else {
            text = `It's a tie!`;
        }
        activeGame = false;
        displayBoard.showGameEnd(text);
    };

    const changeActivePlayer = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const addPlayers = (firstPlayerName, secondPlayerName) => {
        players.push(createPlayer(firstPlayerName, 'X'));
        players.push(createPlayer(secondPlayerName, 'O'));

        activePlayer = players[0];
    };

    const getActivePlayer = () => activePlayer;

    const getPlayers = () => players;

    return { newRound, addPlayers, getActivePlayer, startNewGame, getPlayers };
})();

const displayBoard = (function () {
    const playerNames = document.querySelector('.names-form');
    const gameContainer = document.querySelector('.game');
    const boardContainer = document.querySelector('.board');
    const startNewGameButton = document.querySelector('.start-new-game');
    const dialog = document.querySelector('dialog');
    const closeDialog = document.querySelector('.close-dialog');

    const markSvgs = {
        X: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/></svg>`,
        O: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M224 96a160 160 0 1 0 0 320 160 160 0 1 0 0-320zM448 256A224 224 0 1 1 0 256a224 224 0 1 1 448 0z"/></svg>`,
    };

    playerNames.addEventListener('submit', (e) => {
        e.preventDefault();

        const firstPlayerName = playerNames.querySelector('#player-one-name').value;
        const secondPlayerName = playerNames.querySelector('#player-two-name').value;

        Game.addPlayers(firstPlayerName, secondPlayerName);

        playerNames.classList.add('hidden');

        showBoard();

        Game.startNewGame();
    });

    boardContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('cell')) {
            Game.newRound(e.target);
        }
    });

    startNewGameButton.addEventListener('click', () => {
        boardContainer.innerHTML = ``;
        for (let i = 1; i <= 9; i++) {
            const divCell = `<div class="cell" data-index="${i}"></div>`;
            boardContainer.innerHTML += divCell;
        }

        Game.startNewGame();
    });

    closeDialog.addEventListener('click', () => {
        dialog.close();
    });

    const showGameEnd = (text) => {
        dialog.querySelector('h2').textContent = text;
        dialog.showModal();
    };

    const showBoard = () => {
        gameContainer.classList.remove('hidden');

        updateMark();
        updatePoints();
    };

    const updatePoints = () => {
        const [playerOne, playerTwo] = Game.getPlayers();

        gameContainer.querySelector(
            '#player_one'
        ).textContent = `${playerOne.getName()}: ${playerOne.getPoints()} points`;

        gameContainer.querySelector(
            '#player_two'
        ).textContent = `${playerTwo.getName()}: ${playerTwo.getPoints()} points`;
    };

    const updateMark = () => {
        gameContainer.querySelector('.player__mark').textContent = Game.getActivePlayer().getMark();
    };

    const updateCell = (element) => {
        const currentMark = Game.getActivePlayer().getMark();
        element.innerHTML = markSvgs[currentMark];
    };

    return { showGameEnd, updateCell, updateMark, updatePoints };
})();
