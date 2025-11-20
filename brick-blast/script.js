const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 700;

const ROWS = 14;
const COLS = 10;
const BRICK_SIZE = canvas.width / COLS;
const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8'];

let gameRunning = false;
let paused = false;
let gameStarted = false;
let score = 0;
let moves = 20;
let target = 500;
let largestBlast = 0;

let grid = [];
let selectedGroup = [];

function initGrid() {
    grid = [];
    for (let row = 0; row < ROWS; row++) {
        grid[row] = [];
        for (let col = 0; col < COLS; col++) {
            grid[row][col] = {
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                removing: false
            };
        }
    }
}

function drawBrick(row, col) {
    const brick = grid[row][col];
    if (!brick || brick.removing) return;

    const x = col * BRICK_SIZE;
    const y = row * BRICK_SIZE;

    // Check if in selected group
    const isSelected = selectedGroup.some(b => b.row === row && b.col === col);

    ctx.fillStyle = brick.color;
    ctx.fillRect(x + 2, y + 2, BRICK_SIZE - 4, BRICK_SIZE - 4);

    // Highlight
    if (isSelected) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.strokeRect(x + 2, y + 2, BRICK_SIZE - 4, BRICK_SIZE - 4);
    }

    // Shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x + 4, y + 4, BRICK_SIZE - 12, BRICK_SIZE / 3);
}

function draw() {
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            drawBrick(row, col);
        }
    }

    // Selected group count
    if (selectedGroup.length > 1) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${selectedGroup.length} bricks`, canvas.width / 2, 50);
        ctx.font = '20px Arial';
        ctx.fillText(`${calculatePoints(selectedGroup.length)} points`, canvas.width / 2, 80);
    }
}

function findGroup(startRow, startCol) {
    const color = grid[startRow][startCol].color;
    const group = [];
    const visited = new Set();

    function explore(row, col) {
        const key = `${row},${col}`;
        if (visited.has(key)) return;
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
        if (!grid[row][col] || grid[row][col].color !== color) return;

        visited.add(key);
        group.push({row, col});

        explore(row + 1, col);
        explore(row - 1, col);
        explore(row, col + 1);
        explore(row, col - 1);
    }

    explore(startRow, startCol);
    return group;
}

function calculatePoints(count) {
    return count * count * 5;
}

function removeGroup(group) {
    if (group.length < 2) return false;

    const points = calculatePoints(group.length);
    score += points;
    moves--;
    largestBlast = Math.max(largestBlast, group.length);

    // Mark for removal
    group.forEach(b => {
        grid[b.row][b.col].removing = true;
    });

    setTimeout(() => {
        // Remove bricks
        group.forEach(b => {
            grid[b.row][b.col] = null;
        });

        // Apply gravity
        applyGravity();

        // Check game over
        if (moves <= 0) {
            setTimeout(checkGameOver, 300);
        }

        updateDisplay();
        draw();
    }, 200);

    return true;
}

function applyGravity() {
    // Drop bricks down
    for (let col = 0; col < COLS; col++) {
        let emptyRow = ROWS - 1;

        for (let row = ROWS - 1; row >= 0; row--) {
            if (grid[row][col] !== null) {
                if (row !== emptyRow) {
                    grid[emptyRow][col] = grid[row][col];
                    grid[row][col] = null;
                }
                emptyRow--;
            }
        }
    }

    // Shift columns left if empty
    let writeCol = 0;
    for (let col = 0; col < COLS; col++) {
        let isEmpty = true;
        for (let row = 0; row < ROWS; row++) {
            if (grid[row][col] !== null) {
                isEmpty = false;
                break;
            }
        }

        if (!isEmpty) {
            if (col !== writeCol) {
                for (let row = 0; row < ROWS; row++) {
                    grid[row][writeCol] = grid[row][col];
                    grid[row][col] = null;
                }
            }
            writeCol++;
        }
    }
}

function hasMovesLeft() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (grid[row][col]) {
                const group = findGroup(row, col);
                if (group.length >= 2) return true;
            }
        }
    }
    return false;
}

canvas.addEventListener('mousemove', (e) => {
    if (!gameRunning || paused) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const col = Math.floor(x / BRICK_SIZE);
    const row = Math.floor(y / BRICK_SIZE);

    if (row >= 0 && row < ROWS && col >= 0 && col < COLS && grid[row][col]) {
        selectedGroup = findGroup(row, col);
    } else {
        selectedGroup = [];
    }

    draw();
});

canvas.addEventListener('click', (e) => {
    if (!gameRunning || paused) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const col = Math.floor(x / BRICK_SIZE);
    const row = Math.floor(y / BRICK_SIZE);

    if (row >= 0 && row < ROWS && col >= 0 && col < COLS && grid[row][col]) {
        const group = findGroup(row, col);
        if (removeGroup(group)) {
            selectedGroup = [];
            draw();
        }
    }
});

canvas.addEventListener('mouseleave', () => {
    selectedGroup = [];
    draw();
});

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = moves;
    document.getElementById('target').textContent = target;
}

function checkGameOver() {
    const won = score >= target;
    const hasMore = hasMovesLeft();

    gameRunning = false;

    if (won) {
        document.getElementById('resultTitle').textContent = '🎉 Level Complete!';
    } else if (!hasMore) {
        document.getElementById('resultTitle').textContent = 'No More Moves!';
    } else {
        document.getElementById('resultTitle').textContent = 'Out of Moves!';
    }

    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalBlast').textContent = largestBlast;
    document.getElementById('gameOver').classList.remove('hidden');
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        paused = !paused;
        document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
    }
});

document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        gameRunning = true;
        document.getElementById('instructions').classList.add('hidden');
        document.getElementById('pauseBtn').disabled = false;

        score = 0;
        moves = 20;
        target = 500;
        largestBlast = 0;
        selectedGroup = [];

        initGrid();
        updateDisplay();
        draw();
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
});

document.getElementById('restartBtn').addEventListener('click', () => {
    score = 0;
    moves = 20;
    target = 500;
    largestBlast = 0;
    selectedGroup = [];
    gameRunning = true;
    paused = false;

    initGrid();
    document.getElementById('gameOver').classList.add('hidden');
    updateDisplay();
    draw();
});

updateDisplay();

