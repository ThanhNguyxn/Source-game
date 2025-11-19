const board = document.getElementById('board');
const cells = document.querySelectorAll('[data-cell]');
const currentPlayerElement = document.getElementById('currentPlayer');
const currentModeElement = document.getElementById('currentMode');
const winningMessageElement = document.getElementById('winningMessage');
const winningMessageTextElement = document.getElementById('winningMessageText');
const playAgainBtn = document.getElementById('playAgainBtn');
const restartBtn = document.getElementById('restartBtn');
const changeModeBtn = document.getElementById('changeModeBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const modeSelector = document.getElementById('modeSelector');
const gameScreen = document.getElementById('gameScreen');
const modeBtns = document.querySelectorAll('.mode-btn');
const scoreXElement = document.getElementById('scoreX');
const scoreOElement = document.getElementById('scoreO');
const scoreDrawElement = document.getElementById('scoreDraw');

const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

let currentMode = 'pvp';
let isOTurn = false;
let gameActive = false;
let isAIThinking = false;

let scores = {
    x: parseInt(localStorage.getItem('tttScoreX')) || 0,
    o: parseInt(localStorage.getItem('tttScoreO')) || 0,
    draw: parseInt(localStorage.getItem('tttScoreDraw')) || 0
};

updateScoreDisplay();

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentMode = btn.dataset.mode;
        startGame();
    });
});

function startGame() {
    modeSelector.style.display = 'none';
    gameScreen.style.display = 'block';
    isOTurn = false;
    gameActive = true;
    isAIThinking = false;
    
    const modeNames = {
        'pvp': 'Player vs Player',
        'ai-easy': 'vs AI (Easy)',
        'ai-medium': 'vs AI (Medium)',
        'ai-hard': 'vs AI (Impossible)'
    };
    currentModeElement.textContent = modeNames[currentMode];
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
    if (!gameActive || isAIThinking) return;
    
    const cell = e.target;
    const currentClass = isOTurn ? O_CLASS : X_CLASS;
    
    placeMark(cell, currentClass);
    
    if (checkWin(currentClass)) {
        endGame(false, currentClass);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        
        // AI turn
        if (currentMode !== 'pvp' && isOTurn) {
            isAIThinking = true;
            setTimeout(() => {
                makeAIMove();
                isAIThinking = false;
            }, 500);
        }
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
    gameActive = false;
    
    if (draw) {
        winningMessageTextElement.textContent = "It's a Draw!";
        scores.draw++;
        localStorage.setItem('tttScoreDraw', scores.draw);
    } else {
        const winnerText = winner === X_CLASS ? 'X' : 'O';
        const isPlayer = (currentMode === 'pvp' || winner === X_CLASS);
        winningMessageTextElement.textContent = isPlayer ? 
            `Player ${winnerText} Wins!` : 'AI Wins!';
        
        if (winner === X_CLASS) {
            scores.x++;
            localStorage.setItem('tttScoreX', scores.x);
        } else {
            scores.o++;
            localStorage.setItem('tttScoreO', scores.o);
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
        localStorage.removeItem('tttScoreX');
        localStorage.removeItem('tttScoreO');
        localStorage.removeItem('tttScoreDraw');
        updateScoreDisplay();
    }
}

// AI Implementation
function makeAIMove() {
    let move;
    
    if (currentMode === 'ai-easy') {
        move = getRandomMove();
    } else if (currentMode === 'ai-medium') {
        move = getMediumMove();
    } else if (currentMode === 'ai-hard') {
        move = getBestMove();
    }
    
    if (move !== null) {
        const cell = cells[move];
        cell.click();
    }
}

function getRandomMove() {
    const availableCells = [...cells].map((cell, index) => 
        (!cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS)) ? index : null
    ).filter(val => val !== null);
    
    return availableCells.length > 0 ? 
        availableCells[Math.floor(Math.random() * availableCells.length)] : null;
}

function getMediumMove() {
    // 50% chance to make smart move, 50% random
    if (Math.random() < 0.5) {
        return getBestMove();
    } else {
        return getRandomMove();
    }
}

function getBestMove() {
    // Minimax algorithm for unbeatable AI
    let bestScore = -Infinity;
    let bestMove = null;
    
    for (let i = 0; i < 9; i++) {
        if (!cells[i].classList.contains(X_CLASS) && !cells[i].classList.contains(O_CLASS)) {
            cells[i].classList.add(O_CLASS);
            let score = minimax(false, 0);
            cells[i].classList.remove(O_CLASS);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

function minimax(isMaximizing, depth) {
    // Check terminal states
    if (checkWinForMinimax(O_CLASS)) return 10 - depth;
    if (checkWinForMinimax(X_CLASS)) return depth - 10;
    if (isDrawForMinimax()) return 0;
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (!cells[i].classList.contains(X_CLASS) && !cells[i].classList.contains(O_CLASS)) {
                cells[i].classList.add(O_CLASS);
                let score = minimax(false, depth + 1);
                cells[i].classList.remove(O_CLASS);
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (!cells[i].classList.contains(X_CLASS) && !cells[i].classList.contains(O_CLASS)) {
                cells[i].classList.add(X_CLASS);
                let score = minimax(true, depth + 1);
                cells[i].classList.remove(X_CLASS);
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinForMinimax(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cells[index].classList.contains(currentClass);
        });
    });
}

function isDrawForMinimax() {
    return [...cells].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
    });
}

playAgainBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
changeModeBtn.addEventListener('click', () => {
    gameScreen.style.display = 'none';
    modeSelector.style.display = 'block';
});
resetScoreBtn.addEventListener('click', resetScore);
