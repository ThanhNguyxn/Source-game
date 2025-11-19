const gameBoard = document.getElementById('gameBoard');
const minesCountElement = document.getElementById('minesCount');
const timeElement = document.getElementById('time');
const flagsCountElement = document.getElementById('flagsCount');
const newGameBtn = document.getElementById('newGameBtn');
const difficultyBtns = document.querySelectorAll('.diff-btn');

const difficulties = {
    easy: { rows: 8, cols: 8, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 }
};

let currentDifficulty = 'easy';
let board = [];
let revealed = [];
let flagged = [];
let gameStarted = false;
let gameOver = false;
let timer = 0;
let timerInterval = null;
let flagsPlaced = 0;

function initGame() {
    const config = difficulties[currentDifficulty];
    board = createBoard(config.rows, config.cols);
    revealed = Array(config.rows).fill().map(() => Array(config.cols).fill(false));
    flagged = Array(config.rows).fill().map(() => Array(config.cols).fill(false));
    gameStarted = false;
    gameOver = false;
    timer = 0;
    flagsPlaced = 0;
    
    clearInterval(timerInterval);
    timeElement.textContent = timer;
    minesCountElement.textContent = config.mines;
    flagsCountElement.textContent = flagsPlaced;
    
    renderBoard();
}

function createBoard(rows, cols) {
    return Array(rows).fill().map(() => Array(cols).fill(0));
}

function placeMines(rows, cols, mines, firstRow, firstCol) {
    let minesPlaced = 0;
    while (minesPlaced < mines) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        
        if (board[row][col] !== -1 && !(row === firstRow && col === firstCol)) {
            board[row][col] = -1;
            minesPlaced++;
            
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newRow = row + i;
                    const newCol = col + j;
                    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && board[newRow][newCol] !== -1) {
                        board[newRow][newCol]++;
                    }
                }
            }
        }
    }
}

function renderBoard() {
    const config = difficulties[currentDifficulty];
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${config.cols}, 30px)`;
    gameBoard.style.gridTemplateRows = `repeat(${config.rows}, 30px)`;
    
    for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            if (revealed[row][col]) {
                cell.classList.add('revealed');
                if (board[row][col] === -1) {
                    cell.classList.add('mine');
                } else if (board[row][col] > 0) {
                    cell.textContent = board[row][col];
                    cell.classList.add(`number-${board[row][col]}`);
                }
            }
            
            if (flagged[row][col]) {
                cell.classList.add('flagged');
            }
            
            cell.addEventListener('click', () => handleCellClick(row, col));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleRightClick(row, col);
            });
            
            gameBoard.appendChild(cell);
        }
    }
}

function handleCellClick(row, col) {
    if (gameOver || revealed[row][col] || flagged[row][col]) return;
    
    if (!gameStarted) {
        gameStarted = true;
        const config = difficulties[currentDifficulty];
        placeMines(config.rows, config.cols, config.mines, row, col);
        startTimer();
    }
    
    if (board[row][col] === -1) {
        revealAllMines();
        endGame(false);
        return;
    }
    
    revealCell(row, col);
    renderBoard();
    checkWin();
}

function handleRightClick(row, col) {
    if (gameOver || revealed[row][col]) return;
    
    flagged[row][col] = !flagged[row][col];
    flagsPlaced += flagged[row][col] ? 1 : -1;
    flagsCountElement.textContent = flagsPlaced;
    renderBoard();
}

function revealCell(row, col) {
    const config = difficulties[currentDifficulty];
    
    if (row < 0 || row >= config.rows || col < 0 || col >= config.cols || revealed[row][col]) {
        return;
    }
    
    revealed[row][col] = true;
    
    if (board[row][col] === 0) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                revealCell(row + i, col + j);
            }
        }
    }
}

function revealAllMines() {
    const config = difficulties[currentDifficulty];
    for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
            if (board[row][col] === -1) {
                revealed[row][col] = true;
            }
        }
    }
}

function checkWin() {
    const config = difficulties[currentDifficulty];
    let unrevealedNonMines = 0;
    
    for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
            if (!revealed[row][col] && board[row][col] !== -1) {
                unrevealedNonMines++;
            }
        }
    }
    
    if (unrevealedNonMines === 0) {
        endGame(true);
    }
}

function endGame(won) {
    gameOver = true;
    clearInterval(timerInterval);
    
    setTimeout(() => {
        if (won) {
            alert(`🎉 You Won!\nTime: ${timer} seconds`);
        } else {
            alert(`💥 Game Over!\nTime: ${timer} seconds`);
        }
    }, 100);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        timeElement.textContent = timer;
    }, 1000);
}

difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.dataset.difficulty;
        initGame();
    });
});

newGameBtn.addEventListener('click', initGame);

initGame();
