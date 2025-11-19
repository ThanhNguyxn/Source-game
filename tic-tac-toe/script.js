const board = document.getElementById('board');
const cells = document.querySelectorAll('[data-cell]');
const currentPlayerElement = document.getElementById('currentPlayer');
const winningMessageElement = document.getElementById('winningMessage');
const winningMessageTextElement = document.getElementById('winningMessageText');
const restartBtn = document.getElementById('restartBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const scoreXElement = document.getElementById('scoreX');
const scoreOElement = document.getElementById('scoreO');
const scoreDrawElement = document.getElementById('scoreDraw');

const X_CLASS = 'x';
const O_CLASS = 'o';
let isOTurn = false;

let scores = {
    x: parseInt(localStorage.getItem('ticTacToeScoreX')) || 0,
    o: parseInt(localStorage.getItem('ticTacToeScoreO')) || 0,
    draw: parseInt(localStorage.getItem('ticTacToeScoreDraw')) || 0
};

const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

updateScoreDisplay();
startGame();

function startGame() {
    isOTurn = false;
    currentPlayerElement.textContent = 'X';
    cells.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(O_CLASS);
        cell.classList.remove('winning');
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    winningMessageElement.classList.remove('show');
}

function handleClick(e) {
    const cell = e.target;
    const currentClass = isOTurn ? O_CLASS : X_CLASS;
    
    placeMark(cell, currentClass);
    
    if (checkWin(currentClass)) {
        endGame(false, currentClass);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
    }
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
}

function swapTurns() {
    isOTurn = !isOTurn;
    currentPlayerElement.textContent = isOTurn ? 'O' : 'X';
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        const isWinning = combination.every(index => {
            return cells[index].classList.contains(currentClass);
        });
        
        if (isWinning) {
            combination.forEach(index => {
                cells[index].classList.add('winning');
            });
        }
        
        return isWinning;
    });
}

function isDraw() {
    return [...cells].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
    });
}

function endGame(draw, winner = null) {
    if (draw) {
        winningMessageTextElement.textContent = "It's a Draw!";
        scores.draw++;
        localStorage.setItem('ticTacToeScoreDraw', scores.draw);
    } else {
        const winnerText = winner === X_CLASS ? 'X' : 'O';
        winningMessageTextElement.textContent = `Player ${winnerText} Wins!`;
        if (winner === X_CLASS) {
            scores.x++;
            localStorage.setItem('ticTacToeScoreX', scores.x);
        } else {
            scores.o++;
            localStorage.setItem('ticTacToeScoreO', scores.o);
        }
    }
    updateScoreDisplay();
    winningMessageElement.classList.add('show');
}

function updateScoreDisplay() {
    scoreXElement.textContent = scores.x;
    scoreOElement.textContent = scores.o;
    scoreDrawElement.textContent = scores.draw;
}

function resetScore() {
    if (confirm('Are you sure you want to reset all scores?')) {
        scores = { x: 0, o: 0, draw: 0 };
        localStorage.removeItem('ticTacToeScoreX');
        localStorage.removeItem('ticTacToeScoreO');
        localStorage.removeItem('ticTacToeScoreDraw');
        updateScoreDisplay();
    }
}

restartBtn.addEventListener('click', startGame);
resetScoreBtn.addEventListener('click', resetScore);
