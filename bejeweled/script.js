const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 480;
canvas.height = 480;

const GRID_SIZE = 8;
const GEM_SIZE = 60;
const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

let gameRunning = false;
let score = 0;
let moves = 30;
let grid = [];
let selectedGem = null;
let isAnimating = false;

// DOM elements
const scoreElement = document.getElementById('score');
const movesElement = document.getElementById('moves');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const instructions = document.getElementById('instructions');
const gameOverDiv = document.getElementById('gameOver');

// Initialize grid - ensure no initial matches
function initGrid() {
    grid = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        grid[row] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            let color;
            let attempts = 0;
            do {
                color = COLORS[Math.floor(Math.random() * COLORS.length)];
                attempts++;
                if (attempts > 50) break; // Prevent infinite loop
            } while (wouldCreateMatch(row, col, color));

            grid[row][col] = color;
        }
    }
}

// Check if placing this color would create a match
function wouldCreateMatch(row, col, color) {
    // Check horizontal (left 2)
    if (col >= 2 && grid[row][col-1] === color && grid[row][col-2] === color) {
        return true;
    }
    // Check vertical (up 2)
    if (row >= 2 && grid[row-1][col] === color && grid[row-2][col] === color) {
        return true;
    }
    return false;
}

// Draw the game board
function draw() {
    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const x = col * GEM_SIZE;
            const y = row * GEM_SIZE;
            const color = grid[row][col];

            // Draw gem circle
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x + GEM_SIZE/2, y + GEM_SIZE/2, GEM_SIZE/2 - 5, 0, Math.PI * 2);
            ctx.fill();

            // Draw shine effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(x + GEM_SIZE/2 - 8, y + GEM_SIZE/2 - 8, GEM_SIZE/5, 0, Math.PI * 2);
            ctx.fill();

            // Highlight selected gem
            if (selectedGem && selectedGem.row === row && selectedGem.col === col) {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(x + GEM_SIZE/2, y + GEM_SIZE/2, GEM_SIZE/2 - 2, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }
}

// Find all matches on the board
function findMatches() {
    const matches = new Set();

    // Find horizontal matches
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE - 2; col++) {
            const color = grid[row][col];
            if (color && grid[row][col+1] === color && grid[row][col+2] === color) {
                // Found a match, add all connected gems
                let endCol = col + 2;
                while (endCol + 1 < GRID_SIZE && grid[row][endCol + 1] === color) {
                    endCol++;
                }
                // Add all gems in this match
                for (let c = col; c <= endCol; c++) {
                    matches.add(`${row},${c}`);
                }
            }
        }
    }

    // Find vertical matches
    for (let col = 0; col < GRID_SIZE; col++) {
        for (let row = 0; row < GRID_SIZE - 2; row++) {
            const color = grid[row][col];
            if (color && grid[row+1][col] === color && grid[row+2][col] === color) {
                // Found a match, add all connected gems
                let endRow = row + 2;
                while (endRow + 1 < GRID_SIZE && grid[endRow + 1][col] === color) {
                    endRow++;
                }
                // Add all gems in this match
                for (let r = row; r <= endRow; r++) {
                    matches.add(`${r},${col}`);
                }
            }
        }
    }

    return matches;
}

// Remove matched gems
function removeMatches(matches) {
    matches.forEach(key => {
        const [row, col] = key.split(',').map(Number);
        grid[row][col] = null;
    });

    // Update score
    score += matches.size * 10;
    scoreElement.textContent = score;
}

// Apply gravity - make gems fall down
function applyGravity() {
    for (let col = 0; col < GRID_SIZE; col++) {
        // Collect all non-null gems in this column from bottom to top
        const gems = [];
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
            if (grid[row][col] !== null) {
                gems.push(grid[row][col]);
            }
        }

        // Place gems from bottom, fill top with null
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
            if (gems.length > 0) {
                grid[row][col] = gems.shift();
            } else {
                grid[row][col] = null;
            }
        }
    }
}

// Fill empty spaces with new random gems
function fillEmpty() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] === null) {
                grid[row][col] = COLORS[Math.floor(Math.random() * COLORS.length)];
            }
        }
    }
}

// Sleep utility
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Process matches with cascading
async function processMatches() {
    isAnimating = true;

    while (true) {
        const matches = findMatches();
        if (matches.size === 0) break;

        // Remove matches
        removeMatches(matches);
        draw();
        await sleep(300);

        // Apply gravity
        applyGravity();
        draw();
        await sleep(300);

        // Fill empty spaces
        fillEmpty();
        draw();
        await sleep(300);
    }

    isAnimating = false;

    // Check game over
    if (moves <= 0) {
        endGame();
    }
}

// Swap two gems in grid
function swapGems(row1, col1, row2, col2) {
    const temp = grid[row1][col1];
    grid[row1][col1] = grid[row2][col2];
    grid[row2][col2] = temp;
}

// Handle canvas click
canvas.addEventListener('click', async (e) => {
    if (!gameRunning || isAnimating) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const col = Math.floor(x / GEM_SIZE);
    const row = Math.floor(y / GEM_SIZE);

    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return;

    if (!selectedGem) {
        // Select first gem
        selectedGem = { row, col };
        draw();
    } else {
        // Check if second click is adjacent to first
        const rowDiff = Math.abs(selectedGem.row - row);
        const colDiff = Math.abs(selectedGem.col - col);

        if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
            // Valid swap - try it
            swapGems(selectedGem.row, selectedGem.col, row, col);
            draw();

            await sleep(200);

            // Check for matches
            const matches = findMatches();
            if (matches.size > 0) {
                // Valid move!
                moves--;
                movesElement.textContent = moves;
                selectedGem = null;
                await processMatches();
            } else {
                // No matches - swap back
                swapGems(selectedGem.row, selectedGem.col, row, col);
                selectedGem = null;
                draw();
            }
        } else {
            // Not adjacent - select new gem
            selectedGem = { row, col };
            draw();
        }
    }
});

// Start game
function startGame() {
    gameRunning = true;
    score = 0;
    moves = 30;
    selectedGem = null;
    isAnimating = false;

    scoreElement.textContent = score;
    movesElement.textContent = moves;
    instructions.classList.add('hidden');
    gameOverDiv.classList.add('hidden');
    canvas.style.display = 'block';

    initGrid();
    draw();
}

// End game
function endGame() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    gameOverDiv.classList.remove('hidden');
}

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Prevent arrow key scrolling
document.addEventListener('keydown', (e) => {
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
});

