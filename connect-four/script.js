// Game variables
const modeSelector = document.getElementById('modeSelector');
const gameArea = document.getElementById('gameArea');
const board = document.getElementById('board');
const turnDisplay = document.getElementById('turnDisplay');
const message = document.getElementById('message');
const redScoreElement = document.getElementById('redScore');
const yellowScoreElement = document.getElementById('yellowScore');
const newGameBtn = document.getElementById('newGameBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const changeModeBtn = document.getElementById('changeModeBtn');

const ROWS = 6;
const COLS = 7;
let gameBoard = [];
let currentPlayer = 'red';
let gameActive = true;
let gameMode = 'pvp';
let aiThinking = false;
let scores = {
    red: parseInt(localStorage.getItem('connect4RedScore')) || 0,
    yellow: parseInt(localStorage.getItem('connect4YellowScore')) || 0
};

// Initialize scores
redScoreElement.textContent = scores.red;
yellowScoreElement.textContent = scores.yellow;

// Start game with selected mode
function startGame(mode) {
    gameMode = mode;
    modeSelector.style.display = 'none';
    gameArea.style.display = 'block';
    initGame();
}

// Initialize game board
function initGame() {
    gameBoard = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    currentPlayer = 'red';
    gameActive = true;
    aiThinking = false;
    updatePlayerDisplay();
    renderBoard();
    message.textContent = '';
}

// Render the game board
function renderBoard() {
    board.innerHTML = '';
    
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            if (gameBoard[row][col]) {
                const disc = document.createElement('div');
                disc.className = `disc ${gameBoard[row][col]}`;
                cell.appendChild(disc);
            }
            
            cell.addEventListener('click', () => handleCellClick(col));
            board.appendChild(cell);
        }
    }
}

// Handle cell click
function handleCellClick(col) {
    if (!gameActive || aiThinking) return;
    if (gameMode !== 'pvp' && currentPlayer === 'yellow') return;
    
    dropDisc(col);
}

// Drop disc in column
function dropDisc(col) {
    if (!gameActive || aiThinking) return;
    
    // Find available row
    for (let row = ROWS - 1; row >= 0; row--) {
        if (!gameBoard[row][col]) {
            gameBoard[row][col] = currentPlayer;
            renderBoard();
            
            if (checkWin(row, col)) {
                endGame(currentPlayer);
                return;
            }
            
            if (checkDraw()) {
                endGame(null);
                return;
            }
            
            currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
            updatePlayerDisplay();
            
            // AI turn
            if (gameMode !== 'pvp' && currentPlayer === 'yellow' && gameActive) {
                aiThinking = true;
                setTimeout(() => {
                    makeAIMove();
                    aiThinking = false;
                }, 500);
            }
            return;
        }
    }
}

// AI move logic
function makeAIMove() {
    if (!gameActive) return;
    
    let move;
    if (gameMode === 'ai-easy') {
        move = getRandomMove();
    } else if (gameMode === 'ai-medium') {
        move = getMediumMove();
    } else if (gameMode === 'ai-hard') {
        move = getHardMove();
    }
    
    if (move !== null && move !== undefined) {
        dropDisc(move);
    }
}

// Easy AI - Random move
function getRandomMove() {
    const availableCols = [];
    for (let col = 0; col < COLS; col++) {
        if (gameBoard[0][col] === null) {
            availableCols.push(col);
        }
    }
    return availableCols.length > 0 ? availableCols[Math.floor(Math.random() * availableCols.length)] : null;
}

// Medium AI - Block and attack
function getMediumMove() {
    // Check if AI can win
    for (let col = 0; col < COLS; col++) {
        const row = getAvailableRow(col);
        if (row !== null) {
            gameBoard[row][col] = 'yellow';
            if (checkWin(row, col)) {
                gameBoard[row][col] = null;
                return col;
            }
            gameBoard[row][col] = null;
        }
    }
    
    // Block player from winning
    for (let col = 0; col < COLS; col++) {
        const row = getAvailableRow(col);
        if (row !== null) {
            gameBoard[row][col] = 'red';
            if (checkWin(row, col)) {
                gameBoard[row][col] = null;
                return col;
            }
            gameBoard[row][col] = null;
        }
    }
    
    return getRandomMove();
}

// Hard AI - Advanced strategy
function getHardMove() {
    // Try to win
    for (let col = 0; col < COLS; col++) {
        const row = getAvailableRow(col);
        if (row !== null) {
            gameBoard[row][col] = 'yellow';
            if (checkWin(row, col)) {
                gameBoard[row][col] = null;
                return col;
            }
            gameBoard[row][col] = null;
        }
    }
    
    // Block player
    for (let col = 0; col < COLS; col++) {
        const row = getAvailableRow(col);
        if (row !== null) {
            gameBoard[row][col] = 'red';
            if (checkWin(row, col)) {
                gameBoard[row][col] = null;
                return col;
            }
            gameBoard[row][col] = null;
        }
    }
    
    // Prefer center
    if (getAvailableRow(3) !== null) return 3;
    
    // Try columns near center
    const centerCols = [2, 4, 1, 5, 0, 6];
    for (let col of centerCols) {
        if (getAvailableRow(col) !== null) return col;
    }
    
    return null;
}

function getAvailableRow(col) {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (!gameBoard[row][col]) return row;
    }
    return null;
}

// Check for win
function checkWin(row, col) {
    const directions = [
        [[0, 1], [0, -1]],   // Horizontal
        [[1, 0], [-1, 0]],   // Vertical
        [[1, 1], [-1, -1]],  // Diagonal \
        [[1, -1], [-1, 1]]   // Diagonal /
    ];
    
    const player = gameBoard[row][col];
    
    for (let direction of directions) {
        let count = 1;
        const winningCells = [[row, col]];
        
        for (let [dr, dc] of direction) {
            let r = row + dr;
            let c = col + dc;
            
            while (r >= 0 && r < ROWS && c >= 0 && c < COLS && gameBoard[r][c] === player) {
                count++;
                winningCells.push([r, c]);
                r += dr;
                c += dc;
            }
        }
        
        if (count >= 4) {
            highlightWinningCells(winningCells);
            return true;
        }
    }
    return false;
}

function highlightWinningCells(cells) {
    cells.forEach(([row, col]) => {
        const index = row * COLS + col;
        const cell = board.children[index];
        if (cell) cell.classList.add('winning');
    });
}

// Check for draw
function checkDraw() {
    return gameBoard[0].every(cell => cell !== null);
}

// End game
function endGame(winner) {
    gameActive = false;
    aiThinking = false;
    
    if (winner) {
        scores[winner]++;
        localStorage.setItem(`connect4${winner.charAt(0).toUpperCase() + winner.slice(1)}Score`, scores[winner]);
        
        if (winner === 'red') {
            redScoreElement.textContent = scores.red;
        } else {
            yellowScoreElement.textContent = scores.yellow;
        }
        
        const displayName = (gameMode !== 'pvp' && winner === 'yellow') ? 'AI' : winner.toUpperCase();
        message.textContent = `🎉 ${displayName} wins!`;
        message.className = 'message success';
    } else {
        message.textContent = "🤝 It's a draw!";
        message.className = 'message info';
    }
}

// Update player display
function updatePlayerDisplay() {
    if (currentPlayer === 'red') {
        turnDisplay.textContent = "🔴 Red's Turn";
        turnDisplay.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #e74c3c 100%)';
    } else {
        const displayName = gameMode !== 'pvp' ? "🤖 AI's Turn" : "🟡 Yellow's Turn";
        turnDisplay.textContent = displayName;
        turnDisplay.style.background = 'linear-gradient(135deg, #ffd93d 0%, #f1c40f 100%)';
    }
}

// Reset score
function resetScore() {
    if (confirm('Are you sure you want to reset scores?')) {
        scores = { red: 0, yellow: 0 };
        localStorage.removeItem('connect4RedScore');
        localStorage.removeItem('connect4YellowScore');
        redScoreElement.textContent = 0;
        yellowScoreElement.textContent = 0;
    }
}

// Change mode
function changeMode() {
    gameArea.style.display = 'none';
    modeSelector.style.display = 'block';
}

// Event listeners
newGameBtn.addEventListener('click', initGame);
resetScoreBtn.addEventListener('click', resetScore);
changeModeBtn.addEventListener('click', changeMode);