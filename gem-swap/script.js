const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 560;
canvas.height = 560;

const GRID_SIZE = 8;
const GEM_SIZE = 70;

let gameRunning = false;
let paused = false;
let gameStarted = false;
let score = 0;
let moves = 30;
let target = 1000;
let matchCount = 0;
let largestCombo = 3;

const GEM_COLORS = [
    '#ff0000', // Red
    '#0000ff', // Blue
    '#00ff00', // Green
    '#ffff00', // Yellow
    '#9900ff', // Purple
    '#ff6600'  // Orange
];

let grid = [];
let selectedGem = null;
let animating = false;

function initGrid() {
    grid = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        grid[row] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            grid[row][col] = {
                color: Math.floor(Math.random() * GEM_COLORS.length),
                x: col * GEM_SIZE,
                y: row * GEM_SIZE,
                falling: false,
                matched: false
            };
        }
    }

    // Ensure no initial matches
    removeInitialMatches();
}

function removeInitialMatches() {
    let hasMatches = true;
    while (hasMatches) {
        hasMatches = false;
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const matches = findMatches(row, col);
                if (matches.length >= 3) {
                    grid[row][col].color = Math.floor(Math.random() * GEM_COLORS.length);
                    hasMatches = true;
                }
            }
        }
    }
}

function drawGem(gem, row, col) {
    const x = col * GEM_SIZE;
    const y = gem.falling ? gem.y : row * GEM_SIZE;

    if (gem.matched) return;

    // Gem body
    ctx.fillStyle = GEM_COLORS[gem.color];
    ctx.beginPath();
    ctx.arc(x + GEM_SIZE / 2, y + GEM_SIZE / 2, GEM_SIZE / 2 - 5, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(x + GEM_SIZE / 2 - 10, y + GEM_SIZE / 2 - 10, GEM_SIZE / 6, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x + GEM_SIZE / 2, y + GEM_SIZE / 2, GEM_SIZE / 2 - 5, 0, Math.PI * 2);
    ctx.stroke();

    // Selection highlight
    if (selectedGem && selectedGem.row === row && selectedGem.col === col) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(x + 5, y + 5, GEM_SIZE - 10, GEM_SIZE - 10);
    }
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GEM_SIZE, 0);
        ctx.lineTo(i * GEM_SIZE, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * GEM_SIZE);
        ctx.lineTo(canvas.width, i * GEM_SIZE);
        ctx.stroke();
    }

    // Draw gems
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            drawGem(grid[row][col], row, col);
        }
    }
}

function findMatches(row, col) {
    const color = grid[row][col].color;
    const matches = [{row, col}];

    // Check horizontal
    let left = col - 1;
    while (left >= 0 && grid[row][left].color === color) {
        matches.push({row, col: left});
        left--;
    }

    let right = col + 1;
    while (right < GRID_SIZE && grid[row][right].color === color) {
        matches.push({row, col: right});
        right++;
    }

    if (matches.length < 3) {
        // Check vertical
        matches.length = 1;
        let up = row - 1;
        while (up >= 0 && grid[up][col].color === color) {
            matches.push({row: up, col});
            up--;
        }

        let down = row + 1;
        while (down < GRID_SIZE && grid[down][col].color === color) {
            matches.push({row: down, col});
            down++;
        }
    }

    return matches.length >= 3 ? matches : [];
}

function checkAllMatches() {
    const allMatches = [];
    const processed = new Set();

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const key = `${row},${col}`;
            if (!processed.has(key)) {
                const matches = findMatches(row, col);
                if (matches.length >= 3) {
                    matches.forEach(m => {
                        allMatches.push(m);
                        processed.add(`${m.row},${m.col}`);
                    });
                }
            }
        }
    }

    return allMatches;
}

function removeMatches(matches) {
    if (matches.length === 0) return false;

    matchCount++;
    largestCombo = Math.max(largestCombo, matches.length);

    matches.forEach(m => {
        grid[m.row][m.col].matched = true;
    });

    const basePoints = matches.length * 10;
    const comboBonus = matches.length > 3 ? (matches.length - 3) * 20 : 0;
    score += basePoints + comboBonus;

    updateDisplay();

    setTimeout(() => {
        dropGems();
    }, 200);

    return true;
}

function dropGems() {
    let dropped = false;

    for (let col = 0; col < GRID_SIZE; col++) {
        let emptyRow = GRID_SIZE - 1;

        for (let row = GRID_SIZE - 1; row >= 0; row--) {
            if (!grid[row][col].matched) {
                if (row !== emptyRow) {
                    grid[emptyRow][col] = grid[row][col];
                    grid[row][col] = {
                        color: Math.floor(Math.random() * GEM_COLORS.length),
                        x: col * GEM_SIZE,
                        y: -GEM_SIZE,
                        falling: false,
                        matched: false
                    };
                    dropped = true;
                }
                emptyRow--;
            }
        }

        // Fill empty spaces at top
        while (emptyRow >= 0) {
            grid[emptyRow][col] = {
                color: Math.floor(Math.random() * GEM_COLORS.length),
                x: col * GEM_SIZE,
                y: -GEM_SIZE,
                falling: false,
                matched: false
            };
            emptyRow--;
            dropped = true;
        }
    }

    if (dropped) {
        setTimeout(() => {
            const matches = checkAllMatches();
            if (matches.length > 0) {
                removeMatches(matches);
            } else {
                animating = false;
            }
        }, 300);
    }
}

function swapGems(row1, col1, row2, col2) {
    const temp = grid[row1][col1];
    grid[row1][col1] = grid[row2][col2];
    grid[row2][col2] = temp;
}

function handleClick(x, y) {
    if (!gameRunning || paused || animating) return;

    const col = Math.floor(x / GEM_SIZE);
    const row = Math.floor(y / GEM_SIZE);

    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return;

    if (!selectedGem) {
        selectedGem = {row, col};
    } else {
        const rowDiff = Math.abs(selectedGem.row - row);
        const colDiff = Math.abs(selectedGem.col - col);

        if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
            animating = true;
            swapGems(selectedGem.row, selectedGem.col, row, col);

            const matches1 = findMatches(selectedGem.row, selectedGem.col);
            const matches2 = findMatches(row, col);

            if (matches1.length >= 3 || matches2.length >= 3) {
                moves--;
                updateDisplay();

                const allMatches = [...matches1, ...matches2];
                removeMatches(allMatches);

                if (moves <= 0) {
                    setTimeout(() => gameOver(), 1000);
                }
            } else {
                // Swap back
                swapGems(selectedGem.row, selectedGem.col, row, col);
                animating = false;
            }
        }

        selectedGem = null;
    }

    draw();
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleClick(x, y);
});

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('moves').textContent = moves;
    document.getElementById('target').textContent = target;
}

function gameOver() {
    gameRunning = false;

    const won = score >= target;
    document.getElementById('resultTitle').textContent = won ? '🎉 Level Complete!' : 'Game Over!';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalMatches').textContent = matchCount;
    document.getElementById('finalCombo').textContent = largestCombo;
    document.getElementById('gameOver').classList.remove('hidden');
}

function gameLoop() {
    if (gameRunning && !paused) {
        draw();
    }
    requestAnimationFrame(gameLoop);
}

document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        gameRunning = true;
        document.getElementById('instructions').classList.add('hidden');
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('hintBtn').disabled = false;

        score = 0;
        moves = 30;
        matchCount = 0;
        largestCombo = 3;

        initGrid();
        updateDisplay();
        gameLoop();
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
});

document.getElementById('restartBtn').addEventListener('click', () => {
    score = 0;
    moves = 30;
    matchCount = 0;
    largestCombo = 3;
    gameRunning = true;
    paused = false;
    animating = false;
    selectedGem = null;

    document.getElementById('gameOver').classList.add('hidden');
    initGrid();
    updateDisplay();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        paused = !paused;
        document.getElementById('pauseBtn').textContent = paused ? '▶️ Resume' : '⏸ Pause';
    }
});

updateDisplay();

