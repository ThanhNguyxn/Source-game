const gameBoard = document.getElementById('gameBoard');
const currentPlayerElement = document.getElementById('currentPlayer');
const redScoreElement = document.getElementById('redScore');
const yellowScoreElement = document.getElementById('yellowScore');
const newGameBtn = document.getElementById('newGameBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');

const ROWS = 6;
const COLS = 7;
let board = [];
let currentPlayer = 'red';
let gameActive = true;
let gameMode = 'pvp'; // pvp or ai
let scores = {
    red: parseInt(localStorage.getItem('connect4RedScore')) || 0,
    yellow: parseInt(localStorage.getItem('connect4YellowScore')) || 0
};

redScoreElement.textContent = scores.red;
yellowScoreElement.textContent = scores.yellow;

// Add mode selector at start
const modeSelector = document.createElement('div');
modeSelector.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
        <button onclick="startGame('pvp')" style="padding: 15px 30px; margin: 5px; background: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            👥 Player vs Player
        </button>
        <button onclick="startGame('ai')" style="padding: 15px 30px; margin: 5px; background: #ff6b6b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            🤖 vs AI
        </button>
    </div>
`;
document.querySelector('.game-card').insertBefore(modeSelector, gameBoard);

function startGame(mode) {
    gameMode = mode;
    initGame();
}

function initGame() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    currentPlayer = 'red';
    gameActive = true;
    updatePlayerDisplay();
    renderBoard();
}

function renderBoard() {
    gameBoard.innerHTML = '';
    
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.col = col;
            
            if (board[row][col]) {
                cell.classList.add(board[row][col]);
            }
            
            if (row === 0) {
                cell.addEventListener('click', () => dropDisc(col));
            }
            
            gameBoard.appendChild(cell);
        }
    }
}

function dropDisc(col) {
    if (!gameActive || (gameMode === 'ai' && currentPlayer === 'yellow')) return;
    
    for (let row = ROWS - 1; row >= 0; row--) {
        if (!board[row][col]) {
            board[row][col] = currentPlayer;
            animateDrop(row, col);
            
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
            renderBoard();
            
            // AI turn
            if (gameMode === 'ai' && currentPlayer === 'yellow') {
                setTimeout(() => {
                    makeAIMove();
                }, 500);
            }
            return;
        }
    }
}

function makeAIMove() {
    if (!gameActive) return;
    
    const move = getBestAIMove();
    if (move !== null) {
        dropDisc(move);
    }
}

function getBestAIMove() {
    // Check if AI can win
    for (let col = 0; col < COLS; col++) {
        const row = getAvailableRow(col);
        if (row !== null) {
            board[row][col] = 'yellow';
            if (checkWin(row, col)) {
                board[row][col] = null;
                return col;
            }
            board[row][col] = null;
        }
    }
    
    // Block player from winning
    for (let col = 0; col < COLS; col++) {
        const row = getAvailableRow(col);
        if (row !== null) {
            board[row][col] = 'red';
            if (checkWin(row, col)) {
                board[row][col] = null;
                return col;
            }
            board[row][col] = null;
        }
    }
    
    // Try center column
    if (getAvailableRow(3) !== null) {
        return 3;
    }
    
    // Try adjacent to center
    const centerCols = [2, 4, 1, 5, 0, 6];
    for (let col of centerCols) {
        if (getAvailableRow(col) !== null) {
            return col;
        }
    }
    
    return null;
}

function getAvailableRow(col) {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (!board[row][col]) {
            return row;
        }
    }
    return null;
}

function animateDrop(row, col) {
    renderBoard();
}

function checkWin(row, col) {
    const directions = [
        [[0, 1], [0, -1]],   // Horizontal
        [[1, 0], [-1, 0]],   // Vertical
        [[1, 1], [-1, -1]],  // Diagonal \
        [[1, -1], [-1, 1]]   // Diagonal /
    ];
    
    for (let direction of directions) {
        let count = 1;
        const winningCells = [[row, col]];
        
        for (let [dr, dc] of direction) {
            let r = row + dr;
            let c = col + dc;
            
            while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === currentPlayer) {
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
        const cell = gameBoard.children[index];
        cell.classList.add('winning');
    });
}

function checkDraw() {
    return board[0].every(cell => cell !== null);
}

function endGame(winner) {
    gameActive = false;
    
    setTimeout(() => {
        if (winner) {
            scores[winner]++;
            localStorage.setItem(`connect4${winner.charAt(0).toUpperCase() + winner.slice(1)}Score`, scores[winner]);
            
            if (winner === 'red') {
                redScoreElement.textContent = scores.red;
            } else {
                yellowScoreElement.textContent = scores.yellow;
            }
            
            const displayName = (gameMode === 'ai' && winner === 'yellow') ? 'AI' : winner.toUpperCase();
            alert(`🎉 ${displayName} wins!`);
        } else {
            alert("🤝 It's a draw!");
        }
    }, 500);
}

function updatePlayerDisplay() {
    if (currentPlayer === 'red') {
        currentPlayerElement.textContent = '🔴 Red';
        currentPlayerElement.style.color = '#e74c3c';
    } else {
        const displayName = gameMode === 'ai' ? '🤖 AI' : '🟡 Yellow';
        currentPlayerElement.textContent = displayName;
        currentPlayerElement.style.color = '#f1c40f';
    }
}

function resetScore() {
    if (confirm('Are you sure you want to reset scores?')) {
        scores = { red: 0, yellow: 0 };
        localStorage.removeItem('connect4RedScore');
        localStorage.removeItem('connect4YellowScore');
        redScoreElement.textContent = 0;
        yellowScoreElement.textContent = 0;
    }
}

newGameBtn.addEventListener('click', initGame);
resetScoreBtn.addEventListener('click', resetScore);

initGame();
