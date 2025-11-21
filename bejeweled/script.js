const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 480;
canvas.height = 480;

const GRID_SIZE = 8;
const GEM_SIZE = 60;
const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
const PADDING = 0;

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

// Initialize grid
function initGrid() {
    grid = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        grid[row] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            let color;
            do {
                color = COLORS[Math.floor(Math.random() * COLORS.length)];
            } while (wouldMatch(row, col, color));
            grid[row][col] = { color, row, col };
        }
    }
}

// Check if placing a gem would create a match
function wouldMatch(row, col, color) {
    // Check horizontal
    if (col >= 2 && grid[row][col-1]?.color === color && grid[row][col-2]?.color === color) {
        return true;
    }
    // Check vertical
    if (row >= 2 && grid[row-1][col]?.color === color && grid[row-2][col]?.color === color) {
        return true;
    }
    return false;
}

// Draw grid
function draw() {
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const gem = grid[row][col];
            const x = col * GEM_SIZE + PADDING;
            const y = row * GEM_SIZE + PADDING;

            // Draw gem
            ctx.fillStyle = gem.color;
            ctx.beginPath();
            ctx.arc(x + GEM_SIZE/2, y + GEM_SIZE/2, GEM_SIZE/2 - 5, 0, Math.PI * 2);
            ctx.fill();

            // Draw shine
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(x + GEM_SIZE/2 - 10, y + GEM_SIZE/2 - 10, GEM_SIZE/4, 0, Math.PI * 2);
            ctx.fill();

            // Highlight selected gem
            if (selectedGem && selectedGem.row === row && selectedGem.col === col) {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(x + GEM_SIZE/2, y + GEM_SIZE/2, GEM_SIZE/2 - 3, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }
}

// Check for matches
function findMatches() {
    const matches = [];

    // Check horizontal matches
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE - 2; col++) {
            const color = grid[row][col].color;
            if (grid[row][col+1].color === color && grid[row][col+2].color === color) {
                const match = [grid[row][col], grid[row][col+1], grid[row][col+2]];
                let c = col + 3;
                while (c < GRID_SIZE && grid[row][c].color === color) {
                    match.push(grid[row][c]);
                    c++;
                }
                matches.push(match);
                col = c - 1;
            }
        }
    }

    // Check vertical matches
    for (let col = 0; col < GRID_SIZE; col++) {
        for (let row = 0; row < GRID_SIZE - 2; row++) {
            const color = grid[row][col].color;
            if (grid[row+1][col].color === color && grid[row+2][col].color === color) {
                const match = [grid[row][col], grid[row+1][col], grid[row+2][col]];
                let r = row + 3;
                while (r < GRID_SIZE && grid[r][col].color === color) {
                    match.push(grid[r][col]);
                    r++;
                }
                matches.push(match);
                row = r - 1;
            }
        }
    }

    return matches;
}

// Remove matches and update score
function removeMatches(matches) {
    const removed = new Set();
    matches.forEach(match => {
        match.forEach(gem => {
            removed.add(`${gem.row},${gem.col}`);
        });
    });

    removed.forEach(key => {
        const [row, col] = key.split(',').map(Number);
        grid[row][col] = null;
    });

    score += removed.size * 10;
    scoreElement.textContent = score;
    return removed.size > 0;
}

// Apply gravity
function applyGravity() {
    for (let col = 0; col < GRID_SIZE; col++) {
        let emptyRow = GRID_SIZE - 1;
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
            if (grid[row][col] !== null) {
                if (row !== emptyRow) {
                    grid[emptyRow][col] = grid[row][col];
                    grid[emptyRow][col].row = emptyRow;
                    grid[row][col] = null;
                }
                emptyRow--;
            }
        }
    }
}

// Fill empty spaces
function fillEmpty() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] === null) {
                const color = COLORS[Math.floor(Math.random() * COLORS.length)];
                grid[row][col] = { color, row, col };
            }
        }
    }
}

// Process all matches with cascading
async function processMatches() {
    isAnimating = true;
    let hasMatches = true;

    while (hasMatches) {
        const matches = findMatches();
        if (matches.length === 0) {
            hasMatches = false;
            break;
        }

        removeMatches(matches);
        draw();
        await sleep(300);

        applyGravity();
        draw();
        await sleep(300);

        fillEmpty();
        draw();
        await sleep(300);
    }

    isAnimating = false;

    // Check for game over
    if (moves <= 0 || !hasPossibleMoves()) {
        endGame();
    }
}

// Check if there are any possible moves
function hasPossibleMoves() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE - 1; col++) {
            // Try swapping with right neighbor
            swap(grid[row][col], grid[row][col+1]);
            if (findMatches().length > 0) {
                swap(grid[row][col], grid[row][col+1]); // Swap back
                return true;
            }
            swap(grid[row][col], grid[row][col+1]); // Swap back
        }
    }

    for (let row = 0; row < GRID_SIZE - 1; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            // Try swapping with bottom neighbor
            swap(grid[row][col], grid[row+1][col]);
            if (findMatches().length > 0) {
                swap(grid[row][col], grid[row+1][col]); // Swap back
                return true;
            }
            swap(grid[row][col], grid[row+1][col]); // Swap back
        }
    }

    return false;
}

// Swap two gems
function swap(gem1, gem2) {
    const tempColor = gem1.color;
    gem1.color = gem2.color;
    gem2.color = tempColor;
}

// Sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Handle canvas click
canvas.addEventListener('click', (e) => {
    if (!gameRunning || isAnimating) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const col = Math.floor(x / GEM_SIZE);
    const row = Math.floor(y / GEM_SIZE);

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        const clickedGem = grid[row][col];

        if (!selectedGem) {
            selectedGem = clickedGem;
            draw();
        } else {
            // Check if gems are adjacent
            const rowDiff = Math.abs(selectedGem.row - clickedGem.row);
            const colDiff = Math.abs(selectedGem.col - clickedGem.col);

            if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
                // Swap gems
                swap(selectedGem, clickedGem);
                draw();

                // Check for matches
                setTimeout(async () => {
                    const matches = findMatches();
                    if (matches.length > 0) {
                        moves--;
                        movesElement.textContent = moves;
                        await processMatches();
                    } else {
                        // Swap back if no matches
                        swap(selectedGem, clickedGem);
                        draw();
                    }
                    selectedGem = null;
                }, 100);
            } else {
                selectedGem = clickedGem;
                draw();
            }
        }
    }
});

// Start game
function startGame() {
    gameRunning = true;
    score = 0;
    moves = 30;
    scoreElement.textContent = score;
    movesElement.textContent = moves;
    instructions.classList.add('hidden');
    gameOverDiv.classList.add('hidden');
    canvas.style.display = 'block'; // Show canvas

    initGrid();
    draw();

    // Remove initial matches
    processMatches();
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

// Initial draw
draw();

