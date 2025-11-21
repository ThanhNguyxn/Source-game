const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;
nextCanvas.width = 80;
nextCanvas.height = 80;

const GRID_SIZE = 10;
const TILE_SIZE = canvas.width / GRID_SIZE;

// Pipe types: 0=empty, 1=straight, 2=corner, 3=T-junction, 4=cross, 5=start, 6=end
const PIPE_TYPES = {
    EMPTY: 0,
    STRAIGHT: 1,
    CORNER: 2,
    T_JUNCTION: 3,
    CROSS: 4,
    START: 5,
    END: 6
};

let gameRunning = false;
let score = 0;
let timeLeft = 60;
let grid = [];
let waterFlow = [];
let currentPipe = null;
let nextPipe = null;
let startPos = { x: 0, y: Math.floor(GRID_SIZE / 2) };
let endPos = { x: GRID_SIZE - 1, y: Math.floor(GRID_SIZE / 2) };
let flowTimer = null;
let gameTimer = null;

// Initialize grid
function initGrid() {
    grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        grid[y] = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            if (x === startPos.x && y === startPos.y) {
                grid[y][x] = { type: PIPE_TYPES.START, rotation: 0 };
            } else if (x === endPos.x && y === endPos.y) {
                grid[y][x] = { type: PIPE_TYPES.END, rotation: 0 };
            } else {
                grid[y][x] = { type: PIPE_TYPES.EMPTY, rotation: 0 };
            }
        }
    }

    waterFlow = [{ x: startPos.x, y: startPos.y }];
    generateNextPipe();
    currentPipe = nextPipe;
    generateNextPipe();
}

// Generate random pipe
function generateNextPipe() {
    const types = [PIPE_TYPES.STRAIGHT, PIPE_TYPES.CORNER, PIPE_TYPES.T_JUNCTION, PIPE_TYPES.CROSS];
    const weights = [40, 35, 15, 10];
    const random = Math.random() * 100;
    let sum = 0;

    for (let i = 0; i < types.length; i++) {
        sum += weights[i];
        if (random < sum) {
            nextPipe = { type: types[i], rotation: Math.floor(Math.random() * 4) };
            return;
        }
    }
}

// Draw pipe
function drawPipe(ctx, type, rotation, x, y, size, hasWater = false) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate((rotation * Math.PI) / 2);
    ctx.translate(-size / 2, -size / 2);

    ctx.strokeStyle = hasWater ? '#00aaff' : '#95a5a6';
    ctx.lineWidth = size / 4;
    ctx.lineCap = 'round';

    switch (type) {
        case PIPE_TYPES.START:
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(0, 0, size, size);
            ctx.strokeStyle = hasWater ? '#00aaff' : '#95a5a6';
            ctx.beginPath();
            ctx.moveTo(size / 2, size / 2);
            ctx.lineTo(size, size / 2);
            ctx.stroke();
            break;

        case PIPE_TYPES.END:
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(0, 0, size, size);
            ctx.strokeStyle = hasWater ? '#00aaff' : '#95a5a6';
            ctx.beginPath();
            ctx.moveTo(0, size / 2);
            ctx.lineTo(size / 2, size / 2);
            ctx.stroke();
            break;

        case PIPE_TYPES.STRAIGHT:
            ctx.beginPath();
            ctx.moveTo(0, size / 2);
            ctx.lineTo(size, size / 2);
            ctx.stroke();
            break;

        case PIPE_TYPES.CORNER:
            ctx.beginPath();
            ctx.arc(size, size, size / 2, Math.PI, Math.PI * 1.5);
            ctx.stroke();
            break;

        case PIPE_TYPES.T_JUNCTION:
            ctx.beginPath();
            ctx.moveTo(0, size / 2);
            ctx.lineTo(size, size / 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(size / 2, size / 2);
            ctx.lineTo(size / 2, size);
            ctx.stroke();
            break;

        case PIPE_TYPES.CROSS:
            ctx.beginPath();
            ctx.moveTo(0, size / 2);
            ctx.lineTo(size, size / 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(size / 2, size);
            ctx.stroke();
            break;
    }

    ctx.restore();
}

// Draw grid
function draw() {
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * TILE_SIZE, 0);
        ctx.lineTo(i * TILE_SIZE, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * TILE_SIZE);
        ctx.lineTo(canvas.width, i * TILE_SIZE);
        ctx.stroke();
    }

    // Draw pipes
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const pipe = grid[y][x];
            if (pipe.type !== PIPE_TYPES.EMPTY) {
                const hasWater = waterFlow.some(w => w.x === x && w.y === y);
                drawPipe(ctx, pipe.type, pipe.rotation, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, hasWater);
            }
        }
    }

    // Draw next pipe
    nextCtx.fillStyle = '#ecf0f1';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (nextPipe) {
        drawPipe(nextCtx, nextPipe.type, nextPipe.rotation, 10, 10, 60);
    }
}

// Check if pipe connects in direction
function connects(pipe, direction) {
    // direction: 0=right, 1=down, 2=left, 3=up
    const adjusted = (direction + pipe.rotation) % 4;

    switch (pipe.type) {
        case PIPE_TYPES.START:
            return adjusted === 0;
        case PIPE_TYPES.END:
            return adjusted === 2;
        case PIPE_TYPES.STRAIGHT:
            return adjusted === 0 || adjusted === 2;
        case PIPE_TYPES.CORNER:
            return adjusted === 0 || adjusted === 3;
        case PIPE_TYPES.T_JUNCTION:
            return adjusted !== 3;
        case PIPE_TYPES.CROSS:
            return true;
        default:
            return false;
    }
}

// Flow water
function flowWater() {
    if (!gameRunning) return;

    const lastFlow = waterFlow[waterFlow.length - 1];
    const pipe = grid[lastFlow.y][lastFlow.x];

    // Check all directions
    const directions = [
        { dx: 1, dy: 0, dir: 0, opposite: 2 },  // right
        { dx: 0, dy: 1, dir: 1, opposite: 3 },  // down
        { dx: -1, dy: 0, dir: 2, opposite: 0 }, // left
        { dx: 0, dy: -1, dir: 3, opposite: 1 }  // up
    ];

    for (const { dx, dy, dir, opposite } of directions) {
        if (!connects(pipe, dir)) continue;

        const newX = lastFlow.x + dx;
        const newY = lastFlow.y + dy;

        if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) continue;
        if (waterFlow.some(w => w.x === newX && w.y === newY)) continue;

        const nextPipe = grid[newY][newX];
        if (nextPipe.type === PIPE_TYPES.EMPTY || !connects(nextPipe, opposite)) {
            // Water leaked!
            endGame();
            return;
        }

        waterFlow.push({ x: newX, y: newY });
        score += 10;
        document.getElementById('score').textContent = score;

        // Check if reached end
        if (newX === endPos.x && newY === endPos.y) {
            score += 100;
            document.getElementById('score').textContent = score;
            clearInterval(flowTimer);
            setTimeout(() => {
                alert('Level Complete!');
                initLevel();
                startFlow();
            }, 500);
            return;
        }

        draw();
        return;
    }

    // No valid connection found
    endGame();
}

// Click handler
canvas.addEventListener('click', (e) => {
    if (!gameRunning || !currentPipe) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) * canvas.width / rect.width) / TILE_SIZE);
    const y = Math.floor(((e.clientY - rect.top) * canvas.height / rect.height) / TILE_SIZE);

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        const pipe = grid[y][x];

        if (pipe.type === PIPE_TYPES.EMPTY) {
            // Place new pipe
            grid[y][x] = { ...currentPipe };
            currentPipe = nextPipe;
            generateNextPipe();
            draw();
        } else if (pipe.type !== PIPE_TYPES.START && pipe.type !== PIPE_TYPES.END) {
            // Rotate existing pipe
            pipe.rotation = (pipe.rotation + 1) % 4;
            draw();
        }
    }
});

// Right click to rotate counter-clockwise
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (!gameRunning) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) * canvas.width / rect.width) / TILE_SIZE);
    const y = Math.floor(((e.clientY - rect.top) * canvas.height / rect.height) / TILE_SIZE);

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        const pipe = grid[y][x];
        if (pipe.type !== PIPE_TYPES.START && pipe.type !== PIPE_TYPES.END && pipe.type !== PIPE_TYPES.EMPTY) {
            pipe.rotation = (pipe.rotation + 3) % 4;
            draw();
        }
    }
});

// Start flow
function startFlow() {
    flowTimer = setInterval(flowWater, 500);
}

// Init level
function initLevel() {
    initGrid();
    draw();
}

// Start game
function startGame() {
// Start game
function startGame() {
    gameRunning = true;
    score = 0;
    timeLeft = 60;
    document.getElementById('score').textContent = score;
    document.getElementById('time').textContent = timeLeft;
    document.getElementById('instructions').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    document.querySelector('.next-pipe').style.display = 'block';
    canvas.style.display = 'block'; // Show canvas

    initLevel();

    // Start flow after delay
    setTimeout(startFlow, 3000);

    // Timer
    gameTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('time').textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// End game
function endGame() {
    gameRunning = false;
    clearInterval(flowTimer);
    clearInterval(gameTimer);
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

// Prevent scrolling
document.addEventListener('keydown', (e) => {
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
});

// Initial draw
draw();

