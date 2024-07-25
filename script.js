const Gameboard = (() => {
    let gameboard = ['_', '_', '_', '_', '_', '_', '_', '_', '_'];
    let playerCells = {
        X: [],
        O: [],
    };

    const drawCell = ({ cell, player }) => {
        if (gameboard[cell - 1] !== '_') {
            return 'invalid';
        }

        gameboard[cell - 1] = player.getMark();
        playerCells[player.getMark()].push(cell);
    };

    const resetBoard = () => {
        gameboard = ['_', '_', '_', '_', '_', '_', '_', '_', '_'];
        playerCells = {
            X: [],
            O: [],
        };
    };

    const getGameboard = () => gameboard;

    const getPlayerCells = () => playerCells;

    return { drawCell, getGameboard, getPlayerCells, resetBoard };
})();

const Player = ({ name, mark }) => {
    let points = 0;

    const getName = () => name;
    const getMark = () => mark;
    const getPoints = () => points;

    const addPoint = () => points++;

    return { getName, getMark, addPoint, getPoints };
};

// --------------------------------------------------------------------

// Game

const Game = (function () {
    const board = Gameboard;
    const players = [];
    const winningCombinations = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9],
        [1, 5, 9],
        [3, 5, 7],
    ];
    let activePlayer, activeGame;

    const startNewGame = () => {
        activeGame = true;
        activePlayer = players[0];
        board.resetBoard();
    };

    const newRound = (cell) => {
        if (!activeGame) return { status: 'inactive' };

        const drawStatus = board.drawCell({
            cell,
            player: activePlayer,
        });

        if (drawStatus === 'invalid') return { status: 'invalid' };

        if (checkCombinations(activePlayer.getMark()) === 'winner') {
            return endGame(true);
        } else if (checkCombinations(activePlayer.getMark()) === 'tie') {
            return endGame(false);
        } else {
            const displayedMark = activePlayer.getMark();
            changeActivePlayer();
            return { status: 'ongoing', mark: displayedMark };
        }
    };

    const endGame = (haveWinner) => {
        let text;

        if (haveWinner) {
            text = `${activePlayer.getName()} won!`;
            activePlayer.addPoint();
        } else {
            text = `It's a tie!`;
        }

        activeGame = false;

        return { text, status: haveWinner ? 'winner' : 'tie', mark: activePlayer.getMark() };
    };

    const changeActivePlayer = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const checkCombinations = (mark) => {
        const playerMarks = board.getPlayerCells()[mark];
        if (playerMarks.length >= 3) {
            for (const combination of winningCombinations) {
                if (combination.every((element) => playerMarks.includes(element))) {
                    return 'winner';
                }
            }
        }

        if (board.getGameboard().every((element) => element !== '_')) {
            return 'tie';
        }
    };

    const addPlayers = ({ firstPlayerName, secondPlayerName }) => {
        players.push(Player({ name: firstPlayerName, mark: 'X' }));
        players.push(Player({ name: secondPlayerName, mark: 'O' }));

        activePlayer = players[0];
    };

    const getActivePlayer = () => activePlayer;

    const getPlayers = () => players;

    return { newRound, addPlayers, getActivePlayer, startNewGame, getPlayers };
})();

// ---------------------------------------------------------------------------------

// Display Board

const DisplayBoard = (function () {
    const playerNames = document.querySelector('.names-form');
    const gameContainer = document.querySelector('.game');
    const boardContainer = document.querySelector('.board');
    const startNewGameButton = document.querySelector('.start-new-game');
    const dialog = document.querySelector('dialog');
    const closeDialog = document.querySelector('.close-dialog');

    const markSvgs = {
        X: './imgs/x.svg',
        O: './imgs/o.svg',
    };

    playerNames.addEventListener('submit', (e) => {
        e.preventDefault();

        const firstPlayerName = playerNames.querySelector('#player-one-name').value;
        const secondPlayerName = playerNames.querySelector('#player-two-name').value;

        Game.addPlayers({
            firstPlayerName: firstPlayerName || 'Player 1',
            secondPlayerName: secondPlayerName || 'Player 2',
        });

        showBoard();

        Game.startNewGame();
    });

    boardContainer.addEventListener('click', (e) => {
        const cellElement = e.target.closest('.cell');

        if (cellElement) {
            const cell = cellElement.getAttribute('data-index');
            const { mark, text, status } = Game.newRound(Number(cell));

            const statusActions = {
                ongoing: () => {
                    updateCell({ element: cellElement, mark });
                    updateMark();
                },
                winner: () => {
                    updateCell({ element: cellElement, mark });
                    updateMark();
                    endGame(text);
                },
                tie: () => {
                    updateCell({ element: cellElement, mark });
                    updateMark();
                    endGame(text);
                },
                inactive: () => showDialog('Start the new game'),
                invalid: () => showDialog('Invalid move'),
            };

            statusActions[status]();
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

    const endGame = (text) => {
        showDialog(text);
        updatePoints();
    };

    const showDialog = (text) => {
        dialog.querySelector('h2').textContent = text;
        dialog.showModal();
    };

    const showBoard = () => {
        playerNames.classList.add('hidden');
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

    const updateCell = ({ element, mark }) => {
        element.innerHTML = `<img src=${markSvgs[mark]} draggable = 'false'/>`;
    };

    return { showDialog, updateCell, updateMark, updatePoints };
})();
