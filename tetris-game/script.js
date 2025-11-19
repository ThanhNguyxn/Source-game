const modeSelector = document.getElementById('modeSelector');
const gameArea = document.getElementById('gameArea');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

const scoreElement = document.getElementById('score');
const linesElement = document.getElementById('lines');
const levelElement = document.getElementById('level');
const modeDisplay = document.getElementById('modeDisplay');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const changeModeBtn = document.getElementById('changeModeBtn');

const BLOCK_SIZE = 20;
const BOARD_WIDTH = 12;
const BOARD_HEIGHT = 20;

let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let lines = 0;
let level = 1;
let gameLoop = null;
let isPaused = false;
let gameMode = 'classic';
let dropSpeed = 1000;
let targetLines = 0;
let startTime = 0;

// Tetromino shapes
const SHAPES = {
    I: [[1,1,1,1]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1]],
    S: [[0,1,1],[1,1,0]],
    Z: [[1,1,0],[0,1,1]],
    J: [[1,0,0],[1,1,1]],
    L: [[0,0,1],[1,1,1]]
};

const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000'
};

// Game modes
const GAME_MODES = {
    classic: { name: 'Classic', target: 0, timed: false },
    sprint: { name: 'Sprint (40 Lines)', target: 40, timed: true },
    marathon: { name: 'Marathon (150 Lines)', target: 150, timed: false }
};

// Start game
function startGame(mode) {
    gameMode = mode;
    const modeInfo = GAME_MODES[mode];
    targetLines = modeInfo.target;
    
    modeSelector.style.display = 'none';
    gameArea.style.display = 'block';
    modeDisplay.textContent = modeInfo.name;
    
    initGame();
    startTime = Date.now();
    gameLoop = setInterval(update, dropSpeed);
}

// Initialize game
function initGame() {
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    score = 0;
    lines = 0;
    level = 1;
    isPaused = false;
    dropSpeed = 1000;
    
    updateDisplay();
    currentPiece = createPiece();
    nextPiece = createPiece();
    drawNext();
}

// Create new piece
function createPiece() {
    const shapes = Object.keys(SHAPES);
    const type = shapes[Math.floor(Math.random() * shapes.length)];
    return {
        type: type,
        shape: SHAPES[type],
        color: COLORS[type],
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(SHAPES[type][0].length / 2),
        y: 0
    };
}

// Update game
function update() {
    if (isPaused) return;
    
    if (canMove(currentPiece, 0, 1)) {
        currentPiece.y++;
    } else {
        lockPiece();
        clearLines();
        currentPiece = nextPiece;
        nextPiece = createPiece();
        drawNext();
        
        if (!canMove(currentPiece, 0, 0)) {
            gameOver();
            return;
        }
    }
    
    draw();
}

// Can move check
function canMove(piece, dx, dy) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const newX = piece.x + x + dx;
                const newY = piece.y + y + dy;
                
                if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
                    return false;
                }
                if (newY >= 0 && board[newY][newX]) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Lock piece
function lockPiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.color;
                }
            }
        }
    }
}

// Clear lines
function clearLines() {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++;
        }
    }
    
    if (linesCleared > 0) {
        lines += linesCleared;
        score += [0, 100, 300, 500, 800][linesCleared] * level;
        level = Math.floor(lines / 10) + 1;
        dropSpeed = Math.max(100, 1000 - (level - 1) * 50);
        
        clearInterval(gameLoop);
        gameLoop = setInterval(update, dropSpeed);
        
        updateDisplay();
        checkWinCondition();
    }
}

// Check win condition
function checkWinCondition() {
    if (targetLines > 0 && lines >= targetLines) {
        clearInterval(gameLoop);
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        let message = `Congratulations! You completed ${GAME_MODES[gameMode].name}!\n`;
        message += `Final Score: ${score}\n`;
        if (GAME_MODES[gameMode].timed) {
            message += `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        alert(message);
        changeMode();
    }
}

// Rotate piece
function rotatePiece() {
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    
    const backup = currentPiece.shape;
    currentPiece.shape = rotated;
    
    if (!canMove(currentPiece, 0, 0)) {
        currentPiece.shape = backup;
    }
    draw();
}

// Hard drop
function hardDrop() {
    while (canMove(currentPiece, 0, 1)) {
        currentPiece.y++;
    }
    update();
}

// Get ghost position
function getGhostY() {
    let ghostY = currentPiece.y;
    while (canMove({ ...currentPiece, y: ghostY + 1 }, 0, 0)) {
        ghostY++;
    }
    return ghostY;
}

// Draw game
function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw board
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                ctx.fillStyle = board[y][x];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
        }
    }
    
    // Draw ghost piece
    const ghostY = getGhostY();
    if (currentPiece) {
        ctx.globalAlpha = 0.3;
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    ctx.fillStyle = currentPiece.color;
                    ctx.fillRect(
                        (currentPiece.x + x) * BLOCK_SIZE,
                        (ghostY + y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            }
        }
        ctx.globalAlpha = 1;
    }
    
    // Draw current piece
    if (currentPiece) {
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    ctx.fillStyle = currentPiece.color;
                    ctx.fillRect(
                        (currentPiece.x + x) * BLOCK_SIZE,
                        (currentPiece.y + y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            }
        }
    }
}

// Draw next piece
function drawNext() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        const offsetX = (4 - nextPiece.shape[0].length) * 10;
        const offsetY = (4 - nextPiece.shape.length) * 10;
        
        for (let y = 0; y < nextPiece.shape.length; y++) {
            for (let x = 0; x < nextPiece.shape[y].length; x++) {
                if (nextPiece.shape[y][x]) {
                    nextCtx.fillStyle = nextPiece.color;
                    nextCtx.fillRect(
                        offsetX + x * 20,
                        offsetY + y * 20,
                        19, 19
                    );
                }
            }
        }
    }
}

// Update display
function updateDisplay() {
    scoreElement.textContent = score;
    linesElement.textContent = targetLines > 0 ? `${lines}/${targetLines}` : lines;
    levelElement.textContent = level;
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    alert(`Game Over!\nScore: ${score}\nLines: ${lines}\nLevel: ${level}`);
    initGame();
    gameLoop = setInterval(update, dropSpeed);
}

// Controls
document.addEventListener('keydown', (e) => {
    if (isPaused) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            if (canMove(currentPiece, -1, 0)) {
                currentPiece.x--;
                draw();
            }
            break;
        case 'ArrowRight':
            if (canMove(currentPiece, 1, 0)) {
                currentPiece.x++;
                draw();
            }
            break;
        case 'ArrowDown':
            if (canMove(currentPiece, 0, 1)) {
                currentPiece.y++;
                draw();
            }
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case ' ':
            e.preventDefault();
            hardDrop();
            break;
    }
});

// Pause toggle
function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
}

// Reset game
function resetGame() {
    clearInterval(gameLoop);
    initGame();
    startTime = Date.now();
    gameLoop = setInterval(update, dropSpeed);
}

// Change mode
function changeMode() {
    clearInterval(gameLoop);
    gameArea.style.display = 'none';
    modeSelector.style.display = 'block';
}

pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);
changeModeBtn.addEventListener('click', changeMode);